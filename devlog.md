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

## seri O — bir tasarım, bütün beden serisi (grading)

O1 · HOOK: "Etsy'de kalıp satacaksan bir bedeni çizmen yetmez, EU34'ten 52'ye hepsini çizmen lazım."
- buna "grading" (bedenleme) deniyor. normalde ayrı bir kurallar tablosuyla elle yapılır.
- ben ayrı kural yazmadım: motorum zaten her vücuda çiziyor, o yüzden bedenleme = tasarımı her standart bedene tek tek çizdirmek. tek tık, bütün seri. [canlı]

O2 · HOOK: "bedenlenmiş seri gerçekten büyüyor mu, yoksa aynı kalıbı mı çoğaltıyorum? test ettim."
- kandırmama testi: her bedeni çizip ön panel genişliğini ölçtüm.
- EU34'te 188.6mm, EU52'de 236.2mm — monoton büyüyor, her beden temiz. golden referans bit-bit aynı kaldı. [terminal]

O3 · HOOK: "bir Etsy satıcısı gözüyle denettim, iki kere kumaşı çöpe attıracak hata buldu."
- (1) kapakta her bedenin bust/waist/hip cm'si yoktu — alıcı hangi beden benim diye bilemez.
- (2) iç sayfalarda beden yazmıyordu — karışan sayfalar yanlış bedenden kesilir.
- ikisini de kapattım: kapakta gerçek beden tablosu + her sayfanın köşesinde vişne beden damgası. [baskı]

## seri P — motoru ders kitaplarına karşı yargılamak (doğruluk)

P1 · HOOK: "kendi kalıp motorumu iki dikiş ders kitabına karşı mahkemeye çıkardım."
- Aldrich ve Armstrong — sektörün iki kutsal kitabı. motorun her bloğunu (beden, kol, etek, yaka, bedenleme) tek tek bu ikisine karşı ölçtüm.
- kural: bir formülü sadece iki kitap da aynı şeyi söylüyorsa VE benimki net yanlışsa değiştir. [rapor 16 tem]

P2 · HOOK: "değiştirdiğim formül sayısı: sıfır. motor denetlenmeye dayandı."
- her sapma ya iki kaynak arasında bir bantta, ya tek kaynak, ya da kodda zaten 'varsayım' işaretli.
- bilmediğim değeri uydurmadım, 'doğrulanmalı' diye işaretledim. yanlış referans = yanlış düzeltme. [audit]

P3 · HOOK: "bir an 'bu bir hata mı' dedim — sonra Aldrich'in de aynı yerde durduğunu gördüm."
- motor büyük bedenlerde beden başına +4cm yerine +6cm'ye geçiyor. tesadüf sandım.
- Aldrich'in kendisi de büyük bedenlerde tam bu iki-kademeli artışa geçiyor. doğru sebeple aynı noktadayız. [grade tablosu]

## seri Q — iç içe beden serisi (nested pdf, moat parçası)

Q1 · HOOK: "Etsy'deki her kalıp satıcısı bunun için ayrı program kullanıyor, ben motora koydum."
- endüstri standardı 'nested PDF': tüm bedenler tek sayfa setinde üst üste, her beden kendi çizgi renginde. bir kez yazdır, ihtiyacın olan rengi takip et.
- StitchLift + her Etsy rakibi ya beden başına ayrı baskı veriyor ya hiç. stitchu tek baskıda 10 beden. [canlı v49]

Q2 · HOOK: "10 bedeni üst üste çizince nasıl karışmıyor? her birine kör-dostu renk + kesikli çizgi verdim."
- vişne marka rengi en üstte, sonra 9 ayrı renk. renk körü için her renge ayrı kesik desen — siyah-beyaz yazıcıda bile ayrışıyor.
- hepsi ortak köşeden hizalı (küçük beden büyüğün tam içinde). kapakta renk→beden efsanesi + beden tablosu. [baskı]

## seri R — motoru ders kitaplarına karşı yayınlamak (benchmark sayfası)

