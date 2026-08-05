# tbcpl

Next.js site with an `/admin` panel for managing listed sites, categories, and regions.

## Local development

```bash
npm install
npm run dev
```

Without any env vars set, data is read from and written to `data/db.json` on disk. This is fine locally but does **not** work on Vercel (see below).

## Deploying to Vercel

The app itself is a standard Next.js Pages Router project and deploys to Vercel with no config changes. The one thing to set up first is persistence for the admin panel:

1. Push this repo to GitHub/GitLab/Bitbucket and import it in Vercel, or run `vercel` from this directory.
2. In the Vercel project, add a Redis store (Storage tab -> Marketplace -> Upstash, or connect one you created directly at upstash.com) and connect it to the project. This injects `KV_REST_API_URL` / `KV_REST_API_TOKEN` (or `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`) as env vars automatically.
3. Redeploy. Once those env vars are present, `lib/data.js` persists reads/writes to Redis instead of the local filesystem.

Without step 2, the site's public pages still work (they only read data, and the deployment ships `data/db.json` as a read fallback), but admin edits (add/edit/delete a site, category, or region) will fail on Vercel because serverless functions there have a read-only filesystem outside `/tmp`.

See `.env.local.example` for the env var names.
