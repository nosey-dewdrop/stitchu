# Tur 13 — Hakem 6 (kör hakem, yalnız png) — 2026-09-10

Kural: repo içinden yalnız `KOSU/ciktilar/giris-3/{1..11}/flat.png` açıldı. Başka dosya (svg/json/md/kod/hedef foto/önceki hakem) açılmadı.
Karşılaştırma ölçütü: aşağıda bu turda web'den çekilip gözle bakılan satıcı flat'leri.

## 1. Web kaynakları (bu turda çekildi, görsel açıldı)

| # | Satıcı / kalıp | URL (görsel) | Gözlem |
|---|---|---|---|
| W1 | Tilly and the Buttons — Martha Dress | https://tillyandthebuttons.com/cdn/shop/products/Martha_technical_drawing_1800x1800.jpg | Tek çizgi kalınlığı (ince-orta), dış kontur/iç dikiş farkı çok hafif. Prenses dikişi omuzdan etek ucuna kesintisiz. Kol ucu ve etek ucu hafif kavisli. Arka: fermuar ince çift çizgi + üstte kanca. Kol başı büzgüsü 3-4 kısa ince çizgi. Etek "drape" ince dikey çizgilerle. Ön+arka yan yana, altta FRONT/BACK etiketi. |
| W2 | Tilly and the Buttons — Skye Sundress | https://tillyandthebuttons.com/cdn/shop/products/Skye_sundress_6-34_tech_drawing_1800x1800.jpg | Askı fiyonkları omuz üstünde iki ilmekli gerçek fiyonk. Büzgü: robadan aşağı uzun, seyrek, solan ince dikey çizgiler (tarak/tik değil). Göğüs pensleri küçük damla şekli. Etek ucu geniş, yumuşak dalga. Arka: askılar düz devam ediyor, roba düz. Kalınlık farkı hafif ama dış kontur belirgin. |
| W3 | Tilly and the Buttons — Etta Dress | https://tillyandthebuttons.com/cdn/shop/products/Etta-dress-technical-drawing_1800x1800.jpg | Kalem etek: yan dikiş belden kalçaya yumuşak tek kavis, kalçadan etek ucuna hafif daralma, S-kıvrımı YOK. Kap kol: omuzdan aşağı yuvarlak damla kavisi, sivri üçgen değil. Pensler ince tek çizgi. Arka: fermuar + yırtmaç ince çizgi. Sahte cep kapağı düğmeli küçük dikdörtgen. |
| W4 | Friday Pattern Company — Hughes Dress | https://fridaypatterncompany.com/cdn/shop/files/hughes_tech_a6e52c2d-5a85-4a69-bab5-867ff68d2c18.png | Kare yaka, düğme patı çift ince çizgi + 8 düğme. Puf kol başı 3 kısa büzgü çizgisi + kol ucu kesik çizgi (baskı dikişi). Arka: bağcık + fiyonk gerçek ip gibi çizilmiş, altında ince solan büzgü çizgileri. Kavisli etek ucu, kesik çizgi hem payı. Ön+arka yan yana, aynı kalınlık dili. |
| W5 | Friday Pattern Company — Dew Dress/Top | https://fridaypatterncompany.com/cdn/shop/files/dew_flat_horizont_e3ffc8f6-4cf8-475b-b46f-294569b4fa7d.png | Kolsuz cowl yaka; kol evi ve etek ucu kesik çizgi baskı dikişi ile. Cep ağzı ince çift çizgi, cep torbası noktalı çizgi. Bol giysi bol çizilmiş (kokon silüet). Dış kontur belirgin, iç detay ince/kesik. Kol evi yan dikişe temiz bağlanıyor, kanca yok. |
| W6 | Helen's Closet — Orchard Top/Dress | https://helensclosetpatterns.com/cdn/shop/files/Orchard-line-art.jpg | Croquis üstünde flat (gri manken). Askılar omuzda, kalın kontur; yaka/askı bant kesik çizgi baskı. Bol tank/dress silüeti bol; etek ucu dalga. Ön+arka aynı satırda, VIEW A-D + BACK etiketi. |
| W7 | Helen's Closet — Cassidy Wrap Top | https://helensclosetpatterns.com/cdn/shop/files/cassidy-wrap-top-instructions-line-art.jpg | Büzgü: bel bandından yukarı solan ince ışın çizgileri (yalnız büzülen tarafta, seyrek). Bağ/fiyonk: gerçek ilmek + sarkan uç. Yaka bandı çift ince çizgi + kesik baskı. Dış kontur kalın, iç ince — hiyerarşi net. Kol ucu kesik çizgi. |
| W8 | Seamwork — Bobby Dress (2 görsel) | https://www.seamwork.com/media/products/3105/3105-60a9acb2.png , https://www.seamwork.com/media/products/3105/3105-67b904a5.png | Dış kontur kalın, iç dikiş ince, CF/CB dikişi ince düz. Bel lastiği: bandın üstünde ve altında SİMETRİK, solan ince dikey çizgiler. Kol evi yan dikişe temiz iniyor; cep ağzı için yan dikişte minik çentik (tek kısa çizgi, kıvrım yok). Etek ucu kesik çizgi. Ön+arka yan yana, aynı boy. |

