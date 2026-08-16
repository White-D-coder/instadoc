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
              Free Instagram Profile Doctor
            </span>
          </div>

          <h1 className="animate-fade-in-up delay-1">
            Your Instagram Page
            <br />
            <span className="gradient-text">Deserves a Doctor</span>
          </h1>

          <p className="hero-subtitle animate-fade-in-up delay-2">
            Enter any Instagram handle to get an instant profile health score,
            deep SEO & bio diagnosis, 3 custom bio rewrites, and an actionable growth prescription.
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
                placeholder="enter_any_username"
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
                Diagnose Page
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
                🩺
              </div>
              <h3 className="feature-title">Profile Health Score</h3>
              <p className="feature-desc">
                0–100 scored audit across SEO, bio hook, CTA friction, positioning, and content engine.
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
                ✍️
              </div>
              <h3 className="feature-title">3 Bio Prescriptions</h3>
              <p className="feature-desc">
                Ready-to-paste bio rewrites optimized for High-Conversion, Authority & Social Proof, or Minimalist style.
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
                📋
              </div>
              <h3 className="feature-title">Actionable Prescription</h3>
              <p className="feature-desc">
                Ranked checklist of high-priority fixes to implement immediately for higher follow and conversion rates.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
