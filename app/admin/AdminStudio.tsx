'use client';

import Image from 'next/image';
import { FormEvent, useEffect, useState } from 'react';
import type { Article } from '@/lib/data';

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

type Data = { articles: Article[] };
type Tab = 'leads' | 'analytics' | 'articles';

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
  author: 'Prudent Spaces Advisory Team',
  readTime: '5 min read',
});

export default function AdminStudio() {
  const [data, setData] = useState<Data>({ articles: [] });
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [tab, setTab] = useState<Tab>('leads');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'contacted' | 'meeting' | 'closed' | 'archived'>('all');
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

    if (!article) return;
    const itemToSave = { ...article, imageUrl: article.imageUrl?.trim() ? article.imageUrl.trim() : undefined };
    setMessage('Saving…');
    const response = await fetch('/api/admin/content', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type: 'article', item: itemToSave }),
    });
    const result = (await response.json()) as { error?: string };
    setMessage(response.ok ? 'Saved. Published content is now live.' : result.error || 'Could not save.');
    if (response.ok) {
      await load();
      setArticle(null);
    }
  }

  async function remove(type: 'article' | 'lead', id: string) {
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

  const statusCounts = {
    all: leads.length,
    new: leads.filter((l) => (l.leadStatus || 'new') === 'new').length,
    contacted: leads.filter((l) => l.leadStatus === 'contacted').length,
    meeting: leads.filter((l) => l.leadStatus === 'meeting').length,
    closed: leads.filter((l) => l.leadStatus === 'closed').length,
    archived: leads.filter((l) => l.leadStatus === 'archived').length,
  };

  const filteredLeads = leads.filter((l) => {
    if (statusFilter !== 'all' && (l.leadStatus || 'new') !== statusFilter) return false;
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

  const editing = tab === 'articles' ? article : activeLead;

  return (
    <main className="admin-shell">
      <div className="admin-workspace">
        <header className="admin-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Image src="/brand/smalllogo.png" alt="Prudent Spaces" width={40} height={27} />
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
              setArticle(null);
            }}
          >
            📋 Leads & Inquiries ({leads.length})
          </button>
          <button
            className={tab === 'analytics' ? 'active' : ''}
            onClick={() => {
              setTab('analytics');
              setArticle(null);
              setActiveLead(null);
            }}
          >
            📊 Analytics & Funnel
          </button>
          <button
            className={tab === 'articles' ? 'active' : ''}
            onClick={() => {
              setTab('articles');
              setActiveLead(null);
            }}
          >
            📰 Market Insights & Blogs ({data.articles.length})
          </button>
        </div>

        {message && <p className="admin-message" role="status">{message}</p>}

        {tab === 'analytics' ? (
          <AnalyticsView leads={leads} />
        ) : (
          <div className="admin-grid">
            <section className="admin-panel">
              <div className="admin-list-heading">
                <h2>
                  {tab === 'leads' ? 'Received Enquiries' : 'Editorial Insights'}
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
                    onClick={() => setArticle(articleBlank())}
                  >
                    Add new
                  </button>
                )}
              </div>

              {tab === 'leads' && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '12px 0 16px 0' }}>
                  {[
                    { id: 'all', label: `All (${statusCounts.all})` },
                    { id: 'new', label: `🆕 New (${statusCounts.new})` },
                    { id: 'contacted', label: `📞 Contacted (${statusCounts.contacted})` },
                    { id: 'meeting', label: `🤝 Meeting (${statusCounts.meeting})` },
                    { id: 'closed', label: `✅ Closed (${statusCounts.closed})` },
                    { id: 'archived', label: `📁 Archived (${statusCounts.archived})` },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setStatusFilter(filter.id as typeof statusFilter)}
                      style={{
                        padding: '4px 10px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        borderRadius: 999,
                        border: '1px solid',
                        borderColor: statusFilter === filter.id ? '#0f172a' : '#e2e8f0',
                        background: statusFilter === filter.id ? '#0f172a' : '#ffffff',
                        color: statusFilter === filter.id ? '#ffffff' : '#475569',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              )}

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
                      : 'Insight Editor'}
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
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

                      <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                        <a
                          href={`https://wa.me/${(activeLead.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(
                            `Hello ${activeLead.name}, this is Vikas from Prudent Spaces. Thank you for your inquiry regarding ${activeLead.interest}. How can I assist you with your property search in Dubai?`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            flex: 1,
                            minWidth: 140,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6,
                            padding: '10px 14px',
                            background: '#25D366',
                            color: '#ffffff',
                            borderRadius: 8,
                            fontWeight: 600,
                            textDecoration: 'none',
                            fontSize: '0.86rem',
                            boxShadow: '0 2px 8px rgba(37,211,102,0.25)',
                          }}
                        >
                          💬 WhatsApp Client
                        </a>
                        <a
                          href={`tel:${activeLead.phone}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6,
                            padding: '10px 14px',
                            background: '#0f172a',
                            color: '#ffffff',
                            borderRadius: 8,
                            fontWeight: 600,
                            textDecoration: 'none',
                            fontSize: '0.86rem',
                          }}
                        >
                          📞 Call
                        </a>
                        <a
                          href={`mailto:${activeLead.email}?subject=Prudent%20Dubai%20Property%20Advisory%20-%20${encodeURIComponent(activeLead.interest || '')}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6,
                            padding: '10px 14px',
                            background: '#ffffff',
                            color: '#334155',
                            borderRadius: 8,
                            fontWeight: 600,
                            textDecoration: 'none',
                            fontSize: '0.86rem',
                            border: '1px solid #cbd5e1',
                          }}
                        >
                          ✉️ Email
                        </a>
                      </div>
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
        )}
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

function AnalyticsView({ leads }: { leads: LeadRecord[] }) {
  const total = leads.length;
  const statusCounts = {
    new: leads.filter((l) => (l.leadStatus || 'new') === 'new').length,
    contacted: leads.filter((l) => l.leadStatus === 'contacted').length,
    meeting: leads.filter((l) => l.leadStatus === 'meeting').length,
    closed: leads.filter((l) => l.leadStatus === 'closed').length,
    archived: leads.filter((l) => l.leadStatus === 'archived').length,
  };
  const activePipeline = statusCounts.contacted + statusCounts.meeting;
  const conversionRate = total ? Math.round((statusCounts.closed / total) * 100) : 0;

  const interestMap: Record<string, number> = {};
  leads.forEach((l) => {
    if (l.interest) interestMap[l.interest] = (interestMap[l.interest] || 0) + 1;
  });

  const countryMap: Record<string, number> = {};
  leads.forEach((l) => {
    const c = l.country?.trim() || 'Not specified';
    countryMap[c] = (countryMap[c] || 0) + 1;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%', marginTop: 8 }}>
      {/* 4 Key Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <div style={{ background: '#ffffff', padding: 22, borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Total Inquiries
          </span>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0f172a', margin: '6px 0 2px 0' }}>{total}</div>
          <span style={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: 600 }}>● 100% saved locally</span>
        </div>

        <div style={{ background: '#ffffff', padding: 22, borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Active Pipeline
          </span>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0284c7', margin: '6px 0 2px 0' }}>{activePipeline}</div>
          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Contacted & viewing meetings</span>
        </div>

        <div style={{ background: '#ffffff', padding: 22, borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Deals Closed
          </span>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#16a34a', margin: '6px 0 2px 0' }}>{statusCounts.closed}</div>
          <span style={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: 600 }}>Reserved property investments</span>
        </div>

        <div style={{ background: '#ffffff', padding: 22, borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Conversion Rate
          </span>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#c5a059', margin: '6px 0 2px 0' }}>{conversionRate}%</div>
          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Overall lead-to-deal ratio</span>
        </div>
      </div>

      {/* Grid: Funnel & Interest */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
        {/* Pipeline Funnel */}
        <div style={{ background: '#ffffff', padding: 24, borderRadius: 14, border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', color: '#0f172a' }}>📈 Pipeline Stage Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: '🆕 New Uncontacted', count: statusCounts.new, color: '#eab308' },
              { label: '📞 Contacted / Discussion Active', count: statusCounts.contacted, color: '#3b82f6' },
              { label: '🤝 Meeting / Viewing Scheduled', count: statusCounts.meeting, color: '#8b5cf6' },
              { label: '✅ Deal Closed / Reserved', count: statusCounts.closed, color: '#10b981' },
              { label: '📁 Archived / Cold', count: statusCounts.archived, color: '#94a3b8' },
            ].map((stage) => {
              const pct = total ? Math.round((stage.count / total) * 100) : 0;
              return (
                <div key={stage.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: 5 }}>
                    <span style={{ fontWeight: 600, color: '#334155' }}>{stage.label}</span>
                    <span style={{ color: '#64748b' }}>{stage.count} ({pct}%)</span>
                  </div>
                  <div style={{ width: '100%', height: 9, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: stage.color, borderRadius: 999 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Client Intent */}
        <div style={{ background: '#ffffff', padding: 24, borderRadius: 14, border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', color: '#0f172a' }}>🎯 Inquiry Purpose Distribution</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Object.entries(interestMap).map(([interest, count]) => {
              const pct = total ? Math.round((count / total) * 100) : 0;
              return (
                <div key={interest} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                  <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>{interest}</span>
                  <span style={{ background: '#e2e8f0', color: '#0f172a', padding: '3px 10px', borderRadius: 999, fontSize: '0.8rem', fontWeight: 700 }}>
                    {count} leads ({pct}%)
                  </span>
                </div>
              );
            })}
            {Object.keys(interestMap).length === 0 && (
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>No inquiry data available yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Geographic & System Health */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
        {/* Geographic Breakdown */}
        <div style={{ background: '#ffffff', padding: 24, borderRadius: 14, border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', color: '#0f172a' }}>🌍 Top Client Nationalities / Countries</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {Object.entries(countryMap).map(([country, count]) => (
              <div key={country} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: '0.88rem' }}>
                <span style={{ fontWeight: 600, color: '#334155' }}>{country}</span>
                <span style={{ color: '#c5a059', fontWeight: 800 }}>{count}</span>
              </div>
            ))}
            {Object.keys(countryMap).length === 0 && (
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>No nationality data recorded yet.</p>
            )}
          </div>
        </div>

        {/* System & Health Status */}
        <div style={{ background: '#ffffff', padding: 24, borderRadius: 14, border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', color: '#0f172a' }}>🛡️ System & Compliance Health</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11, fontSize: '0.88rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#16a34a', fontSize: '1.2rem' }}>●</span>
              <strong style={{ minWidth: 160 }}>Hostinger SMTP:</strong>
              <span style={{ color: '#334155' }}>Connected (info@prudentspaces.ae)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#16a34a', fontSize: '1.2rem' }}>●</span>
              <strong style={{ minWidth: 160 }}>Disk Redundancy:</strong>
              <span style={{ color: '#334155' }}>Active (data/inquiries.json)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#16a34a', fontSize: '1.2rem' }}>●</span>
              <strong style={{ minWidth: 160 }}>Anti-Spam & CSRF:</strong>
              <span style={{ color: '#334155' }}>Active (Same-Origin + Strict IP Limiter)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#16a34a', fontSize: '1.2rem' }}>●</span>
              <strong style={{ minWidth: 160 }}>UAE Real Estate Rules:</strong>
              <span style={{ color: '#334155' }}>DLD / RERA Transparency Aligned</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
