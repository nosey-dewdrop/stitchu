# Tur 18 — Hakem 12 (kör hakem, yalnız png) — 2026-09-10

Açılan repo dosyaları: yalnız `KOSU/ciktilar/giris-3/{1..11}/flat.png`. Başka hiçbir repo dosyası, önceki hakem raporu, hedef fotoğraf ya da eski scratchpad görseli açılmadı. Karşılaştırma ölçütü aşağıdaki, bu turda web'den çekilip Read ile açılan satıcı flat'leri.

## 1. Web kaynakları (bugün çekildi, görseller açıldı)

| # | Satıcı / kalıp | URL | Gözlem |
|---|---|---|---|
| R1 | Tilly and the Buttons — Martha Dress | https://tillyandthebuttons.com/cdn/shop/products/Martha_technical_drawing_1800x1800.jpg | Dış kontur ince-orta, iç dikişler biraz daha ince; prenses dikişi omuzdan bele, bel dikişi, kup/pens yandan; etekte ince "drape" çizgileri; etek ucu kavisli; arka görünüm CB fermuar (çift çizgi + halka) ile ayrı çizilmiş; puf kol başında kısa büzgü çizgileri. |
| R2 | Friday Pattern Co — Hughes Dress | https://fridaypatterncompany.com/cdn/shop/files/hughes_tech_a6e52c2d-5a85-4a69-bab5-867ff68d2c18.png | Dış kontur belirgin kalın, iç dikiş ince; CF'de düğmeler pat çizgisinin ÜSTÜNDE ve pat iki çizgili; etek ucu ve kol ucu kesik çizgi (gaze/topstitch); puf kol başı ve ucu kısa, eşit büzgü tikleriyle; arkada bağcık + fiyonk; ön/arka aynı giysi, aynı silüet. |
| R3 | Cashmerette — Appleton Dress | https://www.cashmerette.com/cdn/shop/files/Cashmerette-1201Appleton-tech-ill-4x5_f6b69159-71ab-44ac-ad5f-a1578f752504.jpg | Çok temiz tek kalınlık + ince kesik dikiş; kruvaze bant; kol dirsekte ince kesik çizgi; etek ucu kesik çizgi; ön/arka yan yana, arka sade. |
| R4 | Friday Pattern Co — Collins Dress & Top | https://fridaypatterncompany.com/cdn/shop/files/collins_flat_WIDE.png | Kare yaka, askı omuzda; etek ucu zikzak (dantel/fisto) — ince; etekte 2 ince drape çizgisi; yan dikiş bel→kalça kavisli; 6 varyant aynı dilde. |
| R5 | True Bias — Ogden Cami | https://truebias.com/cdn/shop/products/ogden14-30linedrawings_1024x1024.jpg | Pens yandan içeri (iki bacak birleşiyor); etek ucu kesik çizgi; askı içi gri (astar/biye); ön ve arka alt alta, aynı giysi; askı omuz noktasında. |
| R6 | Grainline Studio — Farrow Dress | https://grainlinestudio.com/cdn/shop/products/grainline-farrow-dress-pattern-0-18-flat-technical-illustrations.jpg | Şevron kup dikişi ön/arka farklı yükseklikte (asimetri değil, tasarım); arkada anahtar deliği; gölge/drape ile hacim; etek ucu kesik çizgi; ön-arka üst üste bindirilmiş. |
| R7 | Closet Core — Elodie Wrap Dress | https://cdn.shopify.com/s/files/1/0632/8217/products/Wrap-dress_TechnicalFlat_CS6-03.jpg | Belde tuck'lar kısa çift çizgi; cep yamalı, kenarında kesik topstitch; fiyonk arkada; kol ucu kesik çizgi; etek ucu kavisli + kesik çizgi; A/B varyantlar. |
| — | Helen's Closet — March | https://helensclosetpatterns.com/cdn/shop/files/charts-illustrations-front.png | AÇILDI ama flat DEĞİL (renkli figür illüstrasyonu). Ölçüt olarak KULLANILMADI; kayıt için burada. |

