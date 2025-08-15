import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { z } from 'zod';
import fs from 'node:fs';
import path from 'node:path';
import { songsStore, venuesStore, setlistsStore, showsStore, stageplotsStore, ensureDefaultUser } from './store/memory';

// Prepare file logger
const logsDir = path.resolve(__dirname, '../logs');
try {
  fs.mkdirSync(logsDir, { recursive: true });
} catch {}
const logFilePath = path.join(logsDir, 'log.txt');
const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });
const originalConsole = {
  log: console.log,
  info: console.info,
  warn: console.warn,
  error: console.error,
  debug: console.debug
};
function writeToFile(level: string, args: unknown[]) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] [${level}] ${args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ')}\n`;
  try { logStream.write(line); } catch {}
}
console.log = (...args: unknown[]) => { originalConsole.log(...args); writeToFile('log', args); };
console.info = (...args: unknown[]) => { originalConsole.info(...args); writeToFile('info', args); };
console.warn = (...args: unknown[]) => { originalConsole.warn(...args); writeToFile('warn', args); };
console.error = (...args: unknown[]) => { originalConsole.error(...args); writeToFile('error', args); };
console.debug = (...args: unknown[]) => { originalConsole.debug(...args); writeToFile('debug', args); };

process.on('unhandledRejection', (reason) => console.error('unhandledRejection', reason));
process.on('uncaughtException', (err) => console.error('uncaughtException', err));

const envSchema = z.object({
  PORT: z.string().default('4000'),
  MONGO_URL: z.string(),
  ALLOWED_ORIGIN: z.string().default('http://localhost:5173')
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment variables', parsed.error.flatten());
  process.exit(1);
}
const env = parsed.data;

const app = express();
app.use(cors({ origin: env.ALLOWED_ORIGIN }));
app.use(helmet());
app.use(express.json());
// HTTP logs to console (dev) and to file (combined)
app.use(morgan('dev'));
app.use(morgan('combined', { stream: logStream }));

let useMemoryStore = false;

// Track last connection error for diagnostics
let lastMongoError: string | null = null;
mongoose.connection.on('error', (err) => {
  lastMongoError = (err as Error)?.message || String(err);
});
mongoose.connection.on('connected', () => {
  lastMongoError = null;
  console.log('Mongoose connected');
});
mongoose.connection.on('disconnected', () => {
  console.warn('Mongoose disconnected');
});

// Mongo connection
const isSrv = env.MONGO_URL.startsWith('mongodb+srv://');
const isStd = env.MONGO_URL.startsWith('mongodb://');
const hasTlsParam = /[?&]tls=/i.test(env.MONGO_URL);
const connectOptions: any = {
  serverSelectionTimeoutMS: 15000
};
if (isStd && !hasTlsParam) {
  // Many managed clusters require TLS; hint it if using non-SRV URL lacking tls param
  (connectOptions as any).tls = true;
}
if (isStd && !/[?&]replicaSet=/i.test(env.MONGO_URL)) {
  console.warn('MONGO_URL uses mongodb:// without replicaSet param. Consider using the SRV URL from your provider or add replicaSet=...');
}

mongoose
  .connect(env.MONGO_URL, connectOptions)
  .then(() => { console.log('Connected to MongoDB'); useMemoryStore = false; })
  .catch((err) => {
    lastMongoError = (err as Error)?.message || String(err);
    console.error('Mongo connection error', err);
    useMemoryStore = true;
    console.warn('Falling back to in-memory store. Data will not persist.');
    ensureDefaultUser('user1');
  });

// Models
import { Song } from './models/Song';
import { Venue } from './models/Venue';
import { Setlist } from './models/Setlist';
import { Show } from './models/Show';
import { StagePlot } from './models/StagePlot';
import { User } from './models/User';

// Routes
app.get('/healthz', async (_req, res) => {
  const mongoState = mongoose.connection.readyState; // 0,1,2,3
  const stateName = ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoState] || 'unknown';
  res.json({ status: 'ok', mongo: mongoState, state: stateName, lastError: lastMongoError, srv: isSrv, memory: useMemoryStore });
});

