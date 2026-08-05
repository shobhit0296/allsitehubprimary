// pages/index.js
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Filters from '@/components/Filters';
import SiteCard from '@/components/SiteCard';

export default function Home({ initialSites, categories, regions }) {
  const [sites, setSites] = useState(initialSites);
  const [filteredSites, setFilteredSites] = useState(initialSites);
  const [search, setSearch] = useState('');

  useEffect(() => {
    applyFilters();
  }, [sites, search]);

  const applyFilters = (filters = {}) => {
    // We'll use server-side filtering via API, but for client-side we can re-fetch
    // For simplicity, we'll do client-side filtering on the initial data.
    let result = sites;
    if (filters.category && filters.category !== 'all') {
      result = result.filter(s => s.category === filters.category);
    }
    if (filters.region && filters.region !== 'all') {
      result = result.filter(s => s.region === filters.region);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        (s.description && s.description.toLowerCase().includes(q)) ||
        s.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    setFilteredSites(result);
  };

  const handleFilterChange = (filters) => {
    applyFilters(filters);
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  return (
    <Layout>
      <div className="relative max-w-xl mx-auto mb-8">
        <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-[#52525b]"></i>
        <input
          type="text"
          placeholder="Search streaming sites..."
          className="search-input w-full bg-white/5 border border-white/10 rounded-full py-3 pl-12 pr-4 text-[#f5f5f7] focus:border-[#8b5cf6]/50 focus:outline-none focus:ring-4 focus:ring-[#8b5cf6]/10"
          value={search}
          onChange={handleSearch}
        />
      </div>

      <Filters
        categories={categories}
        regions={regions}
        onFilterChange={handleFilterChange}
      />

      <div className="mt-4 text-sm text-[#a1a1aa]" id="resultsCount">
        Showing {filteredSites.length} site{filteredSites.length !== 1 ? 's' : ''}
      </div>

      <div className="grid gap-3 mt-4">
        {filteredSites.length === 0 ? (
          <div className="text-center py-16 text-[#52525b]">
            <i className="fas fa-search text-3xl block mb-3 opacity-40"></i>
            <p className="text-sm">No sites found matching your filters.</p>
          </div>
        ) : (
          filteredSites.map(site => <SiteCard key={site.id} site={site} />)
        )}
      </div>
    </Layout>
  );
}

export async function getServerSideProps() {
  const { readData } = await import('@/lib/data');
  const data = await readData();
  // Sort: featured first, then trusted, then by name
  const sorted = data.sites.sort((a, b) => {
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    if (a.isTrusted && !b.isTrusted) return -1;
    if (!a.isTrusted && b.isTrusted) return 1;
    return a.name.localeCompare(b.name);
  });
  return {
    props: {
      initialSites: sorted,
      categories: data.categories,
      regions: data.regions,
    },
  };
}