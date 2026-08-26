# HAKEM — F5-A (`rotate`) · **GEÇTİ**

> ⚠ Yargılanan **F5'in tamamı değil, alt-kart F5-A'dır** (§3.12). 15 operatörün
> **1'i** motorda. *"F5 bitti"* denmiyor ve bu hüküm öyle okunamaz.

Ağaç `main` @ `6e3dd1f`. Geri alma etiketi `F5A-oncesi` (`644eb92`).
Bu turda hakem **iş yapmadı, ölçtü** — ve tek bir istisnayla: paydayı mühürledi
(§3.8 md.1, aşağıda K31).

---

## 0. HÜKÜM VE GEREKÇESİ, TEK PARAGRAF

F5-A'nın kartı üç iş istedi (siluet kolu · `rotate` · kapanış betiği) ve üçü de
**ölçülerek** teslim edildi. Hakem, ajanın bildirdiği her sayıyı bağımsız olarak
tekrarladı: kartın istediği mutasyonu **kendi koşturdu ve kırmızı yandı**, kapıları
**sıfırdan derlenmiş temiz bir ağaçta** koşturdu, ve ajanın hiç açmadığı üç dosyadan
kendi mutasyonlarını yaydı. Ajan, kendi işini zayıflatan üç gerçeği **kendisi
bildirdi** (bayat `engine/build`, sevk edilen sınıfta pens olmaması, yanlış bir
`git stash pop`) ve kartın **yanlış bir şartını** ("çevre korunur") gevşetmek yerine
**hakeme getirdi**. Hakemin kendi mutasyonları üç boşluk buldu; hiçbiri ajanın bir
iddiasını **çürütmüyor**, üçü de F5B'nin zorunlu işidir. **GEÇTİ.**

---

## 1. AJANIN KENDİ BİLDİRDİĞİ İKİ ŞEY — İKİSİ DE DOĞRU ÇIKTI

### 1.1 🚨 `engine/build` bayat nesne taşıyordu — **DOĞRULANDI, ve düzelmiş**

Hakem `6e3dd1f`'i **ayrı bir worktree'ye** çıkardı ve
`cmake -DCMAKE_BUILD_TYPE=Release` ile **sıfırdan** derledi (⚠ boş
`CMAKE_BUILD_TYPE` tuzağına düşülmedi — CLAUDE.md, engine_check 19s→2684s).

```
garment_shell_check   temiz ağaç, sıfırdan Release derleme   ->  Passed  0.72 sec
```

**Yedinci kırmızı temiz ağaçta YOK.** Ajanın teşhisi (bayat/melez nesne) tutuyor.

**Ve F3'ün hükmü de düşmüyor — hakem bunu ölçtü, varsaymadı.** Temiz ağaçta tam
`ctest`in ilk turu **23 kırmızı** verdi; hepsinin kökü bulundu ve **hiçbiri kod
değildi**:

| kaç | sebep | kanıt |
|---|---|---|
| **17** | `engine/dist/` **gitignore'da** — wasm paketi temiz checkout'ta YOK | `emcc` ile `build-wasm.sh` koşuldu → 23 → **13** |
| **1** | `patterns_real/geometry/` **takipsiz** (K10) | kalem kopyalandı → `bugra_bridge_check` **Passed 72.09s** |
| **7** | `engine/pattern-bridge/.venv` **gitignore'da** | `dxf`·`nest_marker`·`tech_pack`·`edgemono`·`walkgate`·`cutplan`·`printpack_sheet`, hepsi **0.01–0.16 sn**'de düşüyor = girdisizlik |
| **6** | **MİRAS ALTI** | aşağıda |

**Yani: gitignore'daki girdiler tohumlandığında miras kırmızı TAM ALTI, temiz
ağaçta.** F3'ün "6 kırmızı"sı **artık temiz ağaçta doğrulanmıştır** — ajanın
haklı olarak "doğrulanmadı" dediği şey bu turda kapandı.

### 1.2 🚨 Sevk edilen sınıfta pens YOK — **DOĞRULANDI, kelimesi kelimesine**

Temiz ağaçtaki ikiliden, hakemin kendi koşumu:

```
sinif  {'garment': 'top', 'shaping': 'dart', 'fabric': 'woven'}   panel 8
left_ftorso 0 · right_ftorso 0 · left_btorso 0 · right_btorso 0
left_skirt_front 0 · right_skirt_front 0 · left_skirt_back 0 · right_skirt_back 0
```

**8/8 panel `pens: 0`.** → **K28** (aşağıda): K27'nin 1. dayanağı **düzeltildi**,
operatör seçimi **değişmedi**, ve sebebi bir sayı.

