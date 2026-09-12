import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllArticles, getArticle } from '@/lib/content';
import { T } from '@/components/LanguageContext';
import ArticleCard from '@/components/ArticleCard';

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
    alternates: { canonical: `/insights/${item.slug}` },
    openGraph: {
      title: item.title,
      description: item.excerpt,
      url: `/insights/${item.slug}`,
      siteName: 'Prudent Dubai Properties',
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

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: item.title,
    description: item.excerpt,
    url: `https://prudentdubai.ae/insights/${item.slug}`,
    image: item.imageUrl ? (item.imageUrl.startsWith('http') ? item.imageUrl : `https://prudentdubai.ae${item.imageUrl}`) : 'https://prudentdubai.ae/brand/og-image.png',
    datePublished: item.publishedAt || item.updatedAt,
    dateModified: item.updatedAt || item.publishedAt,
    author: {
      '@type': 'Organization',
      name: item.author || 'Prudent Dubai Properties',
      url: 'https://prudentdubai.ae',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Prudent Dubai Properties',
      logo: {
        '@type': 'ImageObject',
        url: 'https://prudentdubai.ae/brand/prudentlogo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://prudentdubai.ae/insights/${item.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <article className="section article-page-section">
        <div className="container article-layout">
          {/* Breadcrumb Navigation */}
          <nav className="article-breadcrumbs" aria-label="Breadcrumb">
            <Link href="/insights" className="button-link">
              <T id="insights.allInsights" />
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
                <span className="takeaways-badge"><T id="insights.takeaways" /></span>
                <h3><T id="insights.atGlance" /></h3>
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
            <span className="eyebrow"><T id="insights.regulatory" /></span>
            <strong><T id="insights.officialRef" /></strong>
            <p className="fine-print">
              <T id="insights.verifyDesc" />
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
              <span className="eyebrow"><T id="insights.personalAdvisory" /></span>
              <h3><T id="insights.advisoryTitle" /></h3>
              <p><T id="insights.advisoryDesc" /></p>
              <div className="button-row" style={{ marginTop: 20 }}>
                <Link className="button button-primary" href="/contact">
                  <T id="insights.discussTeam" />
                </Link>
                <a
                  className="button button-secondary"
                  href="https://wa.me/971555541538"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <T id="insights.whatsappChat" />
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
                <span className="eyebrow"><T id="insights.continueReading" /></span>
                <h2 className="section-title"><T id="insights.relatedGuides" /></h2>
              </div>
              <Link className="button button-secondary" href="/insights">
                <T id="insights.viewAll" />
              </Link>
            </div>
            <div className="card-grid">
              {related.map((rel) => <ArticleCard article={rel} key={rel.id} />)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
