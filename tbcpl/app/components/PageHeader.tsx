import Link from 'next/link';
import ThemeNavOption from './ThemeNavOption';

const NAV_LINKS = [
  ['Home', '/'],
  ['About', '/about'],
  ['Request', '/request'],
  ['DMCA', '/dmca'],
] as const;

export default function PageHeader({ active }: { active: 'About' | 'Request' | 'DMCA' }) {
  return (
    <header className="sticky top-0 z-50 glass-lux-bright border-b border-white/5">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-16 h-16 flex items-center gap-4 lg:gap-10">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <img
            src="/logo.png"
            alt="Allsitehub"
            width={32}
            height={32}
            className="w-8 h-8 rounded-lg object-contain bg-[#05070d] shrink-0"
          />
          <span className="font-headline text-lg font-extrabold tracking-tight text-[var(--text-primary)]">
            All<span className="bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">site</span>hub
          </span>
        </Link>

        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {NAV_LINKS.map(([label, href]) => (
            <Link
              key={label}
              href={href}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide uppercase whitespace-nowrap transition-colors ${
                label === active
                  ? 'text-[var(--text-primary)] bg-blue-500/10'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <ThemeNavOption />
        </div>
      </div>
    </header>
  );
}
