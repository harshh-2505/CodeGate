import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { readAuth } from './auth.js';
import { errorHandler } from './errors.js';
import { authRouter } from './routes/auth.js';
import { eventsRouter } from './routes/events.js';
import { resaleRouter, ticketsRouter } from './routes/tickets.js';

export const app = express();

app.use(express.json());
app.use(readAuth);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});
app.use('/api/auth', authRouter);
app.use('/api/events', eventsRouter);
app.use('/api/tickets', ticketsRouter);
app.use('/api/resale', resaleRouter);
app.use('/api', (_req, res) => {
  res.status(404).json({ message: 'Not found.' });
});

// In production, serve the built client from the same origin.
const clientDist = path.resolve(import.meta.dirname, '..', '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('/{*splat}', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use(errorHandler);
