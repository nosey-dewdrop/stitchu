# V4-C — ZEVK PANOSU: referans dili + bugünkü flat'lerin ESKİ panosu

Tarih: 2026-08-24 · Kart: `GECE/KART/V4-C.md` · Etiket: PARALEL (tur 1)

> **HÜKÜM DAMLA'NINDIR.** Bu dosya hüküm içermez. İki şey içerir: (1) dışarıdaki
> referansların ÖLÇÜLEBİLİR özellik dili, (2) bugünkü çıktımızın kırpmasız panosu.

> **TELİFLİ GÖRSEL İNDİRİLMEDİ (§7.2).** Aşağıdaki referansların hiçbirinde resim
> indirilmedi, kaydedilmedi, panoya basılmadı. Referans = **link + özellik-dili
> tarifi**. Panodaki her PNG BİZİM ürettiğimiz SVG'den rasterize edildi.
>
> ⚠ **BU TURUN YAPISAL SINIRI:** WebFetch sayfaları METNE çevirir, görsel döndürmez.
> Yani "çizgi kalınlığı hissi / arka plan / tipografi" gibi GÖRSEL özellikler
> **doğrudan görülmedi**. Sayfanın kendi metninde birebir yazan şeyler doğrulanmıştır;
> gerisi **DOĞRULANMADI (metinden çıkarım)** olarak işaretlidir. Bu sınır kartın
> veto'sunun kaçınılmaz sonucu — indirmeden görsel doğrulanamaz.

---

## (1) REFERANS DİLİ — DÖRT KOVA

### KOVA A — CHANEL HAUTE COUTURE (couture teknik çizim / atölye dili)

| # | KAYNAK | NE GÖRÜNÜYOR (özellik dili) | BİZDE KARŞILIĞI | ÖLÇÜLEBİLİR Mİ |
|---|---|---|---|---|
| A1 | https://10magazine.com/chanel-haute-couture-ateliers/ | **Doğrulandı (sayfa metni):** *"The teeniest line in Karl's sketch means something"*, *"if he draws in three buttons, he means three buttons."* Çizimdeki her sayılabilir eleman üretim spec'inde birebir karşılığı olan bir nesne. Yorum payı sıfır. Première'in denetlediği iki eksen açıkça adlandırılmış: **volume** ve **shape**. | **KISMEN VAR.** Çizim spec'ten türüyor (render-garment-flat.mjs "spec-driven", pieces'tan DEĞİL), ama `count(çizilen düğme) == count(spec.düğme)` diye bir kapı yok. `interior()` düğme sayısını `const nb = 6` diye SABİT yazıyor — spec'ten okumuyor. | **EVET.** Kapı: her sayılabilir eleman (düğme, pens, panel dikişi, çentik) için `count(SVG'de çizilen) == count(spec)`. SVG'de `<circle>` sayısı ile `spec.buttonCount` karşılaştırılır; eşit değilse fail. **EKSİKLİK + YOL:** bugün `nb=6` sabit → spec'e `buttonCount` alanı eklenip kalem oradan okuyacak, kapı iki tarafı karşılaştıracak. |
| A2 | https://www.thecuttingclass.com/technical-drawings/ | **Doğrulandı (sayfa metni):** *"Most companies will have at least a front and back drawing for each garment"* + *"zoomed in detailed drawings or side views"*. Çizgi: *"If you are using 1pt lines then don't have some drawings with 2pt and some with 3pt."* Simetri: *"complete half first and then mirror for the second side."* Oran: *"make sure that the garment you are sketching would actually make sense on the body."* Dolgu: renkli/gri dolgu bir SEÇİM, koleksiyon boyunca sabit olmalı. | **VAR, ve kanunlaşmış.** `contract/flat-convention-v1.json`: `views.required = ["front","back"]`; `lineClasses` 5 sınıf (outline 2.0 / seam 1.4 / mark 1.0 / topstitch 1.0+"4 3" / hidden 1.0+"1 3"); `fillLaw.allowedFills` 4 değer, gradient/filter/opacity YASAK; kalem sağ yarıyı çizip `scale(-1,1)` ile aynalıyor. **YOK:** detay büyütmesi (zoom) ve yan görünüm — bugün sadece 2 görünüm var. | **EVET, dördü de.** (a) view sayısı ≥2 + `front.bbox_height == back.bbox_height` ±%2; (b) SVG'deki `distinct(stroke-width)` kümesi `lineClasses` tablosuna eşit olmalı, fazlası fail; (c) simetri: orta eksende aynala, path delta < eşik; (d) `garment_height / shoulder_width` insan bandında mı. **EKSİKLİK + YOL:** detay büyütmesi yok → panonun her hücresine üçüncü bir alt-kutu (`data-view="detail"`) eklenip yaka/kol ucu/manşet bölgesi aynı SVG'den `viewBox` kırpmasıyla üretilebilir; yeni çizim gerekmez, sadece yeni viewBox. |
| A3 | https://maisondechanel.ca/notes-of-style/chanel-couture-inside-the-ateliers/ | **Doğrulandı:** *"Initial sketches are refined into technical drawings that specify **structure, fabric, and embellishment**."* + *"Before fabric is ever cut, each design is translated into a **toile**"* + *"Garments are adjusted to **millimeter precision**."* | **KISMEN.** `structure` var (spec: shaping/neckline/sleeve/skirt). `fabric` flat'te YOK (spec'te `fabric` alanı var ama flat çizimine girmiyor). `embellishment` YOK. mm hassasiyeti motor tarafında var (`unitMM = 3.0`, `data-scale="1:3"` SVG kökünde beyan ediliyor). | **EVET.** Kapı: her flat artifact'ı `structure/fabric/embellishment` üç alanını da beyan etmeli, `null` sayısı 0. **EKSİKLİK + YOL:** bugün SVG kökü `data-scale`/`data-unit-mm`/`data-croquis`/`data-ref-size` beyan ediyor ama kumaş/süsleme beyan etmiyor → aynı köke `data-fabric` + `data-embellishment` eklenir, kapı beyanın spec ile aynı olduğunu doğrular (beyan yalan söyleyemez, `views` kanununda zaten uygulanan yöntem). |
| A4 | https://collections.vam.ac.uk/item/O1719946 | **Doğrulandı (müze kaydı):** korsaj ≈55.000 işleme elemanı / 750 saat / Atelier Montex; etek ≈2.200 tüy + 3.000 eleman / 757 saat / Maison Lemarié + 72 m şifon. Kayıt şeması: `element_count + unit + hours + supplier + technique`. ⚠ Kaydın kendisinde **dimensions alanı BOŞ**. | **YOK.** Bizde malzeme/emek envanteri yok. **AMA** bizde onların eksiği VAR: `dimensions` bizde birincil (mm, EU34-48). | **EVET.** Kapı: `required_fields_present / required_fields_total == 1`. V&A kaydı bu testte `dimensions` yüzünden FAIL ederdi — yani şema bizim lehimize. **YOL:** flat'e "kumaş gereksinimi (m) + parça sayısı" alanları bağlanırsa aynı şema tamamlanır. |

