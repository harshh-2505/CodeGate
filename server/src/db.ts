import Database from 'better-sqlite3';
import path from 'node:path';

const file = process.env.DATABASE_FILE ?? path.resolve(import.meta.dirname, '..', 'codegate.db');

export const db = new Database(file);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT NOT NULL,
    email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    type          TEXT NOT NULL CHECK (type IN ('customer', 'organizer')),
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS events (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    name         TEXT NOT NULL,
    date         TEXT NOT NULL,
    time         TEXT NOT NULL,
    location     TEXT NOT NULL,
    description  TEXT NOT NULL,
    price        REAL NOT NULL CHECK (price >= 0),
    organizer_id INTEGER NOT NULL REFERENCES users(id),
    image        TEXT NOT NULL,
    tags         TEXT NOT NULL DEFAULT '[]',
    is_featured  INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS tickets (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id      INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    owner_id      INTEGER NOT NULL REFERENCES users(id),
    purchase_date TEXT NOT NULL DEFAULT (datetime('now')),
    is_for_resale INTEGER NOT NULL DEFAULT 0,
    resale_price  REAL
  );

  CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
  CREATE INDEX IF NOT EXISTS idx_tickets_owner ON tickets(owner_id);
  CREATE INDEX IF NOT EXISTS idx_tickets_resale ON tickets(is_for_resale);
`);

export type UserType = 'customer' | 'organizer';

export interface UserRow {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  type: UserType;
}

export interface EventRow {
  id: number;
  name: string;
  date: string;
  time: string;
  location: string;
  description: string;
  price: number;
  organizer_id: number;
  organizer_name: string;
  image: string;
  tags: string;
  is_featured: number;
}

export const toEvent = (r: EventRow) => ({
  id: r.id,
  name: r.name,
  date: r.date,
  time: r.time,
  location: r.location,
  description: r.description,
  price: r.price,
  organizerId: r.organizer_id,
  organizerName: r.organizer_name,
  image: r.image,
  tags: JSON.parse(r.tags) as string[],
  isFeatured: Boolean(r.is_featured),
});

export const toPublicUser = (u: Pick<UserRow, 'id' | 'name' | 'email' | 'type'>) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  type: u.type,
});
