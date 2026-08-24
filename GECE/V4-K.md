# V4-K — HANGİ HAT YARGILANACAK? İki flat hattının ÖLÇÜMÜ

KART: `GECE/KART/V4-K.md` · SALT ÖLÇÜM (engine/src, engine/tools, engine/tests,
contract/ altında hiçbir dosya değiştirilmedi — `git status` ile doğrulanır).
Ham çıktılar: `GECE/log/V4-K.*` · problar: `GECE/probe/v4k-measure.mjs`,
`GECE/probe/v4k-census-hat2.mjs`.

**HAT-1 = HESAPLANAN KABUK** `engine/build/shell-flat` (kaynak
`engine/tools/shell-flat.cpp` → `engine/src/shellprojection.cpp` +
`engine/src/garmentshell.cpp` `buildGarmentSurf`).
**HAT-2 = ÇİZİM KALEMİ** `engine/tools/render-garment-flat.mjs`, kanunu
`contract/flat-convention-v1.json`, kapısı `engine/tests/flat_convention_check.mjs`.

---

## 1. KAPSAM

| | HAT-1 | HAT-2 |
|---|---|---|
| kabul edilen BEDEN | **8** (EU34…EU48; EU50/EU52 → `need neck/shoulder/bust/waist/hip rings`, EU-dışı → `unknown size`) | 1 (croquis EU38'e mühürlü, `data-ref-size="EU38"`) |
| kabul edilen STİL/GİYSİ parametresi | **0** | ≥22 (aşağıda) |
| kapı stil matrisi | — (kapısı yok) | **8/8 stil bastı** |
| eksen taraması (neckline 9 · shaping 3 · skirtStyle 5 · sleeveStyle 5) | ÜRETİLEMEZ | **22/22 spec değeri SVG bastı** |
| referans kalem `styles.json` (31 stil) adıyla tanınan | 0 | **24/31** (tanımayan 7: princess_dress, gore_skirt_dress, lace_vneck_70s, peterpan_puff, courtney_lace_vneck, dress_bandeau_circle, dress_vneck_aline) |

Komut: `node GECE/probe/v4k-measure.mjs` → `GECE/log/V4-K.probe.txt`

HAT-1'in argv işleyicisi (`shell-flat.cpp:132-143`) SADECE `--svg` bayrağı ve tek
konumsal BEDEN alır. Giysi `const SheathOptions opt;` ile VARSAYILAN kurulur
(`shell-flat.cpp:145`). **HAT-1'de ikinci bir stil ÜRETİLEMEZ.**

---

## 2. BEŞ KONVANSİYON MADDESİ — HAT HAT, SAYIYLA

### a. TEK CROQUIS

| | HAT-1 | HAT-2 |
|---|---|---|
| iki farklı stilin omuz genişliği farkı | **ÜRETİLEMEZ** (stil parametresi 0) | **0.00 mm** (8 stil) |
| göğüs hattı yüksekliği farkı | **ÜRETİLEMEZ** | **0.00 mm** |
| bel hattı yüksekliği farkı | **ÜRETİLEMEZ** | **0.00 mm** |
| omuz ucu x / y farkı | **ÜRETİLEMEZ** | **0.00 mm / 0.00 mm** |
| beyan == çizilen (anti-hack) | beyan YOK | **geçti** (`data-croquis="eu38-flat-v1"`) |

HAT-2 sayıları: `node engine/tests/flat_convention_check.mjs` →
`GECE/log/V4-K.hat2.convention.txt` (tolerans ±2mm, `PASS … 0 ihlal`).

HAT-1'de aynı GİYSİNİN bedenler arası oynaması (croquis ölçüsü DEĞİL, bilgi):
EU34 omuz 314.57mm / EU38 334.57 / EU48 384.57 — beden başına tam +5.00mm.

### b. ÖLÇEK BEYANI

| | HAT-1 | HAT-2 |
|---|---|---|
| `data-scale` | **`"1"`** (var) | **`"1:3"`** |
| `data-unit-mm` | **YOK** | **`"3"`** |
| göğüs yarı-genişliği × unitMM | 229.56 mm × 1 = **229.56 mm** | **219.90 mm** |
| `bustCM*10/4` (EU38, tables.json verified) | 220.00 mm → **fark +9.56 mm** | 220.00 mm → **fark 0.10 mm** |

HAT-1'in +9.56mm'si bir SAPMA DEĞİLDİR: HAT-1 vücudu değil GİYSİ kabuğunu çizer,
fark ease'dir (kabuk göğüs çevresi 754.75mm, vücut 880mm değil). AMA **HAT-1 hiçbir
yerde bunu BEYAN ETMİYOR** — `data-scale="1"` dışında ölçek/ease beyanı yok,
`data-unit-mm` yok, referans beden beyanı yok. Yani madde (b) HAT-1'de
**yarım geçiyor**: ölçek beyanlı, ölçünün neye ait olduğu beyansız.

### c. ÇİZGİ HİYERARŞİSİ

| | HAT-1 | HAT-2 (8 stilin birleşimi) |
|---|---|---|
| ayrı (stroke-width, dash) çifti | **1** — `("1.2", none)`, `<g>` seviyesinde | **5** |
| beyanlı bir sınıfa EŞİT olan çift | **0/1** | **5/5** |
| kanunda beyanlı sınıf | 5 (outline, seam, mark, topstitch, hidden) | aynı 5, hepsi kullanılmış |

HAT-2 çiftleri ve kullanım sayıları: `2\|none ×20` (outline) · `1.4\|none ×29` (seam) ·
`1\|4 3 ×17` (topstitch) · `1\|1 3 ×1` (hidden) · `1\|none ×6` (mark).

HAT-1 kanun dosyasını **hiç okumuyor**: `shell-flat.cpp`'de `contract/` referansı
yok, `stroke-width="1.2"` kaynakta gömülü sabit (`shell-flat.cpp:117`).

### d. SIFIR GÖLGE/GRADYAN · ÖN & ARKA · DETAY CALLOUT

| | HAT-1 | HAT-2 (8 stil toplamı) |
|---|---|---|
| gradient | **0** | **0** |
| filter | **0** | **0** |
| opacity/fill-opacity/stroke-opacity | **0** | **0** |
| `data-view="front"` / `"back"` | **1 / 1 (VAR)** | **8 / 8 (VAR)** |
| detay callout elemanı | **0** | **0** |
| stroke renk kümesi | `{#111}` | `{#1f3a5f}` (tek mürekkep) |

**★ HAT-1'DE ÖN PANEL = ARKA PANEL — SIFIR FARKLA.**
JSON'daki 4 kübik segmentin 16 kontrol noktası, |x| tabanında karşılaştırıldığında:

```
segs |x| en büyük kontrol noktası farkı: 0.000000000 mm
outline 189 nokta, |x| tabanlı en büyük fark: 0.000000 mm
topZ farkı 0.000000 mm · bottomZ farkı 0.000000 mm
span shoulder->bust  front 198.0449 / back 198.0449  -> Δ 0.000000 mm
span bust->waist     front 142.6793 / back 142.6793  -> Δ 0.000000 mm
span waist->hip      front 211.2910 / back 211.2910  -> Δ 0.000000 mm
span hip->hem        front 206.1376 / back 206.1376  -> Δ 0.000000 mm
kapalı kontur alanı  front 2451.09 cm² / back 2451.09 cm²
```

front[i].x = −back[i].x, z'ler birebir aynı. **HAT-1'in arka görünümü, ön
görünümün x-işareti çevrilmiş kopyasıdır; ARKADA OLAY YOK.** Sayı 0.000000000mm,
"yaklaşık aynı" değil, AYNI.

HAT-2'de ön≠arka, ölçüldü (siluet kontur uzunluğu farkı, mm):

| stil | Δ genişlik | Δ yükseklik | **Δ kontur uzunluğu** | path adedi ön/arka |
|---|---|---|---|---|
| princess_scoop_dress | 0.00 | 0.00 | **97.84** | 12 / 12 |
| boat_shift_dress | 0.00 | 0.00 | **3.39** | 12 / 10 |
| vneck_empire_dress | 0.00 | 0.00 | **211.91** | 10 / 8 |
| square_gathered_dress | 0.00 | 0.00 | **205.95** | 14 / 12 |
| crew_sleeved_top | 0.00 | 0.00 | **39.12** | 6 / 4 |
| sweetheart_crop_top | 0.00 | 0.00 | **117.38** | 4 / 4 |
| scoop_tunic_placket | 0.00 | 0.00 | **97.84** | 12 / 10 |
| cowl_openback_top | 0.00 | 0.00 | **141.69** | 4 / 3 |

Yani HAT-2'de siluetin DIŞ KUTUSU ön/arkada aynı (Δ 0.00mm — croquis kanunu),
içindeki yaka/kapama farkı 3.39…211.91mm arası gerçek bir fark.

### e. ARTEFAKT SAYIMI

`engine/tests/flat_artifact_census.mjs` HAT-1 için yazılmış (shell-flat JSON okur).
HAT-2'ye **UYGULANDI**, kapının kendi `V3C_SHELL_JSON` kanıt kancasıyla, kapı
DEĞİŞTİRİLMEDEN. Adaptör: `GECE/probe/v4k-census-hat2.mjs` (örnekleme adımı 4.0mm
= HAT-1'in `kSampleStepMM` ile aynı; birim ×3 mm'ye, y bir kez ters).
Ham çıktı: `GECE/log/V4-K.hat2.census.txt`.

| | 1 tırtıklı | 2 öz-kesişim | 3 C1 kırığı | 4 dejenere | en kötü teğet kırığı |
|---|---|---|---|---|---|
| **HAT-1** EU38 | **0** (ham 246) | **0** | **2** | **0** | **20.5602°** @ bel (bust→waist \| waist→hip) |
| HAT-2 princess_scoop_dress | 1 | 0 | 86 | 0 | **110.3728°** |
| HAT-2 boat_shift_dress | 0 (ham 40) | 0 | 8 | 0 | **71.4983°** |
| HAT-2 crew_sleeved_top | 1 | 0 | 68 | 0 | **103.9301°** |
| HAT-2 vneck_empire_dress | 0 (ham 65) | **4** | 105 | 0 | **174.1170°** |

**Bu tablo bir KALİTE KIYASI DEĞİLDİR — sebep ölçülmüş:** boat_shift_dress'in 8
C1 kırığının **5'i >45°**; bunlar omuz ucu, koltukaltı ve etek CF köşesi, yani
teknik flat'in OLMASI GEREKEN köşeleri. HAT-1'de bu köşeler yok çünkü HAT-1
omuz/kol oyuğu/yaka ÇİZMİYOR (§3). Kalan kırıkların büyük kısmı 1-5° bandında
(princess_scoop_dress'in listelenen ilk 20'sinin 20'si de 1-5°): 4mm adımda
yarıçapı ~79mm olan GERÇEK bir eğri de 2.9° dönüş verir. **C1 ölçüsü örnekleme
adımına bağlıdır ve gerçek eğriliği süreksizlikten ayırmıyor.**
HAT-1'in 20.56°'lik kırığı ise bunlardan farklı: kaynağı kapının kendi
teşhisiyle `engine/src/surfacepattern.cpp:71-81` — bel yüksekliğinde skim
zarfı ile halka interpolasyonunun teğet koşulsuz buluşması, yani **belde bir V
köşesi**. Bu bir tasarım köşesi değil, gerçek bir kusurdur.

vneck_empire_dress'teki **4 öz-kesişim** (174.12° cusp) HAT-2'nin gerçek kusuru:
V yaka ucu kendini kesiyor.

---

## 3. TEKNİK ÇİZİM ÖĞELERİ SİCİLİ

Ölçüm iki yoldan: (i) çıktı SVG'de makinece tanınabilir eleman (data-*),
(ii) spec ekseni açık/kapalı arasındaki ELEMAN SAYISI DELTASI.
Komut: `GECE/log/V4-K.hat2.elemanlar.txt`

| öğe | HAT-1 | HAT-2 | HAT-2 kanıtı (Δ eleman) |
|---|---|---|---|
| omuz dikişi | **YOK** | **VAR** | siluetin omuz köşesi + `data-shoulder-x/y` beyanı, 8/8 stil |
| kol oyuğu | **YOK** | **VAR** | siluetin parçası (`halfOutline`, render-garment-flat.mjs:321), ayrı eleman değil |
| yaka | **YOK** | **VAR** | `collarType` 0→1: **Δ +4 eleman** |
| kol | **YOK** | **VAR** | `sleeveStyle` yok→set: **Δ +4 eleman** |
| pens | **YOK** | **VAR** | `interior()` :565-572, iki path |
| iç dikiş çizgileri (prenses) | **YOK** | **VAR** | `shaping` shift→princess: **Δ +2 eleman** |
| topstitch | **YOK** | **VAR** | `hemTopstitchPath` :831, dash `4 3`, 8/8 stil |
| fermuar / kapama | **YOK** | **VAR** | `closure:'backZip'` **Δ +1**; `frontPlacket:1` **Δ +7** |
| etek ucu | **YOK** | **VAR** | siluetin parçası + hem topstitch |
| **TOPLAM** | **0/9** | **9/9** | |

HAT-1'in SVG'sinde toplam **2 çizen eleman** vardır (ön siluet path'i, arka siluet
path'i) + 2 metin. Başka hiçbir şey yok. HAT-2'de stil başına çizen eleman:
7…13 (`GECE/log/V4-K.probe.txt`).

⚠ **HAT-2'nin sicili SAYIYLA VAR ama ETİKETSİZ:** tüm çıktıda `data-part` taşıyan
sadece iki eleman var (`sleeve`, `cuff-band`). Pens, prenses dikişi, fermuar,
placket, yaka, bel dikişi **isimsiz path/line** olarak basılıyor. Bir kapı bunları
bugün ancak eleman SAYARAK ayırt edebilir, ADIYLA değil.

⚠ **HAT-2 SESSİZ ÇÖKERTİYOR (RULES invariant 1'e temas):**
- `sleeveStyle` **set / raglan / puff → çıktı BAYT BAYT AYNI**. Sadece `cap` ve
  `none` farklı. Yani 5 değerin 3'ü tek çizime çöküyor, Err verilmiyor.
- `collarType` **1 / 2 / 3 → çıktı BAYT BAYT AYNI**. Sadece 4 farklı.
- `shaping:'shift'` ile `shaping:'darts'` arasında eleman farkı **0**: `interior()`
  :567'nin `else` dalı shift'e de ön pensi çiziyor, yani "shift" pensli çıkıyor.

---

## 4. KÖK BAĞ — HAT-2 kabuktan mı besleniyor?

**HAYIR. Kaynak okundu, iddia değil.**

- `engine/tools/render-garment-flat.mjs` içinde `buildGarmentSurf` / `GarmentSurf`
  / `shellprojection` geçmiyor (0 eşleşme).
- Dosyanın **TÜM** import satırı **1 tane**:
  `render-garment-flat.mjs:29  import { readFileSync } from 'node:fs';`
  (ayrıca :901'de `await import('../flat-engine/_engine-full.mjs')` — referans
  kaleme dinamik köprü; o da JS, kabuk değil.)
- Okuduğu tek dış veri: `render-garment-flat.mjs:30`
  `contract/flat-convention-v1.json` → **29 adet `LAW.` / `CQ.` referansı**.
- Geri kalanı elle yazılmış: yorumsuz kodda **160 ondalıklı sabit (62 tekil
  değer)** + **454 tamsayı sabiti (56 tekil değer)**.
- HAT-1'in kendi kaynağı bunu zaten yazıyor (`shell-flat.cpp:5-10`):
  *"The flat's outer contour used to be DRAWN: tools/render-garment-flat.mjs takes
  it from a 2D croquis with zero ease, and at EU38 that croquis says the waist is
  700.0mm while the pattern line says 724.89mm."*
  Bugünkü kabuk beli **725.0000mm** (`shell-flat EU38` measures) — fark **25.0mm**.
- Kanunun kendi `referenceBody` maddesi de bunu beyan ediyor: croquis çapaları
  `contract/tables.json → draft.euSizeChart.EU38`'e (VÜCUT) bağlı, giysi kabuğuna
  değil; "manken çizelgesi KAYNAK YOK, Damla kararı bekliyor" AÇIK KALEM.

---

## 5. `_LEGACY` DURUMU

`grep -rn "_LEGACY" engine/ web/ contract/` → **tek satır**
(`GECE/log/V4-K.legacy.txt`):

```
engine/CMakeLists.txt:714:add_executable(h10_gate_check tests/h10_gate_check_LEGACY.cpp)
```

Bu HAT-2 ile ilgisizdir (H1.0 giyilebilirlik kapısı, `DISABLED TRUE`,
CMakeLists.txt:717). **HAT-2 `_LEGACY` bayrağı arkasında DEĞİL — CANLI.**

Tüketicileri (`GECE/log/V4-K.hat2.tuketiciler.txt`, **19 dosya**):
- kapılar/testler (6): `flat_convention_check.mjs`, `flat_sellable_check.mjs`,
  `flat_geometry_sellable_check.mjs`, `style_check.mjs`, `bridge_guard.mjs`,
  (+`katman-lint.py` referansı)
- araçlar (8): `render-flat.mjs`, `figure-lint.mjs`, `one-figure-lint.mjs`,
  `gen-wrap-grid.mjs`, `gen-gore-grid.mjs`, `gen-taste-pool.mjs`,
  `flat-board.mjs`, `render-on-figure.mjs`
- derleyici: `engine/compiler/compile.mjs:104`
- script: `scripts/repin-style.sh:117`
- **canlı site: `web/atolye.html`** (styles.json gömülü)

HAT-1 tüketicileri (`GECE/log/V4-K.hat1.tuketiciler.txt`, **6 dosya**):
`engine/CMakeLists.txt`, `flat_artifact_census.mjs`, `flat_pattern_agree_check.mjs`,
`flat-board.mjs`, `pattern-measure.mjs`, `vocab-reference-baseline.json`.
Web'de sıfır tüketici.

---

## HÜKÜM ÖNERİSİ (öneridir; kararı şef ve hakem verir)

> **V4 konvansiyon kapısı HAT-2'yi (çizim kalemi) yargılasın; HAT-1 kapıya
> yargılanan değil, kapının bir RAPOR-SATIRI olarak girsin — "kalemin çizdiği
> siluetin bel/göğüs/kalça yarı-genişliği, aynı bedenin kabuk ölçüsünden kaç mm
> sapıyor" tek satırı.**

### Her seçeneğin ölçülmüş bedeli

| seçenek | ÜRETİLEMEZ kalan konvansiyon maddesi | başka bedel |
|---|---|---|
| **HAT-2 yargılanır** (öneri) | **0/5** — beşi de bugün ölçülüyor, kapı `0 ihlal` | HAT-1'in kabuk hakikati kapıya girmez; rapor-satırı bunu kapatır |
| HAT-1 yargılanır | **2/5 ÜRETİLEMEZ** (a TEK CROQUIS — stil parametresi 0, iki stil üretilemez; c ÇİZGİ HİYERARŞİSİ — 1 çift, 0/1 beyanlı) + (d) yarım: ön=arka 0.000000000mm | teknik çizim sicili **0/9**; canlı sitede **0 tüketici**; kapının koruduğu şey 2 path olur |
| **İKİ HAT BİRDEN yargılanır** | HAT-1 tarafında yine **2/5 ÜRETİLEMEZ** | aşağıda |

### "İki hattı birden yargılamak" neden süs — SAYIYLA

1. Beş maddenin **ikisi HAT-1'de tanımsız**: (a) TEK CROQUIS iki farklı stil
   ister, HAT-1'in kabul ettiği stil parametresi sayısı **0**; (c) çizgi
   hiyerarşisi beyanlı sınıf ister, HAT-1'in beyanlı sınıfı **0/5**. İki maddeyi
   HAT-1'e uygulayan bir kapı ya **koşulsuz yeşil** basar (ölçtüğü şey yok) ya da
   **koşulsuz kırmızı** — ikisi de bilgi taşımaz.
2. Madde (d) HAT-1'de **hep ve otomatik geçer**: ön/arka farkı
   **0.000000000 mm**, çünkü arka ön'ün ayna kopyası. Yani kapı "ön ve arka var"
   diye yeşil basarken **arkada olay olmadığını** göremez. Bir kapının
   göremediği şeyi yeşil basması, kapının kendisini süs yapar.
3. Sicil sayısı: HAT-1 **0/9** teknik çizim öğesi çiziyor, HAT-2 **9/9**.
   İki hattı birden yargılayan kapının HAT-1 tarafında yargılayacağı toplam
   çizen eleman **2**'dir (iki siluet path'i).
4. Tüketici sayısı: HAT-2 **19 dosya** (kapılar + canlı `web/atolye.html`),
   HAT-1 **6 dosya**, web'de **0**. Kapının koruduğu yüzey HAT-2'de 3 kat geniş
   ve müşterinin gördüğü tek yüzey orası.
5. **HAT-1'i kapıya sokmamak, onu bilgisiz bırakmak değildir:** HAT-1 zaten kendi
   kapısında (`flat_artifact_census`) ölçülüyor ve bugün **1 ihlal** (belde
   20.5602° V köşesi) ile KIRMIZI. O kırmızı ayrı bir cephedir, konvansiyon
   cephesi değil.

### Öneriye eklenen tek şart

Rapor-satırı **sayı** olmalı, kanaat değil: bugün ölçülen fark **bel 25.0 mm**
(croquis 700.0 vs kabuk 725.0000) ve **göğüs yarı-genişliği 9.66 mm** (219.90 vs
229.56). Kapı bu iki sayıyı BASSIN, eşiğe bağlamasın — eşik kartın yasakladığı
uydurma olur, `GECE/V4-R.md` bekler.

---

## KART DIŞI FARK EDİLEN (dokunulmadı)

1. **Kanunun kendisi, kendi sayısının YANLIŞ olduğunu yazıyor.**
   `contract/flat-convention-v1.json → croquis.landmarks.shoulderTipX`:
   `"_F_E_OLCULDU_AMA_DEGISTIRILMEDI"` — 78.0u = 234mm yarı-omuz, aynı croquis'in
   göğüs yarı-genişliği 73.3333u = 220mm, yani **omuz ucu büstün DIŞINDA**
   (oran 1.0636). Satın alınmış Buğra Locket EU38 arka bedende ölçülen oran
   **0.9570** → doğru değer **70.1799u**. Kapı bugün stiller arası AYNILIĞI
   zorluyor, doğruluğu değil. Yani HAT-2'nin `0.00mm` sapması "hepsi aynı yanlış
   omuzdan çıkıyor" demektir.
2. **`sleeveStyle` set/raglan/puff ve `collarType` 1/2/3 bayt bayt aynı çizimi
   üretiyor** (yukarıda §3). RULES invariant 1 "sessizce düşürme/çökertme yok"
   ile doğrudan çelişiyor; bugün hiçbir kapı bunu yakalamıyor.
   `CLAUDE.md`'de zaten bir emsali var: *"sleeveStyle 'puff' silently dropped,
   2026-07-18"* — aynı kusur sınıfı, kalem tarafında hâlâ açık.
3. **`shaping:'shift'` pens çiziyor** (`interior()` else dalı) — shift tanımı
   gereği pensiz bir siluettir.
4. **`flat_artifact_census.mjs`'in C1 ölçüsü örnekleme adımına bağlı** ve gerçek
   eğriliği süreksizlikten ayırmıyor (§2e'de sayıyla). HAT-2'ye uygulandığında
   86-105 "kırık" sayıyor, oysa bunların çoğu 1-5° bandında, 4mm adımda
   R≈79mm'lik meşru bir eğrinin verdiği dönüş. Eşik/adım ilişkisi
   `GECE/V4-R.md`'ye ait, burada sadece ölçüldü.
5. **`flat_artifact_census.mjs` kart tarihinden sonra dokunulmuş:** dosya damgası
   `24 Ağu 16:22`, `shell-flat.cpp` `24 Ağu 16:04`. Bu gece başka bir kart aynı
   dosyalarda çalışıyor olabilir; **DOĞRULANMADI**, ben dokunmadım.
6. **HAT-1'in artefakt kapısı bugün KIRMIZI:** `flat_artifact_census — 1 ihlal`
   (belde 20.5602°). Kartın konusu değil ama HAT-1'i "yargılayan hat" yapma
   tartışmasında sayıdır.
7. `flat-board.mjs` **HER İKİ hattı da** import ediyor — iki hattı bugün tek
   ekranda birleştiren tek dosya orası. İncelenmedi.

---

## YAPILAMAYAN

- **HAT-1'de (a) TEK CROQUIS ve (c) ÇİZGİ HİYERARŞİSİ maddeleri: ÜRETİLEMEZ.**
  Sebep ölçüldü: stil parametresi 0, beyanlı çizgi sınıfı 0.
- **PNG render yok.** Bu kart salt ölçümdür; hiçbir hüküm göze dayanmıyor,
  hepsi komut çıktısına dayanıyor (RULES 3 ihlali yok — "baktım" cümlesi
  kurulmadı).
- **Eşik önerilmedi.** Kartın yasağı: eşik `GECE/V4-R.md`'yi bekler.
