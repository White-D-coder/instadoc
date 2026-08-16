/**
 * Meta / Instagram Graph API Service
 * Supports Instagram Login (User Token) and Business Discovery API
 */

export interface MetaProfileData {
  id: string;
  username: string;
  name?: string;
  biography?: string;
  followers_count?: number;
  follows_count?: number;
  media_count?: number;
  profile_picture_url?: string;
  website?: string;
  recentMedia?: Array<{
    id: string;
    caption?: string;
    media_type: string;
    media_url?: string;
    permalink: string;
    like_count?: number;
    comments_count?: number;
    timestamp: string;
  }>;
}

/**
 * Fetch profile details for the authenticated user
 */
export async function fetchMetaUserProfile(accessToken: string): Promise<MetaProfileData> {
  // First, fetch basic user profile
  const profileUrl = `https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${accessToken}`;
  const profileRes = await fetch(profileUrl);

  if (!profileRes.ok) {
    // If it's a Facebook Graph API token with Instagram Business Account
    return await fetchFacebookGraphUserProfile(accessToken);
  }

  const profile = await profileRes.json();

  // Fetch recent media
  let recentMedia = [];
  try {
    const mediaUrl = `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,timestamp&limit=10&access_token=${accessToken}`;
    const mediaRes = await fetch(mediaUrl);
    if (mediaRes.ok) {
      const mediaData = await mediaRes.json();
      recentMedia = mediaData.data || [];
    }
  } catch (e) {
    console.error("Error fetching media from Instagram Graph API:", e);
  }

  return {
    id: profile.id,
    username: profile.username,
    media_count: profile.media_count,
    recentMedia,
  };
}

/**
 * Fallback to Facebook Graph API for Instagram Business Accounts
 */
async function fetchFacebookGraphUserProfile(accessToken: string): Promise<MetaProfileData> {
  // Fetch Instagram accounts linked to user's Facebook pages
  const pagesUrl = `https://graph.facebook.com/v20.0/me/accounts?fields=id,name,instagram_business_account{id,username,name,biography,followers_count,follows_count,media_count,profile_picture_url,website}&access_token=${accessToken}`;
  const pagesRes = await fetch(pagesUrl);

  if (!pagesRes.ok) {
    const err = await pagesRes.json();
    throw new Error(err.error?.message || "Failed to fetch profile from Meta Graph API");
  }

  const pagesData = await pagesRes.json();
  const pageWithIg = pagesData.data?.find((p: { instagram_business_account?: unknown }) => p.instagram_business_account);

  if (!pageWithIg || !pageWithIg.instagram_business_account) {
    throw new Error("No connected Instagram Business/Creator account found for this Meta token.");
  }

  const ig = pageWithIg.instagram_business_account;

  // Fetch media from Instagram Business account
  let recentMedia = [];
  try {
    const mediaUrl = `https://graph.facebook.com/v20.0/${ig.id}/media?fields=id,caption,media_type,media_url,permalink,like_count,comments_count,timestamp&limit=10&access_token=${accessToken}`;
    const mediaRes = await fetch(mediaUrl);
    if (mediaRes.ok) {
      const mediaData = await mediaRes.json();
      recentMedia = mediaData.data || [];
    }
  } catch (e) {
    console.error("Error fetching business media:", e);
  }

  return {
    id: ig.id,
    username: ig.username,
    name: ig.name,
    biography: ig.biography,
    followers_count: ig.followers_count,
    follows_count: ig.follows_count,
    media_count: ig.media_count,
    profile_picture_url: ig.profile_picture_url,
    website: ig.website,
    recentMedia,
  };
}

/**
 * Query another public Instagram business account via Business Discovery API
 */
export async function fetchBusinessDiscovery(
  targetHandle: string,
  accessToken: string,
  userInstagramAccountId?: string
): Promise<MetaProfileData> {
  const cleanHandle = targetHandle.toLowerCase().replace(/^@/, "");
  
  // If account ID not provided, discover the user's connected IG account ID first
  let igAccountId = userInstagramAccountId;
  if (!igAccountId) {
    const pagesUrl = `https://graph.facebook.com/v20.0/me/accounts?fields=instagram_business_account{id}&access_token=${accessToken}`;
    const pagesRes = await fetch(pagesUrl);
    if (!pagesRes.ok) throw new Error("Could not find Instagram Business Account ID for Business Discovery");
    const data = await pagesRes.json();
    const found = data.data?.find((p: { instagram_business_account?: { id: string } }) => p.instagram_business_account?.id);
    if (!found) throw new Error("Business Discovery requires a connected Instagram Business/Creator Account.");
    igAccountId = found.instagram_business_account.id;
  }

  const discoveryUrl = `https://graph.facebook.com/v20.0/${igAccountId}?fields=business_discovery.username(${cleanHandle}){id,username,name,biography,followers_count,follows_count,media_count,profile_picture_url,website,media.limit(10){id,caption,media_type,like_count,comments_count,timestamp,permalink}}&access_token=${accessToken}`;
  
  const discoveryRes = await fetch(discoveryUrl);
  if (!discoveryRes.ok) {
    const err = await discoveryRes.json();
    throw new Error(err.error?.message || `Failed to discover public data for @${cleanHandle}`);
  }

  const discoveryData = await discoveryRes.json();
  const target = discoveryData.business_discovery;

  return {
    id: target.id,
    username: target.username,
    name: target.name,
    biography: target.biography,
    followers_count: target.followers_count,
    follows_count: target.follows_count,
    media_count: target.media_count,
    profile_picture_url: target.profile_picture_url,
    website: target.website,
    recentMedia: target.media?.data || [],
  };
}
