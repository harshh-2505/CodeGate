import bcrypt from 'bcryptjs';
import { pathToFileURL } from 'node:url';
import { db, ready } from './db.js';

const DEMO_PASSWORD = 'password123';

const daysFromNow = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const image = (text: string, bg: string) =>
  `https://placehold.co/600x400/${bg}/ffffff?text=${encodeURIComponent(text)}`;

const EVENTS: [string, number, string, string, string, number, string, string[], number][] = [
  ['Neon Nights Festival', 14, '19:00', 'Mumbai, Jio World Garden', 'Three stages of electronic music, light installations and late-night food trucks.', 49.99, '6d28d9', ['Music', 'Festival'], 1],
  ['DevConf 2026', 21, '09:30', 'Bengaluru, KTPO', 'A full day of talks and workshops on web platforms, AI tooling and developer experience.', 25, '0f766e', ['Tech', 'Conference'], 1],
  ['Stand-up Saturday', 6, '20:00', 'Pune, The High Spirits', "An evening of fresh stand-up from the city's best up-and-coming comics.", 12.5, 'b45309', ['Comedy'], 0],
  ['City Marathon', 35, '05:30', 'Delhi, Jawaharlal Nehru Stadium', 'Full, half and 10K routes through the heart of the city. Finisher medals for all.', 30, 'be123c', ['Sports', 'Running'], 0],
  ['Jazz by the Bay', 10, '18:30', 'Mumbai, NCPA', 'A relaxed evening of live jazz with a sunset view over the bay.', 35, '1d4ed8', ['Music', 'Jazz'], 0],
];

async function seed() {
  const hash = bcrypt.hashSync(DEMO_PASSWORD, 10);
  const tx = await db.transaction('write');
  try {
    const addUser = async (name: string, email: string, type: string) =>
      Number(
        (await tx.execute({ sql: 'INSERT INTO users (name, email, password_hash, type) VALUES (?, ?, ?, ?)', args: [name, email, hash, type] }))
          .lastInsertRowid,
      );
    const organizer = await addUser('CodeGate Events', 'organizer@codegate.com', 'organizer');
    const customer = await addUser('Demo Customer', 'customer@codegate.com', 'customer');
    const reseller = await addUser('Riley Reseller', 'reseller@codegate.com', 'customer');

    const ids: number[] = [];
    for (const [name, days, time, location, description, price, bg, tags, featured] of EVENTS) {
      const r = await tx.execute({
        sql: `INSERT INTO events (name, date, time, location, description, price, organizer_id, image, tags, is_featured)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [name, daysFromNow(days), time, location, description, price, organizer, image(name, bg), JSON.stringify(tags), featured],
      });
      ids.push(Number(r.lastInsertRowid));
    }

    const addTicket = 'INSERT INTO tickets (event_id, owner_id, is_for_resale, resale_price) VALUES (?, ?, ?, ?)';
    await tx.execute({ sql: addTicket, args: [ids[2], customer, 0, null] });
    await tx.execute({ sql: addTicket, args: [ids[0], reseller, 1, 45] });
    await tx.execute({ sql: addTicket, args: [ids[4], reseller, 1, 30] });
    await tx.commit();
  } finally {
    tx.close();
  }
}

export async function seedIfEmpty() {
  await ready;
  const { rows } = await db.execute('SELECT COUNT(*) AS n FROM users');
  if (Number(rows[0].n) === 0) {
    await seed();
    console.log(`Seeded demo data. Log in as organizer@codegate.com or customer@codegate.com (password: ${DEMO_PASSWORD}).`);
  }
}

// `npm run seed` wipes the database and reseeds it.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await ready;
  await db.executeMultiple('DELETE FROM tickets; DELETE FROM events; DELETE FROM users; DELETE FROM sqlite_sequence;');
  await seedIfEmpty();
}
