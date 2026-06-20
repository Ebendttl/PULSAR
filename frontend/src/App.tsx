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
            background: "var(--bg-primary)",
            color: "var(--text-primary)",
          }}
        >
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.75rem",
              marginBottom: "16px",
              color: "var(--text-primary)",
            }}
          >
            SIGNAL LOST
          </h1>
          <p style={{ color: "var(--text-muted)", maxWidth: "500px", lineHeight: 1.6 }}>
            Something went wrong in the cosmic void. Please refresh to
            re-establish connection.
          </p>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.8rem",
              color: "var(--error)",
              marginTop: "16px",
            }}
          >
            {this.state.error?.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
            style={{
              marginTop: "24px",
              width: "auto",
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
            style={{ color: "var(--accent-primary)" }}
          >
            Sui
          </a>{" "}
          &{" "}
          <a
            href="https://walrus.space"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--accent-secondary)" }}
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
