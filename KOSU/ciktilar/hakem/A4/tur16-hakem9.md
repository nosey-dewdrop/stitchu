# Tur 16 — Hakem 9 (kör hakem, yalnız png) — 2026-09-10

Açılan repo dosyaları: yalnız `KOSU/ciktilar/giris-3/{1..11}/flat.png`. Başka hiçbir repo dosyası açılmadı.
Karşılaştırma ölçütü: aşağıdaki 8 satıcı flat'i, bu turda web'den indirilip Read ile açıldı.

## 1. Web kaynakları (bu turda çekildi ve görüldü)

| # | Satıcı / kalıp | URL | Gözlem |
|---|---|---|---|
| R1 | Sew Over It — Hettie Dress | https://sewoverit.com/cdn/shop/files/Hettie_Dress_Line_Drawing_1200px.jpg | Dış kontur belirgin kalın, iç dikişler ince. Etek ucu ve kol ağzı **kesikli çizgi** (topstitch). V yakadan görünen arka yaka **gri dolgu**. Büzgü = dikişten çıkan kısa ince çizgiler. Balon kol hacimli, kırışıklık çizgileri var. Ön+arka ayrı boyda, kaydırılmış. |
| R2 | Cashmerette — Rivermont Dress & Top | https://www.cashmerette.com/cdn/shop/files/Rivermont-Tech-4x5.jpg | Ön+arka yan yana, aynı silüet, aynı genişlik. Çizgi ağırlığı hemen hemen tek ton (hiyerarşi zayıf ama tutarlı). Pens = ince tek çizgi. Etek ucu ve kol ucu kesikli. Yan dikiş kalça üzerinde kavisli. Arka kaburga/orta dikiş ince. |
| R3 | Cashmerette — Wayland Dress | https://www.cashmerette.com/cdn/shop/files/Cashmerette-1120-Wayland-tech-ill-front-4x5.jpg | Kalp yaka, prenses dikişleri ince, düz askı dikdörtgen kapalı şekil. Cep ağzı yan dikişte kavisli ince çizgi. Etek ucu kesikli, hafif dışbükey. Pile/kırışıklık ince taralı. Gri gölge arka plan. |
| R4 | Friday Pattern Co — Adrienne Blouse | https://fridaypatterncompany.com/cdn/shop/files/adrienne_flat.png | Balon kol tam hacimli: kol omuzdan dışa taşar, alt uçta lastikli manşet, kol boyunca kırışıklık çizgileri. Yaka kenarı çift ince çizgi (biye). Gövde oturmuş, ön+arka aynı. |
| R5 | Papercut — Array Top/Dress | https://cdn.shopify.com/s/files/1/0170/3286/files/ArrayLD_large.jpg | Küçük, çok-varyant satır. Tek ton çizgi, kuşak/fiyonk basit ama kenara bağlı. Etek ucu kesikli. |
| R6 | Helen's Closet — Cameron Button-Up | https://helensclosetpatterns.com/cdn/shop/files/cameron-details-line-drawing.jpg | Gömlek: pat çift çizgi + kesikli topstitch, düğmeler dolu gri daire pat ortasında. Cep dolu kontur + içte kesikli. Etek ucu iç yüzü gri. Roba dikişi ince + kesikli. VIEW A/B etiketleri. |
| R7 | Closet Core — Elodie Wrap Dress | https://closetcorepatterns.com/cdn/shop/products/Wrap-dress_TechnicalFlat_CS6-03_900x.jpg | Dış kontur kalın, iç ince — en net hiyerarşi. Yama cep dolu kontur + içte kesikli. Büzgü = dikiş altından çıkan ince kısa çizgiler. Fiyonk kuşağa bağlı. Etek ucu kavisli + kesikli. Yaka içi gri. |
| R8 | Tilly and the Buttons — Seren Dress | https://tillyandthebuttons.com/cdn/shop/products/Seren_TECH_DRAWING_910fcb46-0735-4bd3-a62f-0aca99fc8d73_740x.jpg | Orta ağırlık tek ton çizgi. Düğme = boş daire pat üstünde. Askı dikdörtgen kapalı, gövdeden yukarı çıkar. Etek ucu belirgin kavisli. Fiyonk ön ortada dikişe bağlı. Arka görünüş ayrı etiketli. |

Ortak satıcı dili (8 kaynaktan çıkan): (a) dış kontur ≥ iç dikiş; (b) etek ucu kavisli ve çoğunlukla kesikli topstitch; (c) ön+arka aynı silüet, aynı genişlik; (d) her öğe bir dikişe/kenara bağlı — havada biten çizgi yalnız kırışıklık/drape için; (e) cep = dolu kontur (+ içte kesikli); (f) büzgü = dikişin büzülen tarafında kısa ince çizgiler; (g) düğme = pat üzerinde daire; (h) balon kol = omuzdan dışa taşan hacim + kırışıklık.

## 2. Hükümler

