# V5-G — İKİ KURALIN ÇATIŞMASI UZLAŞTIRILDI (V5-F'in yarım işi banklandı)

## YAPILAN (dosya yolu + hash)

commit: `b46092d` — `reconcile draft_math band verdict: honest naming, exit 0, regression line`

- `engine/tests/draft_math_check.mjs` — üç şart uygulandı:
  1. **EXIT KODU 0.** V5-F'in "bant dışı > 0 ise exit 1" hamlesi GERİ ALINDI.
     Kırmızı ad kümesi 6'da kaldı (RULES 9).
  2. **KAPI BUNU "PASS" DİYE ADLANDIRMIYOR.** Son hüküm satırı artık:
     `draft_math_check — RATCHET: 0 tavan aşımı · YAYINLANMIŞ BANT: 12 bedende
     İHLAL (DAMLA KARARINA BAĞLI, K-V5A) · BANT REGRESYONU: 0 · adıyla basılan
     ihlal satırı 12 · exit 0`
     V5-F'in "SERT HUKUM / KIRMIZI / TAVANLANMAZ / EXIT KODUNU DÜŞÜREN BÖLÜM"
     dili ve bant künyeleri AYNEN korundu. Yeni: `EXIT KODUNU DÜŞÜRMEYEN
     KIRMIZI` bloğu, "exit 0, ÇÜNKÜ kapanması bir ÖLÇÜM değil bir DAMLA KARARI
     — v6 §4 istisnası, kuyruk satırı DAMLA-KUYRUK.md K-V5A" gerekçesini
     ADIYLA basıyor.
  3. **REGRESYON YİNE YAKALANIYOR.** `BANT REGRESYONU` diye üçüncü bir hüküm
     satırı eklendi: bant dışı beden sayısı 2026-08-25 kaydından (bust 4 ·
     waist 0 · hip 8) ARTARSA exit 1. Sayı kaydın ALTINA düşerse
     `TAVAN DÜŞÜRÜLEBİLİR` uyarısı basar.
- `engine/tests/v5-ratchet-baseline.json` — `bantDisiKayit` SİLİNMEDİ, statü/
  künye/gerekçe/ölçüm tarihi korundu; üstüne `_regresyonCizgisi`, `_yasa`'ya
  V5-G uzlaşma maddesi ve her kaleme `exitKodu_V5G` eklendi. **Bant SAYILARINA
  DOKUNULMADI** (63.5..101.6 · 25.4..60 · 50.8..76.2 aynen).
- `DAMLA-KUYRUK.md` — **K-V5A** satırı eklendi (3.8.d formatı, varsayılan (A),
  etkilediği faz V7).
- `GECE/log/V5-G.mutasyon.txt` · `GECE/log/V5-G.ctest.after.txt` ·
  `GECE/log/V5-G.reddiff.txt`

DOKUNULMAYAN (kartın emri): `sewability_check.mjs`, `engine/src/`,
`engine/CMakeLists.txt`, `patterns_real/`. Yeni bağımlılık YOK.

## ÖLÇÜLEN (sayı + onu basan komut)

**`ctest --test-dir engine/build --output-on-failure`** (326.65 sn):
`95% tests passed, 6 tests failed out of 113`.
Kırmızı adlar — `GECE/log/V5-G.reddiff.txt`, diff **BOŞ**:
`contract_check · figure_check · flat_artifact_census ·
flat_pattern_agree_check · sizechart_source_check · style_check`
Açılış (`GECE/log/V5.ctest.opening.txt`) ile **BİREBİR AYNI**. Yeni kırmızı ad
YOK, kaybolan kırmızı ad YOK. (111 -> 113 farkı, V5-E/V5-F'in
`engine/CMakeLists.txt:140-141`'e eklediği iki `add_test`; bu kartta o dosyaya
dokunulmadı.)

**`draft_math_check` ctest'te:** `11/114 Test #11: draft_math_check ... Passed 0.10 sec`.

**`node engine/tests/draft_math_check.mjs`**: exit 0. Aynı çıktıda
`grep -c PASS` = **0** — 'PASS' kelimesi hiç geçmiyor.
RATCHET 0 tavan aşımı · YAYINLANMIŞ BANT 12 ihlal (bust 4/8 + hip 8/8, her biri
beden+mm+bant+künyeyle ayrı satır) · BANT REGRESYONU 0.

