# HAKEM — F6 (KUMAŞ) · 2026-08-27

**Ağaç:** `main`. Faz öncesi `F6-oncesi` (`92013a0`) · ajan `e3adbc2`→`72a30ec`→`1f5287e`→`7866ff5`
· **hakem `5979c91`**. Geri alma: `git reset --hard F6-oncesi`.

---

# ✅ GEÇTİ

**Kartın sekiz şartının sekizi de hakem tarafından koşturuldu; yedisi tuttu,
biri (şart 7 — *"üç ÖLÇÜLEBİLİR farklı kalıp"*) ölçüm **iki** kalıp verdi, ve o
eksiğin sebebi **hakemin kendi kararıdır** (K62), ajanın işi değil.** K58'in
emsali birebir geçerli: **tatmin edilemez bir şart ajanın hanesine yazılmaz** —
bu koşuda üçüncü kez (K53 · K58 · **K62**).

---

## 1. KAPILARI HAKEM KENDİ KOŞTURDU (pristine Release, `realpath == pwd`)

`realpath` = `pwd` = `/Users/damummyphus/damla_projects_2026/stitchu` → **K33
tetiklenmedi, borç 41 yine AÇIK** (dokuzuncu faz).

| kapı | ajanın kapanışı | **HAKEMİN KOŞUSU (ajanın HEAD'i, `7866ff5`)** | **HAKEMİN KENDİ COMMIT'İ (`5979c91`)** |
|---|---|---|---|
| **`ctest` tam süit** | 5 failed out of 127 · 720.70 sn | **`96% tests passed, 5 tests failed out of 127`** · **721.94 sn** | **`96% tests passed, 5 tests failed out of 127`** · **741.00 sn** |
| miras kırmızı ADLARI | beş | `flat_artifact_census` · `style_check` · `sizechart_source_check` · `contract_check` · `figure_check` — **AYNI BEŞ, ALTINCI AD YOK** | **aynı beş** |
| DISABLED | 1 | **`112 - h10_gate_check` DISABLED** (K18) | 1 |
| `vocab_reference_check` | YESIL 10325/10438 | — | **`HUKUM: YESIL` 10326**/10438 (delta −112), 37 eksen + 92 kelime |
| `indir_check` | EXIT 0 · KÖKEN 39 | **EXIT 0 · `KOKEN_ALANLARI` 39** (taban 38 → **kazanım**) | EXIT 0 · 39 |
| `hedef_kosu` | EXIT 0 · CIRCIR SAĞLAM | **EXIT 0 · `CIRCIR SAĞLAM`** | **EXIT 0 · `CIRCIR SAĞLAM`** |
| `pytest` | 33 passed | **33 passed** | **33 passed** |
| `fabric_catalog_check` | 56 kontrol, 0 hata | 56 kontrol, 0 hata | **59 kontrol, 0 hata** (hakem LEG 1'i 7 → 10 bloğa sertleştirdi) |
| `guide_completeness_check` · `fabric_ease_check` · `flat_convention_check` · `expressability_check` · `flat_pattern_agree_check` · `tek_nesne_check` · `op_program_check` · `golden_check` | — | **hepsi EXIT 0** | hepsi EXIT 0 |

⚠ `ctest`in son satırı **kopyalandı, özetlenmedi.** Süre farkı (720.70 → 721.94 →
741.00 sn) **duvar saati gürültüsüdür**; `op_fixture` tek başına **366 sn**
(borç 58, kalıcı fikstür).

---

## 2. HANE — **H5'İN PAYI. TUTTU.**

| sayı | taban (F4 sonrası) | **HAKEMİN ÖLÇÜMÜ** |
|---|---|---|
| ⭐ **H5 — PAY** | 0 (n=5) · 0 (n=10) | **0 · 0** — ve **üç kumaşın üçünde de** (aşağıda ayrıca ölçüldü) |
| **H5 — PAYDA** | 5 · 5 | **5 · 5 — BÜYÜTÜLMEDİ** (K64) |
| **H6** | 0 / 16 flat (n=8 stil) | **0 / 16** |
| H1 | 5/5 · 10/10 | **5/5 · 10/10** |
| H2 | %95.2 (40/42) · %93 (66/71) | **%95.2 · %93** |
| H3 | 2 · 2 | **2 · 2** |
| **H4** | ÖLÇEMEDİM | 🚨 **ÖLÇEMEDİM — ON ÜÇÜNCÜ FAZ. UYDURULMADI.** |
| H8-sözlük | 31 · 61 | **31 · 61** — sözlük daraltılmadı |
| **H8-ifade** | 3/5, payda mühürlü | **3/5 — BEŞİNCİ karttır durdu** (payda adlı 5) |
| H10 | %58.3 · %64.4 | **%58.3 · %64.4** |
| **H10a** | %17.5 · %29.7 | **%17.5 · %29.7 — yükseltilmedi** (K21) |
| **H10b** | %40.0 · %33.1 | **%40.0 · %33.1 — §0B TAVANI KIMILDAMADI** |
| H10e | 3 · 5 | **3 · 5** |
| H10x | %0.8 · %1.7 | **%0.8 · %1.7** |
| H11 | 3.2 ms · 2.2 ms | **3.6 ms · 2.2 ms**, en kötü **34.1 ms** (10 sn tavanının çok altında) |

⚠ **H6'nın `n`'i 8 STİL**, H1..H11'inki **5/10 fotoğraf** — **harmanlanmadı.**
**`CIRCIR SAĞLAM` — hiçbir sayı kötüleşmedi.**

---

## 3. SAPMA SORUSU — **HAKEM İNEN DOSYAYI KENDİ İNDİRDİ VE BAYT BAYT ÖLÇTÜ**

Kart *"kumaş seçimi inen nesneyi gerçekten değiştiriyor mu?"* diyordu. Hakem
ajanın tablosuna güvenmedi: aynı spec'i (EU38, pensli + büzgülü etekli + düz
kollu elbise) **üç kumaşta** `engine/dist/stitchu-engine.js` üzerinden — yani
**cırcırın koştuğu ikili** (borç 80) — sürdü ve dosyaları hash'ledi.

| kumaş | DXF | SVG | metraj |
|---|---|---|---|
| `cotton-poplin` | 28746 B · `b549b895444f989b` | 10204 B · `7e90b32e4d2704c4` | 2.5 m @112 cm |
| `viscose-crepe` | 28746 B · `b549b895444f989b` | 10204 B · `7e90b32e4d2704c4` | 2.0 m @140 cm |
| `single-jersey` | **0 B** · `e3b0c442…` | 9749 B · `16c8d8f930ef55e4` | 1.7 m @165 cm |

**CEVAP: EVET, değiştiriyor — ama üç değil İKİ kalıp, ve üçüncü kumaşın DXF'i
BOŞ İNİYOR.**

**(a) İKİ DOKUMA BİREBİR AYNI DOSYA.** Ajanın *"berabere"* dediği şey ölçüldü ve
**tablo bile fazla iyimser**: fark yalnız mm'de sıfır değil, **inen dosya bayt
bayt aynı**. Sebebi **hakemin K62 kararıdır** — hakem rijitlik→büzgü haritasını
kendi de aradı ve bulamadı, çarpanı **1.0'da tuttu**. **Bedeli hakemin hanesine
yazılır.**

**(b) 🚨 ÖRME + KOLLU = DXF YOK.** Motorun kendi reddi:
`dxfSpecJSON` → **`[cap] Sleeve: cap ease 0.0% outside the 1-9% window`**,
`draftJSON` aynı spec'te **1 issue**. Örmenin negatif payı oyuğu **404.2593 →
376.5741 mm** küçültüyor, kapak onunla küçülmüyor.
**MİRAS KUSUR, ÖLÇÜLDÜ:** `fabricease.hpp`'nin bant tablosu (`easeAt`) **tek bayt
oynamadı**; hakem beş hâl koşturdu — `fabric:'knit', fabricStretchPct:50`
(**F6-öncesi de kurulabilen** spec) aynı kırmızıyı veriyor, `stretchPct:25` bile
veriyor (cap ease %1.0), **kolsuz hâl temiz** (DXF 20885 B). **F6'dan eskidir.**
🚨 **AMA HİÇBİR KAPI GÖRMÜYOR** (`fabric_catalog_check` `issues`'a bakmıyor,
`indir_check` yalnız dokuma koşuyor) **ve F6'nın üç vitrin kumaşından biri tam
bu hâl.** → **borç 86**, F7'nin kartına **İŞ** olarak giriyor (K65).
Kapıya bugün **eklenmedi**: eklemek **altıncı kırmızı** olurdu ve suçu **yanlış
karta** yazardı.

**(c) REHBER — DOĞRU, ve on iki fazdır ilk kez sayfada.** Kaynaksız cümle
**0 · 0 · 0** (13 · 13 · 15 cümle, süpürme 6995 kontrol). Hakem bunu **kendi
kalemiyle** doğruladı — aşağıda.

---

## 4. KÜNYELERİ HAKEM AÇTI — **BİR ATIF YANLIŞTI VE KESİLDİ (K63)**

§3.10: *"Künye ölü linkse veya kaynak o sayıyı söylemiyorsa kart reddedilir."*

| künye | açıldı mı | hüküm |
|---|---|---|
| `store.astm.org/d3107-07r19.html` | ✔ **canlı** | scope alıntısı **birebir doğru**; 🚨 **eşik YAYINLAMIYOR** |
| `store.astm.org/d2594_d2594m-21.html` | ✔ **canlı** | esneme + growth **yöntemi**; **eşik YAYINLAMIYOR** |
| FAST-2 formülü | ✔ | `KOSU-v7.md` §F6'da birebir; hesap doğrulandı (poplin **12.5310** µNm) |
| rijitlik → büzgü oranı | ✔ **hakem kendi aradı** | **YAYIN BULUNAMADI — hakem de bulamadı** (K62) |

🚨 **BULGU: D3107 BİR TEST YÖNTEMİDİR.** *"These test methods cover the
determination of the amount of fabric stretch, fabric growth, and fabric
recovery…"* — **nasıl ölçüleceğini** tanımlar, **hiçbir kabul eşiği yayınlamaz.**
Yani **%3 / %75 / %85** o standardın sözü **değil**, ve `rehber.hpp` şunu
basıyordu: *"The **published** minimums are 75.0% … **(ASTM D3107)**."*
**Kaynaksız bir cümleden beteri, YANLIŞ kaynaklı bir cümledir.**

**KART REDDEDİLMEDİ, ÇÜNKÜ AJAN İDDİA ETMEDİ.** Katalogda `DOĞRULANMADI-YARIM`
damgası, `_yayin_bulunamadi`'da ayrı kalem, `DAMLA.md`'de §5.5 dökümü:
*"standardın gövdesini gören hakem sayıyı değiştirir."* **Bildirmek ucuz,
gizlemek pahalı** — ajan bildirdi, ve bu hükmü **güçlendirdi.**

**HAKEMİN KALEMİ (§3.8 md.1 · §3.10 md.3), önce → sonra:**

| | ÖNCE | **SONRA** |
|---|---|---|
| rehber cümlesi | *"The **published** minimums are … **(ASTM D3107)**"* | *"…those methods define the test but **publish no pass mark, so the floor below is OURS, not theirs**…"* |
| dayanak damgası | `…;astm=3107` | `…;karar=K63;yontem=astm-d3107;yontem2=astm-d2594` |
| eşiklerin yeri | `standards.astm-d3107.esikler` | **`esikler_hakem_karari.esikler`** (üst düzey, atıf kesik) |
| `fabric_catalog_check` LEG 1 | 7 zorunlu blok · **56** kontrol | **10** zorunlu blok · **59** kontrol, 0 hata |
| eşik SAYILARI | 3.0 / 75.0 / 85.0 | **3.0 / 75.0 / 85.0 — DEĞİŞMEDİ** |

**Sayılar neden kaldı:** üçü de **kısıtlayıcı yönde** çalışıyor — eşiği
yükseltmek daha çok kumaşta negatif payı **keser**. *Dayanak yok, en kısıtlayıcı
seçildi.* **`fabricease.hpp` sabitleri tek bayt oynamadı → hiçbir çizim
kımıldamadı, golden bayt-birebir.**

⭐ **YAN KANIT — İŞ 2'NİN KAPISI GERÇEKTEN SIKI, VE HAKEMİ YAKALADI.**
Hakem düzeltilmiş cümleye *"or D2594 (knit)"* yazdığı anda
`guide_completeness_check` **EXIT 1** verdi: *"prints the number **2594** which
this draft did not compute and no cited source carries — an invented number"*,
**9 fikstürün 9'unda.** Dayanak damgasına `yontem2=astm-d2594` eklenince yeşil.
**Ajanın M2/M3'ünden bağımsız bir kırmızı kanıtı** ve ajanın *"kaynaksız cümle 0"*
iddiasının en güçlü doğrulaması.

---

## 5. İŞ 3 — **YAPILMADI, DOĞRU YAPILMADI, VE HAKEM DE YAPMIYOR (K64)**

Ajanın **kendi aleyhine** yazdığı borç 82 **doğrulandı.** Hakem satırı kendi
gözüyle okudu (`engine/tests/hedef_kosu.mjs:264-266`): çift **rol ADIYLA**
kuruluyor (`byRole.armhole_front` + `byRole.armhole_back` ↔ `byRole.sleeve_cap`)
ve `push` **tek bir `if` bloğunda, döngüsüz**. Motor kapağı
`sleeve_cap_front`/`sleeve_cap_back` diye ilan etse **bu satır onları GÖRMEZ.**
🚨 **Kartın *"paydayı büyüten tek yol MOTOR, bu dosya DEĞİL"* cümlesinin yarısı
çürük** — ve o cümleyi yazan **önceki hakemdir.**

**HAKEM DE PAYDAYA DOKUNMADI, ve sebebi F4 hakeminin dersidir.** Payda 5→10 için
kapağın omuz çentiğinde ikiye ilan edilmesi gerek; kapaktaki tek çentik
`sleeve.cpp:230-231` `capHalf*0.60` / `capHeight*0.42` — **künyesiz iki sabit** ve
üstelik **büzgü** çentiği. Buğra'nın ölçülmüş çentikleri (`127/412/446`, arka
oyuk `arc 87`) **Lower/Upper Sleeve**'in, temel kapağın değil. Bugün büyütmek ya
**künyesiz bir sayıya** bağlamak (§3.10 ihlali) ya **ayna** olurdu (**cırcır
süsü**, K59). **Aynı tuzağa düşülmedi.**
`hedef_kosu.mjs` blob **`7370b86d…` — koşu sonunda birebir aynı.**
**Borç 73'ün kör noktası** açık ve `korNokta` olarak **sayısıyla basılıyor.**