R1 · HOOK: "'yayınlanmış benchmark' diyordum ama tıklayacak bir sayfa yoktu. artık var."
- landing 'kanıtı yayınlıyoruz' diyor — ama kanıt gidilebilir bir yer değildi. benchmark.html'i kurdum: 0.00mm dikiş, 1-9% kol bolluğu, 70.200 taslak.
- üstüne bugünkü Aldrich/Armstrong denetimini koydum: hangi blok, hangi kaynak, karar. [canlı]

R2 · HOOK: "rakip ayda 34-49 dolar alıyor ve tek bir doğruluk sayısı yayınlamıyor."
- matematik herkeste aynı. kimsenin yapmadığı: ölçmek, literatüre karşı denetlemek, sayıyı okunabilir yere koymak.
- artı ölçüler cihazdan hiç çıkmıyor. hendek bu. [benchmark.html]

## seri S — BENCHMARK-58 (58 gerçek fotoğrafla "yaptım" sayacı)

S1 · HOOK: "ürünüme karne verdim: 6/54. ve buna sevindim."
- 59 gerçek etsy ekran görüntüsü: 54 giysi + 5 tuzak (çanta, uygulama ekranı, kalıp çizimi). hepsini tek tek etiketledim, canlı sistemden geçirdim.
- 6 tam kalıp, 45 eksik öğeli, 3 yanlış. sayı acı ama teşhis net: görme değil, çizim dağarcığı eksik. [terminal]

S2 · HOOK: "yapay zekam fotoğrafı doğru okuyor ama motorum o kelimeyi çizemiyor."
- 45 "eksik öğeli"nin çoğunda yaka/kol/etek doğru okundu. eksik olan düğme patı, boyun bağı, yaka gibi öğelerin ÇİZİM formülü.
- en sık eksikler: bağ/kurdele 20 fotoğraf, düğme patı 19, yaka 9, yoke 9. sıradaki loop'lar bu listeden. [terminal]

S3 · HOOK: "benchmark koşumu kendi güvenlik korumam engelledi."
- api'me koyduğum rate-limit füzesi (3/dk) kendi benchmark'ımı da yedi. kendi kv sayaçlarımı resetledim; ama kv eventual-consistent, silme ~60 sn'de yayılıyor.
- çözüm: 21 sn/çağrı tempo. kendi korumanla yarışmak da bir dağıtık sistemler dersi. [terminal]

S4 · HOOK: "yapay zekam elbiseyi 'düğmeli yakalı' diye bir CÜMLEYE yazıyordu. cümleyle kalıp çizemezsin."
- o serbest metni öldürdüm. yerine yapısal alanlar: closure (nasıl kapanıyor), collar, straps, yoke, backDetail + outOfVocab[] = çizemediğim ama gördüğüm her öğenin adı.
- alanları hisle değil frekansla seçtim: loop 0'da bağ 20 fotoda, düğme 19'da, yaka 9'da. [terminal]

S5 · HOOK: "iki eski hatamı prompt'a tek cümle yazarak düzelttim."
- loop 0'da fırfırlı askıyı 'kol' sanmıştım, boat yakaya 'square' demiştim. modele tarif yazdım: sleeve kolu SARAR, strap dar banttır kol çıplaktır; boat yüksek+geniş, square alçak+köşeli.
- canlı 6 fotoda ikisi de düzeldi. straps=ruffled, neckline=boat. [terminal]

S6 · HOOK: "sayım değişmedi. ve buna sevindim — çünkü değişmemesi doğruydu."
- FULL 6/54'te kaldı çünkü motor öğeleri hâlâ ÇİZMİYOR. bu oturum sadece boruyu döşedi: görü→spec taşıma.
- yeni bir istatistik ekledim: yapısal alanlar çizilemeyen öğeyi kaç fotoda yakaladı. ürün sayısı ile kabiliyet sayısını AYRI ölçmek, 'ilerliyorum' yalanını söylememenin yolu. [terminal]

# TECH/AI/CV STOĞU (loop'suz kavram reel'leri — şablon: BENCHMARK-58.md protokolü)
## Reel — AI'ım her şeyi görüyor ama eli yok

