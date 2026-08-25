# V6-R — ARAŞTIRMA: VLM→giysi JSON şeması + konumlu edit dili

KART: `GECE/KART/V6-R.md`. Kod YAZILMADI, hiçbir dosya değiştirilmedi.
Bu dosya kaynaklı HÜKÜM tablosudur; öneri değildir.

**Sayı disiplini:** aşağıdaki her sayı, kaynağın HTML gövdesinde birebir görülüp
kopyalanmıştır (arXiv HTML sürümü `curl` ile çekilip düz metne indirildi, grep ile
alıntılandı). PDF özeti kullanılmadı. Görülemeyen sayının yerine
**"metinde bulunamadı"** yazıldı, tahmin edilmedi.

---

## 1. ChatGarment — VLM → GarmentCode JSON

**KÜNYE:** Siyuan Bian, Chenghao Xu, Yuliang Xiu, Artur Grigorev, Zhen Liu, Cewu Lu,
Michael J. Black, Yao Feng. *ChatGarment: Garment Estimation, Generation and Editing
via Large Language Models.* CVPR 2025. arXiv:2412.17811.
URL (okunan): https://arxiv.org/html/2412.17811v2 · proje: https://chatgarment.github.io/
**LİSANS:** kod `github.com/biansy000/ChatGarment` → **Apache-2.0** (GitHub API'den
okundu). Makale arXiv perpetual non-exclusive license. Altındaki GarmentCode
(maria-korosteleva/GarmentCode) → **MIT** (GitHub API).
**GÜVEN:** birincil (makale HTML gövdesi + GitHub API).

### 1.1 Şemayı VLM için NASIL sadeleştirdiler?

Birebir alıntı (§3, arXiv HTML v2):

> "optimize this by automatically removing irrelevant settings during garment
> construction (e.g., omitting skirt-related parameters for upper-body garments).
> This adjustment reduces the average language token count from **900 to 350**,
> decreasing ambiguity in LLM training and improving training efficiency.
> Furthermore, to stabilize model training, we normalize all floating-point values
> to a [0,1] range"

Üç ayrı sadeleştirme, üçü de bizim ayrımlarımızla eşleşiyor:

1. **KOŞULLU ALAN BUDAMA** — üst beden giysisinde etek parametreleri JSON'a hiç
   girmiyor. Alanlar statik değil, `meta`'ya bağlı.
2. **FLOAT NORMALİZASYONU [0,1]** — her sürekli değer birimsiz 0..1'e çekilmiş.
3. **SAYIYI DİLDEN AYIRMA** — sayılar metin olarak üretilmiyor:

   > "we encode these numerical values into a single token and train an MLP
   > projection layer to decode them into precise numbers. Those numbers, combined
   > with the VLM's language output, are formatted into the final JSON file."

   Eğitim cevaplarında bütün float'lar `"0"` ile değiştiriliyor
   ("[Sewing pattern without floats] refers to a JSON configuration where all float
   values are replaced with '0'").

### 1.2 Şema iskeleti (Ek S1.1'den BİREBİR)

```json
{ "meta": { "upper": "None", "wb": "None", "bottom": "Pants" },
  "pants": { "length": 0.203, "width": 0.062, "flare": 0.516, "rise": 0.816,
             "cuff": { "type": "None" } } }
```

Kıyafet birleşimi ayrı sarmalayıcı: `upperbody_garment` + `lowerbody_garment`,
ya da tek `wholebody_garment`.

**Kaç alan?** ChatGarment metninde alan SAYISI verilmiyor — sadece token sayısı
(900→350). **Alan sayısı yayınlanmış metinde bulunamadı.**

### 1.3 Enum mü sürekli mi?

**İKİSİ BİRDEN, ama AYRI KANALDAN.** Enum'lar (garment tipi, `cuff.type`, `collar type`)
dil kanalından metin olarak; sürekli nicelikler ayrı bir token + MLP projeksiyon
katmanından sayı olarak geliyor. Yani ChatGarment **topoloji/nicelik ayrımını bizim
gibi yapıyor ama ayrımı ŞEMADA değil MİMARİDE kuruyor.**

### 1.4 JSON şema doğrulaması NEREDE?

**HİÇBİR YERDE.** `cg.txt` (79.834 karakter, tam makale + ek) içinde
`validat`, `schema`, `constrain`, `grammar` kelimelerinin GEÇTİĞİ TEK BİR CÜMLE YOK
(grep, 0 eşleşme). Kapalı enum yok, red yolu yok, `additionalProperties:false` yok.
Onların "güvenliği" iki tanesi: (a) budama ile alan uzayını küçültmek,
(b) sayıyı dilden çıkarıp projeksiyon katmanına vermek.

**HÜKÜM:** `contract/garment-spec-v2.json` §_law 1-2-3'ün (kapalı enum + sessiz ikame
YASAK + operatör sicili ile RED) **yayınlanmış bir emsali ChatGarment'ta YOKTUR.**
Bu bizim eksiğimiz değil, onların eksiği: makale sonuç bölümünde kendisi
"it may struggle with precise garment editing" diyor. Bizim sicil/red yolumuz
literatürde boş bir yeri dolduruyor — ama bu "kimse yapmamış" demek DEĞİL, sadece
"bu üç makale yapmamış" demektir (bkz. §3, constrained decoding tarafı bunu yapıyor).

