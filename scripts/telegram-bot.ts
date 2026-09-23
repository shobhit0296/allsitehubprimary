/**
 * Standalone Telegram Bot Manager & Runner
 *
 * Usage:
 *   npm run bot                  (Checks status and ensures production webhook is active)
 *   npm run bot -- --restore     (Forces re-registration of live production webhook)
 *   npm run bot -- --poll        (Runs local long-polling for temporary dev testing)
 */
import fs from 'fs';
import path from 'path';

// Automatically load .env.local if present
try {
  const envPath = path.resolve(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
} catch {
  // Ignore env reading errors
}

import {
  sendTelegramMessage,
  sendWelcomeAndCleanupOld,
  buildWelcomeMessage,
  buildInfoMessage,
  SITE_URL,
  TELEGRAM_BOT_TOKEN,
  ensureTelegramWebhookActive,
} from '../lib/telegram';

const token = process.env.TELEGRAM_BOT_TOKEN || TELEGRAM_BOT_TOKEN || '8741338089:AAHTpVcV1teL3c-XUMSOLJPX1FoadkPSoAg';

if (!token) {
  console.error('❌ Please set TELEGRAM_BOT_TOKEN in your environment or .env.local');
  process.exit(1);
}

const args = process.argv.slice(2);
const isPollMode = args.includes('--poll') || args.includes('-p');
const isRestoreMode = args.includes('--restore') || args.includes('-r');
const isStatusMode = args.includes('--status') || args.includes('-s');

const targetWebhookUrl = `${SITE_URL}/api/telegram/webhook`.replace(/^https?:\/\/allsitehub\.site/i, 'https://www.allsitehub.site');

async function restoreWebhook(): Promise<boolean> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: targetWebhookUrl,
        allowed_updates: ['message', 'callback_query', 'chat_member', 'my_chat_member', 'chat_join_request'],
        drop_pending_updates: false,
      }),
    });
    const data = await res.json();
    return !!data.ok;
  } catch {
    return false;
  }
}

async function getWebhookStatus() {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
    const data = await res.json();
    return data.result || null;
  } catch {
    return null;
  }
}

async function checkAndDisplayStatus() {
  console.log('\n==============================================================');
  console.log('🤖 ALLSITEHUB TELEGRAM BOT - PRODUCTION STATUS');
  console.log('==============================================================');

  const info = await getWebhookStatus();
  const currentUrl = info?.url || '';

  if (currentUrl && currentUrl.includes('/api/telegram/webhook')) {
    console.log(`🌐 Production Webhook: ${currentUrl}`);
    console.log(`📡 Status:            \x1b[32mACTIVE & HEALTHY\x1b[0m`);
    console.log(`📨 Pending Updates:   ${info?.pending_update_count ?? 0}`);
    console.log(`🔍 Last Error:        ${info?.last_error_message || 'None (all good)'}`);
  } else {
    console.log(`⚠️  Current Webhook:    ${currentUrl ? currentUrl : '\x1b[31mNONE (INACTIVE)\x1b[0m'}`);
    console.log('🔄 Restoring live production webhook now...');
    const restored = await restoreWebhook();
    if (restored) {
      console.log(`✅ \x1b[32mSUCCESS: Webhook restored to ${targetWebhookUrl}\x1b[0m`);
    } else {
      console.log('❌ Failed to restore webhook. Please check network/token.');
    }
  }

  console.log('--------------------------------------------------------------');
  console.log('💡 IMPORTANT NOTE:');
  console.log('   The AllSiteHub Welcome Bot is hosted 100% on the cloud (Vercel).');
  console.log('   You do NOT need to keep this terminal or your PC running!');
  console.log('   New members are automatically welcomed 24/7 via the live webhook.');
  console.log('--------------------------------------------------------------');
  console.log('Available Commands:');
  console.log('   npm run bot                -> Verify live status & auto-heal');
  console.log('   npm run bot -- --restore   -> Force re-register production webhook');
  console.log('   npm run bot -- --poll      -> Run local polling (dev/testing only)');
  console.log('==============================================================\n');
}

