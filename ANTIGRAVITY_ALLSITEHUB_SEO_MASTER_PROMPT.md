# AllSiteHub SEO Master Implementation Prompt for Antigravity

## PURPOSE

You are the implementation agent for the existing AllSiteHub website:

https://allsitehub.site/

Your job is to audit the existing codebase, implement a complete technical + on-page + programmatic SEO system, preserve the existing visual identity unless a change is required for SEO/accessibility/usability, and verify the result.

Do NOT merely explain what should be done. Inspect the repository, modify the actual source files, create missing files/components/routes, run the project, run available tests/builds, and fix implementation errors.

The target is a production-ready SEO foundation for AllSiteHub.

IMPORTANT:
- Never claim that SEO guarantees a #1 Google position.
- Never create fake reviews, fake ratings, fake traffic, fake user counts, fake awards, fake "trusted" claims, or fake editorial credentials.
- Never create thousands of thin pages simply to target keywords.
- Never keyword-stuff.
- Never hide SEO text from users.
- Never create doorway pages.
- Never generate duplicate pages with only the keyword changed.
- Never remove useful existing functionality merely to simplify SEO.
- Do not host copyrighted media. AllSiteHub is a directory/discovery site.
- Do not automatically submit anything to Google Search Console unless valid Search Console credentials/API access are explicitly available in the environment.
- Do not expose secrets, API keys, tokens, database credentials, or environment variables in source code, HTML, logs, commits, or documentation.

---

# 1. FIRST: AUDIT THE EXISTING PROJECT

Before changing anything:

1. Detect the framework:
   - Next.js
   - React/Vite
   - Astro
   - Nuxt
   - SvelteKit
   - plain HTML
   - other

2. Detect:
   - routing system
   - database/data source
   - API layer
   - deployment platform
   - image/logo handling
   - analytics
   - authentication/admin routes
   - existing SEO metadata
   - existing sitemap
   - robots.txt
   - canonical URLs
   - structured data
   - existing category pages
   - search/filter implementation

3. Inspect all relevant source files.

4. Do NOT overwrite working application architecture without reason.

5. Create a short internal audit file:
   `docs/SEO_AUDIT_BEFORE.md`

Include:
- framework
- routes
- current SEO implementation
- current data model
- current indexing risks
- current duplicate-content risks
- current performance risks
- current missing SEO features

6. Then implement the changes in this document.

---

# 2. CANONICAL SITE IDENTITY

Use this as the primary site URL:

https://allsitehub.site/

Canonical rules:
- HTTPS only
- non-www canonical unless the existing production configuration proves otherwise
- trailing-slash behavior must be consistent
- all internal links must use the canonical route format
- prevent accidental duplicate http/www URLs where the hosting platform supports redirects

Centralize the site configuration:

```ts
siteConfig = {
  name: "AllSiteHub",
  url: "https://allsitehub.site",
  description:
    "Discover useful websites, online tools, entertainment platforms and resources across the internet.",
}
```

Do not hard-code the domain in dozens of components.

---

# 3. HOMEPAGE SEO

Update the homepage metadata.

Recommended title:

`AllSiteHub - Discover the Best Websites, Tools & Online Resources`

Recommended description:

`Discover useful websites, online tools, entertainment platforms and resources with AllSiteHub. Search and explore curated websites by category, region and purpose.`

Recommended H1:

`Discover the Best Websites, Tools & Online Resources`

Keep the existing visual design if possible.

The homepage should contain meaningful visible sections:

1. Hero/search
2. Categories
3. Popular or featured websites
4. Recently added websites
5. Useful website discovery explanation
6. Guides/resources
7. FAQ where genuinely useful
8. Footer navigation

Do not stuff the homepage with repeated keywords.

---

# 4. PAGE TITLE SYSTEM

Implement unique, deterministic metadata for every indexable page.

Rules:

Homepage:
`AllSiteHub - Discover the Best Websites, Tools & Online Resources`

Category:
`Best {Category} Websites & Online Resources | AllSiteHub`

Website profile:
`{Website Name} - Details, Features & Official Website | AllSiteHub`

Guide:
`{Guide Title} | AllSiteHub`

About:
`About AllSiteHub | Website Discovery Directory`

Contact:
`Contact AllSiteHub`

Editorial policy:
`AllSiteHub Editorial Policy`

Privacy:
`Privacy Policy | AllSiteHub`

Terms:
`Terms of Use | AllSiteHub`

