import type { Metadata } from 'next';
import { Suspense } from 'react';
import AreaExplorer from '@/components/AreaExplorer';

export const metadata: Metadata = {
  title: 'Explore Dubai areas',
  description: 'Browse general information about Dubai neighbourhoods by district group and common residential property type.',
};

export default function CommunitiesPage() {
  return (
    <Suspense fallback={<section className="section"><div className="container"><p className="lede">Loading areas…</p></div></section>}>
      <AreaExplorer />
    </Suspense>
  );
}
