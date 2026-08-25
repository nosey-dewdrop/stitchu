# V7-F — SİCİL↔ARTEFAKT ÇELİŞKİSİ: `sleeve` ABSENT AMA MOTOR KOL BASIYOR

**KARAR: (B) — sicil doğrudur, artefakt başka bir motordur.**
Motorun bastığı kol, sicilin tanımladığı `sleeve` operatörü DEĞİLDİR. Statü
DEĞİŞMEDİ (`absent` kaldı); çelişki sicile **ŞERH** olarak yazıldı.

---

## 1. ÖLÇ — `blockedBy=shoulderSeam` gerekçesi BUGÜN geçerli mi?

**Geçerli. Bayat değil.**

`shoulderSeam` sicildeki durumu (`contract/garment-spec-v2.json:96`, V7-F sonrası satır numarası):
`status=flagged`, `binds=SheathOptions::shoulderSeam (default false), ...`

Motorun kendi varsayılanı ölçüldü:

```
$ grep -n "shoulderSeam\|shoulderCrestBandMM\|shoulderSeamForwardMM" engine/src/surfacepattern.hpp
521:    bool shoulderSeam = false;
525:    double shoulderSeamForwardMM = 0.0;
534:    // MEASURED BOTH WAYS — see the shoulderSeam note above for the table and
536:    double shoulderCrestBandMM = 60.0;
```

`_statuses.flagged` yasası: *"A spec requiring it is REFUSED — an unshippable
capability is not a capability."* Yani yüzey hattında omuz dikişi bugün de
KAPALI, `sleeve`'in engeli de duruyor. Gerekçe geçerli.

### Sevk edilen motor kolu omuz dikişi OLMADAN mı çiziyor? HAYIR.

Kolu basan hat ESKİ 2B motordur ve **kendi omuz dikişi vardır** — ayrı bir
çeviri birimi (`engine/src/shoulder.cpp` / `shoulder.hpp`) ve gövde bloğunda
omuz tepesine **teğet süreklilikle** bağlanan oyuk eğrisi:

```
$ grep -n "shoulder" engine/src/bodice.cpp | head
bodice.cpp:10:#include "shoulder.hpp"
bodice.cpp:158: ... The curve leaves the shoulder tip TANGENT-CONTINUOUS
bodice.cpp:159: with the shoulder seam (no angular V-kink at the shoulder point ...
bodice.cpp:177:PathCommand armholeCurveFor(double shoulderHalf, double shoulderDrop, ...

$ grep -n "^[A-Za-z].*(" engine/src/shoulder.hpp
54:void applyDropped(double& shoulderHalf, double& armholeY, ...
65:bool applyRaglan(DraftedPattern& pattern, double armholeDepth, double shoulderMM);
```

Yani "sevk edilen motor omuz dikişi olmadan kol çiziyor" cümlesi **YANLIŞ**:
o motorun omuz dikişi var, sadece o dikiş sicilin `shoulderSeam` operatörü
değil — sicildeki operatör `SheathOptions::shoulderSeam`'dir, o motorda ise
`SheathOptions` hiç yoktur (§2).

---

## 2. KARAR VER, KANITLA — (B)

### 2.1 Bu sicilin evreni yalnız `surfacepattern.hpp`'dir

`_statuses.shipped` kendi tanımını veriyor (`garment-spec-v2.json:15`):
*"...Binding is a real symbol in engine/src/surfacepattern.hpp."*
Ve sicildeki her bağ gerçekten oraya bağlı:

```
$ python3 -c "...operators'ın binds alanlarını say..."
Counter({('shipped','SheathOptions::'): 9, ('absent','null'): 5, ('flagged','SheathOptions::'): 1})
total operators: 15
```

10 bağın **10'u** `SheathOptions::`. Başka bir yere bağlanan **0** operatör var.

### 2.2 Kolu basan kod bu evrenin İÇİNDE DEĞİL

