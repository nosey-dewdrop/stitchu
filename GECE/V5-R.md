# V5-R — ARAŞTIRMA, İKİNCİ KESİM (kart V5-R2)

STATÜ: kod yazılmadı, repoda tek bir satır değişmedi. Bu dosya **kaynak künyesi**
taşır, kapı kurmaz. Kurtarma dosyasından (`GECE/V5-R-kurtarma.md`) gelen hiçbir
sayı buraya kopyalanmadı; A/B/C/D başlıkları orada kapandığı için TEKRAR
ARANMADI ve burada yalnızca **atıf** olarak anılır.

Koşu: 4 paralel araştırma işçisi (repo tavanı max 3-4). Her satırın GÜVEN
etiketi işçinin kendi erişimine göre verildi:
- **birincil** = kaynağın kendisi açıldı ve alıntı görüldü
- **ikincil** = başkası aktarıyor / arama snippet'i / perakende listesi
- **YAYIN YOK** = arandı, yayınlanmış dayanak bulunamadı (nerede arandığı yazılı)

V5 madde numaraları: kartın kendi adlandırdıkları — **1** = dikiş çifti uzunluk
eşitliği (üretim toleransı), **5** = GEÇİŞ (sewability), **7** = draft_math_check.
Kartın adlandırmadığı maddelere bağlama YAPILMADI (madde metnini taşıyan
`GECE-KOSUSU-v6.md` bu işçiye kapalıydı) — "?" ile işaretli.

---

## A. ÜRETİM TOLERANSI 1/32" (0.79375mm) — DİKİŞ ÇİFTİ EŞİTLİĞİ İÇİN

### HÜKÜM: **YAYIN YOK.**

| EŞİK | KAYNAK (ad + sürüm + sayfa/bölüm) | SAYI / KURAL | GÜVEN | V5 |
|---|---|---|---|---|
| 1/32" = 0.79375mm dikiş-çifti eşitlik toleransı | ASTM · ISO · Handford · Joseph-Armstrong · Price&Zamkoff · Cooklin · Glock&Kunz · Gerber · Lectra | — | **YAYIN YOK** | 1 |
| "tolerance of 1/32" ifadesi Open Library tam-metin korpusunda 73 kez geçiyor, **hiçbiri giyim değil** (marangozluk, sac metal, uçak, bowling, baskı, NDT, oto ön düzen) | Open Library search-inside, sorgu `"tolerance of 1/32"` — 18 başlık okundu | yokluk kanıtı | birincil (arama koşuldu) | 1 |
| CLO3D `Check Sewing Length` varsayılan eşiği | CLO Support, "Check Sewing Length" (support.clo3d.com/hc/en-us/articles/115012226027) | **3 mm** — bu farkın üstündeki dikiş çiftleri kırmızıya boyanır; eşik **kullanıcıya açık** ("Length Difference" alanı) | **ikincil** — sayfa 403, iki bağımsız arama snippet'inden | 1 |
| Aynı CLO yardım bölümünün ikinci snippet'i sayısal okumayı **1 mm**'de kırmızıya çeviriyor | aynı | 1 mm (gösterim) vs 3 mm (boyama) | **DOĞRULANMADI** — sayfa açılamadığı için 1 mm/3 mm çelişkisi çözülmedi | 1 |
| Elde "seamline walk": iki dikiş çizgisi **1/4"**'ten fazla ayrılırsa farkın yarısı kadar biri kısaltılır/uzatılır | Threads Magazine, "How to Walk the Seamline", 5 Şub 2021 | **1/4" = 6.35mm** | ikincil (snippet) | 1 |
| Bir kalıpçının **kişisel** doğruluk standardı 1/32"–1/64"; kesim sisteminin doğruluğu "belki 1/32"'e yakın" | Kathleen Fasanella, "How to develop sewing tolerances", Fashion-Incubator (blog) | 1/32"–1/64" | **ikincil** — fashion-incubator.com tamamı 403, yalnız snippet | 1 |
| Aynı yazının pratik önerisi: dikiş toleransı genelde **1/16"**, çünkü dikiş mastarları 1/8" bölmeli | aynı | **1/16" = 1.5875mm** | ikincil (snippet) | 1 |
| ASTM D5585 geri çekilmedi — **D5585-21 olarak yeniden yürürlükte** (onay 1 Oca 2021). İçeriği bir VÜCUT ölçü tablosu; kalıp toleransı taşımıyor | ASTM store, D5585-21 kayıt sayfası | — | birincil (mağaza künyesi okundu) | 1, 7 |
| ISO 8559-3:2018 kapsamı: **"garment dimensions are not included in this document"** → kalıp/giysi toleransı yok | ISO katalog, 8559-3:2018 scope | — | ikincil (ISO katalog metni) | 1, 7 |
| Grade rule / dikiş mastarı çözünürlüğü 1/32" mi? | — | **HAYIR.** Yayınlanan çözünürlük **1/8"** (Fasanella). 1/32"'i grade rule çözünürlüğü diye veren kaynak bulunamadı | YAYIN YOK | 1 |

**Repo tanığı (ölçüm, araştırma değil):** `surfacepattern.cpp:19 kProdTolMM = 0.79375`
ve `HEDEF.md:209 kProdTolMM`. Buna karşılık motorun kendi validator'ı
`engine/src/validator.hpp:23 pairedSeamTolerance = 3.0` mm — yani repo **iki ayrı
tolerans** taşıyor ve CLO'nun yayınlanmış 3 mm'si tesadüfen ikincisiyle aynı.

**BANT ŞU ÖLÇÜMDEN (yayın yoksa yazılacak satır):**
0.79375mm için savunulabilir tek gerekçe **iç tutarlılık**tır, dış kaynak değil.
Yayınlanmış tek apparel-özel sayı **CLO 3 mm**'dir; onun **3.8×** altında
duruyoruz. Eşik korunacaksa gerekçe "üretim standardı" diye YAZILAMAZ —
"reponun kendi ölçüm gürültüsünün üstünde seçilmiş ev değeri" diye yazılır.
Repo bunu zaten karşılıyor: T11'de en kötü yan-dikiş farkı 0.035mm (toleransın
%4.4'ü), T9'da ARAP duruş şartı <1e-4mm.

---

## B. YEDİRME (EASE) BANTLARI

### B1. Kol kapağı (sleeve head / cap) ease

| EŞİK | KAYNAK | SAYI | GÜVEN | V5 |
|---|---|---|---|---|
| Temel kol kapağı ease | Joseph-Armstrong, *Patternmaking for Fashion Design*, 3. baskı | **1½ in ≈ 3.8 cm** — *"Cap ease of the basic sleeve cap is approximately 1½ inches"* | **birincil-verbatim** (Open Library search-inside; **sayfa numarası YOK**) | 7 |
| aynı, başka baskı | Joseph-Armstrong, *Patternmaking for Fashion Design* | **1¼–1½ in = 3.2–3.8 cm** | birincil-verbatim, sayfa yok | 7 |
| aynı | Joseph-Armstrong, *Draping for Apparel Design* | **1¼ in, beden 10 ve altı için** | birincil-verbatim, sayfa yok | 7 |
| Yassılaştırılmış kol kapağı | Natalie Bray, *Dress Pattern Designing* | **1 cm toplam** | birincil-verbatim, sayfa yok | 7 |
| **Elbise kolu normal easing** | Natalie Bray, *More Dress Pattern Designing* | **2 cm** — kurtarma dosyası D §düzeltme | **kurtarma dosyasından, YENİDEN DOĞRULANMADI** (sayfa yok) | 7 |
| Kol kapağı ease | **Aldrich**, *Metric Pattern Cutting* (4. bs.) **ve** *Pattern Cutting for Women's Tailored Jackets* | **SAYI YOK.** İkisinde de yalnız nitel: *"The ease in the sleeve head is drafted to give a full rounded appearance"* | **birincil-verbatim (yokluğun kanıtı)** | 7 |
| Kol kapağı ease | Hayden, *The Complete Dressmaker* | 1.3–2 cm | birincil-verbatim, sayfa yok | 7 |
| Kol kapağı ease | Smith, *The Art of Sewing Basics and Beyond* | 1"–1½" | birincil-verbatim, sayfa yok | 7 |
| Dolgun/puf kol | Foster, *Betty Foster's Adapting to Fashion* | ~5 cm (2 in) | birincil-verbatim, sayfa yok | 7 |
| "Normal sleeve head ease gereksizdir, **pens olarak kullanılabilir**" | Shoben & Ward, *Pattern Cutting and Making Up: The Professional Approach* | sayı yok, **kural** | birincil-verbatim | 7 |
| Kapağı oyuğa bağlayan tek aritmetik ilişki | Aldrich 4. bs., tek parçalı kol bloğu s.22 | **"1–2 one third armscye measurement (bedenler 8–14 için −0.5 cm, 16–22 için −0.3 cm)"** | birincil-verbatim | 7 |
| Cap ease'in KUMAŞA göre yayınlanmış sayısal tablosu | Shaeffer *Fabric Sewing Guide* dahil | — | **YAYIN YOK** (yalnız kumaş-kumaş talimat cümleleri) | 7 |
| Fasanella'nın "sıfır/negatif cap ease" tezi (kol oyuktan 1/4"–3/8" **KÜÇÜK**) | fashion-incubator.com | −6.35…−9.5mm | **ikincil, DOĞRULANMADI** — site tamamı 403, yalnız snippet | 7 |