Do not generate titles longer than necessary.

Never use:
- `Best Best Best`
- repeated keywords
- unrelated trending keywords
- keyword lists in titles

---

# 5. META DESCRIPTION SYSTEM

Every indexable page must have a unique, useful description.

Descriptions should:
- describe the page accurately
- contain the primary topic naturally
- be written for users
- avoid keyword stuffing
- never claim unsupported facts

Build metadata from actual database content.

For example:

Category:
`Explore curated {category} websites and online resources. Compare available sites, discover useful options and explore related resources on AllSiteHub.`

Website:
`Explore {name} on AllSiteHub, including its category, website URL, available features and related websites.`

Do not generate descriptions containing unsupported claims such as "safe", "legal", "verified", "official", or "trusted" unless the data actually supports the claim.

---

# 6. URL ARCHITECTURE

Implement clean, descriptive routes.

Preferred structure:

```text
/
 /categories/
 /categories/movies/
 /categories/anime/
 /categories/manga/
 /categories/live-tv-sports/
 /categories/apps/
 /categories/ai-tools/
 /categories/web-tools/

 /websites/
 /websites/{slug}/

 /guides/
 /guides/{slug}/

 /recent/
 /popular/

 /about/
 /contact/
 /editorial-policy/
 /privacy/
 /terms/
 /dmca/
```

If the existing application already has routes that users rely on, preserve them and add redirects to the new canonical URLs where appropriate.

Do not create indexable query URLs such as:

```text
/search?q=anime
/?category=anime
/?sort=popular
/?filter=free
```

unless there is a deliberate SEO landing page with unique useful content.

---

# 7. CATEGORY LANDING PAGES

Convert major categories into real SEO landing pages.

Each category page should contain:

- unique title
- unique meta description
- one H1
- 100-300+ words of useful introductory content where appropriate
- category description
- website listings
- related categories
- related guides
- breadcrumbs
- canonical
- Open Graph metadata
- structured data where appropriate

Example:

`/categories/anime/`

H1:
`Best Anime Websites`

Intro:
Explain what the category contains and how users can use AllSiteHub to discover websites.

Do NOT simply copy the homepage category block onto the category page.

Each category must have a distinct purpose.

---

# 8. WEBSITE PROFILE PAGES

Create individual profile pages for websites where enough useful data exists.

Example:

`/websites/{slug}/`

Each profile should contain:

- website name
- logo
- category
- concise original description
- official/external URL
- availability/region if actually known
- language if actually known
- features if actually known
- last checked date if actually checked
- related websites
- related category
- breadcrumbs

Recommended layout:

```text
Website Name

[Logo]

Description

Category
Region
Language
Status
Last checked

Visit Website

Features

Related Websites

Related Guides
```

IMPORTANT:
Do not invent descriptions or features.

If the database only contains:
- name
- URL
- category

then generate only content that can be truthfully derived from that data, and leave optional fields empty.

---

# 9. WEBSITE PROFILE CONTENT QUALITY

Do NOT create hundreds of pages containing:

```text
{Name} is a website in the {category} category.
Visit {Name} here.
```

That is thin and repetitive.

Instead, profile pages should be indexable only when they contain enough useful information.

Implement a quality threshold:

```ts
shouldIndexWebsitePage(website):
  return (
    website.name &&
    website.url &&
    website.category &&
    (
      website.description ||
      website.features?.length > 0 ||
      website.region ||
      website.language ||
      website.lastChecked
    )
  )
```

If a profile does not meet the threshold:
- it can remain accessible to users
- but add `noindex, follow`
- do not put it into the XML sitemap

Do not create thousands of low-value indexable URLs.

---

# 10. DUPLICATE WEBSITE PROTECTION

Audit the current database for duplicate domains.

Normalize domains by:
- lowercase
- removing protocol
- removing trailing slash
- removing obvious tracking parameters
- normalizing `www` only when appropriate
- preserving meaningful subdomains when they are part of the actual destination

Create a canonical domain key.

Prevent duplicate records.

The current public site appears to contain at least one duplicate listing for FLIXHUB. Fix duplicate records in the data layer rather than merely hiding one visually.

Do NOT automatically merge two records if their URLs may represent different legitimate services. Flag ambiguous duplicates for manual review.

Create:

`docs/DUPLICATE_DATA_REPORT.md`

with detected duplicate/near-duplicate records.

---

# 11. TRUSTED / FEATURED / NEW LABELS

