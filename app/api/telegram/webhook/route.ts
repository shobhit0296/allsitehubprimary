import { NextRequest, NextResponse } from 'next/server';
import {
  sendTelegramMessage,
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

    let update: any;
    try {
      update = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (!update || typeof update !== 'object') {
      return NextResponse.json({ ok: true, unhandled: true });
    }

    const botToken = req.nextUrl.searchParams.get('token') || process.env.TELEGRAM_BOT_TOKEN;

    // ── 1a. Handle New Chat Members (Welcome Message from service message) ──
    if (update.message?.new_chat_members && Array.isArray(update.message.new_chat_members)) {
      const chatId = update.message.chat.id;
      const botId = process.env.TELEGRAM_BOT_ID ? Number(process.env.TELEGRAM_BOT_ID) : null;

      for (const member of update.message.new_chat_members) {
        // If the bot itself was added to the group
        if (member.is_bot && botId && member.id === botId) {
          await sendTelegramMessage(
            {
              chat_id: chatId,
              text: `🤖 <b>AllSiteHub Welcome Bot Activated!</b>\n\nI will welcome every new member with our official links. 🍿`,
            },
            botToken,
          );
          continue;
        }

        // Skip other bots
        if (member.is_bot) continue;

        const { text } = buildWelcomeMessage(member);
        await sendTelegramMessage(
          {
            chat_id: chatId,
            text,
            reply_to_message_id: update.message.message_id,
          },
          botToken,
        );
      }

      return NextResponse.json({ ok: true, action: 'welcome_sent' });
    }

    // ── 1b. Handle Chat Member Updates (Supergroup joins where service messages are suppressed) ──
    if (update.chat_member) {
      const { chat, old_chat_member, new_chat_member } = update.chat_member;
      const wasMember = ['member', 'administrator', 'creator'].includes(old_chat_member?.status);
      const isNowMember = ['member', 'administrator', 'restricted'].includes(new_chat_member?.status);

      if (!wasMember && isNowMember && new_chat_member?.user) {
        const user = new_chat_member.user;
        const botId = process.env.TELEGRAM_BOT_ID ? Number(process.env.TELEGRAM_BOT_ID) : null;
        if (!user.is_bot || !botId || user.id !== botId) {
          if (!user.is_bot) {
            const { text } = buildWelcomeMessage(user);
            await sendTelegramMessage(
              {
                chat_id: chat.id,
                text,
              },
              botToken,
            );
            return NextResponse.json({ ok: true, action: 'chat_member_welcome_sent' });
          }
        }
      }
    }

    // ── 1c. Handle Bot Added as Admin or Member (my_chat_member) ──
    if (update.my_chat_member) {
      const { chat, new_chat_member } = update.my_chat_member;
      if (['member', 'administrator'].includes(new_chat_member?.status)) {
        await sendTelegramMessage(
          {
            chat_id: chat.id,
            text: `🤖 <b>AllSiteHub Welcome Bot is now active in this group!</b>\n\nEvery new member joining will be greeted automatically. 🍿`,
          },
          botToken,
        );
        return NextResponse.json({ ok: true, action: 'bot_added_to_chat' });
      }
    }

    // ── 2. Handle Text Messages & Bot Commands ──
    if (update.message?.text) {
      const chatType = update.message.chat.type; // 'private', 'group', 'supergroup', etc.
      const chatId = update.message.chat.id;
      const messageId = update.message.message_id;
      const text = update.message.text.trim().toLowerCase();

      // In Private DM, always respond with website info and direct links
      if (chatType === 'private') {
        const { text: replyText } = buildInfoMessage();
        await sendTelegramMessage(
          {
            chat_id: chatId,
            text: replyText,
            reply_to_message_id: messageId,
          },
          botToken,
        );
        return NextResponse.json({ ok: true });
      }

      // In Groups / Supergroups: respond if commanded or tagged
      const isBotCommand =
        text.startsWith('/start') ||
        text.startsWith('/help') ||
        text.startsWith('/links') ||
        text.startsWith('/sites') ||
        text.startsWith('/info') ||
        text.includes('@allsitehubsute_bot') ||
        text.includes('@allsitehub_bot');

      if (isBotCommand) {
        const { text: replyText } = buildInfoMessage();
        await sendTelegramMessage(
          {
            chat_id: chatId,
            text: replyText,
            reply_to_message_id: messageId,
          },
          botToken,
        );
        return NextResponse.json({ ok: true, action: 'group_command_replied' });
      }
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
