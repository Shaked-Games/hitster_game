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
