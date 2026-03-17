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
  | { type: 'RESET_TO_SETUP' }
  | { type: 'PLAY_SONG' }
  | { type: 'SET_PREVIEW_URL'; payload: { previewUrl: string } }
  | { type: 'SELECT_PLACEMENT'; payload: { slotIndex: number } }
  | { type: 'CONFIRM_PLACEMENT'; payload: { nameGuess: string; artistGuess: string } }
  | { type: 'OVERRIDE_GUESS' }
  | { type: 'ADVANCE_TURN' };

const INITIAL_STATE: GameState = {
  phase: GAME_PHASE.SETUP as GamePhase,
  players: [],
  currentPlayerIndex: 0,
  currentSong: null,
  tentativePlacementIndex: null,
  placementCorrect: null,
  nameCorrect: null,
  artistCorrect: null,
  nameGuess: '',
  artistGuess: '',
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
    chips: 2,
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

    case ACTION.RESET_TO_SETUP:
      return INITIAL_STATE;

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

      const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, '');
      const nameCorrect   = normalize(action.payload.nameGuess)   === normalize(currentSong.name);
      const artistCorrect = normalize(action.payload.artistGuess) === normalize(currentSong.artist);
      const bothCorrect   = nameCorrect && artistCorrect;

      // Award chip only if both name AND artist are correct (capped at 20)
      const updatedPlayersWithChip = players.map((p, i) =>
        i === currentPlayerIndex && bothCorrect
          ? { ...p, chips: Math.min(20, p.chips + 1) }
          : p
      );

      if (correct) {
        const updatedTimeline = insertAtIndex(
          updatedPlayersWithChip[currentPlayerIndex].timeline,
          currentSong,
          tentativePlacementIndex,
        );
        const updatedPlayers = updatedPlayersWithChip.map((p, i) =>
          i === currentPlayerIndex ? { ...p, timeline: updatedTimeline } : p
        );

        if (updatedTimeline.length >= WINNING_CARD_COUNT) {
          return {
            ...state,
            phase: GAME_PHASE.WON,
            players: updatedPlayers,
            winner: updatedPlayers[currentPlayerIndex],
            placementCorrect: true,
            nameCorrect,
            artistCorrect,
            nameGuess: action.payload.nameGuess,
            artistGuess: action.payload.artistGuess,
          };
        }

        return {
          ...state,
          phase: GAME_PHASE.REVEALING,
          players: updatedPlayers,
          placementCorrect: true,
          nameCorrect,
          artistCorrect,
          nameGuess: action.payload.nameGuess,
          artistGuess: action.payload.artistGuess,
        };
      }

      return {
        ...state,
        phase: GAME_PHASE.REVEALING,
        players: updatedPlayersWithChip,
        placementCorrect: false,
        nameCorrect,
        artistCorrect,
        nameGuess: action.payload.nameGuess,
        artistGuess: action.payload.artistGuess,
      };
    }

    case ACTION.OVERRIDE_GUESS: {
      if (state.nameCorrect && state.artistCorrect) return state;
      const { players, currentPlayerIndex } = state;
      const updatedPlayers = players.map((p, i) =>
        i === currentPlayerIndex
          ? { ...p, chips: Math.min(20, p.chips + 1) }
          : p
      );
      return {
        ...state,
        players: updatedPlayers,
        nameCorrect: true,
        artistCorrect: true,
      };
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
        nameCorrect: null,
        artistCorrect: null,
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

    confirmPlacement: (nameGuess, artistGuess) =>
      dispatch({ type: ACTION.CONFIRM_PLACEMENT, payload: { nameGuess, artistGuess } }),

    overrideGuess: () =>
+     dispatch({ type: ACTION.OVERRIDE_GUESS }),

    advanceTurn: () =>
      dispatch({ type: ACTION.ADVANCE_TURN }),

    resetToSetup: () =>
      dispatch({ type: ACTION.RESET_TO_SETUP }),

    markSongUsed: (playlist, name, artist) => {
      localMarkSongUsed(playlist, name, artist);
      return Promise.resolve();
    },
  };

  return { state, actions };
}