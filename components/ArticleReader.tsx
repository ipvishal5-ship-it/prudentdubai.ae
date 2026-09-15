'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Article } from '@/lib/data';
import { T, useLanguage } from '@/components/LanguageContext';

export default function ArticleReader({ article }: { article: Article }) {
  const { locale } = useLanguage();

  const isAr = locale === 'ar';
  const title = (isAr && article.titleAr) ? article.titleAr : article.title;
  const excerpt = (isAr && article.excerptAr) ? article.excerptAr : article.excerpt;
  const category = (isAr && article.categoryAr) ? article.categoryAr : article.category;
  const readTime = (isAr && article.readTimeAr) ? article.readTimeAr : article.readTime;
  const author = (isAr && article.authorAr)
    ? article.authorAr
    : (article.author || (isAr ? 'فريق استشارات برودنت العقارية' : 'Prudent Property Advisory'));
  const takeaways = (isAr && article.keyTakeawaysAr && article.keyTakeawaysAr.length > 0)
    ? article.keyTakeawaysAr
    : article.keyTakeaways;
  const body = (isAr && article.bodyAr && article.bodyAr.length > 0)
    ? article.bodyAr
    : article.body;
  const sourceLabel = (isAr && article.sourceLabelAr)
    ? article.sourceLabelAr
    : article.sourceLabel;

  const byline = isAr
    ? `نُشر في ${article.publishedAt} · تم التدقيق في ${article.updatedAt}`
    : `Published ${article.publishedAt} · Reviewed ${article.updatedAt}`;

  return (
    <article className="section article-page-section">
      <div className="container article-layout">
        {/* Breadcrumb Navigation */}
        <nav className="article-breadcrumbs" aria-label="Breadcrumb">
          <Link href="/insights" className="button-link">
            <T id="insights.allInsights" />
          </Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{category}</span>
        </nav>

        {/* Header Metadata */}
        <header className="article-header">
          <div className="article-meta-row" style={{ marginBottom: 14 }}>
            <span className="category-pill">{category}</span>
            {readTime && <span className="read-time">{readTime}</span>}
          </div>

          <h1 className="article-title">{title}</h1>
          <p className="article-lede">{excerpt}</p>

          <div className="article-byline">
            <div className="byline-avatar">PD</div>
            <div className="byline-info">
              <strong>{author}</strong>
              <span className="fine-print">{byline}</span>
            </div>
          </div>
        </header>

        {/* Featured Hero Image */}
        {article.imageUrl && (
          <div className="article-hero-media">
            <Image
              src={article.imageUrl}
              alt={title}
              width={1080}
              height={600}
              className="article-hero-img"
              priority
            />
          </div>
        )}

        {/* Key Takeaways Box */}
        {takeaways && takeaways.length > 0 && (
          <aside className="article-takeaways">
            <div className="takeaways-header">
              <span className="takeaways-badge"><T id="insights.takeaways" /></span>
              <h3><T id="insights.atGlance" /></h3>
            </div>
            <ul className="takeaways-list">
              {takeaways.map((point, index) => (
                <li key={`takeaway-${index}`}>{point}</li>
              ))}
            </ul>
          </aside>
        )}

        {/* Article Body Content */}
        <div className="article-prose">
          {body.map((paragraph, index) => (
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
            href={article.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ marginTop: 14 }}
          >
            {sourceLabel} ↗
          </a>
        </div>

        {/* Advisory Contact Callout */}
        <section className="article-advisory-cta">
          <div className="advisory-cta-content">
            <span className="eyebrow"><T id="insights.personalAdvisory" /></span>
            <h3><T id="insights.advisoryTitle" /></h3>
            <p className="lede"><T id="insights.advisoryDesc" /></p>
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
  );
}
