# V5-Z — ZEMİN KEŞFİ (ölçüm kartı, onarım YOK)

Koşu: 2026-08-24. Kaynak kod DEĞİŞTİRİLMEDİ (`git diff --stat` bu dosya + loglar dışında boş).
`patterns_real/` altındaki PDF'lere DOKUNULMADI (sadece `geometry/geometry-full.json` ve
`tools/trace-match.py` okundu).

⚠ **KART DIŞI ENGEL:** kartın "NE" bölümü "V5'in yedi kapı maddesi" diyor ama context
manifestom `GECE/V*.md` dosyalarını açmayı YASAKLIYOR (`GECE/V5.md` dahil). Yedi maddenin
metnini okuyamadım. Bu yüzden aşağıdaki altı başlık kartın ÖLÇÜLECEKLER 1-6 listesine birebir
uyuyor; "hangi alet hangi V5 maddesini ölçüyor" eşlemesi YAPILAMADI (sebep: girdi dosyası
manifestte yasak). Kartın 4. maddesindeki sekiz kalemlik grep sicili o eşlemenin yerine
geçen ölçüm olarak tam yapıldı.

---

## 1. CTEST TAM KOŞUSU

Build ZATEN VARDI, yeniden kurulmadı:

```
test -d engine/build && ls engine/build/CMakeCache.txt
  → engine/build/CMakeCache.txt
```

Komut (log: `GECE/log/V5.ctest.before.txt`, 433 satır):

```
ctest --test-dir engine/build --output-on-failure
```

Sonuç satırları (`grep -nE "tests passed|Total Test time" GECE/log/V5.ctest.before.txt`):

```
420:95% tests passed, 6 tests failed out of 111
422:Total Test time (real) = 279.10 sec
```

Kayıtlı test sayısı 112, koşan 111 — biri devre dışı:

```
grep -oE 'add_test\(NAME [A-Za-z0-9_]+' engine/CMakeLists.txt | wc -l   → 112
grep -n "h10_gate_check (Disabled)" GECE/log/V5.ctest.before.txt
  → 425:	100 - h10_gate_check (Disabled)
```

### KIRMIZI ALTI — İSİM İSİM

`grep -A8 "The following tests FAILED" GECE/log/V5.ctest.before.txt`

| # | ad | kırmızının bastığı cümle (logdan birebir) |
|---|---|---|
| 9 | `flat_pattern_agree_check` | `FAIL [a] body_length: flat 757.5584 mm vs kalıp 728.7870 mm — sapma %-3.7979 > %1.5` |
| 10 | `flat_artifact_census` | `FAIL [3 C1] 2 nokta teğet farkı 1°'yi aşıyor` |
| 11 | `style_check` | `style_check FAIL: pinlenmiş stil 0 — engine/STYLE-PIN yok/boş, 31 stilin hepsi korumasız.` |
| 18 | `sizechart_source_check` | `UNSOURCED (verified absence, declared): 4 -> shoulderCM, backLengthCM, armLengthCM, neckCM` |
| 89 | `contract_check` | `FAIL: DECLARED DECISION (not a breach) — 'patterns_real/' has 41 TRACKED file(s) in git` |
| 94 | `figure_check` | `figure-lint: 1 FAILURE(S) — boru/drift üretildi, mandal düştü` |

Not, iki kırmızının SINIFI hakkında (logun kendi metni, benim yorumum değil):
- `contract_check` — logun kendi satırı: *"Bu bir kaza, bir sızıntı ya da bir ajan hatası
  DEĞİL — bilinen bedeli bilerek ödenen bir karar. Kapı KALDIRILMADI... Yeşile dönmesi
  ölçümün değil Damla'nın kararı değişmesinin işi (K1)."* Yani BİLEREK kırmızı.
- `flat_pattern_agree_check` içindeki ikinci yargı YEŞİL kaldı:
  `ok a — UNMEASURED 3 = tavan 3 (G5 sevk edilmedi: omuz/yaka/oyuk yok). Sayı yalnız düşebilir.`
  Düşen tek şey `body_length` %3.80 sapması.

---

## 2. SÖZLÜK TABAN SAYISI

