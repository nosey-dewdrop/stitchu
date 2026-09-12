# Tur 23 — Hakem 22 (kör hakem, yalnız png) — 2026-09-10

Kural: yalnız `KOSU/ciktilar/giris-3/{1..11}/flat.png` açıldı. Repo'daki başka hiçbir dosya (svg/json/md/kod/hedef foto/önceki hakem) açılmadı. Karşılaştırma ölçütü = bu turda web'den çekilip Read ile açılan satıcı flat'leri (bölüm 1).

## 1. Web kaynakları (bu turda çekildi, görsel Read ile açıldı)

| # | Satıcı / ürün | URL (görsel) | Gözlem |
|---|---|---|---|
| R1 | Cashmerette — Wayland Dress (tech-ill) | https://www.cashmerette.com/cdn/shop/files/Cashmerette-1120-Wayland-tech-ill-4x5.jpg | Ön+arka yan yana, midi+mini iki uzunluk. Dış kontur kalın, iç dikiş ince, etek ucu ve kapak kenarı kesik çizgili (topstitch). Arka: shirring dokusu ızgara-benzeri kısa çizgilerle, CB dikişi + yırtmaç, askılar omuzda biter. Bel pliler kısa ince çizgi. Askı-bodice köşesi TEMİZ, kanca yok. Hafif gölge (drop shadow). |
| R2 | Grainline — Austin Dress (View A/B) | https://grainlinestudio.com/cdn/shop/files/grainline-austin-dress-pattern-0-18-flat-technical-illustrations.jpg | Ön+arka; yan düğme patı düğmeler kenarda; CF dikişi çift ince çizgi (topstitch); büzgü etekte uzun ince değişken boy çizgiler; yamalı cep dikişe kesik çizgiyle bağlı; etek ucu dalgalı (büzgülü bol etek). Kol oyuğu ve omuz yuvarlak, köşe kusuru yok. |
| R3 | Grainline — Farrow Dress | https://grainlinestudio.com/cdn/shop/products/grainline-farrow-dress-pattern-0-18-flat-technical-illustrations.jpg | Ön/arka üst üste bindirilmiş (offset), kollu + kolsuz. Kol gövdeye kol oyuğu boyunca YAPIŞIK, kol ile gövde arasında boşluk yok. Chevron etek dikişi ince, kumaş dökümü çok hafif gri çizgi. Kesik çizgi etek ucu; CB gözyaşı (keyhole) açıklığı. |
| R4 | Grainline — Felix Dress | https://grainlinestudio.com/cdn/shop/files/grainline-felix-dress-pattern-0-18-flat-technical-illustrations.jpg | Kruvaze V yaka, bant yakada kesik çizgi; büzgü etek uzun ince çizgilerle; etek ucu dalgalı ve iç yüz gri; kollu/kolsuz varyant. Kol daima gövdeye bitişik. |
| R5 | True Bias — Zoey Tank/Dress line drawings | https://truebias.com/cdn/shop/products/zoey0-18linedrawings_1024x1024.jpg | FRONT/BACK etiketli, View A/B/C satırlar. Yaka bandı çift ince çizgi + kesik topstitch; CF/CB dikişi ince tek çizgi; etek ucu kesik çizgi ve hafif kavis; oturan silüet belde içe, kalçada dışa. Askı-bodice birleşimi temiz köşe. |
| R6 | Tilly and the Buttons — Skye Sundress tech drawing | https://tillyandthebuttons.com/cdn/shop/products/Skye_sundress_6-34_tech_drawing_1800x1800.jpg | Omuzda fiyonk askı (bow), kare yaka, bodice'te pens göz şeklinde ince çizgi (bust pleats), imparatorluk dikişinden büzgü uzun çizgilerle, etek ucu kesik çizgi. Ön 3 uzunluk + arka ayrı. Askı içi gri (iç yüz). Çizgi ağırlığı: kontur orta, iç çok ince. |
| — | Helen's Closet — March (charts-illustrations-front.png) | https://helensclosetpatterns.com/cdn/shop/files/charts-illustrations-front.png | AÇILDI ama flat DEĞİL: manken üstünde çizim (illüstrasyon). Ölçüt olarak KULLANILMADI. |
| — | Closet Core / Deer&Doe — Mistral (-47.jpg, alt="Technical Flatlays") | https://closetcorepatterns.com/cdn/shop/files/MistralDressPattern_Deer_Doe-47_1024x1024.jpg | AÇILDI: model fotoğrafı çıktı, flat değil. Sayfadaki gerçek flat görseli JS ile yükleniyor, URL alınamadı. KULLANILMADI. |
| — | Papercut Patterns (celestia-dress) | https://papercutpatterns.com/products/celestia-dress | Ürün sayfasında flat görsel dosya adı bulunamadı (yalnız foto). DOĞRULANMADI, kullanılmadı. |

