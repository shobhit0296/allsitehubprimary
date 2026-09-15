const { Redis } = require('@upstash/redis');
const bundledDbJson = require('../data/db.json');

const redis = new Redis({
  url: 'https://tight-katydid-177010.upstash.io',
  token: 'gQAAAAAAArNyAAIgcDI4NzA1NzRjMTUzMDI0MzRlYTgyZWJlMjhiNDk1NzAxNQ'
});

async function main() {
  const data = await redis.get('allsitehub:db');
  console.log('Redis sites count before:', data.sites?.length);
  console.log('Redis categories before:', data.categories);
  const bundled = bundledDbJson;
  console.log('Bundled sites count:', bundled.sites?.length);
  
  const defaultCats = [
    'Movies & Shows',
    'Anime',
    'Manga',
    'Live TV & Sports',
    'Paid',
    'Apps',
    'K Drama',
    'Download',
    'Games'
  ];

  for (const cat of defaultCats) {
    const hasSites = data.sites.some(s => s.category && s.category.toLowerCase() === cat.toLowerCase());
    console.log(`Cat "${cat}" in Redis data hasSites:`, hasSites);
    if (!hasSites) {
      const starterSitesForCat = bundled.sites.filter(s => s.category && s.category.toLowerCase() === cat.toLowerCase());
      console.log(`  Found starter sites for "${cat}":`, starterSitesForCat.length);
      for (const s of starterSitesForCat) {
        if (!data.sites.some(existing => existing.id === s.id || existing.domain === s.domain)) {
          data.sites.push(s);
        }
      }
    }
  }

  // Update categories
  data.categories = defaultCats;

  console.log('Final data categories:', data.categories);
  console.log('Final data sites count:', data.sites.length);

  // Write directly into Upstash Redis!
  await redis.set('allsitehub:db', data);
  await redis.set('tbcpl-app:db', data);
  console.log('Successfully written updated data with all 9 categories and starter sites into Upstash Redis!');
}
main().catch(console.error);
