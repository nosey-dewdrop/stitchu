# F0-A — MOTOR ÖLÇÜMÜ (v3, 2026-08-22 gecesi)

Kart: `GECE/KART/F0-A-motor.md`. Bu kart ÖLÇER. Hiçbir test/kaynak/contract
düzeltilmedi, commit atılmadı. Ağaç HEAD = `962407d` (ölçüm anında takipli
dosyalarda 0 değişiklik; `git status --porcelain` sadece `GECE/log/*` ve
`GECE/KART/` untracked gösterdi).

---

## 1. CTEST — TEMİZ AĞAÇ, RELEASE

Komutlar (üçü de bu sırayla koşuldu):
```
cmake -S engine -B engine/build -DCMAKE_BUILD_TYPE=Release      # exit 0
cmake --build engine/build -j8                                   # exit 0
ctest --test-dir engine/build --output-on-failure                # exit != 0 (7 red)
```
Ham çıktılar:
- `GECE/log/F0v3.configure.txt`
- `GECE/log/F0v3.build.txt`
- `GECE/log/F0v3.ctest.txt`   ← ctest'in tam çıktısı (1058 satır)

Cache bayat DEĞİL, ölçüldü: `engine/build/CMakeCache.txt:25`
`CMAKE_BUILD_TYPE:STRING=Release`. Configure yeniden koşuldu, sonra tam build.

| sayı | değer | kaynak |
|---|---|---|
| toplam test | **96** | `GECE/log/F0v3.ctest.txt` ("out of 96") |
| geçen | **89** (%93) | aynı satır |
| kırmızı | **7** | aynı satır |
| toplam süre | **238.33 sn** | `GECE/log/F0v3.ctest.txt` son satır |

Kırmızı ADLARI — dokümandan DEĞİL,
`engine/build/Testing/Temporary/LastTestsFailed.log`'dan alındı, sıralanıp
`GECE/log/F0v3.red.now` dosyasına yazıldı:

```
bugra_bridge_check
contract_check
figure_check
h10_gate_check
preview_truth_check
sizechart_source_check
style_check
```

### Taban ile karşılaştırma
```
diff <(sort GECE/log/F0.red.before) GECE/log/F0v3.red.now
```
→ **çıktı boş. FARK YOK.** 21 Ağu tabanının 7 adı ile bu gecenin 7 adı
BİREBİR aynı küme. Yeni kırmızı doğmadı, eski kırmızı kapanmadı.
RULES §9 anlamında miras kırmızı KÜMESİ büyümedi.

Fark olmadığı için "sebebini ölç" maddesi tetiklenmedi. Yine de her
kırmızının bugünkü ilk FAIL satırı ölçüldü
(`ctest --test-dir engine/build -R "^<ad>$" --output-on-failure`):

| test | bugünkü ilk FAIL satırı |
|---|---|
| style_check | `pinlenmiş stil 0 — engine/STYLE-PIN yok/boş` |
| sizechart_source_check | `column 'shoulderCM' is UNSOURCED (status NONE)` (+ backLengthCM, armLengthCM) |
| bugra_bridge_check | süit exit≠0; başlık satırı FAIL etiketi basmıyor — **tek satırlık sebep ÖLÇÜLMEDİ** |
| contract_check | `DECLARED DECISION (not a breach) — 'patterns_real/' has 41 TRACKED file(s)`; testin kendi metni "yeşile dönmesi ölçümün değil Damla'nın kararının işi" diyor |
| preview_truth_check | `[princess_dress] landmark 'bustHalf' ÖLÇÜLMEDİ: draft tarafında sayı yok` |
| figure_check | 7 stil `tabansız — figure-bands mandal.taban_v3'te pin yok, hükümsüz` |
| h10_gate_check | `EU34 K1 armhole FAIL 312.86mm kapı [384.50, 424.50]`, `K3 shoulder-seam 0 dikiş, kapı >= 2` |

Not: 7 kırmızının **hiçbiri** aşağıdaki damar kapılarından değil.

---

## 2. OPERATÖR SİCİLİ — `contract/garment-spec-v2.json`

Komut:
```
python3 -c "import json;d=json.load(open('contract/garment-spec-v2.json'));\
from collections import Counter;print(Counter(v['status'] for v in d['operators'].values()))"
```

