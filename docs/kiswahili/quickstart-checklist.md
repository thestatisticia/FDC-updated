# Orodha ya Haraka ya Kuanza

Matumizi: Fuata hatua hizi kuandaa mazingira yako kabla ya kuendesha skripti za FDC.

## 1. Andaa Kompyuta Yako

- Sakinisha Node.js toleo la 18 au juu zaidi na Yarn 1.22+.
- Sakinisha Git kisha uzime repo yako ya FDC kutoka GitHub.
- (Hiari) Sakinisha VS Code pamoja na viendelezi vya Solidity na TypeScript.

## 2. Sakinisha Mahitaji

- Endesha `yarn install` ukiwa kwenye mzizi wa mradi.
- Hakikisha mafanikio kwa kuendesha `yarn hardhat --version`.

## 3. Anzisha Mradi kwa Amri Moja

- Endesha `yarn bootstrap:beginner` (ongeza `--explain` kupata maelezo ya ziada).
- Skripti itaunda faili `.env`, kujaza chaguo-msingi salama na kuandaa mikataba.

## 4. Hariri Vigezo vya Mazingira

- Fungua `.env` na uweke funguo/viunganishi vya RPC/mifunguo ya API unazohitaji.
- Usichapishe siri zako kwenye Git.

## 5. Jaribu Skripti za Playground

- Chagua skripti ndani ya `scripts/playground/`, mfano `helloFdc.ts`.
- Endesha `yarn hardhat run scripts/playground/helloFdc.ts --network coston2 --dry-run`.
- Badili vigezo na uangalie matokeo.
- Unaweza pia kujaribu `yarn playground:offline` kuiga mchakato bila mtandao.

## 6. Fanya Mafunzo ya Hatua kwa Hatua

- Endesha `yarn tutorial:beginner -- --dry-run` (ongeza `--explain` kupata maelezo zaidi).
- Soma `docs/faq_sw.md` kwa maswali ya kawaida.
- Tumia `utils/simpleFdc.ts` pale unapohitaji kufupisha utiririshaji wa Web2Json.

## 7. Hatua Inayofuata

- Jaribu kuendesha skripti bila `--dry-run` kwenye mtandao wa majaribio wenye fedha za faucet.
- Fanyia kazi kifurushi cha majaribio (`yarn test`) ili kuthibitisha mabadiliko yako.
- Jiunge na jumuiya ya Flare ikiwa utakwama.

