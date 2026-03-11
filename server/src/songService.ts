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

const SONGS_CSV_PATH = join(__dirname, '..', 'songs_list.csv');
const DEEZER_SEARCH_URL = 'https://api.deezer.com/search';

/** Base song data cached after first CSV load — no preview URLs stored */
let cachedBaseSongs: Omit<SongWithPreview, 'previewUrl'>[] | null = null;

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
 * Loads and caches base song data (no preview URLs) from the CSV.
 * Skips rows marked as used.
 */
export async function loadSongs(): Promise<Omit<SongWithPreview, 'previewUrl'>[]> {
  if (cachedBaseSongs) return cachedBaseSongs;

  console.log('📖 Loading songs from CSV…');

  const rawCsv = await readFile(SONGS_CSV_PATH, 'utf-8');
  const rows: CsvSongRow[] = parse(rawCsv, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  cachedBaseSongs = rows
    .filter((row) => row.used !== 'true')
    .map(parseSongRow)
    .filter(isValidSong);

  console.log(`✅ ${cachedBaseSongs.length} songs available`);
  return cachedBaseSongs;
}

/**
 * Marks a song as used in the CSV. Clears the in-memory cache.
 */
export async function markSongUsed(name: string, artist: string): Promise<void> {
  const rawCsv = await readFile(SONGS_CSV_PATH, 'utf-8');
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
    await writeFile(SONGS_CSV_PATH, output, 'utf-8');
    cachedBaseSongs = null;
  }
}