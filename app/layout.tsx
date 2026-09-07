import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import ShaderBackground from './components/ShaderBackground';
import CommunityModal from './components/CommunityModal';
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
    'AllSiteHub',
    'All Site Hub',
    'AllSite Hub',
    'website search',
    'search websites',
    'website finder',
    'website directory',
    'discover websites',
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
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon.png', sizes: '1024x1024', type: 'image/png' },
    ],
    shortcut: '/icon.png',
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
    'AllSiteHub',
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
  alternateName: ['AllSiteHub', 'Allsite', 'All Site Hub', 'AllSite Hub'],
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
        <meta name="f9c6a038f517a66c5ed68088ba0f8b3a8cb52026" content="f9c6a038f517a66c5ed68088ba0f8b3a8cb52026" />
        {/* HilltopAds: send referrer on HTTPS→HTTPS navigation to maximise CPM attribution */}
        <meta name="referrer" content="no-referrer-when-downgrade" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://insignificantpotential.com" />
        <link rel="preconnect" href="https://www.google.com" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('allSiteHub_theme')||'cosmic';document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`,
          }}
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebsite) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSiteNavigation) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
        />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1348117799300846"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        {/* AdSense Auto Ads — Google picks best placements automatically */}
        <Script id="adsense-auto-ads" strategy="afterInteractive">
          {`
            (adsbygoogle = window.adsbygoogle || []).push({
              google_ad_client: "ca-pub-1348117799300846",
              enable_page_level_ads: true
            });
          `}
        </Script>
        {/* Google Analytics GA4 */}
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
        {/* HilltopAds Anti-AdBlock Popunder (High CPM Zone #7393625) */}
        <Script
          id="hilltopads-popunder"
          src="/js/popunder.js"
          strategy="afterInteractive"
        />
      </head>
      <body className="min-h-screen flex flex-col relative" style={{ backgroundColor: 'var(--bg-base)' }}>
        <ShaderBackground />
        <div className="relative z-10 flex flex-col flex-1 w-full">
          {children}
        </div>
        <CommunityModal />
      </body>
    </html>
  );
}
