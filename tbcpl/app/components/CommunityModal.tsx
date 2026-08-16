'use client';

import { useState, useEffect } from 'react';

const DISCORD_URL = 'https://discord.gg/EDH5ScSsv';
const REDDIT_URL =
  'https://www.reddit.com/user/allsitehub/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button';

const STORAGE_KEY = 'ash_community_popup_closed';

/**
 * Programmatic helper to trigger the Community Modal from anywhere
 */
export function openCommunityModal() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('open-community-modal'));
  }
}

export default function CommunityModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // 1. Auto-show popup 1.5s after mount if not previously dismissed in this session
    try {
      const isDismissed = sessionStorage.getItem(STORAGE_KEY);
      if (!isDismissed) {
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 1500);
        return () => clearTimeout(timer);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    // 2. Global event listener so buttons across the site can open the modal anytime
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-community-modal', handleOpen);
    return () => window.removeEventListener('open-community-modal', handleOpen);
  }, []);

  // Lock body scroll while modal is open to preserve backdrop position
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    try {
      sessionStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // ignore
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="community-modal-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-fade-in overscroll-none select-none backdrop-blur-2xl bg-black/75 transition-all duration-300"
      style={{
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      }}
      onClick={handleClose}
    >
      {/* ── Modal Card with Frosted Glassmorphism ── */}
      <div
        className="relative w-full max-w-[420px] mx-auto rounded-3xl p-6 sm:p-8 text-center overflow-hidden border border-white/[0.18] shadow-2xl animate-scale-in"
        style={{
          background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.85) 0%, rgba(8, 12, 28, 0.92) 100%)',
          backdropFilter: 'blur(40px) saturate(200%)',
          WebkitBackdropFilter: 'blur(40px) saturate(200%)',
          boxShadow: '0 30px 90px -15px rgba(0, 0, 0, 0.9), inset 0 1px 2px rgba(255, 255, 255, 0.25)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Ambient Glows */}
        <div
          className="absolute -top-16 -left-16 w-48 h-48 rounded-full pointer-events-none blur-3xl opacity-40"
          style={{ background: '#5865F2' }}
        />
        <div
          className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full pointer-events-none blur-3xl opacity-35"
          style={{ background: '#FF4500' }}
        />

        {/* Close Button */}
        <button
          onClick={handleClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-white/60 hover:text-white bg-white/10 hover:bg-white/20 transition-all duration-200 border border-white/15 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[19px]">close</span>
        </button>

        {/* Dual Brand Icon Badge */}
        <div className="flex items-center justify-center gap-3 mb-5">
          <div
            className="w-13 h-13 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #5865F2 0%, #4752C4 100%)',
              boxShadow: '0 8px 24px rgba(88,101,242,0.5)',
              width: 52,
              height: 52,
            }}
          >
            <DiscordIcon />
          </div>
          <div
            className="w-13 h-13 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #FF4500 0%, #D83A00 100%)',
              boxShadow: '0 8px 24px rgba(255,69,0,0.5)',
              width: 52,
              height: 52,
            }}
          >
            <RedditIcon />
          </div>
        </div>

        {/* Headline */}
        <h3
          id="community-modal-title"
          className="font-headline text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] mb-2 tracking-tight"
        >
          Join Our Community! 🚀
        </h3>

        {/* Description */}
        <p className="text-[13.5px] sm:text-[14px] text-[var(--text-secondary)] leading-[1.6] mb-6 max-w-sm mx-auto">
          Get real-time updates, request your favorite websites, and join{' '}
          <strong className="text-white font-semibold">128k+ active members</strong> on Discord and Reddit.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          {/* Discord CTA */}
          <a
            href={DISCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClose}
            className="group flex items-center justify-between px-5 py-3.5 rounded-2xl font-bold text-[14.5px] text-white shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #5865F2 0%, #404EED 100%)',
              boxShadow: '0 6px 20px rgba(88,101,242,0.45)',
            }}
          >
            <div className="flex items-center gap-3">
              <DiscordIcon />
              <span>Join Discord Server</span>
            </div>
            <span className="material-symbols-outlined text-[19px] text-white/70 group-hover:translate-x-0.5 transition-transform duration-200">
              arrow_forward
            </span>
          </a>

          {/* Reddit CTA */}
          <a
            href={REDDIT_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClose}
            className="group flex items-center justify-between px-5 py-3.5 rounded-2xl font-bold text-[14.5px] text-white shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #FF4500 0%, #E03D00 100%)',
              boxShadow: '0 6px 20px rgba(255,69,0,0.45)',
            }}
          >
            <div className="flex items-center gap-3">
              <RedditIcon />
              <span>Follow on Reddit</span>
            </div>
            <span className="material-symbols-outlined text-[19px] text-white/70 group-hover:translate-x-0.5 transition-transform duration-200">
              arrow_forward
            </span>
          </a>
        </div>

        {/* Skip / Dismiss Button */}
        <button
          onClick={handleClose}
          className="mt-4 text-[12.5px] font-medium text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors cursor-pointer py-1"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}

function DiscordIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="white" className="shrink-0">
      <path d="M20.317 4.369a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.249a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.249.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.099.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.076.076 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.029 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.055c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.211 0 2.176 1.096 2.157 2.419 0 1.333-.955 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.211 0 2.176 1.096 2.157 2.419 0 1.333-.946 2.419-2.157 2.419z" />
    </svg>
  );
}

function RedditIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="white" className="shrink-0">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.82 14.15c.036.244.055.492.055.744 0 3.019-3.517 5.47-7.856 5.47-4.34 0-7.857-2.451-7.857-5.47 0-.252.02-.5.055-.744-.542-.246-.92-.79-.92-1.424 0-.86.698-1.558 1.558-1.558.42 0 .8.166 1.08.437 1.062-.766 2.53-1.253 4.16-1.31l.848-3.99a.32.32 0 0 1 .38-.246l2.813.598a1.076 1.076 0 1 1-.086.512l-2.518-.535-.756 3.556c1.61.065 3.056.552 4.11 1.31.28-.27.66-.437 1.08-.437.86 0 1.558.698 1.558 1.558 0 .636-.38 1.183-.926 1.428zM8.16 14.06c-.68 0-1.24-.55-1.24-1.235 0-.686.56-1.246 1.24-1.246.686 0 1.245.56 1.245 1.246 0 .686-.56 1.235-1.245 1.235zm7.68 0c-.68 0-1.24-.55-1.24-1.235 0-.686.56-1.246 1.24-1.246.686 0 1.245.56 1.245 1.246 0 .686-.56 1.235-1.245 1.235zm-6.1 2.02c-.15-.15-.15-.393 0-.543a.386.386 0 0 1 .543 0c.686.686 2.033.75 2.42.75.386 0 1.75-.064 2.42-.75a.386.386 0 0 1 .543 0c.15.15.15.393 0 .543-.75.75-2.11.943-2.963.943-.85 0-2.21-.193-2.963-.943z" />
    </svg>
  );
}
