# V2-C — SEVK EDİLEN HATTIN İKİ ÖLÇÜLMÜŞ KUSURU (2/2)

Koşu: 2026-08-24. Kart: `GECE/KART/V2-C-sevk-hatti-durustlugu.md`. Etiket SIRALI (2/2).
**NaN'ın kökü `engine/src/bodice.cpp`'de çıktı** (kartın istediği ilk satır bu):
`neckFacings`/`makeFacing` içindeki omuz vektörü normalizasyonu, `shoulderLen == 0`
olduğunda `0/0` üretiyordu. İkinci ve asıl kök `engine/wasm/bindings.cpp`'de:
o sıfırı sınır kendisi uyduruyordu.

İki kusur da KAPANDI. Kapı `wasm_spec_honesty_check` ctest'e bağlandı.

---

## 1. KUSUR (1) — SESSİZ İKAME, 26 INT EKSENİ

**Kök:** `engine/wasm/bindings.cpp:94` (eski) `intField()` → `v.as<int>()`.
Kırpma JS→C++ dönüşümünün İÇİNDE oluyordu, yani `parseEnumInt` gerçek değeri
hiç görmüyordu. `bindings.cpp:82` yorumu tam tersini iddia ediyordu.

**Onarım:** değer artık `double` olarak okunuyor; tam sayı olmayan / sonlu
olmayan / int aralığı dışında olan değer, string eksenlerin zaten kullandığı
`specparse.hpp vocabError` sözleriyle **ADIYLA** reddediliyor:

```
invalid sleeveCap '1.5' (valid: plain, gathered, puffed, ...)
```

Yokluk (undefined/null) hata DEĞİL — varsayılan kalıyor, kartın dediği gibi.
26 eksenin 26'sı tek `enumIntField()` okuyucusundan geçiyor (mekanik rewire,
26 çağrı). Ayrıca **`ruffleTiers`** (eksen değil, sayı alanı) aynı kırpmadan
geçiyordu; o da `intField()`'in yeni sıkı hâline bağlandı — 1.5 sıra bir
yuvarlanacak değer değil, YANLIŞ değerdir.

**ÖLÇÜM (sevk edilen bayt üstünde, kapının kendi çıktısı):**
`GECE/log/V2-C.bostest.txt` (faz öncesi bayt) → `tieClosure/sleeveCap/collarType/…`
her birinde `1.5 ile 1 BAYT AYNI JSON`. `GECE/log/V2-C.gate.after.txt` → 0 fail.

## 2. KUSUR (2) — `collarType` NaN: KÖK, İDDİA EDİLENDEN BAŞKA ÇIKTI

Kart "collarType 1..6 NaN basıyor" diyordu. **Ölçüldü: collarType'ın kusuru
DEĞİL.** V0-0D'nin ölçüm betiği (`/tmp/v00d/collar.mjs:4`) gövdeyi
`{bustCM:88, waistCM:70, …}` diye veriyor; `bindings.cpp` gövde alanlarını
`bust/waist/hip/shoulder/backLength/armLength/neck` diye okuyor. Yani o koşuda
**gövdenin 7 alanının 7'si de 0'dı.** Gerçek bir gövdeyle collarType 1..6 faz
ÖNCESİ bile temizdi:

```
$ node /tmp/v2c/probe2.mjs        # faz öncesi bayt, iki gövdeyle
zero-body collarType=1..6  nan=8  PARSE-FAIL
real-body collarType=0..6  nan=0  validJSON   <-- collarType'ın kendisi temiz
```

**Zincir (üç halka, üçü de ölçüldü):**

1. `bindings.cpp numField()` yok olan anahtarı **0** yapıyordu. Eksik ölçü,
   sıfır ölçü DEĞİLDİR — bu, kusur (1) ile aynı sınıf sessiz ikame.
2. `engine/src/bodice.cpp`, `makeFacing()`: `sx / shoulderLen`, `shoulderLen==0`
   iken `0/0 = NaN`. Aynı fonksiyonun 15 satır yukarısındaki köşe normalleri
   `len < 1e-6` mandalını ZATEN taşıyor; omuz vektöründe unutulmuş.
3. `bindings.cpp num()` `%.4f` ile NaN'ı çıplak `nan` token'ı olarak basıyordu.
   Bu JSON değil → tarayıcıda `JSON.parse` fırlatıyor. **Doğrulayıcı sorunu
   ZATEN yakalamıştı** (`issues` içinde `[finite] Front Neck Facing: non-finite
   coordinate`), ama yazıcı o dürüst hükmü okunamaz hâle getiriyordu.

