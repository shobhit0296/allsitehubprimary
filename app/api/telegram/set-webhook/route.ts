import { NextRequest, NextResponse } from 'next/server';
import { TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET, SITE_URL } from '@/lib/telegram';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Endpoint to configure, verify, or remove the Telegram Webhook
 *
 * GET /api/telegram/set-webhook
 * GET /api/telegram/set-webhook?action=info
 * GET /api/telegram/set-webhook?action=delete
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token') || TELEGRAM_BOT_TOKEN;
  const action = req.nextUrl.searchParams.get('action') || 'set';
  const customUrl = req.nextUrl.searchParams.get('url');

  if (!token) {
    return NextResponse.json(
      {
        error: 'TELEGRAM_BOT_TOKEN is not configured in .env.local or passed via ?token= parameter.',
        help: 'Create a bot with @BotFather on Telegram, copy the token, and add TELEGRAM_BOT_TOKEN to your environment variables.',
      },
      { status: 400 },
    );
  }

  // Action: Check webhook info
  if (action === 'info') {
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
      const data = await res.json();
      return NextResponse.json(data);
    } catch (e) {
      return NextResponse.json({ error: String(e) }, { status: 500 });
    }
  }

  // Action: Delete webhook
  if (action === 'delete') {
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/deleteWebhook`);
      const data = await res.json();
      return NextResponse.json(data);
    } catch (e) {
      return NextResponse.json({ error: String(e) }, { status: 500 });
    }
  }

  // Action: Set webhook
  let webhookUrl = customUrl || `${SITE_URL}/api/telegram/webhook`;
  // Ensure we don't accidentally set apex domain that redirects with 308
  webhookUrl = webhookUrl.replace(/^https?:\/\/allsitehub\.site/i, 'https://www.allsitehub.site');

  try {
    const payload: Record<string, any> = {
      url: webhookUrl,
      allowed_updates: ['message', 'callback_query', 'chat_member', 'my_chat_member'],
      drop_pending_updates: true,
    };

    if (TELEGRAM_WEBHOOK_SECRET) {
      payload.secret_token = TELEGRAM_WEBHOOK_SECRET;
    }

    const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    return NextResponse.json({
      success: data.ok,
      telegramResponse: data,
      configuredWebhookUrl: webhookUrl,
      instructions: [
        '1. Add your bot as an Administrator in your Telegram group (https://t.me/+gWOCVAqtcXxkZDk9).',
        '2. Ensure bot has permission to Send Messages and Read Group Messages.',
        '3. Whenever anyone joins, the bot will immediately welcome them with your AllSiteHub link!',
      ],
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
