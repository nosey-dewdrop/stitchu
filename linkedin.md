# linkedin.md, build-in-public essay stoğu
> Format (Damla): numaralı inşa zinciri, her adım bir KARAR (ne + neden + sonuç). 300-500+ kelime, Türkçe, dürüst, downfall ve pivot saklanmaz. Büyük dönüm noktası başına ayrı essay. Yazının kendisi Damla'nın ağzından; bunlar iskelet/malzeme. Her cümle gerçek git geçmişinden; sayılar test/motor çıktısı. Reels versiyonları devlog.md'de, projeye bağsız genel konular ~/damla_projects_2026/damla-icerik.md'de.

---

## Essay 1, "Mükemmel çalışan gereksiz motor" (başlangıç + slopware itirafı)

1. **Başlangıç.** Bir elbise fotoğrafı çekiyorsun, sana kendi bedenine göre dikiş kalıbını çiziyorum, gerçek ölçekli A4 basıyorsun, diktiriyorsun. İlk sürümü iOS'ta yazdım: ölçü modeli, onboarding, bir de parametrik etek bloğu. Güzel çalışıyordu.

2. **İlk itiraf.** Ve tamamen gereksizdi. Çünkü ilk motorum sadece etek çiziyordu, ve bir etek kalıbı iki dikdörtgendir, onu herkes kendi çizer. "Yaptım" dediğim şey, kimsenin isteMEYECEĞİ bir şeydi. Bu projenin ilk anayasa maddesi buradan doğdu: **motor sadece insanın KENDİ ÇİZEMEDİĞİ şeyi çizecek.** Kavisli prenses dikişi, kol oyuntusu, yaka pervazı, dikiş payı. "Etekten motor olmaz."

3. **İkinci karar, matematiğim doğruydu ama kimse dikemiyordu.** Klasik kalıp kitapları göğüs bolluğunu pens (dart) ile alır. Teoride doğru. Ama pensin sivri ucu ev dikişçisinin elinde kötü dikiliyor; onlar prenses dikişi diker. Pivot: varsayılan şekillendirme prenses paneli oldu, pens "ileri seçenek"e düştü. Ders: doğru matematik, dikilemiyorsa yanlış üründür.

4. **Üçüncü karar, gizliliği politika değil mimari yaptım.** Vücut ölçüsü hassas veri. "Sunucuya göndermiyoruz, söz" demek yerine motoru C++ yazıp WebAssembly'ye derledim ve tarayıcının İÇİNE koydum. Kalıp senin cihazında, senin işlemcinde çiziliyor. Ölçülerin teknik olarak dışarı çıkamıyor. Ve yan etki: bin kullanıcı da gelse sunucu maliyetim sıfır. Mimari karar, fiyat etiketinin ta kendisi oldu.

5. **Dürüstlük altyapısı.** Her kod değişikliğinde motor 60.300 elbise çiziyor (15 vücut tipi × bütün yaka/kol/etek/bel/kumaş kombinasyonları). Tek ölçüde çalışan kalıp demo, her ölçüde çalışan kalıp üründür. Üstüne golden test: bilinen girdilerin çıktısını dosyaya donduruyorum, her değişiklikten sonra byte byte karşılaştırıyorum. Yeni yaka eklerken eski elbise formülü bir bit oynarsa test kırmızı yanıyor. "Yeni şey ekle, eskiye dokunma" bir niyet değil, makine denetimi oldu.

6. **Neden anlatıyorum.** Çünkü ilk sürümüm iyi görünen, çalışan, ama işe yaramaz bir slopware'di. Onu itiraf edip anayasa çıkarmasaydım, üstüne özellik yığıp güzel bir hiçlik inşa edecektim. Bir ürünün değeri "çalışıyor mu" değil, "insanın kendi yapamadığı neyi yapıyor" sorusunda saklı. Etek çizen motor çalışıyordu. Kimse istemiyordu. İkisi ayrı sorular.

---

## Essay 2, "Testlerim yeşildi, ürünüm bozuktu" (adversarial denetim gecesi)

1. **Yanlış güven.** Motorumun 60 bin taslaklık matrisi vardı ve hepsi yeşildi. Ben "sağlam" diyordum. Sonra bir gece motoru kendime karşı kışkırtmaya karar verdim: Dior terzisi, CS dekanı, VC ve Kate Middleton gözüyle her turda en sert eleştiriyi bul, veriyle düzelt, kanıtla. Sonuç sarsıcıydı: yeşil testler bozuk ürünü gizliyordu.

2. **Kol pazıya sığmıyordu.** Takma kol oyuntuya sadece UZUNLUKLA oturuyordu; genişlik hiç kontrol edilmiyordu. Dolgun kollu bir vücutta kol pazıdan 76 mm dardı, koltuk altı fiziken kapanmazdı. Matris bunu kaçırdı çünkü tek kontrolü cap uzunluğuydu, onu da zaten arama algoritması çözüyordu. Test, kendi kör noktasını test ediyordu.

3. **Kendi fix'im fazla düzeltti.** Kolu pazıya zorlayınca, göğsü dolgun + sırtı kısa vücutta (çok yaygın "petite-full") bu sefer cap payı %46'ya fırladı ve validator kalıbı TAMAMEN reddetti, yani o kadın hiç kollu kalıp alamıyordu. Matris yine kaçırdı, çünkü bütün test vücutlarım büst ve sırt boyunu BİRLİKTE ölçekliyordu. Self-referential bir kör nokta. Gerçek terzilik çözümü: dolgun kola koltuk altını indirmek. Oyuntuyu pazıya göre derinleştirdim, bele değmeyecek şekilde clamp'ledim.

4. **İmkansız vücut sessizce bozuk kalıp basıyordu.** Göğüs 160 / bel 45 gibi imkansız ölçülerde motor ya 8 şifreli geometri hatası veriyordu ya da, daha kötüsü, doğrulamayı geçip sessizce bozuk bir kalıp basıyordu. Tek net kapı koydum: oranlar imkansızsa "ölçülerini kontrol et" diye tek okunur sebep.

5. **Benchmark hile yapıyordu.** En sert ders. Rakiplerin yayınlamadığı doğruluk sayılarını yayınlayacaktım, moat buydu. İlk benchmark'ım dikiş uçlarının 0.00 mm eşleştiğini "kanıtlıyordu". Sonra fark ettim: aynı trued sayıyı iki kez okuyup birbirinden çıkarıyordu. x − x = 0. Kanıt değil, totoloji. Çizilen gerçek geometriden baştan yazdım; şimdi bağımsız ölçümle maksimum sapma 0.000023 mm. Aynı sebeple güvenilmez bir bust ölçümünü de attım.

6. **Ders.** "Testlerim geçiyor" cümlesi bir ürünün doğru olduğunu SÖYLEMEZ; sadece testlerimin sorduğu soruların cevaplandığını söyler. Testler benim yazdığım sorular, ve ben yanlış soruları sorabilirim. Yeşil ekran huzur verir, huzur tehlikelidir. O gece 6 gerçek fit bug'ı kapattım, hepsi test+guard'lı. En değerli çıktı kod değil, alışkanlıktı: ürününü seven değil, ürününe düşman gibi bakan gözle test et.

