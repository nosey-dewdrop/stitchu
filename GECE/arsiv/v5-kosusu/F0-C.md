# F0-C — VİTRİN İDDİA SAYIMI (22 Ağu 2026, gece)

İşçi: F0-C vitrin. **Sayar, hüküm vermez.** Yazma alanı yalnız `GECE/`.
`docs/`, `web/`, `engine/`, `contract/` DEĞİŞTİRİLMEDİ (aşağıda "YAN ETKİ" başlığına bak).
Commit atılmadı.

Ölçüm ağacı: `main`, çalışma ağacı temiz (yalnız `GECE/log/`, `GECE/KART/` untracked).

---

## 0. BUGÜNÜN TABAN ÖLÇÜMLERİ (tablolar buna dayanıyor)

| ölçüm | komut | sonuç |
|---|---|---|
| ctest | `GECE/log/F0v3.ctest.txt` (bu gecenin F0 koşusu) | **89/96 geçti, 7 KIRMIZI** — `style_check`, `sizechart_source_check`, `bugra_bridge_check`, `contract_check`, `preview_truth_check`, `figure_check`, `h10_gate_check`. Toplam 238.33 sn |
| ctest test sayısı | `ctest --test-dir engine/build -N` | **96** |
| site sağlığı | `node engine/tools/site-health.mjs` | exit 0, aşağıda birebir |
| dikiş hassasiyeti | `node engine/tools/precision-report.js` | `worst pair mismatch 0.00 mm \| 0 FAILURES` |
| web fuzz | `node engine/tools/web-fuzz.js` | **exit 1** · `web fuzz: 26260 drafts \| 6513 validator-blocked (honest) \| max 102 sheets \| 3 FAILURES` |
| wasm paketi | `ls -l engine/dist/stitchu-engine.js` | **1 128 760 bayt (1.1 MB)** |
| contract doğrulama | `node engine/tools/validate-contract.mjs` | `FAIL: DECLARED DECISION — 'patterns_real/' has 41 TRACKED file(s) in git` → `contract validation FAILED (1)` |

---

## 1. İDDİA TABLOSU — `README.md`