**Onarım (üçü de kökten, hiçbiri süpürme değil):**
- (a) `bodyFrom()` artık her ölçüyü ADIYLA reddediyor — sözleri motorun kendi
  reçete yorumlayıcısının sözleriyle aynı (`recipe.cpp:938`, tek fault tek dil):
  `invalid body: measurement 'waist' is missing or non-positive (0) - …`.
  `upperBust` isteğe bağlı kalıyor (0 = beyan edilmedi).
- (b) `bodice.cpp` omuz normalizasyonuna eksik mandal kondu (dejenere omuzda
  facing boyun noktasında biter). NaN kırpılmıyor — `0/0` aritmetik hatası
  düzeltiliyor.
- (c) `num()` sonlu olmayan sayıyı **basmayı reddedip fırlatıyor**; sınırın
  catch'i onu `{"error": …}`'e çeviriyor, yani JSON.parse edilebilir bir
  reddedişe. Gizleme değil, GÜRÜLTÜLÜ başarısızlık. `gradeJSON`,
  `draftRecipeJSON`, `dxfRecipeJSON` bu yüzden tam gövdeli try/catch'e alındı
  (yoksa reddediş sarılmamış bir C++ throw olarak JS'e sızıyordu — ölçüldü:
  ilk tam ctest'te 4 yeni kırmızı, `CppException`).

`contract/vocab-resolution-v1.json`'ın `collarType` için yazdığı 6 `resolved`
**yalan değilmiş**: gerçek gövdede altısı da çiziyor. Yalan olan, V0-0D'nin
ölçüm gövdesiydi.

---

## 3. ZORUNLU KANIT

| # | kanıt | komut | sonuç | log |
|---|---|---|---|---|
| 1 | WASM paritesi | `./engine/build-wasm.sh` | **exit=0** | `GECE/log/V2-C.build-wasm.txt` |
| 2 | BOŞ TEST (faz öncesi bayta karşı) | `node engine/tests/wasm_spec_honesty_check.mjs /tmp/v2c/stitchu-engine.PRE.js` | **exit=1, 165 geçti / 145 KIRMIZI** | `GECE/log/V2-C.bostest.txt` |
| 2b | kapı, onarımdan sonra | `node engine/tests/wasm_spec_honesty_check.mjs` | **exit=0, 310 yargı, 0 fail** | `GECE/log/V2-C.gate.after.txt` |
| 3 | mutasyon ×3 | aşağıdaki tablo | 3 kırmızı, geri alınca yeşil | `GECE/log/V2-C.mutasyon.txt` |
| 4 | taban bantları | `node engine/tools/wasm-baseline.mjs` | hepsi bandın İÇİNDE | `GECE/log/V2-C.baseline.txt` |
| 5 | ctest tam koşu | `ctest --test-dir engine/build --output-on-failure` | 104/108, kırmızı AD kümesi AYNI | `GECE/log/V2-C.ctest.{before,after}.txt` |

### 3.1 Mutasyon (4.5)

| mutant | ne bozuldu | kapı |
|---|---|---|
| M1 | `enumIntField` yeniden `v.as<int>()` ile kırpıyor | **KIRMIZI** — 135 fail |
| M2 | `bodyFrom` eksik/sıfır ölçüyü yine kabul ediyor | **KIRMIZI** — 6 fail |
| M3 | `intField` (ruffleTiers) kesirli sayıyı yine kabul ediyor | **KIRMIZI** — 4 fail |
| — | üçü de geri alındı | **YEŞİL** — 310/310 |

⚠ **M3 ilk turda SAĞ KALDI** (kapı `ruffleTiers`'a hiç bakmıyordu). Kapı
gevşetilmedi, **kapıya (a2) bölümü eklendi** ve mutant o zaman kırmızı düştü.
Bu, kapının kendi ölçülmüş kusuruydu ve raporlanıyor.

⚠ **Ratchet'lenmemiş kalan:** `num()`'un sonlu-olmayan reddi kapıyla
ratchet'lenmiş DEĞİL — o mandalı tek başına söken bir mutant kapıyı yeşil
bırakır, çünkü (b) bölümü geçerli bir gövdeyle koşuyor ve orada NaN zaten
üretilemiyor. Yani `num()` mandalı savunma katmanı, kapı değil. Geçersiz JSON
üretme yolunu kapatan ratchet, (b2)'nin gövde reddidir (M2 ile doğrulandı).

### 3.2 Taban bantları (§4.1)

```
$ node engine/tools/wasm-baseline.mjs
worst abs delta    : 1.0000e-4 mm            (tavan 1e-4)      OK
draftJSON only     : n=200  median 0.956  p95 1.073  (ms)      (tavan 1.031 / 1.338)  OK
gradeJSON EU34-48  : n=30   median 8.499             (ms)      (tavan 8.800)          OK
spec x body blocks : 561   wasm errored: 0
soak 5000 tekrar   : SURVIVED (64MB büyümez heap)
```

4.6 prosedürüne gerek olmadı: hiçbir bant aşılmadı.

### 3.3 ctest — miras kırmızı AD kümesi BÜYÜMEDİ (RULES 9)

```
$ ctest --test-dir engine/build --output-on-failure
ÖNCE : 96% tests passed, 4 tests failed out of 107
       style_check · sizechart_source_check · contract_check · figure_check
SONRA: 96% tests passed, 4 tests failed out of 108
       style_check · sizechart_source_check · contract_check · figure_check
```

Toplam 107 → 108: eklenen tek test `wasm_spec_honesty_check` (Passed, 0.25 sn).
`golden_check` **Passed** (byte-identical korundu). `recipe_wasm_parity`,
`recipe_wasm_parity_dress`, `dxf_wasm_parity`, `dxf_wasm_parity_dress`: dördü de
Passed — ara koşuda kırmızıya düşmüşlerdi (sarılmamış throw), kök sebep bulundu
ve reddedişler JSON'a alındı; **mevcut test dosyalarına dokunulmadı**, sınırın
sözleri motorun kendi sözlerine uyduruldu.

---

## 4. DOKUNULAN DOSYALAR

- `engine/wasm/bindings.cpp` — `num()` sonlu-olmayanı reddediyor; `intField()`
  sıkı; yeni `enumIntField()` + `asWritten()`; `bodyFrom()`/`bodyField()`;
  `gradeJSON`/`draftRecipeJSON`/`dxfRecipeJSON` tam gövde try/catch.
- `engine/src/bodice.cpp` — `makeFacing()` omuz normalizasyonuna `shoulderLen < 1e-6` mandalı.
- `engine/tests/wasm_spec_honesty_check.mjs` — YENİ, tek yeni kaynak dosya.
- `engine/CMakeLists.txt` — tek `add_test` satırı.
- `web/vendor/stitchu-engine.js`, `backend/engine/stitchu-worker.wasm` — `build-wasm.sh` çıktısı.

`engine/vocab.json` ve `contract/vocab-resolution-v1.json`'a dokunulmadı
(yalnız okundu). `engine/tests/` altındaki hiçbir MEVCUT test değiştirilmedi.

---

## 5. KART DIŞI FARK EDİLENLER (DOKUNULMADI)

1. ⚠ **V0-0D §5 madde 1'in teşhisi YANLIŞTI ve düzeltilmelidir.** "collarType
   1..6 sevk edilen hatta KIRIK" cümlesi, anahtar adları tutmayan bir gövde
   nesnesiyle ölçülmüş. Gerçek gövdede yaka ailesi faz öncesinde de çiziyordu.
   O dosyaya dokunmadım (kart girdisi, çıktı değil).
2. ⚠ **`web/js/engine.js:56` hâlâ `vendor/stitchu-engine.js?v=136` istiyor.**
   `build-wasm.sh` `web/vendor/`'a yeni baytı kopyaladı ama `?v` bump'ı
   yapılmadı — deploy edilirse tarayıcılarda eski motor cache'ten dönebilir.
   ENV.md'nin "`?v` bump'tan sonra `git add web/` HEPSİ" uyarısı burada geçerli.
   Deploy kart dışı olduğu için ELLENMEDİ.
3. ⚠ **`backend/engine/stitchu-worker.js` değişmedi, `.wasm` değişti.** Glue
   sabit kaldığı için bu beklenen, ama Worker'ın canlıya çıkması Damla'nın adımı
   (backend/DEPLOY.md); **worker canlı DEĞİL** sayılır.
4. ⚠ **`patterns_real/` altında 3 takipsiz yol** (`BUGRA-DEFTER.md`, `geometry/`,
   `bugra-geometry-2026-07-23.json`) bu oturum BAŞLARKEN de takipsizdi.
   Telifli, push edilmez; commit'e alınmadı, silinmedi.
5. ℹ️ `bindings.cpp`'de `numField()` hâlâ yok olan anahtarı 0 yapıyor ve
   `skirtLengthMM` / `fabricStretchPct` bunu bilerek kullanıyor (0 = "opt-in
   kapalı"). Gövde alanları o desenden çıkarıldı; iki sürekli kaçış kapısı
   desende kaldı. **Bu bir kusur değil, ama tek okuyucunun iki anlamı var.**
6. ℹ️ `sleeveCapFrom()` yardımcısı silindi (tek çağrısı kalmamıştı). Diğer
   `…From()` string yardımcıları duruyor.
