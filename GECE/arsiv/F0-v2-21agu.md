# F0 — DÜRÜST ENVANTER (2026-08-20)

Ölçüm fazı. Hiçbir şey düzeltilmedi. Her sayı bir komut çıktısından alındı,
dokümandan değil.

Üretilen ölçüm aletleri (2 yeni kaynak dosya, sınır 3):
- `GECE/f0-measure-pattern.py` → çıktı `GECE/f0-pattern-EU38.json`
- `GECE/f0-measure-flat.mjs` → çıktı `GECE/f0-flat-princess.json`

---

## 1. OPERATÖR SİCİLİ — `contract/garment-spec-v2.json` → `operators`

15 operatör. **9 shipped · 1 flagged · 5 absent.**

| statü | operatörler |
|---|---|
| shipped (9) | armholeNotch, backOpening, bodiceSurface, hemSweepCone, necklineDraft, princessCut, skirtSurface, topAnchoredDart, waistAnchoredDart |
| flagged (1) | shoulderSeam |
| **absent (5)** | **collarFamily, gatheredOverlayLayer, skirtFamily, sleeve, zipperPiece** |

**HAKEM DÜZELTMESİ — "5 eksik" diye sayma.** `zipperPiece` absent bir eksik
**değil**, damara uygun: `ANAYASA.md:48-50` "NE YOK" listesi *"görünür fermuar/metal
donanım"*ı damar dışı ilan ediyor. Kapatılırsa damar bozulur.
**Gerçek eksik: 4** (collarFamily, gatheredOverlayLayer, skirtFamily, sleeve).

**İkinci hakem düzeltmesi — isim tuzağı.** `skirtSurface` shipped ama `skirtFamily`
absent: binary etek paneli **basıyor** (`left_skirt_front` vb.), olmayan şey etek
**ailesi** (kloş/A-line/volan varyantları). Aynı tuzak `necklineDraft` (shipped, yaka
çizimi) ile `collarFamily` (absent, yaka **parçası**) arasında da var. Sicile bakıp
"etek yok / yaka yok" demek yanlıştır.

### Sicilin kendisinde bulunan kusur (sorulmamış, ama F0'ın en sert bulgusu)

ANAYASA'nın damarını taşıyan altı detayın **hiçbiri sicilde bir satır değil** —
`absent` bile değil, **adı yok**:

| detay | sicildeki adı | `engine/src/` dosyası | sevk edilen yolda mı |
|---|---|---|---|
| fiyonk | **SİCİLDE YOK** | (bow geçişleri var, ayrı dosya yok) | hayır |
| büzgü/shirring | kısmen `gatheredOverlayLayer:absent` | `gather.cpp` | hayır |
| mini düğme sırası | **SİCİLDE YOK** | `buttonrow.cpp` | hayır |
| fırfır/volan | **SİCİLDE YOK** | `ruffle.cpp`, `hemflounce.cpp` | hayır |
| peplum | **SİCİLDE YOK** | `peplum.cpp` | hayır |
| lace-up | **SİCİLDE YOK** | `laceupback.cpp` | hayır |

Bunun sonucu §0-3'ün ihlali: sicil kuralı *"spec reddedilir ve red cümlesi eksik
operatörü **adıyla** söyler"* diyor. **Adı olmayan bir eksiği adıyla reddedemezsin.**
Bugün "arka bele fiyonk" isteyen bir spec'in reddi hangi ismi söyleyeceğini bilmiyor.

Ayrıca: `engine/src/` altında `buttonrow.cpp · peplum.cpp · ruffle.cpp · gather.cpp ·
laceupback.cpp · hemflounce.cpp · sleeve.cpp · tie.cpp · strap.cpp · boxpleat.cpp ·
offshoulder.cpp · backdetail.cpp · neckext.cpp · shoulder.cpp` dosyaları **var ve
derleniyor** (`target_link_libraries(surface-pattern PRIVATE engine)`,
`engine/CMakeLists.txt:624-625`) — ama sevk edilen alet
`engine/tools/surface-pattern.cpp` yalnızca **4 başlık** çağırıyor
(`bodysurface.hpp · curvefit.hpp · sizechart.hpp · surfacepattern.hpp`, satır 34-37).
Yani kod derleniyor, **çağrılmıyor**. "Yazılmış ama sevk edilmemiş" bir kütüphane var.

---

## 2. DAMAR TABLOSU — ANAYASA §Damar vs bugünkü motor

