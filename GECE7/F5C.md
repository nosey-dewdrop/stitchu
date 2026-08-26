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

---

# AJAN KARTI — F5-C (`op.split`)

**Ağaç:** `main`. Faz öncesi etiket `F5C-oncesi` (hakem attı, dokunulmadı).
Geri alma: `git reset --hard F5C-oncesi`.
**Bu bir ALT-KARTTIR (§3.12).** F5 **BİTMEDİ.** Motorda artık **3** operatör var
(`op.rotate` · `op.suppress` · `op.split`), **12'si kuyrukta** ve
`expressability_check` onları adlarıyla basıyor. *"F5'i bitirdim"* **denmiyor.**

## KAPI — önce → sonra, hepsi ÖLÇÜLDÜ, `ctest`in son satırı KOPYALANDI

```
95% tests passed, 6 tests failed out of 125

Total Test time (real) = 701.10 sec

The following tests did not run:
	110 - h10_gate_check (Disabled)

The following tests FAILED:
	  9 - flat_pattern_agree_check (Failed)
	 19 - flat_artifact_census (Failed)
	 20 - style_check (Failed)
	 27 - sizechart_source_check (Failed)
	 98 - contract_check (Failed)
	104 - figure_check (Failed)
```

**Altı ad TAM OLARAK miras altı. YEDİNCİ AD YOK.** `110 - h10_gate_check`
DISABLED ve öyle kaldı (K18). `N` **123 → 125**: iki yeni `add_test`
(`op_fixture` · `split_check`), kayıtlı **124 → 126**, `ctest`in "out of" satırı
DISABLED olanı düşüyor. **Kırmızı sayısı büyümedi.**

| kapı | ÖNCE (F5-B, hakem) | SONRA (F5-C) | `n` |
|---|---|---|---|
| `ctest` (temiz Release) | **6 failed / 123**, **1080.09 s** | **6 failed / 125**, **701.10 s** | — |
| `op_fixture` (YENİ) | yoktu | **366.61 s** | — |
| `rotate_check` | **391.34 s** | **25.03 s** | — |
| `suppress_check` | **375.74 s** | **0.04 s** | — |
| `split_check` (YENİ) | yoktu | **12.57 s** | — |
| `tek_nesne_check` | EXIT 0 | **EXIT 0**, 22.51 s, K6 **14/14** | — |
| `expressability_check` | EXIT 0 | **EXIT 0**, 0.05 s | n=5 |
| `vocab_reference_check` | YESIL **10310** / taban 10438 | **HUKUM: YESIL**, **10312** / taban **10438** | 37 eksen + 92 kelime |
| `indir_check` | EXIT 0, `KOKEN_ALANLARI` 38 | **EXIT 0**, **38** (taban 38) | — |
| `hedef_kosu` | EXIT 0, CIRCIR SAĞLAM | **EXIT 0, CIRCIR SAĞLAM** | n=5 · n=10 |
| `python3 -m pytest -q` | 33 passed | **33 passed** in 0.65s | — |

**H8 İKİ AYRI SATIR (K31), harmanlanmadı:**

| | önce | sonra | `n` |
|---|---|---|---|
| **H8-SÖZLÜK** (`hedef_kosu`) | **31** (26 oov + 5 alan) · **61** (51+10) | **31** · **61** — kötüleşmedi, sözlük **daraltılmadı** | n=5 · n=10 |
| **H8-İFADE** (`expressability_check`) | **4 / 5**, payda MÜHÜRLÜ, **KÜNYESİZ DAYANAK damgalı** | **3 / 5**, payda **MÜHÜRLÜ ve TAM**, ve **damga KALKTI (İŞ 0c)** | n=5 |

**H10a ve H10b AYRI:** H10a **%17.5 → %17.5** (n=5) · **%29.7 → %29.7** (n=10) —
cırcıra bağlı değil (K21), **yükseltilmedi**. H10b **%40.0 → %40.0** (n=5, 48/120)
· **%33.1 → %33.1** (n=10) — **§0B tavanı KIMILDAMADI**, yani "H10b yükselirken H2
yükselmiyorsa faz kapanmaz" şartı **tetiklenmedi**.

## CIRCIR — F5'in hanesi H4 · H5 · H8. Her sayıda `n`.

| sayı | taban | F5-C sonrası | hüküm |
|---|---|---|---|
| H1 | 5/5 (n=5) · 10/10 (n=10) | **5/5 · 10/10** | tavan (K25) |
| H2 | %95.2 (40/42, n=5) · %93 (66/71, n=10) | **%95.2 · %93** | aynı |
| H3 | 2 · 2 | **2 · 2** | aynı |
| **H4** | **ÖLÇEMEDİM** (sekiz fazdır) | **ÖLÇEMEDİM** | ⚠ aşağıda, **uydurulmadı** |
| **H5** | **0 / 5** ölçülebilen çift | **0 / 5** | ⚠ **payda BÜYÜMEDİ → kazanım YAZILMADI** |
| **H8-sözlük** | 31 · 61 | **31 · 61** | kötüleşmedi |
| **H8-ifade** | **4 / 5** | **3 / 5** | ⭐ **DÜŞTÜ** |
| H10 | %58.3 · %64.4 | **%58.3 · %64.4** | aynı |
| H10a | %17.5 · %29.7 | **%17.5 · %29.7** | cırcıra bağlı değil, yükseltilmedi |
| **H10b** | **%40.0 · %33.1** | **%40.0 · %33.1** | **§0B tavanı kımıldamadı** |
| H10e | 3 (n=5) · 5 (n=10) | **3 · 5** | aynı |
| H10x | %0.8 · %1.7 | **%0.8 · %1.7** | aynı |
| H11 | 3.2 ms medyan | **2.9 ms** (n=5) · **2.0 ms** (n=10), en kötü 32.6 ms | tavanın (10 sn) çok altında |

