import { Router, Request } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const INACTIVITY_TIMEOUT_MS = Number(process.env.INACTIVITY_TIMEOUT_MS) || 2 * 60 * 1000;

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

  router.post('/start', async (req, res) => {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ error: 'unauth' });
    const session = await prisma.usageSession.create({ data: { userId } });
    res.json({ sessionId: session.id });
  });

  router.post('/heartbeat', async (req, res) => {
    const userId = getUserIdFromReq(req);
    const { sessionId } = req.body;
    if (!userId && !sessionId) return res.status(400).json({ error: 'sessionId or auth required' });
    if (sessionId) {
      await prisma.usageSession.updateMany({ where: { id: Number(sessionId), active: true }, data: { lastSeen: new Date() } });
      return res.json({ ok: true });
    }
    await prisma.usageSession.updateMany({ where: { userId, active: true }, data: { lastSeen: new Date() } });
    res.json({ ok: true });
  });

  router.post('/stop', async (req, res) => {
    const userId = getUserIdFromReq(req);
    const { sessionId } = req.body;
    if (!userId && !sessionId) return res.status(400).json({ error: 'sessionId or auth required' });
    if (sessionId) {
      await prisma.usageSession.updateMany({ where: { id: Number(sessionId), active: true }, data: { endTime: new Date(), active: false } });
      return res.json({ ok: true });
    }
    await prisma.usageSession.updateMany({ where: { userId, active: true }, data: { endTime: new Date(), active: false } });
    res.json({ ok: true });
  });

  // cleanup job
  setInterval(async () => {
    try {
      const cutoff = new Date(Date.now() - INACTIVITY_TIMEOUT_MS);
      await prisma.usageSession.updateMany({ where: { active: true, lastSeen: { lt: cutoff } }, data: { endTime: new Date(), active: false } });
    } catch (e) {
      console.error('usage cleanup error', e);
    }
  }, Math.max(60000, INACTIVITY_TIMEOUT_MS / 2));

  return router;
}
