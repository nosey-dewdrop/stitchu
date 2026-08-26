# GECE7 — DURUM (şef tutanağı)

Koşu: KOSU-v7. Şef kod yazmaz (Halka 0 hariç); kart yazar, ajan salar, hakem salar.
Hedef sabit: **fotoğraf + prompt → kalıp + flat.**

## Sıra — §4 HALKA YAPISI (26 Ağu düzeltmesi)

| Halka | Fazlar | Durum |
|---|---|---|
| **0 — ISINMA** | disk + hedef koşusu tabanı | ✅ **BİTTİ** (şef koşturdu) |
| **1 — AL DENE** | **F-İNDİR** → F0 → F2 | ✅ **KAPANDI** (F2 2. tur GEÇTİ, `F2-yesil`) |
| **2 — MOTOR** | F3 ⇄ F5 (operatör başına alt-kart) | ← **şimdi buradayız**: F3 ✅ (`F3-yesil`) · **F5-A ✅ GEÇTİ** (`F5A-yesil`) · **F5-B ✅ GEÇTİ** (`F5B-yesil`), sıra **F5-C** (`op.split`), kart `GECE7/F5C.md`. **F5 SÜRÜYOR: 15 operatörün 2'si motorda, 13'ü kuyrukta** |
| **3 — DERİNLİK** | F4 → F6 → F7 → F8 → F9 | bekliyor |

**F1 Halka 0'a soğuruldu.** **F3B bu koşudan ÇIKARILDI**, H7 hedef koşusunda yok.

## Tablo

| Faz | Etiket | Ajan | Hakem | Durum |
|-----|--------|------|-------|-------|
| Halka 0 | `halka0-yesil` | şef (ajan yok) | — | ✅ BİTTİ, kart `GECE7/HALKA0.md` |
| F-İNDİR | **`F-INDIR-yesil`** ✅ | 2 tur koştu, `ee1414c`+`072705c` → `cce710d`+`fac2993` | 2 tur koştu | ✅ **GEÇTİ** (2. tur) — kart `GECE7/F-INDIR.md`, hüküm `GECE7/HAKEM-F-INDIR.md` |
| F0 | ⛔ etiket YOK | 1 tur koştu, `cd3bea3` | 1 tur koştu | ⛔ **KALDI** (1. tur) — yedinci kırmızı; kart `GECE7/F0.md`, hüküm `GECE7/HAKEM-F0.md` |
| **F0 (2. tur)** | **`F0-yesil`** ✅ | 1 tur koştu, `68ba288`+`3d6dc7e` | 1 tur koştu | ✅ **GEÇTİ** — vocab yeşil, 6 kırmızı; hüküm `GECE7/HAKEM-F0.md` (2. tur bölümü) |
| F2 | ⛔ etiket YOK | 1 tur koştu, `54f2a0b`+`3c1835f` | 1 tur koştu | ⛔ **KALDI** (1. tur) — yedinci kırmızı; hüküm `GECE7/HAKEM-F2.md`, 2. tur kartı `GECE7/F2.md` sonunda |
| **F2 (2. tur)** | **`F2-yesil`** ✅ | 1 tur koştu, `6210bc2` | 1 tur koştu | ✅ **GEÇTİ** — 6 kırmızı, cevap anahtarı İNSAN, n=10, yedek-5 hakem koşturdu; hüküm `GECE7/HAKEM-F2.md` (2. tur bölümü). **HALKA 1 KAPANDI.** |
| **F3** | **`F3-yesil`** ✅ | 1 tur koştu, `76a4e24` | 1 tur koştu | ✅ **GEÇTİ** — tek nesne teslim, cevap anahtarı mühürlü; kart `GECE7/F3.md`, hüküm `GECE7/HAKEM-F3.md` |
| **F5-A** | **`F5A-yesil`** ✅ | 1 tur koştu, `6e3dd1f` | 1 tur koştu | ✅ **GEÇTİ** — `rotate` motorda + kapılı, `nodeId` siluetı hash'liyor (K24 kapandı), `expressability_check` doğdu; kart `GECE7/F5.md`, hüküm `GECE7/HAKEM-F5A.md` |
| **F5-B** | **`F5B-yesil`** ✅ | 1 tur koştu, `140949f`→`ae10f08` | 1 tur koştu | ✅ **GEÇTİ** — `suppress` motorda + kapılı, açı panelin kendi deficit'inden, sevk edilen giyside **RET**; kart `GECE7/F5B.md`, hüküm `GECE7/HAKEM-F5B.md` |
| **F5-C** | — | açılmadı | — | 🔜 kart `GECE7/F5C.md` — **operatör alt-kartı** (`op.split`, kuyrukta **4 giysi**). **F5 TEK KART DEĞİL** |

## ✅ HAKEMİN HÜKMÜ — F5-B (`ae10f08`, etiket `F5B-yesil`)