| statü | sayı |
|---|---|
| shipped | **9** |
| flagged | **1** |
| absent | **5** |
| TOPLAM | **15** |

`shipped` (9): `bodiceSurface`, `skirtSurface`, `hemSweepCone`, `princessCut`,
`waistAnchoredDart`, `topAnchoredDart`, `necklineDraft`, `armholeNotch`,
`backOpening`.

`flagged` (1): `shoulderSeam` — `SheathOptions::shoulderSeam` default **false**.

**`absent` ADLARI (5)** — §0.3 gereği adıyla:
1. `gatheredOverlayLayer` — büzgülü overlay katmanı (ikinci, dış katman)
2. `sleeve` — kol (ayrı yüzey yaması)
3. `collarFamily` — yaka ailesi (peterPan / stand / shirt / notched)
4. `skirtFamily` — etek ailesi (gore / fullCircle / gathered / pleated / straight)
5. `zipperPiece` — fermuar (kendi payıyla çizilmiş)

Beşinin de `binds` alanı `None` — yani motorda bağlanacak sembol yok.

### 2b. Sicilde İSİM olarak bile GEÇMEYEN damar detayları

Payda = ANAYASA.md'nin detay dili (satır 42-46 ve 56; tam dosya okunmadı,
`grep -n -i -E "fiyonk|büzgü|düğme|fırfır|volan|peplum|lace-?up|dantel|kol|yaka|etek" ANAYASA.md`).

İsim taraması:
```
for t in bow fiyonk shirr smock button placket ruffle flounce volan peplum \
         lace corset eyelet scallop dantel halter sweetheart vNeck boat \
         square balloon cuff boxPleat; do
  printf "%-12s %s\n" "$t" "$(grep -c -i -- "$t" contract/garment-spec-v2.json)"; done
```

**Sicilde İSİM olarak SIFIR (0 hit) — 20 terim:**

| damar detayı | sicilde aranan ad(lar) | hit |
|---|---|---|
| fiyonk | `bow`, `fiyonk` | 0 / 0 |
| shirring / smocking | `shirr`, `smock` | 0 / 0 |
| mini-düğme sırası | `placket` | 0 |
| fırfır / volan | `flounce`, `volan` | 0 / 0 |
| peplum | `peplum` | 0 |
| lace-up | `corset`, `eyelet` | 0 / 0 |
| dantel / fisto | `dantel`, `scallop` | 0 / 0 |
| halter yaka | `halter` | 0 |
| sweetheart yaka | `sweetheart` | 0 |
| derin V yaka | `vNeck` | 0 |
| kayık yaka | `boat` | 0 |
| kare yaka | `square` | 0 |
| balon kol | `balloon` | 0 |
| büzgülü manşet | `cuff` | 0 |
| kutu-pili | `boxPleat` | 0 |

Yanlış-pozitif olarak ayıklananlar (grep hit verdi ama AD değil, düzyazı içinde
substring): `tie`=2 (`quantities`/`properties` içinde), `lace`=1 (`replaces`
kelimesinde, satır 2), `ruffle`=1 (satır 93'te Buğra ölçüm düzyazısı).

**İSİM olarak GEÇEN ama operatörü `absent` olanlar** (yani red cümlesi
kurulabilir): `gather` (7 hit — `suppression.gather` + `gatheredOverlayLayer`),
`button` (1 — `closure.buttonFront`, operatörü `zipperPiece` absent),
`peterPan`/`stand`/`shirt` (`collar` ekseni, operatörü `collarFamily` absent),
`gore`/`fullCircle`/`gathered`/`pleated` (`skirtShape`, operatörü `skirtFamily`
absent), `setIn`/`puff`/`cap` (`sleeve` ekseni, operatörü `sleeve` absent).

---

## 3. DAMAR YÜZDESİ

### 3.0 ÖNCE: hangi hat "SEVK EDİLEN"? — ölçülmüş çelişki

`contract/garment-spec-v2.json` `_statuses.shipped` kendi tanımını şöyle yazıyor:
> "runs on the DEFAULT path the buyer receives today (surface-pattern with a
> default-constructed SheathOptions). Binding is a real symbol in
> engine/src/surfacepattern.hpp."

