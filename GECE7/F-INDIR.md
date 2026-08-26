# F-İNDİR — kullanıcı eve bir dosya götürsün 📥 — **İKİNCİ TUR**

Bu kart üzerine yazıldı. **Birinci turun kartı hakem tarafından KALDI ile geri
çevrildi** (`GECE7/HAKEM-F-INDIR.md`); bu ikinci tur ajanı o kartı ve o hükmü
girdi olarak aldı, birinci turun işini geri almadı, hakemin **iki şartını**
kapattı ve bir şeyi daha yaptı: **flat artık gerçekten iniyor.**

Main'de çalışıldı, branch açılmadı (§3.5). Tek push: **`cce710d`**.
`F-INDIR-yesil` etiketi **atılmadı** — yeşil etiketi hakem atar.

Faz öncesi etiket: `F-INDIR-oncesi`. Birinci turun push'ları: `ee1414c` + `072705c`.

---

## HAKEMİN İKİ DURAĞI — ikisi de kapandı

### DURAK 1 — `vocab_reference_check` kırmızıydı, artık YEŞİL

Kapalı-enum cırcırı. Hakem ölçtü: SCOPE içinde `garment` tam-kelime satır sayısı
taban `34586c8`'de **1186**, birinci tur sonrası `HEAD`'de **1188 (+2)**, sebebi
F-İNDİR'in kendi kodu.

**Taban yeniden KESİLMEDİ, eşik gevşetilmedi** (§3.8 md.4). Sayı, cırcırın
istediği yoldan düşürüldü — *referansı sökerek*:

`web/js/create.js`, kapalı üç değerli `garment` enum'unu **31 yerde 31 kez**
soruyordu (`s.garment !== 'skirt'` tablo boyunca kopyala-yapıştır, sonra görme
bloğunda bir daha). Artık **bir kez** soruyor:

```js
const isSkirt = (s) => s.garment === 'skirt';
const isTop   = (s) => s.garment === 'top';
const isDress = (s) => s.garment === 'dress';
```

Dördüncü bir sınıf (ya da eksenin adının değişmesi) artık 31 düzenleme değil, 1.
Bu tam olarak cırcırın başlığının istediği şey: *"the menu is to be dismantled,
not grown."*

**ÖLÇÜLDÜ** (`engine/tests/vocab_reference_check.sh`, HEAD `cce710d`):

| | `garment` (SCOPE içi, tam kelime) | hüküm |
|---|---|---|
| taban `34586c8` | **1186** | — |
| birinci tur `HEAD` (`b791db5`) | **1188** | KIRMIZI |
| **bu tur `cce710d`** | **1137** | **YEŞİL** |

129 anahtarın **129'u** tabanında ya da altında; tek bir `ARTTI`/`YENİ` satırı yok.
Toplam 10438 → **10277**.

