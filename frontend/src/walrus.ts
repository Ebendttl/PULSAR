// walrus.ts — Krilly Walrus Sponsor SDK Integration
// API Docs: https://walrus-sponsor.krill.tube/docs/getting-started
// SDK Pattern: Bearer token with sbk_live_ prefix API keys

const WALRUS_SPONSOR_BASE_URL = "https://walrus-sponsor.krill.tube";
const WALRUS_AGGREGATOR_URL = "https://aggregator.walrus.space/v1";

// ── Types ──────────────────────────────────────────────────────────────────

export interface WalrusSponsorUploadResult {
  sponsored_blob_id: string; // Sui object ID of the sponsored blob on-chain
  blob_id: string; // Content-addressed Walrus blob identifier
  creator_address: string; // Uploader's Sui address
  sponsor_address: string; // Sponsor's Sui address (paid WAL fees)
  tx_digest: string; // Sui transaction digest for the upload tx
  media_type?: string;
  size?: number;
}

export interface WalrusSponsorConfig {
  apiKey: string; // sbk_live_... key from krill.tube dashboard
  epochs?: number; // Storage duration in Walrus epochs (default: 5)
}

// ── Core Upload Function ───────────────────────────────────────────────────

/**
 * Upload a file to Walrus using the Krilly Sponsor SDK.
 * The sponsor pays WAL storage fees — no WAL needed by the uploader.
 *
 * @param file - The File or Blob to upload
 * @param config - API key and optional epoch duration
 * @returns WalrusSponsorUploadResult with blob_id and tx details
 */
export async function uploadToWalrusSponsored(
  file: File | Blob,
  config: WalrusSponsorConfig
): Promise<WalrusSponsorUploadResult> {
  const { apiKey, epochs = 5 } = config;

  if (!apiKey || !apiKey.startsWith("sbk_live_")) {
    throw new Error(
      "Invalid Walrus Sponsor API key. Must start with 'sbk_live_'"
    );
  }

  // Build multipart form data for the upload
  const formData = new FormData();
  formData.append("file", file);
  formData.append("epochs", String(epochs));

  const response = await fetch(`${WALRUS_SPONSOR_BASE_URL}/v1/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      // NOTE: Do NOT set Content-Type here — browser sets it with boundary for multipart
    },
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = `Walrus Sponsor upload failed: ${response.status} ${response.statusText}`;
    try {
      const errorBody = await response.json();
      errorMessage =
        errorBody.message || errorBody.error || errorMessage;
    } catch {
      // ignore parse error, use default message
    }
    throw new Error(errorMessage);
  }

  const result: WalrusSponsorUploadResult = await response.json();

  // Validate required fields
  if (!result.blob_id) {
    throw new Error("Walrus Sponsor response missing blob_id");
  }
  if (!result.sponsored_blob_id) {
    throw new Error("Walrus Sponsor response missing sponsored_blob_id");
  }

  console.log("✅ Krilly Walrus upload response:", result);
  return result;
}

/**
 * Upload JSON metadata to Walrus sponsored
 */
export async function uploadMetadataToWalrusSponsored(
  metadata: Record<string, unknown>,
  config: WalrusSponsorConfig
): Promise<WalrusSponsorUploadResult> {
  const jsonBlob = new Blob([JSON.stringify(metadata, null, 2)], {
    type: "application/json",
  });
  const file = new File([jsonBlob], "metadata.json", {
    type: "application/json",
  });
  return uploadToWalrusSponsored(file, config);
}

/**
 * Build a public Walrus aggregator URL from a blob_id
 * Used as the image_url stored on-chain in the NFT
 */
export function buildWalrusImageUrl(blobId: string): string {
  return `${WALRUS_AGGREGATOR_URL}/${blobId}`;
}

/**
 * Verify a blob exists on Walrus by attempting to HEAD the aggregator URL
 */
export async function verifyWalrusBlob(blobId: string): Promise<boolean> {
  try {
    const response = await fetch(`${WALRUS_AGGREGATOR_URL}/${blobId}`, {
      method: "HEAD",
    });
    return response.ok;
  } catch {
    return false;
  }
}
