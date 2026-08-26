# AJAN KARTI — F5-C (`op.split`) 🧩 HALKA 2 SÜRÜYOR · F5'in ÜÇÜNCÜ alt-kartı

Bu kartı **hakem** yazdı (F5-B hükmünden sonra, §3.7). **HEDEF DEĞİŞMEDİ** —
hakemin yapamayacağı tek şey odur: **fotoğraf + prompt → kalıp + flat.**

Faz öncesi etiket: **`F5B-yesil`**. Main'de çalışılır, branch açılmaz.
Geri alma: `git reset --hard F5B-yesil`.

## OKUMA LİSTESİ — bu kart + `KOSU-v7.md` şu bölümler, fazlası DEĞİL (§3.11)

**§0 · §0B · §3.4 · §3.5 · §3.6 · §3.7 · §3.8 · §3.10 · §3.12 · §4A · §4B**

▸ **§4C'yi okuma**, F4'ün listesinde.
▸ `GECE7/HAKEM-F5B.md` **okunur** — bu kartın bütün sayıları oradan gelir.
▸ Kararlar: **K23 · K28 · K29 · K30 · K31 · K32 · K33 · K34 · K35 · K36 · K37 · K38 · K39.**

---

# ⛔ F5 TEK KARTTA KOŞULAMAZ. "F5'İ BİTİRDİM" DİYEN AJAN REDDEDİLİR (§3.12).

**Bu alt-kart BİR operatör kapatır: `op.split`.** Bugün motorda **2** operatör
var (`op.rotate`, `op.suppress`); bu kart bitince **3** olur, **12'si kuyrukta
kalır** ve adlarıyla basılıdır. *"Operatörleri yazdık"* bir kapı değildir.

**Tahmin: 2–3 oturum, tavan 6.** Aşarsan **DUR ve hakeme gel** — o noktada problem
kartın kendisidir. **Sessizce sürünmek yasak.**

---

## OPERATÖR SEÇİMİ — HAKEM SEÇTİ, DAYANAK ÖLÇÜLEN SAYI (§3.4)

Hakemin kendi `expressability_check` koşusundan, **beraberlik yok, tek lider var**:

```
   4 giysi  op.split
   3 giysi  op.attach
   1 giysi  op.derive · op.extend · op.gather · op.overlay
```

`op.split` **paydanın 5 giysisinin 4'ünü** tek başına bloke ediyor — ve
`stitchu-sheath-eu38`'in (motorun **KENDİ** sevk ettiği giysi) kalan **TEK**
eksiği odur. Kapanırsa **H8-ifade 4/5 → 3/5** beklenir.

▸ **`op.attach` SIRADAKİ** ve F5-D'nin adayıdır. **Ajan operatör seçemez** (§3.4).

---

## ⭐ İŞ 0 (ZORUNLU, HER ŞEYDEN ÖNCE) — F5-B'DE BULUNAN HER BOŞLUK

**Beşi de `op.split`'e başlamadan ÖNCE kapanır.** İkisi hakemin kendi turunda
ölçtüğü borçtur ve **bir kez daha ertelenemez** (K37, K38).

### İŞ 0a — 🚨 SÜİT SÜRESİ (borç 43, K37) — **KARARA BAĞLANACAK**

**Hakem ölçtü, temiz Release, sıfırdan:**

| kapı | F5-A | F5-B |
|---|---|---|
| `rotate_check` | **4.78 sec** | **391.34 sec** (**82×**) |
| `suppress_check` | yoktu | **375.74 sec** |
| **tam `ctest`** | — | **1080.09 sec** |

İki kapı **767.08 sn** = süitin **%71'i**. Kök sebep: her iki araç da
`skimBodice=OFF` planı kuruyor ve **vücudu izleyen gövdenin flatten'ı pahalı**.

🚨 **`op.split` operatör başına ÜÇÜNCÜ bir pahalı kapı eklerse süit 1500s'yi
aşar.** Bu kart **yeni bir kapı ekleyecek**, yani borç burada **çözülmek
zorunda.**

**Şart — biri, ve ÖLÇÜLEREK:**
* ya üç operatör kapısı **tek bir paylaşılan fikstürden** okur (plan **bir kez**
  kurulur, üç kapı onu tüketir),
