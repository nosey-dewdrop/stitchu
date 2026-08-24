# STITCHU GECE KOŞUSU v6 — ayrı context'li fazlar, daimi tarafsız hakem, sipariş-izlenebilir koşu

Bu dosya bir koşu protokolüdür, oturum brief'i değildir. Tek context'te baştan
sona okunmaz: her rol yalnız kendine düşen bölümleri okur (3.2'deki manifesto).
v4'ün değişmezleri ve v5'in ölçülmüş zemini geçerli kalır; çelişkide v6 kazanır
ve çelişen satır tek karar commit'iyle silinir. Koşu kendi sıfırını kendisi
koyar: eski beyan, rapor ve "kapandı" cümleleri geçersizdir, her sayı bu gece
yeniden ölçülür.

İki sipariş bu sürümün varlık sebebidir ve her bölüme işlenmiştir:

- Fazların HİÇBİRİ aynı context'te koşmaz. Her faz taze bir ajanla açılır,
  işini yapar, ölür. Şişmiş context hesap yapamaz; bu tercih değil, v3
  koşusunda ölçülmüş bir gerçektir.
- Fazlar arası her hüküm ve Damla'nın her sorusu TARAFSIZ AJANA gider.
  İlk seferinde değil, bir kez değil, DAİMA. İşi yapan oturum kendi işini
  yargılayamaz ve Damla'ya kendi işi hakkında kendi cevabını veremez.

## 1. ZEMİN — 23 Ağu sabahı çekilen fotoğraf: HİPOTEZ, KANIT DEĞİL

Bu bölümün tek işlevi V0 şefinin kartları isabetli kesmesidir. STATÜSÜ:
buradaki hiçbir sayı ve hiçbir cümle hiçbir oturuma KANIT olarak giremez,
hiçbir rapora atıf olarak yazılamaz, hiçbir kapıda kullanılamaz. Koşu kendi
sıfırını kendisi koyar: V0 yeniden ölçmeden §1'in hiçbir sayısı var
sayılmaz; V0'ın ölçümü §1 ile çelişirse §1 sessizce ölür, tartışma açılmaz.
Fotoğrafın çekildiği an: commit b197ccf, 23 Ağu 05:51. Resim:

1.1 ctest: 105 koşan test (106'ncı h10_gate_check disabled), 7 kırmızı,
    isim isim: golden_check · bundle_fresh_check · style_check ·
    sizechart_source_check · recipe_dress_check · contract_check ·
    figure_check. Kaynak: GECE/log/F-N.ctest.after.txt (commit d9c556b).
1.2 selfintersect 270 → 0: scye hollow aramasının tavanı yoktu, kapatıldı
    (11c199a); engine_check ve sewable_census yeşile döndü. Dürüst kol oyuğu
    çevresi EU38 = 404.26mm (eski 421.27'nin 17.01mm'i kendi üstüne katlanan
    eğrinin uydurduğu yoldu).
1.3 wasm paketi 05:51'de yeniden derlendi (b197ccf); "sevk edilen motor 4
    hafta bayat" bulgusu muhtemelen kapandı — V0 bundle_fresh_check'i yeniden
    koşar, iddiayla yetinmez.
1.4 golden_check / recipe_dress_check / style_check kırmızıları geometri
    kayması SONRASI pin farkı sınıfında görünüyor (geometri iyileşti, mühürler
    eski; STYLE-PIN dosyası boş). Bu bir ADAY sınıflamadır: hükmü V0'da hakem
    verir, şef veya bu dosya değil.
1.5 sizechart_source_check: shoulderCM · backLengthCM · armLengthCM · neckCM
    kaynaksız. K10 (Damla kararı, kalıcı): kolon uydurulmaz. Tek çözüm yolu
    yayınlanmış kaynak bulmaktır.
1.6 Operatör sicili (contract/garment-spec-v2.json): 15 operatör — 9 shipped,
    1 flagged, 5 absent: gatheredOverlayLayer · sleeve · collarFamily ·
    skirtFamily · zipperPiece. Damarın ezici çoğunluğu puf/balon/kap kollu
    olduğu halde sleeve absent: damar bu sicille kilitli.
1.7 DAMLA-KUYRUK'ta açık karar K-FN1: kol oyuğu bandı taban bedene mi (A)
    sekiz bedene mi (B) bakar; EU34 (375.92mm) ve EU36 (389.75mm) bandın
    altında, ölçümler hazır. Varsayılan: (A) — yayınlanmış kaynak tek bedeni
    destekliyor ve satın alınmış kalıp da bu banttan 8/8 düşüyor; Damla (B)
    derse oyma işi uzatma fazına kart olur.
1.8 Vitrin: son ölçümde landing'de 18 iddia — DOĞRU 0 · YALAN 1 · KANITSIZ 17.
    docs ve landing bu koşunun açık siparişidir (V9/V10 koşulsuz).
1.9 RULES.md yürürlükte ve v6 ona tabidir: ajan context'i = ENV.md + RULES.md
    (+ v6'nın izin verdiği ekler); sayılar test çıktısında yaşar, docs'ta
    değil; rapor yalnız push'tan sonra; miras kırmızı AD kümesi büyüyemez.

## 2. SİPARİŞ HARİTASI — Damla'nın maddeleri, madde madde, hangi faz kapatıyor

Bunlar yorum değil sipariştir. Kapanışta (V11) bu tablo tek tek işaretlenir:
her madde ya kapandı (kanıt yolu ile) ya açık (sebep + kuyruk satırı ile).

2.1  Sabah foto + prompt → kalıp + flat, kusursuzlaşma yolunda → V0 ölçer,
     V6 iyileştirir, V11 önce/sonra isabet oranını basar.
2.2  Midjourney-vari editleme (fiyonk ekle, uzat, kısalt, yaka değiştir)
     → V6: spec DIFF hattı + edit_locality_check.
2.3  Flat tarz sorunu değil, CS/hesap/matematik işi; geometrisi çıkarılır
     → V3 (tek nesne: flat kalıptan hesaplanır, çizilmez).
2.4  Sözlük dikiş diliyle, bust/kol/heartneck menüsüyle değil; sınırlı
     malzemeden sınırsız ürün → V2 (mutfak reformu).
2.5  Kumaşa göre farklı kalıp → dünkü F-H kumaş eksenini kurdu; V8 derinleştirir,
     V10 sayfaya bağlar ("aynı elbise, iki kumaş, iki kalıp").
2.6  Ürün = kalıp + flat + REHBER (püf noktaları, terzilik hesabı) → V8 içerik,
     V10 vitrin; sayfaya basılmayan öneri yok hükmündedir.
2.7  İleride üyelik/forum/iOS → V10'da vizyon bölümünde tek satır, gelecek
     zaman kipiyle; şimdiki zamanla yazılamaz.
2.8  "İyi flat yok, öyleyse iyi kalıp da olamaz" → faz sırasının kendisi:
     V2→V3→V4 flat hattını kalıpla aynı kaynağa bağlar, V5 kalıbı dikilebilirlikle
     yargılar; iki test asla yer değiştirmez.
2.9  Bütün flat'ler aynı modelden çıkmış gibi (tek croquis) → V4 konvansiyon kapısı.
2.10 Zevk ölçütü Buğra değil (Chanel HC, Bershka/Stradivarius, genz, Etsy
     profesyonelleri) → V4 zevk panosu; hiçbir kapı "Buğra'ya benziyor mu"
     diye kurulmaz (6.3).
2.11 Hata bulmak iş değil, çözüm tasarlamak iştir → 4.7 kural olarak her kapıda.
2.12 İnsan vücudu hacimsel cisim: modelle, projeksiyonunu al, gerekirse yeni
     motor → V3'ün matematik çekirdeği.
2.13 Dünya/endüstri düzeyine bak, "başkası yapmış biz yapamayız" yasak
     → 5. bölüm: araştırma her fazın içinde, taban olarak alınır tavan değil.
2.14 Ayrı dokümantasyon ajanı → KÂTİP rolü + V9 büyük turu.
2.15 Landing incelenecek, sonra isteklere göre tasarlanacak → V10, sıra kesin:
     önce ölçüm sonra tasarım.
2.16 Fazlar arası kontrol + context sağlığı + tarafsız cevap DAİMA → 3. bölüm
     baştan sona.

## 3. ORKESTRASYON — v6'nın kalbi

### 3.1 Yürütme modeli

Koşucu script YOK ve geri gelmez: gece.sh v3'te dört fazın işini git nesnesi
bırakmadan sildi; bu ölçüldü (GECE/F11-B.md). Koşu Claude Code'da interaktif
yürür. Damla'nın koşudaki mekanik işi ikiye iner:

a) Her faz başında /clear yapıp 8.2'deki faz açılış bloğunu yapıştırmak.
b) Sabah V11 raporunu okumak.

Bunun dışında koşu onu BEKLEMEZ: karar gerektiren her şey DAMLA-KUYRUK'a
3.8.d formatında, VARSAYILANIYLA düşer; cevap gelmezse varsayılan yürür,
geldiğinde fark bir sonraki fazın kartı olur.

### 3.2 Oturum türleri ve context manifestoları

Beş rol vardır; hiçbiri diğerinin oturumunda yaşamaz. Her rolün context'i
aşağıdaki manifestoyla sınırlıdır — manifesto dışı dosya açmak kart ihlalidir
ve hakem bunu tutanağa yazar.

ŞEF (faz başına 1, sonra ölür)
  Okur: ENV.md + RULES.md + v6 §3, §4, §6 + GECE/KOSU.md + kendi fazının
  §6'daki tanımı. Okumaz: diğer fazların tanımları, HEDEF.md tamamı,
  DAMLA-KUYRUK tamamı, devlog, linkedin, GECE/arsiv. Yazar: KART/, GECE/V*.md
  tutanağı, KOSU.md, KAPI.md. Yazamaz: kaynak kod, docs/, contract/.

İŞÇİ (faz başına 2–6)
  Okur: ENV.md + RULES.md + kendi kartı (≤80 satır) + kartın İSİM İSİM
  saydığı dosyalar. Okumaz: KOSU.md, v6'nın tamamı, başka kartlar. Yazar:
  kartın ÇIKTI satırındaki yollar. Kart dışı dosyaya dokunmak = iş reddedilir.

HAKEM (kapı çağrısı başına 1, temiz oturum)
  Okur: fazın çıktı dosyaları + fazın eklediği test + RULES.md + v6 §4.
  Okumaz: fazın brief'i, şefin tutanağı, kartlar — hakem ne HEDEFLENDİĞİNİ
  değil ne OLDUĞUNU okur. Yazar: KAPI.md'ye tek hüküm satırı.

KÂTİP (faz kapanışı başına 1)
  Okur: fazın tutanağı + o fazın git diff'i + docs/ ağacı + README.md.
  Yazar: SADECE docs/ + README.md + GECE/INDEX.md. Koda, contract/'a,
  engine/'e dokunmaz. Kâtibin commit'i olmayan faz kapanmamıştır.

TARAFSIZ CEVAPÇI (çağrı başına 1, temiz oturum) → 3.7.

### 3.3 Şefin yaşam döngüsü — adım adım, atlama yok

1) Aç: /clear sonrası 8.2 bloğu yapıştırılmış taze oturum. Manifesto
   dosyalarını oku, başka hiçbir şey açma.
