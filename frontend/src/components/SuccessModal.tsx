import { useEffect, useMemo } from "react";
import { SUISCAN_BASE, COLLECTION_META } from "../config";

interface SuccessModalProps {
  digest: string;
  objectId?: string;
  nftName: string;
  imageUrl: string;
  onClose: () => void;
}

export function SuccessModal({ digest, objectId, nftName, imageUrl, onClose }: SuccessModalProps) {
  // Generate confetti pieces
  const confetti = useMemo(
    () =>
      Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 2,
        color: ["#7b2fff", "#ff9f1c", "#a855f7", "#ff6b00", "#f0e8ff"][i % 5],
        size: 6 + Math.random() * 8,
        duration: 2 + Math.random() * 2,
      })),
    []
  );

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const tweetText = encodeURIComponent(
    `Just minted "${nftName}" on @pulsarsui 🚀✨\n\nPowered by @SuiNetwork & Walrus decentralized storage\n\n${SUISCAN_BASE}/tx/${digest}`
  );
  const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;

  return (
    <>
      {/* Confetti */}
      <div className="confetti-container">
        {confetti.map((c) => (
          <div
            key={c.id}
            className="confetti-piece"
            style={{
              left: `${c.left}%`,
              width: `${c.size}px`,
              height: `${c.size}px`,
              background: c.color,
              borderRadius: c.id % 3 === 0 ? "50%" : "2px",
              animationDelay: `${c.delay}s`,
              animationDuration: `${c.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Modal */}
      <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="modal-content">
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>

          <div style={{ position: "relative", display: "inline-block" }}>
            <div className="starburst">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="starburst-ray"
                  style={{ transform: `rotate(${i * 30}deg)` }}
                />
              ))}
            </div>
            <img
              src={imageUrl}
              alt={nftName}
              className="modal-nft-image"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "data:image/svg+xml," +
                  encodeURIComponent(
                    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="#0a0118" width="200" height="200"/><text x="100" y="100" text-anchor="middle" fill="#7b2fff" font-size="48">🌟</text></svg>'
                  );
              }}
            />
          </div>

          <h2 className="modal-title">✅ Minted Successfully!</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "4px" }}>
            {nftName}
          </p>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "var(--text-dim)" }}>
            Price: {COLLECTION_META.mintPriceDisplay}
          </p>

          <div className="modal-links">
            <a
              href={`${SUISCAN_BASE}/tx/${digest}`}
              target="_blank"
              rel="noopener noreferrer"
              className="modal-link"
            >
              🔗 View Transaction on Suiscan
            </a>

            {objectId && (
              <a
                href={`${SUISCAN_BASE}/object/${objectId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="modal-link"
              >
                🖼 View NFT Object on Suiscan
              </a>
            )}

            <a
              href={tweetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="modal-link btn-twitter"
            >
              🐦 Share on Twitter
            </a>
          </div>

          <button
            className="btn btn-primary"
            onClick={onClose}
            style={{ marginTop: "20px" }}
          >
            Mint Another
          </button>
        </div>
      </div>
    </>
  );
}
