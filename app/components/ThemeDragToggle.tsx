'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { THEMES, type ThemeOption } from '@/lib/theme';

export default function ThemeDragToggle({ compact = false }: { compact?: boolean }) {
  const [activeTheme, setActiveTheme] = useState<string>('cosmic');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragProgress, setDragProgress] = useState<number>(0);
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

  // Listen for global theme changes
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

  const applyTheme = useCallback((themeId: string) => {
    setActiveTheme(themeId);
    try {
      document.documentElement.setAttribute('data-theme', themeId);
      document.body.setAttribute('data-theme', themeId);
      localStorage.setItem('allSiteHub_theme', themeId);
      window.dispatchEvent(new CustomEvent('allSiteHub_theme_changed', { detail: themeId }));
    } catch {
      // ignore
    }
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
    // Snap progress to exact discrete index
    const activeIdx = THEMES.findIndex(t => t.id === activeTheme);
    if (activeIdx !== -1) {
      setDragProgress(activeIdx / (THEMES.length - 1));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const currentIdx = THEMES.findIndex(t => t.id === activeTheme);
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIdx = (currentIdx + 1) % THEMES.length;
      selectTheme(THEMES[nextIdx], nextIdx);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIdx = (currentIdx - 1 + THEMES.length) % THEMES.length;
      selectTheme(THEMES[prevIdx], prevIdx);
    }
  };

  const currentThemeObj = THEMES.find(t => t.id === activeTheme) || THEMES[0];
  const activeIdx = THEMES.findIndex(t => t.id === activeTheme);
  const visualProgress = isDragging ? dragProgress : (activeIdx !== -1 ? activeIdx / (THEMES.length - 1) : 0);

  return (
    <div className="theme-toggle-container flex flex-col gap-2 w-full">
      {/* Header with Title & Current Theme Tag */}
      <div className="flex items-center justify-between">
        <h4 className="text-[10.5px] font-bold tracking-[0.12em] uppercase text-[var(--text-muted)] flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full transition-colors duration-300 shadow-sm"
            style={{ background: currentThemeObj.color, boxShadow: `0 0 8px ${currentThemeObj.color}` }}
          />
          Theme Preset
        </h4>
        <span
          className="text-[10.5px] font-bold px-2 py-0.5 rounded-full border transition-all duration-300 flex items-center gap-1"
          style={{
            color: currentThemeObj.color,
            background: `${currentThemeObj.color}18`,
            borderColor: `${currentThemeObj.color}40`,
          }}
        >
          <span>{currentThemeObj.icon}</span>
          <span className="truncate max-w-[90px]">{currentThemeObj.shortName}</span>
        </span>
      </div>

      {/* Interactive Drag Track */}
      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-label="Theme Drag Selector"
        aria-valuemin={0}
        aria-valuemax={THEMES.length - 1}
        aria-valuenow={activeIdx}
        aria-valuetext={currentThemeObj.name}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="theme-drag-track relative h-10 px-1 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-white/18 flex items-center justify-between cursor-grab active:cursor-grabbing select-none transition-all duration-200 shadow-inner group touch-none"
      >
        {/* Glow fill bar */}
        <div className="absolute left-1 right-1 h-1.5 rounded-full bg-white/[0.04] overflow-hidden pointer-events-none">
          <div
            className="h-full rounded-full transition-all duration-150"
            style={{
              width: `${visualProgress * 100}%`,
              background: `linear-gradient(90deg, ${THEMES[0].color}, ${currentThemeObj.color})`,
              boxShadow: `0 0 12px ${currentThemeObj.color}66`,
            }}
          />
        </div>

        {/* Clickable snap point indicators */}
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
                  transform: isPointActive ? 'scale(1.4)' : 'scale(1)',
                }}
              />
            );
          })}
        </div>

        {/* Draggable Thumb Knob */}
        <div
          className="absolute top-1 bottom-1 w-8 rounded-lg flex items-center justify-center pointer-events-none shadow-md transition-transform duration-75 ease-out"
          style={{
            left: `calc(${visualProgress * 100}% - ${visualProgress * 32}px + 4px)`,
            background: `linear-gradient(135deg, ${currentThemeObj.color}, ${currentThemeObj.secondaryColor})`,
            boxShadow: `0 0 16px ${currentThemeObj.color}88, inset 0 1px 1px rgba(255,255,255,0.4)`,
            transform: isDragging ? 'scale(1.15)' : 'scale(1)',
          }}
        >
          <span className="text-[12px] font-black text-black select-none">
            {currentThemeObj.icon}
          </span>
        </div>
      </div>

      {/* Direct Theme Quick Pick Buttons (both onPointerDown and onClick supported) */}
      <div className="grid grid-cols-6 gap-1 pt-0.5">
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
              title={theme.name}
              className={`flex flex-col items-center justify-center py-2 rounded-lg border transition-all duration-150 cursor-pointer select-none touch-manipulation active:scale-90 group/btn ${
                isSelected
                  ? 'bg-white/[0.12] border-white/30 shadow-sm scale-105'
                  : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.06] hover:border-white/15'
              }`}
              style={isSelected ? { borderColor: theme.color } : undefined}
            >
              <span
                className="w-3 h-3 rounded-full transition-transform duration-150 group-hover/btn:scale-125 shadow-sm"
                style={{
                  background: `linear-gradient(135deg, ${theme.color}, ${theme.secondaryColor})`,
                  boxShadow: isSelected ? `0 0 10px ${theme.color}` : 'none',
                }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
