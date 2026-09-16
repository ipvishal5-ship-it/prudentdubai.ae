# Prudent Spaces

Production-focused Next.js website for Prudent Spaces (`prudentspaces.ae`), the premier Dubai luxury real estate and community advisory platform.

## Architecture & Focus

Prudent Spaces operates as an independent advisory service rather than a transactional portal:
- **Dubai Communities (`/communities`)**: Comprehensive guides and investment data across premier Dubai areas (Downtown, Palm Jumeirah, Business Bay, Dubai Marina, Dubai Creek Harbour, Dubai Hills Estate, and Damac Lagoons).
- **Off-Plan Advisory (`/off-plan`)**: Structural advisory on developer track records, escrow accounts, handover schedules, and RERA compliance.
- **Mortgage & Investment Calculator (`/calculator`)**: Precise DLD transfer fees, registration trustee costs, UAE Central Bank LTV down payments, and net rental yield formulas.
- **Market Insights (`/insights`)**: Authoritative editorial guides on Dubai real estate laws (Mollak, Law No. 8 of 2007 Escrow, Service Charges).
- Legacy `/properties` routes are permanently 301-redirected to `/communities`.

## Content Studio (`/admin`)

The private Admin Studio provides lead pipeline management and editorial publishing:
1. Copy `.env.example` to `.env.local` and configure secrets.
2. Run `npm run dev` and open `/admin`.
3. **Leads & Inquiries**: Monitor client submissions, filter by pipeline status (`New`, `Contacted`, `Meeting Scheduled`, `Closed`, `Archived`), record internal agent notes, and export CSVs.
4. **Market Insights**: Draft and publish verified advisory articles with citations.

The included local file store writes atomically to `content/*.json` and `data/*.json`. For production deployments, live customer inquiries are streamed directly to your configured `LEAD_WEBHOOK_URL` (e.g. Google Sheets) and email alerts.

## Enquiries & Real-Time Sync

The public enquiry system features:
- Server-side Zod validation, honeypot spam protection, and format verification.
- Rate-limiting per client IP and same-origin CSRF validation.
- Real-time webhook dispatch (`LEAD_WEBHOOK_URL`) to your private Google Sheet.
- Automated email notification to `info@prudentspaces.ae` (via Hostinger SMTP or Resend).
- Direct WhatsApp routing for immediate broker response.

## Development

```bash
npm install
npm run lint
npm run test:calculator
npm run build
npm run dev
```

Before final marketing campaigns, verify Google Search Console indexing, complete domain DNS delegation in Hostinger, and obtain final company sign-off on Privacy/Terms.
