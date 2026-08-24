# F-I — FOTO + PROMPT → SPEC, ve EDİTLEME (2026-08-23)

Kart: `GECE/KART/F-I-giris.md`. Her sayı bir komut çıktısıdır, komutu yanında yazılı.
`contract/primitives-v1.json`'a DOKUNULMADI (F-G'nin dosyası).

---

## 1. ÖLÇÜM — bugün kaç foto doğru spec'e iniyor?

Araç: `engine/tools/foto-spec-olcum.mjs` (CANLI worker → vision-bridge → motor →
göz etiketiyle karşılaştırma). Ham cevaplar `vision/eval/live-2026-08-22.json`'a
bankalandı; ikinci koşu bankadan okur, kredi yakmaz.

```
node engine/tools/foto-spec-olcum.mjs --limit 12
```

| foto | alan yargısı | GÖRME | KELİME | MOTOR | panel | oov (sicilde yok) |
|---|---|---|---|---|---|---|
| 01-a-line-cocktail-dress-mannequin | 10/11 | 1 | 0 | 0 | 10 | 3/3 |
| 02-ball-gown-exhibit | 9/10 | 1 | 0 | 0 | 10 | 5/5 |
| 03-wedding-dress-mannequin | 9/10 | 1 | 0 | 0 | 10 | 4/4 |
| 04-babydoll-dress | 9/10 | 1 | 0 | 0 | 6 | 6/6 |
| 05-empire-waist-gown | 10/10 | 0 | 0 | 0 | 8 | 8/8 |

- **FOTO 5 · TAM DOĞRU SPEC 1 (%20.0)** — "tam" = 12 alanın gözle uyuşanı tam,
  motor da reddetmedi.
- **ALAN YARGISI 51 · tutan 47 (%92.2)**
- **HATA SINIFI: GÖRME 4 (%100) · KELİME 0 (%0) · MOTOR 0 (%0)**
- Dört eksiğin dördü de sınır kararı: `shaping` dart/princess · `neckline`
  square/boat · `skirtStyle` aLine/straight · `sleeveLength` elbow/long.
- **SERBEST KANAL: 26 terim, 26'sı (%100) `contract/terms.json` sicilinde YOK.**

### ⚠ Bu tablo 19 fotonun 5'idir — sebebi kota
Worker'ın kendi sigortası **15 çağrı/gün/IP**. Bugünkü kota 6. çağrıda doldu
(`{"error":"Rate limit exceeded"}`), kalan 14 foto ölçülemedi. Araç bankalı:
kota dönünce `node engine/tools/foto-spec-olcum.mjs` tabloyu tamamlar, ölçülenleri
tekrar çağırmaz. **%92.2 beş fotonun sayısıdır, 19'un değil — genelleme YAPILMADI.**

### Kartın sorduğu üç sınıfın bugünkü cevabı
- **motor değil**: 5 fotonun 5'inde de motor spec'i kabul etti, validator sustu,
  kalıp doğdu (6–10 panel).
- **kapalı liste (enum) değil**: gözün yazdığı 51 değerin 51'i motorun sözlüğünde
  ya da `contract/vocab-resolution-v1.json`'un 132 presetinde çözülüyor. **KELİME 0.**
- **kapalı liste (SERBEST KANAL) EVET, ve sayısı %100**: yapısal okumalar
  `outOfVocab`'a düşüyor ("frog-button closure at front", "contrast piping along
  collar and neckline"...) ve 26'sının 26'sı terim sicilinde yok. Sicil eşleşmesi
  tam-metin (`terms.json` kuralı), yani bu sayı sicilin DAR olduğunu değil,
  **serbest metnin sicile hiç bağlanmadığını** söylüyor.
- **görme**: kalan hataların tamamı burada, ve dördü de insanın da tartışacağı
  sınır kararları.

---

## 2. `web/js/missing.js` TERS YÖNDE YALAN SÖYLÜYOR MU? — EVET, 4 yerde. 3'ü kapatıldı.

`DAMLA-KUYRUK.md:564` kaydı *"sadece grep'le bakıldı, KOŞTURARAK DOĞRULANMADI"*
diyordu. Koşturuldu: `engine/tools/missing-olcum.mjs`, 15 vision okuması,
ürünün kendi fonksiyonlarıyla (`pick*` → `buildSeenRecord` → `missingFeatures`
→ `draftJSON`).

**Önce (onarımdan evvel):** TOPLAM 15 · DOĞRU-SESSİZ 9 · **TERS-YALAN 5** · DÜRÜST 1
**Sonra:** TOPLAM 15 · **DOĞRU-SESSİZ 14** · TERS-YALAN 0 · DÜRÜST 1 · SESSİZ-DÜŞÜŞ 0

