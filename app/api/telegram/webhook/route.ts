import { NextRequest, NextResponse } from 'next/server';
import {
  sendTelegramMessage,
  sendWelcomeAndCleanupOld,
  buildWelcomeMessage,
  buildInfoMessage,
  TELEGRAM_BOT_TOKEN,
  TELEGRAM_BOT_ID,
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

    const botToken =
      req.nextUrl.searchParams.get('token') ||
      process.env.TELEGRAM_BOT_TOKEN ||
      TELEGRAM_BOT_TOKEN;
    const botId = Number(process.env.TELEGRAM_BOT_ID || 8973994330);

    // ── 1a. Handle New Chat Members (Welcome Message from service message) ──
    if (update.message?.new_chat_members && Array.isArray(update.message.new_chat_members)) {
      const chatId = update.message.chat.id;

      for (const member of update.message.new_chat_members) {
        // If the bot itself was added to the group
        if (member.is_bot && member.id === botId) {
          const { reply_markup } = buildInfoMessage();
          await sendTelegramMessage(
            {
              chat_id: chatId,
              text: `🤖 <b>AllSiteHub Welcome Bot Activated!</b>\n\nI will welcome every new member with our official links. 🍿`,
              reply_markup,
            },
            botToken,
          );
          continue;
        }

        // Skip other bots
        if (member.is_bot) continue;

        // Welcomes the member, eliminates second duplicate message, and deletes the previous welcome message
        await sendWelcomeAndCleanupOld(chatId, member, update.message.message_id, botToken);
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
        if (!user.is_bot || user.id !== botId) {
          if (!user.is_bot) {
            // Welcomes the member, eliminates second duplicate message, and deletes the previous welcome message
            await sendWelcomeAndCleanupOld(chat.id, user, undefined, botToken);
            return NextResponse.json({ ok: true, action: 'chat_member_welcome_sent' });
          }
        }
      }
    }

    // ── 1c. Handle Chat Join Requests (Groups with join approval enabled) ──
    if (update.chat_join_request) {
      const { chat, from } = update.chat_join_request;
      if (from && !from.is_bot) {
        const { text: welcomeText, reply_markup } = buildWelcomeMessage(from);
        await sendTelegramMessage(
          {
            chat_id: from.id,
            text: welcomeText,
            reply_markup,
          },
          botToken,
        );
        return NextResponse.json({ ok: true, action: 'join_request_greeted' });
      }
    }

    // ── 1d. Handle Bot Added as Admin or Member (my_chat_member) ──
    if (update.my_chat_member) {
      const { chat, new_chat_member } = update.my_chat_member;
      if (['member', 'administrator'].includes(new_chat_member?.status)) {
        const { reply_markup } = buildInfoMessage();
        await sendTelegramMessage(
          {
            chat_id: chat.id,
            text: `🤖 <b>AllSiteHub Welcome Bot is now active in this group!</b>\n\nEvery new member joining will be greeted automatically with our verified links. 🍿`,
            reply_markup,
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
        const { text: replyText, reply_markup } = buildInfoMessage();
        await sendTelegramMessage(
          {
            chat_id: chatId,
            text: replyText,
            reply_to_message_id: messageId,
            reply_markup,
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
        text.startsWith('/about') ||
        text.startsWith('/community') ||
        text.includes('@allsitehubsute_bot') ||
        text.includes('@allsitehub_bot');

      if (isBotCommand) {
        const { text: replyText, reply_markup } = buildInfoMessage();
        await sendTelegramMessage(
          {
            chat_id: chatId,
            text: replyText,
            reply_to_message_id: messageId,
            reply_markup,
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