2) KOSU.md'den üç devir sayısını al (önceki fazın bıraktığı).
3) Fazın kartlarını kes: kart başına tek iş, ≤80 satır, 3.8.a şablonu.
   Her kart setini SIRALI mı PARALEL mi diye etiketle: birbirini görmesi
   gereken işler (karar, sicil, birleştirme) sıralı; kapalı listeden
   dağıtılan işler paralel. Kuyruk kapalı değilse iş paralelleşmez.
4) İşçileri alt-ajan (Task) olarak sal. Her işçiye SADECE manifesto
   context'ini ver; fazın "niye"sini anlatma — kartta NE yazar, niyet yazmaz.
5) ORAKÇI: 60 dakikada bitmeyen işçiyi kes; o ana kadarki işi commit'let,
   kalanı yeni kart olarak kuyruğa yaz. Uzun işçi = uzun sessizlik = şişen
   context.
6) Dönen işçi raporlarını doğrula: her sayının yanında commit hash, her
   adımın yanında dosya yolu var mı. Yoksa iade et; kendin tamamlama.
7) Kapının alt kapılarını sırayla koştur (§4). Hakemi ve kâtibi AYRI temiz
   oturumlar olarak aç; sonuçlarını bekle, yorumlama.
8) Tutanağı GECE/V<faz>.md'ye yaz (uzun, serbest); KOSU.md'yi 3.8.c şablonuyla
   güncelle (≤150 satır sert tavan — satır eklemek için satır sil).
9) Devir sayılarını (sonraki fazın alacağı ÜÇ sayı) KOSU.md'ye yaz, commit at.
10) ÖL. Sonraki fazın şefi sen değilsin; hiçbir şef iki faz yaşamaz. Şef KOD
    YAZMAZ — kod yalnız işçi elinden çıkar; şefin "küçük bir düzeltme"
    yapması dahi yasaktır.

### 3.4 İşçi sözleşmesi

- Tek iş, tek context, tek kart. Kart bittiğinde işçi biter.
- Aynı fazda aynı dosyaya TEK işçi yazar; çapraz kirlenme yasaktır. Şef kart
  keserken dosya çakışmasını kontrol eder — çakışan kartlar sıralıya döner.
- Rapor formatı: yapılan (dosya yolu + commit hash) · ölçülen (sayı + onu
  basan komut) · yapılamayan (sebep) · kart dışı fark edilen (dokunma, yaz).
- "Baktım / doğru görünüyor / çalışıyor" raporda yasak (RULES 3): render
  varsa PNG yolu, ölçüm varsa komut çıktısı.
- Araştırma işçisi (her fazın R-kartı, §5) kod yazmaz; çıktısı kaynak +
  lisans + hüküm tablosudur.

### 3.5 Hakem protokolü

Girdi paketi (şef hazırlar, brief KOYMAZ): fazın çıktı dosya listesi + fazın
eklediği testin kaynağı + iki ctest logu (faz öncesi / sonrası) + RULES.md.
Hakemin soru seti, sırayla:
1) Bu çıktı, geçtiğini iddia ettiği şeyi gerçekten yapıyor mu, yoksa testi
   geçmek için mi şekillendirilmiş?