`ANAYASA.md:28-58` (43 görselden çıkarılmış detay dili) her primitifi için:

| primitif | ANAYASA frekansı | gereken operatör | sicil statüsü | sevk edilen kalıpta |
|---|---|---|---|---|
| büzgü/shirring/smocking | ~16 / 43 | gatheredOverlayLayer | **absent** | hayır |
| fiyonk | ~14 / 43 | *(sicilde yok)* | — | hayır |
| mini düğme sırası | 9 / 43 | *(sicilde yok)* | — | hayır |
| fırfır/volan/peplum | ~9 / 43 | *(sicilde yok)* | — | hayır |
| prenses/panel dikişi | ~9 / 43 | princessCut | **shipped** | **evet** |
| lace-up | 2 / 43 | *(sicilde yok)* | — | hayır |
| dantel/fisto | 2-3 / 43 | *(sicilde yok)* | — | hayır |
| puf/balon/kap kol | set çoğunluğu (kollu olanlar) | sleeve | **absent** | hayır |
| bebe/devrik yaka | (yaka listesi) | collarFamily | **absent** | hayır |
| V / kayık / kare / sweetheart yaka | (yaka listesi) | necklineDraft | **shipped** | evet |
| kloş/A-line etek ucu | set geneli | hemSweepCone + skirtSurface | **shipped** | evet |
| etek ailesi çeşitlenmesi | üç siluet ailesi | skirtFamily | **absent** | hayır |

### DAMARIN KAÇ YÜZDESİ BUGÜN ÜRETİLEBİLİYOR?

ANAYASA'nın üyelik testinin bağlayıcı maddesi: *"en az İKİ yumuşak detay primitifi
var mı (fiyonk/büzgü/fırfır/mini-düğme/lace-up/dantel)?"* — bu altı primitif üzerinden
ölçüldü:

- **FLAT tarafı** (referans kalem `engine/flat-engine/styles.json`, 31 stil):
  fiyonk 0/31 · büzgü 13/31 · fırfır 8/31 · mini-düğme 0/31 · lace-up 0/31 · dantel 2/31.
  En az iki primitif taşıyan: **9/31 = %29**.
- **KALIP tarafı** (sevk edilen `surface-pattern`): altı primitiften **sıfırı** sevk
  edilen yolda. **%0.**

> ### DAMAR YÜZDESİ = **%0** (satılabilir çıktı ölçüsüyle)
> **Kalıp yolunda %0 · flat yolunda %29.** Ama flat tek başına satılabilir nesne
> değil, dolayısıyla ürün ölçüsüyle sayı **%0**'dır.

**HAKEM DÜZELTMESİ — ilk gerekçem delikti, sonuç başka üç bacakta duruyor.**
Yanlışım: ANAYASA'nın 8 soruluk üyelik testi bir **ÇİZİM** testidir (*"çizim
düz-önden simetrik, pastel-tek-renk mi?"*, *"arka çizildiyse arkada sürpriz var mı?"*),
kalıp yoluna değil flat'e uygulanır; ve `ANAYASA.md:8` hedefi zaten *"bir flat **ya da**
kalıp"* diye ikili tanımlıyor. Flat kolu bu primitifleri gerçekten üretiyor:
`_engine-full.mjs` → `laceBand()` (satır 104), `gatherTick()` (92), shirr blokları
(399/409), peplum bloğu (443-454), `_wtie==='bow'` (498). Yani *"altısının HİÇBİRİ
yok"* cümlesi **flat için yanlıştı**, sadece kalıp yolu için doğru.

Sonuç yine de %0, üç bağımsız sebeple — her biri ölçülü:
1. `CLAUDE.md` TEK TEST: *"bir insanın satın alabileceği bir nesneyle mi bitiyor?"*
   Flat SVG ölçeksiz (§3), satılabilir nesne değil.
2. Sevk edilen kalıp **strapless**: `shoulderSeam` flagged + `sleeve` absent →
   ANAYASA'nın 2. sorusu (*"kol kolsuz/askılı ya da kısa puf/balon/kap mı?"*) zaten
   geçilemiyor. `CLAUDE.md`: *"Strapless haliyle LİSTELEME: balensiz durmaz."*
3. `ANAYASA.md:19`: *"test yeşil + damar dışı = kötü çıktı."*

Doğru cümle şudur: **satılabilir kalıp yolunda damar %0; flat yolunda damar var ama
flat satılabilir nesne değil.**

