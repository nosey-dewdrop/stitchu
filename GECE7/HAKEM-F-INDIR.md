# HAKEM — F-İNDİR (İKİNCİ TUR)

Hüküm: **GEÇTİ.** Etiket `F-INDIR-yesil` atıldı.

Bu hakem koşuda hiç iş yapmadı. Aşağıdaki her sayı **hakemin kendi koşturduğu
komuttan** çıktı; kart bir sayı için bile kaynak sayılmadı. Ölçüm tarihi
2026-08-26. Build `cmake --build engine/build -j8` → **exit 0**.

Yargılanan: `GECE7/F-INDIR.md` (ikinci tur), commit'ler **`cce710d` + `fac2993`**.
Birinci turun hükmü: KALDI, iki şart. **İkisi de kapandı, ve şartların ötesine geçildi.**

---

## 1. HÜKMÜ TAŞIYAN SAYI — ctest, hakemin kendi koşusu

```
95% tests passed, 6 tests failed out of 119
Total Test time (real) = 275.43 sec
```

Kırmızı adlar, hakemin çıktısından **birebir**:

```
  9 - flat_pattern_agree_check     13 - flat_artifact_census
 14 - style_check                  21 - sizechart_source_check
 92 - contract_check               98 - figure_check
104 - h10_gate_check (Disabled)
```

**Miras altının altısı, fazlası yok.** Birinci turun doğurduğu yedinci ad
(`vocab_reference_check`) listede **yok**. Kartın "tam olarak miras 6" iddiası
doğrulandı. Kart bu kez ctest sayısını doğru raporluyor — birinci turun düştüğü
yer buydu, tekrar etmedi.

## 2. `vocab_reference_check` — hakem sayıyı kendi saydı

Kapı, sayımı **ayrık worktree'de, commit-adresli ağaçta** yapar. Hakem aynısını
yaptı: üç commit için üç `git worktree --detach`, sonra kapının **kendi grep
imzası** (`SCOPE=(contract engine/src engine/wasm engine/tools
engine/pattern-bridge engine/vocab.json web/js recipes backend knowledge)`,
`grep -rIn -w garment`).

| ağaç | `garment` (SCOPE içi, tam kelime) | hüküm |
|---|---|---|
| taban `34586c8` | **1186** | — |
| birinci tur `b791db5` | **1188** (+2) | KIRMIZI |
| **bu tur `cce710d`** | **1137** (−49) | **YEŞİL** |

`ctest -R vocab_reference_check` → **Passed** (4.28 sn). Kartın üç sayısı da tuttu.

### Eşik gevşetildi mi? → **HAYIR. Ölçüldü, sıfır satır.**

```
git diff --stat 34586c8 HEAD -- engine/tests/vocab_reference_check.sh \
        engine/tests/vocab-reference-baseline.json \
        contract/hedef-kosu-taban.json
→ BOŞ ÇIKTI
```

Kapının betiği de tabanı da `34586c8`'e göre **bayt bayt aynı**. Taban dosyasının
`--all` üzerindeki en son commit'i `d6cbb87`, bu koşudan **önceki** koşuya ait.
`contract/hedef-kosu-taban.json`'ın tek commit'i hâlâ `f56941e` (Halka 0).
**§3.8 md.1 ve md.4 ihlali YOK.**

### −49 nereden geldi? Hakem dosya dosya ayrıştırdı

`b791db5` → `cce710d`, SCOPE içinde `garment` taşıyan **her dosyanın** sayısı
karşılaştırıldı. Değişen tam olarak dört dosya:

| dosya | önce | sonra | Δ | sebep |
|---|---|---|---|---|
| `engine/tools/render-garment-flat.mjs` | 15 | 1 | **−14** | kalem taşındı (shim kaldı) |
| `web/js/create.js` | 65 | 24 | **−41** | kapalı enum söküldü |
| `web/js/download.js` | 1 | 2 | **+1** | flat dışa açıldı |
| `engine/tools/gen-flat-tables.mjs` | — | 3 | **+3** | yeni üreteç |

Toplam **−51**; 1188 − 51 = **1137**. Birebir tutuyor.