Ölçüm:
```
grep -c surfacepattern engine/wasm/bindings.cpp   → 0
grep -rc surfacepattern web/js                    → 0 dosyada hit
grep -n "garment.hpp" engine/wasm/bindings.cpp    → 10:#include "../src/garment.hpp"
```
**WASM sınırı (`engine/wasm/bindings.cpp`) surfacepattern'e HİÇ dokunmuyor.**
Alıcının web'de aldığı çizim `garment.hpp` → `GarmentDrafter::draft()`
hattından çıkıyor. Yani sicilin "shipped" tanımı ile fiilen sevk edilen hat
AYNI HAT DEĞİL. Bu yüzden damar yüzdesi **iki ayrı hat için ayrı ayrı**
hesaplandı; sicilin kendi tanımına göre olan da üçüncü sütun olarak verildi.

### 3.1 HESAP YÖNTEMİ (F11 aynen tekrarlayabilsin diye)

**PAYDA (21 kalem).** ANAYASA.md'nin damar detay dili, satır numarasıyla
çıpalanmış. `grep -n` ile alındı, dosya bütün olarak okunmadı.

- ANAYASA.md:42-44 — detay primitifleri (7):
  B1 fiyonk · B2 büzgü/shirring/smocking · B3 minik sık düğme sırası ·
  B4 fırfır/volan · B5 peplum · B6 prenses/panel dikişi · B7 lace-up ·
  B8 dantel/fisto  → (8 kalem; "fırfır/volan/peplum" tek satırdı, fırfır ile
  peplum AYRI motor operatörleri gerektirdiği için ikiye bölündü — bölme
  gerekçesi budur, keyfi değil)
- ANAYASA.md:45 — yaka ailesi (6): B9 derin V · B10 kayık · B11 kare ·
  B12 sweetheart · B13 bebe/statement devrik yaka · B14 halter
- ANAYASA.md:45-46 — kol ailesi (4): B15 kolsuz/askılı · B16 kısa puf/balon ·
  B17 kap kol · B18 uzun puf + büzgülü manşet
- ANAYASA.md:56 + korpus satırları 71/76/94 — etek ailesi (3):
  B19 kloş/A-line · B20 kutu-pili/pileli · B21 gore/godevari

PAYDA = 8 + 6 + 4 + 3 = **21**.

**"ÜRETİLEBİLİR" KRİTERİ — garment hattı.** Üç şart, hepsi sağlanacak:
- **G1** `engine/vocab.json` `fields` içinde detayı ADIYLA ifade eden bir
  eksen + değer var.
- **G2** o alan `engine/wasm/bindings.cpp` `buildSpec()` içinde okunuyor
  (WASM sınırından geçiyor, ölü kod değil).
- **G3** ctest'te o değeri çizip geometrisini iddia eden ADLI bir kapı var
  ve o kapı **bu gece YEŞİL** (`GECE/log/F0v3.ctest.txt`).

Puan: **1.0** = G1+G2+G3 · **0.5** = G1+G2 var, G3 (adlı kapı) yok ·
**0.0** = G1 yok.

PAY = puanların toplamı. YÜZDE = PAY / 21.

⚠ Bu kriter **İFADE EDİLEBİLİRLİĞİ** ölçer, GÜZELLİĞİ değil. "Çizim ANAYASA
damarına benziyor mu" sorusu TEK KAPI'dır (Damla'nın gözü) ve bu kartta
KOŞULMADI — bu yüzdeye o yargı DAHİL DEĞİL.

### 3.2 GARMENT HATTI (bindings.cpp → garment.hpp) — SONUÇ %95.2

Eksen listesi: `python3 -c "import json;[print(k,v.get('values')) for k,v in json.load(open('engine/vocab.json'))['fields'].items()]"`
→ **37 eksen**. `buildSpec()` (bindings.cpp:109-163) 37 eksenin hepsini +
`skirtLengthMM`'i okuyor → G2 tüm kalemler için sağlanıyor.

