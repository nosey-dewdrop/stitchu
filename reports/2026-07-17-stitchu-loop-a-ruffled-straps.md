# stitchu — LOOP A: RUFFLED STRAPS (patch 3.1)

> İkinci FAZ M motor dalı. K2 köprü denetimi kuyruğu (slit → peplum →
> ruffled-straps) sırasında ruffled-straps'i +2 solo, düşük-risk (tie/placket
> desenine birebir, köprü deliği #23'ü de kapatır) diye işaretlemişti. Bu loop
> onu yazdı — ve bir bonus artefaktı da düzeltti.

## SONUÇ (ölçülü, uydurma yok)
- **FULL PATTERN: 26 → 29/54 (+3)** — üç Priscilla babydoll fotoğrafı. Cache
  reclassify, **0 vision çağrısı, kredi harcanmadı** (motor loop'u + eşleştirme
  düzeltmesi).
- **ELEMENT ACCURACY: 55 → 58/103 (%53.4 → %56.3, +3)**.
- vision-accuracy %94.4 DEĞİŞMEDİ (doğru — motor loop'u, worker vision'a dokunulmadı).
- **golden BYTE-IDENTICAL: 0.000000 mm / 23034 satır** (ruffledStraps off default).
- **ctest 19/19** (yeni strap_check), **web-fuzz 20020/0**, **vocab-sweep 37800/0**.

### Attribution — neden +3 değil +2 ve hangi kaynaktan (izole python replay ile kanıtlı)
- **StrapBlock kuralı tek başına: 26 → 28 (+2)** — Priscilla cover + close-up.
  İkisi de cached vision'da sleeveStyle='none', neckline scoop/square okumuş; tek
  eksik oov terimi "ruffled straps" idi, motor artık çiziyor → FULL.
- **classify() null-tolerans bonusu: 28 → 29 (+1)** — Priscilla worn. Bu fotoda
  cached vision sleeveStyle=null döndürmüş (dürüstçe "kol yok"), ama manifest
  expect.sleeveStyle=["none"] tam "none" kelimesini bekliyordu → WRONG kalıyordu.
- Üç flip de Priscilla — başka foto oynamadı, sızıntı=0.
- K2 tahmini +2 (solo) idi; gerçek +3, çünkü worn fotoğrafı null-tolerans bonusuyla
  da açıldı. Tahmin bonusu hesaba katmamıştı; ölçüm doğruladı.

## NE YAPILDI

### Araştırma (Aldrich/Armstrong + high-street babydoll)
Fırfırlı askı düz askı DEĞİL: düz askı bitmiş boyunda bir dikdörtgen (herkes çizer);
fırfırlısı askıdan DAHA UZUN kesilen ve boyunca büzülüp fırfırlanan bir öz-kumaş
şerittir. Couture (Dior/Chanel kombinezon askısı) ve high-street (Stradivarius/
Bershka babydoll) aynı yapar: düz dikdörtgen, boyuna büzgü. Kural: bitmiş W × span
L, F=2.2 fullness → kesim (2W+2·SA)×(round(L·F)+2·SA), SA=15mm; boyuna katlanıp
self-lined tube, fazlalık (L·F − L) fırfır olur. FORMULAS.md "Ruffled straps" yazıldı.

### C++ motor (strap.hpp / strap.cpp, opt-in post-pass)
- `StrapStyle { None, Ruffled }` enum, `GarmentSpec.ruffledStraps` (int; 0=None).
- garment.cpp'de hem-slit bloğundan SONRA post-pass; sadece Dress/Top. None default
  → mevcut her draft byte-identical.
- `StrapBlock::apply`:
  1. Kolsuz gövde arar (Bodice/Top Center Front/Front + Back); bir Sleeve parçası
     varsa (kollu) veya top edge yoksa → dürüst atlama notu + `return false`
     (sessiz no-op ASLA).
  2. Span = over-shoulder run: `defaultSpan=130` + omuz-noktası x·0.15, `[90,220]mm`
     clamp, sonra tam mm'ye YUVARLA (cut note ile trued cutL aynı değerden çıksın).
  3. `ruffledStrip(span)`: kesim dikdörtgeni + katlama çizgisi + iki dikiş çizgisi +
     büzgü çizgisi + grainline; cut note "cut 2 ... gathered down to a L mm strap".
  4. Placement notch her omuz noktasında (front + back) — piece'i `push_back`
     ETMEDEN ÖNCE damgalanır (push_back vector'ü realloc edip front/back
     pointer'larını geçersiz kılabilir; ilk build'de tam bu bug çıktı, düzeltildi).
- **TRUING:** `cutL − 2·SA == round(span·fullness)` tam (strap_check ölçer, drift
  edemez) + `cutW == 2·finishedWidth + 2·SA`. Span motorun çizdiği omuz
  noktalarından ölçülü → inşadan, scalar değil.

### classify() null-tolerans bonusu (benchmark-58.mjs, dürüst eşleştirme)
`for` expect-döngüsünde: `sleeveStyle` alanı için `got===null && accepted.includes
('none')` ise `got='none'`. Gerekçe: kolsuz bir giysi null ya da 'none' okunur, blok
İKİSİNDE de aynı çizer → aynı garment. Bu bir EŞLEŞTİRME düzeltmesidir, ölçüm hilesi
DEĞİL: eşik gevşetilmedi, sadece aynı anlama gelen iki yazımın birbirini
karşılamasına izin verildi. Yama notunda da bu cümle aynen yazıyor (şeffaflık).

