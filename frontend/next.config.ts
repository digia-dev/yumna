import path from "path";
import type { NextConfig } from "next";

// 428 – CDN asset prefix (set NEXT_PUBLIC_CDN_URL in production env)
// e.g. NEXT_PUBLIC_CDN_URL=https://cdn.yumna.app
const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL || "";

const securityHeaders = [
  // 446 – Content Security Policy
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // 428 – Allow CDN origin in CSP
      `script-src 'self' 'unsafe-eval' 'unsafe-inline'${CDN_URL ? ` ${CDN_URL}` : ""}`,
      `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com${CDN_URL ? ` ${CDN_URL}` : ""}`,
      "font-src 'self' https://fonts.gstatic.com",
      `img-src 'self' data: blob: https:${CDN_URL ? ` ${CDN_URL}` : ""}`,
      "connect-src 'self' https: wss:",
      "frame-ancestors 'none'",
    ].join("; "),
  },
  // 450 – Security headers
  { key: "X-Content-Type-Options",    value: "nosniff" },
  { key: "X-Frame-Options",           value: "DENY" },
  { key: "X-XSS-Protection",          value: "1; mode=block" },
  { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy",        value: "camera=(), microphone=(), geolocation=()" },
  // 443 – HSTS
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

// 428 – Long cache headers for static assets (served via CDN)
const staticCacheHeaders = [
  {
    key: "Cache-Control",
    value: "public, max-age=31536000, immutable", // 1 year
  },
];

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname, ".."),
  },

  // 428 – CDN asset prefix: all _next/static assets served from CDN_URL
  ...(CDN_URL ? { assetPrefix: CDN_URL } : {}),

  // 429 – Enable Next.js built-in Gzip/Brotli compression
  // (Vercel handles this automatically; for self-hosted use this flag)
  compress: true,

  // 431 – Bundle size optimisation
  serverExternalPackages: ["@prisma/client", "bcryptjs"],

  // 445 – next/image with CDN support
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86_400, // 24h
    // 428 – Allow CDN hostname for served images
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
    // 428 – Loader prefix uses CDN when set
    ...(CDN_URL ? { path: `${CDN_URL}/_next/image` } : {}),
  },

  // Security + cache headers
  async headers() {
    return [
      // 446 – Security on all routes
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      // 428 – Long-lived cache for static Next.js chunks
      {
        source: "/_next/static/(.*)",
        headers: staticCacheHeaders,
      },
      // 428 – Long-lived cache for public folder assets
      {
        source: "/icons/(.*)",
        headers: staticCacheHeaders,
      },
      {
        source: "/fonts/(.*)",
        headers: staticCacheHeaders,
      },
      // 428 – Shorter cache for HTML pages (CDN must revalidate)
      {
        source: "/((?!_next).*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=0, must-revalidate" }],
      },
    ];
  },

  async redirects() {
    return [];
  },
};

export default nextConfig;
