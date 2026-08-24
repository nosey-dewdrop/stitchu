# V2-A — SÖKÜM HÜKMÜ + DAMAR KALEMLERİ SİCİLE İSİM

Koşu: 2026-08-24. Kart: `GECE/KART/V2-A-sokum-hukmu.md`. Etiket PARALEL (V2-B ile).
Girdi dosyaları kartta isim isim; başka repo dosyası açılmadı.
Otorite hükmü `GECE/V2-R.md` Bölüm 3'ten alındı ve BAĞLAYICI kabul edildi:
**otorite `engine/vocab.json`**, `vocab-resolution-v1.json` onun ALT KATMANI, tek okuyucusu
`preset_resolve_check`.

Bu kart hüküm verir, **sürgün yapmaz**: hiçbir sembol yeniden adlandırılmadı, hiçbir enum
silinmedi, `_LEGACY` son eki hiçbir yere eklenmedi, `engine/` altına tek bayt yazılmadı.

---

## 0. ZORUNLU DOĞRULAMA — ÖNCE / SONRA

Komut (kartın yazdığı hâliyle):

```
cd /Users/damummyphus/damla_projects_2026/stitchu
ctest --test-dir engine/build -R preset_resolve_check --output-on-failure
```

**ÖNCE (kart başlamadan, hiçbir dosya değişmeden):**
```
Test project /Users/damummyphus/damla_projects_2026/stitchu/engine/build
    Start 105: preset_resolve_check
1/1 Test #105: preset_resolve_check .............   Passed    0.03 sec

100% tests passed, 0 tests failed out of 1

Total Test time (real) =   0.03 sec
```

**SONRA (üç çıktı dosyası da yazıldıktan sonra):**
```
Test project /Users/damummyphus/damla_projects_2026/stitchu/engine/build
    Start 105: preset_resolve_check
1/1 Test #105: preset_resolve_check .............   Passed    0.03 sec

100% tests passed, 0 tests failed out of 1

Total Test time (real) =   0.03 sec
```

Kapı YEŞİL kaldı. `preset_resolve_check.cpp`'ye dokunulmadı (`git status` içinde yok).

⚠ Yan koşu, kart girdisi değil ama contract/ dosyası değiştiği için koşuldu:
`ctest -R "specv2_check|contract_check"` → **`contract_check` KIRMIZI**. Sebebi bu kart
DEĞİL, devralınan kırmızı (`GECE/V0-0A.md` §2.5): mesaj
`FAIL: DECLARED DECISION (not a breach) — 'patterns_real/' has 41 TRACKED file(s) in git`.
Sözlük/çözüm tablosuyla ilgisi yok, kırmızı SET büyümedi (RULES 9).

---

## 1. SÖKÜM HÜKMÜ TABLOSU (§6/V2 madde a)

Statü ikili: **BAĞLANDI** (çözüm tablosuna, girdisi yazılı) · **_LEGACY-ADAYI**.
`BAĞLANDI` iki katmana olabilir ve ikisi de TEK statüdür — üçüncü statü yoktur:
- **BAĞLANDI (K3)** = dosyanın menü dili `engine/vocab.json` ekseni; her değeri
  `contract/vocab-resolution-v1.json` `resolutions`'ta bir girdi.
- **BAĞLANDI (K1)** = dosyanın `enum class`'ı giysi menüsü DEĞİL, Katman 1
  primitifi / çözücü içi etiket. `GECE/V0-0D.md` §3 son paragrafı bunları zaten
  "sözlük dışı `enum class`'lar, V2 sökümünde ayrı tutulmalı" diye ayırıyor.

### 1a. MENÜ dili — `V0-0D` §1a'nın 6 dosyası

