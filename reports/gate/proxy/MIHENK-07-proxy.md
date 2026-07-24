# DAMLA-VEKİLİ TASLAK SEÇİMİ — MIHENK-07 (wrap elbise)
> B-kategori: vekil TASLAK, Damla sabah mühürler. PIN DEĞİL.
> ⚠️ DİSK-GÜVENLİ MOD: bu gece Chrome/PNG render DİSKİ DOLDURDUĞU için görsel
> yargı SVG GEOMETRİSİNDEN yapıldı (piksel-doğrulanmadı). Damla sabah gözle bakar.

## BAĞLAM (vekile verilen)
- **Mihenk 5'lisinin 2. hedefi = wrap elbise** (mayoz zinciri: shift → wrap → gode).
- **taste-lexicon:** "vektör-şema / parantez" (iç çizgi anatomik olmalı) + "yelpaze"
  (drape asimetrik, ayna değil) + "steril" (drape/işaret olmalı). Wrap treatment bu
  derslere uyuyor: overlap edge apex'ten geçen S (parantez değil), drape asimetrik seed.
- **STYLE-PIN'ler:** band-top köprü stilleri (prenses seam içermez) → wrap onları etkilemez.

## YENİ PRİMİTİF (F1 işi — bu turda eklendi)
render-garment-flat.mjs'e opt-in `spec.wrap` treatment: (1) surplice OVERLAP EDGE —
omuz-boyun noktasından apex üzerinden KARŞI bele S-eğrisiyle CF'yi geçen çapraz kapanma;
(2) UNDERLAP edge (alttaki panel, ince kesikli); (3) yan-dikişten çıkıp CF'de düğümlenen
self-fabric BAĞ (knot + iki kuyruk). Body simetrik (gerçek wrap panel başına simetrik
kesilir; wrap = ön kapanma). **Opt-in → golden + pinler byte-identical.**

## IZGARA (6 varyant)
| var | fark | okuma (geometriden) |
|-----|------|---------------------|
| w1  | wrap-sol · A-line midi · kısa kol · vNeck | **baz — kanonik wrap silueti**; overlap (30,66)→CF geçip→(-18,150) sol bel, apex'ten geçiyor |
| w2  | wrap-sağ (ayna) | w1'in aynası; hangi omuzdan başladığı = overlap yönü tercihi |
| w3  | gathered etek | daha akışkan/DVF hissi (drape ink regime farkı — piksel doğrulanmadı) |
| w4  | shift etek | düz/dar; wrap için fazla sert olabilir |
| w5  | scoop (derin V) | surplice daha açık; overlap edge daha alçak başlıyor |
| w6  | kolsuz | yazlık wrap; kol grubu yok |

## TASLAK SEÇİM: **w1** — gerekçeli (geometri)
- Kanonik wrap silueti: fitted darted bodice + surplice çapraz + A-line akışkan etek +
  bel bağı. Overlap edge apex'ten geçen S (taste-lexicon "anatomik" dersine uyuyor).
- w3 (gathered) daha akışkan olabilir ama drape canlılığı SVG'den kesin okunamadı →
  **RUNNER-UP, Damla piksel karşılaştırsın** (w1 vs w3, akışkanlık tercihi onun gözü).
- w4 (shift) wrap ruhuna ters (sert); w5 (scoop) surplice'i abartıyor; w6 mevsimlik varyant.

**HÜKÜM:** w1 taslak "kalemim" adayı. Kanonik + anatomik + taste-lexicon uyumlu.
Not: SURPLICE YAKA outline'da hâlâ simetrik vNeck notch (asimetrik yaka kesimi F3/park
işi) — overlap edge surplice'i çiziyor ama outline'daki vNeck onunla yarışıyor olabilir;
Damla "yaka çift okunuyor" derse F3'te asimetrik surplice outline (2. tur) hakkı var.

## SABAH DAMLA'YA
- w1 onayı: styles.json'a wrap elbise stili + STYLE-PIN + style_check. **PIN YAZILMADI** (C).
- "değil" gelirse gerekçe → taste-lexicon + 2. tur (asimetrik surplice outline / drape).

## TEKNİK DENETİM (bu turda geçti — measured)
ctest 48/48 · golden byte-identical · style_check pinler byte-identical · flat_render_lint
6 wrap varyantı temiz (self-intersect/winding/zero-area yok = ÜRETİLEBİLİR) · preview-truth
4/4 · style-lint 82 sayfa temiz.

## PROMPT LOGU
Harici VLM API çağrısı YAPILMADI (kredi vision işlerine ayrılı + disk-güvenli mod: Chrome
yok). Görsel yargı SVG path koordinatlarından. Damla-zevk-modeli API'si gelince sistematik
çağrıya döner (DEVAM-FASHION geçici-vekil maddesi).
