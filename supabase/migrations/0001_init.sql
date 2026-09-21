-- Perch schema: spots (seeded from data/spots.json), reviews, and busyness check-ins.

create table if not exists spots (
  id text primary key,
  name text not null,
  category text not null check (category in ('cafe', 'study_space')),
  address text not null,
  lat double precision not null,
  lng double precision not null,
  hours jsonb not null,
  wifi text not null check (wifi in ('none', 'some', 'plenty')),
  outlets text not null check (outlets in ('none', 'some', 'plenty')),
  noise smallint not null check (noise between 1 and 5),
  tags text[] not null default '{}',
  source_url text
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  spot_id text not null references spots (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  noise_rating smallint not null check (noise_rating between 1 and 5),
  wifi_rating smallint not null check (wifi_rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (spot_id, user_id)
);

create table if not exists checkins (
  id uuid primary key default gen_random_uuid(),
  spot_id text not null references spots (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  busyness smallint not null check (busyness between 1 and 5),
  created_at timestamptz not null default now()
);

create index if not exists checkins_spot_recent_idx on checkins (spot_id, created_at desc);
create index if not exists reviews_spot_idx on reviews (spot_id);

alter table spots enable row level security;
alter table reviews enable row level security;
alter table checkins enable row level security;

-- Spots: public read only. Writes happen out-of-band via the seed script (service role key).
create policy "spots are publicly readable" on spots
  for select using (true);

-- Reviews: anyone can read; a signed-in user can only write/update/delete their own review.
create policy "reviews are publicly readable" on reviews
  for select using (true);

create policy "users can insert their own review" on reviews
  for insert with check (auth.uid() = user_id);

create policy "users can update their own review" on reviews
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users can delete their own review" on reviews
  for delete using (auth.uid() = user_id);

-- Check-ins: anyone can read (to compute busyness); a signed-in user can only insert their own.
create policy "checkins are publicly readable" on checkins
  for select using (true);

create policy "users can insert their own checkin" on checkins
  for insert with check (auth.uid() = user_id);
