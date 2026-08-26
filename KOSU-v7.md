# STITCHU KOŞU v7 — ürün koşusu

Tek cümle:

> **Her fazın çıktısı, bir yabancının tarayıcıda açıp deneyebileceği bir şeydir.
> Ölçüm bir kapıdır; teslimat değildir, faz değildir, rapor değildir.**

v6 bir denetim koşusuydu: 12 fazın 4'ü envanter/pin/docs/landing'di, ürün fazı
V8 (kumaş + rehber) **hiç koşmadı**, V10 "KALDI" ile kapandı, `GECE/` altına 743
dosya bıraktı. v7 bunu tekrarlamaz. Çelişkide v7 kazanır.


## 0. NEREYE GİDİYORUZ — kuzey yıldızı

Bu koşu bir lisans projesini kurtarmıyor. Kurulan şey şu:

> **Giysinin geometrisini dikiş seviyesinde temsil eden bir motor** — ve o
> temsilin üstünde çalışan her şey.

Temsil doğruysa geri kalan hepsi onun **tüketicisi**dir, ayrı ürün değil:

| Bugün | Yarın | Sonra |
|---|---|---|
| flat · kalıp · kesim planı · rehber | bölgesel editleme · 3B önizleme · kişiye özel ölçü | iOS · üyelik · forum · API |

Bu neden büyük bir hedef ve neden ulaşılabilir:

1. **Kimsenin yapmadığı bir şeyi yapıyoruz** — flat ile kalıbı **tek**
   geometriden üretmek. Bunu bir kere doğru kurunca, üstüne konan her özellik
   (edit, önizleme, serileme, kişiye özel) **aynı nesneyi** kullanır. Rakiplerin
   her yeni özelliği yeni bir modül; bizimki aynı motorun yeni bir okuması.
2. **Kapalı döngü (F3B) kimsede yok.** Kalıbı simüle edip fotoğrafla
   karşılaştırıp kendi hatasını raporlayan bir motor, ne tech-pack araçlarında
   ne CAD'de var. Bu hem ürün özelliği hem yayınlanabilir bir iş.
3. **Ücretsiz + açık format, kapalı ve koltuk başına ücretli araçların
   kopyalayamayacağı tek şeydir.** Onlar aylık lisans satıyor; biz dikiş planını
   açık bir format yapıp motoru bedava koşturursak, topluluk ve içerik üstümüze
   gelir. Rakip bunu taklit ederse kendi gelir modelini yıkar.

**Dolayısıyla:** aşağıdaki hiçbir fazın kapsamı "şu kadarı yeter" diye
kısılmayacak. Kısıtlanan tek şey **sıra** — çünkü bir fazın çıktısı diğerinin
girdisi. Kapsam değil, takvim.

---

---

## 0B. PROVENANCE YASASI — motorun generative yanı (Damla, 26 Ağu)

**Motor her alanı doldurur, boş çıktı yoktur.** Ama her alan **kaynağını taşır**:

| Etiket | Anlamı |
|---|---|
| `görüldü` | Fotoğrafta var, okundu |
| `çıkarıldı` | Fotoğrafta yok, kuraldan türetildi |
| `soruldu` | Kullanıcıya soruldu, cevabı geldi |
| `zorunlu` | Dikilebilirlik gereği kondu, tercih değil |
| `belirsiz` | Görüldü ama güvenle okunamadı (siyah kumaş, yoğun desen) — en sade yorum seçildi |

`belirsiz` de kullanıcıya **adıyla** söylenir: *"fotoğraf karanlık olduğu için
prenses dikişini net göremedim; pensli en sade yorumu çizdim"*. Söylenmezse
kullanıcı kalıbı diker, oturmaz, ürünü çöpe atar — ve haklıdır.

`çıkarıldı` olan **her alan kullanıcıya adıyla** bildirilir. Bu sadece dürüstlük
değil: **editleme arayüzünün kendisi.** Kullanıcının değiştirmek isteyeceği ilk
şeyler tam da motorun çıkardığı alanlardır — madde 2'nin (Midjourney editlemesi)
ilk hali burada doğuyor, F7'de büyüyor.

**Üretim spec seviyesindedir, piksel seviyesinde değildir.** Model "arka nasıl
görünür" **resmi** üretmez; "arka alanları şunlardır" **JSON**'u üretir,
geometriyi motor çizer. Piksele kaçan her çözüm determinizmi, editlenebilirliği
ve flat=kalıp izdüşümünü **birden** öldürür.

**Çıkarımın üç kısıtı:**
1. **Deterministik.** Aynı fotoğraf iki kez aynı sonucu verir. Sıcaklıklı serbest
   üretim yasak. → Bu yüzden **çıkarım motorda yapılır, VLM'de değil**: kural
   tablosu C++ tarafında (`backdetail.cpp` komşuluğunda) durur. VLM yalnız
   *gördüğünü* söyler; *görmediğini* motor kuraldan doldurur.
2. **Konstrüksiyon olarak tutar.** Çıkarılan arka önle **dikilebilmeli**: kol
   oyuğu uzunluğu, omuz dikişi, bel yüksekliği buluşmalı. Geometri kapısından
   geçmeyen çıkarım geçersizdir, "makul görünüyor" yetmez.
3. **En kısıtlayıcı yorum.** Belirsizlikte daima **daha az kesim, daha az
   açıklık, daha az parça**. Fazladan dekolte iadedir; sade olanı müşteri
   düzeltir.

**Reward hacking kapısı:** ajan işi kolaylaştırmak için her alanı `çıkarıldı`
işaretleyip isabet oranını şişirebilir. **Görünen bir alanı `çıkarıldı`
işaretlemek hatadır** ve `çıkarıldı` sayısının **tavanı** vardır: hedef koşusunda
`çıkarıldı` oranı yükselirken H2 (görülen alanda isabet) yükselmiyorsa faz
kapanmaz.

---

## 1. BU SABAH ÖLÇÜLEN ZEMİN

Hiçbiri iddia değil; sevk edilen dosyalar üstünde bu sabah koşuldu.

**1.1 — İKİ MOTOR VAR, ÜRÜN YANLIŞ OLANI KULLANIYOR.**
`engine/build-wasm.sh:72,111` derlenen kaynakları sayıyor. `surfacepattern.cpp ·
bodysurface.cpp · garmentshell.cpp · flatten.cpp · shellprojection.cpp ·
drape.cpp` → grep sayısı **0**. `web/vendor/stitchu-engine.js` içinde
`GarmentSurf`/`SurfacePanel` → **0 bayt**. `garment.cpp`, `wasm/bindings.cpp`,
`recipe.cpp` içinde `surfacepattern.hpp` include → **0 satır**.
Tarayıcı ve API hâlâ **eski 2B formül hattından** çiziyor. Yüzey hattı yalnız
native CLI'da ve ctest'te yaşıyor. **Gecelerdir iyileştirilen motor,
kullanıcının gördüğü motor değil.**

**1.2 — FLAT ÇİZİLİYOR, HESAPLANMIYOR.** `tools/render-garment-flat.mjs:25`
kendi yazıyor: *"`pieces` is accepted for signature compatibility but NOT used —
the flat is spec-driven."* Doğru flat (aynı kabuktan izdüşüm) YAZILMIŞ
(`tools/shell-flat.cpp`, `CMakeLists.txt:764`) ama wasm'a bağlı değil:
`wasm/bindings.cpp:503-506` yalnız `draftJSON · gradeJSON · draftRecipeJSON ·
dxfRecipeJSON` ihraç ediyor.

**1.3 — FOTOĞRAF HATTI 725 SATIR ELLE YAZILMIŞ KELİME EŞLEŞTİRMESİ.**
`backend/worker.js:114` → Claude vision API çağrılıyor, `seen` JSON dönüyor.
Sonra `web/js/vision-bridge.js` (725 satır, **22 adet** elle yazılmış `pickX`
fonksiyonu) o JSON'u `.includes('gather')`, `.includes('puff')` gibi string
aramalarıyla motor sözlüğüne çeviriyor; üstüne `create.js` 922 satır tutkal.
**"Belki problem JSON okuyucuda" şüphesinin somut adresi burası.** VLM doğru
görüp bridge'in atması, bridge'in görülmeyeni uydurması — ikisi de bu 725
satırda olabilir ve bugün ölçülmüyor.

