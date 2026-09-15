# Study Spot 🐢

A crowd-level reporting app for study spots around the UIUC campus. Anyone can
check how busy a library, cafe, or lounge is right now, and report the
current crowd level for others.

## Features

- List of UIUC study spots (libraries, cafes, dorm lounges, buildings) with
  live crowd levels: **Empty**, **Light**, **Moderate**, **Packed**.
- Crowd level is a recency-weighted average of the last 2 hours of reports,
  so it self-corrects as conditions change.
- One-tap crowd reporting per spot.
- Search by name/building and filter by category.
- Auto-refreshes every 30 seconds.

## Tech stack

- Node.js + Express (REST API)
- SQLite (via `better-sqlite3`) for storage
- Vanilla HTML/CSS/JS frontend (no build step)

## Getting started

```bash
npm install
npm start
```

Then open http://localhost:3000.

The SQLite database (`studyspot.db`) is created automatically on first run
and seeded with a starter list of UIUC study spots.

## API

- `GET /api/spots` — list all spots with computed crowd level
- `GET /api/spots/:id` — get a single spot
- `GET /api/spots/:id/reports` — recent raw reports for a spot
- `POST /api/spots/:id/reports` — submit a report, body `{ "level": 1-4 }`
  (1 = Empty, 2 = Light, 3 = Moderate, 4 = Packed)

## Adding more spots

Edit the `seedSpots` array in `server/db.js` and restart the server (only
new spots are inserted; existing ones are left untouched).