### 1.5 Bildirilen isabet oranları ve PAYDALARI

Bütün paydalar makale gövdesinden birebir:

| Deney | Payda (birebir) | Sayı (birebir) |
|---|---|---|
| Görüntüden geri çatma, Dress4D | "4 loose-fitting outfits and **36 images** rendered from these outfits" | Ours CD **3.12** / F-Score **0.75** (Target-Pose); CD **3.06** / F **0.78** (A-Pose); Failure Rate **0** |
| Görüntüden geri çatma, CloSe | "we use **145 scans** from the CloSe dataset as our validation set" (CloSe toplamı 3.167 tarama, 18 kategori) | Ours CD **2.94** / F **0.790** / Failure Rate **0**; GarmentRecovery CD **2.39** / F **0.785** |
| **Edit** | "This dataset consists of **135 garment pairs**" | Ours CD **2.51** / F-Score **0.893**; DressCode 10.97 / 0.750; SewFormer 28.77 / 0.548 |
| Metinden üretim | "**150** highly diverse text labels from **85** selected in-the-wild images" | CLIP score Ours **23.7** vs DressCode **22.8** |

⚠ **PAYDA TUZAĞI, birebir alıntı:**
> "In some cases, previous methods may fail to reconstruct certain garments due to
> detection or stitching failure. **We exclude such samples from the calculation of
> chamfer distance and F-Score**, considering only those with complete outfits"

Yani CD/F-Score tabloları **her yöntem için farklı bir alt kümede** hesaplanmış:
SewFormer CloSe'de %8.33, DressCode %7.0 başarısızlık oranıyla, o örnekler
düşürülerek. Kendi yöntemleri 0 başarısızlık verdiği için tam payda üstünde.
**Bu tablolar aynı payda üstünde bir kıyas DEĞİLDİR.** F-Score eşiği τ = 0.001.

### 1.6 In-the-wild zaafı (kendi itirafları, birebir)

> "ChatGarment occasionally struggles to edit specific garment parts without
> affecting other areas. For example, when adjusting the length of a skirt as
> requested, slight unintended changes may occur in the upper-body T-shirt."

> "Figure S4: Failure cases ... ChatGarment might change the irrelevant garment
> parts (**TOP: collars and sleeves**). And ChatGarment occasionally misinterprets
> the garment details (BOTTOM: skirt style)."

Sonuç bölümü:
> "While ChatGarment excels in many areas, it may struggle with precise garment
> editing. For instance, altering the skirt length might unintentionally affect
> other parts of the garment."

