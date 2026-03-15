import { readFile } from 'fs/promises';
import { parse } from 'csv-parse/sync';
import { join } from 'path';
import { randomUUID } from 'crypto';
import type { SongWithPreview, CsvSongRow, DeezerSearchResponse } from './types';

const SONGS_DIR = join(__dirname, '..', 'songs');
const DEEZER_SEARCH_URL = 'https://api.deezer.com/search';

const cache = new Map<string, Omit<SongWithPreview, 'previewUrl'>[]>();

function parseSongRow(row: CsvSongRow): Omit<SongWithPreview, 'previewUrl'> {
  return {
    id: randomUUID(),
    name: row.name?.trim() ?? '',
    artist: row.artist?.trim() ?? '',
    year: parseInt(row.year, 10),
    csvPreviewUrl: row.preview_url?.trim() ?? '',
    searchQuery: row.search_query?.trim() ?? '',
  };
}

function isValidSong(song: Omit<SongWithPreview, 'previewUrl'>): boolean {
  return song.name.length > 0 && song.artist.length > 0 && !isNaN(song.year) && song.year > 1900;
}

export async function loadSongs(playlist: string): Promise<Omit<SongWithPreview, 'previewUrl'>[]> {
  if (cache.has(playlist)) return cache.get(playlist)!;

  const csvPath = join(SONGS_DIR, `${playlist}.csv`);
  console.log(`📖 Loading playlist "${playlist}"…`);

  const rawCsv = await readFile(csvPath, 'utf-8');
  const rows: CsvSongRow[] = parse(rawCsv, { 
    columns: true, 
    skip_empty_lines: true, 
    trim: true,
    bom: true,
  });
  const songs = rows.map(parseSongRow).filter(isValidSong);

  console.log(`✅ ${songs.length} songs in "${playlist}"`);
  cache.set(playlist, songs);
  return songs;
}

export async function fetchDeezerPreview(name: string, artist: string, searchQuery?: string): Promise<string> {
  try {
    const q = searchQuery || `${name} ${artist}`;
    const res = await fetch(`${DEEZER_SEARCH_URL}?q=${encodeURIComponent(q)}&limit=1`);
    if (!res.ok) return '';
    const data: DeezerSearchResponse = await res.json();
    return data.data?.[0]?.preview ?? '';
  } catch {
    return '';
  }
}