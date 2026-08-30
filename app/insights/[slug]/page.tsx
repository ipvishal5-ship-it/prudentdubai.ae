import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllArticles, getArticle } from '@/lib/content';

export async function generateStaticParams() { return (await getAllArticles()).map(item => ({slug:item.slug})); }
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const item=await getArticle((await params).slug);return item?{title:item.title,description:item.excerpt}:{title:'Insight not found'};}
export default async function ArticlePage({params}:{params:Promise<{slug:string}>}){
  const item=await getArticle((await params).slug);if(!item)notFound();
  return <article className="section"><div className="container article-layout"><Link className="button button-link" href="/insights">← All insights</Link><span className="eyebrow" style={{display:'block',marginTop:22}}>{item.category}</span><h1 className="display">{item.title}</h1><p className="lede">{item.excerpt}</p><p className="fine-print">Published {item.publishedAt} · Reviewed {item.updatedAt}</p><div style={{marginTop:44}}>{item.body.map((paragraph,index)=><p key={index}>{paragraph}</p>)}</div><div className="source-box"><strong>Primary reference</strong><p className="fine-print">Open the source directly and confirm any requirement that may have changed.</p><a className="button button-link" href={item.sourceUrl} target="_blank" rel="noopener noreferrer">{item.sourceLabel} ↗</a></div></div></article>;
}
