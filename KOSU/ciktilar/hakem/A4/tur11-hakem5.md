# Tur 11 — Hakem 5 (kör hakem, yalnız png, tur 11) — 2026-09-09

Kural: yalnız 11 `flat.png` okundu. Repo/kod/svg/md/hedef foto/önceki raporlar açılmadı. Karşılaştırma seti bu oturumda web'den çekilen 7 satıcı flat'i (aşağıda). Piksel ölçümleri 900px genişlikteki png'lerden göz kararı ±5px.

## 1. Web kaynakları (satıcı flat'leri, bugün çekildi)

| # | Satıcı / ürün | URL | Gözlem |
|---|---|---|---|
| S1 | Pattern Emporium — Go-To Fit & Flare Dress | https://patternemporium.com/cdn/shop/products/Go-ToFit_FlareDressLINEDRAWINGSewingPatternEmporium_1024x1024.jpg (sayfa: https://patternemporium.com/products/go-to-fit-flare-dress-sewing-pattern) | Ön+arka yan yana. Yan dikiş göğüste kavisli, belde **köşe** (bel dikişi var), etek çan; bel/göğüs ≈0.75. Etek ucu dalgalı, kesikli topstitch. Dış hat kalın, iç dikiş ince. Kol gövdeden ~30° açık. Kapama çizilmemiş. Yaka bant çift çizgi. |
| S2 | Gracie Steel — Blooming Bustier Dress | https://graciesteel.com/cdn/shop/files/techsketch_1024x1024@2x.png (sayfa: https://graciesteel.com/products/gs-blooming-bustier-dress-pdf-sewing-pattern) | Straplez; pens yok, prenses dikişi etek ucuna kadar. Tek kalınlık ince çizgi (hiyerarşi yok). Üst kenar hafif iç bükey kavis. Bel/göğüs ≈0.7, etek ucu ≈ bel×2.2, uç dalgalı. Arka: CB fermuar tek ince çizgi + üstte küçük çekecek. |
| S3 | Tilly and the Buttons — Mabel Dress + Blouse | https://tillyandthebuttons.com/cdn/shop/products/Tilly_and_Buttons_Mabel_Dress_Blouse_sewing_pattern_tech_1800x1800.jpg | Büzgülü puf kol: kol **balon** biçimli, büzgü kısa çizgilerle, kol gövdeden ~35° açık, manşet büzgülü. Gövde/etek kırışık çizgileri var. Etek ucu dalgalı, kesikli topstitch. Ön/arka yan yana, arka yaka kare. |
| S4 | Sew Over It — Lea Dress | https://sewoverit.com/cdn/shop/files/LeaDresslinedrawing_1200px.png | V yaka, düğmeler **daire içinde nokta**, düğme hattı CF'de çift çizgi (pat). Prenses dikişi, kol ~40° açık, manşet. Dış hat kalın / iç ince. Etek ucu kavisli kesikli. Arka pens/prenses + bel dikişi. |
| S5 | Seamwork — Kit Puff Sleeve Blouse | https://www.seamwork.com/media/products/3207/3207-5fcdca86.png ve …/3207-e7a994a5.png | Renk dolgulu flat (iki beden eğrisi). Puf kol balon, büzgü çizgileri; arka roba çizgisi; yan dikiş yumuşak S kavis; kol ~30° açık. Etek ucu kesikli topstitch. |
| S6 | Friday Pattern Company — Davenport Dress | https://fridaypatterncompany.com/cdn/shop/files/davenport_flat.png | Reglan büzgü, kol altında hafif gri gölge, ip bağ, katlı volan etek dalgalı uç. Tek kalınlık ince çizgi. Ön/arka yan yana. |
| S7 | Helen's Closet — Reynolds Top and Dress | https://helensclosetpatterns.com/cdn/shop/files/reynolds-top-and-dress-line-drawings.jpg | Croquis (gri figür) üstünde. Askı **sabit genişlik**, omuzda biter. Pens yok, cep noktalı, etek ucu kesikli, kırışık çizgileri. Yan dikiş düz A. |

