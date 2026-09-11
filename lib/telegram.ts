export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
export const TELEGRAM_WEBHOOK_SECRET = process.env.TELEGRAM_SECRET_TOKEN || '';
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.allsitehub.site').replace(
  /^https?:\/\/allsitehub\.site/i,
  'https://www.allsitehub.site'
);
export const FREEWEBSTUFF_URL = 'https://freewebstuff.site/';
export const MOVIESNET_URL = 'https://moviesnet.site/';
export const DISCORD_URL = 'https://discord.gg/YERdvA6zb';
export const TELEGRAM_GROUP_URL = 'https://t.me/+gWOCVAqtcXxkZDk9';

interface SendMessageOptions {
  chat_id: number | string;
  text: string;
  parse_mode?: 'HTML' | 'MarkdownV2' | 'Markdown';
  disable_web_page_preview?: boolean;
  reply_to_message_id?: number;
}

/**
 * Send a message via Telegram Bot API
 */
export async function sendTelegramMessage(options: SendMessageOptions, token = TELEGRAM_BOT_TOKEN) {
  if (!token) {
    console.warn('[Telegram] No TELEGRAM_BOT_TOKEN configured.');
    return { ok: false, description: 'TELEGRAM_BOT_TOKEN is missing' };
  }

  try {
    const payload: Record<string, any> = {
      chat_id: options.chat_id,
      text: options.text,
      parse_mode: options.parse_mode || 'HTML',
      disable_web_page_preview: options.disable_web_page_preview ?? true,
      link_preview_options: { is_disabled: options.disable_web_page_preview ?? true },
    };

    if (options.reply_to_message_id) {
      payload.reply_to_message_id = options.reply_to_message_id;
      payload.allow_sending_without_reply = true;
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
    if (!res.ok) {
      console.error('[Telegram] sendMessage failed:', data);
    }
    return data;
  } catch (error) {
    console.error('[Telegram] Error sending message:', error);
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

// In-memory state tracking to prevent duplicate welcomes and store last message ID per chat
const recentWelcomes = new Map<string, number>();
const lastWelcomeMessageByChat = new Map<string, number>();

/**
 * Checks if a member was recently welcomed (within 60 seconds) to prevent double welcomes
 */
export function isUserRecentlyWelcomed(chatId: number | string, userId: number | string): boolean {
  const key = `${chatId}:${userId}`;
  const now = Date.now();
  const prevTime = recentWelcomes.get(key) || 0;

  if (now - prevTime < 60000) {
    return true; // Already welcomed recently, skip duplicate!
  }

  recentWelcomes.set(key, now);

  // Periodic cleanup of keys older than 5 minutes
  if (recentWelcomes.size > 200) {
    for (const [k, time] of recentWelcomes.entries()) {
      if (now - time > 300000) {
        recentWelcomes.delete(k);
      }
    }
  }

  return false;
}

/**
 * Sends a welcome message to a new user, ensures no second/duplicate message is sent,
 * and automatically deletes the previous welcome message so only the newest one remains!
 */
export async function sendWelcomeAndCleanupOld(
  chatId: number | string,
  user: { id: number; first_name?: string; username?: string },
  replyToMessageId?: number,
  token = TELEGRAM_BOT_TOKEN
) {
  // 1. Drop duplicate triggers (e.g. Telegram firing both 'message.new_chat_members' & 'chat_member')
  if (isUserRecentlyWelcomed(chatId, user.id)) {
    console.log(`[Telegram] Skipped duplicate welcome for user ${user.id} in chat ${chatId}`);
    return { ok: true, skipped_duplicate: true };
  }

  // 2. Delete the old welcome message in this chat so only the newest one stays
  const chatKey = String(chatId);
  const oldMessageId = lastWelcomeMessageByChat.get(chatKey);
  if (oldMessageId) {
    try {
      await deleteTelegramMessage(chatId, oldMessageId, token);
      console.log(`[Telegram] Removed previous welcome message #${oldMessageId} from chat ${chatId}`);
    } catch (err) {
      console.warn(`[Telegram] Could not delete old welcome message #${oldMessageId}:`, err);
    }
  }

  // 3. Send the newest welcome message
  const { text } = buildWelcomeMessage(user);
  const result = await sendTelegramMessage(
    {
      chat_id: chatId,
      text,
      reply_to_message_id: replyToMessageId,
    },
    token
  );

  // 4. Save new message ID so it can be cleaned up when the next member arrives
  if (result?.ok && result?.result?.message_id) {
    lastWelcomeMessageByChat.set(chatKey, result.result.message_id);
  }

  return result;
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
