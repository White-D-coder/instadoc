"use client";

import { useState, useCallback } from "react";
import type { IntakeData } from "@/app/page";

interface DiagnosticIntakeProps {
  initialData: IntakeData;
  onComplete: (data: IntakeData) => void;
  onBack: () => void;
}

const ACCOUNT_TYPES = [
  { value: "personal", label: "Personal Brand", emoji: "👤" },
  { value: "business", label: "E-commerce / Business", emoji: "🏢" },
  { value: "creator", label: "Content Creator", emoji: "🎬" },
  { value: "agency", label: "Agency / B2B", emoji: "💼" },
  { value: "local", label: "Local Business", emoji: "📍" },
  { value: "portfolio", label: "Portfolio / Artist", emoji: "🎨" },
];

const GOALS = [
  { value: "followers", label: "Grow Followers", emoji: "📈" },
  { value: "engagement", label: "Boost Engagement", emoji: "💬" },
  { value: "sales", label: "Drive Sales / Leads", emoji: "💰" },
  { value: "brand", label: "Build Brand Authority", emoji: "🏆" },
  { value: "awareness", label: "Increase Awareness", emoji: "🌍" },
];

const STRUGGLES = [
  { value: "bio", label: "Bio doesn't convert", emoji: "📝" },
  { value: "reach", label: "Low reach / visibility", emoji: "👀" },
  { value: "engagement", label: "No engagement", emoji: "😶" },
  { value: "positioning", label: "Unclear positioning", emoji: "🎯" },
  { value: "consistency", label: "Inconsistent posting", emoji: "📅" },
  { value: "growth", label: "Growth plateaued", emoji: "📊" },
];

const CONTENT_FORMATS = [
  { value: "Reels", emoji: "🎥" },
  { value: "Carousels", emoji: "📱" },
  { value: "Stories", emoji: "⏳" },
  { value: "Static Posts", emoji: "🖼️" },
  { value: "Lives", emoji: "🔴" },
  { value: "Highlights", emoji: "⭐" },
];