**MUTASYON** (`GECE/log/V5-G.mutasyon.txt`, komut
`V5D_MUTATE=... node engine/tests/draft_math_check.mjs`):

| koşu | RATCHET | BANT İHLAL | REGRESYON | exit | düşüren bölüm |
|---|---|---|---|---|---|
| M0 üretim (kanca yok) | 0 | 12 | 0 | **0** | YOK |
| M1 `bust_ease:-5` (4→5) | 0 | 13 | 1 | **1** | BANT REGRESYONU (b) |
| M2 `waist_ease:20` (0→8) | 0 | 20 | 1 | **1** | BANT REGRESYONU (b) |
| M3 `hip_ease:35` (8→0) | 0 | 4 | 0 | **0** | YOK + TAVAN DÜŞÜRÜLEBİLİR |
| M4 `scye_depth:5` | 1 | 12 | 0 | **1** | RATCHET (a/c) |
| B0 geri alma | 0 | 12 | 0 | **0** | YOK |

B0: üretim çıktısı mutasyondan önce/sonra **bayt bayt aynı** (diff BOŞ).
M1 ısırıyor = tek bedenlik kötüleşme kapıyı kırıyor. M4 = (a) ratchet hâlâ
ısırıyor ve exit kodunu düşüren bölüm doğru adlandırılıyor.

## YAPILAMAYAN (sebep)

- **`hip_ease`'te KÖTÜLEŞME hâlâ ölçülemiyor.** Regresyon çizgisi 8, `SIZES.length`
  de 8 — yukarı yön yapısal olarak kapalı, hiçbir mutasyon 8'i aşamaz. Kartın
  çözdüğü şey AŞAĞI yön: M3'te 8→0 ölçüldü ve `TAVAN DÜŞÜRÜLEBİLİR` basıldı,
  yani kalem artık iyileşmeyi görüyor. Ama "hip_ease ısırıyor" cümlesi yalnız
  iyileşme yönünde doğrudur; bu mutasyon logunda ADIYLA yazıldı, gizlenmedi.
- **Kırmızı KAPATILMADI.** Bant dışı 12 beden duruyor. Kapatmak gövde girdisini
  kaydırmak demek = Damla kararı (K-V5A), bu kartın işi değil; (B) seçeneğinin
  bedeli (golden/figür/önizleme mandalları) ÖLÇÜLMEDİ.

## KART DIŞI FARK EDİLEN

1. **`waist_ease` bandı mutasyona hâlâ geniş.** V5-F kaydı ölçmüştü: yakalandığı
   eşik +20mm; ±5mm'lik bir kayma bandın içinde kalıyor. Bant YAYINDAN geldiği
   için daraltılmadı — ama bu, `waist_ease` kaleminin küçük regresyonlara **kör**
   olduğu anlamına gelir. Bugünkü 0/8'i bir güvence sanmayın.
2. **`GECE/log/V5-F.ctest.after.txt` ve `GECE/log/V5-F.mutasyon.txt` ağaçta
   untracked duruyordu**; V5-F kartı commit atmamış. İkisi de bu commit'e
   girdi — V5-F'in ölçümü kaybolmasın diye (mutasyon logu V5-F'in exit-1
   halinin kanıtı, geri alınan hamlenin tarihsel kaydı).
3. **`GECE/log/V5-D.remedy.txt` KART DIŞI bölümü hâlâ açık:** `body.shoulder`
   (contract `shoulderCM`) draftJSON kalıp geometrisinde **ÖLÜ GİRDİ** —
   10..80cm arası değiştirildiğinde tek bir kalıp koordinatı kımıldamıyor
   (komut: `node /tmp/sd3.mjs`, o script /tmp'de ve muhtemelen artık yok, yani
   bu kalem YENİDEN KOŞULMADI, V5-D'nin kaydından alındı). Bu kolon aynı zamanda
   `sizechart_source_check`'in kırmızı saydığı 4 kaynaksız kolondan biri.
