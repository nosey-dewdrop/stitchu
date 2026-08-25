# V5-H — MAGNİTÜD KÖRLÜĞÜ KAPATILDI (+ ikinci kör yön)

Kart: `GECE/KART/V5-H.md` · SIRALI · 2026-08-25.
Bu bir **SIKILAŞTIRMA** kartıdır: hiçbir eşik, bant ya da kayıt gevşetilmedi;
kapının **yakaladığı bozma kümesi** genişletildi. Kapı önce de sonra da `exit 0`.

## YAPILAN

| dosya | ne |
|---|---|
| `engine/tests/draft_math_check.mjs` | (b)'ye **magnitüd çizgisi**, (a)'ya **beden başına çizgi**, `--write-baseline`, `V5D_MUTATE=ad@BEDEN:mm` |
| `engine/tests/v5-ratchet-baseline.json` | `sapmaTavaniPerBedenMM` (8 beden × 4 kalem) + `bantDisiKayit.*.olculenBantDisiEnKotuMM_2026_08_25`, hepsi künyeli |
| `GECE/log/V5-H.mutasyon.txt` | §4.5 mutasyon kanıtı, 6 bölüm |
| `GECE/log/V5-H.ctest.after.txt` | tam ctest koşusu |
| `GECE/log/V5-H.reddiff.txt` | kırmızı AD kümesi kıyası |

Commit: `989ff2e`.

### 1) (b) YAYINLANMIŞ BANT — İKİNCİ ÇİZGİ: MİLİMETRE

Hakemin ölçtüğü körlük: (b) yalnız bant dışı **BEDEN SAYISINI** ölçüyordu.
`hip_ease` 8/8 = **doymuş**, yani sayı yapısal olarak **asla artamaz** → o kalem
sınırsız kötüleşebiliyordu ve kapı ısırmıyordu.

Artık her ease kalemi **iki** çizgi taşıyor:
- bant dışı **BEDEN SAYISI** (V5-G, değişmedi: bust 4 · waist 0 · hip 8)
- bant dışına **EN KÖTÜ mm SAPMASI** (yeni; bant içindeyse 0)

İkisinden biri kayıttan artarsa `exit 1`. Bant sayıları (63.5..101.6 · 25.4..60
· 50.8..76.2) ve 12 ihlalin adıyla basılması **aynen** duruyor.

### 2) (a) NOKTA-DEĞERLİ KALEMLER — BEDEN BAŞINA ÇİZGİ

Kartın işaret ettiği ikinci (ölçülmemiş, yapısal) kör yön: ratchet 8 bedenin
yalnız **maksimum** sapmasını donduruyordu. `scye_depth` EU34 11.4 → EU48 7.4mm
yayıldığı için **EU48 4mm bozulup maksimum tavana değmeden geçebiliyordu.**
Artık `sapmaTavaniPerBedenMM` ile her beden kendi çizgisini taşıyor.
Maksimum tavan **silinmedi**, çizgi onun **üstüne** eklendi.

### 3) SAYI ELLE YAZILMADI

