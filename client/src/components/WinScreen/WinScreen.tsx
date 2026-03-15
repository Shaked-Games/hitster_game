/**
 * WinScreen.tsx
 * Victory screen shown when a player reaches WINNING_CARD_COUNT cards.
 * Displays the winner, a ranked leaderboard, and a Play Again button.
 */

import React from 'react';
import type { Player } from '../../types';
import styles from './WinScreen.module.css';

interface Props {
  winner: Player;
  players: Player[];
  onPlayAgain: () => void;
}

export default function WinScreen({ winner, players, onPlayAgain }: Props) {
  const sortedPlayers = [...players].sort(
    (a, b) => b.timeline.length - a.timeline.length,
  );

  return (
    <div className={styles.container}>
      <div className={styles.grain} />

      <div className={styles.content}>
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
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

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

interface RowProps {
  player: Player;
  rank: number;
  isWinner: boolean;
}
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
