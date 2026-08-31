# Google Search Console Setup & Verification Guide

Follow these steps to ensure fast discovery and indexing of AllSiteHub on Google Search.

---

## 1. Domain Property Verification
1. Open [Google Search Console](https://search.google.com/search-console).
2. Choose **Domain** property and enter:
   ```text
   allsitehub.site
   ```
3. Add the provided `TXT` verification record to your DNS provider (Cloudflare / Namecheap / registrar).
4. Click **Verify**.

---

## 2. Submit XML Sitemap
1. Navigate to **Sitemaps** in the left sidebar.
2. Under "Add a new sitemap", enter:
   ```text
   sitemap.xml
   ```
   (Full URL: `https://allsitehub.site/sitemap.xml`)
3. Click **Submit**. Verify status changes to **Success**.

---

## 3. Request Initial URL Inspection
1. Use the search bar at the top to inspect `https://allsitehub.site/`.
2. Click **Request Indexing** for:
   - Homepage (`https://allsitehub.site/`)
   - Category pages (`https://allsitehub.site/category/movies-and-shows`, etc.)
   - Editorial collections (`https://allsitehub.site/collections`)

---

## 4. Ongoing Monitoring Checklist
- **Page Indexing**: Check for any unexpected 404s or excluded canonicals.
- **Core Web Vitals**: Monitor mobile & desktop LCP (<2.5s) and CLS (<0.1).
- **Search Performance**: Review top queries and click-through rates.
