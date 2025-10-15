
"use client";

import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { collection, doc, getDoc, serverTimestamp, setDoc, addDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';

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
  saveFinalScore: (finalScore: number) => Promise<void>;
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
  const { user } = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    try {
      const savedState = localStorage.getItem('doubleWordsGame');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        if (typeof parsedState.score !== 'number' || isNaN(parsedState.score)) {
          parsedState.score = 0;
        }
        const mergedSettings = { ...defaultState.settings, ...parsedState.settings };
        parsedState.settings = mergedSettings;
        setGameState(parsedState);
      }
    } catch (error) {
      console.error("Failed to load game state from localStorage", error);
      setGameState(defaultState);
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

  const saveFinalScore = useCallback(async (finalScore: number) => {
    if (!user || !firestore || finalScore <= 0) return;

    // 1. Save to recent scores
    const recentScoresRef = collection(firestore, 'recentScores');
    const recentScoreData = {
      uid: user.uid,
      displayName: user.displayName || "Anonyme",
      photoURL: user.photoURL || "",
      score: finalScore,
      updatedAt: serverTimestamp(),
    };
    await addDoc(recentScoresRef, recentScoreData);

    // 2. Update all-time high score
    const leaderboardRef = doc(firestore, 'leaderboard', user.uid);
    const docSnap = await getDoc(leaderboardRef);

    if (docSnap.exists()) {
      const currentHighScore = docSnap.data().score || 0;
      if (finalScore > currentHighScore) {
        await setDoc(leaderboardRef, { score: finalScore, updatedAt: serverTimestamp() }, { merge: true });
      }
    } else {
      // First time saving a score
      await setDoc(leaderboardRef, {
        displayName: user.displayName || "Anonyme",
        photoURL: user.photoURL || "",
        score: finalScore,
        updatedAt: serverTimestamp(),
      });
    }
  }, [user, firestore]);

  const nextLevel = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      level: prev.level + 1,
    }));
  }, []);

  const updateScore = useCallback((points: number) => {
    setGameState(prev => ({
      ...prev,
      score: Math.max(0, (prev.score || 0) + points),
    }));
  }, []);

  const addWordToHistory = useCallback((word: string) => {
    setGameState(prev => ({
      ...prev,
      history: [...prev.history, word],
    }));
  }, []);

  const resetProgress = useCallback(() => {
    setGameState(prev => ({...defaultState, settings: prev.settings}));
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
    saveFinalScore,
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}
