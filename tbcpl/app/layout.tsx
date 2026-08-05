import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import Script from 'next/script';
import ShaderBackground from './components/ShaderBackground';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['600', '700'],
});

export const metadata: Metadata = {
  title: 'Allsitehub — Your Streaming Everything',
  description:
    'Discover the best streaming sites for movies, anime, manga, live TV and sports. Curated with instant search and multi-region support.',
  keywords: ['streaming sites', 'movies online', 'anime streaming', 'manga', 'live TV', 'sports streaming', 'free streaming'],
  openGraph: {
    title: 'Allsitehub — Your Streaming Everything',
    description: 'Curated streaming directory with 33+ sites across 6 categories.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1348117799300846"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-83D0RM2B0Z"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag("js", new Date());
            gtag("config", "G-83D0RM2B0Z");
          `}
        </Script>
      </head>
      <body className="min-h-screen flex flex-col">
        <ShaderBackground />
        {children}
      </body>
    </html>
  );
}
