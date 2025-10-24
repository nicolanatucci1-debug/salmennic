import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'unauth' });
  const parts = auth.split(' ');
  if (parts.length !== 2) return res.status(401).json({ error: 'unauth' });
  try {
    const payload: any = jwt.verify(parts[1], JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ error: 'unauth' });
  }
}