**KOVA A ZAYIF NOKTASI (dürüst kayıt):** `chanel.com` üç ayrı yoldan **403 Forbidden** verdi.
Chanel'in kendi ağzından tek satır alınamadı; A1/A3 ikincil kaynak. **Chanel'e özgü olan şey
çizginin grafik kalınlığı DEĞİL, semantik bağlayıcılığıdır** — "1pt/2pt/3pt" sayısal çizgi dili
YALNIZCA The Cutting Class'tan (eğitim sitesi) geliyor. Dışarıya "Chanel'in çizgi kalınlığı
şudur" cümlesi KURULAMAZ, kaynağı yok.

---

### KOVA B — BERSHKA / STRADIVARIUS (hızlı moda ürün sayfası sunumu)

| # | KAYNAK | NE GÖRÜNÜYOR (özellik dili) | BİZDE KARŞILIĞI | ÖLÇÜLEBİLİR Mİ |
|---|---|---|---|---|
| B1 | https://www.stradivarius.com/us/printed-ruched-strap-midi-dress-l08189625 | **Doğrulandı:** 10 galeri + 1 master görsel. Dosya-adı soneki bir ÇEKİM TİPİ KODU: `a*`/`c*` = mankenli (7 adet), **`s1/s2/s3` = still-life (3 adet, giysi tek başına)**. `-m` master `w=1280`, galeri `w=736`, renk kartı `w=333`, swatch `w=29` — tek kaynaktan 5 boy. Manken verisi metinde: `Height of model: 177 cm - Size S`. Açıklama **24 kelime / 3 cümle**. `REF. 8189/625/130` formatı. Beden yanında `Measurements` (ölçü tablosu). $45.90. | **KISMEN.** Bizde de tek kaynaktan çok boy türetiliyor (SVG → `raster.mjs` istenen short-side'a). **YOK:** çekim tipi kodu, master/galeri/swatch boy hiyerarşisi, manken boyu beyanı. | **EVET.** Kapı: her stil için `{front, back, detail}` üçlüsü eksiksiz mi (`s1/s2/s3` grameri). **EKSİKLİK + YOL:** bugün `raster.mjs` tek boy basıyor → çıktı adlandırması `<stil>-s1/-s2/-s3` + `-m/-w736/-w333/-w29` şemasına bağlanır, kapı beş boyun hepsinin üretildiğini sayar. |
| B2 | https://www.stradivarius.com/us/oversize-faux-suede-jacket-l05732400 | **Doğrulandı — `s1/s2/s3` grameri burada net:** `s1` = *"Front view of a brown jacket..."*, `s2` = *"**Back view** ... **center back seam** ..."*, `s3` = *"**Close-up** of the high collar..."*. Yani **arka görünüm mankende değil, STILL-LIFE olarak** veriliyor. Açıklama 34 kelime / 6 cümle, telgraf üslubu ("Puff hem." tek başına bir cümle). Bakım ikonu seti sabit: 7/14/18/28/35. | **VAR (ön+arka), YOK (detay).** `contract/flat-convention-v1.json → views.required = ["front","back"]` bunu zaten kanun yapmış ve `render-garment-flat.mjs` FRONT/BACK'i AYNI SVG'de, aynı ölçekte, başlıklı basıyor (panoda görünüyor). Üçüncü kare (close-up) yok. | **EVET.** Kapı: `s2` betimi `\bBack view\b`, `s3` betimi `\bClose-?up\b` içermeli. Bize çevirisi: her flat SVG'de `data-view="front"` + `data-view="back"` + (yeni) `data-view="detail"` grubu bulunmalı. **EKSİKLİK + YOL:** A2'deki viewBox-kırpma detay karesiyle aynı çözüm; ayrıca "close-up neyin" sorusu spec'ten çözülür (yaka varsa yaka, manşet varsa manşet). |
| B3 | https://www.stradivarius.com/us/ribbed-cotton-racerback-top-l02522687 | **Doğrulandı:** açıklama **12 kelime / 2 cümle** — 4 üründe ölçülen bant **12 / 20 / 24 / 34 kelime, 2–6 cümle, hiçbir cümle >12 kelime**. Dosya adı iki şema tolere ediyor: `{kod}-s{n}` ve `{kod}-{renk}-s{n}`. Alt metinler **LLM üretimi** (footer'da `generative-ai-terms-en.pdf`; bir alt metin tırnak içinde kalmış = üretim artığı). | **YOK.** Bizim stil sayfalarımızın metin uzunluğu bu bantla karşılaştırılmadı. | **EVET, doğrudan sayısal kapı:** `12 <= kelime <= 40 and 2 <= cümle <= 6 and max(cümle_kelime) <= 12`. **EKSİKLİK + YOL:** ölçülmedi → stil sayfası metinleri bu bantla lint'lenebilir; bant dışarıdan ÖLÇÜLDÜ, uydurulmadı. |
| B4 | **Bershka — sitemap verisi** `https://www.bershka.com/sitemap/productos/sitemap_productos_en-us_women-part0.xml.gz` | **Doğrulandı (4.865 `<loc>`, 1.258 benzersiz slug üzerinde kesim kelime frekansı):** `mini` 395 · `wide-leg` 170 · `oversize` 156 · `baggy` 126 · `midi` 119 · `cropped` 68 · `fitted` 53 · `straight` 43 · `low-rise` 43 · `balloon` 31 · `boxy` 26 · `parachute` 22 · `maxi` 19 · **`slim` 1**. Bershka iki kesim terimini üst üste yığıyor ("Cropped boxy-fit"), Stradivarius'ta bu kalıp yok. ⚠ sitemap `lastmod 2026-01-20` = **7 ay bayat**. | **KISMEN.** Bizde `topLength` (crop/waist/hip/tunic), `skirtLength` (mini/midi/maxi), `shaping` (princess/darts/boxy/shift) var — yani sözlük ÖRTÜŞÜYOR. **YOK:** `wide-leg`/`baggy`/`parachute`/`low-rise` (alt beden hiç yok), `oversize`. | **EVET.** Kapı: bizim stil sözlüğümüzün kapsama oranı = `|bizim kelimeler ∩ Bershka top-13| / 13`. Bugün kabaca 6/13 (mini, midi, maxi, cropped, fitted, boxy). **EKSİKLİK + YOL:** kapsama sayısı bir hedef olarak takip edilir; `oversize` bizde `shaping` eksenine bir değer olarak eklenebilir (croquis'e dokunmadan, yalnızca `waistW0`/`hemHalf` çarpanı). |

