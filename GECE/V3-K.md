# V3-K — KEŞİF: flat hattı ve kalıp hattı bugün nereden çıkıyor?

Kart: `GECE/KART/V3-K.md`. Onarım yok, kod yazılmadı, tek yazılan dosya bu.
Her satırın yanında dosya:satır ya da onu basan komut var.

## 0. GİRDİ ENVANTERİ (kartın listesi, disk gerçeği)

| kart girdisi | durum | kanıt (`ls`) |
|---|---|---|
| `flatten-research/` | VAR, 21 `.py` + `FINDINGS.md` + 4 `out-*.json` | `ls flatten-research/` |
| `curve-research/` | VAR, 3 dosya (`01-elastica.py`, `02-underarm-angle.py`, `03-band-ingredients.py`) | `ls curve-research/` |
| `engine/flat-engine/` | VAR, 3 dosya: `_engine-full.mjs` (528 satır), `cloth-solver.mjs`, `styles.json` | `wc -l engine/flat-engine/_engine-full.mjs` → 528 |
| `fashion-flat-models/` | VAR ama **KOD YOK** — 6 adet PNG ekran görüntüsü (23 Tem) | `ls -la fashion-flat-models/` |
| `new_flats/` | VAR, **kod yok**: `rasters/`, `real patterns/`, `volume_1/`, `volume_2/` (referans görsel külliyatı) | `ls -la new_flats/` |
| `engine/src/` | VAR, 97 dosya. `flatten.cpp/.hpp`, `surfacepattern.cpp/.hpp`, `curvefit.cpp/.hpp`, `geometry.hpp`, `bodice.cpp`, `drape.cpp` **hepsi var** | `ls engine/src/` |
| `engine/tools/` | VAR, 103 giriş | `ls engine/tools/` |
| `web/js/` | VAR, 26 dosya | `ls web/js/` |
| `contract/` | VAR, 22 dosya + `layers/` | `ls -la contract/` |
| `engine/CMakeLists.txt`, `engine/tests/` | VAR (108 giriş) | `ls engine/tests/` |

`surfacepattern.cpp` **kartta ismen istendi ve VAR** (kart "flatten.cpp, surfacepattern.cpp" diyor).

---

## 1. FLAT HATTI

### 1.1 Üretim kalemi — kim çiziyor?

**`engine/tools/render-garment-flat.mjs`**, giriş noktası
`renderGarmentFlat(pieces, spec)` — `render-garment-flat.mjs:1005`
(async sarmalayıcı `renderGarmentFlatAsync` — `:999`).

Zincir: `renderGarmentFlat` → `viewPanel(spec,'front'|'back')` (`:846`) →
`geom(spec)` (`:177`) + `halfOutline` (`:273`) + `sleeveHalf` (`:409`) +
`interior` (`:513`) + `collar` (`:790`).

**Girdisi SPEC — parça değil, SVG şablonu değil.** Dosyanın kendi başlığı bunu
ismen beyan ediyor (`render-garment-flat.mjs:11-25`): *"this renderer draws the
flat PARAMETRICALLY FROM THE STYLE SPEC, never from the pieces"*. İmzadaki
`pieces` argümanı **kullanılmıyor** — `:996` yorumu ("kept for signature
compatibility") ve `viewPanel`'in gövdesi (`:846-882`, `pieces`'e hiç
dokunmuyor) bunu doğruluyor.

### 1.2 ★ FLAT HATTI TEK DEĞİL — İKİ KALEM VAR

`renderGarmentFlatAsync` (`:999`) önce `tryReferencePen(spec)` çağırıyor
(`:894`). O da `engine/flat-engine/_engine-full.mjs`'i dinamik import edip
(`:901`) `ref.renderStyle(styleKey, overrides)` döndürüyor (`:990`).

- Eşleşme kuralı `:912-978` arasında **elle yazılmış bir if/else zinciri**:
  13+ stil anahtarı, spec alanlarından (`neckline`/`shaping`/`straps`/`peplum`/
  `shirred`/`skirtStyle`) türetiliyor.
- Eşleşme varsa **üretim kalemi hiç koşmuyor** — flat referans kalemden çıkıyor.
- Eşleşme yoksa `null` → üretim kalemi.

