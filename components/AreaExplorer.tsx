'use client';

import Link from 'next/link';
import Image from 'next/image';
import { KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { DUBAI_AREA_GROUPS, GROUP_VISUALS, TYPE_FILTERS, VISUAL_AREAS } from '@/lib/areas';
import { useLanguage } from './LanguageContext';

const SHORTLIST_KEY = 'pd_area_shortlist';

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

function getInitialShortlist(): string[] {
  try {
    const saved = localStorage.getItem(SHORTLIST_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as string[];
      if (Array.isArray(parsed)) {
        return parsed.filter((name) => VISUAL_AREAS.some((area) => area.name === name));
      }
    }
  } catch {
    // Ignore localStorage access errors
  }
  return [];
}

export default function AreaExplorer() {
  const { t } = useLanguage();
  const params = useSearchParams();
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('all');
  const [type, setType] = useState(() => getInitialType(params));
  const [activeName, setActiveName] = useState(() => getInitialArea(params));
  const [shortlist, setShortlist] = useState<string[]>([]);
  const [mobileListOpen, setMobileListOpen] = useState(false);
  const [mobileMapOpen, setMobileMapOpen] = useState(false);

  // Track whether the localStorage read has completed (ref avoids re-render)
  const hasMountedRef = useRef(false);

  // Load shortlist from localStorage once on mount (client only).
  // Syncing external state into React on mount is the exact contract useEffect is designed for.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShortlist(getInitialShortlist());
    hasMountedRef.current = true;
  }, []);

  // Persist shortlist to localStorage whenever it changes (after mount)
  useEffect(() => {
    if (!hasMountedRef.current) return;
    try {
      localStorage.setItem(SHORTLIST_KEY, JSON.stringify(shortlist));
    } catch {
      // Ignore localStorage write errors
    }
  }, [shortlist]);

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

  const saved = shortlist.includes(active.name);
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

  function toggleSave() {
    setShortlist((current) => (current.includes(active.name) ? current.filter((name) => name !== active.name) : [...current, active.name]));
  }

  const contactHref = `/contact?area=${encodeURIComponent(active.name)}${shortlist.length ? `&areas=${encodeURIComponent(shortlist.join(', '))}` : ''}${type !== 'all' ? `&type=${encodeURIComponent(type)}` : ''}`;
  const shortlistHref = `/contact?areas=${encodeURIComponent(shortlist.join(', '))}`;

  return (
    <div className="studio" id="explore">
      <section className="area-hero">
        <div className="area-hero-copy">
          <p className="eyebrow">{t('areas.eyebrow')}</p>
          <h1 className="display">{t('areas.visualTitle')}</h1>
          <p className="lede">{t('areas.visualLede')}</p>
          <label className="area-search">
            <span className="sr-only">{t('areas.search')}</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('areas.search')} />
          </label>
        </div>
        <div className="area-hero-stack" aria-hidden="true">
          <Image src="/demo/dubai-tower.jpg" alt="" width={900} height={650} sizes="(max-width: 640px) calc(100vw - 20px), (max-width: 1000px) calc(100vw - 40px), 48vw" preload />
          <Image src="/demo/pool-villa.jpg" alt="" width={540} height={420} sizes="(max-width: 640px) 1px, (max-width: 1000px) 46vw, 24vw" />
          <Image src="/demo/city-apartment.jpg" alt="" width={500} height={360} sizes="(max-width: 640px) 1px, (max-width: 1000px) 42vw, 22vw" />
        </div>
      </section>

      <section className="area-match">
        <div>
          <h2>{t('areas.matchTitle')}</h2>
          <p>{t('areas.matchBody')}</p>
        </div>
        <div className="studio-filters stacked">
          <div className="studio-seg" role="group" aria-label={t('areas.mapTitle')}>
            <button className={group === 'all' ? 'active' : ''} type="button" onClick={() => setGroup('all')}>{t('areas.allDubai')}</button>
            {DUBAI_AREA_GROUPS.map((item) => (
              <button key={item.title} className={group === item.title ? 'active' : ''} type="button" onClick={() => setGroup(item.title)}>
                {GROUP_VISUALS[item.title].short}
              </button>
            ))}
          </div>
          <div className="studio-seg quiet" role="group" aria-label={t('areas.typesTitle')}>
            <button className={type === 'all' ? 'active' : ''} type="button" onClick={() => setType('all')}>{t('areas.anyType')}</button>
            {TYPE_FILTERS.map((item) => (
              <button key={item} className={type === item ? 'active' : ''} type="button" onClick={() => setType(item)}>{item}</button>
            ))}
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
                className={`${area.name === active.name ? 'active' : ''}${shortlist.includes(area.name) ? ' saved' : ''}`}
                type="button"
                role="option"
                aria-selected={area.name === active.name}
                onClick={() => handleSelectArea(area.name)}
              >
                <strong>{area.name}</strong>
                <span>{area.types.join(' · ')}</span>
              </button>
            ))}
            {shortlist.length > 0 && (
              <Link className="studio-shortlist" href={shortlistHref}>
                {t('areas.discussShortlist')} ({shortlist.length})
              </Link>
            )}
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
                  <button className="button button-secondary" type="button" onClick={toggleSave}>{saved ? t('areas.saved') : t('areas.save')}</button>
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
              <p className="fine-print">{t('areas.mapNote')}</p>
            </aside>
          </div>
        </div>
      )}

      <p className="fine-print studio-note">{t('areas.photoNote')}</p>
    </div>
  );
}