Ölçüt özeti (R1–R6 ortak dili): kalın dış kontur / ince iç dikiş; topstitch ve etek ucu kesik çizgi; büzgü = değişken boyda ince çizgiler dikişe BAĞLI; kol gövdeye kol oyuğu boyunca bitişik; askı/bodice ve kol altı köşeleri temiz (kanca/adım yok); ön+arka aynı giysi, kapama (fermuar/düğme) gösterilir; etek ucu tek pürüzsüz eğri.

## 2. Hükümler

**1 — V yaka, kolsuz, prenses dikişli, bel dikişli A-line elbise; kapaklı iki yamalı cep; arka kayık yaka — EVET**
1. Çizgi hiyerarşisi doğru: kontur kalın, prenses/bel dikişleri ince, V yaka altında kesik çizgi facing (R5/R1 diliyle aynı).
2. Cep kapağı (y≈490) kesik çizgi ile dikişe bağlı, cep gövdesi altta; prenses dikişi cebin arkasından geçiyor — R2'deki yamalı cep okumasıyla uyumlu.
3. Kusur (küçük): ön/arka kol altı köşesinde (≈120,190 ve ≈545,195) küçük bir bükülme/adım var; kapama (fermuar) hiç çizilmemiş — oturan bel + bel dikişi için satıcılar CB fermuar gösterir (R1).

**2 — İnce askılı, prenses dikişli, bel dikişli A-line midi elbise; fisto (scallop) etek ucu; arka düz üst kenar — EVET**
1. Fisto etek ucu + üstünde kesik çizgi: R1/R5'teki etek ucu diline birebir; kavisli yan dikiş ve kalça dönüşü doğal.
2. Askı çift ince çizgi, bodice üst kenarında bitiyor, arkada da aynı giysi (askı konumu ön/arka tutarlı).
3. Kusur (küçük, sistemik): bodice üst kenarının yan dikişe bindiği yerde (≈130,185 ve ≈555,185) küçük kanca/adım; R1/R5'te bu köşe temiz.

**3 — Puf kollu, robalı, düz shift elbise; geniş iki parçalı yaka, CF'de tek düğme, kol ucunda bant + dantel; roba altında iki serbest pens/pli — EVET**
1. Puf kol gerçekten balon: kol başında büzgü tikleri (≈80–110,110–130), altta bant ve fisto dantel; kol gövdeye kol oyuğu boyunca bitişik (R3/R4 kuralı).
2. Roba dikişi ince, altındaki iki tek çizgi (≈175,210→265 ve ≈305,210→265) serbest pli olarak okunuyor; silüet düz shift, bol giysi bol.
3. Kusur: yaka lobları CF'de yuvarlak, omuzda sivri uçla kol dikişine kadar uzanıyor (≈140,85 / ≈330,85) — Peter Pan değil, geniş bertha-tipi yaka okunuyor; arkadaki kısa CB çizgisi (≈660,85→115) düğme/ilik olmadan havada — kapama belirsiz.

