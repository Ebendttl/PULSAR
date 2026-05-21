# 🚀 ANTIGRAVITY IDE PROMPT
## Full-Stack Sui NFT Launchpad with Krilly Walrus Sponsor SDK Integration

---

> **Project:** PULSAR — Sui NFT Launchpad with Sponsored Walrus Storage  
> **Stack:** Move (Sui) · TypeScript · React · Vite · @mysten/dapp-kit  
> **Goal:** Build a production-grade NFT minting dApp that uses the Krilly Walrus Sponsor SDK (`https://walrus-sponsor.krill.tube`) for **zero-WAL-cost** decentralized image/metadata storage, with on-chain NFT minting via Sui Move.

---

## 🧠 CONTEXT & ARCHITECTURE OVERVIEW

Build a full-stack NFT launchpad on Sui blockchain with the following architecture:

```
┌────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite + TS)                │
│  ┌──────────┐   ┌──────────────┐   ┌──────────────────────┐   │
│  │ Upload   │ → │ Krilly Walrus│ → │ Returns blob_id +    │   │
│  │ NFT Art  │   │ Sponsor SDK  │   │ sponsored_blob_id    │   │
│  └──────────┘   │ (krill.tube) │   └──────────────────────┘   │
│                 └──────────────┘              ↓                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Sui Wallet (dapp-kit) → PTB → Move Contract → Mint NFT │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│                MOVE SMART CONTRACT (Sui Mainnet/Testnet)        │
│  module pulsar::launchpad                                      │
│  - CollectionConfig (shared object) — price, supply, admin     │
│  - PulsarNFT (owned object) — name, image_url, blob_id         │
│  - Publisher + Display standard (Object Display Standard)      │
│  - mint_nft(config, payment, name, blob_id, ctx)               │
│  - admin_withdraw(config, ctx)                                 │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│              WALRUS DECENTRALIZED STORAGE                      │
│  Images & Metadata stored as blobs via Krilly Sponsor SDK      │
│  Sponsor pays WAL fees — creator just needs an API key         │
│  Blob retrievable at: https://aggregator.walrus.space/v1/{id}  │
└────────────────────────────────────────────────────────────────┘
```

---

## 📁 PROJECT STRUCTURE TO GENERATE

```
pulsar-launchpad/
├── move/
│   ├── Move.toml
│   └── sources/
│       └── launchpad.move          ← Full Move smart contract
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── config.ts               ← Contract addresses & constants
│       ├── walrus.ts               ← Krilly Walrus Sponsor SDK wrapper
│       ├── hooks/
│       │   ├── useMintNFT.ts       ← PTB mint hook
│       │   └── useCollection.ts    ← Fetch collection state
│       ├── components/
│       │   ├── Header.tsx
│       │   ├── CollectionBanner.tsx
│       │   ├── MintCard.tsx
│       │   ├── UploadStep.tsx      ← Drag-drop image upload + Walrus
│       │   ├── MintStep.tsx        ← On-chain mint after upload
│       │   └── NFTGallery.tsx
│       └── styles/
│           └── globals.css
└── README.md
```

---

## 🔷 PART 1 — MOVE SMART CONTRACT

**File:** `move/Move.toml`

```toml
[package]
name = "pulsar_launchpad"
edition = "2024.beta"
version = "1.0.0"

[dependencies]
Sui = { git = "https://github.com/MystenLabs/sui.git", subdir = "crates/sui-framework/packages/sui-framework", rev = "framework/testnet" }

[addresses]
pulsar = "0x0"
```

---

**File:** `move/sources/launchpad.move`

Generate the COMPLETE Move module with NO compilation errors. Follow these exact specifications:

