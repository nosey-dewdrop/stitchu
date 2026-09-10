# Tur 24 — Hakem 24 (kör hakem, yalnız png) — 2026-09-10

Kural: yalnız `KOSU/ciktilar/giris-3/{1..11}/flat.png` açıldı. Repo'da başka dosya açılmadı. Karşılaştırma ölçütü: bu turda web'den çekilip Read ile açılan 8 satıcı flat'i (aşağıda).

## 1. Web kaynakları (bu turda çekildi ve açıldı)

| # | Satıcı / kalıp | URL | Gözlem |
|---|---|---|---|
| R1 | Grainline Studio — Farrow Dress | https://grainlinestudio.com/cdn/shop/products/grainline-farrow-dress-pattern-0-18-flat-technical-illustrations.jpg | Dış kontur kalın, iç dikiş ince; etek ucu ve kol ağzı kesik çizgili (üst dikiş); ön+arka üst üste binmiş ama aynı giysi; etek ucu hafif kavisli; hafif gri gölge ile derinlik; çentik işaretleri var. Kol dirsekten hafif kırık. |
| R2 | Cashmerette — Upton Dress & Mix-and-Match | https://www.cashmerette.com/cdn/shop/files/Cashmerette-Upton-tech-4X5.jpg | Tek kalınlık, çok ince ve sade çizgi; pensler tek çizgi, büzgü kısa ince çizgiler; ön/arka yan yana; kup dikişleri omuzdan/kol oyuğundan başlayıp bele iner; etek ucu dalgalı (pile). Kravat/fiyonk küçük ayrı parça olarak çizilmiş. |
| R3 | Cashmerette — Holyoke Maxi Dress & Skirt | https://cdn.shopify.com/s/files/1/0735/5719/files/Cashmerette-11041Holyoke-tech-illustration-IG.jpg | Düğmeler içi boş daire, pat iki paralel çizgi + kesik dikiş; arka bel lastiği dalgalı kenar + kısa büzgü çizgileri; askılar bedenden dik yukarı; kup dikişleri etekte bel dikişinden geçip ete ucuna kadar sürüyor; yırtmaç. |
| R4 | Helen's Closet — York Pinafore | https://helensclosetpatterns.com/cdn/shop/files/york_pinafore_flat_illustration.jpg | Gri croquis üstünde flat; kesik çizgi = üst dikiş (yaka, kol oyuğu, etek ucu); cepler kenara/dikişe bağlı; ön ve arka aynı giysi, arka daha yüksek yaka. Bol silüet bol çizilmiş. |
| R5 | Deer & Doe — Arum Dress (schema) | https://cdn.shopify.com/s/files/1/0632/8217/files/Arum-Dress-Pattern_Deer-and-Doe_D0019_schema.jpg | Siyah silüet dolgu, iç dikişler açık renk ince çizgi; göğüs cebi; kol ağzı ve etek ucu kesik çizgi; arka kup dikişleri boyundan etek ucuna. Etek ucu A-line hafif kavis. |
| R6 | Deer & Doe — Magnolia Dress (tech flat) | https://cdn.shopify.com/s/files/1/0632/8217/files/magnolia-dress-pattern-tech-flat.jpg | Anvelop; A/B görünüm etiketli; kuşak ve arkada fiyonk ayrı parça olarak bağlı; kol ağzı lastik büzgü; etek panelleri ince çizgi; kelebek kol kavisli. |
| R7 | Tilly and the Buttons — Manon Trench Jacket (lineart) | https://cdn.shopify.com/s/files/1/0364/2693/files/manon-jacket-sewing-pattern-tilly-and-the-buttons-lineart.png | En ayrıntılı örnek: kalın dış kontur, ince iç; düğme = daire + iki nokta; her kenar kesik çizgi üst dikiş; apolet, kol bandı, yaka ayak/kapak ayrımı; görünümler etiketli; yaka omuz çizgisini örtüyor (boyun noktası görünmez). |
| R8 | True Bias — Merritt Shirt Dress | https://cdn.shopify.com/s/files/1/0085/3901/3186/files/Screenshot_2026-08-12_at_11.28.28_AM.png | Kalın kontur + kesik üst dikiş her kenarda; roba, cep, manşet, yaka; A/B ve C/D görünüm aynı çizimde iki kol boyu; şömizye etek ucu kavisli; arka roba altı pli iki kısa çizgi. Yaka gövde konturunu örtüyor. |

