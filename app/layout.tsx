import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
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
  alternates: {
    canonical: 'https://prudentdubai.ae',
    languages: {
      'en-AE': 'https://prudentdubai.ae',
      'ar-AE': 'https://prudentdubai.ae',
      'x-default': 'https://prudentdubai.ae',
    },
  },
  robots: { index: true, follow: true },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const site = await getSiteSettings();
  const schemaGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://prudentdubai.ae/#website',
        url: 'https://prudentdubai.ae',
        name: 'Prudent Dubai Properties',
        description: 'Dubai luxury real estate advisory, off-plan investment guidance, and community analytics.',
        publisher: { '@id': 'https://prudentdubai.ae/#organization' },
        inLanguage: 'en-AE',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://prudentdubai.ae/communities?q={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': ['RealEstateAgent', 'Organization'],
        '@id': 'https://prudentdubai.ae/#organization',
        name: 'Prudent Dubai Properties',
        description: 'Advisory and consulting for property buyers, off-plan projects, and luxury residential developments in Dubai.',
        url: 'https://prudentdubai.ae',
        logo: 'https://prudentdubai.ae/brand/prudentlogo.png',
        image: 'https://prudentdubai.ae/brand/og-image.png',
        parentOrganization: { '@type': 'Organization', name: 'PrudentDubai', url: site.sisterWebsite },
        priceRange: 'AED 1,000,000 - AED 100,000,000+',
        currenciesAccepted: 'AED, USD, EUR, GBP',
        paymentAccepted: 'Bank Transfer, Cheque, Mortgage',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Westburry Tower, Business Bay',
          addressLocality: 'Dubai',
          addressRegion: 'Dubai',
          addressCountry: 'AE',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 25.1867,
          longitude: 55.2744,
        },
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            opens: '09:00',
            closes: '20:00',
          },
        ],
        areaServed: [
          { '@type': 'AdministrativeArea', name: 'Dubai' },
          { '@type': 'Country', name: 'United Arab Emirates' },
        ],
        telephone: site.phone,
        email: site.email,
        contactPoint: [
          {
            '@type': 'ContactPoint',
            telephone: site.phone,
            contactType: 'sales',
            areaServed: 'AE',
            availableLanguage: ['English', 'Arabic', 'Hindi', 'Russian', 'French'],
          },
        ],
      },
    ],
  };

  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#FAFAF9" />
        <meta name="geo.region" content="AE-DU" />
        <meta name="geo.placename" content="Dubai" />
        <meta name="geo.position" content="25.1867;55.2744" />
        <meta name="ICBM" content="25.1867, 55.2744" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaGraph) }}
        />
      </head>
      <body>
        <LanguageProvider>
          <CurrencyProvider>
            <MotionProvider />
            <Navbar />
            <main id="main-content">{children}</main>
            <Footer />
            <FloatingWhatsApp />
          </CurrencyProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
