import 'server-only';

import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'pd_admin_session';
const SESSION_SECONDS = 60 * 60 * 8;

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

function secret() {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value || value.length < 32) return null;
  return value;
}

function sign(payload: string, key: string) {
  return createHmac('sha256', key).update(payload).digest('base64url');
}

export function adminIsConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD && secret());
}

export function verifyAdminPassword(password: string) {
  const configured = process.env.ADMIN_PASSWORD;
  if (!configured || password.length > 256) return false;
  const suppliedHash = createHash('sha256').update(password).digest('hex');
  const configuredHash = createHash('sha256').update(configured).digest('hex');
  return safeEqual(suppliedHash, configuredHash);
}

export async function createAdminSession() {
  const key = secret();
  if (!key) throw new Error('Admin authentication is not configured');
  const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const payload = `admin.${expires}`;
  const token = `${payload}.${sign(payload, key)}`;
  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_SECONDS,
  });
}

export async function destroyAdminSession() {
  (await cookies()).delete(COOKIE_NAME);
}

export async function isAdminAuthenticated() {
  const key = secret();
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!key || !token) return false;
  const [role, expiresRaw, signature] = token.split('.');
  if (role !== 'admin' || !expiresRaw || !signature) return false;
  const expires = Number(expiresRaw);
  if (!Number.isSafeInteger(expires) || expires < Math.floor(Date.now() / 1000)) return false;
  return safeEqual(signature, sign(`${role}.${expiresRaw}`, key));
}
