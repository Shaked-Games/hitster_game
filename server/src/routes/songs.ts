/**
 * routes/songs.ts
 * REST endpoint for song data.
 *
 * GET /api/songs  →  { songs: SongWithPreview[] }
 */

import { Router, Request, Response } from 'express';
import { loadSongs, markSongUsed } from '../songService';
import type { SongWithPreview } from '../types';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const songs: SongWithPreview[] = await loadSongs();
    res.json({ songs });
  } catch (err) {
    console.error('Failed to load songs:', err);
    res.status(500).json({ error: 'Failed to load songs' });
  }
});

router.post('/mark-used', async (req: Request, res: Response) => {
  const { name, artist } = req.body as { name?: string; artist?: string };
  if (!name || !artist) {
    res.status(400).json({ error: 'name and artist are required' });
    return;
  }
  try {
    await markSongUsed(name, artist);
    res.json({ ok: true });
  } catch (err) {
    console.error('Failed to mark song as used:', err);
    res.status(500).json({ error: 'Failed to mark song as used' });
  }
});

export default router;