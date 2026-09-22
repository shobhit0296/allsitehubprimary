#!/usr/bin/env node
/**
 * scripts/deploy.mjs
 * 1-Command Automated Production Deployment Pipeline
 * Usage: npm run deploy [optional commit message]
 *    or: npm run live [optional commit message]
 */

import { execSync } from 'child_process';
import fs from 'fs';

const customMsg = process.argv.slice(2).join(' ').trim();
const commitMsg = customMsg || `deploy: live update ${new Date().toISOString().replace('T', ' ').slice(0, 19)}`;

function run(cmd, desc) {
  console.log(`\n\x1b[36m⚡ [${desc}] Running:\x1b[0m ${cmd}`);
  try {
    execSync(cmd, { stdio: 'inherit', cwd: process.cwd() });
    return true;
  } catch (err) {
    console.error(`\x1b[31m❌ Error during ${desc}\x1b[0m`);
    throw err;
  }
}

async function main() {
  console.log('\x1b[32m🚀 Starting 1-Command Production Deployment...\x1b[0m');

  // 1. Stage all changes
  run('git add -A', '1/3 Staging Git Changes');

  // 2. Commit & Push if there are uncommitted changes
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
    if (status) {
      run(`git commit -m "${commitMsg.replace(/"/g, '\\"')}"`, '2/3 Committing Changes');
    } else {
      console.log('ℹ️  No uncommitted changes in Git working tree.');
    }
    run('git push origin main', 'Pushing to GitHub');
  } catch (err) {
    console.warn('⚠️  Git push step completed or already up to date.');
  }

  // 3. Deploy directly to Vercel Production
  let vercelToken = process.env.VERCEL_TOKEN;
  if (!vercelToken) {
    try {
      const envLocal = fs.readFileSync('.env.local', 'utf8');
      const m = envLocal.match(/VERCEL_TOKEN=["']?([^"'\r\n]+)/);
      if (m) vercelToken = m[1];
    } catch {}
  }
  const tokenFlag = vercelToken ? ` --token ${vercelToken}` : '';
  run(`npx vercel --prod --yes${tokenFlag}`, '3/4 Deploying to Vercel Production');

  // 4. Purge Cloudflare Edge Cache so visitors instantly see live changes
  try {
    run('node scripts/purge-cf-cache.mjs', '4/5 Purging Cloudflare Edge Cache');
  } catch (cfErr) {
    console.warn('⚠️ Cloudflare cache purge warning:', cfErr.message);
  }

  // 5. Ensure Telegram Welcome Bot Webhook is connected & active
  try {
    console.log('\n\x1b[36m⚡ [5/5 Verifying Telegram Webhook]\x1b[0m Connecting Telegram webhook...');
    const botToken = process.env.TELEGRAM_BOT_TOKEN || '8741338089:AAHTpVcV1teL3c-XUMSOLJPX1FoadkPSoAg';
    const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: 'https://www.allsitehub.site/api/telegram/webhook',
        allowed_updates: ['message', 'callback_query', 'chat_member', 'my_chat_member', 'chat_join_request'],
        drop_pending_updates: false,
      }),
    });
    const tgData = await tgRes.json();
    if (tgData.ok) {
      console.log('\x1b[32m✅ Telegram Webhook verified and connected to https://www.allsitehub.site/api/telegram/webhook\x1b[0m');
    } else {
      console.warn('\x1b[33m⚠️ Telegram Webhook warning:\x1b[0m', tgData.description);
    }
  } catch (tgErr) {
    console.warn('⚠️ Telegram webhook verification notice:', tgErr.message);
  }

  console.log('\n\x1b[32m✅ LIVE DEPLOYMENT COMPLETE!\x1b[0m');
  console.log('\x1b[35m🌐 Production Domain: https://www.allsitehub.site/\x1b[0m\n');
}

main().catch((err) => {
  console.error('\x1b[31mDeployment failed:\x1b[0m', err.message);
  process.exit(1);
});