| # | dosya | dil | HÜKÜM | girdi / gerekçe |
|---|---|---|---|---|
| 1 | `engine/vocab.json` | MENÜ | **BAĞLANDI (K3)** | Sökümün kaynağı değil, HEDEFİ: 37 eksen / 132 değer, 132'sinin 132'si `resolutions`'ta. Bijection'ı `preset_resolve_check.cpp:470-475` her koşuda doğruluyor. `GECE/V2-R.md` §3.3: OTORİTE. |
| 2 | `engine/src/vocab.gen.hpp` | MENÜ | **BAĞLANDI (K3)** | `gen-vocab.mjs`'in `engine/vocab.json`'dan yazdığı türetilmiş tablo; ilk satırı `GENERATED … DO NOT EDIT`. Kendi başına bir menü kaynağı değil. |
| 3 | `web/js/vocab.gen.js` | MENÜ | **BAĞLANDI (K3)** | Aynı üreteç, aynı kaynak; tarayıcının okuduğu bayt. |
| 4 | `engine/src/specparse.hpp` | MENÜ | **BAĞLANDI (K3)** | `parseEnum`/`parseEnumInt` menü KAPISI; tabloları `vocab.gen.hpp`'den alıyor (`specparse.hpp:5`). Kabul ettiği her isim K3'te çözülü. |
| 5 | `engine/src/gather.hpp` | MENÜ | **BAĞLANDI (K3)** | `GatherType` → `gatherType` (none sentinel + drawstring/shirred/smocked resolved) · `GatherZone` → `gatherZone` (neckline/bust/waist/sleeve, dördü de resolved). |
| 6 | `engine/src/hemflounce.hpp` | MENÜ | **BAĞLANDI (K3)** | `HemFlounce` → `hemFlounce` (none sentinel, gathered resolved). |

**_LEGACY-ADAYI: 0/6.**

### 1b. KARIŞIK — `V0-0D` §1b tablosunun adlı dosyaları

⚠ **SAYIM DÜZELTMESİ:** kart "13 adlı dosya" diyor; `GECE/V0-0D.md`'nin §1b tablosunda
**12 satır** var (satır 53-64). 13. dosya yok. Aşağıda 12'sinin hepsi hükümlü.
Tablonun altındaki run-on satırdaki 16 dosya §1c'de ayrıca hükümlendi.

