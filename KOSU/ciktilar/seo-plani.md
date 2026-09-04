# stitchu — SEO PLANI (programatik)

> Tarih: 2026-09-04. Bu dosya bir **plan**dır, kod değil. Hiçbir mevcut dosya
> değiştirilmedi.
>
> **Tek yasa:** landing'de geçerli olan kural burada da geçerli — *elle yazılmış
> sayı = 0*. Bir SEO sayfası, motorun o sayfa için gerçekten koştuğu bir
> `draft()` çıktısı taşımıyorsa o sayfa **yapılmaz**. Bu estetik bir tercih
> değil; §5'te Google'ın kendi metniyle gösterildiği gibi, cezanın kendisi
> tam olarak burada başlıyor.

---

## 0. KARAR ÖZETİ — "agresif" ne demek, ne demek değil?

Damla "agresif programatik SEO" dedi. Ölçtüm, motorun bugünkü dürüst yüzeyi
**~250 sayfa** taşıyor, 50.000 değil. Bunu bir eksiklik olarak değil, **plan
olarak** yazıyorum, çünkü:

- Google'ın *scaled content abuse* politikası birebir şunu diyor: "many pages
  are generated for the primary purpose of manipulating search rankings and not
  helping users … large amounts of unoriginal content that provides little to no
  value to users, **no matter how it's created**"
  (https://developers.google.com/search/docs/essentials/spam-policies — bu
  cümleyi kaynaktan doğrudan çektim, ikinci elden değil).
