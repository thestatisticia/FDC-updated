# Architecture Overview

This project demonstrates how Flare Data Connector (FDC) components interact with example consumers, front-end tooling, and the new tutorial utilities.

```mermaid
flowchart LR
    subgraph OffChain["Off-chain"]
        Notebook["Tutorial Notebook\n(notebooks/FDC_Web2Json_Walkthrough.ipynb)"]
        CLI["Interactive Tutorial\n(scripts/tutorial/interactiveGuide.ts)"]
        MockData["Mock Data Generator\n(utils/mockData.ts)"]
        Frontend["Simple Viewer\n(frontend/index.html)"]
    end

    subgraph Hardhat["Hardhat Runtime"]
        Script["Web2Json Script\n(scripts/fdcExample/Web2Json.ts)"]
        Utils["FDC Utils\n(scripts/utils/fdc.ts)"]
        Starter["Starter Counter Contract\n(contracts/fdcExample/StarterCounter.sol)"]
    end

    subgraph Flare["Flare Network"]
        FdcHub["FDC Hub"]
        Validators["Validators"]
        DALayer["Data Availability Layer"]
        Verification["FdcVerification"]
    end

    Notebook -->|runs| Script
    CLI -->|guides| Script
    Script -->|prepare request| Utils
    Utils -->|submit attestation| FdcHub
    FdcHub -->|broadcast| Validators
    Validators -->|attest| DALayer
    DALayer -->|proof| Script
    Script -->|verify proof| Verification
    Verification -->|authorizes| Starter
    Frontend -->|reads data| Starter
    MockData -->|mock bundles| Script
    MockData -->|sample data| Frontend
```

## Component Highlights
- **Tutorial assets** – A Jupyter notebook and interactive CLI walk newcomers through each step.
- **Mock data utilities** – Provide deterministic responses so you can practice without spending tokens.
- **Starter contract** – A minimal counter contract illustrates how to consume proofs in new projects.
- **Simple viewer** – Static HTML/JS page fetches stored characters or mock data for quick demos.

Use this diagram as an orientation map when exploring or extending the repo. Each arrow reflects the direction of data or control flow during a typical Web2Json attestation round.*** End Patch