Referans kalem `engine/flat-engine/_engine-full.mjs`:
- 31 stil, `styles.json`'dan okunuyor (`_engine-full.mjs:16`, `:24` `STYLE=_ST.styles`);
  sayım: `python3 -c "import json;print(len(json.load(open('engine/flat-engine/styles.json'))['styles']))"` → **31**
- Ölçek/beden `contract/tables.json` → `flat.unitPX` / `flat.size` / `flat.len`
  (`_engine-full.mjs:20-22`). `flat.unitPX = 5.6`, `flat.len.mini = 42`.
- **Kendi croquis'i var ve üretim kaleminkiyle aynı değil.** Kapının kendi parite
  raporu (`node engine/tests/flat_convention_check.mjs`):
  ```
  stil sayisi 31 · data-scale beyan eden 0/31
  murekkep {#111} (uretim kalemi: #1f3a5f)
  cizgi agirliklari {.65, 1.05, 1.4, 1.5, 1.9}
  croquis sapmasi (kendi ici): omuz x 57.80  omuz y 288.00  gogus x 94.50  gogus y 266.70 (n=29)
  -> referans kalem uretim konvansiyonuna UYMUYOR
  ```
  Kapı bunu **kırmızı saymıyor** ("SALT-OKUNUR olduğu için düzeltilmedi").

**Sonuç: flat çıktısı hangi kalemden geldiğine göre başka bir mankenden çıkıyor.**
Bu bir dış kaynaktan değil, kapının kendi çıktısından okundu.

### 1.3 Flat'in sayı kaynağı: `contract/flat-convention-v1.json`

Üretim kalemi kendi sayısını tutmuyor, kanundan okuyor
(`render-garment-flat.mjs:30-31`, `const LAW = JSON.parse(readFileSync(... 'contract/flat-convention-v1.json'))`).

| croquis işareti | u | mm | kaynak (kanunun kendi beyanı) |
|---|---|---|---|
| `chestX` | 73.3333 | 220.0 | burda EU38 bustCM 88.0 → 880/4, **verified** |
| `waistX` | 58.3333 | 175.0 | burda EU38 waistCM 70.0 → 700/4, **verified** |
| `hipX` | 78.3333 | 235.0 | burda EU38 hipCM 94.0 → 940/4, **verified** |
| `shoulderTipX` | 78.0 | 234.0 | **AÇIK — kaynaksız**, eski kalemden devralındı |
| `shoulderTipY` | 19.36 | 58.08 | türev: neckDrop 4.0 + (78.0−30.0)×0.32 |
| `chestY` | 92.0 | 276.0 | **AÇIK — kaynaksız** |
| `waistY` | 150.0 | 450.0 | **AÇIK — kaynaksız** |
| `neckBase` | 30.0 | 90.0 | **AÇIK — kaynaksız** |
| `neckDrop` | 4.0 | 12.0 | **AÇIK — kaynaksız** |
| `shoulderSlope` | 0.32 | dy/dx | **AÇIK — kaynaksız** |
| `scale.unitMM` | — | 3.0 | çevre/4 tüp geometrisinden çözüldü, iki bağımsız çapa aynı sayıyı veriyor |

Buğra'dan ÖLÇÜLMÜŞ olan tek blok `croquis.sideSeamProfile` (kaynak
`patterns_real/geometry/geometry-full.json`, locket_top / Back Body / size 38):
`shoulder 196.13 · chestMax 204.94 · waistMin 157.46 · hem 179.22 mm`,
göğüse normalize `0.9570 / 1.0000 / 0.7683 / 0.8745`, `hemRisePerU 0.1881`.

### 1.4 SABİT / HARD-CODED KATSAYILAR (hepsi, dosya:satır)

Kanundan gelmeyen, `render-garment-flat.mjs` içine ELLE yazılmış her geometri sayısı:

**Beden boyu / etek**
- `:186` empire bel çarpanı `bodyToWaist * 0.66`
- `:191` shift gövde bel yarı-genişliği `U.chestW - 6`
- `:196` etek düşüşü `mini 150 · midi 250 · maxi 360 · varsayılan 190`
- `:201` etek kloş çarpanı `straight 1.12 · gathered 1.9 · aLine 1.58`
- `:205-206` üst boy düşüşü `crop 24 · waist 0 · tunic 120 · hip 56`
- `:216` etek tavanı `princess ? hipW*1.02 : hipW*0.98`
- `:140` daire etek kloşu `full 2.6 · half 2.1`

**Göğüs noktası (apeks)**
- `:234` `bustFrac = 0.30 + bustHeight*0.30`, varsayılan `0.42`
- `:236` `apexHalfX = U.chestW * 0.55`

**Yaka (`necklineGeom`, `:249-262`) — tamamı elle yazılmış (u cinsinden)**
`scoop 40/40 · vNeck 30/66 · square 34/40 · boat 52/12 · sweetheart 40/44 ·
halter 18/64 · cowl 36/50 · offShoulder 62/20 · crew 30/22`
- `:283` arka yaka derinliği `wide ? min(depth,14) : max(10, min(depth*0.35, 18))`
- `:389` boat kontrol noktası `nHalf*0.55, cfY+3`
- `:392-393` sweetheart `0.22 / −20 / 0.6 / −6 / 0.66 / −16 / 0.8 / 0.3 / +6`
- `:395` halter `0.6 / −6 / +24`
- `:399` crew/scoop/cowl `0.28 / 0.55`

**Kol (`sleeveHalf`, `:409-511`)**
- `:434-435` kol boyu `cap 34 · long 300 · threeQuarter 220 · elbow 150 · short 96`
- `:439` dışa taşma `cap 16 · puff 62 · plain 48`
- `:441-442` `hemTopY = tipY + drop*0.5`, `hemBotY = tipY + drop`
- `:445` kapak yükselişi `puff 22 · cap 6 · plain 8`
- `:459` `CUFF_RATIO = 0.72`
- `:460` `CUFF_BAND = 7` (=21 mm)
- `:461` bicep hattı `drop * 0.62`
- `:463-465` `cuffOutX` düşüşü `cap 6 : 4` · `cuffInX = underX + (cap?6:10)` ·
  `cuffInY = underY+6` / `hemBotY − drop*0.12`
- `:469` kapak kübiği `outW*0.4`, `bicepX − outW*0.1`, `tipY + 6`
- `:472` puff dış kenar kübiği `0.45`, `0.35`
- `:476` et yayı `hemBotY + (cap?4:8)`
- `:484` büzgü tırtığı döngüsü `t = 0.2 … 0.85 adım 0.16`, `tipY−2 → tipY+9`
- `:495` tırtık döngüsü `t = 0.16 … 0.88 adım 0.18`, ofset `1.5`

**İç tasarım çizgileri (`interior`)**
- `:519` bel dikişi uzunluğu `waistW * 1.02`
- `:544-548` prenses varsayılanları `origin 0.80 · top 30 · bow (arka 0.46 / ön 0.62)
  · waist 0.46 · c1 0.25`
- `:549` arka apeks `apexY * 0.78`
- `:555` `xBot = hemHalf*0.44` (elbise) / `waistW*0.52` (üst); `:556` `hemY − 6`
- `:558-563` kübik gerilim sabitleri `0.55 · −18 · 0.55 · −12 · 0.35 · 0.62`

**Sayfa düzeni (`viewPanel` / `renderGarmentFlat`)**
- `:866` kol erişimi `sleeveCap===2 ? 62 : 48` (`:439` ile ÇİFT YAZILMIŞ sayı)
- `:867` `pad = 20`; `:864` alt boşluk `isDress ? 10 : 4`
- `:1010` `HEAD = 40, GAP = 56, PAD = 24`; `:1015-1017` başlık `y=28`, font 22

**`drapePlan` (`:104-121`)** — rastgele tohumlu drape planı:
`CORE 0.20 · base (i+0.65)/(cnt+0.25) · clamp 0.04/0.96 · swing 0.55+0.45 /
0.15+0.30 · birth 0.05 / 0.14+0.30 · die 0.40+0.35 · sway 0.45`

