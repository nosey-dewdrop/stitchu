# V7-B — KOL: SEKİZ DEĞER NE, NEREDE ÖLÜYOR

Koşu: 2026-08-25. Kart: `GECE/KART/V7-B.md`. ÖLÇÜM kartı — kaynak dosya değiştirilmedi.

> ⚠ **KARTIN ÖNCÜLÜ ÖLÇÜMLE DÜŞTÜ.** Kart "flat sekizini de AYNI çiziyor
> (KOL 0/8 İFADESİZ)" diyor. Kapının kendi çıktısı bunun tersini basıyor:
> `sleeveStyle UNEXPRESSED 0/0` = **sıfır değer ifadesiz**, sekiz yazım
> flat'te **dört ayrı geometri** üretiyor. "0/8" rakamı "8'in 0'ı ifadesiz"
> diye okunur, "0 tanesi ifade edilmiş" diye değil. Aşağıdaki sha256 tablosu
> bunu kanıtlıyor.

---

## S1 — SEKİZ KOL DEĞERİNİN ADI VE TANIM YERİ

Sekiz değer **hiçbir dosyada tek liste olarak durmuyor**; kapı onu beş kaynağın
BİRLEŞİMİNDEN türetiyor (`engine/tests/flat_expresses_spec_check.mjs:169-179`).
Kapının kendi bastığı alan:

```
=> ALAN (8): straight none balloon cap bishop fitted puff set-in
```

| # | değer | nerede TANIMLI (dosya:satır) | tür |
|---|---|---|---|
| 1 | `none` | `engine/vocab.json:9` (`values`) · `contract/spec-grammar.json:43` · `contract/garment-spec.schema.json` · `contract/spec-v1-v2-map.json:169` | kanonik |
| 2 | `straight` | `engine/vocab.json:9` · `contract/spec-grammar.json:45` | kanonik |
| 3 | `balloon` | `engine/vocab.json:9` · `contract/spec-grammar.json:46` | kanonik |
| 4 | `cap` | **SADECE** `contract/spec-grammar.json:47`. `engine/vocab.json`'un `values`'unda YOK, `synonyms`'unda da YOK | kanonik (tek kaynaklı) |
| 5 | `puff` | `engine/vocab.json:10` → `balloon` | BEYANLI EŞANLAM |
| 6 | `bishop` | `engine/vocab.json:10` → `balloon` | BEYANLI EŞANLAM |
| 7 | `set-in` | `engine/vocab.json:10` → `straight` | BEYANLI EŞANLAM |
| 8 | `fitted` | `engine/vocab.json:10` → `straight` | BEYANLI EŞANLAM |

`engine/vocab.json:9-10` (birebir):

```json
"sleeveStyle": { "type": "string", "enum": "SleeveStyle", "values": ["none", "straight", "balloon"],
  "synonyms": { "puff": "balloon", "bishop": "balloon", "set-in": "straight", "fitted": "straight" } },
```

**Yani sekiz sayısının yapısı: 4 kanonik + 4 beyanlı eşanlam.** Eşanlamların aynı
çizmesi kusur değil, sözleşmenin ta kendisi.

### Fiilen kullanılan yazımlar (kartın komutu, aynen koşuldu)

```
$ F=sleeveStyle; git ls-files -z '*.json' | xargs -0 grep -ho "\"$F\"[[:space:]]*:[[:space:]]*\"[^\"]*\"" \
    | sed 's/.*: *"//;s/"//' | sort | uniq -c | sort -rn
 237 straight
 140 none
  35 balloon
  29 cap
```

Dört eşanlamın (`puff`/`bishop`/`set-in`/`fitted`) takipli 169 JSON'da **kullanımı
SIFIR**. Yani sekiz değerin yarısı yalnız sözlükte var, veride yok.

---

## S2 — KAPI BUGÜN NE BASIYOR (ÖLÇÜLDÜ, DEVRALINMADI)

```
$ node engine/tests/flat_expresses_spec_check.mjs
```