Kaynaklarda ortak konvansiyon: ön+arka yan yana; etek ucu kesikli topstitch; puf kol balon + büzgü çizgisi; fermuar CB'de enseden kalçaya ince çizgi + çekecek; düğme = daire, yanında pat çift çizgisi; bel dikişi varsa belde köşe kabul, bel dikişi yoksa yan dikiş **yumuşak S**; askı sabit genişlik.

Erişilemeyen: Mood Biella (403), Etsy listing (403), Udosew (boş sayfa), Tiana's Closet (yalnız foto), LilypaDesigns (flat yok).

## 2. 11 hüküm

**1 — V yaka kolsuz fit&flare, yamalı cep — EVET**
- Çizgi hiyerarşisi satıcı ayarında: dış hat ~2px, pens/dikiş ~1px, cep ve yaka kesikli topstitch (S1/S4 ile aynı dil).
- Kum saati: göğüs ≈260px, bel ≈195px (0.75), etek ucu ≈380px; S1 oranlarına denk.
- Kusur: omuz ucunda dışa kıvrık küçük "boynuz" (x≈50,y≈70 ve x≈385,y≈70) — satıcılarda omuz ucu temiz köşe.

**2 — İnce askılı uzun A dress — EVET**
- Ön/arka, bel dikişi, 4 pens, CB fermuar+çekecek, etek ucu kesikli: S2/S7 diline uyuyor.
- Kum saati: göğüs ≈245px, bel ≈205px, uç ≈390px; uzun A silüeti S1'in "long" görünümüyle örtüşüyor.
- Kusur: askılar yukarı doğru **daralıyor** (altta ~10px, üstte ~6px) ve üstte çapraz kesilip havada bitiyor; S7'de askı sabit genişlik.

**3 — Peter Pan yaka, puf kol, robalı elbise — HAYIR**
- Puf kol kutu gibi: dış kenar dikey düz, üstte köşe (x≈20–75, y≈75–200); S3/S5'te kol balon (dışbükey yay).
- Bel dikişi yok ama yan dikiş belde **köşe** yapıyor (y≈400); satıcılarda bel dikişsiz gövde yumuşak S.
- Arka yaka enseye oturan yarım elips "çanak" gibi çizilmiş (x≈615–745, y≈15–45); satıcı arkasında yaka bant olarak gövde çizgisinin üstüne biner.

**4 — Kayık yaka, kısa kol, düğmeli sheath — HAYIR**
- Arka fermuar **kalçadan etek ucuna** (y≈385→720) çizilmiş, üstte çekecek; satıcılarda CB fermuar enseden kalçaya (S2). Bu haliyle yırtmaç gibi okunuyor ama fermuar sembolü.
- Ön düğmeler (7 daire) tek CF çizgisi üstünde, pat çift çizgisi yok; S4'te düğme hattı çift çizgili pat.
- Aynı elbisede hem ön düğme hem arka fermuar: satıcı flat'lerinde tek kapama.

**5 — Kayık yaka kolsuz, midriff panel, A etek — EVET**
- İki yatay dikiş (empire+bel) + panelde yukarı bakan pensler, ince çizgi; S1 hiyerarşisiyle aynı.
- Kum saati: omuz ≈330px, bel ≈230px, uç ≈400px; S1 ile denk.
- Kusur: omuz ucunda yine dışa "boynuz" (x≈100,y≈45 / x≈330,y≈45); yaka çok geniş, kol oyuğu derin ama satıcı çizgisinden düşmüyor.

**6 — Geniş askılı kare yaka pinafore — EVET**
- Üst bant paneli + kesikli topstitch + 4 pens + CB fermuar: S2/S7 kadar temiz.
- Belde köşe var ama bel dikişi çizili; S1'de de aynı köşe kabulü.
- Kusur: askılar yukarı daralıyor (alt ~42px, üst ~30px) ve üstte açık bitiyor; S7'de sabit.

