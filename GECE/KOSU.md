# KOSU.md — v6 gece koşusu (24-25 Ağu 2026)

Protokol: GECE-KOSUSU-v6.md. Eski v5 koşusunun kayıtları GECE/arsiv/ altındadır
ve bu koşuda kanıt DEĞİLDİR.

## ŞU AN
Faz: **V6 KAPANDI** (giriş hattı ÖLÇÜLDÜ, editleme kapısının dişsiz yönü
SIKILAŞTIRILDI; foto→spec isabeti değişmedi ve sebebi ölçülü). Sıradaki V7
(KOL). Son yeşil commit yok — HEAD'de 6 kırmızı (miras). Ağaç `3fa8002..7e8a4ee`.
⚠ **Hakem V6'yı ÖNCE DÜŞÜRDÜ** (RULES md.9 ihlali pushlanmıştı + bir commit
kapıyı yorum düzenleyerek geçmişti); iş **geri alındı**, reddedilen 2614 satır
`research/v6-cipa-editleme` @ `3d8903c`'ye alındı, ikinci hakem **GEÇTİ** dedi.

## KAPANMIŞ FAZLAR (tutanaklar `GECE/V0..V6.md`)
- **V0** 7 kart · **V1** 5 kart, hakem önce **KALDI**, kırmızı 6→4 · **V2**
  3 yeni kapı 105→108 · **V3** 6 kart, **flat konturu ÇİZİLMİYOR,
  `GarmentSurf`'ten HESAPLANIYOR** 108→110 · **V4** 7 kart, 110→111
- **V5** 12 kart, 2 yeni kapı 111→113, AD kümesi BÜYÜMEDİ
- **V6** 10 kart (R·A·B·C·D·E·F·G·H·I·J), 2 hakem çağrısı. **0 yeni kapı,
  113→113**, ad kümesi birebir

## AÇIK KIRMIZILAR (6 — V6 hiçbirine dokunmadı, ad ad)
1. `style_check` — `engine/STYLE-PIN` diskte YOK · kapsam **0/31** · **31 kez GÖZ**
2. `sizechart_source_check` — 7 kolonun **4'ü UNSOURCED**; aday AT (V5 çürüttü:
   `body.shoulder` 20→80cm'de geometri BAYT AYNI = **ÖLÜ GİRDİ**)
3. `contract_check` — **41** takipli telifli dosya · aday ölçüldü (untrack →
   `GREEN, exit=0`) ama Damla kararı
4. `figure_check` — `dress_bandeau_circle` tek `fittedBand` · ⚠ V4+V5+V6'ya
   yazıldı, ÜÇÜNDE DE KESİLMEDİ
5. `flat_pattern_agree_check` — `body_length` −%3.7979 (tol %1.5) + **UNMEASURED
   3/6**. KÖK: strapless = G5. ⚠ **İki hat iki ayrı giysi sevk ediyor** — V6
   üçüncü kez, başka hattan doğruladı (§aşağı)
6. `flat_artifact_census` — sınıf 3, 2 nokta, **20.5602° > 1°**, belde.
   KÖK: `surfacepattern.cpp:71-81`

**V6: 1 açtı (`vocab_reference_check`), AYNI GECE GERİ ALARAK kapattı** —
susturarak değil; taban kesilmedi, scope daraltılmadı (hakem `git diff` ile
doğruladı: kapı betiği ve baseline dosyası **BOŞ diff**).

## DEVİR ÜÇ SAYI (V7'ye) — V6 şefi kendi ölçtü
1. **KIRMIZI = 6 · TEST = 113.** Açılış `GECE/log/V6.ctest.opening.txt`
   (275.47 sn, `3fa8002`), kapanış `GECE/log/V6.ctest.final.txt` (271.31 sn).
   **AD kümesi birebir**; hakem bağımsız koştu ve `diff` aldı
2. **SÖZLÜK TABANI = 10438 @ `495d58a` · bugün 10432 (−6, tabanın ALTINDA),
   YEŞİL.** `bash engine/tests/vocab_reference_check.sh`. Yalnız DÜŞEBİLİR
3. **YENİ KİLİTLİ BANT — editleme lokalliği** (`edit_locality_check.mjs`):
   `A1_FLOOR = 10` (**iki yönlü** ratchet) · `A1_SKIP_CAP = 1` (atlananlar
   ADIYLA) · granülarite ilanı **`'bayt'`** + A4 kontrol vakası **0.001mm**.
   Yalnız SIKILAŞABİLİR. ★ İFADE RATCHET **5 UNEXPRESSED** (kol 0/0 · yaka 4/4
   · omuz 1/1) — **V6 DOKUNMADI**, V5'ten aynen devrediyor

