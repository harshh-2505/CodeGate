import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../auth.js';
import { all, db, get, run, toEvent, type EventRow } from '../db.js';
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
  SELECT e.name, e.date, e.time, e.location, e.description, e.price, e.organizer_id, e.image, e.tags, e.is_featured,
         u.name AS organizer_name,
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

const ticketById = (id: number) => get<TicketRow>(`${SELECT_TICKET} WHERE t.id = ?`, [id]);

async function ownedTicket(ticketId: number, userId: number) {
  const ticket = await ticketById(ticketId);
  if (!ticket || ticket.owner_id !== userId) throw new HttpError(404, 'Ticket not found.');
  return ticket;
}

// --- My tickets ---

ticketsRouter.get('/', requireAuth(), async (req, res) => {
  const rows = await all<TicketRow>(`${SELECT_TICKET} WHERE t.owner_id = ? ORDER BY e.date`, [req.user!.id]);
  res.json(rows.map(toTicket));
});

ticketsRouter.post('/', requireAuth('customer'), async (req, res) => {
  const { eventId } = z.object({ eventId: z.number().int() }).parse(req.body);
  if (!(await get('SELECT id FROM events WHERE id = ?', [eventId]))) throw new HttpError(404, 'Event not found.');
  const { lastInsertRowid } = await run('INSERT INTO tickets (event_id, owner_id) VALUES (?, ?)', [eventId, req.user!.id]);
  res.status(201).json(toTicket((await ticketById(lastInsertRowid))!));
});

ticketsRouter.put('/:id/resale', requireAuth(), async (req, res) => {
  const { price } = z.object({ price: z.number().positive('Price must be greater than 0.') }).parse(req.body);
  const ticket = await ownedTicket(Number(req.params.id), req.user!.id);
  await run('UPDATE tickets SET is_for_resale = 1, resale_price = ? WHERE id = ?', [price, ticket.id]);
  res.json(toTicket((await ticketById(ticket.id))!));
});

ticketsRouter.delete('/:id/resale', requireAuth(), async (req, res) => {
  const ticket = await ownedTicket(Number(req.params.id), req.user!.id);
  await run('UPDATE tickets SET is_for_resale = 0, resale_price = NULL WHERE id = ?', [ticket.id]);
  res.json(toTicket((await ticketById(ticket.id))!));
});

// --- Resale market ---

resaleRouter.get('/', async (req, res) => {
  const rows = await all<TicketRow>(`${SELECT_TICKET} WHERE t.is_for_resale = 1 AND t.owner_id != ? ORDER BY e.date`, [
    req.user?.id ?? 0,
  ]);
  res.json(rows.map(toTicket));
});

resaleRouter.post('/:id/buy', requireAuth('customer'), async (req, res) => {
  const ticketId = Number(req.params.id);
  const buyerId = req.user!.id;

  // A single conditional UPDATE is atomic: only one buyer can flip a listed ticket.
  const { rowsAffected } = await db.execute({
    sql: `UPDATE tickets
          SET owner_id = ?, is_for_resale = 0, resale_price = NULL, purchase_date = datetime('now')
          WHERE id = ? AND is_for_resale = 1 AND owner_id != ?`,
    args: [buyerId, ticketId, buyerId],
  });
  if (rowsAffected === 0) {
    const ticket = await ticketById(ticketId);
    if (ticket?.owner_id === buyerId) throw new HttpError(400, 'You already own this ticket.');
    throw new HttpError(409, 'This ticket is no longer for sale.');
  }
  res.json(toTicket((await ticketById(ticketId))!));
});
