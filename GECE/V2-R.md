# V2-R — ARAŞTIRMA ÇIKTISI

Kart: `GECE/KART/V2-R-arastirma.md` (R-kartı, §5.1). Girdi dosyaları kartta isim isim.
Bu dosyanın tek yazarı V2-R işçisidir; V2-A ve V2-B kartlarının girdisidir.

**Kaynak disiplini:** Bölüm 1 ve 2'deki her künye BİRİNCİL kaynaktan (repo raw dosyası,
GitHub API, resmî dokümantasyon, yayın DOI'si) bu koşuda çekildi. `knowledge/TEKNOLOJI-2026-08-23.md`
bu koşuda kanıt olarak KULLANILMADI ve hiçbir yerde kaynak gösterilmedi.
Erişilemeyen her kalem "ERİŞİLEMEDİ" + denenen URL ile duruyor. Bölüm 3'ün her satırı
bu makinede koşan bir komutun çıktısıdır; komut satırın yanında yazılı.

---

# BÖLÜM 1 — ÜÇ DÜNYA EMSALİNİN PRİMİTİF ÜÇGENİ

## 1.0 Lisanslar (birincil, bu koşuda çekildi)

| Emsal | Lisans | Kaynak |
|---|---|---|
| GarmentCode / PyGarment | **MIT** — `Copyright (c) 2024 Maria Korosteleva` | `raw.githubusercontent.com/maria-korosteleva/GarmentCode/main/LICENSE` · PyPI `pygarment` 2.0.2 (18 Nis 2025) metadata `license: MIT`, `pypi.org/pypi/pygarment/json` |
| Seamly2D | **GPL-3.0** (repo geneli; GitHub API `spdx_id: GPL-3.0`, varsayılan dal `develop`) — ⚠ vendor'lanmış `src/libs/qmuparser/` **BSD** (`LICENSE_BSD.txt`), yani repo alt-kütüphane düzeyinde tek-lisanslı DEĞİL | `raw.githubusercontent.com/FashionFreedom/Seamly2D/develop/LICENSE` · `api.github.com/repos/FashionFreedom/Seamly2D` |
| FreeSewing | **MIT**, monorepo geneli (`spdx_id: MIT`); `designs/` altındaki ~85 tasarım paketi aynı monorepo'da, aynı lisans | `api.github.com/repos/freesewing/freesewing` |

**Lisans hükmü:** GarmentCode ve FreeSewing'den **FİKİR ve İSİMLENDİRME** alınabilir (MIT,
atıfla kod bile alınabilir). Seamly2D **GPL-3.0**: fikir/ayrım serbest, **kod alınmaz** —
bizim ağaç private ama ürün satılacak, GPL bulaşması kabul edilemez. Seamly2D'den alınan her
şey "aynı problemi bağımsız çözdük" olmak zorunda, satır kopyası değil.

## 1.1 Yayın künyeleri (GarmentCode)

- Maria Korosteleva, Olga Sorkine-Hornung. **"GarmentCode: Programming Parametric Sewing Patterns."**
  *ACM Transactions on Graphics* 42(6), Aralık 2023 (SIGGRAPH Asia 2023), 16 s.
  DOI `10.1145/3618351` · arXiv `2306.03642`.
- Korosteleva, Kesdogan, Kemper, Wenninger, Koller, Zhang, Botsch, Sorkine-Hornung.
  **"GarmentCodeData: A Dataset of 3D Made-to-Measure Garments With Sewing Patterns."**
  *ECCV 2024*, LNCS. DOI `10.1007/978-3-031-73027-6_7` · arXiv `2405.17609v3`. 115.000 veri noktası.

Seamly2D ve FreeSewing'in hakemli yayını YOK; birincil kaynak repo + dokümantasyondur.

## 1.2 KIYAS TABLOSU

`bizdeki karşılığı` sütunu = `contract/primitives-v1.json` alanı. Yoksa **YOK**.

### GarmentCode / PyGarment (MIT) — dizin `pygarment/garmentcode/` (11 dosya)

