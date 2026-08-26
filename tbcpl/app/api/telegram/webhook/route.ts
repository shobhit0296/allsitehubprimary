import { NextRequest, NextResponse } from 'next/server';
import {
  sendTelegramMessage,
  answerCallbackQuery,
  buildWelcomeMessage,
  searchSitesForTelegram,
  buildStartMessage,
  buildRulesMessage,
  TELEGRAM_WEBHOOK_SECRET,
  SITE_URL,
} from '@/lib/telegram';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // Optional secret token verification
    if (TELEGRAM_WEBHOOK_SECRET) {
      const headerSecret = req.headers.get('x-telegram-bot-api-secret-token');
      if (headerSecret !== TELEGRAM_WEBHOOK_SECRET) {
        return NextResponse.json({ error: 'Unauthorized secret token' }, { status: 401 });
      }
    }

    const update = await req.json();

    // ── 1. Handle New Chat Members (Welcome Message) ──
    if (update.message?.new_chat_members && Array.isArray(update.message.new_chat_members)) {
      const chatId = update.message.chat.id;
      const botId = process.env.TELEGRAM_BOT_ID ? Number(process.env.TELEGRAM_BOT_ID) : null;

      for (const member of update.message.new_chat_members) {
        // Skip if the member joining is the bot itself (unless you want to say hello)
        if (member.is_bot && botId && member.id === botId) {
          await sendTelegramMessage({
            chat_id: chatId,
            text: `🤖 <b>AllSiteHub Bot activated in this group!</b>\n\nI will welcome new members and help users find working streaming sites with <code>/search</code>.\n\n🌐 Visit <a href="${SITE_URL}">AllSiteHub.site</a>`,
          });
          continue;
        }

        const { text, keyboard } = buildWelcomeMessage(member);
        await sendTelegramMessage({
          chat_id: chatId,
          text,
          reply_markup: keyboard,
          reply_to_message_id: update.message.message_id,
        });
      }

      return NextResponse.json({ ok: true, action: 'welcome_sent' });
    }

    // ── 2. Handle Text Messages & Commands ──
    if (update.message?.text) {
      const text = update.message.text.trim();
      const chatId = update.message.chat.id;
      const messageId = update.message.message_id;

      // Extract command and arguments (handles "/search@botname query" format in groups)
      const parts = text.split(/\s+/);
      const rawCommand = parts[0].toLowerCase();
      const command = rawCommand.split('@')[0];
      const query = parts.slice(1).join(' ');

      if (command === '/start') {
        const { text: startText, keyboard } = buildStartMessage();
        await sendTelegramMessage({
          chat_id: chatId,
          text: startText,
          reply_markup: keyboard,
          reply_to_message_id: messageId,
        });
        return NextResponse.json({ ok: true });
      }

      if (command === '/rules') {
        const { text: rulesText, keyboard } = buildRulesMessage();
        await sendTelegramMessage({
          chat_id: chatId,
          text: rulesText,
          reply_markup: keyboard,
          reply_to_message_id: messageId,
        });
        return NextResponse.json({ ok: true });
      }

      if (command === '/help') {
        const helpText = `
📖 <b>AllSiteHub Bot Help:</b>

• <code>/search &lt;name&gt;</code> - Search 200+ streaming sites (movies, anime, sports)
• <code>/rules</code> - Read group guidelines
• <code>/categories</code> - Explore website categories
• <code>/start</code> - Overview & main menu

Visit our live catalog at <a href="${SITE_URL}">AllSiteHub.site</a>!
        `.trim();

        await sendTelegramMessage({
          chat_id: chatId,
          text: helpText,
          reply_to_message_id: messageId,
          reply_markup: {
            inline_keyboard: [
              [{ text: '🌐 Go to AllSiteHub.site', url: SITE_URL }],
            ],
          },
        });
        return NextResponse.json({ ok: true });
      }

      if (command === '/search' || command === '/find' || command === '/site') {
        const { text: searchResultText, keyboard } = searchSitesForTelegram(query);
        await sendTelegramMessage({
          chat_id: chatId,
          text: searchResultText,
          reply_markup: keyboard,
          reply_to_message_id: messageId,
        });
        return NextResponse.json({ ok: true });
      }

      if (command === '/categories' || command === '/cats') {
        const catsText = `
📂 <b>AllSiteHub Categories:</b>

• 🎬 <a href="${SITE_URL}/#cat-movies-and-shows">Movies & TV Shows</a>
• 🎌 <a href="${SITE_URL}/#cat-anime">Anime & Manga</a>
• ⚽ <a href="${SITE_URL}/#cat-sports">Live Sports & PPV</a>
• 📺 <a href="${SITE_URL}/#cat-live-tv">Live TV & News</a>
• 📚 <a href="${SITE_URL}/#cat-manga-and-comics">Manga & Comics</a>

Click below to explore:
        `.trim();

        await sendTelegramMessage({
          chat_id: chatId,
          text: catsText,
          reply_to_message_id: messageId,
          reply_markup: {
            inline_keyboard: [
              [
                { text: '🎬 Movies & Shows', url: `${SITE_URL}/#cat-movies-and-shows` },
                { text: '🎌 Anime', url: `${SITE_URL}/#cat-anime` },
              ],
              [
                { text: '⚽ Live Sports', url: `${SITE_URL}/#cat-sports` },
                { text: '📺 Live TV', url: `${SITE_URL}/#cat-live-tv` },
              ],
              [{ text: '🌐 Full Directory', url: SITE_URL }],
            ],
          },
        });
        return NextResponse.json({ ok: true });
      }
    }

    // ── 3. Handle Callback Query (Button Clicks) ──
    if (update.callback_query) {
      const cb = update.callback_query;
      const data = cb.data;

      if (data === 'help_search') {
        await answerCallbackQuery(cb.id, 'Type: /search <site or keyword>');
        if (cb.message?.chat?.id) {
          await sendTelegramMessage({
            chat_id: cb.message.chat.id,
            text: '💡 <b>How to Search:</b>\nType <code>/search movie</code> or <code>/search anime</code> in the chat to discover working sites instantly!',
          });
        }
      } else {
        await answerCallbackQuery(cb.id);
      }

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true, unhandled: true });
  } catch (err) {
    console.error('[Telegram Webhook Error]:', err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

// Support GET for testing if webhook endpoint is live
export async function GET() {
  return NextResponse.json({
    status: 'online',
    service: 'AllSiteHub Telegram Webhook Handler',
    time: new Date().toISOString(),
    site: SITE_URL,
  });
}
