# AJAN KARTI — F5-B (`op.suppress`) 🧩 HALKA 2 SÜRÜYOR · F5'in İKİNCİ alt-kartı

Bu kartı **hakem** yazdı (F5-A hükmünden sonra, §3.7). **HEDEF DEĞİŞMEDİ** —
hakemin yapamayacağı tek şey odur: **fotoğraf + prompt → kalıp + flat.**

Faz öncesi etiket: **`F5A-yesil`**. Main'de çalışılır, branch açılmaz.
Geri alma: `git reset --hard F5A-yesil`.

## OKUMA LİSTESİ — bu kart + `KOSU-v7.md` şu bölümler, fazlası DEĞİL (§3.11)

**§0 · §0B · §3.4 · §3.5 · §3.6 · §3.7 · §3.8 · §3.10 · §3.12 · §4A**

▸ **§4C'yi okuma**, F4'ün listesinde.
▸ `GECE7/HAKEM-F5A.md` **okunur** — bu kartın bütün sayıları oradan gelir.
▸ Kararlar: **K23 · K27 · K28 · K29 · K30 · K31 · K32 · K33 · K34.**

---

# ⛔ F5 TEK KARTTA KOŞULAMAZ. "F5'İ BİTİRDİM" DİYEN AJAN REDDEDİLİR (§3.12).

**Bu alt-kart BİR operatör kapatır: `op.suppress`.** Bugün motorda **1** operatör
var (`op.rotate`); bu kart bitince **2** olur, **13'ü kuyrukta kalır** ve adlarıyla
basılıdır. *"Operatörleri yazdık"* bir kapı değildir.

**Tahmin: 2–3 oturum, tavan 6.** Aşarsan **DUR ve hakeme gel** — o noktada problem
kartın kendisidir. **Sessizce sürünmek yasak.**

---

## OPERATÖR SEÇİMİ — HAKEM SEÇTİ, DAYANAK ÖLÇÜLEN SAYI (§3.4)

F5-A'nın `expressability_check` kuyruğu **ölçüldü** ve ilk iki sırada **beraberlik**
var:

```
   4 giysi  op.split
   4 giysi  op.suppress
   3 giysi  op.attach
```

**Beraberliği üç ölçüm bozdu, tahmin değil:**

1. **`op.suppress` bugün `rotate`'in GİRDİSİ ve o girdi bir FİKSTÜR** (borç md.34).
   `rotate` kanıtlı bir operatör ama taşıdığı pens **kodda üretilmiyor**, karta
   künyeli bir sabit olarak besleniyor (41.48° · apeks 0.80). `suppress` gerçek
   olunca `rotate`'in girdisi **fikstür olmaktan çıkar** — yani bu kart, F5-A'yı
   ürüne bir adım yaklaştıran **tek** kuyruk maddesidir. `split` bunu yapmaz.
2. **K28: sevk edilen `top/dart/woven` sınıfının 8/8 panelinde pens YOK.**
   Sınıfın **adı** `dart`, geometrisi değil. Pensi **üretecek** operatör
   `suppress`'tir. Bu ayrışma bugün ürünün en dürüst kusurudur.
3. **`stitchu-sheath-eu38` — motorun KENDİ sevk ettiği giysi — yalnız
   `{op.split, op.suppress}` ile bloke.** Paydadaki tek kalem ki **iki tarafına da
   biz sahibiz**; ikisi kapanınca **H8-ifade ilk kez 5/5'ten düşer.** `suppress`
   o ikiliden **`rotate`'e bağlı olanıdır**, o yüzden önce gelir.

▸ **`op.split` SIRADAKİ** ve F5-C'nin adayıdır. **Ajan operatör seçemez** (§3.4).

---

## ⭐ İŞ 0 (ZORUNLU, HER ŞEYDEN ÖNCE) — F5-A'DA HAKEMİN BULDUĞU İKİ BOŞLUK (K30)

**İkisi de hakemin kendi mutasyonuyla bulundu, ikisi de bugün YEŞİL yanıyor.**
`suppress`'e başlamadan **önce** kapanır. Sebep F5-A kartındakiyle aynı: kapsamayan
bir kapının üstüne operatör yazmak, kapsanmayan alanı büyütür.

### İŞ 0a — 🚨 KÜNYE **OKUNACAK**, KOPYALANMAYACAK (HM1)

`engine/tools/rotate-op.cpp:48`:

```cpp
constexpr double kApexFracOfPanel = 0.80;  // SheathOptions::bodiceApexFrac
```

**Hakem ölçtü:** motordaki `bodiceApexFrac` **0.80 → 0.60** yapıldığında `rotate-op`
hâlâ **0.80** ve `apeks_derinlik_mm 289.1484` basıyor, **`rotate_check` YEŞİL**.
Yorum satırı bir kaynak iddiasıdır ve **bağlı değildir**.

**Şart:** `rotate-op` apeks kesirini **motordan OKUR** (`SheathOptions`'ın kendi
alanı). **Kanıt bir mutasyonla:** `bodiceApexFrac` oynatılır → `apeks_derinlik_mm`
**oynamak ZORUNDA**; oynamıyorsa iş yapılmamıştır. Aynı disiplin `kBugraDartDeg`
41.48 için de sorulur: **künyesi nerede, okunuyor mu, yoksa kopyalanmış mı?**
Okunamıyorsa **karta yazılır**, uydurulmaz (§3.10).

### İŞ 0b — 🚨 **YAYINLANAN SAYI DOĞRU MU?** (HM3) — kimlik var, doğruluk yok

**Hakem ölçtü:** `shellprojection.cpp`'de `bust_circumference` **belin** çevresini
basacak şekilde değiştirildi — kullanıcıya inen teknik çizim **yanlış bir büst
ölçüsü yayınlıyor**. Düğüm kımıldadı (`0c1d5286…` → `6a02dac2…`, K24 çalışıyor) ama
**`tek_nesne_check` ve `rotate_check` İKİSİ DE YEŞİL.**

> F3 ve F5-A **kimliği** kurdu: *"flat ile kalıp aynı nesneden çıktı."*
> **Doğruluk kurulmadı:** *"yayınlanan sayı doğru."* İnen dosyada yanlış bir ölçü
> bugün **sessizce sevk ediliyor.**

**Şart:** `tek_nesne_check` bir **doğruluk kolu** kazanır — yayınlanan her
`ShellMeasure`, adının gerçekten ölçtüğü şeyle **bağımsız olarak** karşılaştırılır
(halkanın kendi çevresi, kalıbın kendi kenar toplamı — **ikinci bir yoldan**, aynı
çağrının tekrarından değil; yoksa regen-vs-regen olur). **Kanıt:** HM3 aynen
tekrarlanır → **KIRMIZI**; geri al → **yeşil**. Loglanır.
⚠ **Eşik uydurma.** Bir ölçünün doğru değeri bulunamıyorsa o ölçü için
**"ÖLÇEMEDİM"** yazılır ve kola alınmaz — sahte bir eşik, kapısızlıktan kötüdür (K29).

