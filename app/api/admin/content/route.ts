import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isAdminAuthenticated } from '@/lib/auth';
import { articleSchema, propertySchema } from '@/lib/data';
import { getAllArticles, getAllProperties, writeContentFile } from '@/lib/content';
import { isSameOrigin } from '@/lib/request-security';

export const runtime = 'nodejs';

async function authorised(request?: Request) {
  return (request ? isSameOrigin(request) : true) && (await isAdminAuthenticated());
}

export async function GET() {
  if (!(await authorised())) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 });
  const [properties, articles] = await Promise.all([
    getAllProperties({ includeDrafts: true }),
    getAllArticles({ includeDrafts: true }),
  ]);
  return NextResponse.json({ properties, articles });
}

export async function PUT(request: Request) {
  if (!(await authorised(request))) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { type?: unknown; item?: unknown } | null;
  if (body?.type === 'property') {
    const item = propertySchema.safeParse(body.item);
    if (!item.success) return NextResponse.json({ error: 'Invalid property data.', issues: item.error.issues }, { status: 400 });
    const records = await getAllProperties({ includeDrafts: true });
    const duplicate = records.find((record) => record.slug === item.data.slug && record.id !== item.data.id);
    if (duplicate) return NextResponse.json({ error: 'That property URL slug is already used.' }, { status: 409 });
    const index = records.findIndex((record) => record.id === item.data.id);
    if (index >= 0) records[index] = item.data; else records.unshift(item.data);
    await writeContentFile('properties.json', records);
  } else if (body?.type === 'article') {
    const item = articleSchema.safeParse(body.item);
    if (!item.success) return NextResponse.json({ error: 'Invalid article data.', issues: item.error.issues }, { status: 400 });
    const records = await getAllArticles({ includeDrafts: true });
    const duplicate = records.find((record) => record.slug === item.data.slug && record.id !== item.data.id);
    if (duplicate) return NextResponse.json({ error: 'That article URL slug is already used.' }, { status: 409 });
    const index = records.findIndex((record) => record.id === item.data.id);
    if (index >= 0) records[index] = item.data; else records.unshift(item.data);
    await writeContentFile('articles.json', records);
  } else {
    return NextResponse.json({ error: 'Unsupported content type.' }, { status: 400 });
  }
  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!(await authorised(request))) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { type?: unknown; id?: unknown } | null;
  if (typeof body?.id !== 'string') return NextResponse.json({ error: 'Invalid identifier.' }, { status: 400 });
  if (body.type === 'property') {
    const records = (await getAllProperties({ includeDrafts: true })).filter((record) => record.id !== body.id);
    await writeContentFile('properties.json', records);
  } else if (body.type === 'article') {
    const records = (await getAllArticles({ includeDrafts: true })).filter((record) => record.id !== body.id);
    await writeContentFile('articles.json', records);
  } else {
    return NextResponse.json({ error: 'Unsupported content type.' }, { status: 400 });
  }
  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true });
}