**Hook (ilk 2 sn):** "Yapay zekam fotoğraftaki düğmeyi gördü. Sonra düğmesiz bir kalıp çizdi. Neden?"

**Anlatı (~40 sn):** Ürünüm fotoğraftan dikiş kalıbı çıkarıyor. Kullanıcılar "düğmeyi görmüyor" diye düşünüyordu. Testi yaptım: 54 gerçek ürün fotoğrafını zincirden geçirdim. Sonuç ters köşe — görme tarafı NEREDEYSE KUSURSUZ. Düğme patını, yakayı, korseyi tek tek doğru okuyor. Sorun başka yerde: gördüğünü serbest bir cümleye yazıyor, "düğmeli, hakim yakalı" diye. Ama kalıbı çizen matematik motorunun sözlüğünde "düğme patı" diye bir formül yok. Yani göz var, el yok, ikisinin arasındaki boru da taşımıyor. Ders şu: kullanıcının şikayeti hangi parçada, tahmin etme — zinciri parça parça test et. Ben "görmüyor" sanıp aylarca yanlış yeri tamir edebilirdim.

**Görsel:** solda fotoğraf + vision çıktısı ("front button placket" yazısı vurgulu), sağda çizilen kalıp — düğme yok. Alt yazı: "gören göz ≠ çizen el".
**Format:** reel

## Reel — ürünüme yalan söyletmeyi bıraktım (loop 2)

**Hook (ilk 2 sn):** "Ürünüm çizemediği şeyi sessizce en yakınıyla değiştirip sanki senin istediğini yapmış gibi davranıyordu. Bugün ona sustuğu yeri söylettim."

**Anlatı (~45 sn):** Motorum bir fotoğraftan dikiş kalıbı çıkarıyor. Ama bazı şeyleri henüz çizemiyor — düğme patı, ayrı yaka parçası, fırfırlı askı, korsenin kup dikişi. Eski hâlinde ne yapıyordu biliyor musunuz? Çizemediği zaman en yakın bloğu SESSİZCE veriyordu. Sen düğmeli bir bluz fotoğrafı yüklüyorsun, o düğmesiz düz bir kenar çiziyor ve tek kelime etmiyor. En büyük güven kıran buydu. Bu oturumda dürüstlük katmanı ekledim, tek bir kaynaktan: motor çizemediği her öğe için ÖNCE en yakın türevini deniyor — düğme yerine düz dikişli açıklık, puf istenirse balon kol, korse yerine pensli göğüs — SONRA sana açıkça yazıyor: "bunu gördüm, kalıpta çizemedim, sana en yakın şunu verdim, kalanını elle şöyle ekle." Hem ekranda vişne bir kartta, hem de baskı kapağında — çünkü kalıbı kesen kişi de bunu görmeli. Motorun C++ koduna hiç dokunmadım; bu tamamen görünürlük katmanı, o yüzden eski kalıpların tek biti bile oynamadı. Ders: bir ürün eksiğini saklarsa kullanıcı onu güvensizlik olarak yaşar; aynı eksiği açıkça söylerse dürüstlük olarak yaşar. Aynı eksik, iki farklı ürün.

**Görsel:** solda fotoğraf (düğmeli bluz), sağda kalıp + altında vişne kart: "gördüm: düğme patı — verilen en yakın: düz dikişli açıklık, düğmeleri elle işaretle". Alt yazı: "sessiz fallback öldü".
**Format:** reel

## Reel — kendi güvenlik duvarıma takıldım

**Hook (ilk 2 sn):** "Testim 19 dakika sürdü. Suçlu: kendi yazdığım güvenlik önlemi."

