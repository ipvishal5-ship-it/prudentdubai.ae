const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  '10minutemail.com',
  'guerrillamail.com',
  'yopmail.com',
  'throwawaymail.com',
  'trashmail.com',
  'dispostable.com',
  'sharklasers.com',
  'getnada.com',
  'maildrop.cc',
  'tempmail.net',
  'crazymailing.com',
  'tmail.ws',
  'binkmail.com',
  'bobmail.info',
  'chacuo.net',
  'devnullmail.com',
  'fakemailgenerator.com',
  'inboxbear.com',
  'mytemp.email',
  'nospam.ze.tc',
]);

const FAKE_DOMAIN_PATTERNS = [
  /^test\.com$/i,
  /^fake\.com$/i,
  /^example\.com$/i,
  /^asdf\.com$/i,
  /^qwerty\.com$/i,
  /^abc\.com$/i,
  /^foo\.com$/i,
  /^bar\.com$/i,
];

export function validateEmailAddress(email: string): { valid: boolean; error?: string } {
  const trimmed = email.trim().toLowerCase();

  if (!trimmed) {
    return { valid: false, error: 'Email address is required.' };
  }

  // Basic RFC 5322 regex validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: 'Please enter a valid email address (e.g. name@domain.com).' };
  }

  const parts = trimmed.split('@');
  if (parts.length !== 2) {
    return { valid: false, error: 'Invalid email structure.' };
  }

  const [username, domain] = parts;

  if (username.length < 2) {
    return { valid: false, error: 'Email username is too short.' };
  }

  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    return { valid: false, error: 'Temporary or disposable email addresses are not accepted. Please use a permanent email.' };
  }

  for (const pattern of FAKE_DOMAIN_PATTERNS) {
    if (pattern.test(domain)) {
      return { valid: false, error: 'Please enter a genuine personal or business email address.' };
    }
  }

  // Check top-level domain format
  const domainParts = domain.split('.');
  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2 || tld.length > 24) {
    return { valid: false, error: 'Invalid domain extension in email address.' };
  }

  return { valid: true };
}