---

## 3. FLAT KALIPTAN TÜRETİLİYOR MU? — HAYIR, DOĞRULANDI

`engine/tools/render-garment-flat.mjs` bunu **kendi başlığında yazıyor**:

- satır 23: *"Exports renderGarmentFlat(pieces, spec). `pieces` is accepted for
  signature compatibility but NOT used to derive the outline — the flat is spec-driven."*
- satır 829: *"`pieces` is unused for the outline (kept for signature compatibility)."*

Çürütülmedi, doğrulandı: **flat, kalıptan türetilmiyor.**

### Yan yana ölçüm (protokolün istediği)

| ölçü | KALIP (`surface-pattern EU38`) | FLAT (`dress_princess_scoop_aline`) |
|---|---|---|
| bel çevresi | **72.49 cm** (14 dikiş kenarı) | 92.52 SVG-birim (2×46.26 silüet yarısı) |
| etek ucu çevresi | **129.55 cm** (12 serbest kenar) | 112.34 SVG-birim (2×56.17) |
| gövde boyu | **69.64 cm** (torso 26.02 + skirt 43.62) | 314.91 SVG-birim |
| yaka açıklığı genişliği | **ÖLÇÜLEMEDİ** | 56.84 (omuz kesiti, yaka değil) |
| omuz genişliği | **ÖLÇÜLEMEDİ** | — |
| göğüs çevresi | **ÖLÇÜLEMEDİ** | — |
| **hem / bel oranı** | **1.7871** | **1.2141** |

**Ortak birim yok.** Flat SVG'de ölçek beyanı **YOK** — `viewBox="0 0 940 680"`,
`data-scale` / mm / cm hiçbiri yok (`GECE/f0-flat-princess.json` → `unitDeclared:false`).
Kalıp cm ve **çevre** ölçüyor, flat birimsiz ve **silüet genişliği** ölçüyor; ikisi
arasında tanımlı bir dönüşüm yok.

**Ve bu bir keşif değil — kontrat bunu zaten yazmış.** `contract/tables.json` →
`flat._layer`:
> *"fashion-flat DRAWING units. 1 unit = 5.6 SVG px. **NOT millimetres and NOT the
> same quantity as draft.\*:** flat.len.mini=42 is a stylised drawing length,
> draft.skirtLengthMM.mini=450 is a real hem drop."*

Yani repo, flat ile kalıp arasında ortak ölçülebilir sayı olmadığını **beyan ediyor**.
F1'in işi bu beyanı kaldırmaktır.

**Veri modeli de ayrık.** Kalıp yolu `specification.json` (2B poligon + kübik kenar,
GarmentCode şeması), flat yolu SVG path string. Aralarında bir dönüştürücü
**repoda yok** (hakem grep'i boş döndü).

Karşılaştırılabilir tek birimsiz sayı hem/bel oranı: **1.787 vs 1.214.**
Bu farkın ne kadarı gerçek uyuşmazlık, ne kadarı 3B→2B izdüşüm — **bugün ayırt
edilemiyor**, çünkü flat kalıptan türetilmiyor. F1'in teşhisi ("birbirini
denetlemeyen iki doğru") ölçümle desteklendi; dahası, ikisinden biri (flat)
ölçüsüz olduğu için ortada iki doğru değil **bir doğru + bir resim** var.

### Ölçülemeyenler ve sebepleri (uydurulmadı, işaretlendi)
- **göğüs çevresi:** göğüs hattı panel üzerinde işaretli değil. İlk yöntem (yatay
  kesit toplamı) EU38 için **129.43 cm** verdi — gerçek ~88. Yöntem çürük, sayı silindi.
- **omuz genişliği:** omuz dikişi yok (`h10_gate_check` K3: *"0 dikiş (ön üst-kenar
  ↔ arka üst-kenar), kapı ≥ 2"*; sicilde `shoulderSeam:flagged`).
- **yaka açıklığı:** torso'nun 15 serbest kenarı var, hangisi yaka / hangisi kol
  oyuğu **etiketli değil**. `preview_truth_check` de aynısını söylüyor:
  *"landmark 'neckHalf' ÖLÇÜLMEDİ"*.

---

## 4. FLAT KAÇ SİLUET AİLESİ ŞABLONUNDAN ÇIKIYOR?

Başlık iddiası (`render-garment-flat.mjs:16`): *"Silhouette families (one parametric
template each): TOP/SHELL, DRESS."* → **2 şablon.**

