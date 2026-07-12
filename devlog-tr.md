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
