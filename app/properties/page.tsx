import type { Metadata } from 'next';
import PropertyExplorer from '@/components/PropertyExplorer';
import { T } from '@/components/LanguageContext';
import { getAllProperties } from '@/lib/content';

export const metadata: Metadata = { title: 'Dubai Properties', description: 'Published Dubai property opportunities with a named information source and last verification date.' };
export default async function PropertiesPage() {
  const properties = await getAllProperties();
  return <>
    <section className="section"><div className="container"><span className="eyebrow"><T id="properties.eyebrow" /></span><h1 className="display"><T id="properties.title" /></h1><p className="lede"><T id="properties.lede" /></p><div className="demo-banner"><span aria-hidden="true">◇</span><T id="properties.demoBanner" /></div></div></section>
    <section className="section section-soft"><div className="container"><PropertyExplorer properties={properties} /></div></section>
  </>;
}
