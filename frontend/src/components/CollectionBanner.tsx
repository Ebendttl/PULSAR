import { COLLECTION_META } from "../config";
import type { CollectionState } from "../hooks/useCollection";

interface CollectionBannerProps {
  collection: CollectionState | null;
}

export function CollectionBanner({ collection }: CollectionBannerProps) {
  const currentSupply = collection?.currentSupply ?? 0;
  const maxSupply = collection?.maxSupply ?? COLLECTION_META.maxSupply;
  const isActive = collection?.isActive ?? true;
  const isSoldOut = currentSupply >= maxSupply;

  return (
    <section className="banner" id="collection-banner">
      <h1>PULSAR</h1>
      <p className="banner-desc">{COLLECTION_META.description}</p>
      <div className="banner-stats">
        <div className="stat-badge">
          <span className="stat-label">Supply</span>
          <span className="stat-value">
            {currentSupply} / {maxSupply}
          </span>
        </div>
        <div className="stat-badge">
          <span className="stat-label">Price</span>
          <span className="stat-value">{COLLECTION_META.mintPriceDisplay}</span>
        </div>
        <div className={`stat-badge ${isActive ? "active-badge" : ""}`}>
          <span className="stat-label">Status</span>
          <span className="stat-value">
            {isSoldOut ? "🔴 SOLD OUT" : isActive ? "🟢 LIVE" : "⏸ PAUSED"}
          </span>
        </div>
      </div>
    </section>
  );
}