Çekilemeyen/işe yaramayan: Etsy listing (403), Closet Core ürün sayfaları (görseller JS ile yükleniyor, URL alınamadı), Sew Over It Florence (sayfada flat URL'si yok), Pattern Emporium (flat URL'si çıkmadı), Helen's Closet Ashton ve Seamwork Meg linkleri fotoğraf çıktı (flat değil, hükümde kullanılmadı).

Satıcı dilinin bu 8 kaynaktan çıkan ortak kuralları (ölçüt):
- Kol evi yan dikişe temiz biter; uçta kıvrım/kanca yok (W1-W8 hepsi).
- Büzgü = seyrek, solan, İNCE, büzülen tarafta ve sol/sağ simetrik (W2, W4, W7, W8). Tarak gibi sık dik tikler yok.
- Fitted silüette yan dikiş bel→kalça tek yumuşak kavis, kalçada tümsek + tekrar daralma (S) yok (W3).
- Kap kol yuvarlak damla (W3); puf kol balon + kol başında 2-4 büzgü çizgisi (W4).
- Askı: omuzda biter ya da fiyonkla biter; havada sivrilen uç yok (W2, W6, W8).
- Ön/arka aynı detay dilinde (ön etek ucu dantel ise arka da).
- Giysi kanvasa sığar, kesilmez (W1-W8).

## 2. Hükümler

**1 — V yaka, kolsuz, prenses dikişli, bel dikişli A-line elbise, önde iki kapaklı cep — EVET**
- Çizgi hiyerarşisi doğru: dış kontur kalın, prenses/bel/cep iç çizgileri ince; W1 Martha ile aynı dilde. Ön V yakadan görünen arka yaka ince kavisi (y≈45→100) satıcı konvansiyonu.
- Kusur: kol evi alt ucunda minik kanca/kıvrım, ön (≈100,205) ve (≈360,205), arka (≈535,205)/(≈795,205). W1-W8'de kol evi yan dikişe düz biter.
- Kusur (hafif): cepler yalnız 35 px'lik kavisli şerit (≈95-190 × 515-550); kapak mı, yama cep mi belirsiz — W3'teki sahte cep kapağı gibi düğme/dikdörtgen olsa okunurdu. Silüet (A-line, bel oturmuş) ve arka düzgün.

**2 — İnce askılı, prenses korsajlı, bel dikişli, uzun A-line elbise, ön etek ucu dantelli — HAYIR**
- Askı uçları havada sivriliyor: ön (≈125,35) ve (≈345,35), arka (≈555,35)/(≈780,35). Askı iki çizgiden bir noktaya kapanıp bitiyor; W2/W6/W8'de askı omuzda kalınlığını koruyarak biter ya da fiyonkla biter.
- Ön etek ucu dalgalı/dantelli (y≈955), arka etek ucu düz (y≈955) — ön/arka detay dili tutarsız. Etek ucundaki iki dikey ince çizgi (≈180 ve ≈290, y 810→955; arkada aynı) pili mi yırtmaç mı belirsiz.
- Kalça hizasında tek başına duran iki kısa "–" işareti (≈100,495) ve (≈365,495): cep çentiği ise W8 gibi yan dikişin üstüne değil, konturdan kopuk duruyor. Kol evi ucunda kanca (≈120,175)/(≈345,175).

**3 — Puf kollu, robalı, anahtar deliği yakalı, düğmeli, A-line shift elbise (kol ucu dantel) — EVET**
- Puf kol balon; kol başı büzgüsü kolun üstünde, kol ucu büzgü + dantel — W4 Hughes puf kolla aynı dilde. Bol silüet bol çizilmiş (roba altı düz A).
- Ön/arka tutarlı: roba çizgisi (y≈185) iki görünüşte aynı yükseklik, kollar aynı; arka yaka ince kavis. Kol evi/koltuk altı kanca yok — bu turdaki en temiz kavşak.
- Kusur (hafif): düğme (≈232,118) altındaki kesik çizgi (y 125→160) patın nerede bittiğini söylemiyor; anahtar deliği yarığı ile pat çakışıyor. Roba altındaki iki ince dikey çizgi (≈165 ve ≈300, y 190→250) salıverme pilisi olarak okunur, kabul.

