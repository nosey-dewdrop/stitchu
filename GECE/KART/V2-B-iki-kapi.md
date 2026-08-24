# KART V2-B — İKİ YENİ KAPI: vocab_reference_check + vocab_source_check · PARALEL (V2-A ile)

## NE
İki yeni ctest kapısı kur, ikisi de GERÇEKTEN kırılabilir olsun.

(1) **`vocab_reference_check` (§6/V2 madde b).** Kapalı enum'a YENİ referans
    eklemek yasaktır ve mekanik denetlenir. Kapı, faz-öncesi commit'teki
    referans sayısını TABAN alır; sayı yalnız DÜŞEBİLİR, artıran commit kırmızı
    düşer (ratchet).
    - TABAN COMMIT: `a6b473a` (sabit). Tabanı ÇALIŞMA AĞACINDAN DEĞİL,
      `git worktree add -f -q <tmp> a6b473a` ile ayrı bir ağaçtan say —
      böylece paralel koşan başka kart sayıyı kirletemez.
    - Sayım yöntemi `GECE/V0-0D.md` §3'ün KANONİK dar kapsam grep'i olacak
      (`Logs/ docs/ reports/ .git/` dışarıda; V0-0D geniş kapsamın ~7.7× şişik
      olduğunu ölçtü). ⚠ V0-0D §3'ün `"none"` KİRLİLİĞİ uyarısını uygula:
      **22 eksende ortak kelimeler tek başına sayılmaz**; sağlıklı taban
      PAYLASIM=1 kelimeler + eksen ADI referansları.
    - Taban dosyası commit'lenir (`engine/tests/vocab-reference-baseline.json`),
      içinde: taban commit hash · eksen/kelime başına sayı · toplam · sayımı
      basan komut. Sayı DÜŞTÜĞÜNDE kapı yeşil kalır ama tabanı KENDİLİĞİNDEN
      güncellemez — düşüşü sabitlemek ayrı, bilinçli bir commit'tir.

(2) **`vocab_source_check` (§6/X madde c).** Görü kelime listesi build
    ÜRÜNÜDÜR: listenin Katman 3 tablosundan üretildiğini, üreteci yeniden
    koşturup çıktıyı karşılaştırarak kanıtla (regen-and-diff). Elle edit
    edilen liste testi KIRAR.
    - GERÇEK DOSYA: `vision-student/vocab.py` (⚠ `vision/vocab.py` DİSKTE YOK).
    - Üreteç yaz: `engine/tools/gen-vision-vocab.mjs` — girdi
      `contract/vocab-resolution-v1.json` (Katman 3) + `engine/vocab.json`,
      çıktı `vision-student/vocab.py`. Dosyanın başına "ÜRETİLMİŞTİR, elle
      düzenleme" başlığı + üreteç yolu + kaynak dosya yolları yazılır.
    - Üreteç ÇALIŞMA AĞACINI KİRLETMEDEN doğrulanır: geçici dizine üret, `diff`
      ile karşılaştır (`GECE/V2-R.md` Bölüm 2'nin bağladığı usul; repodaki
      emsal `engine/tests/specv2-check.mjs:46` + `engine/tools/gen-spec-v2.mjs`
      — ÖNCE onu oku, deseni tekrar icat etme, §7.5).
    - ⚠ ÖLÇÜLMÜŞ SAPMA (V2-R kart-dışı bulgu 2, kendin DOĞRULA):
      `vision-student/vocab.py` bugün üçüncü elle kopya — `garment` içinde
      `trousers`/`other` var (vocab.json'da yok), `neckline` 7 (cowl/pussyBow
      eksik), `skirtStyle` 5 (gore eksik). Üreteç bu sapmayı KAPATMALI;
      kapatamadığın kalemi silme, `_UNRESOLVED` bloğunda gerekçesiyle bırak ve
      testin o bloğu ayrıca denetlemesini sağla.

