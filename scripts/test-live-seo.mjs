import https from 'https';

function fetchText(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
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
  console.log(`Description: ${desc}`);
  console.log(`Canonical:   ${canonical}`);
  console.log(`Schema Count:${schemas.length}`);
  schemas.forEach((s, idx) => {
    console.log(`  [Schema ${idx + 1}] Type: ${s['@type'] || 'Unknown'}, Name: ${s.name || s.headline || 'N/A'}`);
  });
  console.log();
}

async function run() {
  await auditPage('Home Page', 'https://allsitehub.site');
  await auditPage('Category Page', 'https://allsitehub.site/category/movies-and-shows');
  await auditPage('Collections Directory', 'https://allsitehub.site/collections');
  await auditPage('Collection Article', 'https://allsitehub.site/collections/best-ai-websites');
  await auditPage('Site Detail Page', 'https://allsitehub.site/site/pantyflix');

  console.log('=== Sitemap & Robots ===');
  const robots = await fetchText('https://allsitehub.site/robots.txt');
  const sitemap = await fetchText('https://allsitehub.site/sitemap.xml');
  console.log('Robots.txt contains Sitemap link:', robots.includes('sitemap.xml'));
  console.log('Sitemap URLs total count:', (sitemap.match(/<url>/g) || []).length);
}

run();
