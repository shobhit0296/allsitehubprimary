/**
 * Standalone Telegram Bot Runner (Long-polling mode for local development / testing)
 *
 * Usage:
 *   npx tsx scripts/telegram-bot.ts
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
  buildWelcomeMessage,
  buildInfoMessage,
  SITE_URL,
} from '../lib/telegram';

const token = process.env.TELEGRAM_BOT_TOKEN || '8973994330:AAExwIkVXfYYWyEFH-h82CEE-xMD02JB_os';

if (!token) {
  console.error('❌ Please set TELEGRAM_BOT_TOKEN in your environment or .env.local');
  process.exit(1);
}

let offset = 0;

async function pollUpdates() {
  console.log('🤖 AllSiteHub Telegram Bot starting in standalone polling mode (no Vercel)...');
  console.log(`🔗 Target Website: ${SITE_URL}`);

  // Automatically delete any registered webhook so polling works without 409 Conflict
  try {
    const delRes = await fetch(`https://api.telegram.org/bot${token}/deleteWebhook?drop_pending_updates=true`);
    const delData = await delRes.json();
    if (delData.ok) {
      console.log('✅ Webhook cleared successfully. Ready for long-polling.');
    }
  } catch (err) {
    console.warn('⚠️ Webhook clear warning (continuing):', err);
  }

  console.log('🚀 Bot is listening for joins and messages! (Press Ctrl+C to stop)\n');

  while (true) {
    try {
      const res = await fetch(
        `https://api.telegram.org/bot${token}/getUpdates?offset=${offset}&timeout=30`,
      );
      const data = (await res.json()) as { ok: boolean; result?: any[] };

      if (data.ok && Array.isArray(data.result)) {
        for (const update of data.result) {
          offset = update.update_id + 1;

          // 1a. Welcome new members (from message)
          if (update.message?.new_chat_members) {
            for (const member of update.message.new_chat_members) {
              if (member.is_bot) continue;
              console.log(`[${new Date().toLocaleTimeString()}] 👋 Welcoming new member (message): ${member.username ? '@' + member.username : member.first_name}`);
              const { text } = buildWelcomeMessage(member);
              await sendTelegramMessage(
                {
                  chat_id: update.message.chat.id,
                  text,
                  reply_to_message_id: update.message.message_id,
                },
                token,
              );
            }
          }

          // 1b. Welcome new members (from chat_member in supergroups)
          if (update.chat_member) {
            const { chat, old_chat_member, new_chat_member } = update.chat_member;
            const wasMember = ['member', 'administrator', 'creator'].includes(old_chat_member?.status);
            const isNowMember = ['member', 'administrator', 'restricted'].includes(new_chat_member?.status);
            if (!wasMember && isNowMember && new_chat_member?.user && !new_chat_member.user.is_bot) {
              const u = new_chat_member.user;
              console.log(`[${new Date().toLocaleTimeString()}] 👋 Welcoming new member (supergroup): ${u.username ? '@' + u.username : u.first_name}`);
              const { text } = buildWelcomeMessage(u);
              await sendTelegramMessage(
                {
                  chat_id: chat.id,
                  text,
                },
                token,
              );
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
      console.error('[Polling error]:', err);
      await new Promise(r => setTimeout(r, 3000));
    }
  }
}

pollUpdates();
