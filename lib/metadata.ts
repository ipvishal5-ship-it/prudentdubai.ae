import type { Metadata } from 'next';

const BASE_URL = 'https://prudentdubai.ae';
const DEFAULT_OG_IMAGE = `${BASE_URL}/brand/og-image.png`;

export function pageMetadata(
  title: string,
  description: string,
  path: string,
  image?: string,
): Metadata {
  const url = `${BASE_URL}${path}`;
  const ogImage = image ?? DEFAULT_OG_IMAGE;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: 'PrudentDubai Properties',
      type: 'website',
      locale: 'en_AE',
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}
