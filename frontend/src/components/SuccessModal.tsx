import { useEffect } from "react";
import { SUISCAN_BASE, COLLECTION_META } from "../config";

interface SuccessModalProps {
  digest: string;
  objectId?: string;
  nftName: string;
  imageUrl: string;
  onClose: () => void;
}

export function SuccessModal({ digest, objectId, nftName, imageUrl, onClose }: SuccessModalProps) {
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
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content">
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <div style={{ position: "relative", display: "inline-block", margin: "0 auto 20px" }}>
          <img
            src={imageUrl}
            alt={nftName}
            className="modal-nft-image"
            style={{ margin: 0 }}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "data:image/svg+xml," +
                encodeURIComponent(
                  '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="#12131a" width="200" height="200"/><circle cx="100" cy="100" r="18" fill="#4f46e5"/><circle cx="100" cy="100" r="48" stroke="#f3f4f6" stroke-width="2" stroke-dasharray="6 6" fill="none"/></svg>'
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
  );
}

