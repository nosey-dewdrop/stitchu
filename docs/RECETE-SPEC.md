# REÇETE-SPEC v1 — reçete veri modeli (PIPELINE Aşama 1 tasarım belgesi)

Bu belge PIPELINE.md Aşama 1'in ("REÇETE VERİ MODELİ") teknik şartnamesidir.
Bugün (2026-07-27) bu model kodda yoktur; bu belge, yazılacak yorumlayıcının ve
ilk reçete dosyasının sözleşmesidir. İş sırası dayatmaz (o yetki yalnız
ANAYASA.md + PIPELINE.md'de); Aşama 1'in "ne inşa edilecek" sorusunun cevabıdır.

Karar (Keşif 1'deki açık karar noktası): reçete yolu, motor çağrılarını kaydeden
bir RECORDER değil, reçeteden PathCommand'i BAĞIMSIZ yeniden inşa eden bir
YORUMLAYICI olacak. Gerekçe RULES.md'nin regen-vs-regen yasağının ruhu: kanıt
ancak ikinci, bağımsız bir üretim yolunun PİNLİ golden'a bire bir oturmasıyla
kanıt olur; motorun kendi çağrılarını tekrar oynatmak kendi kendini doğrulamaktır.

---

## 1. Reçete veri modeli

Kalıp bir resim değil, BELGEDİR: ölçü tablosuna bağlı formüllü bir operasyon
dizisi (Valentina dosya mantığı). Reçete belgesi tek bir koordinat içermez;
yalnız formül içerir. Ölçü değişince belge değişmez, değerlendirme değişir.

Model dört kavramdan oluşur; hepsi motorun BUGÜN yaptığı gerçek işlemlere
birebir oturur (uydurma operasyon yok):

| Reçete kavramı | Motor karşılığı (dosya:satır) |
|---|---|
| **ölçü girdisi** | `BodyMeasurementsSnapshot` (measurements.hpp:11-27); mm'e çevrim `waistMM()/hipMM()` |
| **skaler** (`let`) | blok kodundaki ara değişkenler: `suppression`, `dartWidth`, `waistlineWidth` (skirt.cpp:40-53) |
| **nokta** (`point`) | isimli `Point` tanımları: `centerWaist`, `sideWaist`, `hipPoint`, `hemSide`, `hemCenter` (skirt.cpp:55-59) |
| **yol operasyonu** `move/line/curve/close` | `PathCommand::move/line/curve/close` fabrikaları (geometry.hpp:25-28); curve = kübik Bezier, cp1/cp2 formüllü |
| **pens** (`dart`) | `oneDart` lambda'sı: sol bacak move + uç line + sağ bacak line, markings'e (skirt.cpp:83-88) |
| **işaret** (marking `move/line`) | `piece.markings` (ör. Waistband katlama çizgisi, skirt.cpp:395-398) |
| **grainline** | `Grainline{from,to}` (skirt.cpp:106) |
| **parça meta** | `name`, `cutInstruction`, `seamAllowance` (skirt.cpp:100-107) |

Koordinat sistemi kernelinkiyle aynıdır: mm, y aşağı büyür, outline = DİKİŞ
çizgisi (geometry.hpp:2-4). Kesim çizgisi (cutLine, `offsetOutline`), çentikler,
closure işareti reçetenin İŞİ DEĞİLDİR; bunlar kernelin mevcut son-işlem
servisleridir ve reçete çıktısı bu servislerden aynen geçer (bkz. §3).

`ayna` (mirror) ve `dikiş-eşitle` (seam-equalize) operasyonları modelin
parçasıdır ama v1 DİLİNDE YOKTUR: Kapı 1 adayı stilin (A-line pensli etek)
bunlara ihtiyacı yok. Kernel karşılıkları hazır (`gorePanel` simetrisi
skirt.cpp:325-366; gore truing `legDrop` skirt.cpp:182-190; `splitCubic` /
`cubicTForX` geometry.hpp:108-119) ve §4'teki genişleme yolunda sıradalar.

### Stil = reçete belgesi

Motorun stil switch'leri (ör. `flare(style)` skirt.cpp:18-28,
`hemSideRise = flareOut > 0 ? 18 : 0` skirt.cpp:53) reçete dünyasında dile
girmez: HER STİL AYRI BİR REÇETE BELGESİDİR ve switch'in o stildeki değeri
reçetenin sabitine çözülür. A-line reçetesinde `flareOut = 60`, `hemSideRise = 18`
sabittir; ileride yazılacak straight reçetesinde ikisi de 0 olur. Böylece dilde
koşullu dallanma ihtiyacı en aza iner.

---

## 2. Dosya formatı

### 2.1 Formül dili (dar başlangıç, bilinçli)

Formüller düz metin ifadelerdir. v1 grameri:

- **atomlar:** ondalık sayı sabiti; tanımlayıcı `[a-zA-Z][a-zA-Z0-9_]*`
- **operatörler:** `+ - * /`, tekli `-`, parantez
- **fonksiyonlar (yalnız bu dört):**
  - `min(a, b)`, `max(a, b)` — motorda `std::min/std::max`
  - `clamp(x, lo, hi)` — motorda `std::clamp` (skirt.cpp:14)
  - `gate(x, t)` = `x >= t ? x : 0` — motorun "pens minimumun altındaysa yan
    dikişe katlanır" kuralı (skirt.cpp:43-46, `minDartWidth`)
- **isim çözümleme sırası:** ölçüler → parametreler → sabitler (`consts`) →
  daha önce tanımlanmış skalerler (önce global, sonra parça-yerel). İleri
  referans HATADIR. Bilinmeyen isim/fonksiyon/op = `Result::Err`
  (RULES.md invariant 1: sessiz düşürme/zorlamaya çevirme yok).
- **`when` koşulu:** yalnız marking girdilerinde; tek karşılaştırmalardan oluşan
  liste (`>`, `>=`, `<`, `<=`), liste elemanları VE ile bağlanır. Başka hiçbir
  yerde koşul yok.
- **YOK:** üçlü koşul ifadesi, döngü, kullanıcı tanımlı fonksiyon, string
  işlemi, rastgelelik. LLM formül/sayı yazmaz (PIPELINE kalıcı yasak); reçete
  belgesini v1'de insan/spec yazar, Aşama 4'ün generatif katı reçete SEÇER ve
  parametre bağlar.

**Bayt-eşitlik disiplini:** formül metni, motordaki ifadenin işlem SIRASINI
birebir taşır (soldan sağa, aynı parantezleme). Yorumlayıcı aritmetiği yeniden
sıralamaz; IEEE754 double ile motorla aynı ara sonuçlar üretilir. Golden bire
bir kanıtının (Kapı 1b) ön şartı budur.

### 2.2 Şema (v1)

```
Reçete belgesi (JSON, tek stil):
  recipeVersion   : 1 (tamsayı; bilinmeyen sürüm = Err)
  id              : benzersiz stil kimliği, ör. "skirt.aline.dart"
  title           : insan etiketi
  units           : "mm" (tek geçerli değer)
  measurements    : gereken ölçü adları listesi (BodyMeasurementsSnapshot
                    türevleri: waistMM, hipMM, bustMM, ...); eksik ölçü = Err
  params          : { ad: { min, max, table? } } — çağıranın verdiği sürekli
                    girdiler; min/max kanvas/UI aralığıdır, zorlama reçetenin
                    içindeki açık clamp formülüyle yapılır (motor pariteleri:
                    resolvedLength, skirt.cpp:12-16). table = K1 kontrat
                    referansı (ör. "draft.skirtLengthMM", tables.json).
  consts          : { ad: sayı } — stile çözülmüş blok sabitleri
  scalars         : [ { id, f } ] — sıralı, formüllü ara değerler
  pieces          : [ Parça ]

Parça:
  name            : PatternPiece.name (golden'da metin olarak birebir geçer)
  cut             : cutInstruction metni
  seamAllowanceMM : sayı (kernel sabitleriyle uyumlu: 15 gövde, 10 bant;
                    constants.gen.hpp:13-15)
  scalars         : parça-yerel skalerler (ör. dartLength Front=90 / Back=130)
  points          : [ { id, x: formül, y: formül } ]
  outline         : [ Op ] — Op:
                      { op: "move"|"line", to: noktaId | [xF, yF] }
                      { op: "curve", to: ..., cp1: [xF,yF], cp2: [xF,yF] }
                      { op: "close" }
  markings        : [ Op | Dart ] — Op yukarıdaki move/line; Dart:
                      { op: "dart", when?: [karşılaştırma...],
                        centerX: f, width: f, depth: f, legY: f }
                    Dart tam ÜÇ komuta açılır (motorun oneDart'ı birebir,
                    skirt.cpp:83-88):
                      move(centerX - width/2, legY)
                      line(centerX, depth)
                      line(centerX + width/2, legY)
  grainline       : { from: [xF, yF], to: [xF, yF] }
```

Listelenen alanlar dışındaki her anahtar = Err (kontrat felsefesi:
additionalProperties yok; kaçak knob giremez).

### 2.3 Örnek: Kapı 1 aday reçetesi `skirt.aline.dart`

Aday stil: A-line etek, pens (Dart) şekillendirme, dokuma kumaş, kuşaklı.
Seçim gerekçesi: motorun en az bileşenli, post-pass'siz bloğu; golden'da
`skirt/aLine/{mini,midi,maxi}` satırları `Shaping::Dart` ile pinli
(golden_dump.cpp:58-67). Formüllerin TAMAMI skirt.cpp'den okunmuştur.

```json
{
  "recipeVersion": 1,
  "id": "skirt.aline.dart",
  "title": "A-line skirt (dart shaping, woven, waistband)",
  "units": "mm",
  "measurements": ["waistMM", "hipMM"],
  "params": {
    "lengthMM": { "min": 250, "max": 1200, "table": "draft.skirtLengthMM" }
  },
  "consts": {
    "waistEase": 0.02,
    "hipEase": 0.02,
    "hipDepthMM": 200,
    "maxSideTake": 25,
    "minDartWidth": 8,
    "maxSingleDart": 30,
    "sideWaistRise": 12,
    "flareOut": 60,
    "hemSideRise": 18
  },
  "scalars": [
    { "id": "fullWaist",      "f": "waistMM * (1 + waistEase)" },
    { "id": "waistQuarter",   "f": "fullWaist / 4" },
    { "id": "hipQuarter",     "f": "max(hipMM * (1 + hipEase) / 4, waistQuarter)" },
    { "id": "length",         "f": "clamp(lengthMM, 250, 1200)" },
    { "id": "suppression",    "f": "max(0, hipQuarter - waistQuarter)" },
    { "id": "sideTake",       "f": "min(suppression * 0.6, maxSideTake)" },
    { "id": "dartWidth",      "f": "gate(suppression - sideTake, minDartWidth)" },
    { "id": "waistlineWidth", "f": "waistQuarter + dartWidth" },
    { "id": "hemX",           "f": "hipQuarter + flareOut" }
  ],
  "pieces": [
    {
      "name": "Front",
      "cut": "cut 1 on fold",
      "seamAllowanceMM": 15,
      "scalars": [ { "id": "dartLength", "f": "90" } ],
      "points": [
        { "id": "centerWaist", "x": "0",              "y": "0" },
        { "id": "sideWaist",   "x": "waistlineWidth", "y": "-sideWaistRise" },
        { "id": "hipPoint",    "x": "hipQuarter",     "y": "hipDepthMM" },
        { "id": "hemSide",     "x": "hemX",           "y": "length - hemSideRise" },
        { "id": "hemCenter",   "x": "0",              "y": "length" }
      ],
      "outline": [
        { "op": "move",  "to": "centerWaist" },
        { "op": "curve", "to": "sideWaist",
          "cp1": ["waistlineWidth * 0.45", "0"],
          "cp2": ["waistlineWidth * 0.8", "-sideWaistRise * 0.8"] },
        { "op": "curve", "to": "hipPoint",
          "cp1": ["waistlineWidth + (hipQuarter - waistlineWidth) * 0.6",
                  "hipDepthMM * 0.3 - sideWaistRise"],
          "cp2": ["hipQuarter", "hipDepthMM * 0.65"] },
        { "op": "line",  "to": "hemSide" },
        { "op": "curve", "to": "hemCenter",
          "cp1": ["hemX * 0.6", "length"],
          "cp2": ["hemX * 0.3", "length"] },
        { "op": "line",  "to": "centerWaist" },
        { "op": "close" }
      ],
      "markings": [
        { "op": "dart",
          "when": ["dartWidth > 0", "dartWidth <= maxSingleDart"],
          "centerX": "waistlineWidth / 2",
          "width":   "dartWidth",
          "depth":   "dartLength",
          "legY":    "-sideWaistRise * ((waistlineWidth / 2) / waistlineWidth) * 0.5" },
        { "op": "dart",
          "when": ["dartWidth > maxSingleDart"],
          "centerX": "waistlineWidth / 3",
          "width":   "dartWidth / 2",
          "depth":   "dartLength",
          "legY":    "-sideWaistRise * ((waistlineWidth / 3) / waistlineWidth) * 0.5" },
        { "op": "dart",
          "when": ["dartWidth > maxSingleDart"],
          "centerX": "waistlineWidth * 2 / 3",
          "width":   "dartWidth / 2",
          "depth":   "dartLength * 0.82",
          "legY":    "-sideWaistRise * ((waistlineWidth * 2 / 3) / waistlineWidth) * 0.5" }
      ],
      "grainline": { "from": ["40", "hipDepthMM"], "to": ["40", "length - 60"] }
    },
    {
      "name": "Back",
      "cut": "cut 1 on fold",
      "seamAllowanceMM": 15,
      "scalars": [ { "id": "dartLength", "f": "130" } ],
      "points":   "(Front ile aynı tanımlar)",
      "outline":  "(Front ile aynı operasyonlar)",
      "markings": "(Front ile aynı; dartLength=130 üzerinden değerlenir)",
      "grainline": { "from": ["40", "hipDepthMM"], "to": ["40", "length - 60"] }
    },
    {
      "name": "Waistband",
      "cut": "cut 2, interface 1",
      "seamAllowanceMM": 10,
      "scalars": [
        { "id": "bandLength", "f": "waistMM * (1 + waistEase) / 2 + 30" },
        { "id": "bandHeight", "f": "80" }
      ],
      "points": [
        { "id": "o",  "x": "0",          "y": "0" },
        { "id": "tr", "x": "bandLength", "y": "0" },
        { "id": "br", "x": "bandLength", "y": "bandHeight" },
        { "id": "bl", "x": "0",          "y": "bandHeight" }
      ],
      "outline": [
        { "op": "move", "to": "o" },
        { "op": "line", "to": "tr" },
        { "op": "line", "to": "br" },
        { "op": "line", "to": "bl" },
        { "op": "close" }
      ],
      "markings": [
        { "op": "move", "to": ["0", "bandHeight / 2"] },
        { "op": "line", "to": ["bandLength", "bandHeight / 2"] }
      ],
      "grainline": { "from": ["30", "bandHeight / 2"],
                     "to":   ["bandLength - 30", "bandHeight / 2"] }
    }
  ]
}
```

(Back parçasındaki `"(Front ile aynı ...)"` satırları bu belgede kısaltmadır;
gerçek dosyada üç parça da tam yazılır. v1'de parça-arası kalıtım/miras YOKTUR;
açıklık > kısalık.)

**Formül-kaynak eşlemesi (denetim izi):** `fullWaist/waistQuarter/hipQuarter`
= skirt.cpp:417-421; `length` = resolvedLength skirt.cpp:12-16 + K1 tablosu
(tables.json draft.skirtLengthMM: contract.gen.hpp üzerinden mini/midi/maxi);
`suppression/sideTake/dartWidth/waistlineWidth` = skirt.cpp:40-49;
noktalar = skirt.cpp:55-59; outline eğri kontrolleri = skirt.cpp:61-75;
pens dalları ve 0.82 çarpanı = skirt.cpp:89-98; grainline = skirt.cpp:106;
Waistband = skirt.cpp:382-403; dikiş payları = constants.gen.hpp:13-15;
blok sabitleri = skirt.hpp:11-17.

---

## 3. Yürütme semantiği

API hedefi (Aşama 1 kodu):

```
Result<DraftedPattern> draftRecipe(
    const Recipe& recipe,                 // ayrıştırılmış belge
    const BodyMeasurementsSnapshot& m,    // ölçü tablosu
    const RecipeParams& params)           // ör. { lengthMM: 450 }
```

Adımlar, sıra sabit:

1. **Ayrıştır + doğrula.** Şema dışı anahtar, bilinmeyen op/fonksiyon/isim,
   eksik ölçü, ileri referans → `Result::Err`. Sessiz varsayılan yok
   (RULES invariant 1).
2. **Bağla.** Ölçü adları snapshot'tan (cm→mm çevrimi snapshot'ın kendi
   metotları, measurements.hpp:21-26), parametreler çağırandan.
