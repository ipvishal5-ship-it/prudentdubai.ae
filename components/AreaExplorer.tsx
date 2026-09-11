'use client';

import Link from 'next/link';
import { KeyboardEvent, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { DUBAI_AREA_GROUPS, GROUP_VISUALS, TYPE_FILTERS, VISUAL_AREAS } from '@/lib/areas';
import type { MessageKey } from '@/lib/i18n';
import { useLanguage } from './LanguageContext';

const PURPOSES = [
  { id: 'home', titleKey: 'areas.purposeHome', groups: ['Family communities & villas', 'Established neighbourhoods', 'Central & waterfront'] },
  { id: 'invest', titleKey: 'areas.purposeInvest', groups: ['Central & waterfront', 'Popular apartment districts', 'Value & emerging districts'] },
  { id: 'visa', titleKey: 'areas.purposeVisa', groups: ['Family communities & villas', 'Central & waterfront'] },
] as const;

const SHORTLIST_KEY = 'pd_area_shortlist';

function mapEmbedUrl(lat: number, lng: number) {
  const delta = 0.035;
  const left = lng - delta;
  const right = lng + delta;
  const top = lat + delta * 0.75;
  const bottom = lat - delta * 0.75;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${lat}%2C${lng}`;
}

export default function AreaExplorer() {
  const { t } = useLanguage();
  const params = useSearchParams();
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('all');
  const [type, setType] = useState('all');
  const [purpose, setPurpose] = useState<(typeof PURPOSES)[number]['id'] | 'all'>('all');
  const [activeName, setActiveName] = useState(VISUAL_AREAS[0].name);
  const [shortlist, setShortlist] = useState<string[]>([]);
  const [hasLoadedShortlist, setHasLoadedShortlist] = useState(false);

  useEffect(() => {
    const requested = params.get('area');
    const requestedType = params.get('type');
    if (requested && VISUAL_AREAS.some((area) => area.name === requested)) setActiveName(requested);
    if (requestedType && TYPE_FILTERS.includes(requestedType as (typeof TYPE_FILTERS)[number])) setType(requestedType);
  }, [params]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SHORTLIST_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as string[];
        if (Array.isArray(parsed)) setShortlist(parsed.filter((name) => VISUAL_AREAS.some((area) => area.name === name)));
      }
    } catch {
      // Ignore localStorage access errors
    } finally {
      setHasLoadedShortlist(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedShortlist) return;
    try {
      localStorage.setItem(SHORTLIST_KEY, JSON.stringify(shortlist));
    } catch {
      // Ignore localStorage write errors
    }
  }, [hasLoadedShortlist, shortlist]);

  const filtered = useMemo(() => {
    const purposeGroups = PURPOSES.find((item) => item.id === purpose)?.groups;
    return VISUAL_AREAS.filter((area) => {
      const matchesQuery = !query || area.name.toLowerCase().includes(query.toLowerCase());
      const matchesGroup = group === 'all' || area.group === group;
      const matchesType = type === 'all' || area.types.includes(type);
      const matchesPurpose = !purposeGroups || (purposeGroups as readonly string[]).includes(area.group);
      return matchesQuery && matchesGroup && matchesType && matchesPurpose;
    });
  }, [group, purpose, query, type]);

  const active = filtered.find((area) => area.name === activeName) ?? filtered[0] ?? VISUAL_AREAS[0];
  const saved = shortlist.includes(active.name);
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${active.name}, Dubai`)}`;
  const mapSrc = mapEmbedUrl(active.lat, active.lng);

  useEffect(() => {
    if (!filtered.some((area) => area.name === activeName) && filtered[0]) setActiveName(filtered[0].name);
  }, [activeName, filtered]);

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

  const contactHref = `/contact?area=${encodeURIComponent(active.name)}${shortlist.length ? `&areas=${encodeURIComponent(shortlist.join(', '))}` : ''}${type !== 'all' ? `&type=${encodeURIComponent(type)}` : ''}${purpose !== 'all' ? `&purpose=${purpose}` : ''}`;
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
          <div className="button-row">
            <Link className="button button-primary" href="/contact">{t('areas.cta')}</Link>
            <a className="button button-secondary" href="#area-board">{t('areas.browseAreas')}</a>
          </div>
        </div>
        <div className="area-hero-stack" aria-hidden="true">
          <img src="/demo/dubai-tower.jpg" alt="" />
          <img src="/demo/pool-villa.jpg" alt="" />
          <img src="/demo/city-apartment.jpg" alt="" />
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
          <div className="studio-seg quiet" role="group" aria-label={t('areas.purposeTitle')}>
            <button className={purpose === 'all' ? 'active' : ''} type="button" onClick={() => setPurpose('all')}>{t('areas.all')}</button>
            {PURPOSES.map((item) => (
              <button key={item.id} className={purpose === item.id ? 'active' : ''} type="button" onClick={() => setPurpose(item.id)}>
                {t(item.titleKey as MessageKey)}
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
          <button className="button button-primary" type="button" onClick={() => { setQuery(''); setGroup('all'); setType('all'); setPurpose('all'); }}>{t('areas.reset')}</button>
        </div>
      ) : (
        <div className="studio-board" id="area-board">
          <div className="studio-list" role="listbox" aria-label={t('areas.mapTitle')} tabIndex={0} onKeyDown={onListKey}>
            <p className="studio-count">{filtered.length} {t('areas.count')}</p>
            {filtered.map((area) => (
              <button
                key={area.name}
                className={`${area.name === active.name ? 'active' : ''}${shortlist.includes(area.name) ? ' saved' : ''}`}
                type="button"
                role="option"
                aria-selected={area.name === active.name}
                onClick={() => setActiveName(area.name)}
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
              <img key={active.image + active.name} src={active.image} alt="" />
              <div className="studio-feature-copy">
                <p className="eyebrow">{GROUP_VISUALS[active.group].short}</p>
                <h2>{active.name}</h2>
                <p>{active.summary}</p>
                <p className="studio-meta">
                  {active.types.join(' · ')}
                  {active.kmToDowntown > 0 ? ` · ${active.kmToDowntown} ${t('areas.kmDowntown')}` : ` · ${t('areas.downtownCore')}`}
                </p>
                <div className="button-row">
                  <Link className="button button-primary" href={contactHref}>{t('areas.talkArea')}</Link>
                  <button className="button button-secondary" type="button" onClick={toggleSave}>{saved ? t('areas.saved') : t('areas.save')}</button>
                </div>
              </div>
            </article>

            <aside className="studio-map-panel">
              <div className="studio-map-head">
                <div>
                  <p className="eyebrow">{t('areas.mapLabel')}</p>
                  <h3>{active.name}</h3>
                </div>
                <a className="button button-secondary" href={mapsLink} target="_blank" rel="noopener noreferrer">{t('areas.openMaps')}</a>
              </div>
              <div className="studio-map-frame">
                <iframe
                  key={`${active.lat}-${active.lng}`}
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
