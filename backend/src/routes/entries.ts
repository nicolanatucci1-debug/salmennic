import { Router, Request } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

function getUserIdFromReq(req: Request) {
  const auth = req.headers.authorization;
  if (!auth) return null;
  const parts = auth.split(' ');
  if (parts.length !== 2) return null;
  try {
    const payload: any = jwt.verify(parts[1], JWT_SECRET);
    return payload.userId as number;
  } catch {
    return null;
  }
}

export default function (prisma: PrismaClient) {
  const router = Router();

  router.get('/', async (req, res) => {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ error: 'unauth' });
    const entries = await prisma.entry.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
    res.json(entries);
  });

  router.post('/', async (req, res) => {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ error: 'unauth' });
    const { title, body, mood } = req.body;
    const entry = await prisma.entry.create({ data: { userId, title, body, mood } });
    res.json(entry);
  });

  router.put('/:id', async (req, res) => {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ error: 'unauth' });
    const id = Number(req.params.id);
    const { title, body, mood } = req.body;
    const entry = await prisma.entry.update({ where: { id }, data: { title, body, mood } });
    res.json(entry);
  });

  router.delete('/:id', async (req, res) => {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ error: 'unauth' });
    const id = Number(req.params.id);
    await prisma.entry.delete({ where: { id } });
    res.json({ ok: true });
  });

  return router;
}
