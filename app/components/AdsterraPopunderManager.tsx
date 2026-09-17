'use client';

/**
 * AdsterraPopunderManager — Neutralized.
 * Popunder redirection scripts that attach to document.body break React 19 singletons
 * and result in fatal white screen crashes.
 */
export default function AdsterraPopunderManager() {
  return null;
}