Audit existing labels such as:

- TRUSTED
- FEATURED
- NEW

Only display a label when it has a real rule.

Recommended definitions:

NEW:
- added within the configured recent period

FEATURED:
- manually selected by an administrator

TRUSTED:
- only if a documented review process exists

If no genuine trust methodology exists:
- remove the TRUSTED label
- or rename it to a neutral data-based label

Never invent trustworthiness.

Create an admin/data configuration for these labels rather than hard-coding them.

---

# 12. ACTIVE USERS / ONLINE COUNTS

Audit any displayed metrics such as:

- Active Users
- Online Users
- Members
- Visitors
- Total Users

Only show numbers backed by actual analytics/database/realtime data.

If a metric is hard-coded or fabricated:
- remove it
- replace it with a real metric
- or replace it with a non-numeric statement

Never manufacture social proof.

---

# 13. INTERNAL LINKING SYSTEM

Every important page must be reachable from another crawlable page.

Implement:

Homepage
→ categories
→ category page
→ website profile
→ related websites
→ related category
→ related guides

Add contextual internal links.

Examples:

Category pages:
- related categories
- related guides
- selected website profiles

Website pages:
- category
- related websites
- related guides

Guides:
- category pages
- website profiles
- related guides

Do not create huge blocks of irrelevant links.

Use standard crawlable `<a href="...">` links.

Do not rely only on JavaScript click handlers.

---

# 14. BREADCRUMBS

Implement visible breadcrumbs on:
- category pages
- website profile pages
- guide pages

Example:

```text
Home > Categories > Anime > Website Name
```

Also implement `BreadcrumbList` structured data where valid.

The structured data must match visible breadcrumbs.

---

# 15. STRUCTURED DATA

Implement only schema types that accurately represent visible content.

Homepage:
- WebSite
- Organization if the organization information is real and visible/appropriate

Category:
- BreadcrumbList

Website profile:
- BreadcrumbList
- WebPage where appropriate

Guide:
- Article only if the page is genuinely an article and has the required article information

Do NOT create fake:
- Review
- AggregateRating
- Rating
- Product
- FAQ
- Event
- Person
- Organization claims

Structured data must describe the actual page.

Create a reusable JSON-LD component/helper.

Avoid duplicate JSON-LD blocks.

---

# 16. WEBSITE NAME SCHEMA

Use WebSite structured data on the homepage to establish:

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "AllSiteHub",
  "url": "https://allsitehub.site/"
}
```

If an alternate name is genuinely used by the brand, include it.

Do not use keyword-stuffed alternate names.

---

# 17. ORGANIZATION SCHEMA

If the site has a real organization/brand identity, use Organization structured data.

Only include properties for which accurate data exists.

Do not invent:
- address
- phone
- founders
- employee count
- social accounts
- awards

Use the actual logo URL.

---

# 18. CANONICAL URLS

Every indexable HTML page must have exactly one canonical URL.

Canonical rules:
- absolute HTTPS URL
- normalized host
- normalized path
- no search/filter tracking parameters
- canonical points to itself for unique indexable pages
- duplicate/alternate pages canonicalize to the primary page

Do not canonicalize every page to the homepage.

Do not generate conflicting canonical tags.

---

# 19. ROBOTS.TXT

Create or update:

`/robots.txt`

Default strategy:

```text
User-agent: *
Allow: /

Sitemap: https://allsitehub.site/sitemap.xml
```

Adjust rules for actual private routes.

Do not block:
- CSS
- JavaScript
- important images
- public category pages
- public website profiles

Do not use robots.txt as a substitute for `noindex`.

Do not block URLs from crawling if Google needs to see their noindex directive.

---

# 20. XML SITEMAP

Create a production sitemap at:

`https://allsitehub.site/sitemap.xml`

It must dynamically include only canonical, indexable, public pages.

Include:
- homepage
- indexable category pages
- indexable website profiles
- indexable guide pages
- about/contact/editorial pages where appropriate

Exclude:
- admin
- login
- dashboard
- search query pages
- filter combinations
- duplicate pages
- noindex pages
- redirects
- 404 pages
- private pages

Use actual last modification dates when available.

Do not fake `lastmod`.

If the site grows beyond one sitemap's limits, implement a sitemap index.

---

# 21. SITEMAP VALIDATION

Create a script:

`npm run seo:sitemap`

or the project's equivalent.

