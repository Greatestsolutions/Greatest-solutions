"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import type { ImageSource } from "@/types/media";
import { DEFAULT_UNIFORMS, RippleRenderer, type RippleUniforms } from "./RippleRenderer";

export interface RippleImageProps {
  /** Crop served when `landscapeMedia` matches. */
  landscapeSrc: ImageSource;
  /** Crop served otherwise — its `fallback` is also the <img src>. */
  portraitSrc: ImageSource;
  alt: string;
  /**
   * Media query selecting the landscape crop. The default assumes a full-bleed
   * hero, where the element's aspect tracks the viewport's. Override it if the
   * component is ever placed in a box whose aspect diverges from the viewport —
   * see the note on source selection below.
   */
  landscapeMedia?: string;
  className?: string;
  uniforms?: Partial<RippleUniforms>;
  /** Hero images are the LCP element; secondary uses should pass "lazy". */
  loading?: "eager" | "lazy";
}

/**
 * Hero ripple image.
 *
 * A thin React wrapper around {@link RippleRenderer}: all WebGL lives in that
 * class, this component owns lifecycle, input and fallbacks.
 *
 * ## Source selection
 *
 * The browser picks the crop via <picture>, not JavaScript. That matters:
 * choosing in an effect meant the server rendered the landscape crop for
 * everyone, so phones downloaded 234 KB of the wrong image, then downloaded the
 * right one — two fetches, and the LCP element was wrong on mobile. With
 * <source media>, the correct file is chosen during preload scan, before React
 * runs.
 *
 * The canvas then uploads *that same <img> element* as its texture, so the GPU
 * copy costs zero extra bytes and can never disagree with what is on screen.
 *
 * Caveat worth knowing: media queries test the viewport, while the crop really
 * depends on the element's aspect. Those coincide for a full-bleed hero. The
 * reference build is the cautionary tale — its tablet layout pinned the hero to
 * a fixed 793px box, so at 1100x900 the viewport read landscape (1.222) while
 * the box was portrait (0.897). If this component is ever put in such a box,
 * pass a `landscapeMedia` that describes the box, not the window.
 *
 * ## Behaviours the reference build lacks
 *
 * - `prefers-reduced-motion` renders one static frame instead of animating.
 * - An IntersectionObserver pauses the loop while off-screen.
 * - WebGL context loss falls back to the poster image and rebuilds on restore.
 */
