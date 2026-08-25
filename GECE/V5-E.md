# V5-E — İKİ KAPI CTEST'E BAĞLANDI: RATCHET, GEVŞETME DEĞİL

Koşu: 2026-08-25. SÜRE TAVANI 60 dk — **aşılmadı** (tam ctest dahil).

★ Bu rapor İKİ koşuyla yazıldı: kurulum koşusu (330.62 sn) ve **bağımsız
doğrulama koşusu** (325.59 sn, `GECE/log/V5-E.ctest.after.txt` bugünkü hali).
Aşağıdaki her sayı doğrulama koşusunda YENİDEN basıldı; taban dosyasındaki
tavanlar loga körü körüne güvenilerek değil, komut yeniden koşturularak
karşılaştırıldı (kartın ŞEF DÜZELTMESİ maddesi).

## YAPILAN (dosya yolu + hash)

| dosya | ne |
|---|---|
| `engine/tests/v5-ratchet-baseline.json` | **TEK yeni dosya.** İki kapının bütün tavanları + her tavanın künyesi + ölçüm tarihi + ölçüm ağacı + basan komut. Emsal `engine/tests/vocab-reference-baseline.json`. |
| `engine/tests/sewability_check.mjs` | ratchet katmanı (7 sayaç). Eşiklere DOKUNULMADI. |
| `engine/tests/draft_math_check.mjs` | ratchet katmanı; **elle yazılı `RATCHET` sabiti SİLİNDİ**, tavanlar artık taban dosyasından okunuyor. Bantlara DOKUNULMADI. |
| `engine/CMakeLists.txt` | **iki saf `add_test` satırı + gerekçe yorumu.** Mevcut hiçbir satır değiştirilmedi (diff: yalnız ekleme). |
| `GECE/log/V5-E.mutasyon.txt` | §4.5, ratchet katmanı için 8 mutasyon |
| `GECE/log/V5-E.ctest.after.txt` | tam ctest |
| `GECE/log/V5-E.reddiff.txt` | kırmızı AD farkı |

Commit: `e1ab3ea` (kurulum) → `fedce96` (hash kaydı) → **`d680564`** (bağımsız
doğrulama koşusu + ŞEF EKİ + eksik iki mutasyonun kanıtı).

## ÖLÇÜLEN (sayı + onu basan komut)

### 1. Kırmızı AD kümesi — ★ KABUL ÖLÇÜTÜ
Komut: `ctest --test-dir engine/build --output-on-failure`

**113 test · 6 kırmızı · 325.59 sn** (doğrulama koşusu; kurulum koşusu 330.62 sn).
Faz-öncesi (`GECE/log/V5.ctest.opening.txt`) 111 test · 6 kırmızı · 302.32 sn.

`GECE/log/V5-E.reddiff.txt` → **DIFF BOŞ.** Aynı altı ad, birebir:
`contract_check · figure_check · flat_artifact_census · flat_pattern_agree_check ·
sizechart_source_check · style_check`. **Yeni kırmızı ad YOK** (RULES 9 korundu).

