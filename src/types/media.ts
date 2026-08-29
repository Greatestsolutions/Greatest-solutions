/**
 * Shared media types.
 *
 * Lives here rather than beside a component because every future section that
 * art-directs an image needs the same shape, and data modules must not import
 * from client components just to borrow a type.
 */

/**
 * One image crop, offered in several formats.
 *
 * Ordered best-first at render time: AVIF, then WebP, then `fallback`. Only
 * `fallback` is required — it is what lands in the `<img src>`, so it must be a
 * format every browser decodes (JPEG or PNG).
 *
 * Generate the modern formats with `node scripts/build-hero-assets.mjs`.
 */
export interface ImageSource {
  avif?: string;
  webp?: string;
  fallback: string;
}