**4 — Düğme önlü, kap kollu, prenses dikişli, bodycon mini elbise — HAYIR**
- Kap kol sivri üçgen kanat: ön sol (≈40-105, 60-235), sağ (≈360-430, 60-235); uçta nokta (≈100,235). W3 Etta'da kap kol yuvarlak damla. Arka da aynı üçgen.
- Yan dikiş S-kıvrımı: bel (y≈420) daralıyor, kalça (y≈600, x≈75) tümsek yapıyor, sonra etek ucuna daralıyor — W3'te bel→kalça tek yumuşak kavis, tümsek yok. "Oturan oturmuş" değil, karikatür kum saati.
- Yaka-omuz köşesinde yukarı sivrilen tik: (≈120,45) ve (≈350,45), arkada (≈550,45)/(≈780,45). Düğme patı (çift ince çizgi + 9 düğme) ve prenses ince çizgiler doğru — o kısım satıcı dilinde.

**5 — Kayık yakalı, kolsuz, göğüs altı büzgülü, bel dikişli, pensli etekli elbise — HAYIR**
- Büzgü tarama simetrisi bozuk: göğüs altı dikişinde sol küme dikişin ALTINDA (≈120-215, 300-330), sağ küme dikişin ÜSTÜNDE (≈265-350, 265-300). W2/W7/W8'de büzgü büzülen tarafta ve sol/sağ aynı. Tarama sık dik tik (tarak), satıcı dili seyrek solan ince çizgi.
- Ön göğüs altı dikişi eğri/dalgalı (y 290→320 arası kayıyor) ve arkada aynı dikiş düz yatay (y≈320) + arkada hiç büzgü yok — ön/arka tutarsız.
- Omuz uçları yukarı sivri (≈60,80) ve (≈410,80); kol evi ucunda kanca (≈90,240)/(≈375,240). Etek pensleri (ince, belden aşağı) ve bel dikişi doğru.

**6 — Geniş askılı, bağcıklı yaka, göğüs altı dikişli, büzgülü A-line sundress/pinafore — HAYIR**
- Askı kenarlarında iki taraflı sık tarama (≈90-135, 40-120 ve ≈330-380, 40-120; arkada aynı): büzgü mü, fırfır mı, dantel mi okunmuyor. W6 Orchard'da askı düz kalın kontur.
- Yaka ortasındaki bağ tek ince kıvrık iki çizgi (≈230-240, 150-310), fiyonk değil, sarkan iplik gibi. W2/W4/W7'de bağ ilmekli fiyonk + belirgin uç.
- Göğüs altı büzgüsü yine sol küme dikişin üstünde (≈115-235, 240-255), sağ küme altında (≈245-350, 255-270) — ayna hatası. Yaka kavisinde de iki ayrı tarama kümesi. Kol evi kanca (≈120,185)/(≈350,185). Etek "drape" ince dikey çizgileri (4 adet) W2 dilinde, doğru.

**7 — Tek omuzlu, asimetrik yakalı, yanı büzgülü (ruching) bodycon elbise — HAYIR**
- Giysi kanvasa sığmıyor: omuz/üst kenar ön (≈140,0) ve arka (≈570,0) noktasında görüntünün üst sınırında kesiliyor. W1-W8'de giysi tamamen çerçeve içinde.
- Sağ yan büzgü: dik tik tarağı + iç kesik çizgi (≈375-405, 185-385) + dört ince kavis (≈300-410, 230-640) — hangisi dikiş, hangisi kumaş kırışığı belirsiz. Sağ üst köşe kanat + kanca (≈395-405, 80-150); sol kol evi kanca (≈75,150).
- Yan dikiş S-kıvrımı (bel ≈y 400 daralma, kalça ≈y 600 tümsek, sonra daralma). Arka görünüş düz ve temiz ama önde ruching varken arkada karşılığı yok.

**8 — Düğme önlü, kayık yakalı, kolsuz, bel pensli, etek ucu açılan bluz/korsaj — HAYIR**
- Omuz uçları boynuz gibi yukarı sivriliyor: (≈85,50) ve (≈390,50), arkada (≈495,50)/(≈855,50). Satıcı flat'inde omuz-yaka köşesi tek yumuşak köşe.
- Pensler çatallanıyor: bel pensi tek ince çizgi (≈155, 315→505) sonra etek ucuna doğru üçgen açılıyor (≈115-155, 505-610); arkada aynı. Pens ucundan ters pili açılması satıcı dilinde yok; W3/W2'de pens ince tek çizgi ya da damla.
- Etek ucu yanlarda çan gibi dışa kıvrılıyor (≈65-95, 540-610 ve ≈380-410, 540-610), üst beden oturmuş — peplum mu, hem kıvrımı mı belirsiz. Kol evi kanca (≈90,245)/(≈380,245). Düğme patı (çift ince çizgi + 9 düğme) doğru.

