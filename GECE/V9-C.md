# V9-C — KÂTİP 1 TUTANAĞI: `README.md` + `docs/ARCHITECTURE.md`

Koşu: 2026-08-25 · ağaç `main` · kapı `node engine/tests/docs_truth_check.mjs --no-baseline`
Kapıya, tabana, `contract/`'a, `engine/`'e, `web/`'e ve başka işçinin docs dosyalarına
**DOKUNULMADI** (`git diff --stat` bu turda yalnız iki dosya: `README.md`,
`docs/ARCHITECTURE.md`). Kapı değiştirilerek değil, METİN ONARILARAK yeşile alındı.

---

## 1. KAPI ÇIKTISI — ÖNCE ve SONRA (yalnız benim iki dosyam)

### ÖNCE (onarımsız ağaç)

```
IHLAL  docs/ARCHITECTURE.md:113  [byte-identical]
IHLAL  docs/ARCHITECTURE.md:121  [byte-identical]
IHLAL  docs/ARCHITECTURE.md:260  [byte-identical]
IHLAL  docs/ARCHITECTURE.md:3    -> PROJECT.md                        [TICK]
IHLAL  docs/ARCHITECTURE.md:3    -> PLAN.md                           [TICK]
IHLAL  docs/ARCHITECTURE.md:244  -> PLAN.md                           [TICK]
IHLAL  docs/ARCHITECTURE.md:249  -> engine/SPECS-next-vocabulary.md   [TICK]
IHLAL  docs/ARCHITECTURE.md:27   (D3 sağlayıcısız)
IHLAL  docs/ARCHITECTURE.md:119  (D3 sağlayıcısız)
IHLAL  README.md:64              (D3 sağlayıcısız)
```

| ölçü | ÖNCE | SONRA |
|---|---|---|
| D1 — `docs/ARCHITECTURE.md` | **3** | **0** |
| D1 — `README.md` | 0 | **0** (bozulmadı) |
| D2 — `docs/ARCHITECTURE.md` | **4** | **0** |
| D2 — `README.md` | 0 | **0** (bozulmadı) |
| D3 — `docs/ARCHITECTURE.md` | **2** | **0** |
| D3 — `README.md` | **1** | **0** |

### SONRA

```
$ node engine/tests/docs_truth_check.mjs --no-baseline | grep -E 'ARCHITECTURE\.md|README\.md'
(çıktı BOŞ)
```

Bu iki dosyadan gelen D1/D2/D3 ihlali **SIFIR**. Kapı hâlâ genel olarak kırmızı,
çünkü kalan borç başka işçilerin dosyalarında (`H1.0-KAPI`, `SATIS-SARTNAMESI`,
`G5-OMUZ-PLANI`, `KATMAN-HARITASI`, `docs/archive/mocks/`).

⚠ Genel toplamlar bu tur boyunca **oynadı** (D1 9→5, D2 9→1, D3 52→31), çünkü
V9-D/E/F aynı anda kendi dosyalarında çalışıyordu. Yukarıdaki tabloda yalnız
KENDİ iki dosyamın sayıları var; genel sayıya hüküm bağlamadım.

---

## 2. BU TURDA KOŞTURULAN ÖLÇÜMLER (sayı + onu basan komut)

