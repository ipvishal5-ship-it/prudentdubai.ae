import Image from 'next/image';
import Link from 'next/link';
import { getSiteSettings } from '@/lib/content';

export default async function Footer() {
  const site = await getSiteSettings();
  return <footer className="site-footer">
    <div className="container">
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="brand"><Image src="/brand/prudent-dubai-logo.png" alt="Prudent Dubai" width={189} height={54} /><span className="brand-word">DUBAI<br />PROPERTIES</span></div>
          <p style={{marginTop: 20}}>Clear property information and practical buying support for people considering Dubai. Every published opportunity includes its source and last verification date.</p>
          <p className="fine-print">A property-focused website from the Prudent Dubai group. Information is general and availability is subject to confirmation.</p>
        </div>
        <nav className="footer-links" aria-label="Explore">
          <h3>Explore</h3><Link href="/properties">Properties</Link><Link href="/off-plan">Off-plan guide</Link><Link href="/communities">Communities</Link><Link href="/insights">Insights</Link><Link href="/calculator">Cost calculator</Link>
        </nav>
        <nav className="footer-links" aria-label="Company and legal">
          <h3>Company</h3><Link href="/about">About</Link><Link href="/contact">Contact</Link><a href={`tel:${site.phone.replace(/\s/g,'')}`}>{site.phone}</a><a href={`mailto:${site.email}`}>{site.email}</a><Link href="/privacy">Privacy</Link><Link href="/terms">Terms & disclaimer</Link>
        </nav>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} Prudent Dubai Properties</span><span>{site.dubaiOffice}</span></div>
    </div>
  </footer>;
}
