# F6-C — KOL KAPISI: ÇİZİLENİ BEYANLA YÜZLEŞTİR (tutanak)

Kart: `GECE/KART/F6-C-kapi.md`
Girdi ölçüm: `GECE/F6-B.md` + `GECE/log/F6.armhole-cap.json`

Bu dosya ilerledikçe EKLENİR; sonda tek seferde yazılmadı.

## 0. DURUM
- [x] devralınan ctest kırmızı listesi (ÖNCE) — §1
- [x] kapı testi yazıldı + ctest'e kaydedildi — §2
- [x] kapı bugünkü motorda kırmızı, hangi hücre — §3
- [x] kök sebep düzeltmesi — §4
- [x] devralınan ctest kırmızı listesi (SONRA) + golden-diff — §5

## 1. DEVRALINAN KIRMIZI LİSTE (ÖNCE)

Koşu: `ctest --test-dir engine/build` (Release, tam build yeşil)
Ham çıktı: `GECE/log/F6C.ctest.before.txt`

```
93% tests passed, 7 tests failed out of 96
	  5 - style_check (Failed)
	 12 - sizechart_source_check (Failed)
	 71 - bugra_bridge_check (Failed)
	 78 - contract_check (Failed)
	 82 - preview_truth_check (Failed)
	 83 - figure_check (Failed)
	 89 - h10_gate_check (Failed)
Total Test time (real) = 226.38 sec
```
Kartın §0.6 listesiyle birebir aynı 7 ad. Büyümemesi gereken taban budur.

## 2. KAPI

Dosya: `engine/tests/sleeve_armhole_agree_check.cpp`
CMake kaydı: `engine/CMakeLists.txt` — `sleeve_check` ile `cap_sleeve_check`
arasına `add_executable/target_link_libraries/add_test(NAME sleeve_armhole_agree_check)`.

Izgara: EU34..EU48 (8) × {Dart, Princess} × {Woven, Knit} × {Plain, Gathered, Puffed}
= **96 hücre**, her hücrede ölçülen sayı `printf` ile basılıyor (RULES 6).

Ölçüm yöntemi — yeniden icat EDİLMEDİ:
- Kapak kenarı = `commands[0..2]`, `engine/tests/cap_sleeve_check.cpp:50`
  `capEdgeLength` ile birebir aynı üç komutluk koşu.
- Oyuk kenarı = `engine/tools/f6-armhole-cap.cpp` `drawnHalf()` yöntemi: yaka
  `Crew`'a sabitleniyor, yarım-parça komut düzeni deterministik oluyor
  (`[2]=Line(shoulderTip) [3]=OYUK`; prenses yan panelde `[0]=Move [1]=OYUK`),
  ve ölçmeden ÖNCE bu indekslerdeki komut TİPLERİ `check()` ile doğrulanıyor.
- F6-B aletinden FARKI: alet `BodiceBlock::draft`'a doğrudan bakıyordu; kapı
  `GarmentDrafter::draft(GarmentType::Top)` ile EMİT EDİLEN parçalara bakıyor ve
  beyanı `DraftedPattern::sleeveArmholeLenMM`'den (`engine/src/garment.cpp:660`)
  okuyor. Yani `extendPiece` sonrası gerçek çıktı ölçülüyor.
- Panel sayısı da yargılanıyor (Dart 2, Princess 4) — parça kaçarsa kapı susmuyor.

Eşikler ve kaynakları (testin başında yorum olarak da yazılı):
- **H1 ≤ 0.79375 mm** — üretim dikiş standardı. F6-B S2 en kötü 0.015479 mm ölçtü,
  kapı 51 kat pay bırakıyor.
- **H2 ≤ 0.0015** — KAYNAK ÖLÇÜM, literatür değil: F6-B S3'te 32 Plain hücrede
  en kötü sapma 0.00130 (EU36 Princess Woven).
