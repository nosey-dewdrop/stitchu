# HAKEM HÜKMÜ — F5-C (`op.split`) · ✅ **GEÇTİ**

**Etiket:** `F5C-yesil` · **Ağaç:** `main` @ `d515d87` · **Geri alma:** `F5C-oncesi`
**⚠ Bu hüküm YALNIZ ALT-KART F5-C içindir. "F5 BİTTİ" DEĞİL** (§3.12).

Hakem bu koşuda iş yapmadı. `engine/build` **tamamen silindi** ve
`-DCMAKE_BUILD_TYPE=Release` ile **sıfırdan** derlendi; her kapı hakemin kendi
ağacında koştu. K32'nin üç tohumu diskte doğrulandı (`engine/dist/` 3 dosya ·
`pattern-bridge/.venv` · `patterns_real/geometry/`), `realpath == pwd` → **K33
bu turda da tetiklenmedi** (kapatılmadı, **açık**).

---

## 1. KAPILAR — HAKEMİN KENDİ KOŞUSU, `ctest`in SON SATIRI KOPYALANDI

```
95% tests passed, 6 tests failed out of 125

Total Test time (real) = 717.75 sec

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

**Altı ad TAM OLARAK miras altı. YEDİNCİ KIRMIZI YOK.** `110 - h10_gate_check`
DISABLED ve öyle kaldı (K18).

| kapı | ÖNCE (F5-B, hakem) | **SONRA (F5-C, hakem)** | `n` |
|---|---|---|---|
| `ctest` (temiz Release, sıfırdan) | 6 failed / 123 · **1080.09 s** | **6 failed / 125** · **717.75 s** | — |
| `op_fixture` (YENİ) | yoktu | **366.24 s** | — |
| `rotate_check` | **391.34 s** | **25.41 s** | — |
| `suppress_check` | **375.74 s** | **0.04 s** | — |
| `split_check` (YENİ) | yoktu | **12.74 s** | — |
| `expressability_check` | EXIT 0, 4/5 | **EXIT 0**, **3/5**, **MOTORDA 3** | n=5 |
| `tek_nesne_check` | EXIT 0 | **EXIT 0**, K6 **14/14** | — |
| `vocab_reference_check` | YESIL 10310 | **HUKUM: YESIL 10312** / taban **10438** | 37 eksen + 92 kelime |
| `indir_check` | EXIT 0 | **EXIT 0** | — |
| `hedef_kosu` | EXIT 0 · CIRCIR SAĞLAM | **EXIT 0 · CIRCIR SAĞLAM** | n=5 · n=10 |
| `pytest` | 33 passed | **33 passed** in 0.67s | — |

Kartın bildirdiği **698.97 s** ile hakemin **717.75 s**'si aynı gürültü bandında;
**kartın iddiası doğrulandı, ölçüm hakemindir.**

---

## 2. İŞ 0a — KAPI SAYISI VE KAPSAMI **DARALMADI** (§3.8 md.4 denetimi)

Kartın en riskli iddiası buydu ve **ayrı denetlendi.** `CMakeLists.txt`'in
`add_test` envanteri iki uçta karşılaştırıldı:

| | ÖNCE (`F5C-oncesi`) | SONRA (HEAD) |
|---|---|---|
| kayıtlı test | **124** | **126** |
| `ctest` "out of" (DISABLED düşülür) | **123** | **125** |
| **SİLİNEN kapı** | — | **YOK (sıfır)** |
| eklenen | — | `op_fixture` · `split_check` |
| `DISABLED TRUE` sayısı | **1** | **1** |

**Hiçbir kapı silinmedi, `-E` kullanılmadı, hiçbir test `DISABLED` yapılmadı.**
Ve dokunulan iki kapı **gevşemedi, SERTLEŞTİ** — `rotate_check` ile
`suppress_check`'e fikstürün `"op"` alanını denetleyen **YENİ birer kırmızı kol**
eklendi (K35'in ödünç-ad dersinin dosya hâli). `tek_nesne_check`'in tek
değişikliği özet satırını **koşullu** yapmaktır; exit kodu mantığı el değmedi.

**Kök sebep hakemin gözü önünde doğrulandı:** hakem `op_fixture` koşarken
`suppress-op`'u ölçtü — **271 sn'de hâlâ koşuyordu, toplam 366.24 sn.** Kartın
*"375.74 sn'nin %97'si tek bir plan"* ve *"aynı hesap süitte iki kez ödeniyordu"*
teşhisi **bağımsız olarak tuttu**. Süit **−362.34 sn**.

⚠ **Hakemin eklediği tek uyarı:** fikstür `build/op-suppress.json`'da **kalıcı**.
Bugün zararsız (ctest `FIXTURES_REQUIRED`'ı kendi çözüyor, hakem temiz ağaçta
doğruladı), ama **bayat bir fikstür üzerinde hüküm verme yolu teorik olarak
açık**. Ajan bunu MU1'de kendi eliyle kapattı (fikstürü **yeniden üretti**,
`24c7bdfc → c3583474 → 24c7bdfc`). → **borç 58**, kart şartı değil.

---

## 3. İŞ 0b — YÜK BÖLÜNDÜ, TAVAN TUTMADI → **K40**

`split_check` SP8, hakemin koşusu:

```
SP8 left_ftorso  55.173533262° → 26.840105349° + 28.333427913°  (toplam KORUNDU)
SP8 left_btorso  56.668788492° → 29.937360931° + 26.731427562°  (toplam KORUNDU)
```

**4.0× → 2.02× / 2.14×**, ve **14'e ayar YAPILMADI.** Hüküm **K40**'ta: borç 44
**kapanmadı**, **yeniden adlandırıldı** — kusur geometride değil **kıyasta**.
`maxDartDeg = 14` çok-pensli bir alandır ve tek kamaya uygulanacağının
yayınlanmış dayanağı **görülmedi**. → **borç 54 açık.**

---

## 4. İŞ 0c — KÜNYELER **HAKEM TARAFINDAN AÇILDI VE DOĞRULANDI** (K39 kapandı)

Önceki hakem *"FreeSewing deposu bu makinede yok"* demişti. **Hâlâ yok** (hakem
baktı: `/tmp/freesewing` **YOK**). Ajan depoyu değil **yayınlanmış doküman
sayfalarını** kullandı — ve **hakem dördünü de kendisi açtı** (§3.10: ölü link ya
da kaynağın söylemediği sayı = kart reddedilir):

| künye | hakem ne buldu |
|---|---|
| `freesewing.eu/docs/designs/bella/` | ✅ *"A FreeSewing pattern for a womenswear bodice block"* · *"Cut 1 Front part on the fold. Cut 2 Back parts."* · Techniques'te **dart** |
| `freesewing.eu/docs/designs/bella/options/` | ✅ **Bust Dart Length** · **Waist Dart Length** · **Back Dart Height** (*"Controls the height (length if you will) of the back dart"*) · ⭐ **Bust Dart Angle**: *"It attempts to set the angle of the top leg of the dart at the requested angle."* |
| `freesewing.eu/docs/designs/aaron/` | ✅ *"Cut 1 back on the fold"* · *"Cut 1 front on the fold"* · *"Cut 3 strips for neck opening and armhole binding"* · *"There is no seam allowance on the armholes"* / *"…on the neck opening"* |
| `freesewing.eu/docs/designs/aaron/options/` | ✅ **Length bonus** *"The amount to lengthen the garment. A negative value will shorten it"* **−20%…60%** · **Armhole depth** **−10%…50%** |

**Dördü de canlı, dördü de kaynağın kendi cümlesi. Uydurma künye YOK.**
Ayrıca repo **zaten** bağımsız bir teyit taşıyordu:
`knowledge/seed_round2_formulas.sql` dört satırda `designs/bella/src/back.mjs`'i
`verified=1` ile künyeliyor.

⭐ **En kritik satır en sağlam çıktı:** paydanın en zayıf kalemi
`freesewing-bella → op.rotate` idi (5/5→4/5 düşüşünün tamamı ondan gelmişti) ve
**Bust Dart Angle** onu **birebir** karşılıyor — pensin apeks etrafındaki açısını
bir tasarım seçeneği yapmak pens transferinin ta kendisidir.

▸ **Tek sapma, bildiriliyor:** ajan *"Bust Dart Length: The maximum length brings
the dart all the way to the bust apex"* diye alıntıladı; hakemin açtığı sayfa
**"Controls the length of the bust dart"** diyor. **Alan gerçek, cümle birebir
değil.** Hüküm taşımıyor (o satırın yükünü **Bust Dart Angle** çekiyor), ama
**alıntı düzeltilmeli** → **borç 59**.

▸ **§3.9 korundu:** bunlar yayınlanmış doküman sayfalarıdır, **VLM/ücretli API
çağrısı değil**. Fixture yenilenmedi.

**→ "KÜNYESİZ DAYANAK" damgası KALKTI. K39 KAPANDI.**

▸ ⚠ **Ama bir gereksinim eşlemesi zayıf, ve kayda geçiyor:** `freesewing-aaron →
op.split`'in künyesi *"Cut 1 back on the fold + Cut 1 front on the fold"*. Bir ön
ile bir arka **iki ayrı paneldir**; bir panelin **bölünmesi** değil. Hüküm
etkilenmiyor (aaron **ÇEVRİLEMEDİ** tarafında, ve 4/5→3/5'i sağlayan giysi
`stitchu-sheath-eu38`), ama payda **mühürlü** olduğu için düzeltmesi de
hakemindir → **borç 60**.

---

## 5. İŞ 0d — MUTASYON YAYILIMI: **ETİKET ARTIK ÖLÇÜM** (borç 47 kapandı)

Ajanın "dokunulmadı" dediği üç dosya, hakemin kendi `numstat`'ıyla:

```
engine/src/dartsuppress.cpp     []   BOŞ
engine/src/shellprojection.cpp  []   BOŞ
engine/tools/rotate-op.cpp      []   BOŞ
```

**Üçü de gerçekten dokunulmamış.** F5-B'de etiket yanlıştı; **bu kartta doğru**,
ve betik her turun başında `numstat`'ı **basıyor** — iddia değil ölçüm.
`ikili` sütunu **dört shasum'ın birleşimi** ve tanımı **logun içinde** yazılı;
hakem tabanı doğruladı: `split-op` **`a2dbf736`**, ajanın logundaki taban ile
birebir aynı. MS1'de yalnız **son 8** (split-op) kımıldıyor — `panelsplit.cpp`
yalnız o ikiliye giriyor, **tutarlı.**

### Hakemin KENDİ mutasyonları — dördü, üçü dokunulmamış dosyalarda

| mut | dosya | değişiklik | ikili | sonuç |
|---|---|---|---|---|
| **HM-1** | `surfacepattern.cpp` (kartta **yazılan**) | sütun profilini **AYNALA** | `a2dbf736 → 135cd6c2` | 🚨 **`split_check` EXIT 0, SIFIR FAIL** — kesim sütunları **16→15 · 11→20 · 13→18** kaydığı hâlde |
| **HM-2** | `bodysurface.cpp` (**dokunulmamış**) | `kAspectBust` 1.35→1.42 | `a2dbf736 → 191f0410` | 8 kapı **YEŞİL** (tek kırmızı miras) |
| **HM-3** | `seamplan.cpp` (**dokunulmamış**) | `kCapMM` 60→90 | `a2dbf736 → 0e62697a` | 7 kapının 7'si **YEŞİL** |
| **HM-4** | `flatten.cpp` (**dokunulmamış**) | gevşetme × 0.55 | `a2dbf736 → 75c97b87` | ⭐ **`walkgate_check` KIRMIZI** |
| **HM-B** | `surfacepattern.cpp` | `GarmentSurf::at()` × 1.05 | — | **EXIT 1**, K6 **10 FAIL**, özet satırı **0 kez** |

**Her turdan sonra ağaç sıfırlandı** (`git status` takipli değişiklik **0**,
`split-op` **`a2dbf736`**'ya döndü, `split_check` **EXIT 0**).

🚨 **HM-1 GERÇEK BİR DELİK** ve hükmü **K43**'te: kapı, profilin **sırasını**
motora bağlamıyor — SP0 argmin'i **aracın kendi bastığı** profilden hesaplıyor,
SP1 ise yalnız **toplamı** bağlıyor ve toplam **sıraya duyarsız**. `K30`'un tam
sınıfı, bu kez kartın **kendi yeni sayısının** üstünde. **Hüküm buradan
VERİLMEDİ** (temiz ağaçta profil **doğru**: SP1 üç panelde de tutuyor, sütunlar
16/11/13 gerçek; delik yanlış bir sayı değil **eksik bir kapı**), ve kapatmak
kapı tarafında **tek satır değil** — → **F5-D'nin ZORUNLU İŞ 0'ı, borç 56.**

**HM-4 hükmü kurtarıyor:** ağ tiyatro değil, gerçek bir gevşetmeyi yakalıyor.
**HM-2/HM-3** vücut-girdisi sabitlerinin kapısız olduğunu ölçüyor → **borç 57**,
Halka 3'ün (F4) konusu.

---

## 6. İŞ 0e — KOŞULSUZ ÖZET SATIRI: **KAPANDI** (borç 48), HAKEM TEKRARLADI

| | HM-B (bozuk) | geri alındıktan sonra |
|---|---|---|
| `tek_nesne_check` | **EXIT 1** | **EXIT 0** |
| K6 `FAIL` | **10** | 0 |
| *"…BAĞIMSIZ İKİNCİ YOLDAN doğrulandı"* | **0 kez** | **1 kez** |
| yerine basılan | *"K6 ÖZET BASILMADI: 14 ölçü denetlendi ama 10'i TUTMADI…"* | — |

**İki yönde de ölçüldü. Borç 48 KAPANDI.**

---

## 7. `op.split` GERÇEK Mİ — ÜÇ ŞARTIN ÜÇÜ DE BAĞIMSIZ DOĞRULANDI

1. **Kendi dosyası, KENDİ adını taşıyan kapısı (K35).** `engine/src/panelsplit.{hpp,cpp}` ·
   `engine/tools/split-op.cpp` · `engine/tests/split_check.mjs`, `ctest`e
   **`split_check`** adıyla kayıtlı → `op.split → split_check`. Hakem
   `expressability_check`'in K35 kolunu (`beklenenKapi = X_check`) ve
   `TABAN_PAYDA` bloğunu **satır satır** denetledi: **0 değişiklik.**
2. **Kesir parametresi YOK — kaynaktan okundu.**
   `SplitReport splitPanel(const SurfacePanel& panel);` — **tek argüman.**
   `atFraction` motorda yalnız bir **ÇIKTI** (`atFractionMeasured`); hiçbir
   yerde girdi olarak okunmuyor (hakem `grep`'le doğruladı). Bölme, panelin
   **kendi ölçülen** `SurfacePanel::deficitColumnDeg` profili üzerinde bir
   argmin, ve `split_check` SP0 onu **kendisi yeniden hesaplıyor**.
   **Ölçüldü: kesir SABİT DEĞİL** — `0.500000 · 0.343750 · 0.406250`.
3. **KORUNAN ÖLÇÜLDÜ, KORUNMAYAN AYRI YAZILDI (K29).** Hakemin koşusundan:
   alan `40064.464994744 + 26517.922754112 = 66582.387748855 mm²` (fark **0**);
   işaretli deficit fark **0.000000000°**; kesilen kenar iki tarafta
   **359.679077708mm ↔ 359.679077708mm**, fark **0.0e+0mm**. **Çevre KORUNMUYOR**
   ve bir **kimlik** olarak yargılanıyor — K29'un dersi doğru uygulanmış.
4. **Yeni alan bir kadran değil, bir HOIST.** `deficitColumnDeg` `defBand` ile
   **aynı döngüde, aynı iç-düğüm kuralıyla** birikiyor; hakem SP1'i doğruladı:
   sütun toplamı üç panelde de `developDeficitDeg` ile **birebir** aynı
   (`55.173533262°`, `-1.962831445°`, `0°`). **Tek deficit modeli.**

### İŞARETLİ TOPLAMIN GİZLEDİĞİ İPTAL — **DOĞRULANMADI damgası kalktı**

Önceki hakem uyarmıştı ve ayrı ölçmemişti. Hakem şimdi kendi koşusundan okudu:

```
left_ftorso  işaretli 55.173533262°  mutlak 93.406253761°  İPTAL 38.232720499°
left_btorso  işaretli 56.668788492°  mutlak 91.007819734°  İPTAL 34.339031241°
```

**Sayı gerçek.** ⚠ Ve **bir kapıya bağlı değil**: SP6 iptalin **tanımını** ve
en az bir panelde **ölçülmüş olmasını** şart koşuyor, ama *"iptal şu sayının
altında kalmalı"* diyen bir eşik **uydurulmadı** (K29 emsali, **doğru**).
`op.suppress`'in RET eşiği hâlâ **işaretli** toplamı okuyor → **borç 55 açık**,
ve eşiği değiştirmek **hakem kararıdır** (§3.8 md.4).

---

## 8. H8-İFADE **4/5 → 3/5** — PAYDAN DA PAYDADAN DA GELMİYOR, **MOTORDAN** GELİYOR

Hakemin kendi `expressability_check` koşusu:

```
ok  operatör kümesi: sözleşmede 15, MOTORDA 3 (op.suppress, op.rotate, op.split)
  ÇEVRİLEMEDİ  bugra-locket-top
  ÇEVRİLEMEDİ  bugra-buttoned-corset-bustier
  ÇEVRİLDİ     stitchu-sheath-eu38
  ÇEVRİLDİ     freesewing-bella
  ÇEVRİLEMEDİ  freesewing-aaron
