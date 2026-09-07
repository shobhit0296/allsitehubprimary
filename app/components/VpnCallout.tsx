'use client';

/**
 * VpnCallout — Compact high-converting VPN affiliate banner.
 *
 * SETUP: Replace the placeholder href below with your real NordVPN affiliate link
 * once you receive it from https://nordvpn.com/affiliate/ or CJ Affiliate.
 *
 * Use rel="sponsored nofollow noopener noreferrer" for Google / AdSense compliance.
 */

const VPN_AFFILIATE_HREF =
  'https://nordvpn.com/?utm_medium=affiliates&utm_source=aff_xxxxxxxx'; // ← Replace with your link

export default function VpnCallout({ variant = 'default' }: { variant?: 'default' | 'compact' }) {
  if (variant === 'compact') {
    return (
      <a
        href={VPN_AFFILIATE_HREF}
        target="_blank"
        rel="sponsored nofollow noopener noreferrer"
        className="vpn-callout-compact"
        aria-label="Get NordVPN — 73% off + 3 months free"
      >
        {/* Shield icon */}
        <span className="vpn-compact-icon" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L3.5 6.5v5C3.5 16.16 7.11 20.89 12 22c4.89-1.11 8.5-5.84 8.5-10.5v-5L12 2z"/>
          </svg>
        </span>
        <span className="vpn-compact-text">
          <strong>NordVPN</strong> — Bypass geo-blocks &amp; stream securely
        </span>
        <span className="vpn-compact-badge">73% OFF</span>
        <span className="vpn-compact-arrow" aria-hidden="true">→</span>
      </a>
    );
  }

  return (
    <a
      href={VPN_AFFILIATE_HREF}
      target="_blank"
      rel="sponsored nofollow noopener noreferrer"
      className="vpn-callout"
      aria-label="Get NordVPN 73% off — stream safely and bypass regional blocks"
    >
      {/* Animated glow behind the card */}
      <span className="vpn-glow" aria-hidden="true" />

      {/* Shield + Lock icon */}
      <span className="vpn-icon-wrap" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L3.5 6.5v5C3.5 16.16 7.11 20.89 12 22c4.89-1.11 8.5-5.84 8.5-10.5v-5L12 2z"/>
        </svg>
      </span>

      {/* Text block */}
      <span className="vpn-text-block">
        <span className="vpn-headline">
          Some sites may be geo-blocked in your region
        </span>
        <span className="vpn-sub">
          Unblock &amp; stream securely with NordVPN — trusted by 14M+ users
        </span>
      </span>

      {/* Deal badge */}
      <span className="vpn-badge" aria-hidden="true">
        <span className="vpn-badge-pct">73%</span>
        <span className="vpn-badge-off">OFF</span>
      </span>

      {/* CTA pill */}
      <span className="vpn-cta" aria-hidden="true">
        Get Deal
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: 4 }}>
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </span>
    </a>
  );
}
