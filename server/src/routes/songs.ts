/**
 * routes/songs.ts
 * REST endpoint for song data.
 *
 * GET /api/songs  →  { songs: SongWithPreview[] }
 */

import { Router, Request, Response } from 'express';
import { loadSongs } from '../songService';
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

export default router;