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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [copied, setCopied] = useState(false);
  const pageSize = 8;

  async function load(quiet = false) {
    if (!quiet) setIsRefreshing(true);
    try {
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
      if (!quiet) setMessage('');
    } catch {
      if (!quiet) setMessage('Error connecting to server.');
    } finally {
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    const task = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(task);
  }, []);

  // Reset to page 1 whenever search query or status filter changes
  useEffect(() => {
    setPage(1);
  }, [leadQuery, statusFilter]);

  async function save(event: FormEvent) {
    event.preventDefault();
    if (tab === 'leads' && activeLead) {
      setMessage('Saving lead to Google Sheet…');
      try {
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
          setMessage('✓ Lead status & notes saved successfully.');
          setLeads((prev) =>
            prev.map((l) =>
              l.id === activeLead.id
                ? { ...l, leadStatus: activeLead.leadStatus || 'new', notes: activeLead.notes || '' }
                : l
            )
          );
        } else {
          setMessage('Could not update lead in Google Sheet.');
        }
      } catch {
        setMessage('Network error updating lead.');
      }
      return;
    }

    if (!article) return;
    const itemToSave = { ...article, imageUrl: article.imageUrl?.trim() ? article.imageUrl.trim() : undefined };
    setMessage('Saving article…');
    const response = await fetch('/api/admin/content', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type: 'article', item: itemToSave }),
    });
    const result = (await response.json()) as { error?: string };
    setMessage(response.ok ? 'Saved. Published content is now live.' : result.error || 'Could not save.');
    if (response.ok) {
      await load(true);
      setArticle(null);
    }
  }

  async function quickUpdateStatus(item: LeadRecord, newStatus: LeadRecord['leadStatus']) {
    setMessage(`Updating status for ${item.name}…`);
    try {
      const response = await fetch('/api/admin/inquiries', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          leadStatus: newStatus,
          notes: item.notes || '',
        }),
      });
      if (response.ok) {
        setMessage(`✓ Status updated to ${newStatus}.`);
        setLeads((prev) =>
          prev.map((l) => (l.id === item.id ? { ...l, leadStatus: newStatus } : l))
        );
        if (activeLead?.id === item.id) {
          setActiveLead((prev) => (prev ? { ...prev, leadStatus: newStatus } : null));
        }
      } else {
        setMessage('Could not update status.');
      }
    } catch {
      setMessage('Network error updating status.');
    }
  }

  async function remove(type: 'article' | 'lead', id: string) {
    if (!window.confirm('Are you sure you want to delete this permanently? This will also remove the entry from your Google Sheet.')) return;
    if (type === 'lead') {
      setMessage('Deleting lead from Google Sheet…');
      try {
        const response = await fetch('/api/admin/inquiries', {
          method: 'DELETE',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ id }),
        });
        if (response.ok) {
          setMessage('✓ Lead deleted permanently.');
          setLeads((prev) => prev.filter((l) => l.id !== id));
          if (activeLead?.id === id) setActiveLead(null);
        } else {
          setMessage('Could not delete lead.');
        }
      } catch {
        setMessage('Network error deleting lead.');
      }
      return;
    }

    const response = await fetch('/api/admin/content', {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type, id }),
    });
    if (response.ok) await load(true);
    else setMessage('Could not delete this item.');
  }

  function copyLeadDetails(item: LeadRecord) {
    const text = `Name: ${item.name}\nPhone: ${item.phone}\nEmail: ${item.email}\nCountry: ${item.country}\nPurpose: ${item.interest}\nBudget: ${item.budget || 'Not specified'}\nMessage: ${item.message || 'None'}\nDate: ${item.receivedAt}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
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
      (l.interest && l.interest.toLowerCase().includes(q)) ||
      (l.notes && l.notes.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / pageSize));
  const paginatedLeads = filteredLeads.slice((page - 1) * pageSize, page * pageSize);

  const editing = tab === 'articles' ? article : activeLead;

  return (
    <main className="admin-shell">
      <div className="admin-workspace">
        {/* Header Toolbar */}
        <header className="admin-toolbar" style={{ flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Image src="/brand/smalllogo.png" alt="Prudent Spaces" width={40} height={27} />
            <div>
              <span className="eyebrow">Prudent Spaces Dubai</span>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>Boss Management Studio</h1>
            </div>
          </div>
          <div className="admin-actions" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {tab === 'leads' && (
              <>
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => void load()}
                  disabled={isRefreshing}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <span style={{ display: 'inline-block', transform: isRefreshing ? 'rotate(360deg)' : 'none', transition: 'transform 0.6s linear' }}>
                    🔄
                  </span>
                  {isRefreshing ? 'Syncing…' : 'Sync Leads'}
                </button>
                <button type="button" className="button button-secondary" onClick={exportLeadsCSV}>
                  📥 Export CSV
                </button>
              </>
            )}
            <a className="button button-secondary" href="/" target="_blank" rel="noreferrer">
              🌐 View Website
            </a>
            <button type="button" className="button button-secondary" onClick={logout}>
              Sign Out
            </button>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="admin-tabs" role="tablist" style={{ marginTop: 24, marginBottom: 16 }}>
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
            📰 Market Insights ({data.articles.length})
          </button>
        </div>

        {/* Feedback Message */}
        {message && (
          <div
            className="admin-message"
            role="status"
            style={{
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: message.startsWith('✓') ? '#ecfdf5' : '#fef3c7',
              border: `1px solid ${message.startsWith('✓') ? '#a7f3d0' : '#fde68a'}`,
              color: message.startsWith('✓') ? '#047857' : '#92400e',
              padding: '10px 16px',
              borderRadius: 10,
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            <span>{message}</span>
            <button
              onClick={() => setMessage('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 700 }}
            >
              ✕
            </button>
          </div>
        )}

        {tab === 'analytics' ? (
          <AnalyticsView leads={leads} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Executive KPI Bar (Only in Leads tab) */}
            {tab === 'leads' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                <div
                  onClick={() => setStatusFilter('all')}
                  style={{
                    background: '#ffffff',
                    padding: '16px 20px',
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                    transition: 'all 0.2s ease',
                    borderTop: statusFilter === 'all' ? '3px solid #0f172a' : '3px solid #cbd5e1',
                  }}
                >
                  <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Total Inquiries
                  </span>
                  <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 0 0' }}>
                    {statusCounts.all}
                  </div>
                </div>

                <div
                  onClick={() => setStatusFilter('new')}
                  style={{
                    background: '#ffffff',
                    padding: '16px 20px',
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                    transition: 'all 0.2s ease',
                    borderTop: statusFilter === 'new' ? '3px solid #f59e0b' : '3px solid #cbd5e1',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.76rem', color: '#b45309', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Action Required
                    </span>
                    <span style={{ background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 800 }}>
                      NEW
                    </span>
                  </div>
                  <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#b45309', margin: '4px 0 0 0' }}>
                    {statusCounts.new}
                  </div>
                </div>

                <div
                  onClick={() => setStatusFilter('contacted')}
                  style={{
                    background: '#ffffff',
                    padding: '16px 20px',
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                    transition: 'all 0.2s ease',
                    borderTop: statusFilter === 'contacted' ? '3px solid #0284c7' : '3px solid #cbd5e1',
                  }}
                >
                  <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Active In Discussion
                  </span>
                  <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0284c7', margin: '4px 0 0 0' }}>
                    {statusCounts.contacted + statusCounts.meeting}
                  </div>
                </div>

                <div
                  onClick={() => setStatusFilter('closed')}
                  style={{
                    background: '#ffffff',
                    padding: '16px 20px',
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                    transition: 'all 0.2s ease',
                    borderTop: statusFilter === 'closed' ? '3px solid #16a34a' : '3px solid #cbd5e1',
                  }}
                >
                  <span style={{ fontSize: '0.76rem', color: '#16a34a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Deals Closed / Won
                  </span>
                  <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#16a34a', margin: '4px 0 0 0' }}>
                    {statusCounts.closed}
                  </div>
                </div>
              </div>
            )}

            {/* Main Workspace Split Grid */}
            <div className="admin-grid" style={{ alignItems: 'start' }}>
              {/* Left Column: Leads List / Article List */}
              <section className="admin-panel" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="admin-list-heading" style={{ flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <h2 style={{ fontSize: '1.2rem', margin: 0, color: '#0f172a' }}>
                      {tab === 'leads' ? 'Client Enquiries' : 'Editorial Insights'}
                    </h2>
                    {tab === 'leads' && (
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        Showing {filteredLeads.length} of {leads.length} inquiries
                      </span>
                    )}
                  </div>

                  {tab === 'leads' ? (
                    <div style={{ position: 'relative', minWidth: 220, flex: '1 1 220px' }}>
                      <input
                        style={{
                          width: '100%',
                          padding: '7px 32px 7px 12px',
                          fontSize: '0.86rem',
                          borderRadius: 8,
                          border: '1px solid #cbd5e1',
                          outline: 'none',
                        }}
                        placeholder="Search name, phone, email, notes…"
                        value={leadQuery}
                        onChange={(e) => setLeadQuery(e.target.value)}
                      />
                      {leadQuery && (
                        <button
                          type="button"
                          onClick={() => setLeadQuery('')}
                          style={{
                            position: 'absolute',
                            right: 8,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                          }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      className="button button-primary"
                      onClick={() => setArticle(articleBlank())}
                    >
                      + Add New Article
                    </button>
                  )}
                </div>

                {/* Status Filter Pills */}
                {tab === 'leads' && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
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
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Fixed-Height Scroll Container (Prevents Endless Page Expansion) */}
                <div className="boss-leads-scroll">
                  {tab === 'leads' &&
                    paginatedLeads.map((item) => {
                      const cleanPhone = (item.phone || '').replace(/\D/g, '');
                      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                        `Hello ${item.name}, this is Vikas from Prudent Spaces Real Estate Dubai. Thank you for your inquiry regarding ${item.interest}. How can I assist you with your property search?`
                      )}`;

                      return (
                        <article
                          className={`boss-lead-card ${activeLead?.id === item.id ? 'active' : ''}`}
                          key={item.id}
                          onClick={() => setActiveLead(item)}
                        >
                          {/* Card Header */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <span className={`status status-${item.leadStatus || 'new'}`}>
                              {item.leadStatus || 'new'}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                              {item.receivedAt ? item.receivedAt.slice(0, 16) : ''}
                            </span>
                          </div>

                          {/* Client Information */}
                          <h3 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: '#0f172a' }}>{item.name}</h3>
                          <p style={{ margin: '2px 0', fontSize: '0.84rem', color: '#475569' }}>
                            <strong>{item.phone}</strong> • {item.country || 'Global'}
                          </p>
                          <p style={{ margin: '2px 0', fontSize: '0.84rem', color: '#64748b' }}>
                            🎯 {item.interest} {item.budget ? `• 💰 ${item.budget}` : ''}
                          </p>

                          {/* Message Snippet */}
                          {item.message && (
                            <p
                              style={{
                                margin: '6px 0 0 0',
                                fontSize: '0.8rem',
                                color: '#64748b',
                                fontStyle: 'italic',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              &ldquo;{item.message}&rdquo;
                            </p>
                          )}

                          {/* Quick Actions Row */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 8,
                              marginTop: 12,
                              paddingTop: 10,
                              borderTop: '1px solid #f1f5f9',
                              flexWrap: 'wrap',
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div style={{ display: 'flex', gap: 6 }}>
                              {cleanPhone && (
                                <a
                                  href={whatsappUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  title="WhatsApp Client"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    padding: '5px 9px',
                                    background: '#25D366',
                                    color: '#ffffff',
                                    borderRadius: 6,
                                    fontSize: '0.76rem',
                                    fontWeight: 700,
                                    textDecoration: 'none',
                                  }}
                                >
                                  💬 WhatsApp
                                </a>
                              )}
                              <a
                                href={`tel:${item.phone}`}
                                title="Call Client"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  padding: '5px 9px',
                                  background: '#0f172a',
                                  color: '#ffffff',
                                  borderRadius: 6,
                                  fontSize: '0.76rem',
                                  fontWeight: 600,
                                  textDecoration: 'none',
                                }}
                              >
                                📞 Call
                              </a>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              {/* Inline Quick Status Selector */}
                              <select
                                value={item.leadStatus || 'new'}
                                onChange={(e) => void quickUpdateStatus(item, e.target.value as LeadRecord['leadStatus'])}
                                style={{
                                  padding: '4px 8px',
                                  fontSize: '0.75rem',
                                  borderRadius: 6,
                                  border: '1px solid #cbd5e1',
                                  background: '#f8fafc',
                                  color: '#334155',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                <option value="new">🆕 New</option>
                                <option value="contacted">📞 Contacted</option>
                                <option value="meeting">🤝 Meeting</option>
                                <option value="closed">✅ Closed</option>
                                <option value="archived">📁 Archived</option>
                              </select>

                              <button
                                type="button"
                                className="danger"
                                title="Delete Lead"
                                onClick={() => void remove('lead', item.id)}
                                style={{
                                  padding: '4px 8px',
                                  fontSize: '0.75rem',
                                  background: 'none',
                                  border: 'none',
                                  color: '#b42318',
                                  cursor: 'pointer',
                                  fontWeight: 600,
                                }}
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })}

                  {tab === 'articles' &&
                    data.articles.map((item) => (
                      <article className="content-list-item" key={item.id}>
                        <div>
                          <span className={`status status-${item.status}`}>{item.status}</span>
                          <h3 style={{ marginTop: 6 }}>{item.title}</h3>
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
                    <div style={{ textAlign: 'center', padding: '36px 16px', color: '#94a3b8' }}>
                      <p style={{ margin: 0, fontSize: '0.95rem' }}>No matching client inquiries found.</p>
                      {leadQuery && (
                        <button
                          onClick={() => setLeadQuery('')}
                          style={{
                            marginTop: 8,
                            background: 'none',
                            border: 'none',
                            color: '#0284c7',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Clear search filter
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Pagination Controls (Clean & Compact) */}
                {tab === 'leads' && totalPages > 1 && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: 12,
                      borderTop: '1px solid #e2e8f0',
                      marginTop: 6,
                    }}
                  >
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Page {page} of {totalPages}
                    </span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        type="button"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        style={{
                          padding: '4px 10px',
                          fontSize: '0.78rem',
                          borderRadius: 6,
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          cursor: page === 1 ? 'not-allowed' : 'pointer',
                          opacity: page === 1 ? 0.5 : 1,
                        }}
                      >
                        ← Prev
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setPage(num)}
                          style={{
                            padding: '4px 10px',
                            fontSize: '0.78rem',
                            fontWeight: page === num ? 700 : 500,
                            borderRadius: 6,
                            border: '1px solid',
                            borderColor: page === num ? '#0f172a' : '#cbd5e1',
                            background: page === num ? '#0f172a' : '#ffffff',
                            color: page === num ? '#ffffff' : '#334155',
                            cursor: 'pointer',
                          }}
                        >
                          {num}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        style={{
                          padding: '4px 10px',
                          fontSize: '0.78rem',
                          borderRadius: 6,
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          cursor: page === totalPages ? 'not-allowed' : 'pointer',
                          opacity: page === totalPages ? 0.5 : 1,
                        }}
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}
              </section>

              {/* Right Column: Lead Review & Notes Drawer / Article Form */}
              <section
                className="admin-panel editor-panel"
                style={{
                  position: 'sticky',
                  top: 20,
                  maxHeight: '82vh',
                  overflowY: 'auto',
                  padding: 24,
                }}
              >
                {!editing ? (
                  <div className="empty-copy" style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📋</div>
                    <h2 style={{ fontSize: '1.25rem', color: '#0f172a', margin: '0 0 6px 0' }}>
                      Select an item to view or manage
                    </h2>
                    <p style={{ fontSize: '0.88rem', color: '#64748b', maxWidth: 360, margin: '0 auto' }}>
                      Click on any lead card to see full contact details, WhatsApp direct routing, and private boss notes.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={save} className="editor-form">
                    <div className="editor-heading" style={{ marginBottom: 16 }}>
                      <h2 style={{ fontSize: '1.25rem', color: '#0f172a', margin: 0 }}>
                        {tab === 'leads' ? 'Lead Overview & Notes' : 'Insight Editor'}
                      </h2>
                      <button
                        type="button"
                        onClick={() => {
                          setArticle(null);
                          setActiveLead(null);
                        }}
                        style={{
                          background: '#f1f5f9',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: 6,
                          cursor: 'pointer',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          color: '#475569',
                        }}
                      >
                        Close ✕
                      </button>
                    </div>

                    {tab === 'leads' && activeLead && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {/* VIP Contact Quick Bar */}
                        <div
                          style={{
                            display: 'flex',
                            gap: 8,
                            flexWrap: 'wrap',
                            background: '#f8fafc',
                            padding: 12,
                            borderRadius: 10,
                            border: '1px solid #e2e8f0',
                          }}
                        >
                          <a
                            href={`https://wa.me/${(activeLead.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(
                              `Hello ${activeLead.name}, this is Vikas from Prudent Spaces Real Estate Dubai. Thank you for your inquiry regarding ${activeLead.interest}. How can I assist you with your property search in Dubai?`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              flex: '1 1 140px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 6,
                              padding: '9px 14px',
                              background: '#25D366',
                              color: '#ffffff',
                              borderRadius: 8,
                              fontWeight: 700,
                              textDecoration: 'none',
                              fontSize: '0.84rem',
                              boxShadow: '0 2px 6px rgba(37,211,102,0.25)',
                            }}
                          >
                            💬 WhatsApp VIP
                          </a>
                          <a
                            href={`tel:${activeLead.phone}`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 6,
                              padding: '9px 14px',
                              background: '#0f172a',
                              color: '#ffffff',
                              borderRadius: 8,
                              fontWeight: 600,
                              textDecoration: 'none',
                              fontSize: '0.84rem',
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
                              padding: '9px 14px',
                              background: '#ffffff',
                              color: '#334155',
                              borderRadius: 8,
                              fontWeight: 600,
                              textDecoration: 'none',
                              fontSize: '0.84rem',
                              border: '1px solid #cbd5e1',
                            }}
                          >
                            ✉️ Email
                          </a>
                          <button
                            type="button"
                            onClick={() => copyLeadDetails(activeLead)}
                            style={{
                              padding: '9px 12px',
                              background: '#ffffff',
                              color: '#475569',
                              borderRadius: 8,
                              fontWeight: 600,
                              border: '1px solid #cbd5e1',
                              cursor: 'pointer',
                              fontSize: '0.84rem',
                            }}
                          >
                            {copied ? '✓ Copied!' : '📋 Copy Info'}
                          </button>
                        </div>

                        {/* Lead Details Summary */}
                        <div style={{ background: '#ffffff', padding: 16, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                          <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem', color: '#0f172a' }}>{activeLead.name}</h3>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, fontSize: '0.88rem' }}>
                            <div>
                              <span style={{ color: '#64748b', display: 'block', fontSize: '0.78rem' }}>Phone Number</span>
                              <strong style={{ color: '#0f172a' }}>{activeLead.phone}</strong>
                            </div>
                            <div>
                              <span style={{ color: '#64748b', display: 'block', fontSize: '0.78rem' }}>Email Address</span>
                              <strong style={{ color: '#0284c7' }}>{activeLead.email}</strong>
                            </div>
                            <div>
                              <span style={{ color: '#64748b', display: 'block', fontSize: '0.78rem' }}>Country</span>
                              <strong style={{ color: '#0f172a' }}>{activeLead.country || 'Not specified'}</strong>
                            </div>
                            <div>
                              <span style={{ color: '#64748b', display: 'block', fontSize: '0.78rem' }}>Purpose / Interest</span>
                              <strong style={{ color: '#0f172a' }}>{activeLead.interest}</strong>
                            </div>
                            <div>
                              <span style={{ color: '#64748b', display: 'block', fontSize: '0.78rem' }}>Budget Range</span>
                              <strong style={{ color: '#0f172a' }}>{activeLead.budget || 'Not specified'}</strong>
                            </div>
                            <div>
                              <span style={{ color: '#64748b', display: 'block', fontSize: '0.78rem' }}>Received Timestamp</span>
                              <strong style={{ color: '#0f172a' }}>{activeLead.receivedAt}</strong>
                            </div>
                          </div>
                        </div>

                        {/* Client Inquiry Message */}
                        <div style={{ background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                          <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Client Message / Context
                          </span>
                          <p style={{ margin: '6px 0 0 0', fontSize: '0.9rem', color: '#1e293b', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                            {activeLead.message || 'No additional message provided.'}
                          </p>
                        </div>

                        {/* Pipeline Status Selector */}
                        <label className="field-label" style={{ fontWeight: 700, color: '#0f172a' }}>
                          Pipeline Stage
                          <select
                            className="field-input"
                            value={activeLead.leadStatus || 'new'}
                            onChange={(e) =>
                              setActiveLead({
                                ...activeLead,
                                leadStatus: e.target.value as LeadRecord['leadStatus'],
                              })
                            }
                            style={{ marginTop: 6, fontWeight: 600 }}
                          >
                            <option value="new">🆕 New Uncontacted Lead</option>
                            <option value="contacted">📞 Contacted / Discussion Active</option>
                            <option value="meeting">🤝 Meeting / Viewing Scheduled</option>
                            <option value="closed">✅ Deal Closed / Reserved</option>
                            <option value="archived">📁 Archived / Low Intent</option>
                          </select>
                        </label>

                        {/* Boss Internal Notes */}
                        <label className="field-label" style={{ fontWeight: 700, color: '#0f172a' }}>
                          Boss Internal Notes & Action Items
                          <textarea
                            className="field-input field-textarea"
                            rows={4}
                            placeholder="e.g. Assigned to Vikas. Client wants 2BR in Downtown Dubai under AED 4.5M. Follow-up viewing set for Tuesday."
                            value={activeLead.notes || ''}
                            onChange={(e) => setActiveLead({ ...activeLead, notes: e.target.value })}
                            style={{ marginTop: 6 }}
                          />
                        </label>

                        {/* Save Button */}
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                          <button className="button button-primary" type="submit" style={{ flex: 1 }}>
                            💾 Save Lead Status & Notes
                          </button>
                          <button
                            type="button"
                            className="button button-secondary"
                            onClick={() => void remove('lead', activeLead.id)}
                            style={{ color: '#b42318', borderColor: '#fca5a5' }}
                          >
                            Delete Lead
                          </button>
                        </div>
                      </div>
                    )}

                    {article && tab === 'articles' && <ArticleFields value={article} change={setArticle} />}
                    {tab !== 'leads' && (
                      <button className="button button-primary" type="submit" style={{ marginTop: 14 }}>
                        Save Content
                      </button>
                    )}
                  </form>
                )}
              </section>
            </div>
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
