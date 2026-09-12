# FLAT — DIŞ KAYNAK TARAMASI (F-E geometri vardiyası, 23 Ağu 2026)

Kartın 1. ve 2. maddesi ("Etsy'de profesyonel listinglere bak" + "özellik dili")
için bir araştırma ajanı salındı. **70 dakika sonra, iş bitip commit atıldıktan
sonra döndü** — o yüzden gecenin kodunu ajanın sayıları DEĞİL, satın alınmış
Buğra kalıbı yönlendirdi (`knowledge/ETSY-KAPISI-GEOMETRI-2026-08-23.md` §0).

Bu dosya ajanın getirdiğini **kaybetmemek** ve gecenin kararlarıyla
**karşılaştırmak** için. Aşağıdaki hiçbir sayı bu gece koda girmedi.

> ⚠ Kaynak durumu: aşağıdakiler ajanın raporundan alınmıştır, birincil yayınlar
> **bu vardiyada tek tek açılıp doğrulanmadı**. URL'ler duruyor. "DOĞRULANDI"
> yazan tek şey, gecenin kendi ölçümüyle çakışan satırlardır.

---

## §1 GECENİN KARARLARINI DOĞRULAYAN SAYILAR

### Omuz — K-FE-1 üçüncü bir kaynakla da doğrulandı ✅

Ajan, **iki bağımsız sistemde aynı sayıyı** buldu:
**çapraz omuz (cross-shoulder) = tam büst çevresinin %44'ü**
— Aldrich 4. baskı 38.94/88 = %44.3 · Armstrong 5. baskı 40.64/91.44 = %44.4.

Bizim EU38'imiz (burda büst 88 cm) için → çapraz omuz **38.94 cm**, yarısı
**194.7 mm**. Croquis'te duran değer **234.0 mm**.

| kaynak | EU38 yarı-omuz |
|---|---|
| Aldrich / Armstrong %44 kuralı | **194.7 mm** |
| Buğra Locket ölçümü (gecenin sayısı) | **210.5 mm** |
| **croquis'te duran** | **234.0 mm** |

Üç kaynak da 234'ün **fazla** olduğunu söylüyor; hangi doğru değerin alınacağı
ayrı bir karar (194.7 ile 210.5 arası %8 fark var — Buğra'nın 38'i daha büyük bir
beden olduğu için beklenen yönde). **K-FE-1 artık tek kaynağa dayanmıyor.**

⚠ **TUZAK — ajanın uyarısı:** her çizelgede *"shoulder"* kelimesi **omuz
DİKİŞİNİ** (12.25 cm) kastediyor, çapraz omzu (38.94 cm) değil. ISO 8559-1:2017
**dört ayrı omuz-genişliği kavramı** tanımlıyor. Bizim `tables.json`'daki
`shoulderCM = 37` kolonu (status **NONE**) bu dördünden hangisi — **bilinmiyor.**
37 cm, çapraz omuz bandına (38.94) yakın, omuz dikişine (12.25) değil.

### Bel daralması — S3 eşiği doğrulandı ✅

12 yayınlanmış çizelgede bel **büstün %77–82'si, medyan ~%79**. Bizim S3 eşiğimiz
kaynaklı burda EU38'den geliyor: 70/88 = **%79.55**. Tam medyanda.
Aldrich'in çizim değeri (5 cm büst payı ile) %77.6.

### Kol oyuğu çizgisi — kusur 1'in yönü doğrulandı ✅

Ajan: *"set-in kol için EVET, görünür bir İÇ çizgi, 0.75 pt; asla beyaz boşluk."*
Points of Measure yöntemi flat'i **tek kapalı yol** olarak kuruyor (yarısını çiz →
yansıt → iki kez `Join`), çünkü boyama kapalı yol istiyor; **beyaz boşluk dolguyu
kırardı.** Kol oyuğu ancak bir İÇ çizgi olarak var olabilir.
⚠ Kaynakların hiçbiri bunu **açıkça kural olarak yazmıyor** — ajan bunu
"UNVERIFIED folklore, ama iki sert kısıttan çıkıyor" diye işaretledi.

Çizgi ağırlıkları iki bağımsız kaynakta: **kontur 2 pt · dikiş 0.75 pt · ilmek
0.5 pt kesik.** F-D'nin kanunu (outline 2.0 / seam 1.4 / mark 1.0) aynı hiyerarşi.
→ Öbür vardiyanın *"kol oyuğu `outline` değil `seam` olmalı"* teşhisi **dış
kaynakla da destekleniyor**; bu gece hâlâ yapılmadı.

