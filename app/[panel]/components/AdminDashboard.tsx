'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Site } from '@/lib/data';
import type { SiteRequest } from '@/lib/db';
import { slugify } from '@/lib/siteConfig';
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
  name: '',
  url: '',
  description: '',
  domain: '',
  faviconUrl: '',
  category: 'Movies & Shows',
  regions: ['Global'],
  isTrusted: false,
  isNew: false,
  isFeatured: false,
};

const TAG_COLORS = {
  isTrusted: '#10b981',
  isNew: '#3b82f6',
  isFeatured: '#f59e0b',
};

const STATUS_STYLE: Record<string, { bg: string; color: string; border: string; label: string }> = {
  pending:  { bg: 'rgba(245,158,11,0.12)',  color: '#fbbf24', border: 'rgba(245,158,11,0.3)',  label: '⏳ Pending' },
  approved: { bg: 'rgba(16,185,129,0.12)', color: '#34d399', border: 'rgba(16,185,129,0.3)', label: '✅ Approved' },
  rejected: { bg: 'rgba(244,63,94,0.12)',  color: '#fb7185', border: 'rgba(244,63,94,0.3)',  label: '❌ Rejected' },
};

function cleanDomain(input: string): string {
  if (!input) return '';
  let str = input.trim().toLowerCase();
  str = str.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '');
  str = str.split('/')[0].split('?')[0].split('#')[0];
  return str.trim();
}

function findMatchingSite(req: SiteRequest, siteList: Site[]): Site | undefined {
  const reqDom = cleanDomain(req.siteUrl);
  const reqName = req.siteName.trim().toLowerCase();
  const reqUrlClean = req.siteUrl.trim().toLowerCase().replace(/\/+$/, '');

  return siteList.find(s => {
    const sDom = cleanDomain(s.domain || s.url);
    const sUrlClean = s.url.trim().toLowerCase().replace(/\/+$/, '');
    const sName = s.name.trim().toLowerCase();

    // 1. Exact domain match
    if (reqDom && sDom && (reqDom === sDom || reqDom.endsWith('.' + sDom) || sDom.endsWith('.' + reqDom))) {
      return true;
    }
    // 2. Exact URL match
    if (reqUrlClean && sUrlClean && reqUrlClean === sUrlClean) {
      return true;
    }
    // 3. Exact site name match
    if (reqName && sName && reqName === sName) {
      return true;
    }
    return false;
  });
}

