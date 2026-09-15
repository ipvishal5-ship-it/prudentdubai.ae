'use client';

import Image from 'next/image';
import { FormEvent, useEffect, useState } from 'react';
import type { Article, Property } from '@/lib/data';

type LeadRecord = {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  interest: string;
  budget: string;
  message: string;
  ip: string;
  receivedAt: string;
  leadStatus?: 'new' | 'contacted' | 'meeting' | 'closed' | 'archived';
  notes?: string;
};

type Data = { properties: Property[]; articles: Article[] };
type Tab = 'properties' | 'articles' | 'leads';

const propertyBlank = (): Property => ({
  id: crypto.randomUUID(),
  slug: '',
  status: 'draft',
  name: '',
  developer: '',
  location: '',
  propertyType: 'Apartment',
  marketType: 'Off-plan',
  priceAED: 1,
  bedrooms: '1',
  areaSqft: '',
  handover: '',
  paymentPlan: '',
  summary: '',
  highlights: [],
  imageUrl: 'https://',
  sourceLabel: '',
  sourceUrl: 'https://',
  verifiedAt: new Date().toISOString().slice(0, 10),
  featured: false,
  demo: false,
});

const articleBlank = (): Article => ({
  id: crypto.randomUUID(),
  slug: '',
  status: 'draft',
  title: '',
  excerpt: '',
  body: [''],
  category: '',
  publishedAt: new Date().toISOString().slice(0, 10),
  updatedAt: new Date().toISOString().slice(0, 10),
  sourceLabel: '',
  sourceUrl: 'https://',
  imageUrl: '',
  author: 'Prudent Dubai Advisory Team',
  readTime: '5 min read',
});