Bu 7 satıcı flat'inden çıkan ortak dil (ölçüt):
- Dış kontur ≥ iç dikiş kalınlığı; iç dikiş tek ince çizgi.
- Etek ucu: kavisli ve/veya kesik topstitch çizgisi; fisto = ince zikzak.
- Büzgü: dikişe bitişik, kısa, EŞİT boylu tikler (R1, R2).
- Pens: iki bacak birleşir; pens ucundan sonra çizgi devam etmez (R1, R5).
- Düğme: CF üzerinde, pat iki çizgi (R2).
- Kol koltuk oyuğu ve yan dikiş ayrı okunur; kolsuzda oyuk kavisi yan dikişten ayrılır (R4, R5).
- Askı/kol omuz noktasında; ön ve arka aynı giysi, asimetri arkada aynalanır.
- Köşe/kanca yok; her iç çizgi bir dikişe ya da kenara bağlanır (drape çizgileri hariç, onlar ince ve kısa).

## 2. Hükümler

**1 — V yakalı, kolsuz, prenses dikişli, bel dikişli, yamalı kapaklı cepli A-line elbise; arka kayık yaka prenses dikişli — HAYIR**
- Ön yakada iki yaka var: kalın V (150,60)→(240,190)→(330,60) ve aynı omuz noktasından çıkan ince oval (150,60)→(240,110)→(330,60). Satıcı dilinde V'nin astar/facing çizgisi V'ye paralel çizilir; oval, V'nin üstünde asılı kalıyor ve giysi öğesi olarak okunmuyor (~x150-330, y60-190).
- Cepler satıcı dilinde (üstte kesik dikiş, altı yuvarlak, kapak çizgisi) ve prenses dikişini örtüyor; dikişin cep altında kaybolup (185,480) altında (160,580) devam etmesi R7 ile uyumlu — olumlu.
- Çizgi hiyerarşisi, bel dikişi, kavisli etek ucu ve arka görünüm (kayık yaka + prenses) satıcı seviyesinde; tek engel yaka. Ön omuz şeridi (95-150) ile arka omuz şeridi (520-560) genişliği tutarlı.

**2 — İnce askılı, kavisli kup dikişli korsaj, bel dikişi, fistolu uçlu midi A-line elbise; arka düz kup — EVET**
- Kup dikişleri göğüs üstünde yana doğru bombe yapıp bele iniyor (165-200, 160-340) ve etekte devam ediyor — R1 prenses dili. Arka kup düz; ön/arka aynı giysi.
- Etek ucu ince zikzak fisto (60-420, 905-915) R4 Collins ile birebir aynı dil; yan dikiş bel→kalça kavisli.
- Askılar korsaj köşesinden omuz noktasına gidiyor (135,50)→(165,150), ön/arka paralel; kanca/köşe hatası yok. Küçük not: fisto ucu satıcıda dış kontur ağırlığında, burada biraz ince — hüküm değiştirmez.

**3 — Roba (yoke) dikişli, bebe yakalı, tek düğmeli kısa patlı, dantel uçlu puf kollu, altta serbest tuck'lı şift elbise; arka roba + CB açıklık — EVET**
- Puf kol balon: kol başında ve kol ucunda kısa büzgü tikleri, uçta ince dantel fisto (85-135, 220-235) — R2 Hughes dili. Kolun içi ince koltuk oyuğu çizgisi ile gövdeden ayrılmış.
- Yaka iki lob, CF'de kısa pat + düğme (235,148); roba dikişi ön/arka aynı yükseklikte; arkada CB açıklık çizgisi robaya kadar (660,80-115) — tutarlı.
- Roba altı tek çizgi tuck'lar (175-180,210-265) ve (300-305,210-265) R7 tuck diline yakın; şift silüeti aşağı doğru açılıyor, etek ucu hafif kavisli. Arka yaka kenarı dış kontura göre biraz ince (600-720, 85-110) — küçük.

**4 — Kayık yakalı, petal/tulip kısa kollu, prenses dikişli, önü boydan düğmeli kalem elbise; arka prenses dikişli — HAYIR**
- Düğme/pat: 10 düğme (x≈275) tek bir çizginin (x≈288) yanında; CF çizgisi yok, pat tek çizgi. R2'de düğme CF üstünde, pat iki çizgi. Burada düğmelerin nereye diktiği okunmuyor (x270-290, y60-750).
- Kol: tulip kolun dış hattı (85,60)→(55,120)→(100,215) iki keskin köşeyle kırılıyor, kol ucu gövdeye (135,200)'de kanca gibi giriyor; arkada aynı (490,120)/(520,215). Satıcı kolu (R1, R2) yumuşak kavisle biter.
- Olumlu: silüet oturmuş (bel/kalça kavisi ve daralan etek ucu net), prenses dikişleri omuzdan etek ucuna kesintisiz, ön/arka aynı giysi; çizgi hiyerarşisi doğru.

