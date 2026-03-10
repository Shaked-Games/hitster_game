/**
 * useGameState.ts
 * Central game-state management via useReducer.
 * All game logic lives in pure functions outside the reducer for testability.
 */

import { useReducer } from 'react';
import {
  GAME_PHASE,
  ACTION,
  PLAYER_POSITIONS,
  PLAYER_COLORS,
  PLAYER_DEFAULT_NAMES,
  WINNING_CARD_COUNT,
  ANCHOR_YEAR,
} from '../constants/gameConstants';
import type { GameState, GameActions, GamePhase, Player, Song } from '../types';

// ── Reducer Action Types ───────────────────────────────────────────────────────

type GameAction =
  | { type: 'INITIALIZE_GAME'; payload: { playerCount: number; songs: Song[] } }
  | { type: 'PLAY_SONG' }
  | { type: 'DONE_LISTENING' }
  | { type: 'SELECT_PLACEMENT'; payload: { slotIndex: number } }
  | { type: 'CONFIRM_PLACEMENT' }
  | { type: 'ADVANCE_TURN' };

// ── Initial State ──────────────────────────────────────────────────────────────

const INITIAL_STATE: GameState = {
  phase: GAME_PHASE.SETUP as GamePhase,
  players: [],
  currentPlayerIndex: 0,
  currentSong: null,
  tentativePlacementIndex: null,
  placementCorrect: null,
  winner: null,
  usedSongIds: [],
  allSongs: [],
};

// ── Pure Helper Functions ──────────────────────────────────────────────────────

/**
 * Returns a random song that hasn't been used yet, or null if none remain.
 */
function pickUnusedSong(allSongs: Song[], usedSongIds: string[]): Song | null {
  const usedSet = new Set(usedSongIds);
  const available = allSongs.filter((s) => !usedSet.has(s.id));
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

/**
 * Inserts a song into a timeline array at the given index.
 * Does NOT mutate the original array.
 */
function insertAtIndex(timeline: Song[], song: Song, index: number): Song[] {
  const copy = [...timeline];
  copy.splice(index, 0, song);
  return copy;
}

/**
 * Returns true if placing `song` at `slotIndex` within `timeline` is
 * chronologically correct (i.e. year fits between surrounding cards).
 *
 * slotIndex === 0 means "before all cards".
 * slotIndex === timeline.length means "after all cards".
 */
function isPlacementCorrect(
  timeline: Song[],
  song: Song,
  slotIndex: number,
): boolean {
  const before = timeline[slotIndex - 1];
  const after  = timeline[slotIndex];
  const fitsAfterPrev  = before == null || before.year <= song.year;
  const fitsBeforeNext = after  == null || song.year  <= after.year;
  return fitsAfterPrev && fitsBeforeNext;
}

/**
 * The shared anchor card placed on every player's timeline at game start.
 * It shows only the year — no song name or artist.
 */
const ANCHOR_CARD: Song = {
  id: 'anchor',
  name: '',
  artist: '',
  year: ANCHOR_YEAR,
  previewUrl: '',
};

/**
 * Creates a Player object for the given index with the anchor card as the
 * starting timeline entry.
 */
function createPlayer(index: number): Player {
  return {
    id: index,
    name: PLAYER_DEFAULT_NAMES[index],
    color: PLAYER_COLORS[index],
    position: PLAYER_POSITIONS[index],
    timeline: [ANCHOR_CARD],
  };
}

// ── Reducer ────────────────────────────────────────────────────────────────────

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {

    case ACTION.INITIALIZE_GAME: {
      const { playerCount, songs } = action.payload;

      // All players start with the same anchor card — no songs consumed
      const players: Player[] = Array.from({ length: playerCount }, (_, i) =>
        createPlayer(i),
      );

      // Pick the first song for Player 0's turn
      const firstSong = pickUnusedSong(songs, []);
      const usedSongIds = firstSong ? [firstSong.id] : [];

      return {
        ...INITIAL_STATE,
        phase: GAME_PHASE.IDLE,
        players,
        currentPlayerIndex: 0,
        currentSong: firstSong,
        usedSongIds,
        allSongs: songs,
      };
    }

    case ACTION.PLAY_SONG:
      return { ...state, phase: GAME_PHASE.PLAYING };

    case ACTION.DONE_LISTENING:
      return { ...state, phase: GAME_PHASE.PLACING };

    case ACTION.SELECT_PLACEMENT:
      return { ...state, tentativePlacementIndex: action.payload.slotIndex };

    case ACTION.CONFIRM_PLACEMENT: {
      const { players, currentPlayerIndex, currentSong, tentativePlacementIndex } = state;
      if (currentSong === null || tentativePlacementIndex === null) return state;

      const correct = isPlacementCorrect(
        players[currentPlayerIndex].timeline,
        currentSong,
        tentativePlacementIndex,
      );
      return { ...state, phase: GAME_PHASE.REVEALING, placementCorrect: correct };
    }

    case ACTION.ADVANCE_TURN: {
      const {
        players,
        currentPlayerIndex,
        currentSong,
        tentativePlacementIndex,
        placementCorrect,
        allSongs,
      } = state;

      if (currentSong === null || tentativePlacementIndex === null) return state;

      // Update the active player's timeline if placement was correct
      const updatedPlayers = players.map((player, idx): Player => {
        if (idx !== currentPlayerIndex || !placementCorrect) return player;
        return {
          ...player,
          timeline: insertAtIndex(player.timeline, currentSong, tentativePlacementIndex),
        };
      });

      // Check win condition
      if (updatedPlayers[currentPlayerIndex].timeline.length >= WINNING_CARD_COUNT) {
        return {
          ...state,
          phase: GAME_PHASE.WON,
          players: updatedPlayers,
          winner: updatedPlayers[currentPlayerIndex],
        };
      }

      // Advance clockwise to the next player
      const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
      const nextSong = pickUnusedSong(allSongs, state.usedSongIds);
      const newUsedIds = nextSong
        ? [...state.usedSongIds, nextSong.id]
        : state.usedSongIds;

      return {
        ...state,
        phase: GAME_PHASE.IDLE,
        players: updatedPlayers,
        currentPlayerIndex: nextPlayerIndex,
        currentSong: nextSong,
        tentativePlacementIndex: null,
        placementCorrect: null,
        usedSongIds: newUsedIds,
      };
    }

    default:
      return state;
  }
}

// ── Public Hook ────────────────────────────────────────────────────────────────

/**
 * Exposes the full game state and all dispatched actions.
 */
export function useGameState(): { state: GameState; actions: GameActions } {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);

  const actions: GameActions = {
    initializeGame: (playerCount, songs) =>
      dispatch({ type: ACTION.INITIALIZE_GAME, payload: { playerCount, songs } }),

    playSong: () =>
      dispatch({ type: ACTION.PLAY_SONG }),

    doneListen: () =>
      dispatch({ type: ACTION.DONE_LISTENING }),

    selectPlacement: (slotIndex) =>
      dispatch({ type: ACTION.SELECT_PLACEMENT, payload: { slotIndex } }),

    confirmPlacement: () =>
      dispatch({ type: ACTION.CONFIRM_PLACEMENT }),

    advanceTurn: () =>
      dispatch({ type: ACTION.ADVANCE_TURN }),
  };

  return { state, actions };
}