/* eslint-disable @next/next/no-img-element */
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllProperties, getProperty } from '@/lib/content';

export async function generateStaticParams() { return (await getAllProperties()).map(item => ({ slug: item.slug })); }
export async function generateMetadata({ params }: { params: Promise<{slug:string}> }): Promise<Metadata> {
  const item = await getProperty((await params).slug); return item ? { title: item.name, description: item.summary } : { title: 'Property not found' };
}
export default async function PropertyPage({ params }: { params: Promise<{slug:string}> }) {
  const item = await getProperty((await params).slug); if (!item) notFound();
  return <>
    <section className="section"><div className="container"><Link className="button button-link" href="/properties">← All properties</Link><div className="detail-grid">
      <div><div className="detail-image-wrap"><img className="detail-image" src={item.imageUrl} alt={`${item.name} in ${item.location}`} draggable={false} />{item.demo && <span className="demo-badge">DEMO · NOT LIVE</span>}</div><p className="fine-print" style={{marginTop:10}}>{item.demo ? 'Illustrative demonstration image. This record is not a live property offer.' : 'Confirm unit-specific views, finishes and dimensions in the contract documents.'}</p></div>
      <div><span className="eyebrow">{item.marketType} · {item.propertyType}</span><h1 className="section-title">{item.name}</h1><p className="lede">{item.location} · {item.developer}</p><p>{item.summary}</p>
        <div className="facts"><div className="fact"><span>Starting price</span><strong>AED {item.priceAED.toLocaleString()}</strong></div><div className="fact"><span>Bedrooms</span><strong>{item.bedrooms}</strong></div><div className="fact"><span>Area</span><strong>{item.areaSqft} sq ft</strong></div><div className="fact"><span>Handover / status</span><strong>{item.handover}</strong></div><div className="fact"><span>Payment plan</span><strong>{item.paymentPlan}</strong></div><div className="fact"><span>{item.demo ? 'Demo record date' : 'Last source check'}</span><strong>{item.verifiedAt}</strong></div></div>
        {item.highlights.length > 0 && <ul>{item.highlights.map(value => <li key={value}>{value}</li>)}</ul>}
        {item.demo && <div className="demo-banner"><span aria-hidden="true">◇</span>This is demonstration content for testing the website. Do not rely on it as availability, pricing or a sales offer.</div>}
        <div className="source-box"><strong>{item.demo ? 'Demonstration record' : 'Information source'}</strong><p className="fine-print">{item.demo ? 'Replace this entire record in Content Studio before launch.' : `Checked ${item.verifiedAt}. Price, unit choice and availability require fresh written confirmation.`}</p><a className="button button-link" href={item.sourceUrl} target="_blank" rel="noopener noreferrer">{item.sourceLabel} ↗</a></div>
        <div className="button-row"><Link className="button button-primary" href={`/contact?property=${encodeURIComponent(item.name)}`}>Request current availability</Link></div>
      </div>
    </div></div></section>
  </>;
}
