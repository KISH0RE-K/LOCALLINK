import { useState } from "react";
import "./NameEntry.css";

function NameEntry({ onNameSet }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter a name to continue.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:3000/username", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: trimmed }),
      });
      if (!res.ok) throw new Error("Failed to set username");
      onNameSet(trimmed);
    } catch {
      setError("Could not connect to LocalLink server. Make sure it's running.");
      setLoading(false);
    }
  }

  return (
    <div className="name-entry-bg">
      {/* Animated orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div className="name-entry-card">
        <div className="name-entry-logo">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="20" fill="url(#grad)" />
            <path
              d="M12 26 L20 14 L28 26"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <circle cx="12" cy="26" r="2.5" fill="white" />
            <circle cx="28" cy="26" r="2.5" fill="white" />
            <circle cx="20" cy="14" r="2.5" fill="white" />
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="40" y2="40">
                <stop offset="0%" stopColor="#7c6aff" />
                <stop offset="100%" stopColor="#4f8aff" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <h1 className="name-entry-title">LocalLink</h1>
        <p className="name-entry-subtitle">
          Chat securely with devices on your local network.
          <br />What should others call you?
        </p>

        <form className="name-entry-form" onSubmit={handleSubmit}>
          <div className="name-entry-field">
            <label className="name-entry-label" htmlFor="username-input">
              Your display name
            </label>
            <input
              id="username-input"
              className="name-entry-input"
              type="text"
              placeholder="e.g. Alice, Bob, Dev Machine…"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              maxLength={32}
              autoFocus
              autoComplete="off"
            />
            <span className="name-entry-counter">{name.length}/32</span>
          </div>

          {error && <p className="name-entry-error">{error}</p>}

          <button
            id="join-btn"
            type="submit"
            className="name-entry-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="btn-spinner" />
            ) : (
              <>
                <span>Join Network</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3 8h10M9 4l4 4-4 4"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </>
            )}
          </button>
        </form>

        <p className="name-entry-footer">
          🔒 Your data never leaves your local network
        </p>
      </div>
    </div>
  );
}

export default NameEntry;
