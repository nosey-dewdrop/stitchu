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
