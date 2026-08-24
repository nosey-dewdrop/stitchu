# V5-B — overlay-png KANIT KAPISI (kart V5-B2)

Alet: `engine/tools/bugra/overlay-png.mjs`. Motorun kalıp parçasını satın alınmış
Buğra kalıbının aynı bedendeki halkasıyla 1:1 mm ölçeğinde üst üste basar,
yanına sayısal fark tablosu çıkarır.

> **BU BİR KAPI DEĞİL.** Fark tablosu BİLGİDİR, eşik değildir. Buradaki hiçbir
> sayıdan "kalıp yanlış" hükmü çıkarılmaz (v6 §7.3, aletin kendi başlığı sat. 29-31).

---

## 1. `GECE/log/V5-B.overlay/` — 12 dosyanın `test -f` doğrulaması

Komut:
```
for f in back-body collar-lining collar front-body lower-sleeve upper-sleeve; do
  for e in png svg; do p="GECE/log/V5-B.overlay/locket_top-36-$f.$e";
  test -f "$p" && echo "OK  $(pwd)/$p" || echo "MISSING $p"; done; done
```
Çıktı (12/12 OK, MISSING 0):
```
OK  /Users/damummyphus/damla_projects_2026/stitchu/GECE/log/V5-B.overlay/locket_top-36-back-body.png
OK  /Users/damummyphus/damla_projects_2026/stitchu/GECE/log/V5-B.overlay/locket_top-36-back-body.svg
OK  /Users/damummyphus/damla_projects_2026/stitchu/GECE/log/V5-B.overlay/locket_top-36-collar-lining.png
OK  /Users/damummyphus/damla_projects_2026/stitchu/GECE/log/V5-B.overlay/locket_top-36-collar-lining.svg
OK  /Users/damummyphus/damla_projects_2026/stitchu/GECE/log/V5-B.overlay/locket_top-36-collar.png
OK  /Users/damummyphus/damla_projects_2026/stitchu/GECE/log/V5-B.overlay/locket_top-36-collar.svg
OK  /Users/damummyphus/damla_projects_2026/stitchu/GECE/log/V5-B.overlay/locket_top-36-front-body.png
OK  /Users/damummyphus/damla_projects_2026/stitchu/GECE/log/V5-B.overlay/locket_top-36-front-body.svg
OK  /Users/damummyphus/damla_projects_2026/stitchu/GECE/log/V5-B.overlay/locket_top-36-lower-sleeve.png
OK  /Users/damummyphus/damla_projects_2026/stitchu/GECE/log/V5-B.overlay/locket_top-36-lower-sleeve.svg
OK  /Users/damummyphus/damla_projects_2026/stitchu/GECE/log/V5-B.overlay/locket_top-36-upper-sleeve.png
OK  /Users/damummyphus/damla_projects_2026/stitchu/GECE/log/V5-B.overlay/locket_top-36-upper-sleeve.svg
```

---

## 2. Yeniden koşu — KOŞTU, YENİDEN KOŞTURULMADI

Alet kart yazıldıktan sonra bugün (25 Ağu 01:30-01:35) yeniden koşmuş, çıktısı diskte:
- fark tablosu: `/Users/damummyphus/damla_projects_2026/stitchu/GECE/log/V5-B2.rerun.txt`
- levhalar: `/Users/damummyphus/damla_projects_2026/stitchu/GECE/log/V5-B2.overlay/` (6 PNG + 6 SVG)

Koşmuş iş ikinci kez koşturulmadı. `engine/build/bugra-dump` diskte var
(667800 bayt, 24 Ağu 16:46) ve `engine/build/CMakeCache.txt` içinde
`CMAKE_BUILD_TYPE:STRING=Release` — yani kart md.2'nin Release şartı sağlanmış,
yeniden kurmaya gerek kalmadı.

---

## 3. Fark tablosu satır satır karşılaştırma — BİREBİR AYNI

Komut (tek farkı bilerek eleyip — çıktı klasörünün adı `V5-B.overlay` vs `V5-B2.overlay`):
```
diff <(grep -v 'PNG 6 adet' GECE/log/V5-B.run-locket-36.txt) \
     <(grep -v 'PNG 6 adet' GECE/log/V5-B2.rerun.txt)
```
Çıktı: **boş, exit 0 — 0 satır fark.** Bugünün koşusu kesilen oturumun bastığı
sayıların hepsini basamak basamak aynı bastı. Fark bulunan tek satır elenen o
`PNG 6 adet -> <klasör>` satırıdır ve içeriği değil hedef klasörü farklıdır.