**Referans kalem tarafı** (`engine/flat-engine/styles.json` → `shared`):
`bustProject 0.5 · bustHeight 0.3 · waistNip 0.07 · skirtFull 1.95 ·
foldCount 10 · hemWave 1 · drape 1 · hemDip 2 · seed 7`

---

## 2. KALIP HATTI

### 2.1 Panel üretimi hangi fonksiyon?

**`buildSheathPattern(const BodySurface&, const SheathOptions&)`** —
tanım `engine/src/surfacepattern.cpp:1280`, bildirim `engine/src/surfacepattern.hpp:515`.

İç zincir (hepsi `surfacepattern.cpp`):
- `GarmentSurf::fromBody` — `:64` (giysi yüzeyi, 5 halka: neck/shoulder/bust/waist/hip)
- `solveTopH` — `:385` (üst sınır)
- `buildGrid` — `:708` (panel ızgarası)
- `columnDeficit` — `:799`, `dartColumnsFromDeficit` — `:901` (pens = develop-deficit)
- `flattenGrid` — `:905` (düzleştirme; `flatten.cpp`'nin ARAP'ını çağırır)

### 2.2 Girdisi ne?

`BodySurface` — `engine/src/bodysurface.hpp:114`, kurucu `:118`
`BodySurface(const BodyMeasurementsSnapshot&, statureMM, capMM)`.

Tek üretim çağrısı: **`engine/tools/surface-pattern.cpp:313-314`**
```
const BodySurface body(entry->body, kStatureMM, kCapMM);
const SurfacePattern pat = buildSheathPattern(body, opt);
```
`entry` = `euSize(size)` (`surface-pattern.cpp:308`) → `engine/src/sizechart.hpp:165`
→ `euSizeChart()` (`sizechart.hpp:54`) → X-makrosu `STITCHU_CONTRACT_EU_SIZE_CHART`
→ **`engine/src/contract.gen.hpp:24`**:
```
X("EU38", 88, 70, 94, 37, 40.5, 58, 35)
```
`contract.gen.hpp:2`: *"GENERATED by engine/tools/gen-contract.mjs from
contract/tables.json — DO NOT EDIT."*

Yani kalıp hattının girdisi **`contract/tables.json → draft.euSizeChart.EU38 =
[88, 70, 94, 37, 40.5, 58, 35]`** (`python3 -c` ile basıldı, yukarıda).

Şekil (girth değil) `shaperatios.gen.hpp`'den grafleniyor (`sizechart.hpp:150-157`).

Kalıp hattının kendi kaynaklı-olmayan sabitleri `bodysurface.cpp:14-25` içinde
**ASSUMPTION diye ismen etiketli**:
`kNapeHeightFraction 0.860 · kNapeToBustFraction 0.650 · kWaistToHipMM 205.0 ·
kAspectNeck 1.05 · kAspectBust 1.35 · kAspectWaist 1.30 · kAspectHip 1.40`.
Üretim toleransı `surfacepattern.cpp:19` `kProdTolMM = 0.79375`.

**Çalıştı:** `./engine/build/surface-pattern EU38` → GarmentCode biçiminde JSON
spec, 8 panel (`left_ftorso`, `right_ftorso`, `left_btorso`, `right_btorso`,
`left_skirt_front`, `right_skirt_front`, + arka etek çifti), her kenar `cubic`
eğri parametreleriyle.

---

## 3. ORTAK KAYNAK VAR MI?

**Tek cümle: İki hat aynı BEDEN ÇİZELGESİNİ (contract/tables.json EU38 =
88/70/94) okuyor, ama ORTAK BİR GÖVDE/KABUK NESNESİ YOK — flat 2B stilize bir
croquis'ten, kalıp 3B `GarmentSurf` yüzeyinden çıkıyor ve ikisi birbirini hiç
görmüyor.**

Kanıt:

| | FLAT | KALIP |
|---|---|---|
| okuduğu dosya | `contract/flat-convention-v1.json` (`render-garment-flat.mjs:30`) | `contract.gen.hpp:24` ← `contract/tables.json` (`sizechart.hpp:54`) |
| aynı sayıya çıkıyor mu | `referenceBody.chartPath = "contract/tables.json -> draft.euSizeChart.EU38"`, `bustCM 88.0 / waistCM 70.0 / hipCM 94.0` | `X("EU38", 88, 70, 94, ...)` — **AYNI ÜÇ SAYI** |
| ortadaki nesne | 2B croquis işaret kümesi (u cinsinden 10 skaler) | `BodySurface` → `GarmentSurf` (5 halka × elips kesit) |
| bolluk (ease) | **EKLENMİYOR** — `flat-convention-v1.json` `easeNote`: *"Croquis BEDEN ÇİZGİSİDİR (sıfır bolluk). Giysi bolluğu bugün flat siluetine EKLENMİYOR"* | **EKLENİYOR** — `GarmentSurf::Ring.d = ease/(2π)`, Steiner-tam (`surfacepattern.cpp:44-47`) |
| çapraz çağrı | `render-garment-flat.mjs`'te `surfacepattern`/`BodySurface`/panel okuyan **tek satır yok** (`pieces` argümanı kullanılmıyor, `:996`) | `surfacepattern.cpp` içinde flat/croquis geçen tek satır yok |

**Ölçülmüş sonucu:** aynı EU38 için flat belin yarı-genişliği kanunda 175.0 mm
(→ çevre 700 mm, sıfır bolluk), kalıp hattının bel halkası
`engine/pattern-bridge/.venv/bin/python3 engine-check/harness/h3b-rings.py /tmp/v3k-eu38.json`
→ **724.89 mm** (bolluklu). Fark 24.89 mm ve tamamı bollukta; **iki hat aynı
giysinin belini iki farklı sayı olarak taşıyor.**

