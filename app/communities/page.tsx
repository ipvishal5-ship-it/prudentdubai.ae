import type { Metadata } from 'next';
import { Suspense } from 'react';
import AreaExplorer from '@/components/AreaExplorer';
import { pageMetadata } from '@/lib/metadata';
import { DUBAI_AREA_GROUPS } from '@/lib/areas';

export const metadata: Metadata = pageMetadata(
  'Dubai Communities & Neighbourhoods Guide 2026 | Top Investment Areas',
  'Comprehensive guide to Dubai residential areas and communities. Compare Downtown Dubai, Palm Jumeirah, Dubai Marina, Business Bay, Dubai Hills, and top off-plan districts.',
  '/communities',
  undefined,
  [
    'best areas to buy property in dubai',
    'dubai neighbourhoods guide',
    'downtown dubai luxury apartments',
    'palm jumeirah villas for sale',
    'dubai marina waterfront residences',
    'dubai hills estate off-plan',
  ]
);

export default function CommunitiesPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ItemList',
        name: 'Top Dubai Residential & Investment Communities',
        description: 'Explore premier residential neighbourhoods and off-plan investment corridors across Dubai.',
        numberOfItems: DUBAI_AREA_GROUPS.length,
        itemListElement: DUBAI_AREA_GROUPS.map((group, groupIdx) => ({
          '@type': 'ListItem',
          position: groupIdx + 1,
          name: group.title,
          description: `Key residential district in Dubai featuring ${group.areas.map((a) => a.name).join(', ')}.`,
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://prudentdubai.ae',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Communities & Areas',
            item: 'https://prudentdubai.ae/communities',
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <Suspense
        fallback={
          <section className="section">
            <div className="container">
              <p className="lede">Loading areas…</p>
            </div>
          </section>
        }
      >
        <AreaExplorer />
      </Suspense>
    </>
  );
}