- **H3 ≤ 0.02** — beyan `capSpreadFrac(cap)` ile çizilen yay fazlası
  (`kapak / aynı hücrenin Plain kapağı − 1`) aynı büyüklük olmalı.

## 3. KAPI BUGÜNKÜ MOTORDA: KIRMIZI (exit 1, 64 failure)

Koşu: `./engine/build/sleeve_armhole_agree_check`
Ham çıktı: `GECE/log/F6C.gate.before.txt`

```
cells=96
worst H1 = 0.015479 mm   (EU48 Princess Woven Plain)   limit 0.79375 mm
worst H2 = 0.001297      (EU36 Princess Woven Plain)   limit 0.0015
worst H3 = 0.340968      (EU46 Dart Woven Puffed)      limit 0.0200
sleeve_armhole_agree_check FAILED (64 failures)
```

- **H1 YEŞİL.** 96/96. Dart hücrelerinde fark tam 0.000000 mm; prenseste en kötü
  0.015479 mm (EU48 Woven) = F6-B S2'nin sayısının aynısı, bağımsız hattan.
- **H2 YEŞİL.** 32/32 Plain hücre. En kötü 0.001297 (EU36 Princess Woven);
  F6-B 0.00130 ölçmüştü — aynı hücre, aynı sayı.
- **H3 KIRMIZI: 64/64 hücrenin hepsi.** Tek istisna yok.
  - Gathered (32 hücre): beyan 0.200000, çizilen yay fazlası **0.110078 … 0.133395**
    (en iyi EU48 Princess Woven 0.133395, en kötü EU34 Dart Knit 0.110078) →
    sapma 0.066605 … 0.089922.
  - Puffed (32 hücre): beyan 0.450000, çizilen **0.716370 … 0.790968** →
    sapma 0.266370 … **0.340968** (en kötü hücre EU46 Dart Woven).

**Kapının neden kırmızı olduğu (vacuous değil):** `sleeve.cpp:104`
`spread = capSpreadFrac(cap) * width` yayılmayı **GENİŞLİK** kesri olarak
uyguluyor; oysa oyuğa büzülerek giren fazlalık **YAY**. Kapak kirişi büyürken yay
alt-doğrusal büyüdüğü için %20 genişlik yalnızca %11–13 yay veriyor. Puff'ta
ayrıca `capHeight += spread` (`sleeve.cpp:106-107`) ikinci eksende de büyütüyor,
bu sefer yay beyanın 1.6–1.8 KATINA çıkıyor. İki hata aynı satır çiftinden ve
ters yönlere gidiyor — bu yüzden "ortalama tutuyor" savunması da yok.

## 4. KÖK SEBEP DÜZELTİLDİ (test gevşetilmedi)

Değişen tek çekirdek dosya: `engine/src/sleeve.cpp` (eski satır 104-107 bloğu).
`engine/tests/` altındaki hiçbir mevcut dosyaya dokunulmadı; `sleeve_check.cpp`
ve `cap_sleeve_check.cpp` olduğu gibi duruyor. Hiçbir eşik/tolerans sabiti
oynatılmadı (`sleeve.hpp`'deki `gatheredSpreadFrac = 0.20`,
`puffedSpreadFrac = 0.45`, `capEase`, `convergenceTolerance` AYNI).

ÖNCE (`sleeve.cpp:104-107`):
```
const double spread = capSpreadFrac(cap) * width;   // GENİŞLİK kesri
const double capWidth = width + spread;
const double capRise = (cap == SleeveCap::Puffed) ? spread : 0.0;
```
SONRA: `capSpreadFrac` bir **YAY** beyanı olarak okunuyor ve `spread` ÇÖZÜLÜYOR —
Adım 1'in kullandığı ikili aramanın aynısıyla:
```
targetHeadLength = capCurveLength(width, capHeight) * (1 + capSpreadFrac(cap));
headLength(s)    = capCurveLength(width + s, capHeight + (puff ? s : 0));
// [0, width] üzerinde ikili arama, gerekirse üst sınır 2 katına çıkarılır
```
Doğrulanmış puff değişmezi KORUNDU (kapak yükselmesi == yayılma miktarı,
`sleeve.hpp:18-26`); değişen tek şey, o miktarın artık serbest parametre değil
beyan edilen yay fazlalığından ÇÖZÜLEN bir sayı olması. `spreadFrac == 0`
(Plain / Cap) yolunda `spread = 0` → hiçbir aritmetik çalışmıyor, çizim
bayt-birebir aynı kalıyor.

