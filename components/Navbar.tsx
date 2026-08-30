'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { CURRENCIES, Currency } from '@/lib/data';
import { useCurrency } from './CurrencyContext';
import { useLanguage } from './LanguageContext';
import type { MessageKey } from '@/lib/i18n';

const links = [
  ['nav.properties', '/properties'], ['nav.offPlan', '/off-plan'], ['nav.communities', '/communities'],
  ['nav.insights', '/insights'], ['nav.about', '/about'], ['nav.contact', '/contact'],
] as const;

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { currency, setCurrency } = useCurrency();
  const { locale, setLocale, t } = useLanguage();
  return <header className="site-header">
    <div className="container nav">
      <Link href="/" className="brand" aria-label="Prudent Dubai Properties home">
        <Image src="/brand/prudent-dubai-logo.png" alt="Prudent Dubai" width={189} height={54} priority />
        <span className="brand-word">DUBAI<br />PROPERTIES</span>
      </Link>
      <nav className={`nav-links${open ? ' open' : ''}`} aria-label="Main navigation">
        {links.map(([key, href]) => <Link key={href} className={pathname.startsWith(href) ? 'active' : ''} href={href} onClick={() => setOpen(false)}>{t(key as MessageKey)}</Link>)}
      </nav>
      <div className="nav-tools">
        <div className="language-switch" aria-label={t('language.label')}>
          <button className={locale === 'en' ? 'active' : ''} onClick={() => setLocale('en')} lang="en">EN</button>
          <button className={locale === 'ar' ? 'active' : ''} onClick={() => setLocale('ar')} lang="ar">ع</button>
        </div>
        <select className="currency-select" value={currency} onChange={(e) => setCurrency(e.target.value as Currency)} aria-label={t('currency.label')}>
          {(Object.keys(CURRENCIES) as Currency[]).map(code => <option key={code}>{code}</option>)}
        </select>
        <Link className="button button-primary" href="/contact">{t('nav.talk')}</Link>
        <button className="menu-toggle" aria-label="Toggle navigation" aria-expanded={open} onClick={() => setOpen(!open)}>☰</button>
      </div>
    </div>
  </header>;
}
