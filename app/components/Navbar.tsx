'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { REGION_FLAGS } from '@/lib/data';
import ThemeNavOption from './ThemeNavOption';

interface NavbarProps {
  search: string;
  onSearchChange: (v: string) => void;
  regions: string[];
  activeRegion: string;
  onRegionChange: (r: string) => void;
  onlineCount: number;
}

const NAV_LINKS = ['Home', 'About', 'Request', 'DMCA'] as const;

export default function Navbar({
  search,
  onSearchChange,
  regions,
  activeRegion,
  onRegionChange,
  onlineCount,
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
      <div className="nav-inner">
        {/* ── Logo ── hard refresh on click / touch */}
        <a
          href="/"
          className="nav-logo-link shrink-0 select-none touch-manipulation cursor-pointer"
          onClick={e => {
            e.preventDefault();
            if (typeof window !== 'undefined') {
              if (window.location.pathname === '/') {
                window.location.reload();
              } else {
                window.location.href = '/';
              }
            }
          }}
          aria-label="AllSiteHub — refresh and go to homepage"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icon.svg"
            alt="AllSiteHub logo"
            width={28}
            height={28}
            className="nav-logo-img"
          />
          <span className="nav-logo-text">
            All<span className="nav-logo-accent">Site</span>Hub
          </span>
        </a>

        {/* ── Desktop divider + nav links ── */}
        <span className="nav-divider hidden md:block" aria-hidden="true" />
        <nav className="hidden md:flex items-center gap-1 shrink-0" aria-label="Main navigation">
          {NAV_LINKS.map(link => {
            const href = link === 'Home' ? '/' : `/${link.toLowerCase()}`;
            const isActive = link === 'Home' ? pathname === '/' : pathname === href;
            return (
              <Link
                key={link}
                href={href}
                className={`nav-pill-link${isActive ? ' is-active' : ''}`}
              >
                {link}
              </Link>
            );
          })}
        </nav>

        {/* ── Flexible spacer ── */}
        <div className="flex-1 min-w-0" />

        {/* ── Desktop search bar (lg+ only, hidden on mobile) ── */}
        <div className="hidden lg:flex nav-search-bar">
          <span className="material-symbols-outlined nav-search-icon">search</span>
          <input
            type="search"
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search sites..."
            className="nav-search-input"
          />
          {search && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => onSearchChange('')}
              className="nav-search-clear"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        {/* ── Right actions cluster — Live Views counter, Theme Picker & Region Selector ── */}
        <div className="nav-right-cluster">
          {/* 🟢 Live Views Online Counter */}
          <div
            className="nav-online-pill"
            title={`${onlineCount.toLocaleString()} live active viewers`}
          >
            <span className="nav-online-dot" />
            <span className="nav-online-count" suppressHydrationWarning>
              {onlineCount.toLocaleString()}
            </span>
            <span className="nav-online-label">online</span>
          </div>

          {/* 🎨 Theme Option in Top Navigation */}
          <ThemeNavOption />

          {/* 🌍 Region selector — hidden on phone view, visible on sm+ screens */}
          <div className="nav-region-wrap hidden sm:block">
            <select
              value={activeRegion}
              onChange={e => onRegionChange(e.target.value)}
              aria-label="Select region"
              className="nav-region-select"
            >
              {regions.map(r => (
                <option key={r} value={r} style={{ background: '#0c1020' }}>
                  {REGION_FLAGS[r]} {r}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined nav-region-chevron">expand_more</span>
          </div>
        </div>
      </div>
    </header>
  );
}
