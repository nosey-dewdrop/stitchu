# Tur 21 — Hakem 18 (kör hakem, yalnız png) — 2026-09-10

Kural: yalnız `KOSU/ciktilar/giris-3/{1..11}/flat.png` açıldı. Repo'da başka dosya açılmadı. Ölçüt, bu turda web'den çekilip Read ile açılan 8 satıcı flat'i.

## 1. Web kaynakları (bu turda çekildi ve açıldı)

| # | Satıcı / ürün | URL (görsel) | Gözlem |
|---|---|---|---|
| R1 | Cashmerette — Wayland Dress (tech ill.) | https://www.cashmerette.com/cdn/shop/files/Cashmerette-1120-Wayland-tech-ill-4x5.jpg | Ön+arka yan yana, 2 boy. Dış kontur kalın, iç dikiş ince. Etek ucu hafif kavisli + kesikli üst dikiş. Bel büzgüsü: dikişten çıkan, giderek sönen ince çizgiler. Arka shirring doku olarak çizilmiş; askılar arkada bedenin arkasına giriyor. Cep ağzı belden inen kavis. Hafif gölge. |
| R2 | Helen's Closet — Orchard Top & Dress (line art) | https://helensclosetpatterns.com/cdn/shop/files/Orchard-line-art.jpg | Croquis üstünde 5 görünüm (A–D + BACK). Yaka/etek ucunda noktalı üst dikiş; A-line etek ucu dalgalı; askı bedende bitiyor. |
| R3 | Grainline Studio — Austin Dress (flat) | https://grainlinestudio.com/cdn/shop/files/grainline-austin-dress-pattern-0-18-flat-technical-illustrations.jpg | Kalın kontur / ince iç; düğmeler ilik çizgili; yan düğme bandı; roba altı büzgü = ince düşüş çizgileri; yamalı cep kesikli dikişle; etek ucu dalgalı + kesikli hem. Ön ve arka aynı giysi. |
| R4 | Grainline Studio — Augusta Shirt & Dress | https://grainlinestudio.com/cdn/shop/products/grainline-augusta-pattern-0-18-technical-flat-illustration.jpg | Yaka/revers katmanlı; yan yırtmaç; kol manşeti; arka pili; gölge tonu ile hacim. Kollar bedenin ÖNÜNDE, armhole tek çizgi. |
| R5 | Grainline Studio — Alder Shirtdress | https://grainlinestudio.com/cdn/shop/products/grainline-alder-shirtdress-pattern-0-18-flat-technical-illustrations.jpg | Pat iki çizgi + kesikli üst dikiş + ilikli düğme; cep kapaklı; roba; büzgülü etek düşüş çizgileri; kavisli etek ucu. |
| R6 | True Bias — Zoey Tank & Dress (line drawings) | https://truebias.com/cdn/shop/products/zoey0-18linedrawings_1024x1024.jpg | FRONT/BACK başlıklı, 3 görünüm. Biye bant + kesikli dikiş; CF dikişi; etek ucunda godet düşüş çizgileri; kavisli etek ucu; askılar tepede kesilip bitiyor (havada biten askı satıcıda da var). |
| R7 | Cashmerette — Appleton Dress (tech ill.) | https://www.cashmerette.com/cdn/shop/files/Cashmerette-1201Appleton-tech-ill-4x5_f6b69159-71ab-44ac-ad5f-a1578f752504.jpg | Kruvaze bant, kuşak, manşet/hem kesikli; iç boşluk gri; kollar bedenin dışında ayrı kontur. Kalın/ince ayrımı net. |
| R8 | Helen's Closet — York Pinafore (flat illustration) | https://helensclosetpatterns.com/cdn/shop/files/york_pinafore_flat_illustration.jpg | Croquis üstünde; jile askısı bedene küçük koltuk altı kavisiyle bağlanıyor; cep kesikli; etek ucu kesikli hem. |

Erişemediğim: tillyandthebuttons.com (404 + yönlendirme, görsel çekilemedi); Deer & Doe Magnolia sayfası lazy-load, flat URL'si görünmedi; Closet Core Cielo sayfası yalnız ürün fotoğrafı verdi. Bunlar tabloya girmedi.

Referanslardan çıkan ortak dil: (a) dış kontur kalın, iç dikiş ince, üst dikiş kesikli; (b) etek ucu hafif kavisli; (c) büzgü = dikişten çıkıp sönen ince çizgiler; (d) düğme pat iki çizgi arasında; (e) askı havada bitebilir; (f) kollar bedenin önünde, armhole tek çizgi; (g) ön+arka aynı giysi, aynı ölçek.

## 2. Hükümler

