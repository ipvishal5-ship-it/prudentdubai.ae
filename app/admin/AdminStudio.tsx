'use client';

import { FormEvent, useEffect, useState } from 'react';
import type { Article, Property } from '@/lib/data';

type Data = { properties: Property[]; articles: Article[] };
type Tab = 'properties' | 'articles';

const propertyBlank = (): Property => ({
  id: crypto.randomUUID(), slug: '', status: 'draft', name: '', developer: '', location: '',
  propertyType: 'Apartment', marketType: 'Off-plan', priceAED: 1, bedrooms: '1', areaSqft: '',
  handover: '', paymentPlan: '', summary: '', highlights: [], imageUrl: 'https://', sourceLabel: '',
  sourceUrl: 'https://', verifiedAt: new Date().toISOString().slice(0, 10), featured: false, demo: false,
});

const articleBlank = (): Article => ({
  id: crypto.randomUUID(), slug: '', status: 'draft', title: '', excerpt: '', body: [''], category: '',
  publishedAt: new Date().toISOString().slice(0, 10), updatedAt: new Date().toISOString().slice(0, 10),
  sourceLabel: '', sourceUrl: 'https://',
});

export default function AdminStudio() {
  const [data, setData] = useState<Data>({ properties: [], articles: [] });
  const [tab, setTab] = useState<Tab>('properties');
  const [property, setProperty] = useState<Property | null>(null);
  const [article, setArticle] = useState<Article | null>(null);
  const [message, setMessage] = useState('Loading content…');

  async function load() {
    const response = await fetch('/api/admin/content', { cache: 'no-store' });
    if (response.status === 401) return window.location.reload();
    setData(await response.json() as Data);
    setMessage('');
  }
  useEffect(() => {
    const task = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(task);
  }, []);

  async function save(event: FormEvent) {
    event.preventDefault();
    const item = tab === 'properties' ? property : article;
    if (!item) return;
    setMessage('Saving…');
    const response = await fetch('/api/admin/content', {
      method: 'PUT', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type: tab === 'properties' ? 'property' : 'article', item }),
    });
    const result = await response.json() as { error?: string };
    setMessage(response.ok ? 'Saved. Published content is now live.' : result.error || 'Could not save.');
    if (response.ok) { await load(); setProperty(null); setArticle(null); }
  }

  async function remove(type: 'property' | 'article', id: string) {
    if (!window.confirm('Delete this item permanently?')) return;
    const response = await fetch('/api/admin/content', {
      method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ type, id }),
    });
    if (response.ok) await load(); else setMessage('Could not delete this item.');
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.reload();
  }

  const editing = tab === 'properties' ? property : article;
  return (
    <main className="admin-shell">
      <div className="admin-workspace">
        <header className="admin-toolbar">
          <div><span className="eyebrow">Private workspace</span><h1>Content Studio</h1></div>
          <div className="admin-actions"><a className="button button-secondary" href="/" target="_blank">View website</a><button className="button button-secondary" onClick={logout}>Sign out</button></div>
        </header>
        <div className="admin-tabs" role="tablist">
          <button className={tab === 'properties' ? 'active' : ''} onClick={() => { setTab('properties'); setArticle(null); }}>Properties ({data.properties.length})</button>
          <button className={tab === 'articles' ? 'active' : ''} onClick={() => { setTab('articles'); setProperty(null); }}>Insights ({data.articles.length})</button>
        </div>
        {message && <p className="admin-message" role="status">{message}</p>}
        <div className="admin-grid">
          <section className="admin-panel">
            <div className="admin-list-heading"><h2>{tab === 'properties' ? 'Property opportunities' : 'Editorial insights'}</h2><button className="button button-primary" onClick={() => tab === 'properties' ? setProperty(propertyBlank()) : setArticle(articleBlank())}>Add new</button></div>
            <div className="content-list">
              {(tab === 'properties' ? data.properties : data.articles).map((item) => (
                <article className="content-list-item" key={item.id}>
                  <div><span className={`status status-${item.status}`}>{item.status}</span><h3>{'name' in item ? item.name : item.title}</h3><p>/{item.slug || 'url-not-set'}</p></div>
                  <div className="row-actions"><button onClick={() => 'name' in item ? setProperty(item) : setArticle(item)}>Edit</button><button className="danger" onClick={() => remove('name' in item ? 'property' : 'article', item.id)}>Delete</button></div>
                </article>
              ))}
              {(tab === 'properties' ? data.properties : data.articles).length === 0 && <p className="empty-copy">No items yet. Add the first verified record when its source documents are ready.</p>}
            </div>
          </section>
          <section className="admin-panel editor-panel">
            {!editing ? <div className="empty-copy"><h2>Select an item to edit</h2><p>Drafts stay private. Published items appear on the website.</p></div> : (
              <form onSubmit={save} className="editor-form">
                <div className="editor-heading"><h2>{tab === 'properties' ? 'Property editor' : 'Insight editor'}</h2><button type="button" onClick={() => { setProperty(null); setArticle(null); }}>Close</button></div>
                {property && tab === 'properties' && <PropertyFields value={property} change={setProperty} />}
                {article && tab === 'articles' && <ArticleFields value={article} change={setArticle} />}
                <button className="button button-primary" type="submit">Save content</button>
              </form>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function Field({ label, value, onChange, type = 'text', required = true }: { label: string; value: string | number; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return <label className="field-label">{label}<input className="field-input" type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} /></label>;
}
function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="field-label">{label}<textarea className="field-input field-textarea" value={value} onChange={(e) => onChange(e.target.value)} required /></label>;
}
function PropertyFields({ value, change }: { value: Property; change: (value: Property) => void }) {
  const set = <K extends keyof Property>(key: K, item: Property[K]) => change({ ...value, [key]: item });
  return <>
    <div className="form-pair"><Field label="Project / property name" value={value.name} onChange={(v) => set('name', v)} /><Field label="URL slug" value={value.slug} onChange={(v) => set('slug', v)} /></div>
    <div className="form-pair"><Field label="Developer / seller" value={value.developer} onChange={(v) => set('developer', v)} /><Field label="Location" value={value.location} onChange={(v) => set('location', v)} /></div>
    <div className="form-pair"><label className="field-label">Status<select className="field-input" value={value.status} onChange={(e) => set('status', e.target.value as Property['status'])}><option value="draft">Draft</option><option value="published">Published</option></select></label><label className="field-label">Market type<select className="field-input" value={value.marketType} onChange={(e) => set('marketType', e.target.value as Property['marketType'])}><option>Off-plan</option><option>Ready</option></select></label></div>
    <div className="form-pair"><label className="field-label">Property type<select className="field-input" value={value.propertyType} onChange={(e) => set('propertyType', e.target.value as Property['propertyType'])}>{['Apartment','Villa','Townhouse','Penthouse','Plot','Commercial'].map(v => <option key={v}>{v}</option>)}</select></label><Field label="Starting price (AED)" type="number" value={value.priceAED} onChange={(v) => set('priceAED', Number(v))} /></div>
    <div className="form-pair"><Field label="Bedrooms" value={value.bedrooms} onChange={(v) => set('bedrooms', v)} /><Field label="Area range (sq ft)" value={value.areaSqft} onChange={(v) => set('areaSqft', v)} /></div>
    <div className="form-pair"><Field label="Handover / availability" value={value.handover} onChange={(v) => set('handover', v)} /><Field label="Payment plan" value={value.paymentPlan} onChange={(v) => set('paymentPlan', v)} /></div>
    <TextArea label="Factual summary" value={value.summary} onChange={(v) => set('summary', v)} />
    <TextArea label="Highlights (one per line)" value={value.highlights.join('\n')} onChange={(v) => set('highlights', v.split('\n').map(s => s.trim()).filter(Boolean))} />
    <Field label="Image URL (/demo/... or authorised HTTPS image)" value={value.imageUrl} onChange={(v) => set('imageUrl', v)} />
    <div className="form-pair"><Field label="Source name" value={value.sourceLabel} onChange={(v) => set('sourceLabel', v)} /><Field label="Last verified" type="date" value={value.verifiedAt} onChange={(v) => set('verifiedAt', v)} /></div>
    <Field label="Source URL (HTTPS)" value={value.sourceUrl} onChange={(v) => set('sourceUrl', v)} />
    <label className="check-label"><input type="checkbox" checked={value.featured} onChange={(e) => set('featured', e.target.checked)} /> Feature on homepage</label>
    <label className="check-label"><input type="checkbox" checked={value.demo} onChange={(e) => set('demo', e.target.checked)} /> Mark clearly as demonstration content</label>
  </>;
}
function ArticleFields({ value, change }: { value: Article; change: (value: Article) => void }) {
  const set = <K extends keyof Article>(key: K, item: Article[K]) => change({ ...value, [key]: item });
  return <>
    <Field label="Title" value={value.title} onChange={(v) => set('title', v)} /><Field label="URL slug" value={value.slug} onChange={(v) => set('slug', v)} />
    <div className="form-pair"><label className="field-label">Status<select className="field-input" value={value.status} onChange={(e) => set('status', e.target.value as Article['status'])}><option value="draft">Draft</option><option value="published">Published</option></select></label><Field label="Category" value={value.category} onChange={(v) => set('category', v)} /></div>
    <TextArea label="Excerpt" value={value.excerpt} onChange={(v) => set('excerpt', v)} /><TextArea label="Body (separate paragraphs with a blank line)" value={value.body.join('\n\n')} onChange={(v) => set('body', v.split(/\n\s*\n/).map(s => s.trim()).filter(Boolean))} />
    <div className="form-pair"><Field label="Published date" type="date" value={value.publishedAt} onChange={(v) => set('publishedAt', v)} /><Field label="Updated date" type="date" value={value.updatedAt} onChange={(v) => set('updatedAt', v)} /></div>
    <Field label="Source name" value={value.sourceLabel} onChange={(v) => set('sourceLabel', v)} /><Field label="Source URL (HTTPS)" value={value.sourceUrl} onChange={(v) => set('sourceUrl', v)} />
  </>;
}