2) Yeni test faz-öncesi kodda kırmızı düştü mü (boş test kontrolü, 4.2)?
3) Kırmızı AD kümesi büyüdü mü?
4) Pin yenilendiyse: yeni pin gerçek iyileşmeyi mi mühürlüyor, kırmızıyı
   susturmayı mı? Pin farkının sebebi (hangi commit, hangi geometri kararı)
   yazılı değilse pin yenilenemez.
5) Tolerans değişti mi? Değiştiyse 4.6 prosedürü işlemiş mi?
Çıktı: KAPI.md'ye tek satır — GEÇTİ/KALDI + tek cümle gerekçe + baktığı
dosyaların listesi. Hakem KALDI derse faz kapanmaz; pazarlık yoktur.

### 3.6 Kâtip protokolü

Her faz kapanışında artımlı çalışır (kapının 6. alt kapısı), V9'da tam tarama
yapar. Anayasası: docs'a duran-iddia yazılmaz ("ALL PASS", "0.00mm",
"byte-identical", "bitti", "zero issues") — sayıyı basan testin/aletin ADI
yazılır. Bayat cümle ya güncellenir ya gerekçesiyle docs/archive/'e taşınır;
sessiz silme yok.

### 3.7 TARAFSIZ CEVAPÇI — daimi kural, istisnasız

Tetikleyiciler (dördü de zorunlu yönlendirmedir):
a) Damla koşu sırasında HERHANGİ bir şey sorarsa ("neredeyiz", "bu sayı
   doğru mu", "faz gerçekten kapandı mı", "şu neden kırmızı"). Soruyu alan
   oturum — şef, işçi, kim olursa — CEVAP VERMEZ; 8.3 bloğuyla taze cevapçı
   açar ve onun cevabını değiştirmeden iletir.
b) Faz geçiş hükmü: "faz kapandı, sonraki açılabilir" cümlesini yalnız
   kapının hakem alt kapısı kurar ve bu HER fazda tekrarlanır.
c) "Ajan öldü mü, faz mı kırmızı" teşhisi (3.10) — v3'te bu teşhisi harness
   koydu ve koşuyu öldürdü; artık yalnız cevapçı koyar.
d) Sayı ihtilafı: iki oturum aynı büyüklük için farklı sayı basarsa hangisinin
   geçerli olduğunu cevapçı, iki komutu da yeniden koşturarak söyler.

Cevapçının girdi paketi: soru metni + ilgili kanıt dosyalarının YOLLARI +
RULES.md. Girdi paketine GİRMEYENLER: fazın brief'i, şefin tutanağındaki
niyet cümleleri, "ne yapılmaya çalışıyordu" anlatısı, bu dosyanın §6'sı.
Cevapçı ne hedeflendiğini değil ne OLDUĞUNU okur.

Cevapçının çıktı formatı: cevap (≤10 satır) + dayandığı her cümle için dosya
yolu ya da yeniden koşturduğu komutun çıktısı. Yol gösteremediği cümleyi
kuramaz; "bilmiyorum, şu ölçülmemiş" geçerli ve makbul bir cevaptır.

Yorulmazlık: bu kural 1. fazda ne kadar geçerliyse 10. fazda da o kadar
geçerlidir. "Artık güven oluştu, direkt cevaplayayım" diye bir yol yoktur;
şefin Damla'ya kendi fazı hakkında hüküm cümlesi kurması kart ihlalidir ve
kâtip bunu tutanağa geçirir.

### 3.8 Teslim formatları — serbest metin yok, şablon var

a) KART şablonu (GECE/KART/, ≤80 satır):
   NE (tek cümle) · GİRDİ DOSYALARI (isim isim) · ÇIKTI (dosya yolu + hangi
   kapıya kanıt olduğu) · YASAKLAR (o karta özel) · SÜRE TAVANI (dk) ·
   SIRALI/PARALEL etiketi.
b) TUTANAK (GECE/V<faz>.md): serbest uzunlukta ama üç bölüm zorunlu —
   ÖLÇÜLEN (sayı+komut+hash) · KAPANAN/AÇILAN KIRMIZI (ad ad) · SONRAKİ FAZA
   DEVİR (üç sayı).
c) KOSU.md şablonu (≤150 satır): ŞU AN (faz + tek cümle + son yeşil commit) ·
   KAPANMIŞ FAZLAR (faz başına tek satır + tutanak yolu) · AÇIK KIRMIZILAR
   (ad · nerede · ölçülen sayı) · DEVİR ÜÇ SAYI · DAMLA'YA DÜŞEN (bloke etmez).
d) DAMLA-KUYRUK satırı: KARAR GEREKEN (tek cümle) · SEÇENEKLER (A/B, her biri
   tek cümle + ölçülmüş yan bilgi) · VARSAYILAN (cevap gelmezse hangisi
   yürüyor) · HANGİ FAZI ETKİLER.
e) KAPI.md satırı: faz · alt kapı · GEÇTİ/KALDI · gerekçe (tek cümle) · log yolu.

### 3.9 Paralellik ve dosya kilidi

Paralel yalnız şu durumda: kartlar kapalı bir listeden dağıtılmış, birbirinin
çıktısını okumuyor ve dosya kümesi kesişmiyor. Üçünden biri bozulursa sıralı.
Kesişim kontrolü şefin 3.3/3. adımındaki görevi; ihlalinde hakem fazı düşürür.

### 3.10 Ajan ölümü ≠ kırmızı (v3'ün en pahalı dersi)

API hatası, kota, kesilen oturum = KOŞMAMIŞ iş; kırmızı DEĞİLDİR ve iş
silinmez. Teşhisi tarafsız cevapçı koyar: diskte tutanak + commit varsa faz
KOŞMUŞTUR, ikinci kez açılmaz (v3'te F0 iki kez "koşmadı" sayıldı, tutanak
diskteyken). Tutanak yoksa faz yeniden açılır; yarım iş varsa önce
commit'lenir, sonra açılır. Reddedilen iş yan dala alınır, ana dal temiz kalır.

## 4. KAPI PROTOKOLÜ — altı alt kapı, sırayla, pazarlıksız

Hiçbir faz kendini "geçti" ilan edemez. Faz sonu sırası:

4.1 Makine kapısı: ctest tam koşusu. Miras kırmızı AD kümesi (adlar, sayı
    değil) büyüyemez; yeni kırmızı ad doğuran değişiklik geri alınır ve iki
    ctest logu commit'e girer (RULES 9). WASM PARİTESİ: sevk edilen motor
    wasm'dır, native yeşil tarayıcıda hiçbir şey kanıtlamaz — fazın dokunduğu
    üretim yolu node üzerinden wasm modülüyle de koşulur (aynı spec, aynı
    beden); native yeşil + wasm patlak = faz KIRMIZI. Ölçülen iki bant:
    N tekrarlı üretimde heap artışı (kaba sızıntı kontrolü) ve tek üretim
    süresi; tabanları V0 ölçer ve KOSU.md'ye yazar, sonraki fazlar bandı
    sessizce aşamaz (4.6 prosedürü olmadan). ANA İPLİK KURALI: V0 mevcut
    çağrı yolunu da ölçer (motor main thread'de mi, worker'da mı çağrılıyor;
    tek üretim kaç ms). Süre V0 tabanının altındaysa Web Worker refaktörü
    kapı DEĞİL kuyruk kartıdır; tabanın üstündeyse ölçülmüş gerekçesiyle bu
    koşuda karta döner. Sabit eşik (50ms vb.) uydurulmaz — eşik V0 ölçümüne
    ve varsa yayınlanmış pratiğe bağlanır (§5); gece yarısı Playwright sınıfı
    yeni test altyapısı kurulmaz, ölçüm node zamanlaması + basit tarayıcı
    smoke'uyla yapılır.
