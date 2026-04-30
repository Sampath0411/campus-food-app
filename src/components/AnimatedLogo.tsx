import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AnimatedLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function AnimatedLogo({ size = "md", className }: AnimatedLogoProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-9 w-9",
    lg: "h-16 w-16",
  };

  return (
    <div
      className={cn(
        "relative grid place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-pop",
        sizeClasses[size],
        className
      )}
    >
      {/* Animated sparkles */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={cn("h-4 w-4", mounted ? "animate-logo-sparkle" : "")}
        strokeWidth={2.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
        />
      </svg>
      {/* Pulse ring */}
      <div className={cn("absolute inset-0 rounded-xl bg-gradient-primary opacity-30", mounted ? "animate-logo-pulse" : "")} />
    </div>
  );
}
