# HAKEM — F9 (VİTRİN · LANDING · İLK MÜŞTERİ) 🏁 KOŞUNUN SON HÜKMÜ

⚠ **BU DOSYA İLERLEDİKÇE YAZILDI VE ARA COMMIT ALDI.** Benden önceki hakem bir
altyapı hatasıyla öldü ve **hiçbir şey yazmadı** — commit yok, `HAKEM-F9.md` yok,
`KAPANIS.md` yok, etiket yok, ağaç temiz. Ona danışmadım. **Her sayı sıfırdan
benim ölçümüm.**

Ajanın pushları: `57410b7` → `b45dbd4` → `f8a18e1`. Geri alma etiketi `F9-oncesi`.

---

## 0. ÖNCE TAŞMA: KART DIŞINA ÇIKILDI MI? (§3.8 md.1 · md.5)

`git diff --stat F9-oncesi..HEAD` → **156 dosya, 2303+/591−.**
Dosya sayısı büyük ama **kütlesi `?v=140 → ?v=141` bumpıdır**: `web/` altındaki
~120 sayfa yalnız sürüm sorgusunda değişti (her biri 6–8 satır). **Gerçek iş
15 dosyada.**

**DEĞİŞMEZLERİN HEPSİ EL DEĞMEMİŞ — blob blob doğruladım:**

| dosya | ilan edilen blob | **benim ölçtüğüm** | hüküm |
|---|---|---|---|
| `contract/hedef-kosu-taban.json` | `0ea0cb44` | **`0ea0cb44`** | ✅ |
| `engine/tests/hedef_kosu.mjs` | `7370b86d` | **`7370b86d`** | ✅ |
| `engine/tests/expressability_check.mjs` | `04c61f03` | **`04c61f03`** | ✅ |
| `engine/tests/flat_pattern_agree_check.mjs` | `05384380` | **`05384380`** | ✅ |
| `vision/eval/labels-hakem.json` (K19 cevap anahtarı) | `c21964a8` | **`c21964a8`** | ✅ |
| `engine/tests/landing_truth_check.mjs` | `2964c1d3` | **`2964c1d3`** | ✅ |
| `engine/golden-reference.csv` | `a3ec26a6` | **`a3ec26a6`** | ✅ |
| `engine/tests/vocab_reference_check.sh` | `e1b55e85` | **`e1b55e85`** | ✅ |

`git diff --stat F9-oncesi..HEAD -- KOSU-v7.md contract/hedef-kosu-taban.json
vision/eval/labels-hakem.json patterns_real engine/golden-reference.csv
scripts/repin-golden.sh engine/tests/hedef_kosu.mjs` → **ÇIKTI BOŞ.**
**K26 (KOSU-v7.md tek bayt yazılmaz) tutuldu. K51 (golden + repin) tutuldu —
`repin-golden.sh` koşulmadı. K19 mührü tutuldu. `--taban` koşulmadı.**

`git ls-files patterns_real | wc -l` → **41 → 41.** Diffte **sıfır satır.**
Diskteki üç takipsiz kalem (`BUGRA-DEFTER.md`, `geometry/`,
`tools/bugra-geometry-*.json`) **takipsiz kaldı** — `git add -A` kullanılmamış.
✅ **K10 sınırı tutuldu.**

**Holdout `11 · 12 · 30 · 35` HARCANMADI** — on birinci karttır duruyor, ve
`al_dene_check` onları artık **adıyla** koruyor (`FORBIDDEN` listesi, rezerv
beşliyle birlikte).

---

## 1. İDDİA 1 — BORÇ 99 (CANLI LİSANS İHLALİ). **ÖLÇTÜM: KAPANDI.** ✅

Ajana güvenmedim: **canlı sayfayı kendim çektim.**

```
curl https://stitchu.noseydewdrop.com/al-dene.html   -> HTTP 200   (?v=141)
curl https://stitchu.noseydewdrop.com/data/al-dene.json?v=141 -> HTTP 200
```

### 1a. İÇ İÇE `<a>` VAR MI? — **YOK.**

Canlı `al-dene.html`'in kendi modülü (satır 128–186) şunu kuruyor:

```
wrap (div.cardwrap)
├── a.card        -> create.html?ornek=NN     (fotoğraf + başlık)
└── div.cc        -> KÜNYE, a.card'ın KARDEŞİ, İÇİNDE DEĞİL
    ├── <a href=kunye.commons_page>  {author}
    ├── " · "
    ├── <a href=kunye.license_url rel="license noopener">  {license}
    └── (BY-SA ise) <span class="sa">ShareAlike: a modified copy of this
                     photograph must carry the same licence.</span>
```

Künye `a.card`'ın **DIŞINDA**. **İç içe `<a>` yok.** Künyeye tıklayan
`create.html`'e değil **kaynağa** gidiyor. ✅ **Kart şartı 3 karşılandı.**

### 1b. BAĞLANTILAR GERÇEKTEN FOTOĞRAFÇININ SAYFASINA MI GİDİYOR? — **EVET.**

Canlı `data/al-dene.json`'ın onunu da açtım. **Onunda da** `commons_page` gerçek
bir Wikimedia Commons **dosya sayfası**, `license_url` gerçek bir lisans deed'i.
İkisini örnekleyerek **HTTP ile** sınadım:

```
200  https://commons.wikimedia.org/wiki/File:Mannequin_wearing_a_wedding_dress_(1561525).jpg
200  https://creativecommons.org/licenses/by-sa/4.0
```

