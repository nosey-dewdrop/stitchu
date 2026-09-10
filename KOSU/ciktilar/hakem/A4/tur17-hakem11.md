# Tur 17 — Hakem 11 (kör hakem, yalnız png) — 2026-09-10

Açılan dosyalar: yalnız `KOSU/ciktilar/giris-3/{1..11}/flat.png`. Repo'dan başka hiçbir dosya açılmadı. Scratchpad'deki eski referans görselleri kullanılmadı; aşağıdaki kaynaklar bu turda indirilip Read ile açıldı.

## 1. Web kaynakları (bu turda çekildi ve görüntülendi)

| # | Satıcı / kalıp | URL (görsel) | Gözlem |
|---|---|---|---|
| 1 | Grainline Studio — Farrow Dress | https://grainlinestudio.com/cdn/shop/products/grainline-farrow-dress-pattern-0-18-flat-technical-illustrations.jpg | Dış kontur kalın, iç dikiş ince; etek ucu hafif kavisli + kesik çizgili baskı dikişi; ön+arka aynı ölçek, arka hafif geride; dikiş noktalarında küçük çentik işaretleri; kumaş düşüşü açık gri gölgelerle; kol takılı ve kol kapağı belli; arkada damla yaka açıklığı. |
| 2 | Muna & Broad — Glebe Pants | https://www.munaandbroad.com/cdn/shop/files/GlebePantslinedrawing_1500x.png | Lastikli bel büzgüsü düzensiz kısa dalgalarla; cep ağzı kesik çizgi; arka penslar iki ince bacaklı V; paça baskısı kesik çizgi; tüm iç çizgi tek kalınlık ince, dış kontur biraz daha kalın. |
| 3 | Deer & Doe — Eleanor Dress (TechFlats) | https://cdn.shopify.com/s/files/1/0632/8217/files/DD_EleanorDress_TechFlats_34-48_f81b3176-2a95-422a-a3cd-f433c4b504d8.jpg | Puf kol: kol başı balon, kola omuzdan bağlı, gölgeyle hacim; etek panel çizgileri bel dikişinden çıkar, etek ucu kavisli; arka ortada fermuar tek çizgi + küçük çekecek; düğme+kopça yakada kenara bağlı; A ve B varyantları ön+arka yan yana. |
| 4 | Deer & Doe — Myosotis (schema) | https://cdn.shopify.com/s/files/1/0632/8217/files/Myosotis-Dress-Pattern_Deer-and-Doe_D0029_schema.jpg | Siyah silüet üstüne açık çizgi; büzgü = dikişten aşağı inen düzensiz uzunlukta kısa çizgiler (yoke altında, katlarda); düğme patı kesik çizgiyle; kol volanı büzgü çizgileriyle; ön+arka aynı gövde. |
| 5 | Deer & Doe — Aubépine (schema) | https://cdn.shopify.com/s/files/1/0632/8217/files/Aubepine-Dress-Pattern_Deer-and-Doe_D0011_schema.jpg | Empire bel: fiyonk dikişin üstünde, bağcık uçları aşağı sarkar; büzgü dikişten aşağı; kol ucu lastikli (dalgalı); yaka oyuğu ön/arka farkı belli; ön+arka aynı silüet. |

Ölçüt özeti (5 kaynağın ortak dili): dış kontur kalın / iç ince; büzgü = dikişten çıkan kısa düzensiz çizgiler; pens = iki bacaklı ince V; kol gövdeye omuz/kol evinden **bağlı**, serbest uç ya da kanca yok; yaka boyun çizgisine oturur; fermuar/düğme/fiyonk bir dikişe ya da kenara bağlı; etek ucu hafif kavis; ön+arka aynı ölçek, aynı giysi.

