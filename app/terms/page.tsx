import type { Metadata } from 'next';
import { T } from '@/components/LanguageContext';
import { pageMetadata } from '@/lib/metadata';

export const metadata: Metadata = pageMetadata('Terms and Disclaimer', 'Terms for using Prudent Dubai property information, calculators, links and enquiry services.', '/terms');

export default function TermsPage() {
  return (
    <section className="section">
      <div className="container article-layout">
        <span className="eyebrow"><T id="terms.eyebrow" /></span>
        <h1 className="display"><T id="terms.title" /></h1>
        <p className="lede"><T id="terms.effective" /></p>

        <h2><T id="terms.sec1Title" /></h2>
        <p><T id="terms.sec1Text" /></p>

        <h2><T id="terms.sec2Title" /></h2>
        <p><T id="terms.sec2Text" /></p>

        <h2><T id="terms.sec3Title" /></h2>
        <p><T id="terms.sec3Text" /></p>

        <h2><T id="terms.sec4Title" /></h2>
        <p><T id="terms.sec4Text" /></p>

        <h2><T id="terms.sec5Title" /></h2>
        <p><T id="terms.sec5Text" /></p>

        <h2><T id="terms.sec6Title" /></h2>
        <p><T id="terms.sec6Text" /></p>
      </div>
    </section>
  );
}
