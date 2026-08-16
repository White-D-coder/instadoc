"use client";

interface HeaderProps {
  onLogoClick: () => void;
}

export default function Header({ onLogoClick }: HeaderProps) {
  return (
    <header className="header">
      <div className="container">
        <button className="header-logo" onClick={onLogoClick} type="button">
          <span className="header-logo-icon">📋</span>
          InstaDoc
        </button>
        <nav className="header-nav">
          <a href="#how-it-works">How It Works</a>
          <a href="#features">Features</a>
          <button
            type="button"
            className="btn btn-primary"
            style={{
              fontSize: "0.8125rem",
              padding: "var(--space-2) var(--space-4)",
            }}
            onClick={onLogoClick}
          >
            + New Audit
          </button>
        </nav>
      </div>
    </header>
  );
}
