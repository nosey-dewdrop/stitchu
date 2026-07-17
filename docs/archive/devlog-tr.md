# stitchu — build in public günlüğü

Bu dosya reels ve vlog için ham anlatı. Her aşama tek tek, "ne yaptık" değil "neden öyleydi, ne için yaptık" diye yazılıyor. Damla seslendirirken güzelleştirir.

---

## 00 — Neden köprü kuruyoruz

stitchu'nun içinde ciddi bir motor var. Fotoğrafı alıp senin ölçülerine göre dikilebilir bir kalıba çeviren, 2805 taslaklık test matrisiyle doğrulanmış, Swift'le farkı milimetrenin on binde biri olan bir C++ motoru. Yani teknik olarak burada zor olan iş çoktan çözülmüş.

Ama siteye giren biri bunu hissetmiyordu. Çünkü motor görünmez — kullanıcı 2805 testi görmez, sadece kabuğu görür. Kabuk "foto at, pdf al" dediği sürece beyin de "basit bir araç" diyor. Sertlik altta duruyordu ama altını kimse hissetmiyordu.

Fark ettik ki bir ürünün "taşaklı" mı yoksa "slopware" mı durduğunu belirleyen şey motorun derinliği değil, o derinliğin kullanıcıya taşınıp taşınmadığı. Aynı motor, yanlış kabukla oyuncak; doğru kabukla sihir gibi hissediliyor.

O yüzden bir sonraki iş yeni özellik eklemek değil. Var olan motorla kullanıcı arasına bir köprü kurmak. Dört tahtası var bu köprünün: motorun çalıştığı anı kullanıcıya hissettirmek, ürünü doğru cümleyle konumlandırmak, motora değer biçen bir paywall, ve motorun var olduğunu açıkça söyleyen ama sıkışık, profesyonel duran bir kabuk. Stil aynı kalıyor — sadece boşlukları daraltıp motoru görünür kılıyoruz.

---

## 01 — Motorun default'unu pensten prenses dikişine çevirdik

Motor vücudun 3B eğriliğini pensle çözüyordu. Matematiksel olarak doğru — pens, kürenin düze açılırken oluşan fazlalığı bir kama içine gömer. Ama bir sorun vardı: pensin sivri ucunu dikmek gerçek hayatta baş belası. Tam o noktada kumaşı büzmeden, balon yaptırmadan bitirmek ustalık ister; ilikleyip düğümlemezsen orada kabarır. Kendi dikerken o noktayı hiç sevmedim.

Sonra fark ettik ki motorun matematiğinin doğru olması yetmiyor — çıkardığı kalıbın gerçekten dikilebilir, üstelik keyifle dikilebilir olması lazım. Motor senin yerine düşünmeli, ama senin elinle.

O yüzden default'u değiştirdik: artık şekillendirmeyi pensin içine gömmüyor, dikey bir dikiş hattına yıkıyor — prenses dikişi. Pens payı, iki panelin arasındaki yumuşak kavise dönüşüyor. O korkunç sivri uç ortadan kalkıyor; yerine çentikle eşleştirip düz gittiğin bir dikiş geliyor. Vücut sürekli kavisli bir şey, prenses dikişi de o sürekliliği takip ediyor — hem daha iyi oturuyor hem dikmesi kolay. Etekte de aynı mantık: şekil gore panellerinin dikey dikişlerine gidiyor, yine pens yok.

Pens tamamen gitmedi, ileri seviye bir seçenek olarak duruyor. Ama artık motor, insanın gerçekten diktiği gibi dikiyor. En sevdiğim kısım şu: motoru "daha akıllı" yapmadık, "daha insan" yaptık.

---

## 02 — Build-in-public'in yayı: motordan giyilebilir elbiseye

Bu işin en büyük kanıtı bir ekran görüntüsü olamaz. Bir landing "biz slopware değiliz, gerçek bir motoruz" diyebilir ama söz ucuz. Asıl kanıt fiziksel: motorun çıkardığı kalıbı gerçek kumaşa serip kesmek, prenses dikişini dikmek, ve sonunda o elbiseyi giymek.