**Ama iddia eksik.** Aynı dosyada bir köprü var (`tryReferencePen`, satır ~718):
spec bir referans stiline eşleşirse üretim, kendi 2 şablonunu **kullanmaz**, referans
motoru (`engine/flat-engine/_engine-full.mjs`) çağırır.

Referans motorda gerçek durum ölçüldü:
- gövde konturunu üreten fonksiyon: `buildHalf` (`_engine-full.mjs:107-265`).
- **31 stil**, hepsi `styles.json`'da **parametre kaydı** — kendi çizim kodları yok.
- `_FIGURE_RULE` bunu açıkça yazıyor: *"Figür buildHalf'te MERKEZİ ve TÜM stiller
  miras alır… Stil başına tekrar yazılmaz."*

**HAKEM DÜZELTMESİ — "tek fonksiyon" fazla cömertti, iki delik var:**
1. `buildHalf` içinde stil adına göre **sert kodlanmış 2 kaçış** var, ikisi de
   `_engine-full.mjs:256`'da: `var _pinSkirt=(p.style==='drawstring_babydoll'||
   p.style==='lace_vneck_70s');`. Dosyanın tamamında `p.style==='<literal>'` toplam
   2 kez geçiyor — kapı dar ama açık.
2. Giysi geometrisi üreten tek fonksiyon buildHalf **değil**: `strapShape` (269),
   `puffSleeve` (297), `armholeBack` (319), `plainSleeve` (326), `collarShape` (373)
   ve `render()` içindeki peplum bloğu (443-474) de geometri üretiyor.

Doğru cümle: **tek gövde croquis'i + parametre, iki stil-pinli istisnayla; kol/yaka/
askı/peplum ayrı üreticilerde.**

**Sonuç — brief'in beklentisi kısmen çürütüldü:** "hep aynı havuz" şikâyetinin kökü
şablon sayısı **değil**. Referans hat zaten doğru mimaride (1 croquis + 31 parametre
kaydı, F3'ün "tek croquis yasası"nı zaten karşılıyor). Kök, **parametre uzayının
dar olması**: 31 stilin `own` anahtarları toplam 26 çeşit ve altı damar
primitifinden ikisi (fiyonk, mini-düğme) hiçbir stilde **yok**.

**İkinci kalem hâlâ ayakta:** eşleşmeyen spec üretimin kendi 2 şablonuna düşüyor.
Yani bugün iki ayrı flat kalemi var (`render-garment-flat.mjs` gövde yolu +
`_engine-full.mjs`), tek hakikat değil.

---

## 5. ctest

`cd engine/build && ctest` → `/tmp/f0_ctest.txt`

**95 test · 89 yeşil · 6 KIRMIZI (%94).** Süre 232.84 sn.

| # | test | ölçülen sebep |
|---|---|---|
| 5 | `style_check` | `engine/STYLE-PIN` yok/boş → pinlenmiş stil **0** |
| 70 | `bugra_bridge_check` | `patterns_real/geometry/ring-trace-locket-front-38.json` **yok** |
| 77 | `contract_check` | `patterns_real/` altında **41 takipli dosya** git'te (satın alınmış PDF/JPG) — test bunu "DECLARED DECISION (not a breach)" diye işaretliyor |
| 81 | `preview_truth_check` | `princess_dress` için `bustHalf`, `neckHalf`, `neckDepth` **ÖLÇÜLMEDİ** — draft tarafında sayı yok |
| 82 | `figure_check` | 3+ stil `waist/bust 0.637` **tabansız** — `figure-bands` `mandal.taban_v3`'te pin yok, hükümsüz |
| 88 | `h10_gate_check` | EU34 K1 armhole **312.86 mm**, kapı [384.50, 424.50] · K9 armhole-sign ön/arka ters · K3 shoulder-seam **0 dikiş**, kapı ≥2 |

**Bu, koşunun başlangıç durumu: ctest zaten kırmızı.** §0-6 (*"ctest tam yeşil
olmadan push yok"*) bugünkü main'de sağlanmıyor. Bu 6 kırmızı F0'ın doğurduğu
kırmızılar değil, **devralınan** kırmızılardır.

---

## 6. BU TURDA GÖRDÜĞÜM, SORULMAMIŞ AMA ÖNEMLİ OLAN

1. **Dikiş çiftleri bugün kusursuz eşit.** 26 dikişin 26'sında uzunluk farkı
   |d| ≤ 0.001 cm. F4'ün 1. maddesi (dikiş çifti eşitliği) bugün **zaten yeşil
   görünüyor** — ama bu şüphelidir: iki kenar aynı eğriden kopyalanıyorsa test
   hiçbir şey ölçmez (vacuous). F4 açılırken ilk sorulacak soru bu olmalı.
2. **Kalıpta kol paneli yok, yaka paneli yok.** 8 panel: 4 torso + 4 skirt. Sicil
   ile tutarlı (`sleeve`, `collarFamily` absent) — ama bu, bugün üretilen her
   kalıbın kolsuz bir elbise olduğu anlamına gelir.
3. **`contract/terms.json`: 24 `drawable` · 28 `honest`.** Yani sözlükte kayıtlı
   terimlerin **%54'ü çizilmiyor**. F2'nin "menü değil mutfak" teşhisinin sayısı budur.
4. **`engine/` altında 24 ayrı `build-*` dizini** duruyor (build-8b … build-18b).
   Diskte yer tutuyor ve hangisinin canlı olduğu dosya adından anlaşılmıyor;
   `ctest` `build/` içinde koşuyor.
5. **`patterns_real/` git'te takipli (41 dosya)** ve `contract_check` bunu kırmızı
   sayıyor. Bu K1'in konusu ve **Damla'nın kararında** — bu koşuda dokunulmadı.
6. Etek ucu tırtıklılığı (F3'ün somut kusuru) **bu fazda ölçülmedi** — F0'ın 5
   maddesinde yok, F3'e bırakıldı.

7. **Sevk edilen binary bugünün kaynağıyla derlenmemiş.** `engine/build/surface-pattern`
   **17 Ağu 18:33** tarihli, bugün 20 Ağu. Ölçümler o binary'den alındı. Hakem
   İddia 2'yi kaynaktan da doğruladığı için o hüküm etkilenmiyor, ama **sayısal
   ölçüler (72.49 / 129.55 / 69.64) 3 gün eski binary'dendir.**
8. **Linker kanıtı (hakemden).** `nm -C engine/build/surface-pattern | grep -iE
   "buttonrow|peplum|ruffle|gather|laceup|flounce|sleeve"` → **sıfır satır.**
   `garment.cpp` bu başlıkların hepsini include ediyor (`engine/src/garment.cpp:6,9,
   13,16,17,25,29`) ve `engine` kütüphanesine giriyor (`CMakeLists.txt:46`), ama
   static lib olduğu için linker kullanılmayan objeleri atıyor. "Kod var, sevk
   edilmiyor" ayrımı sembol düzeyinde kanıtlandı.

## 7. GÖREMEDİĞİM / ERİŞEMEDİĞİM
- Kalıp JSON'unun birim beyanı: `surface-pattern.cpp:55` yorumu "mm" diyor, ama
  çıktı değerleri cm ile tutarlı (bel 72.49, elbise boyu 69.64). Raporda **cm**
  kabul edildi. **DOĞRULANMADI** — birim, çıktıda beyan edilmiyor.
- Flat ölçümü tek stille (`dress_princess_scoop_aline`) yapıldı, 31'in tamamıyla
  değil. Tek croquis yasasının (F3-1) gerçekten tuttuğu **ölçülmedi**.
- `render-garment-flat.mjs`'in kendi 2 şablonlu yolundan çıkan flat ölçülmedi;
  ölçülen çıktı referans kalemden geldi.
- ANAYASA'nın dayandığı 43 görselin kendisine bakılmadı; frekanslar ANAYASA'nın
  yazdığı sayılardan alındı.
- **DOĞRULANMADI:** `shoulderSeam` sicilde `flagged` ("kod var ama kapalı"), ama
  kodun `engine/src/shoulder.cpp`'de gerçekten var ve ölçülmüş olduğu doğrulanmadı.
  `nm` çıktısında binary'de sembol yok — bu flagged tanımıyla tutarlı, ama kodun
  varlığını kanıtlamıyor. `HEDEF.md` sayacı ise "SIRADAKİ: G5 (omuz/kol oyuğu/yaka)"
  diyor ve `docs/G5-OMUZ-PLANI.md` için "kod yazılmadı" notu var — **sicil ile
  HEDEF çelişebilir.** F5 açılmadan bu çelişki kapatılmalı.
