'use client';

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Locale, MessageKey, messages } from '@/lib/i18n';

type LanguageValue = { locale: Locale; setLocale: (locale: Locale) => void; t: (key: MessageKey) => string };
const LanguageContext = createContext<LanguageValue>({ locale: 'en', setLocale: () => {}, t: (key) => messages.en[key] });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  useEffect(() => {
    const saved = localStorage.getItem('pd_locale');
    if (saved !== 'ar') return;
    const frame = requestAnimationFrame(() => setLocaleState('ar'));
    return () => cancelAnimationFrame(frame);
  }, []);
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
  }, [locale]);
  const setLocale = (next: Locale) => { setLocaleState(next); localStorage.setItem('pd_locale', next); };
  return <LanguageContext.Provider value={{ locale, setLocale, t: (key) => messages[locale][key] }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() { return useContext(LanguageContext); }
export function T({ id }: { id: MessageKey }) { return <>{useLanguage().t(id)}</>; }
