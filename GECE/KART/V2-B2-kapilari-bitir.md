# KART V2-B2 — İKİ KAPIYI BİTİR VE ctest'E BAĞLA · SIRALI (1/2)

## NE
Önceki işçi kesildi. Diskte YARIM iş var ve `6fac6cb`'de çivilendi:
`engine/tests/vocab_reference_check.sh` · `engine/tests/vocab-reference-baseline.json` ·
`engine/tests/vocab_source_check.sh` · `engine/tools/gen-vision-vocab.mjs`.
`engine/CMakeLists.txt`'e HİÇBİRİ bağlanmadı, `GECE/V2-B.md` yazılmadı,
mutasyon kanıtı yok. Senin işin: bu dördünü DOĞRULA, çalıştır, kanıtla, ctest'e
bağla, tutanağını yaz. Sıfırdan yazma — önce oku, çalışıyorsa kabul et.

Kapıların ne yapması gerektiği (değişmedi):
(1) `vocab_reference_check` — kapalı enum'a YENİ referans eklemek yasak; taban
    commit `a6b473a`'ten sayılır, sayı yalnız DÜŞEBİLİR (ratchet). `"none"`
    gibi 22 eksende ortak kelimeler tek başına sayılmaz (`GECE/V0-0D.md` §3
    KİRLİLİK uyarısı); sağlıklı taban PAYLASIM=1 kelimeler + eksen ADI
    referansları, kanonik DAR kapsam grep'iyle.
(2) `vocab_source_check` — `vision-student/vocab.py` build ÜRÜNÜDÜR; üreteci
    (`engine/tools/gen-vision-vocab.mjs`) geçici dizine yeniden koşturup
    `diff` ile karşılaştırır. Elle edit testi KIRAR. Emsal desen:
    `engine/tests/specv2-check.mjs:46` + `engine/tools/gen-spec-v2.mjs` — ÖNCE
    onu oku, deseni yeniden icat etme (§7.5).

## GİRDİ DOSYALARI (isim isim)
- `ENV.md`, `RULES.md`
- `GECE/KART/V2-B-iki-kapi.md` (önceki kartın tam metni — şartlar aynen geçerli)
- `GECE/V2-R.md` Bölüm 2 (eşik/usul kaynağı, BAĞLAYICI) ve Bölüm 3 (otorite hükmü)
- `GECE/V0-0D.md` §3 (sayım tabanı + iki kapsam uyarısı)
- `GECE/log/V2-B.bostest.source.txt` (önceki işçinin boş-test denemesi)
- `engine/tests/vocab_reference_check.sh`, `engine/tests/vocab-reference-baseline.json`,
  `engine/tests/vocab_source_check.sh`, `engine/tools/gen-vision-vocab.mjs`
- `engine/vocab.json`, `contract/vocab-resolution-v1.json` (yalnız OKU)
- `vision-student/vocab.py`
- `engine/tools/gen-spec-v2.mjs`, `engine/tests/specv2-check.mjs` (emsal desen)
- `engine/CMakeLists.txt` (`add_test` deseni `:743 :761 :779-784`; TEK sahibi sensin)

## ÇIKTI (yalnız bu yollar)
- yukarıdaki dört dosyanın düzeltilmiş hâli
- `vision-student/vocab.py` (üretilmiş hâli)
- `engine/CMakeLists.txt` (İKİ `add_test` satırı — kapı yeşilse ekle, değilse EKLEME)
- `GECE/V2-B.md` (ölçüm + mutasyon + boş-test logları, komut çıktılarıyla)
- `GECE/log/V2-B.*` (bostest, mutasyon, ctest.after)

## ZORUNLU KANIT
1. **BOŞ TEST (4.2, birincil usul):** her iki kapı da faz-öncesi durumda KIRMIZI
   düşecek. `vocab_source_check`: bugünkü ELLE yazılmış `vision-student/vocab.py`'a
   karşı koştur → KIRMIZI. `vocab_reference_check`: tabanı bir eksik referansla
   kur, bugünkü ağaca koştur → KIRMIZI. Log yolları `GECE/log/` altına.
2. **MUTASYON (4.5):** kapı başına en az bir kasıtlı bozma → KIRMIZI, geri
   alınca → YEŞİL. İki log da `GECE/log/V2-B.mutasyon.txt`'ye. Mutasyonu MUTLAKA
   geri al; çalışma ağacı temiz bitecek (`git status` çıktısını rapora koy).
3. **ctest tam koşusu:** `ctest --test-dir engine/build --output-on-failure`.
   Miras kırmızı AD kümesi — `style_check` · `sizechart_source_check` ·
   `contract_check` · `figure_check` — BÜYÜYEMEZ (RULES 9). Faz-öncesi log
   `GECE/log/V2.ctest.before.txt` (4 kırmızı / 105 koşan) diskte hazır; seninki
   `GECE/log/V2-B.ctest.after.txt`.
4. `vision-student/vocab.py`'ın ölçülmüş üç sapması (`garment` içinde
   `trousers`/`other` fazla · `neckline` 7 değil 9 · `skirtStyle` 5 değil 6)
   kapanacak; kapatamadığın kalemi SİLME, `_UNRESOLVED` bloğunda gerekçesiyle
   bırak ve testin o bloğu ayrıca denetlemesini sağla.

## YASAKLAR
- `contract/` ve `engine/src/` ile `engine/wasm/` altına YAZMA (yalnız OKU).
- MEVCUT testleri değiştirme; mevcut kırmızıları "düzeltmeye" çalışma.
- Kaynaksız eşik (§5, 7.6). Yeni bağımlılık (npm/pip install) YOK.
- Yeni kaynak dosya yaratma: payın `6fac6cb`'deki dört dosyayla DOLDU (§7.5).
- "Baktım / çalışıyor" yasak (RULES 3): her sayının yanında onu basan komut.

## SÜRE TAVANI
60 dk. Dolarsa çalışan parçayı commit'le, kalanı `GECE/V2-B.md`'ye kart taslağı
olarak yaz. YARIM kapıyı ctest'e BAĞLAMA.

## ETİKET
SIRALI (1/2) — `engine/CMakeLists.txt`'in tek sahibi sensin; V2-C senden sonra.
