# stitchu — FAZ K2: L1→L2→L3 KÖPRÜ DENETİMİ + FAZ K/M BİRLEŞİK KUYRUK

> ANALİZ RAPORU (kod değişikliği YOK, git commit YOK). Kaynaklar: backend/worker.js:294-328
> (vision şeması), web/js/create.js:71-186 + 423-519 (L2 köprü pick*/seen), benchmark-58/
> manifest.json (oov ground-truth) + results-2026-07-16.json (cached specs), reclassified with
> engine/tools/benchmark-58.mjs DRAWN_SINCE (satır 83-122). Metod: manifest oov[] terimlerini
> yaşayan DRAWN_SINCE filtresine karşı yeniden sınıflandırdım (0 vision çağrısı). Sayılar
> yaşayan motor sözlüğünden, uydurma yok.

---

## 1. VISION ŞEMASI → L2 KÖPRÜ ENVANTERİ (worker.js her alan)

L1'in döndürdüğü HER alan için: L2 (create.js) onu motora bağlıyor mu (hangi spec.*),
yoksa sadece `spec.seen`'de asılı (honesty channel) mı? Asılı kalan = **köprü deliği**.

| # | worker.js vision alanı | L2 → motor spec alanı | motora bağlı? | not |
|---|---|---|---|---|
| 1 | garment | spec.garment | ✅ BAĞLI | temel |
| 2 | neckline | spec.neckline | ✅ BAĞLI | 7 enum |
| 3 | sleeveStyle | spec.sleeveStyle | ✅ BAĞLI | |
| 4 | sleeveLength | spec.sleeveLength | ✅ BAĞLI | |
| 5 | skirtStyle | spec.skirtStyle | ✅ BAĞLI | |
| 6 | length | spec.skirtLength | ✅ BAĞLI | |
| 7 | topLength | spec.topLength | ✅ BAĞLI | |
| 8 | shaping | spec.shaping | ✅ BAĞLI | princess/dart |
| 9 | waistline | spec.waistline | ✅ BAĞLI | natural/empire |
| 10 | fabric | spec.fabric | ✅ BAĞLI | woven/knit |
| 11 | hemRuffle | spec.ruffle | ✅ BAĞLI | none/single/tiered |
| 12 | keyhole | spec.keyhole | ✅ BAĞLI | bool→enum |
| 13 | fabricName | spec.photoFabric | ✅ BAĞLI | kumaş önerisi |
| 14 | closure (buttons/placket, FRONT) | spec.frontPlacket | ✅ BAĞLI | Loop 3; SADECE ön düğme/pat |
| 15 | closure (ties/bow → applied) | spec.tieClosure (pickTiePlacement) | ✅ KISMİ | Loop 4b; drawstring-gathered → 'none' honest |
| 16 | collar (stand/mock/flat/peterPan/shirt) | spec.collarType/collarEdge (pickCollar) | ✅ KISMİ | Loop 7/8; bias-bound/notched/sailor/lapel → null honest |
| 17 | sleeveHead (gathered/puffed) | spec.sleeveCap | ✅ KISMİ | Loop 6; **capped → BAĞLANMIYOR** (aşağı bak) |
| 18 | yoke (shirr/smock/gathered → panel) | spec.gatherType/gatherZone (pickGather) | ✅ KISMİ | Loop 8; shoulderYoke (yapısal roba) → panel değil, DELİK |
| 19 | backDetail (openBack) | spec.backOpening (pickBackOpening) | ✅ KISMİ | Loop 9b; round/lowV/square/keyhole |
| 20 | backDetail (tieBack) | spec.tieClosure | ✅ BAĞLI | Loop 4b |
| 21 | **closure (buttons, NON-front: back/side)** | — | ❌ DELİK | sadece spec.seen.closure; motor arka/yan pat çizmez |
| 22 | **closure (lace-up / hookEye)** | — | ❌ DELİK | spec.seen.closure; korse/laç çizilmez |
| 23 | **straps (ruffled / oneShoulder / offShoulder / halter-strap)** | — | ❌ DELİK | spec.seen.straps; motor fırfırlı/tek-omuz askı çizmez |
| 24 | **cupSeams (true)** | — | ❌ DELİK | spec.seen.cupSeams; measurements.hpp'de kup dikişi YOK (strapless/bustier/korse) |
| 25 | **sleeveHead = "capped"** (cap sleeve) | — | ❌ DELİK | pickGather/sleeveCap yakalamaz; cap-sleeve ŞEKLİ çizilmez (5 fotoda) |
| 26 | **yoke = "shoulderYoke"** (yapısal roba, gathersız) | — | ❌ DELİK | pickGather sadece shirr/smock/gathered'ı panel yapar; DÜZ yapısal roba/kesim çizilmez |
| 27 | outOfVocab[] (serbest) | spec.seen.outOfVocab (honesty) | — HONEST | 12 terime kadar; render/print kullanıcıya söyler |
| 28 | details (serbest metin) | status text | — kozmetik | |

