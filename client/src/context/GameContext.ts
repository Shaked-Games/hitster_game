import { createContext, useContext } from 'react';
import type { GameState, GameActions } from '../types';

interface GameContextValue {
  state: GameState;
  actions: GameActions;
}

export const GameContext = createContext<GameContextValue | null>(null);

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameContext.Provider');
  return ctx;
}