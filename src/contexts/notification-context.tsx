"use client";

import React, { createContext, useState, useCallback, ReactNode, useContext } from 'react';

interface NotificationState {
  id: number;
  title: string;
  message: string;
  type: 'error' | 'success' | 'info';
}

interface NotificationContextType {
  notification: NotificationState | null;
  showNotification: (details: Omit<NotificationState, 'id'>) => void;
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

  const showNotification = useCallback((details: Omit<NotificationState, 'id'>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    const newId = Date.now();
    setNotification({ ...details, id: newId });

    const newTimeoutId = setTimeout(() => {
      hideNotification();
    }, 5000); // Auto-dismiss after 5 seconds

    setTimeoutId(newTimeoutId);
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
