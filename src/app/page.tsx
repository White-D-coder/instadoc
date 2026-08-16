"use client";

import { useState, useCallback } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import DiagnosticIntake from "@/components/DiagnosticIntake";
import AnalyzingOverlay from "@/components/AnalyzingOverlay";
import ResultsDashboard from "@/components/ResultsDashboard";
import Footer from "@/components/Footer";

export interface IntakeData {
  handle: string;
  accountType: string;
  targetAudience: string;
  primaryGoal: string;
  currentBio: string;
  currentStruggle: string;
  contentFormats: string[];
  metaMetrics?: {
    followers?: number;
    following?: number;
    posts?: number;
    name?: string;
  };
}

export interface PillarScore {
  name: string;
  icon: string;
  score: number;
  feedback: string;
  suggestion: string;
}

export interface BioSuggestion {
  label: string;
  style: string;
  text: string;
}

export interface ActionItem {
  priority: number;
  title: string;
  description: string;
  timeframe: string;
  category: "immediate" | "short-term" | "long-term";
}

export interface AnalysisResult {
  overallScore: number;
  verdict: string;
  verdictEmoji: string;
  pillars: PillarScore[];
  bioSuggestions: BioSuggestion[];
  actionPlan: ActionItem[];
  source?: string;
}

type AppView = "landing" | "intake" | "analyzing" | "results";

export default function HomePage() {
  const [view, setView] = useState<AppView>("landing");
  const [intakeData, setIntakeData] = useState<IntakeData>({
    handle: "",
    accountType: "",
    targetAudience: "",
    primaryGoal: "",
    currentBio: "",
    currentStruggle: "",
    contentFormats: [],
  });
  const [results, setResults] = useState<AnalysisResult | null>(null);

  const handleStartDiagnosis = useCallback((handle: string) => {
    setIntakeData((prev) => ({ ...prev, handle }));
    setView("intake");
  }, []);

  const handleIntakeComplete = useCallback(async (data: IntakeData) => {
    setIntakeData(data);
    setView("analyzing");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Analysis failed");

      const analysisResult: AnalysisResult = await res.json();
      setResults(analysisResult);
      setView("results");
    } catch (err) {
      console.error("Diagnosis error, running local engine:", err);
      const fallbackResult = generateHeuristicAnalysis(data);
      setResults(fallbackResult);
      setView("results");
    }
  }, []);

  const handleStartOver = useCallback(() => {
    setView("landing");
    setResults(null);
    setIntakeData({
      handle: "",
      accountType: "",
      targetAudience: "",
      primaryGoal: "",
      currentBio: "",
      currentStruggle: "",
      contentFormats: [],
    });
  }, []);

  return (
    <>
      <Header onLogoClick={handleStartOver} />

      {view === "landing" && (
        <HeroSection onStart={handleStartDiagnosis} />
      )}

      {view === "intake" && (
        <DiagnosticIntake
          initialData={intakeData}
          onComplete={handleIntakeComplete}
          onBack={() => setView("landing")}
        />
      )}

      {view === "analyzing" && <AnalyzingOverlay handle={intakeData.handle} />}

      {view === "results" && results && (
        <ResultsDashboard
          data={intakeData}
          results={results}
          onStartOver={handleStartOver}
        />
      )}

      <Footer />
    </>
  );
}

