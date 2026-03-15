import { useReducer } from 'react';
import {
  GAME_PHASE,
  ACTION,
  PLAYER_POSITIONS,
  PLAYER_COLORS,
  PLAYER_DEFAULT_NAMES,
  WINNING_CARD_COUNT,
} from '../constants/gameConstants';
import type { GameState, GameActions, GamePhase, Player, Song } from '../types';
import { fetchPreview } from '../services/api';
import { markSongUsed as localMarkSongUsed, isSongUsed } from '../services/usedSongs';

type GameAction =
  | { type: 'INITIALIZE_GAME'; payload: { playerCount: number; songs: Song[]; playlist: string } }
  | { type: 'PLAY_SONG' }
  | { type: 'SET_PREVIEW_URL'; payload: { previewUrl: string } }
  | { type: 'SELECT_PLACEMENT'; payload: { slotIndex: number } }
  | { type: 'CONFIRM_PLACEMENT' }
  | { type: 'ADVANCE_TURN' };

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
  playlist: '',
};

function pickUnusedSong(allSongs: Song[], usedSongIds: string[]): Song | null {
  const usedSet = new Set(usedSongIds);
  const available = allSongs.filter((s) => !usedSet.has(s.id));
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

function insertAtIndex(timeline: Song[], song: Song, index: number): Song[] {
  const copy = [...timeline];
  copy.splice(index, 0, song);
  return copy;
}

function isPlacementCorrect(timeline: Song[], song: Song, slotIndex: number): boolean {
  const before = timeline[slotIndex - 1];
  const after  = timeline[slotIndex];
  return (before == null || before.year <= song.year) &&
         (after  == null || song.year  <= after.year);
}

function createPlayer(index: number, anchorYear: number): Player {
  return {
    id: index,
    name: PLAYER_DEFAULT_NAMES[index],
    color: PLAYER_COLORS[index],
    position: PLAYER_POSITIONS[index],
    timeline: [{
      id: `anchor-${index}`,
      name: '',
      artist: '',
      year: anchorYear,
      previewUrl: '',
      searchQuery: '',
    }],
  };
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {

    case ACTION.INITIALIZE_GAME: {
      const { playerCount, songs, playlist } = action.payload;
      // Filter out songs already played by this browser for this playlist
      const availableSongs = songs.filter((s) => !isSongUsed(playlist, s.name, s.artist));
      const years = availableSongs.length > 0
        ? availableSongs.map((s) => s.year)
        : songs.map((s) => s.year);
      const players = Array.from({ length: playerCount }, (_, i) => {
        const anchorYear = years[Math.floor(Math.random() * years.length)];
        return createPlayer(i, anchorYear);
      });
      const firstSong = pickUnusedSong(availableSongs, []);
      const usedSongIds = firstSong ? [firstSong.id] : [];
      return {
        ...INITIAL_STATE,
        phase: GAME_PHASE.IDLE,
        players,
        currentPlayerIndex: 0,
        currentSong: firstSong,
        usedSongIds,
        allSongs: availableSongs,
        playlist,
      };
    }

    case ACTION.PLAY_SONG:
      return { ...state, phase: GAME_PHASE.PLAYING };

    case 'SET_PREVIEW_URL':
      if (!state.currentSong) return state;
      return {
        ...state,
        currentSong: { ...state.currentSong, previewUrl: action.payload.previewUrl },
      };

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

      if (correct) {
        const updatedTimeline = insertAtIndex(
          players[currentPlayerIndex].timeline,
          currentSong,
          tentativePlacementIndex,
        );
        const updatedPlayers = players.map((p, i) =>
          i === currentPlayerIndex ? { ...p, timeline: updatedTimeline } : p
        );

        if (updatedTimeline.length >= WINNING_CARD_COUNT) {
          return {
            ...state,
            phase: GAME_PHASE.WON,
            players: updatedPlayers,
            winner: updatedPlayers[currentPlayerIndex],
            placementCorrect: true,
          };
        }

        return {
          ...state,
          phase: GAME_PHASE.REVEALING,
          players: updatedPlayers,
          placementCorrect: true,
        };
      }

      return { ...state, phase: GAME_PHASE.REVEALING, placementCorrect: false };
    }

    case ACTION.ADVANCE_TURN: {
      const {
        players, currentPlayerIndex, currentSong,
        tentativePlacementIndex, placementCorrect, allSongs,
      } = state;
      if (currentSong === null || tentativePlacementIndex === null) return state;

      // Card was already inserted into the timeline during CONFIRM_PLACEMENT if correct.
      // Here we just advance to the next player.
      const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
      const nextSong = pickUnusedSong(allSongs, state.usedSongIds);
      const newUsedIds = nextSong ? [...state.usedSongIds, nextSong.id] : state.usedSongIds;

      return {
        ...state,
        phase: GAME_PHASE.IDLE,
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

export function useGameState(): { state: GameState; actions: GameActions } {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);
  const stateRef = { current: state };
  stateRef.current = state;

  const actions: GameActions = {
    initializeGame: (playerCount, songs, playlist) =>
      dispatch({ type: ACTION.INITIALIZE_GAME, payload: { playerCount, songs, playlist } }),

    playSong: async () => {
      const song = stateRef.current.currentSong;
      dispatch({ type: ACTION.PLAY_SONG });
      if (song) {
        const previewUrl = await fetchPreview(song.name, song.artist, song.searchQuery);
        dispatch({ type: 'SET_PREVIEW_URL', payload: { previewUrl } });
      }
    },

    selectPlacement: (slotIndex) =>
      dispatch({ type: ACTION.SELECT_PLACEMENT, payload: { slotIndex } }),

    confirmPlacement: () =>
      dispatch({ type: ACTION.CONFIRM_PLACEMENT }),

    advanceTurn: () =>
      dispatch({ type: ACTION.ADVANCE_TURN }),

    markSongUsed: (playlist, name, artist) => {
      localMarkSongUsed(playlist, name, artist);
      return Promise.resolve();
    },
  };

  return { state, actions };
}