# Golden pin declaration ledger

Every re-pin of engine/golden-reference.csv is DECLARED here. A re-pin without
a ledger entry is invalid. The ctest golden_check diffs each build's dump
against this repo pin (never regen-vs-regen); a FAIL means either fix the
engine or do a declared re-pin via scripts/repin-golden.sh (Damla approval
required for behavior changes).

## Pin history

### 2026-09-04 — 25416 lines, md5 eb1d52bc31d1b2e92ad7e737a9ed854c (DECLARED RE-PIN, M7-fitted, ⚠ DAMLA ONAYI BEKLIYOR)
- Label: "M7-fitted: uzatilan bedende bel noktasi kontura geri kondu (yan dikis
  artik koltukalti -> BEL -> kalca; bel genisligi yalniz bir Bezier kontrol
  noktasiydi, cizilen bel EU38'de 238.7mm iken kalibin kendi beli 229.2mm)".
- ⚠ ONAY DURUMU: **YOK.** Bu re-pin bir onarim turunda yapildi ve Damla'ya
  sorulamadi. Kayit bu yuzden ONAY BEKLIYOR olarak duruyor; kok sebep, once/sonra
  sayilari ve etkilenen parca listesi asagida, karar Damla'nin.

- (a) KOK SEBEP — TEK KALEM, motorun KENDI hesapladigi sayiya karsi olculdu:
  `engine/src/garment.cpp extendPiece` (dart modu) ve `engine/src/bodice.cpp`
  prenses yan paneli, beli gecen bir ustte yan dikisi TEK bir kubikle
  koltukaltindan etege indiriyordu; kalibin kendi bel genisligi (`waistlineWidth`,
  yani `frontWidth - sideTake`) o kubigin yalniz KONTROL NOKTASIYDI. Bir Bezier
  kontrol noktasindan GECMEZ. Yani "fitted" diye satilan bir ust, kalibin kendi
  bel sayisindan daha genis kesiliyordu ve alicinin gordugu cizimde bel hic
  daralmiyordu (KOSU/ciktilar/bugra-rapor.md, [MOTOR EKSIGI] "fitted top BELDE
  DARALMIYOR", durum ACIK; bugra-spec-giysi.png'nin kendi ust yazisi da bunu
  itiraf ediyordu). Duzeltme: bel noktasina inen CIZGI konturda tutuluyor
  (kapali/crop bedenin hep yaptigi sey), sonra belden kalcaya ayni kubik.
  **YENI SAYI YOK, YENI SABIT YOK** — `waistlineWidth` zaten hesaplanmisti.

- (b) ONCE / SONRA (calistirilmis olcum, `engine/build/golden_dump`):
  | govde, top/crew/hip | cizilen bel yarim-genisligi ONCE | SONRA | kalibin kendi beli |
  |---|---|---|---|
  | EU38 | 238.7 mm (bel noktasi konturda YOK) | 229.2 mm | 229.2 mm |
  | pear | 265.6 mm | 251.4 mm | 251.4 mm |
  | bigNeckSmallShoulder | 271.4 mm | 262.5 mm | 262.5 mm |
  EU38'de ceyrekte 9.5 mm = cevrede 3.8 cm; pear'da ceyrekte 14.2 mm = 5.7 cm.

- (c) ETKILENEN PARCALAR: 187 spec'in **50'si** degisti, hepsi UST
  (`top/*/hip/*` + `top/*/tunic/*`); tek degisiklik `Top Front` / `Top Back` (ve
  prenses `Top Side *`) konturunda bir LINE komutunun geri gelmesi. Elbise, etek,
  kol, yaka, manset, cropped ust: **BAYT AYNI** (0 satir degisti). Satir sayisi
  25116 -> 25416 = 50 spec x 2 yari x ~3 dump satiri.