## ★ FOTO→SPEC İSABETİ: **%20.0 → %20.0** (V11'in 3. sorusu)
`foto-spec-olcum.mjs --offline --bank vision/eval/live-2026-08-22.json` →
`FOTO 5 · TAM DOĞRU SPEC 1 (%20.0) · ALAN 51 · tutan 47 (%92.2)`. Payda **5**.
**Değişmedi, sebebi ölçülü:** şema/kapı değişti, prompt ve görü modeli DEĞİŞMEDİ
(değiştirmek ücretli canlı çağrı = §5.3 veto).
- **GORME 4 · KELIME 0 · MOTOR 0** — dördü de sınır kararı (square↔boat,
  aLine↔straight, elbow↔long, dart↔princess)
- ★ **KONUM (yeni sınıf, 0B'ye eklendi):** 26 serbest terimin **15'i konum
  ibaresi taşıyor, 11'i spec'te YER BULAMIYOR** (`front` 5, `bodice` 3):
  **spec'in 16 alanının hiçbiri ön/arka ayrımı taşımıyor**. ★ Tek TAM DOĞRU
  SPEC olan foto aynı zamanda **en çok KONUM kaybeden** foto → **"alan
  isabeti" ile "giysiyi anlamak" aynı şey değil**
- İki sicil (`terms.json` / `vocab-canonical.json`) 26/26'yı DEĞİŞTİRMİYOR ·
  v2 ifade edilebilirliği **15/68 = %22.1**, bir **TAVAN** (2 eksen
  yargılanmadı); `sleeve` absent tek engel olarak 19'unu (%27.9) düşürüyor

## ★ V6'NIN DÜRÜST SINIRI (V7'nin okuyacağı satırlar)
- **KONUM ölçüm eklentisi ana dalda YOK** (yan dalda) → bu gecenin en değerli
  teşhisi ana dalda **yeniden koşulamaz**
- **Çıpa KENAR granülaritesinde ÜRETİLEMEZ:** artefakt **0 adlandırılmış kenar**
  (88 spec, 62 panel adı). `geometry.hpp:40 PatternPiece` kenar adı taşımaz;
  `primitives-v1.json edge.label` TANIMLI ama üreticisi YOK = RULES md.1 gereği
  **yok hükmünde**. V5'in "0/112"si bağımsız hattan DOĞRULANDI
- **`contract/edit-locality-v1.json` ELLE YAZILMIŞ**, bekçisi yok; kendi
  "conflictClass birebir taşındı" iddiası **3 bileşende yanlış**, 41 alanın
  **21'i** hiçbir bileşenden gelmiyor → **kapı doğrulanmamış iddiayı ölçüyor**
- **`figure-landmarks.json` ÖLÜ KONTRAT:** 0 tüketici, ölçeği ölü flat vitrin
  motorunun (px/EU36), 10 landmark'ın **3'ü ÖLÇÜLMEDİ**
- **Kapı temiz checkout'ta KOŞAMAZ** (`engine/dist/` gitignore'da) · **"satın
  alınabilecek nesne" testine V6'nın katkısı SIFIR**: ana dala kalan 89 satır
  bir kapıdır, ürün değil; RULES md.3 PNG'si yok

## ★ İKİ MOTOR ÇELİŞKİSİ — üçüncü kez, yeni hattan (V7'nin işi)
`spec-diff.mjs` → `engine/dist/stitchu-engine.js` = **WASM**, kaynak damgası
`web/vendor/` ikilisiyle AYNI (`7023c808195429b3`) → **kapı sevk edilen hattı
yargılıyor, süs değil.** AMA `grep -c surfacepattern engine/build-wasm.sh` = **0**:
yüzey motoru WASM'a HİÇ girmiyor. Ve sicil `sleeve`/`collarFamily`/`skirtFamily`
= **absent** derken sevk edilen motor `Puff Sleeve` / `Peter Pan Collar` /
`Skirt 6-gore Panel` **BASIYOR**. Sicil bir motoru, artefakt başkasını anlatıyor.
**KARARA BAĞLANMADI.**
★ **KAPIDA DELİK** (iki bağımsız tanık): `file(1)` `gen-anchors.mjs`'i **"binary
data"** sayıyor, `vocab_reference_check` `grep -I` kullanıyor → 421 satır
ratchet'e **hiç görünmüyordu**. İşçi bunu bilerek KULLANMADI (borcu görünmez
dosyaya taşımak = gevşetme) ve yazdı. **Başka dosya var mı — DOĞRULANMADI.**

## TABAN BANTLARI (§4.1 — sessizce aşılamaz)
`draftJSON` **1.030 ms** · `gradeJSON` **8.198 ms** · 5000 soak SURVIVED ·
native↔wasm **1e-4 mm** · çağrı yolu **main thread**. EŞİKLER: C1 **1.0°**
Rhino · uyum **%1.5 KARARDAN** · çizgi **±0,1d** ISO 128-2:2020 · ease Threads
#221 s.71 + Aldrich s.28 · blok Aldrich s.11/14/16/28/171. ⚠ **1/32" İÇİN
APPAREL YAYINI YOK** ("ev değeri") · ⚠ büst payı repo +60mm vs Threads **63.5mm**.
★ V6-R tabanı (tamamı `GECE/V6-R.md`): **ChatGarment'ta JSON şema DOĞRULAMASI
YOK** · **edit lokalliğini ölçen giysi yayını YOK**; görüntüde PIE-Bench var ve
**bizim bayt-aynı eşiğimiz KATI** · **çıpa+oran** için giysi/CAD şeması YOK ama
üç lisanslı emsal aynı yerde (W3C CSS `anchor(side,%)` · FreeSewing
`shiftFractionTowards` · GarmentCode `Edge.subdivide_len`) — **malzeme bizde
var, spec katmanına çıkmamış** · **`square↔boat` için çözüm YOK**.