Levhaların kendisi de bayt bayt aynı (`md5 -q`, 12/12 SAME):
```
SAME back-body.png     9584af07c0c4a330906c89d0f8907909
SAME back-body.svg     f9ad972baa09acec529fd2d08a88dae8
SAME collar-lining.png aa936917e4544180e8bc4961b605503e
SAME collar-lining.svg a6dd1a295d8433b542e6bd777d304687
SAME collar.png        6e84cde68be2b876e22f80f957cf67c9
SAME collar.svg        75dc8ac4146908f824766e598a95cbd9
SAME front-body.png    26c9cedc525a8d57a18168928d6eefc0
SAME front-body.svg    3abff30a6645f5a0cc3f97d3662f08c9
SAME lower-sleeve.png  b21ca53a891045c0a2a5569381c781e1
SAME lower-sleeve.svg  f4a42029fcb26cace0b4b64b9aa3e9c2
SAME upper-sleeve.png  57e1beabbdf8d8f48100ef039a9df6fb
SAME upper-sleeve.svg  5e49108116cff8435dc32f73ac6656ae
```
Yani alet deterministik: aynı ağaçtan aynı raster bile çıkıyor.

### locket_top — beden 36, ÖLÇÜLEN SAYILAR
Basan komut: `node engine/tools/bugra/overlay-png.mjs locket --size=36`
Tablo: `/Users/damummyphus/damla_projects_2026/stitchu/GECE/log/V5-B2.rerun.txt`

| parça | Δbbox_W mm | Δbbox_H mm | Δçevre mm | Δçevre % | sapma_med | sapma_p95 | sapma_max | PNG (mutlak yol) |
|---|---|---|---|---|---|---|---|---|
| Front Body | 13.24 | -35.25 | 39.61 | 2.39 | 21.92 | 50.85 | 57.73 | `/Users/damummyphus/damla_projects_2026/stitchu/GECE/log/V5-B2.overlay/locket_top-36-front-body.png` |
| Back Body | 25.02 | -18.75 | -39.12 | -3.10 | 20.85 | 50.32 | 51.83 | `/Users/damummyphus/damla_projects_2026/stitchu/GECE/log/V5-B2.overlay/locket_top-36-back-body.png` |
| Upper Sleeve | -32.47 | -22.33 | -86.75 | -7.35 | 11.09 | 25.70 | 32.70 | `/Users/damummyphus/damla_projects_2026/stitchu/GECE/log/V5-B2.overlay/locket_top-36-upper-sleeve.png` |
| Lower Sleeve | 27.53 | 0.34 | 18.32 | 2.18 | 12.05 | 29.65 | 31.71 | `/Users/damummyphus/damla_projects_2026/stitchu/GECE/log/V5-B2.overlay/locket_top-36-lower-sleeve.png` |
| Collar | 109.16 | 9.91 | 378.40 | 66.57 | 23.57 | 68.21 | 76.46 | `/Users/damummyphus/damla_projects_2026/stitchu/GECE/log/V5-B2.overlay/locket_top-36-collar.png` |
| Collar Lining | 5.11 | 32.54 | 109.90 | 24.27 | 21.15 | 49.24 | 66.26 | `/Users/damummyphus/damla_projects_2026/stitchu/GECE/log/V5-B2.overlay/locket_top-36-collar-lining.png` |

`motor parcasi 6 | Bugra halkasi 7 | validator issue 0`. Yedinci Buğra halkasının
motorda karşılığı yok, sessizce düşürülmedi, tabloya ayrı satır olarak çıktı:
`Bugra EXTRA-TL (not in defter) 175.3x264.49 cevre 833.3`.

Beden notu (aletin kendi bastığı satır): `bugra-dump` gövdesi bust 88 / waist 68 /
hip 94 cm; `geometry-full.json` `sizeChartMM["36"] = {bustMM:880, waistMM:680,
hipMM:940}` ile TAM EŞİT, `["38"] = {920,720,980}`. Yani 36 halkası doğru
karşılıktır, alet "UYUSUYOR" yazdı.

---

## 4. Alet ne yapıyor — kaynaktan, satır numaralı

