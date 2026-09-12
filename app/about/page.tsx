import type { Metadata } from 'next';
import Link from 'next/link';
import { getSiteSettings } from '@/lib/content';
import { T } from '@/components/LanguageContext';
import { pageMetadata } from '@/lib/metadata';

export const metadata: Metadata = pageMetadata(
  'About PrudentDubai | Dubai Real Estate & Business Advisory',
  'Strategic Dubai real estate advisory, off-plan analysis, corporate tax structuring, and UAE Golden Visa solutions by PrudentDubai.',
  '/about'
);

export default async function AboutPage() {
  const site = await getSiteSettings();
  return (
    <>
      {/* 1. Hero Intro */}
      <section className="section page-intro">
        <div className="container">
          <span className="eyebrow"><T id="about.eyebrow" /></span>
          <h1 className="display"><T id="about.title" /></h1>
          <p className="lede"><T id="about.lede" /></p>
        </div>
      </section>

      {/* 2. What We Do — honest service summary */}
      <section className="section section-soft">
        <div className="container">
          <div className="about-intro-cols">
            <div className="about-intro-col">
              <h2 className="section-title"><T id="about.approachTitle" /></h2>
            </div>
            <div className="about-intro-col">
              <p style={{ fontSize: '1.05rem', lineHeight: 1.75, color: 'var(--ink)' }}>
                <T id="about.approachBody" />
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Investment Pillars Matrix */}
      <section className="section">
        <div className="container">
          <div className="section-head text-center">
            <h2 className="section-title"><T id="about.pillarsTitle" /></h2>
            <p className="lede" style={{ maxWidth: 720, margin: '12px auto 0' }}><T id="about.pillarsLede" /></p>
          </div>
          <div className="pillars-grid" style={{ marginTop: 40 }}>
            <article className="info-card pillar-card">
              <div className="pillar-label">01</div>
              <h3><T id="about.pillar1Title" /></h3>
              <p><T id="about.pillar1Body" /></p>
            </article>
            <article className="info-card pillar-card">
              <div className="pillar-label">02</div>
              <h3><T id="about.pillar2Title" /></h3>
              <p><T id="about.pillar2Body" /></p>
            </article>
            <article className="info-card pillar-card">
              <div className="pillar-label">03</div>
              <h3><T id="about.pillar3Title" /></h3>
              <p><T id="about.pillar3Body" /></p>
            </article>
            <article className="info-card pillar-card">
              <div className="pillar-label">04</div>
              <h3><T id="about.pillar4Title" /></h3>
              <p><T id="about.pillar4Body" /></p>
            </article>
          </div>
        </div>
      </section>

      {/* 4. Why Investors Choose PrudentDubai */}
      <section className="section section-soft">
        <div className="container">
          <div className="editorial-grid editorial-grid-balanced">
            <div className="feature-panel">
              <h2 className="section-title"><T id="about.whyTitle" /></h2>
              <p><T id="about.approachBody" /></p>
            </div>
            <div className="side-stack">
              <article className="mini-panel">
                <div className="icon-box">01</div>
                <h3><T id="about.why1Title" /></h3>
                <p><T id="about.why1Body" /></p>
              </article>
              <article className="mini-panel">
                <div className="icon-box">02</div>
                <h3><T id="about.why2Title" /></h3>
                <p><T id="about.why2Body" /></p>
              </article>
              <article className="mini-panel">
                <div className="icon-box">03</div>
                <h3><T id="about.why3Title" /></h3>
                <p><T id="about.why3Body" /></p>
              </article>
              <article className="mini-panel">
                <div className="icon-box">04</div>
                <h3><T id="about.why4Title" /></h3>
                <p><T id="about.why4Body" /></p>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PrudentDubai.com Group Ecosystem Banner */}
      <section className="section">
        <div className="container">
          <div className="about-ecosystem-banner">
            <div className="ecosystem-copy">
              <span className="eyebrow" style={{ color: 'var(--gold-deep)', letterSpacing: '0.08em', fontWeight: 800 }}>GROUP SYNERGY</span>
              <h2 style={{ marginTop: 8, color: '#ffffff' }}><T id="about.ecosystemTitle" /></h2>
              <p style={{ marginTop: 12, color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.6 }}><T id="about.ecosystemBody" /></p>
            </div>
            <div className="ecosystem-action">
              <a
                className="button button-primary"
                href={site.sisterWebsite}
                target="_blank"
                rel="noopener noreferrer"
                style={{ whiteSpace: 'nowrap', padding: '14px 28px' }}
              >
                <T id="about.visitSister" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Step-by-Step Advisory Journey */}
      <section className="section section-soft">
        <div className="container">
          <h2 className="section-title text-center"><T id="about.stepsTitle" /></h2>
          <div className="about-steps-grid" style={{ marginTop: 36 }}>
            <article className="mini-panel step-card">
              <div className="icon-box">01</div>
              <h3><T id="about.step1Title" /></h3>
              <p><T id="about.step1Body" /></p>
            </article>
            <article className="mini-panel step-card">
              <div className="icon-box">02</div>
              <h3><T id="about.step2Title" /></h3>
              <p><T id="about.step2Body" /></p>
            </article>
            <article className="mini-panel step-card">
              <div className="icon-box">03</div>
              <h3><T id="about.step3Title" /></h3>
              <p><T id="about.step3Body" /></p>
            </article>
            <article className="mini-panel step-card">
              <div className="icon-box">04</div>
              <h3><T id="about.step4Title" /></h3>
              <p><T id="about.step4Body" /></p>
            </article>
          </div>
        </div>
      </section>

      {/* 7. Office Location & Call to Action */}
      <section className="section">
        <div className="container">
          <div className="hq-showcase">
            <div className="hq-header">
              <h2 className="section-title"><T id="about.officesTitle" /></h2>
              <p className="lede"><T id="about.officesLede" /></p>
            </div>
            <div className="hq-card">
              <div className="hq-badge">DUBAI OFFICE</div>
              <h3 className="hq-office-title"><T id="about.dubai" /></h3>
              <p className="hq-address">{site.dubaiOffice}</p>
              <div className="hq-contacts">
                <a href={`mailto:${site.email}`} className="hq-contact-pill">
                  <span className="hq-contact-label">Email:</span> {site.email}
                </a>
                <span className="hq-contact-divider" aria-hidden="true">|</span>
                <a href={`tel:${site.phone.replace(/\s/g, '')}`} className="hq-contact-pill">
                  <span className="hq-contact-label">Phone:</span> {site.phone}
                </a>
              </div>
            </div>
            <div className="hq-actions">
              <a
                className="button button-secondary"
                href={site.sisterWebsite}
                target="_blank"
                rel="noopener noreferrer"
              >
                <T id="about.visitSister" />
              </a>
              <Link className="button button-primary" href="/contact">
                <T id="about.talkTeam" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