```move
module pulsar::launchpad {
    // ═══════════════════════════════════════════════════════════════
    // IMPORTS — use Sui framework 2024 edition syntax
    // ═══════════════════════════════════════════════════════════════
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::balance::{Self, Balance};
    use sui::package;
    use sui::display;
    use std::string::{Self, String};
    use std::vector;

    // ═══════════════════════════════════════════════════════════════
    // ONE-TIME WITNESS — for Publisher + Display
    // ═══════════════════════════════════════════════════════════════
    public struct LAUNCHPAD has drop {}

    // ═══════════════════════════════════════════════════════════════
    // CORE STRUCTS
    // ═══════════════════════════════════════════════════════════════

    /// Shared config object — controls the collection
    public struct CollectionConfig has key {
        id: UID,
        name: String,
        description: String,
        mint_price: u64,          // in MIST (1 SUI = 1_000_000_000 MIST)
        max_supply: u64,
        current_supply: u64,
        treasury: Balance<SUI>,
        admin: address,
        is_active: bool,
    }

    /// Admin capability — only admin can withdraw or pause
    public struct AdminCap has key, store {
        id: UID,
        collection_id: ID,
    }

    /// The NFT object itself — owned by minter
    public struct PulsarNFT has key, store {
        id: UID,
        number: u64,
        name: String,
        description: String,
        image_url: String,         // Walrus aggregator URL: https://aggregator.walrus.space/v1/{blob_id}
        blob_id: String,           // Raw Walrus blob_id from Krilly Sponsor SDK
        sponsored_blob_id: String, // sponsored_blob_id from Krilly response
        creator: address,
    }

    // ═══════════════════════════════════════════════════════════════
    // ERRORS
    // ═══════════════════════════════════════════════════════════════
    const ENotAdmin: u64 = 0;
    const EInsufficientPayment: u64 = 1;
    const ECollectionSoldOut: u64 = 2;
    const ECollectionNotActive: u64 = 3;
    const EEmptyBlobId: u64 = 4;

    // ═══════════════════════════════════════════════════════════════
    // INIT — runs once at deploy time
    // ═══════════════════════════════════════════════════════════════
    fun init(witness: LAUNCHPAD, ctx: &mut TxContext) {
        // Create Publisher for Display standard
        let publisher = package::claim(witness, ctx);

        // Set up the Object Display standard (Sui Display)
        let mut display_obj = display::new<PulsarNFT>(&publisher, ctx);
        display::add(&mut display_obj, string::utf8(b"name"), string::utf8(b"{name} #{number}"));
        display::add(&mut display_obj, string::utf8(b"description"), string::utf8(b"{description}"));
        display::add(&mut display_obj, string::utf8(b"image_url"), string::utf8(b"{image_url}"));
        display::add(&mut display_obj, string::utf8(b"creator"), string::utf8(b"{creator}"));
        display::add(&mut display_obj, string::utf8(b"project_url"), string::utf8(b"https://pulsar.sui"));
        display::update_version(&mut display_obj);

        transfer::public_transfer(publisher, tx_context::sender(ctx));
        transfer::public_transfer(display_obj, tx_context::sender(ctx));

        // Create collection config as a shared object
        let config = CollectionConfig {
            id: object::new(ctx),
            name: string::utf8(b"PULSAR"),
            description: string::utf8(b"Pulsar cosmic art — rotating neutron stars stored on Walrus decentralized storage"),
            mint_price: 100_000, // 0.0001 SUI = 100_000 MIST
            max_supply: 31,
            current_supply: 0,
            treasury: balance::zero<SUI>(),
            admin: tx_context::sender(ctx),
            is_active: true,
        };

        let admin_cap = AdminCap {
            id: object::new(ctx),
            collection_id: object::id(&config),
        };

        transfer::share_object(config);
        transfer::transfer(admin_cap, tx_context::sender(ctx));
    }

    // ═══════════════════════════════════════════════════════════════
    // MINT — public entry, anyone can call
    // ═══════════════════════════════════════════════════════════════
    public entry fun mint_nft(
        config: &mut CollectionConfig,
        payment: Coin<SUI>,
        nft_name: vector<u8>,
        nft_description: vector<u8>,
        blob_id: vector<u8>,
        sponsored_blob_id: vector<u8>,
        ctx: &mut TxContext
    ) {
        // Guards
        assert!(config.is_active, ECollectionNotActive);
        assert!(config.current_supply < config.max_supply, ECollectionSoldOut);
        assert!(coin::value(&payment) >= config.mint_price, EInsufficientPayment);
        assert!(vector::length(&blob_id) > 0, EEmptyBlobId);

        // Build the Walrus aggregator URL from blob_id
        let mut image_url = string::utf8(b"https://aggregator.walrus.space/v1/");
        string::append(&mut image_url, string::utf8(blob_id));

        // Increment supply first
        config.current_supply = config.current_supply + 1;

        // Accept exact mint price, refund overpayment if any
        let mut payment_balance = coin::into_balance(payment);
        let mint_balance = balance::split(&mut payment_balance, config.mint_price);
        balance::join(&mut config.treasury, mint_balance);

        // Return any excess SUI to minter
        if (balance::value(&payment_balance) > 0) {
            transfer::public_transfer(
                coin::from_balance(payment_balance, ctx),
                tx_context::sender(ctx)
            );
        } else {
            balance::destroy_zero(payment_balance);
        };

        // Mint the NFT
        let nft = PulsarNFT {
            id: object::new(ctx),
            number: config.current_supply,
            name: string::utf8(nft_name),
            description: string::utf8(nft_description),
            image_url,
            blob_id: string::utf8(blob_id),
            sponsored_blob_id: string::utf8(sponsored_blob_id),
            creator: tx_context::sender(ctx),
        };

        transfer::transfer(nft, tx_context::sender(ctx));
    }

    // ═══════════════════════════════════════════════════════════════
    // ADMIN FUNCTIONS
    // ═══════════════════════════════════════════════════════════════

    /// Admin withdraws treasury funds
    public entry fun admin_withdraw(
        _cap: &AdminCap,
        config: &mut CollectionConfig,
        ctx: &mut TxContext
    ) {
        let amount = balance::value(&config.treasury);
        if (amount > 0) {
            let withdrawn = balance::split(&mut config.treasury, amount);
            transfer::public_transfer(
                coin::from_balance(withdrawn, ctx),
                config.admin
            );
        }
    }

    /// Admin toggles collection active/paused
    public entry fun set_active(
        _cap: &AdminCap,
        config: &mut CollectionConfig,
        active: bool,
    ) {
        config.is_active = active;
    }

    /// Admin updates mint price
    public entry fun set_mint_price(
        _cap: &AdminCap,
        config: &mut CollectionConfig,
        new_price: u64,
    ) {
        config.mint_price = new_price;
    }

    // ═══════════════════════════════════════════════════════════════
    // VIEW FUNCTIONS (pure reads)
    // ═══════════════════════════════════════════════════════════════
    public fun get_supply(config: &CollectionConfig): (u64, u64) {
        (config.current_supply, config.max_supply)
    }

    public fun get_mint_price(config: &CollectionConfig): u64 {
        config.mint_price
    }

    public fun is_active(config: &CollectionConfig): bool {
        config.is_active
    }
}
```

