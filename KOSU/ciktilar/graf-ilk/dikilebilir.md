# Dikilebilirlik — graftan cizime, her dikis cifti iki taraf (0509 A2b)

Kaynak: `engine/build/grafdogrula <graf.json> <bodyId> --json` (motorun kendi hukmu). Graf: `KOSU/ciktilar/graf-ilk/graf.json` (`taban-elbise`). Bu tablo hesap yapmaz, motorun sayilarini basar.

## Esikler (contract/graf-v1.json)

| tolerans | mm | kaynak |
|---|---|---|
| dikisUzunlukMM | 2.00 | contract/body-v1.json ayniInsan.toleransMM ile AYNI zincir: URBN Apparel Technical Manual 'Position points, olcu <5 in' = 1/8 in = 3.175 mm ust sinir (knowledge/POM-TOLERANS-URBN-2026-08-23.md); repodaki CLO sayisi engin |
| centikMM | 0.50 | engine/tests/notch_alignment_check.cpp (2026-09-03): 'dikisin ustunde yurunen mm ... 0.5mm icinde' — motorun mevcut centik kapisi, repo konvansiyonu (yayin yok, DOGRULANMADI). En kisitlayici var olan deger. |
| halkaKapanmaMM | 2.00 | dikisUzunlukMM ile ayni: halka bir dikisin uzunluk artigi ya da bir kavsakta iki dikisin farkiyla kapanir; ayni buyukluk, ayni dayanak. |
| pensBacakMM | 2.00 | engine/src/validator.hpp dartSumTolerance 2.0 (repo konvansiyonu) ve dikisUzunlukMM ile ayni zincir; pens bacaklari insadan esit oldugu icin fark yalniz sayisal artiktir. |

## SANAL DIKIS — her bedende en kotu artik

`sanalDikisMM` = butun dikis ciftlerinin uzunluk artigi ve butun halka kavsak bosluklarinin MUTLAK EN BUYUGU. Esik: dikis `dikisUzunlukMM` = 2.00 mm, halka `halkaKapanmaMM` = 2.00 mm.

| beden | en kotu dikis artigi (mm) | en kotu halka kapanmasi (mm) | sanalDikisMM | esik | hukum | kirmizi |
|---|---|---|---|---|---|---|
| gercek36 | 0.00 | 0.00 | **0.00** | 2.00 | GECTI | 0 |
| croquis36 | 0.00 | 0.00 | **0.00** | 2.00 | GECTI | 0 |
| EU34 | 0.00 | 0.00 | **0.00** | 2.00 | GECTI | 0 |
| EU36 | 0.00 | 0.00 | **0.00** | 2.00 | GECTI | 0 |
| EU38 | 0.00 | 0.00 | **0.00** | 2.00 | GECTI | 0 |
| EU40 | 0.00 | 0.00 | **0.00** | 2.00 | GECTI | 0 |
| EU42 | 0.00 | 0.00 | **0.00** | 2.00 | GECTI | 0 |
| EU44 | 0.00 | 0.00 | **0.00** | 2.00 | GECTI | 0 |

## gercek36 — dikis ciftleri (iki taraf mm)

| dikis | reverse | a tarafi (mm) | b tarafi (mm) | hedef = ratio x b + ease | artik (mm) | uc boslugu (bilgi) | hukum |
|---|---|---|---|---|---|---|---|
| omuz | false | 119.98 | 119.98 | 119.98 | 0.00 | 0.00 | gecti |
| yan_beden | false | 210.96 | 210.96 | 210.96 | 0.00 | 0.00 | gecti |
| kol_oyugu | false | 373.62 | 359.25 | 373.62 | -0.00 | 310.50 | gecti |
| bel | false | 342.50 | 342.50 | 342.50 | 0.00 | 0.00 | gecti |
| yan_etek | false | 590.54 | 590.54 | 590.54 | 0.00 | 0.00 | gecti |
| kol_alti | true | 188.30 | 188.30 | 188.30 | 0.00 | 0.00 | gecti |

### gercek36 — halkalar (sanal dikis kapanmasi)

