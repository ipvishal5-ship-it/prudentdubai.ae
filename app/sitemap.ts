import type { MetadataRoute } from 'next';
import { getAllArticles } from '@/lib/content';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://prudentspaces.ae';
  const now = new Date();

  const routeConfig: {
    path: string;
    priority: number;
    changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  }[] = [
    { path: '', priority: 1.0, changeFrequency: 'weekly' },
    { path: '/communities', priority: 0.95, changeFrequency: 'weekly' },
    { path: '/calculator', priority: 0.95, changeFrequency: 'weekly' },
    { path: '/off-plan', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/insights', priority: 0.85, changeFrequency: 'daily' },
    { path: '/about', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/contact', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/terms', priority: 0.3, changeFrequency: 'yearly' },
  ];

  const articles = await getAllArticles();

  return [
    ...routeConfig.map((item) => ({
      url: `${base}${item.path}`,
      lastModified: now,
      changeFrequency: item.changeFrequency,
      priority: item.priority,
    })),
    ...articles.map((item) => ({
      url: `${base}/insights/${item.slug}`,
      lastModified: new Date(item.updatedAt || now),
      changeFrequency: 'monthly' as const,
      priority: 0.75,
    })),
  ];
}
