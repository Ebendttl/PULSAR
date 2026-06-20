import { useState } from "react";
import { useDAppKit, useCurrentAccount } from "@mysten/dapp-kit-react";
import { Transaction } from "@mysten/sui/transactions";
import { buildWalrusImageUrl, type WalrusSponsorUploadResult } from "../walrus";
import { CONTRACT_CONFIG, COLLECTION_META, SUISCAN_BASE } from "../config";

interface MintStepProps {
  uploadResult: WalrusSponsorUploadResult;
  nftName: string;
  nftDescription: string;
  onMintSuccess: (digest: string, objectId?: string) => void;
  onBack: () => void;
}

function truncate(str: string, len = 12): string {
  if (str.length <= len) return str;
  return str.slice(0, len) + "..." + str.slice(-4);
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {});
}

export function MintStep({ uploadResult, nftName, nftDescription, onMintSuccess, onBack }: MintStepProps) {
  const dAppKit = useDAppKit();
  const account = useCurrentAccount();
  const [isMinting, setIsMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const imageUrl = buildWalrusImageUrl(uploadResult.blob_id);

  const handleMint = async () => {
    if (!account) { setError("Please connect your wallet first."); return; }

    setIsMinting(true);
    setError(null);

    try {
      const tx = new Transaction();
      const [mintPayment] = tx.splitCoins(tx.gas, [
        tx.pure.u64(COLLECTION_META.mintPriceMist),
      ]);

      tx.moveCall({
        target: `${CONTRACT_CONFIG.packageId}::${CONTRACT_CONFIG.module}::${CONTRACT_CONFIG.mintFunction}`,
        arguments: [
          tx.object(CONTRACT_CONFIG.collectionConfigId),
          mintPayment,
          tx.pure.vector("u8", Array.from(new TextEncoder().encode(nftName))),
          tx.pure.vector("u8", Array.from(new TextEncoder().encode(nftDescription))),
          tx.pure.vector("u8", Array.from(new TextEncoder().encode(uploadResult.blob_id))),
          tx.pure.vector("u8", Array.from(new TextEncoder().encode(uploadResult.sponsored_blob_id))),
        ],
      });

      const result = await dAppKit.signAndExecuteTransaction({ transaction: tx });

      if ("FailedTransaction" in result && result.FailedTransaction) {
        throw new Error("Transaction failed on-chain");
      }

      const txResult = "Transaction" in result ? result.Transaction : null;
      const digest = txResult?.digest || "unknown";
      const changedObjects = txResult?.effects?.changedObjects || [];
      const nftObj = changedObjects.find((obj: any) => obj.idOperation === "Created");
      const objectId = nftObj?.objectId;

      onMintSuccess(digest, objectId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Minting failed");
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="card">
      <h3 className="card-title">✅ Uploaded to Walrus!</h3>

      <div className="status-success">
        <div className="status-row">
          <span className="status-label">Blob ID</span>
          <span className="status-value">
            <span className="mono">{truncate(uploadResult.blob_id)}</span>
            <button className="copy-btn" onClick={() => copyToClipboard(uploadResult.blob_id)} title="Copy">📋</button>
          </span>
        </div>
        <div className="status-row">
          <span className="status-label">Sponsored Blob ID</span>
          <span className="status-value">
            <span className="mono">{truncate(uploadResult.sponsored_blob_id)}</span>
            <button className="copy-btn" onClick={() => copyToClipboard(uploadResult.sponsored_blob_id)} title="Copy">📋</button>
          </span>
        </div>
        <div className="status-row">
          <span className="status-label">Tx Digest</span>
          <span className="status-value">
            <a
              href={`${SUISCAN_BASE}/tx/${uploadResult.tx_digest}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mono"
              style={{ color: "var(--accent-amber)", textDecoration: "none" }}
            >
              {truncate(uploadResult.tx_digest)} 🔗
            </a>
          </span>
        </div>
      </div>

      <div style={{ textAlign: "center", margin: "24px 0" }}>
        <p className="input-label" style={{ marginBottom: "12px" }}>Image Preview</p>
        <img
          src={imageUrl}
          alt={nftName}
          style={{
            maxWidth: "100%",
            maxHeight: "280px",
            borderRadius: "var(--radius)",
            border: "1px solid var(--border)",
            objectFit: "contain",
          }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      </div>

      {error && <div className="status-error">{error}</div>}

      <button
        className={`btn btn-mint ${isMinting ? "loading" : ""}`}
        onClick={handleMint}
        disabled={isMinting || !account}
      >
        {isMinting ? (
          <><span className="spinner" /> Minting on Sui...</>
        ) : (
          `🚀 MINT NFT — ${COLLECTION_META.mintPriceDisplay}`
        )}
      </button>

      <button
        className="btn btn-secondary"
        style={{ width: "100%", marginTop: "12px" }}
        onClick={onBack}
        disabled={isMinting}
      >
        ← Upload Different Image
      </button>
    </div>
  );
}