**KOVA B ZAYIF NOKTASI:** **Bershka PDP'ye ERİŞİLEMEDİ.** Akamai Bot Manager
(`bm-verify` interstitial, WebFetch → 403); metin proxy'sinde her Bershka ürün URL'i 404.
Bershka'da görsel sayısı / still-life var mı / açıklama uzunluğu / ölçü tablosu **hiçbiri
raporlanamadı**. B4 sadece ÜRÜN ADI seviyesinde veri. Ayrıca **arka plan rengi ve tipografi
her iki markada da DOĞRULANMADI** — alt metinlerde zemin tarifi hiç geçmiyor, bu düz stüdyo
zeminine işaret ediyor ama ÇIKARIMDIR, ölçüm değil.

---

### KOVA C — GEN-Z ESTETİĞİ (siluet + çizgi dili)

| # | KAYNAK | NE GÖRÜNÜYOR (özellik dili) | BİZDE KARŞILIĞI | ÖLÇÜLEBİLİR Mİ |
|---|---|---|---|---|
| C1 | https://blog.trendalytics.co/trends/dress-category-market-analysis-2026 | **Kaynağın kendi sayıları:** babydoll mini **+260%**, drop-waist **+38%** (Key Influencers), silk slip **+109%**, **bishop kol +400%**, **puf kol +363%**. Yani hacim artışı KOLDA, gövdeden hızlı. | **KISMEN VAR.** Puf kol motorda var ve KANUNA bağlı: `contract → sleeveLaw.puffHemNarrowerThanWidest = true`, `puffHemOverWidestMax = 0.9327` (Buğra Locket EU38 Alt Kol'dan ölçüldü). Panoda `peterpan_puff` hücresi bu kalemden çıktı. **YOK:** bishop kol, drop-waist. | **EVET.** Kol hacmi = `kol_max_genişlik / kol_oyuğu_genişliği`; bishop/puff için >1.5. Bizde bugün ölçülen oran `puffHemOverWidestMax` (et/en-geniş) — **farklı bir oran**, ikisi karıştırılmamalı. **EKSİKLİK + YOL:** `bishop` = puff'ın tersi (dolgunluk AŞAĞIDA, manşette toplanır); mevcut `CUFF_RATIO`/`bicepY` parametreleriyle yeni bir sayı yazmadan türetilebilir (bicepY'yi ete kaydır). |
| C2 | https://www.marieclaire.com/fashion/drop-waist-trend-fall-2026/ | **Doğrulandı (metin):** bel çizgisi *"below the hips"*, doğal belde değil; etki "elongated silhouette". Oturma tek değer değil: *"range from fitted to loose"*. Yaka: off-the-shoulder + *"Y2K-era halter necklines"*. | **KISMEN.** Bizde `waistline: 'empire'` var ve `geom()` onu `waistY * 0.66` diye ÇÖZÜYOR — yani bel çizgisi zaten bir ORANLA parametreli. `offShoulder` ve `halter` yaka `necklineGeom()`'da VAR. **YOK:** drop-waist (bel ORANI 1.0'ın üstüne çıkamıyor). | **EVET, tek parametre.** `waist_seam_ratio` = bel dikişi y / (omuz→etek ucu). Bugün kodda bu oran iki değerli: 0.66 (empire) ve 1.0 (natural). **EKSİKLİK + YOL:** drop-waist = aynı çarpanın ~1.35'i. Yeni geometri değil, mevcut `empire ? 0.66 : 1` ifadesinin bir sayı ekseni olması yeter. |
| C3 | https://www.marieclaire.com/fashion/summer-fashion/babydoll-dress-trend-summer-2026/ | **Doğrulandı (metin):** *"a true empire waist design with a bodice that cinches **below the bust**"*, etek "billowing"/"floaty", boy "thigh-skimming". Kol: puff / cap / sleeveless. Yaka: scoop + sweetheart. Detay dili: fiyonk, düğme, dantel, işleme. ⚠ **Bu kaynakta SAYI YOK.** | **BÜYÜK ORANDA VAR.** `empire` (0.66 = göğüs altı) ✓, `skirtStyle: 'gathered'` flare **1.9** ✓, `skirtLength: 'mini'` ✓, `sleeveCap === 2` puff / `cap` / `none` ✓, `scoop` + `sweetheart` yaka ✓. **YOK:** dantel/işleme (`embellishment` ekseni hiç yok — A3 ile aynı boşluk). | **EVET.** `skirt_flare = hem_yarı_genişlik / bel_yarı_genişlik`. Bizde bu sayı KODDA AÇIK: straight 1.12 · aLine 1.58 · gathered 1.9 · halfCircle 2.1 · fullCircle 2.6. **EKSİKLİK + YOL:** "billowing" için bir eşik ilan edilebilir (ör. flare ≥1.9 = full). Süsleme ekseni için: `embellishment` enum'u (lace/bow/button/embroidery) spec'e girer, her biri `mark` çizgi sınıfından bir glif basar — `interior()` zaten düğme/fiyonk çiziyor, sözlükleşmemiş. |
| C4 | https://newsroom.pinterest.com/news/pinterest-predicts-nonconformity-self-preservation-and-escapism-drive-21-trends-for-2026/ | **Pinterest'in kendi rakamları:** 80s luxury **+225%**, baggy suit **+90%**, chunky belt +65%, high collar jacket +60%, gold cuff +50%, poet aesthetic **+175%**, brown linen shirt **+100%**, lace bandana **+150%**, pleated trousers +30%. Metin: *"Tailored suits with **sculpted shoulders** will grow three sizes. **Funnel necks** will be the base of every outfit."* | **YOK, ve burada bir ÇELİŞKİ var.** Bizim croquis'te `shoulderTipX` **DONMUŞ** bir sayı (78.0u) ve contract'ın kendi notu onu "ölçülerek YANLIŞ bulundu ama değiştirilmedi" diye kaydediyor (doğru değer 70.18u). "Sculpted shoulders / grow three sizes" tam olarak bu eksende bir DEĞİŞKEN istiyor; bizde sabit. `funnel neck` yaka sözlüğünde yok. | **EVET.** `shoulder_width / hip_width` oranı (ters üçgen >1). Bizde bugün 78.0/78.33 = **0.9957** — yani omuz ≈ kalça, "sculpted" değil. **EKSİKLİK + YOL:** oran bir spec ekseni olur (`shoulderEmphasis`), croquis SABİT kalır ve giysi omuz vatkası bir GİYSİ özelliği olarak siluete eklenir — croquis'e dokunmadan (contract `easeNote` bu ayrımı zaten kuruyor). Funnel neck = `necklineGeom`'a yükseklik alanı ekleyen bir kalem (bugün sadece `half`+`depth` var, `rise` yok). |

