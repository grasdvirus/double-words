
"use client";

import React, { createContext, useState, useCallback, ReactNode, useContext } from 'react';

export interface NotificationDetails {
  title: string;
  message: string;
  type: 'error' | 'success' | 'info';
  duration?: 'persistent' | number;
}

interface NotificationState extends NotificationDetails {
  id: number;
}

interface NotificationContextType {
  notification: NotificationState | null;
  showNotification: (details: Omit<NotificationDetails, 'title'|'message'> & { title: string; message: string }) => void;
  hideNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const hideNotification = useCallback(() => {
    setNotification(null);
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
  }, [timeoutId]);

  const showNotification = useCallback((details: NotificationDetails) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    const newId = Date.now();
    setNotification({ ...details, id: newId });

    const { duration = 5000 } = details;

    if (duration !== 'persistent') {
      const newTimeoutId = setTimeout(() => {
        hideNotification();
      }, duration);
      setTimeoutId(newTimeoutId);
    }
  }, [hideNotification, timeoutId]);

  const value = {
    notification,
    showNotification,
    hideNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