**DÜRÜSTÇE, sorulmadan:** bu −49'un **14'ü** kelime sökmekten değil, **dosya
taşımaktan** geliyor (aşağıdaki flat işi: kalem `engine/tools/` → `web/lib/`
taşındı, `web/lib` cırcırın SCOPE'unda değil). Yani taşıma olmasaydı sayı
**1137 + 14 = 1151** olurdu — **yine ≤1186, yine yeşil.** Kapının yeşili taşımaya
DAYANMIYOR; taşıma sayıyı ayrıca düşürüyor, o kadar. Cırcır düşüşe zaten izin
veriyor ve tabanı kendiliğinden güncellemiyor.

### DURAK 2 — sapma cevabı ölçülmedi → **flat artık iniyor**

Hakem ölçtü ve haklıydı: `web/js/download.js`'in on dışa açık fonksiyonunun onu
da **kalıp** yazıyordu, `grep -i flat` tek bir yorum satırı buluyordu.

Bu tur, karta ölçülmüş "hayır" yazmayı seçmedi (o fazı kapatmıyordu zaten).
**Flat indirildi.**

**Önce ölçülen hastalık — hakemin bulduğundan daha derin.** Flat yalnız
inmiyordu değil; `create.html` ekranında da **yoktu**:

```
grep -rn "data-engine-gap" web/            -> 0 satır   (üretim kalemi hiçbir sayfaya basmıyor)
grep -n "flat" web/js/render.js            -> 0 satır   (ekranda da yok)
```

Yani GECE/V4-D'nin en sert bulgusu (*"bu düzeltmelerin hiçbiri sevk edilen web/
yüzeyine ULAŞMIYOR"*) 26 Ağu'da hâlâ ayaktaydı. Sevk edilen tek flat yüzeyi
`web/atolye.html` ve o **salt-okunur referans kalemi** gömülü taşıyor, üretim
kalemini değil.

**Kök sebep mekanikti:** üretim kalemi (`engine/tools/render-garment-flat.mjs`,
1245 satır) modül yüklenirken **beş `readFileSync`** çağırıyordu. Tarayıcıda
çalışamayan bir kalem tarayıcıdan indirilemez.

### Yapılanlar

1. **Kalem yayınlanan köke taşındı: `web/lib/flat-core.js`.** Pages tek kök
   yayınlıyor (`pages.yml`, `path: web`), tarayıcının import ettiği modül orada
   durmak zorunda — `pdf-core`'un birinci turda taşındığı kural, aynı gerekçe.
   `web/js/` **sayfa betiği** ad alanıdır; bu, on beş node aracının da import
   ettiği ortak bir renderer'dır.
2. **`engine/tools/render-garment-flat.mjs` tek satırlık re-export oldu.**
   **Kopya yok, tek kalem.** On beş çağıran (`flat_convention_check`,
   `flat_expresses_spec_check`, `flat_geometry_sellable_check`,
   `flat_sellable_check`, `style_check`, `bridge_guard`, `hedef_kosu`,
   `render-flat`, `figure-lint`, `one-figure-lint`, `gen-wrap-grid`,
   `gen-gore-grid`, `gen-taste-pool`, …) yolunu **değiştirmedi**.
3. **Beş sözleşme tablosu üretilen bir modüle indi:**
   `engine/tools/gen-flat-tables.mjs` → `web/lib/flat-tables.gen.js`
   (`contract/flat-convention-v1.json` · `contract/garment-spec-v2.json` ·
   `engine/vocab.json` · `contract/spec-grammar.json` ·
   `contract/spec-v1-v2-map.json`). Reponun kendi emsali
   (`gen-contract.mjs` → `web/js/contract.gen.js`).
4. **Kapısız üretilmiş ayna = ikinci doğrudur.** Yeni kapı:
   `ctest -R flat_tables_check` (`gen-flat-tables.mjs --check`) — tablolar
   `contract/`'tan bir bayt kayarsa kırmızı.
5. **`create.html` sonuç ekranına dördüncü dosya:** *SVG, teknik çizim
   (ön + arka)*. Kalıp üç şekilde seri hale getirilmiş **aynı** çizimdir
   (kesilecek parçalar); flat **ayrı bir sorunun** cevabıdır (bu şey **ne**).
6. **Kalemin kendi reddi kullanıcıya ulaşıyor.** Motorun kesemediği eksen SVG
   kökünde `data-engine-gap` damgasıyla duruyor; `create.js` onu ekrana
   **adıyla** yazıyor (`create.dl.flatgap`). Ölçülen örnek:
   `sleeveStyle=straight:sleeve` — yani "çizildi ama motor bu kolu **kesemiyor**"
   sessiz kalmıyor (RULES invariant 1, ve CLAUDE.md'nin 2026-07-18 puf emsali).

---

## KAPI — hedef koşusu, önce → sonra

`ctest --test-dir engine/build -R hedef_kosu` → **`100% tests passed`**

| # | önce | sonra | n |
|---|------|-------|---|
| **H1** tamamlanma | 5/5 | **5/5** | **n=5** |
| **H2** görülen isabet | %92.2 | **%92.2** (47/51 alan yargısı) | **n=5** |
| **H3** uydurma alan | 4 | **4** | **n=5** |
| **H4** gereksiz dikiş | ÖLÇEMEDİM | **ÖLÇEMEDİM** | **n=5** |
| **H5** dikilebilirlik | 0 / 5 çift | **0 / 5 çift** | **n=5** |
| **H6** konvansiyon | ÖLÇEMEDİM | **ÖLÇEMEDİM** | **n=5** |
| **H8** ifade edilemeyen | 31 | **31** | **n=5** |
| **H9** çıkarımda makullük | ÖLÇEMEDİM | **ÖLÇEMEDİM** | **n=5** |
| **H10** çıkarıldı oranı | %58.3 (ayrışmamış) | **%58.3 (ayrışmamış)** | **n=5** |
| **H11** süre | medyan 3.1 ms | **medyan 3.0 ms**, en kötü 30.5 ms (tavan <10 sn) | **n=5** |

`CIRCIR SAĞLAM — hiçbir sayı kötüleşmedi.` Beklenen buydu: bu tur görme/çıkarım
hattına tek satır dokunmadı; kalemi **taşıdı**, davranışını değiştirmedi.
`contract/hedef-kosu-taban.json`'a **DOKUNULMADI** (§3.8 md.1).

**H10a / H10b ayrıştırılmadı, ve bu bilinçli — birinci turdaki gerekçe aynen
geçerli ve hakem onu kabul etti.** Ayrıştırmak `hedef_kosu.mjs`'in H10 tanımını
değiştirmektir (24 alanın hangisi "fotoğrafta görünmesi imkânsız", hangisi
"görünüyor ama alınamadı" — bir **hüküm tablosu**); kapı tanımını değiştirmek faz
ajanının yetkisi değildir (§3.8 md.4) ve bu tur çıkarım hattına dokunmadığı için
ayrıştırılacak bir **değişim** de yok. `GECE7/DAMLA.md` md.5'te duruyor; tablo
hakemin ya da F2'nin işi.

---

## ctest

`ctest --test-dir engine/build --output-on-failure` → hakemin sayma yöntemiyle:

```
95% tests passed, 6 tests failed out of 119
Total Test time (real) = 273.94 sec
```

| ağaç | `ctest -N` listelenen | DISABLED | koşan | yeşil | kırmızı |
|---|---|---|---|---|---|
| Halka 0 sonu `34586c8` | 118 | 1 (`h10_gate_check`) | 117 | 111 | 6 |
| birinci tur `b791db5` | 119 | 1 | 118 | 111 | **7** ⛔ |
| **bu tur `cce710d`** | **120** | 1 | **119** | **113** | **6** ✅ |

**Kırmızı küme MİRAS ALTIYA DÖNDÜ** (RULES invariant 9): `flat_pattern_agree_check`
· `flat_artifact_census` · `style_check` · `sizechart_source_check` ·
`contract_check` · `figure_check`. Birinci turun doğurduğu yedinci ad
(`vocab_reference_check`) **listede yok**. Hiçbir test silinmedi, hiçbiri yeniden
adlandırılmadı; bu tur **bir test ekledi** (`flat_tables_check`).

---

## Faz kapısı — genişleyen kanıt

`ctest --test-dir engine/build -R indir_check` (`engine/tests/indir_check.mjs`).
Tarayıcının yüklediği modüllerin **kendisini** koşturur (`web/js/download.js`,
`web/lib/pdf-core.js`, `web/lib/flat-core.js`, `engine/dist` wasm). **Sıfır API
çağrısı.** Birinci turun altı bölümü duruyor; bu tur **9. bölüm FLAT** eklendi:

- **flat bir SVG belgesi** ve **iki görünüm** taşıyor: `FRONT` + `BACK`
  (`contract/flat-convention-v1.json → views.required`). Arka görünümü olmayan
  flat yarım tech-pack'tir.
- **gerçek geometri**: ölçülen `<path>` sayısı ≥ 4.
- **kalıbın yeniden adlandırılmışı DEĞİL**: flat ≠ `patternSVG(pattern)` ve
  içinde `cutInstruction` geçmiyor; ayrıca **`mm` ile ölçülendirilmemiş** —
  "gerçek mm" damgalı bir flat birini onu kesmeye davet ederdi.
- **adıyla ret**: `flatGaps({… sleeveStyle:'straight'})` boş dönmüyor
  (`sleeve` operatörü sicilde `shipped` değil).
- **boş spec dosya vermiyor**, hata veriyor — açılan boş bir dosya hatadan beterdir.
- **saver'ın kendisi** DOM taklidinden koşuyor: `saved` listesine gerçekten
  `dress-flat.svg` düşüyor.
- **buton MONTE edilmiş mi**: `create.js` `saveFlatSVG` çağırıyor mu **ve**
  `row.appendChild(flatBtn)` var mı — birinci turun mutasyonda yakaladığı
  "kuruldu ama monte edilmedi" hastalığının aynısı bu butonda da ölçülüyor.

**Görsel kanıt (RULES invariant 3 — dosya yolu, "baktım" değil):**
`Logs/indir-check/stitchu-dress-aline-flat.svg` ve raster'ı
`Logs/indir-check/flat-01.png` (1343×1200, `engine/tools/raster.mjs`).
Birinci turun artefaktları yerinde: `.dxf` · `.svg` · `-a4.pdf` · `-a0.pdf` ·
`cover-01.png` · `sheet-02.png` · `a0-1.png`.

---

## Mutasyon kanıtı (§3.8 md.3) — `GECE7/log/f-indir-2.mutasyon.txt`

Değişmeden **üç koşu yeşil** (gürültüde yanmıyor). Sonra:

| mutasyon | kapı | sonuç |
|---|---|---|
| flat, kalıptan ayırt edilemez hale getirildi | `indir_check` | **EXIT 8** — `flat is a different drawing from the pattern` |
| flat butonu kuruluyor ama **monte edilmiyor** | `indir_check` | **EXIT 8** — `the flat button is mounted in the download row` |
| `flatGaps` motorun adlı eksiğini **yutuyor** | `indir_check` | **EXIT 8** — `the flat names what the engine cannot cut` |
| **arka görünüm** silindi | `indir_check` | **EXIT 8** — `flat draws both views` |
| `flat-tables.gen.js` contract'tan **kaydırıldı** (`toleranceMM` 2→9) | `flat_tables_check` | **EXIT 8** |
| hepsi geri alındı | ikisi | **EXIT 0** |

Kırmızı olamayan kapı kapı değildir; beşi de kırmızı yandı.

---

## Açık kalanlar — dürüstçe

- **Flat `sleeveStyle=straight` için damgalı çiziliyor, kesilmiyor.** Kalem kolu
  çiziyor ama v2 sicilinde `sleeve` operatörü `shipped` değil; kullanıcı bunu
  **adıyla** görüyor, ama gördüğü çizim ile alacağı kalıp bu eksende
  **ayrışıyor**. Bu, miras kırmızı `flat_pattern_agree_check`'in konusudur ve
  bu turda **kök sebebe indirilmedi**.
- **Tarayıcıda `renderGarmentFlatAsync`'in referans-kalem dalı çalışmaz.**
  Salt-okunur referans kalemi (`engine/flat-engine/_engine-full.mjs`) hâlâ
  `node:fs` okuyor; tarayıcıda dinamik import reddediliyor ve **üretim yolu**
  çiziyor. `create.html` zaten senkron `renderGarmentFlat` kullanıyor, yani
  davranış tutarlı — ama **band-top/strapless ailesinde `atolye.html`'in
  gösterdiği çizim ile `create.html`'in indirdiği çizim aynı kalemden gelmiyor.**
  Bu, V4-K'nin iki-hat ölçümünün ürün tarafındaki devamıdır; kapatılmadı.
- **Flat PDF'e gömülmedi.** A4 kapağında flat yok; flat ayrı bir SVG.
  `pdf-core.renderSvgChunk` `transform`'lu aynalamayı taşımıyor, bu turda
  denenip **ölçülmeden** bırakılmadı — hiç denenmedi. **DOĞRULANMADI.**
- **`guidePdf` (kumaşa özel dikiş rehberi) hâlâ sonuç ekranına bağlı değil**
  (birinci turdan devam). Rehber ekranda var (`render.js` → `sewing.js`).
- **`web/collections/pdf/` altındaki 48 yayınlanmış PDF hâlâ bayat**
  (birinci turdan devam; kesim listesi taşması kodda düzeldi, dosyalarda değil).
- **`?v` sürümü 136'da duruyor.** Bu tur `web/js/*` ve `web/lib/*` değişti;
  **sevkiyattan önce bump şart**, yoksa kullanıcı bayat modülü çeker. Bump
  `scripts/deploy.sh`'ın işi, faz ajanının sevkiyata dokunması §3.5'e aykırı.
- **Gerçek tarayıcıda uçtan uca tıklama koşulmadı** (repoda headless tarayıcı
  harness'i yok; kapı DOM taklidiyle çalışıyor). **DOĞRULANMADI:**
  Chrome/Safari indirme diyalogu.
- **Birinci turdan devreden ölçülmemiş kalem:** `dxfSpecJSON` bağlanmasını
  motordan silip wasm'ı yeniden derleme mutasyonu (M5) bu turda da
  **koşulmadı**. **DOĞRULANMADI.**
- **Miras 6 kırmızının hiçbiri** bu turda kök sebebe indirilmedi; yalnız
  **büyümedikleri** doğrulandı.
- **Kalıp hâlâ kullanıcının kendi bedenine çizilmiyorsa EU38'e çiziliyor** ve bu
  `çıkarıldı` etiketiyle söylenmiyor (§4C md.2) — **F0'ın kalemi**, bu turda
  girilmedi.
- **§1F fotoğraf havuzu temizliğine girilmedi** — şefin talimatı gereği F2'nin işi.

---

## Tahmin

Kart: **1 gece**. Gerçekleşen: ikinci tur da tek oturum; tahminin iki katına
ulaşılmadı (§3.12 duruşu tetiklenmedi). Damla'ya sorulan soru: **yok**
(§3.4 — karar gerektiren nokta çıkmadı; `GECE7/DAMLA.md` md.5 ve md.6 birinci
turdan açık duruyor).

---

## Sapma sorusu — **ÖLÇÜLMÜŞ CEVAP**

> *"Bir yabancı fotoğraf yükleyip **kalıp + flat** indirebiliyor muyum?
> Bir önceki fazdan daha mı iyi?"*

**EVET — bu turdan itibaren ikisi de iniyor, ve ikisi de ölçüldü.**

- **KALIP iniyor:** PDF (A4, 18 sayfa) · SVG (gerçek mm) · DXF (R12, `ezdxf`
  bağımsız CAD hakemiyle açıldı: `AC1009`, `$INSUNITS 4`, 55 POLYLINE / 5 parça)
  · A0 (841.0 × 1189.0 mm). PDF kapağındaki kalibrasyon karesi içerik akışından
  geri okunarak **29.9999 mm** ölçüyor. — *birinci turun işi, ayakta.*
- **FLAT iniyor:** `stitchu-<sınıf>-<siluet>-flat.svg`, ön **ve** arka görünüm,
  motorun kendi üretim kalemi, kalıbın yeniden adlandırılmışı değil.
  Görsel: `Logs/indir-check/flat-01.png`. — *bu turun işi.*
- **Motorun kesemediği eksen sessiz değil:** ekranda adıyla yazılıyor.

**Birinci turun "Evet"i fazla genişti** (hakem haklıydı: o gün kalıp iniyordu,
flat inmiyordu). Bu tur o cümleyi genişletmedi — **eksik olanı indirdi.**
Bugün karta yazılan "evet"in altında beş mutasyonla kırmızı yanabildiği
gösterilmiş bir kapı duruyor.