### Puff etinin düz kesilmesi — kusur 2'nin gerekçesi doğrulandı ✅

Ajan: dolgunluğu anlatan **sadece iki şey** var — etin/kenarın ŞEKLİ ve kıvrım
çizgileri. Düz kesik bir et, **sıfır dolgunluğun görsel imzası**; büzgülü bir
kenarı düz çizmek "çizim kalıbı yalanlıyor" demek (fashion-incubator, üretimde
pahalı bir hata olarak anlatılıyor). 11 profesyonel listingde **11/11**: büzgü =
dikişe dik, uca doğru incelen ince çizgi demetleri; asla zikzak.
→ Bu gece konan tırtıklar tam olarak bu (etin normaline dik, kısa, ince).

⚠ **Manşet bandı yüksekliği bizde 21 mm (7u).** Armstrong'un yazdığı: kesim 2 in,
**bitmiş 1 in = 2.54 cm**. Diğer kaynaklar 1.3–2.5 cm. Bizimki bandın içinde ama
**bu sayı bu gece kaynağa bağlanmadı**, `CUFF_BAND` hâlâ elle yazılı.

⚠ **Puff kapak yükselişi:** tek birincil sayı Armstrong, **2 in / 5.1 cm**.
Bizim `capRise = 22u = 66 mm` — **iki katından fazla.** Ölçülmedi, dokunulmadı.
Ajan ayrıca "puff kapak yükselişini bicep'in oranı olarak veren bir konvansiyon
**yok**" diyor; yani bu sayıyı biz koyarsak konvansiyonu **takip etmiyor,
tanımlıyor** oluruz.

### Etek ucu sarkması — "kavis abartılı" teşhisi doğrulandı ✅

Üç bağımsız ticari gömlekçi aynı sayıda birleşiyor: **normal sarkma 2 in =
5.08 cm**; abartılı 18 cm. Bizim `dip = 4u = 12 mm`, yani **normalin dörtte biri
kadar** — sarkma değil. Demek ki Damla'nın "kavis abartılı" dediği şey **açılma**
(genişlik), ve bu gece kapatılan tam olarak oydı. **Teşhis doğruydu.**
⚠ Üç kaynak da MTM erkek gömleği yardım sayfası, drafting otoritesi değil; aynı
konvansiyonun üç kez alıntılanması olabilir. Aldrich gömlek bloğu sarkma sayısı
**vermiyor**; Coffin açıkça "serbest tasarım değişkeni" diyor.

### Peter Pan yaka — bizim genişlik bantta ✅

Kaynaklar: Müller & Sohn 6 cm · Creative Curator 6 cm · Sew It With Love 7 cm ·
dresspatternmaking 7.6 cm · Armstrong 7.0/8.9 cm → **çalışma bandı 6–9 cm**.
Bizim `COLLAR_W = 26u = 78 mm = 7.8 cm` — **bandın içinde.**
Aldrich'in tek sert sayısı: yaka çizerken omuzları **2 cm bindir**.

---

## §2 GECENİN YAPMADIĞI, AMA ÖLÇÜLEBİLİR ÇIKAN İKİ ŞEY

### (a) Yaka kafadan geçmiyor — Sally Melville "10 Kuralı"

**yaka genişliği + ön yaka derinliği ≥ 25.5 cm (10 in)**, yoksa yaka ortalama bir
yetişkin kafasından geçmez. Hesaplanabilir bir geçerlilik kontrolü.

Bizim crew yaka: genişlik 2×90 = **180 mm** + derinlik **66 mm** = **246 mm**.
**25.5 cm'nin 9 mm ALTINDA → kalıp kafadan geçmez.**

⚠ Bu, Damla'nın *"boyun çok geniş"* şikâyetiyle **ters yönde** duruyor: kural
yakanın **dar** olduğunu söylüyor. İkisi çelişmiyor olabilir — 180 mm genişlik
gerçekten geniş görünürken 66 mm derinlik çok sığ olabilir; toplam yine de
yetmiyor. **Bu gece hiçbir şey değiştirilmedi**, çünkü (i) düğmeli bir önde yaka
zaten açılıyor, yani kural bu giyside geçerli olmayabilir, (ii) kaynak tek ve
birincil yayından okunmadı. **DOĞRULANMADI.**

### (b) Kol üçgeni — üç sayıdan sadece ikisi seçilebilir

*"Kol oyuğu derinliği, bicep ve kapak yüksekliği — üçünden biri diğer ikisinin
SONUCUDUR. Sadece ikisini belirtebilirsin."* (dresspatternmaking)
Kalem bugün üçünü de bağımsız sabit olarak taşıyor (`chestY`, `outW`, `capRise`).
Bir üreteç için sert bir kısıt; **bu gece uygulanmadı.**

