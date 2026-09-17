import 'server-only';
import { promises as dns } from 'node:dns';

// Whitelist of major, verified email providers to resolve instantly (0ms latency)
const TRUSTED_DOMAINS = new Set([
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'ymail.com',
  'rocketmail.com',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'msn.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'aol.com',
  'zoho.com',
  'protonmail.com',
  'proton.me',
  'mail.ru',
  'yandex.ru',
  'yandex.com',
  'gmx.com',
  'gmx.de',
  'web.de',
  't-online.de',
  'orange.fr',
  'free.fr',
  'sfr.fr',
  'laposte.net',
  'rediffmail.com',
  'qq.com',
  '163.com',
  '126.com',
  'sina.com',
  'prudentspaces.ae',
  'prudentdubai.ae',
]);

const domainMxCache = new Map<string, { hasMx: boolean; checkedAt: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Configure resilient, fast public DNS resolvers (Google & Cloudflare)
try {
  const dnsSync = require('node:dns');
  dnsSync.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore in environments where setting custom servers is restricted
}

/**
 * Checks whether an email domain actually has live mail servers (MX records).
 * Uses local in-memory cache and a 2.5-second timeout to ensure fast responses.
 */
export async function verifyDomainHasMx(domain: string): Promise<{ valid: boolean; error?: string }> {
  const cleanDomain = domain.trim().toLowerCase();

  // 1. Instant zero-latency bypass for known real domains
  if (TRUSTED_DOMAINS.has(cleanDomain)) {
    return { valid: true };
  }

  // 2. Check in-memory cache
  const cached = domainMxCache.get(cleanDomain);
  if (cached && Date.now() - cached.checkedAt < CACHE_TTL_MS) {
    if (!cached.hasMx) {
      return {
        valid: false,
        error: `The email domain "${cleanDomain}" does not have active mail servers. Please use a valid email address.`,
      };
    }
    return { valid: true };
  }

  // 3. Perform DNS MX lookup with a tight 2.5s timeout
  try {
    const resolvePromise = dns.resolveMx(cleanDomain);
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('DNS_TIMEOUT')), 2500)
    );

    const records = await Promise.race([resolvePromise, timeoutPromise]);
    if (Array.isArray(records) && records.length > 0) {
      domainMxCache.set(cleanDomain, { hasMx: true, checkedAt: Date.now() });
      return { valid: true };
    }

    domainMxCache.set(cleanDomain, { hasMx: false, checkedAt: Date.now() });
    return {
      valid: false,
      error: `The email domain "${cleanDomain}" does not accept incoming mail. Please check for typos.`,
    };
  } catch (err: unknown) {
    const errorCode = (err as { code?: string })?.code;
    // If domain does not exist or has no MX record
    if (errorCode === 'ENOTFOUND' || errorCode === 'ENODATA' || errorCode === 'ESERVFAIL') {
      domainMxCache.set(cleanDomain, { hasMx: false, checkedAt: Date.now() });
      return {
        valid: false,
        error: `The email domain "${cleanDomain}" does not exist or cannot receive emails. Please provide a valid email.`,
      };
    }
    // On DNS timeout or network glitch, fail open so genuine users are not blocked
    return { valid: true };
  }
}
