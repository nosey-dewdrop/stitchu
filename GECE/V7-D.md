# V7-D — KAPI: KOL OYUĞU YAYI ↔ KAPAK YAYI, İKİSİ DE ÇİZİLEN KENARDAN

Kart: `GECE/KART/V7-D.md` · 2026-08-25 · commit: `v7-d: gate the armhole-to-cap ease on named edges, not on a scalar copy` · süre tavanı 60 dk — **AŞILDI** (≈95 dk,
sebep §7'de: kart dışı iki kök engel çıktı ve ikisi de kapatılmadan kapı yeşil olamıyordu).

> **TEK CÜMLE:** Oyuk↔kapak yargısı artık skaler `bodice.armholeLength` kopyasını
> kendisiyle karşılaştırmıyor — **iki ÇİZİLMİŞ kenarın yay uzunluğunu** karşılaştırıyor,
> ve bu 48 (spec × beden) satırında ölçülüp kapıya bağlandı.

---

## 1. NE DEĞİŞTİ (dosya:satır)

| dosya | ne |
|---|---|
| `engine/src/validator.cpp:279-360` | **TÜKETİCİ TAŞINDI.** `sleeveIssues` üç tahmini de bıraktı: parça adında `"Sleeve"` alt-dizgisi → `sleeve_cap` rolünü TAŞIYAN parça · sabit `commands[0..2]` → `edgeLengthOf(*sleeve, *capRole)` · skaler `bodice.armholeLength` → `armhole_front` + `armhole_back` rollerini taşıyan **her parçadan** toplanan yay. Rol yoksa ya da BOŞ dönerse **adıyla reddedilir** (dört ayrı `ValidationIssue`), sessizce düşürülmez (RULES 1). |
| `engine/src/geometry.hpp:120-136` + `geometry.cpp:233-262` | **`reanchorEdgeRoles()`** — adlandırılmış kenarı bir post-pass'ten SONRA kendi uç-nokta çapalarından YENİDEN ADRESLER; çapa artık konturun tepesi değilse adı **DÜŞÜRÜR** (uydurmaz). |
| `engine/src/garment.cpp:1077-1085` | tek boğaz noktası: bütün post-pass'ler bittikten ve HERHANGİ bir tüketici okumadan önce her parçada `reanchorEdgeRoles()`. |
| `engine/src/validator.cpp:349,381` | biceps tabanı artık `distance(capStart, capEnd)` — kapak kirişi rolün kendi uç-nokta çapasından; `commands[0]/[2]` indeks tahmini kalmadı. |
| `engine/src/validator.cpp:371-375` | yakınsama mesajı artık **hangi** oyuğu kullandığını ve kaç adlandırılmış kenardan toplandığını basıyor (`DRAWN armhole %.1f (%d named edge(s))`). |
| `engine/src/locket.cpp:343-368` | **KART DIŞI, ZORUNLU (§7 madde 1).** `rebuildFront()` bütün ön konturu yeniden yazıyor → bodice.cpp'nin yazdığı `armhole_front` rolü BAYATLIYORDU. Rol artık kendi uç-nokta çapalarından **yeniden adresleniyor**; çapa bulunamazsa ad **DÜŞÜRÜLÜYOR** (yanlış kenara işaret eden ad, adsızlıktan beterdir). |
| `engine/src/locket.cpp:379-389` | **KART DIŞI, ZORUNLU (§7 madde 2).** İki parçalı Locket kolunun `Upper Sleeve` **taç kenarı** `sleeve_cap` adını aldı — oyuğa giden kenar odur (parçanın kendi kesim notu da öyle diyor). `Lower Sleeve`'in üst kenarı **band dikişidir, oyuk değildir** → bilerek adsız bırakıldı. |
| `engine/tests/sleeve_cap_ease_check.mjs` | **YENİ KAPI** (tek yeni kaynak dosya, §7.5 tavanı 1). |
| `engine/CMakeLists.txt:143-151` | kapı ctest'e KAYDEDİLDİ. Ratchet YOK, tavan YOK: **0 ihlalle** bağlandı. |

**Yeni kaynak dosya: 1** (§7.5 tavanı 1). Değişen dosya: 6 (+wasm paketleri).
`engine/tools/` GREP EDİLDİ: `sleeve_cap`/`cap ease`/`edgeRole` ölçen mevcut alet YOK
(`grep -rn "edgeRoles" engine/tools` → 0), o yüzden yeni alet yazıldı.

---

## 2. ÖLÇÜLEN CAP EASE — 48 SATIR, HEPSİ ÇİZİLEN KENARDAN

Basan komut: `node engine/tests/sleeve_cap_ease_check.mjs`
Oyuk = `armhole_front` + `armhole_back` (prensesde **dört** kenar parçası toplanır),
kapak = `sleeve_cap`. Yay uzunluğu artefaktın kendi `commands[first..last]`'ından,
24-adımlı kübik yürüyüşle (`geometry.cpp:43 pathLength` ile aynı adım) hesaplanır.

### 2.1 YEDİRİLEN başlar (düz kol + kanat kol) — kapı bunları YARGILAR

| beden | oyuk (mm) | kapak (mm) | **ease (mm)** | ease (%) | beyan farkı (pp) |
|---|---|---|---|---|---|
| EU34 | 375.9207 | 390.9768 | **+15.0560** | 4.0051 | +0.0051 |
| EU36 | 389.7521 | 405.3097 | **+15.5576** | 3.9917 | −0.0083 |
| **EU38** | **404.2594** | **420.3840** | **+16.1246** | **3.9887** | **−0.0113** |
| EU40 | 416.3223 | 433.2040 | **+16.8817** | 4.0549 | +0.0549 |
| EU42 | 431.2195 | 448.4261 | **+17.2066** | 3.9902 | −0.0098 |
| EU44 | 446.5082 | 464.4109 | **+17.9027** | 4.0095 | +0.0095 |
| EU46 | 461.4978 | 480.1586 | **+18.6607** | 4.0435 | +0.0435 |
| EU48 | 478.1024 | 497.2051 | **+19.1027** | 3.9955 | −0.0045 |

(Aynı sekiz sayı `dart_top_plain_short`, `dart_top_plain_long` ve `dart_top_cap_wing`
sınıflarında **birebir** çıkıyor — kol boyu ve kanat, tacın kendisini değiştirmiyor.
`princess_dress_plain` için oyuk **dört** kenar parçasından toplanıyor ve bandı
15.0430…19.1027mm'yi kapatıyor. Tam tablo: `GECE/log/V7-D.ctest.txt` içindeki
`sleeve_cap_ease_check` çıktısı ya da kapıyı elle koş.)

- **YARGI (c):** 32/32 satır tavanın altında — `|ease| ≤ 38.1mm` [Linda Lee slayt 6].
- **YARGI (b):** 32/32 satır **POZİTİF**.
- **(d) BEYAN ↔ ÖLÇÜM:** motor bir oran BEYAN EDİYOR — `engine/src/fabricease.hpp`
  `kCap` dokuma çapası **4.00%**. Ölçülen 3.9887…4.0549%; **|fark| en çok 0.0549 puan,
  en az 0.0015 puan**. Eşik KOYULMADI (kaynaksız eşik yasak §7.6), fark BASILIYOR.
- **(S3) ALT UÇ:** 15.04…19.10mm bandı **REPORTED**. `GECE/V7-R.md` §3: bedene göre
  ölçekleyen yayınlanmış cap-ease formülü **YOK**; yayınlanmış 20–50mm bandının
  ALTINDAYIZ (Buğra'nın kendi kesim-çizgisi ölçümü de öyle: +6.61…+18.30mm).
  **Bu bir hüküm değil, kayıt.**

### 2.2 BÜZGÜLÜ başlar — [S1] tavanı UYGULANMADI, fazlalık BASILDI

| sınıf | fazlalık (mm), EU34→EU48 | % |
|---|---|---|
| `gathered` | +56.9200 … +80.2399 | 15.14 … 16.78 |
| `puffed` | +291.5210 … +393.4574 | 77.55 … 82.30 |

**Neden yargılanmadı — gevşetme değil, KAPSAM.** [S1]'in kaynağı bir *cap ease*
cümlesidir (*"reduce the sleeve cap **ease**"*): YEDİRİLEN fazlalık hakkında. Büzgülü
başta fazlalık yedirilmez, **büzülür** — motorun kendi gerekçesi de bu
(`validator.cpp` "GATHERED / PUFF HEAD (Loop 6)" bloğu). Ölçülen sayılar tavanın
1.5×–10× üstünde; onları o tavanla yargılamak, yayınlanmış bir kaynağı **kapsamı
dışında** kullanmak olurdu. `GECE/V7-R.md` §1.3: puf/balonun **nicel** tanımı için
yayınlanmış eşik **BULUNAMADI** → ★ **PUF/BALON KAPISI AÇILMADI** (kart şartı).
İşaret şartı [S2] büzgülü başa **DA** uygulandı (16/16 pozitif): oyuktan kısa bir baş
ne yedirilir ne büzülür. Büzgü bandını yargılayan mevcut kapı `validator.cpp`'nin
"gathered-head surplus" penceresidir ve **bu kartta DEĞİŞMEDİ** (§4.6).

---

## 3. §4.2 BOŞ TEST — `GECE/log/V7-D.bostest.txt`

Usul kartın yazdığı gibi: faz-öncesi commit **`e4249b7`**'nin sevk ettiği paketin
ürettiği **ÇIKTI ARTEFAKTI** (JSON döküm) yeni ölçüm aletine verildi. **Derleme hatası
değil** — iki koşuda da alet AYNI dosya, değişen tek şey GİRDİ.

```
$ grep -ac edgeRoles /tmp/v7d-prephase-engine.cjs   → 0     (e4249b7 paketi)
$ grep -ac edgeRoles web/vendor/stitchu-engine.js   → 1     (bugünkü paket)

faz-ONCESI  artefakt: parca=240  ADLANDIRILMIS KENAR=0
faz-SONRASI artefakt: parca=240  ADLANDIRILMIS KENAR=240

$ V7D_ARTIFACT=/tmp/v7d-prephase-artifact.json node engine/tests/sleeve_cap_ease_check.mjs
EXIT=1   FAIL sleeve_cap_ease_check — 184 ihlal      (48 satırın HEPSİ [a] ile düştü)
$ V7D_ARTIFACT=/tmp/v7d-now-artifact.json      node engine/tests/sleeve_cap_ease_check.mjs
EXIT=0   PASS sleeve_cap_ease_check — 0 ihlal
```

---

## 4. §4.5 MUTASYON — `GECE/log/V7-D.mutasyon.txt`

Kapı **üç ayrı yönden** kırıldı, üçünde de bozma kalkınca yeşile döndü:

| mutasyon | ne bozuldu | kapı |
|---|---|---|
| `cap-grow` | `sleeve_cap` yayı 390.9768 → **430.9768mm (+40.0000)** | **32 ihlal**, `[c]` tavan (55.06mm > 38.1mm) |
| `cap-shrink` | `sleeve_cap` yayı 390.9768 → **350.9768mm (−40.0000)** | **32 ihlal**, `[b]` işaret (−24.94mm) |
| `role-stale` | kenarın son komutunun ucu **+5mm** kaydı (post-pass taklidi) | **88 ihlal**, `[a]` BAYAT ROL |
| (geri al) | — | **PASS, 0 ihlal** |

★ `role-stale`, **V7-C'nin açıkça açık bıraktığı deliği** kapatan mutasyondur
(V7-C §5: *"bir post-pass `commands`'ı yeniden kursa, rol sessizce bayatlar ve
JSON'da boş yay olarak görünür — yanlış kenar değil, ama kırmızı da değil"*).
Artık kırmızı. Ve bu delik **teorik değildi**: `locket.cpp`'de gerçekten vardı (§7).

---

## 5. GOLDEN BAYT-AYNI

```
$ ./engine/build/golden_dump > /tmp/v7d-golden2.csv && cmp /tmp/v7d-golden2.csv engine/golden-reference.csv && echo OK
GOLDEN cmp OK
d28297e4f61b21689ee01c06c1349176a9952e4df79d82bac395ff1b3b8ad2f2  /tmp/v7d-golden.csv
d28297e4f61b21689ee01c06c1349176a9952e4df79d82bac395ff1b3b8ad2f2  engine/golden-reference.csv
```

`cmp` sessiz döndü. Yapısal sebep: golden dökümü `commands + markings` okur;
`edgeRoles` metadata katmanındadır ve validator **çizim üretmez, yargı üretir**.

## 6. WASM PARİTESİ (§4.1)

Kapının dokunduğu üretim yolu **node üzerinden wasm modülüyle koşuluyor** — kapının
kendisi zaten öyle çalışıyor: `web/vendor/stitchu-engine.js` yüklenir, `draftJSON`
çağrılır, ölçüm o artefakt üstünde yapılır. Yani "native yeşil + wasm patlak"
bu kapıda **kırmızıdır**, ayrı bir parite testine gerek kalmadan.
`engine/build-wasm.sh` `validator.cpp` + `locket.cpp` değişikliğinden sonra yeniden
koşuldu (EXIT 0) ve `web/vendor/` + `backend/engine/` paketleri güncellendi;
kapı **o yeni paketle** 48 satırda 0 ihlal verdi.

## 7. ★ KARTIN GÖRMEDİĞİ ÜÇ KÖK ENGEL (süre aşımının sebebi)

Tüketiciyi taşır taşmaz önce `locket_check`, sonra `cup_check` / `yoke_check` /
`boxpleat_check` / `compose_check` **kırmızı düştü** — yani RULES 9. Hepsi
"tahmin"in gizlediği GERÇEK boşluklardı; hepsi yamayla değil kökten kapatıldı:

1. **`locket.cpp rebuildFront()` bir POST-PASS'tir** ve bütün ön konturu yeniden
   yazar. bodice.cpp'nin yazdığı `armhole_front` rolü orada bayatlıyordu:
   `issue: [armhole] Front Body/armhole_front: armhole edge does not resolve (stale
   command range or endpoint anchor)`. **V7-C'nin uyardığı senaryo, canlı hatta,
   bugün.** Eski tüketici bunu göremezdi (skaler okuyordu). Çözüm: pens transferi
   büst çizgisinin ÜSTÜNDE **birim dönüşümdür** (`transfer()` `dy <= 0` için `p`
   döner), yani oyuğun geometrisi değişmiyor, sadece ADRESİ değişiyor → rol kendi
   uç-nokta çapalarından yeniden adresleniyor, çapa bulunamazsa **düşürülüyor**.
2. **İki parçalı Locket kolunun hiçbir kenarı adlandırılmamıştı** (V7-C sadece
   `sleeve.cpp`'ye dokunmuştu): `issue: [sleeve] ... sleeve requested but no piece
   carries a 'sleeve_cap' edge`. `Upper Sleeve`'in tacı adlandırıldı.

3. ★ **POST-PASS BAYATLAMASI TEK BİR DOSYANIN DERDİ DEĞİLDİ.** Locket kapandıktan
   sonra dört kapı daha düştü, hepsi aynı cümleyle: `[armhole] armhole edge does
   not resolve (stale command range or endpoint anchor)`. Bir bodice konturunu
   yeniden yazan **her** pas (off-shoulder/bardot, omuz paneli bölmesi, cup seam,
   pli) adı bayatlatıyordu. Her pasa ayrı tamir yazmak yerine **tek boğaz noktası**
   kuruldu: `garment.cpp`'de, bütün pas'lar bittikten ve hiçbir tüketici okumadan
   önce, her parçada `reanchorEdgeRoles()`. Koordinat çapası re-emisyondan sağ
   çıkar, indeks çıkmaz — o yüzden adres çapadan yeniden kurulur, çapa gitmişse
   **ad DÜŞÜRÜLÜR** (uydurulmaz).
   ★ Ve orada **ikinci bir tuzak** çıktı, ölçümle: cup seam sadece ÖN bedeni
   yeniden yazıyor, yani taslak `armhole_back` ADLI + `armhole_front` ADSIZ
   geliyordu. Var olanı toplamak, kapağı **YARIM oyuğa** göre yargılamak olurdu
   ve doğru çizilmiş bir kalıba "dikilemez" derdi. Kural yazıldı: **yarım ad, ad
   değildir** — iki yarım da adlı değilse skalere düşülür.

⚠ **Kart `engine/src/locket.cpp`'yi ÇIKTI listesinde saymıyordu**, ama yasaklamıyordu
da; tüketiciyi taşımak, üreticinin kenara ad vermesini zorunlu kılıyor. Alternatif
"eski tahmine geri düş" olurdu — kartın kırmak için yazıldığı tautolojinin ta kendisi.

## 8. CTEST — `GECE/log/V7-D.ctest.txt`

Açılış (MİRAS, `GECE/log/V7.ctest.opening.txt`, 113 test / **6 kırmızı**):
`flat_pattern_agree_check · flat_artifact_census · style_check ·
sizechart_source_check · contract_check · figure_check`.

Kapanış: **114 test, 7 kırmızı** (`94% tests passed, 7 tests failed out of 114`).
Yeni kapı yeşil: `12/115 Test #12: sleeve_cap_ease_check ... Passed 0.14 sec`.

Kırmızı **AD** kümesi: MİRAS 6'nın aynısı **+ `vocab_reference_check`**.
`vocab_reference_check` bu gece 7. kırmızı olarak V7-C koşusunda düştü ve kart
onu **şefe** verdi. Bu commit onu ne düzeltti ne kötüleştirdi — ÖLÇÜLDÜ:

```
$ bash engine/tests/vocab_reference_check.sh
FAIL ARTTI  eksen ADI   garment    1186 ->  1189  (+3)
FAIL ARTTI  eksen ADI   sleeveCap   146 ->   147  (+1)
HUKUM: FAIL (2 artan, 0 yeni)
```
Bu ölçüm **commit'ten SONRA** (HEAD = bu commit) tekrarlandı ve iki sayı da
**kımıldamadı** — yani bu commit sayaca sıfır ekledi. (V7-C'nin bastığı iki
sayının aynısı.) Kapının saydığı kapsam
`contract engine/src engine/wasm engine/tools engine/pattern-bridge
engine/vocab.json web/js recipes backend knowledge` — `engine/tests/` DIŞINDA,
yani yeni kapı dosyası sayaca hiç girmiyor. `engine/src` tarafında kendi diff'im
sayılan kelimeleri **net SIFIR** oynatıyor: eklenen 1 satır `garment` taşıyor
(`const std::string& where = draft.garment;`), silinen 1 satır da taşıyordu.
Bu, ilk yazımda +3 idi; kapıyı kötüleştirmemek için yorumlardaki `yoke`/`garment`
kelimeleri **anlamı bozmadan** parça adlarıyla değiştirildi ve iki `draft.garment`
kullanımı tek tutamağa indirildi.

**Yeni kırmızı AD: 0** → RULES 9 ihlali yok.

⚠ **ARADA DÜŞEN DÖRT KIRMIZI, KOŞU İÇİNDE KAPATILDI (tam kayıt).** Tüketici ilk
taşındığında ctest **11 kırmızı** verdi: mirasa ek olarak `cup_check`, `yoke_check`,
`boxpleat_check`, `compose_check`. Dördü de tek sebeptendi — §7 madde 3 — ve
gevşetilerek değil kökten kapatıldı. Ara koşunun sayıları raporun burasında
duruyor ki "hiç kırmızı olmadı" gibi okunmasın.

## 8.5 ★ DÜRÜST SINIR — SKALER HER YERDEN KALKMADI

Kart "tüketiciyi taşı" dedi; taşındı, ama **her yolda değil**. Adlandırılmış oyuk
YOKSA `validator.cpp` hâlâ eski skaler `bodice.armholeLength`'e düşüyor. Sebebi
`validator.cpp:333-352`'de yazılı: **ADIN HİÇ OLMAMASI ÜRETİCİDEKİ BİR BORÇTUR**,
o taslağın kusuru değil; reddetmek doğru çizilmiş kalıplara sahte "dikilemez"
hükmü basardı (ve RULES 9'u kırardı). **ADIN VAR OLUP ÇÖZÜLMEMESİ** ise bütünlük
hatasıdır ve **reddediliyor** — V7-C'nin bıraktığı delik odur ve kapandı.

Bu düşüş **SESSİZ DEĞİL**: kapı her koşuda borcu sayıyor ve adıyla basıyor
(`node engine/tests/sleeve_cap_ease_check.mjs`, EU38):

```
--- ADSIZ OYUK SAYIMI (yargı DEĞİL, borç kaydı; EU38)
      bardot_off_shoulder    armhole_front=0 armhole_back=0 sleeve_cap=1  → ADSIZ → validator SKALERE düşüyor (borç)
      yoke_top               armhole_front=0 armhole_back=0 sleeve_cap=1  → ADSIZ → validator SKALERE düşüyor (borç)
      cupseam_bustier        armhole_front=0 armhole_back=2 sleeve_cap=1  → ADSIZ → validator SKALERE düşüyor (borç)
      boxpleat_swing         armhole_front=1 armhole_back=1 sleeve_cap=1  → ADLI (çizilen kenardan yargılanıyor)
```

Yani tautoloji **sevk edilen varsayılan hatta (düz/prenses/kanat/Locket) ÖLDÜ**,
oyuğun kendisini yeniden şekillendiren üç pas'ta **YAŞIYOR** ve o üç pas artık
ADIYLA sayılıyor. Sıradaki kartın işi: o pas'ların çizdikleri kenara ad vermesi.

## 9. AÇIK BIRAKILAN (dokunulmadı)

- **`sleeve_underarm` çifti yargılanmıyor.** İki kenar artefaktta adlı ve ölçülüyor
  (V7-C: 421.1106 / 421.1106) ama kapı sadece **çözüldüklerini** şart koşuyor;
  "bu iki kenar birbirine dikilir, uzunlukları eşit olmalı" **kapısı KURULMADI**
  (kart iki iş istedi, üçüncüsünü değil).
- **Yaka / yan dikiş / bel / band dikişi hâlâ adsız.** `Lower Sleeve`'in üst kenarı
  (band dikişi) bilerek adsız bırakıldı — ona bir ad vermek ayrı bir karardır.
- **Diğer post-pass'ler taranmadı.** `locket.cpp` ölçümle yakalandı; `gather.cpp`,
  `shoulder.cpp`, `offshoulder.cpp`, `yoke.cpp` gibi parçaları yeniden yazan başka
  bir yol varsa aynı bayatlama orada da olabilir. **DOĞRULANMADI** — bugün yalnız
  ctest'in kırmızıya düşürdüğü yol arandı, sistematik bir tarama yapılmadı.
- **`engine/tools/recipe-json-dump.cpp` hâlâ `edgeRoles` basmıyor** (V7-C §5'ten
  devralındı, kart dışı). Yani native JSON dökümü bu kapıyla beslenemez; kapı
  wasm paketinden okur.
- **Prensesde oyuk parçalarının SIRASI/bitişikliği yargılanmıyor**: kapı iki parçayı
  TOPLUYOR, "üst parçanın sonu alt parçanın başıdır" diye bir süreklilik şartı YOK.
- **`vocab_reference_check`** şefin işi, dokunulmadı.
