# HAKEM — F7 (EDİT) · 2026-08-27

**Ağaç:** `main`. Faz öncesi `F7-oncesi`. Ajan `c3821ae` + kart `bcb8835`.
Geri alma: `git reset --hard F7-oncesi`.

---

# ✅ HÜKÜM: **GEÇTİ**

**Kartın yedi faz kapısının YEDİSİ de tuttu, hakem hepsini KENDİ koşturdu, ve
hanenin gerçek kazancı kartın istediğinden BÜYÜK çıktı: taban 3/5 değil 2/5'ti,
yani pay 3→4 değil 2→4 yürüdü.**

Bu koşuda ilk kez **ajanın kendi aleyhine yazdığı bir kalem, hükmü ajanın
lehine çevirdi** (K66). İkinci kez de bir *"YAYIN BULUNAMADI"* hakem tarafından
açıldı ve **yayın vardı** (K67) — ama bu, sevk edilen davranışı değiştirmedi.

---

## 1. KAPILAR — HAKEM KENDİ KOŞTURDU (pristine, Release, `realpath == pwd`)

`engine/build` **silindi**, `-DCMAKE_BUILD_TYPE=Release` ile **sıfırdan** kuruldu.

| kapı | ajanın bildirdiği | **HAKEMİN KENDİ ÖLÇÜMÜ** |
|---|---|---|
| **`ctest` tam süit** | `96% tests passed, 5 tests failed out of 129` · 743.80 sn | **`96% tests passed, 5 tests failed out of 129`** · **`Total Test time (real) = 741.09 sec`** |
| kırmızı ADLARI | miras beş | **`flat_artifact_census` · `style_check` · `sizechart_source_check` · `contract_check` · `figure_check`** — **AYNI BEŞ, ALTINCI AD YOK** |
| DISABLED | 1 | **1** (`114 - h10_gate_check`, K18) |
| `vocab_reference_check` | YESIL 10336 | **`HUKUM: YESIL` · bugün 10336 / taban 10438** (delta −102) |
| `indir_check` | EXIT 0 · KÖKEN 39 | **YEŞİL · `toplam=39`** |
| `hedef_kosu` | EXIT 0 · CIRCIR SAĞLAM | **EXIT 0 · `CIRCIR SAĞLAM — hiçbir sayı kötüleşmedi`** |
| `pytest` | 33 passed | **33 passed** |
| `extend_check` / `attach_check` | YENİ, 15 + 16 kontrol | **ikisi de ctest'te `Passed`** (#82 0.17 sn · #83 0.19 sn) |
| `golden` | bayt bayt aynı | **`recipe_golden_check` #86 · `recipe_dress_golden_check` #88 — ikisi de `Passed`** |

⚠ **`ctest`in son satırı KOPYALANDI:** `96% tests passed, 5 tests failed out of 129`.
`N` 127 → **129**: iki kapı **eklendi**, silinen **sıfır**, `-E` **yok**.
`op_fixture` yine **366.73 sn** (borç 58 — süitin yarısı tek fikstür).

---

## 2. ⭐ HANE — **TABANI HAKEM KESTİ: 3/5 DEĞİL, 2/5** (K66)

Kart (satır 41) `bugra-buttoned-corset-bustier`'i **✅ ÇEVRİLDİ** listelemişti.
**Ajan bunu kendi aleyhine bildirdi. Hakem doğruladı ve ajan haklı çıktı.**

Hakem `F6-yesil`'i ayrı bir worktree'ye açtı ve **mühürlü betiği orada koşturdu**
(`expressability_check.mjs` blob `04c61f03` — iki uçta **aynı bayt**):

```
F6-yesil:  ÇEVRİLEMEDİ bugra-locket-top · ÇEVRİLEMEDİ bugra-buttoned-corset-bustier
           · ÇEVRİLDİ stitchu-sheath-eu38 · ÇEVRİLDİ freesewing-bella
           · ÇEVRİLEMEDİ freesewing-aaron
           -> operatör kümesi: MOTORDA 3   ·   H8-İFADE = 3 / 5 (ÇEVRİLEMEYEN)
HEAD:      ÇEVRİLEMEDİ bugra-locket-top · ÇEVRİLDİ (x4)
           -> operatör kümesi: MOTORDA 5   ·   H8-İFADE = 1 / 5 (ÇEVRİLEMEYEN)
```