**H4 — ÖLÇEMEDİM, ve neden ölçemediğim bir cümle değil bir yer:** `hedef_kosu`
kendi satırında yazıyor — *"F5 dört sebep katmanı kodda yok"*. `op.split` bir
dikiş **doğuruyor** (kesilen kenarın iki tarafı) ama o dikiş `draftJSON`'un
`stitches[]`'ine ve `reason` alanına **bağlanmadı**; bağlamak F5'in kalan
alt-kartlarının işi. **Kartın şartı değildi ve uydurulmadı.**

**H5 — PAYDA BÜYÜMEDİ, VE BU KARTIN EN DÜRÜST OLMASI GEREKEN SATIRI.**
`split` gerçekten **yeni bir dikiş çifti** doğuruyor ve iki tarafı **birebir eşit**
(ölçüldü: fark **0.0e+0 mm**, uzunluklar 359.679077708 / 370.509791612 /
373.854685901 mm — çünkü iki kapanış segmenti **aynı iki koordinatı** birleştiriyor).
**Ama `hedef_kosu`'nun H5 paydası 0/5'ten kımıldamadı**, çünkü `split-op`'un
ürettiği iki parça `SeamPlan`'a geri **yazılmıyor** ve hedef koşusu onları
görmüyor. Kartın kendi kuralı: *"Payda büyümeden 0→0 kazanım DEĞİL."*
→ **KAZANIM YAZILMADI.** Borç 51.

---

## ⭐ İŞ 0 — BEŞİ DE KAPANDI, HEPSİ SAYIYLA

### İŞ 0a — SÜİT SÜRESİ (borç 43, K37): **1080.09 s → 701.10 s (−378.99 s)**

**Önce kök sebep ölçüldü, sonra dokunuldu.** `suppress-op`'un üç plan
kurulumunun süresi tek tek zamanlandı (bu makine, temiz Release):

| plan | süre |
|---|---|
| `shipped` (skimBodice=ON) | **4.58 sec** |
| `following` (skimBodice=OFF, maxDartDeg=0) | **8.57 sec** |
| **`doubled` (skimBodice=OFF, maxDartDeg=14)** | **366.17 sec** |

Yani 375.74 saniyenin **%97'si TEK bir plan** — motorun kendi türettiği pensler
açıkken ızgara slit'lerle doluyor ve ARAP yakınsaması uzuyor. Ve **`rotate-op`
tek başına yalnız 13.4 sec**: `rotate_check`'in 391.34 saniyesinin 378'i
kendisinin değil, **R0 için ikinci kez koşturduğu `suppress-op`'un**dı.
**Aynı 375 saniye süitte iki kez ödeniyordu.**

**Yapılan (kartın verdiği iki seçenekten BİRİNCİSİ):** `suppress-op` bir ctest
`FIXTURES_SETUP` testinde (`op_fixture`) **BİR KEZ** koşar, `-o` ile JSON'unu
yazar; `suppress_check` ve `rotate_check` o dosyayı okur.

- ⚠ **HİÇBİR KAPI SİLİNMEDİ, `-E` KULLANILMADI, HİÇBİR ESİK GEVŞETİLMEDİ**
  (§3.8 md.4). Okunan JSON **aynı ikilinin aynı koşumudur**; ölçülen tek bir sayı
  değişmedi (55.1735 · 56.6688 · −1.9628 · −0.1116 hepsi birebir aynı).
