# 🚀 PULSAR NFT Launchpad

**Sui NFT Launchpad with Sponsored Walrus Storage**

Mint cosmic neutron star art as NFTs on Sui blockchain with zero-WAL-cost decentralized image storage via the Krilly Walrus Sponsor SDK.

## Architecture

```
Frontend (React + Vite + TS)
  ├── Upload image → Krilly Walrus Sponsor SDK → blob_id
  └── Sui Wallet → PTB → Move Contract → Mint NFT

Move Smart Contract (Sui Testnet/Mainnet)
  ├── CollectionConfig (shared object) — price, supply, admin
  ├── PulsarNFT (owned object) — name, image_url, blob_id
  └── Publisher + Display standard

Walrus Decentralized Storage
  └── Images stored as blobs, retrievable at aggregator.walrus.space
```

## Quick Start

### 1. Deploy the Move Contract

```bash
cd move
sui client publish --gas-budget 200000000
# Copy PackageId and CollectionConfig object ID from output
```

### 2. Configure Frontend

```bash
cd frontend
cp .env.example .env
# Edit .env with your:
# - Walrus Sponsor API key (sbk_live_...) from https://walrus-sponsor.krill.tube
# - Package ID from deploy step
# - CollectionConfig object ID from deploy step
```

### 3. Install & Run

```bash
npm install
npm run dev
```

## How Walrus Sponsor SDK Works

1. User selects image in the dApp
2. Frontend POSTs to `https://walrus-sponsor.krill.tube/v1/upload` with Bearer API key
3. Krilly pays WAL storage fees on behalf of user
4. Returns: `blob_id` (content address) + `sponsored_blob_id` (Sui object ID) + `tx_digest`
5. `blob_id` is stored on-chain in the PulsarNFT object
6. Image is retrievable at: `https://aggregator.walrus.space/v1/{blob_id}`

## Stack

- **Smart Contract:** Move (Sui 2024 edition)
- **Frontend:** React 18 + TypeScript + Vite
- **Wallet:** @mysten/dapp-kit-react (modern gRPC)
- **Storage:** Walrus via Krilly Sponsor SDK
- **Design:** Deep space aesthetic with Orbitron, IBM Plex Mono, Syne fonts

## Collection Details

- **Name:** PULSAR
- **Max Supply:** 31
- **Mint Price:** 0.0001 SUI
- **Storage:** 5 Walrus epochs (sponsored)

## License

MIT