Kol bölümünün çıktısı, aynen:

```
--- DOMAIN: kol degeri alani TURETILDI (elle yazilmadi)
    spec JSON kullanimi (git ls-files)                   balloon cap none straight
    engine/vocab.json fields.sleeveStyle.values          balloon none straight
    engine/vocab.json fields.sleeveStyle.synonyms        bishop fitted puff set-in
    contract/spec-grammar.json slots.sleeve              balloon cap none straight
    contract/spec-v1-v2-map.json axes.sleeveStyle        balloon none straight
    contract/garment-spec.schema.json draftSpec.sleeveStyle balloon none straight
    => ALAN (8): straight none balloon cap bishop fitted puff set-in
    kullanim: straight 237 · none 140 · balloon 35 · cap 29

--- (A) KOL: her deger IFADE EDILDI mi, UNEXPRESSED mi? (olcu: cizen eleman kumesi + kontur uzunlugu)
    sleeveStyle straight         eleman  10  kontur 2705.08u  kalip-boslugu="sleeveStyle=straight:sleeve"
    sleeveStyle none             eleman   6  kontur 1917.76u
    sleeveStyle balloon          eleman  54  kontur 2996.36u  kalip-boslugu="sleeveStyle=balloon:sleeve+gatheredOverlayLayer"
    sleeveStyle cap              eleman  10  kontur 2354.75u  kalip-boslugu="sleeveStyle=cap:sleeve"
    sleeveStyle bishop           eleman  54  kontur 2996.36u  kalip-boslugu="sleeveStyle=bishop:sleeve+gatheredOverlayLayer"
    sleeveStyle fitted           eleman  10  kontur 2705.08u  kalip-boslugu="sleeveStyle=fitted:sleeve"
    sleeveStyle puff             eleman  54  kontur 2996.36u  kalip-boslugu="sleeveStyle=puff:sleeve+gatheredOverlayLayer"
    sleeveStyle set-in           eleman  10  kontur 2705.08u  kalip-boslugu="sleeveStyle=set-in:sleeve"
ok    (SYN) 'bishop' beyanli esanlam 'balloon' ile OZDES ciziyor
ok    (SYN) 'fitted' beyanli esanlam 'straight' ile OZDES ciziyor
ok    (SYN) 'puff' beyanli esanlam 'balloon' ile OZDES ciziyor
ok    (SYN) 'set-in' beyanli esanlam 'straight' ile OZDES ciziyor
ok    (A) 'straight' IFADE EDILDI (alandaki her kanonik degerden farkli)
ok    (A) 'none' IFADE EDILDI (alandaki her kanonik degerden farkli)
ok    (A) 'balloon' IFADE EDILDI (alandaki her kanonik degerden farkli)
ok    (A) 'cap' IFADE EDILDI (alandaki her kanonik degerden farkli)
```

Ve sonundaki ratchet:

```
--- RATCHET (UNEXPRESSED yalniz DUSEBILIR)
ok    RATCHET sleeveStyle UNEXPRESSED 0/0
ok    RATCHET collarType UNEXPRESSED 4/4  [5=shirt · 2=mock · 3=flat · 6=crescent]
ok    RATCHET shoulderStyle UNEXPRESSED 1/1  [dropped]

flat_expresses_spec_check: 0 FAIL      (exit 0)
```

**HÜKÜM: kol satırı 0/8 İFADESİZ DEĞİL.** Kol ekseni bugün kapının en TEMİZ
ekseni: dört kanoniğin dördü de ayrı çiziyor, dört eşanlamın dördü de beyanını
tutuyor. Bugün ifadesiz olan eksenler **yaka (4)** ve **omuz (1)**.

Kapı ctest'te de var: `engine/CMakeLists.txt:115`.
İlgili C++ kapıları tek tek koşuldu (tam ctest başlatılmadı):

