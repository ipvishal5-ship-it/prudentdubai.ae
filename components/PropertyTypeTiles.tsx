'use client';

import Image from 'next/image';
import Link from 'next/link';
import { PROPERTY_TYPES } from '@/lib/areas';
import { useLanguage } from './LanguageContext';

export default function PropertyTypeTiles() {
  const { locale } = useLanguage();

  return (
    <div className="type-mosaic type-mosaic-tight">
      {PROPERTY_TYPES.filter((item) => item.filter).map((item) => {
        const title = (locale === 'ar' && 'titleAr' in item) ? item.titleAr : item.title;
        return (
          <Link
            className="type-tile"
            href={`/communities?type=${encodeURIComponent(item.filter)}#explore`}
            key={item.title}
          >
            <Image src={item.image} alt={title} width={420} height={280} />
            <span>
              <strong>{title}</strong>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
