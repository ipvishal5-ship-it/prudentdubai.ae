import Image from 'next/image';
import Link from 'next/link';
import { getSiteSettings } from '@/lib/content';
import { T } from './LanguageContext';

export default async function Footer() {
  const site = await getSiteSettings();
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="brand">
              <Image src="/brand/prudentlogo.png" alt="Prudent Spaces" width={160} height={46} />
            </div>
            <p style={{ marginTop: 20 }}>
              <T id="footer.summary" />
            </p>
            <p className="fine-print" style={{ marginTop: 14, color: 'var(--muted)', fontSize: '0.82rem', lineHeight: 1.5 }}>
              <T id="footer.compliance" />
            </p>
          </div>
          <nav className="footer-links" aria-label="Explore">
            <h3><T id="footer.explore" /></h3>
            <Link href="/communities"><T id="nav.areas" /></Link>
            <Link href="/off-plan"><T id="nav.offPlan" /></Link>
            <Link href="/insights"><T id="nav.insights" /></Link>
            <Link href="/calculator"><T id="footer.calculator" /></Link>
          </nav>
          <nav className="footer-links" aria-label="Company and legal">
            <h3><T id="footer.company" /></h3>
            <Link href="/about"><T id="nav.about" /></Link>
            <Link href="/contact"><T id="nav.contact" /></Link>
            <a href={`tel:${site.phone.replace(/\s/g, '')}`}>{site.phone}</a>
            <a href={`mailto:${site.email}`}>{site.email}</a>
            <Link href="/privacy"><T id="footer.privacy" /></Link>
            <Link href="/terms"><T id="footer.terms" /></Link>
          </nav>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} <T id="footer.copyright" /></span>
          <span>{site.dubaiOffice}</span>
        </div>
      </div>
    </footer>
  );
}