export function RippleImage({
  landscapeSrc,
  portraitSrc,
  alt,
  landscapeMedia = "(min-aspect-ratio: 1/1)",
  className,
  uniforms,
  loading = "eager",
}: RippleImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const rendererRef = useRef<RippleRenderer | null>(null);

  /**
   * Uniforms are read through a ref so that passing an inline object literal —
   * the natural call style — cannot retrigger the setup effect. Without this,
   * `uniforms={{ dispersion: 0.2 }}` would rebuild the entire WebGL context on
   * every parent render.
   */
  const uniformsRef = useRef(uniforms);

  /** Bumped on context restore to force a clean rebuild of the renderer. */
  const [generation, setGeneration] = useState(0);
  /** Gates the canvas fade-in. Deliberately the only state driving output: the
   *  poster <img> is always rendered, so a canvas that never becomes ready is
   *  visually identical to no canvas at all. */
  const [ready, setReady] = useState(false);

  useEffect(() => {
    uniformsRef.current = uniforms;
    const renderer = rendererRef.current;
    // Apply live tweaks without tearing down the context.
    if (renderer) Object.assign(renderer.uniforms, DEFAULT_UNIFORMS, uniforms);
  }, [uniforms]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!container || !canvas || !image) return;

    let renderer: RippleRenderer;
    try {
      renderer = new RippleRenderer(canvas, uniformsRef.current);
    } catch {
      // No WebGL2, or no float render targets. Leave the canvas transparent and
      // let the poster <img> stand in — nothing further to do.
      return;
    }
    rendererRef.current = renderer;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let uploaded = "";

    /** Upload whichever file <picture> actually resolved to. */
    const upload = () => {
      if (!image.complete || image.naturalWidth === 0) return;
      if (image.currentSrc === uploaded) return;
      uploaded = image.currentSrc;
      renderer.setImage(image);
      renderer.renderStatic();
      setReady(true);
    };

    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      renderer.resize(width, height, window.devicePixelRatio);
      // A resize can cross the media-query boundary and swap the resolved
      // source; re-upload if so.
      upload();
      if (reduceMotion.matches) renderer.renderStatic();
    };

    // `load` fires again whenever <picture> resolves to a different file.
    image.addEventListener("load", upload);
    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    // --- input --------------------------------------------------------------
    const toLocal = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      return {
        x: (event.clientX - rect.left) / rect.width,
        // GL texture space has its origin bottom-left.
        y: 1 - (event.clientY - rect.top) / rect.height,
      };
    };

    const onPointerMove = (event: PointerEvent) => {
      const { x, y } = toLocal(event);
      renderer.setPointer(x, y);
    };
    const onPointerEnter = (event: PointerEvent) => {
      const { x, y } = toLocal(event);
      // Seed without velocity, or arriving from the far side of the element
      // reads as one huge sweep and splashes the whole surface.
      renderer.seedPointer(x, y);
      renderer.setHover(true);
    };
    const onPointerLeave = () => {
      renderer.setHover(false);
      renderer.setPressed(false);
    };
    const onPointerDown = (event: PointerEvent) => {
      const { x, y } = toLocal(event);
      renderer.setPressed(true);
      renderer.addRipple(x, y);
    };
    const onPointerUp = () => renderer.setPressed(false);

    // Only wire input when motion is allowed — under reduced motion the canvas
    // is a still picture and should not react at all.
    if (!reduceMotion.matches) {
      container.addEventListener("pointermove", onPointerMove);
      container.addEventListener("pointerenter", onPointerEnter);
      container.addEventListener("pointerleave", onPointerLeave);
      container.addEventListener("pointerdown", onPointerDown);
      window.addEventListener("pointerup", onPointerUp);
    }

    // --- context loss -------------------------------------------------------
    const onContextLost = (event: Event) => {
      // Without preventDefault the browser will not attempt restoration.
      event.preventDefault();
      renderer.stop();
      setReady(false); // reveals the poster <img>
    };
    const onContextRestored = () => setGeneration((n) => n + 1);
    canvas.addEventListener("webglcontextlost", onContextLost);
    canvas.addEventListener("webglcontextrestored", onContextRestored);

    // --- run only while visible ---------------------------------------------
    const visibility = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry || reduceMotion.matches) return;
        if (entry.isIntersecting) renderer.start();
        else renderer.stop();
      },
      { threshold: 0 },
    );
    visibility.observe(container);

    const onMotionPreferenceChange = () => {
      if (reduceMotion.matches) {
        renderer.stop();
        renderer.renderStatic();
      } else {
        renderer.start();
      }
    };
    reduceMotion.addEventListener("change", onMotionPreferenceChange);

    return () => {
      resizeObserver.disconnect();
      visibility.disconnect();
      reduceMotion.removeEventListener("change", onMotionPreferenceChange);
      image.removeEventListener("load", upload);
      // Detach before dispose() so a teardown-time context event cannot re-enter
      // onContextLost. NOTE: dispose() does NOT call loseContext() — doing so
      // permanently poisons the canvas and killed the shader once already. See
      // the comment in RippleRenderer.dispose(); this one used to say the
      // opposite, which is exactly the note that would talk someone into
      // reintroducing the bug.
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerenter", onPointerEnter);
      container.removeEventListener("pointerleave", onPointerLeave);
      container.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      renderer.dispose();
      rendererRef.current = null;
    };
    // `uniforms` is intentionally absent — see uniformsRef above.
    //
    // The crops are depended on by URL rather than by object identity: these
    // props are now objects, and an inline literal at the call site would
    // otherwise tear down and rebuild the whole WebGL context on every parent
    // render. The effect never reads the objects anyway — it uploads whatever
    // <picture> resolved, via image.currentSrc.
  }, [
    landscapeSrc.fallback,
    portraitSrc.fallback,
    landscapeSrc.avif,
    portraitSrc.avif,
    landscapeSrc.webp,
    portraitSrc.webp,
    landscapeMedia,
    generation,
  ]);

  return (
    <div ref={containerRef} className={className} data-ripple-host>
      {/*
        `display: contents` keeps <picture> out of the layout entirely, so the
        absolutely positioned <img> resolves against the container as before.
      */}
      <picture className="contents">
        {/*
          Order is significant: the browser takes the FIRST <source> whose media
          and type both match. All landscape entries carry the media query and
          come first; the portrait entries carry none, so they match everything
          left over; the <img> is the final fallback.

          Within each crop, best format first — AVIF takes the landscape file
          from 234 KB to 35 KB, which matters because this is the LCP element.
        */}
        {landscapeSrc.avif && (
          <source media={landscapeMedia} type="image/avif" srcSet={landscapeSrc.avif} />
        )}
        {landscapeSrc.webp && (
          <source media={landscapeMedia} type="image/webp" srcSet={landscapeSrc.webp} />
        )}
        <source media={landscapeMedia} srcSet={landscapeSrc.fallback} />
        {portraitSrc.avif && <source type="image/avif" srcSet={portraitSrc.avif} />}
        {portraitSrc.webp && <source type="image/webp" srcSet={portraitSrc.webp} />}
        {/*
          The <img> carries the alt text and is the poster, the fallback and the
          GPU texture source. A real <img> is also better for assistive tech than
          role="img" on a canvas, which is why the canvas is aria-hidden.

          Not next/image: the optimizer hands back a resized derivative, but the
          shader needs the exact asset at its authored dimensions, and routing
          both paths would cost a second download. `@next/next/no-img-element`
          does not fire here — it exempts <img> inside <picture>, which is
          precisely this art-direction case.
        */}
        <img
          ref={imageRef}
          src={portraitSrc.fallback}
          alt={alt}
          loading={loading}
          fetchPriority={loading === "eager" ? "high" : "auto"}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </picture>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={cn(
          "absolute inset-0 h-full w-full transition-opacity duration-700 ease-out",
          ready ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
}
