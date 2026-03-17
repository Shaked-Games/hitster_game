/**
 * index.ts
 * Hitster Express server.
 * In production, also serves the built React client from client/dist.
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import songsRouter from './routes/songs';
import playlistsRouter from './routes/playlists';

const PORT   = process.env.PORT ?? 3001;
const isProd = process.env.NODE_ENV === 'production';

const app = express();

// In dev, Vite runs separately on :5173 — allow it.
// In production, everything is same-origin so CORS isn't needed,
// but we keep it permissive for any future API clients.
app.use(cors({
  origin: isProd ? '*' : 'http://localhost:5173',
}));

app.use(express.json());

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api/songs', songsRouter);
app.use('/api/playlists', playlistsRouter);
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ── Serve React client in production ─────────────────────────────────────────
if (isProd) {
  const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
  app.use(express.static(clientDist));

  // All non-API routes serve index.html (React handles routing client-side)
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🎵 Hitster server running on http://localhost:${PORT}`);
});