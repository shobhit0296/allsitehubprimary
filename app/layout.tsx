import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import ShaderBackground from './components/ShaderBackground';
import CommunityModal from './components/CommunityModal';
import SiteAds from './components/SiteAds';
import { siteConfig } from '@/lib/siteConfig';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0a0a12',
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: '%s | AllSiteHub',
  },
  description: siteConfig.description,
  keywords: [
    'allsitehub',
    'allsite',
    'all site',
    'all site hub',
    'allsite hub',
    'allsitehub.site',
    'www.allsitehub.site',
    'allsitehub site',
    'allsite site',
    'allsitehub search',
    'allsite search',
    'AllSiteHub',
    'Allsitehub',
    'AllSite Hub',
    'All Site Hub',
    'Allsite',
    'AllSite',
    'website directory',
    'discover websites',
    'website search',
    'search websites',
    'website finder',
    'streaming sites',
    'anime streaming',
    'movies online',
    'live TV',
    'sports streaming',
    'useful websites',
    'web tools',
  ],
  authors: [{ name: `${siteConfig.name} Editorial Team`, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon.png', sizes: '1024x1024', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '1024x1024', type: 'image/png' },
    ],
  },
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.title,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const jsonLdWebsite = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: siteConfig.name,
  alternateName: [
    'allsitehub',
    'allsite',
    'all site',
    'all site hub',
    'allsite hub',
    'allsitehub.site',
    'www.allsitehub.site',
    'AllSiteHub',
    'Allsitehub',
    'Allsite',
    'AllSite',
    'All Site',
    'All Site Hub',
    'AllSite Hub',
    'AllSiteHub Search',
    'AllSite Directory',
  ],
  url: siteConfig.url,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${siteConfig.url}/?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

const jsonLdSiteNavigation = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'AllSiteHub Top Categories & Directory Sections',
  itemListElement: [
    {
      '@type': 'SiteNavigationElement',
      position: 1,
      name: 'Movies & TV Shows',
      description: 'Stream movies and TV series across verified platforms.',
      url: `${siteConfig.url}/category/movies-and-shows`,
    },
    {
      '@type': 'SiteNavigationElement',
      position: 2,
      name: 'Anime',
      description: 'Watch anime online and discover top streaming platforms.',
      url: `${siteConfig.url}/category/anime`,
    },
    {
      '@type': 'SiteNavigationElement',
      position: 3,
      name: 'Live TV & Sports',
      description: 'Stream live sports, football, cricket, and global TV channels.',
      url: `${siteConfig.url}/category/live-tv-and-sports`,
    },
    {
      '@type': 'SiteNavigationElement',
      position: 4,
      name: 'Manga',
      description: 'Read manga and comics online.',
      url: `${siteConfig.url}/category/manga`,
    },
    {
      '@type': 'SiteNavigationElement',
      position: 5,
      name: 'Collections',
      description: 'Curated lists of top AI, developer, and productivity tools.',
      url: `${siteConfig.url}/collections`,
    },
  ],
};

