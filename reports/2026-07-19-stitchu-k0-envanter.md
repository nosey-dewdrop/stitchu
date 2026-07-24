# K0 — ENVANTER GATE raporu (2026-07-19)

Kapanış zincirinin DONMUŞ iş listesi (KİLİT 1). Bu envanterde olmayan iş K1-K6'da AÇILMAZ; sonradan bulunan her şey NEREDEYİZ'e "SONRADAN BULUNDU" olarak yazılır (v1.1 adayı).

Yöntem: 0 kredi, 0 kod değişikliği, sadece okuma (grep -n + Read). Tüm satır numaraları HEAD 80dc18b üzerinden.

---

## ENVANTER 1 — ÇİFT HAKİKAT (aynı değeri hesaplayan/tanımlayan birden fazla yer)

| # | bulgu | dosya:satır (hepsi) | ray | not |
|---|---|---|---|---|
| 1.1 | LEN tablosu ÜÇ FARKLI DEĞERLE üç yerde: panel-A mini=87/knee=104/midi=120, flat-B mini=42/knee=58/midi=74, motor Mini/Midi/Maxi=450/650/900mm (knee yok) | docs/reference/dis-llm-panel-a.html:60 · engine/flat-engine/_engine-full.mjs:3 · engine/src/measurements.hpp:138-140 | K1 | En sert çift hakikat: aynı kelime üç motorda üç sayı; darboğaz raporu madde 1'in birebir örneği. Kontrata taşınacak. |
| 1.2 | SIZE tablosu üç yerde, alan setleri bile uyuşmuyor: panel-A EU34{bust:21.0,wl,ad}, flat-B EU34{neck,shp,strap,bust:14.6,emp,ad}, sizechart EU34{80,62,86,36,39.5,57,34} (cm, 10 beden EU34-52) | docs/reference/dis-llm-panel-a.html:57 · engine/flat-engine/_engine-full.mjs:2 · engine/src/sizechart.hpp:22-31 | K1 | ad=19.6 iki HTML/mjs'de aynı ama C++'ta 34 — aynı ada farklı anlam. Kontrata taşınacak. |
| 1.3 | EU beden aralığı iki kod yerinde: sizechart 10 beden + backend EU_SIZES listesi | engine/src/sizechart.hpp:22-31 · backend/draft.js:227 | K1 | Şu an tutarlı; kontrat tek kaynak olmalı ki tutarlı KALSIN. |
| 1.4 | Büzgü oranları: motor ip 1.8 / lastik 2.0 / smok 3.0 tek kod yerinde + FORMULAS dok. AMA flat-engine kendi gatherRatio/shirr reçete değerlerini styles.json/_engine-full.mjs'te ayrı taşıyor (motora bağlı değil) | engine/src/gather.cpp:19-21 · engine/FORMULAS.md:498-500 · engine/flat-engine/styles.json + _engine-full.mjs (shirr/gatherRatio reçete alanları) | K1 | panelCutWidth = flat'in derived alanı; motor kesim oranıyla aynı gerçeği ayrı hesaplar. Kontrat LEN/SIZE ile birlikte oranları da tek yerden vermeli. |
| 1.5 | Fullness dağınık ve uyumsuz: strap 2.2, backdetail ruffle 2.2, offshoulder frill 2.0, measurements ruffleFullness default 2.5 | engine/src/strap.hpp:37 · engine/src/backdetail.hpp:37 · engine/src/offshoulder.hpp:50 · engine/src/measurements.hpp:228 | K4 | Aynı kavram (fırfır bolluğu) 4 dosyada 3 farklı sayı; constants.yaml adayı. |
| 1.6 | SA=15mm 12+ dosyada bağımsız tanımlı: backdetail.hpp:36, tie.cpp:15, gather.cpp:15, pocket.hpp:44, collar.cpp:13, neckext.cpp:13, peplum.hpp:41, strap.hpp:35, offshoulder.hpp:47, bodice.cpp:263/435/1075, skirt.cpp:98/199/224/247/279/306, sleeve.cpp:154/235 | (satırlar solda) + engine/FORMULAS.md:43 | K4 | En yaygın kopyalanan sabit; varyantlar (10mm manşet, 12mm ruffle, 0mm facing) bilinçli ama merkezi tablo yok. constants.yaml. |
| 1.7 | Düğme çapı 18mm 4 kod yerinde: placket.hpp buttonDiameter+standWidth, buttonrow.hpp buttonDia+standWidth | engine/src/placket.hpp:31-32 · engine/src/buttonrow.hpp:41,43 · engine/FORMULAS.md:37-39 | K4 | Tutarlı ama iki header birbirinden habersiz. constants.yaml. |
| 1.8 | bicepsRatio 0.30 iki header'da: sleeve.hpp + bodice.hpp (bicepsRatioForArmscye) | engine/src/sleeve.hpp:9-10 · engine/src/bodice.hpp:78 · engine/FORMULAS.md:32-33,115 | K4 | UNVALIDATED varsayım üstelik iki kopya. constants.yaml + verified/assumed damgası. |
| 1.9 | Diğer tekil sabitler (tek kod yeri + dok): shoulderDropFactor 0.23 (DEPRECATED işaretli!), underbustOffset 70, capWingDepth 55, strap finishedWidth 22, ventExtension 40 | engine/src/bodice.hpp:86 · engine/src/bodice.hpp:85 · engine/src/sleeve.hpp:39 · engine/src/strap.hpp:36 · engine/src/slit.hpp:36 · FORMULAS.md:19,24-26,53,55,536 | K4 | Çift hakikat değil ama K4 constants.yaml envanterinin çekirdek listesi; 0.23 kodda DEPRECATED yorumlu ama dokümantasyonda yaşıyor. |
| 1.10 | Enum aileleri 5 katmanda kopyalanıyor AMA vocab.json'dan üretiliyor (tek kaynak var): sleeveCap, collarType, collarEdge, gatherType, gatherZone, backOpening, tieClosure, peplum, placketStyle, backSlit, ruffledStraps | web/js/create.js:31-95 (picker options) · web/js/engine.js:21-36 · backend/draft.js:42-64,227 · engine/wasm/bindings.cpp:125-135 · engine/src/vocab.gen.hpp:36-72 · engine/vocab.json | K1 | İyi haber: vocab.json → gen zinciri sayesinde bugün hepsi hizalı (agent taraması: 0 sapma). K1 kontratı vocab.json'u yutmalı/referans almalı; create.js picker options'ları hâlâ ELLE yazılıyor (tek üretilmeyen kopya). |
| 1.11 | Vision şeması alanları vs bridge alanları: worker.js şema (fabricName/closure/straps/cupSeams/sleeveHead/yoke/backDetail...) ↔ create.js pick* tüketimi | backend/worker.js:317-327 · web/js/create.js:404-491,533-541 | K1 | Şema düzyazı-prompt içinde yaşıyor (JSON Schema değil); kontratın SEMANTİK katmanına taşınacak alan listesi bu. |

