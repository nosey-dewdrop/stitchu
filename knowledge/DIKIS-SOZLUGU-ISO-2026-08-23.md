# DİKİŞ TARZI SÖZLÜK — ISO 4915 / 4916, ve dünyanın kapatamadığı boşluk

Damla: *"sözlüğü tekrardan bust/kol/heartneck gibi şeylerden yapmayalım, hep DİKİŞ
TARZIYLA ilerleyelim."* — **Bunun uluslararası standardı var.** Aşağıda.

---

## 1. ISO 4916:1991 — DİKİŞ (SEAM) TİPLERİ · 5 haneli kod
Örnek PDF (tam scope + sınıflandırma + kodlama açık):
https://cdn.standards.iteh.ai/samples/10934/567c9b0eefce4b70bc4098a1e0b9e6c3/ISO-4916-1991.pdf

**Tanım (birebir):** "seam: The application of a series of stitches or stitch types to
one or several thicknesses of material."

**Sınıflandırma — 8 sınıf, bileşen SAYISI ve KENAR SINIRLILIĞI'na göre.** Bu bir isim
listesi değil, bir TOPOLOJİ:
- Sınıf 1: "minimum of two components, both limited on the same side."
- Sınıf 2: "one is limited on one side and the second on the other side… opposite and
  at different levels and overlap each other."
- Sınıf 3: "one limited on one side with the second, limited on both sides,
  **straddling the edge** of the former."
- Sınıf 4: "opposite and on the same level."
- Sınıf 5: "minimum of one component **unlimited** on two sides."
- Sınıf 6: "only one component limited on one side."
- Sınıf 7: "one is limited on one side and all others are limited on two sides."
- Sınıf 8: "minimum of one component limited on two sides."

**Kodlama (birebir):** "Each stitched seam is identified by a numerical designation
composed of five digits… First digit: Classes 1 to 8. Second and third digits:
Counting numbers 01…99 to indicate differences in **material configuration**.
Fourth and fifth digits: Further counting numbers 01…99 to indicate differences in
**location of needle penetrations** and/or **mirror images**."

**Çizim dili (bizim primitiflere birebir çevrilir):**
- "An **unlimited** material edge is denoted by a **wavy line**"
- "A **limited** material edge is denoted by a **straight line**"
- "The penetration(s) or passage(s) of the needle is denoted by a straight line."

## 2. ISO 4915:1991 — DİKİŞ (STITCH) TİPLERİ · 3 haneli kod
https://cdn.standards.iteh.ai/samples/10932/49dcbdca6036446bacaac82c74211176/ISO-4915-1991.pdf
6 sınıf: 100 zincir · 200 el kökenli · 300 düz (lock) · 400 çok iplikli zincir ·
500 overlok · 600 kaplama. "First digit = class, second and third = type within class."
Birleşim yazımı: `401.502`; tek operasyonda ise `(401.502)`.

Topolojik tanımlar (geometri motoruna doğrudan girer):
- **intralooping:** "passing of a loop of thread through another loop by the same thread"
- **interlooping:** "…through another loop formed by a **different** thread"
- **interlacing:** "passing of a thread over or around another thread"

## 3. Coats — ISO sınıflarının düz karşılıkları + uygulama
https://cdn.coats.com/wp-content/uploads/Seam-Types.pdf
1 Superimposed · 2 Lapped · 3 Bound · 4 Flat · 5 Decorative · 6 Edge finishing ·
7 Attaching separate items · 8 Single ply.
**"Class 3 (bound) application: Necklines of t-shirts."**
Örnek tam kod: serging = **6.01.01**.
Kural (birebir): "For the seam specification to be meaningful, the designation of the
**stitch type has to be added after** the designation of the stitched seam."
→ Yani sanayi zaten `seam kodu + stitch kodu` çiftiyle konuşuyor: `1.01.01 + 301`.

---

## 4. ★ DÜNYANIN KAPATAMADIĞI BOŞLUK — ürün fırsatı tam burada

Araştırmanın en sert cümlesi:
> "commerce taxonomies are style-name enums with **zero** numeric parameters;
> tech packs are numeric with **zero** style enums. **Nothing in the public record
> bridges them.**"

