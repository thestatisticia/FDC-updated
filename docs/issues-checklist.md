# Issue Checklist (Quick Fixes)

Use this list when something goes wrong while unaendesha mifano ya FDC.

## 1. Maandalizi ya Mazingira
- [ ] `node -v` na `npm -v` zinaonekana? Ikiwa la, sakinisha Node.js.
- [ ] `yarn -v` inafanya kazi? Tumia `npm install -g yarn` kama haipo.
- [ ] Faili `.env` ipo na imejazwa vitufe vyote? (`PRIVATE_KEY`, `VERIFIER_API_KEY_TESTNET`, n.k.)
- [ ] Akaunti yako ina tokeni za Coston2? Tembelea faucet ikiwa huna.

## 2. Hitilafu za wakati wa kuendesha
- [ ] Ukitumia `--mock`, hakikisha swichi hiyo imeongezwa mwisho wa amri.
- [ ] “Missing API key” – hakikisha `.env` ina thamani na hujatumia `*_here`.
- [ ] “insufficient funds for gas” – ongeza tokeni kwenye akaunti ya majaribio.
- [ ] “fetch failed” au “timeout” – thibitisha mtandao wa Flare unapatikana na jaribu tena baada ya dakika chache.

## 3. Uthibitisho wa Ushahidi
- [ ] Hakikisha `roundId` uliochapishwa unalingana na ule unaofuatilia.
- [ ] Usijaribu kudai ushahidi kabla ya message “Round finalized!” kuonekana.
- [ ] Ukiwa na ustahimilivu mdogo, tumia hali ya `--mock` kuendelea kujifunza.

## 4. Kuangalia Data
- [ ] Tumia `scripts/tutorial/showCharacters.ts --mock` kama huna anwani ya mkataba.
- [ ] Kwenye `frontend/index.html`, hakikisha umeweka RPC na anwani sahihi kabla ya kubofya “Load from network”.

## 5. Zana za Usaidizi
- [ ] Endesha Notebook (`notebooks/FDC_Web2Json_Walkthrough.ipynb`) kuona hatua na maelezo zikiwa zimeshajazwa.
- [ ] Tumia mwongozo wa terminal (`npx ts-node scripts/tutorial/interactiveGuide.ts`) kwa maagizo ya hatua kwa hatua.

Ukikwama, anza na sehemu ya juu ya orodha hii na utafute ishara ya ✅ kabla ya kuendelea kwenye hatua inayofuata.***

