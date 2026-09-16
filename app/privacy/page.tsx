import type { Metadata } from 'next';
import Link from 'next/link';
import { T } from '@/components/LanguageContext';
import { pageMetadata } from '@/lib/metadata';

export const metadata: Metadata = pageMetadata('Privacy Policy', 'How Prudent Spaces collects, uses, protects and retains information submitted through this website.', '/privacy');

export default function PrivacyPage() {
  return (
    <section className="section">
      <div className="container article-layout">
        <span className="eyebrow"><T id="privacy.eyebrow" /></span>
        <h1 className="display"><T id="privacy.title" /></h1>
        <p className="lede"><T id="privacy.effective" /></p>

        <h2><T id="privacy.sec1Title" /></h2>
        <p><T id="privacy.sec1Text" /></p>

        <h2><T id="privacy.sec2Title" /></h2>
        <p><T id="privacy.sec2Text" /></p>

        <h2><T id="privacy.sec3Title" /></h2>
        <p><T id="privacy.sec3Text" /></p>

        <h2><T id="privacy.sec4Title" /></h2>
        <p>
          <T id="privacy.sec4Text" />
        </p>

        <h2><T id="privacy.sec5Title" /></h2>
        <p><T id="privacy.sec5Text" /></p>

        <Link className="button button-link" href="/contact">
          <T id="privacy.contactUs" />
        </Link>
      </div>
    </section>
  );
}
