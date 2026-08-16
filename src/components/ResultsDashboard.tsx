"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { IntakeData, AnalysisResult } from "@/app/page";
import ScoreRing from "./ScoreRing";
import PhoneMockup from "./PhoneMockup";

interface ResultsDashboardProps {
  data: IntakeData;
  results: AnalysisResult;
  onStartOver: () => void;
}

export default function ResultsDashboard({
  data,
  results,
  onStartOver,
}: ResultsDashboardProps) {
  const [activeBioTab, setActiveBioTab] = useState(0);
  const [toast, setToast] = useState("");
  const reportRef = useRef<HTMLDivElement>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(""), 2500);
  }, []);

  const copyBio = useCallback(() => {
    const bio = results.bioSuggestions[activeBioTab]?.text || "";
    navigator.clipboard.writeText(bio).then(() => {
      showToast("✅ Bio copied to clipboard!");
    });
  }, [activeBioTab, results.bioSuggestions, showToast]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Score color helper
  const getScoreColor = (score: number) => {
    if (score >= 75) return "var(--color-success)";
    if (score >= 50) return "var(--color-warning)";
    return "var(--color-danger)";
  };

  const getVerdictStyle = (score: number) => {
    if (score >= 75)
      return {
        background: "var(--color-success-light)",
        color: "var(--color-success)",
      };
    if (score >= 50)
      return {
        background: "var(--color-warning-light)",
        color: "var(--color-warning)",
      };
    return {
      background: "var(--color-danger-light)",
      color: "var(--color-danger)",
    };
  };

  const getCategoryStyle = (category: string) => {
    switch (category) {
      case "immediate":
        return {
          bg: "var(--color-danger-light)",
          color: "var(--color-danger)",
          numberBg: "var(--color-danger)",
        };
      case "short-term":
        return {
          bg: "var(--color-warning-light)",
          color: "var(--color-warning)",
          numberBg: "var(--color-warning)",
        };
      default:
        return {
          bg: "var(--color-primary-light)",
          color: "var(--color-primary)",
          numberBg: "var(--color-primary)",
        };
    }
  };

  // Animate pillar bars on mount
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main ref={reportRef}>
      {/* Header */}
      <section className="results-header">
        <div className="container">
          <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
            <span className="hero-badge animate-fade-in-up">
              <span className="hero-badge-dot" />
              Diagnosis Complete for @{data.handle}
            </span>
            <span
              className="hero-badge animate-fade-in-up"
              style={{
                background: "var(--color-bg-subtle)",
                color: "var(--color-text-secondary)",
                borderColor: "var(--color-border)",
              }}
            >
              ⚡ Advanced Algorithmic & AI Engine
            </span>
          </div>

          {/* Overall Score */}
          <div className="results-score-section animate-fade-in-up delay-1">
            <ScoreRing
              score={results.overallScore}
              size={180}
              strokeWidth={10}
              color={getScoreColor(results.overallScore)}
            />
            <div
              className="verdict-badge"
              style={getVerdictStyle(results.overallScore)}
            >
              {results.verdictEmoji} {results.verdict}
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        {/* Pillar Scores */}
        <section className="results-section animate-fade-in-up delay-2">
          <h2 className="section-title">Profile Health Breakdown</h2>
          <p className="section-subtitle">
            Your profile scored across 5 critical Instagram growth dimensions.
          </p>
          <div className="pillar-grid">
            {results.pillars.map((pillar, i) => (
              <div
                className="pillar-card"
                key={pillar.name}
                style={{ animationDelay: `${0.1 * i}s` }}
              >
                <div className="pillar-card-header">
                  <div
                    className="pillar-card-icon"
                    style={{
                      background:
                        pillar.score >= 70
                          ? "var(--color-success-light)"
                          : pillar.score >= 50
                            ? "var(--color-warning-light)"
                            : "var(--color-danger-light)",
                    }}
                  >
                    {pillar.icon}
                  </div>
                  <span
                    className="pillar-card-score"
                    style={{ color: getScoreColor(pillar.score) }}
                  >
                    {pillar.score}
                  </span>
                </div>
                <h3 className="pillar-card-title">{pillar.name}</h3>
                <p className="pillar-card-desc">{pillar.feedback}</p>
                <div className="pillar-card-bar">
                  <div
                    className="pillar-card-bar-fill"
                    style={{
                      width: animated ? `${pillar.score}%` : "0%",
                      background: getScoreColor(pillar.score),
                    }}
                  />
                </div>
                <p
                  style={{
                    marginTop: "var(--space-3)",
                    fontSize: "0.8125rem",
                    color: "var(--color-primary)",
                    fontWeight: 600,
                  }}
                >
                  💡 {pillar.suggestion}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Bio Prescription Lab */}
        <section className="results-section animate-fade-in-up delay-3">
          <h2 className="section-title">✍️ Bio Prescription Lab</h2>
          <p className="section-subtitle">
            3 AI-crafted bios optimized for your goals. Preview live, then copy
            with one click.
          </p>

          <div className="bio-lab-layout">
            <div className="bio-lab-content">
              <div className="bio-tabs">
                {results.bioSuggestions.map((bio, i) => (
                  <button
                    key={bio.label}
                    type="button"
                    className={`bio-tab${activeBioTab === i ? " active" : ""}`}
                    onClick={() => setActiveBioTab(i)}
                  >
                    {bio.label}
                  </button>
                ))}
              </div>

              <div className="bio-text-display">
                {results.bioSuggestions[activeBioTab]?.text}
              </div>

              <div className="bio-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={copyBio}
                >
                  📋 Copy Bio
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handlePrint}
                >
                  🖨️ Print Prescription
                </button>
              </div>
            </div>

            <PhoneMockup
              handle={data.handle}
              name={data.metaMetrics?.name || data.handle}
              bio={results.bioSuggestions[activeBioTab]?.text || ""}
              followers={data.metaMetrics?.followers}
              following={data.metaMetrics?.following}
              posts={data.metaMetrics?.posts}
            />
          </div>
        </section>

        {/* Action Plan */}
        <section className="results-section animate-fade-in-up delay-4">
          <h2 className="section-title">📋 Prioritized Action Plan</h2>
          <p className="section-subtitle">
            Follow these steps in order for maximum profile impact.
          </p>

          {results.actionPlan.map((action) => {
            const style = getCategoryStyle(action.category);
            return (
              <div className="action-item" key={action.priority}>
                <div
                  className="action-item-number"
                  style={{
                    background: style.numberBg,
                    color: "white",
                  }}
                >
                  {action.priority}
                </div>
                <div className="action-item-content">
                  <h4 className="action-item-title">{action.title}</h4>
                  <p className="action-item-desc">{action.description}</p>
                  <span
                    className="action-item-tag"
                    style={{
                      background: style.bg,
                      color: style.color,
                    }}
                  >
                    ⏱ {action.timeframe}
                  </span>
                </div>
              </div>
            );
          })}
        </section>

        {/* Start Over */}
        <div
          style={{
            textAlign: "center",
            padding: "var(--space-12) 0",
          }}
        >
          <button
            type="button"
            className="btn btn-outline btn-lg"
            onClick={onStartOver}
          >
            🔄 Diagnose Another Profile
          </button>
        </div>
      </div>

      {/* Toast */}
      <div className={`toast${toast ? " visible" : ""}`}>{toast}</div>
    </main>
  );
}
