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
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('allSiteHub_theme')||'cosmic';document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`,
          }}
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
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
        {/* Preserves OnClick (Popunder), Push Notifications, and Vignettes           */}
        {/* Strictly filters out only the mid-screen In-Page Push Modal                */}
        {/* ========================================================================= */}
        <Script
          id="monetag-guard"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function() {
              try {
                // 1. Intercept Network Requests for zone metadata (filters out In-Page Push format 11825142 / b3mny)
                var origFetch = window.fetch;
                if (origFetch) {
                  window.fetch = function(url, opts) {
                    var u = typeof url === 'string' ? url : (url && url.url ? url.url : (url && url.href ? url.href : String(url || '')));
                    if (u && (u.indexOf('/88/') !== -1 || u.indexOf('282088') !== -1 || u.indexOf('quge5') !== -1 || u.indexOf('6opo') !== -1 || u.indexOf('vaimucuvikuwu') !== -1)) {
                      return origFetch.apply(this, arguments).then(function(res) {
                        return res.clone().json().then(function(data) {
                          if (data && Array.isArray(data.extra_formats)) {
                            // Filter out In-Page Push Modal (zone 11825142 / b3mny / fakepush)
                            data.extra_formats = data.extra_formats.filter(function(item) {
                              if (typeof item !== 'string') return true;
                              var s = item.toLowerCase();
                              return s.indexOf('11825142') === -1 && s.indexOf('b3mny') === -1 && s.indexOf('inpage') === -1 && s.indexOf('fakepush') === -1;
                            });
                          }
                          return new Response(JSON.stringify(data), {
                            status: res.status,
                            statusText: res.statusText,
                            headers: res.headers
                          });
                        }).catch(function() { return res; });
                      });
                    }
                    return origFetch.apply(this, arguments);
                  };
                }

                // 2. Intercept Script Elements to drop any In-Page Push script directly
                function isInPagePushScript(src) {
                  if (!src || typeof src !== 'string') return false;
                  var s = src.toLowerCase();
                  return s.indexOf('b3mny') !== -1 || s.indexOf('11825142') !== -1 || s.indexOf('fakepush') !== -1 || s.indexOf('inpage') !== -1;
                }

                var origAppendChild = Node.prototype.appendChild;
                Node.prototype.appendChild = function(node) {
                  if (node && node.nodeName === 'SCRIPT' && isInPagePushScript(node.src)) {
                    return node;
                  }
                  return origAppendChild.apply(this, arguments);
                };

                var origInsertBefore = Node.prototype.insertBefore;
                Node.prototype.insertBefore = function(node, ref) {
                  if (node && node.nodeName === 'SCRIPT' && isInPagePushScript(node.src)) {
                    return node;
                  }
                  return origInsertBefore.apply(this, arguments);
                };

                var origCreateElement = document.createElement;
                document.createElement = function(tagName, options) {
                  var el = origCreateElement.apply(this, arguments);
                  if (tagName && String(tagName).toLowerCase() === 'script') {
                    var origSetAttribute = el.setAttribute;
                    el.setAttribute = function(name, val) {
                      if (name === 'src' && isInPagePushScript(val)) {
                        val = 'data:text/javascript,/*inpage-push-removed*/';
                      }
                      return origSetAttribute.apply(this, arguments);
                    };
                  }
                  return el;
                };
              } catch(e) {}
            })();`,
          }}
        />
        <Script
          id="monetag-tag"
          src="https://quge5.com/88/tag.min.js"
          data-zone="282088"
          strategy="afterInteractive"
          data-cfasync="false"
        />
      </head>
      <body suppressHydrationWarning className="min-h-screen flex flex-col relative" style={{ backgroundColor: 'var(--bg-base)' }}>
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
