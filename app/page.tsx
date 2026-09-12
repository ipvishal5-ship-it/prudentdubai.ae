/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { T } from '@/components/LanguageContext';
import { getAllArticles } from '@/lib/content';
import DestinationStrip from '@/components/DestinationStrip';
import { PROPERTY_TYPES } from '@/lib/areas';

export default async function HomePage() {
  const articles = await getAllArticles();
  return <>
    <section className="hero">
      <div className="container hero-layout">
        <div className="hero-copy">
          <span className="eyebrow"><T id="home.eyebrow" /></span>
          <h1 className="display"><T id="home.title" /></h1>
          <p className="lede"><T id="home.lede" /></p>
          <div className="button-row">
            <Link className="button button-primary" href="/contact"><T id="home.discuss" /></Link>
            <Link className="button button-secondary" href="/communities"><T id="home.explore" /></Link>
          </div>
          <p className="fine-print" style={{ marginTop: 18 }}><T id="home.disclaimer" /></p>
        </div>
        <div className="hero-visual">
          <img src="/demo/dubai-tower.jpg" alt="Dubai towers shown for location context" draggable={false} />
        </div>
      </div>
    </section>

    <section className="section">
      <div className="container">
        <h2 className="section-title"><T id="home.approachTitle" /></h2>
        <p className="lede"><T id="home.approachBody" /></p>
        <div className="editorial-grid">
          <div className="feature-panel">
            <h3><T id="home.startingTitle" /></h3>
            <p className="lede"><T id="home.startingBody" /></p>
            <Link className="button button-link" href="/contact"><T id="home.brief" /> <span className="directional">→</span></Link>
          </div>
          <div className="side-stack">
            <article className="mini-panel"><div className="icon-box">01</div><h3><T id="home.traceTitle" /></h3><p><T id="home.traceBody" /></p></article>
            <article className="mini-panel"><div className="icon-box">02</div><h3><T id="home.clarityTitle" /></h3><p><T id="home.clarityBody" /></p></article>
          </div>
        </div>
      </div>
    </section>

    <section className="section section-soft">
      <div className="container">
        <div className="section-heading">
          <div>
            <h2 className="section-title"><T id="home.helpTitle" /></h2>
            <p className="lede"><T id="home.helpBody" /></p>
          </div>
        </div>
        <div className="type-mosaic type-mosaic-tight">
          {PROPERTY_TYPES.filter((item) => item.filter).map((item) => (
            <Link className="type-tile" href={`/communities?type=${encodeURIComponent(item.filter)}#explore`} key={item.title}>
              <img src={item.image} alt="" />
              <span>
                <strong>{item.title}</strong>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>

    <section className="section">
      <div className="container">
        <div className="section-heading">
          <div>
            <h2 className="section-title"><T id="home.areasTitle" /></h2>
            <p className="lede"><T id="home.areasBody" /></p>
          </div>
          <Link className="button button-secondary" href="/communities"><T id="home.viewAllAreas" /></Link>
        </div>
        <DestinationStrip />
      </div>
    </section>

    <section className="section">
      <div className="container">
        <h2 className="section-title"><T id="home.processTitle" /></h2>
        <p className="lede section-intro-copy"><T id="home.processBody" /></p>
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
        <div className="section-heading">
          <div>
            <h2 className="section-title"><T id="home.guidesTitle" /></h2>
            <p className="lede"><T id="home.guidesBody" /></p>
          </div>
          <Link className="button button-secondary" href="/insights"><T id="home.allInsights" /></Link>
        </div>
        <div className="card-grid">
          {articles.slice(0, 3).map((item) => (
            <article className="article-card insight-card" key={item.id}>
              {item.imageUrl && (
                <Link href={`/insights/${item.slug}`} className="insight-card-image-wrap">
                  <img src={item.imageUrl} alt={item.title} className="insight-card-image" loading="lazy" />
                </Link>
              )}
              <div className="insight-card-body">
                <div className="article-meta-row">
                  <span className="category-pill">{item.category}</span>
                  {item.readTime && <span className="read-time">{item.readTime}</span>}
                </div>
                <h3>
                  <Link href={`/insights/${item.slug}`}>{item.title}</Link>
                </h3>
                <p>{item.excerpt}</p>
                <div className="article-card-footer">
                  <span className="fine-print">Updated {item.updatedAt}</span>
                  <Link className="button button-link" href={`/insights/${item.slug}`}>
                    <T id="home.read" /> <span className="directional">→</span>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  </>;
}