**KOVA C ZAYIF NOKTASI:** C1/C2/C3/C4'ün **görsel doğrulaması SIFIR**. "billowing", "boxy",
"sculpted shoulders" ifadelerinin gerçek geometriye ne kadar karşılık geldiği görülmedi.
Ayrıca **veri iki yönlü**: Depop'a atfen skinny jeans aramaları **+131%** (DOĞRULANMADI —
birincil Depop sayfasında hiç yüzde yoktu, ikincil habere dayanıyor). **"Gen-Z baggy'e geçti"
cümlesi bu veriyle KURULAMAZ.** Vogue Business SS26'da 9.038 look'un **%97,1'i US 0-4 bedende**
(DOĞRULANMADI, arama özeti) — runway kaynaklı siluet verisi tek beden bandında gözlemlenmiş,
bizim EU34-48 bandımıza taşınırken sistematik sapma taşır.

---

### KOVA D — PROFESYONEL ETSY KALIP LİSTİNGLERİ (satan listinglerin flat'i)

⚠ **ETSY TAMAMEN KAPALI:** 3 farklı listing URL'i (`etsy.com/listing/...`, `etsy.com/ca/...`)
**HTTP 403**. Etsy'ye özgü hiçbir şey doğrulanamadı (satış adedi, review, başlık/tag yapısı,
bestseller rozeti). Aşağıdakiler **indie markaların kendi siteleri** — Etsy'de satan aynı
markalar, ama veri Etsy'den DEĞİL.

