# PULSAR: Sponsored Decoupled NFT Launchpad on Sui & Walrus

PULSAR is a high-performance, decentralized NFT launchpad deployed on the Sui blockchain that utilizes the Walrus network for secure, content-addressed asset storage. By integrating the **Krilly Walrus Sponsor SDK**, PULSAR eliminates the transaction friction associated with media hosting, allowing creators to upload digital assets without purchasing or holding WAL tokens.

---

## 🌌 Core Value Proposition

In standard Web3 NFT platforms, decentralized storage hosting fees (e.g., Arweave, IPFS, Walrus) must be paid upfront by the creator or user, creating a dual-token friction (requiring both the network's gas token and the storage protocol's token). 

PULSAR resolves this by introducing a **Sponsored Storage Pipeline**:
1. **Decoupled Billing:** Creators sign/authorize metadata and payload uploads, while storage costs are paid by a centralized sponsor account via a REST API gateway.
2. **On-chain Attestation:** The resulting content-addressed `blob_id` and contract metadata are permanently bound to the minted `PulsarNFT` object on the Sui network.
3. **Content Addressability:** Images are instantly retrievable via public Walrus Aggregators, guaranteeing data integrity.

---

## 🛠️ System Architecture

PULSAR divides its architecture into three main boundaries: Client Interface, Sponsorship Wrapper, and On-chain Smart Contract.

```
                  ┌─────────────────────────────────────────┐
                  │          Connected Wallet User          │
                  └────────────────────┬────────────────────┘
                                       │
                    Selects Image &    │  Signs Transaction
                    Inputs Metadata    │  for PTB
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │       Frontend Client Application       │
                  │          (React + TypeScript)           │
                  └──────┬───────────────────────────┬──────┘
                         │                           │
         Multipart Form  │                           │  Execute Move Call
         Upload Payload  │                           │  (mint_nft)
                         ▼                           ▼
  ┌─────────────────────────────┐             ┌─────────────┐
  │  Krilly Sponsor REST API    │             │ Sui Testnet │
  │  (v1/upload Gateway)        │             │ Blockchain  │
  └──────────────┬──────────────┘             └──────┬──────┘
                 │                                   │
                 │ Pays Storage                      │  Creates Object
                 ▼                                   ▼
          ┌─────────────┐                     ┌─────────────┐
          │   Walrus    │                     │  PulsarNFT  │
          │   Storage   │                     │   Object    │
          │   Network   │                     └─────────────┘
          └─────────────┘
```

---

## 📝 Smart Contract Structure

The smart contracts are written in **Sui Move (2024 Edition)** and located in the `move/` directory.

### Core Data Models
* **`CollectionConfig` (Shared Object):** Controls global mint variables:
  * `mint_price`: Configured in MIST (e.g., `100_000` MIST = `0.0001` SUI).
  * `max_supply`: Total allowed items in the collection.
  * `current_supply`: Number of minted tokens.
  * `treasury`: Balance holding the collected SUI proceeds.
  * `admin`: Owner address authorized to change collection states.
  * `is_active`: Flag to freeze or enable minting.
* **`PulsarNFT` (Owned Object):** The minted asset representation:
  * `number`: The sequential index of the NFT.
  * `name` & `description`: Metadata strings.
  * `image_url`: Resolvable Walrus aggregator address.
  * `blob_id` & `sponsored_blob_id`: Cryptographic storage keys.
* **`AdminCap` (Owned Object):** An administrative capability token that authorizes treasury withdrawals, pricing adjustments, and contract state changes.

### Main Entry Points
* `mint_nft(...)`: Public function. Checks supply limits, verifies payment coin value, splits exact mint fees into the treasury, issues refunds for overpayment, and transfers the `PulsarNFT` to the caller.
* `admin_withdraw(...)`: Admin function. Withdraws accumulated SUI treasury funds to the admin address.
* `set_active(...)`: Admin function. Pauses or resumes minting sequences.
* `set_mint_price(...)`: Admin function. Modifies the required mint price.

