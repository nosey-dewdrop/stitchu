# Tur 21 — Hakem 19 (kör hakem, yalnız png) — 2026-09-10

Kural: yalnız `KOSU/ciktilar/giris-3/{1..11}/flat.png` açıldı. Repo'daki başka hiçbir dosya, scratchpad'deki eski referans görselleri açılmadı. Karşılaştırma ölçütü bu turda web'den çekilip `scratchpad/tur21/` altına indirilen 8 satıcı görseli. Piksel konumları png'nin ~900 px genişlikteki görünümüne göre yaklaşıktır.

## 1. Web kaynakları (bu turda çekildi ve Read ile açıldı)

| # | Satıcı / kalıp | URL | Gözlem |
|---|---|---|---|
| R1 | Sew Over It — Betty Dress | https://sewoverit.com/cdn/shop/files/BettyDresslinedrawing_1200px.png | Dış kontur belirgin kalın, pens/dikiş ince. Bel dikişi, kup dikişleri belden ete devam. Etek ucu dalgalı + kesikli baskı dikişi. Arka: V yaka + CB fermuar çizgisi. Omuz-yaka kavşağı yumuşak. |
| R2 | Friday Pattern Co — Davenport | https://fridaypatterncompany.com/cdn/shop/files/davenport_flat.png | Büzgü = dikişten çıkan ince ışınsal çizgiler; fırfır ucu dalgalı; bağcık iki ince paralel çizgi + uç; kol içi gri gölge; ön/arka aynı ölçek yan yana. |
| R3 | Muna & Broad — Huon | https://www.munaandbroad.com/cdn/shop/files/HuonShirtandDresslinedrawing_1500x.png | Bol gömlek: bol çizilmiş, düz omuz düşük kol. Yaka bandı gri dolgu; büzgü ince akış çizgileri; etek ucu dalgalı + kesikli. Manşet/kol dikişe bağlı. |
| R4 | Sew Over It — Nicole | https://sewoverit.com/cdn/shop/files/NicoleDresstechvertical.png | Düğme = küçük daire, pat = kesikli çizgi CF boyunca; yaka + yaka bandı; kol altı yan dikişe bağlanıyor; etek dikişleri belden ete taşıyor. |
| R5 | Muna & Broad — Pyrmont | https://www.munaandbroad.com/cdn/shop/files/PyrmontSkirtlinedrawing_1500x.png | Lastik kemer kıvrımlı çizgi; büzgü ışınları; dalgalı uç + kesikli baskı. |
| R6 | Papercut — Sigma (LD) | https://cdn.shopify.com/s/files/1/0170/3286/files/SigmaLD_091e6403-f5b2-4de7-80cc-61a3524ba4c9_large.png | 480 px, çok küçük. Çizgi ağırlığı neredeyse tek; pens, bel dikişi, CB fermuar. Satıcı flat'inin alt sınırı: sade ama her öğe dikişe bağlı. |
| R7 | Itch to Stitch — Tustin | https://itch-to-stitch.com/wp-content/uploads/2023/04/Itch-to-Stitch-Tustin-Dress-PDF-Sewing-Pattern-Instructions-Line-Drawings.jpg | Tek ağırlık ince çizgi; büküm düğümünden ışınsal drape; kol altı yan dikişe bağlı; ön/arka yan yana, arka kuşak bandı. |
| R8 | Jalie 3460 Bella (zarf arkası) | https://jalie.com/cdn/shop/products/3460-bella-fit-and-flare-dress-jalie-8.png | Küçük çizimler: kup dikişi, kol, çan etek. Ayrı line-drawing dosyası yok; çizim zarf arkasında. |

Bulamadıklarım: Style Arc (Ariana sayfasında yalnız fotoğraf, ayrı çizim dosyası yok), Papercut Sigma ancak 480 px. Jalie'nin çizimi yalnız zarf arkasında.

