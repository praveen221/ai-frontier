import type { MetadataRoute } from 'next';
import { getCompanies, getLayers } from '@/lib/data';

export const dynamic = 'force-static';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ai-frontier.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ['', '/taxonomy/', '/compare/', '/recent/'].map((path) => ({
    url: `${SITE_URL}${path || '/'}`,
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.6,
  }));

  const companies = getCompanies().map((company) => ({
    url: `${SITE_URL}/company/${company.id}/`,
    lastModified: company.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  const layers = getLayers().map((layer) => ({
    url: `${SITE_URL}/layer/${layer.id}/`,
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...layers, ...companies];
}
