# Changelog

All notable changes to the PULSAR NFT Launchpad will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- Created `vite-env.d.ts` typescript type definition file to expose Vite environment variables globally.
- Introduced custom vector SVG schematic of a pulsar star for unclaimed gallery items in `NFTGallery.tsx`.
- Integrated vector link and clipboard copy icons in `MintStep.tsx` and cloud-upload arrow SVG inside `UploadStep.tsx`.

### Changed
- Upgraded DApp kit integration client structure in `src/dapp-kit.ts` from `SuiGrpcClient` to `SuiJsonRpcClient` (imported from `@mysten/sui/jsonRpc`) to conform with Sui 2.0+ SDK standards.
- Refactored transaction parsing in `MintStep.tsx` and `useMintNFT.ts` to locate created object IDs via `changedObjects` and `idOperation === "Created"` within Sui TransactionEffects.
- Redeveloped application design system in `globals.css` removing neon colors, glowing components, starfields, and multi-stop gradients in favor of an intentional Obsidian/Slate theme.
- Cleaned up `SuccessModal.tsx` by removing distracting confetti rendering loops and starburst rays.
- Removed all emoji placeholders from component headings and upload zones, replacing them with professional SVGs.

### Fixed
- Fixed TypeScript compile-time errors relating to undefined `import.meta.env` declarations.
- Resolved compilation error `TS2322` by typecasting `defaultNetwork` to `"testnet" | "mainnet"` within `dapp-kit.ts`.
- Resolved type mismatch errors in transaction effects processing.

---

## [1.0.0] - 2026-06-20

### Added
- Core Sui Move contract (`launchpad.move`) implementing `CollectionConfig` shared config state, `PulsarNFT` owned tokens, and administrative capability gates (`AdminCap`).
- Integrated Krilly Walrus Sponsor REST SDK payload constructor in `walrus.ts` to support zero-WAL image hosting.
- Set up React dashboard with `@mysten/dapp-kit` for wallet connections and Programmable Transaction Block (PTB) composition.
- Deployed smart contracts on Sui Testnet (`0xf5935b16c60796a89c9beae130e8932fafa31ac744a4076a3c7ba4cdf02cf180`).
- Funded sponsor workspace address (`0x0dbd...5472`) with `0.5 SUI` to sponsor upload gas fees.