| # | dosya | menü kanıtı | HÜKÜM | girdi / gerekçe |
|---|---|---|---|---|
| 1 | `engine/src/measurements.hpp` | 13 `enum class` | **BAĞLANDI (K3)** | 13 enum = 13 eksen: `neckline` `skirtStyle` `waistline` `fabric` `skirtLength` `sleeveStyle` `sleeveLength` `sleeveCap` `shoulderStyle` `garment` `topLength` `shaping` `edgeFinish`. Hepsi `resolutions`'ta. |
| 2 | `engine/wasm/bindings.cpp` | 37 `parseEnum<E>` | **BAĞLANDI (K3)** | Sevk sınırı; 37 eksenin 37'si buradan geçiyor. ⚠ `bindings.cpp:94` `v.as<int>()` 26 int-enum ekseninde ara değeri SESSİZCE kırpıyor (`V0-0D` §4a) — bu bir KUSUR, bir söküm gerekçesi değil; bu kart onarmadı. |
| 3 | `engine/src/fabricease.hpp` | `:69 enum class Girth` | **BAĞLANDI (K3)** | Menü dili `fabric.woven`/`fabric.knit` (ikisi de resolved) + sürekli kaçış kapısı `fabricStretchPct`. `Girth` bir sözlük ekseni değil, bölge etiketi (`V0-0D` §3: sözlük dışı). |
| 4 | `engine/src/cupseam.hpp` | `:69 CupSeam` | **BAĞLANDI (K3)** | `cupSeam.none` sentinel · `.horizontal` resolved · `.bugra` **absent + absentReason** ("ISIM BIR INSANA BAGLI, GEOMETRIYE DEGIL"). Üçü de isimle var → bağ tam. |
| 5 | `engine/src/pocket.hpp` | `:49 PocketStyle` · `:54 PatchCorner` | **BAĞLANDI (K3)** | `pocketStyle` 4 değer resolutions'ta. `PatchCorner` sözlük dışı (`V0-0D` §3). |
| 6 | `engine/src/collar.hpp` | `:48 CollarType` · `:53 CollarEdge` | **BAĞLANDI (K3)** | `collarType` 7 (none sentinel + 6 resolved) · `collarEdge` 3 resolved. |
| 7 | `engine/src/geometry.hpp` | `:17 enum class CmdType` | **BAĞLANDI (K1)** | `CmdType {Move,Line,Curve,Close}` giysi menüsü değil; `contract/primitives-v1.json` `edge.kind`'ın çizim karşılığı. Sökümün konusu olan dil bu dosyada yok. |
| 8 | `engine/src/hem.hpp` | `:47 HemShape` | **BAĞLANDI (K3)** | `hemShape` 5 değer, beşi de resolved. |
| 9 | `engine/src/drape.hpp` | `:45 SpringKind` | **BAĞLANDI (K1)** | `SpringKind {Structural,Shear,Bend}` Verlet çözücüsünün iç etiketi; sözlük ekseni değil (`V0-0D` §3), dosya **SEVK-DIŞI** (`build-wasm.sh`'in 35 `.cpp`'sinde yok). CLAUDE.md'nin "KAL" listesinde (flatten motorunun iç döngüsü) — _LEGACY-ADAYI yazmak duran bir kararı bozardı. |
| 10 | `web/js/create.js` | `:28` 33 picker | **BAĞLANDI (K3)** | Picker listeleri `vocab.gen.js` + `contract.gen.js`'ten besleniyor. ⚠ Bağ TAM DEĞİL: `collarType.crescent` motorda ve `vocab.json`'da var, `create.js`'te **0 hit** (`V0-0D` §5.2) — kaçak eksik bir DEĞER, fazla bir değer değil; söküm hükmünü değiştirmiyor, kuyruk işi. |
| 11 | `web/js/contract.gen.js` | `:256 "enum":` | **BAĞLANDI (K3)** | `gen-contract.mjs`'in `contract/tables.json` + `garment-spec.schema.json $defs.visionReading`'ten yazdığı türetilmiş dosya (`V2-R` §3.2). |
| 12 | `engine/src/recipe.cpp` | `:41 :209 :370 :429 :435` | **BAĞLANDI (K1)** | Beş enum'un beşi de PARSER içi (JSON token tipi, ifade düğümü, karşılaştırma, yol komutu) — sıfır giysi ekseni. `V0-0D` §3 bunları zaten sözlük dışı sayıyor. ⚠ CLAUDE.md "AT" listesinde *"recipe DSL'in 2B-first semantiği"* duruyor; o **duran bir karar**, ve gerekçesi menü-dili tekrarı değil 2B-öncelik. Bu kart onu yeniden karara bağlamadı. |

**_LEGACY-ADAYI: 0/12.**

### 1c. §1b'nin run-on satırındaki 16 dosya (aynı `.hpp` enum + `.cpp` mm deseni)

Hepsi TEK eksen taşıyor, eksenin her değeri `resolutions`'ta → **16/16 BAĞLANDI (K3)**:

| dosya | eksen | dosya | eksen |
|---|---|---|---|
| `backdetail.hpp` | `backDetail` | `openback.hpp` | `backOpening` |
| `boxpleat.hpp` | `boxPleat` | `peplum.hpp` | `peplum` |
| `buttonrow.hpp` | `buttonRow` | `placket.hpp` | `placketStyle` |
| `cuff.hpp` | `cuffStyle` | `slit.hpp` | `backSlit` |
| `exposedzip.hpp` | `exposedZip` | `strap.hpp` | `ruffledStraps` |
| `laceupback.hpp` | `laceUpBack` | `tie.hpp` | `tieClosure` |
| `locket.hpp` | `locketTop` | `wrapfront.hpp` | `wrapFront` |
| `offshoulder.hpp` | `bardotStyle` | `yoke.hpp` | `yoke` |