### KÖPRÜ DELİĞİ SAYISI: **6**
Vision'ın OKUYUP L2'nin motora BAĞLAMADIĞI (sadece spec.seen'de asılı kalan) alanlar:
1. **closure = back/side buttons/placket** (#21) — arka/yan düğme patı
2. **closure = lace-up / hookEye** (#22) — korse laçı / kopça
3. **straps = ruffled/oneShoulder/offShoulder** (#23) — fırfırlı/tek-omuz/düşük-omuz askı
4. **cupSeams = true** (#24) — ayrı kup dikişli büst (strapless/bustier/korse)
5. **sleeveHead = "capped"** (#25) — cap sleeve ŞEKLİ (gathered puf DEĞİL)
6. **yoke = "shoulderYoke"** (#26) — gathersız yapısal roba/kesim

> NOT: V0 taksonomisi "BRIDGE-source: 0" dedi — bu DOĞRU AMA farklı soru. V0 "L2 vision'ın
> döndürdüğü ve motorun çizebildiği bir alanı DÜŞÜRÜYOR mu?" diye sordu (cevap: hayır, düşürme
> yok — bağlanan her alan doğru bağlanıyor). Bu denetim "vision okuyor ama motorun HİÇ çizemediği,
> honesty'de asılı kalan alan var mı?" diye soruyor. 6 var. Bunlar köprü DELİĞİ değil,
> motor+köprü ORTAK deliği: motorda geometri yok → köprüde bağlanacak spec alanı da yok. Yani
> FAZ K (köprü) tek başına kapatmaz; FAZ M (motor geometrisi) yazınca köprü satırı da eklenir.
> Gerçek "saf köprü" (motor çizebiliyor ama L2 bağlamıyor) deliği = 0, V0 haklı.

---

## 2. 26 MISSING FOTOĞRAF — RESIDUAL "engine cannot draw X" TERİMLERİ

(V0 "24 MISSING" dedi; güncel results-2026-07-16.json reclassify = **26 MISSING**. Fark: iki
foto V0 snapshot'ından sonra WRONG→MISSING kaydı. Tablo bu güncel 26'yı kullanır.)

### 2a. Foto başına asılı kalan terimler (kümelenme görünür)

| foto (ürün) | asılı oov terimleri |
|---|---|
| Cloe Puffed Sleeve Peplum Top | peplum construction |
| Priscilla Babydoll (cover) | ruffled straps |
| Priscilla Babydoll (close-up) | ruffled straps |
| Jackie gingham ×6 (cover/worn/macro/back/front/polka) | asymmetric button front closure **+** cap sleeve |
| Laura Mini (cover) | back hem slit |
| Laura Mini (flat sketch) | back hem slit |
| Hallie Set (tank+shorts) | shorts (two-piece set) |
| Pinafore ENYA (flat) | front pockets + pinafore-layered |
| Pinafore ENYA (worn) | front pockets + pinafore-layered |
| Clementine (smock worn) | front/back yoke + bias-bound neckline |
| Clementine (annotated) | front/back yoke + back button placket + button+loop + modesty panel |
| Clementine (back worn) | front/back yoke + back button placket |
| Ruby Pea Coat ×3 (cover/worn/close) | double-breasted + front yoke + box pleats |
| Arielle Dress (halter gingham) | side-seam pockets |
| Corset Bundle (4 flats) | corset boning + lace-up + strapless + bust cups |
| Alli Blouse (magenta pinafore) | drawstring gathered sleeves + layered pinafore |
| Alli Blouse (close-up) | drawstring gathered sleeves |
| Darling Top&Dress | sleeve ruffle cuffs |
| Serene Fit Blouse | pointed peplum hem |

### 2b. Terim frekansı + FAZ M dalı + solo marjinal kazanç

"solo flip" = O TEK terim çizilse foto TAM'a döner mi (kümelenme sonrası kalan oov boşalır mı).
Damla kuralı: öncelik = beklenen +N / maliyet.

| terim | frekans | FAZ M/K dalı | motorda karşılığı | SOLO +FULL | zorluk |
|---|---|---|---|---|---|
| asymmetric button front closure | 6 | placket varyantı (asimetrik ön) | placket VAR ama simetrik; asimetrik yok | **1** (solo) | orta (mevcut PlacketBlock türevi) |
| cap sleeve | 5 | sleeve şekli (kısa cap) | sleeveHead capped YOK; cap ŞEKLİ yok | 0 (solo) | orta |
| front/back yoke | 6 | yapısal roba kesimi | gather-panel VAR, DÜZ roba kesimi YOK | 0 (solo) | zor (bodice böl) |
| double-breasted | 3 | placket varyantı (çift sıra) | tek sıra placket VAR | 0 (solo) | orta |
| box pleats | 3 | etek pili (kutu) | pleated skirtStyle VAR ama box değil | 0 (solo) | orta |
| ruffled straps | 2 | askı şeridi (fırfırlı) | askı çizilmiyor (honest) | **2** (solo) | kolay (şerit parça) |
| back hem slit | 2 | etek yırtmacı | yırtmaç yok | **2** (solo) | KOLAY (post-pass, keyhole deseni) |
| front/side pockets | 3 | cep (yama+yan-dikiş) | cep yok | 1 (solo: Arielle side) | orta |
| peplum | 2 | peplum bel parçası | peplum yok | **2** (solo) | orta (ayrı fırfırlı band) |
| back button placket | 2 | placket varyantı (arka) | ön placket VAR, arka yok | 0 (solo) | orta |
| pinafore-layered | 2/3 | katmanlı jile | yok | 0 | zor (iki kat) |
| bias-bound / button+loop / modesty / boning / lace-up / strapless / bust cups / drawstring sleeve / ruffle cuff / pointed peplum | 1'er | çeşitli (K delikleri #22-26) | çoğu honest sınır | 0 (hep kümelenmiş) | değişken |

**KÜMELENME KANITI:** frekansta en yüksek terimler (asymmetric-placket 6, yoke 6, cap-sleeve 5)
SOLO 0-1 kazandırıyor çünkü hep başka terimle kümelenmiş. Solo kazanç yalnız TEK-terimli
fotolardan gelir: peplum +2, back-hem-slit +2, ruffled-straps +2.

### 2c. EN KRİTİK BULGU — PAIRED (kombo) marjinal kazanç

Kümelenmiş fotolar TEK dalla açılmaz, ama İKİ dal BİRLİKTE yazılırsa açılır:

| kombo dal | flip-to-FULL | fotolar |
|---|---|---|
| **asymmetric-placket + cap-sleeve** | **+6** | Jackie gingham ×6 (hepsi AYNI ürün, ikisi birlikte gerekiyor) |
| double-breasted + front-yoke + box-pleats | +3 | Ruby Pea Coat ×3 (üçü birlikte) |

Bu, tüm sette **en yüksek marjinal kazançlı hamle**: Jackie kümesi 6 fotoyu tek üründe TAM'a
çevirir ama SADECE iki dalın (asimetrik ön pat + cap-sleeve şekli) İKİSİ de yazılırsa. Tek
başına asymmetric-placket +1, tek başına cap-sleeve +0.

---

## 3. FAZ K + M BİRLEŞİK KUYRUK — MARJİNAL KAZANÇ / MALİYET SIRALI

Damla kuralı: öncelik = beklenen +N / tahmini maliyet. (Motor 22→24 FULL şu an; hedefler bunun
üstüne. Golden byte-identical opt-in kuralı her dalda geçerli.)

| sıra | dal (FAZ) | +N (FULL) | maliyet | +N/maliyet | gerekçe |
|---|---|---|---|---|---|
| **1** | back-hem-slit (M) | **+2** | KOLAY | **en yüksek** | tek-terim 2 foto (Laura ×2); keyhole/openback post-pass deseniyle birebir, golden opt-in, düşük risk |
| **2** | peplum (M) | **+2** | orta | yüksek | tek-terim 2 foto (Cloe, Serene pointed); ayrı bel band parçası, mevcut ruffle/tie deseni |
| **3** | ruffled-straps (M/K) | **+2** | kolay | yüksek | tek-terim 2 foto (Priscilla ×2); şerit askı parçası; köprü deliği #23'ü de kapatır |
| **4** | asymmetric-placket **+** cap-sleeve (M, KOMBO) | **+6** | orta×2 | yüksek (paket) | Jackie ×6 tek üründe; İKİSİ birlikte yazılmalı, ayrı ayrı +1/+0; tek maliyetli paket olarak en yüksek toplam |
| **5** | double-breasted **+** front-yoke **+** box-pleats (M, KOMBO) | **+3** | orta×3 | orta | Ruby ×3 tek ürün; üç dal birlikte; yoke zor kol |
| 6 | front/side pockets (M/K) | +1 | orta | orta | Arielle side-seam (solo +1); Pinafore/Enya kümelenmiş; köprü deliği #23 civarı |
| 7 | corset/strapless/cupSeams (K delikleri #22,#24) | +1 | zor | düşük | Corset Bundle tek foto ama 4 terim kümelenmiş (boning+lace-up+strapless+cups); K1'in hedefi; motor kup dikişi yok |
| — | HONEST kalanlar | 0 | — | — | bias-bound, button+loop, modesty panel, drawstring-sleeve, ruffle-cuff, pinafore-layered — dürüst sınır, çizilmez |

### ÖNERİLEN SIRA (marjinal kazanç/maliyet):
**back-hem-slit → peplum → ruffled-straps → [asymmetric-placket + cap-sleeve KOMBO] → [double-breasted+yoke+box-pleats KOMBO]**

- İlk 3 (slit, peplum, ruffled-straps): her biri KOLAY/orta, her biri +2, hepsi tek-terimli
  fotolar → toplam **+6 düşük riskle**. Golden byte-identical opt-in korunur.
- 4. hamle (Jackie KOMBO): en büyük tek kazanç **+6** ama iki dal birlikte gerekir; tek başına
  hiçbiri fotoyu açmaz (asymmetric +1 / cap 0). Paket olarak planlanmalı.
- Toplam ilk 4 hamle potansiyeli: 24 → ~**36/54** FULL (kümelenme sınırları içinde).

### FAZ K'nın rolü:
Saf köprü deliği (motor çizebiliyor, L2 bağlamıyor) = **0** (V0 doğru). 6 "ortak delik" (#21-26)
motor geometrisi yazılınca köprü satırı zaten eklenir (Loop 3/4b/6/7/8/9b deseni: her M dalı
create.js'e pick*/seen satırını beraber getirdi). Yani **FAZ K1 (cupSeams/strapless) bağımsız
bir loop değil, FAZ M dalının içinde** — ayrı köprü loop'u gereksiz. FAZ K2'nin çıktısı: köprü
temiz, sıradaki iş MOTOR (yukarıdaki sıra).

---

## ÖZET (dönüş)
- **Köprü deliği sayısı: 6** (vision okuyor, honesty'de asılı, motora bağlı değil: arka/yan pat,
  lace-up/hookEye, fırfırlı/tek-omuz askı, cupSeams, cap-sleeve şekli, yapısal roba). Saf köprü
  deliği (motor çizer ama L2 düşürür) = 0 → köprü kodu temiz, iş motorda.
- **En yüksek marjinal kazançlı 3 dal:**
  1. **asymmetric-placket + cap-sleeve KOMBO → +6** (Jackie gingham ×6, iki dal birlikte)
  2. **back-hem-slit → +2** (en ucuz, KOLAY, tek-terimli 2 foto)
  3. **peplum → +2** ve **ruffled-straps → +2** (eşit, tek-terimli, kolay/orta)
- Önerilen ilk-4 sıra +N/maliyet ile: slit(+2 kolay) → peplum(+2) → ruffled-straps(+2) →
  Jackie-kombo(+6). Potansiyel 24 → ~36/54.
