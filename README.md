# VEYRA — Know. Decide. Grow.

An AI-powered business decision assistant for local vendors, retailers, manufacturers,
and growing small/medium businesses. Real database, real auth, real calculations —
no external API key required (the AI Advisor ships with a rule-based engine).

## What's real here

- **Auth**: passwords hashed with bcrypt, signed JWT session cookies, protected routes via middleware.
- **Database**: Prisma + SQLite by default (zero setup — a `dev.db` file). Swap the `DATABASE_URL`
  in `.env` to a Postgres connection string for production; the schema works unchanged.
- **Data isolation**: every query is scoped to the logged-in user's business (`requireBusiness()`),
  so one account can never see another's records.
- **Real calculations**: reorder level, EOQ, gross margin, break-even, supplier scoring, and a
  business health score — all computed server-side in `src/lib/calculations.ts`, never faked.
- **AI Advisor**: `src/lib/advisor.ts` is a rule-based engine that answers using this business's
  own live data. If you later add a real LLM (set `AI_API_KEY`), wire it into
  `src/lib/actions/advisor.ts` — the plumbing (auth, data scoping, UI) is already in place.
- **Manufacturer mode**: Bill of Materials + Work Orders, with a raw-material availability
  check before a batch is allowed to start, and stock consumption/production on completion.

## Business types

At onboarding, a business picks: **vendor**, **retailer**, **manufacturer**, or **medium**.
This is stored on the `Business.businessType` field and currently changes:
- Which item the bottom nav's third tab points to (Stock vs. Manufacturing)
- Whether the Manufacturing module makes sense to use (raw material / finished good products)

This is intentionally the seam to extend further — e.g. hide unused nav items entirely per
type, or add medium-business features like multi-user roles.

## Getting started locally

```bash
npm install
cp .env.example .env
# open .env and set SESSION_SECRET to a random string, e.g.:
# openssl rand -base64 32

npx prisma migrate dev --name init
npm run seed        # loads the demo account: demo@veyra.app / demo1234
npm run dev
```

Open http://localhost:3000 — log in with the demo account, or register a new one
(new accounts go through onboarding to create their own business).

## Deploying it for real

**Database**: SQLite is fine for local use but won't survive most serverless hosts.
For production, create a free Postgres database at [Neon](https://neon.tech) or
[Supabase](https://supabase.com), then:

1. In `prisma/schema.prisma`, change `provider = "sqlite"` to `provider = "postgresql"`.
2. Set `DATABASE_URL` (in your host's environment variables, not committed) to the
   connection string your Postgres provider gives you.
3. Run `npx prisma migrate deploy` against that database once (from your machine or
   a one-off deploy step).

**Hosting**: push this repo to GitHub, then import it into [Vercel](https://vercel.com)
(it auto-detects Next.js). Add these environment variables in the Vercel project settings:

```
DATABASE_URL=<your postgres connection string>
SESSION_SECRET=<a long random string>
```

Deploy. That's a live URL you can share.

**Publishing as a mobile app**: this is a responsive web app (mobile-first, works great
in a phone browser and can be "Add to Home Screen"). To publish to the Play Store /
App Store as an actual app listing, wrap it with a tool like
[Capacitor](https://capacitorjs.com) — that's a separate, well-documented step once the
web app above is deployed and stable.

## What's intentionally left as a next step

This scaffold prioritizes getting the core loop genuinely working end-to-end (auth →
onboarding → real data → real calculations → real AI advisor) over covering every module
from the original spec shallowly. Not yet built:

- Full regional-language i18n (architecture note: centralize strings in a `locales/`
  folder as keys, e.g. `dashboard.title`, and swap by a `language` field on `Business`
  the same way `theme` works now)
- Multi-user roles/permissions per business (medium-business tier)
- Barcode scanning, audit log, CSV/PDF export
- App-wide dark mode CSS (the preference is stored and toggle works; wiring every
  page's colors to respond to it is mechanical but not yet done)
- Demand forecasting beyond the simple average-usage math already in place

## Demo login

```
email: demo@veyra.app
password: demo1234
```
