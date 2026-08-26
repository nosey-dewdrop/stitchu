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
