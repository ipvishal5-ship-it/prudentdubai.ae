import type { NextConfig } from 'next';
import path from 'node:path';

const isDev = process.env.NODE_ENV !== 'production';

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "frame-src 'self' https://www.openstreetmap.org https://www.google.com https://maps.google.com",
  "object-src 'none'",
  `script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval'" : ''}`.trim(),
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https:",
  "connect-src 'self'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join('; ');

const nextConfig: NextConfig = {
  turbopack: { root: path.resolve(process.cwd()) },
  poweredByHeader: false,
  reactStrictMode: true,
  async redirects() {
    return [
      { source: '/properties', destination: '/communities', permanent: true },
      { source: '/properties/:slug*', destination: '/communities', permanent: true },
    ];
  },
  async headers() {
    return [{ source: '/(.*)', headers: [
      { key: 'Content-Security-Policy', value: contentSecurityPolicy },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
      { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
      { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
    ] }];
  },
};
export default nextConfig;
