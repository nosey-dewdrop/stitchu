# stitchu

bir kıyafetin fotoğrafını çekiyorsun, stitchu onu senin vücut ölçülerine göre çizilmiş bir dikiş kalıbına çeviriyor ve a4'e birebir ölçekte bastırıyor.

canlı: https://damlahelloworld.github.io/stitchu (web v27)

## neden yaptım

hazır kalıplar kimsenin bedenine tam olmuyor, "small-medium-large" diye bir vücut yok. istediğin kıyafeti görüp "bunu kendim dikeyim" demek isteyince ya pahalı bir kalıp satın alıyorsun ya da matematikle boğuşuyorsun. ben o mesafeyi kapatmak istedim: gördüğün şeyle senin bedenin arasına giren bir motor. ve ölçüler kişisel veri, o yüzden hiçbiri buluta gitmiyor — hepsi cihazda kalıyor.

## nasıl çalışıyor

1. 7 vücut ölçünü giriyorsun (göğüs, bel, kalça, omuz, sırt boyu, kol boyu, boyun) — lokal saklanıyor, hiç yüklenmiyor.
2. kıyafet fotoğrafı yüklüyorsun. bir cloudflare worker claude vision'ı çağırıp kıyafeti sabit bir çizim sözlüğüne sınıflandırıyor (kıyafet tipi, yaka, kol, etek stili, bel çizgisi, kumaş davranışı). okumayı onaylıyorsun ya da düzeltiyorsun.
3. c++'ta yazılıp webassembly'ye derlenmiş, tamamen tarayıcında çalışan bir çizim motoru kalıp parçalarını senin ölçülerine çiziyor — yayımlanmış kalıp formülleriyle (freesewing, muller & sohn, winifred aldrich; her sabitin kaynağı `engine/FORMULAS.md` ve `knowledge/` içinde).
4. çıktı: pens, düz iplik ve çizilmiş dikiş payı (dış kesim çizgisi / iç dikiş çizgisi) olan svg kalıp parçaları, 3 cm kalibrasyon kareli döşeli a4 pdf, kumaş metresi tahmini ve adım adım dikiş rehberi.

## mühendislik

- çizim sözlüğü: princess/pens şekillendirme, natural/empire/babydoll bel çizgileri, dokuma/örme, 5 etek stili, oturtma ve balon kol, kat kat fırfır, sweetheart, keyhole (oyuk + şekilli tela), halter (çerçeve-kaydırmalı beden + biye).
- doğrulama matrisi: 70.200 çizim (eu 34-52 + uzun/kısa/armut/elma/uç bedenler × tüm spec uzayı), hepsi geometrik değişmezleri geçiyor — yan dikiş dengesi, pens toplamları, kol oyuğu/kepi payı, bel birleşimleri, kendini kesme, baskı sığması. 8/8 ctest yeşil.
- dikiş-çifti hassasiyeti: `tools/precision-report.js` bir terzinin gerçekten iğnelediği her dikiş çiftini ölçüyor (omuz, yan, princess, bel birleşimi, kol kepi, tela); 1.0 mm üstü hata veriyor. iki gerçek açık bulundu (omuz çifti 8-10 mm, empire yan dikiş ~2 mm), ikisi de düzeltildi — en kötü çift artık 0.00 mm.
- dikiş payı ima edilmiyor, çiziliyor: dışa doğru zarf ofseti, hiçbir kesim çizgisi noktasının paydan daha yakın olamayacağı garantisiyle, kat-farkındalıklı, gönyeli köşeler, douglas-peucker ile 0.2 mm'ye sadeleştirilmiş.
- altın referans repoda sabitli (`engine/golden-reference.csv`, 23k satır); `golden-diff.py` deterministik çıktıyı 0.1 mm toleransla karşılaştırıyor. motor önce swift'ten 2805-çizimlik altın matrise göre taşındı, sonra düzeltmeler swift referansını geçince bilerek ondan ayrıştı.
- web katmanı fuzz: `tools/web-fuzz.js` arayüzün tüm spec uzayını uç-beden ölçüleriyle dolaşıp baskı paketleyicisini simüle ediyor — 19.555 çizim, 0 hata, hiçbir parça kırpılamıyor.
- vision maliyet hattı: zero-shot clip 44%, siglip 65% (elle etiketlere karşı) — çıkmaz sokak. claude opus öğretmen olarak 86%; plan onu tarayıcıda çalışan bir onnx öğrenciye damıtmak (70 lisanslı görsellik korpus + etiketleme pipeline'ı `vision/` içinde). tahmin değil ölçüm: `vision/README.md`.
- çizim bilgi tabanı: sqlite (`knowledge/`); bir formül iddiası ancak çekişmeli kaynak-kontrolünden geçince `verified` oluyor, çürütülenler bir daha kullanılmasın diye saklanıyor.

## stack

- motor: c++17, cmake, ctest; emscripten/embind ile tek dosyalık wasm bundle (`engine/dist/stitchu-engine.js`, ~218 kb)
- web: github pages üstünde statik html/css/js, framework yok; kalıplar svg olarak çiziliyor, istemci tarafında döşeli a4 pdf ile basılıyor; ölçüler ve gardırop local storage/indexeddb'de
- backend: claude vision'ı bir app token + ip başına rate limit arkasında proxy'leyen tek bir cloudflare worker (`backend/`) — tarayıcı api key'i asla tutmuyor
- vision deneyleri: `vision/` içinde node + @xenova/transformers (onnx)
- bilgi: `knowledge/` içinde sqlite çizim-formülü veritabanı

## repo yerleşimi

- `engine/` — c++ motor, testler, araçlar, wasm build, `FORMULAS.md` (çizim spec'i)
- `web/` — canlı site
- `backend/` — cloudflare worker (vision proxy)
- `vision/` — track b: vision modeline sahip olmak (eval + damıtma korpusu)
- `knowledge/` — doğrulanmış çizim-formülü veritabanı
- `App/` — orijinal swift ios app, referans olarak duruyor; c++ çekirdeği sonra ios/android'i besleyecek
- `docs/ARCHITECTURE.md` — katmanlar, veri akışı, tasarım kararları

## durum

web akışı baştan sona canlı (fotoğraf → analiz → çizim → baskı). sırada: damıtılmış öğrenci model için vision korpusunu toplu etiketlemek, gerçek bir `POST /api/draft` api'si (motor zaten worker'da çalışıyor) ve fiziksel dikiş testleri. detay `PROJECT.md` ve `PLAN.md` içinde.
