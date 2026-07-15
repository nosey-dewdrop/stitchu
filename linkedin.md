# linkedin.md — build-in-public essay stoğu
> Format (Damla): numaralı inşa zinciri, her adım bir KARAR (ne + neden + sonuç). 300-500+ kelime, Türkçe, dürüst — downfall ve pivot saklanmaz. Büyük dönüm noktası başına ayrı essay. Yazının kendisi Damla'nın ağzından; bunlar iskelet/malzeme. Her cümle gerçek git geçmişinden; sayılar test/motor çıktısı. Reels versiyonları devlog.md'de, projeye bağsız genel konular ~/damla_projects_2026/damla-icerik.md'de.

---

## Essay 1 — "Mükemmel çalışan gereksiz motor" (başlangıç + slopware itirafı)

1. **Başlangıç.** Bir elbise fotoğrafı çekiyorsun, sana kendi bedenine göre dikiş kalıbını çiziyorum, gerçek ölçekli A4 basıyorsun, diktiriyorsun. İlk sürümü iOS'ta yazdım: ölçü modeli, onboarding, bir de parametrik etek bloğu. Güzel çalışıyordu.

2. **İlk itiraf.** Ve tamamen gereksizdi. Çünkü ilk motorum sadece etek çiziyordu — ve bir etek kalıbı iki dikdörtgendir, onu herkes kendi çizer. "Yaptım" dediğim şey, kimsenin isteMEYECEĞİ bir şeydi. Bu projenin ilk anayasa maddesi buradan doğdu: **motor sadece insanın KENDİ ÇİZEMEDİĞİ şeyi çizecek.** Kavisli prenses dikişi, kol oyuntusu, yaka pervazı, dikiş payı. "Etekten motor olmaz."

3. **İkinci karar — matematiğim doğruydu ama kimse dikemiyordu.** Klasik kalıp kitapları göğüs bolluğunu pens (dart) ile alır. Teoride doğru. Ama pensin sivri ucu ev dikişçisinin elinde kötü dikiliyor; onlar prenses dikişi diker. Pivot: varsayılan şekillendirme prenses paneli oldu, pens "ileri seçenek"e düştü. Ders: doğru matematik, dikilemiyorsa yanlış üründür.

4. **Üçüncü karar — gizliliği politika değil mimari yaptım.** Vücut ölçüsü hassas veri. "Sunucuya göndermiyoruz, söz" demek yerine motoru C++ yazıp WebAssembly'ye derledim ve tarayıcının İÇİNE koydum. Kalıp senin cihazında, senin işlemcinde çiziliyor. Ölçülerin teknik olarak dışarı çıkamıyor. Ve yan etki: bin kullanıcı da gelse sunucu maliyetim sıfır. Mimari karar, fiyat etiketinin ta kendisi oldu.

5. **Dürüstlük altyapısı.** Her kod değişikliğinde motor 60.300 elbise çiziyor (15 vücut tipi × bütün yaka/kol/etek/bel/kumaş kombinasyonları). Tek ölçüde çalışan kalıp demo, her ölçüde çalışan kalıp üründür. Üstüne golden test: bilinen girdilerin çıktısını dosyaya donduruyorum, her değişiklikten sonra byte byte karşılaştırıyorum. Yeni yaka eklerken eski elbise formülü bir bit oynarsa test kırmızı yanıyor. "Yeni şey ekle, eskiye dokunma" bir niyet değil, makine denetimi oldu.

6. **Neden anlatıyorum.** Çünkü ilk sürümüm iyi görünen, çalışan, ama işe yaramaz bir slopware'di. Onu itiraf edip anayasa çıkarmasaydım, üstüne özellik yığıp güzel bir hiçlik inşa edecektim. Bir ürünün değeri "çalışıyor mu" değil, "insanın kendi yapamadığı neyi yapıyor" sorusunda saklı. Etek çizen motor çalışıyordu. Kimse istemiyordu. İkisi ayrı sorular.

---

## Essay 2 — "Testlerim yeşildi, ürünüm bozuktu" (adversarial denetim gecesi)

1. **Yanlış güven.** Motorumun 60 bin taslaklık matrisi vardı ve hepsi yeşildi. Ben "sağlam" diyordum. Sonra bir gece motoru kendime karşı kışkırtmaya karar verdim: Dior terzisi, CS dekanı, VC ve Kate Middleton gözüyle her turda en sert eleştiriyi bul, veriyle düzelt, kanıtla. Sonuç sarsıcıydı: yeşil testler bozuk ürünü gizliyordu.

