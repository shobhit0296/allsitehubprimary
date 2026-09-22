export const TELEGRAM_BOT_TOKEN =
  process.env.TELEGRAM_BOT_TOKEN || '8741338089:AAHTpVcV1teL3c-XUMSOLJPX1FoadkPSoAg';
export const TELEGRAM_BOT_ID = Number(process.env.TELEGRAM_BOT_ID || '8741338089');
export const TELEGRAM_WEBHOOK_SECRET = process.env.TELEGRAM_SECRET_TOKEN || '';
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.allsitehub.site').replace(
  /^https?:\/\/allsitehub\.site/i,
  'https://www.allsitehub.site'
);
export const FREEWEBSTUFF_URL = 'https://freewebstuff.site/';
export const MOVIESNET_URL = 'https://moviesnet.site/';
export const DISCORD_URL = 'https://discord.gg/YERdvA6zb';
export const TELEGRAM_GROUP_URL = 'https://t.me/+gWOCVAqtcXxkZDk9';

import { Redis } from '@upstash/redis';

const DEFAULT_KV_URL = "https://tight-katydid-177010.upstash.io";
const DEFAULT_KV_TOKEN = "gQAAAAAAArNyAAIgcDI4NzA1NzRjMTUzMDI0MzRlYTgyZWJlMjhiNDk1NzAxNQ";
const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || DEFAULT_KV_URL;
const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || DEFAULT_KV_TOKEN;
export const telegramRedis = new Redis({ url: redisUrl, token: redisToken });

export async function logTelegramEvent(event: Record<string, any>) {
  try {
    const entry = JSON.stringify({
      time: new Date().toISOString(),
      ...event,
    });
    await telegramRedis.lpush('telegram:logs', entry);
    await telegramRedis.ltrim('telegram:logs', 0, 49); // Keep latest 50 events
  } catch (e) {
    console.warn('[Telegram Log Error]:', e);
  }
}

interface SendMessageOptions {
  chat_id: number | string;
  text: string;
  parse_mode?: 'HTML' | 'MarkdownV2' | 'Markdown';
  disable_web_page_preview?: boolean;
  reply_to_message_id?: number;
  reply_markup?: any;
}

/**
 * Send a message via Telegram Bot API
 */
export async function sendTelegramMessage(options: SendMessageOptions, token = TELEGRAM_BOT_TOKEN) {
  if (!token) {
    console.warn('[Telegram] No TELEGRAM_BOT_TOKEN configured.');
    await logTelegramEvent({ action: 'sendMessage_error', error: 'TELEGRAM_BOT_TOKEN is missing' });
    return { ok: false, description: 'TELEGRAM_BOT_TOKEN is missing' };
  }

  try {
    const payload: Record<string, any> = {
      chat_id: options.chat_id,
      text: options.text,
      parse_mode: options.parse_mode || 'HTML',
      link_preview_options: { is_disabled: options.disable_web_page_preview ?? true },
    };

    if (options.reply_markup) {
      payload.reply_markup = options.reply_markup;
    }

    // Telegram Bot API 7.0+: reply_parameters replaces reply_to_message_id.
    // Do NOT send both or Telegram will reject the call.
    if (options.reply_to_message_id) {
      payload.reply_parameters = {
        message_id: options.reply_to_message_id,
        allow_sending_without_reply: true,
      };
    }

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    await logTelegramEvent({
      action: 'sendMessage',
      chat_id: options.chat_id,
      ok: data.ok,
      error_code: data.error_code,
      description: data.description,
      message_id: data.result?.message_id,
    });

    if (!res.ok) {
      console.error('[Telegram] sendMessage failed:', data);
    }
    return data;
  } catch (error) {
    console.error('[Telegram] Error sending message:', error);
    await logTelegramEvent({ action: 'sendMessage_exception', error: String(error) });
    return { ok: false, error: String(error) };
  }
}

/**
 * Delete a message via Telegram Bot API
 */
export async function deleteTelegramMessage(chatId: number | string, messageId: number, token = TELEGRAM_BOT_TOKEN) {
  if (!token || !messageId) return { ok: false };
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/deleteMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
      }),
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.warn('[Telegram] Failed to delete message:', error);
    return { ok: false, error: String(error) };
  }
}

