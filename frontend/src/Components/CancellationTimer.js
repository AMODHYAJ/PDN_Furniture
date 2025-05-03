import React, { useState, useEffect } from 'react';
import './CancellationTimer.css';

const CancellationTimer = ({ processingStartedAt }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!processingStartedAt) return;

    const deadline = new Date(new Date(processingStartedAt).getTime() + 24 * 60 * 60 * 1000);

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = deadline - now;

      if (diff <= 0) {
        setTimeLeft('Cancellation window expired');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer();
    const timerId = setInterval(updateTimer, 1000);

    return () => clearInterval(timerId);
  }, [processingStartedAt]);

  if (!timeLeft) return null;

  return (
    <div className="cancellation-timer">
      <p>Time remaining to cancel: <strong>{timeLeft}</strong></p>
    </div>
  );
};

export default CancellationTimer;