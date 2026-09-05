# Dikilebilirlik — taban-elbise @ gercek36

**Sonuc: DIKILEBILIR** — kirmizi hukum 0 / 61 satir.

## Dikisler

| dikis | a (mm) | hedef = ratio x b + ease | artik (mm) | uc boslugu (bilgi) | centik sapma (mm) | hukum |
|---|---|---|---|---|---|---|
| omuz | 119.98 | 119.98 (b 119.98) | 0.00 | 0.00 | - | gecti |
| yan_beden | 210.96 | 210.96 (b 210.96) | 0.00 | 0.00 | 0.00 | gecti |
| kol_oyugu | 373.62 | 373.62 (b 359.25) | -0.00 | 155.07 | - | gecti |
| bel | 342.50 | 342.50 (b 342.50) | 0.00 | 0.00 | 0.00, 0.00 | gecti |
| yan_etek | 590.54 | 590.54 (b 590.54) | 0.00 | 0.00 | - | gecti |
| kol_alti | 188.30 | 188.30 (b 188.30) | 0.00 | 0.00 | - | gecti |

## Halkalar (sanal dikis)

| halka | rol | toplam (mm) | kapanma (mm) | kavsaklar | hukum |
|---|---|---|---|---|---|
| yaka | neck | 154.51 | 0.00 | arka_beden/neck_back -> on_beden/neck_front: kat aynasi | on_beden/neck_front -> arka_beden/neck_back: dikis omuz (0.00) | gecti |
| kol_oyugu_halka | armhole | 359.25 | 0.00 | on_beden/armhole_front.1 -> on_beden/armhole_front.2: kose | on_beden/armhole_front.2 -> arka_beden/armhole_back.2: dikis omuz (0.00) | arka_beden/armhole_back.2 -> arka_beden/armhole_back.1: kose | arka_beden/armhole_back.1 -> on_beden/armhole_front.1: dikis yan_beden (0.00) | gecti |
| bel_halka | waist_ring | 342.50 | 0.00 | on_beden/waist_front -> arka_beden/waist_back: dikis yan_beden (0.00) | arka_beden/waist_back -> on_beden/waist_front: kat aynasi | gecti |
| etek_ucu | hem | 475.00 | 0.00 | on_etek/hem_front -> arka_etek/hem_back: dikis yan_etek (0.00) | arka_etek/hem_back -> on_etek/hem_front: kat aynasi | gecti |
| kol_agzi | sleeve_hem | 310.50 | 0.00 | kol/hem -> kol/hem: dikis kol_alti (0.00) | gecti |

## Paneller (rijit 2B yerlestirme, bilgi)

| panel | yerlesti | dikis | theta (deg) | t (mm) | alan (cm2) | cevre (mm) |
|---|---|---|---|---|---|---|
| on_beden | evet | kok | 0.00 | (0.00, 0.00) | 675.25 | 1124.06 |
| arka_beden | evet | omuz | 180.00 | (243.50, 44.30) | 716.48 | 1157.78 |
| on_etek | evet | bel | -97.66 | (-291.43, -123.97) | 1310.26 | 1579.29 |
| arka_etek | evet | bel | 0.00 | (0.00, 0.00) | 1310.26 | 1579.29 |
| kol | evet | kol_oyugu | 102.52 | (325.43, 236.17) | 774.59 | 1060.72 |

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
| dikis_uzunluk | omuz | a 119.98 mm, hedef 119.98 (ratio 1.0000 x b 119.98 + ease 0.00), artik 0.00 mm | gecti |
| dikis_uzunluk | yan_beden | a 210.96 mm, hedef 210.96 (ratio 1.0000 x b 210.96 + ease 0.00), artik 0.00 mm | gecti |
| centik | yan_beden @0.5000 | iki tarafta en kotu sapma 0.00 mm | gecti |
| dikis_uzunluk | kol_oyugu | a 373.62 mm, hedef 373.62 (ratio 1.0400 x b 359.25 + ease 0.00), artik -0.00 mm | gecti |
| dikis_uzunluk | bel | a 342.50 mm, hedef 342.50 (ratio 1.0000 x b 342.50 + ease 0.00), artik 0.00 mm | gecti |
| centik | bel @0.2500 | iki tarafta en kotu sapma 0.00 mm | gecti |
| centik | bel @0.7500 | iki tarafta en kotu sapma 0.00 mm | gecti |
| dikis_uzunluk | yan_etek | a 590.54 mm, hedef 590.54 (ratio 1.0000 x b 590.54 + ease 0.00), artik 0.00 mm | gecti |
| dikis_uzunluk | kol_alti | a 188.30 mm, hedef 188.30 (ratio 1.0000 x b 188.30 + ease 0.00), artik 0.00 mm | gecti |
| yerlestirme | on_beden | rijit poz (kok) theta 0.00 deg, t (0.00, 0.00); alan 675.25 cm2, cevre 1124.06 mm | bilgi |
| yerlestirme | arka_beden | rijit poz (omuz) theta 180.00 deg, t (243.50, 44.30); alan 716.48 cm2, cevre 1157.78 mm | bilgi |
| yerlestirme | on_etek | rijit poz (bel) theta -97.66 deg, t (-291.43, -123.97); alan 1310.26 cm2, cevre 1579.29 mm | bilgi |
| yerlestirme | arka_etek | rijit poz (bel) theta 0.00 deg, t (0.00, 0.00); alan 1310.26 cm2, cevre 1579.29 mm | bilgi |
| yerlestirme | kol | rijit poz (kol_oyugu) theta 102.52 deg, t (325.43, 236.17); alan 774.59 cm2, cevre 1060.72 mm | bilgi |
| halka_kapanma | yaka (neck) | toplam 154.51 mm, en buyuk kavsak boslugu 0.00 mm | gecti |
| halka_kapanma | kol_oyugu_halka (armhole) | toplam 359.25 mm, en buyuk kavsak boslugu 0.00 mm | gecti |
| halka_kapanma | bel_halka (waist_ring) | toplam 342.50 mm, en buyuk kavsak boslugu 0.00 mm | gecti |
| halka_kapanma | etek_ucu (hem) | toplam 475.00 mm, en buyuk kavsak boslugu 0.00 mm | gecti |
| halka_kapanma | kol_agzi (sleeve_hem) | toplam 310.50 mm, en buyuk kavsak boslugu 0.00 mm | gecti |
