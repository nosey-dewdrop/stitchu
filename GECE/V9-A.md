# V9-A — BUGÜNKÜ SAYIM (ölçüm, onarım YOK)

Koşu: 2026-08-25 · ağaç `main` @ `a6689ef` · kapsam `docs/**` (archive dâhil) + `README.md`.
`web/` V10'un işi, dokunulmadı. **Hiçbir `docs/`, `README.md`, `web/`, kod, `contract/`,
`engine/` dosyası DEĞİŞTİRİLMEDİ** — tek yazılan yer `GECE/V9-A.md` + `GECE/log/V9-A.*`.

Girdi `GECE/V0-0C.md` (24 Ağu). **Devralınmadı, tazelendi.** Aradaki 9 `docs:` commit'i
(`65bca82 … 6c90b58`) ağacı ciddi biçimde değiştirdi, o yüzden 0C'nin docs sayıları
BAYAT çıktı ve aşağıda tek tek "0C: X → bugün: Y" diye yazıldı.

---

## 1. TOPLAM SAYIM

Betik: `GECE/log/V9-A.census.py` (0C §0.1'in AYNISI, tek fark kapsam satırı:
`web/**/*.html` çıkarıldı, `docs/**/*.md` + `README.md` kaldı).

```
python3 GECE/log/V9-A.census.py
→ 7 238 238 7
```

| ölçü | bugün | 0C (24 Ağu, docs+web+README) | basan komut |
|---|---|---|---|
| taranan dosya | **7** | 134 (kapsam farklı) | `GECE/log/V9-A.census.py` |
| TOPLAM iddia cümlesi (N) | **238** | 1248 (kapsam farklı) | aynı |
| TEKİL iddia cümlesi | **238** | 782 | aynı |
| iddia taşıyan dosya | **7** | 127 | aynı |

★ **Bulgu: docs tarafında TOPLAM = TEKİL (238 = 238).** Web'de 1248→782 düşüren şey
şablon tekrarıydı (`web/styles/*.html` aynı cümleyi 23 kere basıyor). `docs/` içinde
kopyala-yapıştır iddia cümlesi **sıfır**. Bu, docs'un web'den farklı bir onarım
problemi olduğu anlamına gelir: 238 cümlenin her biri ayrı ayrı okunmak zorunda,
tek bir şablonu düzeltip 23 sayfayı kurtarma yolu YOK.

