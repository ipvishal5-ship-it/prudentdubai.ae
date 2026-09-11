'use client';

import { FormEvent, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function LeadForm({ whatsapp }: { whatsapp: string }) {
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
    purpose === 'visa' && 'Purpose: Golden Visa planning',
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
    const response = await fetch('/api/inquiries', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    const result = await response.json() as { error?: string };
    if (response.ok) {
      setStatus('success');
      setMessage('Thank you. Your enquiry was sent to the Prudent team.');
      event.currentTarget.reset();
    } else {
      setStatus('error');
      setMessage(result.error || 'Unable to send the enquiry.');
    }
  }

  return (
    <form className="lead-form" onSubmit={submit}>
      <span className="eyebrow">Requirement brief</span>
      <h2 className="section-title" style={{ fontSize: '2rem' }}>What are you looking for?</h2>
      <div className="hp-field"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <div className="form-pair">
        <label className="field-label">Name<input className="field-input" name="name" required maxLength={100} autoComplete="name" /></label>
        <label className="field-label">Email<input className="field-input" name="email" required type="email" maxLength={160} autoComplete="email" /></label>
      </div>
      <div className="form-pair">
        <label className="field-label">Phone / WhatsApp<input className="field-input" name="phone" required maxLength={30} autoComplete="tel" /></label>
        <label className="field-label">Country of residence<input className="field-input" name="country" maxLength={80} autoComplete="country-name" /></label>
      </div>
      <div className="form-pair">
        <label className="field-label">Purpose
          <select className="field-input" name="interest" required defaultValue={interestDefault}>
            <option value="" disabled>Select one</option>
            <option>Buy a home</option>
            <option>Property investment</option>
            <option>Off-plan enquiry</option>
            <option>Ready property</option>
            <option>General enquiry</option>
          </select>
        </label>
        <label className="field-label">Approximate budget<input className="field-input" name="budget" maxLength={80} placeholder="For example: AED 1.5M" /></label>
      </div>
      <label className="field-label">Useful context<textarea className="field-input field-textarea" name="message" maxLength={1200} defaultValue={seeded} placeholder="Preferred areas, property type, timing or a project name" /></label>
      <label className="check-label"><input type="checkbox" name="consent" required />I agree that Prudent Dubai may use these details to respond to this enquiry. I have not included sensitive identity or financial documents.</label>
      <button className="button button-primary" disabled={status === 'busy'}>{status === 'busy' ? 'Sending…' : 'Send enquiry'}</button>
      {message && <p className={status === 'success' ? 'form-success' : 'form-error'} role="status">{message}{status === 'error' && <> <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer">Use WhatsApp instead.</a></>}</p>}
    </form>
  );
}
