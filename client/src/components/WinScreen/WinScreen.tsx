import React from 'react';
import type { Player } from '../../types';
import Confetti from './Confetti';
import styles from './WinScreen.module.css';

interface Props {
  winner: Player;
  players: Player[];
  onPlayAgain: () => void;
  onClose: () => void;
}

export default function WinScreen({ winner, players, onPlayAgain, onClose }: Props) {
  const sortedPlayers = [...players].sort((a, b) => b.timeline.length - a.timeline.length);

  return (
    <>
      <Confetti />

      {/* Backdrop — click to close */}
      <div className={styles.backdrop} onClick={onClose} />

      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>

        <WinnerBadge winner={winner} />

        <div className={styles.leaderboard}>
          {sortedPlayers.map((player, rank) => (
            <LeaderboardRow
              key={player.id}
              player={player}
              rank={rank + 1}
              isWinner={player.id === winner.id}
            />
          ))}
        </div>

        <button className={styles.playAgainButton} onClick={onPlayAgain}>
          PLAY AGAIN
        </button>
      </div>
    </>
  );
}

function WinnerBadge({ winner }: { winner: Player }) {
  return (
    <div
      className={styles.winnerBadge}
      style={{ '--winner-color': winner.color } as React.CSSProperties}
    >
      <span className={styles.trophy}>🏆</span>
      <h1 className={styles.winnerName}>{winner.name}</h1>
      <p className={styles.winnerLabel}>WINS THE GAME!</p>
    </div>
  );
}

interface RowProps { player: Player; rank: number; isWinner: boolean; }
function LeaderboardRow({ player, rank, isWinner }: RowProps) {
  return (
    <div
      className={`${styles.leaderboardRow} ${isWinner ? styles.leaderboardRowWinner : ''}`}
      style={{ '--player-color': player.color } as React.CSSProperties}
    >
      <span className={styles.rank}>#{rank}</span>
      <span className={styles.dot} style={{ background: player.color }} />
      <span className={styles.name}>{player.name}</span>
      <span className={styles.score}>{player.timeline.length} cards</span>
    </div>
  );
}