**5 — Geniş kayık yakalı, kolsuz, göğüs altı kavisli büzgülü dikişli, bel dikişli, etekte pensli düz elbise; arka aynı (büzgüsüz) — HAYIR**
- Büzgü tikleri düzensiz: (130-350, 250-300) arasında farklı boy ve aralıkta, dikişin yalnız üstünde ve bazıları dikişten kopuk. R1/R2'de tikler kısa, eşit, dikişe bitişik.
- Omuz uçlarında minik sivri çıkıntı/kanca var (≈(130,65) ve (345,65); arkada (545,65) ve (770,65)): omuz çizgisi yaka noktasına yükselip tepe yapıyor, oradan yaka kavisi iniyor.
- Olumlu: etek pensleri iki bacaklı ve uçta birleşiyor (185-200,430-600), R5 pens dili; bel dikişi ve hafif kavisli etek ucu doğru. Bel noktasında yan dikiş kırıklığı (130,430)/(350,430) küçük ama görünür.

**6 — Geniş askılı (kıvrım çizgili), büzgülü oval yakalı, CF fiyonklu, göğüs altı dikişi büzgülü, drape çizgili A-line sundress/pinafore; arka düz üst kenar, aynı büzgü — EVET**
- Büzgü tikleri iki yerde de dikişe bitişik ve kısa: yaka kenarı üstünde (150-320,150-165) ve göğüs altı dikişinin ALTINDA (etek büzgülü) — R1/R2 ile aynı mantık; arkada da aynı (545-775,255-270).
- Fiyonk iki ilmek + iki uç, uçlar dikişe iniyor (230,160-250) — R2 arka fiyonk dili; askılardaki üçlü ince kıvrım çizgisi ön/arka tutarlı.
- Bol giysi bol: etek ve gövde açılıyor, drape çizgileri ince ve kısa (R1, R4). Etek ucu hafif kavisli; askı omuzda, köşe/kanca yok.

**7 — Tek omuzlu, eğik yakalı (ince paralel biye çizgili), tek yanda büzgülü drape'li, kolsuz kalem elbise; arka aynalanmış tek omuz — HAYIR**
- Yaka hattı iki düz parçadan oluşuyor, (240,125)'te kırılıyor: (110,65)→(240,125)→(380,165). Satıcı flat'inde tek omuz yakası tek kavistir; kırık, çizim artefaktı olarak okunuyor.
- Drape çizgilerinin en alttakisi (330,560)→(355,490) yan dikişe bağlanmıyor, boşlukta yüzüyor; üstteki üçü dikişe tiklerle bağlı (365,260-470) ve doğru dilde.
- Olumlu: asimetri TUTARLI — arka görünümde omuz karşı tarafa (790,65) aynalanmış, arkada drape yok (doğru); ince biye çizgisi dış kontura paralel. Sol omuz noktası (110,65) sivri tepe; askı/omuz genişliği okunmuyor.

**8 — Kayık yakalı, kolsuz, önü boydan düğmeli (iki çizgili patlı), bel pensli, etek ucunda hafif açılan yelek/üst; arka bel pensli — HAYIR**
- Koltuk oyuğu okunmuyor: omuzdan bele kadar dış kontur tek S-kavis (100-130, 90-430), oyuğun bittiği/yan dikişin başladığı nokta yok. R4/R5'te kolsuzda oyuk kavisi ile yan dikiş ayrı.
- Pensler: iki bacak (165-175,300-470)'te birleşiyor, sonra TEK çizgi etek ucuna kadar devam ediyor (170,470-565). Satıcıda pens ucundan sonra çizgi yoktur; bu ne pens ne dikiş. Arkada aynı (585-590, 300-565).
- Olumlu: düğmeler CF üstünde, pat iki çizgi (230/255) — R2 dili, bu turdaki en doğru pat. Etek ucu köşelerinde yan dikiş dışa şişip geri geliyor (95,480-565) — kanca benzeri şişkinlik.