Kol oyuğu derinliği referansı — Aldrich, EU38: armscye depth 21.0 cm,
nape-to-waist 41.0 cm → **%51.2**, ve her bedende ~yarı (8'de %50.0, 20'de %53.5).
Türetilmiş yasa: `armscye depth = büst/8 + 10`, `nape to waist = büst/8 + 30`.
Bizim croquis: chestY 276 mm / waistY 450 mm = **%61.3** — bandın **dışında**.
⚠ AMA bizimki **omuz çizgisinden**, Aldrich'inki **NAPE'ten** ölçülüyor; iki
farklı temel. Doğrudan kıyas **KURULAMAZ** (CLAUDE.md zaten bu tuzağı yazmış).
**DOĞRULANMADI, dokunulmadı.**

---

## §3 ÖZELLİK DİLİ — kartın 2. maddesinin cevabı

**Chanel HC / Zara / Bershka / Inditex'in hiçbirinin ölçüm standardı ya da
tedarikçi teknik el kitabı halka açık DEĞİL** (sızıntı kanalları dahil). Aynısı
H&M, Primark, Next, M&S, ASOS, Shein, Nike, Uniqlo, Target, Gap için de geçerli.
Halka açık ikameler: **URBN** (Urban Outfitters/Anthropologie/Free People)
"DTA How 2 Measure Guide" — **226 sayfa, 666 kodlu POM**, her biri kod + ad +
ölçüm yöntemi + teknik eskiz, ve aynı kodla bir tolerans matrisine bağlı.
`https://assets.ctfassets.net/6ufjjlh0gzjl/4bS0G4SQClcvmAmktkSAk7/c172a73b3b98835257761325b8c4d930/Section_V_-_How_to_Measure.pdf`
⚠ Her sayfasında Urban Outfitters telifi. **Halka erişilebilir ≠ lisanslı.**
İndirilmedi, kullanılmadı.

**Çekirdek cevap: bir yaka bir İSİM değildir; bir `yaka genişliği` + `yaka
düşüşü`dür, her biri bir DATUM'la nitelenmiş.** Genişlik beş dikey datumda
ölçülebiliyor (HPS'te, omuz dikişinde, göğüs-arası hizada, ön-yaka-düşüşü
hizasında, üst bant açıklığında); düşüş beş ayrı orijinden.
**`VF07` Peak Height @ CF, "sweetheart" için var olan en yakın POM** — sweetheart
geometrisini yayınlayan kimse yok.

Bir kol = **kol boyunca örneklenmiş bir genişlik profili + bir açıklık durumu**:
kapak yüksekliği → omuzdan 3″ genişlik → koltukaltından 1″ altta (kas) → 13″ →
açıklıktan 5″ yukarı → üst manşet dikişi → açıklık.

**Dört mekanizma:**
1. **Dolgunluk = aynı kenarın İKİ KEZ, gevşek ve gerilmiş ölçülmesi. Asla bir
   oran değil.** URBN aynen: *"Record both."* Bir büzgü oranı ("1.5× fullness")
   kalıp-çizim dilidir, **teknik-paket dili DEĞİL.**
   → Bizim `contract` bunu ORAN olarak taşıyor. Not edildi, değiştirilmedi.
2. **Stil adı, değeri değil ÖLÇÜM YORDAMINI değiştirir.** Dolman → göğüs
   koltukaltının 1″ altından değil HPS'in X″ altından ölçülür. Raglan → kendi
   armhole POM'u, kendi yaka POM'ları. Üreteç bir sayının yanında bir **yordam**
   da yaymalı.
3. **Kiriş derinliği ile yay uzunluğu AYRI POM'lardır.** ASTM D5219 sözlük
   düzeyinde ayırıyor: *"'height' dikey ölçümler için, 'length' kontur ölçümleri
   için."* Genişlik + kiriş + yay ≈ eğriyi yeniden kurmaya yeter.
4. **Her dikiş kırığı yeni bir POM doğurur.**

**Yapısal boşluk (ajanın en kullanışlı cümlesi):** ticaret taksonomileri sıfır
sayısal parametreli stil-adı enum'ları; teknik paketler sıfır stil-enum'lu sayısal
POM'lar. **Halka açık kayıtta ikisini köprüleyen hiçbir şey yok.** Makine
okunabilir tek açık yaka enum'u Shopify Standard Product Taxonomy (18 değer) ve
onun `sleeve_length_type`'ı yalnız boy — **puff, raglan, dolman, bishop, bell
hiçbiri yok.** *"Yaka stil adlarını (yaka genişliği, ön yaka düşüşü) sayılarına
eşleyen yetkili bir tablo halka açık olarak MEVCUT DEĞİL."*

