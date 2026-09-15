'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FEATURED_DESTINATIONS, getLocalizedArea } from '@/lib/areas';
import { T, useLanguage } from './LanguageContext';

export default function DestinationStrip() {
  const { locale } = useLanguage();

  return (
    <div className="destination-strip">
      {FEATURED_DESTINATIONS.map((rawArea) => {
        const area = getLocalizedArea(rawArea, locale);
        return (
          <Link className="destination-card" href={`/communities?area=${encodeURIComponent(rawArea.name)}#explore`} key={rawArea.name}>
            <Image src={area.image} alt={area.name} width={420} height={280} />
            <span>
              <strong>{area.name}</strong>
              <em>{area.mood}</em>
            </span>
          </Link>
        );
      })}
      <Link className="destination-card destination-more" href="/communities#explore">
        <span>
          <strong><T id="home.viewAllAreas" /></strong>
          <em><T id="areas.count" /></em>
        </span>
      </Link>
    </div>
  );
}