| # | iddia (birebir alıntı) | dosya:satır | hâlâ doğru mu | kanıtlayan test/alet | hüküm adayı |
|---|---|---|---|---|---|
| R1 | "Same body, same garment, same millimetres, byte for byte." | README.md:3 | ÖLÇÜLMEDİ (bu turda determinizm yeniden koşulmadı; `golden_check` bu gece YEŞİL) | `golden_check` (ctest, PASS) | kal |
| R2 | "That is the sealed architecture (`flatten-research/FINDINGS.md`, 28 Jul)" | README.md:5 | **HAYIR** — `flatten-research/FINDINGS.md` **DİSKTE YOK** (`ls` → yok) | YOK | güncelle |
| R3 | "The run is EU34-48 because that is exactly the range for which the body contract publishes a front/back split (contract/layers/shape-ratios.json)" | README.md:7 | EVET — `shape-ratios.json.sizes` = `["EU34"…"EU48"]`, 8 beden | `contract/layers/shape-ratios.json` (okundu); mandalı `contract_check` **bugün KIRMIZI** | kal |
| R4 | "EU50 and EU52 have no published ratio and are not claimed." | README.md:7 | **HAYIR** — `web/index.html` sitenin gövdesinde **EU34–52** iddia ediyor ("grade it across the full EU34–52 run", "10/10 sizes clean", "/api/grade") | YOK (iki yüzeyi karşılaştıran test yok) | güncelle |
| R5 | "the machine-checked proof is in `reports/gate/endustri-2026-07-28.txt`" | README.md:13 | EVET (dosya var; içeriği okunmadı — §0.1 gereği `reports/` okunmadı) | dosya varlığı | kal |
| R6 | "max error 0.000e+00 mm across 50 vertices" (DXF) | README.md:15 | ÖLÇÜLMEDİ bu turda; mandalı bu gece YEŞİL | `dxf_check` (ctest, PASS) | kal |
| R7 | "10/10 sizes validator-clean … growth jumps +20.40 → +30.60 mm at EU48" | README.md:16 | ÖLÇÜLMEDİ bu turda; mandalı YEŞİL. ⚠ 10 beden = EU34–52, R3'ün "EU34-48" cümlesiyle aynı dosyada çelişiyor | `recipe_grade_check` (ctest, PASS) | güncelle |
| R8 | "shapely 2.1.2 pairwise intersection area = 0.000000 mm²" | README.md:17 | ÖLÇÜLMEDİ bu turda; mandalları YEŞİL | `nest_check` + `nest_marker_check` (ctest, PASS) | kal |
| R9 | "a tampered efficiency value fails the verifier loudly" | README.md:18 | ÖLÇÜLMEDİ bu turda; mandalı YEŞİL | `tech_pack_check` + `techpack-verify.py` | kal |
| R10 | "Contract: `docs/RECETE-SPEC.md`" | README.md:30 | **HAYIR** — `docs/RECETE-SPEC.md` **DİSKTE YOK** | YOK | güncelle |
| R11 | "a C++ engine (compiled to WebAssembly, running entirely in the browser) is the single source of every number" | README.md:31 | ÖLÇÜLMEDİ (tarayıcı koşusu ölçülmedi); bundle diskte var | `recipe_wasm_parity`, `dxf_wasm_parity` (ctest, PASS) | kal |
| R12 | "a pinned golden subset is reproduced byte-for-byte by a second, independent generation path" | README.md:35 | ÖLÇÜLMEDİ bu turda; mandalları YEŞİL | `recipe_golden_check`, `recipe_check` (ctest, PASS) | kal |
| R13 | **"Clean-build test suite: 77/77 green"** | README.md:41 | **HAYIR** — bugün süit **96 test**, **89 geçti / 7 KIRMIZI** | `ctest` (GECE/log/F0v3.ctest.txt) | güncelle |
| R14 | "the six industry gates also ran together 6/6" | README.md:41 | ÖLÇÜLMEDİ (ayrı "industry gate" koşusu bu turda çalıştırılmadı) | YOK (adı geçen tek koşucu yok) | güncelle |
| R15 | **"Seam-pair precision: worst pair 0.00 mm."** | README.md:42 | **EVET** — bugün koştu: `precision report: worst pair mismatch 0.00 mm \| 0 FAILURES` | `engine/tools/precision-report.js` | kal |
| R16 | "DXF millimetre parity: 0.000e+00 mm over 50 boundary vertices" | README.md:43 | ÖLÇÜLMEDİ bu turda | `dxf_check` (PASS) | kal |
| R17 | "with them off, output stays byte-identical" | README.md:44 | ÖLÇÜLMEDİ bu turda | `golden_check` (PASS) | kal |
| R18 | "the engine drafts **27 of 54** real garment photos end-to-end … (37/54 under the older, looser count)" | README.md:45 | **ÖLÇÜLEMEZ** — ölçen korpus `benchmark-58/` **DİSKTE YOK** (`ls -d benchmark-58` → No such file or directory). Alet var (`engine/tools/benchmark-58.mjs`), girdisi yok | alet VAR / girdi YOK | güncelle |
| R19 | "Z-spread is body-driven: EU38 143 mm vs. pear 238 mm; penetration detector is not blind" | README.md:51 | ÖLÇÜLMEDİ bu turda | `drape_check` (ctest, PASS) | kal |
| R20 | "web: static HTML/CSS/JS on GitHub Pages" | README.md:57 | KISMEN — canlı adres `stitchu.noseydewdrop.com` bugün **HTTP 200**; CLAUDE.md Vercel diyor, repoda hem `.github/workflows/pages.yml` hem `web/vercel.json` var. İki yayıncı | `site-health.mjs` (yayıncıyı ölçmez) | güncelle |
| R21 | "`recipes/` — recipe documents", "`docs/RECETE-SPEC.md` — the recipe data model contract" (repo layout) | README.md:64-65 | **HAYIR** (RECETE-SPEC yok, R10 ile aynı kök) | YOK | güncelle |

## 2. İDDİA TABLOSU — `docs/ARCHITECTURE.md`

