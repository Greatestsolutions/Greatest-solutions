import type { NextConfig } from "next";

/**
 * Security headers.
 *
 * Deliberately the conservative set — each is safe for a static marketing site
 * and none can break rendering. A Content-Security-Policy is the significant
 * remaining hardening step, but it needs a nonce strategy for Next's inline
 * bootstrap scripts, so it is tracked as backlog work rather than guessed at
 * here: a wrong CSP fails closed and takes the site down.
 */
const securityHeaders = [
  // Stop browsers MIME-sniffing a response into something executable.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Send the origin only on cross-origin requests; full URL stays internal.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // No embedding in third-party frames — clickjacking.
  { key: "X-Frame-Options", value: "DENY" },
  // Drop access to hardware APIs this site never uses.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

/**
 * Long-lived caching for everything under `public/`.
 *
 * Measured against production before this existed: every file served
 * straight out of `public/` — every video, every work/service image, the
 * favicon — came back `Cache-Control: public, max-age=0, must-revalidate`,
 * Next's conservative default for files it isn't otherwise told about. That
 * forces a revalidation round-trip (a conditional GET, then a fast-but-not-free
 * 304) on every single repeat visit, for content that never actually changes
 * between deploys — this is measurably different from `_next/static/*`
 * (build output, content-hashed filenames), which Next already serves with
 * `max-age=31536000, immutable` with no configuration needed. This closes the
 * same gap for the other half of the site's assets.
 *
 * The real cost of "cache forever" here: these filenames are NOT content-
 * hashed (`showreel.mp4`, `flower-robot.mp4`, not `flower-robot.a91f.mp4`), so
 * a future deploy that changes what a file contains without renaming it will
 * leave existing visitors served the stale cached copy until the max-age
 * expires. The fix, if that ever happens, is the same one CDN-cached static
 * assets always use: give the new content a new filename rather than
 * overwriting the old one in place.
 *
 * Scoped by extension (video, image, font) rather than to `/:path*`, so it
 * can never accidentally catch an HTML document or an API route — those have
 * no extension to match and keep whatever caching Next's own page-level
 * rendering strategy already gives them.
 */
const staticAssetCacheHeaders = [
  { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
];

const nextConfig: NextConfig = {
  // Removes the `X-Powered-By: Next.js` response header, which advertises the
  // framework and version to anyone scanning.
  poweredByHeader: false,

  // Surfaces double-invoked effects and unsafe lifecycles in development. The
  // hero allocates a WebGL context in an effect, so strict double-mounting is
  // exactly the behaviour worth testing against.
  reactStrictMode: true,

  images: {
    // Modern formats for anything routed through next/image. The hero bypasses
    // the optimizer on purpose (the shader needs the exact authored asset), but
    // every other image on the site will go through it.
    formats: ["image/avif", "image/webp"],
  },

  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        // Regex alternation, not a brace-list: `{a,b}` in a Next.js header
        // `source` is path-to-regexp's repeat-count syntax, not a glob — it
        // silently matched nothing, which is why the first version of this
        // rule shipped and changed no response headers at all in production
        // (confirmed directly: re-curled after deploy, cta.mp4 still came
        // back `max-age=0, must-revalidate`). This is the syntax Next's own
        // docs use for extension matching.
        source: "/:path*.(mp4|webm|avif|webp|png|jpg|jpeg|svg|ico|woff2)",
        headers: staticAssetCacheHeaders,
      },
    ];
  },
};

export default nextConfig;