Aramalar (sonuç sayfaları): cashmerette/grainline/closetcore/helenscloset/truebias/deer-and-doe/tillyandthebuttons WebSearch'leri görsel vermedi; görseller ürün sayfası `.json` ve WebFetch üzerinden çekildi. truebias.com/products/roscoe-* ve tillyandthebuttons.com/products/indigo-* 404 döndü.

Referanslardan çıkan ortak dil: (a) dış kontur kalın / iç ince; (b) düğme daire (+iki nokta), pat iki paralel çizgi; (c) büzgü = dikişten çıkan kısa ince çizgiler; (d) kesik çizgi = üst dikiş/fermuar; (e) yaka gövde konturunun ÜSTÜNE oturur, boyun noktası görünmez; (f) askı/omuz düzgün, alt kol kavşağı pürüzsüz; (g) ön+arka aynı giysi, asimetrik öğe iki görünümde de aynı tarafta ve aynı dikişe bağlı.

## 2. Hükümler

**1 — V yaka, kolsuz, prenses kuplu, bel dikişli, kapaklı yamalı cepli A-line elbise; arkada CB fermuar — EVET**
1. Çizgi hiyerarşisi doğru: dış kontur kalın, kup/bel/cep çizgileri ince; V yaka içindeki kesik çizgi pervaz üst dikişi olarak okunuyor (R1/R7 dili).
2. Kup dikişi omuzdan başlayıp bel dikişinden geçip etek ucuna sürüyor ve cebin arkasında kesilip altında devam ediyor (x≈180, y≈485–580) — doğru örtme; R3 Holyoke ile aynı mantık.
3. Kusur (küçük): alt kol kavşağında kontur küçük bir basamak yapıyor (ön sol ≈(125,205), arka sol ≈(545,205)); satıcı flat'lerinde bu kavşak pürüzsüz. Hükmü düşürmüyor.

**2 — İnce askılı, oval yakalı, prenses kuplu, bel dikişli, fistolu (scallop) etek uçlu midi elbise; arka düz yaka, CB fermuar — EVET**
1. Askılar bedenden çıkıp omuza doğru içe eğik, ön/arka tutarlı; askı iki ince paralel çizgi (R3 askı dili).
2. Fisto etek ucu ön ve arkada aynı adımda, üstünde kesik pervaz çizgisi (y≈898) — R1 etek ucu diliyle uyumlu; kup dikişleri etek ucuna kadar sürüyor.
3. Kusur (küçük): alt kol kavşağında aynı basamak (≈(135,185) ve ≈(555,185)). Silüet A-line, bel oturmuş; satıcı flat'i yanında okunur.

**3 — Bebe yakalı, balon kollu (dantel kenarlı), robalı, roba altı iki pensli/plili, düz şift elbise; tek düğmeli anahtar deliği pat — HAYIR**
1. Kusur (yapısal): boyun noktaları yakanın dışına "boynuz" gibi çıkıyor — ön ≈(185,80) ve ≈(285,80), arka ≈(600,80) ve ≈(720,80). R7/R8'de yaka gövde konturunu örter, boyun noktası görünmez. Burada yaka konturun üstüne oturmuyor, yanına konmuş.
2. Kusur: roba altındaki iki dikey çizgi (≈(175,208–245) ve ≈(300,208–245)) ne pens (iki bacak yok) ne pli (kırık yok) — hangi öğe olduğu okunmuyor; roba altına büzgü/pli kararı verilmemiş.
3. Olumlu: balon kol gerçekten balon, kol ağzı bandı + dantel fisto ön/arka aynı; roba dikişi ön/arka aynı yükseklikte; kalın/ince hiyerarşi doğru.