**4 — Kayık yaka, kısa kollu, CF boydan düğmeli (10 düğme), prenses dikişli oturan kalem elbise — HAYIR**
1. KUSUR (belirleyici): kol gövdeden AYRIK çizilmiş — kol ile gövde arasında üçgen boşluk var (ön ≈65–130 x 80–215; arka ≈490–555 x 80–215; sağda ≈355–420). Kol düz bir kanat gibi dışa açılmış; R3/R4'te kol gövdeye kol oyuğu boyunca yapışıktır. Satıcı flat'i olarak okunmuyor.
2. KUSUR: etek ucunda CF'de (≈262,752) küçük sivri köşe — iki etek ucu yarımı pürüzsüz birleşmemiş.
3. Olumlu: düğme patı çift ince çizgi + eşit aralıklı düğmeler, prenses dikişi omuzdan etek ucuna kesintisiz, oturan silüet (bel içe, kalça dışa) doğru.

**5 — Kayık yaka, kolsuz, göğüs altı kavisli dikişe büzgülü üst parça, bel dikişi, etekte ikişer pens; arka ön ile aynı — EVET**
1. Büzgü tikleri kavisli dikişe bağlı ve dikişin üst tarafında (≈130–360, 245–300), R2/R6 dili; kontur kalın, dikişler ince.
2. Oturan silüet doğru: bel içe, kalça dışa, etek ucu hafif daralıyor; etek pensleri iki ince çizgi, bel dikişinden başlıyor.
3. Kusur: ön ve arka birebir aynı (arka da büzgülü göğüs parçası), hiçbir kapama yok — oturan bel dikişli elbise için satıcı CB fermuar çizer (R1); kol oyuğu–yan dikiş köşesi belirsiz, oyuk çok derin okunuyor (≈130,255–300).

**6 — Geniş askılı kare yaka, yaka kenarında büzgü + CF fiyonk (bağcık), imparatorluk dikişinden büzgülü A-line etek — EVET**
1. Etek büzgüsü R2/R6 ile aynı dil: dikiş altında kısa tikler, ardından değişken boyda uzun ince çizgiler; bol giysi bol.
2. Yaka büzgüsü + fiyonk ve sarkan bağcık (≈235,165→245) kenara bağlı; askılar omuzda düz kesilmiş, arkada düz üst kenar — ön/arka aynı giysi.
3. Kusur (küçük, sistemik): bodice üst kenarı–yan dikiş köşesinde adım/kanca (≈128,175–205 ve ≈555,175–205); R1/R6'da bu köşe temiz.

**7 — Tek omuzlu asimetrik elbise; ön sağ yanda drape/büzgü kümesi; arkada CB dikişi ve yaka kenarına paralel iç çizgi — HAYIR**
1. KUSUR (belirleyici): sağ yandaki büzgü/drape kümesi (≈300–360, 270–580) hiçbir dikişe/kenara bağlı değil — yay çizgileri ve tikler gövde ortasında, yan konturdan (≈378) 15–25 px içeride havada bitiyor. R3/R4'te drape çizgileri dikişten çıkar. Karalama gibi okunuyor.
2. KUSUR: etek ucunda CF'de (≈240,828) küçük sivri köşe; ayrıca tek omuz "askısı" 100 px düz yatay üst kenar (≈140–240, 70) — omuzdan geçen bir parçadan çok kesilmiş bir blok gibi.
3. Olumlu: asimetri ön/arka tutarlı (ön omuz izleyici solunda, arkada sağında — doğru ayna), arkada CB dikişi ve yakaya paralel facing çizgisi doğru dilde.

**8 — Kayık yaka, kolsuz, CF düğmeli (9 düğme) bluz/yelek; ön ve arkada ikişer göz (balık) pensi; etek ucunda dışa kıvrılan basen — EVET**
1. Düğme patı çift ince çizgi, düğmeler eşit aralıklı ve boyundan basene; göz pensleri (≈160–175, 300–520) ince kapalı lozenj — R6'daki "bust pleat" göz çizimiyle aynı dil.
2. Ön/arka aynı giysi: pens konumları ve yan kavis birebir; oturan bel + dışa açılan basen tutarlı.
3. Kusur: etek ucunda CF'de (≈240,573) küçük sivri köşe; kol altı noktasında (≈120,240 ve ≈540,240) minik bükülme.