- Sektörde işleyen programatik SEO'nun sayfa sayısı da zaten bu bantta:
  hemandthimble.com'un **37 URL**'i "seam allowance calculator" SERP'inde ilk
  sayfada (https://www.hemandthimble.com/sitemap.xml). FreeSewing'in ~1.847
  URL'i 10 yıllık domainle 565k aylık ziyaret alıyor
  (https://www.similarweb.com/website/freesewing.org/competitors/).
- Bizim ayırt edici varlığımız sayfa **sayısı** değil, sayfa **içeriği**:
  deterministik motor her sayfada indirilebilir bir kalıp/flat basabiliyor.
  Zapier/Wise/Nomad List'in Mart 2024 dalgasından sağ çıkma sebebi tam buydu —
  her sayfada kopyalanamaz, gerçek veri.

**Karar:** 250 gerçek sayfa > 25.000 şablon sayfa. Ölçek isteniyorsa
büyütme yolu §4.8'de (kullanıcı gönderimi galeri) — ama o, platform katmanı
(hesap + gardırop) kurulduktan sonra.

---

## 1. ZEMİN — motorun gerçekten üretebildiği yüzey (repo ölçümü, 2026-09-04)

Bu bölümdeki her sayı bu oturumda repodan okundu, tahmin yok.

| Kaynak | İçerik | Sayı |
|---|---|---|
| `web/js/vocab.gen.js` VOCAB | tasarım ekseni | **28 eksen** |
| `contract/layers/shape-ratios.json` | beden | **8** (EU34…EU48) |
| `web/js/fabric-catalog.js` | kumaş | **5** (viscose-crepe, cotton-modal-jersey, viscose-challis, cotton-lawn, cotton-velveteen) |
| `contract/terms.json` | dikiş terimi | **52** — 24'ü `drawable`, 28'i `honest` (çizilemez) |
| `contract/primitives-v1.json` | isimli kompozisyon | **6** (K1, K3, K4, K6, K7, K8) |
| `contract/guide-sources.json` | kaynaklı rehber referansı | ISO 4916/4915, Coats, UNL knits … |
| `web/**.html` | bugün canlı sayfa | **16** (sitemap'te 15, +404) |

Kritik eksen değerleri (`vocab.gen.js`, birebir):

```
garment(3) skirt, dress, top
skirtStyle(6) aLine, straight, gathered, halfCircle, pleated, gore
topLength(3) cropped, hip, tunic
skirtLength(3) mini, midi, maxi
neckline(9) crew, scoop, vNeck, square, boat, sweetheart, halter, cowl, pussyBow
sleeveStyle(3) none, straight, balloon      sleeveCap(4) plain, gathered, puffed, cap
collarType(7) none, stand, mock, flat, peterPan, shirt, crescent
fabric(2) woven, knit                        pocketStyle(4), peplum(4), backOpening(5) …
```

Motorun sayfa başına **ücretsiz** verebildiği gerçek çıktılar (hepsi
`gen-landing-motor.mjs`'in bugün kullandığı yollar):

- `patternSVG(d.pattern)` — kalıp önizlemesi (indirme düğmesinin bastığı bayt)
- `renderFlatFromPattern(d, …)` — teknik flat SVG (satılan ürünün kalemi)
- `kesim(d).length` — kesilecek parça sayısı
- `d.pattern.fabricMeters140` — 140 cm ende kumaş metresi
- `(d.pattern.guideSteps||[]).length` + adımların kendisi — inşa sırası
- `roleArcMM(kol,'sleeve_cap')` deseni — herhangi bir kenarın mm cinsinden yayı
- `pieceBytes()` bayt kıyası — "bu değişiklik kaç paneli oynattı"

⚠ **Yüzey hattı ≠ web motoru.** `contract/garment-spec-v2.json` sicilinde
`sleeve` ve `collarFamily` **`absent`**, `shoulderSeam` **`flagged`**. Web'de
sevk edilen wasm motoru (`engine/dist/`) kol ve yaka basıyor
(`gen-landing-motor.mjs` üç kol geometrisi çiziyor). Bu çelişki repoda
`_serh.V7-F` altında **kapsam kayması** diye karara bağlanmış. SEO açısından
sonuç: **sicile değil, `draft()`'ın o kombinasyonda `error` dönüp dönmediğine
bak.** Üretecin ilk kapısı bu (§4.0).

---

## 2. ANAHTAR KELİME ARAŞTIRMASI

### 2.0 Veri kalitesi uyarısı — ÖNCE BUNU OKU

Aşağıdaki İngilizce hacim/zorluk tablosunun neredeyse tamamı **tek kaynaktan**:
rankhero.com. Kendim doğruladım:

- rankhero.com kendini "**Etsy** SEO tool" diye tanımlıyor
  (https://www.rankhero.com/ — "Your Etsy work deserves to be discovered").
- Hacmin kaynağı sayfada **yazmıyor** (doğrudan fetch ettim, açıklama yok).
  Pazarlama metinlerinde bir yerde "web-search behaviour", başka yerde "how many
  times the keyword is searched on Google per month" deniyor
  (https://www.rankhero.com/tools/etsy/tag-generator). Kendi içinde tutarsız.
- "Listing sayısı" kesinlikle Etsy'dir; "difficulty" büyük olasılıkla Etsy
  rekabetidir, Google KD'si değildir.

**Hüküm: bu sayılar YÖN gösterir, MİKTAR göstermez.** Bir sunumda/pitch'te
"aylık 74.000 arama" cümlesini bu kaynağa dayanarak kurma. Gerçek Google
hacmi için tek doğrulanabilir yol Google Search Console'un kendi
`Performance → Queries` verisidir — ve o veri ancak sayfalar yayına girip
gösterim almaya başlayınca oluşur. Yani **hacim doğrulaması ilk 90 günün
çıktısıdır, girdisi değil** (§8).

### 2.1 İngilizce — kümeler

Kaynak: rankhero.com/keywords/<terim> (yukarıdaki uyarıyla).

| Terim | Aylık (iddia) | Zorluk (iddia) | Etsy listing | Not |
|---|---|---|---|---|
| sewing pattern | 74.000 | 56 | 3.642.829 | Baş terim, girilemez |
| free sewing pattern | 60.500 | **7** | — | Yüksek hacim + düşük zorluk; **ama ticari değeri düşük** |
| skirt sewing pattern | 12.100 | 50 | 123.008 | Stabil |
| pants sewing pattern | 12.100 | 48 | 92.911 | Düşüşte (−18%) |
| dress sewing pattern | 9.900 | 55 | 267.206 | **+49% trend** |
| shirt sewing pattern | 9.900 | 50 | 107.620 | Düşüşte (−18%) |
| easy sewing pattern | 9.900 | 58 | ~440.000 | Düşüşte (−33%) |
| **seam allowance** | 5.400 | **14** | 0 | Araç niyeti, ürün yok — **en açık kapı** |
| pdf sewing pattern | 3.600 | 64 | 1.128.248 | Kümenin en zoru, düşük hacim → **hedefleme** |
| crop top sewing pattern | 1.900 | 38 | 21.129 | — |
| **linen shirt pattern** | 1.000 | **24** | 1.858 | **+233% trend, en düşük rekabet** |
| jersey dress sewing pattern | 390 | 31 | 0 listing | Arama var, arz yok — boşluk |
| beginner sewing pattern | 320 | **72** | 224.122 | En kötü kombinasyon, **yapma** |
| pattern grading | — | — | 226 | Pratikte yok |

Ölçülemeyenler (**BULUNAMADI**, ücretsiz kaynakta veri yok): "AI sewing pattern
generator", "DXF sewing pattern", "made to measure sewing pattern",
"how to sew a {garment}", "size {N} {garment} pattern", "fabric yardage
calculator".

### 2.2 İngilizce — SERP gerçeği (kim sıralanıyor?)

Bu bölüm hacimden daha güvenilir, çünkü SERP'e doğrudan bakıldı.

| Sorgu | SERP'i tutan | Yeni domain girebilir mi? |
|---|---|---|
| `free sewing pattern` | AllFreeSewing (2009 kurulmuş, ~193k ziyaret/ay), SewCanShe, So Sew Easy (1.613 URL), Mood Sewciety (550+ desen) | **HAYIR** — 17 yıllık agregatör duvarı |
| `pdf sewing pattern dress` | Indie'ler: Megan Nielsen, Style Arc, Seamwork, Ellie&Mac, Sew House Seven. Big-4 (Simplicity/McCall's) yok | **EVET** — küçükler tutuyor |
| `AI sewing pattern generator` | #1 USPTO patent PDF, #2 arXiv makalesi, #3 style3d.ai blog. Gerçek ürün yok | **EVET — SERP sahipsiz** |
| `made to measure sewing pattern` | lekala.co, sewist.com — ikisi de 2000'ler arayüzü | **EVET** |
| `linen shirt sewing pattern` | Dağınık: fabrics-store, Seamwork, Mood, **Walmart** | **EVET — Walmart'ın çıkması rekabetin zayıflığıdır** |
| `jersey dress sewing pattern` | 2 Etsy listing + In The Folds, Sew Over It | **EVET** |
| `seam allowance calculator` | everydaytools.io, costumecalc.com, converterslab.com, foundthetool.com — **hepsi jenerik araç sitesi**; sektörden sadece hemandthimble (37 URL) | **EVET — en zayıf SERP** |
| `DXF sewing pattern` | B2B: Ergomodels, Minerva, TAAS Inc | EVET ama pazar küçük (ev dikişçisi değil) |

Kaynaklar: https://www.allfreesewing.com/ · https://sewcanshe.com/ ·
https://so-sew-easy.com/wp-sitemap-posts-post-1.xml ·
https://blog.moodfabrics.com/category/free-sewing-patterns/ ·
https://megannielsen.com/ · https://www.stylearc.com/ ·
https://www.style3d.ai/blog/ · https://www.lekala.co/ ·
https://www.sewist.com/ · https://hemandthimble.com/ ·
https://converterslab.com/seam-allowance-calculator/

### 2.3 Türkçe

**Doğrulanmış Google aylık arama hacmi: BULUNAMADI.** Google Trends TR sayfası
otomatik erişime 429 döndü. Aşağıdaki değerlendirme tamamen **arz tarafı**
sinyallerine dayanıyor — yani "birileri bu içeriği üretiyor ve para kazanıyor"
kanıtı, "kaç kişi arıyor" kanıtı değil.

Pazar var, ama küçük — ve şu kanıtlarla var:

- Ticari, ayakta duran satıcılar: **Occa Moda** PDF kalıpları **360–550₺**
  (https://occamoda.com/urun-kategori/pdf/ucretsiz-kalip/) · **Opia Patterns**
  (https://www.opiapatterns.com/ucretsizdesenler, ücretsiz kalıpların ilan
  edilen normal fiyatı 390₺) · Dikenbiri · Mimuu (~128 ücretsiz kalıp,
  https://mimuu.com/pratik-dikis-kaliplari/).
- Devlet müfredatı: MEGEP/MEB "Elbise Kalıbı", "Temel Kadın Beden Kalıpları"
  modülleri (https://www.megep.meb.gov.tr/) — terminoloji standart ve yaygın.
- Referans site: https://www.modelistlik.gen.tr/dikis_payi.html (dikiş payı
  standartları).

Terim kümeleri (hacim **DOĞRULANMADI**, sadece varlık kanıtlı):
`elbise kalıbı` · `etek kalıbı` · `bedava/ücretsiz dikiş kalıbı` ·
`penye elbise kalıbı` · `şalvar kalıbı` · `kendin dik` (kendindik.com var) ·
`kalıp çıkarma` · `dikiş payı` · `beden tablosu` (⚠ bu terim büyük oranda
e-ticaret markası trafiği, dikiş değil) · `X nasıl dikilir`.

**En keskin Türk nişi (TAHMİN, doğrulanmadı):** penye + tesettür kesişimi —
penye elbise / tunik / şalvar, geniş beden. Gerekçe: Pinterest ve Türk dikiş
blog arzının yoğunlaştığı yer burası, ve motorun `fabric=knit` +
`fabricStretchPct` yolu bu kumaşı zaten ölçülü işliyor. **Bunu bir iddia olarak
dışarı söyleme** — önce GSC'de TR sorgu verisi görülsün.

**Türkçe için dürüst hüküm:** TR mutlak trafik olarak İngilizce'nin çok altında
kalacak. TR'nin gerçek değeri SEO değil, **Damla'nın Instagram/LinkedIn kişisel
markasının indiği yer** olmasıdır — sosyalden gelen Türk kullanıcı Türkçe bir
sayfaya inmeli. Bu bir dönüşüm meselesi, trafik meselesi değil.

### 2.4 Long-tail kombinatorik — hangisi canlı, hangisi ölü?

| Şablon | Karar | Gerekçe |
|---|---|---|
| `{fabric} {garment} pattern` | **CANLI** | linen shirt +233%/KD24; jersey dress arama var listing yok |
| `{garment} sewing pattern` | **CANLI** | dress 9.900/+49%, skirt 12.100 |
| `how to sew a {garment}` | **CANLI ama bilgi niyeti** | Hacim doğrulanamadı; huni üstü olarak değerli, satış değil |
| `{size} {garment} pattern` | **ÖLÜ / DOĞRULANMADI** | Hiçbir ücretsiz kaynakta veri yok. **Beden başına sayfa AÇMA** (§4.7) |
| `free {garment} pattern` | **TİCARİ ÖLÜ** | 60.500 hacim ama bedava arayan ödemez; SERP'i 17 yıllık agregatörler tutuyor |
| `{garment} for beginners` | **ÖLÜ** | 320 hacim / 72 zorluk |
| `{term} sewing meaning` (sözlük) | **ZAYIF ama ucuz** | Bizde 24 terimin her biri gerçek çizim taşıyabiliyor → doorway değil |

---

## 3. RAKİP SEO ANALİZİ

### 3.1 Kim, nasıl trafik alıyor?

| Site | Yapı | Sayfa | Trafik kazandıran tip |
|---|---|---|---|
| **FreeSewing** (freesewing.eu) | `/designs/{ad}`, `/docs/designs/{ad}/instructions/`, `/showcase/{slug}`, `/showcase/tags/{ad}`, `/blog/`, `/newsletter/` | **~1.847 URL** (sitemap sayıldı): ~800 showcase, ~600 docs, ~90 design | Docs hiyerarşisi + UGC showcase. **Bizim en yakın analoğumuz** |
| **Seamwork** | `/sewing-tutorials/`, `/sewing-patterns/`, `/fabric-guides/`, `/sewing-project-ideas/` | ~1.180 makale (TAHMİN: 59 sayfa × 20) | Tutorial makaleler. Desenler üyelik duvarı arkasında ($16–21/ay) |
| **AllFreeSewing** | `/{Kategori}/{Baslik}` | 1.000+ (sitemap truncated) | Ücretsiz desen derlemeleri, reklam modeli. 2009 domain, ~193k/ay |
| **So Sew Easy** | `/{slug}/` + **ayrı `/downloads/{slug}/`** | 1.247 post + **366 download** | Ücretsiz desen + reklam |
| **Closet Core** (Deer&Doe'yu 2024'te satın aldı) | `/products/`, `/collections/`, blog **ayrı subdomain** | 464 ürün URL'i | Ürün + blog tutorial. ~207k/ay |
| **Helen's Closet** | `/products/{ad}` (bazıları `-free`) | **51 ürün** | Küçük katalog, marka trafiği |
| **Hem & Thimble** | `/{sey}-calculator/`, `/{sey}-guide/` | **37 URL** (19 hesaplayıcı + 15 rehber) | **Hesaplayıcılar.** Amazon affiliate |
| **Mood Sewciety** | `blog.moodfabrics.com/category/free-sewing-patterns/` | 550+ ücretsiz desen (TAHMİN) | Desen bedava → kumaş satılıyor. Content-to-commerce |
| **StitchLift** (bizim doğrudan rakibimiz) | `/ai-sewing-pattern-generator`, `/free-sewing-patterns`, `/category/clothing`, `/blog/{slug}` | BULUNAMADI | Anahtar-kelime blogu + araç landing. **$34/ay Creator, $49/ay Studio**, ücretsiz katman: ömür boyu 20 kalıp / ay 2 yeni |
| **Lekala** | — | Sitemap 404; robots.txt **Googlebot'u bile kısıtlıyor** | SEO'yu terk etmiş |
| **Sewist** | `?id=` sorgu parametreli URL'ler | BULUNAMADI (403) | SEO'ya elverişsiz yapı |

Kaynaklar: https://freesewing.eu/sitemap.xml ·
https://www.seamwork.com/robots.txt ·
https://help.seamwork.com/hc/en-us/articles/35390792482963 ·
https://www.allfreesewing.com/www.allfreesewing.com.xml ·
https://www.easycounter.com/report/allfreesewing.com ·
https://so-sew-easy.com/wp-sitemap-posts-download-1.xml ·
https://closetcorepatterns.com/sitemap.xml ·
https://helensclosetpatterns.com/sitemap_products_1.xml ·
https://www.hemandthimble.com/sitemap.xml · https://stitchlift.com/pricing ·
https://blog.closetcorepatterns.com/welcome-deer-and-doe-to-the-closet-core-family/

### 3.2 Yapısal veri — rakipler ne kullanıyor?

- Closet Core ürün sayfası (`/products/bombshell-swimsuit-pattern`) JSON-LD:
  **Product, Offer, AggregateRating, Review, Organization**.
  **BreadcrumbList / HowTo / FAQPage YOK.**
- Shopify'daki tüm indie'ler (Helen's Closet, Tilly, Megan Nielsen, Sew Over It)
  aynı Shopify şablonu → aynı şema kümesi.
- FreeSewing docs'ta BreadcrumbList yapısı var (4 seviye).

**Bizim avantajımız:** Bugün `web/guide/*.html` zaten **BreadcrumbList + Article**
JSON-LD taşıyor (doğruladım, `web/guide/a-line-skirt.html` head'inde ikisi de
var). Rakiplerin çoğunda breadcrumb bile yok.

### 3.3 Zayıf noktalar — nereden girilir?

1. **Hesaplayıcı boşluğu.** Sektörde bu işi ciddiye alan tek site 37 URL'lik
   Hem & Thimble; kalanı jenerik "converter" siteleri. Bizim
   `d.pattern.fabricMeters140` çıktımız **gerçek bir motor hesabı** — jenerik
   sitelerin uydurduğu formül değil. En hızlı kazanılacak SERP burası.
2. **Shopify'ın blog zaafı.** Closet Core blog'u **ayrı subdomain**'de
   (blog.closetcorepatterns.com) → ana domain'e link gücü akmıyor. Bizde tek
   domain.
3. **FreeSewing'in %93.75 bounce rate'i** (Similarweb, Temmuz 2026) — insanlar
   geliyor, aracı kullanamıyor, çıkıyor. Sayfa/ziyaret 1.07. Yani ölçüm-tabanlı
   kalıp talebi var, UX yok.
4. **AI SERP'i sahipsiz.** "AI sewing pattern generator" sorgusunda #1 sonuç bir
   USPTO patent PDF'i. StitchLift bu terime yatırım yapıyor ama tek başına.
5. **Kimse "aynı kalıp, farklı kumaş" karşılaştırması yapmıyor.** Bizim motor
   bunu bedavaya üretiyor (`kumasFarki` bloğu zaten `gen-landing-motor.mjs`'de).

**Dezavantaj, dürüstçe:** AllFreeSewing 17, FreeSewing 10 yıllık. Domain
otoritesi sıfırdan başlıyor. `noseydewdrop.com` altında bir **subdomain**'iz
(stitchu.noseydewdrop.com) — ana domainin varsa bir otoritesi paylaşılıyor,
ama Google subdomain'i genelde ayrı site sayar. Bu **DOĞRULANMADI**; ölçmenin
tek yolu GSC'de ayrı property açmak.

---

## 4. PROGRAMATİK SAYFA AİLELERİ

### 4.0 Her aile için geçerli beş kural (üretecin kapıları)

1. **`draft()` reddederse sayfa yok.** `gen-landing-motor.mjs` bugün bunu
   yapıyor: `if (d.error) throw new Error(...)`. Üreteç aynı kapıyı kurar; bir
   kombinasyon çizilmiyorsa o URL **hiç doğmaz** (404 değil, yok).
2. **Sayfa başına en az bir indirilebilir gerçek çıktı**: `patternSVG` ya da
   `renderFlatFromPattern` — o koşuda üretilmiş bayt, arşivden değil.
3. **Sayfadaki her sayı `data-motor` üzerinden gelir.** Elle yazılmış sayı = 0.
   `vitrin_gercek_check` deseni bu ailelere de genişletilir.
4. **Yakın-kopya kapısı:** iki sayfa arasındaki *motor çıktısı* farkı ölçülür
   (`pieceBytes()` kıyası zaten var). Fark sıfırsa iki sayfa değil **tek sayfa
   + varyant tablosu** basılır. Bu kapı olmadan bu iş doorway'e döner.
5. **Sayfa metni kaynak veya ölçüm taşır** (§7). Kaynaksız süs cümlesi yasak.

### 4.1 F1 — Giysi × siluet × kumaş (ana aile)

- **URL:** `/patterns/{garment}-{silhouette}-{fabric}` — ör.
  `/patterns/dress-a-line-cotton-lawn`, `/patterns/skirt-half-circle-viscose-crepe`
- **Sayfa başına motor çıktısı:** EU38 flat SVG + kalıp önizleme SVG + parça
  sayısı + `fabricMeters140` + `guideSteps` sayısı + kesim planı özeti.
  Ayrıca **kumaş farkı bloğu**: aynı siluet dokuma vs örme → parça sayısı farkı
  (bu blok bugün `gen-landing-motor.mjs`'de zaten üretiliyor, taşınıyor).
- **Kaç sayfa:** dress × skirtStyle(6) × fabric(5) = 30 · skirt × skirtStyle(6)
  × fabric(5) = 30 · top × topLength(3) × fabric(5) = 15 → **75**
  (motorun reddettikleri düşülür; gerçek sayı ilk koşuda ölçülür).
- **Hedef arama:** `{fabric} {garment} pattern` — en canlı şablon
  (linen shirt +233%, jersey dress boşluğu).
- **İç link:** ↑ `/patterns/` hub · ↔ aynı siluetin diğer 4 kumaşı ·
  ↔ aynı kumaşın diğer siluetleri · → `/fabric/{fabric}` (F2) ·
  → `/guide/how-to-sew-{garment}-{silhouette}` (F4) · → `/create.html`.

### 4.2 F2 — Kumaş rehberi (5 sayfa, kaynaklı)

- **URL:** `/fabric/{fabric}` — 5 sayfa, katalogdaki 5 kumaş.
- **Motor çıktısı:** o kumaşla çizilmiş 3 giysi flat'i + her biri için metraj +
  parça sayısı. Ayrıca kataloğun ölçülü alanları (gsm, streç %, en cm) — bunlar
  `contract/fabric-catalog-v1.json`'da zaten sayı olarak duruyor.
- **Kaynak:** `contract/guide-sources.json` (ISO 4916/4915 dikiş sınıfları,
  UNL 4-inch stretch test). Kaynaksız kumaş tavsiyesi yazılmaz.
- **Neden az sayfa ama değerli:** Mood Fabrics'in tüm modeli bu (desen bedava →
  kumaş satılıyor). Bizde tersi: kumaş rehberi → kalıp satılıyor.

### 4.3 F3 — Dikiş terimi sözlüğü (24 sayfa + 1 hub)

- **URL:** `/glossary/{term-slug}` + `/glossary/` hub.
- **Kaynak:** `contract/terms.json` — 52 terim, **sadece `status:"drawable"`
  olan 24'ü sayfa alır.** Her drawable terimin bir `capability` alanı var
  (ör. `pocketStyle=patch`, `sleeveCap=puffed`, `hemShape=shirttail`).
- **Motor çıktısı — bu ailenin bütün meşruiyeti burada:** aynı taban giysi
  **iki kez** draft edilir, tek fark o terimin ekseni. Sayfa **önce/sonra flat**
  basar + `pieceBytes()` kıyasıyla "bu terim kaç paneli oynattı" sayısını verir.
  Bu, sözlük tanımı yazan hiçbir rakibin yapamadığı şey.
- **28 `honest` (çizilemez) terim sayfa ALMAZ** — hub'da tek satır olarak
  listelenir ("motor bunu bugün çizemiyor"). Bu dürüstlük aynı zamanda
  thin-content korumasıdır.

### 4.4 F4 — "X nasıl dikilir" rehberleri (~15 sayfa)

- **URL:** `/guide/how-to-sew-{garment}-{silhouette}` — mevcut `/guide/` ailesinin
  genişlemesi (bugün 6 sayfa var, aynı şablon, aynı JSON-LD).
- **Motor çıktısı:** `d.pattern.guideSteps` — inşa adımlarının **kendisi**
  (EU38 elbisede bugün **14 adım**), her adımın dokunduğu panel, kesim sırası.
- **Kaç sayfa:** 6 (dress siluet) + 6 (skirt) + 3 (top) = **15**. Kumaştan
  bağımsız → F1 ile çakışmaz.
- **Şema notu:** `HowTo` şeması **kullanılmaz** (§6.4 — Eylül 2023'te
  deprecated). `Article` + `BreadcrumbList` kullanılır; bugünkü guide sayfaları
  zaten öyle.

### 4.5 F5 — Hesaplayıcı / araç sayfaları (6 sayfa) — **EN YÜKSEK ÖNCELİK**

En zayıf SERP, en düşük zorluk (seam allowance KD 14), sektörde tek ciddi
rakip 37 URL'lik bir affiliate sitesi.

| URL | Ne hesaplar | Motor bağı |
|---|---|---|
| `/tools/fabric-yardage-calculator` | giysi + beden + kumaş eni → metre | `d.pattern.fabricMeters140` **gerçek nest çıktısı** |
| `/tools/seam-allowance-calculator` | pay + kenar tipi (içbükey/dışbükey) → ofset sonrası uzunluk | `offsetOutline` mantığı; repoda ölçülmüş: oyuk içbükey +34.9mm, kapak dışbükey −5.3mm |
| `/tools/ease-calculator` | vücut ölçüsü + giysi tipi → bitmiş ölçü | `contract/figure-bands.json garment_ease` (göğüs +60/bel +25/kalça +50mm, Threads RTW + Aldrich bandı, kaynaklı) |
| `/tools/size-finder` | 3 ölçü → EU34–48 önerisi | `contract/layers/size-table.json` |
| `/tools/print-pages-calculator` | kalıp + kâğıt → kaç A4 sayfa / A0 | printpack çıktısı |
| `/tools/pattern-grading-calculator` | beden → beden büyüme mm | Ölçülmüş grade sayıları (ön 0.4510 / arka 0.4390 cm/beden) |

⚠ Bu sayfalar **wasm yüklemeden** çalışmalı ya da wasm'i yalnız kullanıcı
düğmeye basınca yüklemeli (§6.5). Aksi halde 3.3 MB payload LCP'yi öldürür.

### 4.6 F6 — Kompozisyon galerisi (6 sayfa)

- **URL:** `/compositions/{K-adi}` — `contract/primitives-v1.json`'daki 6 isimli
  kompozisyon (K1-kruvaze-büzgülü-bel, K3-katmanlı-etek, K4-asimetrik-kapama-
  shirttail, K6-sürekli-ölçü, K7-raglan-manşet-fermuar, K8-düşük-omuz-kutu-
  pili-cep). Üçü bugün zaten landing'de basılıyor.
- **Motor çıktısı:** flat + parça sayısı + hangi eksenlerin birleştiği.
- **Hedef:** marka/keşif trafiği, uzun kuyruk stil aramaları. Az hacim,
  yüksek "bu ürün gerçek" kanıtı.

### 4.7 F7 — Beden sayfaları: **AÇMA** (karar, gerekçeli)

`{size} {garment} pattern` şablonu için hiçbir ücretsiz kaynakta arama verisi
**BULUNAMADI**, ve 8 beden × 75 stil = 600 sayfanın motor çıktısı birbirinin
ölçekli kopyası olur — bu tam olarak Google'ın *doorway abuse* tanımıdır
("pages … created to rank for specific, **similar** search queries").

Yerine: **her F1 sayfasında 8 bedenin gerçek tablosu.** Motor zaten 8 bedeni
çiziyor (`Logs/surface-2026-08-12/pack-EU*`); tablo bir sayfada durur, 8 sayfaya
bölünmez. Beden başına ayrı URL, ancak GSC'de gerçek `size 16 dress pattern`
tipi sorgular gösterim almaya başlarsa ve o zaman **sadece o bedenler için**
açılır. Veri gelmeden açılmaz.

### 4.8 F8 — Kullanıcı galerisi (ölçek yolu, **şimdi değil**)

FreeSewing'in 1.847 URL'inin ~800'ü kullanıcı gönderimi showcase. Programatik
ölçeği gerçekten büyüten tek dürüst yol bu: her gerçek dikim = benzersiz içerik
= kopyalanamaz. Ama önkoşulu **hesap + gardırop** (DEVIR §7.5 sırası: hesap →
gardırop → ödeme → SEO). SEO planı bunu bekler, zorlamaz.

### 4.9 Toplam ve iç link mimarisi

```
F1 giysi×siluet×kumaş   75
F3 sözlük (drawable)    24 + 1 hub
F4 nasıl dikilir        15
F6 kompozisyon           6
F5 araç                  6
F2 kumaş rehberi         5
hub sayfaları            ~5  (/patterns/, /glossary/, /tools/, /fabric/, /compositions/)
────────────────────────────
EN toplam              ~137
TR aynası (F1+F2+F4+F5) ~100
mevcut                   16
════════════════════════════
TOPLAM                 ~250
```

Link mimarisi — hub-and-spoke, her yaprak en az 3 iç link alır:

```
/                → hub'lar
/patterns/       → 75 yaprak · her yaprak: aynı siluetin 4 kumaşı +
                   aynı kumaşın 5 siluet + /fabric/X + /guide/Y + /create.html
/glossary/       → 24 yaprak · her yaprak: o terimi kullanan F1 sayfaları
/tools/          → 6 yaprak · her araç → ilgili F1 ailesi (araçtan ürüne)
/fabric/         → 5 yaprak · her kumaş → o kumaşın 15 F1 sayfası
/guide/          → 15 yaprak (mevcut 6 dahil)
```

**Yetim sayfa = 0** kuralı `site-health.mjs`'e yeni bir kapı olarak eklenir
(bugün ölü link'i kontrol ediyor, gelen-link sayısını kontrol etmiyor).

---

## 5. KIRMIZI ÇİZGİ — doorway tuzağı

### 5.1 Google'ın kendi metni (birincil kaynaktan doğrudan çekildi)

https://developers.google.com/search/docs/essentials/spam-policies

> **Doorway abuse** is when sites or pages are created to rank for specific,
> similar search queries. They lead users to intermediate pages that aren't as
> useful as the final destination.

> **Scaled content abuse** is when many pages are generated for the primary
> purpose of manipulating search rankings and not helping users. This abusive
> practice is typically focused on creating large amounts of unoriginal content
> that provides little to no value to users, **no matter how it's created**.

Google'ın *scaled content abuse* için verdiği örnekler (aynı sayfa):
1. Kullanıcıya değer katmayan çok sayıda sayfayı üretken yapay zekâ ile üretmek
2. Feed/arama sonuçlarını kazıyıp otomatik dönüşümle (eşanlamlılaştırma,
   çeviri, gizleme) çok sayfa üretmek
3. Farklı sayfalardan içerik dikip birleştirmek, değer katmadan
4. Ölçeği gizlemek için birden fazla site kurmak
5. Okura anlam ifade etmeyen ama anahtar kelime taşıyan çok sayfa üretmek

Bu politika **Mart 2024**'te eski "spammy automatically-generated content"in
yerini aldı; expired domain abuse ve site reputation abuse ile birlikte
(https://developers.google.com/search/blog/2024/03/core-update-spam-policies).

**Kritik ayrım:** politika üretim yöntemini değil değeri hedefliyor —
"no matter how it's created". Yani "AI yazdı = ceza" **yanlıştır**; "değersiz =
ceza" doğrudur (§7.2).

### 5.2 Cezalananlar ve sağ kalanlar

**Cezalanan (doğrulanmış):** HouseFresh — 9 Mart 2024'te günlük ~4.000 → ~200
trafik, %91 kayıp (https://housefresh.com/how-google-decimated-housefresh/).
Site gerçek ürün testi yapıyordu; düşüş algoritmik, manuel aksiyon değil.
Mart 2024 dalgasında yüzlerce site deindexlendi
(https://www.searchenginejournal.com/google-march-2024-update-6-insights-on-manual-actions/510502/).

**"42.000 şehir sayfası → manuel aksiyon → 8 ay kurtarma" vakası: DOĞRULANMADI**
— sadece SEO blogu kaynağı bulundu, birincil kaynak yok.

**Sağ kalan (ortak payda: kopyalanamaz + dinamik veri):**
- Zapier — her entegrasyon çiftine sayfa, ama her sayfada **gerçek tetikleyici/
  aksiyon verisi** (https://practicalprogrammatic.com/examples/zapier)
- Wise — her para birimi sayfasında **canlı kur**
- Nomad List — 1.000 şehir, günde birden çok kez güncellenen internet hızı/hava
- Zillow, TripAdvisor — kullanıcı yorumu + gerçek fiyat

### 5.3 Bizim kuralımız yeter mi?

**"Her sayfa gerçek bir motor çıktısı taşıyacak" ZORUNLU ama YETERLİ DEĞİL.**
Eksik olan dört şey:

1. **Çıktı gerçekten FARKLI olmalı.** `dress-a-line-cotton-lawn` ile
   `dress-a-line-viscose-challis` neredeyse aynı flat'i veriyorsa, "motor çıktısı
   var" savunması Google'ın "similar search queries" tanımını kurtarmaz.
   → **Kapı:** `pieceBytes()` farkı 0 ise sayfa basılmaz (§4.0 kural 4).
   Bu kapı repoda **zaten var** ve `gen-landing-motor.mjs`'in edit bloğunda
   kullanılıyor; SEO üretecine taşınacak.
2. **Sayfa kendi başına bir varış noktası olmalı.** Doorway tanımı "intermediate
   pages that aren't as useful as the final destination" diyor. Eğer sayfa
   sadece "kalıbı üretmek için tıkla" diyorsa **tam olarak doorway'dir**.
   → Sayfa; flat'i, parça listesini, metrajı, 8 bedenin tablosunu ve inşa
   adımlarını **sayfanın kendisinde** gösterecek. Tıklama gerekmeden.
3. **Bir şey bedava indirilebilmeli.** En azından flat SVG önizleme, ya da
   düşük çözünürlüklü kalıp. Aksi halde sayfa bir ödeme duvarının reklamıdır.
4. **Yetim sayfa olmamalı.** İç link almayan sayfa "sadece sitemap için
   üretilmiş" demektir ve Google bunu "Discovered - currently not indexed"e atar.

### 5.4 Kaç sayfa "çok"? Hangi hızda?

- **Google'ın resmi bir sayfa-sayısı eşiği YOK.** Bu konudaki tüm "500 sayfayla
  başla" tavsiyeleri practitioner folklorudur — **DOĞRULANMADI.**
- Google'ın **doğrulanmış** tek sayısal eşiği crawl budget içindir:
  1 milyon+ benzersiz sayfa (haftalık değişen) veya 10.000+ sayfa (günlük
  değişen) üstünde crawl budget önemlidir; altında Google kendi dokümanında
  "genelde sorun değil" diyor
  (https://developers.google.com/search/docs/crawling-indexing/large-site-managing-crawl-budget).
  **250 sayfa bu eşiklerin çok altında — crawl budget bizim sorunumuz değil.**
- **Bizim yayın planı (gerekçeli, Google eşiğinden değil risk yönetiminden):**

| Hafta | Yayına giren | Kapı: bir sonrakine geçmeden ne görülmeli? |
|---|---|---|
| 1 | F5 araçlar (6) + hub'lar | GSC'de indexlenme, "Crawled - not indexed" oranı |
| 2–3 | F2 kumaş (5) + F4 rehber (15) | ≥%70 indexlenme |
| 4–6 | F1 birinci parti (25) | ≥%60 indexlenme, ilk gösterimler |
| 7–9 | F1 kalan (50) | Aynı |
| 10–12 | F3 sözlük (24) + F6 (6) | Aynı |
| sonra | TR aynası (~100) | TR hreflang doğru mu, GSC TR sorgu var mı |

**Durdurma kuralı:** yayınlanan bir partinin **%40'ından fazlası** GSC'de
"Crawled — currently not indexed" ise **yeni parti çıkmaz.** Bu durum "Google o
sayfaya baktı ve indexlemeye değmez buldu" demektir — bir sonraki partiyi
basmak sorunu büyütür.

---

## 6. TEKNİK SEO

### 6.1 Sitemap ölçeklenmesi

- **Limit (doğrulanmış):** tek sitemap dosyası **50.000 URL / 50 MB
  sıkıştırılmamış**
  (https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).
  250 sayfada bu limitin yanına yaklaşmıyoruz. `gen-sitemap.mjs` bugünkü haliyle
  yeterli, sitemap index dosyasına **gerek yok**.
- **AMA — ölçülen gerçek bir kusur var, düzeltilmeden ölçek büyütülmemeli:**
  `gen-sitemap.mjs:78` `lastmod`'u **dosyanın mtime'ından** okuyor.
  `scripts/deploy.sh` ise her deploy'da `find web -exec perl -i -pe 's/\?v=[0-9]+/?v=N/g'`
  ile **her html/js/css dosyasına dokunuyor**. Sonuç: her deploy'da 250 sayfanın
  250'sinin mtime'ı bugüne kayar ve sitemap Google'a "250 sayfanın hepsi bugün
  değişti" der. 16 sayfada zararsız; 250'de bu bir **gürültü sinyali** ve boş
  yere recrawl talebidir.
  → **Düzeltme:** `lastmod` mtime'dan değil, sayfanın **içeriğinin** (motor
  çıktısı + metin) hash'inden türetilmeli; hash değişmediyse eski `lastmod`
  korunmalı. Küçük bir manifest dosyası yeter.
- **`?v` bump'ın kendisi de ölçeklenmiyor:** her deploy 250 dosyayı yeniden
  yazıyor → git ağacı her deploy'da tamamen değişiyor. Alternatif: `?v`'yi
  sadece **asset** (css/js) referanslarında tut, html'lere yazma.

### 6.2 site-health ölçeği

`site-health.mjs` A kapısı her html'in her local href/src'ini diske karşı
çözüyor. 250 sayfa × ~40 iç link = ~10.000 `existsSync` — hâlâ saniyeler
mertebesinde, **sorun değil**. Ama iki ekleme gerekli:
- **Yetim sayfa kapısı:** sitemap'teki her URL en az 1 iç link almalı (§4.9).
- **Yakın-kopya kapısı:** iki sayfanın motor çıktısı bayt-eş ise KIRMIZI.

### 6.3 Canonical + hreflang (TR/EN)

- Bugün her sayfa `rel=canonical` taşıyor (doğrulandı: `web/index.html`,
  `web/guide/*.html`). Üreteç bunu her yeni sayfada da basacak.
- **Bugün site %100 İngilizce** — `web/**.html` içinde `lang="tr"` taşıyan
  **sıfır** sayfa var (ölçtüm). DEVIR "Türkçe dikiş rehberi" diyor ama sevk
  edilen rehber sayfaları İngilizce. Bu bir çelişki, karara bağlanmalı.
- **Öneri:** `/tr/` alt dizini (subdomain değil, parametre değil).
  Her çift `<link rel="alternate" hreflang="en" …>` +
  `hreflang="tr"` + `hreflang="x-default"` (EN) taşır. Kural: hreflang
  **karşılıklı** olmak zorunda; tek yönlü hreflang Google tarafından yok
  sayılır. Bu da `site-health.mjs`'e bir kapı olur.
- ⚠ **TR sayfalar EN'in makine çevirisi OLMAYACAK.** Google'ın scaled content
  abuse örnek listesinde madde 2 birebir "translation" diyor. TR sayfa, TR
  kaynaklardan (MEGEP terminolojisi) ve motorun kendi sayılarından yazılır.

### 6.4 Yapılandırılmış veri — hangisi bize uyar?

| Şema | Karar | Gerekçe |
|---|---|---|
| **BreadcrumbList** | **KULLAN** — her sayfa | Aktif rich result; guide sayfalarında zaten var; rakiplerin çoğunda yok |
| **Product + Offer** | **KULLAN** — F1 sayfaları (satış açıldığında) | Aktif; Closet Core'un kullandığı tek güçlü şema |
| **Article** | **KULLAN** — F2/F4/F3 | Aktif; guide sayfalarında zaten var |
| **ImageObject** | KULLAN — flat SVG'ler için | — |
| **SoftwareApplication / WebApplication** | F5 araç sayfaları | Rich result vermez ama varlık tanımı doğru olur |
| **HowTo** | **KULLANMA** | Eylül 2023'te **deprecated**; mobilde Ağustos 2023'te kaldırıldı (https://developers.google.com/search/blog/2023/08/howto-faq-changes). Rich result üretmez |
| **FAQPage** | **KULLANMA** | Yalnız tanınmış devlet/sağlık siteleri için gösteriliyor; sıradan siteler için bitti |
| **AggregateRating / Review** | Gerçek yorum toplanmadan **KULLANMA** | Uydurma rating = spam politikası ihlali |

### 6.5 Core Web Vitals — **wasm burada kritik**

Güncel metrik seti (doğrulanmış): **LCP ≤2,5s · INP ≤200ms · CLS ≤0,1**.
INP, FID'in yerini **12 Mart 2024**'te aldı (https://web.dev/blog/inp-cwv-march-12).

**Ölçülen risk:** `engine/dist/stitchu-engine.js` **1.79 MB** +
`stitchu-worker.wasm` **1.55 MB** = **~3.3 MB**. Bu payload'ın bir SEO landing
sayfasında yüklenmesi LCP'yi ve INP'yi doğrudan öldürür.

**Kural (pazarlık yok):**
1. SEO sayfaları **statik SVG** basar — üretecin build zamanında yazdığı bayt
   (`gen-landing-motor.mjs` bunu `web/assets/motor/` altına zaten yapıyor).
   Sayfa açılırken wasm **yüklenmez**.
2. wasm yalnız kullanıcı "kendi ölçümle üret" / "düzenle" düğmesine basınca
   dinamik `import()` ile gelir.
3. SVG'ler inline değil `<img>`/`<object>` ile, `width`/`height` verilerek
   (CLS = 0), `loading="lazy"` (ilk görsel hariç).
4. Ölçüm **CrUX (gerçek kullanıcı)** ile yapılır; Lighthouse skoru sıralamayı
   etkilemez.
5. Dürüst not: CWV bir sıralama faktörüdür ama **küçük ağırlıklıdır** — John
   Mueller'in ifadesiyle "not giant factors in ranking"
   (https://developers.google.com/search/docs/appearance/core-web-vitals).
   Yani CWV'yi geçmek bizi yükseltmez; **batırmamak** için gerekli.

### 6.6 IndexNow — **Google desteklemiyor**

`scripts/deploy.sh:202-207` her deploy'da `indexnow-ping.mjs` çağırıyor, anahtar
`web/4e569976857d22c1b49706a6aa350d2f.txt`. Bu **Bing, Yandex, Seznam, Naver**
için çalışır. **Google IndexNow'u tüketmiyor** — 2021'de test ettiğini söyledi,
hiç benimsemedi. (Bunu Google'ın kendi resmî tek cümlelik açıklamasından
doğrulayamadım — **DOĞRULANMADI**, ama IndexNow'un kendi katılımcı listesinde
Google yok ve birden çok bağımsız 2026 kaynağı aynı şeyi söylüyor.)

Google tarafında kullanılabilecekler:
1. XML sitemap (var)
2. Google Search Console — sitemap gönderimi + URL Inspection
3. Indexing API — **bize uymaz**: yalnız `JobPosting` ve canlı yayın
   `BroadcastEvent` sayfaları için resmî olarak destekleniyor.

Ayrıca: IndexNow tek istekte gönderilen URL sayısında sınırlıdır; 250 URL'de
sorun yok, ama bu ping **her deploy'da bütün sitemap'i** gönderiyor. Ölçek
büyürse yalnız *değişen* URL'leri göndermeye çevrilmeli (bu da §6.1'deki
content-hash manifestinden bedavaya çıkar).

### 6.7 Barındırma

`web/vercel.json` yalnız `trailingSlash: false` taşıyor. Site **iki adresten**
yayında (Vercel + nosey-dewdrop.github.io, CLAUDE.md'de 17 Ağu'da ölçüldü:
GitHub Pages HTTP 200 dönüyor, ölü değil). **Bu bir duplicate content
riskidir** — 250 sayfa × 2 adres = 500 URL. Ya GitHub Pages kapatılmalı, ya
tüm sayfaların canonical'ı (zaten öyle) `stitchu.noseydewdrop.com`'a bakmalı
**ve** Pages tarafına `noindex` konmalı. Bugün canonical doğru yeri gösteriyor,
yani risk düşük; ama 250 sayfada bunu şansa bırakma.

---

## 7. İÇERİK ÜRETİMİ — sayfa metinleri nasıl doğar?

### 7.1 Üç katman (öneri)

**Katman A — MOTORDAN TÜREYEN CÜMLE (sayfanın gövdesi, %70).**
Şablon değil, **veri-koşullu** cümle. Örnek, hepsi gerçek alanlardan:

> "Bu kalıp EU38'de **{kesim(d).length}** kesim parçası veriyor:
> {parcaAdlari}. 140 cm ende **{fabricMeters140} m** kumaş istiyor.
> Aynı elbise örme kumaşta **{kumasFarki.parcaFarki}** parça az çıkıyor,
> çünkü {sebep motor çıktısından}. İnşa **{guideSteps.length}** adım."

Bu cümlelerin hiçbiri elle yazılmaz, hiçbiri sayfalar arası aynı olmaz, ve
`vitrin_gercek_check` deseniyle bayt bayt doğrulanır. **Sıfır maliyet, sıfır
halüsinasyon riski.** Rakiplerin hiçbirinde bu yok.

**Katman B — KAYNAKLI SABİT METİN (%20).**
Kumaş davranışı, dikiş sınıfı, ISO kodları. Kaynağı `contract/guide-sources.json`
(bugün 5 kaynak taşıyor: Coats/ISO 4916+4915, UNL knits stretch test vb.).
Kural repoda zaten yazılı: *"A sentence with no basis is not an advice, it is
filler"* ve `guide_completeness_check` bunu zorluyor. **Aynı kapı SEO
sayfalarına da uygulanır.**

**Katman C — İNSAN ELİYLE, SAYFA BAŞINA 1–2 CÜMLE (%10).**
Damla'nın kendi sesi: bu siluet kime yakışır, ne zaman batar. Bu kısım
kopyalanamaz ve E-E-A-T'nin "Experience" ayağıdır. 250 sayfa × 2 cümle = 500
cümle, tek oturumda yazılmaz — **parti parti**, §5.4 takvimiyle.

### 7.2 LLM kullanılsın mı?

**Google'ın politikası (doğrulanmış):** AI içeriği kendi başına cezalandırılmaz.
Spam politikası "no matter how it's created" diyor
(https://developers.google.com/search/docs/essentials/spam-policies) ve
Şubat 2023 blog yazısı aynı çizgide
(https://developers.google.com/search/blog/2023/02/google-search-and-ai-content).
Ama *scaled content abuse* örnek listesinin **1. maddesi** birebir "using
generative AI tools to generate numerous pages without user value" — yani
LLM ile 250 sayfa doldurmak politikanın **isimle andığı** davranıştır.

**Öneri: LLM'i metin üreticisi olarak KULLANMA.** Gerekçe üç katlı:
1. **Gereksiz.** Katman A zaten farklılık üretiyor ve o farklılık *gerçek*.
   LLM'in ekleyeceği şey süs cümlesidir, bilgi değil.
2. **Riskli.** LLM sayı uydurur; bu repo tam olarak "elle yazılmış sayı = 0"
   yasası üstüne kurulu. Bir LLM cümlesinin içine kaçan yanlış bir mm,
   `vitrin_gercek_check`'in bütün varlık sebebini siler.
3. **Maliyet zaten sorun değil** — 250 sayfa × ~600 token çıktı ≈ 150k token,
   yani birkaç dolar. Yani LLM'i eleyen şey maliyet değil, **kalite ve yasa**.

**LLM'in meşru kullanımı:** Katman C için Damla'nın ham notunu düzeltmek/
kısaltmak (üretmek değil), ve TR/EN başlık-meta varyantı önermek — ikisi de
insan onayından geçerek.

---

## 8. ÖLÇÜM

### 8.1 Araçlar

| Araç | Ne için | Not |
|---|---|---|
| **Google Search Console** | Tek gerçek kaynak: gösterim, tıklama, sorgu, ortalama pozisyon, **index coverage** | Zorunlu. `stitchu.noseydewdrop.com` için ayrı property aç (subdomain ayrı sayılır) |
| **Bing Webmaster Tools** | IndexNow zaten Bing'e ping atıyor; oradaki veri bedava | Ucuz kazanç |
| **Plausible** (GA4 değil) | Sayfa görüntüleme, dönüşüm hunisi | KVKK/GDPR açısından çerezsiz; Damla'nın "public standardı" kuralına uyar. GA4 çerez onayı gerektirir |
| Ahrefs/Semrush | **Gerek yok, ilk 90 günde para harcama** | Veri GSC'de zaten var |

### 8.2 Takip edilecek metrikler (öncelik sırasıyla)

1. **Index coverage oranı** (GSC): yayınlanan / indexlenen. §5.4'ün durdurma
   kuralı buna bağlı. En önemli metrik, trafikten önce gelir.
2. **"Crawled — currently not indexed" sayısı.** Google sayfaya baktı ve
   indexlemeye değmez buldu → kalite sinyali. Artıyorsa **dur**.
3. **"Discovered — currently not indexed".** Henüz crawl edilmedi → kaynak
   meselesi, kalite hükmü değil. Panik yok.
4. **Gösterim (impressions)** — ilk 90 günün ana metriği. Tıklama değil.
5. **Sorgu listesi (GSC → Queries)** — §2.0'daki hacim belirsizliğini kapatan
   TEK gerçek veri. 90. günde bu liste, rankhero'nun tüm tablosundan değerlidir.
6. **Sayfa ailesi başına gösterim** (GSC → Pages, URL prefix filtresi):
   hangi aile çalışıyor? Çalışmayan aile büyütülmez.
7. **Dönüşüm:** SEO sayfası → `/create.html` → paket üretimi. Plausible goal.
8. **CWV (CrUX, GSC Core Web Vitals raporu)** — wasm sızıntısı olursa burada
   görünür.

### 8.3 İlk 90 gün — gerçekçi beklenti

Bunlar **TAHMİN**dir ve iyimser tarafa yaslanmamıştır. Gerekçe: yeni subdomain,
sıfıra yakın backlink, rakipler 10–17 yıllık domainler.

| Gün | Gerçekçi | Neye bakılacak |
|---|---|---|
| 0–30 | Sayfaların **%40–70'i** indexlenir. Gösterim **birkaç yüz**, tıklama **≈0**. Gelen trafiğin çoğu marka + Instagram/LinkedIn yönlendirmesi | Index coverage. Trafik değil |
| 30–60 | Gösterim **birkaç bin/ay**. İlk organik tıklamalar: **onlarca/ay**. Sıralamalar 30–100. arası | GSC Queries: gerçek sorgular ilk kez görünür |
| 60–90 | Gösterim **5.000–20.000/ay** (TAHMİN, geniş bant). Organik tıklama **100–500/ay**. İlk sayfa sıralaması yalnız **çok uzun kuyruk** ve muhtemelen araç sorgularında | Hangi aile çalışıyor? |

**Ne OLMAYACAK, açıkça:**
- "sewing pattern", "free sewing pattern", "dress sewing pattern" gibi baş
  terimlerde ilk sayfa. 90 günde değil, 90 haftada da olmayabilir.
- SEO'dan gelen anlamlı **gelir**. İlk gelir Instagram/LinkedIn'den gelecek;
  SEO 6–12 aylık bir yatırımdır.
- Kesin hacim doğrulaması dışında bir "hacim" iddiası (§2.0).

**En gerçekçi ilk zafer:** `seam allowance calculator` veya
`fabric yardage calculator` benzeri bir araç sorgusunda ilk sayfa. Gerekçe:
KD 14, SERP'i jenerik converter siteleri tutuyor, bizim çıktımız gerçek bir
motor hesabı. Bu tek sayfa, 75 kalıp sayfasından daha hızlı trafik getirebilir.

---

## 9. SIRA (öneri)

DEVIR §7.5 sırası: hesap + kota → gardırop → ödeme → **programatik SEO** →
fiziksel satış. SEO'nun 4. sırada olmasının somut sebebi: F1 sayfalarında
`Product`+`Offer` şeması ve "satın al" akışı olmadan sayfa **doorway**
tanımına yaklaşır (§5.3 madde 2-3).

**Ama SEO'nun ödemeyi beklemesi gerekmeyen üç parçası var, bunlar bugün
yapılabilir:**

1. **§6.1 `lastmod` düzeltmesi** — 250 sayfaya çıkmadan önce yapılmalı,
   sonra yapmak daha pahalı.
2. **§6.5 wasm izolasyonu** — SEO sayfası şablonu wasm yüklemeden çalışmalı.
   Bu bir mimari karar, sonradan sökmek zor.
3. **F5 araç sayfaları (6)** — satış akışına bağlı değil, ödeme beklemez,
   en zayıf SERP'i hedefler, ve motorun gerçek olduğunu kanıtlar.

Sonra: F2 → F4 → F1 → F3 → F6 → TR aynası.

---

## 10. DÖKÜM — sorulmamış ama önemli + göremediklerim

### 10.1 Bu turda çıkan, sorulmamış bulgular

1. **Site %100 İngilizce.** `web/**.html` içinde `lang="tr"` taşıyan sıfır sayfa
   var (ölçüldü). DEVIR/brief "kaynaklı **Türkçe** dikiş rehberi" diyor ama
   `web/guide/`'daki 6 sayfanın altısı da `lang="en"` ve başlıkları İngilizce
   ("How to sew an A-line or straight skirt"). Bu, plan yazılmadan önce
   bilinmesi gereken bir çelişki — Türkçe SEO planı bugün **var olmayan** bir
   içerik katmanının üstüne kuruluyor.
2. **Deploy her dosyaya dokunuyor.** `scripts/deploy.sh` `?v` bump'ını
   `find web ... -exec perl -i` ile **her** html/js/css'e uyguluyor. 16 dosyada
   görünmez, 250'de sitemap `lastmod`'unu her deploy'da yalanlıyor (§6.1).
   Bu SEO planı olmasa bile bir kusur.
3. **CLAUDE.md'deki "128 sayfa" sayısı bayat.** O satır 17 Ağu ölçümünden
   ("128 sayfanın sadece 4'ünde noindex var"). Bugün `web/` altında **16** html
   var. `web/styles/` (24 sayfa) ve `web/patterns/` diskte **yok**; ama
   `gen-sitemap.mjs:57 rank()` hâlâ `patches`, `collections`, `styles` dizinleri
   için kural taşıyor — ölü kural.
4. **StitchLift fiyatı ölçüldü:** ücretsiz katman ömür boyu 20 kalıp / ayda 2
   yeni · Creator **$34/ay** (40 kalıp/ay, A0 export, ticari lisans) · Studio
   **$49/ay** (99 kalıp/ay) · yıllıkta %25 indirim (https://stitchlift.com/pricing).
   DEVIR §7'de "$49/ay" yazıyor — doğru ama **eksik**: asıl rekabet baskısı
   **ücretsiz katmanda** (ömür boyu 20 kalıp). Damla'nın "her hesaba 2 hak"
   kuralı bunun 1/10'u. Bu bir fiyatlandırma kararı, SEO kararı değil, ama
   ödeme akışı yazılmadan bilinmeli.
5. **Deer & Doe artık bağımsız değil** — Nisan 2024'te Closet Core satın aldı,
   deer-and-doe.fr → closetcorepatterns.com 301
   (https://blog.closetcorepatterns.com/welcome-deer-and-doe-to-the-closet-core-family/).
   Brief'te ayrı rakip olarak sayılmıştı; tek rakip.
6. **Sektör konsolide oluyor ve abonelike kayıyor.** Seamwork $16–21/ay,
   Closet Core "Crew" aboneliği, StitchLift $34–49/ay. Tek seferlik kalıp satışı
   ($16–18) hâlâ var ama büyüme abonelikte. Damla'nın "kredi veya abonelik"
   kararı (DEVIR §7.5 madde 3) sektörle uyumlu.
7. **FreeSewing'in %93.75 bounce rate'i** (Similarweb) — ölçüm-tabanlı kalıp
   üretiminde **talep var, kullanılabilirlik yok**. Bu, stitchu'nun konumlanma
   cümlesi için gerçek bir veri: "kalıp üretmek zor değil, **dikilebilir** kalıp
   üretmek zor" iddiasının yanına "**kullanılabilir** olması da zor" eklenebilir.
8. **`contract/terms.json`'daki 28 `honest` terim bir içerik varlığıdır.**
   "Motor bunu bugün çizemiyor" listesi, rakiplerin asla yayınlamayacağı bir
   sayfadır ve tam olarak Damla'nın "kanıtla, iddia etme" çizgisidir. SEO değeri
   düşük, güven değeri yüksek.
9. **Sicil ↔ artefakt çelişkisi SEO'yu doğrudan ilgilendiriyor.**
   `garment-spec-v2.json`'da `sleeve` **absent**, `collarFamily` **absent**,
   `shoulderSeam` **flagged**; ama web motoru üç kol ve yedi yaka tipi
   çiziyor. Bir SEO sayfası "kollu elbise kalıbı" diye yayına girerse ve o kol
   yüzey hattının sicilinde yoksa, dışarıya sicille çelişen bir iddia gitmiş
   olur. Üretecin `draft().error` kapısı bunu teknik olarak çözer ama
   **metinsel iddia** ayrı bir karardır — hangi sicil dışarıya konuşuyor?
10. **Site iki adresten yayında** (Vercel + nosey-dewdrop.github.io, ikincisi
    HTTP 200). 250 sayfada duplicate content riski (§6.7).
11. **`web/create.html` ve `web/studio.html` var; `studio.html` noindex.**
    Yani ürünün asıl aracı arama motoruna kapalı — bu muhtemelen bilinçli ama
    F5 araç sayfaları planlanırken bilinmeli.
12. **`beden tablosu` Türkçe teriminin trafiği büyük oranda dikişle ilgisiz**
    (Mavi, Tchibo, Hatemoğlu gibi giyim markaları). TR sayfa başlığı seçilirken
    bu tuzağa düşülmemeli; "dikiş beden tablosu" / "kalıp beden tablosu" gibi
    nitelenmeli.

### 10.2 Göremediklerim / doğrulanmamışlar

- **Google'ın gerçek arama hacmi** — hiçbir terim için. §2.0'daki tüm sayılar
  rankhero.com tek kaynağı, kaynağı açıklanmamış, Etsy odaklı bir araç.
- **Türkçe arama hacmi** — Google Trends TR otomatik erişimde 429 döndü.
  TR bölümünün tamamı arz-tarafı çıkarımı.
- **Backlink profili / domain otoritesi** — ne bizim ne rakiplerin. Ücretsiz
  kaynakta yok.
- **`noseydewdrop.com` ana domaininin otoritesinin subdomain'e ne kadar
  aktığı** — Google subdomain'i genelde ayrı sayar ama bu davranış belgelenmiş
  bir kural değil. **DOĞRULANMADI.**
- **Google'ın IndexNow'u desteklemediğine dair Google'ın kendi resmî tek
  cümlesi** — bulunamadı; hüküm dolaylı kaynaklara dayanıyor.
- **"42.000 sayfa manuel aksiyon" vakası** — birincil kaynak yok.
- **HouseFresh'in düşüş sebebi** — Google'ın gerekçesi hiç açıklanmadı; site
  kendi anlatısını yayınladı, karşı taraf yok.
- **StitchLift'in gerçek sayfa sayısı ve sitemap'i** — erişilemedi.
- **StitchLift'in ürünü elde denenmedi.** DEVIR §7'nin uyarısı geçerli:
  "Bağımsız inceleme yok, elde denenmedi." Bu SEO planı StitchLift'i bir SEO
  rakibi olarak ölçtü, bir ürün rakibi olarak **ölçmedi**.
- **Motorun hangi eksen kombinasyonlarını gerçekten kabul ettiği** — bu
  oturumda `draft()` koşturulmadı (başka bir ajan repoda çalışıyor, hiçbir
  şey çalıştırılmadı). §4.1'deki 75 sayfa **üst sınırdır**; gerçek sayı
  üretecin ilk koşusunda `d.error` sayıldığında belli olur.
- **Mevcut GSC verisi** — site zaten aylardır indexlenmeye açık
  (`robots.txt: Allow: /`), yani GSC'de bugün gerçek gösterim/sorgu verisi
  **olabilir**. Bakılmadı. Bu plan yazılmadan önce bakılacak ilk yer orası
  olmalıydı; hâlâ öyle: §2.0'ın belirsizliğini kapatan veri orada duruyor
  olabilir.
