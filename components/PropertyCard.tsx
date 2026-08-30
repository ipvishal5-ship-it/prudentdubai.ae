'use client';

import Link from 'next/link';
import type { Property } from '@/lib/data';
import { useCurrency } from './CurrencyContext';

export default function PropertyCard({ property }: { property: Property }) {
  const { format } = useCurrency();
  return <article className="property-card">
    <Link className="property-image" href={`/properties/${property.slug}`}>
      {/* Editor-supplied HTTPS images are displayed only after the record is published. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={property.imageUrl} alt={`${property.name} in ${property.location}`} loading="lazy" draggable={false} />
    </Link>
    <div className="property-body">
      <div className="property-meta"><span>{property.marketType} · {property.propertyType}</span><span>{property.location}</span></div>
      <h3><Link href={`/properties/${property.slug}`}>{property.name}</Link></h3>
      <p className="fine-print">By {property.developer}</p>
      <div className="property-price">From {format(property.priceAED)}</div>
      <div className="verified-line"><span aria-hidden="true">✓</span> Source checked {property.verifiedAt}</div>
    </div>
  </article>;
}
