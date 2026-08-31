# AllSiteHub Google Search Console & SEO Readiness Checklist

Use this checklist before and after production deployments:

## Pre-Launch & Verification
- [x] Domain canonical defined (`https://allsitehub.site`, non-www, HTTPS)
- [x] Automated `sitemap.xml` generated and validated (`npm run seo:sitemap`)
- [x] `robots.txt` configured with sitemap link (`/robots.txt`)
- [x] Metadata base URL configured on all dynamic pages
- [x] Zero simulated/fake metrics in UI (Section 12 compliant)
- [x] Breadcrumbs and structured JSON-LD schema validated (`npm run seo:audit`)
- [x] Quality gating implemented (`noindex` on thin listings)
- [x] External links secured with `rel="noopener noreferrer"`

## Post-Launch Operations
- [ ] Domain property verified in Google Search Console
- [ ] `https://allsitehub.site/sitemap.xml` submitted to Search Console
- [ ] Homepage & primary categories requested for indexing
- [ ] Mobile usability report checked with zero errors
- [ ] Core Web Vitals audited (LCP, INP, CLS)
- [ ] Weekly review of Search Console indexing coverage