3. **Skalerleri değerlendir.** Önce `consts`, sonra `scalars` listedeki sırayla,
   sonra her parçanın yerel skalerleri. Sıralı tanım = döngü imkânsız.
4. **Noktaları değerlendir**, parça başına isim tablosuna koy.
5. **Yolları üret.** `outline` operasyonları sırayla `PathCommand` vektörüne;
   `markings` girdileri sırayla (dart girdisi `when` sağlanıyorsa üç komuta
   açılır, sağlanmıyorsa hiç komut üretmez); grainline ve parça meta alanları
   `PatternPiece`'e yazılır. Komut SIRASI belgedeki sıradır; golden metin
   karşılaştırması buna dayanır.
6. **Kernel son-işlem servisleri AYNEN çalışır** (reçete bunları yeniden
   yazmaz): cutLine = `offsetOutline` (geometry.hpp:128-135), teknik
   anotasyonlar (çentik/closure/grainline fallback, garment.cpp:159-200),
   `PatternValidator::issues()`. Golden dökümü yalnız commands + markings
   okuduğu için (geometry.hpp:49-55 sözleşmesi) bu katman golden'ı etkilemez.
7. **Determinizm.** Aynı reçete + aynı snapshot + aynı param → aynı double'lar
   (sabit değerlendirme sırası, IEEE754, yeniden sıralama yok) → aynı
   `%.4f` dökümü. Tahmin, rastgelelik, LLM sayısı sıfır.

