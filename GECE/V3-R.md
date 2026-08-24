# V3-R — ARAŞTIRMA ÇIKTISI (kart V3-R, §5.1)

Tarih: 2026-08-24 · Kod yazılmadı, dosya düzenlenmedi (bu dosya hariç).
Kural: kaynaksız sayı YOK. Bulunamayan yere "yayınlanmış formül YOK" yazıldı.
Ölçüm/aritmetik olan yerler açıkça "ARİTMETİK (kaynak değil)" diye işaretli.

---

## EŞİK 1 — TEĞET SÜREKSİZLİĞİ (G1/C1) AÇI EŞİĞİ

### ARANAN
Bitişik eğri/yüzey segmentleri arasındaki teğet açısı farkı hangi değerin
altında "sürekli" sayılır? Derece veya radyan + künye.

### BULUNAN

**(a) CATIA V5 — 0.5° (en net yayınlanmış eşik)**
> "With tangency tolerance equal or inferior to 0.5 degree, CATIA considers that
> 2 faces which have an angular discontinuity less than 0.5deg are continuous in
> tangency (G1)."
Künye: Dassault Systèmes CATIA V5 GSD destek notları, IBM Support APAR sayfaları
`HD61495` ("GSD: THE RESULT OF CONNECT CHECKER IS NOT CORRECT") ve `HD27070`
("SHAPE DESIGN: CONTINUITY BETWEEN FILL SURFACE AND SUPPORT FACE IS NOT TANGENT").
URL: https://www.ibm.com/support/pages/apar/HD61495 ·
https://www.ibm.com/support/pages/apar/HD27070
⚠ **Sayfalar doğrudan çekilemedi (HTTP 403).** Metin arama sonucu snippet'inden
alındı, birincil sayfada gözle doğrulanmadı → **GÜVEN: ORTA.**
Aynı kaynakta ek kayıt: "there is no meaning that Angular threshold value can be
lower than 0.5 deg" — yani 0.5° CATIA'da bir TABAN.

**(b) Rhino / McNeel — doküman açı toleransı varsayılanı 1.0°**
> "The angular tolerance is important in that it tells Rhino at what point you want
> two curves or surfaces to be considered tangent."
> "The default setting of 1 degree is rather large for fine modeling."
> "Rhino sets your absolute tolerances at 0.01 or 0.001 units."
Künye: McNeel Wiki, "Understanding Tolerances", https://wiki.mcneel.com/rhino/faqtolerances
Sayfa doğrudan çekildi ve alıntılar birebir. **GÜVEN: YÜKSEK.**
Aynı sayfa 1°'yi ince modelleme için "büyük" sayıp 0.1° veya daha sıkısını öneriyor.

**(c) Rhino `GlobalEdgeContinuity` / `EdgeContinuity` — VARSAYILAN YAYINLANMAMIŞ**
Komut dokümanları (docs.mcneel.com rhino/8 ve rhino/9) "Tangency tolerance: this is
the tolerance for edge pairs to be considered tangentially continuous" diyor ama
**sayısal varsayılan vermiyor.** rhino/9 sayfasında geçen "default G1 filter of 20°"
bir GÖRÜNTÜLEME/eleme filtresidir, süreklilik eşiği DEĞİLDİR — eşik olarak kullanma.
McNeel forumunda (discourse.mcneel.com/t/.../118266) kullanıcı tam bu varsayılanları
soruyor; McNeel personeli (Pascal Golay, Steven Burzinski) **sayı vermiyor**
("No. You need to know ahead of time what the client's expectations are.";
eğrilik varsayılanı 5 için "I do not know if that (5) is a reasonable number").
→ Rhino'nun komut-düzeyi G1 varsayılanı için **yayınlanmış sayı YOK.**