* ya da pahalı kol **`ctest`ten çıkarılmadan** ucuzlatılır (ör. daha küçük
  ızgara — **ama o zaman ölçülen açı değişir ve YENİ sayı 55.1735 ile YAN YANA
  yazılır**).

⚠ **KAPI SİLMEK ÇÖZÜM DEĞİLDİR** (§3.8 md.4). `-E` ile dışlamak, `DISABLED`
yapmak, kolu zayıflatmak **yasak**. **Önce/sonra saniyeyi karta yaz.**

▸ **BİLİNMESİ GEREKEN (K37):** rabadon'un `pushGate`'i bugün **zaten
geçilemez** — miras 6 kırmızının **3'ü** (`flat_pattern_agree_check` ·
`flat_artifact_census` · `sizechart_source_check`) kapının **kapsamında** ve
`100% tests passed` satırı hiç basılamıyor. **Süre bu kapıyı kırmadı.**
Yine de 767s **gerçek bir maliyettir** ve onarılacaktır. **`guard.json`'a
DOKUNMA.**

### İŞ 0b — 🚨 `maxDartDeg` TAVANI (borç 44, K38) — **KARARA BAĞLANACAK**

`op.suppress` bir panele **TEK** kama açıyor: **55.1735°**. Motorun kendi
`SheathOptions::maxDartDeg` alanı **14°** ilan ediyor — **dört katı** — ve
motorun kendi `dartColumnsFromDeficitRows`'u yükü **birden çok pense** bölüp
sütunu dikişe uzaklıkla ağırlıklandırıyor.

**Bu tam olarak `op.split`'in konusudur ve o yüzden bu kartta.** Yükü bölmek bir
**bölme** işlemidir.

**Şart:** ya `op.split` bastırma yükünü **birden çok kamaya bölüyor** ve her
birinin açısı **ölçülen deficit'ten** düşüyor (toplamları korunur — **ölçülür**,
iddia edilmez), ya da **bölmüyorsa** sebebi **sayıyla** yazılır ve
`maxDartDeg = 14` ile **yan yana** basılır.
⚠ **14'e ayar yapma** (§3.10): 14 motorun **çok-pensli** yerleşimine ait bir
sayıdır, tek kamaya uygulanacağının **yayınlanmış dayanağı görülmedi**.
**Tutmuyorsa tutmuyor diye yazılır.**

### İŞ 0c — 🚨 PAYDANIN İKİ KÜNYESİZ SATIRI (K39)

**H8-İFADE 4/5, "KÜNYESİZ DAYANAK" damgası taşıyor** ve F5-C'de **cırcır
dayanağı olarak KULLANILAMAZ.** Sebep: 5/5→4/5 düşüşünün **tamamı**
`freesewing-bella`'dan geldi ve o, paydanın **DOĞRULANMADI** iki satırından biri.

**Şart:** `freesewing-bella` ve `freesewing-aaron`'un gereksinim kümeleri
**yayınlanmış bir kaynağa** bağlanır (parça listesi / desen dokümantasyonu),
**künye karta yazılır.**
⚠ **SIFIR API ÇAĞRISI** (§3.9) ve **fixture yenilemek bir faz kararıdır.**
Kaynak bu makinede yoksa **"KÜNYE BULUNAMADI"** yazılır, satır **paydada
KALIR**, **payda DARALTILMAZ** (K31/K39). **Uydurma künye, künyesizlikten
kötüdür.**

### İŞ 0d — MUTASYON YAYILIMI (borç 47)

F5-B ajanı M1/M7/M7b'yi *"yazmadım"* diye işaretledi; **hakem ölçtü, yanlıştı**
(`surfacepattern.hpp` **+28**, `surfacepattern.cpp` **+33/−10**).

**Şart:** en az **ÜÇ mutasyon**, **ÜÇ AYRI** ve **gerçekten dokunulmamış**
dosyada. **`git diff --numstat F5C-oncesi..HEAD -- <dosya>` BOŞ olduğunu karta
YAZ** — etiket iddia değil, ölçüm.

### İŞ 0e — `tek_nesne_check`'in KOŞULSUZ ÖZET SATIRI (borç 48)

