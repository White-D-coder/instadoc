"use client";

interface HeaderProps {
  onLogoClick: () => void;
}

export default function Header({ onLogoClick }: HeaderProps) {
  return (
    <header className="header">
      <div className="container">
        <button className="header-logo" onClick={onLogoClick} type="button">
          <span className="header-logo-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </span>
          InstaDoc
        </button>
        <nav className="header-nav">
          <button
            type="button"
            className="btn btn-primary"
            style={{
              fontSize: "0.8125rem",
              padding: "var(--space-2) var(--space-4)",
            }}
            onClick={onLogoClick}
          >
            New Audit
          </button>
        </nav>
      </div>
    </header>
  );
}
