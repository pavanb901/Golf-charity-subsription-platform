# FairChance Club

FairChance Club is a full-stack web application built to demonstrate user authentication, backend APIs, database integration, admin workflows, and live deployment. The product concept is a subscription-based golf and charity platform where users can manage their profile, submit golf scores, support charities, and participate in monthly draw mechanics, while admins can manage users, review platform activity, and operate draw-related actions.

## Tech stack

- Next.js 15
- TypeScript
- Tailwind CSS
- Supabase Auth + Database
- Stripe Checkout + Billing Portal + Webhooks
- Vercel deployment

## Core features

- User signup and login
- Role-aware experience for subscriber and admin users
- Supabase-backed data storage for users, subscriptions, scores, charities, and draw data
- Subscriber dashboard with score entry, charity preferences, and subscription details
- Admin dashboard with user oversight, draw actions, verification states, and reporting views
- Stripe subscription checkout for monthly and yearly plans
- Stripe billing portal integration
- Responsive UI for desktop and mobile

## Project structure

- [`app`](/Users/pavanbhat/Desktop/P Projects/Golf charity subsription platform/app): App Router pages and API routes
- [`components`](/Users/pavanbhat/Desktop/P Projects/Golf charity subsription platform/components): reusable UI and feature components
- [`lib`](/Users/pavanbhat/Desktop/P Projects/Golf charity subsription platform/lib): business logic, integrations, and shared utilities
- [`supabase/schema.sql`](/Users/pavanbhat/Desktop/P Projects/Golf charity subsription platform/supabase/schema.sql): database schema
- [`supabase/seed.sql`](/Users/pavanbhat/Desktop/P Projects/Golf charity subsription platform/supabase/seed.sql): starter charity seed data

## Deployed project url:

https://golf-charity-subsription-platform.vercel.app/

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` in the project root.

3. Copy the values from [`.env.example`](/Users/pavanbhat/Desktop/P Projects/Golf charity subsription platform/.env.example) and add your real keys.

4. Start development:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Environment variables

Required values:

- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_EMAILS`
- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_MONTHLY_ID`
- `STRIPE_PRICE_YEARLY_ID`
- `STRIPE_WEBHOOK_SECRET`

Reference file:

- [`.env.example`](/Users/pavanbhat/Desktop/P Projects/Golf charity subsription platform/.env.example)

## Database setup

Run these files in Supabase SQL Editor:

1. [`supabase/schema.sql`](/Users/pavanbhat/Desktop/P Projects/Golf charity subsription platform/supabase/schema.sql)
2. [`supabase/seed.sql`](/Users/pavanbhat/Desktop/P Projects/Golf charity subsription platform/supabase/seed.sql)

## Stripe setup

Create:

- one monthly recurring Stripe price
- one yearly recurring Stripe price

Then add those `price_...` IDs to:

- `STRIPE_PRICE_MONTHLY_ID`
- `STRIPE_PRICE_YEARLY_ID`

Also create a webhook endpoint pointing to:

```text
/api/stripe/webhook
```

with these events:

- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

## Verification

Run:

```bash
npm run typecheck
npm run build
```