if (isRestoreMode) {
  console.log(`🔄 Force restoring production webhook to: ${targetWebhookUrl}...`);
  restoreWebhook().then(ok => {
    if (ok) {
      console.log('✅ Webhook restored successfully!');
      process.exit(0);
    } else {
      console.error('❌ Failed to restore webhook.');
      process.exit(1);
    }
  });
} else if (!isPollMode) {
  // Default mode: Check status, ensure active, display helpful info
  checkAndDisplayStatus().then(() => {
    process.exit(0);
  });
} else {
  // Explicit --poll mode for temporary local testing
  let offset = 0;
  let isShuttingDown = false;

  async function cleanupAndExit() {
    if (isShuttingDown) return;
    isShuttingDown = true;
    console.log('\n🛑 Stopping local polling and restoring live production webhook...');
    const ok = await restoreWebhook();
    if (ok) {
      console.log(`✅ Live webhook successfully restored to: ${targetWebhookUrl}`);
    } else {
      console.warn('⚠️ Could not restore webhook automatically. Run: npm run bot -- --restore');
    }
    process.exit(0);
  }

  process.on('SIGINT', cleanupAndExit);
  process.on('SIGTERM', cleanupAndExit);
  process.on('beforeExit', cleanupAndExit);

  async function pollUpdates() {
    console.log('⚠️  NOTE: Running in local polling mode. The production webhook is paused.');
    console.log('   When done, press Ctrl+C to automatically restore the live webhook.\n');
    console.log('🤖 AllSiteHub Telegram Bot starting in local test mode...');
    console.log(`🔗 Target Website: ${SITE_URL}`);

    try {
      await fetch(`https://api.telegram.org/bot${token}/deleteWebhook?drop_pending_updates=false`);
      console.log('✅ Webhook temporarily paused for local polling.');
    } catch (err) {
      console.warn('⚠️ Webhook pause warning:', err);
    }

    console.log('🚀 Listening for new joins and commands (Press Ctrl+C to stop)...\n');

    while (!isShuttingDown) {
      try {
        const res = await fetch(
          `https://api.telegram.org/bot${token}/getUpdates?offset=${offset}&timeout=30`,
        );
        const data = (await res.json()) as { ok: boolean; result?: any[] };

        if (data.ok && Array.isArray(data.result)) {
          for (const update of data.result) {
            offset = update.update_id + 1;

            // 1a. Welcome new members (message)
            if (update.message?.new_chat_members) {
              for (const member of update.message.new_chat_members) {
                if (member.is_bot) continue;
                console.log(`[${new Date().toLocaleTimeString()}] 👋 Welcoming new member (message): ${member.username ? '@' + member.username : member.first_name}`);
                await sendWelcomeAndCleanupOld(update.message.chat.id, member, update.message.message_id, token);
              }
            }

            // 1b. Welcome new members (supergroup chat_member)
            if (update.chat_member) {
              const { chat, old_chat_member, new_chat_member } = update.chat_member;
              const wasMember = ['member', 'administrator', 'creator'].includes(old_chat_member?.status);
              const isNowMember = ['member', 'administrator', 'restricted'].includes(new_chat_member?.status);
              if (!wasMember && isNowMember && new_chat_member?.user && !new_chat_member.user.is_bot) {
                const u = new_chat_member.user;
                console.log(`[${new Date().toLocaleTimeString()}] 👋 Welcoming new member (supergroup): ${u.username ? '@' + u.username : u.first_name}`);
                await sendWelcomeAndCleanupOld(chat.id, u, undefined, token);
              }
            }

            // 2. Direct Messages & Group Commands
            if (update.message?.text) {
              const isPrivate = update.message.chat.type === 'private';
              const text = update.message.text.trim().toLowerCase();
              const isBotCommand =
                text.startsWith('/start') ||
                text.startsWith('/help') ||
                text.startsWith('/links') ||
                text.startsWith('/sites') ||
                text.startsWith('/info') ||
                text.startsWith('/about') ||
                text.startsWith('/community') ||
                text.includes('@allsitehubsute_bot') ||
                text.includes('@allsitehub_bot');

              if (isPrivate || isBotCommand) {
                console.log(`[${new Date().toLocaleTimeString()}] 💬 Responding to command "${update.message.text}" in ${update.message.chat.type} chat (${update.message.chat.id})`);
                const { text: replyText } = buildInfoMessage();
                await sendTelegramMessage(
                  {
                    chat_id: update.message.chat.id,
                    text: replyText,
                    reply_to_message_id: update.message.message_id,
                  },
                  token,
                );
              }
            }
          }
        }
      } catch (err) {
        if (!isShuttingDown) {
          console.error('[Polling error]:', err);
          await new Promise(r => setTimeout(r, 3000));
        }
      }
    }
  }

  pollUpdates();
}
