# F-F — KALIP: kol oyuğu + yaka, yayın bandı kapısı
`GECE/KART/ORTAK.md` oku. Sonra bu kart.

## ÖLÇÜT (v5 §C)
KAPI = Aldrich sanity çapası **kol oyuğu 40–44cm** (`knowledge/drafting-math-eu38.md:38`).
Aynı dosya: "Armhole ÇEVRESİ Aldrich'te YOK — çizilen scye'den ölçülür." Formül yok, BANT var.
Bandın hangi çizgide (kesim/dikiş) olduğunu KENDİN karara bağla, gerekçe yaz.
BUĞRA = "PARİTE RAPORU (KAPI DEĞİL)". Kırmızı düşüremez.

## BUGÜN (ölçüldü)
`./engine/build/armhole-basis-probe` → EU38 373.06mm = 37.3cm, bandın ALTINDA.
EU34 −23.2% … EU48 −12.5%. EU46→48 adımı **+34.11mm**, diğerleri 9–13mm.

## İKİ İŞ
**(a) SEVİYE.** Derinlik sebep DEĞİL — EU38 scye derinliğimiz 22.54cm, Aldrich 21.0'dan
DERİN. Açık GENİŞLİKTE ya da OYMADA (`armholeHollowShareFront=0.34`, `Back=0.24`,
göğüs genişlikleri, koltukaltı x). ÖNCE TEŞHİS: kiriş mi kısa, yay/kiriş oranı mı düşük?
Sayıyla söyle, sonra düzelt.

**(b) KIRIK.** Kökü: `backLengthCM` EU44→46'da duruyor (42.0→42.0), `bodice.cpp:642`
`max()` TORSO→ARM rejimine geçiyor. O kolon KAYNAKSIZ + Damla kararı → UYDURMA.
Meşru yol: derinlik tabanını KAYNAKLI `bustCM`'e bağla.
Kaynak: `knowledge/drafting-math-eu38.md` scye depth 21.0cm@bust88, 21.4cm@bust92.
İki noktayı DOĞRULA (dosyayı oku), doğruysa kur, değilse bulduğunu yaz.
Adımlar monoton, max/medyan ≤ 1.6 (bugün 2.9).

## YAKA
`engine/tools/neck-basis-probe.cpp` (armhole-basis-probe deseninde).
Önce HANGİSİ sapıyor ölç: yaka DELİĞİ mi, collar PARÇASI mı? Eğri içbükey mi
dışbükey mi → ofsetin yönü buna bağlı, karar ver, gerekçe yaz.
Çapa: yaka deliği ≥ boyun çevresi. (Aldrich'te asgari YOK — doğrulanmış yokluk,
`knowledge/yaka-kolsuz-armhole-2026-08-16.md` §3.)

## KAPI — `engine/tests/garment_armhole_check.cpp` + add_test
Sevk edilen hat (`BodiceBlock::draft`, varsayılan `BodiceOptions`), 8 beden EU34–48.
K1 oyuk yayın bandında · K2 adım monoton, max/medyan ≤1.6 · K3 yaka ≥ boyun.
Buğra kolonları BASILIR ama yargı vermez. Sabitler dosyada KAYNAK SATIRIYLA.

**VACUOUS KANITI** (git stash YASAK):
`git worktree add /tmp/stitchu-onceki 7129598` → testi kopyala → orada ctest.
ORADA KIRMIZI DÜŞMELİ. Çıktı `GECE/log/garment_armhole.vacuous.txt`.
Bitince `git worktree remove /tmp/stitchu-onceki --force`.

## AYRICA
`git mv engine/tests/h10_gate_check.cpp engine/tests/h10_gate_check_LEGACY.cpp` (SİLME)
+ CMakeLists `set_tests_properties(... DISABLED TRUE)` + dosya başına gerekçe
(surfacepattern `engine/src`'den SIFIR kez include ediliyor).
`docs/H1.0-KAPI.md` başına: Buğra ≤%5 kapısı artık PARİTE (v5 §C).
