import { useState, useCallback, useRef } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit-react";
import { uploadToWalrusSponsored, type WalrusSponsorUploadResult } from "../walrus";
import { WALRUS_SPONSOR_API_KEY, COLLECTION_META } from "../config";

interface UploadStepProps {
  onUploadComplete: (result: WalrusSponsorUploadResult, file: File, name: string, description: string) => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];

export function UploadStep({ onUploadComplete }: UploadStepProps) {
  const account = useCurrentAccount();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [nftName, setNftName] = useState("");
  const [nftDescription, setNftDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    if (!ACCEPTED_TYPES.includes(f.type)) {
      setError("Unsupported file type. Use PNG, JPG, GIF, or WebP.");
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      setError("File too large. Maximum 10MB.");
      return;
    }
    setError(null);
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFile(droppedFile);
  }, [handleFile]);

  const handleUpload = async () => {
    if (!file) return;
    if (!nftName.trim()) { setError("Please enter an NFT name."); return; }

    const apiKey = WALRUS_SPONSOR_API_KEY;
    if (!apiKey || !apiKey.startsWith("sbk_live_")) {
      setError("Walrus Sponsor API key not configured. Add VITE_WALRUS_SPONSOR_API_KEY to .env");
      return;
    }

    if (!account?.address) {
      setError("Please connect your wallet first.");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const result = await uploadToWalrusSponsored(file, {
        apiKey,
        creatorAddress: account.address,
        epochs: COLLECTION_META.walrusStorageEpochs,
      });
      onUploadComplete(result, file, nftName.trim(), nftDescription.trim() || "PULSAR cosmic art");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="card">
      <h3 className="card-title">Upload Your PULSAR Artwork</h3>

      <div
        className={`upload-zone ${isDragActive ? "drag-active" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
        onDragLeave={() => setIsDragActive(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          style={{ display: "none" }}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
        {preview ? (
          <img src={preview} alt="Preview" className="upload-preview" />
        ) : (
          <>
            <svg
              className="upload-icon-svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--accent-primary)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginBottom: "12px", opacity: 0.8 }}
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <p style={{ color: "var(--text-primary)", fontWeight: 500 }}>
              Drag & Drop or Click to Select Image
            </p>
            <p className="upload-text">Supports: PNG, JPG, GIF, WebP (max 10MB)</p>
          </>
        )}
      </div>

      <div className="input-group">
        <label className="input-label" htmlFor="nft-name">NFT Name</label>
        <input
          id="nft-name"
          className="input-field"
          type="text"
          placeholder="Cosmic Pulse #001"
          value={nftName}
          onChange={(e) => setNftName(e.target.value)}
          maxLength={64}
        />
      </div>

      <div className="input-group">
        <label className="input-label" htmlFor="nft-desc">Description</label>
        <input
          id="nft-desc"
          className="input-field"
          type="text"
          placeholder="A rotating neutron star emitting cosmic energy..."
          value={nftDescription}
          onChange={(e) => setNftDescription(e.target.value)}
          maxLength={256}
        />
      </div>

      {error && <div className="status-error">{error}</div>}

      <button
        className={`btn btn-primary ${isUploading ? "loading" : ""}`}
        onClick={handleUpload}
        disabled={!file || !nftName.trim() || isUploading}
      >
        {isUploading ? (
          <><span className="spinner" /> Uploading to Walrus...</>
        ) : (
          "Upload to Walrus →"
        )}
      </button>

      <div className="powered-by">
        Powered by <a href="https://walrus-sponsor.krill.tube" target="_blank" rel="noopener noreferrer">Krilly Walrus Sponsor SDK</a> — No WAL tokens needed
      </div>
    </div>
  );
}
