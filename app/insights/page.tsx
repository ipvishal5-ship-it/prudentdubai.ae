import type { Metadata } from 'next';
import { getAllArticles } from '@/lib/content';
import InsightsExplorer from '@/components/InsightsExplorer';
import { pageMetadata } from '@/lib/metadata';

export const metadata: Metadata = pageMetadata('Dubai Property Insights & Practical Guides', 'Source-linked guides for Dubai buyers covering service charges, off-plan checks and transfer procedures.', '/insights');

export default async function InsightsPage() {
  const articles = await getAllArticles();
  return <InsightsExplorer articles={articles} />;
}
