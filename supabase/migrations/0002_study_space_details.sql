-- Richer study-space (and cafe drink/food highlight) details, sourced mainly
-- from the UIUC Library "Study Space Directory" (library.illinois.edu).
-- All columns are nullable: cafes don't populate the study-only fields, and
-- study spaces don't populate `highlights`.

alter table spots
  add column if not exists zones jsonb,
  add column if not exists food_policy text check (food_policy in ('none', 'covered drinks', 'food OK')),
  add column if not exists capacity integer,
  add column if not exists reservable_rooms jsonb,
  add column if not exists lighting text check (lighting in ('natural light', 'mixed', 'fluorescent')),
  add column if not exists amenities jsonb,
  add column if not exists late_night boolean,
  add column if not exists access_notes text,
  add column if not exists best_for text[],
  add column if not exists nearby_cafe_id text references spots (id),
  add column if not exists highlights text[];