| # | iddia (birebir alıntı) | dosya:satır | hâlâ doğru mu | kanıtlayan test/alet | hüküm adayı |
|---|---|---|---|---|---|
| A1 | "Companion docs: `engine/FORMULAS.md` …, `PROJECT.md` (roadmap), `PLAN.md` (track A/B directives)" | ARCHITECTURE.md:3 | **KISMEN HAYIR** — `engine/FORMULAS.md` VAR; **`PROJECT.md` YOK**, **`PLAN.md` YOK** | YOK | güncelle |
| A2 | "Guard: `engine/tools/validate-contract.mjs` runs as ctest `contract_check` and fails on any schema/vocab drift…" | ARCHITECTURE.md:7 | **EVET, ve BUGÜN KIRMIZI** — `contract_check` FAIL: `'patterns_real/' has 41 TRACKED file(s) in git` | `contract_check` (ctest, **FAIL**) | kal |
| A3 | "Every vocabulary feature is an opt-in `GarmentSpec` field defaulting OFF, so the base draft is byte-identical without it." | ARCHITECTURE.md:30 | ÖLÇÜLMEDİ bu turda | `golden_check`, `engine_check` (PASS) | kal |
| A4 | "the matrix — EU 34-52 + edge bodies × the full spec space = **70,200 drafts**, all must validate" | ARCHITECTURE.md:39 | ÖLÇÜLMEDİ (sayı bu turda sayılmadı); `engine_check` bu gece YEŞİL | `engine_check` (ctest, PASS) | kal |
| A5 | **"8 ctest suites."** | ARCHITECTURE.md:39 | **HAYIR** — bugün **96** ctest testi kayıtlı | `ctest -N` | güncelle |
| A6 | "`golden-diff.py` compares at 0.1 mm tolerance" | ARCHITECTURE.md:40 | ÖLÇÜLMEDİ | `golden_check` | kal |
| A7 | **"worst pair is now 0.00 mm"** | ARCHITECTURE.md:41 | **EVET** — bugün koştu | `engine/tools/precision-report.js` | kal |
| A8 | **"`tools/web-fuzz.js` … — 19,555 drafts, 0 failures."** | ARCHITECTURE.md:42 | **HAYIR, İKİ YANDAN** — bugün **26 260 draft** ve **3 FAILURES** (exit 1). Hatalar: `[keyhole] Bodice Center Front: keyhole stitch line is not a CF teardrop` (pussyBow+keyhole bileşimleri), `[marking] Center Front: marking point (129.0, 193.3) falls outside the piece` (pocket-patch/straight skirt) | `engine/tools/web-fuzz.js` (**exit 1**) | güncelle |
| A9 | "single-file bundle (`engine/dist/stitchu-engine.js`, **~218 KB**)" | ARCHITECTURE.md:47 | **HAYIR** — dosya bugün **1 128 760 bayt ≈ 1.1 MB** (5.2×) | `ls -l` | güncelle |
| A10 | "Cache-busting is manual: bump `?v=N` … (deploy = `git subtree split --prefix web` → `gh-pages`)" | ARCHITECTURE.md:50 | **HAYIR (bayat)** — `?v` artık `engine/tools/site-version.mjs` tek kaynağından ve `site-health.mjs` "one version" diyor; deploy `scripts/deploy.sh` + `.github/workflows/pages.yml` + `web/vercel.json` | `site-health.mjs` (`?v` gerilemesi kapısı) | güncelle |
| A11 | "Planned: `POST /api/draft` running the same WASM engine server-side — the sellable API." | ARCHITECTURE.md:53 | **HAYIR (bayat, LEHTE)** — kod repoda YAZILI: `backend/draft.js:1`, `backend/worker.js:70` (`/api/draft`), `:94` (`/api/grade`). "Planned" değil, en azından yazılmış. Canlı çalıştığı **ÖLÇÜLMEDİ** | `api_wire_check` (ctest, PASS) | güncelle |
| A12 | "zero-shot CLIP 44%, SigLIP 65% …; Opus via the live worker 86%" | ARCHITECTURE.md:56 | ÖLÇÜLMEDİ (ücretli/eval koşusu yapılmadı) | YOK | kal |
| A13 | "the 780 fetched rasters … removed from the tree and gitignored … `./vision/fetch-corpus.sh` rebuilds the corpus" | ARCHITECTURE.md:58 | KISMEN — `vision/README.md` VAR; fetch koşulmadı | YOK | kal |
| A14 | "`engine/SPECS-next-vocabulary.md` is an UNVERIFIED agent draft — review before building" | ARCHITECTURE.md:79 | **HAYIR** — dosya **DİSKTE YOK** | YOK | güncelle |
| A15 | "Deploy/cache is manual and fragile: forgetting the `?v=N` bump serves stale assets" | ARCHITECTURE.md:83 | **HAYIR (bayat)** — `site-health.mjs` `?v` gerilemesini kapıya bağladı, bugün "one version" | `engine/tools/site-health.mjs` | güncelle |

## 3. İDDİA TABLOSU — `docs/SATIS-SARTNAMESI.md`