| # | damar detayı | eksen/değer (G1) | ADLI kapı (G3) | puan |
|---|---|---|---|---|
| B1 | fiyonk | `tieClosure` {backWaistBow, frontNeckBow, frontWaistBow, tieBack} | tie_check ✓ · fronttie_check ✓ | 1.0 |
| B2 | büzgü/shirring/smocking | `gatherType` {drawstring, shirred, smocked} × `gatherZone` {neckline,bust,waist,sleeve} | gather_check ✓ | 1.0 |
| B3 | mini-düğme sırası | `buttonRow` {functional, decorative} + `placketStyle` {standard, asymmetric} | buttonrow_check ✓ · placket_check ✓ · placket_asym_check ✓ | 1.0 |
| B4 | fırfır/volan | `hemFlounce`{gathered}, `backDetail`{ruffle,flounce}, `ruffleHem`/`ruffleTiers` | hemflounce_check ✓ · backdetail_check ✓ · ruffle_check ✓ · tiered_ruffle_check ✓ | 1.0 |
| B5 | peplum | `peplum` {full, half, pointed} | peplum_check ✓ | 1.0 |
| B6 | prenses/panel dikişi | `shaping` {princess} | compose_check ✓ (`compose_check.cpp:121 "dress.princess"`) · cutline_check ✓ (`:121`) | 1.0 |
| B7 | lace-up | `laceUpBack` {corset} | laceupback_check ✓ | 1.0 |
| B8 | dantel/fisto | **YOK** — `engine/vocab.json`'da dantel/lace/eyelet-kumaş ekseni yok | — | **0.0** |
| B9 | derin V | `neckline` {vNeck} | neckline_ext_check ✓ | 1.0 |
| B10 | kayık | `neckline` {boat} | neckline_ext_check ✓ | 1.0 |
| B11 | kare | `neckline` {square} | neckline_ext_check ✓ | 1.0 |
| B12 | sweetheart | `neckline` {sweetheart} | sweetheart_check ✓ | 1.0 |
| B13 | bebe/statement devrik yaka | `collarType` {peterPan, flat, crescent, stand, mock, shirt} + `collarEdge` | collar_check ✓ | 1.0 |
| B14 | halter | `neckline` {halter} | halter_check ✓ | 1.0 |
| B15 | kolsuz/askılı | `sleeveStyle`{none} + `ruffledStraps`{ruffled,wide,spaghetti} | strap_check ✓ | 1.0 |
| B16 | kısa puf/balon | `sleeveStyle`{balloon} + `sleeveCap`{puffed,gathered} + `sleeveLength`{short} | sleeve_check ✓ | 1.0 |
| B17 | kap kol | `sleeveCap` {cap} | cap_sleeve_check ✓ | 1.0 |
| B18 | uzun puf + büzgülü manşet | `sleeveLength`{long} + `sleeveCap`{puffed} + `cuffStyle`{button,ribbed} | cuff_check ✓ · sleeve_check ✓ | 1.0 |
| B19 | kloş/A-line | `skirtStyle` {aLine, halfCircle} | skirtlen_check ✓ · hem_check ✓ | 1.0 |
| B20 | kutu-pili | `skirtStyle`{pleated} + `boxPleat`{centerInverted} + `hemShape`{boxPleatHem} | boxpleat_check ✓ | 1.0 |
| B21 | gore/godevari | `skirtStyle` {gore} | gore_check ✓ | 1.0 |

Tablodaki her ✓ `GECE/log/F0v3.ctest.txt` içinde "Passed" satırı olarak var
(24 kapının 24'ü Passed; komut:
`grep -E "tie_check|gather_check|...|yoke_check" GECE/log/F0v3.ctest.txt`).

**PAY = 20.0 · PAYDA = 21 · DAMAR YÜZDESİ (garment) = 20/21 = %95.2**

**ADIYLA EKSİK (§0.3):** `dantel/fisto` — motor sicilinde ne bir kumaş/trim
ekseni ne bir dantel paneli var. En yakını `collarEdge::scallop`
(`engine/vocab.json:19`) ve o SADECE yaka kenarı; `eyelet` kelimesinin geçtiği
her satır (`engine/src/laceupback.*`, `gather.cpp`) bağcık DELİĞİ, kumaş değil.

**Ek ölçülmüş boşluk (yüzdeye yansımadı, adıyla kayda geçiyor):** `skirtStyle`
ekseninde `fullCircle` YOK — sadece `halfCircle` var
(`engine/vocab.json` skirtStyle = aLine, straight, gathered, halfCircle,
pleated, gore). Oysa flat tarafında "full-circle" etiketli 6 stil var
(`engine/flat-engine/styles.json`). B19'u kloş/A-line olarak 1.0 saydım çünkü
ANAYASA:56 "kloş/A-line" diyor; ama **tam daire etek garment hattında ADIYLA
üretilemiyor.**