2. **Kol pazıya sığmıyordu.** Takma kol oyuntuya sadece UZUNLUKLA oturuyordu; genişlik hiç kontrol edilmiyordu. Dolgun kollu bir vücutta kol pazıdan 76 mm dardı — koltuk altı fiziken kapanmazdı. Matris bunu kaçırdı çünkü tek kontrolü cap uzunluğuydu, onu da zaten arama algoritması çözüyordu. Test, kendi kör noktasını test ediyordu.

3. **Kendi fix'im fazla düzeltti.** Kolu pazıya zorlayınca, göğsü dolgun + sırtı kısa vücutta (çok yaygın "petite-full") bu sefer cap payı %46'ya fırladı ve validator kalıbı TAMAMEN reddetti — yani o kadın hiç kollu kalıp alamıyordu. Matris yine kaçırdı, çünkü bütün test vücutlarım büst ve sırt boyunu BİRLİKTE ölçekliyordu. Self-referential bir kör nokta. Gerçek terzilik çözümü: dolgun kola koltuk altını indirmek. Oyuntuyu pazıya göre derinleştirdim, bele değmeyecek şekilde clamp'ledim.

4. **İmkansız vücut sessizce bozuk kalıp basıyordu.** Göğüs 160 / bel 45 gibi imkansız ölçülerde motor ya 8 şifreli geometri hatası veriyordu ya da — daha kötüsü — doğrulamayı geçip sessizce bozuk bir kalıp basıyordu. Tek net kapı koydum: oranlar imkansızsa "ölçülerini kontrol et" diye tek okunur sebep.

5. **Benchmark hile yapıyordu.** En sert ders. Rakiplerin yayınlamadığı doğruluk sayılarını yayınlayacaktım — moat buydu. İlk benchmark'ım dikiş uçlarının 0.00 mm eşleştiğini "kanıtlıyordu". Sonra fark ettim: aynı trued sayıyı iki kez okuyup birbirinden çıkarıyordu. x − x = 0. Kanıt değil, totoloji. Çizilen gerçek geometriden baştan yazdım; şimdi bağımsız ölçümle maksimum sapma 0.000023 mm. Aynı sebeple güvenilmez bir bust ölçümünü de attım.

6. **Ders.** "Testlerim geçiyor" cümlesi bir ürünün doğru olduğunu SÖYLEMEZ; sadece testlerimin sorduğu soruların cevaplandığını söyler. Testler benim yazdığım sorular — ve ben yanlış soruları sorabilirim. Yeşil ekran huzur verir, huzur tehlikelidir. O gece 6 gerçek fit bug'ı kapattım, hepsi test+guard'lı. En değerli çıktı kod değil, alışkanlıktı: ürününü seven değil, ürününe düşman gibi bakan gözle test et.

---

## Essay 3 — "Yenilik değil kanıt: moat neden benchmark" (iş modeli)