### 1c. SHAREALIKE ŞARTI KARŞILANIYOR MU? — **EVET, ÜÇÜNDE DE.**

Canlı veri, lisans lisans:

| no | lisans | yazar |
|---|---|---|
| 01 | CC0 | Rijksmuseum |
| **02** | **CC BY-SA 2.0** | Jeff Kubina |
| **03** | **CC BY-SA 4.0** | Geoff Charles |
| 04 | CC BY 2.0 | BunnyHutVintage |
| 05 | CC BY 2.0 | Unknown author |
| 13 | CC BY 2.0 | Jakob Montrasio |
| **31** | **CC BY-SA 2.0** | Housing Works Thrift Shops |
| 32 | CC0 | RISD Museum |
| **37** | **No restrictions** ⚠ | Gift in memory of Elizabeth Ege Freudenheim |
| 38 | CC0 | RISD Museum |

**Dokuz CC (üç CC0 + üç BY + üç BY-SA) + bir hak beyanı.** Sayı **tam**.
Render kodu `/BY-SA/i` testiyle üçünün altına ShareAlike'ı **adıyla ve
yükümlülüğüyle** basıyor. ✅ **Kart şartı 1 · 2 karşılandı.**

### 1d. **#37 ARTIK CC SAYILIYOR MU? — HAYIR.** Canlı metin, kelimesi kelimesine:

> *"Nine of the ten are Creative Commons — three CC0, three CC BY and three
> CC BY-SA, and the three BY-SA ones say ShareAlike in as many words. The tenth
> is a museum rights statement, "No restrictions", which is not a CC licence and
> is not called one here."*

**F8'in yakaladığı yalan cümle** (*"every one of them links back to its source
page"* — bağlanmıyorken) **canlıdan kalktı** ve yerine **bugün DOĞRU olan**
cümle geldi. ✅ **Kart şartı 4 karşılandı.**

### 1e. ⚠ **KENDİ BULDUĞUM ZAYIF NOKTA — #37'NİN "LİSANS" BAĞLANTISI KENDİNE GİDİYOR**

`37`'nin `license_url`'ü bir lisans deed'i değil, **fotoğrafın kendi Commons
sayfası** (`//commons.wikimedia.org/wiki/File:Maya._Woman's_Blouse...`). Yani
"No restrictions" adının bağlantısı **kaynak sayfayla aynı yere** gidiyor.
**Bu bir ihlal DEĞİL** — "No restrictions" bir deed'i olmayan bir *hak beyanı*
ve beyanın kendisi o sayfada duruyor — ama **kartın "lisans adı lisansın
kendisine bağlanır" cümlesi bu tek kalemde teknik olarak zayıf.** Ajan bunu
yazmamış. **Hükmü çevirmiyor, kayda geçiyor.**

---

## 2. İDDİA 2 — LANDING SAYILARI ÜRETEÇTEN. **ÖLÇTÜM: DOĞRU.** ✅

### 2a. ÜRETEÇ GERÇEK Mİ?

`engine/tools/gen-vitrin.mjs` `hedef_kosu.mjs`'i **`execFileSync` ile fiilen
koşturuyor** ve `CIRCIR SETİ / HEDEF SETİ` bloklarını parse ediyor; blok
bulunamazsa **fırlatıyor**. Beden sayısı `contract/layers/shape-ratios.json`'dan,
on fotoğraf `contract/hedef-kosu-taban.json`'dan okunuyor. **Elle yazılan tek
rakam yok.**

`vitrin_check.mjs` üreteci **yeniden koşturup** üç şeyi karşılaştırıyor:
(1) `web/data/vitrin.json` bugünün çıktısına **bayt eşit mi**,
(2) `web/index.html`'deki her `data-v` anahtarı üreteçte **var mı**,
(3) sayfayı yeniden doldurmak **no-op mu** (yani sayfadaki değer bugünün değeri
mi) — artı sayfanın gerçekten **≥3 `data-v`** taşıdığı, boş sayfayla
vacuous-geçmeyi kapatan bir kol. **Bu tasarım doğru.**

### 2b. CANLI METNİ KENDİM OKUDUM — HER İDDİA ÖLÇÜLEBİLİR Mİ?

Canlı `index.html`'i çektim (HTTP 200, `?v=141`) ve **script/style'ı sıyırıp
düz metnini okudum.** Her sayı, yanında **`n`'i ve kapısıyla** geliyor:

| canlı cümle | `n` | basan kapı |
|---|---|---|
| **10/10** museum photographs → pattern + flat | **n=10** | `hedef_kosu` H1 |
| **66/71** field judgements agreed with an answer key | **n=10** | `hedef_kosu` H2 |
| **0** of the seam pairs … came back mismatched | **n=10** | `hedef_kosu` H5 |
| Eight fixed sizes, EU34–EU48 | — | `contract/layers/shape-ratios.json` |

Ve **kartın istediği üç saklamama da sayfada**:
- H2 için: *"deliberately not the headline: a page that chases it becomes a page
  fitted to the key"* → **K19 overfit baskısı ADIYLA reddedilmiş.** ✅ İŞ 1 md.3.
- H5 için: *"Read the denominator before the score: only two seam roles are
  declared … so five pairs are all the engine can be held to. Every other seam is
  UNMEASURED, and that is not the same word as passing."* → **payda tavanı
  saklanmamış, ilan edilmiş.** ✅
- H4/H9 için: *"Two of the twelve things this run tries to measure came back
  UNMEASURED and are named rather than filled in … Neither has a tool, so neither
  has a number here."* → **uydurulmamış.** ✅ İŞ 1 md.4.

