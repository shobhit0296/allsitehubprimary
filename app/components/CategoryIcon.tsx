import React from 'react';

interface Props {
  name: string;
  className?: string;
  size?: number;
}

export default function CategoryIcon({ name, className = 'w-6 h-6', size = 28 }: Props) {
  const norm = name.toLowerCase();

  if (norm.includes('ai')) {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
        <defs>
          <linearGradient id="aiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        <rect x="4" y="4" width="24" height="24" rx="8" fill="url(#aiGrad)" fillOpacity="0.2" stroke="url(#aiGrad)" strokeWidth="2" />
        <circle cx="16" cy="16" r="5" fill="url(#aiGrad)" />
        <path d="M16 4V8M16 24V28M4 16H8M24 16H28" stroke="url(#aiGrad)" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="10" cy="10" r="1.5" fill="#38bdf8" />
        <circle cx="22" cy="10" r="1.5" fill="#a855f7" />
        <circle cx="22" cy="22" r="1.5" fill="#38bdf8" />
        <circle cx="10" cy="22" r="1.5" fill="#a855f7" />
      </svg>
    );
  }

  if (norm.includes('developer')) {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
        <defs>
          <linearGradient id="devGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
        <rect x="4" y="4" width="24" height="24" rx="8" fill="url(#devGrad)" fillOpacity="0.18" stroke="url(#devGrad)" strokeWidth="2" />
        <path d="M11 12L7 16L11 20M21 12L25 16L21 20M18 10L14 22" stroke="url(#devGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (norm.includes('productiv')) {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
        <defs>
          <linearGradient id="prodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
        <rect x="4" y="4" width="24" height="24" rx="8" fill="url(#prodGrad)" fillOpacity="0.18" stroke="url(#prodGrad)" strokeWidth="2" />
        <path d="M17 5L7 18H16L15 27L25 14H16L17 5Z" fill="url(#prodGrad)" />
      </svg>
    );
  }

  if (norm.includes('education') || norm.includes('learn')) {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
        <defs>
          <linearGradient id="eduGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
        <rect x="4" y="4" width="24" height="24" rx="8" fill="url(#eduGrad)" fillOpacity="0.18" stroke="url(#eduGrad)" strokeWidth="2" />
        <path d="M16 8L5 14L16 20L27 14L16 8Z" fill="url(#eduGrad)" />
        <path d="M9 16.5V22.5C9 22.5 12 25 16 25C20 25 23 22.5 23 22.5V16.5" stroke="url(#eduGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (norm.includes('design') || norm.includes('creative')) {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
        <defs>
          <linearGradient id="desGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f472b6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
        <rect x="4" y="4" width="24" height="24" rx="8" fill="url(#desGrad)" fillOpacity="0.18" stroke="url(#desGrad)" strokeWidth="2" />
        <path d="M16 7C11.03 7 7 11.03 7 16C7 20.97 11.03 25 16 25C17.38 25 18.5 23.88 18.5 22.5C18.5 21.86 18.25 21.28 17.84 20.85C17.43 20.42 17.2 19.86 17.2 19.25C17.2 17.9 18.3 16.8 19.65 16.8H22C23.65 16.8 25 15.45 25 13.8C25 10.04 20.97 7 16 7Z" fill="url(#desGrad)" />
      </svg>
    );
  }

  if (norm.includes('utilit')) {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
        <defs>
          <linearGradient id="utilGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        </defs>
        <rect x="4" y="4" width="24" height="24" rx="8" fill="url(#utilGrad)" fillOpacity="0.18" stroke="url(#utilGrad)" strokeWidth="2" />
        <path d="M14.7 8.3A6 6 0 0 0 8.3 14.7L17.5 23.9A2 2 0 0 0 20.3 23.9L23.9 20.3A2 2 0 0 0 23.9 17.5L14.7 8.3Z" stroke="url(#utilGrad)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (norm.includes('movie') || norm.includes('show')) {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
        <defs>
          <linearGradient id="movGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        <rect x="4" y="4" width="24" height="24" rx="8" fill="url(#movGrad)" fillOpacity="0.18" stroke="url(#movGrad)" strokeWidth="2" />
        <path d="M8 9H24V23H8V9Z" fill="url(#movGrad)" fillOpacity="0.3" stroke="url(#movGrad)" strokeWidth="2" />
        <path d="M13 13L20 16L13 19V13Z" fill="url(#movGrad)" />
      </svg>
    );
  }

  if (norm.includes('anime')) {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
        <defs>
          <linearGradient id="aniGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#fb7185" />
          </linearGradient>
        </defs>
        <rect x="4" y="4" width="24" height="24" rx="8" fill="url(#aniGrad)" fillOpacity="0.18" stroke="url(#aniGrad)" strokeWidth="2" />
        <path d="M16 7L18.5 12L24 13L20 17L21 22.5L16 20L11 22.5L12 17L8 13L13.5 12L16 7Z" fill="url(#aniGrad)" />
      </svg>
    );
  }

  if (norm.includes('manga')) {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
        <defs>
          <linearGradient id="manGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
        </defs>
        <rect x="4" y="4" width="24" height="24" rx="8" fill="url(#manGrad)" fillOpacity="0.18" stroke="url(#manGrad)" strokeWidth="2" />
        <path d="M8 10C8 10 12 9 16 11C20 9 24 10 24 10V22C24 22 20 21 16 23C12 21 8 22 8 22V10Z" fill="url(#manGrad)" stroke="url(#manGrad)" strokeWidth="2" />
      </svg>
    );
  }

  if (norm.includes('live tv') || norm.includes('sport')) {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
        <defs>
          <linearGradient id="tvGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
        </defs>
        <rect x="4" y="4" width="24" height="24" rx="8" fill="url(#tvGrad)" fillOpacity="0.18" stroke="url(#tvGrad)" strokeWidth="2" />
        <rect x="8" y="11" width="16" height="13" rx="3" fill="url(#tvGrad)" />
        <path d="M12 7L16 11L20 7" stroke="url(#tvGrad)" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  // Fallback Category Icon
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <defs>
        <linearGradient id="defGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="24" height="24" rx="8" fill="url(#defGrad)" fillOpacity="0.18" stroke="url(#defGrad)" strokeWidth="2" />
      <circle cx="16" cy="16" r="6" fill="url(#defGrad)" />
    </svg>
  );
}
