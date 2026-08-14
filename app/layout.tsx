import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import ShaderBackground from './components/ShaderBackground';
import CommunityModal from './components/CommunityModal';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0a0a12',
};

const BASE_URL = 'https://allsitehub.site';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'AllSiteHub — Discover & Search Useful Websites',
    template: '%s | AllSiteHub',
  },
  description:
    'Discover useful websites with AllSiteHub. Search, explore and refine streaming platforms, anime, manga, live TV, sports, and web tools across regions.',
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
  ],
  authors: [{ name: 'AllSiteHub Team', url: BASE_URL }],
  creator: 'AllSiteHub',
  publisher: 'AllSiteHub',
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
    title: 'AllSiteHub — Discover & Search Useful Websites',
    description: 'Discover useful websites with AllSiteHub. Search, explore and refine streaming platforms across categories and regions.',
    url: BASE_URL,
    siteName: 'AllSiteHub',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AllSiteHub — Discover & Search Useful Websites',
    description: 'Discover useful websites with AllSiteHub. Search, explore and refine websites across categories.',
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
  name: 'AllSiteHub',
  alternateName: ['All Site Hub', 'AllSite Hub', 'AllSiteHub Search'],
  url: BASE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${BASE_URL}/?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

const jsonLdOrganization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'AllSiteHub',
  alternateName: 'All Site Hub',
  url: BASE_URL,
  logo: `${BASE_URL}/icon.png`,
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'allsitehubsupport@gmail.com',
    contactType: 'customer support',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://www.google.com" />
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
        />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1348117799300846"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        {/* GA4 — Primary property G-83D0RM2B0Z */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-83D0RM2B0Z"
          strategy="afterInteractive"
        />
        {/* GA4 — Property G-546801810 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-546801810"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            // Primary GA4 property
            gtag('config', 'G-83D0RM2B0Z', {
              page_path: window.location.pathname,
              send_page_view: true,
            });

            // Secondary GA4 property — 546801810
            gtag('config', 'G-546801810', {
              page_path: window.location.pathname,
              send_page_view: true,
            });
          `}
        </Script>
      </head>
      <body className="min-h-screen flex flex-col">
        <ShaderBackground />
        {children}
        <CommunityModal />
      </body>
    </html>
  );
}
