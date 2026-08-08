'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Site } from '@/lib/data';
import type { SiteRequest } from '@/lib/db';
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove, sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Props {
  panel: string;
  initialSites: Site[];
  initialRequests: SiteRequest[];
  categories: string[];
  regions: string[];
}

const EMPTY_FORM = {
  name: '', url: '', description: '', domain: '', faviconUrl: '',
  category: 'Movies & Shows', regions: ['Global'],
  isTrusted: false, isNew: false, isFeatured: false,
};
const TAG_COLORS = { isTrusted: '#10b981', isNew: '#3b82f6', isFeatured: '#f59e0b' };

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  pending:  { bg: 'rgba(245,158,11,0.1)',  color: '#f59e0b', label: '⏳ Pending' },
  approved: { bg: 'rgba(16,185,129,0.1)', color: '#10b981', label: '✅ Approved' },
  rejected: { bg: 'rgba(244,63,94,0.1)',  color: '#f43f5e', label: '❌ Rejected' },
};

export default function AdminDashboard({ panel, initialSites, initialRequests, categories, regions }: Props) {
  const router = useRouter();
  const apiSites = `/api/${panel}/sites`;
  const apiRequests = `/api/${panel}/requests`;
  const apiAuth = `/api/${panel}/auth`;
  const [activeTab, setActiveTab] = useState<'sites' | 'requests'>('sites');

  /* ── Sites state ── */
  const [sites, setSites] = useState<Site[]>(initialSites);
  const [siteSearch, setSiteSearch] = useState('');
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [editSite, setEditSite] = useState<Site | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /* ── Requests state ── */
  const [requests, setRequests] = useState<SiteRequest[]>(initialRequests);
  const [reqSearch, setReqSearch] = useState('');
  const [reqFilter, setReqFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  /* ── Stats ── */
  const stats = useMemo(() => ({
    total: sites.length,
    trusted: sites.filter(s => s.isTrusted).length,
    newSites: sites.filter(s => s.isNew).length,
    featured: sites.filter(s => s.isFeatured).length,
  }), [sites]);
  const pendingCount = useMemo(() => requests.filter(r => r.status === 'pending').length, [requests]);

  /* ── Filtered sites ── */
  const filteredSites = useMemo(() => {
    if (!siteSearch.trim()) return sites;
    const q = siteSearch.toLowerCase();
    return sites.filter(s => s.name.toLowerCase().includes(q) || s.domain.toLowerCase().includes(q) || s.category.toLowerCase().includes(q));
  }, [sites, siteSearch]);

  /* ── Filtered requests ── */
  const filteredReqs = useMemo(() => {
    let list = requests;
    if (reqFilter !== 'all') list = list.filter(r => r.status === reqFilter);
    if (reqSearch.trim()) {
      const q = reqSearch.toLowerCase();
      list = list.filter(r => r.siteName.toLowerCase().includes(q) || r.siteUrl.toLowerCase().includes(q));
    }
    return list;
  }, [requests, reqFilter, reqSearch]);

  /* ── Refresh ── */
  const refreshSites = useCallback(async () => {
    const res = await fetch(apiSites);
    if (res.ok) setSites(await res.json());
  }, [apiSites]);
  const refreshRequests = useCallback(async () => {
    const res = await fetch(apiRequests);
    if (res.ok) setRequests(await res.json());
  }, [apiRequests]);

  /* ── Logout ── */
  const logout = async () => {
    await fetch(apiAuth, { method: 'DELETE' });
    router.push(`/${panel}/login`);
    router.refresh();
  };

  /* ── Sites CRUD ── */
  const openAdd = () => { setForm({ ...EMPTY_FORM, category: categories[0] ?? 'Movies & Shows' }); setEditSite(null); setFormError(''); setModalMode('add'); };
  const openEdit = (site: Site) => {
    setForm({ name: site.name, url: site.url, description: site.description ?? '', domain: site.domain, faviconUrl: site.faviconUrl ?? '', category: site.category, regions: site.regions, isTrusted: site.isTrusted, isNew: site.isNew, isFeatured: site.isFeatured });
    setEditSite(site); setFormError(''); setModalMode('edit');
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setFormError('');
    if (!form.name.trim() || !form.url.trim()) { setFormError('Name and URL are required.'); return; }
    setSubmitting(true);
    try {
      let domain = form.domain.trim();
      if (!domain) { try { domain = new URL(form.url.trim()).hostname.replace(/^www\./, ''); } catch { domain = form.url; } }
      const tags: string[] = [];
      if (form.isTrusted) tags.push('trusted');
      if (form.isNew) tags.push('new');
      if (form.isFeatured) tags.push('featured');
      const payload = { ...form, domain, tags, faviconUrl: form.faviconUrl?.trim() || undefined };
      const res = await fetch(apiSites, modalMode === 'edit'
        ? { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, id: editSite!.id }) }
        : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) { const err = await res.json(); setFormError(err.error ?? 'Failed'); return; }
      await refreshSites(); setModalMode(null);
    } catch { setFormError('Network error.'); }
    finally { setSubmitting(false); }
  };
  const handleDeleteSite = async (id: string, name: string) => {
    if (!confirm(`"${name}" delete karna chahte ho?`)) return;
    setDeletingId(id);
    try { await fetch(`${apiSites}?id=${id}`, { method: 'DELETE' }); setSites(prev => prev.filter(s => s.id !== id)); }
    finally { setDeletingId(null); }
  };

  /* ── Requests actions ── */
  const updateReqStatus = async (id: string, status: 'approved' | 'rejected') => {
    setUpdatingId(id);
    try {
      const res = await fetch(apiRequests, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) });
      if (res.ok) { const updated = await res.json(); setRequests(prev => prev.map(r => r.id === id ? updated : r)); }
    } finally { setUpdatingId(null); }
  };
  const deleteRequest = async (id: string) => {
    if (!confirm('This request delete karna chahte ho?')) return;
    await fetch(`${apiRequests}?id=${id}`, { method: 'DELETE' });
    setRequests(prev => prev.filter(r => r.id !== id));
  };

  const setField = (k: keyof typeof EMPTY_FORM, v: unknown) => setForm(prev => ({ ...prev, [k]: v }));

  /* ══════════════════ RENDER ══════════════════ */
  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>

      {/* ── Navbar ── */}
      <header style={{ background: 'rgba(7,7,14,0.95)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(16px)' }}>
        <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h10M4 18h13" stroke="white" strokeWidth="2.2" strokeLinecap="round"/></svg>
            </div>
            <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>Allsitehub</span>
            <span style={{ fontSize: 10, color: 'var(--text-accent)', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 5, padding: '2px 8px', fontWeight: 700, letterSpacing: '0.06em' }}>ADMIN</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 13, padding: '5px 12px', borderRadius: 8, border: '1px solid var(--border)', transition: 'all 0.15s', whiteSpace: 'nowrap' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-accent)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
            >← View Site</Link>
            <button onClick={logout} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '5px 12px', color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--red)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(244,63,94,0.4)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
            >Logout</button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto', padding: '28px 20px 60px' }}>

        {/* ── Page title ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>Admin Dashboard</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 3 }}>Manage streaming sites and user requests</p>
          </div>
          {activeTab === 'sites' && (
            <button onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'var(--gradient)', border: 'none', borderRadius: 10, padding: '10px 20px', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(124,58,237,0.35)', transition: 'transform 0.15s, box-shadow 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(124,58,237,0.45)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(124,58,237,0.35)'; }}
            ><span style={{ fontSize: 18 }}>+</span> Add Site</button>
          )}
        </div>

        {/* ── Stats ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Total Sites', value: stats.total, color: 'var(--text-accent)', icon: '📡', grad: 'var(--gradient)' },
            { label: 'Trusted', value: stats.trusted, color: 'var(--green)', icon: '✅', grad: 'linear-gradient(90deg,#10b981,#34d399)' },
            { label: 'New', value: stats.newSites, color: 'var(--blue)', icon: '🆕', grad: 'linear-gradient(90deg,#3b82f6,#60a5fa)' },
            { label: 'Featured', value: stats.featured, color: 'var(--yellow)', icon: '⭐', grad: 'linear-gradient(90deg,#f59e0b,#fbbf24)' },
            { label: 'Pending Req', value: pendingCount, color: '#f59e0b', icon: '📬', grad: 'linear-gradient(90deg,#f59e0b,#fb923c)' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px', position: 'relative', overflow: 'hidden', cursor: s.label === 'Pending Req' ? 'pointer' : 'default' }}
              onClick={() => { if (s.label === 'Pending Req') { setActiveTab('requests'); setReqFilter('pending'); } }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: s.grad }} />
              <div style={{ fontSize: 17, marginBottom: 5 }}>{s.icon}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: s.color, letterSpacing: '-0.05em', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 4, width: 'fit-content' }}>
          {[
            { key: 'sites', label: `Sites`, count: sites.length },
            { key: 'requests', label: `Requests`, count: pendingCount, badge: pendingCount > 0 },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as 'sites' | 'requests')}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '7px 16px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                background: activeTab === tab.key ? 'rgba(139,92,246,0.15)' : 'transparent',
                color: activeTab === tab.key ? 'var(--text-primary)' : 'var(--text-muted)',
                transition: 'all 0.15s',
              }}
            >
              {tab.label}
              <span style={{ fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 5, background: activeTab === tab.key ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.04)', color: tab.badge ? '#f59e0b' : activeTab === tab.key ? 'var(--text-accent)' : 'var(--text-muted)' }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* ════════════ SITES TAB ════════════ */}
        {activeTab === 'sites' && (
          <>
            <div style={{ position: 'relative', marginBottom: 14, maxWidth: 380 }}>
              <svg style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input type="text" placeholder="Search sites..." value={siteSearch} onChange={e => setSiteSearch(e.target.value)} style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 9, padding: '8px 12px 8px 30px', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} onFocus={e => { e.currentTarget.style.borderColor = 'var(--text-accent)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--glow)'; }} onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }} />
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 10 }}>Showing <strong style={{ color: 'var(--text-accent)' }}>{filteredSites.length}</strong> of {sites.length} sites</p>
            <SitesTable
              sites={filteredSites}
              categories={categories}
              searchActive={!!siteSearch.trim()}
              apiReorder={`/api/${panel}/sites/reorder`}
              onEdit={openEdit}
              onDelete={handleDeleteSite}
              deletingId={deletingId}
              onReorder={refreshSites}
            />
          </>
        )}

        {/* ════════════ REQUESTS TAB ════════════ */}
        {activeTab === 'requests' && (
          <>
            {/* Filters */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 340 }}>
                <svg style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input type="text" placeholder="Search requests..." value={reqSearch} onChange={e => setReqSearch(e.target.value)} style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 9, padding: '8px 12px 8px 30px', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} onFocus={e => { e.currentTarget.style.borderColor = 'var(--text-accent)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--glow)'; }} onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }} />
              </div>
              <div style={{ display: 'flex', gap: 5 }}>
                {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
                  <button key={f} onClick={() => setReqFilter(f)}
                    style={{ padding: '6px 13px', borderRadius: 7, border: '1px solid', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', textTransform: 'capitalize', borderColor: reqFilter === f ? 'var(--border-accent)' : 'var(--border)', background: reqFilter === f ? 'rgba(139,92,246,0.12)' : 'transparent', color: reqFilter === f ? 'var(--text-primary)' : 'var(--text-muted)' }}
                  >{f}</button>
                ))}
              </div>
              <button onClick={refreshRequests} title="Refresh" style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer' }}>↻</button>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 10 }}>Showing <strong style={{ color: 'var(--text-accent)' }}>{filteredReqs.length}</strong> requests</p>

            {filteredReqs.length === 0 ? (
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>📬</div>
                <p>Koi request nahi mili.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filteredReqs.map(req => {
                  const st = STATUS_STYLE[req.status];
                  const busy = updatingId === req.id;
                  return (
                    <div key={req.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px', display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                      {/* Left: info */}
                      <div style={{ flex: '1 1 260px', minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{req.siteName}</span>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 5, background: st.bg, color: st.color }}>{st.label}</span>
                        </div>
                        <a href={req.siteUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', fontSize: 12, textDecoration: 'none', display: 'block', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-accent)')}
                          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                        >🔗 {req.siteUrl}</a>
                        {/* Targets */}
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: req.reason ? 8 : 0 }}>
                          {req.targets.map((t, i) => (
                            <span key={i} style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 5, padding: '2px 8px' }}>
                              {t.region} · {t.category}
                            </span>
                          ))}
                        </div>
                        {/* Reason */}
                        {req.reason && (
                          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.6, maxWidth: 500 }}>
                            &ldquo;{req.reason}&rdquo;
                          </p>
                        )}
                        <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 8 }}>
                          {new Date(req.submittedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {/* Right: actions */}
                      <div style={{ display: 'flex', gap: 7, flexShrink: 0, flexWrap: 'wrap', alignItems: 'center' }}>
                        {req.status !== 'approved' && (
                          <button disabled={busy} onClick={() => updateReqStatus(req.id, 'approved')}
                            style={{ padding: '6px 13px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 7, color: 'var(--green)', fontSize: 12, fontWeight: 600, cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.5 : 1, transition: 'background 0.15s' }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(16,185,129,0.18)'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(16,185,129,0.1)'}
                          >✓ Approve</button>
                        )}
                        {req.status !== 'rejected' && (
                          <button disabled={busy} onClick={() => updateReqStatus(req.id, 'rejected')}
                            style={{ padding: '6px 13px', background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 7, color: 'var(--red)', fontSize: 12, fontWeight: 600, cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.5 : 1, transition: 'background 0.15s' }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(244,63,94,0.15)'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(244,63,94,0.08)'}
                          >✗ Reject</button>
                        )}
                        <button onClick={() => deleteRequest(req.id)}
                          style={{ padding: '6px 10px', background: 'none', border: '1px solid var(--border)', borderRadius: 7, color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer', transition: 'all 0.15s' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--red)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(244,63,94,0.3)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
                        >🗑</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* ════════════ ADD / EDIT MODAL ════════════ */}
      {modalMode && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setModalMode(null); }}
        >
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 18, width: '100%', maxWidth: 520, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 32px 100px rgba(0,0,0,0.7)' }} className="no-scrollbar">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>{modalMode === 'add' ? '+ Add New Site' : '✎ Edit Site'}</h2>
              <button onClick={() => setModalMode(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 22, cursor: 'pointer', padding: '2px 6px', borderRadius: 6 }}>×</button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 15 }}>
              <div className="modal-grid-2" style={{ gap: 12 }}>
                <Field label="Name *"><input required value={form.name} onChange={e => setField('name', e.target.value)} placeholder="e.g. Netflix" style={mInputStyle} onFocus={mFocus} onBlur={mBlur} /></Field>
                <Field label="URL *"><input required type="url" value={form.url} onChange={e => setField('url', e.target.value)} placeholder="https://..." style={mInputStyle} onFocus={mFocus} onBlur={mBlur} /></Field>
              </div>
              <Field label="Domain (auto if empty)"><input value={form.domain} onChange={e => setField('domain', e.target.value)} placeholder="netflix.com" style={mInputStyle} onFocus={mFocus} onBlur={mBlur} /></Field>

              {/* Favicon URL with live preview */}
              <Field label="Favicon URL (optional — overrides auto-detect)">
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    value={form.faviconUrl}
                    onChange={e => setField('faviconUrl', e.target.value)}
                    placeholder="https://example.com/favicon.ico  or  /icon.png  etc."
                    style={{ ...mInputStyle, flex: 1 }}
                    onFocus={mFocus}
                    onBlur={mBlur}
                  />
                  {/* Live preview */}
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bg-base)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                    {form.faviconUrl?.trim() ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={form.faviconUrl.trim()} alt="preview" width={22} height={22} style={{ objectFit: 'contain' }}
                        onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; (e.currentTarget.nextSibling as HTMLElement).style.display = 'flex'; }}
                      />
                    ) : null}
                    <span style={{ fontSize: 13, color: 'var(--text-muted)', display: form.faviconUrl?.trim() ? 'none' : 'flex' }}>🖼</span>
                  </div>
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 5 }}>
                  Right-click site logo → Copy image address, ya /favicon.ico try karo.
                </p>
              </Field>

              <Field label="Description"><input value={form.description} onChange={e => setField('description', e.target.value)} placeholder="Short description..." style={mInputStyle} onFocus={mFocus} onBlur={mBlur} /></Field>
              <div className="modal-grid-2" style={{ gap: 12 }}>
                <Field label="Category">
                  <select value={form.category} onChange={e => setField('category', e.target.value)} style={{ ...mInputStyle, cursor: 'pointer' }}>
                    {categories.map(c => <option key={c} value={c} style={{ background: '#1a1a2e' }}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Region">
                  <select value={form.regions[0]} onChange={e => setField('regions', [e.target.value])} style={{ ...mInputStyle, cursor: 'pointer' }}>
                    {regions.map(r => <option key={r} value={r} style={{ background: '#1a1a2e' }}>{r}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Status">
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                  {(['isTrusted', 'isNew', 'isFeatured'] as const).map(key => {
                    const label = key.replace('is', '');
                    const color = TAG_COLORS[key];
                    return (
                      <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', fontSize: 13, color: form[key] ? color : 'var(--text-secondary)', fontWeight: form[key] ? 600 : 400, transition: 'color 0.15s' }}>
                        <input type="checkbox" checked={form[key] as boolean} onChange={e => setField(key, e.target.checked)} style={{ accentColor: color, width: 15, height: 15, cursor: 'pointer' }} />
                        {label}
                      </label>
                    );
                  })}
                </div>
              </Field>
              {formError && <div style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 8, padding: '10px 14px', color: 'var(--red)', fontSize: 13 }}>{formError}</div>}
              <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                <button type="submit" disabled={submitting} style={{ flex: 1, background: submitting ? 'rgba(139,92,246,0.5)' : 'var(--gradient)', border: 'none', borderRadius: 10, padding: '11px', color: '#fff', fontSize: 14, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', boxShadow: '0 4px 16px rgba(124,58,237,0.3)' }}>
                  {submitting ? 'Saving...' : modalMode === 'add' ? 'Add Site' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => setModalMode(null)} style={{ padding: '11px 20px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-secondary)', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Sites Table component ──
 * Ranking is scoped per category (that's how the public site groups and
 * renders them), so drag-and-drop / "move to position" only make sense
 * grouped by category, one reorderable table per category. Search mixes
 * categories together, where per-category position has no clear meaning —
 * so it falls back to a plain flat table with rank controls hidden.
 */
function SitesTable({ sites, categories, searchActive, apiReorder, onEdit, onDelete, deletingId, onReorder }: {
  sites: Site[];
  categories: string[];
  searchActive: boolean;
  apiReorder: string;
  onEdit: (s: Site) => void;
  onDelete: (id: string, name: string) => void;
  deletingId: string | null;
  onReorder: () => void;
}) {
  if (sites.length === 0) {
    return (
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
        No sites found
      </div>
    );
  }

  if (searchActive) {
    return <FlatSitesTable sites={sites} onEdit={onEdit} onDelete={onDelete} deletingId={deletingId} />;
  }

  const groups = categories
    .map(category => ({ category, items: sites.filter(s => s.category === category).sort((a, b) => a.order - b.order) }))
    .filter(g => g.items.length > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {groups.map(g => (
        <CategoryRankTable
          key={g.category}
          category={g.category}
          items={g.items}
          apiReorder={apiReorder}
          onEdit={onEdit}
          onDelete={onDelete}
          deletingId={deletingId}
          onReorder={onReorder}
        />
      ))}
    </div>
  );
}

const thStyle: React.CSSProperties = { textAlign: 'left', padding: '11px 16px', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' };

function FlatSitesTable({ sites, onEdit, onDelete, deletingId }: { sites: Site[]; onEdit: (s: Site) => void; onDelete: (id: string, name: string) => void; deletingId: string | null }) {
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Site', 'Category', 'Region', 'Tags', 'Added', 'Actions'].map(h => <th key={h} style={thStyle}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {sites.map((site, i) => (
              <tr key={site.id} style={{ borderBottom: i < sites.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none', transition: 'background 0.1s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
              >
                <td style={{ padding: '11px 16px', minWidth: 160 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{site.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{site.domain}</div>
                </td>
                <td style={{ padding: '11px 16px', fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{site.category}</td>
                <td style={{ padding: '11px 16px' }}>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {site.regions.slice(0, 2).map(r => <span key={r} style={{ fontSize: 10, color: 'var(--text-muted)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 4, padding: '1px 6px' }}>{r}</span>)}
                    {site.regions.length > 2 && <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>+{site.regions.length - 2}</span>}
                  </div>
                </td>
                <td style={{ padding: '11px 16px' }}>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {site.tags.length === 0 ? <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>—</span> : site.tags.map(t => <span key={t} className={`tag tag-${t}`}>{t}</span>)}
                  </div>
                </td>
                <td style={{ padding: '11px 16px', fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {site.addedAt ? new Date(site.addedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }) : '—'}
                </td>
                <td style={{ padding: '11px 16px', whiteSpace: 'nowrap' }}>
                  <button onClick={() => onEdit(site)} style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 7, padding: '5px 10px', color: 'var(--text-accent)', fontSize: 12, cursor: 'pointer', marginRight: 6, transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.2)'} onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.1)'}
                  >✎ Edit</button>
                  <button onClick={() => onDelete(site.id, site.name)} disabled={deletingId === site.id} style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 7, padding: '5px 10px', color: 'var(--red)', fontSize: 12, cursor: deletingId === site.id ? 'not-allowed' : 'pointer', opacity: deletingId === site.id ? 0.5 : 1, transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(244,63,94,0.15)'} onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(244,63,94,0.08)'}
                  >{deletingId === site.id ? '...' : '✕'}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* One drag-and-drop-reorderable table, scoped to a single category. */
function CategoryRankTable({ category, items, apiReorder, onEdit, onDelete, deletingId, onReorder }: {
  category: string;
  items: Site[];
  apiReorder: string;
  onEdit: (s: Site) => void;
  onDelete: (id: string, name: string) => void;
  deletingId: string | null;
  onReorder: () => void;
}) {
  const [rows, setRows] = useState(items);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { setRows(items); }, [items]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const persist = async (ordered: Site[]) => {
    setIsSaving(true);
    try {
      await fetch(apiReorder, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, orderedIds: ordered.map(s => s.id) }),
      });
      onReorder();
    } finally { setIsSaving(false); }
  };

  const moveTo = (fromIndex: number, toIndex: number) => {
    const reordered = arrayMove(rows, fromIndex, toIndex);
    setRows(reordered);
    persist(reordered);
  };

  const handleDragEnd = (event: { active: { id: string | number }; over: { id: string | number } | null }) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIndex = rows.findIndex(s => s.id === active.id);
    const toIndex = rows.findIndex(s => s.id === over.id);
    if (fromIndex === -1 || toIndex === -1) return;
    moveTo(fromIndex, toIndex);
  };

  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{category}</span>
        <span style={{ fontSize: 11, color: isSaving ? 'var(--text-accent)' : 'var(--text-muted)' }}>
          {isSaving ? 'Saving…' : `Drag ⣿ or type a rank to reorder`}
        </span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['', 'Rank', 'Site', 'Region', 'Tags', 'Actions'].map(h => <th key={h} style={thStyle}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={rows.map(s => s.id)} strategy={verticalListSortingStrategy}>
                {rows.map((site, index) => (
                  <SortableSiteRow
                    key={site.id}
                    site={site}
                    index={index}
                    total={rows.length}
                    onMove={moveTo}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    deletingId={deletingId}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SortableSiteRow({ site, index, total, onMove, onEdit, onDelete, deletingId }: {
  site: Site;
  index: number;
  total: number;
  onMove: (from: number, to: number) => void;
  onEdit: (s: Site) => void;
  onDelete: (id: string, name: string) => void;
  deletingId: string | null;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: site.id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? undefined,
    opacity: isDragging ? 0.5 : 1,
    borderBottom: index < total - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
  };

  return (
    <tr ref={setNodeRef} style={style}>
      <td style={{ padding: '11px 8px', width: 30 }}>
        <button {...attributes} {...listeners} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'grab', fontSize: 14, padding: 4, touchAction: 'none' }} aria-label={`Drag to reorder ${site.name}`}>⣿</button>
      </td>
      <td style={{ padding: '11px 16px', width: 70 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>#{index + 1}</span>
          <RankInput index={index} total={total} onMove={onMove} />
        </div>
      </td>
      <td style={{ padding: '11px 16px', minWidth: 160 }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{site.name}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{site.domain}</div>
      </td>
      <td style={{ padding: '11px 16px' }}>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {site.regions.slice(0, 2).map(r => <span key={r} style={{ fontSize: 10, color: 'var(--text-muted)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 4, padding: '1px 6px' }}>{r}</span>)}
          {site.regions.length > 2 && <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>+{site.regions.length - 2}</span>}
        </div>
      </td>
      <td style={{ padding: '11px 16px' }}>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {site.tags.length === 0 ? <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>—</span> : site.tags.map(t => <span key={t} className={`tag tag-${t}`}>{t}</span>)}
        </div>
      </td>
      <td style={{ padding: '11px 16px', whiteSpace: 'nowrap' }}>
        <button onClick={() => onEdit(site)} style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 7, padding: '5px 10px', color: 'var(--text-accent)', fontSize: 12, cursor: 'pointer', marginRight: 6, transition: 'background 0.15s' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.2)'} onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.1)'}
        >✎ Edit</button>
        <button onClick={() => onDelete(site.id, site.name)} disabled={deletingId === site.id} style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 7, padding: '5px 10px', color: 'var(--red)', fontSize: 12, cursor: deletingId === site.id ? 'not-allowed' : 'pointer', opacity: deletingId === site.id ? 0.5 : 1, transition: 'background 0.15s' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(244,63,94,0.15)'} onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(244,63,94,0.08)'}
        >{deletingId === site.id ? '...' : '✕'}</button>
      </td>
    </tr>
  );
}

/* "Move to position N" — a plain number input, committed on blur/Enter. */
function RankInput({ index, total, onMove }: { index: number; total: number; onMove: (from: number, to: number) => void }) {
  const [value, setValue] = useState(String(index + 1));
  useEffect(() => { setValue(String(index + 1)); }, [index]);

  const commit = () => {
    const n = parseInt(value, 10);
    if (Number.isFinite(n)) {
      const clamped = Math.min(Math.max(n, 1), total);
      if (clamped !== index + 1) { onMove(index, clamped - 1); return; }
    }
    setValue(String(index + 1));
  };

  return (
    <input
      type="number"
      min={1}
      max={total}
      value={value}
      onChange={e => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); commit(); } }}
      aria-label="Move to position"
      style={{ width: 46, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, padding: '3px 5px', color: 'var(--text-primary)', fontSize: 12, textAlign: 'center', outline: 'none' }}
    />
  );
}

/* ── Helpers ── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</label>
      {children}
    </div>
  );
}
const mInputStyle: React.CSSProperties = { width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 9, padding: '9px 12px', color: 'var(--text-primary)', fontSize: 13, outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s' };
const mFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => { e.currentTarget.style.borderColor = 'var(--text-accent)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--glow)'; };
const mBlur  = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; };