**1.4 — MOTOR SANILDIĞINDAN CANLI.** Sevk edilen wasm üstünde 37 sözlük ekseni
tek tek koşuldu (geometri hash'i ile). Doğru host spec verilince neredeyse hepsi
canlı: sleeveLength 3/3, shoulderStyle set≠dropped≠raglan, neckline 9/9,
collarType 7/7, skirtStyle 6/6, fabric woven≠knit. Bağlamsız tek gerçek ölü:
**`exposedZip`** (üç değer bayt-aynı). `collarEdge · gatherZone · cuffStyle ·
bardotStyle` yalnız etkinleştirici eksen kapalıyken ölü görünüyor — bu ölü eksen
değil **gizli önkoşul**, UI sebebini yazmalı. **"Motor çizemiyor" doğru değil.**

**1.5 — DİKİŞ SÖZLÜĞÜ ZATEN YAZILMIŞ, DIŞARI ÇIKMIYOR.**
`src/surfacepattern.hpp:190` → `SurfaceStitch::Kind { Waist, Princess, Side,
Dart, Shoulder, Opening }`, yanında `SurfacePanel` + `Dart` + `boundaryStrain`
(`:141`, `:158`). Madde 9'un istediği çekirdek burada duruyor. Ama `draftJSON`
çıktısının anahtarları ölçüldü: `garment · fabricAdviceKey · fabricMeters140 ·
guideSteps · guideRefs · rehber · pieces` — **panel yok, dikiş yok.** Kullanıcı
parçaları görüyor, NEDEN o kadar parça olduğunu göremiyor.

**1.6 — BUĞRA ŞU AN TEST SETİ DEĞİL, EĞİTİM SETİ.** `vocab.json` içinde
`cupSeam: bugra` ve `locketTop: bugra` birer **spec değeri**; `garment.cpp:567`
ve `:889` o değeri görünce Buğra'nın ease/princess paylarını sabit yüklüyor
(`CupSeamBlock::bugra::corsetChestEase`). Motor Buğra'yı çizmiyor, **ezberliyor**.
Madde 12'nin sorusu bu haliyle cevaplanamaz.

**1.7 — REPO AJANI BOĞUYOR.** *(DÜZELTME: aşağıdaki sayılar **temiz klonun**
sayılarıdır — yani git'in izlediği şey. Damla'nın diskindeki çalışma kopyası
**6.2GB**, `.git` **334MB**; farkı izlenmeyen çöp yapıyor: `Logs/` 4.0GB
(tek başına `Logs/katalog-2026-08-05` 3.8GB), `design_patterns/` 787MB,
`new_flats/` 92MB. Bunlar git'te YOK, yani silmek `.git`'i küçültmez ama
**diski anında açar**. F1'in "<30MB" kapısı yalnız izlenen dosyaya bakarsa
bu 5GB'a hiç dokunmadan geçer — kapı bu yüzden değişti, aşağıda.)*
214MB izlenen, 2069 dosya. `.git` 87MB · `patterns_real`
65MB · `GECE/` 23MB / **743 dosya** · `reports/` 8.1MB / 277 dosya · `docs/`
3.8MB. Üstelik içerik çelişkili: `contract/spec-grammar.json` ilk satırında
"⛔ BU DOSYA HÜKÜM TAŞIMAZ, ölü 2B hattı" yazıyor ama hâlâ parser sözlüğü olarak
koşuyor. Taze bir ajanın context'i bu enkazla doluyor ve iyi hesap yapamıyor —
madde 13 bir temizlik isteği değil, **doğrudan bir kalite kararı**.

**1.8 — DÜNYA AYNI MİMARİYİ KURUYOR.** NGL (arXiv 2602.20700, Şub 2026) ve
ChatGarment (CVPR 2025, arXiv 2412.17811) ölçtü: VLM'ler giysiyi doğal dilde
tarif etmekte iyi, düşük seviyeli kalıp parametresini doğrudan tahmin etmekte
kötü. Çözümleri: VLM'in betimleyici diline yakın bir **ara dil**, sonra
**deterministik** bir çevirici ile parametrik kalıp. Yani **isim AĞIZDA doğru,
dikiş MOTORDA doğru** (madde 9 motor için geçerli, giriş katmanı için tersi
ölçülmüş). GarmentCode MIT, ChatGarment Apache-2.0 — fikir de kod da alınabilir.

**1.9 — SÜREKLİ KANAL VAR AMA ÇÖPE ATILIYOR (madde 9'un asıl adresi).**
`backend/worker.js:306` içindeki vision prompt'u okundu: ~4500 kelime, ve
istediği JSON şemasının içinde `ratios{}` diye **sürekli sayı** bloğu var —
`hemToWaistWidth · lengthToWidth · neckDepthToLength · neckWidthToShoulder ·
sleeveLenToGarment · waistYToLength · strapWidthToShoulder`. Yani modelden
"scoop mu vNeck mi" değil, **"yaka derinliği / boy = 0.11"** isteniyor. Sınırsız
kalıbın çıkacağı kanal tam olarak budur.

Sonra `vision-bridge.js:507` o kanalı kapatıyor:
```js
seen.ratios = trusted ? measured.ratios : null;
```
`trusted`, ayrı bir **deterministik piksel ölçümünün** yeterli güvenle dönmesine
bağlı. Dönmezse **VLM'in ölçtüğü oranlar null'lanıyor.** Hayatta kalan oranların
tükettiği yer de dar: etek dolgunluğu sınıfı ve etek boyu
(`SKIRT_FULLNESS_TABLE:529`, `pickSkirtLengthMM:561`) — yani sürekli sayı, geri
gelip 6 isimden birine yuvarlanıyor. **Sonuç: hat, sürekli geometriyi alıp ayrık
menüye çeviriyor.** Madde 9'un şikâyeti burada doğuyor, sözlükte değil.

İkinci şüpheli, aynı dosyada: `worker.js:355` `max_tokens: 1100`. Şema
doldurulduğunda (7 oran + `outOfVocab` listesi + `details` cümlesi) cevabın
tavana çarpması mümkün; çarparsa JSON bozulur ve **tüm okuma sessizce düşer**.
Bu bir iddia değil, F2'nin ilk ölçeceği şey: kaç cevapta `stop_reason` =
`max_tokens`, kaç cevapta `JSON.parse` patladı.

**1.10 — BAŞKALARI NEREDE DURUYOR (harita, tavan değil).**
Aranan soru: "başkaları nasıl çözmüş?" Cevap: **iki kamp var, ikisi de işin
yarısını yapıyor.** Bu bir sınır değil, bir haritadır: yapılmış olması bizim
yapamayacağımız anlamına gelmez, iyi yapılmış olması hiç değil.

**A kampı — AI tech-pack üreticileri** (Style3D, CALA, Genpire, Skema3D,
Adstronaut, Techpacker). Fotoğraf/eskiz alıp **flat + ölçü tablosu + BOM + PDF**
üretiyorlar; "eskiz yükle, AI flat ve BOM üretsin, PDF indir" akışı standart
hale gelmiş ve dakikalar sürüyor. **Ama hiçbiri kesilebilir kalıp vermiyor** —
çıktı bir *belge*, fabrikaya gönderilen bir spesifikasyon. Kalıbı hâlâ insan
çıkarıyor.

**B kampı — parametrik kalıp motorları** (freesewing MIT, Seamly2D/Valentina,
GarmentCode MIT, Optitex/Tukatech/CLO3D ticari). Gerçek, dikilebilir kalıp
üretiyorlar. **Ama girdi fotoğraf değil**: ölçü + parametre giriyorsun, ya da
CAD'de elle çiziyorsun.

**Ortadaki boşluk stitchu'nun yeri:** *fotoğraf + prompt → **hem** flat **hem**
kesilebilir kalıp, **tek geometriden**.* A kampı kalıp vermiyor, B kampı
fotoğraf almıyor. Akademi (NGL, ChatGarment, SewFormer) tam bu köprüyü kuruyor
ama **ürün değil, makale** — çıktıları 3B simülasyon için, dikiş payı /
kesim planı / rehber taşımıyorlar.

**Fiyat çapası (pazarlama için):** serbest teknik tasarımcı stil başına
**$150–500**, teslim **3–7 gün**; PLM araçları kullanıcı başına aylık
**$35–125** + kurulum. Yani rakip fiyat değil, **insan saati**. Zincir
çalıştığında stitchu'nun sattığı şey o 3–7 günün kendisi.

**KAPSAM — ve burada bir şeyi düzeltiyoruz.** Bu tabloyu okuyup "A kalabalık,
oraya girme, boşlukta dur" demek yanlış. Pazarda kimseye ayrılmış koltuk yok.
stitchu'nun kapsamı:

> **A (flat + tech-pack) + B (kesilebilir kalıp) + bizim eklediğimiz**
> (kumaşa göre değişen kalıp · rehber ve püf noktaları · bölgesel editleme ·
> üyelik/forum · iOS).

Ve A'yı onlardan **daha iyi** yapabilmemizin teknik sebebi var, temenni değil:
onların flat'i bir **illüstrasyon** — model/şablon üstüne çizilmiş bir görsel.
Bizimki (F3 sonrası) gerçek kalıbın **izdüşümü**. Yani onların flat'i kalıbı
bilmiyor, bizimki kalıbın ta kendisinden çıkıyor. Aynı ekranda flat'i, kalıbı ve
ikisinin aynı sayıdan geldiğini gösteren bir ürün, A kampındaki hiçbir aracın
gösteremeyeceği bir şeydir.

Yani B bizim kozumuz **çünkü A'yı da düzeltiyor** — ayrı bir pazar değil, aynı
ürünün iki yüzü.


---

## 1B. HAKEM ÖLÇÜMÜNDEN SONRA — ZEMİN GÜNCELLEMESİ (bu bölüm §1'i EZER)

Tarafsız ajanın 13 maddeyi tek tek koşturmasıyla resim değişti. Değişenler:

**DÜZELTME — şüphem ölçümde doğrulanmadı.** §1.3'te "725 satırlık kelime
eşleştirmesi kayıp kaynağı" dedim. Fotoğraf→spec ölçümü hata sınıflarını verdi:
**GÖRME 4 · KELİME 0 · MOTOR 0.** Yani bridge ve motor temiz çıktı, hata tek bir
yerde: **görü modeli**. Bunu ben yanlış hedeflemişim, F2 buna göre değişti.

**AMA ölçümün kapsamı dar, ve dar oluşu bir bulgu:** hata sınıfları yalnız
sözlükte KARŞILIĞI OLAN alanlarda sayılabiliyor. Sözlükte karşılığı olmayan
şey "KELİME hatası" olarak görünmez, hiç görünmez. Ölçümün kendi satırı bunu
söylüyor: **26 outOfVocab teriminin 26'sı sicilde yok.** Aynı şekilde
`vision-bridge.js:507`'de VLM'in sürekli oranlarının null'lanması da hiçbir
sınıfa düşmez. Yani "KELİME 0" = "sözlüğün gördüğü yerde çeviri doğru";
"sözlük görmediği için kaybolan" ayrı ve sayılmamış bir kanal. n=5.

**ÖLÇÜLDÜ: OLMUŞ.**
- Zincir uçtan uca koşuyor; kalıpta dikiş payı, grainline, çentik, kesim
  çizgisi, katlama hattı var.
- **Flat konvansiyonu BİTMİŞ** — `contract/flat-convention-v1.json` tek kanun,
  dört kapı yeşil (`flat_convention_check` · `flat_expresses_spec_check` ·
  `flat_geometry_sellable_check` · `flat_sellable_check`). Madde 5 kapandı.
- **Parça sayısı temiz** — shift 5 · etek 3 · top 3 · princess elbise 9 · tam
  donanımlı 10. Madde 7 esasen kapandı.
- **Kumaş kalıba iniyor** — aynı elbise woven 244.2mm, knit 228.8mm bodice
  genişliği. Negatif pay gerçek.
- **Rehber çıkıyor** — 14 adım + 14 künye + kumaş uyarısı.
- **DXF zaten ASTM katman semantiğiyle yazılmış** (`engine/src/dxf.cpp:100-129`,
  `dxf.hpp:31-37`): boundary · seamline · grainline · notch · fold · internal ·
  annotation. Sıfırdan yazılacak bir şey değil. **Ama katman numaraları kaymış**
  (aşağıda).
- **Cap ease var ve doğru** — `sleeve.cpp:55`, `sleeve.hpp:12`: kol kapağı kol
  oyuğundan %4 UZUN, validator'da pencere kontrolü ile (`validator.cpp:377-427`).

**ÖLÇÜLDÜ: AÇIK.**
- **Flat kalıptan türemiyor.** `render-garment-flat.mjs:24` hâlâ spec-driven.
  `flat_pattern_agree_check` KIRMIZI (body_length −%3.8, tolerans %1.5).
  Madde 2 ve 3'ün ikinci yarısı buna kilitli.
- **Primitif katmanı doküman, kod değil.** `contract/primitives-v1.json` yazılmış
  (Edge/Panel/Seam/Op) ama `engine/src/` altında hâlâ **40+ isim başına bir
  dosya** var: `cupseam.cpp · peplum.cpp · locket.cpp · bardot…`. "Sınırsız
  kalıp" kâğıtta.
- **Buğra'ya yakın çıkmıyor** ve sebebi sapma değil **parça eksiği**: Bustier'de
  Buğra'nın **Front Side · Front Center · Back Side** parçalarının motorda
  karşılığı YOK; Locket'ta **Collar · Collar Lining · Upper Sleeve · Lower
  Sleeve** YOK. Top Back'te motor 405×318, Buğra 498×148 — aynı parça değil.
- **V8 hiç koşmadı** → kumaş ekseni iki değerde duruyor.
- **Repo temizlenmemiş** — 215MB, 2069 dosya, 89 tutanak, telifli 41 dosya hâlâ
  izlenmekte (`contract_check` kırmızı).
- **Dört kapı kırmızı**: `flat_pattern_agree_check` · `flat_artifact_census` ·
  `style_check` · `sizechart_source_check`.

**YENİ BULGU — DXF katman numaraları ASTM ile uyuşmuyor.** `dxf.hpp:31-37`
seamline'ı **"8"**, internal'ı **"11"** yazıyor. ASTM D6673'te **L8 = internal
lines**, **L14 = sew line**. Yani bizim dikiş çizgimiz fabrikada "iç çizgi"
olarak okunur, iç çizgilerimiz ise tanımsız bir katmanda durur. Tek satırlık
düzeltme ama üretimde sessizce yanlış kesime yol açar.

---

## 1C. ARAŞTIRMADAN GELEN — ZATEN VAR, TEKRAR YAZILMAYACAK

Araştırma raporunun önerdiği bazı şeyler repoda ölçülerek bulundu. Faz ajanı
bunları **sıfırdan yazmaya kalkarsa iş tekrarıdır**:

- **PDF ihracı hazır**: `engine/tools/pdf-core.mjs` A4 döşeli + A0 tek sayfa,
  `calibration()` 3cm kare basıyor (`:214`), A0 ölçek uyarısı var (`:357`).
  Eksik olan tek şey **katmanlı beden seçimi** (tek beden basılıyor).
- **Dikiş payı gerçek offset**: `garment.cpp:1069` → `offsetOutline(commands,
  seamAllowance, onFold)`. FreeSewing'in "Bézier offset'in kapalı-form çözümü
  yok" uyarısı bizde zaten ayrı adım olarak çözülmüş.
- **DXF ihracı ASTM semantiğiyle var**: `dxf.cpp:100-129`. Yalnız katman
  numaraları kaymış (§1B).
- **Cap ease var ve doğru**: `sleeve.hpp:12` %4, `validator.cpp:377-427` pencere.
- **Flat konvansiyonu bitti**: dört kapı yeşil.

## 1D. YASAKLI İDDİALAR — hiçbir faz ajanı bunları kullanmaz

İkinci araştırma raporunda (zero-trust/mimari metni) üç madde **yanlış**.
Ajana verilirse çalışan kodu bozar:

1. **Negatif pay formülü yanlış ve tehlikeli.** O metin `(1 − 1/StretchRatio)`
   diyor ve %50 esneyen kumaşta 66cm beli **44cm**'ye indiriyor. Bu, kumaşı
   maksimum esnemesinin %100'ünde giymek demektir: sıfır toparlanma payı,
   giyilemez, ilk kullanımda deforme. Doğrusu: küçültme mevcut esnemenin bir
   KESRİdir ve **toparlanmaya** bağlıdır (§F6). Repo zaten doğru davranıyor —
   woven 244.2mm ↔ knit 228.8mm, yani ~%6, %33 değil.
2. **"Dikiş çiftleri eşit uzunlukta olmalı" yanlış.** Set-in kolda kapak
   oyuktan UZUNDUR, fazlalık yedirilir. Bunu hakem kuralı yaparsak çalışan kolu
   kırmızıya düşürürüz. Repo doğrusunu biliyor: `sleeve.hpp:12` %4 cap ease.
   Eşitlik kuralı yalnız **yedirmesiz** dikişler için geçerlidir.
3. **Repo hakkındaki sayılar doğrulanmamış.** "0.00mm dikiş eşleşmesi",
   "70.200 taslak matrisi", "motor sonsuz döngüye girer/çöker" — ölçülmemiş.
   `docs/ARCHITECTURE.md:41` 70.200'ü kendisi çürütüyor: *"bu sayı yeniden
   türetilmedi, cümleden değil `ctest -R engine_check` çıktısından oku"*.

## 1E. LİSANS DİSİPLİNİ — kod almadan önce bakılacak tek tablo

| Kaynak | Lisans | Karar |
|---|---|---|
| GarmentCode / PyGarment | **MIT** | port edilebilir |
| AIpparel | **MIT** (HF release) | port edilebilir, repo LICENSE'ı ayrıca teyit et |
| ChatGarment | **Apache-2.0** | port edilebilir |
| FreeSewing (monorepo) | **MIT** | port edilebilir (eski `core` GPL-3, içerik CC-BY — karıştırma) |
| `CorentinDumery/garment-flattening` | **MIT** | port edilebilir |
| NVIDIA Warp (mainline) | **Apache-2.0** | kullanılabilir |
| C-IPC / IPC Toolkit | **Apache-2.0 / MIT** | kullanılabilir |
| **Sewformer kodu** | **LICENSE YOK** (makale CC-BY) | ❌ KULLANMA |
| **ARCSim** | non-commercial research-only | ❌ KULLANMA |
| Seamly2D / Valentina | GPL-3 | ❌ (ürünü GPL'e sokar) |
| NvidiaWarp-**GarmentCode fork'u** | eski NVSCL taşıyabilir | fork kullanılacaksa lisansı ayrıca oku |

Kural: bir faz ajanı dışarıdan kod alacaksa **önce bu tabloya bakar**, sonra
kaynağın LICENSE dosyasını kendi açar. Tablodan hatırlamak yetmez.

---

## 1F. ÖLÇÜM SETİNİN GERÇEĞİ — 29 fotoğraf nereden geldi (ölçüldü, 26 Ağu)

Doküman "10 fotoğrafı Damla seçer" diyordu ama hangi havuzdan, kim, ne zaman
yazmıyordu. Havuz açıldı, içi şu:

**Kaynak: Wikimedia Commons.** `vision/README.md:8` — "real garment photos
fetched from Wikimedia Commons (`fetch-eval.sh`)". Yani telif temiz **ama
koşulsuz değil**: Commons lisansları çoğunlukla atıf ister (CC-BY / CC-BY-SA),
bazıları paylaş-aynı-lisansla. **Bugün repoda dosya başına lisans kaydı YOK**
ve `fetch-eval.sh` de yok (silinmiş). Landing'de örnek olarak yayınlamadan
önce her fotoğrafın Commons sayfası + lisansı + yazarı bir dosyaya yazılmalı.
Yazılamayanlar **landing'e çıkmaz**, yalnız yerel ölçümde kalır.

**Ve asıl mesele: doğru cevaplar makine tarafından üretilmiş.**
`vision/eval/labels.json` kendi başlığında yazıyor: *"Ground truth labeled by
eye (Fable, 2026-07-13) … **PARTIAL**: labeling paused mid-way."* Yani bugünkü
**%92.2 doğruluk, bir modelin başka bir modelin tahminlerine ne kadar uyduğunu
ölçüyor** — insan gerçeğine değil. Sayı bu haliyle **karta girmez**.

**Havuzun gerçek büyüklüğü 29 değil, 19.** Ölçüldü: diskte 29 dosya, etiketli
19 kayıt, `_dropped` listesinde **10 dosya** — gravür, karikatür, kurşun kalem
çizimi, askeri müze, spor mağazası rafı, arkadan çekim, iki parçalı takım.
Bunlar giysi fotoğrafı bile değil. Üstelik etiketli 19 kaydın alanlarının
**42/230'u null** (görünmüyor/belirsiz).

**F2'nin işi — sıra ve karar:**
1. `_dropped` 10 dosya **diskten de silinir**; havuz 19'a iner.
2. Kalan 19'un her biri için **Commons künyesi** (URL · yazar · lisans)
   `dataset/hedef-10/KAYNAK.md`'ye yazılır. Künyesi bulunamayan dosya havuzdan
   çıkar.
3. **Doğru cevapları HAKEM etiketler.** Faz ajanı değil — kendi işini kendi
   notlamasın. Hakem 19 fotoğrafı × 12 alanı gözden geçirir, `labels.json`'u
   düzeltir, her düzeltmeyi kaydeder. Makine etiketi taban kalır, hakem
   düzeltmesi üstüne yazılır. **Damla beklenmez.**
4. Etiketlenen 19'dan **10'u mühürlenir** (`dataset/hedef-10/`), **5'i yedek**
   olarak ayrılır ve ajan **hiç görmez** (§3.8), 4'ü artakalır.
5. **Landing'in 3 örnek fotoğrafı bu 10'un içinden değil**, ayrıca seçilir —
   mühürlü set ajana kapalı kalmalı, landing'deki fotoğraf ise herkese açık.

Hakem etiketlemeden önceki her kartta *"doğruluk sayısı makine etiketine göre"*
şerhi durur; hakem etiketledikten sonra H2 ve H9 yeniden hesaplanır ve şerh
kalkar. Koşu hiçbir aşamada beklemez.

---

## 2. MADDE 4 VE 5 — DÜZELTME (bu bölüm bir önceki taslağı EZER)

Bir önceki taslakta F1 kapısı "flat'in beli = kalıbın beli, fark < 1mm" idi.
**Bu yanlıştı.** Madde 4 açık: flat 36 ile kalıp 36 **farklı bedenlerdir**.
Kalıbınki gerçek, dikilebilir, paylı insan bedeni. Flat'inki ideal kadın
bedeni — manken. Doğru kanun eşitlik değil, **tek kaynak + tek ilan edilmiş
dönüşüm**:

```
seam plan  ──(insan bedeni + pay + kumaş)──►  KALIP     (dikilir)
     └─────(manken bedeni + sıfır pay)─────►  FLAT      (satılır)
```

Yani flat ile kalıp **aynı dikiş planından** çıkar, iki farklı bedende değerlenir.
Bugün ise flat croquis'ten, kalıp başka nesneden çıkıyor — ortak ata yok.

`contract/flat-convention-v1.json` bunu zaten biliyor ve açığı kendisi ilan
ediyor: *"Flat MANKENE göre çizilir, kalıp İNSANA göre… bugün elimizde
YAYINLANMIŞ bir manken çizelgesi YOK; uydurmak yasak"* — croquis bu yüzden
**insan** EU38 çizelgesine bağlı duruyor. Madde 5'in ("hepsi aynı insandan
çıkmış gibi görünsün") kapanmamasının teknik sebebi tam olarak bu açık kalem.

Ölçüldü: bugün beş farklı giysinin flat'inde omuz/boyun tepe çapası ortak
(hepsinde yMin=4.00, tek croquis) — yani konvansiyonun **bir kısmı** oturmuş.
Oturmayan kısım manken bedeninin kendisi.

---

## 3. ORKESTRASYON — ŞEF İŞ YAPMAZ

**Bu bölüm önceki taslakları EZER.** Önceki hâlde şefe Halka 0'ı yaptırmış, bu
dokümanın tamamını okutmuş ve alt-ajan çıktılarını okutmuştum. Üçü de "şef iş
yapmaz" kuralının kendi ihlaliydi ve şefin context'i koşu başlamadan doldu.

### 3.1 Roller

| Rol | Nerede | Ne yapar | Context'i |
|---|---|---|---|
| **ŞEF** | tek kalıcı oturum | etiket atar · ajan salar · hakemin **tek satırlık** hükmünü okur · sıradaki fazı açar | **şişmemeli** |
| **FAZ AJANI** | taze alt-ajan | tek fazı yapar, kartını yazar, **ölür** | şişebilir, umursanmaz |
| **HAKEM** | ayrı taze alt-ajan | kapıları **kendi koşturur**, hüküm verir, **ölür** | şişebilir, umursanmaz |
| **DAMLA** | — | yalnız karar sorularına cevap verir | — |

**Alt-ajanların şişmesi sorun değil — nasılsa ölecekler.** Tek korunan şey
şefin context'idir; şef şişiyorsa iş yapıyor demektir ve yapmamalıdır.

### 3.2 ŞEFİN YAPAMAYACAKLARI — dört yasak

1. **Kod okumaz, komut koşturmaz, dosya taramaz.** Halka 0 dahil **hiçbir iş**
   şefin değildir; hepsi alt-ajana gider.
2. **Bu dokümanı okumaz.** Yalnız §3 (bu bölüm) ve `GECE7/DURUM.md`. Faz
   bölümlerini ajanlara **yol olarak** verir, içeriğini kendisi açmaz.
3. **Alt-ajan çıktısını okumaz.** Ajan kartını `GECE7/F<n>.md`'ye yazar; şef o
   dosyayı **açmaz**. Ajanın döndürdüğü uzun metni context'ine almaz.
4. **Hüküm vermez.** Hükmü daima hakem verir.

### 3.3 Bir fazın hayatı — şefin gördüğü her şey

1. `GECE7/DURUM.md`'yi oku (bir sayfa: sıradaki faz · son kapı sayıları · son
   hüküm · açık kuyruk).
2. `git tag F<n>-oncesi`.
3. **Faz ajanını sal.** Ona verilen tek şey yollardır:
   *"`KOSU-v7.md`'nin §0, §0B, §1C, §1D, §3.5, §3.6, §3.8, §3.11, §4B, §4C
   bölümlerini ve F<n> bölümünü oku."* Şef bu bölümleri okumaz.
4. Ajan işini yapar, kartını yazar, **ölür**.
5. **Hakemi sal.** Ona verilen: kart dosyasının yolu + F<n>'in kapı satırı.
   Hakem kapı komutlarını **kendi koşturur**, hükmünü `GECE7/DURUM.md`'ye
   **tek satır** yazar: `GEÇTİ` / `KALDI` / `GERİ AL` + sıradaki faza not.
6. Şef yalnız o **tek satırı** okur ve davranır:
   - **GEÇTİ** → `git tag F<n>-yesil` (site bu etiketten sevk edilir, §3.5),
     sıradaki fazı aç.
   - **KALDI** → aynı faz, **taze bir ajanla**, hakemin notuyla yeniden. Ölen
     ajan dirilmez.
   - **GERİ AL** → `git reset --hard F<n>-oncesi`, sebep `DURUM.md`'ye.
7. 2. adıma dön. F9 kapanana kadar durma.

Bu döngüde şefin context'ine giren toplam metin faz başına birkaç yüz kelimedir.

### 3.4 DAMLA HİÇBİR ŞEY YAPMAZ — sorular hakeme gider

Faz bölümlerindeki "Damla'ya soru" satırları **Damla'ya gitmez.** Damla ne
soru cevaplar, ne dosyaya yazar, ne kart taşır, ne blok yapıştırır. Koşunun
dışındadır.

Bir faz karar gerektiren bir noktaya geldiğinde şef **hakemi** salar:

> Sen HAKEM'sin. F<n> şu kararı gerektiriyor: [soru]. Bu koşuda iş yapmadın.
> Repoya, ölçüm çıktısına ve `KOSU-v7.md` §0 (hedef) ile §0B md.3 (en
> kısıtlayıcı yorum) ilkelerine bakarak **karar ver**. Kararını ve gerekçesini
> `GECE7/KARARLAR.md`'ye tek satır yaz. Gerekçen bir sayıya ya da yayınlanmış
> bir kaynağa dayansın; dayanamıyorsa en kısıtlayıcı seçeneği seç ve "dayanak
> yok, en kısıtlayıcı seçildi" yaz.

Şef o kararla devam eder. **Koşu hiçbir noktada beklemez.**

Zevk kararları (manken beli kaç mm ince, hangi kumaşlar, landing dili) da
hakemin: en kısıtlayıcı/en standart seçeneği seçer, `KARARLAR.md`'ye yazar.
Damla isterse sonradan bakar ve değiştirir — ama koşu onu beklemez.

### 3.4B Şef oturumu biterse

Şef context'i yine de dolarsa (olmamalı): yeni oturum açılır ve tek cümle
verilir — *"Sen ŞEF'sin. `KOSU-v7.md` §3'ü ve `GECE7/DURUM.md`'yi oku, kaldığın
yerden devam et."* Bu routing değil, devam ettirmedir.

### 3.5 MAIN'DE ÇALIŞILIR — BRANCH YOK

- Bütün fazlar **main**'de çalışır. Branch açılmaz, PR açılmaz.
- Branch'in yerine **etiket**: her faz başlamadan önce `git tag F<n>-oncesi`.
  Geri dönüş tek komut (`git revert` / `git reset --hard F<n>-oncesi`), dallanma
  maliyeti yok.
- Bir faz main'i **yeşil bırakmadan ölemez**: `ctest` + hedef koşusu (§3.6) geçmiş
  olacak. Geçmiyorsa ajan kendi işini geri alır ve kartına "geri alındı" yazar.
  Yarım iş main'de bırakılmaz.
- Faz başına bir push. Faz ortasında yarım commit main'e gitmez.
- **SEVKİYAT MAIN'DEN AYRILIR — bu bir düzeltmedir.** Bugün canlı site main'e
  bağlı. F3 gibi 2–4 oturumluk bir ameliyat sırasında main kırıkken **site de
  kırık** olur. Kural: canlı site **son yeşil etiketten** (`F<n>-yesil`) sevk
  edilir, main HEAD'den değil. Faz kapandığında hakem yeni etiketi atar, site o
  zaman ilerler. Branch yok ama **yayın ile çalışma ayrı**; ikisi aynı şey değil.

### 3.6 HEDEF KOŞUSU — compounding error kilidi

Uzun koşuda asıl tehlike her fazın kendi kapısını geçip **hedeften yavaşça
sapmasıdır**. Kilit şu: hedefin kendisi bir teste çevrilir ve **her fazın
sonunda** koşar.

**HEDEF:** fotoğraf + prompt → kalıp + flat.

**Hedef koşusu:** aynı 10 fotoğraf + 10 prompt, baştan sona hattan geçer.
**Ölçüldü: repoda kök `package.json` YOK**, yani `npm run hedef` diye bir şey
kurulamaz. Reponun kendi düzeni `ctest` (118 `add_test`) + `engine/tests/*.mjs`.
Hedef koşusu da öyle olur: `engine/tests/hedef_kosu.mjs` + `add_test` kaydı.
Tek komut: `ctest --test-dir engine/build -R hedef_kosu`. Altı sayı basar:

| # | Sayı | Ne demek |
|---|------|----------|
| H1 | **Tamamlanma** | 10 girdinin kaçı sonuna kadar gitti (kalıp + flat üretildi) |
| H2 | **Görülen alanda isabet** | Fotoğrafta görünen alanların kaçı doğru okundu. **Gerçek doğruluk budur.** (bugün %92.2, **n=5**, ve **doğru cevaplar makine üretimi** — §1F, insan etiketi gelene kadar bu sayı geçicidir) |
| H3 | **Uydurma alan** | Fotoğrafta yok, çıktıda var **ve ilan edilmemiş**. Sade arka çıkarımı (F0 md.6) ilan edildiği sürece H3'e girmez — cezalandırılan uydurmak değil, **sessizce** uydurmaktır. |
| H4 | **Gereksiz dikiş** | Sebebi olmayan dikiş sayısı (F5'in dört sebebi) |
| H5 | **Dikilebilirlik** | Uzunluğu eşleşmeyen dikiş çifti sayısı |
| H6 | **Konvansiyon sapması** | Manken çapası diğer flatlerden farklı olan flat sayısı |
| ~~H7~~ | ~~Siluet örtüşmesi~~ | **v7'de yok** — F3B ertelendi, ayrı koşuda döner |
| H8 | **İfade edilemeyen** | Gerçek kalıp/giysiden kaçı operatör programına çevrilemedi (§4A) |
| H9 | **Çıkarılan alanda makullük** | Çıkarılan alanların kaçı (a) dikilebilir (b) önle tutuyor (c) en sade seçenek. Görünmeyen alanda "doğru" yoktur; ölçülen şey makullüktür. |
| H11 | **Süre** | Fotoğraftan sonuç ekranına medyan ve en kötü süre. Hedef: toplam <10 sn, kumaş değişimi <1 sn. |
| H10 | **Çıkarıldı oranı** | Alanların kaçı `çıkarıldı`. **Tavanı var** — yükselirken H2 yükselmiyorsa faz kapanmaz (§0B). |

**Her sayının yanına `n` yazılır.** Bugün 29 fotoğrafın 5'i ölçülüyor; "n"siz
sayı karta girmez. Bugünkü "tam spec %20" rakamı **anlamsızdır** ve karta
girmez: görünmeyen alanda hem etiket hem tahmin körlemesineyken "tam doğru"
diye bir şey yoktur.

**Cırcır kuralı (ratchet): altı sayının hiçbiri kötüleşemez.** Bir faz kendi
kapısını geçse bile bu altıdan biri kötüleştiyse **faz kapanmaz** — ajan ya
düzeltir ya `F<n>-oncesi` etiketine geri alır. İyileştirmesi gereken sayıyı faz
kendi tablosundan bilir:

| Faz | İyileştirmesi beklenen | Diğerleri |
|-----|------------------------|-----------|
| F1 tarama+temizlik | (hiçbiri) | hepsi **aynı kalmalı** — saf temizlik, ilk faz |
| F0 ön kapı | **H1** | kötüleşmez |
| F2 kayıp nerede | **H1, H2, H3** | kötüleşmez |
| F3 tek nesne | **H1** | H6 geçici bozulabilir, F4 kapatır (tek istisna, kartta yazılır) |
| F4 konvansiyon | **H6** | kötüleşmez |
| F5 primitif katmanı | **H4, H5, H8** | kötüleşmez |
| F6 kumaş | **H5** | kötüleşmez |
| F7 edit | **H1** | kötüleşmez |
| F8 al dene | hepsi yayınlanır | kötüleşmez |

Faz kartının `KAPI` satırı bu altı sayıyı **önce → sonra** olarak taşır. Başka
hiçbir sayı karta girmez.

**Sapma sorusu (her fazın son satırı):** *"Bu faz bittiğinde bir yabancı fotoğraf
yükleyip kalıp + flat indirebiliyor mu? Bir önceki fazdan daha mı iyi?"* Cevap
"hayır, ama altyapı hazırlandı" ise faz sapmıştır ve hakem reddeder — F1 tek
istisnadır ve o da yalnız "hiçbir şey kötüleşmedi" ile kapanır.

### 3.7 FAZ PLANI SABİT DEĞİL — HAKEM SONRAKİ KARTI YENİDEN YAZAR

Aşağıdaki faz listesi bir **niyet**tir, sözleşme değil. Bir faz bittiğinde:

1. Ajan kartını yazar ve **ölür**.
2. **Hakem** (ayrı alt-ajan) karta ve hedef koşusunun sayılarına bakar.
3. Hakem, **sıradaki fazın kartını yeniden yazdırma yetkisine sahiptir**: sırayı
   değiştirebilir, faz ekleyebilir, bir fazı ikiye bölebilir, bir fazı iptal
   edebilir. Tek şartı: gerekçesini **ölçülen bir sayıya** bağlamak.
4. Şef değişen kartı kendisi yazar ve kendisi açar. Damla'ya gitmez.

Sebep: bu koşuda bir fazın çıktısı bir sonrakinin girdisi. Plana körce uymak,
F2'de öğrenilen şeyi F5'te kullanmamak demektir. **Hata bir sapma değil, bir
girdidir** — yeter ki sonraki kart onu içersin.

Hakemin **yapamayacağı** tek şey: hedefi değiştirmek. Hedef sabittir —
*fotoğraf + prompt → kalıp + flat*.

### 3.8 REWARD HACKING'E KARŞI — dört kilit

Ajan kendi kapısını yazarsa geçer. O yüzden:

1. **Kapı tanımı dondurulur.** Altı sayının (§3.6) tanımı ve ölçüm kodu F2'de
   yazılır ve `contract/hedef-kosu.json`'a mühürlenir. **Sonraki hiçbir faz
   ajanı o dosyaya dokunamaz.** Değiştirmek gerekiyorsa hakem değiştirir ve
   değişiklikten önceki/sonraki sayıyı yan yana yazar.
2. **Fotoğraf seti mühürlü.** Hedef koşusunun 10 fotoğrafı §1F'deki 19'luk
   temizlenmiş havuzdan **hakem tarafından** seçilir, `dataset/hedef-10/` altında durur, **faz ajanı değiştiremez, ekleme
   yapamaz, çıkaramaz.** Ayrıca ajanın hiç görmediği **5 yedek fotoğraf** ayrı
   tutulur; hakem faz sonunda onları da koşar. On fotoğrafa özel kaçamak yazan
   bir ajan yedekte yakalanır.
3. **Mutasyon kanıtı.** Yeni bir kapı eklendiğinde ajan onu **kırdığını**
   göstermek zorunda: kodu kasten bozar, kapı kırmızıya döner, geri alır. Kırmızı
   olamayan kapı kapı değildir. (Repoda `GECE/mutasyon.sh` fikri zaten var, ürün
   hattına bağlanır.)
4. **Kapı gevşetilmez.** Bir eşiği gevşetmek (0.5% → 1.0%) faz ajanının yetkisi
   değildir. Gevşetme gerekiyorsa faz durur, hakem karar verir, gerekçe kartta
   sayıyla yazılır.

### 3.9 LLM'İ NASIL DENETLİYORUZ (API yokken, para yakmadan)

Bugün `PUBLIC_ANALYZE` kapalı ve her çağrı para. Yani vision hattı **üretimde
denetlenmiyor** — Damla'nın sorusu bu. Cevap: **bir kez öde, sonsuz denetle.**

- Mühürlü 10 (+5 yedek) fotoğraf için VLM cevapları **bir kez** alınır ve ham
  JSON olarak `dataset/hedef-10/seen/*.json` altına kaydedilir (fixture).
- `vision-bridge` ve sonrası artık **o kayıtlara karşı** koşar: sıfır API
  çağrısı, sıfır kuruş, her commit'te. §1.9'daki kayıp/uydurma sayıları buradan
  çıkar.
- VLM'in kendisi (prompt, model, şema) değiştiğinde **yalnız o zaman** fixture
  yenilenir; yenileme bir faz kararıdır, kartta maliyetiyle yazılır.
- Böylece iki tuzağın ikisi de kapanır: *"paraları gereksiz yakmak"* (her
  commit'te API çağırmak) ve *"olmuş gibi göstermek"* (hiç çağırmayıp
  varsaymak).

### 3.10 ARAŞTIRMA REJİMİ — her fazın içinde, ayrı tarama fazı yok

v6'da bu vardı, v7'nin ilk taslağında düşmüştü. Geri kondu.

- Dokümanda `⌕ ARAŞTIRILACAK` işaretli her kalem (bugün: ön siluetten arka
  konstrüksiyon kuralları, kontrast eşiği) **o kalemi kullanan fazın içinde**
  araştırılır. Ayrı bir "araştırma fazı" açılmaz — çıktısı bir tablo olan faz
  yasaktır (yasak 1).
- **Araştırma bulgusu künyesiyle yazılır**: yazar/kurum, yayın, yıl, bölüm, URL.
  Künyesi olmayan sayı koda giremez. Bulunamadıysa **"YAYIN BULUNAMADI"** yazılır
  ve sayıyı **hakem** koyar (en kısıtlayıcı değer), ajan değil.
- Ajan bir sayıya ihtiyaç duyup künye bulamazsa **uydurmaz**: kalemi kuyruğa
  yazar, en kısıtlayıcı varsayımla devam eder (§0B md.3), kartında belirtir.
- **Hakem araştırma yapabilir.** Bir faz kartındaki iddiadan şüphelenirse
  kaynağı kendisi arar; ajanın verdiği künyeyi açıp doğrular. Künye ölü linkse
  veya kaynak o sayıyı söylemiyorsa kart reddedilir.
- Lisans sorusu araştırma değil **kural**: §1E tablosu, sonra kaynağın kendi
  LICENSE dosyası. Hatırlamak yetmez.

### 3.11 CONTEXT DİYETİ — bu dokümanın kendisi bir risk

Bu doküman uzun. v6'nın hastalığı buydu ve v7 aynı hastalığa yakalanabilir:
ajan manifestoyu okuyup işe az dikkat ayırır.

**TEK OKUMA LİSTESİ** (§6.2 ile aynıdır; iki liste yazmıştım, çelişiyordu —
düzeltildi). Her faz ajanı şunları okur, fazlası değil:

`ENV.md` · `RULES.md` · **§0** (hedef) · **§0B** (provenance) · **§1C** (zaten
var — tekrar yazma) · **§1D** (yasaklı iddialar) · **§3.5** · **§3.6** ·
**§3.8** · **§3.11** · **§4B** (edge case) · **§4C** (ürün kararları) ·
**yalnız kendi faz bölümü**.

Ek olarak yalnız ilgili faz: **§4A** → F5 · **§1E** (lisans) → dışarıdan kod
alacak faz · **§2** (flat≠kalıp) → F3, F4.

**§1C ve §1D pazarlıksızdır ve her ajana verilir** (toplam ~40 satır). Sebebi
somut: §1C olmadan ajan **bitmiş işi yeniden yazar** — DXF ihracını, PDF
kalibrasyon karesini, cap ease'i, flat konvansiyonunu sıfırdan kurmaya kalkar.
§1D olmadan yanlış negatif-pay formülünü koda sokar. Bunlar saat ve para yakar.

Şef bu listeyi **daraltamaz da genişletemez**; sabittir. Ve şef bu bölümlerin
kendisini **okumaz** — ajana yalnız bölüm adlarını söyler (§3.2 md.2).

### 3.12 FAZ BÜYÜKLÜĞÜ VE BÖLÜNME — dürüst tahmin

v6 saat bütçesi veriyordu; v7'nin ilk taslağı vermiyordu, bu bir eksikti.
Tahminler yol göstericidir, kapı değildir; ama **bir faz tahmininin iki katını
aşarsa durur ve hakeme gider** — sessizce sürünmez.

| Faz | Tahmin | Not |
|---|---|---|
| **F1 tarama+temizlik** | 2–3 saat | **ilk faz.** tarama + silme, kod davranışına dokunmaz |
| F0 ön kapı | 1 gece | altyapı + UI, ikisi de küçük ve bilinen |
| F2 görme | 1 gece | ölçüm 29'a çıkar + en büyük kalem onarılır |
| **F3 tek nesne** | **2–4 oturum** | **tek gece DEĞİL.** Derleme listesi + iki binding + ortak `src/` fonksiyonu + `create.js` bağlanması + sınıf başına tekrar. Zorlanırsa çalışan zincir kırılır. |
| F3B kapalı döngü | 2–3 oturum | sim + segmentasyon + IoU, sunucu tarafı |
| F4 manken | 1 gece | konvansiyon bitti, kalan tek kalem |
| **F5 primitif katmanı** | **en büyük kalem — 6+ oturum, F3 ile İÇ İÇE** | 8 operatör + 40 isim dosyasının çözülmesi + test betiği. **Tek kart olarak koşulamaz;** operatör başına alt-kart açılır, her operatör kendi mutasyon kanıtıyla kapanır, H8 her operatörden sonra ölçülür. Bu fazı tek gecede "bitirdim" diyen ajan reddedilir. |
| F6 kumaş | 1–2 oturum | standartlar belli, rehber türetilir |
| F7 edit | 1–2 oturum | contract var, hat bağlanacak |
| F8 çıktı + Buğra | 1–2 oturum | DXF katman düzeltmesi küçük, katmanlı PDF orta |
| F9 vitrin | 1–2 oturum | H1 10/10 olmadan başlamaz |

**F5 ve F3 bu koşunun ağırlığıdır.** Geri kalan on faz toplamı kadar yer
tutarlar. Planı okurken bunu böyle okumak lazım: v7 on bir eşit faz değil,
**iki büyük iş + dokuz destek fazıdır.**

---

## 4. FAZLAR

Her fazda: teslimat bir URL, kapı bir sayı, karar noktası hakeme gider — **ve o soru
koşuyu durdurmaz**, şef kuyruğa yazıp en kısıtlayıcı varsayımla devam eder (§3.4).

### HALKA YAPISI — 11 eşit faz değil, 3 halka (26 Ağu düzeltmesi)

§3.12 zaten "iki büyük iş + dokuz destek fazı" diyordu ama listeyi on bir eşit
faz gibi diziyordu. Düzeltildi:

| Halka | Fazlar | Bittiğinde ne olur |
|---|---|---|
| **0 — ISINMA** (faz değil, ön şart) | disk temizliği + **hedef koşusunun tabanı** | Ratchet'in ölçeceği bir taban doğar |
| **1 — AL DENE** | **F-İNDİR** → F0 ön kapı → F2 görme | **Yabancı eve dosya götürüyor.** Motor hâlâ eski hatta ama ürün satılabilir. |
| **2 — MOTOR** | F3 ⇄ F5 (iç içe, operatör başına alt-kart) | Flat kalıbın izdüşümü olur, sınırsızlık kapanır |
| **3 — DERİNLİK** | F4 → F6 → F7 → F8 → F9 | Manken · kumaş · edit · Buğra · vitrin |

**F3B (kapalı döngü / IoU) bu koşudan ÇIKARILDI.** Değerli ama: sunucuda XPBD +
segmentasyon koşturmak hem GPU hem hafta yakar, hem de daha sallanan bir motoru
ölçer. Halka 2 bittikten sonra **ayrı bir koşu**. H7 hedef koşusundan da
çıkarıldı.

**RATCHET'İN TABANI HALKA 0'DA DOĞAR — F2'de değil.** Önceki hâlde hedef koşusu
F2'de kuruluyordu, yani F1 ve F0 "hiçbir sayı kötüleşmeyecek" şartıyla koşacaktı
ve o şart **ölçülemezdi**; hakem koşturamaz, "GEÇTİ" der, kilit ilk iki fazda
boşta döner. Artık taban Halka 0'da basılır.

---

### F-İNDİR — kullanıcı eve bir dosya götürsün  📥 KOŞUNUN İLK ÜRÜN FAZI

**Ölçüldü, 26 Ağu:** `web/js/create.js` içinde `download` / `dxf` geçen satır
sayısı **0**. Sonuç ekranında yalnız `printPattern` var (`create.js:797`), o da
`window.print()` tabanlı. İndirme `studio.html`'de duruyor: `studio.js` 28 kez
geçiyor, gerçek `downloadSVG()` (`:299`) ve `dl-dxf` butonu (`:153`) orada.

**Yani kullanıcı kalıbı ekranda görüyor ama eve bir şey götüremiyor.**
"Al dene" cümlesini kuran mesafe bir mimari borç değil — bir indirme butonu.
Planın en derine gömdüğü kalem, ürünün önündeki en kısa mesafeymiş.

**Kullanıcı ne alıyor:** `create.html` sonuç ekranında üç buton — **DXF indir**
· **SVG indir** · **PDF indir** (A4 döşeli + A0, `pdf-core.mjs` zaten üretiyor,
§1C) — artı kumaşa özel rehber metni.

**İş:** `studio.js`'teki indirme yolu `create.js`'e taşınır (kopyalanmaz —
ortak modüle çıkarılır, iki doğru bırakılmaz). PDF `window.print()` yerine
`pdf-core.mjs`'in ürettiği dosyaya bağlanır.

**KAPI:** tarayıcıda `create.html`'den fotoğraf/form ile kalıp üret → üç dosya
da inisin → DXF bir CAD'de açılsın, PDF'te 3cm kalibrasyon karesi 3cm ölçsün.
Üçünden biri inmiyorsa faz kapanmaz.

**Tahmin:** 1 gece. **Karar gerektiren nokta (hakeme gider, §3.4):** yok.

**Sapma sorusu:** bir yabancı eve dosya götürebiliyor mu? Bu fazdan sonra evet.

---

### F1 — TARAMA VE TEMİZLİK  🧹 KOŞUNUN İLK FAZI

**Neden ilk:** F3 ile F5 iç içe koşacak (aşağıda), yani ajanlar bu repoya
defalarca girip çıkacak. Her girişte 2069 dosyalık, çelişkili, 215MB'lık bir
enkazı okumak kalite kaybıdır. Üstelik ağırlığın büyük kısmı **ne kod ne kapı** —
ölçüldü, aşağıda isim isim.

**Kullanıcı ne alıyor:** henüz bir şey. Ama bundan sonraki 7 fazın ajanı
çelişkili 743 dosya yerine tek doğru okuyacak — kalite buradan geliyor.

**Ölçüldü — en ağır izlenen dosyalar (bu sabah):**
`patterns_real/instrucitons.pdf` **18MB** · aynı klasörde 12 adet 1.6–6.5MB
tarama JPG'i · `engine/golden-reference.csv` 2.3MB · `GECE/log/V10-E.png/
index-1440.png` 1.7MB. Ve **516 adet izlenen üretilmiş görsel** (svg/png/pdf/
dxf): `web/collections/pdf` 48 · `reports/gate/...` yüzlerce · `GECE/log/V4-E.kol`
16 · `GECE/log/V4-D.pano` 16 … Bunların **hiçbiri kod değil, hiçbiri kapı
değil, hiçbirini Damla onaylamadı.**

**İş:**
- **SİLMEDEN ÖNCE BAĞIMLILIK TARAMASI — pazarlıksız.** Her silme adayı yol için
  önce `grep -rl "<yol>" engine/tests engine/tools engine/src web/js backend`
  koşulur. **Okuyan varsa silinmez.** Ölçüldü, en az bir gerçek çakışma var:
  `engine/tests/recipe_wasm_parity_check.mjs:35` çalışma anında
  `web/recipes/<dosya>.json` okuyor — bu dosyalar **veri**, üretilmiş görsel
  değil, **silinmez**. Aynı klasördeki üretilmiş görseller silinir.
  (`GECE/` ve `reports/` yolları testlerde yalnız **yorum satırı / kaynak
  künyesi** olarak geçiyor, çalışma anında okunmuyor — ölçüldü, silinmeleri
  testi bozmaz.)
- **Tarama önce, silme sonra — ama ikisi aynı fazda.** Ajan `git ls-files`
  üstünde boyut sıralar, uzantıya göre üretilmiş dosyaları sayar, her klasör
  için **çağıranı var mı** diye grep'ler. Çıktı bir tablo DEĞİL, doğrudan bir
  silme listesidir (yasak 1: ölçüm teslimat değildir).
- `GECE/` (743 dosya, 23MB) ve `reports/` (277 dosya, 8.1MB) **silinir**.
  Bunlar kapanmış koşuların rapor enkazı; hiçbiri kod değil, hiçbiri kapı değil.
- İki doğru bırakan dosyalar silinir, biri kalır: `contract/spec-grammar.json`
  kendi başlığında "ÖLÜ 2B HATTI, hüküm taşımaz" diyor ama parser hâlâ okuyor →
  parser'ın gerçekten ihtiyacı olan alanlar `vocab.json`'a taşınır, dosya gider.
- **KORUNANLAR — bunlar üretilmiş çıktı DEĞİL, silinmez:**
  `vision/eval/photos` (**29 fotoğraf — ölçüm setinin GİRDİSİ**, F2 bunlarsız
  koşamaz) · `web/assets/buttons`, favicon, og-card (arayüz varlıkları) ·
  `web/recipes/*.json` (veri, test okuyor) · `contract/*.json` (kanun).
- **Madde 13: onaylanmamış çıktılar silinir.** Ölçülen tam liste — F1'in ilk
  taslağı bunların yarısını atlamıştı:
  `web/collections/pdf` (48) · `engine/tools/flat-metre/out` (10) ·
  `docs/archive/tools` (9) · `docs/archive/mocks/assets` (5) ·
  `web/assets/flats/*.svg` (4) · ve `reports/` + `GECE/` altındaki ~300 görsel
  (zaten klasör olarak siliniyor).
  `web/styles/*.html` (24 sayfa), `web/collections`, `web/recipes`, `web/patches`
  altındaki üretilmiş flat/kalıp görselleri — Damla hiçbirini onaylamadı, hepsi
  eski hattın ürünü. Silinir; F4'ten sonra yeniden üretilir.
- `engine/imitate` · `engine/pattern-bridge` · `curve-research` ·
  `flatten-research` · `mocks` · `Logs` · `App` → **çağıranı var mı** diye
  grep'lenir; sıfır çağıranı olan silinir, kalanın neden kaldığı tek satırla
  README'ye yazılır.
- `patterns_real/` (65MB) repodan çıkar, `.gitignore`'a girer — telifli satın
  alınmış kalıplar zaten repoda durmamalı; F8'in kör kontrolü için yerel yol
  ENV.md'de tarif edilir.

- **`engine/golden-reference.csv` (2.3MB) — madde 13'ün kenar durumu.** Bu
  dosya eski çıktıların dondurulmuş hâli, yani Damla'nın onaylamadığı
  şeylerden biri. **Silinmez ama rolü daraltılır:** bir *onay* değil, bir
  *değişim dedektörü*dür. F3 gibi büyük ameliyatlarda "farkında olmadan neyi
  bozdum" sorusunu cevaplayan tek şey odur. **Kural:** hiçbir faz onu "doğru
  çıktı" diye gösteremez; yalnız "değişti / değişmedi" için okunur. Bir faz
  onu kasten güncelliyorsa gerekçesini karta yazar.
- **`.git` 87MB ve silmekle küçülmez.** `patterns_real` (65MB) bugün silinse
  bile geçmişte durur; klonlayan herkes indirir. Küçültmenin tek yolu geçmiş
  yeniden yazımı (`git filter-repo`), ki **bütün commit hash'lerini değiştirir**.
  Tek kişilik, tek dallı bir repoda yapılabilir ama geri dönüşü yoktur.
  **Karar hakemin.** Varsayılan: yapılmaz — riski faydasından büyük.
  Yapılmazsa `.git` 87MB kalır ve bu kabul edilebilir — asıl acıtan çalışma kopyasıdır, o temizlenir.

**Ön koşul — `engine/build` yoksa ctest koşmaz.** Temiz klonda bu dizin yok;
fazın ilk işi gerekirse `cmake -S engine -B engine/build && cmake --build
engine/build` ile yapılandırmak, ve **bu adımın süresini karta yazmak**
(75 C++ test dosyası derleniyor, kısa değil).

**KAPI:** `ctest` F1 öncesi kaç yeşil / kaç kırmızıysa, F1 sonrası **aynı**
(tek bir testin bile rengi değişemez — bu faz kod davranışına dokunmaz).
**Çalışma kopyası (izlenmeyen dosyalar DAHİL) `.git` hariç < 100MB** —
bugün 6.2GB. Sadece izleneni ölçen kapı `Logs/` 4GB'a dokunmadan geçer, o
yüzden `du -sh` ile ölçülür, `git ls-files` ile değil.
`Logs/` · `design_patterns/` (787MB) · `new_flats/` (92MB) — üçü de git'te yok;
**içerikleri açılıp bakılmadan silinmez**, ama çağıranı yoksa gider.
Kök dizindeki markdown **14 → ≤ 6** (ajan `ls` çekince hangisinin hüküm
taşıdığını bilemiyor: ANAYASA · HEDEF · DERSLER · ROADMAP · GECE-KOSUSU-v6 ·
DAMLA-KUYRUK · devlog · linkedin `arsiv/`e taşınır).
**Üretilmiş görsel: 516 → ≤ 40.** ("0" yazmıştım, **yanlıştı ve tehlikeliydi**:
o 516'nın içinde `vision/eval/photos`'un 29 ölçüm fotoğrafı ve arayüz
varlıkları da sayılıyor. Sıfıra indirmek F2'nin girdisini yok ederdi.)
Kalan ≤40: 29 ölçüm fotoğrafı + arayüz varlıkları. **Üretilmiş tek bir flat
veya kalıp görseli kalmayacak** — madde 13 budur.

**Karar gerektiren nokta (hakeme gider, §3.4):** `.git` geçmişi yeniden yazılsın mı? (65MB telifli
tarama + 23MB rapor geçmişte duruyor.) Yazılırsa klon 87MB'dan ~10MB'a iner ama
bütün commit hash'leri değişir, geri dönüş yok. Yazılmazsa hiçbir şey bozulmaz,
sadece klon ağır kalır. **Öneri: şimdilik yazma** — riski faydasından büyük,
ve asıl acıtan çalışma kopyası zaten temizleniyor.

(`HEDEF.md · DAMLA-KUYRUK.md · devlog.md · linkedin.md` — 340KB — `arsiv/`
altına taşınır, silinmez, hiçbir faz ajanı okumaz. Karar verildi, sorulmaz.)

---

### F0 — ÖN KAPI: yükleme, prompt, maliyet, hata  🚪 F1'den hemen sonra, çünkü ürünün yüzü bu

Bu fazın kararları **verilmiştir**; hiçbiri sorulmaz, hepsi uygulanır. Ölçülen mevcut durum:
- `index.html`'de **yükleme yok**. Kullanıcı `create.html`'e gitmek zorunda.
- Orada da `input type=file` **gizli** (`create.js:398-402`), bir butonun arkasında.
- Analiz IP başına **3/dk + 15/gün**, draft **20/dk + 200/gün**, görsel 2.8MB,
  KV yoksa fail-closed (`worker.js:128-137`). Yani fren var, kapı yok.

**Kullanıcı ne alıyor:** siteyi açar, ilk ekranda fotoğrafını sürükler, isterse
tek cümle yazar, kalıp + flat iner. Hiçbir yere tıklamadan ne olduğunu anlar.

**KARARLAR:**

1. **Landing'in ilk ekranı yükleme kutusudur.** Sürükle-bırak + tıkla-seç +
   mobilde kamera (`capture="environment"`). Kutunun altında tek satır prompt
   alanı, opsiyonel, örnekli placeholder: *"kolları kısalt, yakayı derinleştir"*.
   Anlatı sonra gelir; ürünü anlatan şey ürünün kendisidir.
2. **ÖNCE ALTYAPI — bu iki mekanizma repoda YOK, yazılacak.** Ölçüldü:
   `backend/worker.js`'te ne fixture yönlendirmesi ne hash önbelleği var; istek
   doğrudan `handleAnalyze` → Claude'a gidiyor (`:140`, `:154`). F0'ın ilk iki
   somut işi bunlar:
   - `worker.js`, `handleAnalyze`'ın **önüne**: `if (isSampleId(req)) return
     loadFixture(id)` — örnek fotoğraf isteği Claude'a **hiç** ulaşmaz.
     Fixture'lar `dataset/hedef-10/seen/*.json` (§3.9 ile aynı dosyalar, iki
     kopya yok).
   - Aynı yere: `sha256(image)` → `RATE_LIMIT` KV'de `seen:<hash>`. İsabet
     varsa kayıtlı `seen` döner, API çağrısı yapılmaz, isabet **loglanır**.
   Bu ikisi yazılmadan F0'ın geri kalanı anlamsızdır: para yine yanar.
3. **"Örnek fotoğrafla dene" birinci sınıf yoldur, teselli ödülü değil.** Üç
   hazır fotoğraf, `seen` cevapları **önceden alınmış ve dosyaya yazılmış**
   (§3.9 fixture). Bunlarla deneyen kullanıcı **sıfır API çağrısı** üretir.
   Sonuç: link yayılsa da para yanmaz, ve kimse boş ekranla karşılaşmaz.
4. **Aynı görsel iki kere analiz edilmez.** Görselin hash'i KV'ye yazılır; aynı
   hash gelirse kayıtlı `seen` döner. Bir fotoğrafı üç kere deneyen kullanıcı
   bir kere ödetir. Tek kalemde en büyük maliyet düşüşü budur.
5. **Kota dolunca sessiz düşme yok.** 429'da ekranda: *"bugünlük analiz hakkın
   doldu — örnek fotoğraflarla devam edebilir ya da giysiyi elle
   seçebilirsin"*, ve iki yol da orada tıklanır. Bugün `analyze.js:35` tek bir
   cümleyle formu öneriyor; kota ile gerçek hata aynı cümleye düşüyor, ayrılır.
6. **Analiz düşerse akış durmaz.** Form yolu zaten var ve kalır; ama "neden
   düştü" yazılır (kota / okunamadı / çok büyük), yoksa kullanıcı ürünün bozuk
   olduğunu sanır.
7. **ARKA GÖRÜNÜM — çıkarım serbest, özellik uydurmak yasak** (Damla, 26 Ağu).
   Kural üç satır:
   - **Arka fotoğraf varsa** onu tasarla. Tahmin yok.
   - **Yalnız ön varsa**: önce arka fotoğrafı **iste** (tek tıkla ekleme).
     Kullanıcı vermezse **sade ve en makul arkayı türet** — boş bırakma, akışı
     durdurma.
   - **Türetilen arka SADE olur.** İzinli: siluetin devamı (ön A-line ise arka
     A-line), boy, kol, yaka genişliğinin arkadaki karşılığı, giyilebilirlik
     için gereken kapanış. **Yasak:** görünmeyen hiçbir *özellik* — dekolte,
     kesik, keyhole, düğme sırası, volan, çapraz bağ, fiyonk. Niş model
     uydurulmaz; sade olan seçilir.
   - **Uydurduğunu söyler.** Ekranda ve rehberde tek satır: *"arka fotoğraf
     verilmedi — arka, ön siluetten sadeleştirilerek türetildi"*. Flat'in arka
     görünümü bu etiketi taşır.
   Aynı dürüstlük her görünmeyen detay için: görülmeyen fermuar, görülmeyen cep
   **çizilmez**, `absent` işaretlenir.
8. **Kumaş seçimi giriş ekranındadır, sonuç ekranında değil.** Dokuma / jarse /
   likralı seçimi negatif payı (§F6) tetikler; kalıp çizildikten sonra sorulursa
   kalıp baştan hesaplanır. Varsayılan "dokuma", tek tıkla değişir, ve seçim
   değişince kalıp **görünür şekilde** değişir (madde 6'nın kullanıcıya
   görünen kanıtı).
9. **GLOBAL HARCAMA TAVANI — IP kotası toplam gideri sınırlamaz.** Günlük
   15/IP, tek kullanıcıyı sınırlar; **binlerce IP'yi sınırlamaz.** Toplam gider
   ancak global bir sayaçla bağlanır: `RATE_LIMIT` KV'de `spend:<gün>`, günlük
   tavan aşılınca yeni analiz **kapanır** ve site örnek fotoğraf + elle seçim
   yoluna düşer (ikisi de sıfır maliyet, ikisi de çalışır). Tavanı hakem koyar (varsayılan: günlük 5 USD). Kuyruk/worker havuzu **bu aşamada gereksiz** — asıl risk
   gecikme değil fatura, ve faturayı kesen şey kuyruk değil tavandır.
10. **YENİDEN HESAPLAMA SINIRI — VLM bir kez, motor sonsuz.** Fotoğraf analizi
   **bir kez** koşar ve önbelleğe girer. Kumaş değiştirildiğinde **VLM tekrar
   çağrılmaz**; yalnız wasm motoru yeniden çizer (milisaniye, sıfır kuruş).
   Kullanıcı arka fotoğraf eklerse bu **yeni bir görseldir**, ikinci bir analiz
   koşar ama sonucu mevcut spec'e **eklenir**, spec sıfırlanmaz — ön için
   `görüldü` olan alanlar korunur, yalnız `çıkarıldı` olan arka alanlar
   güncellenir ve etiketleri `görüldü`ye döner. Ekranda "yeniden hesaplanıyor"
   değil "arka eklendi" görünür.
11. **Ücretsiz kalır, davetli olmaz.** Sebep §0: kapalı ve koltuk başına ücretli
   rakiplerin kopyalayamayacağı tek şey bu. Fren kota + önbellek + örnek
   yoludur, kapı değil.

**Sonuç ekranında ne var (kod logu değil):** flat önizlemesi (SVG) · katmanlı
A4/A0 PDF **indir** · DXF **indir** · o kumaşa özel dikim rehberi (iğne türü,
dikiş tipi, kesim planı). Dördü de bugün motorda üretilebiliyor (§1C); eksik
olan bunların **tek ekranda ve indirilebilir** olması.

**KAPI:** `index.html` ilk ekranda yükleme var · üç örnek fotoğraf sıfır API
çağrısıyla uçtan uca çalışıyor · aynı görsel ikinci kez API'ye gitmiyor
(önbellek isabeti loglu) · 429 ekranda iki tıklanabilir yol gösteriyor ·
sadece-ön fotoğrafta arka **türetiliyor, sade kalıyor ve türetildiği yazıyor**;
aynı giysi ön-yalnız ile ön+arka koşulduğunda arka panel **yalnız ilan edilen
alanlarda** farklı çıkıyor, hiçbir özellik icat edilmemiş ·
sonuç ekranında dört çıktı da indirilebiliyor · 320px'te bozulmuyor · mobilde
kamera açılıyor.

**Kota: günlük 15 kalır** (Damla, 26 Ağu). Fren kotadan değil, hash önbelleği
ve sıfır-maliyetli örnek yolundan gelir.

**Anahtar durumu belirsiz.** Ajan bunu **varsaymaz** ve kimseyi beklemez: fazın ilk
işi `/api/analyze`'a bir örnek görsel atıp dönen kodu kartına yazmaktır. 401/500
dönerse F0 örnek fotoğraf yoluyla tamamlanır ve kart *"anahtar yok, kendi
fotoğrafı hattı kapalı"* der — sessizce çalışıyormuş gibi yapmaz.

**Sapma sorusu:** bir yabancı siteyi açıp hiçbir şey sormadan kalıp indirebiliyor
mu? F0'dan sonra: örnek fotoğrafla evet, kendi fotoğrafıyla anahtar varsa evet.

---

### F2 — GÖRME (ölçüm hedefi buraya kaydırdı)

Bu faz eskiden "kayıp nerede" idi. Ölçüm cevapladı: **GÖRME 4 · KELİME 0 ·
MOTOR 0**. Faz artık bridge'i değil **görü modelini ve sözlüğün kapsamını**
hedefliyor.

**Kullanıcı ne alıyor:** yüklediği fotoğrafın doğru okunma oranı yükseliyor;
model yanlış gördüğünde bunu **söylüyor** ("bu yakayı net göremedim") ve
kullanıcı tek tıkla düzeltebiliyor.

**İş:**
- Ölçüm **5 fotoğraftan 29'a** çıkar (banka zaten dolu). n=5 ile alan doğruluğu
  %92.2 / tam spec %20; bu sayılar 29'da yeniden ölçülmeden hiçbir karar
  verilmez.
- **Sayılmayan iki kanal sayılır**: (a) `outOfVocab` — bugün 26/26 terimin
  sicilde karşılığı yok; her terim ya primitife çözülür ya `absent` diye
  dürüstçe işaretlenir. (b) `vision-bridge.js:507` — VLM'in ölçtüğü sürekli
  oranların null'lanması; bu kayıp hiçbir hata sınıfına düşmüyor çünkü sözlük
  onu görmüyor.
- Görü tarafında ucuz kaldıraçlar önce denenir ve **ölçülür**: yapılandırılmış
  çıktı (tool_use şeması) ile bozuk JSON sınıfını sıfırlamak; `max_tokens 1100`
  tavanına çarpma sayısı; tek 4500 kelimelik istemi **tarif** + **ölçüm** diye
  ikiye bölmek.
- **Belirsizlik dürüstçe taşınır**: model emin değilse spec'e `confidence`
  düşer, UI sorar. Yanlış görüp sessizce çizmek en pahalı hatadır.

**KAPI:** 29 fotoğrafta alan doğruluğu ve tam-spec oranı önce→sonra yazılı ve
ikisi de yükselmiş · `outOfVocab` terimlerinin **%0'ı sicilsiz kalmamış**
(çözülmüş ya da `absent` işaretli) · bozuk JSON sayısı 0.

**Karar gerektiren nokta (hakeme gider, §3.4):** model yanlış gördüğünde kullanıcıya sorsun mu, yoksa en
olası tahminle sessizce devam edip düzeltmeyi sonraya mı bıraksın? (Sormak
doğruluğu artırır, akışı yavaşlatır.)

**Sapma sorusu:** aynı 29 fotoğrafta zincirin ucundaki kalıp+flat daha mı doğru?

---

### F3 — TEK NESNE: flat ile kalıp aynı dikiş planından  ⭐ kilit faz

**Kullanıcı ne alıyor:** create.html'de aynı ekran, ama flat artık bir çizim
değil hesap. Yakayı derinleştirdiğinde flat da kalıp da **birlikte** değişiyor.

**İş:**
- `engine/build-wasm.sh:72,111` → derleme listesine `surfacepattern.cpp
  bodysurface.cpp garmentshell.cpp flatten.cpp shellprojection.cpp drape.cpp`.
- `wasm/bindings.cpp:503` → `planJSON(spec, body)` ve `flatJSON(spec, mannequin)`
  ihraç edilir. Gövdeleri `tools/shell-flat.cpp` / `tools/surface-pattern.cpp`
  içinden **kopyalanmaz**, ortak `src/` fonksiyonuna taşınır (iki doğru yok).
- `draftJSON` yüzey hattına çevrilir. **Sıra** bir sınıfla başlar
  (`garment=top, shaping=dart, fabric=woven`) çünkü tek seferde hepsi bu fazı
  öldürür — ama **F3 sınıf başına tekrarlanır ve son sınıf da geçene kadar koşu
  F8'e varamaz.** Bir sınıf geçtiği anda eski hattın o sınıfa ait kodu **silinir**
  (yasak 3). "Şimdilik eski hatta" diye kalıcı bir kutu yok.
  **Bu sayaç kullanıcı arayüzüne ÇIKMAZ.** "Sistemin %33'ü yeni hatta" cümlesi
  kullanıcıya "bu site bozuk" dedirtir. Geçiş sessiz olur; kullanıcı yalnız
  kendi giysisinin çıktısını görür. Sayaç faz kartında ve hakemde durur.
- `web/js/create.js` flat'i `renderGarmentFlat` yerine `flatJSON`'dan alır.

**KAPI (eşitlik değil — §2):** top/dart/woven'da spec'in yakayı 20mm
derinleştiren tek bir değişikliği, **hem** kalıpta hem flat'te ölçülebilir bir
değişiklik üretiyor ve iki değişiklik **aynı dikiş planı düğümünden** türüyor.
Flat'te değişip kalıpta değişmeyen (veya tersi) **sıfır** alan.

**Karar gerektiren nokta (hakeme gider, §3.4):** İlk sınıf `top/dart/woven` mi olsun, `dress/princess` mi?
(Öneri: top — en az parça, en hızlı görünür sonuç.)

---

### F3B — KAPALI DÖNGÜ  ⛔ BU KOŞUDAN ÇIKARILDI, AYRI KOŞUYA ERTELENDİ

> Aşağıdaki tasarım geçerli ve değerli, **ama v7'de koşulmayacak** (halka
> tablosu). Sebep: sunucuda XPBD + segmentasyon hem GPU hem hafta yakar ve
> henüz sallanan bir motoru ölçer. Halka 2 bittikten sonra ayrı koşu.


Madde 11: *"geometri motoru kusursuz değil, sorunların teşhis edilip gelişmesi
gerekiyor."* Bugün motorun kendini kontrol etme yolu yok — kalıbı çiziyor,
doğru mu bilmiyor. Bu faz o döngüyü kapatıyor ve koşunun en iddialı parçası.

**Kullanıcı ne alıyor:** kalıbın yanında *"bu kalıp dikilince fotoğraftaki
giysiye %87 benziyor"* ve benzemeyen yerin üstü işaretli. Kimse bunu vermiyor.

**İş — hat şöyle kapanır:**
```
fotoğraf ──► maske (segmentasyon)  ────────────────┐
                                                    ├─► ÖRTÜŞME (IoU) ─► H7
spec ─► dikiş planı ─► kalıp ─► KUMAŞ SİMÜLASYONU ─┘
                                 (mankene giydir, siluet al)
```
- **Nerede koşar — karar:** bez simülasyonu **kullanıcının tarayıcısında,
  her taslakta koşmaz.** Mobilde çöktürür, masaüstünde kilitler. Sunucu
  worker'ında **asenkron arka plan işi** olarak koşar; kullanıcı kalıbını
  beklemeden alır, IoU sayısı hazır olunca sonuç ekranına düşer ("kontrol
  ediliyor…" → "%87"). Zincirin hiçbir adımı buna bloke olmaz.
- **Bez simülasyonu**: `engine/flat-engine/cloth-solver.mjs` zaten var ama JS'te
  ve ürün hattında değil. Headless XPBD olarak sunucuya taşınır. Kalıp panelleri dikilir, mankene giydirilir,
  ortografik siluet alınır.
- **Fotoğraf maskesi**: giysi segmentasyonu (SAM 2 sınıfı bir maske modeli ya da
  insan-parçalama modeli) worker'da koşar. Bu maske **iki işe** yarıyor: H7'nin
  paydası, ve §1.9'daki `trusted` bayrağı — piksel ölçümü güvenilir olunca
  VLM'in sürekli oranları artık null'lanmıyor. Tek yatırım, iki kapı.
- **Sapan yer işaretlenir**: IoU farkının nerede biriktiği (omuz / kol oyuğu /
  etek genişliği) panel adıyla raporlanır. Motorun teşhis kanalı budur.

**Yayınlanmış zemin (uydurma eşik koymayalım):** aynı işi yapan çalışmalarda
(Dress-1-to-3, CloSe/4D-Dress) baseline'lar **IoU 0.575–0.781**, Chamfer 2.16–4.70
bandında. Segmentasyon için ücretsiz ve ONNX'e çevrilebilir seçenek: **SCHP**
(LIP 20 kategori / ATR 18 kategori) veya SAM 2. Simülasyon için **NVIDIA Warp
(Apache-2.0)** sunucu-worker'da; tarayıcıda three.js üstünde custom XPBD —
hazır, üretime uygun saf JS/WASM *cloth* kütüphanesi YOK, yazılacak.

**KAPI:** H7 on fotoğrafta ölçülüyor ve bir **taban** sayı yazılıyor. Sapmanın
en büyük biriktiği tek bölge isimle raporlanıyor. Faz, o bölgeyi düzeltmeden
kapanmaz (ölçüm tek başına teslimat değil).

**Karar gerektiren nokta (hakeme gider, §3.4):** IoU eşiği kullanıcıya gösterilsin mi, yoksa yalnız içeride mi
tutulsun? (Göstermek dürüst ve güven verir; düşük sayı da satmayabilir.)

**Sapma sorusu:** bir yabancı fotoğrafını yükleyip kalıbın fotoğrafa ne kadar
uyduğunu görebiliyor mu? Evet.

---

### F4 — MANKEN BEDENİ (konvansiyonun kalan tek açık kalemi)

**Konvansiyonun kendisi bitti** (dört kapı yeşil, §1B). Geriye madde 4'ün tek
açık kalemi kaldı: croquis hâlâ **insan** EU38 çizelgesine bağlı, çünkü
`flat-convention-v1.json` yayınlanmış bir manken çizelgesi bulunamadığını
kendisi ilan ediyor.

**Kullanıcı ne alıyor:** flat 36'sı ile kalıp 36'sı artık bilerek ve ilan
edilerek farklı. Flat ideal bedende, kalıp gerçek dikilebilir bedende.

**Yayınlanmış zemin:** moda illüstrasyonu croquis'i **9 kafa** (stilize, siluet
vurgusu); **teknik çizim/flat için 7–8 kafaya** çekilir, çünkü üreticiyle
konuşan çizimde gerçekçi oran gerekir. Yani flat croquis'i illüstrasyon
croquis'i DEĞİLDİR — bu, madde 4'ün sorduğu farkın yayınlanmış tarafıdır.
Sayısal bel/göğüs/kalça fark tablosu için otoriter yayın **bulunamadı**; o
sayıyı hakem koyar (§3.10) ve `KARARLAR.md`'ye gerekçesiyle yazar.

**İş:** ya yayınlanmış bir manken/croquis çizelgesi künyesiyle bağlanır, ya
**"stitchu manken çizelgesi v1"** açıkça kendi kararımız olarak ilan edilir
(uydurma değil — kaynağı "bizim kararımız" yazılır). Croquis o çizelgeden
türetilir. F3 bittiğinde flat zaten kalıptan geliyor olacak; bu faz onu hangi
bedene projekte ettiğini sabitler.

**KAPI:** her flat'in manken çapaları tek çizelgeden okunuyor ·
`flat_artifact_census` yeşil · 12 flat tek sayfaya basılmış ve hakem çapa sayılarını kendi ölçmüş.

**Karar gerektiren nokta (hakeme gider, §3.4):** manken beli kalıp belinden kaç mm ince olsun? Zevk kararı,
ölçümle çıkmaz, senin vermen lazım.

---

### F5 — PRİMİTİF KATMANI KODA İNSİN (madde 9'un asıl işi)

> **SIRA DÜZELTMESİ — F3 ile F5 İÇ İÇE KOŞAR, ARDIŞIK DEĞİL.**
> 40+ isim dosyası (`cupseam.cpp`, `peplum.cpp`, `locket.cpp`…) **eski hatta**
> yaşıyor. Bir sınıfı yüzey hattına geçirdiğin an o sınıf için bu dosyaların
> yaptığı iş kaybolur. Yani F3'ün **ikinci ve sonraki sınıfları**, o sınıfın
> isimlerini karşılayan operatörler F5'te yazılmadan geçemez.
> Gerçek sıra: **F3(ilk sınıf) → F5(operatörler, parça parça) → F3(kalan
> sınıflar)**. Her F5 alt-kartı bir veya birkaç operatör kapatır; kapanan
> operatör kümesi F3'ün bir sonraki sınıfını **açar**. Hakem bu iki fazı tek
> kuyruk olarak yürütür.

**Parça sayısı zaten temiz** (§1B: shift 5 · etek 3 · top 3 · princess 9). Madde
7 esasen kapandı. Açık olan madde 9: `contract/primitives-v1.json` Edge / Panel /
Seam / Op katmanını **doküman olarak** tarif ediyor ama `engine/src/` altında
hâlâ **40+ isim başına bir dosya** var (`cupseam.cpp`, `peplum.cpp`,
`locket.cpp`, `bardot`…). İsim silinince geometri kalmıyor — kendi yasasının
tersi.

**Kullanıcı ne alıyor:** sözlükte adı olmayan bir giysi. İki isim arası ara
değer kalıp veriyor. Ve **Buğra'da eksik olan parçalar** (Front Side · Front
Center · Back Side · Collar · Collar Lining · Upper/Lower Sleeve) artık isim
beklemeden, panel bölme operatörüyle çıkıyor.

**İş:**
- `SurfacePanel` / `SurfaceStitch::Kind` + `primitives-v1.json`'un Op kümesi
  (`suppress · gather · flare · extend · split · overlay · attach`) **C++'ta
  gerçek operatör** olur. `draftJSON` çıktısına `panels[]` + `stitches[]` +
  her dikişin `reason` alanı eklenir.
- 40+ isim dosyası **birer birer** operatör bileşimine çözülür. Her çözülen isim
  dosyası **silinir** (yasak 3). Çözülemeyen `absent` kalır, silinmez.
- Kanun testi: bir ismi çeviriden çıkar, aynı giysiyi dikiş planıyla tarif et →
  **aynı kalıp** (bayt farkı 0).
- **Yayınlanmış zemin:** GarmentCode'un `Edge / EdgeSequence / Panel /
  Interface / StitchingRule` semantiği (MIT, port edilebilir) — özellikle
  **dart-as-operator** ve **aynı isimli interface'lerin birbirinin yerine
  geçebilmesi**; "sabit menü olmadan sınırsız kombinasyon" argümanının
  yayınlanmış hali budur. Düzleştirme tarafında **ABF++** (düşük distorsiyon)
  ve giysiye özel anizotropik çekirdek `CorentinDumery/garment-flattening`
  (MIT).
- **Buğra'nın eksik parçaları için kritik uyarı:** GarmentCode'un dikiş modeli
  **1:1 tam-kenar** varsayar; yaka astarı, üst/alt kol gibi çok parçalı
  yapılarda patlar. GarmageNet'in **many-to-many kısmi-kenar** dikişi bu kısıtı
  aşıyor. `SurfaceStitch` bu yönde genişletilmeden Collar Lining ve Upper/Lower
  Sleeve çıkmaz.

**Test betiği fiziksel olarak yazılır:** `engine/tests/expressability_check.mjs`
+ `engine/CMakeLists.txt`'e `add_test` kaydı (kök `package.json` yok, `npm run`
kullanılamaz — §3.6). H8'i **bu betik** hesaplar; ajanın
kartına yazdığı sayı değil. Betik yoksa H8 yoktur ve faz kapanmaz — "op'ları
yazdık, H8 sıfır" cümlesi kapı değildir.

**KAPI:** `expressability_check` repoda var ve kırmızıya düşebiliyor (mutasyon
kanıtı, §3.8) · çözülen isim dosyası sayısı önce→sonra · sözlükte adı olmayan 3 giysi
dikiş planıyla çiziliyor ve dikilebilirlik kapısından geçiyor · `reason` alanı
boş sıfır dikiş.

**Önce operatör kümesi kapatılır** (§4A): `rotate · slash-spread · pleat · fold ·
merge · derive · asymmetry · ease-region` eklenmeden isim çözmeye başlanmaz —
eksik operatörle çözülen isim yarım çözülür ve geri gelir.

**Karar gerektiren nokta (hakeme gider, §3.4):** 40+ ismin hangisiyle başlansın? (Öneri: `derive` + `rotate` —
Buğra'nın Collar Lining ve Front Side/Center parçaları doğrudan bu ikisinden
çıkıyor, yani F8'in kör kontrolünü besliyor.)

---

### F6 — KUMAŞ (v6'da hiç koşmadı)

**Kullanıcı ne alıyor:** aynı elbise, üç kumaş, **üç farklı kalıp** ve kumaşa
göre değişen rehber: *"bu krepte yaka esner, pay bırak"*, *"jerseyde pens
yerine büzgü"*.

**İş:** `fabric: woven|knit` iki değerden ibaret; kalıbı belirleyen **dört**
fiziksel sayıya açılır:
- **esneme %** — yayınlanmış ölçüm yöntemi var: 10cm işaretle, rahat çek, ölç.
  Ve yayınlanmış **dört bant**: stabil %0–25 (dokuma gibi davranır, kalıp
  küçültmesi yok) · orta · esnek · süper esnek %76–100 (mayo/tayt sınıfı).
  Her bandın kendi **kalıp küçültme oranı** var — negatif pay budur.
- **toparlanma (recovery) %** — esnemeden ayrı bir eksen. Yüksek esneme + düşük
  toparlanma = giysi bir gün sonra sarkar. Negatif pay **ikisinin birlikte**
  fonksiyonudur; yalnız esnemeye bakan kalıp yanlıştır.
- **düşüm / bükülme sertliği** — büzgünün ve kloşun nasıl döküleceği.
- **kumaş eni** — kesim planını ve F5'in `width` dikiş sebebini belirler.

**Yayınlanmış zemin:** örme için **ASTM D2594** (yük altında esneme + gerilim
kalkınca *growth*), dokuma için **ASTM D3107** — dokumada growth en çok %3,
toparlanma en az %75 (15 sn) / %85 (30 dk). Düşüm için **FAST** eğilme
rijitliği doğrudan hesaplanabilir: `Bending_Rigidity (µNm) = Ağırlık (g/m²) ×
Eğilme_Boyu (mm)³ × 9,807×10⁻⁶` — yani tartı + basit bir eğilme testiyle
kullanıcı kendi kumaşını girebilir. Alternatifler Cusick drape ve KES-F.
**Uyarı:** esneme + toparlanma + growth'u tek formülde birleştiren otoriter bir
yayın **bulunamadı**; hesap D2594/D3107 girdilerinden türetilir ve §1D'deki
yanlış formül KULLANILMAZ.

Dördü de ease'i, negatif payı, büzgü oranını ve F5'in `strain` eşiğini besler.

**Rehber paketi** (madde 10 — kullanıcı sadece kalıp alıp gitmiyor) bu
sayılardan **türetilir**, elle yazılmaz: dikiş payı (kumaşa göre değişir) ·
**kesim planı** (kumaş eninde parçaların yerleşimi + metraj) · **iğne/iplik
tipi** (örme = jersey/ballpoint iğne, dokuma = universal) · dikiş tipi (örmede
düz dikiş çatlar, zigzag/overlok) · o giysiye özel püf noktaları.

**KAPI:** aynı spec · 3 kumaş · 3 ölçülebilir farklı kalıp (bel / kol oyuğu /
büzgü oranı sayıları farklı) · 3 farklı rehber + kesim planı · ve **rehberdeki
her cümlenin bir sayıya bağlı olduğu** gösteriliyor. Kaynaksız tek cümle
kalmayacak.

**Karar gerektiren nokta (hakeme gider, §3.4):** İlk üç kumaş hangileri? (Öneri: pamuklu dokuma · viskon/krep
düşümlü · single jersey örme — üç ayrı davranış sınıfı.)

---

### F7 — EDİT (fiyonk ekle, yakayı değiştir, uzat)

**Kullanıcı ne alıyor:** çizilmiş kalıbın üstünde "buraya fiyonk ekle" yazıyor,
**yalnız o bölge** değişiyor. Kalıp baştan çizilmiyor. Madde 2.

**Mekanizma — çıpa + oran, piksel değil:** edit, kenar üstünde bir **çıpa** ve
kenarın toplam uzunluğuna göre bir **oran** ile tanımlanır ("bu kenarın %30–%70
aralığındaki kavis derinliğini 20mm artır"). Böylece dış çerçeve ve dikiş
payları bozulmadan yalnız ilgili Bézier parçası güncellenir; karşı dikişin
uzunluğu aynı anda kontrol edilir.

**İş:** `contract/edit-locality-v1.json` bölgeleri zaten ilan ediyor; eksik olan
edit'in **dikiş planı deltası** olarak ifade edilmesi ve
`edit_locality_check.mjs` kapısının ürün hattına bağlanması. Edit, F3'ün tek
nesnesi üstünde çalıştığı için flat ve kalıp **birlikte** güncellenir.

**KAPI:** 3 edit (fiyonk ekle · yaka değiştir · boy uzat) · her birinde bölge
dışındaki panellerin çıktısı **bayt-aynı** · flat ile kalıp ikisi de değişmiş.

**Karar gerektiren nokta (hakeme gider, §3.4):** Edit dili serbest metin mi, tıklanabilir bölge + kısa cümle
mi? (Bölge seçimi lokaliteyi garantiler; serbest metin daha çok yanlış anlar.)

---

### F8 — AL DENE + BUĞRA KÖR KONTROLÜ

**Kullanıcı ne alıyor:** tek sayfa, 10 gerçek fotoğraf, 10 kalıp + flat +
rehber, PDF iniyor, link paylaşılabiliyor. "Al dene" cümlesi burada kuruluyor.

**İş:**
- 10 fotoğraf → 10 çıktı, hepsi aynı hatta, **hiçbiri elle düzeltilmemiş**.
- **Buğra kör kontrolü:** `vocab.json`'dan `cupSeam: bugra` ve `locketTop: bugra`
  değerleri **çıkarılır** (§1.6). Motor ezberlemeden, yalnız fotoğraf + prompt
  ile çizer; `bugra-parity.mjs` sapmayı ölçer.
  **Bugünkü durum ölçülü ve net: hayır, yakın çıkmıyor** — Bustier'de %8–115
  sapma, Top Back'te motor 405×318 ↔ Buğra 498×148. Ve asıl sorun sapma değil
  **parça eksiği**: Front Side · Front Center · Back Side · Collar · Collar
  Lining · Upper Sleeve · Lower Sleeve motorda **yok**. Bu liste F5'in
  `split`/`attach` operatörlerinin doğrudan hedefidir; F5 geçmeden bu faz
  açılmaz.

**KAPI:** 10/10 sayfa yükleniyor, PDF iniyor · Buğra sapması bir sayı olarak
raporlanıyor. **Bu sayı bir hedef değildir** — düşürmek için motor Buğra'ya göre
ayarlanmaz. Kör kontrol ayar vidası değildir.

**Karar gerektiren nokta (hakeme gider, §3.4):** Sayfa herkese açık mı, davetli mi? (Açık = geri bildirim,
davetli = kontrollü ilk izlenim.)

---

### F9 — VİTRİN, LANDING VE İLK MÜŞTERİ

Bu faz **F8 geçmeden başlamaz.** Sebep Damla'nın kendi şartı: iş modellerinin
tek koşulu zincirin edge case'lere rağmen çalışması. H1 (tamamlanma) 10/10
değilken pazarlama, çalışmayan bir şeyi tanıtmak olur ve ilk izlenim bir kere
harcanır.

**Kullanıcı ne alıyor:** açtığı sayfa ne yaptığını 5 saniyede anlatıyor,
fotoğrafını yüklüyor, kalıp + flat + rehber indiriyor. Ekranda gördüğü her
sayı **o gün ölçülmüş** bir sayı.

**İş:**
- **Landing sıfırlanır.** Bayat iddialar silinir (ölçüm: son taramada landing'de
  18 iddia vardı, 0'ı doğrulanmış, 1'i yanlış, 17'si kanıtsız). Yerine hedef
  koşusunun altı sayısı **canlı** konur: *"10 fotoğrafın 10'u tamamlandı ·
  siluet örtüşmesi %87 · gereksiz dikiş 0"*. Sayı testten gelir, elle yazılmaz.
- Eski blog / patch notes: zinciri anlatmayan her şey **silinir**. Kalanlar
  "nasıl çalışıyor" anlatısına dönüşür (bir gönderi = bir terzilik problemi +
  nasıl çözüldüğü). Bu hem SEO hem Instagram/LinkedIn içeriği.
- **iOS için mimari not (şimdiden karar):** iOS'ta JIT yasak olduğu için wasm
  motoru tarayıcıdaki gibi koşamaz. Çözüm **WasmKit** — saf Swift wasm
  yorumlayıcısı; `.wasm` modülü sandbox içinde JIT ihlali olmadan cihazda koşar,
  çıktı CoreGraphics/Metal ile çizilir. Bu, C++/wasm tercihini iOS'ta bir
  avantaja çeviriyor — sunucu maliyeti sıfır. Motor bugünden **tek bir bağımsız
  .wasm** olarak derlenebilir tutulur ki o gün ekstra iş çıkmasın.
- **Fiyat çapaları** (konumlandırma için, 2026): Style3D $99–299/ay ·
  Techpacker $49–89 kullanıcı/ay · Adstronaut tech-pack başına $3–7 (kalıp
  VERMİYOR) · serbest teknik tasarımcı stil başına $150–500, 3–7 gün.
  FreeSewing emsali: MIT, tamamen ücretsiz, bağışla dönüyor.
- **Tasarım tokenleri ayrılır** (`web/css` → renk/tipografi/aralık değişkenleri
  tek dosyada). Sebep: iOS Swift uygulaması aynı arka plan ve fontları
  kullanacak; token dosyası o gün kopyalanacak tek şey olur. Bugün değerler
  CSS'in içine gömülü ve iki kere yazılmış olur.
- **İki iş modeli iki ayrı yol olarak kurulur** (aşağıdaki §4.1).
- **DXF katman numaraları düzeltilir.** `engine/src/dxf.hpp:31-37` seamline'ı
  `"8"`, internal'ı `"11"` yazıyor; ASTM D6673'te **L8 = internal lines**,
  **L14 = sew line**. Tek satırlık düzeltme ama bugün dikiş çizgimiz fabrikada
  iç çizgi olarak okunuyor. Kesim atölyesine "al dene" demeden önce kapanmalı.

**KAPI:** landing'de kaynağı olmayan **sıfır** iddia · gösterilen her sayı
`contract/hedef-kosu.json`'un ürettiği sayı · sayfa 320px'te bozulmuyor ·
hakem, ürünü hiç görmemiş bir alt-ajanı tarayıcı akışında adım adım yürütüp
yardımsız çıktı indirilebildiğini doğrulamış.

**Karar gerektiren nokta (hakeme gider, §3.4):** Landing tek dil mi (TR) çift dil mi? (Flat/tech-pack alıcısı
global, giysi alıcısı yerel — iki model iki dil istiyor olabilir.)

---

## 4.1 İKİ İŞ MODELİ — ayrı kitle, ayrı ürün, ortak motor

Aynı zincir iki şey satar; ikisini aynı sayfada aynı anda anlatmak ikisini de
öldürür.

| | **A — Flat / tech-pack** | **B — Giysi** |
|---|---|---|
| Kim | küçük marka, Etsy kalıp satıcısı, moda öğrencisi, atölye | son kullanıcı |
| Ne alıyor | flat + kalıp + rehber, indirilebilir dosya | dikilmiş giysi |
| Neden hızlı | stok yok, kargo yok, marjı motor üretiyor | stok + üretim + iade var |
| Kanıtı | çıktının kendisi (indirip bakıyor) | fiziksel numune |
| İlk 100 müşteri nerede | LinkedIn + Etsy/Instagram kalıp satıcıları | Instagram |

**İkisi de yapılır, ikisi aynı motordan çıkar.** Sıralama bir tercih değil bir
takvim meselesi: A'nın çıktısı bir dosya olduğu için **daha erken** satılabilir
(envanter yok, kargo yok, iade yok, sınır ötesi satış kolay, kalitesi indirilen
dosyada anında görünür). B üretim işi olduğu için hazırlığı uzun. Yani A önce
**para getirir**, B'nin hazırlığı paralel yürür — A yerine B değil, A ile
birlikte B.

Ve A'da rakiplerin üstüne çıkma noktamız §1.10'da: onların flat'i çizim,
bizimki kalıbın izdüşümü. Aynı sayfada "işte flat, işte o flat'in kalıbı, ikisi
aynı sayıdan" demek A kampında kimsenin diyemediği cümle.

**İçerik motoru (ikisi için de aynı):** her gönderi **bir fotoğraf + yanında o
fotoğraftan çıkan flat**. Bu görsel kendini anlatıyor ve paylaşılabiliyor; ürün
zaten görsel bir ürün. Haftalık ritim: 3 × "fotoğraf → flat" (Instagram),
1 × "bu hafta çözülen terzilik problemi" (LinkedIn, F-kartından türetilir).
Yani **koşunun kendisi içerik üretiyor** — ayrı pazarlama işi değil.

**Ölçü:** ilk hedef satış değil, **ikinci kez kullanan** kişi sayısı. Bir kere
deneyip dönmeyen 100 kişi, 10 dönen kişiden değersizdir.


---

## 4A. OPERATÖR KÜMESİ VE KAPANIŞ — "sınırsız"ı iddia değil, ölçü yapan şey

`primitives-v1.json` bugün yedi op sayıyor: `suppress · gather · flare · extend ·
split · overlay · attach`. Bu küme **kapalı değil** — klasik kalıp hazırlamanın
temel işlemlerinden bir kısmı yok. Eksikler isim isim:

| Op | Ne yapar | Onsuz ne çıkmaz |
|---|---|---|
| **rotate** (pens transferi / pivot) | Bir pensi apeks etrafında başka bir kenara taşır | Göğüs pensi yan dikişe / kol oyuğuna / omuza gitmez. Klasik kalıpçılığın **ana** işlemi. |
| **slash-spread** | Paneli bir hat boyunca kesip açar/kapatır | Balon, kloş, pilili, godeli her şey; `flare` ve `gather` bunun özel hâlleri |
| **pleat** (knife / box / inverted) | Ayrık, yönlü kat — uzunluğu korur | Pili. `gather` sürekli büzgüdür, pili değildir. |
| **fold** (katlanarak dönen uzatma) | Kenarı geri katlar, kumaş yönü ters döner | Manşet, apolet, patlet, katlamalı etek ucu |
| **merge** (split'in tersi) | İki komşu paneli tek panele indirir | **En az parça** garantisi. Kural değil, işlem olmalı. |
| **derive** (astar / tela / pervaz) | Bir panel bölgesinden türev panel üretir | Buğra'nın **Collar Lining**'i; tela ve pervazın tamamı |
| **asymmetry** | Sol/sağ simetri varsayımını kırar | Tek omuz, çapraz kruvaze, tek taraflı volan |
| **ease-region** | Bölgesel pozitif/negatif pay | Kumaşa göre yalnız göğüste daralan kalıp |

**rotate + slash-spread + merge** üçlüsü tesadüfi değil: klasik kalıpçılıkta bir
temel kalıptan (blok) bütün beden varyasyonlarına ulaşmanın yolu tam olarak
budur. Bu üçü olmadan "sınırsız" kelimesi kullanılamaz; bu üçü varken
kombinatorik olarak sınırsızdır ve bu bir temenni değil, kapalılık özelliğidir.

### Kapanış testi — sınırsızlık nasıl ÖLÇÜLÜR

İddia edilmez, koşulur:

1. N adet **gerçek, yayınlanmış kalıp** alınır (Buğra'nın ikisi + açık kaynak
   kalıplar + kullanıcı fotoğraflarından çıkan giysiler).
2. Her biri **operatör programı** olarak yazılmaya çalışılır.
3. Yazılamayan her giysi, **eksik olan operatörün adını verir**. Çıktı bir
   şikâyet değil, bir kuyruk: "asymmetry yok" · "pleat yok".
4. O operatör eklenir, test tekrar koşar.

**Sınırsızlık = bu kuyruğun boşalması.** Kuyruk boşaldığında "sınırsız" artık
pazarlama cümlesi değil, koşulmuş bir testtir.

**Hedef koşusuna yeni sayı — H8: İFADE EDİLEMEYEN.** N giysiden kaçı operatör
programına çevrilemedi. Cırcıra dahil: kötüleşemez. F5 bu sayıyı düşürür.

**Bir isim ancak operatör bileşimine çözüldüğünde silinir.** `cupseam.cpp`
silinmez — `split + rotate + derive` bileşimine çevrilir, aynı kalıbı ürettiği
bayt bayt gösterilir, sonra silinir. Çözülemeyen isim **kalır ve kuyruğa yazılır**;
sessizce yok olmaz.

---

## 4B. EDGE CASE TABLOSU — davranış kararı verilmiştir, ajan seçmez

Sekizinin de davranışı burada yazılı. `⌕` işaretli olanlar **araştırılacak,
uydurulmayacak** — sayıyı/tabloyu ajan kendi kafasından koymaz.

**1. Arka görünmüyor** (fotoğrafların çoğu). Arka fotoğraf varsa ondan tasarla.
Yoksa iste; verilmezse **çıkar**, `çıkarıldı` işaretle, kullanıcıya söyle.
Çıkarım **kural tablosundan** yapılır, LLM serbestliğiyle değil (§0B md.1).
`⌕ ARAŞTIRILACAK:` ön siluetten arka konstrüksiyonu çıkaran terzilik kuralları
(ön kapalı + oturmuş → arka düz; orta arka kapanma; ön A-line → arka A-line).
Tablo bu dokümana yazılacak, koda oradan geçecek.

**2. Kapanma yeri görünmüyor.** Bu çıkarım DEĞİL, **dikilebilirlik zorunluluğu**:
ön ölçüsü baş çevresinden geçmiyorsa kapanma olmak zorundadır. `zorunlu`
etiketiyle konur, **sorulmaz**. Görünmüyorsa orta arka. Kumaş yeterince
esnekse kapanma gerekmeyebilir; o zaman esneklik payı kalıba yazılır.
**Repoda `wearability.cpp` var ve bu işi zaten yapıyor** — fermuar/patlet/bağ/
arka açıklık yollarını sayıyor, bardot'un esneyerek geçmesini biliyor
(`:76-104`), ve kararı "baş geçer mi" tahminine değil kapanma varlığına
bağlıyor (`:125-128`). **F0'ın işi yeniden yazmak değil, bu kararı provenance
etiketiyle dışa vurmak.**

**3. Düşük kontrast (siyah kumaş).** Eksik olan alan değil **güven**. "Princess
göremedim" ile "princess yok" ayrı şeydir. Eşiğin altında iç dikiş çizgileri
`belirsiz` işaretlenir ve **en sade yorum (pens)** seçilir. Princess
uydurulmaz — yanlış tarafa düşmenin bedeli asimetriktir: princess 9 parça,
pens 5 parça. `⌕ ARAŞTIRILACAK:` kontrast eşiği hangi sayı, hangi ölçüyle.

**4. Yoğun desen.** Aynı sınıf, farklı kök: desen dikiş çizgisini yutar; üstelik
desen **kendisi** dikiş sanılabilir (çizgili kumaş → sahte princess). Desen
yoğunluğu tespit edilirse **iç çizgi tespiti devre dışı**, sade yoruma düş,
`belirsiz` işaretle.

**5. Hareket (rüzgâr, yürüyüş).** Etek ucu/kol asimetrikse hareket vardır.
Asimetri tespit edilirse **simetrik yoruma zorla**, `çıkarıldı` işaretle.
Asimetrik kesim gerçekten isteniyorsa **prompt'tan** gelmeli, fotoğraftan
değil.

**6. Kırpılmış foto (etek ucu yok).** Uzunluk **çıkarılmaz, sorulur.** Sebebi
para: diz üstü mü maxi mi kumaş metrajını ve fiyatı değiştirir. Sorulacak alan
listesi **kısa** tutulur — yalnız **uzunluk ve beden**. Cevap `soruldu`
etiketini alır.

**7. Reddetme.** Oturan/yan duran kişi, birden fazla kişi, aşırı düşük
çözünürlük, giysi olmayan görsel → bu çıkarım değil **red**: *"bu fotoğraftan
kalıp çıkaramam, tam boy ayakta fotoğraf yükle."* **Reddetme kapasitesi olmayan
ürün kötü çıktıyı müşteriye yıkar.** Reddedilecek fotoğraf listesi F0'da
dokümana yazılır ve testi olur.

**8. Prompt ↔ fotoğraf çelişkisi.** "Kolsuz yap" ama fotoğrafta kol var.
**Prompt kazanır** — niyet beyanıdır — ama `soruldu` etiketiyle bildirilir:
*"fotoğrafta kol vardı, senin isteğinle kaldırıldı."* Prompt boşsa fotoğraf
tek kaynaktır. Prompt Türkçeyse çevrilir. Prompt sözlükte olmayan bir şey
isterse `outOfVocab`'a düşer ve **sicile yazılır** (bugün 26/26 sicilsiz) —
sessizce yutulmaz.

---

## 4C. AÇIK KALAN ÜRÜN KARARLARI — koşmadan önce kapanacak

Bu bölüm dokümanı son kez maddelerine karşı okuyunca çıkan boşluklar. Hepsi
karara bağlandı; biri **çelişki** olduğu için açıkça isimlendirildi.

**1. ÇELİŞKİ — "ücretsiz açık kaynak" ile "flat satılacak" aynı cümlede duramaz.**
§0 ücretsizliği rakiplerin kopyalayamayacağı hendek sayıyor; senin madde 1'in
"hem flat satılacak hem giysi satılacak" diyor. İkisi olduğu gibi çelişir ve
lansmanda patlar. **Kararı sen vereceksin, ama önerim şu ayrım:**
- **Motor + tarayıcıdaki çıktı (kendi fotoğrafın için 1 kalıp + flat + rehber):
  ücretsiz.** Hendek bu.
- **Para şunlardan gelir:** (a) fiziksel giysi (model B), (b) **ticari kullanım
  lisansı** — çıktıyı satarak üretecek marka/atölye için, (c) hazır koleksiyon
  paketleri (10 kalıp, serilenmiş, tech-pack hâlinde), (d) API.
Yani ücretsiz olan **araç**, satılan **ölçek ve hazır iş**. FreeSewing bağış
modelinden farkı bu ve daha sağlam.

**2. Kalıp kimin bedenine çizilecek?** Bugün `create.js:20,130` **standart EU38
demo bedenini** kullanıyor ve yorum açıkça "kullanıcının kendi ölçüsünü
izlemez" diyor. Ölçü ekranı ve profil kaydı (`loadProfiles/saveProfile`) var
ama hattın ucuna bağlı değil. **Karar: kişiye özel kalıp birinci sınıf yoldur.**
Kullanıcı ölçü girmediyse EU38'e çizilir ve **`çıkarıldı` etiketiyle söylenir**
("kendi ölçünü girmedin, EU38 standardına çizildi"). Bu, rakiplerin
vermediği şeydir ve motor zaten `body` alıyor — bağlanması F0/F3 işi.

**3. Beden aralığı ve serileme.** Repo EU34–48 satıyor ve `gradeJSON` var, ama
dokümanda hangi bedenlerin indirileceği hiç yazmıyor. **Karar: PDF katmanlı
çıkar, kullanıcı beden katmanını Adobe Reader'da açıp kapatır** (Etsy alıcı
beklentisi budur). §1C'de "eksik olan tek şey katmanlı beden seçimi" diye
ölçülmüştü — **sahibi F8'dir**, orada kapanır.

**4. Kullanıcının kalıbı kaybolmasın.** Bugün sonuç yenilenince gider.
**Karar: üyelik F9'a kadar YOK; onun yerine her sonuca kalıcı bir link**
(spec'in hash'i → paylaşılabilir URL). Kullanıcı linki saklar, geri döner,
paylaşır. Üyelik/forum (madde 10) bu linkin üstüne sonra kurulur; bugün
kurulursa ana zincirden enerji çalar.

**5. Gizlilik — bu bir hukuk maddesi, sonraya kalmaz.** Kullanıcı **insan
fotoğrafı** yüklüyor ve fotoğraf üçüncü taraf API'ye gidiyor. **Karar:
görselin kendisi saklanmaz.** Saklanan yalnız `sha256(görsel)` + çözümlenmiş
`seen` JSON'u (önbellek için). Yükleme kutusunun altında tek satır: *"fotoğrafın
saklanmıyor; analiz için gönderilip atılıyor"*, ve `privacy.html` bu cümleyle
uyumlu hâle getirilir. Hash önbelleği bu kararla **uyumlu** olacak şekilde
kurulur (görsel değil, hash anahtar).

**6. Örnek fotoğrafların ve ölçüm setinin hakları.** Landing'deki üç örnek
fotoğraf ve 29'luk ölçüm seti **nereden geldiği yazılı** olacak. İnternetten
alınmış bir fotoğraf landing'de yayınlanamaz. **Karar: landing örnekleri
hakkı temiz olacak** — künyesi (kaynak · yazar · lisans) yazılabilen görseller;
künyesi çıkarılamayan landing'e çıkmaz. Ölçüm
seti yalnız yerelde kalır, repoya girmez.

**7. Telifli kalıplar hukuken temizlenir.** `patterns_real/` 65MB ve **hâlâ
git'te izleniyor** (`contract_check` kırmızı). Buğra'nın satın alınmış
kalıpları özel kör kontrol için kullanılabilir ama **repoda durmaz, dağıtılmaz,
çıktıya sızmaz.** F1'in işi.

**8. Süre bütçesi — H11.** Dokümanda hiçbir yerde "ne kadar sürecek" yazmıyor;
F3'ün yüzey hattı 30 saniye sürerse bunu lansmanda öğreniriz. **Hedef
koşusuna H11 eklenir: fotoğraftan sonuç ekranına kadar geçen süre (medyan ve
en kötü).** Hedef: analiz + çizim toplam **10 saniye altı**, kumaş değişimi
**1 saniye altı** (VLM'e gitmediği için, §F0 md.9). Cırcıra dahil, kötüleşemez.

**9. Motor çökerse.** wasm istisna atarsa bugün kullanıcı boş ekran görür.
**Karar: motor hatası da `zorunlu` bir mesajdır** — "bu giysiyi çizemedim,
şu alan çözülemedi" + elle seçim yolu. Sessiz boş ekran yasaktır (yasak 8'in
uzantısı).

---

## 5. YASAKLAR

1. **Envanter fazı yok.** Ölçüm fazın ilk 15 dakikasıdır. Çıktısı "X'i ölçtük"
   olan kart reddedilir; her ölçüm bir onarıma bağlanır (F2 örneği).
2. **Docs/landing fazı yok.** Bir faz neyi değiştirdiyse kendi metnini düzeltir.
3. **İki motor bırakılmaz.** F3'ten sonra bir sınıf yüzey hattındaysa, eski hat
   o sınıf için **silinir** — "yedek" diye durmaz.
4. **Buğra'ya ayar yapılmaz.** Buğra ölçüdür, hedef değil.
5. **Sebepsiz dikiş eklenmez** (F5'in dört sebebi dışında).
6. **Flat ile kalıp eşit sayı vermez** — aynı plandan, iki bedende (§2).
7. **Faz kartı 30 satırı geçmez.** Sayı test çıktısında yaşar, docs'ta değil.
8. **Branch açılmaz.** Main'de çalışılır, etiketle geri alınır (§3.5).
9. **Hedef koşusunun altı sayısından biri kötüleşirse faz kapanmaz** (§3.6).
10. **Onaylanmamış çıktı sevk edilmez.**
11. **Kapı tanımı ve fotoğraf seti faz ajanı tarafından değiştirilemez** (§3.8).
12. **H1 10/10 olmadan pazarlama başlamaz** (F9).
13. **Basitleştirilmiş çözüm kabul edilmez.** Kolay tutma girişimi bu projeyi
    iki ay geciktirdi. Zor olan doğru olandır. Bir faz ajanı kapsamı daraltarak
    kapı geçmeye çalışırsa hakem reddeder.
14. **Görünen alan `çıkarıldı` işaretlenemez** (§0B reward hacking kapısı).
15. **Piksel seviyesinde üretim yasak** — çıkarım spec seviyesindedir (§0B). Damla görmediği bir flat/kalıp siteye
   çıkmaz (madde 13).

---

## 6. AÇILIŞ — DAMLA BUNU BİR KEZ YAPIŞTIRIR

### 6.1 Şef bloğu (tek sefer)

> Sen ŞEF'sin — stitchu KOŞU v7'nin orkestratörü.
>
> **Oku:** yalnız `KOSU-v7.md` §3 ve `GECE7/DURUM.md` (yoksa oluştur).
> Başka hiçbir bölüm okuma.
>
> **Yasakların:** kod okuma · komut koşturma · dosya tarama · bu dokümanın faz
> bölümlerini okuma · alt-ajan çıktısını okuma · kendi hükmünü kendin verme.
> **Halka 0 dahil bütün iş alt-ajana gider.**
>
> **Döngün (§3.3):** `DURUM.md` oku → `git tag F<n>-oncesi` → faz ajanını sal
> (ona yalnız **yolları** ver) → ajan ölsün → hakemi sal → hakemin
> `DURUM.md`'ye yazdığı **tek satır** hükmü oku → GEÇTİ/KALDI/GERİ AL'a göre
> davran → sıradaki faz. F9 kapanana kadar durma.
>
> **Sıra:** §4'teki halka tablosu. Halka 0 (ısınma) → Halka 1 (F-İNDİR → F0 →
> F2) → Halka 2 (F3 ⇄ F5 iç içe) → Halka 3 (F4 → F6 → F7 → F8 → F9).
> **F3B koşulmayacak.**
>
> **Damla'ya hiçbir şey sorma, Damla'yı hiç anma.** Karar gerektiren her nokta
> hakeme gider (§3.4); hakem karar verir, koşu devam eder.

### 6.2 Şefin faz ajanına vereceği blok

> Sen F<n> ajanısın. **Oku:** `ENV.md` · `RULES.md` · `KOSU-v7.md`'nin §0, §0B,
> §1C, §1D, §3.5, §3.6, §3.8, §3.11, §4B, §4C bölümleri · ve **yalnız F<n>
> bölümü**. Başka bölüm, başka rapor, başka koşu dosyası okuma.
> **§1C'yi atlama** — orada yazan işler ZATEN YAPILMIŞ; yeniden yazarsan saat
> yakarsın ve hakem reddeder.
> Main'de çalış, branch açma. Kapı sayını **ölçmeden** kart yazma.
> Kartını `GECE7/F<n>.md`'ye 30 satırı geçmeden yaz, push et, **dur ve öl**.
> Sonraki fazı açma, kendi hükmünü kendin verme. Uzun özet döndürme —
> şef seni okumayacak, kartını hakem okuyacak.
> [şef buraya hakemin bir önceki fazdan bıraktığı notu ekler]

### 6.3 Şefin hakeme vereceği blok

> Sen HAKEM'sin. Bu koşuda hiçbir iş yapmadın ve yapmayacaksın. Faz ajanının ne
> düşündüğünü bilmiyorsun ve öğrenmeyeceksin.
>
> **Oku:** `GECE7/F<n>.md` kartı · `KOSU-v7.md` §3.6 ve §3.8 · F<n>'in kapı
> satırı. Kartaki "kapandı/geçti" cümlelerine **inanma** — kapı komutlarını
> **kendin koştur**. Ajanın hiç görmediği yedek fotoğrafları da koştur (§3.8).
> İddiadan şüphelenirsen kaynağı kendin ara (§3.10); künye ölü linkse veya
> kaynak o sayıyı söylemiyorsa kartı reddet.
>
> **Hükmünü `GECE7/DURUM.md`'ye TEK SATIR yaz:** `GEÇTİ` / `KALDI` / `GERİ AL`
> + sıradaki faza not. Ayrıntıyı `GECE7/F<n>-R.md`'ye yaz; şef onu okumayacak.
> Ölçemediğine "ölçemedim" de.

### 6.4 Damla'nın işi

**Yok.** Damla §6.1'deki bloğu bir kez yapıştırır ve koşudan çıkar. Kart
taşımaz, soru cevaplamaz, dosyaya yazmaz. Karar gerektiren her nokta hakeme
gider (§3.4). Damla isterse `GECE7/KARARLAR.md`'ye bakıp sonradan itiraz eder;
koşu onu beklemez.
