/**
 * types.ts
 * Shared type definitions for the server.
 */

export interface Song {
  id: string;
  name: string;
  artist: string;
  year: number;
}

export interface SongWithPreview extends Song {
  /** Direct MP3 URL for the 30-second Deezer preview. Empty string if not found. */
  previewUrl: string;
}

/** Raw row shape from the CSV parser */
export interface CsvSongRow {
  name: string;
  artist: string;
  year: string;
  used?: string;
}

/** Shape of a Deezer track search result we care about */
export interface DeezerTrack {
  preview: string;
}

export interface DeezerSearchResponse {
  data: DeezerTrack[];
}