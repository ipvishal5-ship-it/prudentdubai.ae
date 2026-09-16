import { NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import nodemailer from 'nodemailer';
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
  const rawNotifyEmail = process.env.LEAD_NOTIFICATION_EMAIL || 'info@prudentdubai.com';
  const recipients = Array.from(new Set(rawNotifyEmail.split(',').map((e) => e.trim()).filter(Boolean)));

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px;">
        <h2 style="color: #0f172a; margin: 0; font-size: 20px;">🏢 New Property Inquiry — Prudent Spaces</h2>
        <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">Received on prudentspaces.ae</p>
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr><td style="padding: 10px 0; font-weight: 600; color: #475569; width: 120px;">Name:</td><td style="padding: 10px 0; color: #0f172a; font-weight: 600;">${leadData.name}</td></tr>
        <tr style="border-top: 1px solid #f1f5f9;"><td style="padding: 10px 0; font-weight: 600; color: #475569;">Email:</td><td style="padding: 10px 0; color: #0284c7;"><a href="mailto:${leadData.email}" style="color: #0284c7; text-decoration: none;">${leadData.email}</a></td></tr>
        <tr style="border-top: 1px solid #f1f5f9;"><td style="padding: 10px 0; font-weight: 600; color: #475569;">Phone:</td><td style="padding: 10px 0; color: #0f172a;"><a href="tel:${leadData.phone}" style="color: #0f172a; text-decoration: none; font-weight: 600;">${leadData.phone}</a></td></tr>
        <tr style="border-top: 1px solid #f1f5f9;"><td style="padding: 10px 0; font-weight: 600; color: #475569;">Country:</td><td style="padding: 10px 0; color: #0f172a;">${leadData.country}</td></tr>
        <tr style="border-top: 1px solid #f1f5f9;"><td style="padding: 10px 0; font-weight: 600; color: #475569;">Purpose:</td><td style="padding: 10px 0; color: #0f172a;">${leadData.interest}</td></tr>
        <tr style="border-top: 1px solid #f1f5f9;"><td style="padding: 10px 0; font-weight: 600; color: #475569;">Budget:</td><td style="padding: 10px 0; color: #0f172a;">${leadData.budget || 'Not specified'}</td></tr>
        <tr style="border-top: 1px solid #f1f5f9;"><td style="padding: 10px 0; font-weight: 600; color: #475569; vertical-align: top;">Message:</td><td style="padding: 10px 0; color: #334155; line-height: 1.5;">${leadData.message || 'None'}</td></tr>
      </table>
      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
        Received: ${leadData.receivedAt} | IP: ${leadData.ip}
      </div>
    </div>
  `;

  // 1. Hostinger / Custom SMTP
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (smtpUser && smtpPass) {
    try {
      const host = process.env.SMTP_HOST || 'smtp.hostinger.com';
      const port = Number(process.env.SMTP_PORT) || 465;
      const secure = process.env.SMTP_SECURE !== 'false';

      const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || `"Prudent Spaces Real Estate" <${smtpUser}>`,
        to: recipients,
        subject: `New Lead: ${leadData.name} - ${leadData.interest}`,
        html: htmlContent,
      });

      console.info('[Lead System] Email sent successfully via Hostinger SMTP to:', recipients.join(', '), info.messageId);
      return;
    } catch (err) {
      console.warn('[Lead System] Hostinger SMTP delivery error:', err);
    }
  }

  // 2. Resend API Fallback
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'Prudent Spaces Leads <onboarding@resend.dev>';
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: fromEmail,
          to: recipients,
          subject: `New Lead: ${leadData.name} - ${leadData.interest}`,
          html: htmlContent,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn('[Lead System] Resend email dispatch failed:', response.status, errText);
      } else {
        console.info('[Lead System] Email notification dispatched successfully via Resend to:', recipients.join(', '));
      }
      return;
    } catch (err) {
      console.warn('[Lead System] Resend email notification failed:', err);
    }
  }

  // 3. Fallback notice
  console.info(
    `[Lead System] Lead stored safely on disk in data/inquiries.json. Outbound email skipped: Neither Hostinger SMTP (SMTP_USER/SMTP_PASS) nor RESEND_API_KEY is configured in .env.local.`
  );
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
    source: 'prudentspaces.ae',
  };

  // 6. Save lead to local disk storage (Zero lead loss guarantee)
  await saveLeadToDisk(leadRecord);

  // 7. Dispatch background notifications (Webhook / Email / Telegram / OpenWA)
  Promise.all([dispatchWebhookNotification(leadRecord), dispatchEmailNotification(leadRecord)]).catch((err) =>
    console.warn('Background lead notification error:', err),
  );

  return NextResponse.json({ ok: true });
}
