# V6-B — `edit_locality_check` SÜS MÜ? (teşhis, onarım YOK)

Ham mutasyon çıktısı: `GECE/log/V6-B.mutasyon.txt`. Bu dosyadaki her sayı orada
ÖNCE/SONRA exit koduyla duruyor. Kalıcı kod değişikliği YOK — dört mutasyonun
dördü de geri alındı, her geri almadan sonra `git diff --stat` boş ve test exit 0.

## HÜKÜM

**GERÇEK KAPI — ama dişi ÜÇ YÖNDE var, BİR YÖNDE yok.**

Kapı üç kasıtlı bozmayı yakaladı (M2 6 KIRMIZI, M3 2 KIRMIZI, M4 1 KIRMIZI, üçünde
de exit 1). Süs değil: dokunulmayan panele üretim sonrası +5mm enjekte edildiğinde
kırmızı düşüyor, bölge şişirildiğinde A2 ateşliyor, bir vaka sessiz no-op'a
çevrildiğinde A3 ateşliyor.

**AMA:** kapının kendi karşılaştırmasını BAYT'tan panel VARLIĞINA gevşetince
(M1) kapı YEŞİL kaldı, exit 0. Yani "bayt-aynı" iddiasının inceliğini koruyan
mandal YOK. A1'in eşiği `antiCaught > 0` (test dosyası satır 75); M1 altında A1
10/12'den 9/12'ye düştü, sıfıra düşmediği için kapı geçti. Bir gelecek "iyileştirme"
lokalliği bayt yerine panel adı/sayısı üzerinden ölçmeye çevirirse KAPI HABER VERMEZ.

## 1. `draft()` HANGİ MOTORU KOŞUYOR? (dosya:satır kanıtı)

| adım | dosya:satır | ne |
|---|---|---|
| `draft()` | `engine/tools/spec-diff.mjs:152-161` | `engine.draftJSON(engineSpec(spec), body)` |
| motor yükleme | `engine/tools/spec-diff.mjs:46-52` | `createRequire(...)(join(ROOT,'engine','dist','stitchu-engine.js'))()` |
| o dosya nedir | `engine/build-wasm.sh` 1. `em++` çağrısı, `-o dist/stitchu-engine.js` | Emscripten `-sSINGLE_FILE=1 -sMODULARIZE=1` **WASM** paketi |
| C++ tarafı | `engine/wasm/bindings.cpp:339` `draftJSON(val,val)`, `:484` `emscripten::function("draftJSON", ...)` | embind sınırı |

**Cevap: WASM.** Ne native ctest ikilisi, ne `web/js/_engine-full.mjs`. `spec-diff.mjs`
`web/js/engine.js`'ten SADECE `engineSpec` çevirisini alıyor (satır 29); o dosyanın
kendi WASM yükleyicisi (`web/js/engine.js:56`, `vendor/stitchu-engine.js?v=136`)
kullanılmıyor, ama **aynı ikili**: `build-wasm.sh` `dist/stitchu-engine.js`'i
`web/vendor/stitchu-engine.js`'e kopyalıyor. Kaynak damgası doğrulandı, aynı:
`web/vendor/stitchu-engine.js` 1. satırı `source-stamp 7023c808195429b3`,
`engine/` içinde damga yeniden hesaplandı → `7023c808195429b3`. Yani kapı
**kullanıcının gerçekten çalıştırdığı hattı** yargılıyor.

