import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8');
const match = env.match(/CLOUDFLARE_API_TOKEN=([^\r\n]+)/);
const token = match ? match[1].replace(/["']/g, '').trim() : '';
const zoneId = 'cd22aaa61fd8b649cb501d06c9ac1fc3';

if (!token) {
  console.log('No token found in .env.local');
  process.exit(1);
}

const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ purge_everything: true })
});

const data = await res.json();
console.log('Cloudflare purge result:', data.success ? 'SUCCESS' : data);