---

## §4 LİSTELEME — 11 gerçek listing, 0 istisna

1. **ÖN VE ARKA her zaman ikisi birden.** Sadece-ön flat profesyonel örneklemde
   yok. (Bizde var.)
2. Ön ve arka **aynı ölçekte**, ortak taban çizgisi. (Bizde var.)
3. Düz ortografik, iki yana simetrik, **içinde vücut yok** — kafa yok, uzuv yok,
   gölge yok. (Bizde var; F-D `fillLaw` gölgeyi zaten yasaklıyor.)
4. **Kesik = üst dikiş ya da gizli kenar.** 11/11. (F-D kanunu aynı.)
5. Büzgü = dikişe dik, uca incelen ince çizgiler.
6. **Çizgi ağırlık hiyerarşisi zorunlu** — en minimal olan bile ≥1.5:1 kontrast
   tutuyor. Tek tip ağırlık amatör okunuyor. (Bizde 2.0/1.4/1.0 = 1.43:1 ve 2:1.)
7. Vektör-temiz, yuvarlak birleşim, el titremesi yok.
8. Çizim tuvalin tamamına sahip — logo yok, çerçeve yok, ok yok, **ölçü çizgisi
   yok**. Bunlar mühendislik çizimi değil.
9. Pens = açık bir V oluşturan 1–2 çıplak çizgi. **Kimse pensi kapalı üçgen
   çizmiyor.** (Bizde açık çizgi.)
10. **11'in 7'sinde sıfır metin.**

Etsy mekaniği: **kısa kenarda ≥2000 px** — kozmetik değil işlevsel eşik,
üstüne-gel-yakınlaştır bunun altında **açılmıyor**; bir çizgi çizimi için bu
fotoğraftan daha önemli, çünkü alıcı dikişi yakınlaştırarak kontrol ediyor.
Etsy 4:3 öneriyor ama **gerçek indie flat'lerin neredeyse hepsi dikey 2:3 ya da
√2** (Burda'nın ev tuvali 495×700 = √2); sektör Etsy'nin oran tavsiyesini
yok sayıyor. **Çizgi çizimi PNG, fotoğraf JPG** — Fibre Mood, Simplicity, Burda,
Named, Papercut, Friday'de bağımsız olarak doğru.
→ Öbür vardiya (`flat_sellable_check`) 4:3 + 2000 px yolunu seçti; **bu satır
onların kararına yeni bir bilgi ekliyor: dikey oran da sektörde meşru.**

**Flat listede nerede duruyor — sektör sert biçimde anlaşamıyor.** Grainline #2 ·
Fibre Mood #3 · Closet Core #1–2 (2025+ sürümlerde SONdan başa taşıdılar) ·
Burda 6/6 · True Bias / M&M / In the Folds / Sew Over It / Friday **en sonda** ·
Named galeride hiç yok. Eğilim: az görselli galeriler flat'i öne alıyor.

**★ SATIŞ AÇISI — ajanın bulduğu en kullanışlı ticari şey:** topluluğun
AI-güvensizlik sinyali **uyuşmazlık**. Dolaşan alıcı tavsiyesi: *"çizgi çiziminin
fotoğraflarla eşleşip eşleşmediğini her zaman kontrol edin; eşleşmiyorsa çalıntı
ya da üretilmiş görsel işareti olabilir."* NBC, **yarım düzineden fazla** Etsy
mağazasında düzinelerce AI-üretimi görsel buldu. **Doğru bir teknik flat'i taklit
etmek pahalıdır**; ön+arka, eşleşen ölçekte, fotoğraflanan giysiyle uyuşan pens ve
üst dikişle — bugün topluluğun en ucuz gerçeklik kontrolü. Bizim için bu bir
pazarlama cümlesi değil, **kapının kendisi**: `flat_geometry_sellable_check`
tam olarak bu uyuşmayı mekanikleştiriyor.

---

## §5 TUZAKLAR — bunlara düşmeyin

- **Aldrich ÜÇ ÇELİŞEN beden çizelgesi yayınlıyor** (4/6 cm Avrupa — blokların
  kullandığı; 5 cm güncel UK, 8 bedeni kaldırılmış; S/M/L). **6. baskı BS EN
  13402-3'e geçti ve orada büst 88 = beden 10.** Bir etiket adımı kayarsa her
  sayı sessizce değişir. **Beden etiketine değil, büst 88 cm'ye çapa at.**
  (Repomuz zaten bunu yapıyor; `knowledge/drafting-math-eu38.md` 4./6. baskı
  farkını not etmiş.)
- **Aldrich'in kendi metninde çözülmemiş bir aritmetik tutarsızlık var:** bloğu
  yarım-büst 49 / yarım-bel 38 veriyor → fark 11 cm, ama 12 cm diyor ve pens
  dağılımı 12'ye toplanıyor. **Literal uygularsan 1 cm fazla daraltırsın.**
  12 cm sabiti yalnız o çizelgede büst−bel her bedende 18 cm olduğu için
  yürüyor; başka bir vücutta 3.5/1.5/2.5/4.5 yanlış ve **ölçekleme kuralı yok.**
- **Big-4 grade'i düzensiz** (bel 1,1,1½,1½,2,2,2,3,2,2½) — doğrusal grade onların
  çizelgesini üretmez; cm kolonu bağımsız metrik çizim değil, yuvarlanmış çevrim.
- **Big-4 beden 8 ≠ RTW 8.** Big-4 8'in büstü 31½″, modern ASTM D5585 6'nın da
  altında; ASTM 8 = 35″, aynı numarada 3.5 inç daha fazla büst.
- **Wikipedia'nın "Misses' sizes" tablosu kaynaksız**, `{{citation needed}}`, ve
  ölü bir video-oyunu sitesine link veriyor — **AI araçlarının kazıması en olası
  tablo.** O sayıları bir yerde görürsen kökeni budur.
- **ASTM D5219 2024'te GERİ ÇEKİLDİ**, yerine bir şey konmadı. Onu "giyim
  terminoloji standardı" diye anmak alıntılanabilir bir zayıf nokta.
- **thecuttingclass.com'da hiç sayısal ölçüm yok** — editoryal analiz, drafting
  kaynağı değil. Kaynak listesinden düşür.

---

## §6 ULAŞILAMAYAN (ajanın kendi beyanı)

- **Szkutnicka, Abling, Lee & Steen** — teknik flat çizimi üzerine üç kitabın
  içeriği indekslenmiş web'de yok. Ajan: *"Q3/Q4/Q5'in cevaplarının gerçekten
  yaşadığı en olası yer bu üçü."* (yani: puff kapak oranı, et çizim kuralı,
  kol oyuğu boşluk kuralı).