**H11 yayınlanmamış** ve `vitrin.json` sebebini yazıyor: *"ÖLÇÜLEN MEDYAN
YAYINLANMAZ: duvar saati sayısıdır, koşudan koşuya oynar, bayatlığı gürültüden
ayırt edilemez."* **Bu benim de vereceğim karardı.** Ajan **yayınlayabileceği
bir sayıyı kendi aleyhine kesmiş.**

**KARŞILANMAYAN VAAT ARADIM. Landing'in sattığı her şeyin karşılığı sayfada:**
strapless **adıyla + sebebiyle** (`boning` + `flat_pattern_agree_check`), beş
kırmızı **adıyla**, *"a pattern that validates is not the same as a pattern that
sews up"*, ve **What is not built yet?** bölümü — kumaş ekseni, düzenleme,
hesaplar/forum/iOS — **hepsi gelecek zamanda ve *"no live example to show here"*
diyerek.** ✅

### 2c. K45 — *"SINIRSIZ"* GERÇEKTEN CANLIDA MIYDI? **EVET, ÖLÇTÜM.**

```
git grep -ci "unlimited|sınırsız" F9-oncesi -- web/  ->  web/index.html:1
git grep -ci "unlimited|sınırsız" HEAD       -- web/  ->  ÇIKTI BOŞ
```

**Kelime `F9-oncesi`'nde `web/index.html`'deydi ve `pages.yml` main'i sevk
ettiği için CANLIYDI.** Bugün **`web/` altında sıfır.** `vitrin_check` md.4 onu
**tüm `web/**.html|js`'te** tarıyor, yalnız landing'de değil. ✅
**Ajanın iddiası doğru ve iddia ettiğinden GENİŞ.**

### 2d. `site-health` — **KENDİM KOŞTURDUM**

