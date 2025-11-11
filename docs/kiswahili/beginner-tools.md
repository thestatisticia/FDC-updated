# Muhtasari wa Zana za Wanaoanza

Huu ni mwongozo wa haraka wa zana zote mpya tulizoleta katika matabaka matatu ya kujifunza.

## Awamu ya 1 – Mafanikio ya Haraka

- **Orodha ya Kuanzia** (`docs/kiswahili/quickstart-checklist.md`): Hatua kwa hatua kuandaa mazingira.
- **Amri ya Bootstrap** (`yarn bootstrap:beginner`): Inaunda `.env`, kujaza chaguo-msingi, kuunda `scripts/playground/` na kuunganisha mikataba (ina `--explain`).
- **Skripti za Playground** (`scripts/playground/`):
  - `helloFdc.ts`: Inaunda ombi la attestation; tumia `--explain` kupata ufafanuzi.
  - `mockAttestation.ts`: Inakagua muundo wa proof ya mfano kabla ya kutumia data halisi.
- **Hali ya Mock ya Nje ya Mtandao** (`yarn playground:offline`): Inaiga mchakato mzima bila kutumia RPC za nje.
- **Maswali ya Mara kwa Mara** (`docs/kiswahili/faq.md`): Majibu ya haraka kwa matatizo ya kawaida.

## Awamu ya 2 – Kujifunza Kiini

- **Mafunzo ya Mstari kwa Mstari** (`yarn tutorial:beginner`):
  - Inakuongoza kwenye kila hatua ya attestation.
  - `--dry-run` huepuka miamala ya moja kwa moja.
  - `--explain` hutoa maelezo ya kina.
  - Baada ya kila hatua kuna muhtasari wa “Nini kimetokea?”.

## Awamu ya 3 – Zana za Juu

- **Chaguo la `--explain`**: Linapatikana kwenye bootstrap, mafunzo, na skripti za playground.
- **Kifupi cha Web2Json** (`utils/simpleFdc.ts`): Kazi rahisi za `fetchWeb2Data` na `verifyOnChain`.
- **Majaribio ya Mwanzo** (`test/simpleFdc.test.ts`): Mfano wa jinsi ya kuandika majaribio ukitumia data bandia.
- **Kifuatiliaji Cha maendeleo** (`utils/progress.ts`): Spinner ya ASCII inayoweza kutumika tena.
- **Mkataba wa Uthibitisho Rahisi** (`contracts/mock/SimpleProofVerifier.sol`): Unaweza kuusambaza kwa `yarn deploy:simpleProof`.
- **Mtazamaji Rahisi wa Mbele** (`frontend/mock-viewer.html`): Ukurasa mwepesi unaoonyesha ombi, proof, na matokeo ya mock.

## Jinsi ya Kuanza

1. Soma `docs/kiswahili/quickstart-checklist.md` na uendeshe `yarn bootstrap:beginner`.
2. Cheza na skripti `scripts/playground/helloFdc.ts` na `mockAttestation.ts`.
3. Endesha `yarn playground:offline` kujizoeza hatua bila mtandao.
4. Endesha `yarn tutorial:beginner -- --dry-run --explain` kwa mafunzo ya kina.
5. Fanya kazi na `utils/simpleFdc.ts` na ongeza majaribio yako miaka ukitumia `test/simpleFdc.test.ts`.

