'use client';

import { useState, useEffect } from 'react';

const DISCORD_URL = 'https://discord.gg/ZEMSvP2HX';
const TELEGRAM_URL = 'https://t.me/+gWOCVAqtcXxkZDk9';
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
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-fade-in overscroll-none select-none bg-black/65 backdrop-blur-md transition-all duration-300"
      onClick={handleClose}
    >
      {/* ── Modal Card with Matte & Transparent Frosted Effect ── */}
      <div
        className="relative w-full max-w-[420px] mx-auto rounded-3xl p-6 sm:p-7 text-center overflow-hidden border border-[rgba(115,95,175,0.28)] animate-scale-in"
        style={{
          background: 'linear-gradient(165deg, rgba(22, 22, 30, 0.88) 0%, rgba(14, 14, 20, 0.94) 100%)',
          backdropFilter: 'blur(32px) saturate(170%)',
          WebkitBackdropFilter: 'blur(32px) saturate(170%)',
          boxShadow: '0 24px 70px -12px rgba(0, 0, 0, 0.88), inset 0 1px 0 rgba(255, 255, 255, 0.12), inset 0 -1px 0 rgba(0, 0, 0, 0.5)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Subtle Ambient Inset Rim */}
        <div
          className="absolute -top-12 -left-12 w-36 h-36 rounded-full pointer-events-none blur-3xl opacity-20"
          style={{ background: '#735faf' }}
        />

        {/* Close Button */}
        <button
          onClick={handleClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-[#71717a] hover:text-white bg-white/[0.05] hover:bg-white/[0.12] transition-all duration-150 border border-white/[0.08] cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>

        {/* Triple Brand Icon Badges */}
        <div className="flex items-center justify-center gap-2.5 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#5865F2]/15 border border-[#5865F2]/30 text-[#5865F2] flex items-center justify-center shadow-[0_2px_12px_rgba(88,101,242,0.25)]">
            <DiscordIcon size={20} />
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FF4500]/15 border border-[#FF4500]/30 text-[#FF4500] flex items-center justify-center shadow-[0_2px_12px_rgba(255,69,0,0.25)]">
            <RedditIcon size={20} />
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#229ED9]/15 border border-[#229ED9]/30 text-[#229ED9] flex items-center justify-center shadow-[0_2px_12px_rgba(34,158,217,0.25)]">
            <TelegramIcon size={20} />
          </div>
        </div>

        {/* Headline */}
        <h3
          id="community-modal-title"
          className="font-headline text-[21px] sm:text-[23px] font-extrabold text-white mb-2 tracking-tight"
        >
          Join Our Community
        </h3>

        {/* Description */}
        <p className="text-[13px] text-[#9ca3af] leading-relaxed mb-5 max-w-xs mx-auto">
          Get real-time updates, request websites, and chat with members across our platforms.
        </p>

        {/* Single Matte Community Card (Discord, Telegram, Reddit) */}
        <div className="w-full rounded-2xl bg-[#111118]/80 border border-white/[0.08] divide-y divide-white/[0.05] overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] mb-4 text-left">
          {/* Discord */}
          <a
            href={DISCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClose}
            className="flex items-center justify-between px-3.5 py-2.5 hover:bg-[#5865F2]/10 transition-colors duration-150 group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#5865F2]/15 flex items-center justify-center shrink-0 text-[#5865F2] group-hover:bg-[#5865F2] group-hover:text-white transition-colors">
                <DiscordIcon size={18} />
              </div>
              <div>
                <div className="text-[13.5px] font-bold text-[#e2e2ec] group-hover:text-[#5865F2] transition-colors">
                  Discord Server
                </div>
                <div className="text-[11px] text-[#71717a]">Chat, requests & updates</div>
              </div>
            </div>
            <span className="text-[#5865F2] opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-xs font-bold">
              ↗
            </span>
          </a>

          {/* Telegram */}
          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClose}
            className="flex items-center justify-between px-3.5 py-2.5 hover:bg-[#229ED9]/10 transition-colors duration-150 group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#229ED9]/15 flex items-center justify-center shrink-0 text-[#229ED9] group-hover:bg-[#229ED9] group-hover:text-white transition-colors">
                <TelegramIcon size={18} />
              </div>
              <div>
                <div className="text-[13.5px] font-bold text-[#e2e2ec] group-hover:text-[#229ED9] transition-colors">
                  Telegram Channel
                </div>
                <div className="text-[11px] text-[#71717a]">Fast domain notifications</div>
              </div>
            </div>
            <span className="text-[#229ED9] opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-xs font-bold">
              ↗
            </span>
          </a>

          {/* Reddit */}
          <a
            href={REDDIT_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClose}
            className="flex items-center justify-between px-3.5 py-2.5 hover:bg-[#FF4500]/10 transition-colors duration-150 group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#FF4500]/15 flex items-center justify-center shrink-0 text-[#FF4500] group-hover:bg-[#FF4500] group-hover:text-white transition-colors">
                <RedditIcon size={18} />
              </div>
              <div>
                <div className="text-[13.5px] font-bold text-[#e2e2ec] group-hover:text-[#FF4500] transition-colors">
                  Reddit Community
                </div>
                <div className="text-[11px] text-[#71717a]">Discussions & feedback</div>
              </div>
            </div>
            <span className="text-[#FF4500] opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-xs font-bold">
              ↗
            </span>
          </a>
        </div>

        {/* Skip / Dismiss Button */}
        <button
          onClick={handleClose}
          className="text-[12px] font-medium text-[#71717a] hover:text-[#d4d4d8] transition-colors cursor-pointer py-1"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}

function DiscordIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
      <path d="M20.317 4.369a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.249a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.249.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.099.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.076.076 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.029 19.84 19.84 0 0 0 6.002-3.03.078.078 0 0 0 .032-.055c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.211 0 2.176 1.096 2.157 2.419 0 1.333-.955 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.211 0 2.176 1.096 2.157 2.419 0 1.333-.946 2.419-2.157 2.419z" />
    </svg>
  );
}

function TelegramIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.894-1.232 5.344-1.782 7.74-.233 1.014-.607 1.353-.969 1.386-.787.072-1.385-.52-2.148-1.02-.194-.128-1.89-1.225-2.073-1.378-.507-.423-.083-.655.124-.87.054-.057 2.47-2.395 2.518-2.6.006-.026.012-.123-.047-.176s-.138-.035-.198-.021c-.084.02-1.428.908-4.032 2.668-.381.263-.727.391-1.036.384-.34-.007-.996-.192-1.484-.351-.598-.194-1.074-.297-1.033-.626.022-.172.26-.348.716-.53 2.798-1.218 4.664-2.022 5.597-2.411 2.662-1.109 3.216-1.301 3.577-1.307.079-.001.257.018.372.112.097.079.124.186.134.263.01.078.02.257.01.37z" />
    </svg>
  );
}

function RedditIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.82 14.15c.036.244.055.492.055.744 0 3.019-3.517 5.47-7.856 5.47-4.34 0-7.857-2.451-7.857-5.47 0-.252.02-.5.055-.744-.542-.246-.92-.79-.92-1.424 0-.86.698-1.558 1.558-1.558.42 0 .8.166 1.08.437 1.062-.766 2.53-1.253 4.16-1.31l.848-3.99a.32.32 0 0 1 .38-.246l2.813.598a1.076 1.076 0 1 1-.086.512l-2.518-.535-.756 3.556c1.61.065 3.056.552 4.11 1.31.28-.27.66-.437 1.08-.437.86 0 1.558.698 1.558 1.558 0 .636-.38 1.183-.926 1.428zM8.16 14.06c-.68 0-1.24-.55-1.24-1.235 0-.686.56-1.246 1.24-1.246.686 0 1.245.56 1.245 1.246 0 .686-.56 1.235-1.245 1.235zm7.68 0c-.68 0-1.24-.55-1.24-1.235 0-.686.56-1.246 1.24-1.246.686 0 1.245.56 1.245 1.246 0 .686-.56 1.235-1.245 1.235zm-6.1 2.02c-.15-.15-.15-.393 0-.543a.386.386 0 0 1 .543 0c.686.686 2.033.75 2.42.75.386 0 1.75-.064 2.42-.75a.386.386 0 0 1 .543 0c.15.15.15.393 0 .543-.75.75-2.11.943-2.963.943-.85 0-2.21-.193-2.963-.943z" />
    </svg>
  );
}
