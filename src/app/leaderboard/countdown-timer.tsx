
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CountdownTimerProps {
  endDate: Date;
}

export function CountdownTimer({ endDate }: CountdownTimerProps) {
  const calculateTimeLeft = () => {
    const difference = +endDate - +new Date();
    let timeLeft = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  const timerComponents = Object.entries(timeLeft).map(([interval, value]) => {
    if (value < 0) return null;
    return (
      <div key={interval} className="flex flex-col items-center">
        <span className="text-4xl font-bold text-primary">{String(value).padStart(2, '0')}</span>
        <span className="text-xs uppercase text-muted-foreground">{interval}</span>
      </div>
    );
  });

  return (
    <Card className="mb-8 border-primary/20 bg-primary/5">
        <CardHeader className="p-4 text-center">
            <CardTitle className="text-lg font-medium text-primary">Fin de la saison</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
            <div className="flex justify-center gap-4 md:gap-8">
                {timerComponents.length ? timerComponents : <span>La saison est terminée !</span>}
            </div>
        </CardContent>
    </Card>
  );
}
