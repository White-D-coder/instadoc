import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const errorReason = url.searchParams.get("error_description");

  if (error || !code) {
    const errorMsg = encodeURIComponent(errorReason || error || "Authentication cancelled");
    return NextResponse.redirect(new URL(`/?auth_error=${errorMsg}`, request.url));
  }

  const appId = process.env.META_APP_ID || process.env.NEXT_PUBLIC_META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  const redirectUri =
    process.env.META_REDIRECT_URI ||
    process.env.NEXT_PUBLIC_META_REDIRECT_URI ||
    "http://localhost:3000/api/auth/instagram/callback";

  try {
    // Exchange auth code for Meta access token
    const tokenUrl = `https://graph.facebook.com/v20.0/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&code=${code}`;

    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      throw new Error(tokenData.error?.message || "Failed to obtain access token from Meta");
    }

    const shortLivedToken = tokenData.access_token;

    // Exchange for long-lived token (60 days validity)
    const longLivedUrl = `https://graph.facebook.com/v20.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortLivedToken}`;
    const longLivedRes = await fetch(longLivedUrl);
    const longLivedData = await longLivedRes.json();

    const accessToken = longLivedData.access_token || shortLivedToken;

    // Redirect user back to home with token param (client will save to localStorage)
    return NextResponse.redirect(
      new URL(`/?meta_token=${encodeURIComponent(accessToken)}&auth_success=true`, request.url)
    );
  } catch (err: unknown) {
    const errorMsg = encodeURIComponent(err instanceof Error ? err.message : "OAuth token exchange failed");
    return NextResponse.redirect(new URL(`/?auth_error=${errorMsg}`, request.url));
  }
}
