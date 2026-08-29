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
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