It should:
- generate sitemap
- parse sitemap XML
- verify valid XML
- verify no duplicate URLs
- verify all URLs use HTTPS
- verify URLs belong to allsitehub.site
- verify no noindex URL is included
- verify no redirect URL is included
- verify no obvious query/filter URL is included

Fail CI/build if critical sitemap errors exist.

---

# 22. SEARCH / FILTER INDEXING

Audit all search/filter URLs.

Default behavior:

User search:
`/search?q=...`

should generally be:
- usable for users
- not included in sitemap
- `noindex, follow` unless explicitly promoted to an editorial SEO landing page

Do not let arbitrary filter combinations create millions of indexable URLs.

If a filter is important enough to rank, create a dedicated static route such as:

`/categories/anime/`

rather than relying on:

`/?category=anime`

---

# 23. 404 AND REDIRECT HANDLING

Create a useful 404 page.

It should contain:
- clear message
- search
- popular categories
- homepage link

For deleted/moved website profiles:
- use 301 redirects only when a genuinely relevant replacement exists
- otherwise return 404/410 appropriately

Never redirect every missing page to the homepage.

---

# 24. SEO-FRIENDLY SEARCH ENGINE

Keep the existing AllSiteHub search functionality.

Improve it so it supports:
- website name
- domain
- category
- description
- tags where available

Search results should be accessible and fast.

Do not automatically index arbitrary search result pages.

Use:
- proper labels
- keyboard accessibility
- semantic inputs
- accessible result links

---

# 25. GUIDES / CONTENT HUB

Create:

`/guides/`

Do not automatically mass-generate articles.

Build a content model:

```ts
Guide {
  title
  slug
  description
  content
  category
  author
  publishedAt
  updatedAt
  image
  status
}
```

Create high-value guides only.

Suggested initial topics:

- Best AI Tools
- Best Free Online Tools
- Best Websites for Students
- Best Websites for Developers
- Best Anime Websites
- Best Manga Websites
- Best Movie & TV Websites
- Best Productivity Websites
- Useful Websites You Should Bookmark
- Website Alternatives & Comparisons

Each guide must:
- answer a real query
- contain original useful information
- link to relevant website profiles
- link to relevant categories
- avoid unsupported claims
- avoid keyword stuffing

---

# 26. CONTENT QUALITY RULE

AI may assist with drafting, but it must not publish fabricated facts.

For every generated content item:

1. Determine what facts are actually available.
2. Use only supported facts.
3. Clearly distinguish editorial opinion from factual claims.
4. Do not invent:
   - features
   - pricing
   - ownership
   - legal status
   - availability
   - user counts
   - safety claims
   - popularity
   - traffic
   - awards
5. If data is unavailable, omit the claim.

---

# 27. CATEGORY TAXONOMY

Audit the current categories.

The current public site has categories such as:
- Movies & Shows
- Anime
- Manga
- Live TV & Sports
- Paid
- Apps

Do not force unrelated sites into categories.

Design the taxonomy so it can grow.

Suggested future categories, only when actual inventory exists:

- AI Tools
- Web Tools
- Developer Tools
- Productivity
- Education
- Design
- Finance
- Utilities
- Entertainment
- Music
- News
- Gaming

Do not create empty category pages just for keywords.

A category becomes indexable when it has enough useful content.

---

# 28. CATEGORY PAGE INDEXING THRESHOLD

Implement a simple quality threshold.

Example:

```ts
shouldIndexCategory(category) {
  return category.activeWebsiteCount >= 3
}
```

This threshold can be adjusted.

Do not index empty categories.

Do not create hundreds of nearly empty category pages.

---

# 29. RECENTLY ADDED PAGE

Create:

`/recent/`

Show genuinely recent additions.

Each item should display:
- name
- category
- date added
- URL/action

Use the actual database timestamp.

Do not modify timestamps merely to make content appear fresh.

---

# 30. POPULAR PAGE

Create:

`/popular/`

Only if actual usage metrics exist.

Rank using real data such as:
- outbound clicks
- favorites
- verified usage
- real engagement

Do not fabricate popularity.

---

# 31. WEBSITE STATUS CHECKER

If technically safe and permitted by the hosting environment, implement a backend status checker.

Store:

```ts
status
lastCheckedAt
responseTime
httpStatus
```

Rules:
- use timeouts
- rate-limit checks
- avoid aggressive crawling
- respect robots and terms where appropriate
- never hammer third-party sites
- do not expose internal server errors

