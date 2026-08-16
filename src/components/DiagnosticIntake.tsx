"use client";

import { useState, useCallback, useEffect } from "react";
import type { IntakeData } from "@/app/page";

interface DiagnosticIntakeProps {
  initialData: IntakeData;
  onComplete: (data: IntakeData) => void;
  onBack: () => void;
}

const ACCOUNT_TYPES = [
  { value: "coach", label: "Coach / Consultant" },
  { value: "service_provider", label: "Service provider / Freelancer" },
  { value: "course_creator", label: "Course creator / Educator" },
  { value: "creator_no_offer", label: "Creator / publisher (no offer yet)" },
  { value: "local_business", label: "Local / physical business" },
  { value: "ecommerce", label: "E-commerce / product brand" },
  { value: "adult_creator", label: "OnlyFans / Adult creator" },
  { value: "artist_entertainment", label: "Artist / Musician / Entertainment" },
  { value: "agency_b2b", label: "Agency / B2B" },
  { value: "tech_saas", label: "Tech / SaaS" },
  { value: "other", label: "Other" },
];

const BUSINESS_STAGES = [
  { value: "no_revenue", label: "Not making money from my audience yet" },
  { value: "inconsistent", label: "First sales, but nothing consistent" },
  { value: "scaling", label: "Steady clients — I want to scale" },
  { value: "established", label: "Established 6-7 figure business" },
];

const GOALS = [
  { value: "followers", label: "Follower Growth" },
  { value: "leads", label: "Inbound Leads & DMs" },
  { value: "sales", label: "Product / Service Sales" },
  { value: "brand_authority", label: "Brand Authority & PR" },
  { value: "engagement", label: "High Engagement & Saves" },
  { value: "monetization", label: "Audience Monetization" },
];

const STRUGGLES = [
  { value: "bio_conversion", label: "Low Bio Conversion / High Bounce" },
  { value: "declining_reach", label: "Declining Reach / Algorithm Drop" },
  { value: "not_buying", label: "Followers Not Buying / Inactive Leads" },
  { value: "positioning", label: "Unclear Positioning / Niche Fog" },
  { value: "low_engagement", label: "Low Likes, Comments & Saves" },
  { value: "consistency", label: "Inconsistent Content Creation" },
];

const CONTENT_FORMATS = [
  { value: "Reels", label: "Reels" },
  { value: "Carousels", label: "Carousels" },
  { value: "Stories", label: "Stories" },
  { value: "Static Posts", label: "Static Posts" },
  { value: "Highlights", label: "Highlights" },
  { value: "Broadcast Channel", label: "Broadcast Channel" },
];

