# KART V5-Z — ZEMİN KEŞFİ (ölç, onarma)

## NE
V5'in yedi kapı maddesi için ZATEN VAR OLANI say: hangi alet/test hangi
maddeyi bugün ölçüyor, hangi kalem SEVK EDİLİYOR, ve üç devir sayısı bugün
gerçekten kaç.

## ETİKET
PARALEL (V5-R ile). SÜRE TAVANI: 55 dk.

## GİRDİ DOSYALARI (isim isim)
- ENV.md · RULES.md
- engine/CMakeLists.txt (test kayıtları)
- engine/tests/ tüm dizin listesi (ls); özellikle `sewable_census*`,
  `flat_pattern_agree_check*`, `flat_artifact_census*`,
  `flat_expresses_spec_check.mjs`, `flat_geometry_sellable_check*`
- engine/tools/ tüm dizin listesi (ls) + grep
- engine/src/surfacepattern.cpp · engine/src/flatten.cpp · engine/src/curvefit.*
- patterns_real/tools/trace-match.py · patterns_real/geometry/geometry-full.json
  (SADECE JSON/py — PDF'lere DOKUNMA)

## ÖLÇÜLECEKLER (her biri: komut + çıktı + dosya yolu)
1. `ctest --test-dir engine/build --output-on-failure` TAM koşusu.
   Log: `GECE/log/V5.ctest.before.txt`. Kırmızı ADLARI isim isim + toplam test
   sayısı. (Build yoksa: `cmake -DCMAKE_BUILD_TYPE=Release` ile kur, süreyi yaz.)
2. Sözlük taban sayısı: `vocab_reference_check`'i koştur, bugünkü referans
   sayısı kaç, taban 10438'in neresinde.
3. İfade ratchet: `engine/tests/flat_expresses_spec_check.mjs` koştur,
   bugünkü UNEXPRESSED sayısı kaç (kol/yaka/omuz kırılımıyla).
4. GREP SİCİLİ — aşağıdakilerden hangisi repoda ZATEN var, dosya yolu ve
   fonksiyon adıyla: dikiş çifti uzunluk karşılaştırması (walk/seam walk) ·
   çentik eşleştirme · kapalılık/kendini kesme testi · köşe açısı toplamı ·
   giyilebilirlik/geçiş halkası · 2B→3B sarma/geri projeksiyon · gerinim
   (strain) hesabı · kalıp ölçüm aleti (`pattern-measure.mjs`).
   Her kalem: VAR (yol+fonksiyon) / YOK.
5. SEVK EDİLEN KALEM: kullanıcı `web/` üzerinden kalıp indirdiğinde hangi
   kod yolu çalışıyor — dosya + fonksiyon zinciriyle göster. (V4 ölçtü:
   flat tarafında `_engine-full.mjs renderStyle` referans kalemi sevk
   ediliyor. KALIP tarafında hangisi? ÖLÇ, varsayma.)
6. Buğra overlay için hazır ne var: `patterns_real/geometry/geometry-full.json`
   hangi parçaları hangi bedenlerde taşıyor (isim listesi + beden listesi),
   ve bizim kalıbı aynı ölçekte PNG'ye basan mevcut alet hangisi.

## YASAKLAR
- HİÇBİR ŞEYİ ONARMA. Bu kart ölçüm kartıdır; kaynak kod değiştirmek yasak.
- `patterns_real/` altındaki PDF'lere dokunma.
- Yeni test/alet YAZMA.

## ÇIKTI
`GECE/V5-Z.md` — altı başlık, her sayının yanında onu basan komut, her
dosya yolunun yanında `test -f` doğrulaması. Sonunda "KART DIŞI FARK
EDİLEN" bölümü. Log dosyaları `GECE/log/V5.*`.
Commit at (lowercase english mesaj), hash'i rapora yaz.