const jsonLdOrganization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: siteConfig.name,
  alternateName: ['allsitehub', 'allsitehub.site', 'www.allsitehub.site', 'AllSiteHub', 'Allsitehub', 'Allsite', 'All Site Hub', 'AllSite Hub'],
  url: siteConfig.url,
  logo: `${siteConfig.url}/icon.png`,
  description: siteConfig.description,
  founder: {
    '@type': 'Person',
    name: siteConfig.founder.name,
    jobTitle: siteConfig.founder.role,
  },
  contactPoint: {
    '@type': 'ContactPoint',
    email: siteConfig.contact.email,
    contactType: 'customer support',
  },
  sameAs: [
    siteConfig.social.discord,
    siteConfig.social.telegram,
    siteConfig.social.reddit,
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        {/* Maximum CPM attribution: send referrer on HTTPS navigation so Adsterra/AdSense attribute premium tier rates */}
        <meta name="referrer" content="no-referrer-when-downgrade" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://google-analytics.com" />
        <link rel="preconnect" href="https://www.google.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <script
          id="theme-init"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('allSiteHub_theme')||'cosmic';document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`,
          }}
        />
        {/* Ad Frequency Reset — bypasses 24h cooldown cookies so Stake ads always show on every visit */}
        <script
          id="ad-frequency-bypass"
          dangerouslySetInnerHTML={{
            __html: `(function() {
              try {
                var clearAdCookies = function() {
                  var cookies = document.cookie ? document.cookie.split(';') : [];
                  for (var i = 0; i < cookies.length; i++) {
                    var c = cookies[i].trim();
                    if (c.indexOf('ads-counter-') === 0 || c.indexOf('ads-last-tracker-') === 0 || c.indexOf('ads-cap-') === 0) {
                      var eqPos = c.indexOf('=');
                      var name = eqPos > -1 ? c.substr(0, eqPos) : c;
                      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;';
                      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=' + window.location.hostname + ';';
                      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.' + window.location.hostname.replace(/^www\./, '') + ';';
                    }
                  }
                  try {
                    localStorage.removeItem('ads-parameters');
                    localStorage.removeItem('ads-click');
                  } catch(e) {}
                };

                clearAdCookies();

                var cookieDesc = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie') ||
                                 Object.getOwnPropertyDescriptor(HTMLDocument.prototype, 'cookie');
                if (cookieDesc && cookieDesc.configurable) {
                  var originalGet = cookieDesc.get;
                  var originalSet = cookieDesc.set;

                  Object.defineProperty(document, 'cookie', {
                    configurable: true,
                    enumerable: true,
                    get: function() {
                      var val = originalGet.call(this);
                      if (!val) return '';
                      return val.split(';')
                        .map(function(c) { return c.trim(); })
                        .filter(function(c) {
                          return !(c.indexOf('ads-counter-') === 0 || c.indexOf('ads-last-tracker-') === 0 || c.indexOf('ads-cap-') === 0);
                        })
                        .join('; ');
                    },
                    set: function(val) {
                      if (typeof val === 'string' && (val.indexOf('ads-counter-') === 0 || val.indexOf('ads-last-tracker-') === 0 || val.indexOf('ads-cap-') === 0)) {
                        return;
                      }
                      return originalSet.call(this, val);
                    }
                  });
                }

                setInterval(clearAdCookies, 2000);
              } catch(e) {}
            })();`,
          }}
        />
      </head>
      <body suppressHydrationWarning className="min-h-screen flex flex-col relative" style={{ backgroundColor: 'var(--bg-base)' }}>
        <Script
          id="ld-website"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebsite) }}
        />
        <Script
          id="ld-navigation"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSiteNavigation) }}
        />
        <Script
          id="ld-organization"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
        />
        {/* ========================================================================= */}
        {/* PERMANENT MONETAG MULTITAG (NEVER CHANGE OR REMOVE UNDER ANY CIRCUMSTANCE) */}
        {/* Preserves OnClick (Popunder), Push Opt-in Subscriptions, and Vignettes    */}
        {/* In-Page Push enabled with strict 1-2 display frequency cap per user      */}
        {/* ========================================================================= */}
        {/* ========================================================================= */}
        {/* PERMANENT MONETAG MULTITAG (NEVER CHANGE OR REMOVE UNDER ANY CIRCUMSTANCE) */}
        {/* Preserves OnClick (Popunder), Push Opt-in Subscriptions, Vignettes, and IPP */}
        {/* ========================================================================= */}
        <Script
          id="monetag-tag"
          src="https://quge5.com/88/tag.min.js"
          data-zone="282088"
          strategy="beforeInteractive"
          data-cfasync="false"
        />
        <ShaderBackground />
        <div className="relative z-10 flex flex-col flex-1 w-full">
          {children}
          <CommunityModal />
          <SiteAds />
        </div>

        {/* Google Analytics GA4 — production only */}
        {process.env.NODE_ENV === 'production' && (
          <>
            <Script
              src="https://www.googletagmanager.com/gtag/js?id=G-3ZSN0JXGJK"
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());

                gtag('config', 'G-3ZSN0JXGJK', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}

        {/* ========================================================================= */}
        {/* STAKE OFFICIAL ADS LOADER & BANNER PLACEMENT                              */}
        {/* ========================================================================= */}

        {/* Stake Banner Container Tag */}
        <div className="ads-core-ads" />

        {/* Stake Script */}
        <Script
          id="AdsCoreLoader106969"
          src="https://sads.adsboosters.xyz/7d5d63b1d7a48601a1a774c8e8d4a88a.js"
          type="text/javascript"
          strategy="afterInteractive"
          data-cfasync="false"
        />

        {/* ========================================================================= */}
        {/* ADSTERRA ANTI-ADBLOCK POPUNDER (24H FREQUENCY CAPPED: 1-2 PER 24 HOURS)   */}
        {/* Limits aggressive popunders to max 2 per 24 hours (min 6h cooldown)       */}
        {/* to protect user experience, maximize conversion rates, and boost CPM      */}
        {/* ========================================================================= */}
        <Script
          id="adsterra-popunder-capper"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function() {
              try {
                if (typeof window === 'undefined') return;
                var path = window.location.pathname || '';
                if (
                  path.indexOf('/ash-admin-portal') === 0 ||
                  path.indexOf('/portal') === 0 ||
                  path.indexOf('/admin') === 0 ||
                  window.__IS_ADMIN_PANEL ||
                  document.documentElement.getAttribute('data-admin-panel') === 'true'
                ) {
                  return;
                }

                var STORAGE_KEY = 'adsterra_pop_impressions';
                var MAX_PER_24H = 2;
                var COOLDOWN_MS = 6 * 60 * 60 * 1000; // 6 hours between popunders
                var WINDOW_MS = 24 * 60 * 60 * 1000;   // 24 hours rolling window
                var now = Date.now();

                var getHistory = function() {
                  var list = [];
                  try {
                    var raw = localStorage.getItem(STORAGE_KEY);
                    if (raw) {
                      var parsed = JSON.parse(raw);
                      if (Array.isArray(parsed)) {
                        list = parsed.filter(function(t) {
                          return typeof t === 'number' && (now - t) < WINDOW_MS;
                        });
                      }
                    }
                  } catch(e) {}
                  if (list.length === 0) {
                    try {
                      var match = document.cookie.match(/(?:^|; )adsterra_pop_cap=([^;]*)/);
                      if (match) {
                        var cParsed = JSON.parse(decodeURIComponent(match[1]));
                        if (Array.isArray(cParsed)) {
                          list = cParsed.filter(function(t) {
                            return typeof t === 'number' && (now - t) < WINDOW_MS;
                          });
                        }
                      }
                    } catch(e) {}
                  }
                  return list;
                };

                var history = getHistory();

                // Cap at max 2 popunders in any 24h rolling window
                if (history.length >= MAX_PER_24H) {
                  return;
                }

                // Minimum 6 hour cooldown between the 1st and 2nd popunder
                if (history.length > 0) {
                  var lastAdTime = history[history.length - 1];
                  if ((now - lastAdTime) < COOLDOWN_MS) {
                    return;
                  }
                }

                // Inject Adsterra popunder script
                var s = document.createElement('script');
                s.id = 'adsterra-popunder';
                s.src = 'https://bibleearthquake.com/af/43/a8/af43a8a497a35fa461a277ea55d8898a.js';
                s.setAttribute('data-cfasync', 'false');
                s.async = true;

                var recorded = false;
                var recordImpression = function() {
                  if (recorded) return;
                  recorded = true;
                  try {
                    var currentNow = Date.now();
                    var updated = getHistory();
                    updated.push(currentNow);
                    try {
                      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
                    } catch(e) {}
                    var expires = new Date(currentNow + WINDOW_MS).toUTCString();
                    document.cookie = 'adsterra_pop_cap=' + encodeURIComponent(JSON.stringify(updated)) + '; expires=' + expires + '; path=/; SameSite=Lax';
                  } catch(e) {}
                };

                window.addEventListener('click', recordImpression, { capture: true, once: true });
                window.addEventListener('touchend', recordImpression, { capture: true, once: true });

                var target = document.head || document.getElementsByTagName('head')[0] || document.body;
                if (target) {
                  target.appendChild(s);
                }
              } catch(err) {
                console.error('Adsterra capper error:', err);
              }
            })();`,
          }}
        />
      </body>
    </html>
  );
}
