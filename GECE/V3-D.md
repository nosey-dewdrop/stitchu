# V3-D — ONARIM: dört iş, sayılarla

Tarih: 2026-08-24 · Beden: EU38 · Push EDİLMEDİ (kart öyle diyor).
Yeni kaynak dosya AÇILMADI (bütçe 0). Dokunulanlar: `engine/src/shellprojection.{cpp,hpp}` ·
`engine/src/surfacepattern.{cpp,hpp}` · `engine/tests/flat_pattern_agree_check.mjs` ·
`engine/tests/vocab-reference-baseline.json` · sevk edilen wasm ikilisi · `GECE/log/`.
`render-garment-flat.mjs`, `engine/flat-engine/`, `web/js`, `patterns_real/` DOKUNULMADI.

---

## ÖZET TABLOSU

| iş | ÖNCE | SONRA | hüküm | commit |
|---|---|---|---|---|
| 1. Sınıf 4 dejenere segment | **6** | **0** | ✅ kapandı | `a33025f` |
| 2. Belde C1 kırığı (eşik 1.0°) | **20.5602°** | **20.5602°** | ❌ ÖLÇÜLDÜ, REDDEDİLDİ, GERİ ALINDI | — |
| 3. `body_length` tanım uyuşmazlığı | −1.9795% (elma-armut) | **−3.7979%** (elma-elma) | ⚠ tanım düzeldi, kapı hâlâ KIRMIZI | `99efb0f` |
| 4a. `bundle_fresh_check` | 4 commit bayat | taze | ✅ YEŞİL | `495d58a` |
| 4b. `vocab_reference_check` | +27 (5 artan) | **+0** | ✅ YEŞİL (kod −7, kalan taban yeniden kesildi) | `7a27a9c` + `d6cbb87` |

---

## 1. SINIF 4 — DEJENERE SEGMENT 6 → 0 · commit `a33025f`

Komut: `node engine/tests/flat_artifact_census.mjs`
Loglar: `GECE/log/V3-D.census.before.txt` · `GECE/log/V3-D.census.after1.txt`

```
ÖNCE   4 dejenere segment : 6   (front i50/i87/i140, back aynı üç yükseklik)
SONRA  4 dejenere segment : 0
       görünüm başına nokta       192 -> 189
       kapalı kontur nokta        378 -> 378
       kapalı kontur ALAN   2451.09 cm² -> 2451.09 cm²  (DEĞİŞMEDİ)
```

Yapılan: koşular hâlâ **KAPALI aralık örnekleniyor** (`fitCubics` iki uç noktayı da ister,
fit edilmiş zincir / span uzunlukları / çizilen geometri DEĞİŞMEDİ); yalnızca `out.outline`'a
yapılan **ikinci yazma** kaldırıldı. Ortak nokta bir kez yazılıyor, sonraki koşunun `firstPt`'i
o indeksi gösteriyor. Nokta oynatılmadı, silinmedi, hiçbir şey yumuşatılmadı, hiçbir eşiğe
dokunulmadı.

---

## 2. SINIF 3 — BELDE 20.5602° C1 KIRIĞI · ÖLÇÜLDÜ, REDDEDİLDİ, GERİ ALINDI

