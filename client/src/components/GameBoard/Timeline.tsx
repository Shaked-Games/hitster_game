import type { Song } from '../../types';
import { GAME_PHASE } from '../../constants/gameConstants';
import SongCard from './SongCard';
import styles from './Timeline.module.css';

interface Props {
  timeline: Song[];
  isActive: boolean;
  phase: string;
  currentSong: Song | null;
  tentativePlacementIndex: number | null;
  placementCorrect: boolean | null;
  onSlotClick: (index: number) => void;
  playerColor: string;
  vertical?: boolean;
}

export default function Timeline({
  timeline,
  isActive,
  phase,
  currentSong,
  tentativePlacementIndex,
  placementCorrect,
  onSlotClick,
  playerColor,
  vertical = false,
}: Props) {
  const isPlacing   = isActive && phase === GAME_PHASE.PLACING;
  const isRevealing = isActive && phase === GAME_PHASE.REVEALING;
  const slotCount   = timeline.length + 1;

  const scrollClass  = vertical ? styles.timelineScrollVertical : styles.timelineScroll;
  const innerClass   = vertical ? styles.timelineVertical       : styles.timeline;

  return (
    <div className={scrollClass}>
      <div className={innerClass}>
        {Array.from({ length: slotCount }, (_, slotIdx) => (
          <TimelineSlot
            key={`slot-${slotIdx}`}
            slotIdx={slotIdx}
            isPlacing={isPlacing}
            isSelected={tentativePlacementIndex === slotIdx}
            onSlotClick={onSlotClick}
            playerColor={playerColor}
            pendingCard={isPlacing && tentativePlacementIndex === slotIdx ? currentSong : null}
            timelineCard={timeline[slotIdx] ?? null}
            isRevealing={isRevealing}
            tentativePlacementIndex={tentativePlacementIndex}
            placementCorrect={placementCorrect}
            currentSong={currentSong}
            vertical={vertical}
          />
        ))}
      </div>
    </div>
  );
}

interface SlotProps {
  slotIdx: number;
  isPlacing: boolean;
  isSelected: boolean;
  onSlotClick: (index: number) => void;
  playerColor: string;
  pendingCard: Song | null;
  timelineCard: Song | null;
  isRevealing: boolean;
  tentativePlacementIndex: number | null;
  placementCorrect: boolean | null;
  currentSong: Song | null;
  vertical: boolean;
}

function TimelineSlot({
  slotIdx,
  isPlacing,
  isSelected,
  onSlotClick,
  playerColor,
  pendingCard,
  timelineCard,
  isRevealing,
  tentativePlacementIndex,
  placementCorrect,
  currentSong,
  vertical,
}: SlotProps) {
  const showRevealCard =
    isRevealing && tentativePlacementIndex === slotIdx && currentSong !== null;

  const slotClass = [
    vertical ? styles.slotVertical : styles.slot,
    isSelected ? styles.slotSelected : '',
  ].join(' ');

  return (
    <>
      {isPlacing && (
        <button
          className={slotClass}
          style={{ '--player-color': playerColor } as React.CSSProperties}
          onClick={() => onSlotClick(slotIdx)}
          aria-label={`Insert song at position ${slotIdx + 1}`}
        >
          <span className={styles.slotLine} />
          <span className={styles.slotDot} />
          <span className={styles.slotLine} />
        </button>
      )}

      {pendingCard && (
        <div className={styles.pendingCardWrapper}>
          <SongCard song={pendingCard} hideYear playerColor={playerColor} />
        </div>
      )}

      {showRevealCard && currentSong && (
        <div className={styles.pendingCardWrapper}>
          <SongCard
            song={currentSong}
            hideYear={false}
            isCorrect={placementCorrect === true}
            isWrong={placementCorrect === false}
            playerColor={playerColor}
          />
        </div>
      )}

      {timelineCard && (
        <SongCard
          song={timelineCard}
          playerColor={playerColor}
          isAnchor={timelineCard.name === ''}
        />
      )}
    </>
  );
}

// React must be in scope for JSX in some configs
import React from 'react';