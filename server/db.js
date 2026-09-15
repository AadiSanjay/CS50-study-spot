const path = require('path');
const Database = require('better-sqlite3');

const db = new Database(path.join(__dirname, '..', 'studyspot.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS spots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    building TEXT NOT NULL,
    category TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    spot_id INTEGER NOT NULL,
    level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 4),
    created_at INTEGER NOT NULL,
    FOREIGN KEY (spot_id) REFERENCES spots(id)
  );

  CREATE INDEX IF NOT EXISTS idx_reports_spot_time ON reports(spot_id, created_at);
`);

const seedSpots = [
  { name: 'Grainger Engineering Library', building: 'Grainger Engineering Library', category: 'Library' },
  { name: 'Undergraduate Library (UGL)', building: 'Undergraduate Library', category: 'Library' },
  { name: 'Main Library (Marshall Gallery)', building: 'University Library', category: 'Library' },
  { name: 'ACES Library', building: 'ACES Library', category: 'Library' },
  { name: 'Funk ACES Library Cafe', building: 'ACES Library', category: 'Cafe' },
  { name: 'Business Instructional Facility (BIF)', building: 'BIF', category: 'Library' },
  { name: 'Siebel Center for Computer Science', building: 'Siebel Center', category: 'Building' },
  { name: 'Siebel Center for Design', building: 'Siebel Center for Design', category: 'Building' },
  { name: 'Illini Union Bookstore Cafe', building: 'Illini Union', category: 'Cafe' },
  { name: 'Illini Union Study Lounge', building: 'Illini Union', category: 'Lounge' },
  { name: 'Espresso Royale (Green St)', building: 'Green Street', category: 'Cafe' },
  { name: 'Ikenberry Commons Study Room', building: 'Ikenberry Commons', category: 'Dorm Lounge' },
  { name: 'ISR Study Lounge', building: 'Illinois St Residence Halls', category: 'Dorm Lounge' },
  { name: 'Grainger Atrium', building: 'Grainger Engineering Library', category: 'Atrium' },
  { name: 'Everitt Lab Study Area', building: 'Everitt Laboratory', category: 'Building' },
];

const insertSpot = db.prepare('INSERT OR IGNORE INTO spots (name, building, category) VALUES (?, ?, ?)');
const seedTransaction = db.transaction((spots) => {
  for (const s of spots) insertSpot.run(s.name, s.building, s.category);
});
seedTransaction(seedSpots);

module.exports = db;
