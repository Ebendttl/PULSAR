import React from "react";
import { Header } from "./components/Header";
import { CollectionBanner } from "./components/CollectionBanner";
import { MintCard } from "./components/MintCard";
import { NFTGallery } from "./components/NFTGallery";
import { useCollection } from "./hooks/useCollection";

// ── Error Boundary ─────────────────────────────────────────────────────────
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("PULSAR Error Boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            padding: "40px",
            textAlign: "center",
            background: "#03000f",
            color: "#f0e8ff",
          }}
        >
          <h1
            style={{
              fontFamily: "Orbitron, sans-serif",
              fontSize: "2rem",
              marginBottom: "16px",
              background: "linear-gradient(135deg, #7b2fff, #ff9f1c)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            SIGNAL LOST
          </h1>
          <p style={{ color: "#6b4a9b", maxWidth: "500px", lineHeight: 1.6 }}>
            Something went wrong in the cosmic void. Please refresh to
            re-establish connection.
          </p>
          <p
            style={{
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: "0.8rem",
              color: "#ff4466",
              marginTop: "16px",
            }}
          >
            {this.state.error?.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "24px",
              padding: "12px 24px",
              background: "linear-gradient(135deg, #7b2fff, #5a1fcc)",
              border: "none",
              borderRadius: "12px",
              color: "white",
              fontFamily: "Syne, sans-serif",
              fontSize: "0.95rem",
              fontWeight: 600,
              cursor: "pointer",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Reconnect
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// ── Main App ───────────────────────────────────────────────────────────────
function AppContent() {
  const { collection, refetch } = useCollection();

  return (
    <>
      <Header />
      <main>
        <CollectionBanner collection={collection} />
        <MintCard onMintSuccess={refetch} />
        <NFTGallery />
      </main>
      <footer className="footer">
        <p>
          PULSAR © 2026 — Powered by{" "}
          <a
            href="https://sui.io"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#7b2fff" }}
          >
            Sui
          </a>{" "}
          &{" "}
          <a
            href="https://walrus.space"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#ff9f1c" }}
          >
            Walrus
          </a>
        </p>
      </footer>
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
