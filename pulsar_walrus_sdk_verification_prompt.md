# 🔍 PULSAR — WALRUS SPONSOR SDK INTEGRATION VERIFICATION PROMPT

> Paste this into Claude / Antigravity after the project has been generated.
> Attach or paste the relevant generated files when asked.
> This prompt performs a deep technical audit across 5 layers.

---

## YOUR ROLE

You are a senior Sui blockchain auditor with deep expertise in:
- Walrus decentralized storage protocol
- The Krilly Walrus Sponsor SDK (`https://walrus-sponsor.krill.tube`)
- Sui Move smart contracts and the Object Display Standard
- TypeScript Programmable Transaction Blocks (PTBs)
- React + Vite dApp architecture on Sui

You will audit the PULSAR NFT Launchpad codebase and determine with **certainty** whether the Krilly Walrus Sponsor SDK was genuinely integrated — not faked, not mocked, not substituted with a different storage solution.

---

## WHAT YOU ARE AUDITING

The project must satisfy **one non-negotiable core requirement**:

> NFT images/metadata must be uploaded to Walrus decentralized storage using the **Krilly Walrus Sponsor SDK** at `https://walrus-sponsor.krill.tube`, authenticated via a `Bearer sbk_live_...` API key, and the resulting `blob_id` and `sponsored_blob_id` must be stored on-chain inside the minted `PulsarNFT` Move object.

Anything short of this — using a different publisher, a public endpoint without sponsorship, mocking the upload, or storing images on IPFS/Arweave/centralized servers — is a **FAIL**.

---

## AUDIT CHECKLIST — RUN EVERY CHECK

### ✅ LAYER 1 — `walrus.ts` (SDK Wrapper File)

Check the following. Mark each ✅ PASS or ❌ FAIL with a one-line reason:

- [ ] **L1-A** — File exists at `src/walrus.ts` (or equivalent path)
- [ ] **L1-B** — The upload function makes an HTTP `POST` or `PUT` request to a URL that contains `walrus-sponsor.krill.tube` — NOT any other host (not `walrus.space`, not `nami.cloud`, not `tusky.io`)
- [ ] **L1-C** — The `Authorization` header is set to `Bearer ${apiKey}` where `apiKey` starts with `sbk_live_`
- [ ] **L1-D** — The API key is read from an environment variable (`import.meta.env.VITE_WALRUS_SPONSOR_API_KEY`) — NOT hardcoded
- [ ] **L1-E** — The upload payload uses `FormData` with the file appended (multipart upload) — `Content-Type` is NOT manually set (browser must auto-set multipart boundary)
- [ ] **L1-F** — The function returns (or types) a result shape containing ALL of: `blob_id`, `sponsored_blob_id`, `creator_address`, `sponsor_address`, `tx_digest`
- [ ] **L1-G** — Error handling exists: non-OK HTTP responses throw with a meaningful message parsed from the response body
- [ ] **L1-H** — A helper function constructs the Walrus aggregator URL: `https://aggregator.walrus.space/v1/{blob_id}` — this is what gets stored on-chain as `image_url`

**L1 VERDICT:** ___/8 checks passed

---

### ✅ LAYER 2 — `walrus.ts` Import & Usage in Mint Hook

Check `src/hooks/useMintNFT.ts` (or wherever the mint logic lives):

- [ ] **L2-A** — `uploadToWalrusSponsored` (or equivalent) is imported from `walrus.ts`
- [ ] **L2-B** — The upload is called **BEFORE** the PTB is built — the flow is strictly: Upload → get blob_id → build transaction → sign & execute
- [ ] **L2-C** — `walrusResult.blob_id` is passed into the PTB as a Move argument (as `vector<u8>`)
- [ ] **L2-D** — `walrusResult.sponsored_blob_id` is ALSO passed into the PTB as a separate Move argument
- [ ] **L2-E** — If the Walrus upload fails, the mint transaction is NOT attempted — the error is surfaced to the user instead
- [ ] **L2-F** — The upload result (`blob_id`, `sponsored_blob_id`, `tx_digest`) is displayed in the UI after successful upload — not just logged to console

**L2 VERDICT:** ___/6 checks passed

---

### ✅ LAYER 3 — Move Smart Contract (`launchpad.move`)

Check `move/sources/launchpad.move`:

- [ ] **L3-A** — Module is declared as `module pulsar::launchpad` (not narwhal, not any other name)
- [ ] **L3-B** — `PulsarNFT` struct has a `blob_id: String` field
- [ ] **L3-C** — `PulsarNFT` struct has a `sponsored_blob_id: String` field — both fields exist, neither is omitted
- [ ] **L3-D** — `PulsarNFT` struct has an `image_url: String` field built from the blob_id (e.g. `https://aggregator.walrus.space/v1/{blob_id}`)
- [ ] **L3-E** — `mint_nft` function accepts `blob_id: vector<u8>` and `sponsored_blob_id: vector<u8>` as parameters
- [ ] **L3-F** — Inside `mint_nft`, the `image_url` is constructed by concatenating the Walrus aggregator base URL with the blob_id — it is NOT a hardcoded or user-supplied URL
- [ ] **L3-G** — The `Display` object template uses `{image_url}` so wallets render the Walrus-hosted image correctly
- [ ] **L3-H** — `balance::destroy_zero` or a refund transfer handles any excess SUI payment — no dropped non-zero Balance

