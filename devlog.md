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

## seri I — halter (omuz dikişini kaldırdık)

I1 · HOOK: "bugün motorumdan omuz dikişini tamamen kaldırdım."
- halter yaka: askı enseden bağlanıyor, omuzlar açık, sırt alçak. bu bir yaka değil, korsajın yeniden inşası.
- ama korsaj iskeletini BAŞTAN yazmadım — hile: çerçeve kaydırma. [render]

I2 · HOOK: "yeni bir kalıp bloğu yazmak yerine koordinat sistemini kandırdım."
- motorun iskeleti hep aynı noktaları bilir: yaka noktası, omuz ucu, kol oyuntusu.
- halter'da "omuz ucu" askının dış köşesi oldu, "kol oyuntusu" omzu açıkta bırakan süpürme eğrisi.
- aynı kod, kaydırılmış çerçeve: sıfır kopya formül. bir gerçek, bir yerde yaşar.

I3 · HOOK: "motorum bazen prenses dikişini REDDEDIYOR ve haklı."
- büyük beden + empire + halter'da sırt o kadar kısalıyor ki prenses dikişine dikey yer kalmıyor; eğri kırılıyordu (70.200 taslaklık test yakaladı).
- karar: yer yoksa BÖLME — o yarım dürüstçe pens moduna düşüyor. zorla güzellik olmaz.

I4 · HOOK: "kullanıcı halter'a kol seçerse ne olur?"
- kol takacak omuz yok. sessizce yok saymak = yalan.
- motor kolu atlıyor VE rehbere yazıyor: "halter'da kol asılacak omuz yok, kol seçimin atlandı."
- arayüzde de halter seçince kol seçici zaten kayboluyor. çifte dürüstlük.

I5 · HOOK: "halter'ın pervazı yok. şerit var."
- yaka pervazı yerine TEK bias şerit her ham kenarı sarıyor: askı, yaka, süpürme, sırt üstü.
- şeridin boyu motorun kendi geometrisinden ölçülüyor (askı + yaka + süpürme + sırt, çarpı iki, artı pay).
- ve şerit kağıda basılmıyor: kapakta "kumaşa 45 derece verevden çiz" notu. terzilik pratiği > mürekkep.

## sıradaki bölümler (geliştikçe eklenecek)
- fiziksel dikim: motorun kalıbından gerçek elbise, kamerada
- kendi göz v1: damıtılmış model tarayıcıda
- sıradaki kelimeler: off-shoulder, cowl, peplum, wrap (spec ajanı çalışıyor)

## seri J — dikiş payı ve mikrometre günü

J1 · HOOK: "kalıplarımda artık İKİ çizgi var ve bu bir tartışmayı bitirdi."
- dış kalın çizgi: kesim (pay dahil). içteki ince: dikiş. düşünmek yok: dıştan kes, içten dik.
- neden: acemi payı eklemeyi unutur, kumaşı dar keser, elbise çöp. en kötü hata modunu sildik. [render]

J2 · HOOK: "payı çizen kodum ilk denemede İÇERİ çizdi ve testler bunu yakaladı."
- kesim çizgisi = dikiş çizgisinin dışa ötelenmişi. hangi taraf 'dışarı'? çizim yönüne güvendim, yanıldım.
- artık motor kendisi yokluyor: en uzun kenardan bir adım at, poligonun içinde mi kaldın? o zaman öbür taraf.
- ders: yön varsayılmaz, sorgulanır.

J3 · HOOK: "kol altı kavisi payı yedi: içbükey köşenin intikamı."
- kavisin yarıçapı paydan küçükse ötelenen çizgi kendi üstüne kıvrılıyor.
- çözüm: zarf garantisi — her nokta dikiş çizgisine tam pay mesafesine İTİLİYOR, üç geçişte yakınsıyor.
- katlama kenarı istisna: orası dikiş değil, pay sıfır. motor bunu da biliyor. [render]

J4 · HOOK: "terzinin mikrometresini yazdım ve motorumda 10 milimetrelik bir açık buldum."
- yeni araç: dikişçinin GERÇEKTEN birbirine iğneleyeceği her çifti ölçüyor. omuz, yan, prenses, bel, kol, pervaz.
- ilk rapor: ön omuz 148, arka omuz 138. on milimetre. yıllardır kimsenin bakmadığı dikiş.
- sebep zarif: arka yaka anatomik olarak daha geniş, ama omuz ucu iki tarafta aynı yerdeydi.