Status should not be described as "safe" merely because a site returns HTTP 200.

---

# 32. LAST CHECKED

Where a real automated check exists, show:

`Last checked: {date}`

If no automated check exists, do not show a fabricated check date.

Use ISO timestamps internally and localized display for users.

---

# 33. IMAGE SEO

For every meaningful image:

- descriptive filename where possible
- useful alt text
- width/height attributes
- lazy loading below the fold
- responsive sizing
- WebP/AVIF where supported
- avoid layout shifts
- avoid huge source images

Example:

```html
<img
  src="/logos/example.webp"
  alt="Example website logo"
  width="64"
  height="64"
  loading="lazy"
/>
```

Do not use:
- `alt="image"`
- `alt="logo"` for every logo
- keyword stuffing in alt text

Decorative images should use empty alt text.

---

# 34. OPEN GRAPH / SOCIAL METADATA

Implement:

- og:title
- og:description
- og:url
- og:type
- og:image
- twitter/card metadata

Generate these from page metadata.

Create a default site-wide social image.

For guides/category pages, allow page-specific images where available.

Do not generate fake screenshots.

---

# 35. PERFORMANCE

Audit:
- JavaScript bundle
- CSS
- fonts
- images
- third-party scripts
- hydration
- API calls
- unnecessary re-renders
- layout shifts

Optimize for:
- LCP
- INP
- CLS

Use:
- lazy loading
- image optimization
- code splitting
- caching
- server rendering/static generation where appropriate
- minimal client JavaScript

Do not sacrifice accessibility or functionality just to hit an arbitrary Lighthouse number.

---

# 36. ACCESSIBILITY

Ensure:
- one clear H1
- logical heading hierarchy
- keyboard navigation
- visible focus states
- accessible buttons
- accessible search
- labels for inputs
- sufficient contrast
- semantic links
- alt text
- no click-only divs for navigation

SEO and accessibility improvements should reinforce each other.

---

# 37. MOBILE

Test at:
- 320px
- 375px
- 390px
- 412px
- 768px
- desktop

Ensure:
- content isn't hidden on mobile
- links remain crawlable
- important content is equivalent to desktop
- no horizontal overflow
- search works
- cards remain usable

---

# 38. SECURITY / SEO SAFETY

Audit:
- external links
- `target="_blank"`
- `rel="noopener noreferrer"`
- URL validation
- XSS risks
- HTML injection
- unsafe user-submitted URLs
- open redirects
- SSRF risk in any backend status checker

Never allow an arbitrary user URL to become an internal redirect endpoint.

Validate external URLs before storing/displaying them.

---

# 39. EXTERNAL LINKS

For outbound website links:

- use real destination URLs
- validate protocols
- allow only `https:` and `http:` where appropriate
- avoid `javascript:` URLs
- add `rel="noopener noreferrer"` when opening new tabs

If a link is sponsored/affiliate:
- disclose it
- use appropriate link attributes such as `rel="sponsored"` where applicable

Do not disguise affiliate links as internal URLs.

---

# 40. DATA VALIDATION

Create a data validation command:

`npm run seo:data`

It should check:

- missing names
- invalid URLs
- duplicate domains
- duplicate names
- malformed slugs
- missing categories
- missing descriptions
- invalid image URLs
- unsupported protocols
- obvious tracking URLs
- empty categories
- duplicate slugs

Output a readable report.

---

# 41. SLUG SYSTEM

Create stable slugs.

Example:

```text
"Prime Video" -> "prime-video"
"Movies & Shows" -> "movies-shows"
"AI Tools" -> "ai-tools"
```

Rules:
- lowercase
- hyphen separated
- URL safe
- deterministic
- stable after publication

If a slug changes:
- create a 301 redirect
- update internal links
- update sitemap

---

# 42. INTERNATIONAL / REGION FILTERS

The current site appears to expose region selection.

Do NOT automatically create indexable pages for every region/language combination.

Only create SEO landing pages when:
- there is substantial unique inventory
- the page has unique useful content
- the page has a clear search intent

Example valid future page:

`/regions/india/`

But do not automatically create:

`/anime/india/free/english/mobile/2026/`

just because filters exist.

---

# 43. HREFLANG

Do NOT add hreflang unless actual translated versions exist.

If the website is only one language, don't add fake hreflang tags.

---

# 44. ANALYTICS

Audit current analytics.

If analytics already exists, preserve it.

