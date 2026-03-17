import React, { useState, useEffect } from 'react';
import type { GameState, GameActions } from '../../types';
import type { PlayerPosition } from '../../types';
import { POSITIONS_BY_PLAYER_COUNT, GAME_PHASE } from '../../constants/gameConstants';
import PlayerZone from './PlayerZone';
import CenterControl from './CenterControl';
import WinScreen from '../WinScreen/WinScreen';
import { playFanfare } from '../../utils/fanfare';
import styles from './GameBoard.module.css';

interface Props {
  state: GameState;
  actions: GameActions;
  onPlayAgain: () => void;
}

function computeVisualPositions(numPlayers: number, currentPlayerIndex: number): PlayerPosition[] {
  const positions = POSITIONS_BY_PLAYER_COUNT[numPlayers] ?? POSITIONS_BY_PLAYER_COUNT[4];
  return Array.from({ length: numPlayers }, (_, i) => {
    const offset = (i - currentPlayerIndex + numPlayers) % numPlayers;
    return positions[offset];
  });
}

export default function GameBoard({ state, actions, onPlayAgain }: Props) {
  const {
    players,
    currentPlayerIndex,
    phase,
    currentSong,
    tentativePlacementIndex,
    placementCorrect,
    nameCorrect,
    artistCorrect,
    winner,
  } = state;

  const [showWinModal, setShowWinModal] = useState(false);

  // When WON phase starts: wait 3s for reveal, then show modal + fanfare
  useEffect(() => {
    if (phase !== GAME_PHASE.WON) {
      setShowWinModal(false);
      return;
    }
    const timer = setTimeout(() => {
      setShowWinModal(true);
      playFanfare();
    }, 3000);
    return () => clearTimeout(timer);
  }, [phase]);

  const currentPlayer = players[currentPlayerIndex];
  const visualPositions = computeVisualPositions(players.length, currentPlayerIndex);

  function handleNextTurn() {
    if (currentSong) {
      actions.markSongUsed(state.playlist, currentSong.name, currentSong.artist);
    }
    actions.advanceTurn();
  }

  const isWon = phase === GAME_PHASE.WON;

  return (
    <>
      <div className={styles.board}>
        {players.map((player, i) => (
          <PlayerZone
            key={player.id}
            player={player}
            position={visualPositions[i]}
            isCurrentPlayer={player.id === currentPlayerIndex}
            phase={phase}
            currentSong={currentSong}
            tentativePlacementIndex={
              player.id === currentPlayerIndex ? tentativePlacementIndex : null
            }
            placementCorrect={
              player.id === currentPlayerIndex ? placementCorrect : null
            }
            onSlotClick={actions.selectPlacement}
          />
        ))}

        <div className={styles.centerCell}>
          <CenterControl
            phase={phase}
            currentPlayer={currentPlayer}
            currentSong={currentSong}
            tentativePlacementIndex={tentativePlacementIndex}
            placementCorrect={placementCorrect}
            nameCorrect={nameCorrect}
            artistCorrect={artistCorrect}
            onPlay={actions.playSong}
            onOverrideGuess={actions.overrideGuess}
            onConfirmPlacement={actions.confirmPlacement}
            onNextTurn={handleNextTurn}
            nextTurnDisabled={isWon}
            onPlayAgain={onPlayAgain}
          />
        </div>
      </div>

      {showWinModal && winner && (
        <WinScreen
          winner={winner}
          players={players}
          onPlayAgain={onPlayAgain}
          onClose={() => setShowWinModal(false)}
        />
      )}
    </>
  );
}