| # | KAYNAK | NE GÖRÜNÜYOR (özellik dili + paket içeriği, metinden) | BİZDE KARŞILIĞI | ÖLÇÜLEBİLİR Mİ |
|---|---|---|---|---|
| D1 | https://papercutpatterns.com/products/sierra-jumpsuit | **Gördüğüm en sayısal paket dili (hepsi doğrulandı):** "Screen Friendly Instructions: **36 - A5 Pages**" · "Print Friendly Instructions: **18 - A4/Letter**" · "Print At Home Pattern: **45 - A4/Letter**" · "Copy Shop A0: **3 - A0 Pages**" · "Continuous Sheet: Yes" · "Layered Sizes: Yes" · "Projector Files: Yes". Talimat İKİ SÜRÜM (ekran A5 / baskı A4). 8 beden. Notions ölçülü ("50cm/19.7" invisible zipper"). $20 AUD. | **BÜYÜK ORANDA VAR ama BEYAN EDİLMİYOR.** printpack A0 + A4 1:1, test karesi, deterministik sha256 üretiyor (CLAUDE.md, 8 bedende paket çıktı). **YOK:** layered PDF (beden başına katman — CLAUDE.md'de "alıcının beklediği per-beden PDF KATMANI yok" diye AÇIK kayıtlı), projector dosyası, talimat sayfası. | **EVET — bu turun EN DOĞRUDAN kapısı.** 7 alanlık manifest: `{screen_instructions_pages, print_instructions_pages, printathome_pages, a0_pages, continuous_sheet, layered, projector}`. **Hepsi üretilen GERÇEK dosyadan doldurulur:** sayfa sayısı `pdfinfo`, layered = PDF optional-content group sayısı >0, projector = dosya varlığı. Listing metni manifest'ten ÜRETİLİR, elle yazılmaz → RULES 6 ("sayılar test çıktısında yaşar") ile birebir aynı disiplin. **EKSİKLİK + YOL:** layered PDF ve talimat sayfası bugün yok → manifest önce üretilir, boş alanlar "NO" olarak DÜRÜSTÇE yazılır (D3'ün yöntemi), sonra doldurulur. |
| D2 | https://closetcorepatterns.com/products/pietra-pants-shorts-pattern | **Doğrulandı:** teknik çizim gövde metninde DEĞİL, bir **görsel başlığı** olarak duruyor: `"Pietra Pants + Shorts Sewing Pattern - **Technical Flats**"`. A0 sayfa sayısı **view başına VE beden bandı başına ayrı**: "View A - 2 pages, View B - 2 pages, View C - 1 page" (0-20) / "View A - 3, View B - 2, View C - 1.5" (14-32). "Layered files: YES", "**Projector files: NO**". Zorluk: "Confident Beginner". Kumaş 45"/58" en için ayrı yardaj. $22. | **KISMEN.** Bizde kesim planı + kumaş satırı beden başına var (CLAUDE.md, nestpack). **YOK:** iki beden bandı ayrımı, view başına sayfa kırılımı, zorluk seviyesi. | **EVET.** `a0_page_count` per (view, size_band) — ve iddia değil, `pdfinfo` ile dosyadan sayılır; uyuşmazlık = build fail. **EKSİKLİK + YOL:** zorluk seviyesi sabit sözlükten (`Beginner / Confident Beginner / Intermediate`) — parça sayısı + dikiş türü sayısından TÜRETİLEBİLİR, elle yazılmaz. |
| D3 | https://tillyandthebuttons.com/products/cleo | **Doğrulandı:** çizim yine görsel dosya adında (`Cleo-sewing-pattern-**technical-drawings**`). Paket: "Single-layer PDF – All sizes are included on one sheet" — yani **layered PDF sektör standardı DEĞİL**, farklılaşma noktası. Negatifi açıkça yazıyor: *"**Not suitable for projector sewing**"*. **16 beden**, tam cm: Size 0 = 71/56/79cm → Size 15 = 152.5/134.5/155cm, dört ülke karşılığı (UK 4-34 / US 0-30 / EUR 32-62 / AUS 4-34). £12.75. | **KISMEN.** Bizde 8 beden (EU34-48), `contract/tables.json → draft.euSizeChart` cm cinsinden ve `sourceStatus: verified` (burda style). **YOK:** ülke numarası eşlemesi, 16 bedene kadar bant. | **EVET.** Kapı: beden tablosu satır sayısı == PDF'teki katman/beden sayısı; her bedenin bust/waist/hip'i **monoton artan** (sıralı olmayan tablo = fail). **EKSİKLİK + YOL:** monotonluk testi bizde `gen-size-table.py --check` bekçisiyle kısmen var; ülke eşlemesi ayrı bir lookup tablosu olarak eklenir (uydurma yok, burda/UK/US çizelgeleri kaynaklı). |
| D4 | https://fridaypatterncompany.com/products/the-wilder-gown-pdf-pattern | **Doğrulandı — minimum viable paket dili:** "PDF pattern includes: instructions, A0 copy shop file, and print at home pattern size for A4 and letter." Beden aralığı ölçüyle TEK SATIRDA: "sizes XS/0 - 7X/32 (**32"/81cm - 60"/152cm chest**)". $16. `line drawing`/`technical drawing` kelimesi sayfada **YOK**. | **VAR.** Üç kalemin ikisi bizde (A0 + A4 1:1). **YOK:** talimat. | **EVET (zayıf kapı).** 3 dosyanın varlığı. Asıl ölçülebilir kısım beden satırı: string beden tablosunun min/max'ından OTOMATİK türetilir; elle yazılan sayı tabloyla uyuşmazsa fail. **EKSİKLİK + YOL:** bizde beden satırı bugün türetilmiyor → `contract/layers/size-table.json`'dan tek satır üretici, `gen-size-table.py` emsaliyle. |
| D5 | https://helensclosetpatterns.com/pages/faqs | **Doğrulandı:** A0 ürün başına değil **MARKA TAAHHÜDÜ**: *"All of our patterns come with a Copy Shop file (A0 format)"*. Print-at-home dosya adı: `printathome-A4_and_letter`. Projector'ü açıkça reddediyor: *"don't have plans to add projector files"*. | **YOK.** Bizde marka-seviyesi taahhüt sayfası yok. | **EVET.** Taahhüt listesi bir config; CI tüm ürün manifestlerini gezip ihlal edeni (A0'sız ürün) FAIL eder → "all of our patterns" iddiası **test edilebilir bir invariant**e döner. RULES 1 ile aynı ruh: *"kodda zorlanmayan bir garanti yoktur."* **EKSİKLİK + YOL:** doğrudan kurulabilir, yeni geometri gerektirmez. |

