# HAKEM — F5-E (KÖPRÜ) · 1. TUR

**Ağaç:** `main` @ `dc5bb36`. Faz öncesi etiket `F5E-oncesi`.
**Hakem bu koşuda iş yapmadı; her sayı hakemin kendi koşusudur.**

# ✅ GEÇTİ — ⚠ **ve aynı hükümde: F5 DURUYOR, HALKA 3 F4'TEN AÇILIYOR** (K54).

⚠ **HÜKÜM BİR KAZANIM İLANI DEĞİL.** F5-E, §3.6'nın F5'e verdiği **üç sayının
üçünü de** yerinde bıraktı (H4 **ÖLÇEMEDİM — on birinci faz** · H5 **payda 5 → 5**
· H8-ifade **3/5**). F5-D'den sonra hanesi ikinci kez boş kalan alt-karttır.

⚠ **AMA GEÇTİ'NİN GEREKÇESİ AJANIN GAYRETİ DEĞİL, HAKEMİN ÖLÇTÜĞÜ BİR ŞEY:**
**kartın tek şartı TATMİN EDİLEMEZDİ** (K53). Ajan imkânsız bir şartla
suçlanamaz — ve şartı yazan **önceki hakemdir.**

---

## 0. HAKEM NE YAPTI

`engine/build` **tamamen silindi**, `-DCMAKE_BUILD_TYPE=Release` ile **sıfırdan**
derlendi (K32; üç tohum diskte doğrulandı — `engine/dist/` **3 dosya**,
`engine/pattern-bridge/.venv` **var**, `patterns_real/geometry/` **var** → 23
kırmızı **görülmedi**). `realpath == pwd` → **K33 tetiklenmedi, borç 41 AÇIK.**
**Her kapı hakemin kendi koşusu.** Beş mutasyon hakemin kendi eli, **dördü
ajanın hiç açmadığı dosyalarda** (`numstat` **BOŞ**, tek tek basıldı).
**Hakem ayrıca ajanın PROBUNU kendi eliyle yeniden kurdu** ve bedeli
**sınıflandırdı** — hükmün ağırlığı oradadır.

---

## 1. KAPILAR — HAKEMİN KENDİ TEMİZ RELEASE KOŞUSU

`ctest`'in son satırı **ÖZETLENMEDİ, KOPYALANDI**:

```
95% tests passed, 6 tests failed out of 126

Total Test time (real) = 733.19 sec

The following tests FAILED:
	  9 - flat_pattern_agree_check (Failed)
	 20 - flat_artifact_census (Failed)
	 21 - style_check (Failed)
	 28 - sizechart_source_check (Failed)
	 99 - contract_check (Failed)
	105 - figure_check (Failed)
```

**Altı ad TAM OLARAK miras altı. YEDİNCİ KIRMIZI YOK.** `111 - h10_gate_check`
DISABLED kaldı (K18).

| kapı | ÖNCE (F5-D hakemi) | **SONRA (F5-E hakemi, kendi koşusu)** |
|---|---|---|
| `ctest` temiz Release, sıfırdan | **6 failed / 126** · **741.71 s** | **6 failed / 126** · **733.19 s** (**−8.52 s**) |
| kayıtlı test / SİLİNEN kapı | 127 / **0** | **127 / 0** · `DISABLED` **1 → 1** · `-E` **yok** |
| `hedef_kosu` | EXIT 0 · CIRCIR SAĞLAM | **EXIT 0 · CIRCIR SAĞLAM** |
| `indir_check` | EXIT 0 | **EXIT 0** · `KOKEN_ALANLARI` **38** (taban 38) · 71 `ok` |
| `tek_nesne_check` | EXIT 0 | **EXIT 0** |
| `rotate_check` · `suppress_check` · `split_check` | EXIT 0 | **EXIT 0** |
| **`op_program_check`** | EXIT 0 · **8 kol** | **EXIT 0 · 9 kol (OP8)** |
| `expressability_check` | EXIT 0 · 3/5 | **EXIT 0 · 3/5** · `TABAN_PAYDA` el değmedi |
| `golden_check` · `engine_check` | Passed | **Passed** |
| `vocab_reference_check` | YESIL **10320** / 10438 | **YESIL 10322** / **10438** (taban kesilmedi) |
| `pytest -q` | 33 passed | **33 passed** (0.67 s) |

