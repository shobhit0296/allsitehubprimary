'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { REGION_FLAGS } from '@/lib/data';

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
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const startY = window.scrollY;
    const handler = () => {
      if (Math.abs(window.scrollY - startY) > 80) setMenuOpen(false);
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, [menuOpen]);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 50);
  }, [searchOpen]);

  return (
    <header ref={menuRef} className={`site-header${scrolled || menuOpen ? ' is-scrolled' : ''}`}>
      <div className="nav-inner">

        {/* ── Logo ── hard refresh on click / touch */}
        <a
          href="/"
          className="nav-logo-link shrink-0 select-none touch-manipulation cursor-pointer"
          onClick={e => {
            e.preventDefault();
            setMenuOpen(false);
            setSearchOpen(false);
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
          <img src="/icon.svg" alt="AllSiteHub logo" width={28} height={28} className="nav-logo-img" />
          <span className="nav-logo-text">All<span className="nav-logo-accent">Site</span>Hub</span>
        </a>

        {/* ── Desktop divider + nav links ── */}
        <span className="nav-divider hidden md:block" aria-hidden="true" />
        <nav className="hidden md:flex items-center gap-1 shrink-0" aria-label="Main navigation">
          {NAV_LINKS.map(link => {
            const href = link === 'Home' ? '/' : `/${link.toLowerCase()}`;
            const isActive = link === 'Home' ? pathname === '/' : pathname === href;
            return (
              <Link key={link} href={href} className={`nav-pill-link${isActive ? ' is-active' : ''}`}>
                {link}
              </Link>
            );
          })}
        </nav>

        {/* ── Flexible spacer ── */}
        <div className="flex-1 min-w-0" />

        {/* ── Desktop search bar (lg+) ── */}
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
            <button type="button" aria-label="Clear search" onClick={() => onSearchChange('')} className="nav-search-clear">
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        {/* ── Right actions cluster ── always visible, compact on mobile ── */}
        <div className="nav-right-cluster">

          {/* 🟢 Online counter pill — always shown */}
          <div className="nav-online-pill" title={`${onlineCount.toLocaleString()} visitors online`}>
            <span className="nav-online-dot" />
            <span className="nav-online-count" suppressHydrationWarning>
              {onlineCount.toLocaleString()}
            </span>
            <span className="nav-online-label">online</span>
          </div>

          {/* 🌍 Region selector — always shown */}
          <div className="nav-region-wrap">
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

          {/* 🔍 Search toggle (hidden on lg+) */}
          <button
            type="button"
            aria-label={searchOpen ? 'Close search' : 'Open search'}
            aria-expanded={searchOpen}
            onClick={() => { setSearchOpen(o => !o); setMenuOpen(false); }}
            className={`nav-icon-btn lg:hidden${searchOpen ? ' is-open' : ''}`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              {searchOpen ? 'close' : 'search'}
            </span>
          </button>

          {/* ☰ Hamburger (hidden on md+) */}
          <button
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => { setMenuOpen(o => !o); setSearchOpen(false); }}
            className={`nav-icon-btn md:hidden${menuOpen ? ' is-open' : ''}`}
          >
            <HamburgerIcon open={menuOpen} />
          </button>
        </div>
      </div>

      {/* ── Collapsible search (mobile/tablet) ── */}
      <div className={`nav-mobile-search-wrap${searchOpen ? ' is-open' : ''}`} aria-hidden={!searchOpen}>
        <div className="nav-mobile-search-inner">
          <div className="nav-search-bar w-full">
            <span className="material-symbols-outlined nav-search-icon">search</span>
            <input
              ref={searchInputRef}
              type="search"
              value={search}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="Search across all categories..."
              className="nav-search-input"
            />
            {search && (
              <button type="button" aria-label="Clear" onClick={() => onSearchChange('')} className="nav-search-clear">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile dropdown menu ── */}
      <nav
        className={`mobile-menu md:hidden${menuOpen ? ' is-open' : ''}`}
        aria-label="Mobile navigation"
        aria-hidden={!menuOpen}
      >
        <div className="flex flex-col gap-1 py-1">
          {NAV_LINKS.map(link => {
            const href = link === 'Home' ? '/' : `/${link.toLowerCase()}`;
            const isActive = link === 'Home' ? pathname === '/' : pathname === href;
            return (
              <Link
                key={link}
                href={href}
                className={`nav-link${isActive ? ' is-active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                <span>{link}</span>
                {isActive && (
                  <span className="material-symbols-outlined text-[16px] text-blue-400 ml-auto">check</span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Community links in mobile menu */}
        <div className="mobile-menu-footer">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">
            Community
          </div>
          <div className="grid grid-cols-2 gap-2">
            <a
              href="https://discord.gg/EDH5ScSsv"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-white text-xs font-bold transition-all active:scale-95"
              style={{ background: 'rgba(88,101,242,0.18)', border: '1px solid rgba(88,101,242,0.35)' }}
            >
              💬 Discord
            </a>
            <a
              href="https://www.reddit.com/user/Ill_Committee7612/?utm_source=share&utm_medium=web3x"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-white text-xs font-bold transition-all active:scale-95"
              style={{ background: 'rgba(255,69,0,0.18)', border: '1px solid rgba(255,69,0,0.35)' }}
            >
              🔴 Reddit
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
}

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <line
        x1="2" y1={open ? '9' : '4'} x2="16" y2={open ? '9' : '4'}
        style={{ transform: open ? 'rotate(45deg)' : 'none', transformOrigin: '9px 9px', transition: 'transform 0.25s, y 0.25s' }}
      />
      <line
        x1="2" y1="9" x2="16" y2="9"
        style={{ opacity: open ? 0 : 1, transition: 'opacity 0.2s' }}
      />
      <line
        x1="2" y1={open ? '9' : '14'} x2="16" y2={open ? '9' : '14'}
        style={{ transform: open ? 'rotate(-45deg)' : 'none', transformOrigin: '9px 9px', transition: 'transform 0.25s, y 0.25s' }}
      />
    </svg>
  );
}