**4 — Kayık yaka, kap kollu, tam boy ön düğmeli patlı, prenses kuplu kalem (sheath) elbise; arkada kup — EVET**
1. Düğme = daire + iki nokta, pat iki paralel çizgi, düğmeler eşit aralıklı ve patın ortasında — R3/R7 diliyle birebir.
2. Silüet oturan giysi olarak oturmuş: bel daralması, kalça genişlemesi, etek ucu düz-yakın; kup dikişleri omuzdan etek ucuna kesintisiz, ön/arka tutarlı.
3. Kusur (küçük): kap kolun omuz ucu sivri köşe (≈(75,70) ve ≈(405,70)); R1/R7'de kol başı omzu yuvarlayarak döner. Hükmü düşürmüyor.

**5 — Kayık yaka, kolsuz, göğüs altı kavisli dikişe büzgülü panelli, bel dikişli, etekte iki pensli mini elbise; arkada aynı kavisli dikiş + pens + CB fermuar — EVET**
1. Büzgü dili doğru: kısa ince çizgiler kavisli dikişten (y≈300) yukarı fanlanıyor, R3 Holyoke bel büzgüsüyle aynı gramer.
2. Etek pensleri iki bacaklı sivri üçgen (≈(185,425)→(180,605)); arka pensler aynı uzunluk ve konumda; kavisli göğüs altı dikişi arkada da var, ön/arka aynı giysi.
3. Kusur (küçük): alt kol kavşağı basamağı (≈(120,305) / ≈(545,305)). Silüet oturan+A-line etek, satıcı flat'i düzeyinde.

**6 — Geniş askılı, oval yakası büzgülü ve ortası bağcıklı (fiyonk), göğüs altı dikişinden büzgülü trapez elbise; arka düz yaka, arka etek büzgülü — EVET**
1. Büzgü iki kademeli ve doğru: yaka boyunca kısa çizgiler + göğüs altı dikişinden (y≈255) çıkan kısa çizgiler + eteğe inen uzun düzensiz çizgiler — R3'ün lastik bel/etek dili.
2. Bağcık/fiyonk (≈(240,165)) yaka kenarına bağlı ve uçları gövdeye düşüyor; askılar ön/arka aynı genişlik ve eğim.
3. Kusur (küçük): alt kol kavşağı basamağı (≈(130,200) / ≈(555,200)). Bol giysi bol çizilmiş, etek ucu kavisli.

**7 — Tek omuzlu (asimetrik yakalı), yan dikişi büzgülü/drapeli, kolsuz kalem elbise; arkada aynı çapraz yaka + CB dikiş — HAYIR**
1. Kusur (tutarsızlık): önde sağ yan dikişte büzgü çentikleri ve drape yayları var (≈(365,280–430) ve yaylar ≈(300–360, 280–570)), arkada aynı fiziksel yan dikişte (arka sol, ≈(515–540,180–430)) hiç büzgü yok. Yan dikiş büzgüsü iki görünümde de görünmek zorunda; asimetri değil, tutarsızlık.
2. Kusur (yapısal): omuz bandı düzlüğü önde x≈130→240, arkada x≈660→755 — yani omuz bandı boyun kenarından değil, tam orta ön/orta arka çizgisinden başlıyor. Boyun genişliği sıfır; bant boynun yarısını örtüyor. R2 Upton'da omuz düzlüğü boyun noktasında biter.
3. Kusur: sol omuz ucu (≈(65,130)) ve arka sağ omuz ucu (≈(835,130)) keskin köşe; kol oyuğu başlangıcı yuvarlanmamış. Çapraz pervaz çizgisi (ince, üst kenara paralel) ise doğru.

**8 — Kayık yaka, kolsuz, tam boy ön düğmeli patlı, önde ve arkada çift uçlu (balık) pensli, kalça boyu oturan bluz — EVET**
1. Balık pensler iki uçlu ince baklava olarak çizilmiş (≈(170,300–525) / ≈(315,300–525)), arkada aynı konumda — R2/R5 pens dili.
2. Düğme + pat gramerı doğru (daire + iki nokta, iki paralel çizgi, eşit aralık); yaka ön/arka tutarlı kayık.
3. Kusur (küçük): alt kol kavşağı basamağı (≈(120,235) / ≈(525,235)). Bel oturmuş, etek ucu hafif açılıyor; satıcı flat'i düzeyinde.

