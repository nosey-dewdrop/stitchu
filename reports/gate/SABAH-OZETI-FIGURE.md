# SABAH ÖZETİ — FIGURE_BASE TURU (2026-07-22)

## EN ÜSTTE: babydoll + peterpan (pin kontrolü)
**İkisi de BYTE-IDENTICAL — re-pin GEREKMEDİ.** Figür düzeltmesi yalnız
boxy-olmayan TOP dalına dokundu; dress/band-top pinleri kılına dokunulmadı
(PNG md5 eski==yeni: `reports/gate/repin-figure/eski_*` vs `yeni_*`).
Karta kalan: YOK. Re-pin edilen: YOK (gerek kalmadı).
- peterpan_puff 0.908→değişmedi (dress, kapsam dışı — drift-lock'a tabanıyla pinli)
- drawstring_babydoll 0.830→değişmedi (band top, zaten bant içi)

## ÜÇLÜ KIYAS — 3 STİL HAKEM SONUCU (bağımsız agent)
| stil | A figür | B landmark |
|---|---|---|
| top_crew_dart | PASS | PASS |
| top_boat_princess | PASS (minör: koltukaltı kavisi keskin — cila adayı) | PASS |
| top_sq_shirred_peplum | PASS (peplum bel çizgisinden, shirr göğüste) | PASS |
**KATMAN KABUL.** Görseller: `reports/gate/repin-figure/`

## 6 BORUNUN YENİ waist/bust DEĞERLERİ (bant [0.72, 0.84])
| stil | eski | yeni |
|---|---|---|
| top_crew_dart | 0.986 | **0.780 ✓** |
| top_boat_princess | 0.984 | **0.779 ✓** |
| top_scoop_cami | 0.984 | **0.780 ✓** |
| top_princess_peplum | 0.986 | **0.780 ✓** |
| top_sq_shirred_peplum | 0.986 | **0.780 ✓** |
| top_sq_puff_shirred_peplum | 0.986 | **0.780 ✓** |
Boxy ikili kutu kaldı (0.984/0.985 > 0.93 ✓ kasıtlı). Kök: buildHalf non-boxy
top belini `figure-bands.json` bandından hesaplar (bust×0.78); hem = bel
landmark + oranlı ease (serbest X/Y formülü söküldü).

## LANDMARK HAKEMI
3/3 PASS: en dar nokta doğal belde; peplum bel dikişinden; shirred pano göğüste.

## FIGURE-BANDS / FIGURE-LANDMARKS DOSYALARI
- `contract/figure-bands.json`: waist/bust 0.786 + waist/hip 0.733 + bust/hip
  0.933 (EU36 motor sizechart 84/66/90, kaynaklı) + mandal bloğu.
  **ÖLÇÜLMEDİ kalan:** omuz eğim açısı (literatür bandı 18-22°),
  göğüs hattı yüksekliği (literatür 0.20-0.24) — template raster dosyası elde
  olmadığından piksel-kalibrasyon yapılamadı; literatür etiketiyle bantta.
- `contract/figure-landmarks.json`: neckBase/shoulderTip(17.5° mevcut)/underarm/
  bustLine/waist(EN KRİTİK, dress'te var top'ta yoktu) sayıyla; **ÖLÇÜLMEDİ:**
  bustApex, underbust, highHip, crotch (FIGURE_BASE 2. tur işi). Bağlama kuralı yazıldı.

## YENİ MANDAL — figure_check (ctest 49. test)
Her stilin gövde outline'ından waist/bust ölçülür: figürel top bandı [0.72,0.84] /
boxy >0.93 (İKİ YÖNLÜ — boxy figürelleşirse de FAIL) / dress-pinli taban değere
±0.02 drift-lock. Mutasyonla kanıtlı (bant bozuldu→6 FAIL, restore→yeşil).
Bir daha kimse fark etmeden boru üretemez.

## 11 HEDEF YENİDEN ÜRETİM + id47 + id82
- **103-hedef boru hattı yeniden koştu: 12 GEÇTİ-ADAYI aynen, DÜŞEN YOK.**
  (id31 pipeline'da öteden beri "wide strap" parse'ıyla üretilemez — FAZ 6
  kaydıyla birebir; elle hakem stiliyle geçmişti, sayaçta duruyor.)
- **id47 GECTI (çift kanat, final hakem) → SAYAÇ 11→12.** Kol kusuru çözüldü:
  plainSleeve'e gerçek cap dalı (omuzdan aşağı-eğimli, flutter yok), full-circle
  etek (kalıp: quarter-circle panel ×2 = full circle, 7 parça validator-temiz).
  Hakem notu: midi'den çok diz boyu okunuyor (flat.len sınıfı, not düzeyi).
- **id82 numune: NO-OP** — boxy, figür fix'i guard'la dokunmadı, flat de kalıp
  PDF de aynı; yenileme gerekmedi.

## SAYAÇ
**GEÇTİ (hakem-teyitli): 12/103** → id 15,23,29,31,41,44,47,53,65,82,88,90
GEÇTİ-ADAYI (pipeline): 12 → id 15,18,23,29,41,44,53,63,65,82,88,90
ÜRETİLEMEZ: 91→90 (id47 çıktı)

## KANIT ZİNCİRİ
suite 49/49 (figure_check dahil) · golden byte-identical 7c3d83f2 · motor C++
dokunulmadı · determinizm md5 eşit (iki koşu) · pinler byte-identical ·
push'lu: b5acb7c (raporlar) → bc9874d (figure base) → 192641e (id47).
wip/id47-fullcircle branch'i main'e merge edildi.

## AÇIK KALANLAR (v-sonraki tur adayları)
- boat_princess koltukaltı kavis cilası (hakem minörü)
- bustApex/underbust/highHip/crotch landmark'ları + serbest-Y taraması
  (yokeDrop sınıfı offset'ler landmark+offset'e çevrilecek — 2. tur)
- omuz eğimi 17.5° literatür bandının (18-22°) hafif altında — template
  kalibrasyonu yapılırsa netleşir
- id47 "midi diz boyu okunuyor" (flat.len)
