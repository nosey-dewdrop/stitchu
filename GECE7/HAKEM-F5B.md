# HAKEM — F5-B (`op.suppress`) · **GEÇTİ**

> **HÜKÜM: GEÇTİ.** `op.suppress` motorda gerçek bir operatördür — açısı bir
> sabitten değil panelin **kendi ölçülen develop-deficit'inden** düşüyor, sevk
> edilen giysinin cevabı bir **RET** ve o ret bir **sayıyla** kapılı; hakem
> kartın bütün kapılarını **sıfırdan temiz Release derlemesiyle kendi koşturdu**
> ve **6 failed out of 123**'ü, altı miras adı, yedinci adın yokluğunu birebir
> yeniden üretti. Hakemin kendi mutasyonu H8-ifadenin **PAY** tarafında gerçek
> bir §0B deliği buldu (K35) — **hakem kapattı**, ve kapanış temiz ağaçta
> **4/5'i kımıldatmadı.**

**Etiket:** `F5B-yesil`. Geri alma noktası `F5B-oncesi` korunuyor.
⚠ **F5 BİTMEDİ** (§3.12). Motorda **2** operatör var (`rotate`, `suppress`),
**13'ü kuyrukta** ve adlarıyla basılı. Sıradaki alt-kart **F5-C = `op.split`**.

---

## 0. NASIL ÖLÇTÜM — hükümden önce, koşum koşullarının künyesi

**Kartın en sert tuzağı K32'ydi** (kapılar kaynaktan yeniden üretilemiyor), o
yüzden hüküm bir tohumlama denetimiyle başladı:

* `engine/build` **tamamen silindi**, `-DCMAKE_BUILD_TYPE=Release` ile **sıfırdan**
  konfigüre ve derlendi (`CMakeCache.txt` → `CMAKE_BUILD_TYPE:STRING=Release`
  doğrulandı; `engine_check` **20.07 sec**, yani 2684s tuzağına düşülmedi).
* K32'nin üç tohumu **diskte doğrulandı**: `engine/dist/` (3 dosya) ·
  `engine/pattern-bridge/.venv` · `patterns_real/geometry/`. **Tohumlamadan hüküm
  verilmedi.**
* **K33 kapalı:** checkout sembolik linkli **değil** (`realpath == pwd`), yani
  `figure-lint.mjs`'in sessiz-yeşil yolu bu turda tetiklenmiyor. `/tmp` altında
  ölçülmedi.
* **rabadon iki kez yanlış pozitif verdi** (`ctest-tail-hides-verdict` bir
  `git diff --stat … | tail -2` üstünde, ve `red-base` miras 6 kırmızı üstünde).
  **`guard.json`'a DOKUNULMADI**, hiçbir stitchu kapısı gevşetilmedi; ikisi de
  `rabadon wrong <kural> "…"` ile **deftere kaydedildi.**

---

## 1. KAPILAR — hepsini hakem koşturdu, hiçbiri ajandan alınmadı

`ctest` **son satırı, KOPYALANDI (özetlenmedi)**:

```
95% tests passed, 6 tests failed out of 123

Total Test time (real) = 1080.09 sec

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

**Yedinci ad YOK.** Altı ad **tam olarak miras altı**. `108 - h10_gate_check`
DISABLED ve öyle kaldı (**K18 korundu**).

▸ **`123` sayısı doğrudur ve kartın "122 → 123"ü tutarlıdır.** Kayıtlı test
**124**'e çıktı (`suppress_check` **tek** yeni `add_test`, `CMakeLists` diff'iyle
doğrulandı); `ctest`in "out of" satırı **DISABLED olanı düşüyor** — F5-A hakeminin
kurduğu okuma (123 kayıtlı → 122). Aynı okuma altında **124 kayıtlı → 123**.
**Kırmızı sayısı büyümedi.**

| kapı | hakemin ölçtüğü | hüküm |
|---|---|---|
| `ctest` (temiz Release, sıfırdan) | **6 failed / 123**, 1080.09 sec | ✅ miras altı, yedinci yok |
| `vocab_reference_check` | **HUKUM: YESIL**, bugün **10310**, taban **10438** (delta −128) | ✅ taban kesilmedi |
| `python3 -m pytest -q` | **33 passed** in 0.64s | ✅ |
| `indir_check` | **EXIT 0**, `KOKEN_ALANLARI` **38** (taban 38) | ✅ K13 tutuyor |
| `hedef_kosu` | **EXIT 0**, **CIRCIR SAĞLAM** | ✅ |
| `tek_nesne_check` | **EXIT 0**, K6 doğruluk kolu **14/14** ölçü | ✅ İŞ 0b kapandı |
| `rotate_check` | **EXIT 0**, **391.34 sec** | ✅ İŞ 0a kapandı |
| `suppress_check` | **EXIT 0**, **375.74 sec**, `ctest` #12 | ✅ İŞ 1 kapandı |
| `expressability_check` | **EXIT 0**, H8-İFADE **4/5**, **MOTORDA 2** | ✅ payda mühürlü |

---

## 2. AJANIN KENDİ BİLDİRDİĞİ ÜÇ ŞEY — üçü de ölçüldü, **ikisinin çerçevesi düzeltildi**

### 2.1 🚨 Süit süresi / 900s push kapısı → **F5-B BİR KAPIYI KIRMADI** (K37)

Hakeme sorulan öncül şuydu: *"süit 1085s, push kapısı 900s → kapı artık
geçilemez → alt-kart kapanmamalı."* **Ölçüldü, ÖNCÜL YANLIŞ.**

`.rabadon/guard.json` → `pushGate.run` beş testi dışlıyor, ama **miras 6
kırmızının 3'ü o listede değil** ve kapının kapsamında kalıyor
(`flat_pattern_agree_check` · `flat_artifact_census` · `sizechart_source_check`).
`pushGate.testPassPattern` `100% tests passed, 0 tests failed` arıyor — üç
kırmızı kapsamda durdukça bu satır **süre sıfır olsa bile basılamaz.**

Ve pratikte: `git reflog show origin/main` son beş girdinin beşi `update by push`,
`HEAD == origin/main`. **Push'lar düşmüyor, kapı fiilen bağlayıcı değil.**

→ **Kapı F5-B'den ÖNCE de geçilemezdi ve kırılan şey miras.** "Alt-kart bir
kapıyı fiilen kırdı" gerekçesiyle **GERİ AL verilmez.**

**Ama maliyet gerçek** ve hakem kendi koşusunda doğruladı: `rotate_check`
**4.78s → 391.34s (82×)**, `suppress_check` **375.74s**; ikisi **767.08 sn** =
süitin **%71'i**. **Borç 43 açık, F5-C'nin ZORUNLU İŞ 0'ı.**

### 2.2 Tek kama · `maxDartDeg` tavanının dört katı → **rapor, kapı değil** (K38)

55.1735°'lik tek kama, motorun kendi `maxDartDeg = 14` ilanının **dört katı**, ve
motorun kendi `dartColumnsFromDeficitRows`'u yükü **birkaç pense** bölerken
operatör **bölmüyor**. §4B/§4C'ye ve §0B'ye çarpıyor mu diye soruldu:
**§0B'ye çarpmıyor** — H10b (§0B tavanının bağlı olduğu sayı) **%40.0'da
kımıldamadı** ve hiçbir cırcır sayısı bu kamadan beslenmiyor.

Tek kamaya bugün tavan **konmadı**, ve gerekçe §3.10: 14° motorun **çok-pensli**
yerleşimine ait bir sayıdır, tek kamaya uygulanacağının **yayınlanmış dayanağı
görülmedi**, ve 55.17'ye uyacak bir tavan seçmek eşiği **bugünkü sayıya
uydurmak** olurdu (K29 emsali). **Borç 44 → F5-C'de `op.split` ile karara
bağlanacak.**

### 2.3 H8-ifade düşüşü künyesiz bir kaleme dayanıyor → **sayı durur, "kazanım" denmez** (K39)

Soru bana bırakılmıştı: *künyesiz bir kaleme dayanan kazanım §3.10'a göre kazanım
mıdır?* **Cevabım üç parçalı ve ortadan bölmüyor:**

Düşüşün tamamı `freesewing-bella`'dan geliyor ve o, paydanın **DOĞRULANMADI** iki
satırından biri. **Ama sayıyı silmek bilgi atmaktır.** Ölçüm gerçek, payda
mühürlü ve tam, `TABAN_PAYDA`'ya **tek bayt yazılmadı** (hakem `git diff` ile
doğruladı), ve **operatörün kendisi bağımsız olarak kapılı** — `suppress_check`'in
beş kolu `freesewing-bella`'dan hiçbir şey okumuyor. Yani **operatörün
gerçekliği bu künyeye HİÇ bağlı değil**; bağlı olan yalnız 4/5 rakamı.

→ **H8-İFADE = 4/5 durur, ama "KÜNYESİZ DAYANAK" damgası taşır**: dışarıya
(post/pitch/site) bir kazanım olarak **söylenmez**, F5-C'de cırcır dayanağı
olarak **kullanılmaz**. Künye **F5-C'nin İŞ 0'ı**; bulunamazsa **"KÜNYE
BULUNAMADI"** yazılır ve satır **paydada KALIR** (payda daraltılmaz).

**Ve hüküm buna asılmıyor:** kart 4/5'i bir kapı yapmamıştı (*"Olmuyorsa sebebi
yazılır, sayı zorlanmaz"*). Faz kapısı **`expressability_check` EXIT 0 + payda el
değmemiş**ti; ikisi de tutuyor.

---

## 3. AJANIN İDDİALARI — ölçüldü, güvenilmedi

**4. `suppressPanel()` açı parametresi almıyor — DOĞRU, kaynaktan doğrulandı.**
`dartsuppress.hpp:114` imzası: `suppressPanel(const SurfacePanel&, std::size_t,
double apexDepthMM, Vec2)` — **açı argümanı YOK.** Açı `panel.developDeficitDeg`.
Alt seviye `suppressWedge(... double wedgeDeg ...)` bir **primitiftir ve operatör
değildir**, dosyanın kendi başlığı bunu yazıyor.
Sevk edilen giyside **RET** doğrulandı (`suppress_check` S1 kolu, EXIT 0):
`left_ftorso` **−1.9628°**, `left_btorso` **−0.1116°**, eşik **0.5°**.
Vücudu izleyende **55.1735° / 56.6688°**.

> **Buğra 41.48° ile yan yana: TUTMUYOR (+13.6935 / +15.1888), ve AYARLANMADI.**
> **Sorulan soru: dürüstlük mü, işin yarısı mı? — DÜRÜSTLÜK, ve ayar yapmak
> KUSUR olurdu.** 41.48 **başka bir gövdedeki başka bir giysinin** sayısıdır
> (`flatten-research/16`, gerçek Buğra Locket: düğmeli, yakalı, puf kollu bir
> ÜST). Bugün ölçülen, `stitchu`nun kendi `SheathOptions` gövdesinin
> `left_ftorso`'sudur. **Farklı yüzeylerin develop-deficit'lerinin eşit çıkması
> için hiçbir sebep yok**, ve onları eşitleyecek bir kadran çevirmek §3.10'un
> tam olarak yasakladığı şeydir. Ajan sayıyı **bastı**, farkı **ilan etti**,
> hiçbir kola eşitlemedi — ve `rotate-op.cpp`'de 41.48 artık **hiçbir şeyin
> okumadığı** bir rapor satırı (`grep` ile doğrulandı: tek tüketicisi `printf`).
> **İşin yarısı olan şey, ayarlanmış bir sayı olurdu.**

**5. `rotate`'in pensi artık fikstür değil — DOĞRU.** `rotate_check` R0 kolu iki
**AYRI ARACIN** çıktısını kıyaslıyor (`rotate-op` ↔ `suppress-op`, aynı panel).
Bu bir **gevşetme değil bağlamadır** ve ajan onu §3.8 md.4 uyarınca **hakeme
getirdi** — **onaylandı, K36**, önceki/sonraki sayı yan yana yazıldı.

**6. İŞ 0a ve İŞ 0b — ikisi de KAPANDI.**
*0a:* `kApexFracOfPanel = 0.80` **silindi** (`git show F5B-oncesi` ile önce/sonra
doğrulandı); apeks `plan.opt.bodiceApexFrac`'tan **okunuyor**; iki-koşu oranı
**0.750000000**. *0b:* `shell-audit` **14 yayınlanan ölçünün 14'ünü** kiriş
toplamıyla yeniden hesaplıyor, **en kötü uyuşmazlık 0.000129mm** (arka
`body_length`) — hakem kendi koşusunda **kalem kalem** gördü.

**7. Mutasyonlar — 9 kırmızı, M7 yeşil, sebebi ajan yazdı.** M7'nin yanlış
tasarlandığı **doğru teşhis** (kırpma negatifi sıfıra çevirir, pozitife değil;
toplam 0.0000 < eşik 0.5, ret devam eder) ve yerine işareti gerçekten çeviren
**M7b kırmızı yanıyor**. `ikili` sütununun üç shasum'ın birleşimi olduğu logun
**içinde** yazılı — hakemin F5-A notu **uygulanmış**.

> ⚠ **BİR DÜZELTME (§3.8 md.3):** ajanın tablosu **M1'i (`surfacepattern.hpp`)
> ve M7/M7b'yi (`surfacepattern.cpp`) "(yazmadım)" diye işaretliyor. ÖLÇÜLDÜ,
> YANLIŞ** — ajan bu kartta ikisine de yazdı (**+28** ve **+33/−10**, `git
> numstat`). **Gerçekten dokunulmamış** dosyalardaki mutasyonlar: **M3 · M4**
> (`shellprojection.cpp`) ve **M9** (`expressability_check.mjs`) = **üç mutasyon,
> İKİ dosya.** §3.8 md.3'ün **sayısı (en az üç) tutuyor**, ajanın **etiketlemesi**
> yanlış. Hüküm buna asılmıyor ama **kayda geçiyor**, ve F5-C'de yayılım **üç
> AYRI dokunulmamış DOSYA** olacak.

**8. Yedinci kırmızı iki kez doğdu, ikisi de KÖKTEN kapandı — `git diff` ile
doğrulandı.**
*(a) `preset_resolve_check`:* ürün sözlüğündeki **üç künyesiz pens açısı
SİLİNDİ** (`shaping.dart` 18° ve 12°, `skirtStyle.straight` 10°) ve
**`preset_resolve_check`'e tek bayt yazılmadı** (numstat **0**). Parametreyi geri
koymak operatörü yalancı yapardı; **kadranlar gitti.** Kök sebep.
*(b) `bundle_fresh_check`:* wasm yeniden derlendi ve hakemin **sıfırdan temiz
derlemesinde 0.15 sec'te PASSED** — yani sevk edilen motor artık bu repodaki
motor. **Gevşetme yok.**

**9–10. Sayılar birebir tutuyor** (aşağıdaki cırcır tablosu hakemin kendi
`hedef_kosu` koşusundan).

**11. Kapsam — alt-kart dışına TAŞMADI.** `git diff --stat F5B-oncesi..HEAD`
**21 dosya**, hepsi kartın konusunda. Ve:

* **`patterns_real/` PUSHLANMADI** — takipli dosya sayısı **41 → 41**, diff
  **boş**; üç kalem **takipsiz** duruyor (K10). *(Sorulmuştu: "pushlandıysa
  derhal bildir" → **PUSHLANMADI.**)*
* **Taban blob `cf2af8c7d3c4603eee5aea252f3568feedda8d10`** — HEAD ve
  `F5B-oncesi`'nde **birebir aynı**.
* **`vision/eval/` (K19 cevap anahtarı mührü) · `KOSU-v7.md` (K26) ·
  `expressability_check.mjs`'in `TABAN_PAYDA`'sı (K31) · `vocab_reference_check.sh`
  + baseline (K2/K11/K12) · `flat_expresses_spec_check.mjs` (K17) ·
  `flat_pattern_agree_check` (K23)** — **hepsinde değişen dosya sayısı 0.**
* **Holdout `11` `12` `30` `35` HARCANMADI** — ölçüm seti dosyalarında değişiklik
  **0**; `labels-hakem-BOS.json`'ın 27 anahtarı **metadata şablonudur**, etiket
  hücreleri **boş** ve dosyaya F5-B **hiç dokunmadı** (K14 tutuyor).
* **Diğer operatörlere GİRİLMEDİ:** `expressability_check` **"MOTORDA 2"**
  basıyor (`op.suppress`, `op.rotate`) — başka hiçbir `op.*` `motorda_kapi`
  almadı.

---

## 4. HAKEMİN KENDİ MUTASYONLARI — biri gerçek bir delik buldu

Log: **`GECE7/log/f5b.mutasyon.txt`** (hakem bölümü, sonda).

### 🚨 HM-A — H8-İFADE'nin **PAY** tarafı delikti. **HAKEM KAPATTI (K35).**

Ajanın M8'i yalnız **OLMAYAN** bir kapı adını deniyordu. Denenmeyen,
**VAR OLAN bir kapının adını ÖDÜNÇ ALMAKTI.** `op.split`'in `motorda_kapi`'si
`"geometry"` yapıldı (ctest'te kayıtlı, `op.split` ile ilgisi yok):

| | önce | sonra (K35) |
|---|---|---|
| kapı | **EXIT 0 (YEŞİL)** | **EXIT 1 (KIRMIZI)** |
| ilan | "MOTORDA **3**" | ihlal basılır |
| **H8-İFADE** | **3 / 5** ← motora **tek satır kod yazmadan** | **4 / 5** (kımıldamaz) |

Bu, F5-A hakeminin **PAYDA**'da bulduğu deliğin (K31) **PAY** tarafındaki tam
eşleniği. Kapatma kuralı **uydurulmadı, motordaki iki operatörden okundu**
(`op.X → X_check`; ikisi de zaten böyle yazıyor).
**Doğrulandı:** temiz ağaç **EXIT 0, 4/5 değişmedi** · HM-A **EXIT 1** · ajanın
**M8'i hâlâ EXIT 1** (hiçbir kol gevşemedi).

### HM-B — ajanın **ilan ettiği kör nokta ÇOK KÖTÜMSER ÇIKTI** (ajanın lehine)

Kart K29 üslubuyla *"`GarmentSurf::at()` iki yolun da altında; yüzey yanlışsa iki
okuma birlikte yanlış olur ve K6 kolu göremez"* diyordu. **Sınandı:** `at()`
yüzeyi %5 büyütecek şekilde bozuldu (ajanın **yazmadığı** kod yolu).

**Ölçülen: `tek_nesne_check` EXIT 1 — 14 ölçünün 10'u KIRMIZI.**
Örnek: `hem_circumference` yayınlanan **1295.6000mm**, ikinci yoldan
**1360.3800mm**, Δ **64.7800mm**.

Sebep: yayınlanan sayı **Gauss-Legendre + Steiner kimliği + kapalı formdan**
geliyor ve bunların hepsi `at()`'ten geçmiyor; denetim yolu (`at()`'in kiriş
toplamı) geçiyor. **İki yol ayrışıyor, kol GÖRÜYOR.** → **K6, ilan edildiğinden
GÜÇLÜ.** Geri alındı, yeniden derlendi, **EXIT 0**, ağaç temiz.

---

## 5. CIRCIR — hakemin kendi `hedef_kosu` koşusu. **CIRCIR SAĞLAM.**

| sayı | taban | F5-B sonrası (hakem ölçtü) | hüküm |
|---|---|---|---|
| H1 | 10/10 (n=10) | **5/5 (n=5) · 10/10 (n=10)** | tavan (K25) |
| H2 | %95.2 (40/42, n=5) | **%95.2 (40/42)** | aynı |
| H3 | 2 | **2** | aynı |
| **H4** | **ÖLÇEMEDİM** | **ÖLÇEMEDİM** | uydurulmadı ✅ |
| **H5** | 0 / **5** çift | **0 / 5** | payda büyümedi → **kazanım YAZILMADI** ✅ |
| **H8-sözlük** | **31** (26+5) n=5 · **61** n=10 | **31 · 61** | kötüleşmedi, sözlük **daraltılmadı** |
| **H8-ifade** | **5 / 5**, payda MÜHÜRLÜ | **4 / 5**, payda **mühürlü ve TAM** | **DÜŞTÜ** — ama **K39 damgalı** |
| H10 | %58.3 | **%58.3** | aynı |
| H10a | %17.5 | **%17.5** | cırcıra bağlı değil (K21), **yükseltilmedi** ✅ |
| **H10b** | **%40.0 (48/120)** | **%40.0 (48/120)** | **§0B tavanı KIMILDAMADI** |
| H10e | 3 (n=5) · 5 (n=10) | **3 · 5** | aynı |
| H10x | %0.8 | **%0.8** | aynı |
| H11 | 3.1–4.0 ms | **3.2 ms** medyan (en kötü 32.5) | tavanın çok altında |

**HEDEF SETİ (n=10), harmanlanmadı:** H1 **10/10** · H2 %93 (66/71) · H3 2 ·
H5 0/5 · H8-sözlük **61** · H10 %64.4 · H10a %29.7 · H10b %33.1 · H10e 5 ·
H10x %1.7 · H11 2.2 ms.

**§0B tavanı denetlendi:** H10b **yükselmedi**, o yüzden "H10b yükselirken H2
yükselmiyorsa faz kapanmaz" şartı **tetiklenmiyor**. **H4/H5 kazanımı iddia
edilmedi** ve F5-B kartı ikisini de şart yapmamıştı.

---

## 6. SAPMA SORUSU — cevabı ölçüldü, ve **ikinci yarısı hâlâ HAYIR**

> *"Bir yabancı fotoğraf yükleyip kalıp + flat indirebiliyor muyum, ve gerçek bir
> giysiden `suppress` gerektiren bir kalemi operatör programına çevirebiliyor
> muyum?"*

**Birinci yarı — EVET, ölçüldü.** `hedef_kosu` **H1 = 10/10** (n=10): on girdinin
onu da kalıp+flat üretti. `indir_check` **EXIT 0**, `KOKEN_ALANLARI` **38**.

**İkinci yarı — KISMEN, ve sınırı bir SAYI söylüyor.** `freesewing-bella`
(`{op.suppress, op.rotate}`) artık **ÇEVRİLEBİLİR** — ama künyesi
**DOĞRULANMADI** (K39). **Motorun KENDİ sevk ettiği giyside operatör
REDDEDİYOR** (−1.9628°), ve bu **bir altyapı mazereti değil bir ölçüm**:
`skimBodice` gövdeyi **koniye** çeviriyor, koni birebir açılıyor, bastırılacak
şey **yok**. **K28 kapanmadı, bir sayıya bağlandı** (borç 46).

⚠ Ve **borç 45 duruyor:** `suppress` `draftJSON`/web hattına **bağlı değil** —
kullanıcı bir pens açtıramıyor. Bu kartın kapattığı şey **operatörün
gerçekliği**, **ürün yolu değil.** Fark F5-A'ya göre gerçek ama dar: operatör
ürünün **sözleşmesine** değdi (üç künyesiz kadran silindi), **geometrisine
değmedi.**

---

## 7. NEDEN GEÇTİ — ve neyin karşılığında geçmedi

**GEÇTİ, çünkü kartın üç parçalı kapanış şartının üçü de bağımsız olarak
doğrulandı:** kendi dosyası + kendi kapısı (`suppress_check`, `ctest` #12, beş
esaslı kol) · pens **bir sayıdan düşüyor** (imzada açı parametresi **yok**,
M5 onu sabite çevirince **kırmızı**) · `rotate`'in girdisi **fikstür olmaktan
çıktı** (R0 iki aracın çapraz ölçümü). Üstüne İŞ 0a ve İŞ 0b kapandı, iki
yedinci-kırmızı **kökten** kapandı, ve **her mühür tutuyor**.

**Ve bir şeyin karşılığında geçmedi:** cırcırın hiçbir sayısı kötüleşmedi,
hiçbir eşik gevşetilmedi, payda daraltılmadı, `patterns_real/` pushlanmadı,
holdout harcanmadı, H4/H5'te **uydurulmuş kazanım yok**.

**Bu kartın en güçlü yanı bir sayı değil, bir RET:** ajan sevk edilen giysinin
cevabının **"hayır"** olduğunu ölçtü, gizlemedi, ve **kendi kartının dayanağını
zayıflatan** o sayıyı öne çıkardı. **41.48'e ayar yapmayı reddetmesi** aynı
davranış. Hükmü güçlendiren budur — F5-A'da olduğu gibi.

**Hakemin bulduğu tek gerçek delik (K35) kapatıldı ve kapanış 4/5'i
kımıldatmadı**, yani düşen sayı **deliğin ürünü değildi.**

---

## 8. BORÇ — devreden 42 + F5-B'nin ekledikleri + hakem turu

**43.** 🚨 **İKİ KAPI 767.08 SANİYE YİYOR** (hakem ölçtü: `rotate_check` 4.78s →
**391.34s**, `suppress_check` **375.74s**; süit **1080.09s**). Operatör başına
bir kapı daha = süit 1500s+. **F5-C'nin ZORUNLU İŞ 0'ı** (K37).
**44.** **Tek kama, `maxDartDeg = 14`'ün dört katı** (55.1735°). Yerleşim/bölme
`op.split`'in konusu → **F5-C'de karara bağlanacak** (K38).
**45.** `suppress` **ürüne değmiyor** (`draftJSON`/web bağlı değil).
**46.** Sevk edilen giysinin pensi **yok** ve bu bir **ÜRÜN kararı**: ya sınıfın
adı düzeltilir, ya gövde `skimBodice`'ten çıkarılır (gerinim %0.0071–0.1501 →
%2.96–48.12). **Hakem de seçmedi** — F4'ün/Halka 3'ün konusu, **şimdi açılmıyor.**
**47.** *(hakem)* **§3.8 md.3 etiketlemesi yanlıştı**: M1/M7/M7b "yazmadım" diye
işaretlenmiş ama ajan o iki dosyaya yazmıştı. Sayı tuttu, **yayılım iki dosyaya
sıkıştı.** F5-C'de **üç AYRI dokunulmamış dosya** şartı.
**48.** *(hakem)* **`tek_nesne_check`'in K6 ÖZET SATIRI KOŞULSUZ BASILIYOR:**
HM-B altında 10 `FAIL`'in yanında *"ok K6 14 yayınlanan ölçü BAĞIMSIZ İKİNCİ
YOLDAN doğrulandı"* satırı **yine basıldı**. Exit kodu doğru (1), ama bir insan
loga bakarsa **yeşil bir cümle görüyor**. K33'ün *"hiçbir şey ölçmedim ≠ her şey
geçti"* dersinin küçük bir tekrarı. **Kozmetik ama F5-C'de düzeltilecek.**

**Devreden 42 aynen duruyor**, ve hakem turunda **ikisi bizzat doğrulandı**:
**md.39 (K32)** — tohumlama olmadan kapılar üretilemiyor, **doğru**;
**md.41 (K33)** — bu makinede tetiklenmiyor (symlink yok), **ama açık.**
**md.40 (K34)** wasm damgası ve **md.42** wasm↔native düğüm eşitliği
**HÂLÂ AÇIK ve DOĞRULANMADI** — hakem de koşturmadı.

Hâlâ açık ve silinemez: gerçek tarayıcıda **hiç tıklanmadı** (sekiz fazdır,
**DOĞRULANMADI**) · miras 6 kırmızının **4'ünün** kök sebebi aranmadı · inen 7
dosyanın **5'i sessiz** · `download.js`'teki `kokenKaydi = null` arka kapısı ·
**H4/H6/H9 ÖLÇEMEDİM** · H5 tek çiftten · `vocab_reference_check` bir **satır
sayacı** (K12) · **K17** kapı ölçüm verisini ürün spec'i sayıyor · `conftest.py`
**hiçbir mutasyonla korunmuyor** · `pages.yml:23` **main'e her push canlıya
çıkıyor** · `patterns_real/` **PUBLIC** (K10) · holdout **4 fotoğrafa** düştü ·
payda 5'in **2'si künyesiz** (K39) · borç md.30 ve md.31 açık.

---

## 9. HÜKÜM

**GEÇTİ.** `git tag F5B-yesil` atıldı ve pushlandı.
**F5 BİTMEDİ.** Sıradaki alt-kart: **`GECE7/F5C.md` — `op.split`**, dayanağı
**ölçülen sayı**: `expressability_check` kuyruğunda **`op.split` 4 giysi**,
`op.attach` 3.
