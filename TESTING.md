# Testing Guide: PULSAR NFT Launchpad

This document outlines the testing methodologies, running tests locally, test coverage, and identified gaps for both the smart contract and the frontend layers.

---

## 1. Testing Philosophy & Frameworks

### Smart Contract Layer (Sui Move)
We utilize the native Sui Move unit testing framework. Move unit tests permit simulating transactions, gas consumption, and address interactions locally without deploying to any testnet or local network node.

* **How to Run Contract Tests:**
  Navigate to the `move/` folder and run the Sui CLI test tool:
  ```bash
  cd move
  sui move test
  ```

### Frontend Application Layer
There are currently no unit, integration, or end-to-end (E2E) testing frameworks installed or configured in the frontend repository (no Jest, Vitest, Cypress, or Playwright are present in `frontend/package.json`).

* **Frontend Test Framework:** [NEEDS INPUT: Select a frontend testing framework, e.g., Vitest + React Testing Library for unit testing, and Playwright for E2E testing].

---

## 2. Test Coverage & Code Structure

### Smart Contract Layer
Currently, there are **no unit tests** written inside the smart contract files (`move/sources/launchpad.move`). 

#### Gaps & Critical Paths to Cover:
1. **Minting Guards:** Validate that transactions abort with `ECollectionNotActive` if minting is paused, `ECollectionSoldOut` if the current supply equals the max supply, and `EInsufficientPayment` if the paid coin value is less than the mint price.
2. **Refund Logic:** Verify that excess SUI tokens are successfully returned to the minter context.
3. **Authorization Guards:** Verify that only the holder of `AdminCap` can successfully call `admin_withdraw`, `set_active`, and `set_mint_price`.

### Frontend Layer
All frontend integration testing must be performed manually by running the development server (`npm run dev`) and going through the minting flow inside a browser wrapper.

#### Gaps & Manual Testing Scenarios:
1. **Wallet Connection:** Connect/disconnect wallet and ensure states update.
2. **File Size/Type Constraints:** Attempt to upload files greater than 10MB or unsupported extensions (e.g. PDF/TXT) and verify that the validation error triggers.
3. **Failed Upload Recovery:** Trigger network disconnection or simulated 402 errors to ensure the UI displays the error gracefully and permits retrying.

---

## 3. Continuous Integration (CI)

* **CI Setup:** [NEEDS INPUT: No CI configuration files (e.g. GitHub Actions workflows, GitLab CI YAML) exist in this project].