```
checked: 128 pages, 2622 internal refs, 125 sitemap urls, 125 indexable pages
OK  site-health: no dead links, sitemap matches the site, one version.   rc=0
```
128 sayfa · **2622** iç bağlantı (F8'de 2621, +1) · **tek sürüm** · ölü bağlantı yok. ✅

---

## 3. İDDİA 4 — BORÇ 100 + ÜÇÜNCÜ KÜNYE HATASI. **KAYNAĞI KENDİM AÇTIM.** ✅ (bir çekince)

§3.10 ve K67/K73'ün dersi: **önce ARA.** Aradım — **birincil metin bulundu**
(ASTM'in kendi yayınlanmış D6673-10 önizleme PDF'i + `store.astm.org`).

| ajanın iddiası | birincil metin | hüküm |
|---|---|---|
| *"AAMA-250 diye bir belge yok"* | D6673-10 §2.2 yalnız **`ANSI/AAMA-292A`** atıf veriyor; hiçbir kaynakta 250 yok | ✅ **DOĞRU** |
| gerçek öncül **ANSI/AAMA-292 / 292A** | *"ANSI/AAMA-292, 'American National Standard for Pattern Data Interchange — Data Format', AAMA, 1993"* | ✅ **DOĞRU** |
| **D6673-10 "(Withdrawn 2019)"** | `store.astm.org/d6673-10.html`: *"(Withdrawn 2019)"*, **No replacement** | ✅ **DOĞRU — ve künyede YAZIYOR** (`dxf.hpp:4` "WITHDRAWN 2019, not replaced") |
| **L8 = internal line(s)** | §4.3 tablosu: `Layer 8 internal line(s)` | ✅ |
| **L14 = sew line(s)** | `Layer 14 sew line(s)` | ✅ |
| **L11 = internal cutout(s)** | `Layer 11 internal cutout(s)` | ✅ |
| **L15 düzeltmesi** | §4.3.1.1: *"annotation text, which is plotted out and is defined as Layer 15"*; §4.3.1.2 **Piece System Text** Layer 1'in altında | ✅ **BİRİNCİL METİN KARTI DOĞRULUYOR** |

**L15 DÜZELTMESİ YAPILDI MI? — SAYI DEĞİŞMEDİ, AMA KALEM YAZILDI, VE BU DOĞRU
DAVRANIŞ.** `dxf.hpp:59-64` şunu yazıyor: *"In D6673-10 the PIECE NAME ("Piece
System Text", §4.3.1.1–2) belongs on Layer 1 with the boundary; L15 is plotted
annotation text. This exporter puts the piece name on L15. The layer numbers in
this struct are sealed for this card … so the divergence is RECORDED, not
silently claimed correct."* **Kartın DEĞİŞMEZLER'i katman numaralarını mühürlemiş
(`1·14·7·4·6·8·15`); ajan mührü kırmadı ve sapmayı gizlemedi de.** ✅
`golden` **bayt bayt aynı** (`a3ec26a6`), tek sayı değişmedi. ✅

### ⚠ 3a. **KENDİ BULDUĞUM DÖRDÜNCÜ KÜNYE HATASI — AJAN YAZMADI**

`dxf.hpp:54-55` katman tanımlarını **`D6673-10 §3.1.4`** ve **`§3.1.5`** diye
atıf veriyor. **Birincil metinde katman listesi §3.1'de DEĞİL, §4.3'te.**
(§3 ASTM'de *Terminology*'dir.) Yani borç 100 iki cümleyi düzeltirken
**üçüncü bir yanlış bölüm numarası bıraktı** — ve bu kart tam da künye
kesinliği kartıydı. **Küçük, sayı taşımıyor, hükmü çevirmiyor. BORÇ 101 olarak
açıyorum.**

### 3b. Aramanın getirdiği, sorulmamış ama önemli üç kalem

1. **D6673-10 15 katmanla BİTMİYOR:** L80–L87 de tanımlı (T-notch, castle notch,
   check notch, U-notch, ve dört *quality validation curve* katmanı). *"Konvansiyon
   15 katman"* diyen bir cümle **yanlış olur** — bugün repoda öyle bir cümle
   **yok**, ama yazılırsa yanlış olacak.
2. **§4.3'ün dört sert kısıtı** bu ihracatçıyı bağlar ve **hiçbiri ölçülmüyor**:
   L1 kapalı poligon olmalı; L2 = L1/8/11/14'teki **bütün** turn point'ler;
   L3 = aynı katmanlardaki bütün curve point'ler; **L5·6·7·9·10·13 POLYLINE
   İÇEREMEZ.** Motorun L6'ya `foldLine`, L7'ye `grainline` yazdığını `dxf-verify.py`
   künyesi söylüyor — **bunlar polyline mı, LINE mı, ÖLÇMEDİM. DOĞRULANMADI.**
3. **D6673-10 §1.2 AutoCAD R13 DXF şart koşuyor**; bu ihracatçı **R12** yazıyor
   (`dxf.hpp:2`). AAMA-292 R11 tabanlıydı. **Gerçek bir birlikte çalışabilirlik
   farkı olabilir; ÖLÇMEDİM. DOĞRULANMADI.**

---

## 4. AJANIN KENDİ ALEYHİNE YAZDIĞI İKİ KALEM — **HÜKÜM** (§3.4)

Ajan beş kalemi kendi aleyhine yazdı. **İkisi benim hükmümü istiyor. İkisini de
ölçtüm, ikisinde de ajan DOĞRU.**

### 4a. 🔴 **§4C md.7'nin "ölçüm tablosu" kolu BUGÜN KARŞILANMIYOR — ONAYLIYORUM, VE AJANIN YAZDIĞINDAN GENİŞ**

**Ölçtüm:**
```
curl https://stitchu.noseydewdrop.com/lib/flat-tables.gen.js  -> HTTP 200, 76.961 bayt
   içinde "patterns_real" / "Buğra" geçen satır sayısı: 10
curl https://stitchu.noseydewdrop.com/atolye.html             -> HTTP 200
   atolye.html:911  "patterns_real/geometry/geometry-full.json -- satın alınmış Buğra 'Locket Top'"
```

**CANLI, PUBLIC bir sayfada duran şey, kelimesi kelimesine:**
> `"_source": "patterns_real/geometry/geometry-full.json -> rings[pattern=locket_top,`
> `piece='Back Body', sizeGuess='38']. … Ölçüm: GECE/log/F-E.bugra-olcum.txt."`

ve türetilmiş skalerin kendisi:
> `"OLCULDU — satin alinmis Bugra Locket EU38 'Back Body' parcasinda omuz/gogus`
> `yari-genislik orani 196.13/204.94 = 0.9570"`

**§4C md.7'nin cümlesi:** *"repoda durmaz, **dağıtılmaz**, **çıktıya sızmaz**."*
İkinci ve üçüncü şart **bugün canlıda ihlal.** Ölçüm tablosu satın alınmış
kalıptan **çıkarılmış iki milimetre değerini** ve **yolun adını** yayınlıyor.

**AJANIN KAPIYA BAĞLAMAMA GEREKÇESİ ÖLÇÜLEBİLİR VE DOĞRU.** `vitrin_check` md.5'in
(a) kolunu okudum: aradığı desen `(?:href|src|fetch\()` ile başlıyor — yani
**yalnız BAĞLANTI**. `"_source": "patterns_real/…"` bir `href`/`src`/`fetch`
değil, **serbest bir dizge**, ve kapıdan geçiyor. Bağlasaydı **ALTINCI KIRMIZI**
olurdu ve faz kapısı md.1 gereği **faz kapanmazdı.**

**HÜKMÜM — ÜÇ PARÇA:**
1. **BU BİR İHLALDİR ve F9'un hükmünü ÇEVİRMEZ.** Sebep ölçülü: ihlal
   `87fc9d5`'ten, **F0'dan çok önce** geliyor ve F9 kartı **açıkça** *"repoyu
   private yapmak ya da geçmişi kazımak BU KARTIN İŞİ DEĞİL"* diyor. Bir vitrin
   kartına bir mimari ihlali yükleyip §3.12'yi taşırmak, koşunun on yedi fazdır
   kaçındığı hata olur.
2. **AJAN DOĞRU DAVRANDI: KAPATMADI, YAZDI.** Kapıya bağlayıp altıncı kırmızıyı
   üretmek yerine **hükmü hakeme getirmek** kartın kendi talimatıdır
   (*"bildirmek ucuz, gizlemek pahalı"*). **Bu kalem ajanın LEHİNEDİR.**
3. 🚨 **BUNU BİR BORÇ OLARAK KAPATMIYORUM — DAMLA'YA GÖNDERİYORUM**, çünkü çözümü
   teknik değil **ticari**: türetilmiş skaleri sayfadan çıkarmak `flat-core.js`'in
   croquis'ini kaynaksız bırakır (`_previous` bloğu: kaynaksız 78.0u değeri
   **geometrik olarak imkânsızdı**, omuz ucu büstün dışındaydı), yani *"kaynağı
   sil"* burada *"yanlış sayıya dön"* demek. **KAPANIS.md'nin en üstünde.**