**KOVA D'NİN ORTAK GRAMERİ (5 sayfada tekrar eden, ölçülmüş):**
1. **Sayı, sıfat değil.** "45 - A4 Pages", "3 - A0 Pages", "1.3m to 2.3m". "Detaylı/kolay" gibi sıfat neredeyse yok.
2. **Çift birim istisnasız.** inch + cm, yard + metre, aynı parantez içinde.
3. **Negatif de yazılır.** "Projector files: NO", "Not suitable for projector sewing". Boş bırakmak yok.
4. **Beden = isim + ölçü bandı.** "XS/0 - 7X/32 (32"/81cm - 60"/152cm chest)". Beden adı tek başına yetmiyor.
5. **Zorluk sabit sözlükten:** Beginner / Confident Beginner / Intermediate.
6. **Fiyat bandı $16–$22 / £12.75 / $20 AUD** ve **beden sayısına bağlı DEĞİL** (Friday 33 beden → $16; Papercut 8 beden → $20 AUD).

**KOVA D'NİN EN SERT BULGUSU:** **Teknik çizim metinde SATILMIYOR.** Closet Core'da
"Technical Flats", Tilly'de "technical-drawings" — ikisi de **görsel dosya adı/başlığı**.
Papercut ve Friday'de kelime hiç geçmiyor. Yani "line drawing" bir *özellik maddesi* değil,
bir *görsel slot*. **Rekabet metinde değil, görselin kendisinde.**
İkinci sert bulgu: **dikiş payı ve test karesi beş sayfanın HİÇBİRİNDE listingde yok** —
sektörde bunlar PDF'in içinde veriliyor. Bizim printpack'in test karesi (113.3858pt) bir
listing malzemesi olarak kullanılabilir ama alıcının bunu ARADIĞINA dair kanıt bulunamadı.

