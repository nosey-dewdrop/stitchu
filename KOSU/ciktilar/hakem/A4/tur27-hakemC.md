# Tur 27 — Hakem C (kör hakem, yalnız png) — 2026-09-10

Yöntem: yalnız `KOSU/ciktilar/giris-3/{1..11}/flat.png` açıldı (repoda başka dosya
açılmadı, scratchpad'deki eski referanslar kullanılmadı). Ölçüt olarak bu turda
internetten 8 gerçek satıcı teknik çizimi çekildi ve Read ile açıldı.

---

## 1. Web kaynakları (URL + gözlem)

Satıcı flat'leri Shopify `products.json` uçlarından toplandı; dosya adlarındaki
`TechFlat` / `LineDrawings` / `technical-flat-illustrations` konvansiyonu satıcının
kendi etiketi.

**1. Closet Core / Deer&Doe — Eleanor Dress**
`https://cdn.shopify.com/s/files/1/0632/8217/files/DD_EleanorDress_TechFlats_34-48_f81b3176-2a95-422a-a3cd-f433c4b504d8.jpg`
Gözlem: net ÜÇ çizgi ağırlığı — kalın dış kontur, orta dikiş, ince kesik (dikiş payı/
etek ucu). Etek ucu **kavisli** ve kesikli iç çizgiyle ikizlenmiş. Kol oyuğu oyulmuş,
kolda pazı şişkinliği var. Drape kıvrımları etek içine uzun ve yumuşak iniyor.
Arka fermuar gerçek bir nesne gibi (çekecek başlığı çizilmiş).

**2. Closet Core — Aylin Wrap Dress + Vest**
`https://cdn.shopify.com/s/files/1/0632/8217/files/AylinDress_Vest_TechFlat_0-20.jpg`
Gözlem: kruvaze bindirme **gri dolgu** ile katman farkı veriyor. Prenses dikişleri
göğüsten etek ucuna sürekli kavis. Yan hat düz değil: bel içe, kalça dışa. Bağcık
ucu ilmek olarak modellenmiş, çizgiyle taklit edilmemiş.

**3. Closet Core / Deer&Doe — Magnolia Dress**
`https://cdn.shopify.com/s/files/1/0632/8217/files/magnolia-dress-pattern-tech-flat.jpg`
Gözlem: negatif (siyah gövde / açık çizgi) sunum — yani satıcı flat'i tek bir renk
şemasına bağlı değil, ayırt edici olan çizgi mantığı. Kuşak arkada fiyonk olarak
üç boyutlu düğümlenmiş. Etek godeleri tabana doğru açılan çan.

**4. True Bias — Darla Dress & Jumpsuit**
`https://cdn.shopify.com/s/files/1/0085/3901/3186/files/darla0-18linedrawings.jpg`
Gözlem: büzgü, korsajın altından **eteğin içine uzanan uzun, düzensiz boyda**
çizgilerle veriliyor — dikiş üstünde kısa taraklar DEĞİL. Aynı giysinin ön/arka/
varyant görünümleri tek tabloda, "Mini Length / Maxi Length" kesikli referans hattı.
Etek ucu noktalı kalın bir bant (dikilmiş kenar).

**5. True Bias — Aster Top & Dress**
`https://cdn.shopify.com/s/files/1/0085/3901/3186/files/Aster0-18LineDrawings.jpg`
Gözlem: askılı kare yaka. Pensler **tek çizgi** olarak çizilmiş (kapanmış pens),
baklava/mekik değil. Yan dikişte çentik işaretleri var. Etek ucu kavisli, iç kesikli
çizgi kıvrımı takip ediyor. Arka düğme placket'i kesikli katlama hattıyla birlikte.

**6. Grainline Studio — Poppy Dress**
`https://cdn.shopify.com/s/files/1/0068/4497/3138/files/grainline-poppy-dress-pattern-0-18-technical-flat-illustrations.jpg`
Gözlem: en yoğun büzgü örneği. Her katta büzgü, dikişten aşağı **kılcal, uzunlukları
farklı** yüzlerce çizgi; ayrıca kumaşın kendi kıvrımları ayrı ve daha uzun. Etek ucu
dalgalı (kumaş dökümü). Ön ve arka aynı giysi, üst üste bindirilmiş kompozisyon.

**7. Grainline Studio — Alder Shirtdress**
`https://cdn.shopify.com/s/files/1/0068/4497/3138/files/grainline-alder-shirtdress-pattern-14-32-flat-technical-illustrations.jpg`
Gözlem: **top-stitch her yerde** — yaka, roba, cep, placket kesikli ikiz çizgiyle.
Kol oyuğu belirgin oyuk. Gömlek eteği "shirt-tail" kavisli. Düğmeler ilik çizgisiyle
birlikte, sadece daire değil. Arka roba dikişi ön yaka hattıyla hizalı.

**8. Grainline Studio — Myra Top and Dress**
`https://cdn.shopify.com/s/files/1/0068/4497/3138/files/grainline-myra-top-dress-pattern-0-18-flat-technical-illustrations.jpg`
Gözlem: ince askı, gerçek kalınlıkta iki çizgi + gri ayarlayıcı. Bias kesim yan
yırtmaç. Askı ucu göğüs hattına açılı biniyor. Ön/arka ayrı ama iç içe yerleştirilmiş.

### Bu 8'den çıkan ÖLÇÜT (satıcı flat'i şu 6 şeyi yapar)
1. **3 çizgi ağırlığı**: kalın kontur / orta dikiş / ince-kesik top-stitch.
2. **Hiçbir yatay kenar düz değil** — etek ucu, roba, bel kavisli.
3. **Kol oyuğu oyulmuş**, kolsuzda bile omuz ucundan içeri kıvrılır.
4. **Büzgü = uzun, düzensiz, panelin İÇİNE inen döküm**; dikiş üstü tarak değil.
5. **Donanım nesnedir** (fermuar çekeceği, ilik, ayarlayıcı, ilmek).
6. **Ön ve arka aynı giysidir** — her dikiş karşılığını bulur.

---

## 2. Hükümler

**1 — Kolsuz V yakalı, prenses dikişli, bel kesikli, kapaklı cep A-form elbise — EVET**
- Çizgi hiyerarşisi var: kalın kontur / ince prenses ve bel dikişi / kesikli top-stitch.
  Ölçüt-1'i karşılıyor.
- Ön-arka tutarlı: prenses hatları, bel kesiği ve etek genişlemesi iki yüzde eşleşiyor;
  arka fermuar çekeceğiyle birlikte (ölçüt-5, ölçüt-6).
- Zayıf nokta: etek ucu **düz**, ölçüt-2'yi ihlal ediyor; cep kapağı dikişe değil
  boşluğa oturuyor. Yine de bütün olarak satıcı rafında okunur.

**2 — Kalın askılı, kare/sweetheart yaka, prenses dikişli, fisto etekli midi elbise — EVET**
- Prenses dikişleri göğüsten etek ucuna kesintisiz kavis; Aylin/Eleanor ile aynı mantık.
- Fisto etek ucu ve onun üstündeki kesikli dikiş çizgisi = ölçüt-2 + ölçüt-1 birlikte,
  bu turun en iyi kenar çözümü.
- Askı ucu göğüs üstünde bitiyor ve kol oyuğu oyuk; silüet fit-and-flare tipine uygun.

**3 — Bebe yakalı, balon kollu, robadan büzgülü, fistolu çocuk/trapez elbise — EVET**
- Balon kol hacmi + manşet fistosu + roba büzgüsü birlikte tutarlı; Poppy'nin
  roba-büzgü mantığının sade hali.
- Yaka gerçek bebe yaka: dış kenar kavisli, arka yaka bandı ayrı parça olarak çizilmiş.
- Kusur: büzgü çizgileri **kısa** kalıyor, panelin içine inmiyor (ölçüt-4 kısmi ihlal),
  ama giysi tipi için kabul sınırında.

**4 — Kayık yaka, kısa kollu, prenses dikişli, ön düğmeli kalem elbise — HAYIR**
- **Kol takılı değil**: kol, gövdenin dışına yapıştırılmış; kol oyuğu çizgisi omuzdan
  koltuk altına inmiyor, kolun iç kenarı gövdeyle kesişip **kanca/taşma** yapıyor.
  Ölçüt-3 ve ölçüt-6 ihlali.
- Ön düğme placket'i **hiçbir dikişe bağlı değil** — yakadan etek ucuna serbest iki
  paralel çizgi; ilik yok, sadece daireler (ölçüt-5 ihlali).
- Arka yüzde düğme/placket karşılığı yok ama ön placket bir açıklık ima ediyor;
  ön ve arka aynı giysi olarak okunmuyor.

**5 — Kayık yaka, kolsuz, göğüs altı büzgülü (empire), bel kesikli, pensli kalem elbise — HAYIR**
- Empire kavisi ile bel kesiği arasında **ikinci bir yatay hat** var ve bu hat hiçbir
  parçayı ayırmıyor; iki bel çizgisi üst üste, hangisi dikiş belirsiz.
- Etek pensleri **açık uçlu tek çizgi çifti** olarak havada bitiyor; ne kapanmış pens
  (Aster) ne baklava. Ölçüt-6: pens ön ve arkada aynı yerde ama bel kesiğinin altından
  başlıyor, yani boşa dikiş.
- Büzgü tarakları yalnız göğüs altı kavisin üstünde kısa çizgiler; kumaş dökümü yok.
  Etek ucu düz. Ölçüt-2 ve ölçüt-4 ihlali.

**6 — Kalın askılı, kare yaka, büzgülü empire yakalı, bağcıklı trapez elbise — EVET**
- Empire dikişinin altındaki büzgü **eteğin içine uzun ve düzensiz** iniyor — bu turda
  ölçüt-4'ü tam karşılayan tek çizim; Darla/Poppy ile aynı dil.
- Ön yaka büzgüsü + bağcık ilmeği nesne olarak modellenmiş (ölçüt-5).
- Ön ve arka aynı giysi: empire hattı, askı genişliği, etek açıklığı eşleşiyor.
  Yaka farkı (önde büzgülü, arkada düz) gerçek bir tasarım kararı, kusur değil.

**7 — Tek omuzlu/asimetrik yakalı, yandan drapeli, kolsuz kalem elbise — HAYIR**
- Yaka hattı iki yüzde de **omuz ucunda sivri bir çentik/kanca** yapıyor; kumaşta
  karşılığı olmayan geometrik artık. Ölçüt "kanca/köşe/taşma yok" doğrudan ihlal.
- Drape kavisleri yan dikişten **kopuk**: kıvrımlar havada başlayıp havada bitiyor,
  hiçbiri büzgü tarağına bağlanmıyor (ölçüt-4, ölçüt-6).
- Arka yüzde ön asimetrisinin karşılığı yok; arka sadece ortadan tek çizgiyle bölünmüş
  düz bir kalıp — ön ve arka aynı giysi okunmuyor.

**8 — Kayık/geniş yaka, kolsuz, ön düğmeli, pensli bluz — HAYIR**
- Silüet giysi değil: omuz üstleri kanat gibi dışa taşıyor, bel aşırı içe girip etek
  ucunda tekrar dışa patlıyor — insan gövdesine değil, bozuk bir eğriye oturuyor.
- Pensler **uzun baklava/mekik** olarak çizilmiş ve gövdenin ortasında havada duruyor;
  ne bele ne göğüse bağlı (ölçüt-6).
- Kol oyuğu yok — omuz doğrudan yan dikişe iniyor, oyuk oyulmamış (ölçüt-3).
  Ön düğme sırası yine ilik'siz ve dikişsiz.

**9 — Bağcık askılı, sweetheart yaka, korse dikişli, pensli A-form mini elbise — EVET**
- Korsaj panel dikişleri sweetheart yakadan bele iniyor ve bel kesiğinde karşılık
  buluyor; arkada aynı panel sayısı + fermuar. Ölçüt-6 karşılanıyor.
- Bağcık ilmekleri nesne olarak çizilmiş (ölçüt-5); etek ucunda kesikli iç dikiş var.
- Kusur: etek pensleri bel kesiğinin altında açık uçlu (5'teki hatanın tekrarı) ve
  etek ucu düz. Ama korsaj yapısı ve ön/arka tutarlılığı satıcı seviyesinde.

**10 — Kalın askılı, kare yaka, fistolu roba, empire kesikli trapez elbise — EVET**
- Roba fistosu + göğüs altı kavis + büzgü tarakları üçlüsü tutarlı; kavis gerçek bir
  dikiş, iki yüzde de karşılığı var (arkada düz empire hattı, önde göğüs kavisi).
- Etek trapez açılımı ve yan hat kavisi tipe uygun; arka fermuar çekecekli.
- Kusur: etek ucu düz ve büzgü panelin içine inmiyor (ölçüt-2, ölçüt-4 kısmi).
  Buna rağmen bütün silüet satıcı flat'i olarak okunur.

**11 — Bebe yakalı, balon kollu, fistolu, robadan büzgülü bluz — EVET**
- 3 ile aynı üst yapı ama daha temiz: yaka fistosu, manşet fistosu ve roba büzgüsü
  aynı ölçekte, birbirini tekrar etmiyor.
- Büzgü çizgileri burada gövdenin içine daha uzun iniyor — 3'ten iyi.
- Ön ve arka aynı giysi: roba yüksekliği, kol hacmi, etek genişliği eşleşiyor;
  arka yaka ortasında kapama çentiği var.

---

## 3. Özet

**7 EVET / 11.** (EVET: 1, 2, 3, 6, 9, 10, 11 — HAYIR: 4, 5, 7, 8)

**Kök neden — tek cümle:** Motor gövde silüetini ve dikiş-bağlı öğeleri (yaka, roba,
büzgü, fermuar) doğru üretiyor; **gövdeye SONRADAN eklenen bağımsız öğeler** —
takılan kol (4), ön düğme placket'i (4, 8), serbest pens (5, 8, 9), asimetrik drape
(7) — hiçbir dikiş grafiğine bağlanmadan koordinatla yerleştirildiği için havada
kalıyor, kanca/taşma üretiyor ve arka yüzde karşılığını bulamıyor.

Bunu üç alt maddeye ayırırsak:
1. **Kol takma çözülmemiş.** 4'te kol gövdenin dışına yapıştırılmış, 8'de kol oyuğu
   hiç oyulmamış. Kolsuz ve balon-kollu (3, 11) çizimler geçiyor çünkü orada kol
   oyuğu ya basit ya da ayrı bir hacim olarak çiziliyor. Set-in sleeve = kırık.
2. **Pens ve placket "dikiş nesnesi" değil, süs çizgisi.** Satıcıda pens kapanmış tek
   çizgi (Aster), placket ilikli ve katlama hattıyla. Bizde ikisi de bağlantısız
   geometri; bel kesiğinin altından başlayan pens (5, 9) fiziksel olarak anlamsız.
3. **İki sistemik eksik, hükmü tek başına çevirmedi ama her çizimde var:** etek ucu
   neredeyse hep **düz** (satıcıda asla düz değil — 8/8 kavisli), ve büzgü **dikiş
   üstünde kısa tarak** olarak kalıp panelin içine inmiyor (yalnız 6 istisna).
   Bu ikisi düzeltilirse geçen 7'nin kalitesi de belirgin yükselir.

**Öncelik sırası:** (a) kol takma — 4 ve 8'i tek başına düşürüyor; (b) pens/placket'i
dikiş grafiğine bağla — 5 ve 8'i düşürüyor, 9'u zayıflatıyor; (c) 7'nin asimetrik
drape'i ayrı bir problem, ön/arka eşleşmesi hiç kurulmamış; (d) etek ucu kavisi ve
büzgü dökümü — global kalite tavanı.
