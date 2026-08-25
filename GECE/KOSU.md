# KOSU.md — v6 gece koşusu (24-25 Ağu 2026)

Protokol: GECE-KOSUSU-v6.md. Eski (farklı) v5 koşusunun kayıtları
GECE/arsiv/v5-kosusu/ altındadır ve bu koşuda kanıt DEĞİLDİR.

## ŞU AN
Faz: **V6 KAPANDI** (giriş hattı ÖLÇÜLDÜ, editleme kapısının dişsiz yönü
SIKILAŞTIRILDI; foto→spec isabeti bir milimetre değişmedi ve sebebi ölçülü).
Sıradaki V7 (KOL). Son yeşil commit: yok — HEAD'de 6 kırmızı (miras).
⚠ **Hakem V6'yı ÖNCE DÜŞÜRDÜ** (RULES md.9 ihlali pushlanmıştı + bir commit
kapıyı yorum düzenleyerek geçmişti); iş **geri alındı**, reddedilen 2614 satır
`research/v6-cipa-editleme` @ `3d8903c`'ye alındı, ikinci hakem **GEÇTİ** dedi.
Ağaç `3fa8002..7e8a4ee`.

## KAPANMIŞ FAZLAR
- **V0** — 7 kart, 6 alt kapı yeşil, 4.7 KALDI→GEÇTİ · **V1** — 5 kart, hakem
  önce **KALDI** (tanık cümlesi UYDURMAYDI), kırmızı 6→4 · **V2** —
  DEVRALINDI, **3 yeni kapı**, 105→108. `GECE/V{0,1,2}.md`
- **V3** — 6 kart. **Kabuk yayınlandı: flat dış konturu ÇİZİLMİYOR, kalıbın
  beslendiği AYNI `GarmentSurf`'ten HESAPLANIYOR.** 108→110 · **V4** — 7 kart,
  **sessiz çökertme kapıya bağlandı** (110→111). `GECE/V3.md` · `GECE/V4.md`
- **V5** — DEVRALINDI. 12 kart. **2 yeni kapı, 111→113**, kırmızı AD kümesi
  BÜYÜMEDİ. `GECE/V5.md`
- **V6** — 10 kart (R·A·B·C·D·E·F·G·H·I·J), 2 hakem çağrısı. **0 yeni kapı,
  113→113**, ad kümesi birebir. `GECE/V6.md`

## AÇIK KIRMIZILAR (6 — V6 hiçbirine dokunmadı, ad ad)
1. `style_check` — `engine/STYLE-PIN` diskte YOK · kapsam **0/31** · darboğaz
   **31 kez GÖZ**
2. `sizechart_source_check` — 7 kolonun **4'ü UNSOURCED**; aday AT (V5 iki
   yönden çürüttü: `shoulderCM` hiçbir yayında vücut ölçüsü değil VE
   `body.shoulder` 20→80cm'de geometri BAYT AYNI = **ÖLÜ GİRDİ**)
3. `contract_check` — `git ls-files patterns_real` = **41** takipli telifli
   dosya · aday ölçüldü (untrack → `GREEN, exit=0`) ama Damla kararı
4. `figure_check` — `dress_bandeau_circle` tek `fittedBand` · ⚠ V4+V5+V6'ya
   yazıldı, ÜÇÜNDE DE KESİLMEDİ
5. `flat_pattern_agree_check` — `body_length` −%3.7979 (tolerans %1.5) +
   **UNMEASURED 3/6**. KÖK: strapless = G5. ⚠ **İki hat iki ayrı giysi sevk
   ediyor** (V5-D) — V6 bunu üçüncü kez, başka hattan doğruladı (§aşağı)
6. `flat_artifact_census` — sınıf 3, 2 nokta, **20.5602° > 1°**, belde.
   KÖK: `surfacepattern.cpp:71-81`

KAPANAN (V1): `golden_check` · `recipe_dress_check`. (V0): `bundle_fresh_check`.
AÇILIP AYNI GECE KAPATILAN — V2: 3 ad · V3: 2 ad · V4: 1 ad.
**V6: 1 açtı (`vocab_reference_check`), AYNI GECE GERİ ALARAK kapattı** —
susturarak değil; taban kesilmedi, scope daraltılmadı (hakem `git diff` ile
doğruladı: `vocab_reference_check.sh` ve baseline dosyası **BOŞ diff**).

