import { z } from 'zod';

export const CURRENCY_CODES = ['AED', 'USD', 'EUR', 'GBP', 'INR', 'RUB', 'CNY', 'USDT'] as const;
export type Currency = (typeof CURRENCY_CODES)[number];

// AED is pegged to USD. Other rates are indicative unless a live FX provider is configured.
export const CURRENCIES: Record<Currency, { symbol: string; name: string; rate: number }> = {
  AED: { symbol: 'AED', name: 'UAE Dirham', rate: 1 },
  USD: { symbol: '$', name: 'US Dollar', rate: 0.272294 },
  EUR: { symbol: '€', name: 'Euro', rate: 0.233 },
  GBP: { symbol: '£', name: 'British Pound', rate: 0.202 },
  INR: { symbol: '₹', name: 'Indian Rupee', rate: 24.02 },
  RUB: { symbol: '₽', name: 'Russian Ruble', rate: 21.9 },
  CNY: { symbol: '¥', name: 'Chinese Yuan', rate: 1.95 },
  USDT: { symbol: 'USDT', name: 'Tether', rate: 0.272294 },
};

export function formatPrice(aed: number, currency: Currency = 'AED', locale: 'en' | 'ar' = 'en') {
  const item = CURRENCIES[currency];
  const number = new Intl.NumberFormat(locale === 'ar' ? 'ar-AE' : 'en-AE', { maximumFractionDigits: 0 }).format(Math.round(aed * item.rate));
  return `${item.symbol} ${number}`;
}

const httpsUrl = z.string().url().refine((value) => value.startsWith('https://'), 'Use an HTTPS URL');
const webImage = z.string().refine(
  (value) => !value || /^\/[a-zA-Z0-9/_\-.]+$/.test(value) || (z.string().url().safeParse(value).success && value.startsWith('https://')),
  'Use a local /path or an HTTPS URL',
);


export const articleSchema = z.object({
  id: z.string().min(3).max(80),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  status: z.enum(['draft', 'published']),
  title: z.string().min(5).max(160),
  titleAr: z.string().min(5).max(200).optional(),
  excerpt: z.string().min(20).max(420),
  excerptAr: z.string().min(20).max(500).optional(),
  body: z.array(z.string().min(20).max(1600)).min(1).max(20),
  bodyAr: z.array(z.string().min(20).max(2000)).optional(),
  category: z.string().min(2).max(60),
  categoryAr: z.string().min(2).max(80).optional(),
  publishedAt: z.string().date(),
  updatedAt: z.string().date(),
  sourceLabel: z.string().min(2).max(100),
  sourceLabelAr: z.string().min(2).max(120).optional(),
  sourceUrl: httpsUrl,
  imageUrl: webImage.optional(),
  readTime: z.string().min(2).max(40).optional(),
  readTimeAr: z.string().min(2).max(40).optional(),
  author: z.string().min(2).max(80).optional(),
  authorAr: z.string().min(2).max(80).optional(),
  keyTakeaways: z.array(z.string().min(5).max(250)).optional(),
  keyTakeawaysAr: z.array(z.string().min(5).max(300)).optional(),
});
export type Article = z.infer<typeof articleSchema>;

export const siteSettingsSchema = z.object({
  phone: z.string().min(8).max(30),
  whatsapp: z.string().regex(/^\d{8,18}$/),
  email: z.string().email(),
  dubaiOffice: z.string().min(10).max(220),
  sharjahOffice: z.string().optional(),
  mumbaiOffice: z.string().optional(),
  sisterWebsite: httpsUrl,
});
export type SiteSettings = z.infer<typeof siteSettingsSchema>;

export const leadSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(160),
  phone: z.string().trim().min(7).max(30),
  country: z.string().trim().max(80).optional().default(''),
  interest: z.enum(['Buy a home', 'Property investment', 'Off-plan enquiry', 'Ready property', 'General enquiry']),
  budget: z.string().trim().max(80).optional().default(''),
  message: z.string().trim().max(1200).optional().default(''),
  consent: z.literal(true),
  website: z.string().max(0),
});
export type Lead = z.infer<typeof leadSchema>;
