/**
 * SongCard.tsx
 * Displays a single song as a square card.
 *
 * States:
 *   - Normal:  default appearance
 *   - hideYear: shows '?' instead of the actual year
 *   - isCorrect: green border + pulse after reveal
 *   - isWrong:   red border + shake after reveal
 */

import React from 'react';
import type { Song } from '../../types';
import styles from './SongCard.module.css';

interface Props {
  song: Song;
  hideYear?: boolean;
  isCorrect?: boolean;
  isWrong?: boolean;
  playerColor?: string;
  isAnchor?: boolean;
}

export default function SongCard({
  song,
  hideYear = false,
  isCorrect = false,
  isWrong = false,
  playerColor,
  isAnchor = false,
}: Props) {
  const borderColor = isCorrect
    ? 'var(--color-p4)'
    : isWrong
    ? 'var(--color-p1)'
    : (playerColor ?? 'rgba(255,255,255,0.12)');

  const classNames = [
    styles.card,
    isAnchor  && styles.cardAnchor,
    isCorrect && styles.cardCorrect,
    isWrong   && styles.cardWrong,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classNames}
      style={{ '--card-accent': borderColor } as React.CSSProperties}
    >
      <span className={styles.artist}>
        {isAnchor || hideYear ? '' : song.artist}
      </span>
      <span className={styles.year}>
        {hideYear ? '?' : song.year}
      </span>
      <span className={styles.songName}>
        {isAnchor || hideYear ? '' : song.name}
      </span>
    </div>
  );
}