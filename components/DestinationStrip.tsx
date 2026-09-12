import Image from 'next/image';
import Link from 'next/link';
import { FEATURED_DESTINATIONS } from '@/lib/areas';
import { T } from './LanguageContext';

export default function DestinationStrip() {
  return (
    <div className="destination-strip">
      {FEATURED_DESTINATIONS.map((area) => (
        <Link className="destination-card" href={`/communities?area=${encodeURIComponent(area.name)}#explore`} key={area.name}>
          <Image src={area.image} alt="" width={420} height={280} />
          <span>
            <strong>{area.name}</strong>
            <em>{area.mood}</em>
          </span>
        </Link>
      ))}
      <Link className="destination-card destination-more" href="/communities#explore">
        <span>
          <strong><T id="home.viewAllAreas" /></strong>
          <em><T id="areas.count" /></em>
        </span>
      </Link>
    </div>
  );
}