| | ÖNCE (**hakem kesti**) | SONRA (**hakem ölçtü**) | şart |
|---|---|---|---|
| **H8-ifade — PAY (çevrilen)** | **2 / 5** | **4 / 5** | *"en az 4"* → **TUTTU, ve +1 değil +2** |
| **H8-ifade — betiğin bastığı (çevrilemeyen)** | **3 / 5** | **1 / 5** | — |
| **PAYDA** | **5**, adlı, mühürlü | **5** | **büyütülmedi, daraltılmadı** ✔ |
| motordaki operatör | 3 | **5** | — |
| kuyruk | 5 ad | **3 ad** (`derive`·`gather`·`overlay`, üçü de `locket-top`'un) | — |

**Düşen adlar:** `freesewing-aaron` (kartın istediği) **ve** `bugra-buttoned-corset-bustier`
(kartın istemediği yan kazanım — tek eksiği `op.attach`'tı).

### PAY GERÇEKTEN MOTORDAN MI DÜŞTÜ? — K35 DELİĞİ ARANDI, BULUNAMADI

Sayı üç kaynağın **kesişiminden** düşüyor ve hakem üçünü de tek tek açtı:

1. **`contract/primitives-v1.json`** — `op.extend` → `"motorda_kapi": "extend_check"`,
   `op.attach` → `"motorda_kapi": "attach_check"`. **Konvansiyona (`op.X → X_check`) UYUYOR.**
2. **`engine/CMakeLists.txt:537-543`** — ikisi de gerçek `add_executable` + `add_test`.
3. **K35 kolu** (`expressability_check.mjs:219-227`) — kapı **kendi adını taşımak
   zorunda**. Ödünç alınan ad kırmızı yanar.

⭐ **Ve K35'in kolu GERÇEKTEN sıkı:** ajanın M5'i `op.extend`'in kapısını
**`geometry`**'ye çevirdi. `geometry` **KAYITLI, GERÇEK bir add_test'tir**
(`CMakeLists.txt:66`) — yani bu, F5-B hakeminin HM-A'sıyla **aynı sınıf** bir
saldırıdır, *"olmayan ad"* değil. **Kapı yine de EXIT 1 verdi.** Delik kapalı.

**Ve kapılar vitrin değil:** `extend_check` **7 bacak**, `attach_check` **8 bacak**,
ikisi de çizilen nesnenin geometrisini yargılıyor. `attach_check` **LEG 5** ucuz
cevabı ayrıca kapatıyor: çapayı kendi yürüyüşüyle yeniden türetiyor **ve**
kutu-ortasından ölçülebilir şekilde **ayrı** olmasını şart koşuyor.

---

## 3. ⭐⭐ SAPMA SORUSU — **HAKEM KENDİ İNDİRDİ VE KENDİ HASH'LEDİ**

Ajanın logu **kopyalanmadı**; hakem `engine/dist/stitchu-engine.js`'i kendi sürdü
(`web/js/download.js`'in gerçek kayıt yolu üstünden) ve **kendi ölçtü**:

| edit | DXF bayt | sha256/16 | parça | metraj | issues |
|---|---|---|---|---|---|
| **editsiz** | 37236 | — | 6 | **2.0 m** | 0 |
| **`op.extend` 100 mm** | 37614 | ayrı | 6 | 2.0 m | 0 |
| **`op.attach` fiyonk** | 38786 | ayrı | **7** | **2.4 m** | 0 |
| **ikisi birden** | 39164 | ayrı | **7** | **2.4 m** | 0 |

**AYRI DXF HASH: 4 / 4** (hakemin kendi koşusunda da 4/4).

### HANGİ mm — hakem yeniden ölçtü, ajanın sayısına bakmadan

| parça | boy önce → sonra | delta | **EN önce → sonra** | çevre delta | komut |
|---|---|---|---|---|---|
| Skirt Front | 662.0000 → **762.0000** | **+100.0000** | **299.7000 → 299.7000** | **+200.0000** | 7→9 |
| Skirt Back | 662.0000 → **762.0000** | **+100.0000** | **299.7000 → 299.7000** | **+200.0000** | 7→9 |
| Bodice Front | 440.0000 → 440.0000 | 0.0000 | — | 0.0000 | **BAYT-AYNI** |
| Bodice Back | 400.0000 → 400.0000 | 0.0000 | — | 0.0000 | **BAYT-AYNI** |
| **Sleeve** | 226.9763 → 226.9763 | 0.0000 | — | 0.0000 | **BAYT-AYNI** |

**Etek ucu yayı: 300.5727 → 300.5727 mm** (ön ve arka, **tek basamak oynamadı**)
→ **TAŞINDI, YENİDEN ÇİZİLMEDİ.**
**EN DEĞİŞMEDİ (299.7000 → 299.7000)** → *"uzat"* sessizce *"genişlet"* olmadı.
Çevre **tam 2×mm** → iki dikey parça, ne eksik ne fazla.
Ön ile arka **AYNI** mm büyüdü → yan dikişler buluşuyor.

### HANGİ YENİ PARÇA — hakem parçayı açtı

`Bow (fiyonk, op.attach)` · kutu **86.0000 × 410.0000 mm** · dikiş payı 15 ·
**grainline VAR** (`fromX 43, fromY 21 → toX 43, toY 389`) · **kendi kesim çizgisi
VAR** (5 komut, yani edit `garment.cpp`'nin kesim-çizgisi pasından **ÖNCE** koştu —
kaynakta doğrulandı, `garment.cpp:1066` `runEditProgram` ile `:1079` `offsetOutline`
arasında) · kesim notu: *"cut 2 rectangle(s) 86 x 410 mm (finished 28 x 380 mm),
attach at the marked notch on Skirt Front and knot into a bow"*.

**ÇENTİK ÇİFT:** ev sahibi `Skirt Front` **2 → 6** komut, bileşen kendi 4'ünü
taşıyor. Ev sahibinin yeni çapası: **(150.2401, 647.1705)** — **ajanın bildirdiği
sayının aynısı**, hakemin bağımsız koşusunda.

**METRAJ 2.0 → 2.4 m, VE DÜZ BİR SABİT DEĞİL.** Hakem kaynağı okudu
(`patternedit.cpp:304-305`): `fabricMeters140 + box.height / 1000.0`, yani
**410 mm → 0.41 m**, bileşenin **kendi ölçülen kutusundan**. Kıyas: motorun diğer
operatörleri metrajı **düz sabitle** artırıyor (`boxpleat.cpp:217` +0.1 ·
`backdetail.cpp:187` +0.25 · `laceupback.cpp:201` +0.15). **Bu operatör onlardan
daha iyi davrandı.**

**YENİ KALIPÇILIK SAYISI SIFIR:** fiyonk `TieBlock::finishedBow()`'un
**zaten sevk ettiği** 28×380 mm, 2 adet (`tie.cpp`, FORMULAS.md künyeli).

### ⭐ VE HAKEM BİR ADIM DAHA GİTTİ: **BU CANLIDA**

- `?v` **139**, `site-health` **OK** (127 sayfa, 2604 iç bağlantı, tek sürüm).
- `pages.yml:23 branches:[main]` + `paths:['web/**']` → **bu push canlıya çıktı.**
- **Ölçüldü:** `https://stitchu.noseydewdrop.com/` **HTTP 200**, `?v=139` servis ediyor.
- **Canlı `vendor/stitchu-engine.js` sha1 `3de441e8` = repodaki dosyanın sha1'i —
  BAYT BAYT AYNI.** Yani `op.extend` ve `op.attach` taşıyan ikili **gerçekten yayında**.
- Canlı `js/create.js` **`editExtendMM` ve `editAttach` taşıyor.**

**Yani edit satırı ON DÖRT FAZDIR ilk kez bir insanın TIKLAYABİLECEĞİ yerde.**
⚠ **Hâlâ tıklanmadı (DOĞRULANMADI)** — ama artık *"yok"* değil, *"denenmedi"*.

---

## 4. 🚨 BORÇ 86 — **PENCERE GEVŞETİLMEDİ. HAKEM ÜÇ YOLDAN DOĞRULADI.**

**(a) Sabitler el değmemiş.** `git diff F7-oncesi..HEAD -- engine/src/validator.hpp
engine/src/fabricease.hpp engine/src/sleeve.hpp engine/src/sleeve.cpp` → **BOŞ.**
`capEaseMin = 0.01` · `capEaseMax = 0.09` **tek bayt oynamadı.**

**(b) Aritmetik — hakem kendi kurdu.** `kCap`'in tavanı **0.04**, tabanı **0.00**,
yani `capEase ∈ [0, 0.04]` her zaman. Bundan iki şey **çıkarımla** düşüyor:
- **Zemin** `= min(0.01, capEase)` ∈ [0, 0.01] → **yalnız aşağı**, ve **0'da kelepçeli**
  (kapak oyuktan kısa olamaz). Dokuma: `min(0.01, 0.04) = 0.01` — **DEĞİŞMEDİ.**
  Stable örme: `min(0.01, 0.02) = 0.01` — **DEĞİŞMEDİ.**
- **Çözücü payı** `= 0.5/armhole ≈ %0.124`. Kurtarabileceği tek aralık
  `[capEase − %0.124, capEase + %0.124] ⊆ [−%0.12, %4.12]`, ki **tamamı zaten
  pencerenin içinde**. Dokuma hedefi **%4**, pencerenin tam ortası → **dokumada
  bu kolun hükmü DEĞİŞTİREBİLECEĞİ tek ölçüm YOK.** Ajanın *"%0.124 < %3"*
  gerekçesi **doğru ve hakem bağımsız yeniden türetti.**

**(c) ⭐ VE DOKUMA ÇAPASI DERLEME ZAMANINDA MÜHÜRLÜ — bunu hakem mutasyonla buldu.**
`sleeve.hpp:20`:
```cpp
static_assert(FabricBand::easeAt(FabricBand::Girth::SleeveCap, 0.0) == capEase,
              "woven cap anchor drifted");
```
**HM-1** dokuma çapasını `0.04 → 0.004` yaptı: **kod DERLENMEDİ.** Bir kapıdan
daha sert bir mühür. → **Dokuma penceresi gevşetilemez, gevşetilmedi.**

**Kapanışın kendisi ölçüldü (hakemin kendi indirmesi):**

| hâl | ÖNCE (F6 hakemi) | **HAKEMİN ÖLÇÜMÜ (HEAD)** |
|---|---|---|
| knit %50 + düz kol | **0 B** · 1 issue | **36452 B · 0 issue** |
| knit %25 + düz kol | **0 B** · 1 issue | **37095 B · 0 issue** |
| knit beyansız | 37243 B | **37243 B — DEĞİŞMEDİ** |
| woven + düz kol | 37236 B | **37236 B — DEĞİŞMEDİ** |
| kolsuz örme | 29373 B | **29373 B — DEĞİŞMEDİ** |

**KAPI VAR ve BAYT yargılıyor:** `indir_check` 6B — *"kollu örme %50 (single
jersey): DXF BOŞ DEĞİL — 36452 bayt"* + *"DXF gerçekten R12"*. Bir durum kelimesi
değil, **dosyanın diskteki boyu**.

---

## 5. MUTASYON — **HAKEMİN KENDİ TURU, ÜÇÜ AJANIN HİÇ AÇMADIĞI DOSYALARDA**

Betik: `GECE7/log/f7.hakem.mutasyon.sh` · log `.txt`. Her turda
`git diff --numstat F7-oncesi..HEAD` **basıldı** ve **BOŞ** çıktı.

| tur | dosya | ajan dokundu mu | ne bozuldu | sonuç |
|---|---|---|---|---|
| **HM-1** | `engine/src/fabricease.hpp` | ❌ **hayır** | dokuma kapak çapası 0.04 → 0.004 | 🔒 **DERLENMEDİ** — `static_assert` reddetti. Kapıdan sert mühür |
| **HM-1b** | `engine/src/fabricease.hpp` | ❌ **hayır** | **örme ≥%38** çapası 0.00 → 0.05 | 🚨 **BUILD 0, İKİLİ KIMILDADI** (`756783b7` → **`b3c896a0`** → geri `756783b7`) **ve YEDİ KAPI DA YEŞİL** → **DELİK, borç 93** |
| **HM-2** | `web/js/download.js` | yalnız `?v` | inen DXF'ten `Bow` **adı** silindi | yeşil — ama yalnız **24 bayt** (etiket satırı) gitti, geometri kaldı → **zayıf, HÜKÜM YOK** |
| **HM-2b** | `web/js/engine.js` | ✅ evet | **indirme yolu editi SESSİZCE YUTUYOR** (`editExtendMM:0`, `editAttach:0`) | 🚨 **BEŞ KAPI DA YEŞİL** (`indir_check`·`hedef_kosu`·`expressability`·`extend_check`·`attach_check`) → **DELİK, borç 94** |
| **HM-3** | `contract/fabric-catalog-v1.json` | ❌ **hayır** | jersey `stretchPct` 50 → 0 | ✔ **`fabric_catalog_check` EXIT 1**, ve düşen kalemler **adıyla borç 88'in İKİ YENİ KOLU** (oyuk + büzgü) |
| **HM-4** | `engine/src/skirt.cpp` | ❌ **hayır** | etek ucu eğrisinin kontrol noktası | `extend_check` YEŞİL → **HÜKÜM YOK** (kapı bilerek **göreli**: operatörü yargılıyor, çizimi değil) |
| **HM-5** | `engine/src/hem.cpp` | ❌ hayır | desen tutmadı | **KOŞMADI** — hükümsüz, öyle yazıldı |

🚨 **HAKEM KENDİ HATASINI YAZIYOR:** HM-1'in ilk turunda `cmake --build` **rc=2**
ile düştü ve hakem bunu görmeden ikili çalıştırdı; **bayat ikililer** üstünden
*"hiçbir kapı kCap'i tutmuyor"* diye **yanlış bir ara sonuç** üretildi. Derleme
kodu okununca hata bulundu, deney **kontrollü olarak yeniden kuruldu** ve sonuç
**tersine döndü** (çapa derleme zamanında mühürlüymüş). **Bayat ikili = HÜKÜM
YOK** kuralı bu turda **hakemin kendi başına** geldi ve kayda geçti.

---

## 6. HAKEMİN AÇTIĞI ÜÇ KALEM

### 🚨 borç 93 — **ÖRME KAPAK ÇAPASI KAPISIZ, VE F7'NİN ZEMİNİ ONU OKUYOR**
`sleeve.hpp` yalnız **iki** çapayı mühürlüyor: stretch **0.0** (dokuma) ve
`kKnitDefaultPct` = **12.5** (stable). **`{38.0, 0.00}` · `{63.0, 0.00}` ·
`{88.0, 0.00}` mühürsüz** ve `fabric_ease_check`'in tablosu (`:68-74`) **göğüs ve
bel** payını pinliyor, **kapağı değil**. F7'den önce bu çapa yalnız **hedefi**
sürüyordu ve arkasında sert **0.01 zemini** duruyordu; F7'den sonra **zeminin
kendisi**. **HM-1b ölçtü: kımıldatılabiliyor ve yedi kapı da yeşil kalıyor.**
▸ **Dokuma etkilenmiyor** (derleme mührü) — bu **örmeye özel** bir açıklık.
▸ **F8'in işi:** `sleeve.hpp`'ye üç `static_assert` daha, ya da
`fabric_ease_check`'e bir kapak satırı. **Tek satırlık iş.**

### 🚨 borç 94 — **TARAYICI EDİT YOLU KAPISIZ** (sapma sorusunun tam kalbi)
`web/js/engine.js:232-233` kullanıcının editinin motora geçtiği **TEK** yer.
**HM-2b** orayı `editExtendMM: 0` / `editAttach: 0` yaptı — yani *"10 cm uzat"*
sessizce çöpe gidiyor — ve **beş kapı da yeşil kaldı.**
Sebep yapısal: `extend_check`/`attach_check` **C++**'tır ve `GarmentSpec`'i
**kendileri** kurar, JS telinden geçmezler; `indir_check` hiçbir edit alanı
**set etmez**. ▸ **F8'in işi:** `indir_check`'e bir edit kolu (edit'li ve
edit'siz iki indirme, **hash'leri farklı olacak**). **Kartın kendi sürücüsü
dist'ti, o yüzden bu bir ŞART İHLALİ DEĞİL** — ama sapma sorusunun cevabı
bugün bir kapıya bağlı değil.

### borç 87 — **hâlâ açık, ve bilerek** (hakem onaylıyor)
`fabric_catalog_check:303-310`'un `anyDifferent` kolu **üçü birden aynıysa**
yanıyor. Hakem kaynağı okudu ve **ajanın kararını doğruladı**: sertleştirmek
**hakemin kendi K62 kararını** kırmızı yakardı. Kart *"doğru yol 88'dir"*
diyordu; **88 yapıldı ve HM-3 ile bağımsız kanıtlandı.**

---

## 7. DEĞİŞMEZLER — **HAKEM HEPSİNİ KENDİ HASH'LEDİ**

`hedef_kosu.mjs` **`7370b86d`** ✔ · `hedef-kosu-taban.json` **`0ea0cb44`** ✔ ·
`flat_pattern_agree_check.mjs` **`05384380`** ✔ · `labels-hakem.json` **`c21964a8`** ✔ ·
`expressability_check.mjs` **`04c61f03`** ✔ · `KOSU-v7.md` **`158da859`** ✔ ·
`golden-reference.csv` **`a3ec26a6`** ✔ · `mannequin-chart-v1.json` **`8f78f73e`** ✔ ·
`vocab_reference_check.sh` **`e1b55e85`** ✔ · `flat_expresses_spec_check.mjs` **`24fc6a29`** ✔ ·
`vocab-reference-baseline.json` **`8c016108`** ✔.

- 🚨 **`hedef_kosu.mjs --taban` KOŞTURULMADI** (K60/borç 79) — **hakem de koşturmadı.**
- 🚨 **`patterns_real/` PUSHLANMADI:** takipli **41 → 41** (`F7-oncesi` ve `HEAD`
  iki uçta da 41). Diskteki **üç takipsiz kalem takipsiz kaldı.**
- 🚨 **`golden` fikstürü EL DEĞMEDİ**, `repin-golden.sh` koşturulmadı (K51).
- **Holdout `11` `12` `30` `35` HARCANMADI** — hedef seti `01·02·03·04·05·13·31·32·37·38`.
  **DOKUZUNCU KART.** `_olcum_seti.yedek_5` (`10·14·15·34·36`) **el değmedi** (K16).
- **Kapsam:** `git diff --stat F7-oncesi..HEAD` = **162 dosya, +2380 / −565**;
  **web dışı yalnız 17 dosya**, hepsi kartın remitinde. Web'in tamamına yakını
  **yalnız `?v` 138 → 139**.
- **Gevşetilen eşik YOK. İKİ kapı EKLENDİ, BİR kapı SERTLEŞTİ** (`fabric_catalog` 59→61).

---

## 8. CIRCIR — **SAĞLAM. Hakem kendi koşturdu, hiçbir sayı kötüleşmedi.**

| sayı | taban | **HAKEMİN ÖLÇÜMÜ** |
|---|---|---|
| ⭐ **H8-ifade — PAY** | **2 / 5** (hakem kesti, K66) | **4 / 5 — HANE, TUTTU (+2)** |
| ⭐ **H8-ifade — PAYDA** | 5, mühürlü | **5 — kımıldamadı** |
| H1 | 5/5 · 10/10 | **5/5 · 10/10 — TAVANDA** |
| H2 | %95.2 · %93 | **%95.2 · %93** |
| H3 | 2 · 2 | **2 · 2** |
| **H4** | ÖLÇEMEDİM | **ÖLÇEMEDİM — ON DÖRDÜNCÜ FAZ, UYDURULMADI** |
| H5 pay / payda | 0 / 5 | **0 / 5 — pay 0'da, payda büyümedi** (K64) |
| H6 | 0 / 16 (n=8) | **0 / 16** |
| H8-sözlük | 31 · 61 | **31 · 61 — sözlük daraltılmadı** |
| H10 | %58.3 · %64.4 | **%58.3 · %64.4** |
| **H10a** | %17.5 · %29.7 | **%17.5 · %29.7 — yükseltilmedi** (K21) |
| **H10b** | %40.0 · %33.1 | **%40.0 · %33.1 — §0B TAVANI KIMILDAMADI** |
| H10e | 3 · 5 | **3 · 5** |
| H10x | %0.8 · %1.7 | **%0.8 · %1.7** |
| **H11** | ~3 ms | **medyan 2.1 ms, en kötü 34.6 ms** (n=10) |

### ⭐ H11 — HAKEM **EDİT HATTINI DA** ÖLÇTÜ (ajan ölçmemişti)

`hedef_kosu`'nun H11'i **edit KAPALI** yolu ölçüyor. Hakem edit AÇIK hâlini
ayrıca sürdü (40 tur, `draft + dxf`):

| hâl | medyan | en kötü |
|---|---|---|
| editsiz | 4.59 ms | 21.60 ms |
| `op.extend` 100 mm | **4.65 ms** | 5.42 ms |
| `op.attach` fiyonk | **4.70 ms** | 5.05 ms |
| ikisi birden | **4.66 ms** | 5.65 ms |

**Editin maliyeti ≈ +0.06…+0.11 ms.** **10 sn tavanının ~2000 katı altında.**

⚠ **H6'nın `n`'i 8 STİL**, H1..H11'inki **5/10 fotoğraf** — **harmanlanmadı.**

---

## 9. KARARLAR — bu turda dördü

| # | karar |
|---|---|
| **K66** | **H8-ifadenin TABANI 2/5'tir, 3/5 değil.** Kartın tablosu yanlıştı; ajan kendi aleyhine bildirdi, hakem `F6-yesil`'de mühürlü betiği koşturdu ve **ajanı haklı buldu.** Şart *"en az 4"* → **4/5, kazanç +2.** |
| **K67** | **Borç 92: YAYIN VAR, ajan bulamadı — ama F7'nin yerleşimi AYAKTA KALIYOR.** Sayı hakemin: uzat/kısalt çizgisi **bel→etek ucu orta noktası**, EU38'de **331.0000 mm**. |
| **K68** | **Borç 93 açıldı:** örme ≥%38 kapak çapası **kapısız**, ve F7'nin zemini onu okuyor (HM-1b). **Dokuma etkilenmiyor** — orası derleme zamanında mühürlü. |
| **K69** | **Borç 94 açıldı:** **tarayıcı edit yolu kapısız** (HM-2b). Şart ihlali değil (kartın sürücüsü `dist`'ti), ama sapma sorusunun cevabı bir kapıya bağlı değil. |

---

## 10. BORÇ — F7 sonrası

**BU KARTTA KAPANDI:** **86** (örme × kollu DXF — kökten, ve `indir_check` 6B ile
**BAYT** kapılı) · **88** (oyuk + büzgü bir tabana bağlandı, **HM-3 ile bağımsız
kanıtlandı**) · **78** (`?v` 139, `site-health` OK) · **92** (**karara bağlandı, K67**).

**AJANIN AÇTIĞI:** 89 (mutasyon betiği `git checkout` ile commit'lenmemiş işi
siler — **hakem `git fsck`/`reflog` ile aradı, KAYIP YOK; ajanın onarımı `shasum`
ile doğrulandı: dist `756783b7`, mutasyon öncesi ikiliyle bayt bayt aynı**) ·
**90** (`op.extend` kolu uzatmıyor — **hakem doğruladı: Sleeve BAYT-AYNI**) ·
**91** (`op.attach`'ın `hostEdge`/`ratio`/`position`/`standHeightMM`/`panel`
parametreleri **ilan edilmiş, TÜKETİLMİYOR** — **hakem sözleşmeyi ve motoru
karşılaştırdı, doğru**).

**HAKEMİN AÇTIĞI:** **93** (örme kapak çapası kapısız) · **94** (tarayıcı edit
yolu kapısız).

**AÇIK ve devrediyor:** 39 · 40 · **41** (K33, **onuncu fazdır tetiklenmedi**) ·
42 · 44→54 · **51** · 52 · 55 · **57/K44** · **58** (`op_fixture` **366.73 sn**) ·
60 · **61** (**on üçüncü oturum — hakemin turunda DÖRT yanlış ateş daha: üç kez
"tests are RED" ilan edilmiş beş kırmızının logu okunurken, bir kez de
`ctest-tail-hides-verdict` bir `cmake --build | tail -2` boru hattında. Dördü de
`rabadon wrong` ile kaydedildi, `guard.json`'a DOKUNULMADI**) · **62/77** · 63 ·
64 · **65** · 67 · 70 · 71/74 · **72** (**DOĞRULANMADI**) · **73** · **75** ·
**79** · **80** · **81** · **82** · **83** · **84** · **87** (bilerek) · **89** ·
**90** · **91** · **93** · **94**.

**Hâlâ açık ve silinemez:** gerçek tarayıcıda **hiç tıklanmadı** (**on dördüncü
faz**, DOĞRULANMADI — ama artık **canlıda ve tıklanabilir**) · miras beşin
**ÜÇÜNÜN** kök sebebi **bu koşuda da aranmadı** · **H4 / H9 ÖLÇEMEDİM** ·
H5 payda **5**, **dokuzuncu kez** · sevk edilen giysi **HÂLÂ STRAPLESS** ·
`download.js`'teki `kokenKaydi = null` arka kapısı · `pages.yml:23` = **bu push
canlıya çıktı, beş İLAN EDİLMİŞ kırmızıyla** · `patterns_real/` **PUBLIC** (K10) ·
holdout **4 fotoğraf, HARCANMADI**.

---

## 11. NEDEN "KALDI" DEĞİL

Üç delik bulundu (93 · 94 · zayıf HM-2) ve **hiçbiri kartın yedi şartından
birini düşürmüyor**:

- Kart `op.extend`/`op.attach` için **motorda ölçülen** bir sonuç istedi ve
  sürücüyü **kendisi `engine/dist` olarak yazdı**. O sürücüde dördü de ölçüldü.
- Kart *"pencereyi gevşetme"* dedi; **gevşetilmedi** — hakem üç ayrı yoldan
  doğruladı, biri **derleyicinin kendisi**.
- Kart *"H8 payı ≥4"* dedi; **4 oldu, ve taban aslında daha aşağıdaydı.**
- Kart *"borç 86 bir KAPIYLA kapansın"* dedi; **kapandı ve kapı BAYT yargılıyor.**

93 ve 94 **yeni yüzeylerin kapısız kalması**dır — F7'nin ürettiği kusur değil,
F7'nin açtığı yüzeyin bir sonraki kartta pinlenmesi gereken kısmı. İkisi de
**tek satırlık** iş ve **F8'e adıyla yazıldı.**

---

**Sonraki kart:** `GECE7/F8.md` — **AL DENE + BUĞRA KÖR KONTROLÜ.**
**Etiket:** `F7-yesil`.