Track:
- organic landing page
- category click
- website outbound click
- internal search
- guide view
- request-site submission
- error/broken link interaction

Do not collect unnecessary personal information.

Respect applicable privacy requirements and existing consent mechanisms.

---

# 45. SEARCH CONSOLE

Do not attempt to fake Search Console verification.

Create documentation:

`docs/GOOGLE_SEARCH_CONSOLE_SETUP.md`

Include:

1. Verify `allsitehub.site`
2. Open Sitemaps
3. Submit:
   `https://allsitehub.site/sitemap.xml`
4. Use URL Inspection for homepage
5. Request indexing for key pages
6. Monitor Page Indexing
7. Monitor Core Web Vitals
8. Monitor Search Performance

Google Search Console does not guarantee immediate indexing.

---

# 46. SEARCH CONSOLE AUTOMATION

Do not automatically use the Google Indexing API for ordinary category/website pages.

If an official Google API integration is later added, it must follow Google's eligibility and API policies.

For normal pages:
- sitemap discovery
- internal links
- Search Console submission
are the preferred workflow.

---

# 47. GOOGLE SEARCH CONSOLE DOCUMENTATION

Create:

`docs/SEO_GOOGLE_CHECKLIST.md`

Include:

```text
[ ] Domain property verified
[ ] Sitemap submitted
[ ] Homepage indexed
[ ] Category pages indexed
[ ] Website profile pages indexed
[ ] No unexpected noindex
[ ] No robots blocking
[ ] Canonicals correct
[ ] Mobile usable
[ ] Core Web Vitals reviewed
[ ] Search queries reviewed
[ ] Coverage/indexing issues reviewed
```

---

# 48. AUTOMATED SEO AUDIT SCRIPT

Create:

`npm run seo:audit`

The audit should check the local production build and, when a public URL is available, optionally check the live site.

Checks:

### Metadata
- title exists
- title unique
- description exists
- description reasonable length
- one H1
- H1 not empty

### Canonical
- canonical exists
- canonical absolute
- canonical HTTPS
- canonical matches expected URL

### Robots
- robots.txt exists
- sitemap reference exists

### Sitemap
- sitemap exists
- valid XML
- no duplicates
- no query URLs
- no noindex URLs

### Links
- internal links are valid
- no obvious broken internal links
- important pages are reachable

### Images
- alt text
- dimensions
- large images

### Structured data
- JSON-LD parses
- no malformed JSON
- no duplicate conflicting schemas

### Indexing
- admin/login/search/filter pages correctly excluded

### Security
- no unsafe URL protocols
- no obvious open redirects
- no secrets in source

---

# 49. CI / BUILD GUARD

If the project uses GitHub Actions or another CI system, add an SEO validation step.

Example:

```text
npm run lint
npm run test
npm run build
npm run seo:data
npm run seo:sitemap
npm run seo:audit
```

A critical SEO validation failure should fail CI.

Do not make non-critical warnings fail the build.

---

# 50. AUTOMATED REGRESSION TESTS

Add tests for:

1. Homepage title
2. Homepage description
3. Homepage canonical
4. Category metadata
5. Website metadata
6. sitemap generation
7. robots.txt
8. duplicate URL prevention
9. slug generation
10. noindex behavior
11. 404 handling
12. internal links
13. structured data validity

---

# 51. SEO COMPONENT ARCHITECTURE

Create reusable components/helpers such as:

```text
SEOHead
Canonical
JsonLd
Breadcrumbs
OpenGraph
SitemapGenerator
RobotsGenerator
```

For React/Next.js/Astro/etc., use the framework's native metadata mechanism where possible.

Do not create multiple competing metadata systems.

---

# 52. CONTENT DATA MODEL

If the current data model is extensible, add fields like:

```ts
Website {
  id
  name
  slug
  url
  normalizedDomain
  categoryId
  description?
  logoUrl?
  region?
  language?
  features?
  tags?
  status?
  lastCheckedAt?
  createdAt
  updatedAt
  isFeatured
}
```

Only add fields compatible with the current architecture.

Do not perform destructive database migrations without checking existing production data.

---

# 53. ADMIN / CONTENT MANAGEMENT

If an admin panel exists, add fields for:

- description
- category
- slug
- featured
- status
- language
- region
- last checked
- SEO title override
- SEO description override
- indexable flag

Use defaults so existing records remain functional.

---

# 54. SEO OVERRIDES