| halka | rol | toplam (mm) | kapanma (mm) | en kotu kavsak | hukum |
|---|---|---|---|---|---|
| yaka | neck | 154.51 | 0.00 | - | gecti |
| kol_oyugu_halka | armhole | 359.25 | 0.00 | - | gecti |
| bel_halka | waist_ring | 342.50 | 0.00 | - | gecti |
| etek_ucu | hem | 475.00 | 0.00 | - | gecti |
| kol_agzi | sleeve_hem | 310.50 | 0.00 | - | gecti |

## croquis36 — dikis ciftleri (iki taraf mm)

| dikis | reverse | a tarafi (mm) | b tarafi (mm) | hedef = ratio x b + ease | artik (mm) | uc boslugu (bilgi) | hukum |
|---|---|---|---|---|---|---|---|
| omuz | false | 143.34 | 143.34 | 143.34 | 0.00 | 0.00 | gecti |
| yan_beden | false | 155.77 | 155.77 | 155.77 | 0.00 | 0.00 | gecti |
| kol_oyugu | false | 490.37 | 471.51 | 490.37 | 0.00 | 310.50 | gecti |
| bel | false | 342.50 | 342.50 | 342.50 | 0.00 | 0.00 | gecti |
| yan_etek | false | 590.54 | 590.54 | 590.54 | 0.00 | 0.00 | gecti |
| kol_alti | true | 132.10 | 132.10 | 132.10 | 0.00 | 0.00 | gecti |

### croquis36 — halkalar (sanal dikis kapanmasi)

| halka | rol | toplam (mm) | kapanma (mm) | en kotu kavsak | hukum |
|---|---|---|---|---|---|
| yaka | neck | 117.74 | 0.00 | - | gecti |
| kol_oyugu_halka | armhole | 471.51 | 0.00 | - | gecti |
| bel_halka | waist_ring | 342.50 | 0.00 | - | gecti |
| etek_ucu | hem | 475.00 | 0.00 | - | gecti |
| kol_agzi | sleeve_hem | 310.50 | 0.00 | - | gecti |

## EU34 — dikis ciftleri (iki taraf mm)

| dikis | reverse | a tarafi (mm) | b tarafi (mm) | hedef = ratio x b + ease | artik (mm) | uc boslugu (bilgi) | hukum |
|---|---|---|---|---|---|---|---|
| omuz | false | 117.51 | 117.51 | 117.51 | 0.00 | 0.00 | gecti |
| yan_beden | false | 210.00 | 210.00 | 210.00 | 0.00 | 0.00 | gecti |
| kol_oyugu | false | 363.14 | 349.18 | 363.14 | 0.00 | 300.50 | gecti |
| bel | false | 322.50 | 322.50 | 322.50 | 0.00 | 0.00 | gecti |
| yan_etek | false | 585.69 | 585.69 | 585.69 | 0.00 | 0.00 | gecti |
| kol_alti | true | 191.40 | 191.40 | 191.40 | 0.00 | 0.00 | gecti |

### EU34 — halkalar (sanal dikis kapanmasi)

| halka | rol | toplam (mm) | kapanma (mm) | en kotu kavsak | hukum |
|---|---|---|---|---|---|
| yaka | neck | 152.36 | 0.00 | - | gecti |
| kol_oyugu_halka | armhole | 349.18 | 0.00 | - | gecti |
| bel_halka | waist_ring | 322.50 | 0.00 | - | gecti |
| etek_ucu | hem | 455.00 | 0.00 | - | gecti |
| kol_agzi | sleeve_hem | 300.50 | 0.00 | - | gecti |

## EU36 — dikis ciftleri (iki taraf mm)

| dikis | reverse | a tarafi (mm) | b tarafi (mm) | hedef = ratio x b + ease | artik (mm) | uc boslugu (bilgi) | hukum |
|---|---|---|---|---|---|---|---|
| omuz | false | 119.98 | 119.98 | 119.98 | 0.00 | 0.00 | gecti |
| yan_beden | false | 210.96 | 210.96 | 210.96 | 0.00 | 0.00 | gecti |
| kol_oyugu | false | 373.62 | 359.25 | 373.62 | -0.00 | 310.50 | gecti |
| bel | false | 342.50 | 342.50 | 342.50 | 0.00 | 0.00 | gecti |
| yan_etek | false | 590.54 | 590.54 | 590.54 | 0.00 | 0.00 | gecti |
| kol_alti | true | 188.30 | 188.30 | 188.30 | 0.00 | 0.00 | gecti |

