import bcrypt from 'bcryptjs';
import { pathToFileURL } from 'node:url';
import { db } from './db.js';

const DEMO_PASSWORD = 'password123';

const daysFromNow = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const image = (text: string, bg: string) =>
  `https://placehold.co/600x400/${bg}/ffffff?text=${encodeURIComponent(text)}`;

function seed() {
  const hash = bcrypt.hashSync(DEMO_PASSWORD, 10);
  const addUser = db.prepare('INSERT INTO users (name, email, password_hash, type) VALUES (?, ?, ?, ?)');
  const organizer = Number(addUser.run('CodeGate Events', 'organizer@codegate.com', hash, 'organizer').lastInsertRowid);
  const customer = Number(addUser.run('Demo Customer', 'customer@codegate.com', hash, 'customer').lastInsertRowid);
  const reseller = Number(addUser.run('Riley Reseller', 'reseller@codegate.com', hash, 'customer').lastInsertRowid);

  const addEvent = db.prepare(`
    INSERT INTO events (name, date, time, location, description, price, organizer_id, image, tags, is_featured)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  const events: [string, number, string, string, string, number, string, string[], number][] = [
    ['Neon Nights Festival', 14, '19:00', 'Mumbai, Jio World Garden', 'Three stages of electronic music, light installations and late-night food trucks.', 49.99, '6d28d9', ['Music', 'Festival'], 1],
    ['DevConf 2026', 21, '09:30', 'Bengaluru, KTPO', 'A full day of talks and workshops on web platforms, AI tooling and developer experience.', 25, '0f766e', ['Tech', 'Conference'], 1],
    ['Stand-up Saturday', 6, '20:00', 'Pune, The High Spirits', 'An evening of fresh stand-up from the city\'s best up-and-coming comics.', 12.5, 'b45309', ['Comedy'], 0],
    ['City Marathon', 35, '05:30', 'Delhi, Jawaharlal Nehru Stadium', 'Full, half and 10K routes through the heart of the city. Finisher medals for all.', 30, 'be123c', ['Sports', 'Running'], 0],
    ['Jazz by the Bay', 10, '18:30', 'Mumbai, NCPA', 'A relaxed evening of live jazz with a sunset view over the bay.', 35, '1d4ed8', ['Music', 'Jazz'], 0],
  ];
  const ids = events.map(([name, days, time, location, description, price, bg, tags, featured]) =>
    Number(
      addEvent.run(name, daysFromNow(days), time, location, description, price, organizer, image(name, bg), JSON.stringify(tags), featured)
        .lastInsertRowid,
    ),
  );

  const addTicket = db.prepare('INSERT INTO tickets (event_id, owner_id, is_for_resale, resale_price) VALUES (?, ?, ?, ?)');
  addTicket.run(ids[2], customer, 0, null);
  addTicket.run(ids[0], reseller, 1, 45);
  addTicket.run(ids[4], reseller, 1, 30);
}

export function seedIfEmpty() {
  const { n } = db.prepare<[], { n: number }>('SELECT COUNT(*) AS n FROM users').get()!;
  if (n === 0) {
    db.transaction(seed)();
    console.log(`Seeded demo data. Log in as organizer@codegate.com or customer@codegate.com (password: ${DEMO_PASSWORD}).`);
  }
}

// `npm run seed` wipes the database and reseeds it.
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  db.exec('DELETE FROM tickets; DELETE FROM events; DELETE FROM users; DELETE FROM sqlite_sequence;');
  seedIfEmpty();
}
