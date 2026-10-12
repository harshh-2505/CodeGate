import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../auth.js';
import { all, get, run, toEvent, type EventRow } from '../db.js';
import { HttpError } from '../errors.js';

export const eventsRouter = Router();

const SELECT_EVENT = `
  SELECT e.*, u.name AS organizer_name
  FROM events e JOIN users u ON u.id = e.organizer_id`;

const getEvent = (id: number) => get<EventRow>(`${SELECT_EVENT} WHERE e.id = ?`, [id]);

const eventSchema = z.object({
  name: z.string().trim().min(1, 'Event name is required.'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD.'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM.'),
  location: z.string().trim().min(1, 'Location is required.'),
  description: z.string().trim().min(1, 'Description is required.'),
  price: z.coerce.number().min(0, 'Price cannot be negative.'),
  tags: z.array(z.string().trim().min(1)).default([]),
  image: z.string().url().optional(),
});

eventsRouter.get('/', async (_req, res) => {
  const rows = await all<EventRow>(`${SELECT_EVENT} ORDER BY e.date, e.time`);
  res.json(rows.map(toEvent));
});

eventsRouter.get('/:id', async (req, res) => {
  const row = await getEvent(Number(req.params.id));
  if (!row) throw new HttpError(404, 'Event not found.');
  res.json(toEvent(row));
});

eventsRouter.post('/', requireAuth('organizer'), async (req, res) => {
  const body = eventSchema.parse(req.body);
  const image = body.image ?? `https://placehold.co/600x400/6d28d9/ffffff?text=${encodeURIComponent(body.name)}`;
  const { lastInsertRowid } = await run(
    `INSERT INTO events (name, date, time, location, description, price, organizer_id, image, tags, is_featured)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
    [body.name, body.date, body.time, body.location, body.description, body.price, req.user!.id, image, JSON.stringify(body.tags)],
  );
  res.status(201).json(toEvent((await getEvent(lastInsertRowid))!));
});
