# V7-E — KOL GÖRÜNÜR: SEVK EDİLEN HATTAN PNG ARTEFAKTI

RULES invariant 3'ün istediği görsel çıktı üretildi. Bu dosya PNG'lere BAKMIYOR;
yolları, üreten komutu, baytı ve sayıyı veriyor. Hüküm yok.

## 0. SEVK EDİLEN HAT — DOĞRULANDI (kart bunu varsayıyordu, ölçüldü)

`render-pages.mjs` `engine/dist/stitchu-engine.js` yükler; kartın sevk hattı ise
`web/vendor/stitchu-engine.js`. İkisi AYNI KOD:

```
$ shasum -a 256 engine/dist/stitchu-engine.js web/vendor/stitchu-engine.js
fe570bae84137ad3354d8ca3935718e3e375bed8e4f7d57d3edf10b319020887  engine/dist/stitchu-engine.js
f4281f2905bcf1f944771005432ae4dd8a6ff46b102f920e9589bbb8585dde04  web/vendor/stitchu-engine.js
```

sha farklı çünkü vendor kopyası başa **127 baytlık** tek satırlık kaynak-damgası
yorumu ekliyor (`// stitchu source-stamp 7023c808195429b3 …`). Ölçüldü:
uzunluk farkı tam 127, ve `vendor.includes(dist)` = **true** — yani vendor,
dist'in bayt bayt aynısı + önek yorum. Render'lar sevk edilen koddan çıktı.

Yüzey motoru (`surfacepattern`) kartın dediği gibi sevk EDİLMİYOR
(`grep -c surfacepattern engine/build-wasm.sh` = 0), ondan render alınmadı.

## 1. KOL İÇEREN KALIP PARÇALARI (EU38)

Üreten komut (TEK komut, üç çıktının hepsini basar):

```
node engine/tools/render-pages.mjs /tmp/v7e-pages
```

Beden: aracın kendi EU38 gövdesi — `bust 90 · waist 72 · hip 98 · shoulder 38 ·
backLength 40 · armLength 58 · neck 36` (render-pages.mjs:24).
Çıktı `strip.png` = basılan bütün A4 sayfaları YERİNDE, yani "bantlanmış" hal.
Kopyalandı: `cp /tmp/v7e-pages/<ad>/strip.png GECE/log/V7-E.png/pattern-<ad>-EU38.png`
(sha256 kopyadan sonra da render-pages'in stdout'undaki sha ile aynı — aşağıda).

| PNG yolu | boyut (px) | bayt | sha256 (ilk 16) | parça sayısı | kol parçası |
|---|---|---|---|---|---|
| `GECE/log/V7-E.png/pattern-placket-shirt-dress-EU38.png` | 1800×4737 | 531466 | `2d4e45d9e94ce909` | 10 parça / 9 kağıt / 29 A4 sayfa | **Sleeve** |
| `GECE/log/V7-E.png/pattern-puff-sleeve-dress-EU38.png` | 1800×7105 | 779215 | `00532a35e2529c34` | 10 parça / 9 kağıt / 27 A4 sayfa | **Puff Sleeve** |
| `GECE/log/V7-E.png/pattern-black-buttoned-blouse-EU38.png` | 1800×3947 | 420626 | `4f5ea9f85b36b410` | 6 parça / 5 kağıt / 14 A4 sayfa | **Sleeve** |

Parça listeleri yanlarındaki `.info.txt` dosyalarında (render-pages'in kendi
çıktısı, kopyalandı): `pattern-<ad>-EU38.info.txt`.

### 1b. Kol paneli GERÇEKTEN çiziliyor — sayı (kart md.5)

PNG'ye bakılmadı; parça aynı motordan JSON olarak çekilip sayıldı
(`engine.draftJSON(spec, EU38body)`, aynı `engine/dist/stitchu-engine.js`):

| spec | kol parçasının ADI | commands | cutLine noktası | markings |
|---|---|---|---|---|
| placket-shirt-dress (`sleeveStyle:'straight'`, `sleeveLength:'long'`) | `Sleeve` | 7 | **52** | 4 |
| puff-sleeve-dress (`sleeveStyle:'straight'`, `sleeveCap:2`) | `Puff Sleeve` | 7 | **74** | 10 |
| black-buttoned-blouse (`sleeveStyle:'straight'`, `sleeveLength:'short'`) | `Sleeve` | 7 | **54** | 4 |

`commands` = kalıp konturunun yol komutu sayısı (M + kübik segmentler),
`cutLine` = dikiş payı ofsetlenmiş kesim çizgisinin nokta sayısı. Üçünde de kol
sıfır olmayan bir poligon taşıyor, yani panel boş değil.

## 2. DÖRT AYRI KOL GEOMETRİSİNİN FLAT'İ

