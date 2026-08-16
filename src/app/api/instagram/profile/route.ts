import { NextRequest } from "next/server";
import { fetchMetaUserProfile, fetchBusinessDiscovery } from "@/lib/meta-api";

function parseFormattedNumber(str: string): number {
  if (!str) return 0;
  const clean = str.replace(/,/g, "").trim().toUpperCase();
  if (clean.endsWith("M")) return Math.round(parseFloat(clean) * 1000000);
  if (clean.endsWith("K")) return Math.round(parseFloat(clean) * 1000);
  return parseInt(clean, 10) || 0;
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#064;/g, "@")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x2022;/g, "•")
    .replace(/&#8226;/g, "•");
}

async function scrapePublicInstagramProfile(handle: string) {
  const cleanHandle = handle.replace(/^@/, "").trim().toLowerCase();
  const url = `https://www.instagram.com/${cleanHandle}/`;

  const userAgents = [
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Linux; Android 13; SM-S908B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  ];

  let html = "";
  let lastError = null;

  for (const ua of userAgents) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": ua,
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "none",
          "Sec-Fetch-User": "?1",
          "Upgrade-Insecure-Requests": "1",
        },
        next: { revalidate: 3600 },
      });

      if (res.ok) {
        html = await res.text();
        if (html.length > 500) break;
      }
    } catch (e) {
      lastError = e;
    }
  }

  if (!html) {
    throw lastError || new Error(`Could not fetch profile for ${cleanHandle}`);
  }

  // 1. Extract Profile Picture (og:image / twitter:image / meta content)
  const ogImageMatch =
    html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
    html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i) ||
    html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i) ||
    html.match(/<link[^>]*rel=["']image_src["'][^>]*href=["']([^"']+)["']/i);

  const rawImage = ogImageMatch ? ogImageMatch[1] : null;
  const avatarUrl = rawImage
    ? `/api/instagram/avatar?url=${encodeURIComponent(decodeHtmlEntities(rawImage))}`
    : null;

  // 2. Extract description (stats & bio)
  const descMatch =
    html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i) ||
    html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
    html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);

  const rawDesc = descMatch ? decodeHtmlEntities(descMatch[1]) : "";

  // 3. Extract title (name)
  const titleMatch =
    html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ||
    html.match(/<title>([^<]+)<\/title>/i);

  const rawTitle = titleMatch ? decodeHtmlEntities(titleMatch[1]) : "";

  // Extract Stats
  const followersMatch = rawDesc.match(/([0-9.,KMkm]+)\s+Followers/i);
  const followingMatch = rawDesc.match(/([0-9.,KMkm]+)\s+Following/i);
  const postsMatch = rawDesc.match(/([0-9.,KMkm]+)\s+Posts/i);

  // Extract Name
  const nameMatch = rawTitle.match(/^([^(•|]+)/);
  let name = nameMatch ? nameMatch[1].replace(/@.*/, "").trim() : cleanHandle;
  if (!name || name.toLowerCase() === "instagram") {
    name = cleanHandle;
  }

  // Extract Bio if present in meta description (e.g. on Instagram: "I build stuff")
  let bio = "";
  const bioMatch = rawDesc.match(/on Instagram:\s*["“]([\s\S]*?)["”]$/i);
  if (bioMatch && bioMatch[1]) {
    bio = bioMatch[1].trim();
  }

  return {
    handle: cleanHandle,
    name,
    avatarUrl,
    followers: followersMatch ? parseFormattedNumber(followersMatch[1]) : 0,
    following: followingMatch ? parseFormattedNumber(followingMatch[1]) : 0,
    posts: postsMatch ? parseFormattedNumber(postsMatch[1]) : 0,
    biography: bio,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const handle = searchParams.get("handle");

  if (!handle) {
    return new Response(JSON.stringify({ error: "Missing handle parameter" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // 1. Meta Graph API if configured
    if (process.env.META_ACCESS_TOKEN) {
      try {
        const metaProfile = await fetchBusinessDiscovery(
          handle,
          process.env.META_ACCESS_TOKEN
        );
        return Response.json({
          success: true,
          profile: {
            handle: metaProfile.username,
            name: metaProfile.name,
            avatarUrl: metaProfile.profile_picture_url
              ? `/api/instagram/avatar?url=${encodeURIComponent(metaProfile.profile_picture_url)}`
              : null,
            followers: metaProfile.followers_count,
            following: metaProfile.follows_count,
            posts: metaProfile.media_count,
            biography: metaProfile.biography,
          },
        });
      } catch (metaErr) {
        console.warn("Meta Business Discovery fallback to public scraper:", metaErr);
      }
    }

    // 2. Direct public scraper
    const publicProfile = await scrapePublicInstagramProfile(handle);
    return Response.json({ success: true, profile: publicProfile });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("Profile extraction error:", errorMsg);
    const cleanHandle = handle.replace(/^@/, "").trim();
    return Response.json({
      success: false,
      error: errorMsg,
      profile: {
        handle: cleanHandle,
        name: cleanHandle.charAt(0).toUpperCase() + cleanHandle.slice(1),
        avatarUrl: null,
        followers: 0,
        following: 0,
        posts: 0,
        biography: "",
      },
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, handle, mode } = body;

    const accessToken = token || process.env.META_ACCESS_TOKEN;

    if (accessToken && mode === "discovery" && handle) {
      const profile = await fetchBusinessDiscovery(handle, accessToken);
      return Response.json({ success: true, profile });
    } else if (accessToken) {
      const profile = await fetchMetaUserProfile(accessToken);
      return Response.json({ success: true, profile });
    }

    if (handle) {
      const profile = await scrapePublicInstagramProfile(handle);
      return Response.json({ success: true, profile });
    }

    return new Response(
      JSON.stringify({ error: "Missing handle or token" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("Meta/Public API error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