### 4b. **K42 YALNIZ VİTRİNE UYGULANMIŞ — ONAYLIYORUM, VE SAYIYI KENDİM SAYDIM**

```
git grep -l "princess seam|prenses dikiş" HEAD -- web/   ->  22 dosya
git grep -o "princess seam|prenses dikiş" HEAD -- web/   ->  98 geçiş
git grep -l "princess"                    HEAD -- web/   ->  53 dosya
grep -o "princess"  (canlı index.html)                   ->   0
```

**Ajanın *"20 dosya ~100 kez"*i doğru; gerçek sayı 22 / 98.** Landing'de **sıfır**.

**HÜKMÜM: F9 İÇİN YETERLİ, KOŞU İÇİN DEĞİL.**
K42 bir **adlandırma** yasasıdır ve F9 bir **vitrin** kartıdır; vitrin **temiz**.
Kalan 98 geçiş `web/styles/princess-seams.html` ve 21 koleksiyon sayfasında —
bunlar **sitemap'te** (125 indekslenebilir sayfa), yani yabancı onlara da
ulaşıyor. Ama orada kelime bir **giysi terimi** olarak geçiyor, **bu kesimin adı**
olarak değil; **K42'nin yasakladığı ikincisidir.** Ayrımı yapmadan toplu `sed`
atmak K42'yi **yanlış yere uygular** ve 156 dosyalık diff'i ikiye katlar.
**Borç 102 olarak açıyorum.**

---

## 5. FAZ KAPISI — **KENDİ PRISTINE RELEASE KOŞUM** (§3.8 · K32 · K33)

`realpath == pwd` ✅ (`/Users/damummyphus/damla_projects_2026/stitchu`)
`CMAKE_BUILD_TYPE:STRING=Release` ✅ · `cmake --build engine/build -j8` **rc=0**

⚠ **`ctest`in son satırları KOPYALANDI, ÖZETLENMEDİ:**

```
96% tests passed, 5 tests failed out of 132

Total Test time (real) = 741.57 sec

The following tests FAILED:
	 20 - flat_artifact_census (Failed)
	 21 - style_check (Failed)
	 28 - sizechart_source_check (Failed)
	102 - contract_check (Failed)
	108 - figure_check (Failed)

The following tests did not run:
	114 - h10_gate_check (Disabled)
```

| kart şartı | benim ölçtüğüm | hüküm |
|---|---|---|
| kırmızı **≤ 5** | **5** | ✅ |
| kalanlar **bu beş addan** | `flat_artifact_census` · `style_check` · `sizechart_source_check` · `contract_check` · `figure_check` | ✅ **ALTINCI AD YOK** |
| kayıtlı **132 → 133** | **133** kayıtlı, **132** koşan | ✅ **BİR KAPI EKLENDİ, SIFIR SİLİNDİ** |
| DISABLED **1 → 1** | `114 - h10_gate_check (Disabled)` | ✅ (K18) |
| kartın eklediği maliyet | F8 **722.09 sn** → F9 **741.57 sn** = **+19.48 sn** | ✅ `vitrin_check`in bedeli (üreteci yeniden koşturuyor) |

**Sekiz faz kapısının sekizi de kendi koşumda:** `vocab_reference_check`
**HÜKÜM: YEŞİL** · `indir_check` **EXIT 0** · `hedef_kosu` **EXIT 0, CIRCIR
SAĞLAM** · `pytest` **33 passed** · `bugra_parity_check` **EXIT 0** ·
`al_dene_check` **EXIT 0** · `landing_truth_check` **YEŞİL** ·
`vitrin_check` **EXIT 0** — hepsi süitin içinde ve hiçbiri kırmızı adlar
arasında değil. `site-health` **OK**, tek sürüm `?v=141`.

### CIRCIR — **HİÇBİRİ KÖTÜLEŞMEDİ, KENDİ KOŞUMDA** (§3.6)

| sayı | kartın tabanı | **benim ölçtüğüm** | hüküm |
|---|---|---|---|
| **H1** | 5/5 (n=5) · **10/10 (n=10)** | **5/5 · 10/10** | ✅ **TAVAN TUTTU — F9'un ön şartı** |
| H2 | %95.2 (40/42, n=5) · %93 (66/71, n=10) | **%95.2 · %93** | ✅ |
| H3 | 2 · 2 | **2 · 2** | ✅ |
| **H4** | **ÖLÇEMEDİM** | **ÖLÇEMEDİM (on yedinci faz)** | ⚠ uydurulmadı |
| **H5** | pay **0** / payda **5** | **0 / 5** (n=5 ve n=10) | ✅ pay 0'da |
| **H6** | 0 / 16 (**n=8 stil**) | **0 / 16 (n=8)** | ✅ `n` harmanlanmadı |
| H8-sözlük | 31 (n=5) · 61 (n=10) | **31 · 61** | ✅ |
| **H8-ifade** | **pay 4/5**, payda 5 mühürlü | betik **`H8-İFADE = 1 / 5`** basıyor = **ÇEVRİLEMEYEN 1**, yani **ÇEVRİLEN 4/5** | ✅ **K66 İŞARET TUZAĞINA DÜŞMEDİM — açıkça yazıyorum: PAY (çevrilen) = 4/5** |
| H10 | %58.3 · %64.4 | **%58.3 · %64.4** | ✅ |
| H10a | %17.5 · %29.7 | **%17.5 · %29.7** | ✅ cırcıra bağlı değil (K21) |
| **H10b** | **%40.0** (48/120) · %33.1 (79/239) | **%40.0 · %33.1** | ✅ **§0B tavanı YÜKSELMEDİ** |
| H10e | 3 · 5 | **3 · 5** | ✅ |
| H10x | %0.8 · %1.7 | **%0.8 · %1.7** | ✅ |
| H11 | medyan 2.9 ms | **4.0 ms (n=5) · 2.4 ms (n=10)**, en kötü 48.7 | ✅ **<10 sn tavanı** (duvar saati, yayınlanmıyor) |