## GİRDİ DOSYALARI (isim isim)
- `ENV.md`, `RULES.md`
- `GECE/V2-R.md` (Bölüm 2 = eşik/usul kaynağı, BAĞLAYICI; Bölüm 3 = otorite)
- `GECE/V0-0D.md` (§3 sayım tabanı + iki kapsam uyarısı)
- `engine/vocab.json`, `contract/vocab-resolution-v1.json` (yalnız OKU)
- `vision-student/vocab.py`
- `engine/tools/gen-spec-v2.mjs`, `engine/tests/specv2-check.mjs` (emsal desen)
- `engine/CMakeLists.txt` (`add_test` deseni: `:743`, `:761`, `:791`)

## ÇIKTI (yalnız bu yollar)
- `engine/tests/vocab_reference_check.sh` + `engine/tests/vocab-reference-baseline.json`
- `engine/tests/vocab_source_check.sh`
- `engine/tools/gen-vision-vocab.mjs`
- `vision-student/vocab.py` (üretilmiş hâli)
- `engine/CMakeLists.txt` (İKİ `add_test` satırı — bu dosyanın TEK sahibi sensin)
- `GECE/V2-B.md` — ölçüm + mutasyon logları

## ZORUNLU KANIT (4.2 boş test + 4.5 mutasyon — ikisi de raporda)
1. **BOŞ TEST KAPISI (4.2, birincil usul):** her iki kapının da faz-öncesi
   durumda KIRMIZI düştüğünü göster. `vocab_source_check` için: bugünkü elle
   yazılmış `vision-student/vocab.py`'a karşı koştur → KIRMIZI olmalı.
   `vocab_reference_check` için: tabanı bir eksik referansla kur, sonra
   bugünkü ağaca koştur → KIRMIZI olmalı. Log yolları `GECE/log/` altına.
2. **MUTASYON (4.5):** her kapı için EN AZ BİR kasıtlı bozma kapıyı kırmalı,
   geri alınınca yeşile dönmeli. İki log da `GECE/log/V2-B.mutasyon.txt`'ye.
   Öneri: (a) `vision-student/vocab.py`'a elle bir kelime ekle → kırmalı;
   (b) `engine/src/` altında bir enum değerine yeni referans ekle → kırmalı.
   Mutasyonu MUTLAKA geri al; çalışma ağacı temiz bitecek.
3. **ctest tam koşusu** sonunda: `ctest --test-dir engine/build --output-on-failure`
   → miras kırmızı AD kümesi (`style_check` `sizechart_source_check`
   `contract_check` `figure_check`) BÜYÜYEMEZ (RULES 9). Log:
   `GECE/log/V2-B.ctest.after.txt`.

## YASAKLAR
- `contract/` altına YAZMA (V2-A o dosyaların sahibi — yalnız OKU).
- MEVCUT testleri değiştirme. Mevcut kırmızıları "düzeltmeye" çalışma.
- Kaynaksız eşik koyma (§5, 7.6): tolerans/eşik `GECE/V2-R.md` Bölüm 2'ye ya da
  ölçülmüş bir sayıya bağlanacak; "50 gibi olsun" YASAK.
- Yeni bağımlılık kurma (npm install / pip install) YOK. Node + python3 + shell.
- Faz başına 3 yeni kaynak dosya tavanı (7.5): senin payın yukarıdaki 4 yeni
  dosya — gerekçen `GECE/V2-B.md`'de tek cümleyle dursun.
- "Baktım / çalışıyor" yasak (RULES 3).

## SÜRE TAVANI
60 dk (dolarsa: o ana kadar ÇALIŞAN parça commit'lenir, kalan kart olur —
YARIM kapıyı ctest'e BAĞLAMA, `add_test` satırını ancak kapı yeşilse ekle)

## ETİKET
PARALEL — V2-A ile birlikte koşar; dosya kümeleri kesişmez.
