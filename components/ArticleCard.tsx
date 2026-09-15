'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Article } from '@/lib/data';
import { T, useLanguage } from '@/components/LanguageContext';

export default function ArticleCard({ article }: { article: Article }) {
  const { locale } = useLanguage();
  const title = (locale === 'ar' && article.titleAr) ? article.titleAr : article.title;
  const excerpt = (locale === 'ar' && article.excerptAr) ? article.excerptAr : article.excerpt;
  const category = (locale === 'ar' && article.categoryAr) ? article.categoryAr : article.category;
  const readTime = (locale === 'ar' && article.readTimeAr) ? article.readTimeAr : article.readTime;
  const updatedLabel = locale === 'ar' ? `تحديث ${article.updatedAt}` : `Updated ${article.updatedAt}`;

  return (
    <article className="article-card insight-card">
      {article.imageUrl && (
        <Link href={`/insights/${article.slug}`} className="insight-card-image-wrap">
          <Image src={article.imageUrl} alt={title} width={420} height={240} className="insight-card-image" />
        </Link>
      )}
      <div className="insight-card-body">
        <div className="article-meta-row">
          <span className="category-pill">{category}</span>
          {readTime && <span className="read-time">{readTime}</span>}
        </div>
        <h3><Link href={`/insights/${article.slug}`}>{title}</Link></h3>
        <p>{excerpt}</p>
        <div className="article-card-footer">
          <span className="fine-print">{updatedLabel}</span>
          <Link className="button button-link" href={`/insights/${article.slug}`}>
            <T id="home.read" /> <span className="directional">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
