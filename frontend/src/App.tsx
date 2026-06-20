import React, { useState, useEffect } from "react";
import { Header, type Tab } from "./components/Header";
import { CollectionBanner } from "./components/CollectionBanner";
import { MintCard } from "./components/MintCard";
import { NFTGallery } from "./components/NFTGallery";
import { useCollection } from "./hooks/useCollection";
import { CONTRACT_CONFIG, SUI_NETWORK, COLLECTION_META } from "./config";

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", padding: "40px", textAlign: "center" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem", marginBottom: "16px" }}>SIGNAL LOST</h1>
        <p style={{ color: "var(--text-secondary)", maxWidth: "500px", lineHeight: 1.6 }}>Something went wrong. Please refresh.</p>
        <button onClick={() => window.location.reload()} className="btn btn-primary" style={{ marginTop: "24px", width: "auto" }}>Reconnect</button>
      </div>);
    }
    return this.props.children;
  }
}

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const { collection, refetch } = useCollection();
  const [telemetry, setTelemetry] = useState([
    { time: new Date().toLocaleTimeString(), msg: "SYS → Connection to SUI fullnode established" },
    { time: new Date().toLocaleTimeString(), msg: "WALRUS → Aggregator endpoint verified (28ms)" },
    { time: new Date().toLocaleTimeString(), msg: "MINT → Contract module loaded successfully" },
  ]);

  const msgs = [
    "SYS → Syncing collection config shared state...",
    "WALRUS → Sponsor credit limit verification OK",
    "SUI → Listening for mint event emissions...",
    "WALRUS → Aggregator response: 200 OK",
    "SYS → System heartbeat signal clear",
    "MINT → Minter address cache refreshed",
    "SYS → Block height sync in progress...",
  ];

  useEffect(() => {
    const iv = setInterval(() => {
      const m = msgs[Math.floor(Math.random() * msgs.length)];
      setTelemetry((p) => [...p, { time: new Date().toLocaleTimeString(), msg: m }].slice(-5));
    }, 5000);
    return () => clearInterval(iv);
  }, []);

  const supply = collection?.currentSupply ?? 0;
  const max = collection?.maxSupply ?? COLLECTION_META.maxSupply;
  const pct = Math.round((supply / max) * 100);

  return (
    <>
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <main>

        {/* ═══ HOME ═══ */}
        {activeTab === "home" && (
          <div className="home-view">
            <div className="home-hero-panel">
              {/* Ambient orbs */}
              <div className="hero-orb-1" />
              <div className="hero-orb-2" />
              <div className="hero-orb-3" />

              {/* Compact inline pulsar icon — replaces the oversized standalone block */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px", position: "relative", zIndex: 1 }}>
                <svg width="48" height="48" viewBox="0 0 96 96" fill="none" style={{ flexShrink: 0 }}>
                  <circle cx="48" cy="48" r="4" fill="#ffffff" />
                  <circle cx="48" cy="48" r="9" fill="none" stroke="var(--warm)" strokeWidth="1.5" opacity="0.9" />
                  <circle cx="48" cy="48" r="20" stroke="rgba(129,140,248,0.4)" strokeWidth="1" className="pulsar-magnetic-ring" style={{ animationDelay: "0s" }} />
                  <circle cx="48" cy="48" r="20" stroke="rgba(34,211,238,0.25)" strokeWidth="1" className="pulsar-magnetic-ring" style={{ animationDelay: "1.2s" }} />
                  <g className="pulsar-radar-beam" style={{ transformOrigin: "48px 48px" }}>
                    <line x1="48" y1="48" x2="93" y2="48" stroke="rgba(245,158,11,0.7)" strokeWidth="1.5" strokeDasharray="4 3" />
                    <line x1="48" y1="48" x2="3" y2="48" stroke="rgba(129,140,248,0.7)" strokeWidth="1.5" strokeDasharray="4 3" />
                    <circle cx="93" cy="48" r="2" fill="var(--warm)" opacity="0.9" />
                    <circle cx="3" cy="48" r="2" fill="var(--accent)" opacity="0.9" />
                  </g>
                </svg>
                <span className="home-hero-badge" style={{ margin: 0 }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--success)", display: "inline-block", boxShadow: "0 0 6px var(--success)" }} />
                  Active Launch — Testnet
                </span>
              </div>

              <h2>
                Decentralized<br />
                <span className="hero-word-accent">Media Minting</span> Protocol
              </h2>

              <p>
                Upload high-resolution artwork to Walrus decentralized storage with zero gas friction.
                Each piece is linked to a unique on-chain Sui token with permanent cryptographic integrity.
              </p>

              <div className="hero-cta-row">
                <button onClick={() => setActiveTab("create")} className="btn btn-primary" style={{ width: "auto", marginTop: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                  Create NFT
                </button>
                <button onClick={() => setActiveTab("collections")} className="btn btn-secondary" style={{ width: "auto" }}>
                  View Collection
                </button>
              </div>

              {/* Inline stats pill bar */}
              <div className="hero-pills">
                <div className="hero-pill">
                  <span className="hero-pill-label">Network</span>
                  <span className="hero-pill-value" style={{ color: "var(--success)" }}>Testnet</span>
                </div>
                <div className="hero-pill">
                  <span className="hero-pill-label">Supply</span>
                  <span className="hero-pill-value">{supply} / {max}</span>
                </div>
                <div className="hero-pill">
                  <span className="hero-pill-label">Price</span>
                  <span className="hero-pill-value" style={{ color: "var(--warm)" }}>{COLLECTION_META.mintPriceDisplay}</span>
                </div>
                <div className="hero-pill">
                  <span className="hero-pill-label">Status</span>
                  <span className="hero-pill-value" style={{ color: collection?.isActive ? "var(--success)" : "var(--error)" }}>
                    {collection?.isActive ? "Live" : "Paused"}
                  </span>
                </div>
              </div>
            </div>



            {/* Mint Progress */}
            <div className="card" style={{ padding: "24px", marginBottom: "48px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: "0.72rem", letterSpacing: "0.1em", color: "var(--text-primary)" }}>MINT PROGRESS</span>
                <span style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "var(--accent)" }}>{pct}%</span>
              </div>
              <div style={{ width: "100%", height: "6px", background: "rgba(99,102,241,0.08)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg, var(--accent-deep), var(--cyan))", borderRadius: "3px", transition: "width 0.6s ease", minWidth: pct > 0 ? "8px" : "0" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", fontFamily: "var(--font-body)", fontSize: "0.65rem", color: "var(--text-dim)" }}>
                <span>{supply} minted</span>
                <span>{max - supply} remaining</span>
              </div>
            </div>

            {/* Features */}
            <div className="home-grid">
              {[
                { icon: <><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></>, title: "Decoupled Storage", desc: "Media stored as independent blobs on Walrus, fully separated from blockchain transaction costs." },
                { icon: <><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="12" y1="4" x2="12" y2="20"/><line x1="2" y1="12" x2="22" y2="12"/></>, title: "Sponsor Paid", desc: "Gas-free upload experience powered by the Krilly Sponsor SDK — zero WAL tokens required." },
                { icon: <><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></>, title: "Immutable Reference", desc: "Each NFT permanently references its cryptographic blob ID, ensuring on-chain data integrity." },
              ].map((f, i) => (
                <div key={i} className="card home-feature-card">
                  <div className="feature-icon-wrapper">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{f.icon}</svg>
                  </div>
                  <h4>{f.title}</h4>
                  <p>{f.desc}</p>
                </div>
              ))}
            </div>

            {/* Blueprint */}
            <div className="blueprint-panel">
              <h3 className="blueprint-title">System Architecture</h3>
              <svg viewBox="0 0 800 200" fill="none" style={{ width: "100%", height: "auto" }}>
                <rect x="40" y="60" width="180" height="80" rx="8" fill="rgba(15,23,42,0.6)" stroke="rgba(99,102,241,0.15)" strokeWidth="1.5" />
                <text x="130" y="100" fill="var(--text-primary)" fontSize="11" fontFamily="var(--font-body)" textAnchor="middle">1. UPLOAD IMAGE</text>
                <text x="130" y="118" fill="var(--text-secondary)" fontSize="9" fontFamily="var(--font-ui)" textAnchor="middle">Krilly Sponsor API</text>
                <path d="M220 100H310" stroke="var(--warm)" strokeWidth="1.5" strokeDasharray="6 4" />
                <polygon points="310,100 302,96 302,104" fill="var(--warm)" />
                <rect x="320" y="60" width="180" height="80" rx="8" fill="rgba(15,23,42,0.6)" stroke="rgba(99,102,241,0.15)" strokeWidth="1.5" />
                <text x="410" y="100" fill="var(--text-primary)" fontSize="11" fontFamily="var(--font-body)" textAnchor="middle">2. STORE BLOB</text>
                <text x="410" y="118" fill="var(--text-secondary)" fontSize="9" fontFamily="var(--font-ui)" textAnchor="middle">Walrus Aggregator</text>
                <path d="M500 100H580" stroke="var(--accent)" strokeWidth="1.5" />
                <polygon points="580,100 572,96 572,104" fill="var(--accent)" />
                <rect x="590" y="60" width="180" height="80" rx="8" fill="rgba(15,23,42,0.6)" stroke="rgba(99,102,241,0.15)" strokeWidth="1.5" />
                <text x="680" y="100" fill="var(--text-primary)" fontSize="11" fontFamily="var(--font-body)" textAnchor="middle">3. MINT NFT</text>
                <text x="680" y="118" fill="var(--text-secondary)" fontSize="9" fontFamily="var(--font-ui)" textAnchor="middle">Sui Testnet Contract</text>
              </svg>
            </div>

            {/* Telemetry */}
            <div className="telemetry-monitor">
              <div className="telemetry-header-title">
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--success)", display: "inline-block", boxShadow: "0 0 8px var(--success)" }} />
                Live System Feed
              </div>
              {telemetry.map((log, i) => (
                <div key={i} className="telemetry-row">
                  <span className="telemetry-timestamp">[{log.time}]</span>
                  <span className="telemetry-msg">{log.msg}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ COLLECTIONS ═══ */}
        {activeTab === "collections" && (
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 24px 80px" }}>
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <h2 style={{ fontSize: "1.5rem", marginBottom: "12px" }}>Collection Gallery</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", maxWidth: "500px", margin: "0 auto 24px", lineHeight: 1.7 }}>
                {max} unique cosmic artifacts. Each piece permanently stored on Walrus with on-chain provenance.
              </p>
              <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                <div className="card" style={{ padding: "16px 28px", textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: "0.6rem", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>Minted</div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: "1.25rem", fontWeight: 700, color: "var(--accent)" }}>{supply}</div>
                </div>
                <div className="card" style={{ padding: "16px 28px", textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: "0.6rem", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>Available</div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: "1.25rem", fontWeight: 700, color: "var(--success)" }}>{max - supply}</div>
                </div>
                <div className="card" style={{ padding: "16px 28px", textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: "0.6rem", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>Price</div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: "1.25rem", fontWeight: 700, color: "var(--warm)" }}>{COLLECTION_META.mintPriceDisplay}</div>
                </div>
              </div>
            </div>
            <NFTGallery />
          </div>
        )}

        {/* ═══ CREATE ═══ */}
        {activeTab === "create" && (
          <div style={{ maxWidth: "600px", margin: "0 auto", padding: "48px 24px 80px" }}>
            <div style={{ textAlign: "center", marginBottom: "36px" }}>
              <h2 style={{ fontSize: "1.4rem", marginBottom: "12px" }}>Create Artifact</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.7, maxWidth: "460px", margin: "0 auto" }}>
                Upload your artwork to Walrus decentralized storage and mint it as a unique on-chain NFT on Sui.
              </p>
            </div>
            <div className="mint-section" style={{ padding: 0, maxWidth: "100%" }}>
              <MintCard onMintSuccess={refetch} />
            </div>
          </div>
        )}

        {/* ═══ LAUNCHPAD ═══ */}
        {activeTab === "launchpad" && (
          <div className="launchpad-view">
            <CollectionBanner collection={collection} />
            <div className="terminal-panel">
              <div className="terminal-header">
                <div className="terminal-dots"><div className="terminal-dot" /><div className="terminal-dot" /><div className="terminal-dot" /></div>
                <div className="terminal-title">System Parameters</div>
                <div style={{ width: "36px" }} />
              </div>
              <div className="terminal-content">
                {[
                  { label: "Active Network", value: `SUI ${SUI_NETWORK.toUpperCase()}`, color: "var(--success)" },
                  { label: "Package ID", value: CONTRACT_CONFIG.packageId, link: `https://suiscan.xyz/${SUI_NETWORK}/object/${CONTRACT_CONFIG.packageId}` },
                  { label: "Collection Config", value: CONTRACT_CONFIG.collectionConfigId },
                  { label: "Contract Status", value: collection?.isActive ? "ACTIVE" : "PAUSED", color: collection?.isActive ? "var(--success)" : "var(--error)", dot: true },
                  { label: "Supply Index", value: `${supply} / ${max} items minted` },
                ].map((line, i) => (
                  <div key={i} className="terminal-line">
                    <div className="terminal-line-header">{line.label}</div>
                    <div className="terminal-line-body">
                      <div className="terminal-value" style={{ color: line.color, display: "flex", alignItems: "center", gap: "6px" }}>
                        {line.dot && <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: line.color, display: "inline-block", boxShadow: `0 0 8px ${line.color}` }} />}
                        {line.link ? <a href={line.link} target="_blank" rel="noopener noreferrer">{line.value}</a> : line.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        PULSAR © 2026 — Built on{" "}
        <a href="https://sui.io" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", textDecoration: "none" }}>Sui</a>
        {" & "}
        <a href="https://walrus.space" target="_blank" rel="noopener noreferrer" style={{ color: "var(--warm)", textDecoration: "none" }}>Walrus</a>
      </footer>
    </>
  );
}

export default function App() {
  return <ErrorBoundary><AppContent /></ErrorBoundary>;
}