**(d) OpenCASCADE — G1 için yayınlanmış VARSAYILAN YOK**
- `Precision::Angular()` = **1.e-12 radyan**, `Precision::Confusion()` = **1.e-7**.
  Künye: OCCT Reference Manual, Precision Class Reference,
  https://occt3d.com/dev/doc/refman/html/class_precision.html (doğrudan çekildi,
  **GÜVEN: YÜKSEK**). ⚠ Ama dokümanın kendi tarifi: bu tolerans **vektör
  paralelliği/dikliği** içindir ("The tolerance of angular equality may be used to
  check the parallelism of two vectors"), teğet SÜREKSİZLİĞİ eşiği olarak
  tasarlanmamıştır. 1e-12 rad = 5.7e-11 derece; bir kalıp eğrisinde anlamsız.
- `LocalAnalysis_CurveContinuity`: **EpsG1 çağıran tarafından verilen radyan cinsi
  bir parametredir** ("EpsG1 is an angular tolerance in radians used for G1
  continuity to compare the angle between the tangents"); sınıf referansında
  **varsayılan değer yayınlanmamış**. Künye: OCCT 7.1.0 refman,
  `LocalAnalysis_CurveContinuity` (eski URL yönlendirmeye düştü, içerik arama
  snippet'inden) → **GÜVEN: ORTA.**

**(e) Siemens UG/NX — 0.5° (zayıf kaynak)**
"0.5 degrees is the default tolerance that UG/NX uses for tangencies" ifadesi
eng-tips forum thread'i 183366'dan geliyor. Sayfa **403 verdi, çekilemedi**, forum
kaynağı. **DOĞRULANMADI — güven DÜŞÜK, karar dayanağı yapma.**

**(f) Kalıp yazılımı (Gerber AccuMark / Optitex) eğri toleransı — BULUNAMADI**
Aranan: "Optitex Gerber AccuMark curve smoothing tolerance point reduction
digitizing tolerance mm". Dönen sonuçlar pazarlama/eğitim içeriği; **hiçbir resmi
sayısal eğri/teğet toleransı yayınlanmamış** (kılavuzlar paywall/lisans arkasında).
→ **Kalıp CAD tarafında yayınlanmış teğet süreksizliği formülü YOK.**

### LİSANS
Yok — bunlar doküman alıntısı, kod değil.

### HÜKÜM
Yayınlanmış bant: **0.5° (CATIA, ORTA) … 1.0° (Rhino doküman varsayılanı, YÜKSEK).**
İkisinin arası bir eşik "sanayi pratiğinden türetilmiş" diye savunulabilir.
- **C1-kırığı kapısı için önerilen değer: 1.0° (= 0.017453 rad)**, tek YÜKSEK güvenli
  yayınlanmış varsayılan bu; daha sıkısını isterse 0.5° CATIA'ya dayanır.
- **0.1°'nin altına inme**: yalnızca McNeel'in "ince modelleme için öneri" cümlesine
  dayanır, standart değildir.
- **OCCT 1e-12 rad'ı bu kapıya BAĞLAMA** — o paralellik toleransı, teğet eşiği değil.

---

## EŞİK 2 — FLAT ↔ KALIP ÖLÇÜ UYUMU (%1.5 iddiası)

### ARANAN
Technical flat (moda teknik çizimi) ile kalıp arasında ölçü uyumu için
yayınlanmış bir yüzde toleransı; yoksa 1/32" = 0.79375mm'nin yüzde karşılığı.

### BULUNAN — **%1.5 İÇİN YAYINLANMIŞ FORMÜL YOK.**
Aranan sorgular: technical flat ↔ pattern dimensional agreement, apparel measurement
tolerance table, ASTM D5585, "1/32 inch" pattern making tolerance. **Technical flat
ile kalıp arasında sayısal ölçü uyumu şartı koyan hiçbir standart/yayın bulunamadı.**
Sebebi de literatürde örtük: technical flat bir İLETİŞİM çizimidir, ölçü taşıyıcı
belge değildir; ölçü tech pack'in POM tablosundadır.

Bulunan komşu gerçekler (eşiğin kendisi değil):
- **ASTM D5585-21** "Standard Tables of Body Measurements for Adult Female Misses
  Figure Type, Size Range 00–20" — bu bir **VÜCUT ÖLÇÜSÜ tablosudur, tolerans
  tablosu değildir.** (store.astm.org/d5585-21.html; tam metin paywall.)
  → Aradığımız toleransı bu standart vermiyor. **GÜVEN: YÜKSEK (negatif bulgu).**
- Sanayi QC toleransı **POM başına MUTLAK** verilir, yüzde değil. Örnek: "Across
  chest, 1" below armhole — Size M target 21", tolerance ±½"" (Adstronaut,
  adstronaut.net/glossary/what-is-a-pom — ticari blog, **DOĞRULANMADI**).
  ARİTMETİK (kaynak değil): ±0.5/21 = **±%2.38**.
- "one half the grade is fair in most cases" ve "a consistent 1/8-inch error across
  all seams of a bodice can change the total circumference by over an inch" —
  Fashion-Incubator, "How to develop sewing tolerances"
  (fashion-incubator.com/how-to-develop-sewing-tolerances/). ⚠ Sayfa **HTTP 403**,
  çekilemedi; arama snippet'i. **DOĞRULANMADI, güven DÜŞÜK.**
- Dikiş payı normları: ev kalıpları 1/4"–5/8" (6.4–15.9mm), Avrupa 1cm veya 0.7cm.
  Künye: Wikipedia "Seam allowance". Bizim Buğra tanığımızla (10mm, satıcı
  talimatı) tutarlı. Eşik değil, bağlam.

### 1/32" = 0.79375mm YÜZDEYE NASIL DÜŞER — ARİTMETİK (KAYNAK DEĞİL)
Yüzde, hangi ölçüye bölündüğüne bağlı; tek bir yüzde YOKTUR:
| bölünen ölçü (repo tanığı) | 0.79375mm'nin yüzdesi |
|---|---|
| bel 700mm (sizechart EU38) | %0.113 |
| armhole toplam 433.45mm (EU38 kesim çizgisi) | %0.183 |
| 100mm'lik tek dikiş segmenti | %0.794 |
| 50mm'lik kısa segment | %1.588 |
Bu satırların ölçü değerleri repo kayıtlarından (CLAUDE.md), bölme işlemi bana ait.
**Yayınlanmış bir "yüzde toleransı" DEĞİLDİR.**

### HÜKÜM
**Yayınlanmış formül YOK.** %1.5'i "sanayi standardı" diye YAZMA — hiçbir kaynak
desteklemiyor. İki dürüst seçenek:
1. Toleransı **MUTLAK** tut (0.79375mm veya 1mm), çünkü hem üretim pratiği hem QC
   pratiği mutlak veriyor. Yüzde bandı ancak "50mm'lik segmentte %1.6, 700mm'lik
   halkada %0.11" diye SEGMENT UZUNLUĞUNA bağlı olarak konuşulabilir.
2. %1.5 kalacaksa kaynağı **"bizim ölçümümüz"** olarak ilan et: banda ait tek
   savunulabilir gerekçe, %1.5'in üretim toleransı (%0.1–0.2) ile QC POM toleransı
   (~%2.4, zayıf kaynak) ARASINDA durması. Bu bir gerekçedir, kaynak değildir.

---

## EŞİK 3 — AÇILIM ARTEFAKT SINIFLARI (yayınlanmış adlar)

### ARANAN
Düzleştirme/parametrizasyon literatüründe artefakt adları + ölçüm metrikleri;
bizim dört sınıfımızın karşılığı.

### BULUNAN — künye
**Sheffer, Alla; Praun, Emil; Rose, Kenneth (2006). "Mesh Parameterization Methods
and their Applications." Foundations and Trends in Computer Graphics and Vision,
Vol. 2, No. 2, pp. 105–171.**
PDF: https://www.cs.ubc.ca/~sheffa/papers/param_survey06.pdf
→ **PDF indirildi ve METNİ OKUNDU (pdftotext).** Aşağıdaki alıntılar birebir.
**GÜVEN: YÜKSEK.**

Birebir alıntılar (survey, §2):
> "This condition is violated when the mappings of adjacent mesh triangles intersect,
> in this case the parameterization is said to **'fold over'** or contain
> **'triangle flips'**."
> "Figure 2 Non-bijective parameterizations: (a) planar embedding with a **global
> overlap**; (b) planar embedding with a **local overlap**. The normal of the
> highlighted **flipped triangle** is inverted with respect to the other triangle
> normals."
> "Maps that minimize the angular distortion, or shear, are called **conformal**, and
> maps that minimize area distortion are called **authalic**."
> "The two scale factors 0 ≤ γ ≤ Γ are the singular values of the transformation
> matrix... The **L∞ stretch** for a triangle is defined by Sander et al. [2001] as
> max(γ,Γ)=Γ, while the **L2 stretch** is defined as √((γ² + Γ²)/2)."
> "Local bijectivity [Sheffer et al. 2005] requires a map of any sufficiently small
> region of the mesh to be bijective."

Ek yayınlanmış terim (bijektiflik tanımı): "A parameterization of a triangle mesh is
a realization in the plane so that all triangles have **positive signed area**"
— injektif parametrizasyon literatürü (Progressive Parameterizations, SIGGRAPH 2018,
ruiqini.github.io/Publication/18_PP/SIGGRAPH18_ProgressivePara.pdf; ayrıca
"Bijective parameterization with free boundaries", TOG 2015, dl.acm.org/10.1145/2766947).
**GÜVEN: ORTA** (arama snippet'i, PDF gözle taranmadı).

### BİZİM DÖRT SINIFIMIZIN YAYINLANMIŞ KARŞILIĞI
| bizim ad | yayınlanmış ad | ölçüm |
|---|---|---|
| **kendini kesen kontur** | **global overlap** (global bijectivity ihlali) | kontur öz-kesişim testi; survey Fig.2(a). Yayınlanmış SAYISAL eşik yok — ikili yüklem (var/yok). |
| **sıfır alanlı parça** | **degenerate / non-positive signed area triangle**; sıfırın ötesine geçerse **flipped triangle / foldover** (local overlap) | işaretli alan ≤ 0 sayımı. `igl::flipped_triangles` bunu doğrudan sayıyor. İkili yüklem. |
| **C1 kırığı** | parametrizasyon literatüründe **KARŞILIĞI YOK** — orası açı/alan bozulmasıyla ilgilenir, sınır eğrisinin teğet sürekliliğiyle değil. Karşılık **CAD tarafında**: tangency / G1 discontinuity (bkz. Eşik 1). | teğet açı farkı, derece. Eşik 1'in bandı. |
| **tırtıklı etek ucu** | **YAYINLANMIŞ AD YOK.** En yakın ölçülebilir yayınlanmış kavram: **L∞ / L2 stretch** (Sander et al. 2001, survey §2) — komşu üçgenler arası γ,Γ salınımı; ve sınır eğrisinde teğet süreksizliği yığılması. "Jaggedness/serration" diye adlandırılmış bir artefakt sınıfı literatürde bulunamadı. | Γ dağılımının komşuluk varyansı VEYA sınır boyunca ardışık teğet açı farkı serisi. Eşik yayınlanmamış. |

### HÜKÜM
- Üç sınıfın yayınlanmış adı ve ölçüsü var; **hiçbirinin yayınlanmış SAYISAL eşiği
  yok** çünkü ikisi ikili yüklem (flip sayısı = 0, overlap = yok), biri sürekli metrik
  (stretch) ama literatür ona "şu değerin altı temiz" demiyor.
- **Kapı tasarımı:** `flipped_triangles == 0` ve `global_overlap == false` sert kapı;
  L2 stretch **raporlanan sayı**, eşik değil (bizim mevcut %0.5 strain kapımız
  kendi ölçümümüzden gelir, literatürden değil — öyle ilan edilsin).
- "Tırtıklı etek ucu" için literatürden ad ödünç ALMA; kendi adımızı koyup ölçüsünü
  (ardışık teğet açı farkı, Eşik 1 bandına göre) tanımlamak dürüst yol.

---

## 4. ORTOGRAFİK PROJEKSİYON → FASHION FLAT

**HÜKÜM: YOK.** Giysi kabuğundan (3B mesh) ön/arka teknik çizim (technical flat)
üreten yayınlanmış akademik bir yöntem bulunamadı.
Bakılanlar ve ne yaptıkları:
- **NeuralTailor** (Korosteleva & Lee, SIGGRAPH/TOG 2022, Vol 41 No 4,
  dl.acm.org/doi/10.1145/3528223.3530179; kod: github.com/maria-korosteleva/
  Garment-Pattern-Estimation) → 3B nokta bulutundan **DİKİŞ KALIBI** yapısı, flat değil.
- **SewFormer** ("Towards Garment Sewing Pattern Reconstruction from a Single Image",
  arxiv.org/pdf/2311.04218) → görüntüden **dikiş kalıbı**, flat değil.
- **GarmentCode / GarmentCodeData** (link.springer.com/chapter/10.1007/978-3-031-73027-6_7)
  → parametrik dikiş kalıbı programlama, flat üretmiyor.
- **GarmageNet** (arxiv.org/html/2504.01483), **GarmentImage** (arxiv.org/pdf/2505.02592)
  → kalıp temsili/üretimi, technical flat değil.
- Ters yön var: "Automatic generation of fashion manufacturing tech packs from images
  using computer vision" (USPTO patent 12439986) — **görüntüden** tech pack, 3B'den değil.
→ Bizim `engine/flat-engine/`'in yaptığı işin yayınlanmış bir emsali bulunamadı.
Bu bir NOVELTY imkânıdır ama iddia kurmadan önce SIGGRAPH/Eurographics tam metin
taraması gerekir; bu koşuda yapılan sadece web araması. **DOĞRULANMADI (yokluk kanıtı zayıf).**

---

## 5. libigl ve Eigen

### libigl
- **Fonksiyonlar (tutorial'dan birebir):** `igl::harmonic` (harmonic parametrization),
  `igl::lscm` (least squares conformal maps), `igl::arap_precomputation` /
  `igl::arap_solve` (ARAP parametrization), `igl::boundary_loop`,
  `igl::map_vertices_to_circle`, **`igl::flipped_triangles`** (parametrizasyondaki ters
  dönmüş üçgenleri saptar → Eşik 3'ün doğrudan aleti).
  Künye: libigl Tutorial, https://libigl.github.io/tutorial/ (çekildi, **GÜVEN: YÜKSEK**).
  `include/igl/lscm.h` dosya olarak da doğrulandı: github.com/libigl/libigl/blob/main/include/igl/lscm.h
- **Lisans: MPL-2.0.** Copyleft bağımlılığı olan fonksiyonlar `igl::copyleft::`
  namespace'inde ayrılmış (opt-in). `igl::spectra::lscm` Spectra'ya bağlı, ayrı namespace.
  Künye: libigl docs/index.md, github.com/libigl/libigl/blob/main/docs/index.md. **GÜVEN: YÜKSEK.**
- **Header-only: EVET ama seçimli.** `LIBIGL_USE_STATIC_LIBRARY=OFF` → header-only,
  `ON` → statik kütüphane. Çekirdek bağımlılık sadece **STL + Eigen** (aynı doküman).
- **Emscripten/wasm:** libigl resmi dokümanında **wasm/Emscripten'den hiç söz edilmiyor.**
  Üçüncü taraf emsal var: `github.com/ryanaltair/libigl-wasm` ("use libigl in wasm") ve
  josherich.me/graphic/porting-libigl-emscripten. ⚠ **İkisi de açılıp doğrulanmadı —
  DOĞRULANMADI.** Not: wasm zorluğu çekirdekte değil, `igl::opengl::glfw::Viewer`
  tarafında (GLFW/WebGL bayrakları). Bizim ihtiyacımız viewer'sız çekirdek → risk düşük
  ama **ölçülmedi.**

### Eigen
- **Lisans: MPL2** (3.1.1 sürümünden beri; öncesi/ayrıca LGPL3+). "closed-source
  software may use Eigen without having to disclose its own source code."
  Künye: Eigen FAQ, https://libeigen.gitlab.io/pages/faq/ + Wikipedia "Eigen (C++ library)".
  **GÜVEN: ORTA** (FAQ sayfası doğrudan çekilmedi, arama snippet'i).
- **Header-only: EVET.** "There is no need to link to any external library; all you
  need is to include Eigen's header files."
- **Emscripten/wasm:** resmi dokümanda açık bir kayıt bulunamadı. Saf şablon başlık
  kütüphanesi olduğu için standart C++ derleyicisiyle derlenir; **emsal doğrulanmadı.**

---

## SON TABLO

| eşik | değer | kaynak | güven |
|---|---|---|---|
| G1 teğet süreksizliği (CATIA) | **0.5°** | Dassault/CATIA V5 GSD, IBM APAR HD61495 + HD27070 (sayfa 403, snippet) | ORTA |
| G1 teğet süreksizliği (Rhino doküman varsayılanı) | **1.0°** | McNeel Wiki "Understanding Tolerances" (birebir alıntı) | YÜKSEK |
| G1 (UG/NX) | 0.5° | eng-tips forum 183366 (403, çekilemedi) | DÜŞÜK |
| OCCT `Precision::Angular()` | **1e-12 rad** — ama paralellik için, teğet eşiği DEĞİL | OCCT Precision Class Reference | YÜKSEK (değer) / kullanım UYGUNSUZ |
| OCCT `LocalAnalysis_CurveContinuity` EpsG1 | **varsayılan yayınlanmamış** (çağıran verir, radyan) | OCCT 7.1.0 refman | ORTA |
| Kalıp CAD (Gerber/Optitex) eğri toleransı | **YAYINLANMIŞ SAYI YOK** | arama sonuçsuz | — |
| Flat ↔ kalıp %1.5 | **YAYINLANMIŞ FORMÜL YOK** | — | YÜKSEK (negatif) |
| 1/32" = 0.79375mm | %0.113 (700mm) … %1.588 (50mm) | **ARİTMETİK, kaynak değil** | — |
| QC POM toleransı örneği ±½" / 21" = %2.38 | ticari blog | DÜŞÜK / DOĞRULANMADI | |
| Dikiş payı normu | 1/4"–5/8" (6.4–15.9mm), AB 0.7/1.0cm | Wikipedia "Seam allowance" | ORTA |
| flipped triangle / foldover | **ikili yüklem, sayısal eşik yayınlanmamış** | Sheffer/Praun/Rose 2006 §2 (PDF okundu) | YÜKSEK |
| global overlap (kendini kesen kontur) | **ikili yüklem, eşik yayınlanmamış** | aynı, Figure 2(a) | YÜKSEK |
| sıfır alanlı parça | signed area ≤ 0; `igl::flipped_triangles` | Sheffer 2006 + libigl tutorial | YÜKSEK |
| L∞ stretch = Γ · L2 stretch = √((γ²+Γ²)/2) | formül var, **eşik yok** | Sander et al. 2001, Sheffer 2006 §2 | YÜKSEK |
| "tırtıklı etek ucu" | **YAYINLANMIŞ AD YOK** | — | YÜKSEK (negatif) |
| 3B kabuk → technical flat yöntemi | **YOK** (bulunamadı) | NeuralTailor/SewFormer/GarmentCode hepsi kalıp üretiyor | ORTA (yokluk zayıf kanıt) |
| libigl lisans / yapı | **MPL-2.0**, header-only seçimli, dep = STL + Eigen | libigl docs/index.md | YÜKSEK |
| libigl wasm emsali | üçüncü taraf var, **DOĞRULANMADI** | ryanaltair/libigl-wasm | DÜŞÜK |
| Eigen lisans / yapı | **MPL2** (3.1.1+), header-only, link yok | Eigen FAQ + Wikipedia | ORTA |

---

## DÖKÜM — sorulmayan ama gördüğüm / göremediğim

**Sorulmamış ama önemli:**
1. **Bizim %0.5 strain kapımız literatürden GELMİYOR.** Survey hiçbir yerde "şu
   stretch değerinin altı kabul edilir" demiyor. Kapıyı "kendi ölçümümüz" diye ilan
   etmezsek yanlış atıf yapmış oluruz.
2. **`igl::flipped_triangles` bizim "sıfır alanlı parça" kapımızın hazır alet
   karşılığı.** MPL-2.0, header-only, viewer gerektirmez → C++ motora girmesi ucuz.
   Ama libigl'i hiç değerlendirmedik; mevcut `flatten.cpp` elle yazılmış ARAP.
3. **Rhino'nun 1° "doküman toleransı" ile CATIA'nın 0.5°'si aynı şey değil**: Rhino'nunki
   modelleme sırasında kullanılan global bir ayar, CATIA'nınki analiz eşiği. Aynı
   tabloya koyarken bunu belirtmezsek yanlış eşitleme olur.
4. **QC toleransı MUTLAK verilir, yüzde değil** — bu, "%1.5" gibi bir yüzde kapısının
   sanayi diliyle uyuşmadığını gösteriyor. Kapıyı mm cinsinden kurmak hem savunulabilir
   hem bizim mevcut 0.79375mm kaydımızla tutarlı.
5. Arama sırasında çıkan **"tolerans grade'den geniş olursa bedenler QC'de örtüşür"**
   uyarısı (Adstronaut, zayıf kaynak): bizim grade'imiz ~4cm çevre; %1.5 bel 700mm'de
   10.5mm = grade'in dörtte biri, yani bu tuzağa düşmüyoruz. **ARİTMETİK, kaynak değil.**
6. **ASTM D5585 tolerans tablosu DEĞİL**, vücut ölçüsü tablosudur. Repoda bir yerde
   "ASTM tolerans" diye anılırsa yanlıştır.

**Göremediğim / erişemediğim:**
- IBM APAR HD61495 / HD27070 sayfaları — **HTTP 403**. 0.5° birincil kaynaktan
  okunmadı.
- fashion-incubator.com "How to develop sewing tolerances" — **HTTP 403**. Sanayi
  dikiş toleransı sayıları alınamadı.
- eng-tips 183366 — **HTTP 403**. UG/NX 0.5° doğrulanamadı.
- ASTM D5585-21 tam metin — **paywall**.
- Gerber AccuMark / Optitex kılavuzları — **lisans arkasında**, hiçbir sayı çıkmadı.
- OCCT `LocalAnalysis_CurveContinuity` güncel sayfası — eski URL yönlendirmede kaldı,
  EpsG1 varsayılanı sınıf kaynağından okunmadı.
- SIGGRAPH/EG tam metin taraması yapılmadı (madde 4'ün "YOK" hükmü web aramasına dayanıyor).
- libigl-wasm ve Eigen wasm emsalleri açılmadı.

**Kart dışı fark ettiğim:**
- Kart CGAL/OpenCASCADE'i yasaklıyor ama Eşik 1'in tek YAYINLANMIŞ sayıları CAD
  dünyasından geliyor; OCCT'yi bağımlılık olarak değil **kaynak** olarak kullandım.
  Kod bağlantısı önerilmedi.
- `igl::flipped_triangles` bulgusu kart maddesi 5'in kapsamındaydı ama sonucu asıl
  Eşik 3'ü etkiliyor — iki bölüm birbirine bağlandı.