| Primitif | Bizdeki karşılığı | Kaynak | Hüküm |
|---|---|---|---|
| `Edge` (edge.py:13) — `length`, `midpoint`, `shortcut`, `as_curve`, `linearize`, `reverse`, `rotate`, `snap_to`, `subdivide_len`, `subdivide_param` | `primitifler.edge` + `edge.turetilen.length/midpoint` + `operatorler.reverse/rotate/subdivideLen` | `raw.../main/pygarment/garmentcode/edge.py` | **ALINDI** — bizim `edge` bloğu birebir bu ayrımın karşılığı. |
| `CircleEdge` (edge.py:217), `CurveEdge` (edge.py:395) | `edge.kind` enum `["line","curve","circleArc"]` | edge.py:217, :395 | **ALINDI** — üç kind bu üç sınıfa denk. |
| `EdgeSequence` (edge.py:575) — `isLoop`(:615), `isChained`(:619), `fractions`(:631), `substitute`, `chained_order`(:850), `close_loop`, `snap_to`, `bbox` | **YOK** (bizde `panel.edges` düz bir dizi; halkalık `panel` tanımında CÜMLE, nesne değil) | edge.py:575-850 | **ALINIR** — `isLoop`/`isChained`/`substitute` bir kapının dayanağı olur; `panel.edges`'in "kapalı halka" şartı bugün sadece prozada duruyor. |
| `Edge.snap_to` — bir kenarı diğerinin ucuna kilitleme | **YOK** | edge.py | **ALINMAZ (şimdilik)** — bizim panelleri tek yüzeyden kesiyoruz, uç kaynağı problemi yok. |
| `ILENGTH_S_TOL = 1e-10` (edge.py:9) | **YOK** | edge.py:9 | **ALINMAZ** — bizim bandımız 0.79375mm üretim toleransı, 1e-10 onların iç sayısal eşiği. |
| `Panel` (panel.py:8) + `is_self_intersecting`(:37) + `bbox`/`bbox3D` | `primitifler.panel` + `turetilen.isSelfIntersecting`/`bbox`/`area` | panel.py:8, :37 | **ALINDI**. |
| `Panel.add_dart` (panel.py:195) → gövdesi `operators.cut_into_edge` (operators.py:65) | `op.suppress` | panel.py:195, operators.py:65 | **ALINDI** — "pens bir stil değil, kenara uygulanan operatör" ayrımının kaynağı. |
| `Panel.mirror`(:169) | `panel.mirrorAxis` enum `["none","x","y"]` | panel.py:169 | **ALINDI**. |
| `Panel.set_pivot`(:63) / `top_center_pivot`(:89) / `rotate_align`(:138) / `autonorm`(:154) / `point_to_3D`(:275) / `norm`(:283) | **YOK** — panelin 3B yerleşimi/normali bizim primitifte hiç yok | panel.py | **ALINMAZ** — bu 3B drape içindir; RULES §"Scope: 2D engine first, 3D-derived correctness deferred" (2026-07-15) gereği ertelenir. |
| `Interface` + **`ruffle`** özniteliği (liste verilirse `assert len(ruffle)==len(edges)`) | `seam.ratio` + `op.gather.ratio` + `op.split.seamRatio` + `op.attach.ratio` + `op.overlay.excessRatio` | interface.py | **ALINDI** — "büzgü bir isim değil bir SAYI" hükmünün kaynağı. ⚠ onlarda ruffle KENAR BAŞINA vektör olabiliyor, bizde dikiş başına TEK skaler. |
| `Interface.substitute` / `reorder` / `flip_edges` / `from_multiple` / `_is_order_matching` | **YOK** (bizde `seam.a`/`seam.b` `edgeRef[]` — küme var, yeniden sıralama operatörü yok) | interface.py | **ALINIR (kısmi)** — `from_multiple` = "N kenar M kenara dikilir"; bizim `edgeRef[]` bunu taşıyor ama sıra/yön kuralı tanımsız. |
| **`StitchingRule.isMatching(tol=0.05)`** (connector.py:41) — `np.allclose(frac1, frac2, atol=0.05)` göreli KESİR üzerinde | `seam.not_esik` — **açıkça "TANIMLI DEĞİL"** | connector.py:41 | **REFERANS, ALINMAZ** — 0.05 onların BANDI, bizim eşiğimiz Damla'nın kararı (SSC). Sayı artık künyeli: kesir uzayında 0.05. |
| `connector.py:33-36` — uzunluk uyuşmazlığı uyarısı `tol=0.3` (**= 3 mm**), üstelik `if verbose` arkasında | `seam.easeMM` var ama eşiği yok | connector.py:33-36 | **REFERANS** — 3mm onların "görünür" bandı; bizim üretim toleransımız 0.79375mm, yani 3.8× daha sıkı. |
| ⚠ `StitchingRule.__init__`: `if not self.isMatching(): self.match_interfaces()` | bizde karşılığı YOK | connector.py | **ALINMAZ — TERSİ ALINIR.** Onlar uyuşmazlıkta kenarı SESSİZCE yeniden bölüyor, hata atmıyor. RULES invariant 1 (sessiz düzeltme yasak) bunun tam zıddı; bu davranış bizim `green and unsewable` sayımızın da sebebidir. |
| `Component` (component.py:8) + `assembly`(:80) rekürsif montaj | `_katmanlar.2_bilesen` + `bilesenler` bloğu (bodice/sleeve/skirt/collar/cuff/band/overlay) | component.py:8, :80 | **ALINDI**. |
| `operators.py` — **sınıf YOK**, 14 serbest fonksiyon: `cut_corner`(:11), `cut_into_edge`(:65), `cut_into_edge_single`(:131), `distribute_Y`(:236), `distribute_horisontally`(:254), **`even_armhole_openings`**(:276), `_avg_curvature`(:337), `_max_curvature`(:346), `_bend_extend_2_tangent`(:355), **`curve_match_tangents`**(:389), `_fit_scale`(:440) | `op.*` yedilisi (`suppress/gather/flare/extend/split/overlay/attach`) — ama **`curve_match_tangents` ve `even_armhole_openings` karşılığı YOK** | operators.py | **`curve_match_tangents` ALINIR** — iki kenarın birleştiği yerde teğet sürekliliği; bizim G5 (omuz/kol oyuğu/yaka) işinin tam ortasındaki problem, ve bizde adı bile yok. `even_armhole_openings` ALINIR (ön/arka oyuk dengelemesi — CLAUDE.md'de "yan dikiş ön/arka +9.4mm" diye açık duran kalem). |
| **Kapalı isim listesi: EVET var.** `assets/design_params/default.yaml`, 85 parametre: `float` 42 · `bool` 16 · `int` 9 · **`select` 9 · `select_null` 9**. `meta.upper: [FittedShirt, Shirt, null]`, `meta.bottom: [SkirtCircle, AsymmSkirtCircle, GodetSkirt, Pants, Skirt2, SkirtManyPanels, PencilSkirt, SkirtLevels, null]`, yaka `[CircleNeckHalf, CurvyNeckHalf, VNeckHalf, SquareNeckHalf, TrapezoidNeckHalf, CircleArcNeckHalf, Bezier2NeckHalf]`, `component.style [Turtle, SimpleLapel, Hood2Panels, null]`, `armhole_shape [ArmholeSquare, ArmholeAngle, ArmholeCurve]`, `cuff.type [CuffBand, CuffSkirt, CuffBandSkirt, null]` | `engine/vocab.json` — 37 alan, 132 değer (ölçüldü, Bölüm 3) | `raw.../main/assets/design_params/default.yaml` | **DOĞRULANDI, KIYAS BİZİM LEHİMİZE DEĞİL AMA ALEYHİMİZE DE DEĞİL** — dünyanın en çok atıf alan giysi-DSL'i de kapalı menü tutuyor. Fark: onların menü değeri bir **Python sınıf adı**, çözümü `globals()[name]` ile bulunuyor (meta_garment.py:48,55,63); bizimki bir string ve çözümü `contract/vocab-resolution-v1.json` tablosunda. Bizim tablo DENETLENEBİLİR, onlarınki değil. |
| Tarif→primitif çözümü: YAML string → `globals()[self.upper_name]` (meta_garment.py:48/55/63) → `Component.assembly()` → `Panel.assembly()` → `Edge.assembly()` | `contract/vocab-resolution-v1.json` `resolutions` (132 kalem) + kapı `engine/tests/preset_resolve_check.cpp` | meta_garment.py:48-63 | **BİZİMKİ DAHA SERT** — onlarda çözülemeyen isim ÇALIŞMA ZAMANINDA patlar; bizde `absent` + `absentReason` ile işaretli ve ctest kapısı var. |
| ⚠ `MetaGarment` yalnızca 3 slot: upper + lower + belt | bizde `bilesenler` 7 kalem, slot sınırı YOK | meta_garment.py:21 | **ALINMAZ** — sabit üçlü kompozisyon bizim `op.attach`/`op.overlay`'imizden dar. |

### Seamly2D (GPL-3.0) — dizin `src/libs/vtools/tools/`, dal `develop`

Tool envanteri **kaynaktan** çıkarıldı; ⚠ **resmî wiki ERİŞİLEMEDİ**
(`wiki.seamly.net/wiki/UserManual:Tools:Points/en` → ECONNREFUSED;
`wiki.seamly.io/wiki/UserManual:Tools:Points/en` → HTTP 403). Aşağıdaki isimler C++ SINIF
adlarıdır; UI etiketleriyle birebir eşleşmeleri **DOĞRULANMADI**.

**Format sözleşmesi (bizde emsali olmayan bir disiplin):** `src/libs/ifc/schema/` altında dört
şema ailesi — `pattern/` (.val), `individual_size_measurements/` (.vit),
`multi_size_measurements/` (.vst), `label_template/`. `pattern/` içinde **51 sürümlenmiş XSD:
`v0.1.0.xsd` → `v0.7.4.xsd`**, yani makinece denetlenebilir, göç geçmişli, sürüm-başına format
kontratı (`api.github.com/repos/FashionFreedom/Seamly2D/contents/src/libs/ifc/schema/pattern?ref=develop`).

| Primitif | Bizdeki karşılığı | Kaynak (dizin, `?ref=develop`) | Hüküm |
|---|---|---|---|
| **Kesişim/teğet kurucuları** (10 araç): `vtoollineintersect`, `point_intersectxy_tool`, `vtoolpointofcontact`, `vtoolpointofintersectionarcs`, `vtoolpointofintersectioncurves`, `intersect_circles_tool`, `intersect_circletangent_tool`, `vtoolpointfromarcandtangent`, `vtoolcurveintersectaxis`, `vtoollineintersectaxis` | **YOK** — bizde tek konum operatörü `edge.operatorler.shiftTowards` (oran) ve `atFraction` (yay uzunluğu kesri) | `.../drawTools/toolpoint/toolsinglepoint` | **ALINIR — BU, KARTIN SORDUĞU ASIL BOŞLUK.** Bir nokta "şu iki yayın kesiştiği yer" diye tanımlanabiliyor; bu bir ÇÖZÜLEN KISIT, bir ofset değil, ve `edge/panel/seam/op` sözlüğünde ifadesi yok. Bizim G5'te kol oyuğu-omuz-yaka birleşimi tam olarak kesişim problemi. |
| `vtoolshoulderpoint` (çember∩doğru, omuz eğimi çözümü), `vtoolbisector`, `vtoolheight` (dikme ayağı), `vtoolnormal`, `vtoolalongline`, `vtoolendline` (mesafe+açı), `vtooltriangle` | **YOK** | `.../toolpoint/toolsinglepoint/toollinepoint` | **ALINIR (kısmi)** — en az `shoulderPoint` ve `perpendicularFoot`; ikisi de bizim omuz/oyuk işimizde elle yazılıyor. |
| **`vtooltruedarts`** — `tooldoublepoint/` dizininin **TEK** üyesi; çıktı arity'si **2 nokta** | `op.suppress` (`atFraction`, `angleDeg`, `apexDepthMM`, `trueLegs:bool`) — tek çıktılı | `.../drawTools/toolpoint/tooldoublepoint` | **KISMEN VAR, YAPISI FARKLI.** Bizim `trueLegs: true` bir BAYRAK; onlarınki iki noktayı birden üreten bir araç. Tek-çıktılı primitif modeli bunu barındıramaz. V2-A'da `op.suppress`'in çıktı arity'si açıkça yazılmalı. |
| `internal_path_tool` + `anchorpoint_tool` + `vpiecepath` — parçanın İÇİNDE, sınırı olmayan geometri | **YOK** | `.../tools/nodeDetails`, `src/libs/vpatterndb` | **ALINIR** — cep yeri, pens çizgisi, katlama işareti, düğme yeri: hepsi iç yol. Bizde `op.attach.position` enum'u bir bölge adı veriyor ama panel içi geometri taşıyamıyor. |
| **`operation/` toolbar** (ortak taban `vabstractoperation`): `vtoolmove`, `vtoolrotation`, `vtoolmirrorbyaxis`, `vtoolmirrorbyline` — NESNE KÜMELERİ üzerinde çalışır, ürettiği kopyalar orijinallere **bağlı kalır** | `panel.mirrorAxis` (tek panel, tek eksen) | `.../drawTools/operation`, `.../operation/mirror` | **ALINIR** — "bir çiz aynalı kes" (KOŞU 4B) bizde zaten var ama SONUÇ olarak var, PRİMİTİF olarak yok. Bağlı türev kopya = düzenleme yerelliği (F-I) kapısının doğal dayanağı. |
| `union_tool` — iki kalıp parçasını TEK parçaya birleştirme | **YOK** | `.../vtools/tools` | **ALINIR** — bizim `cutplan`'ın "eş panelleri birleştir" işi çizim sonrası bir eşleştirme; primitif olarak tanımlı değil. |
| **`src/libs/qmuparser/`** — vendor'lanmış **muParser** çatalı (BSD), bytecode derlemeli (`qmuparserbytecode`), token okuyucu, yerelleştirme (`qmutranslation`, `vtranslatevars`, `vtranslatemeasurements`). Her uzunluk/açı alanı, adlandırılmış değişkenler üzerinde **sembolik ifade**; `vformula`/`calculator` ile `vcontainer`'a karşı değerlendirilir. Değişkenler: ölçüler, increments ve **önceki nesnelerin türetilmiş özellikleri** (`vpatterndb/variables/` — çizgi uzunlukları, yay uzunlukları, açılar) | **YOK** — bizim primitiflerin hepsi SABİT SAYI ya da enum; hiçbir alan başka bir nesnenin ölçüsünü okuyamaz | `api.github.com/.../contents/src/libs/qmuparser?ref=develop` · `.../src/libs/vpatterndb?ref=develop` | **EN BÜYÜK FARK. ALINMAZ — BİLİNÇLİ REDDEDİLİR.** Formül motoru, kullanıcıya kod yazdırmaktır; `garment-spec-v2.schema.json` açıklaması zaten "arapRounds yazan bir LLM kod yazıyor" diyor. AMA sonucu ALINIR: **bir kenarın uzunluğunun başka bir kenarın parametresi olabilmesi** bizde bugün imkânsız ve bu, ease/oyuk-kapak eşitliğini kontratta ifade edememenin sebebi. V2-A'da `seam.ratio`'nun "ölçülen"den türeyebilmesi tartışılmalı. |
| `.vit` (bireysel) vs **`.vst` (çok-beden, gradeli)** — iki AYRI şema ailesi; grade, kalıptan bağımsız bir DOSYA FORMATI kavramı | primitifte **YOK**; bizde `contract/layers/size-table.json` (bekçi `gen-size-table.py --check`) — ama `primitives-v1.json`'da grade diye bir alan yok | `src/libs/ifc/schema/multi_size_measurements` | **ALINIR (ayrım olarak)** — grade primitifin değil, ÖLÇÜ KAYNAĞININ özelliği. Bizde bu ayrım kodda var, kontratta yok. |
| Eğriler: `vtoolarc`, `vtoolarcwithlength`, **`vtoolellipticalarc`**, `vtoolspline`, `vtoolsplinepath`, `vtoolcubicbezier`, `vtoolcubicbezierpath` (7 sınıf) | `edge.kind` üç değer: `line`/`curve`(kübik)/`circleArc` | `.../drawTools/toolcurve` | **`ellipticalArc` ALINIR mı — HAYIR.** KOŞU 4B'de ease Steiner-tam olarak "elipsin paralel eğrisi"nden çözüldü; elips bizde ÇÖZÜCÜDE var, KENARDA yok ve olması da gerekmiyor (kübik fit `engine/src/curvefit.*` yeterli). `arcWithLength` (yay uzunluğuyla tanımlı yay) **ALINIR** — dikiş uzunluğu eşitliği bizim tek kapımız. |
| Parça sınırı = draw-mode nesnelerine **REFERANS** listesi (`vnodepoint`/`vnodearc`/`vnodespline`...), kopyalanmış geometri DEĞİL | `panel.edges: edge[]` — gömülü, referans değil | `.../tools/nodeDetails` | **ALINIR** — iki panelin AYNI kenarı paylaşması (dikiş = paylaşılan kenar) bizde `seam.a`/`seam.b` ile ikinci kez ifade ediliyor; referans modeli bu tekrarı ve onunla gelen tutarsızlığı kökten öldürür. |
| ⚠ Parça başına dikiş payı / passmark alan adları | `panel.seamAllowanceMM`, `seam.notchFractions` | `vpiecenode.h` açılmadı | **DOĞRULANMADI** — wiki erişilemedi, başlık dosyası çekilmedi. |
| **Kapalı giysi-stili isim listesi: YOK.** Araç ağacında hiçbir stil enum'u yok; XSD `pattern/` şemaları ARAÇ elemanlarını tanımlar, giysi tiplerini değil. `pmsystems` bir liste ama **giysi değil, ÇİZİM SİSTEMİ** (Müller vb.) listesi | `engine/vocab.json` 37 alan / 132 değer | kaynak ağacı; ⚠ doküman düzeyinde **DOĞRULANMADI** (wiki erişilemedi) | **BİZDEN FARKLI YÖN.** Seamly2D bir çizim aleti, biz bir sözlük motoruyuz. Bu bir eksiklik değil, ayrı bir ürün kararı — ama "sözlüğü olan tek biz değiliz" iddiasını Seamly2D DESTEKLEMEZ, GarmentCode destekler. |

### FreeSewing (MIT) — `freesewing.dev/reference/*`, `api.github.com/repos/freesewing/freesewing`

| Primitif | Bizdeki karşılığı | Kaynak | Hüküm |
|---|---|---|---|
| `Point.shiftTowards()`, `Point.shiftFractionTowards()` | `edge.operatorler.shiftTowards {target, fraction}` | `freesewing.dev/reference/api/point` | **ALINDI** — bizim `shiftTowards` adı doğrudan buradan; iki emsalin bağımsız aynı primitife varması `primitives-v1.json` başlığındaki iddiayı DOĞRULUYOR. |
| `Point`: `rotate`, `flipX`, `flipY`, `angle`, `dist`, `dx`, `dy`, `slope`, `translate`, `shiftOutwards`, **`sitsOn()` (tam eşitlik) / `sitsRoughlyOn()` (mm-toleranslı)** | `edge.operatorler.rotate` var; `sitsOn`/`sitsRoughlyOn` karşılığı **YOK** | `.../api/point`, `.../api/point/sitson/` | **`sitsRoughlyOn` ALINIR** — "iki nokta AYNI mı" sorusunun toleranslı hâli, `preset_resolve_check` ve dikiş grafiği için gereken tam şey; bizde bu karar her kapıda yeniden gömülü sayı olarak yazılıyor. |
| `Path`: `move`, `line`, `curve`, `curve_`, `_curve`, `smurve`, `smurve_`, `close`, `offset`, `split`, `divide`, `combine`, `join`, `trim`, `clean`, `reverse`, `rotate`, `translate`, `length`, `roughLength`, `bbox`, `angleAt`, `circleSegment`, `edge`, `insop`, `noop`, `projectPoint`, **`intersects`, `intersectsX`, `intersectsY`, `intersectsBeam`**, `measureAlong`, `shiftAlong`, `shiftFractionAlong` | `edge.operatorler.subdivideLen` (kesir dizisi) `shiftFractionAlong`'un karşılığı; `offset` → `panel.seamAllowanceMM`; **`intersects*`, `projectPoint`, `trim`, `clean`, `divide`, `combine` YOK** | `freesewing.dev/reference/api/path` | **`intersects*` + `projectPoint` ALINIR** (Seamly2D'nin kesişim ailesiyle aynı boşluk, ikinci bağımsız tanık). `trim`/`clean` **ALINMAZ** — bizim kenarlar tek yüzeyden kesiliyor, artık uç yok. |
| `Path.offset()` | `panel.seamAllowanceMM` + `offsetOutline` (`engine/src/geometry.cpp:219`) | `.../api/path` | **ALINDI**. |
| Makro **`sa`** | `panel.seamAllowanceMM` (0..30mm) | `freesewing.dev/reference/macros` | **ALINDI**. |
| Makro **`grainline`** | `panel.grainAngleDeg` (0..360, 45 = bias) | aynı | **ALINDI**. |
| Makro **`cutOnFold`** (⚠ camelCase, `cutonfold` değil) | `panel.onFold` + `panel.mirrorAxis` | aynı | **ALINDI**. |
| Makro **`ringSector`** | `op.flare {sweepDeg, hemFactor}` | aynı | **ALINDI**. |
| Makro **`pleat`** | **YOK** — `garment-spec-v2.schema.json` `suppression` enum'unda `"pleat"` bir İSİM olarak var (Bölüm 3'te ölçüldü) ama `primitives-v1.json`'da onu çizen operatör YOK | aynı | **ALINIR — AÇIK ÇELİŞKİ.** Sözlükte adı olan, primitifte karşılığı olmayan bir kalem; `primitives-v1.json` `_yasa` md.1'in ("çözülmeyen isim sözlüğe GİRMEZ") ihlali. V2-A'nın ilk kalemi. |
| Makro **`hem`** | **YOK** (bizde `op.extend.fromLandmark: "hem"` bir KONUM adı, bitiş operatörü değil) | aynı | **ALINIR** — etek/kol ucu kıvırması dikiş payından ayrı bir sayıdır. |
| Makro **`sewTogether`** | `seam` | aynı | **ALINDI**. |
| Makro **`bartack`/`bartackAlong`/`bartackFractionAlong`**, `title`, `scalebox`, `miniScale`, `banner`/`bannerBox`, `crossBox`, `sprinkle`, `round`, `flip`, `mirror`, `transform`, `offset`, `join`, `gore`, ve dört boyutlandırma makrosu **`ld`/`hd`/`vd`/`pd`** — toplam **28 makro**, her birinin `rm`-önekli kaldırma karşılığı var | **YOK** — bizim primitiflerde ANOTASYON katmanı hiç yok (etiket, ölçü çizgisi, ölçek kutusu, punteriz) | `freesewing.dev/reference/macros` | **KISMEN ALINIR.** `title`/`scalebox` bizde `printpack`'te KOD olarak var, kontratta yok; `ld/hd/vd/pd` (ölçü çizgileri) alıcının 1:1 baskıyı doğrulaması için gerçek bir kalem. **`round` ALINMAZ** (köşe yuvarlama bizim yüzey hattımızda kendiliğinden çıkıyor). ⚠ Bu satır bir MENÜ genişletmesi değil, `_malzeme_eksigi_kapandi` bloğunun eksik 7. kalemi: **anotasyon**. |
| Parça bağımlılık grafiği: `from` (başka parçanın nokta+yollarını devral) ve `after` (sadece sıra kısıtı) — `Design({parts:[...]})`, tek zorunlu anahtar `parts`; config bağımlılık zinciri boyunca TOPLAMSAL (measurements/options/plugins birleşir) | **YOK** — `bilesenler` bloğu düz bir grup listesi, aralarında yön/sıra/devralma yok | `freesewing.dev/reference/api/design`, `.../api/part/config/` | **ALINIR** — `op.overlay.hostPanel` ve `op.attach.hostEdge` zaten bir bağımlılık ima ediyor ama grafik tanımlı değil; F-I (düzenleme yerelliği) kapısı bu grafiğin üstünde durur. |
| `draft: ({ part }) => part` — tasarım = KOD, kalıp = kodun dönüş değeri | bizde tarif = VERİ (`vocab-resolution-v1.json`), çözüm = tablo | `.../api/part/config/` | **ALINMAZ** — bizim veri modeli denetlenebilir; kodu denetleyemezsin. |
| Seçenek tipleri: `bool`, `const`, `count`, `deg`, **`list`**, `mm` (⚠ kendi dokümanları `mm`'i **önermiyor**), `pct` (min/max/**snap**, `toAbs()`) | `engine/vocab.json` alanları (37) + `garment-spec-v2.json` `quantities` (mm/oran/açı) | `freesewing.dev/reference/api/part/config/options/` | **KISMEN.** `list` **kapalı bir enum'dur** — ama tasarım BAŞINA, tasarımcının ilan ettiği; küresel bir sicil değil. Bizim `vocab.json` küresel. `pct`'nin **`snap`** özelliği (sürekli değeri üretimde anlamlı basamağa yapıştırma) bizde **YOK** ve **ALINIR** — `primitives-v1.json` `_yasa` md.3 ("iki tarif arası her ara değer geçerli") sürekli eksen vaat ediyor; snap, o sürekliliğin kesilebilir hâlidir. |
| Stil isim listesi: **YOK** — `designs/` altında **~85 bağımsız npm paketi** (Aaron, Albert, Bee, Bella, Benjamin, Bent, Bibi, Bob, Bonny, Breanna, Brian, Bruce, Carlita, Carlton, Cathrin, Charlie, Cornelius, Diana, Florence, Florent, Gozer, Hi, Holmes, Hortensia, Huey, Hugo, Jaeger, Jane, Legend, Lily, Lucy, Lumina, Lumira, Lunetius, Magde, Noble, Octoplushy, Onyx, Opal, Otis, Paco, Penelope, Sandy, Shelly, Shin, Simon, Simone, Skully, Sven, Tamiko, Teagan, Tiberius, Titan, Trayvon, Tristan, Uma, Umbra, Wahid, Walburga, Waralee, Yuri, ...) | `engine/vocab.json` 37 alan / 132 değer | `api.github.com/repos/freesewing/freesewing/contents/designs?ref=develop` — ⚠ fetch "85 dizin" dedi ama ~63 isim saydı; **85 YAKLAŞIKTIR, DOĞRULANMADI** | **BİZDEN FARKLI YÖN** — her stil ayrı paket, ortak menü yok. |

## 1.3 SEAMLY2D SORUSUNUN CEVABI (kartın §1 özel maddesi)

`contract/primitives-v1.json:2` başlık bloğu üç kaynak sayıyor: GarmentCode, FreeSewing, ASTM D6673-10.
**Seamly2D'yi saymıyor.** Ölçülen cevap: **Seamly2D'nin taşıyıp bizde OLMAYAN yedi primitifi var**,
ve bunların hiçbiri diğer iki kaynaktan gelmiyor:

1. **Kesişim/teğet kurucuları** (10 araç ailesi) — çözülen geometrik kısıt, ofset değil.
   ⚠ FreeSewing'de `Path.intersects*` olarak İKİNCİ kez, bağımsız olarak var → boşluk gerçek.
2. **`vtooltruedarts`** — iki noktayı birden üreten araç; çıktı arity'si 2. Bizim `op.suppress` tek çıktılı.
3. **`internal_path_tool` / `anchorpoint_tool`** — panel İÇİ, sınır olmayan geometri.
4. **`operation/` ailesi** — nesne KÜMESİ üzerinde move/rotate/mirror, türev kopya orijinale bağlı kalır.
5. **`union_tool`** — iki parçayı tek parçaya birleştirme.
6. **Formül motoru** (`qmuparser`, BSD) — sembolik ifade + önceki nesnelerin türetilmiş
   özelliklerini okuyabilme. Bizde bir alan başka bir kenarın uzunluğunu okuyamaz.
7. **Kenar REFERANSI ile parça sınırı** (`vnode*`) — paylaşılan kenar tek yerde durur.

**Hüküm:** `primitives-v1.json:2` başlığı **EKSİK KAYNAK BEYANI** taşıyor. Seamly2D sayılmadığı
için yukarıdaki yedi kalem "dünyada yok" gibi görünüyor; **var, ve GPL-3.0 olduğu için
kodunu değil sadece AYRIMINI alabiliriz.** V2-A'nın işi bu başlığı düzeltmek ve yedi kalemin
her birine ALINIR/ALINMAZ hükmü yazmaktır. **Bu kart kod yazmadı, `contract/`'a dokunmadı.**

---

# BÖLÜM 2 — İKİ YENİ KAPININ EŞİĞİ

⚠ Ön ölçüm: `vocab_reference_check` ve `vocab_source_check` **bugün repoda YOK.**
Komut: `grep -rn "vocab_reference_check\|vocab_source_check" . --exclude-dir=.git | wc -l` → **9**,
dokuzunun hepsi `GECE/` altındaki plan/kart/log metni; `engine/`, `contract/`, `web/` altında **0**.
Yani ikisi de öneri aşamasındadır, mevcut davranış değildir.

## 2.1 `vocab_reference_check` — RATCHET SINIFI

**Aday pratikler, künye + şart listesi:**

### a) `betterer` — sınıfın kanonik aracı ("make it better, never worse")
Künye: `github.com/phenomnomnominal/betterer` · `phenomnomnominal.github.io/betterer/docs/introduction`,
`/docs/results-file`, `/docs/running-betterer/`
- Model (verbatim): *"Betterer keeps track of a value as it changes over time, and makes sure that
  the value changes how you want it to change!"*
- *"If it gets better, the `.betterer.results` file will be updated with the new result ✅!
  If it gets worse, your test will fail and Betterer will throw an error ❌!"*
- Sonuç dosyası: `.betterer.results`, "geçerli bir JavaScript dosyası", Jest snapshot'a benzetiliyor;
  *"should be commited along with your code"* ve *"probably shouldn't be updated manually"*.
- *"If the new result is better, the results file will be updated, and that result will be the
  expected baseline going forward."*
- CI kipi: *"You should run Betterer in CI mode (`betterer ci`) when running on a build server."*
  CI kipinde *"will throw an error when the tests results do not exactly match whatever is in the
  results file."*
- Bayraklar: `--update`/`-u` = *"Update the results file, even if things get worse"* (varsayılan `false`);
  `--strict` = *"Hide the 'how to update' message and set `--update` to `false`"*.
- **Meşruiyet şartları (yazarın koyduğu):** (1) taban dosyası commit'li; (2) CI kipi TAM EŞLEŞME
  ister, yani sessiz iyileşme de kırmızı düşer → taban her zaman güncel; (3) `--update` görünür,
  tek ve açık kaçış kapısıdır.
- ⚠ **BU BİR SAYAÇ RATCHET'İ DEĞİL, SNAPSHOT'TIR.** "yalnız düşebilir" diye bir spec yazacaksan
  betterer'ın CI kipi bunun DESTEKLEYİCİSİ değil KARŞI ÖRNEĞİDİR. (Açık konu
  `github.com/phenomnomnominal/betterer/issues/983` "CI mode fails when there are zero issues" —
  **DOĞRULANMADI**, açılmadı.)

