/**
 * App.tsx
 * Root component. Loads songs on mount and routes between screens
 * based on the current game phase.
 */

import { useState, useEffect, CSSProperties } from 'react';
import { fetchSongs } from './services/api';
import { useGameState } from './hooks/useGameState';
import { GAME_PHASE } from './constants/gameConstants';
import type { Song } from './types';
import PlayerSetup from './components/PlayerSetup/PlayerSetup';
import GameBoard from './components/GameBoard/GameBoard';
import WinScreen from './components/WinScreen/WinScreen';
import React from 'react';

export default function App() {
  const { state, actions } = useGameState();

  const [songs, setSongs] = useState<Song[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load song list once on mount – it never changes during a session
  useEffect(() => {
    fetchSongs()
      .then(setSongs)
      .catch((err: Error) => setLoadError(err.message));
  }, []);

  // ── Handlers ───────────────────────────────────────────────────────────────

  function handleStart(playerCount: number): void {
    if (songs.length === 0) return;
    actions.initializeGame(playerCount, songs);
  }

  function handlePlayAgain(): void {
    actions.initializeGame(state.players.length, songs);
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loadError) {
    return (
      <div style={errorContainerStyle}>
        <h2 style={{ color: 'var(--color-p1)' }}>Failed to load songs</h2>
        <p>{loadError}</p>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Make sure the server is running on port 3001.
        </p>
      </div>
    );
  }

  if (state.phase === GAME_PHASE.SETUP) {
    return (
      <PlayerSetup
        onStart={handleStart}
        songsLoaded={songs.length > 0}
      />
    );
  }

  if (state.phase === GAME_PHASE.WON && state.winner) {
    return (
      <WinScreen
        winner={state.winner}
        players={state.players}
        onPlayAgain={handlePlayAgain}
      />
    );
  }

  return <GameBoard state={state} actions={actions} />;
}

const errorContainerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  gap: '12px',
  fontFamily: 'Outfit, sans-serif',
  textAlign: 'center',
  padding: '24px',
};
