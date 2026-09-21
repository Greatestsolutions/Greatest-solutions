/**
 * Generate AVIF and WebP siblings for every PNG in the migrated-artwork folders.
 *
 * Generalised from `build-service-assets.mjs` once a second consumer appeared
 * (the process-step icons). Same reasoning as `build-hero-assets.mjs`, with one
 * extra constraint: these renders have an alpha channel, so the encoder settings
 * have to preserve it — a flattened background would show as a grey square
 * against the warm page.
 *
 * Sources are the Framer originals, downloaded once at migration time; nothing
 * is fetched from framerusercontent.com at runtime.
 *
 * A generated file is only kept if it is actually smaller than the PNG. Below
 * roughly 4 KB the container overhead of AVIF regularly loses to a well-packed
 * PNG, and shipping a larger "optimised" file would be a straight regression —
 * so small icons legitimately stay PNG-only and `Picture` falls through to the
 * source.
 *
 * Run after adding or changing artwork:
 *     npm run assets:images
 */
import { readdir, stat, unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public");
const DIRS = ["services", "icons", "blog", "works", "works/video", "testimonials", "video"];

// Smooth greyscale renders on transparency: banding is the failure mode, not
// detail loss, so quality can sit low while `4:4:4` keeps the gradients clean.
const TARGETS = [
  { ext: "avif", options: { quality: 55, effort: 6, chromaSubsampling: "4:4:4" } },
  { ext: "webp", options: { quality: 82, effort: 6, alphaQuality: 90 } },
];

const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

for (const dir of DIRS) {
  const abs = path.join(ROOT, dir);
  const sources = (await readdir(abs)).filter((f) => f.endsWith(".png"));
  if (sources.length === 0) {
    console.log(`${dir}/  (no .png sources)`);
    continue;
  }

  for (const file of sources) {
    const from = path.join(abs, file);
    const original = (await stat(from)).size;
    const base = file.replace(/\.png$/, "");
    const meta = await sharp(from).metadata();

    const results = [];
    for (const { ext, options } of TARGETS) {
      const to = path.join(abs, `${base}.${ext}`);
      await sharp(from)[ext](options).toFile(to);
      const size = (await stat(to)).size;
      if (size >= original) {
        await unlink(to);
        results.push(`${ext} skipped (${kb(size)} ≥ png)`);
      } else {
        results.push(`${ext} ${kb(size)} (${Math.round((1 - size / original) * 100)}% smaller)`);
      }
    }

    console.log(
      `${dir}/${file}  ${meta.width}x${meta.height}  alpha=${meta.hasAlpha}  ` +
        `png ${kb(original)}  ->  ${results.join("  ")}`,
    );
  }
}