---

## 🔷 PART 2 — WALRUS SPONSOR SDK WRAPPER

**File:** `frontend/src/walrus.ts`

This is the **critical integration file**. The Krilly Walrus Sponsor SDK from `https://walrus-sponsor.krill.tube` works via HTTP REST. It sponsors WAL fees so uploaders don't need WAL tokens.

```typescript
// walrus.ts — Krilly Walrus Sponsor SDK Integration
// API Docs: https://walrus-sponsor.krill.tube/docs/getting-started
// SDK Pattern: Bearer token with sbk_live_ prefix API keys

const WALRUS_SPONSOR_BASE_URL = "https://walrus-sponsor.krill.tube";
const WALRUS_AGGREGATOR_URL = "https://aggregator.walrus.space/v1";

// ── Types ──────────────────────────────────────────────────────────────────

export interface WalrusSponsorUploadResult {
  sponsored_blob_id: string;   // Sui object ID of the sponsored blob on-chain
  blob_id: string;             // Content-addressed Walrus blob identifier
  creator_address: string;     // Uploader's Sui address
  sponsor_address: string;     // Sponsor's Sui address (paid WAL fees)
  tx_digest: string;           // Sui transaction digest for the upload tx
  media_type?: string;
  size?: number;
}

export interface WalrusSponsorConfig {
  apiKey: string;              // sbk_live_... key from krill.tube dashboard
  epochs?: number;             // Storage duration in Walrus epochs (default: 5)
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
    throw new Error("Invalid Walrus Sponsor API key. Must start with 'sbk_live_'");
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
      errorMessage = errorBody.message || errorBody.error || errorMessage;
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
  const file = new File([jsonBlob], "metadata.json", { type: "application/json" });
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
```

