'use client';

import { useLanguage } from './LanguageContext';
import siteSettings from '@/content/site.json';

export default function FloatingWhatsApp() {
  const { locale, t } = useLanguage();
  const rawNumber = siteSettings.whatsapp || '971555541538';
  const isRtl = locale === 'ar';
  
  const text = isRtl
    ? 'مرحباً برودنت دبي، أرغب في الاستفسار عن العقارات والفرص الاستثمارية في دبي.'
    : 'Hello Prudent Dubai, I would like to enquire about property advisory and investment opportunities in Dubai.';

  const href = `https://wa.me/${rawNumber}?text=${encodeURIComponent(text)}`;

  return (
    <div className="floating-whatsapp-wrap" dir={isRtl ? 'rtl' : 'ltr'}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="floating-whatsapp-btn"
        aria-label={t('floatingWhatsapp.tooltip')}
      >
        <div className="whatsapp-icon-box">
          <svg viewBox="0 0 32 32" className="whatsapp-svg" fill="currentColor">
            <path d="M16 2a13.94 13.94 0 0 0-11.83 21.36L2.3 29.7a1 1 0 0 0 1.25 1.25l6.34-1.87A13.94 13.94 0 1 0 16 2zm0 25.5a11.45 11.45 0 0 1-5.84-1.59 1 1 0 0 0-.75-.12l-4.22 1.24 1.24-4.22a1 1 0 0 0-.12-.75A11.5 11.5 0 1 1 16 27.5zm6.54-8.52c-.36-.18-2.12-1.05-2.45-1.17s-.57-.18-.81.18-.93 1.17-1.14 1.41-.42.27-.78.09a9.88 9.88 0 0 1-2.9-1.79 10.9 10.9 0 0 1-2.01-2.5c-.21-.36 0-.55.17-.73.16-.16.36-.42.54-.63a2.44 2.44 0 0 0 .36-.6.67.67 0 0 0-.03-.63c-.09-.18-.81-1.95-1.11-2.67-.3-.72-.6-.62-.81-.63h-.69a1.33 1.33 0 0 0-.96.45 4.07 4.07 0 0 0-1.27 3.03 7.08 7.08 0 0 0 1.47 3.75c.18.24 2.55 3.9 6.18 5.47a20.4 20.4 0 0 0 2.06.76 4.94 4.94 0 0 0 2.27.14 3.71 3.71 0 0 0 2.43-1.71 3 3 0 0 0 .21-1.71c-.09-.15-.36-.24-.72-.42z" />
          </svg>
        </div>
        <div className="whatsapp-label-box">
          <strong className="whatsapp-title">{t('floatingWhatsapp.tooltip')}</strong>
        </div>
      </a>
    </div>
  );
}