---

## 2. AJANIN İDDİALARI — HAKEM TEKRARLADI

### 2.1 İŞ 0 / K24 — **hakem mutasyonu KENDİ koşturdu: KIRMIZI** ✅

Ajanın loguna güvenilmedi; `projectBack := projectFront` hakem tarafından
**baştan** uygulandı, nesne silindi, yeniden derlendi, `shasum` alındı:

```
taban    ikili bc9ceda72237  düğüm 0c1d52866882ce53   tek_nesne_check EXIT 0
mutant   ikili a7b677c75d2f  düğüm 05cc559aa219ccdb   tek_nesne_check EXIT 1  🔴
geri     ikili bc9ceda72237  düğüm 0c1d52866882ce53   tek_nesne_check EXIT 0
```

İkili **gerçekten kımıldadı** (bayat-ikili tuzağı elendi), düğüm **gerçekten
kımıldadı**, kapı **gerçekten kırmızı yandı**. **K24 KAPANDI.**

▸ Ajanın mutasyon betiği (`f5a.mutasyon.sh`) **okundu ve doğru bulundu**: her turda
nesneyi siliyor, `shasum` karşılaştırıyor, `cmp` ile kaynağın gerçekten değiştiğini
kontrol ediyor, kımıldamazsa **"HUKUM YOK"** yazıyor. Logdaki `ikili` alanı **iki
hash'in birleşimidir** (`seam-plan` + `rotate-op`, betiğin 30. satırı) — bu yüzden
M4/M5'te ilk 8 karakter aynı görünüyor ve bu bir çelişki değil. *Logda bu
yazmıyordu; hakem kaynaktan okudu.*

### 2.2 `op.rotate` motorda — ✅ **ve canlı paneli GERÇEKTEN kullanıyor**

