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
  const [showRules, setShowRules] = useState(false);
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
            {playlists.length === 0 && <option>Loading…</option>}
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

        <button
          className={styles.rulesButton}
          onClick={() => setShowRules(true)}
        >
          How to Play
        </button>

        <p className={styles.hint}>First to collect {WINNING_CARD_COUNT} cards wins!</p>
      </div>

      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
    </div>
  );
}

function RulesModal({ onClose }: { onClose: () => void }) {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose}>✕</button>
        <h2 className={styles.modalTitle}>How to Play</h2>

        <div className={styles.rulesList}>
          <div className={styles.rule}>
            <span className={styles.ruleIcon}>🎵</span>
            <div>
              <strong>Listen</strong>
              <p>Each turn, the active player presses Play. A 30-second song preview plays.</p>
            </div>
          </div>
          <div className={styles.rule}>
            <span className={styles.ruleIcon}>📅</span>
            <div>
              <strong>Place</strong>
              <p>While listening, pick where the song belongs on your timeline. Tap the slot between two cards that matches the release year.</p>
            </div>
          </div>
          <div className={styles.rule}>
            <span className={styles.ruleIcon}>🔒</span>
            <div>
              <strong>Lock In</strong>
              <p>Once you've chosen a slot, press Lock In to confirm your answer.</p>
            </div>
          </div>
          <div className={styles.rule}>
            <span className={styles.ruleIcon}>✅</span>
            <div>
              <strong>Score</strong>
              <p>Get it right — the card stays on your timeline. Get it wrong — the card is discarded. Your timeline grows in chronological order.</p>
            </div>
          </div>
          <div className={styles.rule}>
            <span className={styles.ruleIcon}>🏆</span>
            <div>
              <strong>Win</strong>
              <p>First player to collect {WINNING_CARD_COUNT} cards on their timeline wins!</p>
            </div>
          </div>
          <div className={styles.rule}>
            <span className={styles.ruleIcon}>🔖</span>
            <div>
              <strong>Song Packs</strong>
              <p>Each song pack tracks which songs you've already heard — so you'll never get a repeat across sessions.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}