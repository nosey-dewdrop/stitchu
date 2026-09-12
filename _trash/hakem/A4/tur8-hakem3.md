# Tur 8 — Hakem 3 — 2026-09-09 — kör hakem, yalnız png, tur 8

Yalnız 11 png'ye bakıldı (giris-3/1..11/flat.png). Repo, kod, svg, hedef foto, önceki rapor açılmadı.
Ölçüler 900px genişlikteki png üzerinde piksel oranı (bel genişliği / kalça genişliği = "bel/kalça").

## Web kaynakları (satıcı flat'leri, bugün çekildi)

1. Sew House Seven — Sauvie Sundress: https://sewhouse7.com/products/sauvie-sundress
   (görsel: https://cdn.shopify.com/s/files/1/0476/8509/files/Sauvie_Sundress_line_art_e9d2c089-d473-4312-b6f8-50600398e3f3_1024x1024.jpg)
   - Yan dikiş düz, hafif A açılımı; kum saati YOK. Etek ucu düz (midi'de çok hafif kavis).
   - Kontur tek kalınlık orta; cep ve iç dikiş noktalı/ince. Gövde çizgisi yok.
   - Askı: V yakadan kalkan, üstte küçük dikdörtgen tırnakla biten iki çizgi.
   - Pens: tek kısa çizgi (göğüs pensi diagonal). Kapama çizilmemiş.
2. Seamwork — Mina Babydoll: https://www.seamwork.com/pdf-sewing-patterns/mina-babydoll-dress
   (görsel: https://media.seamwork.com/products/3163/3163-6086f5cc.png)
   - Renk dolgulu; kontur siyah orta, iç dikiş ince, etek/kol ucu kesikli üst dikiş.
   - Yan dikiş düz. Kol gövdeden ~30° açık, kol ucu eğik. Büzgü ince ışın çizgileri.
   - Pens: tek ince çizgi. Kapama: arka yakada küçük yırtmaç, düğme yok.
3. Cashmerette — Wayland Dress: https://www.cashmerette.com/products/wayland-dress-pdf-pattern
   (görsel: https://www.cashmerette.com/cdn/shop/files/Cashmerette-1120-Wayland-tech-ill-4x5.jpg)
   - Kalp yaka, ince askı yukarı doğru İNCELİYOR ve sayfa dışında bitiyor (kapalı uç yok).
   - Belde hafif kum saati (bel/kalça ≈ 0.90), etek düz/düşük konik. Etek ucu çok hafif kavis + kesikli üst dikiş.
   - Prenses dikişi ve pli çizgileri ince; kontur orta. Arka fermuar: tek ince çizgi + minik tırnak. Gölge var.
4. Cashmerette — Loring Dress: https://www.cashmerette.com/products/loring-dress
   (görsel: https://www.cashmerette.com/cdn/shop/files/Cashmerette-1113Loring-tech-ill-IG.jpg)
   - Kontur ince-tekdüze; büzgü/fırfır ince çizgi. V açıklığı gri dolgu.
   - Kol ~35° açık. Yan dikiş düz. Pens tek çizgi. Kapama yok.
5. Helen's Closet — Orchard Top & Dress: https://helensclosetpatterns.com/products/orchard-top-dress-free
   (görsel: https://helensclosetpatterns.com/cdn/shop/files/Orchard-line-art.jpg)
   - Gri manken (croquis) ÜZERİNE çizilmiş. Askı: iki ince paralel çizgi, omuzdan geçip arkaya bağlanıyor, kapalı uç yok.
   - Etek ucu kesikli üst dikiş; hafif A açılım. Kum saati yok.
6. Helen's Closet — Lockhart Jumpsuit & Dress: https://helensclosetpatterns.com/products/lockhart-jumpsuit-and-dress
   (görsel: https://helensclosetpatterns.com/cdn/shop/files/lockhart-jumpsuit-and-dress-line-art_826f8015-2ed0-45d4-807e-312fa24fda3e.jpg)
   - Aynı manken üstünde; ayrıca mankensiz küçük flat'ler. Askı dokulu (elastik) çizim.
   - Pens: tek ince çizgi; ön orta tek çizgi; arka fermuar: kısa yırtmaç + tırnak. Bel çizgisi düz açılı köşe.
7. Winslet's — Violet / Fiona: https://winslets.com/collections/strappy-dress-sewing-patterns
   (küçük renkli flat; askı kapalı ilmek, etek çan; uzaktan bakıldı, detay çıkarılamadı — DOĞRULANMADI)

Satıcı ortak paydası: kontur orta/ince ve tekdüze, iç dikiş daha ince, üst dikiş kesikli; kum saati zayıf (bel/kalça ≥0.85);
askı ya incelerek sayfa dışında biter ya omuzdan geçen çift çizgidir, KAPALI YUVARLAK UÇ YOK; pens tek ince çizgi
ya da çok dar V; fermuar tek çizgi + tırnak.

## 11 hüküm

1. `1/flat.png` — V yaka, kolsuz, cepli A-line — **EVET**
   - Kalın kontur / ince pens / kesikli üst dikiş hiyerarşisi satıcı ayarında.
   - Yan dikiş belde köşe yapıyor, bel/kalça ≈ 0.78 (satıcılarda ≥0.85) — biraz sert ama Wayland'a yakın.
   - Omuz ucu düz yatay kısa segmentle bitiyor (1'de ve 5'te); satıcılar kavisli kapatıyor.
2. `2/flat.png` — spagetti askı, midi A-line — **EVET**
   - Bel/kalça ≈ 0.80, bel köşesi belirgin ama silüet okunuyor; etek ucu hafif kavis + kesikli.
   - Askı dikey, paralel, üstte yuvarlak kapalı uç (pil şeklinde); satıcılarda incelen/açık uç. Askı genişliği ≈ 1.2% (ince) → kabul sınırında.
   - Arka üst kenar ortada küçük yükselti (fermuar başı) var; ön/arka bant kalınlığı eşit, iç dikiş ince.
3. `3/flat.png` — roba, kısa kol, yuvarlak yaka — **HAYIR**
   - Yaka: dış konveks yay + iç U çukur + iki kesikli çizgi; "bib/yaka bandı" mı "önlük cebi" mi okunmuyor.
   - Bel/kalça ≈ 0.70; satıcı flat'lerinin hiçbirinde bu kadar dar bel yok.
   - Balık pensi tek parça, bel üstünden kalçaya ~360px, iki ucu sivrilmiyor (dar dikdörtgen gibi).
4. `4/flat.png` — kayık yaka, kısa kol, düğmeli sheath — **EVET**
   - Kontur/düğme/kesikli hiyerarşisi tutarlı; düğmeler eşit aralık (≈66px).
   - Kol: dış çizgi düz inip ucu eğik; kol açısı ~20°, Seamwork'e yakın.
   - Bel/kalça ≈ 0.72 — sert; arka yaka omuz hattının ~40px üstüne tümsek yapıyor (kabul edilebilir, omuz eğimi).
5. `5/flat.png` — kolsuz, geniş bel bandı — **EVET**
   - Bant pensleri (V, yukarı sivri) + etek pensleri ince; bant dikişleri ince düz; hiyerarşi doğru.
   - Kolevi kalın kontur + kesikli iç çizgi, satıcı biçimi.
   - Omuz ucu 1'deki gibi düz yatay küçük çıkıntı; bel/kalça ≈ 0.74.
6. `6/flat.png` — kalın askılı, bantlı — **HAYIR**
   - Askı genişliği ≈ 5.5% (≈50px), yükseklik ≈ 200px, üstü tam yarım daire, alt ucu banda dik giriyor → fiş/priz ucu gibi okunuyor.
   - Askı dikey ve birbirine paralel; satıcılarda omuza doğru içe daralır.
   - Bel köşesi sert (bel/kalça ≈ 0.72), üst bant ucu küçük tırnaklarla dışa taşıyor.
7. `7/flat.png` — straplez, kalıplı üst bant — **HAYIR**
   - Ön üst bant gövdeden her iki yanda ~15px DIŞA taşan dikdörtgen; kumaş katlaması böyle çıkmaz, arka görünüşte bu bant yok.
   - Bel/kalça ≈ 0.67, gövde vazo silüeti; hiçbir satıcı flat'i bu oranda değil.
   - Balık pensi bel üstünden kalçaya tek uzun dar dikdörtgen (3 ile aynı), uçlar sivrilmiyor.
8. `8/flat.png` — kolsuz düğmeli üst, volanlı etek ucu — **HAYIR**
   - Etek ucu yan dikişte ~20px dışa fırlayan sivri "kanat" (iki yanda, ön+arka); satıcıda etek ucu kavisli ve yan dikişle teğet biter.
   - Bel/kalça ≈ 0.68 (bel 235px / kalça 345px).
   - Kolevi kesikli ve kalın kontur uyumlu; düğme aralığı eşit — bunlar iyi, kanat artefaktı hükmü çeviriyor.
9. `9/flat.png` — kalp yaka, ince askı — **HAYIR**
   - ARKA görünüşte askılar bodice üst kenarına değmiyor: askı alt ucu y≈215, bodice kenarı y≈237 → ~20px boşluk, askılar havada.
   - Askılar düz kesik uçlu ve dikey paralel; Wayland'de incelerek sayfa dışına çıkar.
   - Kalp yaka kavisi + kesikli iç çizgi ve etek ince pens: satıcı ayarında; bel/kalça ≈ 0.78.
10. `10/flat.png` — 6'nın kısa etekli hali — **HAYIR**
   - 6 ile aynı fiş-ucu askı (≈45px geniş, yarım daire tepe).
   - Bel köşesi sert; bodice bant/pens hiyerarşisi iyi.
   - Ön askı alt ucu banda dik, kesikli üst dikişle kesişiyor (satıcıda askı bandın altına gider, üst dikiş askı üstünden geçmez).
11. `11/flat.png` — 3'ün üst (bluz) hali — **HAYIR**
   - 3'teki okunmayan yaka aynen.
   - Etek ucunda 8'deki sivri "kanat" artefaktı (yan dikişte dışa ~20px).
   - Bel/kalça ≈ 0.70 + arka yaka tümseği.

## Toplam hüküm: **HAYIR** (4 EVET / 7 HAYIR)

### En ağır üç kusur
1. **Askı çizimi** (2, 6, 9, 10): kapalı yuvarlak/kesik uçlu, dikey paralel, 6/10'da fiş ucu genişliğinde; 9'un arkasında askı bodice'e değmiyor. Satıcı askısı incelerek omuza gider, kapalı uç yok.
2. **Etek ucu "kanat" artefaktı** (8, 11): yan dikişte dışa fırlayan sivri köşe. Tek başına flat'i satıcı ayarından düşürüyor.
3. **Kum saati şiddeti**: bel/kalça 0.67–0.80 (satıcılarda ≥0.85, çoğunda düz yan dikiş) + belde kavis değil köşe. 3, 7, 11'de okunmayan yaka bandı bunu ağırlaştırıyor.

### En güçlü üç yan
1. **Çizgi hiyerarşisi** 11'inde de doğru: kalın kontur, ince iç dikiş/pens, kesikli üst dikiş (yaka, kolevi, etek ucu). Seamwork/Helen's Closet ile aynı dil.
2. **Pens ve kapama**: ince V pens, arka orta kesikli fermuar + minik sürgü; Wayland/Lockhart konvansiyonuna birebir.
3. **Ön/arka çift görünüş, hizalı ve eşit ölçek**; kol açısı (~20–30°) ve etek ucu kavisi (1, 2, 4, 5) satıcı flat'lerinden ayırt edilmiyor.