Dosya başına (tam liste, 7 dosyanın 7'si):

```
104 docs/ARCHITECTURE.md
 54 docs/H1.0-KAPI.md
 32 README.md
 23 docs/SATIS-SARTNAMESI.md
 12 docs/G5-OMUZ-PLANI.md
 10 docs/loop-engineering.md
  3 docs/KATMAN-HARITASI.md
```

**0C → bugün, dosya başına:**

| dosya | 0C | bugün | delta | not |
|---|---|---|---|---|
| `docs/ARCHITECTURE.md` | 28 | **104** | +76 | 267 satıra büyüdü; V2–V7 fazları yazıldı |
| `docs/H1.0-KAPI.md` | 54 | **54** | 0 | sayı sabit, ama başına DEVRE DIŞI şerhi eklendi (§4) |
| `README.md` | 22 | **32** | +10 | 82 satır; RULES §6 onarımları cümle uzattı |
| `docs/SATIS-SARTNAMESI.md` | 19 | **23** | +4 | 321 satır |
| `docs/G5-OMUZ-PLANI.md` | (0C'nin ilk-12'sinde yok) | 12 | — | 0C yargılamadı |
| `docs/loop-engineering.md` | (yok) | 10 | — | 0C yargılamadı |
| `docs/KATMAN-HARITASI.md` | (yok) | 3 | — | 0C yargılamadı |

⚠ **Sayaç yönü ters:** RULES §6 onarımları iddia cümlesi sayısını DÜŞÜRMÜYOR,
YÜKSELTİYOR — çünkü "0.00 mm" yerine geçen cümle emekli edilen sayıyı tırnak içinde
taşıyor ve üstüne bir alet adı + tarih ekliyor. 238 sayısı bir sağlık göstergesi
DEĞİLDİR; kapı buna eşik koyarsa yanlış yöne bastırır (§7 kapı notu).

---

## 2. DURAN-İDDİA TARAMASI (RULES §6)

Basan komut (kartın istediği kalıp listesi, aynen):

```
grep -rnoE "ALL PASS|0\.00 ?mm|0\.0000 ?mm|byte-identical|bayt bayt|zero issues|zero failures|zero validation issues|hatasız|bitti|hazır|none known|validator[- ]clean" docs/ README.md
```

Ham çıktı (tam satırlar dâhil): `GECE/log/V9-A.standing.txt`

| kalıp | bugün | 0C (docs+web) |
|---|---|---|
| `byte-identical` | **5** | 254 |
| `0.00 mm` | **3** | (boşluklu, 5 dosyada) |
| `bitti` | **3** | 7 |
| `bayt bayt` | **3** | 3 |
| `validator clean` | **1** | — |
| `0.0000mm` | **1** | 1 |
| `ALL PASS` | **0** | 1 |
| `hazır` · `hatasız` · `zero issues` · `zero failures` · `none known` | **0** | 42 / 0 / 36 / — / — |
| **HAM TOPLAM** | **16** | 344 |

Dosya başına: `docs/ARCHITECTURE.md` 6 · `README.md` 3 · `docs/SATIS-SARTNAMESI.md` 2 ·
`docs/KATMAN-HARITASI.md` 2 · `docs/H1.0-KAPI.md` 2 · `docs/archive/mocks/babyblue-stil-1.html` 1.

### 2A. GERÇEK DURAN İDDİA — **3** (yanlış pozitif düşülmüş)

| dosya:satır | tam satır (kısaltılmış) | gerekçe |
|---|---|---|
| `docs/SATIS-SARTNAMESI.md:243` | "…**0.0000mm** eşleşiyor — uyarı metin değil, **geometriye bağlı**." | RULES §6 yasaklı sabit sayı; satırda onu BASAN alet adı yok |
| `docs/SATIS-SARTNAMESI.md:311` | "Motorun bu şartnameye borcu **bitti**: §2 6/6 · §3 4/4 · §4 4/4 · §4b 1/1." | RULES §8 "blanket done" yasağı; ayrıca aynı dosya §1'de **5/5 EKSİK** diyor → dosya kendi içinde çelişiyor |
| `docs/archive/mocks/babyblue-stil-1.html:108` | "`0.00 mm seam match` / `70,200-draft matrix`" | ARŞİV mock pazarlama metni. Canlı yüzey değil ama `docs/` ağacında duruyor ve kartın kapsamına giriyor |

### 2B. YANLIŞ POZİTİF — **13**, gerekçesi tek tek

| dosya:satır | neden yanlış pozitif |
|---|---|
| `docs/ARCHITECTURE.md:43` | emekli edilen cümleyi ALINTILIYOR: "the standing 'worst pair is now 0.00 mm' wording **was replaced** on 24 Aug 2026 under RULES §6" |
| `README.md:48` | aynı sınıf: "The standing 'worst pair 0.00 mm' line **was replaced**…" |
| `docs/ARCHITECTURE.md:113` | "byte-identical SVGs" = ÖLÇÜLEN KUSUR (sessiz çökme). Kapı adı `flat_expresses_spec_check` yanında |
| `docs/ARCHITECTURE.md:121` | "10 style cells came back byte-identical (`cmp`)" = `c396fb4`'e karşı TARİHLİ ölçüm, alet `flat-board.mjs` |
| `docs/ARCHITECTURE.md:255` | aynı ölçümün tekrarı, kanıt yolu `GECE/V4-D.md` §1 |
| `docs/ARCHITECTURE.md:260` | "`body.shoulder` is a dead input … byte-identical for 20–80 cm" = ölçülen KUSUR, kanıt `GECE/V5-D.md` |
| `README.md:51` | aynı kusurun anlatımı; kapı adı `flat_expresses_spec_check` |
| `README.md:18` | düzeltme anlatımı ("the earlier wording contradicted … corrected on 24 Aug 2026") |
| `docs/KATMAN-HARITASI.md:47` | TR "bayt bayt AYNI" = 10 hücrelik tarihli pano ölçümü |
| `docs/KATMAN-HARITASI.md:74` | TR "bayt bayt aynı" = ölü girdi kusuru, kanıt `GECE/V5-D.md` |
| `docs/H1.0-KAPI.md:15` | TR: "Bu dosya H1.0'ın **'bitti' tanımıdır**" — tanım cümlesi, bitmişlik iddiası değil |
| `docs/H1.0-KAPI.md:16` | TR: "iş **bittiğinde** hangi sayının…" — şart cümlesi |
| `docs/ARCHITECTURE.md:121` (`bayt bayt`) | pano hücrelerinin çıktı etiketi; aynı satır "does not affect its exit code; it is an instrument, not a gate" diyor |

Hit'lerin tam dağılımı (16 = 3 gerçek + 13 yanlış pozitif) doğrulandı:
`byte-identical` 5 = ARCH:113,121,255,260 + README:51 · `0.00 mm` 3 = ARCH:43, README:48,
archive:108 · `bitti` 3 = SATIS:311, H1.0:15,16 · `bayt bayt` 3 = ARCH:121, KATMAN:47,74 ·
`validator clean` 1 = README:18 ("validator cleanliness") · `0.0000mm` 1 = SATIS:243.

**Gerçek duran-iddia (yanlış pozitif düşülmüş): 16 − 13 = 3.**
Canlı docs yüzeyinde ise **2** (arşiv mock'u hariç), ve **ikisi de aynı dosyada**:
`docs/SATIS-SARTNAMESI.md`.

★ **Kapı tasarımı için kritik bulgu:** 13 yanlış pozitiften **2'si** (`ARCH:43`, `README:48`)
emekli edilen cümleyi TIRNAK İÇİNDE taşıyor; kalan 11'i tarihli ölçüm kaydı ya da
Türkçe tanım cümlesi. Düz `grep` tabanlı bir `docs_truth_check` **13'ünün hepsine** ateş
eder ve RULES §6 onarımını CEZALANDIRIR. Kapı, (a) tırnak/kod-span içindeki hit'i ve (b) aynı satırda
`replaced|was measured|GECE/|ctest|node engine/tools/` + bir tarih geçen hit'i düşürmek
zorunda. Aksi hâlde doğru davranışın maliyeti kırmızı olur.

---

## 3. ÖLÜ LİNK / ÖLÜ REFERANS TARAMASI

Betik: `GECE/log/V9-A.links.py` · ham çıktı: `GECE/log/V9-A.links.txt`

Yöntem: `docs/**` + `README.md` altındaki her **prose** dosya (`.md`, `.html`, arşiv dâhil).
Her satırda (a) markdown linki `[x](y)`, (b) yol görünümlü her backtick dizesi.
Diske vurmadan önce normalize: sondaki `:12` / `:12-17` / `:68,75,80` satır referansları
atılır, `a.{hpp,cpp}` küme parantezi açılır (üyelerin HEPSİ var olmak zorunda), `*` glob
çözülür, `/` içermeyen aday BASENAME olarak repoda aranır (`build/`, `node_modules/`,
`.git/`, `.venv/`, `third_party/` hariç). Çözüm hem repo köküne hem dosyanın kendi
dizinine göre denenir.

```
--- SCOPE: 49 files under docs/** + README.md; 18 prose files scanned, 31 skipped ---
--- REFS: 502 checked · VAR 468 · YOK 34 ---
--- DEAD by kind: MDLINK 0 · TICK 34 ---
```

Atlanan 31 dosya, sebebiyle: 22 ikili/veri (`.png`, `.pdf`, `.svg`, `.json`) ve
**9 kod dosyası** (`docs/archive/tools/*.mjs|*.js`). Kod dosyalarındaki backtick'ler
JS template literal'leri (`` `</g>` ``, `` `stroke-linejoin="round"/>` ``), repo referansı
değil — ilk koşuda 177 sahte "ölü link" üretmişlerdi, o yüzden kapsam dışına alındı ve
sebebi log'a basıldı.

★ **Tıklanabilir ölü markdown linki: 0.** 0C'nin tek gerçek md linki (`README.md:30 →
docs/RECETE-SPEC.md`) kapatılmış. 34 ölü hedefin **hepsi** backtick referansı.

### 3A. GERÇEK ÖLÜ — repo içi, VAR gibi sunulan — **5**

| dosya:satır | hedef | VAR/YOK | not |
|---|---|---|---|
| `docs/ARCHITECTURE.md:3` | `PROJECT.md` | **YOK** | "Companion docs: … `PROJECT.md` (roadmap)" — 0C'de de vardı, kapanmadı |
| `docs/ARCHITECTURE.md:3` | `PLAN.md` | **YOK** | "(track A/B directives)" — 0C'de de vardı |
| `docs/ARCHITECTURE.md:244` | `PLAN.md` | **YOK** | "discipline codified in `PLAN.md`" — 0C'nin `:74`'ü, satır kaydı |
| `docs/ARCHITECTURE.md:249` | `engine/SPECS-next-vocabulary.md` | **YOK** | "is an UNVERIFIED agent draft — review before building" → gözden geçirilecek dosya diskte yok |
| `docs/H1.0-KAPI.md:20` | `engine/tests/h10_gate_check.cpp` | **YOK** | diskte `engine/tests/h10_gate_check_LEGACY.cpp`. 0C'de de vardı |

### 3B. ÖLÜ REFERANS — repo dışı, diskte yok — **2**

| dosya:satır | hedef | not |
|---|---|---|
| `docs/H1.0-KAPI.md:162` | `reports/2026-07-29-endustri-arastirmasi.md` | `~/damla_projects_2026/reports/` altında **YOK** (yoklandı) |
| `docs/SATIS-SARTNAMESI.md:29` | `reports/2026-07-19-stitchu-f0-gusto-korpus.md` | aynı, **YOK** |

İkisi de 0C'de vardı, ikisi de kapanmadı.

### 3C. YANLIŞ POZİTİF — **27**, gerekçesiyle

**(i) Çözücü artefaktı — 15.** Hedef gerçekte VAR, betiğin kökü yanlış:

| dosya:satır | hedef | gerçek yol |
|---|---|---|
| `README.md:76` | `src/dxf` · `src/nest` · `src/recipe` | `engine/src/dxf.cpp` vb. VAR (uzantısız gövde + engine-göreli) |
| `README.md:76` | `tools/tech-pack.cpp` | `engine/tools/tech-pack.cpp` VAR |
| `docs/ARCHITECTURE.md:24` | `tests/test_geometry.cpp` | `engine/tests/test_geometry.cpp` VAR |
| `docs/ARCHITECTURE.md:41` | `tests/engine_check.cpp` | `engine/tests/engine_check.cpp` VAR |
| `docs/ARCHITECTURE.md:43` | `tools/precision-report.js` | `engine/tools/precision-report.js` VAR |
| `docs/ARCHITECTURE.md:44` | `tools/web-fuzz.js` | `engine/tools/web-fuzz.js` VAR |
| `README.md:20` | `stitchu.techpack/1` | manifest FORMAT KİMLİĞİ, yol değil |
| `README.md:28` · `docs/ARCHITECTURE.md:257` | `.cpp` | uzantı jetonu, yol değil |
| `docs/ARCHITECTURE.md:190` · `:261` · `docs/KATMAN-HARITASI.md:119` | `research/v6-cipa-editleme` | **git DALI**, dosya değil — `git branch -a` ile VAR (yerel + `origin/`) |
| `docs/KATMAN-HARITASI.md:110` | `contract/primitives-v1.json:primitifler.edge.parametreler.label` | JSON pointer; `contract/primitives-v1.json` VAR |

**(ii) DÜRÜST YOKLUK — 10.** Doküman hedefin YOK olduğunu kendisi ilan ediyor;
bunlar ölü link değil, kayıtlı eksik:

| dosya:satır | hedef | dokümanın kendi cümlesi |
|---|---|---|
| `README.md:36` · `:78` | `docs/RECETE-SPEC.md` | "was moved out of this repo in `2f748db` and the link that used to sit here pointed at nothing; **corrected 24 Aug 2026 rather than left dangling**" |
| `docs/SATIS-SARTNAMESI.md:88` · `:320` | `engine/STYLE-PIN/` | "**hâlâ dizin olarak YOK**, yani pinli stil yok" |
| `docs/SATIS-SARTNAMESI.md:277` | `benchmark-58/` | "6 Ağu'da doğrulandı ve bugün yeniden doğrulandı: **diskte YOK**" |
| `docs/SATIS-SARTNAMESI.md:280,281,282` | `benchmark-58/…` 3 hedef | üçü de üstü çizili + "**DOSYA YOK**" |
| `docs/SATIS-SARTNAMESI.md:316` | `print-a1.pdf` | "**üretilmiyor** (ölçüldü: koşu A0 + A4 basıyor)" |
| `docs/SATIS-SARTNAMESI.md:29` | `benchmark-58/dress_patterns/` | burada düz anılıyor, ama aynı dosya `:277`'de yokluğunu ilan ediyor → **dosya içi çelişki**, aşağıda YENİ-3 |

**(iii) Koşu-göreli artefakt — 2.** `docs/SATIS-SARTNAMESI.md:226` · `:240` →
`print-svg/a4-page5.svg`. Repo köküne göre YOK, ama paket dizinine göre VAR
(`Logs/paket-2026-08-06/print-svg/a4-page5.svg`, `Logs/surface-2026-08-12/pack-EU42/…`).
Bir baskı-paketi çıktısının kendi içindeki yolu.

⚠ **Bu turun bilinen çözücü zaafı:** basename indeksi `print-info.pdf` / `printpack.py` gibi
yalın adları repoda HERHANGİ bir yerde bulunca VAR sayıyor. `docs/SATIS-SARTNAMESI.md`'nin
9 `print-info.pdf` referansı bu yüzden VAR damgası aldı; **hangi paketin** print-info'su
kastedildiği DOĞRULANMADI.

---

## 4. İDDİA TABLOSU — 0C'nin 41 taşıyıcısından `docs/`+`README.md`'de OLANLAR

0C'nin 41 taşıyıcısının **13'ü** bu kartın kapsamında (kalan 28'i `web/` → V10).
ÖNCE 0C hükmü, SONRA bugünkü hüküm.

### 4A. 0C'de YALAN olanlar — bugün yeniden yargılandı

| # | iddia · dosya:satır | 0C | **bugün** | kanıt (bugün koşan komut/yol) | hüküm ADAYI |
|---|---|---|---|---|---|
| Y6 | "8 ctest suites" · `docs/ARCHITECTURE.md:39` | YALAN | **0C: YALAN → bugün: DÜZELMİŞ** | `docs/ARCHITECTURE.md:41` artık: "How many suites are defined … is what `ctest --test-dir engine/build --output-on-failure` prints — the standing '8 ctest suites' count was measured stale on 24 Aug 2026 … and replaced under RULES §6". | kal |
| Y6b | (aynı satırın kalıntısı) "EU 34-52 + edge bodies × … = **70,200** drafts" · `docs/ARCHITECTURE.md:41` | — | **KANITSIZ + ÇELİŞKİLİ** | `README.md:9` "The run is **EU34-48** … EU50 and EU52 have no published ratio and are not claimed"; `contract/layers/shape-ratios.json` `sizes` = **8** (EU34…EU48), `size-table.json` `sizes` = **8**. `engine_check` bu turda KOŞULMADI, matrisin girdi aralığı doğrulanmadı. 70,200 sayısı ağaçta yalnız `engine/FORMULAS.md:1104`'te. | güncelle — "test girdi aralığı" mı "satılan beden aralığı" mı ayrılsın |
| Y7 | "Clean-build test suite: **77/77 green**" · `README.md:41` | YALAN | **0C: YALAN → bugün: DÜZELMİŞ** | `README.md:47` artık sayıyı vermiyor, `ctest` komutunu veriyor, "The older '77/77 green' wording was measured stale on that date and replaced", ve suite'in all-green DÖNMEDİĞİNİ açıkça yazıyor. | kal |
| Y8 | "single-file bundle (`engine/dist/stitchu-engine.js`, **~218 KB**)" · `docs/ARCHITECTURE.md:47` | YALAN | **0C: YALAN → bugün: DÜZELMİŞ ama SAYI KAYMIŞ** | `docs/ARCHITECTURE.md:53` artık: "`ls -l engine/dist/stitchu-engine.js` is what prints its size; on 24 Aug 2026 that read **1 209 765 bytes**". Bugün: `ls -l engine/dist/stitchu-engine.js` → **1 253 817 bayt** (25 Ağu 09:17). **+44 052 bayt kaymış.** Tarihli kayıt olduğu için RULES §6 ihlali DEĞİL, ama 1 günde bayatlamış. | kal (kayma bilgi olarak not düşülsün) |
| Y10 | "worst pair is now **0.00 mm**" · `docs/ARCHITECTURE.md:41` + `README.md:42` | YALAN | **0C: YALAN → bugün: DÜZELMİŞ** | `docs/ARCHITECTURE.md:43` ve `README.md:48` ikisi de aleti (`node engine/tools/precision-report.js`) adlandırıyor; eski cümle tırnak içinde emekli. Alet diskte **VAR**. | kal |
| Y11 | "must keep the matrix **ALL PASS** and the base draft **byte-identical**" · `docs/ARCHITECTURE.md:73` | YALAN | **0C: YALAN → bugün: SİLİNMİŞ** | `grep -c "ALL PASS" docs/ README.md` → **0**. Kalıp docs'ta hiç geçmiyor. | kal |
| Y12 | `[docs/RECETE-SPEC.md](…)` ölü md linki · `README.md:30,65` | YALAN | **0C: YALAN → bugün: DÜZELMİŞ** | `README.md:36,78` artık dosyanın `2f748db`'de repodan çıkarıldığını yazıyor; md linki yok (§3, MDLINK dead = 0). Dosya hâlâ **YOK** (doğru şekilde ilan edilmiş). | kal |

**0C'nin docs/README'deki 6 YALAN kaleminin 5'i kapandı.** Kalan tek gerçek açık:
Y6b'nin EU34-52 / 70,200 kalıntısı.

### 4B. 0C'de KANITSIZ olanlar

| # | iddia · dosya:satır | 0C | **bugün** | kanıt | hüküm ADAYI |
|---|---|---|---|---|---|
| K1 | "the engine drafts **27 of 54** real garment photos end-to-end" · `README.md:58` (0C: `:45`) | KANITSIZ | **0C: KANITSIZ → bugün: KANITSIZ (değişmedi)** | Satırda sayıyı BASAN alet adı hâlâ yok. "under the strict counting method (37/54 under the older, looser count)" iki sayı veriyor, ikisini de kimse basmıyor. Aynı sayı `web/patches.html:262,265,281,352`'de de duruyor. | güncelle → alet adı yaz |
| K2/K3 | vision doğruluğu **86 %** (Opus) · `docs/ARCHITECTURE.md:69`, `:251` | KANITSIZ (94 vs 86 uzlaşmamış) | **0C: KANITSIZ → bugün: KISMEN KANITLANDI** | `docs/ARCHITECTURE.md:192,198` bir alet + bank adlandırıyor: `node engine/tools/foto-spec-olcum.mjs --offline --bank vision/eval/live-2026-08-22.json`. **İkisi de diskte VAR.** `:264` paydayı dürüstçe ilan ediyor: "**measured over 5 photos**". 94% docs'ta HİÇ geçmiyor → çelişki artık web tarafında (V10). Bu turda alet KOŞULMADI. | kal (etiketli) |
| K4 | "**70,200** drafts, zero validation issues" | KANITSIZ | **KANITSIZ (değişmedi)** | `engine_check` ctest'te VAR; `zero validation issues` docs'ta artık **0 hit**; sayı `docs/ARCHITECTURE.md:41`'de duruyor, bu turda üretilmedi | Y6b ile birlikte ele alınsın |
| K5 | "web fuzz sweep **19,555** drafts, 0 failures" · `docs/ARCHITECTURE.md:42` | KANITSIZ (site 19,780 ile çelişki) | **0C: KANITSIZ → bugün: DÜZELMİŞ** | `docs/ARCHITECTURE.md:44` artık: "the standing '19,555 drafts, 0 failures' pair **was replaced** on 24 Aug 2026 under RULES §6". Docs'ta sayı kalmadı; çelişkinin kalan yarısı `web/styles/*` → V10 | kal |
| K14 | "**gusto-lint PASS** … KOŞULAMADI" + "§1 **5/5 EKSİK**" · `docs/SATIS-SARTNAMESI.md:35,201` | KANITSIZ ama dürüst | **DÜRÜST KANITSIZLIK (değişmedi, tazelendi)** | Satırlar kaydı: `:35` "**5/5 EKSİK**", `:271` "gusto-lint PASS \| **KOŞULAMADI** — girdi (listing flat) üretilmiyor (§1). 24 Ağu'dan beri bir siluet dış konturu üretiliyor (`shell-flat --svg`) ama o gusto-lint'in sorduğu nesne değil". Alet `engine/tools/gusto-lint.mjs` diskte **VAR**. | kal (tarih damgası) |

### 4C. 0C'de DOĞRU olanlar — bugün yeniden yoklandı, **10/10 hâlâ doğru**

| # | iddia · dosya:satır | bugünkü kanıt |
|---|---|---|
| D3 | `contract_check` guard'ı · `docs/ARCHITECTURE.md:7` | `engine/tools/validate-contract.mjs` VAR + `ctest -N`'de `contract_check` VAR |
| D4 | `golden-reference.csv` + `golden-diff.py` · `docs/ARCHITECTURE.md:42` | ikisi de VAR, `golden_check` ctest'te VAR |
| D5 | `dxf_check` · `nest_check` + `nest_marker_check` · `tech_pack_check` · `recipe_grade_check` · `README.md:17,19,18,20` | dördü de `ctest -N` listesinde VAR |
| D6 | `recipe_golden_check`, `recipe_check` · `README.md:41` | ikisi de VAR |
| D7 | `surfacepattern.cpp` → certified ARAP flatten · `README.md:7` | dosya VAR; `surface_pattern_check`, `flatten_check`, `walkgate_check` üçü de VAR |
| D8 | `web/js/spec-validate.js` · `docs/ARCHITECTURE.md:7` | VAR |
| D9 | `gen-contract.mjs` → `contract.gen.hpp` · `docs/ARCHITECTURE.md:7` | ikisi de VAR |
| D10 | `knowledge/schema.sql` · `docs/ARCHITECTURE.md:66` | VAR |
| D11 | "780 fetched rasters … removed from the tree and gitignored" · `docs/ARCHITECTURE.md:73` | raster dizini ağaçta yok, `vision/README.md` VAR |
| D12 | `reports/gate/endustri-2026-07-28.txt` · `README.md:15` | dosya VAR |
| D14 | `contract/layers/shape-ratios.json` gerekçesi · `README.md:9` | VAR, `sizes` = 8 (EU34…EU48), EU50/52 yok |

---

## 5. 0C'NİN YARGILAMADIĞI TAŞIYICI İDDİALAR (yeni)

Kart md.5: özellikle `H1.0-KAPI.md`, `SATIS-SARTNAMESI.md`, `KATMAN-HARITASI.md`,
`G5-OMUZ-PLANI.md`, `loop-engineering.md`.

| # | iddia (aynen) | dosya:satır | bugünkü hüküm | kanıt | hüküm ADAYI |
|---|---|---|---|---|---|
| **YENİ-1** | "Fikstür: `engine/tests/h10_gate_check.cpp` → ctest adı `h10_gate_check`. Koşan komut: `ctest --test-dir engine/build-h10 -R h10_gate_check`" | `docs/H1.0-KAPI.md:20-21` | **YALAN — üç kere** | (a) `engine/tests/h10_gate_check.cpp` **YOK**, diskte `h10_gate_check_LEGACY.cpp`; (b) `ctest -N` → `h10_gate_check (**Disabled**)` — 115 testin tek devre dışı olanı; (c) `engine/build-h10` **dizin olarak YOK** (`ls -d` → No such file). ⚠ **Dosya kendi kendini çürütüyor:** aynı dosyanın `:10-13` başlığı zaten "`h10_gate_check` **DEVRE DIŞI** (`h10_gate_check_LEGACY.cpp`, CMake `DISABLED TRUE`)" diyor. | güncelle — `:20-21` bloğu `:10-13` şerhiyle uzlaştırılsın |
| **YENİ-2** | "Motorun bu şartnameye borcu **bitti**: §2 6/6 · §3 4/4 · §4 4/4 · §4b 1/1." | `docs/SATIS-SARTNAMESI.md:311` | **YALAN (dosya içi çelişki)** | Aynı dosya `:35` "## 1. LISTING GÖRSELİ (vitrin) — **5/5 EKSİK**" ve `:271` "gusto-lint PASS \| **KOŞULAMADI**". §1 eksikken "borç bitti" denemez. RULES §8 ihlali. | güncelle |
| **YENİ-3** | "F0'da `benchmark-58/dress_patterns/` Etsy emsallerinden çıkarıldı … Kaynak envanteri: `reports/2026-07-19-…md`" | `docs/SATIS-SARTNAMESI.md:29` | **KANITSIZ (ölü kaynak)** | `benchmark-58/` diskte YOK (aynı dosya `:277`'de bunu ilan ediyor) ve rapor `~/damla_projects_2026/reports/` altında da YOK. Yani madde listesinin türetildiği İKİ kaynak da yoklanamıyor. | güncelle — `:29` `:277`'ye referans versin |
| **YENİ-4** | "…**0.0000mm** eşleşiyor — uyarı metin değil, geometriye bağlı." | `docs/SATIS-SARTNAMESI.md:243` | **RULES §6 İHLALİ** | Kalıp yasaklı ve satırda onu basan alet adı yok. Ölçümün kendisi bu turda üretilmedi. | güncelle — alet adı yaz |
| **YENİ-5** | "`croquis.landmarks.shoulderTipX` **78.0u** (kaynaksız, devralınmış) → **70.1799u = 210.54 mm**" | `docs/G5-OMUZ-PLANI.md:18` | **KANITSIZ (dürüstçe etiketli)** | "kaynaksız, devralınmış" ibaresi dosyanın kendisinde. Türetmeyi basan alet adı satırda yok. | kal (etiketli) |
| **YENİ-6** | "armhole ÇEVRE kapısı: **40-44cm** bandı … Buğra EU38 kesim çizgisi **433.45 mm** zaten bandın üstünde" | `docs/G5-OMUZ-PLANI.md:49,71-78` | **KANITLI ZİNCİR — kal** | Kaynak `knowledge/drafting-math-eu38.md` diskte **VAR**; kapı `draft_math_check` `ctest -N`'de **VAR**; yürüyen kapı `garment_armhole_check` de **VAR**. Sayı bu turda koşturulmadı. | kal |
| **YENİ-7** | "sevk edilen hattını yargılıyor: `engine/dist/stitchu-engine.js` yükleniyor ve kaynak damgası `web/vendor/stitchu-engine.js` ile birebir (**`7023c808195429b3`**)" | `docs/KATMAN-HARITASI.md:105-106` | **KANITSIZ** | `engine/dist/stitchu-engine.js` VAR ama **gitignore'da** (`docs/ARCHITECTURE.md:263` bunu kendisi yazıyor: "`edit_locality_check` cannot run on a clean checkout"). Damga sha bu turda yeniden hesaplanmadı. Kapı `bundle_fresh_check` ctest'te VAR. | kal + "temiz checkout'ta üretilemez" şerhi |
| **YENİ-8** | "The run is **EU34-48** … EU50 and EU52 have no published ratio and are not claimed." | `README.md:9` | **DOĞRU** | `contract/layers/shape-ratios.json` `sizes` = `['EU34','EU36','EU38','EU40','EU42','EU44','EU46','EU48']` (8); `size-table.json` aynı 8. README:3 başlığı da "FIXED-SIZE (EU34-48)". 0C'nin bulduğu README iç çelişkisi (`:7` vs `:16`) **KAPANMIŞ**. | kal |
| **YENİ-9** | "the WASM source list: `grep -c "surfacepattern\|flatten.cpp\|…" engine/build-wasm.sh` returns **0**" — sevk edilen motor yüzey hattı DEĞİL | `README.md:7`, `docs/ARCHITECTURE.md:137,257` | **DOĞRULANMADI (bu turda koşulmadı)** | Kart `engine/build-wasm.sh`'ı isim isim andığı için yoklanabilirdi, ama komut **koşturulmadı**; sadece adı geçen dosyaların varlığı doğrulandı. Bu, README'nin en ağır cümlesi — bir sonraki tur ölçsün. | kal, kanıt tazelensin |
| **YENİ-10** | "the hip allowance divided by the hip measurement is **bit-constant at 0.2000** across all eight sizes … would need the hip input at **254 cm**" | `README.md:60` | **KANITSIZ (kanıt yolu VAR)** | Kanıt yolu `GECE/V5-F.md` — manifesto dışı, AÇILMADI. Kapı `draft_math_check` ctest'te VAR, taban `engine/tests/v5-ratchet-baseline.json` diskte VAR. | kal (kanıt yolu yeterli) |
| **YENİ-11** | "Z-spread is body-driven: EU38 **143 mm** vs. pear **238 mm**; penetration detector is not blind" | `README.md:64` | **KANITSIZ** | İki sayıyı basan alet/test adı satırda YOK. `drape.hpp` anılıyor ama o sınır beyanı, sayı üreteci değil. `ctest -N`'de `drape_*` adında kapı yok. | güncelle → alet adı yaz veya sayıyı kaldır |
| **YENİ-12** | "`vision-student/vocab.py` is a BUILD PRODUCT … tolerance is zero bytes" | `docs/ARCHITECTURE.md:46,71` | **DOĞRU (alet eşleşiyor)** | `vision-student/vocab.py` VAR, `engine/vocab.json` VAR, `engine/tools/gen-vision-vocab.mjs` VAR, `vocab_source_check` `ctest -N`'de VAR | kal |
| **YENİ-13** | "reports/stitchu-vision-progress.md for its scoreboard" | `docs/loop-engineering.md:68` | **ÖLÜ REFERANS (düşük ağırlık)** | Backtick'siz düz metin olduğu için §3 betiği yakalamadı; elle yoklandı, `~/damla_projects_2026/reports/` altında **YOK**. `docs/loop-engineering.md` bir yöntem yazısı, taşıyıcı vitrin değil. | güncelle |

---

## 6. ALET EŞLEME TABLOSU

### 6A. Docs'ta ADI GEÇEN her `*_check` — 41 ad

```
ctest --test-dir engine/build -N        → Total Tests: 115  (1'i Disabled)
grep -ohE '`[a-z0-9_]+_check`' docs/*.md README.md | sort -u   → 41 ad
```

| ölçü | sayı |
|---|---|
| docs'ta adı geçen `*_check` | **41** |
| `ctest -N`'de ETKİN olarak tanımlı | **40** |
| `ctest -N`'de **`(Disabled)`** | **1** → `h10_gate_check` (`.cpp` adı `_LEGACY`) |
| docs'ta anılıp CMake'e hiç kayıtlı olmayan | **0** |

⚠ Bu bir "test geçiyor" ölçümü DEĞİLDİR. `ctest` **koşturulmadı** (`-N` yalnız
tanımlı test ADLARINI listeler). Denilen: **115 test tanımlı, 1'i devre dışı,
docs'un andığı 41 addan 40'ı tanımlı.**

### 6B. Sayısal iddia → onu basan alet → alet diskte var mı

| iddia (dosya:satır) | aday alet adı | diskte VAR/YOK (yol) |
|---|---|---|
| "worst pair" mm (`ARCHITECTURE.md:43`, `README.md:48`) | `precision-report.js` | **VAR** `engine/tools/precision-report.js` |
| DXF sapma + vertex sayısı (`README.md:17`) | `dxf_check` | **VAR** (ctest) |
| nest çakışma mm² (`README.md:19`) | `nest_check` + harici `nest_marker_check` | **VAR** (ctest, ikisi de) |
| tech-pack manifest/sayfa/verim (`README.md:20`) | `tech_pack_check` + `techpack-verify.py` | ikisi de **VAR** — ctest + `engine/tools/techpack-verify.py` |
| grade run validator/monotonluk (`README.md:18`) | `recipe_grade_check` | **VAR** (ctest) |
| golden drift (`README.md:53`) | `golden_check` + `./engine/build/golden_dump` | ctest **VAR**; `engine/GOLDEN-PIN.md` **VAR** |
| dikilebilirlik ihlalleri, 8 beden (`README.md:54`) | `sewability_check` | **VAR** (ctest) |
| scye derinliği / omuz / arka boyun (Aldrich) (`README.md:54`) | `draft_math_check` + `engine/tests/v5-ratchet-baseline.json` | ikisi de **VAR** |
| armhole vs cap ease (`README.md:56`) | `sleeve_cap_ease_check` | **VAR** ctest + `engine/tests/sleeve_cap_ease_check.mjs` |
| edit locality panel byte hareketi (`README.md:57`) | `edit_locality_check` + `spec-diff.mjs` + `contract/edit-locality-v1.json` | üçü de **VAR** |
| WASM enum reddi (`README.md:50`) | `wasm_spec_honesty_check` | **VAR** (ctest) |
| bundle kaynak damgası (`README.md:52`) | `bundle_fresh_check` | **VAR** (ctest) |
| farklı giysi ≠ aynı bayt (`README.md:51`) | `flat_expresses_spec_check` | **VAR** (ctest) |
| `70,200` draft matrisi (`ARCHITECTURE.md:41`) | `engine_check` | **VAR** ctest + `engine/tests/engine_check.cpp` |
| fuzz draft/failure sayısı (`ARCHITECTURE.md:44`) | `web-fuzz.js` | **VAR** `engine/tools/web-fuzz.js` |
| bundle boyutu (`ARCHITECTURE.md:53`) | `ls -l engine/dist/stitchu-engine.js` | **VAR** — bugün **1 253 817** bayt (doküman 24 Ağu'yu 1 209 765 diye kayda geçirmiş) |
| vision doğruluğu 86% (`ARCHITECTURE.md:69,192`) | `foto-spec-olcum.mjs` + `vision/eval/live-2026-08-22.json` | ikisi de **VAR** |
| `vocab.py` sıfır-bayt diff (`ARCHITECTURE.md:46`) | `vocab_source_check` + `gen-vision-vocab.mjs` | ikisi de **VAR** |
| gusto-lint skorları (`SATIS-SARTNAMESI.md:61,94,271`) | `gusto-lint.mjs` | alet **VAR**; **girdi YOK** (dosya kendi yazıyor) |
| armhole 40-44cm bandı (`G5-OMUZ-PLANI.md:49,71`) | `draft_math_check` / `garment_armhole_check` | ikisi de **VAR** (ctest) |
| **"27 of 54" foto** (`README.md:58`) | — | **ALET ADI YOK.** Ne satırda ne docs'ta bir üreteç anılıyor |
| **Z-spread 143 / 238 mm** (`README.md:64`) | — | **ALET ADI YOK.** ctest'te `drape*` adlı kapı yok |
| **`0.0000mm` eşleşme** (`SATIS-SARTNAMESI.md:243`) | — | **ALET ADI YOK** |
| **`h10_gate_check` kapısı** (`H1.0-KAPI.md:20`) | `h10_gate_check` | **DEVRE DIŞI** + `.cpp` adı `_LEGACY` + `engine/build-h10` dizini **YOK** |

**Alet adı olmayan sayısal iddia: 4** (K1 27/54 · Z-spread 143/238mm · SATIS 0.0000mm ·
h10 kapısı — sonuncusunun adı var ama kapı devre dışı).
**Alet adı olan ve aleti diskte olan: 20/20** — docs'un andığı her üreteç diskte bulundu.
Yani docs'un sorunu "olmayan alete atıf" DEĞİL; sorun, sayının aletten değil dosyadan
okunması (§2A) ve 4 sayının hiçbir alete bağlanmamış olması.

---

## 7. `docs_truth_check` KAPISI İÇİN TABAN (bu karttan çıkan sayılar)

Kapının kalıp listesi ve taban sayısı, ölçülen hâliyle:

| kapı ölçüsü | bugünkü taban | kaynak |
|---|---|---|
| kapsam | `docs/**/*.md` + `README.md` (7 dosya) | §1 |
| duran-iddia HAM hit | **16** | §2 |
| duran-iddia GERÇEK (yanlış poz. düşülmüş) | **3** · canlı docs'ta **2** | §2A |
| ölü markdown linki | **0** | §3 |
| gerçek ölü repo-içi backtick hedefi | **5** | §3A |
| ölü repo-dışı referans | **2** (+1 elle bulunan, §5 YENİ-13) | §3B |
| alet adı olmayan sayısal iddia | **4** | §6B |
| docs'ta anılan `*_check` / ctest'te tanımlı | **41 / 40** | §6A |

**Kapının kalıp listesi (kartın istediği), ve ZORUNLU istisna kuralı:**
`ALL PASS` · `0.00 ?mm` · `0.0000 ?mm` · `byte-identical` · `bayt bayt` · `zero issues` ·
`zero failures` · `zero validation issues` · `hatasız` · `bitti` · `hazır` · `none known` ·
`validator[- ]clean`
→ **DÜŞ**: hit tırnak/backtick içindeyse, VEYA aynı satırda
`replaced|was measured|ölçüldü|bayatladı|GECE/|ctest |node engine/tools/` + bir tarih varsa.
Bu istisna olmadan kapı, §2B'deki 13 yanlış pozitifin 6'sına ateş eder ve
**RULES §6 onarımını cezalandırır**.

Taban `hazır` = 0 ve `zero issues` = 0 olduğu için bu iki kalıp docs tarafında
sıfır tabanla ratchet'lenebilir.

---

## 8. YARGILANMAYAN / YAPILAMAYAN

- **238 tekil iddia cümlesinin 24'ü tek tek yargılandı** (§4'te 13, §5'te 13, kesişimle 24).
  Kalan **214 cümle YARGILANMADI** — süre tavanı. Ağırlığı `docs/ARCHITECTURE.md` (104)
  ve `docs/H1.0-KAPI.md` (54) taşıyor.
- **`ctest` KOŞULMADI.** Yalnız `-N` ile ADLAR ve toplam okundu. "115 test **geçiyor**"
  DENMEDİ; denilen: **115 test tanımlı, 1'i `(Disabled)`**. Hangi testlerin kırmızı
  olduğu bu kartta ÖLÇÜLMEDİ.
- **`engine_check`'in beden aralığı doğrulanmadı.** `docs/ARCHITECTURE.md:41` "EU 34-52"
  diyor; matrisin girdi aralığını görmek için `engine/tests/engine_check.cpp` AÇILMADI
  (kart o dosyayı isim isim anmıyor, sadece ADINI yoklamayı izin veriyor). Y6b bu yüzden
  YALAN değil KANITSIZ etiketlendi.
- **70,200 / 19,555 / 0.0000mm / 27-of-54 / 86% / 143-238mm sayılarının hiçbiri bu turda
  yeniden ÜRETİLMEDİ.** Yalnız onları basacak aletin diskte olup olmadığı yoklandı.
- **`grep -c "surfacepattern\|flatten.cpp\|…" engine/build-wasm.sh` KOŞULMADI** (YENİ-9).
  README'nin en ağır cümlesi bu turda tazelenmedi.
- **`docs/archive/` (mocks, flat-engine, asset-guide, archive/tools) ve
  `docs/reference/dis-llm-panel-a.html`** — sayıma girdi (`.html`/`.md` olanlar link
  taramasına da), ama **iddiaları yargılanmadı**; arşiv oldukları için hüküm adayı
  yazılmadı. Tek istisna §2A'daki `babyblue-stil-1.html:108`, yasaklı kalıba düştüğü için
  kayda geçti.
- **`docs/archive/tools/` altındaki 9 kod dosyası** link taramasından ÇIKARILDI
  (gerekçe §3'te, log'da isim isim). Backtick'leri JS template literal.
- **Basename çözücü zaafı** (§3C-iii uyarısı): `print-info.pdf`, `printpack.py`,
  `walk.py` gibi yalın adlar repoda herhangi bir yerde bulunca VAR sayıldı; **hangi**
  paketin/koşunun kastedildiği doğrulanmadı. Bu, VAR sayısını (468) yukarı yanlı yapar.
- `GECE/arsiv/`, `KOSU.md`, diğer kartlar, diğer fazların tutanakları **AÇILMADI**.
  `GECE/V5-F.md`, `GECE/V5-Z.md`, `GECE/V4-D.md`, `GECE/V5-D.md`, `GECE/V6-B.md` gibi
  docs'un kanıt yolu olarak andığı tutanaklar **manifesto dışı olduğu için AÇILMADI** —
  o yüzden "kanıt yolu VAR" denildi, "kanıt doğru" DENMEDİ.

---

## 9. KART DIŞI FARK EDİLEN (dokunulmadı, yazıldı)

1. **`docs/H1.0-KAPI.md` kendi kendiyle çelişiyor.** `:10-13` başlığı kapıyı DEVRE DIŞI
   ilan ediyor, `:20-21` aynı kapıyı "Fikstür / Koşan komut" diye canlı gibi anlatıyor,
   `:23` "Bugün KIRMIZI olması doğrudur" diyor — oysa test kırmızı değil, **koşmuyor**.
   Üç ayrı gerçeklik aynı dosyanın ilk 25 satırında.
2. **`docs/SATIS-SARTNAMESI.md` kendi kendiyle çelişiyor.** `:35` "5/5 EKSİK" ↔ `:311`
   "borcu bitti".
3. **`engine/dist/stitchu-engine.js` 1 günde 44 KB büyümüş** (1 209 765 → 1 253 817).
   Dosya **gitignore'da**, yani bu büyüme commit'lere bakarak izlenemez. `docs/ARCHITECTURE.md:263`
   bu bağımlılığı zaten bir sınır olarak ilan ediyor.
4. **`ctest` sayısı 24 Ağu 106 → bugün 115** (+9). `README.md` sayıyı yazmadığı için
   bayatlamadı — RULES §6 onarımının işe yaradığının ölçülmüş kanıtı bu.
5. **Duran-iddia yükünün %100'ü tek dosyada.** Canlı docs yüzeyindeki 2 gerçek ihlalin
   ikisi de `docs/SATIS-SARTNAMESI.md`'de (`:243`, `:311`). Diğer 5 doküman RULES §6
   açısından **temiz**. Onarım tek dosyaya odaklanabilir.
6. **`docs/loop-engineering.md`** (10 iddia) 0C'de hiç görünmüyor; `reports/stitchu-vision-progress.md`
   diye diskte olmayan bir skorbord'a işaret ediyor (YENİ-13).
7. Çalışma ağacında **takipsiz** duran `patterns_real/BUGRA-DEFTER.md`, `patterns_real/geometry/`,
   `patterns_real/tools/bugra-geometry-2026-07-23.json` var. CLAUDE.md'nin gizlilik yasası
   ile ağacın hâli arasındaki bilinen çelişkinin devamı. **Dokunulmadı.**
