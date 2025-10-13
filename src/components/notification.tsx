'use client';

import React, { useEffect, useState } from 'react';
import { useNotification } from '@/contexts/notification-context';
import { cn } from '@/lib/utils';
import { XCircle, Info, CheckCircle } from 'lucide-react';

const icons = {
  error: <XCircle className="h-6 w-6 text-red-400" />,
  info: <Info className="h-6 w-6 text-blue-400" />,
  success: <CheckCircle className="h-6 w-6 text-green-400" />,
};

const gradients = {
  error: {
    from: 'rgba(255, 100, 100, 0.1)',
    to: 'rgba(255, 100, 100, 0.02)',
  },
  info: {
    from: 'rgba(100, 150, 255, 0.1)',
    to: 'rgba(100, 150, 255, 0.02)',
  },
  success: {
    from: 'rgba(100, 255, 150, 0.1)',
    to: 'rgba(100, 255, 150, 0.02)',
  },
};

export function Notification() {
  const { notification, hideNotification } = useNotification();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [notification]);

  if (!notification) return null;
  
  const gradientId = `grad-${notification.type}`;
  const currentGradient = gradients[notification.type];

  return (
    <div className="notification-container">
      <div
        className={cn('notification-card', isVisible && 'visible')}
        onClick={hideNotification}
      >
        <svg className="notification-svg">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: currentGradient.from }}></stop>
              <stop offset="100%" style={{ stopColor: currentGradient.to }}></stop>
            </linearGradient>
          </defs>
          <path
            d="M 0,40 C 0,0 0,0 40,0 L 340,0 C 380,0 380,0 380,40 C 380,80 380,80 340,80 L 40,80 C 0,80 0,80 0,40 Z"
            fill={`url(#${gradientId})`}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1"
            className="notification-path"
          ></path>
        </svg>
        <div className="notification-content">
          <div className="notification-icon">
             {icons[notification.type]}
          </div>
          <div className="notification-body">
            <div className="notification-header">
              <div className="notification-title">{notification.title}</div>
            </div>
            <div className="notification-message">
              {notification.message}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
