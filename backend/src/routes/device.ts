import { Router, Request } from 'express';
import { PrismaClient } from '@prisma/client';

export default function (prisma: PrismaClient) {
  const router = Router();

  // Register or update device info
  router.post('/register', async (req, res) => {
    const { deviceId, platform, osVersion, model, userId } = req.body;
    if (!deviceId || !platform) return res.status(400).json({ error: 'deviceId and platform required' });
    const existing = await prisma.device.findUnique({ where: { deviceId } });
    if (existing) {
      const updated = await prisma.device.update({ where: { deviceId }, data: { platform, osVersion, model, lastSeen: new Date(), userId } });
      return res.json(updated);
    }
    const created = await prisma.device.create({ data: { deviceId, platform, osVersion, model, userId } });
    res.json(created);
  });

  // Receive generic device data (telemetry, usage, logs)
  router.post('/data', async (req, res) => {
    const { deviceId, type, payload } = req.body;
    if (!deviceId || !type) return res.status(400).json({ error: 'deviceId and type required' });
    const device = await prisma.device.findUnique({ where: { deviceId } });
    if (!device) return res.status(404).json({ error: 'device not found' });
    const data = await prisma.deviceData.create({ data: { deviceIdRef: device.id, type, payload } });
    // update lastSeen
    await prisma.device.update({ where: { id: device.id }, data: { lastSeen: new Date() } });
    res.json(data);
  });

  // list data for a device
  router.get('/:deviceId/data', async (req, res) => {
    const { deviceId } = req.params;
    const device = await prisma.device.findUnique({ where: { deviceId } });
    if (!device) return res.status(404).json({ error: 'device not found' });
    const items = await prisma.deviceData.findMany({ where: { deviceIdRef: device.id }, orderBy: { createdAt: 'desc' } });
    res.json(items);
  });

  return router;
}
