# V3-C — ÜÇ KANAT KAPISI: sonuç, sayılarla

Tarih: 2026-08-24 · Beden: EU38 · Kapılar kuruldu, KIRMIZI düştü, **düzeltilmedi, raporlandı.**
Dokunulan: `engine/tests/` (2 yeni dosya) · `engine/CMakeLists.txt` (2 `add_test`) · `GECE/log/` · bu dosya.
`engine/src/` ve `engine/tools/` altına DOKUNULMADI.

---

## ÖZET — ÜÇ KANADIN HÜKMÜ

| kanat | test | hüküm | sayı |
|---|---|---|---|
| (a) flat ↔ kalıp uyumu | `flat_pattern_agree_check` | **KIRMIZI** | 4 ihlal: 1 tolerans aşımı + 3 UNMEASURED |
| (b) artefakt sayımı | `flat_artifact_census` | **KIRMIZI** | 6 dejenere segment |
| (c) eğrilik sürekliliği | `flat_artifact_census` (sınıf 3) | **KIRMIZI** | 2 × 20.5602° teğet kırığı (eşik 1.0°) |

Kapılar `ctest --test-dir engine/build -N` listesinde **#8 flat_pattern_agree_check** ve
**#9 flat_artifact_census** olarak görünüyor (toplam 111 test).

---

## KANAT (a) — FLAT ↔ KALIP UYUMU

Komut: `node engine/tests/flat_pattern_agree_check.mjs`

```
ölçü                        flat mm     kalıp mm    fark mm    fark %
hem_circumference         1295.6000    1295.4506    -0.1494   -0.0115
bust_circumference         754.7482         null          —         —
waist_circumference        725.0000     724.8907    -0.1093   -0.0151
body_length                743.5050     728.7870   -14.7180   -1.9795   ← KIRMIZI
neck_opening_width         349.8211         null          —         —
shoulder_width             334.5680         null          —         —
UNMEASURED sayısı: 3/6
```

### Eşiğin kaynağı — DÜRÜST BEYAN
**%1.5 YAYINDAN DEĞİL, KARARDAN.** `GECE/V3-R.md` EŞİK 2'nin hükmü: *"Yayınlanmış formül
YOK. %1.5'i 'sanayi standardı' diye YAZMA — hiçbir kaynak desteklemiyor."* Technical flat ile
kalıp arasında sayısal ölçü uyumu şartı koyan hiçbir standart bulunamadı (ASTM D5585 bir
VÜCUT ÖLÇÜSÜ tablosudur; sanayi QC toleransı POM başına MUTLAK verilir, yüzde değil).
Gerekçe (kaynak değil): üretim toleransımız 0.79375mm bir bel halkasında %0.113, 50mm'lik
segmentte %1.588; ticari QC pratiği ~%2.38 (zayıf kaynak). %1.5 ikisinin arasında duruyor.
Bu cümle testin dosya başlığında da aynen yazılı.

