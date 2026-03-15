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

export async function fetchPreview(name: string, artist: string, csvPreviewUrl: string, searchQuery: string): Promise<string> {
  const params = new URLSearchParams({ name, artist, csvPreviewUrl, searchQuery });
  const res = await fetch(`${API_BASE}/songs/preview?${params}`);
  if (!res.ok) return '';
  const data: { previewUrl: string } = await res.json();
  return data.previewUrl ?? '';
}