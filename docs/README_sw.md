# Utangulizi wa Mradi

Huu ni mkusanyiko wa mifano inayokuonyesha jinsi ya kutumia Flare Data Connector (FDC). Tumeongeza nyenzo rahisi ili wanaoanza waweze kufuata mchakato bila vikwazo vingi.

## Kilicho Ndani
- **Mifano ya Web2Json**: Kuleta data kutoka API za nje na kuithibitisha kwenye mtandao wa Flare.
- **Bima ya Hali ya Hewa**: Mikataba ya mfano inayotumia data ya halijoto.
- **Vyombo vya Kujifunza**: Notebook, mwongozo wa terminal, na tovuti ndogo ya kuangalia matokeo.

## Kuanzisha Mazingira
1. **Sakinisha utegemezi**  
   ```bash
   yarn install
   ```
2. **Nakili faili ya mazingira**  
   ```bash
   cp .env.example .env
   ```
3. **Jaza vitufe muhimu** ndani ya `.env`:  
   - `PRIVATE_KEY` (akaunti yenye tokeni za majaribio)  
   - `VERIFIER_API_KEY_TESTNET`, `FLARE_RPC_API_KEY`, `OPEN_WEATHER_API_KEY` n.k.
4. **Pata tokeni za majaribio**: tembelea [Coston2 Faucet](https://coston2-faucet.towolabs.com/).

## Jinsi ya Kuendesha Mifano
- **Mfano wa Star Wars (Web2Json)**
  ```bash
  yarn hardhat run scripts/fdcExample/Web2Json.ts --network coston2
  ```
  Tumia `--mock` iwapo huna tokeni au unataka kuendesha bila mtandao wa Flare.

- **Mifano ya Bima ya Hali ya Hewa**
  ```bash
  yarn hardhat run scripts/weatherInsurance/weatherId/createPolicy.ts --network coston2
  yarn hardhat run scripts/weatherInsurance/weatherId/resolvePolicy.ts --network coston2
  ```

## Zana za Kujifunzia
- **Notebook**: `notebooks/FDC_Web2Json_Walkthrough.ipynb` – bofya seli moja baada ya nyingine, au anzisha hali ya `mock`.
- **Mwongozo wa terminal**: `npx ts-node scripts/tutorial/interactiveGuide.ts --mock` – unakuongoza hatua kwa hatua.
- **Data bandia**: `utils/mockData.ts` – mifano ya data ya Star Wars na hali ya hewa kwa majaribio.
- **Mkataba wa kuanzia**: `contracts/fdcExample/StarterCounter.sol` – mfano rahisi wa kuthibitisha ushahidi na kusasisha hali.
- **Kivinjari kidogo (frontend)**: fungua `frontend/index.html` kupitia `npx serve frontend` uone wahusika waliopo au data bandia.

## Muhtasari wa Muundo
```
├── contracts/             # Mikataba ya Solidity (Web2Json & mifano mingine)
├── scripts/               # Faili za Hardhat (Web2Json, bima, mafunzo)
├── utils/                 # Misaada ya mtandao na data bandia
├── notebooks/             # Walkthrough inayotekelezeka
├── docs/                  # Michoro na maelezo ya ziada (ikiwemo faili hii)
├── frontend/              # Kivinjari rahisi kuonyesha matokeo
└── hardhat.config.ts      # Mpangilio wa Hardhat
```

## Nyaraka Nyingine
- `docs/architecture.md` – mchoro wa data inapita wapi.
- `docs/issues-checklist.md` – matatizo ya kawaida na suluhisho.
- `README_updates.md` – maelezo mafupi ya maboresho uliyoongezwa.

Karibu ujaribu kila sehemu kulingana na unachojifunza: Notebook kwa wanaopenda GUI, script kwa watumiaji wa terminal, au frontend ili kuona matokeo kwa macho.***

