'use client';

import Link from 'next/link';
import type { Property } from '@/lib/data';
import { useCurrency } from './CurrencyContext';
import { useLanguage } from './LanguageContext';

export default function PropertyCard({ property, compareSelected = false, onCompare }: { property: Property; compareSelected?: boolean; onCompare?: () => void }) {
  const { format } = useCurrency();
  const { t } = useLanguage();
  return <article className="property-card">
    <Link className="property-image" href={`/properties/${property.slug}`}>
      {/* Editor-supplied HTTPS images are displayed only after the record is published. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={property.imageUrl} alt={`${property.name} in ${property.location}`} loading="lazy" draggable={false} />
      {property.demo && <span className="demo-badge">{t('property.demo')}</span>}
    </Link>
    <div className="property-body">
      <div className="property-meta"><span>{property.marketType} · {property.propertyType}</span><span>{property.location}</span></div>
      <h3><Link href={`/properties/${property.slug}`}>{property.name}</Link></h3>
      <p className="fine-print">{t('property.by')} {property.developer}</p>
      <div className="property-price">{t('property.from')} {format(property.priceAED)}</div>
      <div className={property.demo ? 'demo-line' : 'verified-line'}><span aria-hidden="true">{property.demo ? '◇' : '✓'}</span> {property.demo ? t('property.demo') : `${t('property.sourceChecked')} ${property.verifiedAt}`}</div>
      {onCompare && <button className={`compare-toggle ${compareSelected ? 'selected' : ''}`} type="button" onClick={onCompare} aria-pressed={compareSelected}>{compareSelected ? t('compare.selected') : t('compare.add')}</button>}
    </div>
  </article>;
}
