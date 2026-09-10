# Tur 27 — Hakem B (kör hakem, yalnız png) — 2026-09-10

Kural: yalnız `KOSU/ciktilar/giris-3/{1..11}/flat.png` açıldı. Repoda başka dosya
okunmadı, scratchpad'deki eski referanslar kullanılmadı. Ölçüt = bu turda internetten
çekilip **Read ile açılan** gerçek satıcı line drawing'leri.

---

## 1. Web kaynakları (bu turda çekildi ve açıldı)

| # | Satıcı / ürün | URL | Gözlem |
|---|---|---|---|
| W1 | Muna and Broad — Alistra Dress line drawing | https://www.munaandbroad.com/cdn/shop/products/AlistraDresslinedrawing_1500x.png | Ön+arka+2 view yan yana, "View A / View A back" etiketli. Dış kontur belirgin kalın, iç dikiş (CB, omuz, kol) belirgin ince. Kol ucu ve etek ucu bandı **çift çizgi**, arada ince kesikli dikiş izi. Yan dikiş düz-hafif kavisli, etek ucu **düz değil, hafif kavisli** ve yan dikişte köşe yapmadan dönüyor. Gölge/dolgu yok, saf çizgi. |
| W2 | Muna and Broad — Newry Top & Dress, tüm view'lar | https://www.munaandbroad.com/cdn/shop/files/Newry-Top-and-Dress-line-drawing-all-views_1500x.png | **En yakın emsal** (puff kol + Peter Pan yaka + büzgülü yoke + fisto etek ucu). Büzgü: yoke dikişinden aşağı **konikleşerek biten, düzensiz uzunlukta** kırışık çizgileri — hepsi aynı boyda değil, dikiş çizgisine dik başlayıp aşağı doğru soluyor. Puff kol kapağı dış konturla kesişmiyor, kol oyuğu dikişine oturuyor. Fisto (scallop) etek ucu kontur çizgisinin **kendisi**, ayrı yapıştırılmış bir şerit değil. Yaka: ön ortada iki ayrı yaka yaprağı, boyun dikişine bağlı. |
| W3 | Helen's Closet — Lockhart Jumpsuit & Dress line art | https://helensclosetpatterns.com/cdn/shop/files/lockhart-jumpsuit-and-dress-line-art_826f8015-...jpg | Ön+arka manken üstünde + altta manken'siz flat dizisi. Askı/korsaj dikişleri düz, etek A-line'da **yan dikiş kavisli**, etek ucu kavisli. Uzunluk seçenekleri kesikli çizgiyle işaretli. Kalın dış kontur / ince iç dikiş hiyerarşisi net. |
| W4 | Helen's Closet — Cassidy Wrap Top line art | https://helensclosetpatterns.com/cdn/shop/files/cassidy-wrap-top-instructions-line-art.jpg | Büzgü konvansiyonu çok net: bel bandı dikişinde **kısa, çalı gibi, farklı boyda** büzgü tüyleri; sadece büzgünün olduğu dar bölgede, dikişe dik. Üstdikiş (topstitch) ayrı ince kesikli çizgi olarak dikiş çizgisine paralel. Kravat/bağ uçları hacimli çizilmiş, düz çizgi değil. |
| W5 | Jalie 3024 Knit Dresses — pattern envelope teknik çizim bloğu | https://jalie.com/cdn/shop/products/3024-knit-dresses-jalie-6.png | Küçük ölçekte bile ön+arka aynı giysi okunuyor; "front and back are identical" notu. Kolsuz/kolsuz view'larda kol oyuğu kavisi ve etek ucu volanı ayrı dikişe bağlı parça. Ölçek küçüldükçe iç detay eleniyor ama silüet korunuyor. |

**Kaynaktan çıkan ölçüt (bu 5 çizimin ortak paydası):**
1. Dış kontur kalın, iç dikiş ince — iki kademe, tutarlı.
2. Yan dikiş ve etek ucu **kavisli**; etek ucu yan dikişe köşe yapmadan bağlanır.
3. Ön ve arka **aynı giysidir**: silüet, uzunluk, yan dikiş, etek ucu birebir örtüşür; fark sadece kapama/yaka/detayda.
4. Her öğe (cep, yaka, büzgü, fisto, pens) bir dikişe veya kontura **bağlıdır** — havada durmaz.
5. Büzgü = dikişe dik, düzensiz boyda, konikleşerek sönen kısa çizgiler. Sadece büzgülü dar bantta.
6. Kanca/köşe/taşma yok: hiçbir çizgi konturun dışına taşmaz, hiçbir uç boşlukta kesilmez.

---

## 2. Hükümler

**1 — V yakalı, prenses dikişli, bel kesikli, kapaklı cepli A-line elbise — EVET**
- Çizgi hiyerarşisi doğru: dış kontur kalın, prenses dikişleri/bel kesiği ince. W1/W3 ile aynı kademe.
- Yan dikiş ve etek ucu kavisli, etek ucu yan dikişe köşesiz bağlanıyor; A-line silüet tipe uygun.
- Ön/arka aynı giysi: bel kesiği aynı hizada, etek uzunluğu ve genişliği örtüşüyor, arka fermuar CB'de doğru. Cepler bel altı prenses dikişine oturuyor, kapak üstdikişi kesikli — W4 konvansiyonu.

