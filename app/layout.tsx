import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CurrencyProvider } from '@/components/CurrencyContext';
import { LanguageProvider } from '@/components/LanguageContext';
import MotionProvider from '@/components/MotionProvider';
import { getSiteSettings } from '@/lib/content';

export const metadata: Metadata = {
  metadataBase: new URL('https://prudentdubai.ae'),
  title: { default: 'Prudent Dubai Properties | Clear Dubai Property Guidance', template: '%s | Prudent Dubai Properties' },
  description: 'Prudent Dubai Properties provides direct property advisory across Dubai. Share your preferred area, property type, and goals, and our team will discuss pricing directly with you.',
  icons: { icon: '/brand/smalllogo.png', apple: '/brand/smalllogo.png' },
  openGraph: { title: 'Prudent Dubai Properties', description: 'Your Dubai property partner for area selection, home categories, and direct buying support.', url: 'https://prudentdubai.ae', siteName: 'Prudent Dubai Properties', type: 'website', locale: 'en_AE' },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const site = await getSiteSettings();
  const schema = {
    '@context': 'https://schema.org',
    '@type': ['RealEstateAgent', 'Organization'],
    name: 'Prudent Dubai Properties',
    description: 'Advisory and consulting for property buyers, off-plan projects, and luxury residential developments in Dubai.',
    url: 'https://prudentdubai.ae',
    logo: 'https://prudentdubai.ae/brand/prudentlogo.png',
    image: 'https://prudentdubai.ae/brand/og-image.png',
    parentOrganization: { '@type': 'Organization', name: 'PrudentDubai', url: site.sisterWebsite },
    address: { '@type': 'PostalAddress', streetAddress: 'Westburry Tower, Business Bay', addressLocality: 'Dubai', addressCountry: 'AE' },
    telephone: site.phone,
    email: site.email,
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: site.phone,
        contactType: 'sales',
        areaServed: 'AE',
        availableLanguage: ['English', 'Arabic', 'Hindi'],
      },
    ],
  };
  return <html lang="en" dir="ltr" suppressHydrationWarning><head><meta name="theme-color" content="#FAFAF9" /><script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(schema)}} /></head>
    <body><LanguageProvider><CurrencyProvider><MotionProvider /><Navbar /><main id="main-content">{children}</main><Footer /></CurrencyProvider></LanguageProvider></body></html>;
}