## ENVANTER 2 — SÖZLEŞME SIZINTISI (alan adı / anlam kayması)

| # | bulgu | dosya:satır (hepsi) | ray | not |
|---|---|---|---|---|
| 2.1 | capped↔cap çevirisi: vision "capped" (sleeveHead) → engine "cap" (sleeveCap); çeviri create.js'te ELLE, şemada değil | backend/worker.js:325 · web/js/create.js:420-422 | K1 | Bugün doğru çalışıyor ama iki sözlük arasındaki köprü tek bir if; kontrat enum eşlemesini şemaya alır. |
| 2.2 | null↔none eşdeğerliği benchmark'a gömülü: sleeveStyle null == 'none' özel kuralı classify içinde | engine/tools/benchmark-58.mjs:310 · web/js/engine.js:13 (null/undefined→0 default) | K1 | Anlam kuralı ("kolsuz kolsuzdur") ölçüm script'inde yaşıyor; kontratta nullable/default semantiği olarak tanımlanmalı. |
| 2.3 | Alan adı kayması sleeveHead→sleeveCap: vision "sleeveHead" adını, motor "sleeveCap" adını kullanıyor; köprü sessizce çeviriyor | backend/worker.js:325 · web/js/create.js:420-422 · engine/src/measurements.hpp:51 | K1 | Aynı kavram iki katmanda iki ad. Kontrat tek kanonik ad + synonyms[] ister. |
| 2.4 | backDetail çok-anlamlı bölünme: vision tek alan {openBack,keyholeBack,vBack,tieBack,lacedBack,buttonBack} → köprüde ÜÇE ayrılıyor (backOpening enum / tieClosure / honest) | backend/worker.js:327 · web/js/create.js:457-458 (pickBackOpening) + pickTiePlacement | K1 | Bilinçli tasarım ama eşleme tablosu kodda gömülü; kontrat bu dağılımı beyan etmeli. |
| 2.5 | Orphan alanlar: straps.count vision'da üretiliyor, seen'e okunuyor, HİÇBİR yerde tüketilmiyor; fabricName sadece UI (photoFabric); cupSeams kalıcı-honest (motor karşılığı yok) | backend/worker.js:323,320,324 · web/js/create.js:473-476,533,541 · web/js/missing.js:224 | K1 | Kontratta her alanın hedefi (draft.*/flat.*/review.*/honest) yazılmalı; count gibi ölü alan ya düşer ya beyan edilir. |
| 2.6 | seen.* bayrak çifti: sleeveCapDrawn (herhangi bir non-plain head) VE capSleeveDrawn (sadece cap kanadı) yan yana; adlar benzer, anlamlar farklı | web/js/create.js:562,565 · web/js/missing.js:236 | K1 | Bugün doğru bağlanmış; ad karışıklığı gelecekteki köprü hatası adayı. Kontrat seen bayraklarını da adlandırır. Tam seen listesi: create.js:549-628 ↔ missing.js:233-389 (18 bayrak, tutarlı). |
| 2.7 | flat-engine reçete sözlüğü motor sözlüğünden kopuk: styles.json alanları (shirr, gatherRatio, capPuff, cuffGather...) render-katmanı parametreleri; motor semantiğiyle (gatherType/Zone) eşleme YOK | engine/flat-engine/styles.json (_schema_version:1) · engine/flat-engine/_engine-full.mjs:2-3 | K1 | Darboğaz raporu madde 1'in kendisi: bunlar bezier düğmesi, giysi kelimesi değil. K1'de flat.* ad alanına ayrışır. |
| 2.8 | Vision şeması JSON Schema DEĞİL, prompt düzyazısı; validasyonsuz optional-chaining ile tüketiliyor (bkz. 4.5) | backend/worker.js:317-327 · web/js/create.js:423-491 | K1 | Şema reddi diye bir şey yok; LLM render katmanına yazamaz kuralı şu an sadece adetle korunuyor. |

