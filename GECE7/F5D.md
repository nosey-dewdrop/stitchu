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

---

# AJAN KARTI — F5-D (**ÜRÜN YOLUNA BAĞLAMA**)

**Ağaç:** `main`. Faz öncesi etiket `F5D-oncesi`. Geri alma: `git reset --hard F5D-oncesi`.
**Bu bir ALT-KARTTIR (§3.12).** F5 **BİTMEDİ**; mühürlü paydanın kuyruğunda hâlâ
**5** ad basılı (`attach` 3 giysi · `derive` · `extend` · `gather` · `overlay` 1'er).
*"F5'i bitirdim"* **denmiyor.** *"Sınırsız"* kelimesi **hiçbir yerde kullanılmadı** (K45).

## KAPI — ÖNCE → SONRA, her sayıda `n` (hepsi ajanın kendi temiz Release koşusu)

| kapı | ÖNCE (F5-C hakemi) | **SONRA (F5-D)** |
|---|---|---|
| `ctest` (temiz Release, `rm -rf build`, sıfırdan) | **6 failed / 125** · 717.75 s | **6 failed / 126** · **747.37 s** |
| miras altı ad | `flat_pattern_agree_check` · `flat_artifact_census` · `style_check` · `sizechart_source_check` · `contract_check` · `figure_check` | **AYNI ALTI. YEDİNCİ KIRMIZI YOK.** |
| `op_fixture` | 366.24 s | 376.10 s |
| `rotate_check` | 25.41 s | 26.13 s |
| `suppress_check` | 0.04 s | 0.04 s |
| `split_check` | 12.74 s | **13.74 s** (SP9 · SP10 · SP11 eklendi) |
| **`op_program_check` (YENİ)** | yoktu | **12.57 s** |
| `tek_nesne_check` | EXIT 0 | **EXIT 0**, 23.25 s |
| `expressability_check` | EXIT 0 · 3/5 | **EXIT 0 · 3/5**, `TABAN_PAYDA` **0 satır** |
| `vocab_reference_check` | YESIL 10312 / 10438 | **YESIL 10320 / 10438** (delta −118) |
| `indir_check` | EXIT 0 | **EXIT 0** |
| `hedef_kosu` | EXIT 0 · CIRCIR SAĞLAM | **EXIT 0 · CIRCIR SAĞLAM** |
| `pytest -q` | 33 passed | **33 passed** |

`ctest`'in son satırı, **ÖZETLENMEDİ, KOPYALANDI** (tam log: `GECE7/log/f5d.ctest.acilis.txt`):

```
95% tests passed, 6 tests failed out of 126

Total Test time (real) = 747.37 sec

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

⏱ **SÜİTİN MALİYETİ, ÖNCE → SONRA: 717.75 → 747.37 s (+29.62 s).** Kalemi kalemine:
`op_program_check` **+12.57 s** (yeni kapı, iki planı kuruyor), `split_check`
**+1.00 s** (3B ızgara basılıyor: çıktı 402 KB → 524 KB), `op_fixture` **+9.86 s**
ve `rotate_check` **+0.72 s** (aynı gürültü bandı, kart onlara dokunmadı).
F5-C'nin 1080 → 718 kazancı **geri tırmandırılmadı**.

## CIRCIR — F5'in hanesi H4 · H5 · H8. Her sayıda `n`.

| sayı | taban (F5-C sonrası) | **F5-D sonrası** | hüküm |
|---|---|---|---|
| H1 | 5/5 · 10/10 | **5/5 (n=5) · 10/10 (n=10)** | tavan (K25) |
| H2 | %95.2 · %93 | **%95.2 (n=5) · %93 (n=10)** | aynı |
| H3 | 2 · 2 | **2 · 2** | aynı |
| **H4** | **ÖLÇEMEDİM** (dokuz faz) | 🚨 **ÖLÇEMEDİM (onuncu faz) — ve sebebi artık bir CÜMLE DEĞİL, BİR YER.** Aşağıda. | uydurulmadı |
| **H5** | **0 / 5** çift | 🚨 **0 / 5 çift — PAYDA BÜYÜMEDİ.** ÖNCE payda **5**, SONRA payda **5**. **KAZANIM YAZILMIYOR**, sebebi bir YER olarak aşağıda. | dürüst |
| **H8-sözlük** | 31 (n=5) · 61 (n=10) | **31 (n=5) · 61 (n=10)** | kötüleşmedi, sözlük daraltılmadı |
| **H8-ifade** | **3 / 5** (n=5) | **3 / 5** (n=5) | kötüleşmedi; payda **MÜHÜRLÜ**, 0 satır |
| H10 | %58.3 · %64.4 | **%58.3 · %64.4** | aynı |
| **H10a** | %17.5 · %29.7 | **%17.5 · %29.7** | **yükseltilmedi** (K21) |
| **H10b** | **%40.0 · %33.1** | **%40.0 · %33.1** | **§0B tavanı KIMILDAMADI** |
| H10e | 3 · 5 | **3 · 5** | aynı |
| H10x | %0.8 · %1.7 | **%0.8 · %1.7** | aynı |
| **H11** | 3.2 ms | **3.0 ms (n=5) · 2.1 ms (n=10)**, en kötü 32.5 ms | **<10 sn tavanının çok altında** |

⚠ **H11 ÜRÜN YOLUNA OPERATÖR BAĞLANMASINA RAĞMEN KIMILDAMADI, VE SEBEBİ ÖLÇÜLDÜ:**
`hedef_kosu`'nun süresi `draftJSON` hattını ölçüyor, operatör programı ise
`SeamPlan` hattında ve **opt-in**. Programın kendi maliyeti ayrı ölçüldü:
`plan-ops EU38` **12.88 s** (iki plan kuruyor), ve o rakam `op_program_check`'in
12.57 s'sinin tamamıdır. Kullanıcı düğmeye basmadıkça ödenmiyor.

## ⭐ İŞ 0a — `split_check` ARTIK SIRALANMIŞ BİR PROFİLİ GÖRÜYOR (borç 56 / K43)

**Teşhis, ve neden kapının içinde bir satırla kapanmıyordu:** hakemin HM-1'i
profili **aynalıyor** (`defCol[j] → defCol[cols−j]`). Bir aynalama profilin
**çokluğunu, toplamını ve iptalini** değiştirmez; yalnız **SIRASINI** değiştirir.
SP0 argmin'i **aracın bastığı** profilden çıkarıyor, SP1 yalnız **toplamı**
bağlıyor, ve toplam sıraya duyarsız. **Bir permütasyon, o değerler ÜZERİNDE
kurulan hiçbir kimlikle yakalanamaz** — ancak değerleri, kımıldamamış bir şeyden
**yeniden ÖNGÖREREK** yakalanır.

**Yapılan:** o şey geometrinin kendisi. `SurfacePanel` artık defektin toplandığı
**3B mesh ızgarasını** taşıyor (`deficitGrid3D`, `surfacepattern.cpp:1055`), araç
onu basıyor (`izgara3d`, satır 0 = örneklenen bel halkası, satır rowsN = uzak
sınır, sütun j = profilin indekslendiği halka sütunu), ve `split_check`'in
**SP9** kolu sütun-defektinin **tamamını ham koordinatlardan yeniden hesaplayıp
sütun sütun** karşılaştırıyor.

- **ÖLÇÜLDÜ, beş koşumda:** en kötü fark **4.81e−10° · 4.94e−10° · 1.22e−12° ·
  4.98e−10° · 4.84e−10°** — C++ `libm` ile JS `Math.acos` arasındaki fark, çünkü
  defekt 2π'den altı açının çıkarılmasıdır ve dar köşelerde `acos`'un türevi
  patlar. **Eşik 1e−6°, yani ölçülen gürültünün ~2000 katı**; aynalamanın
  ürettiği fark **derece mertebesinde**. §3.10: eşik **uydurulmadı, ölçüldü ve
  yanına yazıldı.**
- **KAPSAM İLAN EDİLDİ, SESSİZCE ATLANMADI:** kimlik yalnız **penssiz** panelde
  iddia ediliyor (bir pens kendi sütununu ikizler, ikizler sınıra düşer ve
  motorun toplamından çıkar ama naif bir ızgara yürüyüşünden çıkmaz). Beş koşumun
  beşi de **pens = 0** (ölçüldü, `seam-plan --kalip` sekiz panelde de `"pens": 0`).
  Pensli bir panel gelirse kol o koşumu **adıyla rapor eder** ve hiç koşum
  denetlenemezse **kırmızı yanar**.
- **SP10 — kesim sütununun sınırdaki yeri, iki uçtan bağımsız.** Araç bel ve uzak
  koşularının **kenar indekslerini** de basıyor; kapı `panelsplit.cpp`'nin
  `vertexAtColumn` kuralını **kendi** uyguluyor (koşunun artan/azalan yönü
  **okunuyor**, varsayılmıyor) ve aracın söylediği iki kontur noktasıyla birebir
  karşılaştırıyor. Ölçüldü: sütun 16 → `kontur[16] ↔ kontur[96]`, sütun 11 →
  `kontur[11] ↔ kontur[101]`, sütun 13 → `kontur[13] ↔ kontur[99]`.

**KANIT — HM-1 TEKRARLANDI (`GECE7/log/f5d.mutasyon.txt`, tur `HM-1r`).**

## ⭐ İŞ 0c — MAKSİMUM EĞRİLİK SÜTUNU YAN YANA BASILIYOR (borç 53 / K42 md.3)

`SplitReport` artık iç sütunlar üzerinde `deficitColumnDeg`'in **argmax**'ını da
taşıyor ve araç her koşumda basıyor. **ÖLÇÜLEN, EU38:**

| koşum | DENGELİ-YÜK kesimi | MAKSİMUM EĞRİLİK sütunu | fark |
|---|---|---|---|
| `sevk_edilen_on` | **16 / 32** | **1 / 32** (−0.000663°) | −15 sütun |
| `vucudu_izleyen_on` | **11 / 32** | **6 / 32** (+14.141667°) | −5 sütun |
| `vucudu_izleyen_arka` | **13 / 32** | **6 / 32** (+15.066331°) | −7 sütun |

**Kural DEĞİŞMEDİ**, kesim o sütuna **taşınmadı**, iki kural bir eşikle
**kıyaslanmadı** (`cutplan`'ın `rivals`'ı emsal). `split_check` SP11 basılan
sayıyı **profilden bağımsız yeniden çıkarıyor** — yan yana basılan bir sayı da
ölçülen olmak zorunda. 🚨 **Bu kesim hiçbir yüzeyde "prenses dikişi" / "kup
dikişi" diye ADLANDIRILMADI** (K42 md.2); künye `YAYIN BULUNAMADI` olarak duruyor.

## ⭐ İŞ 0b — `atFraction` CİNSİNE GÖRE AYRILDI (borç 50 / K41)

`contract/primitives-v1.json`'ın `seam` primitifi **`sewnToFraction`** adında,
**kendi adını taşıyan** bir ürün alanı kazandı: *bir dikişin nereye kadar
dikildiği.* Arka-yırtmaç presetlerinin iki kesri (**0.75** ve **0.6**)
`op.split.atFraction`'dan **oraya taşındı**. `atFraction` geriye kalan **13**
preset'te **tüketilmeyen kadran** olarak duruyor ve notu güncellendi.

- **Tek bir yargı silinmedi, tek bir sayı atılmadı** (§5.5): iki sayı aynı iki
  sayı, artık doğru ismin altında.
- **İkisi de `YAYIN BULUNAMADI` damgasını KORUYOR** ve hiçbiri bir ürün
  varsayılanı olarak dışarı söylenmiyor. `motorda_tuketilmiyor: true` ikisinde de.
- `preset_resolve_check` **kırmızı yanmadan** yapıldı (temiz Release süitinde
  **Passed**), ve kapı **gevşetilmedi**: `seam`'in parametre listesine yeni ad
  eklendiği için bundle denetimi hâlâ bilinmeyen her parametreyi reddediyor.

## ⭐⭐ İŞ 1 — ÜÇ OPERATÖR ÜRÜNE DEĞİYOR (borç 45 + 49 + 51 / K46)

**ÖNCE (hakemin ölçümü, üç alt-kart boyunca aynı):**

```
panelsplit.hpp · dartsuppress.hpp · dartrotate.hpp
  →  garment.cpp / wasm/bindings.cpp / web/js/*   :   ÜÇÜNDE DE SIFIR SATIR
```

**SONRA — `grep`, karta yazılıyor (§ faz kapısı md.9):**

```
$ grep -n "planops\|opsJSON\|operatorProgram" engine/wasm/bindings.cpp web/js/*.js
engine/wasm/bindings.cpp:12:#include "../src/planops.hpp"
engine/wasm/bindings.cpp:568:std::string opsJSONBinding(std::string size, double neckDropMM) {
engine/wasm/bindings.cpp:570:        return opsJSON(size, neckDropMM);
engine/wasm/bindings.cpp:596:    emscripten::function("opsJSON", &opsJSONBinding);
web/js/create.js:8:import { draft, grade, operatorProgram } from './engine.js?v=136';
web/js/create.js:1045:    const prog = await operatorProgram('EU38', 0);
web/js/engine.js:118:export async function operatorProgram(sizeLabel, neckDropMM = 0) {
web/js/engine.js:120:  return JSON.parse(engine.opsJSON(String(sizeLabel), Number(neckDropMM) || 0));
```

⚠ **`garment.cpp` HÂLÂ SIFIR SATIR** ve bu **gizlenmiyor** — H5/H4'ün yeri tam
orası, aşağıda.

**Yeni dosya `engine/src/planops.cpp`.** Program **iki paso**, ve sıra bir tercih
değil bir ölçüm: **önce böl, sonra her yarımı bastır.** Tersi eğriliği **iki kez**
çıkarır ve `suppress-op`'un `cift_bastirma` koşumu bunun ne yaptığını ölçtü
(panel **kendini kesiyor**: artık deficit 27.8788°, 24427 mm²'lik sektöre karşı
11417 mm² çıkarılmış).

**"Geri yazıldı" ne demek — ÖLÇÜLDÜ, `plan-ops EU38`:**

| okuma | panel | dikiş | uygulanan | reddedilen |
|---|---|---|---|---|
| `sevk_edilen` (skimBodice=ON) | **8 → 10** | **524 → 526** | 2 | 26 |
| `vucudu_izleyen` (skimBodice=OFF, maxDartDeg=0) | **8 → 16** | **528 → 536** | 30 | 10 |

- **İki parça plana PANEL olarak giriyor** (`left_ftorso#a` / `left_ftorso#b`) ve
  **panelin kendi sınır koşuları parçalara taşınıyor** — bu, `op.suppress`'in bir
  **YARIMA** sorulabilmesini sağlayan şey. Koşusu olmayan bir parçaya pensin
  ağzının nereye oturacağı **sorulamaz**.
- **Bütün paneli referans alan HER DİKİŞ YENİDEN ADRESLENİYOR**, düşürülmüyor:
  iki parça bir kapalı sınırın bitişik dilimleri olduğu için eski kenar
  indeksinden `(parça, kenar indeksi)`'ne giden harita **tam ve kesin**
  (`mapEdge`, planops.cpp).
- **Kesik bir DİKİŞ ÇİFTİ olarak ilan ediliyor** ve iki uzunluk **İKİ AYRI
  kontur üzerinde** ölçülüyor: `359.679077708 mm ↔ 359.679077708 mm`, fark
  **0.0e+0 mm** (sevk edilen); `370.509791612`, `373.854685901`, `408.705174773`,
  `413.686506780 mm` (vücudu izleyen, hepsinde fark 0).
- **YÜK GERÇEKTEN BÖLÜNÜYOR VE İKİ YARIM KENDİ PAYINI BASTIRIYOR** — SP8'in ürün
  yolundaki hâli: `left_ftorso` **55.173533° → 26.840105° + 28.333428°**, ve
  `op.suppress` o iki yarımda **tam o iki açıyı** açıyor (sınırdan geri okunan
  açı, `wedgeMeasuredDeg`). `op.rotate` pensi planın **kendi ilan ettiği yan
  dikişe** taşıyor (koordinattan tahmin YOK).
- **RET DE ÜRÜN YOLUNDAN GÖRÜNÜYOR, SAYIYLA.** Sevk edilen gövde bir **koni**:
  `op.suppress` 8 panelin 8'inde reddediyor (`deficit −1.962831° / −0.111611° /
  −0.000000°`), `op.split` arka ve etek panellerinde reddediyor (mutlak sütun
  profili **0.111611° / 0.000000°** < taban **0.50°**). **36 ret, 16'sı ölçülmüş
  bir sayı taşıyor.** Sessizce boş dönmek yok (§0B).
- **HİÇBİR OPERATÖRÜN GEOMETRİSİ DEĞİŞMEDİ** (K36/K41): `splitPanel()` imzası
  hâlâ `SplitReport splitPanel(const SurfacePanel&)` — **tek argüman**;
  `suppressPanel()`'e **açı parametresi eklenmedi**; `rotate_check`'in R0
  **çapraz-ölçüm** kolu **sabite çevrilmedi**. Program hiçbir kadran eklemiyor:
  pensin ağzı panelin **orta sütunu** (suppress-op'un kendi kuralı), apeks
  derinliği **plandan okunan** `SheathOptions::bodiceApexFrac`, taşıma hedefi
  planın **kendi dikiş listesinden** okunan yan dikiş.
- **SEVK EDİLEN OKUMA DEĞİŞMEDİ** (RULES 4, opt-in / default OFF): program planın
  bir **KOPYASI** üstünde koşuyor; `planJSON`, `flatJSON` ve `nodeId()` el
  değmedi (`0c1d52866882ce53` iki uçta aynı), `tek_nesne_check` **EXIT 0**, altı
  miras kırmızı **büyümedi**.
- **Sayaç kullanıcı arayüzüne ÇIKMADI** (F3'ün kuralı sürüyor): `create.js`'in
  paneli operatörün ve panelin **adını** ve motorun **kendi cümlesini** basıyor,
  bir rozet ya da bir hat sayacı basmıyor. Ret **hata rengiyle değil**, `dl-koken`
  ile aynı sakin mürekkeple basılıyor — bir ret bir hata değil, ölçülmüş cevaptır.

**YENİ KAPI: `op_program_check` (8 kol, `ctest`'e kayıtlı, 12.57 s).**
OP0 her adımda `sebep` + ret⇔gerekçe birebir · OP1 **üç operatör de soruldu,
uygulandı, PLANA YAZILDI** · OP2 bölme sayısı = panel artışı = dikiş artışı ·
OP3 kesik bir çift ve iki parça panel listesinde · OP4 ret sayıyla görünüyor ·
OP5 yük korunuyor ve yarımlar kendi payını bastırıyor · OP6 `sebep` kalıp değil
(17 ayrı metin) · OP7 kama **çifte bağlı** (sınırdan geri okunan açı = adımın
deficit'i **ve** o deficit `op.split`'in o yarım için ölçtüğü pay).

## İŞ 2 — H4: **ÖLÇEMEDİM**, VE SEBEBİ ARTIK BİR **YER**

Kart iki seçenek verdi: bir sayı, ya da *"neden ölçülemediği bir CÜMLE değil bir
YER"*. **Yer budur, üç satır:**

1. **`engine/tests/hedef_kosu.mjs:246`** — `const d = await draft(spec);`
   `draft()`, `engine/tools/spec-diff.mjs` üzerinden **`draftJSON`**'u çağırır.
2. **`engine/tests/hedef_kosu.mjs:258-263`** — H5 `d.pattern.pieces[].edgeRoles`
   üzerinden sayar; **`hedef_kosu.mjs:346`** H4'ü `ÖLÇEMEDİM` basar. İkisi de
   **`draftJSON` hattındadır.**
3. **`engine/src/garment.cpp:1-45` (include listesi)** — `draftJSON`'un kalıbını
   çizen `GarmentDrafter`, `seamplan.hpp`'yi de `surfacepattern.hpp`'yi de
   **hiç include etmiyor** (ölçüldü: `grep -n "panelsplit\|dartsuppress\|
   dartrotate\|planops" engine/src/garment.cpp` → **SIFIR SATIR**). Üç operatör
   `SurfacePanel` üzerinde çalışır; `GarmentDrafter` `PatternPiece` üretir. **İki
   nesne arasında bugün hiçbir köprü yoktur** ve köprü, F3'ün *"40+ isim
   dosyasını yüzey hattına geçirme"* işidir (§F5'in kendi sıra düzeltmesi:
   `F3(ilk sınıf) → F5(operatörler) → F3(kalan sınıflar)`).

**Bunun sonucu, ve saklanmıyor: H5'in paydası BÜYÜMEDİ (5 → 5) ve H4 hâlâ
ÖLÇEMEDİM.** Bu kart operatörleri **ürün yoluna** bağladı; bağladığı yol
`SeamPlan → opsJSON → wasm → web/js`. `draftJSON` hattı **başka bir nesne** ve
onu bu kartta bağlamak, hiçbir kapının koruyamadığı bir geometri ameliyatı
olurdu (`DraftedPattern.pieces`'a panel eklemek `validator`, `printpack`,
`cutplan`, `flat_expresses_spec_check`, `style_check`, `figure_check` ve golden
diff'i birden hareket ettirir — **yedinci kırmızı**, ve RULES 4'ün ihlali).
**Bir sayı zorlanmadı** (§3.10). ⭐ **AMA `sebep` KATMANI ARTIK VAR VE ÖLÇÜLÜYOR:**
`OpStep::reason`, `op_program_check` OP0/OP6, 17 ayrı metin. H4'ün sayacağı şey
budur; kalan tek iş onu `draftJSON` hattına taşımaktır ve o iş bir **isim
dosyası** işidir, bir kapı işi değil.

## MUTASYON KANITI — `GECE7/log/f5d.mutasyon.txt` (betik: `GECE7/log/f5d.mutasyon.sh`)

Betik F5-C'ninkinin halefi ve aynı üç sıkılığı taşıyor: her turda **ikili
SİLİNİP yeniden derleniyor** ve `shasum` ile kımıldadığı **kanıtlanıyor**
(kımıldamazsa **"HUKUM YOK"**), `ikili` sütunu **kendi kendini açıklıyor**
(beş ikilinin ilk-8'lerinin birleşimi: `seam-plan|rotate-op|suppress-op|split-op|plan-ops`),
ve her turun başında **`git numstat F5D-oncesi..HEAD`** basılıyor — **etiket bir
iddia değil bir ölçüm** (borç 47'nin dersi). Zincirler kısa, her tur `trap` ile
geri alıyor, ve her turdan sonra `git status` ile ağacın sıfırlandığı
doğrulanıyor.

| mut | dosya | `numstat` | değişiklik | kapı | sonuç |
|---|---|---|---|---|---|
| **HM-1r** | `surfacepattern.cpp` | **YAZILAN** (7,0) | 🚨 **hakemin HM-1'i AYNEN: sütun profilini AYNALA** | `split_check` | ⭐ **EXIT 1 (KIRMIZI)** — F5-C'de EXIT 0 idi |
| **MP1** | `planops.cpp` | YAZILAN (486,0) | kesiği **dikiş çifti olarak ilan etme** | `op_program_check` | **EXIT 1 (KIRMIZI)** |
| **MP2** | `planops.cpp` | YAZILAN (486,0) | *"uygulandı"* de ama **plana yazma** | `op_program_check` | **EXIT 1 (KIRMIZI)** |
| **MP3** | `panelsplit.cpp` | YAZILAN (15,0) | kesiğin **iki ucunu ayır** (B bir köşe ileriden) | `split_check` | **EXIT 1 (KIRMIZI)** |
| **MU1** | `tools/rotate-op.cpp` | **BOŞ → DOKUNULMAMIŞ** | apeks kesri motordan değil **yerel sabitten** | `rotate_check` | **EXIT 1 (KIRMIZI)** |
| **MU2** | `src/shellprojection.cpp` | **BOŞ → DOKUNULMAMIŞ** | `bust_circumference` **belin** çevresini basar | `tek_nesne_check` | **EXIT 1 (KIRMIZI)** |
| **MU3** | `src/dartsuppress.cpp` | **BOŞ → DOKUNULMAMIŞ** | pens açısı **sabite** çevrilir (41.48) | `op_program_check` | ⭐ **EXIT 1 (KIRMIZI)** — OP7 kolu |

**Üç mutasyon bilerek `numstat`'ı BOŞ olan ÜÇ AYRI dosyaya yayıldı** (kartın
şartı). Her turdan sonra ağaç temiz: ikili tabana döndü, kapı **EXIT 0**.

🚨 **HM-1r BU KARTIN TEK ZORUNLU KANITIDIR VE TUTTU.** Hakemin F5-C'de
`split_check`'i **EXIT 0, sıfır FAIL** bırakan mutasyonu — kesim sütunlarını
16→15 · 11→20 · 13→18 kaydırdığı hâlde — artık **EXIT 1**. Geri alınınca
**EXIT 0**. Loglandı.

⚠ **`dugum` HM-1r'de KIMILDAMADI** (`0c1d52866882ce53 → 0c1d52866882ce53`) ve bu
**beklenen**: `nodeId()` halkaları, çözülen üst sınırı ve çizilen silueti karar,
sütun profilini değil. Bildiriliyor çünkü K24/K34'ün sınıfı budur — **düğüm bu
mutasyonu yakalayamaz, yakalayan SP9'dur.** İkili kımıldadı (`…9f464118 →
…72109ec2`), yani bayat-ikili tuzağına düşülmedi.

## DEĞİŞMEZLER — denetim, satır satır

| mühür | değişen satır |
|---|---|
| `contract/hedef-kosu-taban.json` | **0** · blob `cf2af8c7d3c4603eee5aea252f3568feedda8d10` (iki uçta birebir) |
| `KOSU-v7.md` (K26) | **0 bayt** |
| `expressability_check.mjs` → `TABAN_PAYDA` (K31) ve K35'in `X_check` kolu | **0** |
| `engine/tests/hedef_kosu.mjs` (eşik/tanım) | **0** |
| `vision/eval/` **tamamı** (K19/K14) | **0 dosya** → holdout `11`·`12`·`30`·`35` **HARCANMADI** |
| `flat_expresses_spec_check.mjs` + tabanı (K17) | **0** · ⚠ eklenen 4 yeni dosyanın **hiçbiri `.json` değil**, ve tam `ctest` koştu |
| `vocab_reference_check.sh` + `vocab-reference-baseline.json` (K2/K11/K12) | **0** · `--baseline` **çağrılmadı**, SCOPE **daraltılmadı** |
| `flat_pattern_agree_check.mjs` (K23) | **0** — kırmızı **gerçek**, Halka 3 **AÇILMADI** |
| `contract/layers/*`, `sizechart`, `figure-bands` | **0** |
| `patterns_real/` (K10) | takipli **41 → 41**, `git add` **görmedi**, takipsiz kalemler takipsiz kaldı |
| `.rabadon/guard.json` | **DOKUNULMADI** |
| `_olcum_seti.yedek_5` (K16) | **DOKUNULMADI** |
| operatör geometrileri (K36/K41) | `splitPanel()` **tek argüman**, `suppressPanel()`'e **açı YOK**, `rotate_check` R0 **çapraz** kaldı, `nodeId()` siluet kolu **geri alınmadı** (K24) |
| kapı sayısı/kapsamı (§3.8 md.4) | `add_test` **126 → 127**, **SİLİNEN kapı YOK**, `-E` **yok**, `DISABLED` sayısı **1 → 1** |

⚠ **BİR KAPI SERTLEŞTİ, HİÇBİRİ GEVŞEMEDİ:** `split_check` üç yeni kol kazandı
(SP9 · SP10 · SP11) ve mevcut sekiz kolunun **hiçbirinin eşiği değişmedi**.

## 🚨 KENDİ ALEYHİME OLAN — BİLDİRMEK UCUZ, GİZLEMEK PAHALI

1. **H5'in PAYDASI BÜYÜMEDİ: 5 → 5.** Kartın *"asıl şansı"* buydu ve
   **tutmadı**. Kazanım **yazılmıyor**; sebep bir **YER** olarak yukarıda
   (İŞ 2), `garment.cpp`'nin include listesi.
2. **H4 onuncu fazdır ÖLÇEMEDİM.** `sebep` katmanı **var ve ölçülüyor** ama
   **başka bir nesnenin** üstünde.
3. **`garment.cpp`'de hâlâ SIFIR SATIR.** Ürün yolu `SeamPlan` tarafında
   kapandı, `draftJSON` tarafında **kapanmadı**. Kartın *"KULLANICI ULAŞIR"*
   şartı **karşılandı** (wasm + `web/js` + ekran), *"draftJSON o çifti ilan
   eder"* şartı **karşılanmadı**.
4. **Gerçek tarayıcıda HİÇ TIKLANMADI** — onuncu fazdır, **DOĞRULANMADI**,
   headless harness yok. `create.js`'e eklenen düğme `node` tarafında
   koşturulmadı; kanıtı olan tek şey aynı `opsJSON`'un **native** koşumu ve
   sevk edilen wasm'ın onu **export ettiği** (`bundle_fresh_check` PASSED,
   `source-stamp 049737e5f3b06398`).
5. **`?v` DAMGASI BUMPLANMADI** (hâlâ tek değer: **136**). `web/js/create.js`,
   `engine.js`, `i18n.js` ve `app.css` **değişti**; `scripts/deploy.sh` bumplar
   ve o **Damla'nın adımı** — ama `pages.yml:23` `branches: [main]` yüzünden
   **bu push canlıya çıkar** ve tarayıcılar **bayat JS'i** cache'ten
   yiyebilir. **Bildiriliyor, çözülmedi.**
6. **`SurfacePanel` şişti.** `deficitGrid3D` panel başına ~49×33 `Vec3`
   ≈ **38 KB**; sekiz panelli bir planda **~310 KB**. `H11` ölçüldü ve
   **kımıldamadı** (3.2 → 3.0 ms, n=5) çünkü `draftJSON` hattı bu nesneyi hiç
   kurmuyor, ama `flatJSON`/`planJSON` hattında **ödeniyor** ve o hat
   `create.js`'in flat düğmesinin altında. **Ölçülmedi: tarayıcıda flat
   indirmenin süresi.** (borç md.31 — `GarmentSurf` kopyalanıyor — ile aynı aile.)
7. **`split-op` çıktısı 402 KB → 524 KB.** Kapı 12.74 → 13.74 s.
8. **`op.rotate` sevk edilen giyside HİÇ UYGULANMIYOR** (koni, pens yok) —
   ürün yolundaki kanıtı **yalnız** `vucudu_izleyen` okumasından geliyor.
   Sevk edilen giysi için `op.rotate`'in cevabı bir **RET**tir ve öyle basılıyor.
9. **`waistRuns` bölünen parçalarda DÜŞÜRÜLDÜ** (bir gruplamanın yarısı o
   gruplama değildir) — yarım kopyalanmadı, **atıldı ve söylendi**. Bölünmüş bir
   parçanın bel gruplaması yeniden çözülmedi.
10. **Bölünmüş parçalar `deficitColumnDeg` / `deficitBandDeg` / `deficitGrid3D`
    TAŞIMIYOR** (temizlendi). Yani bir parça **ikinci kez BÖLÜNEMEZ** —
    program bir panele **bir** bölme uyguluyor, ve bu bir kapsam beyanıdır.
11. **`SurfaceStitch::Kind::Princess` kod içinde TOPOLOJİ ETİKETİ olarak
    kullanıldı.** JSON `"tur": "panel_bolme"` basıyor; hiçbir ürün yüzeyinde o
    ad geçmiyor (K42 md.2). **Bildiriliyor** çünkü hakem kaynağa bakacak.
12. **`vocab_reference_check` bir kez KIRMIZI YANDI ve KÖKTEN kapatıldı.**
    `contract/primitives-v1.json`'a yazdığım **tek yeni yorum satırı** kapalı bir
    enum adını (`backSlit`) ikinci kez heceliyordu: **161 → 162 (+1)**. Taban
    **kesilmedi**, SCOPE **daraltılmadı**, `--baseline` **çağrılmadı** — cümle
    yeniden yazıldı (presetler adlarıyla değil **yerleriyle** anıldı) ve sayı
    **162 → 161**'e döndü. Bilgi kaybı yok. (F5-C'nin üç yedinci kırmızısıyla
    aynı sınıf; ayrı bir commit olarak duruyor.)

## BORÇ — devreden + bu turun eklediği

**F5-D'de KAPANDI:** **50** (K41, `atFraction` cinsine göre ayrıldı) · **53**
(K42 md.3, iki kural yan yana bir SAYI) · **56** (K43, `split_check` sıralanmış
profili artık **görüyor**, HM-1r kırmızı) · **45 + 49** *(kısmen: `SeamPlan` →
wasm → `web/js` hattı **kapandı**; `garment.cpp` hattı **AÇIK**, aşağıda 62)*.

**AÇIK ve devrediyor:** **39** (K32) · **40** (K34, wasm `source-stamp`) ·
**41** (K33, `figure-lint.mjs` symlink'te sessizce yeşil) · **42** (wasm ↔ native
düğüm eşitliği **kapısız** — ⚠ bu kart wasm'a **yeni bir binding** ekledi, yani
cephe **büyüdü**: `opsJSON`'un tarayıcıdaki çıktısı native `plan-ops` ile
**karşılaştırılmadı**) · **44 → 54** (K40, `maxDartDeg` kıyası dayanaksız; SP8
hâlâ **2.02× / 2.14×** basıyor) · **46** (Halka 3) · **51** *(H5 paydası —
`SeamPlan` tarafında **çift ilan edildi**, `draftJSON` tarafında **hâlâ açık**)* ·
**52** (bölme yalnız `vertical`) · **55** (iptal **kapısız**; `op.suppress`'in RET
eşiği hâlâ **işaretli** toplamı okuyor — ⚠ **GEVŞETİLMEDİ**, ve bu kart onu bir
kapıya da **bağlayamadı**: eşiği değiştirmek hakem kararı, ve iptali bir eşiğe
bağlamak eşik uydurmak olurdu. `split_check` SP6 iptali **ölçüyor ve basıyor**
— **38.232720° / 34.339031°** — ama bir hüküm vermiyor) · **57** (vücut-girdisi
sabitleri kapısız — Halka 3 / F4) · **58** (`build/op-suppress.json` kalıcı
fikstür; ⚠ bu kart **ikinci** bir kalıcı fikstür **eklemedi**: `plan-ops` her
koşumda taze koşuyor) · **59 + 60** (künye sapmaları — **payda mühürlü,
düzeltmesi HAKEMİN, dokunulmadı**) · **61** (`ctest-tail-hides-verdict` — bu
oturumda **dördüncü kez** yanlış ateşledi, bir `cmake --build … | tail -2`
üstünde; `guard.json`'a **DOKUNULMADI**, `rabadon wrong` ile deftere yazıldı).

**F5-D'nin eklediği:**

62. 🚨 **ÜRÜN YOLU İKİYE AYRILDI VE İKİNCİ YARISI AÇIK.** Operatörler
    `SeamPlan` nesnesine bağlandı; `draftJSON`'un `DraftedPattern`'ı **başka bir
    nesne** ve H4/H5 oradan okunuyor. İki nesneyi birleştirmek F3'ün *"isim
    dosyalarını yüzey hattına geçir"* işidir. **Bu kart onu YAPMADI ve
    yaptığını İDDİA ETMİYOR.**
63. **`opsJSON`'un tarayıcı çıktısı native ile KARŞILAŞTIRILMADI** (borç 42'nin
    büyümüş hâli). Yeni binding için bir wasm↔native parite kapısı **yok**.
64. **Bölünmüş bir parçanın sınır koşuları TAM DEĞİL:** `waistRuns` düşürüldü,
    `ringOffset` **bütünden kopyalandı** ve bir yarım için **anlamı
    doğrulanmadı** (DOĞRULANMADI). Bugün tüketicisi yok; yarın olursa yanlış
    okur.
65. **`op_program_check` iki planı da EU38'de kuruyor.** Sekiz bedenin
    yedisinde operatör programı **hiç koşulmadı** (DOĞRULANMADI).

**Hâlâ açık ve silinemez:** gerçek tarayıcıda **hiç tıklanmadı** (onuncu faz) ·
miras 6 kırmızının **4'ünün** kök sebebi aranmadı · inen 7 dosyanın **5'i
sessiz** · `download.js`'teki `kokenKaydi = null` arka kapısı · **H4/H6/H9
ÖLÇEMEDİM** · H5 **tek çiftten** okunuyor · `vocab_reference_check` bir
**referans sayacı** (K12) · **K17** kapı ölçüm verisini ürün spec'i sayıyor ·
`conftest.py` bir kapsam kapısıdır ve **hiçbir mutasyonla korunmuyor** ·
`pages.yml:23` `branches: [main]` = **main'e her push canlıya çıkıyor** ·
`patterns_real/` **PUBLIC** (K10, Damla kararı) · holdout **4 fotoğraf**,
**harcanmadı** · borç md.30 (`SeamPlan::sinif` tek dize) ve md.31 (`GarmentSurf`
kopyalanıyor, **DOĞRULANMADI**).

## §5.5 DÖKÜM — SORULMAYAN AMA GÖRDÜĞÜM

- **`split_check`'in SP7 kolu bir RET'i mutlak profil tabanına bağlıyor, ama
  `splitPanel` iki ayrı sebeple reddedebiliyor** (sütun sayısı < 4 **veya**
  profil düz). Sütun sayısı sebebiyle reddedilen bir panel gelirse SP7
  **kırmızı yanar** ve sebebi yanlış yerde arar. Bugün beş koşumun beşinde de
  `colsN = 32`, yani **tetiklenmiyor**. Onarılmadı.
- **`deficitColumnDeg`'in 0. ve son elemanı her zaman 0** (sınır sütunları) —
  yani argmin'in tarayabileceği aralık `[1, colsN)`. Bu bir kusur değil, ama
  `atFractionMeasured`'ın **hiçbir zaman 0 ya da 1 olamayacağı** anlamına gelir
  ve hiçbir yerde yazılı değildi.
- **`sevk_edilen` okumasında `en_egri_sutun = 1` ve değeri NEGATİF**
  (−0.000663°): sevk edilen koninin profilinde **pozitif eğrilik hiç yok**, yani
  "maksimum eğrilik sütunu" orada **anlamlı bir yer adlandırmıyor**. Sayı
  basılıyor ama **hüküm taşımıyor** ve bu ayrım karta yazıldı, koda değil.
- **`plan-ops` iki planı da kuruyor ve 12.88 s sürüyor**; bunun ~%97'si
  `vucudu_izleyen` planının kurulması. `sevk_edilen` tek başına ~5 s.
  Tarayıcıdaki `opsJSON` **yalnız** `sevk_edilen`'i kuruyor.
- **`figure-lint.mjs`'in symlink boşluğu (borç 41) bu koşuda tetiklenmedi**:
  `realpath == pwd` doğrulandı, `/tmp` altında çalışılmadı.
- **`git stash` bu koşuda HİÇ ÇAĞRILMADI** (F5-A'nın tuzağı).
- **`engine/build` tamamen silindi ve `-DCMAKE_BUILD_TYPE=Release` ile sıfırdan
  derlendi.** K32'nin 23 kırmızısı **görülmedi** çünkü üç tohum diskte hazırdı
  (`engine/dist/` 3 dosya, `pattern-bridge/.venv`, `patterns_real/geometry/`).
- **ERİŞEMEDİĞİM:** gerçek tarayıcı · `/tmp/freesewing` (hâlâ yok) · ücretli API
  (§3.9, **sıfır çağrı**) · sekiz bedenin tamamında operatör programı.

## SAPMA SORUSU — cevabı ÖLÇÜLMÜŞ

> *"Bir yabancı fotoğraf yükleyip kalıp + flat indirebiliyor muyum, ve
> **motordaki üç operatörü ÜRÜN üzerinden çalıştırabiliyor muyum**?"*

**BİRİNCİ YARI — EVET, ve bu kart onu kötüleştirmedi.** `hedef_kosu` **H1 5/5
(n=5) · 10/10 (n=10)**, `indir_check` **EXIT 0**, `ctest` **6 failed out of 126**
(aynı altı miras ad).

**İKİNCİ YARI — İLK KEZ EVET, AMA YARIM, VE YARIMI ÖLÇÜLDÜ.**
**EVET olan:** üç operatör de sevk edilen dikiş planına bağlı ve
`wasm/bindings.cpp:596` → `web/js/engine.js:118` → `web/js/create.js:1045`
hattından **çağrılabiliyor**; bölünen panelin iki parçası plana **panel olarak
girdi** (8 → 10 panel), kesilen kenarın iki tarafı **dikiş çifti olarak ilan
edildi** (524 → 526 dikiş, iki uzunluk iki ayrı kontur üzerinde ölçüldü:
**359.679077708 mm ↔ 359.679077708 mm**, fark **0.0e+0**), her adım bir
**`sebep`** taşıyor, ve **RET de sayısıyla ekrana çıkıyor**.
**HAYIR olan:** bu, `SeamPlan` nesnesidir. `draftJSON`'un çizdiği kalıp
**değişmedi**, dolayısıyla **H5'in paydası 5 → 5** ve **H4 ÖLÇEMEDİM**. Cevap
bir dosya yolu (`engine/src/planops.cpp`), bir kapı çıkışı
(`op_program_check` **EXIT 0**, 12.57 s), **yedi mutasyonun kırmızısı** —
**HM-1r dahil** —, H5'in **önce 5 / sonra 5** paydası, ve `grep`'in ürün
hattında bulduğu **sekiz satırdır**.

---

## KAPANIŞ KOŞUSU — İKİNCİ TAM `ctest`, KART VE LOGLAR COMMİTLENDİKTEN SONRA

⚠ **Sebebi K12'nin tuzağı:** `vocab_reference_check` **commit'ten** okur, yani
açılış koşusundaki yeşili F5-C'nin ağacına aitti. Kapanış koşusu **kendi
commit'imin** üstünde koştu ve `vocab_reference_check` orada da **Passed**
(4.84 s). Tam log: `GECE7/log/f5d.ctest.kapanis.txt`.

```
95% tests passed, 6 tests failed out of 126

Total Test time (real) = 737.23 sec

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

**İki tam koşu, iki kez aynı altı ad, YEDİNCİ KIRMIZI YOK.** Süre **747.37 s** ve
**737.23 s** (aynı gürültü bandı; hakemin F5-C ölçümü 717.75 s). `split_check`
13.27 s · `op_program_check` 13.04 s · `pytest -q` **33 passed**.

⚠ **rabadon bu oturumda ALTI yanlış pozitif verdi** — beşi
`ctest-tail-hides-verdict` (hiçbirinde `ctest` yoktu: `cmake --build … | tail -2`,
`grep … | tail -2`, `pytest -q | tail -2`), biri `red-base` (miras altı kırmızı +
`DISABLED h10_gate_check`, K18). **`guard.json`'a DOKUNULMADI**; altısı da
`rabadon wrong` ile deftere yazıldı. **Borç 61 artık dört değil BEŞ oturumdur
açık ve bu oturumda tek başına altı kez ateşledi.**