O yüzden build-in-public'in yayı şu: motoru kurduk, landing'i çıkardık, sıradaki bölüm kumaşı kesip elbiseyi dikmek. Kamera kalıbın A4'ten çıkışını, kumaşın üstüne serilişini, makinede dikilişini, giyilişini görecek. İzleyen kişi "demek gerçekten çalışıyormuş" diyecek — çünkü kanıtı üstümüzde.

Ve güzel yanı: bu aynı zamanda ürünün fiziksel doğrulama testi. İçerik ve validasyon aynı dikişte.

---

## 03 — Prenses dikişi artık kodda: motor ilk kez "dikilemez"i yakaladı

Karar loglanmıştı, bugün cerrahi yapıldı. Motorun bodice bloğu artık pensli tek parça yerine dört panel çıkarıyor: ön ortası, ön yanı, arka ortası, arka yanı. Pens payı, kol evinden göğüs noktasına inen ve oradan bele akan gerçek bir prenses dikişine dönüştü. Etek de aynı dili konuşuyor: gore panelleri, pens ucunun olduğu yerden etek ucuna akan dikey dikişler. Fermuar arka ortadan hem korsajı hem eteği geçiyor, gore dikişi korsajdaki prenses dikişiyle buluşuyor.

En güzel an şuydu: ilk koşuda validator 1400 taslağı reddetti. Sebep ince bir kalıpçılık gerçeği — ön bel kavisi ortaya doğru düştüğü için dikişin iki kenarı arasında 10 milimetre fark oluşuyordu. Pens olarak katlarken kimsenin fark etmediği bu fark, gerçek bir dikişte kumaşın birleşmemesi demek. Gerçek kalıpçıların "truing" dediği düzeltmeyi ekledik: yan panelin bel ucu, iki kenar milimetrik eşitlenene kadar iniyor ve bel kavisi oraya yeniden harmanlanıyor. Sonra 4485 taslağın hepsi yeşil.

Yani motor sadece prenses dikişi öğrenmedi; dikilemez kalıbı sayıyla yakalayan bir göz kazandı. Pens modu da duruyor (ileri seviye seçenek) ve Swift referansıyla milimetrenin onda biri içinde birebir. Sıradaki durak: bu motorun çizdiği prenses dikişli elbiseyi gerçekten dikmek.

---

## 04 — Motor artık komple giysi düşünüyor: prenses üstler, yaka pervazı, gerçek dikiş sırası

Prenses dikişi elbisede vardı ama üstlerde pens kalmıştı, çünkü üstlerde dikişin bel çizgisinde durmayıp etek ucuna kadar akması gerekiyor. Bugün o aktı: panel dikişi belde kavis yapıp kalçaya doğru açılıyor, bel oturuyor, etek ucu tam kalça genişliğinde bitiyor. Eski pensli üst bel altında kutu gibiydi; artık fit belden geçiyor.

İkinci eksik daha sinsiydi: yaka. Kalıp çıkarıyorduk ama yakanın nasıl temiz biteceği bir cümleydi: "biye geç". Gerçek konfeksiyonda yakaya pervaz dikilir — yakanın kopyası, telalı, içeri kıvrılan bir parça. Motor artık her elbise ve üstle birlikte ön/arka yaka pervazını da çiziyor. İç kenarı yakanın birebir aynı komutları, yani dikiş garantili eşleşiyor; validator ayrıca ölçüp kontrol ediyor.

Üçüncüsü rehber: adımlar artık gerçek terzi sırası — teyel, prenses dikişleri, omuz, pervazın omuzda birleşmesi, understitch (pervazı içeride tutan gizli dikiş), fermuar, pervaz ucunun fermuar bandına el dikişiyle tutturulması. Bunu bilmeyen biri sırayla yapsa giysi çıkar; motorun vaadi tam olarak bu.

Ve son parça: fotoğraftan okuma. Vision artık "bu elbisede prenses dikişi var mı, pens mi" diye bakıp shaping alanını dönüyor. Fotoğraf çek, motor o giysinin gerçek yapım tekniğiyle kalıbını çizsin.

Test matrisi 5610 taslağa çıktı, hepsi yeşil. Etek + elbise + üst, ikişer şekillendirme, on beş vücut, her yaka her kol. "Sadece etek çıkarıyor" cümlesi bugün itibarıyla tarih.

