# Tur 20 — Hakem 17 (kör hakem, yalnız png) — 2026-09-10

Kural: yalnız `KOSU/ciktilar/giris-3/1..11/flat.png` açıldı. Repo'da başka hiçbir dosya açılmadı. Karşılaştırma ölçütü = bu turda web'den çekilip Read ile açılan satıcı flat'leri (bölüm 1).

## 1. Web kaynakları (bu turda çekildi, görsel açıldı)

| # | Satıcı / kalıp | Görsel URL | Gözlem |
|---|---|---|---|
| R1 | Sew Over It — Betty Dress | https://cdn.shopify.com/s/files/1/0628/1278/2766/files/BettyDresslinedrawing_1200px.png | Dış kontur kalın, pens/panel ince; etek ucu kesik çizgi (topstitch); etek dolgunluğu uzun ince kıvrım çizgileri; arkada CB fermuar + gölgeli facing; ön/arka ayrı, aynı giysi. |
| R2 | Helen's Closet — Holmes Dress | https://cdn.shopify.com/s/files/1/0715/6701/6159/files/holmes-dress-line-art.jpg | Kalın kontur; kesik çizgi = topstitch (yaka, kol ucu, fırfır); büzgü = dikişe dik kısa tikler; düğme + pat; bağcık fiyonk; ayrıca croquis üstünde ön+arka. |
| R3 | Helen's Closet — Reynolds Top & Dress | https://cdn.shopify.com/s/files/1/0715/6701/6159/files/reynolds-top-and-dress-line-drawings.jpg | Croquis üstünde; kesik çizgi = facing/topstitch; cep torbası noktalı; yırtmaç; çizgi ağırlığı tekdüze ama temiz. |
| R4 | True Bias — Aster Top & Dress | https://cdn.shopify.com/s/files/1/0085/3901/3186/files/Aster0-18LineDrawings.jpg | Kare yaka, geniş askı; FRONT/BACK yan yana; CB düğme+kesik çizgi pat; pens = tek çizgi; kesik çizgi etek ucu; kalın kontur, köşeler temiz, yırtmaç çentikleri. |
| R5 | Muna & Broad — Alistra Dress | https://cdn.shopify.com/s/files/1/0268/0288/0557/products/AlistraDresslinedrawing.png | İnce tekdüze çizgi; kollu; ön+arka yan yana; etek ucu kesik çizgi; sade. |
| R6 | Deer & Doe (Closet Core mağazası) — Magnolia | https://cdn.shopify.com/s/files/1/0632/8217/files/magnolia-dress-pattern-tech-flat.jpg | Dolu siluet + açık renk dikiş çizgisi; kruvaze, kuşak fiyonk arkada; A/B görünüm ön+arka. |
| R7 | Deer & Doe (Closet Core mağazası) — Belladone | https://cdn.shopify.com/s/files/1/0632/8217/files/Belladone-Dress-Pattern_Deer-and-Doe_D0001_schema.jpg | Dolu siluet; kupa dikişi, bel kuşağı, etek pensleri (uzunca, eteğin ~%45'i), cep ağzı; arkada CB dikiş + açık sırt. |
| — | Friday Pattern Co — Dew (blog ekran görüntüsü) | https://cdn.shopify.com/s/files/1/2899/9794/files/Screenshot_2024-11-12_at_15.43.12_1024x1024.png | Açıldı: beden tablosu çıktı, flat DEĞİL. Kullanılmadı. |

