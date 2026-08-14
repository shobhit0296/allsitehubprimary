'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLiveOnlineCounter } from '@/lib/useLiveOnlineCounter';

const NAV_LINKS = [
  ['Home', '/'],
  ['Collections', '/collections'],
  ['Methodology', '/how-we-review-websites'],
  ['About', '/about'],
  ['Request', '/request'],
  ['DMCA', '/dmca'],
] as const;

type ActivePage = string;

export default function PageHeader({ active }: { active?: ActivePage }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const onlineCount = useLiveOnlineCounter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`site-header${scrolled || menuOpen ? ' is-scrolled' : ''}`}>
      <div className="nav-inner">
        {/* ── Logo ── hard refresh on click / touch */}
        <a
          href="/"
          className="nav-logo-link shrink-0 select-none touch-manipulation cursor-pointer"
          onClick={e => {
            e.preventDefault();
            setMenuOpen(false);
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

        <span className="nav-divider hidden md:block" aria-hidden="true" />

        <nav className="hidden md:flex items-center gap-2 lg:gap-3 shrink-0">
          {NAV_LINKS.map(([label, href]) => (
            <Link
              key={label}
              href={href}
              className={`nav-pill-link${label === active ? ' is-active' : ''}`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex-1 min-w-0" />

        {/* ── Right cluster — always visible with Live Online Counter ── */}
        <div className="nav-right-cluster">
          {/* 🟢 Online counter pill */}
          <div
            className="nav-online-pill"
            title={`${onlineCount.toLocaleString()} visitors online`}
          >
            <span className="nav-online-dot" />
            <span className="nav-online-count" suppressHydrationWarning>
              {onlineCount.toLocaleString()}
            </span>
            <span className="nav-online-label">online</span>
          </div>

          <a
            href="https://discord.gg/EDH5ScSsv"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Join our Discord"
            className="nav-icon-btn hidden sm:flex hover:!border-[#5865F2]/50 hover:!bg-[#5865F2]/10"
          >
            <DiscordIcon />
          </a>

          <Link
            href="/"
            className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[var(--text-secondary)] border border-white/12 bg-white/[0.05] backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] hover:text-[var(--text-primary)] hover:border-white/22 hover:bg-white/[0.08] transition-all duration-300"
          >
            Browse sites
          </Link>

          <button
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(o => !o)}
            className={`nav-icon-btn flex md:hidden rounded-lg shrink-0${menuOpen ? ' is-open' : ''}`}
          >
            <span className="material-symbols-outlined text-[20px]">{menuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="mobile-menu md:hidden">
          <div className="flex flex-col gap-1 py-1">
            {NAV_LINKS.map(([label, href]) => (
              <Link
                key={label}
                href={href}
                className={`nav-link${label === active ? ' is-active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                <span>{label}</span>
                {label === active && (
                  <span className="material-symbols-outlined text-[16px] text-blue-400 ml-auto">
                    check
                  </span>
                )}
              </Link>
            ))}
          </div>

          <div className="mobile-menu-footer">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2 px-1">
              Community
            </div>
            <div className="grid grid-cols-2 gap-2">
              <a
                href="https://discord.gg/EDH5ScSsv"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-white text-xs font-bold transition-all active:scale-95"
                style={{
                  background: 'rgba(88,101,242,0.18)',
                  border: '1px solid rgba(88,101,242,0.35)',
                }}
              >
                💬 Discord
              </a>
              <a
                href="https://www.reddit.com/user/Ill_Committee7612/?utm_source=share&utm_medium=web3x"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-white text-xs font-bold transition-all active:scale-95"
                style={{
                  background: 'rgba(255,69,0,0.18)',
                  border: '1px solid rgba(255,69,0,0.35)',
                }}
              >
                🔴 Reddit
              </a>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}

function DiscordIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.317 4.369a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.249a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.249.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.099.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.076.076 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.029 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.055c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.211 0 2.176 1.096 2.157 2.419 0 1.333-.955 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.211 0 2.176 1.096 2.157 2.419 0 1.333-.946 2.419-2.157 2.419z" />
    </svg>
  );
}