| ölçü | komut | çıktı (25 Ağu 2026) |
|---|---|---|
| YENİ-9 — yüzey hattı WASM'de mi | `grep -c "surfacepattern\|flatten.cpp\|curvefit\|bodysurface\|garmentshell\|shellprojection" engine/build-wasm.sh` | **0** |
| aynı, karşı tanık | `grep -c "garment.cpp" engine/build-wasm.sh` | **2** |
| WASM kaynak listesi | `grep -o '[a-zA-Z0-9_/.-]*\.cpp' engine/build-wasm.sh \| sort -u \| wc -l` | **36** (35 × `src/` + `wasm/bindings.cpp`) |
| bundle boyutu | `ls -l engine/dist/stitchu-engine.js` | **1 253 817** bayt (09:17) — doküman 24 Ağu'yu 1 209 765 diye taşıyordu, +44 052 |
| Z-spread EU38 | `./engine/build/drape-preview recipes/skirt-aline-dart.json EU38 600 Front /tmp/d.svg` | `zSpreadMM` **174.3978**, `bodyRadiusMM` 143.2394, `bodyPenetrationMM` 0.0000 |
| Z-spread pear | aynı komut, `pear` | `zSpreadMM` **229.4973**, `bodyRadiusMM` 175.0704, `bodyPenetrationMM` 0.0000 |
| test girdi aralığı | `engine/tests/engine_check.cpp:30-44` | EU34…EU52 (10 çizelge gövdesi) + 5 kenar gövde = **15** |
| satılan beden aralığı | `contract/layers/shape-ratios.json` `sizes` | **8** (EU34…EU48) |
| ölü hedefler | `ls PROJECT.md PLAN.md engine/SPECS-next-vocabulary.md` | üçü de **YOK** |
| ölü hedeflerin ölüm commit'i | `git log --diff-filter=D --name-only` | `PLAN.md` → `e8d66a3` · `PROJECT.md` → `94c475e` · `SPECS-next-vocabulary.md` → `257f9bd` |
| `benchmark-58/` girdisi | `ls -d benchmark-58` + `find . -name manifest.json -path '*bench*'` | **YOK** (alet `engine/tools/benchmark-58.mjs` VAR) |
| `drape_check` kapısı var mı | `ctest --test-dir engine/build -N \| grep -i drape` | `Test #89: drape_check` — **VAR** |

---

## 3. KAPATILAN İHLALLER — SATIR SATIR, ÖNCE → SONRA

### D1 (duran iddia) — 3/3 kapandı

Üçü de `byte-identical`. Hiçbiri SİLİNMEDİ: üçü de **ölçülmüş bir KUSURU** anlatıyor,
o yüzden kart §3.6'nın izin verdiği biçime çevrildi (alet + tarih + kanıt yolu).

1. **`:113`** — ÖNCE: "`flat_expresses_spec_check` … measured that `sleeveStyle` set /
   raglan / puff produced **byte-identical** SVGs".
   SONRA: "…**was measured on 24 Aug 2026** and it printed the collapse: … came back
   **byte-identical** as SVGs … That is a dated reading of a DEFECT, not a standing
   property; evidence **`GECE/V4-B.md`**, and `ctest -R flat_expresses_spec_check` is
   what prints today's." (V4-B mtime 24 Ağu 19:36 ile tarih doğrulandı.)
2. **`:121`** — ÖNCE: "Run against `c396fb4`, all **10 style cells came back
   byte-identical** (`cmp`)". Satırda `GECE/` vardı ama TARİH yoktu.
   SONRA: "Run against `c396fb4` **on 24 Aug 2026** … — a dated reading of that board on
   that pair of commits, not a property of the pen; re-run it for today's."
   (V4-D mtime 24 Ağu 20:05.)
3. **`:260`** — ÖNCE: "The drafted geometry is byte-identical for shoulder values from
   20 to 80 cm (`GECE/V5-D.md`)". Yine `GECE/` var, tarih yok.
   SONRA: "That was **measured on 25 Aug 2026** and the reading was **byte-identical**
   drafted geometry across … — a dated sweep over one input, and a DEFECT rather than a
   guarantee." (V5-D mtime 25 Ağu 02:54.)

### D2 (ölü repo yolu) — 4/4 kapandı

Dördünde de hedef gerçekten YOK. Sahte referans düzeltilmedi — **dürüst yokluk ilan
edildi** ve VAR olan halefi gösterildi (kart §3.6 üçüncü madde).

