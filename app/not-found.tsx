import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 relative overflow-hidden bg-[#070913]">
      <div className="noise-overlay" />
      <div className="relative z-10 max-w-md">
        <div className="w-20 h-20 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-4xl text-blue-400">explore_off</span>
        </div>
        <h1 className="font-headline text-6xl font-extrabold text-[var(--text-primary)] mb-3 tracking-tight">404</h1>
        <h2 className="font-headline text-xl font-bold text-[var(--text-primary)] mb-3">Page Not Found</h2>
        <p className="text-[var(--text-secondary)] text-sm mb-8 leading-relaxed">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/" className="btn-brand px-8 py-3.5 rounded-xl text-sm font-bold inline-flex items-center gap-2">
          <span>←</span> Back to Homepage
        </Link>
      </div>
    </div>
  );
}