**1 — V yakalı, kolsuz, prenses dikişli, bel dikişli A-line elbise, önde iki cep — HAYIR**
- (+) Çizgi hiyerarşisi (kalın dış / ince iç) ve V yakadan görünen arka yaka çizgisi (~px 150–330, y 60–110) R1/R7 mantığıyla uyumlu; ön+arka aynı silüet.
- (−) Cepler (~px 115–200 ve 280–365, y 485–585) üç ayrı çizgi dilini karıştırıyor: üstte kesikli, altında dolu kavisli kapak, gövdesi **noktalı**. Noktalı = gizli (torba) demek; yama cep dolu kontur olur (R6, R7). Bu haliyle "kapaklı cep mi, yama cep mi, torba mı" okunmuyor.
- (−) Cep gövdesi prenses dikişinin (~px 165 ve 300) üstünden geçiyor ama dikiş cebi kesmeye devam ediyor: satıcı flat'inde cep dikişin önünde durur, dikiş cebin altında gizlenir.

**2 — İnce askılı, prenses dikişli, bel dikişli, panelli A-line etek, fisto/dalgalı etek ucu — EVET**
- (+) Askılar kalın, kapalı, gövde kenarına bağlı; ön oval / arka düz yaka farkı doğru (R3, R8 dilinde).
- (+) Prenses dikişleri yakadan bele, bel dikişinden etek ucuna kesintisiz ve aynı x'te devam ediyor; ön+arka aynı genişlik.
- (+) Dalgalı etek ucu (~y 905–915) ince çizgi, kontur altında; silüet slip elbise için doğru.

**3 — Puf/kap kollu, robalı, göğüs altı penslı shift elbise, önde düğmeli küçük pat — HAYIR**
- (−) Ön yaka (~px 150–330, y 80–140) hiçbir satıcı öğesine karşılık gelmiyor: iki çapraz "kanat" + ortada dikey kesikli pat + üstüne taşan kanca/ilmek (~px 237, y 103–120). Yakanın tepe noktasından yukarı çıkan çizgi giysi kenarına bağlı değil.
- (−) Kollar (~px 65–130 ve 340–410, y 100–235) düz yarım daire; R4'teki gibi omuzdan dışa hacim ve kırışıklık yok, alt ucu fisto ile yarım daireye kapanıyor — "puf" değil "yarım disk" okunuyor. Kol alt ucu (~px 110–135, y 225–240) kol evi çizgisinin içine geçiyor.
- (+) Roba dikişi (~y 205), arka roba ve arka orta yırtmaç (~px 660, y 85–110) ince ve dikişe bağlı; etek ucu kavisli.

**4 — Kayık yakalı, düğmeli-patlı, prenses dikişli, kalça üstü oturan sheath elbise, minik kanat kol — HAYIR**
- (−) Kollar (~px 60–100 ve 385–420, y 80–175) aşağı bakan üçgen "yüzgeç"; kol evi yok, omuz ucundan sarkan flap gibi. R1–R8'in hiçbirinde kol bu şekilde değil.
- (−) Pat (~px 265–290) gövde merkezinin (~240) sağında; sağ prenses dikişi (~px 300–335) göğüste pata doğru kırılıp (~y 330–360) tekrar ayrılıyor. Asimetrik kapama ise sol/sağ dikişlerin de asimetrik olması gerekirdi; ikisi simetrik. Tutarsız.
- (+) Dış kontur / iç dikiş hiyerarşisi ve bel-kalça kavisi (~y 380–520) doğru; ön+arka aynı silüet.

**5 — Kolsuz kayık yakalı, göğüs altı kavisli büzgülü dikiş, bel dikişli, penslı etekli mini — EVET**
- (+) Büzgü (~px 115–370, y 260–300) dikişin büzülen tarafında kısa ince çizgi — R1/R7 dili.
- (+) Bel dikişinden inen etek pensleri (~px 180–300, y 430–600) ince tek çizgi; arka düz roba dikişi ile ön kavisli dikişin y'si tutarlı (~y 300).
- (+) Yan dikiş bel/kalça kavisli, etek ucu hafif kavisli; ön+arka aynı genişlik.

**6 — Geniş askılı, büzgülü yakalı, ön ortada bağcık-fiyonk, göğüs altı büzgülü babydoll/trapez elbise — EVET**
- (+) Empire dikiş altındaki büzgü çizgileri ve etek boyunca inen düzensiz uzunlukta kırışıklık çizgileri (~y 260–660) R1/R7 dili; silüet bol giysi için bol.
- (+) Fiyonk (~px 240, y 165–175) yaka kenarına bağlı, uçları aşağı sarkıyor; ön+arka empire dikişi aynı y'de (~255).
- (−, küçük) Askı kenarlarındaki taramalar (~px 110–160 ve 330–370, y 60–150) askının büzgülü/lastikli olduğunu ima ediyor; kasıtlıysa okunur, değilse gürültü. Hükmü düşürmüyor.

