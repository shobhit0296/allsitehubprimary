import { NextRequest, NextResponse } from 'next/server';
import {
  sendTelegramMessage,
  answerCallbackQuery,
  buildWelcomeMessage,
  buildInfoMessage,
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
        // Skip if the member joining is the bot itself
        if (member.is_bot && botId && member.id === botId) {
          await sendTelegramMessage({
            chat_id: chatId,
            text: `🤖 <b>AllSiteHub Bot Activated!</b>\n\n🌐 Explore all verified streaming sites at <a href="${SITE_URL}">AllSiteHub.site</a>`,
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

    // ── 2. Handle Private Messages / DMs to the bot ──
    if (update.message?.text) {
      const chatType = update.message.chat.type; // 'private', 'group', 'supergroup', etc.
      const chatId = update.message.chat.id;
      const messageId = update.message.message_id;

      // In Private DM, always respond with website info and direct links
      if (chatType === 'private') {
        const { text, keyboard } = buildInfoMessage();
        await sendTelegramMessage({
          chat_id: chatId,
          text,
          reply_markup: keyboard,
          reply_to_message_id: messageId,
        });
        return NextResponse.json({ ok: true });
      }
    }

    // ── 3. Handle Callback Query (Button Clicks) ──
    if (update.callback_query) {
      await answerCallbackQuery(update.callback_query.id);
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
