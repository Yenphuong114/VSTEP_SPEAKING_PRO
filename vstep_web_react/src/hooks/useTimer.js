import { useState, useEffect, useRef, useCallback } from 'react';

export function useTimer(initialSeconds = 180, onTimeUp) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    setTimeLeft(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            if (onTimeUp) onTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning, timeLeft, onTimeUp]);

  const startTimer = useCallback((customSeconds) => {
    if (customSeconds !== undefined) setTimeLeft(customSeconds);
    setIsRunning(true);
  }, []);

  const stopTimer = useCallback(() => {
    setIsRunning(false);
    clearInterval(timerRef.current);
  }, []);

  const resetTimer = useCallback((seconds) => {
    setIsRunning(false);
    clearInterval(timerRef.current);
    setTimeLeft(seconds !== undefined ? seconds : initialSeconds);
  }, [initialSeconds]);

  const formatTime = useCallback((seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }, []);

  return {
    timeLeft,
    formattedTime: formatTime(timeLeft),
    isRunning,
    startTimer,
    stopTimer,
    resetTimer
  };
}
