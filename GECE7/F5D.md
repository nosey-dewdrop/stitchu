# AJAN KARTI — F5-D (**OPERATÖRLER ÜRÜN YOLUNA BAĞLANIR**) 🧩 HALKA 2 SÜRÜYOR · F5'in DÖRDÜNCÜ alt-kartı

Bu kartı **hakem** yazdı (F5-C hükmünden sonra, §3.7). **HEDEF DEĞİŞMEDİ** —
hakemin yapamayacağı tek şey odur: **fotoğraf + prompt → kalıp + flat.**

Faz öncesi etiket: **`F5C-yesil`**. Main'de çalışılır, branch açılmaz.
Geri alma: `git reset --hard F5C-yesil`.

## OKUMA LİSTESİ — bu kart + `KOSU-v7.md` şu bölümler, fazlası DEĞİL (§3.11)

**§0 · §0B · §3.4 · §3.5 · §3.6 · §3.7 · §3.8 · §3.10 · §3.12 · §4A**

▸ **§4C'yi okuma**, F4'ün listesinde.
▸ `GECE7/HAKEM-F5C.md` **okunur** — bu kartın bütün sayıları oradan gelir.
▸ Kararlar: **K23 · K29 · K31 · K32 · K33 · K35 · K36 · K40 · K41 · K42 · K43 · K44 · K45 · K46.**

---

# ⛔ BU KART BİR OPERATÖR EKLEMİYOR. `op.attach` BU KARTTA **YOK** (K46).

**Neden — ve gerekçe bir tercih değil, ÜÇ KARTLIK BİR ÖLÇÜM:**

