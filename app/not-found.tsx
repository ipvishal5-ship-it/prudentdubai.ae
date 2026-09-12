import Link from 'next/link';
import { T } from '@/components/LanguageContext';

export default function NotFound() {
  return (
    <section className="section">
      <div className="container article-layout">
        <span className="eyebrow"><T id="notfound.eyebrow" /></span>
        <h1 className="display"><T id="notfound.title" /></h1>
        <p className="lede"><T id="notfound.lede" /></p>
        <div className="button-row">
          <Link className="button button-primary" href="/">
            <T id="notfound.home" />
          </Link>
          <Link className="button button-secondary" href="/contact">
            <T id="notfound.contact" />
          </Link>
        </div>
      </div>
    </section>
  );
}
