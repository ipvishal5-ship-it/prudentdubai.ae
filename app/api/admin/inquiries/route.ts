import { NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { isAdminAuthenticated } from '@/lib/auth';
import { isSameOrigin } from '@/lib/request-security';

export const runtime = 'nodejs';

const DATA_DIR = path.join(process.cwd(), 'data');
const LEADS_FILE = path.join(DATA_DIR, 'inquiries.json');

async function authorised(request?: Request) {
  return (request ? isSameOrigin(request) : true) && (await isAdminAuthenticated());
}

async function readLeads(): Promise<Record<string, unknown>[]> {
  const webhookUrl = process.env.LEAD_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6_000);
      const res = await fetch(webhookUrl, {
        method: 'GET',
        cache: 'no-store',
        redirect: 'follow',
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (res.ok) {
        const data = (await res.json()) as { leads?: Record<string, unknown>[] };
        if (Array.isArray(data.leads) && data.leads.length > 0) {
          return data.leads;
        }
      }
    } catch (err) {
      console.warn('Google Sheet live sync fallback:', err);
    }
  }

  try {
    const raw = await fs.readFile(LEADS_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeLeads(leads: Record<string, unknown>[]) {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(LEADS_FILE, `${JSON.stringify(leads, null, 2)}\n`, 'utf8');
  } catch (err) {
    // Gracefully ignore local disk write errors on serverless read-only filesystems
    console.warn('Local disk write skipped:', err);
  }
}

export async function GET() {
  if (!(await authorised())) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 });
  const leads = await readLeads();
  return NextResponse.json({ leads });
}

export async function PUT(request: Request) {
  if (!(await authorised(request))) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { id?: string; leadStatus?: string; notes?: string } | null;
  if (!body?.id) return NextResponse.json({ error: 'Missing lead ID.' }, { status: 400 });

  const webhookUrl = process.env.LEAD_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8_000);
      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(process.env.LEAD_WEBHOOK_SECRET ? { authorization: `Bearer ${process.env.LEAD_WEBHOOK_SECRET}` } : {}),
        },
        body: JSON.stringify({
          action: 'update',
          rowId: body.id,
          leadStatus: body.leadStatus || 'new',
          notes: body.notes || '',
        }),
        signal: controller.signal,
        cache: 'no-store',
        redirect: 'follow',
      });
      clearTimeout(timeout);
    } catch (err) {
      console.warn('Webhook lead update error:', err);
    }
  }

  // Also update local store if present
  try {
    const raw = await fs.readFile(LEADS_FILE, 'utf8').catch(() => '[]');
    const localLeads = JSON.parse(raw);
    if (Array.isArray(localLeads)) {
      const index = localLeads.findIndex((l: Record<string, unknown>) => l.id === body.id);
      if (index >= 0) {
        localLeads[index] = {
          ...localLeads[index],
          leadStatus: body.leadStatus || localLeads[index].leadStatus || 'new',
          notes: typeof body.notes === 'string' ? body.notes : localLeads[index].notes || '',
          updatedAt: new Date().toISOString(),
        };
        await writeLeads(localLeads);
      }
    }
  } catch {
    // Non-fatal
  }

  return NextResponse.json({ ok: true, lead: { id: body.id, leadStatus: body.leadStatus, notes: body.notes } });
}

export async function DELETE(request: Request) {
  if (!(await authorised(request))) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { id?: string } | null;
  if (!body?.id) return NextResponse.json({ error: 'Missing lead ID.' }, { status: 400 });

  const webhookUrl = process.env.LEAD_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8_000);
      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(process.env.LEAD_WEBHOOK_SECRET ? { authorization: `Bearer ${process.env.LEAD_WEBHOOK_SECRET}` } : {}),
        },
        body: JSON.stringify({
          action: 'delete',
          rowId: body.id,
        }),
        signal: controller.signal,
        cache: 'no-store',
        redirect: 'follow',
      });
      clearTimeout(timeout);
    } catch (err) {
      console.warn('Webhook lead delete error:', err);
    }
  }

  // Also remove from local store if present
  try {
    const raw = await fs.readFile(LEADS_FILE, 'utf8').catch(() => '[]');
    const localLeads = JSON.parse(raw);
    if (Array.isArray(localLeads)) {
      const filtered = localLeads.filter((l: Record<string, unknown>) => l.id !== body.id);
      await writeLeads(filtered);
    }
  } catch {
    // Non-fatal
  }

  return NextResponse.json({ ok: true });
}
