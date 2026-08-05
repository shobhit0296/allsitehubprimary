// components/Layout.js
import Head from 'next/head';
import Link from 'next/link';

export default function Layout({ children }) {
  return (
    <>
      <Head>
        <title>TBCPL — The Best Couch Potato List</title>
        <meta name="description" content="Curated streaming sites with admin panel" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="min-h-screen flex flex-col bg-[#0a0a0f] text-[#f5f5f7]">
        <header className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
            <Link href="/" className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-9 h-9 shrink-0 rounded-xl bg-[#8b5cf6] flex items-center justify-center text-white font-extrabold text-sm">
                T
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-bold tracking-tight">TBCPL</h1>
                <p className="hidden sm:block text-[10px] text-[#a1a1aa] tracking-wider uppercase truncate">The Best Couch Potato List</p>
              </div>
            </Link>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="flex items-center gap-2 text-[#a1a1aa] text-sm bg-white/5 px-2.5 sm:px-3 py-1.5 rounded-full border border-white/5">
                <span className="online-dot"></span>
                <span id="onlineCount">12</span>
                <span className="hidden sm:inline text-xs">online</span>
              </div>
              <Link href="/admin/login" className="text-[#a1a1aa] hover:text-white transition text-sm flex items-center gap-1.5 bg-white/5 px-2.5 sm:px-3 py-1.5 rounded-full border border-white/5 hover:border-white/20">
                <i className="fas fa-lock text-[10px]"></i>
                Admin
              </Link>
            </div>
          </div>
        </header>
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
          {children}
        </main>
        <footer className="mt-12 px-4 py-6 border-t border-white/5 text-center text-xs text-[#52525b]">
          <p>© 2026 TBCPL — The Best Couch Potato List. All rights reserved.</p>
          <p className="mt-1">Curated with ❤️ for couch potatoes everywhere.</p>
        </footer>
      </div>
    </>
  );
}