function withUserId<T extends { userId?: string }>(body: T): T {
  return { ...body, userId: body.userId ?? 'user1' };
}

// Generic CRUD helpers
function asyncHandler(fn: any) {
  return (req: any, res: any, next: any) => Promise.resolve(fn(req, res, next)).catch(next);
}

// Songs
app.get('/api/songs', asyncHandler(async (_req, res) => {
  if (useMemoryStore) return res.json(songsStore.list('user1'));
  const items = await Song.find({ userId: 'user1' });
  res.json(items);
}));
app.post('/api/songs', asyncHandler(async (req, res) => {
  if (useMemoryStore) return res.status(201).json(songsStore.create('user1', req.body));
  const created = await Song.create(withUserId(req.body));
  res.status(201).json(created);
}));
app.get('/api/songs/:id', asyncHandler(async (req, res) => {
  if (useMemoryStore) {
    const item = songsStore.get('user1', req.params.id);
    if (!item) return res.sendStatus(404);
    return res.json(item);
  }
  const item = await Song.findOne({ _id: req.params.id, userId: 'user1' });
  if (!item) return res.sendStatus(404);
  res.json(item);
}));
app.put('/api/songs/:id', asyncHandler(async (req, res) => {
  if (useMemoryStore) {
    const updated = songsStore.update('user1', req.params.id, req.body);
    if (!updated) return res.sendStatus(404);
    return res.json(updated);
  }
  const updated = await Song.findOneAndUpdate({ _id: req.params.id, userId: 'user1' }, req.body, { new: true });
  if (!updated) return res.sendStatus(404);
  res.json(updated);
}));
app.delete('/api/songs/:id', asyncHandler(async (req, res) => {
  if (useMemoryStore) {
    const ok = songsStore.delete('user1', req.params.id);
    return res.sendStatus(ok ? 204 : 404);
  }
  const deleted = await Song.findOneAndDelete({ _id: req.params.id, userId: 'user1' });
  if (!deleted) return res.sendStatus(404);
  res.sendStatus(204);
}));

// Venues
app.get('/api/venues', asyncHandler(async (_req, res) => {
  if (useMemoryStore) return res.json(venuesStore.list('user1'));
  const items = await Venue.find({ userId: 'user1' });
  res.json(items);
}));
app.post('/api/venues', asyncHandler(async (req, res) => {
  if (useMemoryStore) return res.status(201).json(venuesStore.create('user1', req.body));
  const created = await Venue.create(withUserId(req.body));
  res.status(201).json(created);
}));
app.get('/api/venues/:id', asyncHandler(async (req, res) => {
  if (useMemoryStore) {
    const item = venuesStore.get('user1', req.params.id);
    if (!item) return res.sendStatus(404);
    return res.json(item);
  }
  const item = await Venue.findOne({ _id: req.params.id, userId: 'user1' });
  if (!item) return res.sendStatus(404);
  res.json(item);
}));
app.put('/api/venues/:id', asyncHandler(async (req, res) => {
  if (useMemoryStore) {
    const updated = venuesStore.update('user1', req.params.id, req.body);
    if (!updated) return res.sendStatus(404);
    return res.json(updated);
  }
  const updated = await Venue.findOneAndUpdate({ _id: req.params.id, userId: 'user1' }, req.body, { new: true });
  if (!updated) return res.sendStatus(404);
  res.json(updated);
}));
app.delete('/api/venues/:id', asyncHandler(async (req, res) => {
  if (useMemoryStore) {
    const ok = venuesStore.delete('user1', req.params.id);
    return res.sendStatus(ok ? 204 : 404);
  }
  const deleted = await Venue.findOneAndDelete({ _id: req.params.id, userId: 'user1' });
  if (!deleted) return res.sendStatus(404);
  res.sendStatus(204);
}));

