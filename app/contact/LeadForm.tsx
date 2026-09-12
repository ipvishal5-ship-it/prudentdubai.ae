'use client';

import { FormEvent, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/components/LanguageContext';

export default function LeadForm({ whatsapp }: { whatsapp: string }) {
  const { t } = useLanguage();
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
  const [status, setStatus] = useState<'idle' | 'busy' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('busy');
    setMessage('');
    const form = new FormData(event.currentTarget);
    const body = {
      name: form.get('name'),
      email: form.get('email'),
      phone: form.get('phone'),
      country: form.get('country') || '',
      interest: form.get('interest'),
      budget: form.get('budget') || '',
      message: form.get('message') || '',
      consent: form.get('consent') === 'on',
      website: form.get('website') || '',
    };
    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error);
      setStatus('success');
      setMessage(t('contact.form.success'));
      event.currentTarget.reset();
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error && error.message ? error.message : t('contact.form.error'));
    }
  }

  return (
    <form className="lead-form" onSubmit={submit}>
      <span className="eyebrow">{t('contact.form.eyebrow')}</span>
      <h2 className="section-title" style={{ fontSize: '2rem' }}>
        {t('contact.form.title')}
      </h2>
      <div className="hp-field">
        <label>
          Website<input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className="form-pair">
        <label className="field-label">
          {t('contact.form.name')}
          <input className="field-input" name="name" required maxLength={100} autoComplete="name" />
        </label>
        <label className="field-label">
          {t('contact.form.email')}
          <input className="field-input" name="email" required type="email" maxLength={160} autoComplete="email" />
        </label>
      </div>
      <div className="form-pair">
        <label className="field-label">
          {t('contact.form.phone')}
          <input className="field-input" name="phone" required maxLength={30} autoComplete="tel" />
        </label>
        <label className="field-label">
          {t('contact.form.country')}
          <input className="field-input" name="country" maxLength={80} autoComplete="country-name" />
        </label>
      </div>
      <div className="form-pair">
        <label className="field-label">
          {t('contact.form.purpose')}
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
        <input type="checkbox" name="consent" required />
        {t('contact.form.consent')}
      </label>
      <button className="button button-primary" disabled={status === 'busy'}>
        {status === 'busy' ? t('contact.form.sending') : t('contact.form.send')}
      </button>
      {message && (
        <p className={status === 'success' ? 'form-success' : 'form-error'} role="status">
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
