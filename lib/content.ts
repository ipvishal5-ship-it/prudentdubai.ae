import 'server-only';

import { promises as fs } from 'node:fs';
import path from 'node:path';
import {
  Article,
  SiteSettings,
  articleSchema,
  siteSettingsSchema,
} from '@/lib/data';

const CONTENT_DIR = path.join(process.cwd(), 'content');

async function readJson<T>(file: string): Promise<T> {
  const raw = await fs.readFile(path.join(CONTENT_DIR, file), 'utf8');
  return JSON.parse(raw) as T;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  return siteSettingsSchema.parse(await readJson<unknown>('site.json'));
}

export async function getAllArticles({ includeDrafts = false } = {}): Promise<Article[]> {
  const parsed = articleSchema.array().parse(await readJson<unknown>('articles.json'));
  return includeDrafts ? parsed : parsed.filter((item) => item.status === 'published');
}

export async function getArticle(slug: string): Promise<Article | undefined> {
  return (await getAllArticles()).find((item) => item.slug === slug);
}

export async function writeContentFile(file: 'articles.json', value: unknown) {
  const destination = path.join(CONTENT_DIR, file);
  const temporary = `${destination}.tmp`;
  await fs.writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 });
  await fs.rename(temporary, destination);
}