## ENVANTER 3 — ÖLÜ / TEKİL KOD (arşiv adayları)

| # | bulgu | dosya:satır (hepsi) | ray | not |
|---|---|---|---|---|
| 3.1 | Tek kullanımlık render script'i, repoda 0 referans: _render-smocked-babydoll.mjs ("One-off" kendi başlığında) | engine/tools/_render-smocked-babydoll.mjs:1 | K6 | docs/archive adayı. |
| 3.2 | print-repro.js: print.js'in elle port aynası, 0 referans | engine/tools/print-repro.js:1 | K6 | Ayna kod = çift hakikat riski; arşiv. |
| 3.3 | Proof script ailesi + SVG çıktıları: halter-proof.js/svg, keyhole-proof.js/svg, ruffle-proof.js/svg, sweetheart-proof.js, tiered-ruffle-proof.js (birbirlerine referans, canlı zincirde yok) | engine/tools/halter-proof.js:1 · keyhole-proof.js:1 · ruffle-proof.js:1 · sweetheart-proof.js:1 · tiered-ruffle-proof.js:1 (+ aynı adlı .svg'ler) | K6 | Özellikler ctest'lerle (halter_check vs.) kalıcı korunuyor; proof'lar tarihi kanıt → arşiv. |
| 3.4 | flat-v2 artefaktları: flat-v2.mjs + flat-v2-out.svg/.png + flat-v2-babydoll.svg/.png commit'li üretilmiş çıktılar | engine/tools/flat-v2.mjs, flat-v2-*.svg/.png | K6 | Üretilmiş çıktı repoda; arşiv/sil adayı. |
| 3.5 | flat-engine üretilmiş çıktıları: courtney-flat.svg/.png, canlı kodda 0 referans | engine/flat-engine/courtney-flat.svg, courtney-flat.png | K6 | Arşiv adayı (flat-engine motorunun kendisi DEĞİL — o K1 kontrat işine girdi). |
| 3.6 | SPECS-next-vocabulary.md'de UNVERIFIED BANDI YOK: `grep -ni unverified` 0 sonuç; ARCHITECTURE.md:73 "UNVERIFIED agent draft" diyor ama dosyanın kendisinde damga yok | engine/SPECS-next-vocabulary.md:1-5 (banner'sız başlık) · docs/ARCHITECTURE.md:73 | K6 | DEVAM-KAPANIS-LOOP K6 "bandı zaten var" varsayıyor — YANLIŞ varsayım; K6 bandı EKLEYECEK + PARK damgası. |
| 3.7 | mocks/ (7 HTML mockup: babyblue-stil-1, ios-app, landing varyantları, web-mobile) + kök mock.html: canlı üründe 0 referans | mocks/ dizini · mock.html | K6 | Tasarım tarihi; arşiv adayı (mockup=kontrat kuralı gereği SİLİNMEZ, taşınır). |
| 3.8 | asset-guide.html / asset-guide-tr.html / asset-guide.pdf kökte, ürün kodunda tüketilmiyor | asset-guide.html · asset-guide-tr.html · asset-guide.pdf | K6 | Arşiv adayı. |
| 3.9 | docs/archive/ temiz: canlı kod archive'dan 0 import | docs/archive/ | — | Bulgu değil, teyit; iş çıkmaz. |

