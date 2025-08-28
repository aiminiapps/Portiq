'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/storage';
import { Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ClaimButton() {
  const [canClaim, setCanClaim] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [claimAnimation, setClaimAnimation] = useState(false);
  const { addGhibPoints, completeTask } = useStore();

  useEffect(() => {
    const checkClaimStatus = () => {
      const lastClaim = localStorage.getItem('lastDailyClaim');

      if (!lastClaim) {
        setCanClaim(true);
        return;
      }

      const lastClaimTime = new Date(parseInt(lastClaim));
      const now = new Date();
      const nextClaimTime = new Date(lastClaimTime);
      nextClaimTime.setHours(nextClaimTime.getHours() + 24);

      if (now >= nextClaimTime) {
        setCanClaim(true);
      } else {
        setCanClaim(false);

        const diff = nextClaimTime - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);

        const secondInterval = setInterval(() => {
          const now = new Date();
          const diff = nextClaimTime - now;

          if (diff <= 0) {
            setCanClaim(true);
            setTimeLeft('');
            clearInterval(secondInterval);
            return;
          }

          const updatedHours = Math.floor(diff / (1000 * 60 * 60));
          const updatedMinutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const updatedSeconds = Math.floor((diff % (1000 * 60)) / 1000);

          setTimeLeft(`${updatedHours}h ${updatedMinutes}m ${updatedSeconds}s`);
        }, 1000);

        return () => clearInterval(secondInterval);
      }
    };

    checkClaimStatus();
    const interval = setInterval(checkClaimStatus, 60000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const handleClaim = () => {
    if (!canClaim) return;

    setClaimAnimation(true);

    const reward = 50; // Fixed reward
    addGhibPoints(reward);
    completeTask('daily-fortune');

    localStorage.setItem('lastDailyClaim', Date.now().toString());

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    setTimeout(() => {
      setClaimAnimation(false);
      setCanClaim(false);
      setTimeLeft('23h 59m');
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-center text-lg font-semibold mb-2 text-white">Daily Fortune</h3>

      <button
        onClick={handleClaim}
        disabled={!canClaim}
        className={cn(
          "relative overflow-hidden w-full py-4 rounded-xl font-unica text-lg font-bold",
          "transition-all duration-300 transform",
          canClaim
            ? "bg-gradient-to-r from-yellow-500 via-red-500 to-purple-600 text-white shadow-lg hover:shadow-red-500/30 hover:scale-105"
            : "bg-gray-800 text-gray-400 cursor-not-allowed"
        )}
      >
        {claimAnimation && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-2xl animate-ping">✨</div>
          </div>
        )}

        <div
          className={cn(
            "flex items-center justify-center gap-2",
            claimAnimation ? "opacity-0" : "opacity-100"
          )}
        >
          {canClaim ? (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Claim Daily G8D</span>
              <Sparkles className="w-5 h-5" />
            </>
          ) : (
            <>
              <span>Next Claim: {timeLeft}</span>
            </>
          )}
        </div>
      </button>

      <p className="text-center text-xs text-red-300 mt-2">
        Claim your daily mystical fortune and G8D points
      </p>
    </div>
  );
}