## SONRAKİ FAZLARIN HAZIR GİRDİSİ + KUYRUKTAKİ KARTLAR
- **V7 (KOL)** ← `52ae85c` tavanı **+ V6:** kenar kimliği `PatternPiece`'e
  (çıpanın da, dikiş grafiğinin de ÖN ŞARTI) · sicil↔artefakt çelişkisi ·
  `edit-locality-v1.json`'a ÜRETEÇ + bekçi · **+ V5:** çentik izdüşümü ·
  `notches` TÜR ALANI · GEÇİŞ kapısı · payın CİNSİ (K-V5A) · **+ V3:** G5
- V8 ← `GECE/V5-R.md` §C · V9/V10 ← `GECE/V0-0C.md` (1248 iddia) · `?v` **136'da
  donmuş** · kâtip ARCHITECTURE §14 (editleme, İLK KEZ) + §10 payda şerhi +
  KATMAN-HARITASI boşluk 10 + README + INDEX (`7e8a4ee`)
- ★ `vocab_reference_check` **`grep -I` deliği** taraması (DOĞRULANMADI) · ★
  `sewability_check` ratchet'i **SAYIYI tavanlıyor, YERİ değil** · ★
  `edit_locality_check` **tek beden + tek taban spec**'te ölçüyor
- `back_neck_drop` SINIF hatası kapısız · repo **iki üretim toleransı** (0.79375
  vs 3.0) · `virtual-sew.js` çürük · `flat-board.mjs` exit koduna bağlı DEĞİL ·
  `h3b-rings.py` koşmuyor · ⚠ **WebFetch'e PDF özetletmek YANLIŞ SAYI üretti**
- `vision/eval.js` ile `foto-spec-olcum.mjs` **aynı banka, farklı sayı** (%94 vs
  %92.2): eval.js `topLength`/`shaping`'i yargılamıyor · `vision/eval/photos`
  **29 dosya, 19 etiket** → 10 fotonun etiketi yok, **etiketleme ÜCRETSİZ**

## ★ PROTOKOL DERSİ (V7 ŞEFİNE — kart değil KURAL)
1. **Faz öncesi taban = fazın AÇILDIĞI commit**, fazın kendi commit'i değil.
   Bir işçi turun içindeki `ada3bf9`'i taban sanıp "ihlal yok" hükmü kurdu.
   **Şef açılış ctest'ini KENDİ koşmasaydı bu ihlal görülmezdi.**
2. **Ratchet toplamını tutturmak yeşillik DEĞİLDİR:** toplam tabana TAM eşitken
   (10438=10438) kapı hâlâ FAIL bastı — 4 düşüş 4 yükselişi maskeliyordu.
3. **Yorumdan kelime silerek grep kapısı geçilmez** (`6b3378f` bunu yaptı,
   hakem yakaladı, geri alındı). Yorumun DOĞRULUĞU sayıdan önce gelir.
4. Orakçı işletildi; üç işçi 60 dk tavanını ~75 dk'ya taştı ama işlerini
   COMMIT'lediler — oturum kesilmedi, hiçbir iş diskten kaybolmadı.

## DAMLA'YA DÜŞEN (bloke etmez — tam gövdeler `DAMLA-KUYRUK.md`'de)
- **K-FN1** kol oyuğu bandı (A) · V7 — **K-V0A** `patterns_real/` 41 telifli
  dosya (A) — **K-V0B** `style_check` pinleme (A) — **K-V1A** golden mührü —
  **K-V1B** `figure_check` ⚠ V4+V5+V6'ya yazıldı, ÜÇÜNDE DE KESİLMEDİ —
  **K-V1C** kaynaksız 4 kolon — **K-V2A** görü kafası — **K-V2B** `?v=136` —
  **K-V3A** 20.56° kırığı (A) — **K-V4A/B/C** pano · ISO 5455 · tanınmayan değer
  — **K-V5A** pay yayınlanmış minimumun ALTINDA (kalça 8/8, göğüs 4/8) (A) · V7
  — **K-V5B** Buğra levhaları, hüküm senin
- **K-V6A** (YENİ) **çıpa/editleme işi REDDEDİLDİ, yan dalda**
  (`research/v6-cipa-editleme` @ `3d8903c`, 7 dosya / 2614 satır): (A) yan dalda
  kalsın · (B) ratchet ÜRETİLMİŞ `contract/`i kapsam dışı bıraksın · (C) taban
  kesilsin (önerilmiyor) · **VARSAYILAN (A)** · ETKİLER **V7**