- ⚠ **K36 KORUNDU.** R0 hâlâ **ÇAPRAZ** bir ölçüm: kıyaslanan sayı hâlâ
  `suppress-op`'un motordan okuduğu develop-deficit'tir, bir sabit değil. İki
  kapı da dosyanın `"op"` alanını denetliyor — ilgisiz bir JSON göstermek
  **KIRMIZI** yanar (K35'in ödünç-ad dersinin dosya hâli).
- ⚠ **`guard.json`'a DOKUNULMADI.**
- **Ve `split_check` süite ÜÇÜNCÜ bir 375 saniye eklemedi: 12.57 sec.** Çünkü
  `split-op` pahalı `doubled` planına ihtiyaç duymuyor — bölme **BÜTÜN** panelin
  profilini okur, motorun kendi slit'leriyle delinmiş bir panel bütün değildir.

**Operatör kapılarının toplamı: 767.08 s (2 kapı) → 404.25 s (4 kapı, fikstür
dahil).** Operatör başına maliyet artık **~13 sn**, 375 değil.

### İŞ 0b — `maxDartDeg` TAVANI (borç 44, K38): **KARARA BAĞLANDI, SAYIYLA**

**`op.split` bastırma yükünü GERÇEKTEN bölüyor, ve toplam KORUNUYOR:**

| panel (skimBodice=OFF) | tek kama (F5-B) | bölmeden sonra | toplam | en büyük |
|---|---|---|---|---|
| `left_ftorso` | **55.1735°** | **26.8401° + 28.3334°** | **55.1735°** (fark 0.000000000°) | **28.3334°** |
| `left_btorso` | **56.6688°** | **29.9374° + 26.7314°** | **56.6688°** (fark 0.000000000°) | **29.9374°** |

⚠ **VE 14'E AYAR YAPILMADI (§3.10).** Motorun kendi ilanı
`SheathOptions::maxDartDeg = 14°`; bölmeden sonraki en büyük kama **28.3334° =
2.02×** ve **29.9374° = 2.14×** — **HÂLÂ TUTMUYOR ve tutmuyor diye yazılıyor.**
Dört kat **iki kata** indi, ama 14'e uyacak bir bölme sayısı seçmek eşiği
**bugünkü sayıya uydurmak** olurdu (K29 emsali), ve 14 motorun **çok-pensli**
yerleşimine ait bir sayıdır — tek kamaya uygulanacağının **yayınlanmış dayanağı
GÖRÜLMEDİ**. İki sayı **yan yana** basılıyor, eşitlenmiyor. **Borç 54 açık.**

### İŞ 0c — PAYDANIN İKİ KÜNYESİZ SATIRI (K39): **KÜNYE BULUNDU, İKİSİ DE**

**"KÜNYESİZ DAYANAK" damgası KALKTI.** Kaynak hatırlanmadı, **yayınlanmış
dokümantasyon açıldı** ve her gereksinim **kendi cümlesine** bağlandı. Künyeler
`expressability_check.mjs`'in `kaynak`/`gerektirir` alanlarına da yazıldı;
**`TABAN_PAYDA` bloğuna TEK BAYT dokunulmadı** (mühür, K31).

**`freesewing-bella`** — FreeSewing docs, *"Bella"*,
`freesewing.eu/docs/designs/bella/` (+ `/options/`). Kod aynası:
`codeberg.org/freesewing/freesewing` `designs/bella/src/back.mjs`, ki repoda
`knowledge/seed_round2_formulas.sql:22` aynı dosyadan pens formülünü **zaten
künyeli** taşıyordu.
- *"A FreeSewing pattern for a **womenswear bodice block**"*; kesim: 1 Front on
  fold + 2 Back; Techniques listesinde **"dart"**.
- **`op.suppress`** → *"**Bust Dart Length**: The maximum length brings the dart
  all the way to the bust apex"* · *"**Waist Dart Length**"* · *"**Back Dart
  Height**: Controls the height (length if you will) of the back dart"*.
- **`op.rotate`** → *"**Bust Dart Angle**: The angle of the bust dart… attempts
  to set the angle of the **top leg of the dart** at the requested angle"*.
  Pensin **apeks etrafındaki açısını** bir tasarım seçeneği yapmak, pens
  transferinin ta kendisidir. **Bu, paydanın en zayıf satırıydı ve artık en
  doğrudan künyeli olanı.**

**`freesewing-aaron`** — FreeSewing docs, *"Aaron A-Shirt"*,
`freesewing.eu/docs/designs/aaron/` (+ `/options/`).
- **`op.split`** → kesim talimatı *"Cut **1 back** on the fold"* + *"Cut **1
  front** on the fold"*.
- **`op.attach`** → *"Cut **3 strips** for neck opening and armhole binding"*, ve
  caveats *"There is **no seam allowance on the armholes**"* / *"…on the neck
  opening"* — kenar dikişle değil **biyeyle** bitiyor.
- **`op.extend`** → *"**Length bonus**: The amount to lengthen the garment. A
  negative value will shorten it"* (−20%…60%) · *"**Armhole depth**: Controls the
  depth of the armhole"* (−10%…50%) — **sürekli eksen**, künyeli.

⚠ **SIFIR API ÇAĞRISI (§3.9): fixture yenilenmedi, VLM koşturulmadı, tek kuruş
harcanmadı.** Bunlar yayınlanmış doküman sayfalarıdır.
⚠ **Ve bu kartın H8-ifade düşüşü ZATEN künyesiz bir kaleme dayanmıyor:** 4/5 →
3/5'i sağlayan giysi **`stitchu-sheath-eu38`**, yani **motorun KENDİ sevk ettiği
giysi** — kaynağı `engine/src/surfacepattern.cpp`'nin kendisi.

### İŞ 0d — MUTASYON YAYILIMI (borç 47): **ÜÇ AYRI, DOKUNULMAMIŞ DOSYA, ÖLÇÜLDÜ**

Log: **`GECE7/log/f5c.mutasyon.txt`** · betik `GECE7/log/f5c.mutasyon.sh`.
**Etiket bir iddia değil bir ölçüm:** betik her turun başında
`git diff --numstat F5C-oncesi..HEAD -- <dosya>` **basıyor**.

| mut | dosya | numstat | ikili kımıldadı mı | kapı |
|---|---|---|---|---|
| **MS1** kimliksizleştir | `engine/src/panelsplit.cpp` | `175 0` → **YAZILAN** | evet | `split_check` **EXIT 1** |
| **MS2** bölme yerini sabite çevir | `engine/src/panelsplit.cpp` | `175 0` → **YAZILAN** | evet | `split_check` **EXIT 1** |
| **MS3** profili düzleştir, **toplamı koru** | `engine/src/surfacepattern.cpp` | `21 0` → **YAZILAN** | evet | `split_check` **EXIT 1** |
| **MU1** pens açısını sabite çevir | `engine/src/dartsuppress.cpp` | **BOŞ → DOKUNULMAMIŞ** | evet | `suppress_check` **EXIT 1** |
| **MU2** yayınlanan büst = bel | `engine/src/shellprojection.cpp` | **BOŞ → DOKUNULMAMIŞ** | evet | `tek_nesne_check` **EXIT 1** |
| **MU3** apeks künyesini geri kopyala | `engine/tools/rotate-op.cpp` | **BOŞ → DOKUNULMAMIŞ** | evet | `rotate_check` **EXIT 1** |
| **MB** `GarmentSurf::at()` ×1.05 | `engine/src/surfacepattern.cpp` | YAZILAN | evet | `tek_nesne_check` **EXIT 1** |
| **MC1** ödünç kapı adı (`geometry`) | `contract/primitives-v1.json` | YAZILAN | — | `expressability_check` **EXIT 1** |
| **MC2** olmayan kapı adı | `contract/primitives-v1.json` | YAZILAN | — | `expressability_check` **EXIT 1** |
| **MC3** paydayı daralt | `engine/tests/expressability_check.mjs` | YAZILAN | — | `expressability_check` **EXIT 1** |

**ONUNUN ONU DA KIRMIZI, onunun onunda da geri alma YEŞİL, ve her turdan sonra
`git status` temiz.** `ikili` sütunu **dört** shasum'ın (`seam-plan` |
`rotate-op` | `suppress-op` | `split-op`) ilk-8'lerinin birleşimidir ve **bu
tanım logun İÇİNDE** yazılı. **MU1 kendi fikstürünü YENİDEN ÜRETTİ** (2 × 366 sn)
çünkü `suppress-op`'un çıktı sayılarını değiştiriyor — **bayat fikstür üzerinde
hüküm verilmedi** (shasum `24c7bdfc` → `c3583474` → `24c7bdfc`, logda basılı).

