import {
  MAX_RIPPLES,
  RENDER_SHADER,
  SIM_SIZE,
  SIMULATION_SHADER,
  VERTEX_SHADER,
} from "./glsl";

/**
 * The nine tuned parameters the reference exposes as Framer props.
 * Defaults reproduce the feel of the original hero.
 */
export interface RippleUniforms {
  trailRadius: number;
  centerFade: number;
  trailSoftness: number;
  trailStrength: number;
  trailDecay: number;
  trailDisplacement: number;
  dispersion: number;
  clickRipple: number;
  clickSpeed: number;
}

/**
 * Ceiling on pointer speed in normalised units per second, applied before the
 * value reaches the shader. Deliberate movement across the hero runs about
 * 1–3 units/s; a flick can momentarily exceed 20, which is what produced the
 * runaway displacement this constant exists to prevent.
 */
const MAX_POINTER_SPEED = 3;

export const DEFAULT_UNIFORMS: RippleUniforms = {
  trailRadius: 0.08,
  centerFade: 0.25,
  trailSoftness: 0.8,
  /* Velocity→energy gain, used as clamp(speed * trailStrength, 0, 1).
     
     1.6 saturated at 0.625 units/s, which sounded right against a still-frame
     measurement of the reference but was wrong in motion: any real mouse movement
     exceeds that, so EVERY frame injected maximum energy into a wave field that
     accumulates, and the sculpture tore apart (measured worst-case departure from
     rest: 2.21 MAD). 0.32 saturates at ~3.1 units/s, above deliberate movement and
     below a flick, so the response stays graded instead of pinned. */
  trailStrength: 0.12,
  trailDecay: 0.5,
  /* Displacement and dispersion are the two that read as "too much" fastest.
     The reference is restrained — a liquid nudge, not a heat haze — so these
     stay low; raising trailDisplacement past ~0.2 starts to tear the subject
     and makes the chromatic fringing look like an artefact. */
  trailDisplacement: 0.04,
  dispersion: 0.08,
  clickRipple: 0.06,
  clickSpeed: 0.3,
};

interface Ripple {
  x: number;
  y: number;
  age: number;
  strength: number;
}

