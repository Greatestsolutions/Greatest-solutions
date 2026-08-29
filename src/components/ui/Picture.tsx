import type { ImageSource } from "@/types/media";
import { cn } from "@/lib/cn";

/**
 * A plain `<picture>` offering AVIF → WebP → fallback.
 *
 * Deliberately not `next/image`. These sources are pre-generated at build time
 * by a script, at exactly one size, so the optimizer has nothing to add — it
 * would re-encode assets that are already smaller than what it produces and add
 * a server round trip on first paint. The hero made the same call for the same
 * reason; this component is the reusable form of it.
 *
 * `width`/`height` are the intrinsic pixel dimensions and are required: without
 * them the browser cannot reserve space and the section contributes to CLS.
 */
export type PictureProps = {
  source: ImageSource;
  /** Empty string marks the image decorative, which is correct for artwork. */
  alt: string;
  width: number;
  height: number;
  className?: string;
  sizes?: string;
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
};

export function Picture({
  source,
  alt,
  width,
  height,
  className,
  sizes,
  loading = "lazy",
  fetchPriority,
}: PictureProps) {
  return (
    <picture>
      {source.avif && <source srcSet={source.avif} type="image/avif" sizes={sizes} />}
      {source.webp && <source srcSet={source.webp} type="image/webp" sizes={sizes} />}
      <img
        src={source.fallback}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding="async"
        className={cn("block", className)}
      />
    </picture>
  );
}