`locketTop.bugra` bu tabloda **absent + absentReason**; `tieClosure.backWaistBow` de
**absent + absentReason** (ENGINE-DUPLICATE, `engine/src/tie.cpp:129-130`). İkisi de
İSİMLE duruyor, o yüzden dosyaların bağı tam.

### 1d. HÜKÜM — TEK CÜMLE

**Söküm için `_LEGACY-ADAYI` YOK: 34 dosyanın 34'ü bağlandı.** Menü dili dağınık değil;
`V0-0D` §1a'nın *"sözlüğün tamamı tek bir dosyadan türüyor, V2'nin söküm noktası burasıdır"*
cümlesi ölçümle doğrulandı. Ölçüm:

```
# 6 MENU + 12 KARISIK + 16 kuyruk dosyanin isaret ettigi eksenler,
# engine/vocab.json'un 37 ekseniyle karsilastirildi
python3 -c "<V2-A eslesme sozlugu>"
# -> kapsanan eksen: 37 / vocab ekseni: 37
#    kapsanmayan: []
```

Yani bu 34 dosya **37 eksenin 37'sini** kapsıyor, fazlası yok, eksiği yok. Sökülecek
"başka bir menü" bulunmadı. Sürgün kartına düşen kalem: sıfır.

---

## 2. DAMAR KALEMLERİ SİCİLE İSİM (§6/V2 yasası)

### 2.1 KARTIN VARSAYIMI ÖLÇÜLDÜ VE DÜZELTİLDİ

Kart "11 kalemi `resolutions`'a ekle" diyor. `GECE/V0-0A.md` §3.4'ün ölçtüğü sicil
**`contract/garment-spec-v2.json`'un OPERATÖR sicilidir** (`grep -ic "<kelime>"
contract/garment-spec-v2.json`), `vocab-resolution-v1.json` değil. Bu kartta 13 kalemin
hepsi tek tek `vocab-resolution-v1.json`'da arandı:

```
python3 -c "import json;r=json.load(open('contract/vocab-resolution-v1.json'))['resolutions'];
  [print(k.ljust(30), r[k]['status']) for k in [...13 kalemin anahtarlari...]]"
