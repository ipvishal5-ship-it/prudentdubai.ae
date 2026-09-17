const DISPOSABLE_EMAIL_DOMAINS = new Set([
  // Popular Disposable Mail Services
  'mailinator.com',
  'tempmail.com',
  'temp-mail.org',
  'temp-mail.io',
  '10minutemail.com',
  '10minutemail.net',
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.biz',
  'guerrillamail.org',
  'yopmail.com',
  'yopmail.fr',
  'yopmail.net',
  'throwawaymail.com',
  'trashmail.com',
  'trashmail.net',
  'trashmail.org',
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
  'emailondeck.com',
  'mohmal.com',
  'dropmail.me',
  'generator.email',
  'inboxkitten.com',
  'burnermail.io',
  'tempmailaddress.com',
  'minuteinbox.com',
  'getairmail.com',
  'meltmail.com',
  'trashmail.de',
  'discard.email',
  'spambog.com',
  'tempail.com',
  'internxt.com',
  'anonbox.net',
  'privatemail.com',
  'luxusmail.org',
  'jetable.org',
  'generator.email',
  'fakemail.net',
  'tmpmail.net',
  'tmpmail.org',
  'clipmail.eu',
  'armyspy.com',
  'cuvox.de',
  'dayrep.com',
  'einrot.com',
  'fleckens.hu',
  'gustr.com',
  'jourrapide.com',
  'rhyta.com',
  'superrito.com',
  'teleworm.us',
]);

const FAKE_DOMAIN_PATTERNS = [
  /^test\./i,
  /^fake\./i,
  /^example\./i,
  /^asdf\./i,
  /^qwerty\./i,
  /^abc\./i,
  /^foo\./i,
  /^bar\./i,
  /^none\./i,
  /^noemail\./i,
  /^sample\./i,
  /^testing\./i,
];

const FAKE_USERNAMES = new Set([
  'test',
  'testing',
  'fake',
  'asdf',
  'qwerty',
  'admin',
  'user',
  'sample',
  'dummy',
  'nobody',
  'none',
  'noemail',
  'null',
  'undefined',
  'xyz',
  'abc',
  '123456',
  '000000',
]);

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

  // Reject obvious fake usernames
  if (FAKE_USERNAMES.has(username)) {
    return { valid: false, error: 'Please provide a genuine personal or corporate email address.' };
  }

  // Reject usernames starting with test/fake/dummy followed by digits or symbols (e.g. test111111111111111111)
  if (/^(test|fake|dummy|sample|asdf|qwerty|demo|spam|noemail|nobody|temp)[0-9._-]/i.test(username)) {
    return { valid: false, error: 'Please enter a genuine personal or corporate email address.' };
  }

  // Check repeating consecutive characters anywhere in username (e.g. "11111", "aaaaa")
  if (/(.)\1{4,}/.test(username)) {
    return { valid: false, error: 'Please provide a valid email address without repetitive characters.' };
  }

  // Check excessive consecutive numeric sequence (7+ digits)
  if (/\d{7,}/.test(username)) {
    return { valid: false, error: 'Please provide a genuine personal or business email address.' };
  }

  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    return {
      valid: false,
      error: 'Temporary or disposable email addresses are not accepted. Please use a permanent email.',
    };
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

const FAKE_NAMES = new Set([
  'test',
  'testing',
  'fake',
  'asdf',
  'qwerty',
  'abc',
  'xyz',
  'demo',
  'sample',
  'dummy',
  'nobody',
  'none',
  'user',
  'admin',
  'test user',
  'test test',
  'fake user',
]);

export function validateLeadName(name: string): { valid: boolean; error?: string } {
  const trimmed = name.trim();
  const lower = trimmed.toLowerCase();

  if (trimmed.length < 2) {
    return { valid: false, error: 'Please enter your full name.' };
  }

  if (FAKE_NAMES.has(lower) || /^(test|fake|dummy|asdf|qwerty|demo)\s*(user|name|client|\d+)?$/i.test(lower)) {
    return { valid: false, error: 'Please provide your genuine full name.' };
  }

  // Must contain letters (English or Arabic)
  if (!/[a-zA-Z\u0600-\u06FF]/.test(trimmed)) {
    return { valid: false, error: 'Please enter a valid name containing letters.' };
  }

  // Reject repeating letters like "aaaa" or "zzzz"
  if (/(.)\1{3,}/i.test(trimmed)) {
    return { valid: false, error: 'Please enter a valid full name.' };
  }

  return { valid: true };
}