- (d) BIRLIKTE DUZELEN SESSIZ KAPI: `engine/src/validator.cpp topSideSeamLength`
  yan dikisi "son iki EGRI" diye ariyordu; cizgi geri gelince `nullopt` donup
  on/arka yan dikis kuralini her uzatilmis ustte SESSIZCE KAPATACAKTI. Fonksiyon
  artik cizgi+egriyi birlikte olcuyor, prenses hali de oyle
  (`princessTopSideSeam`). `sideseam_adversarial_check`'in `commands[4]` sabit
  indeksi de topolojiye cevrildi — esik DEGISMEDI, adversary yeniden gercek
  yan dikisi bozuyor. Kanit: `sewable_census` 82980 taslakta 82980 sewable
  (sideseam 120 -> 0), `sideseam_adversarial_check` + `walkgate_check` yesil.

### 2026-09-03 — 25116 lines, md5 da98352aa171231a8a7bb5f6f04a4b92 (DECLARED RE-PIN, hakem K2 ONAYLI, M2-bugra)
- Label: "M2-bugra: set-in scye karni yayinlanmis Aldrich p.11 genislik cizgisine
  oturdu (on/arka acik 11.08/9.05 -> 0.00mm); arka kelepce ON yaka genisligiyle
  olculmekten cikti; puf kapak tavani ayni yayinlanmis 150mm banda yeniden
  turetildi (1.095 -> 1.080)".
- ONAY: hakem karari K2, "DECLARED RE-PIN olarak ONAYLANDI" (bu fazin hakem
  raporu). Sart: kok sebep + once/sonra sayilari + etkilenen parca listesi
  burada yazili olacak. Uc sart da asagida.

