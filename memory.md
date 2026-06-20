# 🪐 SYSTEM STATE LEDGER: PULSAR NFT Launchpad

This ledger serves as the persistent state, memory cache, and source of architectural truth for the **PULSAR NFT Launchpad** project. It decouples active system configurations, deployment metadata, and debugging history from volatile chat sessions, preventing hallucinations and guiding consecutive AI turns.

---

## 🛠️ 1. Core Architecture & Tech Stack

### Smart Contract Layer
- **Environment:** Sui Testnet
- **Language:** Sui Move (2024 Edition)
- **Primary Objects:**
  - `CollectionConfig` (Shared Object): Stores global mint state, mint price, current/max supply, admin address, and is_active flag.
  - `PulsarNFT` (Owned Object): Represents the minted NFT, storing the `blob_id`, `sponsored_blob_id`, and `image_url`.
  - `AdminCap` (Owned Object): Admin capability to pause/unpause and update mint configurations.

### Frontend Application Layer
- **Framework:** React + Vite + TypeScript (fully compiling, zero errors)
- **UI Design System:** Refined Obsidian/Slate design system. Flat dark panels (`#0a0b10` background, `#12131a` card surfaces, subtle indigo/amber accents), minimal layouts, high typographic hierarchy, custom vector schematics (SVG) in place of cartoon/AI-generated emojis, and clean CSS borders without gratuitous animations or glows.
- **Sui Integration Libraries:** 
  - `@mysten/dapp-kit-react` (v2.0.3)
  - `@mysten/sui` (v2.17.0) integrating the updated `SuiJsonRpcClient` from `@mysten/sui/jsonRpc` (fully migrated to 2.0+ specs).
- **Decentralized Storage Integration:** Krilly Walrus Sponsor REST SDK (direct multipart FormData uploads with wallet signature requirements).

---

## 📌 2. Active Deployment State (Source of Truth)

### Sui Blockchain Parameters
- **Package ID:** `0xf5935b16c60796a89c9beae130e8932fafa31ac744a4076a3c7ba4cdf02cf180`
- **CollectionConfig ID:** `0xac03d986504fa12774d133ab5f23c5fa4df5f1a710c4f3e671bb13b38b4ccb70`
- **Explorer Verification:** [Suiscan Testnet Package Link](https://suiscan.xyz/testnet/object/0xf5935b16c60796a89c9beae130e8932fafa31ac744a4076a3c7ba4cdf02cf180)

### Netlify Hosting
- **URL:** `https://pulsar-launchpad.netlify.app`
- **Deploy Trigger:** Automated via git main branch push.

---

## ✅ 3. Verified & Working Features

1. **Sui Move Smart Contract:** Compiles and publishes flawlessly. Fully manages supply guards, mint fee storage in the treasury, and excess SUI refunds.
2. **Krilly Sponsor Integration Wrapper (`walrus.ts`):** Properly handles API validation, constructs correct multipart payloads with boundary separation, and exposes standard output shapes.
3. **TypeScript Compilation (Fully Resolved):**
   - Created `vite-env.d.ts` to expose `import.meta.env` properties globally.
   - Refactored `dapp-kit.ts` to instantiate `SuiJsonRpcClient` from `@mysten/sui/jsonRpc` with the required `network` key.
   - Refactored transaction resolution in `MintStep.tsx` and `useMintNFT.ts` to query `changedObjects` and `idOperation === "Created"` instead of the deprecated `effects.created` property to align with Sui SDK 2.0+ specifications.
4. **Professional Obsidian/Slate UI:**
   - Modified `globals.css` to remove all starry/neon backgrounds, neon glows, template headers, and rainbow gradients.
   - Polished `SuccessModal.tsx` by removing distracting confetti rendering loops and starburst rays.
   - Cleaned up `NFTGallery.tsx` by substituting emoji grids with elegant schematic vector SVGs.
   - Refined `UploadStep.tsx` and `MintStep.tsx` to replace planet/emoji symbols with custom cloud-upload and copy/link SVG icons.
   - Replaced all visual tags that signal "vibe-coded" layout templates with highly structured, human-crafted slate/indigo controls.
   - Added interactive system blueprint diagram and control terminals.
   - Implemented a **Live Animated Pulsar Core SVG** in the Hero view featuring relativistic rotating light beams and expanding magnetic force rings.
   - Implemented a **Real-Time Telemetry Monitor Log** component that syncs, processes, and displays mock system connection heartbeats and connection updates periodically.
5. **Netlify Deployment Hosting:**
   - Automated deployment setup and environmental variables configurations are active.
   - Configured `public/_redirects` file ensures correct client fallback routing.
   - Integrated custom high-fidelity SVG `favicon.svg` asset copy rules.
6. **Multi-Tab SPA Navigation (Fully Resolved):**
   - Refactored `Header.tsx` and `App.tsx` navigation boundaries to drive the active tab state (`Home` / `Collections` / `Create` / `Launchpad`) dynamically.
---

## 🚧 4. Current Core Focus & Active Debugging Loop

### Active Issue: Upload Fails with `402 (Payment Required)`
- **Symptom:** Submitting the upload request to `https://walrus-sponsor.krill.tube/v1/upload` fails with an HTTP 402 error showing: `"Insufficient balance: need at least 200000000 for gas fee"`.
- **Engineering Audit & Resolution Steps Taken:**
  1. *Step 1: Payload Alignment (Resolved)* — Krilly requires the active `creator_address` in the upload form payload. We updated `walrus.ts`, `UploadStep.tsx`, and `useMintNFT.ts` to capture the connected wallet's address (`account.address`) and append it as `creator_address` to the Form Data.
  2. *Step 2: Gas Funding (Resolved)* — The workspace had a zero balance. We executed a CLI transfer of `0.5 SUI` to the workspace deposit address (`0x0dbd...5472`).
  3. *Step 3: Storage Credits Audit (Current Focus)* — If 402 still persists after SUI gas funding, the Krilly workspace requires **Storage Credits** (equivalent to WAL storage units) in addition to gas funding. 

### Next Engineering Actions:
1. Access the Krilly Sponsor Dashboard under **Storage Credits** (found right under "Balance & History").
2. Validate whether SUI must be converted to Storage Credits, or if there is an active testnet option to acquire free storage slots.
3. Once credits are visible in the dashboard, trigger the frontend upload to obtain the `blob_id` and complete the Proof of Work capture!