Kalem: `engine/tools/render-garment-flat.mjs` (sevk edilen flat kalemi,
`contract/flat-convention-v1.json` kanununa bağlı). Rasterleyici:
`engine/tools/raster.mjs` (headless Chrome, kısa kenar 2000 px = Etsy listeleme
minimumu). **Yeni alet yazılmadı** — iki mevcut modül tek satırlık bir
`node --input-type=module -e` çağrısıyla koşuldu:

```
node --input-type=module -e "
import { renderGarmentFlat } from './engine/tools/render-garment-flat.mjs';
import { rasterise } from './engine/tools/raster.mjs';
import { writeFileSync } from 'node:fs';
const BASE = { garment:'top', neckline:'crew', shaping:'darts', topLength:'hip', sleeveLength:'short' };
for (const v of ['straight','balloon','cap','none']) {
  const svg = renderGarmentFlat(null, { ...BASE, sleeveStyle: v });
  const sp = 'GECE/log/V7-E.png/flat-sleeve-'+v+'.svg';
  writeFileSync(sp, svg);
  rasterise(sp, 'GECE/log/V7-E.png/flat-sleeve-'+v+'.png', 2000);
}"
```

`BASE` uydurulmadı: `engine/tests/flat_expresses_spec_check.mjs:131`'in TABAN
SPEC'i birebir kopyalandı, böylece aşağıdaki kapı sayıları bu dosyalarla aynı
çizimden geliyor.

| PNG yolu | boyut (px) | bayt | sha256 (ilk 16) | SVG bayt | `data-engine-gap` damgası |
|---|---|---|---|---|---|
| `GECE/log/V7-E.png/flat-sleeve-straight.png` | 4467×2000 | 207191 | `d5bffe925062c6a9` | 3551 | `sleeveStyle=straight:sleeve` |
| `GECE/log/V7-E.png/flat-sleeve-balloon.png` | 4848×2000 | 244841 | `9700643d4cbbd77a` | 7551 | `sleeveStyle=balloon:sleeve+gatheredOverlayLayer` |
| `GECE/log/V7-E.png/flat-sleeve-cap.png` | 4467×2000 | 180238 | `d870d1055eb8f214` | 3526 | `sleeveStyle=cap:sleeve` |
| `GECE/log/V7-E.png/flat-sleeve-none.png` | 3247×2000 | 141423 | `26ca0686457b00b5` | 2551 | (yok — sicilde boşluksuz) |

Yanlarında aynı adla `.svg` kaynakları da duruyor (rasterin girdisi;
`raster.mjs` viewBox'ı dosyadan okuduğu için SVG kalmak zorunda).

### 2b. Dördü GERÇEKTEN ayrı geometri — sayı

Bağımsız hakem (bu gece yazılmadı, mevcut kapı):

```
node engine/tests/flat_expresses_spec_check.mjs
```

```
sleeveStyle straight         eleman  10  kontur 2705.08u
sleeveStyle none             eleman   6  kontur 1917.76u
sleeveStyle balloon          eleman  54  kontur 2996.36u
sleeveStyle cap              eleman  10  kontur 2354.75u
sleeveStyle bishop           eleman  54  kontur 2996.36u   (= balloon, beyanlı eşanlam)
sleeveStyle fitted           eleman  10  kontur 2705.08u   (= straight, beyanlı eşanlam)
sleeveStyle puff             eleman  54  kontur 2996.36u   (= balloon, beyanlı eşanlam)
sleeveStyle set-in           eleman  10  kontur 2705.08u   (= straight, beyanlı eşanlam)
```

Dört kanonik değerin dördü de "IFADE EDILDI" (birbirinden farklı kontur).
Sekiz yazımın dördü beyanlı eşanlam ve eşanlamı ile ÖZDEŞ çiziyor — kartın
"4 kanonik + 4 beyanlı eşanlam" zemini bu koşuda birebir doğrulandı.
Kanonik dördün kontur farkları: straight↔cap 350.33u, straight↔balloon 291.28u,
none en küçük (1917.76u).

## 3. DÜRÜSTLÜK ŞARTI (kart md.4)

Hiçbir PNG'ye bakılıp hüküm verilmedi. Ölçülen tek görsel özellik: dosyanın
BOŞ/bozuk olmadığı.

```
$ cd GECE/log/V7-E.png && for f in *.png; do test -f "$f" && file -b "$f"; done
```

7 PNG'nin 7'si geçerli PNG başlığı taşıyor, en küçüğü 141423 bayt, 0 bayt olan
YOK, render hatası YOK (`render-pages.mjs` `issues: []` bastı, üç spec için de).

## 4. GİTIGNORE

```
$ git check-ignore -v GECE/log/V7-E.png/*.png ; echo exit=$?
exit=1
```

Hiçbiri gitignore'a takılmıyor; PNG'ler commit'e girdi.
