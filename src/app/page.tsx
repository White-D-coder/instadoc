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
  accountTypes: string[];
  businessStage: string;
  targetAudience: string;
  primaryGoals: string[];
  currentBio: string;
  currentStruggles: string[];
  contentFormats: string[];
  metaMetrics?: {
    followers?: number;
    following?: number;
    posts?: number;
    name?: string;
    avatarUrl?: string | null;
    biography?: string;
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
    accountTypes: [],
    businessStage: "",
    targetAudience: "",
    primaryGoals: [],
    currentBio: "",
    currentStruggles: [],
    contentFormats: [],
  });
  const [results, setResults] = useState<AnalysisResult | null>(null);

  const handleStartDiagnosis = useCallback(async (handle: string) => {
    const cleanHandle = handle.replace(/^@/, "").trim();
    setIntakeData((prev) => ({ ...prev, handle: cleanHandle }));
    setView("intake");

    // Fetch live profile details (avatar, followers, following, posts, bio)
    try {
      const res = await fetch(`/api/instagram/profile?handle=${encodeURIComponent(cleanHandle)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.profile) {
          setIntakeData((prev) => ({
            ...prev,
            metaMetrics: {
              followers: json.profile.followers,
              following: json.profile.following,
              posts: json.profile.posts,
              name: json.profile.name,
              avatarUrl: json.profile.avatarUrl,
              biography: json.profile.biography,
            },
            currentBio: prev.currentBio || json.profile.biography || prev.currentBio,
          }));
        }
      }
    } catch (err) {
      console.warn("Background profile fetch non-fatal error:", err);
    }
  }, []);

  const handleIntakeComplete = useCallback(async (data: IntakeData) => {
    setIntakeData(data);
    setView("analyzing");

    try {
      let latestData = { ...data };
      if (!latestData.metaMetrics?.avatarUrl) {
        try {
          const profileRes = await fetch(`/api/instagram/profile?handle=${encodeURIComponent(data.handle)}`);
          if (profileRes.ok) {
            const profileJson = await profileRes.json();
            if (profileJson.profile) {
              latestData.metaMetrics = {
                followers: profileJson.profile.followers,
                following: profileJson.profile.following,
                posts: profileJson.profile.posts,
                name: profileJson.profile.name,
                avatarUrl: profileJson.profile.avatarUrl,
                biography: profileJson.profile.biography,
              };
              setIntakeData(latestData);
            }
          }
        } catch {
          // Continue
        }
      }

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(latestData),
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
      accountTypes: [],
      businessStage: "",
      targetAudience: "",
      primaryGoals: [],
      currentBio: "",
      currentStruggles: [],
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

/* ---------- Minimalist Heuristic Fallback Analysis ---------- */
function generateHeuristicAnalysis(data: IntakeData): AnalysisResult {
  const bio = data.currentBio || data.metaMetrics?.biography || "";
  const handle = (data.handle || "").toLowerCase().replace(/^@/, "");

  let bioScore = 45;
  if (bio.length > 20) bioScore += 10;
  if (bio.length >= 60 && bio.length <= 150) bioScore += 15;
  if (bio.split("\n").length >= 2) bioScore += 10;
  if (bio.length === 0) bioScore = 15;
  bioScore = Math.min(98, Math.max(10, bioScore));

  let handleScore = 75;
  if (handle.length <= 15) handleScore += 10;
  if (!/[._]{2,}/.test(handle)) handleScore += 5;
  if (handle.length > 20) handleScore -= 20;
  handleScore = Math.min(98, Math.max(10, handleScore));

  let ctaScore = 40;
  const ctaKeywords = ["link", "dm", "book", "shop", "buy", "free", "download", "click", "tap", "join", "apply"];
  ctaKeywords.forEach((kw) => {
    if (bio.toLowerCase().includes(kw)) ctaScore += 10;
  });
  ctaScore = Math.min(98, Math.max(10, ctaScore));

  let positionScore = 65;
  if (data.targetAudience && data.targetAudience.length > 10) positionScore += 15;
  if (data.accountTypes && data.accountTypes.length > 0) positionScore += 10;
  positionScore = Math.min(98, Math.max(10, positionScore));

  let contentScore = 50;
  if (data.contentFormats?.includes("Reels")) contentScore += 25;
  if (data.contentFormats?.includes("Carousels")) contentScore += 15;
  contentScore = Math.min(98, Math.max(10, contentScore));

  const overallScore = Math.round(
    bioScore * 0.3 + handleScore * 0.15 + ctaScore * 0.2 + positionScore * 0.2 + contentScore * 0.15
  );

  const formattedName = data.metaMetrics?.name || (handle ? handle.charAt(0).toUpperCase() + handle.slice(1) : "Brand");

  return {
    overallScore,
    verdict: overallScore >= 75 ? "Optimal Baseline" : "Optimization Required",
    verdictEmoji: "",
    pillars: [
      {
        name: "SEO & Discoverability",
        icon: "",
        score: handleScore,
        feedback: `Handle @${handle} evaluated. Optimize Name Field for search keywords.`,
        suggestion: `Name Field: "${formattedName} | ${data.targetAudience?.slice(0, 20) || "Official"}"`,
      },
      {
        name: "Bio Value Proposition",
        icon: "",
        score: bioScore,
        feedback: bio.length > 0 ? "Bio structure analyzed for mobile scanability and hook clarity." : "Empty bio causes immediate visitor bounce.",
        suggestion: "Implement the structured 3-line formula below.",
      },
      {
        name: "CTA & Conversion",
        icon: "",
        score: ctaScore,
        feedback: ctaScore >= 60 ? "Direct call to action detected." : "No explicit directive pointing to primary link.",
        suggestion: "Add direct directive to bio link.",
      },
      {
        name: "Positioning",
        icon: "",
        score: positionScore,
        feedback: `Calibrated for ${data.targetAudience || "target audience"}.`,
        suggestion: "State distinct differentiator in first 3 seconds.",
      },
      {
        name: "Content Engine",
        icon: "",
        score: contentScore,
        feedback: "Format mix aligns with discovery algorithms.",
        suggestion: "Maintain consistent Reels and Carousel schedule.",
      },
    ],
    bioSuggestions: [
      {
        label: "Conversion",
        style: "conversion",
        text: `Engineered for ${data.targetAudience || "results"}\nProven system for high-intent clients\nTap below to start`,
      },
      {
        label: "Authority",
        style: "authority",
        text: `${formattedName} | ${data.targetAudience || "Official"}\nIndustry leader & specialist\nExplore official resources below`,
      },
      {
        label: "Minimalist",
        style: "minimal",
        text: `${data.targetAudience || "Studio"}\n${bio.split("\n")[0] || "Elevating standards daily."}\nView collection`,
      },
    ],
    actionPlan: [
      {
        priority: 1,
        title: "Deploy 3-Line Value Bio",
        description: "Replace bio with structured hook, proof, and single action directive.",
        timeframe: "Immediate",
        category: "immediate",
      },
      {
        priority: 2,
        title: "Align Name Field Keywords",
        description: "Insert primary search phrase into bold profile Name Field for search indexing.",
        timeframe: "This week",
        category: "short-term",
      },
      {
        priority: 3,
        title: "Standardize Highlight Categories",
        description: "Maintain 4 structured highlights: About, Proof, Best Sellers, and Contact.",
        timeframe: "Within 30 days",
        category: "long-term",
      },
    ],
  };
}
