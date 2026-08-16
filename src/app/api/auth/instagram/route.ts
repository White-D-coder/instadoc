import { NextResponse } from "next/server";

export async function GET() {
  const appId = process.env.META_APP_ID || process.env.NEXT_PUBLIC_META_APP_ID;
  const redirectUri =
    process.env.META_REDIRECT_URI ||
    process.env.NEXT_PUBLIC_META_REDIRECT_URI ||
    "http://localhost:3000/api/auth/instagram/callback";

  if (!appId) {
    return NextResponse.json(
      {
        error:
          "META_APP_ID is not configured in .env.local. Please add META_APP_ID and META_APP_SECRET.",
      },
      { status: 400 }
    );
  }

  const scope = "instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement";
  const authUrl = `https://www.facebook.com/v20.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${encodeURIComponent(scope)}&response_type=code`;

  return NextResponse.redirect(authUrl);
}