**7 — Tek omuzlu, yan tarafta drapeli/büzgülü, oturan mini elbise — HAYIR**
- (−) Yüksek omuz tarafında kol evi yok: sol kenar (~px 65–115, y 65–180) omuz askısından yan dikişe kesintisiz dış kontur olarak iniyor; kolun geçeceği açıklık çizilmemiş. Arka görünüşte de aynı (~px 780–830).
- (−) Düşük taraf (~px 380, y 160–170): yaka eğimi keskin köşeyle yan dikişe dönüyor; koltuk altı kavisi yok.
- (−) Drape kavisleri (~px 295–370, y 250–550) yan dikişten çıkıp havada bitiyor; yan dikiş üzerindeki taramalar (~px 355–370) büzgüden çok çentik gibi okunuyor. R3'teki gibi kırışıklık dili tek başına yeterli değil, önce armhole olmalı.

**8 — Kayık yakalı, kolsuz, tam boy düğmeli, beli penslı, kalça üstünde açılan üst (bodice/top) — HAYIR**
- (−) Pensler (~px 170–180 ve 310–320, y 300–470) alt uçta çatal açıp etek ucuna iniyor (~px 120–175, y 470–570): ne kapalı pens, ne godet, ne yırtmaç. Y-şekilli bir öğe; satıcı dilinde karşılığı yok.
- (−) Alt köşeler (~px 90–115 ve 370–395, y 500–570) dışa savrulup peplum gibi açılıyor ama peplum dikişi yok; silüet ile öğe uyuşmuyor.
- (+) Pat çift çizgi + daire düğmeler (~px 240, y 95–545) R6/R8 dilinde; dış kontur / iç çizgi hiyerarşisi doğru.

**9 — Kalp yakalı, bağcıklı askılı, kup dikişli, bel dikişli, penslı A-line mini elbise — EVET**
- (+) Kalp yaka altındaki ince kesikli çizgi (~y 185–215) ve etek ucu kesikli (~y 780) R1/R2/R3 topstitch dili.
- (+) Kup dikişleri yaka noktasından bele kavisli iniyor (~px 140–215 ve 270–335), bel dikişinden etek pensleri; arka düz üst kenar + kesikli çizgi tutarlı.
- (+) Askı uçlarındaki fiyonklar (~px 110 ve 365, y 50–60) askıya bağlı; ön+arka askı konumu aynı x'te.

**10 — Geniş askılı, kare yakalı fisto kenarlı, göğüs altı kavisli büzgülü dikişli, arkada fermuarlı A-line pinafore/sundress — EVET**
- (+) Arka fermuar (~px 660, y 175–555) çift kesikli çizgi + üstte kapalı tutamak; roba dikişi (~y 260) ince; fermuar üst kenara bağlı.
- (+) Ön göğüs altı dikişi (~y 230–265) üzerinde büzgü çizgileri dikişin doğru (üst) tarafında; ön/arka üst kenar fisto aynı dil.
- (−, küçük) Ön dikiş (~y 245) ile arka roba (~y 260) 15 px kaymış; fermuar alt ucunda durdurucu işaret yok. Hükmü düşürmüyor.

**11 — Puf/kap kollu, fisto kenarlı V yakalı, robalı, roba altı büzgülü bluz — EVET**
- (+) Roba altı büzgü (~y 205–225) + etek boyunca kırışıklık çizgileri (~y 225–410) R1/R7; silüet bol; etek ucu kavisli; arka roba fisto + arka orta yırtmaç (~px 665, y 85–105) dikişe bağlı.
- (+) Ön+arka aynı genişlik, kollar aynı hizada; çizgi hiyerarşisi tutarlı.
- (−, küçük) V yaka tepesinden yukarı çıkan ilmek (~px 237, y 100–118) düğmesiz; kol alt ucu (~px 110–135, y 225–240) kol evi çizgisini geçiyor. 3 numaradaki sorunların hafif hali; burada yaka şekli okunduğu için hükmü düşürmüyor.

## 3. Özet

**EVET: 6 / 11** (2, 5, 6, 9, 10, 11). **HAYIR: 5** (1, 3, 4, 7, 8).

**HAYIR'ların ortak kök nedeni:** gövde, silüet, hiyerarşi ve etek ucu 11'inde de satıcı seviyesinde; düşenler **giysi öğesinin çizim sözlüğünde** düşüyor. Öğe (cep, yaka/pat, kanat kol, tek-omuz kol evi, pens) bir geometrik ilkel olarak çiziliyor, giysi mantığına (hangi kenara bağlı, açık mı kapalı mı, görünür mü gizli mi) bağlanmıyor:
- 1: cep üç çizgi stilini karıştırıyor (kesikli/dolu/noktalı) → ne olduğu okunmuyor.
- 3: yaka + pat + ilmek birleşimi hiçbir satıcı öğesine denk gelmiyor; kol hacimsiz.
- 4: kol "yüzgeç"; pat merkezden kaymış ama dikişler simetrik.
- 7: tek omuzda kol evi hiç yok.
- 8: pens alt uçta çatallanıp hemme iniyor — tanımsız öğe.

Tek cümle: silüet motoru hazır, öğe kütüphanesi (cep / yaka-pat / kol / kol evi / pens-godet ayrımı) satıcı sözlüğüne göre yeniden tanımlanmalı.