Beşin biri ölçüm aracının kendi eksiğiydi (`pickYoke` çağrılmıyordu), dördü gerçek:

| okuma | motor ne çizdi | kart ne diyordu | kök sebep |
|---|---|---|---|
| ön yaka fiyonku | `Neck/Front Tie (ön bağ)` paneli | "neck bow — pattern'de yok" | serbest kanalda **tie bastırması hiç yoktu** (22 bastırmanın içinde yok) |
| bel bağı / kuşak | `Waist Tie (bel bağı)` paneli | "self-fabric sash — yok" | aynı |
| düğme patı (ön) | pat + ilik işaretleri (`closureDrawn`) | "button front placket — yok" | `buttonRowTerm` bastırması **sadece** `buttonRowDrawn`'a bakıyordu; simetrik pat `buttonRow`'u 'none' bırakır |
| görünür fermuar (arka) | fermuar dişi + açılmış dikiş (`exposedZipDrawn`) | "fermuar (center back) — yok" | serbest kanal 2026-07-17'den beri bastırıyordu ama **kapanma dalı hiç sormuyordu** |

Onarım: `web/js/missing.js` — `zipClosureDrawn` mandalı, `tieTerm` bastırması,
`buttonRowTerm` bastırmasına `closureDrawn` eklendi. Her üçünün de yanında
gerekçe + kanıt dosyası yazılı. Eşik gevşetilmedi, kart SİLİNMEDİ: çizilmeyen
tek okuma ("denizci yaka") hâlâ DÜRÜST kartını basıyor.

**Yapısal onarım:** `spec.seen` bayrak bloğu `create.js`'ten
`vision-bridge.js buildSeenRecord()`'a taşındı. Sebep: dürüstlük katmanının tek
girdisi ürün yolunda create.js'in içinde kilitliydi; ölçmek için kopyalamak
gerekiyordu ve **kopya sürüklendiği anda alıcıya ters yalan söylenir** — bu
dosyanın ölçtüğü kusurun tam olarak sınıfı budur. Artık ürün ve ölçüm aynı
fonksiyonu çağırıyor.

---

## 3. EDİTLEME — spec DIFF hattı

`engine/tools/spec-diff.mjs`. Model **geometri değil spec DIFF** üretir:

```
spec DIFF → şema doğrulama → sicil kontrolü (shipped değilse ADIYLA red)
         → aynı gövde/beden ile yeniden üretim → ÖNCE/SONRA
```

- **Şema:** `{ ops: [ {op:'set'|'unset', field, value, why?} ] }`. Model koordinat,
  panel adı ya da serbest metin gönderemez; `field` `contract/edit-locality-v1.json`
  `fieldZones`'ta yoksa reddedilir.
- **Sicil:** değer `web/js/vocab.gen.js` (motorun DERLEDİĞİ sözlük) + bileşen kaydı
  `contract/composition.json` ile sınanır. `SİCİLDE YOK: collarType='sailor'` gibi
  **adıyla** reddeder, en yakınına sessizce düşmez.
- **ÖLÇÜLMÜŞ sicil (yeni):** şema ve sicil geçse bile kalıp bayt bayt aynı kaldıysa
  `SESSİZ NO-OP` diye reddedilir. Bu satır bugün gerçek bir sessiz kusuru yakaladı
  (aşağıda, kırmızı 1).
- **Yeniden üretim:** ÖNCE ve SONRA aynı `BODY` ile, `web/js/engine.js engineSpec`
  üzerinden — ürünün kullandığı çeviricinin ta kendisi, kopya yok.

Örnek ("yakayı değiştir"), `docs/edit/`:

```
node engine/tools/spec-diff.mjs docs/edit/base-eu38-dress.json \
     docs/edit/diff-yakayi-degistir.json --png docs/edit
```
```
aşama: tamam · bölge: neckZone
ÖNCE  6 panel: Bodice Front | Bodice Back | Bias binding (neckline) | Skirt Front | Skirt Back | Sleeve
SONRA 8 panel: Bodice Front | Bodice Back | Front Neck Facing | Back Neck Facing | Skirt Front | Skirt Back | Sleeve | Peter Pan Collar (bebe yaka)
değişen panel (5): Bodice Front | Front Neck Facing | Back Neck Facing | Peter Pan Collar | Bias binding (neckline)
bölge dışı bayt-aynı tutulan panel (3): Skirt Back | Skirt Front | Sleeve
LOKALLİK İHLALİ: 0
```
ÖNCE/SONRA görseli: `docs/edit/once.png` · `docs/edit/sonra.png`
(turuncu = düzenlemenin dokunduğu panel, gri = bayt-aynı kalan).

---

