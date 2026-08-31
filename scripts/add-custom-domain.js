const https = require('https');

const token = process.env.CLOUDFLARE_API_TOKEN || '';
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || '3e586fc087677eb6c6c17d5b27a35a40';
const zoneId = process.env.CLOUDFLARE_ZONE_ID || 'cd22aaa61fd8b649cb501d06c9ac1fc3';

function cfPost(path, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const req = https.request({
      hostname: 'api.cloudflare.com',
      path: '/client/v4' + path,
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
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
    req.write(payload);
    req.end();
  });
}

async function run() {
  console.log('--- Adding Worker Custom Domain for allsitehub.site ---');
  const res1 = await cfPost(`/accounts/${accountId}/workers/domains`, {
    environment: 'production',
    hostname: 'allsitehub.site',
    service: 'allsitehub',
    zone_id: zoneId
  });
  console.log('Result for allsitehub.site:', JSON.stringify(res1, null, 2));

  console.log('--- Adding Worker Custom Domain for www.allsitehub.site ---');
  const res2 = await cfPost(`/accounts/${accountId}/workers/domains`, {
    environment: 'production',
    hostname: 'www.allsitehub.site',
    service: 'allsitehub',
    zone_id: zoneId
  });
  console.log('Result for www.allsitehub.site:', JSON.stringify(res2, null, 2));
}

run().catch(console.error);
