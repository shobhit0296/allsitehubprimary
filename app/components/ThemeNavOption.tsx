'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { THEMES, type ThemeOption } from '@/lib/theme';

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
        const idx = THEMES.findIndex(t => t.id === initial);
        if (idx !== -1) setDragProgress(idx / (THEMES.length - 1));
      }
    } catch {
      // ignore
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const applyTheme = useCallback((themeId: string) => {
    setActiveTheme(themeId);
    try {
      document.documentElement.setAttribute('data-theme', themeId);
      localStorage.setItem('allSiteHub_theme', themeId);
    } catch {
      // ignore
    }
  }, []);

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
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    updateFromPosition(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updateFromPosition(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
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

  const selectTheme = (theme: ThemeOption, idx: number) => {
    setDragProgress(idx / (THEMES.length - 1));
    applyTheme(theme.id);
  };

  const currentThemeObj = THEMES.find(t => t.id === activeTheme) || THEMES[0];
  const activeIdx = THEMES.findIndex(t => t.id === activeTheme);
  const visualProgress = isDragging ? dragProgress : activeIdx / (THEMES.length - 1);

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      {/* Top Navbar Option Button */}
      <button
        type="button"
        onClick={() => setIsOpen(o => !o)}
        aria-expanded={isOpen}
        aria-label={`Theme: ${currentThemeObj.name}. Click to change.`}
        className="nav-theme-btn flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all duration-200 select-none shadow-sm active:scale-95"
        style={{
          color: currentThemeObj.color,
          background: `${currentThemeObj.color}12`,
          borderColor: isOpen ? currentThemeObj.color : `${currentThemeObj.color}35`,
          boxShadow: isOpen ? `0 0 14px ${currentThemeObj.color}35` : 'none',
        }}
      >
        <span
          className="w-2 h-2 rounded-full transition-colors duration-300 shadow-sm"
          style={{ background: currentThemeObj.color, boxShadow: `0 0 6px ${currentThemeObj.color}` }}
        />
        <span className="text-[12px]">{currentThemeObj.icon}</span>
        <span className="hidden sm:inline-block font-bold tracking-wide">
          {currentThemeObj.shortName}
        </span>
        <span
          className={`material-symbols-outlined text-[14px] transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        >
          expand_more
        </span>
      </button>

      {/* Floating Glass Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 z-50 p-3.5 rounded-2xl bg-[#0c0d18]/95 backdrop-blur-xl border border-white/12 shadow-[0_12px_40px_rgba(0,0,0,0.65),0_0_20px_rgba(255,255,255,0.05)] animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-3">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Theme Preset
              </span>
            </div>
            <span
              className="text-[10.5px] font-bold px-2 py-0.5 rounded-full border transition-all duration-300 flex items-center gap-1"
              style={{
                color: currentThemeObj.color,
                background: `${currentThemeObj.color}15`,
                borderColor: `${currentThemeObj.color}40`,
              }}
            >
              <span>{currentThemeObj.icon}</span>
              <span>{currentThemeObj.name}</span>
            </span>
          </div>

          {/* Interactive Drag Track */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] font-medium">
              <span>Drag to switch</span>
              <span>{Math.round(visualProgress * 100)}%</span>
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
              className="relative h-9 px-1 rounded-xl bg-white/[0.04] border border-white/[0.1] hover:border-white/20 flex items-center justify-between cursor-grab active:cursor-grabbing select-none transition-all duration-200 shadow-inner group touch-none"
            >
              {/* Glow fill bar */}
              <div className="absolute left-1 right-1 h-1.5 rounded-full bg-white/[0.04] overflow-hidden pointer-events-none">
                <div
                  className="h-full rounded-full transition-all duration-150"
                  style={{
                    width: `${visualProgress * 100}%`,
                    background: `linear-gradient(90deg, ${THEMES[0].color}, ${currentThemeObj.color})`,
                    boxShadow: `0 0 10px ${currentThemeObj.color}66`,
                  }}
                />
              </div>

              {/* Snap point indicators */}
              <div className="absolute inset-x-2.5 flex justify-between items-center pointer-events-none">
                {THEMES.map(theme => {
                  const isPointActive = theme.id === activeTheme;
                  return (
                    <span
                      key={theme.id}
                      className="w-2 h-2 rounded-full transition-all duration-200 transform"
                      style={{
                        background: isPointActive ? theme.color : `${theme.color}40`,
                        boxShadow: isPointActive ? `0 0 6px ${theme.color}` : 'none',
                        transform: isPointActive ? 'scale(1.4)' : 'scale(1)',
                      }}
                    />
                  );
                })}
              </div>

              {/* Draggable Thumb Knob */}
              <div
                className="absolute top-1 bottom-1 w-7 rounded-lg flex items-center justify-center pointer-events-none shadow-md transition-transform duration-75 ease-out"
                style={{
                  left: `calc(${visualProgress * 100}% - ${visualProgress * 28}px + 4px)`,
                  background: `linear-gradient(135deg, ${currentThemeObj.color}, ${currentThemeObj.secondaryColor})`,
                  boxShadow: `0 0 14px ${currentThemeObj.color}88, inset 0 1px 1px rgba(255,255,255,0.4)`,
                  transform: isDragging ? 'scale(1.12)' : 'scale(1)',
                }}
              >
                <span className="text-[11px] font-black text-black select-none">
                  {currentThemeObj.icon}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Pick Theme Cards */}
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            {THEMES.map((theme, idx) => {
              const isSelected = theme.id === activeTheme;
              return (
                <button
                  key={theme.id}
                  onClick={() => selectTheme(theme, idx)}
                  type="button"
                  aria-label={`Select ${theme.name} theme`}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-center transition-all duration-150 group ${
                    isSelected
                      ? 'bg-white/[0.1] border-white/30 shadow-md scale-100'
                      : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.06] hover:border-white/15 hover:scale-[1.02]'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full shadow-sm transition-transform group-hover:scale-110"
                    style={{
                      background: `linear-gradient(135deg, ${theme.color}, ${theme.secondaryColor})`,
                      boxShadow: isSelected ? `0 0 10px ${theme.color}` : 'none',
                    }}
                  />
                  <span
                    className={`text-[11px] font-semibold truncate max-w-full ${
                      isSelected ? 'text-white' : 'text-[var(--text-secondary)]'
                    }`}
                  >
                    {theme.shortName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
