create extension if not exists "uuid-ossp";

create table if not exists charities (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text not null,
  category text not null,
  location text not null,
  image_url text not null,
  featured boolean not null default false,
  total_raised numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists charity_events (
  id uuid primary key default uuid_generate_v4(),
  charity_id uuid not null references charities(id) on delete cascade,
  title text not null,
  starts_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists profiles (
  id uuid primary key,
  role text not null check (role in ('subscriber', 'admin')),
  name text not null,
  email text not null unique,
  avatar_url text,
  charity_id uuid references charities(id),
  independent_donations numeric not null default 0,
  draws_entered integer not null default 0,
  upcoming_draws integer not null default 0,
  total_won numeric not null default 0,
  proof_status text not null default 'not_submitted',
  payment_status text not null default 'pending',
  verification_notes text,
  created_at timestamptz not null default now()
);

create table if not exists subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references profiles(id) on delete cascade,
  plan text not null check (plan in ('monthly', 'yearly')),
  status text not null check (status in ('active', 'inactive', 'lapsed', 'cancelled')),
  renewal_date date not null,
  amount numeric not null,
  charity_percentage integer not null check (charity_percentage between 10 and 100),
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz not null default now()
);

create table if not exists golf_scores (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  stableford_score integer not null check (stableford_score between 1 and 45),
  played_on date not null,
  created_at timestamptz not null default now()
);

create table if not exists draws (
  id uuid primary key default uuid_generate_v4(),
  draw_month date not null,
  logic text not null check (logic in ('random', 'algorithmic')),
  numbers integer[] not null,
  status text not null check (status in ('simulation', 'published')),
  total_pool numeric not null,
  rollover_pool numeric not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists draw_winners (
  id uuid primary key default uuid_generate_v4(),
  draw_id uuid not null references draws(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  match_count integer not null check (match_count between 3 and 5),
  payout_amount numeric not null default 0,
  proof_status text not null default 'pending',
  payment_status text not null default 'pending',
  created_at timestamptz not null default now()
);

create index if not exists idx_golf_scores_user_played_on on golf_scores(user_id, played_on desc);
create index if not exists idx_subscriptions_user_id on subscriptions(user_id);
create index if not exists idx_draw_winners_draw_id on draw_winners(draw_id);