## ENVANTER 4 — DENETİMSİZ SINIR (testi/metriği olmayan katman geçişleri)

| # | bulgu | dosya:satır (hepsi) | ray | not |
|---|---|---|---|---|
| 4.1 | flat-engine tamamen lint'siz/test'siz: _engine-full.mjs için hiçbir test, golden, self-intersect kontrolü yok (repo genelinde `_engine-full` referansı 0) | engine/flat-engine/_engine-full.mjs (tümü) | K2 | K2 render-lint (self-intersect, ters normal, sıfır alan) bu boşluğu kapatır. |
| 4.2 | Eval seti 21 örnek: vision/eval/labels.json 21 foto girdisi (hedef ≥150) | vision/eval/labels.json:3+ (jq length=21) | K5 | K5 go-live gate'i 150 tamamlanana dek KIRMIZI. |
| 4.3 | preview↔kalıp ölçüsüz: assembled preview print ile packer'ı PAYLAŞIYOR (yapı aynı) ama yapısal-eşitlik/landmark diff testi YOK | web/js/render.js:111-150 (appendAssembledPreview, :116 packPieces, :128 sheetInner) · web/js/print.js:148,176 · web/js/sheet.js:261 (packPieces tek kaynak) | K3 | K3 preview_truth.mjs tam bu sınıra kurulur; paylaşılan packer iyi zemin. |
| 4.4 | benchmark-58.mjs DRAWN_SINCE = 16 regex kuralı, kabiliyet beyanı metin eşleşmesiyle | engine/tools/benchmark-58.mjs:93-194 (tanım), :287,314-315 (tüketim) | K1 | K1 terms.json + capability beyanı ile regex tabanı EMEKLİ edilir; sayaç İD tabanına geçer (A7: sayı düşerse düşer). |
| 4.5 | vision→bridge şema validasyonu YOK: worker cevabı ve create.js tüketimi optional-chaining; hiçbir JSON Schema/validator katmanı yok (motor validator'ı draft SONRASI çalışır) | backend/worker.js:294-327 · web/js/create.js:423-491 | K1 | K1 garment-spec.schema.json validasyonu bu sınırı kapatır ("şema reddeder"). |
| 4.6 | styles.json reçeteleri şemasız: sadece _schema_version:1 yorumu, hiçbir alan/aralık doğrulaması yok | engine/flat-engine/styles.json | K1 | flat.* ad alanı + şema K1'de. |
| 4.7 | web-fuzz.js BAYAT packer aynası: sadece shelfPack'i simüle ediyor; sheet.js'in skyline+rotation yarışını (A4 loop'unda eklendi) HİÇ fuzz'lamıyor | engine/tools/web-fuzz.js:45-76 · web/js/sheet.js:54 (shelfPack), :143 (skylinePack), :261-290 (packPieces yarışı) | K2 | CLAUDE.md'de bilinen backlog; K2 render-lint/compose_check kurulurken bu ayna ya gerçek sheet.js'i çağırır ya sınırı dürüstçe beyan eder. |
| 4.8 | fit_proof.cpp totolojik + bust atlanıyor: tek "fit" testi kendi çizdiği skaları doğruluyor, en kritik çevre (bust) comment'le SKIP (depth-diagnosis: FULL=EMITTED, FITS değil) | engine/tests fit_proof.cpp (bust skip comment ~64-70; bkz. reports/2026-07-17-depth-diagnosis.txt:49-58) | K4 | K4 kağıt sloper karşılaştırması (EU38, Aldrich, mm tablosu) ilk gerçek dış fit sinyali. |

## ENVANTER 5 — OPERASYONEL KIRILGANLIK

| # | bulgu | dosya:satır (hepsi) | ray | not |
|---|---|---|---|---|
| 5.1 | Manuel ?v bump ve fiilen KAYMIŞ durumda: web/ genelinde 130+ ?v= geçişi, EN AZ 8 farklı sürüm bir arada (61, 78, 80, 84, 85, 86, 91) | web/ (grep '\?v='; örn. js dosyaları v61-86, sayfalar v80-91) · kural: CLAUDE.md:136 · DEVAM-RAY-LOOP.md:20 · ENV.md:22-23 · docs/ARCHITECTURE.md:77 | K6 | deploy.sh bump'ı otomatikleştirir; mevcut kayma deploy.sh'nin ilk düzelteceği şey. (v41 HTML + v43 JS mismatch'i bir kez CANLIYA çıktı — ENV.md.) |
| 5.2 | Force-push subtree deploy, korkuluksuz: `git subtree split --prefix=web` → `git push --force origin SHA:gh-pages`, rollback/ön-kontrol yok | DEVAM-RAY-LOOP.md:20-21 · DEVAM-KAPANIS-LOOP.md:47-49 · BENCHMARK-58.md:267 | K6 | deploy.sh mevcut adımları sarar (değiştirmez), en azından tek komut + tutarlılık kontrolü olur. |
| 5.3 | .benchmark-token: gitignore'lu (`benchmark-58/` .gitignore:19), iki script okuyor, dosya lokalde mevcut, git'te YOK; rotasyon prosedürü yazılı değil | engine/tools/benchmark-58.mjs:32 · engine/tools/mine-vocab.mjs:47 · .gitignore:19 · BENCHMARK-58.md:311 | K6 | Tür: rate-limit bypass token (BENCH_BYPASS eşi). Sızıntı yok; K6 taraması + rotasyon notu. |
| 5.4 | Koda gömülü KV namespace id (RATE_LIMIT binding) | backend/wrangler.toml:26 | K6 | Tür: Cloudflare KV namespace identifier (değer rapora yazılmadı). wrangler.toml'da olması normal pratik; K6 gizlilik taraması "public repo'da mı" kararını verir. |
| 5.5 | Worker URL 3 yerde hardcoded (hesap adı gömülü) | web/js/config.js:4 · web/index.html:326 · web/api.html:182 (api.html:90 jenerik örnek) | K6 | Tek kaynak config.js olmalı; index/api.html inline kopyaları çift hakikat + taşınma kırılganlığı. |
| 5.6 | APP_TOKEN iki yerde elle senkron: wrangler secret ↔ App/Stitchu/Secrets.swift (şu an placeholder) | backend/wrangler.toml:17-19 · App/Stitchu/Secrets.swift:12 · backend/DEPLOY.md:23-31 | K6 | Tür: paylaşılan app token. Rotasyon komutları DEPLOY.md'de var, takvim/tetik yok. |
| 5.7 | CLAUDE_API_KEY yalnız Cloudflare'de (iyi) ama "key rotation still open" notu açık duruyor | backend/wrangler.toml:17-18 · CLAUDE.md GOTCHAS bölgesi (~:123) | K6 | K6 tarama raporuna "rotasyon Damla'da" satırı. |
| 5.8 | Paralel loop clobber riski: shared dosyalar (index/patches/sitemap) 2x ezildi + untracked sayfa silindi (peplum olayı); çözüm elle rebase | CLAUDE.md:27 (GOTCHA) · DEVAM-RAY-LOOP.md:25-26 | K6 | deploy.sh + kapanış zincirinin seri K-sırası riski zaten düşürüyor; nota geçir. |
| 5.9 | Motor değişiminde 6 kontrol + 2 wasm derleme tamamen elle (unutulursa sessiz bayat wasm) | DEVAM-RAY-LOOP.md:23-24 · CLAUDE.md:136 · engine/build-wasm.sh | K6 | deploy.sh kapsamına "motor değiştiyse kanıt seti koştu mu" kontrolü girebilir (yeni özellik değil, sarmalama). |
| 5.10 | gitignore kapsamı TEYİT: benchmark-58/, dataset/ (taste-pool istisnalarıyla) ignore'lu; izlenen dosyalarda gerçek secret yok | .gitignore:12-19 | — | Bulgu değil teyit; K6 taramasında "temiz" satırı olarak kullanılır. |

---

## K1-K6 İŞ LİSTESİ (envanterden düşen somut işler — DONMUŞ)

### K1 — TEK KONTRAT + TERİM KAYDI
1. LEN tablosunu kontrata taşı; panel-a.html:60, _engine-full.mjs:3, measurements.hpp:138-140 kontrattan okur ya da PARK edilir (1.1).
2. SIZE tablosunu kontrata taşı; üç alan setinin (1.2) hangi katmana ait olduğu (draft.*/flat.*) beyan edilir; EU_SIZES (draft.js:227) kontrattan (1.3).
3. Büzgü oranları (gather.cpp:19-21) + flat reçete oranları (styles.json) kontratta tek tablo; panelCutWidth türetimi beyanlı (1.4).
4. vocab.json'u kontratın enum çekirdeği yap; create.js:31-95 elle yazılan picker options'ları için üretim/lint kararı (1.10).
5. Vision şemasını (worker.js:317-327) JSON Schema'ya dök: capped↔cap ve sleeveHead↔sleeveCap eşlemesi şemada (2.1, 2.3), null↔none semantiği şemada (2.2, benchmark-58.mjs:310 kuralı emekli), backDetail üçe-bölünme tablosu şemada (2.4), orphan alanlar (straps.count/fabricName/cupSeams) hedef ad alanıyla beyan (2.5), seen.* bayrak adları kayda (2.6).
6. create.js tüketiminden önce şema validasyonu (4.5); styles.json reçetelerine flat.* şeması (2.7, 4.6).
7. terms.json terim kaydı + DRAWN_SINCE (benchmark-58.mjs:93-194) EMEKLİ; sayaç İD tabanına, FULL/ELEMENT yeniden ölçülür, frekans-ağırlıklı kapsam yayınlanır (4.4).

### K2 — KOMPOZİSYON RESMİLEŞTİRME
8. flat-engine'e render-lint (self-intersect/ters normal/sıfır alan) — şu an 0 test (4.1).
9. web-fuzz.js bayat packer aynası: ya gerçek sheet.js packer'ını sürer ya sınırını dürüstçe beyan eder; compose_check ctest + çakışma matrisi mevcut ~10 bileşen üstünde (4.7).

### K3 — PREVIEW-TRUTH
10. preview_truth.mjs: render.js:111-150 ↔ print.js/sheet.js:261 paylaşılan packer üstüne yapısal eşitlik + landmark sapma raporu; şu an 0 ölçüm (4.3).

### K4 — SABİTLER TABLOSU + KAĞIT SLOPER
11. constants.yaml: SA=15 (12+ dosya, 1.6), düğme 18mm (1.7), bicepsRatio 0.30 ×2 (1.8), fullness 2.2/2.0/2.5 uyumsuzluğu (1.5), shoulderDrop 0.23 DEPRECATED-ama-yaşıyor, underbust 70, capWing 55, strap 22, vent 40 (1.9) — hepsi {değer, birim, kaynak, verified|assumed} ile; kod tablodan okur, golden byte-identical.
12. Kağıt sloper EU38 karşılaştırması; fit_proof.cpp'nin totolojik/bust-atlayan boşluğunu (4.8) mm-hata tablosuyla ilk dış sinyale çevir.

### K5 — VISION KASKAD + EVAL
13. Eval 21 → ≥150 (vision/eval/labels.json, 4.2); tamamlanamazsa aday seçimi + etiketleme arayüzü + KIRMIZI-dürüst gate.
14. Kaskad router + τ kalibrasyonu + çağrı/100foto metriği (tavan 200 çağrı; K0'da 0 harcandı).

### K6 — OPERASYONEL SERTLEŞTİRME + ARŞİV
15. deploy.sh: ?v bump otomasyonu — mevcut 8-sürümlü kaymayı (61-91, 5.1) tek sürüme toplar; subtree/force-push/curl adımlarını sarar (5.2); motor-değişimi kanıt seti hatırlatması (5.9).
16. Gizlilik taraması raporu: .benchmark-token (5.3), KV id (5.4), worker URL ×3 → config.js tek kaynak (5.5), APP_TOKEN senkronu (5.6), CLAUDE_API_KEY rotasyon notu Damla'ya (5.7); gitignore temiz teyidi (5.10).
17. Arşiv: _render-smocked-babydoll.mjs, print-repro.js, 5 proof script + svg'leri, flat-v2 artefaktları, courtney-flat.*, mocks/ + mock.html, asset-guide.* → docs/archive (3.1-3.5, 3.7, 3.8).
18. SPECS-next-vocabulary.md'ye UNVERIFIED bandı + PARK damgası EKLE — zincir dosyasının "zaten var" varsayımı yanlış çıktı (3.6).
19. Paralel clobber gotcha'sı (5.8) NEREDEYİZ notuna; kapanış zinciri seri koştuğu için ek iş yok.

---

YEŞİL TANIMI KARŞILANDI: 5 tablo dolu (11+8+9+8+10 = 46 satır), her satırda dosya:satır, iş listesi ray-bazlı donduruldu.
