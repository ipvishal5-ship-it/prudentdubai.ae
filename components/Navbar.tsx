'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { arabicEnabled, useLanguage } from './LanguageContext';
import type { MessageKey } from '@/lib/i18n';

const links = [
  ['nav.areas', '/communities'], ['nav.offPlan', '/off-plan'],
  ['nav.insights', '/insights'], ['nav.about', '/about'], ['nav.contact', '/contact'],
] as const;

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { locale, setLocale, t } = useLanguage();

  return (
    <header className="site-header">
      <div className="container nav">
        <Link href="/" className="brand" aria-label="Prudent Dubai Properties home">
          <Image
            src="/brand/prudentlogo.png"
            alt="Prudent Dubai Properties"
            width={172}
            height={49}
            priority
            unoptimized
          />
        </Link>

        <nav className={`nav-links${open ? ' open' : ''}`} aria-label="Main navigation">
          {links.map(([key, href]) => (
            <Link
              key={href}
              className={pathname.startsWith(href) ? 'active' : ''}
              href={href}
              onClick={() => setOpen(false)}
            >
              {t(key as MessageKey)}
            </Link>
          ))}
        </nav>

        <div className="nav-tools">
          {arabicEnabled && <div className="language-switch" aria-label={t('language.label')}>
            <button
              className={locale === 'en' ? 'active' : ''}
              onClick={() => setLocale('en')}
              lang="en"
              aria-label="English"
            >
              EN
            </button>
            <button
              className={locale === 'ar' ? 'active' : ''}
              onClick={() => setLocale('ar')}
              lang="ar"
              aria-label="العربية"
            >
              ع
            </button>
          </div>}

          <Link className="button button-primary" href="/contact">
            {t('nav.talk')}
          </Link>

          <button
            className={`menu-toggle${open ? ' active' : ''}`}
            aria-label="Toggle navigation"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? '✕' : '☰'}
          </button>
        </div>
      </div>
    </header>
  );
}
