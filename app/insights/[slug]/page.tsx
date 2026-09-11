import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllArticles, getArticle } from '@/lib/content';

export async function generateStaticParams() {
  const articles = await getAllArticles();
  return articles.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await getArticle(slug);
  if (!item) return { title: 'Guide Not Found' };
  return {
    title: `${item.title} | Dubai Property Insights`,
    description: item.excerpt,
    openGraph: {
      title: item.title,
      description: item.excerpt,
      type: 'article',
      images: item.imageUrl ? [{ url: item.imageUrl }] : undefined,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getArticle(slug);
  if (!item) notFound();

  const allArticles = await getAllArticles();
  const related = allArticles.filter((a) => a.slug !== item.slug).slice(0, 3);

  return (
    <>
      <article className="section article-page-section">
        <div className="container article-layout">
          {/* Breadcrumb Navigation */}
          <nav className="article-breadcrumbs" aria-label="Breadcrumb">
            <Link href="/insights" className="button-link">
              ← All Insights
            </Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">{item.category}</span>
          </nav>

          {/* Header Metadata */}
          <header className="article-header">
            <div className="article-meta-row" style={{ marginBottom: 14 }}>
              <span className="category-pill">{item.category}</span>
              {item.readTime && <span className="read-time">{item.readTime}</span>}
            </div>

            <h1 className="article-title">{item.title}</h1>
            <p className="article-lede">{item.excerpt}</p>

            <div className="article-byline">
              <div className="byline-avatar">PD</div>
              <div className="byline-info">
                <strong>{item.author || 'Prudent Property Advisory'}</strong>
                <span className="fine-print">
                  Published {item.publishedAt} · Reviewed {item.updatedAt}
                </span>
              </div>
            </div>
          </header>

          {/* Featured Hero Image */}
          {item.imageUrl && (
            <div className="article-hero-media">
              <Image
                src={item.imageUrl}
                alt={item.title}
                width={1080}
                height={600}
                className="article-hero-img"
                priority
              />
            </div>
          )}

          {/* Key Takeaways Box */}
          {item.keyTakeaways && item.keyTakeaways.length > 0 && (
            <aside className="article-takeaways">
              <div className="takeaways-header">
                <span className="takeaways-badge">Key Takeaways</span>
                <h3>At a Glance</h3>
              </div>
              <ul className="takeaways-list">
                {item.keyTakeaways.map((point, index) => (
                  <li key={`takeaway-${index}`}>{point}</li>
                ))}
              </ul>
            </aside>
          )}

          {/* Article Body Content */}
          <div className="article-prose">
            {item.body.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {/* Source Verification Citation Box */}
          <div className="source-box">
            <span className="eyebrow">Regulatory Verification</span>
            <strong>Primary official reference</strong>
            <p className="fine-print">
              We cross-check all property figures against named public registry records. You can verify live regulations
              directly with the issuing authority.
            </p>
            <a
              className="button button-secondary"
              href={item.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ marginTop: 14 }}
            >
              {item.sourceLabel} ↗
            </a>
          </div>

          {/* Advisory Contact Callout */}
          <section className="article-advisory-cta">
            <div className="advisory-cta-content">
              <span className="eyebrow">Personal Advisory</span>
              <h3>Need tailored property guidance in Dubai?</h3>
              <p>
                Whether you are evaluating service charges for a specific building, vetting an off-plan developer, or
                preparing for transfer day, our advisors are here to help.
              </p>
              <div className="button-row" style={{ marginTop: 20 }}>
                <Link className="button button-primary" href="/contact">
                  Discuss with our team
                </Link>
                <a
                  className="button button-secondary"
                  href="https://wa.me/971555541538"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp instant chat
                </a>
              </div>
            </div>
          </section>
        </div>
      </article>

      {/* Related Articles Section */}
      {related.length > 0 && (
        <section className="section section-soft">
          <div className="container">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Continue reading</span>
                <h2 className="section-title">Related Guides</h2>
              </div>
              <Link className="button button-secondary" href="/insights">
                View all insights
              </Link>
            </div>
            <div className="card-grid">
              {related.map((rel) => (
                <article className="article-card insight-card" key={rel.id}>
                  {rel.imageUrl && (
                    <Link href={`/insights/${rel.slug}`} className="insight-card-image-wrap">
                      <Image
                        src={rel.imageUrl}
                        alt={rel.title}
                        width={420}
                        height={240}
                        className="insight-card-image"
                      />
                    </Link>
                  )}
                  <div className="insight-card-body">
                    <div className="article-meta-row">
                      <span className="category-pill">{rel.category}</span>
                      {rel.readTime && <span className="read-time">{rel.readTime}</span>}
                    </div>
                    <h3>
                      <Link href={`/insights/${rel.slug}`}>{rel.title}</Link>
                    </h3>
                    <p>{rel.excerpt}</p>
                    <div className="article-card-footer">
                      <span className="fine-print">Updated {rel.updatedAt}</span>
                      <Link className="button button-link" href={`/insights/${rel.slug}`}>
                        Read guide →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
