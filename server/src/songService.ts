/**
 * songService.ts
 * Loads songs from the CSV file and enriches them with Deezer preview URLs.
 *
 * Deezer's API is free and requires no authentication.
 * We search by "track artist" and take the first result's preview URL.
 * Results are cached after the first load.
 */

import { readFile, writeFile } from 'fs/promises';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import { join } from 'path';
import { randomUUID } from 'crypto';
import type { SongWithPreview, CsvSongRow, DeezerSearchResponse } from './types';

const SONGS_CSV_PATH = join(__dirname, '..', 'songs_list.csv');

/** Deezer public search endpoint — no auth required */
const DEEZER_SEARCH_URL = 'https://api.deezer.com/search';

/** Milliseconds to wait between Deezer requests to avoid rate limiting */
const DEEZER_REQUEST_DELAY_MS = 200;

let cachedSongs: SongWithPreview[] | null = null;

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

// ── Deezer Integration ────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Searches Deezer for a track and returns the 30s preview MP3 URL.
 * Returns an empty string if no result is found.
 */
async function fetchDeezerPreview(name: string, artist: string): Promise<string> {
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
 * Loads songs from CSV, enriches each with a Deezer preview URL, and caches.
 * This will make N HTTP requests to Deezer on first load (one per song).
 */
export async function loadSongs(): Promise<SongWithPreview[]> {
  if (cachedSongs) return cachedSongs;

  console.log('📖 Loading songs from CSV…');

  const rawCsv = await readFile(SONGS_CSV_PATH, 'utf-8');
  const rows: CsvSongRow[] = parse(rawCsv, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  const baseSongs = rows
    .map(parseSongRow)
    .filter(isValidSong)
    .filter((_, i) => rows[i].used !== 'true');  // skip already-used songs

  console.log(`🎵 Fetching Deezer previews for ${baseSongs.length} songs…`);

  const songsWithPreviews: SongWithPreview[] = [];
  for (const song of baseSongs) {
    const previewUrl = await fetchDeezerPreview(song.name, song.artist);
    songsWithPreviews.push({ ...song, previewUrl });
    await delay(DEEZER_REQUEST_DELAY_MS);
  }

  const found = songsWithPreviews.filter((s) => s.previewUrl).length;
  console.log(`✅ Previews found: ${found}/${baseSongs.length}`);

  cachedSongs = songsWithPreviews;
  return cachedSongs;
}

/**
 * Marks a song as used in the CSV by name+artist match.
 * Clears the in-memory cache so the next game load picks it up.
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
    cachedSongs = null; // bust cache so next game reloads without this song
  }
}