Satıcı ortak dili (bu 8'den): (a) dış kontur kalın / iç ince (R1,R2,R3,R4; R6,R7 tek ağırlık ama tutarlı); (b) her öğe bir dikişe/kenara bağlı — kol altı yan dikişe, büzgü dikişten çıkıyor, düğme pat üstünde; (c) dolgun etek ucu dalgalı; (d) ön+arka aynı ölçek, aynı giysi; (e) omuz–yaka–kol oyuğu kavşağı tek kavisli çizgi, köşe/kanca yok.

## 2. Hükümler

**1 — V yakalı, kolsuz, kup dikişli, bel dikişli A-line elbise; önde kapaklı iki yama cep; arka kayık yaka — EVET**
- Çizgi hiyerarşisi R1/R4 seviyesinde: dış kontur kalın, kup/bel/cep çizgileri ince; V yaka altında kesikli pervaz çizgisi satıcı dilinde.
- Kup dikişleri omuzdan bele, belden ete kesintisiz; yan dikiş bel–kalça kavisli; etek ucu hafif kavisli. Ön/arka aynı silüet.
- Kusur (küçük): cep (x 128–205, y 485–580) kup dikişinin üstüne oturuyor; cep gövdesinin üst kenarı kapağın altında ikinci bir kavis çiziyor (y≈518) — kapak+cep iki kat kontur gibi okunuyor. Satıcı yanında sırıtmaz ama temiz değil.

**2 — İnce askılı, kup dikişli korse gövde, bel dikişi, A-line midi etek, fisto/dalgalı uç — EVET**
- Askılar gövde köşesinden çıkıyor (ön 155,150 / 320,150; arka aynı), uçları omuza gidiyor; ön/arka tutarlı.
- Kup dikişleri yakadan bele kavisli, belden ete panel dikişi olarak devam; dış kontur kalın, iç ince.
- Kusur: yan dikişte kalça hizasında (y≈450, x≈118 ve 355) açı kırılması — belden ete iki düz segment, satıcı A-line'ı (R1) tek akışlı çizer. Uç fisto çizgisi iç çizgi inceliğinde; dış kontur ağırlığı burada düşüyor.

**3 — Roba'lı shift elbise, bebe yaka, tek düğme, puf kollar dantel uçlu, robadan salınan pili — EVET**
- Puf kol balon: kol başı ve kol ucunda büzgü tikleri, ucunda fisto dantel; kol oyuğu çizgisi gövdeye bağlı.
- Roba dikişi ön/arka tutarlı; arka yaka arkası + CB kısa açıklık; düğme CF'de pat çizgisi üstünde.
- Kusur (küçük): yaka lobu uçları omuz çizgisinin üstüne sivri tepe yapıyor (185,80 ve 290,80); satıcıda (R4) yaka omuza kavisle oturur. Robadan inen iki tek çizgi (175 ve 300, y 210–270) pens mi pili mi belirsiz — pili olarak okunabilir.

**4 — Kayık yakalı, kup dikişli, CF düğmeli kalem elbise, kap kol — HAYIR**
- Kap kol gövdeye bağlı değil: omuz ucundan (95,65) dışa/aşağı sivri bir kanat çiziliyor (ucu ~65,150), kol ucu çizgisi kol oyuğu/yan dikişe kavuşmuyor; R4/R7'de kol altı yan dikişe biner. Arkada aynı (805,65 → 835,150).
- Kanadın iç kenarı ile kol oyuğu çizgisi arasında üçgen boşluk oluşuyor (x 60–125, y 65–160): "petal/omuz epoleti" gibi okunuyor, set-in kap kol gibi değil.
- Olumlu: gövde silüeti oturan (bel–kalça kavisi), kup dikişleri omuzdan ete kesintisiz, düğmeler pat üstünde eşit aralıklı, ön/arka tutarlı.

**5 — Geniş kayık yaka, kolsuz, göğüs altı kavisli dikişte büzgü, bel dikişi, etekte pens — EVET**
- Üç kat gövde (göğüs/korsaj/etek) dikişleri ince, ön/arka tutarlı; etek pensleri iki bacaklı ve bel dikişinden başlıyor (R1 dili).
- Silüet oturan: bel–kalça–uç kavisli, kalça dolgunluğu var.
- Kusur (küçük): omuz–yaka kavşağı ön ve arkada küçük sivri uç (130,68 / 350,68 / 548,68 / 770,68); büzgü tikleri dikişin iki yanına taşıyor (y 255–300, dikiş 290).

**6 — Geniş askılı sundress, yakada büzgü + fiyonk bağcık, göğüs altı dikişte büzgü, büzgülü A-line etek — EVET**
- Büzgü dili R2/R5 ile aynı: dikişten çıkan tikler + gövdeye inen akış çizgileri; fiyonk CF'de, kuyrukları dikişe iniyor.
- Askılar geniş, içi kırışık çizgili, ön/arka aynı genişlik; ön yaka kavisli, arka düz — pinafore mantığı tutarlı.
- Kusur (küçük): askı–gövde birleşiminde kol oyuğu neredeyse yok (135,150→125,205 kısa S); büzgülü etek ucu düz çizilmiş, satıcı (R1/R5) dalgalı çizer.

**7 — Tek omuzlu asimetrik, sağ yanda drape/büzgü, arkada CB dikişi — HAYIR**
- Ön yaka: kalın çizgi (70,68)→(240,140)'ta kırılıyor, altındaki ince paralel çizgi kırılmıyor; ikisi arasında omuzdan koltuk altına doğru açılan kama (0→~25 px) oluşuyor — pervaz mı bant mı, ne olduğu okunmuyor. Arkada aynı kama (525–830, 68–215).
- Yan drape: kavisler yan dikişten (x≈380) çıkıyor ama büzgü tikleri x≈355'te gövde içinde asılı (y 300–490), dikişe bağlı değil; R7'de drape tek düğüm noktasından ışınsal, burada dört bağımsız yay.
- Omuzlu tarafta kol oyuğu yok: omuz ucundan (70,68) yan dikişe (100,270) düz eğik iniyor, kavis yok. Asimetri ön/arka tutarlı (ön sol omuz ↔ arka sağ omuz) — bu kusur değil; kusur kavşak geometrisi.

**8 — Kayık yakalı kolsuz düğmeli üst/yelek, ön-arka fisheye (çift uçlu) pens — HAYIR**
- Kol oyuğu kavis değil: omuz ucundan (65,88) koltuk altına (110,230) düz/dışbükey eğik, sonra yan dikişe kırılarak geçiyor; R1/R6'da kol oyuğu içbükey tek kavis. Arkada aynı (830,88→790,230).
- Etek ucu köşeleri kanca yapıyor (95,555–105,565 ve 375,555–385,565): yan dikiş uca dik inmiyor, küçük çengel.
- Olumlu: fisheye pensler satıcı dilinde (ince baklava), CF pat + 9 düğme eşit; ön/arka silüet tutarlı.

**9 — Kalp yakalı korse gövde (kup + yan panel), omuzda bağcıklı fiyonk askı, bel dikişi, pensli mini etek, uçta baskı dikişi — EVET**
- Askılar gövde köşesinden çıkıp fiyonkla bitiyor, ön/arka aynı yön; arka üst kenarda kesikli lastik/pervaz çizgisi.
- Kalp yaka altında kesikli pervaz, etek ucunda kesikli baskı — R1 dili. Etek pensleri bel dikişinden.
- Kusur (küçük): ön kup çizgisi (150,180→205,265) ile panel çizgisinin birleştiği noktada "Y" görünümü; satıcıda kup tek akışlı çizilir.

**10 — Kare yakalı geniş askılı pinafore/sundress, yakada zikzak biye, önde kavisli göğüs altı dikişte büzgü, arkada CB fermuar — EVET**
- Zikzak biye ön ve arka yakada tutarlı; arkada CB fermuar (kesikli çift çizgi + çekecek, 660,180) yatay dikişi geçerek iniyor — satıcı dilinde.
- Askılar ön/arka aynı genişlik, A-line silüet temiz, dış kontur kalın.
- Kusur (küçük): askı–gövde birleşiminde kol oyuğu 25 px'lik dalga (130,180→125,205 ve simetriği); ön göğüs altı dikişi W kavisli, arka düz — kabul edilebilir ama büzgü tikleri dikişin iki yanına taşıyor.

**11 — Bebe yakalı (fisto kenar) robalı bluz, puf kollar dantel uçlu, roba altı büzgü, hafif kavisli uç — EVET**
- Puf kol balon; kol başı + kol ucu büzgü tikleri; dantel fisto kol ucundan sarkıyor; roba dikişinden inen akış çizgileri R2/R3 diliyle aynı.
- Bol gövde bol çizilmiş; arka yaka arkası + CB çizgisi; ön/arka roba aynı hizada.
- Kusur (küçük): yaka lobu uçları omuz çizgisinin üstünde sivri (180,78 / 295,78); CF'deki kısa çizgi (235,110–130) düğmesiz açıklık — R4'te olduğu gibi düğme/ilik beklenir.

## 3. Özet

**8 EVET / 11** — EVET: 1, 2, 3, 5, 6, 9, 10, 11. **HAYIR: 4, 7, 8.**

Ortak kök neden (üçünde de aynı bölge): **omuz–kol oyuğu–yan dikiş kavşağı**. Öğe (kap kol, tek omuz yakası, kolsuz kol oyuğu) gövdeye bir dikişle bağlanmıyor; kavşak düz segment / kama / kanatla kapatılıyor. 4'te kol yan dikişe kavuşmayan kanat, 7'de yakanın kalın–ince çizgisi ayrışıp kama yapıyor ve omuzlu tarafta oyuk yok, 8'de oyuk düz eğik + uçta kanca. Satıcı flat'lerinde (R1, R4, R7) bu kavşak tek içbükey kavis ve kol altı yan dikişe biner. EVET'lerde de aynı bölge en zayıf yer (3/5/11'de omuz-yaka sivri uçları, 6/10'da 25 px'lik kol oyuğu) — kusur eşiğin altında kalıyor ama aynı kaynaktan.

İkincil, tekrar eden ufak şeyler: büzgü tiklerinin dikişin iki yanına taşması (5, 6, 10); dolgun/büzgülü etek uçlarının düz çizilmesi (6); uç/fisto çizgisinin dış kontur ağırlığını kaybetmesi (2).
