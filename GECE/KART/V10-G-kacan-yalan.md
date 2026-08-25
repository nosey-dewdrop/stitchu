# KART V10-G — KAPIDAN KAÇAN MTM CÜMLELERİ (etiket: SIRALI, son)

## NE
V10-F, canlı `web/` altında **kapının kalıp listesine takılmayan** MTM yalanları
buldu. Onları sil ve **kapıyı SIKILAŞTIR** (gevşetme değil — yeni kalıp EKLEME).

## GİRDİ DOSYALARI (isim isim)
- `ENV.md`, `RULES.md`
- `GECE/V10-F.md` "KART DIŞI FARK EDİLEN" md.2 ve md.4 (kaçan cümlelerin ADLI listesi)
- `engine/tests/landing_truth_check.mjs` — L2 kalıp listesi (SADECE kalıp EKLE)
- `engine/tests/landing-truth-baseline.json`
- `engine/tools/gen-style-pages.mjs` (üreteç; aynı cümleyi basıyorsa orada da düzelt)
- `web/styles/*.html`, `web/collections/*.html`, `web/collection-60s70s.html`

## YAPILACAK
1. **Kaçan cümleleri ADIYLA bul ve sil/dürüstleştir.** Bilinen üçü:
   - 6 stil sayfasında FAQ: *"The engine drafts it from your body, not fixed sizes"*
     → motorun gerçeğinin TAM TERSİ (8 sabit beden, EU34–48).
   - `web/styles/index.html`: *"your seven measurements"*
   - `web/styles/v-neck.html`: *"your own neck measurement"*
   Ayrıca `grep -rniE "from your body|your seven|your (own )?(neck|bust|waist|hip|underbust) (measurement|girth)|sized from your|per body|drafted per"` ile
   `web/**` taraması yap; çıkan HER hit'i yargıla (sil / dürüstleştir / gerekçeyle bırak).
2. **KAPIYI SIKILAŞTIR** — `landing_truth_check.mjs`'in L2 kalıp listesine bu
   ifadeleri EKLE (`from your body`, `your seven measurements`,
   `sized from your body`, `not fixed sizes`, `per body`, `drafted per`).
   ⚠ Kalıp SİLME, eşik GEVŞETME, muafiyet EKLEME yasak (§7.1).
3. **MUTASYON (§4.5):** eklediğin her yeni kalıp için kasıtlı bir yalan cümlesi
   geçici bir fikstürde (`--dir=` ile, `web/` DIŞINDA) kapıyı KIRMALI; geri
   alınca yeşile dönmeli. Log: `GECE/log/V10-G.mutasyon.txt`.
4. Üreteç `gen-style-pages.mjs` aynı cümleyi basıyorsa orada da düzelt
   (kök, V10-F'in devamı).
5. **TABANI YENİDEN KES** ve EXIT 0 doğrula:
   `node engine/tests/landing_truth_check.mjs --baseline --note="V10-G: kapıdan kaçan MTM kalıpları eklendi"`
   Hiçbir L sayısı YÜKSELEMEZ (L2 hâlâ 0 olmalı).

## ÇIKTI
- Değişen `web/**`, `engine/tests/landing_truth_check.mjs`,
  `engine/tests/landing-truth-baseline.json`, `engine/tools/gen-style-pages.mjs`
- `GECE/V10-G.md` — bulunan her cümle (dosya:satır · eski · yeni) + L1..L5 önce/sonra
- `GECE/log/V10-G.kapi.txt`, `GECE/log/V10-G.mutasyon.txt`

## YASAKLAR
- Kapıyı GEVŞETME (kalıp silme / muafiyet açma / taban yükseltme).
- `docs/`, `README.md`, `GECE/KOSU.md`, `engine/src/`, `contract/` yasak.
- **DEPLOY YAPMA.** `git add -A` yok. `?v` damgasına dokunma.
- Görsel/CSS'e dokunma; bu METİN kartıdır.

## SÜRE TAVANI
40 dk.

## COMMIT
`git commit -m "v10-g: the mtm sentences that slipped past the gate are gone and the gate now names them"`
