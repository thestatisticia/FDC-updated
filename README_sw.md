# FDC-101: Mifano ya Flare Data Connector (Kiswahili)

Mradi huu unaleta mifano ya jinsi ya kuleta data kutoka huduma za Web2 hadi kwenye mtandao wa Flare. Toleo hili pia linaongeza zana rafiki kwa wanaoanza.

## Yaliyomo

- **Web2Json Attestations**: Kupata na kuthibitisha data kutoka API za nje.
- **Bima ya Hali ya Hewa**: Mikataba inayoonesha matumizi ya data ya hali ya hewa.
- **Uthibitisho wa Akiba**: Mifumo ya kriptografia kwa kuthibitisha mali.

## Nyongeza za Wanaoanza

- Soma `README_BEGINNER.md` kwa muhtasari wa Kiingereza wa zana mpya.
- Tumia `docs/kiswahili/` kupata nyaraka za lugha ya Kiswahili (orodha ya kuanzia, maswali ya kawaida, na muhtasari wa zana).
- Amri muhimu:
  - `yarn bootstrap:beginner [--explain]` – Kuandaa mazingira.
  - `yarn tutorial:beginner [--dry-run] [--explain]` – Mafunzo ya mstari kwa mstari.
  - `yarn playground:offline` – Kuiga mchakato bila kutumia mtandao.
  - `yarn hardhat run scripts/playground/helloFdc.ts --network coston2 --dry-run` – Kuona ombi la attestation.
  - `yarn deploy:simpleProof --network <mtandao>` – Kusambaza mkataba rahisi wa uthibitisho (hiari).

## Jinsi ya Kuendelea

1. Fuata `docs/kiswahili/quickstart-checklist.md`.
2. Jaribu skripti za `scripts/playground/`, ukiwemo `playground:offline`.
3. Tumia mafunzo ya CLI au notebook (`notebooks/beginner_walkthrough.ipynb`) kupata maelezo zaidi.
4. Tembelea `frontend/mock-viewer.html` kuona data ya mock kwa njia rahisi ya kuangalia.

Karibu kwenye jamii ya Flare, na usisite kuuliza maswali kupitia njia rasmi za mawasiliano.

