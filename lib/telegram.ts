export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
export const TELEGRAM_WEBHOOK_SECRET = process.env.TELEGRAM_SECRET_TOKEN || '';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.allsitehub.site';
export const MOVIESNET_URL = 'https://moviesnet.site';
export const DISCORD_URL = 'https://discord.gg/ZEMSvP2HX';
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
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: options.chat_id,
        text: options.text,
        parse_mode: options.parse_mode || 'HTML',
        disable_web_page_preview: options.disable_web_page_preview ?? true,
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
 * Build welcome message for new chat members (pure text with links, no buttons)
 */
export function buildWelcomeMessage(user: { id: number; first_name?: string; username?: string }) {
  const mention = user.username
    ? `@${user.username}`
    : `<a href="tg://user?id=${user.id}">${escapeHtml(user.first_name || 'Friend')}</a>`;

  const text = `
👋 <b>Welcome to the Community, ${mention}!</b> 🍿

🌟 <b>Official Links:</b>
• 🌐 <b>AllSiteHub:</b> <a href="${SITE_URL}">${SITE_URL}</a>
• 🎬 <b>MoviesNet:</b> <a href="${MOVIESNET_URL}">${MOVIESNET_URL}</a>
• 💬 <b>Discord:</b> <a href="${DISCORD_URL}">${DISCORD_URL}</a>
• 📢 <b>Telegram:</b> <a href="${TELEGRAM_GROUP_URL}">${TELEGRAM_GROUP_URL}</a>
`.trim();

  return { text };
}

/**
 * Build general info message (for direct messages, pure text with links)
 */
export function buildInfoMessage() {
  const text = `
🌟 <b>Official Links:</b>
• 🌐 <b>AllSiteHub:</b> <a href="${SITE_URL}">${SITE_URL}</a>
• 🎬 <b>MoviesNet:</b> <a href="${MOVIESNET_URL}">${MOVIESNET_URL}</a>
• 💬 <b>Discord:</b> <a href="${DISCORD_URL}">${DISCORD_URL}</a>
• 📢 <b>Telegram:</b> <a href="${TELEGRAM_GROUP_URL}">${TELEGRAM_GROUP_URL}</a>
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