| sayı (§3.6 F5'e bunları verdi) | F5 öncesi | F5-A | F5-B | F5-C |
|---|---|---|---|---|
| **H8-ifade** | — | 5/5 | 4/5 | **3/5** ⭐ kımıldayan **tek** sayı |
| **H5** | 0/5 | 0/5 | 0/5 | **0/5** — payda **üç kez** büyümedi |
| **H4** | ÖLÇEMEDİM | ÖLÇEMEDİM | ÖLÇEMEDİM | **ÖLÇEMEDİM** (dokuz fazdır) |

**Kök sebep tek, ve hakem onu ölçtü:** `hedef_kosu.mjs` H5'i
`d.pattern.pieces[].edgeRoles` üzerinden — yani **`draftJSON` hattından** —
sayıyor. H4'ün `reason` katmanı **aynı hat**. Ve:

```
panelsplit.hpp · dartsuppress.hpp · dartrotate.hpp
  →  garment.cpp / wasm/bindings.cpp / web/js/*   :   ÜÇÜNDE DE SIFIR SATIR
```

**Motorda üç gerçek, kapılı operatör var ve kullanıcı hiçbirine dokunamıyor.**
Borç 45 (F5-B) ve borç 49 (F5-C) aynı cepheyi iki kez yazdı; bu **üçüncüsü**.
Dördüncü kez yalnız H8'i kımıldatan bir kart, F5'in üç sayısından **ikisini
dördüncü kez** yerinde bırakırdı. **`op.attach` F5-E'nin adayıdır** (K45/K46).

**Tahmin: 2–3 oturum, tavan 6.** Aşarsan **DUR ve hakeme gel.**
**Sessizce sürünmek yasak.**

---

## ⭐ İŞ 0 (ZORUNLU, HER ŞEYDEN ÖNCE) — HAKEMİN F5-C TURUNDA ÖLÇTÜĞÜ ÜÇ BOŞLUK

### İŞ 0a — 🚨 `split_check` **SIRALANMIŞ BİR PROFİLİ GÖREMİYOR** (borç 56, K43)

**Hakem ölçtü (HM-1).** `engine/src/surfacepattern.cpp`'de sütun profili
**aynalandı** (`defCol[j]` → `defCol[cols - j]`): profilin **çokluğu, toplamı ve
iptali** değişmez, yalnız **SIRASI** değişir.

| | temiz ağaç | HM-1 (aynalı) |
|---|---|---|
| kesim sütunları | **16 · 11 · 13** | **15 · 20 · 18** |
| `split_check` | EXIT 0 | 🚨 **EXIT 0, SIFIR `FAIL`** |

**Operatör paneli kanıtlanabilir şekilde YANLIŞ yerden böldü ve dokuz kolun
dokuzu da geçti.** Sebep: **SP0** argmin'i **aracın kendi bastığı** profilden
hesaplıyor, **SP1** ise yalnız **TOPLAMI** `developDeficitDeg`'e bağlıyor — ve
toplam **sıraya duyarsızdır**. `deficitColumnDeg`'i okuyan **başka tüketici
yok**, yani repoda bunu yakalayabilecek **ikinci bir kapı da yok**. Bu, **K30'un
sınıfı**: *kimlik kapılı, doğruluk kapısız*.

**Şart:** kapı, profilin **sırasını** panelin **gerçek sınır geometrisine**
bağlar. Sıraya duyarlı, **motordan gelen** bir tutamak gerekir — ör. `split-op`
**sütun başına** ölçülen bir geometri (kümülatif bel yayı / uzak koşu yayı)
basar ve `split_check` kesim sütununun **sınırdaki yerini** o geometriden
**bağımsız** doğrular. Hangisi seçilirse **ölçülür ve yazılır**.

**Kanıt şartı — HM-1 TEKRARLANIR:** aynalanmış profille kapı **EXIT 1** olmalı,
geri alınınca **EXIT 0**. **Loglanır.**
⚠ **Eşik uydurma** (§3.10/K29). Sıra bir **kimliktir**, bir tolerans değil.

### İŞ 0b — `atFraction` **CİNSİNE GÖRE AYRILIR** (borç 50, K41)

Hakem ajanın ara çözümünü **onayladı** (alan durur, `motorda_tuketilmiyor: true`,
`splitPanel()` okumaz — imza doğrulandı) ama **kalıcı değil**: ürün verisini
(**yırtmaç derinliği**), hiçbir şeyin okumadığı ve bir **operatör
parametresinin** adını taşıyan bir alanda tutmak, bilginin **yanlış isimde**
durmasıdır.

**Şart:** `backSlit.vent` / `backSlit.slit`'in kesri **kendi adını taşıyan** bir
**ürün alanına** taşınır; `atFraction` yalnız **tüketilmeyen kadran** olarak
kalır. **Tek bir yargı silinmez, tek bir sayı atılmaz** (§5.5).
⚠ **15 kesrin hepsi `YAYIN BULUNAMADI` damgasını KORUR** ve hiçbiri bir ürün
varsayılanı olarak **dışarı söylenmez**. `preset_resolve_check` **kırmızı
yanmadan** yapılır; yanarsa **kökten** kapatılır, kapı **gevşetilmez**.

### İŞ 0c — MAKSİMUM-EĞRİLİK SÜTUNU **YAN YANA BASILIR** (borç 53, K42)

Dengeli-yük kesimi **KALIR** (bölmenin tanımı, ve borç 44'ü cevaplayan tek şey).
Ama klasik kalıpçılıkta prenses dikişi **büst noktasından** = **maksimum
eğrilik** sütunundan geçer, ve iki kural EU38'de **farklı sütun** veriyor.

**Şart:** `split-op` her koşumda **maksimum-eğrilik sütununu da** dengeli
sütunun **yanına** basar. İki kuralın farkı böylece bir dipnot değil **ölçülen
bir sayı** olur.
⚠ **Kural DEĞİŞMEZ** — basılan ikinci sütun **bilgidir, hüküm değil**
(`cutplan`'ın `rivals`'ı emsal). Ve bu kesim **hiçbir yüzeyde** *"prenses
dikişi"* / *"kup dikişi"* **diye adlandırılmaz** (K42).

---

## ⭐ İŞ 1 — ÜÇ OPERATÖR ÜRÜN YOLUNA BAĞLANIR

**Bugün ne var:** hiçbir şey. Üç operatör de yalnız kendi `tools/*-op.cpp`
sürücüsünden çağrılıyor. **Kullanıcı bir paneli böldüremiyor, bir pens
açtıramıyor, bir pensi taşıyamıyor.**

**Kapanış şartı — üçü birden, yoksa kapanmaz:**

- **OPERATÖR ÇIKTISI `SeamPlan`'A GERİ YAZILIR.** `splitPanel()` iki parça
  üretiyor ve bugün onlar **hiçbir yere gitmiyor** (borç 51). İki parça plana
  **panel olarak** girer, kesilen kenarın iki tarafı **dikiş çifti** olarak
  ilan edilir.
- **`draftJSON` O ÇİFTİ İLAN EDER.** H5 `pieces[].edgeRoles`'ten sayıyor; yeni
  çift orada **kenar rolüyle** görünmezse **hiçbir sayı kımıldamaz.**
  🚨 **H5 PAYDASI BÜYÜMELİ. `0/5 → 0/5` bir kazanım DEĞİLDİR** (F5-A'dan beri
  aynı cümle) — **önce/sonra paydayı da bas.**
- **KULLANICI ULAŞIR.** `wasm/bindings.cpp` + `web/js` hattında operatörü
  **çağıran** bir yol olur. *"Motorda var"* bir ürün değildir (`CLAUDE.md`'nin
  tek testi).
- **Mutasyon:** bağlantıyı kimliksizleştir (parçalar plana girer ama dikiş çifti
  ilan edilmez) → **kırmızı**; çifti sahte bir uzunlukla ilan et → **kırmızı**;
  geri al → **yeşil**.

▸ ⚠ **HİÇBİR OPERATÖRÜN GEOMETRİSİ DEĞİŞMEZ.** `splitPanel()`'e **kesir
parametresi EKLENMEZ**, `suppressPanel()`'e **açı parametresi EKLENMEZ** (K36),
`rotate_check`'in R0 **çapraz-ölçüm** kolu **sabite çevrilmez**. Bu kart
**bağlıyor**, yeniden yazmıyor.
▸ **Sevk edilen giysi `op.split`'i ve `op.suppress`'i REDDEDİYOR** (ölçülü:
deficit **−1.9628°** / **−0.1116°**, mutlak sütun profili **0.1116° / 0.0000°**).
**Bu bir kusur değil bir cevaptır** ve **RET de ürün yolundan görünmelidir** —
sessizce boş dönmek **yasak** (§0B).
▸ **Sayaç kullanıcı arayüzüne ÇIKMAZ** (F3'ün kuralı sürüyor).

---

## ⭐ İŞ 2 — H4 İLK KEZ ÖLÇÜLÜR (ya da NEDEN OLMADIĞI bir YERE bağlanır)

**H4 dokuz fazdır `ÖLÇEMEDİM`.** `hedef_kosu` kendi satırında sebebi yazıyor:
*"F5 dört sebep katmanı kodda yok"*. `op.split` bir dikiş **doğuruyor**; o dikiş
`draftJSON`'un `reason` alanına bağlanırsa **H4'ün ilk katmanı** açılır.

**Şart:** ya H4 **bir sayıyla** basılır (`n` ile), ya da **`ÖLÇEMEDİM` yazılır ve
neden ölçülemediği bir CÜMLE değil bir YER olur** (dosya + satır).
⚠ **Uydurma yasak** (§3.10). F5-C'de *"ÖLÇEMEDİM"* yazmak **doğru davranıştı**.

---

## F5-D'NİN FAZ KAPISI — dokuzu da zorunlu, hepsi ÖLÇÜLEN

1. **`ctest --test-dir engine/build --output-on-failure` → `6 failed out of N`**,
   altı ad tam olarak miras altı: `flat_pattern_agree_check` ·
   `flat_artifact_census` · `style_check` · `sizechart_source_check` ·
   `contract_check` · `figure_check`. **Yedinci ad = alt-kart kapanmaz.**
   `N` bugün **125**; yeni test eklersen büyür, **kırmızı sayısı büyümez.**
   ⚠ `110 - h10_gate_check` **DISABLED** ve öyle kalır (K18).
   ⚠ **`ctest`in son satırını KOPYALA, ÖZETLEME.**
   ⚠ **ÖNCE `-DCMAKE_BUILD_TYPE=Release` ile TEMİZ DERLE** (K32).
   ⚠ **SÜİT ~718 sn. Kartın eklediği maliyeti önce/sonra YAZ** — F5-C 1080'i
   718'e indirdi, **geri tırmandırma.**
2. **`bash engine/tests/vocab_reference_check.sh` → `HUKUM: YESIL`** (bugün
   **10312** / taban **10438**). Taban **kesilmez**, SCOPE **daraltılmaz**.
   ⚠ **K12 TUZAĞI:** kapı **commit'ten** okur. **Commit'le, sonra koştur.**
3. **`node engine/tests/indir_check.mjs` → EXIT 0**, `KOKEN_ALANLARI` **38'in
   altına DÜŞMEZ** (K13).
4. **`node engine/tests/hedef_kosu.mjs` → EXIT 0, `CIRCIR SAĞLAM`**, ve
   **H10a + H10b + H10x = H10** tutar.
5. **`python3 -m pytest -q` → 33 passed** veya daha fazla.
6. **`tek_nesne_check` · `rotate_check` · `suppress_check` · `split_check` →
   dördü de EXIT 0**, ve **İŞ 0a yapılmış** olarak: HM-1 (aynalı profil)
   `split_check`'i **KIRMIZI** yakar.
7. ⭐ **H5 PAYDASI BÜYÜDÜ**, önce/sonra ikisi de basılı. Büyümediyse **kazanım
   YAZILMAZ** ve sebebi bir **yer** olarak yazılır.
8. ⭐ **`expressability_check` → EXIT 0**, **`TABAN_PAYDA` el değmemiş**, K35
   kolu korunmuş, ve **H8-ifade 3/5 KÖTÜLEŞMEMİŞ.**
   ⚠ **Bu kart H8'i düşürmek zorunda DEĞİL** (operatör eklemiyor). **Düşerse
   şüphelen: pay şişmiş olabilir.**
9. ⭐ **ÜRÜN YOLU ÖLÇÜLDÜ:** `grep` çıktısı karta yazılır — `garment.cpp` /
   `wasm/bindings.cpp` / `web/js/*` hattında operatörü çağıran satır **VAR**.

## CIRCIR — F5'İN HANESİ: **H4 · H5 · H8** (§3.6). Her sayıda `n`.

| sayı | taban (F5-C sonrası) | F5-D'den beklenen |
|---|---|---|
| **H4** | **ÖLÇEMEDİM** (dokuz faz) | 🚨 **BU KARTIN HANESİ.** Bir sayı, ya da bir **YER**. |
| **H5** | **0 / 5** ölçülebilen çift | 🚨 **BU KARTIN ASIL ŞANSI.** Payda **büyümeli**; önce/sonra ikisi de basılır. **0→0 kazanım DEĞİL.** |
| **H8-sözlük** | **31** (26+5) n=5 · **61** (51+10) n=10 | kötüleşemez. **Sözlük daraltarak düşürmek §0B ihlalidir.** |
| **H8-ifade** | **3 / 5** (n=5), payda **MÜHÜRLÜ** | **kötüleşemez.** Düşmesi **beklenmiyor** — düşerse **gerekçesi ölçülür.** |

**Diğerleri kötüleşemez** (§3.6): H1 **5/5 · 10/10** · H2 **%95.2** · H3 **2** ·
H10 %58.3 · **H10b %40.0** (**§0B tavanı burada**) · H10e 3 · H10x %0.8 ·
H11 3.2ms (<10 sn tavanı). **H10a cırcıra BAĞLI DEĞİL** (K21) — **H10a'yı
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
  **Halka 3 (F4 → F6 → F7 → F8 → F9) F5 bitince açılır — ŞİMDİ AÇILMAZ.**
- `contract/hedef-kosu-taban.json` — **yalnız hakem** (§3.8 md.1). Blob bugün
  **`cf2af8c7d3c4603eee5aea252f3568feedda8d10`**.
- 🚨 **`expressability_check.mjs`'teki `TABAN_PAYDA` bloğu — YALNIZ HAKEM** (K31),
  **ve K35'in `X_check` konvansiyon kolu — YALNIZ HAKEM.**
- `engine/tests/hedef_kosu.mjs`'in **eşikleri ve tanımları gevşetilmez.**
  ⚠ H5'in paydasını **tanımı değiştirerek** büyütmek **kazanım değildir** —
  payda **gerçek bir dikiş çiftiyle** büyür, tanımla değil.
- `vision/eval/labels-hakem.json` — **cevap anahtarı; ajan bir yargıyı DÜZELTMEZ,
  TAŞIMAZ, SİLMEZ.** Mühürlü (K19). `labels.json` · `labels-hakem-BOS.json`
  (**boş kalır**) · `live-2026-08-22.json` · `live-hedef10-2026-08-26.json`.
- `engine/tests/flat_expresses_spec_check.mjs` ve tabanı — **tek bayt** (K17).
  ⚠ **Takipli yeni bir `.json` bu kapıyı kırmızı yakabilir** — bu koşuda **iki
  kez** oldu. Dosya eklediysen **TAM `ctest`i tekrar koştur.**
- `engine/tests/vocab_reference_check.sh` + `vocab-reference-baseline.json` —
  **tek bayt** (K2/K11/K12).
- Hiçbir kapının eşiği gevşetilmez (§3.8 md.4). **Kapı yanlışsa hakeme getirilir**
  (K29/K36 emsali). **Kapı SİLMEK, `-E`, `DISABLED` — üçü de yasak.**
- **F0'ın, F2'nin, F3'ün, F5-A/B/C'nin işi sökülmez.** `beden` bir eksendir ve
  **KALIR**. `nodeId()`'nin siluet kolu **geri alınmaz** (K24).
  `suppressPanel()`'e **açı parametresi EKLENMEZ** (K36/§4A).
  `splitPanel()`'e **kesir parametresi EKLENMEZ** (K41).
  `rotate_check`'in R0 **çapraz-ölçüm** kolu **sabite geri çevrilmez** (K36).
  `op_fixture` **silinmez** — süitin 362 saniyesi ona bağlı (K37/İŞ 0a emsali).
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
  ⚠ **`ctest-tail-hides-verdict` ÜÇ OTURUMDUR yanlış ateşliyor** (borç 61) —
  `| tail -2` gören her komutta, `ctest` olmasa bile. **Bekle ve kaydet.**
- 🚨 **"SINIRSIZ" / "UNLIMITED" KELİMESİ YASAK** (K45). §4A
  `rotate + slash-spread + merge` üçlüsünü şart koşuyor; **ikisi yok.**
- 🚨 **Bu kesim "PRENSES DİKİŞİ" DİYE ADLANDIRILMAZ** (K42).

## NOTLAR — hakemden faz ajanına

- **KAPIYI KOŞTUR. TAM `ctest` KOŞTUR.** Bu makinede **~718 sn** (hakem ölçtü);
  bitmesini bekle, `-R` ile geçiştirme.
- **Kendi mutasyonunu koştur ve LOGLA** (`GECE7/log/f5d.mutasyon.txt`).
  ⚠ **`GECE7/log/f5c.mutasyon.sh` İYİ YAZILMIŞ — kopyala.** `git numstat`'ı
  her turun başında **basıyor** (etiket iddia değil ölçüm), `shasum` ile
  ikilinin kımıldadığını kanıtlıyor, kımıldamazsa **"HUKUM YOK"** yazıyor.
  ▸ **Mutasyonlarını KENDİ YAZMADIĞIN dosyalara da yay** — en az **ÜÇ**
    mutasyon, **ÜÇ AYRI** ve `numstat`'ı **BOŞ** dosyada. F5-C bunu doğru yaptı.
  ▸ **Zincirleri kısa tut**, her turdan sonra `git status` ile sıfırlandığını
    doğrula (F5-B'de betik ortada öldü ve ağacı mutasyonlu bıraktı).
  ▸ ⚠ **Fikstürü bozan bir mutasyon fikstürü YENİDEN ÜRETMELİ** — F5-C ajanı
    MU1'de bunu kendi yaptı (`24c7bdfc → c3583474 → 24c7bdfc`). **Bayat fikstür
    üzerinde hüküm verme** (borç 58).
- ⚠ **`git stash`'i TEK BAŞINA koştur** — F5-A'da bir zincirin içinde bloklandı
  ama `git stash pop` yine de koştu ve başka bir oturumun stash'ini açtı.
- **Sayı bulunamıyorsa uydurma** (§3.10). Bu koşuda *"YAYIN BULUNAMADI"*,
  *"H4 ÖLÇEMEDİM"*, F5-B'nin **41.48'e ayar yapmayı REDDETMESİ** ve F5-C'nin
  **14'e ayar yapmayı REDDETMESİ** — dördü de doğru davranıştı.
- **Bildirmek ucuz, gizlemek pahalı.** F5-C ajanı H5 paydasının büyümediğini,
  `split`'in **ürüne değmediğini**, üç yedinci kırmızının doğduğunu ve iptalin
  kapısız olduğunu **kendi yazdı**; hükmü bu **güçlendirdi.**
- **Damla'ya soru sorulmaz** (§3.4) — `GECE7/DAMLA.md`'ye yazılır, **en
  kısıtlayıcı** varsayımla ilerlenir, koşu durmaz.
- **`git status` temiz bırak.** Takipsiz `patterns_real/` kalemleri bu koşunun
  kirliliği değil; **push'a karıştırma.**
- **SIFIR ÜCRETLİ API ÇAĞRISI** (§3.9). Fixture yenilemek bir **faz kararıdır.**
  ▸ Yayınlanmış **doküman sayfası** okumak bu yasağa girmez — F5-C'nin künye
    turu böyle yapıldı ve **hakem dördünü de doğruladı.**

## SAPMA SORUSU — cevabı ÖLÇÜLMÜŞ olacak

> *"Bir yabancı fotoğraf yükleyip kalıp + flat indirebiliyorum — peki artık
> **kullanıcı olarak bir paneli böldürebiliyor muyum**, bölünen kenarın iki
> tarafı `draftJSON`'da **dikiş çifti** olarak görünüyor mu (**H5 paydası
> büyüdü mü?**), ve **H4 hâlâ ÖLÇEMEDİM mi?**"*

*"Bağladık"* = **sapma, reddedilir.** Cevap bir dosya yolu + bir kapı çıkışı +
iki mutasyonun kırmızısı + **H5'in önce/sonra PAYDASI** + `grep`'in ürün
hattında bulduğu **satır**dır.

## BORÇ — devreden + hakem turu

**F5-C'de KAPANDI:** 43 (süit **1080.09 → 717.75 s**) · 47 (mutasyon etiketi) ·
48 (özet satırı) · **K39** (künye — hakem dördünü de açtı ve doğruladı).

**AÇIK ve devrediyor:** **39** (K32) · **40** (K34, wasm `source-stamp`) ·
**41** (K33, `figure-lint.mjs` symlink'te sessizce yeşil) · **42** (wasm↔native
düğüm eşitliği kapısız) · **44 → 54** (K40: `maxDartDeg` kıyası **dayanaksız**) ·
**45 + 49** (**ürün yolu** → **bu kartın İŞ 1'i**) · **46** (`top/dart/woven`ın
adı ile geometrisi ayrışıyor — **Halka 3**) · **50** (→ İŞ 0b) · **51**
(H5 paydası → **İŞ 1**) · **52** (bölme yalnız `vertical`) · **53** (→ İŞ 0c) ·
**55** (iptal **kapısız**; eşiği değiştirmek **hakem kararı**).

**Hakemin F5-C turunda eklediği altı kalem:**

56. 🚨 **`split_check` sıralanmış profili göremiyor** → **İŞ 0a**, K43.
57. **Vücut-girdisi sabitleri KAPISIZ** (HM-2 `kAspectBust` 1.35→1.42 ·
    HM-3 `kCapMM` 60→90; 7–8 kapı yeşil kaldı). Kaynakta zaten `ASSUMPTION:`
    damgalılar. → **Halka 3 / F4**, K44. **Bu kartın şartı DEĞİL.**
58. **`build/op-suppress.json` kalıcı bir fikstür** — bayat fikstür üzerinde
    hüküm verme yolu **teorik olarak açık**.
59. **Bir alıntı birebir değil:** *"Bust Dart Length"* kaynakta *"Controls the
    length of the bust dart"*. Alan gerçek, **alıntı düzeltilmeli.**
60. **`freesewing-aaron → op.split` eşlemesi zayıf** (bir ön + bir arka = **iki
    ayrı panel**, bir panelin **bölünmesi** değil). Payda mühürlü → **hakemin.**
61. **`ctest-tail-hides-verdict` üç oturumdur yanlış ateşliyor** — kuralın
    **kendisi** onarılmalı. `guard.json`'a **dokunulmaz.**

**Hâlâ açık ve silinemez:** gerçek tarayıcıda **hiç tıklanmadı** (dokuz fazdır,
**DOĞRULANMADI**, headless harness yok) · miras 6 kırmızının **4'ünün** kök
sebebi aranmadı · inen 7 dosyanın **5'i sessiz** · `download.js`'teki
`kokenKaydi = null` arka kapısı · **H4/H6/H9 ÖLÇEMEDİM** · H5 **tek çiftten**
okunuyor · `vocab_reference_check` bir **referans sayacı** (K12) · **K17** kapı
ölçüm verisini ürün spec'i sayıyor · `conftest.py` bir kapsam kapısıdır ve
**hiçbir mutasyonla korunmuyor** · `pages.yml:23` `branches: [main]` = **main'e
her push canlıya çıkıyor** · `patterns_real/` **PUBLIC** (K10, Damla kararı) ·
holdout **4 fotoğrafa** düştü ve **harcanmadı** · borç md.30 (`SeamPlan::sinif`
tek dize) ve md.31 (`GarmentSurf` kopyalanıyor, **DOĞRULANMADI**) açık.

---

# AJAN KARTI — F5-D (**ÜRÜN YOLUNA BAĞLAMA**)

**Ağaç:** `main` @ `F5C-yesil`. Geri alma: `git reset --hard F5C-yesil`.
**Bu bir ALT-KARTTIR (§3.12).** F5 **BİTMEDİ.** Motorda **3** operatör var
(`op.rotate` · `op.suppress` · `op.split`); mühürlü paydanın kuyruğunda **5** ad
basılı (`attach` 3 giysi · `derive` · `extend` · `gather` · `overlay` 1'er).
**F5'in kapanış eşiği "15 operatör" DEĞİL, kuyruğun boşalmasıdır** (K45, §4A).
*"F5'i bitirdim"* **denmiyor.**