**9 — Fiyonk bağlamalı ince askılı bustier elbise; kalp (sweetheart) yaka, kap dikişleri, bel dikişi, etekte pens; yaka ve etek ucunda kesik çizgi; arka düz üst kenar kesik çizgili — EVET**
1. Bu turdaki en satıcı-benzeri çizim: omuzda fiyonk askı (R6 Skye ile aynı), kesik çizgi yaka facing + etek ucu (R1/R5), kap dikişleri ince ve bel dikişine bağlı.
2. Ön/arka aynı giysi: arka üst kenar düz + kesik çizgi, dikey panel dikişleri, aynı bel dikişi ve pensler.
3. Kusur (küçük, sistemik): bodice üst köşesi–yan dikiş adımı (≈128,210–230 ve ≈550,210–235); kapama (fermuar) çizilmemiş.

**10 — Geniş askılı kare yaka, yaka kenarında zikzak (ric-rac) şerit, kavisli göğüs altı dikişe büzgülü üst parça, A-line etek; arkada yatay dikiş + CB fermuar (kesik çift çizgi ve kürsör) — EVET**
1. CB fermuar doğru dilde: çift kesik çizgi + üstte kürsör (≈660,190→550), R1'deki CB fermuar okumasıyla aynı.
2. Büzgü tikleri dalgalı göğüs altı dikişine bağlı (≈130–350, 200–245); ric-rac şerit yaka kenarına oturuyor; A-line bol.
3. Kusur (küçük, sistemik): bodice üst köşesi–yan dikiş adımı (≈122,205–215 ve ≈548,205–215); arka üst kenar ile fermuar başlangıcı arasında 15 px boşluk.

**11 — Puf kollu, robalı, fisto kenarlı iki parçalı yaka, CF'de kısa yırtmaç, roba altından büzgülü A-line bluz; kavisli etek ucu; kol ucunda bant + dantel — EVET**
1. Roba altı büzgü (≈150–330, 210–240) + etek ucuna kadar değişken boy dökümlü çizgiler: R2/R4 diliyle aynı; puf kol balon, kol gövdeye bitişik, kol başında büzgü tikleri.
2. Ön/arka aynı giysi: roba, yaka fisto kenarı, kol ve büzgü arkada da var.
3. Kusur: etek ucunda CF'de (≈235,470) küçük tepe/köşe — iki etek yarımı pürüzsüz birleşmemiş; hem CF'de hem CB'de (≈660,80→115) kısa çizgi var ama ne düğme ne ilik — kapama belirsiz.

## 3. Özet

**EVET: 9 / 11** (1, 2, 3, 5, 6, 8, 9, 10, 11). **HAYIR: 4, 7.**

HAYIR'ların kök nedeni: **öğe gövdeye bağlanmıyor.** 4'te kol, kol oyuğu boyunca gövdeye yapışmak yerine ayrı bir kanat olarak çizilmiş (üçgen boşluk); 7'de drape/büzgü kümesi yan dikişe bağlanmadan gövde ortasında havada. Satıcı flat'lerinde (R1–R6) her öğe — büzgü, kol, cep, fiyonk — bir dikişe ya da kenara oturur.

EVET'lerde tekrar eden iki sistemik artefakt (tek başına HAYIR yapmıyor ama satıcı flat'inde yok):
- **Bodice üst kenarı–yan dikiş köşesinde adım/kanca** — askılı modellerin hepsinde (2, 6, 9, 10), kolsuzlarda hafif (1, 5, 8). R1/R5/R6'da bu köşe tek temiz kırılma.
- **Etek ucunda CF'de sivri köşe** — iki etek yarımının pürüzsüz birleşmemesi (4, 7, 8, 11). Satıcıda etek ucu tek pürüzsüz eğri.

Üçüncü, dil sorunu: **kapama gösterilmiyor** (1, 5, 9 oturan bel dikişli ama fermuar yok; 3 ve 11'de CB/CF kısa çizgi var ama düğme/ilik yok). 10 bunu doğru yapıyor (CB fermuar) — o dil diğerlerine taşınmalı.

Kullanılmayan kaynaklar (DOĞRULANMADI): Helen's Closet ve Closet Core görselleri açıldı ama flat çıkmadı; Papercut'ta flat URL'si bulunamadı. Ölçüt 6 gerçek satıcı flat'i (R1–R6) üzerine kuruldu.
