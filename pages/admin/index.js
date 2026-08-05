// pages/admin/index.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import AdminSiteTable from '@/components/AdminSiteTable';

export default function AdminDashboard({ initialData }) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [sites, setSites] = useState(initialData.sites);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '', url: '', description: '', category: initialData.categories[0] || '', region: initialData.regions[0] || '',
    isTrusted: false, isNew: false, isFeatured: false,
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check authentication
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const auth = sessionStorage.getItem('tbcpl_auth');
      if (!auth && !router.query.auth) {
        router.push('/admin/login');
      } else if (router.query.auth) {
        sessionStorage.setItem('tbcpl_auth', 'true');
      }
    }
  }, [router]);

  const refreshData = async () => {
    try {
      const [sitesRes] = await Promise.all([
        fetch('/api/sites'),
      ]);
      const updatedSites = await sitesRes.json();
      setSites(updatedSites);
    } catch (err) {
      console.error('Failed to refresh:', err);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleAddSite = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formData.name.trim() || !formData.url.trim()) {
      setFormError('Name and URL are required.');
      return;
    }
    setIsSubmitting(true);
    try {
      const tags = [];
      if (formData.isTrusted) tags.push('trusted');
      if (formData.isNew) tags.push('new');
      if (formData.isFeatured) tags.push('featured');

      const res = await fetch('/api/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, tags }),
      });
      if (!res.ok) {
        const err = await res.json();
        setFormError(err.error || 'Failed to add site.');
        return;
      }
      setFormData({ name: '', url: '', description: '', category: data.categories[0] || '', region: data.regions[0] || '', isTrusted: false, isNew: false, isFeatured: false });
      setIsAddOpen(false);
      await refreshData();
    } catch (err) {
      setFormError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('tbcpl_auth');
    router.push('/admin/login');
  };

  return (
    <AdminLayout title="Dashboard">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-sm text-[#52525b]">Manage streaming sites</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#a1a1aa] flex items-center gap-2">
            <span className="online-dot"></span>
            {data.onlineCount || 12} online
          </span>
          <button
            onClick={() => router.push('/')}
            className="text-sm text-[#52525b] hover:text-white transition"
          >
            View Site
          </button>
          <button
            onClick={handleLogout}
            className="text-sm text-[#52525b] hover:text-white transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="stat-card bg-white/5 border border-white/10 rounded-xl p-4 sm:p-5">
          <p className="text-[#52525b] text-xs uppercase tracking-wider">Total Sites</p>
          <p className="text-2xl font-bold mt-1">{sites.length}</p>
        </div>
        <div className="stat-card bg-white/5 border border-white/10 rounded-xl p-4 sm:p-5">
          <p className="text-[#52525b] text-xs uppercase tracking-wider">Trusted</p>
          <p className="text-2xl font-bold mt-1 text-[#10b981]">{sites.filter(s => s.isTrusted).length}</p>
        </div>
        <div className="stat-card bg-white/5 border border-white/10 rounded-xl p-4 sm:p-5">
          <p className="text-[#52525b] text-xs uppercase tracking-wider">New</p>
          <p className="text-2xl font-bold mt-1 text-[#3b82f6]">{sites.filter(s => s.isNew).length}</p>
        </div>
        <div className="stat-card bg-white/5 border border-white/10 rounded-xl p-4 sm:p-5">
          <p className="text-[#52525b] text-xs uppercase tracking-wider">Featured</p>
          <p className="text-2xl font-bold mt-1 text-[#f59e0b]">{sites.filter(s => s.isFeatured).length}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button className="btn-primary flex items-center gap-2" onClick={() => setIsAddOpen(true)}>
          <i className="fas fa-plus"></i> Add Site
        </button>
        <button className="btn-secondary flex items-center gap-2" onClick={refreshData}>
          <i className="fas fa-sync"></i> Refresh
        </button>
      </div>

      {/* Table */}
      <AdminSiteTable sites={sites} onUpdate={refreshData} />

      {/* Add Site Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={(e) => { if (e.target === e.currentTarget) setIsAddOpen(false); }}>
          <div className="bg-[#15151c] border border-white/10 rounded-2xl p-5 sm:p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Add New Site</h2>
              <button onClick={() => setIsAddOpen(false)} className="text-[#52525b] hover:text-white transition text-xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleAddSite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#a1a1aa] mb-1">Name *</label>
                <input type="text" name="name" className="admin-input w-full" required value={formData.name} onChange={handleFormChange} placeholder="e.g. Netflix" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#a1a1aa] mb-1">URL *</label>
                <input type="url" name="url" className="admin-input w-full" required value={formData.url} onChange={handleFormChange} placeholder="https://example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#a1a1aa] mb-1">Description</label>
                <input type="text" name="description" className="admin-input w-full" value={formData.description} onChange={handleFormChange} placeholder="Brief description..." />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#a1a1aa] mb-1">Category</label>
                  <select name="category" className="admin-input w-full" value={formData.category} onChange={handleFormChange}>
                    {data.categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#a1a1aa] mb-1">Region</label>
                  <select name="region" className="admin-input w-full" value={formData.region} onChange={handleFormChange}>
                    {data.regions.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" name="isTrusted" checked={formData.isTrusted} onChange={handleFormChange} className="rounded" />
                  <span className="text-[#10b981]">Trusted</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" name="isNew" checked={formData.isNew} onChange={handleFormChange} className="rounded" />
                  <span className="text-[#3b82f6]">New</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleFormChange} className="rounded" />
                  <span className="text-[#f59e0b]">Featured</span>
                </label>
              </div>
              {formError && <p className="text-sm text-red-400">{formError}</p>}
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1" disabled={isSubmitting}>
                  {isSubmitting ? 'Adding...' : 'Add Site'}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setIsAddOpen(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export async function getServerSideProps() {
  const { readData } = await import('@/lib/data');
  const data = await readData();
  return {
    props: {
      initialData: data,
    },
  };
}