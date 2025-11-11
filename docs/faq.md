# Beginner FAQ & Common Pitfalls

## Frequently Asked Questions

### 1. I ran `yarn bootstrap:beginner` and it failed during compilation. What now?

Install dependencies with `yarn install` first, then re-run the bootstrap script. If the error persists, delete the `cache/` and `artifacts/` folders and compile again.

### 2. Which network should I use for my first test?

Start with `coston2`. It is beginner friendly, has faucet access, and matches the examples in the tutorial scripts.

### 3. How do I set my private key safely?

- Create a dedicated wallet for testing.
- Store the key only in `.env`.
- Never commit your `.env` file.

### 4. How do I get test tokens?

Use the Flare faucet for `coston2` or `songbird`. Links are listed in `docs/quickstart-checklist.md`.

### 5. Can I run scripts without touching the network?

Yes. Many scripts support the `--dry-run` flag, which simulates the steps without sending transactions.

### 6. Where can I ask for help?

Join the Flare community channels or open a GitHub discussion on your fork. Mention the exact script and step where you are stuck.

## Common Pitfalls

- **Missing environment variables:** Always run `yarn bootstrap:beginner` and edit `.env` before running scripts.
- **Wrong network selection:** Verify the `--network` flag matches the RPC you configured.
- **Outdated dependencies:** Delete `node_modules/` and re-run `yarn install` if you see module resolution errors.
- **Insufficient faucet funds:** Request fresh tokens when switching networks.
- **Copying production keys:** Use dedicated test keys to avoid leaking sensitive information.
- **Ignoring summaries:** After each tutorial step, read the “What just happened?” recap to confirm your understanding.