// Setlists
app.get('/api/setlists', asyncHandler(async (_req, res) => {
  if (useMemoryStore) return res.json(setlistsStore.list('user1'));
  const items = await Setlist.find({ userId: 'user1' });
  res.json(items);
}));
app.post('/api/setlists', asyncHandler(async (req, res) => {
  if (useMemoryStore) return res.status(201).json(setlistsStore.create('user1', req.body));
  const created = await Setlist.create(withUserId(req.body));
  res.status(201).json(created);
}));
app.get('/api/setlists/:id', asyncHandler(async (req, res) => {
  if (useMemoryStore) {
    const item = setlistsStore.get('user1', req.params.id);
    if (!item) return res.sendStatus(404);
    return res.json(item);
  }
  const item = await Setlist.findOne({ _id: req.params.id, userId: 'user1' });
  if (!item) return res.sendStatus(404);
  res.json(item);
}));
app.put('/api/setlists/:id', asyncHandler(async (req, res) => {
  if (useMemoryStore) {
    const updated = setlistsStore.update('user1', req.params.id, req.body);
    if (!updated) return res.sendStatus(404);
    return res.json(updated);
  }
  const updated = await Setlist.findOneAndUpdate({ _id: req.params.id, userId: 'user1' }, req.body, { new: true });
  if (!updated) return res.sendStatus(404);
  res.json(updated);
}));
app.delete('/api/setlists/:id', asyncHandler(async (req, res) => {
  if (useMemoryStore) {
    const ok = setlistsStore.delete('user1', req.params.id);
    return res.sendStatus(ok ? 204 : 404);
  }
  const deleted = await Setlist.findOneAndDelete({ _id: req.params.id, userId: 'user1' });
  if (!deleted) return res.sendStatus(404);
  res.sendStatus(204);
}));

// Shows
app.get('/api/shows', asyncHandler(async (_req, res) => {
  if (useMemoryStore) return res.json(showsStore.list('user1'));
  const items = await Show.find({ userId: 'user1' });
  res.json(items);
}));
app.get('/api/shows/:id', asyncHandler(async (req, res) => {
  if (useMemoryStore) {
    const item = showsStore.get('user1', req.params.id);
    if (!item) return res.sendStatus(404);
    return res.json(item);
  }
  const item = await Show.findOne({ _id: req.params.id, userId: 'user1' });
  if (!item) return res.sendStatus(404);
  res.json(item);
}));
app.post('/api/shows', asyncHandler(async (req, res) => {
  if (useMemoryStore) return res.status(201).json(showsStore.create('user1', req.body));
  const created = await Show.create(withUserId(req.body));
  res.status(201).json(created);
}));

// StagePlot
app.get('/api/stageplots', asyncHandler(async (_req, res) => {
  if (useMemoryStore) {
    return res.json(stageplotsStore.list('user1'));
  }
  const items = await StagePlot.find({ userId: 'user1' }).select('contextId name');
  res.json(items);
}));
app.get('/api/stageplots/:contextId', asyncHandler(async (req, res) => {
  if (useMemoryStore) {
    const item = stageplotsStore.get('user1', req.params.contextId);
    return res.json(item || { contextId: req.params.contextId, nodes: [], userId: 'user1' });
  }
  const item = await StagePlot.findOne({ contextId: req.params.contextId, userId: 'user1' });
  if (!item) return res.json({ contextId: req.params.contextId, nodes: [], userId: 'user1' });
  res.json(item);
}));
app.post('/api/stageplots/:contextId', asyncHandler(async (req, res) => {
  if (useMemoryStore) {
    const upserted = stageplotsStore.upsert('user1', req.params.contextId, req.body.nodes || [], req.body.name);
    return res.json(upserted);
  }
  const upserted = await StagePlot.findOneAndUpdate(
    { contextId: req.params.contextId, userId: 'user1' },
    { ...withUserId(req.body), contextId: req.params.contextId },
    { upsert: true, new: true }
  );
  res.json(upserted);
}));

// Error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res.status(500).json({ error: { message: 'Internal Server Error' } });
});

const port = Number(env.PORT);
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