**Regeneration:** ölçü ya da parametre değişince 2-6 adımları baştan koşar.
Reçete belgesi değişmez ve içinde önbelleklenmiş tek koordinat yoktur; maliyet
O(operasyon sayısı). Aşama 2 kanvası "ölçü değişti → anında yeniden çiz"
döngüsünü tam bu çağrıyla kurar; SVG/PDF yalnız dışa aktarımdır.

**Motorla ilişki (v1):** `GarmentDrafter::draft()` dokunulmadan kalır; reçete
yolu paralel ikinci yoldur. Motor stillerinin reçete diline dökülmesi stil stil
ilerler; iki yolun eşitliği her stilde golden ile kanıtlanır. Kumaş metrajı ve
dikiş rehberi metni reçete dili DIŞINDADIR: bunlar çizim değil kernel servisidir
(`fabricEstimate` skirt.cpp:482-524, `guide` skirt.cpp:556-631) ve reçete yolu
dökümde aynı servisleri çağırır.

---

## 4. v1 KAPSAM MÜHRÜ

30+ modülün hepsini v1'de dile dökmek YASAKTIR; bu, üç haftalık boru hattı
hastalığının reçete kılığında geri gelmesi olur (drift). v1 kapsamı Kapı 1
adayının İHTİYACI kadardır, bir operasyon fazlası değil.

