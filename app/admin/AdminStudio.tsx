'use client';

import Image from 'next/image';
import { FormEvent, useEffect, useRef, useState } from 'react';
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
  const [message, setMessage] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [copied, setCopied] = useState(false);
  const detailSectionRef = useRef<HTMLElement>(null);
  const listSectionRef = useRef<HTMLElement>(null);
  const pageSize = 8;

  function selectLead(item: LeadRecord) {
    setActiveLead(item);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setTimeout(() => {
        detailSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    }
  }

  async function load(quiet = false) {
    if (!quiet) setIsRefreshing(true);
    try {
      const [contentRes, leadsRes] = await Promise.all([
        fetch('/api/admin/content', { cache: 'no-store' }),
        fetch('/api/admin/inquiries', { cache: 'no-store' }),
      ]);

      if (contentRes.status === 401 || leadsRes.status === 401) {
        window.location.reload();
        return;
      }
      if (contentRes.ok) setData((await contentRes.json()) as Data);
      if (leadsRes.ok) {
        const result = (await leadsRes.json()) as { leads?: LeadRecord[] };
        setLeads(result.leads || []);
      }
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

  useEffect(() => {
    setPage(1);
  }, [leadQuery, statusFilter]);

  async function save(event: FormEvent) {
    event.preventDefault();
    if (tab === 'leads' && activeLead) {
      setIsSaving(true);
      setMessage('Saving lead changes…');
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
          setMessage('Lead status and notes saved successfully.');
          setLeads((prev) =>
            prev.map((l) =>
              l.id === activeLead.id
                ? { ...l, leadStatus: activeLead.leadStatus || 'new', notes: activeLead.notes || '' }
                : l
            )
          );
        } else {
          setMessage('Could not update lead.');
        }
      } catch {
        setMessage('Network error updating lead.');
      } finally {
        setIsSaving(false);
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
    setMessage(`Updating status…`);
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
        setMessage(`Status updated to ${newStatus?.toUpperCase()}.`);
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
    if (!window.confirm('Delete this item permanently?')) return;
    if (type === 'lead') {
      const backupLeads = [...leads];
      const backupActive = activeLead;
      // Instant optimistic UI update
      setLeads((prev) => prev.filter((l) => l.id !== id));
      if (activeLead?.id === id) setActiveLead(null);
      setMessage('Inquiry removed.');

      try {
        let response = await fetch(`/api/admin/inquiries?id=${encodeURIComponent(id)}`, {
          method: 'DELETE',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ id }),
        });

        if (!response.ok) {
          response = await fetch('/api/admin/inquiries', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ action: 'delete', id }),
          });
        }

        if (response.ok) {
          setMessage('Inquiry permanently deleted.');
        } else {
          // Revert if server strictly failed
          setLeads(backupLeads);
          setActiveLead(backupActive);
          setMessage('Could not delete lead from server.');
        }
      } catch {
        // Keep optimistic removal even on transient connection error
        setMessage('Inquiry removed locally.');
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
    const text = `Name: ${item.name || 'Not specified'}\nPhone: ${item.phone}\nEmail: ${item.email}\nCountry: ${item.country}\nPurpose: ${item.interest}\nBudget: ${item.budget || 'N/A'}\nMessage: ${item.message || 'N/A'}\nReceived: ${item.receivedAt}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
    link.setAttribute('download', `prudent_spaces_inquiries_${new Date().toISOString().slice(0, 10)}.csv`);
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
        {/* Executive Header */}
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
            paddingBottom: 20,
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Image src="/brand/smalllogo.png" alt="Prudent Spaces" width={38} height={26} priority />
            <div>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#94a3b8',
                  display: 'block',
                }}
              >
                Prudent Spaces Dubai
              </span>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', margin: '2px 0 0 0' }}>
                Executive Lead Management
              </h1>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {tab === 'leads' && (
              <>
                <button
                  type="button"
                  onClick={() => void load()}
                  disabled={isRefreshing}
                  style={{
                    padding: '8px 14px',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#334155',
                    cursor: isRefreshing ? 'not-allowed' : 'pointer',
                    minHeight: 40,
                  }}
                >
                  {isRefreshing ? 'Syncing…' : 'Sync Leads'}
                </button>
                <button
                  type="button"
                  onClick={exportLeadsCSV}
                  style={{
                    padding: '8px 14px',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#334155',
                    cursor: 'pointer',
                    minHeight: 40,
                  }}
                >
                  Export CSV
                </button>
              </>
            )}
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '8px 14px',
                fontSize: '0.84rem',
                fontWeight: 600,
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#334155',
                textDecoration: 'none',
                minHeight: 40,
              }}
            >
              View Site
            </a>
            <button
              type="button"
              onClick={logout}
              style={{
                padding: '8px 14px',
                fontSize: '0.84rem',
                fontWeight: 600,
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                background: '#f1f5f9',
                color: '#475569',
                cursor: 'pointer',
                minHeight: 40,
              }}
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav
          style={{
            display: 'flex',
            gap: 8,
            margin: '20px 0 16px',
            overflowX: 'auto',
            paddingBottom: 4,
          }}
          role="tablist"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'leads'}
            onClick={() => {
              setTab('leads');
              setArticle(null);
            }}
            style={{
              padding: '9px 18px',
              fontSize: '0.84rem',
              fontWeight: 600,
              borderRadius: 8,
              border: '1px solid',
              borderColor: tab === 'leads' ? '#0f172a' : '#e2e8f0',
              background: tab === 'leads' ? '#0f172a' : '#ffffff',
              color: tab === 'leads' ? '#ffffff' : '#475569',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              minHeight: 40,
            }}
          >
            Inquiries ({leads.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'analytics'}
            onClick={() => {
              setTab('analytics');
              setArticle(null);
              setActiveLead(null);
            }}
            style={{
              padding: '9px 18px',
              fontSize: '0.84rem',
              fontWeight: 600,
              borderRadius: 8,
              border: '1px solid',
              borderColor: tab === 'analytics' ? '#0f172a' : '#e2e8f0',
              background: tab === 'analytics' ? '#0f172a' : '#ffffff',
              color: tab === 'analytics' ? '#ffffff' : '#475569',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              minHeight: 40,
            }}
          >
            Analytics
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'articles'}
            onClick={() => {
              setTab('articles');
              setActiveLead(null);
            }}
            style={{
              padding: '9px 18px',
              fontSize: '0.84rem',
              fontWeight: 600,
              borderRadius: 8,
              border: '1px solid',
              borderColor: tab === 'articles' ? '#0f172a' : '#e2e8f0',
              background: tab === 'articles' ? '#0f172a' : '#ffffff',
              color: tab === 'articles' ? '#ffffff' : '#475569',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              minHeight: 40,
            }}
          >
            Market Insights ({data.articles.length})
          </button>
        </nav>

        {/* System Message Banner */}
        {message && (
          <div
            role="status"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 16px',
              borderRadius: 8,
              background: message.includes('error') || message.includes('Could not') ? '#fef2f2' : '#f0fdf4',
              border: `1px solid ${message.includes('error') || message.includes('Could not') ? '#fecaca' : '#bbf7d0'}`,
              color: message.includes('error') || message.includes('Could not') ? '#991b1b' : '#166534',
              fontSize: '0.86rem',
              fontWeight: 600,
              marginBottom: 18,
            }}
          >
            <span>{message}</span>
            <button
              type="button"
              onClick={() => setMessage('')}
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.9rem',
                padding: '4px 8px',
              }}
            >
              Dismiss
            </button>
          </div>
        )}

        {tab === 'analytics' ? (
          <AnalyticsView leads={leads} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* KPI Metrics Summary (Only in Leads tab) */}
            {tab === 'leads' && (
              <div
                className="admin-kpi-grid"
                style={{
                  gap: 12,
                }}
              >
                <div
                  onClick={() => setStatusFilter('all')}
                  style={{
                    background: '#ffffff',
                    padding: '16px 18px',
                    borderRadius: 10,
                    border: '1px solid #e2e8f0',
                    borderLeft: statusFilter === 'all' ? '4px solid #0f172a' : '1px solid #e2e8f0',
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  }}
                >
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#64748b' }}>
                    Total Inquiries
                  </span>
                  <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginTop: 4 }}>
                    {statusCounts.all}
                  </div>
                </div>

                <div
                  onClick={() => setStatusFilter('new')}
                  style={{
                    background: '#ffffff',
                    padding: '16px 18px',
                    borderRadius: 10,
                    border: '1px solid #e2e8f0',
                    borderLeft: statusFilter === 'new' ? '4px solid #b45309' : '1px solid #e2e8f0',
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#b45309' }}>
                      Action Required
                    </span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 6px', background: '#fef3c7', color: '#92400e', borderRadius: 4 }}>
                      NEW
                    </span>
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#b45309', marginTop: 4 }}>
                    {statusCounts.new}
                  </div>
                </div>

                <div
                  onClick={() => setStatusFilter('contacted')}
                  style={{
                    background: '#ffffff',
                    padding: '16px 18px',
                    borderRadius: 10,
                    border: '1px solid #e2e8f0',
                    borderLeft: statusFilter === 'contacted' ? '4px solid #0369a1' : '1px solid #e2e8f0',
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  }}
                >
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#64748b' }}>
                    In Discussion
                  </span>
                  <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0369a1', marginTop: 4 }}>
                    {statusCounts.contacted + statusCounts.meeting}
                  </div>
                </div>

                <div
                  onClick={() => setStatusFilter('closed')}
                  style={{
                    background: '#ffffff',
                    padding: '16px 18px',
                    borderRadius: 10,
                    border: '1px solid #e2e8f0',
                    borderLeft: statusFilter === 'closed' ? '4px solid #047857' : '1px solid #e2e8f0',
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  }}
                >
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#64748b' }}>
                    Deals Closed
                  </span>
                  <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#047857', marginTop: 4 }}>
                    {statusCounts.closed}
                  </div>
                </div>
              </div>
            )}

            {/* Split Screen Layout (Responsive Grid: 1 col on mobile, 2 col on desktop) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: 20,
                alignItems: 'start',
              }}
            >
              {/* Left Column: Leads / Articles List */}
              <section
                ref={listSectionRef}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: 18,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                }}
              >
                {/* Search & Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                  <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    {tab === 'leads' ? `Inquiries (${filteredLeads.length})` : 'Articles'}
                  </h2>

                  {tab === 'leads' ? (
                    <div style={{ position: 'relative', width: '100%', maxWidth: 280 }}>
                      <input
                        style={{
                          width: '100%',
                          padding: '8px 28px 8px 12px',
                          fontSize: '0.84rem',
                          borderRadius: 8,
                          border: '1px solid #cbd5e1',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                        placeholder="Search name, phone, email…"
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
                      type="button"
                      className="button button-primary"
                      onClick={() => setArticle(articleBlank())}
                      style={{ padding: '7px 14px', fontSize: '0.82rem' }}
                    >
                      New Article
                    </button>
                  )}
                </div>

                {/* Filter Pills (Clean Text Badges) */}
                {tab === 'leads' && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {[
                      { id: 'all', label: `All (${statusCounts.all})` },
                      { id: 'new', label: `New (${statusCounts.new})` },
                      { id: 'contacted', label: `Contacted (${statusCounts.contacted})` },
                      { id: 'meeting', label: `Meeting (${statusCounts.meeting})` },
                      { id: 'closed', label: `Closed (${statusCounts.closed})` },
                      { id: 'archived', label: `Archived (${statusCounts.archived})` },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setStatusFilter(f.id as typeof statusFilter)}
                        style={{
                          padding: '5px 10px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                          borderRadius: 6,
                          border: '1px solid',
                          borderColor: statusFilter === f.id ? '#0f172a' : '#e2e8f0',
                          background: statusFilter === f.id ? '#0f172a' : '#ffffff',
                          color: statusFilter === f.id ? '#ffffff' : '#64748b',
                          cursor: 'pointer',
                        }}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Leads Scroll Area (Compact Height on Desktop, Responsive on Mobile) */}
                <div
                  style={{
                    maxHeight: '620px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    paddingRight: 4,
                  }}
                >
                  {tab === 'leads' &&
                    paginatedLeads.map((item) => {
                      const cleanPhone = (item.phone || '').replace(/\D/g, '');
                      const clientName = item.name?.trim() || `Inquiry #${item.id.replace('sheet_row_', '')}`;
                      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                        `Hello ${clientName}, this is Vikas from Prudent Spaces Real Estate Dubai. Thank you for your inquiry regarding ${item.interest || 'Dubai properties'}. How can I assist you today?`
                      )}`;

                      const statusLabels: Record<string, string> = {
                        new: 'NEW',
                        contacted: 'CONTACTED',
                        meeting: 'MEETING',
                        closed: 'CLOSED',
                        archived: 'ARCHIVED',
                      };

                      const currentStatus = item.leadStatus || 'new';

                      return (
                        <div
                          key={item.id}
                          onClick={() => selectLead(item)}
                          style={{
                            background: '#ffffff',
                            border: '1px solid',
                            borderColor: activeLead?.id === item.id ? '#0f172a' : '#e2e8f0',
                            borderRadius: 10,
                            padding: '14px 16px',
                            cursor: 'pointer',
                            transition: 'border-color 0.15s ease',
                            boxShadow: activeLead?.id === item.id ? '0 0 0 1px #0f172a' : 'none',
                          }}
                        >
                          {/* Top Row: Status Badge + Date */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <span className={`status status-${currentStatus}`}>
                              {statusLabels[currentStatus] || currentStatus.toUpperCase()}
                            </span>
                            <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                              {item.receivedAt ? item.receivedAt.slice(0, 16) : ''}
                            </span>
                          </div>

                          {/* Client Name & Quick Info */}
                          <h3 style={{ margin: '0 0 4px 0', fontSize: '0.98rem', fontWeight: 700, color: '#0f172a' }}>
                            {clientName}
                          </h3>
                          <p style={{ margin: '2px 0', fontSize: '0.82rem', color: '#475569' }}>
                            {item.phone || 'No phone'} {item.country ? `• ${item.country}` : ''}
                          </p>
                          <p style={{ margin: '2px 0', fontSize: '0.82rem', color: '#64748b' }}>
                            {item.interest} {item.budget ? `• Budget: ${item.budget}` : ''}
                          </p>

                          {item.message && (
                            <p
                              style={{
                                margin: '6px 0 0 0',
                                fontSize: '0.78rem',
                                color: '#64748b',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              &ldquo;{item.message}&rdquo;
                            </p>
                          )}

                          {/* Action Bar */}
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
                                  style={{
                                    padding: '6px 12px',
                                    fontSize: '0.76rem',
                                    fontWeight: 600,
                                    borderRadius: 6,
                                    background: '#16a34a',
                                    color: '#ffffff',
                                    textDecoration: 'none',
                                    minHeight: 32,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                  }}
                                >
                                  WhatsApp
                                </a>
                              )}
                              {item.phone && (
                                <a
                                  href={`tel:${item.phone}`}
                                  style={{
                                    padding: '6px 12px',
                                    fontSize: '0.76rem',
                                    fontWeight: 600,
                                    borderRadius: 6,
                                    background: '#0f172a',
                                    color: '#ffffff',
                                    textDecoration: 'none',
                                    minHeight: 32,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                  }}
                                >
                                  Call
                                </a>
                              )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <select
                                value={currentStatus}
                                onChange={(e) => void quickUpdateStatus(item, e.target.value as LeadRecord['leadStatus'])}
                                style={{
                                  padding: '5px 8px',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  borderRadius: 6,
                                  border: '1px solid #cbd5e1',
                                  background: '#f8fafc',
                                  color: '#334155',
                                  cursor: 'pointer',
                                  minHeight: 32,
                                }}
                              >
                                <option value="new">New</option>
                                <option value="contacted">Contacted</option>
                                <option value="meeting">Meeting</option>
                                <option value="closed">Closed</option>
                                <option value="archived">Archived</option>
                              </select>

                              <button
                                type="button"
                                onClick={() => void remove('lead', item.id)}
                                style={{
                                  padding: '5px 10px',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  borderRadius: 6,
                                  border: '1px solid #fecaca',
                                  background: '#fff1f2',
                                  color: '#b91c1c',
                                  cursor: 'pointer',
                                  minHeight: 32,
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                  {tab === 'articles' &&
                    data.articles.map((item) => (
                      <article className="content-list-item" key={item.id}>
                        <div>
                          <span className={`status status-${item.status}`}>{item.status?.toUpperCase()}</span>
                          <h3 style={{ marginTop: 6, fontSize: '0.98rem' }}>{item.title}</h3>
                          <p style={{ fontSize: '0.8rem' }}>/{item.slug || 'url-not-set'}</p>
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
                    <div style={{ textAlign: 'center', padding: '40px 16px', color: '#94a3b8' }}>
                      <p style={{ margin: 0, fontSize: '0.9rem' }}>No client inquiries match the current filter.</p>
                      {leadQuery && (
                        <button
                          onClick={() => setLeadQuery('')}
                          style={{ marginTop: 8, background: 'none', border: 'none', color: '#0f172a', fontWeight: 600, cursor: 'pointer' }}
                        >
                          Clear search filter
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Pagination Controls */}
                {tab === 'leads' && totalPages > 1 && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: 12,
                      borderTop: '1px solid #f1f5f9',
                      marginTop: 4,
                    }}
                  >
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      Page {page} of {totalPages}
                    </span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        type="button"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        style={{
                          padding: '6px 12px',
                          fontSize: '0.78rem',
                          borderRadius: 6,
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          cursor: page === 1 ? 'not-allowed' : 'pointer',
                          opacity: page === 1 ? 0.5 : 1,
                        }}
                      >
                        Previous
                      </button>
                      <button
                        type="button"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        style={{
                          padding: '6px 12px',
                          fontSize: '0.78rem',
                          borderRadius: 6,
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          cursor: page === totalPages ? 'not-allowed' : 'pointer',
                          opacity: page === totalPages ? 0.5 : 1,
                        }}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </section>

              {/* Right Column: Lead Review & Notes Drawer / Article Form */}
              <section
                ref={detailSectionRef}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: 20,
                  position: 'sticky',
                  top: 20,
                }}
              >
                {!editing ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                    <h2 style={{ fontSize: '1.1rem', color: '#0f172a', margin: '0 0 6px 0', fontWeight: 700 }}>
                      No Inquiry Selected
                    </h2>
                    <p style={{ fontSize: '0.86rem', margin: 0, color: '#64748b' }}>
                      Click on any inquiry from the list to view complete client requirements and record internal notes.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={save} className="editor-form">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                        {tab === 'leads' ? 'Inquiry Details & Notes' : 'Article Editor'}
                      </h2>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        {tab === 'leads' && (
                          <button
                            type="button"
                            onClick={() => listSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                            style={{
                              background: '#ffffff',
                              border: '1px solid #cbd5e1',
                              padding: '6px 12px',
                              borderRadius: 6,
                              cursor: 'pointer',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              color: '#334155',
                            }}
                          >
                            Back to List
                          </button>
                        )}
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
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            color: '#475569',
                          }}
                        >
                          Close
                        </button>
                      </div>
                    </div>

                    {tab === 'leads' && activeLead && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {/* Direct Communication Bar */}
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                            gap: 8,
                          }}
                        >
                          <a
                            href={`https://wa.me/${(activeLead.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(
                              `Hello ${activeLead.name || 'Sir/Madam'}, this is Vikas from Prudent Spaces Real Estate Dubai. Thank you for your inquiry regarding ${activeLead.interest || 'Dubai property'}. How can I assist you?`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '9px 12px',
                              background: '#16a34a',
                              color: '#ffffff',
                              borderRadius: 6,
                              fontWeight: 600,
                              textDecoration: 'none',
                              fontSize: '0.82rem',
                              minHeight: 40,
                            }}
                          >
                            WhatsApp
                          </a>
                          <a
                            href={`tel:${activeLead.phone}`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '9px 12px',
                              background: '#0f172a',
                              color: '#ffffff',
                              borderRadius: 6,
                              fontWeight: 600,
                              textDecoration: 'none',
                              fontSize: '0.82rem',
                              minHeight: 40,
                            }}
                          >
                            Call
                          </a>
                          <a
                            href={`mailto:${activeLead.email}?subject=Prudent%20Spaces%20Dubai%20-%20Property%20Inquiry`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '9px 12px',
                              background: '#ffffff',
                              color: '#334155',
                              borderRadius: 6,
                              fontWeight: 600,
                              textDecoration: 'none',
                              fontSize: '0.82rem',
                              border: '1px solid #cbd5e1',
                              minHeight: 40,
                            }}
                          >
                            Email
                          </a>
                          <button
                            type="button"
                            onClick={() => copyLeadDetails(activeLead)}
                            style={{
                              padding: '9px 12px',
                              background: '#ffffff',
                              color: '#475569',
                              borderRadius: 6,
                              fontWeight: 600,
                              border: '1px solid #cbd5e1',
                              cursor: 'pointer',
                              fontSize: '0.82rem',
                              minHeight: 40,
                            }}
                          >
                            {copied ? 'Copied' : 'Copy'}
                          </button>
                        </div>

                        {/* Details Table */}
                        <div style={{ background: '#f8fafc', padding: 14, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                          <h3 style={{ margin: '0 0 10px 0', fontSize: '1rem', color: '#0f172a', fontWeight: 700 }}>
                            {activeLead.name || `Inquiry #${activeLead.id.replace('sheet_row_', '')}`}
                          </h3>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8, fontSize: '0.84rem' }}>
                            <div>
                              <span style={{ color: '#64748b', display: 'block', fontSize: '0.74rem' }}>Phone</span>
                              <strong style={{ color: '#0f172a' }}>{activeLead.phone || 'N/A'}</strong>
                            </div>
                            <div>
                              <span style={{ color: '#64748b', display: 'block', fontSize: '0.74rem' }}>Email</span>
                              <strong style={{ color: '#0369a1' }}>{activeLead.email || 'N/A'}</strong>
                            </div>
                            <div>
                              <span style={{ color: '#64748b', display: 'block', fontSize: '0.74rem' }}>Country</span>
                              <strong style={{ color: '#0f172a' }}>{activeLead.country || 'N/A'}</strong>
                            </div>
                            <div>
                              <span style={{ color: '#64748b', display: 'block', fontSize: '0.74rem' }}>Purpose</span>
                              <strong style={{ color: '#0f172a' }}>{activeLead.interest || 'N/A'}</strong>
                            </div>
                            <div>
                              <span style={{ color: '#64748b', display: 'block', fontSize: '0.74rem' }}>Budget</span>
                              <strong style={{ color: '#0f172a' }}>{activeLead.budget || 'Not specified'}</strong>
                            </div>
                            <div>
                              <span style={{ color: '#64748b', display: 'block', fontSize: '0.74rem' }}>Received</span>
                              <strong style={{ color: '#0f172a' }}>{activeLead.receivedAt}</strong>
                            </div>
                          </div>
                        </div>

                        {/* Client Message */}
                        <div style={{ background: '#ffffff', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                          <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Client Message
                          </span>
                          <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', color: '#1e293b', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                            {activeLead.message || 'No additional message provided.'}
                          </p>
                        </div>

                        {/* Pipeline Status */}
                        <label className="field-label" style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.84rem' }}>
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
                            style={{ marginTop: 4, fontWeight: 600 }}
                          >
                            <option value="new">New Inquiry</option>
                            <option value="contacted">Contacted / In Discussion</option>
                            <option value="meeting">Viewing / Meeting Scheduled</option>
                            <option value="closed">Deal Closed / Reserved</option>
                            <option value="archived">Archived / Cold</option>
                          </select>
                        </label>

                        {/* Internal Notes */}
                        <label className="field-label" style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.84rem' }}>
                          Internal Broker Notes
                          <textarea
                            className="field-input field-textarea"
                            rows={4}
                            placeholder="Add action items, viewing dates, or client preferences…"
                            value={activeLead.notes || ''}
                            onChange={(e) => setActiveLead({ ...activeLead, notes: e.target.value })}
                            style={{ marginTop: 4 }}
                          />
                        </label>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
                          <button
                            type="submit"
                            className="button button-primary"
                            disabled={isSaving}
                            style={{ flex: 1, padding: '10px 16px', minHeight: 42 }}
                          >
                            {isSaving ? 'Saving…' : 'Save Changes'}
                          </button>
                          <button
                            type="button"
                            onClick={() => void remove('lead', activeLead.id)}
                            style={{
                              padding: '10px 14px',
                              borderRadius: 8,
                              border: '1px solid #fecaca',
                              background: '#fff1f2',
                              color: '#b91c1c',
                              fontWeight: 600,
                              fontSize: '0.84rem',
                              cursor: 'pointer',
                              minHeight: 42,
                            }}
                          >
                            Delete
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
    <label className="field-label" style={{ fontSize: '0.84rem', fontWeight: 600 }}>
      {label}
      <input className="field-input" type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} />
    </label>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="field-label" style={{ fontSize: '0.84rem', fontWeight: 600 }}>
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
        <label className="field-label" style={{ fontSize: '0.84rem', fontWeight: 600 }}>
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
        label="Featured Image URL (/insights/... or HTTPS URL)"
        value={value.imageUrl || ''}
        onChange={(v) => set('imageUrl', v)}
        required={false}
      />
      <div className="form-pair">
        <Field label="Author" value={value.author || ''} onChange={(v) => set('author', v)} required={false} />
        <Field label="Read Time" value={value.readTime || ''} onChange={(v) => set('readTime', v)} required={false} />
      </div>
      <div className="form-pair">
        <Field label="Published date" type="date" value={value.publishedAt} onChange={(v) => set('publishedAt', v)} />
        <Field label="Updated date" type="date" value={value.updatedAt} onChange={(v) => set('updatedAt', v)} />
      </div>
      <Field label="Source name" value={value.sourceLabel} onChange={(v) => set('sourceLabel', v)} />
      <Field label="Source URL" value={value.sourceUrl} onChange={(v) => set('sourceUrl', v)} />
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
      {/* Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
        <div style={{ background: '#ffffff', padding: 20, borderRadius: 10, border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Total Inquiries
          </span>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a', margin: '4px 0 0 0' }}>{total}</div>
        </div>

        <div style={{ background: '#ffffff', padding: 20, borderRadius: 10, border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Active Pipeline
          </span>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0284c7', margin: '4px 0 0 0' }}>{activePipeline}</div>
        </div>

        <div style={{ background: '#ffffff', padding: 20, borderRadius: 10, border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Deals Closed
          </span>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#16a34a', margin: '4px 0 0 0' }}>{statusCounts.closed}</div>
        </div>

        <div style={{ background: '#ffffff', padding: 20, borderRadius: 10, border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Conversion Rate
          </span>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#c5a059', margin: '4px 0 0 0' }}>{conversionRate}%</div>
        </div>
      </div>

      {/* Breakdown Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
        <div style={{ background: '#ffffff', padding: 20, borderRadius: 10, border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 14px 0', fontSize: '0.98rem', fontWeight: 700, color: '#0f172a' }}>
            Pipeline Stage Distribution
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'New Uncontacted', count: statusCounts.new, color: '#f59e0b' },
              { label: 'In Discussion', count: statusCounts.contacted, color: '#3b82f6' },
              { label: 'Meeting Scheduled', count: statusCounts.meeting, color: '#8b5cf6' },
              { label: 'Closed / Reserved', count: statusCounts.closed, color: '#10b981' },
              { label: 'Archived', count: statusCounts.archived, color: '#94a3b8' },
            ].map((stage) => {
              const pct = total ? Math.round((stage.count / total) * 100) : 0;
              return (
                <div key={stage.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, color: '#334155' }}>{stage.label}</span>
                    <span style={{ color: '#64748b' }}>{stage.count} ({pct}%)</span>
                  </div>
                  <div style={{ width: '100%', height: 6, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: stage.color, borderRadius: 999 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: 20, borderRadius: 10, border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 14px 0', fontSize: '0.98rem', fontWeight: 700, color: '#0f172a' }}>
            Inquiry Interest Breakdown
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Object.entries(interestMap).map(([interest, count]) => {
              const pct = total ? Math.round((count / total) * 100) : 0;
              return (
                <div
                  key={interest}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    background: '#f8fafc',
                    borderRadius: 6,
                    border: '1px solid #f1f5f9',
                    fontSize: '0.84rem',
                  }}
                >
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>{interest}</span>
                  <span style={{ color: '#0f172a', fontWeight: 700 }}>{count} ({pct}%)</span>
                </div>
              );
            })}
            {Object.keys(interestMap).length === 0 && (
              <p style={{ color: '#94a3b8', fontSize: '0.86rem', margin: 0 }}>No inquiry data recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
