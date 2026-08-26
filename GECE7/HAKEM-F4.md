# HAKEM — F4 (MANKEN BEDENİ) · 1. TUR

**Ağaç:** `main` @ `dbf1220` (ajan) → `ade7ecc` (hakemin kendi dokunuşu).
Faz öncesi etiket **`F4-oncesi`** (`0ca26d0` üstünde).
**Hakem bu koşuda iş yapmadı; aşağıdaki her sayı hakemin kendi koşusudur.**

# ✅ GEÇTİ — ve bu koşuda **İLK KEZ bir miras kırmızı gerçekten öldü.**

⚠ **Ama hüküm bir kutlama değil.** Kartın **yedi şartından altısı** tuttu,
**biri tutmadı** (`flat_artifact_census` **EXIT 0 OLMADI**), ve o şart
**hakem tarafından REDDEDİLDİ** — ajan yanlış yapmadı, **kart yanlış istedi**
(K58). Bu, K53'ten sonra **ikinci kez** bir kartın şartının hakem tarafından
geri alınmasıdır ve şartı yazan yine **önceki hakemdir.**

---

## 0. HAKEM NE YAPTI

`engine/build` **tamamen silindi**, `cmake -DCMAKE_BUILD_TYPE=Release` ile
**sıfırdan** derlendi (K32; üç tohum diskte doğrulandı — `engine/dist/` **3
dosya**, `engine/pattern-bridge/.venv` **var**, `patterns_real/geometry/`
**var** → **23 kırmızı görülmedi**). `realpath == pwd` → **K33 tetiklenmedi,
borç 41 AÇIK.** **Her kapı hakemin kendi koşusu.** Hakemin **yedi** mutasyonu
kendi eli, **yedisi de** ajanın `numstat`'ı **BOŞ** olan dosyalarında.
**Ve hakem kendi değişikliğini de mutasyonla kanıtladı (HM-7)** — sonra
**kendi ikinci değişikliğini geri aldı**, çünkü ölçtü ve süs olduğunu gördü.

---

## 1. EN AĞIR İDDİA — **MİRAS KIRMIZI 6 → 5. DOĞRULANDI.**

`ctest`'in son satırı **ÖZETLENMEDİ, KOPYALANDI**
(log: `GECE7/log/f4.hakem.ctest.txt`, ajanın commit'i `dbf1220` üstünde):

```
96% tests passed, 5 tests failed out of 126

Total Test time (real) = 739.58 sec

The following tests did not run:
	111 - h10_gate_check (Disabled)

The following tests FAILED:
	 20 - flat_artifact_census (Failed)
	 21 - style_check (Failed)
	 28 - sizechart_source_check (Failed)
	 99 - contract_check (Failed)
	105 - figure_check (Failed)
```

**BEŞ ad, ve beşi de miras listeden. YEDİNCİ KIRMIZI YOK.** Düşen ad
**`flat_pattern_agree_check`** — hakemin kendi koşusunda **`Passed 9.31 sec`**.
`111 - h10_gate_check` **DISABLED** kaldı (K18).

**SÜRE:** ajan **733.51 s** · **hakem 739.58 s** (F5-E hakemi 733.19 s).
Fark **+6.39 s** = duvar saati gürültüsü. `op_fixture` **366.10 s**
(ajan 366.31 — borç 58, süitin yarısı).

### (a) EŞİK GERÇEKTEN EL DEĞMEMİŞ Mİ? — **EVET, BLOB'LA.**

Ajan kapı betiğine **tek bayt** yazmadı. `git rev-parse F4-oncesi:<dosya>`
karşılaştırması, hepsi **AYNI**:

| dosya | blob | hüküm |
|---|---|---|
| **`engine/tests/flat_pattern_agree_check.mjs`** | **`05384380c827b9ce379973308c04ff49e2216be6`** | **AYNI** — %1.5 el değmedi |
| `engine/tests/hedef_kosu.mjs` | `7e3683a94f50895563c2f36ea06b3d17e3497104` | **AYNI** *(ajan; hakem sonra açtı, §5)* |
| `contract/hedef-kosu-taban.json` | `cf2af8c7d3c4603eee5aea252f3568feedda8d10` | **AYNI** *(ajan; hakem sonra yazdı, §5)* |
| `vision/eval/labels-hakem.json` (K19) | `c21964a88ad0695e5acf085fb3d92127def3928e` | **AYNI** |
| `engine/tests/expressability_check.mjs` (K31) | `04c61f03aeb6b9baef7450f2c98b8e564bad4390` | **AYNI** |
| `KOSU-v7.md` (K26) | `158da8598aa3f896634531c7c047e6b7ae2c784b` | **AYNI** |
| `engine/golden-reference.csv` (K51) | `a3ec26a68004543816a6d345843a71011d408a3a` | **AYNI** — 🚨 **re-pin KOŞTURULMADI** |
| `engine/tests/golden_check.sh` | `c7cda6c219609cfc5c7f520e678f8d884e670432` | **AYNI** |
| `engine/tests/vocab_reference_check.sh` + tabanı | `e1b55e85…` · `8c016108…` | **AYNI** |
| `engine/tests/flat_expresses_spec_check.mjs` (K17) | `24fc6a295f301ca49219d925dfc1430dc2a63681` | **AYNI** |
| `engine/CMakeLists.txt` | `151123490a3396b93ad07121c98b3b8e1e9bee6a` | **AYNI** — kapı **silinmedi**, `-E` yok |
| `scripts/deploy.sh` (borç 71) | `67637fe61ed039c850e5d511f6f38dbffc3bde48` | **AYNI** — K21 reseal bloğu **sökülmedi** |
| `.github/workflows/pages.yml` | `b4008edd6772bfed168c08605db017aa28cda9d6` | **AYNI** |

⚠ Ajan **iki** kapı betiğine dokundu ve **ikisi de SERTLEŞTİ, gevşemedi**:
`tek_nesne_check.mjs` §2 kolu **tek bayat dizeden üç alana** çıktı
(çizelge · dönüşüm · farkın kaynağı) — hakem diff'i satır satır okudu;
`flat_artifact_census.mjs`'in **13 satırı YALNIZ AÇIKLAMA METNİ** (kapının
kendi çıktısına yazılan aritmetik, RULES 6), **eşik `1°` ve ölçüm adımı
`4.0mm` kımıldamadı.** **GEVŞETME YOK.**

