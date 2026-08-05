// components/AdminSiteTable.js
import { useState } from 'react';

export default function AdminSiteTable({ sites, onUpdate }) {
  const [editingId, setEditingId] = useState(null);

  const handleDelete = async (id) => {
    if (!confirm('Delete this site?')) return;
    await fetch(`/api/sites?id=${id}`, { method: 'DELETE' });
    onUpdate();
  };

  const handleEdit = (site) => {
    // For brevity, we'll use a prompt-based edit; in production use a modal
    const name = prompt('Name:', site.name);
    if (name) {
      const url = prompt('URL:', site.url);
      if (url) {
        fetch('/api/sites', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...site, name, url }),
        }).then(() => onUpdate());
      }
    }
  };

  return (
    <div className="overflow-x-auto bg-white/5 rounded-xl border border-white/5">
      <table className="admin-table w-full">
        <thead>
          <tr>
            <th className="text-left py-3 px-4 text-[#a1a1aa] text-xs uppercase tracking-wider border-b border-white/5">Name</th>
            <th className="hidden sm:table-cell text-left py-3 px-4 text-[#a1a1aa] text-xs uppercase tracking-wider border-b border-white/5">Category</th>
            <th className="hidden md:table-cell text-left py-3 px-4 text-[#a1a1aa] text-xs uppercase tracking-wider border-b border-white/5">Region</th>
            <th className="hidden lg:table-cell text-left py-3 px-4 text-[#a1a1aa] text-xs uppercase tracking-wider border-b border-white/5">Tags</th>
            <th className="text-right py-3 px-4 text-[#a1a1aa] text-xs uppercase tracking-wider border-b border-white/5">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sites.map(site => (
            <tr key={site.id} className="border-b border-white/5 last:border-0">
              <td className="py-3 px-4">
                <div className="font-medium">{site.name}</div>
                <div className="text-xs text-[#52525b] truncate max-w-[140px] sm:max-w-[220px]">{site.url}</div>
                <div className="sm:hidden text-xs text-[#a1a1aa] mt-1">{site.category} · {site.region}</div>
              </td>
              <td className="hidden sm:table-cell py-3 px-4 text-sm text-[#a1a1aa]">{site.category}</td>
              <td className="hidden md:table-cell py-3 px-4 text-sm text-[#a1a1aa]">{site.region}</td>
              <td className="hidden lg:table-cell py-3 px-4">
                <div className="flex gap-1 flex-wrap">
                  {site.tags.map(t => (
                    <span key={t} className={`badge ${t === 'trusted' ? 'badge-trusted' : t === 'new' ? 'badge-new' : 'badge-featured'}`}>
                      {t}
                    </span>
                  ))}
                </div>
              </td>
              <td className="py-3 px-4 text-right whitespace-nowrap">
                <button aria-label={`Edit ${site.name}`} className="text-[#a1a1aa] hover:text-white transition p-2" onClick={() => handleEdit(site)}>
                  <i className="fas fa-pen"></i>
                </button>
                <button aria-label={`Delete ${site.name}`} className="text-[#a1a1aa] hover:text-red-400 transition p-2" onClick={() => handleDelete(site.id)}>
                  <i className="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {sites.length === 0 && (
        <div className="text-center py-8 text-[#52525b] text-sm">No sites added yet.</div>
      )}
    </div>
  );
}