import { spawn } from 'child_process';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const args = [
  '--headless=new',
  '--dump-dom',
  '--virtual-time-budget=7000',
  '--no-sandbox',
  '--disable-gpu',
  'https://www.allsitehub.site'
];

const chrome = spawn(chromePath, args);
let html = '';

chrome.stdout.on('data', data => {
  html += data.toString();
});

chrome.stderr.on('data', data => {
  // console.error('stderr:', data.toString());
});

chrome.on('close', code => {
  console.log('Chrome exited with code:', code, 'HTML length:', html.length);
  const matches = html.match(/<[^>]*(clever|adscore|ads-core|top-scroll)[^>]*>/gi);
  console.log('Matches:', matches ? matches.slice(0, 10) : 'none');
  const iframes = html.match(/<iframe[^>]*>/gi);
  console.log('Iframes:', iframes ? iframes.slice(0, 10) : 'none');
});
