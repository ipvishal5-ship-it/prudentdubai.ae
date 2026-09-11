import type { Metadata } from 'next';
import { getAllArticles } from '@/lib/content';
import InsightsExplorer from '@/components/InsightsExplorer';

export const metadata: Metadata = {
  title: 'Dubai Property Insights & Practical Guides',
  description: 'Grounded, source-verified property guides for Dubai buyers and investors covering service charges, off-plan escrow laws, and trustee transfer procedures.',
};

export default async function InsightsPage() {
  const articles = await getAllArticles();
  return <InsightsExplorer articles={articles} />;
}