**★ Yargılamadığı hat: `engine/src/surfacepattern.cpp` (KOŞU 4'ün tek-yüzey hattı).**
`grep -c surfacepattern engine/build-wasm.sh` → **0**. WASM'a giren 35 kaynak
2B-çizim hattı (`bodice.cpp`, `sleeve.cpp`, `skirt.cpp`, `collar.cpp`, ...).
Lokallik kapısı yüzey hattı hakkında HİÇBİR ŞEY söylemiyor.

**★ `engine/dist/` GITIGNORE'DA** (`git check-ignore -v` → `engine/.gitignore:5:dist/`).
Kapı, git'te olmayan bir derleme çıktısına bağlı: temiz bir checkout'ta
`edit_locality_check` motoru bulamaz. Yerelde `build-wasm.sh` koşulmuş olduğu için
yeşil. (Kart dışı, dokunulmadı.)

## 2. 12 VAKA — BÖLGE DIŞI YARGILANAN PANEL SAYISI (`r.locality.checked`)

Temel koşu (mutasyonsuz), `node engine/tests/edit_locality_check.mjs` → **exit 0**,
`edit_locality_check: hepsi yeşil`. Taban kalıpta toplam **6 panel** var
(Bodice Front/Back, Skirt Front/Back, Sleeve, Bias binding (neckline)).

| # | vaka | bölge | checked | tutulan paneller |
|---|---|---|---|---|
| 1 | yakayı değiştir (bebe yaka) | neckZone | **3** | Skirt Back, Skirt Front, Sleeve |
| 2 | yaka oyuğunu değiştir (V) | neckZone+shoulderZone | **2** | Skirt Back, Skirt Front |
| 3 | fiyonk ekle (ön yaka) | cfZone+backZone+waistZone | **1** | Sleeve |
| 4 | uzat (etek maxi) | hemZone | **4** | Bias binding, Bodice Back, Bodice Front, Sleeve |
| 5 | kısalt (kol kısa) | sleeveZone | **4** | Bodice Back/Front, Skirt Back/Front |
| 6 | manşet ekle | sleeveZone | **4** | Bodice Back/Front, Skirt Back/Front |
| 7 | cep ekle (yama) | surface+sideSeamZone | **2** | Bias binding, Sleeve |
| 8 | peplum ekle | waistZone | **2** | Bias binding, Sleeve |
| 9 | sırtı aç | backZone | **3** | Bodice Front, Skirt Front, Sleeve |
| 10 | düğme sırası ekle | cfZone | **3** | Bodice Back, Skirt Back, Sleeve |
| 11 | etek ucuna volan | hemZone | **4** | Bias binding, Bodice Back/Front, Sleeve |
| 12 | korse bağcıklı sırt | backZone | **3** | Bodice Front, Skirt Front, Sleeve |

Toplam **35 panel-yargısı**, ihlal 0. En zayıf vaka **3 numara: TEK panel** (Sleeve)
üstünde ölçülüyor — "fiyonk ekle" üç bölgeye birden ait olduğu için kesişim
tek isme iniyor. A2 (>0) geçiyor ama iddia 6 panelin 1'i kadar geniş.

## 3. BÖLGE LİSTESİ ELLE Mİ YAZILDI? — **EVET, ELLE.**

- Repoda `contract/edit-locality-v1.json`'u ÜRETEN hiçbir şey yok. Tüm repo
  taramasında dosyanın adı yalnız **okuyan** yerlerde geçiyor:
  `engine/tools/spec-diff.mjs:34,69`, `engine/tests/edit_locality_check.mjs:8`,
  `engine/CMakeLists.txt:840` + GECE tutanakları. `--check` bekçisi yok.
- `contract/generated-paths.sha256` içinde **0 kez** geçiyor (üretilmiş dosya
  sayılmıyor). Dosyanın başında GENERATED başlığı yok; `_baslik`, `_yasa`,
  `_nasil`, `_bolge_kaynagi` insan cümleleri.
- Tek commit'te doğmuş: `8373176` "F-I: spec DIFF editing line + edit_locality_check gate…".

**★ Dosyanın kendi iddiası ÖLÇÜLDÜ ve kısmen YANLIŞ.** `_bolge_kaynagi` diyor ki
"composition.json'daki her bileşenin conflictClass'ı buraya BİREBİR taşındı".
22 bileşen karşılaştırıldı, **3'ü tutmuyor**:

| bileşen | specField | composition.conflictClass | edit-locality fieldZones |
|---|---|---|---|
| `neckline.ext` | neckline | `neckZone` | `neckZone, shoulderZone` |
| `gather` | gatherType | `zone-of-gatherZone` (şablon artığı gibi) | `neckZone` |
| `ruffleHem` | ruffleHem | `hemZone` | **YOK** (alan hiç düzenlenemez) |

Ayrıca `fieldZones`'daki **41 alanın 21'i** hiçbir bileşenden gelmiyor. Dosyanın
notu bunlardan 8'ini kabul ediyor (neckline/sleeve*/skirt*/topLength/waistline);
kalan **13'ü** (`frontPlacket`, `collarEdge`, `gatherZone`, `laceUpBack`, `ruffle`,
`hemFlounce`, `wrapFront`, `boxPleat`, `yoke`, `cupSeam`, `photoFabric` +
`skirtLengthMM`, `garment/shaping/fabric` global'leri) notta bile anılmadan elle
yazılmış. **Bunları doğrulayan bir kapı yok** — kapı, elle yazılmış bir iddiayı
ölçüyor; iddianın kendisi ölçülmemiş.

## 4. MUTASYON TABLOSU (§4.5)

| | mutasyon | dosya | ÖNCE | SONRA | hüküm |
|---|---|---|---|---|---|
| **M1** | lokallik karşılaştırması gevşetildi: `pieceBytes = JSON.stringify(p)` → `'PANEL'` (bayt yerine panel varlığı) | `engine/tools/spec-diff.mjs:163` | exit 0, `hepsi yeşil`, A1 **10/12** | exit **0**, `hepsi yeşil`, A1 **9/12** | ❌ **KIRMADI — bu yönde DİŞ YOK** |
| **M2** | dokunulmayan panele üretim sonrası enjeksiyon: ilk `^Skirt\|Sleeve` panelinin ilk `x`'ine +5mm (`runEdit` içinde, motora dokunmadan) | `engine/tools/spec-diff.mjs` `runEdit` | exit 0 | exit **1**, `6 KIRMIZI` (Skirt Front `ae01610930c6 -> fbfb124c9df4`) | ✅ KIRDI |
| **M3** | `zones.neckZone.untouchable = []` (bölge "tüm gövde") | `contract/edit-locality-v1.json` | exit 0 | exit **1**, `2 KIRMIZI` — vaka 1 ve 2'de `bölge dışı yargılanan panel YOK` | ✅ **A2 KIRDI** |
| **M4** | `applyDiff` `cuffStyle` op'unu sessizce atlıyor → "manşet ekle" hiç uygulanmıyor | `engine/tools/spec-diff.mjs` `applyDiff` | exit 0 | exit **1**, `1 KIRMIZI` — `SESSİZ NO-OP: cuffStyle=button … okunuyor, çizilmiyor` | ✅ **A3 KIRDI** |

Her satırdan sonra dosya geri alındı; logda dördünün de arkasından
`git diff --stat … => []` ve `EXIT=0` duruyor.

## 5. DİŞİ OLMAYAN YÖNLER (onarılmadı, adıyla yazıldı)

1. **Bayt inceliği korumasız (M1).** A1'in eşiği `antiCaught > 0`; karşılaştırma
   panel varlığına indirgense bile rewrite kipinde panel doğup kaybolduğu için
   A1 hâlâ 9 vaka yakalıyor, kapı yeşil kalıyor. Eşik mutlak sayı değil, en
   azından bir taban (ör. temel koşudaki 10) olmalı — **YAPILMADI, kart onarım yasakladı.**
2. **A1 zaten temel koşuda 12/12 değil, 10/12.** `yaka oyuğunu değiştir (V)`
   hiç yakalanmıyor (log satır 41). Yani rewrite kipi iki vakada dokunulmayan
   paneli gerçekten bozmuyor; bu bir teşhis, kapı bunu raporluyor ama saymıyor.
3. **Yargılanan yüzey dar.** 12 vakanın 35 panel-yargısı, hepsi TEK bedende
   (`BODY` sabit, `spec-diff.mjs:41-43`) ve TEK taban spec'te (`BASE`,
   `edit_locality_check.mjs:22-26`). Beden/gövde değişince lokallik test edilmiyor.
