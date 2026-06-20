# Security Policy: PULSAR NFT Launchpad

This document outlines the security procedures, supported versions, reporting guidelines, and best practices for the PULSAR NFT Launchpad.

---

## 1. Supported Versions

Security updates are actively backported to the following versions of the PULSAR components:

| Component                 | Version | Supported | Notes                                      |
|---------------------------|---------|-----------|--------------------------------------------|
| `pulsar_launchpad` (Move) | 1.0.0   | Yes       | Currently deployed on Sui Testnet.         |
| `pulsar-launchpad` (React)| 1.0.0   | Yes       | React 18 + Vite client wrapper.            |
| Move Compiler             | 2024    | Yes       | Built using the Sui Move 2024 edition.     |

---

## 2. Reporting a Vulnerability

**Please do not report security vulnerabilities publicly via Github Issues.**

If you discover a vulnerability, please report it privately via:
* **Security Contact Email:** [NEEDS INPUT]
* **GPG Key:** [NEEDS INPUT]

We ask that you include:
1. A detailed description of the vulnerability.
2. Step-by-step instructions to reproduce the issue (including any contract transaction parameters or API payloads).
3. The potential impact of the vulnerability.

We will acknowledge receipt of your vulnerability report within 48 hours and provide a timeline for resolution.

### Responsible Disclosure Guidelines
1. Do not exploit the vulnerability to access unauthorized data or execute transactions beyond proof-of-concept validation.
2. Give us a reasonable time frame to resolve the issue before disclosing it to the public.
3. Do not attempt social engineering, physical security attacks, or denial of service attacks.

---

## 3. Security Best Practices Followed in PULSAR

The codebase incorporates several security design principles:

### Smart Contract Layer (`launchpad.move`)
* **Strict Assertion Guards:** Checks for collection state (`is_active`), supply limits (`current_supply < max_supply`), payment sufficiency (`coin::value(&payment) >= config.mint_price`), and empty asset identifiers (`vector::length(&blob_id) > 0`) are evaluated before state updates occur.
* **Exact Coin Splitting & Excess Refunds:** To prevent overpayment loss, the contract splits the exact mint fee from the incoming `Coin<SUI>` balance and merges it into the treasury, returning any remaining balance to the sender:
  ```move
  let mut payment_balance = coin::into_balance(payment);
  let mint_balance = balance::split(&mut payment_balance, config.mint_price);
  balance::join(&mut config.treasury, mint_balance);
  if (balance::value(&payment_balance) > 0) {
      transfer::public_transfer(coin::from_balance(payment_balance, ctx), tx_context::sender(ctx));
  }
  ```
* **Capability Guarding (`AdminCap`):** Privileged operations such as `admin_withdraw`, `set_active` status toggles, and `set_mint_price` updates require passing the unique `AdminCap` capability object, preventing unauthorized administrative controls.

### Frontend Application Layer
* **API Key Isolation:** The Krilly Walrus Sponsor API key is loaded from runtime environment variables (`import.meta.env.VITE_WALRUS_SPONSOR_API_KEY`) and is not hardcoded within source files to prevent exposure.
* **Input Boundary Sanitization:** File size limits (max 10MB) and MIME type checks (PNG, JPG, GIF, WebP) are enforced client-side before dispatching payloads to external servers.

---

## 4. Out of Scope

The following aspects of security are managed by upstream protocols or external operators and are explicitly **out of scope** for this project's reporting guidelines:
1. Vulnerabilities in the core Sui Network consensus engine or JSON-RPC node network.
2. Vulnerabilities in the Walrus storage network or standard Walrus aggregator server hosting (`aggregator.walrus.space`).
3. Weaknesses or vulnerabilities in the Krilly Walrus Sponsor SDK gateway endpoint service (`walrus-sponsor.krill.tube`).