**2 — Kare yakalı, askılı, prenses dikişli, fisto etek uçlu midi elbise — EVET**
- Fisto etek ucu konturun kendisi olarak çizilmiş, üstünde kesikli dikiş hattı var — W2'deki scallop konvansiyonuyla birebir.
- Askı → kare yaka → koltuk altı geçişi dikişe bağlı; prenses dikişleri göğüsten etek ucuna kesintisiz iniyor.
- Ön/arka aynı: bel kesiği, etek genişliği, fisto ucu her iki görünüşte örtüşüyor; arkada CB fermuar eklenmiş, bu doğru fark.

**3 — Peter Pan yakalı, puff kollu, büzgülü yoke'lu A-line çocuk/kısa elbise — EVET**
- W2'nin (Newry) doğrudan muadili ve konvansiyonu tutturuyor: yoke dikişinden aşağı düzensiz boyda, sönen büzgü çizgileri.
- Puff kol kapağı kol oyuğu dikişine oturuyor, dış kontura taşmıyor; kol ucu fisto bandı ayrı çift çizgi + kesikli dikiş.
- Ön/arka aynı giysi: yoke hattı aynı yükseklikte, etek genişliği/uzunluğu örtüşüyor, arkada yaka yerine yuvarlak boyun + CB açıklığı — doğru fark.

**4 — Bateau yakalı, kısa kollu, önden düğmeli, prenses dikişli kılıf elbise — HAYIR**
- **Kol takım hatası:** her iki kolda da omuz/kol oyuğu bölgesinde kolun üst kenarı gövde konturunu keserek içeri giren ince bir kama oluşturuyor; kol kapağı dikişe bağlanmıyor, gövdenin üstüne bindirilmiş gibi duruyor. W2/W5'te kol kapağı her zaman kol oyuğu kavisine oturur.
- Ön/arka çelişkisi: önde bateau yaka yüksek ve düz, arkada aynı yaka çok daha derin ve farklı kavisli — aynı giysinin iki yüzü olarak okunmuyor.
- Yan dikiş kavisi tamam ama etek ucu **düz kesik**, yan dikişte belirgin köşe; W1/W3'te etek ucu kavislidir.

**5 — Bateau yakalı, kolsuz, büzgülü göğüs altı kesikli, pensli A-line elbise — EVET**
- Büzgü çizgileri göğüs altı kavisli kesiğine dik, düzensiz boyda, konikleşerek sönüyor — W4 konvansiyonu doğru uygulanmış, sadece büzgülü dar bantta duruyor.
- Bel kesiği + etek pensleri dikişe bağlı, pens uçları sivri ve kapalı; taşma yok.
- Ön/arka aynı giysi: göğüs altı kesiği ve bel kesiği aynı yükseklikte, silüet ve etek ucu örtüşüyor; arkada CB fermuar. Yan dikiş ve etek ucu kavisli.

**6 — Kare yakalı, kalın askılı, büzgülü empire kesikli, büzgülü A-line elbise — EVET**
- İki ayrı büzgü bölgesi (yaka ortası ufak büzgü + empire dikişinden inen etek büzgüsü) ikisi de dikişe bağlı, düzensiz boyda.
- Etek büzgü kırışıkları etek boyunca sönerek iniyor, etek ucuna kadar sert çizgi olarak devam etmiyor — W2'deki gathered skirt davranışı.
- Ön/arka aynı: empire hattı aynı yükseklikte, etek genişliği/uzunluğu örtüşüyor, askı genişliği aynı; önde büzgü bağı, arkada düz kare yaka — doğru fark.

**7 — Asimetrik tek omuzlu, drapeli/büzgülü kılıf elbise — HAYIR**
- **Serbest uçlu çizgiler:** ön yandaki 4 drape kavisi havada başlayıp havada bitiyor; hiçbiri karşı kontura veya bir dikişe bağlanmıyor. Konvansiyonda drape çizgisi kaynak dikişinden çıkar.
- Omuzdaki uzun düz çizgi hem önde hem arkada gövdeyi çapraz kesiyor, bir dikiş veya kesik olarak sonlanmıyor — kanca gibi duruyor.
- Yaka/omuz bölgesinde konturda sivri "V" çentik (hem ön hem arkada) — köşe kusuru; ayrıca arka omuz çizgisi ön omuzla eşleşmiyor, ön+arka aynı giysi okunmuyor.

**8 — Bateau yakalı, kolsuz, önden düğmeli, pensli bluz — HAYIR**
- **Silüet tipe uymuyor:** yan kontur belde girip kalçada dışa taşan, sonra etek ucunda tekrar içe kırılan dalgalı bir hat; bluz konturu bu kadar salınmaz. W4'teki bluz silüetiyle kıyasla anatomik değil.
- Etek ucu düz kesik ve yan dikişte sert köşe yapıyor; W1/W3'te kavislidir.
- Omuz/kol oyuğu bölgesinde kontur dışa doğru sivri bir çıkıntı yapıyor (özellikle arkada), kol oyuğu kavisi olarak okunmuyor — köşe/taşma kusuru.

