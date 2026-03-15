import { Router, Request, Response } from 'express';
import { loadSongs, fetchDeezerPreview } from '../songService';
import type { SongWithPreview } from '../types';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const playlist = (req.query.playlist as string | undefined)?.trim();
  if (!playlist) {
    res.status(400).json({ error: 'playlist query param is required' });
    return;
  }
  try {
    const baseSongs = await loadSongs(playlist);
    const songs: SongWithPreview[] = baseSongs.map((song) => ({ ...song, previewUrl: '' }));
    res.json({ songs });
  } catch (err) {
    console.error('Failed to load songs:', err);
    res.status(500).json({ error: 'Failed to load songs' });
  }
});

router.get('/preview', async (req: Request, res: Response) => {
  const { name, artist, csvPreviewUrl, searchQuery } = req.query as {
    name?: string;
    artist?: string;
    csvPreviewUrl?: string;
    searchQuery?: string;
  };
  if (!name || !artist) {
    res.status(400).json({ error: 'name and artist are required' });
    return;
  }
  try {
    const previewUrl = csvPreviewUrl
      ? csvPreviewUrl
      : await fetchDeezerPreview(name, artist, searchQuery);
    res.json({ previewUrl });
  } catch (err) {
    console.error('Failed to fetch preview:', err);
    res.status(500).json({ previewUrl: '' });
  }
});

export default router;