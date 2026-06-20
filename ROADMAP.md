# Project Roadmap: PULSAR NFT Launchpad

This document outlines the current phase, milestones, icebox ideas, and out-of-scope boundaries for the PULSAR project.

---

## 1. Current Phase: Phase 1 — MVP Core & Design Refinement (Active)

PULSAR is currently in its initial validation phase. The smart contracts are published to the Sui Testnet, and the frontend has been refactored to use a clean Obsidian/Slate theme with zero TypeScript compile-time errors. 

---

## 2. Next Milestones & Deliverables

### Milestone 1: Resolve Walrus Sponsored Uploads (High Priority)
* **Goal:** Fix the `402 (Payment Required)` response when uploading media assets via the Krilly Sponsor REST endpoint.
* **Tasks:**
  1. Access the Krilly Sponsor Dashboard and audit the active **Storage Credits** configuration.
  2. Verify if SUI deposits must be explicitly exchanged for WAL storage units within the Krilly workspace console.
  3. Perform a successful media upload using the frontend dashboard to retrieve a valid `blob_id`.
  4. Perform an end-to-end mint sequence with the returned `blob_id`.

### Milestone 2: Move Contract Testing & Mainnet Readiness
* **Goal:** Verify Move contract edge-cases and prepare for Mainnet deployment.
* **Tasks:**
  1. Write unit tests for `launchpad.move` covering guards (insufficient payment refunds, max supply limits, and pausing functions).
  2. Deploy the smart contract package to Sui Mainnet.
  3. Update `config.ts` and `.env` with Mainnet contract package IDs and object identifiers.

### Milestone 3: Real-Time Art Rendering
* **Goal:** Transition the frontend gallery from static demo arrays to dynamically queried on-chain assets.
* **Tasks:**
  1. Query owned `PulsarNFT` objects using standard Sui JSON-RPC queries (`getOwnedObjects`).
  2. Parse `blob_id` values and render images directly from the Walrus decentralized aggregator (`https://aggregator.walrus.space/v1/{blob_id}`).
  3. Replace the static `DEMO_NFTS` mock dataset with real-time collection metrics.

---

## 3. Icebox Ideas

The following concepts are deferred for future evaluation:
* **Batch Minting:** Allow users to mint multiple NFTs in a single Programmable Transaction Block.
* **Dynamic On-Chain Metadata:** Generate real-time SVG renderings of neutron stars directly in Move smart contracts using custom transaction outputs.
* **Secondary Marketplace integration:** Deep-linking minted items to marketplace platforms on Sui.

---

## 4. Out of Scope

The following domains are explicitly excluded from this project’s scope:
* **Custom Wallet Provider:** PULSAR relies entirely on `@mysten/dapp-kit` to support standard Sui wallets. We will not build or deploy custom wallets.
* **Sponsorship Infrastructure hosting:** We utilize the Krilly Walrus Sponsor API for storage credits. Deploying or maintaining a custom Walrus sponsor backend is out of scope.
