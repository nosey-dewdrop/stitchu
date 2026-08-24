# KART V5-A — sewability_check: YEDİ MADDE TEK HÜKÜMDE (maddeler 1-6)

## NE
SEVK EDİLEN kalıbı dikilebilirlik açısından yargılayan tek kapı yaz.
Kapı yedi maddeyi TEK TEK adlandırır; ölçemediği maddeyi SESSİZCE GEÇMEZ,
`ABSENT: <sebep>` diye ADIYLA basar.

## ETİKET
SIRALI (V5-R2 ve V5-B bittikten sonra). SÜRE TAVANI: 60 dk.

## YEDİ MADDE ↔ BUGÜN NE ÖLÇÜYOR (şefin eşlemesi — ölçüm, varsayım değil)
Kaynak: `GECE/V5-Z.md` §4 grep sicili. Bu tabloyu VERİ olarak al, yeniden arama.
1. dikiş çifti eşitliği → VAR: `engine/pattern-bridge/walk.py` (kapı
   `engine/tests/walkgate_check.sh`) · `engine/tests/sewable_census.cpp` (omuz
   dikişi) · `engine/src/validator.cpp:412,526-527,625`
2. çentik eşleşmesi → VAR AMA DELİK: `engine/tests/notch_alignment_check.cpp`
   yan-dikiş çentiğini yargılıyor; kendi satır 23'ü ilan ediyor ki
   oyuk↔taç çentik ÇİFTİ kapsam DIŞI (`PatternPiece.notches (verified: 0)`)
3. kapalılık / kendini kesme → VAR: `engine/src/validator.cpp:164`
   `selfIntersectionIssues` (:1124 ana yargı) · `engine/tests/closed_garment_check.cpp:51`
4. köşe açısı toplamı → VAR AMA TÜKETİCİSİ PENS: `engine/src/surfacepattern.cpp:717`
   `columnDeficitRows`, `:747 columnDeficit` (2π − komşu açı toplamı) → pens
   sütunu türetiyor; dikilebilirlik HÜKMÜ basmıyor
5. GEÇİŞ → YARIM: `engine/src/wearability.hpp:68,75,80`
   (`finishedNeckOpeningMM`, `hasDonningOpening`; kapılar `wearability_check`,
   `wearable_check`). "En dar halka baş/omuz çevresinden geçiyor mu" ADIYLA
   alet YOK; kapanma donanımının SATILAN boyu HİÇ ölçülmüyor
6. geri projeksiyon → YOK: `engine/src/drape.hpp` kendi satır 12'si
   *"no seam-sewing of multiple panels — one panel, one hang"*;
   `grep -rniE "backProject|reproject|wrap3d|liftTo3D" engine/` → 0 sonuç
7. draft_math_check → YOK. **BU KARTIN İŞİ DEĞİL** (ayrı kart V5-D).

## HANGİ KALEMİ YARGILAYACAK — TARTIŞMA YOK
`GECE/V5-Z.md` §5 ÖLÇTÜ: kullanıcı `web/` üzerinden kalıp indirdiğinde koşan
şey `engine/wasm/bindings.cpp:339 draftJSON` → `GarmentDrafter::draft`
(`engine/src/garment.cpp`, 2B blok hattı). Tek-yüzey motoru
(`surfacepattern.cpp`) kullanıcıya HİÇ ULAŞMIYOR.
→ Kapı **SEVK EDİLEN** kalemi yargılar. Emsal: `engine/tools/bugra/bugra-parity.mjs:18`
   motoru `web/vendor/stitchu-engine.js` üzerinden yüklüyor; aynı usulü kullan.
Native tarafı da ölçüyorsan AYRI bölümde bas, ama hüküm sevk edilen kalemden.