`overlay-png.mjs` motor tarafını `engine/build/bugra-dump` ikilisini çalıştırıp
JSON okuyarak alıyor (sat. 104-111; ikili yoksa `cmake --build ... --target
bugra-dump --config Release` ile kendisi kuruyor, sat. 105-109), Buğra tarafını
`patterns_real/geometry/geometry-full.json`'dan `pattern` + `sizeGuess` filtresiyle
çekiyor (sat. 114-115); parça eşlemesi bbox tahminiyle değil, `--names` ile iki
listenin elle eşlendiği sabit `NAME_MAP` tablosundan geliyor (sat. 67-87), haritada
olmayan parça "ESLEME YOK" diye raporlanıyor, düşürülmüyor (sat. 205).
**Hizalama usulü:** her iki kontur da kendi bbox min köşesine taşınıyor
(`toOrigin`, sat. 139) — döndürme, en-iyi-oturtma yok; Buğra halkasına ek olarak
`flipY` uygulanıyor (sat. 141), çünkü `geometry-full.json` ham PDF uzayı olduğu
için y YUKARI, motor poligonları y AŞAĞI artıyor (gerekçe sat. 14-20). **Ölçek
kurulmuyor:** mm = mm, SVG kullanıcı birimi 1 = 1 mm, `data-scale="1:1"` levhanın
kendisine yazılıyor (sat. 12, 174); serbest parametre sıfır — tek "ayar" `--px`
ve o sadece rasterin piksel boyu (sat. 97, 222), geometriye girmiyor.
**Sapma sütunu:** `dev = stats(gPoly.map(q => ptPolyDist(q, mPoly)))` (sat. 214),
yani BUĞRA poligonunun her noktasının MOTOR poligonuna dik mesafesi
(`ptPolyDist` sat. 143-154 nokta-doğru-parçası dik mesafesi, uç noktalarda
kırpılmış `u`); `med` / `p95` / `max` bu mesafe dizisinin sırlanmış
istatistikleri (`stats`, sat. 155). Kıyas iki tarafta da KESİM çizgisi üzerinden:
motor `cutPoly` (yoksa `sewPoly`, sat. 210), Buğra'nın basılı konturu defter
gereği zaten kesim çizgisi (sat. 240).

---

## 5. `corset_bustier` modu — KOŞULDU, TAMAMLANDI

Diskteki koşu YARIM kalmıştı: `GECE/log/V5-B2.corset.txt` 6 parça vaat ediyordu
(`motor parcasi 6 | Bugra halkasi 6`) ama tabloda yalnız 2 satır vardı, klasörde
2 PNG + 3 SVG duruyordu — `corset_bustier-36-front-body-center.svg` yazılmış,
PNG'si hiç doğmamıştı. Tamamlandı.

Komut:
```
node engine/tools/bugra/overlay-png.mjs corset --size=36 --out=GECE/log/V5-B2.corset \
  > GECE/log/V5-B2.corset.txt 2>&1
```
Sonuç: `motor parcasi 6 | Bugra halkasi 6 | validator issue 0`, `PNG 6 adet`,
6 PNG + 6 SVG. `test -f` 12/12 OK, MISSING 0.

### corset_bustier — beden 36, ÖLÇÜLEN SAYILAR
Tablo: `/Users/damummyphus/damla_projects_2026/stitchu/GECE/log/V5-B2.corset.txt`

| parça | Δbbox_W mm | Δbbox_H mm | Δçevre mm | Δçevre % | sapma_med | sapma_p95 | sapma_max | PNG (mutlak yol) |
|---|---|---|---|---|---|---|---|---|
| Upper Cup | 16.84 | -23.02 | 95.44 | 11.49 | 19.65 | 117.89 | 148.49 | `/Users/damummyphus/damla_projects_2026/stitchu/GECE/log/V5-B2.corset/corset_bustier-36-upper-cup.png` |
| Lower Cup | 54.13 | -159.75 | -216.40 | -29.52 | 99.39 | 159.54 | 159.75 | `/Users/damummyphus/damla_projects_2026/stitchu/GECE/log/V5-B2.corset/corset_bustier-36-lower-cup.png` |
| Front Body Center | 80.52 | -109.29 | -33.15 | -4.10 | 14.13 | 108.28 | 109.29 | `/Users/damummyphus/damla_projects_2026/stitchu/GECE/log/V5-B2.corset/corset_bustier-36-front-body-center.png` |
| Front Body Side | 25.74 | -28.82 | 14.69 | 2.37 | 23.14 | 29.25 | 30.04 | `/Users/damummyphus/damla_projects_2026/stitchu/GECE/log/V5-B2.corset/corset_bustier-36-front-body-side.png` |
| Back Body Side | -82.10 | 372.18 | 636.48 | 123.12 | 31.29 | 124.04 | 145.31 | `/Users/damummyphus/damla_projects_2026/stitchu/GECE/log/V5-B2.corset/corset_bustier-36-back-body-side.png` |
| Back Body Center | -366.08 | 194.70 | -296.49 | -26.10 | 142.00 | 346.94 | 375.71 | `/Users/damummyphus/damla_projects_2026/stitchu/GECE/log/V5-B2.corset/corset_bustier-36-back-body-center.png` |

corset tarafında "motor karşılığı yok" satırı YOK: 6 motor parçası ile 6 Buğra
halkası birebir eşleşti (`NAME_MAP.corset_bustier`, sat. 76-86).

