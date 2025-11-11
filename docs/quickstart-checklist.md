# Beginner Quickstart Checklist

Use this checklist to get an environment up and running quickly. A short Kiswahili summary is provided after each section.

## 1. Prepare Your Machine

- Install Node.js 18+ and Yarn 1.22+.
- Install Git and clone your fork of the FDC repo.
- (Optional) Install VS Code with the Solidity and TypeScript extensions.

_Kwa Kiswahili_: Weka Node.js, Yarn, Git, na upakue toleo lako la jalada kutoka GitHub. VS Code ni hiari.

## 2. Install Dependencies

- Run `yarn install` at the project root.
- Confirm success by running `yarn hardhat --version`.

_Kwa Kiswahili_: Endesha `yarn install`, kisha hakikisha Hardhat iko sawa kwa kutekeleza `yarn hardhat --version`.

## 3. Bootstrap the Project

- Execute the beginner bootstrap script: `yarn bootstrap:beginner`.
- The script copies `.env.example` to `.env`, fills in safe defaults, and compiles contracts.

_Kwa Kiswahili_: Tumia `yarn bootstrap:beginner` ili kuunda faili la mazingira na kuandaa mikataba.

## 4. Configure Environment Variables

- Open `.env` and update API keys, RPC URLs, and private keys.
- Never commit real secrets to Git.

_Kwa Kiswahili_: Hariri `.env` na ujaze funguo zako za siri. Usizichapishe hadharani.

## 5. Run a Playground Script

- Choose a script under `scripts/playground/`, e.g. `helloFdc.ts`.
- Run `yarn hardhat run scripts/playground/helloFdc.ts --network coston2 --dry-run`.
- Review the output and try modifying parameters.

_Kwa Kiswahili_: Jaribu moja ya hati kwenye `scripts/playground/`. Endesha na mtandao unaofaa na uangalie matokeo.

## 6. Explore Tutorials and Docs

- Launch the guided tutorial: `yarn tutorial:beginner -- --dry-run`.
- Read the FAQ in `docs/faq.md` for common issues.
- Refer to `docs/beginner-tools.md` for an overview of the helper utilities.

_Kwa Kiswahili_: Tumia mwongozo wa hatua kwa hatua (`yarn tutorial:beginner`). Soma maswali yanayoulizwa sana kwenye `docs/faq.md`.

## 7. Next Steps

- Try running scripts without `--dry-run` on a test network.
- Explore the advanced tooling (progress tracker, CLI explain mode, starter tests).
- Join the Flare community channels if you get stuck.

_Kwa Kiswahili_: Baada ya kuzoea, jaribu kuunganisha na mitandao ya majaribio na tumia zana za juu. Jiunge na jumuiya kwa msaada.