Denenip görsel alınamayanlar: Seamwork (ürün sayfaları 404), Megan Nielsen ve Chalk & Notch (Shopify JSON'daki görseller model fotoğrafı çıktı), Named Clothing, Sew Liberated (404). Toplam 5 gerçek satıcı flat'i açıldı.

## 2. Hükümler

**1 — V yaka, kolsuz, prenses dikişli, bel dikişli, A-line etek, iki torba cep — EVET**
- Çizgi hiyerarşisi doğru: dış kontur kalın, prenses/panel/bel dikişleri ince; yan dikiş bele oturup kalçaya açılıyor, etek ucu hafif kavisli (Grainline diliyle aynı).
- Cepler panel dikişini örtüyor (x≈100-200 / 280-370, y≈485-580); kapak üstü kesik çizgi baskı, alt kenar kavisli — satıcı cep dili.
- Küçük tutarsızlık: ön V yakada ince iç çizgi (pervaz) var, arka yakada yok (x≈510-800, y≈60-80); hükmü değiştirmiyor.

**2 — İnce askılı, prenses dikişli, bel dikişli, uzun A-line etek, fisto (dalgalı) etek ucu — EVET**
- Askılar çift ince çizgi, gövdeye köşelerden bağlı; ön yaka oyuklu, arka düz — tutarlı ön/arka ayrımı.
- Prenses dikişleri yakadan bele, etek panel çizgileri bel dikişinden uca; yan dikiş kavisli.
- Fisto etek ucu ön ve arkada aynı (y≈905-915); askı üst uçları açık bitiyor (y≈55) — satıcılar genelde omuz üstünde kapatır, küçük kusur.

**3 — Kısa puf kollu, dantel kenarlı, yakalı, robalı (yoke) düz şift elbise — HAYIR**
- Yaka boyun çizgisine oturmuyor: iki sivri yaka kanadı ince çizgiyle havada, yaka oyuğu çizgisi yok (x≈155-310, y≈80-130); düğme+ilik ortada bir dikişe bağlı değil.
- Kol-gövde bağlantısında kanca: kol alt kenarı gövde yan çizgisiyle kesişip küçük kıvrım bırakıyor (ön x≈130 ve 340, y≈215; arka x≈560 ve 765, y≈215).
- Kol içi taramalar (x≈70-120, y≈110-190) büzgü değil kazıntı gibi; satıcı büzgüsü dikişten çıkar. Roba altı penslar tek çizgi (x≈180, 300; y≈215-265).

**4 — Kayık yaka, kap kollu, prenses dikişli, önden düğmeli dar (sheath) elbise — HAYIR**
- Ön prenses dikişleri asimetrik: sol dikiş pattan ≈95 px uzakta (x≈180-190), sağ dikiş pata ≈15-20 px yaklaşıp neredeyse yapışıyor (x≈295-300, y≈300-450). Arkada ise simetrik (x≈610 / 750).
- Kap kol ucu sivri üçgenle bitiyor (x≈110, y≈210 ve x≈360, y≈210) — satıcı kap kolu yuvarlak ya da düz biter, üçgen yok.
- Olumlu: pat çift çizgi + düğmeler patın içinde (x≈275-290), dış kontur kalın, silüet dar elbiseye uygun.

**5 — Kayık yaka, kolsuz, göğüs altı kavisli dikişte büzgü, bel bandı, pensli düz etek — HAYIR**
- Büzgü çizgileri düzensiz ve dikişi kesiyor (x≈120-370, y≈265-300); satıcıda büzgü dikişin tek tarafından çıkar.
- Etek pensları tek çizgi (x≈180-300, y≈430-600; arka x≈600-720) — satıcı pensi iki bacaklı ince V (Muna & Broad).
- Olumlu: dış kontur kalın, yan dikiş bele oturuyor, ön kavisli/arka düz göğüs-altı dikişi tutarlı.

**6 — Geniş askılı, büzgülü yaka + fiyonk, empire dikişli, büzgülü trapez elbise — EVET**
- Büzgü empire dikişinden aşağı çıkıyor (y≈255-270), etek düşüş çizgileri farklı uzunlukta — Myosotis/Aubépine diliyle aynı.
- Fiyonk yaka ortasında kenara bağlı, bağcık uçları sarkıyor (x≈240, y≈165-320); ön/arka aynı silüet, arka yaka düz.
- Askı içi taramalar (x≈110-160 ve 320-370, y≈60-160) ön ve arkada tutarlı; büzgülü askı olarak okunuyor ama yoğunluğu bir tık fazla.

**7 — Tek omuzlu, yan drapeli, dar (sheath) elbise — HAYIR**
- Drape çizgileri bir dikişe bağlı değil: dört aynı yay havada başlayıp havada bitiyor, kaynağında büzgü yok (x≈300-370, y≈260-560).
- Belde güçlü oturan dar elbisede hiç şekillendirme dikişi/pens yok; arkada tek bir iç çizgi bile yok (fermuar/CB dikişi) — Eleanor arkasında fermuar var.
- Olumlu: ön/arka ayna doğru (önde sağ-yüksek, arkada sol-yüksek), yaka pervaz çizgisi ince ve paralel.

**8 — Kayık yaka, kolsuz, önden düğmeli, bel pensli, kalçada açılan yelek/üst — HAYIR**
- Pat yaka çizgisini aşıyor (x≈232-252, y≈65-85) — pat yakanın altında bitmeli.
- Penslar tek çizgi ve kırık: dikey inip y≈480'de dışa kırılıyor (x≈150-175, y≈300-565; arka x≈585-610, 730-750) — ne pens ne dikiş.
- Kalça açılımı keskin köşeyle (x≈95, y≈500-560 ve x≈385) — satıcı yan dikişi sürekli kavis.

**9 — Kalp yaka, bağcıklı askı (omuzda fiyonk), kup dikişli, bel dikişli, A-line mini elbise — EVET**
- Kalp yaka kalın kontur + kesik çizgi pervaz baskısı (y≈180-210); arka düz yaka aynı kesik çizgi; etek ucunda kesik çizgi baskı — Grainline dili.
- Kup kavisleri yakadan çıkıp bel dikişine düz iniyor; askı fiyonkları omuz noktasında (x≈110 ve 360, y≈55).
- Etek pensları tek çizgi (x≈180-290, y≈430-540) — küçük kusur; yan dikiş kavisli, silüet uyumlu.

**10 — Geniş askılı, dantel/zikzak yaka kenarlı, göğüs altı büzgülü, arkada fermuarlı A-line jile elbise — EVET**
- Büzgü göğüs-altı dikişinden yukarı çıkıyor (y≈215-250), dikiş kalp formunda ve ince; arkada karşılığı düz yoke dikişi (y≈260) — tutarlı.
- Arka fermuar çift kesik çizgi + çekecek, yoke'tan eteğe iniyor (x≈660, y≈180-550) — kenara bağlı.
- Zikzak yaka kenarı ön/arka aynı; A-line yan dikişleri düzgün; askı-gövde geçişinde küçük basamak (x≈130 ve 350, y≈165) kabul sınırında.

**11 — Kısa puf kollu, dantel kenarlı, fistolu şal yakalı, robalı, roba altı büzgülü bluz — HAYIR**
- Kol-gövde kancası: kol alt kenarı gövde çizgisini kesip kıvrım bırakıyor (ön x≈130 ve 340, y≈215; arka x≈560 ve 765, y≈215) — 3 ile aynı hata.
- Yaka havada: fistolu yaka çizgileri boyun oyuğuna oturmuyor, ortadaki ilik/düğme bir kenara bağlı değil (x≈160-300, y≈85-140); arka yaka yarı daire + kısa dikey çizgi olarak bağlantısız.
- Olumlu: roba altı büzgü dikişten aşağı doğru (y≈215-235), bol silüet bol, etek ucu hafif kavisli.

## 3. Özet

**EVET: 5 / 11** (1, 2, 6, 9, 10). **HAYIR: 6** (3, 4, 5, 7, 8, 11).

**Ortak kök neden:** Giysi öğeleri bir dikişe ya da kenara **bağlanmadan** serbest glif olarak yerleştiriliyor. Yaka boyun çizgisine oturmuyor (3, 11), kol gövdeye girerken kanca bırakıyor (3, 11), drape dikişsiz havada (7), pat yakayı aşıyor (8), pens tek çizgi ya da kırık (5, 8, kısmen 9), prenses dikişi pata yapışacak kadar kayıyor (4). İkinci katman: oturan silüetlerde şekillendirme dikişi hiç yok (7). Satıcı flat'lerinde her iç çizgi ya bir dikişten çıkar ya bir kenarda biter; burada geçen 5 çizim tam olarak bu kuralı tutturanlar, kalan 6'sı tutturamayanlar.
