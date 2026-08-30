'use client';
/* eslint-disable @next/next/no-img-element */

import { useMemo, useState } from 'react';
import type { Property } from '@/lib/data';
import PropertyCard from './PropertyCard';
import { useCurrency } from './CurrencyContext';
import { useLanguage } from './LanguageContext';

const budgets = [2_000_000, 5_000_000, 10_000_000, 20_000_000];

export default function PropertyExplorer({ properties }: { properties: Property[] }) {
  const { t } = useLanguage();
  const { format } = useCurrency();
  const [search, setSearch] = useState('');
  const [market, setMarket] = useState('All');
  const [type, setType] = useState('All');
  const [location, setLocation] = useState('All');
  const [bedrooms, setBedrooms] = useState('Any');
  const [budget, setBudget] = useState('Any');
  const [sort, setSort] = useState('featured');
  const [comparison, setComparison] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);

  const types = [...new Set(properties.map((item) => item.propertyType))].sort();
  const locations = [...new Set(properties.map((item) => item.location))].sort();
  const bedroomOptions = [...new Set(properties.map((item) => item.bedrooms))].sort();

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return properties.filter((item) => {
      const searchable = `${item.name} ${item.location} ${item.developer}`.toLocaleLowerCase();
      return (!query || searchable.includes(query))
        && (market === 'All' || item.marketType === market)
        && (type === 'All' || item.propertyType === type)
        && (location === 'All' || item.location === location)
        && (bedrooms === 'Any' || item.bedrooms === bedrooms)
        && (budget === 'Any' || item.priceAED <= Number(budget));
    }).sort((a, b) => {
      if (sort === 'priceLow') return a.priceAED - b.priceAED;
      if (sort === 'priceHigh') return b.priceAED - a.priceAED;
      if (sort === 'name') return a.name.localeCompare(b.name);
      return Number(b.featured) - Number(a.featured);
    });
  }, [properties, search, market, type, location, bedrooms, budget, sort]);

  const selected = comparison.map((id) => properties.find((item) => item.id === id)).filter(Boolean) as Property[];
  const clear = () => { setSearch(''); setMarket('All'); setType('All'); setLocation('All'); setBedrooms('Any'); setBudget('Any'); setSort('featured'); };
  const toggleCompare = (id: string) => setComparison((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length < 3 ? [...current, id] : current);

  return <div className="property-explorer">
    <div className="filter-panel" data-reveal>
      <label className="filter-field filter-search"><span>{t('filter.search')}</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('filter.search')} /></label>
      <div className="filter-grid">
        <Filter label={t('filter.market')} value={market} onChange={setMarket} options={[['All', t('filter.all')], ['Off-plan', t('filter.offPlan')], ['Ready', t('filter.ready')]]} />
        <Filter label={t('filter.type')} value={type} onChange={setType} options={[['All', t('filter.all')], ...types.map((item) => [item, item])]} />
        <Filter label={t('filter.location')} value={location} onChange={setLocation} options={[['All', t('filter.all')], ...locations.map((item) => [item, item])]} />
        <Filter label={t('filter.bedrooms')} value={bedrooms} onChange={setBedrooms} options={[['Any', t('filter.any')], ...bedroomOptions.map((item) => [item, item])]} />
        <Filter label={t('filter.budget')} value={budget} onChange={setBudget} options={[['Any', t('filter.any')], ...budgets.map((item) => [String(item), format(item)])]} />
        <Filter label={t('filter.sort')} value={sort} onChange={setSort} options={[["featured", t('filter.featured')], ['priceLow', t('filter.priceLow')], ['priceHigh', t('filter.priceHigh')], ['name', t('filter.name')]]} />
      </div>
    </div>
    <div className="results-toolbar"><strong>{filtered.length} {t('filter.results')}</strong><button type="button" className="button button-link" onClick={clear}>{t('filter.clear')}</button></div>
    <div className="property-results">
      {filtered.map((item) => <PropertyCard key={item.id} property={item} compareSelected={comparison.includes(item.id)} onCompare={() => toggleCompare(item.id)} />)}
      {filtered.length === 0 && <div className="empty-state"><h2>{t('filter.noResults')}</h2><p>{t('filter.adjust')}</p><button type="button" className="button button-primary" onClick={clear}>{t('filter.clear')}</button></div>}
    </div>
    {selected.length > 0 && <div className="compare-tray" aria-live="polite"><span><strong>{selected.length}/3</strong> {t('compare.limit')}</span><div><button className="button button-secondary" type="button" onClick={() => setComparison([])}>{t('compare.clear')}</button><button className="button button-primary" type="button" onClick={() => setCompareOpen(true)}>{t('compare.open')}</button></div></div>}
    {compareOpen && <div className="compare-overlay" role="dialog" aria-modal="true" aria-label={t('compare.title')} onClick={() => setCompareOpen(false)}><div className="compare-panel" onClick={(event) => event.stopPropagation()}><div className="section-heading"><h2>{t('compare.title')}</h2><button className="button button-secondary" type="button" onClick={() => setCompareOpen(false)}>{t('compare.close')}</button></div><div className="comparison-grid">{selected.map((item) => <article key={item.id}><img src={item.imageUrl} alt="" draggable={false} /><h3>{item.name}</h3><dl><div><dt>{t('filter.location')}</dt><dd>{item.location}</dd></div><div><dt>{t('filter.type')}</dt><dd>{item.propertyType}</dd></div><div><dt>{t('filter.market')}</dt><dd>{item.marketType}</dd></div><div><dt>{t('filter.bedrooms')}</dt><dd>{item.bedrooms}</dd></div><div><dt>{t('property.from')}</dt><dd>{format(item.priceAED)}</dd></div></dl></article>)}</div></div></div>}
  </div>;
}

function Filter({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[][] }) {
  return <label className="filter-field"><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)}>{options.map(([optionValue, optionLabel]) => <option value={optionValue} key={optionValue}>{optionLabel}</option>)}</select></label>;
}