### b) PHPStan baseline
Künye: `phpstan.org/user-guide/baseline`
- `--generate-baseline` → `phpstan-baseline.neon` (ya da `.php`): hata mesajları, **görülme SAYILARI**,
  dosya yolları. Config'ten include edildiği için commit'lenir.
- Şartlar (yazarın koyduğu): (1) **az kullan** — "birkaç düzine ila birkaç yüz" hata için uygun,
  15.000+ ise baseline değil kural seviyesi düşürülür; (2) yeni hataları yutmak için baseline'ı
  alışkanlıkla yeniden üretme — aracı işlevsizleştirir ve "neden yok sayıldı" kaydını yok eder;
  (3) **eşleşmeyen baseline kalemleri raporlanır** (artık olmayan hatalar), yani taban
  gürültüsüzce yalnızca KÜÇÜLEBİLİR.

### c) Android Lint baseline (`lint-baseline.xml`)
Künye: `developer.android.com/studio/write/lint`
- *"You can take a snapshot of your project's current set of warnings, then use the snapshot as a
  baseline for future inspection runs so that only new issues are reported."*
- Amaç: *"start using lint to fail the build without having to go back and address all existing
  issues first."*
- `android { lint { baseline = file("lint-baseline.xml") } }`; ilk eklemede dosya üretilir,
  *"From then on, the tools only read the file to determine the baseline."*
