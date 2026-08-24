# V4-D — ESKİ | YENİ PANOSU: konvansiyonun görünen karşılığı

Tarih: 2026-08-24 · Kart: `GECE/KART/V4-D.md` · Etiket: SIRALI (tur 4)
ESKİ taraf = `c396fb4` · YENİ taraf = bugünkü HEAD `c993491`

> **HÜKÜM DAMLA'NINDIR.** Bu dosya hüküm içermez. Ne "oldu" der ne "Etsy'lik" der.
> Kırpma, retuş, yeniden çizim YOK — çıktı neyse o basıldı.

---

## 0. BASILAN PNG'LER (RULES 3: yol yoksa adım yapılmamıştır)

```
/Users/damummyphus/damla_projects_2026/stitchu/GECE/log/V4-D.pano/board-eski-yeni-1.png
/Users/damummyphus/damla_projects_2026/stitchu/GECE/log/V4-D.pano/board-eski-yeni-2.png
/Users/damummyphus/damla_projects_2026/stitchu/GECE/log/V4-D.pano/board-eski-yeni-3.png
```

15 satır × 2 sütun = 30 hücre. Sayfa 1-2 = V4-C'nin 10 hücresi (9 stil + shell-flat),
sayfa 3 = **kol ailesi** (bu gecenin asıl görünen farkı, 5 satır).

Panoyu basan **tek komut**:
```
node engine/tools/flat-board.mjs GECE/log/V4-D.pano \
  --eski GECE/log/V4-C.pano \
  --eski-ad 'ESKİ — c396fb4 (diskten, yeniden üretilmedi)' \
  --yeni-ad 'YENİ — bugünkü HEAD c993491' \
  --ek GECE/log/V4-D.kol-eski GECE/log/V4-B.kol
```

ESKİ kol SVG'leri repoda kalıcı: `GECE/log/V4-D.kol-eski/sleeve-{none,set,raglan,puff,cap}.svg`
(`c396fb4` worktree'sinden üretildi, aşağıda kanıtı).

Yan çıktı SVG'leri aynı dizinde (`board-eski-yeni-{1,2,3}.svg` + 10 stil SVG'si).

### ESKİ TARAF GERÇEKTEN ESKİ Mİ — KANIT

- **10 stil hücresi:** `GECE/log/V4-C.pano/*.svg` diskten okundu, **yeniden üretilmedi**.
  `flat-board.mjs`'ye eklenen `--eski` bayrağı sol sütunu diskten alır; dosya yoksa
  sessiz geçmez, yüksek sesle çöker.
- **Kol ailesi:** ESKİ tarafın diskte karşılığı YOKTU. `c396fb4` ayrı bir detached
  worktree'ye (`git worktree add --detach /tmp/v4d-eski c396fb4`) alındı ve kalem
  ORADAN koşturuldu. Üretilen sha256 önekleri `engine/tests/flat_expresses_spec_check.mjs`
  başlığının 24 Ağustos ölçümüyle **birebir tutuyor** (`0b647b4f…`, `70cb9c78…`,
  `a90b7162…`) — yani sol sütun uydurma değil, o commit'in gerçek çıktısı.
- **YENİ kol SVG'leri** `GECE/log/V4-B.kol/` altındakilerin ta kendisi: HEAD'de yeniden
  koşturuldu ve **beşinin beşi de bayt bayt aynı** çıktı (`/tmp/gen-yeni-kol.mjs`).

---

## 1. ★ EN SERT BULGU — 10 STİL HÜCRESİNİN 10'U DA BAYT BAYT AYNI

Bu gecenin iki kök düzeltmesi (V4-A omuz çıkarımı, V4-B kol ifadesi) V4-C panosundaki
**hiçbir hücreyi kımıldatmadı.**

komut: `cmp GECE/log/V4-C.pano/<stil>.svg GECE/log/V4-D.pano/<stil>.svg`