**9 — Sweetheart yakalı, bağlamalı askılı, korse dikişli, A-line mini elbise — EVET**
- Korse/prenses dikişleri sweetheart kavisinden başlayıp bel kesiğine bağlanıyor, oradan etek penslerine devam ediyor — hepsi dikişe bağlı.
- Sweetheart yaka dış konturu kalın, iç kaplama hattı kesikli — W1'deki neckline binding konvansiyonu.
- Ön/arka aynı giysi: bel kesiği aynı yükseklikte, etek ucu (kesikli hem hattı ile) örtüşüyor, askı bağları iki yüzde de aynı; arkada CB fermuar. Fiyonk bağlar hacimli çizilmiş, düz çizgi değil.

**10 — Kare yakalı, kalın askılı, fistolu, büzgülü büstiyer kesikli A-line elbise — EVET**
- Büst kesiği kavisi (iki kubbeli) hem büzgü kaynağı hem dikiş olarak çalışıyor; büzgü çizgileri bu kavise dik ve düzensiz.
- Fisto bandı yaka hattında konturun üstünde ayrı şerit olarak duruyor ama boyun dikişine bağlı — W2 konvansiyonu.
- Ön/arka aynı: askı genişliği, büstiyer kesiği yüksekliği, etek genişliği ve uzunluğu örtüşüyor; arka düz bant + CB fermuar. Yan dikiş ve etek ucu kavisli, A-line temiz.

**11 — Peter Pan fistolu yakalı, puff kollu, büzgülü yoke'lu bluz — EVET**
- 3 numaranın bluz boyu muadili, aynı konvansiyonlar geçerli: fisto yaka kenarı, yoke büzgüsü, kol ucu fisto bandı.
- Puff kol kapağı kol oyuğuna oturuyor, kol ucu bandı çift çizgi + büzgü tüyleri ile — W2 ile birebir.
- Ön/arka aynı giysi: yoke hattı, etek ucu, kol boyu örtüşüyor; arkada yaka yerine fisto kenarlı boyun + CB açıklık — doğru fark.

---

## 3. Özet

**8 EVET / 11.** HAYIR: **4, 7, 8**.

**Kök neden — tek bir şey: gövde konturunun kendisi üretilirken, ona bağlanacak öğenin
dikişi hesaba katılmıyor.** Üç HAYIR'ın üçü de aynı yerden kırılıyor:

- **4 ve 8'de kol oyuğu.** Kol/kol oyuğu bölgesinde kontur ile takılan parça ayrı ayrı
  üretilip üst üste konuyor; kesişme yerinde kama (4) veya sivri çıkıntı (8) kalıyor.
  Konvansiyonda kol kapağı ile kol oyuğu **aynı eğridir**, iki ayrı eğri değil.
- **7'de drape.** Drape/büzgü çizgileri bir kaynak dikişinden türetilmiyor, gövdenin
  üstüne serbest eğri olarak atılıyor; iki ucu da boşlukta kalıyor. Asimetri kusur değil —
  **bağlanmamış olması** kusur. 7 asimetrik olduğu için değil, hiçbir çizgisi dikişe
  bağlı olmadığı için HAYIR aldı.
- **4 ve 8'de ayrıca etek ucu.** Etek ucu yan dikişten bağımsız düz bir yatay çizgi olarak
  çekiliyor, yan kontur oraya vardığında köşe oluşuyor. Satıcı çizimlerinde (W1, W3)
  etek ucu kavislidir ve yan dikişe teğet girer.

Geçen 8 çizimde ortak olan şey, öğenin (cep, büzgü, fisto, pens, korse dikişi) bir
kesik/dikiş hattından **doğması**. Kalan 3'te öğe gövdeye **yapıştırılmış**. Ayrım
tam olarak burada; yaka tipi, uzunluk, süsleme farkı değil.

**Ek gözlem (sorulmadı, önemli):** 11 çizimin hiçbirinde manken/vücut yok. W3, W4
(Helen's Closet) çizimlerini gri manken üstünde veriyor, W1/W2/W5 vermiyor — yani
manken'siz olmak kusur değil, sektörde iki konvansiyon da yaşıyor. Ancak W3/W4'ün
manken kullanması ölçek ve oranı okutuyor; manken'siz çizimde silüet doğruluğu daha
kritik hale geliyor, ki 8'in silüet hatası tam bu yüzden göze batıyor.

**DOĞRULANMADI:** Giysi tarifleri (ör. "Peter Pan yaka", "sweetheart") çizimden okundu,
repodaki spec ile karşılaştırılmadı — kör hakem kuralı gereği yalnız png açıldı. Tarif
yanlışsa hüküm gerekçesi değil, etiket etkilenir.
