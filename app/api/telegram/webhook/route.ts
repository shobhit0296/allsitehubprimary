import { NextRequest, NextResponse } from 'next/server';
import {
  sendTelegramMessage,
  sendWelcomeAndCleanupOld,
  buildWelcomeMessage,
  buildInfoMessage,
  logTelegramEvent,
  ensureTelegramWebhookActive,
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

    // Log the incoming update to Redis for real-time visibility and diagnostics
    const updateType = update.message?.new_chat_members
      ? 'new_chat_members'
      : update.message?.text
      ? 'message_text'
      : update.chat_member
      ? 'chat_member'
      : update.my_chat_member
      ? 'my_chat_member'
      : update.chat_join_request
      ? 'chat_join_request'
      : 'other';

    const chatInfo =
      update.message?.chat?.title ||
      update.chat_member?.chat?.title ||
      update.my_chat_member?.chat?.title ||
      update.chat_join_request?.chat?.title ||
      update.message?.chat?.id ||
      update.chat_member?.chat?.id;

    const fromUser =
      update.message?.from?.username ||
      update.message?.from?.first_name ||
      update.chat_member?.from?.username ||
      update.chat_join_request?.from?.username;

    await logTelegramEvent({
      action: 'webhook_received',
      update_id: update.update_id,
      type: updateType,
      chat: chatInfo,
      from: fromUser,
    });

    const botToken =
      req.nextUrl.searchParams.get('token') ||
      process.env.TELEGRAM_BOT_TOKEN ||
      TELEGRAM_BOT_TOKEN;
    const botId = Number(process.env.TELEGRAM_BOT_ID || TELEGRAM_BOT_ID || 8741338089);

    // ── 1a. Handle New Chat Members (Welcome Message from service message) ──
    if (update.message?.new_chat_members && Array.isArray(update.message.new_chat_members)) {
      const chatId = update.message.chat.id;

      for (const member of update.message.new_chat_members) {
        // If the bot itself was added to the group
        if (member.is_bot && (member.id === botId || member.username === 'allsitehub_bot')) {
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

        // Welcomes the member and eliminates duplicate triggers without deleting older messages
        const welcomeRes = await sendWelcomeAndCleanupOld(chatId, member, undefined, botToken);
        await logTelegramEvent({
          action: 'welcome_sent_new_chat_members',
          chat_id: chatId,
          user: member.username || member.first_name,
          result: welcomeRes?.ok ? 'ok' : welcomeRes?.description || 'failed',
        });
      }

      return NextResponse.json({ ok: true, action: 'welcome_sent' });
    }

    // ── 1b. Handle Chat Member Updates (Supergroup joins where service messages are suppressed) ──
    if (update.chat_member) {
      const { chat, old_chat_member, new_chat_member } = update.chat_member;
      const wasMember =
        ['member', 'administrator', 'creator'].includes(old_chat_member?.status) ||
        (old_chat_member?.status === 'restricted' && old_chat_member?.is_member !== false);
      const isNowMember =
        ['member', 'administrator', 'creator'].includes(new_chat_member?.status) ||
        (new_chat_member?.status === 'restricted' && new_chat_member?.is_member !== false);

      if (!wasMember && isNowMember && new_chat_member?.user) {
        const user = new_chat_member.user;
        if (!user.is_bot && user.id !== botId) {
          const welcomeRes = await sendWelcomeAndCleanupOld(chat.id, user, undefined, botToken);
          await logTelegramEvent({
            action: 'welcome_sent_chat_member',
            chat_id: chat.id,
            user: user.username || user.first_name,
            result: welcomeRes?.ok ? 'ok' : welcomeRes?.description || 'failed',
          });
          return NextResponse.json({ ok: true, action: 'chat_member_welcome_sent', result: welcomeRes });
        }
      }
    }

    // ── 1c. Handle Chat Join Requests (Groups with join approval enabled) ──
    if (update.chat_join_request) {
      const { chat, from } = update.chat_join_request;
      // Auto-approve the join request if bot is administrator
      try {
        await fetch(`https://api.telegram.org/bot${botToken}/approveChatJoinRequest`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chat.id, user_id: from.id }),
        });
      } catch {}

      if (from && !from.is_bot) {
        const welcomeRes = await sendWelcomeAndCleanupOld(chat.id, from, undefined, botToken);
        await logTelegramEvent({
          action: 'welcome_sent_join_request',
          chat_id: chat.id,
          user: from.username || from.first_name,
          result: welcomeRes?.ok ? 'ok' : welcomeRes?.description || 'failed',
        });
        return NextResponse.json({ ok: true, action: 'join_request_greeted' });
      }
    }

    // ── 1d. Handle Bot Added as Admin or Member (my_chat_member) ──
    if (update.my_chat_member) {
      const { chat, new_chat_member } = update.my_chat_member;
      if (['member', 'administrator'].includes(new_chat_member?.status)) {
        await sendTelegramMessage(
          {
            chat_id: chat.id,
            text: `🤖 <b>AllSiteHub Welcome Bot is now active in this group!</b>\n\nEvery new member joining will be greeted automatically with our verified links. 🍿`,
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
        text.startsWith('/about') ||
        text.startsWith('/community') ||
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
    // Return 200 with error info so Telegram does not trigger exponential backoff retry storms
    return NextResponse.json({ ok: false, error: String(err) }, { status: 200 });
  }
}

// Support GET for health checks & self-healing verification
export async function GET() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN || TELEGRAM_BOT_TOKEN;
  let webhookInfo: any = null;
  let autoRepaired = false;
  let botUsername = 'allsitehub_bot';

  try {
    const healResult = await ensureTelegramWebhookActive(botToken, true);
    autoRepaired = !!healResult.repaired;

    const res = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`);
    const data = await res.json();
    if (data.ok) {
      webhookInfo = data.result;
    }

    const meRes = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
    const meData = await meRes.json();
    if (meData.ok && meData.result?.username) {
      botUsername = meData.result.username;
    }
  } catch (err) {
    console.warn('[Telegram Webhook Healthcheck Warning]:', err);
  }

  return NextResponse.json({
    status: 'online',
    service: 'AllSiteHub Telegram Webhook Handler',
    time: new Date().toISOString(),
    site: SITE_URL,
    bot_id: TELEGRAM_BOT_ID,
    bot_username: botUsername,
    webhook_url: webhookInfo?.url || 'unregistered',
    auto_repaired: autoRepaired,
    pending_updates: webhookInfo?.pending_update_count ?? 0,
    last_error: webhookInfo?.last_error_message || null,
  });
}

