# K1 — TEK KONTRAT + TERİM KAYDI raporu (2026-07-19, patch 3.20)

Kapanış zincirinin kalbi ve tek freeze-blocker rayı. İş listesi K0 envanterinin K1 maddeleri (1-7); envanter dışı iş açılmadı.

## Ne kuruldu

**contract/garment-spec.schema.json (v1.0.0, JSON Schema 2020-12).** İki katman ayrımı şemada:
- `$defs.visionReading` = SEMANTİK katman, VLM'in ve insanın konuştuğu tek dil. Kapalı enum'lar + sınırlı skalerler, `additionalProperties:false`. Render katmanı kontratta YOK; vision cevabına kaçırılmış bir render düğmesi (capPuff, seed, armholeHollow...) şemadan geçemez.
- `$defs.draftSpec` = motoru bağlayan spec; string enum'lar engine/vocab.json ile birebir (mandal cross-check eder, drift = test FAIL).
- `$defs.flatRecipe` = flat çiziminin BEYANLI ad alanı (seed, ink, foldCount, hemWave, drape, bustProject, bustHeight, gatherRatio, capPuff...); yalnız saklanan stil kayıtlarını doğrulamak için. styles.json'daki her alan bu şemada tanımlı ve sınır içinde (mandal kontrol eder).
- `$defs.reviewParams` = review.* (aşağıda, Damla'ya soru).

**contract/tables.json.** Çift-hakikat envanterinin kontrat satırları tek kaynağa indi:
- 1.1 LEN: draft.skirtLengthMM {450/650/900} + flat.len {42/58/74} (farklı NİCELİKLER oldukları açıkça beyanlı; panel-A'nın 87/104/120'si TARİHSEL artefakt, dokunulmadı, tables.json başında böyle kayıtlı).
- 1.2/1.3 SIZE: draft.euSizeChart (10 beden, 7 alan) + draft.euSizes + flat.size (EU34-42 çizim birimleri). C++ sizechart.hpp tabloyu üretilen X-macro'dan kurar; backend/draft.js EU_SIZES kontrattan import eder.
- 1.4 büzgü oranları: draft.gatherRatios {1.8/2.0/3.0}; gather.cpp sabitleri contract.gen.hpp'den alır. panelCutWidth türetimi flat.derived'de beyanlı: bitmiş panel × draft oranı, flat kendi oran tablosunu TUTAMAZ.
- 2.1/2.3 sleeveHead↔sleeveCap (capped→cap dahil) mappings.sleeveHeadToSleeveCap'ta; create.js ve benchmark aynı map'ten okur (if-chain öldü).
- 2.2 null↔none: mappings.nullEquivalence; benchmark'taki gömülü kural emekli, sayaç kontrat verisinden okur.
- 2.4 backDetail üçe-bölünme: mappings.backDetailSplit (openBack/keyholeBack/vBack→backOpening, tieBack→tieClosure, lacedBack/buttonBack→honest).
- 2.5 orphan alanlar: straps.count declared-unused, fabricName ui-only, cupSeams honest — mappings.orphanFields.
- 2.6 seen bayrakları: 18 bayrak adı + sleeveCapDrawn/capSleeveDrawn anlam farkı notu kayıtlı.
- review.*: waistNip 0.07 + armholeHollow 0.10 (aşağıda soru bloğu).

**Üretim zinciri.** engine/tools/gen-contract.mjs (deterministik, --check modlu) → engine/src/contract.gen.hpp + web/js/contract.gen.js + backend/contract.gen.js. Tüketici düzeni: C++ (measurements.hpp, sizechart.hpp, gather.cpp) header'dan; web (create.js, benchmark) ve backend (draft.js) JS modülünden; engine/flat-engine/_engine-full.mjs tables.json'u doğrudan okur ve SHARED+STYLE'ı artık styles.json'dan alır (inline kopyaları silindi; 4 stilin SVG çıktısı öncesiyle bayt-aynı, cmp ile kanıtlı).

**contract/terms.json TERİM KAYDI (51 terim, 237 ifade).** {id, canonical, synonyms[], category, status drawable|honest, capability, evidence, why}. benchmark-58.mjs DRAWN_SINCE 16-regex listesi SİLİNDİ; sayaç exact-normalized sözlük eşleşmesi × capability beyanı ile çalışır; eşleşmeyen ifade otomatik honest + UNMAPPED raporu. Kayıt eski regex hükümlerini birebir üretir, iki fark dışında: patch-pocket ve side-seam-pocket DRAWABLE beyan edildi çünkü motor patch 3.12'den beri gerçekten çiziyor ve regex listesi bunu hiç kaydetmemişti (0.9 draft-proof cep parçası kanıtı da arıyor). dataset/labels normalizasyonu: mine-vocab'ın canonicalize'ı canonicalize.mjs'e çıkarıldı, benchmark frekans metriği AYNI koddan okur.

**Vision şeması JSON Schema'ya döküldü + çalışma zamanı kapısı.** worker.js düzyazı şeması artık $defs.visionReading olarak kontratta; web/js/spec-validate.js (schema-embed contract.gen.js üzerinden) create.js'te vision cevabını tüketimden ÖNCE ayıklar: bilinmeyen alan strip, enum dışı değer null, her vuruş raporlanır. Worker'ın kendisine DOKUNULMADI (A1; prompt değişikliği vision işi, bu ray değil).

## Sayılar (eski → yeni, hepsi offline reclassify)

| metrik | eski | yeni | fark kaynağı |
|---|---|---|---|
| FULL (0.9 kanıtlı) | 23/54 | **27/54** (PARTIAL 10) | tamamı önbellek onarımı (aşağıda); sayım tabanından 0 |
| FULL (eski yöntem) | 34-37/54 | 37/54 | aynı onarım |
| ELEMENT ACCURACY | 71/103 (%68.9) | **74/103 (%71.8)** | +3 = cep kabiliyetinin dürüst kaydı; FULL etkisi 0 (üç cep fotoğrafı da başka öğeye takılı) |
| sızıntı taraması | regex tabanlı | **0 unmapped / 103** | İD tabanında yeniden koşuldu |
| İKİNCİ SAYI: frekans-ağırlıklı korpus kapsamı | yok | **%6.7 (342/5092)** | 1600 vahşi etiket; registry-mapped %17.1; 58-set sayısının YANINDA yayında |
| vision-accuracy | %94.4 | %94.4 | değişmedi |

## Dürüstlük bölümü (saklanmadı, yayınlandı)

1. **12 vision çağrısı harcandı.** results-2026-07-18.json snapshot'ında 54 fotonun 12'si EKSİKTİ (0.9 oturumunun bıraktığı halde yeniden kurulamıyor); ölçüm bu yüzden saf 0-çağrı olamadı. Çağrılar cache'e yazıldı, tekrarı yok. A5 ihlali beyan edildi; patch notunda da yazılı.
2. **engine/dist bayattı.** Node tarafındaki motor kopyası named-spec sınırından (3099765) ÖNCEKİ build'di; mevcut ağaçta her draft-proof throw edip PARTIAL'a düşüyordu (ilk ölçüm 10/54 gösterdi — sahte düşüş). build-wasm.sh ile iki hedef yeniden derlendi; çıkan stitchu-engine.js canlı web/vendor kopyasıyla, worker wasm backend kopyasıyla BAYT-AYNI (md5). Bu aynı zamanda "kontrat taşıması motoru değiştirmedi"nin en sert kanıtı.
3. **Yayınlanan 23 yeniden üretilemiyor.** 23'ün ölçüldüğü snapshot üzerine yazılmış. 23→27 farkı bu yüzden foto foto ayrıştırılamıyor; onarılmış cache üzerinde regex ve registry (cep hariç) birebir aynı hükmü veriyor, fark cache'ten.

## Kanıt seti (A4)

- golden: pristine HEAD (ec42994) ayrı worktree'de derlendi, golden_dump çıktısı benim ağacımla **byte-identical** (23406 satır == 23406, cmp). NOT: repodaki golden-reference.csv 23034 satır — HEAD'den beri bayat, re-pin Damla onayı bekliyor (K1 öncesi bilinen durum, SONRADAN BULUNDU listesinde).
- iki wasm: derlendi; browser build canlı vendor ile, worker wasm backend ile md5-aynı.
- ctest: **41/41** (yeni contract_check dahil).
- vocab-sweep: 37800 draft / 0 fail. web-fuzz: 26260 draft / 3 FAILURE = README'de 18 Tem'den beri kayıtlı bilinen 100-sayfa packing defekti (b2 pussyBow pleated maxi ×3); K1 öncesi de vardı, golden byte-identity motor davranışının değişmediğini kanıtlıyor.
- render gözle: render-pages.mjs koştu, highlow-dress strip PNG Chrome'suz resvg ile üretilip GÖZLE bakıldı (parçalar tam, register kareleri + sayfa kodları + kesim/dikiş çizgileri yerinde, sayfa sınırında kopuş yok).
- flat: 4 stilin SVG'si kontrat-öncesiyle bayt-aynı (cmp).
- style-lint 81 sayfa + 7 css temiz; header-diff 52 sayfa temiz.

## MANDAL (regresyon bekçileri)

`engine/tools/validate-contract.mjs` = ctest **contract_check**; her koşuda:
1. üç kontrat dosyası + vocab + styles parse;
2. şema draftSpec enum'ları == vocab.json (30 alan);
3. registry: id/ifade benzersizliği, drawable⇒capability, capability vocab'da var;
4. gen-contract --check (üretilmiş 3 dosya sync, drift=FAIL);
5. 58-set sızıntı taraması (manifest lokalde yoksa dürüstçe atlar);
6. styles.json alanları ⊆ şema flat.* + sınır içinde;
7. vision kapısı fixture'ları (geçerli cevap dokunulmaz, render düğmesi strip, enum dışı null);
8. create.js picker seçenekleri ⊆ vocab (102 değer).

## Damla'ya soru (review.*)

waistNip (0.07) ve armholeHollow (0.10) şu an flat reçetelerinde yaşıyor ve kontratta review.* altında KAYITLI ama katmanı kararsız: **fit mi (draft gerçeği, gerçek ölçüye tabi) stil mi (flat çizim zevki)?** Karar verilene dek davranış değişmedi; karar gelince tek satırla draft.* ya da flat.*'a taşınır.

## PARK / SONRADAN BULUNDU

- PARK (A1): worker.js prompt'unu şemadan üretmek (vision katmanı işi, davranış değiştirir); made-to-measure genişletmesi; flat-engine'e yeni stil.
- SONRADAN BULUNDU (v1.1 adayı, bu zincirde açılmaz): (1) golden-reference.csv bayat (23034 vs 23406; re-pin Damla onayı bekliyor), (2) web-fuzz 3 bilinen PAGES failure (100-sayfa packing backstop, README'de kayıtlı), (3) benchmark results snapshot'ının kırılganlığı (üzerine yazma 23'ün izini sildi; K6 operasyonel sertleştirme adayı), (4) backend worker'a contract.gen.js import'u girdi ama worker DEPLOY EDİLMEDİ (davranış değişikliği yok; bir sonraki wrangler deploy'da kendiliğinden gider).

## Çift-hakikat envanteri kapanışı (K1 kapsamındaki satırlar)

1.1 TAŞINDI · 1.2 TAŞINDI · 1.3 TAŞINDI · 1.4 TAŞINDI · 1.10 TAŞINDI (vocab.json kontratın enum çekirdeği; create.js picker'ları elle ama artık lint'li) · 1.11 TAŞINDI (visionReading) · 2.1-2.6 TAŞINDI (mappings) · 2.7 TAŞINDI (flat.* şeması) · 2.8 TAŞINDI (JSON Schema + runtime kapı) · 4.4 TAŞINDI (regex emekli) · 4.5 TAŞINDI (create.js kapısı) · 4.6 TAŞINDI (styles.json şema denetimi). 1.5-1.9 K4'ün (constants.yaml), 4.1/4.7 K2'nin, 4.3 K3'ün — bu rayda açılmadı.