**1 — V yaka, kolsuz, prenses dikişli, bel dikişli, kapaklı yamalı cepli A-line elbise (arka: kayık yaka, prenses dikiş) — EVET**
- Hiyerarşi doğru: dış kontur kalın, prenses/bel/cep çizgileri ince; V yakanın altında kesikli pervaz çizgisi (≈235,215) R6/R3 dilinde.
- Cep kapağı kesikli dikişle bağlı (≈130–205,490 ve 275–350,490), kapak kavisli, cep gövdesi kapağın altında; prenses dikişi cep arkasında kayboluyor (≈180,490–580) — doğru katman.
- Kusur (küçük): arka görünümde hiçbir kapama yok (fermuar/düğme); bel oturmuş prenses elbise için satıcı CB fermuar çizer (≈655,70–380). Okumayı bozmuyor, eksik.

**2 — İnce askılı, prenses dikişli, bel dikişli, uzun A-line elbise, fistolu etek ucu — HAYIR**
- Etek ucu (≈55–420,905–915) fisto ince çizgiyle çizilmiş; kalın yan kontur (≈55,900 ve 420,900) orada bitiyor ve dış kenar ince çizgiye düşüyor → dış kontur hiyerarşisi kırılıyor, alt kenar "açık" okunuyor. R3'te fisto dış ağırlıkta + kesikli hem.
- Fisto dişleri çok küçük ve testere gibi (≈15 diş, 8–10 px), dantel/fisto değil zigzag dikiş gibi okunuyor.
- Olumlu: askı/korsaj bağlantısı (≈165,150→135,190), prenses hatlar, bel dikişi ve yan dikiş kavisleri R6 View C ile aynı dilde; ön+arka tutarlı.

**3 — Bebe yakalı, puf kollu, robalı, düz (shift) elbise, kol ucunda fisto bantlı (arka: roba, CB açıklık) — EVET**
- Puf kol balon: kol başı ve bant üstünde büzgü tikleri (≈95–115,115 ve 75–120,205), bant ayrı, fisto kenarlı — R3/R5 dilinde; kol bedenin önünde.
- Yaka iki lob, CF'de kısa açıklık + tek düğme (≈235,150), roba dikişi ince (≈120–355,205); arka roba + CB açıklık çizgisi (≈660,80–120) önle tutarlı.
- Kusur (küçük): roba altındaki iki kısa tek çizgi (≈175,210–265 ve 305,210–265) pens mi, pili mi belirsiz; satıcı pensi iki bacakla ya da büzgü çizgisiyle gösterir.

**4 — Kayık yaka, kap kollu, tam boy CF düğme patlı, prenses dikişli kalem elbise (arka: prenses dikiş, kap kol) — EVET**
- Pat iki ince çizgi arasında (x≈255 ve 285), 9 ilikli düğme eşit aralıklı, pat etek ucuna kadar iniyor — R3/R5 pat dili.
- Silüet oturmuş: bel içeri (≈135,400), kalça dışarı, düz etek ucu; ön+arka aynı silüet ve ölçek.
- Kusur (küçük): kap kol şekli (≈65–120,60–165) aşağı sarkan sivri "yaprak" gibi, R4'ün silindir kısa kolundan farklı; okunuyor ama alışılmadık.

**5 — Geniş kayık yaka, kolsuz, göğüs altı kavisli dikişe büzgülü, bel dikişli, etekte pensli oturmuş elbise (arka: aynı, büzgüsüz) — EVET**
- Etek pensleri kapalı üçgen (≈185–200,430–600 ve 285–300,430–600), önde ve arkada; bel dikişi ince, düz.
- Büzgü tikleri dikişin üstünde, dikişe bağlı (≈115–370,255–300); arka aynı dikişi büzgüsüz taşıyor — tutarlı (yalnız ön büzgü).
- Kusur (küçük): büzgü tikleri kısa ve eşit aralıklı "çim" gibi; R1/R3'te büzgü dikişten kumaşa doğru sönen uzun çizgi. Dil eksik ama yanlış değil.

**6 — Geniş askılı, büzgülü yaka + CF fiyonklu, göğüs altından büzgülü bol A-line yazlık elbise (arka: kare yaka, büzgülü etek) — EVET**
- Büzgü R3 dilinde: dikişte tikler (≈125–345,255–270) + etekte sönen düşüş çizgileri (≈120–360,270–650); arkada da aynı.
- Fiyonk küçük, iki ilmek + iki kuyruk (≈235,165–245), yaka büzgüsüne bağlı; askı içi ince çizgiler önde ve arkada aynı.
- Bol giysi bol çizilmiş: yan dikiş dışarı açılıyor, etek ucu düz-hafif kavis; askı/korsaj/yan dikiş bağlantısı temiz.

**7 — Tek omuz, diagonal yakalı, sağ yan dikişte drapeli (ruching) oturmuş mini elbise (arka: ters diagonal, CB dikiş) — HAYIR**
- Yaka ikili çizilmiş: kalın kırık kontur (≈145,65→240,140→385,190) + altında ince düz çizgi (≈65,70→385,190) bir kama oluşturuyor; bant mı, drape mi, pervaz mı belirsiz. Arkada aynı (≈520,215→830,70). R7'de bant iki paralel çizgidir, kama değil.
- Drape tikleri (≈350–365,300–490) yan konturdan (x≈380) 15–30 px içeride havada; ruching tikleri dikişin (yani konturun) üstünde olmalı. Drape kavisleri (≈300–380,285–590) yan dikişe değmeden bitiyor.
- Olumlu: asimetri tutarlı (ön sol omuz = arka sağ omuz), tek omuz kenarı ve armhole tarafı düz; silüet oturmuş, bel içeri.