**9 — Kalp (sweetheart) yakalı, bağcıklı askısı omuzda fiyonklu, kup dikişli büstiyer bodice, bel dikişli, pensli mini etek; arka düz yaka, arka kup + pens, CB fermuar, kesik etek ucu — EVET**
1. Kalp yaka kalın kontur + içinde kesik pervaz çizgisi; kup dikişleri yaka kenarından bele iniyor; arkada üst kenar kesik çizgi + kup + pens, ön/arka aynı giysi.
2. Askı fiyonkları omuz ucunda (≈(115,60) ve ≈(360,60); arka ≈(535,60) ve ≈(785,60)), askı iki ince paralel çizgi, ön/arka aynı yerde — R2'nin fiyonk parçası dili.
3. Kusur (küçük): alt kol kavşağı basamağı (≈(125,235) / ≈(545,235)). Etek pensleri ve etek ucu kesik çizgisi doğru.

**10 — Kare yakalı, geniş askılı, yaka kenarı zikzak (rickrack) şeritli, göğüs altında iki kamburlu kavisli dikişe büzgülü, A-line jumper; arka düz yaka + düz dikiş, CB fermuar — EVET**
1. Zikzak şerit ön yaka ve arka üst kenarda, kontura bağlı (y≈150 / y≈172); büzgü çizgileri kavisli dikişten yukarı fanlanıyor — R3 dili.
2. Ön göğüs altı dikişi şekilli (iki kambur), arka düz — göğüs şekillendirmesi olarak tutarlı; askılar dışa eğik, ön/arka aynı (R4 pinafore dili).
3. Kusur (küçük): alt kol kavşağı basamağı (≈(125,205) / ≈(550,200)). Bol A-line bol çizilmiş, etek ucu hafif kavisli.

**11 — Fisto kenarlı bebe yakalı, balon kollu (dantel kenarlı), robalı, roba altı büzgülü, şömizye (kavisli) etek uçlu bluz; arka roba + büzgü — HAYIR**
1. Kusur (yapısal, #3 ile aynı): boyun noktaları yakanın dışına çıkıyor — ön ≈(185,78) ve ≈(290,78), arka ≈(600,78) ve ≈(720,78). Fisto kenarlı yaka bu noktaların altında/yanında başlıyor; R7/R8'de yaka bu kavşağı örter.
2. Kusur: ön yakanın iki lobu ortada anahtar deliği çizgisiyle (≈(240,110–130)) buluşuyor ama gövdede pat/düğme/kapanma yok; yakanın neye bağlı olduğu okunmuyor (arka CB çizgisi yalnız yakada, gövdede yok).
3. Olumlu: roba altı büzgü + etek ucuna inen uzun çizgiler R3 gramerinde; balon kol ve dantel ön/arka aynı; şömizye kavisli etek ucu doğru.

## 3. Özet

**8 EVET / 11** — EVET: 1, 2, 4, 5, 6, 8, 9, 10. HAYIR: 3, 7, 11.

**HAYIR'ların ortak kök nedeni:** giysi öğesi gövde konturuna topolojik olarak bağlanmıyor; kontur bağımsız çiziliyor, öğe üstüne konuyor.
- 3 ve 11: yaka konturun üstüne oturmuyor → boyun noktaları "boynuz" olarak dışarıda kalıyor (satıcı flat'inde yaka omuz-boyun kavşağını örter). Ek olarak yakanın bağlandığı kapanma (pat/düğme) gövdede yok.
- 7: asimetrik öğeler tek görünüme/tek tarafa hapsolmuş — yan dikiş büzgüsü yalnız önde, omuz bandı boyun kenarından değil CF/CB'den başlıyor. Asimetri değil, ön–arka tutarsızlığı.

**8 EVET'te de tekrar eden, hükmü düşürmeyen kusur:** alt kol (kol oyuğu → yan dikiş) kavşağında küçük basamak; 1, 2, 5, 6, 8, 9, 10'un hepsinde aynı piksel bölgesinde (sol ≈x 120–135, sağ simetriği; arka aynı). Tek yerden düzelir. 4'te kap kol omuz ucu sivri köşe.
