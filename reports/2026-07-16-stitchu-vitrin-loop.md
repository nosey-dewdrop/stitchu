# stitchu — LOOP 4 / PATCH 2.1 (VİTRİN: reskin + patch notes + beta funnel)

> Zincir: DEVAM-LANDING-LOOP.md · 2026-07-16 · deploy v59 (gh-pages, github.io doğrulandı)
> Durum: CANLIDA, gezilmeyi bekliyor (Damla döndüğünde kendisi gezer).

---

## PATCH 2.1 — VİTRİN (2026-07-16)
- **Ne değişti:** (1) tüm sayfalar vişne → bebek mavisi RESKIN (yerleşim/Didot
  korundu), (2) yeni web/patches.html LoL-tarzı yama notları (1.0–2.0 geriye
  dolduruldu), (3) hero CTA "join the beta" → gerçek /api/waitlist, (4) fiyat
  rakamları beta çerçevesine, (5) sayfa geçişleri (View Transitions + fallback).
- **Sayı öncesi→sonrası:** FULL 22/54 → 22/54 (motor/vision DOKUNULMADI; vitrin
  loop'u). Waitlist endpoint canlı probe: HTTP 200 {"ok":true}.
- **Dürüst not:** bu loop hiçbir vision/engine sayısını hareket ettirmedi —
  hedefi buydu. Ölçülemeyen bir şey uydurulmadı; ölçülen tek canlı şey waitlist
  endpoint'inin çalıştığı (200).

---

## KREDİ / CANLI PROBE
Vitrin loop'u vision kredisi harcamaz. Gerekli canlı bağımlılık waitlist
endpoint'iydi: `POST /api/waitlist` → **HTTP 200 {"ok":true}**. Beta hunisi
gerçekten kayıt alıyor.

## TAŞINANLAR (mockup/kontrat → canlı)
- **Renk dünyası:** vişne #8f2038 → bebek mavisi (--bb #8fbfe8 / --bb-deep
  #3f74a8), metin lacivert #1f3a5f (WCAG AA), accent teal/navy #2f6f7e.
- **Yerleşim/kompozisyon/Didot:** hero, proof papers, moat kartları, how-it-works
  akışı, footer — hepsi ESKİ konumunda; sadece renk döndü (reskin, redesign değil).
- **Pötikare SADECE girişte:** hero #silk canvas artık bebek-mavisi poplin;
  hero altındaki her bölüm opak beyaz-mavi (.rest wrapper), diğer sayfalarda
  pötikare yok (couture.css calm ground, couture-bg.js canvas kaldırıldı).
- **patches.html:** manifesto satırı ("every change, measured, published — misses
  included"), 12 yama (2.0 → 1.0), her biri numara+tarih+başlık+2-4 madde+delta
  rozeti+dürüst not, EN/TR, nav'da "patch notes", ld+json FAQPage.
- **Beta hunisi:** hero birincil CTA "join the beta" → /api/waitlist
  (note:'beta-waitlist'); ikincil "or draft a pattern free". API sayfasındaki
  form da "become a beta partner" (note:'api-waitlist'). TR/EN dürüst durumlar.
- **Fiyat → beta:** api.html $19/$49 kartları "Maker/Studio/Volume" beta
  partner kartlarına döndü, "beta free while we build". index moat'taki $34-49
  karşılaştırması "beta is free while we build" oldu. (Rakamlar RAPORDA saklı:
  Maker $19/mo·500 pattern, Studio $49/mo·unlimited, rakip $34-49/mo.)
- **Pattern galerisi (C2):** proof bölümüne dürüst sayaç eklendi — "22 of 54 real
  product photos become a full pattern — and counting" → patches.html linkli.
  Sergilenen SVG'ler motorun KENDİ çıktısı (A-line, babydoll, knit, cropped,
  fuller-body) — Etsy kaynak fotoğrafı SIFIR (telif kırmızı çizgisi korundu).
- **Sürüm damgası:** v44 → v59 her sayfa footer'ında; tüm css/js ?v=59 cache-bust.
- **Kalıcı nav:** index topnav + benchmark/api/patches/privacy/create footer'larına
  benchmark · patch notes · API · privacy linkleri (ikincil linkler görünür).
- **Sayfa geçişleri:** css/theme-transitions.css — @view-transition navigation
  auto (260ms cross-fade) + @supports fallback (reduced-motion saygılı fade-in);
  index/benchmark/api/patches/create/privacy'ye bağlandı.
- **Favicon:** 6 sayfada data-URI SVG favicon vişne → lacivert.
- **Şablon (create/privacy):** paylaşılan tokens.css --accent + couture.css
  rethemed → bu iki sayfa da otomatik bebek-mavisi; app.css print/badge/radio
  vişne → lacivert.

## TAŞINMAYANLAR (bilinçli, kapsam dışı ya da Damla'ya bırakıldı)
- **MJ teal/navy düğmeler:** henüz üretilmedi (Damla üretecek, docs/mj-button-
  prompts.md). Şu an assets/buttons/*.png (mevcut düğme PNG'leri) kullanılıyor
  ve hero'da nötr duruyor; CSS/varlık placeholder yerinde. Gelince PNG-alfa
  kesim + yerleştirme AYRI mini-iş.
- **Style-library (web/styles/*.html, 24 sayfa):** contract'ın 6-sayfa reskin
  listesinde DEĞİL (index/benchmark/api/patches/privacy/create). Favicon +
  footer linki güncel ama sayfa gövdeleri vişne kaldı → BACKLOG. Ayrı reskin
  loop'u ya da tek toplu geçiş gerektirir.
- **Waitlist sayacı admin script'i:** DEVAM-LANDING-LOOP C maddesindeki "kaç
  kişi" komutu — worker KV okuma endpoint'i gerektirir (worker değişikliği);
  vitrin loop worker'a dokunmadığı için BACKLOG. Kayıtlar KV'de toplanıyor,
  okuma script'i ayrı iş.
- **Blog/SEO rehber yazıları** ("Etsy nasıl satılır" vb.): contract'ta AYRI iş
  olarak işaretli → BACKLOG. Bu loop sadece meta/canonical/og + ld+json + nav.
- **Ürün UI standart-beden modu:** contract "sadece copy" dedi; /api/grade zaten
  var, landing copy "one photo → a full size run (XS–XL / EU34–52)" ekledi. UI
  modu AYRI loop.

## ÖNCE / SONRA HİYERARŞİ (ekran ekran, metin)
- **index hero — ÖNCE:** vişne gingham arka plan, beyaz metin, CTA "Draft a
  pattern free" + "See the proof first", proof chip'leri statik.
  **SONRA:** bebek-mavisi gingham (sadece hero), lacivert metin, birincil CTA
  = beta email formu "Join the beta" (canlı waitlist), tıklanabilir kanıt
  chip'leri (benchmark/privacy'ye), ikincil "or draft a pattern free".
- **index gövde — ÖNCE:** tüm bölümler vişne gingham üstünde (fixed canvas).
  **SONRA:** hero altı opak beyaz-mavi (.rest), how/gallery-sayaç/moat(bb-pale)/
  API — sakin, kartlar beyaz + bb-line kenar.
- **benchmark — ÖNCE:** koyu vişne sayfa, beyaz metin, vişne kartlar.
  **SONRA:** beyaz sayfa, lacivert metin, bb-pale stat kartları, yeşil "ok"
  okunur ton (#2f7d54), nav'da patch notes.
- **api — ÖNCE:** koyu maroon sayfa, pembe accent, $19/$49 pricing.
  **SONRA:** beyaz-mavi sayfa, koyu-navy kod blokları (okunur), beta partner
  kartları (rakam yok), CTA "join the beta".
- **patches — YOK → VAR:** tamamen yeni sayfa, bebek-mavisi, 12 yama LoL modeli.
- **privacy/create — ÖNCE:** vişne gingham + beyaz kağıt sheet.
  **SONRA:** sakin beyaz-mavi ground + beyaz sheet (bb-line kenar), lacivert
  header, print/badge accent'leri lacivert.

## KANIT
- **Deploy:** git subtree split --prefix web → gh-pages, push edildi.
- **Canlı doğrulama (github.io, cache-bust ?fresh):** index 200 (v59 + "baby-blue
  world" + "Join the beta" + "beta-waitlist" markerları, background:#8f2038 = 0),
  benchmark 200, api 200, patches.html 200 ("Patch notes" + "22/54"), privacy
  200, create 200.
- **Waitlist:** POST /api/waitlist → 200 {"ok":true}.
- **Yapı:** section/div/style tag dengesi tüm sayfalarda dengeli (python sayım).
- **Vişne sweep:** reskinned 6 sayfa + css + couture-bg.js'de vişne hex = 0
  (tek istisna tokens.css yorumundaki "was vişne #8f2038" notu).

## İÇERİK LOGU (ortak kural)
- linkedin.md **Essay 14** — "Yama notlarını satmıyorum, bağ kuruyorlar" (5 halka).
- devlog.md **seri Y** — 3 reel/carousel (yama notları / +0 dürüstlüğü / reskin).
- Yama notu: patch 2.1 artık web/patches.html'de EN ÜSTTE (canlı sayfa).

## BACKLOG (Damla'ya)
1. MJ teal/navy düğmeler üret (docs/mj-button-prompts.md) → PNG-alfa yerleştir.
2. Style-library 24 sayfa reskin (favicon+footer güncel, gövdeler vişne).
3. Worker KV waitlist-sayaç okuma endpoint'i + admin script ("kaç kişi").
4. SEO içerik motoru: Etsy/rehber blog yazıları (ayrı iş).
5. Ürün UI'ına standart-beden (size-run) modu.