export default function DiagnosticIntake({
  initialData,
  onComplete,
  onBack,
}: DiagnosticIntakeProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<IntakeData>(initialData);

  const totalSteps = 4;

  const updateField = useCallback(
    <K extends keyof IntakeData>(field: K, value: IntakeData[K]) => {
      setData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const toggleContentFormat = useCallback((format: string) => {
    setData((prev) => ({
      ...prev,
      contentFormats: prev.contentFormats.includes(format)
        ? prev.contentFormats.filter((f) => f !== format)
        : [...prev.contentFormats, format],
    }));
  }, []);

  const canProceed = () => {
    switch (step) {
      case 1:
        return data.accountType !== "";
      case 2:
        return data.targetAudience.trim().length > 0;
      case 3:
        return data.primaryGoal !== "";
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onComplete(data);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onBack();
    }
  };

  return (
    <main>
      <section className="section" style={{ paddingTop: "var(--space-12)" }}>
        <div className="container" style={{ maxWidth: "640px" }}>
          {/* Stepper */}
          <div className="stepper">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div className="stepper-step" key={i}>
                {i > 0 && (
                  <div
                    className={`stepper-line${i < step ? " completed" : ""}`}
                  />
                )}
                <div
                  className={`stepper-dot${
                    i + 1 === step
                      ? " active"
                      : i + 1 < step
                        ? " completed"
                        : ""
                  }`}
                >
                  {i + 1 < step ? "✓" : i + 1}
                </div>
              </div>
            ))}
          </div>

          {/* Diagnosing handle */}
          <div
            style={{
              textAlign: "center",
              marginBottom: "var(--space-2)",
            }}
          >
            <span
              className="hero-badge"
              style={{ fontSize: "0.75rem" }}
            >
              Diagnosing @{data.handle}
            </span>
          </div>

          {/* Step 1: Account Type */}
          {step === 1 && (
            <div className="animate-fade-in-up">
              <h2 className="section-title" style={{ textAlign: "center" }}>
                What type of account is this?
              </h2>
              <p
                className="section-subtitle"
                style={{ textAlign: "center" }}
              >
                This helps us tailor the audit to your specific needs.
              </p>
              <div className="chip-group" style={{ justifyContent: "center" }}>
                {ACCOUNT_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    className={`chip${
                      data.accountType === type.value ? " active" : ""
                    }`}
                    onClick={() => updateField("accountType", type.value)}
                  >
                    <span className="chip-emoji">{type.emoji}</span>
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Target Audience + Bio */}
          {step === 2 && (
            <div className="animate-fade-in-up">
              <h2 className="section-title" style={{ textAlign: "center" }}>
                Who are you trying to reach?
              </h2>
              <p
                className="section-subtitle"
                style={{ textAlign: "center" }}
              >
                Describe your ideal audience in a few words.
              </p>

              <div className="form-group">
                <label className="form-label" htmlFor="target-audience">
                  Target Audience
                </label>
                <input
                  id="target-audience"
                  className="form-input"
                  type="text"
                  placeholder="e.g. Women 25-35 interested in fitness, SaaS founders, Gen-Z fashion lovers"
                  value={data.targetAudience}
                  onChange={(e) =>
                    updateField("targetAudience", e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="current-bio">
                  Your Current Bio{" "}
                  <span style={{ color: "var(--color-text-tertiary)", fontWeight: 400 }}>
                    (paste it here, or leave blank)
                  </span>
                </label>
                <textarea
                  id="current-bio"
                  className="form-input form-textarea"
                  placeholder="Paste your current Instagram bio here..."
                  value={data.currentBio}
                  onChange={(e) => updateField("currentBio", e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}

          {/* Step 3: Goal + Struggle */}
          {step === 3 && (
            <div className="animate-fade-in-up">
              <h2 className="section-title" style={{ textAlign: "center" }}>
                What&apos;s your primary goal?
              </h2>
              <p
                className="section-subtitle"
                style={{ textAlign: "center" }}
              >
                Pick the one goal that matters most right now.
              </p>
              <div
                className="chip-group"
                style={{ justifyContent: "center", marginBottom: "var(--space-8)" }}
              >
                {GOALS.map((goal) => (
                  <button
                    key={goal.value}
                    type="button"
                    className={`chip${
                      data.primaryGoal === goal.value ? " active" : ""
                    }`}
                    onClick={() => updateField("primaryGoal", goal.value)}
                  >
                    <span className="chip-emoji">{goal.emoji}</span>
                    {goal.label}
                  </button>
                ))}
              </div>

              <h3
                className="section-title"
                style={{
                  textAlign: "center",
                  fontSize: "1.125rem",
                  marginBottom: "var(--space-2)",
                }}
              >
                What&apos;s your biggest struggle?
              </h3>
              <p
                className="section-subtitle"
                style={{ textAlign: "center" }}
              >
                Optional — helps us prioritize recommendations.
              </p>
              <div className="chip-group" style={{ justifyContent: "center" }}>
                {STRUGGLES.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    className={`chip${
                      data.currentStruggle === item.value ? " active" : ""
                    }`}
                    onClick={() => updateField("currentStruggle", item.value)}
                  >
                    <span className="chip-emoji">{item.emoji}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Content Formats */}
          {step === 4 && (
            <div className="animate-fade-in-up">
              <h2 className="section-title" style={{ textAlign: "center" }}>
                What content formats do you use?
              </h2>
              <p
                className="section-subtitle"
                style={{ textAlign: "center" }}
              >
                Select all that apply — this impacts your content strategy score.
              </p>
              <div className="chip-group" style={{ justifyContent: "center" }}>
                {CONTENT_FORMATS.map((format) => (
                  <button
                    key={format.value}
                    type="button"
                    className={`chip${
                      data.contentFormats.includes(format.value) ? " active" : ""
                    }`}
                    onClick={() => toggleContentFormat(format.value)}
                  >
                    <span className="chip-emoji">{format.emoji}</span>
                    {format.value}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "var(--space-10)",
            }}
          >
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleBack}
            >
              ← Back
            </button>
            <button
              type="button"
              className="btn btn-primary btn-lg"
              disabled={!canProceed()}
              onClick={handleNext}
            >
              {step === totalSteps
                ? "🩺 Start Comprehensive Diagnosis"
                : "Continue →"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
