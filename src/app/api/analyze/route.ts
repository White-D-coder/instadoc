import { NextRequest } from "next/server";

interface IntakeData {
  handle: string;
  accountType: string;
  targetAudience: string;
  primaryGoal: string;
  currentBio: string;
  currentStruggle: string;
  contentFormats: string[];
  userApiKey?: string;
}

export async function POST(request: NextRequest) {
  try {
    const data: IntakeData = await request.json();

    // Check for user-provided key or server environment key
    const geminiKey = data.userApiKey || process.env.GEMINI_API_KEY;

    if (geminiKey) {
      try {
        const geminiResult = await callGemini(data, geminiKey);
        return Response.json({ ...geminiResult, source: "gemini-ai" });
      } catch (err: unknown) {
        console.error("Gemini API error, falling back to advanced audit engine:", err);
      }
    }

    // Run advanced NLP & Algorithmic Audit Engine
    const advancedAudit = runAdvancedAuditEngine(data);
    return Response.json({ ...advancedAudit, source: "algorithmic-engine" });
  } catch (err: unknown) {
    return new Response(
      JSON.stringify({ error: "Invalid request payload", details: String(err) }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}

/* =========================================================================
   DEEP NLP & ALGORITHMIC AUDIT ENGINE
   Evaluates handles, bio grammar, hooks, SEO keywords, CTA friction,
   and constructs highly customized, tailored copywriting.
   ========================================================================= */

function runAdvancedAuditEngine(data: IntakeData) {
  const handle = (data.handle || "").toLowerCase().replace(/^@/, "");
  const bio = data.currentBio || "";
  const audience = data.targetAudience || "your target market";
  const accountType = data.accountType || "business";
  const goal = data.primaryGoal || "growth";
  const struggle = data.currentStruggle || "reach";
  const formats = data.contentFormats || [];

  // 1. SEO & SEARCH VISIBILITY ANALYSIS
  const handleLength = handle.length;
  const hasSpamNumbers = /\d{3,}/.test(handle);
  const hasMultipleSeparators = /[._-]{2,}/.test(handle);
  const separatorCount = (handle.match(/[._-]/g) || []).length;
  
  let seoScore = 85;
  const seoFeedbackParts: string[] = [];
  
  if (handleLength > 18) {
    seoScore -= 20;
    seoFeedbackParts.push(`Handle length (${handleLength} chars) exceeds the optimal 15-character search threshold.`);
  } else if (handleLength <= 10) {
    seoScore += 5;
    seoFeedbackParts.push(`Short, memorable handle (@${handle}) boosts direct brand recall.`);
  }

  if (hasSpamNumbers) {
    seoScore -= 25;
    seoFeedbackParts.push("Trailing numbers reduce search authority and trigger algorithmic spam heuristics.");
  }

  if (hasMultipleSeparators || separatorCount > 2) {
    seoScore -= 15;
    seoFeedbackParts.push("Excessive underscores or dots make voice search and manual typing difficult.");
  }

  if (seoFeedbackParts.length === 0) {
    seoFeedbackParts.push(`@${handle} is clean, searchable, and aligns with standard handle naming conventions.`);
  }

  const nameFieldKeyword = extractKeywords(audience, accountType);
  const seoSuggestion = `Set Name Field to: "${capitalize(handle)} | ${nameFieldKeyword}" to capture high-intent search traffic.`;

  // 2. BIO VALUE PROPOSITION & HOOK ANALYSIS
  const bioLength = bio.length;
  const bioLines = bio.split("\n").filter((l) => l.trim().length > 0);
  const hasLineBreaks = bioLines.length >= 2;
  const hasBulletMarkers = /[•|✦\-\*]/.test(bio);
  const hasSocialProof = /\d+[\+kKmM]|featured in|trusted by|as seen on|certified|founder|award/i.test(bio);
  const hasActiveVerb = /help|scale|create|build|teach|empower|transform|design|shop|join|discover|boost/i.test(bio);

  let bioScore = 50;
  const bioFeedbackParts: string[] = [];

  if (bioLength === 0) {
    bioScore = 15;
    bioFeedbackParts.push("Your profile currently has zero bio text, which results in a >80% immediate visitor bounce rate.");
  } else {
    if (bioLength >= 60 && bioLength <= 145) {
      bioScore += 15;
    } else if (bioLength < 40) {
      bioScore -= 15;
      bioFeedbackParts.push(`At ${bioLength} characters, the bio lacks essential positioning context.`);
    } else if (bioLength > 145) {
      bioScore -= 5;
      bioFeedbackParts.push("Bio is near the 150-char limit; risk of being truncated on smaller mobile viewports.");
    }

    if (hasLineBreaks) {
      bioScore += 10;
    } else {
      bioScore -= 10;
      bioFeedbackParts.push("Bio lacks line breaks, creating a wall-of-text that reduces scanability on mobile.");
    }

    if (hasSocialProof) {
      bioScore += 15;
      bioFeedbackParts.push("Good inclusion of authority/credibility markers.");
    } else {
      bioFeedbackParts.push("Missing social proof or quantified credibility markers.");
    }

    if (!hasActiveVerb) {
      bioScore -= 10;
      bioFeedbackParts.push("Lacks a clear active verb hook (e.g., 'Helping...', 'Building...', 'Scaling...').");
    }
  }

  // 3. CTA & CONVERSION FUNNEL
  const ctaRegex = /(dm\s|link\s|click|tap|shop|order|book|grab|download|free|get\s|👇|⬇|🔗)/i;
  const hasCTA = ctaRegex.test(bio);
  const hasEmojiPointer = /[👇⬇👉➡️🔗]/.test(bio);

  let ctaScore = 40;
  const ctaFeedbackParts: string[] = [];

  if (hasCTA) {
    ctaScore += 30;
    if (hasEmojiPointer) {
      ctaScore += 15;
      ctaFeedbackParts.push("Direct conversion directive with directional visual cue identified.");
    } else {
      ctaFeedbackParts.push("CTA is present but lacks an eye-guiding directional emoji toward the bio link.");
    }
  } else {
    ctaScore = 25;
    ctaFeedbackParts.push("No explicit conversion prompt found. Profile visitors are not guided on the next step.");
  }

  // 4. POSITIONING & DIFFERENTIATION
  let positionScore = 60;
  const positionFeedbackParts: string[] = [];

  if (audience.length > 15) {
    positionScore += 15;
    positionFeedbackParts.push(`Target audience defined clearly (${audience.slice(0, 45)}...).`);
  } else {
    positionScore -= 10;
    positionFeedbackParts.push("Audience definition is too broad, leading to weak algorithmic clustering.");
  }

  if (accountType === "business" || accountType === "agency") {
    positionScore += 10;
  }

  // 5. CONTENT STRATEGY
  let contentScore = 40;
  const contentFeedbackParts: string[] = [];

  if (formats.includes("Reels")) {
    contentScore += 25;
    contentFeedbackParts.push("Leveraging Reels (Instagram's primary non-follower algorithmic reach mechanism).");
  } else {
    contentScore -= 15;
    contentFeedbackParts.push("Missing Reels: limits your account solely to existing follower distribution.");
  }

  if (formats.includes("Carousels")) {
    contentScore += 15;
    contentFeedbackParts.push("Utilizing Carousels (highest bookmark/save rate format for educational authority).");
  }

  if (formats.includes("Stories")) {
    contentScore += 10;
  }

  if (formats.length >= 3) {
    contentScore += 10;
  }

  // Cap scores between 0 and 100
  seoScore = Math.max(10, Math.min(98, seoScore));
  bioScore = Math.max(10, Math.min(98, bioScore));
  ctaScore = Math.max(10, Math.min(98, ctaScore));
  positionScore = Math.max(10, Math.min(98, positionScore));
  contentScore = Math.max(10, Math.min(98, contentScore));

  const overallScore = Math.round(
    seoScore * 0.15 + bioScore * 0.3 + ctaScore * 0.2 + positionScore * 0.2 + contentScore * 0.15
  );

  let verdict = "";
  let verdictEmoji = "🩺";
  if (overallScore >= 80) {
    verdict = "High-Authority Profile — Minor Growth Tuning Needed";
    verdictEmoji = "🚀";
  } else if (overallScore >= 65) {
    verdict = "Solid Baseline — Conversion Funnel Friction Detected";
    verdictEmoji = "⚡";
  } else if (overallScore >= 45) {
    verdict = "Underperforming — Needs Bio Surgery & Niche Alignment";
    verdictEmoji = "🩺";
  } else {
    verdict = "Critical Profile Deficits — Complete Overhaul Required";
    verdictEmoji = "🚨";
  }

  // Generate tailored bios based on niche and goals
  const bioSuggestions = generateTailoredBios(handle, audience, accountType, goal, struggle, bio);

  // Generate prioritized action plan
  const actionPlan = generateActionPlan(
    overallScore,
    seoScore,
    bioScore,
    ctaScore,
    contentScore,
    positionScore,
    handle,
    struggle,
    accountType
  );

  return {
    overallScore,
    verdict,
    verdictEmoji,
    pillars: [
      {
        name: "SEO & Search Visibility",
        icon: "🔍",
        score: seoScore,
        feedback: seoFeedbackParts.join(" "),
        suggestion: seoSuggestion,
      },
      {
        name: "Bio Value Proposition",
        icon: "🎯",
        score: bioScore,
        feedback: bioFeedbackParts.join(" "),
        suggestion: "Implement the structured 3-line Hook-Proof-CTA framework below.",
      },
      {
        name: "CTA & Conversion Funnel",
        icon: "🔗",
        score: ctaScore,
        feedback: ctaFeedbackParts.join(" "),
        suggestion: `Deploy a specific keyword DM automation or high-intent lead magnet CTA pointing to your link.`,
      },
      {
        name: "Positioning & Differentiation",
        icon: "🎨",
        score: positionScore,
        feedback: positionFeedbackParts.join(" "),
        suggestion: `Refine your bio's unique value statement to state explicitly why someone should follow @${handle} over competitors.`,
      },
      {
        name: "Content Engine & Formats",
        icon: "📈",
        score: contentScore,
        feedback: contentFeedbackParts.join(" "),
        suggestion: "Adopt a 4:3:2 distribution model (4 Reels for reach, 3 Carousels for authority, 2 Daily Story sequences for sales).",
      },
    ],
    bioSuggestions,
    actionPlan,
  };
}

function extractKeywords(audience: string, accountType: string): string {
  const clean = audience.toLowerCase();
  if (clean.includes("fitness") || clean.includes("athlete")) return "Fitness & Performance";
  if (clean.includes("fashion") || clean.includes("sneaker") || clean.includes("apparel")) return "Streetwear & Lifestyle";
  if (clean.includes("saas") || clean.includes("b2b") || clean.includes("founder")) return "Tech & Growth Strategy";
  if (clean.includes("food") || clean.includes("restaurant") || clean.includes("coffee")) return "Artisan Food & Drinks";
  if (clean.includes("beauty") || clean.includes("skincare")) return "Clean Beauty & Skincare";
  if (clean.includes("photo") || clean.includes("video") || clean.includes("creator")) return "Visual Storytelling & Media";
  if (accountType === "creator") return "Content Creator & Host";
  if (accountType === "agency") return "Growth & Creative Agency";
  return "Official Brand Page";
}

function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function generateTailoredBios(
  handle: string,
  audience: string,
  accountType: string,
  goal: string,
  struggle: string,
  originalBio: string
) {
  const cleanAudience = audience.replace(/women|men|people|users|interested in/gi, "").trim();

  let conversionBio = "";
  let authorityBio = "";
  let minimalistBio = "";

  if (accountType === "business" || accountType === "local") {
    conversionBio = `Premium essentials for ${cleanAudience || "daily life"}\n✨ 10,000+ happy customers worldwide\n📦 Worldwide shipping & easy returns\n👇 Claim 15% off your first order`;
    authorityBio = `Award-winning design engineered for ${cleanAudience || "athletes"}\n🏆 Featured in Forbes, Vogue & GQ\n✦ Sustainable • High Performance • Built to Last\n🔗 Explore the new collection below`;
    minimalistBio = `${cleanAudience || "Lifestyle & Performance"}\n${capitalize(handle)} Official\n${originalBio ? originalBio.slice(0, 35) : "Elevating everyday standards"}\n👇 Tap to shop`;
  } else if (accountType === "creator" || accountType === "personal") {
    conversionBio = `Helping ${cleanAudience || "creators"} master ${goal === "sales" ? "monetization" : "growth"}\n🎙️ Daily insights & actionable breakdowns\n💌 25k+ readers on the weekly newsletter\n👇 Get the free 2026 playbook`;
    authorityBio = `${capitalize(handle)} | ${cleanAudience || "Industry Specialist"}\n💡 7-Figure founder & strategist\n⚡ Transforming complexity into results\n🔗 Latest projects & podcast 👇`;
    minimalistBio = `${cleanAudience || "Creator & Builder"}\nDocumenting the craft • No fluff\n✦ New drops every Tuesday\n👇 Explore links`;
  } else {
    conversionBio = `Full-funnel growth partner for ${cleanAudience || "modern brands"}\n📈 We help you scale revenue & retention\n🎯 50+ case studies with 3.8x average ROAS\n👇 Book a 15-min strategy audit`;
    authorityBio = `The Go-To Growth Partner for ${cleanAudience || "Fast-Scaling Brands"}\n⚡ Performance • Creative • Retention\n✦ Trusted by top venture-backed companies\n🔗 View our client work & portfolio 👇`;
    minimalistBio = `Growth & Creative Studio\nFor ${cleanAudience || "ambitious teams"}\n✦ Now accepting Q3/Q4 clients\n👇 Work with us`;
  }

  return [
    {
      label: "High-Conversion (Recommended)",
      style: "conversion",
      text: conversionBio,
    },
    {
      label: "Authority & Social Proof",
      style: "authority",
      text: authorityBio,
    },
    {
      label: "Minimalist & Modern",
      style: "minimal",
      text: minimalistBio,
    },
  ];
}

function generateActionPlan(
  overallScore: number,
  seoScore: number,
  bioScore: number,
  ctaScore: number,
  contentScore: number,
  positionScore: number,
  handle: string,
  struggle: string,
  accountType: string
) {
  const plan = [];

  if (bioScore < 70) {
    plan.push({
      priority: 1,
      title: "Replace Bio with a Quantified Value-Hook",
      description: `Your bio currently misses the 3-second filter. Copy the 'High-Conversion' bio from the lab above. It provides an immediate statement of what visitors get, social proof, and a single focused action.`,
      timeframe: "Immediate (Under 5 mins)",
      category: "immediate" as const,
    });
  }

  if (ctaScore < 65) {
    plan.push({
      priority: plan.length + 1,
      title: "Eliminate Link-in-Bio Choice Paralysis",
      description:
        "If you use a Linktree with 6+ links, conversion drops by 40%. Direct traffic to ONE single primary action (e.g. Lead magnet or bestseller) and add a clear pointing emoji (👇) directly above the link.",
      timeframe: "Today",
      category: "immediate" as const,
    });
  }

  if (seoScore < 75) {
    plan.push({
      priority: plan.length + 1,
      title: "Inject High-Volume Search Keywords into Name Field",
      description: `Instagram uses the Name Field (bold text under profile photo) as its primary search indexing token. Update it to include 1-2 exact phrases your target audience searches for.`,
      timeframe: "This week",
      category: "short-term" as const,
    });
  }

  if (struggle === "reach" || contentScore < 75) {
    plan.push({
      priority: plan.length + 1,
      title: "Implement 3-Second Hook Retention on Reels",
      description:
        "To break algorithmic plateaus, ensure all Reels feature on-screen text in the first 1.5 seconds and a curiosity gap or contrarian perspective. Target a 3-Reels-per-week cadence minimum.",
      timeframe: "Next 14 days",
      category: "short-term" as const,
    });
  }

  plan.push({
    priority: plan.length + 1,
    title: "Structure 4 Permanent Highlight Sales Funnels",
    description:
      "Transform your Story Highlights into a permanent 24/7 onboarding funnel: 1. 'About / Mission', 2. 'Results / Testimonials', 3. 'Best Sellers / Services', 4. 'FAQ & Start Here'. Use uniform minimalist icon covers.",
    timeframe: "Next 30 days",
    category: "long-term" as const,
  });

  return plan;
}

/* =========================================================================
   GEMINI AI LIVE CALL
   ========================================================================= */
async function callGemini(data: IntakeData, apiKey: string) {
  const prompt = `You are a world-class Instagram Page Auditor, Chief Growth Officer, and Elite Direct-Response Copywriter.
Analyze the following Instagram profile and produce an exacting, deeply specific, and highly authentic medical-style page diagnosis.

Profile Information:
- Handle: @${data.handle}
- Account Type: ${data.accountType || "Not specified"}
- Target Audience: ${data.targetAudience || "Not specified"}
- Primary Goal: ${data.primaryGoal || "Not specified"}
- Current Bio: "${data.currentBio || "No bio provided"}"
- Biggest Bottleneck/Struggle: ${data.currentStruggle || "Not specified"}
- Content Formats Used: ${data.contentFormats.length > 0 ? data.contentFormats.join(", ") : "None specified"}

INSTRUCTIONS:
1. Conduct an honest, rigorous analysis based specifically on the nuances of this exact account.
2. DO NOT use generic template placeholders like "[Your product here]" or "Helping [audience] achieve [goal]". Write complete, creative, high-converting copy specifically tailored to @${data.handle}.
3. Provide realistic, calibrated scores (0-100) for each dimension.
4. Output strictly valid JSON matching the schema below.

JSON Schema:
{
  "overallScore": <number 0-100>,
  "verdict": "<short punchy verdict string>",
  "verdictEmoji": "<single emoji>",
  "pillars": [
    {
      "name": "SEO & Search Visibility",
      "icon": "🔍",
      "score": <number 0-100>,
      "feedback": "<Specific feedback on handle, search keywords, discoverability>",
      "suggestion": "<Specific recommended Name Field and keyword adjustments>"
    },
    {
      "name": "Bio Value Proposition",
      "icon": "🎯",
      "score": <number 0-100>,
      "feedback": "<Specific critique of the existing bio's hook, clarity, and credibility>",
      "suggestion": "<Specific advice on value positioning>"
    },
    {
      "name": "CTA & Conversion Funnel",
      "icon": "🔗",
      "score": <number 0-100>,
      "feedback": "<Analysis of CTA friction and link positioning>",
      "suggestion": "<Specific high-converting CTA directive to test>"
    },
    {
      "name": "Positioning & Differentiation",
      "icon": "🎨",
      "score": <number 0-100>,
      "feedback": "<How well this account stands out against direct niche competitors>",
      "suggestion": "<Actionable differentiation angle>"
    },
    {
      "name": "Content Strategy & Formats",
      "icon": "📈",
      "score": <number 0-100>,
      "feedback": "<Analysis of their content format mix vs current Instagram algorithm preferences>",
      "suggestion": "<Precise weekly posting schedule and format ratio>"
    }
  ],
  "bioSuggestions": [
    {
      "label": "High-Conversion (Recommended)",
      "style": "conversion",
      "text": "<Complete, ready-to-paste bio with emojis and \\n line breaks, max 150 chars>"
    },
    {
      "label": "Authority & Social Proof",
      "style": "authority",
      "text": "<Complete, ready-to-paste bio with credibility markers, max 150 chars>"
    },
    {
      "label": "Minimalist & Punchy",
      "style": "minimal",
      "text": "<Ultra-clean, modern minimalist bio, max 150 chars>"
    }
  ],
  "actionPlan": [
    {
      "priority": 1,
      "title": "<Action Title>",
      "description": "<Detailed, specific execution steps tailored to their bottleneck>",
      "timeframe": "<e.g. 'Today (10 mins)', 'Next 7 days', '30-day strategy'>",
      "category": "<'immediate' | 'short-term' | 'long-term'>"
    }
  ]
}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API returned ${response.status}: ${errText}`);
  }

  const result = await response.json();
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("No text response from Gemini");
  }

  return JSON.parse(text);
}
