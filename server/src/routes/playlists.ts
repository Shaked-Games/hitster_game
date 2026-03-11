/**
 * routes/playlists.ts
 * Returns the list of available song CSV files from the songs/ folder.
 * Names are returned without the .csv extension.
 */

import { Router, Request, Response } from 'express';
import { readdir } from 'fs/promises';
import { join } from 'path';

const router = Router();
const SONGS_DIR = join(__dirname, '..', '..', 'songs');

router.get('/', async (_req: Request, res: Response) => {
  try {
    const files = await readdir(SONGS_DIR);
    const playlists = files
      .filter((f) => f.endsWith('.csv'))
      .map((f) => f.replace(/\.csv$/, ''))
      .sort();
    res.json({ playlists });
  } catch (err) {
    console.error('Failed to list playlists:', err);
    res.status(500).json({ error: 'Failed to list playlists' });
  }
});

export default router;