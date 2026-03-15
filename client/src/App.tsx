import { useState, useEffect, CSSProperties } from 'react';
import { fetchPlaylists, fetchSongs } from './services/api';
import { useGameState } from './hooks/useGameState';
import { GAME_PHASE } from './constants/gameConstants';
import PlayerSetup from './components/PlayerSetup/PlayerSetup';
import GameBoard from './components/GameBoard/GameBoard';
import WinScreen from './components/WinScreen/WinScreen';
import React from 'react';

export default function App() {
  const { state, actions } = useGameState();

  const [playlists, setPlaylists]               = useState<string[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string>('');
  const [starting, setStarting]                 = useState(false);
  const [loadError, setLoadError]               = useState<string | null>(null);

  // Load playlist names on mount only
  useEffect(() => {
    fetchPlaylists()
      .then((names) => {
        setPlaylists(names);
        if (names.length > 0) setSelectedPlaylist(names[0]);
      })
      .catch((err: Error) => setLoadError(err.message));
  }, []);

  async function handleStart(playerCount: number): Promise<void> {
    if (!selectedPlaylist || starting) return;
    setStarting(true);
    try {
      const songs = await fetchSongs(selectedPlaylist);
      actions.initializeGame(playerCount, songs, selectedPlaylist);
    } catch (err) {
      setLoadError((err as Error).message);
    } finally {
      setStarting(false);
    }
  }

  async function handlePlayAgain(): Promise<void> {
    actions.resetToSetup();
  }

  if (loadError) {
    return (
      <div style={errorContainerStyle}>
        <h2 style={{ color: 'var(--color-wrong)' }}>Failed to load</h2>
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
        playlists={playlists}
        selectedPlaylist={selectedPlaylist}
        onSelectPlaylist={setSelectedPlaylist}
        onStart={handleStart}
        starting={starting}
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