### KIRMIZI 1 — `body_length` %1.98
Flat 743.5050mm, kalıp 728.7870mm, fark **−14.7180mm = −%1.9795**.
**KÖK TEŞHİS:** iki hat giysinin boyunu iki AYRI yerden ölçüyor.
`shellprojection.cpp:125-126` boyu `shoulder.h − hemZ` diye 3B kabuğun DİKEY farkından alıyor
(izdüşüm). Kalıp tarafı ise açılmış panelin gerçek KENAR yay uzunluğunu ölçüyor. Kabuk yan
tarafta içeri-dışarı gittiği için kenar, dikey farktan uzundur — ama burada kalıp DAHA KISA
çıkıyor, yani fark yalnızca eğrilikten gelmiyor.
**ÖLÇÜLMÜŞ ÇÖZÜM ADAYI (§4.7):** `shellprojection.cpp` zaten her koşu için `polyLenMM` ve
`fitLenMM` basıyor; EU38 front dört koşunun `polyLenMM` toplamı
**198.0449 + 142.6793 + 211.2910 + 206.1376 = 758.1528mm**. Bu, kabuğun silüet KENARI boyunca
ölçülen boyu — kalıbın ölçtüğü cinsten. `body_length`'i dikey farktan değil bu toplamdan
üretmek, iki tarafı aynı büyüklüğü ölçer hale getirir. (758.1528 vs 728.7870 = %4.03 — yani
bu tek başına kapıyı KAPATMIYOR, ama ölçülen farkı "elma-armut" olmaktan çıkarıyor;
kalan %4'ün ayrıca ayrıştırılması gerekir. DOĞRULANMADI.)

### KIRMIZI 2 — ÜÇ ÖLÇÜ `UNMEASURED` (atlanmadı, kapıyı düşürdü)
`engine/tools/pattern-measure.mjs` (V3-B yazdı) üçünü sözleşmeye uygun şekilde `null` + `reason`
ile döndü. Reason'ların özü:
1. **`bust_circumference`** — açılmış kalıpta büst halkasının karşılığı olan kenar YOK; büst
   3B kabuğun yatay kesitidir, kalıpta köşesiz/dikişsiz bir İÇ eğridir. 3B→2B haritası spec'te
   taşınmadığı için konumlanamıyor. Beli veya üst halkayı ölçekleyip türetmek yasak → `null`.
2. **`neck_opening_width`** — bu kalıpta YAKA YOK: her gövde panelinin serbest üst sınırı tek
   sürekli üst halka (60 kenar, **1439.7211mm** toplam yay), giysi STRAPLESS. Ayrıca genişlik
   izdüşümsel bir 3B büyüklük; düz panel yay verir, izdüşüm genişliği vermez.
3. **`shoulder_width`** — bu kalıpta OMUZ YOK: gövde panelleri üst halkada bitiyor, dikiş
   grafiğinde omuz dikişi ve kol oyuğu yok.
**KÖK TEŞHİS — tek kök, üç yüz: `surface-pattern` STRAPLESS bir giysi üretiyor, `shell-flat`
ise omuzlu/yakalı bir kabuk projeksiyonu basıyor.** Aynı spec'ten çıkan iki nesne aynı giysi
değil. Bu, repo kaydındaki açık G5 işiyle (omuz/kol oyuğu/yaka yüzeyde) BİREBİR aynı boşluk.
**ÖLÇÜLMÜŞ ÇÖZÜM ADAYI:** G5 kapanana kadar bu üç ölçü ölçülemez; ara adım olarak
`shell-flat`'in bu üç ölçüyü basmayı KESMESİ değil, kalıp tarafının açıkça "bu giysi strapless"
diye REDDETMESİ doğru davranıştır ve bugün zaten öyle yapıyor. Kapı, boşluğu her koşuda adıyla
sayıyor: `UNMEASURED sayısı: 3/6`.

---

## KANAT (b) — ARTEFAKT SAYIMI (dört sınıf)

Komut: `node engine/tests/flat_artifact_census.mjs`
Ölçülen nesne: `shell-flat EU38`, iki görünüm (front + back), her biri 192 noktalık YARIM
siluet zinciri. Sınıf 2 ve 4b için kapalı kontur, zincirin x → −x aynası ters sırayla
eklenerek KURULDU (test başlığında beyanlı). Kapalı kontur alanı **2451.09 cm²** (her iki görünüm).

| sınıf | yayınlanmış ad (V3-R EŞİK 3) | adet | kaynak (dosya:satır) |
|---|---|---|---|
| 1 tırtıklı/dişli kenar | **YAYINLANMIŞ AD YOK** | **0** (ham işaret değişimi 242, hepsi 1.0° altında) | `engine/src/shellprojection.cpp:94-97` |
| 2 kendini kesen kontur | *global overlap*, Sheffer 2006 Fig.2(a) | **0** | `engine/src/shellprojection.cpp:89-118` |
| 3 eğrilik süreksizliği | CAD: G1/tangency discontinuity | **2** | `engine/src/surfacepattern.cpp:71-81` |
| 4 dejenere segment / sıfır alan | *degenerate / non-positive signed area* | **6 + 0** | `engine/src/shellprojection.cpp:94-97 + 112-115` |

Hiçbir sayı kırpma/smoothing/çözünürlük düşürme ile gizlenmedi. Ham işaret değişimi sayısı
(242) da basılıyor, sadece "anlamlı" olan sayılmıyor diye saklanmıyor.

### KIRMIZI — SINIF 4: 6 dejenere (sıfır uzunluklu) segment
Yerler (her görünümde 3, ikisinde de aynı yükseklikler):
```
front i50->51  @z=1181.550  span shoulder->bust|bust->waist
front i87->88  @z=1039.800  span bust->waist|waist->hip
front i140->141 @z=834.800  span waist->hip|hip->hem
back  i50->51, i87->88, i140->141  (aynı z)
```
**KÖK TEŞHİS:** `shellprojection.cpp:80-97`'de dört koşu (`shoulder->bust`, `bust->waist`,
`waist->hip`, `hip->hem`) tanımlanıyor ve her koşu `r.top`'tan `r.bot`'a **KAPALI aralık**
örnekliyor (`for i = 0..n`). Ardışık iki koşunun sınır yüksekliği AYNI olduğu için o nokta
`out.outline`'a **iki kez** `push_back` ediliyor (satır 112-115). Üç sınır → üç çift nokta →
üç sıfır uzunluklu segment, görünüm başına.
**ÖLÇÜLMÜŞ ÇÖZÜM ADAYI:** ikinci ve sonraki koşularda döngü `i = 1`'den başlamalı, ya da
`out.outline`'a yazarken sınır noktası tekilleştirilmeli. Ölçülen etki: 192 → **189** nokta,
kapalı kontur 378 → 372 nokta, **alan 2451.09 cm² DEĞİŞMEZ** (çakışık nokta alana katkı
vermiyor). Kırpma DEĞİL — aynı geometrinin tekil temsili.