```

**Sonuç: 13 kalemin 12'si BU tabloda ZATEN İSİMLE var** (`neckline.vNeck`, `neckline.boat`,
`neckline.square`, `neckline.sweetheart`, `neckline.halter`, `peplum.*`, `laceUpBack.corset`,
`buttonRow.*`, `backDetail.ruffle/flounce`, `hemFlounce.gathered`, `ruffledStraps.*`,
`cuffStyle.*`, `tieClosure.*Bow`). İsimsiz olan **tek** kalem: **dantel/fisto**.

### 2.2 KAPI ÇATIŞMASI — ve nasıl çözüldü

`preset_resolve_check.cpp:470-475` **BIJECTION** şartı koşuyor: `resolutions` anahtarları
`engine/vocab.json`'un 132 `field.value`'suyla BİREBİR olmak zorunda
(*"resolution table names a preset the vocabulary does not have"*). Yani vocab ekseni
olmayan bir damar kalemi `resolutions`'a **statüsü `absent` olsa bile** giremez — girerse
kapı kırmızı düşer. Kartın "sonrası kırmızıysa `absent`'a çevir" kaçışı bu hata sınıfını
kurtarmıyor (bijection statüye bakmıyor).

Kartın kendi hükmü üstün tutuldu — *"Kapıyı gevşetme, `preset_resolve_check.cpp`'ye
DOKUNMA"* — ve `engine/vocab.json`'a değer eklemek YASAKLAR gereği zaten kapalı.
Kalemler `vocab-resolution-v1.json`'a **`_damar_sicili` KARDEŞ bloğu** olarak yazıldı.
Blok inert: `preset_resolve_check.cpp:412` yalnız `resolutions`'ı, `foto-spec-olcum.mjs:65`
yalnız `RESOLUTION.resolutions`'ı okuyor — ikisi de bu bloğu görmüyor.

### 2.3 EKLENEN GİRDİLER (13 kalem)

| kalem | statü | `vocabKeys` (nerede İSİMLE duruyor) |
|---|---|---|
| fiyonk | named | `tieClosure.frontNeckBow` `tieClosure.frontWaistBow` `tieClosure.backWaistBow`(absent) `neckline.pussyBow` |
| minik düğme sırası | named | `buttonRow.functional` `buttonRow.decorative` `placketStyle.standard` `placketStyle.asymmetric` |
| fırfır/volan | named | `backDetail.ruffle` `backDetail.flounce` `hemFlounce.gathered` `ruffledStraps.ruffled` |
| peplum | named | `peplum.full` `peplum.half` `peplum.pointed` |
| lace-up | named | `laceUpBack.corset` |
| **dantel/fisto** | **absent** | — (kök sebep + denenen hamle + sonraki aday `absentReason`'da) |
| derin V | named | `neckline.vNeck` |
| kayık yaka | named | `neckline.boat` |
| kare yaka | named | `neckline.square` |
| sweetheart | named | `neckline.sweetheart` |
| halter | named | `neckline.halter` |
| askılı (strap) | named | `ruffledStraps.spaghetti` `ruffledStraps.wide` `ruffledStraps.ruffled` |
| büzgülü manşet | named | `cuffStyle.button` `cuffStyle.ribbed` `tieClosure.cuffTies` |

`dantelFisto.absentReason` özeti (tam metin dosyada): **kök sebep** — dantel/fisto bir
siluet ekseni değil kenar süsü; 37 eksenin hiçbiri kenar süsü taşımıyor, en yakını
`edgeFinish` ve o dikiş payı kapatma YÖNTEMİ. **Denenen hamle** — mevcut bir eksene
sokup `resolutions`'a eklemek; reddedildi, çünkü (a) `engine/` YASAK ve `vocab.json`
otorite, (b) `preset_resolve_check.cpp:544-548` `resolved` için motorun host'u gerçekten
çizmesini şart koşuyor, çizen kod yokken `resolved` yalan olurdu. **Sonraki aday** —
önce `primitives-v1.json`'a iki primitif: kenara oturan şerit paneli + tekrar oranı
(FreeSewing `hem` makrosunun kardeşi) ve panel İÇİ geometri (Seamly2D `internal_path_tool`,
`V2-R` §1.3 md.3 "ALINIR"). İkisi de bugün primitif sicilinde YOK.

### 2.4 `_sayim` — komutla sayıldı, elle yazılmadı

```
python3 -c "import json,collections;d=json.load(open('contract/vocab-resolution-v1.json'));
  print(collections.Counter(v['status'] for v in d['resolutions'].values()), len(d['resolutions']));
  print(collections.Counter(v['status'] for v in d['_damar_sicili']['kalemler'].values()))"
