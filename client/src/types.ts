/**
 * types.ts
 * All shared TypeScript types for the Hitster client.
 * Import from here rather than defining inline types in components.
 */

import type { GAME_PHASE } from './constants/gameConstants';

// ── Domain Types ───────────────────────────────────────────────────────────────

/** A song loaded from the server. */
export interface Song {
  id: string;
  name: string;
  artist: string;
  year: number;
  /** Direct MP3 URL for the 30-second Deezer preview. Empty string if not found. */
  previewUrl: string;
}

/** One player's full state. */
export interface Player {
  /** Index used as stable ID (0–3). */
  id: number;
  name: string;
  /** CSS color value, e.g. 'var(--color-p1)'. */
  color: string;
  /** Board position that determines rotation and grid placement. */
  position: PlayerPosition;
  /** Songs already correctly placed, sorted by year. */
  timeline: Song[];
}

/** The four sides of the game board, in clockwise order. */
export type PlayerPosition = 'bottom' | 'left' | 'top' | 'right';

// ── Game State ─────────────────────────────────────────────────────────────────

export type GamePhase = (typeof GAME_PHASE)[keyof typeof GAME_PHASE];

export interface GameState {
  phase: GamePhase;
  players: Player[];
  currentPlayerIndex: number;
  /** The song for the current turn (hidden year until reveal). */
  currentSong: Song | null;
  /** Slot index the active player clicked; null = none selected yet. */
  tentativePlacementIndex: number | null;
  /** Set during REVEALING phase. null in all other phases. */
  placementCorrect: boolean | null;
  /** Set when phase === WON. */
  winner: Player | null;
  usedSongIds: string[];
  allSongs: Song[];
  playlist: string;
}

// ── Actions ────────────────────────────────────────────────────────────────────

export interface GameActions {
  initializeGame: (playerCount: number, songs: Song[], playlist: string) => void;
  playSong: () => Promise<void>;
  selectPlacement: (slotIndex: number) => void;
  confirmPlacement: () => void;
  advanceTurn: () => void;
  markSongUsed: (playlist: string, songName: string, artistName: string) => Promise<void>;
}