export default function DiagnosticIntake({
  initialData,
  onComplete,
  onBack,
}: DiagnosticIntakeProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<IntakeData>(initialData);

  useEffect(() => {
    setData((prev) => ({
      ...prev,
      metaMetrics: initialData.metaMetrics || prev.metaMetrics,
      currentBio: prev.currentBio || initialData.currentBio || initialData.metaMetrics?.biography || "",
    }));
  }, [initialData]);

  const totalSteps = 5;

  const toggleArrayItem = useCallback((field: "accountTypes" | "primaryGoals" | "currentStruggles" | "contentFormats", item: string) => {
    setData((prev) => {
      const currentList = prev[field] || [];
      const updated = currentList.includes(item)
        ? currentList.filter((x) => x !== item)
        : [...currentList, item];
      return { ...prev, [field]: updated };
    });
  }, []);

  const updateField = useCallback(
    <K extends keyof IntakeData>(field: K, value: IntakeData[K]) => {
      setData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const canProceed = () => {
    switch (step) {
      case 1:
        return (data.accountTypes && data.accountTypes.length > 0);
      case 2:
        return !!data.businessStage;
      case 3:
        return data.targetAudience.trim().length > 0;
      case 4:
        return (
          (data.primaryGoals && data.primaryGoals.length > 0) &&
          (data.currentStruggles && data.currentStruggles.length > 0)
        );
      case 5:
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

  const formatFollowers = (num?: number) => {
    if (!num) return "";
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    return num.toString();
  };

  return (
    <main>
      <section className="section" style={{ paddingTop: "var(--space-10)" }}>
        <div className="container" style={{ maxWidth: "620px" }}>
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

          {/* Profile Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "var(--space-2)",
              marginBottom: "var(--space-4)",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "var(--space-2)",
                padding: "4px 12px",
                background: "var(--color-bg-subtle)",
                borderRadius: "var(--radius-full)",
                border: "1px solid var(--color-border)",
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: "var(--color-text-primary)",
              }}
            >
              {data.metaMetrics?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={data.metaMetrics.avatarUrl}
                  alt={data.handle}
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <span
                  style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    background: "var(--color-primary)",
                    color: "white",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.6875rem",
                  }}
                >
                  {data.handle.charAt(0).toUpperCase()}
                </span>
              )}
              <span>@{data.handle}</span>
              {data.metaMetrics?.followers ? (
                <span style={{ color: "var(--color-text-tertiary)", fontWeight: 400 }}>
                  ({formatFollowers(data.metaMetrics.followers)} followers)
                </span>
              ) : null}
            </div>
          </div>

          {/* Step 1: What are you? (Multi-select) */}
          {step === 1 && (
            <div className="animate-fade-in-up">
              <h2 className="section-title" style={{ textAlign: "center" }}>
                What are you?
              </h2>
              <p
                className="section-subtitle"
                style={{ textAlign: "center", marginBottom: "var(--space-6)" }}
              >
                Select all categories that apply to your profile.
              </p>
              <div className="chip-group" style={{ justifyContent: "center" }}>
                {ACCOUNT_TYPES.map((type) => {
                  const isSelected = data.accountTypes?.includes(type.value);
                  return (
                    <button
                      key={type.value}
                      type="button"
                      className={`chip${isSelected ? " active" : ""}`}
                      onClick={() => toggleArrayItem("accountTypes", type.value)}
                    >
                      {type.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Where's the business right now? */}
          {step === 2 && (
            <div className="animate-fade-in-up">
              <h2 className="section-title" style={{ textAlign: "center" }}>
                Where is the business right now?
              </h2>
              <p
                className="section-subtitle"
                style={{ textAlign: "center", marginBottom: "var(--space-6)" }}
              >
                Select your current revenue & monetization stage.
              </p>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-3)",
                }}
              >
                {BUSINESS_STAGES.map((stage) => {
                  const isSelected = data.businessStage === stage.value;
                  return (
                    <button
                      key={stage.value}
                      type="button"
                      style={{
                        padding: "var(--space-4) var(--space-5)",
                        textAlign: "left",
                        background: isSelected ? "var(--color-primary-light)" : "white",
                        border: `1.5px solid ${
                          isSelected ? "var(--color-primary)" : "var(--color-border)"
                        }`,
                        borderRadius: "var(--radius-md)",
                        fontSize: "0.9375rem",
                        fontWeight: isSelected ? 600 : 500,
                        color: isSelected
                          ? "var(--color-primary)"
                          : "var(--color-text-primary)",
                        cursor: "pointer",
                        transition: "all var(--transition-fast)",
                      }}
                      onClick={() => updateField("businessStage", stage.value)}
                    >
                      {stage.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Target Audience + Bio */}
          {step === 3 && (
            <div className="animate-fade-in-up">
              <h2 className="section-title" style={{ textAlign: "center" }}>
                Target Audience & Bio
              </h2>
              <p
                className="section-subtitle"
                style={{ textAlign: "center" }}
              >
                Who do you serve and what is your current copy?
              </p>

              <div className="form-group">
                <label className="form-label" htmlFor="target-audience">
                  Target Audience / Niche Ideal Customer
                </label>
                <input
                  id="target-audience"
                  className="form-input"
                  type="text"
                  placeholder="e.g. B2B founders, fitness athletes, boutique shoppers"
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
                    {data.currentBio ? "(auto-extracted from Instagram)" : "(optional)"}
                  </span>
                </label>
                <textarea
                  id="current-bio"
                  className="form-input form-textarea"
                  placeholder="Paste or review existing bio here..."
                  value={data.currentBio}
                  onChange={(e) => updateField("currentBio", e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 4: Primary Goals & Bottlenecks (Multi-select) */}
          {step === 4 && (
            <div className="animate-fade-in-up">
              <h2 className="section-title" style={{ textAlign: "center" }}>
                Growth Goals
              </h2>
              <p
                className="section-subtitle"
                style={{ textAlign: "center", marginBottom: "var(--space-4)" }}
              >
                Select all primary growth priorities.
              </p>
              <div
                className="chip-group"
                style={{ justifyContent: "center", marginBottom: "var(--space-6)" }}
              >
                {GOALS.map((goal) => {
                  const isSelected = data.primaryGoals?.includes(goal.value);
                  return (
                    <button
                      key={goal.value}
                      type="button"
                      className={`chip${isSelected ? " active" : ""}`}
                      onClick={() => toggleArrayItem("primaryGoals", goal.value)}
                    >
                      {goal.label}
                    </button>
                  );
                })}
              </div>

              <h3
                className="section-title"
                style={{
                  textAlign: "center",
                  fontSize: "1.0625rem",
                  marginBottom: "var(--space-2)",
                }}
              >
                Primary Bottlenecks
              </h3>
              <p
                className="section-subtitle"
                style={{ textAlign: "center", marginBottom: "var(--space-4)" }}
              >
                Select all issues you are facing.
              </p>
              <div className="chip-group" style={{ justifyContent: "center" }}>
                {STRUGGLES.map((item) => {
                  const isSelected = data.currentStruggles?.includes(item.value);
                  return (
                    <button
                      key={item.value}
                      type="button"
                      className={`chip${isSelected ? " active" : ""}`}
                      onClick={() => toggleArrayItem("currentStruggles", item.value)}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 5: Content Formats (Multi-select) */}
          {step === 5 && (
            <div className="animate-fade-in-up">
              <h2 className="section-title" style={{ textAlign: "center" }}>
                Active Distribution Formats
              </h2>
              <p
                className="section-subtitle"
                style={{ textAlign: "center", marginBottom: "var(--space-6)" }}
              >
                Select all formats you currently publish.
              </p>
              <div className="chip-group" style={{ justifyContent: "center" }}>
                {CONTENT_FORMATS.map((format) => {
                  const isSelected = data.contentFormats?.includes(format.value);
                  return (
                    <button
                      key={format.value}
                      type="button"
                      className={`chip${isSelected ? " active" : ""}`}
                      onClick={() => toggleArrayItem("contentFormats", format.value)}
                    >
                      {format.label}
                    </button>
                  );
                })}
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