### (b) K23'ÜN **−28.7714 mm**'Sİ ile ajanın **28.5349 mm**'Sİ — **0.2365 mm NEREDEN?**

**AÇIKLANDI, ve açıklama ajanın kendi kartında zaten yazılıydı** (kart md.
*"Yay olarak karşılığı 28.7325 mm"*). Hakem aritmetiği kendi kapattı:

```
28.5349 mm = DÜŞEY z farkı        (omuz halkası 1378.3050 - kesim 1349.7702)
28.7325 mm = o aralıktaki YAY     (757.5584 - 728.8259)   <- yüzey dik değil, eğik
 0.0389 mm = düzleştirme strain'i (728.8259 - 728.7870)
-------------------------------------------------------------
28.7325 + 0.0389 = 28.7714 = K23'ün sayısı   ✔ BİREBİR
28.7714 - 28.5349 = 0.2365 = 0.1976 (yay-düşey farkı) + 0.0389 (strain)
```

**İki sayı iki AYRI niceliktir** — biri düşey düşüş, biri kumaş boyunca yay —
ve **hiçbiri diğerini çürütmüyor.** Ajan ikisini de bastı. **Açıklanamayan
bir kalem YOK.**

### (c) ONARIM **KÖKTEN Mİ**, YOKSA İKİ ÖLÇÜMÜ AYNI YANLIŞ YERDEN Mİ OKUYOR?

🚨 **Bu, hükmün gerçekten asıldığı yer, ve hakem onu iddiadan değil
MUTASYONDAN biliyor.**

**HM-1** (`engine/tools/pattern-measure.mjs`, `numstat` **BOŞ** — ajanın hiç
açmadığı dosya): **KALIP tarafı** `+20 mm` bozuldu.

```
kapi engine/tests/flat_pattern_agree_check.mjs: EXIT 1 (KIRMIZI)   ✔
geri alindi:                                     EXIT 0 (YESIL)
```

**Kapı TOTOLOJİ DEĞİL.** Kaynağı okudum ve mutasyon doğruladı: kalıp tarafı
`cfTorso.mm + cfSkirt.mm` — **panellerin kendi merkez-ön dikişlerinin
toplamı**, `topColZMM`'den **türemiyor**. Flat tarafı 3B kabuk üstünde
Gauss-Legendre yay; kalıp tarafı **açılmış panel** kenar toplamı. **Ortak olan
tek şey ARALIĞIN BAŞLANGICI**, ve o paylaşım `shellprojection.hpp` ile
`shell-audit.cpp`'de **açıkça ilan edildi** (K29 biçimi: *"if the BOUNDARY is
wrong both readings are wrong together and this tool cannot see it"*).
**Söylenerek yapıldı, gizlenerek değil.**

▸ `flatten_check`'in **<%0.5** strain bütçesi **hâlâ anlamlı**: `flatten.cpp`
ve `flatten_check.cpp` bu kartta **el değmedi** (`numstat` BOŞ), kapı hakemin
koşusunda **YEŞİL**, ve eşiği kendi dosyasında (`gate("max strain %", worst*100,
0.5, worst <= 0.005)`). Kalan **0.0389 mm** o bütçenin **1/94**'ü ve **ayrı bir
kapının** ölçtüğü ayrı bir sayı — yeniden tanımlanmadı.

### (d) BİR MİRAS KIRMIZININ KAPANMASI **BAŞKA BİR KAPIYI KÖR ETTİ Mİ?**

**HAYIR — ve tersine, ortak kör nokta DOĞRU aralığa taşındı.**

`tek_nesne_check`'in **K6** kolu `body_length`'i `shell-audit`'in `merkez_on`
zincirinin **kiriş toplamıyla** denetliyor. Ajan **ikisini birden** taşıdı.
Soru: bu bir körleştirme mi?

**ÖNCE:** flat omuz halkasından yürüyordu, `shell-audit` de omuz halkasından —
**ikisi de AYNI (yanlış) aralıkta anlaşıyordu ve K6 YEŞİLDİ.**
**SONRA:** ikisi de kesim sınırından — **aynı paylaşım, DOĞRU aralıkta.**
**Yani K6 aralığa ZATEN kördü; ajan körlüğü artırmadı, körlüğün altındaki
aralığı düzeltti.** Denetlenen şey (kadratür+Steiner ↔ kiriş toplamı, **ortak
kod yolu yok**) aynen duruyor. `body_height_projected` **hâlâ omuz
halkasından** okunuyor ve kapı dışında raporlanıyor — **taşınmadı.**