---

## Essay 3, "Yenilik değil kanıt: moat neden benchmark" (iş modeli)

1. **Korkulu soru.** "Neden insanlar buna para versin?" Araştırdım ve dürüst cevap ilk başta moralimi bozdu: ben ilk değilim. StitchLift diye bir ürün tam aynı pitch'i satıyor, fotoğraf→kalıp, ayda 34-49 dolar, grading'i de var, shipped. Pazar kanıtlı (Etsy'de made-to-measure kalıp satan biri 26.7 bin satış yapmış). Yani "olur mu" sorusu yok; soru "senin farkın ne".

2. **Açık kapı.** StitchLift satıyor ama bir şeyi YAPMIYOR: doğruluk iddiasını kanıtlamıyor. Benchmark yok, dikilmiş-test yok. Kalıbın gerçekten bedene oturduğunu kimse ölçüp yayınlamıyor. Bir fit anketinde 688 kişinin bir numaralı şikayeti "orantısız grading", ikincisi "kol dar", ikisini de o gece motorumda düzelttim. Demek ki moat yenilik değil: aynı işi yapıp DOĞRULUĞUNU kanıtlamak.

3. **Motoru API yaptım.** "Para kazanmak istiyorum, API'laştıralım" dedim. Aynı C++ motoru Cloudflare Worker'ın içinde koşturdum, tarayıcı sürümü wasm'ı fetch'liyordu ama worker'da o yol yok, ayrı derleyip precompiled wasm'ı motora elle verdim. Sonuç: `POST /api/draft`, giriş doğrulama, bozuk kalıp yerine "422 undraftable + sebep", çağrı başına LLM maliyeti SIFIR. Satılabilir bir çekirdek. Bir güvenlik denetiminden sonra sertleştirdim: dokümandaki yalanı, reddedilen taslağın yanlış cache'lenmesini, spoof'lanabilir beden sınırını düzelttim.

4. **İki referans, iki iş modeli.** Damla 700 TL verip bir rakibin (elle Illustrator'da kalıp çizip Etsy'de satan bir terzi) gerçek ürününü satın aldı. Didik didik ettik. Onun günlerce elle yaptığının ~%80'i motorda otomatik ya da verisi hazır. Dahası: onun kalıbında "eski sürüm dardı, müşteri şikayetiyle düzelttim" notu vardı, elle ease kararının hata payını itiraf ediyor. Benim motorum ease'i parametrik ekliyor, o hata sınıfını yapı olarak yapamaz. İki iş modeli birden açıldı: (A) SaaS sat, (B) motorla kalıp üretip Etsy'de sat.

5. **Kapanmayan boşluk, dürüstçe.** Rakibin benden TEK üstünlüğü kalıp değil, SUNUM: güzel flat sketch, 13 sayfalık illüstre talimat, kapak tasarımı. Ve benim çıktımın gerçek bir kusuru var: sayfaları yan yana koyunca puzzle gibi tam birleşmiyordu, kenar hiza işaretleri eksikti. Onu da rakibin sistemine bakarak onardım: sayfa çerçevesi, köşe register kareleri, grid kodları, "→ B2" devam okları. Ama sunum boşluğu (illüstre talimat, flat sketch) hâlâ açık; onu saklamıyorum, yol haritasında.

6. **Ders.** Bir pazarda ilk olmak zorunda değilsin. İlk olamıyorsan, herkesin söyleyip kanıtlamadığı şeyi KANITLA. İddia herkesin; ölçüm cesaret ister. Benim moat'ım tek cümle: rakiplerin yayınlamadığı doğruluk sayısı + cihazda gizlilik + sıfır maliyetle undercut. Ve bunu söylemenin tek dürüst yolu, önce kendi benchmark'ımın hile yapmadığından emin olmaktı.

---

## Essay 4, "Sayı değişmedi ve buna sevindim" (dürüst ilerleme)

1. **58 gerçek fotoğraf.** Bir noktada "yaptım" demeyi bırakıp ölçmeye karar verdim. 58 gerçek Etsy elbise/bluz fotoğrafı için el emeğiyle "ground truth" (doğru cevap) hazırladım ve bütün zinciri, fotoğraf → yapay zeka okuması → motor kalıbı, ölçen bir script yazdım. Amaç: "ilerliyorum" hissini değil, sayıyı görmek.

2. **İlk gerçek sayı: 54 tam kalıptan 6.** Acı ama net. Ve teşhis daha da net: yapay zeka düğmeyi, yakayı, korseyi ÇOĞUNLUKLA doğru görüyor, ama gördüğünü serbest bir cümleye yazıyor ("düğmeli, hakim yakalı"), motorun sözlüğünde ise "düğme patı" diye bir formül yok. Yani göz var, el yok, ortadaki boru taşımıyor. Kullanıcının "düğmeyi görmüyor" hissinin gerçek mekanizması buydu: görüyor, kullanamıyor.

3. **Bir loop, sayı değişmedi.** Bir sonraki oturumda görü çıktısını yapısal alanlara taşıyan bir köprü kurdum, ama tam kalıp sayısı 6/54'te KALDI, çünkü motor o öğeleri hâlâ çizmiyor. Ve buna sevindim. Çünkü değişmemesi doğruydu: sadece boruyu döşedim, eli henüz eklemedim. Sayıyı sahte yükseltmemek için ayrı bir istatistik ekledim: "yapısal alanlar, çizilemeyen öğeyi kaç fotoda YAKALADI". Ürün sayısı ile kabiliyet sayısını AYRI ölçmek, kendime "ilerliyorum" yalanını söylememenin tek yolu.

4. **Motoru kitaplara karşı yargıladım.** Motorun her bloğunu iki yayınlanmış standarda (Aldrich, Armstrong) karşı denetledim. Kural sertti: bir formülü ancak İKİ kaynak BİRDEN aynı değerde diyorsa ve motor net yanlışsa değiştir. Sonuç: değiştirilen formül sayısı SIFIR. Her sapma ya tek kaynaklıydı, ya savunulabilir bir bant içindeydi, ya zaten "ASSUMPTION" olarak işaretliydi. Uydurmamak için hiçbir şeye dokunmadım, ve bunu bir başarı sayıyorum, çünkü tek kaynağa dayanıp "düzelttim" demek en kolay yalandı.

5. **Ders.** İlerlemenin en dürüst kanıtı, bazen değişmeyen bir sayıdır. Herkes grafiğini yukarı çizmek ister; ama gerçek mühendislik, sayının HANGİ nedenle sabit kaldığını bilmektir. Ben "6'da kaldım" diyebiliyorum çünkü 6'nın neden 7 olmadığını gösterebiliyorum. Pazarlama sayıyı büyütür; ürün sayının doğrusunu söyler. Bir gün bu 6, gerçekten motor eli eklendiğinde büyüyecek, ve o zaman büyüdüğüne güvenebileceğim, çünkü şimdi büyütmedim.

## Essay 5, "Ürünüme yalan söyletmeyi bıraktım" (sessiz fallback)

1. **Bir ürünün en sessiz yalanı.** Motorum bir fotoğraftan dikiş kalıbı çıkarıyor. Ama bazı öğeleri henüz çizemiyor: düğme patı, ayrı yaka parçası, fırfırlı askı, korsenin ayrı kup dikişi. Eski hâlinde bunlarla karşılaşınca ne yapıyordu? En yakın bloğu SESSİZCE veriyordu. Sen düğmeli bir bluz yüklüyorsun, o düğmesiz düz bir kenar çiziyor ve tek kelime etmiyor. Teknik olarak "bir kalıp" veriyordu, ama senin istediğin kalıbı değil, ve bunu söylemiyordu. Kullanıcıların "yapay zeka düğmeyi görmüyor" hissinin altında yatan asıl şey buydu: görüyordu, çizemiyordu, ve sustuğunu saklıyordu.

2. **Neden bu bir kusur, "eksik özellik" değil.** Bir aracın bir şeyi henüz yapamaması normaldir. Ama yapamadığını gizlemesi güveni öldürür. Kullanıcı, ürünün ne yapıp ne yapamadığını bilmeden ona güvenemez. Silent fallback (sessiz geri düşme) yazılımda en tatlı görünen, en zehirli desendir: kod hiç hata vermez, akış hiç kırılmaz, ve tam da bu yüzden kullanıcı yanlış bir modele göre iş yapar. Kumaşı yanlış keser. Sorumluluk bende.

3. **Önce dene, sonra itiraf et.** Dürüstlük katmanı "çizemedim, kolay gelsin" demek DEĞİL. İki adımlı kurdum: motor çizemediği her öğe için ÖNCE en yakın türevini deniyor, düğme yerine düz dikişli açıklık, puf istenirse balon kolun büzgülü başı, korse yerine pensli/prenses göğüs, SONRA açıkça yazıyor: "bunu gördüm, kalıpta tam çizemedim, sana en yakın şunu verdim, kalanını elle şöyle ekle." Yani kullanıcı hem çalışan bir başlangıç kalıbı alıyor, hem de neyi kendi tamamlayacağını tam olarak biliyor. Eksik, artık bir tuzak değil bir talimat.

4. **İki ekran, tek gerçek.** Bu görünürlüğü iki yere koydum: sonucu gördüğün ekrana (couture markasına uygun sade bir vişne kart) ve BASKI kapağına, çünkü kalıbı kesen kişi çoğu zaman siteyi hiç görmeyen biri. İkisi de aynı tek kaynaktan besleniyor: eşleme tablosu ve mesajlar tek bir dosyada. "Bir gerçek, bir yer", çünkü ekranın "düğme yok" deyip kâğıdın demediği bir dünya, ilk yalandan beter.

5. **Ölçemediğim şeyi ölçmüş gibi yapmadım.** Bu oturumun benchmark sayısını ölçemedim: yapay zeka çağrısı için kullandığım kredi bitmişti, canlı görü çağrısı hata dönüyor. Sayı uydurmak yerine tabloya "ölçülemedi: kredi" yazdım. Ama kanıtlayabildiğimi kanıtladım: beş temsili giysi tarifi + bir temiz kontrol üzerinde katmanın doğru mesajı Türkçe ve İngilizce ürettiğini, temiz bir kalıpta HİÇ mesaj çıkmadığını (yanlış alarm yok) gösterdim; motorun C++'ına dokunmadığım için eski kalıpların tek biti oynamadı. Ders: bir ürünü dürüst yapan şey, ne bildiğini söylemesi kadar, ne BİLMEDİĞİNİ de söylemesidir, hem kullanıcıya, hem kendine.

---

## Essay 6, "Bir düğme patı çizmek için önce Aldrich okudum" (ilk çizim)

1. **Söz verdiğim şeyi yapmaya başladım.** Geçen oturumda ürünüme çizemediği şeyleri dürüstçe söylettim: "düğme patını çizemiyorum, elle ekle." Dürüstlük iyi ama bir hedef değil, bir ara duraktı. Asıl iş o listeyi kısaltmak, gerçekten çizmek. Bu oturumda listenin en tepesindeki öğeyi aldım: düğme patı. Ölçüm verilerimde 54 fotoğrafın 19'unda vardı; en sık ikinci eksik öğe.

2. **Kod yazmadan önce kitap açtım.** Kendi kafamdan bir pat uydurabilirdim; çalışırdı bile. Ama bu ürünün tek gerçek moat'ı doğruluk, o yüzden kural şu: her yeni öğe önce kalıp kitaplarından çıkar. Winifred Aldrich ve Helen Armstrong'un metinlerini taradım. Öğrendiklerim tek tek karar oldu: (a) pat genişliği düğme çapı kadardır, sabit bir sayı değil, düğmeye bağlı bir değişken; (b) couture bir bluz patı "grown-on"dur, yani ayrı bir bant değil, ön parçanın kendisi uzayıp içeri katlanır (Zara'nın ucuz diktiği ayrı bant high-street kısayolu, ben couture olanı seçtim ve gerekçesini yazdım); (c) düğmeler tam orta-ön çizgisinde durur, ilikler oradan 3 mm dışa kayar (yatay ilik kuralı); (d) göğüs hizasına ZORUNLU bir düğme konur, yoksa giysi orada açılır; (e) kadın giyimi sağ önü sol önün üstüne bindirir. Beş kural, beş satır formül.

3. **Mimari karar: dokunma, ekle.** Bu özelliği motorun ana çizim koduna gömebilirdim, ve her eski kalıbı riske atardım. Bunun yerine "opsiyonel post-pass" deseni kullandım: pat, ana çizim bittikten SONRA çalışan, varsayılan kapalı bir ek adım. Daha önce anahtar-deliği yakayı da böyle eklemiştim; desen kanıtlıydı. Kapalıyken tek bir koordinat değişmez. Bunu iddia etmedim, ölçtüm: golden testim 23.034 satırda 0.000000 mm fark verdi. Kapalı yol bit bit aynı.

4. **En ince tuzak: yakaya dokunmamak.** Patı çizerken ön parçanın orta-ön kenarını 18 mm dışa taşıdım. İlk denemede giysinin yaka çizgisini de kazara kaydırdım, ve testim anında patladı: yaka pervazı (facing) ayrı bir parça ve ölçüsü giysinin yakasıyla milimetre milimetre tutmak zorunda, tutmayınca doğrulayıcı alarm verdi. Bu bir hata değil, bir bekçiydi. Düzeltmem şuydu: sadece orta-ön kenarını büyüt, yaka noktasına kısa bir düz çizgiyle geri bağla, yakanın kendisine HİÇ dokunma. Ders: iyi bir test suite yeni özelliğin yan hasarını sen fark etmeden yakalar.

5. **Kanıt, ve dürüst sınır.** Kanıt zinciri: golden 0.000000 mm, 13 test yeşil, dört farklı beden (petite/plus, prenses/pens) üzerinde pat geçerli, hassasiyet raporu en kötü eşleşme 0.00 mm, 19.620 fuzz çiziminde 0 hata, 37.800 kombinasyon taramasında 0 hata, baskı sayfalarında düğme ve katlama çizgisi gerçekten görünüyor. Sayıya gelince: canlı benchmark yine BLOKE, kredi bitik. Uydurmadım. Bunun yerine offline bir ön-kontrol yaptım: 19 düğmeli fotoğraftan 7'sinin tek eksiği bu patmış, yani artık tam kalıp adayı; 2'si arka pat (onu bilerek çizmiyorum, dürüstlük katmanında kalıyor); 10'unda pat çizildi ama başka eksikler sürüyor. Bunu rapora "offline ön-kontrol, canlı koşu değil" etiketiyle yazdım. İlk çizim loop'u: söz, koda döndü.

## Essay 7, "En zor kısım hangi bağı ÇİZMEYECEĞİme karar vermekti" (bağ/kurdele)

1. **Sıradaki en büyük eksik.** Ölçüm verimde bir kelime herkesten sık geçiyordu: bağ. 60'lar elbiselerinin arkasında fiyonk bağlanan kuşak, babydoll üstlerin boyun bağı, açık sırtı kapatan bağ, 54 fotoğrafın 13'ünden fazlasında bir tür kumaş bağı vardı. Düğme patını çizdikten sonra listenin tepesindeki öğe buydu. Bu oturumun tek işi: bağı çizmek.

2. **Bağın kendisi en basit parça.** Yine önce kitap açtım, Aldrich, Armstrong, bir de couture (Dior/Chanel kuşak işçiliği) ile high-street (Stradivarius/Bershka babydoll) pratiği. Sonuç şaşırtıcı derecede sade: bir bağ öz-kumaştan bir DİKDÖRTGEN. Bitmiş genişlik W ve uzunluk L istiyorsan, kesim dikdörtgenin (2W + dikiş payı) × (L + dikiş payı); boyuna ortadan katlayınca tüp kendi kendine astarlanıyor. Couture da high-street de aynı dikdörtgeni yapıyor, fark sadece kumaş. Bel kuşağının her yarısı, yandan arka ortaya fiyonk için ulaşsın diye, belin yarısı + tutturma payı kadar uzun.

3. **Asıl zorluk: sınırı çizmek.** Bir "bağ" görünce hepsini çizmek cazipti. Ama bir tuzak var: bir DRAWSTRING (büzgü ipi) düz bir bağ değildir. O bir kanaldan geçer ve kumaşı BÜZER, asıl işi büzmektir, bağlamak değil. Motorumun büzgü/shirring makinesi yok. Yani "drawstring büzgülü yaka"yı çizersem yalan söylemiş olurum: kullanıcıya düz bir bağ verir, oysa o parçanın kumaşı toplaması gerekiyor. Karar: basit uygulanan bağı (bel kuşağı, sırt bağı, boyun/ön fiyonku, manşet bağı) ÇİZ; drawstring-büzgülü türleri ÇİZME ve kullanıcıya açıkça "bunu çizemedim, elle ekle" de. Dürüst sınırı bilerek, kodda tek tek çizdim.

4. **Yine aynı disiplin: dokunma, ekle.** Bağ, motorun ana çizim koduna değil, çizim bittikten sonra çalışan opsiyonel bir ek adıma girdi, tıpkı düğme patı ve anahtar-deliği gibi. Bağ sadece yeni bir PARÇA ekliyor (kendi kesim dikdörtgeni, "cut 2", katlama + dikiş çizgileri + kumaş yönü) ve gövde parçasına küçük bir yerleşim işareti koyuyor; hiçbir mevcut çizgiye dokunmuyor. İddia etmedim, ölçtüm: bağ kapalıyken golden testi 23.034 satırda bit bit aynı (0.000000 mm).

5. **Kanıt ve gerçek sayı.** Kanıt: golden byte-be-byte aynı, 14 test yeşil (yeni bir tie testi dahil, bağ tam bir parça mı, dikdörtgen mi, işaret gövdeye kondu mu), hassasiyet 0.00 mm, 19.620 fuzz + 37.800 tarama 0 hata, baskı sayfalarında bağ şeridi gerçekten döşeniyor. Ve bu kez sayı BLOKE değil, kredi geldi. Canlı benchmark **11/54'ten 14/54'e** çıktı (+3). Artışın hepsi bağı tek eksik olan fotoğraflar: arkadan fiyonk bağlı iki Jackie elbisesi ve arka bağlı Emma üstü. Açık-sırt oyuğu olan tie-back elbiseler hâlâ "eksik", çünkü bağı çizdim ama oyuğu çizemem, ve hangi fotonun neden hâlâ eksik olduğunu tek tek biliyorum. İlerlemenin ölçüsü his değil, o sayı.

## Essay 8, "Bir puf kolu çizdim, sayım oynamadı, yine de bu bir kazanç" (puf/büzgülü kol başı)

1. **Sıradaki öğe: kabaran kol başı.** Ölçüm listemde puf ve büzgülü kol başı sık geçiyordu, omuzda hafifçe kabarıp yükselen o kol. Zaten motorumda "balon kol" vardı ama o BİLEĞİ büzer; puf kol BAŞINI (cap) büzer. İkisi bambaşka parça. Bu oturumun tek işi: gerçek puf kol başını çizmek, balon koldan çalıp geçiştirmemek.

2. **Önce kitap.** Aldrich, Armstrong, M. Müller & Sohn'un gigot (koyun budu) kolu, bir de couture (Dior/YSL balon-omuz) ile high-street (Zara/Bershka basit puf) pratiği. Tek DOĞRULANMIŞ değişmez şunu söylüyor: puf yaparken cap'i slash-and-spread ile ne kadar AÇARSAN, tam o kadar da YÜKSELTİRSİN. Genişlik ve yükseklik birlikte artar; fazlalık kol oyuğuna büzülerek girer, kol yine AYNI oyuğa oturur. Sade gathered kol yükseltmez (daha az kabarır), tam puf yükseltir. Formülü buradan çıkardım: gathered spread = genişliğin %20'si (yükseltme yok), puffed = %45 (yükseltme = spread kadar). Büzgü sadece crown'da, çentikler arasında; çentiklerin altı armhole ile bire bir.

3. **Doğru yerde büzülmeli, yoksa dikilmez.** Buradaki tuzak inceydi: bir kalıp doğrulayıcım var, kol başı yayı armhole'dan %1-9 fazlaysa "dikilir" der, dışındaysa reddeder. Ama puf kolun crown yayı KASITLI olarak çok daha uzun, o fazlalık EASE değil, GATHER (büzgü). Yani puf için o pencereyi olduğu gibi bırakırsam motor kendi puf kolunu "dikilmez" diye reddederdi. Doğrulayıcıyı puf farkındalıklı yaptım: gathered/puf başı için beklenen büzgü bandını kontrol ediyor, biceps zeminini yine koruyor. Yoksa doğru olan özelliği kendi kalite kapım bloklardı.

4. **Yine aynı disiplin: dokunma, ekle.** Puf, kolu çizen fonksiyona opsiyonel bir parametre olarak girdi. Kapalıyken (Plain) spread sıfır, cap aynı, yükseltme yok, mevcut düz kol kodu kelimesi kelimesine çalışıyor. İddia etmedim, ölçtüm: puf kapalıyken golden testi 23.034 satırda bit bit AYNI, 0.000000 mm. Puf açıkken kanıt: 14 test yeşil (sleeve testine puf bloğu ekledim, crown düzden geniş mi, puf yükseldi mi, gathered yükselMEdi mi, büzgü işaretleri var mı, doğrulayıcı temiz mi), render'da puf kol chord'u 460mm vs düz 317mm, tepe 255 vs 113, gerçekten omuzda yükseliyor.

5. **Sayı oynamadı, ve bunu söylüyorum.** Sonra 54 fotoyu ölçtüm: **14/54, değişmedi.** Neden? Bu sette puf/büzgülü kol başının TEK eksik olduğu foto yok. Kol büzgüsü geçen fotolar ya "cap sleeve" (o bir kısa-cap ŞEKLİ, büzgülü baş değil, dürüstçe çizmiyorum) ya da "drawstring gathered" (kanal/casing gerektirir, dürüstçe çizmiyorum). Kabiliyet gerçek, kanıtlı ve canlı; ama bu ölçüm setinin son boşluğuna denk gelmiyor. Bir özellik eklemek ile bir metriği oynatmak aynı şey değildir, ve sahte bir artış uydurmaktansa değişmeyen bir sayıyı nedeniyle göstermeyi seçiyorum. İlerlemenin en dürüst kanıtı bazen kımıldamayan bir sayının yanında duran net bir "işte neden"dir.

## Essay 9, "Bütün bir yaka ailesini çizdim, sayım oynamadı, ve bu bir strateji verisi" (yaka ailesi)

1. **Sıradaki öğe: yaka.** Ölçüm listemde yaka sık geçiyordu, dik, mandarin, yatık, bebe (peter pan), gömlek. Yaka bir parça ailesi olduğu için ikisini ayrı loop'a bölmek yerine tek oturumda kurdum: yaka parçası + yaka oyuğu eşleşme geometrisi ortak. Bu oturumun tek işi yakayı gerçekten çizmekti, en yakın türevle geçiştirmek değil.

2. **Önce kitap.** Aldrich, Joseph-Armstrong, M. Müller & Sohn + couture (Dior/Chanel tailored yaka, YSL) ile high-street (Zara/Bershka bebe yaka, gömlek yakası). İki temel: dik/mandarin yaka boyun çevresine dik bir BANT, önden içeri kıvrılıp (cfRise 15 mm) boynu sarar; yatık aile (bebe/gömlek) omuzlara yatan bir PARÇA, dış kenarı stilize (yuvarlak/sivri/fisto). Gömlek yakası iki parça: bant + üstüne kıvrılan yaprak.

3. **Yöneten kısıt: ölçülü eşleşme.** Bütün yaka ailesinde tek bir kural her şeyi yönetir: yakanın boyun (dikiş) kenarı = kalıbın boyun oyuğu uzunluğu. İddia etmedim, oyuğu, gövdenin bittiği bitmiş ön+arka parçadan DOĞRUDAN ölçtüm (motorun çizdiği aynı çizgi), yakayı o uzunluğa çizdim. Yani eşleşme inşadan geliyor, drift edemez. Testim beş yaka tipinde boyun kenarını yeniden ölçtü: sapma 0.0000 mm, standart/petite/plus bedende.

4. **Yine aynı disiplin: dokunma, ekle.** Yaka, motorun ana çizim koduna değil, çizim bittikten sonra çalışan opsiyonel bir ek adıma girdi, tıpkı düğme patı, bağ ve puf kol gibi. Yaka sadece yeni bir PARÇA ekliyor (kendi kesim notu, "cut 2 + tela") ve gövde oyuğuna küçük bir yerleşim işareti koyuyor; hiçbir mevcut çizgiye dokunmuyor. Kapalıyken golden testi 23.034 satırda bit bit aynı (0.000000 mm). Dürüst sınır: biye-bantlı oyuk ayrı parça değil, çizmiyorum, honest katmanında kalıyor.

5. **Sayı oynamadı, ve bu, körlemesine bir yenilgi değil, bir strateji verisi.** 54 fotoyu ölçtüm: 14/54, değişmedi. Ama bu kez oturuma sayının OYNAMAYACAĞINI bilerek girdim: manifest analizi gösterdi ki bu sette "tek eksiği yaka olan" foto YOK, yakası olan 9 fotonun her biri başka bir kümelenmiş öğeyle de tıkalı (peplum, büzgülü roba, çift-sıra düğme, drawstring kol, pinafore). Ölçüm bunu doğruladı: 9 fotonun HEPSİNDE yaka artık engel listesinden çıktı (sıfır sızıntı), ama her biri farklı bir sebeple hâlâ eksik. Yaka çizim yolu çalışıyor, kanıtlı ve canlı; sadece bu setin ödül dağılımı onu ödüllendirmiyor. Bu bir karar noktası: kümelenme yüzünden tek öğe eklemek sayıyı oynatmıyor, o yüzden sıradaki loop'lar aynı fotodaki İKİNCİ ve ÜÇÜNCÜ öğeyi (roba, peplum) hedeflemeli. İlerlemenin en dürüst kanıtı bazen kımıldamayan bir sayının yanında duran net bir "işte neden ve işte sırada ne var"dır.

## Essay 10, "İlk kez marjinal kazanca göre seçtim, ve tahmin +6 dedi, gerçek +5 çıktı" (drawstring/shirred büzgü)

1. **Sıra değişti: frekanstan marjinal kazanca.** Yedi loop boyunca en sık eksik öğeyi seçiyordum. Ama sayım donmuştu: kümelenme yüzünden tek öğe eklemek fotoyu TAM yapmıyordu, çünkü çoğu foto 2-3 eksikliydi. Bu oturumda pusulayı değiştirdim: hangi öğe eklenirse EN ÇOK foto tam kalıba geçer? Offline analiz drawstring/shirred büzgüyü işaret etti, tahmini +6. İlk kez bir öğeyi "en sık" diye değil, "en yüksek kaldıraç" diye seçtim.

2. **Büzgü, fırfır değil.** Ayrımı netleştirmek önemliydi: fırfır AYRI bir şerittir; büzgüde panonun KENDİSİ geniş kesilip toplanır. Babydoll/milkmaid ailesinde boyun kenarı bir kanaldan (ip büzgü) ya da büst/roba panosu lastikli sıralardan (shirred) toplanıyor. Aldrich + Armstrong + M. Müller + ASG smok rehberi: kesim genişliği = bitmiş kenar × oran; oran ip 1.8, lastik 2.0, smok 3.0.

3. **Yöneten kısıt yine ölçülü eşleşme.** Panonun toplanacağı bitmiş kenarı motorun az önce çizdiği boyun oyuğundan birebir ölçtüm (yaka bloğundaki aynı boyun-noktası taramasıyla), pano diktiği yere göre otomatik doğrulanıyor. Test kesim/oran = bitmiş kenar eşitliğini 0.005 mm'ye kadar teyit ediyor. İp büzgüde ayrıca bir kanal (iki paralel çizgi + iki kordon deliği) ve ayrı bir kordon parçası; shirred/smokta paralel büzgü sıraları çiziliyor.

4. **Yine dokunma, ekle.** Büzgü, çizim bittikten sonra çalışan opsiyonel bir ek adım (GatherBlock), düğme patı/bağ/puf/yaka ile aynı desen. Kapalıyken golden 23.034 satırda bit bit aynı, 0.000000 mm; 16 test yeşil (yeni gather testi dahil). Dürüst sınır: kol büzgüsü (kola kanal gerekir) ve gerçek couture el-smoku (elde işlenen dokusal nakış) hâlâ "çizemedim" diyor, pano × 3 + smok noktaları veriyorum, dokuyu değil.

5. **Tahmin +6 dedi, gerçek +5 çıktı, ve bu, metriğin dürüstlüğü.** Ölçtüğümde marjinal kazanç +6 değil +5 çıktı. Sebep öğreticiydi: analizim Priscilla babydoll'u da "büzgü çizilince tam olur" diye saymıştı, ama Priscilla'nın İKİ eksiği var, drawstring boyun VE fırfırlı askı. Büzgüyü çizdim, askı hâlâ eksik, foto tam olmadı. Yani kümelenme benim kendi tahminimi bile bir foto kadar şişirmişti. Bunu saklamıyorum: tahmin bir tavandır, ölçüm gerçektir, aradaki fark kümelenmenin ta kendisidir. Öğe-doğruluk metriği (kaç öğe çizilebiliyor) yine de artıyor, çünkü Priscilla'nın büzgüsünü de çiziyorum, sadece o fotonun ikinci eksiği kapanana kadar TAM sayılmıyor. İlerlemenin en dürüst kanıtı, kendi iyimser tahmininle gerçek ölçümünü yan yana koyup farkı açıklayabilmektir.

## Essay 11, "Açık sırtı çizdim, +3 aldım, kaçan +1'i saklamadım" (open-back cutout)

1. **İki eksikli fotoyu ikinci öğesinden avlamak.** Geçen loop'ta öğrendiğim şuydu: bu sette çoğu foto 2-3 eksikli, o yüzden tek öğe eklemek sayıyı oynatmıyor. Bu oturumda marjinal kazancı en yüksek ikinci öğeyi seçtim: açık sırt oyuğu (+4 tahmin). Kritik olan, bu oyukların çoğunun tie-back elbiselerde olması, bağı Loop 4b zaten çiziyordu, geriye sadece oyuk kalmıştı. Yani aynı fotonun ikinci eksiğini kapatmaya gittim.

2. **Açık sırt = keyhole'un sırt hâli.** Referans couture sırt dekoltesi (Dior/YSL backless) + high-street backless (Zara/Bershka) + Aldrich/Armstrong. Ortak kural: oyuk boyun deliğinden değil, nape'ten 40mm aşağı başlar, omuzda kumaştan bir yoke kalır, giysiyi o asar, yoksa elbise düşer. Oyuğu kâğıttan kesmiyorsun; sırt parçasına dikiş çizgisi olarak işaretliyorsun, üstüne şekilli bir facing dikip içeriden yarıp çeviriyorsun. Dört şekil: yuvarlak, düşük-V, kare, damla (keyhole-back).

3. **Yöneten kısıt yine ölçülü eşleşme.** Facing'i oyuğun tam kopyasını marking olarak taşıyacak şekilde çizdim: sırta çizilen oyuk çizgisiyle bit-bit aynı, sapma 0.00mm. Bu şu demek, facing kapattığı delikten asla kayamaz, çünkü ikisi tek bir çizgiden türüyor. Oyuk sırt katına (CB fold, x=0) karşı YARIM çiziliyor; sırt parçası CB dikişiyle "cut 2" olduğu için o yarım, dikişte aynalanıp tam simetrik oyuğa açılıyor, keyhole'la aynı kat mantığı.

4. **Yine dokunma, ekle, ve çakışma yok.** Açık sırt, çizim bittikten sonra çalışan opsiyonel bir ek adım (OpenBackBlock), düğme patı/bağ/puf/yaka/büzgü ile aynı desen. Kapalıyken golden 23.034 satırda bit bit aynı, 0.000000 mm; 17 test yeşil (yeni açık-sırt testi dahil). Önemli detay: Loop 4b tie-back bağı ile ÇAKIŞMIYOR, Tie Back elbisesinde hem bağ hem oyuk var, ikisi bağımsız enum, bağımsız ek adım, ikisi de aynı kalıba çıkıyor. Bir fotonun iki farklı öğesini iki farklı loop kapatabiliyor, birbirini ezmeden.

5. **Kuyruk +4 dedi, gerçek +3 çıktı, ve kaçan +1 tam belli.** 54 fotoyu ölçtüm: 19'dan 22'ye, +3. Jana (düşük açık sırt) ve iki Tie Back (kapak + önden) tam kalıba geçti. Eksik +1 nerede? Üçüncü Tie Back fotosunda (polka, sırt görünümü) vision yakayı "halter" okumuş, manifest "boat" bekliyor, motor oyuğu ve bağı çiziyor, oov temizlendi, ama yaka alanı yanlış olduğu için foto TAM sayılmıyor. Bu bir motor kusuru değil, saf vision varyansı; oyuk geometrik olarak orada, üçüncü foto da geometri olarak tam-hazır. Arielle ise kümelenmiş: yan dikiş cebi çizemiyorum, oyuğu çizdim ama cep eksik kaldı. Öğe-doğruluk 48'den 53'e (%51.5). İlerlemenin en dürüst kanıtı, tahminini (+4) gerçekle (+3) yan yana koyup kaçan +1'in tam olarak hangi fotoda, hangi sebeple kaldığını gösterebilmektir, motor mu vision mı kümelenme mi, ayırt ederek.

## Essay 12, "Motoru suçluyordum, katmanları ayırınca suçlu dil çıktı" (layer denetimi + vision pivotu)

1. **Sayı %40'ta çakıldı ve refleksim yanlıştı.** Benchmark'ım haftalardır aynı bölgede: 58 gerçek ürün fotoğrafından ~22'si tam kalıba dönüşüyor. Refleksim hep aynıydı: motor daha çok şey çizsin. Dört loop üst üste kabiliyet ekledim, puf kol, yaka ailesi, büzgü, açık sırt. Sayı ya hiç kımıldamadı ya tahminin altında kaldı. Bir şey yanlıştı ama ne?

2. **Teşhisi mümkün kılan şey mimarinin katmanlı olmasıydı.** Bağımsız bir denetimle projeyi katman katman açtım: L1 vision (fotoğrafı okuyan), L2 köprü (okumayı spec'e çeviren), L3 motor (spec'i çizen C++), L4 çıktı (A4'e döşeyen). Denetim mimariyi temiz buldu, çorba yok, sözleşmeler tipli. Ve tam da bu yüzden her hatayı TEK bir katmana atfedebildim. Katmanlama süs değil; "hata nerede doğdu" sorusunun cevaplanabilir olması demek. Spagetti bir projede bu teşhis mümkün olmazdı çünkü hatanın doğum yeri diye bir şey olmazdı.

3. **Etiketleyince tablo ters döndü: suçlu motor değil, katmanlar arası DİL.** 7 yanlış kalıbın 6'sı motorun değil, vision'ın kelime kararsızlığı, aynı elbiseye bir fotoda "square", ötekinde "halter" diyor; motor o yanlış spec'i kusursuz çiziyor. 27 eksik kalıbın hepsi "engine cannot draw X", vision öğeyi görüyor, kelimeyi yazıyor, motorun sözlüğünde o kelime yok. Ve birkaç alan köprüde asılı: L1 okuyor, L2 motora hiç bağlamıyor. Üç katman da kendi içinde sağlam; aralarındaki ortak dil eksik ve kararsız. En acı kanıt: açık sırt oyuğunu VE bağı çizdiğim bir foto, vision yakayı yanlış okuduğu için hâlâ "yanlış" sayılıyor.

4. **Pivot: motor cilalamayı bıraktım.** Yeni kuyruk V→K→M: önce vision kararlılığı (ucuz, risksiz, asıl fren), sonra köprü delikleri, en son motor. Üç loop hazır, her biri TEK oturumda koşuyor, bitince skor tablosuna bir satır ve bir bar ekliyor, FULL, öğe-doğruluğu, vision-accuracy yan yana, kaynağı ölçüm dosyası. Tahmin değil, grafik.

5. **Ders: sayı kımıldamıyorsa daha çok itme; nereye ittiğini ölç.** Dört loop boyunca doğru şeyi yanlış katmana yaptım. Kabiliyetler gerçekti, kanıtlıydı, ve yanlış adresteydi. Mimariyi katmanlara ayırmanın getirisi hız değil, teşhis edilebilirlik, sistemin sana "sorun bende değil, komşuda" diyebilmesi. Benim sistemim bunu haftalardır söylüyordu; ben motoru parlatmakla meşguldüm.

---

## Essay 13, "Düzeltmeden önce etiketledim: 7 hatanın 5'i tek kelime" (V0 vision taksonomisi)

1. **Bir loop'u hiçbir şey düzeltmeye ADAMADIM.** Pivottan sonra ilk refleks "hadi yakayı düzeltelim" olurdu. Yapmadım. Çünkü nereye nişan aldığımı ölçmeden atış yapmak, tam da haftalarca yaptığım hataydı. Bu loop'un tek işi vardı: son ölçümdeki her yanlış ve eksik kalıbı etiketlemek, bu hata vision'dan mı, motordan mı, köprüden mi doğdu? Ve bir baseline sayısı bırakmak. Sıfır kod düzeltmesi, sıfır prompt değişikliği. Sadece harita.

2. **İlk sürpriz: diskteki sayı yalan söylüyordu.** Ölçüm dosyasındaki eski etiketler iyimserdi, bellekte yeniden sınıflandırılıyor ama diske hiç yazılmıyordu. Güncel motor sözlüğüyle baştan sınıflandırınca gerçek tablo çıktı: 54 fotoğrafın 22'si tam kalıp, 24'ü motor eksiği, 7'si vision hatası. "Bitti" demeden önce diski değil belleği okumak, küçük ama pahalı bir ders.

3. **Etiketler tek bir yere yığıldı: yaka.** 7 vision hatasının 5'i aynı alan: neckline. Ve daha keskin bir örüntü: aynı ürünün ön ve arka fotoğrafını vision iki ayrı elbise gibi okuyor. Ön "boat" diyor, arka "halter"; ön "crew", arka "vNeck". Nape'teki bir fiyonk ya da sırt oyuğu halter/vNeck yaka sanılıyor. 11 çok-fotolu üründen 8'i en az bir kritik alanda kendiyle çelişiyor, 15 alan-çelişkisi, 5'i yaka. Suçlu tek: arka görünüm fotoğrafı, önü eziyor.

4. **Yeni bir metrik doğurdum: vision-accuracy.** FULL sayısı motoru suçluyor (çizemediği kümelenmiş öğeler). Vision katmanını izole eden bir sayı lazımdı: kritik alanları (yaka, şekillendirme, siluet, kapanma) manifest'le eşleşen fotoğraf oranı. Baseline: 46/53 = %86.8, yaka yanlış-okuması 5. Bu sayı LOOP 2'nin "önce" değeri; benchmark script'ine üçüncü özet satırı olarak ekledim, DRAWN_SINCE mantığına dokunmadan.

5. **Ders: taksonomi sıkıcıdır ve en değerli loop'tur.** Hiçbir şey "yaptım" hissi vermedi, ne yeni kabiliyet, ne kımıldayan FULL. Ama artık LOOP 2 körlemesine değil: dosya adlarıyla 5 hedef fotoğraf, tek alan, tek kural. Bir sonraki oturum "yakayı düzelt" diye başlamayacak; "bu 5 fotoğraftaki yakayı düzelt, before=46/53" diye başlayacak. Ölçmeden düzeltmek cesaret değil, savurganlık.

---

## Essay 14, "Yama notlarını satmıyorum, bağ kuruyorlar: siteyi vişneden bebek mavisine, satıştan beta'ya çevirdim" (vitrin loop)

1. **Sorun içerik değildi, yerleşimdi.** Benchmark sayfası vardı, API sayfası vardı, 0.00 mm kanıtı vardı, hepsi sitede duruyordu. Ama ben, geliştiricisi, siteye bakınca bulamıyordum. Müşteri hiç bulamazdı. Yeni bir özellik icat etmek değil, var olanı görünür kılmak gerekiyordu. Bu loop tek bir şey yaptı: bilgi mimarisini düzeltti.

2. **League of Legends'ten çaldığım fikir: yama notları.** LoL her değişikliği yama notu olarak yazar ve oyuncu bunu OKUMAYA gelir. Benim benchmark tarihçem zaten hazır yama notu malzemesiydi, dürüst, sayılı, "+4 dedik +3 çıktı, kaçan +1 şu fotoda" diyen bir tarihçe. Bunu siteye hiç koymamıştım. Koyunca ürün "canlı ve gelişiyor" hissi verdi. patches.html: 1.0'dan 2.0'a on iki yama, her biri sayı öncesi→sonrası, ve en önemlisi her birinin altında dürüst not, sayının KIMILDAMADIĞI yamalar dahil (yaka ailesi +0, çünkü o sette yaka tek başına eksik değildi). Kaçırdığını gizleyen bir araç dürüst bir kıyaslama yayınlayamaz; kaçırdığını yayınlayan bir araç güven satar.

3. **Renk dünyasını çevirdim ama yerleşimi çevirmedim.** Damla'nın kararı netti: vişnenin yerleşimi ve Didot tipografisi güzeldi, ona dokunma, sadece rengi değiştir. Bu bir redesign değil, RESKIN. Vişne #8f2038 gitti, bebek mavisi geldi; metin beyazdan lacivere döndü (kontrast şart, WCAG AA). Pötikare duvar kağıdını sadece girişe, mail toplanan hero'ya, sakladım; diğer her bölüm ve sayfa sakin beyaz-mavi. Kompozisyonun ruhunu bozmadan bir markanın tenini değiştirmek, sıfırdan tasarlamaktan zordur: neyin dokunulmaz olduğunu bilmek gerekir.

4. **Fiyatı kaldırdım. Şimdilik.** Sitede $19/$49 rakamları vardı. Karar: beta önce, satış sonra. Rakamları kaldırdım, "beta partners: free while we build" çerçevesine çevirdim. Sitenin tek dönüşüm metriği artık waitlist kaydı, hero'daki birincil CTA "join the beta", gerçek /api/waitlist endpoint'ine bağlı, canlıda HTTP 200 ile doğruladım. Fiyat rakamları kaybolmadı; rapora saklandı. Bir ürünü satmadan önce, birinin onu istediğini kanıtlaman gerekir.

5. **Ders: görünmeyen kanıt kanıt değildir.** Haftalardır motorun doğruluğunu ölçüp yayınlıyordum, ama yayınladığım yer kimsenin bakmadığı bir sayfaydı. Mühendislik işinin yarısı doğru olanı yapmak; diğer yarısı doğru olanı görünür kılmak. Yama notları bunu tek hamlede çözdü: hem bilgi mimarisini düzeltti, hem de tarihçemi, dürüstlüğü dahil, ziyaretçinin waitlist'e yazılma sebebine çevirdi.

---

## Essay 15, "Tek kelimelik bir kural, tam-kalıp sayısını ikiye çıkardı: yaka belirsizliğini prompt'la çözdüm" (LOOP 2 / patch 2.2, V1 neckline)

1. **Ölçüm loop'u bana adresi vermişti.** Bir önceki loop (V0) hiçbir sayı kımıldatmamıştı ama en değerli işi yapmıştı: yakayı işaret etti. 7 vision hatasının 5'i tek alan, neckline, ve hepsi aynı örüntü: bir ürünün ön yüzü doğru okunuyor, arka/giyilmiş fotoğrafı yakayı uyduruyor. Bu loop körlemesine başlamadı; elimde dosya adlarıyla 5 hedef fotoğraf, "önce" değeri 46/53, ve tek cümlelik bir hipotez vardı.

2. **Kök neden mekanikti, sihir değil.** Vision aynı elbisenin önünü ve arkasını iki ayrı kıyafet gibi okuyordu. Nape'teki bir fiyonk "halter" oluyordu; sırttaki bir oyuk "vNeck". Çünkü prompt yakayı hangi yüzden okuyacağını söylemiyordu, model arka fotoğrafa bakıp önde olmayan bir yaka icat ediyordu. Motor o yanlış spec'i kusursuz çiziyordu; suç motorun değildi, kelimenindi.

3. **Dört cümlelik bir kural bloğu.** worker.js prompt'una ekledim: (a) yakaya ÖNden karar ver, ürünün tek yakası var; (b) fotoğraf arka görünümse, önde olmayan bir yaka uydurma, nape'teki fiyonk/oyuk arka detaydır, halter değil; (c) halter SADECE boyna dolanan bir bant görünüyorsa; (d) emin değilsen dramatik bir biçime (kare/vNeck) uzanma, sık görülen boat/crew/scoop'a düş. Sıfır C++, sıfır motor kodu. wrangler deploy.

4. **Kanıt: canlı, aynı koşullar, before/after.** 59 fotoğrafı taze koşturdum (FAST token, 8dk20sn). Yaka yanlış-okuması 5→2. Vision-accuracy %86.8→%94.4. Ve asıl ödül: FULL 22→24. Üç arka görünüm düzeldi, fiyonklu Mira arkası artık yakayı doğru bırakıyor, gingham arkası "crew", polka Tie Back arkası "boat" (bu FULL'a geçti). Regresyon bekçisi: FULL düşseydi geri alacaktım; yükseldi, kalıyor.

5. **Ders: en pahalı +2 motor değil, kelimedir.** Aylarca motora kabiliyet ekledim, puf, yaka, açık sırt, ve FULL kımıldamadı çünkü asıl fren vision'ın kararsızlığıydı. Dört cümle, sıfır kod riski, +2 tam kalıp. Kalan iki yaka hatası artık arka görünüm karışıklığı değil, gerçekten belirsiz ÖN çekimler, bir metin düzeltmesinin dürüst tavanı. Bir sonraki adım burada değil: ön/arka aynı ürünü grupla (V3).

## Essay 16, "Bir değişikliği ölçtüm, doğru çıktı, yine de geri aldım" (LOOP 3 / patch 2.3, V3 ön/arka, REVERTED)

1. **Doğru içgüdüyle başladım.** Vision hâlâ aynı elbisenin arkasını, giyilmiş halini, düğme yakın-çekimini ayrı okuyup önde olmayan alanları uyduruyordu: bir arka fotoğraf "square" yaka, bir makro çekim "vNeck" biçim. LOOP 2 yakayı büyük ölçüde çözmüştü ama biçim, bel, etek hâlâ çelişiyordu, V0'da 15 çelişki vardı, 2.2 sonrası 8'e inmişti. Kural açıktı: bir arka/kısmi görünümde önden okunan alanları (yaka, biçim, bel, etek kesimi) tahmin etme, null bırak. Null zaten kalıbın tolere ettiği dürüst cevap.

2. **İki cümle ekledim, deploy ettim, ölçtüm.** worker.js prompt'una: "kısmi görünümde önden okunan alanları null bırak; tek elbise, tek okuma." Sıfır C++, sıfır motor kodu. Canlı FAST koşu, aynı 59 fotoğraf, aynı koşullar. Vision doğruluğu %86.8'den %87.0'a çıktı, kural tam istediğim şeyi yaptı: JACKIE arkası yakayı artık uydurmuyor, Priscilla giyilmiş foto önü boş bırakıyor.

3. **Ama FULL düştü: 24 → 21.** Sebebi kaba bir gerçek: bu benchmark her fotoğrafı tek tek ölçüyor ve manifest arka fotoğrafı elbisenin ÖN yakasıyla etiketliyor. Yani vision dürüstçe "önü göremiyorum, null" dediği an, benchmark, şanslı doğru tahmini ödüllendiriyordu, bir puan kaybediyor. İçgüdü doğru, ölçüm onu cezalandırıyor.

4. **Regresyon bekçisi çalıştı, geri aldım.** Kuralım netti: FULL düşerse değişiklik geri alınır ve raporlanır. worker.js'i 2.2'ye döndürdüm (git diff temiz, byte-birebir), yeniden deploy ettim, results dosyasını dürüst 2.2 baseline'ına geri yükledim. Yayınlanan sayı 24/54 kalıyor. Yama notunu da "geri alındı" olarak yayınladım, kaçanlar dahil.

5. **Ders: her düzeltme prompt düzeltmesi değildir.** LOOP 3'ün gerçek çıktısı +N değil, bir kanıt: kalan ön/arka çelişkiler bir prompt sorunu değil, bir ÖLÇÜM artefaktı. Doğru kaldıraç (b), ölçüm tarafında aynı ürünün ön+arka+detay fotoğraflarını grupla, alan bazında çoğunluk oyu al ki arkadaki bir dürüst null önün gerçek okumasıyla örtülsün. Ve bu deney V4'ün (güven eşiği) lehine somut kanıt: dürüst bir null şu an cezalanıyor. Bazen bir loop'un işi bir özellik değil, bir sonraki loop'un doğru yerde durması.
