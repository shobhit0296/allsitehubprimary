import type { NextConfig } from "next";
import path from "path";

const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval'
    https://pagead2.googlesyndication.com
    https://www.googletagmanager.com
    https://*.googletagmanager.com
    https://adservice.google.com
    https://googleads.g.doubleclick.net
    https://tpc.googlesyndication.com
    https://bibleearthquake.com
    https://*.bibleearthquake.com
    https://*.profitableratecpmnetwork.com
    https://*.highcpmgate.com
    https://*.effectivegate.com
    https://*.highperformancegate.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: blob: https:
    https://www.google.com
    https://t0.gstatic.com
    https://t1.gstatic.com
    https://t2.gstatic.com
    https://t3.gstatic.com
    https://icons.duckduckgo.com
    https://icon.horse
    https://pagead2.googlesyndication.com
    https://*.profitableratecpmnetwork.com
    https://*.bibleearthquake.com
    https://*.highcpmgate.com
    https://*.effectivegate.com
    https://*.highperformancegate.com;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https:
    https://www.google-analytics.com
    https://*.google-analytics.com
    https://*.analytics.google.com
    https://*.googletagmanager.com
    https://stats.g.doubleclick.net
    https://pagead2.googlesyndication.com
    https://*.upstash.io
    https://*.profitableratecpmnetwork.com
    https://*.bibleearthquake.com
    https://*.highcpmgate.com
    https://*.effectivegate.com
    https://*.highperformancegate.com;
  frame-src 'self' https:
    https://googleads.g.doubleclick.net
    https://tpc.googlesyndication.com
    https://*.profitableratecpmnetwork.com
    https://*.bibleearthquake.com
    https://*.highcpmgate.com
    https://*.effectivegate.com
    https://*.highperformancegate.com;
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
      // ─── Admin panel routes: Never cache at Edge or Cloudflare CDN ───
      {
        source: "/(adminshobhit|shobhitadmin)/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-cache, no-store, max-age=0, must-revalidate" },
          { key: "CDN-Cache-Control", value: "no-store" },
          { key: "Cloudflare-CDN-Cache-Control", value: "no-store" },
        ],
      },
      {
        source: "/(adminshobhit|shobhitadmin)",
        headers: [
          { key: "Cache-Control", value: "private, no-cache, no-store, max-age=0, must-revalidate" },
          { key: "CDN-Cache-Control", value: "no-store" },
          { key: "Cloudflare-CDN-Cache-Control", value: "no-store" },
        ],
      },
      // ─── Logos: immutable 1-year cache ───
      {
        source: "/logos/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },

      // ─── Next.js Static Chunks & CSS/JS Bundles: 1-year immutable cache ───
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // ─── Root Static Icons & Assets: 30-day edge cache ───
      {
        source: "/(favicon.ico|apple-touch-icon.png|icon.png|icon.svg|next.svg|vercel.svg|globe.svg|file.svg|window.svg|logo.png|logo-512.png)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" },
        ],
      },
      // ─── All content pages: No CDN caching so admin changes are immediately live ───
      {
        source: "/(|category/:slug*|site/:id*|collections|collections/:slug*|recent|about|dmca|request|how-we-review-websites|privacy|terms)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "CDN-Cache-Control", value: "no-cache" },
          { key: "Cloudflare-CDN-Cache-Control", value: "no-cache" },
        ],
      },
      // ─── Logo API: 7-day Edge CDN cache ───
      {
        source: "/api/logo",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=604800, stale-while-revalidate=86400" },
        ],
      },
      // ─── Visitor stats API: 5-min Edge cache ───
      {
        source: "/api/stats/visitors",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=300, stale-while-revalidate=600" },
        ],
      },
      // ─── Security headers for all routes ───
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: ContentSecurityPolicy },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
        ],
      },
    ];
  },
  // ── Permanent SEO Redirects ──
  async redirects() {
    return [
      { source: '/guides', destination: '/collections', permanent: true },
      { source: '/editorial-policy', destination: '/how-we-review-websites', permanent: true },
      { source: '/contact', destination: '/request', permanent: true },
      { source: '/request-site', destination: '/request', permanent: true },
      { source: '/privacy-policy', destination: '/privacy', permanent: true },
      { source: '/terms-of-service', destination: '/terms', permanent: true },
      { source: '/terms-and-conditions', destination: '/terms', permanent: true },
    ];
  },
};

export default nextConfig;
