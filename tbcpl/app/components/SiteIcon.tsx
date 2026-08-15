'use client';

import { useState, useCallback } from 'react';

interface SiteIconProps {
  name: string;
  domain: string;
  faviconUrl?: string;
  size?: number;
  className?: string;
}

const BRAND_GRADIENTS = [
  { bg: 'linear-gradient(135deg,#1d4ed8 0%,#3b82f6 100%)', text: '#fff' },
  { bg: 'linear-gradient(135deg,#7c3aed 0%,#a855f7 100%)', text: '#fff' },
  { bg: 'linear-gradient(135deg,#065f46 0%,#10b981 100%)', text: '#fff' },
  { bg: 'linear-gradient(135deg,#b45309 0%,#f59e0b 100%)', text: '#fff' },
  { bg: 'linear-gradient(135deg,#9f1239 0%,#f43f5e 100%)', text: '#fff' },
  { bg: 'linear-gradient(135deg,#0e7490 0%,#06b6d4 100%)', text: '#fff' },
  { bg: 'linear-gradient(135deg,#3730a3 0%,#6366f1 100%)', text: '#fff' },
  { bg: 'linear-gradient(135deg,#831843 0%,#ec4899 100%)', text: '#fff' },
];

function getBrand(name: string) {
  if (!name) return BRAND_GRADIENTS[0];
  let code = 0;
  for (let i = 0; i < name.length; i++) code += name.charCodeAt(i);
  return BRAND_GRADIENTS[code % BRAND_GRADIENTS.length];
}

function getInitials(name: string): string {
  if (!name) return '?';
  const words = name.trim().split(/\s+/);
  return words.length >= 2
    ? (words[0][0] + words[words.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

function buildSources(name: string, domain: string, faviconUrl?: string): string[] {
  const cleanDomain = domain
    ? domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]
    : '';

  const sources: string[] = [];

  const custom = faviconUrl?.trim();
  if (
    custom &&
    !custom.includes('google.com/s2/favicons') &&
    !custom.includes('duckduckgo.com/ip3') &&
    !custom.includes('icon.horse')
  ) {
    sources.push(custom);
  }

  if (cleanDomain) {
    sources.push(`https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=256`);
    sources.push(`https://icons.duckduckgo.com/ip3/${cleanDomain}.ico`);
    sources.push(`https://icon.horse/icon/${cleanDomain}`);
  }

  return Array.from(new Set(sources.filter(Boolean)));
}

export default function SiteIcon({
  name,
  domain,
  faviconUrl,
  size = 40,
  className = '',
}: SiteIconProps) {
  const sources = buildSources(name, domain, faviconUrl);

  const [imgStep, setImgStep] = useState(0);
  const [failedAll, setFailedAll] = useState(sources.length === 0);

  const currentSrc = sources[imgStep];

  const handleError = useCallback(() => {
    setImgStep(prev => {
      const next = prev + 1;
      if (next >= sources.length) {
        setFailedAll(true);
      }
      return next;
    });
  }, [sources.length]);

  const initials = getInitials(name);
  const brand = getBrand(name);
  const radius = size * 0.22;
  const fontSize = size <= 28 ? '0.65rem' : size <= 40 ? '0.78rem' : size <= 54 ? '0.92rem' : '1.1rem';

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden shrink-0 ${className}`}
      style={{ width: size, height: size, borderRadius: radius, background: brand.bg }}
      aria-label={`${name} logo`}
    >
      <div
        aria-hidden={!failedAll}
        style={{
          position: 'absolute',
          inset: 0,
          color: brand.text,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          fontSize,
          letterSpacing: '-0.02em',
          fontFamily: 'var(--font-headline, system-ui, sans-serif)',
          pointerEvents: 'none',
          userSelect: 'none',
          borderRadius: radius,
        }}
      >
        {initials}
      </div>

      {!failedAll && currentSrc && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={currentSrc}
          src={currentSrc}
          alt={name}
          width={size}
          height={size}
          decoding="async"
          onError={handleError}
          style={{
            position: 'absolute',
            inset: 0,
            width: size,
            height: size,
            objectFit: 'contain',
            borderRadius: radius * 0.8,
            imageRendering: '-webkit-optimize-contrast',
          }}
        />
      )}
    </div>
  );
}
