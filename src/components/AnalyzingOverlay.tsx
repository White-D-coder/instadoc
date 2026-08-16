"use client";

import { useState, useEffect } from "react";

interface AnalyzingOverlayProps {
  handle: string;
}

const ANALYSIS_STEPS = [
  "Auditing handle and search indexing tokens...",
  "Evaluating bio value hook and structure...",
  "Analyzing CTA friction and conversion path...",
  "Synthesizing 3 tailored bio architectures...",
  "Calibrating priority growth action plan...",
];

export default function AnalyzingOverlay({ handle }: AnalyzingOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < ANALYSIS_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1100);

    return () => clearInterval(interval);
  }, []);

  return (
    <main>
      <section className="section" style={{ minHeight: "75vh", display: "flex", alignItems: "center" }}>
        <div className="container" style={{ maxWidth: "480px", textAlign: "center" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              border: "3px solid var(--color-border)",
              borderTopColor: "var(--color-primary)",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto var(--space-6)",
            }}
          />

          <h2 className="section-title" style={{ fontSize: "1.25rem" }}>
            Auditing @{handle}
          </h2>

          <div
            style={{
              marginTop: "var(--space-6)",
              textAlign: "left",
              background: "white",
              padding: "var(--space-6)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--color-border)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            {ANALYSIS_STEPS.map((stepText, idx) => {
              const isDone = idx < currentStep;
              const isCurrent = idx === currentStep;

              return (
                <div
                  key={stepText}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-3)",
                    padding: "var(--space-2) 0",
                    opacity: isDone || isCurrent ? 1 : 0.35,
                    transition: "all var(--transition-normal)",
                  }}
                >
                  <div
                    style={{
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.6875rem",
                      fontWeight: 700,
                      background: isDone
                        ? "var(--color-success)"
                        : isCurrent
                          ? "var(--color-primary)"
                          : "var(--color-border)",
                      color: "white",
                      flexShrink: 0,
                    }}
                  >
                    {isDone ? "✓" : idx + 1}
                  </div>
                  <span
                    style={{
                      fontSize: "0.8125rem",
                      color: isDone || isCurrent ? "var(--color-text-primary)" : "var(--color-text-tertiary)",
                      fontWeight: isCurrent ? 600 : 400,
                    }}
                  >
                    {stepText}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