---

## 🔷 PART 3 — CONFIGURATION FILE

**File:** `frontend/src/config.ts`

```typescript
// config.ts — All contract addresses and constants

// ── Walrus Sponsor SDK ──────────────────────────────────────────────────────
// Get your API key at https://walrus-sponsor.krill.tube
// Store in .env — NEVER commit real keys to source control
export const WALRUS_SPONSOR_API_KEY =
  import.meta.env.VITE_WALRUS_SPONSOR_API_KEY || "";

// ── Sui Network ─────────────────────────────────────────────────────────────
// Set to "testnet" or "mainnet"
export const SUI_NETWORK = (import.meta.env.VITE_SUI_NETWORK || "testnet") as
  | "testnet"
  | "mainnet"
  | "devnet";

// ── Move Contract ────────────────────────────────────────────────────────────
// These are populated AFTER `sui client publish`
// Replace with your actual deployed contract addresses
export const CONTRACT_CONFIG = {
  packageId: import.meta.env.VITE_PACKAGE_ID || "0x0",
  collectionConfigId: import.meta.env.VITE_COLLECTION_CONFIG_ID || "0x0",
  module: "launchpad",
  mintFunction: "mint_nft",
};

// ── Collection Display ───────────────────────────────────────────────────────
export const COLLECTION_META = {
  name: "PULSAR",
  description: "Pulsar cosmic art — rotating neutron stars, powered by Walrus decentralized storage",
  maxSupply: 31,
  mintPriceMist: BigInt(100_000), // 0.0001 SUI in MIST
  mintPriceDisplay: "0.00001 SUI",
  walrusStorageEpochs: 5,
};

// ── Walrus Aggregator ────────────────────────────────────────────────────────
export const WALRUS_AGGREGATOR = "https://aggregator.walrus.space/v1";
```

---

## 🔷 PART 4 — MINT NFT HOOK (PTB)

**File:** `frontend/src/hooks/useMintNFT.ts`

```typescript
// useMintNFT.ts — Programmable Transaction Block for minting
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useCallback, useState } from "react";
import { CONTRACT_CONFIG, COLLECTION_META } from "../config";
import {
  uploadToWalrusSponsored,
  WalrusSponsorUploadResult,
} from "../walrus";

export interface MintParams {
  imageFile: File;
  nftName: string;
  nftDescription: string;
  walrusApiKey: string;
}

export interface MintResult {
  txDigest: string;
  nftObjectId?: string;
  walrusUpload: WalrusSponsorUploadResult;
}

export function useMintNFT() {
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();
  const [isUploading, setIsUploading] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] =
    state<WalrusSponsorUploadResult | null>(null);

  const mint = useCallback(
    async (params: MintParams): Promise<MintResult> => {
      setError(null);

      // ── Step 1: Upload image to Walrus via Krilly Sponsor SDK ────────────
      setIsUploading(true);
      let walrusResult: WalrusSponsorUploadResult;
      try {
        walrusResult = await uploadToWalrusSponsored(params.imageFile, {
          apiKey: params.walrusApiKey,
          epochs: COLLECTION_META.walrusStorageEpochs,
        });
        setUploadResult(walrusResult);
        console.log("Walrus upload success:", walrusResult);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Walrus upload failed";
        setError(msg);
        throw new Error(msg);
      } finally {
        setIsUploading(false);
      }

      // ── Step 2: Build the PTB and mint on Sui ────────────────────────────
      setIsMinting(true);
      try {
        const tx = new Transaction();

        // Split the exact mint price from the gas coin
        const [mintPayment] = tx.splitCoins(tx.gas, [
          COLLECTION_META.mintPriceMist,
        ]);

        // Call move function: mint_nft(config, payment, name, description, blob_id, sponsored_blob_id)
        tx.moveCall({
          target: `${CONTRACT_CONFIG.packageId}::${CONTRACT_CONFIG.module}::${CONTRACT_CONFIG.mintFunction}`,
          arguments: [
            tx.object(CONTRACT_CONFIG.collectionConfigId), // &mut CollectionConfig
            mintPayment,                                    // Coin<SUI>
            tx.pure.vector("u8", Array.from(
              new TextEncoder().encode(params.nftName)
            )),
            tx.pure.vector("u8", Array.from(
              new TextEncoder().encode(params.nftDescription)
            )),
            tx.pure.vector("u8", Array.from(
              new TextEncoder().encode(walrusResult.blob_id)
            )),
            tx.pure.vector("u8", Array.from(
              new TextEncoder().encode(walrusResult.sponsored_blob_id)
            )),
          ],
        });

        const result = await signAndExecute({
          transaction: tx,
          options: {
            showEffects: true,
            showObjectChanges: true,
          },
        });

        // Extract minted NFT object ID from effects
        const createdObjects = result.effects?.created || [];
        const nftObject = createdObjects.find(
          (obj) =>
            obj.owner &&
            typeof obj.owner === "object" &&
            "AddressOwner" in obj.owner
        );

        return {
          txDigest: result.digest,
          nftObjectId: nftObject?.reference?.objectId,
          walrusUpload: walrusResult,
        };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Minting failed";
        setError(msg);
        throw new Error(msg);
      } finally {
        setIsMinting(false);
      }
    },
    [signAndExecute, suiClient]
  );

  return {
    mint,
    isUploading,
    isMinting,
    isLoading: isUploading || isMinting,
    error,
    uploadResult,
    step: isUploading
      ? "uploading"
      : isMinting
      ? "minting"
      : "idle",
  };
}
```