**Hakem ölçtü (HM-B):** 10 `FAIL`'in yanında *"ok K6 14 yayınlanan ölçü BAĞIMSIZ
İKİNCİ YOLDAN doğrulandı"* satırı **yine basıldı**. Exit kodu doğru (**1**), ama
loga bakan bir insan **yeşil bir cümle** görüyor. K33'ün *"hiçbir şey ölçmedim ≠
her şey geçti"* dersinin küçük tekrarı.

**Şart:** özet satırı **yalnız o kolun ihlali yokken** basılır. Kanıt: HM-B
tekrarlanır (`GarmentSurf::at()` ×1.05) → satır **basılmaz**, exit **1**; geri
al → satır basılır, exit **0**. **Loglanır.**

---

## ⭐ İŞ 1 — `op.split` MOTORA GİRER

**Bugün ne var:** hiçbir şey. `contract/primitives-v1.json`'da `op.split`'in
`motorda_kapi`'si **`null`** ve öyle olmalı.

**Kapanış şartı — üçü birden, yoksa kapanmaz:**

- **Kendi dosyası, kendi kapısı:** `engine/src/panelsplit.{hpp,cpp}` · sürücü
  `engine/tools/split-op.cpp` (**kendi geometrisi YOK**, canlı `SeamPlan`'ın
  panelini alır — `rotate-op` / `suppress-op` emsali) · kapı
  `engine/tests/split_check.mjs`, **`ctest`e kayıtlı.**
  🚨 **K35 YÜRÜRLÜKTE:** `motorda_kapi` operatörün **KENDİ** adını taşımak
  zorunda — `op.split → split_check`. **Var olan bir kapının adını ödünç almak
  KIRMIZI yanar** ve H8-ifadeyi bedavaya düşürmenin yoludur.
- **BÖLME BİR SAYIDAN DÜŞER, YAZILMAZ.** Panel **nereden** bölüneceğini bir
  kadrandan değil, **panelin kendi ölçülen geometrisinden** okur (deficit
  sütunları / eğrilik yığılması / dikiş grafiğinin kendi düğümleri — hangisiyse
  **ölçülür ve yazılır**). Bir `atFraction` parametresi bölmeyi **kadrana geri
  çevirirdi**; `suppressPanel()`'in açı parametresi olmaması emsaldir.
- **KORUNAN NİCELİK ÖLÇÜLÜR.** Bölmede **alan korunur** (iki parçanın toplamı ≡
  bütünün alanı) ve **kesilen kenar iki tarafta AYNI uzunlukta** (`walk` emsali).
  ⚠ **Çevrenin korunacağını VARSAYMA** — K29'un dersi: `rotate`'te "çevre
  korunur" **yanlış bir kapıydı**. Neyin korunduğunu **önce ölç, sonra kapıya
  bağla**, ve **korunmayanı `korunmayan` bloğuna yaz.**
- **Mutasyon:** bölmeyi kimliksizleştir (bölündü işaretle, geometriyi bırak) →
  **kırmızı**; bölme yerini bir sabite çevir → **kırmızı**; geri al → **yeşil**.
  Ve iki parça da **kendini KESMEZ.**

