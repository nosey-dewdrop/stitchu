# AJAN KARTI — F5-E (**KÖPRÜ**) 🧩 HALKA 2 SÜRÜYOR · F5'in BEŞİNCİ alt-kartı

Bu kartı **hakem** yazdı (F5-D hükmünden sonra, §3.7). **HEDEF DEĞİŞMEDİ** —
hakemin yapamayacağı tek şey odur: **fotoğraf + prompt → kalıp + flat.**

Faz öncesi etiket: **`F5D-yesil`**. Main'de çalışılır, branch açılmaz.
Geri alma: `git reset --hard F5D-yesil`.

## OKUMA LİSTESİ — bu kart + `KOSU-v7.md` şu bölümler, fazlası DEĞİL (§3.11)

**§0 · §0B · §3.4 · §3.5 · §3.6 · §3.7 · §3.8 · §3.10 · §3.12 · §4A**

▸ **§4C'yi okuma**, F4'ün listesinde.
▸ `GECE7/HAKEM-F5D.md` **okunur** — bu kartın bütün sayıları oradan gelir.
▸ Kararlar: **K23 · K29 · K30 · K31 · K35 · K36 · K41 · K42 · K45 · K46 ·
  K47 · K48 · K49 · K50.**

---

# ⛔ BU KART BİR OPERATÖR EKLEMİYOR. `op.attach` BU KARTTA **YOK** (K48).

**Neden — ve gerekçe bir tercih değil, DÖRT KARTLIK BİR ÖLÇÜM:**

| §3.6 F5'e bunları verdi | F5 öncesi | F5-A | F5-B | F5-C | **F5-D** |
|---|---|---|---|---|---|
| **H8-ifade** | — | 5/5 | 4/5 | 3/5 | **3/5** — iki karttır durdu |
| **H5 (payda)** | 0/5 (**5**) | 0/5 (**5**) | 0/5 (**5**) | 0/5 (**5**) | **0/5 (5)** — **dört kez** |
| **H4** | ÖLÇEMEDİM | ÖLÇEMEDİM | ÖLÇEMEDİM | ÖLÇEMEDİM | **ÖLÇEMEDİM — onuncu faz** |

**F5-D hanesi TAMAMEN BOŞ kalan ilk alt-karttır**, ve sebebi ajanın kaçışı
**değil**, **kartın teşhisiydi** (K47, hakem kendi hatasını yazdı):

```
web/js/download.js:262   seamPlanFlat → flatJSON → SeamPlan         ← İNEN FLAT   ← F5-D BUNU BAĞLADI
web/js/create.js:1045    draft(spec)  → draftJSON → DraftedPattern  ← İNEN KALIP  ← H4 ve H5 BURADAN OKUNUYOR
engine/src/garment.cpp   operatör include'u: SIFIR SATIR
```

**ÜRÜN YOLU BİR TANE DEĞİL, İKİ TANE. F5-D birincisini bağladı. Bu kart
İKİSİNİ BİRBİRİNE BAĞLIYOR.** Kart tek işlidir.

**Tahmin: 2–3 oturum, tavan 6.** Aşarsan **DUR ve hakeme gel.**
**Sessizce sürünmek yasak.**

---

## ⭐ İŞ 0 (ZORUNLU, HER ŞEYDEN ÖNCE) — borç 66 / K49

### `op_program_check` `op.rotate`'İN **GEOMETRİSİNİ** DENETLEMİYOR

**Hakem ölçtü (HM-J2).** `engine/src/dartrotate.cpp`'de transfer açısı
`theta * 0.90` yapıldı:

| kapı | sonuç |
|---|---|
| `rotate_check` | **EXIT 1 🔴** — ALAN **32473.1791 → 36134.0402 mm²** (fark **3660.861111584**), AÇI **55.173533° → 49.656180°** (fark **5.517353326°**) |
| **`op_program_check`** | 🚨 **EXIT 0** |

**Ürün yolundaki bir transfer 3660 mm² kumaş üretti ve ürün kapısının sekiz kolunun
sekizi de geçti.** OP1'in *"soruldu, uygulandı, PLANA YAZILDI"*sı bir **KİMLİKTİR**;
rijitlik bir **DOĞRULUKTUR**. **K30'un sınıfı.**

**Şart:** `op_program_check` `op.rotate`'in **plana yazdığı** parçanın
**alanını ve kama açısını** planın kendi konturundan **yeniden ölçer** ve
`rotate_check`'in R2/R3 kimliklerini **ürün yolunda** kurar.
**KANIT ŞARTI — HM-J2 TEKRARLANIR:** `theta * 0.90` ile `op_program_check`
**EXIT 1**, geri alınınca **EXIT 0**. **Loglanır.**
⚠ **Eşik uydurma** (§3.10/K29). Alan ve açı **kimliktir**, tolerans değil —
`rotate_check`'in kendi epsilonları emsaldir, **gevşetilemez**.
⚠ **`rotate_check`'e DOKUNULMAZ** ve R0 çapraz-ölçüm kolu **sabite çevrilmez** (K36).

---

## ⭐⭐ İŞ 1 — **KÖPRÜ.** BU KARTIN TAMAMI BUDUR.