4. **`:3` → `PROJECT.md` + `PLAN.md`** — ÖNCE: "Companion docs: `engine/FORMULAS.md` …,
   `PROJECT.md` (roadmap), `PLAN.md` (track A/B directives)" — ikisi de VAR gibi sunulmuş.
   SONRA: "…the two this line used to name alongside it … — **YOK**, neither does exist in
   this repo any more: `PLAN.md` was removed in `e8d66a3` and `PROJECT.md` in `94c475e`
   (the 29 Jul 2026 pivot…). Their live successors are `RULES.md` … and
   `flatten-research/FINDINGS.md` …; the deleted text is reachable only through `git show`."
   Halef yolların üçü de diskte doğrulandı (`ls`).
5. **`:244` → `PLAN.md`** — ÖNCE: "(discipline codified in `PLAN.md`)".
   SONRA: "That discipline used to be cited here as living in `PLAN.md`, which **YOK** …
   Its live home is **`RULES.md`**, 'Per-feature discipline (all 7 steps, in order)'".
   `RULES.md:25`'te o başlık birebir doğrulandı.
6. **`:249` → `engine/SPECS-next-vocabulary.md`** — ÖNCE: "(… is an UNVERIFIED agent draft
   — review before building)" → gözden geçirilecek dosya yok.
   SONRA: "That file **YOK**: it left the tree in `257f9bd` and **there is nothing to
   review** … no replacement document was written, so the next-vocabulary plan is
   genuinely absent rather than merely unlinked."

### D3 (sağlayıcısız sayı) — 3/3 kapandı

7. **`ARCHITECTURE:27`** — ÖNCE: "7 measurements plus percent ease … (underbust =
   bust − 70 mm, shoulder drop ≈ 13°) are flagged in `FORMULAS.md`". Sağlayıcı yok.
   SONRA: "… — an assumption is not a verified figure, and the three block quantities a
   publication does bind (scye depth, shoulder width, back-neck drop) are the ones
   **`ctest -R draft_math_check`** measures against Aldrich; the other assumptions are
   judged by nothing and are declared here for that reason (§13)."
   Uydurma alet YOK: `draft_math_check` §13'ün kendi anlatımında tam bu üç niceliği ölçüyor.
8. **`ARCHITECTURE:119`** — ÖNCE: "Waist: croquis 700.0 mm vs shell 725.0000 mm. Chest
   half-width: 219.90 mm vs 229.56 mm." Dört sayı, sıfır sağlayıcı.
   SONRA: "**`node engine/tests/flat_convention_check.mjs`** is the tool that prints this
   wing, and its **24 Aug 2026** reading was: … Those four numbers are a **dated report
   line, not a target** … the gate's exit code does not read them."
   §12 zaten wing 3d'nin bu kapıya ait olduğunu yazıyor; alet uydurulmadı.
9. **`README:64`** — Aşağıda, YENİ-11 kaleminde.

---

## 4. KARTIN "ÖZEL OLARAK ONAR" LİSTESİ — 5/5

**1. Y6b — `ARCHITECTURE` §6 matrisi (EU 34-52 / 70,200).** ÖNCE: "the matrix — EU 34-52 +
edge bodies × the full spec space = **70,200 drafts**, all must validate" —
`README.md:9`'un "EU34-48 … EU50 and EU52 are not claimed" cümlesiyle çelişiyordu.
SONRA iki aralık AYRILDI ve ikisi de kaynağına bağlandı:
- **TEST GİRDİ aralığı** = `engine/tests/engine_check.cpp:30-44` → EU34…EU52 + beş kenar
  gövde (`tall`, `petite`, `pear`, `apple`, `bigNeckSmallShoulder`) = 15 gövde,
  "chosen to stress the drafter, **not to be sold**".
- **SATILAN aralık** = EU34–48, `contract/layers/shape-ratios.json` sekiz beden yayınlıyor.
- 70,200 sayısı için alet adı yazıldı (`engine_check`) **ve** sayının bu turda
  üretilmediği açıkça ilan edildi: "the 70,200 figure this line used to assert as fact was
  **not re-derived on 25 Aug 2026** — the harness was not run this phase, so read the
  number off `ctest -R engine_check`". Harness'in kendi basma satırı da yol olarak verildi
  (`engine check: N drafts across B bodies x S specs`, `engine_check.cpp:147` — doğrulandı).
  ★ Çelişki ortadan kalktı, ama sayı DOĞRULANMADI olarak etiketli kaldı.

