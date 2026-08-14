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
        {/* ── Logo ── */}
        <Link
          href="/"
          className="nav-logo-link"
          onClick={() => {
            setMenuOpen(false);
            setSearchOpen(false);
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icon.svg"
            alt="AllSiteHub logo"
            width={30}
            height={30}
            className="nav-logo-img"
          />
          <span className="nav-logo-text">
            All<span className="nav-logo-accent">Site</span>Hub
          </span>
        </Link>

        {/* ── Divider (Desktop) ── */}
        <span className="nav-divider hidden md:block" aria-hidden="true" />

        {/* ── Desktop nav links ── */}
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

        {/* ── Spacer ── */}
        <div className="flex-1 min-w-0" />

        {/* ── Search — desktop lg+ ── */}
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

        {/* ── Right cluster (Visible on ALL devices) ── */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Active Online Badge (Refined on mobile & desktop) */}
          <div
            className="nav-online-badge touch-manipulation"
            title={`${onlineCount.toLocaleString()} active online visitors`}
          >
            <span className="pulse-dot nav-online-dot" />
            <span className="nav-online-text" suppressHydrationWarning>
              <span className="font-semibold">{onlineCount.toLocaleString()}</span>
              <span className="hidden sm:inline font-normal opacity-85"> online</span>
            </span>
          </div>

          {/* Region selector (Refined on mobile & desktop) */}
          <div className="relative touch-manipulation">
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

          {/* Mobile search toggle */}
          <button
            type="button"
            aria-label={searchOpen ? 'Close search' : 'Search'}
            aria-expanded={searchOpen}
            onClick={() => {
              setSearchOpen(o => !o);
              setMenuOpen(false);
            }}
            className={`nav-icon-btn flex lg:hidden touch-manipulation${searchOpen ? ' is-open' : ''}`}
          >
            <span className="material-symbols-outlined text-[19px] sm:text-[20px]">
              {searchOpen ? 'close' : 'search'}
            </span>
          </button>

          {/* Hamburger Menu Toggle */}
          <button
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => {
              setMenuOpen(o => !o);
              setSearchOpen(false);
            }}
            className={`nav-icon-btn flex md:hidden touch-manipulation${menuOpen ? ' is-open' : ''}`}
          >
            <HamburgerIcon open={menuOpen} />
          </button>
        </div>
      </div>

      {/* ── Collapsible mobile search ── */}
      <div
        className={`nav-mobile-search-wrap${searchOpen ? ' is-open' : ''}`}
        aria-hidden={!searchOpen}
      >
        <div className="nav-mobile-search-inner">
          <div className="nav-search-bar w-full">
            <span className="material-symbols-outlined nav-search-icon">search</span>
            <input
              ref={searchInputRef}
              type="search"
              value={search}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="Search sites across all categories..."
              className="nav-search-input text-base sm:text-sm"
            />
            {search && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => onSearchChange('')}
                className="nav-search-clear"
              >
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
                  <span className="material-symbols-outlined text-[16px] text-blue-400 ml-auto">
                    check
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Mobile menu social community row */}
        <div className="mobile-menu-footer flex flex-col gap-2.5 pt-3 mt-2 border-t border-white/10">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] px-1">
            Community Channels
          </div>
          <div className="grid grid-cols-2 gap-2">
            <a
              href="https://discord.gg/EDH5ScSsv"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#5865F2]/15 hover:bg-[#5865F2]/25 border border-[#5865F2]/30 text-white text-xs font-bold transition-all"
            >
              <span>Discord</span>
            </a>
            <a
              href="https://www.reddit.com/user/Ill_Committee7612/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#FF4500]/15 hover:bg-[#FF4500]/25 border border-[#FF4500]/30 text-white text-xs font-bold transition-all"
            >
              <span>Reddit</span>
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
}

/** Animated hamburger → X icon */
function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    >
      <line
        x1="2"
        y1={open ? '9' : '4'}
        x2="16"
        y2={open ? '9' : '4'}
        style={{
          transform: open ? 'rotate(45deg)' : 'none',
          transformOrigin: '9px 9px',
          transition: 'transform 0.25s, y 0.25s',
        }}
      />
      <line
        x1="2"
        y1="9"
        x2="16"
        y2="9"
        style={{ opacity: open ? 0 : 1, transition: 'opacity 0.2s' }}
      />
      <line
        x1="2"
        y1={open ? '9' : '14'}
        x2="16"
        y2={open ? '9' : '14'}
        style={{
          transform: open ? 'rotate(-45deg)' : 'none',
          transformOrigin: '9px 9px',
          transition: 'transform 0.25s, y 0.25s',
        }}
      />
    </svg>
  );
}
