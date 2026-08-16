"use client";

import { useEffect, useState } from "react";

interface AnalyzingOverlayProps {
  handle: string;
}

const STEPS = [
  "Analyzing handle & name field SEO…",
  "Evaluating bio value proposition…",
  "Scanning CTA & conversion funnel…",
  "Assessing positioning & differentiation…",
  "Reviewing content strategy & formats…",
  "Generating personalized prescriptions…",
];

export default function AnalyzingOverlay({ handle }: AnalyzingOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="analyzing-overlay">
      <div className="analyzing-spinner" />
      <p className="analyzing-text">Diagnosing @{handle}</p>
      <p className="analyzing-sub" style={{ marginBottom: "var(--space-6)" }}>
        {STEPS[currentStep]}
      </p>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-2)",
          alignItems: "flex-start",
          minWidth: "280px",
        }}
      >
        {STEPS.map((step, i) => (
          <div
            key={step}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-3)",
              fontSize: "0.8125rem",
              fontWeight: 500,
              color:
                i < currentStep
                  ? "var(--color-success)"
                  : i === currentStep
                    ? "var(--color-primary)"
                    : "var(--color-text-tertiary)",
              transition: "color 0.3s ease",
            }}
          >
            <span
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.6875rem",
                background:
                  i < currentStep
                    ? "var(--color-success-light)"
                    : i === currentStep
                      ? "var(--color-primary-light)"
                      : "var(--color-bg-subtle)",
                flexShrink: 0,
              }}
            >
              {i < currentStep ? "✓" : i === currentStep ? "●" : "○"}
            </span>
            {step}
          </div>
        ))}
      </div>
    </div>
  );
}