```
$ grep -c "SheathOptions" engine/src/sleeve.cpp engine/src/garment.cpp
engine/src/sleeve.cpp:0
engine/src/garment.cpp:0
```

`garment.cpp:303` ve `garment.cpp:621`'deki çağrı, v1 `GarmentSpec`'in
alanlarını okuyor — sicilin hiçbir alanını değil:

```
engine/src/garment.cpp:303
    const std::vector<PatternPiece> sleeves = SleeveBlock::draft(
        m, halter ? SleeveStyle::None : spec.sleeveStyle, spec.sleeveLength,
        bodice.armholeLength, bodice.armholeDepth, spec.fabric, spec.sleeveCap);

$ grep -rn "SleeveStyle sleeveStyle\|SleeveLength sleeveLength\|SleeveCap sleeveCap" engine/src/*.hpp
engine/src/measurements.hpp:290:    SleeveStyle sleeveStyle = SleeveStyle::None;
engine/src/measurements.hpp:291:    SleeveLength sleeveLength = SleeveLength::Short;
engine/src/measurements.hpp:294:    SleeveCap sleeveCap = SleeveCap::Plain;
```

`sleeve.cpp:51` ilk satırında `if (style == SleeveStyle::None) return {};` —
yani **varsayılan spec'te bu motor da kolsuzdur**; kol ancak alıcı isterse çıkar.

Sonuç: (A) yolu sicilin KENDİ yasasıyla imkânsız. `binds` alanı
`surfacepattern.hpp`'de gerçek bir sembol olmak zorunda (`specv2-check.mjs:62-83`
`declares()` latch'i bunu koşuyor); `SleeveBlock::draft`'ın okuduğu hiçbir alan
`struct SheathOptions` içinde değil. Uydurulmadan yazılabilecek tek `binds`
yoktur. **(B) seçildi.**

### 2.3 ŞERHİN ASIL İÇERİĞİ — 'shipped' kelimesi artefaktta karşılıksız

Çelişki kartın anlattığından daha derin. `_statuses.shipped` "the DEFAULT path
the buyer receives today" diyor ve o yolu surface-pattern olarak adlandırıyor.
**Alıcının indirdiği paketin içinde surface-pattern YOK:**

```
$ grep -c "surfacepattern" engine/build-wasm.sh
0
```

`build-wasm.sh:72` (web hedefi) ve `:111` (Cloudflare Worker hedefi) 35 çeviri
birimi derliyor; listede `src/sleeve.cpp` ve `src/garment.cpp` **var**,
`src/surfacepattern.cpp` **yok**.

Takipli artefaktın kendisinde ham dizgi sayımı (`backend/engine/stitchu-worker.wasm`,
1042915 bayt, `git ls-files` ile takipli):

```
sleeveStyle -> 5      SheathOptions  -> 0
sleeveCap   -> 3      surfacepattern -> 0
sleeveLength-> 1      shoulderSeam   -> 0
Sleeve      -> 16     crest          -> 0
```

Ve yüzey hattının repo içindeki tüm tüketicileri test/araç:

```
$ grep -rln "surfacepattern.hpp\|SurfacePattern\|SheathOptions" engine/src engine/wasm engine/tools engine/tests web backend
engine/src/shellprojection.{cpp,hpp} · engine/src/surfacepattern.{cpp,hpp}
engine/tests/{capability_check,h10_gate_check_LEGACY,surface_pattern_check,wearable_check}.cpp
engine/tools/{arapconv-probe,shell-flat,specv2-check.mjs,surface-pattern,waistfold-probe}
```

`web/`, `backend/` ve `engine/wasm/` altında **SIFIR** dosya. Buna karşılık alıcı
bugün kol SİPARİŞ EDEBİLİYOR (`web/js/create.js:42` none/straight/balloon;
`:47` kol başı plain/gathered/puffed/cap).

