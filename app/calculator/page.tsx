import type { Metadata } from 'next';
import PropertyCalculator from './PropertyCalculator';
import { pageMetadata } from '@/lib/metadata';

export const metadata: Metadata = pageMetadata(
  'Dubai Property Cost & Mortgage Calculator 2026 | DLD Fees & Net Yields',
  'Free interactive Dubai property calculator. Calculate 4% DLD transfer fees, trustee charges, mortgage repayments based on UAE EIBOR rates, and net rental yields.',
  '/calculator',
  undefined,
  [
    'dubai mortgage calculator',
    'dubai property buying cost calculator',
    'dubai land department 4 fee calculator',
    'dubai real estate roi calculator',
    'uae mortgage down payment rules',
  ]
);

export default function CalculatorPage() {
  const calculatorSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'Prudent Dubai Property & Mortgage Calculator',
        operatingSystem: 'All',
        applicationCategory: 'FinanceApplication',
        url: 'https://prudentdubai.ae/calculator',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'AED',
        },
        description:
          'Calculate official Dubai Land Department fees, mortgage repayments, and net rental yield before purchasing real estate in Dubai.',
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'What are the standard government buying fees for Dubai property?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'The primary fees include the 4% Dubai Land Department (DLD) transfer fee (+ AED 580 admin fee), the Registration Trustee fee (AED 2,000 + 5% VAT for properties under AED 500,000; AED 4,000 + 5% VAT for properties at or above AED 500,000), agency fee (typically 2% + VAT), and mortgage registration fees if financed (0.25% of loan amount + AED 290 admin fee).',
            },
          },
          {
            '@type': 'Question',
            name: 'What is the minimum mortgage down payment in Dubai for expats and UAE nationals?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Under UAE Central Bank regulations, for properties valued up to AED 5 million, expatriates require a minimum 20% down payment (80% LTV), while UAE nationals require a minimum 15% down payment (85% LTV). For properties above AED 5 million, expatriates require 30% and UAE nationals require 25%. Non-resident buyers typically need 35% to 40% down payment.',
            },
          },
          {
            '@type': 'Question',
            name: 'How is net rental yield calculated in Dubai?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Net rental yield is calculated as (Annual Rental Income - Annual Operating Expenses such as Service Charges, Maintenance, and Management Fees) divided by the Total Purchase Cost (Property Price + Acquisition Fees) multiplied by 100. Dubai yields generally range from 6% to 9% depending on location and property tier.',
            },
          },
        ],
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://prudentdubai.ae',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Property Calculator',
            item: 'https://prudentdubai.ae/calculator',
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorSchema) }}
      />
      <PropertyCalculator />
    </>
  );
}
