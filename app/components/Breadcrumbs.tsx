import Link from 'next/link';
import JsonLd from './JsonLd';
import { siteConfig } from '@/lib/siteConfig';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  const fullItems: BreadcrumbItem[] = [{ label: 'Home', href: '/' }, ...items];

  const jsonLdSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: fullItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: item.href ? (item.href.startsWith('http') ? item.href : `${siteConfig.url}${item.href}`) : undefined,
    })),
  };

  return (
    <>
      <JsonLd schema={jsonLdSchema} />
      <nav aria-label="Breadcrumb" className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-4 pb-2">
        <ol className="flex items-center flex-wrap gap-1.5 text-xs text-[var(--text-muted)]">
          {fullItems.map((item, index) => {
            const isLast = index === fullItems.length - 1;
            return (
              <li key={index} className="flex items-center gap-1.5">
                {index > 0 && <span className="opacity-40 select-none">/</span>}
                {isLast || !item.href ? (
                  <span className="text-[var(--text-secondary)] font-medium truncate max-w-[200px] sm:max-w-xs" aria-current="page">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="hover:text-[var(--text-primary)] transition-colors underline-offset-2 hover:underline"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
