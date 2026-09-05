# Dikilebilirlik — taban-elbise @ croquis36 (on/arka esit)

**Sonuc: DIKILEBILIR DEGIL** — kirmizi hukum 1 / 61 satir.

## Dikisler

| dikis | a (mm) | hedef = ratio x b + ease | artik (mm) | uc boslugu (bilgi) | centik sapma (mm) | hukum |
|---|---|---|---|---|---|---|
| omuz | 143.34 | 143.34 (b 143.34) | 0.00 | 0.00 | - | gecti |
| yan_beden | 155.77 | 155.77 (b 155.77) | 0.00 | 0.00 | 0.00 | gecti |
| kol_oyugu | 417.10 | 490.37 (b 471.51) | -73.27 | 103.43 | - | KIRMIZI |
| bel | 342.50 | 342.50 (b 342.50) | 0.00 | 0.00 | 0.00, 0.00 | gecti |
| yan_etek | 590.54 | 590.54 (b 590.54) | 0.00 | 0.00 | - | gecti |
| kol_alti | 132.10 | 132.10 (b 132.10) | 0.00 | 0.00 | - | gecti |

## Halkalar (sanal dikis)

| halka | rol | toplam (mm) | kapanma (mm) | kavsaklar | hukum |
|---|---|---|---|---|---|
| yaka | neck | 117.74 | 0.00 | arka_beden/neck_back -> on_beden/neck_front: kat aynasi | on_beden/neck_front -> arka_beden/neck_back: dikis omuz (0.00) | gecti |
| kol_oyugu_halka | armhole | 471.51 | 0.00 | on_beden/armhole_front.1 -> on_beden/armhole_front.2: kose | on_beden/armhole_front.2 -> arka_beden/armhole_back.2: dikis omuz (0.00) | arka_beden/armhole_back.2 -> arka_beden/armhole_back.1: kose | arka_beden/armhole_back.1 -> on_beden/armhole_front.1: dikis yan_beden (0.00) | gecti |
| bel_halka | waist_ring | 342.50 | 0.00 | on_beden/waist_front -> arka_beden/waist_back: dikis yan_beden (0.00) | arka_beden/waist_back -> on_beden/waist_front: kat aynasi | gecti |
| etek_ucu | hem | 475.00 | 0.00 | on_etek/hem_front -> arka_etek/hem_back: dikis yan_etek (0.00) | arka_etek/hem_back -> on_etek/hem_front: kat aynasi | gecti |
| kol_agzi | sleeve_hem | 310.50 | 0.00 | kol/hem -> kol/hem: dikis kol_alti (0.00) | gecti |

## Paneller (rijit 2B yerlestirme, bilgi)

| panel | yerlesti | dikis | theta (deg) | t (mm) | alan (cm2) | cevre (mm) |
|---|---|---|---|---|---|---|
| on_beden | evet | kok | 0.00 | (0.00, 0.00) | 662.37 | 1130.14 |
| arka_beden | evet | omuz | 180.00 | (232.90, 49.00) | 680.48 | 1172.81 |
| on_etek | evet | bel | -98.53 | (-298.65, -113.82) | 1310.26 | 1579.29 |
| arka_etek | evet | bel | 0.00 | (0.00, 0.00) | 1310.26 | 1579.29 |
| kol | evet | kol_oyugu | -123.04 | (-105.22, 51.76) | 676.25 | 991.80 |

## Hukumler

| kural | hedef | deger | sonuc |
|---|---|---|---|
| tolerans | contract | dikis 2.00 · centik 0.50 · halka 2.00 · pens 2.00 mm; ratio [1.00, 3.50] | bilgi |
| sema | taban-elbise | sozlesmeyle uyumlu | gecti |
| panel_kapali | on_beden | 7 kenar, halka kapali | gecti |
| panel_kapali | arka_beden | 7 kenar, halka kapali | gecti |
| panel_kapali | on_etek | 5 kenar, halka kapali | gecti |
| panel_kapali | arka_etek | 5 kenar, halka kapali | gecti |
| panel_kapali | kol | 5 kenar, halka kapali | gecti |
| referans | taban-elbise | 6 dikis, 5 halka; tum referanslar cozuldu | gecti |
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
| dikis_uzunluk | omuz | a 143.34 mm, hedef 143.34 (ratio 1.0000 x b 143.34 + ease 0.00), artik 0.00 mm | gecti |
| dikis_uzunluk | yan_beden | a 155.77 mm, hedef 155.77 (ratio 1.0000 x b 155.77 + ease 0.00), artik 0.00 mm | gecti |
| centik | yan_beden @0.5000 | iki tarafta en kotu sapma 0.00 mm | gecti |
| dikis_uzunluk | kol_oyugu | a 417.10 mm, hedef 490.37 (ratio 1.0400 x b 471.51 + ease 0.00), artik -73.27 mm | KIRMIZI |
| dikis_uzunluk | bel | a 342.50 mm, hedef 342.50 (ratio 1.0000 x b 342.50 + ease 0.00), artik 0.00 mm | gecti |
| centik | bel @0.2500 | iki tarafta en kotu sapma 0.00 mm | gecti |
| centik | bel @0.7500 | iki tarafta en kotu sapma 0.00 mm | gecti |
| dikis_uzunluk | yan_etek | a 590.54 mm, hedef 590.54 (ratio 1.0000 x b 590.54 + ease 0.00), artik 0.00 mm | gecti |
| dikis_uzunluk | kol_alti | a 132.10 mm, hedef 132.10 (ratio 1.0000 x b 132.10 + ease 0.00), artik 0.00 mm | gecti |
| yerlestirme | on_beden | rijit poz (kok) theta 0.00 deg, t (0.00, 0.00); alan 662.37 cm2, cevre 1130.14 mm | bilgi |
| yerlestirme | arka_beden | rijit poz (omuz) theta 180.00 deg, t (232.90, 49.00); alan 680.48 cm2, cevre 1172.81 mm | bilgi |
| yerlestirme | on_etek | rijit poz (bel) theta -98.53 deg, t (-298.65, -113.82); alan 1310.26 cm2, cevre 1579.29 mm | bilgi |
| yerlestirme | arka_etek | rijit poz (bel) theta 0.00 deg, t (0.00, 0.00); alan 1310.26 cm2, cevre 1579.29 mm | bilgi |
| yerlestirme | kol | rijit poz (kol_oyugu) theta -123.04 deg, t (-105.22, 51.76); alan 676.25 cm2, cevre 991.80 mm | bilgi |
| halka_kapanma | yaka (neck) | toplam 117.74 mm, en buyuk kavsak boslugu 0.00 mm | gecti |
| halka_kapanma | kol_oyugu_halka (armhole) | toplam 471.51 mm, en buyuk kavsak boslugu 0.00 mm | gecti |
| halka_kapanma | bel_halka (waist_ring) | toplam 342.50 mm, en buyuk kavsak boslugu 0.00 mm | gecti |
| halka_kapanma | etek_ucu (hem) | toplam 475.00 mm, en buyuk kavsak boslugu 0.00 mm | gecti |
| halka_kapanma | kol_agzi (sleeve_hem) | toplam 310.50 mm, en buyuk kavsak boslugu 0.00 mm | gecti |