4.2 Boş test kapısı — VERİ ODAKLI K2: fazın eklediği yeni denetim faz-öncesi
    motorda KIRMIZI düşmek zorundadır; düşmüyorsa test boştur ve tek başına
    fazı çürütür. BİRİNCİL USUL (derleme bağı sıfır): fazın zorlayıcı spec'i
    faz-öncesi commit'in DERLENMİŞ binary'sine/wasm'ına verilir; eski motorun
    ürettiği ÇIKTI ARTEFAKTI (SVG/JSON/ölçüm dökümü) yeni ölçüm aletiyle
    yargılanır — alet çıktı üstünde çalışır, eski koda link edilmez. Eski
    motor bu spec'te artefaktlı çizmeli ya da hata basmalıdır; basmıyorsa
    yeni test vacuous'tur. YEDEK USUL (yalnız çıktı üstünde ifade
    edilemeyen kontroller için): test dosyası + CMake satırı faz-öncesi
    worktree'ye kopyalanıp derlenir; DERLEME HATASI "kırmızı düştü" SAYILMAZ
    — "kanıtsız" sayılır ve birincil usule dönülür. Mevcut testleri
    değiştirme yasağı her iki usulde aynen kalır.
4.3 Kanıt kapısı: rapordaki her dosya yolu test -f ile, her sayı onu basan
    komut yeniden koşturularak doğrulanır. Olmayan yol = yapılmamış adım.
4.4 Hakem kapısı: 3.5. Temiz oturum, brief görmez, beş soru, tek satır hüküm.
4.5 Mutasyon kanıtı: yeni kurulan her kapı için en az bir kasıtlı bozma
    (örn. ölçüye +5mm) kapıyı kırmalı ve geri alınınca yeşile dönmeli; iki
    log da kapı kanıtına girer. Kırılamayan kapı süs demektir.
4.6 Tolerans/eşik değişikliği bir HAMLEDİR: eski değer, yeni değer, ölçülmüş
    gerekçe ve kaynağı commit mesajına; kuyruğa bilgi satırı. Sessiz gevşetme
    fazı düşürür.
4.7 Kırmızı raporlama kuralı: her kırmızı yanında kök teşhis + en az bir
    ÖLÇÜLMÜŞ çözüm adayı taşır; ölçülüp reddedilen hamle de kayda geçer.
    "Burada sorun var" tek başına çıktı sayılmaz.

Ardından yazma kapısı (KOSU.md + KAPI.md commit'i) ve kâtip kapısı (docs
commit'i). Kapı kırmızıysa faz kapanmaz, sonraki faz açılmaz; reddedilen iş
yan dala. Tek istisna: kırmızı Damla'ya bağlıysa kuyruğa 3.8.d satırı düşer
ve koşu varsayılanla devam eder. Kırmızı sonraki faza taşınmaz.

## 5. ARAŞTIRMA REJİMİ — her fazın içinde, tek büyük tarama fazı yok

5.1 Her fazın İLK kartı R-kartıdır (araştırma işçisi): o fazın eşiği,
    toleransı ve yöntemi için yayınlanmış kaynak arar. Araştırmasız eşik
    "gelişigüzel"dir ve kapıya giremez; kaynak yoksa "yayınlanmış formül YOK,
    bant şu ölçümden" açıkça yazılır.
5.2 Kaynak sınıfları ve nereye baktığı:
    - Kalıp matematiği: Aldrich sınıfı yayınlar (knowledge/ altındaki
      doğrulanmış kayıtlar yeniden aranmaz).
    - Giysi-DSL mimarisi: GarmentCode/PyGarment (Edge/Panel/Stitch primitifleri
      — V2'nin dünya emsali), ChatGarment (VLM'e geometri değil JSON
      ürettirmek — V6'nın dünya emsali; GarmentCode'u VLM için nasıl
      sadeleştirdikleri özellikle okunur), Design2GarmentCode, Sewformer/
      SewFactory (in-the-wild zaafları dahil dürüstçe), NeuralTailor.
    - Açık kaynak zanaat: Seamly2D (parametrik nokta/çizgi "malzeme" dili),
      FreeSewing (part/point/path/macro — kalıp-kod-olarak).
    - Endüstri paritesi: CLO3D, Browzwear, Optitex, Gerber AccuMark — vaat +
      çıktı formatı (DXF-AAMA, tech-pack, graded DXF); hangi vaadi bizim
      hangi kapımız ölçebilir hale getirmeli.
5.3 Serbest lisanslı kod/matematik almak serbesttir ve alınan her parça
    kaynağını başlıkta söyler. Model ağırlığı indirme / GPU kurulumu / harici
    API anahtarı / bulut görsel servis = kalıcı veto (6.2): kendiliğinden
    kurulmaz, kuyruğa karar satırı düşer.
5.4 Dünya ölçüsü TABANDIR, tavan değil: "başkası yapmış, biz yapamayız"
    cümlesi yasaktır; başkası yaptıysa daha iyisi ve hızlısı hedeflenir.
5.5 ENTEGRATÖR YASASI: ajan çekirdek sayısal algoritmayı (açılım/flatten,
    parametrizasyon, eğri yumuşatma, kesişim testi sınıfı) SIFIRDAN
    UYDURAMAZ — uydurduğunu iddia eden kod halüsinasyon sınıfıdır ve hakem
    bunu arar. Zorunlu sıra: (1) engine/tools altında var mı, grep; (2) yoksa
    YAYINLANMIŞ algoritma ADIYLA implement edilir ve kaynak dosya başlığına
    yazılır; (3) o da yoksa serbest lisanslı kütüphaneden port. Hafif,
    header-only bağımlılık serbesttir ve bu koşunun izinli sınıfı ADIYLA
    bellidir: Eigen (matris/lineer cebir) ve libigl (geometri işleme —
    LSCM/ARAP sınıfı açılım dahil); ikisi de MPL2, lisans başlıkta.
    AĞIR bağlamalı bağımlılık (CGAL / OpenCASCADE sınıfı) BU KOŞUDA FİİLEN
    YASAKTIR; gelecek koşulara yol açık kalır ama iki şartla: wasm hattında
    derlenebilirliği KANITLANMIŞ (log yolu) ve lisans hükmü yazılmış olarak
    kuyruğa karar satırı düşmüş. Gece yarısı bağımlılık çivilemek dependency
    hell'in tanımıdır; motoru kurtarayım derken build'i öldüren faz, fazı
    düşürür. KART AYRIMI: kütüphane entegrasyonu iki ayrı zanaat, iki ayrı
    karttır — iskelet kartı (CMake/include/derleme kanıtı) ve matematik
    kartı (algoritmanın uygulanması + testi) ayrı işçilerde, taze
    context'lerde koşar. Orakçının 60. dakikada kesmesi başarısızlık
    DEĞİLDİR: iskelet o ana kadarıyla commit'lenir (checkpoint), kalan iş
    yeni kart olur.

## 6. FAZLAR

Sıra: V0 → V1 → V2 → V3 → V4 → V5 → V6 → V7 (çekirdek — KOL DAHİL: damarın
ezici çoğunluğu puf/balon/kap kollu, sleeve sicilde absent; kol opsiyonel
olamaz, siparişin kendisidir) · V8 (uzatma, kalan süreye göre) · V9 → V10 →
V11 (kapanış, KOŞULSUZ — çekirdek nerede biterse bitsin sabaha bu üçü koşar,
çünkü docs ve landing bayat ve bu koşunun açık siparişidir).
ANTİ-BAHANE KURALI: çekirdekten yarım kalan ya da hiç açılamayan faz "süre
yetmedi" tek cümlesiyle gerekçelenemez. V11 raporu, hangi fazın hangi
bütçeyi kaç saat aştığını ve o saatlerin neye gittiğini SAYIYLA yazar;
yarım kalan iş kart olarak kuyruğa girer ve "yapılmadı" satırında adıyla
durur. İmkânsızı "zorunlu" ilan etmek bu protokolün işi değildir — o yol
kapı boyamaya çıkar; bu protokolün işi, yapılmayanı saklanamaz kılmaktır.

### V0 — DÜRÜST ENVANTER (45–90 dk) · ölçüm var, onarım yok

Bu fazda hiçbir şey düzeltilmez. Şef 4 işçiyi paralel salar (kapalı liste):

0A motor: (1) ctest tam koşusu — 7 kırmızı hâlâ 7 mi (b197ccf sonrası
   bundle_fresh?), isim isim, log yolu. (2) 7 kırmızının sınıflanması için
   HAM VERİ toplar: her kırmızının çıktısı + ilgili pinin son değiştiği
   commit; SINIFI (gerileme / bilinçli bayat pin / kaynak eksiği) işçi
   koymaz, hakem koyar. (3) Operatör sicili sayımı + ANAYASA damar
   detaylarından hangileri sicilde İSİM olarak bile yok (adı olmayan eksik
   sessiz ikame yasağını yapısal ihlal eder: red cümlesi ad söyleyemez).
   (4) DAMAR yüzdeleri, F0-A §3.1'in yazılı yöntemiyle — V11 aynı yöntemle
   yeniden ölçebilsin.
0B görü: foto + prompt hattı BUGÜN kaç örnekte doğru spec'e iniyor — sayı,
   iddia değil; hatalar sınıflı (görme mi, kelime listesi mi, motor mu);
   vision-student kelime listesinin kaynağı (elle mi yazılmış, sözlükten mi
   üretiliyor). Bu tablo V6'nın girdisidir.
0C vitrin: docs/ ve web/ altındaki her iddia cümlesi tablolanır — iddia ·
   hâlâ doğru mu · kanıtlayan test/alet · hüküm ADAYI (kal/güncelle/sil).
   Ölü link taraması; UI'ın söylediği ile motorun yaptığı her fark (seçilen
   beden ≠ gösterilen beden) YALAN olarak listelenir. Bu işçi hüküm vermez,
   sayar; tablosu V9 ve V10'un girdisidir.
