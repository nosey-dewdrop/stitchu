# DÜNYA TARAMASI — 23 Ağu 2026

ERİŞİM VAR. Aşağıdaki her satır bir URL'ye bağlı. Erişilemeyeni "ERİŞİLEMEDİ" yazdım.
Lisansı bilinmeyen hiçbir şey "adopt" değil. İkincil kaynaklıya **DOĞRULANMADI** etiketi var.

Motor koduna dokunulmadı. Yazılan dosyalar: bu dosya + `knowledge/vocab-menu-vs-malzeme.json`.

---

## KISA CEVAP — Damla'nın sorusuna

`engine/vocab.json` içinde 132 değer var. **74'ü MENÜ ismi, 36'sı MALZEME, 22'si `none` sentineli.**
Yani "none"ları saymazsak sözlüğün **%67'si lahmacun**. Damla'nın SSB-4'te dediği şey ölçüldü ve
doğru çıktı. Sayım betiği ve etiketlerin tamamı `knowledge/vocab-menu-vs-malzeme.json` içinde,
tek tek isim bazında — tartışmak isteyen dosyayı açıp itiraz eder.

Dünyada bu problemi çözmüş olan tek proje **GarmentCode / PyGarment** (MIT). Menü ismi tutmuyor;
`Edge` + `EdgeSequence` + `Panel` + `Interface` + `StitchingRule` tutuyor. Bizim gitmemiz gereken yer bu.

---

## A. GarmentCode / PyGarment — EN ÖNEMLİSİ