---

## 6. HAKEMİN KENDİ MUTASYONLARI — **BEŞ TUR, BEŞİ DE `numstat` BOŞ DOSYALARDA**
(`GECE7/log/f6.hakem.mutasyon.sh` + `.txt`; `f4.hakem.mutasyon.sh`'ten kopyalandı)

Her turda ikili **silindi**, yeniden derlendi, `shasum` **kımıldadığını
kanıtladı**; `git diff --numstat F6-oncesi..HEAD` her turun başında **basıldı**.

| tur | dosya | `numstat` | ikili | sonuç |
|---|---|---|---|---|
| **HM-1** | `engine/src/skirt.cpp` | **BOŞ** | `2ab983f6…` → `e6231049…` **KIMILDADI** | 🚫 **HÜKÜM YOK** — kapılar yeşil kaldı **ve HM-1b ölçtü: üç kumaşın dokuz sayısı da BİR HANE bile oynamadı.** Kestiğim yol bu üç sayıyı üretmiyor. **Bir kapı deliği DEĞİL, bir hedef ıskası** — ve öyle yazıldı |
| **HM-2** | `engine/src/bodice.cpp` | **BOŞ** | `2ab983f6…` → `3cd9e948…` | ✔ `waistEaseFor(options.fabric)` → `0.0` → **`fabric_catalog_check` EXIT 1** · **`fabric_ease_check` EXIT 1** |
| **HM-3** | `web/js/provenance.js` | **BOŞ** | JS — derleme yok | ✔ `dogrula` → `dogrulaXX` → **`indir_check` EXIT 1** |
| **HM-4** | `web/lib/flat-core.js` (`shoulderY: 0`) | **BOŞ** | JS | 🚫 **HÜKÜM YOK** — kaynak kımıldadı, **ölçülen sayı kımıldamadı** (H6 **0**). Sebebi ölçüldü: `shoulderY` croquis'in **BAŞLANGIÇ NOKTASI**, hepsini birlikte kaydırıyor, sapma üretemez |
| **HM-4b** | `web/lib/flat-core.js` (`shoulderW`) | **BOŞ** | JS | ✔✔ croquis omuz ucu **+2u** → **H6 0 → 16** · **`hedef_kosu` EXIT 1** · **`flat_convention_check` EXIT 1**; geri alınınca **H6 0**, ikisi de EXIT 0 |

⭐ **HM-4b, F4 hakeminin H6 kolunu BAĞIMSIZ BİR ELDEN doğruluyor** (K59'un HM-7'si).
⚠ **Cırcırı hedefleyen C++ mutasyonu kurulmadı** (borç 80/K61) — hakem bu yüzden
JS tarafını seçti; ajan da motora dokunduğu için `build-wasm.sh`'i **iki kez**
koşturmuştu, **hakem kendi motor değişikliği için bir kez daha koşturdu**
(dist `2aa937bf` → **`0e4e51d5`** · vendor `031ee019` → **`0d31cc3b`** ·
worker `1105c4b4` → **`ad7f79ac`** — **ikili KIMILDADI, hüküm var**).

---

## 7. AJANIN DÖRT ÖZ-ELEŞTİRİSİ — **DÖRDÜ DE DOĞRU**

1. **Altıncı kırmızıyı ajan üretti, tam süit buldu, ajan yazdı.** Hakem
   `git diff`le doğruladı: `landing_truth_check.mjs` ve
   `landing-truth-baseline.json` **`git diff --stat F6-oncesi..HEAD`'de YOK** —
   **eşiğe tek bayt dokunulmadı.** Onarım commit'i `1f5287e` **yalnız
   `create.js`'i** değiştiriyor (**5+/2−**): kadran etiketleri ölçüyü bıraktı,
   sayılar **dayanaklarıyla** sonuç sayfasına taşındı. **KÖKTEN, gevşeterek DEĞİL**
   → §3.8 md.4 **tetiklenmedi, GERİ ALMA YOK.**
2. **"Önce ölç, sonra yaz" ihlali** — `vocab` kırmızı yandı, **taban kesilmeden**
   isimlendirmeyle geri indirildi (`engine/vocab.json` bayt-birebir). Hakemin
   koşusu: **YESIL 10326**/10438.
3. **Gerçek tarayıcıda hiç tıklanmadı — on üçüncü faz. DOĞRULANMADI.**
4. **`rabadon` iki yanlış ateş, ikisi de kaydedildi, `guard.json`'a
   dokunulmadı.** ⚠ **Hakemin turunda İKİ KEZ DAHA** yanlış ateşledi (**on birinci
   oturum**): (a) beş **İLAN EDİLMİŞ** kırmızıyı *"tests are RED"* diye bloke etti,
   (b) içinde `ctest` **geçmeyen** bir `cmake --build … | tail -1`'i bloke etti.
   **İkisi de `rabadon wrong` ile kaydedildi**, `guard.json`'a **dokunulmadı**.

---

## 8. DEĞİŞMEZLER — koşu sonunda **hakem** doğruladı (`git hash-object`)

`hedef_kosu.mjs` **`7370b86d`** ✔ · `hedef-kosu-taban.json` **`0ea0cb44`** ✔ ·
`flat_pattern_agree_check.mjs` **`05384380`** ✔ · `labels-hakem.json` **`c21964a8`** ✔ ·
`expressability_check.mjs` **`04c61f03`** ✔ · `KOSU-v7.md` **`158da859`** ✔ ·
`engine/golden-reference.csv` **`a3ec26a6`** ✔ · `mannequin-chart-v1.json` **`8f78f73e`** ✔ ·
`vocab_reference_check.sh` **`e1b55e85`** ✔ · `flat_expresses_spec_check.mjs` **`24fc6a29`** ✔.

🚨 **`hedef_kosu.mjs --taban` KOŞTURULMADI** (K60/borç 79) — taban **elle bile
düzenlenmedi**, bu kartta gerek olmadı.
🚨 **`patterns_real/` PUSHLANMADI** — takipli **41 → 41 → 41**,
`git diff F6-oncesi..HEAD -- patterns_real` **sıfır satır**, diskteki beş
takipsiz kalem **takipsiz kaldı**, `git add -A` **kullanılmadı**.
🚨 **`golden` fikstürü YENİLENMEDİ**, `repin-golden.sh` **koşturulmadı** (K51).
**Holdout `11` · `12` · `30` · `35` HARCANMADI — YEDİNCİ KART.**
`_olcum_seti.yedek_5` **el değmedi**. **Silinen kapı SIFIR**, `-E` **yok**,
**DISABLED 1 → 1**, kayıtlı kapı **127 → 128**, **gevşetilen eşik YOK**;
**bir kapı SERTLEŞTİ** (`fabric_catalog_check` LEG 1, 7 → 10 blok).

**Kapsam** (`git diff --stat F6-oncesi..5979c91`): **160 dosya**, motor tarafı
**4 + hakemin 3'ü**; `web/` altındaki 140 dosyanın büyük çoğunluğu **yalnız `?v`**
(137 → 138). **Kart dışına taşma YOK.**
⚠ **`pages.yml:23 branches:[main]`** — bu push **canlıya çıkar**, ve **beş ilan
edilmiş kırmızıyla** çıkar. Borç 78 ajan tarafından kapatıldı (`?v` reseal aynı
commit'te, `site-health` OK / tek sürüm), **ama hakemin wasm'ı yeni** →
**`?v=138` önbelleği bir kez daha bayat** (borç 78 **yeniden açıldı**, aşağıda).

---

## 9. AÇIK BORÇ

**Bu turda AÇILAN:**
- **86** — 🚨 **ÖRME × KOLLU = DXF BOŞ.** `[cap] Sleeve: cap ease 0.0% outside
  the 1-9% window`. **Miras** (F6-öncesi de üretiliyor), **ama hiçbir kapı
  görmüyor** ve F6'nın üç vitrin kumaşından **biri tam bu hâl**. → **F7'nin İŞİ** (K65).
- **87** — `fabric_catalog_check`'in *"üç kalıp"* kolu, kartın şartından
  **ZAYIF**: yalnız **üçü birden aynıysa** kırmızı yanıyor (`:303-310`), ikisi
  aynıysa **yanmıyor**. Bugün sertleştirilmedi çünkü sertleştirmek **hakemin
  kendi K62 kararını** kırmızı yakardı. **Adı kondu.**
- **88** — kartın *"bel · oyuk · büzgü"* üçlüsünden **yalnız BEL gerçekten
  kapılı** (`:317` jersey < poplin). **Oyuk ve büzgü basılıyor ama bir kapı onları
  bir tabana bağlamıyor** — HM-1'in ıskası bunu görünür kıldı.
- **78 YENİDEN AÇILDI** — hakemin `build-wasm.sh` koşusu wasm'ı değiştirdi,
  `?v` **138'de kaldı** → sevk edilen motor yeni, önbellek damgası bayat.

**Devreden, dokunulmadı:** 39 · 40 · **41** (K33 bu koşuda da **hiç
tetiklenmedi**) · 42 · 44→54 · **51** · 52 · 55 · **57/K44** · **58**
(`op_fixture` **366 sn**) · 60 · **61** (**on birinci oturum**, hakemin turunda
**iki** yanlış ateş daha, ikisi de kaydedildi) · **62/77** (K52'nin ikinci
yarısı — `garment.cpp`'de hâlâ **sıfır satır**; **kumaş bu köprüye DOKUNMADI**,
harita **uydurulmadı**) · 63 · 64 · **65** · 67 · 70 · 71/74 · **72**
(**DOĞRULANMADI**, tam süit altında yine denenmedi) · **73** · **75** · **79** ·
**80** · **81** · **82** (K64) · **83** · **84** · **85** (K62 ile **karara
bağlandı**).

**Hâlâ açık ve silinemez:** gerçek tarayıcıda **hiç tıklanmadı** (**on üçüncü
faz**, DOĞRULANMADI) · miras beşin **ÜÇÜNÜN** kök sebebi **hâlâ aranmadı**
(`style_check` · `sizechart_source_check` · `figure_check`) · **H4 / H9
ÖLÇEMEDİM** · H5 payda **5**, **yedinci kez** · **H8-ifade 3/5, beşinci kart** ·
sevk edilen giysi **HÂLÂ STRAPLESS** · `download.js`'teki `kokenKaydi = null`
arka kapısı · `pages.yml` main'e her push **canlı** · `patterns_real/` **PUBLIC**
(K10, Damla kararı) · holdout **4 fotoğraf, HARCANMADI**.

---

## 10. KARARLAR

**K62** (rijitlik→büzgü: **hakem de bulamadı**, çarpan **1.0** bir KARAR, bedeli
**hakemin hanesinde**) · **K63** (D3107 eşik yayınlamıyor: atıf **kesildi**,
sayılar **hakemin**) · **K64** (İŞ 3 yapılmadı ve **hakem de yapmıyor**; payda
**iki adresli**) · **K65** (örme × kollu DXF boş: **miras**, kapıya bugün
**eklenmedi**, **borç 86**).

---

**GEÇTİ.** Etiket **`F6-yesil`**. Sıradaki kart **`GECE7/F7.md`** —
hanesi **H1 DEĞİL** (10/10 = tavan, §3.7 yetkisiyle değiştirildi):
**H8-İFADENİN PAYI (3/5 → 4/5)**, gerekçesi ölçülmüş bir kuyruktur.