### ★ BU KUSUR BİR ÖLÇÜMÜ KÖRLEŞTİRİYORDU (kart dışı, ama kapının kendisiyle ilgili)
Testin ilk yazımında teğet açısı HAM zincirde ölçülüyordu; sıfır uzunluklu bir segmentin
teğeti tanımsız olduğu için o nokta atlanıyor ve **tam orada duran 20.56°'lik gerçek C1
kırığı GÖRÜNMÜYORDU** — kapı "C1 = 0" diye yeşil basıyordu. Yani sınıf 4 kusuru sınıf 3
kusurunu maskeliyor. Ölçüm düzeltildi: sınıf 4 HAM zincirde sayılır, sınıf 1 ve 3 çakışık
noktaları ÇÖKERTİLMİŞ zincirde ölçülür. Çökertme bir smoothing DEĞİLDİR (hiçbir nokta
oynatılmaz, hiçbir açı yumuşatılmaz) — tanımsız teğeti tanımlı yapar ve gizli kırığı ortaya
çıkarır. Gerekçe test dosyasının başlığında yazılı.

---

## KANAT (c) — EĞRİLİK SÜREKLİLİĞİ (sınıf 3)

**EŞİK: 1.0° = 0.0174533 rad.** Kaynak: McNeel Wiki, *"Understanding Tolerances"*,
https://wiki.mcneel.com/rhino/faqtolerances — Rhino'nun **doküman açı toleransı varsayılanı**.
Birebir: *"The default setting of 1 degree is rather large for fine modeling."* Sayfa doğrudan
çekildi, **GÜVEN: YÜKSEK** (`GECE/V3-R.md` EŞİK 1(b)).
**NOT — daha sıkı emsal:** CATIA V5 GSD **0.5°** (*"2 faces which have an angular discontinuity
less than 0.5deg are continuous in tangency (G1)"*, Dassault/CATIA V5, IBM APAR HD61495 +
HD27070). O sayfalar HTTP 403 verdi, snippet'ten alındı → **GÜVEN: ORTA**, bu yüzden kapı
0.5°'ye değil 1.0°'ye kuruldu. Not test dosyasının başlığında da var.
**BAĞLANMADI:** OCCT `Precision::Angular()` = 1e-12 rad bir PARALELLİK toleransıdır, teğet
süreksizliği eşiği değildir.

