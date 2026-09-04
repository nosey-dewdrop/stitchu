# HEDEF — stitchu (Damla, 5 Eylül 2026)

> Reponun en üst otoritesi bu dosyadır. Her faz, her ajan, her hakem bu dosyaya
> karşı koşar. Çelişkide bu dosya kazanır. Bu dosyayı Damla'dan başkası değiştirmez.
> Buradaki cümleler Damla'nın kendi cümleleridir; kısaltılmadı, yorumlanmadı.

## 0. Tek cümle

**Fotoğraf veya prompt (ya da ikisi) → dikilebilir kalıp + satılır flat.**
Tüm edge case'lere rağmen, sınırsız ölçüde. Demo değil, fikir değil: **isteyene
"al dene" diyebileceğimiz gerçek bir ürün.** Doğruluk ve denetim gereklilik;
hedef ve amaç kullanıcı deneyimi, projenin işe yaraması.

Ölçüm bir hedef değil, ölçmeden zaten yapamazsın. Hedef ürün, müşteri, müşteri deneyimi.

## 1. Taviz olmayan maddeler

1. Fotoğraf + prompttan = kalıp + flat yapabilecek.
2. Bu zincir kusursuzlaşacak, çünkü ileride Midjourney gibi bölgesel editleme
   olacak: "şuraya fiyonk ekle" dediğinde eklenecek; uzatma, kısaltma, yakayı
   değiştirme düzenlenebilir olacak.
3. CS hesap ve matematik işidir.
4. Flat'in 36'sı ile kalıbın 36'sı farklı: kalıbınki tam dikilebilir,
   giyilebilir gerçek beden; flat'in 36'sı ideal kadın bedeni (croquis).
5. Flat üretirken önce bir **konvansiyon** olacak. Eski flat'lerde göğüs-beden
   mesafesi, bel, kalça gibi ortak olması gereken hiçbir şeyde ortaklık yoktu.
   Bütün flat'ler aynı ölçüden, aynı insan için tasarlanmış gibi görünecek.
   Bu, insanların görüp para vereceği şey.
6. Farklı kumaşlarda nasıl davranacak, parçaları nasıl bölecek: bu terzilik
   konseptleri üzerine çalışılacak, araştırılacak. "Aynı elbise, iki kumaş,
   iki kalıp." Negatif pay kumaşın esneme/toparlanma payından hesaplanır.
7. Parça sayısı: olabilecek en az, ya da görselde ne kadarsa o kadar.
   Gereksiz parça yok.
8. Çizim motorunda tech stack sınırsız zorlanabilir. fal.ai / Midjourney
   ekipleri de insan. Flux yapalım denmiyor; geometrisini çıkarabileceğimiz
   bir şey bu.
9. **Sözlük bust / kol / heartneck / puff sleeve gibi sabit tabirlerden
   yapılmayacak. Dikiş tarzıyla (Edge / Panel / Stitch primitifleri)
   ilerlenecek; böyle olursa sınırsız kalıp ve flat çıkar.** Modanın sınırı
   yok. Sabit bir menü, limit, sınır getirmek bu maddenin ihlalidir.
10. Sadece kalıp + flat verilip geçilmeyecek: kumaşa göre farklı kalıp ve
    durumlar, rehber, püf noktaları (dikiş payı, kesim planı, iğne tipi) —
    bir terzilik hesabı. İleride üyelik, forum, iOS uygulaması.
11. Geometri motoru kusursuz değil. Sorun görmede (computer vision), JSON
    okuyucuda, mimaride, herhangi bir yerde olabilir. Her ihtimal masada;
    kök neden analiziyle, think out of the box. İyi flat henüz görülmedi;
    öyleyse iyi kalıp da yok.
12. Bir şey çizildiğinde Buğra'nın (satın alınmış, gerçek) kalıbına yakın bir
    şey çıkıyor mu? Kör kontrol; ayar hedefi değil.
13. Proje reposu düzenlenecek, gereksiz şeyler silinecek. Bu proje abartıldığı
    kadar zor değil.