`node engine/tests/draft_math_check.mjs --write-baseline` — kayıt dosyasını
koşunun kendisi üretti. İki koruma: (i) mevcut bir çizgi varsa `min(mevcut, bugün)`
yazılır, kayıt **asla gevşeyemez**; (ii) `V5D_*` kanıt kancalarından biri aktifken
bayrak **reddedilir** (mutasyonlu sayı kayda geçemez — mutasyon logu §6'da ölçüldü).
Yazılan sayılar bayraksız yeniden koşturularak doğrulandı: `diff` **boş**.

## ÖLÇÜLEN

Basan komut (hepsi): `node engine/tests/draft_math_check.mjs`

**Bugünün kayda geçen sayıları — bant dışı EN KÖTÜ mm**

| kalem | bant (mm) | bant dışı beden | bant dışı en kötü mm | nerede |
|---|---|---|---|---|
| `bust_ease` | 63.5..101.6 | 4/8 | **14.3500** | EU34 |
| `waist_ease` | 25.4..60 | 0/8 | **0.0000** | — |
| `hip_ease` | 50.8..76.2 | 8/8 | **33.6000** | EU34 |

**Beden başına sapma çizgisi (mm)**

| kalem | EU34 | EU36 | EU38 | EU40 | EU42 | EU44 | EU46 | EU48 | eski tek tavan |
|---|---|---|---|---|---|---|---|---|---|
| `scye_depth` | 11.40 | 10.70 | 10.00 | 9.60 | 8.90 | 8.20 | 7.80 | 7.40 | 11.4 |
| `shoulder_width_front` | 8.29 | 8.29 | 8.29 | 8.30 | 8.30 | 8.30 | 8.30 | 8.05 | 8.2988 |
| `shoulder_width_back` | 18.17 | 18.18 | 18.18 | 18.18 | 18.18 | 18.18 | 18.18 | 17.93 | 18.1823 |
| `back_neck_drop` | 5.40 | 5.70 | 6.00 | 6.60 | 6.90 | 7.20 | 7.80 | 8.40 | 8.4 |

★ Tablo tek başına yeni bir bulgu daha basıyor: `scye_depth`'in sapması bedenle
**küçülürken** `back_neck_drop`'unki **büyüyor** (5.40 → 8.40mm) — ikincisi
`v5-ratchet-baseline.json`'da zaten adlandırılmış SINIF hatasının (Aldrich sabit
1.5cm der, motor `0.6 × yakaCM` ile graduate ediyor) beden ekseninde görünür hali.
Maksimum tavan bu iki eğilimi de tek sayıya çöktürüyordu.

**§4.5 MUTASYON — `GECE/log/V5-H.mutasyon.txt`** (kart md.5, dördü de kart neyi
istiyorsa onu döndürdü)

| # | mutasyon | önce | şimdi | düşüren bölüm |
|---|---|---|---|---|
| 1 | `V5D_MUTATE=hip_ease:-15` | exit 0 | **exit 1** | BANT REGRESYONU — hip mm 33.6000 → **48.6000** > kayıt 33.6000 |
| 2 | `V5D_MUTATE=bust_ease:-3` | exit 0 | **exit 1** | BANT REGRESYONU — bust mm 14.3500 → **17.3500** > kayıt 14.3500 |
| 3 | `V5D_MUTATE=scye_depth@EU48:4` (TEK beden) | exit 0 | **exit 1** | BEDEN BAŞINA RATCHET — EU48 7.40 → **11.40** > çizgi 7.40 |
| 4 | hepsi geri alındı | — | **exit 0**, `diff` BOŞ | — |

3 numarada `(a)` satırı hâlâ `scye_depth en kötü 11.4000 mm / tavan 11.40 mm →
GEÇTİ` basıyor: **eski kapı bu bozmayı yakalamıyordu**, düşüren yalnız yeni (a2).

**İhlal listesi kısalmadı:** beden-bazlı `FAIL EU*` satırı **12**, son hüküm
`adıyla basılan ihlal satırı 12`, ve son hüküm satırı hâlâ `PASS` demiyor.

**TAM CTEST** — `ctest --test-dir engine/build --output-on-failure`
(`engine/build/CMakeCache.txt: CMAKE_BUILD_TYPE=Release`, doğrulandı)
→ `GECE/log/V5-H.ctest.after.txt`: **95% tests passed, 6 tests failed out of 113**,
374.79 sn. `draft_math_check` **Passed** (0.14 sn).

**KIRMIZI AD KÜMESİ** — `GECE/log/V5-H.reddiff.txt`: diff **BOŞ**, aynı 6 ad
(`contract_check` · `figure_check` · `flat_artifact_census` ·
`flat_pattern_agree_check` · `sizechart_source_check` · `style_check`).
Kıyas AD üstünden yapıldı, sıra numarası üstünden değil (RULES 9).

## YAPILAMAYAN

- **Kırmızının kendisi kapanmadı** — kapanmıyor da: 12 ihlalin çözümü gövde
  girdisini kaydırmak, o bir DAMLA kararı (`DAMLA-KUYRUK` K-V5A). Bu kart onu
  kapatmayı değil, **derinleşmesini durdurmayı** üstlendi.