★ **Repo düzeltmesi:** `knowledge/drafting-math-eu38.md` cap ease bandını
("dokuma fitted 3–4.5cm, elbise/bluz 2–3cm") **Aldrich'e bağlıyor gibi
okunuyor. Aldrich bu sayıyı YAYINLAMIYOR.** Bandın gerçek sahibi
Joseph-Armstrong (3.2–3.8cm). Ve literatürün gerçek yayılımı bandın **dışına
taşıyor**: Bray 1–2 cm (alt uç), Fasanella negatif. Yani mevcut bant
literatürden **DAR**.

### B2. Omuz ease

| EŞİK | KAYNAK | SAYI | GÜVEN | V5 |
|---|---|---|---|---|
| Omuz ease (bodice) | Aldrich, *Metric Pattern Cutting* | **0.5 cm** — *"These measurements include shoulder ease of 0.5cm"* | **birincil-verbatim** (search-inside; sayfa yok) | 7 |
| Omuz ease (ceket) | Aldrich, *Pattern Cutting for Women's Tailored Jackets* | **0.85 cm** — aynı kitapta **ikinci bir blok 0.5 cm** taşıyor | birincil-verbatim (OCR: `0.S5cm`; aynı satırda `1.5cm`→`I.Scm`) | 7 |
| Aldrich yakın oturan bodice, omuz çizgisi | Aldrich 4. bs. s.14 | **"9–11 shoulder length measurement plus 1 cm"** (arka); ön: **"27–30 … shoulder length measurement"** (ekleme YOK) | birincil-verbatim | 7 |
| Aldrich easy fitting bodice | Aldrich 4. bs. s.16 | arka **+1 cm (0.5 ease + 0.5 ekstra boy)**, ön **+0.5 cm** | birincil-verbatim | 7 |
| Aldrich ceket s.18 / palto s.20 | Aldrich 4. bs. | **"shoulder length plus 1.5cm (3cm)"** / **"plus 2cm (3.5cm)"**, ikisi de 0.5 cm ease içerir | birincil-verbatim | 7 |
| Arka omuz ease pratiği | Rutan, *The Perfect Fit: Easy Pattern Alterations* | **"Leave 3/8″ (or longer) of ease on the back shoulder seam"** ≈ 0.95 cm | birincil-verbatim | 7 |
| Arka omuz ease ÜST SINIRI (kusur eşiği) | Tuit, *How to Fit Clothes* | **">⅜″ = 13 mm aşırıdır"** | birincil-verbatim | 7 |
| Omuz ease | Joseph-Armstrong · Handford | kavram var, **SAYI YOK** / kitap indekste yok | YAYIN YOK | 7 |

⚠ **ANLAM TUZAĞI — kurtarma dosyasının çerçevesi YANLIŞ.** Kurtarma D bloğu
"omuz ease = arka omzun önden ne kadar uzun olduğu" diye soruyor. Aldrich'in
cümlesi bu DEĞİL: *"shoulder length **plus** 1.5cm … includes shoulder ease of
0.5cm"* — bu, **beden tablosundaki omuz ölçüsüne (12.25/12.5 cm) eklenen bir
ÇİZİM PAYI**. Arka−ön farkı ayrı bir büyüklüktür. İkisi birleştirilmez.
Aldrich'in gerçek arka−ön farkı yakın oturan blokta **+1.0 cm** (arka +1, ön +0)
ve o pay **kürek şekillendirmesi**dir — CLAUDE.md'nin "arka omuz önden uzun,
6-12mm standarttır" satırıyla **aynı yöne ve aynı mertebeye** düşüyor
(Buğra ölçümü +0.95…+1.13mm ise bunun onda biri, yani Buğra çok sıkı).

### B3. Yan dikiş ease

| EŞİK | KAYNAK | SAYI | GÜVEN | V5 |
|---|---|---|---|---|
| Yan dikiş ease | Aldrich · Armstrong · Handford · Cooklin · Bray | — | **YAYIN YOK** | 7 |
| `"ease on the side seam"` Open Library tam-metin korpusunda **tek hit**, o da bir etek pensi | Hillhouse, *Dress Design: Draping and Flat Pattern Making* | ilgisiz | birincil (arama koşuldu) | 7 |

**BANT ŞU ÖLÇÜMDEN:** literatürün sessizliği, "ön yan dikiş = arka yan dikiş"
konvansiyonuyla **tutarlı** — çünkü eşit olan şeye pay yazılmaz. Bu, mevcut
MED etiketini **yükseltmez** ama düşürmez de. Repo tanığı ayakta:
`drafting-math-eu38.md` §Yan dikiş — pens KAPALIYKEN şartı, ve Buğra'da
düzeltilmiş fark +9.4mm (pens kapatılmadan ölçüldüğü için hüküm değil).

### B4. ★ ALDRICH KÜNYESİNİN TEYİDİ — KAPANDI