**Hüküm çıkarılmıyor.** İki satır (Back Body Side +123.12%, Back Body Center
−26.10%) aletin kendi uyarısının tarif ettiği durumu taşıyor olabilir: Buğra'nın
`Back Body (center fold)` parçası ADINDA "center fold" taşıyor, yani ORTADAN
KATLI kesilen YARIM bir kalıp (kaynak sat. 82-85), motorun kesim talimatı da
`cut 1 on fold`. Kat/ayna farkı bbox ve çevre farkının kaynağı olabilir; bu
DOĞRULANMADI, ayrıştırma yapılmadı.

---

## Yapılamayan
- Yok. Kartın 5 maddesi de kapandı.

## Kart dışı fark edilen (dokunulmadı, yazılıyor)

**1. `raster.mjs`'in 60 sn timeout'u headless Chrome'u öldürmüyor — koşuyu asan
kök sebep bu.** `engine/tools/raster.mjs` `execFileSync(CHROME, [...],
{ timeout: 60000 })` çağırıyor. Node timeout'ta SIGTERM yolluyor, bu durumdaki
headless Chrome SIGTERM'i yutuyor ve süreç yaşamaya devam ediyor. Ölçüm:
```
ps -o pid,lstart,etime -p 83166
 83166  Sal 25 Ağu 01:38:28 2026   19:00+   (hala S durumunda)
ps -o command= -p 83166 | tr ' ' '\n' | grep -E 'user-data-dir|screenshot'
 --user-data-dir=/var/folders/.../T/stitchu-raster-z16e2s/chrome-profile
 --screenshot=/Users/.../GECE/log/V5-B2.corset/corset_bustier-36-front-body-center.png
```
83166, 01:38'de ölen İLK corset koşusundan artakalan öksüz Chrome'du ve 19 dakika
boyunca `front-body-center.png`'yi yazmadan asılı kaldı. Bugünkü koşu tam da o
parçada ~8 dakika bekledi (`corset_bustier-36-front-body-side.svg` 01:49'da yazıldı,
PNG'si 01:57'de düştü). **Öksüz 83166 `kill -9` ile alınınca koşu hemen ilerledi**
ve kalan 3 parçayı 01:57-01:59 arasında, parça başına ~1 dakikada bitirdi.
Yani `raster.mjs` sat. 43-47'deki "her çağrıya ayrı `--user-data-dir`" dersi tek
başına yetmiyor: ayrı profille bile artakalan bir headless Chrome sonraki koşuyu
kilitliyor. Düzeltme YAPILMADI (kart `raster.mjs`'e dokunmayı kapsamıyor, alet
"iyileştirme" yasağı var). İzi: koşunun sonunda hâlâ 1 öksüz Chrome duruyordu,
elle `pkill -9 -f "Google Chrome --headless.*stitchu-raster"` ile alındı.

**2. `--px` varsayılanı 1200, `raster.mjs`'in kendi varsayılanı 2000.**
`overlay-png.mjs` sat. 97 `PX = Number(opt('px','1200'))`; `raster.mjs`'in
`shortSide` varsayılanı 2000 ve o dosyanın kendi gerekçesi Etsy'nin yayınlanmış
2000 px kısa-kenar asgarisi. Bu levhalar kanıt levhası, listeleme fotoğrafı değil,
o yüzden 1200 bir çelişki DEĞİL — ama bu levhalar Etsy'ye konamaz. Not düşülüyor.

**3. `Collar` satırı tabloda en büyük sapan (+66.57% çevre, +109.16mm bbox_W).**
Sebep ayrıştırılmadı, hüküm çıkarılmadı. Motorun kesim talimatı `cut 2
(1 upper + 1 under) + 1 interfacing`, Buğra halkası tek kontur — kat/adet farkı
olabilir, DOĞRULANMADI.

**4. Buğra `EXTRA-TL (not in defter)` halkası.** locket 36'da motorun karşılığı
olmayan 7. halka; 175.3x264.49mm, çevre 833.3mm. `patterns_real/BUGRA-DEFTER.md`'de
kaydı yok. Ne olduğu araştırılmadı.

**5. Görmediğim/erişemediğim.** Levha PNG'lerinin İÇİNE bakılmadı (RULES 3 gereği
"baktım" denmez; burada verilen şey dosya yolu ve komut çıktısıdır — konturların
görsel yorumu Damla'nın kapısıdır). `bugra-dump.cpp` yalnız okundu
(`engine/CMakeLists.txt:349-350` hedefi tanımlıyor), gövde sayıları kaynaktan
değil aletin bastığı satırdan alındı. `ctest` bu kartta koşulmadı — bu bir kapı
değil, `engine/CMakeLists.txt`'e dokunulmadı, `add_test` eklenmedi.
