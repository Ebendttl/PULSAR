import { COLLECTION_META, WALRUS_AGGREGATOR } from "../config";

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
      <h2 className="gallery-title">
        Collection — {maxSupply} Cosmic Artifacts
      </h2>
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
                }}
              >
                {!hasImage && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "3rem",
                    }}
                  >
                    {["🌟", "💫", "✨", "🪐"][nft.number % 4]}
                  </div>
                )}
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
              <div key={`empty-${num}`} className="nft-card" style={{ opacity: 0.4 }}>
                <span className="nft-card-badge">#{num}</span>
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "1",
                    background: generateCosmicGradient(num),
                    position: "relative",
                    zIndex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "0.8rem",
                      color: "var(--text-dim)",
                      letterSpacing: "0.15em",
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
  const hue1 = (seed * 47 + 260) % 360;
  const hue2 = (seed * 83 + 30) % 360;
  return `linear-gradient(${seed * 45}deg, hsl(${hue1}, 60%, 8%), hsl(${hue2}, 70%, 12%), hsl(${hue1}, 50%, 5%))`;
}