- (a) KOK SEBEP — uc kalem, ucu de motorun KENDI yayinlanmis yasasina karsi
  olculdu, Bugra'ya benzesin diye DEGIL:
  1. `engine/src/bodice.cpp armholeCurveFor` set-in dali: kubigin BASLANGIC
     tegeti disari bakiyordu (`cp1.x = shoulder.x + dx*setInArmholeCp1OutShare`,
     yani x'(0) > 0). Egri omuz ucundan DISARI ayrildigi icin cizilen oyugun en
     kucuk x'i omuz ucunun TA KENDISI oluyordu ve `solveHollow`'un useWidthLine
     dali ULASILAMAZ bir hedefi kovalayip tavana oturuyordu. Yayinlanmis
     genislik cizgisi (bodice.hpp scyeChestWidthHalf*/scyeBackWidthHalf*,
     Aldrich p.11) hic kullanilmiyordu. Duzeltme TEK SATIR ve YENI SABIT YOK:
     cizgi kullanilabilirken `cp1.x = innerLimit`.
  2. `engine/src/bodice.cpp draft()` `naturalTipXForScye`: tek bir "dogal omuz
     ucu" ON yaka genisligiyle (frontNeckWidthFactor 0.17) hesaplanip AYNI deger
     arkaya da uygulaniyordu. Arka yaka daha genis (0.197), yani gercek arka
     omuz ucu o referansin disinda kaliyor ve `scyeMaxInset` arkada GERCEKTE
     OLMAYAN bir kelepce vuruyordu. Duzeltme: capa yariya gore ayri hesaplaniyor
     (`naturalTipXFront` / `naturalTipXBack`), yeni sabit YOK.
  3. `contract/tables.json sleeveCapPuffedLift`: bu tavan "yayinlanmis bandin
     tepesi / motorun KENDI cizdigi duz kapak" olarak turetilmis bir ORAN.
     (1) ve (2) oyugu uzattigi icin PAYDA degisti (duz kapak 136.98 -> 138.83mm,
     `engine/tools/puf-probe.cpp`). PAY degismedi (Aldrich EU38 bandinin tepesi
     150.0mm). Oran yeniden turetildi: 150.00/138.83 = 1.0805 -> asagi yuvarlanmis
     1.080. Bu bir GEVSETME DEGIL: tavan hala ayni yayinlanmis 150mm.

- (b) ONCE / SONRA (hepsi calistirilmis olcum):
  | olcu | ONCE | SONRA |
  |---|---|---|
  | on scye karni (yayin cizgisi 162.00) | 173.08 (acik 11.08) | 162.00 (acik 0.00) |
  | arka scye karni (yayin cizgisi 172.00) | 181.05 (acik 9.05) | 172.00 (acik 0.00) |
  | on oyuk yay/kiris (Bugra tanigi 1.229) | 1.066 | 1.123 |
  | arka oyuk yay/kiris (Bugra tanigi 1.175) | 1.033 | 1.072 |
  | oyuk toplami EU38 (K1 bandi 400-440) | 404.3 | 422.9 |
  | duz kapak yuksekligi EU38 (Aldrich 130-150) | 136.98 | 138.83 |
  | puf kapak yuksekligi EU38 (tavan 150) | 149.99 | 149.94 |
  | puf/duz kapak orani (ilan) | 1.095 | 1.080 |

- (c) ETKILENEN PARCALAR — 25116 satirin 5432'si yerinde degisti, satir sayisi
  DEGISMEDI (topoloji ayni, koordinat farkli):
  | parca | katman | degisen satir |
  |---|---|---|
  | Balloon Sleeve | outline | 1261 |
  | Balloon Sleeve | marking | 1260 |
  | Sleeve | outline | 1246 |
  | Sleeve | marking | 840 |
  | Bodice Front | outline | 240 |
  | Bodice Back | outline | 232 |
  | Top Front | outline | 180 |
  | Top Back | outline | 174 |
  | Sleeve Cuff | outline | 2 |
  Kol parcalari en cok etkilenen: oyuk uzayinca kapak ona oturuyor. `notches`
  katmani golden dump'a GIRMEZ, o yuzden bu fazin centik islerinin pin uzerinde
  SIFIR etkisi var (dogrulandi: diff'te yalniz outline/marking satirlari).

- (d) KANIT — kosulan kapilar (hepsi bu agacta, bu commit'te):
  engine_check 70200/70200 draft PASS · garment_armhole_check YESIL ·
  sleeve_check YESIL (569 hukum) · locket_check YESIL (42 hukum) ·
  buzgu_katman_check hepsi yesil · sewability_check PASS (notch_off_boundary
  211 -> 0, mark_far_from_edge 342 -> 0, ikisi de TAVAN INDIRILDI) ·
  cuttable_output_check PASS · notch_alignment_check PASS ·
  recipe/dxf/wasm parity hepsi PASS · sewable_census PASS · wearable_check PASS.

### 2026-09-02 — 25116 lines, md5 e98bdbede2a6a8d43e97c434810f9168 (HAKEM/DAMLA ONAYI BEKLIYOR, F5-parca)
- Label: "f5-parca: kosullu fermuar (gecis kurali contract/parca-gecis-v1.json),
  pens eskalasyonu (iki pens >3cm, prenses >6cm), birlesik etek kalibi
  fermuarsiz elbisede; engine_check 70200/70200 yesil".
- Divergence: F5-parca calisma agaci (bu commit). Uc davranis degisti, ucu de
  kasitli ve kapili:
  1. PENS ESKALASYONU (bodice.cpp makePiece): tek pens agzi 30mm'i asinca
     intake IKI pense bolunur (1/3-2/3, skirt.cpp emsali) — OUTLINE byte-ayni,
     yalniz markings degisir. Esikler contract/parca-gecis-v1.json (kaynak
     zayif etiketli, anicka.design + curvysewingcollective). PRENSESE OTOMATIK
     GECIS ILK DENEMEDEN GERI ALINDI (ayni gun): recipe_dress_golden_check
     motor pinine BYTE paritesi ister, motorun tek basina prensese kacmasi
     pariteyi kirdi (26616-satirlik ara pin bu yuzden 25116'ya indi).
     Satir artisi 23406 -> 25116: iki pensin fazladan marking satirlari.
  2. KOSULLU FERMUAR (garment.cpp DressBlock + wearability::gecisKurali):
     elbisenin CB fermuari olculen karara baglandi — yaka acikligi (strec
     dahil) ve bel gecisi bas referansi 510mm'i (theknitwit) asiyorsa fermuar
     ve CB dikisi dusuyor; dokuma dar yakali elbise fermuarini SAYILI gerekceyle
     tutuyor ("fermuar: yaka 36.0cm < bas 51.0cm").
  3. BIRLESIK ETEK (skirt.cpp merged): fermuarsiz, prensessiz, arkaya ozel
     ozelliksiz elbise etegi tek kalip "Skirt Front & Back" (cut 2 on fold) —
     iki ceyrek olculerek ozdes (ayni argumanlar, yalniz pens boyu 90/130
     birlestirmede 90'a esitlenir).
- Evidence: engine_check ALL PASS (70200 draft, 15 govde x 4680 spec);
  fit_proof ALL PASS; fba_check 72/72; wearable_check/closed_garment/compose/
  capability/suppress/sewable_census/recipe goldens YESIL; yeni kapi
  parca_sayisi_check (A-line kolsuz orme = 3 kesim parcasi, duz etek = 2,
  duz kollu = 4, her parca gerekceli, kosulsuz parca 0).
- Onay: hakem raporunda KARAR GEREKEN olarak isaretli (faz ajani Damla'ya
  soramaz); onaysiz kalirsa geri alma tek commit revert.

### 2026-08-24 — 23406 lines, md5 d5b5f28b2ef41a776b14699e9220982a (DAMLA ONAYI BEKLIYOR, K-V1A)
- Label: "scye derinligi Aldrich p.11'e baglandi (52ae85c) — depth = 0.10*bust
  + 122mm + nape ofseti, kaynaksiz backLength*0.44 kolonu terk edildi; bagimsiz
  tanik sloper_check (temmuz pini) ONCE de SONRA da YESIL, scye depth hatasi
  Aldrich 215'e gore -10.6mm -> -5.0mm iyilesti".
  (Bu etiketin 2026-08-24 tarihli ilk hali "scye depth 189.0 -> 210.0mm" diyordu;
  o sayi ve ondan turetilen "once kirmiziydi" iddiasi ayni gun OLCUMLE CURUDU —
  asagidaki INDEPENDENT WITNESS maddesine bak.)
- Divergence commit: 52ae85c "KIRMIZI: source the scye depth to aldrich, solve
  the scye hollow, gate the shipped line" (23 Aug 2026). Site of the change:
  `engine/src/bodice.cpp:905-907` (shoulder seam length now bust-sourced) and
  `engine/src/bodice.cpp:917-924` (scye depth).
  - OLD: `torsoArmholeY = backLength * armholeDepthFactor + shoulderDrop`
    (backLength * 0.44, an unsourced size-table column that STALLS at EU44->46 —
    that stall is where the armhole grade broke).
  - NEW: `torsoArmholeY = bust * scyeDepthPerBust + scyeDepthInterceptMM +
    neck * backNeckCutoutFactor`, i.e. `0.10*bust + 122mm` from Aldrich p.11's
    two published points (21.0cm @ bust 88, 21.4cm @ bust 92), plus the nape
    offset because Aldrich measures the depth FROM THE NAPE while our y origin
    is the neck-point line.
  - Same commit also sources the shoulder seam to Aldrich p.11 (12.25cm @ bust
    88, 12.5cm @ bust 92 -> `shoulderSeamMM = 0.0625*bust + 67.5`), replacing a
    flat 126mm that was only right at one size.
- CONTENT DIFF (what moved, not line arithmetic). 23406 -> 23406 lines, ZERO
  keys added or removed, key order byte-identical. 9651 lines (41.23%) changed
  IN PLACE; overall max delta 62.7764mm, median 5.6000mm. Per piece
  (`n` = changed lines, max/median in mm):

  | piece | n | max mm | median mm |
  |---|---|---|---|
  | Bodice Front | 1020 | 62.7764 | 6.1286 |
  | Top Front | 615 | 62.7764 | 6.1286 |
  | Balloon Sleeve | 2520 | 49.7051 | 23.7478 |
  | Sleeve | 1995 | 49.7051 | 23.2728 |
  | Bodice Back | 2120 | 47.4355 | 0.0022 |
  | Top Back | 840 | 47.4355 | 3.2499 |
  | fabric (yardage rows) | 41 | 0.1000 | 0.1000 |
  | Skirt Front | 150 | 0.0001 | 0.0001 |
  | Skirt Back | 150 | 0.0001 | 0.0001 |
  | Skirt Skirt Panel (quarter circle) | 200 | 0.0001 | 0.0001 |

  Reading: everything that moved is a BODICE/SLEEVE piece — the six garment
  pieces the scye depth and shoulder seam actually feed. The skirt pieces DID
  NOT MOVE: their largest delta across all 500 changed skirt rows is 0.0001mm
  (last-digit print noise, not geometry). The 41 `fabric` rows moved by exactly
  0.1 (yardage rounding step) and no more. Sleeves carry the largest median
  because the cap re-seats by bisection onto the new armhole.
- INDEPENDENT WITNESS: `sloper_check` (ctest #51) — pinned in July from an
  independent Aldrich hand-draft, i.e. it was NOT written to match this change.
  MEASURED, both sides (2026-08-24, `GECE/log/V1-F.sloper-tanik.txt`): the check
  is GREEN BEFORE the change AND GREEN AFTER it. What moved is the error it
  carries against the Aldrich target, from **-10.6 mm to -5.0 mm**.
  - BEFORE (`52ae85c^` = `c3d4359`, built in a separate `-DCMAKE_BUILD_TYPE=Release`
    worktree): `scye depth below nape   engine 204.4   aldrich 215.0   err -10.6 mm`
    -> `[PASS] ... within 15 mm`, `all sloper checks pass`, exit 0.
  - AFTER (today's HEAD, `engine/build/sloper_check`):
    `scye depth below nape   engine 210.0   aldrich 215.0   err -5.0 mm`
    -> `[PASS] ... within 15 mm`, `all sloper checks pass`, exit 0.
  - WHAT THIS WITNESS IS WORTH: it supports the DIRECTION of the new pin — the
    draft moved TOWARD Aldrich on a bound that a third party pinned in July. It
    is NOT evidence of the "turned a red green" class. The check would have
    passed either way; it never gated this change.
  - ⚠ CORRECTION (2026-08-24). The earlier sentence in this ledger and the same
    sentence in the `e8b7f19` commit body — "sloper_check was RED before 52ae85c",
    "scye depth 189.0 -> 210.0" — is REFUTED BY MEASUREMENT. It was green before.
    The number `189.0` appears in NEITHER probe; it was never measured. The label
    line at the top of this entry carries the same wrong claim and is corrected
    here rather than deleted, so the refutation stays visible. `e8b7f19`'s commit
    message cannot be rewritten (history is not rewritten), so its body is covered
    by THIS correction.
  - Same probe, unasked but in the same output: `shoulder seam (drawn)` moved
    126.0 (err +3.5) -> 122.5 (err +0.0) and `shoulder tip drop` 50.7 -> 49.4.
    Both were [PASS] before and after — same class, green to greener.
  - Command trail and both full outputs: `GECE/log/V1-F.sloper-tanik.txt`.
- Recipe path shipped in the same chain: `recipes/shift-dress-square-spaghetti.json`
  now draws the scye with the motor's OWN solver (`scye` op, e4516cf) instead of
  copying its control points. `recipe_dress_check` -> PASS 125 / FAIL 0, exit 0.
  Evidence log: `GECE/log/V1-A.olcum.txt`, full ctest `GECE/log/V1-A.ctest.after.txt`.
- APPROVAL STATUS: **DAMLA ONAYI BEKLIYOR (K-V1A)** — varsayilan yurudu (the pin
  and the ledger are committed together so the tree is coherent), but the
  behavior change is NOT taste-approved yet. Damla's eye on the new armhole is
  the open gate.

### 2026-07-28 — 23406 lines, md5 fcaa935448b58ef38d108ffeda49e2df (DAMLA APPROVAL PENDING)
- Label (pending Damla's wording): "set-in armscye — kollu giysiler artik
  set-in kol oyugu aliyor, kolsuz-teget degil".
- What changed vs previous pin (7c3d83f...): the set-in armscye kernel model
  (bodice.hpp setInArmhole*) is wired into the engine's own SLEEVED drafting
  (makePiece + makePrincessPieces, setInScye = !sleeveless && neckline!=Halter).
  cp1 breaks from the shoulder-seam tangent and drops into the scye; deeper
  hollow than the sleeveless curve. 5372 lines changed, ALL sleeved dresses
  (balloon/straight sleeves); ZERO sleeveless (none.*) and ZERO skirt lines
  changed. Zero keys added/removed. Example (dress/crew/aLine/straight.short,
  Bodice Front armhole cubic): cp1 (222.3,65.8)->(180.4,122.0),
  cp2 (217.1,186.2)->(211.6,171.9); shoulder tip + underarm endpoints unchanged.
- Why: a set-in sleeve needs a set-in armhole; the old tangent-continuous
  sleeveless scye was geometrically wrong under a sleeve (the Bugra-Locket bridge
  measured a 20.6mm structural residual from exactly this). Geometry, not a
  reference copy (Damla 2026-07-28: "geometri knows it all").
- Verification: full ctest 79/79 green incl. sleeve_check + cap_sleeve_check
  (sleeve caps RE-SEAT to the new armhole by bisection — the seam-match invariant
  holds) + all validators clean; golden dump byte-deterministic (2 runs == pin).
  Visual before/after: ~/Desktop/SETIN-ARMSCYE-before-after.png.
- Approval status: DAMLA TASTE-CHECK PENDING (Kapi 2). Geometrically verified;
  awaiting Damla's eye on the visual + her approval label before this pin is
  final. NOT committed until approved.

### 2026-07-19 — 23406 lines, md5 7c3d83f237c7596d573f6155da72a918
- Label (Damla's approval wording): "Aldrich blok revizyonu (20cc289),
  kagit-dogrulanmis, muslin-bekliyor".
- What changed vs previous pin (23034): single divergence commit 20cc289
  "refine dart drafting to aldrich" (18 Jul). Shoulder seam 78.5mm/32.8deg ->
  117.7mm/22deg (Aldrich block), bust dart 11.5deg -> 15.4deg, straight-skirt
  waist dart splits above 30mm. 537 of 561 garments changed in place (max
  delta 79.2mm, bigNeckSmallShoulder shoulder tip); +372 lines = 62 garments
  x split dart (+6 lines each). Zero keys added or removed.
- Evidence: reports/2026-07-19-stitchu-golden-adli.md (forensic, per-commit
  dumps) + reports/2026-07-19-stitchu-golden-fark-ozeti.md (landmark tables,
  5 side-by-side renders in reports/golden-fark/).
- Verification status: paper-verified (K4 sloper, Aldrich 6th ed. independent
  hand calculation, ctest sloper_check pins the new values). MUSLIN PENDING:
  no sewn proof yet; first muslin planned from the bigNeckSmallShoulder body
  (largest shoulder delta, +75mm).
- Approved by Damla 2026-07-19 with the label above.

### 2026-07-17 — 23034 lines, md5 0f1ff71b (retired)
- Pinned at 234659b "smooth bezier armholes". Last reproducible from commit
  00f429c; retired because 20cc289 changed drawing behavior. Kept in git
  history; restoring it requires reverting 20cc289's drawing values (would
  break sloper_check, see forensic report question 2/A).