---

## 2. AJANIN DİĞER İDDİALARI — HAKEMİN KENDİ KOŞUSU

| kapı | ajan | **hakem (kendi koşusu)** |
|---|---|---|
| `ctest` temiz Release, sıfırdan | 5 failed / 126 · 733.51 s | **5 failed / 126 · 739.58 s** |
| `flat_pattern_agree_check` | EXIT 0 | **EXIT 0** · `body_length` **−0.0389 mm = %−0.0053** · UNMEASURED **3/6 (tavan 3)** |
| `flat_convention_check` | EXIT 0, H6 = 0/16 | **EXIT 0 · H6 = 0/16**, zincir en kötü **0.0003 mm** |
| `flatten_check` · `tek_nesne` · `op_program` · `golden` · `expressability` | — | **hepsi EXIT 0** |
| `vocab_reference_check` | `HUKUM: YESIL` **10322**/10438 | **`HUKUM: YESIL` 10323**/10438 (delta −115). ⚠ **ajanın 10322'si BİR eksik** — taban **kesilmedi**, SCOPE **daraltılmadı**, hüküm değişmez |
| `indir_check` | EXIT 0, KÖKEN 38 | **EXIT 0 · KÖKEN 38** (taban 38, K13) |
| `hedef_kosu` | EXIT 0, CIRCIR SAĞLAM | **EXIT 0 · CIRCIR SAĞLAM** |
| `pytest` | 33 passed | **33 passed in 0.65s** |

