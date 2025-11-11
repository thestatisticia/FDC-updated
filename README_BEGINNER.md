# Beginner Additions Overview

This fork introduces a beginner-friendly toolkit layered on top of the original FDC-101 project. Use this README as the entry point when you want to discover or share the extra resources we added.

## Quick Links

- `docs/quickstart-checklist.md` – English setup checklist with Kiswahili summaries.
- `docs/quickstart-checklist_sw.md` – Kiswahili version of the checklist.
- `docs/faq.md` / `docs/faq_sw.md` – FAQ and common pitfalls (English & Kiswahili).
- `docs/beginner-tools.md` / `docs/beginner-tools_sw.md` – Phase-by-phase summary of every helper.
- `docs/kiswahili/` – Folder containing Kiswahili translations of the onboarding docs.
- `scripts/bootstrap.ts` – One-command bootstrap (`yarn bootstrap:beginner [--explain]`).
- `scripts/tutorial/beginnerGuide.ts` – Guided walkthrough (`yarn tutorial:beginner [--dry-run] [--explain]`).
- `scripts/playground/` – Copy-paste playground snippets (including offline mock mode).
- `utils/simpleFdc.ts` – Simple Web2Json wrapper APIs.
- `test/simpleFdc.test.ts` – Starter tests for the wrapper.
- `notebooks/beginner_walkthrough.ipynb` – Step-by-step notebook version of the tutorial.
- `contracts/mock/SimpleProofVerifier.sol` – Minimal verifier used in mock flows.
- `frontend/mock-viewer.html` – Static viewer for the mock request/proof data.

## What’s New

### Phase 1 – Quick Wins
- Beginner checklist (English & Kiswahili)
- Bootstrap command to prepare `.env`, defaults, and compilation
- Playground scripts for fast experimentation
- FAQ covering frequent mistakes
- Offline mock mode script for zero-RPC rehearsals

### Phase 2 – Core Learning
- Interactive CLI tutorial with dry-run, explain mode, and “What just happened?” recaps
- Shared dry-run flag support
- Enhanced error handling throughout the beginner scripts

### Phase 3 – Advanced Tooling
- CLI `--explain` option available on bootstrap, tutorial, and playground scripts
- Simple Web2Json wrapper helpers
- Starter test suite for the wrapper
- Reusable ASCII progress tracker
- Simple proof verifier contract + deploy script
- Mock front-end viewer for the offline data flow

## Recommended Order

1. Read `docs/quickstart-checklist.md` (or `_sw.md`) and run `yarn bootstrap:beginner`.
2. Explore `scripts/playground/helloFdc.ts` and `mockAttestation.ts` with `--dry-run`.
3. Run `yarn playground:offline` to simulate the full flow entirely offline.
4. Run `yarn tutorial:beginner -- --dry-run --explain` for the guided CLI experience.
5. Open `notebooks/beginner_walkthrough.ipynb` if you prefer a narrated notebook walkthrough.
6. Extend `utils/simpleFdc.ts`, `contracts/mock/SimpleProofVerifier.sol`, and the test suite as you build custom flows.

## Contributing

- Keep the English and Kiswahili docs aligned.
- Update this README whenever new beginner tooling is added.
- Use the starter tests as a pattern for validating new utilities.

