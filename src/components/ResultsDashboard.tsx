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
      showToast("Bio copied to clipboard");
    });
  }, [activeBioTab, results.bioSuggestions, showToast]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

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

  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const getPillarSvg = (index: number) => {
    switch (index) {
      case 0: // SEO
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        );
      case 1: // Bio
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        );
      case 2: // CTA
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        );
      case 3: // Positioning
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
          </svg>
        );
      default: // Content
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        );
    }
  };

  return (
    <main ref={reportRef}>
      {/* Header */}
      <section className="results-header">
        <div className="container">
          <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
            <span className="hero-badge animate-fade-in-up">
              <span className="hero-badge-dot" />
              Audit for @{data.handle}
            </span>
          </div>

          {/* Overall Score */}
          <div className="results-score-section animate-fade-in-up delay-1">
            <ScoreRing
              score={results.overallScore}
              size={170}
              strokeWidth={9}
              color={getScoreColor(results.overallScore)}
            />
            <div
              className="verdict-badge"
              style={getVerdictStyle(results.overallScore)}
            >
              {results.verdict.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu, "").trim()}
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        {/* Pillar Scores */}
        <section className="results-section animate-fade-in-up delay-2">
          <h2 className="section-title">Performance Pillars</h2>
          <p className="section-subtitle">
            Core conversion and discoverability benchmarks.
          </p>
          <div className="pillar-grid">
            {results.pillars.map((pillar, i) => (
              <div
                className="pillar-card"
                key={pillar.name}
                style={{ animationDelay: `${0.08 * i}s` }}
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
                      color: getScoreColor(pillar.score),
                    }}
                  >
                    {getPillarSvg(i)}
                  </div>
                  <span
                    className="pillar-card-score"
                    style={{ color: getScoreColor(pillar.score) }}
                  >
                    {pillar.score}
                  </span>
                </div>
                <h3 className="pillar-card-title">{pillar.name}</h3>
                <p className="pillar-card-desc">
                  {pillar.feedback.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu, "").trim()}
                </p>
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
                  {pillar.suggestion.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu, "").trim()}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Bio Prescription Lab */}
        <section className="results-section animate-fade-in-up delay-3">
          <h2 className="section-title">Bio Prescriptions</h2>
          <p className="section-subtitle">
            3 structured copy options ready to deploy.
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
                    {bio.label.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu, "").trim()}
                  </button>
                ))}
              </div>

              <div className="bio-text-display">
                {results.bioSuggestions[activeBioTab]?.text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu, "").trim()}
              </div>

              <div className="bio-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={copyBio}
                >
                  Copy Bio
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handlePrint}
                >
                  Print Report
                </button>
              </div>
            </div>

            <PhoneMockup
              handle={data.handle}
              name={data.metaMetrics?.name || data.handle}
              bio={results.bioSuggestions[activeBioTab]?.text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu, "").trim() || ""}
              avatarUrl={data.metaMetrics?.avatarUrl}
              followers={data.metaMetrics?.followers}
              following={data.metaMetrics?.following}
              posts={data.metaMetrics?.posts}
            />
          </div>
        </section>

        {/* Action Plan */}
        <section className="results-section animate-fade-in-up delay-4">
          <h2 className="section-title">Priority Action Items</h2>
          <p className="section-subtitle">
            Recommended step-by-step profile adjustments.
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
                  <h4 className="action-item-title">
                    {action.title.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu, "").trim()}
                  </h4>
                  <p className="action-item-desc">
                    {action.description.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu, "").trim()}
                  </p>
                  <span
                    className="action-item-tag"
                    style={{
                      background: style.bg,
                      color: style.color,
                    }}
                  >
                    {action.timeframe.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu, "").trim()}
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
            padding: "var(--space-8) 0 var(--space-12)",
          }}
        >
          <button
            type="button"
            className="btn btn-outline"
            onClick={onStartOver}
          >
            Audit Another Profile
          </button>
        </div>
      </div>

      {/* Toast */}
      <div className={`toast${toast ? " visible" : ""}`}>{toast}</div>
    </main>
  );
}