**Anlatı (~35 sn):** Ürünüme kötüye kullanım sigortası koymuştum: bir kullanıcı günde en fazla 15 fotoğraf analiz edebilir. Güzel. Sonra kendi ürünümü 54 fotoğrafla test etmem gerekti — ve kendi sigortama takıldım. Çözüm sayaç sıfırlamak ama orada ikinci ders: sayaçlar Cloudflare KV'de duruyor ve KV "eventual consistency" çalışıyor. Yani sıfırladığın değerin dünyaya yayılması saniyeler alıyor; erken davranırsan hâlâ eski sayıyı görüyorsun. Foto başına 21 saniye bekleyerek yürüdüm: 19 dakika. Ders: güvenlik önlemi yazarken "bunu test ederken ben nasıl geçeceğim" sorusunu da o gün cevapla, test günü değil.

**Görsel:** terminalde akan test satırları + aralarda bekleme sayacı. Alt yazı: "rate limit: 15/day. tester: me."
**Format:** reel

## Reel — kendi güvenlik duvarımı deldim ama sadece kendime (loop 1b)

**Hook (ilk 2 sn):** "Kendi ürünümün güvenlik duvarına gizli bir kapı açtım — ve o kapının anahtarı sadece bende."

**Anlatı (~40 sn):** Geçen sefer testim 19 dakika sürüyordu çünkü kendi koyduğum "günde 15 fotoğraf" sigortasına kendim takılıyordum. Bu sefer düzgün çözdüm. Sunucuya gizli bir bypass koydum: istekte doğru gizli anahtar (secret) varsa sigorta atlanıyor, test uçuyor. Ama tehlike şu — bir bypass yanlış yapılırsa herkes limiti aşar. O yüzden üç kural: birincisi anahtarın DEĞERİ hiçbir zaman kodun içine yazılmıyor, Cloudflare'ın secret kasasında ve bilgisayarımda gizli bir dosyada duruyor, github'a asla çıkmıyor. İkincisi karşılaştırmayı sabit-uzunlukta yapıyorum, yani "anahtarın kaçıncı harfi tuttu" bilgisini zamanlamayla sızdırmıyorum. Üçüncüsü gerçek kullanıcının limiti tık kadar değişmedi — anahtarı olmayan, yanlış anahtarı olan herkes hâlâ günde 15'e takılıyor. Canlıda kanıtladım: anahtarımla 25 ardışık çağrı, tek bir engel yok; anahtarsız 20 çağrının 15'i duvara çarptı. Testim 19 dakikadan bir buçuk dakikaya indi. Ders: bir arka kapı açacaksan, önce onu sadece sana açık tutmanın matematiğini kur.

**Görsel:** solda anahtarlı terminal (25/25 akıyor, hepsi geçiyor), sağda anahtarsız terminal (429 429 429 kırmızı duvar). Alt yazı: "secret door, but only for me".
**Format:** reel

## Reel — 0.00mm ne demek, neden takıntılıyım

**Hook (ilk 2 sn):** "Kalıbında yarım milimetre hata olsun, dikişte üç santim kayarsın. Nasıl mı?"

**Anlatı (~40 sn):** Dikiş kalıbında iki parça birbirine dikilir: mesela korsajın yan dikişi ile arkanın yan dikişi. Bu iki kenarın UZUNLUĞU eşit olmak zorunda — buna truing deniyor. Eşit değilse kumaş ya büzülür ya potluk yapar, ve hata dikiş boyunca birikir. Benim motor her kalıbı çizdikten sonra bütün eş kenarları ölçüyor ve fark 0.00mm değilse test FAIL veriyor. Elle kalıp çizen biri bunu cetvelle, mezurayla kontrol eder; benim motorda bu bir matematik garantisi. Rakiplerin hiçbiri bu sayıyı yayınlamıyor. Ders: iddia herkesin, ölçüm cesaret isteyen şey.

**Görsel:** iki kalıp kenarı yan yana, üstlerinde uzunluk etiketi, fark: 0.00mm yeşil tik. Alt yazı: "truing: the boring word that decides fit".
**Format:** reel

## Reel — kod değişti, çıktı bitine kadar aynı kalmalı

**Hook (ilk 2 sn):** "Motoruma yeni özellik eklerken en çok korktuğum şey: eski müşterinin kalıbının BİR bit oynaması."