H8-İFADE = 3 / 5  (n=5, payda ADLI)
```

- **`TABAN_PAYDA` mührü: 0 satır değişiklik** (K31). Payda **daralmadı**.
- **K35'in `X_check` kolu: 0 satır değişiklik.** Pay **şişmedi**.
- `expressability_check.mjs`'e yazılan **tek şey** `kaynak`/`gerektirir`
  **metinleridir**; **anahtarlar** (yani yargının kendisi) **el değmedi** — hakem
  diff'i satır satır okudu, ve `TABAN_PAYDA` çapraz denetimi zaten anahtar
  düşerse **kırmızı** yanıyor.
- Düşen giysi **`stitchu-sheath-eu38`** = motorun **kendi sevk ettiği** giysi;
  künyesi `engine/src/surfacepattern.cpp`'nin kendisi. **Künye sorulacak bir
  kalem değil.**

**Düşüş 175 satır yeni motor kodundan geliyor, payda/pay oyunundan DEĞİL.**

---

## 9. ÜÇ YEDİNCİ KIRMIZI — **KÖKTEN** KAPANDI (ölçüldü)

Ajan üçünü de **kendi bildirdi**. Hakem gevşetme aradı ve **bulamadı** — üç
kapının **dosyalarına tek bayt yazılmamış**:

```
engine/tests/preset_resolve_check.mjs      []  BOŞ
engine/tests/bundle_fresh_check.mjs        []  BOŞ
engine/tests/vocab_reference_check.sh      []  BOŞ
engine/tests/vocab-reference-baseline.json []  BOŞ
```

1. **`preset_resolve_check`** — `atFraction` sözleşmede **bırakıldı**
   (`motorda_tuketilmiyor: true`), çünkü `backSlit.vent`'te o kesir **yırtmaç
   derinliği** = gerçek ürün verisi. Silmek **bilgi atmak** olurdu (§5.5). Kapı
   iddiaya bırakılmıyor: MS2/MS3 kırmızı. → hüküm **K41**.
2. **`vocab_reference_check`** — tek bir **kelime**ydi (kapalı bir enum adı yeni
   bir yorumda). Cümle yeniden yazıldı; **taban kesilmedi, SCOPE daraltılmadı,
   `--baseline` çağrılmadı.** Hakem doğruladı: **10312 / 10438**, taban commit
   `495d58a4…`, delta **−126**.
3. **`bundle_fresh_check`** — sevk edilen wasm bir commit gerideydi;
   `build-wasm.sh` koşturuldu. **Gevşetme yok**; hakemin sıfırdan derlemesinde
   **PASSED**.

---

## 10. MÜHÜRLER — HEPSİ HAKEM TARAFINDAN DENETLENDİ

| mühür | değişen satır |
|---|---|
| `contract/hedef-kosu-taban.json` | **0** · blob `cf2af8c7…` **iki uçta birebir** |
| `KOSU-v7.md` (K26) | **0** |
| `expressability_check.mjs` → `TABAN_PAYDA` (K31) · `X_check` kolu (K35) | **0** |
| `vision/eval/` **tamamı** (K19/K14) | **0 dosya** → holdout `11`·`12`·`30`·`35` **HARCANMADI** |
| `vocab_reference_check.sh` + tabanı (K2/K11/K12) | **0** |
| `flat_expresses_spec_check.mjs` (K17) | **0** · ⚠ eklenen 7 dosyanın **hiçbiri `.json` değil**, ve tam `ctest` **üç kez** koştu |
| `flat_pattern_agree_check.mjs` (K23) | **0** — kırmızı **gerçek**, Halka 3 **açılmadı** |
| `hedef_kosu.mjs` eşik/tanım | **0** |
| `patterns_real/` (K10) | takipli **41 → 41**, **PUSHLANMADI**, `git add` görmedi |
| `.rabadon/guard.json` | **DOKUNULMADI** |

**Kapsam: 23 dosya, hepsi kart içi.** Diğer operatörlere **girilmedi**:
`suppressPanel()`'e açı parametresi **eklenmedi**, `rotate_check`'in R0
**çapraz-ölçüm** kolu **sabite çevrilmedi** (K36 — aksine `"op"` denetimiyle
**sertleşti**), `nodeId()`'nin siluet kolu **geri alınmadı** (K24).

**rabadon:** hakem bu turda **iki** yanlış pozitif yedi —
`ctest-tail-hides-verdict` bir **`cmake --build … | tail -2`** üstünde (ctest
bile değil), `red-base` **miras** `sizechart_source_check` üstünde. **İkisi de
`rabadon wrong` ile deftere yazıldı**, `guard.json`'a **dokunulmadı**. Bu kural
artık **üç ayrı oturumda** yanlış ateşledi (F5-A hakemi, F5-B hakemi, F5-C ajanı
ve hakemi) → **borç 61: kuralın kendisi onarılmalı.**

---

## 11. SAPMA SORUSU — **BİRİNCİ YARI EVET, İKİNCİ YARI YARIM, VE BU ÜÇÜNCÜ KEZ**

> *"Bir yabancı fotoğraf yükleyip kalıp + flat indirebiliyor muyum, ve gerçek bir
> giysiden `split` gerektiren bir kalemi operatör programına çevirebiliyor muyum?"*

**BİRİNCİ YARI — EVET.** `hedef_kosu` **H1 5/5 (n=5) · 10/10 (n=10)**,
`indir_check` **EXIT 0**. Bu kart onu **kötüleştirmedi**.

**İKİNCİ YARI — OPERATÖR OLARAK EVET, ÜRÜN OLARAK HAYIR.** Hakem üç operatörün
**üçünü de** ürün hattında aradı:

```
panelsplit.hpp · dartsuppress.hpp · dartrotate.hpp
  → garment.cpp / wasm/bindings.cpp / web/js/*  :  ÜÇÜNDE DE SIFIR SATIR
```

**Üç alt-karttır operatör gerçekliği kapanıyor, ürün yolu kapanmıyor.**
Borç 45 (F5-B) ve borç 49 (F5-C) aynı cepheyi iki kez yazdı. **Hakem bunu karara
bağladı → K46: F5-D bir operatör kartı değil, bir BAĞLAMA kartıdır.**

---

## 12. CIRCIR — HİÇBİR SAYI KÖTÜLEŞMEDİ (hakemin kendi koşusu, `CIRCIR SAĞLAM`)

| sayı | taban (F5-B sonrası) | **F5-C sonrası (hakem)** | hüküm |
|---|---|---|---|
| H1 | 5/5 · 10/10 | **5/5 · 10/10** | tavan (K25) |
| H2 | %95.2 · %93 | **%95.2 · %93** | aynı |
| H3 | 2 · 2 | **2 · 2** | aynı |
| **H4** | ÖLÇEMEDİM | **ÖLÇEMEDİM** | ⚠ **uydurulmadı** (dokuz faz) |
| **H5** | **0/5** | **0/5** | ⚠ payda **büyümedi → kazanım YAZILMADI** |
| **H8-sözlük** | 31 · 61 | **31 · 61** | kötüleşmedi, sözlük **daraltılmadı** |
| **H8-ifade** | **4/5** | ⭐ **3/5** | **DÜŞTÜ**, payda mühürlü |
| H10 | %58.3 · %64.4 | **%58.3 · %64.4** | aynı |
| H10a | %17.5 · %29.7 | **%17.5 · %29.7** | **yükseltilmedi** (K21) |
| **H10b** | **%40.0 · %33.1** | **%40.0 · %33.1** | **§0B tavanı KIMILDAMADI** |
| H10e | 3 · 5 | **3 · 5** | aynı |
| H10x | %0.8 · %1.7 | **%0.8 · %1.7** | aynı |
| H11 | 3.2 ms | **3.2 ms** (n=5) · **2.2 ms** (n=10) | tavanın (10 sn) çok altında |

**H6 istisnası kullanılmadı. H10a ile faz kapatılmadı. H4 ve H5'te sayı
zorlanmadı** — kartın kendi tarifi buydu ve ajan **uymadı değil, uydu**.

---

## 13. NEDEN **GEÇTİ**

- Faz kapısının **dokuzunun dokuzu** hakemin kendi temiz Release ağacında tuttu;
  **yedinci kırmızı yok**, süre **1080.09 → 717.75 s**.
- `op.split`'in üç kapanış şartı **bağımsız** doğrulandı: kendi kapısı **kendi
  adıyla**, **kesir parametresi yok** (imza kaynaktan), korunan nicelikler
  **ölçüldü** ve korunmayan **ayrı yazıldı**.
- **İŞ 0'ın beşi de kapandı**, ve ikisi (0a, 0e) hakem tarafından **tekrarlandı**.
- **İŞ 0c'nin künyeleri hakem tarafından açıldı** — dördü de canlı ve birebir.
- **Kapı sayısı ve kapsamı daralmadı**; dokunulan iki kapı **sertleşti**.
- Ajan **kendi aleyhine olanı kendi yazdı**: H5 paydasının büyümediğini
  ("bu kartın en dürüst olması gereken satırı"), `split`'in **ürüne değmediğini**,
  `maxDartDeg`'in **hâlâ tutmadığını**, üç yedinci kırmızının **doğduğunu**,
  iptalin **kapısız** olduğunu, ve iki kalemi **hakeme bıraktığını**. **Hükmü bu
  güçlendirdi** — F5-A ve F5-B'nin emsali.
- Hakemin bulduğu delik (**K43**) **bir yanlış sayı değil, eksik bir kapı**;
  temiz ağaçta ölçülen her şey **doğru**. Emsal (borç 43/44/47/48) uyarınca
  **devredildi, örtülmedi.**

**⚠ Ve tekrar: bu hüküm YALNIZ F5-C içindir.** Motorda **3** operatör var,
mühürlü paydanın kuyruğunda **5** ad basılı. *"F5'i bitirdim"* **denmiyor.**

---

## 14. BORÇ — F5-C'nin devrettiği + hakemin ekledikleri

**KAPANDI:** 43 (süit) · 47 (mutasyon etiketi) · 48 (özet satırı) · **K39** (künye).
**AÇIK ve devrediyor:** 39 (K32) · 40 (K34) · 41 (K33) · 42 (wasm↔native düğüm) ·
44→**54** · 45+49 (**ürün yolu**, → K46) · 46 (Halka 3) · 50 (→K41) · 51 (H5) ·
52 (yalnız `vertical`) · 53 (→K42) · 55 (iptal kapısız).

**Hakemin eklediği altı kalem:**

56. 🚨 **`split_check` SIRALANMIŞ BİR PROFİLİ GÖREMİYOR** (HM-1, ölçüldü:
    16→15 · 11→20 · 13→18 kaydı, kapı **EXIT 0**). → **F5-D'nin ZORUNLU İŞ 0'ı**, K43.
57. **Vücut-girdisi sabitleri KAPISIZ** (HM-2 `kAspectBust` · HM-3 `kCapMM`;
    7–8 kapı yeşil kaldı). Kaynakta zaten `ASSUMPTION:` damgalılar. → **Halka 3 / F4**, K44.
58. **`build/op-suppress.json` kalıcı bir fikstür** — bugün zararsız, ama bayat
    fikstür üzerinde hüküm verme yolu **teorik olarak açık**.
59. **Bir alıntı birebir değil:** *"Bust Dart Length"*in cümlesi kaynakta
    *"Controls the length of the bust dart"*. Alan gerçek, **alıntı düzeltilmeli**.
60. **`freesewing-aaron → op.split` eşlemesi zayıf:** *"Cut 1 back / 1 front on
    the fold"* iki **ayrı panel**dir, bir panelin **bölünmesi** değil. Payda
    mühürlü → düzeltmesi **hakemin**.
61. **`ctest-tail-hides-verdict` üç oturumdur yanlış ateşliyor.** `guard.json`'a
    dokunulmadı, `rabadon wrong` ile yazıldı; **kuralın kendisi onarılmalı.**

**Hâlâ açık ve silinemez:** gerçek tarayıcıda **hiç tıklanmadı** (dokuz faz,
**DOĞRULANMADI**) · miras 6 kırmızının **4'ünün** kök sebebi aranmadı · inen 7
dosyanın **5'i sessiz** · `download.js`'teki `kokenKaydi = null` · **H4/H6/H9
ÖLÇEMEDİM** · `vocab_reference_check` bir **referans sayacı** (K12) · **K17**
kapı ölçüm verisini ürün spec'i sayıyor · `conftest.py` **hiçbir mutasyonla
korunmuyor** · `pages.yml:23` **main'e her push canlıya çıkıyor** ·
`patterns_real/` **PUBLIC** (K10, Damla kararı) · holdout **4 fotoğraf**,
harcanmadı.

---

**Kararlar:** **K40 · K41 · K42 · K43 · K44 · K45 · K46** (`GECE7/KARARLAR.md`).
**Sıradaki kart:** `GECE7/F5D.md` — **operatörler ürün yoluna bağlanır**
(`op.attach` **F5-E'ye kaydı**, gerekçe K46).
