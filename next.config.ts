import type { NextConfig } from "next";
import path from "path";

const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://www.googletagmanager.com https://*.googletagmanager.com https://adservice.google.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: blob:
    https://www.google.com
    https://t0.gstatic.com
    https://t1.gstatic.com
    https://t2.gstatic.com
    https://t3.gstatic.com
    https://icons.duckduckgo.com
    https://icon.horse
    https://pagead2.googlesyndication.com;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://stats.g.doubleclick.net https://pagead2.googlesyndication.com;
  frame-src 'self' https://googleads.g.doubleclick.net https://tpc.googlesyndication.com;
  frame-ancestors 'none';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
`.replace(/\s{2,}/g, ' ').trim();

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.google.com",
        pathname: "/s2/favicons/**",
      },
      {
        protocol: "https",
        hostname: "*.gstatic.com",
        pathname: "/faviconV2/**",
      },
      {
        protocol: "https",
        hostname: "icons.duckduckgo.com",
        pathname: "/ip3/**",
      },
      {
        protocol: "https",
        hostname: "icon.horse",
        pathname: "/icon/**",
      },
    ],
  },
  // ── Security & Cache Headers ──
  async headers() {
    return [
      {
        source: "/logos/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: ContentSecurityPolicy,
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