**9 — Kalp yakalı, kup dikişli, fiyonk askılı, bel dikişli, pensli mini A-line elbise — EVET**
- Fiyonk askılar omuz üstünde (≈95,35 ve ≈375,35), W2 Skye dilinde; kalp yaka kalın kontur + içeride ince paralel + kesik baskı dikişi; etek ucu kesik çizgi (W4/W8 hem konvansiyonu). Hiyerarşi net.
- Ön/arka tutarlı: arka kare yaka + kesik baskı, askılar düz, bel dikişi ve etek pensleri aynı hizada (y≈420). Silüet oturan korsaj + kısa A etek, W3/W4 arası.
- Kusur (hafif): kol evi ucunda kanca (≈100,205)/(≈360,205); kup kavisi (≈140-190, 180-260) ile alttaki dikey pens çizgisi (≈190, 260→420) kesişimi köşe yapıyor, satıcıda tek akan prenses olurdu.

**10 — Geniş askılı, kare yakalı (dantel kenar), göğüs altı büzgülü, A-line pinafore; arkada fermuar — HAYIR**
- Büzgü ayna hatası yine: göğüs altı dikişinde sol küme dikişin ALTINDA (≈145-195, 230-260), sağ küme ÜSTÜNDE (≈275-320, 205-235); dikişin kendisi dalgalı el çizgisi (y 230→260 arası). W2/W7'de düz dikiş + tek taraf solan çizgi.
- Ön yaka dantel/dalga kenarı (≈175-300, 140) arkada da var (≈600-720, 160) — tutarlı, olumlu. Arka fermuar: kesik çift çizgi + üstte küçük dikdörtgen çekme (≈665,170) — W1/W3 fermuar dili, doğru.
- Kol evi ucunda kanca (≈120,190)/(≈350,190); arkada (≈545,190)/(≈780,190). Askılar düz ve omuzda bitiyor (W6 dilinde), silüet A-line — bunlar doğru; hüküm yalnız büzgü hatasından.

**11 — Puf kollu, bebe yakalı (dantel kenar), robalı, anahtar deliği kapamalı bluz — HAYIR**
- Roba büzgüsü ayna hatası: sol küme roba çizgisinin ÜSTÜNDE (≈145-225, 175-190), sağ küme ALTINDA (≈245-320, 190-205); arkada da aynı çapraz (≈575-660 üst, ≈680-765 alt). Tarama sık dik tik.
- Bebe yaka önde iki ayrı kanat + ortada tab (≈165-300, 60-105) — arkada yaka iki dilim + dantel (≈600-730, 60-105): ön/arka tutarlı, dantel kenar iki tarafta da var. Puf kol balon, kol ucu büzgü+dantel — W4 dilinde, doğru.
- Bol bluz bol çizilmiş, etek ucu hafif kavis, kol evi kanca yok (koltuk altı ≈130,215 temiz). Roba altı 4 ince dikey drape çizgisi W2 dilinde. Hüküm yalnız büzgü ayna hatasından; düzelse EVET.

## 3. Özet

**EVET: 3 / 11** — 1, 3, 9.
**HAYIR: 2, 4, 5, 6, 7, 8, 10, 11.**

HAYIR'ların ortak kök nedeni, üç mekanik hata; hepsi giysi tipinden bağımsız, aynı motor çıktısında tekrar ediyor:
1. **Büzgü taraması ayna/çapraz hatası** (5, 6, 10, 11): sol küme dikişin bir tarafında, sağ küme öbür tarafında; tarama sık dik tik "tarak" — satıcı dili seyrek, solan, tek taraflı, sol/sağ simetrik ince çizgi. Tek başına 4 HAYIR üretiyor; 10 ve 11 bu düzelse EVET.
2. **Kontur uç noktaları kapanmıyor**: kol evi altında kıvrık kanca (1, 2, 5, 6, 7, 8, 9, 10 — 8 flat'te), omuz-yaka köşesinde yukarı sivrilen tik/boynuz (4, 5, 8), askı ucunun havada sivrilmesi (2), giysinin kanvastan taşması (7). Satıcı flat'lerinde kol evi yan dikişe düz biter, omuz köşesi tek.
3. **Oturan silüette yan dikiş S-kıvrımı** (4, 7, 8, hafif 5): bel daralması → kalça tümseği → tekrar daralma. Etta (W3) kalem eteği tek yumuşak kavis. Aynı aileden: kap kolun üçgen kanat olması (4), pensin etek ucunda çatallanması (8).

Doğru çalışan (satıcı dilinde) parçalar: çizgi hiyerarşisi (dış kalın/iç ince) 11'inde de var; düğme patı (4, 8), fermuar (10), kesik baskı/hem dikişi (9, 10), puf kol (3, 11), fiyonk askı (9), bebe yaka + dantel (11), drape çizgileri (6, 11), ön+arka yan yana + etiket (11'inde de).