## DEVİR ÜÇ SAYI (V7'ye) — V6 şefi kendi ölçtü
1. **KIRMIZI = 6 · TEST = 113.** Açılış `GECE/log/V6.ctest.opening.txt`
   (275.47 sn, `3fa8002`), kapanış `GECE/log/V6.ctest.final.txt` (271.31 sn).
   **AD kümesi birebir aynı**; hakem bağımsız yeniden koştu ve `diff` aldı
2. **SÖZLÜK TABANI = 10438 @ `495d58a` · bugün 10432 (−6, tabanın ALTINDA),
   YEŞİL.** `bash engine/tests/vocab_reference_check.sh`. Yalnız DÜŞEBİLİR
3. **YENİ KİLİTLİ BANT — editleme lokalliği** (`edit_locality_check.mjs`):
   `A1_FLOOR = 10` (12 vakada, **iki yönlü** ratchet) · `A1_SKIP_CAP = 1`
   (atlananlar ADIYLA) · granülarite ilanı **`'bayt'`** + A4 kontrol vakası
   **0.001mm**. Yalnız SIKILAŞABİLİR. ★ İFADE RATCHET **5 UNEXPRESSED**
   (kol 0/0 · yaka 4/4 · omuz 1/1) — **V6 DOKUNMADI**, V5'ten aynen devrediyor

## ★ FOTO→SPEC İSABETİ: **%20.0 → %20.0** (V11'in 3. sorusu)
`node engine/tools/foto-spec-olcum.mjs --offline --bank vision/eval/live-2026-08-22.json`
→ `FOTO 5 · TAM DOĞRU SPEC 1 (%20.0) · ALAN 51 · tutan 47 (%92.2)`.
**Değişmedi, sebebi ölçülü:** şema/kapı değişti, prompt ve görü modeli
DEĞİŞMEDİ (değiştirmek ücretli canlı çağrı = §5.3 veto). Payda **5**, 19 değil.
- Hata sınıfı: **GORME 4 · KELIME 0 · MOTOR 0** — dördü de sınır kararı
  (square↔boat, aLine↔straight, elbow↔long, dart↔princess)