---

## 2. ⭐ İŞ 0 — **KAPANDI, VE HAKEM HM-J2'Yİ KENDİ ELİYLE TEKRARLADI**

Kartın **kanıt şartı** buydu ve **birebir yerine geldi.** `dartrotate.cpp`
(`numstat` **BOŞ** — ajanın hiç açmadığı dosya), transfer açısı `× 0.90`:

```
TABAN  ikili[seam-plan|rotate-op|suppress-op|split-op|plan-ops]
       fc7baddff30f8cafc819d0008be42d635158cf79        ← ajanin logundakiyle AYNI
MUTANT fc7baddf0d9b2453c819d0008be42d63b865f1de        ← KIMILDADI
```

| kapı | F5-D hakemi | **bugün** |
|---|---|---|
| `rotate_check` | EXIT 1 | **EXIT 1** — ALAN **32473.1791 → 36134.0402 mm²** (fark **3660.861111584**), AÇI **55.173533° → 49.65618°** (fark **5.517353326°**) |
| **`op_program_check`** | 🚨 **EXIT 0** | ✅ **EXIT 1 (KIRMIZI)** — **13 `FAIL`** |

**Sayılar prompt'un beklediğiyle BASAMAK BASAMAK aynı çıktı.** Yanan kolun kendi
cümlesi: `OP8/R2 vucudu_izleyen left_btorso#b: ALAN 17753.257178 → 17237.837979
mm², fark 515.419199 > 0.000001. Ürün yolundaki bir transfer KUMAŞ ÜRETTİ.`
Geri alınınca ikili **tabana döndü** ve kapı **EXIT 0**.

▸ **Epsilonlar uydurulmamış — hakem kaynağı karşılaştırdı:** `EPS_ALAN_R = 1e-6`
  ve `EPS_ACI_R = 1e-9`, `rotate_check.mjs:83-84`'ün **KENDİ** sayıları, aynen.
▸ **Kapı canlı ikiliyi koşuyor, bayat fikstürü değil:** `CMakeLists.txt:210`
  `$<TARGET_FILE:plan-ops>` — borç 58'in tuzağına **düşülmemiş**.
▸ `rotate_check`'e **dokunulmadı**, R0 çapraz-ölçüm kolu **sabite çevrilmedi** (K36).

🚨 **BORÇ 66 / K49 GERÇEKTEN KAPANDI.**

---

## 3. ⭐ İŞ 2 — borç 68 KAPANDI · borç 63 ÖLÇÜLDÜ, **KAPANMADI**

`opsJSONBinding` artık `opsJSONAll` çağırıyor; tarayıcı iki okumayı da **adıyla**
alıyor (`create.js` her bloğu motorun **kendi `yuzey` cümlesiyle** başlıklıyor).
Hakem kaynağı doğruladı: **gizli kadran yok**, sevk edilen okuma **hâlâ önce** ve
**hâlâ sayısıyla reddediyor**, `skimBodice` sevk edilen giyside **kapatılmadı**.

**SEVK EDİLEN OKUMA DEĞİŞMEDİ (RULES 4) — ve hakem bunu sözle değil kaynakla
doğruladı:** `planops.cpp:381` `readingJSON(…, SeamPlan plan)` — plan **DEĞER
İLE** geçiyor, yani program sevk edilen planın **KOPYASI** üstünde koşuyor.
`golden_check` **Passed**, `engine_check` **Passed**.

**borç 63:** wasm↔native `opsJSON` en büyük sapma **7.100e-05**, kendi
`EPS_ALAN_R`'sinin **71 katı**. Hakem doğruladı: **hiçbir kapı wasm sayısını
native sayısıyla kıyaslamıyor** (`grep opsJSON engine/tests/*.mjs` → **sıfır**).
**Bugün tehlike yok, ölçüm bir kapıya BAĞLANMADI. Borç 63 AÇIK.**