**8 — Kayık yaka, kolsuz, tam boy CF düğme patlı, balık pensli (fisheye) kalça boyu yelek/üst (arka: aynı pensler) — EVET**
- Balık pensleri kapalı elmas (≈165–180,295–525 ve 310–320,295–525; arka ≈585–595 ve 725–735) — oturmuş kolsuz yelek dili, önde/arkada tutarlı.
- Pat iki çizgi (x≈232, 258), 10 düğme, yakadan etek ucuna; yaka kalın kayık, armhole derin.
- Kusur (küçük): etek ucu köşelerinde kontur küçük bir dalga yapıyor (≈100–105,540–565 ve 380–385,540–565; arkada aynı) — ufak geometri artefaktı, satıcı köşesi temiz olur.

**9 — Kalp yakalı, bağcıklı (omuzda fiyonk) askılı, kup dikişli korsaj, bel dikişli, etekte pensli mini elbise (arka: kare sırt, panel dikişleri, pensler) — EVET**
- Yaka ve etek ucunda kesikli üst dikiş (≈145–335,185 ve 65–420,780; arka ≈565–760,185), R1/R6 dili.
- Korsaj kup hatları askı dibinden göğüs altına kavisli inip bele (≈150,185→205,260→190,410), yan panel dikişleri ayrı; arka panel dikişleri düz, bele bağlı.
- Askı ucundaki fiyonklar (≈120,55 ve 355,55) bağcık askıyı anlatıyor; etek pensleri kapalı üçgen, önde/arkada tutarlı; silüet oturmuş bel + A-line mini.

**10 — Geniş askılı, kare yaka fisto kenarlı, göğüs büzgülü, A-line jile/yazlık elbise (arka: kare sırt, CB fermuar, roba dikişi) — EVET**
- Askı → koltuk altı kavisi → yan dikiş geçişi (≈130,150→125,210) R8 (York) jile dilinde; arka aynı.
- CB fermuar: üstte küçük tırnak (≈660,180) + kesikli çift çizgi (≈660,190–550) — satıcı dilinde kapama var; arka roba dikişi (≈545–775,260) önün büzgü dikişiyle aynı seviyede.
- Kusur (küçük): yaka fistosu (≈180–300,155–162) küçük testere zigzag, dantel değil zigzag dikiş gibi; büzgü tikleri yalnız iki göğüs kabartısında (≈150–215 ve 265–335,215–245), sönen çizgi yok.

**11 — Fisto kenarlı bebe yakalı, puf kollu (fisto bantlı), robalı, roba altı büzgülü bol bluz (arka: roba, fisto yaka, CB açıklık, büzgü) — EVET**
- Ön büzgü R3 dilinde: roba altında tikler (≈150–330,200–215) + sönen düşüş çizgileri (≈160–330,215–380).
- Puf kollar balon; kol başı ve bant tikleri, fisto bant (≈85–130,205–235 ve 340–395,205–235); kol bedenin önünde, armhole tek çizgi.
- Kusur (küçük): arka büzgüde tikler var (≈565–775,205–215) ama düşüş çizgisi yok — ön/arka dil tutarsız; CF kısa açıklık çizgisinde (≈235,95–140) düğme/ilmek yok.

## 3. Özet

**9 EVET / 11.** HAYIR: 2, 7.

Ortak kök neden (2 ve 7): **dış kenara oturan süs/detay katmanı, kontur yolundan bağımsız çizilmiş.** 2'de fisto etek ucu iç-çizgi ağırlığında ve kalın konturun yerine geçiyor (dış kenar ince kalıyor); 7'de yaka bandı konturu iki ayrı yolla (kalın kırık + ince düz) ikiye bölünüp kama yapıyor, drape tikleri de konturun üstünde değil içinde. İkisinde de sorun silüet değil, "kenara bağlı olması gereken öğe kenardan kopuk" olması. EVET'lerdeki küçük kusurlar da aynı ailenin hafif hali: büzgü tikleri sönen çizgisiz (5, 10, 11 arka), fisto zigzag gibi (10), köşe dalgası (8), kapama eksik (1).

Görülüp sorulmayan: askıların havada bitmesi kusur değil (R6 Zoey ve R1 Wayland'de de öyle). Referanslarda üst dikiş kesikli çizgisi neredeyse her yakada/etek ucunda var; 11 flat'in yalnız 1, 9, 10'unda kesikli çizgi kullanılmış. Referanslardan 3'ü (R2, R8, R4 kısmen) gölge/croquis kullanıyor; bu 11'de hiçbiri yok — satıcı dilinde zorunlu değil.
