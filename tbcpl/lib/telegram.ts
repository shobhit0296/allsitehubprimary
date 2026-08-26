import { SITES, filterSites } from '@/lib/data';

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
👋 <b>Welcome to AllSiteHub Community, ${mention}!</b> 🍿

🌟 <b>AllSiteHub</b> is your ultimate curated directory for high-speed streaming sites across:
• 🎬 <b>Movies & TV Shows</b>
• 🎌 <b>Anime & Manga</b>
• ⚽ <b>Live Sports & Events</b>
• 📺 <b>Live TV & Cable</b>
• 📚 <b>Comics, Novels & More</b>

🔗 <b>Visit the Official Directory:</b>
<a href="${SITE_URL}">${SITE_URL}</a>

💡 <i>Tip: You can use</i> <code>/search &lt;query&gt;</code> <i>in this chat to quickly find working streaming links anytime!</i>
`.trim();

  const keyboard: InlineKeyboardMarkup = {
    inline_keyboard: [
      [
        { text: '🌐 Open AllSiteHub', url: SITE_URL },
        { text: '🎬 Movies & Shows', url: `${SITE_URL}/#cat-movies-and-shows` },
      ],
      [
        { text: '🎌 Anime', url: `${SITE_URL}/#cat-anime` },
        { text: '⚽ Live Sports', url: `${SITE_URL}/#cat-sports` },
      ],
      [
        { text: '💬 Discord Community', url: 'https://discord.gg/ZEMSvP2HX' },
        { text: '🤖 Search Sites', callback_data: 'help_search' },
      ],
    ],
  };

  return { text, keyboard };
}

/**
 * Build search response for `/search <query>`
 */
export function searchSitesForTelegram(query: string) {
  const trimmed = query.trim();
  if (!trimmed) {
    return {
      text: '🔍 <b>Please provide a search term!</b>\n\nExample: <code>/search anime</code> or <code>/search movies</code>',
      keyboard: {
        inline_keyboard: [[{ text: '🌐 Browse All on AllSiteHub', url: SITE_URL }]],
      },
    };
  }

  const results = filterSites(SITES, trimmed, 'all', 'all').slice(0, 6);

  if (results.length === 0) {
    return {
      text: `❌ <b>No sites found for &ldquo;${escapeHtml(trimmed)}&rdquo;</b>\n\nTry searching for broader keywords like <i>movie</i>, <i>anime</i>, <i>sports</i>, or check our full directory online:`,
      keyboard: {
        inline_keyboard: [[{ text: '🌐 Search on AllSiteHub.site', url: `${SITE_URL}` }]],
      },
    };
  }

  let text = `🔍 <b>Search Results for &ldquo;${escapeHtml(trimmed)}&rdquo;:</b>\n\n`;

  const buttons: InlineKeyboardButton[][] = [];

  results.forEach((s, idx) => {
    text += `<b>${idx + 1}. <a href="${s.url}">${escapeHtml(s.name)}</a></b> (${escapeHtml(s.category)})\n`;
    text += `   📝 <i>${escapeHtml(s.description.slice(0, 90))}${s.description.length > 90 ? '…' : ''}</i>\n`;
    text += `   🌐 Domain: <code>${escapeHtml(s.domain)}</code>\n\n`;

    buttons.push([{ text: `🔗 Open ${s.name}`, url: s.url }]);
  });

  buttons.push([{ text: '🌐 View all on AllSiteHub.site', url: SITE_URL }]);

  return { text: text.trim(), keyboard: { inline_keyboard: buttons } };
}

/**
 * Build /start response
 */
export function buildStartMessage() {
  const text = `
🚀 <b>Welcome to the official AllSiteHub Telegram Bot!</b>

I can help you explore working streaming sites, anime platforms, sports streams, and live TV.

<b>Available Commands:</b>
• <code>/search &lt;name&gt;</code> - Search 200+ curated sites
• <code>/categories</code> - View all directory categories
• <code>/rules</code> - Read group guidelines & safety tips
• <code>/help</code> - Bot usage guide

Explore the complete catalog anytime at <a href="${SITE_URL}">AllSiteHub.site</a>!
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
    ],
  };

  return { text, keyboard };
}

/**
 * Build /rules response
 */
export function buildRulesMessage() {
  const text = `
📜 <b>AllSiteHub Community Rules:</b>

1. <b>Respect All Members</b> — No harassment, hate speech, or toxicity.
2. <b>No Direct Pirated File Uploads / Torrents</b> — We share indexing directory links only. We do not host or upload copyrighted files.
3. <b>No Spam or Self-Promotion</b> — Unauthorized promo or affiliate spam is prohibited.
4. <b>Use Adblockers</b> — We recommend uBlock Origin / Brave for safer web browsing.

🔗 <b>Visit:</b> <a href="${SITE_URL}">${SITE_URL}</a>
`.trim();

  const keyboard: InlineKeyboardMarkup = {
    inline_keyboard: [[{ text: '🌐 Visit AllSiteHub', url: SITE_URL }]],
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