---

## 4. ⭐ İŞ 3 + borç 71 — **YEDİNCİ KIRMIZI KÖKTEN KAPATILDI, GEVŞETİLEREK DEĞİL**

Hakem `git diff`'i okudu. `scripts/deploy.sh` **+25 satır**: `?v` bump'ından
**hemen sonra** manifesti kendisi mühürlüyor, **sonra kapıyı tekrar koşturuyor**,
hâlâ kırmızıysa *"Do NOT accept it away; find it"* diye **exit 4**.

**Gevşetme DEĞİL, ve kanıtı diff'in kendisi:**

```
contract/generated-paths.sha256      54 insertions(+), 54 deletions(-)
web/ altinda ?v DISI degisen satir   45   (yalnizca app.css 4 · create.js 27 · engine.js 14 = IS 2)
cirdirin kapsadigi 57 yolun hicbirinde ?v disi TEK BIR BAYT oynamadi
web/js  cirdir manifestinde YOK      (grep -c "web/js" -> 0)
```

Yani mühürlenen 54 yolun **54'ü de yalnız `?v=136 → ?v=137` yüzünden** oynadı ve
diff'te **adıyla** duruyor — kapının kendi başlığının istediği tam olarak budur.
**Mühür (K19/K31) ve taban el değmedi.**

⚠ **Ama bir kalem hâlâ açık ve hakem onu kapatmıyor:** `--accept` sonrası koşan
ikinci kontrol **her zaman yeşil** olur (accept **her** yolu yeniden mühürler),
yani *"exit 4"* kolu **ölü koddur**. Bugün zararsız — bump tek değişiklik —
ama **borç 71 bu yüzden KAPANMADI, DARALDI.**

---

## 5. 🔴 HÜKMÜ BELİRLEYEN KALEM — KÖPRÜ. **HAKEM PROBU KENDİ KURDU.**

Kart bunu hakeme bıraktı ve üç soru sordu. **Üçü de ölçüldü.**

### 5.1 *"5610 satırın kaçı davranış değişimi, kaçı yeniden basım?"*

Hakem `garment.cpp`'nin ortak çıkış noktasına (`reanchorEdgeRoles` çoktan-noktası,
satır 1085) iki dikdörtgen parça ekledi — ajanın probunun aynısı — ve dumpı
pin'le diffledi. **Ajanın sayısı BİREBİR yeniden üretildi:**

```
pin  : 23406 satir     dump : 29016 satir     fark: +5610
diff hunk tipleri     : 558 'a' (ekleme) · 3 'c' · 0 'd'
eklenen satir         : 5625      kaybolan satir : 15
  bunun "Bridge probe" iceren  : 5610
  bunun "Bridge probe" icermeyen: 15
15 kaybolan ile 15 eklenen satir: BAYT BAYT AYNI (diff dogruladi)
```

> 🚨 **CEVAP: `0` DAVRANIŞ DEĞİŞİMİ · `5610` YENİDEN BASIM.**
> Mevcut hiçbir parçanın hiçbir koordinatı kımıldamadı. 3 adet `'c'` hunk'ı
> **sahte** — diff'in ekleme sınırını gösterme biçimi; iki taraftaki 15 satır
> birebir aynı. **Bir re-pin bugün sevk edilen tek bir kalıbın tek bir baytını
> oynatmazdı.**

**Yani ajanın *"golden duvarı"* BİR DUVAR DEĞİLDİR** (→ K51).

### 5.2 *"Bu bedel gerçek mi?"* — **50 KIRMIZI BİR BEDEL DEĞİL, ŞARTNAMEDİR**

Hakem `engine_check`'i prob altında kendi koşturdu:

```
engine check: 70200 drafts across 15 bodies x 4680 specs
FAILED drafts: 70200
  rule cutline: 140400 · rule guideCoverage: 140400 · rule waist: 720 · rule waistband: 720
  EU34 skirt/…/aLine/mini: [cutline] Bridge probe A: cutting line missing
  EU34 skirt/…/aLine/mini: [guideCoverage] Bridge probe A: piece is drafted but no guide step mentions it
```

Kaynağa bakıldı: `validator.cpp:1061` (`cutline`) ve `validator.cpp:1321`
(`guideCoverage`) **`for (const auto& piece : draft.pieces)`** üstünde koşuyor —
**parça başına.** Yani 50 kırmızının tamamı *"bir parça eklendi"*nin sonucudur,
*"bir dikiş çifti ilan edildi"*nin değil. **Ve repo haklı:** inen kalıba giren
her panelin bir **kesim çizgisi** ve bir **rehber adımı** olmak zorundadır.
Bu `CLAUDE.md`'nin tek testidir. **Etrafından dolaşılacak bir şey değil.**

### 5.3 🚨 **VE HAKEM KARTIN GÖRMEDİĞİ ŞEYİ BULDU: ŞART TATMİN EDİLEMEZDİ**

Aynı prob koşumunda — parçalar **gerçekten** inen kalıba girmişken ve roller
`reanchorEdgeRoles`'tan **sağ çıkmışken**:

```
H5_dikilebilirlik  0  n=5   0 eslesmeyen cift / 5 olculebilen cift   ← PAYDA 5. BUYUMEDI.
H5_dikilebilirlik  0  n=10  0 eslesmeyen cift / 5 olculebilen cift   ← PAYDA 5. BUYUMEDI.
```

**Sebep mühürlü kapının kendi kodudur** (`hedef_kosu.mjs:264-269 + 333`):
`r.seamPairs.push(...)` bir **döngüde değil**, tek bir `if`'in içinde; bütün
kol oyukları **tek** sayıya, bütün kapaklar **tek** sayıya toplanıyor. Yani
**satır başına en fazla BİR çift**, ve `pairs.length ≤ rows.length = n = 5`.

> 🚨 **H5'İN PAYDASI MOTORDAN BÜYÜTÜLEMEZ. `5` BİR ÖLÇÜM DEĞİL, BİR TAVANDIR.**
> F5-E'nin **tek** kapanış şartı, mühürlü bir dosyanın **imkânsız** kıldığı bir
> şeydi. **Ajan bununla suçlanamaz** (→ **K53**).

⚠ **Ve ajanın kartındaki *"probda payda 5 → 10"* HAKEMDE YENİDEN ÜRETİLEMEDİ.**
Ajanın iki manşet ölçümü aynı probdan gelmiyor: **fiyatladığı** prob (5610 · 50
kırmızı) hakemde **birebir** çıktı, *"mekanizma çalışıyor"* dediği **çıkmadı**.
Sahtecilik değil, **karışıklık** — ama hükmü taşıyan sayı olduğu için düzeltildi.

---

## 6. HAKEMİN KENDİ MUTASYONLARI — üçü ajanın hiç açmadığı dosyalarda

| # | dosya | `numstat` | mutasyon | sonuç |
|---|---|---|---|---|
| **HM-J2r** | `src/dartrotate.cpp` | **BOŞ** | transfer açısı ×0.90 | `op_program_check` **EXIT 1 🔴** (ikili kımıldadı) |
| **HK-1** | `src/bodice.cpp` | **BOŞ** | armhole `EdgeRole` indisini +1 kaydır | 🟡 **HÜKÜM YOK** — aşağıda |
| **HK-2** | `src/sleeve.cpp` | **BOŞ** | kapak eğrisinin oyuğu 0.24/0.18 → 0.80/0.75 | `golden_check` **EXIT 1 🔴** (ikili `75afb18e…` → `b0d10bf3…`) |
| **HK-3** | `src/validator.cpp` | **BOŞ** | `cutline` kuralını körleştir (`if (false)`) | 🚨 **HAYATTA KALDI** — aşağıda |

