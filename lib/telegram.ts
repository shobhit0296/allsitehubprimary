export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
export const TELEGRAM_WEBHOOK_SECRET = process.env.TELEGRAM_SECRET_TOKEN || '';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://allsitehub.site';
export const MOVIESNET_URL = 'https://moviesnet.site';
export const DISCORD_URL = 'https://discord.gg/ZEMSvP2HX';
export const TELEGRAM_GROUP_URL = 'https://t.me/+gWOCVAqtcXxkZDk9';

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
👋 <b>Welcome to the Community, ${mention}!</b> 🍿

🌟 <b>Official Links:</b>

• 🌐 <b>AllSiteHub Directory:</b>
  <a href="${SITE_URL}">${SITE_URL}</a>
  <i>(Curated directory for movies, anime, sports & live TV)</i>

• 🎬 <b>MoviesNet Streaming:</b>
  <a href="${MOVIESNET_URL}">${MOVIESNET_URL}</a>
  <i>(Watch HD movies & TV series directly for free)</i>

• 💬 <b>Discord Server:</b>
  <a href="${DISCORD_URL}">${DISCORD_URL}</a>
  <i>(Chat, request content & join community events)</i>
`.trim();

  const keyboard: InlineKeyboardMarkup = {
    inline_keyboard: [
      [
        { text: '🌐 AllSiteHub Directory', url: SITE_URL },
        { text: '🍿 Watch on MoviesNet', url: MOVIESNET_URL },
      ],
      [
        { text: '💬 Join Discord', url: DISCORD_URL },
        { text: '📢 Telegram Group', url: TELEGRAM_GROUP_URL },
      ],
      [
        { text: '🎬 Movies & Shows', url: `${SITE_URL}/#cat-movies-and-shows` },
        { text: '🎌 Anime & Manga', url: `${SITE_URL}/#cat-anime` },
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
🌟 <b>AllSiteHub & MoviesNet Official Links</b>

• 🌐 <b>AllSiteHub Directory:</b> <a href="${SITE_URL}">${SITE_URL}</a>
  <i>The ultimate curated directory for movies, anime, sports & live TV.</i>

• 🎬 <b>MoviesNet Free Streaming:</b> <a href="${MOVIESNET_URL}">${MOVIESNET_URL}</a>
  <i>Stream free HD movies and TV shows online.</i>

• 💬 <b>Discord Community:</b> <a href="${DISCORD_URL}">${DISCORD_URL}</a>
  <i>Join our official Discord community for updates & support.</i>
`.trim();

  const keyboard: InlineKeyboardMarkup = {
    inline_keyboard: [
      [
        { text: '🌐 AllSiteHub', url: SITE_URL },
        { text: '🍿 MoviesNet', url: MOVIESNET_URL },
      ],
      [
        { text: '💬 Discord Community', url: DISCORD_URL },
        { text: '📢 Telegram Group', url: TELEGRAM_GROUP_URL },
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
