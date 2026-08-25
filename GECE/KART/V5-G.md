# KART V5-G — İKİ KURALIN ÇATIŞMASINI UZLAŞTIR (V5-F'in yarım işi)

## NE
Çalışma ağacında V5-F'in COMMIT EDİLMEMİŞ değişikliği duruyor: `draft_math_check`
yayınlanmış bant kalemlerini SERT HÜKME çevirdi ve kapı artık `exit 1`.
Bu, KIRMIZI AD KÜMESİNİ 6'dan 7'ye çıkarır = RULES 9 + fazın açık emri ihlali.
Ama V5-F'in gerekçesi DOĞRU ve hakem de bağımsız olarak aynı deliği buldu
("`hip_ease` tavanı 8/8 = DOYMUŞ, o kalem yapısal olarak asla ısıramaz").

Bu kart ikisini birden karşılar. Kural gevşetmiyoruz, ADLANDIRMAYI düzeltiyoruz.

## ETİKET
SIRALI (tek başına, son iş). SÜRE TAVANI: 40 dk.

## ŞEFİN HÜKMÜ — ÜÇ ŞART BİRDEN (tartışma yok)
1. **EXIT KODU 0 OLACAK.** `draft_math_check` ctest'te YEŞİL kalır; kırmızı AD
   kümesi 6'da kalır. V5-F'in exit-kodu hamlesi GERİ ALINIR.
2. **AMA KAPI BUNU "PASS" DİYE ADLANDIRAMAZ.** Son hüküm satırı `PASS`
   yazmayacak. Yazacağı şey, iki bölümü AYRI AYRI adlandıran dürüst cümledir,
   örneğin:
   `draft_math_check — RATCHET: 0 tavan aşımı · YAYINLANMIŞ BANT: 12 bedende
   İHLAL (DAMLA KARARINA BAĞLI, K-V5A) · exit 0`
   V5-F'in eklediği "SERT HUKUM / KIRMIZI / TAVANLANMAZ / EXIT KODUNU DÜŞÜREN
   BÖLÜM" dilini ve bant künyelerini KORU — yalnız exit kodunu geri al ve
   "exit 0, çünkü Damla kararına bağlı (v6 §4 istisnası)" gerekçesini ADIYLA bas.
3. **REGRESYON YİNE YAKALANACAK.** Bant dışı beden sayısı bugünkü kayıttan
   (bust 4, waist 0, hip 8) ARTARSA kapı `exit 1` döner. Yani kalem hem
   "ihlal var" diye bağırır hem de kötüleşmeyi durdurur. `hip_ease`'in 8/8
   doymuşluğu böyle çözülür: 8'i aşamaz ama 8'in ALTINA düşmek de ölçülür ve
   "TAVAN DÜŞÜRÜLEBİLİR" uyarısı basar.

## NEDEN BU GEVŞETME DEĞİL (v6 §4.6 — hamlenin gerekçesi)
- Bant DEĞİŞMİYOR (Threads #221 s.71 · Aldrich 4.bs s.28 aynen).
- İhlal SAYISI değişmiyor (12), her biri beden+mm+bant+künyeyle basılmaya
  devam ediyor.
- Kapı ihlali "geçti" diye ADLANDIRMIYOR — v6 §7.1'in yasakladığı tam olarak
  buydu ve bu şart onu karşılıyor.
- Kırmızının Damla'ya bağlı olduğu hâl v6 §4'ün AÇIK istisnası: kuyruğa
  3.8.d satırı düşer, koşu varsayılanla devam eder. Kuyruk satırı bu kartta
  yazılıyor (aşağıda), yani istisnanın şartı fiilen yerine getiriliyor.

## GİRDİ DOSYALARI (isim isim, başka dosya açma)
- ENV.md · RULES.md
- engine/tests/draft_math_check.mjs        (çalışma ağacında MODIFIED — V5-F'in işi)
- engine/tests/v5-ratchet-baseline.json    (çalışma ağacında MODIFIED)
- GECE/KART/V5-F.md
- GECE/log/V5-D.remedy.txt                 (ölçülmüş çözüm adayları)
- GECE/log/V5-F.mutasyon.txt
- GECE/log/V5.ctest.opening.txt            (faz-öncesi kırmızı AD kümesi — 6 ad)

## YAPILACAK
1. Yukarıdaki üç şartı `engine/tests/draft_math_check.mjs` ve
   `engine/tests/v5-ratchet-baseline.json` üzerinde uygula.
   `sewability_check.mjs`'e DOKUNMA. `engine/src/` altına DOKUNMA.
   `engine/CMakeLists.txt`'e DOKUNMA (iki add_test zaten var).
2. §4.5 MUTASYON: bant dışı beden sayısını ARTIRAN bir bozma → kapı exit 1;
   geri al → exit 0. Log: `GECE/log/V5-G.mutasyon.txt`. Isırmıyorsa YAZ.
3. TAM `ctest --test-dir engine/build --output-on-failure` koş (~330 sn, bütçele).
   Log: `GECE/log/V5-G.ctest.after.txt`. Kırmızı ADLARI
   `GECE/log/V5.ctest.opening.txt` ile karşılaştır → `GECE/log/V5-G.reddiff.txt`.
   **Sonuç 113 test / 6 kırmızı / AYNI 6 AD olmalı.** Değilse GERİ AL ve YAZ.
4. `DAMLA-KUYRUK.md` dosyasının SONUNA (yoksa oluştur) 3.8.d formatında ekle:
   - KARAR GEREKEN: sevk edilen kalıbın kalça payı 8/8 bedende, göğüs payı
     4/8 bedende yayınlanmış minimumun ALTINDA. Düzeltilsin mi?
   - SEÇENEKLER: (A) bugünkü pay kalsın, kapı ihlali adıyla basmaya devam
     etsin, exit 0 · (B) ölçülmüş çözüm uygulansın (büst girdisi +1.5cm →
     8/8 bantta; kalça +3.5..+5.0cm → 8/8 bantta, `GECE/log/V5-D.remedy.txt`)
     — ⚠ BEDELİ ÖLÇÜLMEDİ: sevk edilen geometri değişir, `golden_check` ve
     figür/önizleme mandalları etkilenir (RULES 4).
   - VARSAYILAN: (A)
   - HANGİ FAZI ETKİLER: V7
   Kuyruk satırının adı **K-V5A** olsun (test çıktısı bu ada atıf veriyor).

## YASAKLAR
- Bandı DARALTMA/GENİŞLETME. Künyeleri değiştirme. İhlal listesini kısaltma.
- Bugünkü kayıt sayılarını (4/0/8) GERÇEK ölçümden büyük yazma.
- `engine/src/` değiştirme, mevcut testleri değiştirme, yeni bağımlılık.
- `patterns_real/` PDF'lerine dokunma.

## ÇIKTI
- `engine/tests/draft_math_check.mjs` · `engine/tests/v5-ratchet-baseline.json`
- `DAMLA-KUYRUK.md` (K-V5A satırı)
- `GECE/log/V5-G.{mutasyon,ctest.after,reddiff}.txt`
- `GECE/V5-G.md` — yapılan (yol + hash) · ölçülen (sayı + komut) ·
  yapılamayan (sebep) · kart dışı fark edilen.
Bitince commit at (lowercase english), hash'i rapora yaz.
