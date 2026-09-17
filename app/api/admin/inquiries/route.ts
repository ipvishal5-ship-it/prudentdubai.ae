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
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(LEADS_FILE, `${JSON.stringify(leads, null, 2)}\n`, 'utf8');
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

  const leads = await readLeads();
  const index = leads.findIndex((l) => l.id === body.id);
  if (index < 0) return NextResponse.json({ error: 'Lead not found.' }, { status: 404 });

  leads[index] = {
    ...leads[index],
    leadStatus: body.leadStatus || leads[index].leadStatus || 'new',
    notes: typeof body.notes === 'string' ? body.notes : leads[index].notes || '',
    updatedAt: new Date().toISOString(),
  };

  await writeLeads(leads);
  return NextResponse.json({ ok: true, lead: leads[index] });
}

export async function DELETE(request: Request) {
  if (!(await authorised(request))) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { id?: string } | null;
  if (!body?.id) return NextResponse.json({ error: 'Missing lead ID.' }, { status: 400 });

  const leads = await readLeads();
  const filtered = leads.filter((l) => l.id !== body.id);
  await writeLeads(filtered);
  return NextResponse.json({ ok: true });
}
