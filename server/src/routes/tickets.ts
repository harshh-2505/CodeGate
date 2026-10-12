import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../auth.js';
import { db, toEvent, type EventRow } from '../db.js';
import { HttpError } from '../errors.js';

export const ticketsRouter = Router();
export const resaleRouter = Router();

interface TicketRow extends Omit<EventRow, 'id'> {
  id: number;
  event_id: number;
  owner_id: number;
  purchase_date: string;
  is_for_resale: number;
  resale_price: number | null;
}

const SELECT_TICKET = `
  SELECT e.*, u.name AS organizer_name,
         t.id, t.event_id, t.owner_id, t.purchase_date, t.is_for_resale, t.resale_price
  FROM tickets t
  JOIN events e ON e.id = t.event_id
  JOIN users u ON u.id = e.organizer_id`;

const toTicket = (r: TicketRow) => ({
  id: r.id,
  eventId: r.event_id,
  ownerId: r.owner_id,
  purchaseDate: r.purchase_date,
  isForResale: Boolean(r.is_for_resale),
  resalePrice: r.resale_price,
  event: toEvent({ ...r, id: r.event_id }),
});

const ticketsByOwner = db.prepare<[number], TicketRow>(`${SELECT_TICKET} WHERE t.owner_id = ? ORDER BY e.date`);
const ticketById = db.prepare<[number], TicketRow>(`${SELECT_TICKET} WHERE t.id = ?`);
const resaleListings = db.prepare<[number], TicketRow>(
  `${SELECT_TICKET} WHERE t.is_for_resale = 1 AND t.owner_id != ? ORDER BY e.date`,
);
const eventExists = db.prepare<[number], { id: number }>('SELECT id FROM events WHERE id = ?');
const insertTicket = db.prepare('INSERT INTO tickets (event_id, owner_id) VALUES (?, ?)');
const setResale = db.prepare('UPDATE tickets SET is_for_resale = ?, resale_price = ? WHERE id = ?');
const transfer = db.prepare(
  "UPDATE tickets SET owner_id = ?, is_for_resale = 0, resale_price = NULL, purchase_date = datetime('now') WHERE id = ?",
);

function ownedTicket(ticketId: number, userId: number) {
  const ticket = ticketById.get(ticketId);
  if (!ticket || ticket.owner_id !== userId) throw new HttpError(404, 'Ticket not found.');
  return ticket;
}

// --- My tickets ---

ticketsRouter.get('/', requireAuth(), (req, res) => {
  res.json(ticketsByOwner.all(req.user!.id).map(toTicket));
});

ticketsRouter.post('/', requireAuth('customer'), (req, res) => {
  const { eventId } = z.object({ eventId: z.number().int() }).parse(req.body);
  if (!eventExists.get(eventId)) throw new HttpError(404, 'Event not found.');
  const { lastInsertRowid } = insertTicket.run(eventId, req.user!.id);
  res.status(201).json(toTicket(ticketById.get(Number(lastInsertRowid))!));
});

ticketsRouter.put('/:id/resale', requireAuth(), (req, res) => {
  const { price } = z.object({ price: z.number().positive('Price must be greater than 0.') }).parse(req.body);
  const ticket = ownedTicket(Number(req.params.id), req.user!.id);
  setResale.run(1, price, ticket.id);
  res.json(toTicket(ticketById.get(ticket.id)!));
});

ticketsRouter.delete('/:id/resale', requireAuth(), (req, res) => {
  const ticket = ownedTicket(Number(req.params.id), req.user!.id);
  setResale.run(0, null, ticket.id);
  res.json(toTicket(ticketById.get(ticket.id)!));
});

// --- Resale market ---

resaleRouter.get('/', (req, res) => {
  res.json(resaleListings.all(req.user?.id ?? 0).map(toTicket));
});

const buyResale = db.transaction((ticketId: number, buyerId: number) => {
  const ticket = ticketById.get(ticketId);
  if (!ticket || !ticket.is_for_resale) throw new HttpError(409, 'This ticket is no longer for sale.');
  if (ticket.owner_id === buyerId) throw new HttpError(400, 'You already own this ticket.');
  transfer.run(buyerId, ticketId);
  return ticketById.get(ticketId)!;
});

resaleRouter.post('/:id/buy', requireAuth('customer'), (req, res) => {
  res.json(toTicket(buyResale(Number(req.params.id), req.user!.id)));
});