`knowledge/drafting-math-eu38.md`'nin *"Aldrich 6. baskı p.11"* iddiası
**Wiley'in kendi ücretsiz 1. bölüm PDF'iyle 10/10 doğrulandı**:
<https://catalogimages.wiley.com/images/db/pdf/9781444335057.excerpt.pdf>
(ISBN 9781444335057 = **6. baskı**; tablo başlığı *"Standard body measurements –
women's sizing"*, **sayfa 11 doğru**).

| ölçü | repo iddiası (88 / 92) | PDF s.11 | |
|---|---|---|---|
| büst | 88 / 92 | 88 / 92 | ✅ |
| bel | 72 / 76 | 72 / 76 | ✅ |
| kalça | 96 / 100 | 96 / 100 | ✅ |
| sırt genişliği | 34.4 / 35.4 | 34.4 / 35.4 | ✅ |
| ön (chest) | 32.4 / 33.6 | 32.4 / 33.6 | ✅ |
| omuz | 12.25 / 12.5 | 12.25 / 12.5 | ✅ |
| **bust dart** | 7.0 / 7.6 | 7 / 7.6 | ✅ |
| üst kol | 28.4 / 29.6 | 28.4 / 29.6 | ✅ |
| **armscye depth** | 21.0 / 21.4 | 21 / 21.4 | ✅ |
| beden kodu | 88=10, 92=12 | 10, 12 | ✅ |

→ O dosyanın başındaki **"kaynak-güveni HIGH, alıntı-doğrulaması AÇIK"**
çekincesi **KAPATILABİLİR** (dosyaya dokunulmadı; karar Damla'nın).
5. baskı kontrol EDİLEMEDİ (Wiley örneği yok) — **DOĞRULANMADI**.

---

## C. draft_math_check'in ANA ÖLÇÜLERİ

Birincil metin: **Aldrich, *Metric Pattern Cutting*, 4. baskı (Blackwell, 2004)**,
tam metin PDF okundu ve grep'lendi:
`https://dn760004.eu.archive.org/0/items/sewing-books/Metric%20Pattern%20Cutting,%204th%20Edition,%20by%20Winifred%20Aldrich.pdf`
(archive.org arayüzü 403, doğrudan dosya sunucusu açılıyor.)
⚠ **4. baskı başlığı *Metric Pattern Cutting*'tir; *…for Women's Wear* 5. baskıyla
başlar.** Repo 6. baskıyı anıyor — aşağıdaki formüller **4. baskıdan**, baskı
farkı kontrol EDİLMEDİ.

### C1. Scye derinliği (armhole depth)

| EŞİK | FORMÜL / BANT (birebir) | BAĞLI OLDUĞU ÖLÇÜ | KAYNAK | GÜVEN | V5 |
|---|---|---|---|---|---|
| Armscye depth | **TABLO, formül DEĞİL**: `20 / 20.5 / 21 / 21.5 / 22 / 22.5 / 23 / 23.7 / 24.4 / 25.1` (beden 8→26, büst 80→122). **Beden 12 = büst 88 → 21.0 cm** | beden kodu | Aldrich 4. bs. s.11 | birincil-verbatim | 7 |
| Aldrich onu vücuttan türetmeyi açıkça REDDEDİYOR | **"15 Armscye Depth . . . standard measurement."** (karşılaştır: *"1 Bust . . . measure the figure at the fullest point"*) | — | Aldrich 4. bs. s.171 | birincil-verbatim | 7 |
| Boy düzeltmesi | kısa (152–160cm) **−0.8 cm** · uzun (172–180cm) **+0.8 cm** | vücut boyu | Aldrich 4. bs. s.11 | birincil-verbatim | 7 |
| Yakın oturan bodice inşası | **"1–2 armscye depth measurement plus 0.5 cm; square across."** (0–1 = nape çizgisinin 1.5 cm üstü) | scye depth | Aldrich 4. bs. s.14 | birincil-verbatim | 7 |
| Easy fitting / ceket / palto | **+2.5 cm** / **+3 cm (5 cm)** / **+4 cm (6 cm)** | scye depth | Aldrich 4. bs. s.16, 18, 20 | birincil-verbatim | 7 |
| "Büst/8 + X" tipi scye formülü Aldrich'te | **YOK.** Tam metin grep'i: "one eighth" yalnız etek (`⅛ hip`), bodysuit gusset (`⅛ bust + 1cm`), jersey blok | — | Aldrich 4. bs., tam metin | birincil (yokluk kanıtı) | 7 |
| Müller & Sohn **Rückenhöhe** (= scye depth) | gömlek **1/10 Bu + 12 cm** · yelek **1/8 Bu + 12,5–13 cm** · ceket **1/8 Bu + 12–12,5 cm** | göğüs çevresi | muellerundsohn.com, "Maßnehmen und Maßberechnung bei **Herren**" | **birincil-verbatim ama ERKEK** | 7 |
| Müller **kadın** Armlochtiefe formülü | — | — | kadın sayfası **404**; kadın ölçü çizelgesi ücretli | **YAYIN YOK** | 7 |
| Müller yayınlanmış **grade** adımı | **scye depth +16 mm** (baz 38→46) · **+8 mm** (38→34) | beden adımı | muellerundsohn.com/en/allgemein/grading-a-basic-bodice-block/ | birincil-verbatim | 7 |
| "Bust/8+10.5", "Bust/4−4", "1/10 bust+10.5" | — | — | hiçbir kitap-atıflı kaynakta bulunamadı | **YAYIN YOK** | 7 |
| SewGuide (blog, atıfsız) | `büst/4 − 1.5 in` (36"→7.5") + büst→oyuk derinliği tablosu | büst | sewguide.com | **ikincil, atıfsız — ALINMAZ** | 7 |

### C2. Kol oyuğu çevresi bandı

| EŞİK | FORMÜL / BANT | KAYNAK | GÜVEN | V5 |
|---|---|---|---|---|
| Aldrich hedef oyuk çevresi | **YAYINLAMIYOR — türetilmiş/ölçülen büyüklük.** Kol bloğunun girdisi: **"armscye — measure the armscye"**; her bodice bloğu **"Sleeve Draft a one-piece sleeve (page 22) … to fit the armscye measurement"** ile biter | Aldrich 4. bs. s.14, 16, 22 | birincil-verbatim | 7 |
| Aldrich'in yayınladığı ŞEY: oyuk eğrisinin **derinlikleri** | yakın oturan: bedenler 8–14 → 14'ten **2.5 cm**, 22'den **2 cm** · 16–20 → 3 / 2.5 · 22–26 → 3.5 / 3. Easy fitting: 2.5/2.25 · 3/2.75 · 3.5/3.25 | Aldrich 4. bs. s.14, 16 | birincil-verbatim | 7 |
| **VÜCUT** armscye çevresi bandı | göğüs 86.4→**38.1** · 90.2→**40.0** · 94→**40.6** · 99.1→41.3 cm. Yani **göğüs 90–94 cm (EU38) → 40.0–40.6 cm** | Jill Wolcott Knits LLC, "Sizing Tables Sizes 2 through 20", © 2011 rev. 2020 | **birincil-verbatim ama kendi-yayını (sanayi tablosu, standart değil)** | 7 |
| ASTM D5585 armscye girth satırı | 14½ … 19⅝ in — **hangi sayının hangi bedene ait olduğu çözülemedi** | ASTM D5585-21 (paywall; aynalar 403) | **DOĞRULANMADI** | 7 |
| "armhole = k × büst" yayınlanmış ilişki | — | — | **YAYIN YOK.** (Wolcott tablosundan HESAPLANAN oran 0.43–0.44 @ göğüs 90–94, göğüs 129.5'te 0.37'ye düşüyor → sabit değil, **bu bizim aritmetiğimiz, yayın değil**) | 7 |

★ **Repo bandına etkisi:** `drafting-math-eu38.md`'nin *"toplam armhole ~40-44cm
(≈42), MED"* çapası artık **kaynak buldu ve daraldı**: yayınlanan tek vücut
tablosu EU38 için **40.0–40.6 cm**. Bizim ölçtüğümüz Buğra EU38 kesim çizgisi
**43.30 / 433.45mm** ve motorun K1 kapısı 432.99mm — **yayınlanan VÜCUT
bandının ~2.7cm ÜSTÜNDE**, ki giysi oyuğu vücut oyuğundan büyük olacağı için
bu beklenen yöndedir. Yani 40-44cm bandı vücut ile giysiyi aynı ada koyuyor;
**iki farklı büyüklük** (silinen armscye kalemiyle aynı sınıf risk).

### C3. Omuz genişliği + omuz eğimi

| EŞİK | FORMÜL / BANT | KAYNAK | GÜVEN | V5 |
|---|---|---|---|---|
| Omuz boyu | **TABLO**: `11.75 / 12 / 12.25 / 12.5 / 12.75 / 13 / 13.25 / 13.6 / 13.9 / 14.2` (beden 8→26). Beden 12 = **12.25 cm**. Grade **+0.25 cm/4cm büst**, beden 20'den sonra **+0.35** | Aldrich 4. bs. s.11 | birincil-verbatim | 7 |
| Vücuttan ölçülebilir (scye depth'in aksine) | **"6 Shoulder . . . measure from the neck to the shoulder bone."** | Aldrich 4. bs. s.171 | birincil-verbatim | 7 |
| **ARKA omuz EĞİMİ — Aldrich'in gerçek kuralı bir DERECE değil, scye depth'in kesri** | **"1–10 one fifth armscye depth measurement minus 0.7 cm; square halfway across the block."** sonra **"9–11 shoulder length measurement plus 1 cm; draw back shoulder line to touch the line from 10."** Easy fitting: **⅕ SD − 1 cm** | Aldrich 4. bs. s.14, 16 | **birincil-verbatim** | 7 |
| **ÖN omuz eğimi — arka omuz noktasından türetiliyor** | **"11–28 1.5 cm; square out approx. 10 cm to 29. 27–30 draw a line from 27, shoulder length measurement, to touch the line from 28–29."** → **ön omuz noktası arkanınkinden 1.5 cm AŞAĞIDA** | Aldrich 4. bs. s.14 | birincil-verbatim | 7 |
| Omuz eğimi DERECE olarak | — | — | **YAYIN YOK** (yalnız blog düzeyi "~15°", atıfsız). Aldrich'ten HESAPLANAN (yayın değil): beden 12'de nape-kare çizgisinin altına düşüş 1.5 + (21/5 − 0.7) = **5.0 cm**, 13.25 cm eğik omuz üstünde **≈22.2°** | 7 |
| Müller tanımı | **"Shw (Shoulder Width): Measure the shoulder from the beginning of the neck to the beginning of the arm at the shoulder."** — **sayı YAYINLAMIYOR**, kadın çizelgesi ücretli | muellerundsohn.com/en/allgemein/taking-measurements/ | birincil-verbatim (tanım), sayı YAYIN YOK | 7 |
| Müller grade | omuz **+8 mm** (38→46) · **+4 mm** (38→34), ön ve arka | muellerundsohn.com grading sayfası | birincil-verbatim | 7 |
| Bağımsız sanayi tablosu | göğüs 86.4–90.2 → **12.1 cm** · 94–104.1 → 12.4 · 114.3 → 12.7 — **Aldrich'le büst 88-94'te ~0.15cm içinde uyuşuyor** | Jill Wolcott Knits, Missy Sizing Tables © 2011 rev. 2020 | birincil-verbatim (kendi-yayını) | 7 |
| "omuz = across-shoulder/2" ya da "½ sırt genişliği + X" | — | — | **YAYIN YOK** | 7 |

★ Bu, `eu-beden-cizelgesi-kaynak-2026-08-17.md` §3(4)'ün hükmünü **bağımsız
olarak doğruluyor**: yayınlanan her sistemde `shoulder` **TEK omuz dikişidir**
(11.75–14.2 cm), 36–42cm'lik bir VÜCUT ölçüsü değil. `contract/tables.json`'ın
`shoulderCM` kolonu hâlâ **kaynaksız ve yanlış büyüklük şüphesi altında**.

### C4. Çevre payları (bust / waist / hip ease)

| EŞİK | FORMÜL (birebir) | TOPLAM PAY | KAYNAK | GÜVEN | V5 |
|---|---|---|---|---|---|
| Aldrich **yakın oturan** bodice, büst | **"2–3 half bust plus 5 cm"** | **+10.0 cm** | Aldrich 4. bs. s.14 | birincil-verbatim | 7 |
| Aldrich yakın oturan, bel | **"half the waist measurement plus 3 cm ease. This means 12 cm shaping (all sizes)."** | **+6.0 cm** | Aldrich 4. bs. s.28 | birincil-verbatim | 7 |
| Aldrich yakın oturan, kalça | **"…(this gives half hip measurement plus 2.5 cm ease)"** | **+5.0 cm** | Aldrich 4. bs. s.14 | birincil-verbatim | 7 |
| Aldrich **easy fitting**, büst | **"2–3 half bust plus 7 cm"** | +14.0 cm | Aldrich 4. bs. s.16 | birincil-verbatim | 7 |
| Aldrich ceket / palto, büst | **"half bust plus 8 cm (12 cm)"** / **"plus 10 cm (15 cm)"** | +16/+24 · +20/+30 cm | Aldrich 4. bs. s.18, 20 | birincil-verbatim | 7 |
| Aldrich sırt genişliği payı | yakın oturan **"half back width plus 0.5 cm ease"** (+1 cm) · easy **+1 cm** (+2 cm) | — | Aldrich 4. bs. s.14, 16 | birincil-verbatim | 7 |
| Aldrich **kolsuz** blok | **"The sleeveless block has already been reduced by 3 cm. This means 9 cm shaping (all sizes)."** | −3 cm | Aldrich 4. bs. s.28 | birincil-verbatim | 7 |
| **Threads — gerçek tablo bulundu** | *MINIMUM EASE*: **Büst 2½–3 in · Bel: elbise 1 in+, etek/pantolon 1–1½ in · Kalça 2–3 in · Crotch depth ½–¾ in · Bilek 1 in.** *FIT AND EASE* (bluz,elbise │ ceket): Close-fitting **0–3 in** │ — · Fitted **3–4** │ 3¾–4¼ · Semifitted **4–5** │ 4⅜–5⅜ · Loose **5–8** │ 5⅞–10 · Very loose **8+** │ 10+ | — | **Louise Cutting, "Ease Into Place", Threads #221, Bahar 2023, s.71** — dergi kendi PDF'i: `threadsmagazine.com/membership/pdf/260641/T221-FT-Ease-Place.pdf` | **birincil-verbatim** | 7 |
| Big-4 (Vogue/Butterick/McCall's) resmî ease çizelgesi | Elbise/bluz/ceket: Close **0–2⅞″** · Fitted **3–4″** (ceket 3¾–4¼) · Semi **4⅛–5″** · Loose **5⅛–8″** · Very loose **>8″**. Etek/pantolon (KALÇA): Close 0–1⅞″ · Fitted 2–3″ · Semi 3⅛–4″ · Loose 4⅛–6″ | — | The McCall Pattern Company fitting guide, WeaverDee (UK distribütör) reprodüksiyonu | birincil-verbatim (reprodüksiyonun), **kurumsal sayfa erişilemedi** | 7 |
| Joseph-Armstrong fitted bodice | ön = Bust Arc + ¼″, arka = Back Arc + ¾″ → **≈3.25 in = 8.25 cm** büst payı; koltukaltı seviyesinde **13.25 cm** | — | dresspatternmaking.com analizi (kitabın kendisi DEĞİL) | **ikincil, DOĞRULANMADI** | 7 |

★★ **REPONUN SAYISI DOĞRUDAN ÇÜRÜMEDİ AMA KÜNYESİ ÇÜRÜDÜ.**
Repo "göğüs+60 / bel+25 / kalça+50 mm, kaynak: Threads RTW + Aldrich bandı"
diyor (KOŞU 4B, `7a75423`). Ölçüldü:
- Threads *minimum ease*: büst **63.5–76 mm** · bel **≥25.4 mm** · kalça **51–76 mm**
- Aldrich yakın oturan bodice: büst **+100 mm** · bel **+60 mm** · kalça **+50 mm**
→ **bel +25 ve kalça +50 Threads minimumunun tam üstünde/dibinde.**
→ **büst +60 mm, Threads'in yayınlanmış MİNİMUMUNUN (63.5mm) ALTINDA** ve
Aldrich'in yakın oturanından **40 mm sıkı**. Yani "Threads + Aldrich" künyesi
büst kalemini **desteklemiyor**. İki dürüst yol var: büstü 65–76 mm'ye çekmek,
ya da +60'ı **ev değeri** diye yazıp künyeyi kaldırmak. **Bu bir araştırma
bulgusudur, karar Damla'nın.**

⚠ **Threads ile Big-4 BAĞIMSIZ İKİ KAYNAK DEĞİLDİR.** Bantlar ⅛″ farkla aynı;
Threads tablosu Big-4 çizelgesinin yuvarlanmış yeniden ifadesi görünüyor.
İkisini "iki kaynak doğruluyor" diye yan yana koyma.
⚠ **Threads tablosu SADECE BÜST kolonu taşıyor.** Bel/kalça sayıları aynı
yazının üstündeki *MINIMUM EASE* madde listesinden geliyor, tablodan değil.

### C5. Ense oyuntusu (back neck drop) + yaka genişliği

| EŞİK | FORMÜL (birebir) | BAĞLI OLDUĞU ÖLÇÜ | KAYNAK | GÜVEN | V5 |
|---|---|---|---|---|---|
| **Arka ense yükselmesi** | **"0–1 1.5 cm"** — SABİT, bütün bedenlerde (yakın oturan + easy fitting). Ceket **1.75 cm**, palto **2 cm** | sabit / blok tipi | Aldrich 4. bs. s.14, 16, 18, 20 | birincil-verbatim | 7 |
| **Arka yaka genişliği** | **"0–9 one fifth neck size minus 0.2 cm"** → beden 12 (neck 37): **7.2 cm** | **neck size** (tablo: 35/36/37/38/39/40/41/42.4/43.8/45.2) | Aldrich 4. bs. s.11, 14, 16 | birincil-verbatim | 7 |
| Ceket / palto arka yaka | **"⅕ neck size (plus 0.3 cm)"** / **"⅕ neck size plus 0.4 cm (plus 0.8 cm)"** | neck size | Aldrich 4. bs. s.18, 20 | birincil-verbatim | 7 |
| **Ön yaka genişliği** | **"4–20 one fifth neck size minus 0.7 cm"** → beden 12: **6.7 cm** | neck size | Aldrich 4. bs. s.14 | birincil-verbatim | 7 |
| **Ön yaka düşüşü** | **"4–21 one fifth neck size minus 0.2 cm"** → beden 12: **7.2 cm** | neck size | Aldrich 4. bs. s.14 | birincil-verbatim | 7 |
| İşaret uyarısı | Aldrich'te **arka yaka öndem 0.5 cm GENİŞ** (−0.2 vs −0.7); ön düşüş = ön genişlik + 0.5 cm | — | Aldrich 4. bs. | birincil-verbatim | 7 |
| GRAFIS (Müller-dışı sistem) arka yaka genişliği | **`bHlh = (uHa+30)×1/5 − 15`** (mm). uHa=370mm → **65 mm** | boyun çevresi | GRAFIS online help, "Maße OB 70" | birincil-verbatim | 7 |
| Müller Halsbreite 6.5–7.7 cm | — | — | resmî site **tanım** yayınlıyor (*"NW: Measure from the nape … horizontally to the shoulder seam"*, *"Ng: circumference of the neck"*), **sayı yayınlamıyor**; kadın çizelgesi ücretli. Müller grade: **yaka genişliği +8 mm (38→46), +4 mm (38→34)** | **sayı YAYIN YOK**, grade birincil | 7 |
| Bağımsız sanayi tablosu | **Back Neck Drop** 0.6/0.6/1.0/1.0/**1.3**/1.3/1.6/1.6/1.9/1.9 cm · **Front Neck Drop** 7.0/7.3/7.6/7.9/**8.3**/8.6/8.9/9.2/9.5/10.2 · **Neck Width (tam)** 10.2…15.2 | göğüs | Jill Wolcott Knits, Missy Sizing Tables | birincil-verbatim (kendi-yayını) | 7 |
| "back neck drop = ⅓ yaka genişliği" · "= 2 cm sabit" · "ön düşüş = genişlik + 1 cm" | — | — | **YAYIN YOK.** Aldrich üçünü de **çürütüyor** (1.5 cm sabit; ön düşüş = ön genişlik + 0.5) | 7 |

⚠ **LANDMARK ÇELİŞKİSİ (kapatılmadı):** Aldrich'in 7.2 cm'i **YARIM** genişlik
(CB'den yaka noktasına); Wolcott'ın 12.1 cm'i **TAM** genişlik. 2×7.2 = 14.4 ≠
12.1. Üç kaynak, üç landmark konvansiyonu. **Landmark'ı yazılmayan hiçbir yaka
genişliği sayısı kullanılamaz.**

---

## D. GEÇİŞ (sewability madde 5) — ANTROPOMETRİ + TİCARİ DONANIM

### D1. Baş çevresi ve geçiş zarfı

| EŞİK | POPÜLASYON | 5. / 50. / 95. persentil | KAYNAK | GÜVEN | V5 |
|---|---|---|---|---|---|
| **Baş çevresi** | Kadın, US Army 2010–12, **n=1986** | **532 / 560 / 597 mm** (ort. 561.1, SD 19.4, min 500, max 635) | **NATICK/TR-15/007 (ANSUR II)**, Gordon ve ark., Ara 2014, ölçü (46), s.135–136 | **birincil** | 5 |
| Baş çevresi | Erkek, US Army, n=4082 | 548 / 574 / 601 mm | aynı tablo | birincil | 5 |
| Baş çevresi | Kadın, Almanya 1999–2002, 18–65 | **520 / 545 / 570 mm** | **ISO/TR 7250-2:2010(E)** §7.2 Tablo 2 (Almanya), madde 41 (4.3.12), s.9 — kaynak yayın **DIN 33402-2:2005** | birincil (iteh.ai önizleme PDF'i Almanya bölümünü tam basıyor) | 5 |
| Baş genişliği | Kadın, ANSUR II | 140 / 147 / 156 mm | TR-15/007 (45), s.133 | birincil | 5 |
| Baş uzunluğu | Kadın, ANSUR II | 178 / 190 / 202 mm | TR-15/007 (47) | birincil | 5 |
| **Giysi için minimum baş geçiş açıklığı** | — | — | hiçbir standartta **YAYIN YOK**. Dolaşan el-işi kuralları (baş çevresi ÷ esneme katsayısı, ~343mm) **DOĞRULANMADI** ve başlangıç sayısı (20 in) ANSUR II ile çelişiyor (kadın 50. = 22.05 in) → **KULLANILMAZ** | YAYIN YOK | 5 |

⚠ **ANSUR II'nin kendi çekincesi (raporda basılı):** örgü/korniş saçlı kadın
katılımcılarda baş çevresi **saçı DA içeriyor**, bu yüzden ANSUR 1988 ile
kadınlar için denk değil. Giysi geçişi için bu **doğru sayıdır** — saç da geçiyor.

### D2. Omuz üstünden geçiş (bi-deltoid)

| EŞİK | POPÜLASYON | 5. / 50. / 95. | KAYNAK | GÜVEN | V5 |
|---|---|---|---|---|---|
| **Bideltoid breadth** | Kadın, US Army, n=1986 | **406 / 450 / 499 mm** (ort. 450.3, SD 28.7, min 357, max 558) | NATICK/TR-15/007, ölçü (11), s.65–66 | **birincil** | 5 |
| Bideltoid breadth | Erkek, n=4082 | 459 / 509 / 567 mm | aynı | birincil | 5 |
| Omuz (bideltoid) genişliği | Kadın, Almanya | **395 / 435 / 485 mm** | ISO/TR 7250-2:2010 Tablo 2 Almanya, madde 21 (4.2.9) | birincil | 5 |
| Bideltoid, **GİYSİLİ** | Kadın, FAA Tech Ops, ABD 2006–08 | 400 / 454 / 542 mm (1.=382, 99.=580) | FAA HFDS Ek B, Tablo 2, madde 24, s.B-10 | birincil | 5 |
| ★ **Omuz ÇEVRESİ** | Kadın, ANSUR II | **944 / 1027 / 1119 mm** (ort. 1028.2, SD 52.9) | TR-15/007 (68), s.179–180 | **birincil** | 5 |
| Omuz çevresi | Erkek, ANSUR II | 1080 / 1176 / 1288 mm | aynı | birincil | 5 |

★ **GEÇİŞ KAPISI İÇİN DOĞRU BÜYÜKLÜK muhtemelen omuz ÇEVRESİDİR, bideltoid
DEĞİL** — çünkü bideltoid hem ANSUR II'de hem FAA'da **OTURARAK, önkollar öne
yatay uzatılmış** halde ölçülüyor. Bu ölçüm postürü giysinin omuzdan geçmesiyle
ilgili değil. Omuz çevresi (ölçü 68) yayınlanmış ve doğrudan kullanılabilir.

**ISO 7250-1 vs -2 (kartın sorusu):** **7250-1** yalnız **YÖNTEM** tanımlar
(landmark, alet, postür), **veri yok**, paywall. **ISO/TR 7250-2** ulusal
**VERİ** taşır (Almanya, İtalya, Japonya, Kenya, Kore, Hollanda, Tayland);
nominal paywall ama **iteh.ai önizlemesi Almanya bölümünü (s.6–9) tam
render ediyor**. Diğer ülkeler önizleme dışında.

### D3. Fermuar — TİCARİ OLARAK SATILAN BOYLAR

**HÜKÜM: hiçbir fermuar ÜRETİCİSİ bitmiş-boy merdiveni yayınlamıyor.**
YKK'nın kendi kataloğu ve Coats/Opti'nin kendi veri sayfası açıldı: ikisi de
zincir genişliği, bant genişliği ve tolerans veriyor, **sıfır cm/inç boy**.
Zincir metreyle satılıyor, boy siparişe göre kesiliyor. **Boy merdiveni bir
STOKLAMA konvansiyonudur, fiziksel bir kısıt değil.**

| EŞİK | SAYI / MERDİVEN | KAYNAK | GÜVEN | V5 |
|---|---|---|---|---|
| YKK boy toleransı (yayınladığı tek boy-tablosu) | **≤300 mm → ±5 mm · 300–600 mm → ±10 mm.** "When the order is being placed, YKK considers the value (A) as the zipper length." | YKK Fastening Products Group, *Zipper Catalogue* (rev. 10/10), s.~20 | **birincil** (üretici belgesi, distribütör aynasında) | 5 |
| YKK'nın sevk ettiği tam boyut ekseni | **0, 2, 2.5, 3, 4, 4.5, 5, 5.5, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 12, 15, 20** — Metal/Coil/VISLON çaprazı. Fonksiyonlar: C kapalı uç, OR/OL açık uç, MR/ML çift yön | YKK katalog s.22 "Zipper Function and Size" | birincil | 5 |
| YKK CONCEAL (gizli) zincir genişlikleri | **No.2 CHC-2 = 4.15 mm** (s.68) · **No.3 CHC-3 = 4.90 mm** (s.69) | aynı katalog | birincil | 5 |
| YKK coil / VISLON / metal | CFC-3 4.15 · CFC-45 5.15 · CNFC-5 6.50 · VSC-3 4.70 · VSC-5 5.70 · RAC/RGC-5 5.75 · MGC-7 6.40 · MGC-10 8.50 mm | aynı katalog | birincil | 5 |
| **Gizli fermuar boy merdiveni, cm** | **16, 18, 20, 22, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70 cm** (ALFA-G UK + jajasio.de DE birleşimi) | perakende | **ikincil (perakende, üretici DEĞİL)** | 5 |
| Gizli fermuar merdiveni, inç | 6, 7, 8, 9, 10, 12, 14, 16, 18, 20, 22, 24 in (YKK #2 CONCEAL, Zipper Stop) | perakende | ikincil | 5 |
| YKK'nın kendi CONCEAL ürün sayfası | zincir boyutları 2CH/3CH/5CH/5CC — **boy YAYINLAMIYOR** | ykkamericas.com/product/conceal/ | birincil (yokluğun kanıtı) | 5 |
| Kapalı uç elbise fermuarı | Opti S40 (#3): **20, 25, 30, 40, 50, 60 cm**; ABD: **10 in'e kadar 1 in adım, sonra 20/22 in'e kadar 2 in adım** | Stoffe Werning · Weaver Leather Supply | ikincil | 5 |
| Açık uç / ayrılabilir | Opti Werra: **30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80 cm** (bulunan en temiz tam merdiven) | Leni Pepunkt, 2026 | ikincil | 5 |

⚠ **İKİ UYUMSUZ SİSTEM:** kıta-Avrupası metrik 5 cm merdiveni ve UK/US inç
merdiveninin cm'e çevrilmişi. 20 cm ≡ 8 in aynı ürün; **22 cm'in inç ikizi YOK.**
⚠ Halk kuralı "boyut numarası = diş genişliği mm" **YANLIŞ**: YKK **kapalı
zincir genişliğini** yayınlıyor ve aynı numarada malzemeye göre değişiyor
(#5 metal 5.75 vs #5 coil 6.50 mm).

### D4. Lace / korse donanımı

| EŞİK | SAYI / MERDİVEN | KAYNAK | GÜVEN | V5 |
|---|---|---|---|---|
| Kuşgözü (grommet) numara → **iç delik** çapı | #00000 1.5 · #0000 3.2 · #000 4 · **#00 4.5 (dış 9)** · **#0 6 (dış 11.5)** · #1 7 · #2 9 · #3 12 · #4 15 · #5 17 · #6 18 · #8 30 · #10 35 · #12 41.5 · #15 50 mm | GoldStar Tool "Grommet and Eyelet Sizing Chart"; #000–#4 J and J Hardware ile bağımsız teyit | **ikincil (tedarikçi çizelgesi, üretici kataloğu DEĞİL)** | 5 |
| UK konvansiyonu deliği doğrudan adlandırıyor | Prym korse kuşgözü **yalnız 4 mm ve 5 mm** | Vena Cava Design | ikincil | 5 |
| Korse bağcığı satılan boylar | **2, 3, 4, 5, 6, 7, 8, 9, 10 m** (~7mm eni, metal uçlu, 9 basamak 1m adım) · True Corset: 4/6/7.5/8/9.5 m | Vena Cava Design · True Corset | ikincil | 5 |
| Boy-başına-giysi kuralı | waspie 4–5 yd · underbust 6 yd · longline underbust 7 yd · overbust 8 yd (+1 yd iri yapı) | Orchard Corset | ikincil | 5 |
| Balen (boning) | spiral çelik 1/4" (6mm), 3/8", 1/2" ABD · 4/5/6/7 mm UK-CA. Ön-kesilmiş spiral **29 boy, 4"–18"**; düz yaylı çelik **23 boy, 6"–17"** | Bias Bespoke | ikincil; **tek tek basamaklar ÇEKİLEMEDİ — DOĞRULANMADI** | 5 |
| **Busk** (korse önü açma) tam merdiven | **6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13, 13.5, 14, 15, 16 in** (14"e kadar ½" adım, sonra 1") | Bra-Makers Supply | ikincil | 5 |
| Busk, metrik-doğuştan merdiven | **20, 23, 26, 28, 30, 32, 33, 36, 38, 40 cm** (adımlar 3,3,2,2,2,1,3,2,2 — düzensiz) | Vena Cava | ikincil | 5 |
| ★ **Kopça sayısı = busk boyunun basamak fonksiyonu** | 2 kopça @ 9cm · 3 @ 12 · 4 @ 16 · 6 @ 32–38 · 7 @ 40–48 cm | Vena Cava | ikincil ama **doğrudan konuya ait ve başka yerde yayınlanmamış** | 5 |

⚠ Kuşgözü numarası bir **AD**dır, ölçü değil: #00 "3/16 inç" diye anılır ama
4.5mm (=0.177") deler. Numara→mm **daima tablo**, asla aritmetik.
⚠ İki uyumsuz kuşgözü merdiveni dolaşıyor: dikiş sektörü (4.5/6/7/9mm, bitmiş
delik) ve endüstriyel bağlantı sektörü (Stimpson/Siska, .135"/.175"/.185"/.215",
gövde iç çapı). **Birleştirilmez.** Korsecilik pratikte tek/iki basamakta
yaşıyor (#00/#0 ya da UK 4mm/5mm) — ve Farthingales **#00 ile #0'ın iç
deliğinin AYNI olduğunu**, yalnız flanş dış çapının değiştiğini söylüyor.

---

## F. ÇENTİK YERLEŞİMİ VE TOLERANSI

| EŞİK | KAYNAK | SAYI / KURAL | GÜVEN | V5 |
|---|---|---|---|---|
| **Çentik eşleşme TOLERANSI** (bir çentik çifti ne kadar kayabilir) | ASTM · ISO · Gerber · Lectra · Optitex · kitaplar | — | **YAYIN YOK** — hiçbir standart, satıcı dokümanı ya da ders kitabında bulunamadı | 1? |
| Bir dikiş boyunca çentik **ARALIĞI** ya da köşeye **minimum uzaklık** | Open Library tam-metin | — | **YAYIN YOK** ("No Search Inside text matched your search") | 1? |
| Çentik **DERİNLİK** üst sınırı (dolaşan "1/8" ya da 3mm") | — | — | **YAYIN YOK.** Open Library `"notches" "should not be deeper than"` yalnız kiriş/inşaat sonucu veriyor | 1? |
| **ASTM D6673-10 katman şeması — çentik türleri** | Patro 0.3.0 dokümantasyonu §9.1.2 "DXF ASTM File Format" (D6673-10 tablosunu birebir basıyor) | **katman 4** = notch, V-notch ve slit-notch, hizalama ("I-shape or V-shape") · **80** T-notch · **81** Castle notch (U, eşit genişlik, dikdörtgen uç) · **82** Check notch (V uçlu, bir yanı sınıra dik) · **83** U-notch (U, yarım daire uç). Diğerleri: 1 parça sınırı · 2 dönüş noktaları · 3 eğri noktaları · 5 grade referansı · 6 ayna çizgisi · 7 grain · 8 iç çizgiler · 11 iç kesikler · 13 matkap delikleri · 14 dikiş çizgileri · 15 metin · 84–87 kalite doğrulama eğrileri | **birincil** (açıldı, tam tablo okundu) | 1?, 5? |
| Çentik **geometrisi** DXF'te nasıl taşınır | Dorthe Hansen, "ePattern ASTM Standard" PDF (2011/12) | DXF POINT üstünde: **grup 30 (Z) = derinlik** (açının yönünde, taban noktasından) · **grup 39 (thickness) = sınırdaki genişlik** · **grup 50 = açı**, X eksenine göre CCW | **ikincil** — PDF FlateDecode, metin çıkarılamadı; snippet'ten | 1? |
| **ASTM D6673-10 GERİ ÇEKİLDİ (2019)** ve ücretsiz değil. AutoCAD v13 DXF spesifikasyonuna uyar. Selefi ANSI/AAMA-292 (1993) | ASTM katalog kaydı; ezdxf GitHub Discussion #789 (standart metnini alıntılıyor) | — | birincil (ezdxf alıntıları), ikincil (geri çekilme statüsü) | — |
| ★ **Yalnız ASTM DXF çentik BOYUTUNU taşır**; AAMA DXF "is not clearly defined in all points so that significant differences may occur during interpretation by different CAD systems" | GRAFIS online help, "Export formats and their characteristics" | nitel | **birincil** (açıldı, okundu) | — |
| Optitex çentik parametreleri | Optitex Help Center, Notch Properties | **derinlik, genişlik, üst genişlik, açı**; "usually the width is twice the depth" | ikincil (sayfa 301'lendi, snippet) | 1? |
| Sanayi standardı fiziksel kalıp çentikleyicisi | Cutex Sewing Supplies, "Professional Pattern Paper Notcher 1/8" x 1/4"" | **1/8" genişlik × 1/4" derinlik** | **birincil** (ürün sayfası açıldı) | 1? |
| CAD ihracat konvansiyonu (kendisi standart olmadığını söylüyor) | MPattern, "Export CAD Patterns to DXF AAMA/ASTM" | tek çentik **3 mm**, çift çentik **6 mm** çizgi parçası | birincil ama kaynağın kendi çekincesi var | 1? |
| Yayınlanmış tek YERLEŞİM kuralı | In the Folds, "Notes on: Notching patterns", 9 Oca 2017 | **"aynı köşenin iki kenarını birden çentikleme — hem kalıbı hem kumaşı zayıflatır"** (SAYI YOK; yazıda hiç sayı yok, doğrulandı) | birincil | 1? |
| Çentik derinliği dikiş bütünlüğü | Fashion-Incubator, "How many notches are too many?" | çentik dikiş payının içinde kalmazsa **"seam blowout"** | ikincil (snippet, sayfa 403) | 1? |

★ **TÜRETİLEBİLİR KURAL (kaynak gerekmez):** bulunan tek sert sayı fiziksel
çentikleyicinin **1/4" derinliği** ve o, 1/4"'lük bir dikiş payından **daha
derin** — yani tam olarak Fasanella'nın anlattığı "seam blowout" hâli. Buradan
kaynak gerektirmeyen bir kapı çıkar: **çentik derinliği < dikiş payı.**
Bizim payımız Buğra'da **10mm kanıtlı** (satıcı talimatı s.3/4/7/8/9/11).

---

## KART DIŞI FARK EDİLEN

1. ★ **Aldrich kol kapağı ease SAYISI YAYINLAMIYOR.** `knowledge/drafting-math-eu38.md`'nin
   §"Sleeve cap" bandı ("dokuma fitted 3-4.5cm … elbise/bluz 2-3cm") HIGH etiketli
   ve Aldrich'e yakın duruyor; Aldrich 4. baskının tam metni iki kitapta da yalnız
   *"drafted to give a full rounded appearance"* diyor. **Bu, o dosyanın kendi
   17 Ağu denetiminin yakaladığı sınıfın (gözlem→çıkarım kaynaştırma) bir örneği
   daha olabilir.** Bandın gerçek sahibi Joseph-Armstrong. Dosyaya DOKUNULMADI.

2. ★ **`drafting-math-eu38.md` HIGH etiketi artık HAK EDİLDİ (armscye depth + dart +
   tablo).** Wiley'in ücretsiz 6. baskı örneğiyle 10/10 doğrulandı. O dosyanın
   başındaki "alıntı-doğrulaması AÇIK" çekincesi kapatılabilir — karar Damla'nın.

3. ★★ **ALDRICH'İN KENDİSİ ÜÇ AYRI ÇİZELGE BASIYOR VE ÇELİŞİYORLAR.** 6. baskı
   Bölüm 1'de: **s.10** (High Street genç moda) **büst 88 = beden 12**, **s.11**
   (standart kadın) **büst 88 = beden 10**. Aynı kitap, aynı bölüm, ters eşleme.
   Ve sayılar da farklı: s.10'da büst 88 için **üst kol 28.5** (s.11: 28.4), **bel
   68** (s.11: 72), **kalça 94** (s.11: 96). Üçüncü çizelge s.12'de XS–XL.
   `drafting-math-eu38.md`'nin "beden kodu tuzağı" uyarısı **eksik**: tuzak
   baskılar arası değil, **aynı bölümün iki sayfası arasında**.

4. ★ **Aldrich s.19'da bir DİKİŞ PAYI bölümü var** (s.13 birebir: *"There is no seam
   allowance included in the blocks. These are added after the pattern is
   constructed. See the section on seam allowances on page 19."*). 6. baskı
   örneğinde s.19 yok, 4. baskıda aranmadı. **Kart A'nın (üretim toleransı)
   en yakın işlenmemiş damarı budur.** Ayrıca 6. baskı blok sayfaları:
   yakın oturan bodice **s.62**, easy fitting **s.64**, tek parçalı kol **s.70**.

5. ★ **`contract/tables.json` `shoulderCM` kolonu bu turda BAĞIMSIZ OLARAK BİR KEZ
   DAHA ÇÜRÜDÜ.** Yayınlanan her sistem (Aldrich 11.75–14.2 · Müller tanımı ·
   Wolcott 12.1–13.0) omzu **tek dikiş** olarak veriyor. Repodaki 36–42cm bir
   vücut ölçüsü olarak hiçbir yerde yok. `eu-beden-cizelgesi-kaynak-2026-08-17.md`
   §3(4) ile aynı hüküm, farklı kaynaklardan.

6. ★ **ANSUR II'de PDF'i WebFetch'e özetlettirmek YANLIŞ SAYI ÜRETTİ.** İşçi ölçtü:
   özetleyici kadın bideltoid için 374/410/450 mm döndürdü, ham PDF metni
   **406/450/499** diyor — **32–49 mm sapma, bir beden.** Baş çevresi 2–4 mm
   saptı. **Daha önceki bir oturum PDF'ten WebFetch ile antropometrik sayı
   çektiyse, o sayılar yeniden kontrol edilmeli.**

7. ★ **ANSUR II TR-15/007 CİNSİYETE AYRILMIŞ DEĞİL** — "kadın raporu" diye
   anılıyor ama her tabloda iki cinsiyet yan yana. TR-15/012'ye gerek yok.
   Ve **n = 1986 K / 4082 E** (3922/7435 toplam anket boyu, gizlilik-elenmiş
   yayın alt kümesi değil). Sayıları alıntılarken 1986/4082 yazılmalı.

8. ★ **Bideltoid, baş çevresinden ~2.5× daha az tekrarlanabilir** (ANSUR II
   gözlemciler-arası hata: baş çevresi 1.62–2.59 mm, bideltoid 4.40–4.64 mm).
   Bir toleransa göre tasarlanacaksa bu önemli.

9. ★ **DXF ihracatımız için gerçek bir risk:** GRAFIS açıkça yazıyor ki **yalnız
   ASTM DXF çentik boyutlarını korur**; AAMA belirsiz. `ENV.md` ve CLAUDE.md
   "DXF-AAMA export" diyor → çentik derinlik/genişlik/açısı alıcı CAD'de
   düşüyor ya da yeniden yorumlanıyor olabilir. Ayrıca AAMA gradeli bedenleri
   **ayrı bir `.RUL` dosyasına** yazıyor; tek DXF gönderiyorsak alıcı sistem
   yalnız baz bedeni okuyabilir. **KONTROL EDİLMEDİ.**
   Ve ASTM D6673-10'un kendisi **geri çekilmiş (2019)** — "standarda uygun
   ihracat" iddiası kurulacaksa dürüst ifade: *"her CAD satıcısının hâlâ
   uyguladığı (geri çekilmiş) ASTM D6673-10 katman konvansiyonuna uyar."*

10. ★ **Aldrich'in "close-fitting"i Big-4'ün "fitted"idir.** Aldrich yakın oturan
    bodice = +10 cm büst = **3.94"** → Threads/Big-4 tablosunda **"fitted"** (3–4"),
    "close-fitting" değil. Aldrich easy fitting = +14 cm = 5.5" = Big-4'te
    **"loose-fitting"**. **Sözcükler iki sistem arasında taşınmaz.**

11. ★ **Tek bir düz çevre payı iki gelenekte de YANLIŞ:** Joseph-Armstrong'da
    koltukaltı seviyesi **13.25 cm** pay taşırken büst seviyesi **8.25 cm**
    (Aldrich'te de blok göğüs hattında büstten gevşek). Motorumuz tek `garment_ease`
    çarpanı uyguluyorsa göğüs hattında yanlış. (Armstrong sayıları **ikincil,
    DOĞRULANMADI** — üçüncü taraf analizi.)

12. ★ **Aldrich büyük bedenlerde ön ve arka boyu AYIRIYOR**: `NAPE TO WAIST`
    beden 22'den sonra 43 cm'de düzleşiyor, `FRONT SHOULDER TO WAIST` büyümeye
    devam ediyor (43→46.3). Motor ön=arka boy varsayıyorsa beden 20 üstünde
    kırılır. **KONTROL EDİLMEDİ.**

13. ★ **Aldrich pensi bir VÜCUT ÖLÇÜSÜ satırı olarak basıyor** (5.8/6.4/**7.0**/7.6/
    8.2/8.8/9.4/10/10.6/11.2 cm) ve ön genişlik formülü **"3–22 half chest
    measurement plus half width of dart"**. Yani pens kaynaksızsa ön blok tanımsız.
    `contract/tables.json`'da pens kolonu **YOK**.

14. ★ **Fermuar boy merdiveni fiziksel kısıt DEĞİL.** Idatex 5 cm'den itibaren
    her boyu kesiyor; Core Fabrics müşteriye kendi stopunu zikzakla dikmesini
    söylüyor. stitchu bunu sert kısıt sayarsa bu bir **ürün kararıdır**, olgu değil.

15. ★ **Perakende filtre sayfaları YALAN SÖYLÜYOR:** Zipper Stop'un ayrılabilir
    filtresi 7"–250" gösteriyor (bütün SKU'ların birleşimi), gerçek #5 nylon-coil
    stoğu yalnız 30" ve 36". Filtre kazıyarak hiçbir ürünün sunmadığı bir
    merdiven kurulur.

16. ★ **Repo İKİ ayrı üretim toleransı taşıyor ve bu turda ikisi de görüldü:**
    `surfacepattern.cpp:19 kProdTolMM = 0.79375` ve
    `engine/src/validator.hpp:23 pairedSeamTolerance = 3.0`. İkincisi
    **CLO3D'nin yayınlanmış varsayılanıyla birebir aynı sayı**. Hangisinin
    hangi kapıda koştuğu bu turda haritalanmadı.

17. **Kart dışı ama önemli — TEKRAR ARAMAYI ÖNLEMEK İÇİN:** `GECE/V3-R.md` grep'te
    1/32" için zaten bir araştırma turu taşıdığı görüldü (satır 95–136, 269:
    "1/32 inch pattern making tolerance", yüzdeye düşürme aritmetiği). O dosya
    bu işçiye kapalıydı, **açılmadı ve okunmadı**; bu turun A bölümü onu bilmeden
    koştu. Bir sonraki şef ikisini karşılaştırmalı.

---

## ERİŞİLEMEYENLER (bir daha aynı kapıya vurulmasın)

- **403 / duvar:** ScienceDirect · MDPI doğrudan · tandfonline · core.ac.uk ·
  ResearchGate · SAGE · SpringerLink · archive.org tam-metin arayüzü ·
  web.archive.org · sewing.patternreview.com · **fashion-incubator.com (tamamı)** ·
  **support.clo3d.com** · astm.org · wawak.com (alan adı geneli) ·
  corsetmaking.com · biasbespoke.com · buygrommets.com · minervapatterns.com ·
  threadsmagazine.com HTML (ama **kendi PDF'i açıldı**)
- **Paywall:** ASTM D5585-21 · ISO 7250-1 · DIN 33402-2 · M. Müller & Sohn kadın
  ölçü çizelgesi (16 sayfa, 2. bs. 3/2019) · Aldrich 5. baskı (Wiley örneği yok)
- **İndirildi ama okunamadı:** Stimpson kuşgözü kataloğu (**yalnız görüntü, metin
  katmanı yok — GÖZLE okunabilir, tek gerçek birincil kuşgözü kaynağı**) ·
  Dorthe Hansen ePattern PDF (FlateDecode) · YKK Americas fermuar el kitabı
  (taranmış görüntü) · ANSUR 1988 TR-89/044 (~50MB tarama, indirme yarıda kesildi)
- **Hiç aranmadı:** NASA-STD-3000 / MSIS · CAESAR · SizeUK · SizeGERMANY ·
  kask/başlık PPE standartları (EN 397, EN 812, ACH — **baş geçiş zarfının
  kodlanmış olma ihtimali en yüksek yer**) · Cooklin · Helen Stanley ·
  Handford (Open Library tam-metin indeksinde HİÇ YOK) ·
  **EN 13402-3** (Aldrich s.10 onu ADIYLA anıyor; AB resmî oyuk/omuz tablosuna
  ücretsiz giden en umut verici keşfedilmemiş yol)
- **Müller kadın Maßberechnung sayfası 404** — yalnız erkek versiyonu yayında.
