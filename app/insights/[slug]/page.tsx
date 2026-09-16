import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllArticles, getArticle } from '@/lib/content';
import { T } from '@/components/LanguageContext';
import ArticleCard from '@/components/ArticleCard';
import ArticleReader from '@/components/ArticleReader';

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
      siteName: 'Prudent Spaces',
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
    url: `https://prudentspaces.ae/insights/${item.slug}`,
    image: item.imageUrl ? (item.imageUrl.startsWith('http') ? item.imageUrl : `https://prudentspaces.ae${item.imageUrl}`) : 'https://prudentspaces.ae/brand/og-image.png',
    datePublished: item.publishedAt || item.updatedAt,
    dateModified: item.updatedAt || item.publishedAt,
    author: {
      '@type': 'Organization',
      name: item.author || 'Prudent Spaces',
      url: 'https://prudentspaces.ae',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Prudent Spaces',
      logo: {
        '@type': 'ImageObject',
        url: 'https://prudentspaces.ae/brand/prudentlogo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://prudentspaces.ae/insights/${item.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <ArticleReader article={item} />

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
