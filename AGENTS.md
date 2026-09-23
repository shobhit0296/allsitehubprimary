<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# CRITICAL POLICY: NEVER CHANGE OR REMOVE CATEGORY (PROTECTED AD ASSETS)
The following advertising networks, scripts, and banner placements are strictly protected and MUST NEVER be modified, suppressed, or removed under any circumstance:

1. **Stake Official Banner & Loader**:
   - Script ID: `#AdsCoreLoader106969`
   - Script Source: `https://sads.adsboosters.xyz/7d5d63b1d7a48601a1a774c8e8d4a88a.js`
   - Required Banner Placement: `<div class="ads-core-ads" />`
   - Status: PERMANENT & ALWAYS ACTIVE. Default native settings to maximize daily impressions.

3. **Monetag MultiTag**:
   - Script ID: `#monetag-tag`, data-zone `282088`
   - Script Source: `https://quge5.com/88/tag.min.js`
   - Guard: `#monetag-guard` (selectively filters out only the mid-screen In-Page Push modal while preserving all monetization).
   - Formats: OnClick (Popunder), Push Notifications, Vignette.
   - Status: PERMANENT & ALWAYS ACTIVE.

4. **Adsterra Ads**:
   - Popunder Redirection: `#adsterra-popunder` (`https://bibleearthquake.com/af/43/a8/af43a8a497a35fa461a277ea55d8898a.js`).
   - Native Banner Cards: `NativeAdCard` (`container-36a34e7c2d7095493196dd10bc56ad23`).
   - Status: ALWAYS ACTIVE on public routes.

# CRITICAL DEPLOYMENT POLICY: STRICT VERCEL & GITHUB TARGETING
This codebase (`AllSiteHub`) must ONLY ever be pushed and deployed to the following designated Git repository and Vercel project, even if you or the user log into other Vercel or GitHub accounts:

- **GitHub Remote (`origin`)**: `https://github.com/shobhit0296/allsitehubprimary.git` (branch: `main`)
- **Vercel Project ID**: `prj_v8mQeRCioyLViMYBiLOLJ31j6RpF`
- **Vercel Team/Org ID**: `team_nd7r69HKQeVvjuTywupQEJ5x`
- **Vercel Project Name**: `allsitehub`
- **Production Domain**: `https://www.allsitehub.site/`
- **Deployment Process**: Always use `npm run deploy` / `npm run live`. It reads the explicit `VERCEL_TOKEN` configured in `.env.local` so it is locked to this exact project and will never push to or overwrite any other Vercel account or project.


