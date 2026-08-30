import { NextResponse } from 'next/server';
import { leadSchema } from '@/lib/data';
import { isSameOrigin, rateLimit, requestIp } from '@/lib/request-security';

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: 'Request rejected.' }, { status: 403 });
  if (!rateLimit(`lead:${requestIp(request)}`, 4, 15 * 60_000)) {
    return NextResponse.json({ error: 'Please wait before sending another enquiry.' }, { status: 429 });
  }
  const parsed = leadSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Please review the form fields.' }, { status: 400 });

  const webhook = process.env.LEAD_WEBHOOK_URL;
  if (!webhook) {
    return NextResponse.json(
      { error: 'Online enquiries are being configured. Please call or use WhatsApp.' },
      { status: 503 },
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  try {
    const response = await fetch(webhook, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(process.env.LEAD_WEBHOOK_SECRET ? { authorization: `Bearer ${process.env.LEAD_WEBHOOK_SECRET}` } : {}),
      },
      body: JSON.stringify({ ...parsed.data, receivedAt: new Date().toISOString(), source: 'prudentdubai.ae' }),
      signal: controller.signal,
      cache: 'no-store',
    });
    if (!response.ok) throw new Error('Lead destination rejected the request');
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'We could not send your enquiry. Please use WhatsApp or call us.' }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}
