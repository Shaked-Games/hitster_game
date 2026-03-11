/**
 * CenterControl.tsx
 * Renders a different view per game phase:
 *   IDLE      – player name badge + Play button
 *   PLAYING   – audio player + lock-in button (slot selection happens on the timeline simultaneously)
 *   REVEALING – correct/wrong result + year reveal + "Next Player" button
 */

import React from 'react';
import type { Player, Song } from '../../types';
import { GAME_PHASE } from '../../constants/gameConstants';
import styles from './CenterControl.module.css';

interface Props {
  phase: string;
  currentPlayer: Player;
  currentSong: Song | null;
  tentativePlacementIndex: number | null;
  placementCorrect: boolean | null;
  onPlay: () => void;
  onConfirmPlacement: () => void;
  onNextTurn: () => void;
}

export default function CenterControl({
  phase,
  currentPlayer,
  currentSong,
  tentativePlacementIndex,
  placementCorrect,
  onPlay,
  onConfirmPlacement,
  onNextTurn,
}: Props) {
  return (
    <div
      className={styles.center}
      style={{ '--player-color': currentPlayer.color } as React.CSSProperties}
    >
      {phase === GAME_PHASE.IDLE && (
        <IdleView currentPlayer={currentPlayer} onPlay={onPlay} />
      )}

      {phase === GAME_PHASE.PLAYING && currentSong && (
        <PlayingView
          currentSong={currentSong}
          playerColor={currentPlayer.color}
          hasSelection={tentativePlacementIndex !== null}
          onConfirmPlacement={onConfirmPlacement}
        />
      )}

      {phase === GAME_PHASE.REVEALING && (
        <RevealingView
          placementCorrect={placementCorrect}
          currentSong={currentSong}
          onNextTurn={onNextTurn}
        />
      )}
    </div>
  );
}

// ── Sub-views ─────────────────────────────────────────────────────────────────

interface IdleViewProps {
  currentPlayer: Player;
  onPlay: () => void;
}
function IdleView({ currentPlayer, onPlay }: IdleViewProps) {
  return (
    <div className={styles.idleView}>
      <div className={styles.turnBadge} style={{ background: currentPlayer.color }}>
        {currentPlayer.name}'s Turn
      </div>
      <p className={styles.songHint}>A mystery song awaits…</p>
      <button className={styles.playButton} onClick={onPlay}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M8 5.14v14l11-7-11-7z" />
        </svg>
        <span>PLAY</span>
      </button>
      <p className={styles.instruction}>
        Press play to hear the song, then place it on your timeline
      </p>
    </div>
  );
}

interface PlayingViewProps {
  currentSong: Song;
  playerColor: string;
  hasSelection: boolean;
  onConfirmPlacement: () => void;
}
function PlayingView({ currentSong, playerColor, hasSelection, onConfirmPlacement }: PlayingViewProps) {
  return (
    <div className={styles.playingView}>
      {currentSong.previewUrl ? (
        <AudioPlayer src={currentSong.previewUrl} playerColor={playerColor} />
      ) : (
        <div className={styles.audioLoading}>
          <div className={styles.audioSpinner} />
          <span>Loading preview…</span>
        </div>
      )}
      <p className={styles.instruction}>
        Pick a spot on your timeline, then lock it in.
      </p>
      <button
        className={styles.lockButton}
        onClick={onConfirmPlacement}
        disabled={!hasSelection}
      >
        Lock In ✓
      </button>
    </div>
  );
}

// ── Custom Audio Player ───────────────────────────────────────────────────────

interface AudioPlayerProps {
  src: string;
  playerColor: string;
}

function AudioPlayer({ src, playerColor }: AudioPlayerProps) {
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [duration, setDuration] = React.useState(0);

  // Auto-play when the component mounts
  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.play().then(() => setIsPlaying(true)).catch(() => {});
    return () => { audio.pause(); };
  }, [src]);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }

  function handleTimeUpdate() {
    const audio = audioRef.current;
    if (!audio) return;
    setProgress(audio.currentTime);
  }

  function handleLoadedMetadata() {
    const audio = audioRef.current;
    if (!audio) return;
    setDuration(audio.duration);
  }

  function handleDurationChange() {
    const audio = audioRef.current;
    if (!audio || !isFinite(audio.duration)) return;
    setDuration(audio.duration);
  }

  function handleEnded() {
    setIsPlaying(false);
    setProgress(0);
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const audio = audioRef.current;
    if (!audio) return;
    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setProgress(newTime);
  }

  function formatTime(secs: number): string {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  const progressPercent = (duration > 0 && isFinite(duration))
    ? Math.min((progress / duration) * 100, 100)
    : 0;

  return (
    <div
      className={styles.audioPlayer}
      style={{ '--player-color': playerColor } as React.CSSProperties}
    >
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onDurationChange={handleDurationChange}
        onEnded={handleEnded}
      />

      <button className={styles.audioPlayBtn} onClick={togglePlay}>
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </button>

      <div className={styles.audioProgressWrapper}>
        <div className={styles.audioTrackWrapper}>
          <div className={styles.audioTrackBg} />
          <div
            className={styles.audioTrackFill}
            style={{ width: `${progressPercent}%` }}
          />
          <input
            type="range"
            className={styles.audioProgressBar}
            min={0}
            max={duration || 30}
            step={0.1}
            value={progress}
            onChange={handleSeek}
          />
        </div>
        <div className={styles.audioTimes}>
          <span>{formatTime(progress)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}

interface PlacingViewProps {
  currentPlayer: Player;
  hasSelection: boolean;
  onConfirmPlacement: () => void;
}
function PlacingView({ currentPlayer, hasSelection, onConfirmPlacement }: PlacingViewProps) {
  return (
    <div className={styles.placingView}>
      <p className={styles.placingTitle}>Place the song!</p>
      <p className={styles.instruction}>
        {hasSelection
          ? 'Happy with that spot? Lock it in!'
          : `${currentPlayer.name}: tap a slot on your timeline`}
      </p>
      <button
        className={styles.lockButton}
        onClick={onConfirmPlacement}
        disabled={!hasSelection}
      >
        🔒 Lock In
      </button>
    </div>
  );
}

interface RevealingViewProps {
  placementCorrect: boolean | null;
  currentSong: Song | null;
  onNextTurn: () => void;
}
function RevealingView({ placementCorrect, currentSong, onNextTurn }: RevealingViewProps) {
  return (
    <div className={styles.revealingView}>
      {placementCorrect === true && (
        <div className={`${styles.resultBanner} ${styles.resultCorrect}`}>
          <span className={styles.resultIcon}>✓</span>
          <span className={styles.resultText}>Correct!</span>
          {currentSong && (
            <span className={styles.resultYear}>{currentSong.year}</span>
          )}
        </div>
      )}
      {placementCorrect === false && (
        <div className={`${styles.resultBanner} ${styles.resultWrong}`}>
          <span className={styles.resultIcon}>✗</span>
          <span className={styles.resultText}>Not quite!</span>
          {currentSong && (
            <span className={styles.resultYear}>{currentSong.year}</span>
          )}
        </div>
      )}
      <button className={styles.nextButton} onClick={onNextTurn}>
        Next Player →
      </button>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5.14v14l11-7-11-7z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  );
}