| hücre | ESKİ bayt | YENİ bayt | hüküm |
|---|---|---|---|
| `dress_princess_scoop_aline` | 12048 | 12048 | **AYNI** |
| `gore_skirt_dress` | 12491 | 12491 | **AYNI** |
| `wrap_dress` | 13939 | 13939 | **AYNI** |
| `top_crew_dart` | 2385 | 2385 | **AYNI** |
| `top_boat_princess` | 6943 | 6943 | **AYNI** |
| `peterpan_puff` | 30113 | 30113 | **AYNI** |
| `top_princess_peplum` | 8796 | 8796 | **AYNI** |
| `top_bandeau_shirred_peplum` | 11035 | 11035 | **AYNI** |
| `dress_bandeau_circle` | 7096 | 7096 | **AYNI** |
| `shell-flat EU38` | 1468 | 1468 | **AYNI** |

**SEBEP ÖLÇÜLDÜ, TAHMİN DEĞİL.** Panonun kendi altyazısı her hücrede şunu yazıyor:
`render-garment-flat.mjs → flat-engine/_engine-full.mjs renderStyle()`.
Yani 9 stilin **9'u da referans kalem yoluna düşüyor** (V4-C KART DIŞI md.5, bugün
hâlâ geçerli), 10.'su C++ `shell-flat`. Bu gecenin iki düzeltmesi **üretim kaleminde**
yaşıyor. Kanunun (`contract/flat-convention-v1.json`) bağladığı kalem ile bu panoyu
basan kalem **AYNI DEĞİL** — o yüzden düzeltmeler bu panoda görünmüyor.

komut: `grep -o 'render-garment-flat.mjs[^<]*' GECE/log/V4-D.pano/board-eski-yeni-{1,2}.svg | sort | uniq -c`
→ `5 + 4 = 9` satırın 9'u da `→ flat-engine/_engine-full.mjs renderStyle() · bayt bayt AYNI`.

---

## 2. KOL AİLESİ — BU GECENİN GÖRÜNEN FARKI (sayfa 3)

Aynı taban spec (`{garment:top, neckline:crew, shaping:darts, topLength:hip,
sleeveLength:short}`), tek oynatılan alan `sleeveStyle`.

| değer | ESKİ bayt (c396fb4) | ESKİ sha256[0:16] | YENİ bayt (HEAD) | YENİ sha256[0:16] | YENİ eleman | YENİ kontur |
|---|---|---|---|---|---|---|
| none | 2537 | `0b647b4f1df3cfa3` | 2551 | `d64ce69bcffd5efb` | 6 | 1917.76u |
| set | 3495 | `70cb9c7881ce0c0a` | 3546 | `d4c15d380632d885` | 10 | 2705.08u |
| raglan | 3495 | `70cb9c7881ce0c0a` ← set ile **AYNI** | 4786 | `3474b82e52871028` | 18 | 3497.78u |
| puff | 3495 | `70cb9c7881ce0c0a` ← set ile **AYNI** | 7548 | `df139544172c5516` | 54 | 2996.36u |
| cap | 3471 | `a90b71628ae22f13` | 3526 | `2e4063240e28c836` | 10 | 2354.75u |