- **PS 42-70 orijinal NIST PDF** — web.archive.org'da kurtarılabilir, 6 sayfa,
  metin katmanı olmayan tarama. ABD kamu malı, ASTM'in paraya koyduğu
  omuz/armscye satırlarını içermesi muhtemel. **En yüksek değerli el değmemiş iz;
  OCR gerekiyor.**
- **MIL-DTL spesifikasyonları** — halka açık, hukuken serbest, toleransı tam
  bitmiş-ölçü tabloları. Alınamadı (DLA oturum token'ları 404).
- **ASTM D5585 / D6193 / D6240** — ödeme duvarı, 403. Bir snippet D5585'e atfen
  armscye çevre serisi verdi ama **kolon hizalaması doğrulanmadı — YAYINLAMA.**
- **Indie bitmiş-giysi çizelgeleri** (Closet Core, Grainline Archer, Named) PDF
  kitapçıklarının içinde, webde değil. **Indie kalıplardan sıfır sayı alındı.**
- Coffin *Shirtmaking* (1993), Aldrich *Menswear* — ödünç kısıtlı, okunmadı.
- 403 verenler: burdastyle.com/.de/.ru, threadsmagazine.com,
  sewing.patternreview.com, blog.fabrics-store.com, **Etsy Seller Handbook**
  (yani §4'teki Etsy sayıları ikincil 2026 rehberlerinden, **DOĞRULANMADI**),
  Fashion-Incubator'ın dört sleeve-cap-ease yazısı.
- **11 listingden okunan çizgi kalınlıkları raster'dan GÖZ KARARI** — bu
  satıcıların hiçbiri SVG/AI kaynağı yayınlamıyor.

**Ajanın işe yarar fetch numaraları:** `https://r.jina.ai/<url>` birçok 403'ü
aşıyor · WebFetch PDF'i ikili döndürür ama diske önbelleğe alır →
`pdftotext -layout` ile kurtarılır · doğrudan bir görsel URL'sinde WebFetch
ikiliyi önbelleğe alır, sonra Read onu görsel olarak açar.
