/**
 * GameBoard.tsx
 * Main game screen — a CSS Grid with one PlayerZone per edge
 * and the CenterControl in the middle.
 *
 * Grid layout (3 columns × 3 rows):
 *   [ top    | top    | top    ]
 *   [ left   | center | right  ]
 *   [ bottom | bottom | bottom ]
 */

import type { GameState, GameActions } from '../../types';
import PlayerZone from './PlayerZone';
import CenterControl from './CenterControl';
import styles from './GameBoard.module.css';

interface Props {
  state: GameState;
  actions: GameActions;
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

  return (
    <div className={styles.board}>
      {players.map((player) => (
        <PlayerZone
          key={player.id}
          player={player}
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
          onDoneListening={actions.doneListen}
          onConfirmPlacement={actions.confirmPlacement}
          onNextTurn={actions.advanceTurn}
        />
      </div>
    </div>
  );
}
