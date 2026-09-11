import type { Metadata } from 'next';
import { Suspense } from 'react';
import AreaExplorer from '@/components/AreaExplorer';

export const metadata: Metadata = {
  title: 'Areas we serve',
  description: 'Explore Dubai areas visually — waterfront, family communities, apartment districts and more. Pricing is shared in conversation.',
};

export default function CommunitiesPage() {
  return (
    <Suspense fallback={<section className="section"><div className="container"><p className="lede">Loading areas…</p></div></section>}>
      <AreaExplorer />
    </Suspense>
  );
}
