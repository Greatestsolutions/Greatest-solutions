/**
 * Ripple shader sources — REBUILD-SPEC §14.
 *
 * Rebuilt from the architecture traced out of the reference build (see
 * HERO-SECTION.md §2), NOT copied: Framer's GLSL lives in a remote minified
 * bundle we do not own.
 *
 * Provenance is marked per block:
 *   [TRACED]      the exact expression recovered from the reference
 *   [RECONSTRUCTED] our implementation of a behaviour we observed but whose
 *                   source we could not read
 *
 * Two deliberate departures from the reference, both for maintainability, as
 * `prompt.txt` permits ("never sacrifice maintainability for cleverness"):
 *
 *   1. Click ripples are tracked in JS and passed as a uniform array. The
 *      reference packs them into a 9-texel GPU state buffer with leading-edge
 *      detection and a 50ms debounce — a lot of machinery to work around not
 *      having CPU-side state. We have CPU-side state.
 *   2. The simulation runs at a fixed grid size, independent of canvas size, so
 *      the physics feel identical on a phone and a 4K monitor.
 */

export const MAX_RIPPLES = 8;

/** Fixed simulation grid. The reference uses an 800-unit grid; matching it keeps
 *  wave speed and decay feeling the same as the original. */
export const SIM_SIZE = 800;

/** Displacement is authored against this notional resolution so that the
 *  refraction strength does not change with viewport size. */
const REFERENCE_SIZE = 1000.0;

/**
 * Fullscreen triangle generated from gl_VertexID — no vertex buffers, no
 * attribute plumbing. Shared by both passes.
 */
export const VERTEX_SHADER = /* glsl */ `#version 300 es
precision highp float;

out vec2 v_uv;

void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  v_uv = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}
`;

/**
 * PASS 1 — height field.
 *
 * A 2D wave equation over a ping-pong buffer: .r is the current height, .g the
 * previous frame's. Pointer energy is injected scaled by VELOCITY, not position,
 * which is why the surface only ripples while the cursor is moving and ripples
 * harder when it moves fast.
 */
export const SIMULATION_SHADER = /* glsl */ `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

uniform sampler2D u_previous;
uniform vec2  u_simSize;
uniform vec4  u_pointer;        // xy = uv position, zw = velocity
uniform float u_pointerHover;   // 0..1, eased
uniform float u_pointerDown;    // 0..1, eased
uniform float u_frameScale;     // dt normalised to 60fps, so physics are framerate-independent

uniform float u_trailRadius;
uniform float u_centerFade;
uniform float u_trailSoftness;
uniform float u_trailStrength;
uniform float u_trailDecay;

uniform vec4  u_ripples[${MAX_RIPPLES}];  // xy = origin, z = age (s), w = strength
uniform float u_clickRipple;
uniform float u_clickSpeed;
uniform float u_aspect;

void main() {
  vec2 texel = 1.0 / u_simSize;
  vec2 uv = v_uv;

  vec4 state    = texture(u_previous, uv);
  float previous = state.g;

  float left  = texture(u_previous, uv - vec2(texel.x, 0.0)).r;
  float right = texture(u_previous, uv + vec2(texel.x, 0.0)).r;
  float down  = texture(u_previous, uv - vec2(0.0, texel.y)).r;
  float up    = texture(u_previous, uv + vec2(0.0, texel.y)).r;

  // [TRACED] the reference's exact integration step
  float neighborAverage = (left + right + down + up) * 0.25;
  float decay = pow(mix(0.95, 0.99, u_trailDecay), u_frameScale);
  float next  = (neighborAverage * 2.0 - previous) * decay;

  // --- pointer trail -------------------------------------------------------
  vec2 aspect = vec2(u_aspect, 1.0);
  float distance = length((uv - u_pointer.xy) * aspect);

  // [RECONSTRUCTED] soft-edged disc; softness widens the falloff band
  float inner = u_trailRadius * (1.0 - clamp(u_trailSoftness, 0.0, 0.99));
  float stamp = 1.0 - smoothstep(inner, u_trailRadius, distance);

  // [RECONSTRUCTED] hollow the very centre so a stationary pointer cannot
  // accumulate a singular spike
  float centerFade = smoothstep(0.0, max(u_centerFade, 1e-4) * u_trailRadius, distance);

  // [TRACED] energy scales with pointer SPEED, and holding the button multiplies by 2.5
  float speed       = length(u_pointer.zw);
  float speedAmount = clamp(speed * u_trailStrength, 0.0, 1.0);
  float pressAmount = 1.0 + u_pointerDown * 1.5;

  next += stamp * centerFade * u_pointerHover * speedAmount * pressAmount
        * min(u_frameScale, 3.0);

  // --- click ripples -------------------------------------------------------
  // [RECONSTRUCTED] expanding ring: cosine carrier inside a gaussian envelope,
  // faded out over the ripple's lifetime.
  for (int i = 0; i < ${MAX_RIPPLES}; i++) {
    vec4 ripple = u_ripples[i];
    if (ripple.w <= 0.0) continue;

    float radius = ripple.z * u_clickSpeed;
    float delta  = length((uv - ripple.xy) * aspect) - radius;
    float ring   = cos(delta * 60.0) * exp(-delta * delta * 900.0);

    next += ring * ripple.w * u_clickRipple * min(u_frameScale, 3.0);
  }

  fragColor = vec4(next, state.r, 0.0, 1.0);
}
`;

/**
 * PASS 2 — the visible pass.
 *
 * Refracts the photograph by the gradient of the height field, then samples the
 * texture three times at slightly different offsets to produce chromatic
 * dispersion. `coverFit` reimplements `object-fit: cover` in shader maths — the
 * crop is centred, so whatever sits at the edges of the source is lost.
 */
export const RENDER_SHADER = /* glsl */ `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

uniform sampler2D u_texture;
uniform sampler2D u_simulation;
uniform vec2  u_resolution;
uniform vec2  u_textureSize;
uniform vec2  u_simSize;
uniform float u_trailDisplacement;
uniform float u_dispersion;

/** object-fit: cover, centred. */
vec2 coverFit(vec2 uv) {
  float canvasAspect = u_resolution.x / u_resolution.y;
  float imageAspect  = u_textureSize.x / u_textureSize.y;

  vec2 scale = canvasAspect > imageAspect
    ? vec2(1.0, imageAspect / canvasAspect)
    : vec2(canvasAspect / imageAspect, 1.0);

  return (uv - 0.5) * scale + 0.5;
}

void main() {
  vec2 uv = v_uv;
  vec2 texel = 1.0 / u_simSize;

  // [TRACED] surface normal approximated from the height field gradient
  float hL = texture(u_simulation, uv - vec2(texel.x, 0.0)).r;
  float hR = texture(u_simulation, uv + vec2(texel.x, 0.0)).r;
  float hD = texture(u_simulation, uv - vec2(0.0, texel.y)).r;
  float hU = texture(u_simulation, uv + vec2(0.0, texel.y)).r;

  vec2 grad = vec2(hL - hR, hD - hU);
  vec2 baseOffset = grad * u_trailDisplacement * ${REFERENCE_SIZE.toFixed(1)} / u_resolution;

  // [TRACED] three samples, one per channel, spread by the dispersion amount
  vec4 sR = texture(u_texture, coverFit(uv + baseOffset * (1.0 - u_dispersion * 0.5)));
  vec4 sG = texture(u_texture, coverFit(uv + baseOffset));
  vec4 sB = texture(u_texture, coverFit(uv + baseOffset * (1.0 + u_dispersion * 0.5)));

  fragColor = vec4(sR.r, sG.g, sB.b, sG.a);
}
`;