```
$ ctest --test-dir engine/build -R '^(sleeve_check|cap_sleeve_check)$'
1/2 Test #52: sleeve_check ..................... Passed 0.05 sec
2/2 Test #53: cap_sleeve_check ................. Passed 0.01 sec
100% tests passed, 0 tests failed out of 2
```

---

## S3 — ZİNCİRİN HER HALKASINDA SEKİZ AYRI MI?

### (a) spec/JSON girdisi — **AYRI DEĞİL, ZATEN 4**

Takipli JSON'larda geçen yazım 4 tane (`straight`/`none`/`balloon`/`cap`, sayım
S1'de). Diğer 4 yazım hiçbir spec'te geçmiyor; alan onları
`engine/vocab.json:10`'daki eşanlam tablosunun ANAHTARLARINDAN alıyor.
Yani zincir girdide sekiz DEĞİL, girdi zaten dört.

### (b) bridge/parse — **8 → 4, TEK SATIRDA, BEYANLI**

`engine/tools/render-garment-flat.mjs:121`

```js
const c = SLEEVE_SYNONYM[s] || s;
```

`SLEEVE_SYNONYM` = `engine/vocab.json` `fields.sleeveStyle.synonyms`
(okunduğu yer: `render-garment-flat.mjs:102`). Bu satır `puff·bishop → balloon`,
`set-in·fitted → straight` yapıyor. **8 → 4.** Bu bir kayıp DEĞİL, sözleşmenin
uygulanması; kapı ayrıca eşanlamın kanoniğiyle özdeş çizdiğini ŞART koşuyor
(`flat_expresses_spec_check.mjs:212-217`).

Sonra `sleeveV2()` (`render-garment-flat.mjs:127-132`) kanoniği v2 sicilinin
kapalı enum'una eşliyor: `none · setIn · puff · cap` — hâlâ 4.
`V2_BRANCH` (`:133`) dört v2 değerini dört çizim dalına bağlıyor:
`{none:'none', setIn:'plain', puff:'puff', cap:'cap'}`.

**⚠ AYNI HALKADA BİR SESSİZ ÇÖKERTME VAR (ölçüldü, kartın sorusunun dışında değil):**
alan DIŞI bir yazım `canonicalSleeve` → `null`, `sleeveBranch` → `'unknown'`
oluyor ama `hasSleeve` HAM değeri okuduğu için (`render-garment-flat.mjs:381`)
kol yine çiziliyor ve `puff`/`cap` bayrakları kapalı olduğu için **düz set-in
kolun BİREBİR aynısı** basılıyor:

```
$ node /tmp/v7b-oov.mjs
straight       canon= straight   v2= setIn      branch= plain    geo= e7a61347ae915109 gap= sleeveStyle=straight:sleeve
ZZZNONSENSE    canon= null       v2= undefined  branch= unknown  geo= e7a61347ae915109 gap= sleeveStyle=ZZZNONSENSE:unknown
kimono         canon= null       v2= undefined  branch= unknown  geo= e7a61347ae915109 gap= sleeveStyle=kimono:unknown
dolman         canon= null       v2= undefined  branch= unknown  geo= e7a61347ae915109 gap= sleeveStyle=dolman:unknown
raglan         canon= null       v2= undefined  branch= unknown  geo= b5838e64571f64e8 gap= sleeveStyle=raglan:unknown
```

