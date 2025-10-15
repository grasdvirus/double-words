
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from '@/hooks/use-translations';

interface CountdownTimerProps {
  endDate: Date;
}

export function CountdownTimer({ endDate }: CountdownTimerProps) {
  const t = useTranslations();

  // Helper function to calculate time left
  const calculateTimeLeft = () => {
    const difference = +endDate - +new Date();
    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  };

  // Initialize state to null to avoid server/client mismatch
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number; } | null>(null);

  useEffect(() => {
    // Set initial time left on client mount
    setTimeLeft(calculateTimeLeft());
    
    // Set up the interval to update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // Clean up the interval on component unmount
    return () => clearInterval(timer);
  }, [endDate]);

  const timerComponents = timeLeft ? [
    { interval: 'jours', value: timeLeft.days },
    { interval: 'heures', value: timeLeft.hours },
    { interval: 'minutes', value: timeLeft.minutes },
    { interval: 'secondes', value: timeLeft.seconds },
  ] : [];

  return (
    <Card className="mb-8 border-primary/20 bg-primary/5">
        <CardHeader className="p-4 text-center">
            <CardTitle className="text-lg font-medium text-primary">Fin de la saison</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
            <div className="flex justify-center gap-4 md:gap-8 min-h-[60px] items-center">
                {timeLeft === null ? (
                    <div className="text-muted-foreground">{t('loading')}</div>
                ) : timerComponents.length > 0 ? (
                    timerComponents.map(({ interval, value }) => (
                        <div key={interval} className="flex flex-col items-center">
                            <span className="text-4xl font-bold text-primary">{String(value).padStart(2, '0')}</span>
                            <span className="text-xs uppercase text-muted-foreground">{interval}</span>
                        </div>
                    ))
                ) : (
                    <span>La saison est terminée !</span>
                )}
            </div>
        </CardContent>
    </Card>
  );
}
