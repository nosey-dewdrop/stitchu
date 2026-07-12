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