Eklenen iki test YEŞİL koştu:
```
 10/114 Test  #10: sewability_check .................   Passed    0.13 sec
 11/114 Test  #11: draft_math_check .................   Passed    0.11 sec
```
(Toplam 114 listeleniyor, koşan 113 — `h10_gate_check` faz-öncesinde de Disabled'dı.)

### 2. Bugünkü DÜRÜST tavanlar — hepsi ölçüm, hiçbiri uydurma
Komut: `node engine/tests/sewability_check.mjs` · `node engine/tests/draft_math_check.mjs`

| kapı | kalem | bugün | tavan |
|---|---|---|---|
| sewability | notch_off_boundary | 211 | 211 |
| sewability | mark_over_seam_allowance | 32 | 32 |
| sewability | mark_far_from_edge | 342 | 342 |
| sewability | unclosed_contour · self_intersection · turn_out_of_band · engine_error | 0 | 0 |
| draft_math | scye_depth sapma | 11.4000 mm | 11.4 |
| draft_math | shoulder_width_front sapma | 8.298840 mm | 8.298840316324 |
| draft_math | shoulder_width_back sapma | 18.182276 mm | 18.182276104732 |
| draft_math | back_neck_drop sapma | 8.4000 mm | 8.4 |
| draft_math | bust_ease bant dışı | 4/8 beden | 4 |
| draft_math | waist_ease bant dışı | 0/8 | 0 |
| draft_math | hip_ease bant dışı | 8/8 beden | 8 |
| draft_math | unmeasurable · engine_error | 0 | 0 |

⚠ İki omuz tavanı V5-D raporunda 6 basamağa yuvarlanmıştı (8.298841 / 18.182277) ve
bu yuvarlama, her koşuda sahte bir "TAVAN DÜŞÜRÜLEBİLİR" satırı bastırıyordu.
Tam çift-duyarlıklı değer ölçülüp taban dosyasına yazıldı — bu bir gevşetme değil,
tavanın **0.0000007 mm SIKILAŞMASI**.

### 3. İHLALLER GİZLENMEDİ — sayı
`sewability_check` bu koşuda **585 ihlal kalemini ADIYLA basıyor** (İHLAL DÖKÜMÜ
bölümü; `V5A_DUMP` ile tamamı), `draft_math_check` **12 `FAIL` satırı** basıyor
(4 bust_ease + 8 hip_ease, her biri bedeni + ölçülen mm + bant + künyesiyle).
Ratchet bu satırların hiçbirini kısaltmadı; yalnız exit kodunu belirliyor.

### 4. §4.5 MUTASYON — ratchet ISIRIYOR, 8/8
Log: `GECE/log/V5-E.mutasyon.txt`. Zemin: iki kapı da exit 0.

| # | mutasyon | sonuç | exit |
|---|---|---|---|
| 1 | `V5A_MUTATE=notch-off` | RATCHET KIRILDI — notch_off_boundary **216 > 211** | 1 |
| 2 | `V5A_MUTATE=selfcross` | self_intersection **44 > 0** + turn_out_of_band **8 > 0** | 1 |
| 3 | `V5A_MUTATE=notch-deep` | mark_over_seam_allowance **45 > 32** | 1 |
| 4 | `V5D_MUTATE=scye_depth:5` | sapma **16.4000 > 11.40 mm** | 1 |
| 5 | `V5D_MUTATE=shoulder_width_back:-5` | sapma **23.1823 > 18.18 mm** | 1 |
| 6 | `V5D_MUTATE=back_neck_drop:5` | sapma **13.4000 > 8.40 mm** | 1 |
| 7 | `V5D_MUTATE=bust_ease:-5` | bant dışı **5 > 4** | 1 |
| 8 | `V5D_MUTATE=waist_ease:20` | bant dışı **8 > 0** | 1 |

Logdaki bölüm numaraları: 1-6 ilk blok, 8-9 ek blok (tablodaki 6 ve 8),
10 = **kör nokta kanıtı** `V5D_MUTATE=waist_ease:5` → **exit 0, YAKALANMIYOR**
(aşağıda YAPILAMAYAN 1). Exit kodları logun `EXIT KODLARI` bölümünde ayrı koşuyla
basıldı (PIPESTATUS tuzağına düşmemek için).

**GERİ ALMA (kanca yok, aynı komut): iki kapı da PASS, 0 tavan aşımı.**
Yani ratchet süs değil — hem sayaç kalemlerinde hem mm kalemlerinde hem de
yayınlanmış bant kalemlerinde bozma yakalanıyor. Mutasyon 5, tavanın yönlü
olduğunu da gösteriyor: omuzda bozan yön EKSİ (motor Aldrich'ten KISA çiziyor).

## ★ ŞEF EKİ — §4.2'NİN RATCHET KATMANINDAKİ DELİĞİ (ayrı başlık, kart emri)

**"4.2 geçti" DENMEZ. Şart YARIM karşılanıyor ve hangi yarısı olduğu şudur:**

Bu faz `engine/src/` altında hiçbir şey değiştirmedi (kartın YASAKLARI). Dolayısıyla
ratchet katmanı faz-ÖNCESİ motorda da AYNI sayıları basar — 211 / 32 / 342 / 11.4mm /
18.18mm / 4-8 bant dışı — ve tavanla eşit oldukları için orada da **YEŞİL düşer.**
Yani:

| §4.2 şartı: "yeni denetim faz-öncesinde KIRMIZI düşmeli" | durum |
|---|---|
| **HAM KAPI** (ratchet'siz, V5-A/V5-D'nin bıraktığı hali) | **KARŞILIYOR.** Tanık: `GECE/log/V5-A.bostest.txt` (exit=1) ve `GECE/log/V5-D.bostest.txt`. İkisi de "ihlal = 0" hükmüne bağlıydı ve faz-öncesi motorda kırmızı düşüyordu. |
| **RATCHET KATMANI** (bu fazın eklediği şey) | **KARŞILAMIYOR.** Tavan = faz-öncesi ölçüm olduğu için faz-öncesinde tanım gereği yeşil. Bu bir kaçamak değil, ratchet'in matematiği. |

Ratchet katmanının ısırdığının kanıtı §4.2 DEĞİL, **§4.5 mutasyonudur** ve bu kartta
yeniden koşturuldu: `GECE/log/V5-E.mutasyon.txt`, 8 tavan-aşan bozmanın 8'i exit 1,
geri alınca iki kapı da exit 0.

★ Bu deliğin pratik anlamı: ratchet, **motorun BUGÜNKÜ kusurunu YAKALAMAZ** (onu
tavan olarak dondurur, ama her ihlali adıyla basmaya devam eder); yakaladığı şey
**kusurun BÜYÜMESİDİR**. `notch_off_boundary = 211` bir başarı satırı değil, dondurulmuş
bir borçtur ve kökü (`engine/src/` altında çentiğin parça sınırından bağımsız bir x'e
basılması) hâlâ açık.

## YAPILAMAYAN (sebep)

1. **`waist_ease` ±5 mm mutasyonu YAKALANMIYOR** — bant (25.4..60.0 mm) yayından
   geliyor ve ölçülen 40.1–53.3 mm ortasında duruyor. Bandı daraltmak sayı
   uydurmak olurdu, DARALTILMADI. Onun yerine tavanı 0 kondu ve **+20 mm ile
   yakalandığı ölçüldü** (mutasyon 8). Bu kalem bugün ±5 mm'ye kör, adıyla yazılı.
2. **`armhole_circumference` hâlâ hiçbir tavana bağlı DEĞİL** — yayınlanmış hedef
   oyuk çevresi yok (V5-R §C2). Kapıya sokmak sayı uydurmak olurdu. Satır BİLGİ
   olarak basılmaya devam ediyor (8 bedenin 5'i bizim ölçüm bandımızın dışında).
3. **211 çentiğin kökü düzeltilmedi** — kök `engine/src/` altında; kaynak
   değiştirmek bu kartın YASAKLARINDA. Ölçülmüş çözüm adayı (çentiği kesim
   çizgisine izdüşür → 211 → 0) taban dosyasının künyesinde duruyor.
4. **PNG kanıtı yok (RULES 3)** — iki kapı da sayı basıyor, çizim üretmiyor;
   görsel iddia kurulmadı, o yüzden PNG borcu doğmadı. Kart PNG istemedi.

## KART DIŞI FARK EDİLEN

1. ★ **Tavanın altına düşmek SESSİZ DEĞİL.** İki kapı da `TAVAN DÜŞÜRÜLEBİLİR:
   X -> Y` satırı basıyor ve taban dosyası KENDİLİĞİNDEN güncellenmiyor
   (`vocab-reference-baseline.json`'ın usulü). Bugün iki kapıda da bu satır YOK:
   her kalem tam tavanında duruyor, yani hiçbir tavan bugün gereğinden yüksek
   yazılmadı.
2. ★ **`sewability_check` ratchet'i V5-A'nın yargılamadığı iki sayacı da
   TAVANLADI** (`mark_over_seam_allowance` 32, `mark_far_from_edge` 342). V5-A
   bunları "sınıflanamadı, yargılanmadı" diye basıyordu; artık basılmaya devam
   ediyor **ve** artışları kırmızı düşürüyor. Bu bir SIKILAŞTIRMA; `notch-deep`
   mutasyonu (mutasyon 3) ancak bu sayede ısırıyor.
3. ★ **`engine_error` tavanı 0 kondu, ratchet'lenebilir bir kalem olarak DEĞİL.**
   Motorun sevk ettiği bir kalıbı çizememesi tavanlanacak bir kusur değil,
   doğrudan kırmızıdır. Bugün 0.
4. ★ `V5-D.addtest.txt`'in hazır satırı `node`'u çıplak kullanıyordu; repoda iki
   usul var (`node` — `flat_pattern_agree_check:131` — ve `${NODE_EXECUTABLE}` —
   `contract_check:624`). Kartın gösterdiği emsal `node` olduğu için o alındı;
   **iki usulün neden yan yana durduğu haritalanmadı.**
5. ★ Bu vardiyada `engine/build` yeniden configure edildi
   (`cmake -S engine -B engine/build -DCMAKE_BUILD_TYPE=Release`, exit 0) —
   `add_test` satırlarının görünmesi için gerekliydi. CLAUDE.md'nin
   "rebuild HEP Release" tuzağı gözetildi; tam ctest 330.62 sn, faz-öncesi
   302.32 sn ile aynı sınıfta (yani 2684 sn'lik Debug tuzağına düşülmedi).
