# Beginner Tooling Overview

This document summarizes the additions built in the three onboarding phases. Use it as a map for the new scripts, docs, and utilities.

## Phase 1 – Quick Wins

- **Quickstart Checklist** (`docs/quickstart-checklist.md`): step-by-step setup with English + Kiswahili summary lines.
- **Bootstrap Command** (`yarn bootstrap:beginner`): copies `.env`, fills safe defaults, creates playground folder, and compiles contracts. Supports `--explain`.
- **Playground Scripts** (`scripts/playground/`):
  - `helloFdc.ts`: builds a sample attestation payload (`--explain` friendly).
  - `mockAttestation.ts`: validates mock proof structures.
- **Offline Mock Mode** (`yarn playground:offline`): simulates the attestation flow locally, no RPC calls required.
- **FAQ & Pitfalls** (`docs/faq.md`): answers common setup questions and highlights typical mistakes.

## Phase 2 – Core Learning

- **Interactive Tutorial** (`yarn tutorial:beginner`):
  - Prompts through each attestation step.
  - `--dry-run` avoids network calls.
  - `--explain` adds deeper context.
  - Provides “What just happened?” recaps and robust error messages.

## Phase 3 – Advanced Tooling

- **CLI Explain Mode**: available in bootstrap, tutorial, and playground scripts for extra context.
- **Simple Web2Json Wrapper** (`utils/simpleFdc.ts`): exposes `fetchWeb2Data` and `verifyOnChain` helpers for quick experimentation.
- **Starter Test Suite** (`test/simpleFdc.test.ts`): teaches how to test the wrapper with mocked fetch responses.
- **Progress Tracker Utility** (`utils/progress.ts`): lightweight spinner used by the bootstrap script; easy to reuse elsewhere.
- **Simple Proof Verifier** (`contracts/mock/SimpleProofVerifier.sol`): minimal contract you can deploy with `yarn deploy:simpleProof`.
- **Mock Front-end Viewer** (`frontend/mock-viewer.html`): static page that visualises the offline mock request, proof, and decoded payload.

## Suggested Workflow

1. Read the quickstart checklist and run the bootstrap command.
2. Try the playground scripts with `--dry-run` to see expected payloads.
3. Run `yarn playground:offline` to rehearse the proof verification flow completely offline.
4. Launch the tutorial and progress through each prompt, enabling `--explain` when you want more detail.
5. Experiment with the simple wrapper and extend the test suite with your own scenarios.
6. Keep the FAQ open as you explore more complex scripts like `scripts/fdcExample/Web2Json.ts`.

