/**
 * songService.ts
 * Loads songs from the CSV file. Deezer preview URLs are fetched
 * on-demand per song so they are always fresh (URLs expire quickly).
 */

import { readFile, writeFile } from 'fs/promises';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import { join } from 'path';
import { randomUUID } from 'crypto';
import type { SongWithPreview, CsvSongRow, DeezerSearchResponse } from './types';

const SONGS_DIR = join(__dirname, '..', 'songs');
const DEEZER_SEARCH_URL = 'https://api.deezer.com/search';

/** Cache per playlist name */
const cache = new Map<string, Omit<SongWithPreview, 'previewUrl'>[]>();

// ── Parsing ────────────────────────────────────────────────────────────────────

function parseSongRow(row: CsvSongRow): Omit<SongWithPreview, 'previewUrl'> {
  return {
    id: randomUUID(),
    name: row.name?.trim() ?? '',
    artist: row.artist?.trim() ?? '',
    year: parseInt(row.year, 10),
  };
}

function isValidSong(song: Omit<SongWithPreview, 'previewUrl'>): boolean {
  return (
    song.name.length > 0 &&
    song.artist.length > 0 &&
    !isNaN(song.year) &&
    song.year > 1900
  );
}

// ── Deezer ─────────────────────────────────────────────────────────────────────

/**
 * Fetches a fresh 30s preview URL from Deezer for a single track.
 * Called per-song when the route builds the response.
 */
export async function fetchDeezerPreview(name: string, artist: string): Promise<string> {
  try {
    const query = encodeURIComponent(`${name} ${artist}`);
    const res = await fetch(`${DEEZER_SEARCH_URL}?q=${query}&limit=1`);
    if (!res.ok) return '';
    const data: DeezerSearchResponse = await res.json();
    return data.data?.[0]?.preview ?? '';
  } catch {
    return '';
  }
}

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Loads and caches base song data (no preview URLs) from a playlist CSV.
 * Skips rows marked as used.
 */
export async function loadSongs(playlist: string): Promise<Omit<SongWithPreview, 'previewUrl'>[]> {
  if (cache.has(playlist)) return cache.get(playlist)!;

  const csvPath = join(SONGS_DIR, `${playlist}.csv`);
  console.log(`📖 Loading playlist "${playlist}"…`);

  const rawCsv = await readFile(csvPath, 'utf-8');
  const rows: CsvSongRow[] = parse(rawCsv, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  const songs = rows
    .filter((row) => row.used !== 'true')
    .map(parseSongRow)
    .filter(isValidSong);

  console.log(`✅ ${songs.length} songs available in "${playlist}"`);
  cache.set(playlist, songs);
  return songs;
}

/**
 * Marks a song as used in the playlist CSV. Clears the cache for that playlist.
 */
export async function markSongUsed(playlist: string, name: string, artist: string): Promise<void> {
  const csvPath = join(SONGS_DIR, `${playlist}.csv`);
  const rawCsv = await readFile(csvPath, 'utf-8');
  const rows: CsvSongRow[] = parse(rawCsv, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  let changed = false;
  for (const row of rows) {
    if (
      row.name.toLowerCase() === name.toLowerCase() &&
      row.artist.toLowerCase() === artist.toLowerCase()
    ) {
      row.used = 'true';
      changed = true;
      break;
    }
  }

  if (changed) {
    const output = stringify(rows, {
      header: true,
      columns: ['name', 'artist', 'year', 'used'],
    });
    await writeFile(csvPath, output, 'utf-8');
    cache.delete(playlist);
  }
}