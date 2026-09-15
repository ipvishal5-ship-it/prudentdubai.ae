import type { Metadata } from 'next';

const BASE_URL = 'https://prudentdubai.ae';
const DEFAULT_OG_IMAGE = `${BASE_URL}/brand/og-image.png`;

export const DEFAULT_KEYWORDS = [
  'Dubai real estate',
  'luxury property Dubai',
  'off-plan properties Dubai',
  'Dubai property mortgage calculator',
  'Dubai Golden Visa real estate',
  'Dubai Marina apartments',
  'Downtown Dubai penthouses',
  'Palm Jumeirah villas',
  'Dubai land department fees',
  'property investment UAE',
  'Prudent Dubai Properties',
];

export function pageMetadata(
  title: string,
  description: string,
  path: string,
  image?: string,
  extraKeywords: string[] = []
): Metadata {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${BASE_URL}${cleanPath}`;
  const ogImage = image ?? DEFAULT_OG_IMAGE;
  const keywords = Array.from(new Set([...DEFAULT_KEYWORDS, ...extraKeywords]));

  return {
    title,
    description,
    keywords,
    category: 'Real Estate',
    authors: [{ name: 'Prudent Dubai Advisory Team', url: `${BASE_URL}/about` }],
    creator: 'Prudent Dubai Properties',
    publisher: 'Prudent Dubai Properties',
    alternates: {
      canonical: url,
      languages: {
        'en-AE': url,
        'ar-AE': url,
        'x-default': url,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Prudent Dubai Properties',
      type: 'website',
      locale: 'en_AE',
      alternateLocale: ['ar_AE'],
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${title} - Prudent Dubai Properties`,
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
      site: '@prudentdubai',
      creator: '@prudentdubai',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}
