/**
 * Helper utility to determine whether a given pathname belongs to the admin panel.
 * Works seamlessly in Server Components, Client Components, SSR, and client-side transitions.
 */
export function isAdminRoute(pathname?: string | null): boolean {
  if (typeof window !== 'undefined') {
    if (
      (window as unknown as { __IS_ADMIN_PANEL?: boolean }).__IS_ADMIN_PANEL ||
      document.documentElement.getAttribute('data-admin-panel') === 'true' ||
      document.body?.classList?.contains('is-admin-route')
    ) {
      return true;
    }
  }

  const rawPath = pathname ?? (typeof window !== 'undefined' ? window.location.pathname : '');
  if (!rawPath) return false;

  const clean = rawPath.toLowerCase().split('?')[0].split('#')[0];
  const segments = clean.split('/').filter(Boolean);
  if (segments.length === 0) return false;

  const first = segments[0];

  // Primary panel paths and prefixes
  if (
    first === 'adminshobhit' ||
    first === 'shobhitadmin' ||
    first === 'admin' ||
    first.startsWith('admin') ||
    first.endsWith('admin') ||
    first.includes('admin') ||
    first === 'panel'
  ) {
    return true;
  }

  // Any URL segment matching admin keywords
  if (segments.some(s => s === 'admin' || s === 'adminshobhit' || s === 'shobhitadmin')) {
    return true;
  }

  const envPath = (process.env.NEXT_PUBLIC_ADMIN_PANEL_PATH || '').toLowerCase().trim();
  if (envPath && first === envPath) {
    return true;
  }

  return false;
}