# -> Counter({'resolved': 107, 'sentinel': 22, 'absent': 3}) 132
# -> Counter({'named': 12, 'absent': 1})
```

`_sayim` bloğu: `resolved 107 · sentinel 22 · absent 3` (DEĞİŞMEDİ — `resolutions`'a tek
anahtar eklenmedi, bijection korunduğu için eklenemezdi) `+ damarKalemi 13 ·
damarIsimlendirilmis 12 · damarIsimsiz 1` (YENİ).

---

## 3. 5 ABSENT OPERATÖRÜN SİCİL SATIRI

`contract/garment-spec-v2.md`'nin "absent (5)" bloğunun hemen altına 5 satırlık
**çapraz referans tablosu** eklendi. Her operatör için: v1 enum ekseni + karşılık gelen
`vocab-resolution-v1.json` girdileri + v1 statüsü. Statüler dosyadan OKUNDU:

```
python3 -c "import json,collections;r=json.load(open('contract/vocab-resolution-v1.json'))['resolutions'];
  by=collections.defaultdict(list)
  ...
  # gatherType   none:sen drawstring:res shirred:res smocked:res
  # sleeveCap    plain:res gathered:res puffed:res cap:res
  # collarType   none:sen stand:res mock:res flat:res peterPan:res shirt:res crescent:res
  # skirtStyle   aLine:res straight:res gathered:res halfCircle:res pleated:res gore:res
  # exposedZip   none:sen centerFront:res centerBack:res   (tam dokum: bu komutun ciktisi)
