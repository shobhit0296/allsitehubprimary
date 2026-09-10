import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/siteConfig';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: ['Googlebot', 'Bingbot'],
        allow: '/',
        disallow: ['/api/', '/*/login'],
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/*/login', '/*?*'],
      },
      {
        userAgent: [
          'Bytespider',
          'PetalBot',
          'SemrushBot',
          'AhrefsBot',
          'MJ12bot',
          'DotBot',
          'GPTBot',
          'CCBot',
          'ClaudeBot',
          'anthropic-ai',
          'Scrapy',
        ],
        disallow: ['/'],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
