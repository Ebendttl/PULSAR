import { COLLECTION_META, WALRUS_AGGREGATOR } from "../config";

function renderPlaceholderSVG() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity: 0.25 }}
    >
      <circle cx="32" cy="32" r="5" fill="var(--text-primary)" />
      <circle cx="32" cy="32" r="16" stroke="var(--text-muted)" strokeWidth="1" strokeDasharray="3 3" />
      <circle cx="32" cy="32" r="26" stroke="var(--text-muted)" strokeWidth="0.75" strokeDasharray="4 4" />
      <line x1="32" y1="4" x2="32" y2="60" stroke="var(--text-muted)" strokeWidth="0.5" strokeDasharray="2 2" />
      <line x1="4" y1="32" x2="60" y2="32" stroke="var(--text-muted)" strokeWidth="0.5" strokeDasharray="2 2" />
    </svg>
  );
}

// Demo NFTs for gallery display
const DEMO_NFTS = [
  { number: 1, name: "Cosmic Pulse Alpha", blobId: "" },
  { number: 2, name: "Neutron Blaze", blobId: "" },
  { number: 3, name: "Void Signal", blobId: "" },
  { number: 4, name: "Radio Sweep Omega", blobId: "" },
];

export function NFTGallery() {
  const maxSupply = COLLECTION_META.maxSupply;

  return (
    <section className="gallery" id="nft-gallery">
      <div className="gallery-grid">
        {DEMO_NFTS.map((nft) => {
          const hasImage = nft.blobId.length > 0;
          const imageUrl = hasImage
            ? `${WALRUS_AGGREGATOR}/${nft.blobId}`
            : undefined;

          return (
            <div key={nft.number} className="nft-card">
              <span className="nft-card-badge">#{nft.number}</span>
              <div
                style={{
                  width: "100%",
                  aspectRatio: "1",
                  background: hasImage
                    ? `url(${imageUrl}) center/cover`
                    : generateCosmicGradient(nft.number),
                  position: "relative",
                  zIndex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {!hasImage && renderPlaceholderSVG()}
              </div>
              <div className="nft-card-body">
                <span className="nft-card-number">
                  PULSAR #{String(nft.number).padStart(3, "0")}
                </span>
                <p className="nft-card-name">{nft.name}</p>
              </div>
            </div>
          );
        })}

        {/* Remaining supply slots */}
        {Array.from({ length: Math.min(4, maxSupply - DEMO_NFTS.length) }).map(
          (_, i) => {
            const num = DEMO_NFTS.length + i + 1;
            return (
              <div key={`empty-${num}`} className="nft-card" style={{ opacity: 0.55 }}>
                <span className="nft-card-badge">#{num}</span>
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "1",
                    background: generateCosmicGradient(num),
                    position: "relative",
                    zIndex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "12px",
                  }}
                >
                  {renderPlaceholderSVG()}
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "0.7rem",
                      color: "var(--text-dim)",
                      letterSpacing: "0.1em",
                    }}
                  >
                    AWAITING MINT
                  </span>
                </div>
                <div className="nft-card-body">
                  <span className="nft-card-number">
                    PULSAR #{String(num).padStart(3, "0")}
                  </span>
                  <p className="nft-card-name" style={{ color: "var(--text-dim)" }}>
                    Unclaimed
                  </p>
                </div>
              </div>
            );
          }
        )}
      </div>
    </section>
  );
}

function generateCosmicGradient(seed: number): string {
  const gradients = [
    "linear-gradient(135deg, #0c1222 0%, #1a1040 50%, #0c1222 100%)",
    "linear-gradient(135deg, #0c1222 0%, #102030 50%, #081018 100%)",
    "linear-gradient(135deg, #10081f 0%, #1a0a2e 50%, #0a0612 100%)",
    "linear-gradient(135deg, #0a1628 0%, #0e2040 50%, #060e18 100%)",
    "linear-gradient(135deg, #120c20 0%, #1e1435 50%, #0c0816 100%)",
    "linear-gradient(135deg, #0c1a20 0%, #0a2530 50%, #060f14 100%)",
    "linear-gradient(135deg, #181020 0%, #201838 50%, #100c18 100%)",
    "linear-gradient(135deg, #0e1420 0%, #182838 50%, #0a0e14 100%)",
  ];
  return gradients[(seed - 1) % gradients.length];
}