0D sözlük: hangi dosya malzeme diliyle (sürekli parametre), hangi dosya menü
   diliyle (kapalı enum) konuşuyor; sevk edilen taraf hangisi. Bu tablo
   V2'nin girdisidir.

Kapı: her maddenin en az bir dosya yolu/komut çıktısı var mı; damar yüzdesi
yöntemi yazılı mı; K-FN1 tek sayfaya inip kuyruğun başına kondu mu.

### V1 — PİN VE KAYNAK TEMİZLİĞİ · dünkü geometri kaymasının faturası (1.5–2.5 s)

Amaç: çekirdeğe SIFIR taşıma-kırmızısıyla girmek.
- golden_check / recipe_dress_check / style_check: hakem V0 verisiyle sınıf
  hükmünü verdikten sonra, "bilinçli bayat pin" çıkanlar yeniden mühürlenir —
  3.5/4 sorgusuyla: pin farkının sebebi commit'e yazılmadan mühür yenilenmez.
  STYLE-PIN boşsa pinleme süreci yeniden kurulur ve "pin 0 canlıya çıkamaz"
  kuralı testin kendisine yazılır.
- sizechart_source_check: R-kartı 4 kaynaksız kolon için yayın arar (K10:
  uydurmak yasak). Bulunan kaynaklanır; bulunamayan kolon başına "kaynak
  bulunamadı + aday yayınlar + karar" kuyruğa.
- contract_check ve figure_check: kök teşhis + ölçülmüş çözüm adayı (4.7);
  çözüm bu faza sığıyorsa kapatılır, sığmıyorsa hangi faza kart olduğu yazılır.

### V2 — MUTFAK: sözlük reformu, menü değil malzeme (3–4 s)

Damla'nın teşhisi anayasa hükmündedir: doğru dağarcık yemek değil MALZEMEDİR.
Kapalı isim listesi menüdür; Valentina/Gerber sınıfının tuttuğu mutfak
sözlüğüdür — sınırlı malzemeden sınırsız ürün oradan çıkar.

Hedef mimari (R-kartı GarmentCode + Seamly2D + FreeSewing karşılaştırmasını
işleyerek eşikleri bağlar):
- Katman 1 PRİMİTİF (sürekli, kapalı liste değil): Edge (parametrik kenar:
  düz/yay/spline, uzunluk+eğrilik+gerginlik) · Panel (kapalı kenar zinciri +
  grainline + katlama ekseni) · Seam (iki kenarı eşleştiren bağ: uzunluk
  eşitliği + yedirme oranı + çentik) · Op (ölçülebilir işlem: suppress ·
  gather(oran) · flare(açı) · extend(mm) · split(oran) · overlay · attach).
- Katman 2 BİLEŞEN: bodice · sleeve · skirt · collar · cuff · band · overlay —
  her biri parametre kümesi AÇAR, kapalı isim listesi değildir.
- Katman 3 TARİF: isim + parametre demeti ("sweetheart" = necklineDraft(…),
  "puf kol" = sleeve(capHeight=…)).

Yasa: Katman 3'teki her isim Katman 1/2'ye çözülür; çözülmeyen isim sözlüğe
girmez; isim silinince arkasındaki geometri kalır; iki tarif arasındaki her
ara değer geçerli giysidir. V0'ın "sicilde adı yok" saydığı her damar detayı
ve 5 absent operatör (sleeve, collarFamily, skirtFamily, gatheredOverlayLayer,
zipperPiece) sicile İSİM olarak girer — statüsü dürüstçe absent kalsa bile
red cümlesi artık ad söyleyebilir. Görü kelime listesi Katman 3'ten ÜRETİLİR,
elle yazılmaz (0B bulgusuna göre).
SÖKÜM MEKANİĞİ — eski menü sözlüğü kendiliğinden ölmez, sürülür:
a) 0D'nin menü diliyle konuşuyor saydığı her dosya için hüküm verilir:
   çözüm tablosuna bağlandı / _LEGACY arkasına sürüldü. Üçüncü statü yoktur;
   "şimdilik dursun" bir statü değildir.