J5 · HOOK: "iki düzeltme, sıfır milimetre."
- omuz: arka uç kendi dikiş doğrultusunda kayıyor, ön=arka.
- empire yan dikişi: kısa dikişte 2mm birikiyordu; kısa tarafın bel ucu delta kadar iniyor.
- son rapor: en kötü çift farkı 0.00 mm. yetmiş bin taslak yeşil.
- bonus: imkansız sanılan bazı vücut kombinasyonları artık geçerli çıkıyor, çünkü sorun vücut değil bizim dikişimizmiş.

## seri K — testler yeşildi, ürün bozuktu (adversarial denetim gecesi)

K1 · HOOK: "60.300 testim yeşildi ve her kolum dardı."
- motoruma dışarıdan usta terzi gözüyle sert denetim koşturdum. tek cümle döndü: kol, oyuntuya sadece UZUNLUĞUYLA oturuyor, GENİŞLİĞİ hiç kontrol edilmiyor.
- pazı çizgisi hesaplanıyordu ama sadece aramanın başlangıç sınırı olarak; sonra unutuluyordu. [terminal]

K2 · HOOK: "bust 116 bir vücutta kol 76 milimetre dardı. koltuk altı dikişi kapanmaz."
- kol 324mm çıkıyordu, pazı çizgisi 400mm. her kollu parça etkileniyordu.
- matris niye yeşildi? tek kol kontrolü "cap uzunluğu" ve "cap payı"ydı — zaten aramanın çözdüğü iki şey. test kendi çözdüğünü doğruluyordu.

K3 · HOOK: "düzeltme klasik terzilik: önce pazı çizgisini çiz."
- genişliği pazıya sabitle, cap'i bu kez YÜKSEKLİĞİNİ alçaltarak oyuntuya oturt. geniş kol + sığ cap = gevşek takmanın doğru, dikilebilir hali.
- kol artık her vücutta pazıya tam oturuyor, cap payı hâlâ %1-9 penceresinde. [terminal: ctest 9/9]

K4 · HOOK: "bir hatayı düzeltmek yetmez, geri gelemeyeceğini garantile."
- motora "kol pazıdan darsa testi patlat" kuralı + tüm vücut/kumaş/kol boyu kombinasyonlarını gezen sleeve_check ekledim.
- golden yeniden sabitlendi: SADECE kol ve manşet satırları değişti, diğer her parça bit-bit aynı. yani düzeltme temiz.

K5 · HOOK: "halter kalıbında gizli bir kırık vardı, 552 taslağı bloke ediyordu."
- kısa halter sırtında prenses dikişi cap'e varırken son adımda sertçe kırılıyordu (25° kuralını 26°'ye taşıyordu).
- sebep: dikey iniş payı sırtın yüksekliğine bağlıydı, halter sırtı alçalınca pay yetmiyordu. payı yatay mesafeye tabanladım. golden bit-bit aynı, kırık gitti.

K6 · HOOK: "imkansız bir vücut girersen artık tek net cümle görüyorsun, 8 şifreli hata değil."
- göğsü 160 beli 45 olan bir vücut (yazım hatası) motoru kilitliyordu ve kullanıcı "kendi kendine kesişti" gibi anlamsız hatalar görüyordu.
- daha kötüsü: bu taslakların çoğu doğrulamayı geçip SESSİZCE hatalı kalıp basıyordu. artık en başta "ölçülerini kontrol et" diyen tek okunur sebep çıkıyor.

## seri L — motor artık bir API (iş modeli)

L1 · HOOK: "motorumu bir API'ya çevirdim ve çağrı başı maliyetim SIFIR."
- aynı c++ motoru bu kez sunucuda koşuyor: POST /api/draft'e 7 ölçü + tarif, sana kalıp + dikiş rehberi + kumaş hesabı dönüyor.
- kritik: hiçbir çağrı yapay zeka modeline gitmiyor. bir kalıp motoru satmak ile ay sonunda yapay zeka faturası ödemek arasındaki fark bu. [terminal]

