import { useState } from 'react';
import { MAX_PLAYERS, WINNING_CARD_COUNT } from '../../constants/gameConstants';
import styles from './PlayerSetup.module.css';
import React from 'react';

interface Props {
  playlists: string[];
  selectedPlaylist: string;
  onSelectPlaylist: (name: string) => void;
  onStart: (playerCount: number) => void;
  starting: boolean;
}

export default function PlayerSetup({
  playlists,
  selectedPlaylist,
  onSelectPlaylist,
  onStart,
  starting,
}: Props) {
  const [selectedCount, setSelectedCount] = useState(2);
  const playerOptions = Array.from({ length: MAX_PLAYERS }, (_, i) => i + 1);

  return (
    <div className={styles.container}>
      <div className={styles.grain} />

      <div className={styles.card}>
        <h1 className={styles.title}>HITSTER</h1>
        <p className={styles.subtitle}>How well do you know the music timeline?</p>

        <span className={styles.sectionLabel}>Number of Players</span>

        <div className={styles.playerGrid}>
          {playerOptions.map((count) => (
            <button
              key={count}
              className={`${styles.playerButton} ${
                selectedCount === count ? styles.playerButtonActive : ''
              }`}
              onClick={() => setSelectedCount(count)}
              aria-pressed={selectedCount === count}
            >
              <span className={styles.playerCount}>{count}</span>
              <span className={styles.playerLabel}>
                {count === 1 ? 'Player' : 'Players'}
              </span>
            </button>
          ))}
        </div>

        <span className={styles.sectionLabel}>Song Pack</span>

        <div className={styles.selectWrapper}>
          <select
            className={styles.playlistSelect}
            value={selectedPlaylist}
            onChange={(e) => onSelectPlaylist(e.target.value)}
            disabled={playlists.length === 0}
          >
            {playlists.length === 0 && (
              <option>Loading…</option>
            )}
            {playlists.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <span className={styles.selectArrow}>▾</span>
        </div>

        <button
          className={styles.startButton}
          onClick={() => onStart(selectedCount)}
          disabled={starting || playlists.length === 0}
        >
          {starting ? 'Loading…' : 'START GAME'}
        </button>

        <p className={styles.hint}>First to collect {WINNING_CARD_COUNT} cards wins!</p>
      </div>
    </div>
  );
}