- **Shopify Standard Product Taxonomy** (açık, makine-okunur, https://github.com/Shopify/product-taxonomy):
  `neckline__*` = asymmetric · bardot · boat · cowl · crew · halter · hooded ·
  mandarin · mock · plunging · round · split · square · sweetheart · turtle · v_neck · wrap.
  `sleeve_length_type__*` = 3/4 · cap · long · short · sleeveless · spaghetti · strapless.
  **Kol ŞEKLİ yok** — puff/raglan/dolman/bishop/bell hiçbiri taksonomide geçmiyor.
  Ve hiçbirinin sayısı yok.
- Tech pack tarafında sayı var, isim yok.
- **"There is no ISO/ASTM standard for neckline or sleeve style names."** (araştırmacı
  bu iddianın arkasında durabileceğini yazmış)

→ stitchu'nun mutfağı tam olarak bu köprü. Katman 3 (isim) ↔ Katman 1 (sayı+kod).
Dünyada emsali olmadığı için bu bir wrapper değil.

---

## 5. HEMEN KULLANILACAK GEOMETRİ KURALLARI

**Yaka = iki skaler + bir eğri.** Team Sunday: "Depth and width are the two levers."
Orvis POM'ları: `23 Neck Width` (seam-to-seam ya da inside) · `28 Front Neck Drop`
("HPS straight down to front neck edge") · `29 Back Neck Drop`.
Emma Fryer anahtarında **"K. Front neck curve"** ve **"L. Front neck drop"** AYRI
POM'lar → yay uzunluğu + kiriş derinliği + genişlik ≈ eğriyi geri kurar.
ASTM D5219 sözcük kuralı: **"height" = dikey, "length" = kontur boyunca.**

**★ RULE OF 10 — hesaplanabilir geçerlilik testi.** Sally Melville (Sister Mountain,
https://www.sistermountain.com/blog/designing-sweater-necklines): yaka genişliği +
ön derinlik **≥ 25.5cm (10")** olmalı ki kafa geçsin. Bu bizim `wearable_check`
geçiş şartının yayınlanmış karşılığı.

**★ BOLLUK (gather/puff) SANAYİDE ORAN DEĞİL, İKİ ÖLÇÜM.**
Orvis `17a` sleeve opening (relaxed) vs `17b` "Extended… **with all fullness pulled
out**". Aynısı `24 Neck Width Extended`. Oran TÜRETİLİR.
→ Bizim `ruffle katsayısı` eksiğinin doğru temsili: `(relaxed, extended)` çifti.
"1.5x fullness" dili yalnızca kalıpçılık tarafında; tech pack'te yok.

**★ STİL ADI, ÖLÇÜM DEĞERİNİ DEĞİL ÖLÇÜM YORDAMINI DEĞİŞTİRİYOR.** Üç kanıt:
- dolman → göğüs, koltukaltının 1" altından değil, **HPS'den X" aşağıdan** ölçülür (Orvis 1c)
- raglan → kendi POM'u var: "HPS to underarm seam, straight line" (Orvis 14d)
- örme vs dokuma → armhole **düz** vs **çevre** (Orvis 14a/b)
→ Üretecimiz sayının yanında **yordam** da yayınlamalı.

**★ HER DİKİŞ KIRIĞI YENİ BİR POM DOĞURUR** (Alison Hoenes) — "write one POM for
sleeve length to the cuff and a **separate** POM for the cuff length."
Bu bir liste değil, bir **ayrıştırma algoritması**. Katman 2→1 çözümü buradan kurulur.

**Kol oyuğu ↔ biceps ↔ kapak yüksekliği üçlüsü bağlı:**
"One of the 3 measurements will be the result of the other two."
(https://dresspatternmaking.com/blog/understanding-the-sleeve-part-3)
Yani üçünü birden şart koşan bir kapı AŞIRI BELİRLENMİŞ olur — ikisi seçilir.
Cap height / armhole depth oranları: deep %75 · medium %66 · shallow %50
(Richardson, https://sewingwithnumbers.substack.com/p/how-to-draft-t-shirt-sleeves).

**Yaka gradesi:** "When we use a 1" grade, we typically grade the neckline a total of
1/2"." (fashion-incubator). Gerçek graded spec'te görülen: yaka genişliği +1/4"/beden,
ön yaka düşüşü +1/8"/beden (RAW Giving, https://rawgiving.com/wp-content/uploads/2019/05/size-chart.pdf).

**CB'de yaka düz başlar:** "At least the first 3cm from the c.back should be a
completely straight line and then you can curve." — teğet şartı, şekil geçerliliği.

## 6. DOĞRULANMADI
- Aldrich yaka formülleri (`boyun/5`) yalnızca arama özetinden; birincil alıntı açılamadı.
  Ama textilelearner raglan draftı bağımsız olarak "1/5th Neck" ve "1/6th Neck"
  kullanıyor → formül ailesi destekleniyor.
- Puff 2:1 büzgü oranı, cap sleeve %15 — kaynak sayfaları doğrudan çekilemedi.
- ASTM D6193 harf kodları (SS/LS/BS/FS/OS/EF) ikincil kaynaktan; ASTM metni paywall.
- **ASTM D5219 2024'te GERİ ÇEKİLDİ**, yerine geçen ilan edilmemiş. Onu "apparel
  terminoloji standardı" diye anmak kırılgan bir atıf.
- Orvis PDF'i Kasım 2010; hâlâ Orvis CDN'inde ama tarihsel muamele gör.

## 7. BULUNAMAYAN — arayıp durmayalım
- **Yaka adı → (genişlik, derinlik) sayı tablosu KAMUYA AÇIK OLARAK YOK.**
- Sweetheart/halter/square/bateau'nun POM karşılığı hiçbir yerde yok. Sweetheart
  iki parametreden fazlasını istiyor (eğri yarıçapları + tepe yüksekliği + CF çukuru)
  ve kimse yayınlamıyor. Shopify'da KELİME var, geometri yok.
- Kol stilleri için parametrik aile tablosu yok.
- PLM satıcılarının (Centric, Bamboo Rose, Backbone, Techpacker, Delogue) attribute
  kütüphaneleri login arkasında. Shopify tek açık makine-okunur taksonomi.
- Fashionpedia bir **isim+illüstrasyon** sözlüğü, ölçü sözlüğü DEĞİL.
