'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { Article } from '@/lib/data';

interface InsightsExplorerProps {
  articles: Article[];
}

export default function InsightsExplorer({ articles }: InsightsExplorerProps) {
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

  // Filter articles by category and search query
  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesCategory =
        selectedCategory === 'All' || article.category.toLowerCase() === selectedCategory.toLowerCase();
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        article.title.toLowerCase().includes(query) ||
        article.excerpt.toLowerCase().includes(query) ||
        article.category.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [articles, selectedCategory, searchQuery]);

  const featured = selectedCategory === 'All' && !searchQuery.trim() ? filteredArticles[0] : null;
  const gridArticles = featured ? filteredArticles.slice(1) : filteredArticles;

  return (
    <>
      <section className="section insights-hero">
        <div className="container">
          <h1 className="display">Research for real property decisions.</h1>
          <p className="lede">Practical guides on buying costs, off-plan checks, contracts, service charges, and transfers, with links to official sources.</p>

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
                  {cat}
                </button>
              ))}
            </div>

            <div className="insights-search-box">
              <input
                type="search"
                className="field-input insights-search-input"
                placeholder="Search guides"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search guides"
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
              <span className="eyebrow featured-tag">Featured Guide</span>
              <article className="featured-article-card">
                {featured.imageUrl && (
                  <Link href={`/insights/${featured.slug}`} className="featured-image-link">
                    <Image
                      src={featured.imageUrl}
                      alt={featured.title}
                      width={680}
                      height={420}
                      className="featured-image"
                      priority
                    />
                  </Link>
                )}
                <div className="featured-content">
                  <div className="article-meta-row">
                    <span className="category-pill">{featured.category}</span>
                    {featured.readTime && <span className="read-time">{featured.readTime}</span>}
                  </div>
                  <h2>
                    <Link href={`/insights/${featured.slug}`}>{featured.title}</Link>
                  </h2>
                  <p>{featured.excerpt}</p>
                  <div className="article-card-footer">
                    <div className="author-date">
                      {featured.author && <strong>{featured.author}</strong>}
                      <span className="fine-print">Updated {featured.updatedAt}</span>
                    </div>
                    <Link className="button button-primary" href={`/insights/${featured.slug}`}>
                      Read full guide →
                    </Link>
                  </div>
                </div>
              </article>
            </div>
          )}

          {/* Regular Articles Grid */}
          <div className="insights-grid-header">
            <h3>
              {selectedCategory === 'All' ? 'Latest Guides' : `${selectedCategory} Guides`}{' '}
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
                Clear filters
              </button>
            )}
          </div>

          {gridArticles.length > 0 ? (
            <div className="card-grid">
              {gridArticles.map((item) => (
                <article className="article-card insight-card" key={item.id}>
                  {item.imageUrl && (
                    <Link href={`/insights/${item.slug}`} className="insight-card-image-wrap">
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        width={420}
                        height={240}
                        className="insight-card-image"
                      />
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
                        Read guide →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="insights-empty-state">
              <h3>No guides match your search</h3>
              <p className="lede">Try clearing your search query or selecting another category.</p>
              <button
                className="button button-secondary"
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
              >
                Show all guides
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
