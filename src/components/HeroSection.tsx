"use client";

import { useState } from "react";

interface HeroSectionProps {
  onStart: (handle: string) => void;
}

export default function HeroSection({ onStart }: HeroSectionProps) {
  const [handle, setHandle] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (handle.trim()) {
      onStart(handle.trim().replace(/^@/, ""));
    }
  };

  return (
    <main>
      <section className="hero">
        <div className="container">
          <div className="animate-fade-in-up">
            <span className="hero-badge">
              <span className="hero-badge-dot" />
              Instagram Profile Audit
            </span>
          </div>

          <h1 className="animate-fade-in-up delay-1">
            Instagram Profile
            <br />
            <span className="gradient-text">Diagnosis</span>
          </h1>

          <p className="hero-subtitle animate-fade-in-up delay-2">
            Instant algorithmic audit, bio optimization, and growth fixes for any profile.
          </p>

          <form
            onSubmit={handleSubmit}
            className="handle-input-group animate-fade-in-up delay-3"
          >
            <div className="handle-input-wrapper">
              <span className="handle-input-prefix">@</span>
              <input
                id="handle-input"
                type="text"
                placeholder="username"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck="false"
              />
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={!handle.trim()}
              >
                Audit Profile
              </button>
            </div>
          </form>

          <div
            className="feature-grid animate-fade-in-up delay-4"
            id="features"
          >
            <div className="feature-card">
              <div
                className="feature-icon"
                style={{
                  background: "var(--color-primary-light)",
                  color: "var(--color-primary)",
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <h3 className="feature-title">Health Score</h3>
              <p className="feature-desc">
                0–100 benchmark across SEO, hook clarity, CTA, and positioning.
              </p>
            </div>

            <div className="feature-card">
              <div
                className="feature-icon"
                style={{
                  background: "var(--color-accent-light)",
                  color: "var(--color-accent)",
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </div>
              <h3 className="feature-title">Bio Rewrites</h3>
              <p className="feature-desc">
                3 copy variants: Conversion, Authority, and Minimalist.
              </p>
            </div>

            <div className="feature-card">
              <div
                className="feature-icon"
                style={{
                  background: "var(--color-success-light)",
                  color: "var(--color-success)",
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 11 12 14 22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
              </div>
              <h3 className="feature-title">Action Plan</h3>
              <p className="feature-desc">
                Ranked fixes prioritized by growth impact.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