14. Eski çıkan pattern ve flat'lerin hiçbiri onaylı değil, beğenilmedi. Onlar
    üzerinden devam edilmeyecek; silinecek. Gerekirse hesap baştan.

## 2. Edge case'ler

- **Arka görünmüyorsa:** arka fotoğraf varsa onu tasarla. Sadece ön varsa en
  sade, dikilebilir arkayı uydur (kafadan dekolte uydurma) ve **uydurduğunu,
  neden uydurduğunu açıkça söyle.** Zincirin generative bir yanı var; bu yüzden
  iyi çalışması lazım.
- Bulanık / giysi olmayan fotoğraf, çelişkili prompt, uç bedenler, streç
  kapasitesi aşımı, dar kumaş eni: her biri adıyla reddedilir ya da adıyla
  çözülür. Sessiz default yok, çıkmaz sokak yok.

## 3. Orkestrasyon kuralları (Damla'nın koyduğu)

1. **Damla router değil.** Fazlar arası soru ve çıktı tarafsız hakem ajanına
   gider; hakem karar verir, koşu iyileştirerek devam eder. Damla'ya soru gelmez.
2. **Her faz taze ajan; işi biten ölür.** Tek context şişer, hesap bozulur.
3. **Compounding error kontrolü.** Her adımda "hedeften şaştık mı?" sorusu;
   önceki fazların kabulleri yeniden koşulur.
4. **Reward hacking yok.** Sonraki faz, önceki fazın çıktısına göre hakemin
   dediğiyle değişebilir; bu hatalardan öğrenmeye yarar, eşik gevşetmeye değil.
5. Hakemin sorusu "kapı yeşil mi" değil: **bu oldu mu, bitti mi? Satılsa kendi
   paramla alır mıydım? Ürün olarak güçlü mü?** "Almazdım" dendiği sürece
   düzelt, tekrar sor.
6. Ajanlar taraf tutmaz; brief'ler yönlendirmez. Sert, teknik, geliştiren
   eleştiri istenir.
7. Darboğazda aynı şeyi 10 kez deneyip ajan doğurma yok; aracı tamir et.
   Alt-ajan doğurma yasak.
8. LLM gereken yerde kullanılır; para boşa yakılmaz; "olmuş gibi" gösterilmez.
9. Branch yok, main'de çalışılır. Sabah raporu yok; bitiş yeni turun başıdır.

## 4. Kanıt

- Fiziksel kanıt: uygulamanın vaadettiği gibi çalıştığının kanıtı olarak ilk
  ürünü **Damla diker.** İnternetten kalıp bulup "projem yaptı" numarası yok.
  Koşunun görevi: Damla'nın dikeceği paketi (A4 PDF, test karesi, rehber)
  hazır etmek.
- Rapor ürün değildir. Her turun sonunda Damla'nın gözüyle göreceği çıktı
  olur: çizim, sayfa, paket.

## 5. Sonrası (bu koşunun dışında, ama mimari bunu ucuza almaya hazır olacak)

- İki iş modeli: flat/kalıp satışı + insanlara giysi satışı. Tek koşulu:
  zincirin sınırsız çalışması.
- Pazarlama Damla'nın alanı: Instagram, LinkedIn, kendi üzerinden. Koşu
  fiyat/pazar araştırması yapmaz.
- Landing page: bayat veri, eski blog, patch notes silinir; yeni ölçütler.
- Platform: üyelik (web + mobil ortak hesap), hesap başına 2 hak, kredi /
  abonelik, gardırop, ödeme, agresif programatik SEO.
- iOS Swift uygulaması, aynı arkaplan ve fontlarla. Bu bir lisans projesi
  değil, ticari bir iş.

## 6. Tavan yok

Bunlar yapılmış, sen şunu yap diye bir şey yok. Onlar yapıyorsa biz de
yaparız, farklı yaparız, iyisini yaparız. Küçük bir proje gibi konumlandırma.
Harcadığımız saatlere değsin. Hayallerini büyük tut.