### EU36 — halkalar (sanal dikis kapanmasi)

| halka | rol | toplam (mm) | kapanma (mm) | en kotu kavsak | hukum |
|---|---|---|---|---|---|
| yaka | neck | 154.51 | 0.00 | - | gecti |
| kol_oyugu_halka | armhole | 359.25 | 0.00 | - | gecti |
| bel_halka | waist_ring | 342.50 | 0.00 | - | gecti |
| etek_ucu | hem | 475.00 | 0.00 | - | gecti |
| kol_agzi | sleeve_hem | 310.50 | 0.00 | - | gecti |

## EU38 — dikis ciftleri (iki taraf mm)

| dikis | reverse | a tarafi (mm) | b tarafi (mm) | hedef = ratio x b + ease | artik (mm) | uc boslugu (bilgi) | hukum |
|---|---|---|---|---|---|---|---|
| omuz | false | 122.45 | 122.45 | 122.45 | 0.00 | 0.00 | gecti |
| yan_beden | false | 211.93 | 211.93 | 211.93 | 0.00 | 0.00 | gecti |
| kol_oyugu | false | 384.38 | 369.59 | 384.38 | 0.00 | 320.50 | gecti |
| bel | false | 362.50 | 362.50 | 362.50 | 0.00 | 0.00 | gecti |
| yan_etek | false | 595.39 | 595.39 | 595.39 | 0.00 | 0.00 | gecti |
| kol_alti | true | 190.80 | 190.80 | 190.80 | 0.00 | 0.00 | gecti |

### EU38 — halkalar (sanal dikis kapanmasi)

| halka | rol | toplam (mm) | kapanma (mm) | en kotu kavsak | hukum |
|---|---|---|---|---|---|
| yaka | neck | 156.73 | 0.00 | - | gecti |
| kol_oyugu_halka | armhole | 369.59 | 0.00 | - | gecti |
| bel_halka | waist_ring | 362.50 | 0.00 | - | gecti |
| etek_ucu | hem | 495.00 | 0.00 | - | gecti |
| kol_agzi | sleeve_hem | 320.50 | 0.00 | - | gecti |

## EU40 — dikis ciftleri (iki taraf mm)

| dikis | reverse | a tarafi (mm) | b tarafi (mm) | hedef = ratio x b + ease | artik (mm) | uc boslugu (bilgi) | hukum |
|---|---|---|---|---|---|---|---|
| omuz | false | 125.05 | 125.05 | 125.05 | 0.00 | 0.00 | gecti |
| yan_beden | false | 212.90 | 212.90 | 212.90 | 0.00 | 0.00 | gecti |
| kol_oyugu | false | 395.29 | 380.09 | 395.29 | -0.00 | 330.50 | gecti |
| bel | false | 382.50 | 382.50 | 382.50 | 0.00 | 0.00 | gecti |
| yan_etek | false | 600.25 | 600.25 | 600.25 | 0.00 | 0.00 | gecti |
| kol_alti | true | 187.80 | 187.80 | 187.80 | 0.00 | 0.00 | gecti |

### EU40 — halkalar (sanal dikis kapanmasi)

| halka | rol | toplam (mm) | kapanma (mm) | en kotu kavsak | hukum |
|---|---|---|---|---|---|
| yaka | neck | 158.89 | 0.00 | - | gecti |
| kol_oyugu_halka | armhole | 380.09 | 0.00 | - | gecti |
| bel_halka | waist_ring | 382.50 | 0.00 | - | gecti |
| etek_ucu | hem | 515.00 | 0.00 | - | gecti |
| kol_agzi | sleeve_hem | 330.50 | 0.00 | - | gecti |

## EU42 — dikis ciftleri (iki taraf mm)

