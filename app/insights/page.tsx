import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllArticles } from '@/lib/content';

export const metadata: Metadata = { title: 'Dubai Property Insights', description: 'Practical, source-linked guides for people considering property in Dubai.' };
export default async function InsightsPage() {
  const articles = await getAllArticles();
  return <><section className="section"><div className="container"><span className="eyebrow">Property insights</span><h1 className="display">Useful information, with the source attached.</h1><p className="lede">Guides are reviewed against named official or primary sources. Dates are shown so you can judge whether a rule or process needs fresh confirmation.</p></div></section>
  <section className="section section-soft"><div className="container"><div className="card-grid">{articles.map(item => <article className="article-card" key={item.id}><span className="eyebrow">{item.category}</span><h2 style={{fontSize:'1.55rem',marginTop:16}}>{item.title}</h2><p>{item.excerpt}</p><p className="fine-print">Updated {item.updatedAt}</p><Link className="button button-link" href={`/insights/${item.slug}`}>Read guide →</Link></article>)}</div></div></section></>;
}
