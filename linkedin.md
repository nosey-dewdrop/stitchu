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