`CIRCIR SAĞLAM — hiçbir sayı kötüleşmedi.`

---

## 6. KENDİ MUTASYONLARIM — **BEŞ, DÖRDÜ AJANIN HİÇ AÇMADIĞI DOSYADAN** (§3.8 md.3)

Betik `GECE7/log/f9.hakem.mutasyon.sh`, ham log `f9.hakem.mutasyon.txt`.
**Commit'ten SONRA koşuldu** (borç 89, HEAD `6ad91ae`), `git checkout --`
kullanılmadı (`cp` ile yedeklendi), her turun başında `numstat` basıldı,
C++ turunda **her iki derlemenin `rc`'si ve iki `shasum`** yazıldı (borç 80).

| # | dosya | ajan açtı mı? | mutasyon | sonuç |
|---|---|---|---|---|
| **HM-1** | `web/al-dene.html` | 48+/12− (açtı — **kartın emrettiği mutasyon**) | künye YAZAR bağlantısı `<a>` → `<span>` | **`al_dene_check` EXIT 1**, on fotoğrafın **onunda da** `the author's name links to the source page` FAIL. `vitrin_check` EXIT 0 (doğru: onun işi değil). Geri → **EXIT 0** |
| **HM-2** | `engine/tools/bugra/bugra-parity.mjs` | **numstat BOŞ** | `topLength: 'hip'` → `'tunic'` (**F8'in HM-3'ü**) | **`bugra_parity_check` EXIT 1**, iki kalem: *"the harness uses the SHORTEST offered length that goes below the waist — not the flattering one — harness 'tunic' · kural 'hip'"* ve *"the gate re-drafts at the SAME length the harness drafts at"*. Geri → **EXIT 0** |
| **HM-3** | `contract/layers/shape-ratios.json` | **numstat BOŞ** | bir beden düşürüldü (8 → 7) | **`vitrin_check` EXIT 1** — üreteç yeniden koştu, sayfadaki sayı **bayatladı**. Geri → **EXIT 0** |
| **HM-4** | `vision/eval/credits.json` | **numstat BOŞ** | bir fotoğrafın `sha256`'sının ilk karakteri | **`al_dene_check` EXIT 1**: `byte-identical to the credited original — 93e7778274f2 vs a3e7778274f2`. Geri → **EXIT 0** |
| **HM-5** | `engine/src/bodice.cpp` | **numstat BOŞ** | BOAT yaka eğrisinin kontrol noktası `w*0.85` → `w*0.65` (**gerçek geometri**) | `cmake --build` **rc=0** · `build-wasm` **rc=0** · **İKİLİ KIMILDADI: dist `762e7286`→`80da170f`, vendor `a0bb1844`→`eb63782f`** · **`golden_check` EXIT 1** (*"engine output differs from the REPO PIN"*). Geri: iki derleme de **rc=0**, ikili **tam olarak** `762e7286`/`a0bb1844`'e döndü, `golden` **EXIT 0** |

**BAYAT İKİLİ YOK, ZAYIF MUTASYON YOK.** HM-5'te ikilinin hem gittiği hem
**bayt bayt geri geldiği** `shasum`la gösterildi.

### 🚨 6a. HM-5'İN YAN BULGUSU — **HEDEF KOŞUSU GERÇEK BİR GEOMETRİ KUSURUNU GÖRMEDİ**

