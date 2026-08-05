// components/Filters.js
import { useState } from 'react';

export default function Filters({ categories, regions, onFilterChange }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeRegion, setActiveRegion] = useState('all');

  const handleCategoryClick = (cat) => {
    setActiveCategory(cat);
    onFilterChange({ category: cat, region: activeRegion });
  };

  const handleRegionClick = (reg) => {
    setActiveRegion(reg);
    onFilterChange({ category: activeCategory, region: reg });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 justify-center">
        <button
          className={`category-pill ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => handleCategoryClick('all')}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            className={`category-pill ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => handleCategoryClick(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5 justify-center">
        <button
          className={`region-pill ${activeRegion === 'all' ? 'active' : ''}`}
          onClick={() => handleRegionClick('all')}
        >
          🌍 All
        </button>
        {regions.map(reg => (
          <button
            key={reg}
            className={`region-pill ${activeRegion === reg ? 'active' : ''}`}
            onClick={() => handleRegionClick(reg)}
          >
            {reg}
          </button>
        ))}
      </div>
    </div>
  );
}