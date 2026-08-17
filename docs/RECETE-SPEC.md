# REÇETE-SPEC v1 — reçete veri modeli (PIPELINE Aşama 1 tasarım belgesi)

> ⚠ **KAPSAM SINIRI (H2.1, 17.08).** Bu belge **eski 2B-formül yolunun** reçete
> DSL'idir ve mühürlü kapsamı **tek reçetedir** (`skirt.aline.dart`, + v1.1'in
> `top` çekirdeği). Sevk edilen tek-yüzey motorunu (`engine/src/surfacepattern.*`)
> **anlatmaz** ve HEDEF 2'nin "cümle → giysi" dili DEĞİLDİR.
> O dil `contract/garment-spec-v2.md` + `contract/garment-spec-v2.json`'dur
> (operatör sicili orada; kapı `specv2_check`). İkisi çelişirse v2 kazanır —
> bu belge yalnızca `recipe.hpp`/`recipe.cpp` yorumlayıcısının sözleşmesidir.

Bu belge PIPELINE.md Aşama 1'in ("REÇETE VERİ MODELİ") teknik şartnamesidir.
Bugün (2026-07-27) bu model kodda yoktur; bu belge, yazılacak yorumlayıcının ve
ilk reçete dosyasının sözleşmesidir. İş sırası dayatmaz (o yetki yalnız
ANAYASA.md + PIPELINE.md'de); Aşama 1'in "ne inşa edilecek" sorusunun cevabıdır.

Karar (Keşif 1'deki açık karar noktası): reçete yolu, motor çağrılarını kaydeden
bir RECORDER değil, reçeteden PathCommand'i BAĞIMSIZ yeniden inşa eden bir
YORUMLAYICI olacak. Gerekçe regen-vs-regen yasağının ruhu (kaynak: DERSLER.md:12
+ golden_check.sh başlığı, 2026-07-19 adli dersi — RULES.md'de bu yasak yazmaz): kanıt
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
  - `hypot(a, b)` — motorda `std::hypot` (bodice.cpp omuz eşitleme :671-676,
    kol oyuğu kirişi + tanjant normalizasyonu :127-141). v1.1 eklemesi
    (2026-07-28, §6): `sqrt(a*a+b*b)` taklidi DEĞİL, aynı libm çağrısı —
    bayt kapısı ancak bire bir aynı işlemle tutar.
- **isim çözümleme:** görünür ad alanı = ölçüler + parametreler + sabitler
  (`consts`) + global skalerler + (parça içinde) parça-yerel skalerler. AYNI
  görünür kapsam zincirinde bir adın İKİ kaynakta tanımlanması (gölgeleme) =
  `Result::Err` — öncelik sırası yoktur, çakışma sessizce maskelenmez (ör.
  `waistMM` adlı skaler tanımlanamaz: ölçü adıyla çakışır ve ölü doğardı).
  Farklı parçaların yerel skalerleri ayrı kapsamlardır (Front ve Back'in
  kendi `dartLength`'i meşru). İleri referans HATADIR. Bilinmeyen
  isim/fonksiyon/op = `Result::Err` (RULES.md invariant 1: sessiz
  düşürme/zorlamaya çevirme yok).
- **`when` koşulu:** yalnız marking girdilerinde; tek karşılaştırmalardan oluşan
  liste (`>`, `>=`, `<`, `<=`), liste elemanları VE ile bağlanır. Operand
  grameri: karşılaştırmanın İKİ tarafı da atomdur — tanımlayıcı YA DA ondalık
  sayı sabiti (ifade/parantez yok); tanımlayıcılar yukarıdaki isim
  çözümlemesinden geçer. Başka hiçbir yerde koşul yok. Grading kuralı (Aşama 5
  için ŞİMDİ yazılır, yoksa Kapı 5'te DXF-AAMA duvara toslar): nokta-bazlı
  graded bir beden serisi içinde TÜM `when` dalları her bedende AYNI
  değerlenmelidir; bir eşik serinin ortasında kesilirse (pens 1↔2 topoloji
  flip'i) nokta eşlemesi kaybolur → o graded run için `Result::Err`. Bugünkü
  EU çizelgesinde (tables.json euSizeChart) her bedende bel-kalça farkı 24 cm
  → dartWidth her bedende eşik üstünde sabit; bu topoloji sabitliği TESADÜF,
  garanti değil.
- **YOK:** üçlü koşul ifadesi, döngü, kullanıcı tanımlı fonksiyon, string
  işlemi, rastgelelik. LLM formül/sayı yazmaz (PIPELINE kalıcı yasak); reçete
  belgesini v1'de insan/spec yazar, Aşama 4'ün generatif katı reçete SEÇER ve
  parametre bağlar.

**Bayt-eşitlik disiplini:** formül metni, motordaki ifadenin işlem SIRASINI
birebir taşır (soldan sağa, aynı parantezleme). Yorumlayıcı aritmetiği yeniden
sıralamaz. AMA işlem sırası tek başına "motorla aynı ara sonuçlar"ı GARANTİ
ETMEZ — FP contraction gerçeği (probe: motor `-DCMAKE_CXX_FLAGS=-ffp-contract=off`
ile derlenir, `golden_dump` çıktısı pinli CSV ile cmp/diff edilir; ölçüm
2026-07-28): engine/CMakeLists.txt hiçbir fp/optimizasyon bayrağı taşımaz,
Apple clang varsayılanı `a*b±c` şekillerini FMA'ya kaynaştırır ve PİNLİ golden
bu kaynaşmış aritmetiği İÇERİR — `-ffp-contract=off` derlemede tam dump pinden
125 satırda sapıyor (hepsi bodice/top eğrisi; ilk fark satır 8041, cp1.x
153.1253→153.1252). Motor bayrağına DOKUNULMAZ (bayrak pinlemek golden_check'i
kırar). Ağaç-yürüyen yorumlayıcı per-op değerlendirir (kaynaşma imkânsız);
bu yüzden bayt kapısı ancak kaynaşmaya duyarsız alt kümelerde kurulabilir.
v1 adayı için aynı probe'la ölçüldü: `skirt/aLine` 288 satırlık pinli alt küme
`-ffp-contract=off` derlemede de BAYT-ÖZDEŞ — etek yolunda kaynaşabilir
şekiller var (skirt.cpp:67'deki `waistlineWidth + (hipQuarter - waistlineWidth)
* 0.6` fmadd'i ve `hipDepthMM * 0.3 - sideWaistRise` fmsub'ı) ama pinli üç
gövdede `%.4f` sınırını oynatmıyorlar (hipDepthMM=200 sabitken 200*0.3=60.0
tam temsil edilir). Kapı 1b bayt kapısı bu reçete için GEÇERLİ. Kural: bayt
kapısına yeni bir stil eklenmeden ÖNCE aynı probe o stilin pinli alt kümesine
koşulur; alt küme sapıyorsa o stilin hakemi BİLİNÇLİ İLANLA `golden-diff.py`
0.1 mm olur — formüller asla "bayt tutturmak için" değiştirilmez (yanlış
teşhisli formül düzeltmesi = drift).

### 2.2 Şema (v1)

```
Reçete belgesi (JSON, tek stil):
  recipeVersion   : 1 (tamsayı; bilinmeyen sürüm = Err)
  id              : benzersiz stil kimliği, ör. "skirt.aline.dart"
  title           : insan etiketi
  units           : "mm" (tek geçerli değer)
  kernel          : MÜHÜRLÜ kernel bağlamı — { garment, skirtStyle, shaping,
                    fabric } sabit kapalı-enum string dörtlüsü. Formül/sayı
                    TAŞIYAMAZ; dört anahtar dışında anahtar = Err
                    (additionalProperties felsefesi burada da delinmez).
                    Nedeni: çizim DIŞI kernel servisleri reçete belgesinden
                    üretilemez — `fabricEstimate` enum ister (skirt.cpp:482-525;
                    Princess'te 2*goreFlare ekler), `PatternValidator::issues()`
                    GarmentSpec ister (validator.hpp:35-38) ve etek sınıflaması
                    spec.garment/skirtStyle okur (validator.cpp:438-448); golden
                    satır etiketi de bu enum'lardan kurulur. Harness GarmentSpec'i
                    ve servis argümanlarını YALNIZ bu bloktan kurar; dokümante
                    edilmemiş "sihirli recipeId→enum eşlemesi" yasaktır (aksi
                    bağımsız-ikinci-yol kanıtını sessizce zayıflatır).
  measurements    : gereken ölçü adları listesi (BodyMeasurementsSnapshot
                    türevleri: waistMM, hipMM, bustMM, ...). "Eksik ölçü = Err"
                    tanımı SAYISALDIR: snapshot alanları default 0'dır
                    (measurements.hpp:12-13), eksik ile sıfır ayırt edilemez —
                    kural: listelenen her ölçü için değer <= 0 → Err.
  params          : { ad: { min, max, table? } } — çağıranın verdiği sürekli
                    girdiler. min/max YORUMLAYICI TARAFINDAN ZORLANIR: aralık
                    dışı parametre = Err (RULES.md invariant 1 — enforce
                    edilmeyen garanti yoktur; Aşama 4 generatif katından ya da
                    kanvas dışından gelen aralık dışı değer sessiz kabul
                    edilemez, clamp'i unutan reçeteye güvenilmez). Reçete
                    içindeki açık clamp formülü motor paritesi için kalır
                    (resolvedLength, skirt.cpp:12-16) ve zorlanmış aralıkta
                    kimliktir. Bilinen sapma (kayda geçer): motor TABLO yolunda
                    clamp YAPMAZ (skirt.cpp:12-16 yalnız override>0 dalında
                    clamp'ler); bugün K1 tablosu 450/650/900 aralık içi
                    olduğundan bayt farkı yok — tablo bir gün aralık dışına
                    oynarsa reçete yolunda bu Err olarak PATLAR, sessiz sapmaz.
                    table = K1 kontrat referansı (ör. "draft.skirtLengthMM",
                    tables.json).
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

ANAYASA gerilimi (dürüst kayıt): ayrı etek + midi/maxi, ANAYASA.md "NE YOK"
listesindedir — bu aday DAMAR için değil, MAKİNE KAPISI için seçildi (Kapı 1
hakemi makinedir; pinli golden yalnız mevcut motor stillerinde var ve en temiz
blok bu). Sonuç: Kapı 1 geçilip Aşama 2 otomatik açıldığında eldeki tek reçete
damar dışı olacak; Kapı 2'nin Damla-hakem malzemesi için ilk DAMAR İÇİ reçete
ihtiyacı (ör. A-line mini elbise / babydoll yönü) şimdiden görünür. Bu bir iş
sırası dayatması değildir (o yetki ANAYASA+PIPELINE'da), Aşama 2 açılırken boş
elle çıkılmasın diye düşülmüş nottur.

```json
{
  "recipeVersion": 1,
  "id": "skirt.aline.dart",
  "title": "A-line skirt (dart shaping, woven, waistband)",
  "units": "mm",
  "kernel": { "garment": "skirt", "skirtStyle": "aLine",
              "shaping": "dart", "fabric": "woven" },
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
Waistband = skirt.cpp:382-403 (bandLength skirt.cpp:383; `pieces()` :477
`waistbandPiece(m.waistMM(), fabric)` HAM bel geçirir, ease bandın içinde
uygulanır — reçete formülü aynı sonucu üretir, woven'da `waistEaseFor`=0.02);
dikiş payları = constants.gen.hpp:13-15; blok sabitleri = skirt.hpp:11-17;
`sideWaistRise = 12` blok başlığında DEĞİL, fonksiyon-içi sabittir
(skirt.cpp:50).

**Consts kopyası = K0 riski (değerlendirildi, karar):** yukarıdaki `consts`
değerleri skirt.hpp:11-17 ve constants.gen.hpp:13-15'ten ELLE kopyadır;
contract/tables.json `_contract` notu "Consumers NEVER copy these values" der.
Karar: v1'de reçete sabitlerini codegen'le üretmek KAPSAM DIŞI (yeni üreteç
katmanı Aşama 1'i şişirir); bedeli PARİTE MANDALIYLA ödenir — `recipe_check`
ctest'i reçetedeki HER const'u motor başlığındaki karşılığıyla sayısal
karşılaştırır (waistEase == SkirtBlock::waistEase, seamAllowanceMM ==
constants::kSeamAllowanceMM, ...); biri kayarsa suite kırmızı. Golden yalnız
pinli stilleri koruduğundan, bu mandal olmadan pinlenmemiş gelecek reçeteler
skirt.hpp/K1 değişikliğinde sessiz drift ederdi (repo'nun kendi K0 dersi).
contract'tan üretme seçeneği Aşama 2+ için açık.

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
   okuduğu için (geometry.hpp:47-58 sözleşmesi: `notches` markings'ten AYRI
   alandır, annotateTechnical notches'a yazar) bu katman golden'ı etkilemez.
   Servis çağrılarının enum bağlamı (GarmentSpec, fabricEstimate/guide
   argümanları) YALNIZ reçetenin mühürlü `kernel` bloğundan kurulur (§2.2).
7. **Determinizm.** Aynı reçete + aynı snapshot + aynı param → aynı double'lar
   (sabit değerlendirme sırası, IEEE754, yeniden sıralama yok; FP contraction
   sınırı ve probe kuralı §2.1) → aynı `%.4f` dökümü. Tahmin, rastgelelik,
   LLM sayısı sıfır.

**Outline kanonik sıra sözleşmesi:** `PatternValidator` POZİSYONEL ölçer —
etek parçasında bel kenarı `commands[1]`dir (`skirtWaistLength`,
validator.cpp:389-400) ve yan dikiş `commands[1]=Curve, [2]=Curve, [3]=Line`
dayatır (`skirtSideSeamLength`, validator.cpp:412-418). Reçete outline'ı bu
yüzden motorun kanonik komut sırasını KORUMAK ZORUNDADIR: move(bel merkezi) →
bel eğrisi → yan dikiş eğrisi → etek ucu → merkeze dönüş → close. Geometrik
olarak doğru ama sırası farklı bir belge validator ölçümünü sessizce bozar;
gelecekteki her reçete yazarı bu sözleşmeye tabidir.

**Regeneration:** ölçü ya da parametre değişince 2-6 adımları baştan koşar.
Reçete belgesi değişmez ve içinde önbelleklenmiş tek koordinat yoktur; maliyet
O(operasyon sayısı). Aşama 2 kanvası "ölçü değişti → anında yeniden çiz"
döngüsünü tam bu çağrıyla kurar; SVG/PDF yalnız dışa aktarımdır. Grading notu:
motorun BUGÜNKÜ grading tanımı beden başına yeniden draft + monotonluk +
validator'dır (grade_check.cpp, euSizeChart) — reçete yeniden-değerlendirmesi
bunu aynen taşır. Nokta-bazlı (delta kurallı / DXF-AAMA) grading Aşama 5
işidir ve §2.1'deki when-topoloji kuralına tabidir; cp1/cp2/grainline/marking
koordinatları v1'de isimsiz inline formüldür (nokta kimliği yok), nokta
kimliği tasarımı Aşama 5'in kendi kapısında yapılır.

**Motorla ilişki (v1):** `GarmentDrafter::draft()` dokunulmadan kalır; reçete
yolu paralel ikinci yoldur. Motor stillerinin reçete diline dökülmesi stil stil
ilerler; iki yolun eşitliği her stilde golden ile kanıtlanır. Kumaş metrajı ve
dikiş rehberi metni reçete dili DIŞINDADIR: bunlar çizim değil kernel servisidir
(`fabricEstimate` skirt.cpp:482-525, `guide` skirt.cpp:556-631) ve reçete yolu
dökümde aynı servisleri çağırır; çağrının enum argümanları reçetenin mühürlü
`kernel` bloğundan gelir (§2.2), harness'ta gizli eşleme yoktur.

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
kendi golden/ctest kanıtıyla eklenir (bir seferde bir operasyon). Aday envanter
SIRASIZDIR — sıra vaadi fiilen iş sırası dayatmaya kayar, o yetki yalnız
ANAYASA+PIPELINE'da (Aşama 6 ilkesi: şimdiden detaylandırmak drift kaynağı).
Yalnız isim + motor karşılığı:

- `mirror` — gorePanel simetrisi (skirt.cpp:325-366), `translatePiece`.
- `curveSplitAtX` — `splitCubic` + `cubicTForX` (geometry.hpp:108-117);
  princess/gore bel bölmesi.
- `seamEqualize` — gore truing (`targetLegLen`/`legDrop`, skirt.cpp:182-190).
  DÜRÜST NOT: bu bugün TEK operasyon değildir — motor `splitCubic` çıktısını
  MUTASYONLA düzeltir (`sideWaistEdge = waistAtB.second; sideWaistEdge.cp1.y
  += legBTrued.y - legB.y`, skirt.cpp:188-190; ardından `translatePiece`
  normalize, skirt.cpp:234-235). v1'in append-only op modeli ara eğri değerini
  adlandırıp tüketemez; bu operasyonun dile girişi MODEL DEĞİŞİKLİĞİ gerektirir
  (isimli kenar / ara-değer referansı) ve o tasarım giriş anında yapılır,
  şimdi değil.
- `arcPointOnCurve` — bel yayında hedef ark yürüyüşü (`seamArcTarget`,
  skirt.cpp:158-171); prenses dikişi hizalama.
- `rectPanel` + oran sabitleri — gathered/pleated dikdörtgen panelleri
  (skirt.cpp:241-290).

Dil operasyonu asla kernelden ÖNCE tasarlanmaz; kernelde olmayan şey reçetede
adlandırılamaz.

Genişleme kaydı: v1.1 (§6, 2026-07-28) bu kuralın kendisiyle işletilmiş ilk
genişlemedir — `hypot` + `shoulderMM` + `top` kernel bloğu, hepsi kernel
karşılığı gösterilerek ve kendi ctest/golden kanıtıyla girdi; mühür ihlali
değildir.

---

## 5. Kapı 1 test planı (hakem: makine)

Hedef kod: `engine/src/recipe.hpp/.cpp` (yorumlayıcı),
`recipes/skirt-aline-dart.json` (ilk reçete), `engine/tests/recipe_check.cpp`
+ `engine/tests/recipe_golden_check.sh` (ctest'e eklenir). Dört kanıt (a-d)
yeşil olmadan kapı geçilmiş sayılmaz; kanıt çıktıları `reports/`e yazılır
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
  satırları, 3 pinli gövdenin üçünde (fabric satırı dahil). Pinli dosya
  bütündür (`wc -l` = 23406 satır), bu alt küme `grep -c '|skirt/aLine/'` =
  288 satırdır — 9 kombinasyonluk döküm TAM dosyaya cmp veremez. Alt küme
  çıkarma MEKANİZMASI spec'in parçasıdır: `recipe_golden_check.sh` expected
  dosyasını PİNLİ `engine/golden-reference.csv`'den `grep '|skirt/aLine/'`
  ile üretir ve cmp O dosyaya karşı yapılır. Alt kümeyi motorun TAZE
  dökümünden filtrelemek YASAK — bu tam DERSLER.md:12'nin yasakladığı
  regen-vs-regen olurdu.
- Reçete yolu aynı 9 kombinasyonu üretir ve golden_dump'ın MEVCUT yazarıyla
  (`dumpCommands`, golden_dump.cpp:13-32; `%.4f` format) CSV'ye döker. YAZAR
  ortaklığı yalnız komut satırları değildir: `body|label|fabric,%.4f` satırı
  (combo başına İLK satır) ve `body|label|pieceN:Name` önek formatı
  golden_dump `main()`'dedir (golden_dump.cpp:112, :123) — reçete golden
  aracı bunları ve parça sırasını (Front, Back, Waistband) birebir kopyalar.
  Sayı üretimi bağımsız (yorumlayıcı), YAZAR ortak: format farkından sahte
  alarm/sahte geçiş olmasın.
- Karşılaştırma PİNLİ alt kümeye karşı `cmp` ile bayttır; motorun taze
  dökümüne karşı DEĞİL (regen-vs-regen yasağı: DERSLER.md:12 +
  golden_check.sh başlığı). Hakem: cmp exit 0, çıktısı rapora. Bayt kapısının
  FP-contraction ön koşulu ve ölçülmüş kanıtı §2.1'dedir (skirt/aLine alt
  kümesi `-ffp-contract=off` altında bayt-özdeş, probe 2026-07-28); bayt
  kapısına yeni stil eklemeden önce aynı probe zorunlu.
- fabric satırı kernel servisi `fabricEstimate`'ten gelir (§3; çizim değil);
  enum argümanları reçetenin mühürlü `kernel` bloğundan (§2.2).

### (c) Dikiş eşitleme testleri reçete yolunda yeşil

Mevcut dikiş/doğrulama disiplini reçete ÇIKTISINA uygulanır (motor çıktısına
değil):
- Yan dikiş: Front ve Back yan kenar yay uzunlukları eşit (test ölçerek
  doğrular, formül benzerliğine güvenmez).
- Bel dikişi: dört çeyreğin dikilen bel toplamı `fullWaist`'e tolerans içinde
  oturur. Bant kontrolü TOTOLOJİ DEĞİLDİR: `bandLength`'i onu tanımlayan
  formülün kendisiyle karşılaştırmak kanıt sayılmaz; hakem validator'ın ÖLÇEN
  kontrolüdür — `bandTotal = bandLength*2 - 60` vs ölçülmüş `sewnWaist`
  (validator.cpp:496-503) + yan dikiş çifti `pairedSeamTolerance`
  (validator.cpp:751, :197-201).
- `lengthMM` kelepçe sınırları (250/1200) reçete yolunda da doğrulanır
  (`skirtlen_check` paritesi) + aralık dışı param → Err (§2.2 zorlaması).
- `PatternValidator::issues()` tüm reçete parçalarında temiz (GarmentSpec
  mühürlü `kernel` bloğundan kurulur, §2.2); ctest tam yeşil olmadan push yok
  (RULES invariant 9).

### (d) Görünür kanıt (RULES invariant 3 + 5 ve per-feature 7 adım)

- Reçete yolundan üretilen kalıp A4 segmentasyonundan geçer (printable) ve
  PNG'ye render edilir (`engine/tools/render-pages.mjs` ailesi); PNG dosya
  yolu rapora yazılır. Yol yoksa adım YAPILMAMIŞTIR (invariant 3);
  validator-clean + printable olmadan özellik VAR sayılmaz (invariant 5).

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
- `PIPELINE.md` Aşama 1 + Kapı 1; `RULES.md` invariant 1/3/5/9 + per-feature
  7 adım; `DERSLER.md:12` — regen-vs-regen yasağının gerçek kaynağı

---

## Reddedilen itirazlar (çürütücü turu, 2026-07-28 — gerekçeli)

- "Motor + reçete `-ffp-contract=off` ile pinlensin, golden_check'in yeşil
  kaldığı kanıtlansın": REDDEDİLDİ, ölçümle — `-ffp-contract=off` derlenen
  motor TAM pinli golden'dan 125 satırda sapıyor (ilk fark satır 8041, bodice
  back cp1.x 153.1253→153.1252; probe komutu §2.1'de). Pin kaynaşmış aritmetik
  içeriyor; bayrağı pinlemek golden_check'i kırar ve tarihi Swift-parite
  pinini bayrak yüzünden re-pin'e zorlardı. Seçilen yol: alt küme probe'u (§2.1).
- "Kapı 1b hakemi golden-diff.py 0.1 mm'e indirilsin": v1 için REDDEDİLDİ —
  skirt/aLine 288 satırlık pinli alt küme `-ffp-contract=off` altında bile
  bayt-özdeş ölçüldü (2026-07-28); bayt kanıtı eldeyken hakemi gevşetmek
  kanıtı gereksiz zayıflatır. 0.1 mm yalnız probe'u kıran GELECEK stiller için
  bilinçli-ilanlı fallback olarak §2.1'e yazıldı.
- "Reçete sabitleri contract/constants'tan codegen'le ŞİMDİ üretilsin":
  v1 için REDDEDİLDİ — yeni üreteç katmanı Aşama 1 kapsamını şişirir (kapsam
  mührü §4 ruhu); K0 riski onun yerine zorunlu parite ctest mandalıyla
  kapatıldı (§2.3), codegen seçeneği Aşama 2+ için açık bırakıldı.
- "Yorumlayıcı ilk prototipiyle 9 kombinasyonluk smoke test önce koşulsun":
  GEREKSİZLEŞTİ — daha güçlü kanıt doğrudan motor üstünde üretildi (pinli alt
  kümenin fp-contract duyarlılığı ölçüldü, prototip beklemeden); sonuç §2.1'e
  işlendi, ayrıca smoke şartı kalmadı.

---

## 6. v1.1 GENİŞLEME — `top` kerneli (Aşama 2 damar-içi reçete, 2026-07-28)

Gerekçe: Kapı 2'nin Damla-hakem malzemesi damar-içi bir reçete ister (§2.3
notu); seçilen stil Vol2 #8 — spagetti askılı, kare yaka, A-line mini shift
(dikişsiz gövde: bodice bel altına A-line uzar, `TopBlock::extendPiece`
garment.cpp:50-91). Reçete: `recipes/shift-dress-square-spaghetti.json`
(`top.shift.square.spaghetti`). Formüllerin TAMAMI bodice.cpp +
garment.cpp'den okunmuştur (denetim izi reçete alanlarının sırasında).

**Dile eklenenler (genişleme kuralı §4 ile):**
- `hypot(a, b)` (§2.1) — motor karşılığı `std::hypot`.
- Ölçü sözlüğüne `shoulderMM` (measurements.hpp `shoulderMM()`; bodice
  omuz yarımı bodice.cpp:547 `m.shoulderCM * 10 / 2`).

**Kernel bloğu garment'a göre anahtarlanır (kapalı kümeler):**
- `"skirt"` → { garment, skirtStyle, shaping, fabric } (v1, değişmedi).
- `"top"`   → { garment, neckline, topLength, straps, shaping, fabric }.
  v1.1 mührü: her enum YALNIZ gönderilen reçetenin kanıtladığı değeri alır —
  neckline `"square"`, topLength `"tunic"`, straps `"spaghetti"`, shaping
  `"dart"` (princess `curveSplitAtX` ister, dilde yok), fabric `"woven"`
  (ease sabitleri belgede woven'a çözülü; knit reçetesi kendi belgesi + kendi
  kanıtıyla gelir). Mühür dışı değer = Err. `table` bağı skirt-only; top
  parametresi düz aralıklıdır (`extendMM`, bel→etek ucu uzatması; motorun
  `belowWaist(TopLength)` tablosunun sürekli hali — tunic=300 pinli nokta).
- `"dress"` → HENÜZ YOK (bel dikişli elbise etek kompozisyonu ister; kendi
  kanıtıyla gelecek genişleme). Shift elbise top kernelinde yaşar.

**Top kanonik outline sırası (pozisyonel sözleşme, validator + servisler):**
parça adları MECBUREN `Top Front` / `Top Back` (validator topIssues ve
StrapBlock bu adlara bağlanır). Sıra: move(centerNeck) → yaka kenarı (kare
önde 2 line, arka crew 1 curve) → line(omuz ucu) → kol oyuğu curve →
yan-dikiş+etek curve → etek→merkez curve → line(merkez kenar) → close.
Yapısal yürüyüş (validator.cpp topSideSeamLength ile AYNI): sondan close +
line'lar atlanır; kalan son üç curve = [kol oyuğu, yan→etek, etek→merkez];
kol oyuğunun başlangıcı bir önceki komutun ucudur (omuz ucu). Yorumlayıcı
kol oyuğu uzunluğunu BU yürüyüşle ölçer; sıraya uymayan belge Err.

**Kernel son-işlem servisleri (top; motor çağrı sırası birebir):**
1. kenar bitişi: varsayılan bias binding (patch 3.10) —
   `BodiceBlock::biasBinding(neckEdgeLength(m, neckline) + 2×ölçülmüş kol
   oyuğu, "neckline + armholes")`. Facing v1.1'de yok (mühür).
2. kumaş metrajı: TopBlock::draft birebir — (ön parça bbox yüksekliği =
   frontLength + extendMM) üzerinden; bindingFabricMeters +
   armholeBiasFabricMeters(ölçülmüş kol oyuğu).
3. rehber: `TopBlock::guide(...)` — TopBlock::draft'tan ÇIKARILMIŞ ortak
   fonksiyon (metin bire bir; motor da aynı fonksiyonu çağırır).
4. askı: `StrapBlock::apply(pattern, Spaghetti)` motor post-pass'i birebir
   (omuz noktalarını çizilmiş geometriden kendisi ölçer; yerleşim çentikleri
   + askı parçası + rehber adımı + kumaş payı).
5. `annotateTechnical(pattern, dressZipper=false)` (garment.cpp'den public
   servise çıkarıldı) + cutLine offsetOutline (v1 ile ortak kuyruk).

**Dürüst redler (Err, sessiz sapma değil):**
- `upperBustMM > 0` gövde → Err: belge 7-ölçü fallback çerçevesine çözülü
  (`bust - underbustOffset`); FBA dalı koşulsuz dilde ifade edilemez, verilen
  üst-göğüs sessizce yutulamaz.
- `Top Front`/`Top Back` adları yoksa parse Err; kanonik sıra bozuksa draft Err.

**Bayt kapısı (Kapı 1b'nin bu stile uzantısı):** §2.1 kuralı gereği probe
ÖNCE koşuldu (2026-07-28): pinli `top/square/tunic/none.short` alt kümesi
(54 satır; 3 gövde × [fabric + Top Front 9 + Top Back 8]) `-ffp-contract=off`
derlemede pinle BAYT-ÖZDEŞ → bayt kapısı geçerli. Hakem:
`recipe_dress_golden_check` — beklenen = PİNLİ csv'den
`grep '|top/square/tunic/none.short|' | grep ',outline,'` (51 outline
satırı), gerçek = reçete yolu `extendMM=300` (= belowWaist(Tunic) pinli
nokta) dökümü, cmp bayt. KAPSAM DIŞI BIRAKILANLAR (ilanlı): fabric satırı
(pin Facing-yüzeyli ve facing metrajı düşülmüş; reçete bias+askı taşır) ve
marking satırları (pinli kombinasyonda marking yok; reçete yolunda askı
yerleşim çentikleri StrapBlock'tan gelir — o servis motorla ORTAK kod).
Ayrıca `recipe_dress_check` motor-çapraz paritesi: aynı spec'le
`GarmentDrafter::draft` çıktısı ile reçete yolu, komut komut ≤ 1e-6 mm +
rehber/kesim metinleri bire bir (canlı çapraz kanıt; golden değil, pinin
yanında ikinci hakem). Trig sabitleri (`sinShoulderSlope` /
`cosShoulderSlope`) %.17g yazılır ve K0 mandalı `std::sin/std::cos`
çıktısıyla DOUBLE eşitliğiyle karşılaştırır — ondalık yaklaşıklık değil,
aynı double.
