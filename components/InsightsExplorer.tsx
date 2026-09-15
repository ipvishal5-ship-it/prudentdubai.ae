'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { Article } from '@/lib/data';
import { useLanguage } from '@/components/LanguageContext';
import ArticleCard from '@/components/ArticleCard';

interface InsightsExplorerProps {
  articles: Article[];
}

export default function InsightsExplorer({ articles }: InsightsExplorerProps) {
  const { t, locale } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extract unique categories dynamically so any future category is automatically available
  const categories = useMemo(() => {
    const cats = new Set<string>();
    articles.forEach((a) => {
      if (a.category) cats.add(a.category);
    });
    return ['All', ...Array.from(cats)];
  }, [articles]);

  const getCategoryLabel = (cat: string) => {
    if (cat === 'All') return t('insights.allCategories');
    if (locale === 'ar') {
      const art = articles.find((a) => a.category === cat);
      if (art?.categoryAr) return art.categoryAr;
    }
    return cat;
  };

  // Filter articles by category and search query (matching both English and Arabic)
  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesCategory =
        selectedCategory === 'All' || article.category.toLowerCase() === selectedCategory.toLowerCase();
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        article.title.toLowerCase().includes(query) ||
        article.excerpt.toLowerCase().includes(query) ||
        article.category.toLowerCase().includes(query) ||
        (article.titleAr && article.titleAr.includes(query)) ||
        (article.excerptAr && article.excerptAr.includes(query)) ||
        (article.categoryAr && article.categoryAr.includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [articles, selectedCategory, searchQuery]);

  const featured = selectedCategory === 'All' && !searchQuery.trim() ? filteredArticles[0] : null;
  const gridArticles = featured ? filteredArticles.slice(1) : filteredArticles;

  const featuredTitle = (locale === 'ar' && featured?.titleAr) ? featured.titleAr : featured?.title;
  const featuredExcerpt = (locale === 'ar' && featured?.excerptAr) ? featured.excerptAr : featured?.excerpt;
  const featuredCategory = (locale === 'ar' && featured?.categoryAr) ? featured.categoryAr : featured?.category;
  const featuredReadTime = (locale === 'ar' && featured?.readTimeAr) ? featured.readTimeAr : featured?.readTime;
  const featuredAuthor = (locale === 'ar' && featured?.authorAr) ? featured.authorAr : featured?.author;
  const featuredUpdated = locale === 'ar' && featured ? `تحديث ${featured.updatedAt}` : `Updated ${featured?.updatedAt}`;

  return (
    <>
      <section className="section insights-hero">
        <div className="container">
          <h1 className="display">{t('insights.heroTitle')}</h1>
          <p className="lede">{t('insights.heroLede')}</p>

          <div className="insights-controls">
            <div className="insights-categories" role="tablist" aria-label="Article categories">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                  role="tab"
                  aria-selected={selectedCategory === cat}
                >
                  {getCategoryLabel(cat)}
                </button>
              ))}
            </div>

            <div className="insights-search-box">
              <input
                type="search"
                className="field-input insights-search-input"
                placeholder={t('insights.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label={t('insights.searchPlaceholder')}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container">
          {/* Featured Article Card */}
          {featured && (
            <div className="featured-article-wrap">
              <span className="eyebrow featured-tag">{t('insights.featured')}</span>
              <article className="featured-article-card">
                {featured.imageUrl && (
                  <Link href={`/insights/${featured.slug}`} className="featured-image-link">
                    <Image
                      src={featured.imageUrl}
                      alt={featuredTitle || ''}
                      width={680}
                      height={420}
                      className="featured-image"
                      priority
                    />
                  </Link>
                )}
                <div className="featured-content">
                  <div className="article-meta-row">
                    <span className="category-pill">{featuredCategory}</span>
                    {featuredReadTime && <span className="read-time">{featuredReadTime}</span>}
                  </div>
                  <h2>
                    <Link href={`/insights/${featured.slug}`}>{featuredTitle}</Link>
                  </h2>
                  <p>{featuredExcerpt}</p>
                  <div className="article-card-footer">
                    <div className="author-date">
                      {featuredAuthor && <strong>{featuredAuthor}</strong>}
                      <span className="fine-print">{featuredUpdated}</span>
                    </div>
                    <Link className="button button-primary" href={`/insights/${featured.slug}`}>
                      {t('insights.readFull')}
                    </Link>
                  </div>
                </div>
              </article>
            </div>
          )}

          {/* Regular Articles Grid */}
          <div className="insights-grid-header">
            <h3>
              {selectedCategory === 'All'
                ? t('insights.latest')
                : (locale === 'ar'
                    ? `أدلة ${getCategoryLabel(selectedCategory)}`
                    : `${selectedCategory} ${t('insights.guides')}`)}{' '}
              <span className="count-tag">({filteredArticles.length})</span>
            </h3>
            {(selectedCategory !== 'All' || searchQuery) && (
              <button
                className="button button-link"
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
              >
                {t('insights.clearFilters')}
              </button>
            )}
          </div>

          {gridArticles.length > 0 ? (
            <div className="card-grid">
              {gridArticles.map((item) => <ArticleCard article={item} key={item.id} />)}
            </div>
          ) : (
            <div className="insights-empty-state">
              <h3>{t('insights.noGuides')}</h3>
              <p className="lede">{t('insights.noGuidesHint')}</p>
              <button
                className="button button-secondary"
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
              >
                {t('insights.clearFilters')}
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
