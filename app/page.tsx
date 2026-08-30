/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import PropertyCard from '@/components/PropertyCard';
import { T } from '@/components/LanguageContext';
import { getAllArticles, getAllProperties } from '@/lib/content';

export default async function HomePage() {
  const [properties, articles] = await Promise.all([getAllProperties(), getAllArticles()]);
  const featured = properties.filter(item => item.featured).slice(0, 3);
  return <>
    <section className="hero">
      <div className="container hero-layout">
        <div className="hero-copy">
          <span className="eyebrow"><T id="home.eyebrow" /></span>
          <h1 className="display"><T id="home.title" /></h1>
          <p className="lede"><T id="home.lede" /></p>
          <div className="button-row"><Link className="button button-primary" href="/properties"><T id="home.explore" /></Link><Link className="button button-secondary" href="/contact"><T id="home.discuss" /></Link></div>
          <p className="fine-print" style={{marginTop:18}}><T id="home.disclaimer" /></p>
        </div>
        <div className="hero-visual">
          <img src="/demo/dubai-tower.jpg" alt="Dubai towers shown for location context" draggable={false} />
          <div className="hero-note"><strong><T id="home.noteTitle" /></strong><span className="fine-print"><T id="home.noteBody" /></span></div>
        </div>
      </div>
    </section>
    <div className="trust-strip"><div className="container trust-items"><span><T id="home.trust1" /></span><span><T id="home.trust2" /></span><span><T id="home.trust3" /></span><span><T id="home.trust4" /></span></div></div>

    <section className="section">
      <div className="container">
        <span className="eyebrow"><T id="home.approach" /></span><h2 className="section-title"><T id="home.approachTitle" /></h2>
        <p className="lede"><T id="home.approachBody" /></p>
        <div className="editorial-grid">
          <div className="feature-panel"><span className="eyebrow"><T id="home.starting" /></span><h3><T id="home.startingTitle" /></h3><p className="lede"><T id="home.startingBody" /></p><Link className="button button-link" href="/contact"><T id="home.brief" /> <span className="directional">→</span></Link></div>
          <div className="side-stack">
            <article className="mini-panel"><div className="icon-box">01</div><h3><T id="home.traceTitle" /></h3><p><T id="home.traceBody" /></p></article>
            <article className="mini-panel"><div className="icon-box">02</div><h3><T id="home.clarityTitle" /></h3><p><T id="home.clarityBody" /></p></article>
          </div>
        </div>
      </div>
    </section>

    <section className="section section-soft">
      <div className="container">
        <div className="section-heading"><div><span className="eyebrow"><T id="home.demoEyebrow" /></span><h2 className="section-title"><T id="home.demoTitle" /></h2><p className="lede"><T id="home.demoNotice" /></p></div><Link className="button button-secondary" href="/properties"><T id="home.viewAll" /></Link></div>
        <div className="card-grid">
          {featured.map(item => <PropertyCard key={item.id} property={item} />)}
          {featured.length === 0 && <div className="empty-state"><span className="eyebrow">Verification in progress</span><h3>Public listings will appear after source review.</h3><p>We are intentionally not displaying sample inventory as live property. Tell us what you need and we can begin with a requirement-led search.</p><Link className="button button-primary" href="/contact">Share your requirements</Link></div>}
        </div>
      </div>
    </section>

    <section className="section visual-story">
      <div className="container visual-story-layout">
        <div><span className="eyebrow"><T id="home.approach" /></span><h2 className="section-title"><T id="home.visualTitle" /></h2><p className="lede"><T id="home.visualBody" /></p></div>
        <div className="visual-story-grid" data-reveal><img src="/demo/city-apartment.jpg" alt="Modern apartment interior, illustrative" draggable={false} /><img src="/demo/villa-exterior.jpg" alt="Modern villa exterior, illustrative" draggable={false} /><img src="/demo/pool-villa.jpg" alt="Villa pool, illustrative" draggable={false} /></div>
      </div>
    </section>

    <section className="section">
      <div className="container">
        <span className="eyebrow"><T id="home.process" /></span><h2 className="section-title"><T id="home.processTitle" /></h2>
        <div className="process">
          <article className="process-step"><h3><T id="home.step1" /></h3><p><T id="home.step1Body" /></p></article>
          <article className="process-step"><h3><T id="home.step2" /></h3><p><T id="home.step2Body" /></p></article>
          <article className="process-step"><h3><T id="home.step3" /></h3><p><T id="home.step3Body" /></p></article>
          <article className="process-step"><h3><T id="home.step4" /></h3><p><T id="home.step4Body" /></p></article>
        </div>
      </div>
    </section>

    <section className="section section-soft">
      <div className="container">
        <div className="section-heading"><div><span className="eyebrow"><T id="home.guides" /></span><h2 className="section-title"><T id="home.guidesTitle" /></h2></div><Link className="button button-secondary" href="/insights"><T id="home.allInsights" /></Link></div>
        <div className="card-grid">{articles.slice(0,3).map(item => <article className="article-card" key={item.id}><span className="eyebrow">{item.category}</span><h3>{item.title}</h3><p>{item.excerpt}</p><Link className="button button-link" href={`/insights/${item.slug}`}><T id="home.read" /> <span className="directional">→</span></Link></article>)}</div>
      </div>
    </section>
  </>;
}