b) Kapalı enum'a YENİ referans eklemek yasaktır ve mekanik denetlenir:
   vocab_reference_check (yeni test) faz-öncesi commit'teki referans sayısını
   taban alır, sayı yalnız DÜŞEBİLİR; artıran commit kapıda kırmızı düşer.
c) Görü kelime listesi build ÜRÜNÜDÜR: vocab_source_check (yeni test)
   listenin Katman 3 tablosundan üretildiğini üreteci yeniden koşturup
   çıktıyı karşılaştırarak kanıtlar — elle edit edilen liste testi kırar.
   0B'nin "elle mi yazılmış" bulgusu ne çıkarsa çıksın hedef durum budur.
Kapı preset_resolve_check: her preset primitiflere çözülüyor ve çözüm motorda
GERÇEKTEN panel üretiyor mu. Anti-hack: tabloya isim eklemek bedava ve hiçbir
şey çizmez — sözlüğe girişin bedeli çizen bir panel zinciridir; söküm
tarafında da simetriği geçerlidir: enum'u _LEGACY'ye sürmek bedava ve hiçbir
şey çözmez — sürgünün bedeli, o enum'un karşıladığı her damar detayının
Katman 3'te İSİMLE var olmasıdır.

### V3 — TEK NESNE: flat ile kalıp aynı kabuktan (3–5 s)

Damla'nın yasası: flat ile kalıp tek matematiksel nesnenin iki izdüşümüdür;
birbirini denetlemeyen iki üretim hattı varsa ikisi de güvenilmezdir. İnsan
vücudu hacimsel bir cisimdir: gövde yüzeyi → giysi kabuğu (ease + siluet) →
bir koldan ÖN/ARKA ortografik projeksiyon = flat siluetleri, öbür koldan
açılım (flatten) = kalıp panelleri. Flat bitmiş giysi çizimidir: pensler
kapalı, dikişler kapanmış; dış konturu ÇİZİLMEZ, HESAPLANIR; iç çizgiler
kalıbın gerçek dikiş hatlarının aynı projeksiyona düşmüş hâlidir.

Bu fazın kapısı TEK test değildir; agree-check tek başına iki hattın
sayılarını eşitleme hack'ine dönüşebilir. Üç kanat birden:
a) flat_pattern_agree_check (yeni test, 4.2 usulüyle faz-öncesinde kırmızı
   düşmeli): aynı spec'ten üretilen flat ve kalıp için 6 ölçü %1.5
   toleransta — etek ucu çevresi · göğüs çevresi · bel çevresi · gövde boyu ·
   yaka açıklığı genişliği · omuz genişliği.
b) flat_artifact_census (yeni): açılım/projeksiyon artefakt SINIFLARI
   sayılır ve köke bağlanır — koni açılımından gelen tırtıklı etek ucu,
   kendini kesen kontur, eğrilik süreksizliği (C1 kırığı), sıfır alanlı
   parça. Her sınıf için: kaç adet · hangi fonksiyondan doğuyor (kaynak
   satırı) · kök çözümü. Artefakt kırpmayla, smoothing'le, çözünürlük
   düşürmeyle GİZLENEMEZ — gizleme tespiti fazı tek başına düşürür.
c) Eğrilik sürekliliği: hesaplanan dış konturda bitişik segmentlerin teğet
   süreksizliği beyanlı eşiği aşamaz; eşik R-kartının bulduğu yayınlanmış
   pratiğe bağlanır, yoksa "yayın YOK, eşik şu ölçümden" yazılır.
Anti-hack: flat'e sabit çarpan eklemek YASAK; kapı iki hattın aynı kaynaktan
beslendiğini kanıtlamalı, sayıları eşitlemeyi değil. Hakemin bu fazdaki ek
sorusu: "agree yeşilse, yeşili sağlayan şey ortak kaynak mı, sonradan
uydurulmuş bir düzeltme katsayısı mı?" — render hattının kaynağı OKUNARAK
cevaplanır, iddia edilerek değil. Gece bitmezse: tek bedende çalışan ön
gövde hattı, tam çalışan sahte hattan iyidir; eski çizim hattı silinmez,
_LEGACY bayrağına alınır. İşçi bölümü: kabuk→projeksiyon çekirdeği SIRALI
tek işçide; ölçüm aleti ve test yazımı PARALEL ayrı işçilerde, aynı dosyaya
iki el değmeden.

### V4 — FLAT KONVANSİYONU + ZEVK ÖN-TARAMASI (2–3 s)

Bütün flat'ler aynı modelden çıkmış gibi olacak — tek manken, tek konvansiyon.
Zevk hevesi değil, ölçülebilir tutarlılık şartı. Kapı flat_convention_check:
- Tek croquis: iki farklı stilin flat'inde omuz genişliği / göğüs hattı /
  bel hattı yükseklikleri ±2mm (V3 biterse neredeyse bedava).
- Ölçek beyanı: her SVG data-scale taşır ve gerçek ölçüyle tutarlıdır.
- Çizgi hiyerarşisi anlam taşır: dış siluet + ana dikiş kalın · iç dikiş/pens
  ince · topstitch kesikli · gizli hat noktalı; oranlar dosyada beyanlı.
- Sıfır gölge/gradyan, tek kontur rengi; ön + arka zorunlu (ANAYASA: arka
  çizildiyse arkada olay var); karmaşık bölgeye detay callout'u.
- Çizim artefaktının kökü ölçülür ve düzeltilir; kırpmayla GİZLENMEZ.
Zevk panosu (ayrı işçi, paralel): Chanel HC, Bershka/Stradivarius, genz,
profesyonel Etsy listingleri — link + özellik-dili tarifi, görsel indirilmez.
Konvansiyonu geçen adaylar ESKİ|YENİ yan yana panoya basılır; hüküm
Damla'nındır, kuyruğa düşer, koşu BLOKE OLMAZ. "Etsy'lik değil" cevabı
"olmamış" değildir — geliştirme yolları aranır ve denenir (4.7).

### V5 — DİKİLEBİLİRLİK (2.5–4 s)

Mimari ayrım: flat mankene göredir, testi SATILABİLİRLİK; kalıp insana
göredir, testi DİKİLEBİLİRLİK. İkisi asla yer değiştirmez. sewability_check:
1) dikiş çifti eşitliği (ya da beyanlı yedirme oranı; üretim toleransı 1/32")
2) çentik eşleşmesi (aynı sıra, aynı yay uzunluğu)
3) kapalılık (panel kapalı, kendini kesmiyor, sıfır alanlı üçgen yok)
4) köşe açısı toplamı tutarlı (kırışık kökü)
5) GEÇİŞ: giysi vücuttan geçiyor mu — en dar halka baş/omuz çevresinden
   geçmiyorsa kapanma zorunlu VE kapanma donanımı gerçekten satılan boyda.
   Kapanma dili (lace/zip/gizli zip) tek karar değildir, giysiye göre
   HESAPLANIR. Bütün sayıları yeşil ama giyilemeyen nesne ayrı bir hata
   SINIFIDIR ve kapısı ayrıdır.
6) geri projeksiyon: paneller dikili varsayılır, 3B'ye sarılır, gövdeye
   oturtulur; gerinim eşiği aşılıyorsa kalıp yanlıştır.