- ★ **KONUM (yeni sınıf, 0B'ye eklendi):** 26 serbest terimin **15'i konum
  ibaresi taşıyor, 11'i spec'te YER BULAMIYOR.** Kayıp konumlar `front` (5) ve
  `bodice` (3): **spec'in 16 alanının hiçbiri ön/arka ayrımı taşımıyor**
- ★ Tek TAM DOĞRU SPEC olan foto aynı zamanda **en çok KONUM kaybeden** foto
  (alan %100, serbest kanalda 8 terimin 5'i yerini kaybediyor).
  **"Alan isabeti" ile "giysiyi anlamak" aynı şey değil**
- İki sicil (`terms.json` / `vocab-canonical.json`) 26/26'yı DEĞİŞTİRMİYOR
- v2 ifade edilebilirliği **15/68 = %22.1** ve bu bir **TAVAN** (2 eksen
  yargılanmadı); `sleeve` absent tek engel olarak 19'unu (%27.9) düşürüyor

## ★ V6'NIN DÜRÜST SINIRI (V7'nin okuyacağı satırlar)
- **KONUM ölçüm eklentisi ana dalda YOK** — yan dala gitti. Bu gecenin en
  değerli teşhisi ana dalda **yeniden koşulamaz**; kod `3d8903c`'de
- **Çıpa KENAR granülaritesinde ÜRETİLEMEZ:** artefakt **0 adlandırılmış kenar**
  (88 spec, 62 panel adı, `edgeLabel/edges/seam/seamGraph` hepsi 0).
  `geometry.hpp:40 PatternPiece` panel adı taşır, kenar adı taşımaz.
  `primitives-v1.json` `edge.label`'ı TANIMLI ama üreticisi YOK = RULES md.1
  gereği **yok hükmünde**. V5'in "0/112"si bağımsız hattan DOĞRULANDI
- **`contract/edit-locality-v1.json` ELLE YAZILMIŞ**, `--check` bekçisi yok;
  kendi "conflictClass birebir taşındı" iddiası **3 bileşende yanlış**, 41
  alanın **21'i** hiçbir bileşenden gelmiyor. **Kapı doğrulanmamış bir iddiayı
  ölçüyor** (V2'nin menü yasağının içinde duran bir kalem)
- **`figure-landmarks.json` ÖLÜ KONTRAT:** 0 tüketici, GENERATED başlığı yok,
  ölçeği ölü flat vitrin motorunun (px/EU36), 10 landmark'ın **3'ü ÖLÇÜLMEDİ**
- **Kapı temiz checkout'ta KOŞAMAZ:** `engine/dist/stitchu-engine.js`
  gitignore'da; yeşillik yerelde derlenmiş artefakta dayanıyor
- **`CLAUDE.md`'nin "satın alınabilecek nesne" testine V6'nın katkısı SIFIR** —
  ana dala kalan 89 satır bir kapıdır, ürün değil. RULES md.3 PNG'si yok

## ★ İKİ MOTOR ÇELİŞKİSİ — üçüncü kez, yeni hattan (V7'nin işi)
`spec-diff.mjs` → `engine/dist/stitchu-engine.js` = **WASM**, kaynak damgası
`web/vendor/` ikilisiyle AYNI (`7023c808195429b3`) → **kapı sevk edilen hattı
yargılıyor, süs değil.** AMA `grep -c surfacepattern engine/build-wasm.sh` = **0**:
yüzey motoru WASM'a HİÇ girmiyor. Ve sicil (`garment-spec-v2.json`)
`sleeve`/`collarFamily`/`skirtFamily` = **absent** derken sevk edilen motor
`Puff Sleeve` / `Peter Pan Collar` / `Skirt 6-gore Panel` panellerini **BASIYOR**.
Sicil bir motoru, artefakt başka motoru anlatıyor. **KARARA BAĞLANMADI.**

## ★ KAPIDA DELİK (iki bağımsız tanık, kuyrukta)
`file(1)` `gen-anchors.mjs`'i **"binary data"** sayıyor, `vocab_reference_check`
`grep -I` kullanıyor → 421 satır ratchet'e **hiç görünmüyordu**. İşçi bunu
bilerek KULLANMADI (borcu görünmez dosyaya taşımak = gevşetme) ve yazdı;
hakem doğruladı. **Aynı sınıftan başka dosya var mı — DOĞRULANMADI.**

## TABAN BANTLARI (§4.1 — sessizce aşılamaz)
`draftJSON` medyan **1.030 ms** (p95 1.107) · `gradeJSON` **8.198 ms** · 5000
soak SURVIVED · native↔wasm **1e-4 mm** · çağrı yolu **main thread** → Worker
KUYRUK KARTI. EŞİKLER: C1 **1.0°** McNeel Rhino · uyum **%1.5 KARARDAN**,
yayın YOK · çizgi **±0,1d** ISO 128-2:2020 · **ease** Threads #221 s.71 +
Aldrich 4.bs s.28 · **blok formülleri** Aldrich s.11/14/16/28/171.
⚠ **1/32" İÇİN APPAREL YAYINI YOK** — "ev değeri" denir. ⚠ **Büst payı künyesi
ÇÜRÜDÜ:** repo +60mm, Threads minimumu **63.5mm**.
★ V6-R'nin eklediği taban: **ChatGarment'ta JSON şema DOĞRULAMASI YOK**
(79.834 karakterde `validat|schema|constrain|grammar` **0 eşleşme**) ·
**edit lokalliğini ölçen giysi yayını YOK**, görüntü tarafında PIE-Bench var ve
**bizim bayt-aynı eşiğimiz ondan KATI** · **çıpa+oran** için giysi/CAD'de adı
konmuş şema YOK ama üç lisanslı emsal aynı yere varıyor (W3C CSS
`anchor(side,%)` · FreeSewing `shiftFractionTowards` MIT · GarmentCode
`Edge.subdivide_len` MIT) — **malzeme bizde var, spec katmanına çıkmamış** ·
**`square↔boat` sınıfı karışma için yayınlanmış çözüm YOK**.

## SONRAKİ FAZLARIN HAZIR GİRDİSİ
- **V7 (KOL)** ← `52ae85c` tavanı **+ V6:** kenar kimliği `PatternPiece`'e
  (çıpanın da, dikiş grafiğinin de ÖN ŞARTI) · sicil↔artefakt çelişkisi ·
  `edit-locality-v1.json`'a ÜRETEÇ + bekçi · **+ V5:** çentik izdüşümü ·
  `notches` TÜR ALANI · GEÇİŞ kapısı · payın CİNSİ (K-V5A) · **+ V3:** G5
- V8 ← `GECE/V5-R.md` §C · V9/V10 ← `GECE/V0-0C.md` (1248 iddia) · `?v` **136'da
  donmuş** · kâtip ARCHITECTURE §14 (editleme, İLK KEZ) + §10 payda şerhi +
  KATMAN-HARITASI boşluk 10 + README + INDEX tazeledi (`7e8a4ee`)

## KUYRUKTAKİ KART TASLAKLARI
- ★ `vocab_reference_check`'in **`grep -I` deliği**: aynı sınıftan başka dosya
  taraması (DOĞRULANMADI) · ★ `sewability_check` ratchet'i **SAYIYI tavanlıyor,
  YERİ değil** · ★ `edit_locality_check` **tek beden + tek taban spec**'te
  ölçüyor; 12 vakanın 1'i yakalanmıyor, 1'i (`manşet ekle`) hiç koşulamıyor
- `back_neck_drop` **SINIF hatası** kapısız (Aldrich SABİT 1.5cm, motor
  GRADUATE ediyor) · repo **iki üretim toleransı** taşıyor (0.79375 vs 3.0) ·
  `virtual-sew.js` **çürük** · `flat-board.mjs` `FARK VAR` basıyor ama exit
  koduna bağlı DEĞİL · `h3b-rings.py` koşmuyor
- ⚠ **WebFetch'e PDF özetletmek YANLIŞ SAYI üretti** → PDF'ten WebFetch'le
  çekilmiş her antropometrik sayı ŞÜPHELİ · **Aldrich'in kendisi çelişkili**
- `vision/eval.js` ile `foto-spec-olcum.mjs` **aynı banka üstünde farklı sayı**
  basıyor (%94 vs %92.2): eval.js `topLength`/`shaping`'i hiç yargılamıyor ·
  `vision/eval/photos` **29 dosya, 19 etiket** → 10 fotonun etiketi hiç
  yazılmamış, **etiketleme ÜCRETSİZ**

## ★ PROTOKOL DERSİ (V7 ŞEFİNE — kart değil KURAL)
1. **Faz öncesi taban = fazın AÇILDIĞI commit**, fazın kendi commit'i değil.
   Bir işçi `ada3bf9`'i (turun içi) taban sanıp "ihlal yok" hükmü kurdu; şef
   kendi açılış ölçümüyle çürüttü. **Şef açılış ctest'ini KENDİ koşmasaydı bu
   ihlal görülmezdi.**
2. **Ratchet toplamı tutturmak yeşillik DEĞİLDİR:** toplam tabana TAM eşitken
   (10438 = 10438) kapı hâlâ FAIL bastı — 4 düşüş 4 yükselişi maskeliyordu.
3. **Yorumdan kelime silerek grep kapısı geçilmez.** Bir commit tam bunu yaptı
   (`6b3378f`), hakem yakaladı, geri alındı. Yorumun DOĞRULUĞU sayıdan önce gelir.
4. Orakçı işletildi (tavan 60 dk); üç işçi tavanı ~75 dk'ya taştı ama işlerini
   COMMIT'lediler, oturum kesilmedi, hiçbir iş diskten kaybolmadı.

## DAMLA'YA DÜŞEN (bloke etmez — hepsi varsayılanıyla yürüyor)
- **K-FN1** kol oyuğu bandı (A) · V7 — **K-V0A** `patterns_real/` 41 takipli
  telifli dosya (A) — **K-V0B** `style_check` pinleme (A) kırmızı kalsın
- **K-V1A** golden mührü · **K-V1B** `figure_check` ⚠ V4+V5+V6'ya yazıldı,
  ÜÇÜNDE DE KESİLMEDİ — **K-V1C** kaynaksız 4 kolon (C)
- **K-V2A** görü kafası · **K-V2B** site `?v=136`'da donmuş · **K-V3A** beldeki
  20.56° kırığı **(A)** · **K-V4A** ESKİ|YENİ panosu · **K-V4B** `1:3` ISO
  5455'te YOK · **K-V4C** tanınmayan değer **(A)** çizilsin
- **K-V5A** sevk edilen kalıbın payı yayınlanmış minimumun ALTINDA (kalça 8/8,
  göğüs 4/8) · **VARSAYILAN (A)** · V7 — **K-V5B** Buğra levhaları, hüküm senin
- **K-V6A** (yeni) **çıpa/editleme işi reddedildi ve yan dalda**
  (`research/v6-cipa-editleme` @ `3d8903c`, 7 dosya / 2614 satır): (A) yan dalda
  kalsın · (B) ratchet ÜRETİLMİŞ `contract/` dosyalarını kapsam dışı bıraksın ·
  (C) taban kesilsin (önerilmiyor) · **VARSAYILAN (A)** · ETKİLER **V7**
