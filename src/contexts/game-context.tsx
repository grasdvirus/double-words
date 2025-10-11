"use client";

import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';

const MAX_LEVEL = 20;

export interface GameSettings {
  language: 'FR' | 'EN';
  soundVolume: number;
  enableSound: boolean;
}

export interface GameState {
  level: number;
  score: number;
  history: string[];
  settings: GameSettings;
}

export interface GameContextType extends GameState {
  nextLevel: () => void;
  updateScore: (points: number) => void;
  addWordToHistory: (word: string) => void;
  resetProgress: () => void;
  updateSettings: (newSettings: Partial<GameSettings>) => void;
}

const defaultState: GameState = {
  level: 1,
  score: 0,
  history: [],
  settings: {
    language: 'FR',
    soundVolume: 0.5,
    enableSound: true,
  },
};

export const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<GameState>(defaultState);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedState = localStorage.getItem('doubleWordsGame');
      if (savedState) {
        setGameState(JSON.parse(savedState));
      }
    } catch (error) {
      console.error("Failed to load game state from localStorage", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('doubleWordsGame', JSON.stringify(gameState));
      } catch (error) {
        console.error("Failed to save game state to localStorage", error);
      }
    }
  }, [gameState, isLoaded]);

  const nextLevel = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      level: prev.level < MAX_LEVEL ? prev.level + 1 : MAX_LEVEL,
    }));
  }, []);

  const updateScore = useCallback((points: number) => {
    setGameState(prev => ({
      ...prev,
      score: Math.max(0, prev.score + points),
    }));
  }, []);

  const addWordToHistory = useCallback((word: string) => {
    setGameState(prev => ({
      ...prev,
      history: [...prev.history, word],
    }));
  }, []);

  const resetProgress = useCallback(() => {
    if(window.confirm("Êtes-vous sûr de vouloir réinitialiser votre progression ?")) {
      setGameState(defaultState);
    }
  }, []);

  const updateSettings = useCallback((newSettings: Partial<GameSettings>) => {
    setGameState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings },
    }));
  }, []);

  const value = {
    ...gameState,
    nextLevel,
    updateScore,
    addWordToHistory,
    resetProgress,
    updateSettings,
  };

  if (!isLoaded) {
    return null; // Or a loading spinner
  }

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}