HM-5 canlı motorun **BOAT yaka eğrisini** bozdu, `golden_check` bunu yakaladı —
ama **`hedef_kosu` aynı bozuk ikiliyle EXIT 0 verdi ve `CIRCIR SAĞLAM` bastı.**
H1 hâlâ 10/10, H2 hâlâ %93. Bu **bir kusur değil**, cırcırın **ne olduğunun
ölçülmüş sınırı**: H1 *"kalıp + flat üretildi mi"*yi sorar, *"doğru mu"*yu
değil, ve H2 **alan yargılarını** karşılaştırır, **milimetreleri** değil.
Geometrinin bekçisi `golden_check`'tir. **Bunu yazıyorum çünkü landing'in
"10/10" cümlesi bir DOĞRULUK cümlesi sanılabilir — değil, bir TAMAMLANMA
cümlesidir, ve canlı sayfa da tam böyle yazıyor** (*"went in and came out the
far end as a pattern and a flat"*). **Sayfa doğru, ama bu sınır bir yerde
adıyla durmuyordu.**

---

## 7. `?v=141` CANLIYA NE GÖNDERDİ? (kart md.8)

`.github/workflows/pages.yml:23` `branches: [main]` + `paths: ['web/**']` →
`57410b7`/`b45dbd4`/`f8a18e1`'in **web/ dokunan her biri canlıya çıktı.**
Ölçtüm:

```
https://stitchu.noseydewdrop.com/                 HTTP 200   ?v=141
https://stitchu.noseydewdrop.com/al-dene.html     HTTP 200
https://stitchu.noseydewdrop.com/data/al-dene.json?v=141      HTTP 200
canlı web/vendor/stitchu-engine.js sha  a0bb1844
repo  web/vendor/stitchu-engine.js sha  a0bb1844   <-- BAYT BAYT AYNI
```

**Canlı wasm paketi repodakiyle birebir.** `site-health` **OK**, **tek sürüm**.
`?v` bumplandı ve cırcır **aynı commit'te** yeniden mühürlendi (K21).

⚠ **KENDİ BULDUĞUM: SEVK EDİLEN `web/vendor` PAKETİ F8'DEN BERİ DEĞİŞTİ.**
F8 `5e1958dc` ölçmüştü; bugün `a0bb1844`. Değişiklik **yalnız `dxf.hpp`'nin
YORUMUNDAN** geldi (borç 100), ve `dist` **tam olarak** `762e7286`'da kaldı.
Yani **`engine/dist` yeniden üretilebilir, `web/vendor` DEĞİL** — bir yorumun
satır sayısı sevk edilen paketin baytlarını oynatıyor (muhtemelen gömülü
`__LINE__`/assert dizgeleri). **Sayı değişmedi** (`golden` `a3ec26a6`, `hedef_kosu`
yeşil), ama *"ikili bayt bayt aynı"* bir daha **`web/vendor` için söylenemez**.
**BORÇ 103.**

---

## 8. BORÇ 73 — **ON BİR KARTTIR HAKEM MASASINDA. GÖRÜNÜR YARISINI KAPATTIM.**

Kart *"son şans; yaparsan önce/sonra yaz"* dedi. **Yaptım, ve sebebi on bir
kartın hiçbirinin bakmadığı bir yerdeydi.**

**ÖNCE (ölçüm, iddia değil):**
```
grep -n korNokta engine/tests/hedef_kosu.mjs
282:      r.korNokta = { pair: 'armhole↔sleeve_cap', on: …, arka: …, neden: … }
```
**TEK SATIR — ATAMANIN KENDİSİ.** `r.korNokta` dosyanın hiçbir yerinde
**okunmuyordu**. Yanındaki yorum şunu iddia ediyordu: *"Kör nokta burada
SAYIYLA basılıyor ki gizli kalmasın."* **O CÜMLE F4'ten beri YANLIŞTI** — kör
nokta hesaplanıp **düşürülüyordu**, ekrana **tek karakteri** çıkmıyordu.
Borç 73'ün azaltıcı önlemi **ölü koddu ve kimse ölçmemişti.**

**SONRA:**
```
H5 KÖR NOKTASI (5/10 kalıpta ölçülebildi) — "0 eşleşmeyen çift" bunu GÖRMÜYOR:
  ⚠ 01-a-line-cocktail-dress-mannequin.jpg  armhole↔sleeve_cap  ön 214.97 mm · arka 196.03 mm  (fark 18.94 mm)
  ⚠ 02-ball-gown-exhibit.jpg                armhole↔sleeve_cap  ön 190.19 mm · arka 180.95 mm  (fark  9.24 mm)
  ⚠ 03-wedding-dress-mannequin.jpg          armhole↔sleeve_cap  ön 214.97 mm · arka 196.03 mm  (fark 18.94 mm)
  ⚠ 04-babydoll-dress.jpg                   armhole↔sleeve_cap  ön 214.97 mm · arka 196.03 mm  (fark 18.94 mm)
  ⚠ 05-empire-waist-gown.jpg                armhole↔sleeve_cap  ön 214.97 mm · arka 196.03 mm  (fark 18.94 mm)
```

🚨 **VE BASILDIĞI AN BİR SAYI GÖRÜNDÜ: ÖN OYUK ARKA OYUKTAN 18.94 mm UZUN**
(beşte dördünde; beşincisinde 9.24 mm). **H5 = "0 eşleşmeyen çift" bunu
göremiyor** ve göremediği tam olarak borç 73'ün cümlesiydi: ön +19 / arka −19
olan bir giysi o sıfırda **KUSURSUZ** okunur.

**KÖK AÇIK KALDI VE ADIYLA YAZILDI:** `sleeve_cap` motorda **TEK ve BÖLÜNMEMİŞ**
bir yay (`sleeve.cpp:194`, `locket.cpp:379`); kapağın hangi yarısının ön oyuğa
gittiğini söyleyen **bir beyan yok** ve uydurmak **§3.10 ihlali**. Kapatmanın
tek yolu **motorun kapağı omuz çentiğinde ikiye ilan etmesi** — o bir **faz
işi**, bir kapı düzeltmesi değil. **Borç 73 AÇIK KALIYOR, ama artık KÖR DEĞİL.**

**HİÇBİR EŞİK GEVŞETİLMEDİ, HİÇBİR TABAN KESİLMEDİ.** H5'in kendisi **0/5**'te
duruyor, `CIRCIR SAĞLAM`, `vitrin_check` · `landing_truth_check` · `gen-vitrin`
ayrıştırıcısı **EXIT 0** (yeni blok iki cırcır bloğunun **DIŞINA**, `H10e`
bloğundan sonra basılıyor).

⚠ **BUNUN BEDELİ VAR VE YAZIYORUM:** `engine/tests/hedef_kosu.mjs`'in blob'u
**`7370b86d` → değişti.** Bölüm 0'daki tablo o satırda **artık geçerli değil**;
değiştiren **hakemdir** (§3.8 md.1'in kendi izni), faz ajanı **değil**, ve
değişiklik **yalnız bir `console.log` bloğudur** — tek bir eşik, tek bir sayı,
tek bir karşılaştırma dokunulmadı.

---

## 9. SAPMA SORUSU — **ÜÇ BACAK, ÜÇÜ DE ÖLÇÜLDÜ**

> *"Bir yabancı bu siteye gelip **ne aldığını anlayabiliyor**, **kalıp + flat
> indirebiliyor** ve **parasını verebiliyor** mu?"*

### 9a. **NE ALDIĞINI ANLIYOR MU? — EVET.** ✅

Canlı düz metni okudum. Beş saniyelik yüzeyde: *"A photo goes in. A **pattern**,
a **flat** and a **sewing guide** come out."* + `10/10` + `8 fixed sizes` +
`on-device`. Ve ürünün **üç sınırı da indirmeden ÖNCE** sayfada:
**strapless + sebebi**, **beş kırmızı adıyla**, *"a pattern that validates is
not the same as a pattern that sews up"*.

### 9b. **KALIP + FLAT İNDİREBİLİYOR MU? — MOTOR TARAFINDA EVET, TARAYICIDA DOĞRULANMADI.** ⚠

`indir_check` **EXIT 0** (`KOKEN_ALANLARI` 39, edit kolu 9 kalem), inen PDF
**1:1** (kalibrasyon karesi **30.000 mm**), dört spec **dört ayrı DXF hash**,
`al_dene_check` **EXIT 0**, `H1 10/10`. Zincirin her halkası bir kapının
altında. 🚨 **AMA GERÇEK BİR TARAYICIDA HİÇ TIKLANMADI — on yedinci faz
(borç 96). Bu makinede `chromium`/`google-chrome` YOK, Playwright/Puppeteer
YOK.** *"Yabancı gerçekten indirebiliyor"* cümlesi bugün **DOĞRULANMADI**, ve
kapanışın en üstüne öyle yazıyorum.

### 9c. **PARASINI VEREBİLİYOR MU? — HAYIR. ÖLÇTÜM: SIFIR ÖDEME YOLU.** 🔴

```
canlı index.html'deki "stripe" geçişleri: 5  -> BEŞİ DE bir kumaş DOKUSU
                                            değişkeni (index.html:472 const stripe=…)
ödeme sağlayıcısı (stripe/gumroad/lemonsqueezy/checkout): web/ + backend/'de YOK
"Join the Beta" / "Become a Beta Partner" -> href="#top", betaemail alanına odaklanıyor
```

**Tek dönüşüm bir E-POSTA BEKLEME LİSTESİ.** Bir yabancı bugün stitchu'ya
**para veremez.** **Bu F9'un kusuru DEĞİL** — kart açıkça *"Bu kart FİYAT KOYMAZ
ve ÖDEME KURMAZ"* diyor — ama **koşunun sapma sorusunun üçte biri bugün HAYIR**
ve kapanışa öyle yazılıyor.

### 9d. **SAPMA SORUSUNUN BİRİNCİ YARISI — SAYFA *"YABANCI FOTOĞRAF YÜKLENEMİYOR"* DİYOR MU?**

## 🚨 **HAYIR — VE KARTIN VARSAYIMI YANLIŞ ÇIKTI. ÖLÇTÜM.**

Kart *"§3.9'un doğru sonucu, sıfır ücretli API"* diyerek sayfanın yabancı
fotoğrafı **reddettiğini** varsayıyor. **Reddetmiyor.** Ölçtüm:

```
web/js/config.js:4   BACKEND_URL = 'https://stitchu-api.damummyphus.workers.dev'
web/js/analyze.js:5  photoAvailable = () => Boolean(BACKEND_URL)     -> TRUE
web/js/create.js:779 if (photoAvailable()) { … dosya seçici + "upload" düğmesi }
```

`BACKEND_URL` **canlıda dolu**, yani yükleme bloğu **gizlenmiyor, GÖSTERİLİYOR.**
Ve Worker **ayakta ve sitenin Origin'ini kabul ediyor** — ücret harcamadan
sınadım:

```
GET  /api/analyze                              -> 401 {"error":"Unauthorized"}
POST /api/analyze  (Origin: stitchu.nosey…, gövde {} — GÖRSEL YOK)
                                               -> 400 {"error":"Invalid request"}
```

**400, 401 değil.** Yani Worker sitenin isteğini **kabul ediyor** ve modele
gitmeden **önce doğruluyor**. Sonuç: **bir yabancı bugün canlı sayfaya kendi
fotoğrafını yükleyebilir ve bu Damla'nın hesabından ücretli bir Claude vision
çağrısı harcar.**

**Vitrin bunu ÖRTMÜYOR ama İLAN DA ETMİYOR:** canlı landing *"upload a photo"*u
**iki kez** yazıyor ve *"if you upload a photo, that call is the only thing that
leaves the page"* diyor — **doğru cümleler**, ama **hiçbir yerde bu yolun
Damla'ya PARAYA MAL OLDUĞU, bir kotası olduğu ya da kapatılabileceği
yazmıyor.** `analyze.js` 429 için bir mesaj taşıyor (*"Too many photos right
now"*), yani **bir kota VAR** — ama **sayısı yayınlanmıyor ve ben ölçmedim.**

⚠ **§3.9 İHLALİ DEĞİL:** §3.9 **koşuya** (ajan/kapı/hakem) sıfır ücretli çağrı
şart koşuyor ve koşu boyunca **sıfır** harcandı — `al_dene` yolu bankalı,
`hedef_kosu` mühürlü fixture. **Ücret riski KOŞUDA değil, CANLI SİTEDE ve
TANIMADIĞIN İNSANLARDA.** **Bu bir iş kararıdır → DAMLA'YA.**
⚠ **Uçtan uca gerçek bir yükleme YAPILMADI** (para harcardı). **DOĞRULANMADI.**