`kimono`/`dolman` çizimi `straight` ile geometri-özdeş (`e7a61347ae915109`).
Damga onları ADIYLA sayıyor, o yüzden V4-E'nin diliyle "sessiz" değil — ama
V4-E kapıyı alanı KAYNAKTAN türetecek şekilde onardığından bu değerler artık
alana hiç girmiyor ve **kapı buraya bakmıyor**. RULES invariant 1 ("bilinmeyen
enum → Err") bu yolda uygulanmıyor: reddedilmiyor, düz kol çiziliyor.
Ayrıca `render-garment-flat.mjs:648` `String(style) === 'raglan'` diye bir
ARKA KAPI taşıyor — `raglan` bir kol değeri olmadığı halde (canon `null`) kol
ekseninden raglan topolojisini tetikliyor.

### (c) motorun çizim çağrısı — **FLAT'te 4 DAL, KALIP MOTORUNDA 0**

**Flat kalemi (sevk edilen görsel):** `sleeveHalf()`
`render-garment-flat.mjs:566-676`. Dallar:
`:567 if (!g.hasSleeve) return ''` (none) · `:594 const branch = sleeveBranch(spec)`
· `:595 puff` · `:599 cap` · aksi halde plain. **4 dal.**

**Kalıp motoru — İKİ AYRI MOTOR VAR ve kart burada ayrışıyor:**

1. **ESKİ 2B-formül motoru** `engine/src/sleeve.cpp` + `sleeve.hpp` VAR, canlı,
   ctest'te (`sleeve_check`, `cap_sleeve_check` — ikisi de Passed). Gerçek
   `PatternPiece` üretiyor (`sleeve.cpp:42-260`). AMA C++ `SleeveStyle` enum'u
   **üç değerli**: `engine/src/vocab.gen.hpp:24`
   `kSleeveStyle[] = { "none", "straight", "balloon" }`, `kSleeveStyleCount = 3`.
   `cap` burada bir SleeveStyle değil, **ayrı eksende**:
   `vocab.gen.hpp:42 kSleeveCap[] = { "plain","gathered","puffed","cap" }`.
   Yani bu motorda 4 → 3 + 1 (ikinci eksen).
2. **SEVK EDİLEN yüzey motoru** `engine/src/surfacepattern.cpp/.hpp`: kol YOK.
   Bugün ölçüldü:
   ```
   $ grep -nc "sleeve" engine/src/surfacepattern.cpp engine/src/surfacepattern.hpp
   engine/src/surfacepattern.hpp:1
   engine/src/surfacepattern.cpp:9
   $ grep -n "sleeve" engine/src/surfacepattern.{cpp,hpp} | grep -vi sleeveless
   engine/src/surfacepattern.cpp:245://   and the sleeved line it moves from, p.16:
   ```
   On satırın onu da YORUM (dokuzu "sleeveless", biri Aldrich alıntısı).
   Ayrıca `grep -n "gather\|pleat\|ruffle\|collar" surfacepattern.{cpp,hpp} | wc -l` → **0**.
   `SheathOptions` (`surfacepattern.hpp:284-620`) **36 alan** taşıyor, hiçbiri kol:
   `hemDropBelowHipMM shoulderTop skimBodice hemSweepOverHipMM hemSweepHipRatio
   hemSweepMM backOpeningMM neckWidthCoefCM frontNeckDropCoefCM backNeckDropMM
   armhole shoulderNarrowMM shoulderSeam shoulderSeamForwardMM shoulderCrestBandMM
   easeNeckMM easeBustMM easeWaistMM easeHipMM ringSamples rowStepMM arapRounds
   polishIters cutRounds cutSweeps cutEmphasis maxDartDeg bodiceCutFracs
   bodiceDartFracs skirtCutFracs skirtDartFracs bodiceApexFrac topDartSplitFrac
   topDartApexFrac skirtApexFrac hipBlendMM`

   **Sekiz değer bu motorda BİRE iniyor: hepsi kolsuz.**

### (d) çıkan artefakt — SHA256 TABLOSU

Sekiz SVG, taban spec `{garment:top, neckline:crew, shaping:darts, topLength:hip,
sleeveLength:short}`, sadece `sleeveStyle` oynatıldı
(`/tmp/v7b-render.mjs`, `/tmp/v7b-geo.mjs`; kalem `renderGarmentFlat`):

| değer | tam SVG sha256 | geometri sha256 (yalnız çizen eleman kümesi) | eleman | kontur (u) | dosya |
|---|---|---|---|---|---|
| straight | `aecdf0d13dfd9a63f819d76ce580fbc4609f855636e11b032b14f1611fd1fd2e` | `e7a61347ae915109` | 10 | 2705.08 | /tmp/v7b-sleeve-straight.svg |
| none | `d64ce69bcffd5efba75ee3a9a71cd2ef31e01373f93dafc000a706e8d96a652c` | `5f2cbc2d8f3733e8` | 6 | 1917.76 | /tmp/v7b-sleeve-none.svg |
| balloon | `e1a9c2494d430f4250abd0788965fa75c59f680d93cd6eb030a674760db2e4b1` | `3fca2bd4ed9c6890` | 54 | 2996.36 | /tmp/v7b-sleeve-balloon.svg |
| cap | `2e4063240e28c836ef1079e2c50b3093c8b76659a18a1cc003b55f6a82cc6b4e` | `89decb408b227e48` | 10 | 2354.75 | /tmp/v7b-sleeve-cap.svg |
| bishop | `24afa0912e0cf57c3233c6c2155decec64fe3c1df60936fc60e1eee3c8b20cad` | `3fca2bd4ed9c6890` | 54 | 2996.36 | /tmp/v7b-sleeve-bishop.svg |
| fitted | `952eb41d2be7a35dabc854dc699d02a4d54fe7ce5cdad6926bf6211c6557b65e` | `e7a61347ae915109` | 10 | 2705.08 | /tmp/v7b-sleeve-fitted.svg |
| puff | `37f35a66e7e1417037e17f22f15f010ee5fd14525b4ebef0fa7c0b1867cc4b52` | `3fca2bd4ed9c6890` | 54 | 2996.36 | /tmp/v7b-sleeve-puff.svg |
| set-in | `51b18d1d4d26da12b5a961e5a722b64b9b043c378d6d5d32c1921e4998ceb933` | `e7a61347ae915109` | 10 | 2705.08 | /tmp/v7b-sleeve-set-in.svg |

```
ayrik svg sha: 8     ayrik geometri sha: 4
```

**Baytça sekizi de AYRI** — çünkü `data-engine-gap` damgası yazımın ADINI
gömüyor. **Geometrik olarak dört küme:**
`{straight·fitted·set-in}` · `{balloon·bishop·puff}` · `{cap}` · `{none}`.
Bu dörtlü kümelenme `engine/vocab.json:10`'un beyanının BİREBİR karşılığı.

---

## S4 — v2 SÖZLEŞMESİNDE `sleeve` ABSENT

### Nerede absent sayılıyor

`contract/garment-spec-v2.json:96-103` (birebir):

```json
"sleeve": {
  "status": "absent",
  "tr": "kol (ayrı yüzey yaması)",
  "binds": null,
  "proof": "surfacepattern.cpp/.hpp içinde 'sleeve' geçen 6 satırın 6'sı da 'sleeveless' kelimesi, hepsi yorum (17.08 ölçüldü). Kol oyuğu var, kol yok. engine/src/sleeve.cpp ESKİ 2B-formül motoruna aittir (CLAUDE.md: 'AT'), sevk edilen yüzey hattına bağlı değildir.",
  "refusalReason": "kol operatörü sicilde YOK: sevk edilen giysi kolsuzdur ve kol oyuğu bugün gerçek bir 2B delik değil (H1.0b). Kol, omuz dikişi (flagged) açılmadan konulamaz.",
  "blockedBy": "shoulderSeam"
}
```

Tüketildiği yerler:
- `contract/garment-spec-v2.json:155-163` — `topology.sleeve` enum'u:
  `none→[armholeNotch]`, `setIn→[sleeve]`, `puff→[sleeve,gatheredOverlayLayer]`,
  `cap→[sleeve]`.
- `engine/tools/render-garment-flat.mjs:148-155` `expressibility()` — `requires`
  içindeki her operatörün `status !== 'shipped'` olanını `missing`'e koyuyor.
- `flat_expresses_spec_check.mjs:284-297` (B bloğu) — damgayı bu sicile karşı
  doğruluyor.

**Sicilin diğer absent'leri (aynı dosya, `operators`):** `gatheredOverlayLayer`
(:90) · `sleeve` (:96) · `collarFamily` (:104) · `skirtFamily` (:111) ·
`zipperPiece`. `shoulderSeam` **flagged** (:80) — ve `sleeve`'in `blockedBy`'ı.

`sleeve` ABSENT olduğu için sekizin YEDİSİ (yani `none` hariç hepsi) kalıp
tarafında reddediliyor; kapının B bloğu bunu ADIYLA basıyor:

```
ok    (B) sleeve 'straight' -> sleeveStyle=straight:sleeve
ok    (B) sleeve 'none' -> none sicilde shipped/bosluksuz
ok    (B) sleeve 'balloon' -> sleeveStyle=balloon:sleeve+gatheredOverlayLayer
ok    (B) sleeve 'cap' -> sleeveStyle=cap:sleeve
ok    (B) sleeve 'bishop' -> sleeveStyle=bishop:sleeve+gatheredOverlayLayer
ok    (B) sleeve 'fitted' -> sleeveStyle=fitted:sleeve
ok    (B) sleeve 'puff' -> sleeveStyle=puff:sleeve+gatheredOverlayLayer
ok    (B) sleeve 'set-in' -> sleeveStyle=set-in:sleeve
```

### `sleeve` operatörü eklenirse HANGİ ALANLARI taşıması gerekir

Uydurma değil — bugün kolu ÇİZEN iki kalemin okuduğu parametreler.
Kaynak 1: `engine/src/sleeve.cpp` + `sleeve.hpp` (gerçek `PatternPiece` üretiyor).
Kaynak 2: `engine/tools/render-garment-flat.mjs` `sleeveHalf()` (flat).

**GİRDİ (çağrı imzası, `sleeve.hpp:50-57`):**

| alan | kaynak dosya:satır | ne yapıyor |
|---|---|---|
| `style` (SleeveStyle) | `sleeve.cpp:51,159` | `None` → boş; `Balloon` → hem/bulge katsayıları değişir + Cuff parçası doğar |
| `length` (SleeveLength) | `sleeve.cpp:31-38` | Short = `capHeight+90` · Elbow = `capHeight+0.35·armLength` · Long = `0.96·armLength` |
| `armholeLength` | `sleeve.cpp:55` | kapak hedef uzunluğu = `armholeLength·(1+capEase)` |
| `armholeDepth` | `sleeve.cpp:54` | `capHeight = armholeDepth·0.75` (başlangıç) |
| `fabric` (FabricAxis) | `sleeve.cpp:53,55` | biceps ease ve cap ease sürekli kumaş ekseninden |
| `cap` (SleeveCap) | `sleeve.cpp:104-107,116` | `Plain/Gathered/Puffed/Cap` — spread + rise + kanat dalı |

**TÜRETİLEN GEOMETRİ (operatörün taşıması gereken nicelikler):**

| nicelik | dosya:satır | tanım |
|---|---|---|
| `bicepsEstimate` | `sleeve.cpp:53` | `bust·bicepsRatio·(1+bicepsEase)` — SERT TABAN, kol bundan dar olamaz |
| `capHeight` | `sleeve.cpp:54,86-94,107` | önce `0.75·armholeDepth`, sonra kapak uzunluğu tutmazsa 20mm'ye kadar İKİLİ ARAMAYLA düşürülür |
| `width` | `sleeve.cpp:66-77,84-85` | kapak uzunluğunu hedefe oturtan ikili arama; biceps tabanının altına inerse tabana çakılır |
| `capEase` | `sleeve.hpp:12,20-21,23` | dokuma 0.04 / örme 0.02 (sürekli eksen `fabricease.hpp`) |
| `bicepsEase` | `sleeve.hpp:11,13,18-19,22` | dokuma 0.15 / örme 0.06 |
| `spread` | `sleeve.hpp:32-37` · `sleeve.cpp:104-105` | gathered `0.20·width` · puffed `0.45·width` · plain/cap 0 |
| `capRise` | `sleeve.cpp:106-107` | yalnız `Puffed`'de `= spread` (kanıt: cap-height RAISE == toplam spread) |
| `capWingDepth` | `sleeve.hpp:46` · `sleeve.cpp:124` | cap kolun taçtan aşağı sarkma derinliği (`constants.yaml`) |
| `hemHalf` / `midBulge` | `sleeve.cpp:162-163` | balloon `0.52·w` / `0.62·w`; düz `0.40·w` / `0.46·w` |
| kapak S-eğrisi | `sleeve.cpp:11-19` | ön hollow 0.24, arka 0.18 — koltukaltında oyuk, tepede dolgun |
| çentikler | `sleeve.cpp:194-199` | `±width·0.18`, `capHeight·0.18 → 0.05` |
| taç büzgü işareti | `sleeve.cpp:206-219` | `gx=capHalf·0.60`, `gy=capHeight·0.42` + taç boyu kesikli çizgi |
| `grainline` | `sleeve.cpp:234,153` | `{0, capHeight·0.4} → {0, hemY-40}` |
| `seamAllowance` | `sleeve.cpp:154,235,258` | `kSeamAllowanceMM`, kemer/manşet için `kSeamAllowanceBandMM` |
| Cuff parçası | `sleeve.cpp:239-259` | `cuffLength = bicepsEstimate·0.62+20`, `cuffHeight = 60`, "cut 2, interface" |

**ÇIKTI PARÇALARI (`sleeve.cpp:147-155, 225-237, 242-259`):**
`"Sleeve"` / `"Balloon Sleeve"` / `"Puff Sleeve"` / `"Gathered-Head Sleeve"` /
`"Cap Sleeve"` (hepsi `cut 2`) + balloon'da ayrıca `"Sleeve Cuff"`.

**YÜZEY HATTINA BAĞLANMASI İÇİN GEREKEN İKİ ŞEY (sicilin kendi diliyle):**
1. `blockedBy: shoulderSeam` — omuz dikişi bugün `flagged`
   (`garment-spec-v2.json:80`), yani kol takılacak omuz henüz sağlam değil.
2. `armholeNotch` `shipped` AMA **kusurlu**: sicilin kendi `defect` satırı
   (`garment-spec-v2.json:70`) diyor ki oyuk 2B delik değil, phi ∈ [0, 19.9°]
   ince bir mercek; EU38 **33.55cm**, Buğra Locket-38 **43.30cm** → **%22 kısa**.
   Kolun kapak hedef uzunluğu `armholeLength`'ten türediği için (`sleeve.cpp:55`),
   operatör bugün eklenirse **%22 kısa bir oyuğa göre trulanmış bir kapak** çizer.

---

## KOPMA NOKTASI

```
engine/src/surfacepattern.hpp:284-620 (SheathOptions, 36 alan, kol alanı YOK)
  — burada sekiz değer bire iniyor, çünkü sevk edilen yüzey motoru kolu hiç
    parametre olarak almıyor: contract/garment-spec-v2.json:96'da `sleeve`
    operatörü status="absent", binds=null ve blockedBy="shoulderSeam"; motorun
    kol adına yaptığı tek şey oyuğu KESMEK (armholeNotch), o oyuk da EU38'de
    33.55cm ile Buğra'nın 43.30cm'sinin %22 gerisinde.
```

İkinci derece kopma (bilgi, hüküm değil):

```
engine/tools/render-garment-flat.mjs:121 (const c = SLEEVE_SYNONYM[s] || s)
  — burada sekiz değer DÖRDE iniyor. Bu bir kusur DEĞİL: engine/vocab.json:10
    dört yazımı eşanlam ilan ediyor ve kapı özdeşliği ŞART koşuyor.

engine/tools/render-garment-flat.mjs:381 (hasSleeve HAM değeri okuyor)
  — alan DIŞI bir yazım (kimono/dolman/ZZZNONSENSE) reddedilmiyor, düz set-in
    kolla geometri-özdeş çiziliyor (geo sha e7a61347ae915109). Damga adı taşıyor
    ama RULES invariant 1'in istediği Err/red YOK. Kapı bu yola bakmıyor,
    çünkü V4-E'den beri alan kaynaklardan türetiliyor ve bu yazımlar alana girmiyor.
```

---

## YAN BULGULAR (kart dışı, dokunulmadı)

1. **`cap` tek kaynaklı.** `contract/spec-grammar.json:47` dışında hiçbir
   sözleşme `cap`'i kol alanına koymuyor — `engine/vocab.json` `values`'unda
   YOK, `garment-spec.schema.json` `draftSpec.sleeveStyle` enum'unda YOK.
   Buna rağmen 29 spec kaydında kullanılıyor. C++ tarafında da `SleeveStyle`
   değil (`vocab.gen.hpp:24`, 3 değer), `SleeveCap::Cap` (`vocab.gen.hpp:42`).
   Yani `cap` iki eksen arasında asılı duruyor.
2. **Web UI kol sözlüğünün 8'inden 3'ünü sunuyor.** `web/js/create.js:42`
   seçenekler: `none · straight · balloon`. `cap` UI'da ayrı bir eksende
   (`create.js:47`, `sleeveCap` = plain/gathered/puffed/cap) ve **yalnız
   `sleeveStyle === 'straight'` iken görünüyor** — yani balloon + cap
   birleşimi UI'dan seçilemiyor.
3. **`sleeve.cpp` yaşıyor ama sicil onu "eski motor" diye dışarıda tutuyor.**
   `engine/CMakeLists.txt:46` derliyor, `:319-325` iki testi koşuyor, ikisi de
   bugün Passed. Sicilin `proof`'u bunu biliyor ve bilerek saymıyor. İki
   motorun bir arada durması bugün bir çelişki DEĞİL ama hangisinin ürünü
   çıkardığı repoda tek cümleyle yazılı değil.
4. **Sicilin `proof` satırı bayatlamış (küçük).** "6 satırın 6'sı" diyor;
   bugün ölçüm **10 satır** (9 `sleeveless` + 1 `sleeved`), hepsi hâlâ yorum.
   Hüküm değişmiyor, sayı değişmiş.
5. **GİZLİLİK.** `git ls-files dataset/` → **6 dosya takipli**,
   `git ls-files patterns_real/` → **41 dosya takipli**. `.gitignore:27,34,47`
   `dataset/*`'ı yasaklıyor, `patterns_real` `.gitignore`'da **hiç yok**.
   CLAUDE.md ikisini de "ASLA push edilmez" diyor. Ağaç ile yasa uyuşmuyor
   (CLAUDE.md'de zaten bilinen çelişki, burada yeniden ölçüldü). DOKUNULMADI.
6. **`raglan` arka kapısı.** `render-garment-flat.mjs:648`
   `spec[SHOULDER_FIELD] === 'raglan' || String(style) === 'raglan'` — ikinci
   şart kol ekseninden raglan topolojisini tetikliyor, oysa `raglan` geçerli bir
   kol değeri değil (canon `null`, branch `unknown`). Ölçüldü: geo `b5838e64571f64e8`,
   diğer bilinmeyen yazımlardan farklı.

## GÖREMEDİĞİM / YAPMADIĞIM

- Tam `ctest` koşulmadı (şef yasakladı; başka süreç koşuyordu). Sadece
  `sleeve_check` + `cap_sleeve_check` tek tek koşuldu.
- Kalıp tarafında (C++) sekiz değer için **artefakt üretilmedi** — sevk edilen
  yüzey hattı kol parametresi almadığı için üretilecek ayrım yok; eski 2B
  motorun spec'ten çalışan bir CLI'ı aranmadı, süre içinde denenmedi.
- PNG render yapılmadı (RULES invariant 3 görsel iddia için ister; bu kartta
  görsel iddia yok, ölçü geometri imzası + sha256).
- Damla'nın gözü (TEK KAPI) hiçbir çıktıdan geçmedi.
