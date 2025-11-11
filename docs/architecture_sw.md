# Muhtasari wa Miundombinu

Hapa unaona jinsi vipande vya Flare Data Connector (FDC) vinavyoshirikiana na zana mpya za kujifunzia tulizoongeza.

```mermaid
flowchart LR
    subgraph Nje["Nje ya Mtandao"]
        Notebook["Notebook ya Mafunzo\n(notebooks/FDC_Web2Json_Walkthrough.ipynb)"]
        CLI["Mwongozo wa Terminal\n(scripts/tutorial/interactiveGuide.ts)"]
        MockData["Kizalishaji Data Bandia\n(utils/mockData.ts)"]
        Frontend["Kivinjari Rahisi\n(frontend/index.html)"]
    end

    subgraph Hardhat["Mazinga ya Hardhat"]
        Script["Script ya Web2Json\n(scripts/fdcExample/Web2Json.ts)"]
        Utils["Vifaa vya FDC\n(scripts/utils/fdc.ts)"]
        Starter["Mkataba wa StarterCounter\n(contracts/fdcExample/StarterCounter.sol)"]
    end

    subgraph Flare["Mtandao wa Flare"]
        FdcHub["FDC Hub"]
        Validators["Validators"]
        DALayer["Data Availability Layer"]
        Verification["FdcVerification"]
    end

    Notebook -->|inaendesha| Script
    CLI -->|inaongoza| Script
    Script -->|inaandaa ombi| Utils
    Utils -->|inatuma attestation| FdcHub
    FdcHub -->|inatangazia| Validators
    Validators -->|wanathibitisha| DALayer
    DALayer -->|inamrudisha ushahidi| Script
    Script -->|inathibitisha ushahidi| Verification
    Verification -->|inaruhusu| Starter
    Frontend -->|inasoma data| Starter
    MockData -->|inatoa mifano| Script
    MockData -->|inapeleka data| Frontend
```

## Vipengele Muhimu
- **Rasilimali za mafunzo** – Notebook na mwongozo wa terminal vinakuonyesha hatua zote moja baada ya nyingine.
- **Data bandia** – Hukuruhusu kufanya mazoezi bila kutumia tokeni halisi.
- **Mkataba wa kuanzia** – `StarterCounter` unaonyesha jinsi ya kuthibitisha ushahidi na kusasisha hali.
- **Kivinjari rahisi** – Ukurasa wa HTML/JS unaonyesha wahusika waliopo au data bandia kwa haraka.

Chora ramani hii unapochunguza repo: mshale unaonyesha mwelekeo wa data ama maagizo wakati wa mzunguko wa kawaida wa Web2Json.*** End Patch

