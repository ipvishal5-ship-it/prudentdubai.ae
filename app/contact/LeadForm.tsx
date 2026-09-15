'use client';

import { FormEvent, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/components/LanguageContext';
import { COUNTRIES, DEFAULT_COUNTRY, findCountry, validatePhoneNumber } from '@/lib/phone-country';
import { validateEmailAddress } from '@/lib/email-validator';

export default function LeadForm({ whatsapp }: { whatsapp: string }) {
  const { locale, t } = useLanguage();
  const params = useSearchParams();
  const area = params.get('area') || '';
  const areas = params.get('areas') || '';
  const type = params.get('type') || '';
  const purpose = params.get('purpose') || '';

  const seeded = [
    area && `Preferred area: ${area}`,
    areas && `Shortlist: ${areas}`,
    type && `Property type: ${type}`,
    purpose === 'home' && 'Purpose: home to live in',
    purpose === 'invest' && 'Purpose: investment',
  ].filter(Boolean).join('. ');

  const interestDefault = purpose === 'invest' ? 'Property investment' : purpose === 'home' ? 'Buy a home' : '';
  const [selectedCountryCode, setSelectedCountryCode] = useState('AE');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [status, setStatus] = useState<'idle' | 'busy' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ phone?: string; email?: string }>({});

  const activeCountry = findCountry(selectedCountryCode);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setFieldErrors({});
    setMessage('');

    const form = new FormData(formElement);
    const rawEmail = String(form.get('email') || '');
    const rawPhone = String(form.get('phone') || '');
    const honeypot = String(form.get('website') || '');

    // Honeypot anti-spam check
    if (honeypot) {
      // Trapped bot silently
      setStatus('success');
      setMessage(t('contact.form.success'));
      return;
    }

    // 1. Validate Email Address
    const emailCheck = validateEmailAddress(rawEmail);
    if (!emailCheck.valid) {
      setStatus('error');
      setFieldErrors((prev) => ({ ...prev, email: emailCheck.error }));
      setMessage(emailCheck.error || 'Please enter a valid email address.');
      return;
    }

    // 2. Validate Phone Number against Selected Country
    const phoneCheck = validatePhoneNumber(rawPhone, activeCountry);
    if (!phoneCheck.valid) {
      setStatus('error');
      setFieldErrors((prev) => ({ ...prev, phone: phoneCheck.error }));
      setMessage(phoneCheck.error || 'Please enter a valid phone number.');
      return;
    }

    setStatus('busy');

    const body = {
      name: String(form.get('name') || '').trim(),
      email: rawEmail.trim().toLowerCase(),
      phone: phoneCheck.formatted,
      country: activeCountry.name,
      interest: form.get('interest'),
      budget: String(form.get('budget') || '').trim(),
      message: String(form.get('message') || '').trim(),
      consent: form.get('consent') === 'on',
      website: '',
    };

    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || t('contact.form.error'));

      setStatus('success');
      setMessage(t('contact.form.success'));
      setPhoneNumber('');
      setEmailAddress('');
      formElement.reset();
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error && error.message ? error.message : t('contact.form.error'));
    }
  }

  return (
    <form className="lead-form" onSubmit={submit} noValidate>
      <span className="eyebrow">{t('contact.form.eyebrow')}</span>
      <h2 className="section-title" style={{ fontSize: '2rem' }}>
        {t('contact.form.title')}
      </h2>

      {/* Honeypot field for bot trapping */}
      <div className="hp-field" style={{ display: 'none' }} aria-hidden="true">
        <label>
          Website<input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="form-pair">
        <label className="field-label">
          {t('contact.form.name')} *
          <input
            className="field-input"
            name="name"
            required
            maxLength={100}
            autoComplete="name"
            placeholder="e.g. Alexander Vance"
          />
        </label>
        <label className="field-label">
          {t('contact.form.email')} *
          <input
            className={`field-input ${fieldErrors.email ? 'input-error' : ''}`}
            name="email"
            required
            type="email"
            maxLength={160}
            autoComplete="email"
            value={emailAddress}
            onChange={(e) => {
              setEmailAddress(e.target.value);
              if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
            }}
            placeholder="e.g. name@company.com"
          />
          {fieldErrors.email && <span className="field-hint-error">{fieldErrors.email}</span>}
        </label>
      </div>

      <div className="form-pair">
        <label className="field-label">
          {t('contact.form.country')} *
          <select
            className="field-input"
            name="countryCode"
            value={selectedCountryCode}
            onChange={(e) => setSelectedCountryCode(e.target.value)}
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {locale === 'ar' ? c.nameAr : c.name} ({c.dialCode})
              </option>
            ))}
          </select>
        </label>

        <label className="field-label">
          {t('contact.form.phone')} *
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span
              style={{
                padding: '0 12px',
                height: 52,
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(0,0,0,0.03)',
                border: '1px solid rgba(0,0,0,0.12)',
                borderRadius: 8,
                fontSize: '0.95rem',
                fontWeight: 600,
                color: '#334155',
                whiteSpace: 'nowrap',
              }}
            >
              {activeCountry.dialCode}
            </span>
            <input
              className={`field-input ${fieldErrors.phone ? 'input-error' : ''}`}
              style={{ flex: 1 }}
              name="phone"
              required
              type="tel"
              maxLength={30}
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value);
                if (fieldErrors.phone) setFieldErrors((prev) => ({ ...prev, phone: undefined }));
              }}
              placeholder={activeCountry.placeholder}
              autoComplete="tel-national"
            />
          </div>
          {fieldErrors.phone && <span className="field-hint-error">{fieldErrors.phone}</span>}
        </label>
      </div>

      <div className="form-pair">
        <label className="field-label">
          {t('contact.form.purpose')} *
          <select className="field-input" name="interest" required defaultValue={interestDefault}>
            <option value="" disabled>
              {t('contact.form.selectOne')}
            </option>
            <option value="Buy a home">{t('contact.form.purposeHome')}</option>
            <option value="Property investment">{t('contact.form.purposeInvest')}</option>
            <option value="Off-plan enquiry">{t('contact.form.purposeOffPlan')}</option>
            <option value="Ready property">{t('contact.form.purposeReady')}</option>
            <option value="General enquiry">{t('contact.form.purposeGeneral')}</option>
          </select>
        </label>
        <label className="field-label">
          {t('contact.form.budget')}
          <input
            className="field-input"
            name="budget"
            maxLength={80}
            placeholder={t('contact.form.budgetPlaceholder')}
          />
        </label>
      </div>

      <label className="field-label">
        {t('contact.form.message')}
        <textarea
          className="field-input field-textarea"
          name="message"
          maxLength={1200}
          defaultValue={seeded}
          placeholder={t('contact.form.messagePlaceholder')}
        />
      </label>

      <label className="check-label">
        <input type="checkbox" name="consent" required defaultChecked />
        {t('contact.form.consent')}
      </label>

      <button className="button button-primary" disabled={status === 'busy'}>
        {status === 'busy' ? t('contact.form.sending') : t('contact.form.send')}
      </button>

      {message && (
        <p className={status === 'success' ? 'form-success' : 'form-error'} role="status" style={{ marginTop: 16 }}>
          {message}
          {status === 'error' && (
            <>
              {' '}
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer">
                {t('contact.form.whatsappFallback')}
              </a>
            </>
          )}
        </p>
      )}
    </form>
  );
}
