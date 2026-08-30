import { NextResponse } from 'next/server';
import { adminIsConfigured, createAdminSession, verifyAdminPassword } from '@/lib/auth';
import { isSameOrigin, rateLimit, requestIp } from '@/lib/request-security';

export async function POST(request: Request) {
  if (!adminIsConfigured()) {
    return NextResponse.json({ error: 'Admin access is not configured.' }, { status: 503 });
  }
  if (!isSameOrigin(request) || !rateLimit(`login:${requestIp(request)}`, 5, 15 * 60_000)) {
    return NextResponse.json({ error: 'Request rejected.' }, { status: 429 });
  }
  const body = (await request.json().catch(() => null)) as { password?: unknown } | null;
  if (typeof body?.password !== 'string' || !verifyAdminPassword(body.password)) {
    return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
  }
  await createAdminSession();
  return NextResponse.json({ ok: true });
}
