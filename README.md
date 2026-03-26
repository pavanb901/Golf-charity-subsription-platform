# FairChance Club

A polished implementation of the Golf Charity Subscription Platform assignment. It is built with Next.js, TypeScript, Tailwind CSS, Supabase-ready auth/data routes, and Stripe-ready subscription checkout. If the required env vars are missing, it safely falls back to the seeded demo mode so the UI still works locally.

## What’s included

- Public homepage with a non-traditional, impact-led golf subscription story
- Charity directory with featured charity presentation, search, and event highlights
- Demo signup and login flow with optional Supabase auth mode
- Subscriber dashboard with:
  - subscription status and plan switching
  - rolling 5-score Stableford logic
  - charity selection and donation percentage
  - participation, winnings, proof, and payout states
- Admin dashboard with:
  - user and subscription overview
  - draw simulation in random or algorithmic mode
  - publish results action
  - prize pool breakdown and rollover handling
  - winner verification and payout controls
  - basic analytics charting
- Supabase-backed API routes for auth and platform data when configured
- Stripe Checkout, billing portal, and webhook handlers when configured

## Demo credentials

- Subscriber: `mia@golfcharity.demo` / `demo123`
- Admin: `admin@golfcharity.demo` / `admin123`

## Local development

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Build verification

```bash
npm run typecheck
npm run build
```

## Supabase setup

1. Create a new Supabase project.
2. In SQL Editor, run [schema.sql](/Users/pavanbhat/Desktop/P Projects/Golf charity subsription platform/supabase/schema.sql).
3. Then run [seed.sql](/Users/pavanbhat/Desktop/P Projects/Golf charity subsription platform/supabase/seed.sql) to load starter charities.
4. In Authentication settings, decide whether email confirmation should be enabled. If it stays enabled, signup will create the account and ask the user to confirm email before login.
5. Copy:
   - Project URL
   - anon key
   - service role key
6. Put those values into your Vercel env vars and local `.env.local`.
7. Set `ADMIN_EMAILS` to the comma-separated email addresses that should receive admin role on signup.

## Stripe setup

1. Create two recurring prices in Stripe:
   - monthly subscription
   - yearly subscription
2. Copy the two `price_...` IDs.
3. Add them to:
   - `STRIPE_PRICE_MONTHLY_ID`
   - `STRIPE_PRICE_YEARLY_ID`
4. Add your Stripe secret key to `STRIPE_SECRET_KEY`.
5. Create a webhook endpoint that points to:
   - `https://your-domain.vercel.app/api/stripe/webhook`
6. Subscribe the webhook to at least:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
7. Copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET`.

## Deploy to Vercel

1. Push this folder to a new GitHub repository.
2. Import the repo into a new Vercel account.
3. Framework preset: `Next.js`.
4. Add all variables from [.env.example](/Users/pavanbhat/Desktop/P Projects/Golf charity subsription platform/.env.example).
5. Set `NEXT_PUBLIC_SITE_URL` to your Vercel production URL after the first deploy.
6. Redeploy once that URL is updated.

## What works right now

- Without env vars: seeded demo mode
- With Supabase env vars: real auth and Supabase-backed dashboard/admin mutations
- With Stripe env vars too: real subscription checkout, billing portal, and subscription webhook syncing

## Remaining production follow-ups

1. Connect winner proof uploads to Supabase Storage.
2. Add email notifications for draw results, renewal reminders, and admin verification decisions.
3. Add stricter Row Level Security policies if you want direct client-side Supabase access later.

## Data model handoff

See [schema.sql](/Users/pavanbhat/Desktop/P Projects/Golf charity subsription platform/supabase/schema.sql) and [seed.sql](/Users/pavanbhat/Desktop/P Projects/Golf charity subsription platform/supabase/seed.sql) for the current database setup.
