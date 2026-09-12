'use client';

import Link from 'next/link';
import Image from 'next/image';
import { KeyboardEvent, useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { DUBAI_AREA_GROUPS, GROUP_VISUALS, TYPE_FILTERS, VISUAL_AREAS } from '@/lib/areas';
import { useLanguage } from './LanguageContext';

function mapEmbedUrl(name: string) {
  return `https://maps.google.com/maps?q=${encodeURIComponent(`${name}, Dubai`)}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
}

function getInitialArea(searchParams: URLSearchParams): string {
  const requested = searchParams.get('area');
  if (requested && VISUAL_AREAS.some((area) => area.name === requested)) return requested;
  return VISUAL_AREAS[0].name;
}

function getInitialType(searchParams: URLSearchParams): string {
  const requested = searchParams.get('type');
  if (requested && TYPE_FILTERS.includes(requested as (typeof TYPE_FILTERS)[number])) return requested;
  return 'all';
}

const HERO_PHOTOS = [
  { id: 'tower', src: '/demo/dubai-tower.jpg', alt: 'Dubai Towers and Skyline' },
  { id: 'villa', src: '/demo/pool-villa.jpg', alt: 'Waterfront Villa with Private Pool' },
  { id: 'apartment', src: '/demo/city-apartment.jpg', alt: 'Prime Urban City Residences' },
];

export default function AreaExplorer() {
  const { t } = useLanguage();
  const params = useSearchParams();
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('all');
  const [type, setType] = useState(() => getInitialType(params));
  const [activeName, setActiveName] = useState(() => getInitialArea(params));
  const [mobileListOpen, setMobileListOpen] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);
  const [mobileMapOpen, setMobileMapOpen] = useState(false);

  const filtered = useMemo(() => {
    return VISUAL_AREAS.filter((area) => {
      const matchesQuery = !query || area.name.toLowerCase().includes(query.toLowerCase());
      const matchesGroup = group === 'all' || area.group === group;
      const matchesType = type === 'all' || area.types.includes(type);
      return matchesQuery && matchesGroup && matchesType;
    });
  }, [group, query, type]);

  // Derive active area — if current activeName is filtered out, fall back to first result
  const active = useMemo(
    () => filtered.find((area) => area.name === activeName) ?? filtered[0] ?? VISUAL_AREAS[0],
    [filtered, activeName],
  );

  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${active.name}, Dubai`)}`;
  const mapSrc = mapEmbedUrl(active.name);

  const handleSelectArea = useCallback((name: string) => {
    setActiveName(name);
    setMobileListOpen(false);
  }, []);

  function move(delta: number) {
    const index = filtered.findIndex((area) => area.name === active.name);
    const next = filtered[index + delta];
    if (next) setActiveName(next.name);
  }

  function onListKey(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowDown') { event.preventDefault(); move(1); }
    if (event.key === 'ArrowUp') { event.preventDefault(); move(-1); }
  }

  const hasActiveFilters = Boolean(query || group !== 'all' || type !== 'all');
  const resetFilters = useCallback(() => {
    setQuery('');
    setGroup('all');
    setType('all');
  }, []);

  const contactHref = `/contact?area=${encodeURIComponent(active.name)}${type !== 'all' ? `&type=${encodeURIComponent(type)}` : ''}`;

  return (
    <div className="studio" id="explore">
      <section className="area-hero">
        <div className="area-hero-copy">
          <p className="eyebrow">{t('areas.eyebrow')}</p>
          <h1 className="display">{t('areas.visualTitle')}</h1>
          <p className="lede">{t('areas.visualLede')}</p>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 24, flexWrap: 'wrap' }}>
            <label className="area-search" style={{ margin: 0, flex: 1, minWidth: 260 }}>
              <span className="sr-only">{t('areas.search')}</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('areas.search')} />
            </label>
            <Link className="button button-secondary" href="/calculator" style={{ minHeight: 54 }}>
              {t('areas.calculator')}
            </Link>
          </div>
        </div>
        <div className="area-hero-showcase">
          {/* Expanding Trio Slat Gallery */}
          <div className="area-hero-trio" role="region" aria-label="Dubai visual portfolio">
            {HERO_PHOTOS.map((photo, idx) => {
              const isActive = activePhoto === idx;
              return (
                <div
                  key={photo.id}
                  className={`area-hero-slat ${isActive ? 'active' : ''}`}
                  onMouseEnter={() => setActivePhoto(idx)}
                  onClick={() => setActivePhoto(idx)}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isActive}
                  aria-label={photo.alt}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActivePhoto(idx);
                    }
                  }}
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    className="area-hero-slat-img"
                    sizes="(max-width: 1000px) 48vw, 25vw"
                    priority={idx === 0}
                  />
                </div>
              );
            })}
          </div>

          {/* Desktop Pagination Dots */}
          <div className="area-hero-nav" aria-hidden="true">
            {HERO_PHOTOS.map((photo, idx) => (
              <button
                key={photo.id}
                type="button"
                className={`area-hero-dot ${activePhoto === idx ? 'active' : ''}`}
                onClick={() => setActivePhoto(idx)}
                aria-label={`Photo ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="area-match" id="area-filters">
        <div className="area-match-head">
          <div>
            <h2>{t('areas.matchTitle')}</h2>
            <p>{t('areas.matchBody')}</p>
          </div>
          {hasActiveFilters ? (
            <div className="filter-active-status">
              <span className="filter-active-count">
                <strong>{filtered.length}</strong> {t('areas.showingFiltered')}
              </span>
              <button type="button" onClick={resetFilters} className="filter-clear-btn" aria-label={t('areas.clearAll')}>
                {t('areas.clearAll')} ✕
              </button>
            </div>
          ) : (
            <div className="filter-default-status">
              <span>{t('areas.showingAll')}</span>
            </div>
          )}
        </div>

        <div className="filter-system">
          {/* Row 1: Lifestyle / Location */}
          <div className="filter-row">
            <div className="filter-row-header">
              <span className="filter-row-label">{t('areas.filterLifestyle')}</span>
            </div>
            <div className="filter-rail" role="group" aria-label={t('areas.mapTitle')}>
              <button
                className={`filter-pill ${group === 'all' ? 'active' : ''}`}
                type="button"
                onClick={() => setGroup('all')}
              >
                {t('areas.allDubai')}
              </button>
              {DUBAI_AREA_GROUPS.map((item) => (
                <button
                  key={item.title}
                  className={`filter-pill ${group === item.title ? 'active' : ''}`}
                  type="button"
                  onClick={() => setGroup(item.title)}
                >
                  {GROUP_VISUALS[item.title].short}
                </button>
              ))}
            </div>
          </div>

          {/* Row 2: Property Type */}
          <div className="filter-row">
            <div className="filter-row-header">
              <span className="filter-row-label">{t('areas.filterPropertyType')}</span>
            </div>
            <div className="filter-rail" role="group" aria-label={t('areas.typesTitle')}>
              <button
                className={`filter-pill ${type === 'all' ? 'active' : ''}`}
                type="button"
                onClick={() => setType('all')}
              >
                {t('areas.anyType')}
              </button>
              {TYPE_FILTERS.map((item) => (
                <button
                  key={item}
                  className={`filter-pill ${type === item ? 'active' : ''}`}
                  type="button"
                  onClick={() => setType(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <h2>{t('areas.noMatch')}</h2>
          <p>{t('areas.noMatchBody')}</p>
          <button className="button button-primary" type="button" onClick={() => { setQuery(''); setGroup('all'); setType('all'); }}>{t('areas.reset')}</button>
        </div>
      ) : (
        <div className="studio-board" id="area-board">
          {/* Mobile: collapsible area picker */}
          <button
            className="mobile-area-picker"
            type="button"
            onClick={() => setMobileListOpen((v) => !v)}
            aria-expanded={mobileListOpen}
          >
            <span>
              <strong>{active.name}</strong>
              <em>{active.types.join(' · ')}</em>
            </span>
            <span className="picker-chevron">{mobileListOpen ? '▲' : '▼'}</span>
          </button>

          {/* Desktop sidebar / Mobile dropdown */}
          <div className={`studio-list${mobileListOpen ? ' mobile-open' : ''}`} role="listbox" aria-label={t('areas.mapTitle')} tabIndex={0} onKeyDown={onListKey}>
            <p className="studio-count">{filtered.length} {t('areas.count')}</p>
            {filtered.map((area) => (
              <button
                key={area.name}
                className={area.name === active.name ? 'active' : ''}
                type="button"
                role="option"
                aria-selected={area.name === active.name}
                onClick={() => handleSelectArea(area.name)}
              >
                <strong>{area.name}</strong>
                <span>{area.types.join(' · ')}</span>
              </button>
            ))}
          </div>

          <div className="studio-stage">
            <article className="studio-feature">
              <Image key={active.image + active.name} src={active.image} alt="" width={1200} height={760} sizes="(max-width: 1000px) calc(100vw - 20px), 66vw" />
              <div className="studio-feature-copy">
                <p className="eyebrow">{GROUP_VISUALS[active.group].short}</p>
                <h2>{active.name}</h2>
                <p>{active.summary}</p>
                <p className="studio-meta">{active.types.join(' · ')}</p>
                <div className="button-row">
                  <Link className="button button-primary" href={contactHref}>{t('areas.talkArea')}</Link>
                  <Link className="button button-secondary" href="/calculator">{t('areas.calculator')}</Link>
                </div>
              </div>
            </article>

            {/* Mobile: collapsible map */}
            <button
              className="mobile-map-toggle"
              type="button"
              onClick={() => setMobileMapOpen((v) => !v)}
              aria-expanded={mobileMapOpen}
            >
              <span>{t('areas.mapLabel')}: {active.name}</span>
              <span>{mobileMapOpen ? '▲' : '▼'}</span>
            </button>

            <aside className={`studio-map-panel${mobileMapOpen ? ' mobile-map-open' : ''}`}>
              <div className="studio-map-head">
                <div>
                  <p className="eyebrow">{t('areas.mapLabel')}</p>
                  <h3>{active.name}</h3>
                </div>
                <a className="button button-secondary" href={mapsLink} target="_blank" rel="noopener noreferrer">{t('areas.openMaps')}</a>
              </div>
              <div className="studio-map-frame">
                <iframe
                  key={active.name}
                  title={`${active.name} map`}
                  src={mapSrc}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </aside>
          </div>
        </div>
      )}
    </div>
  );
}
