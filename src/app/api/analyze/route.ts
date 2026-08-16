import { NextRequest } from "next/server";

interface IntakeData {
  handle: string;
  accountType: string;
  targetAudience: string;
  primaryGoal: string;
  currentBio: string;
  currentStruggle: string;
  contentFormats: string[];
}

export async function POST(request: NextRequest) {
  try {
    const data: IntakeData = await request.json();
    const geminiKey = process.env.GEMINI_API_KEY;

    if (geminiKey) {
      try {
        const geminiResult = await callGemini(data, geminiKey);
        return Response.json(geminiResult);
      } catch (err: unknown) {
        console.error("Gemini API error, running local engine:", err);
      }
    }

    const audit = runMinimalAuditEngine(data);
    return Response.json(audit);
  } catch (err: unknown) {
    return new Response(
      JSON.stringify({ error: "Invalid request", details: String(err) }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}

function runMinimalAuditEngine(data: IntakeData) {
  const handle = (data.handle || "").toLowerCase().replace(/^@/, "");
  const bio = data.currentBio || "";
  const audience = data.targetAudience || "your market";
  const formats = data.contentFormats || [];

  const handleLength = handle.length;
  const hasSpamNumbers = /\d{3,}/.test(handle);
  let seoScore = 80;
  if (handleLength > 18) seoScore -= 20;
  if (hasSpamNumbers) seoScore -= 25;
  seoScore = Math.max(10, Math.min(98, seoScore));

  let bioScore = 50;
  if (bio.length >= 60 && bio.length <= 145) bioScore += 20;
  else if (bio.length < 30) bioScore -= 20;
  if (bio.split("\n").length >= 2) bioScore += 10;
  bioScore = Math.max(10, Math.min(98, bioScore));

  let ctaScore = 40;
  if (/(link|shop|dm|book|free|download|click|tap)/i.test(bio)) ctaScore += 35;
  ctaScore = Math.max(10, Math.min(98, ctaScore));

  let positionScore = 65;
  if (audience.length > 10) positionScore += 15;
  positionScore = Math.max(10, Math.min(98, positionScore));

  let contentScore = 50;
  if (formats.includes("Reels")) contentScore += 25;
  if (formats.includes("Carousels")) contentScore += 15;
  contentScore = Math.max(10, Math.min(98, contentScore));

  const overallScore = Math.round(
    seoScore * 0.15 + bioScore * 0.3 + ctaScore * 0.2 + positionScore * 0.2 + contentScore * 0.15
  );

  const formattedName = handle ? handle.charAt(0).toUpperCase() + handle.slice(1) : "Brand";

  return {
    overallScore,
    verdict: overallScore >= 75 ? "Optimal Baseline" : "Optimization Required",
    verdictEmoji: "",
    pillars: [
      {
        name: "SEO & Discoverability",
        icon: "",
        score: seoScore,
        feedback: `Handle @${handle} evaluated. Optimize Name Field for search keywords.`,
        suggestion: `Name Field: "${formattedName} | ${audience.slice(0, 20)}"`,
      },
      {
        name: "Bio Value Proposition",
        icon: "",
        score: bioScore,
        feedback: bio.length > 0 ? "Bio structure analyzed for mobile scanability and hook clarity." : "Empty bio leads to visitor bounce.",
        suggestion: "Implement the 3-line structured formula below.",
      },
      {
        name: "CTA & Conversion",
        icon: "",
        score: ctaScore,
        feedback: ctaScore >= 70 ? "Direct call to action identified." : "No explicit directive pointing to primary link.",
        suggestion: "Direct visitors to a single high-intent destination.",
      },
      {
        name: "Positioning",
        icon: "",
        score: positionScore,
        feedback: `Target audience calibrated for ${audience.slice(0, 30)}.`,
        suggestion: "Clarify value differentiation in first 3 seconds.",
      },
      {
        name: "Content Engine",
        icon: "",
        score: contentScore,
        feedback: "Format mix evaluated against current algorithmic distribution.",
        suggestion: "Maintain regular Reels and Carousel cadence.",
      },
    ],
    bioSuggestions: [
      {
        label: "Conversion",
        style: "conversion",
        text: `Engineered for ${audience}\nTrusted by 10,000+ worldwide\nShop collection below`,
      },
      {
        label: "Authority",
        style: "authority",
        text: `${formattedName} | ${audience}\nIndustry-leading quality & performance\nOfficial links below`,
      },
      {
        label: "Minimalist",
        style: "minimal",
        text: `${audience}\n${formattedName} Official\nExplore links`,
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

async function callGemini(data: IntakeData, apiKey: string) {
  const prompt = `You are an elite Instagram profile auditor. Analyze the following profile and provide a concise, high-density audit.
DO NOT use emojis anywhere in the response. Keep all text ultra-concise, professional, and actionable.

Handle: @${data.handle}
Account Type: ${data.accountType}
Audience: ${data.targetAudience}
Goal: ${data.primaryGoal}
Bio: "${data.currentBio}"
Struggle: ${data.currentStruggle}
Formats: ${data.contentFormats.join(", ")}

Respond with strictly valid JSON matching this schema:
{
  "overallScore": <0-100>,
  "verdict": "<short verdict, NO EMOJIS>",
  "verdictEmoji": "",
  "pillars": [
    { "name": "SEO & Discoverability", "icon": "", "score": <0-100>, "feedback": "<1 concise sentence>", "suggestion": "<1 concise suggestion>" },
    { "name": "Bio Value Proposition", "icon": "", "score": <0-100>, "feedback": "<1 concise sentence>", "suggestion": "<1 concise suggestion>" },
    { "name": "CTA & Conversion", "icon": "", "score": <0-100>, "feedback": "<1 concise sentence>", "suggestion": "<1 concise suggestion>" },
    { "name": "Positioning", "icon": "", "score": <0-100>, "feedback": "<1 concise sentence>", "suggestion": "<1 concise suggestion>" },
    { "name": "Content Engine", "icon": "", "score": <0-100>, "feedback": "<1 concise sentence>", "suggestion": "<1 concise suggestion>" }
  ],
  "bioSuggestions": [
    { "label": "Conversion", "style": "conversion", "text": "<3-line bio with \\n line breaks, NO EMOJIS, max 150 chars>" },
    { "label": "Authority", "style": "authority", "text": "<3-line bio with \\n line breaks, NO EMOJIS, max 150 chars>" },
    { "label": "Minimalist", "style": "minimal", "text": "<clean punchy bio with \\n line breaks, NO EMOJIS, max 150 chars>" }
  ],
  "actionPlan": [
    { "priority": 1, "title": "<Action Title>", "description": "<1-2 concise sentences>", "timeframe": "<e.g. 'Immediate', 'This week', '30 days'>", "category": "<'immediate' | 'short-term' | 'long-term'>" }
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
          temperature: 0.5,
          maxOutputTokens: 4096,
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!response.ok) throw new Error(`Gemini status: ${response.status}`);
  const result = await response.json();
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
  return JSON.parse(text);
}
