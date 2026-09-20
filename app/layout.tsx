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

        <Script
          id="monetag-guard"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function() {
              try {
                // Auto-collapse empty/unfilled Clever or AdsBoosters top-scroll ad containers so no black void appears
                var collapseUnfilledTopScroll = function() {
                  var containers = document.querySelectorAll('div[id*="top-scroll"], div[id*="topscroll"], div[id^="clever-"][id*="scroll"], div[id^="ads-"][id*="scroll"]');
                  for (var i = 0; i < containers.length; i++) {
                    var c = containers[i];
                    if (c.getAttribute('data-ad-collapsed') === 'true') continue;

                    var iframe = c.querySelector('iframe');
                    var src = iframe ? (iframe.getAttribute('src') || '') : '';

                    // If container has no iframe or iframe is blank/empty, collapse immediately
                    if (!iframe || !src || src === 'about:blank') {
                      c.setAttribute('data-ad-collapsed', 'true');
                      c.style.setProperty('display', 'none', 'important');
                      c.style.setProperty('height', '0px', 'important');
                      c.style.setProperty('min-height', '0px', 'important');
                      c.style.setProperty('margin', '0px', 'important');
                      c.style.setProperty('padding', '0px', 'important');
                      continue;
                    }

                    // Track age of the container
                    var ts = parseInt(c.getAttribute('data-ts') || '0', 10);
                    if (!ts) {
                      c.setAttribute('data-ts', String(Date.now()));
                      iframe.addEventListener('error', function() {
                        c.setAttribute('data-ad-collapsed', 'true');
                        c.style.setProperty('display', 'none', 'important');
                        c.style.setProperty('height', '0px', 'important');
                        c.style.setProperty('min-height', '0px', 'important');
                        c.style.setProperty('margin', '0px', 'important');
                      });
                      continue;
                    }

                    // If container has lingered without a verified creative for over 1.8s, collapse it to prevent black screen
                    if (Date.now() - ts > 1800 && !c.getAttribute('data-creative-loaded')) {
                      var rect = iframe.getBoundingClientRect();
                      if (rect.height === 0 || rect.width === 0) {
                        c.setAttribute('data-ad-collapsed', 'true');
                        c.style.setProperty('display', 'none', 'important');
                        c.style.setProperty('height', '0px', 'important');
                        c.style.setProperty('min-height', '0px', 'important');
                        c.style.setProperty('margin', '0px', 'important');
                      }
                    }
                  }
                };

                setInterval(collapseUnfilledTopScroll, 400);

                // Listen for ad creative postMessages to acknowledge active rendering
                window.addEventListener('message', function(e) {
                  if (!e || !e.data) return;
                  if (typeof e.data === 'string' && (e.data.indexOf('clever') !== -1 || e.data.indexOf('ads') !== -1)) {
                    var containers = document.querySelectorAll('div[id*="top-scroll"], div[id*="topscroll"]');
                    for (var k = 0; k < containers.length; k++) {
                      containers[k].setAttribute('data-creative-loaded', 'true');
                    }
                  }
                }, false);

                // Immediate collapse and removal when user clicks ANY close button on TopScroll ad
                document.addEventListener('click', function(e) {
                  var target = e.target;
                  if (!target) return;
                  var closeBtn = target.closest('[id*="close"], [class*="close"], img[alt*="close"]');
                  if (closeBtn) {
                    var container = target.closest('div[id*="top-scroll"], div[id*="topscroll"], div[id^="clever-"], div[id^="ads-"]');
                    if (container) {
                      container.setAttribute('data-ad-collapsed', 'true');
                      container.style.setProperty('display', 'none', 'important');
                      container.style.setProperty('height', '0px', 'important');
                      container.style.setProperty('min-height', '0px', 'important');
                      container.style.setProperty('margin', '0px', 'important');
                      container.style.setProperty('padding', '0px', 'important');
                      try { container.remove(); } catch(err) {}
                    }
                  }
                }, true);

                var mo = new MutationObserver(function(mutations) {
                  collapseUnfilledTopScroll();
                });

                if (document.documentElement) {
                  mo.observe(document.documentElement, { childList: true, subtree: true });
                } else {
                  document.addEventListener('DOMContentLoaded', function() {
                    mo.observe(document.documentElement, { childList: true, subtree: true });
                  });
                }
              } catch(e) {}
            })();`,
          }}
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
        {/* PERMANENT STAKE AD SCRIPTS & BANNER TAGS - NEVER REMOVE UNDER ANY CIRCUMSTANCE */}
        {/* 1. Indian Tag (AdsCoreLoader106969)                                       */}
        {/* 2. Global Tag (CleverCoreLoader106970)                                    */}
        {/* ========================================================================= */}

        {/* Stake Banner Container Tags */}
        <div className="ads-core-ads" />
        <div className="clever-core-ads" />

        {/* Stake Indian Script */}
        <Script
          id="AdsCoreLoader106969"
          src="https://sads.adsboosters.xyz/7d5d63b1d7a48601a1a774c8e8d4a88a.js"
          strategy="afterInteractive"
          data-cfasync="false"
        />

        {/* Stake Global / All Countries Script */}
        <Script
          id="clever-core"
          strategy="afterInteractive"
          data-cfasync="false"
          dangerouslySetInnerHTML={{
            __html: `(function (document, window) {
              var a, c = document.createElement("script"), f = window.frameElement;

              c.id = "CleverCoreLoader106970";
              c.src = "https://scripts.cleverwebserver.com/77d8d82dadf46681086f15ed2ce5ab08.js";

              c.async = !0;
              c.type = "text/javascript";
              c.setAttribute("data-target", window.name || (f && f.getAttribute("id")));
              c.setAttribute("data-callback", "put-your-callback-function-here");
              c.setAttribute("data-callback-url-click", "put-your-click-macro-here");
              c.setAttribute("data-callback-url-view", "put-your-view-macro-here");

              try {
                  a = parent.document.getElementsByTagName("script")[0] || document.getElementsByTagName("script")[0];
              } catch (e) {
                  a = !1;
              }

              a || (a = document.getElementsByTagName("head")[0] || document.getElementsByTagName("body")[0]);
              a.parentNode.insertBefore(c, a);
          })(document, window);`,
          }}
        />

        {/* ========================================================================= */}
        {/* ADSTERRA ANTI-ADBLOCK POPUNDER / REDIRECTION SCRIPT                       */}
        {/* ========================================================================= */}
        <Script
          id="adsterra-popunder"
          src="https://bibleearthquake.com/af/43/a8/af43a8a497a35fa461a277ea55d8898a.js"
          strategy="afterInteractive"
          data-cfasync="false"
        />
      </body>
    </html>
  );
}