## 4. KAPI — `edit_locality_check` (ctest'e bağlandı)

`engine/tests/edit_locality_check.mjs`, kanun `contract/edit-locality-v1.json`.
Bölge ilanı motorun çıktısından türetilmedi: `composition.json`'un yayınlanmış
`conflictClass` alanı birebir taşındı, temel alanların bölgesi giysi anatomisinden
yazıldı ve gerekçesi dosyanın içinde (ORTAK.md md.3).

**12 düzenleme fiili, 12'si de YEŞİL** (Damla'nın saydığı fiiller: yakayı değiştir,
fiyonk ekle, uzat, kısalt + 8 komşu):

```
OK  yakayı değiştir (bebe yaka) [neckZone]      bölge dışı 3 panel bayt-aynı: Skirt Back, Skirt Front, Sleeve
OK  uzat (etek maxi)            [hemZone]       bölge dışı 4 panel bayt-aynı: Bias binding, Bodice Back, Bodice Front, Sleeve
OK  kısalt (kol kısa)           [sleeveZone]    bölge dışı 4 panel bayt-aynı: Bodice Back, Bodice Front, Skirt Back, Skirt Front
OK  fiyonk ekle (ön yaka)       [cf+back+waist] bölge dışı 1 panel bayt-aynı: Sleeve
... (manşet, cep, peplum, sırtı aç, düğme sırası, etek ucuna volan, korse bağcık, V yaka)
```

**Üç anti-hack mandalı** (kapı boş yeşil veremesin):
- **A1** aynı DIFF "tüm spec'i yeniden yaz" kipinde uygulanınca kapı KIRMIZI
  düşmek zorunda. Ölçüldü: **12 vakanın 10'unda ihlal yakalandı**; yakalanmazsa
  test FAIL eder. (Yakalanmayan tek vaka `neckline`: yeniden yazma o vakada
  bölge dışı hiçbir paneli oynatmıyor — dişsizlik değil, o vakanın gerçeği.)
- **A2** her vakada bölge dışı yargılanan panel sayısı > 0 olmalı; 0 ise lokallik
  boşlukta ölçülmüş demektir → FAIL.
- **A3** hiçbir vaka SESSİZ NO-OP olamaz; kalıp kımıldamıyorsa "dokunulmayan panel
  aynı" bedava geçer, bu kapıyı yeşil tutmanın en ucuz yolu → FAIL.

---

## 5. KIRMIZILAR (kök sebep + denenen + ölçülen + sonraki aday)

**K1 — `draftJSON` string enum'ları SESSİZCE yutuyor.**
Ölçüm: 16 uzantı alanı (`collarType`, `cuffStyle`, `peplum`, `pocketStyle`,
`tieClosure`, `laceUpBack`, `backOpening`, `hemFlounce`, `exposedZip`,
`backDetail`, `yoke`, `boxPleat`, `sleeveCap`, `placketStyle`, `buttonRow`,
`gatherType`) WASM sınırına **string** verilince **16/16 NO-OP** — hata yok,
issue yok, kalıp bayt bayt aynı. Aynı 16 alan `intValue` ile int verilince
**16/16 CHANGED**. Kök sebep: sınır bu alanlarda int-enum bekliyor;
`web/js/engine.js:intValue` bilinmeyen STRING'de `throw` eder ama sınırın kendisi
tip uyuşmazlığında 0'a düşüyor. Yani engine.js'i atlayan her çağıran (backend,
test, üçüncü araç) sessizce varsayılan giysi çizer.
Denenen hamle: `runEdit`'e ÖLÇÜLMÜŞ no-op reddi eklendi — hattın içinden geçen
her düzenleme artık bu tuzağa düşerse `SESSİZ NO-OP` diye ADIYLA reddediliyor
(ölçüldü, ateşliyor). **Bu bir yama, kök çözüm değil.**
Sonraki aday: `wasm/bindings.cpp`'de bu alanlar için tip denetimi — sayı
olmayan değerde **named error** döndür, 0'a düşme. Kapısı: `api_wire_check.mjs`'e
"string ver → hata bekle" vakası.

**K2 — Peter Pan yakanın boyun kenarı DÜMDÜZ.**
`engine/src/collar.cpp:126-133` bunu ilan ediyor: *"we draft the seam
straight-to-length and shape the free OUTER edge"*. Uzunluk trued (0.00mm), ama
gerçek yatık yaka boyun kenarı, çakıştırılmış omuzlardan izlenen bir EĞRİDİR;
düz çizilirse yaka yatmaz, dikilince kalkar. `docs/edit/sonra.png`'de gözle de
görünüyor: yaka bir dikdörtgen şeridi.
Ölçülen: uzunluk doğru, şekil yanlış — bu yüzden hiçbir mevcut kapı görmüyor
(`collar_check` uzunluk truing'ine bakıyor).
Sonraki aday: `flatCollar`'ın boyun kenarını ön+arka omuz çakıştırma (overlap
1.3–2.0cm, Aldrich yatık yaka) ile eğri üret; kapı = boyun kenarı yay uzunluğu
neckline'a eşit KALIRKEN kirişten sapması (sagitta) > 0 olmalı. **Sayı
uydurulmadı, `knowledge/drafting-math-eu38.md`'den doğrulanacak.**

