import https from 'https';

function fetchText(url, redirects = 0) {
  if (redirects > 5) return Promise.resolve('');
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const nextUrl = new URL(res.headers.location, url).toString();
        return resolve(fetchText(nextUrl, redirects + 1));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', () => resolve(''));
  });
}

async function auditPage(name, url) {
  const html = await fetchText(url);
  const title = (html.match(/<title>([^<]*)<\/title>/i) || [])[1] || 'None';
  const desc = (html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) || [])[1] || 'None';
  const canonical = (html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i) || [])[1] || 'None';
  
  const schemas = [];
  const regex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    try {
      schemas.push(JSON.parse(match[1]));
    } catch (e) {
      schemas.push({ parseError: true });
    }
  }

  console.log(`=== ${name} (${url}) ===`);
  console.log(`Title:       ${title}`);
  console.log(`Description: ${desc.slice(0, 90)}${desc.length > 90 ? '...' : ''}`);
  console.log(`Canonical:   ${canonical}`);
  console.log(`Schema Count:${schemas.length}`);
  schemas.forEach((s, idx) => {
    console.log(`  [Schema ${idx + 1}] Type: ${s['@type'] || 'Unknown'}, Name: ${s.name || s.headline || 'N/A'}`);
  });
  console.log();
}

async function run() {
  const BASE = 'https://www.allsitehub.site';
  await auditPage('Home Page', `${BASE}/`);
  await auditPage('Recently Added', `${BASE}/recent`);
  await auditPage('Category Page', `${BASE}/category/movies-and-shows`);
  await auditPage('Collections Directory', `${BASE}/collections`);
  await auditPage('Collection Article', `${BASE}/collections/best-ai-websites`);
  await auditPage('Site Detail Page', `${BASE}/site/pantyflix`);
  await auditPage('Privacy Policy', `${BASE}/privacy`);
  await auditPage('Terms of Service', `${BASE}/terms`);

  console.log('=== Sitemap & Robots ===');
  const robots = await fetchText(`${BASE}/robots.txt`);
  const sitemap = await fetchText(`${BASE}/sitemap.xml`);
  console.log('Robots.txt contains Sitemap link:', robots.includes('sitemap.xml'));
  console.log('Sitemap URLs total count:', (sitemap.match(/<url>/g) || []).length);
}

run();
