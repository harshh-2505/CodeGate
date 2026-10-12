import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import type { UserType } from './db.js';
import { HttpError } from './errors.js';

const SECRET = process.env.JWT_SECRET ?? 'dev-only-secret-change-me';

export interface AuthUser {
  id: number;
  type: UserType;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const signToken = (user: AuthUser) => jwt.sign(user, SECRET, { expiresIn: '7d' });

/** Attaches req.user when a valid bearer token is present; never rejects. */
export function readAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try {
      const { id, type } = jwt.verify(header.slice(7), SECRET) as AuthUser;
      req.user = { id, type };
    } catch {
      // invalid or expired token: treat as anonymous
    }
  }
  next();
}

export const requireAuth = (type?: UserType) => (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user) return next(new HttpError(401, 'Please log in first.'));
  if (type && req.user.type !== type) return next(new HttpError(403, `Only ${type}s can do that.`));
  next();
};
