# AllSiteHub SEO Audit (Before Overhaul)

## 1. System Overview
- **Framework**: Next.js 16 (App Router) with React 19
- **Deployment Platform**: Cloudflare Workers / Vercel Edge Runtime via `@opennextjs/cloudflare`
- **Data Source**: Bundled `db.json` & Upstash Redis persistence
- **Primary Domain**: `https://allsitehub.site`

## 2. Pre-Implementation Audit Findings & Identified Risks

### A. Technical SEO & Schema Markup
- **Missing Structured Data**: Profile and category pages lacked standard schema.org `BreadcrumbList` microdata.
- **Canonical Consistency**: Domain references were scattered across different files rather than centralized.
- **Social Proof Fabrication Risk**: `useLiveOnlineCounter` generated synthetic random online visitor counts (1,500–4,000) which violated Search Quality Rating Guidelines (Section 12 of Master Prompt).

### B. Indexing & Thin Content Quality
- **Sitemap Inclusions**: Sitemaps included every database record without filtering for minimum description or content completeness.
- **Missing Gating**: No mechanism existed to flag thin website entries with `noindex, follow` while keeping them functional for browsing users.

### C. Developer Tooling
- Absence of automated CLI guards (`seo:data`, `seo:sitemap`, `seo:audit`) to catch data regressions or duplicate domains prior to deployment.