---

## 🔷 PART 5 — FRONTEND APP

### `frontend/src/main.tsx`

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./styles/globals.css";
import "@mysten/dapp-kit/dist/index.css";

const queryClient = new QueryClient();

const networks = {
  testnet: { url: getFullnodeUrl("testnet") },
  mainnet: { url: getFullnodeUrl("mainnet") },
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networks} defaultNetwork="testnet">
        <WalletProvider autoConnect>
          <App />
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
```

---

### `frontend/src/App.tsx` — Full Application

Build a **stunning, production-grade React UI** with these exact sections and behaviors:

#### A. HEADER COMPONENT
- Orca-style navigation: `Home | Collections | Create | Launchpad | Tokens | SuiNS`
- Wallet connect button using `<ConnectButton />` from `@mysten/dapp-kit`
- Project name/logo: PULSAR with a neutron star / radial pulse icon
- Deep space background (#03000f), electric violet accent (#7b2fff), pulsar amber (#ff9f1c)

#### B. COLLECTION BANNER
- Show: Collection name **PULSAR**, description, creator address
- Dynamic supply counter: `Supply: {current} / {maxSupply}` — read from `CollectionConfig` shared object via `useSuiClient().getObject()`
- Price badge: `Price: 0.00001 SUI`
- Fetch live data from the `CollectionConfig` shared object using `suiClient.getObject({ id: CONTRACT_CONFIG.collectionConfigId, options: { showContent: true } })`
- Parse `content.fields` for `current_supply`, `max_supply`, `mint_price`, `is_active`

#### C. MINT CARD (TWO-STEP UX)

**Step 1 — Upload to Walrus (Krilly Sponsor SDK)**
```
┌─────────────────────────────────────────────┐
│  🌌 Upload Your PULSAR Artwork               │
│                                             │
│  [ Drag & Drop or Click to Select Image ]   │
│  Supports: PNG, JPG, GIF, WebP (max 10MB)  │
│                                             │
│  NFT Name: [_________________________]      │
│  Description: [_____________________]       │
│                                             │
│  [ UPLOAD TO WALRUS → ]                     │
│  Powered by Krilly Walrus Sponsor SDK       │
│  (No WAL tokens needed — sponsored upload) │
└─────────────────────────────────────────────┘
```

Show upload progress states:
- Idle: "Upload to Walrus (Sponsored)"
- Uploading: Spinner + "Uploading to Walrus..."
- Success: Green check + blob_id (truncated, copyable) + tx_digest

**Step 2 — Mint on Sui**
After successful upload, show:
```
┌─────────────────────────────────────────────┐
│  ✅ Uploaded to Walrus!                      │
│  Blob ID: KaNEkQ0OKER...4w  [📋 Copy]       │
│  Sponsored Blob ID: 0x4a628...868 [📋 Copy] │
│  Tx: GjDQCW61...XY8 [🔗 Suiscan]           │
│                                             │
│  Image Preview: [renders blob from Walrus]  │
│                                             │
│  [ 🚀 MINT NFT — 0.00001 SUI ]              │
└─────────────────────────────────────────────┘
```

Mint button states:
- Default: "MINT — 0.00001 SUI"
- Processing: Spinner + "Minting on Sui..."
- Success: "✅ Minted! View on Suiscan →"
- Error: Red alert with message

#### D. NFT GALLERY
- Grid of 4 columns showing NFT cards (#1, #2, #3, #4...)
- Each card: Image (from Walrus aggregator URL), NFT number badge, MINT button
- Cards use animated hover effect (scale + glow)
- Show "SOLD OUT" state when supply exhausted

#### E. SUCCESS MODAL
After successful mint, display a modal with:
- Confetti animation
- NFT image rendered from Walrus blob
- NFT number, name
- Transaction digest with Suiscan link: `https://suiscan.xyz/testnet/tx/{digest}`
- NFT object link: `https://suiscan.xyz/testnet/object/{objectId}`
- Share to Twitter button

