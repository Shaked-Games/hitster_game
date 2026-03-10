/**
 * Timeline.tsx
 * Renders a player's ordered song timeline.
 *
 * During the PLACING phase for the active player, clickable insertion slots
 * appear between (and around) every card so the player can choose where to
 * place the current mystery song.
 *
 * The selected slot shows a preview of the song (year hidden) so the player
 * can see their choice before locking in.
 *
 * During REVEALING, the chosen slot shows the card with its year plus a
 * correct/wrong animation.
 */

import type { Song } from '../../types';
import { GAME_PHASE } from '../../constants/gameConstants';
import SongCard from './SongCard';
import styles from './Timeline.module.css';
import React from 'react';

interface Props {
  timeline: Song[];
  isActive: boolean;
  phase: string;
  currentSong: Song | null;
  tentativePlacementIndex: number | null;
  placementCorrect: boolean | null;
  onSlotClick: (index: number) => void;
  playerColor: string;
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
}: Props) {
  const isPlacing   = isActive && phase === GAME_PHASE.PLACING;
  const isRevealing = isActive && phase === GAME_PHASE.REVEALING;

  // Slot count = one before each card + one after the last
  const slotCount = timeline.length + 1;

  return (
    <div className={styles.timelineScroll}>
      <div className={styles.timeline}>
        {Array.from({ length: slotCount }, (_, slotIdx) => (
          <TimelineSlot
            key={`slot-${slotIdx}`}
            slotIdx={slotIdx}
            isPlacing={isPlacing}
            isSelected={tentativePlacementIndex === slotIdx}
            onSlotClick={onSlotClick}
            playerColor={playerColor}
            pendingCard={
              isPlacing && tentativePlacementIndex === slotIdx ? currentSong : null
            }
            timelineCard={timeline[slotIdx] ?? null}
            isRevealing={isRevealing}
            tentativePlacementIndex={tentativePlacementIndex}
            placementCorrect={placementCorrect}
            currentSong={currentSong}
          />
        ))}
      </div>
    </div>
  );
}

// ── TimelineSlot ──────────────────────────────────────────────────────────────

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
}: SlotProps) {
  const showRevealCard =
    isRevealing && tentativePlacementIndex === slotIdx && currentSong !== null;

  return (
    <>
      {/* Clickable insertion slot — only shown during PLACING */}
      {isPlacing && (
        <button
          className={`${styles.slot} ${isSelected ? styles.slotSelected : ''}`}
          style={{ '--player-color': playerColor } as React.CSSProperties}
          onClick={() => onSlotClick(slotIdx)}
          aria-label={`Insert song at position ${slotIdx + 1}`}
        >
          <span className={styles.slotLine} />
          <span className={styles.slotDot} />
          <span className={styles.slotLine} />
        </button>
      )}

      {/* Pending preview card (hideYear = true) */}
      {pendingCard && (
        <div className={styles.pendingCardWrapper}>
          <SongCard song={pendingCard} hideYear playerColor={playerColor} />
        </div>
      )}

      {/* Reveal card — shows year + correct/wrong state */}
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

      {/* Existing timeline card */}
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