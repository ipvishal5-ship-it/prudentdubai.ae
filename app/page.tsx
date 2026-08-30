import Link from 'next/link';
import PropertyCard from '@/components/PropertyCard';
import { getAllArticles, getAllProperties } from '@/lib/content';

export default async function HomePage() {
  const [properties, articles] = await Promise.all([getAllProperties(), getAllArticles()]);
  const featured = properties.filter(item => item.featured).slice(0, 3);
  return <>
    <section className="hero">
      <div className="container hero-layout">
        <div className="hero-copy">
          <span className="eyebrow">Dubai property, explained clearly</span>
          <h1 className="display">A considered way to explore property in Dubai.</h1>
          <p className="lede">Prudent Dubai Properties helps buyers compare opportunities, understand the process and ask better questions before committing. Published listings carry a named source and a visible verification date.</p>
          <div className="button-row"><Link className="button button-primary" href="/properties">Explore verified opportunities</Link><Link className="button button-secondary" href="/contact">Discuss your requirements</Link></div>
          <p className="fine-print" style={{marginTop:18}}>No promised returns. No invented availability. Property details remain subject to written confirmation from the relevant seller or developer.</p>
        </div>
        <div className="hero-visual">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=85" alt="Dubai skyline, shown for location context" />
          <div className="hero-note"><strong>Source-led publishing</strong><span className="fine-print">Every public opportunity identifies where its information came from and when it was checked.</span></div>
        </div>
      </div>
    </section>
    <div className="trust-strip"><div className="container trust-items"><span>Clear cost context</span><span>Source and date on listings</span><span>Human buying support</span><span>Dubai, Sharjah and Mumbai presence</span></div></div>

    <section className="section">
      <div className="container">
        <span className="eyebrow">The Prudent approach</span><h2 className="section-title">Information before persuasion.</h2>
        <p className="lede">The website is designed around the decisions a buyer actually needs to make—not around exaggerated market claims.</p>
        <div className="editorial-grid">
          <div className="feature-panel"><span className="eyebrow">A better starting point</span><h3>Begin with purpose, budget and timing—not a random project.</h3><p className="lede">We organise the conversation around whether you are buying a home, planning a longer-term investment or comparing ready and off-plan options.</p><Link className="button button-link" href="/contact">Start a requirement brief →</Link></div>
          <div className="side-stack">
            <article className="mini-panel"><div className="icon-box">01</div><h3>Traceable opportunities</h3><p>Developer or seller, information source and last-checked date form part of each published record.</p></article>
            <article className="mini-panel"><div className="icon-box">02</div><h3>Commercial clarity</h3><p>Price, payment schedule, handover statement and key limitations are presented in a consistent format.</p></article>
          </div>
        </div>
      </div>
    </section>

    <section className="section section-soft">
      <div className="container">
        <div className="section-heading"><div><span className="eyebrow">Current opportunities</span><h2 className="section-title">Recently verified</h2></div><Link className="button button-secondary" href="/properties">View all</Link></div>
        <div className="card-grid">
          {featured.map(item => <PropertyCard key={item.id} property={item} />)}
          {featured.length === 0 && <div className="empty-state"><span className="eyebrow">Verification in progress</span><h3>Public listings will appear after source review.</h3><p>We are intentionally not displaying sample inventory as live property. Tell us what you need and we can begin with a requirement-led search.</p><Link className="button button-primary" href="/contact">Share your requirements</Link></div>}
        </div>
      </div>
    </section>

    <section className="section">
      <div className="container">
        <span className="eyebrow">How it works</span><h2 className="section-title">A clear path from interest to decision.</h2>
        <div className="process">
          <article className="process-step"><h3>Define the brief</h3><p>Purpose, budget, property type, funding plan and preferred timing.</p></article>
          <article className="process-step"><h3>Compare evidence</h3><p>Review sourced project information, current availability and full cost context.</p></article>
          <article className="process-step"><h3>Complete checks</h3><p>Confirm documents, payment destination, contract terms and professional advice.</p></article>
          <article className="process-step"><h3>Proceed deliberately</h3><p>Move forward only after the commercial and legal position is understood.</p></article>
        </div>
      </div>
    </section>

    <section className="section section-soft">
      <div className="container">
        <div className="section-heading"><div><span className="eyebrow">Practical reading</span><h2 className="section-title">Evidence-backed buyer guides</h2></div><Link className="button button-secondary" href="/insights">All insights</Link></div>
        <div className="card-grid">{articles.slice(0,3).map(item => <article className="article-card" key={item.id}><span className="eyebrow">{item.category}</span><h3>{item.title}</h3><p>{item.excerpt}</p><Link className="button button-link" href={`/insights/${item.slug}`}>Read guide →</Link></article>)}</div>
      </div>
    </section>
  </>;
}
