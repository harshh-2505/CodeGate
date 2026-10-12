import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, signToken } from '../auth.js';
import { get, run, toPublicUser, type UserRow } from '../db.js';
import { HttpError } from '../errors.js';

export const authRouter = Router();

const signupSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.'),
  email: z.string().trim().email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters long.'),
  type: z.enum(['customer', 'organizer']),
});

const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

const findByEmail = (email: string) => get<UserRow>('SELECT * FROM users WHERE email = ?', [email]);
const findById = (id: number) => get<UserRow>('SELECT * FROM users WHERE id = ?', [id]);

const session = (user: UserRow) => ({
  user: toPublicUser(user),
  token: signToken({ id: user.id, type: user.type }),
});

authRouter.post('/signup', async (req, res) => {
  const body = signupSchema.parse(req.body);
  if (await findByEmail(body.email)) throw new HttpError(409, 'An account with this email already exists.');
  const hash = await bcrypt.hash(body.password, 10);
  const { lastInsertRowid } = await run('INSERT INTO users (name, email, password_hash, type) VALUES (?, ?, ?, ?)', [
    body.name,
    body.email,
    hash,
    body.type,
  ]);
  res.status(201).json(session((await findById(lastInsertRowid))!));
});

authRouter.post('/login', async (req, res) => {
  const body = loginSchema.parse(req.body);
  const user = await findByEmail(body.email);
  if (!user || !(await bcrypt.compare(body.password, user.password_hash))) {
    throw new HttpError(401, 'Incorrect email or password.');
  }
  res.json(session(user));
});

authRouter.get('/me', requireAuth(), async (req, res) => {
  const user = await findById(req.user!.id);
  if (!user) throw new HttpError(401, 'Your account no longer exists.');
  res.json({ user: toPublicUser(user) });
});