**v1 İÇİNDE (hepsi bu):**
- Dil: `move`, `line`, `curve`, `close`, `dart`, marking `move/line`,
  `grainline`, parça meta (name/cut/seamAllowanceMM).
- Formüller: `+ - * /`, tekli eksi, parantez, `min`, `max`, `clamp`, `gate`.
- `when`: yalnız marking girdilerinde, VE'li karşılaştırma listesi.
- Tek reçete: `skirt.aline.dart` (A-line + Dart + woven + natural bel +
  mini/midi/maxi + Waistband). Ölçüler: `waistMM`, `hipMM`.
  Parametre: `lengthMM` (250-1200 kelepçe, K1 tablosu).

**v1 DIŞINDA (adı konur, dile dökülmez):**
- `mirror` (ayna), `curveSplitAtX`, `arcPointOnCurve`, `seamEqualize`
  (dikiş-eşitle/truing) operasyonları.
- Princess/gore yolu, bodice/dress/top blokları, kol, 40+ post-pass özelliği
  (yoke, peplum, gather, collar, tie, ...), K2 kompozisyon doğrulaması.
- Dilde stil switch'i (her stil ayrı belge), parça kalıtımı, döngü, koşullu
  ifade, kullanıcı fonksiyonu, string işlemi.
- `lengthExtraMM` / empire semantiği (elbise bağlamı; CLAUDE.md tuzak listesi:
  empire'a skirtLengthMM verilmez).
- Kumaş metrajı ve rehber metni (kernel servisi olarak kalır).

**Genişleme yolu (temiz büyüme kuralı):** bir operasyon dile ancak şu iki şart
birlikte sağlanınca girer: (1) kernelde deterministik, kapalı-form karşılığı
ZATEN vardır (geometry.hpp fonksiyonu ya da blok kodundaki adım); (2) tek başına,
kendi golden/ctest kanıtıyla eklenir (bir seferde bir operasyon). Aday sıra,
yalnız isim ve motor karşılığı (şimdi detaylandırmak yasak):

1. `mirror` — gorePanel simetrisi (skirt.cpp:325-366), `translatePiece`.
2. `curveSplitAtX` — `splitCubic` + `cubicTForX` (geometry.hpp:108-117);
   princess/gore bel bölmesi.
3. `seamEqualize` — gore truing (`targetLegLen`/`legDrop`, skirt.cpp:182-190).
4. `arcPointOnCurve` — bel yayında hedef ark yürüyüşü (`seamArcTarget`,
   skirt.cpp:158-171); prenses dikişi hizalama.
5. `rectPanel` + oran sabitleri — gathered/pleated dikdörtgen panelleri
   (skirt.cpp:241-290).

Dil operasyonu asla kernelden ÖNCE tasarlanmaz; kernelde olmayan şey reçetede
adlandırılamaz.

---

## 5. Kapı 1 test planı (hakem: makine)

Hedef kod: `engine/src/recipe.hpp/.cpp` (yorumlayıcı),
`recipes/skirt-aline-dart.json` (ilk reçete), `engine/tests/recipe_check.cpp`
+ `engine/tests/recipe_golden_check.sh` (ctest'e eklenir). Üç kanıt da yeşil
olmadan kapı geçilmiş sayılmaz; kanıt çıktıları `reports/`e yazılır
(PIPELINE loop düzeni), push kapı geçişinden sonra.

### (a) Aynı reçete + iki ölçü tablosu → iki DOĞRU kalıp

Gövdeler golden'ın pinli gövdelerinden (golden_dump.cpp:38-41):
- `EU38` (bel 70 / kalça 94): pens payı `maxSingleDart` üstünde → ÇİFT pens.
- `bigNeckSmallShoulder` (bel 84 / kalça 104): pens payı eşik altında → TEK pens.

Test iddiaları (ctest `recipe_check` çıktısında sayılarla):
- İki dump farklı VE fark doğru yönde: kalça çeyreği, bel çizgisi genişliği ve
  pens yapısı (1'e karşı 2 pens = marking satır sayısı 3'e karşı 6) gövdeyle
  değişiyor.
- Her iki kalıpta bel eğrisi dikilen boyu (yay uzunluğu `pathLength` eksi pens
  genişlikleri) hedef `waistQuarter`'a mevcut dikiş testlerinin toleransı
  içinde oturuyor.
- Her iki kalıp `PatternValidator::issues()` temiz.

### (b) Mevcut motor stili reçete yolundan golden'a bire bir

- Kapsam: `golden-reference.csv` içindeki `skirt/aLine/{mini,midi,maxi}`
  satırları, 3 pinli gövdenin üçünde (fabric satırı dahil).
- Reçete yolu aynı 9 kombinasyonu üretir ve golden_dump'ın MEVCUT yazarıyla
  (`dumpCommands`, golden_dump.cpp:13-32; `%.4f` format) CSV'ye döker. Sayı
  üretimi bağımsız (yorumlayıcı), YAZAR ortak: format farkından sahte
  alarm/sahte geçiş olmasın.
- Karşılaştırma PİNLİ `golden-reference.csv`'ye karşı `cmp` ile bayttır; motorun
  taze dökümüne karşı DEĞİL (regen-vs-regen yasağı, RULES.md). Hakem: cmp
  exit 0, çıktısı rapora.
- fabric satırı kernel servisi `fabricEstimate`'ten gelir (§3; çizim değil).

### (c) Dikiş eşitleme testleri reçete yolunda yeşil

Mevcut dikiş/doğrulama disiplini reçete ÇIKTISINA uygulanır (motor çıktısına
değil):
- Yan dikiş: Front ve Back yan kenar yay uzunlukları eşit (test ölçerek
  doğrular, formül benzerliğine güvenmez).
- Bel dikişi: dört çeyreğin dikilen bel toplamı `fullWaist`'e, Waistband
  `bandLength` = `fullWaist / 2 + 30`'a tolerans içinde oturur (bant kalıba
  dikilebilir).
- `lengthMM` kelepçe sınırları (250/1200) reçete yolunda da doğrulanır
  (`skirtlen_check` paritesi).
- `PatternValidator::issues()` tüm reçete parçalarında temiz; ctest tam yeşil
  olmadan push yok (RULES invariant 9).

Kapı geçince: commit + push + kanıt raporu; PIPELINE gereği makine-hakemli kapı
sonrası Aşama 2 (KANVAS) otomatik açılır.

---

## Kaynak dosyalar (bu belgenin dayandığı kod)

- `engine/src/skirt.cpp`, `engine/src/skirt.hpp` — A-line blok, tüm formüller
- `engine/src/geometry.hpp` — PathCommand, Point, kübik servisler, offsetOutline
- `engine/src/measurements.hpp` — ölçü snapshot'ı, enum'lar, K1 boy tablosu köprüsü
- `engine/src/constants.gen.hpp` — dikiş payı sabitleri
- `engine/tests/golden_dump.cpp`, `engine/golden-reference.csv` — pinli hakem
- `contract/tables.json` (K1) — draft.skirtLengthMM tek kaynak
- `PIPELINE.md` Aşama 1 + Kapı 1; `RULES.md` invariant 1/5/7/9