**HK-1 — HÜKÜM YOK, ve sebebi bir kusur değil bir SAVUNMA.** İkili kımıldadı
(`75afb18e…` → `aaa3df61…`) ama **ölçülen sayı kımıldamadı**: `garment.cpp:1085`
her parçanın rollerini **koordinattan** yeniden çapalıyor (`reanchorEdgeRoles`,
tolerans **1e-6 mm**), yani indis kayması **kendiliğinden onarılıyor**. Kartın
kendi kuralı gereği bu tur **HÜKÜM YOK** yazıldı ve başka bir yer seçildi.
▸ Yan kazanım: **`EdgeRole`'ün indis-kırılganlığı gerçekten kapalı** — F5-D'nin
  V7-D notunun iddiası **ölçüyle doğrulandı.**

🚨 **HK-3 — HAYATTA KALAN MUTANT, VE TAM OLARAK BU KARTIN FİYATLADIĞI KURAL.**
`validator.cpp:1060`'ın `if (piece.cutLine.empty())` koşulu `if (false)` yapıldı,
yani **kesim-çizgisi kuralı tamamen öldürüldü**. `engine_check` ikilisi
**kımıldadı** (`75afb18e…` → `6c7e663c…`) ve:

```
engine_check · guide_check · cuttable_output_check  ->  100% tests passed, 0 failed out of 3
```

**Yani köprünün bedelini belirleyen iki kuraldan biri, sessizce silinse hiçbir
kapı fark etmez.** Bugün kural hiç ateşlemediği için (her parçanın kesim çizgisi
var) mutasyonu görecek bir tanık yok. → **borç 72.**
⚠ **TAM SÜİT ALTINDA DENENMEDİ** (127 kapının tamamı), yalnız üç doğrudan
tüketici koşuldu. **DOĞRULANMADI.**

---

## 7. KAPSAM — kart dışına taşıldı mı? **HAYIR.**

