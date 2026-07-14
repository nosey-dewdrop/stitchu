# stitchu

bir kıyafetin fotoğrafını çekiyorsun, stitchu onu senin vücut ölçülerine göre çizilmiş bir dikiş kalıbına çeviriyor ve a4'e birebir ölçekte bastırıyor. gördüğü kıyafeti kendi bedeninde dikmek isteyen herkes için — hazır kalıp satın almadan, matematikle boğuşmadan.

canlı: https://nosey-dewdrop.github.io/stitchu (web v27)

## nasıl çalışıyor — bunun için neler kullandım

1. 7 vücut ölçünü giriyorsun (göğüs, bel, kalça, omuz, sırt boyu, kol boyu, boyun) — lokal saklanıyor, hiç yüklenmiyor.
2. kıyafet fotoğrafı yüklüyorsun. bir cloudflare worker claude vision'ı çağırıp kıyafeti sabit bir çizim sözlüğüne sınıflandırıyor (kıyafet tipi, yaka, kol, etek, bel çizgisi, kumaş davranışı). okumayı onaylıyor ya da düzeltiyorsun.
3. c++'ta yazılıp webassembly'ye derlenmiş, tamamen tarayıcında çalışan bir çizim motoru kalıp parçalarını senin ölçülerine çiziyor — yayımlanmış kalıp formülleriyle (freesewing, muller & sohn, winifred aldrich; her sabitin kaynağı `engine/FORMULAS.md` içinde).
4. çıktı: pens, düz iplik ve çizilmiş dikiş payı olan svg kalıp parçaları, 3 cm kalibrasyon kareli döşeli a4 pdf, kumaş metresi tahmini ve adım adım dikiş rehberi.

çizim sözlüğü: princess/pens şekillendirme, natural/empire/babydoll bel çizgileri, dokuma/örme, 5 etek stili, oturtma ve balon kol, kat kat fırfır, sweetheart, keyhole, halter.

## ölçüm / accuracy — iddia değil, benchmark

- **doğrulama matrisi: 70.200 çizim, hepsi geçiyor.** eu 34-52 + uzun/kısa/armut/elma/uç bedenler × tüm spec uzayı; her biri geometrik değişmezleri geçiyor (yan dikiş dengesi, pens toplamları, kol oyuğu payı, kendini kesme, baskı sığması). 8/8 ctest yeşil.
- **dikiş-çifti hassasiyeti: en kötü çift 0.00 mm.** `tools/precision-report.js` bir terzinin gerçekten iğnelediği her dikiş çiftini ölçüyor, 1.0 mm üstü hata veriyor. iki gerçek açık bulundu (omuz çifti 8-10 mm, empire yan dikiş ~2 mm), ikisi de sıfırlandı.
- **web fuzz: 19.555 çizim, 0 hata.** `tools/web-fuzz.js` arayüzün tüm spec uzayını uç-beden ölçüleriyle dolaşıp baskı paketleyicisini simüle ediyor — hiçbir parça kırpılamıyor.
- **altın referans repoda sabitli** (`engine/golden-reference.csv`, 23k satır); `golden-diff.py` deterministik çıktıyı 0.1 mm toleransla karşılaştırıyor.
- **vision doğruluğu: opus öğretmen %86** (elle etiketlere karşı). zero-shot clip %44, siglip %65'te kaldı — çıkmaz sokak. plan opus'u tarayıcıda çalışan bir onnx öğrenciye damıtmak.

## teknolojiler

- motor: c++17, cmake, ctest; emscripten/embind ile tek dosyalık wasm bundle (~218 kb)
- web: github pages üstünde statik html/css/js, framework yok; kalıplar svg, baskı istemci tarafında döşeli a4 pdf; ölçüler ve gardırop local storage/indexeddb
- backend: claude vision'ı bir app token + ip başına rate limit arkasında proxy'leyen tek bir cloudflare worker — tarayıcı api key'i asla tutmuyor
- vision deneyleri: node + @xenova/transformers (onnx)
- bilgi: sqlite çizim-formülü veritabanı; bir formül ancak çekişmeli kaynak-kontrolünden geçince `verified` oluyor

## neden yaptım

hazır kalıplar kimsenin bedenine tam olmuyor, "small-medium-large" diye bir vücut yok. istediğin kıyafeti görüp "bunu kendim dikeyim" demek isteyince ya pahalı bir kalıp satın alıyorsun ya da matematikle boğuşuyorsun. ben o mesafeyi kapatmak istedim: gördüğün şeyle senin bedenin arasına giren bir motor. ve ölçüler kişisel veri, o yüzden hiçbiri buluta gitmiyor.

## repo yerleşimi

- `engine/` — c++ motor, testler, araçlar, wasm build, `FORMULAS.md` (çizim spec'i)
- `web/` — canlı site
- `backend/` — cloudflare worker (vision proxy)
- `vision/` — vision modeline sahip olmak (eval + damıtma korpusu)
- `knowledge/` — doğrulanmış çizim-formülü veritabanı
- `App/` — orijinal swift ios app, referans; c++ çekirdeği sonra ios/android'i besleyecek
- `docs/ARCHITECTURE.md` — katmanlar, veri akışı, tasarım kararları

detay `PROJECT.md` ve `PLAN.md` içinde.