Ortak satıcı dili (R1–R7'den): kalın dış kontur / ince iç dikiş; kesik çizgi = topstitch/facing/pat; büzgü = dikişe dik kısa tikler; pens = tek ince çizgi ya da ince ikili; oturan giysilerde kapama (fermuar/düğme/CB dikiş) çizilir; ön+arka aynı giysi, hizalı.

## 2. Hükümler

**1 — V yakalı, kolsuz, prenses dikişli, bel dikişli, kapaklı yamalı cepli A-line elbise; arka kayık yaka, prenses dikiş — EVET**
- Çizgi hiyerarşisi doğru: dış kontur kalın, prenses/bel dikişi ince; V yakanın altında iç kesik çizgi = facing (R3/R4 dili).
- Cep kapağı üstü kesik çizgi (~x110-205,y490) topstitch olarak okunuyor; cep prenses dikişinin üstüne oturuyor ve dikiş cebin altından tekrar çıkıyor — bağlı ve tutarlı.
- Ön/arka aynı giysi: omuz genişliği, bel çizgisi (y375) ve etek flare'ı eşleşiyor; etek ucu hafif kavisli.

**2 — İnce askılı, oval yakalı, prenses korsajlı, bel dikişli, panelli A-line etek, fisto (scallop) etek uçlu elbise; arka düz üst — EVET**
- Askılar korsaj köşesine bağlı, çift ince çizgi; ön/arka askı konumu eşleşiyor.
- Korsaj prenses dikişleri yaka kenarından başlıyor (x175,y160), bel dikişinde etek panel çizgisine devam ediyor — dikiş sürekliliği satıcı dilinde.
- Fisto etek ucu ince dalgalı çizgi olarak ön+arkada aynı (y910); dalga genliği küçük ama okunuyor. Kanca/taşma yok.

**3 — Puf kollu, bebe yakalı, robalı, roba altı serbest pili/pens çizgili, dantel kol uçlu şift elbise; arka roba + CB açıklık — EVET**
- Puf kol balon: omuz noktasının dışına taşan yuvarlak kap, kol evinde büzgü tikleri (x110-130,y110-160), kol ucunda bant + dantel; ön/arka aynı.
- Roba dikişi ince, kontur kalın; CF'de düğme + kısa pat (x235,y115-205) dikişe bağlı.
- Zayıf nokta (hüküm bozmuyor): roba altındaki iki pili çizgisi (x172-180 / x300-308, y207-270) aşağı doğru hafif açılıyor; satıcı bunu kısa düz çizgi/tik ile çizerdi.

**4 — Kap kollu, kayık yakalı, prenses dikişli, CF düğmeli patlı kalem elbise; arka prenses dikiş — EVET**
- Pat iki düz ince çizgi (x255/x290), 10 düğme eşit aralıklı ve patın ortasında; R4'teki CB pat diliyle aynı.
- Prenses dikişler omuzdan etek ucuna sürekli, ince; siluet oturan (bel y400 daralması, kalça y550) — kalem elbise okunuyor.
- Kap kol ön/arka aynı biçim; kol ucu (y165) ile kol evi dibi (y215) arasındaki açık kol evi gerçek kap-kol yapısına uygun. Köşe hatası/taşma görülmedi.

**5 — Kolsuz, kayık yakalı, göğüs altı kavisli dikişli (üstü büzgülü), bel dikişli, etek pensli, kalçadan açılan elbise; arka aynı — EVET**
- Büzgü tikleri göğüs altı dikişine dik ve dikişin üstünde (x140-360,y255-300) — R2 dili.
- Etek pensleri ince ikili çizgi, belden başlıyor (y428→y605); uzunluk R7 Belladone ile aynı oranda.
- Ön/arka aynı: dikiş yükseklikleri (y290 / y428) ve kalça flare'ı birebir; kontur kalın, iç ince.

**6 — Geniş büzgülü askılı, yakası büzgülü + CF fiyonklu, göğüs altı dikişli, büzgülü A-line etekli sundress; arka düz üst, aynı dikiş — EVET**
- Yaka büzgü tikleri + küçük fiyonk (x235,y170) dikişe bağlı; askı içi ince çizgiler ön/arkada aynı (büzgülü askı olarak tutarlı).
- Etek: dikiş altında büzgü tikleri, sonra R1 tarzı uzun ince dolgunluk çizgileri; bol giysi bol okunuyor.
- Göğüs altı dikişi ön/arka aynı yükseklikte (y255); etek ucu kavisli; taşma yok.

**7 — Tek omuzlu, yan tarafı drapeli/büzgülü, oturan mini elbise; arka tek omuz aynalanmış — HAYIR**
- Oturan tek-omuz kalıpta arkada hiçbir kapama/dikiş yok (fermuar, CB dikişi, pens): arka gövde x515-810 boş; R7 Belladone'da CB dikiş çizilir. Satıcı flat'i böyle kapanmaz.
- Yaka bandı tutarsız: önde kalın yaka çizgisi x385,y200'de biterken ince paralel çizgi x385,y225'e kadar sarkıyor (boşta biten uç); arkada ise ikisi aynı noktada (x515,y230) birleşiyor. Ön/arka aynı giysi değil.
- Olumlu: drape çizgileri (x300-380,y290-600) yan dikişe yönelmiş ve dikiş boyunca tikler var — drape dili doğru; siluet oturan.

**8 — Kolsuz, kayık yakalı, CF düğmeli patlı, uzun pensli kısa üst (vest/top); arka pensli — HAYIR**
- Pens mantığı ters: pensler tepesi üstte (y305), tabanı etek ucunda açık (y565) — kumaşı ETEK UCUNDA alıyor; ama yan kontur belde daralıp (x125,y400) etek ucunda genişliyor (x105,y560). Pens uçta alıyor, siluet uçta açılıyor — çelişki.
- Kol evi dibi köşeli: ön sol x110,y240 ve arka x520,y240'ta kol evi eğrisi yan dikişe kırılarak giriyor, arkada küçük bir çıkıntı/kanca var; R4'te bu köşe yumuşak.
- Etek ucuna açık pens bacakları (x165-180, y565) yırtmaç gibi okunuyor; 9 düğme bu kısa gövdede sık — satıcı 5-6 çizer.

**9 — Kalp yakalı, bağcıklı (fiyonk) ince askılı, kupa dikişli bustier korsaj, bel dikişli, etek pensli, mini A-line elbise; arka düz üst — EVET**
- Korsaj kupa dikişleri (x150→x140 ve x205/x285) yaka kenarından bel dikişine bağlı; yaka altı kesik çizgi = facing topstitch, etek ucu kesik çizgi — R1/R4 dili.
- Askı ucundaki fiyonklar ön ve arkada aynı yerde (y55), askı çift ince çizgi; askı korsaj köşesine oturuyor.
- Ön/arka: bel dikişi (y405), etek pens boyu ve flare eşleşiyor; kontur kalın, iç ince; taşma yok.

**10 — Kare yakalı, geniş askılı, yaka kenarı zikzak/dantel şeritli, göğüs altı kupa-kavisli dikişli (üstü büzgülü), A-line sundress; arka kare yaka + CB fermuar — EVET**
- CB fermuar: kesik çift çizgi + üstte kare çekme (x660,y180-550) — R1 Betty'nin fermuar diliyle aynı.
- Ön göğüs altı dikişi iki kavisli (kupa) ve büzgü tikleri üstte; arka düz dikiş aynı yükseklikte (y258) — tutarlı.
- Zikzak yaka şeridi ön/arkada aynı, yaka çizgisiyle sınırlı (x180-300); askılar R4 Aster gibi düz kesilmiş. Taşma yok.

**11 — Puf kollu, fisto kenarlı bebe yakalı, robalı, roba altı büzgülü bol bluz; arka roba + CB kısa açıklık — EVET**
- Roba altı büzgü tikleri dikişe dik (y205-215), altında dolgunluk çizgileri; bol giysi bol; etek ucu kavisli.
- Puf kol #3 ile aynı yapı: balon kap, kol evinde büzgü, uçta dantel; ön/arka aynı.
- Zayıf nokta (hüküm bozmuyor): hem önde CF kısa açıklık (x235,y115-135) hem arkada CB açıklık (x660,y80-105) var, ikisinde de düğme/ilik yok — tek kapama seçilmeli.

## 3. Özet

**EVET: 9 / 11** (1, 2, 3, 4, 5, 6, 9, 10, 11). **HAYIR: 7, 8.**

HAYIR'ların ortak kök nedeni: **giysi mantığı ile çizim mantığının kopması** — çizgi kalitesi/hiyerarşisi her ikisinde de satıcı seviyesinde, ama giysi yapısı çizimle çelişiyor:
- 7: oturan kalıba kapama konmamış + yaka bandı önde boşta bitip arkada birleşiyor (ön ≠ arka).
- 8: pens yönü siluetin tersine çalışıyor (uçta alan pens + uçta açılan kontur), kol evi dibinde köşe/kanca.
Yani sorun çizgi motorunda değil, öğe yerleştirme kurallarında: "oturan giysi → kapama zorunlu", "pens taban yönü → kontur daralma yönüyle aynı", "kol evi → yan dikişe teğet giriş".

Tüm 11'de tekrar eden, hüküm bozmayan zayıflık: küçük açıklık/pili detayları (3'te açılan pili çizgileri, 11'de çift açıklık) satıcı dilinden bir adım geride.
