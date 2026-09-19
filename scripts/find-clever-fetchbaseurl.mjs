import fetch from 'node-fetch';

async function check() {
  const res = await fetch('https://scripts.cleverwebserver.com/77d8d82dadf46681086f15ed2ce5ab08.js');
  const text = await res.text();
  let pos = 0;
  while ((pos = text.indexOf('fetchBaseUrl', pos)) !== -1) {
    console.log('Pos:', pos);
    console.log(text.slice(Math.max(0, pos - 100), Math.min(text.length, pos + 250)));
    pos += 14;
  }
}

check().catch(console.error);
