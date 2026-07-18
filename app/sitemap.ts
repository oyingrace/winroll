import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://winroll.example.com';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: 'always', priority: 1 },
    { url: `${SITE_URL}/how-it-works`, changeFrequency: 'monthly', priority: 0.5 },
  ];
}