/**
 * Checks if a member was recently welcomed (within 10 seconds) to prevent double welcomes
 */
export async function isUserRecentlyWelcomed(chatId: number | string, userId: number | string): Promise<boolean> {
  const key = `telegram:welcomed:${chatId}:${userId}`;
  try {
    const exists = await telegramRedis.get(key);
    if (exists) return true;
    await telegramRedis.set(key, 1, { ex: 10 }); // 10s cooldown
    return false;
  } catch {
    return false;
  }
}

/**
 * Sends a welcome message to a new user and ensures no duplicate welcome is sent.
 * Note: Older messages are preserved and NEVER deleted.
 */
export async function sendWelcomeAndCleanupOld(
  chatId: number | string,
  user: { id: number; first_name?: string; username?: string },
  replyToMessageId?: number,
  token = TELEGRAM_BOT_TOKEN
) {
  // 1. Drop duplicate triggers (e.g. Telegram firing both 'message.new_chat_members' & 'chat_member' for same join)
  const alreadyWelcomed = await isUserRecentlyWelcomed(chatId, user.id);
  if (alreadyWelcomed) {
    console.log(`[Telegram] Skipped duplicate welcome for user ${user.id} in chat ${chatId}`);
    await logTelegramEvent({ action: 'welcome_skipped_duplicate', chat_id: chatId, user_id: user.id });
    return { ok: true, skipped_duplicate: true };
  }

  // 2. Send the newest welcome message (older messages are kept intact and not deleted)
  const { text } = buildWelcomeMessage(user);
  const result = await sendTelegramMessage(
    {
      chat_id: chatId,
      text,
      reply_to_message_id: replyToMessageId,
    },
    token
  );

  return result;
}

export const sendWelcomeMessage = sendWelcomeAndCleanupOld;

/**
 * Community inline buttons for Telegram
 */
export function getCommunityButtons() {
  return {
    inline_keyboard: [
      [
        { text: '🌐 AllSiteHub', url: `${SITE_URL}/` },
        { text: '🎁 FreeWebStuff', url: FREEWEBSTUFF_URL },
      ],
      [
        { text: '🎬 MoviesNet', url: MOVIESNET_URL },
        { text: '💬 Discord Server', url: DISCORD_URL },
      ],
      [
        { text: '👥 Official Telegram Group', url: TELEGRAM_GROUP_URL },
      ],
    ],
  };
}

/**
 * Build welcome message for new chat members (welcomes user with @username)
 */
export function buildWelcomeMessage(user: { id: number; first_name?: string; username?: string }) {
  const mention = user.username
    ? `@${user.username}`
    : `<a href="tg://user?id=${user.id}">${escapeHtml(user.first_name || 'Friend')}</a>`;

  const text = `
👋 <b>Welcome, ${mention}! Welcome to our community!</b>

🌐 <b>AllSiteHub • FreeWebStuff • MoviesNet</b>
💬 Join our Discord &amp; stay connected.

🔗 <a href="${SITE_URL}/">${SITE_URL}/</a>
🔗 <a href="${FREEWEBSTUFF_URL}">${FREEWEBSTUFF_URL}</a>
🔗 <a href="${MOVIESNET_URL}">${MOVIESNET_URL}</a>
💬 <a href="${DISCORD_URL}">${DISCORD_URL}</a>

🚀 <i>Explore. Discover. Enjoy.</i>
`.trim();

  return { text };
}

/**
 * Build general info message (for direct messages, pure text with links)
 */
export function buildInfoMessage() {
  const text = `
👋 <b>Welcome to our community!</b>

🌐 <b>AllSiteHub • FreeWebStuff • MoviesNet</b>
💬 Join our Discord &amp; stay connected.

🔗 <a href="${SITE_URL}/">${SITE_URL}/</a>
🔗 <a href="${FREEWEBSTUFF_URL}">${FREEWEBSTUFF_URL}</a>
🔗 <a href="${MOVIESNET_URL}">${MOVIESNET_URL}</a>
💬 <a href="${DISCORD_URL}">${DISCORD_URL}</a>

🚀 <i>Explore. Discover. Enjoy.</i>
`.trim();

  return { text };
}

/**
 * Escapes HTML characters for Telegram HTML parse_mode
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