**Anlatı (~40 sn):** Buna golden test deniyor. Motorun bilinen girdiler için ürettiği çıktıları dosya olarak donduruyorum — altın kopya. Her kod değişikliğinden sonra motor aynı girdilerle tekrar koşuyor ve yeni çıktı, altın kopyayla BYTE BYTE karşılaştırılıyor. Tek karakter fark = alarm. Neden bu kadar sert? Çünkü yeni bir yaka tipi eklerken farkında olmadan mevcut elbise formülünü de kımıldatabilirsin; kullanıcı dün indirdiği kalıbı bugün farklı alır ve bunu asla fark etmezsin. Golden test "yeni şey ekle ama eskiye dokunma" sözünün makine tarafından denetlenen hali. Ders: geriye dönük uyumluluk niyet değil, test.

**Görsel:** ekranda diff çıktısı: "golden: IDENTICAL". Alt yazı: "add the new, freeze the old".
**Format:** reel

## Reel — çantaya elbise kalıbı çizmemek de başarı

**Hook (ilk 2 sn):** "Test setime bilerek bir çanta fotoğrafı koydum. Neden?"

**Anlatı (~35 sn):** 54 giysi fotoğrafıyla ürünümü test ederken araya giysi olmayan şeyler de kattım: bir çanta, bir uygulama ekran görüntüsü, bir kalıp çizimi. Çünkü bir sistemin ne çizdiği kadar neyi ÇİZMEYİ REDDETTİĞİ de kalite. Buna doğru red deniyor — false positive'in panzehiri. Benimki çantayı ve ekran görüntüsünü doğru reddetti ama kalıp ÇİZİMİNE bakıp "elbise" dedi: çizimden bile silüet okuyor, fazla hevesli. Bu da düzeltme listeme girdi. Ders: sadece "doğru cevabı buluyor mu" diye test etme; "cevap olmayan yerde susuyor mu" diye de test et.

**Görsel:** üç kare: çanta → RED yeşil, app ekranı → RED yeşil, kalıp çizimi → "dress" kırmızı. Alt yazı: "a good model knows when to say no".
**Format:** reel

## Reel — tarayıcında çalışan C++ motoru

**Hook (ilk 2 sn):** "Kalıp motorumun sunucu maliyeti sıfır. Sırrı 90'ların dili: C++."

**Anlatı (~40 sn):** Ürünümün kalıp çizen beyni C++ ile yazılı — hız ve matematik hassasiyeti için. Ama kullanıcı bir web sitesine giriyor, uygulama indirmiyor. Nasıl? WASM — WebAssembly. C++ kodunu derleyip tarayıcının anladığı taşınabilir bir makine koduna çeviriyorsun; senin telefonunda, SENİN işlemcinde koşuyor. İki kazanç: ölçümlerin cihazından çıkmıyor (gizlilik) ve ben sunucu parası ödemiyorum — bin kullanıcı da gelse maliyetim aynı. Rakip bunu ayda 34 dolara abonelikle satıyor çünkü hesabı sunucuda yapıyor. Ders: mimari karar, fiyat etiketinin ta kendisi.

**Görsel:** şema: fotoğraf → tarayıcı içinde motor kutusu → kalıp; sunucu kutusunun üstü çizili. Alt yazı: "your body data never leaves your device".
**Format:** reel

## seri T — puzzle birleşmiyordu (register onarımı)

T1 · HOOK: "kalıbımı bastım, sayfaları yan yana koydum ve PARÇALAR BİRLEŞMEDİ."
- sayfa sayısı sorun değildi. sorun: kenar hizalama işaretleri eksikti, hangi sayfa hangisine gelecek belirsizdi.
- kullanıcı 25 kağıdı önüne serip "e şimdi ne" diyor. çıktı doğru, montaj imkansız. [baskı]

T2 · HOOK: "rakibin 700 TL'lik kalıbını satın aldım, sadece SAYFA sistemini çözmek için."
- onun A4'ünde olan bende olmayan her şeyi ekledim: görünür sayfa çerçevesi, dev grid kodu (A1/B2, masanın ucundan okunur), köşe register kareleri.
- köşe kareler bantlayınca komşuyla TAM KARE oluşturuyor — hizanın kanıtı. [baskı]