---

## 05 — Silüet uzayı: babydoll, pile, streç kumaş

"Motor dünyadaki her şeyi dikebilmeli" cümlesinin mühendislikteki karşılığı tek tek model eklemek değil, EKSEN eklemek. Bugün üç eksen açıldı.

Bel hattı: dikiş artık gerçek belde olmak zorunda değil. Empire seçince korsaj göğsün hemen altında bitiyor, hedef çevre bel değil göğüs altı oluyor, etek yüksekten başlayıp farkı kapatıyor. Empire + büzgülü etek = babydoll. Motor ismini bile kendi koyuyor: "babydoll dress".

Kumaş: şimdiye kadar motor her kumaşı esnemez varsayıyordu. Artık örgü/streç seçince tüm bolluk matematiği küçülüyor — göğüste %11 yerine %4, kolda %15 yerine %6, kol evi yedirmesi yarıya. Aynı vücut, aynı model, farklı kumaş = farklı kalıp. Gerçek terzilik tam olarak bu.

Pile: büzgünün disiplinli kardeşi. Kumaş 3 katı genişlikte kesiliyor, kalıbın üstünde her pilenin kat çizgisi çifti işaretli, rehber hangi çizgiyi hangisine katlayacağını söylüyor.

Vision da büyüdü: fotoğraftan artık bel hattını (babydoll mu?), kumaşın streç olup olmadığını ve pileyi de okuyor. Test matrisi 20400 taslağa çıktı — beş etek stili, iki bel hattı, iki kumaş, iki şekillendirme, on beş vücut. Hepsi yeşil, Swift referansı hâlâ milimetrenin on binde birinde.

Korse hâlâ menüde yok — o negatif bolluk ve balen isteyen ayrı bir blok, biliyoruz. Ama "sadece etek" günlerinden "babydoll'unu streç kumaşa çizer" günlerine bir günde geldik.

---

## 06 — Vision'ı sahaya sürdük: defile, gelinlik, ve dürüstlük

Bugün motoru değil, motorun gözünü sertleştirdik. Yöntem basitti: internetten rastgele fotoğraflar, sonra defile fotoğrafları (couture parçalar, gece elbiseleri), sonra gelinlikler — her turda hatayı bul, düzelt, tekrar dene.

İlk turlar üç hata çıkardı. Bir: yerde süzülen bir gece elbisesine "mini" diyebiliyordu, çünkü boyu kadrajdan tahmin ediyordu; kurala bağladık, artık boy vücuda göre okunuyor ve gelinlik/gece elbisesi her zaman maxi. İki: karmaşık bir parça görünce ya pes ediyor ya uyduruyordu; şimdi talimatı net — couture bile olsa dikilebilecek EN YAKIN taban silüeti döndür ve neyi yaklaştırdığını açıkça söyle. Üç: motorun kendi çıktısında yarım kloş elbise parçasının adı "Skirt Skirt Panel" çıkıyordu — canlı fotoğraf testi olmasa fark etmeyecektik.

Sonuç şöyle bir şey: Dior/Balenciaga vitrininden bir gece elbisesi "empire bel + kolon etek + satin, korsaj işlemesini yaklaştırdım" diye dönüyor. Heykelsi bir couture parça "prenses dikişli maxi'ye yaklaştırdım, omuz yapısını dikemezsin" diyor. Gelinlik "prenses + A kesim maxi + satin; kuyruk ve korse kapamayı sadeleştirdim" diyor. Palto gibi gerçekten menü dışı şeylerde de dürüstçe "bu bir palto, çizemem" diyor.

Ve asistanlık: vision artık kumaşın ADINI da tahmin ediyor (satin, şifon, jarse...). Sonuç ekranı bunu doğrulanmış kumaş veritabanıyla çaprazlıyor — "fotoğraftaki kumaş satin görünüyor, bu form için uygun, şuna dikkat" ya da tersi "bu forma ters çalışır, şunları düşün". Bilmediği kumaşta uydurmuyor, "bunun için doğrulanmış rehber yok, önce artık parçada dene" diyor.