Allow manual SEO overrides:

```ts
seoTitle?
seoDescription?
canonicalUrl?
noindex?
```

But validate them.

Manual overrides must not permit:
- javascript URLs
- arbitrary unsafe protocols
- invalid canonical domains

---

# 55. DUPLICATE CONTENT DETECTION

Create a simple content similarity check for:
- guide titles
- guide descriptions
- category descriptions

Flag near-duplicates.

Do not automatically delete content.

Generate:

`docs/CONTENT_DUPLICATE_REPORT.md`

---

# 56. SEARCH INDEX VS GOOGLE INDEX

Keep these separate.

AllSiteHub's internal search should search the database.

Google indexing should be controlled through:
- routes
- metadata
- canonicals
- robots
- noindex
- sitemap
- internal links

Do not expose internal search indexes as public SEO pages unless intentionally designed.

---

# 57. FOOTER NAVIGATION

Create useful crawlable footer links:

```text
Directory
Categories
Recent
Popular
Guides

Company
About
Contact
Editorial Policy

Legal
Privacy
Terms
DMCA
```

Only link to pages that actually exist.

---

# 58. ABOUT PAGE

Create:

`/about/`

Explain:
- what AllSiteHub does
- how listings are organized
- what users can expect
- whether AllSiteHub hosts content
- how listings are maintained
- how users can report problems

Do not make unsupported legal or safety guarantees.

---

# 59. EDITORIAL POLICY

Create:

`/editorial-policy/`

Document:
- listing criteria
- category rules
- featured rules
- status checking
- corrections
- removal requests
- how outdated listings are handled

This should reflect actual operations.

Do not publish a policy that the system does not follow.

---

# 60. CONTACT / REQUEST SITE

Preserve the existing Request Site functionality.

Make it accessible through:

`/contact/`
or
`/request-site/`

Validate submitted URLs.

Prevent:
- spam
- malicious URLs
- javascript URLs
- duplicate submissions
- obvious tracking junk

---

# 61. LEGAL / COPYRIGHT

Preserve the existing DMCA/copyright workflow if present.

Do not write legal guarantees.

Keep legal pages crawlable only if they are useful and legitimate.

---

# 62. HOMEPAGE CONTENT RECOMMENDATION

Use a natural structure similar to:

```text
H1:
Discover the Best Websites, Tools & Online Resources

Intro:
AllSiteHub helps you discover useful websites across the internet.
Explore curated resources by category and find websites for entertainment,
productivity, technology, education and more.

Categories

Popular Websites

Recently Added

Explore by Category

Useful Guides

Why AllSiteHub?

Frequently Asked Questions

Footer
```

Do not copy this literally if it conflicts with the existing design. Adapt it to the product.

---

# 63. FAQ

Only add FAQs when users genuinely benefit from them.

Examples:

- What is AllSiteHub?
- How are websites categorized?
- Does AllSiteHub host content?
- How can I suggest a website?
- How can I report a broken link?

Do not create FAQ schema solely to obtain search features.

---

# 64. DO NOT CREATE SEO SPAM

Never implement:

- hidden keyword text
- invisible links
- keyword stuffing
- doorway pages
- auto-generated city pages with no unique value
- fake reviews
- fake ratings
- fake user counts
- fake backlinks
- comment spam
- link farms
- copied articles
- mass AI pages with minimal changes
- cloaking
- deceptive redirects

---

# 65. CONTENT / COPYRIGHT POSITIONING

AllSiteHub is a directory/discovery platform.

Maintain clear wording that:
- AllSiteHub does not host third-party media
- external sites are third-party destinations
- users should evaluate external sites independently
- AllSiteHub's directory data should be accurate and maintained

Do not make blanket claims about the legality or safety of third-party websites.

---

# 66. PERFORMANCE BUDGET

Set practical budgets.

Example:

```text
Initial JS: keep as low as practical
Images: optimized and lazy loaded
Fonts: minimal
Third-party scripts: minimal
Layout shifts: avoid
```

Do not add unnecessary SEO plugins that increase page weight.

---

# 67. CACHE / REVALIDATION

For server-rendered or statically generated pages:

- cache stable category pages
- revalidate after data changes
- invalidate sitemap when URLs change
- invalidate relevant pages when a website record changes

Do not require rebuilding the entire application for every website addition if the framework supports incremental regeneration.

---

# 68. SEO WHEN A WEBSITE IS DELETED

