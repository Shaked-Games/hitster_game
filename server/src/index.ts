/**
 * index.ts
 * Hitster Express server.
 */

import express from 'express';
import cors from 'cors';
import songsRouter from './routes/songs';

const PORT = process.env.PORT ?? 3001;

const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/songs', songsRouter);
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`🎵 Hitster server running on http://localhost:${PORT}`);
});
