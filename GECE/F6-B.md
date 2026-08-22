# F6-B — KOL OYUĞU ↔ KAPAK: GERÇEKTEN ÖLÇ (tutanak)

Kart: `GECE/KART/F6-B-olcum.md`
Alet: `engine/tools/f6-armhole-cap.cpp` (CMake: `engine/CMakeLists.txt`, `add_executable(f6-armhole-cap ...)` — bugra-dump'ın hemen altında)
Ham çıktı: `GECE/log/F6.armhole-cap.json`
Koşu: `./engine/build/f6-armhole-cap GECE/log/F6.armhole-cap.json`
→ `wrote GECE/log/F6.armhole-cap.json  cells=96 layout_bad=0 replica_bad=0`
→ `sleeve_check bodies: tautological=18 non=0`

`engine/src/` ve `engine/tests/` altında TEK SATIR değişmedi. Değişen iki dosya:
yeni `engine/tools/f6-armhole-cap.cpp` + `engine/CMakeLists.txt`'te 4 satırlık
`add_executable`/`target_link_libraries` bloğu.
Tam build yeşil: `cmake --build engine/build -j8` → `[100%] Built target wearable_check`.

## 0. YÖNTEM — çizilen oyuk kenarı nasıl seçildi

`bodice.armholeLength` bir sayaçtır (`engine/src/bodice.cpp:235` ve `:349`:
`pathLength({move(shoulderTip), armholeCurve})`). Çizilen kenarı ondan BAĞIMSIZ
almak için emit edilen `PatternPiece::commands` dizisinden komut seçildi:

- Yaka **Crew**'a sabitlendi. `neckCommands()` (`bodice.cpp:60-83`) Crew'da TEK
  komut basar, böylece yarım-parça komut düzeni deterministik:
  - pens modu yarım parça: `[0]=Move(centerNeck) [1]=yaka [2]=Line(shoulderTip) [3]=OYUK`
  - prenses **merkez** panel: `[0]=Move [1]=yaka [2]=Line(shoulderTip) [3]=OYUK (armSplit.first)`
  - prenses **yan** panel: `[0]=Move(split) [1]=OYUK (armSplit.second)`
- Alet ölçmeden ÖNCE bu indekslerdeki komut TİPLERİNİ doğruluyor
  (`drawnHalf()`, `layout_bad` sayacı). Ölçülen 96 hücrede **layout_bad = 0**.
- Kenar uzunluğu: `pathLength({move(önceki komutun bitiş noktası), o komut})` —
  `engine/src/geometry.hpp` `pathLength`.
- Çizilen oyuk = ön yarım + arka yarım (prenseste her yarım iki panele bölünmüş,
  ikisi toplanıyor). Kart bunun için AYRI satır istedi; JSON'da her hücrede
  `front_princess`/`back_princess` bayrakları ve `shaping` alanı var.
- Kapak kenarı: `commands[0..2]` — `engine/tests/cap_sleeve_check.cpp:50`
  `capEdgeLength`'in birebir aynı mantığı (yeniden yazılmadı, kopyalandı).
- Izgara: EU34..EU48 (8) × {Woven, Knit} × {Plain, Gathered, Puffed} × {Princess, Dart}
  = 96 hücre. Gövde `BodiceBlock::draft`, seçenekler `garment.cpp:244-259`
  (DressBlock) ile aynı kuruldu, `sleeveless=false`.

`SleeveBlock::draft`'ın Adım 1/Adım 2 çözümü alette **REPLİKE** edildi (çünkü
`capCurve`/`capCurveLength` `sleeve.cpp`'de isimsiz namespace'te, dışa açık değil).
Replika körlemesine güvenilmedi: tahmin edilen nihai kapak genişliği ve yüksekliği
çizilen kol parçasının gerçek geometrisiyle 1e-6 mm'de karşılaştırılıyor
→ 96 hücrede **replica_bad = 0**, yani replika motorun çözümünün aynısı.

## S1 — TOTOLOJİ Mİ? EVET, 18/18 + 96/96

