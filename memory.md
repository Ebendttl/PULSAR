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
- **Framework:** React + Vite + TypeScript (running on WSL2, exposed via `--host 0.0.0.0`)
- **UI Design System:** Custom deep-space animated system (`globals.css` with starfields, pulsars, card glows, and modular panels)
- **Sui Integration Libraries:** 
  - `@mysten/dapp-kit-react` (v2.0.3)
  - `@mysten/sui` (v2.17.0) with modern `SuiGrpcClient` interface
- **Decentralized Storage Integration:** Krilly Walrus Sponsor REST SDK (direct multipart FormData uploads with wallet signature requirements)

---

## 📌 2. Active Deployment State (Source of Truth)

### Sui Blockchain Parameters
- **Package ID:** `0xf5935b16c60796a89c9beae130e8932fafa31ac744a4076a3c7ba4cdf02cf180`
- **CollectionConfig ID:** `0xac03d986504fa12774d133ab5f23c5fa4df5f1a710c4f3e671bb13b38b4ccb70`
- **Explorer Verification:** [Suiscan Testnet Package Link](https://suiscan.xyz/testnet/object/0xf5935b16c60796a89c9beae130e8932fafa31ac744a4076a3c7ba4cdf02cf180)

### Krilly Walrus Sponsor Integration
- **API Key:** `sbk_live_Dsjx_jtKbN30_RtBAtV6teJJ` (Configured in `/frontend/.env` via `VITE_WALRUS_SPONSOR_API_KEY`)
- **Workspace Deposit Address:** `0x0dbd1d28e57b8cd56478b5ba4a99528f4b6fd84aeb013ca70f4ac503d81d5472`
- **Funding Status:** Funded with **0.5 SUI** (500,000,000 MIST) from the CLI Deployer Wallet to cover sponsor gas fees.

---

## ✅ 3. Verified & Working Features

1. **Sui Move Smart Contract:** Compiles and publishes flawlessly. Fully manages supply guards, mint fee storage in the treasury, and excess SUI refunds.
2. **Krilly Sponsor Integration Wrapper (`walrus.ts`):** Properly handles API validation, constructs correct multipart payloads with boundary separation, and exposes standard output shapes.
3. **Sequential Mint Pipeline (`useMintNFT.ts`):** 
  - Strictly follows the *Upload-to-Walrus-First* paradigm before building the Programmable Transaction Block.
  - Successfully converts string-based blob identifiers to pure `vector<u8>` for the Sui Move parameters.
4. **Deep-Space Frontend:** Fully operational, responsive, wallet-connect ready, and listening to hosts on `http://localhost:5173/`.

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