T3 · HOOK: "bir parça sayfadan taşıyorsa artık sana nereye gittiğini SÖYLÜYOR."
- devam okları: '→ B2'. hangi sayfada sürdüğü yazılı.
- ve boş (basılmayan) sayfaya asla işaret çıkmıyor — used-set kontrollü. temiz kağıt temiz kalır. [baskı]

T4 · HOOK: "bu onarımı yaparken kodun mimarisini de değiştirdim, çünkü aynı geometri iki yerde çiziliyordu."
- print (baskı) ve render (ekran) ayrı ayrı sayfa geometrisi hesaplıyordu → drift riski.
- sheet.js'i TEK KAYNAK yaptım; ikisi de oradan okuyor. bir de headless script gerçek ürün kodundan sayfa görselini üretiyor, her oturumda rakiple kıyaslayabiliyorum. [terminal]

## seri U — motoru ders kitaplarına karşı yargıladım (0 değişiklik)

U1 · HOOK: "motorumu iki klasik kalıp kitabına karşı denetledim. sonuç: HİÇBİR formülü değiştirmedim. ve bu iyi haber."
- kural: bir formülü ancak İKİ kaynak BİRDEN aynı diyorsa VE motor net yanlışsa değiştir.
- hiçbir sapma iki şartı birden sağlamadı. tek kaynağa dayanıp 'düzelttim' demek en kolay yalandı — yapmadım. [terminal]

U2 · HOOK: "eteğimin pensi ders kitabından 10mm kısa. neden düzeltmedim?"
- oran ve yön birebir doğru (arka pens > ön pens, tam kitaptaki gibi), sadece ikisi de 10mm kısa.
- ama bir kaynak (Aldrich) söylüyor, ikincisi (Armstrong) elimde doğrulanamadı. tek kaynakla değiştirmek kural dışı. golden'ı da bozardı. karar Damla'nın, oto yapmadım. [render]

U3 · HOOK: "dokümanımda bir yalan buldum ama kodda değil."
- FORMULAS.md 'göğüs ferahlığı %11' diyor. ama çizilen geometri %6.6 veriyor — çünkü arka panel underbust ile ölçekleniyor (full-bust mantığının parçası).
- kod doğru, YAZI yanlış. drafting hatası değil, dokümantasyon netsizliği. ikisini karıştırmamak önemli. [terminal]

## seri V — iki iş modeli (rakibi didikledik)

V1 · HOOK: "rakibim bir kalıbı GÜNLERCE elle çiziyor. ben saniyede. peki neden hâlâ ondan iyi değilim?"
- didikledik: onun elle yaptığının %80'i motorumda otomatik. ease, grading, özel beden — hepsi parametrik.
- onun TEK üstünlüğü kalıp değil SUNUM: güzel teknik çizim + 13 sayfa illüstre talimat. benim kapatmam gereken boşluk doğruluk değil, sunum. [render]

V2 · HOOK: "rakibin kalıbında 'eski sürüm dardı, müşteri şikayetiyle düzelttim' yazıyordu. bu benim en güçlü kanıtım."
- elle ease kararı = hata payı itirafı. o dar yaptı, elle düzeltti.
- benim motorum ease'i parametrik ekliyor (dokuma %11, örgü %4) → o hata sınıfını YAPI OLARAK yapamaz. [render]

V3 · HOOK: "vücut ölçüsü hassas veri diye motoru API yaptım ve çağrı başı maliyetim SIFIR kaldı."
- aynı C++ motoru Cloudflare Worker İÇİNDE koşuyor. tarayıcı wasm'ı fetch'liyordu, worker'da o yol yok → ayrı derleyip motora elle verdim.
- POST /api/draft: bozuk kalıp yerine '422 undraftable + sebep'. satılabilir çekirdek, yapay zeka maliyeti yok. [terminal]

# TECH/AI/CV STOĞU — yeni parçalar

## Reel — sayı 6/54'te kaldı ve buna sevindim

