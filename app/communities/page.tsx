import type { Metadata } from 'next';
import { Suspense } from 'react';
import AreaExplorer from '@/components/AreaExplorer';
import { pageMetadata } from '@/lib/metadata';

export const metadata: Metadata = pageMetadata('Dubai Areas & Neighbourhoods | PrudentDubai', 'Browse general information about Dubai neighbourhoods by district group and common residential property type.', '/communities');

export default function CommunitiesPage() {
  return (
    <Suspense fallback={<section className="section"><div className="container"><p className="lede">Loading areas…</p></div></section>}>
      <AreaExplorer />
    </Suspense>
  );
}