▸ **Bir isim SİLİNİYORSA bayt bayt kanıtlanır** (§4A). `cupseam.cpp`
`split + rotate + derive` bileşimine bağlı; bu kart bitince **üçünden ikisi**
olur, `derive` hâlâ yok. **Çözülemeyen isim KALIR ve kuyruğa yazılır.**
▸ **Sayaç kullanıcı arayüzüne ÇIKMAZ** (F3'ün kuralı sürüyor).

---

## ⭐ İŞ 2 — H8, **İKİ SAYI** OLARAK BASILIR (K31, ŞART)

**H8-sözlük** (`hedef_kosu.mjs`, cırcıra bağlı, `n` ile) ve **H8-ifade**
(`expressability_check.mjs`, paydası **adlı**) **ayrı satırda** basılır,
**harmanlanmaz.**

🚨 **PAYDA MÜHÜRLÜ (K31) VE PAY DA MÜHÜRLÜ (K35).**
`TABAN_PAYDA` bloğuna **ajan DOKUNMAZ.** Payda **büyüyebilir, DARALAMAZ**.
Ve bir operatörü "motorda" saymanın **tek** yolu, **kendi adını taşıyan kayıtlı
bir kapıdır** — hakem F5-B turunda ödünç-ad deliğini ölçtü ve kapattı.

**Beklenen:** `op.split` motora girince `stitchu-sheath-eu38` **ÇEVRİLEBİLİR**
olur → **H8-ifade 4/5 → 3/5.** Olmuyorsa **sebebi yazılır**, sayı zorlanmaz.
⚠ **İŞ 0c yüzünden:** 4/5 künyesiz dayanaklıdır; 3/5'e düşerken **hangi
giysinin** düştüğü ve **künyesinin olup olmadığı** ayrıca yazılır.

---

## F5-C'NİN FAZ KAPISI — dokuzu da zorunlu, hepsi ÖLÇÜLEN

1. **`ctest --test-dir engine/build --output-on-failure` → `6 failed out of N`**,
   altı ad tam olarak miras altı: `flat_pattern_agree_check` ·
   `flat_artifact_census` · `style_check` · `sizechart_source_check` ·
   `contract_check` · `figure_check`. **Yedinci ad = alt-kart kapanmaz.**
   `N` bugün **123**; yeni test eklersen büyür, **kırmızı sayısı büyümez**.
   ⚠ `108 - h10_gate_check` **DISABLED** ve öyle kalır (K18).
   ⚠ **`ctest`in son satırını KOPYALA, ÖZETLEME.**
   ⚠ **ÖNCE `-DCMAKE_BUILD_TYPE=Release` ile TEMİZ DERLE** (K32).
2. **`bash engine/tests/vocab_reference_check.sh` → `HUKUM: YESIL`**, bugünün
   toplamı karta yazılır (bugün **10310** / taban **10438**). Taban **kesilmez**,
   SCOPE **daraltılmaz** (K2/K11/K12).
   ⚠ **K12 TUZAĞI:** kapı **commit'ten** okur. **Commit'le, sonra koştur.**
3. **`node engine/tests/indir_check.mjs` → EXIT 0.** `KOKEN_ALANLARI` **38'in
   altına DÜŞMEZ** (K13).
4. **`node engine/tests/hedef_kosu.mjs` → EXIT 0, `CIRCIR SAĞLAM`**, ve
   **H10a + H10b + H10x = H10** tutar.
5. **`python3 -m pytest -q` → 33 passed** veya daha fazla. `labels-hakem-BOS.json`
   **boş** kalır (K14).
6. **`node engine/tests/tek_nesne_check.mjs` → EXIT 0**, K6 doğruluk kolu
   **korunur** (14 ölçü), ve **İŞ 0e** yapılmış olarak: HM-B'de özet satırı
   **basılmaz.**
7. **`rotate_check` ve `suppress_check` → EXIT 0**, ve **İŞ 0a'nın önce/sonra
   saniyesi** karta yazılı.
8. ⭐ **`node engine/tests/split_check.mjs`** var, `ctest`e kayıtlı, bölme yerini
   **panelin kendi geometrisinden** düşürüyor ve **iki mutasyonla kırmızı**.
9. **`expressability_check` → EXIT 0**, H8-ifade paydasıyla basılı,
   **`TABAN_PAYDA` el değmemiş**, ve **K35 kolu korunmuş** (ödünç ad kırmızı).

## CIRCIR — F5'İN HANESİ: **H4 · H5 · H8** (§3.6). Her sayıda `n`.

| sayı | taban | F5-C'den beklenen |
|---|---|---|
| **H4** | **ÖLÇEMEDİM** (sekiz fazdır) | F5-B kımıldatmadı. **F5-C'nin şartı DEĞİL** ama `split` yeni bir **kenar rolü** ilan ediyorsa `reason` alanı **buradan** başlayabilir — başlarsa **sayıyla**, başlamazsa **"ÖLÇEMEDİM"**. |
| **H5** | **0 / 5 ölçülebilen çift** | 🚨 **BURASI F5-C'NİN GERÇEK ŞANSI:** `split` **yeni bir dikiş çifti** doğurur (kesilen kenarın iki tarafı). Payda **büyürse** yaz, **önce/sonra** ikisini de bas. Payda büyümeden **0→0 kazanım DEĞİL.** |
| **H8-sözlük** | **31** (26 oov + 5 alan), n=5 · **61** (51+10), n=10 | kötüleşemez. **Sözlük daraltarak düşürmek §0B ihlalidir.** |
| **H8-ifade** | **4 / 5** (n=5), payda **MÜHÜRLÜ**, **KÜNYESİZ DAYANAK damgalı** (K39) | **3/5 bekleniyor.** Payda **daraltılamaz** (K31), pay **şişirilemez** (K35). |

**Diğerleri kötüleşemez** (§3.6): H1 **10/10** (n=10) · H2 **%95.2** (insan
anahtarı) · H3 **2** · H10 %58.3 · **H10b %40.0** (cırcır **yalnız buna**,
**§0B tavanı burada**) · H10e **3** · H10x **%0.8** · H11 3.2ms (<10 sn tavanı).
**H10a cırcıra BAĞLI DEĞİL** (K21) — **H10a'yı yükselterek faz kapatılmaz.**
**H6 istisnası F5'e tanınmadı.**

▸ **İKİ `n`'i TEK TABLODA HARMANLAMA.** H3 · H8 · H10e **mutlak sayaçtır**.
▸ **§0B tavanı:** H10b yükselirken H2 yükselmiyorsa **faz KAPANMAZ.**

## DEĞİŞMEZLER — faz ajanı bunlara dokunamaz

- `contract/hedef-kosu-taban.json` — **yalnız hakem** (§3.8 md.1). Blob bugün
  **`cf2af8c7d3c4603eee5aea252f3568feedda8d10`**.
- 🚨 **`expressability_check.mjs`'teki `TABAN_PAYDA` bloğu — YALNIZ HAKEM** (K31),
  **ve K35'in `X_check` konvansiyon kolu — YALNIZ HAKEM.**
- `engine/tests/hedef_kosu.mjs`'in **eşikleri ve tanımları gevşetilmez.**
- `vision/eval/labels-hakem.json` — **cevap anahtarı; ajan bir yargıyı DÜZELTMEZ,
  TAŞIMAZ, SİLMEZ.** Mühürlü (K19).
- `vision/eval/labels.json` · `labels-hakem-BOS.json` (**boş kalır**) ·
  `live-2026-08-22.json` · `live-hedef10-2026-08-26.json` (**bankalı fixture'lar**).
- `engine/tests/flat_expresses_spec_check.mjs` ve tabanı — **tek bayt** (K17).
  ⚠ **Takipli yeni bir `.json` bu kapıyı kırmızı yakabilir** — bu koşuda **iki
  kez** oldu. Dosya eklediysen **TAM `ctest`i tekrar koştur.**
- `engine/tests/vocab_reference_check.sh` + `vocab-reference-baseline.json` —
  **tek bayt** (K2/K11/K12).
- 🚨 **`flat_pattern_agree_check`'e DOKUNMA. K23 F4'E BAĞLIDIR VE BURAYA
  TAŞINDI Kİ KAYBOLMASIN:** kök sebep bulundu ama **onarılmadı** — merkez-ön
  yayında **28.7714mm**, motorun kendi sertifikalı düzleştirme bütçesinin
  (`flatten_check` strain <%0.5) **7.6 katı**. Kapının §2 biçimi **F4'ün manken
  çizelgesine** bağlı; `flatJSON`'un `bedenlendirme` bloğu bugün
  **`YAYIN BULUNAMADI`** basıyor, yani **yayınlanmamış bir dönüşüme karşı kapı
  tanımlanamaz** (§3.10) ve **yeniden yazacak olan HAKEMDİR** (§3.8 md.1).
  Onarmak **geometri işidir, F5'in kartında yok.**
  **Halka 3 (F4 → F6 → F7 → F8 → F9) F5 bitince açılır — ŞİMDİ AÇILMAZ.**
- Hiçbir kapının eşiği gevşetilmez (§3.8 md.4). **Kapı yanlışsa hakeme getirilir**
  (K29/K36 emsali: F5-B ajanı R0 için tam bunu yaptı ve **doğru davrandı**).
- **F0'ın, F2'nin, F3'ün, F5-A'nın ve F5-B'nin işi sökülmez.** `beden` bir
  eksendir ve **KALIR**. `nodeId()`'nin siluet kolu **geri alınmaz** (K24).
  `suppressPanel()`'e **açı parametresi EKLENMEZ** (K36/§4A).
  `rotate_check`'in R0 **çapraz-ölçüm** kolu **sabite geri çevrilmez** (K36).
- **`patterns_real/` altına tek yeni dosya eklenmez** (K10 kapanana kadar).
  Diskteki takipsiz kalemler (`BUGRA-DEFTER.md` · `geometry/` ·
  `tools/bugra-geometry-*.json`) **takipsiz kalır**, `git add` görmez.
  ▸ Hakem doğruladı: takipli sayı **41 → 41**, **pushlanmadı.**
- **`KOSU-v7.md`'ye TEK BAYT yazılmaz** (K26).
- **`_olcum_seti.yedek_5`'e (`10 · 14 · 15 · 34 · 36`) DOKUNULMAZ** (K16).
  ⚠ **Havuzda kullanılmayan yalnız 4 fotoğraf kaldı: `11` `12` `30` `35`.**
  **Holdout tükeniyor** — harcarsan gerekçeni karta yaz.
- **`.rabadon/guard.json`'a DOKUNULMAZ.** Yanlış pozitif gelirse kaçış
  rabadon'un kendi yolundan: `rabadon wrong <kural> "…"`.

## NOTLAR — hakemden faz ajanına

- **KAPIYI KOŞTUR. TAM `ctest` KOŞTUR.** Bu makinede artık **~1080 sn** sürüyor
  (hakem ölçtü); bitmesini bekle, `-R` ile geçiştirme. **İŞ 0a bu sayıyı
  düşürecek** — düşürdüğün sayıyı **önce/sonra** yaz.
- **Kendi mutasyonunu koştur ve LOGLA** (`GECE7/log/f5c.mutasyon.txt`).
  ⚠ **`GECE7/log/f5b.mutasyon.sh` İYİ YAZILMIŞ — kopyala.** Nesneyi her turda
  siler, `shasum` ile ikilinin kımıldadığını kanıtlar, `cmp` ile kaynağın
  değiştiğini kontrol eder, kımıldamazsa **"HUKUM YOK"** yazar.
  ▸ **`ikili` alanının hangi hash'lerin birleşimi olduğunu logun İÇİNE yaz.**
  ▸ ⚠ **F5-B'de mutasyon betiği bir kez ARADA ÖLDÜ ve ağacı mutasyonlu bıraktı.**
    **Zincirleri kısa tut**, her turdan sonra `git status` ile sıfırlandığını
    doğrula.
- **Mutasyonlarını KENDİ YAZMADIĞIN dosyalara da yay** (İŞ 0d) — ve **etiketini
  `git numstat` ile KANITLA.** F5-B'de etiket yanlıştı.
- ⚠ **`.rabadon` KİLİDİ YANLIŞ POZİTİF VERİYOR.** Hakem bu turda **iki kez**
  yedi (`ctest-tail-hides-verdict` bir `git diff | tail -2` üstünde; `red-base`
  miras 6 kırmızı üstünde) ve **ikisini de `rabadon wrong` ile kaydetti.**
  **Hiçbir stitchu kapısını gevşetme.**
- ⚠ **`git stash`'i TEK BAŞINA koştur** — F5-A'da bir zincirin içinde bloklandı
  ama `git stash pop` yine de koştu ve başka bir oturumun stash'ini açtı.
- **Sayı bulunamıyorsa uydurma** (§3.10). Bu koşuda *"YAYIN BULUNAMADI"*,
  *"H4 ÖLÇEMEDİM"*, ve F5-B'nin **41.48'e ayar yapmayı REDDETMESİ** — üçü de
  doğru davranıştı.
- **Bildirmek ucuz, gizlemek pahalı.** F5-B ajanı süit süresini, tek-kama
  tavanını, künyesiz paydayı ve **kendi kartının dayanağını zayıflatan bir
  RET'i** kendi yazdı; hükmü bu **güçlendirdi.**
- **Damla'ya soru sorulmaz** (§3.4) — `GECE7/DAMLA.md`'ye yazılır, **en
  kısıtlayıcı** varsayımla ilerlenir, koşu durmaz.
- **`git status` temiz bırak.** Takipsiz `patterns_real/` kalemleri bu koşunun
  kirliliği değil; **push'a karıştırma.**
- **SIFIR API ÇAĞRISI** (§3.9). Fixture yenilemek bir **faz kararıdır.**

## SAPMA SORUSU — cevabı ÖLÇÜLMÜŞ olacak

> *"Sevk edilen giysi artık **kendi panellerini bölebiliyor** mu — bölme yeri bir
> kadrandan değil panelin kendi geometrisinden mi düşüyor, bölünen kenarın iki
> tarafı **dikilebilir** mi (H5 paydası büyüdü mü?), ve `split` yazıldıktan sonra
> **H8-ifade kaç**?"*

*"`split`'i yazdık"* = **sapma, reddedilir.** Cevap bir dosya yolu + bir kapı
çıkışı + iki mutasyonun kırmızısı + **korunan niceliğin ölçülmüş sayısı** +
**paydası mühürlü** bir H8-ifade sayısı + **İŞ 0a'nın önce/sonra saniyesi**dir.

## BORÇ — devreden 42 + F5-B'nin ekledikleri + hakem turu

**F5-B'nin devrettiği 42 madde AYNEN duruyor** (md.39 K32 · md.40 K34 · md.41
K33 · md.42 wasm↔native düğüm eşitliği — **dördü de AÇIK**), ve üstüne:

43. 🚨 **İKİ KAPI 767.08 SANİYE YİYOR** → **İŞ 0a, bu kartta çözülecek** (K37).
44. 🚨 **Tek kama `maxDartDeg`'in dört katı** → **İŞ 0b, bu kartta çözülecek** (K38).
45. **`suppress` ÜRÜNE HÂLÂ DEĞMİYOR** — `draftJSON`/web hattına bağlı değil,
    kullanıcı bir pens açtıramıyor. **`split` için de aynısı sorulacak.**
46. **Sevk edilen giysinin pensi YOK ve bu bir ÜRÜN kararıdır.** `top/dart/woven`
    sınıfının **adı ile geometrisi ayrışıyor**. İki yol var, **ikisi de hakemin**:
    ya sınıfın adı düzeltilir, ya gövde `skimBodice`'ten çıkarılır (gerinim
    %0.0071–0.1501 → %2.96–48.12). **Ne ajan ne F5-B hakemi seçti — Halka 3.**
