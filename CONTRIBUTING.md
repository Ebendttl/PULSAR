# Contributing to PULSAR NFT Launchpad

We welcome contributions to the PULSAR launchpad. This guide outlines branch naming conventions, commit guidelines, and pull request procedures.

---

## 1. Getting Started

### Fork and Clone
1. Fork the repository on GitHub: `https://github.com/[NEEDS INPUT: Repository URL]/pulsar_launchpad`
2. Clone your fork locally:
   ```bash
   git clone https://github.com/[NEEDS INPUT: Fork Username]/pulsar_launchpad.git
   cd pulsar_launchpad
   ```
3. Add the upstream remote:
   ```bash
   git remote add upstream https://github.com/[NEEDS INPUT: Repository URL]/pulsar_launchpad.git
   ```

### Local Setup
Ensure you have the following prerequisites installed:
* Sui CLI (Sui Move 2024 edition support)
* Node.js & npm (React 18 & TypeScript support)

To run the development server locally:
```bash
cd frontend
npm install
npm run dev
```

---

## 2. Branch Naming Conventions

Branches should be named according to their purpose, prefixing them with a type:

* `feature/` - For new features (e.g., `feature/wallet-disconnect`)
* `bugfix/` - For bug fixes (e.g., `bugfix/upload-status-error`)
* `refactor/` - For structural changes that do not alter behavior (e.g., `refactor/obsidian-theme`)
* `docs/` - For documentation changes (e.g., `docs/architecture-overview`)

---

## 3. Commit Message Guidelines

PULSAR follows the **Conventional Commits** specification. Inferred from local repository logs, commit messages must structure as:

`<type>: <description>`

### Allowed Types:
* `feat`: A new feature
* `fix`: A bug fix
* `refactor`: A code change that neither fixes a bug nor adds a feature
* `docs`: Documentation changes only
* `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc.)
* `test`: Adding missing tests or correcting existing tests

### Examples from Commit History:
* `refactor: update minting logic and dependencies for NFT creation flow`
* `refactor: update DApp Kit configuration and initialize project environment file`

---

## 4. Pull Request & Review Process

1. Create a new branch from `main`:
   ```bash
   git checkout -b feature/my-new-feature
   ```
2. Make your changes and verify that the frontend compiles cleanly:
   ```bash
   cd frontend
   npm run build
   ```
3. Commit and push your branch to your origin:
   ```bash
   git push origin feature/my-new-feature
   ```
4. Open a Pull Request against `upstream/main` with a clear description of the modifications, screenshot proof (if UI is affected), and verification steps.
5. All PRs must pass type checks and linting before merging. At least one review is required from: [NEEDS INPUT: Code review team / Owner username].

---

## 5. Governance and Decision Making

Project decisions, feature roadmaps, and PR approvals are determined by:
* [NEEDS INPUT: Governance model, e.g., Core Maintainer consensus, DAO proposal structure, or Single-Owner dictatorship].