### 3.3 FLAT HATTI — SONUÇ %81.0

Aynı 21 kalemlik payda. Kriter G1/G2/G3'ün flat karşılığı:
- **F1** `engine/flat-engine/styles.json` şemasında detayı adıyla taşıyan bir
  anahtar var (`parts.*` bayrağı ya da `own.*` sayısı) **ve** 31 stilin en az
  biri onu kuruyor;
- **F2** `engine/flat-engine/_engine-full.mjs` o anahtarı okuyup çizim
  üretiyor (grep ile hit).
Puan 1.0 = F1+F2 · 0.0 = F1 yok. (Flat tarafında kalem başına ADLI ctest
kapısı yok — `flat_render_lint` + `figure_check` toplu kapılar — bu yüzden
G3 muadili şart konmadı; bu, garment ile flat yüzdesinin doğrudan
kıyaslanamayacağı anlamına gelir ve kasten böyle bırakıldı.)

Komut:
```
python3 -c "import json;d=json.load(open('engine/flat-engine/styles.json'));..."   # 31 stilin tüm anahtarları
for t in button placket laceUp lacing corset boxPleat pleat bow halter \
         sweetheart square boat vNeck fullCircle circle; do \
  printf '%-12s styles=%s engine=%s\n' "$t" \
  "$(grep -ci "$t" engine/flat-engine/styles.json)" \
  "$(grep -ci "$t" engine/flat-engine/_engine-full.mjs)"; done
```

| # | damar detayı | flat anahtarı | puan |
|---|---|---|---|
| B1 | fiyonk | `parts.tie` (31), `own.tieLength` (4), `waistTie`(2), `tieBack`(1), `wrapTie`(1); `_engine-full.mjs:475,498` `_wtie==='bow'` iki ilmek+düğüm çiziyor | 1.0 |
| B2 | büzgü/shirring | `parts.shirr`(31), `own.shirrRows`(4), `physicsShirr`(7), `gatherRatio`(11), `cfGather`(2), `gatherWaist`(2) | 1.0 |
| B3 | mini-düğme sırası | **YOK** — `grep -ci button` = 0 / 0 · `placket` = 0 / 0 | **0.0** |
| B4 | fırfır/volan | `parts.ruffle`(8), `peplumRuffle`(1) | 1.0 |
| B5 | peplum | `peplum`(7 stilde `"full"`) | 1.0 |
| B6 | prenses/panel dikişi | `princessSeam`(11) | 1.0 |
| B7 | lace-up | **YOK** — `laceUp`=0, `lacing`=0, `corset`=1 (yalnız `label` metninde) | **0.0** |
| B8 | dantel/fisto | `laceNeck`/`laceSleeve`/`laceHem`(2), `own.laceWidth`, `own.laceScallops` | 1.0 |
| B9 | derin V | `neckline:"v"` (5 stil) · `_engine-full.mjs:195` | 1.0 |
| B10 | kayık | `neckline:"boat"` (4 stil) | 1.0 |
| B11 | kare | `neckline:"square"` (3) · `_engine-full.mjs:168` | 1.0 |
| B12 | sweetheart | `neckline:"sweetheart"` (2) · `_engine-full.mjs:176` | 1.0 |
| B13 | bebe/statement yaka | `parts.collar` + `own.collarWidth`/`collarGap` (peterpan_puff) | 1.0 |
| B14 | halter | **YOK** — `grep -ci halter` = 0 / 0 | **0.0** |
| B15 | kolsuz/askılı | `parts.straps`, `own.strapWidth`/`strapLen`(8), `ruffledStraps`(2), `spaghettiStrap`(1) | 1.0 |
| B16 | kısa puf/balon | `parts.sleeve` + `own.capPuff`(10) | 1.0 |
| B17 | kap kol | `_engine-full.mjs:331` `_slen={cap:9,short:17,elbow:28,long:42}` | 1.0 |
| B18 | uzun puf + büzgülü manşet | `sleeveLength:'long'` + `own.cuffGather`(10) | 1.0 |
| B19 | kloş/A-line | `own.skirtFull`(19); 6 stil etiketi "full-circle" | 1.0 |
| B20 | kutu-pili | **YOK** — `grep -ci pleat` = 0 / 0 | **0.0** |
| B21 | gore/godevari | `goreCount`/`gorePanels` (gore_skirt_dress) | 1.0 |

