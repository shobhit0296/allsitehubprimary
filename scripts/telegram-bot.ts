/**
 * Standalone Telegram Bot Runner (Long-polling mode for local development / testing)
 *
 * Usage:
 *   npx tsx scripts/telegram-bot.ts
 */
import {
  sendTelegramMessage,
  buildWelcomeMessage,
  buildStartMessage,
  buildRulesMessage,
  SITE_URL,
} from '../lib/telegram';

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error('❌ Please set TELEGRAM_BOT_TOKEN in your environment or .env.local');
  process.exit(1);
}

let offset = 0;

async function pollUpdates() {
  console.log(`🤖 AllSiteHub Telegram Bot is running in polling mode...`);
  console.log(`🔗 Target Website: ${SITE_URL}`);

  while (true) {
    try {
      const res = await fetch(
        `https://api.telegram.org/bot${token}/getUpdates?offset=${offset}&timeout=30`,
      );
      const data = (await res.json()) as { ok: boolean; result?: any[] };

      if (data.ok && Array.isArray(data.result)) {
        for (const update of data.result) {
          offset = update.update_id + 1;

          // 1. Welcome new members
          if (update.message?.new_chat_members) {
            for (const member of update.message.new_chat_members) {
              const { text, keyboard } = buildWelcomeMessage(member);
              await sendTelegramMessage(
                {
                  chat_id: update.message.chat.id,
                  text,
                  reply_markup: keyboard,
                  reply_to_message_id: update.message.message_id,
                },
                token,
              );
            }
          }

          // 2. Commands
          if (update.message?.text) {
            const rawText = update.message.text.trim();
            const parts = rawText.split(/\s+/);
            const cmd = parts[0].toLowerCase().split('@')[0];

            if (cmd === '/start') {
              const { text, keyboard } = buildStartMessage();
              await sendTelegramMessage(
                {
                  chat_id: update.message.chat.id,
                  text,
                  reply_markup: keyboard,
                  reply_to_message_id: update.message.message_id,
                },
                token,
              );
            } else if (cmd === '/rules') {
              const { text, keyboard } = buildRulesMessage();
              await sendTelegramMessage(
                {
                  chat_id: update.message.chat.id,
                  text,
                  reply_markup: keyboard,
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