**Taşımanın 14'ü kaybolmadı, yer değiştirdi:** `web/lib/flat-core.js` bugün tam
**14** `garment` satırı taşıyor — kapının SCOPE'u dışında. Kart bunu sorulmadan
itiraf etmiş; hakem doğruladı ve şunu ölçtü: **taşıma olmasaydı sayı 1151
olurdu, yine ≤ 1186, yine YEŞİL.** Kapının yeşili dosya taşımaya **DAYANMIYOR**.
Bu bir kaçamak değil.

### Sökme gerçek mi, yoksa grep'ten kaçış mı? → **GERÇEK.**

Alan **yeniden adlandırılmadı** (öyle olsa cırcır kandırılırdı). Doğrudan enum
karşılaştırması sayıldı:

```
grep -c "garment ===\|garment !==" web/js/create.js
  b791db5 → 44        HEAD → 4
```

Kapalı üç değerli enum, tablo boyunca 44 kez sorulmaktan **3 yordama + 4 artık
soruya** indi (`isSkirt` 34 · `isTop` 11 · `isDress` 7 kullanım). Dördüncü bir
giysi sınıfı artık 44 düzenleme değil, 1. Cırcırın başlığının istediği tam bu:
*"the menu is to be dismantled, not grown."*

## 3. KAPILAR GERÇEK Mİ? — hakem kendi mutasyonlarını koşturdu (§3.8 md.3)

Ajanın `GECE7/log/f-indir-2.mutasyon.txt` dosyasına **güvenilmedi**. Kod hakem
tarafından kasten bozuldu, sonuç ölçüldü, geri alındı. **Dördünün dördü kırmızı.**

| # | hakemin mutasyonu | dosya | kapı | sonuç |
|---|---|---|---|---|
| MA | `BACK` görünüm başlığı silindi | `web/lib/flat-core.js:1242` | `indir_check` | **KIRMIZI** |
| MB | flat butonu kuruluyor, **monte edilmiyor** | `web/js/create.js:905` | `indir_check` | **KIRMIZI** |
| MC | **`saveFlatSVG` no-op'a çevrildi** (dosya yazmıyor) | `web/js/download.js:242` | `indir_check` | **KIRMIZI** |
| MD | `flat-tables.gen.js` contract'tan kaydırıldı (`toleranceMM` 2→9) | `web/lib/flat-tables.gen.js:35` | `flat_tables_check` | **KIRMIZI** |
| — | hepsi geri alındı | | ikisi | **YEŞİL** |

**MC ajanın koşmadığı mutasyondur** — hakem onu bilerek ekledi: flat çiziliyor,
gapleri hesaplanıyor, ama **diske hiç düşmüyor**. Bu tam olarak fazın sattığı
şeyin sessizce boşalmış hali ve kapı onu yakalıyor. `indir_check` ve
`flat_tables_check` **kapıdır**.

Mutasyonlardan sonra çalışma ağacı temiz: `git status --porcelain -- web/ engine/`
→ boş.

## 4. FLAT GERÇEKTEN İNİYOR MU? — ölü kopya, montaj, dosya

