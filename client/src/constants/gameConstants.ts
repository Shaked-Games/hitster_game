/**
 * gameConstants.ts
 * Single source of truth for all magic numbers and enumerated values.
 */

import type { PlayerPosition } from '../types';

export const MAX_PLAYERS = 4 as const;
export const WINNING_CARD_COUNT = 10 as const;

/** The year shown on every player's starting anchor card */
export const ANCHOR_YEAR = 1995 as const;

/**
 * Clockwise visual positions starting from bottom, indexed by player count.
 * The current player is always 'bottom'; others follow clockwise order.
 */
export const POSITIONS_BY_PLAYER_COUNT: Readonly<Record<number, readonly PlayerPosition[]>> = {
  2: ['bottom', 'top'],
  3: ['bottom', 'left', 'top'],
  4: ['bottom', 'left', 'top', 'right'],
} as const;

/** Clockwise order — used only as fallback / for Player type init */
export const PLAYER_POSITIONS: readonly PlayerPosition[] = [
  'bottom',
  'left',
  'top',
  'right',
] as const;

/** CSS custom-property accent color for each player (indexed 0–3). */
export const PLAYER_COLORS: readonly string[] = [
  'var(--color-p1)', // Player 1 – orange
  'var(--color-p2)', // Player 2 – cyan
  'var(--color-p3)', // Player 3 – yellow
  'var(--color-p4)', // Player 4 – purple
] as const;

export const PLAYER_DEFAULT_NAMES: readonly string[] = [
  'Player 1',
  'Player 2',
  'Player 3',
  'Player 4',
] as const;

/** All valid game phases. */
export const GAME_PHASE = {
  /** Player-count selection screen. */
  SETUP: 'setup',
  /** Current player's turn begins; waiting for Play button. */
  IDLE: 'idle',
  /** Song is playing and player is choosing a timeline slot simultaneously. */
  PLAYING: 'playing',
  /** Year is revealed; result shown before advancing. */
  REVEALING: 'revealing',
  /** A player has reached WINNING_CARD_COUNT. */
  WON: 'won',
} as const;

/** Reducer action type strings. */
export const ACTION = {
  INITIALIZE_GAME:   'INITIALIZE_GAME',
  PLAY_SONG:         'PLAY_SONG',
  SELECT_PLACEMENT:  'SELECT_PLACEMENT',
  CONFIRM_PLACEMENT: 'CONFIRM_PLACEMENT',
  OVERRIDE_GUESS:    'OVERRIDE_GUESS',
  ADVANCE_TURN:      'ADVANCE_TURN',
  RESET_TO_SETUP:    'RESET_TO_SETUP',
} as const;