export default function AdminDashboard({ panel, initialSites, initialRequests, categories: initialCategories, regions }: Props) {
  const router = useRouter();
  const apiSites = `/api/${panel}/sites`;
  const apiRequests = `/api/${panel}/requests`;
  const apiAuth = `/api/${panel}/auth`;

  const [activeTab, setActiveTab] = useState<'sites' | 'requests'>('sites');

  /* ── Sites & Categories state ── */
  const [sites, setSites] = useState<Site[]>(initialSites);
  const [categoriesList, setCategoriesList] = useState<string[]>(initialCategories);
  const [siteSearch, setSiteSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [syncingLive, setSyncingLive] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  /* ── Modal & Form state ── */
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [editSite, setEditSite] = useState<Site | null>(null);
  const [approvingRequestId, setApprovingRequestId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [refreshingLogoId, setRefreshingLogoId] = useState<string | null>(null);
  const [refreshAllBusy, setRefreshAllBusy] = useState(false);
  const [refreshAllResult, setRefreshAllResult] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  /* ── Toast notifications ── */
  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => {
      setToastMsg(prev => (prev?.text === text ? null : prev));
    }, 4500);
  }, []);

  /* ── Copy to clipboard helper ── */
  const copyToClipboard = (text: string, id: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      showToast(`Copied to clipboard: ${text}`, 'info');
      setTimeout(() => setCopiedId(prev => (prev === id ? null : prev)), 2000);
    }
  };

  /* ── Force Live Sync & Cloudflare Cache Purge ── */
  const handleForceSync = async () => {
    setSyncingLive(true);
    try {
      const res = await fetch(`/api/${panel}/sync`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        const cfStatus = data.cloudflare?.success ? 'Edge cache purged' : 'Revalidated on server';
        showToast(`⚡ Live sync complete! ${cfStatus} · ${data.sitesCount} sites active.`, 'success');
        await refreshSites();
        await refreshRequests();
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(`Sync error: ${err.error || 'Check server logs'}`, 'error');
      }
    } catch {
      showToast('Network error during live cache purge.', 'error');
    } finally {
      setSyncingLive(false);
    }
  };

  /* ── Inline Toggle Tag (Trusted, New, Featured) ── */
  const handleToggleTag = async (site: Site, tagKey: 'isTrusted' | 'isNew' | 'isFeatured') => {
    const updatedVal = !site[tagKey];
    const tags = new Set(site.tags || []);
    const tagSlug = tagKey.replace('is', '').toLowerCase();
    if (updatedVal) {
      tags.add(tagSlug);
    } else {
      tags.delete(tagSlug);
    }

    // Optimistic UI update
    setSites(prev => prev.map(s => s.id === site.id ? { ...s, [tagKey]: updatedVal, tags: Array.from(tags) } : s));

    try {
      const res = await fetch(apiSites, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: site.id,
          [tagKey]: updatedVal,
          tags: Array.from(tags),
        }),
      });
      if (res.ok) {
        showToast(`Updated "${site.name}" (${tagSlug}: ${updatedVal ? 'ON' : 'OFF'}) — live on website!`, 'success');
      } else {
        await refreshSites();
        showToast('Failed to update badge on server.', 'error');
      }
    } catch {
      await refreshSites();
      showToast('Network error updating badge.', 'error');
    }
  };

  /* ── Requests state ── */
  const [requests, setRequests] = useState<SiteRequest[]>(initialRequests);
  const [reqSearch, setReqSearch] = useState('');
  const [reqFilter, setReqFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [reqListingFilter, setReqListingFilter] = useState<'all' | 'listed' | 'not-listed'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  /* ── Stats ── */
  const stats = useMemo(() => ({
    total: sites.length,
    trusted: sites.filter(s => s.isTrusted).length,
    newSites: sites.filter(s => s.isNew).length,
    featured: sites.filter(s => s.isFeatured).length,
  }), [sites]);

  const pendingCount = useMemo(() => requests.filter(r => r.status === 'pending').length, [requests]);

  /* ── Request listing stats ── */
  const requestListingStats = useMemo(() => {
    let listed = 0;
    let notListed = 0;
    requests.forEach(r => {
      if (findMatchingSite(r, sites)) {
        listed++;
      } else {
        notListed++;
      }
    });
    return { listed, notListed, total: requests.length };
  }, [requests, sites]);

  /* ── Filtered sites (by category and search) ── */
  const filteredSites = useMemo(() => {
    let list = sites;
    if (selectedCategory !== 'all') {
      list = list.filter(s => s.category?.toLowerCase() === selectedCategory.toLowerCase());
    }
    if (siteSearch.trim()) {
      const q = siteSearch.toLowerCase();
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.domain.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [sites, selectedCategory, siteSearch]);

  /* ── Filtered requests ── */
  const filteredReqs = useMemo(() => {
    let list = requests;
    if (reqFilter !== 'all') list = list.filter(r => r.status === reqFilter);
    if (reqListingFilter === 'listed') {
      list = list.filter(r => Boolean(findMatchingSite(r, sites)));
    } else if (reqListingFilter === 'not-listed') {
      list = list.filter(r => !findMatchingSite(r, sites));
    }
    if (reqSearch.trim()) {
      const q = reqSearch.toLowerCase();
      list = list.filter(r =>
        r.siteName.toLowerCase().includes(q) ||
        r.siteUrl.toLowerCase().includes(q) ||
        (r.reason && r.reason.toLowerCase().includes(q))
      );
    }
    return list;
  }, [requests, reqFilter, reqListingFilter, reqSearch, sites]);

  /* ── Refresh functions ── */
  const refreshSites = useCallback(async () => {
    try {
      const res = await fetch(apiSites);
      if (res.ok) {
        const data: Site[] = await res.json();
        setSites(data);
        const discovered = Array.from(new Set([...initialCategories, ...data.map(s => s.category).filter(Boolean)]));
        setCategoriesList(discovered);
      }
    } catch { /* ignore */ }
  }, [apiSites, initialCategories]);

  const refreshRequests = useCallback(async () => {
    try {
      const res = await fetch(apiRequests);
      if (res.ok) setRequests(await res.json());
    } catch { /* ignore */ }
  }, [apiRequests]);

  /* ── Logout ── */
  const logout = async () => {
    await fetch(apiAuth, { method: 'DELETE' });
    router.push(`/${panel}/login`);
    router.refresh();
  };

  /* ── Modal actions ── */
  const openAdd = () => {
    const defaultCat = selectedCategory !== 'all' ? selectedCategory : (categoriesList[0] ?? 'Movies & Shows');
    setForm({ ...EMPTY_FORM, category: defaultCat });
    setIsCustomCategory(false);
    setCustomCategoryInput('');
    setEditSite(null);
    setApprovingRequestId(null);
    setFormError('');
    setModalMode('add');
  };

  const openEdit = (site: Site) => {
    setForm({
      name: site.name,
      url: site.url,
      description: site.description ?? '',
      domain: site.domain,
      faviconUrl: site.faviconUrl ?? '',
      category: site.category,
      regions: site.regions,
      isTrusted: site.isTrusted,
      isNew: site.isNew,
      isFeatured: site.isFeatured,
    });
    setIsCustomCategory(!categoriesList.includes(site.category));
    setCustomCategoryInput(!categoriesList.includes(site.category) ? site.category : '');
    setEditSite(site);
    setApprovingRequestId(null);
    setFormError('');
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
    setEditSite(null);
    setApprovingRequestId(null);
    setFormError('');
  };

  /* Close modal on Escape key */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modalMode) {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalMode]);

  /* ── Submit Site Add / Edit ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!form.name.trim() || !form.url.trim()) {
      setFormError('Name and URL are required.');
      return;
    }

    setSubmitting(true);
    try {
      let domain = form.domain.trim();
      if (!domain) {
        try {
          domain = new URL(form.url.trim()).hostname.replace(/^www\./, '');
        } catch {
          domain = form.url.trim();
        }
      }

      const finalCategory = isCustomCategory && customCategoryInput.trim()
        ? customCategoryInput.trim()
        : form.category;

      const tags: string[] = [];
      if (form.isTrusted) tags.push('trusted');
      if (form.isNew) tags.push('new');
      if (form.isFeatured) tags.push('featured');

      const payload = {
        ...form,
        domain,
        category: finalCategory,
        tags,
        faviconUrl: form.faviconUrl?.trim() || undefined,
      };

      const res = await fetch(apiSites, modalMode === 'edit'
        ? {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...payload, id: editSite!.id }),
          }
        : {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setFormError(err.error ?? 'Failed to save site');
        return;
      }

      // If approving a request atomically, mark the request approved now
      if (approvingRequestId) {
        try {
          await fetch(apiRequests, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: approvingRequestId, status: 'approved' }),
          });
          await refreshRequests();
        } catch { /* ignore */ }
      }

      await refreshSites();
      closeModal();
      showToast(
        modalMode === 'edit'
          ? `✅ "${payload.name}" updated & live on website!`
          : `✅ "${payload.name}" published & live on website!`,
        'success'
      );
    } catch {
      setFormError('Network error while saving site.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Refresh single site logo ── */
  const handleRefreshLogo = async () => {
    const siteId = editSite?.id;
    let domain = form.domain.trim();
    if (!domain && form.url.trim()) {
      try {
        domain = new URL(form.url.trim()).hostname.replace(/^www\./, '');
      } catch {
        domain = form.url.trim();
      }
    }

    if (!domain) {
      setFormError('Enter a URL or domain first to detect logo.');
      return;
    }

    setRefreshingLogoId(siteId ?? domain);
    setFormError('');
    try {
      const res = await fetch(`/api/${panel}/sites/logo-refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteId ? { siteId, domain } : { domain }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.faviconUrl) {
          setField('faviconUrl', data.faviconUrl);
          showToast(`Logo fetched for ${domain}!`, 'success');
          if (siteId) await refreshSites();
        }
      } else {
        setFormError('Logo auto-fetch failed. You can paste a direct logo URL.');
      }
    } catch {
      setFormError('Network error during logo refresh.');
    } finally {
      setRefreshingLogoId(null);
    }
  };

  /* ── Refresh all logos ── */
  const handleRefreshAllLogos = async () => {
    if (!confirm('This will scan and re-fetch logos for all sites from their websites. Continue?')) return;
    setRefreshAllBusy(true);
    setRefreshAllResult(null);
    try {
      const res = await fetch(`/api/${panel}/sites/auto-fetch-logos`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setRefreshAllResult(`✓ Updated ${data.updatedCount} of ${data.totalSites} sites`);
        showToast(`✓ Updated logos for ${data.updatedCount} sites.`, 'success');
        await refreshSites();
      } else {
        setRefreshAllResult('✗ Refresh failed — check server logs');
        showToast('Bulk logo refresh failed.', 'error');
      }
    } catch {
      setRefreshAllResult('✗ Network error');
      showToast('Network error during bulk logo refresh.', 'error');
    } finally {
      setRefreshAllBusy(false);
    }
  };

  /* ── Delete Site ── */
  const handleDeleteSite = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}" from AllSiteHub?`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${apiSites}?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSites(prev => prev.filter(s => s.id !== id));
        showToast(`✅ "${name}" deleted & live cache purged!`, 'success');
      } else {
        showToast(`Failed to delete "${name}".`, 'error');
      }
    } catch {
      showToast('Network error while deleting.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  /* ── Requests actions ── */
  const updateReqStatus = async (id: string, status: 'approved' | 'rejected') => {
    setUpdatingId(id);
    try {
      const res = await fetch(apiRequests, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        const data = await res.json();
        const updatedReq = data.request || data;
        setRequests(prev => prev.map(r => (r.id === id ? updatedReq : r)));
        await refreshSites();
        showToast(`✅ Request ${status} & live database updated!`, 'success');
      } else {
        showToast('Failed to update request status.', 'error');
      }
    } catch {
      showToast('Network error updating request.', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  /* ── Edit & Publish atomic flow ── */
  const approveAndEdit = (req: SiteRequest) => {
    let domain = req.siteUrl;
    try {
      domain = new URL(req.siteUrl).hostname.replace(/^www\./, '');
    } catch {
      domain = req.siteUrl;
    }

    const targetCat = (req.targets && req.targets[0]?.category) || categoriesList[0] || 'Movies & Shows';
    const targetRegions = req.targets && req.targets.length > 0
      ? Array.from(new Set(req.targets.map(t => t.region).filter(Boolean)))
      : ['Global'];

    setForm({
      name: req.siteName,
      url: req.siteUrl,
      description: req.reason ? req.reason.trim() : `Watch on ${req.siteName}.`,
      domain: domain,
      faviconUrl: '',
      category: targetCat,
      regions: targetRegions.length > 0 ? targetRegions : ['Global'],
      isTrusted: false,
      isNew: true,
      isFeatured: false,
    });
    setIsCustomCategory(!categoriesList.includes(targetCat));
    setCustomCategoryInput(!categoriesList.includes(targetCat) ? targetCat : '');
    setEditSite(null);
    setApprovingRequestId(req.id);
    setFormError('');
    setModalMode('add');
  };

  const deleteRequest = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this user request?')) return;
    try {
      const res = await fetch(`${apiRequests}?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setRequests(prev => prev.filter(r => r.id !== id));
        showToast('✅ Request deleted', 'info');
      } else {
        showToast('Failed to delete request.', 'error');
      }
    } catch {
      showToast('Network error deleting request.', 'error');
    }
  };

  const setField = (k: keyof typeof EMPTY_FORM, v: unknown) => setForm(prev => ({ ...prev, [k]: v }));

  /* ══════════════════ RENDER ══════════════════ */
  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh', position: 'relative', color: 'var(--text-primary)' }}>

      {/* ── Toast Notifications ── */}
      {toastMsg && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          background: toastMsg.type === 'error' ? 'rgba(136,19,55,0.95)' : toastMsg.type === 'info' ? 'rgba(30,58,138,0.95)' : 'rgba(6,78,59,0.95)',
          border: `1px solid ${toastMsg.type === 'error' ? '#f43f5e' : toastMsg.type === 'info' ? '#60a5fa' : '#10b981'}`,
          color: '#fff', padding: '12px 18px', borderRadius: 12,
          fontSize: 13, fontWeight: 600, boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', gap: 12, backdropFilter: 'blur(8px)',
          animation: 'slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
          <span style={{ fontSize: 16 }}>{toastMsg.type === 'error' ? '❌' : toastMsg.type === 'info' ? 'ℹ️' : '✅'}</span>
          <span>{toastMsg.text}</span>
          <button onClick={() => setToastMsg(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: 16, padding: '0 4px' }}>✕</button>
        </div>
      )}

      {/* ── Navbar Header ── */}
      <header style={{ background: 'rgba(7,7,14,0.96)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(16px)' }}>
        <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          
          {/* Logo & Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 16px rgba(124,58,237,0.4)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h10M4 18h13" stroke="white" strokeWidth="2.4" strokeLinecap="round"/></svg>
            </div>
            <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>Allsitehub</span>
            <span style={{ fontSize: 10, color: 'var(--text-accent)', background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 5, padding: '2px 8px', fontWeight: 700, letterSpacing: '0.06em' }}>ADMIN</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#34d399', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 6, padding: '2px 8px', fontWeight: 600 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
              Live Sync Active
            </span>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {/* ⚡ Purge Cache & Sync Live Button */}
            <button
              onClick={handleForceSync}
              disabled={syncingLive}
              title="Clears Cloudflare CDN cache & instantly revalidates all public website pages"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                background: 'linear-gradient(135deg, rgba(16,185,129,0.18), rgba(6,182,212,0.18))',
                border: '1px solid rgba(16,185,129,0.4)',
                borderRadius: 8, padding: '6px 14px',
                color: '#34d399', fontSize: 12, fontWeight: 700,
                cursor: syncingLive ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s', whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { if (!syncingLive) (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, rgba(16,185,129,0.28), rgba(6,182,212,0.28))'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, rgba(16,185,129,0.18), rgba(6,182,212,0.18))'; }}
            >
              <span style={{ fontSize: 14, display: 'inline-block', animation: syncingLive ? 'spin 1s linear infinite' : 'none' }}>⚡</span>
              {syncingLive ? 'Syncing Live…' : 'Purge Cache & Sync Live'}
            </button>

            {/* Visit Live Website */}
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 12, fontWeight: 600,
                padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)',
                background: 'rgba(255,255,255,0.03)', transition: 'all 0.15s', whiteSpace: 'nowrap',
                display: 'inline-flex', alignItems: 'center', gap: 5,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-accent)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
            >
              <span>🌐</span> Visit Website ↗
            </Link>

            {/* Logout */}
            <button
              onClick={logout}
              style={{
                background: 'none', border: '1px solid var(--border)', borderRadius: 8,
                padding: '6px 12px', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--red)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(244,63,94,0.4)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Container ── */}
      <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto', padding: '24px 20px 80px' }}>

        {/* ── Header Title & Actions ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>Admin Control Center</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>Manage streaming sites, manual drag rankings, and incoming user requests</p>
          </div>

          {activeTab === 'sites' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              {/* Refresh All Logos */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                <button
                  onClick={handleRefreshAllLogos}
                  disabled={refreshAllBusy}
                  title="Re-fetch high-resolution logos for all sites"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
                    borderRadius: 9, padding: '9px 15px', color: 'var(--text-secondary)',
                    fontSize: 13, fontWeight: 600, cursor: refreshAllBusy ? 'not-allowed' : 'pointer',
                    opacity: refreshAllBusy ? 0.6 : 1, transition: 'all 0.15s', whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => { if (!refreshAllBusy) { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-accent)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; } }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
                >
                  <span style={{ fontSize: 14, display: 'inline-block', animation: refreshAllBusy ? 'spin 1s linear infinite' : 'none' }}>🔄</span>
                  {refreshAllBusy ? 'Refreshing…' : 'Refresh All Logos'}
                </button>
                {refreshAllResult && (
                  <span style={{ fontSize: 11, color: refreshAllResult.startsWith('✓') ? '#34d399' : '#f43f5e', fontWeight: 600 }}>{refreshAllResult}</span>
                )}
              </div>

              {/* Add Site */}
              <button
                onClick={openAdd}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  background: 'var(--gradient)', border: 'none', borderRadius: 9,
                  padding: '10px 18px', color: '#fff', fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', boxShadow: '0 4px 18px rgba(124,58,237,0.35)',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 24px rgba(124,58,237,0.45)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 18px rgba(124,58,237,0.35)'; }}
              >
                <span style={{ fontSize: 17, lineHeight: 1 }}>+</span> Add New Site
              </button>
            </div>
          )}
        </div>

        {/* ── Stats Bar ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Total Sites', value: stats.total, color: 'var(--text-accent)', icon: '📡', grad: 'var(--gradient)', isTab: false },
            { label: 'Trusted Sites', value: stats.trusted, color: '#34d399', icon: '🛡️', grad: 'linear-gradient(90deg,#10b981,#34d399)', isTab: false },
            { label: 'New Sites', value: stats.newSites, color: '#60a5fa', icon: '🆕', grad: 'linear-gradient(90deg,#3b82f6,#60a5fa)', isTab: false },
            { label: 'Featured Sites', value: stats.featured, color: '#fbbf24', icon: '⭐', grad: 'linear-gradient(90deg,#f59e0b,#fbbf24)', isTab: false },
            { label: 'Pending Requests', value: pendingCount, color: '#fbbf24', icon: '📬', grad: 'linear-gradient(90deg,#f59e0b,#fb923c)', isTab: true },
          ].map(s => (
            <div
              key={s.label}
              style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                borderRadius: 12, padding: '14px 16px', position: 'relative', overflow: 'hidden',
                cursor: s.isTab ? 'pointer' : 'default', transition: 'border-color 0.15s, transform 0.15s',
              }}
              onClick={() => {
                if (s.isTab) {
                  setActiveTab('requests');
                  setReqFilter('pending');
                }
              }}
              onMouseEnter={e => { if (s.isTab) { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-accent)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; } }}
              onMouseLeave={e => { if (s.isTab) { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.transform = 'none'; } }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: s.grad }} />
              <div style={{ fontSize: 16, marginBottom: 5 }}>{s.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color, letterSpacing: '-0.04em', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Main Tab Navigation ── */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 4, width: 'fit-content' }}>
          {[
            { key: 'sites', label: 'All Sites Directory', count: sites.length },
            { key: 'requests', label: 'User Requests', count: pendingCount, isAlert: pendingCount > 0 },
          ].map(tab => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as 'sites' | 'requests')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 16px', borderRadius: 7, border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 700, transition: 'all 0.15s',
                  background: isActive ? 'rgba(139,92,246,0.18)' : 'transparent',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                }}
              >
                <span>{tab.label}</span>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 5,
                  background: tab.isAlert ? 'rgba(245,158,11,0.2)' : isActive ? 'rgba(139,92,246,0.25)' : 'rgba(255,255,255,0.06)',
                  color: tab.isAlert ? '#fbbf24' : isActive ? 'var(--text-accent)' : 'var(--text-muted)',
                }}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ════════════════ SITES TAB ════════════════ */}
        {activeTab === 'sites' && (
          <div>
            {/* Search Input */}
            <div style={{ position: 'relative', marginBottom: 14, maxWidth: 400 }}>
              <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input
                type="text"
                placeholder="Search sites by name, domain, or category..."
                value={siteSearch}
                onChange={e => setSiteSearch(e.target.value)}
                style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 9, padding: '9px 34px 9px 34px', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }}
                onFocus={e => { e.currentTarget.style.borderColor = 'var(--text-accent)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--glow)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
              />
              {siteSearch && (
                <button
                  onClick={() => setSiteSearch('')}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14 }}
                  title="Clear search"
                >✕</button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 10, marginBottom: 14 }} className="no-scrollbar">
              <button
                onClick={() => setSelectedCategory('all')}
                style={{
                  padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap',
                  background: selectedCategory === 'all' ? 'var(--gradient)' : 'var(--bg-surface)',
                  color: selectedCategory === 'all' ? '#fff' : 'var(--text-secondary)',
                  boxShadow: selectedCategory === 'all' ? '0 4px 14px rgba(124,58,237,0.35)' : 'none',
                  border: '1px solid ' + (selectedCategory === 'all' ? 'transparent' : 'var(--border)'),
                  transition: 'all 0.15s',
                }}
              >
                All Categories ({sites.length})
              </button>
              {categoriesList.map(cat => {
                const count = sites.filter(s => s.category?.toLowerCase() === cat.toLowerCase()).length;
                const isSel = selectedCategory.toLowerCase() === cat.toLowerCase();
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
                      background: isSel ? 'var(--gradient)' : 'var(--bg-surface)',
                      color: isSel ? '#fff' : 'var(--text-secondary)',
                      boxShadow: isSel ? '0 4px 14px rgba(124,58,237,0.35)' : 'none',
                      border: '1px solid ' + (isSel ? 'transparent' : 'var(--border)'),
                      transition: 'all 0.15s',
                    }}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                Showing <strong style={{ color: 'var(--text-accent)' }}>{filteredSites.length}</strong> of {sites.length} sites
                {selectedCategory !== 'all' ? ` in ${selectedCategory}` : ''}
              </p>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Drag ⣿ handles or type rank numbers to reorder
              </span>
            </div>

            <SitesTable
              sites={filteredSites}
              categories={categoriesList}
              selectedCategory={selectedCategory}
              searchActive={!!siteSearch.trim()}
              apiReorder={`/api/${panel}/sites/reorder`}
              onEdit={openEdit}
              onDelete={handleDeleteSite}
              onToggleTag={handleToggleTag}
              deletingId={deletingId}
              onReorder={refreshSites}
              showToast={showToast}
              onCopy={copyToClipboard}
              copiedId={copiedId}
            />
          </div>
        )}

        {/* ════════════════ REQUESTS TAB ════════════════ */}
        {activeTab === 'requests' && (
          <div>
            {/* Filters */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 300 }}>
                <svg style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input
                  type="text"
                  placeholder="Search user requests..."
                  value={reqSearch}
                  onChange={e => setReqSearch(e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 9, padding: '8px 12px 8px 30px', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'var(--text-accent)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--glow)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
                />
              </div>

              {/* Request Status Filter */}
              <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.02)', padding: '3px', borderRadius: 8, border: '1px solid var(--border)' }}>
                {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setReqFilter(f)}
                    style={{
                      padding: '5px 12px', borderRadius: 6, border: 'none', fontSize: 12, fontWeight: 600,
                      cursor: 'pointer', transition: 'all 0.15s', textTransform: 'capitalize',
                      background: reqFilter === f ? 'rgba(139,92,246,0.2)' : 'transparent',
                      color: reqFilter === f ? 'var(--text-primary)' : 'var(--text-muted)',
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* Directory Listing Filter */}
              <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.02)', padding: '3px', borderRadius: 8, border: '1px solid var(--border)' }}>
                <button
                  onClick={() => setReqListingFilter('all')}
                  style={{
                    padding: '5px 11px', borderRadius: 6, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    background: reqListingFilter === 'all' ? 'rgba(139,92,246,0.2)' : 'transparent',
                    color: reqListingFilter === 'all' ? 'var(--text-primary)' : 'var(--text-muted)',
                  }}
                >
                  All ({requestListingStats.total})
                </button>
                <button
                  onClick={() => setReqListingFilter('listed')}
                  style={{
                    padding: '5px 11px', borderRadius: 6, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    background: reqListingFilter === 'listed' ? 'rgba(16,185,129,0.2)' : 'transparent',
                    color: reqListingFilter === 'listed' ? '#34d399' : 'var(--text-muted)',
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }}></span>
                  Listed on Website ({requestListingStats.listed})
                </button>
                <button
                  onClick={() => setReqListingFilter('not-listed')}
                  style={{
                    padding: '5px 11px', borderRadius: 6, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    background: reqListingFilter === 'not-listed' ? 'rgba(239,68,68,0.2)' : 'transparent',
                    color: reqListingFilter === 'not-listed' ? '#f87171' : 'var(--text-muted)',
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }}></span>
                  Not on Website ({requestListingStats.notListed})
                </button>
              </div>

              <button
                onClick={refreshRequests}
                title="Refresh requests"
                style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}
              >
                ↻ Refresh
              </button>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 12 }}>
              Showing <strong style={{ color: 'var(--text-accent)' }}>{filteredReqs.length}</strong> requests
            </p>

            {filteredReqs.length === 0 ? (
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>📬</div>
                <p style={{ fontWeight: 600 }}>No matching user requests found.</p>
                <p style={{ fontSize: 12, marginTop: 4 }}>New site submission requests will appear here instantly.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {filteredReqs.map(req => {
                  const st = STATUS_STYLE[req.status] || STATUS_STYLE.pending;
                  const busy = updatingId === req.id;
                  const matchingSite = findMatchingSite(req, sites);
                  const isListed = Boolean(matchingSite);

                  return (
                    <div
                      key={req.id}
                      style={{
                        background: 'var(--bg-surface)', border: '1px solid var(--border)',
                        borderRadius: 12, padding: '18px 20px', display: 'flex', gap: 16,
                        alignItems: 'flex-start', flexWrap: 'wrap',
                      }}
                    >
                      {/* Left info */}
                      <div style={{ flex: '1 1 280px', minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{req.siteName}</span>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 5, background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
                            {st.label}
                          </span>

                          {/* Live Listed Indicator */}
                          {isListed ? (
                            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 5, background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <span>✓</span> Listed in {matchingSite?.category}
                            </span>
                          ) : (
                            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 5, background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <span>✕</span> Not on Website
                            </span>
                          )}
                        </div>

                        {/* URL link */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          <a
                            href={req.siteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'var(--text-muted)', fontSize: 12, textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-accent)')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                          >
                            🔗 {req.siteUrl} ↗
                          </a>
                          <button
                            onClick={() => copyToClipboard(req.siteUrl, req.id)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 11 }}
                            title="Copy link"
                          >
                            {copiedId === req.id ? '✓ Copied' : '📋'}
                          </button>
                        </div>

                        {/* Targets */}
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: req.reason ? 8 : 0 }}>
                          {(req.targets || []).map((t, i) => (
                            <span key={i} style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 5, padding: '2px 8px' }}>
                              {t.region} · {t.category}
                            </span>
                          ))}
                        </div>

                        {/* Reason / Comment */}
                        {req.reason && (
                          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.5, maxWidth: 550, background: 'rgba(255,255,255,0.02)', padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)' }}>
                            &ldquo;{req.reason}&rdquo;
                          </p>
                        )}

                        <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 8 }}>
                          Submitted: {new Date(req.submittedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      {/* Right actions */}
                      <div style={{ display: 'flex', gap: 7, flexShrink: 0, flexWrap: 'wrap', alignItems: 'center' }}>
                        {isListed && matchingSite && (
                          <button
                            onClick={() => openEdit(matchingSite)}
                            style={{ padding: '7px 12px', background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 8, color: 'var(--text-accent)', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.22)'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.12)'}
                          >
                            ✎ Edit Listed Site
                          </button>
                        )}

                        {!isListed && req.status !== 'approved' && (
                          <button
                            disabled={busy}
                            onClick={() => updateReqStatus(req.id, 'approved')}
                            style={{ padding: '7px 14px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.35)', borderRadius: 8, color: '#34d399', fontSize: 12, fontWeight: 700, cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.5 : 1, transition: 'all 0.15s' }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(16,185,129,0.25)'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(16,185,129,0.15)'}
                          >
                            ✓ Approve & Publish Live
                          </button>
                        )}

                        {!isListed && (
                          <button
                            disabled={busy}
                            onClick={() => approveAndEdit(req)}
                            style={{ padding: '7px 12px', background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 8, color: '#60a5fa', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(59,130,246,0.22)'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(59,130,246,0.12)'}
                          >
                            ✏️ Edit & Publish
                          </button>
                        )}

                        {req.status !== 'rejected' && (
                          <button
                            disabled={busy}
                            onClick={() => updateReqStatus(req.id, 'rejected')}
                            style={{ padding: '7px 12px', background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 8, color: 'var(--red)', fontSize: 12, fontWeight: 600, cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.5 : 1, transition: 'background 0.15s' }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(244,63,94,0.18)'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(244,63,94,0.08)'}
                          >
                            ✗ Reject
                          </button>
                        )}

                        <button
                          onClick={() => deleteRequest(req.id)}
                          style={{ padding: '7px 10px', background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer', transition: 'all 0.15s' }}
                          title="Delete request"
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--red)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(244,63,94,0.3)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ════════════════ ADD / EDIT SITE MODAL ════════════════ */}
      {modalMode && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          }}
          onClick={e => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div
            style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border-accent)',
              borderRadius: 18, width: '100%', maxWidth: 540, maxHeight: '90vh', overflow: 'auto',
              boxShadow: '0 32px 100px rgba(0,0,0,0.8), 0 0 40px rgba(124,58,237,0.15)',
            }}
            className="no-scrollbar"
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid var(--border)' }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                  {modalMode === 'add' ? (approvingRequestId ? '✓ Approve & Publish Site' : '+ Add New Site') : '✎ Edit Site'}
                </h2>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Changes reflect instantly across the live website upon saving</p>
              </div>
              <button
                onClick={closeModal}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 22, cursor: 'pointer', padding: '2px 6px', borderRadius: 6 }}
              >
                ×
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 15 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                <Field label="Site Name *">
                  <input
                    required
                    value={form.name}
                    onChange={e => setField('name', e.target.value)}
                    placeholder="e.g. Netflix"
                    style={mInputStyle}
                    onFocus={mFocus}
                    onBlur={mBlur}
                  />
                </Field>
                <Field label="Website URL *">
                  <input
                    required
                    type="url"
                    value={form.url}
                    onChange={e => {
                      const newUrl = e.target.value;
                      setField('url', newUrl);
                      if (!form.domain && newUrl) {
                        try {
                          const computed = new URL(newUrl).hostname.replace(/^www\./, '');
                          setField('domain', computed);
                        } catch { /* ignore */ }
                      }
                    }}
                    placeholder="https://example.com"
                    style={mInputStyle}
                    onFocus={mFocus}
                    onBlur={mBlur}
                  />
                </Field>
              </div>

              <Field label="Clean Domain (e.g. example.com)">
                <input
                  value={form.domain}
                  onChange={e => setField('domain', e.target.value)}
                  placeholder="Leave empty to auto-extract from URL"
                  style={mInputStyle}
                  onFocus={mFocus}
                  onBlur={mBlur}
                />
              </Field>

              {/* Favicon URL with live preview + refresh button */}
              <Field label="Favicon / Logo (Auto-detects from website or enter custom URL)">
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    value={form.faviconUrl}
                    onChange={e => setField('faviconUrl', e.target.value)}
                    placeholder="Leave blank to auto-fetch high-res logo"
                    style={{ ...mInputStyle, flex: 1 }}
                    onFocus={mFocus}
                    onBlur={mBlur}
                  />
                  {/* Live preview */}
                  <div style={{ width: 38, height: 38, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                    {form.faviconUrl?.trim() ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={form.faviconUrl.trim()}
                        alt="preview"
                        width={24}
                        height={24}
                        style={{ objectFit: 'contain' }}
                        onError={e => {
                          const fallback = form.domain ? `https://www.google.com/s2/favicons?domain=${form.domain}&sz=64` : '';
                          if (fallback && (e.currentTarget as HTMLImageElement).src !== fallback) {
                            (e.currentTarget as HTMLImageElement).src = fallback;
                          } else {
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                          }
                        }}
                      />
                    ) : form.domain ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`https://www.google.com/s2/favicons?domain=${form.domain}&sz=64`}
                        alt="preview"
                        width={22}
                        height={22}
                        style={{ objectFit: 'contain' }}
                        onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>🖼</span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  <button
                    type="button"
                    onClick={handleRefreshLogo}
                    disabled={!!refreshingLogoId}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)',
                      borderRadius: 7, padding: '5px 12px',
                      color: 'var(--text-accent)', fontSize: 12, fontWeight: 700,
                      cursor: refreshingLogoId ? 'not-allowed' : 'pointer',
                      opacity: refreshingLogoId ? 0.6 : 1, transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { if (!refreshingLogoId) (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.22)'; }}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.12)'}
                  >
                    <span style={{ fontSize: 13, display: 'inline-block', animation: refreshingLogoId ? 'spin 1s linear infinite' : 'none' }}>🔄</span>
                    {refreshingLogoId ? 'Detecting Logo…' : '🔄 Auto-Detect Logo'}
                  </button>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Auto-resolves high-res icons directly from web domain.</span>
                </div>
              </Field>

              <Field label="Description">
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={e => setField('description', e.target.value)}
                  placeholder="Short description of this platform..."
                  style={{ ...mInputStyle, resize: 'vertical' }}
                  onFocus={mFocus}
                  onBlur={mBlur}
                />
              </Field>

              {/* Category & Region */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                <Field label="Category">
                  {!isCustomCategory ? (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <select
                        value={form.category}
                        onChange={e => {
                          if (e.target.value === '__custom__') {
                            setIsCustomCategory(true);
                            setCustomCategoryInput('');
                          } else {
                            setField('category', e.target.value);
                          }
                        }}
                        style={{ ...mInputStyle, cursor: 'pointer', flex: 1 }}
                      >
                        {categoriesList.map(c => (
                          <option key={c} value={c} style={{ background: '#141426', color: '#fff' }}>
                            {c}
                          </option>
                        ))}
                        <option value="__custom__" style={{ background: '#141426', color: '#a78bfa', fontWeight: 'bold' }}>
                          + Enter Custom Category...
                        </option>
                      </select>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <input
                        value={customCategoryInput}
                        onChange={e => setCustomCategoryInput(e.target.value)}
                        placeholder="Type new category name..."
                        autoFocus
                        style={{ ...mInputStyle, flex: 1 }}
                        onFocus={mFocus}
                        onBlur={mBlur}
                      />
                      <button
                        type="button"
                        onClick={() => setIsCustomCategory(false)}
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: 8, padding: '0 10px', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer' }}
                        title="Choose from list"
                      >
                        Choose List
                      </button>
                    </div>
                  )}
                </Field>

                <Field label="Primary Region">
                  <select
                    value={form.regions[0] || 'Global'}
                    onChange={e => setField('regions', [e.target.value])}
                    style={{ ...mInputStyle, cursor: 'pointer' }}
                  >
                    {regions.map(r => (
                      <option key={r} value={r} style={{ background: '#141426', color: '#fff' }}>
                        {r}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              {/* Status Badges */}
              <Field label="Status Badges">
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', padding: '6px 0' }}>
                  {(['isTrusted', 'isNew', 'isFeatured'] as const).map(key => {
                    const label = key === 'isTrusted' ? '🛡️ Trusted' : key === 'isNew' ? '🆕 New' : '⭐ Featured';
                    const color = TAG_COLORS[key];
                    const isChecked = Boolean(form[key]);

                    return (
                      <label
                        key={key}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer',
                          fontSize: 13, color: isChecked ? color : 'var(--text-secondary)',
                          fontWeight: isChecked ? 700 : 500, userSelect: 'none',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={e => setField(key, e.target.checked)}
                          style={{ accentColor: color, width: 16, height: 16, cursor: 'pointer' }}
                        />
                        {label}
                      </label>
                    );
                  })}
                </div>
              </Field>

              {formError && (
                <div style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: 8, padding: '10px 14px', color: '#f87171', fontSize: 13, fontWeight: 600 }}>
                  {formError}
                </div>
              )}

              {/* Submit / Cancel Buttons */}
              <div style={{ display: 'flex', gap: 10, paddingTop: 6 }}>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 1, background: submitting ? 'rgba(139,92,246,0.5)' : 'var(--gradient)',
                    border: 'none', borderRadius: 10, padding: '12px', color: '#fff', fontSize: 14,
                    fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 18px rgba(124,58,237,0.35)', transition: 'all 0.15s',
                  }}
                >
                  {submitting ? 'Saving Live...' : modalMode === 'add' ? (approvingRequestId ? 'Approve & Publish Live' : '+ Add Site') : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{ padding: '12px 20px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global CSS for spinner and animations */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

/* ════════════════ SITES TABLE COMPONENT ════════════════ */
function SitesTable({
  sites,
  categories,
  selectedCategory,
  searchActive,
  apiReorder,
  onEdit,
  onDelete,
  onToggleTag,
  deletingId,
  onReorder,
  showToast,
  onCopy,
  copiedId,
}: {
  sites: Site[];
  categories: string[];
  selectedCategory: string;
  searchActive: boolean;
  apiReorder: string;
  onEdit: (s: Site) => void;
  onDelete: (id: string, name: string) => void;
  onToggleTag: (site: Site, tagKey: 'isTrusted' | 'isNew' | 'isFeatured') => void;
  deletingId: string | null;
  onReorder: () => void;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  onCopy: (text: string, id: string) => void;
  copiedId: string | null;
}) {
  if (sites.length === 0) {
    return (
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '50px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
        <p style={{ fontWeight: 600 }}>No sites match your filter.</p>
        <p style={{ fontSize: 12, marginTop: 4 }}>Try clearing the search or choosing a different category.</p>
      </div>
    );
  }

  if (searchActive) {
    return (
      <FlatSitesTable
        sites={sites}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleTag={onToggleTag}
        deletingId={deletingId}
        onCopy={onCopy}
        copiedId={copiedId}
      />
    );
  }

  const activeCategories = selectedCategory !== 'all'
    ? categories.filter(c => c.toLowerCase() === selectedCategory.toLowerCase())
    : categories;

  const groups = activeCategories
    .map(category => ({
      category,
      items: sites.filter(s => s.category?.toLowerCase() === category?.toLowerCase()).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    }))
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
          onToggleTag={onToggleTag}
          deletingId={deletingId}
          onReorder={onReorder}
          showToast={showToast}
          onCopy={onCopy}
          copiedId={copiedId}
        />
      ))}
    </div>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: 'left', padding: '11px 16px', fontSize: 11, fontWeight: 700,
  color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap',
};

/* ── FlatSitesTable (Used when search is active) ── */
function FlatSitesTable({
  sites,
  onEdit,
  onDelete,
  onToggleTag,
  deletingId,
  onCopy,
  copiedId,
}: {
  sites: Site[];
  onEdit: (s: Site) => void;
  onDelete: (id: string, name: string) => void;
  onToggleTag: (site: Site, tagKey: 'isTrusted' | 'isNew' | 'isFeatured') => void;
  deletingId: string | null;
  onCopy: (text: string, id: string) => void;
  copiedId: string | null;
}) {
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
              {['Site', 'Category', 'Region', 'Quick Badges', 'Actions'].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sites.map((site, i) => (
              <tr
                key={site.id}
                style={{
                  borderBottom: i < sites.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
              >
                {/* Site logo & info */}
                <td style={{ padding: '12px 16px', minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={site.faviconUrl || `https://www.google.com/s2/favicons?domain=${site.domain}&sz=64`}
                        alt={site.name}
                        width={18}
                        height={18}
                        style={{ objectFit: 'contain' }}
                        onError={e => {
                          const fallback = `https://www.google.com/s2/favicons?domain=${site.domain}&sz=64`;
                          if ((e.currentTarget as HTMLImageElement).src !== fallback) {
                            (e.currentTarget as HTMLImageElement).src = fallback;
                          } else {
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                          }
                        }}
                      />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>{site.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 1 }}>
                        <a
                          href={site.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: 11, color: 'var(--text-muted)', textDecoration: 'none', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-accent)')}
                          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                        >
                          {site.domain} ↗
                        </a>
                        <button
                          onClick={() => onCopy(site.url, site.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 10, padding: 0 }}
                          title="Copy URL"
                        >
                          {copiedId === site.id ? '✓' : '📋'}
                        </button>
                      </div>
                    </div>
                  </div>
                </td>

                <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                  {site.category}
                </td>

                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {(site.regions || []).slice(0, 2).map(r => (
                      <span key={r} style={{ fontSize: 10, color: 'var(--text-muted)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 4, padding: '1px 6px' }}>
                        {r}
                      </span>
                    ))}
                    {(site.regions || []).length > 2 && (
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>+{(site.regions || []).length - 2}</span>
                    )}
                  </div>
                </td>

                {/* Quick Badges */}
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => onToggleTag(site, 'isTrusted')}
                      title="Click to toggle Trusted badge"
                      style={{
                        padding: '3px 8px', borderRadius: 5, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                        background: site.isTrusted ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${site.isTrusted ? '#10b981' : 'var(--border)'}`,
                        color: site.isTrusted ? '#34d399' : 'var(--text-muted)',
                        transition: 'all 0.15s',
                      }}
                    >
                      🛡️ {site.isTrusted ? 'Trusted' : '+ Trust'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleTag(site, 'isNew')}
                      title="Click to toggle New badge"
                      style={{
                        padding: '3px 8px', borderRadius: 5, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                        background: site.isNew ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${site.isNew ? '#3b82f6' : 'var(--border)'}`,
                        color: site.isNew ? '#60a5fa' : 'var(--text-muted)',
                        transition: 'all 0.15s',
                      }}
                    >
                      🆕 {site.isNew ? 'New' : '+ New'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleTag(site, 'isFeatured')}
                      title="Click to toggle Featured badge"
                      style={{
                        padding: '3px 8px', borderRadius: 5, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                        background: site.isFeatured ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${site.isFeatured ? '#f59e0b' : 'var(--border)'}`,
                        color: site.isFeatured ? '#fbbf24' : 'var(--text-muted)',
                        transition: 'all 0.15s',
                      }}
                    >
                      ⭐ {site.isFeatured ? 'Featured' : '+ Star'}
                    </button>
                  </div>
                </td>

                {/* Actions */}
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                  <a
                    href={`/site/${slugify(site.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 7,
                      padding: '5px 10px', color: 'var(--text-secondary)', fontSize: 12, textDecoration: 'none',
                      marginRight: 6, display: 'inline-flex', alignItems: 'center', gap: 4, transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--text-accent)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
                  >
                    🌐 Detail
                  </a>
                  <button
                    onClick={() => onEdit(site)}
                    style={{
                      background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 7,
                      padding: '5px 10px', color: 'var(--text-accent)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      marginRight: 6, transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.2)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.1)'}
                  >
                    ✎ Edit
                  </button>
                  <button
                    onClick={() => onDelete(site.id, site.name)}
                    disabled={deletingId === site.id}
                    style={{
                      background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 7,
                      padding: '5px 10px', color: 'var(--red)', fontSize: 12, cursor: deletingId === site.id ? 'not-allowed' : 'pointer',
                      opacity: deletingId === site.id ? 0.5 : 1, transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(244,63,94,0.18)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(244,63,94,0.08)'}
                  >
                    {deletingId === site.id ? '...' : '✕ Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── CategoryRankTable: Single Category Reorderable Table ── */
function CategoryRankTable({
  category,
  items,
  apiReorder,
  onEdit,
  onDelete,
  onToggleTag,
  deletingId,
  onReorder,
  showToast,
  onCopy,
  copiedId,
}: {
  category: string;
  items: Site[];
  apiReorder: string;
  onEdit: (s: Site) => void;
  onDelete: (id: string, name: string) => void;
  onToggleTag: (site: Site, tagKey: 'isTrusted' | 'isNew' | 'isFeatured') => void;
  deletingId: string | null;
  onReorder: () => void;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  onCopy: (text: string, id: string) => void;
  copiedId: string | null;
}) {
  const [rows, setRows] = useState(items);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setRows(items);
  }, [items]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const persist = async (ordered: Site[]) => {
    setIsSaving(true);
    try {
      const res = await fetch(apiReorder, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, orderedIds: ordered.map(s => s.id) }),
      });
      if (res.ok) {
        showToast(`✅ "${category}" ranking updated & live on website!`, 'success');
        onReorder();
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(`Rank update failed: ${err.error || 'Server error'}`, 'error');
        setRows(items);
      }
    } catch {
      showToast('Network error while saving rank.', 'error');
      setRows(items);
    } finally {
      setIsSaving(false);
    }
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
      {/* Category Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>{category}</span>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 5, background: 'rgba(139,92,246,0.15)', color: 'var(--text-accent)' }}>
            {rows.length} {rows.length === 1 ? 'site' : 'sites'}
          </span>
        </div>
        <span style={{ fontSize: 11, color: isSaving ? 'var(--text-accent)' : 'var(--text-muted)', fontWeight: 600 }}>
          {isSaving ? '⚡ Saving live ranking…' : 'Drag ⣿ or type #rank to reorder'}
        </span>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['', 'Rank', 'Site', 'Region', 'Quick Badges', 'Actions'].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
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
                    onToggleTag={onToggleTag}
                    deletingId={deletingId}
                    onCopy={onCopy}
                    copiedId={copiedId}
                  />
                ))}
              </SortableContext>
            </tbody>
          </table>
        </div>
      </DndContext>
    </div>
  );
}

/* ── SortableSiteRow ── */
function SortableSiteRow({
  site,
  index,
  total,
  onMove,
  onEdit,
  onDelete,
  onToggleTag,
  deletingId,
  onCopy,
  copiedId,
}: {
  site: Site;
  index: number;
  total: number;
  onMove: (from: number, to: number) => void;
  onEdit: (s: Site) => void;
  onDelete: (id: string, name: string) => void;
  onToggleTag: (site: Site, tagKey: 'isTrusted' | 'isNew' | 'isFeatured') => void;
  deletingId: string | null;
  onCopy: (text: string, id: string) => void;
  copiedId: string | null;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: site.id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? undefined,
    opacity: isDragging ? 0.4 : 1,
    borderBottom: index < total - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
    background: isDragging ? 'rgba(139,92,246,0.1)' : 'transparent',
  };

  return (
    <tr ref={setNodeRef} style={style}>
      {/* Drag handle */}
      <td style={{ padding: '11px 8px 11px 16px', width: 32 }}>
        <button
          {...attributes}
          {...listeners}
          style={{
            background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'grab',
            fontSize: 16, padding: '4px 6px', touchAction: 'none', borderRadius: 4,
          }}
          aria-label={`Drag to reorder ${site.name}`}
          title="Drag to reorder"
        >
          ⣿
        </button>
      </td>

      {/* Rank number input */}
      <td style={{ padding: '11px 12px', width: 80 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <RankInput index={index} total={total} onMove={onMove} />
        </div>
      </td>

      {/* Site info */}
      <td style={{ padding: '11px 16px', minWidth: 200 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={site.faviconUrl || `https://www.google.com/s2/favicons?domain=${site.domain}&sz=64`}
              alt={site.name}
              width={18}
              height={18}
              style={{ objectFit: 'contain' }}
              onError={e => {
                const fallback = `https://www.google.com/s2/favicons?domain=${site.domain}&sz=64`;
                if ((e.currentTarget as HTMLImageElement).src !== fallback) {
                  (e.currentTarget as HTMLImageElement).src = fallback;
                } else {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }
              }}
            />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>{site.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 1 }}>
              <a
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 11, color: 'var(--text-muted)', textDecoration: 'none', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-accent)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                {site.domain} ↗
              </a>
              <button
                onClick={() => onCopy(site.url, site.id)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 10, padding: 0 }}
                title="Copy URL"
              >
                {copiedId === site.id ? '✓' : '📋'}
              </button>
            </div>
          </div>
        </div>
      </td>

      {/* Region tags */}
      <td style={{ padding: '11px 16px' }}>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {(site.regions || []).slice(0, 2).map(r => (
            <span key={r} style={{ fontSize: 10, color: 'var(--text-muted)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 4, padding: '1px 6px' }}>
              {r}
            </span>
          ))}
          {(site.regions || []).length > 2 && (
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>+{(site.regions || []).length - 2}</span>
          )}
        </div>
      </td>

      {/* Quick Badges */}
      <td style={{ padding: '11px 16px' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => onToggleTag(site, 'isTrusted')}
            title="Click to toggle Trusted badge"
            style={{
              padding: '3px 8px', borderRadius: 5, fontSize: 11, fontWeight: 700, cursor: 'pointer',
              background: site.isTrusted ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${site.isTrusted ? '#10b981' : 'var(--border)'}`,
              color: site.isTrusted ? '#34d399' : 'var(--text-muted)',
              transition: 'all 0.15s',
            }}
          >
            🛡️ {site.isTrusted ? 'Trusted' : '+ Trust'}
          </button>
          <button
            type="button"
            onClick={() => onToggleTag(site, 'isNew')}
            title="Click to toggle New badge"
            style={{
              padding: '3px 8px', borderRadius: 5, fontSize: 11, fontWeight: 700, cursor: 'pointer',
              background: site.isNew ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${site.isNew ? '#3b82f6' : 'var(--border)'}`,
              color: site.isNew ? '#60a5fa' : 'var(--text-muted)',
              transition: 'all 0.15s',
            }}
          >
            🆕 {site.isNew ? 'New' : '+ New'}
          </button>
          <button
            type="button"
            onClick={() => onToggleTag(site, 'isFeatured')}
            title="Click to toggle Featured badge"
            style={{
              padding: '3px 8px', borderRadius: 5, fontSize: 11, fontWeight: 700, cursor: 'pointer',
              background: site.isFeatured ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${site.isFeatured ? '#f59e0b' : 'var(--border)'}`,
              color: site.isFeatured ? '#fbbf24' : 'var(--text-muted)',
              transition: 'all 0.15s',
            }}
          >
            ⭐ {site.isFeatured ? 'Featured' : '+ Star'}
          </button>
        </div>
      </td>

      {/* Actions */}
      <td style={{ padding: '11px 16px', whiteSpace: 'nowrap' }}>
        <a
          href={`/site/${slugify(site.name)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 7,
            padding: '5px 10px', color: 'var(--text-secondary)', fontSize: 12, textDecoration: 'none',
            marginRight: 6, display: 'inline-flex', alignItems: 'center', gap: 4, transition: 'all 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--text-accent)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
        >
          🌐 Detail
        </a>
        <button
          onClick={() => onEdit(site)}
          style={{
            background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 7,
            padding: '5px 10px', color: 'var(--text-accent)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            marginRight: 6, transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.2)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.1)'}
        >
          ✎ Edit
        </button>
        <button
          onClick={() => onDelete(site.id, site.name)}
          disabled={deletingId === site.id}
          style={{
            background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 7,
            padding: '5px 10px', color: 'var(--red)', fontSize: 12, cursor: deletingId === site.id ? 'not-allowed' : 'pointer',
            opacity: deletingId === site.id ? 0.5 : 1, transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(244,63,94,0.18)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(244,63,94,0.08)'}
        >
          {deletingId === site.id ? '...' : '✕'}
        </button>
      </td>
    </tr>
  );
}

/* ── RankInput ── */
function RankInput({
  index,
  total,
  onMove,
}: {
  index: number;
  total: number;
  onMove: (from: number, to: number) => void;
}) {
  const [value, setValue] = useState(String(index + 1));

  useEffect(() => {
    setValue(String(index + 1));
  }, [index]);

  const commit = () => {
    const n = parseInt(value, 10);
    if (Number.isFinite(n)) {
      const clamped = Math.min(Math.max(n, 1), total);
      if (clamped !== index + 1) {
        onMove(index, clamped - 1);
        return;
      }
    }
    setValue(String(index + 1));
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>#</span>
      <input
        type="number"
        min={1}
        max={total}
        value={value}
        onChange={e => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commit();
          }
        }}
        aria-label="Move to rank position"
        title="Type a rank and press Enter to move"
        style={{
          width: 44, background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 6, padding: '3px 4px', color: 'var(--text-primary)', fontSize: 12,
          textAlign: 'center', outline: 'none', fontWeight: 700,
        }}
        onFocus={e => (e.currentTarget.style.borderColor = 'var(--text-accent)')}
      />
    </div>
  );
}

/* ── Form Field Wrapper ── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const mInputStyle: React.CSSProperties = {
  width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)',
  borderRadius: 9, padding: '9px 12px', color: 'var(--text-primary)', fontSize: 13,
  outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
};

const mFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
  e.currentTarget.style.borderColor = 'var(--text-accent)';
  e.currentTarget.style.boxShadow = '0 0 0 3px var(--glow)';
};

const mBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
  e.currentTarget.style.borderColor = 'var(--border)';
  e.currentTarget.style.boxShadow = 'none';
};