✅ **GEÇTİ** — ⚠ **yalnız ALT-KART F5-B, "F5 bitti" DEĞİL** (§3.12: 15 operatörün **2'si** motorda — `rotate`, `suppress` — **13'ü kuyrukta** ve adlarıyla basılı); hakem `engine/build`'ı **tamamen silip `-DCMAKE_BUILD_TYPE=Release` ile SIFIRDAN** derledi (K32'nin üç tohumu diskte doğrulandı; `engine_check` **20.07 sec** = 2684s tuzağına düşülmedi; checkout **sembolik linkli değil**, `realpath == pwd`, yani **K33 kapalı**) ve **her kapıyı kendi koşturdu**: `ctest` **`95% tests passed, 6 tests failed out of 123`** (**1080.09 sec**), altı ad tam olarak miras altı ve **YEDİNCİ KIRMIZI YOK** (`108 - h10_gate_check` DISABLED kaldı, K18) — ▸ **`123` doğrudur:** kayıtlı test **124**'e çıktı (`suppress_check` **tek** yeni `add_test`, `CMakeLists` diff'iyle doğrulandı) ve `ctest`in "out of" satırı **DISABLED olanı düşüyor**, F5-A'nın kurduğu okumayla birebir aynı · `vocab` **`HUKUM: YESIL` 10310**/10438 (delta −128, taban **kesilmedi**) · `indir_check` **EXIT 0** (`KOKEN_ALANLARI` **38**, K13) · `hedef_kosu` **EXIT 0 `CIRCIR SAĞLAM`** · `pytest` **33 passed** · ⭐ `tek_nesne_check` **EXIT 0** (K6 **doğruluk** kolu, **14/14** ölçü, en kötü uyuşmazlık **0.000129mm**) · ⭐ `rotate_check` **EXIT 0** (**391.34 sec**) · ⭐ `suppress_check` **EXIT 0** (**375.74 sec**, `ctest` #12) · ⭐ `expressability_check` **EXIT 0**, **MOTORDA 2**; **İŞ 0'ın İKİSİ DE KAPANDI** — *0a:* `kApexFracOfPanel = 0.80` **silindi** (`git show F5B-oncesi` ile önce/sonra doğrulandı), apeks `plan.opt.bodiceApexFrac`'tan **okunuyor**, iki-koşu oranı **0.750000000**; *0b:* yeni `shell-audit` aracı **14 yayınlanan ölçünün 14'ünü** kiriş toplamıyla Gauss-Legendre+Steiner yoluna karşı yeniden hesaplıyor; ⭐ **KARTIN ÜÇ PARÇALI KAPANIŞ ŞARTININ ÜÇÜ DE BAĞIMSIZ DOĞRULANDI:** `suppressPanel()`'in **açı parametresi YOK** (imza kaynaktan okundu; açı `panel.developDeficitDeg`), pens **bir sayıdan düşüyor** (M5 onu sabite çevirince **kırmızı**), ve `rotate`'in girdisi **fikstür olmaktan çıktı**; 🚨 **SEVK EDİLEN GİYSİDE OPERATÖR REDDEDİYOR** (`left_ftorso` **−1.9628°**, `left_btorso` **−0.1116°**, eşik 0.5) çünkü `skimBodice` gövdeyi **koniye** çeviriyor ve koni birebir açılıyor — **K28'in kök sebebi artık cümle değil SAYI** (K28 kapanmadı, bir sayıya **bağlandı**, borç 46); **Buğra 41.48° YAN YANA ve TUTMUYOR** (+13.6935 / +15.1888) — ⭐ **hakemin hükmü: ayar yapmamak DÜRÜSTLÜKTÜR, işin yarısı DEĞİL**, çünkü 41.48 **başka bir gövdedeki başka bir giysinin** sayısıdır ve onu eşitleyecek bir kadran çevirmek §3.10'un tam olarak yasakladığı şeydir; `rotate-op.cpp`'de 41.48 artık **hiçbir şeyin okumadığı** bir rapor satırı (tek tüketicisi `printf`, `grep`'le doğrulandı); ⭐ **ajanın hakeme bıraktığı 🔴 kalem karara bağlandı → K36: `rotate_check` R0'ın yeniden bağlanması ONAYLANDI** — eski kol `aci_deg == 41.48` **sabitine** bakıyordu, yenisi **iki AYRI ARACIN** çapraz ölçümü (`rotate-op` ↔ `suppress-op`, aynı panel); **bu bir GEVŞETME DEĞİL BAĞLAMADIR** ve ajan onu §3.8 md.4 uyarınca **hakeme getirdi** (K29 emsali, doğru davranış); **iki yedinci-kırmızı KÖKTEN kapandı, `git diff` ile doğrulandı** — (1) ürün sözlüğündeki **üç künyesiz pens açısı SİLİNDİ** (18°·12°·10°) ve `preset_resolve_check`'e **tek bayt yazılmadı** (numstat **0**), (2) wasm yeniden derlendi ve `bundle_fresh_check` hakemin sıfırdan derlemesinde **0.15 sec'te PASSED**; **cırcırın hiçbir sayısı kötüleşmedi** (H10b **%40.0 KIMILDAMADI** = §0B tavanı harcanmadı, H10a **yükseltilmedi** K21, **H4 "ÖLÇEMEDİM" yazılıp uydurulmadı**, H5 **payda büyümedi → kazanım YAZILMADI**); kapsam **21 dosya, hepsi kart içi** — taban blob **`cf2af8c7…` iki uçta birebir aynı**, `vision/eval/` · `KOSU-v7.md` · **`TABAN_PAYDA`** · `vocab` betiği+tabanı · `flat_expresses_spec_check` · `flat_pattern_agree_check` **hepsinde değişen dosya sayısı 0**, **`patterns_real/` PUSHLANMADI** (takipli **41 → 41**), holdout `11`·`12`·`30`·`35` **HARCANMADI**, **diğer operatörlere GİRİLMEDİ**; 🚨 **HAKEMİN KENDİ MUTASYONU GERÇEK BİR DELİK BULDU → K35:** ajanın M8'i yalnız **OLMAYAN** bir kapı adını deniyordu; **HM-A** var olan ama **ALAKASIZ** bir kapının adını **ödünç aldı** (`op.split → "geometry"`) ve kapı **YEŞİL** kalıp **H8-İFADE'yi motora TEK SATIR kod yazmadan 4/5 → 3/5** düşürdü = F5-A hakeminin **PAYDA**'da bulduğu deliğin (K31) **PAY** tarafı — **hakem kapattı** (§3.8 md.1): `motorda_kapi` operatörün **KENDİ** adını taşımak zorunda (`op.X → X_check`), **kural uydurulmadı, motordaki iki operatörden okundu**; doğrulandı: temiz ağaç **EXIT 0 ve 4/5 KIMILDAMADI** (yani düşen sayı **deliğin ürünü değildi**), HM-A **EXIT 1**, ajanın **M8'i hâlâ EXIT 1**; **HM-B ajanın ilan ettiği kör noktayı ÇÜRÜTTÜ — ajanın LEHİNE:** kart *"`GarmentSurf::at()` iki yolun da altında, K6 göremez"* diyordu, `at()` %5 bozulunca `tek_nesne_check` **EXIT 1** ve **14 ölçünün 10'u KIRMIZI** (`hem_circumference` yayınlanan 1295.6000 ↔ ikinci yol 1360.3800, Δ **64.7800mm**) → **K6 ilan edildiğinden GÜÇLÜ**; ⚠ **hakemin iki düzeltmesi:** (1) **K37 — F5-B PUSH KAPISINI KIRMADI**: `pushGate` miras 6 kırmızının **3'ünü** (`flat_pattern_agree_check`·`flat_artifact_census`·`sizechart_source_check`) kapsamında tutuyor ve `100% tests passed` satırı **süre sıfır olsa bile** basılamıyor — kapı **F5-B'den ÖNCE de geçilemezdi** ve `reflog` son beş girdinin beşi `update by push`, yani **push'lar düşmüyor**; **GERİ AL bu gerekçeyle verilmez**, ama maliyet gerçek (`rotate_check` **4.78s → 391.34s**, **82×**; iki kapı **767.08 sn** = süitin **%71'i**) → **borç 43, F5-C'nin ZORUNLU İŞ 0'ı**, (2) ⚠ **§3.8 md.3 etiketlemesi YANLIŞTI**: ajan M1/M7/M7b'yi *"yazmadım"* diye işaretledi ama `git numstat` ölçtü — `surfacepattern.hpp` **+28**, `surfacepattern.cpp` **+33/−10**; gerçekten dokunulmamış dosyalardaki mutasyonlar **M3·M4·M9** = **üç mutasyon, İKİ dosya**, yani **sayı tuttu, etiket yanlış** (borç 47); **K38** tek kama `maxDartDeg = 14`'ün **dört katı** (55.1735°) — tavan **uydurulmadı** (§3.10/K29 emsali), `op.split`'in konusu, **F5-C'de karara bağlanacak** (borç 44); **K39** H8-ifade **4/5 durur ama "KÜNYESİZ DAYANAK" damgası taşır** — düşüşün tamamı `freesewing-bella`'dan geliyor ve o paydanın **DOĞRULANMADI** iki satırından biri, **ama sayıyı silmek bilgi atmaktır** ve operatörün gerçekliği bu künyeye **hiç bağlı değil** (`suppress_check`'in beş kolu paydadan hiçbir şey okumuyor); sayı **dışarıya kazanım olarak söylenmez**, künye **F5-C'nin İŞ 0c'si**, payda **DARALTILMAZ**; **rabadon iki kez yanlış pozitif verdi** (`ctest-tail-hides-verdict` bir `git diff | tail -2` üstünde, `red-base` miras 6 kırmızı üstünde) — **`guard.json`'a DOKUNULMADI**, ikisi de **`rabadon wrong` ile deftere kaydedildi**; tahmin 2–3 oturuma karşı **1 oturum**; ajan **süit süresini, tek-kama tavanını, künyesiz paydayı, mutasyon betiğinin ortada ölmesini ve kendi kartının dayanağını zayıflatan bir RET'i kendi yazdı** — hükmü bu **güçlendirdi** — **`F5B-yesil` atıldı ve pushlandı**, F5-C açıldı (kart `GECE7/F5C.md`, operatör **`op.split`**, dayanak **ölçülen sayı: kuyrukta 4 giysi**), gerekçe `GECE7/HAKEM-F5B.md`, kararlar **K35–K39**.

### Taban — F5-B sonrası. `contract/hedef-kosu-taban.json` blob `cf2af8c7…` **DEĞİŞMEDİ**.

| sayı | ÖNCE (F5-A sonrası) | **SONRA (F5-B sonrası, hakem ölçtü)** |
|---|---|---|
| **H8-sözlük** | **31** (26+5) n=5 · **61** (51+10) n=10 | **31 (26+5) n=5** · **61 (51+10) n=10** — *değişmedi* |
| **H8-ifade** | **5 / 5** n=5, payda ADLI ve MÜHÜRLÜ | **4 / 5** n=5, payda **mühürlü ve TAM** — ⚠ **KÜNYESİZ DAYANAK** (K39) |

**CIRCIR SETİ (n=5)** — hakem kendi koşturdu, F5-B sonrası. **CIRCIR SAĞLAM:**

| H1 | H2 | H3 | **H4** | **H5** | H10 | H10a | **H10b** | H10e | H10x | H11 |
|----|----|----|----|----|-----|------|------|------|------|-----|
| 5/5 | %95.2 | 2 | **ÖLÇEMEDİM** | **0/5** | %58.3 | %17.5 | **%40.0** | 3 | %0.8 | 3.2ms |

**HEDEF SETİ (n=10), harmanlanmadı:** H1 **10/10** · H2 %93 (66/71) · H3 2 · H5 0/5 · H8-sözlük **61** · H10 %64.4 · H10a %29.7 · H10b %33.1 · H10e 5 · H10x %1.7 · H11 2.2 ms.

**KAPI SAYILARI — F5-B sonrası, hepsi hakemin kendi temiz Release koşusundan:**

| kapı | sayı |
|---|---|
| `ctest` (temiz Release, sıfırdan) | **6 failed / 123** · **1080.09 sec** |
| `vocab_reference_check` | **YESIL 10310** (taban 10438, delta −128) |
| `pytest` | **33 passed** |
| `indir_check` | **EXIT 0** (KOKEN 38) |
| `hedef_kosu` | **EXIT 0 · CIRCIR SAĞLAM** |
| `tek_nesne_check` | **EXIT 0** (+K6 doğruluk, 14/14, en kötü 0.000129mm) |
| `rotate_check` | **EXIT 0** · **391.34 sec** |
| `suppress_check` | **EXIT 0** · **375.74 sec** |
| `expressability_check` | **EXIT 0** · H8-ifade **4/5** · **MOTORDA 2** |

## ✅ HAKEMİN HÜKMÜ — F5-A (`6e3dd1f`, etiket `F5A-yesil`)