**L3 VERDICT:** ___/8 checks passed

---

### ✅ LAYER 4 — PTB Construction (`useMintNFT.ts`)

Check how the Programmable Transaction Block calls the Move contract:

- [ ] **L4-A** — Uses `new Transaction()` from `@mysten/sui/transactions` (NOT the deprecated `TransactionBlock`)
- [ ] **L4-B** — Coin splitting uses `tx.splitCoins(tx.gas, [COLLECTION_META.mintPriceMist])` — does NOT use `tx.object("0x2")` or any other pattern
- [ ] **L4-C** — `blob_id` is encoded as `tx.pure.vector("u8", Array.from(new TextEncoder().encode(blob_id)))` — NOT passed as a raw string
- [ ] **L4-D** — `sponsored_blob_id` is encoded the same way — both args use the correct `vector<u8>` encoding
- [ ] **L4-E** — `CollectionConfig` shared object is passed as `tx.object(CONTRACT_CONFIG.collectionConfigId)`
- [ ] **L4-F** — `moveCall` target is `${packageId}::launchpad::mint_nft` — module and function names match the Move contract exactly

**L4 VERDICT:** ___/6 checks passed

---

### ✅ LAYER 5 — UI Evidence of Real SDK Usage

Check `src/App.tsx`, `src/components/MintCard.tsx`, or equivalent UI files:

- [ ] **L5-A** — The UI has a two-step mint flow: Step 1 is "Upload to Walrus", Step 2 is "Mint on Sui" — they are sequential, not combined into one button
- [ ] **L5-B** — After upload, the UI visibly displays the `blob_id` returned from the Krilly SDK (even truncated is fine)
- [ ] **L5-C** — After upload, the UI visibly displays or links to the Walrus upload `tx_digest`
- [ ] **L5-D** — The NFT image preview after upload loads from `https://aggregator.walrus.space/v1/{blob_id}` — not from a local object URL or data URL
- [ ] **L5-E** — The `.env.example` file contains `VITE_WALRUS_SPONSOR_API_KEY=sbk_live_YOUR_KEY_HERE` — proving the SDK key slot is wired up
- [ ] **L5-F** — There is NO reference to IPFS, Arweave, Pinata, NFT.Storage, or any non-Walrus storage service anywhere in the codebase

**L5 VERDICT:** ___/6 checks passed

---

## SCORING & FINAL VERDICT

| Layer | Max | Passed |
|---|---|---|
| L1 — walrus.ts SDK Wrapper | 8 | ___ |
| L2 — Upload → Mint Flow | 6 | ___ |
| L3 — Move Contract Fields | 8 | ___ |
| L4 — PTB Construction | 6 | ___ |
| L5 — UI Evidence | 6 | ___ |
| **TOTAL** | **34** | **___** |

### Verdict Tiers:

| Score | Verdict |
|---|---|
| 34/34 | ✅ **FULLY COMPLIANT** — Walrus Sponsor SDK genuinely integrated. Submit for reward. |
| 28–33 | ⚠️ **MOSTLY COMPLIANT** — Minor gaps. List exact failing checks and fix before submitting. |
| 20–27 | 🔶 **PARTIAL** — SDK present but integration is incomplete or bypassed in key areas. Do not submit yet. |
| Below 20 | ❌ **NON-COMPLIANT** — Walrus Sponsor SDK was not properly integrated. Antigravity must redo the implementation. |

---

## ADDITIONAL SPOT-CHECK QUESTIONS

After running the checklist, answer these directly:

1. **Is `https://walrus-sponsor.krill.tube` the actual fetch target?**
   Grep the codebase for `fetch(` and `axios` calls. Paste every URL found. None should point to `walrus.space/v1/blobs` directly — that would mean bypassing the sponsor and paying WAL yourself.

2. **Does the `PulsarNFT` on-chain object actually store the blob_id?**
   After a test mint, query the object on Suiscan: `https://suiscan.xyz/testnet/object/{nftObjectId}`. The `blob_id` and `sponsored_blob_id` fields must appear in the object's content fields with real non-empty values.

3. **Does the image render from Walrus?**
   Take the `blob_id` from the minted NFT and open `https://aggregator.walrus.space/v1/{blob_id}` in a browser. The uploaded NFT image must load. If it 404s, the upload either failed or was never done.

4. **Is the API key actually being used?**
   Temporarily replace the API key in `.env` with a deliberately wrong value (e.g. `sbk_live_WRONG`). Run the upload. It must **fail** with an authentication error — not succeed. If it still succeeds, the key isn't actually being sent to the Krilly endpoint.

5. **Can you show the network request?**
   Open browser DevTools → Network tab → trigger an upload. There must be a POST/PUT request to `walrus-sponsor.krill.tube` with an `Authorization: Bearer sbk_live_...` header visible in the request headers panel.

---

## OUTPUT FORMAT

Respond with:

1. A filled-in checklist table (✅ / ❌ for each item)
2. The total score out of 34
3. The verdict tier
4. A list of any failing checks with a one-line explanation of WHY each fails and EXACTLY what code change would fix it
5. A one-paragraph summary verdict: "The PULSAR project [does / does not] qualify for the Krilly Walrus Sponsor SDK reward because..."
