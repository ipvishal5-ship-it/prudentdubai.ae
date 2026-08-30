import Image from 'next/image';
import Link from 'next/link';
import { getSiteSettings } from '@/lib/content';
import { T } from './LanguageContext';

export default async function Footer() {
  const site = await getSiteSettings();
  return <footer className="site-footer">
    <div className="container">
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="brand"><Image src="/brand/prudent-dubai-logo.png" alt="Prudent Dubai" width={189} height={54} /><span className="brand-word">DUBAI<br />PROPERTIES</span></div>
          <p style={{marginTop: 20}}><T id="footer.summary" /></p>
          <p className="fine-print"><T id="footer.demo" /></p>
        </div>
        <nav className="footer-links" aria-label="Explore">
          <h3><T id="footer.explore" /></h3><Link href="/properties"><T id="nav.properties" /></Link><Link href="/off-plan"><T id="nav.offPlan" /></Link><Link href="/communities"><T id="nav.communities" /></Link><Link href="/insights"><T id="nav.insights" /></Link><Link href="/calculator">Cost calculator</Link>
        </nav>
        <nav className="footer-links" aria-label="Company and legal">
          <h3><T id="footer.company" /></h3><Link href="/about"><T id="nav.about" /></Link><Link href="/contact"><T id="nav.contact" /></Link><a href={`tel:${site.phone.replace(/\s/g,'')}`}>{site.phone}</a><a href={`mailto:${site.email}`}>{site.email}</a><Link href="/privacy">Privacy</Link><Link href="/terms">Terms & disclaimer</Link>
        </nav>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} Prudent Dubai Properties</span><span>{site.dubaiOffice}</span></div>
    </div>
  </footer>;
}