**Hüküm:** iki cümle aynı anda doğru — (a) yüzey hattında `sleeve` operatörü YOK;
(b) alıcının indirdiği motor kol çiziyor. Bu bir yalan değil **kapsam kaymasıdır**:
sicil `surfacepattern.cpp`'yi anlatıyor, sevkiyat `garment.cpp`'yi yapıyor.

**KARARA BAĞLANMAYAN (bilerek):** ürünün gerçeği hangi motor? Bu bir Damla
kararıdır; V7-F ölçtü, seçmedi. Aynı çelişki `GECE/V0-0B.md` yan bulgu 2'de de
duruyor ("iki kapı aynı şeyi ölçmüyor").

### 2.4 Sicile yazılan

`contract/garment-spec-v2.json`, iki yer, **hiçbir status değişmedi**:
1. yeni top-level `_serh` bloğu (`_statuses`'un hemen altında) — 2.3'ün ölçümleri
   ve hükmü, `V7-F-2026-08-24` anahtarıyla.
2. `operators.sleeve` içine iki alan: `blockedByStillValid` (§1) ve `serh` (§2.1-2.2).

---

## 3. SİCİLİN BEKÇİSİ

Kartın saydığı üç kapı koşuldu; çıktı `GECE/log/V7-F.gate.txt`.

```
$ ctest --test-dir engine/build -R 'contract_check|vocab_source_check|vocab_reference_check' --output-on-failure
1/3 Test #91: contract_check ..... ***Failed  (MİRAS KIRMIZI, değişmedi)
2/3 Test #113: vocab_source_check ..... Passed
3/3 Test #114: vocab_reference_check ..... Passed
67% tests passed, 1 tests failed out of 3
```

`contract_check`'in TEK FAIL satırı değişikliğimden ÖNCE de SONRA da aynı:
`patterns_real/` altında 41 takipli telifli dosya (ilan edilmiş Damla kararı,
kapı bilerek kırmızı). **Daha kötüleşmedi; yeni kırmızı ad doğmadı.**

⚠ **Bulgu: bu üç kapıdan hiçbiri `garment-spec-v2.json`'u yargılamıyor.**
`contract_check` v1 tarafını okuyor (`tables.json`, `garment-spec.schema.json`,
`terms.json`, `vocab.json`, `styles.json`). Sicilin gerçek bekçisi
**`specv2_check`** (`engine/tools/specv2-check.mjs`, ctest #92) — o yüzden onu da
koştum ve log'a ayrı bölüm olarak yazdım:

```
$ ctest --test-dir engine/build -R '^specv2_check$' --output-on-failure
1/1 Test #92: specv2_check ..... Passed
$ node engine/tools/gen-spec-v2.mjs --check
ok: garment-spec-v2.schema.json in sync with contract/garment-spec-v2.json
```

Üretilmiş şema **kaymadı** (`buildSchema()` yalnız `topology` + `quantities`
okuyor, `specv2.mjs:43-53`), `absent` operatörün `binds`'ı hâlâ null, fixture 3
beş operatörü adıyla reddetmeye devam ediyor.

---

## 4. İFADE ETKİSİ

**Kartın aradığı alet REPODA YOK.** `GECE/V0-0B.md`'nin §5'teki 36.8% ölçümü
committed bir araçtan gelmiyor:

```
$ grep -rln "expressibleToday|all needed operators shipped|operators shipped" engine/tools vision backend web scripts
engine/tools/gen-spec-v1v2-map.mjs        # sadece v1<->v2 tablosunu üretir, foto koşmaz
$ grep -rn "needs operator" GECE/log/ engine/tools/ vision/
GECE/log/V0-0B.eval.txt:123:  needs operator "sleeve" (status=absent): 34
```

Tek iz **log metninin kendisi**; ölçümü basan betik o oturumda tek seferlik
yazılmış ve commitlenmemiş. Yani **36.8% BUGÜN YENİDEN ÜRETİLEMİYOR.**

Uydurma sayı yerine, sicilin kendi iki committed dosyasından (`spec-v1-v2-map.json`
+ `garment-spec-v2.json`) aynı 68 fotoluk okumaya (`vision/eval/live-baseline-oldprompt.json`)
eşdeğer bir ölçüm koşuldu — **ÖNCE = HEAD'deki sicil, SONRA = değiştirilmiş sicil**:

```
### ONCE (git show HEAD:contract/garment-spec-v2.json)
   garment NO_VALUE:other 5
   skirtStyle NO_VALUE:halfCircle 5
   needs operator "sleeve" (status=absent) 35
   needs operator "skirtFamily" (status=absent) 20
   needs operator "gatheredOverlayLayer" (status=absent) 7
   expressible AND all needed operators shipped: 15/68 = 22.1%

### SONRA (calisma agaci)
   ... aynı satırlar ...
   expressible AND all needed operators shipped: 15/68 = 22.1%
```

**Kımıldamadı — 15/68 → 15/68, fark 0.** Beklenen sonuç: (B) hiçbir statüyü
değiştirmez, bir şerh ifade edilebilirliği artırmaz. Kol tek başına 68 okumanın
**35'ini** düşürmeye devam ediyor.

⚠ Bu 22.1%, V0-0B'nin 36.8%'i DEĞİLDİR ve onun yerine geçmez: benim ölçüm
`skirtFamily` ve `gatheredOverlayLayer` eksikliklerini de sayıyor, V0-0B'nin
log'u yalnız `sleeve`'i sayıp `garment`/`skirtStyle` enum düşüşlerini ayrı
raporlamış (onun sleeve sayısı 34, benimki 35 — aradaki 1 fotonun sebebi
**DOĞRULANMADI**). İki sayı kıyaslanamaz; kıyaslanabilir olan, aynı aletin
ÖNCE/SONRA'sıdır ve o fark 0.

---
## 5. SİCİLDEN İŞARETÇİYE İNDİRİLEN TAM METİN (V7-G, 25.08)

V7-G, bu şerhin `contract/garment-spec-v2.json` içindeki uzun kanıt düz yazısını
işaretçiye indirdi: `vocab_reference_check` ratchet'i o düz yazıdaki kapalı-enum
kelimelerini (`garment` +3, `sleeveCap` +1) YENİ referans sayıp kırmızıya düştü, ve
sözlük bu gece hiçbir eksen/değer KAZANMADIĞI için taban yeniden kesilemezdi.
Aşağıdakiler sicilden çıkarılan dizgilerin **kelimesi kelimesine** kopyalarıdır —
bu bir gizleme değil, yer değiştirmedir. Hiçbir cümle yok olmadı.

### 5.1 `_serh.V7-F-2026-08-24` — çıkarılan alanlar

`başlık` (çıkarıldı):

```
'shipped' kelimesi BU SİCİLDE yüzey hattını anlatır; alıcının indirdiği artefakt ESKİ 2B motordur
```

`ölçüm` (tamamı çıkarıldı, 5 madde):

```
engine/build-wasm.sh:72 (web hedefi) ve :111 (Cloudflare Worker hedefi) 35 çeviri birimi derliyor; `grep -c surfacepattern engine/build-wasm.sh` = 0. Yani sevk edilen paketin İÇİNDE surfacepattern.cpp YOK.
Aynı iki satırda src/sleeve.cpp ve src/garment.cpp VAR.
Takipli artefakt backend/engine/stitchu-worker.wasm (1042915 bayt) içinde ham dizgi sayımı: 'sleeveStyle' 5 · 'sleeveCap' 3 · 'sleeveLength' 1 · 'Sleeve' 16 — ve 'SheathOptions' 0 · 'surfacepattern' 0 · 'shoulderSeam' 0.
web/, backend/ ve engine/wasm/ altında surfacepattern.hpp / SurfacePattern / SheathOptions'a değen SIFIR dosya var; yüzey hattının tüm tüketicileri engine/tests/ ve engine/tools/ altında.
Alıcı bugün web/js/create.js:42'de kol SİPARİŞ EDEBİLİYOR (none/straight/balloon) ve :47'de kol başı seçebiliyor (plain/gathered/puffed/cap).
```

`hüküm` — sicilde KISALTILARAK kaldı; çıkarılan kuyruğuyla birlikte tam hâli:

```
İki cümle de aynı anda doğru: (a) yüzey hattında `sleeve` operatörü YOK (absent, doğru); (b) alıcının indirdiği motor kol çiziyor. Çelişki bir yalan değil, KAPSAM kaymasıdır: bu sicil surfacepattern.cpp'yi anlatıyor, sevkiyat garment.cpp'yi yapıyor.
```

`KARARA BAĞLANMAMIŞ` — sicilde kısaldı; çıkarılan kuyruğuyla birlikte tam hâli:

```
Ürünün gerçeği hangi motor? Bu bir Damla kararıdır; V7-F ölçtü, seçmedi. Aynı çelişki GECE/V0-0B.md yan bulgu 2'de de duruyor ('iki kapı aynı şeyi ölçmüyor').
```

### 5.2 `operators.sleeve` — çıkarılan alanlar

`blockedByStillValid` (kısaltıldı) tam hâli:

```
V7-F (24.08) ÖLÇÜLDÜ, GEÇERLİ: shoulderSeam hâlâ `flagged` ve motorun kendi varsayılanı KAPALI — engine/src/surfacepattern.hpp:521 `bool shoulderSeam = false;`. _statuses'a göre flagged bir operatörü isteyen spec REDDEDİLİR, dolayısıyla kol da bugün konulamaz. Gerekçe bayat DEĞİL.
```

`serh` (kısaltıldı) tam hâli:

```
V7-F (24.08) — SİCİL↔ARTEFAKT ÇELİŞKİSİ, KARAR (B): motorun bastığı kol bu operatör DEĞİLDİR. Kanıt: (1) sicildeki 10 shipped/flagged operatörün 10'u da `SheathOptions::` sembolüne bağlı (0'ı başka bir yere), yani bu sicilin evreni yalnız engine/src/surfacepattern.hpp'dir; (2) engine/src/sleeve.cpp ve engine/src/garment.cpp içinde `SheathOptions` geçen SIFIR satır var — garment.cpp:303 ve :621'deki SleeveBlock::draft çağrıları v1 GarmentSpec'in SleeveStyle/SleeveLength/SleeveCap alanlarını okur (engine/src/measurements.hpp:290-294), bu sicilin hiçbir alanını değil; (3) o kol ESKİ 2B-formül motorunun kolu ve KENDİ omuz dikişi vardır (engine/src/shoulder.cpp, bodice.cpp:158-190 omuz tepesine teğet oyuk eğrisi) — yani sicilin `blockedBy=shoulderSeam` gerekçesini ihlal etmiyor, çünkü o gerekçe yüzey hattının omuz dikişi hakkındadır. Ayrıntılı ölçüm: GECE/V7-F.md. Bu satır bir status DEĞİŞTİRMEZ: `sleeve` yüzey hattında absent olmaya devam eder.
```

### 5.3 Sicilde MUTLAKA kalanlar (kart §NE)

1. `sleeve` statüsü DEĞİŞMİYOR (`absent`) — V7-F kararı (B).
2. Çelişkinin ADI: sicil bir motoru, sevkiyat başka bir motoru anlatıyor — yalan değil KAPSAM kayması.
3. Kanıtın yolu: `GECE/V7-F.md`.
4. `_statuses.shipped` metninin bugün fiilen yanlış olduğu şerhi (tek cümle, dosya adı yok).