```
bash engine/tests/vocab_reference_check.sh    (log: GECE/log/V5.vocab.txt, EXIT=0)
```

Çıktı birebir:

```
olculen       : commit HEAD (668b2fb)
taban commit  : 495d58a4a256d7982a8d831ac893e7411afad062
taban toplam  : 10438
bugun toplam  : 10432 (delta -6)

  DUSTU  eksen ADI   collarType                81 ->    80
  DUSTU  eksen ADI   sleeveLength             274 ->   273
  DUSTU  eksen ADI   sleeveStyle              351 ->   347

vocab_reference_check: 37 eksen + 92 kelime olculdu
HUKUM: YESIL — hicbir sayi tabanin ustune cikmadi.
```

**Bugün 10432, taban 10438'in 6 ALTINDA.** Üç eksen adı düşmüş (toplam −6), yükselen yok.
Düşüş tabanı kendiliğinden güncellemiyor (`--baseline <commit>` ayrı bir karar).
Taban dosyası: `engine/tests/vocab-reference-baseline.json` (`test -f` → VAR),
`"toplam": 10438`, `"toplamEksenAdi": 7595`, `"toplamEnumDegeri": 2843`.

---

## 3. İFADE RATCHET — BUGÜNKÜ UNEXPRESSED

```
node engine/tests/flat_expresses_spec_check.mjs   (log: GECE/log/V5.expresses.txt, EXIT=0)
```

Son blok birebir:

```
--- RATCHET (UNEXPRESSED yalniz DUSEBILIR)
ok    RATCHET sleeveStyle    UNEXPRESSED 0/0
ok    RATCHET collarType     UNEXPRESSED 4/4  [5=shirt · 2=mock · 3=flat · 6=crescent]
ok    RATCHET shoulderStyle  UNEXPRESSED 1/1  [dropped]

flat_expresses_spec_check: 0 FAIL
```

**Kırılım — TOPLAM 5 UNEXPRESSED:**

