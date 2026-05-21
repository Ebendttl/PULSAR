// config.ts — All contract addresses and constants

// ── Walrus Sponsor SDK ──────────────────────────────────────────────────────
// Get your API key at https://walrus-sponsor.krill.tube
// Store in .env — NEVER commit real keys to source control
export const WALRUS_SPONSOR_API_KEY =
  import.meta.env.VITE_WALRUS_SPONSOR_API_KEY || "";

// ── Sui Network ─────────────────────────────────────────────────────────────
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
  description:
    "Pulsar cosmic art — rotating neutron stars, powered by Walrus decentralized storage",
  maxSupply: 31,
  mintPriceMist: 100_000n, // 0.0001 SUI in MIST (BigInt for PTB)
  mintPriceDisplay: "0.0001 SUI",
  walrusStorageEpochs: 5,
};

// ── Walrus Aggregator ────────────────────────────────────────────────────────
export const WALRUS_AGGREGATOR = "https://aggregator.walrus.space/v1";

// ── Suiscan Explorer ─────────────────────────────────────────────────────────
export const SUISCAN_BASE =
  SUI_NETWORK === "mainnet"
    ? "https://suiscan.xyz/mainnet"
    : "https://suiscan.xyz/testnet";
