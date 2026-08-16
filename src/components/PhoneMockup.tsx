"use client";

interface PhoneMockupProps {
  handle: string;
  name: string;
  bio: string;
  followers?: number;
  following?: number;
  posts?: number;
}

export default function PhoneMockup({
  handle,
  name,
  bio,
  followers,
  following,
  posts,
}: PhoneMockupProps) {
  const formatNumber = (num?: number) => {
    if (num === undefined || num === null) return "—";
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
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
        <div className="phone-mockup-avatar">
          {handle.charAt(0).toUpperCase()}
        </div>

        <div className="phone-mockup-stats">
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

        <div className="phone-mockup-name">{name}</div>
        <div className="phone-mockup-bio">{bio}</div>

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