---

## 🔷 PART 6 — PACKAGE.JSON & DEPS

**File:** `frontend/package.json`

```json
{
  "name": "pulsar-launchpad",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@mysten/dapp-kit": "^0.14.0",
    "@mysten/sui": "^1.0.0",
    "@tanstack/react-query": "^5.0.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.1",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "typescript": "^5.5.3",
    "vite": "^5.4.1"
  }
}
```

---

## 🔷 PART 7 — VITE CONFIG

**File:** `frontend/vite.config.ts`

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  define: {
    global: "globalThis",
  },
  server: {
    port: 5173,
  },
  build: {
    target: "esnext",
    rollupOptions: {
      output: {
        manualChunks: {
          "sui-sdk": ["@mysten/sui", "@mysten/dapp-kit"],
        },
      },
    },
  },
});
```

---

## 🔷 PART 8 — ENVIRONMENT FILE

**File:** `frontend/.env.example`

```bash
# Walrus Sponsor API Key — get yours at https://walrus-sponsor.krill.tube
VITE_WALRUS_SPONSOR_API_KEY=sbk_live_YOUR_KEY_HERE

# Sui network: testnet | mainnet
VITE_SUI_NETWORK=testnet

# Fill these in AFTER running: sui client publish
VITE_PACKAGE_ID=0x0
VITE_COLLECTION_CONFIG_ID=0x0
```

---

## 🔷 PART 9 — DEPLOYMENT INSTRUCTIONS (README.md)

Generate a complete README with:

```markdown
# PULSAR NFT Launchpad — Walrus Sponsor SDK Integration

## Quick Start

### 1. Deploy the Move Contract
\`\`\`bash
cd move
sui client publish --gas-budget 200000000
# Copy PackageId and CollectionConfig object ID from output
\`\`\`

### 2. Configure Frontend
\`\`\`bash
cd frontend
cp .env.example .env
# Edit .env with your:
# - Walrus Sponsor API key (sbk_live_...)
# - Package ID from deploy step
# - CollectionConfig object ID from deploy step
\`\`\`

### 3. Install & Run
\`\`\`bash
npm install
npm run dev
\`\`\`

## How Walrus Sponsor SDK Works
1. User selects image in the dApp
2. Frontend POSTs to https://walrus-sponsor.krill.tube/v1/upload with Bearer API key
3. Krilly pays WAL storage fees on behalf of user
4. Returns: blob_id (content address) + sponsored_blob_id (Sui object ID) + tx_digest
5. blob_id is stored on-chain in the PulsarNFT object
6. Image is retrievable at: https://aggregator.walrus.space/v1/{blob_id}
```

---

## ✅ CRITICAL REQUIREMENTS — NO ERRORS