Kaynak: `github.com/maria-korosteleva/GarmentCode` — **Lisans: MIT** (GitHub API `license.spdx_id` = `MIT`,
LICENSE dosyası "MIT License, Copyright Maria Korosteleva 2024"). Ticari kullanım serbest, atıf yeterli.
Makale: GarmentCode: Programming Parametric Sewing Patterns, ACM TOG, https://dl.acm.org/doi/10.1145/3618351
— "the first DSL for garment modeling", "applies principles of object-oriented programming to garment
construction", "component abstraction, algorithmic manipulation, and free-form design parametrization"
(https://arxiv.org/abs/2306.03642).

### Sınıflar, adıyla ve imzasıyla

`pygarment/garmentcode/edge.py`:

| Sınıf | `__init__` | Metotlar |
|---|---|---|
| `Edge` | `(start=None, end=None, label='')` | `length` `midpoint` `shortcut` `as_curve` `linearize(n_verts_inside=0)` `to_edge_sequence(edge_verts)` `reverse` `reflect_features` `snap_to(new_start=None)` `rotate(angle)` `subdivide_len(fractions, connect_internal_verts=True)` `subdivide_param(fractions, ...)` `assembly` |
| `CircleEdge` | `(start=None, end=None, cy=None, label='')` | `length` `midpoint` `reverse` `reflect_features` `as_curve` `as_radius_flag` `as_radius_angle` `linearize(n_verts_inside=9)` `assembly` |
| `CurveEdge` | `(start=None, end=None, control_points=None, relative=True, label='')` | `length` `midpoint` `reverse` `reflect_features` `as_curve(absolute=True)` `linearize(n_verts_inside=9)` `assembly` |
| `EdgeSequence` | `(*args, verbose=False)` | `length` `isLoop` `isChained` `fractions` `lengths` `verts` `shortcut` `bbox` `append` `insert` `pop` `substitute(orig,new)` `reverse` `translate_by` `snap_to` `close_loop` `rotate` `extend(factor)` `reflect(v0,v1)` `propagate_label` `copy` `chained_order` |

`pygarment/garmentcode/panel.py` — `Panel(name, label='')`:
`pivot_3D` `length(longest_dim=False)` `is_self_intersecting` `set_panel_label` `set_pivot(point_2d, replicate_placement=False)`
`top_center_pivot` `translate_by` `translate_to` `rotate_by(R)` `rotate_to(R)` `rotate_align(vector)` `center_x`
`autonorm` `mirror(axis=None)` **`add_dart(dart_shape, edge, offset, right=True, edge_seq=None, int_edge_seq=None)`**
`assembly` `point_to_3D(point_2d)` `norm` `bbox` `bbox3D`

`pygarment/garmentcode/component.py` — `Component(name)`: `set_panel_label` `pivot_3D` `length` `translate_by`
`translate_to` `rotate_by` `rotate_to` `mirror(axis=[0,1])` `assembly` `bbox3D` `is_self_intersecting`.
`assembly()` içinde `self.stitching_rules.assembly()` çağrılıyor.

`pygarment/garmentcode/interface.py` — `Interface(panel, edges, ruffle=1.0, right_wrong=...)`.
Projeksiyon/geometri: `projecting_edges` `projecting_lengths` `projecting_fractions` `verts_3d` `bbox_3d`.
Yön: `oriented_edges` `needsFlipping` `reverse` `flip_edges`. Değişim: `reorder` `substitute` `set_right_wrong`.
Statik: `from_multiple`.

`pygarment/garmentcode/connector.py`:
- `StitchingRule(int1: Interface, int2: Interface, verbose: bool = False)` → **`isMatching(tol=0.05)`** `match_interfaces` `assembly`
- `Stitches(*rules)` → `append(pair)` `__getitem__(id)` `assembly`

### Bize düşen — bunlar bir mimarî, bir isim listesi değil

1. **`ruffle` katsayısı `Interface` üzerinde durur, panelin üstünde değil.** Yani "büzgü" bir stil ismi değil,
   iki kenar arasındaki uzunluk oranı. Bizde `gatherType`+`gatherZone` iki ayrı menü alanı. Doğrusu tek sayı.
2. **`StitchingRule.isMatching(tol=0.05)`** — dikiş geçerliliği, iki interface'in projeksiyon uzunluklarının
   %5 toleransla eşleşmesi. Bu bizim "dikiş tutuyor mu" kapımızın dünyada kanıtlanmış hali.
   NOT: bu onların toleransı, bizim kapımızın eşiği değil — repo'daki hiçbir eşiğe dokunulmadı.
3. **`projecting_edges` / `projecting_lengths` / `projecting_fractions`** — Damla'nın "projeksiyon, integral,
   fizik" cümlesinin karşılığı zaten burada: 3B panel kenarı 2B'ye projekte edilip uzunluk üzerinden eşleniyor.
4. **`Edge.subdivide_len(fractions)` / `subdivide_param(fractions)`** — bir kenarı oranlarla bölmek.
   Bizim tüm "yaka X derinliği" menümüz aslında bu tek primitifin üstüne oturur.
5. **`add_dart(dart_shape, edge, offset, ...)`** — pens bir *stil* değil, bir kenara uygulanan operatör.

**Daha iyisi nerede:** GarmentCode'un `Component` hiyerarşisi hâlâ elle yazılmış Python sınıfları
(`SkirtCircle`, `Shirt`...). Yani DSL primitif, ama *kütüphane* yine menü. Sınırsız kalıp iddiası için
primitif demetini veri olarak (spec) tutup kod olarak tutmamak gerek — bizim `contract/` yaklaşımımızın
avantajı tam burası.

---

## B. Seamly2D / Valentina

Kaynak: `github.com/FashionFreedom/Seamly2D` — **Lisans: GPL-3.0** (GitHub API `license.spdx_id` = `GPL-3.0`).
**DİKKAT: GPL-3.0 viral. Bu depodan tek satır kod alınamaz.** Sadece *fikir/primitif adı* okunur.
Adı "adopt" edilebilir, kodu ASLA.

### Primitifler — kaynak: repo ağacı (`gh api repos/FashionFreedom/Seamly2D/git/trees/develop?recursive=1`)

Sınıf dosyaları (birincil, doğrulanmış):
`vtoolbasepoint` `vtoolendline` `vtoolalongline` `vtoolline` `vtoollineintersect` `vtoollineintersectaxis`
`vtoolnormal` `vtoolbisector` `vtoolshoulderpoint` `vtoolheight` `vtooltriangle` `vtoolpointofcontact`
`vtoolcut` `vtoolcutarc` `vtoolcutspline` `vtoolcutsplinepath` `vtoolcurveintersectaxis`
`vtoolpointfromarcandtangent` `vtoolpointofintersectionarcs` `vtoolpointofintersectioncurves`
`vtoolarc` `vtoolarcwithlength` `vtoolellipticalarc` `vtoolspline` `vtoolsplinepath`
`vtoolcubicbezier` `vtoolcubicbezierpath` `vtooldoublepoint` `vtoolsinglepoint` **`vtooltruedarts`**
`intersect_circles_tool` `intersect_circletangent_tool` `point_intersectxy_tool` `doubleline_point_tool`

Sınıf adı → insan adı eşlemesi (`vtoolendline` = "point at distance and angle", `vtoolalongline` =
"point along line", `vtoollineintersect` = "point of intersection") wiki'den teyit edilemedi:
`wiki.seamly.io/wiki/UserManual:Tools:Points` **HTTP 403 — ERİŞİLEMEDİ**. Eşleme benim çıkarımım →
**DOĞRULANMADI**. Sınıf adlarının kendisi birincil kaynaktan, doğrulanmıştır.

### Formül motoru — doğrulandı

`src/libs/qmuparser/` — muParser'ın Qt portu, **`LICENSE_BSD.txt`** (BSD, izin veren).
`qmuformulabase.cpp/h` var. Yani Seamly2D'de her ölçü bir *string formül* olarak saklanıp
runtime'da parse ediliyor. Ölçü isimleri formülde değişken olarak geçiyor.
**BSD olduğu için qmuparser fikri/kodu bizim için kullanılabilir — GPL olan Seamly2D gövdesi değil.**

### `.val` / `.vit` şeması — doğrulandı

`src/libs/ifc/schema/pattern/v0.1.0.xsd` … `v0.2.0.xsd` (desen = `.val`),
`src/libs/ifc/schema/individual_size_measurements/v0.2.0.xsd`…`v0.3.4.xsd` (`.vit`),
`src/libs/ifc/schema/multi_size_measurements/v0.3.0.xsd`…`v0.4.5.xsd` (çok bedenli).
XML tabanlı, **sürümlenmiş XSD** ile. Bize düşen: bizim `contract/*.schema.json` sürümleme disiplini
zaten aynı fikir; onlarda 6+ şema sürümü yan yana yaşıyor, migration'ı böyle taşıyorlar.

**Bize düşen:** Seamly2D'nin sözlüğü *sıfır* giysi ismi içeriyor. 34 primitif ile her kalıp çiziliyor.
Damla'nın "sınırsız kalıp ve flat" hedefinin canlı, 10+ yıllık kanıtı bu. Menü yok, mutfak var.

---

## C. FreeSewing

Kaynak: `github.com/freesewing/freesewing` — **Lisans: MIT** (GitHub API `license.spdx_id` = `MIT`).
Ticari kullanım serbest.

### Point API — https://freesewing.dev/reference/api/point

`addCircle` `addText` `angle` `asRenderProps` `attr` `clone` `copy` `dist` `dx` `dy` `flipX` `flipY`
`rotate` `setCircle` `setText` `shift` **`shiftFractionTowards`** `shiftOutwards` **`shiftTowards`**
`sitsOn` `sitsRoughlyOn` `slope` `translate`

`shiftFractionTowards` = Seamly2D'nin "point along line"ı. `shift(angle, dist)` = "point at distance and angle".
İki bağımsız proje aynı iki primitife varmış — bu tesadüf değil, bunlar tabanın kendisi.

### Makrolar — https://freesewing.dev/reference/macros

`banner` `bannerBox` `bartack` `bartackAlong` `bartackFractionAlong` `crossBox` **`cutOnFold`** `flip`
**`gore`** **`grainline`** `hd` **`hem`** `join` `ld` `miniScale` `mirror` **`offset`** `pd` **`pleat`**
`ringSector` `round` **`sa`** `scalebox` `sewTogether` `sprinkle` `title` `transform` `vd`

Ve her makronun `rm`-önekli geri-alıcısı: `rmHem` `rmPleat` `rmGrainline` `rmSewTogether` `rmCutOnFold` …
Doküman: "Many macros accept an `id` parameter" — id sayesinde makronun ürettiği path/point/snippet
deterministik isim alıyor ve **geri alınabiliyor**.

> **G maddesi için en yakın emsal budur.** FreeSewing'de "editleme", spec diff'i değil,
> **id'li makro + id'li geri-alıcı** çifti. Bir parçayı değiştirmek = `rmPleat({id})` sonra `pleat({id, ...})`.
> Diğerleri bozulmuyor çünkü makronun dokunduğu her nesne o id ile isimlendirilmiş.
> Bu, bizim "bir parçayı değiştirince diğerleri bozulmasın" ihtiyacımızın çalışan, MIT lisanslı hali.
> `armhole` diye bir makro **yok** (görev metninde geçiyordu) — `hem` ve `gore` var, armhole
> tasarım-içi path olarak çiziliyor. Görev metnindeki `armhole` makrosu iddiası **YANLIŞ ÇIKTI**.

### `ease` ve `stretch` — kumaş ekseni

FreeSewing'de bunlar core API değil, **tasarım başına `pct` tipi seçenek**:
- `ease` — https://freesewing.eu/docs/designs/lumina/options/ease/ ; `seatEase`
  (https://freesewing.eu/docs/designs/onyx/options/seatease/), `sleeveEase`
  (https://freesewing.eu/docs/designs/onyx/options/sleeveease/)
- `xstretch` (yatay kumaş esnemesi) — https://freesewing.org/docs/designs/uma/options/xstretch/
  Doküman: "Since these are leggings that are to be made of stretch fabric, the ease is negative.
  So the completed garment will be narrower than the measurements would dictate."

Seçenek tipleri (https://freesewing.dev/reference/api/part/config/options/): **Boolean, Constant,
Counter, Degree, List, Millimeter, Percentage**. Doküman percentage'ı öneriyor, millimeter'ı
"supported but not recommended" diyor — çünkü yüzde bedenle ölçeklenir, mm ölçeklenmez.

**Bize düşen:** bizim `fabric: woven|knit` iki değerli menüsü, FreeSewing'de negatif-ease + xstretch
yüzdesi olarak *sürekli bir eksen*. Knit/woven ayrımı bir isim değil, bir sayı olmalı.
İkincisi: ease'i giysi tipine değil **bölgeye** bağlıyorlar (seatEase, sleeveEase ayrı ayrı).

---

## D. Gerber AccuMark / Optitex / CLO3D / Browzwear — endüstri terimleri

Bu bölümdeki kaynaklar ikincil (blog + satıcı PDF'i). Standart belge paralı.
Aksi belirtilmedikçe **DOĞRULANMADI**.

- **grade rule / rule table** — ASTM D6673 "facilitate grade rule table data exchange for sewn products"
  (https://store.astm.org/d6673-10.html — özet sayfası, tam metin paralı, **ERİŞİLEMEDİ**).
  Grade rule = her *nokta* için beden başına (dx, dy) kayma vektörü tablosu.
  Yani bedenler arası geçiş bir formül değil, **nokta başına iki sayı**. DOĞRULANMADI (tanım ikincil).
- **piece** — tek kesilecek parça (bizim panel).
- **notch** — parça kenarındaki hizalama işareti. ASTM'de tip başına ayrı katman: V-notch/slit (4),
  T-notch (80), castle (81), check (82), U-notch (83). Bu katman numaraları doğrulandı (bkz. E).
- **walk pieces / walk the seam** — iki parçayı ekranda dikiş çizgisi boyunca "yürütüp" uzunlukların ve
  çentiklerin tutup tutmadığını denetlemek. AccuMark broşürü: "Walk pattern pieces on screen using
  either internal or finished edge to ensure notch placement and proper sewing"
  (https://www.gerbertechnology.com/pdf/AccuMark_E.pdf üzerinden alıntılandı — alıntı ikincil
  arama sonucundan geldi, PDF'i doğrudan çekmedim → **DOĞRULANMADI**).
  Kavram olarak **GarmentCode `StitchingRule.isMatching(tol)`'ün endüstrideki adı budur.**
  Aynı iş: iki kenarın uzunluğu ve işaret konumları eşleşiyor mu.
- **sim-ready** — 3B simülasyona (CLO3D/Browzwear) girmeye hazır: kapalı panel çevrimleri, tanımlı
  dikişler, kumaş özellikleri atanmış. **DOĞRULANMADI** (birincil satıcı dokümanına erişilmedi).
- **Çıktı formatları** — DXF-AAMA ve DXF-ASTM (bkz. E) + satıcıya özel `.ZPRJ` (CLO3D), AccuMark
  parça/marker dosyaları. **DOĞRULANMADI**.
- Genel bakış blog'u https://minervapatterns.com/blog/gerber-accumark-a-practical-overview-for-pattern-makers
  — **HTTP 403, doğrudan çekilemedi**, sadece arama özetinden okundu.

**Bize düşen:** "walk pieces" bizim motorda bir *test* olarak zaten var olması gereken şey ve dünyada
adı konmuş. İki panelin dikilecek kenar çiftlerini yürütüp uzunluk farkını ölçen bir kontrol,
menü sözlüğünden bağımsız çalışır — hangi yakayı çizersek çizelim geçerlidir.

---

## E. DXF-AAMA / ASTM katman tablosu — YAPI taşıyan sözlük

Kaynak: ASTM D6673-10 katman tablosu, Patro dokümantasyonu üzerinden
https://fabricesalvaire.github.io/Patro/resources/file-format/dxf-astm.html
(ASTM D6673-10 standardın kendisi **2019'da geri çekildi** — https://store.astm.org/d6673-10.html.
Geri çekilmiş olması sektörde kullanımını bitirmedi ama "canlı standart" DEĞİL. Bunu bilerek kullan.)

| Katman | Tanım | Amaç (verbatim) |
|---|---|---|
| 1 | Piece boundary | "Outline of each pattern piece and style system text" |
| 2 | Turn points | "Turn points for layers 1, 8, 11, 14" |
| 3 | Curve points | "Curve points for layers 1, 8, 11, 14" |
| 4 | Notches; V-notch and slit-notch; alignment | "Articulation of molding; I-shape or V-shape: alignment pieces" |
| 5 | Grade reference and alternate grade reference line(s) | Grading |
| 6 | Mirror line | "Symmetry of fold" |
| 7 | Grain line | "Direction of fabric grain" |
| 8 | Internal line(s) | "Graphic annotation of placement. Not cut." |
| 9 | Stripe reference line(s) | "Fabric alignment of stripes" |
| 10 | Plaid reference line(s) | "Fabric alignment of chequers" |
| 11 | Internal cutout(s) | "Cutline inside of outline" |
| 13 | Drill holes | "Punch markers" |
| 14 | Sew line(s) | "Line(s) indicate where to stitch" |
| 15 | Annotation text | "Annotation, not style system text (1) or piece system text (1)" |
| 80 | T-notch | "T-shape: slit with T-branch at end of notch" |
| 81 | Castle notch | "U-shape: equal width, rectangular at end of notch" |
| 82 | Check notch | "V-pointed notch, left or right side perpendicular to boundary" |
| 83 | U-notch | "U-shape: equal width, semi-circle at end of notch" |
| 84 | Piece boundary quality validation curves | "Mandatory system information for polyline(s) layer 1" |
| 85 | Internal lines quality validation curves | "…for polyline(s) layer 8" |
| 86 | Internal cutouts quality validation curves | "…for polyline(s) layer 11" |
| 87 | Sew lines quality validation curves | "…for polyline(s) layer 14" |

(12 numaralı katman kaynakta yok — atlanmış, uydurmadım.)

AAMA vs ASTM farkı: "AAMA and ASTM describe the same idea, but they assign features to different layer
numbers and use point codes differently" — https://minervapatterns.com/blog/dxf-aama-vs-dxf-astm
(sayfa **HTTP 403, doğrudan çekilemedi**, arama özetinden → **DOĞRULANMADI**). AAMA katman numaralarının
tam tablosu bulunamadı. ASTM 23 katman tanımlıyor.

**Bize düşen — bu tablo bir mesaj taşıyor:**
- **Kesim çizgisi (1) ile dikiş çizgisi (14) AYRI katman.** Yani dünyada bu ikisi ayrı geometri;
  biri diğerinin görsel süsü değil. `knowledge/seam-line-offset-2026-08-17.md` bunu zaten konuşuyor.
- **Turn points (2) ve curve points (3) ayrı.** Bir çokgen noktası ya köşedir ya eğri kontrolüdür —
  bu ayrım kaydediliyor. Bizim `Edge`/`CurveEdge` ayrımının endüstri karşılığı.
- **Katman tablosunda TEK BİR giysi ismi yok.** 23 katman, 0 "sweetheart". Yapı taşıyan sözlük böyle görünüyor.
- 84-87 "quality validation curves" — çıktının kendi içinde doğrulama eğrisi taşıması zorunlu.
  Bizim "kanıt = çıktı" disiplininin format seviyesindeki hali.

---

## F. ChatGarment — foto+prompt hattımızın emsali

Kaynak: https://arxiv.org/abs/2412.17811 (CVPR 2025), https://chatgarment.github.io/,
kod `github.com/biansy000/ChatGarment` — **Lisans: Apache-2.0** (GitHub API `license.spdx_id`).
Apache-2.0 ticari kullanıma açık, patent grant'lı. Kod alınabilir. Ama:

> **DAMLA KARARI:** ChatGarment bir VLM (LLaVA) fine-tune'u. Kullanmak = model ağırlığı indirmek
> (8 GB RAM makinede lokal çalışmaz) ya da harici API. Bizim hattımıza *mimarî* olarak örnek,
> *bağımlılık* olarak değil. Ağırlık/API kararı senin.

### Ne yaptılar

- VLM'e **geometri değil JSON konfigürasyon** ürettiriyorlar. Çıktı doğrudan GarmentCode'un
  hiyerarşik JSON'una gidiyor, kalıbı motor çiziyor. Bizim hattımızla birebir aynı ayrım.
- **GarmentCodeRC** = GarmentCode'un sadeleştirilmiş konfigürasyonu.
  **Token sayısı 900 → 350.** Yöntem: "automatically removing irrelevant settings during garment
  construction (e.g., omitting skirt-related parameters for upper-body garments)".
  Yani alan *silmediler* — **bağlama göre alan kapattılar**. Üst beden çiziliyorsa etek alanları
  konfigürasyondan hiç çıkmıyor.
- Üst seviye alanlar: `meta` (içinde `upper`, `wb` (waistband), `bottom`), sonra giysi bloğu
  (ör. `pants`: `length`, `width`, `flare`, `rise`, `cuff`).
  Kıyafet seviyesi: `upperbody_garment` / `lowerbody_garment` / `wholebody_garment`.
- Kapsam: pants, skirts, shirts, open-front jackets, dresses, jumpsuits. Ek olarak yüksek belli etek
  desteği ve dar paça için parametre aralığı ayarı.
- Sonuç: Dress4D üzerinde Chamfer Distance 3.12, **%0 stitching failure rate**.
- **Editleme:** "concatenating the source garment JSON file and the editing prompt together", model
  değiştirilmiş JSON'u komple üretiyor. **Formel diff YOK** — metin koşullu yeniden üretim.

**Bize düşen:**
1. `meta` + bağlam-koşullu alan kapatma bizim `contract/spec-grammar.json`'daki
   `gecersiz_kombinasyonlar` fikrinin ta kendisi ama bir adım ötesi: geçersizi *reddetmek* yerine
   **hiç sormamak**. Üst beden için `skirtStyle` alanı prompt'a hiç girmemeli.
2. Token 900→350 rakamı bizim için ölçülebilir bir hedef. Bizim spec'in mevcut boyutu:
   `contract/garment-spec-v2.json` 17.287 bayt. Ölçülmedi, sadece dosya boyutu.
3. **%0 stitching failure** onların yayınlanmış bandı. Bu bizim kapımız değil, kıyas noktası.

---

## G. EDİTLEME emsali — spec DIFF üreten çalışma var mı?

**Spec DIFF üreten, formel, akademik bir emsal BULUNAMADI.** Bulduklarım ve neden yetmedikleri:

| Çalışma | Ne yapıyor | Diff mi? | Lisans |
|---|---|---|---|
| ChatGarment (https://arxiv.org/abs/2412.17811) | kaynak JSON + edit promptu → yeni JSON | HAYIR, komple yeniden üretim | Apache-2.0 |
| Design2GarmentCode (https://arxiv.org/abs/2412.08603) | çok-modlu tasarım → parametrik program sentezi | HAYIR, editleme yeni girdi vermek demek | ERİŞİLEMEDİ (repo bulunamadı) |
| Garment Particles (https://arxiv.org/pdf/2605.26391) | 2B kalıp + 3B geometriyi tek 5B nokta bulutunda kodluyor; rectified flow + diffusion posterior sampling ile editleme | HAYIR, koşullu üretim; yazarların ifadesiyle "locally-scoped through conditional generation" | ERİŞİLEMEDİ |
| **FreeSewing id'li makro + `rm` geri-alıcı** (https://freesewing.dev/reference/macros) | `pleat({id})` ↔ `rmPleat({id})`; makronun ürettiği her nesne id ile isimli | **EN YAKINI.** Diff değil ama **kapsamlanmış geri-alma** — bir parçayı değiştirmek diğerlerini bozmuyor çünkü etki alanı id ile sınırlı | MIT |
| HistCAD (https://arxiv.org/html/2602.19171v2) | kısıt-farkında parametrik geçmiş tabanlı CAD temsili | giysi değil, genel CAD. Kısıt propagasyonu fikri var | ERİŞİLEMEDİ (sadece arama özeti) → **DOĞRULANMADI** |

Genel CAD tarafında ilke şu: "Industrial CAD engines deploy incremental update strategies that detect
affected regions, cache linearizations, and prefer local re-solves over full recomputation"
(https://novedge.com/blogs/design-news/design-software-history-constraint-solving-in-cad-from-sketchpad-to-modern-parametric-engines
— ikincil blog, **DOĞRULANMADI**).

**Sonuç:** giysi spec'i için diff-tabanlı editleme dünyada henüz yok. Bu bir boşluk, bir engel değil.
**Daha iyisi burada:** GarmentCode'un `Edge.subdivide_len` + `Interface.substitute` + FreeSewing'in
id'li makro/geri-alıcı çifti birleştirilirse, spec seviyesinde gerçek diff üretilebilir:
her primitif demeti bir id alır, bir alanı değiştirmek yalnız o id'nin demetini yeniden çözer,
komşu demetler `StitchingRule.isMatching` ile yeniden doğrulanır. İkisi de MIT.
"Başkası yapmış biz yapamayız" değil — **kimse yapmamış, iki MIT parçası masada duruyor.**

---

## BİZİM SÖZLÜKLE KARŞILAŞTIRMA

Ölçüm dosyası: `knowledge/vocab-menu-vs-malzeme.json` (isim isim etiketli, 132 satır).
Kaynak: `engine/vocab.json`, 37 alan, 132 değer.

| | Sayı | Oran (none hariç) |
|---|---|---|
| **MENÜ ismi** (bir demet primitife çözülmesi gereken stil adı) | **74** | **%67** |
| **MALZEME** (operasyon / landmark / oran / eksen) | **36** | %33 |
| `none` sentineli | 22 | — |
| TOPLAM | 132 | |

### Kritik bulgu: "dondurulmuş eksen" menüleri

`skirtLength: mini|midi|maxi`, `topLength: cropped|hip|tunic`, `sleeveLength: short|elbow|long` —
bunlar stil ismi bile değil, **sürekli bir uzunluk eksenine çakılmış 3 isim.** 9 değer, tek bir
gerçek parametreyi (landmark'tan itibaren cm) taşıyor. En kolay kaldırılacak menü bunlar:
her biri `Interface`/landmark üzerinden bir orana çözülür, ara değerler bedava gelir.
Şu an "mini ile midi arası" çizilemez — sözlük buna izin vermiyor.

### 74 menü isminin primitif demetlerine çözümü (örnekler)

Aşağıdaki eşlemeler A/B/C'de adı doğrulanmış primitiflere yapılmıştır. Eşlemenin kendisi
benim tasarım önerimdir, kaynaktan alıntı değil → **DOĞRULANMADI**, Damla onayı ister.

| Menü ismi | Çözüldüğü primitif demeti |
|---|---|
| `neckline.sweetheart` | `EdgeSequence` = 2× `CurveEdge` (bust apex'e doğru kontrol noktası) + orta noktada `Edge` birleşimi; derinlik = `subdivide_len(fraction)` |
| `neckline.vNeck` | 2× düz `Edge`, omuz landmark'ından `shiftTowards` ile derinlik oranı |
| `neckline.scoop` / `crew` / `boat` | tek `CurveEdge`, tek fark kontrol noktası + derinlik oranı (üç ayrı isim, tek eksen) |
| `neckline.halter` | boyun `Interface`'i + omuz dikişinin kaldırılması + strap `Panel` |
| `neckline.cowl` | boyun `Interface` üzerinde `ruffle > 1` + eğik grain (DXF katman 7) |
| `peplum.full/half/pointed` | bel `Interface`'inden ayrı `Panel` + sweep açısı (full=360°, half=180°) + `hemShape` |
| `sleeveStyle.balloon` | kol kapağı `Interface.ruffle > 1` + kol ağzı `ruffle > 1` (iki sayı) |
| `sleeveCap.puffed` / `cap` | tek eksen: cap `ruffle` katsayısı + cap yüksekliği |
| `collarType.peterPan/flat/stand/mock/shirt/crescent` | boyun `EdgeSequence`'ının kopyası + stand yüksekliği (mm) + `collarEdge` profili → 6 isim, 2 sayı |
| `shoulderStyle.raglan` | omuz `Interface`'inin armhole'a doğru yeniden bölünmesi = `subdivide_param` + `Interface.substitute` |
| `backOpening.round/lowV/square/keyhole` | arka panel `EdgeSequence`'ına iç kesim (DXF katman 11) + derinlik oranı |
| `pocketStyle.patch/sideSeam/slash` | ayrı `Panel` + `StitchingRule` (patch), ya da yan dikiş `Edge`'inin `subdivide_len` ile bölünmesi (sideSeam) |
| `tieClosure.*` (8 isim) | (konum landmark) × (form: tie / bow) = 2 alan, 8 isim yerine |
| `hemShape.shirttail/highLow/pointedV` | etek `Edge`'i → `CurveEdge`, ön/arka uzunluk farkı tek sayı |
| `cupSeam.bugra`, `locketTop.bugra` | isim bir kişiye bağlı, geometriye değil. Sözlükten çıkması gereken en net iki kalem. |

**`bugra` iki alanda geçiyor** (`cupSeam`, `locketTop`). Bir stilin adı bir insanın adı olamaz —
bu, menü probleminin en saf hali. K10 kapsamında değil, sözlük kararı, Damla'ya ait.

### Bizim sözlükte OLMAYAN ama dünyada temel olan şeyler

Bunlar 132 değerin hiçbirinde yok, ama A/B/C/E'de hepsinde var:

1. **Dikiş payı (seam allowance).** FreeSewing'de `sa` makrosu + ayar; ASTM'de katman 14 ayrı geometri.
   Bizde `contract` seviyesinde bir alan değil. (`knowledge/seam-line-offset-2026-08-17.md` konuyu
   biliyor ama sözlükte alan yok.)
2. **Grain line / kumaş yönü.** ASTM katman 7, FreeSewing `grainline` makrosu. Bizde YOK.
   Kesim yönü olmadan çıktı kesilemez.
3. **Notch / çentik.** ASTM'de 5 ayrı tip, 5 katman. AccuMark'ta "walk pieces"in dayanağı. Bizde YOK.
4. **Cut-on-fold.** FreeSewing `cutOnFold`, ASTM katman 6 "mirror line". Bizde YOK —
   ama `Panel.mirror(axis)` olmadan hiçbir simetrik panel doğru kesilemez.
5. **Ease'in bölge bazlı olması.** FreeSewing `seatEase`/`sleeveEase` ayrı. Bizde `fabric: woven|knit`
   iki kelimeye sıkışmış.
6. **Ruffle katsayısı.** GarmentCode'da her `Interface`'in özniteliği. Bizde `gatherType` + `gatherZone`
   iki menü alanı — sayı yok, isim var.

Bu altı kalem "menüyü sil"den daha acil: sözlükte menü fazlası var **ve** malzeme eksiği var.

---

## BİZE DÜŞENLER — hangi fazı besliyor

1. **Sözlük fazı:** 74 menü isminin primitif demeti eşlemesi (yukarıdaki tablo, tamamı
   `vocab-menu-vs-malzeme.json`'da isim isim duruyor). En kolay 9 kalem: `skirtLength` +
   `topLength` + `sleeveLength` → tek oran ekseni.
2. **Motor fazı:** eksik 6 malzeme (sa, grainline, notch, cutOnFold, bölge-ease, ruffle katsayısı).
   Bunlar yeni menü değil, yeni malzeme — sözlüğü büyütmüyor, tabanı genişletiyor.
3. **Kapı/test fazı:** "walk pieces" testi = `StitchingRule.isMatching` mantığında bir yeni test.
   Var olan teste dokunmadan eklenir, menü sözlüğünden bağımsız çalışır, her kalıpta geçerlidir.
   Eşiğini motorun kendi çıktısından türetmek YASAK — GarmentCode'un `tol=0.05`'i onların yayınlanmış
   bandıdır, referanstır; bizim kapımızın eşiği Damla'nın kararı.
4. **Foto+prompt fazı:** bağlam-koşullu alan kapatma (ChatGarment'ın 900→350 yöntemi).
   Üst beden çizilirken etek alanları prompt'a hiç girmez.
5. **Editleme fazı:** dünyada emsal yok. FreeSewing'in id'li makro/geri-alıcı deseni (MIT) +
   GarmentCode'un `Interface.substitute` (MIT) birleştirilerek spec-diff kurulabilir.

---

## GÖREMEDİKLERİM / ERİŞEMEDİKLERİM

- `wiki.seamly.io/wiki/UserManual:Tools:Points` — **HTTP 403.** Seamly araç sınıflarının insan-okur
  adları teyit edilemedi. Sınıf adları repo ağacından alındı, doğru.
- `minervapatterns.com` (iki sayfa) — **HTTP 403.** AAMA katman numaraları tablosu bulunamadı.
- ASTM D6673-10 tam metni — **paralı, erişilemedi.** Katman tablosu Patro dokümantasyonu üzerinden.
  Standart **2019'da geri çekildi**, bunu bilerek kullan.
- Gerber AccuMark PDF'i (`gerbertechnology.com/pdf/AccuMark_E.pdf`) doğrudan çekilmedi;
  "walk pieces" alıntısı arama özetinden. **DOĞRULANMADI.**
- Optitex / Browzwear / CLO3D birincil dokümanlarının hiçbirine bakılmadı. D bölümü zayıf.
- `arxiv.org/pdf/2605.26391` (Garment Particles) ve `arxiv.org/abs/2412.08603` (Design2GarmentCode)
  yalnızca özet seviyesinde okundu, tam metin okunmadı.
- GarmentCode'un **veri seti** lisansı ayrı olabilir; sadece kod deposunun MIT olduğunu doğruladım.
  Veri seti kullanılacaksa lisansı ayrıca kontrol edilmeli.
- Telifli görsel indirilmedi, `patterns_real/` açılmadı, motor koduna dokunulmadı.

## SORULMADI AMA ÖNEMLİ

- **Görev metni `contract/vocab.json` diyor — böyle bir dosya YOK.** Gerçek sözlük `engine/vocab.json`.
  Repoda 10 tane `vocab*` dosyası var (`dataset/vocab-canonical.json`, `backend/vocab.gen.js`,
  `vision-student/vocab.py`, `engine/src/vocab.gen.hpp`, `web/js/vocab.gen.js`,
  `engine/pattern-bridge/vocab.py`, `engine/tools/vocab-sweep.cpp`). `engine/vocab.json` içindeki
  `_source` notu bunu açıklıyor: tek kaynak orası, gerisi `node engine/tools/gen-vocab.mjs` ile üretiliyor.
  **Bir sözlük değişikliği en az 5 üretilmiş dosyayı etkiler** — menü temizliği ucuz bir iş değil.
- Görev metnindeki **FreeSewing `armhole` makrosu YOK.** Makro listesi doğrulandı, içinde yok.
- `engine/vocab.json` içinde `synonyms` mekanizması zaten var (`puff→balloon`, `gored→gore`,
  `bias→biasBinding`). Menü isimlerini primitif demetine çözerken bu alan, geriye dönük uyumluluğun
  hazır yeri — eski isim girer, primitif çıkar, dış API kırılmaz.
- `int` tipli 30 alan var ve `values[]` sırası enum değeri demek. **Menü isimlerini silmek =
  enum değerlerini kaydırmak.** `engine/vocab.json` `_source` notu bunu açıkça söylüyor.
  Kaydedilmiş her spec/dataset bundan etkilenir. Silme değil, deprecate + eşleme yolu daha güvenli.
- `contract/spec-grammar.json` içinde zaten `gecersiz_kombinasyonlar` ve `kumas_siniflari` var.
  ChatGarment'ın yöntemi bunun bir adım ötesi, sıfırdan kurulacak bir şey değil.
