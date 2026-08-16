"use client";

import { useEffect, useState } from "react";

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

export default function ScoreRing({
  score,
  size = 160,
  strokeWidth = 8,
  color = "var(--color-primary)",
}: ScoreRingProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 200);
    return () => clearTimeout(timer);
  }, [score]);

  // Animate the number
  const [displayScore, setDisplayScore] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = score;
    const duration = 1500;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.round(eased * end);
      setDisplayScore(start);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  return (
    <div className="score-ring-container">
      <svg
        className="score-ring-svg"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          className="score-ring-bg"
          cx={size / 2}
          cy={size / 2}
          r={radius}
        />
        <circle
          className="score-ring-progress"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="score-ring-label">
        <div
          className="score-ring-value"
          style={{
            fontSize: size > 140 ? "2.5rem" : "1.75rem",
            color,
          }}
        >
          {displayScore}
        </div>
        <div className="score-ring-text">Score</div>
      </div>
    </div>
  );
}
