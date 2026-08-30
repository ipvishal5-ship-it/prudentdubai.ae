import type { Metadata } from 'next';
import Link from 'next/link';
import PropertyCard from '@/components/PropertyCard';
import { getAllProperties } from '@/lib/content';

export const metadata: Metadata = { title: 'Dubai Properties', description: 'Published Dubai property opportunities with a named information source and last verification date.' };
export default async function PropertiesPage() {
  const properties = await getAllProperties();
  return <>
    <section className="section"><div className="container"><span className="eyebrow">Property opportunities</span><h1 className="display">Only published after a source check.</h1><p className="lede">Prices and availability move quickly. Each opportunity below shows its source and the date its information was last checked; request a current availability sheet before making a decision.</p></div></section>
    <section className="section section-soft"><div className="container"><div className="card-grid">
      {properties.map(item => <PropertyCard key={item.id} property={item} />)}
      {properties.length === 0 && <div className="empty-state"><span className="eyebrow">No public inventory yet</span><h2>We are reviewing source documents before publishing.</h2><p>This is intentional. We will not present demonstration content as a live property listing.</p><Link className="button button-primary" href="/contact">Request a tailored search</Link></div>}
    </div></div></section>
  </>;
}
