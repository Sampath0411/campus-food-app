import { useEffect, useState } from "react";
import { Pizza, Salad, IceCream, Croissant, Sandwich } from "lucide-react";

interface PreloaderProps {
  onLoad?: () => void;
}

const loadingMessages = [
  "Finding the best flavors...",
  "Preparing your experience...",
  "Loading delicious options...",
  "Almost ready...",
];

export function Preloader({ onLoad }: PreloaderProps) {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 100);

    const messageInterval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % loadingMessages.length);
    }, 750);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, []);

  // Handle completion when progress reaches 100
  useEffect(() => {
    if (progress >= 100) {
      setTimeout(() => {
        setVisible(false);
        onLoad?.();
      }, 300);
    }
  }, [progress, onLoad]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-background to-surface overflow-hidden">
      {/* Animated logo with glow */}
      <div className="relative animate-pulse-soft">
        {/* Outer glow */}
        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150" />

        {/* Logo container */}
        <div className="relative w-32 h-32 md:w-40 md:h-40 flex items-center justify-center transform rotate-12">
          <img
            src="/quickbite-logo.png"
            alt="QuickBite Logo"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Brand name */}
      <h1 className="mt-6 font-display text-4xl md:text-5xl font-extrabold tracking-tighter">
        <span className="text-foreground">Quick</span>
        <span className="text-primary">Bite</span>
      </h1>
      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground opacity-60">
        Fast. Fresh. Affordable.
      </p>

      {/* Decorative food icons - Lucide icons instead of emojis */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
        <div className="absolute top-20 left-[10%] text-primary">
          <Pizza className="w-12 h-12" />
        </div>
        <div className="absolute bottom-40 right-[15%] text-accent">
          <Salad className="w-14 h-14" />
        </div>
        <div className="absolute top-1/4 right-[20%] text-primary">
          <IceCream className="w-10 h-10" />
        </div>
        <div className="absolute bottom-1/4 left-[20%] text-amber-500">
          <Croissant className="w-12 h-12" />
        </div>
        <div className="absolute top-1/2 right-[10%] text-orange-500">
          <Sandwich className="w-10 h-10" />
        </div>
      </div>

      {/* Loading progress bar */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-48 md:w-64 space-y-3">
        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full shadow-[0_0_12px_rgba(255,107,0,0.4)] animate-progress"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <p className="text-center font-semibold text-sm text-muted-foreground animate-pulse">
          {loadingMessages[messageIndex]}
        </p>
      </div>
    </div>
  );
}
