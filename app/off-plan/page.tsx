import type { Metadata } from 'next';
import Link from 'next/link';
import { T } from '@/components/LanguageContext';
import { pageMetadata } from '@/lib/metadata';

export const metadata: Metadata = pageMetadata(
  'Off-Plan Property in Dubai Guide 2026 | Developer Due Diligence & Escrow',
  'Source-led investor guide to purchasing off-plan property in Dubai. Learn about RERA project registration, DLD escrow accounts, payment plans, and handover inspection.',
  '/off-plan',
  undefined,
  [
    'off plan property dubai',
    'buy off plan dubai',
    'dubai rera escrow account check',
    'off plan payment plans dubai',
    'dubai land department oqood',
  ]
);

export default function OffPlanPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'HowTo',
        name: 'How to Buy Off-Plan Property Safely in Dubai',
        description: 'Key verification steps for purchasing off-plan real estate with RERA and DLD compliance in Dubai.',
        step: [
          {
            '@type': 'HowToStep',
            position: 1,
            name: 'Verify RERA Project Registration & Escrow Account',
            text: 'Ensure the project is officially registered on Dubai REST with an active, regulated escrow account prior to making any payment.',
          },
          {
            '@type': 'HowToStep',
            position: 2,
            name: 'Audit the Developer Track Record',
            text: 'Review the developer past completions, handover timeliness, build quality, and financial stability.',
          },
          {
            '@type': 'HowToStep',
            position: 3,
            name: 'Review Payment Milestones & Oqood Registration',
            text: 'Verify construction-linked payment milestones and secure Oqood pre-title registration via the Dubai Land Department.',
          },
          {
            '@type': 'HowToStep',
            position: 4,
            name: 'Conduct Pre-Handover Snagging Inspection',
            text: 'Perform a comprehensive technical inspection before final handover payment to document and rectify defects under warranty.',
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
            item: 'https://prudentspaces.ae',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Off-Plan Property Guide',
            item: 'https://prudentspaces.ae/off-plan',
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <section className="section page-intro">
        <div className="container">
          <span className="eyebrow"><T id="offplan.eyebrow" /></span>
          <h1 className="display"><T id="offplan.title" /></h1>
          <p className="lede"><T id="offplan.lede" /></p>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container">
          <h2 className="section-title"><T id="offplan.checksTitle" /></h2>
          <p className="lede section-intro-copy"><T id="offplan.checksLede" /></p>
          <div className="process">
            <article className="process-step">
              <h3><T id="offplan.check1Title" /></h3>
              <p><T id="offplan.check1Body" /></p>
            </article>
            <article className="process-step">
              <h3><T id="offplan.check2Title" /></h3>
              <p><T id="offplan.check2Body" /></p>
            </article>
            <article className="process-step">
              <h3><T id="offplan.check3Title" /></h3>
              <p><T id="offplan.check3Body" /></p>
            </article>
            <article className="process-step">
              <h3><T id="offplan.check4Title" /></h3>
              <p><T id="offplan.check4Body" /></p>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="info-grid">
            <article className="info-card">
              <h3><T id="offplan.dldTitle" /></h3>
              <p><T id="offplan.dldBody" /></p>
              <a
                className="button button-link"
                href="https://dubailand.gov.ae/en/open-data/real-estate-data/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <T id="offplan.dldButton" />
              </a>
            </article>
            <article className="info-card">
              <h3><T id="offplan.handoverTitle" /></h3>
              <p><T id="offplan.handoverBody" /></p>
            </article>
            <article className="info-card">
              <h3><T id="offplan.shortlistTitle" /></h3>
              <p><T id="offplan.shortlistBody" /></p>
              <Link className="button button-link" href="/contact">
                <T id="offplan.briefButton" />
              </Link>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