ESKİ tarafta `set == raglan == puff` **bayt bayt** doğrulandı
(`cmp` 9 çiftin 9'unda sessiz). YENİ tarafta 10 çiftin 10'u ayrışıyor, ölçü sha değil
GEOMETRİ (çizen eleman kümesi + kontur) — kapı çıktısı §3'te.

**İkinci görünen fark, aynı satırlarda:** omuz ucu.
`grep -o 'data-shoulder-x="[^"]*"'` → ESKİ **78** (5/5), YENİ **70.1799** (5/5).
V4-A'nın ölçülmüş düzeltmesi (Buğra Locket EU38 Back Body oranı 0.9570) panoda
**dar omuz** olarak görünüyor.

**Üçüncü fark, sessiz değil adlandırılmış:** ESKİ tarafta `data-engine-gap` **5/5 YOK**;
YENİ tarafta 4/5 var (`sleeveStyle=set:sleeve`, `=raglan:unknown`,
`=puff:sleeve+gatheredOverlayLayer`, `=cap:sleeve`). Kalıp motorunun kesemediği şey
artık SVG'nin kökünde adıyla duruyor.

---

## 3. KONVANSİYON KAPISI — TAM STİL MATRİSİNDE, SAYILARLA

Çıktının tamamı: `GECE/log/V4-D.kapilar.txt` (171 satır, üç koşu peş peşe).

| kapı | komut | sonuç | exit |
|---|---|---|---|
| konvansiyon | `node engine/tests/flat_convention_check.mjs` | **PASS — 0 ihlal**, üretim kalemi **8 stil** | 0 |
| ifade | `node engine/tests/flat_expresses_spec_check.mjs` | **0 FAIL**, (A) 10/10 çift ayrıştı, (B) 8/8 damga | 0 |
| geometri/satılabilirlik | `node engine/tests/flat_geometry_sellable_check.mjs` | **PASS — 0 ihlal**, tolerans 2 mm, **5 stil** | 0 |

Kapıların bastığı yan sayılar (hepsi aynı log'da):
- **3b çizgi oranları**, ISO 128-2:2020 md.5.2 tavanı %22.22 → outline:seam %0.00 ·
  seam:mark %0.00 · outline:mark %0.00.
- **3c detay callout: 0** (HAT-2, üretim kalemi, 8 stil: tek-harf etiketi 0, ölçek
  beyanı 0). Üretimi bu kartta da YAPILMADI → kuyruk kalemi, §5 md.5.
- **3d HAT-1/HAT-2 açığı** (kapı değil): bel croquis 700.0 mm vs kabuk 725.0000 mm →
  **25.0 mm**; göğüs yarı-genişliği 219.90 vs 229.56 → **9.66 mm**.
- **Parite raporu (kapı değil):** referans kalem 31 stil, `data-scale` beyan eden
  **0/31**, mürekkep `{#111}` (üretim kalemi `#1f3a5f`), ağırlık tablosu
  `{.65, 1.05, 1.4, 1.5, 1.9}`. Yani panonun 9 hücresinin çizgi kalınlıkları
  `lineClasses` tablosundan GELMİYOR. SALT-OKUNUR olduğu için dokunulmadı.

**Kapalı-enum ratchet:** `bash engine/tests/vocab_reference_check.sh --tree .` →
`bugun toplam 10434 (delta -4)`, **HÜKÜM: YEŞİL**. Düşüş V4-B'nin c993491'de kayıtlı
düşüşünün ta kendisi (`sleeveStyle` 351→349, `sleeveLength` 274→273, `sleeveCap`
146→145); bu kartın `flat-board.mjs` düzenlemesinin katkısı **0**. Taban
KENDİLİĞİNDEN güncellenmedi, `--baseline` çağrılmadı.

**Kırmızı AD kümesi (RULES 9):** bu kart `engine/tools/flat-board.mjs` dışında hiçbir
kaynağa dokunmadı ve o dosya **hiçbir ctest kaydının parçası değil**
(`grep -rn "flat-board" engine/CMakeLists.txt engine/tests/` → 0 satır). Devralınan
6 kırmızı ad (`contract_check` · `figure_check` · `flat_artifact_census` ·
`flat_pattern_agree_check` · `sizechart_source_check` · `style_check`) bu kartla
büyütülemez. ⚠ **Tam ctest bu kartta KOŞULMADI** — arka planda başka bir koşu
`engine/build`'i tutuyordu, oraya yazmak yasaklıydı. **DOĞRULANMADI** olarak işaretli.

---

## 4. §4.7 — ÇİRKİN HÜCRELERİN YANINA EN AZ BİR GELİŞTİRME YOLU

Hiçbiri panoda düzeltilmedi; hepsi olduğu gibi basıldı.

1. **`top_crew_dart` — panonun en boş hücresi, 2385 bayt** (diğerleri 6.9–30 KB).
   Ön/arka iki kontur ve tek bir pens çizgisi; kol oyuğu içi ve dikiş detayı yok.
   **YOL:** bu hücre referans kaleme düşüyor. Stil üretim kalemine
   (`render-garment-flat.mjs`, `contract/flat-convention-v1.json` bağlı) taşınırsa
   `lineClasses`'ın 5 sınıfı ve pens/dikiş iç çizgileri kendiliğinden gelir —
   yeni sayı gerekmez, mevcut kanun zaten üretim kaleminde uygulanıyor (§3, 8 stil).

2. **`peterpan_puff` adı ÜST çağrıştırıyor, çıktı ETEKLİ.** V4-C md.1'de yazılmıştı,
   bugün bayt bayt aynı yani hâlâ geçerli.
   **YOL:** `engine/flat-engine/styles.json` içindeki bu anahtarın `length`/`garment`
   alanı okunup ada karşı bir kapı yazılabilir (ad "top" diyorsa etek segmenti
   çizilmemeli). Ölçülebilir, uydurma sayı istemez. Bu kartta İNCELENMEDİ.

3. **`top_bandeau_shirred_peplum` altyazısı sağ sütunun üstüne taşıyor** (sayfa 2,
   1. satır — panoda görünüyor). Sebep: altyazı hücre genişliğine (`CELL_W=640`)
   kırpılmıyor, 63 karakterlik etiket 22px/700 ağırlıkta yaklaşık **~800 kullanıcı
   birimi** yer istiyor (tahmini, ölçülmedi — **DOĞRULANMADI**).
   **YOL:** `cell()` içindeki etiket, `textLength`+`lengthAdjust="spacingAndGlyphs"`
   ile `CELL_W`'ye sıkıştırılabilir ya da uzun etiketler iki satıra bölünebilir.
   Bu bir DÜZEN artefaktıdır, çizimin kendisinde kırpma yok.

4. **`shell-flat EU38` hücresi panonun geri kalanıyla aynı dili konuşmuyor:**
   FRONT/BACK başlığı yok, `data-scale` beyanı yok, ayrı kalem (C++ `GarmentSurf`).
   **YOL:** `shell-flat`'in SVG çıktısına aynı kök beyanları (`data-scale`,
   `data-unit-mm`, `data-ref-size`) eklenip konvansiyon kapısının kapsamına alınması.
   Bugün kapı 8 stil ölçüyor, bu çıktı kapsamda değil.

5. **Kol satırlarında `none`/`set`/`cap` ESKİ ile YENİ arasında neredeyse aynı görünüyor**
   (2537→2551, 3495→3546, 3471→3526 bayt; artışın tamamı omuz ucu + `data-engine-gap`).
   Görünen fark yalnızca `raglan` ve `puff`'ta.
   **YOL:** V4-B'nin kuyruk kalemi ayakta — `sleeveStyle: 'straight'` ile `'set'` hâlâ
   AYNI çizim (§3'teki (C) satırı), ve yaka ailesi `collarType` 1/2/3 de aynı
   (kontur 2053.59u, üçü özdeş). Ayrım için önce ÖLÇÜLMÜŞ yaka kanunu gerekir;
   kaynaksız sayı yazılmadı.

---

## 5. §6/V4'ÜN BEŞ MADDESİ — MADDE MADDE BUGÜNKÜ HÂLİ

> ⚠ **KAYNAK METİN AÇILMADI.** `GECE-KOSUSU-v6.md` bu işçinin context manifestinde
> yasaklı. Madde 5 kartın kendi ağzından alındı; 1-4 V4-A/V4-B/V4-C'nin uyguladığı
> şartlardan **yeniden kuruldu ve DOĞRULANMADI**. Maddelerin ADLARI çıkarımdır;
> **sayıların hepsi bugün ölçüldü.**

| # | madde (adı DOĞRULANMADI) | bugün ölçülen sayı | kapıya bağlı mı | açık kalan |
|---|---|---|---|---|
| 1 | Kapı kendi düzeltmeye çalıştığı kusuru VARSAYMAYACAK; ölçülmüş düzeltme uygulanacak (V4-A) | omuz ucu 16/16 panelde 210.60 mm, göğüs 219.90 mm, oran **0.9577** (Buğra 0.9570, fark −0.11 puan). Panoda ESKİ `data-shoulder-x=78` → YENİ `70.1799`, 5/5 satır | **EVET** — `flat_convention_check` md.1c, PASS 0 ihlal, exit 0 | `waistY`, `chestY`, `shoulderSlope 0.32` hâlâ `source: ACIK` (V4-A md.3-4). Croquis'in yarısı kaynaklı |
| 2 | Farklı spec değeri FARKLI giysi çizecek; sessiz eşitlik yasak (V4-B, RULES inv. 1) | kol: 10 çiftin **10'u** ayrıştı (eleman 6/10/18/54/10, kontur 1917.76–3497.78u). Kalıp boşluğu **8/8** adlandırıldı | **EVET** — `flat_expresses_spec_check`, 0 FAIL, exit 0 | `collarType` 1/2/3 hâlâ **AYNI** (2053.59u, üçü özdeş); `sleeveStyle 'straight'` = `'set'`. Kapı bunları (C)'de sayıyla basıyor, gizlemiyor |
| 3 | Zevk panosu kırpmasız, aynı düzende, hüküm Damla'nın (V4-C → V4-D) | 3 sayfa, **30 hücre**, kırpma aracı **0** (§ md.5), 15 satırın 15'i aynı düzende | HAYIR — pano bir kapı değil, bir GÖSTERGE | Hüküm verilmedi ve verilmeyecek. Panonun 9 hücresi kanunun bağladığı kalemden ÇIKMIYOR (§1) |
| 4 | Menü/kapalı-enum büyümeyecek; kırmızı AD kümesi büyümeyecek (V4-B md.0, RULES 9) | ratchet **10434 (delta −4)**, HÜKÜM YEŞİL; bu kartın katkısı **0**. Kırmızı ad kümesi 6, bu kart hiçbir ctest kaydına dokunmadı | **EVET** — `vocab_reference_check.sh`, YEŞİL | Tam ctest bu kartta koşulmadı (`engine/build` başka koşuda), **DOĞRULANMADI** |
| 5 | **Artefaktın kökü düzeltilir, kırpmayla gizlenmez** (kartın kendi ağzından) | aşağıda, ayrı ölçüm | HAYIR — bugün kapısı yok | detay callout **0**, üretimi yapılmadı → kuyruk |

### Madde 5 — BU GECE HİÇBİR ARTEFAKT KIRPMAYLA GİZLENDİ Mİ? ÖLÇÜLDÜ: **HAYIR.**

komut:
```
grep -o 'clipPath\|clip-path\|overflow:hidden\|slice' GECE/log/V4-D.pano/board-eski-yeni-*.svg | wc -l
```

| pano sayfası | `clipPath` | `clip-path` | `overflow:hidden` | `preserveAspectRatio="slice"` | `xMidYMid meet` | `overflow="visible"` |
|---|---|---|---|---|---|---|
| board-eski-yeni-1.svg | 0 | 0 | 0 | 0 | **10** | **10** |
| board-eski-yeni-2.svg | 0 | 0 | 0 | 0 | **10** | **10** |
| board-eski-yeni-3.svg | 0 | 0 | 0 | 0 | **10** | **10** |

30 gömmenin 30'u `xMidYMid meet` + `overflow="visible"`: **ölçeklenir, kırpılmaz**.
Kırpma yapabilecek dört SVG aracının hiçbiri panoda kullanılmıyor (12 hücrenin 12'sinde 0).
Retuş / yeniden çizim / elle düzeltme de yapılmadı — hücre içeriği kalemin ürettiği
baytın kendisi (10 stil hücresi için `cmp` ile, kol hücreleri için sha256 ile doğrulandı).

**Detay callout bugün 0** ve üretimi yapılmadı → **kuyruk kalemi** (aşağıda).

---

## KUYRUK KALEMLERİ

- **Detay callout üretimi** — ISO 128-3:2022 md.4.12 (kapalı ince sürekli sınır +
  tek büyük harf + `HARF (n:1)` ölçek beyanı). Bugün **0**, üretimi YAPILMADI.
- **Yaka ailesi ayrımı** (peterPan/stand/shirt) — önce ölçülmüş yaka kanunu, sonra çizim.
- **`sleeveStyle 'straight'` ile `'set'` ayrımı.**
- **Panonun 9 hücresini kanunun bağladığı kaleme taşımak** (§1'in kökü).

## YAPILAMAYAN (sebebiyle)

1. **Tam ctest koşulmadı.** Arka planda bir ctest koşusu `engine/build`'i tutuyordu ve
   kart oraya yazmayı yasakladı. Yerine üç node kapısı + ratchet koşuldu (hepsi exit 0 /
   YEŞİL) ve dokunulan tek dosyanın hiçbir ctest kaydında olmadığı gösterildi.
   Kırmızı ad kümesinin büyümediği **çıkarımdır, ölçüm değil — DOĞRULANMADI.**
2. **§6/V4'ün asıl metni okunmadı** (manifest yasağı). Madde adları yeniden kuruldu.
3. **`peterpan_puff`'ın `styles.json` kaydı incelenmedi** — kart manifestinde yok.

## KART DIŞI FARK EDİLEN (dokunulmadı, yazıldı)

1. **Panonun ölçtüğü stil sayısı ile kapıların ölçtüğü stil sayısı üç ayrı sayı:**
   pano **9 stil** (+shell-flat), `flat_convention_check` **8 stil**,
   `flat_geometry_sellable_check` **5 stil**, referans kalem parite raporu **31 stil**.
   Dördü de farklı kümeler; hangi stilin hangi kapıdan geçtiğini söyleyen tek bir
   liste YOK. Bir stil bugün hiçbir kapıya girmeden panoda görünebiliyor.
2. **`flat-board.mjs` artık bir KIYAS ALETİ, ama kıyasın hükmü bir kapıya bağlı değil.**
   `bayt bayt AYNI` / `FARK VAR` altyazısı basılıyor ve exit kodunu etkilemiyor.
   İleride "bu commit şu hücreyi değiştirmemeliydi" türü bir regresyon kapısı buradan
   kurulabilir; bugün kurulmadı (kart kapsamı dışı).
3. **`--eski` bayrağı olmadan pano YALAN söylerdi** ve bu bir tasarım kusuruydu:
   V4-C'nin `--yeni` bayrağı sol sütunu HER ZAMAN bugünden üretiyordu, yani
   "ESKİ|YENİ" panosu iki sütunda da bugünü gösterirdi. Kusur bu kartta kapatıldı,
   ama V4-C'nin notu (`--yeni <svgDizini> sağ sütunu doldurur`) hâlâ eksik tarif.
4. **Referans kalem 31 stilin 0'ında `data-scale` beyan ediyor.** Panodaki 9 hücrenin
   9'u o kalemden çıktığı için **panodaki hiçbir stil hücresi ölçeğini beyan etmiyor**;
   yalnız kol satırları (üretim kalemi) `data-scale="1:3"` taşıyor. Bir alıcı panoya
   bakıp ölçek soramaz. SALT-OKUNUR kalem olduğu için dokunulmadı.
5. **`c396fb4`'ün ESKİ kol çıktısı repoya alındı** (`GECE/log/V4-D.kol-eski/`), çünkü
   `/tmp` altındaki detached worktree kalıcı değil ve panonun sol sütunu onsuz
   yeniden üretilemezdi. Bu, kartın izin verdiği `GECE/log/V4-D.*` alanında.
   Detached worktree (`/tmp/v4d-eski`) koşu sonunda kaldırıldı.