- **`hip_ease`'in yapısal doymuşluğu SAYI tarafında hâlâ duruyor.** 8/8 =
  `SIZES.length`, yukarı yön kapalı. Kart bunu mm çizgisiyle kapattı, ama beden
  sayısı çizgisi o kalemde hâlâ ısırmaz — raporda ADIYLA yazılıyor.
- **`waist_ease` bandı geniş kalmaya devam ediyor.** ±5mm mutasyonuna kör
  (yakalandığı eşik +20mm, V5-F ölçümü). Yeni mm çizgisi bunu **kısmen** kapatıyor:
  bugün 0.0000mm olduğu için bandın dışına **tek mm** taşan bir bozma artık
  `exit 1` düşürür — yani `waist_ease` kaleminde kapı, bant genişliği kadar değil
  **sıfır tolerans** kadar keskin. Bant DARALTILMADI (yayından geliyor).
- Kart dışı olduğu için **hiçbir kaynak dosyaya dokunulmadı** (`engine/src/`,
  `engine/CMakeLists.txt` salt okundu, `sewability_check.mjs` açılmadı).

## KART DIŞI FARK EDİLEN

1. **`draft_math_check` faz-öncesi ctest logunda YOK.** `GECE/log/V5.ctest.opening.txt`
   içinde adı hiç geçmiyor (grep boş) — kapı V5-D ile sonradan eklenmiş. Yani
   "kırmızı AD kümesi büyümedi" hükmü bu kapı için baştan geçerliydi, ama
   **opening log artık ctest'in tamamını temsil etmiyor**: 111 → 113 test.
   İki yeni test bu kartın işi DEĞİL (`engine/CMakeLists.txt`'e dokunulmadı),
   paralel işçilerin. Sonraki kartlar opening log'u kıyas tabanı olarak
   kullanmaya devam ederse **test sayısı** üstünden hüküm kurmasınlar; yalnız
   **AD kümesi** güvenli.
2. **`v5-ratchet-baseline.json` yeniden serileştirildi.** `--write-baseline`
   `JSON.stringify(…, 2)` kullandığı için üç `bantMM` dizisi tek satırdan üç
   satıra açıldı ve `60.0` → `60` oldu (JSON'da aynı sayı). İçerik kaybı YOK,
   diff'te 7 "silme" satırının tamamı bu biçim değişikliği. Bundan sonra bu
   dosyayı **elle** biçimlendiren bir commit, bir sonraki `--write-baseline`
   koşusunda gürültülü diff üretecek.
3. **`shoulder_width_front/back` EU48'de kırılıyor.** Sapma EU34..EU46 boyunca
   bit-sabit denecek kadar düz (8.29→8.30 / 18.17→18.18) ama EU48'de aniden
   **8.05 / 17.93**'e düşüyor. Sebep büst 108'in Aldrich s.11 tablosunda
   olmaması ve EU48'in **110** satırına düşmesi olabilir — **DOĞRULANMADI**,
   ölçülmedi, bu kartın konusu değildi. Kontrol edilecekse: `contract/tables.json`
   EU48 `bustCM` ile `ALDRICH_P11` anahtarları.
4. **`armhole_circumference` 8 bedenin 8'inde de kendi ölçüm bandının DIŞINDA.**
   374.20 (EU34) … kapı "BİLGİ, HÜKÜM DEĞİL" diye basıyor ve hiçbir çizgiye
   bağlı değil — yani bu kalem **bugün tamamen bekçisiz**. Kartın kapsamı
   dışındaydı; bir sonraki sıkılaştırma kartı için en açık hedef bu.
5. Mutasyon kancasına eklenen `@BEDEN` sözdizimi geriye dönük uyumlu
   (`ad:mm` aynen çalışıyor) ve üretim koşusunda hiçbiri set edilmiyor;
   set edilirse başlıkta `⚠ KANIT KANCASI AKTİF` basılıyor (eski davranış).
