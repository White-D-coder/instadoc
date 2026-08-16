import { NextRequest } from "next/server";
import { fetchMetaUserProfile, fetchBusinessDiscovery } from "@/lib/meta-api";

function parseFormattedNumber(str: string): number {
  if (!str) return 0;
  const clean = str.replace(/,/g, "").trim().toUpperCase();
  if (clean.endsWith("M")) return Math.round(parseFloat(clean) * 1000000);
  if (clean.endsWith("K")) return Math.round(parseFloat(clean) * 1000);
  return parseInt(clean, 10) || 0;
}

async function scrapePublicInstagramProfile(handle: string) {
  const cleanHandle = handle.replace(/^@/, "").trim().toLowerCase();
  const url = `https://www.instagram.com/${cleanHandle}/`;

  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`Instagram returned status ${res.status}`);
  }

  const html = await res.text();

  // Extract og:image
  const ogImageMatch =
    html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i) ||
    html.match(/<meta[^>]*content="([^"]+)"[^>]*property="og:image"/i);
  const rawImage = ogImageMatch ? ogImageMatch[1] || ogImageMatch[2] : null;
  const avatarUrl = rawImage
    ? `/api/instagram/avatar?url=${encodeURIComponent(rawImage.replace(/&amp;/g, "&"))}`
    : null;

  // Extract og:description for stats
  const descMatch =
    html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]+)"/i) ||
    html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i);
  const desc = descMatch ? descMatch[1] : "";

  // Extract og:title for name
  const titleMatch =
    html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i) ||
    html.match(/<title>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1] : "";

  const followersMatch = desc.match(/([0-9.,KMkm]+)\s+Followers/i);
  const followingMatch = desc.match(/([0-9.,KMkm]+)\s+Following/i);
  const postsMatch = desc.match(/([0-9.,KMkm]+)\s+Posts/i);

  const nameMatch = title.match(/^([^(•]+)/);
  const name = nameMatch
    ? nameMatch[1].replace(/&#064;.*/, "").replace(/&amp;/g, "&").trim()
    : cleanHandle;

  return {
    handle: cleanHandle,
    name: name || cleanHandle,
    avatarUrl,
    followers: followersMatch ? parseFormattedNumber(followersMatch[1]) : 0,
    following: followingMatch ? parseFormattedNumber(followingMatch[1]) : 0,
    posts: postsMatch ? parseFormattedNumber(postsMatch[1]) : 0,
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
    // 1. If Meta Access Token is available, attempt official Business Discovery
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

    // 2. Direct public metadata extraction
    const publicProfile = await scrapePublicInstagramProfile(handle);
    return Response.json({ success: true, profile: publicProfile });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("Profile extraction error:", errorMsg);
    return new Response(
      JSON.stringify({
        error: errorMsg,
        profile: {
          handle: handle.replace(/^@/, ""),
          name: handle.replace(/^@/, ""),
          avatarUrl: null,
          followers: 0,
          following: 0,
          posts: 0,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
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