7) draft_math_check (yeni): pozitif geometri kapısı zevk panosu DEĞİLDİR —
   ana ölçüler (scye derinliği, kol oyuğu çevresi, omuz, göğüs/bel/kalça
   çevre payları, ense oyuntusu) beden beden, R-kartının bağladığı
   YAYINLANMIŞ çizim formülü ya da bandıyla karşılaştırılır; formülü
   olmayan ölçü için "yayın YOK, bant şu ölçümden" açıkça yazılır. Bu,
   "terzilik hesabı" siparişinin kapıdaki karşılığıdır.
Buğra'nın yeri burada kesinleşir: satın alınmış kalıp yalnız ÜST ÜSTE
BİNDİRME görseli olarak kanıt klasörüne girer (aynı beden, aynı ölçek,
overlay PNG + fark tablosu) — bakılır, öğrenilir, ama hiçbir kapı ona
benzerlikle kurulamaz (7.3); yayınlanmış banttan Buğra da düşüyorsa bu
fark tablosuna dürüstçe yazılır.

### V6 — GİRİŞ HATTI: foto + prompt → spec, ve editleme temeli (3–4 s)

Sabahın ana siparişi. Önce ölçüm sonra iyileştirme: 0B tablosundaki hata
sınıflarına göre spec şeması VLM'in doğru dolduracağı hale getirilir (dünya
emsali ChatGarment: VLM'e geometri değil JSON ürettirmek — zaten bizim
yasamız; iyileştirme şemada aranır, modelde değil). V2 sonrası görü dili
mutfakla hizalı olduğundan kapalı-liste kaynaklı görme hataları YENİDEN
ölçülür — önce/sonra isabet oranı V11'e devir sayısıdır.
Editleme: model geometri üretmez, spec DIFF üretir —
mevcut spec + talimat → spec DIFF → şema doğrulaması → operatör sicil
kontrolü (shipped değilse ADIYLA red) → aynı seed + aynı beden yeniden
üretim → ÖNCE/SONRA farkı.
YERLEŞİM DİLİ — ÇIPA + ORAN (piksel-parametre köprüsü, model ağırlıksız):
konumlu edit ("fiyonk ekle ŞURAYA") için spec şemasına semantik çıpa sözlüğü
girer. Çıpalar Katman 2 bileşen topolojisinden ÜRETİLİR, elle yazılmaz —
elle yazılan çıpa listesi menüdür ve V2'nin yasağına takılır. VLM'in
konuşabildiği tek dil: çıpa adı + o çıpaya bağlı kenar boyunca opsiyonel
oran ofseti (örn. arka bel çıpası, bel dikişi boyunca +0.2). Determinizmi
çıpa verir, sürekliliği oran verir; parametrik (U,V) karşılığını motor
kendisi çözer. VLM'e piksel koordinatı vermek de, vertex seçtirmek de
mimari ihlaldir. Segmentasyon/poz ağırlığı indirme yolu (SAM sınıfı) kalıcı
vetoya tabidir: kendiliğinden kurulmaz, kuyruğa karar satırı. 0B'nin hata
sınıflamasına KONUM HATASI ayrı sınıf olarak girer ve konumlu edit isabeti
V11'de ayrı sayıyla raporlanır.
Kapı edit_locality_check: "yakayı değiştir" deyince etek ucu DEĞİŞMEZ —
dokunulmayan panellerde çıktı bayt-bayt aynı. Bu kapı yoksa editleme değil
yeniden üretimdir; Midjourney hissinin tamamı bu kapıda yaşar.

### V7 — KOL (çekirdek, 3–6 s)

Damarın ezici çoğunluğu puf/balon/kap kollu; sleeve operatörü sicile absent
girdi (V2) ama damar onunla kilitli. Kol ayrı giysi türü değil mutfak
ürünüdür: bir Panel + iki Seam (kol oyuğu arayüzü + kol içi dikişi) + kapak
eğrisi; "puf kol" = kapak yüksekliği, "balon kol" = kapak + kol ağzı büzgüsü
— Katman 3 tarifi. Kapı: kol oyuğu yayı ile kapak yayı beyanlı yedirme
oranıyla eşleşiyor mu (V5/1 bunu zaten ölçebiliyor olmalı). K-FN1 kararının
seçilen tarafı kuyruktan okunur; (B) seçildiyse EU34/36 oyma işi bu faza
kart olur. Kaynaklar çelişirse motor ölçüyü basar, yargılamaz; hüküm kuyruğa.

### V8 — KUMAŞ EKSENİ DERİNLEŞTİRME + REHBER (uzatma, 2–3 s)

F-H kumaş eksenini kurdu; bu faz içerik ve doğrulama büyütür. Yasa: aynı
spec + farklı kumaş = FARKLI kalıp. Kapı fabric_ease_check: dokuma ve %50
örme için aynı spec'in göğüs çevresi farkı beklenen yönde ve büyüklükte mi;
negatif ease ham formülle uygulanmaz (recovery zayıf kumaş torbalanır;
kullanılabilir esneme ≠ maksimum esneme). Rehber satılan pakete girer:
kumaş önerisi + esneme testi tarifi (10cm işaretle, rahat gerdir, ölç) +
kumaşa özel püf noktalar (tela nerede, hangi dikiş, hangi iğne) + kesim
planı. Repoda yarım duran rehber/kumaş bilgisi üretime BAĞLANIR; sayfaya
basılmayan öneri yok hükmündedir.
KAPSAM BEYANI: kumaş fiziği simülasyonu (FEM / mass-spring / drape çözücü)
bu koşunun BİLİNÇLİ kapsam dışısıdır — "2D motor önce, fizik sonra" Damla'nın
15 Tem kararıdır ve müşterinin dikeceği şey kalıptır, drape videosu değil;
esneme bandı hesabı ev dikişi kalıp endüstrisinin yayınlanmış pratiğidir,
bakkal hesabı değildir. FEM yolu ROADMAP'te vizyondur; landing dahil hiçbir
sayfada simülasyon İMASI şimdiki zamanla yazılamaz (landing_truth_check
bunu duran-iddia sınıfında yakalar).

### V9 — DOCS BÜYÜK TURU (kapanış, koşulsuz, 1–1.5 s)

Kâtip docs/ ağacının tamamını + README'yi bugünkü koda karşı okur, 0C
tablosunu girdi alır: her iddia için kal/güncelle/sil hükmü UYGULANIR.
GECE/INDEX.md son hâline getirilir: koşunun ürettiği her kalıcı dosya
yönlendirme tablosuna girer. Kapı docs_truth_check (mekanik): duran-iddia
kalıpları 0 adet; her sayısal iddianın yanında kaynak test/alet ADI. Test
4.2 usulüyle faz-öncesinde kırmızı düşmeli — düşmüyorsa ya docs zaten
temizdir (ölç, kanıtla) ya test boştur.

### V10 — LANDING (kapanış, koşulsuz, 2–3 s)