| # | iddia (birebir alıntı) | dosya:satır | hâlâ doğru mu | kanıtlayan test/alet | hüküm adayı |
|---|---|---|---|---|---|
| S1 | "Her kutucuk BUGÜN ölçüldü" (mühür 2026-08-17) | SATIS-SARTNAMESI.md:3 | Tarih 17 Ağu; **bugün 22 Ağu** — mühür 5 gün eski, satırların çoğu bu turda yeniden koşulmadı | YOK | güncelle |
| S2 | "Determinizm sha256 (sayfa SVG'leri) `ec3b0f11a3eae3ae…`; iki bağımsız koşu … bayt-özdeş" | SATIS-SARTNAMESI.md:16-17 | ÖLÇÜLMEDİ (printpack bu turda koşulmadı) | `printpack_sheet_check` (ctest, PASS) | kal |
| S3 | "Sevk edilen paket **10 adım**" | SATIS-SARTNAMESI.md:21-27 | ÖLÇÜLMEDİ | `printpack_sheet_check` | kal |
| S4 | "## 1. LISTING GÖRSELİ (vitrin) — **5/5 EKSİK**" | SATIS-SARTNAMESI.md:35 | ÖLÇÜLMEDİ ama **destekleniyor**: `find web -name "*flat*.svg"` bu turda çalıştırılmadı, ancak `h10_gate_check` bugün **KIRMIZI** (`KAPI KIRMIZI — H1.0 açık`) | `h10_gate_check` (ctest, **FAIL**) | kal |
| S5 | **"KAPI BOŞ KOŞUYOR … `style_check` … PASS (nothing to enforce)"** | SATIS-SARTNAMESI.md:51-53 | **HAYIR, DEĞİŞMİŞ** — `style_check` bugün **FAIL** ediyor: `Bu testin kendi çıktısını pinlemesi (regen-vs-regen) kanıt DEĞİLDİR`. Yani artık "boş yeşil" değil, açıkça kırmızı | `style_check` (ctest, **FAIL**) | güncelle |
| S6 | "## 2. KALIP PAKETİ TAM (ürün) — **6/6 GEÇTİ**" (ve alt 6 madde) | SATIS-SARTNAMESI.md:57-86 | ÖLÇÜLMEDİ bu turda; mandalı `printpack_sheet_check` bugün YEŞİL | `printpack_sheet_check` | kal |
| S7 | "## 3. … — **4/4 GEÇTİ**" (parça sayısı, cut-on-fold, nesting 0 kazanç, register) | SATIS-SARTNAMESI.md:88-126 | ÖLÇÜLMEDİ bu turda | `printpack_sheet_check` §6, `cutplan_check` (ikisi de PASS) | kal |
| S8 | "## 4. TALİMAT İSKELETİ — **4/4 GEÇTİ**" (kumaş sayfası, montaj sırası, kalibrasyon karesi, damga) | SATIS-SARTNAMESI.md:128-171 | ÖLÇÜLMEDİ bu turda | `printpack_sheet_check` §7 | kal |
| S9 | "## 4b. AÇIKLIK UYARISI — **GEÇTİ**" | SATIS-SARTNAMESI.md:173-188 | ÖLÇÜLMEDİ bu turda | `printpack_sheet_check` | kal |
| S10 | "**benchmark-58/ diskte YOK**" | SATIS-SARTNAMESI.md:207-208 | **EVET, hâlâ yok** — bugün doğrulandı | `ls -d benchmark-58` | kal |
| S11 | "kontakt sayfası şartı bugün **karşılanamaz**" | SATIS-SARTNAMESI.md:225 | EVET (emsal PDF'leri yok, S10 ile aynı kök) | YOK (kontakt sayfası üreteci koşmuyor) | kal |
| S12 | **"Motorun bu şartnameye borcu **bitti**: §2 6/6 · §3 4/4 · §4 4/4 · §4b 1/1."** | SATIS-SARTNAMESI.md:241 | ÖLÇÜLMEDİ; ama aynı dosyanın kapı tablosu "KAPI BUGÜN AÇIK DEĞİL" diyor ve `h10_gate_check` bugün KIRMIZI. "Borç bitti" ile "kapı kapalı" aynı sayfada | `h10_gate_check` (**FAIL**) | güncelle |

## 4. İDDİA TABLOSU — `docs/KATMAN-HARITASI.md` · `docs/loop-engineering.md`

| # | iddia (birebir alıntı) | dosya:satır | hâlâ doğru mu | kanıtlayan test/alet | hüküm adayı |
|---|---|---|---|---|---|
| K1 | "Teşhis harnesi `engine-check/harness/run-all.sh`; yasak-okuma zabıtası `scripts/katman-lint.py`" | KATMAN-HARITASI.md:3 | ÖLÇÜLMEDİ (bu turda koşulmadı) | `scripts/katman-lint.py` (ctest'te adı yok) | kal |
| K2 | "`engine/flat-engine/styles.json`" (L1 tasarım kaynağı) | KATMAN-HARITASI.md:12 | EVET — dosya var (`engine/flat-engine/styles.json`) | YOK | kal |
| K3 | "L0 ÇİFT KAYNAK … ikisinin tutarlılığını ölçen tek test H0'dır" | KATMAN-HARITASI.md:20-22 | ÖLÇÜLMEDİ; ama komşu bulgu: `sizechart_source_check` bugün **KIRMIZI** (`DAMLA-KUYRUK K10`, "chart'ı düzenleyerek kapatma") — beden tablosunun kaynağı hâlâ açık | `sizechart_source_check` (ctest, **FAIL**) | kal |
| K4 | "2.95mm / 17 kombinasyon arızası" | KATMAN-HARITASI.md:23-25 | ÖLÇÜLMEDİ | harness H3b (ctest'te adı yok) | kal |
| L1 | "See reports/stitchu-vision-progress.md for its scoreboard." | loop-engineering.md:68 | ÖLÇÜLMEDİ — `reports/` §0.1 gereği açılmadı | YOK | ÖLÇÜLMEDİ |
| L2 | "Written for developers; candidate for the public dev blog once the blog exists." | loop-engineering.md:5 | EVET — `web/blog/` yok; `gen-legacy-redirects.mjs` bugün `ok web/blog/index.html already absent` diyor | `engine/tools/gen-legacy-redirects.mjs` | kal |

## 5. İDDİA TABLOSU — `web/` (vitrinin kendisi)

| # | iddia (birebir alıntı) | dosya:satır | hâlâ doğru mu | kanıtlayan test/alet | hüküm adayı |
|---|---|---|---|---|---|
| W1 | "grade it across the full **EU34–52** run" | web/index.html (hero, `data-en`) | **UI↔KONTRAT FARKI** — `contract/layers/shape-ratios.json` yalnız **EU34–EU48** yayınlıyor; `README.md:7` "EU50 and EU52 … are not claimed" diyor. Aynı sitede iki sayı | YOK (sitenin sayısını kontrata bağlayan test yok) | güncelle |
| W2 | "A deterministic fixed-size pattern CAD … grade across **EU34–48**" (meta description / JSON-LD) | web/index.html (meta) | Aynı dosyanın meta'sı 48, gövdesi 52 — **kendi içinde çelişik** | YOK | güncelle |
| W3 | "every seam that must sew together matches to **0.00 mm** across a **70,200-draft** matrix" | web/index.html (`#industry` bloğu) | 0.00mm kısmı **EVET** (precision-report bugün), 70 200 sayısı **ÖLÇÜLMEDİ** | `precision-report.js` (0.00mm) · `engine_check` (matris) | kal |
| W4 | "**10 of 10** sizes validator-clean" / "EU34–52 · 10/10 sizes clean" | web/index.html (`#industry` stat) | ÖLÇÜLMEDİ bu turda; ayrıca W1 ile aynı EU52 sorunu | `recipe_grade_check` (PASS) | güncelle |
| W5 | "POST /api/draft … No per-call AI cost." | web/api.html:7,12,20 | Kod repoda VAR (`backend/worker.js:70,94`); **canlı uçta ÖLÇÜLMEDİ** (istek atılmadı) | `api_wire_check` (ctest, PASS) | kal |
| W6 | site canlı | https://stitchu.noseydewdrop.com/ | **EVET** — `curl` → **HTTP 200** | curl | kal |

---

## 6. ÜRETEÇ TABLOSU — hangi sayfa nereden çıkıyor, bugün koşuyor mu?

Her üreteç **bugün çalıştırıldı**. Ağaç her koşudan sonra `git checkout` ile eski hâline döndürüldü.
"tree delta" = üretecin bastığı bayt ile ağaçtaki baytın farkı.

| üreteç | bastığı sayfa(lar) | bugün koşuyor mu | çıktı (birebir) | ağaç farkı |
|---|---|---|---|---|
| `engine/tools/gen-style-pages.mjs` | `web/styles/index.html` + **23 stil sayfası** (manifest'te 24 yol) | **EVET, exit 0** | `generated 23 style pages + hub at ?v=136 (run gen-sitemap.mjs to refresh sitemap.xml)` | **0 fark** — bayt bayt aynı |
| `engine/tools/gen-guide.mjs` | `web/guide/` **6 sayfa** + index (manifest 7 yol) | **EVET, exit 0** | `gen-guide: wrote 6 pages to web/guide/` | **0 fark** |
| `engine/tools/gen-sitemap.mjs` | `web/sitemap.xml`, `web/robots.txt` | **EVET, exit 0** | `sitemap.xml: 124 urls (skipped 3: atolye.html [noindex], shop-shift-dress.html [noindex], studio.html [noindex])` / `robots.txt: rewritten` | **DETERMİNİSTİK DEĞİL** — `lastmod` dosya **mtime**'ından okunuyor (`gen-sitemap.mjs:78 statSync(full).mtime`), o yüzden herhangi bir yeniden üretim 33 satırı oynatıyor |
| `engine/tools/gen-legacy-redirects.mjs` | `web/blog/index.html` (silinmiş olmasını doğruluyor) | **EVET, exit 0** | `ok web/blog/index.html already absent` / `legacy-redirects: 1 declared, 0 FAIL` | 0 fark |
| `engine/tools/gen-landing.js` | **dosya YAZMIYOR** — stdout'a JSON SVG basıyor (`web/index.html`'e elle yapıştırılan hero/tiling/proof çizimleri) | **EVET, exit 0** | `{"heroPair":"<svg …>","heroTiling":…,"proofSheet":…,"exBabydoll":…,"exTop":…,"exKnit":…}` (6 SVG) | dosya yazmadığı için fark yok — **çıktısının sayfaya girdiği ölçülmedi** |
| `engine/tools/gen-collections-page.mjs` | `web/collections/index.html` | **HAYIR — exit 1** | `Error: ENOENT: no such file or directory, open '…/web/patterns/svg/meta.json'` — `at gen-taste-collections.mjs:35` (import zincirinde patlıyor) | — |
| `engine/tools/gen-taste-collections.mjs` | `web/collections/*.html` (24 koleksiyon sayfası) | **HAYIR — exit 1** | `Error: ENOENT … '/web/patterns/svg/meta.json'` (`:35`) | — |
| `engine/tools/gen-collection-pattern.mjs` | koleksiyon detay sayfaları | **HAYIR — exit 1** | `Error: ENOENT … '/web/patterns/vintage6070/meta.json'` (`:45`) | — |
| `engine/tools/gen-vintage-page.mjs` | `web/collection-60s70s.html` | **HAYIR — exit 1** | `Error: ENOENT … '/web/patterns/vintage6070/meta.json'` (`:12`) | — |
| `engine/tools/build-atolye.mjs` | **`web/atolye.html`** | **EVET, exit 0** | `wrote web/atolye.html 167kb` | **1 SATIR FARK** — ağaçtaki sayfa BAYAT contract taşıyor: gömülü `_CT`'de `draft.euSizeChart._sources` ve `._sourcesROL` (17 Ağu kaynak beyanı) **YOK**; `contract/tables.json`'da VAR |

**Manifest kapsamı** (`contract/generated-paths.sha256`, 57 yol): 24 collections + 7 guide + 24 styles + `collection-60s70s.html` + `sitemap.xml` + `robots.txt` + `golden-reference.csv`.
`web/atolye.html` **üretilmiş ama manifestte YOK** → K9 ratchet onu tutmuyor.

### Üreteci OLMAYAN (elle yazılmış) sayfalar — 73 adet

`web/api.html` · `web/atolye.html`\* · `web/benchmark.html` · `web/closet.html` · `web/create.html` ·
**`web/index.html` (ELLE, İLAN EDİLMİŞ — Damla hükmü 22 Ağu, kusur değil)** · `web/patches.html` ·
`web/patches/*.html` (**66 sayfa**) · `web/privacy.html` · `web/shop-shift-dress.html` ·
`web/showcase.html` · `web/signature.html` · `web/studio.html`

\* `atolye.html` manifestte yok ama üreteci VAR (`build-atolye.mjs`) — "elle" değil, "ratchet'siz üretilmiş".
Yani gerçek elle-yazılmış sayı **72**, bunun **66'sı patch notu sayfası**.

### Koşmayan diğer `gen-*` (bu turda çalıştırılmadı, sayfa üretmiyor)
`gen-constants.mjs`, `gen-contract.mjs`, `gen-vocab.mjs`, `gen-spec-v2.mjs`, `gen-spec-v1v2-map.mjs`
(kod/JS üretir, sayfa değil) · `gen-factory-pack.mjs` (`web/factory/`), `gen-techpack-pdf.mjs`,
`gen-satis-pdf.mjs`, `gen-gore-grid/contact.mjs`, `gen-wrap-grid/contact.mjs`, `gen-taste-pool.mjs`
→ **ÖLÇÜLMEDİ** (tur tavanı).

---

## 7. `site-health.mjs` ÇIKTISI (birebir)

```
$ node engine/tools/site-health.mjs
checked: 127 pages, 2597 internal refs, 124 sitemap urls, 124 indexable pages
OK  site-health: no dead links, sitemap matches the site, one version.
exit 0
```

| ölçü | sayı |
|---|---|
| taranan sayfa | 127 |
| iç link (ref) | 2597 |
| **kırık iç link** | **0** |
| sitemap URL | 124 |
| indexlenebilir sayfa | 124 |
| **sitemap 404 / eksik** | **0** |
| **`?v` gerilemesi** | **0** ("one version") |

⚠ 127 sayfa var, 124'ü sitemap'te: fark 3 = `atolye.html`, `shop-shift-dress.html`, `studio.html` (noindex, kasıtlı atlanıyor — `gen-sitemap.mjs` çıktısında adları yazılı).

---

## 8. ATÖLYE — gösterilen beden = seçilen beden mi? (ÖLÇÜLDÜ)

**HAYIR, 8 bedenin 3'ünde.** Ölçüm:

| kanıt | dosya:satır | değer |
|---|---|---|
| Kadran 8 beden sunuyor | `web/atolye.html:1103` | `const SIZES = ['EU34','EU36','EU38','EU40','EU42','EU44','EU46','EU48'];` |
| Kadran sınırı 0..7 | `web/atolye.html:973` | `['size','olcu','beden', 0, 7, 1, 2, 'EU34..EU48. Sabit beden satilir…']` |
| Motora geçen beden | `web/atolye.html:1254` | `over.size = SIZES[s.size];` |
| Ekranda YAZAN etiket | `web/atolye.html:1826` | `$('ver').textContent = SIZES[ST.size] + ' · ' + …` |
| Kalemin beden tablosu | `web/atolye.html:404` → `var SIZE=_CT.flat.size;` | gömülü `_CT.flat.size` anahtarları: **`EU34, EU36, EU38, EU40, EU42`** — yalnız **5** |
| Kalem tabloyu okuyor | `web/atolye.html:420`, `:490` | `var sz=SIZE[p.size]` → `sz.shp` |
| Kaynak tablo | `contract/tables.json` → `flat.size` | aynı 5 anahtar (EU44/46/48 **YOK**) |

Doğrudan koşu (`engine/flat-engine/_engine-full.mjs`, atölyenin gömdüğü kalem):

```
flat-engine SIZE keys: [ 'EU34', 'EU36', 'EU38', 'EU40', 'EU42' ]
EU38 ok   EU42 ok
EU44 THROW: Cannot read properties of undefined (reading 'shp')
EU48 THROW: Cannot read properties of undefined (reading 'shp')
```

**Sonuç:**
- EU34/36/38/40/42 → etiket ile çizim aynı bedeni gösteriyor (etiketin okuduğu dizi ile kalemin okuduğu tablo anahtarı aynı string).
- **EU44 / EU46 / EU48 → çizim YOK.** Kalem `undefined.shp` ile patlıyor; `web/atolye.html:1821` bunu yakalayıp `cizim hatasi: …` yazıyor, ama **`$('ver')` etiketi yine "EU44 · elbise" diyor.**
- Yani UI 8 beden satıyor, kalem 5 beden çiziyor. **`contract/layers/shape-ratios.json` (kalıp tarafı) 8 bedeni yayınlıyor** → fark yalnız vitrin kaleminde.
- Bunu ölçen test: **YOK.** (`figure_check` bugün zaten KIRMIZI ama bedenden değil, oran pininden.)

---

## 9. YAN ETKİ BEYANI (ben yaptım, saklamıyorum)

Üreteçleri koşturmak için `gen-style-pages.mjs`, `gen-guide.mjs`, `gen-sitemap.mjs`,
`build-atolye.mjs` çalıştırıldı; **içerik** her seferinde `git checkout` ile geri alındı
(final `git status --porcelain -- web/` **boş**).
**Geri alınamayan tek şey mtime:** `web/styles/*.html`, `web/guide/*.html`, `web/atolye.html`,
`web/sitemap.xml`, `web/robots.txt` dosyalarının değiştirilme zamanı bugüne (22 Ağu) kaydı.
Bayt değişmedi; ama `gen-sitemap.mjs` `lastmod`'u mtime'dan okuduğu için **bir sonraki sitemap
üretimi 33 `lastmod` satırını 2026-07-28/08-17'den 2026-08-22'ye taşıyacak.** Bu benim koşumun
izidir, önceden var olan bir sürüklenme değildir.

---

## 10. BULDUĞUNU DÖK — sorulmadı ama önemli

1. **En sert yalan adayı:** `docs/ARCHITECTURE.md:42` "19,555 drafts, **0 failures**". Alet bugün
   **26 260 draft ve 3 FAILURES** ile **exit 1** dönüyor. Doküman "sıfır" diyor, alet "üç" diyor,
   ve bu alet dokümanın kendi "required loop"unda (`ARCHITECTURE.md:44`) sayılı. Kırmızı olan
   `web-fuzz.js` **ctest'e bağlı değil** — hiçbir kapı onu koşmuyor, o yüzden kimse görmedi.
2. **`web-fuzz.js`'in 3 hatası ne:** ikisi `keyhole stitch line is not a CF teardrop`
   (dress/pussyBow/…/keyhole ailesi), biri `marking point (129.0, 193.3) falls outside the piece`
   (pocket-patch + straight skirt). Yani vitrinde "keyhole" ve "pocket" kelimeleri satılıyorsa
   arkasında bugün kırmızı bir kombinasyon var. **Kaç kombinasyonun etkilendiği sayılmadı.**
3. **Ölü doküman referansı 5 tane:** `flatten-research/FINDINGS.md` (README.md:5 — "sealed
   architecture"ın kaynağı!), `docs/RECETE-SPEC.md` (README.md:30,65 — "the recipe data model
   contract"), `PROJECT.md`, `PLAN.md` (ARCHITECTURE.md:3, ayrıca :74 "discipline codified in
   PLAN.md"), `engine/SPECS-next-vocabulary.md` (ARCHITECTURE.md:79). **Mimari mührün dayandığı
   iki dosya da yok.** Bu ölü yolları yakalayan test YOK (`site-health.mjs` sadece web/ içi linki
   tarıyor, markdown'daki repo yollarını değil).
4. **`contract_check` bugün kırmızı ve sebebi vitrin değil gizlilik:** `patterns_real/` 41 takipli
   dosya. Bu, CLAUDE.md'deki "gizlilik çelişkisi" satırının mandala dönüşmüş hâli; testin kendisi
   "DECLARED DECISION (not a breach)" diyor. **Karar Damla'da, ölçüm değil.**
5. **`style_check` artık boş-yeşil değil, KIRMIZI** ve sebebi çok net:
   `Bu testin kendi çıktısını pinlemesi (regen-vs-regen) kanıt DEĞİLDİR`. `SATIS-SARTNAMESI.md:51-53`
   onu hâlâ "PASS (nothing to enforce)" diye anlatıyor — şartname 5 gün bayat.
6. **Dört üretecin ENOENT'i tek kök:** `web/patterns/*/meta.json` (af49514 silmiş, 29 Tem).
   `generated_ratchet_check.sh`'ın kendi yorumu bunu 17 Ağu'da zaten yazmış ve "K16 o veriyi geri
   getirince bu dosya üreteçleri koşturacak şekilde YÜKSELTİLMELİ" demiş. **24 koleksiyon sayfası
   bugün yeniden üretilemez durumda ve site onları yayınlıyor.**
7. **`gen-sitemap.mjs` deterministik değil** (mtime → lastmod). Dosyanın kendi yorumu
   `:84` "produces a byte-identical file apart from lastmod" diyerek bunu biliyor. Ama K9 ratchet
   `web/sitemap.xml`'i sha256 ile tutuyor → **bir dosyaya dokunan herkes ratchet'i kırmızıya
   çevirebilir**, içerik hiç değişmese bile.
8. **`web/atolye.html` iki kere savunmasız:** (a) K9 manifestinde yok, (b) ağaçtaki hâli bugünkü
   `contract/tables.json`'dan bir alan geride. Kaynak beyanı (`_sources`) eksikliği **sayı**
   değiştirmiyor (70 beden sayısı aynı), yalnız provenance metni — ama "kontrat tek kaynak"
   iddiasının delili orada.
9. **README EU34-48 diyor, site EU34–52 diyor, `index.html` kendi meta'sında 48 kendi gövdesinde 52
   diyor.** Üç yüzey, üç sayı. `recipe_grade_check` 10 bedeni (yani 52'ye kadar) yeşil geçiyor,
   `shape-ratios.json` 8 beden yayınlıyor. **Hangisinin doğru olduğu benim hükmüm değil**; sayılan
   şey: aynı ürün için üç farklı beden aralığı yayında.
10. **Atölyenin beden kadranı 8'de duruyor ama kalem 5.** Kalıp motoru (C++/`surface-pattern`) 8
    bedeni üretiyor (CLAUDE.md'de kayıtlı), vitrin kalemi üretmiyor. **UI'ın söylediği ile kalemin
    yaptığı arasındaki fark: 3 beden.**
11. **66 patch-notu sayfası elle yazılmış** ve hiçbiri ratchet altında değil; `web/patches.html`
    de öyle. Site sayfalarının **%52'si** (66/127) patch notu.
12. **`h10_gate_check` bugün açıkça `KAPI KIRMIZI — H1.0 açık` diyor** — yani listing görselinin
    yokluğu bir kapıya bağlanmış durumda, şartnamedeki §1 5/5 EKSİK satırı bu kapıyla uyumlu.

### Göremediğim / erişemediğim
- `reports/`, `Logs/`, `HEDEF.md`, `DAMLA-KUYRUK.md`, `devlog.md`, `linkedin.md`, `ANAYASA.md`
  **açılmadı** (kart §0.1 + K7). Bu yüzden R5 (`reports/gate/endustri-…txt`) ve L1
  (`reports/stitchu-vision-progress.md`) yalnız **varlık** olarak doğrulandı, içerik olarak değil.
- `docs/archive/` (mocks, tools, asset-guide — 39 dosya) ve `docs/reference/dis-llm-panel-a.html`
  **taranmadı** (arşiv; tur tavanı). İçlerinde iddia olabilir — **DOĞRULANMADI**.
- `web/` altındaki 127 sayfanın iddia metinleri **tam taranmadı**; yalnız `index.html` ve
  `api.html` üstünde hedefli grep yapıldı. Kalan 125 sayfanın iddiaları **ÖLÇÜLMEDİ**
  (özellikle `benchmark.html`, `showcase.html`, `signature.html`, `studio.html`, `create.html`,
  66 patch sayfası).
- `gen-factory-pack.mjs`, `gen-techpack-pdf.mjs`, `gen-satis-pdf.mjs`, `gen-gore-*`, `gen-wrap-*`,
  `gen-taste-pool.mjs`, `gen-vocab.mjs`, `gen-contract.mjs`, `gen-constants.mjs`, `gen-spec-v2*`
  **koşturulmadı** — bugün çalışıp çalışmadıkları **ÖLÇÜLMEDİ**.
- `/api/draft` ve `/api/grade` **canlı uca istek atılmadı** — sadece repo kodu ve `api_wire_check`
  görüldü. Canlı çalıştığı **DOĞRULANMADI**.
- Kalan 3 kırmızı testin (`bugra_bridge_check`, `preview_truth_check`, `figure_check`) hata
  metinleri okunmadı — sadece FAIL oldukları sayıldı.

---

## KALAN İŞ (sonraki faz için)
- `web/` 125 sayfanın iddia taraması (özellikle `benchmark.html` — R18'in 27/54'ünü tekrarlıyor olabilir).
- `docs/archive/` iddia taraması.
- Koşturulmamış 11 `gen-*` aracının bugün çalışıp çalışmadığı.
- `web-fuzz.js`'in 3 hatasının kaç spec kombinasyonunu kapsadığı.
