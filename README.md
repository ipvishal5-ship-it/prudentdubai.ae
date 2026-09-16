# Prudent Spaces

Production-focused Next.js website for Prudent Spaces (`prudentspaces.ae`), the luxury Dubai property advisory division.

## Content integrity

- Public property inventory starts empty. Demonstration records are never presented as live listings.
- Every published property requires an HTTPS source, source name and verification date.
- Draft records are visible only in the private Content Studio.
- Editorial articles require a named primary source and review date.

## Content Studio

1. Copy `.env.example` to `.env.local` and replace every example secret.
2. Run `npm run dev` and open `/admin`.
3. Add or edit a property or insight. Keep it as `draft` until its source is checked.
4. Change status to `published` when it is ready for the public website.

The included file store writes atomically to `content/*.json`. It is suitable for a persistent Node.js server. Serverless filesystems such as Vercel functions are ephemeral; before a serverless production deployment, connect the same content schemas to a persistent CMS or database. Do not enable admin editing on an ephemeral host.

## Enquiries

The public form validates input server-side, uses a honeypot, same-origin checks and request throttling. It sends accepted enquiries to `LEAD_WEBHOOK_URL`. When no destination is configured it fails honestly and directs the visitor to WhatsApp; it never displays a false success message.

The webhook should belong to an approved CRM, automation or email service. Keep its URL and secret server-side.

## Development

```bash
npm install
npm run lint
npm run build
npm run dev
```

Before launch, obtain company approval for legal pages, configure the lead destination, add verified property records, and test the full editor and enquiry flows on the chosen host.
