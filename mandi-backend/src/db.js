import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { config } from './config.js';

fs.mkdirSync(path.dirname(config.dbPath), { recursive: true });
export const db = new Database(config.dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  state TEXT,
  district TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- All prices are Rs per quintal (as published by Agmarknet)
CREATE TABLE IF NOT EXISTS prices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  market TEXT NOT NULL,
  commodity TEXT NOT NULL,
  variety TEXT NOT NULL DEFAULT '',
  grade TEXT NOT NULL DEFAULT '',
  arrival_date TEXT NOT NULL,           -- YYYY-MM-DD
  min_price REAL,
  max_price REAL,
  modal_price REAL NOT NULL,
  UNIQUE (state, district, market, commodity, variety, grade, arrival_date)
);
CREATE INDEX IF NOT EXISTS idx_prices_lookup ON prices (commodity COLLATE NOCASE, state COLLATE NOCASE, arrival_date);
CREATE INDEX IF NOT EXISTS idx_prices_market ON prices (market COLLATE NOCASE, arrival_date);

CREATE TABLE IF NOT EXISTS listings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  commodity TEXT NOT NULL,
  variety TEXT,
  quantity_qtl REAL NOT NULL,
  expected_price REAL NOT NULL,         -- Rs per quintal
  state TEXT NOT NULL,
  district TEXT,
  market TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'open',  -- open | sold | cancelled
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_listings_browse ON listings (status, commodity COLLATE NOCASE, state COLLATE NOCASE);

CREATE TABLE IF NOT EXISTS alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  commodity TEXT NOT NULL,
  state TEXT NOT NULL,
  market TEXT,
  direction TEXT NOT NULL CHECK (direction IN ('above','below')),
  target_price REAL NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  triggered_price REAL,
  triggered_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`);
