# stitchu — CUFF FAMILY (patch 3.8)

Sleeve-end cuff family loop. Manşet: a separate band stitched to the wrist end of
a full-length sleeve, the wider sleeve hem gathered/pleated in. Two families:
BUTTON (woven barrel/shirt cuff) + RIBBED (knit rib cuff).

## MOST IMPORTANT FINDING — HONEST, MEASURED: this moves the benchmark by ZERO

The prompt said "button cuff freq=33 (highest single missing item)". That freq is
from the EXTERNAL market compass (product-demand mining), NOT the 58-photo
ground-truth set. Measured directly against benchmark-58/manifest.json + the
cached results:

- "button cuff" and "ribbed cuff" do NOT appear anywhere in the 58-set oov terms.
- The only cuff-related oov terms in the set are "sleeve cuff ties" (×2) and
  "sleeve ruffle cuffs" (×1) — a DIFFERENT construction (ties / ruffle hem), and
  all three are on BALLOON SHORT-sleeve garments (no wrist to barrel-cuff).
- Adding a button/ribbed cuff DRAWN_SINCE rule moves 0 photos: FULL before == FULL
  after, moved = []. Element accuracy unchanged.

This is exactly the "freq high, marginal gain low (clustered)" case the task asked
me to check and report honestly. The cuff shipped anyway as VOCABULARY + MOAT
coverage for real long-sleeve shirts and bombers (which genuinely have these
cuffs, and StitchLift-class competitors would need them), NOT for a benchmark
number. Framed that way in patches.html and FORMULAS.md — measured, not claimed.

## WHAT WAS BUILT

### Engine (cuff.hpp / cuff.cpp, opt-in post-pass)
- `CuffStyle { None, Button, Ribbed }`, `GarmentSpec.cuffStyle` (int; 0=None).
- garment.cpp post-pass AFTER the peplum block, only Dress/Top with a real
  full-length sleeve. None default → every draft byte-identical.
- `CuffBlock::apply`:
  1. Finds a cuffable sleeve piece ("Sleeve"/"Puff Sleeve"/"Gathered-Head Sleeve").
     A sleeveless / cap / short garment, or a BALLOON sleeve (already carries its
     own cuff band), gets an honest "cuff skipped" guide note + `return false`
     (never a silent no-op, never double-cuffs).
  2. BUTTON: woven band = wrist + 25mm overlap, height 60mm, cut 2 + interfacing.
     RIBBED: knit band = wrist × 0.80 (cut shorter to stretch on), height 70mm,
     grain ACROSS (rib stretch runs around the wrist), no gathering row.
  3. Wrist estimate = 0.155 × bust (ASSUMPTION, anthropometric, UNVALIDATED —
     labelled in FORMULAS.md; band clamps so it can never exceed the sleeve hem).
  4. Wrist placement notch stamped on the sleeve hem midpoint.
  5. TRUING by construction: the sleeve HEM width is measured off the FINISHED
     sleeve piece (its two lowest outline vertices), so the fullness surplus
     (hem − attach) is real. cuff_check proves hem > attach on every body
     (fullness ~1.5× woven, ~2.0× knit).

### Bridge (all 4 layers)
create.js pickCuff (vision oov/details → button/ribbed, gated to full-length
straight sleeve, french/elastic/ruffle/tie stay honest) + manual "cuff" picker +
seen.cuffDrawn. missing.js cuff suppression (button/barrel/shirt/rib/knit drawn;
french/elastic/casing/ruffle/tie honest). engine.js cuffStyleValue + both call
sites. backend/draft.js ENUMS + cuffStyleInt + both call sites. bindings.cpp
buildSpec + draftJSON + gradeJSON trailing param. Both wasm targets rebuilt.
Worker VISION UNCHANGED.

## PROOF REGIME (all green)
- golden BYTE-IDENTICAL: 0 byte diff / 0.000000 mm / 23034 lines (None default).
- ctest 23/23 (new cuff_check: exactly 1 extra piece, existing outlines
  byte-identical, hem > cuff fullness surplus, wrist notch, button vs ribbed
  differ, sleeveless honest skip + note, balloon not double-cuffed).