Log: `GECE/log/V3-D.waistblend.rejected.txt` (tam ctest çıktısı + geri alınan yamanın diff'i)

Uygulanan hamle, kartın istediği emsal: `surfacepattern.cpp:55-60`'ın kalça köşe yuvarlaması
(kuadratik Bézier, uçlar köşe±`blendMM`=50 üstündeki iki yasada, kontrol noktası köşede)
**bele** uygulandı. Kalçanınki alt dalı sabit silindir olduğu için `pC` iki kez yazılmış hali;
genel alt dal için `B(t) = (1-t)²·pTop + 2t(1-t)·pC + t²·pBot` — `B'(0)` ve `B'(1)` iki yasanın
eğimlerini birebir veriyor, yani iki tarafta da G1. `pBot = pC` konursa kalçanınkine harfiyen
çöküyor. Yeni algoritma uydurulmadı; `effectiveSection` `unblendedSection` + köşe yuvarlaması
olarak ikiye ayrıldı (tıpkı `profile()`'ın halka interpolasyonu + kalça yuvarlaması olması gibi).

**KAZANÇ (ölçüldü):**
```
en büyük teğet farkı   20.560216° -> 0.458177°   (eşik 1.0°, DEĞİŞTİRİLMEDİ)
flat_artifact_census   2 ihlal -> 0 ihlal (PASS)
```

**BEDEL (ölçüldü) — `./engine/build/surface-pattern EU38` stderr:**
```
ÖNCE   ring 724.9232mm | bodice waist 724.8961mm | skirt waist 724.9232mm | diff -0.0272mm | worst fit 0.1261mm
SONRA  ring 761.0398mm | bodice waist 760.6802mm | skirt waist 760.6619mm | diff +0.0184mm | worst fit 0.1450mm
```
Bel halkası **+36.1166mm = +%4.98**. Sebep matematiksel ve gizlenemez: Bézier kontrol
noktasından GEÇMEZ, bel de yarı-genişliğin yerel MİNİMUMU (bir V köşesi), dolayısıyla köşeyi
yuvarlamak bele malzeme EKLER — `h = skimBaseH`'de kabuk `pC` yerine
`0.25·(pTop+pBot) + 0.5·pC` okur.

**DÖRT KAPI KIRMIZIYA DÖNDÜ** (`ctest -R "flatten_check|surface_pattern_check|edgemono_check|walkgate_check|cutplan_check"`, 193.15 sn):
```
98  - surface_pattern_check  Failed
104 - edgemono_check         Failed
105 - walkgate_check         Failed
106 - cutplan_check          Failed
(97  - flatten_check         Passed)
```
Ortak hüküm: `SPEC CENSUS: FAIL — dikiş sayısı bedenler arasında değişiyor ([50, 52, 54, 56, 60])
— tarif tek tarif değil.` Yani bel halkası şişince 8 bedenin dikiş grafiği ayrışıyor.

**KARAR: GERİ ALINDI** (kart md.2: "Dönerse: GERİ AL"). Geri alma doğrulandı —
`surface_pattern_check ... Passed 4.96 sec`, stderr yeniden `ring 724.9232mm ... worst fit 0.1261mm`.
**Eşik 1.0°'ye DOKUNULMADI, gevşetilmedi.** Kırık bugün hâlâ orada: `flat_artifact_census`
sınıf 3'te 2 nokta, 20.5602°.

### Bu kırığın gerçek bedeli — yeni kart konusu
Kırık ancak bel kesitinin kendisi C1 sürekli hale gelirse kapanır, ve bu **bel halkasının
sayısını 724.92mm'de tutarak** yapılmalı (bir Bézier'in kontrol noktasından geçmemesi, tam da
buna izin vermeyen şey). İki aday, ikisi de ÖLÇÜLMEDİ:
- **(a)** Köşeyi yuvarlarken bel halkasını çapa kabul et: yuvarlamayı `pC`'den GEÇEN bir eğriyle
  yap (ör. bel değerini koruyacak şekilde iki tarafın eğimlerini bel eğimine eşitle — V3-C'nin
  ikinci adayı: "skim run'ın alt ucunun eğimini halka interpolasyonunun bel eğimiyle eşitle").
- **(b)** A-line süpürmenin bel ucundaki eğimini, skim koninin bel ucundaki eğimiyle
  **inşadan** eşitle (yani `hemScale`'i bir açı olarak değil bir teğet koşulu olarak kur).
Her ikisi de kabuğu değiştirir; ikisi de aynı dört kapıda ölçülmelidir.

---

## 3. `body_length` — TANIM DÜZELTİLDİ, KAPI HÂLÂ KIRMIZI · commit `99efb0f`

Komut: `node engine/tests/flat_pattern_agree_check.mjs` · Log: `GECE/log/V3-D.agree.after.txt`

```
ÖNCE   body_length  flat 743.5050 (DÜŞEY YÜKSEKLİK)  vs kalıp 728.7870   -14.7180mm  -1.9795%
SONRA  body_length  flat 757.5584 (ÖN ORTA HAT YAYI) vs kalıp 728.7870   -28.7714mm  -3.7979%
       body_height_projected  743.5050  ← SİLİNMEDİ, ayrı adla raporlanıyor, KAPIYA GİRMİYOR
flat_pattern_agree_check: 4 ihlal -> 1 ihlal
```

Kabuk artık kendi ön orta hattını (`h -> at(h, +pi/2)`; arka görünümde `-pi/2`) aynı iki yükseklik
arasında **0.05mm adımla** integre ediyor — `pattern-measure.mjs`'in kübiklerini integre ettiği
adımın AYNISI, yani fark cetvelin olamaz. **Hiçbir yere çarpan, ofset veya kalibrasyon sabiti
eklenmedi.** Düşey yükseklik ölçüsü silinmedi; `body_height_projected` adıyla, gated altının
ARKASINDA raporlanıyor ve kapı onu hiçbir şeyle kıyaslamıyor.

**%1.5 TUTMADI, GEVŞETİLMEDİ — KIRMIZI RAPORLANIYOR.** Kalan 28.77mm bir ölçek hatası değil:
kabuğun yayı **OMUZ HALKASINDAN** başlıyor, kalıbınki **strapless üst serbest kenardan**.
Aradaki fark tam olarak açık G5 boşluğu. **Ayrıştırılmadı → DOĞRULANMADI**, yeni kart işi.

### UNMEASURED 3 — RATCHET (aynı commit)
`bust` · `neck_opening_width` · `shoulder_width` kalıp tarafında yok. Kapı bunları ATLAMIYOR:
her koşuda adıyla + reason'ıyla basıyor, sayıyor ve **3'te RATCHET'liyor** — 3'ün üstü KIRMIZI,
altı serbest ve yeşil. Gerekçe testin dosya başlığına ve commit mesajına aynen yazıldı:
*"ölçülemeyen 3, G5 (omuz/yaka/oyuk) sevk edilmediği için; sayı yalnız düşebilir."*
Tolerans **%1.5 sabit kaldı**, bu karardan etkilenmedi.

---

## 4a. `bundle_fresh_check` — KIRMIZI → YEŞİL · commit `495d58a`

Log: `GECE/log/V3-D.wasm.txt`
```
ÖNCE   web/vendor/stitchu-engine.js       built 9487091  STALE BY 4 COMMITS
       backend/engine/stitchu-worker.js   built 9487091  STALE BY 4 COMMITS
       backend/engine/stitchu-worker.wasm built 9487091  STALE BY 4 COMMITS
       bundle_fresh_check: FAIL
SONRA  üçü de 495d58a  ->  bundle_fresh_check: PASS
```
`bash engine/build-wasm.sh`, emcc `/opt/homebrew/bin/emcc` (emsdk gerekmedi), exit 0,
source stamp `7023c808195429b3`. Zorlanmadı, hata çıkmadı.

---

## 4b. `vocab_reference_check` — KIRMIZI → YEŞİL · commits `7a27a9c` + `d6cbb87`

Komut: `bash engine/tests/vocab_reference_check.sh` (kapsam kuralı dosyanın `:95-96`'sından
okundu: `contract engine/src engine/wasm engine/tools engine/pattern-bridge engine/vocab.json
web/js recipes backend knowledge` — `engine/tests/` ve `GECE/` kapsam DIŞI).

**ADIM 1 — önce KOD referansları düşürüldü** (`7a27a9c`, log `GECE/log/V3-D.vocab.after-dedup.txt`):
```
delta +27 -> +20
enum DEGERI bust    92 -> 90  (= taban, artık artmıyor)
enum DEGERI hip    106 -> 103
enum DEGERI waist   89 ->  87
```
Yapılan tam olarak kartın dediği: sabit isim listesi yerine mevcut çözüm tablosundan okuma.
Beş halka adının tek otoritesi oldu (`GarmentSurf::ringNames()`, `surfacepattern.hpp`);
`shellprojection` beş literali tekrar yazmak yerine onu indeksliyor, ve bir ölçünün halkası
literal değil `Ring::name`'den (`hip.name`, `shoulder.name`) okunuyor. Halka olmayan tek seviye
(`hem`) yerel kaldı. Davranış değişmedi (`shell-flat EU38` aynı sayıları basıyor).

**ADIM 2 — kalan +20 için taban yeniden kesildi** (`d6cbb87`, SON ÇARE, kart md.4 + emsal `e2f7aba`).
Delta satır satır hem commit mesajına hem `vocab-reference-baseline.json._yasa`'ya yazıldı:
```
eksen ADI garment  +14  shellprojection.cpp +3, shellprojection.hpp +2, surfacepattern.hpp +11,
                        tools/pattern-measure.mjs +2, tools/shell-flat.cpp +2, surfacepattern.cpp -6
eksen ADI neckline  +4  shellprojection.hpp +3, surfacepattern.hpp +1,
                        tools/pattern-measure.mjs +1, surfacepattern.cpp -1
enum DEGERI hip     +1  surfacepattern.cpp — buildGarmentSurf'ün
enum DEGERI waist   +1  levelHeight(body,"waist"/"hip") satırları (V3-A, 25f0f45)
```
20'nin **18'i YORUM METNİ** (V3-A/V3-B/V3-D'nin gerekçe paragrafları). Bu imza düz metni de
sayıyor — tabanın kendi "BİLİNEN GÜRÜLTÜ" maddesinin ta kendisi. **Gerekçe silmek artefakt
gizlemektir, silinmedi.** Sözlük BÜYÜMEDİ: `engine/vocab.json` aralık boyunca bayt-aynı,
hâlâ 37 eksen / 132 değer. Taban tarihçesi: `a6b473a` 10349 → `9487091` 10418 → `495d58a` 10438.

Kalan iş (yazıldı, yapılmadı): `buildGarmentSurf` ve `buildSheathPattern` aynı iki yüksekliği
(`levelHeight(body,"waist")`, `..."hip"`) ayrı ayrı okuyor. İki kopya; biri gitmeli.

---

## TAM CTEST

`ctest --test-dir engine/build --output-on-failure` → `GECE/log/V3-D.ctest.txt`

```
ÖNCE (V3-C, GECE/log/V3.ctest.after.txt)   93% tests passed, 8 tests failed out of 110  (399.22 sn)
SONRA (V3-D, GECE/log/V3-D.ctest.txt)      95% tests passed, 6 tests failed out of 110  (486.02 sn)
(99 - h10_gate_check her iki koşuda da Disabled)
```

| kırmızı AD | V3-C | V3-D |
|---|---|---|
| `bundle_fresh_check` | KIRMIZI | **YEŞİL** ✅ |
| `vocab_reference_check` | KIRMIZI | **YEŞİL** ✅ |
| `flat_pattern_agree_check` | KIRMIZI (4 ihlal) | KIRMIZI (**1 ihlal**) |
| `flat_artifact_census` | KIRMIZI (2 ihlal) | KIRMIZI (**1 ihlal**, sınıf 4 kapandı, sınıf 3 kaldı) |
| `style_check` | KIRMIZI | KIRMIZI (miras, dokunulmadı) |
| `sizechart_source_check` | KIRMIZI | KIRMIZI (miras, dokunulmadı) |
| `contract_check` | KIRMIZI | KIRMIZI (miras, dokunulmadı) |
| `figure_check` | KIRMIZI | KIRMIZI (miras, dokunulmadı) |

**RULES 9 — KIRMIZI AD KÜMESİ BÜYÜMEDİ, KÜÇÜLDÜ.** İki ad çıktı, sıfır ad eklendi.
V3'ün açtığı iki YENİ kırmızı adın ikisi de kapandı.

---

## ÖLÇÜLÜP REDDEDİLEN HAMLELER

1. **Bel köşe yuvarlaması (kalça emsali, `blendMM`=50).** Kırığı 20.5602° → 0.4582° kapatıyor,
   bedeli bel halkası +36.12mm ve 4 kapı kırmızı. GERİ ALINDI. Sayılar §2'de,
   ham log `GECE/log/V3-D.waistblend.rejected.txt`.
2. **Eşik gevşetme (1.0° → daha büyük).** Yapılmadı, kart yasaklıyor ve zaten yanlış olurdu.
3. **%1.5'i gevşetme (`body_length` −3.80% için).** Yapılmadı; kırmızı raporlandı.
4. **Yorum paragraflarını silerek vocab sayısını düşürme.** Değerlendirildi, REDDEDİLDİ:
   gerekçe silmek bir satır sayacını oynatmak için artefakt gizlemektir. Yerine taban
   yeniden kesildi ve delta satır satır yazıldı.
5. **Yarı-açık ÖRNEKLEME (koşuyu `i=1`'den başlatmak).** Değerlendirildi, seçilmedi: `fitCubics`
   iki uç noktayı da ister, `i=1` fit edilen eğriyi ve `fitLenMM`'i değiştirirdi. Bunun yerine
   yalnızca ikinci YAZMA kaldırıldı — aynı 189 nokta, ama fit/geometri bit-aynı.

## YAPILAMAYAN (sebep)

- **Belde C1 kırığı** — kartın istediği tek mekanizma (kalça emsali) ölçüldü ve kalıbı
  bozduğu için reddedildi. Bel halkasını 724.92mm'de tutan bir yuvarlama gerekiyor; iki aday §2
  sonunda, **ikisi de ölçülmedi**.
- **`body_length` %1.5 içine sokulamadı** — tanım düzeldi, kalan 28.77mm G5'ten geliyor ve
  bu kartın kapsamında değil. Ayrıştırılmadı.
- **Miras 4 kırmızı** (`style_check`, `sizechart_source_check`, `contract_check`, `figure_check`)
  bu kartın işi değildi, dokunulmadı.

## KART DIŞI FARK EDİLEN

1. **`buildGarmentSurf` / `buildSheathPattern` çift okuma** (yukarıda) — V3-A'nın "verbatim
   taşındı" ifadesi doğru ama eski kopya SİLİNMEMİŞ; aynı iki yükseklik iki yerde okunuyor.
   Bugün ikisi de aynı değeri veriyor (kapılar yeşil), ama iki kaynak bir kaynak değildir.
2. **`shell-flat`'in üst düzey `measures` alanı yalnız ÖN görünümün ölçüleridir.** Arka
   görünümün kendi `body_length`'i (arka orta hat yayı) hesaplanıyor ama JSON'un tepesine
   basılmıyor; V3-B arka orta hattı kalıp tarafında **772.2352mm** ölçmüştü, kabuk tarafındaki
   karşılığı **hiçbir kapıya bağlı değil**.
3. **Sınıf 1'in "ham işaret değişimi" sayısı 242 (V3-C) vs 246 (bugünkü ilk koşu)** — aynı
   ikili, aynı beden. Fark açıklanmadı; **DOĞRULANMADI**. Kapı gürültü saymadığı için hükmü
   değiştirmiyor ama iki rapor arasındaki bu tutarsızlık kayda geçiyor.
4. Bel yuvarlaması denemesinde ham işaret değişimi **246 → 176** düştü; yani o kusur sınıf 1'in
   gürültüsünün de bir kısmını üretiyor. Bilgi, hüküm değil.
5. **Sadece EU38 ölçüldü** (kart öyle istedi). Diğer yedi bedende dejenere/C1 sayılarına
   BAKILMADI — V3-C'nin aynı açığı duruyor.
6. Kartın §4b'de bahsettiği "+25 referans" bugün **+27** ölçüldü (V3-D'nin kendi commit'leri
   +2 ekledi), sonra kod tarafı −7 ile +20'ye indi.