**md.1 — İŞ 2 / MANKEN ÇİZELGESİ: 0.0 mm ONAYLANDI (K57).** Ajan
*"YAYIN BULUNAMADI"* dedi ve **en kısıtlayıcıyı seçti**. Hakem denetledi:
`KOSU-v7.md` F4 bölümü bunu **kendi metninde** yazıyor, **9 kafa / 7–8 kafa**
oranının künyesi (yazar/yayın/yıl/sayfa/URL) **verilemedi** ve ajan onu
**hiçbir sayıya beslemedi** — **doğru davranış** (§3.10). **Sıfırdan başka her
değer uydurulmuş bir sayıdır**, ve `_karar` bloğu kaynağını **"BİZİM
KARARIMIZ"** yazıyor, bir yayına **atfetmiyor**. Sayı **hakemindir** (§3.4) ve
hakem **0.0 mm'yi onaylıyor.**
🚨 **VE ÖLÇÜLMEMİŞ BİR YAN SONUÇ VAR, KAYDA GEÇİYOR:** K23'ün **TETİĞİ**
(*"çizelge yayınlandığı gün kapı yeniden yazılmak ZORUNDADIR, çünkü o gün
özdeşlik biter"*) **ATEŞLEMEDİ** — çünkü ilan edilen dönüşüm `farkGirthMM`
**0.0**, yani **hâlâ özdeşlik**, yani eşitlik **hâlâ doğru tahmin.** Kapıyı
yeniden yazmak bugün gereksizdi. Bu bir tesadüf değil, **en kısıtlayıcı
seçimin ikinci ödülü.**

**md.1 devam — H6 = 0/16 GERÇEK Mİ, YOKSA KAPININ KENDİ TANIMI MI?**
**GERÇEK.** Kaynağı okudum: (a) kolu croquis çapalarının manken çizelgesinden
**aritmetikle** türediğini, (b) kolu **çizilen 16 flat'in** o tek mankenin
çapasından **2 mm** toleransın dışına düşüp düşmediğini ölçüyor.
Çizen kalem (`web/lib/flat-core.js`) ile ilan eden çizelge **ayrı dosyalar**,
ve ikisi de kırmızı yakılabiliyor: ajanın **M3** (zincir) ve **M4** (çapa,
H6 0→16), hakemin **HM-4** (`contract/tables.json` — insan çizelgesinin adı
bozuldu → kapı **EXIT 1**, H6 **ölçülemez** oldu, sessizce geçmedi) ve
**HM-7** (çapa → H6 0→16). **Dört ayrı elden, dört kırmızı.**
⚠ **HM-2 İPTAL EDİLDİ ve sebebi bir ölçüm:** `engine/tools/render-garment-flat.mjs:26`
`export * from '../../web/lib/flat-core.js'` — **ince bir yeniden ihraç**,
yani "ikinci bir üretim kalemi" **YOK**; hakemin HM-2'si ajanın M4'üyle **aynı
mutasyon** olurdu. **Uydurulmadı, iptal edildi, sebebi yazıldı.**

**md.2 — İŞ 3 / `flat_artifact_census`: HAKEM KAPATMAYI REDDETTİ (K58).**
Ayrıntı §4'te. **Kartın tutmayan tek şartı budur ve hakem şartı geri alıyor.**

**md.3 — MUTASYON.** Ajan: **5 mutasyon / 5 dosya, 2'si `numstat` BOŞ,
4 kırmızı, M2 YEŞİL ve ajan onu KENDİ ALEYHİNE yazdı** (borç 75). Hakem
`f4.mutasyon.sh`'i okudu: `git numstat` her turun başında **basılıyor**,
`shasum` ile ikilinin kımıldadığı **kanıtlanıyor**, kımıldamayınca
**"HÜKÜM YOK"** yazılıyor, ölçülen sayı ikilinin yanında **ayrıca** basılıyor
(HK-1'in dersi uygulanmış). **Betik dürüst.**
**Hakemin kendi turu: 7 mutasyon, 7'si de `numstat` BOŞ dosyalarda** —
**HM-1** ✔ (kalıp tarafı → agree KIRMIZI, totoloji değil) · **HM-2 İPTAL**
(sebebi ölçüldü) · **HM-3 HÜKÜM YOK** (aşağıda) · **HM-4** ✔ · **HM-5'**
✔ (`gen-flat-tables.mjs` bozuldu → `flat_tables_check` **KIRMIZI**) ·
**HM-6** 🚨 (aşağıda) · **HM-7** ✔ (hakemin kendi H6 kolu).

🚨 **HM-3 HÜKÜM YOK, VE SEBEBİ BİR BULGU:** `engine/src/bodice.cpp`'nin
`armhole_back` rolü silindi, **ikili kımıldamadı** ve `hedef_kosu` **YEŞİL**
kaldı. Sebep bir delik değil, bir **yol farkı**: `spec-diff.mjs:49`
`engine/dist/stitchu-engine.js` yüklüyor, yani **cırcır WASM'ı koşuyor, native
ikiliyi değil.** Bir C++ kaynak mutasyonu `build-wasm.sh` (emcc) koşulmadan
cırcıra **ULAŞAMAZ.** Hüküm verilmedi, bulgu yazıldı → **borç 80.**

**md.4 — BU KARTTA DOĞAN İKİ KIRMIZI: KÖKTEN KAPANDI, GEVŞETİLEREK DEĞİL.**
K51 ayrımı (**0 davranış / N yeniden basım**) **GOLDEN içindir** — golden bir
**SABİTLENMİŞ BEKLENTİDİR** ve onu yenilemek kusuru mühürler. `flat-tables.gen.js`
ile sevk edilen wasm ise **TÜRETİLMİŞ KALEMLERDİR**: doğru değerleri
*"üreteci ne basıyorsa"*dır, ve kaynağı (İŞ 2'nin `flat-convention-v1.json`'ı,
İŞ 1'in `engine/src`'i) **meşru olarak** değişti. **Ayrı sınıf, ve yeniden
basım KÖK ÇÖZÜMÜN KENDİSİ.** Hakem bunu iddiadan değil mutasyondan biliyor —
**HM-5'**: kapının **kendisi** o üreteçtir (`CMakeLists.txt:760`,
`gen-flat-tables.mjs --check`); üreteç bozulunca **`flat_tables_check` 0%
passed, 1 failed**, geri alınınca **100% passed**. *"Yeniden bastım"* cümlesi
**ölçülmüş bir iddiadır.**

**md.6 — KAPSAM.** `git diff --stat F4-oncesi..HEAD`: **20 dosya**, motor
tarafı **8** (`shellprojection.cpp/hpp` · `seamplan.cpp` · `shell-audit.cpp` ·
`shell-flat.cpp` · 3 kapı betiği), 2 kontrat, 2 üretilmiş kalem, 3 sevk
edilen ikili, 5 `GECE7/`. **Kart dışına taşma YOK.**
🚨 **`patterns_real/` PUSHLANMADI:** takipli sayı **41 → 41 → 41**
(`F4-oncesi` / `HEAD` / `origin/main`). Diskteki üç takipsiz kalem
(`BUGRA-DEFTER.md` · `geometry/` · `tools/bugra-geometry-*.json`)
**takipsiz kaldı, `git add` görmedi.**
**`golden` fikstürü YENİLENMEDİ** (blob `a3ec26a6…` iki uçta aynı,
`repin-golden.sh` **koşturulmadı**). **Holdout `11`·`12`·`30`·`35`
HARCANMADI — altıncı kart.** `.rabadon/guard.json`'a **dokunulmadı.**
**`?v` canlıya ne gönderdi:** `pages.yml:23 branches:[main]` yüzünden
`HEAD == origin/main` **canlıdır**; damga **hâlâ 137** ama sevk edilen wasm
**DEĞİŞTİ** (yeni kaynak damgası `c7dc71b1f1af2404`) — ajan bunu **kendi
aleyhine** yazdı (borç 78) ve **doğru**: sunucudaki dosya yeni, **v=137
taşıyan tarayıcı önbelleği bayat.**

**md.7 — K52 YAYINLANMADI, YARISI KAPANDI.** Bu kart flat'in **hangi bedene
değerlendiğini** yayınladı (çizelge + dönüşüm + kaynak). Ama
`draft(spec, measurements)`'ın **serbest vücudu** (`garment.hpp:11`) ile
`buildSeamPlan(sizeLabel)`'ın **EU beden etiketi** (`seamplan.hpp:83`)
arasındaki köprü **kurulmadı**; hakem kendi grep'ini koştu, `garment.cpp`'de
altı operatör başlığından **SIFIR SATIR**. Ajan bunu **uydurmadı,
adlandırdı** (borç 77) — **doğru davranış.** **K52'nin ikinci yarısı F6'ya
devrediyor** ve F6'nın kartına **DEĞİŞMEZ** olarak giriyor.

---

## 3. ⭐ HAKEMİN KENDİ DOKUNUŞU — H6 MÜHRÜ AÇILDI, H5 PAYDASI **AÇILMADI**

### 3a. H6 — **ON İKİ FAZLIK "ÖLÇEMEDİM" KAPANDI**

Ajan sayıyı **ölçtü** ve bir **kapıya** bağladı, ama `hedef_kosu.mjs:349`
mühürlü olduğu için cırcıra basamadı ve **kartında öyle yazdı** — yetkisi
yoktu, **doğru davrandı.** Bağlamak hakemin işidir (§3.8 md.1).

| | ÖNCE | **SONRA** |
|---|---|---|
| `hedef_kosu` H6 | **ÖLÇEMEDİM** (n=5) | **0** (n=8 stil × ön+arka = **16 flat**) |
| taban `H6_konvansiyon.deger` | `null` | **`0`** |
| `hedef_kosu.mjs` blob | `7e3683a9…` | **`7370b86d…`** (hakem açtı) |
| taban blob | `cf2af8c7…` | **`0ea0cb44…`** (hakem yazdı) |

**Sayı burada HESAPLANMIYOR, OKUNUYOR** — ikinci bir hesap ikinci bir
doğrudur ve bu koşunun tekrar tekrar öldürdüğü hata sınıfı odur. Kapı
**0.45 sn** (hakemin ctest'i), maliyet gürültü içinde. Kapı kırmızı olsa
bile sayı okunur (*"kapı düştü" ≠ "sayı yok"*, K33).
⚠ **PAYDA HARMANLANMAZ:** H6'nın `n`'i **8 stil**, H1..H11'in `n`'i **5/10
fotoğraf**. Ayrı yazıldı, tabana da öyle yazıldı.

**MUTASYON KANITI — HM-7** (`web/lib/flat-core.js`, `numstat` **BOŞ**):
- **taban yazılmadan önce:** H6 0 → 16, `hedef_kosu` **EXIT 0 (YEŞİL)**
  — çünkü `null` ile kıyas yapılamaz. **Satırı açmak TEK BAŞINA yetmiyordu.**
- **taban 0'a yazıldıktan sonra:** H6 0 → 16, `hedef_kosu` **EXIT 1 (KIRMIZI)**
- **geri alınınca:** H6 = 0, **EXIT 0**

**H6 artık ÜÇ katmanlı: ÖLÇÜLÜYOR · KAPILI · CIRCIRLI.**

### 3b. H5 — 🚨 **K53 DÜZELTİLDİ, AMA PAYDA YİNE DE BÜYÜTÜLMEDİ**

K53 dedi ki: *"payda bir TAVANDIR, motorda yapılacak hiçbir iş onu
büyütemez."* **Teşhisi doğruydu (`push` bir döngüde değil), sonucu FAZLA
GENİŞTİ.** Hakem ölçtü: motor **ikinci bir çifti adıyla ZATEN ilan ediyor.**
`sleeve.cpp:200-213` kendi yorumunda yazıyor:

> *"The underarm seam is the piece's TWO side edges sewn to each other, so both
> carry the name: naming only one of them would hide the pair a consumer has
> to compare."*

Hakemin dökümü — **n=5'in BEŞ satırında da** `sleeve_underarm` **2 kenar**:
```
{"armhole_front":2,"armhole_back":2,"sleeve_cap":1,"sleeve_underarm":2}   x4
{"armhole_front":1,"armhole_back":1,"sleeve_cap":1,"sleeve_underarm":2}
```
Yani **payda 5 → 10 yapılabilirdi.** Hakem **yaptı**, sonra **geri aldı.**

🚨 **SEBEP BİR ÖLÇÜM: O ÇİFT İNŞADAN SIFIR.** `sleeve.cpp:196-213` sol kenarı
sağ kenarın **AYNASI** olarak kuruyor. Hakemin koşumu, beş satır:

```
419.60/419.60   96.02/96.02   419.60/419.60   419.60/419.60   205.77/205.77
diff 0.00 — BEŞİNDE DE, ve başka türlü ÇIKAMAZ.
```

**Payda 5 → 10 olurdu, pay 0'da KALIRDI ve KALMAK ZORUNDA OLURDU.** Hiçbir
kusur o çifti kırmızı yakamaz. Bu bir **sertleşme değil**, cırcırın kendi
sayısını **süslemesidir** (§3.8 md.3: *kırmızı olamayan kapı kapı değildir*;
§0B: yükselen bir sayı bilgi taşımıyorsa kazanım değildir).
**Hakem kendi değişikliğini reddetti. H5 = 0/5 KALDI.**

**Ve borç 73'ün asıl deliği KAPATILAMAZ, sebebi de ölçüldü:** ön/arkayı
ayırmak için kapağın hangi yarısının ön oyuğa gittiğini söyleyen bir beyan
gerekir; `sleeve_cap` motorda **TEK ve BÖLÜNMEMİŞ** bir yaydır
(`sleeve.cpp:194`, `locket.cpp:379` — tek `EdgeRole`). Uydurmak §3.10
ihlalidir. **Kör nokta artık sayısıyla basılıyor** (`korNokta`: ön/arka
uzunlukları + sebep), **ve paydayı büyüten gerçek işin adı kondu:**
**motor `sleeve_cap`ı omuz çentiğinde ön/arka diye ilan edecek.** Bu bir
**FAZ işidir**, bir kapı düzeltmesi değil. → **F6'nın kartına girdi.**

---

## 4. 🔴 KARAR — `flat_artifact_census` KAPATILMAYACAK (K58)

Kart *"ihlal KÖKTEN kapanır (1 → 0)"* dedi. **Hakem REDDEDİYOR**, ve gerekçe
ajanın **kendi ölçtüğü** sayı:

| b | bel yarı-gen. artışı | **bel halkası** | adım başına dönüş |
|---|---|---|---|
| 5 mm | +0.4554 | 725.0000 → 726.5172 | 8.224° |
| **42 mm** (kapının 1°'si için gereken en küçük) | **+3.8255** | **725.0000 → 737.7779 (+12.7779)** | **0.979°** |
| 90 mm | +8.1974 | 725.0000 → 752.4706 | 0.457° |

**Bel halkası bir TASARIM sayısı değil, KAYNAKLI bir sayıdır:** bolluk
Steiner-tam çözülüp **725** hedefine **0.073 mm** ile oturtuldu (CLAUDE.md
KOŞU 4B, Threads RTW + Aldrich bandı) ve o halka **bütün kalıbın TEK
paylaşılan halkasıdır**. Üçüncü yol (A-line eteğin bel eğimini koniyle
eşitlemek) **etek yasasını** (1960 Big-4 kaynaklı hem sweep) değiştirir.

**İLKE, ve bu koşuda ilk kez yazılıyor: BİR PÜRÜZSÜZLÜK KAPISI, KAYNAKLI BİR
BEDEN ÖLÇÜSÜNÜ EZEMEZ.** 12.78 mm, motorun kendi düzleştirme bütçesinin
(`flatten_check` <%0.5 = 3.64 mm bel halkasında) **3.5 katı**, ve
`flat_pattern_agree_check`'in **%1.5**'inin (10.88 mm) **üstünde**. Yani
kırığı kapatmak, **bu kartın az önce onardığı kapıyı yeniden kırma riski**
taşıyor.

**HÜKÜM:** `flat_artifact_census` **İLAN EDİLMİŞ bir kırmızı** olur —
`contract_check` gibi (Damla'nın 17 Ağu kararı). Eşik **gevşetilmez**, kapı
**silinmez**, `-E`/`DISABLED` **yok**, ve **gerekçe kapının KENDİ çıktısında**
duruyor (ajan yazdı, RULES 6). **Ajan bu şartı tutmadı çünkü tutulmamalıydı;
kart yanlış istedi. Ajana yazılmıyor.**

▸ **Miras beşin bileşimi artık şu:** **1 Damla-ilanlı** (`contract_check`) ·
**1 hakem-ilanlı** (`flat_artifact_census`, K58) · **3 kök sebebi HÂLÂ
ARANMAMIŞ** (`style_check` · `sizechart_source_check` · `figure_check`).

---

## 5. CIRCIR — ÖNCE → SONRA (hakemin kendi koşusu). Her sayıda `n`.

| sayı | ÖNCE (F5-E sonrası taban) | **SONRA (F4, hakem ölçtü)** | hüküm |
|---|---|---|---|
| **H6** | **ÖLÇEMEDİM** (on ikinci faz) | ⭐ **0** (n=8 stil × ön+arka = 16 flat) | **BU FAZIN HANESİ. TABANA YAZILDI, HM-7 ile yanıyor.** |
| H1 | 5/5 (n=5) · 10/10 (n=10) | **5/5 · 10/10** | aynı |
| H2 | %95.2 (40/42) · %93 (66/71) | **%95.2 · %93** | aynı |
| H3 | 2 · 2 | **2 · 2** | aynı |
| **H4** | **ÖLÇEMEDİM** | **ÖLÇEMEDİM — ON İKİNCİ FAZ** | uydurulmadı |
| **H5** | 0/5, payda **TAVAN** (K53) | **0/5** — payda **5 → 5** | **ALTINCI kez.** K53 düzeltildi (§3b) ama payda **BİLEREK** büyütülmedi |
| H8-sözlük | 31 (26+5) · 61 (51+10) | **31 · 61** | aynı, sözlük daraltılmadı |
| H8-ifade | **3/5**, payda MÜHÜRLÜ | **3/5** | **dördüncü karttır durdu**; `TABAN_PAYDA` el değmedi |
| H10 | %58.3 (70/120) · %64.4 (154/239) | **%58.3 · %64.4** | aynı |
| **H10a** | %17.5 · %29.7 | **%17.5 · %29.7** | cırcıra bağlı DEĞİL (K21), **yükseltilmedi** |
| **H10b** | **%40.0** (48/120) · %33.1 | **%40.0 · %33.1** | **§0B tavanı KIMILDAMADI** ✔ |
| H10e | 3 · 5 | **3 · 5** | aynı |
| H10x | %0.8 · %1.7 | **%0.8 · %1.7** | aynı |
| H11 | 3.0 ms | **3.2 ms** (n=5) · **2.2 ms** (n=10), en kötü **33.0 ms** | duvar saati, <10 sn tavanı |
| **süit** | 6 failed / 126 · 733.19 s | **5 failed / 126 · 739.58 s** | ⭐ **MİRAS 6 → 5** |
| kayıtlı kapı | 127 · silinen 0 · DISABLED 1 | **127 · silinen 0 · DISABLED 1** · `-E` yok | **BİR KAPI SERTLEŞTİ** (`tek_nesne` §2), hiçbiri gevşemedi |

▸ **İki `n` harmanlanmadı.** H3 · H8 · H10e mutlak sayaç.
▸ **H6'nın `n`'i (8 stil) diğerlerinin `n`'iyle AYNI DEĞİL** ve öyle yazıldı.

---

## 6. SAPMA SORUSU — CEVAP ÖLÇÜLDÜ

> *"Bir yabancı fotoğraf yükleyip kalıp + flat indirebiliyor muyum, ve
> flatlerin manken çapası tek konvansiyonda mı?"*

**İKİSİ DE EVET, ve ikisi de bir kapının çıkışı:**

1. **`flat_pattern_agree_check` EXIT 0** (hakemin koşusu, `Passed 9.31 sec`).
   İnen flat ile inen kalıp **aynı bedeni anlatıyor**: `hem` %−0.0115 ·
   `waist` %−0.0151 · `body_length` **%−0.0053** — üçü de %1.5'in içinde,
   **eşik değişmeden.**
2. **H6 = 0 / 16 flat**, ve artık **birbirlerine göre değil, İLAN EDİLMİŞ bir
   mankene göre** (`stitchu-manken-v1`, fark **0.0 mm**, kaynağı **"BİZİM
   KARARIMIZ"**). Zincir en kötü **0.0003 mm**.

⚠ **Ve iki şey hâlâ HAYIR, saklanmıyor:** sevk edilen giysi **HÂLÂ
STRAPLESS** (`bust_circumference` · `neck_opening_width` · `shoulder_width`
**UNMEASURED, tavanda 3/6**, sebebi G5'in sevk edilmemesi) · **gerçek
tarayıcıda HİÇ TIKLANMADI** (**on ikinci faz, DOĞRULANMADI**).

---

## 7. HAKEMİN AÇTIĞI BORÇLAR

79. 🚨 **`node engine/tests/hedef_kosu.mjs --taban` YIKICI.** Dosyanın
    **KENDİ kullanım satırı** (`hedef_kosu.mjs:31`) bunu hakemin yolu diye
    yazıyor: *"--taban  tabanı YENİDEN yaz (hakem işi)"*. Hakem tam olarak
    onu yaptı ve dosya şunları **sessizce sildi**: `_hakem_dokunusu` +
    `_hakem_dokunusu_2` (iki önceki hakemin bütün gerekçeleri) · **`_olcum_seti`
    — MÜHÜRLÜ hedef-10 + yedek-5 holdout listesi (K16, §3.8 md.2)** ·
    **`_cevap_anahtari_MUHRU` — `labels-hakem.json` sha256 mührü (K19)**.
    Ve **değerleri de oynattı**: H11 3.7 → 2.9 · H3'ün `uyari`'si düştü ·
    H2'nin künyeleri düştü · `_tarih` *"F2 2. tur hakemi"* → *"Halka 0"* ·
    🚨 **H10a'ya TABAN ANAHTARI AÇTI** — iki hakem onu **bilerek** kapalı
    bırakmıştı (alanları H10b'den H10a'ya kaçırma vektörü).
    **ÖLÇÜLDÜ:** `pytest` → **10 failed, 23 passed**
    (`test_cevap_anahtari_muhru.py`). Yani hasar **sessiz değil** — ama
    **güvenlik pytest'te, betikte DEĞİL**, ve betiğin kendi kullanım satırını
    izleyen bir hakem **önce hasarı verir.**
    **GERİ ALINDI** (`git checkout`, blob `cf2af8c7…`), taban bu turda
    **ELLE, yalnız H6 girdisinde** düzenlendi. **F6'nın DEĞİŞMEZLER'inde.**
80. 🚨 **CIRCIR WASM'I KOŞUYOR, NATIVE İKİLİYİ DEĞİL.** `spec-diff.mjs:49`
    `engine/dist/stitchu-engine.js` yüklüyor; H1..H11'in **hepsi** o ikiliden
    çıkıyor. **Bir C++ kaynak mutasyonu `build-wasm.sh` (emcc) koşulmadan
    cırcıra ULAŞAMAZ** — hakemin HM-3'ü tam olarak böyle **HÜKÜMSÜZ** düştü.
    **Ve o dosya `engine/dist/` altında, yani GITIGNORE'DA ve TAKİPSİZ** (K32).
    `bundle_fresh_check.sh:46-48` **onu DEĞİL**, ondan türetilen **damgalı
    kopyaları** (`web/vendor/`, `backend/engine/`) ölçüyor.
    **HM-6 ölçtü:** dosya bozuldu (`shasum d14d5eb07f73 → 7f33b7c42c05`) →
    `bundle_fresh_check` · `generated_ratchet_check` · `golden_check` ·
    `engine_check` **dördü de GÖRMEDİ**; yalnız `hedef_kosu` **EXIT 1**.
    Yani **BOZUK** bir dist görülüyor, ama **BAYAT-AMA-GEÇERLİ** bir dist
    (eski bir motorun başarılı derlemesi) **hiçbir kapıyı kırmızı yakmaz** ve
    cırcırın bütün sayıları sessizce **eski motoru** ölçer.
    ⚠ **Bayat-ama-geçerli hâl DENENMEDİ — DOĞRULANMADI.**
81. **`shell-flat`'in raporu iki farklı aralığı aynı listede, ayrım yazmadan
    basıyor.** Hakemin koşusunda: `body_height_projected` **743.5050**
    (`ring shoulder->hem`) ile `body_length` **728.8259**
    (`top_boundary->hem`). Kumaş boyunca bir **yay**, düşey bir **düşüşten**
    kısa görünüyor; ikisi de doğru ama **aralıkları farklı** ve rapor bunu
    söylemiyor. Kapıya girmiyor (kıyaslanmıyor), ama **kullanıcının indirdiği
    teknik çizimin yanındaki metin** bu. Küçük, ve bu kartın işi değildi.

**AJANIN AÇTIKLARI — hakem denetledi:**
- **75** (`%1.5`, yayınlanan üst sınırdaki **10.88 mm**'ye kadar bir yalanı
  geçiriyor; M2 ölçtü: +5 mm → %+0.69, EXIT 0). **DOĞRU, ve kendi aleyhine
  yazıldı.** ⚠ Hakem eşiği **düşürmedi**: eşik **KARARDAN** geliyor
  (kapının kendi metni) ve düşürmek **yeni bir uydurma sayı** olurdu (§3.10).
  Ajanın önerdiği yol (**MUTLAK bir mm kolu** — sanayi QC toleransı POM başına
  mutlak verilir, kapının kendi başlığı bunu yazıyor) **doğru yoldur** ve bir
  **kaynak** gerektirir. → **F6'nın kartında adıyla duruyor, şart değil.**
- **76** (bel C1'in fiyatı) → **K58 ile KARARA BAĞLANDI, kapatılmayacak.**
- **77** (K52'nin ikinci yarısı) → **F6'ya devrediyor.**
- **78** (`?v` 137 ama wasm değişti) → **DOĞRU**, hakem doğruladı.

---

## 8. HÜKMÜN GEREKÇESİ — TEK PARAGRAF

**GEÇTİ**, çünkü kartın **asıl işi** (İŞ 1 / K23) **kökten** yapıldı ve hakem
bunu **iddiadan değil kendi mutasyonundan** biliyor: eşik **blob'la el
değmemiş**, kapı **kalıp tarafı bozulunca kırmızı yanıyor** (HM-1, ajanın hiç
açmadığı dosya), 0.2365 mm **birebir açıklandı**, ve `flatten_check`'in strain
bütçesi **el değmedi**; İŞ 2 **en kısıtlayıcıyı** seçti, **uydurmadı**, sayı
hakem tarafından **onaylandı** (K57) ve H6 **on iki fazdır ilk kez bir SAYI**
oldu — **dört ayrı elden dört mutasyonla** kırmızı yakılabildiği gösterildi;
bu kartta doğan **iki kırmızı** saklanmadı ve **kökten** kapandı (HM-5'
ölçtü); ajan **kendi aleyhine dört kalem** yazdı (M2/borç 75 · 77 · 78 ·
*"açılış tam koşusu BENDE YOK"*) ve **hakem dördünü de doğru buldu**;
**kartın tutmayan tek şartı hakem tarafından GERİ ALINDI** (K58 — bir
pürüzsüzlük kapısı kaynaklı bir beden ölçüsünü ezemez), yani ajan **imkânsız
bir şartla suçlanamaz**, K53'ten sonra **ikinci kez.**
⚠ **Ve hüküm bir kazanım ilanı değil:** **H4 ÖLÇEMEDİM — on ikinci faz** ·
**H5 payda 5 — altıncı kez** · **H8-ifade 3/5 — dördüncü kart** · gerçek
tarayıcıda **hiç tıklanmadı — on ikinci faz** · miras beşin **üçünün** kök
sebebi **hâlâ aranmadı** · ve hakem kendi turunda **üç yeni borç** açtı,
**ikisi altyapısal** (79: tabanı yazan betik tabanı yıkıyor · 80: cırcır
takipsiz ve kapısız bir ikiliyi koşuyor).

**`F4-yesil` atıldı ve pushlandı. Sıradaki kart `GECE7/F6.md`.**

---

## 9. HAKEMİN KENDİ COMMIT'İ ÜSTÜNDE İKİNCİ TAM KOŞU

Hakem tabana ve `hedef_kosu.mjs`'e dokundu (§3, K59), o yüzden **süit
hakemin kendi commit'i (`ade7ecc`) üstünde bir kez daha koştu.** Son satır
**ÖZETLENMEDİ, KOPYALANDI** (log `GECE7/log/f4.hakem.ctest2.txt`):

```
96% tests passed, 5 tests failed out of 126

Total Test time (real) = 722.95 sec

The following tests did not run:
	111 - h10_gate_check (Disabled)

The following tests FAILED:
	 20 - flat_artifact_census (Failed)
	 21 - style_check (Failed)
	 28 - sizechart_source_check (Failed)
	 99 - contract_check (Failed)
	105 - figure_check (Failed)
```

**AYNI BEŞ AD. ALTINCI KIRMIZI YOK.** Hakemin mühür açması, taban yazması ve
kendi H5 değişikliğini geri alması **hiçbir yeni kırmızı doğurmadı.**
Süre: ajan **733.51** → hakem 1. tur **739.58** → hakem 2. tur **722.95 s**
(**−16.63 s**, duvar saati gürültüsü; `op_fixture` 366.10 / 366.11).
`vocab` hakemin **kendi commit'inden** okundu (K12): **`HUKUM: YESIL`
10323**/10438. `pytest` **33 passed**.
