'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { THEMES, applyThemeGlobal, type ThemeOption } from '@/lib/theme';

export default function ThemeNavOption() {
  const [activeTheme, setActiveTheme] = useState<string>('cosmic');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize theme from document or localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('allSiteHub_theme');
      const initial = saved || document.documentElement.getAttribute('data-theme') || 'cosmic';
      if (THEMES.some(t => t.id === initial)) {
        setActiveTheme(initial);
        applyThemeGlobal(initial);
      }
    } catch {
      // ignore
    }
  }, []);

  // Listen for global theme changes from other components
  useEffect(() => {
    const handleThemeEvent = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && THEMES.some(t => t.id === detail)) {
        setActiveTheme(detail);
      }
    };
    window.addEventListener('allSiteHub_theme_changed', handleThemeEvent);
    return () => window.removeEventListener('allSiteHub_theme_changed', handleThemeEvent);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick, { passive: true });
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen]);

  const applyTheme = useCallback((themeId: string) => {
    setActiveTheme(themeId);
    applyThemeGlobal(themeId);
  }, []);

  const currentThemeObj = THEMES.find(t => t.id === activeTheme) || THEMES[0];

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      {/* ── Top Navbar Theme Button ── */}
      <button
        type="button"
        onClick={() => setIsOpen(o => !o)}
        aria-expanded={isOpen}
        aria-label={`Theme: ${currentThemeObj.name}. Click to change theme.`}
        className="nav-theme-btn inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11.5px] sm:text-xs font-semibold transition-all duration-150 select-none shadow-sm cursor-pointer active:scale-95 touch-manipulation shrink-0"
        style={{
          color: currentThemeObj.color,
          background: `${currentThemeObj.color}15`,
          borderColor: isOpen ? currentThemeObj.color : `${currentThemeObj.color}35`,
          boxShadow: isOpen ? `0 0 10px ${currentThemeObj.color}25` : 'none',
        }}
      >
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ background: currentThemeObj.color, boxShadow: `0 0 6px ${currentThemeObj.color}` }}
        />
        <span className="text-[12px] leading-none shrink-0">{currentThemeObj.icon}</span>
        <span className="hidden sm:inline-block font-bold leading-none">
          {currentThemeObj.shortName}
        </span>
        <span className="text-[10px] opacity-70 leading-none">▾</span>
      </button>

      {/* ── Simple Floating Theme Dropdown ── */}
      {isOpen && (
        <div
          onClick={e => e.stopPropagation()}
          className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-32px)] z-50 p-3 rounded-2xl bg-[#0e0e16]/95 backdrop-blur-2xl border border-white/10 shadow-[0_16px_48px_rgba(0,0,0,0.8),0_0_20px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-2.5"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-1 py-0.5 border-b border-white/[0.08] pb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8e8e9f]">
              Select Theme
            </span>
            <span
              className="text-[10.5px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1"
              style={{
                color: currentThemeObj.color,
                background: `${currentThemeObj.color}18`,
                borderColor: `${currentThemeObj.color}40`,
              }}
            >
              <span>{currentThemeObj.icon}</span>
              <span>{currentThemeObj.shortName}</span>
            </span>
          </div>

          {/* Simple Theme Selection Grid */}
          <div className="grid grid-cols-2 gap-1.5">
            {THEMES.map((theme: ThemeOption) => {
              const isSelected = theme.id === activeTheme;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => applyTheme(theme.id)}
                  aria-label={`Select ${theme.name} theme`}
                  className={`flex items-center gap-2.5 p-2 rounded-xl border text-left transition-all duration-150 cursor-pointer select-none touch-manipulation active:scale-95 ${
                    isSelected
                      ? 'bg-white/[0.12] border-white/40 shadow-[0_0_12px_rgba(255,255,255,0.08)]'
                      : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.07] hover:border-white/20'
                  }`}
                  style={isSelected ? { borderColor: theme.color } : undefined}
                >
                  <span
                    className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center text-[8px] font-black text-black"
                    style={{
                      background: `linear-gradient(135deg, ${theme.color}, ${theme.secondaryColor})`,
                      boxShadow: isSelected ? `0 0 8px ${theme.color}` : 'none',
                    }}
                  >
                    {isSelected ? '✓' : ''}
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span
                      className={`text-[12px] font-bold truncate leading-tight ${
                        isSelected ? 'text-white' : 'text-[#d4d4dc]'
                      }`}
                    >
                      {theme.shortName}
                    </span>
                    <span className="text-[9.5px] text-[#71717a] truncate leading-tight">
                      {theme.desc.split('&')[0].trim()}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

