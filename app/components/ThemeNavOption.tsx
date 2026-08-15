'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { THEMES, applyThemeGlobal, type ThemeOption } from '@/lib/theme';

export default function ThemeNavOption() {
  const [activeTheme, setActiveTheme] = useState<string>('cosmic');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragProgress, setDragProgress] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Initialize theme from document or localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('allSiteHub_theme');
      const initial = saved || document.documentElement.getAttribute('data-theme') || 'cosmic';
      if (THEMES.some(t => t.id === initial)) {
        setActiveTheme(initial);
        applyThemeGlobal(initial);
        const idx = THEMES.findIndex(t => t.id === initial);
        if (idx !== -1) setDragProgress(idx / (THEMES.length - 1));
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
        const idx = THEMES.findIndex(t => t.id === detail);
        if (idx !== -1) setDragProgress(idx / (THEMES.length - 1));
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

  const selectTheme = useCallback((theme: ThemeOption, idx: number) => {
    setDragProgress(idx / (THEMES.length - 1));
    applyTheme(theme.id);
  }, [applyTheme]);

  const updateFromPosition = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const rawRatio = (clientX - rect.left) / rect.width;
      const clampedRatio = Math.max(0, Math.min(1, rawRatio));
      setDragProgress(clampedRatio);

      const targetIdx = Math.round(clampedRatio * (THEMES.length - 1));
      const targetTheme = THEMES[targetIdx];
      if (targetTheme && targetTheme.id !== activeTheme) {
        applyTheme(targetTheme.id);
      }
    },
    [activeTheme, applyTheme]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsDragging(true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    updateFromPosition(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.stopPropagation();
    updateFromPosition(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.stopPropagation();
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    const activeIdx = THEMES.findIndex(t => t.id === activeTheme);
    if (activeIdx !== -1) {
      setDragProgress(activeIdx / (THEMES.length - 1));
    }
  };

  const currentThemeObj = THEMES.find(t => t.id === activeTheme) || THEMES[0];
  const activeIdx = THEMES.findIndex(t => t.id === activeTheme);
  const visualProgress = isDragging ? dragProgress : (activeIdx !== -1 ? activeIdx / (THEMES.length - 1) : 0);

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      {/* Top Navbar Option Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(o => !o);
        }}
        aria-expanded={isOpen}
        aria-label={`Theme: ${currentThemeObj.name}. Click to change theme.`}
        className="nav-theme-btn flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all duration-200 select-none shadow-sm cursor-pointer active:scale-95 touch-manipulation"
        style={{
          color: currentThemeObj.color,
          background: `${currentThemeObj.color}15`,
          borderColor: isOpen ? currentThemeObj.color : `${currentThemeObj.color}40`,
          boxShadow: isOpen ? `0 0 16px ${currentThemeObj.color}40` : `0 0 8px ${currentThemeObj.color}18`,
        }}
      >
        <span
          className="w-2.5 h-2.5 rounded-full transition-colors duration-300 shadow-sm"
          style={{ background: currentThemeObj.color, boxShadow: `0 0 8px ${currentThemeObj.color}` }}
        />
        <span className="text-[13px]">{currentThemeObj.icon}</span>
        <span className="hidden sm:inline-block font-bold tracking-wide">
          {currentThemeObj.shortName}
        </span>
        <span
          className={`material-symbols-outlined text-[15px] transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        >
          expand_more
        </span>
      </button>

      {/* Floating Glass Dropdown Menu */}
      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-32px)] z-50 p-4 rounded-2xl bg-[#0c0d18]/95 backdrop-blur-2xl border border-white/15 shadow-[0_16px_50px_rgba(0,0,0,0.8),0_0_24px_rgba(255,255,255,0.06)] animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-3.5"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Select Theme
              </span>
            </div>
            <span
              className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border transition-all duration-300 flex items-center gap-1.5"
              style={{
                color: currentThemeObj.color,
                background: `${currentThemeObj.color}20`,
                borderColor: `${currentThemeObj.color}50`,
                boxShadow: `0 0 10px ${currentThemeObj.color}25`,
              }}
            >
              <span>{currentThemeObj.icon}</span>
              <span>{currentThemeObj.name}</span>
            </span>
          </div>

          {/* Interactive Drag Track */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[10.5px] text-[var(--text-muted)] font-medium">
              <span>Drag or slide</span>
              <span className="font-mono text-[var(--text-secondary)]">{Math.round(visualProgress * 100)}%</span>
            </div>

            <div
              ref={trackRef}
              role="slider"
              tabIndex={0}
              aria-label="Theme Drag Selector"
              aria-valuemin={0}
              aria-valuemax={THEMES.length - 1}
              aria-valuenow={activeIdx}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className="relative h-10 px-1 rounded-xl bg-white/[0.04] border border-white/[0.1] hover:border-white/20 flex items-center justify-between cursor-grab active:cursor-grabbing select-none transition-all duration-200 shadow-inner group touch-none"
            >
              {/* Glow fill bar */}
              <div className="absolute left-1 right-1 h-1.5 rounded-full bg-white/[0.04] overflow-hidden pointer-events-none">
                <div
                  className="h-full rounded-full transition-all duration-150"
                  style={{
                    width: `${visualProgress * 100}%`,
                    background: `linear-gradient(90deg, ${THEMES[0].color}, ${currentThemeObj.color})`,
                    boxShadow: `0 0 12px ${currentThemeObj.color}88`,
                  }}
                />
              </div>

              {/* Snap point clickable indicators */}
              <div className="absolute inset-x-3 flex justify-between items-center pointer-events-none">
                {THEMES.map((theme, idx) => {
                  const isPointActive = theme.id === activeTheme;
                  return (
                    <span
                      key={theme.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        selectTheme(theme, idx);
                      }}
                      className="w-2.5 h-2.5 rounded-full transition-all duration-200 transform pointer-events-auto cursor-pointer"
                      style={{
                        background: isPointActive ? theme.color : `${theme.color}40`,
                        boxShadow: isPointActive ? `0 0 8px ${theme.color}` : 'none',
                        transform: isPointActive ? 'scale(1.5)' : 'scale(1)',
                      }}
                    />
                  );
                })}
              </div>

              {/* Draggable Thumb Knob */}
              <div
                className="absolute top-1 bottom-1 w-8 rounded-lg flex items-center justify-center pointer-events-none shadow-lg transition-transform duration-75 ease-out"
                style={{
                  left: `calc(${visualProgress * 100}% - ${visualProgress * 32}px + 4px)`,
                  background: `linear-gradient(135deg, ${currentThemeObj.color}, ${currentThemeObj.secondaryColor})`,
                  boxShadow: `0 0 16px ${currentThemeObj.color}aa, inset 0 1px 2px rgba(255,255,255,0.5)`,
                  transform: isDragging ? 'scale(1.15)' : 'scale(1)',
                }}
              >
                <span className="text-[12px] font-black text-black select-none">
                  {currentThemeObj.icon}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Pick Theme Cards (Fully clickable via onClick & onPointerDown) */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {THEMES.map((theme, idx) => {
              const isSelected = theme.id === activeTheme;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    selectTheme(theme, idx);
                  }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    selectTheme(theme, idx);
                  }}
                  aria-label={`Select ${theme.name} theme`}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all duration-150 cursor-pointer select-none touch-manipulation active:scale-95 group ${
                    isSelected
                      ? 'bg-white/[0.12] border-white/40 shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                      : 'bg-white/[0.025] border-white/[0.06] hover:bg-white/[0.08] hover:border-white/20'
                  }`}
                  style={isSelected ? { borderColor: theme.color } : undefined}
                >
                  <span
                    className="w-4 h-4 rounded-full shrink-0 shadow-sm transition-transform group-hover:scale-110 flex items-center justify-center text-[8px]"
                    style={{
                      background: `linear-gradient(135deg, ${theme.color}, ${theme.secondaryColor})`,
                      boxShadow: isSelected ? `0 0 10px ${theme.color}` : 'none',
                    }}
                  >
                    {isSelected ? '✓' : ''}
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span
                      className={`text-[12px] font-bold truncate ${
                        isSelected ? 'text-white' : 'text-[var(--text-primary)] group-hover:text-white'
                      }`}
                    >
                      {theme.shortName}
                    </span>
                    <span className="text-[9.5px] text-[var(--text-muted)] truncate group-hover:text-[var(--text-secondary)]">
                      {theme.desc}
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