⭐ **MS3 bu kartın en sert mutasyonu ve bilerek yazıldı:** sütun profilini
**düzleştirir ama TOPLAMI korur**, yani SP1 (profil toplamı = `developDeficitDeg`)
ve SP2 (deficit korundu) kollarını **geçer**. Yakalayan SP0'dır — kapı argmin'i
**kendisi yeniden hesapladığı** için "toplamı koruyan" bir sahtecilik de yanar.

### İŞ 0e — `tek_nesne_check`'in KOŞULSUZ ÖZET SATIRI (borç 48): **KAPANDI**

HM-B tekrarlandı (`GarmentSurf::at()` ×1.05), aynı log dosyasında:

| | F5-B (hakem) | F5-C |
|---|---|---|
| exit | 1 | **1** |
| K6 `FAIL` sayısı | 10 | **10** |
| *"…BAĞIMSIZ İKİNCİ YOLDAN doğrulandı"* satırı | **BASILDI** | **0 kez basıldı** |
| yerine basılan | — | *"K6 ÖZET BASILMADI: 14 ölçü denetlendi ama 10'i TUTMADI…"* |
| geri alındıktan sonra | — | exit **0**, özet satırı **1 kez** |

Sayaç **kolun kendi** sayacıdır (`k6Girdi`), global `fails` değil — başka bir
kolun kırmızısı bu satırı **bastırmaz**.

---

## ⭐ İŞ 1 — `op.split` MOTORA GİRDİ

**Dosyalar:** `engine/src/panelsplit.hpp` · `engine/src/panelsplit.cpp` ·
sürücü `engine/tools/split-op.cpp` · kapı `engine/tests/split_check.mjs`,
**`ctest`e `split_check` adıyla kayıtlı** (K35: `op.X → X_check`, ödünç ad
**MC1** ile sınandı ve **KIRMIZI** yanıyor).

### 1. BÖLME BİR SAYIDAN DÜŞÜYOR — parametre YOK

`splitPanel(const SurfacePanel&)` **tek argüman** alır. Kesim sütunu, panelin
**kendi ölçülen** per-sütun develop-deficit profilinden düşer:

```
C(c) = Σ sütun[0..c]        T = C(colsN)
kesim = max(|C(c)|, |T − C(c)|) değerini MİNİMİZE eden iç sütun
```

**Eşik yok, kesir yok, tolerans yok** — ölçülen sayılar üzerinde bir argmin.
Sözleşmenin taslağındaki `atFraction` **motordan tamamen koptu** (aşağıda,
borç 50). **Ölçülen: bölme yeri SABİT DEĞİL** — üç bölünen panelde **üç ayrı**
kesir: **16/32 (0.500000)** · **11/32 (0.343750)** · **13/32 (0.406250)**.
Tek bir `atFraction` SP5'i geçemez.

