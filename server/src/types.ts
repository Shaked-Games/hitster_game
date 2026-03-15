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
  previewUrl: string;
  csvPreviewUrl: string;
  /** Optional override for Deezer search (e.g. English transliteration of Hebrew title). */
  searchQuery: string;
}

/** Raw row shape from the CSV parser */
export interface CsvSongRow {
  name: string;
  artist: string;
  year: string;
  preview_url?: string;
  search_query?: string;
}

/** Shape of a Deezer track search result we care about */
export interface DeezerTrack {
  preview: string;
}

export interface DeezerSearchResponse {
  data: DeezerTrack[];
}