★ Üçüncü bir gövde daha var: `contract/layers/body.EU38.json` bel **723.34 cm→mm**
(GarmentCode `mean_all.yaml`'dan gradelenmiş). Dosyanın kendi `_kolon_sayimi`
alanı bunu ismen beyan ediyor ve *"bu dosya motoru beslemiyor"* diyor.

---

## 4. AÇILIM / FLATTEN NE VAR?

| dosya | fonksiyon | yayınlanmış ad (dosyanın kendi beyanı) | test bağı |
|---|---|---|---|
| `engine/src/flatten.cpp` + `.hpp` | `arapFlatten` (`flatten.hpp:47`), `strainPolish` (`:54`), `strainPolishWeighted` (`:60`), `enforceCutLengths` (`:68`), `maxStrain` (`:75`) | **ARAP (as-rigid-as-possible), local-global.** `flatten.hpp:2`: *"Certified ARAP flattener — the C++ carry of flatten-research/15-arap-proper.py"*. Local adım = kapalı-form 2×2 polar ayrışım; global adım = **cotan Laplacian** + elle yazılmış **conjugate gradient**. `enforceCutLengths` = **Gauss-Seidel projeksiyon**, *"the same move position-based dynamics makes"* (`flatten.cpp:297-298`) | **VAR** — `flatten_check` (ctest #95), `engine/CMakeLists.txt:675-677` |
| `flatten-research/15-arap-proper.py` | ARAP local-global (Python kanıtı) | aynı; 04'ün yerine geçen sertifikalı sürüm | `flatten_check.cpp` aynı analitik kapılara bağlı |
| `flatten-research/02-gore-flatten-strain.py` | gore (dilim) izometrik açılım | **konik/gore açılım** — küre kalotunu K dilime bölüp her dilimi izometrik düzleştirir | doğrudan ctest bağı YOK |
| `flatten-research/04-arap-BUGGY-do-not-trust.py` | — | BOZUK, dosya adında uyarı | — |
| `flatten-research/16-dart-conservation.py` | pens korunumu | develop-deficit | `flatten_check` G1b ile aynı gerçek |
| `flatten-research/17-garment-surface.py` | tek 3B giysi yüzeyi | `surfacepattern.cpp:32-38` bunu "certified model of flatten-research/17" diye anıyor | dolaylı (`surface_pattern_check`) |
| `engine/src/drape.cpp` + `.hpp` | `settle` | **Verlet integrasyon + Jakobsen constraint relaxation** kütle-yay bezi (`drape.hpp:8`, `:80`; `drape.cpp:200`, `:230`) | `drape_check` (ctest) |
| `engine/src/curvefit.cpp` + `.hpp` | `fitCurve` | **Schneider, Graphics Gems "FitCurve"** — en-küçük-kareler kübik Bézier (`curvefit.hpp:2`) | dolaylı |

**LSCM YOK. ABF YOK. Boundary-First-Flattening YOK.**
`grep -rniE "LSCM|ABF|least.squares.conformal|boundary.first|Sorkine|Levy"` →
`flatten-research/`, `curve-research/`, `engine/src/` içinde **0 eşleşme**.

`ParaFashion` tek yerde geçiyor: `flatten.cpp:289` — kod değil, **lisans notu**
(*"cannot be used — no licence and GPL respectively"*).

**Çalıştırıldı:** `./engine/build/flatten_check`
```
== G1a KONİ FRUSTUM ==   sektör 199.686°  analitik 199.692°
   max strain %  0.003682 (kapı 0.1) ok · sektör sapması ° 0.005814 (kapı 0.05) ok
== G1b KÜRE KALOTU 12 DİLİM ==  pens toplamı 33.33°  develop-deficit 33.76°
   pens sapması ° 0.427611 (kapı 1) ok · max strain % 0.477436 (kapı 0.5) ok
```

---

## 5. PROJEKSİYON NE VAR?

**3B → 2B ortografik projeksiyon: VAR ama sadece ÖNİZLEME İÇİN, siluet çıkarımı DEĞİL.**

- `engine/src/drape.cpp:346-357` — `drapeSVG` içinde ortografik 3/4 projeksiyon,
  sabit azimut 35° / yükseklik 20°, painter's-algorithm derinlik sıralaması.
  `drape.hpp:153-154` bunu ismen beyan ediyor: *"Orthographic, a fixed 3/4 view
  so the wrap is visible"*, ve `drape.hpp:54`: *"Never affects the simulation."*
- Bunun dışında `engine/src/` içinde projeksiyon/siluet-çıkarımı yapan kod **YOK**
  (`grep -rni "orthographic|ortho_proj|silhouette|projectTo"` → kalan eşleşmelerin
  hepsi yorum metninde geçen "silhouette" kelimesi).

**Raster siluet çıkarımı ayrı bir aile ve VAR** (3B'den değil, FOTOĞRAFTAN):
- `web/js/measure.js` — zemin eşikleme → en büyük bağlı bileşen → satır genişlik
  profili. **Sadece ORAN döndürüyor, mutlak mm ASLA** (`measure.js:9-11`).
- `engine/tools/kapi3-cross-measure.py` — aynı ölçümün bağımsız Python/numpy
  çapraz-kontrolü (Otsu, ayrı eşik kuralı).
- `engine/tools/flat-metre/flat-metre.py` — çizili flat'leri deterministik ölçer
  (`profile21`, `waist_ratio`, `hem_ratio`, `symmetry`, `frag`); golden kaynağı
  `engine/tools/flat-metre/goldens-v2.json` (43 PNG, `new_flats` küratörlüğü).
- `engine/tests/flat_geometry_sellable_check.mjs:59-` — üretim kaleminin BASTIĞI
  SVG'yi parse edip 400 adımda örnekliyor (kalemden sabit import etmiyor).

---

## 6. ALTI ÖLÇÜ — BUGÜN ÖLÇEBİLEN ALET VAR MI?

| ölçü | FLAT tarafı | KALIP tarafı |
|---|---|---|
| göğüs çevresi | **VAR** — `node engine/tests/flat_convention_check.mjs` → `"olcek — gogus yari-genisligi 219.90 mm == bustCM/4 220.00 mm"` | dolaylı (aşağı bak) |
| bel çevresi | **KISMEN** — `flat_geometry_sellable_check.mjs` bel/göğüs **ORANINI** basıyor (`0.7954`), mm basmıyor. Kanun değeri 175.0 u→mm beyan | **VAR** — `h3b-rings.py` → `govde↔etek üst 724.89mm alt 724.91mm fark -0.018mm` |
| etek ucu çevresi | **KISMEN** — `hemHalf()` (`flat_geometry_sellable_check.mjs:114`) mm hesaplıyor ama **oran olarak** basıyor (crop 0.8590 / hip 0.9400 / tunic 1.0477) | **YOK** — panel köşeleri `surface-pattern EU38` JSON'unda cm cinsinden var, çevreyi basan alet yok |
| omuz genişliği | **VAR (oran) + kanunda mm** — kapı `omuz/göğüs 1.0624`, kanun `shoulderTipX 234.0 mm` | `sizechart` kolonu `shoulder 37` (cm) var; **çizilen omuzdan ölçen alet YOK** — `sizechart.hpp:87-137` bunu ismen açık bırakıyor |
| yaka açıklığı genişliği | **YOK** — `necklineGeom` (`:249`) değeri yazıyor, ölçen kapı yok. `flat_convention_check.mjs:107` `measureCroquis` yalnız omuz/göğüs/bel döndürüyor (`:120-121`) | **YOK** |
| gövde boyu | **YOK** — `data-waist-y` beyan ediliyor (`render-garment-flat.mjs:876`) ama boy ölçen kapı yok | **YOK** |

**Özet: altı ölçünün ikisini (göğüs mm, bel mm) bugün bir alet basıyor; ikisi
(etek, omuz) sadece ORAN olarak basılıyor; ikisi (yaka açıklığı, gövde boyu)
HİÇBİR ALET tarafından ölçülmüyor — sadece beyan ediliyor.**

Basan komutlar:
```
node engine/tests/flat_convention_check.mjs           # gogus 219.90 mm
node engine/tests/flat_geometry_sellable_check.mjs    # omuz/bel/etek ORANLARI
./engine/build/surface-pattern EU38 > /tmp/v3k-eu38.json
engine/pattern-bridge/.venv/bin/python3 engine-check/harness/h3b-rings.py /tmp/v3k-eu38.json
```

---

## 7. EIGEN / LIBIGL

**İKİSİ DE YOK.**

- `grep -rni "eigen|libigl" engine/CMakeLists.txt` → 0 eşleşme.
- `grep -rln "Eigen/\|igl/" engine/src engine/tools engine/tests` → 0 dosya.
- `ls core/third_party/` → yalnız `clipper2`, `garmentcode`. (`clipper2` 18 Ağu'da
  gitignore'a alınmış; `garmentcode` da gitignore'da.)
- `engine/third_party` dizini yok.

`flatten.hpp:15-17` bunun kasıtlı olduğunu beyan ediyor: global adım
*"a hand-written conjugate gradient — dependency-free and deterministic"*.

---

## 8. ÇALIŞTIR

**Build:**
```
cmake --build engine/build -j8 --config Release
```
→ **çalıştı, exit 0.** Son satır `[100%] Built target preset_resolve_check`.
(Tam çıktı: `/private/tmp/claude-501/.../tasks/bngmreodw.output`)

**Test listesi:**
```
ctest --test-dir engine/build -N
```
→ **Total Tests: 109.** Son beş: `#105 printpack_sheet_check`,
`#106 preset_resolve_check`, `#107 edit_locality_check`,
`#108 vocab_source_check`, `#109 vocab_reference_check`.
`#97 h10_gate_check` **(Disabled)** olarak listeleniyor.

Tam ctest KOŞULMADI (kart öyle diyor). Nokta atışı koşulan üçü:
- `./engine/build/flatten_check` → OK (sayılar §4'te)
- `node engine/tests/flat_convention_check.mjs` → `PASS — 0 ihlal`
- `node engine/tests/flat_geometry_sellable_check.mjs` → `PASS — 0 ihlal · tolerans 2 mm`

---

## KART DIŞI — FARK EDİLDİ, DOKUNULMADI

1. **`flat_geometry_sellable_check.mjs` S1'i kapı DEĞİL, sadece rapor.** Kapı
   PASS diyor ama kendi çıktısında **10 panelde ihlal** basıyor:
   `omuz/göğüs 1.0624 ≥ 1.0` (Buğra 0.957). Yani omuz ucu bugün büstün DIŞINDA.
   Sebep dosyada yazılı: croquis düzeltilince `flat_convention_check.mjs`'in
   `measureCroquis()` çıkarımı kırılıyor — o çıkarım omuz ucunu *"x'in ilk yerel
   maksimumu"* diye buluyor (`flat_convention_check.mjs:112-116`), bu da ancak
   omuz göğüsten genişse doğru. **Kapı, düzeltmeye çalıştığı kusurun kendisini
   varsayıyor.** Karar `DAMLA-KUYRUK K-FE-1`'de.

2. **`h10_gate_check` ctest'te DISABLED** (`ctest -N` çıktısı, Test #97).
   109 testin biri bu; koşan 108.

3. **Beden çizelgesi çakışması ölçüldü:** kapının kendi parite raporu diyor ki
   *"Buğra'nın KENDİ beden çizelgesi EU38 = büst 920 / bel 720 / kalça 980 mm;
   burda EU38 = 880 / 700 / 940. Buğra'nın 38'i burda'nın 40'ı."* Yani Buğra
   paritesi mutlak mm'de değil, sadece oranda kurulabiliyor.

4. **`sizechart.hpp:87-137`'de 13. emsal kaydı:** omuz kolonu chart'a
   çevrildi, tam ölçüldü, **geri alındı**. Gerekçe: `spec_census`'un beden-ötesi
   dikiş-sayısı sabitliği kırılıyor ve `edgemono_check` + `walkgate_check` +
   `cutplan_check` **üçü birden kırmızıya dönüyor**. Dosyanın kendi cümlesi:
   *"what is shipped below is the worse of the two numbers, knowingly."*

5. **`fashion-flat-models/` ve `new_flats/` içinde KOD YOK** — ikisi de saf
   görsel referans. Kart onları "girdi" saydığı için ölçüldü: `new_flats`
   `engine/tools/flat-metre/goldens-v2.json`'un golden kaynağı, yani ölü değil.

6. **`web/js/` içinde flat ÇİZEN kod yok.** `render-flat.mjs:11` `web/js/sheet.js`'i
   "CANLI TÜKETİCİ" diye anıyor ama ok ters yönde: `render-flat.mjs`, `sheet.js`'ten
   `pathD/bounds/shelfPack` **import ediyor**. `web/js/studio.js:28` ayrı bir
   "ANAYASA flat language" (ince kontur + tek pastel dolgu) taşıyor — üçüncü bir
   çizim dili olabilir, **DOĞRULANMADI**, açılmadı.

7. **`curve-research/01-elastica.py`** başlığında bugünkü motorun eğri sabitlerini
   ismen sayıyor: `bodice.hpp` `armholeHollowShareFront=0.34`,
   `armholeShoulderTangentShare=0.26`, `armholeLowerDropShare=0.78`. Kartın 1.
   maddesi flat tarafını istedi; bunlar **kalıp** tarafının elle seçilmiş
   oranları, ayrı bir kova. Elastica alternatifi araştırma aşamasında, ctest bağı
   yok (`grep` ile `engine/CMakeLists.txt`'te `elastica` geçmiyor).

8. **`h3b-rings.py` sistem python3'üyle KOŞMUYOR** — `svgpathtools` yok
   (`ModuleNotFoundError`). `engine/pattern-bridge/.venv/bin/python3` ile koşuyor.
   Venv gitignore'da, yani bu kapı **temiz bir makinede kurulum olmadan koşmaz**.

## GÖREMEDİĞİM / AÇILMAYAN

- `engine/tests/` 108 girişin yalnız 5'i açıldı; kalan test dosyalarının ne
  ölçtüğü **DOĞRULANMADI**.
- `engine/tools/` 103 girişin ~15'i açıldı. `tracer/trace-flat.py`,
  `bugra/`, `atolye/`, `flat-metre/fit-golden.py` **açılmadı**.
- `web/js/studio.js`, `web/js/sheet.js`, `web/js/render.js` **açılmadı** —
  web'in flat/kalıp çizim yolu bu turda ölçülmedi.
- `patterns_real/` altındaki PDF'lere kart gereği DOKUNULMADI; oradan gelen
  sayılar `contract/flat-convention-v1.json`'un beyanından okundu, birincil
  kaynaktan yeniden ölçülmedi.
- Tam `ctest` koşulmadı (kart yasağı) — 109 testin kaçının bugün yeşil olduğu
  **BU TURDA ÖLÇÜLMEDİ**.