**7 — Straplez sheath bustier — HAYIR**
- Üst kenarda gövdeden taşan trapez "kulaklar" (x≈80–360 bant, gövde x≈90–355): satıcı straplezinde üst kenar tek kavis (S2).
- Bel dikişi yok ama yan dikiş belde sivri köşe (x≈100,y≈470 ve x≈340,y≈470); kalça sonra dışa bombe, uç dar — silüet "elmas" okunuyor.
- Straplez için tek başına iki pens; S2'de prenses/balen hattı. Çizgi dili aynı ama biçim satıcı yanına oturmuyor.

**8 — Kolsuz kayık yaka düğmeli bluz — HAYIR**
- Arka fermuar **y≈465'ten etek ucuna** (bel altından basene): bir bluzda satıcı fermuarı yukarıdadır; burada anlamsız.
- Ön 8 düğme tek çizgide, pat yok; ayrıca arka fermuarla çift kapama.
- Omuz ucu boynuzu (x≈70,y≈80 / x≈400,y≈80). Kum saati (göğüs ≈300, bel ≈245) ve etek ucu kesikli çizgisi doğru.

**9 — Kalp yaka bustier, ince askı, A etek — EVET**
- Kalp yaka temiz çift kavis + kesikli facing; arka düz üst kenar + kesikli; S2 diliyle uyumlu.
- Kum saati: göğüs ≈275px, bel ≈230px, uç ≈380px; yan dikiş yumuşak S, belde bel dikişi var.
- Kusur: askı hafif daralıyor (alt ~9px, üst ~6px); göz ardı edilebilir.

**10 — Geniş askılı pinafore, daha kısa/çan etek — EVET**
- 6 ile aynı dil; bel dikişi + köşe, pens, CB fermuar, etek ucu kesikli.
- Etek ucu ≈400px, bel ≈220px (1.8×); S1'in "above knee" görünümüne yakın.
- Kusur: askı daralması ve açık üst; etek yan dikişi bele köşeyle giriyor (S1'de de var, kabul).

**11 — Peter Pan yaka, puf kol, robalı bluz — HAYIR**
- 3 ile aynı puf kol: kutu biçim, dikey dış kenar (x≈20–75, y≈75–200); S3/S5 balon.
- Arka yaka yarım elips "çanak" (x≈615–745, y≈15–45).
- Bel dikişi yok, yan dikiş belde köşe (y≈400 sol, y≈405 sağ); bluz uzunluğunda satıcı gövdesi yumuşak S'dir.

## 3. Toplam hüküm

**EVET — 6/11 (1, 2, 5, 6, 9, 10) satıcı flat'i ayarında; 5/11 (3, 4, 7, 8, 11) değil.** Çoğunluk geçiyor ama fark 1 çizim; 4 ve 8 tek bir hatadan (fermuar yeri) düşüyor.

**En ağır üç kusur**
1. **Arka fermuar kalçadan etek ucuna** (4, 8): fermuar sembolü doğru, yeri yanlış; satıcıda enseden kalçaya. Ayrıca aynı parçada ön düğme + arka fermuar çift kapama, düğmede pat çift çizgisi yok.
2. **Puf kol + arka yaka** (3, 11): kol kutu, balon değil; arka yaka enseye oturan çanak elips. Satıcı puf kolunun en tanınır yanı balonu.
3. **Bel dikişsiz gövdede belde köşe** (3, 7, 11) ve **omuz ucu boynuzu** (1, 5, 8); 7'de üst kenardan taşan bant kulakları.

**En güçlü üç yan**
1. Çizgi hiyerarşisi (kalın dış hat / ince pens-dikiş / kesikli topstitch-facing) S1 ve S4 ile birebir aynı dil; 11'de tutarlı.
2. Ön+arka yan yana yerleşim, CB fermuar+çekecek sembolü, pens çizimi (iki ince bacak, sivri uç) ve etek ucu kavisi satıcı konvansiyonu.
3. Kum saati oranları (bel/göğüs 0.72–0.83, uç/bel 1.5–1.9) ve 9'un kalp yakası, 6/10'un bant paneli satıcı çizimlerinin yanına konunca sırıtmıyor.
