import type { MetadataRoute } from 'next';
import { getAllArticles } from '@/lib/content';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://prudentdubai.ae';
  const staticRoutes = ['', '/communities', '/off-plan', '/insights', '/about', '/contact', '/calculator', '/golden-visa', '/privacy', '/terms'];
  const articles = await getAllArticles();
  return [
    ...staticRoutes.map((route) => ({ url: `${base}${route}`, changeFrequency: 'weekly' as const, priority: route === '' ? 1 : 0.7 })),
    ...articles.map((item) => ({ url: `${base}/insights/${item.slug}`, lastModified: item.updatedAt, changeFrequency: 'monthly' as const, priority: 0.6 })),
  ];
}