`git diff --stat F5E-oncesi..HEAD` → **155 dosya**, ve motor tarafı **4 dosya**:
`planops.cpp` · `planops.hpp` · `op_program_check.mjs` · `bindings.cpp`.
Kalanı `web/` (**138'i yalnız `?v`**), `deploy.sh`, manifest ve `GECE7/`.

| değişmez | blob `F5E-oncesi` → `HEAD` | hüküm |
|---|---|---|
| `contract/hedef-kosu-taban.json` | `cf2af8c7…` → `cf2af8c7…` | **AYNI** |
| `vision/eval/labels-hakem.json` (K19) | `c21964a8…` → `c21964a8…` | **AYNI** |
| `engine/tests/hedef_kosu.mjs` | `7e3683a9…` → `7e3683a9…` | **AYNI** |
| `engine/tests/expressability_check.mjs` (K31) | `04c61f03…` → `04c61f03…` | **AYNI** |
| `KOSU-v7.md` (K26) | `158da859…` → `158da859…` | **AYNI** |
| `flat_pattern_agree_check.mjs` (K23) | `05384380…` → `05384380…` | **AYNI** |
| `flat_expresses_spec_check.mjs` (K17) · `vocab_reference_check.sh` + tabanı | değişmedi | **AYNI** |
| `rotate_check.mjs` · `split_check.mjs` (K36/K43) | değişmedi | **AYNI** |
| `vision/eval/labels.json` | `66454a54…` → `66454a54…` | **AYNI** |

- 🚨 **`op.attach` ve YENİ OPERATÖR: YOK.** `git diff | grep '^\+.*op\.(attach|derive|extend|gather|overlay)'` → **sıfır satır.** `expressability_check` **MOTORDA 3** basıyor.
- 🚨 **`patterns_real/` PUSHLANMADI:** takipli **41 → 41 → 41** (`F5E-oncesi` · `HEAD` · `origin/main` üçü de 41). Diskteki `BUGRA-DEFTER.md` · `geometry/` · `tools/bugra-geometry-*.json` **takipsiz kaldı.**
- **Holdout HARCANMADI:** `11` `12` `30` `35` **dördü de** el değmemiş.
- `splitPanel()`'e kesir **yok**, `suppressPanel()`'e açı **yok**, R0/SP9/SP10/SP11 **sökülmedi**, `op_fixture` **silinmedi**, `guard.json`'a **dokunulmadı**.
- *"Sınırsız"* (K45) ve *"prenses dikişi"* (K42) **hiçbir yüzeyde geçmiyor**.
- **`?v` bump'ı canlıya ne gönderdi:** `pages.yml:23 branches:[main]` yüzünden `HEAD == origin/main` canlıdır → **`?v=137` + İŞ 2'nin iki-yüzeyli operatör paneli** (`create.js` 27 satır · `engine.js` 14 · `app.css` 4). **Gerçek tarayıcıda HİÇ TIKLANMADI — on birinci faz, DOĞRULANMADI.**

---

## 8. CIRCIR — hakemin kendi `hedef_kosu` koşusu. Her sayıda `n`.

| sayı | taban (F5-D) | **F5-E (hakem ölçtü)** | hüküm |
|---|---|---|---|
| H1 | 5/5 · 10/10 | **5/5 (n=5) · 10/10 (n=10)** | aynı |
| H2 | %95.2 · %93 | **%95.2 (40/42) · %93 (66/71)** | aynı |
| H3 | 2 · 2 | **2 · 2** | aynı |
| **H4** | **ÖLÇEMEDİM** | 🚨 **ÖLÇEMEDİM — ON BİRİNCİ FAZ** | **uydurulmadı** |
| **H5** | **0/5** — payda **5** | 🚨 **0/5 — payda 5 → 5** (n=5 ve n=10) | **KAZANIM YAZILMADI** · payda **TAVAN**, K53 |
| **H6** | **ÖLÇEMEDİM** | **ÖLÇEMEDİM** — *"manken çapası bu koşuya bağlanmadı"* | 🔜 **F4'ün hanesi** |
| **H8-sözlük** | 31 · 61 | **31 (26+5) · 61 (51+10)** | daraltılmadı |
| **H8-ifade** | **3/5** | **3/5** (n=5) | **kötüleşmedi** |
| H10 | %58.3 · %64.4 | **%58.3 (70/120) · %64.4 (154/239)** | aynı |
| **H10a** | %17.5 · %29.7 | **%17.5 · %29.7** | **yükseltilmedi** (K21) |
| **H10b** | **%40.0 · %33.1** | **%40.0 (48/120) · %33.1 (79/239)** | **§0B tavanı KIMILDAMADI** |
| H10e | 3 · 5 | **3 · 5** | aynı |
| H10x | %0.8 · %1.7 | **%0.8 · %1.7** | aynı |
| **H11** | 3.2 ms | **3.0 ms (n=5) · 2.0 ms (n=10)**, en kötü **35.1 ms** | tavanın (10 sn) çok altında |

▸ **H10a + H10b + H10x = H10 TUTUYOR:** 17.5+40.0+0.8 = **58.3** ✅ · 29.7+33.1+1.7 = **64.5 ≈ 64.4** (paylar 71+79+4 = 154/239 ✅).
▸ **İki `n` TEK TABLODA HARMANLANMADI.** **Hiçbir sayı kötüleşmedi.**

---

## 9. SAPMA SORUSU — hakemin cevabı

> *"Bir yabancı fotoğraf yükleyip kalıp + flat indirebiliyor muyum, ve inen nesne
> motordaki operatörlerden gerçekten etkileniyor mu?"*

**KALIP + FLAT: EVET.** H1 **5/5 · 10/10**, medyan **3.0 ms**, `indir_check`
**EXIT 0**, `KOKEN_ALANLARI` **38**.

**İNEN NESNE OPERATÖRDEN ETKİLENİYOR MU: HAYIR — ve hakem bunu kaynaktan
doğruladı, ajanın sözünden değil.** `planops.cpp:381` planı **değerle** alıyor;
program sevk edilen planın **kopyası** üstünde koşuyor. `golden_check` **Passed**,
`engine_check` **Passed**. Bu bir kusur değil **RULES 4'ün kendisidir** (opt-in,
default OFF) — ama **ürün cümlesi hâlâ kurulamıyor**, ve F5 bu yüzden **duruyor.**

