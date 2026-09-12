import type { Metadata } from 'next';
import Link from 'next/link';
import { T } from '@/components/LanguageContext';
import { pageMetadata } from '@/lib/metadata';

export const metadata: Metadata = pageMetadata('Off-plan Property Guide', 'A practical, source-led guide to reviewing off-plan property in Dubai.', '/off-plan');

export default function OffPlanPage() {
  return (
    <>
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