---

## (2) ESKİ PANOSU — bugünkü çıktı, kırpmasız

### BASILAN PNG'LER (RULES 3: yol yoksa adım yapılmamıştır)

```
/Users/damummyphus/damla_projects_2026/stitchu/GECE/log/V4-C.pano/board-eski-1.png
/Users/damummyphus/damla_projects_2026/stitchu/GECE/log/V4-C.pano/board-eski-2.png
```

Panoyu basan komut:
```
node engine/tools/flat-board.mjs GECE/log/V4-C.pano
```

Hücre başına kaynak SVG'ler (aynı dizinde, kırpmasız, panoya gömülen bayt):
`dress_princess_scoop_aline.svg` · `gore_skirt_dress.svg` · `wrap_dress.svg` ·
`top_crew_dart.svg` · `top_boat_princess.svg` · `peterpan_puff.svg` ·
`top_princess_peplum.svg` · `top_bandeau_shirred_peplum.svg` ·
`dress_bandeau_circle.svg` · `shell-flat-EU38.svg`
Ve pano SVG'leri: `board-eski-1.svg` · `board-eski-2.svg`

### PANODAKİ 10 HÜCRE (stil adı · aile · hangi kalem)

| # | Stil (styles.json anahtarı) | Aile | Kalem |
|---|---|---|---|
| 1 | `dress_princess_scoop_aline` | elbise · prenses · A-line | render-garment-flat.mjs → flat-engine/_engine-full.mjs `renderStyle()` |
| 2 | `gore_skirt_dress` | elbise · gore etek | aynı |
| 3 | `wrap_dress` | elbise · kruvaze | aynı |
| 4 | `top_crew_dart` | üst · pensli | aynı |
| 5 | `top_boat_princess` | üst · prenses | aynı |
| 6 | `peterpan_puff` | üst · puf kol · peter pan yaka | aynı |
| 7 | `top_princess_peplum` | üst · peplum | aynı |
| 8 | `top_bandeau_shirred_peplum` | üst · bandeau · büzgü | aynı |
| 9 | `dress_bandeau_circle` | elbise · bandeau · daire etek | aynı |
| 10 | `shell-flat EU38` | hesaplanan kabuk konturu (stil DEĞİL) | `engine/build/shell-flat EU38 --svg` (GarmentSurf) |

Kartın istediği 6 farklı aile karşılandı: **elbise** (1,2,3,9) · **üst** (4,5,6,7,8) ·
**prenses** (1,5,7) · **puf kol** (6) · **peplum** (7,8) · **bandeau** (8,9).

### PANO DÜZENİ — V4-D BUNU AYNEN KULLANACAK

Düzen `engine/tools/flat-board.mjs` içinde kodlu, tarif:

- **Her SATIR = bir stil.** İki sütun:
  - **SOL sütun = ESKİ** (bugünkü çıktı). Bugün dolu.
  - **SAĞ sütun = YENİ.** Bugün BOŞ — içine "YENİ — boş (V4-D dolduracak)" yazılı kutu basılıyor.
- Ölçüler (SVG kullanıcı birimi): `PAD=46`, `HEAD=128`, hücre `CELL_W=640 × CELL_H=460`,
  sütun arası `COLGAP=34`, satır arası `ROWGAP=30`, altyazı bloğu `CAPTION=58`.
  Pano genişliği `BOARD_W = 46*2 + 640*2 + 34 = 1406` — **iki sütun için zaten ayrılmış**,
  V4-D'nin panoyu genişletmesi GEREKMEZ.
- Her hücrenin altında iki satır: (a) **stil adı + aile** (22px, 700), (b) **hangi kalemden
  çıktığı** (16px, gri).
- Sayfa başına **5 satır**; 10 hücre → 2 sayfa. Düzen her sayfada AYNI.
- **Gömme:** her stil SVG'si `<svg x y width height viewBox=... preserveAspectRatio="xMidYMid meet">`
  olarak gömülür. **Ölçeklenir, KIRPILMAZ.** Retuş, yeniden çizim, elle düzeltme YOK.
- **Rasterize:** `engine/tools/raster.mjs` → `rasterise(svg, png, 1600)` (kısa kenar 1600px,
  headless Chrome). Yeni rasterleme altyapısı KURULMADI, mevcut alet kullanıldı.

