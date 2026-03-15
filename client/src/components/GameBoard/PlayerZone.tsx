import React from 'react';
import type { Player, Song, PlayerPosition } from '../../types';
import Timeline from './Timeline';
import styles from './PlayerZone.module.css';
import { WINNING_CARD_COUNT } from '../../constants/gameConstants';

interface Props {
  player: Player;
  position: PlayerPosition;   // visual position computed by GameBoard
  isCurrentPlayer: boolean;
  phase: string;
  currentSong: Song | null;
  tentativePlacementIndex: number | null;
  placementCorrect: boolean | null;
  onSlotClick: (index: number) => void;
}

export default function PlayerZone({
  player,
  position,
  isCurrentPlayer,
  phase,
  currentSong,
  tentativePlacementIndex,
  placementCorrect,
  onSlotClick,
}: Props) {
  const isVertical = position === 'left' || position === 'right';

  return (
    <div
      className={`${styles.zone} ${isCurrentPlayer ? styles.zoneActive : ''}`}
      data-position={position}
      style={{ '--player-color': player.color } as React.CSSProperties}
    >
      <div className={`${styles.inner} ${isVertical ? styles.innerVertical : ''}`}>
        <div className={styles.header}>
          <div className={styles.colorDot} style={{ background: player.color }} />
          <span className={styles.playerName}>{player.name}</span>
          <span className={styles.cardCount}>{player.timeline.length} / {WINNING_CARD_COUNT}</span>
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
          vertical={isVertical}
        />
      </div>
    </div>
  );
}