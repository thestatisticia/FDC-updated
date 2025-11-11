# What Changed

I made a few simple helpers so newcomers can follow the Flare Data Connector demo without getting stuck.

## New additions
- **Notebook walkthrough** at `notebooks/FDC_Web2Json_Walkthrough.ipynb` – run each step with one click, or flip on mock mode to avoid network calls.
- **Cleaner Web2Json script** in `scripts/fdcExample/Web2Json.ts` – now prints clear steps and can run offline with the mock bundle.
- **Mock data** in `utils/mockData.ts` – sample Star Wars and weather responses for testing, tutorials, or the front-end.
- **Starter counter contract** at `contracts/fdcExample/StarterCounter.sol` – a tiny template that shows how to verify a proof and update state.
- **Front-end viewer** in `frontend/index.html` – loads stored characters from the chain or the mock list.
- **Interactive CLI guide** at `scripts/tutorial/interactiveGuide.ts` – walks you through the main commands in order.
- **Architecture overview** in `docs/architecture.md` – quick diagram of how everything talks to each other.
- **Docs in Kiswahili** – angalia `docs/README_sw.md` na `docs/architecture_sw.md` kwa muhtasari na mchoro uliotafsiriwa.

Use whatever piece you need: the notebook if you like notebooks, the script if you live in the terminal, or the viewer if you just want to see the data.

