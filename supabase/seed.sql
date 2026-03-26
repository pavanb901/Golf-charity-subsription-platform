insert into charities (id, name, slug, description, category, location, image_url, featured, total_raised)
values
  (
    '11111111-1111-1111-1111-111111111111',
    'Rise Forward Foundation',
    'rise-forward-foundation',
    'Funds adaptive sports rehab and confidence-building coaching for young adults recovering from life-changing injuries.',
    'Youth Mobility',
    'Austin, Texas',
    'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1200&q=80',
    true,
    18240
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Blue Miles Initiative',
    'blue-miles-initiative',
    'Supports coastal cleanup programs and career training for communities protecting vulnerable shorelines.',
    'Environment',
    'San Diego, California',
    'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80',
    false,
    12680
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'Heartline Community Trust',
    'heartline-community-trust',
    'Provides emergency grants, grief counseling, and sports access for families navigating critical illness.',
    'Family Support',
    'Charlotte, North Carolina',
    'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80',
    false,
    21130
  )
on conflict (id) do update
set
  name = excluded.name,
  slug = excluded.slug,
  description = excluded.description,
  category = excluded.category,
  location = excluded.location,
  image_url = excluded.image_url,
  featured = excluded.featured,
  total_raised = excluded.total_raised;

insert into charity_events (charity_id, title, starts_at)
values
  ('11111111-1111-1111-1111-111111111111', 'Spring Golf Day - April 18', now() + interval '20 days'),
  ('11111111-1111-1111-1111-111111111111', 'Impact Breakfast - May 6', now() + interval '38 days'),
  ('22222222-2222-2222-2222-222222222222', 'Community Beach Day - April 25', now() + interval '27 days'),
  ('22222222-2222-2222-2222-222222222222', 'Junior Ocean League - June 12', now() + interval '75 days'),
  ('33333333-3333-3333-3333-333333333333', 'Charity Pro-Am - May 14', now() + interval '46 days'),
  ('33333333-3333-3333-3333-333333333333', 'Supporter Night - July 2', now() + interval '95 days');
