/**
 * GameBoard.tsx
 * Main game screen — a CSS Grid with one PlayerZone per edge
 * and the CenterControl in the middle.
 *
 * Grid layout:
 *   [ left | top    | right ]
 *   [ left | center | right ]
 *   [ left | bottom | right ]
 *
 * Left/right zones span the full screen height.
 * Top/bottom zones only occupy the narrow centre column.
 *
 * The current player always appears at the bottom.
 * Visual positions rotate clockwise as turns advance.
 */

import type { GameState, GameActions } from '../../types';
import type { PlayerPosition } from '../../types';
import { POSITIONS_BY_PLAYER_COUNT } from '../../constants/gameConstants';
import PlayerZone from './PlayerZone';
import CenterControl from './CenterControl';
import styles from './GameBoard.module.css';
import React from 'react';

interface Props {
  state: GameState;
  actions: GameActions;
}

/**
 * Returns the visual board position for each player.
 * The current player is always 'bottom'; others follow clockwise.
 */
function computeVisualPositions(
  numPlayers: number,
  currentPlayerIndex: number,
): PlayerPosition[] {
  const positions = POSITIONS_BY_PLAYER_COUNT[numPlayers] ?? POSITIONS_BY_PLAYER_COUNT[4];
  return Array.from({ length: numPlayers }, (_, i) => {
    const offset = (i - currentPlayerIndex + numPlayers) % numPlayers;
    return positions[offset];
  });
}

export default function GameBoard({ state, actions }: Props) {
  const {
    players,
    currentPlayerIndex,
    phase,
    currentSong,
    tentativePlacementIndex,
    placementCorrect,
  } = state;

  const currentPlayer = players[currentPlayerIndex];
  const visualPositions = computeVisualPositions(players.length, currentPlayerIndex);

  function handleNextTurn() {
    if (currentSong) {
      actions.markSongUsed(state.playlist, currentSong.name, currentSong.artist);
    }
    actions.advanceTurn();
  }

  return (
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
          onPlay={actions.playSong}
          onConfirmPlacement={actions.confirmPlacement}
          onNextTurn={handleNextTurn}
        />
      </div>
    </div>
  );
}