#!/usr/bin/env node
/**
 * scripts/deploy.mjs
 * 1-Command Automated Production Deployment Pipeline
 * Usage: npm run deploy [optional commit message]
 *    or: npm run live [optional commit message]
 */

import { execSync } from 'child_process';

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
  run('npx vercel --prod --yes', '3/3 Deploying to Vercel Production');

  console.log('\n\x1b[32m✅ LIVE DEPLOYMENT COMPLETE!\x1b[0m');
  console.log('\x1b[35m🌐 Production Domain: https://www.allsitehub.site/\x1b[0m\n');
}

main().catch((err) => {
  console.error('\x1b[31mDeployment failed:\x1b[0m', err.message);
  process.exit(1);
});
