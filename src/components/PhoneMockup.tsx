"use client";

import { useState } from "react";

interface PhoneMockupProps {
  handle: string;
  name: string;
  bio: string;
  avatarUrl?: string | null;
  followers?: number;
  following?: number;
  posts?: number;
}

export default function PhoneMockup({
  handle,
  name,
  bio,
  avatarUrl,
  followers,
  following,
  posts,
}: PhoneMockupProps) {
  const [imgError, setImgError] = useState(false);

  const formatNumber = (num?: number) => {
    if (num === undefined || num === null) return "—";
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    return num.toString();
  };

  return (
    <div className="phone-mockup">
      {/* Status bar / header */}
      <div className="phone-mockup-header">
        <span style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)" }}>
          ◀
        </span>
        <span className="phone-mockup-username">@{handle}</span>
        <span style={{ fontSize: "0.875rem", color: "var(--color-text-tertiary)" }}>
          ⋯
        </span>
      </div>

      {/* Profile section */}
      <div className="phone-mockup-profile">
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", marginBottom: "var(--space-3)" }}>
          <div className="phone-mockup-avatar" style={{ overflow: "hidden", position: "relative", flexShrink: 0 }}>
            {avatarUrl && !imgError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={handle}
                onError={() => setImgError(true)}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "50%",
                }}
              />
            ) : (
              handle.charAt(0).toUpperCase()
            )}
          </div>

          <div className="phone-mockup-stats" style={{ flex: 1, margin: 0, justifyContent: "space-around" }}>
            <div className="phone-mockup-stat">
              <div className="phone-mockup-stat-value">{formatNumber(posts)}</div>
              <div className="phone-mockup-stat-label">Posts</div>
            </div>
            <div className="phone-mockup-stat">
              <div className="phone-mockup-stat-value">{formatNumber(followers)}</div>
              <div className="phone-mockup-stat-label">Followers</div>
            </div>
            <div className="phone-mockup-stat">
              <div className="phone-mockup-stat-value">{formatNumber(following)}</div>
              <div className="phone-mockup-stat-label">Following</div>
            </div>
          </div>
        </div>

        <div className="phone-mockup-name">{name || handle}</div>
        <div className="phone-mockup-bio" style={{ whiteSpace: "pre-line" }}>
          {bio}
        </div>

        {/* CTA button mockup */}
        <div
          style={{
            marginTop: "var(--space-4)",
            display: "flex",
            gap: "var(--space-2)",
          }}
        >
          <div
            style={{
              flex: 1,
              padding: "var(--space-2)",
              background: "var(--color-bg-subtle)",
              borderRadius: "var(--radius-sm)",
              textAlign: "center",
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "var(--color-text-primary)",
            }}
          >
            Follow
          </div>
          <div
            style={{
              flex: 1,
              padding: "var(--space-2)",
              background: "var(--color-bg-subtle)",
              borderRadius: "var(--radius-sm)",
              textAlign: "center",
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "var(--color-text-primary)",
            }}
          >
            Message
          </div>
        </div>
      </div>
    </div>
  );
}