1. **Move contract MUST compile** — use correct 2024 edition syntax. The `LAUNCHPAD` one-time witness struct must be uppercase matching the module name convention. `init` receives the witness as first arg. Use `sui::package::claim` for Publisher.

2. **PTB coin splitting** — NEVER use `tx.object("0x2")` for gas. Use `tx.gas` and `tx.splitCoins(tx.gas, [amount])`. The split coin is passed as `Coin<SUI>` to the Move function.

3. **Walrus Sponsor fetch** — The `Authorization: Bearer sbk_live_...` header goes in `headers`, NOT as a query param. Do NOT set `Content-Type` manually for FormData — let the browser set the multipart boundary.

4. **Text encoder for Move args** — When passing `vector<u8>` to PTB, use `tx.pure.vector("u8", Array.from(new TextEncoder().encode(str)))`.

5. **Balance handling in Move** — After splitting the mint fee, handle remaining balance: either return excess SUI or call `balance::destroy_zero`. Never leave a non-zero balance object dropped.

6. **dapp-kit hooks** — `useSignAndExecuteTransaction` returns `{ mutateAsync }`. The transaction must be built as `new Transaction()` from `@mysten/sui/transactions`.

7. **Shared object in PTB** — Pass `CollectionConfig` as `tx.object(id)` — dapp-kit handles mutability inference from Move function signature.

8. **No hardcoded API keys** — Always read from `import.meta.env.VITE_WALRUS_SPONSOR_API_KEY`.

9. **Error boundaries** — Wrap the main App in an ErrorBoundary component. All async operations in try/catch with user-friendly error messages shown in the UI.

10. **TypeScript** — Strict mode. No `any` types. All Move struct fields typed as per the contract.

---

## 🎨 UI/UX DESIGN DIRECTION

**Aesthetic:** Deep space / neutron star — absolute void black background with electric violet and pulsar amber accents. Inspired by the visual phenomenon of rotating neutron stars emitting precise radio beam pulses across the galaxy — precision, rarity, and unstoppable energy.

**Typography:**
- Display: `Orbitron` (Google Fonts) — built for space, zero compromise on futurism. Used for "PULSAR", NFT numbers, and all hero text
- Body: `IBM Plex Mono` — monospace for addresses, blob IDs, tx digests, and technical data
- UI: `Syne` — geometric, editorial, anti-generic for labels and buttons

**Animations:**
- NFT cards: rotating radial pulse ring on hover — simulating a pulsar beam sweep
- Upload zone: expanding concentric ring glow animation when drag-active
- Mint button: violet-to-amber gradient shimmer sweep on hover, heartbeat pulse when loading
- Success: starburst particle explosion + NFT card zoom-in reveal
- Background: CSS-only animated starfield with twinkling keyframe dots

**Color Palette:**
```
--bg-primary:    #03000f  (void black — deep space)
--bg-card:       #0a0118  (dark cosmic purple card surface)
--border:        #1a0a3a  (subtle cosmic violet border)
--accent-violet: #7b2fff  (electric violet — primary pulsar color)
--accent-amber:  #ff9f1c  (pulsar amber — radio beam energy)
--text-primary:  #f0e8ff  (lavender white — easy on eyes in dark space)
--text-muted:    #6b4a9b  (muted cosmic purple for labels)
--error:         #ff4466  (error states)
--success:       #7b2fff  (success — violet pulse)
```

---

## 🔍 EXPECTED FINAL OUTPUT

After running the project, clicking MINT should:
1. ✅ Trigger a file picker or accept drag-drop
2. ✅ POST image to `https://walrus-sponsor.krill.tube/v1/upload` with Bearer token
3. ✅ Log (and display) the full response: `{ sponsored_blob_id, blob_id, creator_address, sponsor_address, tx_digest }`
4. ✅ Build a Sui PTB with `mint_nft(collectionConfig, splitCoin, name, description, blob_id, sponsored_blob_id)`
5. ✅ Execute via connected Sui wallet
6. ✅ Display success with Suiscan links and the NFT image loaded from Walrus aggregator
7. ✅ Update the supply counter on the UI

**Deliver ALL files. Zero compilation errors. Zero TypeScript errors. Production-ready.**
