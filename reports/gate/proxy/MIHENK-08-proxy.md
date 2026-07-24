# DAMLA-VEKİLİ TASLAK SEÇİMİ — MIHENK-08 (godeli midi etek / gore flat)
> B-kategori: vekil TASLAK, Damla sabah mühürler. PIN DEĞİL.
> ⚠️ DİSK-GÜVENLİ MOD: görsel yargı SVG GEOMETRİSİNDEN (Chrome yok, piksel-doğrulanmadı).

## BAĞLAM
- **Mihenk 5'lisinin 3. hedefi = godeli midi etek.** Gode ZATEN motorda canlı
  (SkirtStyle::Gore 6-panel, WASM deploy, golden byte-identical — DONUS-OZETI madde 5).
  Eksik olan: **flat KALEMİN gore'u çizmesi** (listing görseli). Bu halka onu ekliyor.
- **taste-lexicon:** "steril" (drape/işaret olmalı) — gore seam'leri + drape ink ikisi
  birden var artık; "vektör-şema" — panel seam'leri anatomik değil ama KESİM gerçeği
  (motor 6 panel kesiyor, flat onu gösteriyor), şematik değil üretim doğrusu.

## YENİ PRİMİTİF (F1 işi — bu turda eklendi)
render-garment-flat.mjs skirtStyle 'gore' → VERTİKAL PANEL SEAM'leri: bel→hem, eşit
aralıklı, her biri godet gibi dışa flare (Q-eğrisi). goreCount (varsayılan 6, motorla
aynı) yarısı bir tarafta görünür + CF seam. Drape ink altında (W_SEAM konstrüksiyon).
**Opt-in → golden + pinler byte-identical.**

## IZGARA (6 varyant) + GEOMETRİ DOĞRULAMASI
6-gore (g1): CF seam x=0 + çiftler bel'de ±20/±40/±60 → hem'de ±31.6/±63.2/±94.8
(eşit aralıklı, MONOTON flare, çapraz YOK = üretilebilir). Panel sayısı çalışıyor:
g3=8-gore (4/yarı), g4=4-gore (2/yarı).
| var | fark | okuma |
|-----|------|-------|
| g1  | 6-gore midi (baz) | **motor default'u = 6 panel; midi = mihenk-3 hedefi tam** |
| g2  | 6-gore maxi | daha uzun/dramatik, midi hedefinden sapar |
| g3  | 8-gore midi | daha akışkan/resmi, panel yoğun |
| g4  | 4-gore midi | yapılı/mod, az panel |
| g5  | 6-gore mini | kısa, midi hedefinden sapar |
| g6  | 6-gore kolsuz sade | etek odaklı sade okuma |

## TASLAK SEÇİM: **g1** — gerekçeli (geometri)
- **Motor gerçeğiyle bire bir**: engine 6 panel kesiyor, g1 6 panel gösteriyor →
  flat listing görseli kalıp paketiyle TUTARLI (şartname: listing = gerçek kalıp).
- **midi = mihenk-3'ün tam hedefi** ("godeli midi etek"); g2/g5 boy sapması.
- 6-gore fullness dengeli (g3 fazla panel/resmi, g4 az panel/sert). Godet flare
  hem'de okunuyor (±60 bel → ±94.8 hem, %58 genişleme).

**HÜKÜM:** g1 taslak "kalemim" adayı. Motor-tutarlı + midi hedef + dengeli fullness.
Not: panel seam'leri DÜZ Q-flare; gerçek gore seam hafif S (bel'de dar, kalça'da hafif
iç, hem'de flare) olabilir — Damla "seam eğrisi sert" derse F3 eğri cilası 2. tur hakkı.

## SABAH DAMLA'YA
- g1 onayı: styles.json gore_midi stili + STYLE-PIN + style_check. **PIN YAZILMADI** (C).
- "değil" → taste-lexicon + 2. tur (S-eğri seam / panel sayısı / boy).

## TEKNİK DENETİM (measured)
ctest 48/48 · golden byte-identical · style_check pinler byte-identical · flat_render_lint
green · preview-truth 4/4 · style-lint 82 sayfa · gore seam geometrisi monoton flare
(çapraz yok = üretilebilir).

## PROMPT LOGU
Harici VLM YOK (disk-güvenli, Chrome yok). Görsel yargı SVG koordinatlarından.
