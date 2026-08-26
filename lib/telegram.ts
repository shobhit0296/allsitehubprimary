export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
export const TELEGRAM_WEBHOOK_SECRET = process.env.TELEGRAM_SECRET_TOKEN || '';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://allsitehub.site';

interface InlineKeyboardButton {
  text: string;
  url?: string;
  callback_data?: string;
}

interface InlineKeyboardMarkup {
  inline_keyboard: InlineKeyboardButton[][];
}

interface SendMessageOptions {
  chat_id: number | string;
  text: string;
  parse_mode?: 'HTML' | 'MarkdownV2' | 'Markdown';
  reply_markup?: InlineKeyboardMarkup;
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
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: options.chat_id,
        text: options.text,
        parse_mode: options.parse_mode || 'HTML',
        reply_markup: options.reply_markup,
        disable_web_page_preview: options.disable_web_page_preview ?? false,
        reply_to_message_id: options.reply_to_message_id,
      }),
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
 * Answer callback query for interactive buttons
 */
export async function answerCallbackQuery(
  callback_query_id: string,
  text?: string,
  show_alert = false,
  token = TELEGRAM_BOT_TOKEN,
) {
  if (!token) return { ok: false };
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id,
        text,
        show_alert,
      }),
    });
    return await res.json();
  } catch (err) {
    console.error('[Telegram] answerCallbackQuery failed:', err);
    return { ok: false };
  }
}

/**
 * Build welcome message for new chat members
 */
export function buildWelcomeMessage(user: { id: number; first_name?: string; username?: string }) {
  const mention = user.username
    ? `@${user.username}`
    : `<a href="tg://user?id=${user.id}">${escapeHtml(user.first_name || 'Friend')}</a>`;

  const text = `
👋 <b>Welcome to AllSiteHub, ${mention}!</b> 🍿

🌟 <b>AllSiteHub</b> is your ultimate curated directory for fast and free streaming sites across:
• 🎬 <b>Movies & TV Shows</b>
• 🎌 <b>Anime & Manga</b>
• ⚽ <b>Live Sports & PPV</b>
• 📺 <b>Live TV & News</b>
• 📚 <b>Comics, Webtoons & More</b>

🔗 <b>Visit the Official Website:</b>
<a href="${SITE_URL}">${SITE_URL}</a>
`.trim();

  const keyboard: InlineKeyboardMarkup = {
    inline_keyboard: [
      [
        { text: '🌐 Open AllSiteHub.site', url: SITE_URL },
        { text: '🎬 Movies & Shows', url: `${SITE_URL}/#cat-movies-and-shows` },
      ],
      [
        { text: '🎌 Anime', url: `${SITE_URL}/#cat-anime` },
        { text: '⚽ Live Sports', url: `${SITE_URL}/#cat-sports` },
      ],
      [
        { text: '💬 Discord Community', url: 'https://discord.gg/ZEMSvP2HX' },
        { text: '📢 Telegram Group', url: 'https://t.me/+gWOCVAqtcXxkZDk9' },
      ],
    ],
  };

  return { text, keyboard };
}

/**
 * Build general info message (for direct message / overview)
 */
export function buildInfoMessage() {
  const text = `
🌟 <b>AllSiteHub — The Ultimate Streaming & Entertainment Directory</b>

Discover verified platforms for:
• 🎬 <b>Movies & Series:</b> Stream latest films & trending shows
• 🎌 <b>Anime & Manga:</b> Subbed, dubbed, and high-res chapters
• ⚽ <b>Live Sports:</b> Football, basketball, UFC, cricket & motorsport
• 📺 <b>Live TV:</b> Global channels & news broadcasts

🔗 <b>Official Website:</b>
<a href="${SITE_URL}">${SITE_URL}</a>
`.trim();

  const keyboard: InlineKeyboardMarkup = {
    inline_keyboard: [
      [
        { text: '🌐 Open AllSiteHub', url: SITE_URL },
        { text: '💬 Join Telegram Group', url: 'https://t.me/+gWOCVAqtcXxkZDk9' },
      ],
      [
        { text: '🎬 Browse Movies', url: `${SITE_URL}/#cat-movies-and-shows` },
        { text: '🎌 Browse Anime', url: `${SITE_URL}/#cat-anime` },
      ],
      [
        { text: '⚽ Live Sports', url: `${SITE_URL}/#cat-sports` },
        { text: '💬 Join Discord', url: 'https://discord.gg/ZEMSvP2HX' },
      ],
    ],
  };

  return { text, keyboard };
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