**K3 — serbest kanalın %100'ü sicilde yok (26/26).**
Kök sebep tek satır: `contract/terms.json` eşleşmesi TAM METİN (canonical +
synonyms), vision ise cümle üretiyor ("contrast piping along collar and
neckline"). Bu bir DAR SÖZLÜK sorunu değil, **bağlanmamış kanal** sorunu.
Sonraki aday: sicil eşleşmesini terim-içerme (kategori başına anahtar kelime
kümesi) hâline getir ve `benchmark-58`'in UNMAPPED sayacını aynı kurala bağla;
ölçüm F-I'nin bankalı korpusunda tekrarlanır. **YAPILMADI.**

---

## 6. YAPILMADI / GÖREMEDİM (açık ilan)

- **19 fotonun 14'ü ölçülmedi** — worker günlük kotası. Araç hazır ve bankalı.
- `vision-student/` hiç koşturulmadı (öğrenci modelin bugünkü doğruluğu ÖLÇÜLMEDİ).
- Editleme hattı **doğal dil → DIFF** adımını İÇERMİYOR, kasten: o adım modelin
  işi, ve onu buraya koymak wrapper olurdu. Bu dosyanın sattığı şey, DIFF'in
  deterministik olarak yürütülmesi + lokallik kapısı.
- Lokallik kapısı **tek gövde/tek bedende** koşuyor. Bedenler arası (grade)
  lokallik ölçülmedi.
- `contract/primitives-v1.json` ve `vocab-resolution-v1.json` OKUNDU, yazılmadı.

---

## 7. CTEST — tam koşu (2404 sn, 23 Ağu)

`ctest --test-dir engine/build --output-on-failure` → **80% geçti, 101 testin 20'si
kırmızı** (+1 devre dışı: `h10_gate_check`, başka bir fazın ilan edilmiş kararı).

**Bu koşu benim yamamdan ÖNCE başladı ve ağaç o sırada üç-dört ajan tarafından
yazılıyordu** (`engine/src/{bodice,garment,geometry,dxf,recipe}.cpp`,
`wasm/bindings.cpp` hepsi aynı anda değişik). Yani bu 20 sayı F-I'ye ait değil;
attribution ayrı ayrı yapıldı:

- **Bana ait olan TEK kırmızı: `photo_ratio_wire_check`** — `spec.seen` bloğunu
  taşıyınca kapının `create.js` üzerindeki grep'i düştü. **Gevşetilmedi**: tanık
  (`ratiosMeasured: seen.ratiosMeasured === true`) ürün yolunda birebir aynı
  ifadeyle geri yazıldı, test dosyasına DOKUNULMADI. Yamadan sonra ölçüldü: Passed.
- **İlan edilmiş, kapatılmaya ÇALIŞILMAYAN üçlü** (ORTAK.md): `style_check`,
  `sizechart_source_check`, `contract_check` (`patterns_real/`, Damla'nın 17 Ağu kararı).
- **`bundle_fresh_check`**: `web/vendor` + `backend/engine` WASM'ı C++ HEAD'inden
  1 commit eski. Benim değişikliğim değil, ama **beni ilgilendirir**: bu dosyanın
  bütün ölçümleri `engine/dist/stitchu-engine.js` üstünden koştu, yani bugünkü
  C++ kaynağının değil, sevk edilen ikilinin davranışı ölçüldü. İLAN EDİLİYOR.
- Kalan 15'i (`engine_check`, `golden_check`, `cup_check`, `halter_check`,
  `sloper_check`, `grade_check`, `sewable_census`, `recipe_dress_check`,
  `dxf_*`, `compose_check`, `preview_truth_check`, `figure_check`,
  `garment_armhole_check`) C++/üreteç hattında; hiçbiri `web/js`'i okumuyor
  (ölçüldü: `grep -rl web/js engine/tests engine/tools`). Uçuş hâlindeki
  diğer fazların işi.

Yamadan sonra ayrı ayrı yeşil doğrulanan beşli:
`edit_locality_check` · `photo_ratio_wire_check` · `api_wire_check` ·
`bridge_guard` · `collar_bridge_check` · `compile_dialect_check`.
