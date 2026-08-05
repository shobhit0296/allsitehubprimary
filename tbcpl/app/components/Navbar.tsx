'use client';

import { useState } from 'react';
import Link from 'next/link';
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

export default function Navbar({ search, onSearchChange, regions, activeRegion, onRegionChange, onlineCount }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] bg-[#0c1324]/75 backdrop-blur-xl border-b border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-16 flex items-center gap-4 lg:gap-10 h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <img
            src="/logo.png"
            alt="Allsitehub"
            width={32}
            height={32}
            className="w-8 h-8 rounded-lg object-contain bg-[#05070d] shrink-0"
          />
          <span className="font-headline text-lg font-extrabold tracking-tight text-[var(--text-primary)]">
            All<span className="bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">site</span>hub
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-6 shrink-0">
          {NAV_LINKS.map(link => (
            <Link
              key={link}
              href={link === 'Home' ? '/' : `/${link.toLowerCase()}`}
              className={`text-xs font-semibold tracking-wide uppercase transition-colors duration-200 pb-1 ${
                link === 'Home'
                  ? 'text-[var(--text-primary)] border-b-2 border-blue-500'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {link}
            </Link>
          ))}
        </nav>

        <div className="flex-1" />

        {/* Search (desktop) */}
        <div className="hidden sm:flex items-center bg-white/5 border border-white/10 rounded-full px-4 py-1.5 focus-within:border-blue-500/60 transition-all w-full max-w-[220px]">
          <span className="material-symbols-outlined text-[var(--text-secondary)] text-[18px] mr-2">search</span>
          <input
            type="text"
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search sites..."
            className="bg-transparent border-none outline-none text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] w-full"
          />
        </div>

        {/* Online + region */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-1.5">
            <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            <span className="text-[11px] font-semibold text-emerald-400 tabular-nums">{onlineCount.toLocaleString()}</span>
          </div>

          <a
            href="https://discord.gg/EDH5ScSsv"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Join our Discord"
            className="hidden sm:flex items-center justify-center w-9 h-9 rounded-full bg-white/5 border border-white/10 text-[var(--text-secondary)] hover:text-white hover:border-[#5865F2]/50 hover:bg-[#5865F2]/10 transition-all shrink-0"
          >
            <DiscordIcon />
          </a>

          <a
            href="https://www.reddit.com/user/Ill_Committee7612/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow us on Reddit"
            className="hidden sm:flex items-center justify-center w-9 h-9 rounded-full bg-white/5 border border-white/10 text-[var(--text-secondary)] hover:text-white hover:border-[#FF4500]/50 hover:bg-[#FF4500]/10 transition-all shrink-0"
          >
            <RedditIcon />
          </a>

          <div className="relative hidden sm:block">
            <select
              value={activeRegion}
              onChange={e => onRegionChange(e.target.value)}
              className="appearance-none bg-white/5 border border-white/10 rounded-full pl-3 pr-7 py-1.5 text-xs font-medium text-[var(--text-primary)] outline-none cursor-pointer hover:border-blue-500/40 transition-colors"
            >
              {regions.map(r => (
                <option key={r} value={r} style={{ background: '#0c1324' }}>
                  {REGION_FLAGS[r]} {r}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-1.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] text-[16px] pointer-events-none">expand_more</span>
          </div>

          <button
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(o => !o)}
            className="flex md:hidden items-center justify-center w-9 h-9 rounded-lg bg-white/5 border border-white/10 text-[var(--text-primary)]"
          >
            <span className="material-symbols-outlined text-[20px]">{menuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Search (mobile) */}
      <div className="sm:hidden px-4 pb-3">
        <div className="flex items-center bg-white/5 border border-white/10 rounded-full px-3.5 py-2">
          <span className="material-symbols-outlined text-[var(--text-secondary)] text-[18px] mr-2">search</span>
          <input
            type="text"
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search sites..."
            className="bg-transparent border-none outline-none text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] w-full"
          />
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <nav className="mobile-menu md:hidden">
          {NAV_LINKS.map(link => (
            <Link
              key={link}
              href={link === 'Home' ? '/' : `/${link.toLowerCase()}`}
              className="nav-link"
              onClick={() => setMenuOpen(false)}
            >
              {link}
            </Link>
          ))}
          <div className="flex items-center justify-between px-3.5 pt-2">
            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-1.5">
              <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              <span className="text-[11px] font-semibold text-emerald-400 tabular-nums">{onlineCount.toLocaleString()} online</span>
            </div>
            <select
              value={activeRegion}
              onChange={e => onRegionChange(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] outline-none"
            >
              {regions.map(r => (
                <option key={r} value={r} style={{ background: '#0c1324' }}>
                  {REGION_FLAGS[r]} {r}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 px-3.5 pt-2">
            <a
              href="https://discord.gg/EDH5ScSsv"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Join our Discord"
              className="flex items-center justify-center w-9 h-9 rounded-full bg-white/5 border border-white/10 text-[var(--text-secondary)] hover:text-white hover:border-[#5865F2]/50 hover:bg-[#5865F2]/10 transition-all"
            >
              <DiscordIcon />
            </a>
            <a
              href="https://www.reddit.com/user/Ill_Committee7612/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow us on Reddit"
              className="flex items-center justify-center w-9 h-9 rounded-full bg-white/5 border border-white/10 text-[var(--text-secondary)] hover:text-white hover:border-[#FF4500]/50 hover:bg-[#FF4500]/10 transition-all"
            >
              <RedditIcon />
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}

function DiscordIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.369a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.249a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.249.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.099.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.076.076 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.029 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.055c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.211 0 2.176 1.096 2.157 2.419 0 1.333-.955 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.211 0 2.176 1.096 2.157 2.419 0 1.333-.946 2.419-2.157 2.419z"/>
    </svg>
  );
}

function RedditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.82 14.15c.036.244.055.492.055.744 0 3.019-3.517 5.47-7.856 5.47-4.34 0-7.857-2.451-7.857-5.47 0-.252.02-.5.055-.744-.542-.246-.92-.79-.92-1.424 0-.86.698-1.558 1.558-1.558.42 0 .8.166 1.08.437 1.062-.766 2.53-1.253 4.16-1.31l.848-3.99a.32.32 0 0 1 .38-.246l2.813.598a1.076 1.076 0 1 1-.086.512l-2.518-.535-.756 3.556c1.61.065 3.056.552 4.11 1.31.28-.27.66-.437 1.08-.437.86 0 1.558.698 1.558 1.558 0 .636-.38 1.183-.926 1.428zM8.16 14.06c-.68 0-1.24-.55-1.24-1.235 0-.686.56-1.246 1.24-1.246.686 0 1.245.56 1.245 1.246 0 .686-.56 1.235-1.245 1.235zm7.68 0c-.68 0-1.24-.55-1.24-1.235 0-.686.56-1.246 1.24-1.246.686 0 1.245.56 1.245 1.246 0 .686-.56 1.235-1.245 1.235zm-6.1 2.02c-.15-.15-.15-.393 0-.543a.386.386 0 0 1 .543 0c.686.686 2.033.75 2.42.75.386 0 1.75-.064 2.42-.75a.386.386 0 0 1 .543 0c.15.15.15.393 0 .543-.75.75-2.11.943-2.963.943-.85 0-2.21-.193-2.963-.943z"/>
    </svg>
  );
}
