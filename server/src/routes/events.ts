import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../auth.js';
import { db, toEvent, type EventRow } from '../db.js';
import { HttpError } from '../errors.js';

export const eventsRouter = Router();

const SELECT_EVENT = `
  SELECT e.*, u.name AS organizer_name
  FROM events e JOIN users u ON u.id = e.organizer_id`;

const listEvents = db.prepare<[], EventRow>(`${SELECT_EVENT} ORDER BY e.date, e.time`);
const getEvent = db.prepare<[number], EventRow>(`${SELECT_EVENT} WHERE e.id = ?`);
const insertEvent = db.prepare(`
  INSERT INTO events (name, date, time, location, description, price, organizer_id, image, tags, is_featured)
  VALUES (@name, @date, @time, @location, @description, @price, @organizerId, @image, @tags, 0)`);

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

eventsRouter.get('/', (_req, res) => {
  res.json(listEvents.all().map(toEvent));
});

eventsRouter.get('/:id', (req, res) => {
  const row = getEvent.get(Number(req.params.id));
  if (!row) throw new HttpError(404, 'Event not found.');
  res.json(toEvent(row));
});

eventsRouter.post('/', requireAuth('organizer'), (req, res) => {
  const body = eventSchema.parse(req.body);
  const image = body.image ?? `https://placehold.co/600x400/6d28d9/ffffff?text=${encodeURIComponent(body.name)}`;
  const { lastInsertRowid } = insertEvent.run({
    name: body.name,
    date: body.date,
    time: body.time,
    location: body.location,
    description: body.description,
    price: body.price,
    image,
    tags: JSON.stringify(body.tags),
    organizerId: req.user!.id,
  });
  res.status(201).json(toEvent(getEvent.get(Number(lastInsertRowid))!));
});
