import type { Song } from '../types';

const API_BASE = '/api';

export async function fetchPlaylists(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/playlists`);
  if (!res.ok) throw new Error(`Failed to load playlists: ${res.statusText}`);
  const data: { playlists: string[] } = await res.json();
  return data.playlists;
}

export async function fetchSongs(playlist: string): Promise<Song[]> {
  const res = await fetch(`${API_BASE}/songs?playlist=${encodeURIComponent(playlist)}`);
  if (!res.ok) throw new Error(`Failed to load songs: ${res.status} ${res.statusText}`);
  const data: { songs: Song[] } = await res.json();
  return data.songs;
}

export async function fetchPreview(name: string, artist: string): Promise<string> {
  const params = new URLSearchParams({ name, artist });
  const res = await fetch(`${API_BASE}/songs/preview?${params}`);
  if (!res.ok) return '';
  const data: { previewUrl: string } = await res.json();
  return data.previewUrl ?? '';
}

export async function markSongUsed(playlist: string, name: string, artist: string): Promise<void> {
  await fetch(`${API_BASE}/songs/mark-used`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playlist, name, artist }),
  });
}