**V4-D için tek komut (ESKİ|YENİ yan yana):**
```
node engine/tools/flat-board.mjs <çıktıDizini> --yeni <yeniKalemSVGDizini>
```
`--yeni` verilen dizinde `<stilAnahtarı>.svg` adıyla dosya varsa sağ sütun ondan doldurulur;
yoksa o hücre boş kalır (kısmi doldurma sorun değil). Stil listesi `flat-board.mjs` içindeki
`STYLES` dizisi — **aynı liste, aynı sıra**, yani ESKİ ve YENİ satır satır hizalı çıkar.

---

## KART DIŞI FARK EDİLENLER (dokunulmadı, yazıldı)

1. **`peterpan_puff` bir ELBİSE silueti basıyor.** Stil adı "peterpan_puff" (üst çağrışımı)
   ama çıktı etekli. Panoda hücre 6'da görünüyor. Kırpma/retuş yasak olduğu için olduğu gibi
   bırakıldı. `styles.json`'daki `length` alanı incelenmedi (kart manifestinde ayrıntı yok).
2. **`top_crew_dart.svg` 2.385 bayt** — panodaki en küçük çıktı; diğer stiller 6.9–30 KB.
   İç detay (pens/dikiş) sayısı belirgin şekilde az. Ölçülmedi, sadece dosya boyu farkı.
3. **`contract/flat-convention-v1.json` içinde AÇIK bir kendi-itirafı var** (`shoulderTipX`):
   değer **ölçülerek YANLIŞ bulunmuş** (78.0u yerine 70.18u olmalı, Buğra Locket EU38 arka
   bedeninden 0.9570 oranı) **ama değiştirilmemiş**, çünkü `flat_convention_check.mjs`'nin
   omuz-ucu çıkarımı "x'in ilk yerel maksimumu" varsayımına dayanıyor ve bu varsayım tam da
   düzeltilecek kusuru gerektiriyor. Karar `DAMLA-KUYRUK.md K-FE-1`'e bırakılmış.
   **Bu, Kova C'nin "sculpted shoulders" ekseniyle doğrudan çakışıyor** (C4 satırına yazıldı).
4. **`render-garment-flat.mjs` düğme sayısını sabit yazıyor:** `const nb = 6` (satır 580
   civarı). Kova A1'in "üç düğme çizdiyse üç düğmedir" kapısı bugün kurulamaz. Dokunulmadı.
5. **`renderGarmentFlat` (sync) ile `renderGarmentFlatAsync` farklı çıktı veriyor.** Panodaki
   9 stilin **9'u da** referans kalem yoluna (`_engine-full.mjs renderStyle`) düştü; üretim
   flat yolu (`contract/flat-convention-v1.json`'a bağlı olan) HİÇBİR hücreyi basmadı.
   **Yani kanunun (flat-convention-v1) bağladığı kalem ile panoyu basan kalem AYNI DEĞİL.**
   Bu, kart kapsamı dışında ama zevk panosunu okurken bilinmesi şart: panodaki çizgi
   kalınlıkları `lineClasses` tablosundan gelmiyor, referans kalemin kendi `<style>`
   bloğundan geliyor (`.body{stroke-width:1.9}`, `.piece{1.5}`, `.tie{1.4}`).
6. **`engine/tools/` altında 110 kalem var** ve `gen-*-contact.mjs` / `gen-*-grid.mjs`
   ailesi (gen-gore-contact, gen-wrap-contact, gen-gore-grid, gen-wrap-grid, atolye-contact)
   kontakt-sayfası basıyor. Grep edildi, hiçbiri **ESKİ|YENİ iki-sütun** düzeni taşımıyor
   ve her biri kendi dar stil kümesine bağlı — o yüzden `flat-board.mjs` yazıldı (§7.5
   sayacı: **1 yeni kaynak dosya**, kartın izin verdiği tavan).

## YAPILAMAYANLAR

- **Chanel'in kendi sitesi (chanel.com):** 403, üç yol denendi. Chanel'e atfedilen her şey ikincil.
- **Bershka ürün sayfası:** Akamai bot duvarı; PDP alanlarının HİÇBİRİ alınamadı.
- **Etsy:** 403, hepsi. Etsy'ye özgü sıfır veri (satış adedi, review, tag yapısı).
- **Görsel doğrulama: SIFIR.** Kartın veto'su gereği hiçbir referans görseli açılmadı/indirilmedi.
  "Çizgi kalınlığı hissi, arka plan, tipografi" kolonu bu yüzden yalnızca metinde birebir
  yazan yerlerde doludur (A2, B1-B3 alt metinleri, D1-D5 paket satırları); geri kalanı
  DOĞRULANMADI işaretlidir.
- **Satın alınmış hiçbir kalıp PDF'i açılmadı;** D1-D5'in iddia ettiği sayfa sayıları /
  katmanlar dosya üzerinden doğrulanmadı, sadece sayfanın iddiası kayda geçti.