/* ---------- Heuristic Fallback Analysis ---------- */
function generateHeuristicAnalysis(data: IntakeData): AnalysisResult {
  const bio = data.currentBio || "";
  const handle = (data.handle || "").toLowerCase().replace(/^@/, "");

  let bioScore = 45;
  if (bio.length > 20) bioScore += 10;
  if (bio.length > 60 && bio.length <= 150) bioScore += 15;
  if (bio.includes("🔗") || bio.includes("👇") || bio.includes("⬇")) bioScore += 10;
  if (bio.split("\n").length >= 2) bioScore += 10;
  if (bio.length === 0) bioScore = 15;
  bioScore = Math.min(98, Math.max(10, bioScore));

  let handleScore = 75;
  if (handle.length <= 15) handleScore += 10;
  if (!/[._]{2,}/.test(handle)) handleScore += 5;
  if (handle.length > 20) handleScore -= 20;
  handleScore = Math.min(98, Math.max(10, handleScore));

  let ctaScore = 40;
  const ctaKeywords = ["link", "dm", "book", "shop", "buy", "free", "download", "click", "tap", "👇", "⬇", "🔗"];
  ctaKeywords.forEach((kw) => {
    if (bio.toLowerCase().includes(kw)) ctaScore += 10;
  });
  ctaScore = Math.min(98, Math.max(10, ctaScore));

  let positionScore = 65;
  if (data.targetAudience && data.targetAudience.length > 10) positionScore += 15;
  positionScore = Math.min(98, Math.max(10, positionScore));

  let contentScore = 50;
  if (data.contentFormats.includes("Reels")) contentScore += 25;
  if (data.contentFormats.includes("Carousels")) contentScore += 15;
  contentScore = Math.min(98, Math.max(10, contentScore));

  const overallScore = Math.round(
    bioScore * 0.3 + handleScore * 0.15 + ctaScore * 0.2 + positionScore * 0.2 + contentScore * 0.15
  );

  return {
    overallScore,
    verdict: overallScore >= 75 ? "Strong Profile — Minor Tuning Needed" : "Needs Bio Surgery & Strategy Alignment",
    verdictEmoji: overallScore >= 75 ? "🚀" : "🩺",
    pillars: [
      {
        name: "SEO & Search Visibility",
        icon: "🔍",
        score: handleScore,
        feedback: `@${handle} is indexable. Optimize Name Field for search discoverability.`,
        suggestion: `Update Name Field: "${handle.charAt(0).toUpperCase() + handle.slice(1)} | ${data.targetAudience?.slice(0, 20) || "Official Brand"}"`,
      },
      {
        name: "Bio Value Proposition",
        icon: "🎯",
        score: bioScore,
        feedback: bio.length > 0 ? "Bio contains basic positioning but lacks a strong quantified hook." : "Empty bio causes high visitor bounce rate.",
        suggestion: "Use the high-conversion bio formula in the lab below.",
      },
      {
        name: "CTA & Conversion Funnel",
        icon: "🔗",
        score: ctaScore,
        feedback: ctaScore >= 60 ? "Direct CTA detected." : "No explicit conversion CTA pointing to your link.",
        suggestion: 'Add: "👇 Claim 15% off / Download Free Guide"',
      },
      {
        name: "Positioning & Differentiation",
        icon: "🎨",
        score: positionScore,
        feedback: `Positioning defined for ${data.targetAudience || "your niche"}.`,
        suggestion: "Clarify what makes your brand distinct within 3 seconds.",
      },
      {
        name: "Content Strategy & Formats",
        icon: "📈",
        score: contentScore,
        feedback: "Format diversity drives algorithmic discovery.",
        suggestion: "Maintain 3-4 Reels per week for non-follower discovery.",
      },
    ],
    bioSuggestions: [
      {
        label: "High-Conversion (Recommended)",
        style: "conversion",
        text: `✨ Helping ${data.targetAudience || "you"} achieve results\n📈 10,000+ happy community members\n📦 Worldwide shipping & easy access\n👇 Explore links below`,
      },
      {
        label: "Authority & Social Proof",
        style: "authority",
        text: `${handle.charAt(0).toUpperCase() + handle.slice(1)} Official | ${data.targetAudience || "Industry Leader"}\n🏆 Featured in top media & publications\n✦ Quality • Performance • Trust\n🔗 Official Website 👇`,
      },
      {
        label: "Minimalist & Modern",
        style: "minimal",
        text: `${data.targetAudience || "Brand Studio"}\n${bio.split("\n")[0] || "Elevating standards daily."}\n👇 Tap to shop`,
      },
    ],
    actionPlan: [
      {
        priority: 1,
        title: "Deploy High-Conversion Bio Structure",
        description: "Adopt the 3-line Hook-Proof-CTA framework from the lab above.",
        timeframe: "Immediate (5 mins)",
        category: "immediate",
      },
      {
        priority: 2,
        title: "Optimize Link-in-Bio Target",
        description: "Reduce link fatigue by pointing visitors to ONE single primary offer.",
        timeframe: "Today",
        category: "immediate",
      },
    ],
  };
}
