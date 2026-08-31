const https = require('https');

const token = process.env.CLOUDFLARE_API_TOKEN || '';
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || '3e586fc087677eb6c6c17d5b27a35a40';

function cfFetch(urlPath) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.cloudflare.com',
      path: '/client/v4' + urlPath,
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  console.log('--- 1. Check Zone ---');
  const zonesRes = await cfFetch('/zones?name=allsitehub.site');
  console.log('Zones result:', JSON.stringify(zonesRes.result, null, 2));

  if (zonesRes.result && zonesRes.result.length > 0) {
    const zone = zonesRes.result[0];
    const zoneId = zone.id;
    console.log('\n--- 2. Nameservers ---');
    console.log('Cloudflare Nameservers for zone:', zone.name_servers);
    console.log('Zone Status:', zone.status); // active, pending, etc.

    console.log('\n--- 3. DNS Records ---');
    const dnsRes = await cfFetch(`/zones/${zoneId}/dns_records`);
    console.log('DNS records:', dnsRes.result ? dnsRes.result.map(r => ({ type: r.type, name: r.name, content: r.content, proxied: r.proxied })) : dnsRes);

    console.log('\n--- 4. SSL Mode ---');
    const sslRes = await cfFetch(`/zones/${zoneId}/settings/ssl`);
    console.log('SSL Mode:', sslRes.result);
  }

  console.log('\n--- 5. Worker Custom Domains ---');
  const workerDomains = await cfFetch(`/accounts/${accountId}/workers/domains`);
  console.log('Worker Domains:', JSON.stringify(workerDomains.result, null, 2));

  console.log('\n--- 6. Worker Routes ---');
  if (zonesRes.result && zonesRes.result.length > 0) {
    const zoneId = zonesRes.result[0].id;
    const routesRes = await cfFetch(`/zones/${zoneId}/workers/routes`);
    console.log('Worker Routes:', JSON.stringify(routesRes.result, null, 2));
  }
}

run().catch(console.error);