**HÜKÜM (soru 5'e de bakar):** ChatGarment'ın raporladığı EDIT metrikleri
(CD + F-Score, 135 çift) **giysinin TAMAMI üstünde** ölçülür. Dokunulmayan bölgenin
korunduğunu ölçen HİÇBİR SAYI yayınlamamışlardır — lokallik kusurunu bir
FIGÜRLE itiraf ediyorlar, bir metrikle değil.
`contract/edit-locality-v1.json`'un "bölge dışı panel BAYT-AYNI kalacak" yasası
bu kusurun tam üstüne oturuyor ve **yayınlanmış giysi literatüründe karşılığı YOK**
(görüntü editleme tarafında var — §5).

---

## 2. Design2GarmentCode / SewFormer / NeuralTailor

### 2.1 Design2GarmentCode (CVPR 2025)

**KÜNYE:** Feng Zhou, Ruiyang Liu, Chen Liu, Gaofeng He, Yong-Lu Li, Xiaogang Jin,
Huamin Wang. *Design2GarmentCode: Turning Design Concepts to Tangible Garments
Through Program Synthesis.* CVPR 2025. arXiv:2412.08603.
URL (okunan): https://arxiv.org/html/2412.08603v3 · https://style3d.github.io/design2garmentcode/
**LİSANS:** resmî repo `Style3D/design2garmentcode` → **lisans dosyası YOK**
(GitHub API `license: null`). `Style3D/design2garmentcode-impl` MIT görünüyor ama
resmî olup olmadığı **DOĞRULANMADI**. Altındaki GarmentCode MIT.
**GÜVEN:** birincil (HTML gövdesi).

**Şema kararı — TİP TABANLI KUANTİZASYON (birebir, Denklem 5):**

> t_i = Q(d_i) = { 0/1 eğer d_i **boolean**; d_i eğer **integer**;
> λ·Norm(d_i) eğer **floating number**; Index(d_i, L) eğer **selective variable** }
> "where λ is a scaling factor indicating numerical precision.
> We use **λ = 100** to maintain centimeter-level precision."

Yani DÖRT tip: bool · int · normalize float · **liste içine İNDEKS ile giren enum**.
Ve sabit uzunluk:

> "our token sequence length is fixed to the number of design parameters
> **|D| = 122**, regardless of the complexity of the pattern. This fixed-length
> representation is at least **10×** compact than DressCode, whose sequence length
> is **1,500** and scales with pattern complexity"

**Doğrulama YERİ (birebir):**
> "we incorporate two validation loops: during program synthesis, we employ
> **rule-based validations (7)** to ensure the MMUA's outputs are sufficient for
> generating complete and valid garment programs and design parameters; after the
> initial generation, the MMUA compares the generated design with the input and
> suggests modifications to minimize discrepancies."

**Sayılar + payda (birebir):**
> "We prepared a dataset comprising **150 text prompts and 150 test images**,
> covering a wide variety including tops (**78**), pants (**76**), skirts (**38**),
> dresses (**80**), and suits (**28**)."

| Metrik | DressCode | Ours (metin) | Sewformer | Ours (görüntü) |
|---|---|---|---|---|
| SSR (Simulation Success Rate) | 84% | **100%** | 65.33% | **94%** |
| Agreement | 7.17% | 79.83% | 3.33% | 88.67% |
| Aesthetic | 9.50% | 68.17% | 5.33% | 77% |
| CLIPScore | 0.2386 | 0.2438 | / | / |
| F-Score | 0.616 | / | 0.708 | 0.829 |
| CD | 15.77 | / | 9.7 | 2.091 |
| #Panels | 5.11±1.66 | 6.92±3.10 | 10.11±4.42 | 11.02±4.18 |
| #Stitches | 10.06±3.24 | 18.66±8.64 | 15.81±5.91 | 27.9±9.83 |

SSR tanımı birebir: "the ratio of successfully simulated garments to the total
number of generated sewing patterns".
⚠ **Agreement/Aesthetic insan oyudur ama KAÇ KİŞİNİN oyladığı HTML v3 gövdesinde
geçmiyor** (`participant`, `volunteer`, `user stud`, `questionnair` — 0 eşleşme).
**Kullanıcı çalışmasının paydası yayınlanmış metinde bulunamadı.**

**HÜKÜM:** D2GC'nin tip taksonomisi bizim `topology`(kapalı enum) + `quantities`
(sınırlı skaler + birim) ikili ayrımımızın DÖRTLÜ genişlemesidir ve bizde
**bool ve int tipi ayrı ayrı ilan EDİLMİYOR** — `quantities` hepsini `number`
yapıyor (`garment-spec-v2.schema.json:104-198`, hepsi `"type":"number"`).
λ=100 ile cm hassasiyeti kararı bize UYMAZ: bizim birimimiz mm ve kanıtımız
0.1mm bandında (CLAUDE.md: pens bacakları 119.84 vs 119.73mm). Onların hassasiyet
tavanı bizim ölçüm hassasiyetimizin 10 katı kabası.

### 2.2 SewFormer / SewFactory

**KÜNYE:** Lijuan Liu, Xiangyu Xu, Zhijie Lin, Jiabin Liang, Shuicheng Yan.
*Towards Garment Sewing Pattern Reconstruction from a Single Image.*
ACM TOG (SIGGRAPH Asia) 2023, doi 10.1145/3618319, arXiv:2311.04218.
Kod: https://github.com/sail-sg/sewformer — **GitHub API `license: null`
(SPDX lisansı YOK).**
**GÜVEN:** ikincil — zaafları hakkındaki sayı ÜÇÜNCÜ BİR MAKALEDEN alındı, birebir:

GarmentX (arXiv:2504.20409v1, https://arxiv.org/html/2504.20409v1) gövdesinden
birebir:
> "Previous direct sewing pattern prediction approaches like SewFormer exhibit
> fundamental limitations—their **76.3% simulation failure rate** stems from
> frequent self-intersection panels and erroneous stitch predictions.
> Our method fundamentally resolves these issues, achieving zero failure cases."

⚠ Bu %76.3'ün PAYDASI (hangi test kümesi, kaç giysi) GarmentX HTML gövdesinde
o cümlenin çevresinde **verilmiyor** — **payda doğrulanmadı.** Ayrıca bu bir
RAKİBİN raporladığı sayıdır; SewFormer'ın kendi makalesinden değildir.
Karşılaştır: ChatGarment SewFormer'a CloSe'de **%8.33** stitching failure rate
biçiyor (Tablo 2). İki sayı arasındaki 9× fark, kümelerin ve "failure" tanımının
farklı olmasındandır — **hangisinin doğru olduğu DOĞRULANMADI, ikisi de burada
duruyor.**

Yayınlanmış diğer zaaf ifadeleri (**GÜVEN: ikincil, arama motoru özetinden;
birincil metinde birebir doğrulanmadı — DOĞRULANMADI**): eğitim dağılımı dışına
genelleme zayıf; vücut biçimini hesaba katmadığı için etek/pantolon belde bol
çıkıyor; ön olmayan/dönük pozlarda paneller parçalanıyor.

### 2.3 NeuralTailor

**KÜNYE:** Maria Korosteleva, Sung-Hee Lee. *NeuralTailor: Reconstructing Sewing
Pattern Structures from 3D Point Clouds of Garments.* ACM TOG (SIGGRAPH) 2022.
arXiv:2201.13063.
**LİSANS:** aynı yazarın GarmentCode reposu MIT; NeuralTailor'ın kendi kodunun
lisansı **kontrol EDİLMEDİ.**
**GÜVEN:** ikincil (arama özeti; birincil metinden birebir alıntı çekilmedi).

Metrik ailesi (bizim için asıl kıymetli kısım): **Panel L2** (tahmin edilen ve
gerçek panelin KENAR PARAMETRELERİ arasındaki L2), **Rot L2** / **Trans L2**
(panelin 3B yerleşimi), **#Panel** (panel SAYISININ isabeti), **#Edges** (panel
başına kenar sayısının isabeti), ve dikişler için **precision/recall/F1**.

**HÜKÜM:** NeuralTailor, giysi alanında **topoloji doğruluğunu (panel/kenar sayısı,
dikiş F1) geometrik doğruluktan AYRI ölçen** yayınlanmış emsaldir. Bizim
`walk.py` / `notch_alignment_check` / `compose_check` kapılarımız aynı ayrımı
yapıyor. Onların YAPMADIĞI şey dikişin İKİ TARAFININ UZUNLUĞUNU eşitlemek
(dikiş F1 bir EŞLEŞTİRME metriğidir, bir uzunluk metriği değil) — CLAUDE.md'nin
"green and unsewable" sayısı hâlâ boş bir yerde duruyor.

---

## 3. Yayınlanmış ŞEMA pratiği: enum sınırlama, kaçış değeri, sınır-çifti karışması

### 3.1 Enum sınırlama — VAR, ve giysi alanının DIŞINDA olgun

**KÜNYE:** Saibo Geng, Hudson Cooper, Michał Moskal, Samuel Jenkins, Julian Berman,
Nathan Ranchin, Robert West, Eric Horvitz, Harsha Nori. *Generating Structured
Outputs from Language Models: Benchmark and Studies.* arXiv:2501.10868
(JSONSchemaBench). URL (okunan): https://arxiv.org/html/2501.10868v1
**LİSANS:** arXiv; ölçülen çatılar XGrammar / llama.cpp / Outlines / Guidance —
hepsi ayrı açık lisanslı (**tek tek doğrulanmadı**).
**GÜVEN:** birincil (HTML gövdesi).

Birebir:
> "We introduced JSONSchemaBench, a benchmark comprising **10K real-world JSON
> schemas**"

> "Schemas from GitHub are of various complexities, totaling **6,000 schemas**.
> We split the collection into **trivial (fewer than 10 fields), easy (10–30 fields),
> medium (30–100 fields), hard (100–500 fields), and ultra (more than 500 fields)**"

Kalite sonucu (Tablo 8, birebir):
> "The results in Table 8 show that the constrained decoding, regardless of the
> framework, achieves **higher** performance than the unconstrained setting."

| | Last Letters | Shuffle Objects | GSM8K |
|---|---|---|---|
| LM only | 50.7% | 52.6% | 80.1% |
| XGrammar | 51.2% | 52.7% | 83.7% |
| Llamacpp | 52.0% | 52.6% | 82.4% |
| Outlines | 53.3% | 53.0% | 81.6% |
| Guidance | **54.0%** | **55.9%** | **83.8%** |

**HÜKÜM — bu bizim şemamız için EN AĞIR bulgu:**
Bizim spec'imiz `additionalProperties:false` + 7 kapalı enum ile **41 alan
mertebesinde** (7 topoloji + 19 nicelik + spec/size). JSONSchemaBench'in kendi
sınıflamasında bu **"medium"un altı, "easy" (10–30 alan) ile "medium" (30–100)
sınırında** — yani şu an ölçülen çatıların en rahat çalıştığı bandın içindeyiz.
Şemayı büyütmek (F-B sözlük işi) bu bandı terk etme kararıdır ve bedeli
yayınlanmış: alan sayısı arttıkça coverage düşüyor.
Ayrıca **kısıtlı çözümleme kaliteyi DÜŞÜRMÜYOR, yükseltiyor** (3 görevin 3'ünde) —
yani "enum'u kapatırsak VLM aptallaşır" korkusunun yayınlanmış karşılığı YOK.

⚠ Karşı literatür notu: "format kısıtı akıl yürütmeyi bozar" iddiasını taşıyan
işler de var (ör. *Let Me Speak Freely?*, EMNLP 2024). **Bu makale bu turda
AÇILMADI — DOĞRULANMADI.** İki taraf da masada.

### 3.2 "none/unknown" kaçış değeri — VAR, iki bağımsız emsal

1. **ChatGarment**, birebir: `"meta": { "upper": "None", "wb": "None", ... }` ve
   `"cuff": { "type": "None" }`. Yani **`"None"` bir ENUM DEĞERİDİR**, alanın
   yokluğu değil. Kaçış değeri şemanın İÇİNDE.
2. **`backend/worker.js`** (bizim, 307-351): neredeyse her alan `| null` taşıyor
   ve `outOfVocab` adında bir **dürüstlük kanalı** var:
   > "This is the honesty channel: name what the pattern would need but the fields
   > cannot express."

**HÜKÜM:** `outOfVocab`'ın yayınlanmış bir emsali bu turda BULUNAMADI. ChatGarment
ve D2GC'nin kaçışı "None"dur — yani **model 'bunu ifade edemiyorum' diyemez,
sadece 'yok' diyebilir.** `outOfVocab` bu ikisini AYIRIYOR ve o ayrım
literatürde **yayınlanmış kaynak YOK** durumundadır. (Bu bir novelty İDDİASI
değildir; sadece bu turda emsal bulunamadığının kaydıdır.)

⚠ Ama dikkat: bizim şemamızda `null` ile `"none"` **karışıyor**.
`worker.js` `neckline: ... | null`, `collar.type: "none"`, `sleeveStyle: "none" | null`
üçünü de kullanıyor. `garment-spec-v2.json` tarafında ise `collar: "none"`,
`sleeve: "none"` ENUM DEĞERİ, `null` hiç yok. **İki katman arasında kaçış
değerinin dili farklı** ve bunu köprüleyen bir hüküm dosyası bu turda
görülmedi (kart bana `draft-bridge.js`'i açtırmadı — **ölçülmedi**).

### 3.3 Sınır-çifti karışması (square ↔ boat) — yayınlanmış çözüm YOK

Aranan: yakın iki enum değerinin (square/boat, scoop/crew, cap/short sleeve)
karışmasını ÖLÇEN ya da ÇÖZEN yayınlanmış bir yöntem.
**BULUNAMADI — yayınlanmış kaynak YOK.**
- ChatGarment bu sınıfı hiç ayırmıyor; onun karışma itirafı kaba tanede:
  "mistaking the bottom style of the skirt for pleats".
- D2GC'nin `Index(d_i, L)` kuantizasyonu enum'u bir LİSTE İNDEKSİNE çeviriyor —
  yani komşu indeksler arasında hiçbir semantik yakınlık ilan edilmiyor,
  karışma maliyeti ölçülmüyor.
- Görüntü editleme tarafında da bu bir "attribute" karışması olarak değil,
  CLIP benzerliği olarak toplanıyor.

Bizim `worker.js`'imizde bu boşluk **prompt İÇİNDE, elle yazılmış ayırt edici
kural** olarak kapatılmış (satır 337):
> "BOAT vs SQUARE neckline — a BOAT (bateau) neckline is a WIDE, shallow, gently
> curved or nearly straight line ... A SQUARE neckline drops LOWER with two sharp
> right-angle corners"
ve 342'de bir **öncelik kuralı**: "DEFAULT TO THE COMMON SHAPE ... choose the
closest of {boat, crew, scoop} rather than reaching for a dramatic shape."

**HÜKÜM:** bu prompt mühendisliğidir, ölçülmüş bir çözüm değildir. Yayınlanmış
emsali olmadığı için **kendi ölçümümüzü kurmadan bu kuralların işe yaradığını
İDDİA EDEMEYİZ.** Ölçüm ucuz: sınır-çifti başına N fotoğraflık etiketli bir küme
+ karışıklık matrisi. Bu bir ARAŞTIRMA işi değil, bir ÖLÇÜM işi (CLAUDE.md
ajan disiplini: geometriyle/ölçümle çözülebilen şeyi araştırmaya sorma).

---

## 4. KONUMLU EDİT / yerleşim dili — model ağırlığı olmadan YER ifade etme

**Giysi/CAD alanında "semantik çıpa + oran ofseti" diye ADI KONMUŞ yayınlanmış bir
şema BULUNAMADI.** Ama üç ayrı alanda, aynı fikri kuran YAYINLANMIŞ ve LİSANSLI
emsaller var. Emsali kim kurdu sorusunun dürüst cevabı: **parametrik CAD kısıt
çözücüleri** (SketchGraphs onu veri olarak yayınladı), ve **UI yerleşim dilleri**
(CSS anchor positioning onu bir W3C şartnamesi haline getirdi).

| Emsal | Künye + URL | Lisans | Kurduğu dil | Güven |
|---|---|---|---|---|
| **SketchGraphs** | Ari Seff, Yaniv Ovadia, Wenda Zhou, Ryan P. Adams. *SketchGraphs: A Large-Scale Dataset for Modeling Relational Geometry in Computer-Aided Design.* ICML 2020 Workshop on Object-Oriented Learning. arXiv:2007.08506 · https://github.com/PrincetonLIPS/SketchGraphs | **MIT** (GitHub API) — ama veri: "The original creators of the CAD sketches hold the copyright" (Onshape ToU) | Çizim = **GRAF**: düğümler primitifler (çizgi/yay/daire), kenarlar KISITLAR. Kısıt "bir primitifin BÜTÜNÜNE ya da bir ALT BİLEŞENİNE" (uç nokta / merkez nokta) bağlanır. 15 milyon çizim. | birincil (repo + arama özeti); alt bileşen ifadesi arama özetinden — **birebir makale metninden doğrulanmadı** |
| **CSS Anchor Positioning** | W3C CSS Anchor Positioning Level 1 (Editor: Tab Atkins-Bittner) · https://tabatkins.github.io/specs/css-anchor-position/ · MDN: https://developer.mozilla.org/en-US/docs/Web/CSS/anchor | W3C Document License / MDN CC-BY-SA | `anchor(<anchor-element>? && <anchor-side>, <length-percentage>?)` — **isimli çıpa + kenar + o kenar boyunca YÜZDE**. Tam olarak "landmark + t". | birincil (MDN + şartname URL'i); yüzdenin hangi kutuya göre çözüldüğü **W3C'de hâlâ tartışmalı** (Apple'ın "single track" önerisi vs mevcut şartname) | 
| **FreeSewing** | https://github.com/freesewing/freesewing | **MIT** (GitHub API) | `shiftTowards(point, distance)` / `shiftFractionTowards(point, fraction)` + **isimli nokta id'leri**. Zaten `contract/primitives-v1.json:90` bunu kaydetmiş. | birincil (repo + bizim primitives dosyamız) |
| **GarmentCode** | Korosteleva & Sorkine-Hornung, SIGGRAPH 2023 · https://github.com/maria-korosteleva/GarmentCode | **MIT** (GitHub API) | `Edge.subdivide_len(fractions)` — kenarı ORANLA bölme; `Interface` iki kenar KÜMESİ arasında oran taşır. Zaten `primitives-v1.json:94,121` içinde. | birincil |

**HÜKÜM:**
1. `contract/edit-locality-v1.json`'un yaptığı şey bu emsallerden **FARKLI bir
   soyutlama seviyesindedir.** CSS anchor / FreeSewing / GarmentCode bir NOKTANIN
   nereye konacağını söyler (çıpa + t). Bizim dosyamız bir DÜZENLEMENİN hangi
   PARÇALARA dokunamayacağını söyler (`zoneOf(field) → untouchable regex[]`).
   Birincisi **konum dili**, ikincisi **etki alanı dili**. İkisi aynı şey değil.
2. Bizde **konum dili KATMANI EKSİK** ve bu eksik ölçülebilir:
   `edit-locality-v1.json` 40 alanı 10 bölgeye eşliyor ama bölge içinde
   "NEREYE" sorusunun cevabı yok — "fiyonk ekle **şuraya**"nın "şura"sı
   `cfZone` gibi kaba bir kova. Emsallerin üçü de (CSS %, FreeSewing fraction,
   GarmentCode subdivide) aynı cevabı veriyor: **isimli kenar + 0..1 kesir.**
   Bu bizim `primitives-v1.json` `_birimler.kesir` tanımıyla ("0..1 arası kenar
   üzerindeki konum, yay uzunluğu ile") **BİREBİR aynı**. Yani malzeme bizde
   ZATEN VAR, spec katmanına çıkmamış.
3. Bunların hiçbiri model ağırlığı gerektirmiyor. Kartın vetosu (ağırlık/GPU)
   bu yolu hiç kapatmıyor.

---

## 5. Edit LOKALLİĞİ — "sadece dokunulan bölge değişsin" garantisini ÖLÇEN yöntem

**GİYSİ/KALIP alanında: yayınlanmış kaynak YOK.** (§1.6: ChatGarment lokallik
kusurunu figürle itiraf ediyor, metrik yayınlamıyor; D2GC'nin metrikleri
SSR/Agreement/Aesthetic/CLIP/CD/F — hiçbiri bölge dışını ölçmüyor.)

**GÖRÜNTÜ EDİTLEME alanında: VAR, olgun ve standart.**

**KÜNYE:** Xuan Ju, Ailing Zeng, Yuxuan Bian, Shaoteng Liu, Qiang Xu.
*PnP Inversion: Boosting Diffusion-based Editing with 3 Lines of Code* (Direct
Inversion), ICLR 2024. Benchmark adı **PIE-Bench**.
https://proceedings.iclr.cc/paper_files/paper/2024/file/661caac7729aa7d8c6b8ac0d39ccbc6a-Paper-Conference.pdf
Kod: https://github.com/cure-lab/PnPInversion — **GitHub API `license: null`.**
**GÜVEN:** ikincil — sayılar ve tanım arama motoru özetinden alındı;
**PDF/HTML gövdesinden birebir doğrulanmadı** (kart PDF özetletmeyi yasakladığı
için sayı çekilmedi).

Yöntem: **700 görüntü**, her birinde **elle çizilmiş maske**, **10 edit kategorisi**.
Üç eksende ölçüm:
- **structure** — DINO öz-benzerlik mesafesi,
- **background preservation** — **maskenin DIŞINDA** PSNR / LPIPS / MSE / SSIM,
- **prompt-image alignment** — CLIP benzerliği.

**HÜKÜM — bu bizim kapımız için en doğrudan emsal:**
1. Yayınlanmış lokallik ölçüm KALIBI şudur: **(a) bölgeyi ÖNCEDEN ilan et
   (maske), (b) bölgenin DIŞINDA bir korunma metriği hesapla, (c) bölgenin
   İÇİNDE bir amaç metriği hesapla.** `edit-locality-v1.json` + 
   `engine/tests/edit_locality_check.mjs` bu kalıbın (a) ve (b) ayaklarını
   kuruyor — ilan dosyada, kapı dışarıyı ölçüyor.
2. **AMA bizim eşiğimiz onlarınkinden KATI ve bu bir AVANTAJ, gevşetilecek bir
   şey değil:** onlar sürekli bir görüntüde PSNR/LPIPS ile "ne kadar korundu"
   diye sorar, çünkü difüzyon çıktısı asla bayt-aynı olamaz. Bizim çıktımız
   DETERMİNİSTİK bir poligon JSON'u; **"bayt-aynı" ikili bir cevaptır ve
   ölçülebilir.** Yayınlanmış görüntü tarafının gevşek eşiği bizim için bir
   mazeret DEĞİLDİR.
3. **Bizde EKSİK olan (c) ayağı:** bölgenin İÇİNDE düzenlemenin gerçekten olduğunu
   ölçen bir sayı `edit-locality-v1.json`'da yok. Bölge dışı bayt-aynı + bölge içi
   HİÇ DEĞİŞMEMİŞ bir motor bu kapıyı **YEŞİL geçer**. PIE-Bench'in üç ekseninden
   ikisi bizde var, biri yok. (Bu bir ÖLÇÜM, ölçülmedi — kart kod yazmayı
   yasakladı.)

---

## ŞEMA ADAYLARI (≤5, her biri hangi kaynağa dayanıyor)

Bunlar KARAR değil, kaynaklı adaydır. Hiçbiri kodlanmadı.

**A1 — Koşullu alan budama (`meta` → alt şema).**
ChatGarment'ın birebir ölçtüğü kazanç: irrelevant ayarları giysi tipine göre
otomatik silmek ortalama token'ı **900 → 350** düşürüyor. Bizde bugün
`garment: "skirt"` seçilse bile `topology` şeması `shoulder`/`sleeve`/`collar`'ı
**required** tutuyor (`garment-spec-v2.schema.json:32-40`). JSON Schema'nın
`if/then` ya da `oneOf` dalıyla bu budanabilir.
DAYANAK: arXiv:2412.17811 §3 birebir alıntı.
BEDEL: şema `additionalProperties:false` disiplinini korumak zorunda; dallanma
`gen-spec-v2.mjs`'i büyütür.

**A2 — Nicelik tipini ilan etmek (bool / int / normalize float / enum-indeksi).**
D2GC'nin Denklem 5'i dört tip ayırıyor; bizim `quantities` bloğu hepsini
`"type":"number"` yapıyor. `maxDartDeg` ile `topDartSplitFrac` şemada aynı
tiptedir, oysa biri derece biri kesirdir — birim `contract`ta var, **üretilen
şemada YOK** (`garment-spec-v2.schema.json` içinde `unit` alanı hiç geçmiyor).
DAYANAK: arXiv:2412.08603 Denklem 5 birebir.
UYARI: λ=100 (cm) bize UYMAZ; bizim tabanımız mm ve 0.1mm kanıtımız var.

**A3 — `outOfVocab`'ı SPEC ALANI yapmak (bugün sadece VLM prompt'unda).**
`worker.js:329` onu "honesty channel" diye ilan ediyor ama
`garment-spec-v2.schema.json` `additionalProperties:false` olduğu için
o kanal spec sınırında ÖLÜYOR. ChatGarment ve D2GC'nin kaçışı sadece `"None"`;
"ifade edemiyorum" ile "yok" arasındaki ayrımın **yayınlanmış emsali bulunamadı**.
Bu ayrım `_statuses.absent` + `refusalReason` ile motor tarafında ZATEN var;
eksik olan LLM tarafının o listeye kelime EKLEYEBİLMESİ.
DAYANAK: `backend/worker.js:329` + §3.2 (emsal YOK kaydı).

**A4 — Konum dilini `edit-locality`'ye eklemek: `{edge: <isimli kenar>, t: 0..1}`.**
Üç bağımsız yayınlanmış dil aynı yere varıyor: CSS `anchor(<side>, <percentage>)`,
FreeSewing `shiftFractionTowards(point, fraction)`, GarmentCode
`Edge.subdivide_len(fractions)`. Bizim `primitives-v1.json._birimler.kesir`
tanımı zaten birebir bu. Bugün `edit-locality-v1.json` sadece BÖLGE (kova)
biliyor, KESİR bilmiyor — "fiyonk ekle şuraya"nın "şura"sı çözülmüyor.
DAYANAK: W3C CSS Anchor Positioning L1 · FreeSewing (MIT) · GarmentCode (MIT).

**A5 — Lokallik kapısına ÜÇÜNCÜ ayağı eklemek: "bölge İÇİNDE gerçekten değişti mi?"**
PIE-Bench kalıbı üç eksenlidir; bizde iki tanesi var. Bugünkü
`edit_locality_check` dışarıyı koruyan ama içeride hiçbir şey yapmayan bir
motoru YEŞİL geçirir. Bu bir "boyalı kapı" riskidir
(`garment-spec-v2.json._law` 5'in kendi diliyle).
DAYANAK: PIE-Bench / PnP Inversion (ICLR 2024) üç eksenli kurulum — **GÜVEN:
ikincil, birebir doğrulanmadı.**

---

## KART DIŞI FARK EDİLENLER (dokunulmadı, sadece yazıldı)

1. **`edit-locality-v1.json` 40 alan eşliyor; `garment-spec-v2.json` 7 topoloji
   ekseni + 19 nicelik tanıyor. İKİ DOSYA AYNI ALAN İSİMLERİNİ KULLANMIYOR.**
   `edit-locality`'nin `fieldZones` anahtarları (`sleeveStyle`, `skirtStyle`,
   `neckline`, `hemShape`, `peplum`, `cupSeam`...) ESKİ flat/2B spec'in alan
   isimleridir — `composition.json`'un `specField`'leriyle uyuşuyor,
   `garment-spec-v2`'nin `topology.sleeve` / `topology.skirtShape` ile
   uyuşmuyor. **Hangi spec'in edit'i lokalize edildiği belirsiz.**
   Ölçülmedi, sadece iki dosyanın anahtar listeleri okundu.
2. **`edit-locality-v1.json`'da `sleeveZone.untouchable` `"^Skirt"` içeriyor ama
   `waistZone.untouchable` `"^Skirt"` İÇERMİYOR** (doğru olabilir: bel dikişi
   eteği taşır). Buna karşılık `hemZone.untouchable` `"^Skirt"` içermiyor ve
   `waistZone` da etek panelini serbest bırakıyor — yani **etek paneli hem bel
   hem etek ucu düzenlemesinde serbest.** Bu tasarım olabilir; kapının bunu
   nasıl yorumladığı **ölçülmedi** (`edit_locality_check.mjs` kart tarafından
   açılmadı).
3. **`worker.js` prompt'u `ratios` altında 7 sürekli oran istiyor**
   (hemToWaistWidth, lengthToWidth, neckDepthToLength, neckWidthToShoulder,
   sleeveLenToGarment, waistYToLength, strapWidthToShoulder) — bunlar
   **boyutsuz ve VLM'in ölçtüğü** sayılar. `garment-spec-v2.json.quantities`
   içinde bunların HİÇBİRİNİN karşılığı yok (oradakiler mm/cm/deg/frac,
   hepsi motor kadranı). Yani **VLM'in ürettiği en zengin sürekli sinyal
   spec'e hiç girmiyor.** Nereye gittiği (draft-bridge?) bu turda
   **izlenmedi — DOĞRULANMADI.**
4. **`worker.js` prompt'u ~45 satır elle yazılmış ayırt edici kural taşıyor**
   (boat vs square, sleeve vs strap, collar vs neckline, back view kuralı,
   halter kuralı). Bunların hiçbirinin **regresyon testi görülmedi.** Prompt
   değişince hangi kuralın kırıldığını yakalayacak bir kapı var mı —
   **ölçülmedi.**
5. **`primitives-v1.json`'un `seam.not_esik` satırı açık bir boşluk ilan ediyor:**
   "Gecerlilik esigi bu dosyada TANIMLI DEGIL... bizim kapimizin esigi Damla'nin
   karari." Bu tur GarmentCode'un `tol=0.05` bandını referans olarak teyit etti
   (D2GC ve ChatGarment ikisi de GarmentCode motorunu KULLANIYOR, yani o
   toleransın altında yayın yapıyorlar) — ama **bizim eşiğimiz hâlâ Damla'nın
   kararı ve bu tur onu açmadı.**
6. **Erişilemeyen:** CVPR openaccess PDF'leri (kart PDF özetlemeyi yasakladı),
   NeuralTailor birincil metni, *Let Me Speak Freely?* (EMNLP 2024),
   D2GC kullanıcı çalışmasının paydası, SewFormer %76.3'ün paydası,
   PIE-Bench'in birebir sayıları. Hepsi yukarıda **DOĞRULANMADI** olarak
   işaretli.

---

## KAYNAK LİSTESİ (tam künye + URL)

1. Bian, Xu, Xiu, Grigorev, Liu, Lu, Black, Feng. *ChatGarment: Garment Estimation,
   Generation and Editing via Large Language Models.* CVPR 2025. arXiv:2412.17811.
   https://arxiv.org/html/2412.17811v2 · https://chatgarment.github.io/ ·
   kod https://github.com/biansy000/ChatGarment (Apache-2.0)
2. Zhou, Liu, Liu, He, Li, Jin, Wang. *Design2GarmentCode: Turning Design Concepts
   to Tangible Garments Through Program Synthesis.* CVPR 2025. arXiv:2412.08603.
   https://arxiv.org/html/2412.08603v3 · https://style3d.github.io/design2garmentcode/
   · kod https://github.com/Style3D/design2garmentcode (lisans dosyası YOK)
3. Liu, Xu, Lin, Liang, Yan. *Towards Garment Sewing Pattern Reconstruction from a
   Single Image.* ACM TOG 2023, doi 10.1145/3618319. arXiv:2311.04218 ·
   https://github.com/sail-sg/sewformer (SPDX lisansı YOK)
4. Korosteleva, Lee. *NeuralTailor: Reconstructing Sewing Pattern Structures from
   3D Point Clouds of Garments.* ACM TOG 2022. arXiv:2201.13063
5. *GarmentX: Autoregressive Parametric Representations for High-Fidelity 3D
   Garment Generation.* arXiv:2504.20409. https://arxiv.org/html/2504.20409v1
   (SewFormer %76.3 başarısızlık oranının kaynağı)
6. Geng, Cooper, Moskal, Jenkins, Berman, Ranchin, West, Horvitz, Nori.
   *Generating Structured Outputs from Language Models: Benchmark and Studies*
   (JSONSchemaBench). arXiv:2501.10868. https://arxiv.org/html/2501.10868v1
7. Ju, Zeng, Bian, Liu, Xu. *PnP Inversion: Boosting Diffusion-based Editing with
   3 Lines of Code* (PIE-Bench). ICLR 2024.
   https://proceedings.iclr.cc/paper_files/paper/2024/file/661caac7729aa7d8c6b8ac0d39ccbc6a-Paper-Conference.pdf
   · https://github.com/cure-lab/PnPInversion (lisans dosyası YOK)
8. Seff, Ovadia, Zhou, Adams. *SketchGraphs: A Large-Scale Dataset for Modeling
   Relational Geometry in Computer-Aided Design.* ICML 2020 Workshop.
   arXiv:2007.08506 · https://github.com/PrincetonLIPS/SketchGraphs (MIT)
9. W3C CSS Anchor Positioning Level 1. https://tabatkins.github.io/specs/css-anchor-position/
   · https://developer.mozilla.org/en-US/docs/Web/CSS/anchor
10. Korosteleva, Sorkine-Hornung. *GarmentCode.* SIGGRAPH 2023.
    https://github.com/maria-korosteleva/GarmentCode (MIT)
11. FreeSewing. https://github.com/freesewing/freesewing (MIT)