**Motora yeni bir alan girdi ve F5-B'nin hoist'i emsaldir:**
`SurfacePanel::deficitColumnDeg`. `columnDeficitRows()` bu niceliği **zaten**
hesaplıyordu ama `PanelGrid` alıyor ve o tip `surfacepattern.cpp`'nin dışına
çıkmıyor — yani bir bölme operatörünün iki seçeneği vardı: **bir araçta ikinci,
paralel bir deficit modeli kurmak** (bu dosyanın sürekli öldürdüğü hata sınıfı)
ya da bir kadran okumak. Panel motorun **kendi** rakamını taşıyor. Aynı döngü,
aynı iç-düğüm kümesi, aynı aritmetik — o yüzden satır bantlarıyla **birebir aynı
toplama** çıkıyor, ve "bölmede korunum" bir **ölçüm** olabiliyor (SP1).

### 2. KORUNAN NİCELİK ÖLÇÜLDÜ — VE KORUNMAYAN AYRI YAZILDI (K29)

**KORUNAN** (üç bölünen panelde de):
- **ALAN**: `alan_a + alan_b − alan_bütün` = **0.000000 mm²** (66582.3877 ·
  77352.1332 · 72441.8448 mm²).
- **İŞARETLİ DEFICIT**: A + B = bütün, fark **0.000000000°**.
- **KESİLEN KENAR İKİ TARAFTA AYNI**: fark **0.0e+0 mm** — çünkü iki kapanış
  segmenti **aynı iki koordinatı** birleştiriyor. İnşadan, ve **yine de çıkan iki
  kontur üzerinde ayrı ayrı ölçülüyor** (bir inşa iddiası kimse kontrol etmezse
  bir yorumdur).
- **SINIR NOKTASI SAYISI**: `nokta_a + nokta_b = panel_nokta + 2` (81+81 · 91+71
  · 87+75, panel 160). **Yeni nokta UYDURULMADI.**
- İki parça da **kendini KESMİYOR**.

**KORUNMAYAN — VE ÇEVRENİN KORUNACAĞI VARSAYILMADI** (K29'un `rotate` dersi:
"çevre korunur" **yanlış bir kapıydı**). Ölçüldü, **korunmuyor**, ve bir eşitlik
olarak değil bir **KİMLİK** olarak yargılanıyor:
`çevre_a + çevre_b = çevre_bütün + 2·kesik`. EU38 `left_ftorso` (skim OFF):
**986.2984 + 843.1977 = 1829.4961 = 1088.4765 + 2 × 370.5098** ✓.

### 3. SEVK EDİLEN GİYSİNİN KENDİ CEVABI — VE İKİSİ **RET**

| koşum | panel | cevap |
|---|---|---|
| `sevk_edilen_on` | `left_ftorso` | **BÖLÜNDÜ**, sütun 16/32 — ama **bastırma yükü YOK** (deficit −1.9628°, `op.suppress` zaten reddediyor) |
| `sevk_edilen_arka` | `left_btorso` | **REDDETTİ**: mutlak sütun profili **0.1116°** < taban **0.50°** |
| `sevk_edilen_etek` | `left_skirt_front` | **REDDETTİ**: mutlak sütun profili **0.0000°** |

Taban **yeni bir sayı değil**: `kNothingToAbsorbDeg` = 0.5, `dartsuppress.hpp`'nin
ilan ettiği ve `surfacepattern.cpp`'nin kendi pens tabanından gelen eşik.
**Tek eşik, tek otorite.** Ret **gerekçeli** ve gerekçe bir **sayı** (SP7).

### 4. ⭐ REPODA HİÇBİR KAPININ ÖLÇMEDİĞİ SAYI — HAKEMİN KİLİT UYARISI, ARTIK ÖLÇÜLÜ

Hakem yazmıştı: *"`developDeficitDeg` bantların **İŞARETLİ** toplamı. Bir panelde
+30/−30 birbirini götürüp operatörü yanlışlıkla 'reddet'e sürükleyebilir. **Bugün
hiçbir kapı bunu tutmuyor** ve hakem bunu ayrı ölçmedi (**DOĞRULANMADI**)."*

**ÖLÇÜLDÜ, EU38, `split_check` SP6 kolu:**

| panel (skim OFF) | işaretli toplam | mutlak sütun toplamı | **İPTAL OLAN** |
|---|---|---|---|
| `left_ftorso` | **+55.1735°** | **93.4063°** | **38.2327°** |
| `left_btorso` | **+56.6688°** | **91.0078°** | **34.3390°** |

**Yani `op.suppress`'in RET eşiğinin okuduğu sayının içinde 38.23° eğrilik
birbirini götürüyor** ve bunu bugüne kadar hiçbir kapı görmüyordu. Aynı hesap
SATIR bantlarında 23.66° veriyor (bantlar: … +8.881, **−11.654**, +5.646 …) —
sütunlarda daha fazla, çünkü halkanın önü ile arkası **ters şeyler istiyor**.
Bölmeden sonra iptal ayrıca parça başına basılıyor (`left_btorso`: A 32.9266° ·
B 1.4124°). **DOĞRULANMADI damgası kalktı; sayı artık her koşumda basılıyor.**
⚠ Ama **bir KAPIYA bağlı değil** — SP6 iptalin tanımını doğruluyor ve en az bir
panelde ölçülmüş olmasını şart koşuyor; *"iptal şu sayının altında kalmalı"*
diyen bir eşik **UYDURULMADI** (K29). **Borç 55.**