- engine_check 70200 PASS, cutline_check PASS, precision 0.00mm.
- web-fuzz 20230/0 (cuff sweep: button+ribbed × long+elbow × dress/top, +40 drafts).
- vocab-sweep 37800/0.
- RENDER-ONAY (Chrome headless PNG, read by eye): button-cuff shirt dress (12
  pieces incl. Button Cuff band with fold line) + ribbed-cuff knit top (6 pieces
  incl. Ribbed Cuff band, dashed fold line, grain across, cut note "cut 2 from rib
  knit"). Pieces separate, sleeve carries wrist notch, no clipped/broken outlines
  across page boundaries, register + grainline + cut/sew lines present.
- style-lint clean (53 pages + 7 css), header-diff clean (46 pages).

## VITRIN
patches.html patch 3.8 (EN/TR, delta HONESTLY "full patterns unchanged at 37/54 ·
vocabulary and moat, not benchmark movement"; the honest paragraph explains WHY it
shipped despite zero benchmark movement). ?v pages 74→75, js 59→60.

NOTE ON PATCH NUMBER: the prompt labelled this "patch 3.14", but the live patch
sequence in patches.html is at 3.7 — the honest next number is 3.8. Used 3.8
everywhere (public + internal code comments) for one source of truth.

## FILES
engine/src/cuff.{hpp,cpp} (new), engine/tests/cuff_check.cpp (new),
engine/src/measurements.hpp (cuffStyle append), engine/src/garment.cpp (post-pass),
engine/CMakeLists.txt, engine/build-wasm.sh, engine/wasm/bindings.cpp,
engine/FORMULAS.md ("Cuff family"), engine/tools/{benchmark-58.mjs, web-fuzz.js,
render-pages.mjs}, web/js/{engine.js, create.js, missing.js}, backend/draft.js,
web/patches.html, both wasm (web/vendor + backend/engine).

## CONTENT (for ~/damla_projects_2026/icerik/ — could not write from worktree sandbox)

### linkedin Essay 27 — "En çok istenen özelliği çizdim, sayım hiç oynamadı, ve yine de çıkardım" (manşet / patch 3.8)
1. **Pazar araştırmam bana bir sayı verdi: manşet, 33.** En çok istenen tek parça: düğmeli manşet, 33 kez; ikinci ribana manşet. "Motor bunu çizemiyor" diyen en yüksek tek eksik. Bariz sonraki hamle gibi görünüyordu.
2. **Ama önce ölçtüm, ve pusulam beni yanılttı.** Manşeti kendi kıyaslama setime karşı denedim: "düğmeli/ribana manşet" o 58 fotoğrafın hiçbirinde yok. 33 sayısı DIŞ bir pazar taramasından. Setteki tek manşet terimleri balon kısa kollu, bileği olmayan elbiselerde. Eklemek sayımı sıfır oynatıyordu, ölçüm kanıtladı: önce/sonra tam-kalıp aynı.
3. **Yine de çıkardım, çünkü bir kıyaslama sayısı bir ürün değil.** Gerçek uzun kollu gömleğin manşeti var, bomber'ın ribana bandı var. Rakiplerim satarken çizememek eksiklik. Dağarcık ve hendek genişlemesi olarak çıkardım, yama notuna aynen yazdım: "tam kalıp 37'de değişmedi, kıyaslama hareketi değil."
4. **Manşetin doğruluğu tahmine değil, çizdiğim kola bağlı.** Fazlalığı uydurmak yerine motorun ZATEN çizdiği kol ucunu ölçtüm. Test her bedende kol ucunun banttan geniş olduğunu kanıtlıyor: dokumada ~1.5×, örmede ~2× bolluk. Ribana bandı bilekten kısa kesiliyor, grain bileğin çevresinde dönüyor.
5. **Nerede çizmeyeceğime karar vermek, çizmek kadar iş.** Fransız/lastikli/fırfır/bağ manşet farklı yapı, dürüst katmanda. Kolsuz/cap/kısa kolda motor sessizce atlamıyor, açıkça "manşet atlandı" diyor. Balon kol zaten kendi bandını taşıyor.
6. **Kapalıyken hiçbir kalıp değişmedi, gözle doğruladım.** 23 test, 20.230 web + 37.800 sözlük çizimi sıfır hata, altın referans milyonda bir mm aynı. Düğmeli + ribana manşetli parçaları çizdirip gözle okudum. Bazen en dürüst hamle, en çok istenen şeyi çıkarıp "ve bu sayımı oynatmadı" diyebilmek.

### devlog reel — "the most-wanted feature moved my number by zero" (hook 2sn)
HOOK: "market said this was the #1 missing thing. I built it. my score moved by nothing. and I shipped it anyway."
ANLATI (30-45sn): compass freq said button cuff = 33, the highest single gap. before touching code I checked it against my own 58-photo benchmark → button/ribbed cuff appears in ZERO of them (the demand is real but it lives in an external market survey, not my ground-truth set). so drawing it moves my completed-pattern count by 0. I shipped it as vocabulary + moat for real long-sleeve shirts and bombers, and wrote exactly that on the patch note: "unchanged at 37/54, not benchmark movement." the cuff itself measures the sleeve hem I already drew so the gathered fullness is real, not guessed. off by default → every old pattern byte-identical.
GÖRSEL: split screen — the "33" compass number vs the "0 moved" measurement; then the rendered button cuff + ribbed cuff pieces.
FORMAT: honest build reel, series continues.
