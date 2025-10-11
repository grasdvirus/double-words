"use client";

import { useContext } from 'react';
import { GameContext, type GameContextType } from '@/contexts/game-context';

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