**Bugün ne var:** `SeamPlan` (operatörlerin çalıştığı, flat'ın indiği nesne) ve
`DraftedPattern` (kalıbın indiği, **H4 ve H5'in okunduğu** nesne) **birbirini
hiç bilmiyor**. `garment.cpp` altı adın hiçbirini include etmiyor
(`panelsplit` · `dartsuppress` · `dartrotate` · `planops` · `seamplan` ·
`surfacepattern` → **SIFIR SATIR**, hakem ölçtü).

### KAPANIŞ ŞARTI — **TEK ŞART, VE BİR SAYIDIR**

> 🚨 **`hedef_kosu`'nun H5 SATIRINDA PAYDA 5'TEN BÜYÜK OLACAK,
> VE BÜYÜMESİ `op.split`'in DOĞURDUĞU GERÇEK BİR DİKİŞ ÇİFTİNDEN GELECEK.**
> **ÖNCE ve SONRA paydanın ikisi de basılır.** `0/5 → 0/6` bir kazanımdır;
> `0/5 → 0/5` **DEĞİLDİR** (F5-A'dan beri aynı cümle, **beşinci kez**).

⚠ **PAYDAYI TANIMLA BÜYÜTMEK KAZANIM DEĞİLDİR.** `engine/tests/hedef_kosu.mjs`'in
eşikleri ve tanımları **MÜHÜRLÜ** (§3.8 md.1). Payda **gerçek bir çiftle** büyür.

### YOL — DAYATILMIYOR, AMA **ÖNCE ÖLÇÜLÜYOR**

**İLK İŞ BİR ÖLÇÜMDÜR, BİR AMELİYAT DEĞİL.** F5-D ajanı *"köprü bir yedinci
kırmızı doğurur"* dedi ve **kanıtlamadı** — bir liste saydı. **Bu kart o listeyi
SAYIYA çeviriyor:**

1. `DraftedPattern.pieces`'ı **gerçekten okuyan** her kapıyı `grep`'le bul ve
   **karta yaz** (ad + dosya + satır). Ajanın saydığı altı ad —
   `validator` · `printpack` · `cutplan` · `flat_expresses_spec_check` ·
   `style_check` · `figure_check` — **doğrulanacak, kopyalanmayacak.**
2. Bir **ölçüm koşumu** yap: `pieces`'a **tek** bir yeni parça çifti ekle,
   **TAM `ctest` koştur** ve **hangi kapının kırmızı yandığını SAYIYLA yaz**.
   Sonra **geri al**. Bu bir teslim değil, bir **keşiftir** ve loglanır.
3. O ölçümden sonra üç yoldan **biri**, ve hangisi seçilirse **gerekçesi sayı olur**:
   - **(a) Köprü kuruldu ve yedinci kırmızı DOĞMADI** → teslim et.
   - **(b) Yedinci kırmızı doğdu ama KÖKTEN kapanabiliyor** (F5-C üç tanesini
     böyle kapattı: `preset_resolve_check` · `bundle_fresh_check` ·
     `vocab_reference_check`) → **kökten kapat, kapıyı GEVŞETME**, teslim et.
   - **(c) Yedinci kırmızı doğdu ve kökten kapanmıyor** → **DUR, HAKEME GEL**
     (K29/K36/K40 emsali). **Kapıyı gevşetme, sayı uydurma, `-E` kullanma.**
     Gerekçeni **hangi kapı, kaç yargı, hangi sayı** diye yaz.
     ⚠ **Bu YOL (c) BİR BAŞARISIZLIK DEĞİLDİR** — ama K48 gereği **ikinci turda
     da (c) çıkarsa F5 DURUR** ve Halka 3 F4'ten açılır.

▸ ⚠ **HİÇBİR OPERATÖRÜN GEOMETRİSİ DEĞİŞMEZ.** `splitPanel()`'e **kesir
parametresi EKLENMEZ** (K41), `suppressPanel()`'e **açı parametresi EKLENMEZ**
(K36). Bu kart **köprü kuruyor**, operatör yeniden yazmıyor.
▸ **SEVK EDİLEN OKUMA DEĞİŞMEZ** (RULES 4). Köprü **opt-in** olabilir — ama
o zaman **H5'in okuduğu koşumda AÇIK** olmak zorundadır, yoksa payda büyümez.
▸ **RET DE GÖRÜNÜR** (§0B). Sessizce boş dönmek **yasak**.
▸ **Sayaç kullanıcı arayüzüne ÇIKMAZ** (F3'ün kuralı sürüyor).

---

## ⭐ İŞ 2 — borç 68: **TARAYICI ÜÇ OPERATÖRDEN YALNIZ BİRİNİ ÇALIŞTIRABİLİYOR**

**Hakem ölçtü.** `opsJSON()` (binding'in çağırdığı) **tek okuma** basar
(`sevk_edilen`); `opsJSONAll()` (kapının okuduğu `plan-ops`) **iki okuma** basar.
Sevk edilen gövde bir **koni**, o yüzden:

| tarayıcıdaki okuma | uygulanan | reddedilen | uygulanan operatörler |
|---|---|---|---|
| `sevk_edilen` | **2** | **26** | 🚨 **YALNIZ `op.split`** |

**Kullanıcı bir paneli BÖLDÜREBİLİYOR; bir pens AÇTIRAMIYOR, DÖNDÜREMİYOR.**

**Şart — ikisinden biri, ve seçim ÖLÇÜLEREK yapılır:**
- ya `op.suppress`/`op.rotate`'in **uygulandığı** bir yüzey de tarayıcıdan
  **ulaşılabilir** olur (`opsJSONAll` emsali — **gizli kadran değil**, iki yüzey
  de **adıyla** basılır, `planops.cpp`'nin kendi ilanı emsaldir),
- ya da **ölçülüp yazılır** ki sevk edilen giysi için bu iki operatörün cevabı
  **kalıcı bir RET**tir, **ve o cümle ürün yüzeyinde durur.**
⚠ **"Motorda var" bir ürün değildir** (`CLAUDE.md`'nin tek testi).
⚠ **`skimBodice`'ı sevk edilen giyside KAPATMA** — sevk edilen okuma değişmez.

---

## ⭐ İŞ 3 — `?v` DAMGASI (borç, F5-D ajanı bildirdi, çözmedi)

`web/js/create.js` · `engine.js` · `i18n.js` · `app.css` F5-D'de **değişti**,
`?v` **136'da kaldı**, ve `pages.yml:23` `branches: [main]` yüzünden **main'e her
push canlıya çıkıyor** — tarayıcılar **bayat JS** yiyebilir.
**Şart:** ya damga **bumplanır** (tek kaynak `engine/tools/site-version.mjs`,
`scripts/deploy.sh` emsali), ya da **neden bumplanmadığı bir YERE bağlanır**
(dosya + satır). ⚠ **`site-health.mjs` koşturulur ve çıktısı karta yazılır.**

---

## F5-E'NİN FAZ KAPISI — dokuzu da zorunlu, hepsi ÖLÇÜLEN

1. **`ctest --test-dir engine/build --output-on-failure` → `6 failed out of N`**,
   altı ad tam olarak miras altı: `flat_pattern_agree_check` ·
   `flat_artifact_census` · `style_check` · `sizechart_source_check` ·
   `contract_check` · `figure_check`. **Yedinci ad = alt-kart kapanmaz**
   (İŞ 1 yol (b)/(c) hariç: (b)'de **kökten kapatılmış** olacak, (c)'de
   **hakeme gelinmiş** olacak). `N` bugün **126**.
   ⚠ `111 - h10_gate_check` **DISABLED** ve öyle kalır (K18).
   ⚠ **`ctest`in son satırını KOPYALA, ÖZETLEME.**
   ⚠ **ÖNCE `-DCMAKE_BUILD_TYPE=Release` ile TEMİZ DERLE** (K32).
   ⚠ **SÜİT 741.71 sn** (hakem ölçtü). Kartın eklediği maliyeti **önce/sonra YAZ**.
2. **`bash engine/tests/vocab_reference_check.sh` → `HUKUM: YESIL`** (bugün
   **10320** / taban **10438**). Taban **kesilmez**, SCOPE **daraltılmaz**.
   ⚠ **K12 TUZAĞI:** kapı **commit'ten** okur. **Commit'le, sonra koştur.**
3. **`node engine/tests/indir_check.mjs` → EXIT 0**, `KOKEN_ALANLARI` **38'in
   altına DÜŞMEZ** (K13).
4. **`node engine/tests/hedef_kosu.mjs` → EXIT 0, `CIRCIR SAĞLAM`**, ve
   **H10a + H10b + H10x = H10** tutar.
5. **`python3 -m pytest -q` → 33 passed** veya daha fazla.
6. **`tek_nesne_check` · `rotate_check` · `suppress_check` · `split_check` ·
   `op_program_check` → beşi de EXIT 0**, ve **İŞ 0 yapılmış** olarak:
   HM-J2 (`theta * 0.90`) `op_program_check`'i **KIRMIZI** yakar.
7. ⭐⭐ **H5 PAYDASI BÜYÜDÜ**, önce/sonra ikisi de basılı.
   **Büyümediyse kazanım YAZILMAZ ve YOL (c) uyarınca HAKEME GELİNİR.**
8. ⭐ **`expressability_check` → EXIT 0**, **`TABAN_PAYDA` el değmemiş**, K35 ve
   K50 kolları korunmuş, **H8-ifade 3/5 KÖTÜLEŞMEMİŞ.**
9. ⭐ **KÖPRÜ ÖLÇÜLDÜ:** `grep` çıktısı karta yazılır — `garment.cpp` /
   `draftJSON` hattında `SeamPlan`'a ya da operatöre giden satır **VAR**,
   ve `hedef_kosu`'nun H5 satırı **yeni paydayı** basıyor.

## CIRCIR — F5'İN HANESİ: **H4 · H5 · H8** (§3.6). Her sayıda `n`.

| sayı | taban (F5-D sonrası, hakem ölçtü) | F5-E'den beklenen |
|---|---|---|
| **H4** | **ÖLÇEMEDİM** (onuncu faz) | bir **sayı**, ya da bir **KAPI** (K48 md.3) |
| **H5** | **0 / 5** — payda **5** | 🚨 **BU KARTIN TEK İŞİ. PAYDA > 5.** |
| **H8-sözlük** | **31** (26+5) n=5 · **61** (51+10) n=10 | kötüleşemez. **Sözlük daraltmak §0B ihlali.** |
| **H8-ifade** | **3 / 5** (n=5), payda **MÜHÜRLÜ** | **kötüleşemez.** Düşerse **gerekçesi ölçülür.** |

**Diğerleri kötüleşemez** (§3.6): H1 **5/5 · 10/10** · H2 **%95.2 · %93** · H3 **2** ·
H10 %58.3 · **H10b %40.0** (**§0B tavanı burada**) · H10e 3 · H10x %0.8 ·
H11 **3.2 ms** (<10 sn tavanı). **H10a cırcıra BAĞLI DEĞİL** (K21) — **H10a'yı
yükselterek faz kapatılmaz.** **H6 istisnası F5'e tanınmadı.**

▸ **İKİ `n`'i TEK TABLODA HARMANLAMA.** H3 · H8 · H10e **mutlak sayaçtır**.
▸ **§0B tavanı:** H10b yükselirken H2 yükselmiyorsa **faz KAPANMAZ.**

## DEĞİŞMEZLER — faz ajanı bunlara dokunamaz

- 🚨 **K23 — `flat_pattern_agree_check`'e DOKUNMA. F4'E BAĞLIDIR VE BURAYA
  TAŞINDI Kİ KAYBOLMASIN:** kök sebep bulundu ama **onarılmadı** — merkez-ön
  yayında **28.7714mm**, motorun kendi sertifikalı düzleştirme bütçesinin
  (`flatten_check` strain <%0.5) **7.6 katı**. Kapının §2 biçimi **F4'ün manken
  çizelgesine** bağlı; `flatJSON`'un `bedenlendirme` bloğu bugün
  **`YAYIN BULUNAMADI`** basıyor, yani **yayınlanmamış bir dönüşüme karşı kapı
  tanımlanamaz** (§3.10) ve **yeniden yazacak olan HAKEMDİR** (§3.8 md.1).
  Onarmak **geometri işidir, F5'in kartında yok.**
  **Halka 3 (F4 → F6 → F7 → F8 → F9) F5 bitince ya da K48'in tavanı dolunca
  açılır — ŞİMDİ AÇILMAZ.**
- `contract/hedef-kosu-taban.json` — **yalnız hakem** (§3.8 md.1). Blob bugün
  **`cf2af8c7d3c4603eee5aea252f3568feedda8d10`**.
- 🚨 **`expressability_check.mjs`'teki `TABAN_PAYDA` bloğu — YALNIZ HAKEM** (K31),
  **K35'in `X_check` konvansiyon kolu — YALNIZ HAKEM**, **ve K50'nin künye/damga
  satırları — YALNIZ HAKEM.**
- `engine/tests/hedef_kosu.mjs`'in **eşikleri ve tanımları gevşetilmez.**
  ⚠ H5'in paydasını **tanımı değiştirerek** büyütmek **kazanım değildir**.
- `vision/eval/labels-hakem.json` — **cevap anahtarı; ajan bir yargıyı DÜZELTMEZ,
  TAŞIMAZ, SİLMEZ.** Mühürlü (K19, blob `c21964a88ad0695e5acf085fb3d92127def3928e`).
  `labels.json` · `labels-hakem-BOS.json` (**boş kalır**) · `live-2026-08-22.json` ·
  `live-hedef10-2026-08-26.json`.
- `engine/tests/flat_expresses_spec_check.mjs` ve tabanı — **tek bayt** (K17).
  ⚠ **Takipli yeni bir `.json` bu kapıyı kırmızı yakabilir** — bu koşuda **iki
  kez** oldu. Dosya eklediysen **TAM `ctest`i tekrar koştur.**
- `engine/tests/vocab_reference_check.sh` + `vocab-reference-baseline.json` —
  **tek bayt** (K2/K11/K12).
- Hiçbir kapının eşiği gevşetilmez (§3.8 md.4). **Kapı yanlışsa hakeme getirilir**
  (K29/K36 emsali). **Kapı SİLMEK, `-E`, `DISABLED` — üçü de yasak.**
- **F0'ın, F2'nin, F3'ün, F5-A/B/C/D'nin işi sökülmez.** `beden` bir eksendir ve
  **KALIR**. `nodeId()`'nin siluet kolu **geri alınmaz** (K24).
  `suppressPanel()`'e **açı parametresi EKLENMEZ** (K36/§4A).
  `splitPanel()`'e **kesir parametresi EKLENMEZ** (K41).
  `rotate_check`'in R0 **çapraz-ölçüm** kolu **sabite geri çevrilmez** (K36).
  `split_check`'in **SP9 · SP10 · SP11** kolları **sökülmez** (K43/borç 56).
  `op_fixture` **silinmez** — süitin 376.80 saniyesi ona bağlı (K37).
- **`patterns_real/` altına tek yeni dosya eklenmez** (K10 kapanana kadar).
  Diskteki takipsiz kalemler (`BUGRA-DEFTER.md` · `geometry/` ·
  `tools/bugra-geometry-*.json`) **takipsiz kalır**, `git add` görmez.
  ▸ Hakem doğruladı: takipli sayı **41 → 41**, **pushlanmadı.**
- **`KOSU-v7.md`'ye TEK BAYT yazılmaz** (K26).
- **`_olcum_seti.yedek_5`'e (`10 · 14 · 15 · 34 · 36`) DOKUNULMAZ** (K16).
  ⚠ **Havuzda kullanılmayan yalnız 4 fotoğraf kaldı: `11` `12` `30` `35`.**
  **Holdout tükeniyor** — harcarsan gerekçeni karta yaz.
- **`.rabadon/guard.json`'a DOKUNULMAZ.** Kaçış rabadon'un kendi yolundan:
  `rabadon wrong <kural> "…"`.
  ⚠ **borç 61 YEDİNCİ OTURUMDUR açık:** `ctest-tail-hides-verdict` hakemin
  turunda da **üç kez** yanlış ateşledi (`grep … | tail -2`, `ctest -N | tail -2`)
  ve `no-ctest-list-as-green` **bir kez**. **Bekle ve kaydet.**
- 🚨 **"SINIRSIZ" / "UNLIMITED" KELİMESİ YASAK** (K45). §4A
  `rotate + slash-spread + merge` üçlüsünü şart koşuyor; **ikisi yok.**
- 🚨 **Bu kesim "PRENSES DİKİŞİ" DİYE ADLANDIRILMAZ** (K42).

## NOTLAR — hakemden faz ajanına

- **KAPIYI KOŞTUR. TAM `ctest` KOŞTUR.** Bu makinede **~742 sn** (hakem ölçtü);
  bitmesini bekle, `-R` ile geçiştirme.
- **Kendi mutasyonunu koştur ve LOGLA** (`GECE7/log/f5e.mutasyon.txt`).
  ⚠ **`GECE7/log/f5d.mutasyon.sh` İYİ YAZILMIŞ — kopyala.** `git numstat`'ı
  her turun başında **basıyor** (etiket iddia değil ölçüm), `shasum` ile
  ikilinin kımıldadığını kanıtlıyor, kımıldamazsa **"HUKUM YOK"** yazıyor.
  ▸ **Mutasyonlarını KENDİ YAZMADIĞIN dosyalara da yay** — en az **ÜÇ**
    mutasyon, **ÜÇ AYRI** ve `numstat`'ı **BOŞ** dosyada. F5-C ve F5-D bunu
    doğru yaptı.
  ▸ ⚠ **İKİLİ KIMILDAMAZSA "HÜKÜM YOK" YAZ VE BAŞKA BİR YER SEÇ** — hakemin
    HM-J4'ü tam olarak böyle düştü (`garmentshell.cpp` yeniden derlendi,
    beş ikili bayt değiştirmedi).
  ▸ ⚠ **`engine/build/op-suppress.json` KALICI FİKSTÜRDÜR** (borç 58).
    `rotate_check` onu okur. **Geometriyi oynatan bir mutasyonda fikstür
    BAYATTIR** — ya yeniden üret, ya o turda o kapıyı **kullanma ve söyle**.
- ⚠ **`git stash`'i TEK BAŞINA koştur** (F5-A'nın tuzağı).
- **Sayı bulunamıyorsa uydurma** (§3.10). Bu koşuda *"YAYIN BULUNAMADI"*,
  *"H4 ÖLÇEMEDİM"*, F5-B'nin **41.48'i**, F5-C'nin **14'ü** ve F5-D'nin
  **H5 paydasını** reddetmesi — beşi de **doğru davranıştı**.
- **Bildirmek ucuz, gizlemek pahalı.** F5-D ajanı **on iki** kalemi kendi aleyhine
  yazdı ve **on ikisi de doğru çıktı**; hükmü bu **güçlendirdi.**
- **Damla'ya soru sorulmaz** (§3.4) — `GECE7/DAMLA.md`'ye yazılır, **en
  kısıtlayıcı** varsayımla ilerlenir, koşu durmaz.
- **`git status` temiz bırak.** Takipsiz `patterns_real/` kalemleri bu koşunun
  kirliliği değil; **push'a karıştırma.**
- **SIFIR ÜCRETLİ API ÇAĞRISI** (§3.9). Yayınlanmış **doküman sayfası** okumak
  bu yasağa girmez — F5-C'nin künye turu ve F5-D hakeminin borç 59 turu böyle
  yapıldı.

## SAPMA SORUSU — cevabı ÖLÇÜLMÜŞ olacak

> *"Bir yabancı fotoğraf yükleyip kalıp + flat indirebiliyorum, ve bir paneli
> böldürebiliyorum — peki **bölünen kenarın iki tarafı artık İNEN KALIBIN
> `draftJSON`'unda dikiş çifti olarak görünüyor mu** (**H5 paydası büyüdü mü?**),
> ve **H4 hâlâ ÖLÇEMEDİM mi?**"*

*"Köprüyü hazırladık"* = **sapma, reddedilir.** Cevap bir dosya yolu + bir kapı
çıkışı + HM-J2'nin kırmızısı + **H5'in önce/sonra PAYDASI**'dır.

## BORÇ — devreden + hakem turu

**F5-D'de KAPANDI:** **50** (K41) · **53** (K42 md.3) · **56** (K43, hakem
HM-J1'le tekrarladı) · **59** (K50: sapma **yoktu**) · **45 + 49** *(kısmen)*.

**AÇIK ve devrediyor:** **39** (K32) · **40** (K34, wasm `source-stamp`) ·
**41** (K33, symlink'te sessizce yeşil — bu koşuda **tetiklenmedi**) · **42**
(wasm↔native düğüm eşitliği **kapısız**) · **44 → 54** (K40) · **46** (Halka 3) ·
**51** (H5 paydası → **bu kartın İŞ 1'i**) · **52** (bölme yalnız `vertical`) ·
**55** (iptal **kapısız**) · **57** (vücut-girdisi sabitleri kapısız —
**ÜÇÜNCÜ ölçüm: `kStatureMM`**, Halka 3/F4) · **58** (kalıcı fikstür) ·
**60** (K50: **damgalandı**, silinmedi) · **61** (**yedinci oturum**) ·
**62** (ürün yolu ikiye ayrıldı → **bu kartın İŞ 1'i**) · **63** (wasm↔native
`opsJSON` paritesi **ölçülmedi**) · **64** (`ringOffset` bir yarım için
**DOĞRULANMADI**) · **65** (`op_program_check` yalnız **EU38**).

**Hakemin F5-D turunda eklediği beş kalem:**

66. 🚨 **`op_program_check` `op.rotate`'in geometrisini denetlemiyor** →
    **İŞ 0**, K49.
67. **`flatten.cpp` `strainPolish` adımı ×0.45 → ağın TAMAMI yeşil.** Zararsız mı
    gevşek mi **DOĞRULANMADI**. **Bu kartın şartı DEĞİL.**
68. 🚨 **Tarayıcı yalnız `sevk_edilen`'i kuruyor** → **İŞ 2**.
69. **Kapı sayımı sapması:** `grep -c add_test(NAME` **128**, `ctest` **127**
    kayıtlı, yinelenen ad **yok**. **DOĞRULANMADI.**
70. **Tarayıcıda flat indirmenin süresi ÖLÇÜLMEDİ**; `SurfacePanel`
    `deficitGrid3D` ile **~38 KB/panel** şişti.

**Hâlâ açık ve silinemez:** gerçek tarayıcıda **hiç tıklanmadı** (onuncu faz,
**DOĞRULANMADI**) · miras 6 kırmızının **4'ünün** kök sebebi aranmadı · inen 7
dosyanın **5'i sessiz** · `download.js`'teki `kokenKaydi = null` arka kapısı ·
**H4/H6/H9 ÖLÇEMEDİM** · H5 **tek çiftten** okunuyor · `vocab_reference_check`
bir **referans sayacı** (K12) · **K17** · `conftest.py` **hiçbir mutasyonla
korunmuyor** · `pages.yml:23` `branches: [main]` = **main'e her push canlıya
çıkıyor** ve **`?v` 136'da kaldı** (→ İŞ 3) · `patterns_real/` **PUBLIC**
(K10, Damla kararı) · holdout **4 fotoğraf**, **harcanmadı** · borç md.30 · md.31.

---

**Ağaç:** `main`. Faz öncesi etiket `F5D-yesil`. Geri alma: `git reset --hard F5D-yesil`.
**Bu bir ALT-KARTTIR (§3.12).** F5 **BİTMEDİ.** Motorda **3** operatör var
(`op.rotate` · `op.suppress` · `op.split`); mühürlü paydanın kuyruğunda **5** ad
basılı (`attach` 3 giysi · `derive` · `extend` · `gather` · `overlay` 1'er).
**F5'in kapanış eşiği K48'de ÜÇ ŞARTLI hale geldi.**
*"F5'i bitirdim"* **denmiyor.** *"Sınırsız"* kelimesi **kullanılmıyor** (K45).

---
---

# AJAN KARTI — F5-E (KÖPRÜ) · 1. TUR

**Ağaç:** `main`. Faz öncesi etiket **`F5E-oncesi`**. Kod commit'i **`8425835`**.
**Bu bir ALT-KARTTIR (§3.12). F5 BİTMEDİ.** *"Sınırsız"* kelimesi kullanılmadı (K45).

## ⛔ EN ÖNEMLİ SATIR — KARTIN TEK ŞARTI TUTMADI, VE SEBEBİ BİR SAYI

> **H5'in paydası BÜYÜMEDİ: 5 → 5 (n=5), 5 → 5 (n=10). KAZANIM YAZILMIYOR.**
> Kart bunu **YOL (c)** diye adlandırdı ve **"BİR BAŞARISIZLIK DEĞİLDİR"** dedi;
> şartı da yazdı: *"Gerekçeni **hangi kapı, kaç yargı, hangi sayı** diye yaz."*
> **Aşağıda o üç sayı var, ve F5-D ajanının SAYMAKLA yetindiği liste artık ölçülü.**

**Köprünün mekanizması ÇALIŞIYOR — ölçüldü, iddia değil.** `DraftedPattern.pieces`'a
`op.split`'in doğurduğu cinsten **tek bir rol çifti** eklendiğinde `hedef_kosu`'nun
H5 satırı **anında büyüdü: payda 5 → 10 (n=5) · 5 → 15 (n=10)**, `badPairs` **0**
kaldı ve koşum **`CIRCIR SAĞLAM`** bastı. Yani engel bir ölçüm engeli değil.

**Engel, o çiftin bedeli. TAM `ctest` KOŞULDU ve bedel şu:**

```
95% tests passed, 6 tests failed out of 126      ← TABAN (bu kartın kapanış koşumu)
56% tests passed, 56 tests failed out of 126     ← PROB (tek bir parça çifti eklendi)
Total Test time (real) = 730.18 sec              ← prob koşumu, GECE7/log/f5e.prob.ctest.txt
```

**ELLİ yeni kırmızı ad.** F5-D ajanı *"altı ad"* saymıştı (`validator` · `printpack` ·
`cutplan` · `flat_expresses_spec_check` · `style_check` · `figure_check`); **doğrulandı
ve YANLIŞ çıktı** — saydığı altının üçü zaten miras kırmızı, ve gerçek sayı **50**.
Yeni yanan adlardan bazıları: `engine_check` · `golden_check` · `api_wire_check` ·
`grade_check` · `locket_check` · `cuttable_output_check` · `sewable_census` ·
`guide_check` · `recipe_dress_check` · `wasm_spec_honesty_check` · `compose_check` ·
`preview_truth_check` · `indir_check` (tam liste: `GECE7/log/f5e.prob.ctest.txt`).

**VE KIRMIZILAR AYNI CİNSTEN DEĞİL — ikinci bir prob turu onları AYIRDI.**
Birinci prob parçayı kesim-çizgisi pasından SONRA ekliyordu; ikinci tur parçaya
kendi kesim çizgisini ve bir rehber adımını VERDİ:

| `engine_check` kuralı | prob tur 1 | **prob tur 2** | hüküm |
|---|---|---|---|
| `cutline` | **140400 ihlal** | **0** | ✅ **onarılabilir** — probun kusuruydu |
| `guideCoverage` | 140400 ihlal | **140400** | onarılabilir sınıf (rehber metni) |
| `waist` | 720 | **720** | onarılabilir sınıf |
| `waistband` | 720 | **720** | onarılabilir sınıf |
| **FAILED drafts** | **70200 / 70200** | **70200 / 70200** | — |

🔴 **AMA BİRİ ONARILAMIYOR, VE ONU KAPININ KENDİSİ SÖYLÜYOR.**

```
golden_check FAIL: engine output differs from the REPO PIN
  dump: 29016 lines   pin: 23406 lines            (+5610 satır)
Two honest ways out, nothing else:
  1. UNINTENDED change -> fix the engine until this test passes.
  2. INTENDED behavior change -> DECLARED re-pin: run scripts/repin-golden.sh
     with a declaration label, add the ledger entry (engine/GOLDEN-PIN.md),
     and get Damla's approval BEFORE pinning.
```

Yol (1) **yok**: değişiklik bir hata değil, kasıtlı bir **EKLEME**. Yol (2) **ajanın
yetkisi değil** — kapı Damla'nın onayını ŞART koşuyor ve §3.4 ajana Damla'ya soru
sormayı YASAKLIYOR. Üstelik **RULES 4 bir kapı değil bir INVARIANT'tır:**
*"golden diff stays byte-identical"*. **Prob GERİ ALINDI, `golden-reference.csv`'ye
tek bayt yazılmadı** (→ `GECE7/DAMLA.md` md.14).

🔴 **VE KARTIN GÖRMEDİĞİ İKİNCİ, DAHA DERİN DUVAR — ÖLÇÜLDÜ:**

```
web/js/engine.js:265   draft(spec, measurements)   -> draftJSON(spec, {bust,waist,hip,...})
engine/src/seamplan.hpp:...  buildSeamPlan(const std::string& sizeLabel, ...)
```

**`DraftedPattern` SERBEST bir vücuttan çiziliyor; `SeamPlan` bir EU beden
ETİKETİ istiyor ve etiketsiz kurulamıyor.** İkisi arasında **yayınlanmış bir harita
YOK** — bu tam olarak K23'ün açık borcudur (`flatJSON`'un `bedenlendirme` bloğu
bugün **`YAYIN BULUNAMADI`** basıyor). Yani 50 kırmızı bir şekilde kapansa bile
`op.split`'in parçaları `DraftedPattern`'e **başka bir bedenin parçaları** olarak
girerdi. **"En yakın beden" diye bir eşleme UYDURULMADI** (§3.10; repo bu kusuru
daha önce *"üçüncü vücut kaynağı"* diye ölçmüştü) → `GECE7/DAMLA.md` md.15.

**HÜKÜM: YOL (c). HAKEME GELİNDİ. K48 gereği bu BİRİNCİ turdur.**

---

## ⭐ İŞ 0 — **YAPILDI. borç 66 / K49 KAPANDI, VE HAKEMİN KENDİ MUTASYONUYLA.**

`op_program_check` artık **OP8** kolunu taşıyor: her UYGULANMIŞ `op.rotate` adımının
**plana yazdığı konturu** kapı kendi yürüyor, **alanı** ve **kama açısını** kendi
hesaplıyor, ve `rotate_check`'in **R2/R3 kimliklerini ürün yolunda** kuruyor.
Adımın ilan ettiği dört sayıya **bakmıyor** — onları da ölçümle karşılaştırıyor (R8).

**Kontur, `planops.cpp`'den `%.17g` ile (round-trip) basılıyor.** Sebebi bir tercih
değil bir ölçüm: 6 basamaklı baskının yuvarlama hatası, `rotate_check`'in kendi
`EPS_ALAN` **1e-6 mm²**'sinin ÜSTÜNDE kalıyor ve bir baskı tercihini örtmek için
epsilon gevşetmek §3.10/K29 ihlali olurdu. **Epsilonlar uydurulmadı:**
`EPS_ALAN_R = 1e-6 mm²` ve `EPS_ACI_R = 1e-9°`, ikisi de `rotate_check.mjs`'in
KENDİ sayıları, aynen alındı.

**Temiz ağaçta ölçülen artıklar bir bant değil, SIFIR:**

| transfer (6/6 ölçüldü) | ALAN artığı | AÇI artığı |
|---|---|---|
| `left/right_btorso#b` | **7.276e-12 mm²** | **0.000e+0 / 0.000e+0** |
| `left/right_skirt_front#b` | **3.638e-12 mm²** | **1.243e-14°** |
| `left/right_skirt_back#b` | **0.000e+0 mm²** | **0 / 7.105e-15°** |

**KANIT ŞARTI YERİNE GETİRİLDİ — HM-J2 AYNEN TEKRARLANDI** (`GECE7/log/f5e.mutasyon.txt`):

```
HM-J2r  engine/src/dartrotate.cpp   theta * 0.90
        YAYILIM: git numstat F5E-oncesi..HEAD  BOS -> bu kartta DOKUNULMAMIS dosya
        ikili  ...f30f8caf...5158cf79 -> ...0018217e...b79eea97   (KIMILDADI)
        kapi: op_program_check EXIT 1 (KIRMIZI)     ← hakemde EXIT 0 idi
        geri alindi: ikili tabana dondu · kapi: EXIT 0 (YESIL)
```

Mutasyon altında yanan **19 `FAIL`**, kapının kendi cümlesiyle, ilk üçü:
`OP8/R2 left_btorso#b: ALAN 17753.257178 → 17237.837979 mm², fark 515.419199 > 1e-6` ·
`OP8/R3 left_btorso#b: AÇI 26.731427562° → 24.058284805°, fark 2.673142756° > 1e-9` ·
`OP8/R8 left_btorso#b: kama_once_deg 24.058285° ilan edildi, konturdan 26.731427561510376° ölçüldü`.
▸ `rotate_check`'e **DOKUNULMADI**, R0 çapraz-ölçüm kolu **sabite çevrilmedi** (K36).

## ⭐ İŞ 2 — **YAPILDI. borç 68 KAPANDI: ÜÇ OPERATÖRÜN ÜÇÜ DE TARAYICIDAN ULAŞILABİLİR.**

`opsJSONBinding` artık `opsJSON` yerine **`opsJSONAll`** çağırıyor — yani tarayıcı,
`plan-ops` aracının ve `op_program_check`'in **zaten okuduğu** iki okumayı alıyor.
**Sevk edilen wasm'dan ölçüldü** (`engine/dist/stitchu-engine.js`, koşuldu):

| tarayıcıdaki okuma | uygulanan | reddedilen | **uygulanan operatörler** |
|---|---|---|---|
| `sevk_edilen` (`skimBodice=ON`) | 2 | 26 | `op.split` |
| **`vucudu_izleyen`** (`skimBodice=OFF, maxDartDeg=0`) | **30** | **10** | **`op.split` · `op.suppress` · `op.rotate`** |

**Önce: kullanıcı bir paneli böldürebiliyordu, pens AÇTIRAMIYOR ve DÖNDÜREMİYORDU.
Şimdi üçü de ürün yüzeyinden ulaşılabilir.**
▸ **GİZLİ KADRAN DEĞİL:** `create.js` her okumayı motorun **kendi `yuzey` cümlesiyle**
başlıklıyor (`.dl-ops-surface`), yani hangi cevabın hangi giysiye ait olduğu
**adıyla** yazılı. Cümle burada yeniden yazılmadı — ikinci bir sözcük ikinci bir
gerçektir.
▸ **`skimBodice` sevk edilen giyside KAPATILMADI**; sevk edilen okuma **hâlâ ÖNCE**
geliyor ve **hâlâ sayısıyla REDDEDİYOR** (§0B).
▸ **SEVK EDİLEN OKUMA DEĞİŞMEDİ** (RULES 4): `draftJSON` · `planJSON` · `flatJSON`
el değmedi ve **`golden_check` Passed** (bayt aynı), **`engine_check` Passed**.
▸ **SAYAÇ ARAYÜZE ÇIKMADI** (F3'ün kuralı).

### ⭐ VE BU TURDA **borç 63 İLK KEZ ÖLÇÜLDÜ** (kart bunu şart koşmamıştı)

`plan-ops EU38` (native, arm64) ile sevk edilen wasm'ın `opsJSON`'u **yan yana
koşuldu ve alan alan karşılaştırıldı**:

| | ölçüm |
|---|---|
| yapı | **AYNI** — aynı anahtarlar, aynı liste uzunlukları, aynı adım sayısı, aynı `uygulanan`/`reddedilen` |
| sayısal alan | **1892**, bunların **1462'si FARKLI** |
| **en büyük fark** | **7.100e-05** (`alan_once_mm2` **8604.483921** vs **8604.48385**) |
| metin alan | 18 tanesi farklı, **yalnız içlerine gömülü o sayılar yüzünden** |

🚨 **VE BUNUN BİR SONUCU VAR, YAZILIYOR:** en büyük sapma **7.1e-5**, yani
`op_program_check`'in kendi `EPS_ALAN_R`'sinin (**1e-6 mm²**) **71 KATI**. Bugün
tehlike YOK — OP8'in üç kolu da **tek bir yapının içinde** ölçüyor (aynı ikilinin
önce/sonra konturu), wasm sayısını native sayısıyla kıyaslayan **hiçbir kol yok**.
Ama **bir gün kıyaslayan bir kapı yazılırsa o kapı YANLIŞ olur**, ve artık bu bir
tahmin değil bir sayı. **borç 63 KAPANMADI, ÖLÇÜLDÜ.**

## ⭐ İŞ 3 — **YAPILDI. `?v` 136 → 137, VE `site-health` KOŞULDU.**

`scripts/deploy.sh`'in **kendi bump satırı** kullanıldı (ikinci bir üreteç
yazılmadı), **138 dosyada** tek değere çekildi:

```
bump ?v=136 -> ?v=137        · web/ tek deger: ?v=137
node engine/tools/site-health.mjs
checked: 127 pages, 2604 internal refs, 124 sitemap urls, 124 indexable pages
OK  site-health: no dead links, sitemap matches the site, one version.
```

⚠ **`pages.yml:23` `branches: [main]` DURUYOR** — bu push canlıya çıkacak. Damgayı
bumplamak bayat-JS riskini kapatır, **kapıyı kapatmaz** (→ `GECE7/DAMLA.md`).

---

## MUTASYON — `GECE7/log/f5e.mutasyon.txt` · **BEŞİ DE KIRMIZI, BEŞİ DE GERİ DÖNDÜ**

`f5d.mutasyon.sh` kopyalandı; her turda ikili **silinip yeniden derleniyor** ve
`shasum` ile kımıldadığı **kanıtlanıyor** (kımıldamazsa **"HUKUM YOK"**).
**Dördü `numstat` BOŞ, yani bu kartın hiç açmadığı dosyalarda.**

| # | dosya | `numstat` | mutasyon | kapı |
|---|---|---|---|---|
| **HM-J2r** | `src/dartrotate.cpp` | **BOŞ** | transfer açısı ×0.90 | `op_program_check` **EXIT 1 🔴** |
| **MU1** | `src/dartsuppress.cpp` | **BOŞ** | shoelace kapanış terimini düşür | `op_program_check` **EXIT 1 🔴** |
| **MU2** | `src/panelsplit.cpp` | **BOŞ** | kesiğin iki ucunu ayır | `op_program_check` **EXIT 1 🔴** |
| **MU3** | `src/surfacepattern.cpp` | **BOŞ** | sütun profilini AYNALA (hakemin HM-1'i) | `split_check` **EXIT 1 🔴** |
| **MP1** | `src/planops.cpp` | 32/0 | konturu adımla göndermeme | `op_program_check` **EXIT 1 🔴** |

**MU1 bu kartın en öğretici turu:** motorun kendi shoelace'i bozulunca **kapının
kendi yürüdüğü kontur DOĞRU kalıyor** ve OP8/R8 *"rapor geometriden bağımsız
yazılıyor"* diye yanıyor. Bu, OP8'in bir **ikinci ölçüm** olduğunun kanıtıdır,
adımın kendi beyanının tekrarı değil.

---

## KAPI — ÖNCE → SONRA, HER SAYIDA `n`

**`ctest`in son satırı KOPYALANDI, ÖZETLENMEDİ** (temiz Release, `build` **tamamen
silinip** `-DCMAKE_BUILD_TYPE=Release` ile sıfırdan derlendi, K32):

```
95% tests passed, 6 tests failed out of 126

Total Test time (real) = 719.27 sec

The following tests did not run:
	111 - h10_gate_check (Disabled)

The following tests FAILED:
	  9 - flat_pattern_agree_check (Failed)
	 20 - flat_artifact_census (Failed)
	 21 - style_check (Failed)
	 28 - sizechart_source_check (Failed)
	 99 - contract_check (Failed)
	105 - figure_check (Failed)
```

| kapı | ÖNCE (F5-D hakemi) | **SONRA (bu kart)** |
|---|---|---|
| `ctest` temiz Release | **6 failed / 126** · **741.71 s** | **6 failed / 126** · **719.27 s** (−22.44 s) |
| `vocab_reference_check` | YESIL **10320** / taban 10438 | **YESIL 10322** / taban **10438** (taban kesilmedi) |
| `indir_check` | EXIT 0 | **EXIT 0** · `KOKEN_ALANLARI` **38** |
| `hedef_kosu` | EXIT 0 · CIRCIR SAĞLAM | **EXIT 0 · CIRCIR SAĞLAM** |
| `pytest -q` | 33 passed | **33 passed** (0.67 s) |
| `tek_nesne_check` | EXIT 0 | **EXIT 0** |
| `rotate_check` | EXIT 0 | **EXIT 0** |
| `suppress_check` | EXIT 0 | **EXIT 0** |
| `split_check` | EXIT 0 | **EXIT 0** |
| **`op_program_check`** | EXIT 0 · **8 kol** | **EXIT 0 · 9 kol (OP8 EKLENDİ)** |
| `expressability_check` | EXIT 0 · 3/5 | **EXIT 0 · 3/5** · `TABAN_PAYDA` **el değmedi** |
| `api_wire_check` · `bundle_fresh_check` · `preset_resolve_check` · `golden_check` · `engine_check` | Passed | **Passed** |
| `site-health.mjs` | koşulmadı | **OK** · 127 sayfa · 2604 iç bağlantı · tek sürüm |
| **`generated_ratchet_check`** | Passed | **Passed** — ⚠ **YEDİNCİ KIRMIZI DOĞDU VE KÖKTEN KAPANDI**, aşağıda |

### 🔴 YEDİNCİ KIRMIZI DOĞDU — VE **KÖKTEN** KAPATILDI (YOL (b), kart md.3)

Kapanış koşumunun **birincisinde** (`GECE7/log/f5e.ctest.kapanis.txt`) süit
**`7 tests failed out of 126` · 736.16 s** bastı ve yedinci ad
**`generated_ratchet_check`** idi — **54 `FAIL bytes` satırı**, hepsi
`web/collections/*.html` · `web/styles/*.html` · `web/blog/*.html` ·
`web/collection-60s70s.html` ailelerinden.

**Kök sebep bu kartın İŞ 3'ü değil, `scripts/deploy.sh`'in KENDİSİYDİ.** K21
cırcırı **57 üretilmiş yol** ilan ediyor; `?v` bump'ı onların **54'ünün** baytını
oynatıyor, ve `deploy.sh` bump'tan sonra manifesti **hiç mühürlemiyordu**. Yani
**reponun kendi sevk betiği, reponun kendi kapısından geçemiyordu** — ve bunu
hiçbir kart bildirmemişti.

**Kapatma, kapının KENDİ yazdığı yolla yapıldı ve gevşetme DEĞİLDİR:**
`generated_ratchet_check.sh`'in başlığı şart koşuyor — *"a generated file may not
change its bytes without its declared sha256 changing WITH IT, **in the same
commit**, in a tracked file, under its own name … the point is not to make the
change hard; it is to make it **VISIBLE and NAMED** in the diff."* Manifest
`--accept` ile yeniden mühürlendi ve **sayfalarla AYNI commit'te** durdu
(`be89dbb`, `54 insertions(+), 54 deletions(-)` — oynayan her yol diff'te **adıyla**).
**Ve sınıf da kapatıldı:** `deploy.sh` artık bump'ın hemen ardından mührü kendisi
yeniliyor, **sonra kapıyı tekrar koşturuyor** ve hâlâ kırmızıysa
**"Do NOT accept it away; find it"** diye **exit 4** veriyor — yani bump'ın
açıklamadığı bir hareket asla sessizce kabul edilemez.

**İkinci kapanış koşumu (`GECE7/log/f5e.ctest.kapanis2.txt`) yukarıdaki bloktur:
`6 tests failed out of 126`, altı ad TAM OLARAK miras altı, YEDİNCİ AD YOK.**

## CIRCIR — F5'İN HANESİ: **H4 · H5 · H8**. Her sayıda `n`.

| sayı | taban (F5-D) | **F5-E (ölçüldü)** | hüküm |
|---|---|---|---|
| H1 | 5/5 · 10/10 | **5/5 (n=5) · 10/10 (n=10)** | aynı |
| H2 | %95.2 · %93 | **%95.2 (40/42, n=5) · %93 (66/71, n=10)** | aynı |
| H3 | 2 · 2 | **2 (n=5) · 2 (n=10)** | aynı |
| **H4** | **ÖLÇEMEDİM** | 🚨 **ÖLÇEMEDİM — ON BİRİNCİ FAZ** | **uydurulmadı** |
| **H5** | **0 / 5** — payda **5** | 🚨 **0 / 5 — payda 5 → 5** (n=5) · **0/5 — payda 5 → 5** (n=10) | **KAZANIM YAZILMADI** |
| **H8-sözlük** | 31 · 61 | **31 (26+5, n=5) · 61 (51+10, n=10)** | sözlük daraltılmadı |
| **H8-ifade** | **3 / 5** | **3 / 5** (n=5) | **kötüleşmedi** |
| H10 | %58.3 · %64.4 | **%58.3 (70/120) · %64.4 (154/239)** | aynı |
| **H10a** | %17.5 · %29.7 | **%17.5 (21/120) · %29.7 (71/239)** | **yükseltilmedi** (K21) |
| **H10b** | **%40.0 · %33.1** | **%40.0 (48/120) · %33.1 (79/239)** | **§0B tavanı KIMILDAMADI** |
| H10e | 3 · 5 | **3 (n=5) · 5 (n=10)** | aynı |
| H10x | %0.8 · %1.7 | **%0.8 (1/120) · %1.7 (4/239)** | aynı |
| **H11** | 3.2 ms | **2.9 ms (n=5) · 2.1 ms (n=10)**, en kötü **35.2 ms** | **<10 sn tavanının çok altında** |

▸ **H10a + H10b + H10x = H10 TUTUYOR:** 17.5 + 40.0 + 0.8 = **58.3** (n=5) ·
29.7 + 33.1 + 1.7 = **64.5** ≈ **64.4** (yuvarlama, paylar 71+79+4 = 154/239 ✅).
▸ **İki `n` TEK TABLODA HARMANLANMADI.**
▸ **H11 KIMILDAMADI çünkü operatör programı hâlâ opt-in:** `hedef_kosu`
`draftJSON` hattını ölçüyor, program ayrı bir binding'in arkasında. İŞ 2 ikinci
okumayı ekledi ve o ikinci okumanın maliyeti **kullanıcı düğmeye basmadıkça
ödenmiyor** — `op_program_check`'in kendi süresi bu kartta **12.68 s**.

---

## §5.5 DÖKÜM — SORULMADI AMA GÖRÜLDÜ / GÖRÜLEMEDİ

**Kendi aleyhime:**
1. 🚨 **KARTIN TEK ŞARTI TUTMADI.** H5 paydası **5 → 5**. Kazanım yazılmadı.
2. 🚨 **H4 ON BİRİNCİ FAZDIR `ÖLÇEMEDİM`.** `op_program_check`'in `sebep` katmanı
   (**OP6**) motorda duruyor ve zengin, ama `hedef_kosu` H4'ü **`draftJSON`
   hattından** okuyor ve o hatta hâlâ sıfır `sebep` var. **Aynı köprü borcu.**
3. **`op_program_check` hâlâ YALNIZ EU38** (borç 65) — sekiz bedenin **yedisi**
   koşulmadı, OP8 dahil. Bu kartta genişletilmedi.
4. **OP8, `sevk_edilen` okumasında HİÇBİR ŞEY ölçmüyor**, çünkü o yüzeyde
   uygulanan `op.rotate` **yok** (koni). Altı ölçümün altısı `vucudu_izleyen`den.
   Yani **sevk edilen giysinin transfer rijitliği bugün de kapısız** — kapı var,
   ölçecek adım yok, ve bu bir **cümle değil bir sayı**: `sevk_edilen` uygulanan
   rotate **0**.
5. **Prob koşumunun `guideCoverage` 140400'ü ikinci turda DÜŞMEDİ** — parçaya bir
   rehber cümlesi eklendiği hâlde. Kök sebep **ARANMADI** (prob geri alındı);
   *"onarılabilir sınıf"* demek bir **hipotez**, **DOĞRULANMADI.**
6. **`?v` 137 canlıya çıkacak ve gerçek tarayıcıda HİÇ TIKLANMADI.** İŞ 2'nin iki
   yüzeyli paneli **ekranda görülmedi**; `create.js`'in yeni döngüsü yalnız
   wasm çıktısının şekliyle (`okumalar[]`) doğrulandı. **DOĞRULANMADI.**
7. **`.dl-ops-surface` bir CSS sınıfı ekledi** — `style_check` miras kırmızı
   olduğu için bu satırın görsel etkisi **bir pine karşı ölçülmedi.**

**Konu dışı ama önemli (ayrı kova):**
8. **`vocab_reference_check` 10320 → 10322.** Taban 10438'in altında, `HUKUM: YESIL`,
   ama sayı **düşmedi, yükseldi**. Sebebi bu kartın yazdığı yorum satırları
   (`garment` ekseninin adı 1186 → 1163 DÜŞTÜ, başka eksenler yükseldi).
   Cırcır ihlali değil (kapı yalnız tabanı aşmaya bakar) ama **yön yanlış**.
9. **Borç 69 (`grep -c add_test(NAME` 128 vs `ctest` 127) bu turda da duruyor** ve
   **aranmadı.**
10. **`op_fixture` hâlâ süitin en pahalı kalemi** ve kalıcı fikstür (borç 58)
    bu kartta **hiç yeniden üretilmedi** — OP8'in koştuğu `plan-ops` fikstür
    okumuyor (doğrudan ikiliyi çağırıyor), o yüzden bayat-fikstür tuzağına
    düşülmedi; ama fikstürün kendisi **denetlenmedi**.
11. **Holdout HARCANMADI:** `11` `12` `30` `35` **dördü de** el değmemiş.
12. **`patterns_real/` takipsiz kalemleri takipsiz kaldı**, `git add` görmedi.
13. 🚨 **`deploy.sh` YEDİNCİ BİR KIRMIZI ÜRETİYORDU VE KİMSE BİLDİRMEMİŞTİ.** Bu
    kartta bulundu çünkü İŞ 3 onu tetikledi; **F5-D'de `?v` bumplansaydı O TUR
    kırmızı kapanırdı.** Kapatıldı, ama şunu da söylemek gerek: bu kapı
    **hiçbir mutasyonla korunmuyor** — `deploy.sh`'in yeni reseal bloğu bu
    kartın mutasyon matrisinde **YOK**, çünkü `deploy.sh` `ctest`e bağlı değil
    ve koşturmak **canlıya deploy etmek** demek. **DOĞRULANMADI.**
14. **`--accept` bir GÜVEN adımıdır ve öyle işaretleniyor:** 54 yolun 54'ünün
    baytının **yalnız `?v=136` → `?v=137` yüzünden** oynadığı **tek tek
    DOĞRULANMADI**; dayanak, aynı bump'ın `site-health` tarafından tek-sürüm
    olarak doğrulanması ve `git diff`in 54 satırı adıyla göstermesidir.
15. **rabadon borç 61 SEKİZİNCİ/DOKUZUNCU oturuma girdi:** `ctest-tail-hides-verdict`
    bu turda **üç kez** yanlış ateşledi (biri `deploy.sh`'in kendi `?v` bump
    satırını, biri geri alınmış bir prob koşumunun bayat kırmızısını, biri bir
    ilerleme bakışını) ve **üçü de `rabadon wrong` ile kaydedildi**.
    `guard.json`'a **DOKUNULMADI**. ⚠ **Ayrıca DÖRDÜNCÜ bir kez**, altı miras
    kırmızının durduğu **doğru** kapanış koşumunda ateşledi — kural "kırmızı var"
    diyor, "yedincisi var mı" diye soramıyor; borç 61'in asıl şekli budur.

## BORÇ — bu turun defteri

**KAPANDI:** **66** (K49 — `op_program_check` artık `op.rotate`'in geometrisini
denetliyor, HM-J2r kırmızı yanıyor) · **68** (üç operatörün üçü de tarayıcıdan
ulaşılabilir).
**ÖLÇÜLDÜ AMA KAPANMADI:** **63** (wasm↔native `opsJSON`: yapı AYNI, 1892
sayısal alanın 1462'si farklı, en büyük fark **7.100e-05**).
**AÇILDI:** **71** — 🚨 `scripts/deploy.sh`'in `?v` bump'ı K21 cırcırının 57
yolunun **54'ünü** oynatıyordu ve mührü **hiç yenilemiyordu**; bu turda kapatıldı
ama **yeni reseal bloğu hiçbir mutasyonla korunmuyor** (`deploy.sh` `ctest`e
bağlı değil).
**AÇIK VE DEVREDİYOR:** 39 · 40 · 41 · 42 · 44→54 · 46 · **51** (H5 paydası —
**bu kartın tutmayan şartı, YOL (c) ile hakemde**) · 52 · 55 · 57 · 58 · 60 ·
61 · **62** (ürün yolu iki nesne — **hakemde**) · 63 · 64 · 65 · 67 · 69 · 70.

**Hâlâ açık ve silinemez:** gerçek tarayıcıda **hiç tıklanmadı** (on birinci faz,
**DOĞRULANMADI**) · miras 6 kırmızının **4'ünün** kök sebebi aranmadı ·
`download.js`'teki `kokenKaydi = null` arka kapısı · **H4/H6/H9 ÖLÇEMEDİM** ·
H5 **tek çiftten** okunuyor · `vocab_reference_check` bir **referans sayacı** ·
**K17** · `conftest.py` **hiçbir mutasyonla korunmuyor** · `pages.yml:23`
`branches: [main]` = **her push canlıya çıkıyor** (damga bumplandı, **kapı
kapanmadı**) · `patterns_real/` **PUBLIC** · holdout **4 fotoğraf, HARCANMADI**.

**Değişmezlere uyum:** `flat_pattern_agree_check` **el değmedi** (K23) ·
`contract/hedef-kosu-taban.json` **tek bayt değişmedi** · `labels-hakem.json` ·
`flat_expresses_spec_check` · `vocab_reference_check.sh` + tabanı ·
`hedef_kosu.mjs` **eşikleri ve tanımları** · `KOSU-v7.md` — **hiçbirine bir bayt
yazılmadı.** `splitPanel()`'e kesir, `suppressPanel()`'e açı **eklenmedi**.
`rotate_check`'in R0'ı, `split_check`'in SP9/SP10/SP11'i **sökülmedi**.
*"Prenses dikişi"* **hiçbir yüzeyde geçmiyor** (K42).

---

## SAPMA SORUSU — CEVAP ÖLÇÜLDÜ

> *"Bir yabancı fotoğraf yükleyip kalıp + flat indirebiliyor muyum, ve **inen nesne
> motordaki operatörlerden gerçekten etkileniyor mu**?"*

**KALIP + FLAT: EVET.** `hedef_kosu` **EXIT 0**, H1 **5/5 (n=5) · 10/10 (n=10)** —
on fotoğrafın onu da kalıp ve flat üretti, medyan **2.9 ms**.

**İNEN NESNE OPERATÖRDEN ETKİLENİYOR MU: HAYIR, VE BU SEFER SAYISIYLA.**
- İnen **flat**ın geldiği `SeamPlan`, operatör programının **KOPYASI** üstünde
  koşuyor (`planops.cpp` `readingJSON(… SeamPlan plan)` — değer geçişi). Program
  bittiğinde `flatJSON`'un kurduğu plan **el değmemiştir**: `golden_check` **Passed**,
  `engine_check` **Passed**, `dugum` **`0c1d52866882ce53`** beş mutasyonun beşinde de
  **kımıldamadı**. **Bu bir kusur değil, RULES 4'ün kendisi** (opt-in, default OFF).
- İnen **kalıbı** (`draftJSON` → `DraftedPattern`) operatörlere bağlamak
  **DENENDİ ve ÖLÇÜLDÜ**: bedeli **50 yeni kırmızı ad**, `engine_check`'te
  **70200/70200 düşen çizim**, ve `golden_check`'te **+5610 satır** — sonuncusu
  **Damla'nın onayı olmadan kapatılamaz** (kapının kendi cümlesi).
- **H5'in paydası bu yüzden 5'te kaldı**, ve bölünen kenarın iki tarafı inen
  kalıbın `draftJSON`'unda **hâlâ bir dikiş çifti olarak görünmüyor**.

**"Köprüyü hazırladık" DENMİYOR.** Kurulmadı. Kurulamamasının gerekçesi bir dosya
yolu (`GECE7/log/f5e.prob.ctest.txt`), iki kapı çıkışı (`56 failed out of 126` ·
`dump 29016 / pin 23406`), HM-J2r'nin kırmızısı ve **H5'in önce/sonra paydası
(5 → 5)**'tir.
