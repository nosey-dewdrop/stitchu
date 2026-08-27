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
