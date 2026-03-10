/**
 * PlayerZone.tsx
 * One player's area on the board, rotated to face the correct edge.
 *
 * Rotation per position:
 *   bottom →   0° (no rotation — default reading direction)
 *   left   →  90° (player sits at the left edge)
 *   top    → 180° (player sits at the top edge)
 *   right  → -90° (player sits at the right edge)
 */

import type { Player, Song } from '../../types';
import Timeline from './Timeline';
import styles from './PlayerZone.module.css';

const ROTATION_BY_POSITION: Record<string, number> = {
  bottom:   0,
  left:    90,
  top:    180,
  right:  -90,
};

interface Props {
  player: Player;
  isCurrentPlayer: boolean;
  phase: string;
  currentSong: Song | null;
  tentativePlacementIndex: number | null;
  placementCorrect: boolean | null;
  onSlotClick: (index: number) => void;
}

export default function PlayerZone({
  player,
  isCurrentPlayer,
  phase,
  currentSong,
  tentativePlacementIndex,
  placementCorrect,
  onSlotClick,
}: Props) {
  const rotation = ROTATION_BY_POSITION[player.position] ?? 0;

  return (
    <div
      className={`${styles.zone} ${isCurrentPlayer ? styles.zoneActive : ''}`}
      data-position={player.position}
      style={{ '--player-color': player.color } as React.CSSProperties}
    >
      <div
        className={`${styles.inner} ${styles[`inner_${player.position}`]}`}
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <div className={styles.header}>
          <div className={styles.colorDot} style={{ background: player.color }} />
          <span className={styles.playerName}>{player.name}</span>
          <span className={styles.cardCount}>{player.timeline.length} / 10</span>
        </div>

        <Timeline
          timeline={player.timeline}
          isActive={isCurrentPlayer}
          phase={phase}
          currentSong={currentSong}
          tentativePlacementIndex={tentativePlacementIndex}
          placementCorrect={placementCorrect}
          onSlotClick={onSlotClick}
          playerColor={player.color}
        />
      </div>
    </div>
  );
}
