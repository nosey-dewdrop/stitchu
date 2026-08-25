# V6-I — KAPI HÂLÂ KIRMIZI, BORÇ 20 → 16; KARTIN ÖNERDİĞİ YOL ÖLÇÜLDÜ VE KAPALI ÇIKTI

Ham çıktılar: `GECE/log/V6-I.kapi.txt` (kapanış kapısı, HEAD commit'i) ·
`GECE/log/V6-I.korumalar.txt` (dört koruma) · `GECE/log/V6.ctest.final.txt`.
Her sayının yanında onu basan komut var. Commit: `6b3378f` (+ bu tutanak).

## HÜKÜM

**KAPI KIRMIZI.** `HUKUM: FAIL (6 artan, 0 yeni)` — açılışta `FAIL (7 artan, 0 yeni)`.
Toplam **10452 → 10448** (taban 10438, delta **+14 → +10**).
Gevşetme yok: `vocab_reference_check.sh` DEĞİŞTİRİLMEDİ, `--baseline` ELLE
KESİLMEDİ, hiçbir vaka/çıpa/kapı silinmedi, kapsam daraltılmadı.

## 1. AÇILIŞ ÖLÇÜMÜ (kendi koşum, kartın zemini birebir doğrulandı)

```
bash engine/tests/vocab_reference_check.sh        # @ 767da1b
→ taban 10438 · bugun 10452 (delta +14) · HUKUM: FAIL (7 artan, 0 yeni)
  garment +5 · neckline +4 · shaping +2 · skirtStyle +2 · yoke +2
  · backOpening +1 · topLength +1   (düşen: sleeveLength −1 · sleeveStyle −2)
```
Kartın verdiği zemin doğru. **Kapsam düzeltmesi:** kartın saydığı
`engine/tests/edit_locality_check.mjs` kapının SCOPE listesinde **YOK**
(`contract engine/src engine/wasm engine/tools engine/pattern-bridge
engine/vocab.json web/js recipes backend knowledge`), yani o dosyadaki 12 satır
kapıya HİÇ sayılmıyor. Borcun tamamı üç dosyada:

| dosya | garment | neckline | shaping | skirtStyle | yoke | backOpening | topLength |
|---|---|---|---|---|---|---|---|
| `engine/tools/foto-spec-olcum.mjs` | 6 | 6 | 3 | 3 | 1 | 0 | 3 |
| `engine/tools/spec-diff.mjs` | 3 | 2 | 1 | 1 | 0 | 1 | 0 |
| `contract/anchors-v1.json` | 1 | 2 | 0 | 0 | 1 | 0 | 0 |
| **gereken düşüş** | **5** | **4** | **2** | **2** | **2** | **1** | **1** |

Basan komut (her eksen için):
`grep -rIn --exclude-dir=… -w <EKSEN> <SCOPE> | awk -F: '{print $1}' | sort | uniq -c`

## 2. ONARILAN — 4 SATIR, HEPSİ YORUM, DAVRANIŞ DEĞİŞİMİ SIFIR

`grep -w` yorum satırını da sayar (kapının kendi başlığı: "bu bir kullanim
analizi DEGIL, bir imzadir"). Dört yorumda kapalı-enum adı anılıyordu; adlar
çıkarıldı, cümlenin anlamı korundu:

| dosya:satır | ne | kazanç |
|---|---|---|
| `spec-diff.mjs:243` | `(neckline crew/scoop...)` → `(yaka biçimi crew/scoop...)` | neckline −1 |
| `spec-diff.mjs:247` | `// neckline.ext gibi kısmi kayıt` → `// '<alan>.ext' gibi …` | neckline −1 |
| `spec-diff.mjs:266` | `sadece garment/temel iskelet` → `sadece temel iskelet` | garment −1 |
| `foto-spec-olcum.mjs:200` | camelCase örneği `'topLength'` → `'hipBand'` | topLength −1 |

**`topLength` ekseni kapandı** (275 tabanına döndü, artan listesinden çıktı).

Kapanış ölçümü (`GECE/log/V6-I.kapi.txt`, komut `bash engine/tests/vocab_reference_check.sh`):
```
taban 10438 · bugun 10448 (delta +10) · HUKUM: FAIL (6 artan, 0 yeni)
garment +4 · neckline +2 · shaping +2 · skirtStyle +2 · yoke +2 · backOpening +1
```

## 3. KARTIN md.“NE” MADDESİ ÖLÇÜLDÜ — YOL KAPALI (yeni bulgu, V6-H denememişti)

Kart: “V6-H'nin denemediği kalem: `foto-spec-olcum.mjs`'in KONUM sınıfındaki
kelime-bölücü sözlüğünü `engine/vocab.json`'dan üret.” **Denendi, ölçüldü,
uygulanamaz çıktı.** Basan komut (node, tek satır; `GECE/log/V6-I.korumalar.txt`
dışındaki bu ölçüm doğrudan tekrarlanabilir):

```
node -e "v=JSON.parse(fs.readFileSync('engine/vocab.json'))..."   # camelCase böl
```

- Sözlüğün **37 alan adı 44 jeton** veriyor. KONUM listesinin 33 kelimesiyle
  kesişim **9**: `back cuff front hem neckline shoulder skirt sleeve yoke`.
  Kalan **35 jeton konum DEĞİL** (`button collar dart pleat straight round …`).
- Alan adlarına DEĞERLER de eklenince **134 jeton** oluyor, oran daha da
  kötüleşiyor (`woven`, `bias`, `scallop`, `pussy` …).
- Listeye 35 konum-olmayan jeton girerse KONUM sınıfının TANIMI değişir; koruma
  md.5'in `KONUM 11/26` ve `sıkı 7/15` sayıları yeniden tanımlanmış bir sınıfın
  sayıları olur. Bu bir **kapsam kararıdır**, kapı işi değil (RULES md.10).
- Konum/konum-değil ayrımını yapmak, o **9 kelimeyi elle seçmek** demek — yani
  `neckline` ve `yoke` yine harf harf yazılır, referans sayısı **net 0** oynar.
- İkinci üretilmiş aday olan çıpa adları (`anchorNames()`, 19 ad) yalnız **14
  jeton** veriyor: `back band cf collar hem neck seam shoulder side skirt sleeve
  surface waist zone`. İçinde **ne `neckline` ne `yoke` var**, ayrıca `band cf
  collar seam surface` KONUM listesinde olmayan 5 yeni jeton getiriyor.

**Sonuç: kapıyı kıran iki kelimeyi (`neckline`, `yoke`) hiçbir ÜRETİLMİŞ kaynak
basmıyor.** Sözlükte konum ekseni yok; kart bu satırı yazarken var olduğunu
varsaymış. Bu, kartın önerdiği tek yeni kalemin ölçülmüş reddi.

## 4. `yoke` NEDEN MATEMATİKSEL OLARAK KAPANAMAZ (kartın kendi yasağıyla)

`yoke` −2 gerekiyor ve ağaçta borç taşıyan **yalnız iki satır** var:
`foto-spec-olcum.mjs:192` (KONUM listesi, §3'te kapalı) ve
`contract/anchors-v1.json:271` (`"ad": "overlay.yoke"`, `_dogmayan` kaydı).
İkisi de gitmeden `yoke` tabanına inemez. İkincisi **doğmayan adın kendisidir**;
`engine/tests/anchor_source_check.mjs:274` onu ADIYLA doğruluyor
(`if (born.has(u.ad)) fail(...)`, `_olcum.dogmayanAd === unborn.length`).
Silmek = kartın yasakladığı “vaka silerek sayı düşürme”.
→ **Kapı bu kartla yeşile DÖNEMEZ.** SON ÇARE uygulandı.

## 5. KAPSAM DEVRİ (B) YENİDEN ÖLÇÜLDÜ — V6-H'nin reddi doğrulandı

`contract/spec-v1-v2-map.json` jenerik okunduğunda (hiçbir eksen adı yazmadan)
**11 alan** düşüyor: `garment sleeveStyle skirtStyle shaping hemRuffle closure
collar straps sleeveHead yoke backDetail`. Bugünkü `AXIS_MAP`'in 6 alanından
**`collarType` ve `backOpening` bu listede YOK** — üretilmiş eşleme v1 ŞEMA alan
adlarını (`collar`, `backDetail`, `closure`) taşıyor, motor spec'i ise
`collarType`/`backOpening` kullanıyor. İki ad dünyası. Jenerik devir aleti
BOZAR, sayıyı düşürmez. V6-H §5'in hükmü ayakta.

## 6. KORUMALAR — HİÇBİRİ DÜŞMEDİ (`GECE/log/V6-I.korumalar.txt`)

| komut | beklenen | ölçülen |
|---|---|---|
| `node engine/tests/edit_locality_check.mjs` | exit 0, 12 vaka + A1..A6 | **exit 0**, “hepsi yeşil”, A1..A6 OK |
| `node engine/tests/anchor_source_check.mjs` | exit 0 | **exit 0**, `HUKUM YESIL — 19 anchors, … 7 carry an edge fraction, 37 names refused` |
| `node engine/tools/gen-anchors.mjs` | 19 çıpa · 7 kenar-oranlı | **19 · 7** (+86 panel adı, 390 taslak, 37 doğmayan); `git status --porcelain -- contract engine` **boş** → çıktı bayt-aynı |
| `foto-spec-olcum.mjs --offline --bank vision/eval/live-2026-08-22.json` | 1/5 · 47/51 · GORME 4 · KONUM 11/26 · sıkı 7/15 | **TAM DOĞRU SPEC 1 (%20.0)** · **ALAN 51 · tutan 47 (%92.2)** · **GORME 4** · **KONUM 11/26 (%42.3)** · **SIKI 7/15 (%46.7)** |

## 7. KAPANIŞ ctest

`GECE/log/V6.ctest.final.txt` — komut `ctest --test-dir engine/build --output-on-failure`.
Faz açılışının kırmızı AD kümesi (`GECE/log/V6.ctest.opening.txt`):
`flat_pattern_agree_check(9) · flat_artifact_census(12) · style_check(13) ·
sizechart_source_check(20) · contract_check(91) · figure_check(96)`.
Bugünkü küme aynı 6 ad **+ `vocab_reference_check`** — o ad V6-H'de doğdu, bu
kartta da kapanmadı (§4). Küme BÜYÜMEDİ, bu kartla.

## SON ÇARE — UYGULANDI

`DAMLA-KUYRUK.md` → **K-V6A** bugünkü sayılarla güncellendi (borç 20 → **16**,
`topLength` kapandı, §3'ün ölçülmüş reddi eklendi). Kapı KIRMIZI bırakıldı.
Susturma yok, taban kesme yok, kapsam daraltma yok.

---

## KART DIŞI FARK EDİLENLER (dokunulmadı)

1. **KART BİR KAPSAM HATASI TAŞIYOR.** `engine/tests/edit_locality_check.mjs`
   kapının SCOPE listesinde değil; kartın “en büyük kalem” tablosunda onun 12
   satırı borç gibi sayılmış. O satırlar kapıya hiç girmiyor. (Ölçüm: SCOPE
   `vocab_reference_check.sh:95-96`.)
2. **V6-H'nin “kapıda delik” bulgusu ayakta:** `engine/tools/gen-anchors.mjs`
   `grep` tarafından İKİLİ sayılıyor (`-I` onu atlıyor), yani ratchet o dosyayı
   HİÇ görmüyor. Bu kartta bilerek kullanılmadı — borcu görünmez bir dosyaya
   taşımak kapıyı gevşetmektir. **Aynı sınıftan başka dosya var mı DOĞRULANMADI.**
3. `contract/anchors-v1.json:_kaynaklar.specv2` **ÖLÜ KÜNYE DEĞİL** (V6-H bunu
   şüpheli bırakmıştı, ölçüldü): `gen-anchors.mjs:121` `J(SRC.specv2)` ile
   okuyor ve `:312` `specv2.operators` üzerinde dönüyor. Silmek bilgi kaybıdır;
   `garment` +1'i bu yoldan düşürülemez.
4. `foto-spec-olcum.mjs`'in `FIELD_MAP` (239-244) ve `SPEC_DEFAULTS` (246-252)
   tabloları 7 satırda 13 eksen adı taşıyor. Bunlar **elle yazılmış varsayılan
   seçimlerdir**; sözlükte “varsayılan değer” alanı olup olmadığı **kontrol
   EDİLMEDİ** (süre). Varsa `SPEC_DEFAULTS` üretilebilir ve `garment/neckline/
   shaping/skirtStyle` her biri −1 düşer.
5. `foto-spec-olcum.mjs`'in `--v2` bloğundaki `GARMENT`/`SUPPR` tabloları
   `spec-diff.mjs:AXIS_MAP`'in `garment`/`shaping` satırlarıyla **birebir aynı**
   (ölçüldü), `SKIRT`/`SLEEVE` ise DEĞİL (`gore`, `halfCircle`, `cap` farkı).
   Tek kaynağa indirmek `AXIS_MAP.garment` yazmayı gerektirdiği için net 0.

## GÖREMEDİKLERİM / ERİŞEMEDİKLERİM

- `engine/src/`, `backend/worker.js`, `web/`, `patterns_real/` açılmadı (kart yasağı).
- `engine/tools/gen-vocab.mjs` ve `backend/vocab.gen.js` GİRDİ listesindeydi,
  **açılmadı**: borcun üç dosyası §1'de ölçüldü, ikisi orada değil.
- `contract/anchors-v1.json`'ın `_dogmayan` yapısını indeks tabanlı hale
  getirmek (V6-H'nin `bilesen` onarımının ikizi) **denenmedi**: `overlay.yoke`
  için konum jetonunu üretecek bir generated liste bulunamadı ve bekçinin 4.
  kapısı ile `gen-anchors.mjs`'in yeniden yazılması gerekirdi (süre tavanı).
- Görsel artefakt (PNG) üretilmedi: bu kart kontrat/kapı onarımı, RULES md.3'ün
  render adımını gerektiren bir geometri iddiası taşımıyor.
- `--baseline` ELLE KESİLMEDİ, `vocab_reference_check.sh`'e DOKUNULMADI.