```

**Karşılığı YOK diye yazılan operatör: 0/5.** Beşinin de v1 tarafında karşılığı var ve
karşılıkların HEPSİ v1'de `resolved`. Bu bir çelişki değil, `V2-R` §3.3'ün "iki otorite"
ayrımının somut hâli: v1 eski 2B hattın ne ÇİZDİĞİNİ, v2 yüzey hattının ne
ÜRETEBİLDİĞİNİ söyler. Tabloda bu cümle açıkça yazılı ki okuyan "v1 resolved, v2 absent"
görüp kapıyı gevşetmeye kalkmasın.

İki kapsam farkı ayrıca işaretlendi:
- `collarFamily`: v2 `collar` enum'u 4 değer (`none/peterPan/stand/shirt`); `mock`, `flat`,
  `crescent` v2'de **adı bile yok**, v1'de üçü de resolved.
- `zipperPiece`: v2 `closure.buttonFront`'u da bu operatöre bağlamış; v1'de düğme sırası
  AYRI bir eksendir (`buttonRow`) ve fermuar parçasıyla aynı operatör değildir.

---

## 4. ÇIKTI DOSYALARI

- `contract/vocab-resolution-v1.json` — `_sayim` genişletildi + `_damar_sicili` bloğu (13 kalem).
- `contract/garment-spec-v2.md` — 5 absent operatörün çapraz referans tablosu.
- `GECE/V2-A.md` — bu dosya.

Başka hiçbir dosyaya yazılmadı. `engine/`, `web/`, `vision-student/`, `recipes/`, `docs/`,
`GECE/KOSU.md` el değmedi.

---

## 5. KART DIŞI FARK EDİLENLER (DOKUNULMADI, yazılıyor)

1. ⚠ **Kartın "13 adlı dosya" sayısı yanlış: `V0-0D` §1b tablosunda 12 satır var.**
   13. dosya yok. (Tablo altındaki run-on satırdaki 16 dosya ayrı sayılırsa 28 olur.)
   Hüküm 12+16 = 28'in hepsine verildi, boşluk kalmadı.
2. ⚠ **Kartın (2) maddesi ile `preset_resolve_check` bijection kuralı YAPISAL olarak
   çelişiyor.** Kart "yeni girdileri `resolutions`'a ekle" diyor, kapı "vocab'da olmayan
   anahtar giremez" diyor, ve kartın kaçış hükmü (`resolved`→`absent`) bu hata sınıfını
   kurtarmıyor. Aynı çelişki, damar kalemlerinin `resolutions`'a eklenmesini isteyen
   HER gelecek kartta tekrar çıkar. Kalıcı çözüm iki yoldan biri: (a) `engine/vocab.json`'a
   eksen eklemek (önce primitif, sonra motor kodu, sonra isim — `_yasa` md.1), ya da
   (b) `_damar_sicili` kardeş bloğunu kalıcı yapı olarak kabul edip kendi kapısını yazmak.
   **Karar verilmedi.**
3. ⚠ **`V0-0A` §3.4'ün "11 kalem" hükmü, hangi sicil olduğu yazılmadığı için yanlış
   okunmaya AÇIK.** Ölçüldü: o 11 kalemin 10'u `vocab-resolution-v1.json`'da `resolved`.
   Doğru cümle "sicilde isim olarak bile yok" değil, **"OPERATÖR sicilinde
   (`garment-spec-v2.json`) isim olarak bile yok, ama ÇÖZÜM tablosunda çözülü"**.
   Bu, kalemlerin durumunu iyileştirmiyor (v2 hattı yine çizmiyor) ama teşhisi değiştiriyor:
   sorun ADSIZLIK değil, iki sicil arasındaki KAPSAM FARKI.
4. ⚠ **`contract_check` (#85) kırmızı ve sebebi bu kart değil:** `patterns_real/` altında
   41 takipli dosya. CLAUDE.md'nin "GİZLİLİK ÇELİŞKİSİ" satırı 49 dosya diyor, kapı bugün
   41 sayıyor — iki sayı tutmuyor, hangisinin bayat olduğu **DOĞRULANMADI**.
5. ⚠ **`neckline.pussyBow` çift sayılıyor.** Hem `neckline` ekseninde bir yaka, hem de
   damar dilinde bir "fiyonk". `vocab-resolution-v1.json` notu onu *"Yaka degil, ASILAN
   parca"* diye tanımlıyor — yani eksen yerleşimi ile geometri birbirini tutmuyor.
   Dokunulmadı; `neckline` ekseninin bir üyesi olarak kaldı.
6. ℹ️ **`web/js/create.js`'te `crescent` yok** (`V0-0D` §5.2 bulgusu, bu kartta yeniden
   doğrulandı: `grep -c crescent web/js/create.js` → 0) ama `vocab-resolution-v1.json`'da
   `collarType.crescent` **resolved** ve notu *"derin hilal: flat ailesi"*. Yani hedef
   giysinin (Buğra Locket Top) yakası çözüm tablosunda çözülü, arayüzde seçilemiyor.
   Bu bir söküm işi değil, tek satırlık bir `web/` işi — kartın YASAKLAR'ı yazmayı yasaklıyor.

## 6. GÖREMEDİĞİM / ERİŞEMEDİĞİM

- `contract/garment-spec-v2.json` (operatör sicilinin KENDİSİ) **açılmadı** — kartın girdi
  listesinde yok. §3'ün 5 operatörü ve statüleri `GECE/V0-0A.md` §3.2 ile
  `contract/garment-spec-v2.md`'den ALINDI, birincil dosyadan yeniden ölçülmedi.
- `ANAYASA.md` **açılmadı** (girdi listesinde yok). Damar kalemlerinin satır çıpaları
  (`:42-44`, `:45`, `:45-46`, `:56`) `V0-0A` §3.4'ten aynen aktarıldı, **DOĞRULANMADI**.
- `GECE/V0-0A.md`'nin yalnız MADDE 3 (operatör sicili + damar) bölümü okundu; MADDE 1/2/4
  açılmadı — kart "YALNIZ damar + operatör sicili bölümleri" diyor.
- `engine/vocab.json`'a değer eklemenin üç üretilmiş tabloyu bayatlatacağı iddiası
  `gen-vocab.mjs` başlığından (`V2-R` §2.2 alıntısı) türetildi; üreteç bu koşuda
  KOŞTURULMADI, **DOĞRULANMADI**.
- §1c'deki 16 dosyanın yalnız `enum class` satırı okundu (`grep -n "enum class"`); gövdeleri
  açılmadı, mm hesapları incelenmedi.
- `GECE/V2-R.md` 541 satırın 386+155'i okundu (tamamı). Bölüm 1'in ALINIR/ALINMAZ hükümleri
  bu kartta KOD kararına çevrilmedi — o kartın kendi uyarısı (§3.5 son madde) böyle diyor.
