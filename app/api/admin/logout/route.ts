import { NextResponse } from 'next/server';
import { destroyAdminSession } from '@/lib/auth';
import { isSameOrigin } from '@/lib/request-security';

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: 'Request rejected.' }, { status: 403 });
  await destroyAdminSession();
  return NextResponse.json({ ok: true });
}
