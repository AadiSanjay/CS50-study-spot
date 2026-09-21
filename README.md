# Perch 🪶

A calm, mobile-first web app for UIUC students to find and rate cafés and
study spaces around campus — and see how busy they are right now.

Built with Next.js (App Router) + TypeScript + Tailwind CSS + Supabase
(Postgres + email magic-link auth).

## Features

- **Cafés** and **Study Spaces** tabs, each a card grid with open/closed
  status, average rating, and a live busyness pill.
- **Detail page** per spot: full weekly hours, wifi/outlets/noise, ratings,
  reviews, and a "how busy is it?" check-in panel. Study spaces also get
  zones/floors, food policy, capacity, reservable rooms, lighting, best-for
  tags, and a "grab coffee on the way" link to the nearest café.
- **Ratings**: 1–5 overall plus noise and wifi sub-scores, one review per
  user per spot (editable).
- **Busyness**: crowd-sourced check-ins on a 1–5 scale, weighted by recency
  (see [Busyness algorithm](#busyness-algorithm) below), plus a sparkline of
  typical busyness by hour with the current level marked.
- **Filters**: "Open now" toggle, sort by rating, free-text search (press
  `/` to focus it on desktop).
- **Desktop (≥1024px)**: a split view — scrollable list on the left, an
  interactive Leaflet map on the right. Hovering a card highlights its
  marker; clicking a marker scrolls to and highlights its card; clicking a
  card opens a slide-over detail panel (no page navigation, map stays
  visible). A time-of-day atmosphere (warm morning / neutral afternoon /
  deep espresso-and-lamplight night) auto-switches and can be overridden
  with the toggle in the header; it also picks a matching light/dark map
  tile style. Mobile keeps its original card-grid + full-page detail view.
- **Auth**: Supabase email magic links — no passwords.

## Stack

- Next.js 14 (App Router, Server Components, Route Handlers)
- TypeScript, Tailwind CSS, Framer Motion (animation), Leaflet /
  react-leaflet (map — free CARTO basemap tiles, no API key)
- Supabase: Postgres tables + Row Level Security + email OTP auth
  (`@supabase/ssr` for cookie-based sessions)
- Spot data seeded from [`data/spots.json`](data/spots.json) (12 cafés + 10
  study spaces near UIUC. Café hours checked against public listings; study
  space details checked mainly against the UIUC Library's own
  [Study Space Directory](https://www.library.illinois.edu/using-library-spaces/study-space-directory/).
  See [Notes on data accuracy](#notes-on-data-accuracy) for what's marked
  `unverified-*`.)

## Project structure

```
data/spots.json              seed data for the spots table
supabase/migrations/         SQL schema + RLS policies
scripts/seed.ts              pushes data/spots.json into Supabase
src/app/                     routes (App Router)
src/components/               UI components
src/lib/                      Supabase clients, types, hours/busyness logic
```

## Setup

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com), create a project, then open the
**SQL Editor** and run, in order:

1. [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) —
   creates the `spots`, `reviews`, and `checkins` tables with RLS enabled.
2. [`supabase/migrations/0002_study_space_details.sql`](supabase/migrations/0002_study_space_details.sql) —
   adds the richer study-space columns (`zones`, `food_policy`, `capacity`,
   `reservable_rooms`, `lighting`, `amenities`, `late_night`,
   `access_notes`, `best_for`, `nearby_cafe_id`) plus `highlights` for
   cafés.

### 2. Configure email auth (magic link)

In **Authentication → Email Templates → Magic Link**, set the confirmation
URL to:

```
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
```

This is required — Perch's `/auth/confirm` route handler expects the
`token_hash`/`type` query params, not Supabase's default verify redirect.
Also set **Authentication → URL Configuration → Site URL** to your local
(`http://localhost:3000`) or deployed URL.

### 3. Environment variables

Copy `.env.example` to `.env.local` and fill in the values from
**Project Settings → API**:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key   # seed script only, never shipped to the browser
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Install, seed, run

```bash
npm install
npm run seed   # pushes data/spots.json into the spots table (uses the service role key)
npm run dev    # http://localhost:3000
```

Sign in with any email at `/login` — Supabase will send a real email via its
built-in (rate-limited) test SMTP, or your own SMTP if you've configured one
under **Project Settings → Auth → SMTP Settings**.

### 5. Build

```bash
npm run build
npm run start
```

## Deploying to Vercel

1. Push this repo to GitHub.
2. In Vercel, **Add New Project** → import the repo.
3. Add the same env vars as above in **Project Settings → Environment
   Variables** (use your Vercel deployment URL for
   `NEXT_PUBLIC_SITE_URL`, e.g. `https://perch.vercel.app`).
4. Update the Supabase **Site URL** and the magic-link template's
   `{{ .SiteURL }}` target to match the deployed URL (Supabase's Site URL
   setting drives what `{{ .SiteURL }}` resolves to).
5. Deploy. Run `npm run seed` locally (pointed at the same Supabase project)
   any time you update `data/spots.json`.

## Busyness algorithm

Each check-in is a student tapping a busyness level (1 = quiet, 5 = packed)
for a spot. To turn a scattered stream of check-ins into a single "busyness
right now" number ([`src/lib/busyness.ts`](src/lib/busyness.ts)):

1. **Drop stale data.** Check-ins older than 2 hours are discarded outright
   — past that point a report says nothing about the current moment.
2. **Weight the rest by recency.** Each remaining check-in gets a weight of
   `exp(-ln(2) * ageMinutes / 30)` — an exponential decay with a **30-minute
   half-life**, so a check-in from 30 minutes ago counts half as much as one
   from right now, and one from 60 minutes ago a quarter as much.
3. **Weighted average.** The displayed level is the weight-averaged
   busyness of all remaining check-ins, rounded to the nearest integer.
4. **Fallback curve.** If there are no check-ins in the last 2 hours, Perch
   falls back to a hardcoded "typical busyness by hour" curve (one for
   cafés, one for study spaces — cafés peak mid-morning/lunch, study spaces
   build through the afternoon into the evening). The UI labels this
   "Typical for this time" versus "Based on N recent reports" so it's
   always clear whether you're seeing real signal or a heuristic.

Rate limiting: a user can only check in to a given spot once every 20
minutes (enforced server-side in `/api/checkin` by checking their most
recent check-in for that spot).

## Notes on data accuracy

Hours for the 12 cafés were checked against current listings during
research; a few (marked `unverified-hours` in `data/spots.json`, not shown
in the UI) use typical semester hours for UIUC libraries and the Illini
Union rather than a specific posted schedule, since those change with the
academic calendar. Espresso Royale's Daniel St. location was verified open
(it relocated into The Hub building in Dec. 2022 after its original
storefront closed). The Undergraduate Library was excluded — it's been
closed since 2022.

Study-space detail fields were checked against the UIUC Library's Study
Space Directory and each space's own reservation page where possible.
Confirmed from those sources: Grainger's quiet-floor/loud-floor split (2nd
& 3rd floors quiet; lower, 1st, 4th group study) and its overnight i-card
access; ACES Funk's 6 bookable group rooms and NetID reservation system;
MPAL's 6 lockable rooms (2 hr max, key at the service desk); Communications
Library's exact seat counts (Room 122: 40 seats, Room 39: 51 seats);
Champaign Public Library's 5 study rooms, "covered drinks only" policy, and
24-hours-ahead booking window; and the Illini Union's Blue/Orange study
rooms plus Room 187.

**One correction worth flagging:** the original data (from the prior
session) claimed the Orange Room in the Main Library was open 24/7. That
doesn't check out — the University Library's overnight i-card access
program is documented for Grainger, not confirmed for the Orange Room —
so its hours now match the Main Library's and `late_night` is `false`.

Fields marked `unverified-*` in a spot's `tags` (capacity, lighting,
reservable-rooms, late-night, food-policy, as applicable) are reasonable
estimates from general knowledge of each building rather than a scraped
number, because the directory doesn't list that field for every space or
I didn't find a confirmed source within the search budget for this task.
`nearby_cafe_id` is computed from this dataset's own (approximate)
coordinates, not a verified walking distance.