Test matrisi de bu turdan payını aldı: elbiseler artık üç boyda da taranıyor, 50400 taslak, hepsi yeşil.

---

## 07 — Sanal terzi: motoru dikmeden dikmek

"Kalıpları dik, hata bul" dendi. Kumaşımız yok ama dikişin matematiği var: bugün motorun çıktısını dikiş dikiş monte eden bir sanal terzi yazdık. Uzunlukları zaten ölçüyorduk; sanal terzi daha zalim bir soru soruyor — parçalar birleşince dikişler NEREDE buluşuyor?

İlk koşuda üç gerçek hata çıkardı. En önemlisi: korsajdaki prenses dikişi ile etekteki gore dikişi bel birleşiminde aynı noktaya gelmiyordu — önde 3, arkada 6, yanda 8 milimetre kayık. Elbiseyi diken biri bunu hemen görür: yukarıdan gelen dikiş, aşağıda devam etmiyor. Sebep inceydi: korsaj beli önü %52 arkayı %48 bölüyor, etek ise dört eşit çeyrek çiziyordu. Düzeltme: her etek çeyreği artık kendi korsaj yarısına göre çiziliyor ve gore dikişi, prenses dikişinin bel üzerindeki yay mesafesi neredeyse tam oraya yerleştiriliyor. Sonuç: 0.0 milimetre. Dikişler buluşuyor.

PDF de aynı muameleyi gördü: 24 sayfalık baskıyı sayfa sayfa görüntüye çevirip GÖZLE inceledik. Kimliksiz sayfalar bulundu — üzerinde sadece iki çizgi olan, hangi parçaya ait olduğu belirsiz kağıtlar. Artık her sayfa köşesinde kodu yazıyor, üzerinden geçen parçaların adları fısıldanıyor, boy iplik çizgileri gerçek ok başları taşıyor ve sayfa sayısı optimize ediliyor.

Ders şu: testleri geçmek yetmiyor; çıktıya bir terzinin gözüyle ve bir terzinin eliyle bakmak gerekiyor. Sanal terzi artık kalıcı — her yeni giysi tipi ondan geçecek.

---

## 08 — Couture kelime dağarcığı: fırfır, kalp yaka, anahtar deliği

Bugünün sorusu şuydu: Etsy'de "custom pattern" diye para kazanan herkesin çizdiği şeyleri biz çizebiliyor muyuz? Üç yeni kelimeyle başladık.

Kademeli fırfır: tek fırfırı geçen oturum eklemiştik; bugün kaskad geldi. Matematik zalim — her kat, üstündeki katın alt kenarına büzülüyor, yani i'inci katın kumaş boyu etek ucu çarpı büzgü oranının i'inci kuvveti. Üç katlı bir fırfırda en alt kat 23 metre şerit demek. Quinceañera elbiselerinin o köpük köpük eteği işte bu yüzden o kadar kumaş yiyor; motor artık bunu hem çiziyor hem dürüstçe metreye yansıtıyor. Sadece en alt kat baskı payı taşıyor; ara katların alt kenarı bir sonraki katı karşılayan dikişte kayboluyor.

Kalp yaka: ilk deneme V yakaya benzedi, beğenmedik. Dört aday eğriyi yan yana çizdirip baktık — kazanan, merkezde dik teğetle çentik yapıp göğüs üzerinde belirgin lob çizen eğri oldu. Bir de ince bir tuzak: yaka genişliğini korsaj ile pervaz AYRI AYRI hesaplıyordu; genişlik çarpanını ekleyince pervaz yakayla buluşamadı, validator yakaladı. Tek yardımcı fonksiyona bağladık — ikisi artık aynı sayıyı okuyor.

Anahtar deliği: yakanın altında kapalı bir gözyaşı damlası. Bunu kalıp kağıdına parça olarak değil, ön parçanın üzerine dikiş çizgisi olarak çiziyoruz — gerçek dikişte de öyle yapılır: pervazı çizginin üzerine dik, içini yar, içeri çevir, ütüle. Motor pervaz parçasını üretiyor, adımları rehberin doğru yerine (yaka pervazından hemen sonra) sokuyor, yer yoksa dürüstçe "bu korsaj anahtar deliğine kısa" diyor.