If a listed website disappears:

1. Mark it inactive.
2. Remove it from sitemap.
3. Remove it from category listings.
4. Keep profile temporarily if useful.
5. Return 404/410 when appropriate.
6. Redirect only to a genuinely relevant replacement.

Do not redirect deleted websites randomly.

---

# 69. SEO WHEN A WEBSITE URL CHANGES

If a listing changes URL but remains the same service:

- preserve the AllSiteHub profile slug
- update destination URL
- update normalized domain
- update last checked
- update sitemap if needed

If the profile slug changes:
- 301 old profile URL → new profile URL.

---

# 70. DEPLOYMENT CHECKLIST

Before finalizing:

```text
[ ] npm install / package manager setup succeeds
[ ] lint succeeds
[ ] tests succeed
[ ] production build succeeds
[ ] sitemap generated
[ ] robots generated
[ ] no broken routes
[ ] no duplicate sitemap URLs
[ ] no malformed metadata
[ ] no malformed JSON-LD
[ ] no accidental noindex on important pages
[ ] no robots block on important pages
[ ] canonical URLs correct
[ ] mobile layout works
[ ] external links work
[ ] existing features still work
```

---

# 71. LIVE VALIDATION

If internet access is available to the agent:

Check:

```text
https://allsitehub.site/
https://allsitehub.site/robots.txt
https://allsitehub.site/sitemap.xml
```

Also test representative:
- category page
- website profile
- guide
- 404

Check HTTP status and rendered HTML.

Do not treat a successful HTTP 200 as proof that Google has indexed a page.

---

# 72. DOCUMENTATION TO CREATE

Create:

```text
docs/
  SEO_AUDIT_BEFORE.md
  SEO_IMPLEMENTATION.md
  SEO_GOOGLE_CHECKLIST.md
  GOOGLE_SEARCH_CONSOLE_SETUP.md
  DUPLICATE_DATA_REPORT.md
  CONTENT_DUPLICATE_REPORT.md
```

The implementation document should explain:
- what changed
- what files were changed
- what commands were added
- how to run SEO audits
- what still requires manual setup

---

# 73. FINAL OUTPUT FROM THE AGENT

When implementation is complete, report:

## Implemented
List actual changes.

## Routes added
List actual routes.

## Files changed
List files.

## Commands added
Example:

```text
npm run seo:audit
npm run seo:data
npm run seo:sitemap
```

## Validation
Report:
- build
- tests
- sitemap
- robots
- metadata
- structured data

## Manual steps remaining
Only list things the agent genuinely cannot do automatically, such as:
- Search Console ownership verification
- submitting sitemap through a user's Google account
- obtaining external API credentials

Do not say "SEO complete" if major work remains.

---

# 74. IMPORTANT EXECUTION BEHAVIOR

You are an implementation agent, not a consultant.

Therefore:

1. Inspect first.
2. Plan internally.
3. Modify the codebase.
4. Run tests/build.
5. Fix errors.
6. Validate the generated pages.
7. Produce documentation.
8. Give a concise completion report.

Do not stop after producing a plan.

Do not ask for permission for ordinary code changes that are explicitly requested in this document.

Ask only if:
- a destructive production-data migration is required
- credentials/secrets are required
- a major design-breaking change is unavoidable
- an ambiguous business/legal decision cannot be safely inferred

Otherwise make the safest reasonable implementation.

---

# 75. SUCCESS CRITERIA

The implementation is successful only when:

### Technical SEO
- clean crawlable routes
- canonical URLs
- valid robots.txt
- valid sitemap
- correct noindex rules
- correct redirects
- correct metadata
- structured data where appropriate

### Architecture
- category landing pages
- useful website profile pages
- guides
- internal linking
- breadcrumbs

### Quality
- no fake claims
- no fake metrics
- no mass thin pages
- no duplicate pages
- useful content

### Performance
- optimized images
- reduced unnecessary JavaScript
- mobile-friendly
- low layout shift

### Operations
- automated SEO audit
- automated data validation
- sitemap generation
- regression tests
- documentation

---

# 76. START NOW

Start by inspecting the repository and the currently deployed AllSiteHub implementation.

Do NOT replace the site with a new template.

Preserve the current design and functionality where practical.

Implement the SEO architecture progressively and safely.

After implementation, run all available validation commands and fix failures.

The final product should be a production-ready AllSiteHub directory with a scalable SEO architecture, not a collection of SEO tricks.
