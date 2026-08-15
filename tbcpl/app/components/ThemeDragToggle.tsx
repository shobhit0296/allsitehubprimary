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
    // Snap progress to exact discrete index
    const activeIdx = THEMES.findIndex(t => t.id === activeTheme);
    if (activeIdx !== -1) {
      setDragProgress(activeIdx / (THEMES.length - 1));
    }
  };

  const selectTheme = (theme: ThemeOption, idx: number) => {
    setDragProgress(idx / (THEMES.length - 1));
    applyTheme(theme.id);
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
  const visualProgress = isDragging ? dragProgress : activeIdx / (THEMES.length - 1);

  return (
    <div className="theme-toggle-container flex flex-col gap-2">
      {/* Header with Title & Current Theme Tag */}
      <div className="flex items-center justify-between">
        <h4 className="text-[10.5px] font-bold tracking-[0.12em] uppercase text-[var(--text-muted)] flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full transition-colors duration-300 shadow-sm"
            style={{ background: currentThemeObj.color, boxShadow: `0 0 8px ${currentThemeObj.color}` }}
          />
          Theme
        </h4>
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all duration-300 flex items-center gap-1"
          style={{
            color: currentThemeObj.color,
            background: `${currentThemeObj.color}15`,
            borderColor: `${currentThemeObj.color}35`,
          }}
        >
          <span>{currentThemeObj.icon}</span>
          <span className="truncate max-w-[80px]">{currentThemeObj.shortName}</span>
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
        className="theme-drag-track relative h-9 px-1 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-white/15 flex items-center justify-between cursor-grab active:cursor-grabbing select-none transition-all duration-200 shadow-inner group touch-none"
      >
        {/* Glow fill bar */}
        <div
          className="absolute left-1 right-1 h-1.5 rounded-full bg-white/[0.04] overflow-hidden pointer-events-none"
        >
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
          {THEMES.map((theme) => {
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

      {/* Direct Theme Quick Pick Buttons */}
      <div className="grid grid-cols-6 gap-1 pt-0.5">
        {THEMES.map((theme, idx) => {
          const isSelected = theme.id === activeTheme;
          return (
            <button
              key={theme.id}
              onClick={() => selectTheme(theme, idx)}
              type="button"
              aria-label={`Select ${theme.name} theme`}
              title={theme.name}
              className={`flex flex-col items-center justify-center py-1.5 rounded-lg border transition-all duration-150 group/btn ${
                isSelected
                  ? 'bg-white/[0.08] border-white/25 shadow-sm scale-105'
                  : 'bg-white/[0.015] border-white/[0.04] hover:bg-white/[0.05] hover:border-white/15'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full transition-transform duration-150 group-hover/btn:scale-125"
                style={{
                  background: theme.color,
                  boxShadow: isSelected ? `0 0 8px ${theme.color}` : 'none',
                }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