---

## 💻 Technical Stack

* **Contracts:** Sui Move 2024 Edition (`sui-framework` dependency).
* **Frontend:** React 18 + TypeScript + Vite.
* **Wallet Connection:** `@mysten/dapp-kit-react` (v2.0+) and `@mysten/sui` (v2.17.0) utilizing standard `SuiJsonRpcClient` providers.
* **Decentralized Storage:** Walrus via Krilly Sponsor API.
* **Design Guidelines:** Custom "Obsidian/Slate" UI system featuring flat borders, high typographic hierarchy (using `Outfit` and `Inter`), and custom SVG schematics (no cartoon emojis or gradients).

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have the following installed:
* [Sui CLI Tools](https://docs.sui.io/guides/developer/getting-started/sui-install) (v1.20+)
* [Node.js](https://nodejs.org/) (v18.x or higher) and npm (v9.x or higher)

### 2. Smart Contract Deployment
1. Navigate to the contract folder:
   ```bash
   cd move
   ```
2. Compile the package to verify correct dependencies:
   ```bash
   sui move build
   ```
3. Publish the module to Sui Testnet:
   ```bash
   sui client publish --gas-budget 200000000
   ```
4. Extract the published `Package ID` and the newly initialized shared `CollectionConfig` ID from the terminal transaction response.

### 3. Frontend Configuration
1. Navigate to the client directory:
   ```bash
   cd ../frontend
   ```
2. Copy the template environment configuration file:
   ```bash
   cp .env.example .env
   ```
3. Open `.env` and fill in the required variables:
   ```env
   VITE_WALRUS_SPONSOR_API_KEY=sbk_live_...
   VITE_SUI_NETWORK=testnet
   VITE_PACKAGE_ID=0x...          # Insert Package ID
   VITE_COLLECTION_CONFIG_ID=0x... # Insert CollectionConfig ID
   ```

### 4. Running Locally
1. Install dependencies:
   ```bash
   npm install
   ```
2. Launch the Vite development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:5173` (or the fallback port output by the console) in your web browser.

---

## ⚙️ How Sponsored Uploading Works

PULSAR leverages a customized REST interface to communicate with the Krilly sponsor nodes.

1. **Payload Assembly:** When the user drops a file and enters details, the client builds a multipart payload containing the file, creator's wallet address, and storage duration (epochs).
2. **Authorization:** The upload request is signed with a developer API key (`sbk_live_...` prefix) and transmitted via HTTPS:
   ```http
   POST https://walrus-sponsor.krill.tube/v1/upload
   Authorization: Bearer <API_KEY>
   ```
3. **Response Output:** The gateway sponsors the gas, registers the storage slots on Walrus, and returns:
   * `blob_id`: The cryptographic hash of the file.
   * `sponsored_blob_id`: The ID of the on-chain sponsor transaction.
   * `tx_digest`: The Sui transaction hash.
4. **On-chain Storage:** The client submits a Sui transaction passing this `blob_id` directly to `mint_nft`, creating a permanent reference.

---

## 📜 Documentation Index

To assist developers, the following comprehensive guides are available:
* [ARCHITECTURE.md](./ARCHITECTURE.md): Explains deep design trade-offs, system interactions, and directories.
* [API.md](./API.md): Documents endpoints, parameter schemas, and server response shapes.
* [DEPLOYMENT.md](./DEPLOYMENT.md): Guides mainnet and testnet rollouts, environment values, and rollback guidelines.
* [SECURITY.md](./SECURITY.md): Outlines private vulnerability disclosures and smart contract safety policies.
* [CONTRIBUTING.md](./CONTRIBUTING.md): Lays out code conventions, branch names, and conventional commit rules.
* [ROADMAP.md](./ROADMAP.md): Reviews target milestones and active debugging items.
* [TESTING.md](./TESTING.md): Details Move unit testing commands and local contract validation checks.
* [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md): Community engagement standards and expected behaviors.

---

## 📄 License

This project is licensed under the terms of the [MIT License](./LICENSE).