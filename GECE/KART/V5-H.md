# KART V5-H — HAKEMİN ★ AÇIK KALEMİ: MAGNİTÜD KÖRLÜĞÜNÜ KAPAT

## NE
`draft_math_check`'in (b) YAYINLANMIŞ BANT bölümü **bant dışı BEDEN SAYISINI**
ölçüyor, **MİLİMETREYİ değil**. Hakem ölçtü: zaten ihlalli bir kalem
SINIRSIZ kötüleşebiliyor ve kapı ısırmıyor. Bu kart o körlüğü kapatır.

## ETİKET
SIRALI (tek başına). SÜRE TAVANI: 40 dk.

## HAKEMİN ÖLÇTÜĞÜ KANIT (VERİ olarak al, yeniden arama)
- `V5D_MUTATE=hip_ease:-15` → pay `17.2..23.2mm` → `2.2..8.2mm` (yayınlanmış
  minimumun ~1/12'si, felaket kötüleşme) · bant dışı beden **8/8 SABİT** →
  `BANT REGRESYONU: 0` → **exit 0**. Kapı ısırmadı.
- `V5D_MUTATE=bust_ease:-3` → EU34 `49.15 → 46.15mm` · sayı **4/8 sabit** →
  **exit 0**. Aynı körlük.
- `hip_ease` tavanı **8/8 = DOYMUŞ**: yapısal olarak asla ısıramaz.
- İKİNCİ KÖR YÖN (hakem, yapısal çıkarım, ÖLÇÜLMEMİŞ): (a) bölümünün
  ratchet'i 8 bedenin yalnız MAKSİMUM sapmasını donduruyor; `scye_depth`
  EU34 11.4 → EU48 7.4mm yayılıyor, yani EU48 4mm bozulup tavana değmeden
  geçebilir.

## GİRDİ DOSYALARI (isim isim, başka dosya açma)
- ENV.md · RULES.md
- engine/tests/draft_math_check.mjs
- engine/tests/v5-ratchet-baseline.json
- GECE/log/V5.ctest.opening.txt   (faz-öncesi kırmızı AD kümesi — kıyas için)
- engine/CMakeLists.txt (SADECE OKU — DOKUNMA)

## YAPILACAK
1. (b) bölümüne İKİNCİ bir regresyon çizgisi ekle: kalem başına **bandın
   dışına en kötü mm sapması** (bant içindeyse 0). Bugünkü değer kayda
   yazılır ve **artarsa exit 1**. Yani (b) artık İKİ şeyi birden bekçilik
   eder: bant dışı beden SAYISI ve bant dışı en kötü MİLİMETRE.
2. (a) bölümündeki kör yönü de kapat: ratchet tavanı 8 bedenin
   MAKSİMUMU yerine **BEDEN BAŞINA** kaydedilsin (8 sayı), her biri kendi
   tavanını aşarsa exit 1. Bu bir SIKILAŞTIRMADIR, gevşetme değil.
3. Sayıları ELLE YAZMA: kayıt dosyasını bugünkü koşunun kendisi üretsin
   (`--write-baseline` gibi bir bayrak) ya da koşunun çıktısından birebir
   alınsın; aldığın her sayıyı komutu yeniden koşturarak doğrula.
4. Kayıt dosyasındaki her yeni alan künye taşısın: ölçüm tarihi, basan komut,
   ne olduğunun tek cümlesi.
5. §4.5 MUTASYON — bu kartın eklediği İKİ bekçi için ayrı ayrı:
   - `V5D_MUTATE=hip_ease:-15` artık **exit 1** dönmeli (mm regresyonu);
   - `V5D_MUTATE=bust_ease:-3` artık **exit 1** dönmeli;
   - (a) tarafında yalnız TEK bedeni bozan bir mutasyon **exit 1** dönmeli;
   - hepsi geri alınınca **exit 0** ve sayılar BİREBİR dönmeli (`diff` boş).
   Log: `GECE/log/V5-H.mutasyon.txt`. Isırmıyorsa YAZ, gizleme.
6. TAM `ctest --test-dir engine/build --output-on-failure` koş
   (`-DCMAKE_BUILD_TYPE=Release` şart). Log: `GECE/log/V5-H.ctest.after.txt`.
   Kırmızı AD kümesini `GECE/log/V5.ctest.opening.txt` ile karşılaştır →
   `GECE/log/V5-H.reddiff.txt`. **Fark BOŞ olmalı** (aynı 6 ad).
   Boş değilse GERİ AL ve raporda ADIYLA yaz.

## YASAKLAR
- BANDI ya da EŞİĞİ değiştirme (63.5..101.6 · 25.4..60 · 50.8..76.2 ·
  Aldrich s.11 tablosu). Sayı uydurma.
- Kaydı bugünkü ölçümden GEVŞEK yazma. Kayıt = bugün basılan sayı.
- İhlal listesini kısaltma/gizleme. 12 ihlal ADIYLA basılmaya devam etsin.
- `engine/src/` altında kaynak DEĞİŞTİRME. `sewability_check.mjs`'e dokunma.
- `engine/CMakeLists.txt`'e dokunma. Mevcut testleri değiştirme.
- `patterns_real/` PDF'lerine dokunma. Yeni bağımlılık kurma.

## ÇIKTI
- `engine/tests/draft_math_check.mjs` · `engine/tests/v5-ratchet-baseline.json`
- `GECE/log/V5-H.{mutasyon,ctest.after,reddiff}.txt`
- `GECE/V5-H.md` — yapılan (yol + hash) · ölçülen (sayı + komut) ·
  yapılamayan (sebep) · kart dışı fark edilen.
"Baktım / doğru görünüyor" YASAK (RULES 3).
Bitince commit at (lowercase english), hash'i rapora yaz.
