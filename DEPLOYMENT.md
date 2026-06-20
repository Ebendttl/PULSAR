# Deployment Guide: PULSAR NFT Launchpad

This guide provides the instructions for deploying, updating, and rolling back both the Sui Move smart contract and the React frontend client.

---

## 1. Environment Variables Configuration

Create a `.env` file in the `frontend/` directory by copying `.env.example`. The following environment parameters must be set:

| Variable Name                  | Required | Description                                                         | Example Value |
|--------------------------------|----------|---------------------------------------------------------------------|---------------|
| `VITE_WALRUS_SPONSOR_API_KEY`  | Yes      | API developer key from Krilly Walrus Sponsor dashboard.             | `sbk_live_Dsjx_jtKbN30...` |
| `VITE_SUI_NETWORK`             | Yes      | Active Sui blockchain network environment (`testnet`, `mainnet`).    | `testnet` |
| `VITE_PACKAGE_ID`              | Yes      | Hex-encoded object address of the published smart contract package. | `0xf5935b16c60796a89c9beae...` |
| `VITE_COLLECTION_CONFIG_ID`    | Yes      | Hex-encoded object ID of the shared CollectionConfig object.        | `0xac03d986504fa12774d133ab...` |

---

## 2. Step-by-Step Deployment Process

### Step 2.1: Publish the Move Contract
1. Navigate to the `move/` directory:
   ```bash
   cd move
   ```
2. Build the contract package to check for errors:
   ```bash
   sui move build
   ```
3. Publish the package to Sui Testnet:
   ```bash
   sui client publish --gas-budget 200000000
   ```
4. From the execution output, extract and record:
   * **Package ID** (under `Published Objects`)
   * **CollectionConfig Object ID** (created under `Shared Objects` or `Created Objects`)

### Step 2.2: Configure & Build the Frontend Client
1. Navigate to the `frontend/` directory:
   ```bash
   cd ../frontend
   ```
2. Populate the `.env` file with the extracted Package ID, CollectionConfig ID, and your Krilly Sponsor API key.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Compile and bundle static files:
   ```bash
   npm run build
   ```
   This generates optimized static files inside `frontend/dist/`.
* **Target Platform:** Netlify (configured to serve static Vite assets from `/frontend/dist`).

### Step 2.3: Configure Netlify Deployment
1. Log in to the Netlify Dashboard and click **Add new site** -> **Import an existing project**.
2. Connect your Git repository.
3. In the build settings, configure:
   * **Base directory:** `frontend`
   * **Build command:** `npm run build`
   * **Publish directory:** `frontend/dist`
4. Under **Site Configuration** -> **Environment variables**, inject the 4 required environment variables listed in Section 1.
5. Deploy the site. To support direct client-side reload routes, ensure a `_redirects` file containing `/* /index.html 200` is present in the publish directory.

---

## 3. Rollback Procedures

### Move Smart Contract Rollback
Sui smart contract packages are immutable once published. You cannot overwrite an existing package ID.
To rollback a contract update:
1. Re-deploy the target package from a previous stable git commit.
2. Record the newly created Package ID and CollectionConfig ID.
3. Update the frontend environment variables (`VITE_PACKAGE_ID` and `VITE_COLLECTION_CONFIG_ID`) in `.env`.
4. Re-build and re-deploy the frontend.

### Frontend Rollback
To rollback client interface modifications:
1. Revert to the last stable git tag or commit on your main branch.
2. Trigger a rebuild and deployment via your hosting provider console, or re-run `npm run build` and re-upload the `dist/` folder manually.

---

## 4. Monitoring & Alerting

* **Monitoring Setup:** [NEEDS INPUT: System health monitoring, transaction logging, or analytics dashboards are not configured in this codebase].

---

## 5. Common Deployment & Runtime Failure Points

1. **Walrus Upload Fails with HTTP 402:**
   * *Cause:* The Krilly sponsor API key workspace has run out of SUI gas funding or WAL storage credits.
   * *Fix:* Deposit SUI to the Krilly workspace deposit address or purchase WAL Storage Credits through the Krilly console.
2. **Move Execution Mismatches:**
   * *Cause:* The `VITE_PACKAGE_ID` or `VITE_COLLECTION_CONFIG_ID` environment variables do not match the active network node config.
   * *Fix:* Check `VITE_SUI_NETWORK` and ensure the object addresses match the target network.
3. **TypeScript Build Failures:**
   * *Cause:* Outdated client declarations or type changes in `@mysten/sui` dependencies.
   * *Fix:* Verify that `vite-env.d.ts` is present and that client endpoints resolve using modern `changedObjects` outputs instead of deprecated `effects.created`.
