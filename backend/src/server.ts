import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRouter from './routes/auth';
import entriesRouter from './routes/entries';
import usageRouter from './routes/usage';
import deviceRouter from './routes/device';

dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(bodyParser.json());

app.use('/api/auth', authRouter(prisma));
app.use('/api/entries', entriesRouter(prisma));
app.use('/api/usage', usageRouter(prisma));
app.use('/api/device', deviceRouter(prisma));
import aiRouter from './routes/ai';
app.use('/api/ai', aiRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