export default function AdminStudio() {
  const [data, setData] = useState<Data>({ properties: [], articles: [] });
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [tab, setTab] = useState<Tab>('leads');
  const [property, setProperty] = useState<Property | null>(null);
  const [article, setArticle] = useState<Article | null>(null);
  const [activeLead, setActiveLead] = useState<LeadRecord | null>(null);
  const [leadQuery, setLeadQuery] = useState('');
  const [message, setMessage] = useState('Loading workspace…');

  async function load() {
    const [contentRes, leadsRes] = await Promise.all([
      fetch('/api/admin/content', { cache: 'no-store' }),
      fetch('/api/admin/inquiries', { cache: 'no-store' }),
    ]);

    if (contentRes.status === 401 || leadsRes.status === 401) return window.location.reload();
    if (contentRes.ok) setData((await contentRes.json()) as Data);
    if (leadsRes.ok) {
      const result = (await leadsRes.json()) as { leads?: LeadRecord[] };
      setLeads(result.leads || []);
    }
    setMessage('');
  }

  useEffect(() => {
    const task = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(task);
  }, []);

  async function save(event: FormEvent) {
    event.preventDefault();
    if (tab === 'leads' && activeLead) {
      setMessage('Updating lead…');
      const response = await fetch('/api/admin/inquiries', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          id: activeLead.id,
          leadStatus: activeLead.leadStatus || 'new',
          notes: activeLead.notes || '',
        }),
      });
      if (response.ok) {
        setMessage('Lead record updated.');
        await load();
      } else {
        setMessage('Could not update lead.');
      }
      return;
    }

    const item = tab === 'properties' ? property : article;
    if (!item) return;
    const itemToSave =
      tab === 'articles' && article
        ? { ...article, imageUrl: article.imageUrl?.trim() ? article.imageUrl.trim() : undefined }
        : item;
    setMessage('Saving…');
    const response = await fetch('/api/admin/content', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type: tab === 'properties' ? 'property' : 'article', item: itemToSave }),
    });
    const result = (await response.json()) as { error?: string };
    setMessage(response.ok ? 'Saved. Published content is now live.' : result.error || 'Could not save.');
    if (response.ok) {
      await load();
      setProperty(null);
      setArticle(null);
    }
  }

  async function remove(type: 'property' | 'article' | 'lead', id: string) {
    if (!window.confirm('Delete this item permanently?')) return;
    if (type === 'lead') {
      const response = await fetch('/api/admin/inquiries', {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (response.ok) {
        if (activeLead?.id === id) setActiveLead(null);
        await load();
      } else {
        setMessage('Could not delete lead.');
      }
      return;
    }

    const response = await fetch('/api/admin/content', {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type, id }),
    });
    if (response.ok) await load();
    else setMessage('Could not delete this item.');
  }

  function exportLeadsCSV() {
    if (leads.length === 0) return alert('No leads to export.');
    const headers = ['ID', 'Date', 'Name', 'Email', 'Phone', 'Country', 'Purpose', 'Budget', 'Status', 'Notes', 'Message'];
    const rows = leads.map((l) => [
      l.id,
      l.receivedAt,
      `"${(l.name || '').replace(/"/g, '""')}"`,
      l.email,
      l.phone,
      `"${(l.country || '').replace(/"/g, '""')}"`,
      `"${(l.interest || '').replace(/"/g, '""')}"`,
      `"${(l.budget || '').replace(/"/g, '""')}"`,
      l.leadStatus || 'new',
      `"${(l.notes || '').replace(/"/g, '""')}"`,
      `"${(l.message || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `prudent_dubai_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.reload();
  }

  const filteredLeads = leads.filter((l) => {
    if (!leadQuery) return true;
    const q = leadQuery.toLowerCase();
    return (
      (l.name && l.name.toLowerCase().includes(q)) ||
      (l.email && l.email.toLowerCase().includes(q)) ||
      (l.phone && l.phone.toLowerCase().includes(q)) ||
      (l.country && l.country.toLowerCase().includes(q)) ||
      (l.interest && l.interest.toLowerCase().includes(q))
    );
  });

  const editing = tab === 'properties' ? property : tab === 'articles' ? article : activeLead;

  return (
    <main className="admin-shell">
      <div className="admin-workspace">
        <header className="admin-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Image src="/brand/smalllogo.png" alt="Prudent Dubai" width={40} height={27} />
            <div>
              <span className="eyebrow">Private workspace</span>
              <h1>Boss Management Studio</h1>
            </div>
          </div>
          <div className="admin-actions">
            {tab === 'leads' && (
              <button className="button button-secondary" onClick={exportLeadsCSV}>
                📥 Export CSV / Excel
              </button>
            )}
            <a className="button button-secondary" href="/" target="_blank">
              View website
            </a>
            <button className="button button-secondary" onClick={logout}>
              Sign out
            </button>
          </div>
        </header>

        <div className="admin-tabs" role="tablist">
          <button
            className={tab === 'leads' ? 'active' : ''}
            onClick={() => {
              setTab('leads');
              setProperty(null);
              setArticle(null);
            }}
          >
            📋 Leads & Inquiries ({leads.length})
          </button>
          <button
            className={tab === 'properties' ? 'active' : ''}
            onClick={() => {
              setTab('properties');
              setArticle(null);
              setActiveLead(null);
            }}
          >
            🏢 Properties ({data.properties.length})
          </button>
          <button
            className={tab === 'articles' ? 'active' : ''}
            onClick={() => {
              setTab('articles');
              setProperty(null);
              setActiveLead(null);
            }}
          >
            📰 Editorial ({data.articles.length})
          </button>
        </div>

        {message && <p className="admin-message" role="status">{message}</p>}

        <div className="admin-grid">
          <section className="admin-panel">
            <div className="admin-list-heading">
              <h2>
                {tab === 'leads' ? 'Received Enquiries' : tab === 'properties' ? 'Property Opportunities' : 'Editorial Insights'}
              </h2>
              {tab === 'leads' ? (
                <input
                  style={{ padding: '6px 12px', fontSize: '0.88rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
                  placeholder="Search name, phone, email…"
                  value={leadQuery}
                  onChange={(e) => setLeadQuery(e.target.value)}
                />
              ) : (
                <button
                  className="button button-primary"
                  onClick={() => (tab === 'properties' ? setProperty(propertyBlank()) : setArticle(articleBlank()))}
                >
                  Add new
                </button>
              )}
            </div>

            <div className="content-list">
              {tab === 'leads' &&
                filteredLeads.map((item) => (
                  <article
                    className={`content-list-item ${activeLead?.id === item.id ? 'active' : ''}`}
                    key={item.id}
                    onClick={() => setActiveLead(item)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div>
                      <span className={`status status-${item.leadStatus || 'new'}`}>
                        {item.leadStatus || 'new'}
                      </span>
                      <h3>{item.name}</h3>
                      <p>
                        {item.phone} • {item.country} • {item.interest}
                      </p>
                    </div>
                    <div className="row-actions">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveLead(item);
                        }}
                      >
                        Review
                      </button>
                      <button
                        className="danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          remove('lead', item.id);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))}

              {tab === 'properties' &&
                data.properties.map((item) => (
                  <article className="content-list-item" key={item.id}>
                    <div>
                      <span className={`status status-${item.status}`}>{item.status}</span>
                      <h3>{item.name}</h3>
                      <p>/{item.slug || 'url-not-set'}</p>
                    </div>
                    <div className="row-actions">
                      <button onClick={() => setProperty(item)}>Edit</button>
                      <button className="danger" onClick={() => remove('property', item.id)}>
                        Delete
                      </button>
                    </div>
                  </article>
                ))}

              {tab === 'articles' &&
                data.articles.map((item) => (
                  <article className="content-list-item" key={item.id}>
                    <div>
                      <span className={`status status-${item.status}`}>{item.status}</span>
                      <h3>{item.title}</h3>
                      <p>/{item.slug || 'url-not-set'}</p>
                    </div>
                    <div className="row-actions">
                      <button onClick={() => setArticle(item)}>Edit</button>
                      <button className="danger" onClick={() => remove('article', item.id)}>
                        Delete
                      </button>
                    </div>
                  </article>
                ))}

              {tab === 'leads' && filteredLeads.length === 0 && (
                <p className="empty-copy">No inquiries captured yet. Test submissions will appear here live.</p>
              )}
            </div>
          </section>

          <section className="admin-panel editor-panel">
            {!editing ? (
              <div className="empty-copy">
                <h2>Select an item to view or manage</h2>
                <p>Monitor client inquiries, track pipeline status, or edit live website content.</p>
              </div>
            ) : (
              <form onSubmit={save} className="editor-form">
                <div className="editor-heading">
                  <h2>
                    {tab === 'leads'
                      ? 'Lead Monitor & Status'
                      : tab === 'properties'
                      ? 'Property Editor'
                      : 'Insight Editor'}
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      setProperty(null);
                      setArticle(null);
                      setActiveLead(null);
                    }}
                  >
                    Close
                  </button>
                </div>

                {tab === 'leads' && activeLead && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                      <h3 style={{ margin: '0 0 8px 0', color: '#0f172a' }}>{activeLead.name}</h3>
                      <p style={{ margin: '4px 0', fontSize: '0.9rem', color: '#334155' }}>
                        <strong>Email:</strong>{' '}
                        <a href={`mailto:${activeLead.email}`}>{activeLead.email}</a>
                      </p>
                      <p style={{ margin: '4px 0', fontSize: '0.9rem', color: '#334155' }}>
                        <strong>Phone / WhatsApp:</strong>{' '}
                        <a href={`https://wa.me/${activeLead.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">
                          {activeLead.phone} 💬
                        </a>
                      </p>
                      <p style={{ margin: '4px 0', fontSize: '0.9rem', color: '#334155' }}>
                        <strong>Country:</strong> {activeLead.country}
                      </p>
                      <p style={{ margin: '4px 0', fontSize: '0.9rem', color: '#334155' }}>
                        <strong>Interest:</strong> {activeLead.interest}
                      </p>
                      <p style={{ margin: '4px 0', fontSize: '0.9rem', color: '#334155' }}>
                        <strong>Budget:</strong> {activeLead.budget || 'Not specified'}
                      </p>
                      <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                        Received: {new Date(activeLead.receivedAt).toLocaleString()} • IP: {activeLead.ip}
                      </p>
                    </div>

                    <div style={{ background: '#ffffff', padding: 16, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                      <h4 style={{ margin: '0 0 6px 0', fontSize: '0.95rem' }}>Client Message / Context:</h4>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#334155', whiteSpace: 'pre-wrap' }}>
                        {activeLead.message || 'No context text provided.'}
                      </p>
                    </div>

                    <label className="field-label">
                      Pipeline Lead Status
                      <select
                        className="field-input"
                        value={activeLead.leadStatus || 'new'}
                        onChange={(e) =>
                          setActiveLead({
                            ...activeLead,
                            leadStatus: e.target.value as LeadRecord['leadStatus'],
                          })
                        }
                      >
                        <option value="new">🆕 New Uncontacted Lead</option>
                        <option value="contacted">📞 Contacted / Discussion Active</option>
                        <option value="meeting">🤝 Meeting / Viewing Scheduled</option>
                        <option value="closed">✅ Deal Closed / Reserved</option>
                        <option value="archived">📁 Archived / Low Intent</option>
                      </select>
                    </label>

                    <label className="field-label">
                      Boss Internal Notes / Action Items
                      <textarea
                        className="field-input field-textarea"
                        rows={4}
                        placeholder="e.g. Agent assigned: Sultan. Client interested in Downtown 2-bedroom off-plan."
                        value={activeLead.notes || ''}
                        onChange={(e) => setActiveLead({ ...activeLead, notes: e.target.value })}
                      />
                    </label>

                    <button className="button button-primary" type="submit">
                      Save Lead Status & Notes
                    </button>
                  </div>
                )}

                {property && tab === 'properties' && <PropertyFields value={property} change={setProperty} />}
                {article && tab === 'articles' && <ArticleFields value={article} change={setArticle} />}
                {tab !== 'leads' && (
                  <button className="button button-primary" type="submit">
                    Save content
                  </button>
                )}
              </form>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required = true,
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="field-label">
      {label}
      <input className="field-input" type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} />
    </label>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="field-label">
      {label}
      <textarea className="field-input field-textarea" value={value} onChange={(e) => onChange(e.target.value)} required />
    </label>
  );
}

function PropertyFields({ value, change }: { value: Property; change: (value: Property) => void }) {
  const set = <K extends keyof Property>(key: K, item: Property[K]) => change({ ...value, [key]: item });
  return (
    <>
      <div className="form-pair">
        <Field label="Project / property name" value={value.name} onChange={(v) => set('name', v)} />
        <Field label="URL slug" value={value.slug} onChange={(v) => set('slug', v)} />
      </div>
      <div className="form-pair">
        <Field label="Developer / seller" value={value.developer} onChange={(v) => set('developer', v)} />
        <Field label="Location" value={value.location} onChange={(v) => set('location', v)} />
      </div>
      <div className="form-pair">
        <label className="field-label">
          Status
          <select className="field-input" value={value.status} onChange={(e) => set('status', e.target.value as Property['status'])}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>
        <label className="field-label">
          Market type
          <select className="field-input" value={value.marketType} onChange={(e) => set('marketType', e.target.value as Property['marketType'])}>
            <option>Off-plan</option>
            <option>Ready</option>
          </select>
        </label>
      </div>
      <div className="form-pair">
        <label className="field-label">
          Property type
          <select className="field-input" value={value.propertyType} onChange={(e) => set('propertyType', e.target.value as Property['propertyType'])}>
            {['Apartment', 'Villa', 'Townhouse', 'Penthouse', 'Plot', 'Commercial'].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <Field label="Starting price (AED)" type="number" value={value.priceAED} onChange={(v) => set('priceAED', Number(v))} />
      </div>
      <div className="form-pair">
        <Field label="Bedrooms" value={value.bedrooms} onChange={(v) => set('bedrooms', v)} />
        <Field label="Area range (sq ft)" value={value.areaSqft} onChange={(v) => set('areaSqft', v)} />
      </div>
      <div className="form-pair">
        <Field label="Handover / availability" value={value.handover} onChange={(v) => set('handover', v)} />
        <Field label="Payment plan" value={value.paymentPlan} onChange={(v) => set('paymentPlan', v)} />
      </div>
      <TextArea label="Factual summary" value={value.summary} onChange={(v) => set('summary', v)} />
      <TextArea
        label="Highlights (one per line)"
        value={value.highlights.join('\n')}
        onChange={(v) => set('highlights', v.split('\n').map((s) => s.trim()).filter(Boolean))}
      />
      <Field label="Image URL (/areas/... or authorised HTTPS image)" value={value.imageUrl} onChange={(v) => set('imageUrl', v)} />
      {value.imageUrl && (
        <div style={{ marginBottom: 14 }}>
          <span style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>
            Property Image Preview:
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value.imageUrl}
            alt="Property Preview"
            style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 8, border: '1px solid #cbd5e1' }}
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
        </div>
      )}
      <div className="form-pair">
        <Field label="Source name" value={value.sourceLabel} onChange={(v) => set('sourceLabel', v)} />
        <Field label="Last verified" type="date" value={value.verifiedAt} onChange={(v) => set('verifiedAt', v)} />
      </div>
      <Field label="Source URL (HTTPS)" value={value.sourceUrl} onChange={(v) => set('sourceUrl', v)} />
      <label className="check-label">
        <input type="checkbox" checked={value.featured} onChange={(e) => set('featured', e.target.checked)} /> Feature on homepage
      </label>
      <label className="check-label">
        <input type="checkbox" checked={value.demo} onChange={(e) => set('demo', e.target.checked)} /> Mark clearly as demonstration content
      </label>
    </>
  );
}

function ArticleFields({ value, change }: { value: Article; change: (value: Article) => void }) {
  const set = <K extends keyof Article>(key: K, item: Article[K]) => change({ ...value, [key]: item });
  return (
    <>
      <Field label="Title" value={value.title} onChange={(v) => set('title', v)} />
      <Field label="URL slug" value={value.slug} onChange={(v) => set('slug', v)} />
      <div className="form-pair">
        <label className="field-label">
          Status
          <select className="field-input" value={value.status} onChange={(e) => set('status', e.target.value as Article['status'])}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>
        <Field label="Category" value={value.category} onChange={(v) => set('category', v)} />
      </div>
      <TextArea label="Excerpt" value={value.excerpt} onChange={(v) => set('excerpt', v)} />
      <TextArea
        label="Body (separate paragraphs with a blank line)"
        value={value.body.join('\n\n')}
        onChange={(v) => set('body', v.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean))}
      />
      <Field
        label="Featured Image URL (/insights/... or authorized HTTPS image e.g. https://images.unsplash.com/...)"
        value={value.imageUrl || ''}
        onChange={(v) => set('imageUrl', v)}
        required={false}
      />
      {value.imageUrl && (
        <div style={{ marginBottom: 14 }}>
          <span style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>
            Article Image Preview:
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value.imageUrl}
            alt="Article Preview"
            style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 8, border: '1px solid #cbd5e1' }}
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
        </div>
      )}
      <div className="form-pair">
        <Field label="Author" value={value.author || ''} onChange={(v) => set('author', v)} required={false} />
        <Field label="Read Time (e.g. 5 min read)" value={value.readTime || ''} onChange={(v) => set('readTime', v)} required={false} />
      </div>
      <div className="form-pair">
        <Field label="Published date" type="date" value={value.publishedAt} onChange={(v) => set('publishedAt', v)} />
        <Field label="Updated date" type="date" value={value.updatedAt} onChange={(v) => set('updatedAt', v)} />
      </div>
      <Field label="Source name" value={value.sourceLabel} onChange={(v) => set('sourceLabel', v)} />
      <Field label="Source URL (HTTPS)" value={value.sourceUrl} onChange={(v) => set('sourceUrl', v)} />
    </>
  );
}