### KIRMIZI — 2 nokta eşiği aşıyor
```
front ham-i87  teğet farkı  20.5602° > 1°  @z=1039.800  span bust->waist|waist->hip
back  ham-i87  teğet farkı -20.5602° > 1°  @z=1039.800  span bust->waist|waist->hip
```
Diğer iki koşu sınırı (z=1181.550 ve z=834.800) C1-SÜREKLİ. Kırık **yalnızca BELDE.**
Ham noktalar (front):
```
i85 x=129.3628 z=1047.6750    i86 x=128.9111 z=1043.7375    i87 x=128.4595 z=1039.8000
i88 x=128.4595 z=1039.8000 (çakışık)   i89 x=129.4437 z=1035.8577   i90 x=130.4278 z=1031.9154
```
Belden yukarıda eğim `dx/dz = +0.1147`, aşağıda `−0.2499` → siluet belde bir **V köşesi**.

**KÖK TEŞHİS:** `shellprojection.cpp:104`'ün `fitCubics`'i DEĞİL — kırık, fit'ten ÖNCE ham
örneklenmiş poligonda ölçüldü, yani kaynak `halfWidthAt` → `GarmentSurf::effectiveSection`.
`engine/src/surfacepattern.cpp:71-81`: **bel yüksekliğinin (`skimBaseH`) ÜSTÜNDE** kabuk
"skim envelope" yasasına uyuyor (koni/zarf), **ALTINDA** halka interpolasyonuna
(`profile()`'ın `lin()` doğrusal segmentleri, satır 43-52). İki yasa `skimBaseH`'de **hiçbir
teğet koşulu olmadan** buluşuyor. Bel aynı zamanda yarı-genişliğin yerel minimumu olduğu için
köşe orada en görünür hali alıyor.

**ÖLÇÜLMÜŞ ÇÖZÜM ADAYI (§4.7):** aynı problem KALÇADA ZATEN ÇÖZÜLMÜŞ.
`surfacepattern.cpp:55-60` kalça köşesini `blendMM = 50.0` yarı-genişliğinde kuadratik bir
köşe yuvarlamasıyla geçiriyor ("the drafting *hip curve*", `surfacepattern.hpp:88`) ve
ölçüm bunu doğruluyor: **z=834.800'deki hip->hem sınırında teğet kırığı YOK.** Aynı yuvarlama
belde YOK (`skimBaseH`, `surfacepattern.hpp:112`, *"the waist ring — named, not searched for"*).
Aday: belde de aynı `blendMM` köşe yuvarlamasını uygulamak, ya da skim run'ın alt ucunun
eğimini halka interpolasyonunun bel eğimiyle eşitlemek. **Uygulanmadı** (kart `engine/src/`'ye
dokunmayı yasaklıyor) ve etkisi **ÖLÇÜLMEDİ → DOĞRULANMADI**; ölçülmüş olan, kalçada aynı
mekanizmanın kırığı sıfırladığıdır.

---

## ZORUNLU KANITLAR

### 4.2 BOŞ TEST KAPISI — `GECE/log/V3-C.vacuous.txt`
Usul: **faz-öncesi ÇIKTI ARTEFAKTI** (eski flat hattı, `engine/tools/render-garment-flat.mjs`,
`princess_scoop_dress`, front) yeni ölçüm/denetim aletiyle yargılandı.
**DERLEME HATASI KULLANILMADI** — iki hat da koştu, ikisi de sayı bastı.
Kanat (a), ölçüm konvansiyonu beyanlı (çevre = 4 × yarı-genişlik):
```
ölçü                     ESKİ HAT mm   shell-flat mm     fark mm     fark %  %1.5 kapısı
hem_circumference          1106.4000      1295.6000   -189.2000   -14.6033  KIRMIZI
bust_circumference          879.6000       754.7482    124.8518    16.5422  KIRMIZI
waist_circumference         699.6000       725.0000    -25.4000    -3.5034  KIRMIZI
body_length                1171.9200       743.5050    428.4150    57.6210  KIRMIZI
neck_opening_width          240.0000       349.8211   -109.8211   -31.3935  KIRMIZI
shoulder_width              467.4078       334.5680    132.8398    39.7049  KIRMIZI
```
**6/6 KIRMIZI.** Kanat (b)+(c) aynı artefaktta: tırtıklı **2** · öz-kesişim **72** ·
C1 **89** · dejenere **1** + sıfır alan **1** → 5 ihlal, exit 1.
**Dört sınıfın dördü de faz-öncesi artefaktta ateşledi. Denetim boş değil.**

### 4.5 MUTASYON KANITI — `GECE/log/V3-C.mutation.txt`
Kaynak koda kalıcı değişiklik YOK; mutasyonlar geçici JSON artefaktı / geçici stub üstünde
(`V3C_SHELL_JSON`, `V3C_PATTERN_MEASURE` kancaları; ikisi de aktifken kapı ekrana ⚠ basıyor).

| kanat | mutasyon | exit |
|---|---|---|
| a | sözleşmeye uyan stub, fark 0 | **0 (YEŞİL)** |
| a | `waist_circumference` **+5.0mm** = %0.690 | **0** — kapı DOĞRU davranıp geçiriyor, eşik %1.5 |
| a | `waist_circumference` **+15.0mm** = %2.069 | **1 (KIRMIZI)** |
| a | geri alındı | **0 (YEŞİL)** |
| b | sentetik fikstür, mutasyonsuz | **0 (YEŞİL)** |
| b | sınıf 2: kontura x=−40mm nokta sokuldu | **1** (öz-kesişim 4) |
| b | sınıf 4: bir nokta ikilendi | **1** (dejenere 1) |
| c | tek nokta 6mm içeri itildi | **1** (C1 3 nokta, en büyük 112.39°) |
| c | geri alındı | **0 (YEŞİL)** |

★ Kartın örnek verdiği **+5mm bu kapıyı KIRMAZ** ve bu bir kusur değil: 725mm'lik bir halkada
5mm %0.690'dır, beyan edilen %1.5 eşiğinin ALTINDA. Eşiği aşan en küçük tam mm **+11mm**
(%1.517). Mutasyon +15mm'ye çıkarıldı, eşik gevşetilmedi.

★ Mutasyon fikstürü (`/tmp/v3c-base.json`) **analitik/sentetik** bir siluet
(x = 170 + 60·sin(πt) + 40t, 201 nokta). MOTORUN ÇIKTISI DEĞİLDİR, motora hiç girmedi. Neden
gerekti: üretim artefaktı bugün sınıf 3 ve 4'te zaten KIRMIZI, o yüzden "geri alınınca yeşile
döner" koşulu onun üstünde ölçülemezdi. **Üretim artefaktının kırmızısı gizlenmedi** — bu
dosyanın tamamı onu anlatıyor.

### 4.3 CMake kaydı
```
$ ctest --test-dir engine/build -N | grep -E "flat_pattern_agree_check|flat_artifact_census|Total Tests"
  Test   #8: flat_pattern_agree_check
  Test   #9: flat_artifact_census
Total Tests: 111
```

### 4.4 Tam ctest — `GECE/log/V3.ctest.after.txt`
Sonuç ve miras kırmızı ad kümesi karşılaştırması log dosyasının sonunda.

---

## DÖKÜM — sorulmayan ama gördüğüm / göremediğim

**Sorulmamış ama önemli:**
1. **`shell-flat` ve `surface-pattern` AYNI GİYSİYİ üretmiyor.** Biri omuzlu/yakalı bir kabuk
   projeksiyonu, öteki strapless bir kalıp. Kanat (a)'nın üç `UNMEASURED`'ının tek kökü bu.
   Bu, "flat ↔ kalıp uyumu" sorusunun bugün altı ölçüden ancak üçünde sorulabildiği anlamına
   geliyor; kapı bunu her koşuda sayıyor.
2. **`shell-flat` cap/kol/oyuk hiç basmıyor** — `shellprojection.cpp:73-85`'te kontur yalnızca
   omuz halkasından etek ucuna iniyor, koltukaltı yok. Yani üretilen "flat" bir siluet
   dış hattıdır, bir teknik çizim değildir. Kart bunu sormadı ama kanat (a)'nın altı ölçüsünün
   neden altısı ölçülemediğini bu açıklıyor.
3. **`kSampleStepMM = 4.0` bir GÖRÜNTÜLEME çözünürlüğüdür ve kodda öyle beyan edilmiş**
   (`shellprojection.cpp:11-15`). Sınıf 1'in "ham 242 işaret değişimi"nin tamamı bu adımın
   sayısal gürültüsü (en büyük 0.0017°), gerçek tırtık değil. Adımı değiştirmek sınıf 1'in
   ham sayısını değiştirir ama kapıyı değiştirmez — kapı gürültü değil, 1.0°'yi aşan çift
   sayıyor.
4. **`surface-pattern` stdout'a JSON, stderr'e durum satırı basıyor**
   (`ring 724.9232mm | bodice waist 724.8961mm | ... | worst fit 0.1261mm`). Kanat (a) bu
   ayrımı doğru kullanıyor, ama stderr'deki `worst fit 0.1261mm` bağımsız bir sayı ve hiçbir
   kapıya bağlı değil.
5. **`igl::flipped_triangles`** (`V3-R` EŞİK 3, MPL-2.0, header-only, viewer gerektirmez)
   sınıf 4'ün hazır alet karşılığıdır; bugün elle yazıldı. Değerlendirilmedi.
6. `pattern-measure.mjs` bu koşu sırasında V3-B tarafından diske YAZILDI (koşunun başında
   yoktu). Kapının "alet yoksa KIRMIZI" dalı bu yüzden üretimde koşmadı; kod yolu duruyor ve
   mutasyon kanıtındaki stub'larla dolaylı olarak sınandı.

**Göremediğim / erişemediğim:**
- `body_length`'in kalan %4'ü (silüet-kenar toplamı 758.1528 vs kalıp 728.7870) **ayrıştırılmadı**.
- Belde `blendMM` köşe yuvarlamasının kırığı gerçekten sıfırlayıp sıfırlamayacağı **ÖLÇÜLMEDİ**
  (`engine/src/` yasak). Ölçülen tek şey: kalçada aynı mekanizma kırığı sıfırlıyor.
- Sadece **EU38** ölçüldü. Diğer yedi bedende dejenere/C1 sayıları **BAKILMADI**.
- Kanat (b)/(c) yalnızca `shell-flat` konturunda koştu; `surface-pattern` panellerinin kendi
  konturlarında artefakt sayımı **YAPILMADI** (kart flat'i istedi).
- Kapalı kontur, yarım zincirin AYNASI olarak kuruldu; motorun gerçekten bastığı bir kapalı
  kontur nesnesi YOK, dolayısıyla sınıf 2'nin "0"ı bu kuruluşa bağlıdır.

**Kart dışı fark edilen:**
- Sınıf 4 kusuru sınıf 3 kusurunu **maskeliyordu** (yukarıda, kanat (b) sonu). Kart dört sınıfı
  bağımsız sayıyor; en az iki sınıf arasında ölçüm bağımlılığı var.
- `contract/flat-convention-v1.json`'da `shoulderTipX` için repo kendi kaydında yazılı bir
  AÇIK KUSUR duruyor (omuz ucu büstün dışında, oran 1.0636; doğrusu Buğra ölçümüyle 0.9570).
  Bu kart bu değere dokunmadı, ama eski flat hattının 4.2 kanıtındaki `shoulder_width`
  **+%39.70** sapmasının bir kısmı doğrudan buradan geliyor.