- **Tek kalem, ölü kopya YOK.** Ağaçta `renderGarmentFlat`'i **tanımlayan** tek
  dosya var: `web/lib/flat-core.js` (satır 1226, ve async'i 1220). Onu **import
  eden** 20 dosya. `engine/tools/render-garment-flat.mjs` 26 satırlık gerekçe +
  tek `export * from '../../web/lib/flat-core.js'`. İkinci bir renderer yok.
- **Buton monte edilmiş:** `web/js/create.js:896-905` — `flatBtn` kuruluyor,
  `flatGaps(spec)` çağrılıyor, `saveFlatSVG(spec, \`${base}-flat.svg\`)` yazıyor,
  ve `row.appendChild(flatBtn)` **var**. `web/create.html:62` `create.js`'i
  modül olarak yüklüyor. Zincir kopuk değil.
- **Dosya diskte:** `Logs/indir-check/stitchu-dress-aline-flat.svg` (5557 bayt),
  yanında birinci turun `.dxf` · `.svg` · `-a4.pdf` · `-a0.pdf`'i.
- **Hakem çizime BAKTI** (`Logs/indir-check/flat-01.png`, 1343×1200): temiz, iki
  görünümlü, `FRONT` / `BACK` başlıklı, yaka–omuz–oyuk–pens–etek eteği çizili bir
  teknik çizim. CLAUDE.md'nin TEK TEST'i (*"Etsy'deki gerçek bir kalıp satıcısının
  ayarında mı?"*) bu çizimde **evet** cevabını alıyor. Bu, bir ölçüm tablosu değil,
  bir **nesne**.

## 5. CIRCIR — `hedef_kosu`, hakemin kendi koşusu

`ctest -R hedef_kosu` → **100% tests passed**, `CIRCIR SAĞLAM`.

| H1 | H2 | H3 | H5 | H8 | H10 | H11 |
|----|----|----|----|----|-----|-----|
| 5/5 | %92.2 (47/51) | 4 | 0 / 5 çift | 31 | %58.3 (ayrışmamış) | medyan **3.5 ms** |

H4 · H6 · H9 ÖLÇEMEDİM (taban böyle mühürlü). Altı sayının hiçbiri kötüleşmedi.
H11 3.1 → 3.5 ms **duvar saati salınımıdır**; H11 eşitliğe değil **tavana**
(<10 sn) bağlı, en kötü koşu 32.4 ms. İhlal yok.

## 6. §3.5 — main'de mi?

`git rev-parse --abbrev-ref HEAD` → **main**. `git log --oneline origin/main -1`
→ **`fac2993`**. Branch açılmadı, pushlar main'de ve uzakta. Uygun.

---

## NEDEN "GEÇTİ"

Sapma sorusu — *"Bir yabancı fotoğraf yükleyip **kalıp + flat** indirebiliyor
muyum? Bir önceki fazdan daha mı iyi?"* — cevabı hakem **ölçtü**, karttan almadı:

> **EVET.** Kalıp dört biçimde (PDF A4 18 sayfa · SVG gerçek mm · DXF R12 ·
> A0 841×1189 mm) **ve** flat bir SVG olarak (ön + arka) kullanıcının diskine
> düşüyor. Beşi de `Logs/indir-check/` altında **dosya olarak duruyor**;
> ikisi de kırmızı yanabilen bir kapının arkasında; flat'in kendisi göze bakıldı.

**Bir önceki fazdan daha iyi, ve fark bir sayıyla ölçülü:** 26 Ağu sabahı
`grep -rn "data-engine-gap" web/` **0 satır** dönüyordu — yani üretim flat kalemi
sevk edilen hiçbir yüzeye tek piksel basmıyordu; birinci tur sonunda kalıp
iniyor, flat inmiyordu. Bugün ikisi de iniyor. GECE/V4-D'nin en sert bulgusu
(*"bu düzeltmelerin hiçbiri sevk edilen web/ yüzeyine ULAŞMIYOR"*) bu fazda
**flat için kapandı**.

Ve motorun kendi reddi sessiz değil: `sleeveStyle=straight`'te flat kolu çiziyor
ama v2 sicilinde `sleeve` operatörü `shipped` değil — kullanıcı bunu ekranda
**adıyla** okuyor (`create.dl.flatgap`). Hakem bunu mutasyonla test etti
(`flatGaps` yutturulunca kapı kırmızı yanıyor, ajanın M3'ü). Yalan söylemeyen bir
eksiklik, gizlenmiş bir eksiklikten iyidir.

**Faz sapmadı: altyapı hazırlanmadı, dosya indi.**

---

## GEÇTİ AMA KAPANMADI SAYILAN HİÇBİR ŞEY YOK — sıradakine devreden borç

Bunlar F-İNDİR'i düşürmez (hiçbiri fazın hedefi değildi), ama **silinmiyor**:

1. **`flat_pattern_agree_check` miras kırmızı ve konusu tam da bu faz.** Flat'in
   çizdiği kol ile kalıbın kestiği parça `sleeveStyle` ekseninde **ayrışıyor**.
   Bugün kullanıcı bunu adıyla görüyor; yarın **ayrışmaması** gerekir. Kök sebebe
   inilmedi.
2. **Tarayıcıda referans-kalem dalı çalışmıyor** (`_engine-full.mjs` hâlâ
   `node:fs` okuyor). Sonuç: **band-top/strapless ailesinde `atolye.html`'in
   gösterdiği çizim ile `create.html`'in indirdiği çizim aynı kalemden gelmiyor.**
   Ölçülmedi, sadece kod okundu. **DOĞRULANMADI.**
3. **Flat PDF'e gömülmedi**; A4 kapağında yok. Hiç denenmedi. **DOĞRULANMADI.**
4. **`guidePdf` sonuç ekranına bağlı değil** (birinci turdan devir).
5. **`web/collections/pdf/` altındaki 48 yayınlanmış PDF bayat.**
6. **M5 koşulmadı** (`dxfSpecJSON` bağlanmasını motordan silip wasm'ı yeniden
   derleme). Kapının o kalemi `typeof` kontrolüne dayanıyor. **DOĞRULANMADI.**
7. **Gerçek tarayıcıda uçtan uca tıklama koşulmadı** — repoda headless harness
   yok, kapı DOM taklidiyle çalışıyor. Chrome/Safari indirme diyalogu
   **DOĞRULANMADI.**
8. **Fotoğraf → spec adımı `indir_check`'te yok** (sıfır API çağrısı, kasten).
   Zincir iki kapıya bölünmüş: fotoğraf→spec `hedef_kosu`'nun bankalanmış
   kaydında, spec→dosya `indir_check`'te. **Tek koşuda uçtan uca ölçülmedi.**
9. **Miras 6 kırmızının hiçbiri kök sebebe indirilmedi**; yalnız büyümedikleri
   doğrulandı.

**`?v` = 136 endişesi kapandı, blokör değil:** `scripts/deploy.sh` bump'ı
**her deploy'da kendisi hesaplayıp uyguluyor** (satır 69-82) ve `web/` birden
çok sürüm taşırsa `exit 4` veriyor. Unutulma sınıfı bir hata değil; faz ajanının
sevkiyata dokunmaması doğruydu.

---

## HAKEMİN KOŞTURDUĞU KOMUTLAR (tekrar üretilebilir)

```
cmake --build engine/build -j8                            # exit 0
ctest --test-dir engine/build --output-on-failure         # 6 failed out of 119
ctest --test-dir engine/build -R hedef_kosu               # Passed, CIRCIR SAĞLAM
ctest --test-dir engine/build -R indir_check              # Passed
ctest --test-dir engine/build -R flat_tables_check        # Passed
ctest --test-dir engine/build -R vocab_reference_check    # Passed
git diff --stat 34586c8 HEAD -- <kapi betigi> <taban> <hedef-kosu-taban>   # BOS
git worktree add --detach /tmp/vw{1,2,3} {34586c8,b791db5,cce710d}
  + kapinin kendi grep imzasi   -> 1186 / 1188 / 1137
  + dosya dosya delta            -> -14 / -41 / +1 / +3 = -51
grep -c "garment ===\|garment !==" web/js/create.js       # 44 -> 4
grep -rn "function renderGarmentFlat" --include='*.js'    # TEK tanim: web/lib/flat-core.js
# + DORT MUTASYON (flat-core.js:1242, create.js:905, download.js:242,
#   flat-tables.gen.js:35) — dordu de KIRMIZI, dordu de geri alindi, agac temiz
```

## GÖREMEDİĞİM / ÖLÇMEDİĞİM

Yukarıdaki 9 maddelik devir listesi + şunlar:

- **Flat'in ÇİZDİĞİ giysi ile kalıbın KESTİĞİ giysinin `sleeveStyle` dışındaki
  eksenlerde uyuştuğu ölçülmedi.** `indir_check` flat'in kalıptan *farklı bir
  çizim* olduğunu ölçüyor (doğru şart), *aynı giysiyi* anlattığını değil. O şart
  `flat_pattern_agree_check`'te ve o kapı **kırmızı**.
- **Kalıp hâlâ kullanıcının bedenine değil EU38'e çiziliyor olabilir** — hakem bu
  turda ölçmedi, F0'ın kalemi. `Logs/indir-check/` artefaktları `EU38` referans
  bedeninde (`data-ref-size="EU38"` flat SVG'nin kökünde duruyor).
- **`patterns_real/` çalışma ağacında untracked duruyor** (`BUGRA-DEFTER.md`,
  `geometry/`, `bugra-geometry-*.json`) ve `KOSU-v7.md` **değiştirilmiş** (` M`).
  Hiçbiri SCOPE içinde değil, hiçbir sayıya dokunmadı — ama **temiz ağaç değil**,
  ve bu koşunun ürettiği bir kirlilik değil.
