/**
 * api.ts
 * All client ↔ server communication goes through this module.
 */

import type { Song } from '../types';

const API_BASE = '/api';

/**
 * Fetches the full song list from the server.
 * @throws {Error} if the request fails or the server returns a non-OK status.
 */
export async function fetchSongs(): Promise<Song[]> {
  const res = await fetch(`${API_BASE}/songs`);
  if (!res.ok) {
    throw new Error(`Failed to load songs: ${res.status} ${res.statusText}`);
  }
  const data: { songs: Song[] } = await res.json();
  return data.songs;
}

/**
 * Fetches a fresh Deezer preview URL for a single song, just before playback.
 */
export async function fetchPreview(name: string, artist: string): Promise<string> {
  const params = new URLSearchParams({ name, artist });
  const res = await fetch(`${API_BASE}/songs/preview?${params}`);
  if (!res.ok) return '';
  const data: { previewUrl: string } = await res.json();
  return data.previewUrl ?? '';
}
export async function markSongUsed(name: string, artist: string): Promise<void> {
  await fetch(`${API_BASE}/songs/mark-used`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, artist }),
  });
}