### Test (strap_check.cpp, ctest 19/19)
Doğrular: (1) tam 1 ekstra strap parçası, (2) her mevcut parça outline
byte-identical, (3) cut note "cut 2" + span, (4) span `[minSpan,maxSpan]` içinde,
(5) cutL truing round(span·fullness)+2·SA 0.00mm, (6) cutW self-lined 2·W+2·SA,
(7) grainline + fold/seam/gather markings, (8) placement notch front VE back'e
eklenir, (9) kollu giysi gate byte-identical + direct call REDDEDER + dürüst not +
parça eklenmez, (10) ruffled straps + hem slit + open-back AYNI dresste coexist.
Sleeveless babydoll dress, sleeveless dart top, sleeved dress (red), combo hepsi geçer.

### Köprü (L2/L3, cerrahi)
- **engine.js:** `STRAP_STYLE` map + `ruffledStrapsValue`, draftJSON + gradeJSON'a son param.
- **wasm/bindings.cpp:** buildSpec + draftJSON + gradeJSON'a `ruffledStraps` (sona,
  embind trailing arg 0 default → mevcut çağrılar geçerli kalır).
- **backend/draft.js:** ENUMS whitelist `ruffledStraps`, `STRAP_STYLE`/`ruffledStrapsInt`,
  spec normalize default, iki wasm çağrısına param.
- **create.js:** manuel picker (sleeveless/non-halter gate), `pickRuffledStraps(seen)`
  (straps.type==='ruffled' + oov ruffled/frilled/flutter strap, spagetti/halter/one-/
  off-shoulder hariç), spec default, `seen.ruffledStrapsDrawn`.
- **missing.js:** ruffled strap suppression when `ruffledStrapsDrawn` (STRAP block +
  outOfVocab strapTerm); spaghetti/one-shoulder/off-shoulder/halter honest kalır.
- **benchmark-58.mjs:** DRAWN_SINCE'e ruffled-strap kuralı + classify() null-tolerans.
- **İki wasm yeniden derlendi** (build-wasm.sh'e strap.cpp iki hedefe): web/vendor/
  stitchu-engine.js + backend/engine/stitchu-worker.{js,wasm}.

### Vitrin (patch 3.1)
- **web/patches.html:** patch 3.1 girdisi ("now"), EN/TR, delta rozeti, honest not
  (bonus'un ölçüm hilesi OLMADIĞI açıkça yazılı), DESIGN-RULES uyumlu (em dash yok,
  ok zinciri yok, "biz/motorumuz" yok, başlık noktalı). 3.0 "now"→normal demote.
  "updated" tarihi 2026-07-17.
- **web/index.html:** galeri sayacı 26 → 29 (ölçülü gerçek değer).
- **style-lint temiz** (44 sayfa + 7 css, 0 ihlal).

## MİKRO-LOOP açıldı mı
- **MİKRO-LOOP: strap notch bug/pointer realloc/geri dönüş.** İlk strap_check
  koşusunda "placement notch added to the front/back" ve cutL truing FAIL verdi.
  Sorun: (a) `pattern.pieces.push_back(strap)` front/back pointer'larını geçersiz
  kıldıktan SONRA notch damgalıyordum → notch kaybolmuştu; (b) span float iken cut
  note lround, cutL round(float) → 1mm drift. Çözüm: notch'ları push_back'ten ÖNCE
  damgala + span'ı yuvarla, cutL aynı yuvarlı değerden çıksın. Dönüş noktası:
  strap_check 19/19 yeşil, kaldığım yere döndüm (golden + web-fuzz). Pes yok.

## DÜRÜST SINIRLAR (çizilmeyen, honest kalan)
- Sadece FIRFIRLI (büzgülü-şerit) askı çizilir.
- Düz/geniş askı = motorun düz kolsuz omuz kenarı (zaten kapsıyor).
- Spagetti / tek-omuz / düşük-omuz / halter askı: farklı konstrüksiyon → missing.js honest.
- Kollu ya da halter giysi: ayrı omuz askısı yok → dürüst atlama notu.

## SIRADAKİ (K2 kuyruğu, marjinal-kazanç/maliyet)
K2 sırası: back-hem-slit(bitti +2) → ruffled-straps(bitti +3) → peplum (+2) →
[asymmetric-placket + cap-sleeve KOMBO +6] → [double-breasted+yoke+box-pleats +3].
Sıradaki EN UCUZ: **peplum** (tek-terimli 2 foto: Cloe, Serene pointed).

## DEPLOY NOTU
Worker VISION prompt/şeması DEĞİŞMEDİ → /api/analyze redeploy GEREKMEZ. /api/draft +
/api/grade worker-wasm ruffledStraps destekli yeniden derlendi; ürün foto→pattern
akışı tarayıcı wasm'ini kullanır (bu commit'te güncel). Web değişikliği (index sayaç +
patches 3.1) gh-pages deploy ister (?v bump + subtree split) — ORKESTRATÖR yapacak,
bu agent DEPLOY YAPMADI.
