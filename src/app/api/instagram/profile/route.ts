import { NextRequest } from "next/server";
import { fetchMetaUserProfile, fetchBusinessDiscovery } from "@/lib/meta-api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, handle, mode } = body;

    const accessToken = token || process.env.META_ACCESS_TOKEN;

    if (!accessToken) {
      return new Response(
        JSON.stringify({
          error: "No Meta Access Token provided. Please connect with Instagram or provide an access token.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (mode === "discovery" && handle) {
      // Look up target handle via Business Discovery API
      const profile = await fetchBusinessDiscovery(handle, accessToken);
      return Response.json({ success: true, profile });
    } else {
      // Look up authenticated user profile
      const profile = await fetchMetaUserProfile(accessToken);
      return Response.json({ success: true, profile });
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("Meta Graph API error:", errorMessage);
    return new Response(
      JSON.stringify({
        error: errorMessage || "Failed to extract Instagram data from Meta Graph API",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