**Bugün kullanıcının kazandığı gerçek şey ölçülebilir ve küçük:** üç operatörün
üçü de tarayıcıdan **ulaşılabilir** (2/26 → ayrıca **30/10**), yani *"pens
açtıramıyor, döndüremiyor"* **bitti**. Ama açtırdığı pens **indirdiği dosyaya
girmiyor.**

---

## 10. HÜKÜM VE SIRA

✅ **GEÇTİ** — `F5E-yesil` atıldı. Gerekçe:
1. **İŞ 0 (ZORUNLU) kapandı** ve hakem HM-J2'yi **basamak basamak** tekrarladı.
2. **İŞ 2 kapandı** (borç 68), **borç 63 ilk kez ölçüldü**.
3. **İŞ 3 kapandı** ve **hiçbir kartın bildirmediği bir yedinci kırmızı** (borç 71 — reponun kendi sevk betiği kendi kapısından geçemiyordu) **kökten** kapatıldı.
4. **Tek şart tutmadı — ama TATMİN EDİLEMEZDİ** (K53). Kart bunu **YOL (c)** diye adlandırıp *"başarısızlık değildir"* demiş ve **üç sayı** istemişti; üçü de verildi.
5. **Sıfır mühür kırıldı, sıfır kapı gevşedi, sıfır kapsam taşması, holdout harcanmadı, `patterns_real/` pushlanmadı.**
6. Ajan **15 kalemi kendi aleyhine** yazdı; hakem hepsini denetledi, **biri hariç** (payda 5→10, K53) doğru çıktı.

⛔ **VE AYNI HÜKÜMDE: F5 DURUYOR. HALKA 3 F4'TEN AÇILIYOR** (**K54**).
K48'in iki turluk tavanı **bir turda** harcandı; gerekçe **üç ölçüm**:
**(1)** payda motordan büyütülemez (K53) · **(2)** iki nesnenin arasında
**yayınlanmış harita yok** (K52) · **(3)** K23'ün **28.7714 mm**'si — motorun
kendi strain bütçesinin **7.6 katı** — F4'te duruyor.
K48 md.3 bu hâli kendi metninde öngörmüştü: *"blokör bir operatör değil **F4'ün
geometri işidir**."* İkinci turu koşturmak, **sonucu bilinen** bir turu
koşturmak olurdu (§0).

▸ Motorda **3** operatör; kuyruktaki **5** ad (`attach` · `derive` · `extend` ·
  `gather` · `overlay`) **adlarıyla bekliyor.** `op.attach` **iptal değil, ertelendi.**
▸ **Sıradaki kart: `GECE7/F4.md`.** Halka 3 = **F4 → F6 → F7 → F8 → F9.**

---

## 11. §5.5 DÖKÜM — sorulmadı ama görüldü / görülemedi

**Yeni borç:**

72. 🚨 **`validator.cpp`'nin `cutline` kuralı hiçbir mutasyonla korunmuyor.** Kural `if (false)` yapıldı, ikili kımıldadı, `engine_check`+`guide_check`+`cuttable_output_check` **üçü de yeşil**. Köprünün 140400 ihlalinin yarısını üreten kural, **silinse kimse görmez**. ⚠ tam süit altında **DENENMEDİ**.
73. 🚨 **H5 ön ve arka kol oyuğunu TEK sayıya topluyor** (`hedef_kosu.mjs:267`). Ön **+20 mm**, arka **−20 mm** olan bir giysi H5'te **KUSURSUZ** okunur — gerçek bir dikilebilirlik körlüğü. Paydayı büyütmenin **doğru** yolu budur ve bir **gevşetme değil sertleştirmedir**; ama F5'in değil **F4/F6'nın** hanesinde. **Kapı bu turda DEĞİŞTİRİLMEDİ.**
74. **`deploy.sh`'in yeni `exit 4` kolu ÖLÜ KOD:** `--accept` her yolu yeniden mühürlediği için ardından koşan kontrol **her zaman** yeşil olur. Bugün zararsız; **borç 71 KAPANMADI, DARALDI.**

