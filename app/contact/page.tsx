import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getSiteSettings } from '@/lib/content';
import { T } from '@/components/LanguageContext';
import LeadForm from './LeadForm';
import { pageMetadata } from '@/lib/metadata';

export const metadata: Metadata = pageMetadata('Contact PrudentDubai | Talk to Our Dubai Property Advisory Team', 'Share your Dubai property requirements with the Prudent Dubai team. Direct guidance on off-plan, luxury areas, and acquisition.', '/contact');

export default async function ContactPage() {
  const site = await getSiteSettings();
  return (
    <>
      <section className="section page-intro">
        <div className="container">
          <span className="eyebrow"><T id="contact.eyebrow" /></span>
          <h1 className="display"><T id="contact.title" /></h1>
          <p className="lede"><T id="contact.lede" /></p>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container contact-grid">
          <aside className="contact-list">
            <div className="contact-item">
              <span><T id="contact.phone" /></span>
              <strong>{site.phone}</strong>
              <div className="button-row">
                <a
                  className="button button-primary"
                  href={`https://wa.me/${site.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <T id="contact.openWhatsapp" />
                </a>
              </div>
            </div>
            <div className="contact-item">
              <span><T id="contact.email" /></span>
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </div>
            <div className="contact-item">
              <span><T id="contact.office" /></span>
              <p>{site.dubaiOffice}</p>
            </div>
            <div className="contact-item">
              <span><T id="contact.privacyNotice" /></span>
              <p className="fine-print"><T id="contact.privacyDesc" /></p>
            </div>
          </aside>

          <Suspense fallback={<div className="lead-form"><p>Loading form…</p></div>}>
            <LeadForm whatsapp={site.whatsapp} />
          </Suspense>
        </div>
      </section>
    </>
  );
}