| eksen | UNEXPRESSED | tavan | hangi değerler |
|---|---|---|---|
| KOL (`sleeveStyle`) | **0** | 0 | — (8 değerin 8'i ifade ediliyor) |
| YAKA (`collarType`) | **4** | 4 | `5=shirt`, `2=mock`, `3=flat`, `6=crescent` |
| OMUZ (`shoulderStyle`) | **1** | 1 | `dropped` |

Omuz kaleminin ölçülen sebebi (logdan):
`UNEX 'dropped' == 'set' (kontur 2705.08u, fark 0.00u); damga
"sleeveStyle=straight:sleeve,shoulderStyle=dropped:unknown" -> UNEXPRESSED`
— yani `dropped` ile `set` AYNI konturu basıyor, fark 0.00u.
`raglan` ise ifade ediliyor (kontur 3186.67u).

---

## 4. GREP SİCİLİ — SEKİZ KALEM

Her satır `grep -rn` ile bulundu; dosya yollarının `test -f` doğrulaması §"DOSYA TAPUSU"nda.

| # | kalem | hüküm | yol + fonksiyon |
|---|---|---|---|
| 1 | dikiş çifti uzunluk karşılaştırması (walk / seam walk) | **VAR (üç ayrı yerde)** | (a) `engine/pattern-bridge/walk.py` — hakem; kapıya `engine/tests/walkgate_check.sh` ile bağlı (8 beden, `KAPI hukum-FAIL` satırını okur, exit kodu ile raporun tutarlılığını da denetler). (b) `engine/tests/sewable_census.cpp` — validator'ın ATLADIĞI omuz dikişi eşleşmesini ekliyor: "front shoulder seam length vs back shoulder seam length must match within pairedSeamTolerance" (dosya başlığı, satır 3-5). (c) `engine/src/validator.cpp:412 skirtSideSeamLength`, `:625 topSideSeamLength` + `:526-527` ön/arka kıyası |
| 2 | çentik eşleştirme | **VAR** | `engine/tests/notch_alignment_check.cpp` (ctest'te kayıtlı, koşuda **Passed 0.00 sec**). Yargıları: "every side-seam notch sits ON the side-seam edge it matches across" (satır 13). ⚠ Kendi başlığı bir DELİK ilan ediyor: satır 23 — *"PatternPiece.notches (verified: 0) — the armhole<->cap notch PAIR..."*, yani oyuk↔taç çenti kçifti bu kapının dışında |
| 3 | kapalılık / kendini kesme | **VAR (ikisi de)** | kendini-kesme: `engine/src/validator.cpp:164 selfIntersectionIssues`, `:1124`'te ana yargıya bağlı, kural adı `"selfintersect"`. kapalılık: `engine/tests/closed_garment_check.cpp:51 isClosed` (ctest **Passed**) |
| 4 | köşe açısı toplamı | **VAR** | `engine/src/surfacepattern.cpp:717 columnDeficitRows` (+ `:747 columnDeficit`). Birebir yaptığı iş: her tepe noktasında `2*kPi - sum[idx(i,j)]` — komşu üçgen açılarının toplamının 2π'den farkı (satır 741-743). Tüketicisi `:767 dartColumnsFromDeficitRows` / `:849 dartColumnsFromDeficit` → pens sütunları buradan türüyor. Ayrıca `engine/src/bodysurface.cpp:152, 392` Gauss-Bonnet ile χ=2 denetimi (3B yüzey tarafı) |
| 5 | giyilebilirlik / geçiş halkası | **VAR** | `engine/src/wearability.hpp:68 Wearability::issues`, `:75 finishedNeckOpeningMM`, `:80 hasDonningOpening`. Kapılar: ctest `wearability_check` (**Passed**), `wearable_check` (**Passed 4.69 sec**). "geçiş halkası" ismiyle ayrı bir alet YOK; işlevi `finishedNeckOpeningMM` + `hasDonningOpening` çifti taşıyor |
| 6 | 2B→3B sarma / geri projeksiyon | **YARIM — ters yön VAR, geri projeksiyon YOK** | VAR olan 3B→2B: `engine/src/shellprojection.hpp:105 projectFront`, `:106 projectBack` (ortografik silüet). 2B panel→3B'ye asma: `engine/src/drape.hpp:142 buildCloth`, `:147 settle`, `:150 drapePiece` (Verlet kütle-yay, ctest `drape_check`). AMA `drape.hpp`'nin kendi HONEST SCOPE bölümü (satır 7-13) diyor ki: *"no seam-sewing of multiple panels — one panel, one hang"*. Yani **kalıbın tamamını dikip vücuda sarıp geri ölçen bir yol YOK.** `grep -rniE "backProject\|reproject\|wrap3d\|liftTo3D" engine/` → **0 sonuç** |
| 7 | gerinim (strain) hesabı | **VAR** | `engine/src/flatten.hpp:54 strainPolish`, `:60 strainPolishWeighted`, `:68 enforceCutLengths`, `:75 maxStrain` (gövde `engine/src/flatten.cpp:266/270/328`). Kalıp tarafında raporlanan alanlar `engine/src/surfacepattern.hpp:170 boundaryStrain`, `:171 maxStrain`. Kapılar: ctest `flatten_check` (**Passed 0.43 sec**), `surface_pattern_check` (**Passed 4.58 sec**). Ayrıca `engine/src/drape.hpp:126 maxSpringStrain` |
| 8 | kalıp ölçüm aleti `pattern-measure.mjs` | **VAR** | `engine/tools/pattern-measure.mjs` (187 satır). Altı ölçüyü FLAT panellerden okur, kübikleri ≤0.05mm adımla integre eder, taşımadığı ölçüye `mm=null` + sebep basar. ⚠ Kendi başlığı: *"Exit code is always 0: this tool measures, it does not judge"* — **KAPI DEĞİL.** ctest'te `pattern_measure` diye bir add_test YOK (`grep -c "pattern-measure" engine/CMakeLists.txt` → 0) |

---

## 5. SEVK EDİLEN KALEM — KULLANICI `web/` ÜZERİNDEN KALIP İNDİRİNCE NE KOŞUYOR

### Zincir (dosya + satır + fonksiyon)

```
web/create.html
  → web/js/create.js:730           const result = await draft(spec, values);
  → web/js/engine.js:187           json = engine.draftJSON(engineSpec(spec), {...});
  → web/js/engine.js:52-64         loadEngine() → script src='vendor/stitchu-engine.js?v=136'
  → engine/wasm/bindings.cpp:339   std::string draftJSON(val specObj, val bodyObj)
  → engine/wasm/bindings.cpp:296   patternJSON(spec, m)
  → engine/wasm/bindings.cpp:298   const DraftedPattern draft = GarmentDrafter::draft(spec, m);
                                   ↑ engine/src/garment.cpp (2B blok çizimi: bodice/skirt/sleeve)
PDF:
  → web/js/create.js:798           print.addEventListener('click', () => printPattern(result));
  → web/js/print.js:381 printPattern → :384 buildPrintPages(result, root)   (:172)
DXF (studio):
  → web/js/studio.js:332 downloadDXF → web/js/engine.js:171 engine.dxfRecipeJSON(...)
SVG (studio):
  → web/js/studio.js:299 downloadSVG   (tarayıcıda yeniden çizim, motordan gelen poligonlarla)
FABRİKA PAKETİ (studio):
  → web/js/studio.js:381 downloadFactoryPack → statik dosya `web/factory/<id>.zip?v=136`
                                   (motor O AN koşmuyor; paket gen-factory-pack.mjs ile ÖNCEDEN basılmış)
```

### ★ ÖLÇÜLEN CEVAP: SEVK EDİLEN KALEM **ESKİ 2B ÇİZİM HATTIDIR, TEK-YÜZEY HATTI DEĞİL.**

Kanıt, iddia değil — wasm'a derlenen kaynak listesi:

```
sed -n '72,73p' engine/build-wasm.sh | tr ' ' '\n' | grep '\.cpp'
```

35 dosya basıyor: `geometry, bodice, skirt, ruffle, keyhole, placket, tie, collar, gather,
openback, laceupback, wrapfront, slit, strap, peplum, hemflounce, cupseam, locket, yoke,
boxpleat, pocket, neckext, cuff, hem, shoulder, buttonrow, exposedzip, backdetail,
offshoulder, sleeve, garment, wearability, validator, recipe, dxf` + `wasm/bindings.cpp`.

Listede **OLMAYANLAR:**

```
grep -c "surfacepattern\|flatten.cpp\|curvefit\|bodysurface\|garmentshell\|shellprojection" engine/build-wasm.sh
  → 0
```

Aynı altı dosya native kütüphanede VAR (`engine/CMakeLists.txt:12-17`):
`src/flatten.cpp · src/surfacepattern.cpp · src/curvefit.cpp · src/shellprojection.cpp ·
src/bodysurface.cpp · src/garmentshell.cpp`.

Sevk edilen ikili de bunu doğruluyor:

```
ls -la web/vendor/            → stitchu-engine.js  1215391 bayt (24 Ağu 16:47), TEK dosya
grep -oE "surfacePattern|surfacepattern|SurfacePattern" web/vendor/stitchu-engine.js | wc -l  → 0
```
(⚠ tek başına zayıf kanıt: emscripten sembol adlarını kısaltır. Yükü taşıyan kanıt
build-wasm.sh'ın kaynak listesidir, o kesin.)

**Yani:** V4'ün flat tarafında bulduğu tabloya kalıp tarafı şöyle ekleniyor —
FLAT tarafında sevk edilen kalem `_engine-full.mjs renderStyle` (V4'ün ölçümü),
KALIP tarafında sevk edilen kalem `GarmentDrafter::draft` (garment.cpp, 2B blok).
Tek-yüzey motoru (`surfacepattern.cpp`, 2240 satır; `flatten.cpp`, 340 satır) yalnızca
native ctest'lerde (`surface_pattern_check`, `flatten_check`, `walkgate_check`) koşuyor,
kullanıcıya **HİÇ ULAŞMIYOR.**

⚠ `web/js/studio.js:331` yorumu DXF için "what downloads is the exact motor geometry, not a
redraw" diyor ve bu doğru — ama o "motor" yukarıdaki 35 dosyalık 2B motordur.

---

## 6. BUĞRA OVERLAY İÇİN HAZIR NE VAR

### 6.1 `patterns_real/geometry/geometry-full.json` — ne taşıyor

```
python3 -c "import json;d=json.load(open('patterns_real/geometry/geometry-full.json'));..."
```

Üst anahtarlar: `meta · sizeChartMM · pdfColorToSize · pieces (13) · rings (104)`.
`meta`: `unit = "mm (PDF pt * 25.4/72)"`, kalibrasyon `4cm bar: 113.386pt = 40.0mm`,
`bezierStepMM = 2.0`, `ringOrder = "ring 0 = smallest size present; sizes EU 34..48"`.
Her ring kaydı: `pdfStrokeColor, wMM, hMM, perimMM, closureGapMM, containmentOK, polygon`.

**13 PARÇA × 8 HALKA = 104 halka. Beden listesi: EU 34/36/38/40/42/44/46/48.**

| desen | parça | halka | eksik beden | kurtarılan |
|---|---|---|---|---|
| corset_bustier | Back Body (center fold) | 8 | — | — |
| corset_bustier | Upper Cup | 8 | — | — |
| corset_bustier | Lower Cup | 8 | — | — |
| corset_bustier | Front Body (center) | 8 | — | **46, 48** (kirişle kapatıldı) |
| corset_bustier | Back Body (side) | 8 | — | — |
| corset_bustier | Front Body (side) | 8 | — | — |
| locket_top | Front Body | 8 | — | — |
| locket_top | Back Body | 8 | — | — |
| locket_top | Upper Sleeve | 8 | — | — |
| locket_top | Lower Sleeve | 8 | — | — |
| locket_top | EXTRA-TL (not in defter) | 8 | — | — |
| locket_top | Collar | 8 | — | — |
| locket_top | **Collar Lining** | **7** | **48 YOK** | — |

`containmentOK = False` olan dört parça (iç içe geçme doğrulanamayan):
`Back Body (center fold)`, `Lower Cup`, `Front Body (center)`, `Front Body (side)` —
hepsi corset_bustier tarafında; locket_top'ın 7 parçasının 7'si `True`.

Renk→beden oy tablosu (`pdfColorToSize`) oybirliği DEĞİL iki bedende:
`36` (4/5) ve `38` (4/5), kalanlar 5/5.

### 6.2 Bizim kalıbı aynı ölçekte basan mevcut alet — ZİNCİR VAR, TEK ALET YOK

Overlay'in üç parçası da ayrı ayrı repoda duruyor; **birleştirilmiş tek komut yok.**

| adım | alet | ne yapıyor |
|---|---|---|
| motorun kalıbını mm poligona dök | `engine/tools/bugra-dump.cpp` (CMake hedefi `bugra-dump`, `engine/CMakeLists.txt:349-350`) | Buğra-36 gövdesinde satın alınmış spec'i çizer, **dikiş çizgisi + kesim çizgisi** poligonlarını JSON basar; başlığı birebir: *"so patterns_real-style overlay tooling can measure piece-by-piece IoU against the purchased pattern's size-36 rings (patterns_real/geometry/geometry-full.json)"*. Modlar: `corset` / `locket` |
| poligonu mm'li SVG'ye ser | `GECE/f-d-kalip-plot.mjs` | `bugra-dump` çıktısını tek sayfaya, mm biriminde (`GAP=30, PAD=40` mm), `contract/flat-convention-v1.json` mürekkep kanunuyla |
| SVG → PNG | `engine/tools/raster.mjs` (headless Chrome, komut verilen kısa kenar px, varsayılan 2000) **veya** `engine/tools/tracer/svg2png.mjs` (`@resvg/resvg-js`, `fitTo width`) | ikisi de viewBox'ı ölçekliyor: aynı viewBox verilirse ölçek aynı |
| sayısal kıyas (PNG değil) | `engine/tools/bugra/bugra-parity.mjs` | motor draft'ı ↔ `engine/tools/bugra/bugra-geometry.json` mm kıyası. ⚠ Motoru **`web/vendor/stitchu-engine.js`** üzerinden yüklüyor (satır 18) — yani §5'teki SEVK EDİLEN 2B kalemi ölçüyor |
| sayısal kıyas, iz tarafı | `engine/tools/tracer/ring-compare.py` | `trace-ring.py` mm konturu ↔ `recipe-json-dump` kalıbı; hizalama **bbox min köşesi, serbest parametre yok**; kapılar bbox ±%1.3, çevre ±%3.6 |
| çentik/kapak eşleme | `patterns_real/tools/trace-match.py` (49 satır) | kartın izin verdiği py; `geometry-full.json` üstünde çalışır |

**EKSİK OLAN, İSMİYLE:** iki konturu AYNI mm ölçeğinde ÜST ÜSTE basan bir PNG üreteci.
`bugra-parity.mjs` sayı basıyor, PNG basmıyor; `f-d-kalip-plot.mjs` yalnız BİZİM parçaları
çiziyor, Buğra halkasını çizmiyor. Aradaki tek boşluk bu.

---

## DOSYA TAPUSU (`test -f`, hepsi VAR)

```
engine/CMakeLists.txt                                VAR
engine/tests/sewable_census.cpp                      VAR
engine/tests/flat_pattern_agree_check.mjs            VAR
engine/tests/flat_artifact_census.mjs                VAR
engine/tests/flat_expresses_spec_check.mjs           VAR
engine/tests/flat_geometry_sellable_check.mjs        VAR
engine/tests/vocab_reference_check.sh                VAR
engine/tests/vocab-reference-baseline.json           VAR
engine/tests/walkgate_check.sh                       VAR
engine/tests/notch_alignment_check.cpp               VAR
engine/tests/closed_garment_check.cpp                VAR
engine/src/surfacepattern.cpp                        VAR   (2240 satır)
engine/src/flatten.cpp                               VAR   ( 340 satır)
engine/src/curvefit.cpp                              VAR   ( 315 satır)
engine/src/curvefit.hpp                              VAR   (  35 satır)
engine/src/validator.cpp                             VAR
engine/src/wearability.hpp                           VAR
engine/src/shellprojection.hpp                       VAR
engine/src/drape.cpp / drape.hpp                     VAR
engine/pattern-bridge/walk.py                        VAR
engine/wasm/bindings.cpp                             VAR
engine/build-wasm.sh                                 VAR
engine/tools/pattern-measure.mjs                     VAR   ( 187 satır)
engine/tools/bugra-dump.cpp                          VAR
engine/tools/bugra/bugra-parity.mjs                  VAR
engine/tools/raster.mjs                              VAR
engine/tools/tracer/svg2png.mjs                      VAR
engine/tools/tracer/ring-compare.py                  VAR
web/js/create.js · studio.js · engine.js · print.js  VAR
web/vendor/stitchu-engine.js                         VAR
patterns_real/tools/trace-match.py                   VAR
patterns_real/geometry/geometry-full.json            VAR
GECE/f-d-kalip-plot.mjs                              VAR
```

Loglar: `GECE/log/V5.ctest.before.txt` · `GECE/log/V5.vocab.txt` · `GECE/log/V5.expresses.txt`

---

## KART DIŞI FARK EDİLEN (dokunulmadı, sadece yazıldı)

1. **`ctest` 112 kayıtlı, 111 koşuyor.** `h10_gate_check` `DISABLED` bayrağıyla kapalı
   (log satır 425). Dosyası `engine/tests/h10_gate_check_LEGACY.cpp` — adında LEGACY var.
   Süre 279.10 sn, kartın beklediği ~130 sn'nin **2.15 katı**. Beklenti bayat.

2. **CLAUDE.md'nin "ctest 84/84" kaydı bayat.** Bugün 111 test, 6'sı kırmızı.

3. **`pattern-measure.mjs` bir KAPI DEĞİL** (`Exit code is always 0`, kendi satırı) ve
   `engine/CMakeLists.txt`'te add_test'i yok. Altı ölçüyü basan tek alet ama kimseyi
   durdurmuyor.

4. **`notch_alignment_check.cpp:23` kendi deliğini ilan ediyor:**
   `PatternPiece.notches (verified: 0)` — oyuk↔taç çentik ÇİFTİ bu kapının kapsamı dışında.
   Kapı yeşil, ama Buğra'nın en kritik çenti kçifti orada yargılanmıyor.

5. **`flat_pattern_agree_check` UNMEASURED 3/3, tavan dolu.** Ölçülemeyen üç ölçü:
   `bust_circumference`, `neck_opening_width`, `shoulder_width` — hepsinin sebebi tek:
   sevk edilen kalıp **strapless**. Test kendi cümlesiyle: *"this pattern has no shoulder:
   the torso panels stop at the top ring, there is no shoulder seam and no armhole in the
   stitch graph."* G5 hâlâ sevk edilmemiş, ölçüm bunu doğruluyor.

6. **`style_check` 31 stilin 31'ini korumasız buluyor** — `engine/STYLE-PIN` dosyası yok/boş.
   Yani flat tarafında hiçbir stil regresyona karşı pinli değil.

7. **`sizechart_source_check`: 4 sütun KAYNAKSIZ** — `shoulderCM, backLengthCM, armLengthCM,
   neckCM`, her biri 10 yayınlanmış değer. Beden tablosunun dörtte biri arkasında yayın
   olmayan sayı. (Aynı testte `ok: mutation probe ... gate reacted (4 -> 5 verdicts)` —
   kapının kendisi sağlam, sayı gerçek.)

8. **`contract_check` bugün 41 takipli telifli dosya sayıyor**, CLAUDE.md ise "49 dosya"
   diyor. Testin kendi metni de aynı paragrafta hem `41` hem `(bugun 49)` yazıyor — testin
   İLAN metni ile SAYDIĞI sayı birbirini tutmuyor. **DOĞRULANMADI** hangisinin güncel olduğu;
   `git ls-files patterns_real | wc -l` KOŞULMADI (ölçüm kartının kapsamı dışında bıraktım,
   ama tek komutla kapanır).

9. **`vocab_reference_check` tabanı 6 puan gerisinde** — üç eksen adı düşmüş
   (`collarType` 81→80, `sleeveLength` 274→273, `sleeveStyle` 351→347). Kapı yeşil ama
   taban artık gerçeği göstermiyor; `--baseline` ile sabitlenmesi ayrı bir karar.

10. **`engine/dist` ölü.** `bugra-parity.mjs:16-18` yorumu: *"engine/dist 18 Tem'de kaldı
    (cupSeam YOK); güncel build web/vendor'da (24 Tem). dist tazelenince burası dist'e
    geri döner."* Yani Buğra parite aleti sevk edilen ikiliye bağlı, native motora değil.

11. **`web/vendor/` içinde `.wasm` dosyası YOK** — yalnız `stitchu-engine.js` (1.22 MB).
    Tek-dosya emscripten çıktısı olması muhtemel ama **DOĞRULANMADI** (grep
    `wasmBinaryFile|base64` → 0 eşleşme; nasıl yüklendiği açılmadı).

12. **`drape.hpp` çok-panel dikişini açıkça reddediyor** (satır 12: *"no seam-sewing of
    multiple panels — one panel, one hang"*). Kalıbı dikip vücuda giydiren bir yol repoda
    yok; §4 kalem 6 bu yüzden YARIM.

13. **`figure_check` neden düştüğü loga tek satır olarak basılıyor** (`figure-lint: 1
    FAILURE(S) — boru/drift üretildi, mandal düştü`) ama hangi stilin düştüğü
    `--output-on-failure` çıktısında görünmüyor; listelenen 7 stilin 7'si `ok`.
    Düşen kalem **isim olarak okunamadı** — logu daha ayrıntılı basacak bir bayrak var mı
    BAKILMADI.

14. **`GECE/log/` bu koşudan önce yoktu** (`mkdir -p` ile yaratıldı). Önceki gece
    koşularının ctest logları diskte durmuyor, yani "kırmızı SET büyüdü mü" (RULES §9)
    bu koşuyla ilk kez ölçülebilir hâle geldi — kıyaslanacak ÖNCEKİ log YOK.
