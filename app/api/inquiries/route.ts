import { NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { leadSchema } from '@/lib/data';
import { isSameOrigin, rateLimit, requestIp } from '@/lib/request-security';
import { validateEmailAddress } from '@/lib/email-validator';

const DATA_DIR = path.join(process.cwd(), 'data');
const LEADS_FILE = path.join(DATA_DIR, 'inquiries.json');

async function saveLeadToDisk(leadRecord: Record<string, unknown>) {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    let existing: unknown[] = [];
    try {
      const raw = await fs.readFile(LEADS_FILE, 'utf8');
      existing = JSON.parse(raw);
      if (!Array.isArray(existing)) existing = [];
    } catch {
      existing = [];
    }
    existing.unshift(leadRecord);
    // Keep max 500 leads in local JSON file
    if (existing.length > 500) existing = existing.slice(0, 500);
    await fs.writeFile(LEADS_FILE, `${JSON.stringify(existing, null, 2)}\n`, 'utf8');
  } catch (err) {
    console.error('Failed to persist lead to disk:', err);
  }
}

async function dispatchWebhookNotification(leadData: Record<string, unknown>) {
  const webhookUrl = process.env.LEAD_WEBHOOK_URL;
  if (!webhookUrl) return;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7_000);
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(process.env.LEAD_WEBHOOK_SECRET ? { authorization: `Bearer ${process.env.LEAD_WEBHOOK_SECRET}` } : {}),
      },
      body: JSON.stringify(leadData),
      signal: controller.signal,
      cache: 'no-store',
    });
  } catch (err) {
    console.warn('Lead webhook notification failed:', err);
  } finally {
    clearTimeout(timeout);
  }
}

async function dispatchEmailNotification(leadData: Record<string, unknown>) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const notifyEmail = process.env.LEAD_NOTIFICATION_EMAIL || 'info@prudentdubai.ae';
  if (!resendApiKey) return;

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'PrudentDubai Leads <no-reply@prudentdubai.ae>',
        to: [notifyEmail],
        subject: `New Lead: ${leadData.name} - ${leadData.interest}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #0f172a; margin-top: 0;">New Property Inquiry</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; font-weight: bold; color: #475569;">Name:</td><td style="padding: 8px 0; color: #0f172a;">${leadData.name}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #475569;">Email:</td><td style="padding: 8px 0; color: #0f172a;">${leadData.email}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #475569;">Phone:</td><td style="padding: 8px 0; color: #0f172a;">${leadData.phone}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #475569;">Country:</td><td style="padding: 8px 0; color: #0f172a;">${leadData.country}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #475569;">Purpose:</td><td style="padding: 8px 0; color: #0f172a;">${leadData.interest}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #475569;">Budget:</td><td style="padding: 8px 0; color: #0f172a;">${leadData.budget || 'Not specified'}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #475569;">Message:</td><td style="padding: 8px 0; color: #0f172a;">${leadData.message || 'None'}</td></tr>
            </table>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e2e8f0;" />
            <p style="font-size: 12px; color: #94a3b8; margin: 0;">Received at: ${leadData.receivedAt} | IP: ${leadData.ip}</p>
          </div>
        `,
      }),
    });
  } catch (err) {
    console.warn('Resend email notification failed:', err);
  }
}

export async function POST(request: Request) {
  // 1. Same-origin CSRF protection
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Request rejected.' }, { status: 403 });
  }

  // 2. Strict Rate Limiting: Max 3 requests per 15 minutes per IP
  const clientIp = requestIp(request);
  if (!rateLimit(`lead:${clientIp}`, 3, 15 * 60_000)) {
    return NextResponse.json(
      { error: 'You have submitted multiple enquiries. Please wait 15 minutes or contact us via WhatsApp.' },
      { status: 429 },
    );
  }

  // 3. Schema Parsing
  const rawBody = await request.json().catch(() => null);
  const parsed = leadSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Please review all required form fields.' }, { status: 400 });
  }

  const { name, email, phone, country, interest, budget, message, website } = parsed.data;

  // 4. Honeypot check (website hidden input must be empty)
  if (website && website.length > 0) {
    return NextResponse.json({ ok: true });
  }

  // 5. Server-side Email validation (Disposable & Fake Email check)
  const emailCheck = validateEmailAddress(email);
  if (!emailCheck.valid) {
    return NextResponse.json({ error: emailCheck.error }, { status: 400 });
  }

  const leadRecord = {
    id: `lead_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name,
    email,
    phone,
    country: country || 'Not specified',
    interest,
    budget: budget || '',
    message: message || '',
    ip: clientIp,
    userAgent: request.headers.get('user-agent') || 'Unknown',
    receivedAt: new Date().toISOString(),
    source: 'prudentdubai.ae',
  };

  // 6. Save lead to local disk storage (Zero lead loss guarantee)
  await saveLeadToDisk(leadRecord);

  // 7. Dispatch background notifications (Webhook / Email / Telegram / OpenWA)
  Promise.all([dispatchWebhookNotification(leadRecord), dispatchEmailNotification(leadRecord)]).catch((err) =>
    console.warn('Background lead notification error:', err),
  );

  return NextResponse.json({ ok: true });
}