`rotate_check.mjs` okundu: R0–R7, gerçek değişmezler (ALAN · PENS AÇISI · TRUE
BACAKLAR birebir; çevre bir **kimlik** olarak; kendini kesme; ve R7 "geometri
gerçekten oynadı"). Eşikler 1e-6…1e-9. **Bu bir kapı, bir cümle değil.**

Hakemin **HM2**'si (aşağıda) `rotate-op`'un canlı geometriye bağlı olduğunu kanıtladı:
vücut ölçüsü değişince apeks derinliği **289.1484 → 289.1527mm** oynadı. Yani panel
sentetik değil, sevk edilen plandan geliyor.

### 2.3 Kartın "çevre korunur" şartı **YANLIŞTI — ajan haklı** ✅

Ajan eşiği gevşetmedi, **yanlış eşiği kurmadı** ve hakeme getirdi (§3.8 md.4).
Gerekçesi geometrik olarak doğrudur: belde duran bir göğüs pensi kol oyuğundakinden
uzundur (289.1484 → 206.9 / 123.9 / 107.9mm), rijit hareketin koruduğu nicelikler
alan/açı/bacaklardır. **Kart düzeltildi → K29.** Bu, ajanın bu turdaki **en
doğru davranışıdır**: kapı yanlışsa hakeme gelinir.

### 2.4 Kapılar — **hepsi hakem tarafından, TEMİZ AĞAÇTA koşuldu**

| kapı | hakem ölçümü |
|---|---|
| `ctest` (temiz ağaç, tohumlanmış) | **6 failed / 122** — miras altı, yedinci ad YOK |
| `tek_nesne_check` | Passed 19.20 sec |
| `rotate_check` | Passed 4.78 sec |
| `expressability_check` | Passed 0.05 sec |
| `garment_shell_check` | **Passed** 0.72 sec (7. kırmızı yok) |
| `vocab_reference_check` | `HUKUM: YESIL` · 37 eksen + 92 kelime · **10306** |
| `indir_check` | EXIT 0 |
| `hedef_kosu` | EXIT 0 · **CIRCIR SAĞLAM** |
| `python3 -m pytest -q` | **33 passed** |
| `git status` | temiz (yalnız 3 takipsiz `patterns_real` kalemi) |

`ctest` son satırı, **kopyalandı**:

```
95% tests passed, 6 tests failed out of 122
The following tests did not run:   107 - h10_gate_check (Disabled)
The following tests FAILED:
	  9 - flat_pattern_agree_check      16 - flat_artifact_census
	 17 - style_check                   24 - sizechart_source_check
	 95 - contract_check               101 - figure_check
```

▸ `122`, `123` kayıtlı testin **DISABLED olanı düşülmüş** hâlidir (K18 korunuyor).
Kartın "120 → 122"si doğrudur.

### 2.5 Kapsam — **taşma YOK**

```
git diff --stat F5A-oncesi..HEAD   ->  17 dosya, hepsi kart içi
```

- `contract/hedef-kosu-taban.json` blob **`cf2af8c7d3c4603eee5aea252f3568feedda8d10`** — **el değmemiş** (iki uçta birebir).
- `vision/eval/` — **tek bayt yok**. Cevap anahtarı mührü (K19) **oynatılmamış**.
- `KOSU-v7.md` — **tek bayt yok** (K26).
- `patterns_real/` — **PUSHLANMADI.** Üç kalem takipsiz duruyor, `git add` görmedi (K10).
- Holdout `11` `12` `30` `35` — **harcanmadı**; tabanda `kullanilmayan_4` olarak duruyor.
- Diğer operatörlere **girilmedi**: `op.rotate` dışında hiçbir `op.*` `motorda_kapi` almadı (yedisi de `null`, hakem doğruladı).

---

## 3. HAKEMİN KENDİ MUTASYONLARI — HM-F5A (§3.8 md.3)

**Üçü ajanın HİÇ AÇMADIĞI dosyalarda.** Her turda nesne silindi, yeniden derlendi,
`shasum` alındı; ağaç sonunda temiz.

| | mutasyon (dosya) | ikili | düğüm | kapı |
|---|---|---|---|---|
| **HM1** | `surfacepattern.hpp` — `bodiceApexFrac 0.80 → 0.60` *(ajan açmadı)* | `bc9ceda7…`→`fd3147a3…` | **değişmedi** | rotate ✅ · tek_nesne ✅ |
| **HM2** | `bodysurface.cpp` — `kWaistToHipMM 205 → 215` *(ajan açmadı)* | `bc9ceda7…`→`433a949e…` | `0c1d5286…`→`647f0f52…` | rotate ✅ · tek_nesne ✅ |
| **HM3** | `shellprojection.cpp` — `bust_circumference` artık **BELİN** çevresini basıyor *(ajan açmadı; M1/M2'den başka yüzey)* | `bc9ceda7…`→`d7904338…` | `0c1d5286…`→`6a02dac2…` | rotate ✅ · tek_nesne ✅ |
| **HM4** | `expressability_check.mjs` — paydadan `freesewing-bella` **silinir** | — | — | ✅ **H8-İFADE 5/5 → 4/4** |
| **HM5** | `expressability_check.mjs` — `stitchu-sheath-eu38` yalnız `op.rotate` istesin | — | — | ✅ **H8-İFADE 5/5 → 4/5** |

### 🚨 HM1 — **KÜNYE BAĞLI DEĞİL, KOPYALANMIŞ BİR SAYI** (yeni boşluk)

`rotate-op.cpp:48` şunu taşıyor:

```cpp
constexpr double kApexFracOfPanel = 0.80;  // SheathOptions::bodiceApexFrac
```

Motordaki `bodiceApexFrac` **0.60'a çekildiğinde** `rotate-op` hâlâ `0.80` ve
`apeks_derinlik_mm 289.1484` basıyor. Yani kartın *"apeks 0.80 = motorun kendi
ilan ettiği kesir"* cümlesi bir **yorum satırıdır**, bir okuma değil. Sayı bugün
doğru; **künye sahte değil ama bağlı da değil**, ve motor tarafı kayarsa kapı
sessizce yalan söyler. → **K30**, F5B'nin İŞ 0'ı.

*(Düğümün kımıldamaması ayrıca K28'i doğruluyor: pens üretilmediği için apeks
satırının siluete hiçbir etkisi yok.)*

### 🚨 HM3 — **KİMLİK KAPILI, DOĞRULUK KAPISIZ** (yeni boşluk)

Teknik çizim kullanıcıya **büst çevresi diye belin çevresini** yayınlıyor. Düğüm
kımıldıyor (K24 çalışıyor: nesne değişti, kimlik bunu gördü) ama **iki kapı da
yeşil**. `tek_nesne_check` *"flat ile kalıp AYNI nesneden mi çıktı"* sorusunu
tutuyor; *"yayınlanan sayı DOĞRU mu"* sorusunu **hiçbir kapı tutmuyor**.

> Bu, K24'ün doğal devamıdır ve F3→F5-A hattının bulduğu şeyin bir üst katıdır:
> **kimlik kuruldu, doğruluk kurulmadı.** İnen dosyada yanlış bir ölçü, bugün
> sessizce sevk edilir. → **K30**, F5B'nin İŞ 0'ı.

### 🚨 HM4 / HM5 — **H8-İFADE'NİN PAYDASI DARALTILABİLİYORDU** (§0B) — **HAKEM KAPATTI**

Bu betiğin **kendi başlığı** H8-SÖZLÜK için *"sözlük daraltılarak düşürülebilir,
bu §0B'nin reward-hacking maddesidir"* diye uyarıyor. Ölçüldü: **aynı tuzak bir
üst katta tekrar ediyordu.** Ajan sayacın **PAY** tarafını doğru korumuştu
(`motorda_kapi` ↔ `add_test` kesişimi; kendi mutasyonu M6 orayı kırmızı yakıyor);
korunmayan taraf **PAYDAYDI**.

**Hakem müdahalesi (§3.8 md.1 — taban ve kapı tanımı yalnız hakemin):**
`expressability_check.mjs`'e **`TABAN_PAYDA` mührü** ve iki yönlü bir kapı kolu
eklendi. Doğrulandı:

```
taban            EXIT 0 (YESIL)
HM4 tekrar   ->  FAIL PAYDA DARALDI: mühürlü giysi "freesewing-bella" DÜŞMÜŞ   EXIT 1 🔴
HM5 tekrar   ->  FAIL PAYDA DARALDI: "stitchu-sheath-eu38" ... op.split, op.suppress  EXIT 1 🔴
geri alindi      EXIT 0 (YESIL)
```

Payda **büyüyebilir, daralamaz**. Eşik **gevşetilmedi**; kapı **sıkıldı**. → **K31**.

---

## 4. CIRCIR — F5'İN HANESİNE F5-A NE YAZDI?

Hakem `hedef_kosu`'yu kendi koşturdu. **`CIRCIR SAĞLAM` — hiçbir sayı kötüleşmedi.**

| sayı | taban (n=5) | **F5-A sonrası (n=5)** | hüküm |
|---|---|---|---|
| H1 | 5/5 | 5/5 | tavan (K25) |
| H2 | %95.2 (40/42) | %95.2 (40/42) | aynı |
| H3 | 2 | 2 | aynı |
| **H4** | ÖLÇEMEDİM | **ÖLÇEMEDİM** | **KIMILDAMADI** |
| **H5** | 0 / **5 ölçülebilen çift** | **0 / 5** | **payda BÜYÜMEDİ → kazanım yazılmadı** |
| **H8-sözlük** | **31** (26+5) | **31 (26+5)** | **kötüleşmedi; sözlük DARALTILMADI** |
| **H8-ifade** | **YOK (betik yoktu)** | **5 / 5**, payda **adlı ve artık MÜHÜRLÜ** | **İLK ÖLÇÜM — taban kuruldu** |
| H10 | %58.3 (70/120) | %58.3 (70/120) | aynı |
| H10a | %17.5 | %17.5 | cırcıra bağlı değil (K21) |
| **H10b** | **%40.0 (48/120)** | **%40.0 (48/120)** | **§0B tavanı KIMILDAMADI** |
| H10e | 3 | 3 | aynı |
| H10x | %0.8 (1/120) | %0.8 (1/120) | aynı |
| H11 | 3.1 ms | **4.0 ms** medyan (en kötü 39.1) | <10 sn tavanının **2500 katı** altında |

**HEDEF SETİ (n=10), cırcırsız, harmanlanmadı:** H1 **10/10** · H8-sözlük **61**
(51+10) · H10 %64.4 · H10a %29.7 · H10b %33.1 · H10e 5 · H10x %1.7 · H11 3.3 ms.

### Cevap: **H4 ve H5 KIMILDAMADI. F5-A F5'in hanesine BİR sayı yazdı: H8-ifade'nin tabanı.**

Ve bu **eksiklik değil, kartın kendi tarifi**:
- **H5**: kartı yazan hakem *"payda büyümeden 0→0 bir kazanım DEĞİLDİR"* diye
  şart koşmuştu. Ajan paydayı büyütmedi ve **kazanım yazmadı**. `rotate` panel
  geometrisi üstünde çalışır, kalıba yeni **kenar rolü** ilan etmez — H5'i
  kımıldatmak `armhole↔sleeve_cap` dışına çıkmayı gerektirir, o da bu alt-kartın
  operatörü değildir.
- **H4**: kart *"H4'ü ölçülebilir yapmak **F5'in** işidir"* diyor — **F5-A'nın**
  değil. Ajan `SurfaceStitch`'e `reason` eklemedi ve **eklediğini iddia etmedi**;
  `Kind` (Waist/Princess/Side/Dart/Shoulder/Opening) bir **topoloji** etiketidir,
  §F5'in istediği **sebep** katmanı değil. Teşhis doğrudur.
- **H8-ifade**: bugün **5/5** — yani **hiçbir gerçek giysi çevrilemiyor**. Bu, bir
  alt-kartın verebileceği en dürüst ilk sayıdır ve **kuyruğu adıyla** basıyor.

> **Bir alt-kart bir operatör kapatır** (§3.12). F5-A 15'in **1'ini** kapattı ve
> hanesine yazdığı şey bir **taban**dır. Cırcırın kalan on iki sayısı **kötüleşmedi**.

---

## 5. SAPMA SORUSU — hakem ölçtü

> *"Bir yabancı fotoğraf yükleyip kalıp + flat indirebiliyor muyum, ve gerçek bir
> giysiden `rotate` gerektiren bir kalemi operatör programına çevirebiliyor muyum?"*

**Birinci yarı — motorda EVET, tarayıcıda hâlâ DOĞRULANMADI.** `indir_check` EXIT 0,
`hedef_kosu` H1 **10/10 (n=10)**. Ama inen dosya bir **DOM saplaması** üstünden
ölçülüyor; **gerçek tarayıcıda hiç tıklanmadı** (yedi fazdır, headless harness yok).
F5-A bunu iyileştirmedi ve **iyileştirdiğini söylemedi**. Doğru davranış.

**İkinci yarı — KALEM evet, GİYSİ hayır, ve ikisinin de sayısı var.**
`rotate` canlı `SeamPlan`'ın `left_ftorso` panelini **üç ayrı hedef kenara** taşıyor,
alan/açı/TRUE bacaklar **0.000000000**, çevre kimliği **0.000000000mm** artıkla,
hiçbiri kendini kesmiyor, ve iki mutasyon kapıyı kırmızı yakıyor. Ama
**H8-ifade 5/5**: hiçbir gerçek giysi çevrilemiyor, çünkü en çok bloke eden ikisi
(`op.split` 4 giysi, `op.suppress` 4 giysi) **motorda yok**.

**🚨 Ve 2 no'lu kalem tam buraya çarpıyor, hakem bunu yumuşatmıyor:** sevk edilen
`top/dart/woven` sınıfının **8/8 panelinde pens yok**. `rotate` bir pens
transferidir; bugün **sevk edilen giysinin taşıyacağı bir pensi yok**. Operatör
**gerçek, kanıtlı ve canlı panel üstünde** çalışıyor — ama transfer ettiği pens bir
**`op.suppress` fikstürüdür**, ürünün kendi pensi değil. **`rotate` bugün ürüne
DEĞMİYOR** (borç md.37: `draftJSON`/web hattına bağlı değil, kullanıcı bir pensi
taşıyamıyor). → **K28**.

---

## 6. HAKEMİN ÖLÇEMEDİKLERİ / DOĞRULAYAMADIKLARI

1. **`freesewing-bella` / `freesewing-aaron` gereksinimleri — DOĞRULANMADI.** Ajan
   bunu kendi bildirdi (madde 5) ve hakem de doğrulayamadı: FreeSewing deposu bu
   makinede yok, yayınlanmış parça listeleri **görülmedi**. Payda 5'in **2'si**
   künyesiz. Diğer üçü (iki Buğra + `stitchu-sheath-eu38`) **ölçülmüştür**.
2. **`patterns_real/geometry/geometry-full.json` TAKİPSİZ** — künyeler onu anıyor,
   betik onu **okumuyor**. Temiz checkout'ta parça adları doğrulanamaz. **DOĞRULANMADI.**
3. **Gerçek tarayıcı — DOĞRULANMADI**, yedi fazdır (madde yukarıda).
4. **`GarmentSurf` kopyalanması (borç md.31)** — F5-A dokunmadı, hakem de ölçmedi.
   **DOĞRULANMADI.**
5. **wasm ↔ native düğüm eşitliği** — ajan ölçtüğünü yazdı; **hiçbir kapı bunu
   tutmuyor** (`tek_nesne_check.mjs`'te wasm kolu **yok**, hakem grepledi).
   Hakem bunu bağımsız koşturmadı. **DOĞRULANMADI** → F5B notu.

---

## 7. HÜKÜM

# ✅ **GEÇTİ** — alt-kart F5-A (`rotate`). Etiket: `F5A-yesil`.

**F5 SÜRÜYOR.** 15 operatörün **1'i** motorda; 14'ü kuyrukta ve **adlarıyla basılı**.
Sıradaki alt-kart **`GECE7/F5B.md`**, operatörü **ölçülen sayıya** bağlandı.