- Düzelen kalemler baseline'da izlenir → "gerçekten düzelttin mi" bilinir; hatanın sessizce
  geri gelmemesi için baseline yeniden üretilir (dosyayı sil + tekrar koş).
- **Şart:** baseline dosyası sürüm kontrolüne konur.

### d) detekt baseline
Künye: `detekt.dev/docs/introduction/baseline/`
- İki bölüm: `ManuallySuppressedIssues` (false positive'ler — *"instead of suppressing them and
  pollute your code base"*) ve `CurrentIssues` (*"only new findings are printed on further analysis"*).
- Kalem biçimi `<RuleID>:<Finding_Signature>`.
- **Şart (en sert olanı):** *"auto formatting cannot be combined with the `baseline`. The signatures
  for a `;` for example would be too ambiguous."* → **ratchet, KARARLI ve DETERMİNİST İMZA ister.**

### e) `type-coverage`
Künye: `github.com/plantain-00/type-coverage`
- `--at-least` = "fail if coverage rate < this value"; `--update` = *"if 'typeCoverage' section in
  package.json is present update its 'atLeast' or 'is' value"*; `--strict`; `--suppress-error`
  (hedef tutmasa da exit 0); `--cache` (`.type-coverage` dizini).
- Ratchet mekanizması commit'li `package.json`:
  `"typeCoverage": { "atLeast": 99 }` — `--update` yalnız iyileşince yukarı yazar.
- **Şart:** taban commit'li bir dosyada; CI `atLeast` altında kırmızı düşer.
- ⚠ `typescript-coverage-report` **ERİŞİLEMEDİ** (tur bütçesi; denenmedi).

### f) ESLint `--max-warnings`
Künye: `eslint.org/docs/latest/use/command-line-interface`
- Varsayılan `-1` (kapalı). Verbatim: *"Normally, if ESLint runs and finds no errors (only warnings),
  it exits with a success exit status. However, if `--max-warnings` is specified and the total
  warning count is greater than the specified threshold, ESLint exits with an error status."*
- *"When used alongside `--quiet`, this will cause rules marked as warn to still be run, but not reported."*
- ⚠ **`--update` YOK.** Ratchet ELLE: sayı CI komutunda/config'te durur, insan indirir.
  Drift ancak o sayı commit'li bir dosyadaysa görünür.

### g) Rust `deny(warnings)` — ⚠ KARŞI ÖRNEK, ve kaynağı zayıf
- `rust-unofficial.github.io/patterns/anti_patterns/deny-warnings.html` — *"Sometimes new features or
  old misfeatures need a change in how things are done, thus lints are written that `warn` for a
  certain grace period before being turned to `deny`."* Örnek: `overlapping-inherent-impls`.
  Ayrıca *"sometimes APIs get deprecated, so their use will emit a warning where before there was none."*
  Sonuç: kaynağa gömülü `#![deny(warnings)]`, DERLEYİCİ YÜKSELTMESİNİN tek başına build'i kırmasına
  izin verir. Önerilen alternatif: `RUSTFLAGS="-D warnings"` yalnız CI'da, ya da yalnız adı geçen
  kararlı lint'leri deny et, `deprecated`'ı asla.
- `doc.rust-lang.org/rustc/lints/levels.html` — `--cap-lints LEVEL`: *"This feature is used heavily by
  Cargo; it will pass `--cap-lints allow` when compiling your dependencies."* Bu sayfa
  `deny(warnings)` tartışmasına HİÇ girmiyor.
- ⚠ **ERİŞİLEMEDİ:** `deny(warnings)`'e karşı **resmî rust-lang** (blog/forge/API-guidelines) beyanı
  bulunamadı. Bulunabilen tek kaynak yukarıdaki **topluluk** kitabıdır. "crater" çerçevelemesini
  kullanan hiçbir sayfa bulunamadı. `github.com/rust-lang/rust/pull/31120` (alexcrichton, rustc'nin
  KENDİ build'ini `-D warnings`'ten `#![deny(warnings)]`'e taşıyor) bir uygulama değişikliğidir,
  desen aleyhine argüman DEĞİLDİR — öyle gösterilmemeli.
- ⚠ **ERİŞİLEMEDİ (bu turda alınmadı):** SonarQube "Clean as You Code" (üç doküman URL'i de 404:
  `docs.sonarsource.com/sonarqube-server/latest/user-guide/clean-as-you-code/introduction/`,
  `.../core-concepts/clean-as-you-code/introduction/`, `.../instance-administration/analysis-functions/clean-as-you-code/`);
  `pylint --fail-under` (`pylint.readthedocs.io/en/latest/user_guide/usage/run.html` yalnız TOC döndü);
  mypy/flake8 baseline araçları ve Google "Beyoncé rule" (tur bütçesi, denenmedi — iddia kurulmadı).

### ➜ BİZİM KAPIYA NASIL BAĞLANIR
`vocab_reference_check`, **betterer'ın snapshot'ı değil PHPStan/Android-lint sınıfı bir SAYI
tabanı** olmalı: taban `contract/` altında commit'li tek bir dosyada durur, kapı yalnız sayı
YÜKSELİNCE kırmızı düşer, düşüş tabanı günceller ve o güncelleme diff'te görünür.

**Yayınlanmış FORMÜL YOK** — hiçbir kaynak "kaç referans normaldir" demiyor; hepsi
"bugünkü sayıyı taban al" diyor. §5.1 gereği bant bu makinede ölçülen sayıdan kurulur:

```
node -e 'const v=require("./engine/vocab.json").fields;const s=new Set();
  for(const f in v) for(const x of v[f].values) if(x!=="none") s.add(x);
  console.log([...s].sort().join("\n"));' > /tmp/vocabvals.txt
wc -l < /tmp/vocabvals.txt
# -> 99   (none dışı tekil enum DEĞERİ)

git grep -n -w -F -f /tmp/vocabvals.txt -- engine/src web/js backend engine/tools contract \
  | grep -v '\.gen\.' | wc -l
# -> 11283   (üretilmiş dosyalar hariç, enum DEĞERİ referans satırı)

node -e 'console.log(Object.keys(require("./engine/vocab.json").fields).join("\n"))' > /tmp/vocabfields.txt
git grep -n -w -F -f /tmp/vocabfields.txt -- engine/src web/js backend engine/tools contract \
  | grep -v '\.gen\.' | wc -l
# -> 5724   (alan ADI referans satırı)
```

Lane kırılımı (aynı komut, `-- <dizin>`):
`engine/src` **4158** · `engine/tools` **3041** · `contract` **2881** · `web/js` **1057** · `backend` **146**.

⚠ Bu sayı **V0-0D/V0'ın 7524'ünden farklıdır** — o başka bir kapsamla sayılmış. Hangisinin taban
olacağı V2-A'nın kararıdır; iki sayı KARIŞTIRILMAMALI, taban dosyasına hangi komutun bastığı yazılmalı.

⚠ detekt'in şartı burada bağlayıcı: taban **kararlı imza** ister. Satır sayısı, dosya taşınınca
ya da bir yorum satırı eklenince oynar. V2-A ya (a) sayıyı dosya-bağımsız normalleştirmeli,
ya da (b) betterer gibi tam-eşleşme snapshot'ına geçmeli. **Ara yol yok** — "yalnız düşebilir"
diyen bir kapı, gürültülü bir imza üstünde kurulursa haftada bir yanlış kırmızı basar ve
kapatılır; bu repo o hatayı bir kez yaptı (`preview_truth_check`/`figure_check` haftalarca
"önceden kırık" diye geçildi, CLAUDE.md KOŞU 2).

## 2.2 `vocab_source_check` — ÜRETİLMİŞ ARTEFAKT + REGEN-AND-DIFF

**Aday pratikler, künye + şart listesi:**

### a) Go — `go generate` + üretilmiş kodu commit'leme
Künye: `go.dev/blog/generate`
- *"It's important to understand that `go generate` is not part of `go build`. It contains no
  dependency analysis and must be run explicitly before running `go build`. It is intended to be
  used by the author of the Go package, not its clients."*
- **Commit kuralı (verbatim):** *"Also, if the containing package is intended for import by `go get`,
  once the file is generated (and tested!) it must be checked into the source code repository to be
  available to clients."*
- Direktif sözdizimi: *"The comment must start at the beginning of the line and have no spaces
  between the `//` and the `go:generate`."*
- İşaret konvansiyonu: `// Code generated by stringer -type Pill pill.go; DO NOT EDIT.`
- ⚠ **ERİŞİLEMEDİ:** `go.dev/s/generatedcode` kanonik regexp spec'i — kısa link `pkg.go.dev/cmd/go`'ya
  yönlendi, yeniden çekilmedi. `^// Code generated .* DO NOT EDIT\.$` **DOĞRULANMADI**.

### b) Kubernetes `hack/verify-codegen.sh` — sınıfın en büyük ölçekli emsali
Künye: `github.com/kubernetes/kubernetes/blob/master/hack/verify-codegen.sh` ·
`.../hack/lib/verify-generated.sh`
- `verify-codegen.sh`: `set -o errexit -o nounset -o pipefail`, ve gövdesi tek çağrı:
  `kube::verify::generated 'Generated files need to be updated' 'Please run hack/update-codegen.sh' hack/update-codegen.sh`
- `kube::verify::generated` mekanizması — **alıntılanacak olan tam budur:**
  1. `git worktree add -f -q "${_tmpdir}" HEAD` — commit'li ağacın el değmemiş izole kopyası
     (trap `git worktree remove -f` ile temizler).
  2. Üreteci `"$@"` **o worktree'nin içinde** koşturur.
  3. `git status --porcelain | wc -l` ile diff'ler; sıfır değilse `git status` + `git diff`'i
     stderr'e basıp başarısız döner.
- Tasarım noktası: üretim geliştiricinin ağacında DEĞİL, ayrı worktree'de yapılır — kapı çalışma
  dizinini asla değiştirmez, ve "commit'lenmişten sapıyor" tamamen git-görünür drift olarak ifade
  edilir. Hata mesajı düzeltme komutunu ADIYLA verir.

### c) Bazel `write_source_files` + `diff_test` (bazel-contrib/bazel-lib)
Künye: `github.com/bazel-contrib/bazel-lib/blob/main/lib/write_source_files.bzl` ·
`docs.aspect.build/rulesets/aspect_bazel_lib/docs/write_source_files/` ·
`blog.aspect.build/bazel-can-write-to-the-source-folder`
- Öncül (docstring, verbatim): *"bazel build cannot write to the source tree."* Kural
  *"provides a workaround for the restriction."*
- `bazel run //:write_foobar` yazar; `bazel test` doğrular.
- *"By default, `diff_test` targets are generated that ensure the source tree files and/or
  directories to be written to are up to date and the rule also checks that all source tree files
  and/or directories to be written to exist."* Test hedefi `{name}_test`; `diff_test = False` ile kapatılır.
- *"The generated diff_test will fail if the file is out of date and print out instructions on how
  to update it."* Dosya yoksa: *"Bazel will fail at analysis time and print out instructions on how
  to create it."*
- Model (verbatim): *"use `bazel run` to make the updates, and `bazel test` to make sure developers
  don't allow the file in the source folder to drift from what Bazel generates."*
- Mesajlar özelleştirilebilir: `diff_test_failure_message`, `file_missing_failure_message`.
- Determinizm burada KONVANSİYONLA değil, build sistemiyle (hermetiklikle) garanti ediliyor.

### d) `git diff --exit-code` semantiği
Künye: `git-scm.com/docs/git-diff`
- `--exit-code` (verbatim): *"Make the program exit with codes similar to `diff`(1). That is, it
  exits with 1 if there were differences and 0 means no differences."*
- `--quiet` (verbatim): *"Disable all output of the program. Implies `--exit-code`. Disables
  execution of external diff helpers whose exit code is not trusted..."*

### e) `.gitattributes` `linguist-generated`
Künye: `github.com/github-linguist/linguist/blob/main/docs/overrides.md`
- Etki (verbatim): *"Excluded from stats, hidden in diffs"* — `*.pb.go linguist-generated=true`
  dosyayı dil istatistiklerinden çıkarır VE PR diff'inde katlar. Disiplinin "inceleme gürültüsü"
  yarısı budur: dosya commit'li ama incelemeyi boğmuyor.
- ⚠ **ERİŞİLEMEDİ / DENENMEDİ:** protobuf/gRPC, OpenAPI Generator, sqlc, prisma'nın üretilmiş kodu
  commit'leme + diff kapısı konusundaki resmî beyanları (tur bütçesi). Bu araçlar hakkında hiçbir
  iddia kurulmadı.

### ➜ BİZİM KAPIYA NASIL BAĞLANIR — ve ÖNEMLİ: BU DESEN REPODA ZATEN VAR
Ölçüm (komut ve çıktı):
```
grep -rn "is stale\|STALE" engine/tools/*.mjs
engine/tools/gen-spec-v2.mjs:17:  console.error('FAIL: contract/garment-spec-v2.schema.json is stale — run: node engine/tools/gen-spec-v2.mjs');
engine/tools/specv2-check.mjs:45:  if (got === null) fail('contract/garment-spec-v2.schema.json missing — run node engine/tools/gen-spec-v2.mjs');
engine/tools/specv2-check.mjs:46:  else if (got !== want) fail('contract/garment-spec-v2.schema.json STALE — run node engine/tools/gen-spec-v2.mjs');
```
`contract/garment-spec-v2.schema.json` tam olarak **commit'li üretilmiş artefakt + regen-and-diff**tir:
kaynağı `contract/garment-spec-v2.json`, üreteci `gen-spec-v2.mjs`, kapısı `specv2-check.mjs`
(ctest: `specv2_check`), ve dosyanın `title` alanı kendini
`"stitchu garment spec v2 (GENERATED — edit contract/garment-spec-v2.json)"` diye ilan ediyor
(= Go'nun `DO NOT EDIT` konvansiyonu). Aynı desen `gen-vocab.mjs` başlığında da var:
`'GENERATED by engine/tools/gen-vocab.mjs from engine/vocab.json — DO NOT EDIT.'`
(`engine/tools/gen-vocab.mjs:17`), ve üreteç kendi yorumunda determinizmi ilan ediyor:
*"Deterministic: same input, byte-identical output — run twice, git diff must be empty."*
(`gen-vocab.mjs:3-4`).

**Yani `vocab_source_check` yeni bir icat değil, var olan bir emsalin ikinci kopyasıdır.**
Toplanan şartlar, bizim kapıya bağlanmış hâliyle:

| Şart | Kaynak | Bizde bugün |
|---|---|---|
| Üretilmiş dosya commit'li | Go blog ("must be checked into the source code repository") | VAR (`vocab.gen.hpp`, `vocab.gen.js` ×2, `garment-spec-v2.schema.json` hepsi HEAD'de) |
| Dosya kendini "üretilmiş" ilan eder | Go `DO NOT EDIT` konvansiyonu | VAR (`gen-vocab.mjs:17`, v2 şemasının `title`'ı) |
| Üreteç DETERMİNİST (iki koşu bayt-aynı) | Bazel hermetiklik; Go "generated and tested" | **İDDİA VAR, KAPI YOK** — `gen-vocab.mjs:3-4` bunu YAZIYOR ama koşturup diff alan bir test yok. `vocab_source_check`'in çekirdeği tam olarak burasıdır. |
| CI diff'te KIRMIZI düşer | `git diff --exit-code` (exit 1); k8s `git status --porcelain \| wc -l`; Bazel `diff_test` | v2 şeması için VAR (`specv2-check.mjs:46`); **`vocab.gen.*` üçlüsü için YOK** |
| Yeniden üretim ÇALIŞMA AĞACINI KİRLETMEZ | k8s: `git worktree add -f -q "$tmpdir" HEAD`, üreteci orada koştur | **YOK** — bizim `gen-*.mjs` doğrudan çalışma ağacına yazıyor. Kapı, düzeltmek istediği şeyi bozarak ölçüyor. **k8s deseni ALINIR.** |
| Hata mesajı düzeltme komutunu ADIYLA verir | k8s `'Please run hack/update-codegen.sh'`; Bazel `diff_test_failure_message` | VAR (`'run: node engine/tools/gen-spec-v2.mjs'`) |
| Üreteç sürümü sabitlenmiş | Bazel (build sistemi); Go (araç sürümü) | **DOĞRULANMADI** — `gen-vocab.mjs` `node` sürümüne ve `JSON.stringify` sırasına bağlı; sürüm sabitlemesi ölçülmedi. |
| İnceleme gürültüsü kırpılır | `linguist-generated=true` | **YOK** — repoda `.gitattributes` `linguist-generated` kaydı aranmadı; **DOĞRULANMADI**. |

**Yayınlanmış formül var mı?** Bu kapı için EVET — desen (regen + diff + exit 1) yayınlanmış ve
kanonik. Bir EŞİK SAYISI gerekmiyor: eşik **0 bayt fark**tır. Ratchet'ten farkı budur ve
`vocab_source_check` bu yüzden `vocab_reference_check`'ten daha kolay ve daha sert bir kapıdır.

---

# BÖLÜM 3 — OTORİTE HÜKMÜ (V0-0D §5.4 açık sorusu)

## 3.0 Ön ölçüm: C++ motor çalışma zamanında JSON OKUMUYOR

```
grep -rn "ifstream\|fopen" engine/src/ | wc -l
# -> 1        (tek isabet: engine/src/recipe.cpp:862  std::ifstream in(path);)

grep -rn "\.json" engine/src/ | wc -l
# -> 21       (21'inin HEPSİ yorum satırı; hiçbiri dosya açmıyor)
```
Sonuç: **motorun çizim yolunda hiçbir sözlük dosyası çalışma zamanında okunmuyor.** Sözlük,
`engine/src/vocab.gen.hpp` olarak DERLENİYOR (`engine/src/specparse.hpp:5`:
*"Tables come generated from engine/vocab.json (vocab.gen.hpp)"*). "Motor yolunda okunuyor mu"
sorusu bu yüzden iki ayrı soruya ayrılır: **(a) derlenen/çalışan koda GİRİYOR mu, (b) hangi
program dosyayı AÇIYOR.** Tablo ikisini de veriyor.

## 3.1 SAYIM — kartın "82 / 8 / 8" iddiasının denetimi

```
node -e 'const s=require("./contract/garment-spec.schema.json");let n=0,t=0;
  const w=o=>{if(o&&typeof o==="object"){if(Array.isArray(o.enum)){n++;t+=o.enum.length;}for(const k in o)w(o[k]);}};
  w(s);console.log("enum dizisi:",n,"toplam deger:",t);'
# -> enum dizisi: 69 toplam deger: 283
#    (+ 1 adet `const` → enum+const = 70)

node -e '... aynı yürüyüş, garment-spec-v2.schema.json ...'
# -> enum dizisi: 8 toplam deger: 36

grep -c '"tip": "enum"' contract/primitives-v1.json
# -> 8

node -e 'const v=require("./engine/vocab.json").fields;const k=Object.keys(v);
  console.log("alan:",k.length,"deger:",k.reduce((a,f)=>a+v[f].values.length,0));'
# -> alan: 37 deger: 132

node -e 'const r=require("./contract/vocab-resolution-v1.json");console.log(Object.keys(r.resolutions).length)'
# -> 132     (vocab.json'un 132 değeriyle birebir; _sayim: resolved 107 / sentinel 22 / absent 3)
```

⚠ **Kartın "82 enum" rakamı bu ağaçta DOĞRULANMADI.** Ölçülen: **69 enum dizisi** (283 değer),
`const` dahil 70. Kartın **8** ve **8** rakamları DOĞRULANDI. `garment-spec.schema.json:5`
kendi içinde "v1 79 enum degeri okur" diyor — bu üçüncü bir sayıdır ve 69'la da 82'yle de
tutmuyor. **Üç ayrı yerde üç ayrı sayı dolaşıyor**; V2-A hangi tanımın (dizi mi, değer mi,
hangi alt-ağaç mı) sayıldığını yazmak zorunda.

## 3.2 OTORİTE TABLOSU

| Dosya | Motor yolunda okunuyor mu (komut + çıktı) | Hüküm | Gerekçe (tek cümle) |
|---|---|---|---|
| **`engine/vocab.json`** | `git grep -l -F "engine/vocab.json" -- '*.cpp' '*.hpp' '*.mjs' '*.js' '*.py' engine/CMakeLists.txt` → **15 dosya**: `engine/src/vocab.gen.hpp`, `engine/src/specparse.hpp`, `engine/wasm/bindings.cpp`, `web/js/vocab.gen.js`, `web/js/engine.js`, `backend/vocab.gen.js`, `backend/spec-core.js`, `engine/tools/gen-vocab.mjs`, `validate-contract.mjs`, `preview-truth.mjs`, `spec-diff.mjs`, `wearability-bench.mjs`, `foto-spec-olcum.mjs`, `atolye/ingredients.js`, `engine/tests/preset_resolve_check.cpp` | **OTORİTE** | Üç üretilmiş tablonun (`vocab.gen.hpp` + web/backend `vocab.gen.js`) TEK kaynağıdır; C++ sınırı (`specparse.hpp`, `bindings.cpp`) ve JS sınırı (`engine.js`, `spec-core.js`) yalnız bu tablodan geçer, ve `validate-contract.mjs:49-56` diğer şemaları BUNA karşı denetler. |
| **`contract/garment-spec.schema.json`** | `git grep -l -F "garment-spec.schema.json" -- '*.cpp' '*.hpp' '*.mjs' '*.js' '*.py'` → **11 dosya**; gerçekten AÇAN üçü: `engine/tools/gen-contract.mjs:20`, `engine/tools/validate-contract.mjs:35`, `engine/tools/gen-spec-v1v2-map.mjs:39` (+ `engine/tests/collar_bridge_check.mjs:21`, `dataset/eval/label-tool.mjs:23`). Çalışma zamanına `VISION_SCHEMA` olarak GÖMÜLÜ giriyor: `web/js/spec-validate.js:11` `import { VISION_SCHEMA } from './contract.gen.js'` → `spec-validate.js:76` `sanitizeObject(VISION_SCHEMA, ...)` | **İKİ KATMANLI: `$defs.visionReading` = OTORİTE · `$defs.draftSpec` = TÜRETİLMİŞ** | `visionReading` dilinin başka kaynağı yok ve tarayıcıda `spec-validate.js` onunla süzüyor; ama `draftSpec` enum'ları `validate-contract.mjs:49-56`'da `engine/vocab.json`'a karşı satır satır denetleniyor (`schema draftSpec.${field} enum drift`) — yani draftSpec `vocab.json`'un AYNASI, kaynağı değil. |
| **`contract/garment-spec-v2.schema.json`** | `git grep -l -F "garment-spec-v2.schema.json" -- '*.cpp' '*.hpp' '*.mjs' '*.js' '*.py'` → **3 dosya**: `engine/tools/specv2.mjs:33` (`SCHEMA_PATH`), `engine/tools/gen-spec-v2.mjs:13` (üretir), `engine/tools/specv2-check.mjs:44` (bayatlığı denetler) | **TÜRETİLMİŞ** | Kendi `title`'ı `"(GENERATED — edit contract/garment-spec-v2.json)"` diyor; `gen-spec-v2.mjs` onu `contract/garment-spec-v2.json`'dan yazıyor ve `specv2-check.mjs:46` bayatlarsa KIRMIZI düşürüyor — otorite kaynak dosya, bu değil. |
| **`contract/primitives-v1.json`** | `git grep -l -F "primitives-v1.json" -- '*.cpp' '*.hpp' '*.mjs' '*.js' '*.py' engine/CMakeLists.txt` → **3 dosya**. Bunlardan `engine/src/fabricease.hpp:5` yalnızca YORUM. Dosyayı gerçekten AÇAN **TEK program**: `engine/tests/preset_resolve_check.cpp:414`, argümanı `engine/CMakeLists.txt:783` ile geçiliyor. Çizen hiçbir kod okumuyor. | **OTORİTE (KAPI KATMANI) — ama MOTOR YOLUNDA DEĞİL** | Katman-1 tanımının başka kaynağı yok ve `preset_resolve_check` her çözümün adlandırdığı primitifi buna karşı doğruluyor (`preset_resolve_check.cpp:527`: *"bundle names primitive '...' which contract/primitives-v1.json does not define"*), ama hiçbir panel bu dosyadan çizilmiyor: **bugün bir SÖZLEŞME, bir ÇALIŞTIRILABİLİR değil.** |
| **`contract/vocab-resolution-v1.json`** | `git grep -l -F "vocab-resolution-v1.json" -- '*.cpp' '*.hpp' '*.mjs' '*.js' '*.py' engine/CMakeLists.txt` → **3 dosya**; AÇAN iki program: `engine/tests/preset_resolve_check.cpp:415` (CMakeLists:784 argümanı) ve `engine/tools/foto-spec-olcum.mjs:31`. | **OTORİTE (KATMAN 3→1 TABLOSU) — MOTOR YOLUNDA DEĞİL** | 132 kalemin tamamı burada ve başka yerde yok (`_sayim`: resolved 107 / sentinel 22 / absent 3), ama `engineEffect` alanı kendi ilanıyla *"OLCULEN MANDAL, hedef DEGIL... Bir ESIK DEGILDIR"* — yani tablo motoru yönetmiyor, motoru KAYDEDİYOR. |
| `engine/src/vocab.gen.hpp` · `web/js/vocab.gen.js` · `backend/vocab.gen.js` | Çalışma zamanının okuduğu asıl tablolar: `web/js/engine.js:6`, `backend/spec-core.js:22`, ve C++ tarafında `#include` | **TÜRETİLMİŞ** | Üçünün de ilk satırı `GENERATED by engine/tools/gen-vocab.mjs from engine/vocab.json — DO NOT EDIT.` |
| `web/js/contract.gen.js` · `backend/contract.gen.js` | `web/js/spec-validate.js:11`, `web/js/create.js:6`, `backend/draft.js:20` — üçü de çalışma zamanı | **TÜRETİLMİŞ** | `gen-contract.mjs:65` bunları `contract/tables.json` + `garment-spec.schema.json $defs.visionReading` dilimlerinden yazıyor. |

## 3.3 HÜKÜM — TEK CÜMLE

**Otorite `engine/vocab.json`'dur.** Motorun okuduğu tek sözlük odur (derlenmiş hâliyle),
`garment-spec.schema.json`'un `draftSpec` bloğu ona karşı kilitli bir aynadır
(`validate-contract.mjs:49-56`), `garment-spec-v2.schema.json` bir build ürünüdür
(`specv2-check.mjs:46`), ve `contract/primitives-v1.json` + `contract/vocab-resolution-v1.json`
**paralel menü değil, ALT KATMAN'dır**: `vocab.json`'un 132 değerinin her birinin neye çözüldüğünü
söylerler ve tek okuyucuları `preset_resolve_check` kapısıdır.

**Yani "üç paralel menü" teşhisi yanlıştır — dördü de tek zincirin halkalarıdır:**
```
engine/vocab.json            (OTORİTE, 37 alan / 132 değer)
  ├─ gen-vocab.mjs        → vocab.gen.{hpp,js}        (TÜRETİLMİŞ, çalışma zamanı)
  ├─ validate-contract.mjs→ garment-spec.schema.json $defs.draftSpec  (AYNA, kilitli)
  └─ vocab-resolution-v1.json (132 kalem) → primitives-v1.json (Katman 1)
                              ↑ tek okuyucu: preset_resolve_check (ctest)

contract/garment-spec-v2.json (AYRI OTORİTE — "üretebiliyor muyum?" sorusu)
  └─ gen-spec-v2.mjs      → garment-spec-v2.schema.json (TÜRETİLMİŞ)
```

**AÇIK KALAN ÇELİŞKİ (V2-A'ya devir, bu kart dokunmadı):** İki otorite var —
`engine/vocab.json` ("ne okuyorum") ve `contract/garment-spec-v2.json` ("ne üretebiliyorum").
İkisi arasındaki köprü `contract/spec-v1-v2-map.json` (üretilmiş, ctest `specv1v2_map_check`).
Bu bir kusur değil, `garment-spec.schema.json:5`'te bilinçli ilan edilmiş bir ayrım —
ama `primitives-v1.json` bu ikiliğin HANGİ tarafına bağlı olduğunu hiçbir yerde söylemiyor,
ve `vocab-resolution-v1.json` yalnız v1'in 132 değerini çözüyor, v2'nin operatörlerini değil.

## 3.4 YAN BULGULAR (sorulmadı, ölçüldü — Bölüm 1/2 hükümlerini etkiliyor)

1. **`vision/vocab.py` DİSKTE YOK.** `find . -name "vocab*.py" -not -path "./.git/*"` →
   `./vision-student/vocab.py` ve `./engine/pattern-bridge/vocab.py`. Kartın girdi listesindeki
   yol yanlış. Okunan: `vision-student/vocab.py` (55 satır) — ÜÇÜNCÜ bir kelime listesi taşıyor,
   ELLE kopyalanmış: `NECKLINE_CLASSES` (7 değer — `vocab.json`'un 9'undan `cowl` ve `pussyBow`
   EKSİK), `GARMENT_CLASSES` `["skirt","dress","top","trousers","other"]` — **`trousers` ve `other`
   `engine/vocab.json`'da YOK** (orada `garment` üç değer: skirt/dress/top),
   `SLEEVE_LENGTH_CLASSES` (3, tutuyor), `SKIRT_STYLE_CLASSES` (5 — `vocab.json`'un 6'sından
   `gore` eksik). Dosyanın kendi yorumu kaynağını `backend/worker.js` prompt'u + `visionReading`
   diye veriyor (satır 3-4, 19-20), yani öğretmen şemasıyla senkron olmak İSTİYOR ama hiçbir kapı
   bunu denetlemiyor — `validate-contract.mjs`'in 8 denetiminin hiçbiri bu dosyaya bakmıyor.
   **`vocab_reference_check`/`vocab_source_check` tasarlanırken bu dosya kapsam dışı bırakılırsa
   sözlük "tek kaynak" olmaya devam etmez.** Bu kart onu DÜZELTMEDİ.
2. **`engine/pattern-bridge/vocab.py`** de var (GarmentCode köprüsü) — açılmadı, kart girdisi değil.
   İçeriği **DOĞRULANMADI**.
3. **`primitives-v1.json`'da tanımı olmayan, ama `garment-spec-v2.schema.json`'da İSMİ olan kalem:**
   `topology.suppression` enum'u `["seamOnly","dart","topDart","gather","pleat"]` — **`pleat`**'i
   çizen bir `op.*` primitifi yok (`op.gather.mode` `["free","drawstring","shirred","smocked","elastic"]`
   — pileyi kapsamıyor). FreeSewing'in `pleat` makrosu bunun dünyadaki karşılığıdır (Bölüm 1).
   `_yasa` md.1'in ihlali, V2-A'nın kalemi.
4. **`vocab-resolution-v1.json`'un 3 `absent` kalemi** (`node -e '...status==="absent"'`):
   `tieClosure.backWaistBow` (*"ENGINE-DUPLICATE... `BackWaist` ve `BackWaistBow` AYNI case blogunu
   paylasiyor"*, `engine/src/tie.cpp:129-130`), `cupSeam.bugra` ve `locketTop.bugra`
   (*"ISIM BIR INSANA BAGLI, GEOMETRIYE DEGIL"* — motorda ÇİZİYOR ama sözlük kalemi olarak geçersiz).
   Yani bugün sözlükte, motorun çizdiği ama adı geçersiz sayılan **2** kalem var.
5. **`op.attach` `standHeightMM` notu** ("yaka ailesi: 6 isim, 2 sayi") `vocab.json`'un
   `collarType` 7 değeriyle (`none` dahil) tutuyor ama `garment-spec-v2.schema.json` `collar`
   enum'u yalnız **4** taşıyor (`none/peterPan/stand/shirt`) — `mock`, `flat`, `crescent` v2'de
   yok. Bu, §3.3'teki "iki otorite" ikiliğinin somut hâlidir; kapsam farkı KUSUR DEĞİL
   (v1 okur, v2 üretir) ama `primitives-v1.json` hangisine bağlı olduğunu söylemiyor.
6. **`.gitattributes`'ta `linguist-generated` var mı — BAKILMADI, DOĞRULANMADI.**
7. **`primitives-v1.json` `_malzeme_eksigi_kapandi` altı kalem sayıyor** (seamAllowance, grainline,
   notch, cutOnFold, regionEase, ruffleRatio). Bölüm 1'in FreeSewing satırına göre **yedincisi
   eksik: ANOTASYON** (`title`, `scalebox`, `ld/hd/vd/pd`, `bartack`) — bizde `printpack`'te KOD
   olarak var, kontratta ilan edilmemiş, yani RULES §"documented guarantee not enforced in code
   does not exist"in tersi: kodda var, kontratta yok.

## 3.5 BU KOŞUDA ERİŞİLEMEYEN / YAPILMAYAN

- Seamly2D resmî kullanıcı wiki'si: `wiki.seamly.net/wiki/UserManual:Tools:Points/en` → ECONNREFUSED;
  `wiki.seamly.io/wiki/UserManual:Tools:Points/en` → HTTP 403. Tool isimleri C++ SINIF adıdır;
  UI etiketi eşlemesi (`vtoolheight` → "Point of perpendicular / Height") **DOĞRULANMADI**.
- `vpiecenode.h` (Seamly2D parça-düğümü dikiş payı / passmark alan adları) çekilmedi.
- `pygarment/garmentcode/edge_factory.py` (17.6 KB), `params.py` (4.9 KB), `base.py` (4.5 KB)
  çekilmedi — `edge_factory` muhtemelen kanonik kenar giriş noktası, `params.py` muhtemelen
  YAML menü yükleme/doğrulama katmanı. **DOĞRULANMADI.**
- PyPI `pygarment` 2.0.2 ile repo `main`'in eşleştiği **DOĞRULANMADI**; Bölüm 1'deki satır
  numaraları `main`'dendir, 2.0.2 tag'iyle birebir tutmayabilir.
- GarmentCode `assets/` altındaki gövde modeli / YAML verisinin ayrı lisans veya atıf şartı
  taşıyıp taşımadığı **KONTROL EDİLMEDİ** — GarmentCodeData CAESAR tabanlı gövde modeli içeriyor
  ve CAESAR ticari lisanslıdır; **ticari kullanımdan önce bakılması şart. DOĞRULANMADI.**
- FreeSewing `designs/` dizin sayısı: fetch "85" dedi, ~63 isim saydı. **85 YAKLAŞIK.**
- SonarQube Clean-as-You-Code (3 URL 404), `pylint --fail-under`, mypy/flake8 baseline araçları,
  Google "Beyoncé rule": alınmadı, hiçbir iddia kurulmadı.
- `go.dev/s/generatedcode` kanonik regexp spec'i: kısa link `pkg.go.dev/cmd/go`'ya yönlendi,
  yeniden çekilmedi. `^// Code generated .* DO NOT EDIT\.$` **DOĞRULANMADI.**
- `deny(warnings)` aleyhine **resmî rust-lang** beyanı bulunamadı; tek kaynak topluluk kitabıdır.
- protobuf/gRPC, OpenAPI Generator, sqlc, prisma: alınmadı.
- Bölüm 1'in ALINIR/ALINMAZ hükümleri **bu kartın araştırma hükmüdür, kod kararı değildir.**
  Kart YASAKLAR gereği `contract/` `engine/` `recipes/` `web/` `vision/` altına dokunulmadı;
  bu koşuda yazılan tek dosya `GECE/V2-R.md`'dir.
- Ekosistem sinyali (arama sonucu, birincil kaynak DEĞİL, **DOĞRULANMADI**): GarmentCode üstüne
  en az 5 takip çalışması — ChatGarment (arXiv 2412.17811), Design2GarmentCode (2412.08603),
  GarmentX (2504.20409), GarmentImage (2505.02592), Multimodal Latent Diffusion for Sewing
  Patterns (2412.14453). Yani bu DSL, LLM→giysi program sentezinde fiilî standart hâline gelmiş.
