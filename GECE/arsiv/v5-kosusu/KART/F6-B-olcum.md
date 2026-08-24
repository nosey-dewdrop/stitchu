# KART F6-B — KOL OYUĞU ↔ KAPAK: GERÇEKTEN ÖLÇ (isci-motor)

## NE
Motorun ÇİZDİĞİ gövde parçalarının kol oyuğu yayı ile ÇİZDİĞİ kol parçasının
kapak yayını, çizilmiş poligonlardan ölçüp karşılaştır. Bu fazda ENGINE KODU
DEĞİŞMEZ — sadece ölçülür.

## ÇIKTI
1. `GECE/F6-B.md` — tutanak. **İLK İŞ olarak aç, iskeletini yaz, ilerledikçe EKLE.**
   Sonda tek seferde yazma; tur tavanında kesilirsen yazdığın kadarı kalır.
2. `engine/tools/f6-armhole-cap.cpp` — ölçüm aleti (test DEĞİL, tools/).
   CMake'e `add_executable` olarak bağla; `engine/tests/` altına DOKUNMA.
3. `GECE/log/F6.armhole-cap.json` — aletin çıktısı (ham sayılar).

## ÖNCE GREP / OKU (bu dosyalar, başkası değil)
- `engine/src/sleeve.hpp` · `engine/src/sleeve.cpp`
- `engine/src/bodice.cpp` satır 91, 284, 294, 501, 914-916 (armholeLength nasıl
  BİRİKTİRİLİYOR)
- `engine/src/garment.cpp:293` ve `:611` (SleeveBlock::draft çağrısı)
- `engine/tests/sleeve_check.cpp` satır 84-91 (mevcut cap-ease iddiası)
- `engine/tests/cap_sleeve_check.cpp` satır 47-53 (`capEdgeLength` — kapak
  kenarını çıkaran mevcut yardımcı; YENİDEN YAZMA, aynı mantığı kullan)
- `engine/src/geometry.hpp` (`pathLength`)

## ÜÇ SORU — üçünü de sayıyla cevapla
**S1 — TOTOLOJİ Mİ?** `sleeve_check.cpp:89` cap ease'i `bod.armholeLength`e
bölüyor. `SleeveBlock::draft` ise kapağı `armholeLength*(1+capEase)`e ikili
aramayla OTURTUYOR (`sleeve.cpp` Adım 1). Yani test motorun çözdüğü denklemi
geri mi okuyor? Cevabı KOD YOLUYLA göster: hangi bedende/kumaşta biceps tabanı
(Adım 2) devreye girip ikili aramanın sonucunu EZİYOR, hangisinde ezmiyor.
Ezmediği her hücrede test totolojiktir — kaç hücrede totolojik, say.

**S2 — ÇİZİLEN OYUK, BEYAN EDİLEN OYUK MU?** `bodice.armholeLength` bir
SAYAÇ değişkeni. Gerçek soru: emit edilen `PatternPiece` konturlarındaki
kol oyuğu KENARI ne kadar uzun? Ön + arka gövde parçalarının kol oyuğu
kenarlarını konturdan çıkar (kenar sınırlarını parça `markings`/köşe
noktalarından ya da geometrik olarak belirle; yöntemini tutanağa YAZ),
`pathLength` ile ölç, topla. Fark:
`cizilen_oyuk - bodice.armholeLength` = ? mm, ? %.
**8 beden (EU34..EU48) × {Woven, Knit} × {Plain, Gathered, Puffed}** için ölç.
Prenses dikişli gövde (`backPrincess`/`frontPrincess`) varsa AYRI satır.

**S3 — GERÇEK YEDİRME.** Aynı hücrelerde:
`cizilen_kapak_yayi / cizilen_oyuk_yayi - 1` = gerçek cap ease.
`sleeve.hpp` beyanı (Woven 0.04 / Knit 0.02) ile karşılaştır. En kötü sapmayı
ve hangi hücrede olduğunu yaz. Gathered/Puffed'da beyan edilen yayılma
(`gatheredSpreadFrac` 0.20 / `puffedSpreadFrac` 0.45) çizilen fazlalıkla
tutuyor mu?

## EK — TEK GREP'LİK YAN BULGU
`engine/src/sleeve.hpp:9` `bicepsRatio = kBicepsBustRatio` ve yorumu
"refuted vs Aldrich top arm" diyor. Gerçek kol çevresi ölçüsü
(`BodyMeasurementsSnapshot` içinde üst kol / arm alanı VAR MI?) — grep'le
bak, varsa ADINI ve motorda kaç yerde okunduğunu yaz. Yoksa "yok" yaz.
Bu bir ÖLÇÜM, düzeltme değil — kodu değiştirme.

## YASAKLAR
- `engine/src/` altında TEK SATIR değiştirme. Bu kart ölçüm kartıdır.
- `engine/tests/` altına dosya EKLEME/DEĞİŞTİRME (K6/K2 kapıları).
- `patterns_real/` altına dokunma (§0.10).
- Üretilmiş dosya (`contract/generated-paths.sha256` listesi) elle yazma (§0.15).
- Sayıyı yuvarlayıp "yaklaşık tutuyor" deme. mm cinsinden bas.
- commit ATMA.

## KAPI ADI (sonraki kart kuracak, sen kurma)
`sleeve_armhole_agree_check` — senin ölçtüğün sayı onun eşiği olacak.

## SÜRE TAVANI
maxTurns = 40. Tavana yaklaşırsan F6-B.md'yi kapat, "kesildi" yaz ve dön.