Üçü de aynı disiplinle: motor + test + gözle bakılmış çizim + WASM + arayüz + vision etiketi. Matris 60300 taslağa çıktı, hepsi yeşil. Ve gün sonunda kanıt: gerçek bir quinceañera fotoğrafı canlı sisteme girdi, cevap "kalp yaka + kademeli fırfır + prenses" diye döndü — bugün eklediğimiz üç kelimenin üçü de.

---

## 09 — Gemiyi kontrol ettik: baskı makasının yediği 45 santim

Bugün ürünü müşteri gibi gezdik ve bir kabus bulduk: A4 paketleyicimiz düzeni en fazla 5 sütuna (95 santim) sığdırıyordu. Fırfır şeritleri 140 santime kadar çıkıyor. Yani 95'ten sonrası... hiç basılmıyordu. Sessizce. Müşteri şeridi eksik kesecekti ve bunu ancak kumaşta anlayacaktı.

Düzeltmenin iki yarısı var. Bir: paketleyici artık en geniş parçaya ihtiyacı kadar sütun veriyor, sığmayan parça diye bir şey kalmadı. İki — ve bence güzeli: düz dikdörtgen şeritler artık kalıp kağıdı YEMİYOR. Gerçek terziler fırfır şeridi için kağıt kesmez; cetvel ve tebeşirle direkt kumaşa çizer. Kapak sayfası artık "bu şeritleri kumaşa şöyle çiz" diye liste veriyor; yirmi küsur bomboş sayfa çöpe gitmekten kurtuldu.

Kanıt için tek fotoğraf yetmez: web katmanının gönderdiği HER kombinasyonu — 16.795 taslak, beş uç vücutla — gerçek motordan geçirip baskı matematiğini simüle eden bir fuzz aracı yazdık. Sıfır kırpılma, sıfır hata. Bir de dürüstlük düzeltmesi: imkansız ölçüler girildiğinde (bel 140, göğüs 60) sistem taslağı zaten güvenlik kontrolünde durduruyordu ama mesaj "bu olmamalıydı" diyordu. Artık doğrusunu söylüyor: "en sık neden ölçü yazım hatası — yedi ölçünü kontrol et."

Worker da payını aldı: kullanılmayan halka açık duvar uçları uyutuldu, bozuk istekler 500 yerine 400 dönüyor. Küçük şeyler; ama gemi kontrolü tam da küçük şeylerin ürünü batırdığı yer.

---

## 10 — Kendi gözümüz: ilk deneme ve dürüst bir yenilgi

Vizyon hâlâ kiralık — her fotoğrafı Opus okuyor, her okuma para. Plan bunu değiştirmek: kendi gözümüz. Bugün v0'ı denedik: CLIP denen açık model, hiç eğitim verisi olmadan, "bu fotoğrafta kalp yaka mı var" gibi sorulara cevap verebiliyor... teoride.

Önce dürüst bir test seti kurduk: Wikimedia'dan gerçek giysi fotoğrafları indirdik, on dokuz tanesini tek tek GÖZLE etiketledik — yaka, kol, etek, bel, kumaş, fırfır, anahtar deliği. Uydurma etiket yok; bakmadığımız hiçbir şeye cevap yazmadık.

Sonuç: çıplak CLIP yüzde 44 tutturdu. Yakada yüzde 6 — neredeyse her şeye "kayık yaka" diyor. Daha iyi model (SigLIP) yüzde 65'e çıktı; kol ve kumaşta fena değil, ama etek stili, boy, fırfır hâlâ zar atmak gibi. Ürün çıtası yüzde 95 civarı; arada dağ var.

Bu bir yenilgi ama planlı bir yenilgi: v0'ın işi zaten çıtayı ölçmekti. Yol haritası netleşti — v1'de Opus'a binlerce fotoğraf etiketletip o etiketlerle KÜÇÜK bir modeli eğiteceğiz. Öğretmen pahalı ama bir kez ödenir; öğrenci bedava koşar. Bugün öğretmenin kendisini de ölçtük: canlı sistemden geçen fotoğraflarda Opus bizim göz etiketlerimizle nerede anlaşıyor, nerede ayrışıyor — o sayı v1'in tavanı.