47. **Mutasyon etiketlemesi** → **İŞ 0d.**
48. **`tek_nesne_check`'in koşulsuz özet satırı** → **İŞ 0e.**

Hâlâ açık, bu alt-kartın kapatmak zorunda olmadığı ama **silemeyeceği**:
gerçek tarayıcıda **hiç tıklanmadı** (**DOĞRULANMADI**, headless harness yok,
sekiz fazdır) · miras 6 kırmızının **4'ünün** kök sebebi aranmadı · inen 7
dosyanın **5'i sessiz** · `download.js`'teki `kokenKaydi = null` arka kapısı ·
**H4/H6/H9 ÖLÇEMEDİM** · H5 tek çiftten okunuyor · `vocab_reference_check` bir
**satır sayacı** (K12) · **K17** kapı ölçüm verisini ürün spec'i sayıyor ·
`conftest.py` bir kapsam kapısıdır ve **hiçbir mutasyonla korunmuyor** ·
`pages.yml:23` `branches: [main]` = **main'e her push canlıya çıkıyor** ·
`patterns_real/` **PUBLIC** (K10, Damla kararı) · holdout **4 fotoğrafa** düştü ·
payda 5'in **2'si künyesiz** (K39 → İŞ 0c) · borç md.30 (`SeamPlan::sinif` tek
dize) ve md.31 (`GarmentSurf` kopyalanıyor, **DOĞRULANMADI**) açık.

---

# AJAN KARTI — F5-C (`op.split`)

**Ağaç:** `main` @ `F5B-yesil`. Geri alma: `git reset --hard F5B-yesil`.
**Bu bir ALT-KARTTIR (§3.12).** F5 **BİTMEDİ**. Operatör kümesi bu kart bitince
**3** olur, 15 hedefin **12'si kuyrukta** ve adlarıyla basılı.
*"F5'i bitirdim"* **denmiyor.**
