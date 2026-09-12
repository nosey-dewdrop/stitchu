# Dikilebilirlik — taban-elbise @ gercek36

**Sonuc: DIKILEBILIR** — kirmizi hukum 0 / 72 satir.

## Esikler (contract/graf-v1.json toleranslar)

| tolerans | mm | kaynak |
|---|---|---|
| dikisUzunlukMM | 2.00 | contract/body-v1.json ayniInsan.toleransMM ile AYNI zincir: URBN Apparel Technical Manual 'Position points, olcu <5 in' = 1/8 in = 3.175 mm ust sinir (knowledge/POM-TOLERANS-URBN-2026-08-23.md); repodaki CLO sayisi engine/src/validator.hpp:23 pairedSeamTolerance 3.0 (yayin degil, yazilim varsayilani); GarmentCode StitchingRule.isMatching tol=0.05 GORELI (500 mm'de 25 mm — bizim kapimizin esigi degil, knowledge/TEKNOLOJI-2026-08-23.md:66). En kisitlayici yayinli degerin altinda, cizim cozunurlugunun (1 mm) ustunde: 2.0 — DOGRULANMADI etiketi ayniInsan ile ayni, gevsetme yonunde degil. |
| centikMM | 0.50 | engine/tests/notch_alignment_check.cpp (2026-09-03): 'dikisin ustunde yurunen mm ... 0.5mm icinde' — motorun mevcut centik kapisi, repo konvansiyonu (yayin yok, DOGRULANMADI). En kisitlayici var olan deger. |
| halkaKapanmaMM | 2.00 | dikisUzunlukMM ile ayni: halka bir dikisin uzunluk artigi ya da bir kavsakta iki dikisin farkiyla kapanir; ayni buyukluk, ayni dayanak. |
| pensBacakMM | 2.00 | engine/src/validator.hpp dartSumTolerance 2.0 (repo konvansiyonu) ve dikisUzunlukMM ile ayni zincir; pens bacaklari insadan esit oldugu icin fark yalniz sayisal artiktir. |

## Uydurma (grafin notes'unda DOGRULANMADI — HEDEF §2: uydurdugunu soyle)

- UYDURULANLAR ADIYLA: (1) kol kapagi yuksekligi koltukalti->omuz ucu dususunun 0.6'si — DOGRULANMADI
- oyugun icbukey noktasi width.crossFront/2 (body-v1), y'si dususun ortasi (0.5, DOGRULANMADI)
- croquis36'da width.crossFront'un kendisi 0.85 x width.shoulderToShoulder (body-v1 croquisOranlar.crossOverShoulderToShoulder, DOGRULANMADI — body-v1 borcu, grafin degil)

## Dikisler

| dikis | reverse | a (mm) | hedef = ratio x b + ease | artik (mm) | uc boslugu (bilgi) | centik sapma (mm) | hukum |
|---|---|---|---|---|---|---|---|
| omuz | false | 119.98 | 119.98 (b 119.98) | 0.00 | 0.00 | - | gecti |
| yan_beden | false | 210.96 | 210.96 (b 210.96) | 0.00 | 0.00 | 0.00 | gecti |
| kol_oyugu | false | 373.62 | 373.62 (b 359.25) | -0.00 | 310.50 | - | gecti |
| bel | false | 342.50 | 342.50 (b 342.50) | 0.00 | 0.00 | 0.00, 0.00 | gecti |
| yan_etek | false | 590.54 | 590.54 (b 590.54) | 0.00 | 0.00 | - | gecti |
| kol_alti | true | 188.30 | 188.30 (b 188.30) | 0.00 | 0.00 | - | gecti |

## Halkalar (sanal dikis)

| halka | rol | toplam (mm) | kapanma (mm) | kavsaklar | hukum |
|---|---|---|---|---|---|
| yaka | neck | 154.51 | 0.00 | arka_beden/neck_back< -> on_beden/neck_front: dikis omuz (0.00) | on_beden/neck_front> -> arka_beden/neck_back: kat aynasi | gecti |
| kol_oyugu_halka | armhole | 359.25 | 0.00 | on_beden/armhole_front.1> -> on_beden/armhole_front.2: kose | on_beden/armhole_front.2> -> arka_beden/armhole_back.2: dikis omuz (0.00) | arka_beden/armhole_back.2< -> arka_beden/armhole_back.1: kose | arka_beden/armhole_back.1< -> on_beden/armhole_front.1: dikis yan_beden (0.00) | gecti |
| bel_halka | waist_ring | 342.50 | 0.00 | on_beden/waist_front> -> arka_beden/waist_back: dikis yan_beden (0.00) | arka_beden/waist_back< -> on_beden/waist_front: kat aynasi | gecti |
| etek_ucu | hem | 475.00 | 0.00 | on_etek/hem_front> -> arka_etek/hem_back: dikis yan_etek (0.00) | arka_etek/hem_back< -> on_etek/hem_front: kat aynasi | gecti |
| kol_agzi | sleeve_hem | 310.50 | 0.00 | kol/hem> -> kol/hem: dikis kol_alti (0.00) | gecti |

## Paneller (2B yerlestirme, bilgi)

| panel | yerlesti | dikis | theta (deg) | ayna | t (mm) | alan (cm2) | cevre (mm) |
|---|---|---|---|---|---|---|---|
| on_beden | evet | kok | 0.00 | - | (0.00, 0.00) | 675.25 | 1124.06 |
| arka_beden | evet | omuz | 43.34 | evet | (18.00, -45.29) | 716.48 | 1157.78 |
| on_etek | evet | bel | 0.00 | - | (0.00, 0.00) | 1310.26 | 1579.29 |
| arka_etek | evet | bel | 99.04 | evet | (-186.99, 159.59) | 1310.26 | 1579.29 |
| kol | evet | kol_oyugu | 123.32 | evet | (68.59, 1.39) | 774.59 | 1060.72 |

## Hukumler

| kural | hedef | deger | sonuc |
|---|---|---|---|
| tolerans | contract | dikis 2.00 · centik 0.50 · halka 2.00 · pens 2.00 mm; ratio [1.00, 3.50] (kaynaklar tablo basliginda) | bilgi |
| uydurma | taban-elbise | UYDURULANLAR ADIYLA: (1) kol kapagi yuksekligi koltukalti->omuz ucu dususunun 0.6'si — DOGRULANMADI | bilgi |
| uydurma | taban-elbise | oyugun icbukey noktasi width.crossFront/2 (body-v1), y'si dususun ortasi (0.5, DOGRULANMADI) | bilgi |
| uydurma | taban-elbise | croquis36'da width.crossFront'un kendisi 0.85 x width.shoulderToShoulder (body-v1 croquisOranlar.crossOverShoulderToShoulder, DOGRULANMADI — body-v1 borcu, grafin degil) | bilgi |
| sema | taban-elbise | sozlesmeyle uyumlu | gecti |
| panel_kapali | on_beden | 7 kenar, halka kapali | gecti |
| panel_kapali | arka_beden | 7 kenar, halka kapali | gecti |
| panel_kapali | on_etek | 5 kenar, halka kapali | gecti |
| panel_kapali | arka_etek | 5 kenar, halka kapali | gecti |
| panel_kapali | kol | 5 kenar, halka kapali | gecti |
| referans | taban-elbise | 6 dikis, 5 halka; tum referanslar cozuldu | gecti |
| kisit | kol/cap_front | dikis kol_oyugu: hedef 186.81 mm, kontrol kaymasi 9.49 mm @ gercek36, artik -0.0000 mm | bilgi |
| kisit | kol/cap_back | dikis kol_oyugu: hedef 186.81 mm, kontrol kaymasi 9.49 mm @ gercek36, artik -0.0000 mm | bilgi |
| kenar_turu | on_beden/cf | kat kenari x=0, panel onFold | gecti |
| kenar_turu | on_beden/waist_front | seam kenari, dikis: bel | gecti |
| kenar_turu | on_beden/side_front | seam kenari, dikis: yan_beden | gecti |
| kenar_turu | on_beden/armhole_front.1 | seam kenari, dikis: kol_oyugu | gecti |
| kenar_turu | on_beden/armhole_front.2 | seam kenari, dikis: kol_oyugu | gecti |
| kenar_turu | on_beden/shoulder | seam kenari, dikis: omuz | gecti |
| kenar_turu | on_beden/neck_front | cut kenari, bitirme: faced | gecti |
| kenar_turu | arka_beden/cb | kat kenari x=0, panel onFold | gecti |
| kenar_turu | arka_beden/waist_back | seam kenari, dikis: bel | gecti |
| kenar_turu | arka_beden/side_back | seam kenari, dikis: yan_beden | gecti |
| kenar_turu | arka_beden/armhole_back.1 | seam kenari, dikis: kol_oyugu | gecti |
| kenar_turu | arka_beden/armhole_back.2 | seam kenari, dikis: kol_oyugu | gecti |
| kenar_turu | arka_beden/shoulder | seam kenari, dikis: omuz | gecti |
| kenar_turu | arka_beden/neck_back | cut kenari, bitirme: faced | gecti |
| kenar_turu | on_etek/cf | kat kenari x=0, panel onFold | gecti |
| kenar_turu | on_etek/hem_front | cut kenari, bitirme: hem | gecti |
| kenar_turu | on_etek/side_front.1 | seam kenari, dikis: yan_etek | gecti |
| kenar_turu | on_etek/side_front.2 | seam kenari, dikis: yan_etek | gecti |
| kenar_turu | on_etek/waist_front | seam kenari, dikis: bel | gecti |
| kenar_turu | arka_etek/cb | kat kenari x=0, panel onFold | gecti |
| kenar_turu | arka_etek/hem_back | cut kenari, bitirme: hem | gecti |
| kenar_turu | arka_etek/side_back.1 | seam kenari, dikis: yan_etek | gecti |
| kenar_turu | arka_etek/side_back.2 | seam kenari, dikis: yan_etek | gecti |
| kenar_turu | arka_etek/waist_back | seam kenari, dikis: bel | gecti |
| kenar_turu | kol/cap_front | seam kenari, dikis: kol_oyugu | gecti |
| kenar_turu | kol/underarm_front | seam kenari, dikis: kol_alti | gecti |
| kenar_turu | kol/hem | cut kenari, bitirme: hem | gecti |
| kenar_turu | kol/underarm_back | seam kenari, dikis: kol_alti | gecti |
| kenar_turu | kol/cap_back | seam kenari, dikis: kol_oyugu | gecti |
| kendini_kesme | on_beden | kontur temiz | gecti |
| kendini_kesme | arka_beden | kontur temiz | gecti |
| kendini_kesme | on_etek | kontur temiz | gecti |
| kendini_kesme | arka_etek | kontur temiz | gecti |
| kendini_kesme | kol | kontur temiz | gecti |
| dikis_zincir | omuz | a: on_beden/shoulder> | b: arka_beden/shoulder> | reverse false (a.bas<->b.bas) | gecti |
| dikis_zincir | yan_beden | a: on_beden/side_front> | b: arka_beden/side_back> | reverse false (a.bas<->b.bas) | gecti |
| dikis_zincir | kol_oyugu | a: kol/cap_back> kol/cap_front> | b: arka_beden/armhole_back.1> arka_beden/armhole_back.2> =omuz= on_beden/armhole_front.2< on_beden/armhole_front.1< | reverse false (a.bas<->b.bas) | gecti |
| dikis_zincir | bel | a: on_beden/waist_front> =yan_beden= arka_beden/waist_back< | b: on_etek/waist_front< =yan_etek= arka_etek/waist_back> | reverse false (a.bas<->b.bas) | gecti |
| dikis_zincir | yan_etek | a: on_etek/side_front.1> on_etek/side_front.2> | b: arka_etek/side_back.1> arka_etek/side_back.2> | reverse false (a.bas<->b.bas) | gecti |
| dikis_zincir | kol_alti | a: kol/underarm_front> | b: kol/underarm_back> | reverse true (a.bas<->b.son) | gecti |
| dikis_uzunluk | omuz | a 119.98 mm, hedef 119.98 (ratio 1.0000 x b 119.98 + ease 0.00), artik 0.00 mm | gecti |
| dikis_uzunluk | yan_beden | a 210.96 mm, hedef 210.96 (ratio 1.0000 x b 210.96 + ease 0.00), artik 0.00 mm | gecti |
| centik | yan_beden @0.5000 | iki tarafta en kotu sapma 0.00 mm | gecti |
| dikis_uzunluk | kol_oyugu | a 373.62 mm, hedef 373.62 (ratio 1.0400 x b 359.25 + ease 0.00), artik -0.00 mm | gecti |
| dikis_uzunluk | bel | a 342.50 mm, hedef 342.50 (ratio 1.0000 x b 342.50 + ease 0.00), artik 0.00 mm | gecti |
| centik | bel @0.2500 | iki tarafta en kotu sapma 0.00 mm | gecti |
| centik | bel @0.7500 | iki tarafta en kotu sapma 0.00 mm | gecti |
| dikis_uzunluk | yan_etek | a 590.54 mm, hedef 590.54 (ratio 1.0000 x b 590.54 + ease 0.00), artik 0.00 mm | gecti |
| dikis_uzunluk | kol_alti | a 188.30 mm, hedef 188.30 (ratio 1.0000 x b 188.30 + ease 0.00), artik 0.00 mm | gecti |
| yerlestirme | on_beden | 2B poz (kok) theta 0.00 deg, t (0.00, 0.00); alan 675.25 cm2, cevre 1124.06 mm | bilgi |
| yerlestirme | arka_beden | 2B poz (omuz) theta 43.34 deg AYNA, t (18.00, -45.29); alan 716.48 cm2, cevre 1157.78 mm | bilgi |
| yerlestirme | on_etek | 2B poz (bel) theta 0.00 deg, t (0.00, 0.00); alan 1310.26 cm2, cevre 1579.29 mm | bilgi |
| yerlestirme | arka_etek | 2B poz (bel) theta 99.04 deg AYNA, t (-186.99, 159.59); alan 1310.26 cm2, cevre 1579.29 mm | bilgi |
| yerlestirme | kol | 2B poz (kol_oyugu) theta 123.32 deg AYNA, t (68.59, 1.39); alan 774.59 cm2, cevre 1060.72 mm | bilgi |
| halka_kapanma | yaka (neck) | toplam 154.51 mm, en buyuk kavsak boslugu 0.00 mm — arka_beden/neck_back< -> on_beden/neck_front: dikis omuz (0.00) | on_beden/neck_front> -> arka_beden/neck_back: kat aynasi | gecti |
| halka_kapanma | kol_oyugu_halka (armhole) | toplam 359.25 mm, en buyuk kavsak boslugu 0.00 mm — on_beden/armhole_front.1> -> on_beden/armhole_front.2: kose | on_beden/armhole_front.2> -> arka_beden/armhole_back.2: dikis omuz (0.00) | arka_beden/armhole_back.2< -> arka_beden/armhole_back.1: kose | arka_beden/armhole_back.1< -> on_beden/armhole_front.1: dikis yan_beden (0.00) | gecti |
| halka_kapanma | bel_halka (waist_ring) | toplam 342.50 mm, en buyuk kavsak boslugu 0.00 mm — on_beden/waist_front> -> arka_beden/waist_back: dikis yan_beden (0.00) | arka_beden/waist_back< -> on_beden/waist_front: kat aynasi | gecti |
| halka_kapanma | etek_ucu (hem) | toplam 475.00 mm, en buyuk kavsak boslugu 0.00 mm — on_etek/hem_front> -> arka_etek/hem_back: dikis yan_etek (0.00) | arka_etek/hem_back< -> on_etek/hem_front: kat aynasi | gecti |
| halka_kapanma | kol_agzi (sleeve_hem) | toplam 310.50 mm, en buyuk kavsak boslugu 0.00 mm — kol/hem> -> kol/hem: dikis kol_alti (0.00) | gecti |