| dikis | reverse | a tarafi (mm) | b tarafi (mm) | hedef = ratio x b + ease | artik (mm) | uc boslugu (bilgi) | hukum |
|---|---|---|---|---|---|---|---|
| omuz | false | 127.52 | 127.52 | 127.52 | 0.00 | 0.00 | gecti |
| yan_beden | false | 213.86 | 213.86 | 213.86 | 0.00 | 0.00 | gecti |
| kol_oyugu | false | 406.59 | 390.95 | 406.59 | 0.00 | 340.50 | gecti |
| bel | false | 402.50 | 402.50 | 402.50 | 0.00 | 0.00 | gecti |
| yan_etek | false | 605.11 | 605.11 | 605.11 | 0.00 | 0.00 | gecti |
| kol_alti | true | 190.30 | 190.30 | 190.30 | 0.00 | 0.00 | gecti |

### EU42 — halkalar (sanal dikis kapanmasi)

| halka | rol | toplam (mm) | kapanma (mm) | en kotu kavsak | hukum |
|---|---|---|---|---|---|
| yaka | neck | 161.11 | 0.00 | - | gecti |
| kol_oyugu_halka | armhole | 390.95 | 0.00 | - | gecti |
| bel_halka | waist_ring | 402.50 | 0.00 | - | gecti |
| etek_ucu | hem | 535.00 | 0.00 | - | gecti |
| kol_agzi | sleeve_hem | 340.50 | 0.00 | - | gecti |

## EU44 — dikis ciftleri (iki taraf mm)

| dikis | reverse | a tarafi (mm) | b tarafi (mm) | hedef = ratio x b + ease | artik (mm) | uc boslugu (bilgi) | hukum |
|---|---|---|---|---|---|---|---|
| omuz | false | 129.99 | 129.99 | 129.99 | 0.00 | 0.00 | gecti |
| yan_beden | false | 214.83 | 214.83 | 214.83 | 0.00 | 0.00 | gecti |
| kol_oyugu | false | 418.18 | 402.10 | 418.18 | -0.00 | 350.50 | gecti |
| bel | false | 422.50 | 422.50 | 422.50 | 0.00 | 0.00 | gecti |
| yan_etek | false | 609.98 | 609.98 | 609.98 | 0.00 | 0.00 | gecti |
| kol_alti | true | 187.20 | 187.20 | 187.20 | 0.00 | 0.00 | gecti |

### EU44 — halkalar (sanal dikis kapanmasi)

| halka | rol | toplam (mm) | kapanma (mm) | en kotu kavsak | hukum |
|---|---|---|---|---|---|
| yaka | neck | 163.27 | 0.00 | - | gecti |
| kol_oyugu_halka | armhole | 402.10 | 0.00 | - | gecti |
| bel_halka | waist_ring | 422.50 | 0.00 | - | gecti |
| etek_ucu | hem | 555.00 | 0.00 | - | gecti |
| kol_agzi | sleeve_hem | 350.50 | 0.00 | - | gecti |

## KAPANMAYAN DIKIS

Yok: 8 bedende de her dikis cifti ve her halka kavsagi esigin altinda kapaniyor.

## CIZIMDE ADIYLA DURAN KUSUR (A2b, olculdu)

- **Kol, flat gorunumde ACILMIS duruyor.** Kat kenari olmayan panel (kol) yerini dogrulayicinin dikis agaci pozundan alir; o poz kol oyugu dikisini "kitap gibi" acar, yani kol govdenin YANINA yatik cikar, asagi sarkmaz. Dikis olarak DOGRU (kol_oyugu artigi `1e-8 mm`), cizim konvansiyonu olarak EKSIK: satilan flat'te kol govdeye sevkPoz.kolAcisiDeg (contract/flat-convention-v1.json) acisiyla sarkitilir. Bu aciyi baglamak A2c/A4'un isi; burada UYDURULMADI.
- **Kol yalnizca bir gorunumde.** Kol iki gorunume de girmez; kat kenari olmadigi icin dikis grafindan yayilan tek gorunume (bu grafta `cb`) dusuyor. On gorunumde kol cizilmiyor — sessiz degil, `data-gorunum` ile SVG'de ilan ediliyor.