**PAY = 17.0 · PAYDA = 21 · DAMAR YÜZDESİ (flat) = 17/21 = %81.0**

Flat'ta ADIYLA EKSİK (4): **mini-düğme sırası** (`button`/`placket`) ·
**lace-up** (`lacing`/`eyelet`) · **halter** · **kutu-pili** (`pleat`).

### 3.4 SİCİLİN KENDİ TANIMINA GÖRE (surfacepattern hattı) — %11.9

Sicil "shipped"i `engine/src/surfacepattern.hpp`'ye bağladığı için aynı payda
o hatta da uygulandı. Kriter: kalemin gerektirdiği operatör
`contract/garment-spec-v2.json` içinde `shipped` mi?

| puan | kalem | gerekçe |
|---|---|---|
| 1.0 | B6 prenses | `princessCut` = shipped |
| 1.0 | B19 kloş/A-line | `hemSweepCone` = shipped (`topology.skirtShape.aLine`) |
| 0.5 | B15 kolsuz | `sleeve.none` → `armholeNotch` shipped (kolsuz ÜRETİLİR) ama askı/strap operatörü sicilde ADIYLA yok |
| 0.0 | B1,B2,B3,B4,B5,B7,B8,B9,B10,B11,B12,B13,B14,B16,B17,B18,B20,B21 | gerektirdikleri operatör absent ya da isim olarak hiç yok |

B9-B12 (V/kayık/kare/sweetheart) için ek ölçüm: `necklineDraft` shipped ama
şekil AİLESİ taşımıyor — `engine/src/surfacepattern.hpp:284-286` yalnız
`neckWidthCoefCM` / `frontNeckDropCoefCM` / `backNeckDropMM` kadranları var;
`grep -iE "sweetheart|vNeck|boat|square" engine/src/surfacepattern.hpp` → 0 hit.
Yani yaka bir GENİŞLİK+DERİNLİK açıklığı, bir şekil değil.

**PAY = 2.5 · PAYDA = 21 · DAMAR YÜZDESİ (surfacepattern) = %11.9**

### 3.5 ÜÇ SAYI YAN YANA

| hat | pay/payda | yüzde | kriter |
|---|---|---|---|
| garment (`bindings.cpp` → `garment.hpp`) — FİİLEN SEVK EDİLEN | 20.0/21 | **%95.2** | G1+G2+G3 |
| flat (`engine/flat-engine/`) | 17.0/21 | **%81.0** | F1+F2 |
| surfacepattern (sicilin "shipped" tanımı) | 2.5/21 | **%11.9** | operatör shipped mi |

Bu üç sayı aynı kriterle ölçülmedi (kriterler yukarıda ayrı ayrı yazılı),
bu yüzden birbirlerinden ÇIKARILAMAZ; her biri kendi hattının kendi
kriteriyle tekrar ölçülebilir olsun diye ayrı verildi.

---

## ÖLÇÜLMEDİ

- `bugra_bridge_check`'in tek satırlık FAIL sebebi: süit exit≠0 dönüyor ama
  çıktısında FAIL/hata etiketli satır basmıyor; sebep çıkarılmadı.
- Damar kalemlerinin GÖRSEL doğruluğu (çizim ANAYASA damarına benziyor mu):
  TEK KAPI koşulmadı, PNG üretilmedi. %95.2 bir ifade-edilebilirlik sayısıdır,
  bir güzellik sayısı değil.
- Her damar kaleminin ÇİFT/ÜÇLÜ kombinasyonda (ör. shirred büst + peplum +
  puf kol aynı anda) ayakta kalıp kalmadığı: `sewable_census` yeşil ama
  bu kartta kombinasyon sayımı yapılmadı.
- Flat hattında kalem başına ADLI ctest kapısı olup olmadığı tek tek
  denetlenmedi (toplu kapılar `flat_render_lint`, `figure_check` var;
  `figure_check` bugün KIRMIZI, 7 stil "tabansız").

## KALAN İŞ
Yok — kartın 3 maddesi de ölçüldü. Hiçbir dosya düzeltilmedi, commit atılmadı.
