/**
 * Generate AVIF and WebP siblings for the hero crops.
 *
 * The hero is the LCP element and deliberately bypasses next/image: the shader
 * uploads the exact <img> the browser resolved, so an optimizer-resized
 * derivative would either mismatch the authored crop or cost a second download.
 * That means modern formats have to be produced ahead of time and offered
 * through <picture><source type>, which the canvas then reads via currentSrc.
 *
 * Run after changing anything in public/hero:
 *     node scripts/build-hero-assets.mjs
 *
 * Outputs are committed, so no build step depends on this and deploys stay
 * reproducible. sharp is already present as a Next dependency.
 */
import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const HERO_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "hero");

// Quality chosen per format: AVIF holds up far lower than JPEG, and this is a
// smooth-gradient image where banding, not detail loss, is the failure mode.
const TARGETS = [
  { ext: "avif", options: { quality: 52, effort: 6, chromaSubsampling: "4:4:4" } },
  { ext: "webp", options: { quality: 80, effort: 6 } },
];

const kb = (bytes) => `${Math.round(bytes / 1024)} KB`;

const sources = (await readdir(HERO_DIR)).filter((f) => f.endsWith(".jpg"));
if (sources.length === 0) throw new Error(`No .jpg sources found in ${HERO_DIR}`);

for (const file of sources) {
  const from = path.join(HERO_DIR, file);
  const original = (await stat(from)).size;
  const base = file.replace(/\.jpg$/, "");
  const meta = await sharp(from).metadata();

  const results = [];
  for (const { ext, options } of TARGETS) {
    const to = path.join(HERO_DIR, `${base}.${ext}`);
    await sharp(from)[ext](options).toFile(to);
    const size = (await stat(to)).size;
    results.push(`${ext} ${kb(size)} (${Math.round((1 - size / original) * 100)}% smaller)`);
  }

  console.log(`${file}  ${meta.width}x${meta.height}  jpg ${kb(original)}  ->  ${results.join("  ")}`);
}