**2. YENİ-9 — sevk edilen motor.** Komut BUGÜN koşturuldu. `README.md:7` artık:
"…re-run on **25 Aug 2026** rather than quoted: `grep -c …` printed **0**, against
`grep -c "garment.cpp" …` = **2**", ve üçüncü tanık eklendi: kaynak listesi
`grep -o … | sort -u` = **36** dosya (35 `src/` + `bindings.cpp`), altısının hiçbiri yok.
Bu, V9-A §5'in "DOĞRULANMADI, bir sonraki tur ölçsün" dediği kalemin kapanmasıdır.

**3. YENİ-11 — `README:64` Z-spread.** Alet adı UYDURULMADI, ARANDI ve BULUNDU:
`engine/tools/drape-preview.cpp` `zSpreadMM`'i basıyor, kapısı `ctest -R drape_check`
(Test #89, `drape_check.cpp:142-143` tam "wrap is body-driven, not noise" iddiasını
yargılıyor). Sonra sayı BUGÜN yeniden ölçüldü ve **eski çift TUTMADI**:
- ÖNCE: "Z-spread is body-driven: EU38 **143 mm** vs. pear **238 mm**"
- SONRA: `zSpreadMM` **174.3978** (EU38) vs **229.4973** (pear), `bodyPenetrationMM`
  0.0000 — komut ve tarih cümlenin içinde.
- Eski sayı silinmedi, çürütüldüğü yazıldı; ★ **yan bulgu:** aynı EU38 koşusunun
  `bodyRadiusMM`'i **143.2394**, yani eski "143 mm" büyük ihtimalle Z-spread değil GÖVDE
  YARIÇAPI'ydı. Bu köken iddiası **DOĞRULANMADI** diye işaretlendi, kesin dille yazılmadı.