### 5. H8-İFADE **4/5 → 3/5**, VE DÜŞEN GİYSİNİN ADI YAZILI

`expressability_check`: **MOTORDA 3** (`op.suppress`, `op.rotate`, `op.split`).
**ÇEVRİLDİ** olan giysi **`stitchu-sheath-eu38`** — motorun **KENDİ sevk ettiği
giysi**, kaynağı `engine/src/surfacepattern.cpp`'nin kendisi, yani **künyesi
sorulacak bir kalem değil.** Kalan kuyruk, bloke ettikleri giysi sayısıyla:

```
   3 giysi  op.attach          <- sıradaki (hakem seçer, §3.4)
   1 giysi  op.derive
   1 giysi  op.extend
   1 giysi  op.gather
   1 giysi  op.overlay
```

**`TABAN_PAYDA`'ya tek bayt yazılmadı** (`git diff` ile doğrulandı: mühür bloğunda
**0** değişiklik). Payda **daralmadı**, pay **şişmedi** (MC1/MC2/MC3 üçü de
kırmızı).

### 6. `cupseam.cpp` — SİLİNMEDİ, ÇÜNKÜ ÜÇÜNÜN İKİSİ VAR (§4A)

`cupseam.cpp` `split + rotate + derive` bileşimine bağlı. Bu kart bitince
**üçünden ikisi** var, **`derive` hâlâ yok**. §4A md.: *"Çözülemeyen isim KALIR ve
kuyruğa yazılır."* → **KALDI**, `op.derive` kuyrukta **1 giysi** ile basılı.
**Bayt bayt silme kanıtı denenmedi ve denenmiş gibi de gösterilmedi.**

---

## SAPMA SORUSU — cevabı ÖLÇÜLDÜ, VE İKİNCİ YARISI HÂLÂ YARIM

> *"Bir yabancı fotoğraf yükleyip kalıp + flat indirebiliyor muyum, ve gerçek bir
> giysiden `split` gerektiren bir kalemi operatör programına çevirebiliyor muyum?"*

**BİRİNCİ YARI — EVET, ÖLÇÜLDÜ.** `hedef_kosu` **H1 = 10/10 (n=10)** ve **5/5
(n=5)**: girdilerin hepsi kalıp + flat üretti. `indir_check` **EXIT 0**,
`KOKEN_ALANLARI` **38** (taban 38). Bu kart onu **kötüleştirmedi**.

**İKİNCİ YARI — YARIM, VE SINIRI BİR SAYI SÖYLÜYOR.**
`stitchu-sheath-eu38`'in `op.split` gereksinimi artık **gerçek ve kapılı**:
motorun kendi sevk ettiği panel **bölünüyor**, bölme yeri panelin **kendi
geometrisinden** düşüyor, kesilen kenarın iki tarafı **birebir eşit**. Ve
`bugra-locket-top` ile `bugra-buttoned-corset-bustier`'in `op.split` satırları
da artık kuyrukta **eksik operatör** olarak görünmüyor.

⚠ **AMA BORÇ 45 `split` İÇİN DE AYNEN GEÇERLİ ve bunu bilerek yazıyorum:**
`split-op` **`draftJSON`/web hattına bağlı DEĞİL**. `grep` ile ölçüldü —
`panelsplit.hpp`'yi include eden tek şey `tools/split-op.cpp`; `garment.cpp`,
`wasm/bindings.cpp`, `web/js/*` **sıfır satır**. **Kullanıcı bir paneli
böldüremiyor.** Bu kartın kapattığı şey **operatörün gerçekliği**, **ürün yolu
değil** — F5-B'nin `suppress` için yazdığı cümlenin aynısı, ve iki kart üst üste
aynı şeyi yazıyorsa o artık bir not değil bir **cephe**dir. **Borç 49.**

⚠ Ve **H5 paydası büyümedi** (yukarıda): `split`'in doğurduğu dikiş çifti gerçek
bir geometridir ama hedef koşusunun sewability sayacına **girmiyor**. *"`split`'i
yazdık"* demiyorum: yazdığım şey **bir dosya yolu + bir kapı çıkışı + üç
mutasyonun kırmızısı + korunan üç niceliğin ölçülmüş sayısı + paydası mühürlü bir
H8-ifade sayısı + İŞ 0a'nın önce/sonra saniyesi**dir.

---

## ⚠ ÜÇ YEDİNCİ KIRMIZI DOĞDU, ÜÇÜ DE **KÖKTEN** KAPANDI (bildiriliyor, gizlenmiyor)

İlk tam koşuda **9 failed out of 125** çıktı. Üç yeni ad vardı ve üçü de
gerçekti:

1. **`preset_resolve_check`** (15 ihlal) — `op.split`'ten `atFraction`'ı silmek
   15 preseti çözülemez yaptı. **Kök sebep bakılınca F5-B'nin emsali burada
   birebir uygulanamıyordu:** `backSlit.vent` / `backSlit.slit`'te o kesir
   **yırtmacın nereye kadar dikildiği**, yani **gerçek ürün verisi**; silmek onu
   atmak olurdu. Yapılan: alan sözleşmede **DURUYOR** ama
   `motorda_tuketilmiyor: true` ile ve **`splitPanel()` onu OKUMAZ** diye
   işaretli. Kapı bunu iddiaya bırakmıyor — SP0 argmin'i kendisi hesaplıyor,
   **MS2** ve **MS3** kırmızı yanıyor. ⚠ **15 kesrin hiçbirinin yayınlanmış
   dayanağı GÖRÜLMEDİ** → **YAYIN BULUNAMADI**, `GECE7/DAMLA.md` md.12,
   **borç 50**.
2. **`vocab_reference_check`** — `HUKUM: FAIL (1 artan)`. Sebep bir **tek
   kelimeydi**: yeni bir yorum satırında kapalı bir enum değerinin adı geçiyordu
   ve gate **referans sayar** (K12). Cümle yeniden yazıldı; taban **kesilmedi**,
   SCOPE **daraltılmadı**, `--baseline` **çağrılmadı**. Toplam **10312** / taban
   **10438**. *(İkinci turda aynı kural bir kez daha yandı, çünkü düzeltme
   cümlesinin kendisi iki enum adı daha içeriyordu — o da yeniden yazıldı.)*
3. **`bundle_fresh_check`** — sevk edilen wasm, `SurfacePanel`'e alan eklenince
   kaynağın **bir commit gerisinde** kaldı. `bash engine/build-wasm.sh`
   koşturuldu, üç artefakt yeniden üretildi (`source stamp 2366c67d3be47938`),
   **PASS**. Gevşetme yok — sevk edilen motor yine bu repodaki motor.

**Son koşu: `6 failed out of 125`, tam miras altı, yedinci ad yok.**

---

## MÜHÜRLER — hepsi denetlendi

- `contract/hedef-kosu-taban.json` — **DOKUNULMADI.** Blob
  **`cf2af8c7d3c4603eee5aea252f3568feedda8d10`**, `F5C-oncesi` ile birebir aynı.
- `expressability_check.mjs`'in **`TABAN_PAYDA`** bloğu — **0 satır değişiklik**
  (K31). K35'in `X_check` konvansiyon kolu — **dokunulmadı**, MC1 ile sınandı.
- `KOSU-v7.md` — **0 satır** (K26). `vision/eval/labels-hakem.json` ·
  `labels-hakem-BOS.json` · `labels.json` — **0 satır** (K19/K14).
- `flat_expresses_spec_check.mjs` + tabanı — **0 satır** (K17). ⚠ Yeni takipli
  `.json` **eklenmedi**; eklenen dosyalar `.hpp`/`.cpp`/`.mjs`/`.sh`, ve **tam
  `ctest` iki kez** koşturuldu.
- `vocab_reference_check.sh` + `vocab-reference-baseline.json` — **0 satır**
  (K2/K11/K12).
- `flat_pattern_agree_check.mjs` — **0 satır. K23'e DOKUNULMADI**, kırmızı gerçek
  ve F4'ün/Halka 3'ün işi. Halka 3 **AÇILMADI**.
- `hedef_kosu.mjs` — eşik/tanım **gevşetilmedi** (0 satır).
- `suppressPanel()`'e **açı parametresi EKLENMEDİ**; `rotate_check`'in R0
  **çapraz-ölçüm** kolu **sabite geri çevrilmedi** (K36) — MU3 onu sınadı ve
  kırmızı yandı. `nodeId()`'nin siluet kolu **geri alınmadı** (K24). `beden`
  ekseni **KALDI**.
- **`patterns_real/` PUSHLANMADI ve `git add` GÖRMEDİ.** Takipli dosya sayısı
  **41 → 41**; üç kalem (`BUGRA-DEFTER.md` · `geometry/` ·
  `tools/bugra-geometry-*.json`) **takipsiz** duruyor (K10).
- **Holdout `11` `12` `30` `35` HARCANMADI** — ölçüm seti dosyalarında değişiklik
  **0**, `_olcum_seti.yedek_5`'e dokunulmadı (K16).
- **`.rabadon/guard.json`'a DOKUNULMADI.** `ctest-tail-hides-verdict` bir kez
  daha yanlış pozitif verdi (bu kez bir **`cmake --build … | tail -2`** üstünde,
  yani `ctest` bile değil) ve `rabadon wrong` ile **deftere kaydedildi**;
  `no-blanket-add-stitchu` doğru ateşledi ve komut açık yollara çevrildi.
- ⚠ **K33 bu koşuda tetiklenmedi** — checkout sembolik linkli değil, `/tmp`
  altında çalışılmadı. **Kapatılmadı, açık.**

---

## BORÇ — devreden 48'in durumu + F5-C'nin ekledikleri

