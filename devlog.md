# devlog.md — instagram build-in-public reels kuyruğu
> Format (Damla): minik parçalar, her ünite 30-60 sn'lik hook'lu reels (post/carousel de olur). Anlatım: "bugün şunu değiştirdim arkadaşlar, çünkü şöyle bir sorun vardı" + numaralı neden/karar. Bunlar iskelet, Damla kendi ağzıyla anlatır. Her satır gerçek; sayılar test/motor çıktısı. Uzun anlatı versiyonları devlog-tr.md'de, LinkedIn essay'leri ~/damla_projects_2026/linkedin.md'de.
> görsel notları: [canlı] = site ekran kaydı, [render] = engine/tools/*-proof.svg, [terminal] = test çıktısı, [baskı] = A4 pdf.

## seri A — proje ve motor

A1 · HOOK: "bir elbise fotoğrafı çekiyorsun, sana kendi bedenine göre dikiş kalıbını veriyorum."
- foto giriyor, yapay zeka elbiseyi okuyor, motorum kalıbı SENİN 7 ölçüne çiziyor, gerçek ölçekli A4 basıyorsun.
- etsy'de bu işi insanlar elle yapıp para kazanıyor. biz otomatikledik. [canlı]

A2 · HOOK: "ilk sürümüm mükemmel çalışıyordu ve tamamen gereksizdi."
- ilk motor etek çiziyordu. sorun: etek kalıbını herkes kendi çizebilir, iki dikdörtgen.
- karar: motor sadece insanın KENDİ ÇİZEMEDİĞİ şeyi çizecek. kavisli kup, kol oyuntusu, yaka.
- "etekten motor olmaz" bu projenin anayasası oldu.

A3 · HOOK: "bugün motorun varsayılanını değiştirdim çünkü matematiğim doğruydu ama kimse onu dikemiyordu."
- klasik kitaplardan pens (dart) ile başlamıştım. teoride doğru.
- ama pensin sivri ucu pratikte kötü dikiliyor. ev dikişçisi prenses dikişi diker.
- pivot: varsayılan prenses oldu, pens ileri seçeneğe düştü.

A4 · HOOK: "vücut ölçülerin hiçbir sunucuya gitmiyor. gidemiyor."
- motoru c++ yazdım, webassembly'ye derledim, tarayıcının İÇİNE koydum.
- kalıp senin cihazında çiziliyor. gizlilik politikası değil, mimari: veri teknik olarak çıkamıyor.

A5 · HOOK: "her kod değişikliğinde 60.300 elbise çiziyorum."
- neden: tek ölçüde çalışan kalıp demo, her ölçüde çalışan kalıp ürün.
- 15 vücut tipi × bütün yaka/kol/etek/bel/kumaş kombinasyonları, her seferinde. [terminal: ALL PASS]

A6 · HOOK: "motorumun milimetrenin ON BİNDE BİRİ kadar oynama hakkı var."
- golden diff: çıktı referansla 0.0001mm oynasa test kırmızı.
- yeni özellik eklerken eskiyi bozamıyorum; bozarsam ben değil test söylüyor.

## seri B — sanal terzi

B1 · HOOK: "kumaşım yok ama bugün elbiseyi dikmeden diktim."
- sorun: testler uzunlukları doğruluyordu ama dikişler birleşince NEREDE buluşuyor bilmiyordum.
- sanal terzi: parçaları dikiş dikiş monte edip buluşmaları ölçen script.

B2 · HOOK: "bütün testlerim yeşildi ve elbisem 8 milimetre kayıktı."
- sanal terzinin ilk koşusu: korsajdaki prenses dikişi ile etek dikişi belde buluşmuyor. önde 3, arkada 6, yanda 8mm.
- sebep: korsaj beli %52/%48 bölüyor, etek dört EŞİT çeyrek çiziyordu.
- düzeltme sonrası: 0.0mm. testi geçmek yetmiyor, terzi gözü lazım. [render]

B3 · HOOK: "bastığım 24 sayfayı tek tek görüntüye çevirip baktım ve kimliksiz sayfalar buldum."
- üzerinde iki çizgi olan, hangi parçanın neresi olduğu belirsiz kağıtlar.
- artık her sayfada köşe kodu var (A1, B3...), üzerinden geçen parçalar sayfada fısıldanıyor. [baskı]

## seri C — motorun eksenleri

C1 · HOOK: "motorum babydoll'un ne olduğunu benden öğrenmedi."
- empire bel + büzgülü etek girince motor çıktıya kendi "babydoll dress" adını koyuyor.
- çünkü o kombinasyonun adı bu; kalıpçılık kültürü motora veri olarak girdi.

C2 · HOOK: "örgü kumaş seçince kalıp KÜÇÜLÜYOR. bug değil, fizik."
- streç kumaş esner; dokuma kumaşın bolluk payları örgüde fazla gelir.
- kumaş ekseni: örgüde bütün bolluklar otomatik iniyor (göğüs 11'den 4'e...).

C3 · HOOK: "pileli etek aslında üç dikdörtgen ve bir sürü katlama çizgisi."
- pilenin matematiği: 3x kumaş + kat çizgisi çiftleri. motor çiftleri işaretliyor, rehber "ikinci çizgide katla, birinciye getir" diyor.

C4 · HOOK: "bugün motoruma pervaz çizmeyi öğrettim çünkü yakanın içi ortada kalıyordu."
- her elbise/üstte yaka pervazı otomatik çiziliyor; pervazın iç kenarı yakayı BİREBİR takip ediyor.
- validator kuralı: pervaz yakadan 1.5mm saparsa taslak bloklanıyor.

## seri D — vision (fotoğrafı okuyan göz)

D1 · HOOK: "yapay zekam yerde süzülen gece elbisesine 'mini' dedi."
- çünkü boyu kadrajdan tahmin ediyordu.
- kural girdi: boy VÜCUDA göre okunur; gelinlik ve gece elbisesi her zaman maxi.

D2 · HOOK: "couture görünce pes ediyordu. artık pes etmek yasak."
- talimat: en karmaşık parçada bile dikilebilecek EN YAKIN taban silueti döndür + neyi yaklaştırdığını açıkça söyle.
- dior vitrini → "empire kolon, korsaj işlemesini yaklaştırdım" diye dönüyor.

D3 · HOOK: "canlı fotoğraf testi olmasa bu bug'ı asla görmeyecektim."
- motorun bir parçasının adı 'Skirt Skirt Panel' çıkıyordu. kod okuyarak fark edilmiyor; gerçek foto akışında bir bakışta görüldü.

D4 · HOOK: "fotoğraftaki kumaşın adını da tahmin ediyor ve UYDURMUYOR."
- satin mi şifon mu jarse mi; sonra doğrulanmış kumaş veritabanıyla çaprazlıyor.
- bilmediği kumaşta dürüst: "bunun için doğrulanmış rehber yok, önce artık parçada dene."

## seri E — couture kelime dağarcığı

E1 · HOOK: "quinceañera etekleri neden o kadar kumaş yiyor? matematiğini çıkardım."
- kademeli fırfır: her kat üstündeki katın kenarına büzülüyor → kumaş üstel büyüyor.
- 3 katlı fırfırda en alt kat TEK BAŞINA 23 metre şerit. motor hem çiziyor hem metreye dürüst yansıtıyor. [render]

E2 · HOOK: "fırfırın sadece en alt katına baskı payı verdim. neden?"
- ara katların alt kenarı zaten bir sonraki katı karşılayan dikişin içinde kayboluyor.
- terzilik detayı koda veri oldu: son kat 1cm kıvrım, ara katlar dikiş payı.

E3 · HOOK: "kalp yaka çizdim, v yaka çıktı. beğenmedim, matematiği değiştirdim."
- 4 aday eğriyi yan yana çizdirip GÖZLE seçtim: merkezde dik çentik + göğüs üstünde yuvarlak lob kazandı.
- geometri zevk işiyse son sözü formül değil göz söylüyor. [render: 4 aday yan yana]

E4 · HOOK: "bugün bir bug yedim çünkü aynı sayıyı iki yer AYRI hesaplıyordu."
- kalp yakaya genişlik verince pervaz yakayla buluşamadı: korsaj ve pervaz yaka genişliğini ayrı ayrı hesaplıyormuş.
- tek fonksiyona bağladım. kural: bir gerçek, bir yerde yaşar.

E5 · HOOK: "anahtar deliği yakayı kalıba PARÇA olarak çizmedim. gerçek terziler de çizmez."
- keyhole ön parçaya dikiş ÇİZGİSİ olarak işlenir: pervazı çizgiye dik, içini yar, içeri çevir, ütüle.
- motor pervaz parçasını üretiyor, adımları rehberin doğru yerine sokuyor.

E6 · HOOK: "motorum bazen 'bu elbiseye anahtar deliği SIĞMAZ' diyor. bu bir özellik."
- kısa korsajda (babydoll) yer yoksa sessizce atlamıyor; rehbere "korsaj buna kısa" notu düşüyor.
- sessiz eksik = yalan. dürüst atlama = güven.

## seri F — denetim günü (gemiyi kontrol ettik)

F1 · HOOK: "ürünümde müşterinin ancak KUMAŞI KESTİKTEN sonra göreceği bir bug buldum."
- baskı yerleştiricim düzeni 95cm'e sığdırıyordu; fırfır şeritleri 140cm.
- 95'ten sonrası SESSİZCE basılmıyordu. hata yok, uyarı yok.
- ürünü müşteri gibi yürüyünce çıktı. logda görünmez, yolda görünür.

F2 · HOOK: "yirmi boş sayfayı çöpten kurtardım çünkü terziler dikdörtgene kağıt basmaz."
- düz şeritlere artık kalıp kağıdı yok: kapakta "kumaşa cetvel-tebeşirle çiz" ölçüsü.
- gerçek dünya pratiği > yazıcı mürekkebi.

F3 · HOOK: "web'in gönderebileceği 16.795 kombinasyonun HEPSİNİ test ettim."
- her yaka × kol × etek × bel × kumaş × fırfır × keyhole, 5 uç vücutta, baskı matematiği dahil.
- sıfır kırpılma, sıfır hata. artık her değişiklikte koşuyor. [terminal]

F4 · HOOK: "kullanıcı bel 140 göğüs 60 girerse ne olur?"
- motor taslağı güvenlik kontrolünde durduruyor (doğru), ama mesaj 'bu olmamalıydı' diyordu (yanlış — suçu üstleniyordu).
- yeni mesaj: "en sık neden ölçü yazım hatası, yedi ölçünü kontrol et." dürüstlük ayarı.

F5 · HOOK: "bugün çalışan bir özelliği KAPATTIM."
- landing'den kalkmış bir 'dikiş duvarı'nın herkese açık yazma uçları sunucuda açık duruyordu.
- kullanan yok ama kapı açık. uyuttum: kullanılmayan kapı, kapanmış kapıdır.

## seri G — kendi göz (vision'ı sahiplenme)

G1 · HOOK: "bedava yapay zekayı sınava soktum: yüzde 44. yaka tanımada yüzde 6."
- 19 gerçek fotoğrafı elle etiketledim, CLIP'i karşısına koydum.
- neredeyse her yakaya "kayık yaka" diyor. ölçülmüş yenilgi > tahmin edilen zafer.

G2 · HOOK: "daha iyi model denedim: 65. çıtamız 95. arada dağ var ve dağın haritası çıktı."
- siglip kol ve kumaşta iyi, etek stili ve boyda yazı tura.
- v0'ın işi kazanmak değildi, çıtayı ölçmekti. ölçtük.

G3 · HOOK: "pahalı öğretmen, bedava öğrenci: planım bu."
- bugünkü büyük model benim el etiketlerimle %86 anlaşıyor (boy/bel/kumaşta %100).
- plan: ona binlerce fotoğraf etiketletip KÜÇÜK kendi modelimizi eğitmek. tarayıcıda bedava koşacak.

G4 · HOOK: "gerçek bir quinceañera fotoğrafı attım, sistem 'kalp yaka + kademeli fırfır' dedi."
- o gün eklediğim üç kelimenin üçü de doğru okundu, kalıp çizildi.
- uçtan uca canlı kanıt günü. [canlı ekran kaydı]

## seri H — marka ve zevk

H1 · HOOK: "markamın ana rengini bir günde emekli ettim."
- teal her yerdeydi; couture dünyasına dönünce sırıttı. tek vurgu: vişne.
- sitede tek teal piksel kalmayana kadar taradım. tutarlılık güven verir.

H2 · HOOK: "bir kumaş dokusu için 15 deneme yaptım, 15'i de çöp."
- su dalgası çıktı, et gibi ipek çıktı... saatler.
- ders ve yeni kuralım: görsel zevk tahmin edilmez; 2-3 turda oturmuyorsa DUR, somut referans al.

H3 · HOOK: "landing'imdeki kalıplar süs değil, motorun GERÇEK çıktısı."
- pafta görselleri gerçek çizimlerden üretiliyor; sahte mockup yok.
- "is it slopware?" bölümü de var; cevabı motor veriyor.

## sıradaki bölümler (geliştikçe eklenecek)
- halter yaka: omuz dikişini tamamen kaldırmak (yapım aşamasında)
- fiziksel dikim: motorun kalıbından gerçek elbise, kamerada
- kendi göz v1: damıtılmış model tarayıcıda
