"use client";

import { useState, useCallback } from "react";
import type { IntakeData } from "@/app/page";

interface DiagnosticIntakeProps {
  initialData: IntakeData;
  onComplete: (data: IntakeData) => void;
  onBack: () => void;
}

const ACCOUNT_TYPES = [
  { value: "personal", label: "Personal Brand" },
  { value: "business", label: "E-commerce & Brands" },
  { value: "creator", label: "Content Creator" },
  { value: "agency", label: "Agency & B2B" },
  { value: "local", label: "Local Business" },
  { value: "portfolio", label: "Portfolio & Creative" },
];

const GOALS = [
  { value: "followers", label: "Follower Growth" },
  { value: "engagement", label: "Engagement & Saves" },
  { value: "sales", label: "Sales & Leads" },
  { value: "brand", label: "Brand Authority" },
  { value: "awareness", label: "Reach & Discovery" },
];

const STRUGGLES = [
  { value: "bio", label: "Low Bio Conversion" },
  { value: "reach", label: "Declining Reach" },
  { value: "engagement", label: "Low Engagement" },
  { value: "positioning", label: "Unclear Positioning" },
  { value: "consistency", label: "Content Execution" },
];

const CONTENT_FORMATS = [
  { value: "Reels", label: "Reels" },
  { value: "Carousels", label: "Carousels" },
  { value: "Stories", label: "Stories" },
  { value: "Static Posts", label: "Static Posts" },
  { value: "Highlights", label: "Highlights" },
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
        <div className="container" style={{ maxWidth: "580px" }}>
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
              Auditing @{data.handle}
            </span>
          </div>

          {/* Step 1: Account Type */}
          {step === 1 && (
            <div className="animate-fade-in-up">
              <h2 className="section-title" style={{ textAlign: "center" }}>
                Account Category
              </h2>
              <p
                className="section-subtitle"
                style={{ textAlign: "center" }}
              >
                Select your primary profile structure.
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
                Target Audience & Bio
              </h2>
              <p
                className="section-subtitle"
                style={{ textAlign: "center" }}
              >
                Specify who you serve and paste current bio.
              </p>

              <div className="form-group">
                <label className="form-label" htmlFor="target-audience">
                  Target Audience
                </label>
                <input
                  id="target-audience"
                  className="form-input"
                  type="text"
                  placeholder="e.g. Founders, athletes, designer brand shoppers"
                  value={data.targetAudience}
                  onChange={(e) =>
                    updateField("targetAudience", e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="current-bio">
                  Current Bio{" "}
                  <span style={{ color: "var(--color-text-tertiary)", fontWeight: 400 }}>
                    (optional)
                  </span>
                </label>
                <textarea
                  id="current-bio"
                  className="form-input form-textarea"
                  placeholder="Paste existing bio here..."
                  value={data.currentBio}
                  onChange={(e) => updateField("currentBio", e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 3: Goal + Struggle */}
          {step === 3 && (
            <div className="animate-fade-in-up">
              <h2 className="section-title" style={{ textAlign: "center" }}>
                Primary Objective
              </h2>
              <p
                className="section-subtitle"
                style={{ textAlign: "center" }}
              >
                Select main growth focus.
              </p>
              <div
                className="chip-group"
                style={{ justifyContent: "center", marginBottom: "var(--space-6)" }}
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
                    {goal.label}
                  </button>
                ))}
              </div>

              <h3
                className="section-title"
                style={{
                  textAlign: "center",
                  fontSize: "1rem",
                  marginBottom: "var(--space-2)",
                }}
              >
                Primary Bottleneck
              </h3>
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
                Active Formats
              </h2>
              <p
                className="section-subtitle"
                style={{ textAlign: "center" }}
              >
                Select current distribution formats.
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
                    {format.label}
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
              marginTop: "var(--space-8)",
            }}
          >
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleBack}
            >
              Back
            </button>
            <button
              type="button"
              className="btn btn-primary btn-lg"
              disabled={!canProceed()}
              onClick={handleNext}
            >
              {step === totalSteps ? "Generate Audit" : "Continue"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