KAPI SONRASI — `GECE/log/F6C.gate.after.txt`, `./engine/build/sleeve_armhole_agree_check`:
```
cells=96
worst H1 = 0.015479 mm   (EU48 Princess Woven Plain)   limit 0.79375 mm
worst H2 = 0.001297      (EU36 Princess Woven Plain)   limit 0.0015
worst H3 = 0.000000      (EU42 Dart Knit Puffed)       limit 0.0200
sleeve_armhole_agree_check OK (0 failures)
```
- H1 ve H2 sayıları düzeltmeden ÖNCEKİYLE BİREBİR AYNI (0.015479 / 0.001297) —
  yani Plain hattı ve oyuk hattı kımıldamadı, sadece büzgülü kapak değişti.
- H3: 64 hücrenin 64'ünde sapma 0.000000 (1e-9 mm ikili arama kalanı, %.6f'te
  sıfır). Çizilen yay fazlası artık beyanın kendisi: Gathered 0.20, Puffed 0.45.

## 5. DEVRALINAN KIRMIZI LİSTE (SONRA) — BÜYÜMEDİ

Ham çıktı: `GECE/log/F6C.ctest.after.txt`
```
93% tests passed, 7 tests failed out of 97
	  5 - style_check (Failed)
	 12 - sizechart_source_check (Failed)
	 72 - bugra_bridge_check (Failed)
	 79 - contract_check (Failed)
	 83 - preview_truth_check (Failed)
	 84 - figure_check (Failed)
	 90 - h10_gate_check (Failed)
Total Test time (real) = 241.85 sec
```
ÖNCE 7 kırmızı / 96 test → SONRA **aynı 7 ad** / 97 test. Numaralar yeni testin
listeye girmesiyle bir kaydı; **ad listesi birebir aynı**, yeni kırmızı yok.
`sleeve_armhole_agree_check` yeşil olarak eklendi (96 → 97).

Golden bayt-birebir: `ctest -R "golden_check|sleeve_check|cap_sleeve_check|
recipe_golden_check|recipe_dress_golden_check"` → **5/5 Passed**
(`golden_check.sh` C++ dump'ı referansla karşılaştırır; Plain hattı değişmedi).

## 6. YAN BULGU (bu gece düzeltilmedi)

`engine/tools/f6-armhole-cap.cpp` içindeki Adım 1/2 REPLİKASI artık motorun
gathered/puff yolunu taklit etmiyor (`predSpread = cv.spread * sol.finalWidth`
satırı eski davranışı varsayıyor). Alet yeniden koşulursa Plain hücrelerde
`replica_ok` kalır ama 64 gathered/puff hücrede `replica_bad` yanar. Alet bir
ÖLÇÜM aleti, kapı değil; ctest'te yok, bu yüzden hiçbir kapıyı kırmızıya
düşürmüyor. Düzeltmesi tek satır ama F6-B'nin tutanaklı çıktısını
değiştireceği için bu gece DOKUNULMADI.

## 7. KAPANIŞ
Kartın üç önceliği de bitti (kapı var + gerçekten ölçüyor · bugünkü motorda
kırmızıydı ve neyi yakaladığı yazılı · kök sebep düzeltildi, kapı yeşil,
devralınan 7 kırmızı büyümedi). Kesilme olmadı. Commit ATILMADI.