`engine/tests/sleeve_check.cpp:89` `ease = capLen / bod.armholeLength - 1` yazıp
`0.01 <= ease <= 0.09` diyor. `SleeveBlock::draft` ise kapağı
`targetCapLength = armholeLength * (1 + capEaseFor(fabric))`e
`convergenceTolerance = 0.5` mm ile oturtuyor (`sleeve.cpp:55,68-95`).

Kartın hipotezi: "biceps tabanı (Adım 2) devreye girerse ikili aramanın sonucunu
EZER, ezmediği hücrede test totolojiktir." **Bu hipotez ölçümle daralttı:
Adım 2 de AYNI hedefi çözüyor, sadece ekseni değiştiriyor** (genişlik yerine
kapak YÜKSEKLİĞİ, `sleeve.cpp:86-94`). Yani taban tetiklense de tetiklenmese de
kapak uzunluğu aynı `targetCapLength`e ±0.5 mm'de oturuyor.

Testin KENDİ gövdeleri (`sleeve_check.cpp:35-52`, 9 gövde × 2 kumaş = 18 hücre;
kapak uzunluğu kol boyundan/stilinden bağımsız olduğu için 18 hücre testin bütün
cap-ease iddialarını kapsıyor) — JSON `sleeve_check_bodies`:

| gövde | kumaş | taban tetiklendi mi | kapak−hedef (mm) | ease |
|---|---|---|---|---|
| min | Woven | EVET | −0.3504 | 0.0386 |
| min | Knit | EVET | −0.3378 | 0.0186 |
| max | Woven | HAYIR | −0.4567 | 0.0394 |
| max | Knit | HAYIR | +0.0038 | 0.0200 |
| mid | Woven | EVET | +0.3535 | 0.0409 |
| mid | Knit | EVET | −0.0253 | 0.0199 |
| big-bust narrow-shoulder | Woven | HAYIR | −0.1989 | 0.0397 |
| big-bust narrow-shoulder | Knit | HAYIR | −0.0267 | 0.0200 |
| petite-torso fuller-bust | Woven | EVET | +0.1274 | 0.0402 |
| petite-torso fuller-bust | Knit | EVET | −0.0384 | 0.0199 |
| mid short-back | Woven | EVET | +0.1700 | 0.0404 |
| mid short-back | Knit | EVET | −0.0437 | 0.0199 |
| full petite | Woven | EVET | −0.3917 | 0.0391 |
| full petite | Knit | EVET | +0.3024 | 0.0207 |
| extreme short-back | Woven | EVET | +0.0214 | 0.0400 |
| extreme short-back | Knit | EVET | −0.0433 | 0.0199 |
| wide-arm normal-back | Woven | HAYIR | −0.0194 | 0.0400 |
| wide-arm normal-back | Knit | HAYIR | +0.0450 | 0.0201 |