✅ **GEÇTİ** — ⚠ **yalnız ALT-KART F5-A, "F5 bitti" DEĞİL** (§3.12: 15 operatörün **1'i** motorda, 14'ü kuyrukta ve adlarıyla basılı); hakem kapıları **ayrı bir worktree'de `-DCMAKE_BUILD_TYPE=Release` ile SIFIRDAN derleyip** koşturdu: `ctest` **`95% tests passed, 6 tests failed out of 122`** (331.57 sn), altı ad tam olarak miras altı ve **YEDİNCİ KIRMIZI YOK** (`h10_gate_check` DISABLED kaldı, K18) · `vocab` **`HUKUM: YESIL` 10306**/10438 · `indir_check` **EXIT 0** · `hedef_kosu` **EXIT 0 `CIRCIR SAĞLAM`** · `pytest` **33 passed** · ⭐ `tek_nesne_check` **EXIT 0** (10 hüküm, +K5a/K5b/K5c) · ⭐ `rotate_check` **EXIT 0** (22 hüküm) · ⭐ `expressability_check` **EXIT 0**; **ajanın kendi bildirdiği İKİ ŞEY DE DOĞRU ÇIKTI** — (1) `engine/build` bayat nesne taşıyordu ve `garment_shell_check` temiz ağaçta **`Passed 0.72 sec`**, (2) sevk edilen `top/dart/woven` sınıfının **8/8 panelinde `pens: 0`** (hakem kendi ikilisinden okudu) → **K28**: K27'nin 1. dayanağı **düzeltildi**, `rotate` seçimi **değişmedi** çünkü hakemin **HM2**'si (`bodysurface.cpp`, ajanın açmadığı dosya) apeks derinliğini **289.1484→289.1527mm** oynattı = operatör **canlı `SeamPlan` panelini gerçekten kullanıyor**, düşen yalnız *"pens zaten orada"* varsayımı; **İŞ 0 YAPILMIŞ — hakem HM-F2'yi KENDİ tekrarladı:** `projectBack := projectFront` → ikili **`bc9ceda72237`→`a7b677c75d2f`**, düğüm **`0c1d52866882ce53`→`05cc559aa219ccdb`**, `tek_nesne_check` **EXIT 1 🔴**, geri alınınca ikili ve düğüm tabana dönüp **EXIT 0** → **K24 KAPANDI**; **F3'ün "6 kırmızı"sı ARTIK TEMİZ AĞAÇTA DOĞRULANDI → K32**: ilk tur 23 kırmızı verdi ve kökü **hiçbiri kod değildi** (17 `engine/dist/` gitignore + 7 `pattern-bridge/.venv` gitignore + 1 `patterns_real/geometry/` takipsiz), tohumlanınca **tam altı**; kapsam **17 dosya, hepsi kart içi** — taban `cf2af8c7…` **el değmemiş**, `vision/eval/` **tek bayt yok** (K19 mührü oynamamış), `KOSU-v7.md` **tek bayt yok** (K26), **`patterns_real/` PUSHLANMADI**, holdout `11`·`12`·`30`·`35` **harcanmadı**; cırcırın **on iki sayısının hiçbiri kötüleşmedi** (H10b **%40.0 kımıldamadı**, §0B tavanı harcanmadı, H6 istisnası kullanılmadı) ama ⚠ **H4 ve H5 de KIMILDAMADI** — ve bu **kartın kendi tarifidir**: H5'e *"payda büyümeden 0→0 kazanım DEĞİL"* denmişti ve ajan **kazanım yazmadı**, H4 *"F5'in tamamı"*na verilmişti ve ajan **"ÖLÇEMEDİM" yazıp uydurmadı** (§3.10); **F5-A'nın F5 hanesine yazdığı tek sayı H8-ifade'nin TABANIDIR → K31**; ⭐ ajanın hakeme bıraktığı 🔴 kalem karara bağlandı → **K29: kartın "çevre korunur" şartı YANLIŞTI** (belde duran pens kol oyuğundakinden uzun: 289.1484→206.8872/123.8691/107.9265mm), ajan **eşiği gevşetmedi, yanlış eşiği KURMADI ve hakeme getirdi** — bu turun en doğru davranışı, **emsal**; hakemin **beş mutasyonu, üçü ajanın hiç açmadığı dosyalardan** üç boşluk buldu, **hiçbiri bir iddiayı çürütmüyor**: 🚨 **HM1** (`surfacepattern.hpp`, `bodiceApexFrac 0.80→0.60`) `rotate-op` hâlâ **0.80** basıyor ve kapı **YEŞİL** → *"apeks = motorun ilan ettiği kesir"* künyesi **bağlı değil, kopyalanmış**; 🚨 **HM3** (`shellprojection.cpp`, `bust_circumference` artık **belin** çevresi) düğümü oynatıyor ama **iki kapı da YEŞİL** → **kimlik kapılı, DOĞRULUK KAPISIZ**, inen dosyada yanlış bir ölçü sessizce sevk ediliyor (ikisi de **K30**, F5-B'nin **İŞ 0**'ı); 🚨 **HM4/HM5** H8-ifade'nin **paydasının serbestçe daraltılabildiğini** ölçtü (**5/5 → 4/4** ve **5/5 → 4/5**, kapı YEŞİL) = betiğin kendi başlığının H8-SÖZLÜK için uyardığı §0B tuzağının bir üst katta tekrarı — **hakem kapattı** (§3.8 md.1): `expressability_check.mjs`'e **`TABAN_PAYDA` mührü** eklendi, HM4/HM5 artık **EXIT 1 🔴**, taban **EXIT 0**, ve mühür sonrası tam `ctest` yine **6 failed / 122** = **yedinci kırmızı doğmadı**; yan bulgular kayda geçti (**K33** `figure-lint.mjs` sembolik linkli checkout'ta **sessizce yeşil** — `import.meta.url` realpath'li, `argv[1]` ham, süitin tamamı atlanıp exit 0; **K34** sevk edilen wasm'ın `source-stamp`'i **kaynağın fonksiyonu değil** çünkü `find src wasm` **`engine/src/.rabadon/`**'u yakalıyor, kod baytları bit-aynı ama damga `12060bc08360bbb7` vs `ec4a6889fd4cb2eb`); tahmin 2–3 oturuma karşı **1 oturum**; ajan bayat `engine/build`'ı, **kendi kartının dayanağını zayıflatan** pens ölçümünü ve yanlış bir `git stash pop`'u **kendi yazdı** — hükmü bu **güçlendirdi** — **`F5A-yesil` atıldı ve pushlandı**, F5-B açıldı (kart `GECE7/F5B.md`, operatör **`op.suppress`**), gerekçe `GECE7/HAKEM-F5A.md`, kararlar **K28–K34**.

### Taban — H8 İKİYE AYRILDI (K31, hakem işledi). `contract/hedef-kosu-taban.json` blob `cf2af8c7…` **DEĞİŞMEDİ**.

| sayı | ÖNCE (F3 sonrası) | **SONRA (F5-A sonrası)** |
|---|---|---|
| **H8-sözlük** | **31** (26 oov + 5 alan) n=5 · **61** (51+10) n=10 | **31 (26+5) n=5** · **61 (51+10) n=10** — *değişmedi* |
| **H8-ifade** | **YOK** (betik diskte yoktu) | **5 / 5** n=5, payda **ADLI ve MÜHÜRLÜ** |

**CIRCIR SETİ (n=5)** — hakem kendi koşturdu, F5-A sonrası:

| H1 | H2 | H3 | **H4** | **H5** | H10 | H10a | **H10b** | H10e | H10x | H11 |
|----|----|----|----|----|-----|------|------|------|------|-----|
| 5/5 | %95.2 (40/42) | 2 | **ÖLÇEMEDİM** | **0/5 çift** | %58.3 | %17.5 | **%40.0** | 3 | %0.8 | 4.0 ms |

**HEDEF SETİ (n=10), cırcırsız, HARMANLANMADI:** H1 **10/10** · H2 %93.0 (66/71) · H3 2 · H5 0 · H8-sözlük **61** · H10 %64.4 · H10a %29.7 · H10b %33.1 · H10e 5 · H10x %1.7 · H11 3.3 ms.

**H8-ifade kuyruğu (sıradaki operatörü bu sayı seçti):** `op.split` 4 giysi · **`op.suppress` 4 giysi** · `op.attach` 3 · `op.derive` 1 · `op.extend` 1 · `op.gather` 1 · `op.overlay` 1.

---

## ✅ HAKEMİN HÜKMÜ — F3 (`76a4e24`, etiket `F3-yesil`)

✅ **GEÇTİ** — hakem altı kapının altısını da kendi koşturdu: `ctest` **`95% tests passed, 6 tests failed out of 120`** (396.07 sn), altı ad tam olarak miras altı ve **yedinci kırmızı YOK**; `vocab` **`HUKUM: YESIL` 10306**/10438 · `indir_check` **EXIT 0** · `hedef_kosu` **EXIT 0 `CIRCIR SAĞLAM`** · `pytest` **33 passed** · ⭐ `tek_nesne_check` **EXIT 0** (7 hüküm); korunan **yedi dosyanın yedisi** `F3-oncesi`·`HEAD`·çalışma ağacında **bayt bayt aynı** (taban `cf2af8c7…` · `hedef_kosu.mjs` · `vocab` betiği ve tabanı · `labels-hakem.json` `c21964a8…` · `labels-hakem-BOS` · `flat_expresses_spec_check`) yani **taban KESİLMEDİ, eşik GEVŞETİLMEDİ**; **`indir_check`'in tek değişikliği `await` + yorum**, yargılayan satır (`saved.includes('dress-flat.svg')`) **tek bayt** kımıldamadı → §3.8 md.4 ihlali yok; **K12'nin amend'i davranış-nötr, reflog'dan ölçüldü** (`8197771..HEAD` = 13 **yorum** satırında `neckline`→`neck edge` + üç literal enum varsayılanının tek dizeye inmesi; `nodeId()` aynı dizeyi karıştırıyor ve hakemin bugünkü düğümü **`3f3869aaee8b56b1`** = amend öncesiyle aynı); **İŞ 0 YAPILMIŞ — hakem HM8'i KENDİ tekrarladı:** `01`'in `shaping`'i `deger`→`goremedim` taşındı, mühür kapısı **3 failed** (KIRMIZI) ama `hedef_kosu` **hâlâ EXIT 0** ve H2 **%95.2 → %97.6 bedava**, yani K19'un teşhisi ikinci kez doğrulandı ve anahtarı yakan **tek şey** F3'ün kapısı, geri alınınca blob `c21964a8…` ve **10 passed**; cırcırın **on bir sayısının hiçbiri kötüleşmedi** (H10b **%40.0 kımıldamadı**, §0B tavanı harcanmadı, **H6 istisnası kullanılmadı**); kapsam **20 dosya, hepsi kart içi** ve **`patterns_real/` PUSHLANMADI (0 dosya)**; tahmin 2–4 oturuma karşı **1 oturum**; hakemin **üç mutasyonu ajanın hiç dokunmadığı dosyalardan** koştu (bayat-ikili tuzağı `shasum` ile elendi): **HM-F1** (`bodysurface.cpp`) düğümü **`3f3869aa…`→`6ec8e172…`** oynattı = kimlik **süs değil**, **HM-F3** (`garmentshell.cpp`) ikiliyi kımıldatmadı = **HÜKÜM YOK**, ve 🚨 **HM-F2** (`shellprojection.cpp`, `projectBack := projectFront`) kapıyı **YEŞİL** bıraktı ve düğümü **hiç değiştirmedi** → **`nodeId()` siluetı hash'lemiyor, K3'ün `arka` kolu 0.0000'ı 0.0000 ile kıyaslıyor**; bu bir **kapı kapsamı**, bir yalan değil (kartın 6 no'lu şartı teslim edilip mutasyonla kanıtlandı) ve **ratchet'landı → K24**, F5-A'nın **İŞ 0**'ı; ⭐ ajanın hakeme bıraktığı 🔴 kalem **karara bağlandı → K23: çelişki YOK** — `flatJSON`'un ilan ettiği dönüşüm bugün **ÖZDEŞLİK** (`manken çizelgesi: YAYIN BULUNAMADI`) ve özdeşlik altında eşitlik **doğru tahmindir**, nitekim aynı koşuda bel **%0.0151** ve etek ucu **%0.0115** tutuyor; dolayısıyla `body_length`'in **%-3.7979**'u bir §2 artefaktı değil **gerçek bir ayrışma**: merkez-ön yayında **28.7714mm** = motorun kendi sertifikalı düzleştirme bütçesinin (`flatten_check` <%0.5) **7.6 katı** — **altı fazdır aranmayan kök sebep BULUNDU ve ADLANDIRILDI**, kapı **yeniden yazılmadı** (yayınlanmamış dönüşüme karşı kapı tanımlanmaz + hakem turunda 6-kırmızı tabanı oynatılmaz) ve **tetiği F4'e bağlandı**; **H1 kımıldamadı ama sapma değil → K25**: H1 **5/5 (n=5) ve 10/10 (n=10)**, iki `n`'de de **tavanda**, ve ilanı **ajan değil önceki HAKEM** yapmıştı — **`F3-yesil` atıldı ve pushlandı**, F5-A açıldı (kart `GECE7/F5.md`), gerekçe `GECE7/HAKEM-F3.md`, kararlar **K23–K27**.

### Taban — DEĞİŞMEDİ (F3 tabana dokunmadı, blob `cf2af8c7…` üç uçta aynı)

**CIRCIR SETİ (n=5)** — hakem kendi koşturdu:

| H1 | H2 | H3 | H5 | H8 | H10 | H10a | H10b | H10e | H10x | H11 |
|----|----|----|----|----|-----|------|------|------|------|-----|
| 5/5 | %95.2 (40/42) | 2 | 0/5 çift | 31 | %58.3 | %17.5 | **%40.0** | 3 | %0.8 | 3.0 ms |

**HEDEF SETİ (n=10), cırcırsız — bilgi:** H1 **10/10** · H2 %93.0 (66/71) · H3 2 ·
H5 0 · H8 61 · H10 %64.4 · H10a %29.7 · H10b %33.1 · H10e 5 · H10x %1.7 · H11 2.1 ms.

H4 / H6 / H9 **ÖLÇEMEDİM** (altı fazdır). **H10a cırcıra bağlı değil** (K21).
**İki `n` harmanlanmaz** — H3 · H8 · H10e mutlak sayaçtır.
Havuzda kullanılmayan **4 fotoğraf** kaldı (`11` `12` `30` `35`) — holdout tükeniyor.

### Kapı sayıları — F3 sonrası

| kapı | sayı |
|---|---|
| `ctest` | **6 failed out of 120** (miras altı, yedinci YOK) · `105 - h10_gate_check` DISABLED (K18) |
| `vocab_reference_check` | `HUKUM: YESIL` — **10306** / taban **10438** (delta −132) |
| `indir_check` | **EXIT 0** |
| `hedef_kosu` | **EXIT 0**, `CIRCIR SAĞLAM` |
| `pytest` | **33 passed** |
| ⭐ `tek_nesne_check` | **EXIT 0** — düğüm `3f3869aaee8b56b1` → yaka+20mm `35eb8d7cf33be3ef` |
| ⭐ `expressability_check.mjs` | **DİSKTE YOK** (CMakeLists'te 0 eşleşme) — F5'in kapısı, §4A |

### 🚨 HAKEMİN BULDUĞU, KİMSENİN SORMADIĞI — TEK NESNE KAPISI SİLUETİ KAPSAMIYOR (K24)

Hakemin mutasyonu **HM-F2**, ajanın **hiç dokunmadığı** `engine/src/shellprojection.cpp`'de:
`projectBack := projectFront` (arka teknik çizim = ön teknik çizim) → ikili gerçekten
kımıldadı (`2ccf4bc7…`→`60ea1cde…`) ama `tek_nesne_check` **EXIT 0** ve düğüm
**`3f3869aaee8b56b1` DEĞİŞMEDİ**. `nodeId()` yalnız `surf.rings` + `topColXMM/ZMM`
hash'liyor; inen SVG'nin `data-dugum`'u **çizilen siluetı bağlamıyor**. Ajanın 5
mutasyonunun 5'i de **kendi yazdığı tek dosyadaydı** (`seamplan.cpp`) — sınırı bulmak
§3.8 md.3'e göre hakemin işiydi. F3'ü düşürmedi, **F5-A'nın İŞ 0'ı** olarak zorunlu
kılındı: kapı siluet kolu kazanır ve **HM-F2'de kırmızı yanar**.

## ✅ HAKEMİN HÜKMÜ — F2 (2. tur, `6210bc2`, etiket `F2-yesil`)

✅ **GEÇTİ** — KALDI'nın tek sebebi kapıya **tek bayt dokunulmadan** kaynağında kalktı ve hakem her sayıyı kendi koşturdu: `ctest` **`95% tests passed, 6 tests failed out of 119`** (368.86 sn), altı ad tam olarak miras altı, **`flat_expresses_spec_check` listede YOK**; ajanın en ağır iddiası (*"52 hücre taşındı, TEK YARGI DEĞİŞMEDİ"*) hakem tarafından **hücre hücre** doğrulandı — yeni şekil eski şekle geri çevrilip tam eşitlik arandı, **MISMATCHES: 0** (143 enum + 33 `null` + 52 `goremedim` = 228 birebir yerinde, `gorunurluk`'un 456 hücresi ve 19 fotoğrafın `_sha256`/`_kunye`/`_hakem_notu` satırları el değmemiş) yani **cevap anahtarı gevşetilmedi ve H2 ayakta**; `hedef_kosu` **EXIT 0 `CIRCIR SAĞLAM`** ve `labels.json`'u **gerçekten okumuyor** (dosya adı yalnız bir yorumda, `EYE_F` tek kaynak, **yedek yol yok**, mühür sha256 `a2e33825…` sağlam); ayrışma **21 + 48 + 1 = 70** ile hakemin önceden ölçtüğünü birebir üretti; `indir_check` EXIT 0 · `vocab` `HUKUM: YESIL` **10281**/10438 · `pytest` **23 passed** · `git status` temiz · **ürün koduna 2. turda TEK BAYT girmedi** (`create.js` · `download.js` · `pdf-core.js` · `flat-core.js` · `provenance.js` · kapı betikleri · `labels.json` · `labels-hakem-BOS.json` · **taban** blob'ları iki uçta birebir aynı) · `patterns_real/` **pushlanmadı**; **`104 - h10_gate_check` DISABLED kovalandı ve kapandı (K18)** — `52ae85c` **2026-08-23**'te, koşudan **üç gün önce** kapatılmış, adındaki "h10" bu koşunun metriği değil **H1.0 giyilebilirlik kapısı** (`h10_gate_check_LEGACY.cpp`), yerine `garment_armhole_check` koşuyor, **§3.8 md.4 ihlali yok**; hakemin **dokuz mutasyonu** koştu, **beşi ajanın hiç dokunmadığı** `create.js` · `provenance.js` · `pdf-core.js` · `credits.json` · `labels-hakem-BOS.json` dosyalarında ve sekizi doğru yerde ısırdı — **`F2-yesil` atıldı ve pushlandı, Halka 2 açıldı** (kart `GECE7/F3.md`), gerekçe `GECE7/HAKEM-F2.md` 2. tur bölümü.

### ⭐ HAKEMİN YEDEK 5'i — KOŞTURULDU, AYAR YOK (K20)

Faz ajanının **hiç görmediği** 5 fotoğraf. VLM turlarını **hakem ödedi** (5 çağrı); ham okuma **repoya yazılmadı**.

| | hedef 10 | **yedek 5 (hakem)** |
|---|---|---|
| H1 | 10/10 | **5/5** |
| H2 | %93.0 (66/71) | **%87.5 (28/32)** |
| H10 | %64.4 | **%67.2** |
| H10a | %29.7 | **%35.3** |
| **H10b** | %33.1 | **%28.6** ← yedekte DAHA İYİ |
| H10e | 5 | **6** |

**AYAR (overfit) YOK**, dört sayı: (a) 2. turda **ürün koduna tek bayt girmedi** — ayarlanacak yüzey yok; (b) cevap anahtarını ajan yazmadı; (c) H10b yedekte **daha iyi**, ayar tek yönlü olurdu; (d) yedeğin **4 hatasının 4'ü tek fotoğrafta** (`34-minidress-1960s`, 5/9).

### 🚨 HAKEMİN BULDUĞU, KİMSENİN SORMADIĞI — CEVAP ANAHTARI KORUMASIZ (K19)

Hakemin mutasyonu **HM8**: `01`'in `shaping` yargısı `deger`den `goremedim`'e taşındı →
**H2 %95.2 → %97.6**, ve `hedef_kosu` **EXIT 0** · `pytest` **23 passed** · `indir_check` **EXIT 0** — **SIFIR KIRMIZI.** Cevap anahtarını gevşetmek bugün bedava, ve bu tam olarak §0B'nin reward-hacking maddesi. **F2 o kapıyı KULLANMADI** (0 uyuşmazlık, ölçüldü) → hane yazılmadı, **F3'ün ZORUNLU İŞİ (İŞ 0)** olarak karta geçti. Ara önlem: anahtarın sha256 + hücre sayımı tabana `_cevap_anahtari_MUHRU` olarak yazıldı.

### Taban — HAKEM TERFİ ETTİRDİ (K21), önceki/sonraki yan yana

| | önce | sonra | neden |
|---|---|---|---|
| H2 | %92.2 (47/51) | **%95.2 (40/42)** | 92.2 **okunmayan** bir dosyanın (`labels.json`) sayısı = ölü; bırakmak 3 puan bedava gevşeklik |
| H3 | 4 | **2** | cırcır yalnız düşer; **F2'ye kazanım YAZILMADI** (K9) — kaynak değişiminin yan ürünü |
| **H10b** | anahtar YOK | **%40.0 `tavan`** | artık gerçek ölçüm; anahtar yazıldığı **an** §0B tavanı işlemeye başladı |
| H10e | anahtar YOK | **3** | dayanak artık sabit (insan beyanı) |
| H10x | anahtar YOK | **%0.8** | ancak hat 24 eksenin dışına alan basarsa yükselir = ölçüm körlüğü |
| **H10a** | anahtar YOK | **YİNE YOK** | yedek-5'te %35.3 / hedef-10'da %29.7 — kadrajla oynuyor, **yükselmesi doğru davranış**; cırcıra bağlamak kaçış üretir (§0B) |
| `_n` | 5 | **5** | n=10 ve yedek-5 **ayrı, cırcırsız bloklarda**; mutlak sayaçlar n ile büyür |

**Terfi ısırıyor — ölçüldü (HM9):** taban `H10e` elle 2'ye çekildi → `CIRCIR KIRIK — H10e_etiket_hatasi: taban 2 -> şimdi 3`, **EXIT 1**.

## Son kapı sayıları — F2 SONRASI TABAN (hakem yazdı, cırcır seti n=5)

| H1 | H2 | H3 | H4 | H5 | H6 | H8 | H9 | H10 | H10b | H10e | H10x | H11 |
|----|----|----|----|----|----|----|----|-----|------|------|------|-----|
| 5/5 | **%95.2 (40/42)** | **2** | ÖLÇEMEDİM | 0 / 5 çift | ÖLÇEMEDİM | 31 | ÖLÇEMEDİM | %58.3 | **%40.0** | **3** | **%0.8** | 3.7 ms |

- **H2'nin cevap anahtarı artık İNSAN** (`vision/eval/labels-hakem.json`) — üç fazdır ilk kez.
- **H10a taban anahtarı YOK ve açılmayacak.** H10a'yı yükselterek faz kapatılmaz.
- **§0B tavanı H10b'de:** H10b yükselirken H2 yükselmiyorsa faz KAPANMAZ.

**HEDEF SETİ (n=10), cırcırsız:** H1 10/10 · H2 %93.0 · H3 2 · H8 61 · H10 %64.4 · H10a %29.7 · H10b %33.1 · H10e 5.

### Önceki hüküm (F2 1. tur) — kayıt için duruyor

## ⛔ HAKEMİN HÜKMÜ — F2 (1. tur, `3c1835f`)

**KALDI** — kartın FAZ KAPISI md.1'i `6 failed out of 119` istiyor, hakem kendi koşturdu ve **`7 failed out of 119`** çıktı; yedincinin adı **`flat_expresses_spec_check`** ve o kırmızıyı F2 doğurdu (iki uçtan ölçüldü: `F2-oncesi` worktree'sinde **EXIT 0**, `HEAD`'de **1 FAIL**), kök sebep tek satır — F2'nin eklediği **üretilmiş** `vision/eval/h10-eksenleri.json:36`'daki `"sleeveStyle": "sleeveStyle"` kimlik eşlemesi, kapının `git ls-files '*.json'` taramasında dokuzuncu bir kol DEĞERİ sanılıyor (kol alanı **8 → 9**, `RATCHET sleeveStyle UNEXPRESSED 1/0 — TAVAN ASILDI`); geri kalan her kapı hakemin kendi koşusunda yeşil (`hedef_kosu` EXIT 0 `CIRCIR SAĞLAM` · `indir_check` EXIT 0 · `vocab` `HUKUM: YESIL` 10276/10438 · `pytest` 23 passed · `git status` temiz · `patterns_real/` **pushlanmadı**), hakemin **altı mutasyonunun altısı** doğru yerde kırmızı yandı ve **üçü ajanın hiç dokunmadığı** `create.js` · `download.js` · `pdf-core.js` dosyalarında (H-M1 **K13'ü kapattı**: F0'da EXIT 0 ile kaçan yol bugün **EXIT 8**), fazın ürünü ölçülerek sağlam bulunduğu ve yedinci kırmızının bedeli **bir satır** olduğu için **GERİ AL uygulanmadı** (K15) — `F2-yesil` atılmadı, F2 **ikinci tur** açıldı.

### Hakemin kendi işi — 19 fotoğrafın GÖZ ETİKETİ KONDU (§1F md.3)

Hakem **19 fotoğrafın 19'unu açtı ve baktı.** Cevap anahtarı **`vision/eval/labels-hakem.json`**
(takipli, her satırda künye + sha256). `labels-hakem-BOS.json` **boş bırakıldı** —
o dosya faz ajanının kendi notunu kendi vermediğinin kanıtıdır (K14).

- `gorunurluk` bloğu **19 × 24 = 456 hücrenin 431'i dolu (%94.5)**; 281 görünür,
  150 görünemez, 25 "göremedim". **24 eksenin 24'ünün artık sütunu var** —
  F2'nin ölçtüğü *"13 eksenin sütunu bile yok"* kusuru kapandı.
- `deger` bloğunda tahmin yok: 143 yargı, 33 `null` (fotoğraf gösteremez),
  **52 "göremedim"** (§0B md.3, en kısıtlayıcı).

**★ AYRIŞMA BU ETİKETLE ÇALIŞIYOR** — aynı 5 fixture, aynı 70 çıkarılmış alan:

| | H10a | H10b | H10x | toplam |
|---|---|---|---|---|
| bugün (makine beyanı) | %0 (0/120) | %0 (0/120) | %58.3 (70/120) | 70 |
| **hakemin göz etiketiyle** | **%17.5 (21/120)** | **%40.0 (48/120)** | **%0.8 (1/120)** | **70** |

**21 + 48 + 1 = 70.** Kartın DEĞİŞMEZLER şartı ilk kez tutuyor. Yani **F2'nin
kurduğu ayrışma mekanizması YANLIŞ DEĞİL, VERİSİZDİ** — ve veri artık diskte.

**H2 insan etiketine karşı: 40/42 = %95.2** (makineye karşı 47/51 = %92.2).
⚠ **İYİLEŞME DEĞİL, CEVAP ANAHTARININ DEĞİŞMESİ:** payda **51 → 42** düştü çünkü
hakem, makinenin kendine sorduğu **9 yargıyı** fotoğraftan yapmayı **reddetti**.
Kalan iki gerçek uyuşmazlık: `01` shaping hat `princess`/göz `dart`; `03`
skirtStyle hat `straight`/göz `aLine`. Tabana **yazılmadı**.

**Göz etiketinin bulduğu, kimsenin sormadığı:** dosya-adı-yalanı **kalan 19'da da
var** (F2 yalnız düşürülen 10'da aramıştı) — `05` bel **empire değil normal belde** ·
`15` **kare yaka görünmüyor** (ön gövde örtülü) · `30` **keten değil, plise**.
Üçü de bugün `labels.json`'da makinenin "doğru cevabı" olarak duruyor.

### Ölçüm seti — HAKEM SEÇTİ (§3.8 md.2), taban dosyasında `_olcum_seti`

**HEDEF 10:** `01` `02` `03` `04` `05` `13` `31` `32` `37` `38` — beşi mühürlü
fixture'da bankalı, yani n 5→10 için 14 değil **5** yeni VLM turu. Eklenen beşi
görünürlük aralığını kapatıyor (8 · 9 · 14 · 14 · 16) ve havuzun **tek eteği**,
**tek flat-lay'i**, **tek ön-olmayan kadrajı**, **giysi türünün bile görünmediği
tek hali** bunlar.
**YEDEK 5 (holdout):** `10` `14` `15` `34` `36` — faz ajanı **koşturamaz,
ayarlayamaz, etiketine bakamaz**; yalnız hakem koşturur. Hedef ile yedek arasında
açılan fark **ayar kanıtıdır ve kırmızıdır** (K16).

### Taban — HAKEM DOKUNDU, CIRCIRLI HİÇBİR SAYI DEĞİŞMEDİ

`contract/hedef-kosu-taban.json` → yeni `_hakem_dokunusu` bölümü, önceki/sonraki yan yana:

| | önce | sonra | neden |
|---|---|---|---|
| `_n` | 5 | **5** | mühürlü fixture 5 kayıt; havuz 19 ama **n havuz değildir** |
| H2 | %92.2 | **%92.2** | kapı hâlâ makine etiketini okuyor; insan etiketi yazıldı ama **kapıya bağlanmadı** (kod = faz ajanının işi, §3.7) |
| H10a / H10b | anahtar yok | **yine yok** | bugünkü %0'lar bir ölçüm değil **veri yokluğu**; sıfırı taban yazmak %0→%17.5 sıçramasını *gerileme* gibi okutur ve alanları H10a'ya kaçırmaya iter (§0B) |
| H10e | anahtar yok | **yine yok** | dayanağı (makine beyanı) değişmek üzere; dayanağı değişecek sayıya taban kesmek K2/K11'in yasağı |
| H1/H3/H5/H8/H10/H11 | 5/5 · 4 · 0 · 31 · %58.3 · 3 ms | **aynı** | hakem altısını da kendi koşturdu |

Hakemin yansıtma ölçümleri `_hakem_olcumu_YANSITMA` altında **cırcırsız** duruyor;
kapı o dosyayı okumaya başladığında hakem sayıları `sayilar{}` içine terfi ettirir.

### F2 ajanının bildirdiği (hakem doğrulayana kadar İDDİA)

`ctest` **6 failed / 119** (tam miras altı, yedinci ad yok) · `hedef_kosu` /
`indir_check` / `vocab_reference_check` üçü de Passed · `vocab` toplam **10276** /
taban 10438, `hemFlounce` **26** (net etki 0 satır) · `python3 -m pytest -q`
**23 passed** (bu koşuda İLK KEZ koşuldu — F-İNDİR ve F0 4 collection ERROR'ın
üstünde yeşil bildirmişti) · cırcır **CIRCIR SAĞLAM**, altı sayı taban değerinde,
**n=5 ve büyümedi** (mühürlü fixture 5 kayıt; §3.8 md.2 seti hakemin seçmesini
emrediyor) · yedi mutasyonun yedisi doğru yerde kırmızı, hepsi geri alındı.

**İŞ 1 bitti:** `_dropped` 10 dosya diskten+indeksten silindi, havuz **29 → 19**,
19'un 19'unun künyesi **sha256 kimliğiyle** kanıtlandı (`vision/eval/credits.json`,
sayfa `dataset/hedef-10/KAYNAK.md`), doğru cevap hücreleri hakeme **BOŞ** teslim
edildi (`vision/eval/labels-hakem-BOS.json`, dolu hücre 0, ve dolu hücre bir
pytest kapısını kırmızı yakıyor).

**H10 AYRIŞTI — 0 + 0 + 70 = 70/120, n=5:** H10a **%0**, H10b **%0**,
H10x (görünürlük beyanı YOK) **%58.3**. Kartın *"H10a + H10b = 70/120"* şartı
**çıkmadı ve kartta gösterildi.** Ölçülen kök sebep: H10'un saydığı **24 eksenin
13'ünün göz etiketinde sütunu bile yok** ve çıkarılan 70 alanın **70'i** tam
olarak orada. Yani bugünkü etiket setiyle ayrışma **veri yokluğundan** yapılamıyor;
mekanizma kurulu, kapılı (mutasyon M3/M4) ve şablona `gorunurluk` bloğu eklendi.
Ayrıca yeni ölçüm **H10e = 4**: hat, beyanın GÖRÜNMEZ dediği 4 alanı "fotoğraftan
geldi" işaretliyor — ayrışmanın ön şartı ve **kapatılmadı, ilan edildi**.

**K13 KAPANDI:** hakemin H2-A mutasyonu (eksen `spec` varsayılanından silinir,
`KOKEN_ALANLARI` 38→37) F0'da **EXIT 0** ile kaçıyordu, bugün **EXIT 8**
(`indir_check` §10-(k) sevk edilen 38 eksen genişliğinde koşuyor).

⚠ **Ajanın kendi ilan ettiği sapma:** *"fotoğrafta GÖRÜNEN alanları bir önceki
fazdan daha çok mu alabiliyorum?"* → **HAYIR.** H2 %92.2 → %92.2, H10 %58.3 →
%58.3; F2 çıkarım hattına tek satır dokunmadı (kartın SIRA MECBURİ bölümü İŞ 1'i
her şeyin önüne koymuştu). Hakemin yargılayacağı asıl soru budur.

> ▶ **KOŞU AÇILDI** (26 Ağu, Damla): Halka 1 → F-İNDİR → F0 → F2, sonra Halka 2
> (F3 ⇄ F5), sonra Halka 3 (F4 → F6 → F7 → F8 → F9). **F9 kapanana kadar durulmaz.**
> F3B koşulmaz. Damla koşunun dışındadır (§3.4); zevk kararları dahil her karar
> hakeme gider, hakem `GECE7/KARARLAR.md`'ye gerekçesiyle yazar.

## İKİ DÜZELTME — her faz ajanına ve hakeme geçirilir (26 Ağu, Damla)

1. **H10 ikiye ayrılır.**
   - **H10a** — fotoğrafta **görünmesi mümkün olmayan** alanlar (arka, iç, örtülü).
     **Cırcıra BAĞLANMAZ**; yükselmesi tek başına faz kapatmaz da kapatmamazlık etmez.
   - **H10b** — fotoğrafta **görünen ama alınamayan** alanlar. **Cırcır YALNIZ H10b'ye
     bakar** ve §0B tavanı H10b'ye uygulanır: H10b yükselirken H2 yükselmiyorsa faz kapanmaz.
   - Taban tablosundaki tek `H10 %58.3` sayısı **ayrıştırılmamıştır**; ayrıştıran ilk faz
     iki sayıyı da `n`'siyle basar, hakem tabanı günceller (§3.8 md.1 — tabana yalnız hakem dokunur).
2. **F2'nin İLK işi §1F fotoğraf havuzu.** dropped 10 silinir, havuz **19'a** iner, kalan
   19'un **künyeleri** çıkar (kaynak, lisans, çekim koşulu), **hakem etiketler** — H2'nin
   doğru cevabı makine etiketi olmaktan çıkar. F2'nin başka hiçbir işi bu bitmeden başlamaz.

## Son kapı sayıları — taban, n=5

`ctest --test-dir engine/build -R hedef_kosu` · taban `contract/hedef-kosu-taban.json`

| H1 | H2 | H3 | H4 | H5 | H6 | H8 | H9 | H10 | H11 |
|----|----|----|----|----|----|----|----|-----|-----|
| 5/5 | %92.2 | 4 | ÖLÇEMEDİM | 0 / 5 çift | ÖLÇEMEDİM | 31 | ÖLÇEMEDİM | %58.3 | 3.1 ms |

- H2'nin doğru cevabı **makine etiketi** (§1F) → sayı geçici.
- H5 yalnız `armhole↔sleeve_cap` çiftinde ölçülebiliyor; kalıpta başka kenar rolü ilan edili değil.
- H11 cırcıra değil **tavana** bağlı (<10 sn) ve **VLM turu hariç**.

## ctest

**Sayma yöntemi düzeltildi (hakem, K3): resmi sayı `ctest -N`'in listelediğidir,
`grep -c add_test` DEĞİL** — CMakeLists satır 906'da bir *yorumun* içinde
`add_test(NAME …)` geçiyor ve grep'i 1 fazla saydırıyor. Eski "119 test" o şişmiş sayıydı.

| ağaç | listelenen (`ctest -N`) | DISABLED | koşan | yeşil | kırmızı |
|---|---|---|---|---|---|
| Halka 0 sonu (`34586c8`) | 118 | 1 (`h10_gate_check`) | **117** | 111 | **6** |
| F-İNDİR 1. tur (`b791db5`) | 119 | 1 (`h10_gate_check`) | **118** | 111 | **7** ⛔ |
| **F-İNDİR 2. tur (`fac2993`)** | **120** | 1 (`h10_gate_check`) | **119** | **113** | **6** ✅ |
| **F0 1. tur (`cd3bea3`)** | **120** | 1 (`h10_gate_check`) | **119** | **112** | **7** ⛔ |
| **F0 2. tur (`3d6dc7e`)** | **120** | 1 (`h10_gate_check`) | **119** | **113** | **6** ✅ |
| **F2 1. tur (`3c1835f`)** | **120** | 1 (`h10_gate_check`) | **119** | **112** | **7** ⛔ |
| **F2 2. tur (`6210bc2`)** | **120** | 1 (`h10_gate_check`) | **119** | **113** | **6** ✅ |

✅ **F2'NİN YEDİNCİ KIRMIZISI KAYNAĞINDA KALKTI (2. tur), KAPIYA TEK BAYT DOKUNULMADAN.**
Çarpışma **İKİ** taneydi: `h10-eksenleri.json`'un kimlik eşlemesi (kartın bildiği) **ve**
önceki **HAKEMİN kendi `afc1ca2` commit'indeki** `labels-hakem.json`'un `"göremedim"`
dize sabiti — ikisi de `flat_expresses_spec_check`'in kol değer alanına girmişti
(`8 → 10`, `UNEXPRESSED 2/0`). Çözüm ikisinde de aynı yasa: **bir eksen adı ya da
sentinel dize, takipli bir JSON'da DEĞER olarak durmaz.** `flat_expresses_spec_check.mjs`
ve tabanı **blob bazında el değmemiş**; kapsam **daraltılmadı** (K2/K11/K17).

⚠ **`104 - h10_gate_check` DISABLED — kovalandı, KAPANDI (K18).** `52ae85c`
(**2026-08-23**), koşudan **üç gün önce**; adındaki "h10" bu koşunun
`H10_cikarildi_orani` metriği **değil**, **H1.0 giyilebilirlik kabul kapısı**
(`tests/h10_gate_check_LEGACY.cpp`, `docs/H1.0-KAPI.md`). Gerekçesi kapatıldığı yerde
yazılı ve ölçüye dayalı (`surfacepattern` `engine/src`'den sıfır kez include ediliyordu);
yerine `garment_armhole_check` koşuyor, yeşil. **Faz ajanının gevşetmesi DEĞİL.**

⛔ **F2'NİN YEDİNCİ KIRMIZISI (hakem ölçtü, kart "yedinci ad YOK" demişti):**
`flat_expresses_spec_check` **FAIL** — `RATCHET sleeveStyle UNEXPRESSED 1/0 —
TAVAN ASILDI`. İki uçtan: `F2-oncesi` worktree'sinde **0 FAIL / EXIT 0**,
`HEAD`'de **1 FAIL**. Kök sebep tek satır: kapı kol değer alanını
`git ls-files '*.json'` ile **takipli her JSON** üstünde
`"sleeveStyle"\s*:\s*"([^"]*)"` sayarak topluyor; F2'nin eklediği **üretilmiş**
`vision/eval/h10-eksenleri.json:36` bir kimlik eşlemesi taşıyor
(`"sleeveStyle": "sleeveStyle"`) ve kapı bunu dokuzuncu bir kol DEĞERİ sanıyor.
Kol alanı `F2-oncesi`'nde **8**, `HEAD`'de **9**. Kapıya ve tabanına
**dokunulmayacak** (K17); kalkacak olan çarpışmanın kendisi.

⛔ **F0'IN YEDİNCİ KIRMIZISI (hakem ölçtü, kart YEŞİL diye bildirmişti):**
`vocab_reference_check` **FAIL** — `hemFlounce` **26 → 27**. İki uçtan ölçüldü:
`F0-oncesi` worktree'sinde **YESIL**, `cd3bea3`'te **FAIL**. Kapsam içinde 16
dosyanın 15'i aynı; tek fark `web/js/create.js` **2 → 3** = `create.js:178`'e
yazılan `'hemFlounce'` dize sabiti. Ajan yalnız `garment` eksenine bakmış
(1137/1186, doğru) ama kapı **37 eksen + 92 kelimeyi** cırcırlıyor. Taban
yeniden **kesilmedi** (K11); F0 2. tur bunu tek iş olarak kapatacak.

F-İNDİR iki tur boyunca **iki test ekledi** (`indir_check` #120, `flat_tables_check` #95).
Hiçbir test silinmedi/yeniden adlandırılmadı.

**Miras 6 kırmızı (değişmedi):** `flat_pattern_agree_check` · `flat_artifact_census` ·
`style_check` · `sizechart_source_check` · `contract_check` (ilan edilmiş karar,
bilerek kırmızı) · `figure_check` (`dress_bandeau_circle` pinsiz).

✅ **7. KIRMIZI KAPANDI (2. tur):** `vocab_reference_check` yeşil. `garment` SCOPE içinde
**1188 → 1137** (taban 1186). Taban ve kapı betiği **bayt bayt dokunulmadı**
(`git diff --stat 34586c8 HEAD` boş). Düşüş kapalı enumun sökülmesinden:
`create.js`'te doğrudan enum karşılaştırması **44 → 4**. Hakem ayrı worktree'de
kendi saydı; −51'in dosya dosya dağılımı `GECE7/HAKEM-F-INDIR.md` §2'de.

## Son kapı sayıları — F0 sonrası, taban yine DEĞİŞMEDİ (hakem koşturdu, n=5)

`node engine/tests/hedef_kosu.mjs` → EXIT 0, `CIRCIR SAĞLAM`.

| | H1 | H2 | H3 | H5 | H8 | H10 | H11 |
|---|----|----|----|----|----|-----|-----|
| F0 öncesi | 5/5 | %92.2 | 4 | 0 | 31 | %58.3 | 3.1 ms |
| F0 sonrası | **5/5** | **%92.2** | **4** | **0** | **31** | **%58.3** | **3.1 ms** |

**F0 altı sayının hiçbirini oynatmadı** ve bu bir sapma değil: H1 zaten
**5/5 = tavan** (n=5'te yükselecek birim yok), H10'un düşmesi F0'ın işi
değildi (§0B: çıkarmak suç değil, **sessizce** çıkarmak suç), H3 = 4 ise ilan
kanalı `web/js/` hattına kurulup ölçüm hattı `hedef_kosu.mjs`'e bağlanmadığı
için düşemedi (K9 — H3 gevşetilmedi, düşüşü F2'nin hanesine yazılacak).
Fazın gerçek iyileşmesi artefaktın üstünde ölçüldü: kökenini söyleyen inen
dosya **0/5 → 2/5**, etiketli eksen **0 → 38**, etiketleme çağrısı **0 → 50**.

## Son kapı sayıları — taban DEĞİŞMEDİ (n=5)

`ctest -R hedef_kosu` **YEŞİL**, H1–H11 taban değerinde; F-İNDİR görme/çıkarım
hattına tek satır dokunmadı. `contract/hedef-kosu-taban.json`'a dokunulmadı
(doğrulandı: dosyanın tek commit'i `f56941e`, Halka 0). H11 3.1 → 3.3 ms duvar
saati salınımıdır ve H11 cırcıra değil **tavana** (<10 sn) bağlıdır.

## Önceki hüküm (F0 2. tur) — kayıt için duruyor
### Son hüküm F2'dir, yukarıda (⛔ KALDI)

✅ **GEÇTİ (F0 2. tur, `3d6dc7e`, etiket `F0-yesil`)** — KALDI'nın tek sebebi kök sebebe inilerek kapandı ve hakem her sayıyı kendi koşturdu: `vocab_reference_check` **YEŞİL** (`hemFlounce` **26**, taban 26; toplam 10276 / taban 10438) ve taban ile kapı betiği **blob hash'i eşit** = bayt bayt el değmemiş (`e1b55e8…`, `8c01610…`, `contract/hedef-kosu-taban.json` `384af3b…`, `hedef_kosu.mjs` `84f3243…`), yani §3.8 md.4 ihlali yok; `ctest` **6 failed out of 119**, tam miras altı, **yedinci ad yok**; `hedef_kosu` Passed, `CIRCIR SAĞLAM`, H1 5/5 · H2 %92.2 · H3 4 · H5 0 · H8 31 · H10 %58.3 (n=5); `indir_check` EXIT 0 ve `KOKEN_ALANLARI` **hakem ayrıştırıp saydı: 38** (spec 33 + SPEC_GROUPS 33 → birleşim 37 + `beden`), §10-(i) **0 etiketsiz**; dize sabiti **taşınmadı, öldü** (`hemFlounce` kod referansı `create.js`'te önce 2 sonra 2, eksen artık `spec` varsayılanında ve liste türetilmiş) ve davranış değişmediği ölçüldü (vocab index 0 = `'none'`, `hemFlounce` `SPEC_GROUPS`'ta yok → URL'den set edilemiyor); hakemin **altı mutasyonu** koştu, beşi doğru yerde **EXIT 8 / FAIL** (üçü ajanın hiç dokunmadığı `download.js` · `provenance.js` · `web/lib/pdf-core.js`'te, biri `git archive` ağacına dize sabitini geri koyup vocab'ı **26→27 kırmızıya** düşürerek sebep-sonucu kapattı); ajana verilen **tek iş tek dosyada** kaldı (`5c9f844..HEAD` kaynak diffi yalnız `web/js/create.js`), yeni cephe açılmadı — **`F0-yesil` atıldı ve pushlandı, F2 açıldı** (kart `GECE7/F2.md`), gerekçe `GECE7/HAKEM-F0.md` 2. tur bölümü.

> ⚠ **Hakemin bulduğu, kartın sormadığı iki kalem — F2'ye zorunlu geçti:**
> (1) **K13** — `hemFlounce` `spec` varsayılanından silinince `KOKEN_ALANLARI`
> **38 → 37** düşüyor ve `indir_check` **EXIT 0** veriyor: sayıyı düşüren yolu
> hiçbir kapı tutmuyor (§10 hâlâ **10 eksenlik** referans spec üstünde koşuyor).
> Ajan o yolu kullanmadı, ama bir sonraki faz kullanabilir.
> (2) **K12** — `vocab_reference_check` **düz metni ve YORUMU da sayıyor**, ve
> **satır** sayıyor: hakem temiz ağaca tek bir yorum satırı ekleyip kapıyı
> `26 → 27` kırmızıya düşürdü. Kapının adı "kapalı enum cırcırı", işi **satır
> bazlı kelime sayacı**. Kusur kapının kendi kaynağında ilan edilmiş
> (`vocab_reference_check.sh:194`, *"bilerek onarilmadi"*), o yüzden ihlal
> sayılmadı — ama borç.
>
> ⚠ **İnen 7 dosyanın 5'i hâlâ SESSİZ** (hakem tek tek greple): yalnız
> `…-flat-koken.svg` ve `…-a4-koken.pdf` köken taşıyor; `a0.pdf` · `.dxf` ·
> düz `.svg` · `…-flat.svg` · `…-a4.pdf` **0 eşleşme**.

### Önceki hüküm (F0 1. tur, `cd3bea3`) — kayıt için duruyor

⛔ **KALDI** — inen dosya artık kökenini gerçekten söylüyor (hakem ölçtü: A4 kapağında `Origin / Köken` + 8 alan adı, PNG'si **göze bakıldı**; flat SVG kökünde `data-koken-cikarildi="8"`; sevk edilen kayıt **38 eksen**, 0 → 38; hakemin **beş mutasyonunun beşi** EXIT 8, ikisi ajanın hiç dokunmadığı `download.js`'te) ve `hedef_kosu` yeşil, altı sayı taban değerinde, taban el değmemiş — **ama ctest `7 failed out of 119`**: `vocab_reference_check` `hemFlounce` **26 → 27** ile kırmızı ve kart onu **"YEŞİL"** diye bildirmiş, oysa kartın kendi DEĞİŞMEZLER satırı *"yedinci ad = faz kapanmaz"* diyor; kusur `create.js:178`'deki **tek dize sabiti** olduğu ve fazın ürünü ölçüldüğü için **GERİ AL değil**, `F0-yesil` **atılmadı**, F0 **ikinci tur** açıldı (kart `GECE7/F0.md` sonunda), gerekçe `GECE7/HAKEM-F0.md`.

> 🚨 **KOŞU DIŞI, AMA ACİL (K10):** `nosey-dewdrop/stitchu` **PUBLIC** ve
> `patterns_real/` **41 dosyayla origin/main'de** — satın alınmış Buğra A0/A4
> PDF'leri anonim `curl` ile **HTTP 200** dönüyor. `CLAUDE.md`'nin *"repo
> private (doğrulandı)"* satırı bugün yanlış. F0'ın işi değil (`87fc9d5`),
> hakem tek taraflı kapatmadı: Pages canlı siteyi bu repodan yayınlıyor.
> **Damla kararı.**

## Açık kuyruk

`GECE7/DAMLA.md` — 4 soru, hepsi en kısıtlayıcı varsayımla ilerletildi, koşu durmadı.
F0 birinci turdan yeni soru çıkmadı (kart md.4 zaten en kısıtlayıcı davranışı
emrediyordu: kayıt bozuksa **dosya yazılmaz**).

**Devreden borç (26 Ağu, F2 2. tur sonrası): 26 madde** — F2 2. turun devrettiği 23 +
**K19** (cevap anahtarı korumasız, **F3 İŞ 0**) + **md.24** (`vocab` 10276 → 10281;
+5 satır önceki **hakemin** kendi commit'inden, hiçbir kart saymadı) + **md.25**
(yedek-5 bir kez koşuldu, **artık yedek değil**; havuzda kullanılmayan yalnız 4
fotoğraf kaldı: `11` `12` `30` `35`). Detay `GECE7/HAKEM-F2.md` 2. tur §11.

<details><summary>eski borç sayımı (F0 sonrası, kayıt için)</summary>

**Devreden borç: 18 madde** — F-İNDİR'in 9'u (`HAKEM-F-INDIR.md` sonu) +
F0'ın 6'sı (`GECE7/F0.md` md.10-15) + F0 2. tur hakeminin 3'ü (`KOKEN_ALANLARI`
38→37 kapısız düşüyor **K13** · `vocab_reference_check` satır sayacı **K12** ·
inen 7 dosyanın 5'i sessiz). Hiçbiri kapatılmadı, hiçbiri silinmedi.

⚠ **Hakemin bulduğu, kimsenin sormadığı iki kalem** (`HAKEM-F0.md` §9):
inen **5 dosyanın 3'ü hâlâ sessiz** (A0, DXF, düz `.svg` köken taşımıyor) ·
**§3.5'in "site son yeşil etiketten sevk edilir" kuralı KODDA YOK** —
`.github/workflows/pages.yml:23` `branches: [main]` diyor, yani **main'e her
push canlıya çıkıyor** ve şu an main **yedi kırmızıyla** yayında.

</details>

## Notlar

- GECE7/ 2026-08-26'da açıldı; önceki koşu klasörü `GECE/`.
- Damla'ya soru sorulmaz; `GECE7/DAMLA.md`'ye yazılır, varsayım karta işlenir.
- §3.8 md.1: **faz ajanı `contract/hedef-kosu-taban.json`'a dokunamaz.** Değiştiren hakemdir.
