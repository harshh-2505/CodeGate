// Vercel serverless entry: every /api/* request is rewritten here and handled by the Express app.
import { app } from '../server/dist/app.js';
import { seedIfEmpty } from '../server/dist/seed.js';

// Creates the schema (and demo data on a brand-new database) once per cold start.
const init = seedIfEmpty();

export default async function handler(req, res) {
  await init;
  return app(req, res);
}