**Hook (ilk 2 sn):** "Bir oturum boyu çalıştım, ürün sayım hiç değişmedi. Ve mutluyum."

**Anlatı (~40 sn):** Ürünümü 54 gerçek fotoğrafla ölçüyorum: tam doğru kalıp çıkan foto sayısı = 6. Bir sonraki oturumda yapay zekanın gördüğünü motora taşıyan bir köprü kurdum. Sayı yine 6 kaldı. Çünkü motor o öğeleri hâlâ ÇİZMİYOR — ben sadece boruyu döşedim, eli eklemedim. Değişmemesi DOĞRUYDU. Buradaki tuzak şu: herkes ilerleme grafiğini yukarı çizmek ister, ve sahte yükseltmek çok kolaydır. Ben ürün sayısı (6) ile kabiliyet sayısını (yapısal alan öğeyi kaç fotoda yakaladı) AYRI ölçüyorum, tam da kendime 'ilerliyorum' yalanını söylememek için. İlerlemenin en dürüst kanıtı bazen değişmeyen bir sayıdır — yeter ki neden değişmediğini gösterebil.

**Görsel:** ekranda '6/54' sabit, altında ayrı bir çubuk 'yapısal yakalama' yükseliyor. Alt yazı: "product number vs capability number — measure them apart".
**Format:** reel

## Reel — göz var, el yok, boru taşımıyor

**Hook (ilk 2 sn):** "Yapay zekam fotoğraftaki düğmeyi görüyor. Motorum düğmesiz kalıp çiziyor. Suç kimin?"

**Anlatı (~40 sn):** 58 fotoğrafla zinciri parça parça test ettim. Sonuç ters köşe: görme tarafı neredeyse kusursuz — düğme patını, yakayı, korseyi tek tek okuyor. Ama gördüğünü SERBEST bir cümleye yazıyor ('düğmeli, hakim yakalı'). Kalıbı çizen matematik motorunun sözlüğünde ise 'düğme patı' diye bir formül yok. Yani göz var, el yok, ikisinin arasındaki boru da taşımıyor. Kullanıcının 'düğmeyi görmüyor' hissinin gerçek mekanizması bu: görüyor, kullanamıyor. Ders: kullanıcının şikayeti hangi HALKADA, tahmin etme — zinciri parça parça test et. Ben 'görmüyor' sanıp aylarca yanlış yeri tamir edebilirdim.

**Görsel:** üç kutu: FOTO → GÖRÜ ('front button placket' vurgulu) → MOTOR (düğmesiz kalıp). ortadaki boru kırık çizili. Alt yazı: "the eye sees, the hand can't — the pipe is the bug".
**Format:** reel

## Reel — hiçbir formülü değiştirmemek de karar

**Hook (ilk 2 sn):** "Motorumu iki ders kitabına karşı denetledim. Sıfır formül değiştirdim. Bilerek."

**Anlatı (~40 sn):** Kalıp motorumun her bloğunu iki yayınlanmış standarda karşı ölçtüm. Kuralım sertti: bir formülü ancak İKİ kaynak birden aynı değerde diyorsa ve motorum net yanlışsa değiştir. Sonuç: hiçbir sapma iki şartı birden sağlamadı. Her fark ya tek kaynaklıydı, ya savunulabilir bir bant içindeydi, ya zaten kodda 'varsayım' diye işaretliydi. Değiştirmedim. Çünkü tek kaynağa dayanıp 'düzelttim demek' en kolay, en tatmin edici yalandır — sanki iş yapmışsın gibi hissettirir. Gerçek disiplin, elini kolunu bağlayan kuralın kendine de uygulanmasıdır. Bir de dokümanımın kod ile çeliştiği bir satır buldum: yazı yanlıştı, kod doğruydu. İkisini karıştırmamak önemli — birini düzeltip diğerini bozarsın.

**Görsel:** motor değeri | Aldrich | Armstrong tablosu, hepsi 'karar: dokunulmadı' sütunu yeşil. Alt yazı: "changing nothing, on purpose, is also engineering".
**Format:** reel