**43** ✅ **KAPANDI** (süit 1080.09 → **701.10 s**, iki kapı 767.08 → dört kapı
404.25 s). **44** ⚠ **SAYIYLA CEVAPLANDI, KAPANMADI** → borç 54. **47** ✅
**KAPANDI** (üç ayrı dokunulmamış dosya, numstat basılı). **48** ✅ **KAPANDI**.
**39 (K32) · 40 (K34) · 41 (K33) · 42 (wasm↔native düğüm eşitliği)** — **dördü de
AÇIK**, hiçbiri bu kartın konusu değildi. **45** ⚠ **BÜYÜDÜ** → borç 49.
**46** (sevk edilen giysinin pensi yok, `top/dart/woven`'ın adı ile geometrisi
ayrışıyor) — **AÇIK, Halka 3, ne ajan ne hakem seçti.**

**F5-C'nin eklediği yedi kalem:**

49. 🚨 **`op.split` DE ÜRÜNE DEĞMİYOR.** `panelsplit.hpp`'yi include eden tek
    şey `tools/split-op.cpp`; `garment.cpp` / `wasm/bindings.cpp` / `web/js/*`
    **sıfır satır**. Borç 45 ile birlikte artık **iki operatör** aynı yerde
    duruyor: gerçekler, ama kullanıcıya ulaşmıyorlar. **Bu bir not değil, bir
    cephe** — ve hakemin bir alt-kartı buna ayırması gerekebilir.
50. **`op.split`'in `atFraction`'ı DECLARED ama TÜKETİLMİYOR**, ve 15 presetin
    taşıdığı kesirlerin **hiçbirinin künyesi yok** (YAYIN BULUNAMADI). Hangisi
    ürün verisi (yırtmaç boyu) hangisi kadran — **hakemin**, `GECE7/DAMLA.md`
    md.12.
51. **H5 PAYDASI BÜYÜMEDİ.** `split`'in doğurduğu dikiş çifti gerçek ve iki
    tarafı birebir eşit, ama `SeamPlan`'a geri yazılmadığı için `hedef_kosu`
    onu saymıyor. **0/5 → 0/5, kazanım YAZILMADI.**
52. **Bölme yalnız `vertical`.** Satır eksenli (omuz bandı) bölme SATIR profilini
    ve iki yan dikiş arasında ikinci bir eşlemeyi ister; **UYGULANMADI ve
    uygulandığı İDDİA EDİLMEDİ**, sözleşmede `axis` enum'u tek değere indi.
53. **Dengeli-yük kuralının YAYIN DAYANAĞI YOK.** Klasik kalıpçılıkta prenses
    dikişi genelde **maksimum eğrilik** (büst noktası) sütunundan geçer; panel
    dikişini dengeli-yük sütununa bağlayan bir yayın **bulunamadı**. İki kural
    EU38'de **farklı sütun** veriyor. Sütun profilinin tamamı basılıyor ki
    alternatif aynı çıktıdan okunabilsin. `GECE7/DAMLA.md` md.13.
54. **Bölmeden sonra en büyük kama HÂLÂ `maxDartDeg`'in 2.02× / 2.14× katı**
    (28.3334° / 29.9374° ↔ 14°). Dört kat iki kata indi; **ayarlanmadı**, ve
    14'ün tek kamaya uygulanacağının dayanağı hâlâ **görülmedi**.
55. **İPTAL bir KAPIYA bağlı değil.** 38.2327° / 34.3390° artık **ölçülüyor ve
    basılıyor** ama *"iptal şu sayının altında kalmalı"* diyen bir eşik
    **uydurulmadı** (K29). `op.suppress`'in RET eşiği hâlâ **işaretli** toplamı
    okuyor — yani bir +30/−30 paneli hâlâ yanlışlıkla reddedilebilir. **Bunu bir
    kapıya bağlamak `op.suppress`'in eşiğini değiştirmek demektir ve o bir
    HAKEM kararıdır** (§3.8 md.4).

**Hâlâ açık ve silinemez:** gerçek tarayıcıda **hiç tıklanmadı** (dokuz fazdır,
**DOĞRULANMADI**, headless harness yok) · miras 6 kırmızının **4'ünün** kök
sebebi aranmadı · inen 7 dosyanın **5'i sessiz** · `download.js`'teki
`kokenKaydi = null` arka kapısı · **H4/H6/H9 ÖLÇEMEDİM** · H5 tek çiftten
okunuyor · `vocab_reference_check` bir **satır/referans sayacı** (K12) · **K17**
kapı ölçüm verisini ürün spec'i sayıyor · `conftest.py` bir kapsam kapısıdır ve
**hiçbir mutasyonla korunmuyor** · `pages.yml:23` `branches: [main]` = **main'e
her push canlıya çıkıyor** · `patterns_real/` **PUBLIC** (K10, Damla kararı) ·
holdout **4 fotoğrafa** düştü ve **harcanmadı** · borç md.30 (`SeamPlan::sinif`
tek dize) ve md.31 (`GarmentSurf` kopyalanıyor, **DOĞRULANMADI**) açık.

---

**Kanıt dosyaları:** `GECE7/log/f5c.mutasyon.txt` (10 mutasyon, betiği
`f5c.mutasyon.sh`) · `GECE7/log/f5c.ctest.acilis.txt` (9 kırmızılı ilk tur) ·
`GECE7/log/f5c.ctest.kapanis.txt` (kapanış turu, 6 kırmızı / 125, 701.10 s).
