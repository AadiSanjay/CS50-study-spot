const path = require('path');
const express = require('express');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const REPORT_WINDOW_MS = 2 * 60 * 60 * 1000; // reports older than 2 hours don't count

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

const LEVELS = {
  1: 'Empty',
  2: 'Light',
  3: 'Moderate',
  4: 'Packed',
};

function computeCrowdLevel(spotId) {
  const cutoff = Date.now() - REPORT_WINDOW_MS;
  const rows = db
    .prepare('SELECT level, created_at FROM reports WHERE spot_id = ? AND created_at >= ? ORDER BY created_at DESC')
    .all(spotId, cutoff);

  if (rows.length === 0) {
    return { level: null, label: 'No recent reports', reportCount: 0, updatedAt: null };
  }

  const now = Date.now();
  let weightedSum = 0;
  let weightTotal = 0;
  for (const row of rows) {
    const age = now - row.created_at;
    const weight = Math.max(0.1, 1 - age / REPORT_WINDOW_MS);
    weightedSum += row.level * weight;
    weightTotal += weight;
  }
  const avg = weightedSum / weightTotal;
  const rounded = Math.min(4, Math.max(1, Math.round(avg)));

  return {
    level: rounded,
    label: LEVELS[rounded],
    reportCount: rows.length,
    updatedAt: rows[0].created_at,
  };
}

app.get('/api/spots', (req, res) => {
  const spots = db.prepare('SELECT * FROM spots ORDER BY name').all();
  const withCrowd = spots.map((spot) => ({
    ...spot,
    crowd: computeCrowdLevel(spot.id),
  }));
  res.json(withCrowd);
});

app.get('/api/spots/:id', (req, res) => {
  const spot = db.prepare('SELECT * FROM spots WHERE id = ?').get(req.params.id);
  if (!spot) return res.status(404).json({ error: 'Spot not found' });
  res.json({ ...spot, crowd: computeCrowdLevel(spot.id) });
});

app.get('/api/spots/:id/reports', (req, res) => {
  const spot = db.prepare('SELECT * FROM spots WHERE id = ?').get(req.params.id);
  if (!spot) return res.status(404).json({ error: 'Spot not found' });
  const reports = db
    .prepare('SELECT level, created_at FROM reports WHERE spot_id = ? ORDER BY created_at DESC LIMIT 20')
    .all(req.params.id);
  res.json(reports);
});

app.post('/api/spots/:id/reports', (req, res) => {
  const spot = db.prepare('SELECT * FROM spots WHERE id = ?').get(req.params.id);
  if (!spot) return res.status(404).json({ error: 'Spot not found' });

  const level = Number(req.body.level);
  if (!Number.isInteger(level) || level < 1 || level > 4) {
    return res.status(400).json({ error: 'level must be an integer between 1 and 4' });
  }

  db.prepare('INSERT INTO reports (spot_id, level, created_at) VALUES (?, ?, ?)').run(
    spot.id,
    level,
    Date.now()
  );

  res.status(201).json({ ...spot, crowd: computeCrowdLevel(spot.id) });
});

app.listen(PORT, () => {
  console.log(`Study Spot server running at http://localhost:${PORT}`);
});