- Biceps tabanı **12/18** hücrede tetikleniyor; tetiklenmeyen 6 hücre: `max`×2,
  `big-bust narrow-shoulder`×2, `wide-arm normal-back`×2 (hepsinde büst yeterince
  büyük ki uzunluk-eşlemesi zaten biceps'ten geniş bir kol veriyor).
- **18/18 hücrede |kapak − hedef| ≤ 0.5 mm**, yani çözücü kendi hedefine ulaşıyor.
  Sonuç: `ease` yalnızca `capEase` sabiti olabilir ± (0.5 mm / armhole).
  En küçük oyukta (min gövde, 245.871 mm) bu bant ±0.0020. Testin 1–9%
  penceresinin genişliği 0.08; ölçülen bant 0.004. **Pencere ısırmıyor.**
- Ölçülen ease aralığı: Woven 0.0386–0.0409, Knit 0.0186–0.0207.
- **TOTOLOJİK HÜCRE SAYISI: 18/18** (JSON `tautological_cells: 18`,
  `non_tautological_cells: 0`). EU ızgarasında da 96/96 taban tetikleniyor ve
  32/32 Plain hücrede |kapak−hedef| ≤ 0.4727 mm.
- Test yine de boş DEĞİL: `sleeve_check.cpp:78-82`'deki biceps genişlik iddiası
  ve validator iddiası ayrı şeyleri ölçüyor. Totolojik olan sadece :89'daki
  cap-ease satırı.
- Kaçış deliği duruyor ama ateşlemiyor: Adım 2'nin yükseklik araması
  `chLo = 20.0`'da kelepçeli (`sleeve.cpp:86`); `targetCapLength`
  `capCurveLength(biceps, 20)`'in altına düşerse çözücü hedefi ıskalar ve test
  o zaman gerçek bir şey söylerdi. Ölçülen 114 hücrenin (96 EU + 18 test gövdesi)
  hiçbirinde olmuyor.

## S2 — ÇİZİLEN OYUK, BEYAN EDİLEN OYUK MU? EVET (en kötü 0.0155 mm)

96 hücrenin hepsinde `cizilen_oyuk − bodice.armholeLength` ölçüldü
(JSON alanları `drawn_armhole_mm`, `declared_armhole_mm`, `armhole_diff_mm`,
`armhole_diff_pct`).

- **Pens (Dart) modu: 48/48 hücrede fark tam 0.000000000 mm.** Beyan edilen
  sayaç, çizilen kenarın birebir aynısı.
- **Prenses modu: en kötü +0.015479 mm = +0.003393 %** (EU48, Princess, Woven).
  Fark bedenle monoton büyüyor: EU34 +0.0022 → EU48 +0.0155 mm.
  Kök: prenseste tek oyuk kübiği `splitCubic` ile İKİ kübiğe bölünüyor
  (`bodice.cpp:386`), iki parça ayrı ayrı düzleştirilip toplanıyor; artık
  tamamen `pathLength`'in düzleştirme (flattening) ayrıklığından geliyor —
  iki alt-kübiğin toplam poligonu tek kübiğinkinden zorunlu olarak biraz UZUN.
  Geometrik bir kaçak değil, sayısal artık.
- Ölçek: 0.0155 mm, üretim standardı 0.79375 mm'nin **%1.95'i**.
- Ön/arka ayrı satırlar JSON'da (`drawn_armhole_front_mm`, `drawn_armhole_back_mm`).

→ **S2'nin cevabı: `bodice.armholeLength` yalan söylemiyor.** Motorun kol oyuğu
sorunu (varsa) beyan/çizim ayrışmasında DEĞİL.

## S3 — GERÇEK YEDİRME

`gerçek cap ease = cizilen_kapak / cizilen_oyuk − 1` (JSON `cap_ease_vs_drawn`).

**Plain (32 hücre) — beyan tutuyor:**
- Woven: 0.0387 … 0.0410 (beyan 0.04). En kötü sapma **0.00130 = 0.470 mm**,
  EU36 Princess Woven.
- Knit: 0.0188 … 0.0210 (beyan 0.02). En kötü sapma **0.00119 = 0.416 mm**,
  EU34 Princess Knit.
- İkisi de çözücünün kendi 0.5 mm toleransının içinde. Yani Plain'de "gerçek
  yedirme" beyan edilen sabitin ta kendisi — S1'deki totolojinin geometrik yüzü.

**Gathered (32 hücre) — beyan TUTMUYOR:**
- `gerçek ease = 0.1310 … 0.1840`. En kötü hücre EU46 Dart Woven:
  kapak 499.837 mm, oyuk 422.151 mm → **+77.686 mm**.
- Beyan edilen yayılma `gatheredSpreadFrac = 0.20` bir **GENİŞLİK** kesri
  (`sleeve.cpp:104`: `spread = frac * width`), ama kumaşa giren şey YAY.
  Ölçülen: aynı hücrede Plain'e göre yay fazlalığı **0.1101 … 0.1390**.
  Yani %20 genişlik yayılması yalnızca **%11.0–13.9** yay fazlası üretiyor —
  kapak yüksekliği sabit kaldığı için yay genişlikte alt-doğrusal büyüyor.
- Beyan (0.20) ile çizilen yay fazlası (0.110–0.139) arasındaki fark
  **0.061–0.090**, yani beyan edilen büzgünün **%31–45'i yok**.

**Puffed (32 hücre) — beyan TERS YÖNDE tutmuyor:**
- `gerçek ease = 0.7486 … 0.8618`. En kötü hücre EU46 Dart Woven:
  kapak 785.958 mm, oyuk 422.151 mm → **+363.807 mm**.
- Beyan `puffedSpreadFrac = 0.45`, çizilen yay fazlası (Plain'e göre)
  **0.7164 … 0.7910**. Yani beyan edilenin ~1.6–1.8 KATI.
  Sebep: puff'ta hem genişlik `+0.45*width`, hem de kapak yüksekliği
  `capHeight += spread` (`sleeve.cpp:106-107`) — iki eksende birden büyüyor,
  yay ikisinin bileşiminde artıyor.

**Bir sonraki kart (`sleeve_armhole_agree_check`) için ölçülmüş eşik adayı:**
kapı Plain'de `|kapak/oyuk − capEaseFor(fabric)| ≤ 0.0015` (ölçülen en kötü
0.00130) diyebilir; **Gathered/Puffed'da EŞİTLİK ARAMAK YANLIŞ OLUR** — oradaki
+13…+86% kasıtlı büzgüdür. O iki halde kapının ölçmesi gereken şey ease değil,
"beyan edilen yayılma kesri ile çizilen yay fazlası aynı şeyi mi söylüyor"
sorusudur ve bugünkü cevap HAYIR (yukarıdaki 0.110–0.139 vs 0.20 ve
0.716–0.791 vs 0.45).

## EK — GERÇEK ÜST KOL ÇEVRESİ ÖLÇÜSÜ: YOK

- `BodyMeasurementsSnapshot` (`engine/src/measurements.hpp:11-57`) alanları:
  `bustCM waistCM hipCM shoulderCM backLengthCM armLengthCM neckCM upperBustCM`
  + `bustBackFrac waistBackFrac hipBackFrac shoulderWidthCM shoulderInclDeg`.
  **Üst kol / biceps ÇEVRESİ alanı YOK.** `armLengthCM` bir UZUNLUK, çevre değil.
- `grep -rn "armGirth|upperArm|bicepCM|bicepsCM|topArm|arm_circ" engine/src/ contract/`
  → **0 eşleşme.**
- `contract/tables.json:15` `_fields` listesi de aynı 7 sütun; beden tablosunda
  kol çevresi sütunu yok.
- Yerine kullanılan tahmin: `kBicepsBustRatio = 0.30`
  (`engine/src/constants.gen.hpp:21`), yorumu "refuted vs Aldrich top arm".
  Motorda okunduğu yerler (grep):
  - `engine/src/sleeve.hpp:9` (`SleeveBlock::bicepsRatio`)
  - `engine/src/bodice.hpp:78` (`bicepsRatioForArmscye` — aynı sabit)
  - `engine/src/sleeve.cpp:53` (kolun biceps tabanı)
  - `engine/src/bodice.cpp:627` (`bicepsGirth`, armscye derinlik tabanı)
  - `engine/src/validator.cpp:322` ve `:353` (validator'ın biceps/cap kuralları)
  → çekirdekte **5 okuma yeri**, artı test tarafında `sleeve_check.cpp:78,160`,
  `recipe_dress_check.cpp:137`, ve `engine/tools/tracer/ring2recipe.py:108,449`.
- Yani kolun genişliği ve oyuğun derinliği, ÖLÇÜLMEMİŞ tek bir orandan
  (büst × 0.30) türüyor; iki blok da aynı sabiti okuduğu için ikisi tutarlı
  ama ikisi de aynı yönde yanlış olabilir. Bu bir ÖLÇÜMDÜR, kod değiştirilmedi.

## Kapanış
Kart kapsamının tamamı ölçüldü; kesilme olmadı. Commit atılmadı.