## GİRDİ DOSYALARI (isim isim, başka dosya açma)
- ENV.md · RULES.md
- GECE/V5-R.md (V5-R2'nin çıktısı — eşiklerin künyesi buradan alınır)
- engine/tests/notch_alignment_check.cpp · engine/tests/closed_garment_check.cpp
- engine/tests/sewable_census.cpp · engine/tests/walkgate_check.sh
- engine/tests/flat_pattern_agree_check.mjs (mjs kapı emsali: usul + rapor dili)
- engine/tools/bugra/bugra-parity.mjs (wasm motorunu yükleme emsali)
- engine/tools/pattern-measure.mjs (0.05mm adımlı kübik integrasyon emsali)
- engine/src/wearability.hpp · engine/src/validator.cpp · engine/src/drape.hpp
- engine/CMakeLists.txt (yalnız add_test satırı eklemek için)
- contract/tables.json · contract/layers/size-table.json

## YAPILACAK
1. `engine/tests/sewability_check.mjs` (TEK yeni dosya) yaz. Yedi madde,
   yedi adlandırılmış bölüm. Her bölüm ya SAYI basar ya `ABSENT: <sebep>`.
   Madde 6 bugün ABSENT'tir (yukarıdaki grep kanıtı); ABSENT'i kapıyı
   YEŞİL yapmak için kullanma, ADIYLA bas ve sayısını raporla.
2. Kullanılan HER eşiğin künyesi test dosyasının başlığında yazılı olacak
   (`GECE/V5-R.md`'den). Kaynağı olmayan eşik için başlıkta birebir
   "yayın YOK, bant şu ölçümden: <komut>" yaz. Eşik UYDURMA.
3. `engine/CMakeLists.txt`'e `add_test(NAME sewability_check ...)` ekle.
   Mevcut hiçbir add_test satırına DOKUNMA (saf ekleme).
4. 8 bedenin hepsinde koştur (EU34..EU48); tek bedende bırakma.
5. §4.2 BOŞ TEST KANITI (birincil usul, derleme bağı sıfır): kapıyı
   faz-öncesi commit `12ad937`'nin ürettiği ÇIKTI ARTEFAKTINA karşı koştur
   (`git worktree add --detach /tmp/v5pre 12ad937`, oradaki
   `web/vendor/stitchu-engine.js` ile) ve çıktıyı
   `GECE/log/V5-A.bostest.txt`'ye yaz. Kapı orada KIRMIZI düşmüyorsa test
   boştur — bunu GİZLEME, raporunda "VACUOUS" diye yaz.
6. §4.5 MUTASYON KANITI: en az bir kasıtlı bozma (ör. bir dikiş kenarına
   +5mm) kapıyı KIRMALI, geri alınca YEŞİLE dönmeli. İki log da
   `GECE/log/V5-A.mutasyon.txt`'ye.
7. Tam `ctest --test-dir engine/build --output-on-failure` koş, logu
   `GECE/log/V5-A.ctest.after.txt`. Kırmızı AD kümesini
   `GECE/log/V5.ctest.before.txt` ile karşılaştır, farkı
   `GECE/log/V5-A.reddiff.txt`'ye yaz.

## YASAKLAR
- Kapıyı GEÇMEK için şekillendirme. Kırmızı çıkarsa KIRMIZI BIRAK ve kök
  teşhis + en az bir ÖLÇÜLMÜŞ çözüm adayı yaz (v6 §4.7). Eşik gevşetme YASAK.
- Mevcut testleri değiştirme, silme, devre dışı bırakma.
- Buğra'ya benzerlikle kapı kurma (v6 §7.3). Buğra bu kartta hiç geçmez.
- Çekirdek sayısal algoritmayı SIFIRDAN UYDURMA (v6 §5.5): önce
  `engine/tools` altında grep, yoksa YAYINLANMIŞ algoritma ADIYLA yaz ve
  adı dosya başlığına koy.
- `patterns_real/` altındaki PDF'lere dokunma. Yeni bağımlılık kurma.
- `engine/src/` altında kaynak kod DEĞİŞTİRME — bu kart bir KAPI kartıdır.

## ÇIKTI
- `engine/tests/sewability_check.mjs` · `engine/CMakeLists.txt` (saf ekleme)
- `GECE/log/V5-A.{bostest,mutasyon,ctest.after,reddiff}.txt` + 8 bedenin çıktısı
- `GECE/V5-A.md` — yapılan (dosya yolu + commit hash) · ölçülen (sayı + onu
  basan komut) · yapılamayan (sebep) · kart dışı fark edilen (dokunma, yaz).
"Baktım / doğru görünüyor / çalışıyor" YASAK (RULES 3).
Bitince commit at (lowercase english), hash'i rapora yaz.
