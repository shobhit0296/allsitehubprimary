// components/AdminLayout.js
import Head from 'next/head';
import Link from 'next/link';

export default function AdminLayout({ children, title = 'Admin' }) {
  return (
    <>
      <Head>
        <title>{title} — TBCPL Admin</title>
      </Head>
      <div className="min-h-screen bg-[#0a0a0f] text-[#f5f5f7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {children}
        </div>
      </div>
    </>
  );
}