**Kapanan borç:**

- **66 / K49** — hakem kendi eliyle doğruladı.
- **68** — üç operatör de tarayıcıdan ulaşılabilir.
- **69 → K55: SAPMA HİÇ YOKTU.** `grep -c add_test(NAME` **128** sayıyor çünkü `engine/CMakeLists.txt:1036` bir **YORUM SATIRI** ve içinde `add_test(NAME …)` metni geçiyor. Gerçek `add_test` **127**, `ctest` **127**, adlar `comm -23` ile **birebir** örtüşüyor, yinelenen ad **yok**. **Kayıp kapı YOKTU. Borç 69 SİLİNDİ.**

**Kendi aleyhime / hâlâ açık:**

1. **Gerçek tarayıcıda HİÇ TIKLANMADI** — on birinci faz. İŞ 2'nin iki-yüzeyli paneli **canlıda** (`?v=137` pushlandı) ama **ekranda görülmedi**. **DOĞRULANMADI.**
2. **H4 · H6 · H9 ÖLÇEMEDİM.** H6 **F4'ün hanesi** ve F4 açılıyor; H4 **on birinci fazdır** açık.
3. **`op_program_check` hâlâ YALNIZ `EU38`** (`op_program_check.mjs:84`, sabit dize) — **sekiz bedenin yedisi** OP8 dahil koşulmuyor. **Borç 65 AÇIK.**
4. **OP8 `sevk_edilen` okumasında HİÇBİR ŞEY ölçmüyor** — o yüzeyde uygulanan `op.rotate` **0** (koni). Sevk edilen giysinin transfer rijitliği bugün de **kapısız**.
5. **Miras 6 kırmızının 4'ünün kök sebebi aranmadı** (bu kartın işi değildi). `contract_check` Damla'nın kendi kararından kırmızı.
6. **borç 67** (`strainPolish` ×0.45 → ağın tamamı yeşil) bu turda da **DOĞRULANMADI**, denenmedi.
7. **borç 39 · 40 · 41 · 42 · 44→54 · 46 · 52 · 55 · 57 · 58 · 60 · 63 · 64 · 65 · 70** devrediyor. **41 (K33)** bu turda da **tetiklenmedi** (`realpath == pwd`).
8. **borç 51 ve 62** (H5 paydası · ürün yolu iki nesne) **kapanmadı** — **F4'e taşındı** (K52/K53/K54).
9. **`conftest.py` hiçbir mutasyonla korunmuyor** · `download.js`'teki `kokenKaydi = null` arka kapısı · `pages.yml:23 branches:[main]` = **her push canlıya** (damga bumplandı, **kapı kapanmadı**) · `patterns_real/` **PUBLIC** (K10, Damla kararı).
10. **`op_fixture` süitin en pahalı kalemi** ve bu turda da **denetlenmedi** (borç 58). OP8 fikstür okumadığı için bayat-fikstür tuzağına düşülmedi.
11. **rabadon borç 61 SEKİZİNCİ oturum:** `ctest-tail-hides-verdict` hakemin turunda **üç kez** yanlış ateşledi (biri geri alınmış prob logunun bayat kırmızısı, biri `golden_check.sh`'in **kaynak metni**, biri **doğru** kapanış koşumunun altı miras kırmızısı) ve **üçü de `rabadon wrong` ile kaydedildi**. Bir kez **doğru** ateşledi (`ctest -N | tail -1`). `guard.json`'a **DOKUNULMADI**.
12. **Süre:** süit **733.19 s**, K48'in ~840 s tahmininin altında; push kapısı **900 s** zaten miras kırmızılardan geçilemiyor (K37). **Maliyet, duvar değil.**
