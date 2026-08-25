# KART V5-F — YAYINLANMIŞ BANT RATCHET'LENEMEZ (§7.1 düzeltmesi)

## NE
`draft_math_check` bugün `PASS` basıyor. Ama (b) bölümündeki `hip_ease`
**8/8 bedende YAYINLANMIŞ bir minimumun altında** ve `bust_ease` 4/8 bedende
bandın dışında. Yayınlanmış bandı tavanlayıp yeşil basmak §7.1'in tanımı
gereği "kapıyı gevşeterek geçmek"tir. Bu kart o bölümü SERT HÜKME çevirir.

## ETİKET
SIRALI (V5-E'den sonra, tek başına). SÜRE TAVANI: 45 dk.

## AYRIM — RATCHET NEREDE MEŞRU, NEREDE DEĞİL (şefin hükmü, tartışma yok)
- (a) NOKTA-DEĞERLİ KALEMLER (`scye_depth`, `shoulder_width_front/back`,
  `back_neck_drop`): toleransı YAYINLANMAMIŞ (V5-R §A). Yayınlanmış bir eşik
  yokken tek dürüst kapı "bugünkü sapma tavan, yalnız düşebilir"dir.
  → **RATCHET KALIR, DOKUNMA.**
- (b) YAYINLANMIŞ BANT KALEMLERİ (`bust_ease`, `waist_ease`, `hip_ease`):
  bandın kaynağı VAR (Threads #221 s.71 · Aldrich 4.bs s.28) ve kalıp
  bandın DIŞINDA. Burada tavan koymak, yayınlanmış bir hükmü susturmaktır.
  → **SERT HÜKÜM: bant dışı beden > 0 ise exit 1.**
- `sewability_check`'e DOKUNMA: onun tek kırmızısının eşiği (0.79375mm)
  kendi başlığında "ev değeri, YAYIN YOK" diye ilan edilmiş; orada ratchet
  meşrudur.

## GİRDİ DOSYALARI (isim isim, başka dosya açma)
- ENV.md · RULES.md
- engine/tests/draft_math_check.mjs
- engine/tests/v5-ratchet-baseline.json
- GECE/log/V5-D.remedy.txt          (ölçülmüş çözüm adayları — §4.7 için)
- GECE/log/V5-E.reddiff.txt · GECE/log/V5-E.ctest.after.txt
- engine/CMakeLists.txt (SADECE OKU — add_test zaten eklendi, DOKUNMA)

## YAPILACAK
1. `draft_math_check.mjs`'de (b) bölümünü sert hükme çevir: `bust_ease`,
   `waist_ease`, `hip_ease` için bant dışı beden sayısı > 0 ise exit 1.
   Bandın SAYISINA DOKUNMA (63.5..101.6 · 25.4..60 · 50.8..76.2 aynen kalır).
   (a) ve (c) bölümleri ratchet olarak AYNEN kalır.
2. `v5-ratchet-baseline.json`'da (b) kalemlerinin tavan kayıtlarını SİLME —
   `"statu": "SERT HUKUM, ratchet DEGIL"` gibi bir alanla işaretle ve
   gerekçeyi (yayınlanmış bant var) yaz. Kayıt tarih/künye taşımaya devam etsin.
3. Kapının SON hüküm satırı ikiye ayrılsın ve İKİSİ DE bassın:
   - `RATCHET: N tavan aşımı` (a/c bölümü)
   - `YAYINLANMIŞ BANT: M bedende ihlal` (b bölümü)
   Hangi bölümün exit kodunu düşürdüğü ADIYLA yazılsın.
4. §4.5 MUTASYON, sert hüküm İÇİN: `waist_ease` bugün 0/8 (bant içinde) —
   onu bandın dışına iten bir bozma kapıyı KIRMALI ve geri alınca hüküm
   AYNEN dönmeli. Log: `GECE/log/V5-F.mutasyon.txt`. Ayrıca (a) bölümünün
   ratchet'inin HÂLÂ ısırdığını bir bozmayla göster.
5. TAM `ctest --test-dir engine/build --output-on-failure` koş
   (`-DCMAKE_BUILD_TYPE=Release` şart, rebuild gerekirse).
   Log: `GECE/log/V5-F.ctest.after.txt`.
   Kırmızı AD kümesini `GECE/log/V5.ctest.opening.txt` ile karşılaştır →
   `GECE/log/V5-F.reddiff.txt`.
   **BEKLENEN: tam olarak BİR yeni kırmızı ad — `draft_math_check`.**
   Başka yeni ad çıkarsa GERİ AL ve raporda ADIYLA yaz.
   ⚠ Bu yeni kırmızı BİLEREK ve İLAN EDİLEREK açılıyor (§4.7). Bu yüzden
   raporunda ŞU ÜÇÜ zorunlu: kök teşhis · en az bir ÖLÇÜLMÜŞ çözüm adayı ·
   o adayın ölçülmüş BEDELİ (hangi bugün-yeşil testler risk altında).
   `GECE/log/V5-D.remedy.txt` ikisini de taşıyor, komutu yeniden koştur.

## YASAKLAR
- BANDI GENİŞLETME / DARALTMA. Sayı uydurma. Kaynağı değiştirme.
- `engine/src/` altında kaynak DEĞİŞTİRME. Kırmızıyı "düzeltmek" için
  gövde girdisini kaydırma — o bir DAMLA kararıdır, bu kartın işi değil.
- `sewability_check.mjs`'e dokunma. Mevcut testleri değiştirme.
- `engine/CMakeLists.txt`'e dokunma (add_test zaten var).
- `patterns_real/` PDF'lerine dokunma. Yeni bağımlılık kurma.
- Kırmızıyı gizleme/yumuşatma. "Neredeyse geçti" YASAK.

## ÇIKTI
- `engine/tests/draft_math_check.mjs` · `engine/tests/v5-ratchet-baseline.json`
- `GECE/log/V5-F.{mutasyon,ctest.after,reddiff}.txt`
- `GECE/V5-F.md` — yapılan (yol + hash) · ölçülen (sayı + komut) ·
  yapılamayan (sebep) · kart dışı fark edilen.
"Baktım / doğru görünüyor" YASAK (RULES 3).
Bitince commit at (lowercase english), hash'i rapora yaz.