1. **Korkulu soru.** "Neden insanlar buna para versin?" Araştırdım ve dürüst cevap ilk başta moralimi bozdu: ben ilk değilim. StitchLift diye bir ürün tam aynı pitch'i satıyor — fotoğraf→kalıp, ayda 34-49 dolar, grading'i de var, shipped. Pazar kanıtlı (Etsy'de made-to-measure kalıp satan biri 26.7 bin satış yapmış). Yani "olur mu" sorusu yok; soru "senin farkın ne".

2. **Açık kapı.** StitchLift satıyor ama bir şeyi YAPMIYOR: doğruluk iddiasını kanıtlamıyor. Benchmark yok, dikilmiş-test yok. Kalıbın gerçekten bedene oturduğunu kimse ölçüp yayınlamıyor. Bir fit anketinde 688 kişinin bir numaralı şikayeti "orantısız grading", ikincisi "kol dar" — ikisini de o gece motorumda düzelttim. Demek ki moat yenilik değil: aynı işi yapıp DOĞRULUĞUNU kanıtlamak.

3. **Motoru API yaptım.** "Para kazanmak istiyorum, API'laştıralım" dedim. Aynı C++ motoru Cloudflare Worker'ın içinde koşturdum — tarayıcı sürümü wasm'ı fetch'liyordu ama worker'da o yol yok, ayrı derleyip precompiled wasm'ı motora elle verdim. Sonuç: `POST /api/draft`, giriş doğrulama, bozuk kalıp yerine "422 undraftable + sebep", çağrı başına LLM maliyeti SIFIR. Satılabilir bir çekirdek. Bir güvenlik denetiminden sonra sertleştirdim: dokümandaki yalanı, reddedilen taslağın yanlış cache'lenmesini, spoof'lanabilir beden sınırını düzelttim.

4. **İki referans, iki iş modeli.** Damla 700 TL verip bir rakibin (elle Illustrator'da kalıp çizip Etsy'de satan bir terzi) gerçek ürününü satın aldı. Didik didik ettik. Onun günlerce elle yaptığının ~%80'i motorda otomatik ya da verisi hazır. Dahası: onun kalıbında "eski sürüm dardı, müşteri şikayetiyle düzelttim" notu vardı — elle ease kararının hata payını itiraf ediyor. Benim motorum ease'i parametrik ekliyor, o hata sınıfını yapı olarak yapamaz. İki iş modeli birden açıldı: (A) SaaS sat, (B) motorla kalıp üretip Etsy'de sat.

5. **Kapanmayan boşluk — dürüstçe.** Rakibin benden TEK üstünlüğü kalıp değil, SUNUM: güzel flat sketch, 13 sayfalık illüstre talimat, kapak tasarımı. Ve benim çıktımın gerçek bir kusuru var: sayfaları yan yana koyunca puzzle gibi tam birleşmiyordu — kenar hiza işaretleri eksikti. Onu da rakibin sistemine bakarak onardım: sayfa çerçevesi, köşe register kareleri, grid kodları, "→ B2" devam okları. Ama sunum boşluğu (illüstre talimat, flat sketch) hâlâ açık; onu saklamıyorum, yol haritasında.

6. **Ders.** Bir pazarda ilk olmak zorunda değilsin. İlk olamıyorsan, herkesin söyleyip kanıtlamadığı şeyi KANITLA. İddia herkesin; ölçüm cesaret ister. Benim moat'ım tek cümle: rakiplerin yayınlamadığı doğruluk sayısı + cihazda gizlilik + sıfır maliyetle undercut. Ve bunu söylemenin tek dürüst yolu, önce kendi benchmark'ımın hile yapmadığından emin olmaktı.

---

## Essay 4 — "Sayı değişmedi ve buna sevindim" (dürüst ilerleme)

1. **58 gerçek fotoğraf.** Bir noktada "yaptım" demeyi bırakıp ölçmeye karar verdim. 58 gerçek Etsy elbise/bluz fotoğrafı için el emeğiyle "ground truth" (doğru cevap) hazırladım ve bütün zinciri — fotoğraf → yapay zeka okuması → motor kalıbı — ölçen bir script yazdım. Amaç: "ilerliyorum" hissini değil, sayıyı görmek.

2. **İlk gerçek sayı: 54 tam kalıptan 6.** Acı ama net. Ve teşhis daha da net: yapay zeka düğmeyi, yakayı, korseyi ÇOĞUNLUKLA doğru görüyor — ama gördüğünü serbest bir cümleye yazıyor ("düğmeli, hakim yakalı"), motorun sözlüğünde ise "düğme patı" diye bir formül yok. Yani göz var, el yok, ortadaki boru taşımıyor. Kullanıcının "düğmeyi görmüyor" hissinin gerçek mekanizması buydu: görüyor, kullanamıyor.

3. **Bir loop, sayı değişmedi.** Bir sonraki oturumda görü çıktısını yapısal alanlara taşıyan bir köprü kurdum — ama tam kalıp sayısı 6/54'te KALDI, çünkü motor o öğeleri hâlâ çizmiyor. Ve buna sevindim. Çünkü değişmemesi doğruydu: sadece boruyu döşedim, eli henüz eklemedim. Sayıyı sahte yükseltmemek için ayrı bir istatistik ekledim: "yapısal alanlar, çizilemeyen öğeyi kaç fotoda YAKALADI". Ürün sayısı ile kabiliyet sayısını AYRI ölçmek, kendime "ilerliyorum" yalanını söylememenin tek yolu.

4. **Motoru kitaplara karşı yargıladım.** Motorun her bloğunu iki yayınlanmış standarda (Aldrich, Armstrong) karşı denetledim. Kural sertti: bir formülü ancak İKİ kaynak BİRDEN aynı değerde diyorsa ve motor net yanlışsa değiştir. Sonuç: değiştirilen formül sayısı SIFIR. Her sapma ya tek kaynaklıydı, ya savunulabilir bir bant içindeydi, ya zaten "ASSUMPTION" olarak işaretliydi. Uydurmamak için hiçbir şeye dokunmadım — ve bunu bir başarı sayıyorum, çünkü tek kaynağa dayanıp "düzelttim" demek en kolay yalandı.

5. **Ders.** İlerlemenin en dürüst kanıtı, bazen değişmeyen bir sayıdır. Herkes grafiğini yukarı çizmek ister; ama gerçek mühendislik, sayının HANGİ nedenle sabit kaldığını bilmektir. Ben "6'da kaldım" diyebiliyorum çünkü 6'nın neden 7 olmadığını gösterebiliyorum. Pazarlama sayıyı büyütür; ürün sayının doğrusunu söyler. Bir gün bu 6, gerçekten motor eli eklendiğinde büyüyecek — ve o zaman büyüdüğüne güvenebileceğim, çünkü şimdi büyütmedim.

## Essay 5 — "Ürünüme yalan söyletmeyi bıraktım" (sessiz fallback)

1. **Bir ürünün en sessiz yalanı.** Motorum bir fotoğraftan dikiş kalıbı çıkarıyor. Ama bazı öğeleri henüz çizemiyor: düğme patı, ayrı yaka parçası, fırfırlı askı, korsenin ayrı kup dikişi. Eski hâlinde bunlarla karşılaşınca ne yapıyordu? En yakın bloğu SESSİZCE veriyordu. Sen düğmeli bir bluz yüklüyorsun, o düğmesiz düz bir kenar çiziyor ve tek kelime etmiyor. Teknik olarak "bir kalıp" veriyordu — ama senin istediğin kalıbı değil, ve bunu söylemiyordu. Kullanıcıların "yapay zeka düğmeyi görmüyor" hissinin altında yatan asıl şey buydu: görüyordu, çizemiyordu, ve sustuğunu saklıyordu.

2. **Neden bu bir kusur, "eksik özellik" değil.** Bir aracın bir şeyi henüz yapamaması normaldir. Ama yapamadığını gizlemesi güveni öldürür. Kullanıcı, ürünün ne yapıp ne yapamadığını bilmeden ona güvenemez. Silent fallback (sessiz geri düşme) yazılımda en tatlı görünen, en zehirli desendir: kod hiç hata vermez, akış hiç kırılmaz — ve tam da bu yüzden kullanıcı yanlış bir modele göre iş yapar. Kumaşı yanlış keser. Sorumluluk bende.

3. **Önce dene, sonra itiraf et.** Dürüstlük katmanı "çizemedim, kolay gelsin" demek DEĞİL. İki adımlı kurdum: motor çizemediği her öğe için ÖNCE en yakın türevini deniyor — düğme yerine düz dikişli açıklık, puf istenirse balon kolun büzgülü başı, korse yerine pensli/prenses göğüs — SONRA açıkça yazıyor: "bunu gördüm, kalıpta tam çizemedim, sana en yakın şunu verdim, kalanını elle şöyle ekle." Yani kullanıcı hem çalışan bir başlangıç kalıbı alıyor, hem de neyi kendi tamamlayacağını tam olarak biliyor. Eksik, artık bir tuzak değil bir talimat.

4. **İki ekran, tek gerçek.** Bu görünürlüğü iki yere koydum: sonucu gördüğün ekrana (couture markasına uygun sade bir vişne kart) ve BASKI kapağına — çünkü kalıbı kesen kişi çoğu zaman siteyi hiç görmeyen biri. İkisi de aynı tek kaynaktan besleniyor: eşleme tablosu ve mesajlar tek bir dosyada. "Bir gerçek, bir yer" — çünkü ekranın "düğme yok" deyip kâğıdın demediği bir dünya, ilk yalandan beter.

5. **Ölçemediğim şeyi ölçmüş gibi yapmadım.** Bu oturumun benchmark sayısını ölçemedim: yapay zeka çağrısı için kullandığım kredi bitmişti, canlı görü çağrısı hata dönüyor. Sayı uydurmak yerine tabloya "ölçülemedi: kredi" yazdım. Ama kanıtlayabildiğimi kanıtladım: beş temsili giysi tarifi + bir temiz kontrol üzerinde katmanın doğru mesajı Türkçe ve İngilizce ürettiğini, temiz bir kalıpta HİÇ mesaj çıkmadığını (yanlış alarm yok) gösterdim; motorun C++'ına dokunmadığım için eski kalıpların tek biti oynamadı. Ders: bir ürünü dürüst yapan şey, ne bildiğini söylemesi kadar, ne BİLMEDİĞİNİ de söylemesidir — hem kullanıcıya, hem kendine.

---

## Essay 6 — "Bir düğme patı çizmek için önce Aldrich okudum" (ilk çizim)

1. **Söz verdiğim şeyi yapmaya başladım.** Geçen oturumda ürünüme çizemediği şeyleri dürüstçe söylettim: "düğme patını çizemiyorum, elle ekle." Dürüstlük iyi ama bir hedef değil, bir ara duraktı. Asıl iş o listeyi kısaltmak — gerçekten çizmek. Bu oturumda listenin en tepesindeki öğeyi aldım: düğme patı. Ölçüm verilerimde 54 fotoğrafın 19'unda vardı; en sık ikinci eksik öğe.

2. **Kod yazmadan önce kitap açtım.** Kendi kafamdan bir pat uydurabilirdim; çalışırdı bile. Ama bu ürünün tek gerçek moat'ı doğruluk — o yüzden kural şu: her yeni öğe önce kalıp kitaplarından çıkar. Winifred Aldrich ve Helen Armstrong'un metinlerini taradım. Öğrendiklerim tek tek karar oldu: (a) pat genişliği düğme çapı kadardır — sabit bir sayı değil, düğmeye bağlı bir değişken; (b) couture bir bluz patı "grown-on"dur, yani ayrı bir bant değil, ön parçanın kendisi uzayıp içeri katlanır (Zara'nın ucuz diktiği ayrı bant high-street kısayolu — ben couture olanı seçtim ve gerekçesini yazdım); (c) düğmeler tam orta-ön çizgisinde durur, ilikler oradan 3 mm dışa kayar (yatay ilik kuralı); (d) göğüs hizasına ZORUNLU bir düğme konur, yoksa giysi orada açılır; (e) kadın giyimi sağ önü sol önün üstüne bindirir. Beş kural, beş satır formül.

3. **Mimari karar: dokunma, ekle.** Bu özelliği motorun ana çizim koduna gömebilirdim — ve her eski kalıbı riske atardım. Bunun yerine "opsiyonel post-pass" deseni kullandım: pat, ana çizim bittikten SONRA çalışan, varsayılan kapalı bir ek adım. Daha önce anahtar-deliği yakayı da böyle eklemiştim; desen kanıtlıydı. Kapalıyken tek bir koordinat değişmez. Bunu iddia etmedim, ölçtüm: golden testim 23.034 satırda 0.000000 mm fark verdi. Kapalı yol bit bit aynı.

4. **En ince tuzak: yakaya dokunmamak.** Patı çizerken ön parçanın orta-ön kenarını 18 mm dışa taşıdım. İlk denemede giysinin yaka çizgisini de kazara kaydırdım — ve testim anında patladı: yaka pervazı (facing) ayrı bir parça ve ölçüsü giysinin yakasıyla milimetre milimetre tutmak zorunda, tutmayınca doğrulayıcı alarm verdi. Bu bir hata değil, bir bekçiydi. Düzeltmem şuydu: sadece orta-ön kenarını büyüt, yaka noktasına kısa bir düz çizgiyle geri bağla, yakanın kendisine HİÇ dokunma. Ders: iyi bir test suite yeni özelliğin yan hasarını sen fark etmeden yakalar.

5. **Kanıt, ve dürüst sınır.** Kanıt zinciri: golden 0.000000 mm, 13 test yeşil, dört farklı beden (petite/plus, prenses/pens) üzerinde pat geçerli, hassasiyet raporu en kötü eşleşme 0.00 mm, 19.620 fuzz çiziminde 0 hata, 37.800 kombinasyon taramasında 0 hata, baskı sayfalarında düğme ve katlama çizgisi gerçekten görünüyor. Sayıya gelince: canlı benchmark yine BLOKE — kredi bitik. Uydurmadım. Bunun yerine offline bir ön-kontrol yaptım: 19 düğmeli fotoğraftan 7'sinin tek eksiği bu patmış — yani artık tam kalıp adayı; 2'si arka pat (onu bilerek çizmiyorum, dürüstlük katmanında kalıyor); 10'unda pat çizildi ama başka eksikler sürüyor. Bunu rapora "offline ön-kontrol, canlı koşu değil" etiketiyle yazdım. İlk çizim loop'u: söz, koda döndü.

## Essay 7 — "En zor kısım hangi bağı ÇİZMEYECEĞİme karar vermekti" (bağ/kurdele)

1. **Sıradaki en büyük eksik.** Ölçüm verimde bir kelime herkesten sık geçiyordu: bağ. 60'lar elbiselerinin arkasında fiyonk bağlanan kuşak, babydoll üstlerin boyun bağı, açık sırtı kapatan bağ — 54 fotoğrafın 13'ünden fazlasında bir tür kumaş bağı vardı. Düğme patını çizdikten sonra listenin tepesindeki öğe buydu. Bu oturumun tek işi: bağı çizmek.

2. **Bağın kendisi en basit parça.** Yine önce kitap açtım — Aldrich, Armstrong, bir de couture (Dior/Chanel kuşak işçiliği) ile high-street (Stradivarius/Bershka babydoll) pratiği. Sonuç şaşırtıcı derecede sade: bir bağ öz-kumaştan bir DİKDÖRTGEN. Bitmiş genişlik W ve uzunluk L istiyorsan, kesim dikdörtgenin (2W + dikiş payı) × (L + dikiş payı); boyuna ortadan katlayınca tüp kendi kendine astarlanıyor. Couture da high-street de aynı dikdörtgeni yapıyor — fark sadece kumaş. Bel kuşağının her yarısı, yandan arka ortaya fiyonk için ulaşsın diye, belin yarısı + tutturma payı kadar uzun.

3. **Asıl zorluk: sınırı çizmek.** Bir "bağ" görünce hepsini çizmek cazipti. Ama bir tuzak var: bir DRAWSTRING (büzgü ipi) düz bir bağ değildir. O bir kanaldan geçer ve kumaşı BÜZER — asıl işi büzmektir, bağlamak değil. Motorumun büzgü/shirring makinesi yok. Yani "drawstring büzgülü yaka"yı çizersem yalan söylemiş olurum: kullanıcıya düz bir bağ verir, oysa o parçanın kumaşı toplaması gerekiyor. Karar: basit uygulanan bağı (bel kuşağı, sırt bağı, boyun/ön fiyonku, manşet bağı) ÇİZ; drawstring-büzgülü türleri ÇİZME ve kullanıcıya açıkça "bunu çizemedim, elle ekle" de. Dürüst sınırı bilerek, kodda tek tek çizdim.

4. **Yine aynı disiplin: dokunma, ekle.** Bağ, motorun ana çizim koduna değil, çizim bittikten sonra çalışan opsiyonel bir ek adıma girdi — tıpkı düğme patı ve anahtar-deliği gibi. Bağ sadece yeni bir PARÇA ekliyor (kendi kesim dikdörtgeni, "cut 2", katlama + dikiş çizgileri + kumaş yönü) ve gövde parçasına küçük bir yerleşim işareti koyuyor; hiçbir mevcut çizgiye dokunmuyor. İddia etmedim, ölçtüm: bağ kapalıyken golden testi 23.034 satırda bit bit aynı (0.000000 mm).

5. **Kanıt ve gerçek sayı.** Kanıt: golden byte-be-byte aynı, 14 test yeşil (yeni bir tie testi dahil — bağ tam bir parça mı, dikdörtgen mi, işaret gövdeye kondu mu), hassasiyet 0.00 mm, 19.620 fuzz + 37.800 tarama 0 hata, baskı sayfalarında bağ şeridi gerçekten döşeniyor. Ve bu kez sayı BLOKE değil — kredi geldi. Canlı benchmark **11/54'ten 14/54'e** çıktı (+3). Artışın hepsi bağı tek eksik olan fotoğraflar: arkadan fiyonk bağlı iki Jackie elbisesi ve arka bağlı Emma üstü. Açık-sırt oyuğu olan tie-back elbiseler hâlâ "eksik" — çünkü bağı çizdim ama oyuğu çizemem, ve hangi fotonun neden hâlâ eksik olduğunu tek tek biliyorum. İlerlemenin ölçüsü his değil, o sayı.

## Essay 8 — "Bir puf kolu çizdim, sayım oynamadı, yine de bu bir kazanç" (puf/büzgülü kol başı)

1. **Sıradaki öğe: kabaran kol başı.** Ölçüm listemde puf ve büzgülü kol başı sık geçiyordu — omuzda hafifçe kabarıp yükselen o kol. Zaten motorumda "balon kol" vardı ama o BİLEĞİ büzer; puf kol BAŞINI (cap) büzer. İkisi bambaşka parça. Bu oturumun tek işi: gerçek puf kol başını çizmek, balon koldan çalıp geçiştirmemek.

2. **Önce kitap.** Aldrich, Armstrong, M. Müller & Sohn'un gigot (koyun budu) kolu, bir de couture (Dior/YSL balon-omuz) ile high-street (Zara/Bershka basit puf) pratiği. Tek DOĞRULANMIŞ değişmez şunu söylüyor: puf yaparken cap'i slash-and-spread ile ne kadar AÇARSAN, tam o kadar da YÜKSELTİRSİN. Genişlik ve yükseklik birlikte artar; fazlalık kol oyuğuna büzülerek girer, kol yine AYNI oyuğa oturur. Sade gathered kol yükseltmez (daha az kabarır), tam puf yükseltir. Formülü buradan çıkardım: gathered spread = genişliğin %20'si (yükseltme yok), puffed = %45 (yükseltme = spread kadar). Büzgü sadece crown'da, çentikler arasında; çentiklerin altı armhole ile bire bir.

3. **Doğru yerde büzülmeli, yoksa dikilmez.** Buradaki tuzak inceydi: bir kalıp doğrulayıcım var, kol başı yayı armhole'dan %1-9 fazlaysa "dikilir" der, dışındaysa reddeder. Ama puf kolun crown yayı KASITLI olarak çok daha uzun — o fazlalık EASE değil, GATHER (büzgü). Yani puf için o pencereyi olduğu gibi bırakırsam motor kendi puf kolunu "dikilmez" diye reddederdi. Doğrulayıcıyı puf farkındalıklı yaptım: gathered/puf başı için beklenen büzgü bandını kontrol ediyor, biceps zeminini yine koruyor. Yoksa doğru olan özelliği kendi kalite kapım bloklardı.

4. **Yine aynı disiplin: dokunma, ekle.** Puf, kolu çizen fonksiyona opsiyonel bir parametre olarak girdi. Kapalıyken (Plain) spread sıfır, cap aynı, yükseltme yok — mevcut düz kol kodu kelimesi kelimesine çalışıyor. İddia etmedim, ölçtüm: puf kapalıyken golden testi 23.034 satırda bit bit AYNI, 0.000000 mm. Puf açıkken kanıt: 14 test yeşil (sleeve testine puf bloğu ekledim — crown düzden geniş mi, puf yükseldi mi, gathered yükselMEdi mi, büzgü işaretleri var mı, doğrulayıcı temiz mi), render'da puf kol chord'u 460mm vs düz 317mm, tepe 255 vs 113 — gerçekten omuzda yükseliyor.

5. **Sayı oynamadı, ve bunu söylüyorum.** Sonra 54 fotoyu ölçtüm: **14/54, değişmedi.** Neden? Bu sette puf/büzgülü kol başının TEK eksik olduğu foto yok. Kol büzgüsü geçen fotolar ya "cap sleeve" (o bir kısa-cap ŞEKLİ, büzgülü baş değil — dürüstçe çizmiyorum) ya da "drawstring gathered" (kanal/casing gerektirir — dürüstçe çizmiyorum). Kabiliyet gerçek, kanıtlı ve canlı; ama bu ölçüm setinin son boşluğuna denk gelmiyor. Bir özellik eklemek ile bir metriği oynatmak aynı şey değildir — ve sahte bir artış uydurmaktansa değişmeyen bir sayıyı nedeniyle göstermeyi seçiyorum. İlerlemenin en dürüst kanıtı bazen kımıldamayan bir sayının yanında duran net bir "işte neden"dir.