---

## ⭐ İŞ 1 — `op.suppress` MOTORA GİRER

**Bugün ne var:** `dartrotate.cpp` içinde bir `suppressWedge` **yardımcısı** var ve
F5-A onu bir kez kök sebebe indirdi (kama içindeki sınır noktaları **düşürülür**,
yoksa panel kendini keser). **Bu bir operatör değil, `rotate`'in iç yardımcısıdır.**

**Kapanış şartı — üçü birden, yoksa kapanmaz:**

- **Kendi dosyası, kendi kapısı:** `engine/src/dartsuppress.{hpp,cpp}` ·
  sürücü `engine/tools/suppress-op.cpp` (**kendi geometrisi YOK**, canlı
  `SeamPlan`'ın panelini alır — `rotate-op` emsali) · kapı
  `engine/tests/suppress_check.mjs`, `ctest`e kayıtlı.
- **Pens bir SAYIDAN düşer, yazılmaz.** §4A ve `HEDEF.md`: pens formülden değil
  **yüzey eğriliğinden** düşer (`flatten-research/16`: gerçek Buğra pensi
  **41.5° = develop-deficit 41.48°**). `suppress` bastırma açısını **panelin kendi
  develop-deficit'inden** hesaplar. **41.48'i koda sabit yazmak bu kartı KAPATMAZ**
  — o sayı bugün fikstürdür ve kartın işi tam olarak onu fikstür olmaktan
  çıkarmaktır. Çıkan sayı **41.48 ile yan yana** yazılır; **tutmuyorsa tutmuyor
  diye yazılır**, ayar yapılmaz (§3.10).
- **`rotate`'in girdisi FİKSTÜR OLMAKTAN ÇIKAR.** `rotate_check` bundan sonra
  `suppress`'in ürettiği pensi taşır ve **alan/açı/TRUE bacaklar** birebir korunur.
  ⚠ `rotate_check`'in bugünkü **R0** kolu (`aci_deg == 41.48`) o zaman **hakeme
  gelir** — ajan onu kendi başına gevşetmez (§3.8 md.4; K29 emsali: **kapı yanlışsa
  hakeme getirilir**, F5-A ajanı tam bunu yaptı ve **doğru davrandı**).
- **Mutasyon:** bastırmayı kimliksizleştir (kama açılmış gibi işaretle, geometriyi
  bırak) → **kırmızı**; geri al → **yeşil**. Ve panel **kendini KESMEZ** (F5-A'nın
  dersi: bastırma kumaşı **götürür**).

▸ **Bir isim SİLİNİYORSA bayt bayt kanıtlanır** (§4A). `suppress` bugün hiçbir
`.cpp`'yi silmez; `cupseam.cpp` `split + rotate + derive` bileşimine bağlı ve
üçünden **ikisi** hâlâ yok. **Çözülemeyen isim KALIR ve kuyruğa yazılır.**
▸ **Sayaç kullanıcı arayüzüne ÇIKMAZ** (F3'ün kuralı sürüyor).

---

## ⭐ İŞ 2 — H8, **İKİ SAYI** OLARAK BASILIR (K31, ŞART)

**H8-sözlük** (`hedef_kosu.mjs`, cırcıra bağlı, `n` ile) ve **H8-ifade**
(`expressability_check.mjs`, paydası **adlı**) **ayrı satırda** basılır,
**harmanlanmaz.**

🚨 **PAYDA ARTIK MÜHÜRLÜ VE MÜHÜR HAKEMİNDİR (K31).**
`expressability_check.mjs`'teki **`TABAN_PAYDA`** bloğuna **ajan DOKUNMAZ.** Hakem
kendi mutasyonlarıyla (HM4/HM5) paydanın serbestçe daraltılabildiğini ölçtü —
H8-ifade **motora tek satır kod yazmadan 5/5 → 4/4 ve 4/5** yapılabiliyordu.
Payda **büyüyebilir, DARALAMAZ**; büyütmek bir **cırcır kazanımı değildir**.
Bir giysinin gereksinimi yanlışsa **karta yazılır**, kaldırılmaz (§3.8 md.2 ruhu).

**Beklenen:** `suppress` motora girince `freesewing-bella` (`{suppress, rotate}`)
**ÇEVRİLEBİLİR** olur → **H8-ifade 5/5 → 4/5.** Olmuyorsa **sebebi yazılır**, sayı
zorlanmaz.

---

## F5-B'NİN FAZ KAPISI — sekizi de zorunlu, hepsi ÖLÇÜLEN

1. **`ctest --test-dir engine/build --output-on-failure` → `6 failed out of N`**,
   altı ad tam olarak miras altı: `flat_pattern_agree_check` ·
   `flat_artifact_census` · `style_check` · `sizechart_source_check` ·
   `contract_check` · `figure_check`. **Yedinci ad = alt-kart kapanmaz.**
   `N` bugün **122**; yeni test eklersen büyür, **kırmızı sayısı büyümez**.
   ⚠ `107 - h10_gate_check` **DISABLED** ve öyle kalır (K18).
   ⚠ **`ctest`in son satırını KOPYALA, ÖZETLEME.**
   ⚠ **ÖNCE `-DCMAKE_BUILD_TYPE=Release` ile TEMİZ DERLE** (K32): bayat bir
   `engine/build` **bir kapı sayısını değiştirebiliyor** ve bunu hiçbir kapı
   tutmuyor. Boş `CMAKE_BUILD_TYPE` = engine_check 19s→2684s, push kapısı 900s'yi
   hiç geçemez (CLAUDE.md tuzağı).
2. **`bash engine/tests/vocab_reference_check.sh` → `HUKUM: YESIL`**, bugünün
   toplamı karta yazılır (bugün **10306** / taban **10438**). Taban **kesilmez**,
   SCOPE **daraltılmaz** (K2/K11/K12).
   ⚠ **K12 TUZAĞI:** kapı **commit'ten** okur, çalışma ağacından değil. Yazdığın
   yorumda kapalı bir enumun **değerini** tekrar etme. **Commit'le, sonra koştur.**
3. **`node engine/tests/indir_check.mjs` → EXIT 0.** §10'un 24 kalemi + §10-(j) +
   §10-(k) yeşil kalır. **`KOKEN_ALANLARI` 38'in altına DÜŞMEZ** (K13).
4. **`node engine/tests/hedef_kosu.mjs` → EXIT 0, `CIRCIR SAĞLAM`**, ve
   **H10a + H10b + H10x = H10** tutar.
5. **`python3 -m pytest -q` → 33 passed** veya daha fazla. `labels-hakem-BOS.json`
   **boş** kalır (K14).
6. ⭐ **`node engine/tests/tek_nesne_check.mjs` → EXIT 0**, **doğruluk kolu
   eklenmiş** olarak (İŞ 0b), ve **HM3 mutasyonunda KIRMIZI** yanar, loglanır.
7. ⭐ **`node engine/tests/rotate_check.mjs` → EXIT 0**, ve `apeks_derinlik_mm`
   artık **motordan okunuyor** (İŞ 0a), **HM1 mutasyonunda KIRMIZI**.
8. ⭐ **`node engine/tests/suppress_check.mjs`** var, `ctest`e kayıtlı, pens açısını
   **panelin kendi develop-deficit'inden** düşürüyor ve **iki mutasyonla kırmızı**.
   **`expressability_check` → EXIT 0**, H8-ifade paydasıyla basılı, **`TABAN_PAYDA`
   el değmemiş.**

## CIRCIR — F5'İN HANESİ: **H4 · H5 · H8** (§3.6). Her sayıda `n`.

| sayı | taban | F5-B'den beklenen |
|---|---|---|
| **H4** | **ÖLÇEMEDİM** (yedi fazdır) | F5-A kımıldatmadı. **F5-B'nin şartı DEĞİL** ama `suppress` `SurfaceStitch`'e dokunuyorsa `reason` alanı **buradan** başlayabilir — başlarsa **karta sayıyla** yazılır, başlamazsa **"ÖLÇEMEDİM"** yazılır ve uydurulmaz. |
| **H5** | **0 / 5 ölçülebilen çift** | payda büyümeden **0→0 kazanım DEĞİL**; paydayı **önce/sonra** yaz. Yüzey dar: yalnız `armhole↔sleeve_cap`. |
| **H8-sözlük** | **31** (26 oov + 5 alan), n=5 · **61** (51+10), n=10 | kötüleşemez. **Sözlük daraltarak düşürmek §0B ihlalidir.** |
| **H8-ifade** | **5 / 5** (n=5), payda **MÜHÜRLÜ** | **4/5 bekleniyor.** Payda **daraltılamaz** (K31). |

**Diğerleri kötüleşemez** (§3.6): H1 **10/10** (n=10) · H2 **%95.2** (insan
anahtarı) · H3 **2** · H10 %58.3 · **H10b %40.0** (cırcır **yalnız buna**,
**§0B tavanı burada**) · H10e **3** · H10x **%0.8** · H11 4.0ms (<10 sn tavanı).
**H10a cırcıra BAĞLI DEĞİL** (K21) — **H10a'yı yükselterek faz kapatılmaz.**
**H6 istisnası F5'e tanınmadı.**

▸ **İKİ `n`'i TEK TABLODA HARMANLAMA.** H3 · H8 · H10e **mutlak sayaçtır**.
▸ **§0B tavanı:** H10b yükselirken H2 yükselmiyorsa **faz KAPANMAZ.**

## DEĞİŞMEZLER — faz ajanı bunlara dokunamaz

- `contract/hedef-kosu-taban.json` — **yalnız hakem** (§3.8 md.1). Blob bugün
  `cf2af8c7d3c4603eee5aea252f3568feedda8d10`.
- 🚨 **`expressability_check.mjs`'teki `TABAN_PAYDA` bloğu — YALNIZ HAKEM** (K31).
- `engine/tests/hedef_kosu.mjs`'in **eşikleri ve tanımları gevşetilmez.**
- `vision/eval/labels-hakem.json` — **cevap anahtarı; ajan bir yargıyı DÜZELTMEZ,
  TAŞIMAZ, SİLMEZ.** Mühürlü (K19), hakem HM8'i tekrarlayarak doğruladı.
- `vision/eval/labels.json` · `labels-hakem-BOS.json` (**boş kalır**) ·
  `live-2026-08-22.json` · `live-hedef10-2026-08-26.json` (**bankalı fixture'lar**).
- `engine/tests/flat_expresses_spec_check.mjs` ve tabanı — **tek bayt** (K17).
  ⚠ **Takipli yeni bir `.json` bu kapıyı kırmızı yakabilir** — bu koşuda **iki kez**
  oldu. **Bir eksen adı ya da sentinel dize, takipli bir JSON'da DEĞER olarak
  durmaz.** Dosya eklediysen **TAM `ctest`i tekrar koştur.**
- `engine/tests/vocab_reference_check.sh` + `vocab-reference-baseline.json` —
  **tek bayt** (K2/K11/K12).
- **`flat_pattern_agree_check`'e DOKUNMA.** Kök sebep **K23**'te bulundu
  (merkez-ön yayında **28.7714mm**, `flatten_check` bütçesinin **7.6 katı**) ama
  onarılmadı. **⚠ K23 F4'E BAĞLIDIR VE KAYBOLMAMALI:** kapının §2 biçimi **F4'ün
  manken çizelgesine** bağlı ve **yeniden yazacak olan hakemdir.** Onarmak geometri
  işidir, F5'in kartında yok. **Halka 3 (F4 → F6 → F7 → F8 → F9) F5 bitince açılır.**
- Hiçbir kapının eşiği gevşetilmez (§3.8 md.4). **Kapı yanlışsa hakeme getirilir**
  (K29 emsali).
- **F0'ın, F2'nin, F3'ün ve F5-A'nın işi sökülmez.** `beden` bir eksendir ve **KALIR**.
  `top/dart/woven`'ın yüzey hattı **geri alınmaz.** `nodeId()`'nin siluet kolu
  **geri alınmaz** (K24).
- **`patterns_real/` altına tek yeni dosya eklenmez** (K10 kapanana kadar).
  Diskteki takipsiz kalemler (`BUGRA-DEFTER.md` · `geometry/` ·
  `tools/bugra-geometry-*.json`) **takipsiz kalır**, `git add` görmez.
- **`KOSU-v7.md`'ye TEK BAYT yazılmaz** (K26).
- **`_olcum_seti.yedek_5`'e (`10 · 14 · 15 · 34 · 36`) DOKUNULMAZ** (K16).
  ⚠ **Havuzda kullanılmayan yalnız 4 fotoğraf kaldı: `11` `12` `30` `35`.**
  **Holdout tükeniyor** — harcarsan gerekçeni karta yaz.

## NOTLAR — hakemden faz ajanına

- **KAPIYI KOŞTUR. TAM `ctest` KOŞTUR.** Bu makinede **330–400 sn** sürüyor;
  bitmesini bekle, `-R` ile geçiştirme.
- **Kendi mutasyonunu koştur ve LOGLA** (`GECE7/log/f5b.mutasyon.txt`).
  ⚠ **F5-A'nın betiği (`GECE7/log/f5a.mutasyon.sh`) İYİ YAZILMIŞ — kopyala.**
  Nesneyi her turda siler, `shasum` ile ikilinin kımıldadığını kanıtlar, `cmp` ile
  kaynağın gerçekten değiştiğini kontrol eder, kımıldamazsa **"HUKUM YOK"** yazar.
  ▸ **Logda `ikili` alanının İKİ hash'in birleşimi olduğunu YAZ** — F5-A'da
  yazmıyordu, hakem kaynaktan okumak zorunda kaldı. Log kendi kendini açıklamalı.
- **Mutasyonlarını KENDİ YAZMADIĞIN dosyalara da yay** (§3.8 md.3, en az üçü).
  F5-A bunu **doğru yaptı** (6 mutasyon, 4 dosya, üçü kendi yazmadığı dosyada) ve
  hakem yine de üç boşluk buldu — **sınırı sen bulursan kart dürüst olur.**
- ⚠ **`.rabadon` KİLİDİ YANLIŞ POZİTİF VERİYOR** (miras 6 kırmızı `red-base`'i
  ateşliyor; `ctest … | tail -1/-2` `ctest-tail-hides-verdict`e takılıyor;
  `ctest -N` `no-ctest-list-as-green`e takılıyor; test dosyasına yazmak
  `red-suite-test-write`e takılıyor). **Hiçbir stitchu kapısını gevşetme,
  `guard.json`'a DOKUNMA** — kaçış rabadon'un kendi yolundan gelir:
  `rabadon wrong <kural> "…"`. **Hakem bu turda tam olarak öyle yaptı.** Kaydet,
  gizleme.
- ⚠ **F5-A ajanının yaşadığı gerçek:** `git stash push <yollar>` bir rabadon
  kuralına takılıp **bloklandı**, ama **aynı komut zincirindeki `git stash pop`
  yine de koştu** ve başka bir oturumun stash'ini açtı (282 dosya). **Komut
  zincirlerini kısa tut**, `git stash`'i tek başına koştur.
- **Sayı bulunamıyorsa uydurma** (§3.10). Bu koşuda *"YAYIN BULUNAMADI"*,
  *"VLM turunun para tutarı ÖLÇÜLMEDİ"*, *"gerçek tarayıcıda hiç tıklanmadı"* ve
  F5-A'nın *"H4 ÖLÇEMEDİM"*i — **dördü de doğru davranıştı.**
- **Bildirmek ucuz, gizlemek pahalı.** F5-A ajanı bayat `engine/build`'ı, sevk
  edilen sınıfta pens olmadığını (kendi kartının dayanağını zayıflatan sayı) ve
  yanlış bir `git stash pop`'u **kendi yazdı**; hükmü bu **güçlendirdi**.
- **Damla'ya soru sorulmaz** (§3.4) — `GECE7/DAMLA.md`'ye yazılır, **en kısıtlayıcı**
  varsayımla ilerlenir, koşu durmaz.
- **`git status` temiz bırak.** Takipsiz `patterns_real/` kalemleri bu koşunun
  kirliliği değil; **push'a karıştırma.**
- **SIFIR API ÇAĞRISI** (§3.9). Fixture yenilemek bir **faz kararıdır**.

## SAPMA SORUSU — cevabı ÖLÇÜLMÜŞ olacak

> *"Sevk edilen giysi artık **kendi pensini üretiyor** mu — açı bir sabitten değil
> panelin kendi develop-deficit'inden mi düşüyor, ve `rotate` onu **fikstür
> olmadan** taşıyabiliyor mu? Ve `suppress` yazıldıktan sonra **H8-ifade kaç**?"*

*"`suppress`'i yazdık"* = **sapma, reddedilir.** Cevap bir dosya yolu + bir kapı
çıkışı + iki mutasyonun kırmızısı + **41.48° ile yan yana yazılmış** bir sayı +
**paydası mühürlü** bir H8-ifade sayısıdır.

## BORÇ — devreden 38 + F5-A hakem turunun ekledikleri

**F5-A'nın devrettiği 38**, ve üstüne:

39. 🚨 **Kapıların bir kısmı KAYNAKTAN YENİDEN ÜRETİLEMİYOR** (K32). Temiz bir
    checkout'ta **23 kırmızı** doğuyor ve **17'si `engine/dist/` gitignore'da,
    7'si `pattern-bridge/.venv` gitignore'da, 1'i `patterns_real/geometry/`
    takipsiz** olduğu için. Bir hakem turu bu üçünü **tohumlamadan** kapıları
    doğrulayamaz.
40. 🚨 **Sevk edilen wasm'ın `source-stamp`'i kaynağın fonksiyonu DEĞİL** (K34).
    `build-wasm.sh`'ın `find src wasm` taraması **`engine/src/.rabadon/`**'u da
    yakalıyor — damga rabadon'un **oturum durumunun** fonksiyonu. Kod baytları
    bit-aynı, damga farklı (`12060bc08360bbb7` vs `ec4a6889fd4cb2eb`).
    `bundle_fresh_check`'in dayandığı *"DETERMINISTIC"* önermesi **bugün yanlış.**
41. 🚨 **`figure-lint.mjs` sembolik linkli bir checkout'ta SESSİZCE YEŞİL** (K33).
    `import.meta.url` (realpath'li) ile `process.argv[1]` (ham) karşılaştırılıyor;
    tutmayınca **süitin tamamı atlanıyor ve exit 0** basılıyor. Kapı *"hiçbir şey
    ölçmedim"* ile *"her şey geçti"*yi **ayırt etmiyor.** Damla'nın makinesinde
    bugün tetiklenmiyor. **Miras altıdan birinin kök sebebinin parçası.**
42. **wasm ↔ native düğüm eşitliğini HİÇBİR KAPI TUTMUYOR.** `tek_nesne_check.mjs`'te
    wasm kolu **yok** (hakem grepledi). F5-A ajanı elle ölçtüğünü yazdı; hakem
    bağımsız koşturmadı → **DOĞRULANMADI.**

Hâlâ açık, bu alt-kartın kapatmak zorunda olmadığı ama **silemeyeceği**:
gerçek tarayıcıda **hiç tıklanmadı** (**DOĞRULANMADI**, headless harness yok, yedi
fazdır) · miras 6 kırmızının **4'ünün** kök sebebi hâlâ aranmadı (`figure_check`
kısmen K33'te, `flat_pattern_agree_check` K23'te) · inen 7 dosyanın **5'i sessiz** ·
`download.js`'teki `kokenKaydi = null` arka kapısı (koruma **metinsel**) ·
H4/H6/H9 **ÖLÇEMEDİM** · H5 tek çiftten okunuyor · `vocab_reference_check` bir
**satır sayacı** (K12) · **K17** kapı ölçüm verisini ürün spec'i sayıyor ·
`conftest.py` bir kapsam kapısıdır ve **hiçbir mutasyonla korunmuyor** ·
`pages.yml:23` `branches: [main]` = **main'e her push canlıya çıkıyor** ·
`patterns_real/` **PUBLIC** (K10, Damla kararı) · holdout **4 fotoğrafa** düştü ·
`freesewing-bella`/`freesewing-aaron` gereksinimleri **DOĞRULANMADI** (payda 5'in
2'si künyesiz) · borç md.30 (`SeamPlan::sinif` tek dize) ve md.31 (`GarmentSurf`
kopyalanıyor, **DOĞRULANMADI**) açık.

---

# AJAN KARTI — F5-B (`op.suppress`)

**Ağaç:** `main` @ `9cfb7c8`. Geri alma: `git reset --hard F5B-oncesi`.
**Bu bir ALT-KARTTIR (§3.12).** F5 **BİTMEDİ**. Operatör kümesi **8 → 9**;
15 hedefin **2'si** motorda (`rotate`, `suppress`), **13'ü kuyrukta** ve adlarıyla
basılı. *"F5'i bitirdim"* denmiyor.

## KAPI — önce → sonra, her sayıda `n`

| kapı | önce | sonra |
|---|---|---|
| `ctest` (temiz Release, sıfırdan) | **6 failed / 122** | **6 failed / 123** |
| `vocab_reference_check` | YESIL 10306 (taban 10438) | **YESIL 10310** (taban 10438, delta −128) |
| `python3 -m pytest -q` | 33 passed | **33 passed** |
| `indir_check` | EXIT 0 | **EXIT 0** |
| `hedef_kosu` | EXIT 0 · CIRCIR SAĞLAM | **EXIT 0 · CIRCIR SAĞLAM** |
| `tek_nesne_check` | EXIT 0 (kimlik) | **EXIT 0 (+ DOĞRULUK kolu K6)** |
| `rotate_check` | EXIT 0 (pens fikstür) | **EXIT 0 (pens ÖLÇÜLMÜŞ)** |
| `suppress_check` | **YOKTU** | **EXIT 0, `ctest`e kayıtlı** |

`ctest` son satırı, **kopyalandı**:

```
95% tests passed, 6 tests failed out of 123

Total Test time (real) = 1085.64 sec

The following tests did not run:
	108 - h10_gate_check (Disabled)

The following tests FAILED:
	  9 - flat_pattern_agree_check (Failed)
	 17 - flat_artifact_census (Failed)
	 18 - style_check (Failed)
	 25 - sizechart_source_check (Failed)
	 96 - contract_check (Failed)
	102 - figure_check (Failed)
```

**Yedinci ad YOK.** `N` 122 → 123 (`suppress_check`), kırmızı sayısı **büyümedi**.
`108 - h10_gate_check` DISABLED ve öyle kaldı (K18).

⚠ **YEDİNCİ KIRMIZI İKİ KEZ DOĞDU VE İKİSİ DE KÖK SEBEPTEN KAPANDI** — ikisi de
benim açtığım delikti, ikisi de burada yazılı:
1. **`preset_resolve_check`.** `op.suppress`'in `angleDeg` parametresini
   sözleşmeden kaldırınca üç hazır demet (`shaping.dart` ×2, `skirtStyle.straight`)
   kırıldı: **ürünün sözlüğü pens açısını hâlâ elle çevrilen bir kadran sanıyordu**
   (18° · 12° · 10°, **üçü de künyesiz**). Parametreyi geri koymak operatörü
   yalancı yapardı; **kadranlar silindi**. `resolved=107 absent=3 sentinel=22`
   değişmedi.
2. **`bundle_fresh_check`.** `src/dartsuppress.{hpp,cpp}` motor kütüphanesine
   girince **sevk edilen wasm bir commit geride kaldı** (`6e3dd1f` ↔ `140949f`) —
   yani sunulan motor bu repodaki motor değildi. `build-wasm.sh` koşuldu, damga
   `deb96740fee41234`, üç sevk artefaktı commit'lendi.

## CIRCIR — F5'in hanesi: H4 · H5 · H8 (§3.6). **H8 İKİ SATIR.**

| sayı | taban | F5-B sonrası | hüküm |
|---|---|---|---|
| H1 | 5/5 (n=5) · **10/10 (n=10)** | 5/5 · **10/10** | tavan (K25) |
| H2 | %95.2 (40/42, n=5) | **%95.2 (40/42, n=5)** | aynı |
| H3 | 2 (n=5) | **2** | aynı |
| **H4** | **ÖLÇEMEDİM** | **ÖLÇEMEDİM** | aşağıda, uydurulmadı |
| **H5** | 0 / **5 ölçülebilen çift** | **0 / 5** | **payda BÜYÜMEDİ → kazanım YAZILMADI** |
| **H8-sözlük** | **31** (26+5) n=5 · **61** (51+10) n=10 | **31 (26+5)** · **61 (51+10)** | **kötüleşmedi; sözlük DARALTILMADI** |
| **H8-ifade** | **5 / 5** (n=5), payda MÜHÜRLÜ | **⭐ 4 / 5** (n=5), payda **MÜHÜRLÜ ve TAM** | **DÜŞTÜ** |
| H10 | %58.3 (70/120) | %58.3 | aynı |
| **H10a** | %17.5 | **%17.5** | **cırcıra bağlı değil (K21) — yükseltilmedi** |
| **H10b** | **%40.0 (48/120)** | **%40.0 (48/120)** | **§0B tavanı KIMILDAMADI** |
| H10e | 3 (n=5) · 5 (n=10) | 3 · 5 | aynı |
| H10x | %0.8 (1/120) | %0.8 | aynı |
| H11 | 3.1–4.0 ms | **2.9 ms** medyan (en kötü 32.1) | <10 sn tavanının çok altında |

**HEDEF SETİ (n=10), harmanlanmadı:** H1 **10/10** · H2 %93 (66/71) · H3 2 ·
H5 0/5 · H8-sözlük **61** · H10 %64.4 · H10a %29.7 · H10b %33.1 · H10e 5 ·
H10x %1.7 · H11 2.1 ms.

**H8-İFADE 5/5 → 4/5, VE SEBEBİ TEK KALEM:** `freesewing-bella` `{op.suppress,
op.rotate}` istiyordu, ikisi de motorda. **Payda daraltılmadı** — beş giysinin
beşi de listede, `TABAN_PAYDA` bloğuna **tek bayt** yazılmadı (mutasyon M9 mührü
kırmızı yakıyor). Kuyruk: **4 giysi `op.split`** · 3 `op.attach` · 1 `op.derive`
· 1 `op.extend` · 1 `op.gather` · 1 `op.overlay`.

**H4 — ÖLÇEMEDİM, ve `suppress` onu kımıldatmadı.** `SurfaceStitch`'e `reason`
alanı eklenmedi ve eklendiği **iddia edilmiyor**. `suppress` panel konturu
üstünde çalışıyor, dikiş listesine yeni bir sebep katmanı ilan etmiyor.
**H5 — 0/5, payda büyümedi.** Yüzey hâlâ dar (`armhole↔sleeve_cap`);
`suppress` yeni bir **kenar rolü** ilan etmiyor, o yüzden 0→0 bir kazanım
değildir ve kazanım olarak yazılmadı.

## İŞ 0 — hakemin iki boşluğu, ikisi de KAPANDI

### İŞ 0a — künye artık OKUNUYOR (HM1)
`rotate-op.cpp`'deki `constexpr kApexFracOfPanel = 0.80` **SİLİNDİ**. Kesir
`plan.opt.bodiceApexFrac`'tan okunuyor, ve `--apex-frac` değeri **SheathOptions
üzerinden `buildSeamPlan`'a** giriyor. Kapı üç kollu:
* **R0b** motorun ilan ettiği 0.80'i **pinler** → **M1 (HM1 aynen) KIRMIZI**.
* **R8** aracı iki kez koşturur: `310.634709679mm (0.8) → 232.97603226mm (0.6)`,
  **oran 0.750000000 = 0.75** → kopyalanmış bir sabit bu kolu geçemez;
  **M2 (künyeyi geri kopyala) KIRMIZI**.
* `kBugraDartDeg = 41.48` de **SİLİNDİ** — dosyada 41.48 artık yalnız
  `bugra_locket_pens_deg` olarak, **hiçbir şeyin okumadığı bir rapor** olarak var.

### İŞ 0b — yayınlanan sayının DOĞRULUĞU kapılı (HM3)
`tek_nesne_check` **K6 doğruluk kolu** kazandı, girdisi yeni `engine/tools/shell-audit.cpp`:
kabuğun **kendi noktaları** (halka başına 20000 örnek, merkez zinciri 0.02mm adım).
Kapı yayınlanan **14 ölçünün 14'ünü** kiriş toplamıyla yeniden hesaplıyor —
projeksiyonun Gauss-Legendre + Steiner + kapalı-form yoluna karşı **ortak kod
yolu olmadan**. En kötü uyuşmazlık **0.000129mm**. Eşik 0.05mm ve **seçilmedi**:
kiriş toplamının kendi çözünürlüğünden düşüyor, HM3'ün sapması (büst↔bel ~100mm)
bunun beş bin katı.
* **M3 (HM3 aynen: `bust_circumference` belin çevresini basar) KIRMIZI.**
* **M4 (`shoulder_width` yarım genişlik basar — aynı sınıf, başka yüz) KIRMIZI.**

⚠ **NE DENETLENMEDİĞİ YAZILI (K29):** `GarmentSurf::at()` iki yolun da altında.
**Yüzey yanlışsa iki okuma birlikte yanlış olur ve bu kol göremez.** Gördüğü,
HM3'ün ait olduğu sınıfın tamamı: yanlış yükseklik, yanlış halka, yanlış nicelik,
öbür görünümden kopya.

## İŞ 1 — `op.suppress` MOTORDA, VE SEVK EDİLEN GİYSİDE **REDDEDİYOR**

`engine/src/dartsuppress.{hpp,cpp}` · sürücü `engine/tools/suppress-op.cpp` ·
kapı `engine/tests/suppress_check.mjs` (`ctest` #12, Passed 387.18 sec).

**`suppressPanel()`'in AÇI PARAMETRESİ YOKTUR.** Açıyı `SurfacePanel::developDeficitDeg`'den
okur — bu, flatten'ın **zaten hesaplayıp bir debug env var'ının içinde çöpe attığı**
ayrık açı defekti; F5-B onu hesaptan çıkarmadan dışarı taşıdı (aynı aritmetik,
aynı sıra, aynı sayılar). Bir açı argümanı pensi **formüle geri çevirirdi**.

### ⭐ SAPMA SORUSUNUN İKİNCİ YARISI, VE CEVABI RAHATSIZ EDİCİ

**Sevk edilen giysi kendi pensini ÜRETMİYOR — çünkü ÜRETECEK PENSİ YOK, ve bu
artık bir cümle değil bir SAYI.**

```
sevk_edilen        left_ftorso   develop-deficit   -1.9628°   -> op.suppress REDDETTİ
sevk_edilen_arka   left_btorso   develop-deficit   -0.1116°   -> op.suppress REDDETTİ
vucudu_izleyen     left_ftorso   develop-deficit  +55.1735°   -> AÇILDI, 44878.9541mm² gitti
vucudu_izleyen_arka left_btorso  develop-deficit  +56.6688°   -> AÇILDI, 42255.3192mm² gitti
```

**K28'in KÖK SEBEBİ BULUNDU:** `skimBodice` gövdeyi bir **KONİYE** çeviriyor,
koni birebir açılıyor, deficit **negatif** — bastırılacak hiçbir şey yok. Sınıfın
adı `top/dart/woven` ama sekiz panelinin sekizinde pens olmamasının sebebi bir
eksiklik değil, **yüzeyin kendi geometrisi**. Operatörün "hayır"ı **doğru
cevaptır** ve kapı (S1) onu **bir sayıyla tutuyor**.

### 41.48° YAN YANA — **TUTMUYOR, ve ayarlanmadı**

| panel | ölçülen | Buğra Locket | fark |
|---|---|---|---|
| `left_ftorso` (vücudu izleyen) | **55.1735°** | 41.48° | **+13.6935°** |
| `left_btorso` (vücudu izleyen) | **56.6688°** | 41.48° | **+15.1888°** |
| `left_ftorso` (sevk edilen) | **−1.9628°** | 41.48° | **kama YOK** |

41.48 **başka bir gövdedeki başka bir giysinin** sayısıdır. Hiçbir kadran ona
doğru oynatılmadı, hiçbir kapı ona eşitlemiyor (§3.10).

### `rotate`'in girdisi FİKSTÜR OLMAKTAN ÇIKTI
`rotate-op` artık pensini `op.suppress`'ten alıyor. **R0 kolu iki AYRI ARACIN
çıktısını kıyaslıyor:** rotate'in taşıdığı 55.1735°, suppress-op'un **aynı
panelde ölçtüğü** deficit ile birebir aynı. Üç hedefe transfer, `rotate_check`
EXIT 0: **alan farkı 0.000000000mm²**, **açı farkı 0.000000000°**, **TRUE bacaklar
0.000000000mm**, **çevre kimlik artığı 0.000000000mm**, üçü de kendini kesmiyor.

🚨 **HAKEME GELEN İKİ KALEM (§3.8 md.4, ajan tek başına karar vermedi):**

1. **`rotate_check`'in R0 kolu YENİDEN BAĞLANDI.** Eskiden `aci_deg == 41.48`
   sabitine bakıyordu; `suppress` ölçtüğü sayıyı basar basmaz o kol **yanlış
   kapı** oldu. Yerine **kapı-kapıya bağ** kondu (rotate'in açısı ≡ suppress'in
   aynı paneldeki ölçümü). **Bu bir GEVŞETME DEĞİL bir BAĞLAMADIR** ve kart
   bunun hakeme geleceğini önceden ilan etmişti — hakem onaylamazsa geri alınır.
2. **`rotate` ve `suppress` sevk edilen skim gövdede DEĞİL, motorun DİĞER
   gövdesinde koşuyor** (`SheathOptions::skimBodice` kapalı **+ `maxDartDeg = 0`).
   Gizli kadran değil: aracın **her satırında** yazılı ve sevk edilen panelin
   reddi **aynı çıktıda** basılı (R9 onu kapıyla tutuyor). Sebep ölçüldü:
   sevk edilen gövdede transfer edilecek pens **yok**; motorun kendi türettiği
   pensler açıkken ikinci bir kama **paneli kendine kestiriyor** (artık deficit
   27.8788°, giden alan 11417mm² ↔ sektör 24427mm²) — bu da `cift_bastirma`
   satırı olarak basılı ve **S5 kolu onu kapıyla tutuyor**, yani yapılandırma
   gerekçesi bir yorum satırı değil bir kırmızı/yeşil.

### KAPININ UYDURMADIĞI EŞİK (K29)
`kama_sektor_alani` (0.5·L²·θ) ile shoelace `alan_giden` arasındaki fark
**türetilmemiş bir ŞEKİL terimidir** (ölçüldü: ön %3.40, arka %10.06). %10.06'yı
geçirecek bir tolerans seçmek eşiği **bugünkü sayıya uydurmak** olurdu. O yüzden
**RAPOR edilir, kapıya bağlanmaz.** Gatelenen şey KESİN: alan kesinlikle azaldı,
ve **çıkan konturda apeksin gerdiği açı** ölçülen deficit'e 1e-9'da eşit.

## MUTASYONLAR — 10 mutasyon, 6 dosya, ÜÇÜ bu kartın hiç yazmadığı dosyalarda

Log: **`GECE7/log/f5b.mutasyon.txt`** · betik `GECE7/log/f5b.mutasyon.sh`.
Log **kendi kendini açıklıyor**: `ikili` sütununun `seam-plan|rotate-op|suppress-op`
shasum ilk-8'lerinin **birleşimi** olduğu logun **içinde** yazılı (hakemin F5-A notu).

| | dosya | hedef | hüküm |
|---|---|---|---|
| M1 | `src/surfacepattern.hpp` **(yazmadım)** | HM1 aynen: `bodiceApexFrac` 0.80→0.60 | 🔴 |
| M2 | `tools/rotate-op.cpp` | künyeyi geri kopyala | 🔴 |
| M3 | `src/shellprojection.cpp` **(yazmadım)** | HM3 aynen: büst = belin çevresi | 🔴 |
| M4 | `src/shellprojection.cpp` **(yazmadım)** | `shoulder_width` yarım genişlik | 🔴 |
| M5 | `src/dartsuppress.cpp` | açıyı sabite çevir (41.48) | 🔴 |
| M6 | `src/dartsuppress.cpp` | "açıldı" işaretle, geometriyi bırak | 🔴 |
| **M7** | `src/surfacepattern.cpp` **(yazmadım)** | negatif bantları sıfıra kırp | **🟢 KIRMIZI YANMADI** |
| M7b | `src/surfacepattern.cpp` **(yazmadım)** | defect'in MUTLAK değerini al | 🔴 |
| M8 | `contract/primitives-v1.json` | `op.split` olmayan bir kapı gösterir | 🔴 |
| M9 | `tests/expressability_check.mjs` | paydadan `freesewing-bella` sil (HM4) | 🔴 |

🚨 **M7 KIRMIZI YANMADI VE SEBEBİNİ KENDİM YAZIYORUM: MUTASYON YANLIŞ
TASARLANMIŞTI, KAPI DEĞİL.** Betiğin iddiası "negatif bantlar sıfıra kırpılınca
−1.9628 **pozitife döner**" idi. Yanlış — kırpma negatifi **sıfıra** çevirir,
pozitife değil; toplam 0.0000 oluyor, eşik 0.5'in hâlâ altında, ve op.suppress
**doğru şekilde reddetmeye devam ediyor**. İkili gerçekten kımıldadı
(`19ae6841…`), yani bayat-ikili tuzağı değil. Yerine **işareti gerçekten çeviren**
M7b koşuldu: deficit **−1.9628 → +1.9628**, eşiği geçti, operatör "evet" dedi,
**S1 kırmızı yandı**. Kapının bu kod yolunu kapsadığı böylece kanıtlı.

## DEĞİŞMEZLER — hepsi doğrulandı

* `contract/hedef-kosu-taban.json` blob **`cf2af8c7d3c4603eee5aea252f3568feedda8d10`** — **el değmedi**.
* `expressability_check.mjs`'in **`TABAN_PAYDA`** bloğu — **tek bayt yok**.
* `vision/eval/` — **tek bayt yok**. Cevap anahtarı mührü (K19) oynatılmadı.
* `KOSU-v7.md` — **tek bayt yok** (K26).
* `engine/tests/vocab_reference_check.sh` + `vocab-reference-baseline.json` — **tek bayt yok**; taban **kesilmedi** (29 sayaç DÜŞTÜ, hiçbiri artmadı).
* `flat_expresses_spec_check.mjs` + tabanı — **tek bayt yok** (K17); yeni takipli `.json` **eklenmedi**.
* `flat_pattern_agree_check` — **dokunulmadı** (K23 F4'e bağlı).
* `patterns_real/` — **PUSHLANMADI**, üç kalem takipsiz duruyor (K10).
* Holdout `11` `12` `30` `35` — **HARCANMADI**, dördü de duruyor.
* `_olcum_seti.yedek_5` — dokunulmadı (K16).
* Diğer operatörlere **girilmedi**: `suppress` ve `rotate` dışında hiçbir `op.*` `motorda_kapi` almadı (hakem `expressability_check`'ten doğrulayabilir: "MOTORDA 2").

## BULDUĞUMU DÖKÜYORUM — sorulmamış ama önemli

1. 🚨 **`suppress_check` 387s, `rotate_check` 396s, tam `ctest` 1085.64s.**
   F5-A'da `rotate_check` **4.78s**'ydi. Sebep: her iki araç da `skimBodice=OFF`
   planları kuruyor ve **vücudu izleyen gövdenin flatten'ı pahalı** (ARAP ucuza
   yakınsamıyor — `surfacepattern.hpp` bunu kendi ölçmüş). Kartın "bu makinede
   330–400 sn" cümlesi **bugün tutmuyor**; ölçtüğüm sayı 1085s ve bunun ~780s'i
   bu iki kapı. **Push kapısının 900s tavanı için bir risktir** ve hakemin
   bilmesi gerekir.
2. **`bundle_fresh_check` motor kaynağı eklenince kırmızı yanıyor** — bu kapının
   çalıştığının kanıtı, ama borç **md.40 (K34) AÇIK KALDI**: `build-wasm.sh`'ın
   damgası hâlâ `engine/src/.rabadon/`'u tarıyor, yani DETERMINISTIC önermesi
   bugün de yanlış. Ben yeniden derledim, önermeyi onarmadım.
3. **Borç md.42 hâlâ AÇIK:** wasm ↔ native düğüm eşitliğini hiçbir kapı tutmuyor.
   `tek_nesne_check`'e wasm kolu **eklenmedi**; K6 native ikiliyi denetliyor.
   **DOĞRULANMADI.**
4. **`STITCHU_SKIM_BODICE` env override'ı eklendi** (`probeOverrides`, mevcut
   sekiz override'ın yanına). Varsayılan davranış **bit-aynı**; sebebi
   `surfacepattern.hpp`'nin kendi "+52.5 deg" notunun sevk edilen ikiliden
   **okunamıyor** olmasıydı — header'ı düzenlemeden ölçmenin yolu yoktu.
5. **`SurfacePanel` iki yeni alan taşıyor** (`developDeficitDeg`, `deficitBandDeg`)
   ve deficit artık **her flatten'da** hesaplanıyor, yalnız `STITCHU_SP_DEBUG`
   altında değil. Aritmetik birebir aynı; maliyet üçgen köşesi başına bir `acos`.
   `engine_check` yeşil kaldı, golden kımıldamadı.
6. **`dartrotate.cpp` üç yardımcısını kaybetti** (`perimeter`, shoelace,
   self-intersection): ikisi de artık `dartsuppress.cpp`'den. **Tek cetvel.**
   `suppressWedge` de oraya taşındı — `dartrotate.hpp`'de artık YOK.
7. **Ölçtüm ve rapor ediyorum:** sevk edilen ETEK panellerinin deficit'i
   **+0.000°** (`skimBodice` + `hemSweep` koniye çeviriyor), yani `op.suppress`
   orada da reddeder. `skirtStyle.straight` demetinden `angleDeg: 10` bu yüzden
   kaldırıldı ve gerekçesi sözleşmeye yazıldı.
8. **rabadon bir kez daha yanlış pozitif verdi** (`ctest-tail-hides-verdict`,
   `cmake --build … | tail -2` üstünde — bir `ctest` koşusu değil). `guard.json`'a
   **dokunulmadı**; `rabadon wrong ctest-tail-hides-verdict "…"` ile kaydedildi.
9. ⚠ **Mutasyon betiği bir kez ARADA ÖLDÜ** (M7'nin geri alma adımında) ve ağacı
   **mutasyonlu bıraktı**. Fark edildi, elle geri alındı, `grep MUTASYON` ile
   sıfırlandığı doğrulandı, ve kalan mutasyonlar ayrı bir koşumda tamamlandı.
   Gizlenmiyor: **uzun mutasyon zincirleri bu makinede kesilebiliyor.**
10. **ÖLÇEMEDİM:** H4 · H6 · H9 · gerçek tarayıcıda tıklama (yedi fazdır,
    headless harness yok) · wasm↔native düğüm eşitliği · `GarmentSurf` kopyalanması
    (borç md.31) · miras 6 kırmızının 4'ünün kök sebebi.

## BORÇ — devreden 42 + bu turun ekledikleri

**F5-A'nın devrettiği 42 madde AYNEN duruyor** (md.39 K32 · md.40 K34 · md.41 K33
· md.42 wasm düğümü), ve üstüne:

43. 🚨 **İKİ KAPI 780 SANİYE YİYOR.** `suppress_check` 387s + `rotate_check` 396s;
    F5-A'da ikincisi 4.78s'ydi. Kök sebep vücudu izleyen gövdenin flatten
    maliyeti. Bir sonraki alt-kart operatör başına yeni bir kapı eklerse
    **tam `ctest` push kapısının tavanını aşar**. Ölçüldü, onarılmadı.
44. **`op.suppress` bir panele TEK kama açıyor.** Motorun kendi
    `dartColumnsFromDeficitRows`'u yükü **birden çok pense** bölüyor ve sütunu
    dikişe uzaklıkla ağırlıklandırıyor; operatör bunu **yapmıyor**. 55.17°'lik
    tek bir kama, `maxDartDeg = 14`'ün ilan ettiği tavanın **dört katı**.
    Yerleşim/bölme `op.split`'in kartına bakıyor. **Kuyruğa yazıldı, çözülmedi.**
45. **`suppress` ÜRÜNE HÂLÂ DEĞMİYOR** (md.37'nin `rotate` için söylediğinin
    aynısı): `draftJSON`/web hattına bağlı değil, kullanıcı bir pens açtıramıyor.
    Bu kartın kapattığı şey **operatörün gerçekliği**, ürün yolu değil.
    ⚠ Ama F5-A'dan bir fark var ve ölçüldü: sevk edilen giysinin sözlük demeti
    artık **elle yazılmış üç pens açısı taşımıyor**, yani operatör ürünün
    **sözleşmesine** değdi — geometrisine değil.
46. **Sevk edilen giysinin pensi YOK ve bu bir ÜRÜN kararıdır, çözülmedi.**
    `top/dart/woven` sınıfının adı ile geometrisi ayrışmaya devam ediyor. İki yol
    var ve **ikisi de hakemin**: ya sınıfın adı düzeltilir, ya sevk edilen gövde
    `skimBodice`'ten çıkarılır (kesim çizgisi gerinimi 0.0071–0.1501% → 2.96–48.12%,
    `surfacepattern.hpp`'nin kendi ölçümü). **Ajan seçmedi.**

## SAPMA SORUSU — cevabı ÖLÇÜLMÜŞ

> *"Sevk edilen giysi artık **kendi pensini üretiyor** mu — açı bir sabitten değil
> panelin kendi develop-deficit'inden mi düşüyor, ve `rotate` onu **fikstür
> olmadan** taşıyabiliyor mu? Ve `suppress` yazıldıktan sonra **H8-ifade kaç**?"*

**AÇI ARTIK BİR SABİTTEN DÜŞMÜYOR — EVET, ölçülerek.** `suppressPanel()`'in açı
parametresi yok; `left_ftorso` **55.1735°**, `left_btorso` **56.6688°** — iki ayrı
panel, iki ayrı sayı, ve açıyı sabite çeviren mutasyon (M5) kapıyı kırmızı yakıyor.

**`rotate` ONU FİKSTÜR OLMADAN TAŞIYOR — EVET.** `rotate_check` R0 iki ayrı aracın
sayısını kıyaslıyor, üç hedefe transferde alan/açı/TRUE bacaklar/çevre kimliği
**0.000000000**.

**AMA SEVK EDİLEN GİYSİ KENDİ PENSİNİ ÜRETMİYOR — HAYIR, VE BU BİR ALTYAPI
MAZERETİ DEĞİL BİR ÖLÇÜM.** Sevk edilen gövdenin develop-deficit'i **−1.9628°**;
üretilecek pens **yoktur** ve operatör **doğru olarak reddeder**. Transfer
motorun **diğer** gövdesinde koşuyor ve bu her satırda yazılı. K28 **kapanmadı**,
bir **sayıya bağlandı** (borç md.46).

**H8-İFADE = 4 / 5** (n=5, payda **mühürlü ve tam**: `bugra-locket-top`,
`bugra-buttoned-corset-bustier`, `stitchu-sheath-eu38`, `freesewing-bella`,
`freesewing-aaron`). Sıradaki: **`op.split`, 4 giysiyi bloke ediyor.**

⚠ **Payda BÜYÜTÜLMEDİ.** `freesewing-bella` ve `freesewing-aaron` künyeleri
**hâlâ DOĞRULANMADI** (FreeSewing deposu bu makinede yok, yayınlanmış parça
listeleri görülmedi) — kart büyütürken künyelerinin aranmasını istemişti, ben
**büyütmedim**, o yüzden yeni künye eklenmedi. Payda 5'in 2'si künyesiz kalıyor
ve bu **düşen sayının altındaki tek zayıf yer**: 4/5'in düşmesini sağlayan giysi
tam olarak künyesiz ikiden biridir (`freesewing-bella`). **Hakem bunu bilmeli.**