L2 · HOOK: "tarayıcı sürümü sunucuda çalışmadı ve sebebi öğreticiydi."
- tarayıcı wasm'ını fetch/xhr ile çekiyor. cloudflare worker'da o API'ler yok — worker bir web worker değil, bir v8 izolatı.
- ayrı bir derleme çıkardım, precompiled wasm modülünü motora instantiateWasm ile elle verdim. çalıştı.

L3 · HOOK: "çalışan endpoint ile satılabilir API ayrı şeyler."
- girişi önce doğruluyorum: bilinmeyen bir yaka değeri sessiz varsayılana düşmüyor, net 422 dönüyor. yedi ölçü sayısal + aralıkta.
- en önemlisi: doğrulamayı geçemeyen taslak 200'le bozuk kalıp değil, 422 "çizilemez" + sebep dönüyor. API müşterinin kumaşını harcatamaz.

## seri M — moat: rakip vs kanıt

M1 · HOOK: "rakibim tam benim yaptığım şeyi satıyordu ve bu iyi haberdi."
- StitchLift: foto→kalıp, grading bile var, aylık $34-49. panik yapabilirdim.
- sitesini didikledim: HİÇBİR doğruluk iddiası yok. ne benchmark, ne sew-test, ne yorum. herkes "yapay zeka kalıp çiziyor" diyor, kimse "şu kadar doğru" demiyor. moat orada.

M2 · HOOK: "kimsenin yayınlamadığı sayıyı yayınladım: kalıbım ne kadar oturuyor."
- yüzlerce kalıbı pear/apple/hourglass vücut ızgarasında çizip ölçtüm.
- her prenses+yan dikiş çifti eşleşiyor, bitmiş bel vücut+pay'a medyan 9mm yakın, kolların hepsi dikilebilir pencerede. [terminal]

M3 · HOOK: "kendi benchmark'ımı denetledim ve kendimi hile yaparken yakaladım."
- "0.00mm dikiş eşleşmesi" aslında motorun içinde eşitlediği TEK sayıyı iki kez okuyordu: x eksi x. sıfır çıkması matematik, kanıt değil.
- yeniden yazdım: artık her kenar KENDİ çizilen parçasından bağımsız ölçülüyor. 0.00mm artık gerçek (max 0.000023mm). en tehlikeli hile kendini kanıtladığını sandığın ölçüdür.

M4 · HOOK: "ölçemediğim şeyi rapora YAZMADIM ve bu bir güç."
- bust çevresini bilerek atladım: 2B parçadan temiz ölçülemiyor. güven, abartıdan değil, neyi bilmediğini söylemekten gelir.

## seri N — müşteri gözü (dört gerçek insan)

N1 · HOOK: "mühendis gözünü bıraktım, dört gerçek müşteri hayal ettim."
- Ayşe (Türk, telefonda), Maria (Etsy satıcı), Jenny (plus-size), Sam (acemi). her biri tek soru: "bu benim işime yarıyor mu?"
- dördü de bir yerde takıldı. o kırılmaları düzelttim. [canlı]

N2 · HOOK: "Türk dikişçi, dikiş rehberini İngilizce alıyordu — bir adım yanlış anlaşılsa kumaş çöp."
- landing'i tamamen Türkçeleştirdim, rehberin ve baskı talimatlarının hepsini doğru Türkçe dikiş terimleriyle çevirdim (ara dikiş, biye, tela, pens...).
- 60.480 draft'ta 0 eksik çeviri. Türk müşteri artık uçtan uca kendi dilinde.

N3 · HOOK: "dolgun göğüslü her kadının ömür boyu derdini motorumda buldum."
- her ticari kalıp yakada açılır çünkü göğüs kafesini "göğüs eksi 7cm" varsayar. gerçekten dolgun göğüste bu sırtı 15cm büyük çizer = açılan yaka.
- opsiyonel üst-göğüs ölçüsü ekledim: motor artık kafesi ÖLÇÜYOR, varsaymıyor. Jenny açılmayan yakayla kendi vücuduna kalıp alıyor. [terminal: golden bit-bit aynı, 72/72 valid]

N4 · HOOK: "acemi jargonda boğuluyordu, ürün 'cep dikiş öğretmeni' diyordu."
- pens, biye, kol başı, ara dikiş — her terim artık tıklanınca düz açıklama veriyor. LinkedIn'den gelen meraklı takip edebiliyor.
- bir de her ölçünün nereden alındığını gösteren minik manken diyagramı. kimse nereden ölçeceğini bilemez kalmasın.