/** How long a click ripple lives, in seconds. */
const RIPPLE_LIFETIME = 2.2;
/** Pointer hover/press are eased rather than switched, matching the original's spring feel. */
const EASE_RATE = 8;

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Could not create shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compile failed: ${log}`);
  }
  return shader;
}

function link(gl: WebGL2RenderingContext, vertex: string, fragment: string) {
  const program = gl.createProgram();
  if (!program) throw new Error("Could not create program");
  const vs = compile(gl, gl.VERTEX_SHADER, vertex);
  const fs = compile(gl, gl.FRAGMENT_SHADER, fragment);
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`Program link failed: ${log}`);
  }
  return program;
}

/**
 * Resolve uniform locations once, into an object keyed by the exact names given.
 *
 * Typed against the literal names rather than `Record<string, …>` so a typo at a
 * call site is a compile error instead of a silent no-op — `gl.uniform1f` accepts
 * `null` and does nothing, which is a genuinely nasty way to lose an hour.
 */
type Locations<N extends readonly string[]> = {
  [K in N[number]]: WebGLUniformLocation | null;
};

function locations<const N extends readonly string[]>(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  names: N,
): Locations<N> {
  const map = {} as Locations<N>;
  for (const name of names) {
    map[name as N[number]] = gl.getUniformLocation(program, name);
  }
  return map;
}

/** Uniform names per program. Declared once so the resolved location objects are
 *  typed against these exact keys. */
const SIM_UNIFORMS = [
  "u_previous", "u_simSize", "u_pointer", "u_pointerHover", "u_pointerDown",
  "u_frameScale", "u_trailRadius", "u_centerFade", "u_trailSoftness",
  "u_trailStrength", "u_trailDecay", "u_ripples", "u_clickRipple",
  "u_clickSpeed", "u_aspect",
] as const;

const RENDER_UNIFORMS = [
  "u_texture", "u_simulation", "u_resolution", "u_textureSize",
  "u_simSize", "u_trailDisplacement", "u_dispersion",
] as const;

/**
 * Framework-agnostic WebGL2 renderer for the hero ripple effect.
 *
 * Deliberately contains no React: it owns a canvas, a texture and two programs,
 * and exposes start/stop/resize/dispose. That keeps it testable and means the
 * React layer stays a thin wrapper.
 */
export class RippleRenderer {
  private gl: WebGL2RenderingContext;
  private simProgram: WebGLProgram;
  private renderProgram: WebGLProgram;
  private simLoc: Locations<typeof SIM_UNIFORMS>;
  private renderLoc: Locations<typeof RENDER_UNIFORMS>;

  private textures: [WebGLTexture, WebGLTexture];
  private framebuffers: [WebGLFramebuffer, WebGLFramebuffer];
  /** Ping-pong index. Typed as a literal union so indexing the 2-tuples above
   *  is provably in-bounds rather than possibly-undefined. */
  private current: 0 | 1 = 0;

  private photo: WebGLTexture | null = null;
  private photoSize: [number, number] = [1, 1];

  private vao: WebGLVertexArrayObject | null;

  private pointer = { x: 0.5, y: 0.5, vx: 0, vy: 0, hover: 0, down: 0 };
  /** Displacement accumulated since the last frame, converted to a rate in frame(). */
  private pointerMove = { dx: 0, dy: 0 };
  private targetHover = 0;
  private targetDown = 0;
  private ripples: Ripple[] = [];
  private rippleBuffer = new Float32Array(MAX_RIPPLES * 4);

  private raf = 0;
  private lastTime = 0;
  private running = false;

  uniforms: RippleUniforms;

  constructor(
    private canvas: HTMLCanvasElement,
    uniforms: Partial<RippleUniforms> = {},
  ) {
    const gl = canvas.getContext("webgl2", {
      antialias: false,
      alpha: true,
      premultipliedAlpha: false,
      powerPreference: "high-performance",
    });

    if (!gl) throw new Error("WebGL2 is not available");
    this.gl = gl;
    this.uniforms = { ...DEFAULT_UNIFORMS, ...uniforms };

    // Rendering into a float texture needs this extension. Without it the
    // simulation cannot hold negative wave amplitudes and the effect degrades
    // badly, so the caller should fall back to a plain <img>.
    if (!gl.getExtension("EXT_color_buffer_float")) {
      throw new Error("EXT_color_buffer_float unsupported");
    }

    this.simProgram = link(gl, VERTEX_SHADER, SIMULATION_SHADER);
    this.renderProgram = link(gl, VERTEX_SHADER, RENDER_SHADER);

    this.simLoc = locations(gl, this.simProgram, SIM_UNIFORMS);
    this.renderLoc = locations(gl, this.renderProgram, RENDER_UNIFORMS);

    // The fullscreen triangle is generated from gl_VertexID, but WebGL2 still
    // requires a bound VAO to draw.
    this.vao = gl.createVertexArray();

    const [t0, f0] = this.createTarget();
    const [t1, f1] = this.createTarget();
    this.textures = [t0, t1];
    this.framebuffers = [f0, f1];
  }

  /** A half-float ping-pong target at the fixed simulation resolution. */
  private createTarget(): [WebGLTexture, WebGLFramebuffer] {
    const gl = this.gl;
    const texture = gl.createTexture();
    const framebuffer = gl.createFramebuffer();
    if (!texture || !framebuffer) throw new Error("Could not allocate simulation target");

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, SIM_SIZE, SIM_SIZE, 0, gl.RGBA, gl.HALF_FLOAT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    return [texture, framebuffer];
  }

  /** Upload the photograph. Safe to call again to swap crops on orientation change. */
  setImage(image: HTMLImageElement) {
    const gl = this.gl;
    if (!this.photo) this.photo = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.photo);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    this.photoSize = [image.naturalWidth, image.naturalHeight];
  }

  resize(width: number, height: number, dpr = 1) {
    // Cap DPR: the simulation is resolution-independent, so a 3x buffer costs
    // fill rate for no visual gain.
    const scale = Math.min(dpr, 2);
    const w = Math.max(1, Math.round(width * scale));
    const h = Math.max(1, Math.round(height * scale));
    // Assigning canvas.width/height reallocates and CLEARS the drawing buffer
    // even when the value is unchanged. ResizeObserver fires on any layout
    // change, so without this guard an unrelated reflow blanks a frame.
    if (w === this.canvas.width && h === this.canvas.height) return;
    this.canvas.width = w;
    this.canvas.height = h;
  }

  /** Pointer position in normalised canvas coordinates, origin bottom-left. */
  setPointer(x: number, y: number) {
    // Accumulate rather than overwrite. Pointer events fire independently of the
    // render loop, so several can land between two frames; overwriting kept only
    // the last one and silently discarded the rest of the movement.
    this.pointerMove.dx += x - this.pointer.x;
    this.pointerMove.dy += y - this.pointer.y;
    this.pointer.x = x;
    this.pointer.y = y;
  }

  /**
   * Place the pointer without generating velocity.
   *
   * The pointer starts at the centre (0.5, 0.5). Without this, the first
   * pointermove after entering anywhere else reads as one enormous displacement
   * and stamps a burst of energy across the surface — a visible splash the
   * instant the cursor arrives. Seed on enter instead.
   */
  seedPointer(x: number, y: number) {
    this.pointer.x = x;
    this.pointer.y = y;
    this.pointer.vx = 0;
    this.pointer.vy = 0;
    this.pointerMove.dx = 0;
    this.pointerMove.dy = 0;
  }

  setHover(hovering: boolean) {
    this.targetHover = hovering ? 1 : 0;
  }

  setPressed(pressed: boolean) {
    this.targetDown = pressed ? 1 : 0;
  }

  addRipple(x: number, y: number, strength = 1) {
    if (this.ripples.length >= MAX_RIPPLES) this.ripples.shift();
    this.ripples.push({ x, y, age: 0, strength });
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    const loop = (now: number) => {
      if (!this.running) return;
      const dt = Math.min((now - this.lastTime) / 1000, 1 / 20);
      this.lastTime = now;
      this.frame(dt);
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  /** Draw exactly one frame — used for the reduced-motion path. */
  renderStatic() {
    this.frame(0);
  }

  private frame(dt: number) {
    const gl = this.gl;
    // Drawing into a lost context raises errors on every call; the component
    // swaps to the poster image and rebuilds when the context is restored.
    if (!this.photo || gl.isContextLost()) return;

    // Normalise physics to 60fps so behaviour matches on any refresh rate.
    const frameScale = dt > 0 ? Math.min(dt * 60, 3) : 0;

    // Pointer velocity is a RATE — normalised units per SECOND — not the raw
    // per-event displacement this used to send. A displacement is meaningless on
    // its own: the same physical gesture reports a different number depending on
    // how often pointer events happen to fire. Measured against the reference, the
    // old value tracked the event interval exactly (0.0758 over a 16.7ms frame,
    // 0.0506 over a 30ms frame) instead of the ~4.5 and ~1.69 the reference
    // reported for those same gestures.
    if (dt > 0) {
      // Hard ceiling on the rate. Without it a fast flick — or a single frame
      // with a very small dt — divides a large displacement by ~nothing and
      // produces an unbounded spike that the shader clamp cannot undo, because
      // the energy is already in the height field by then.
      const vx = this.pointerMove.dx / dt;
      const vy = this.pointerMove.dy / dt;
      const speed = Math.hypot(vx, vy);
      const limit = speed > MAX_POINTER_SPEED ? MAX_POINTER_SPEED / speed : 1;
      this.pointer.vx = vx * limit;
      this.pointer.vy = vy * limit;
    } else {
      this.pointer.vx = 0;
      this.pointer.vy = 0;
    }
    this.pointerMove.dx = 0;
    this.pointerMove.dy = 0;

    // Ease hover/press rather than switching, matching the original's spring input.
    const k = 1 - Math.exp(-EASE_RATE * dt);
    this.pointer.hover += (this.targetHover - this.pointer.hover) * k;
    this.pointer.down += (this.targetDown - this.pointer.down) * k;

    // Age ripples and pack them for the GPU.
    this.rippleBuffer.fill(0);
    this.ripples = this.ripples.filter((r) => {
      r.age += dt;
      return r.age < RIPPLE_LIFETIME;
    });
    this.ripples.forEach((r, i) => {
      const fade = 1 - r.age / RIPPLE_LIFETIME;
      this.rippleBuffer.set([r.x, r.y, r.age, r.strength * fade * fade], i * 4);
    });

    gl.bindVertexArray(this.vao);

    // --- pass 1: advance the height field ---------------------------------
    // Written as a conditional rather than `1 - current` so TypeScript keeps the
    // 0|1 literal type and the tuple lookups stay provably in-bounds.
    const next = this.current === 0 ? 1 : 0;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffers[next]);
    gl.viewport(0, 0, SIM_SIZE, SIM_SIZE);
    gl.useProgram(this.simProgram);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.textures[this.current]);
    gl.uniform1i(this.simLoc.u_previous, 0);

    gl.uniform2f(this.simLoc.u_simSize, SIM_SIZE, SIM_SIZE);
    gl.uniform4f(this.simLoc.u_pointer, this.pointer.x, this.pointer.y, this.pointer.vx, this.pointer.vy);
    gl.uniform1f(this.simLoc.u_pointerHover, this.pointer.hover);
    gl.uniform1f(this.simLoc.u_pointerDown, this.pointer.down);
    gl.uniform1f(this.simLoc.u_frameScale, frameScale);
    gl.uniform1f(this.simLoc.u_trailRadius, this.uniforms.trailRadius);
    gl.uniform1f(this.simLoc.u_centerFade, this.uniforms.centerFade);
    gl.uniform1f(this.simLoc.u_trailSoftness, this.uniforms.trailSoftness);
    gl.uniform1f(this.simLoc.u_trailStrength, this.uniforms.trailStrength);
    gl.uniform1f(this.simLoc.u_trailDecay, this.uniforms.trailDecay);
    gl.uniform1f(this.simLoc.u_clickRipple, this.uniforms.clickRipple);
    gl.uniform1f(this.simLoc.u_clickSpeed, this.uniforms.clickSpeed);
    gl.uniform1f(this.simLoc.u_aspect, this.canvas.width / this.canvas.height);
    gl.uniform4fv(this.simLoc.u_ripples, this.rippleBuffer);

    gl.drawArrays(gl.TRIANGLES, 0, 3);

    this.current = next;

    // --- pass 2: refract the photograph -----------------------------------
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.useProgram(this.renderProgram);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.photo);
    gl.uniform1i(this.renderLoc.u_texture, 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.textures[this.current]);
    gl.uniform1i(this.renderLoc.u_simulation, 1);

    gl.uniform2f(this.renderLoc.u_resolution, this.canvas.width, this.canvas.height);
    gl.uniform2f(this.renderLoc.u_textureSize, this.photoSize[0], this.photoSize[1]);
    gl.uniform2f(this.renderLoc.u_simSize, SIM_SIZE, SIM_SIZE);
    gl.uniform1f(this.renderLoc.u_trailDisplacement, this.uniforms.trailDisplacement);
    gl.uniform1f(this.renderLoc.u_dispersion, this.uniforms.dispersion);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindVertexArray(null);
  }

  /** True once the driver has taken the context away (tab backgrounded on some
   *  GPUs, driver reset, too many live contexts). Callers should show the
   *  poster image instead of a frozen canvas. */
  get contextLost() {
    return this.gl.isContextLost();
  }

  dispose() {
    this.stop();
    const gl = this.gl;
    // Every delete* call is a no-op on a lost context, and loseContext() would
    // throw. Skip straight out — the driver has already reclaimed everything.
    if (gl.isContextLost()) return;

    this.textures.forEach((t) => gl.deleteTexture(t));
    this.framebuffers.forEach((f) => gl.deleteFramebuffer(f));
    if (this.photo) gl.deleteTexture(this.photo);
    if (this.vao) gl.deleteVertexArray(this.vao);
    gl.deleteProgram(this.simProgram);
    gl.deleteProgram(this.renderProgram);

    /*
     * Deliberately NOT calling WEBGL_lose_context.loseContext() here.
     *
     * It looks like good hygiene — free the GPU allocation now rather than at
     * GC — but it permanently poisons the *canvas element*: once a context is
     * lost, getContext('webgl2') keeps handing back that same lost context
     * until something calls restoreContext(). The canvas is owned by React and
     * reused across remounts, so the next mount would get the dead context,
     * fail getExtension('EXT_color_buffer_float') (null on a lost context),
     * throw from the constructor, and silently fall back to the poster image.
     *
     * That is exactly what happened: React StrictMode double-invokes effects in
     * development, so mount → cleanup → mount killed the hero on every load —
     * canvas context lost, opacity 0, poster showing. It would also have fired
     * in production on any remount from a route transition.
     *
     * The explicit delete* calls above release everything that actually holds
     * significant GPU memory. The context itself is reclaimed when the canvas
     * is collected, and re-mounting simply reuses it.
     */
  }
}