**4. K1 — `README:58` "27 of 54".** Alet aranıp bulundu (`engine/tools/benchmark-58.mjs`,
diskte VAR, `benchmark-58/manifest.json`'a karşı FULL/MISSING/WRONG sınıflıyor), **ama
girdisi diskte YOK**. Uydurma sağlayıcı yazmak yerine ikisi birden yazıldı: alet adı +
"**does not exist** in this repo … nobody can reproduce a score from a clean checkout".
Sayı çıkarılmadı, "runnable provider'ı olmayan bir okuma" olarak kayda geçirildi ve
manşetten indirildi. Benchmark'ın NE İÇİN olduğu cümlesi korundu.

**5. `ARCHITECTURE:53` bundle boyutu.** ÖNCE tek tarih (24 Ağu, 1 209 765 bayt).
SONRA iki okuma da duruyor: "1 209 765 bytes on 24 Aug 2026 …, and **1 253 817 bytes on
25 Aug 2026** (same command, artefact timestamped 09:17) — **+44 052 bytes in one day**.
Both readings are recorded because **the drift is the point**." Temiz checkout şerhi de
eklendi (artefakt gitignore'da).

---

## 5. TAŞINAN / SİLİNEN CÜMLE — **YOK**

`docs/archive/`'e hiçbir şey taşınmadı, **hiçbir cümle sessizce silinmedi**.
Onarılan 12 kalemin 12'sinde de eski iddia yerinde duruyor ve yanına ne olduğu yazıldı
("was measured on…", "does not reproduce and is corrected rather than deleted",
"used to assert as fact", "used to be cited here", "used to headline"). Bu bilinçli:
kart §3.6 sessiz silmeyi yasaklıyor, ve bir tanesi (Z-spread) fiilen ÇÜRÜTÜLDÜ —
çürüğün kendisi bilgi.

---

## 6. ONARAMADIĞIM / YARGILAMADIĞIM — SEBEBİYLE

1. **70,200 sayısı ÜRETİLMEDİ.** `engine_check` koşturulmadı (matris koşusu; V9-A
   §6B'ye göre `bugra_bridge_check` gibi kalemler dakikalarca sürüyor, kart 60 dk tavanı
   koyuyor). Sayı dokümanda **"not re-derived"** etiketiyle duruyor. Kapanması için
   `ctest -R engine_check` bir sonraki turda koşmalı.
2. **Eski Z-spread çiftinin (143/238) KÖKENİ doğrulanmadı.** 143 ≈ `bodyRadiusMM`
   örtüşmesi güçlü bir ipucu ama 238 için karşılığı bulamadım (pear `bodyRadiusMM`
   175.0704). Eski koşunun hangi reçete/parça/parametre ile yapıldığı bilinmiyor —
   ben `skirt-aline-dart.json` / `Front` / 600 mm kullandım, çünkü `drape_check`'in
   CMake'te bağlandığı reçete o (`CMakeLists.txt:604-605`). **DOĞRULANMADI.**
3. **"27 of 54" ve "37/54" sayıları yeniden üretilemedi** — girdi korpusu telifli ve
   repoda yok. Alet adı yazıldı, sayı etiketlendi; bundan fazlası bu repoda mümkün değil.
4. **D3'ün "biçim ölçer, doğruluk ölçmez" zaafı benim onarımımda da geçerli**
   (V9-B §3 md.1). `draft_math_check` ve `flat_convention_check.mjs` adlarını yazdım;
   ikisi de o satırdaki nicelikleri gerçekten ölçüyor (§13/§12'nin kendi anlatımıyla
   çapraz kontrol ettim), ama **ben o kapıları koşturup sayıları basmadım**.
5. **Kartın "D3 mümkün olduğunca düşsün" hedefi benim dosyalarımda TAM kapandı** (3→0);
   kalan D3 borcu başka işçilerin dosyalarında, dokunmadım.

---

## 7. KART DIŞI FARK EDİLEN (dokunmadım, yazıyorum)

1. ★ **V9-A §6B'nin bir satırı YANLIŞ.** Orada "**Z-spread 143 / 238 mm** → **ALET ADI
   YOK.** ctest'te `drape*` adlı kapı yok" yazıyor. Ölçtüm: `ctest --test-dir engine/build -N`
   → **`Test #89: drape_check`**, `engine/CMakeLists.txt:604`'te kayıtlı, ve
   `engine/tools/drape-preview.cpp` `zSpreadMM`'i doğrudan basıyor. Yani alet de kapı da
   VARDI. V9-A'nın "alet adı olmayan sayısal iddia: 4" sayısı bu yüzden **3** olmalı.
   V9-A benim dosyam değil, düzeltmedim.
2. **`engine/tests/.dtc_tmp_readonly.mjs`** çalışma ağacında untracked duruyor. Benim
   değil (ben yalnız `/tmp` altında çalıştım). Muhtemelen paralel bir işçinin geçici
   dosyası — `engine/tests/` altında olduğu için commit'e kaçarsa kapı dizinini kirletir.
3. **`README.md:7` ile `docs/ARCHITECTURE.md:137`/`:257` aynı iddiayı üç yerde taşıyor**
   (sevk edilen motor yüzey hattı değil). Üçü de doğru ama üç ayrı yerde bayatlayabilir;
   tek kaynağa indirilmesi ayrı bir iş, kart bunu istemedi.
4. **`engine/FORMULAS.md:1104`** 70,200 sayısını taşıyan tek diğer yer, ve kapı
   `engine/*.md`'yi TARAMIYOR (V9-B §3 md.7). Ben §6'yı düzelttim ama oradaki kardeş
   sayı kapının dışında kaldı — kapsam kararı, benim işim değil.
5. **`build-wasm.sh` 36 `.cpp` derliyor, docs iki yerde "35" diyor.** Fark
   `wasm/bindings.cpp` (35 tanesi `src/` altında). `README.md:7`'de ikisini de yazdım;
   `docs/ARCHITECTURE.md:257`'deki "compiles 35 `.cpp` files" cümlesi de aynı dosyada
   ama kapı ona ateş etmiyor — bıraktım, çünkü `src/` sayımı olarak okununca doğru.
