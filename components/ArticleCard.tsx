import Image from 'next/image';
import Link from 'next/link';
import type { Article } from '@/lib/data';
import { T } from '@/components/LanguageContext';

export default function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="article-card insight-card">
      {article.imageUrl && (
        <Link href={`/insights/${article.slug}`} className="insight-card-image-wrap">
          <Image src={article.imageUrl} alt={article.title} width={420} height={240} className="insight-card-image" />
        </Link>
      )}
      <div className="insight-card-body">
        <div className="article-meta-row">
          <span className="category-pill">{article.category}</span>
          {article.readTime && <span className="read-time">{article.readTime}</span>}
        </div>
        <h3><Link href={`/insights/${article.slug}`}>{article.title}</Link></h3>
        <p>{article.excerpt}</p>
        <div className="article-card-footer">
          <span className="fine-print">Updated {article.updatedAt}</span>
          <Link className="button button-link" href={`/insights/${article.slug}`}>
            <T id="home.read" /> <span className="directional">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