**9 — Kalp (sweetheart) yakalı, omuzda fiyonkla bağlanan askılı, kup dikişli korsaj, bel dikişli, etek pensli, kesik çizgili uçlu mini A-line elbise; arka düz üst kenar + askı + pens — EVET**
- Kup dikişleri yaka kenarından başlayıp kase çizerek bele iniyor (150,180)→(200,260)→(200,400); yaka kenarına paralel kesik çizgi (facing/topstitch) — R3/R5 dili.
- Etek pensleri iki bacaklı ve uçta birleşiyor; etek ucu kesik topstitch (65-420,780) — R2/R5/R7.
- Askılar korsaj köşesinden omuz noktasına, tepede fiyonk (110,50)/(365,50); arka askılar düz üst kenardan çıkıyor, tutarlı. Ön/arka aynı giysi, yan dikiş bel→kalça kavisli; köşe hatası yok.

**10 — Geniş askılı, kare yakalı, yaka kenarı fistolu, kavisli göğüs dikişi büzgülü A-line pinafore; arka kare yaka fistolu, yatay dikiş + CB fermuar — EVET**
- Fermuar: çift kesik çizgi + üstte fermuar başı (660,180-555) — R1 Martha'nın CB fermuar dili birebir.
- Fisto yakanın iç kenarında ince zikzak (175-300,155) ve arkada aynı; ön kavisli göğüs dikişinin üstünde kısa eşit büzgü tikleri (130-350,215-245) — R2 dili, dikişe bitişik.
- Askılar omuzda, korsaja (150,150)/(125,200) yumuşak geçişle bağlanıyor; ön kavisli/arka düz dikiş farkı R6 Farrow'daki gibi tasarım tutarsızlığı değil. Silüet A-line, etek ucu hafif kavisli.

**11 — Bebe yakalı (fisto kenarlı), CF yırtmaçlı, roba altı büzgülü, dantel uçlu puf kollu, drape çizgili bol bluz; arka roba + CB açıklık + aynı büzgü — EVET**
- Puf kol balon, kol başı ve kol ucunda kısa tikler, uçta fisto (85-135,215-235) — R2 dili; koltuk oyuğu ince çizgiyle gövdeden ayrı.
- Roba dikişi altında kısa eşit büzgü tikleri ön (150-320,205-215) ve arka (545-775,205-215) — bol gövde gerçekten bol, etek ucu hafif kavisli; drape çizgileri ince ve kısa (R1/R4).
- Yaka ön/arka tutarlı, CF yırtmaç çizgisi (235,115-150) yakadan roba altına kadar; arkada CB açıklık (660,80-110). Köşe/kanca yok.

## 3. Özet

**EVET: 6 / 11** — 2, 3, 6, 9, 10, 11.
**HAYIR: 5 / 11** — 1, 4, 5, 7, 8.

HAYIR'ların ortak kök nedeni: **öğe–kenar bağlantısı ve köşe geometrisi**. Satıcı flat'inde her iç çizgi bir dikişe/kenara bağlanır ve konvansiyonel biçimde biter; bu beşte kusur hep bağlantı noktasında:
- iki çizgi aynı noktadan çıkıp farklı yaka söylüyor (1),
- pens/pat konvansiyon dışı bitiyor ya da bağlanmıyor — pens sonrası tek çizgi, tek çizgili pat (4, 8),
- büzgü tikleri ve drape çizgisi dikişten kopuk (5, 7),
- dış kontur bir öğeden diğerine keskin köşe/kanca ile geçiyor — tulip kol köşeleri, omuz tepeleri, kırık yaka, oyuk-yan dikiş ayrımı yok (4, 5, 7, 8).

Çizgi hiyerarşisi, silüet, ön/arka tutarlılığı ve etek ucu 11'inde de satıcı seviyesinde; sorun genel stil değil, öğelerin kenarlara bağlandığı yerlerin geometrisi.

### Sorulmayan ama görülen (döküm)
- Helen's Closet "charts-illustrations-front.png" flat değil, figür illüstrasyonu; Closet Core ürün sayfaları lazy-load olduğu için flat URL'i ancak Shopify `.json` uç noktasından bulundu (`Wrap-dress_TechnicalFlat_CS6-03.jpg`).
- Papercut Patterns'ın products.json'unda ilk 5 üründe dosya adında flat/tech/line geçen görsel yok — kontrol edilmedi, ölçüte alınmadı.
- 11 png'de "ON/ARKA" etiketleri var; satıcılar FRONT/BACK ya da etiketsiz. Hüküm dışı.
- 7 satıcı flat'inin 5'i etek ucunda kesik topstitch çizgisi kullanıyor; 11 png'nin yalnız 9 ve 10'unda var. Eksiklik değil ama satıcı yanına konunca gözle fark edilen bir dil farkı.
