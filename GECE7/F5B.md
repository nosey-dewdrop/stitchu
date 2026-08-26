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
