
"use client";

import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { collection, doc, getDoc, serverTimestamp, setDoc, deleteDoc } from 'firebase/firestore';

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
  seasonEndDate: Date;
}

export interface GameContextType extends GameState {
  nextLevel: () => void;
  updateScore: (points: number) => void;
  addWordToHistory: (word: string) => void;
  resetProgress: () => void;
  updateSettings: (newSettings: Partial<GameSettings>) => void;
  saveFinalScore: (finalScore: number) => Promise<void>;
}

const getInitialSeasonEndDate = (): Date => {
  const storedDate = typeof window !== 'undefined' ? localStorage.getItem('seasonEndDate') : null;
  if (storedDate) {
    const date = new Date(storedDate);
    if (date.getTime() > Date.now()) {
      return date;
    }
  }
  // If no valid date, set a new one 2 days from now
  const newEndDate = new Date();
  newEndDate.setDate(newEndDate.getDate() + 2);
  if (typeof window !== 'undefined') {
    localStorage.setItem('seasonEndDate', newEndDate.toISOString());
  }
  return newEndDate;
};

const defaultState: GameState = {
  level: 1,
  score: 0,
  history: [],
  settings: {
    language: 'FR',
    soundVolume: 0.5,
    enableSound: true,
  },
  seasonEndDate: getInitialSeasonEndDate(),
};

export const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<GameState>(defaultState);
  const [isLoaded, setIsLoaded] = useState(false);
  const { user } = useUser();
  const firestore = useFirestore();

  const checkSeason = useCallback(() => {
    if (new Date().getTime() >= gameState.seasonEndDate.getTime()) {
      // Season is over
      const newEndDate = new Date();
      newEndDate.setDate(newEndDate.getDate() + 2);
      
      setGameState(prev => ({
        ...prev,
        seasonEndDate: newEndDate
      }));

      localStorage.setItem('seasonEndDate', newEndDate.toISOString());
      
      // Reset user's leaderboard score
      if (user && firestore) {
        const leaderboardRef = doc(firestore, 'leaderboard', user.uid);
        // We delete the doc to reset score to 0 for next season.
        // It will be re-created on next score save.
        deleteDoc(leaderboardRef);
      }
    }
  }, [gameState.seasonEndDate, user, firestore]);

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

        // Ensure seasonEndDate is part of the loaded state
        const endDate = getInitialSeasonEndDate();
        setGameState({...parsedState, seasonEndDate: endDate });

      } else {
         setGameState(prev => ({...prev, seasonEndDate: getInitialSeasonEndDate()}));
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
      checkSeason();
      const interval = setInterval(checkSeason, 60000); // Check every minute
      return () => clearInterval(interval);
    }
  }, [isLoaded, checkSeason]);


  useEffect(() => {
    if (isLoaded) {
      try {
        const stateToSave = { ...gameState, seasonEndDate: gameState.seasonEndDate.toISOString() };
        localStorage.setItem('doubleWordsGame', JSON.stringify(stateToSave));
      } catch (error) {
        console.error("Failed to save game state to localStorage", error);
      }
    }
  }, [gameState, isLoaded]);

  const saveFinalScore = useCallback(async (finalScore: number) => {
    if (!user || !firestore) return;
    
    const userData = {
      uid: user.uid,
      displayName: user.displayName || "Anonyme",
      photoURL: user.photoURL || "",
    };

    const leaderboardRef = doc(firestore, 'leaderboard', user.uid);
    const docSnap = await getDoc(leaderboardRef);

    const currentHighScore = docSnap.exists() ? docSnap.data().score || 0 : 0;

    if (finalScore > currentHighScore) {
      await setDoc(leaderboardRef, {
        ...userData,
        score: finalScore,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } else if (!docSnap.exists()) {
       await setDoc(leaderboardRef, {
        ...userData,
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
    setGameState(prev => ({...defaultState, settings: prev.settings, seasonEndDate: prev.seasonEndDate}));
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