Sıra kesindir: ÖNCE ÖLÇÜM, SONRA TASARIM.
10a envanter (işçi 1): 0C tablosu tazelenir — 18 iddianın (doğru 0 · yalan 1
· kanıtsız 17) bugünkü hâli; ölü link; UI-motor farkları YALAN listesine.
10b tasarım (işçi 2, 10a bitmeden başlamaz): sayfa ŞU ürünü anlatır —
foto + prompt → kalıp + flat + REHBER, üç çıktı da sayfada görünür; mutfak
anlatısı "sınırlı malzeme → sınırsız ürün" (V2 gerçekleştiyse canlı örnekle,
gerçekleşmediyse VİZYON etiketi + gelecek zaman — ikisi asla karışmaz);
editleme (V6 durumuna göre demo ya da vizyon); kumaş ekseni "aynı elbise,
iki kumaş, iki kalıp" (V8 çıktıysa gerçek görselle); üyelik/forum/iOS vizyon
bölümünde tek satır. Şartlar: premium his, flop UI yasak (kalıcı veto);
mevcut görsel kimlik YENİDEN YAZILMAZ — düzen ve içerik yenilenir, kimlik
değişikliği gerekiyorsa iki yönlü taslak kuyruğa; waitlist korunur; mobil
kırılım kontrol edilir. Kapı landing_truth_check (mekanik): sayfadaki her
sayı ve özellik iddiası ya repoda bir test/alet adıyla eşleşir ya sayfada
durmaz; vizyon bölümleri şimdiki zamanla yazılmaz; ölü link 0; gösterilen
beden = seçilen beden. Zevk hükmü Damla'nın: yayın öncesi ekran görüntüleri
kuyruğa, koşu bloke olmaz.

### V11 — KAPANIŞ (koşulsuz, atlanmaz)

1) ctest: V0'ın saydığı kırmızı kümesinden kaçı kapandı, isim isim; yeni
   kırmızı ad 0 mı.
2) DAMAR yüzdeleri V0'ın yazılı yöntemiyle yeniden; kımıldamadıysa açıkça
   yazılır.
3) Foto→spec isabet oranı: 0B'nin sayısından V6 sonrasına, önce/sonra.
4) §2 sipariş haritası madde madde işaretlenir: kapandı (kanıt yolu) /
   açık (sebep + kuyruk satırı).
5) KOSU.md son hâli + kuyruğa düşen yeni kararlar; yalnızca push'tan SONRA
   rapor. "Bitti/hazır" toptan cümlesi yasak.
6) Rapor Damla'ya dört satırla başlar: kaç kapı yeşile döndü · kaç yeni
   kırmızı doğdu (hedef 0) · foto→spec isabet nereden nereye · docs ve
   landing önce/sonra ekran görüntüsü yolları.

## 7. YASAKLAR (kalıcı vetolar dahil, koşu boyunca)

7.1 Kapıyı gevşeterek geçmek · kırmızıyı sonraki faza taşımak · boş test.
7.2 fal.ai / bulut görsel servis · yeni model ağırlığı / harici API anahtarı
    (kendiliğinden kurulmaz, kuyruğa) · telifli görsel indirme (referans =
    link + özellik dili) · patterns_real/ altındaki satın alınmış PDF'lere
    dokunmak · flop UI · landing kimliğini yeniden yazmak.
7.3 Buğra bir referanstır, kural değil: hiçbir kapı "Buğra'ya benziyor mu"
    diye kurulmaz; kapı = yayınlanmış bant + geometri + dikilebilirlik +
    konvansiyon.
7.4 Şefin kod yazması · işçinin KOSU.md'ye dokunması · kâtibin koda
    dokunması · şefin/işçinin Damla'ya kendi işi hakkında hüküm cümlesi
    kurması (3.7) · manifesto dışı dosya açmak.
7.5 Faz başına en fazla 3 yeni kaynak dosya; fazlası gerekçeyle. engine/tools/
    altında yüzü aşkın alet var: önce grep, sonra yaz.
7.6 Kaynaksız eşik/tolerans kapıya giremez (§5). Damla'nın onaylamadığı
    çıktı "geçti" sayılmaz: zevk kapılarında başarı beyanı yalnız onun evet'i.
7.7 Rapor dili: virtüöz raporu yok. Cevaplanan soru "kesim çizgisi kaç mm"
    değil — "bu kalıp dikilir mi, bu flat Etsy'lik mi, bu sayfa ürünü
    anlatıyor mu".

## 8. AÇILIŞ BLOKLARI

### 8.1 Koşu açılışı (bir kez, ilk oturuma)

    1) Bu dosyayı repo köküne commit et. GECE/ altında bu koşuya ait olmayan
       dosyayı GECE/arsiv/'e taşı — okuma, tartışma, taşı.
    2) V0 şefini 8.2 bloğuyla aç. Koşucu script KURMA (3.1); koşu interaktif.
    3) Çekirdek V0→V6 sırayla; süre kalırsa V7→V8; süre NE KALIRSA KALSIN
       sabah V9→V11 koşulur.
    4) Damla'ya tek bloke olmayan kanal: DAMLA-KUYRUK.md, 3.8.d formatında,
       her satır VARSAYILANIYLA.

### 8.2 Faz açılış bloğu (her faz başında Damla /clear + bunu yapıştırır)

    Sen V<faz> ŞEFİSİN ve yalnız bu fazı yaşayacaksın. Oku (başka hiçbir
    şey açma): ENV.md + RULES.md + GECE-KOSUSU-v6.md §3, §4, §6/V<faz>, §7
    + GECE/KOSU.md. Sonra 3.3'teki on adımı sırayla uygula:
    kartları kes ve sıralı/paralel etiketle → işçileri alt-ajan olarak sal
    (kod yazma, sen şefsin) → orakçıyı işlet → raporları kanıtla doğrula →
    kapının alt kapılarını sırayla koştur, hakemi ve kâtibi AYRI temiz
    oturumlar olarak aç → tutanak + KOSU.md + commit → devir üç sayıyı yaz
    → ÖL. Damla'dan soru gelirse CEVAPLAMA: 8.3 bloğuyla tarafsız cevapçı
    aç ve cevabını değiştirmeden ilet.

### 8.3 Tarafsız cevapçı bloğu (soru geldiğinde şefin alt-ajana vereceği)

    Sen tarafsız cevapçısın. Sana bir soru ve kanıt dosyası yolları verildi;
    fazın ne yapmaya çalıştığı sana SÖYLENMEDİ ve sormayacaksın. RULES.md'yi
    oku, kanıt dosyalarını aç, gerekiyorsa ölçümü yeniden koştur. Cevabın
    ≤10 satır ve her cümlenin yanında dosya yolu ya da komut çıktısı olacak.
    Yol gösteremediğin cümleyi kurma; "bu ölçülmemiş" geçerli bir cevaptır.
    Kimseyi memnun etmek için yazmıyorsun.

## 9. GECE BÜTÇESİ (yol gösterici, kapı değil)

V0 45–90dk · V1 1.5–2.5s · V2 3–4s · V3 3–5s · V4 2–3s · V5 2.5–4s ·
V6 3–4s · (V7 3–6s · V8 2–3s) · V9 1–1.5s · V10 2–3s · V11 0.5–1s.
Çekirdek sığmazsa kesilen faz uzatma değil ÇEKİRDEKTEN atlanmaz: kalan iş
kart olarak kuyruğa yazılır ve V11 raporunda "yapılmadı" satırına girer;
kapanış üçlüsü her koşulda koşar.
