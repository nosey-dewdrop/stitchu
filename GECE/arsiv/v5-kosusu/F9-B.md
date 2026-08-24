# F9-B — DOCS BÜYÜK TURU, UYGULAMA (katip)

Tarih: 2026-08-22. Girdi: `GECE/F0-C.md` §1–§4 (hüküm sütunu).
Yazma alanı: `README.md`, `docs/ARCHITECTURE.md`, `docs/KATMAN-HARITASI.md`,
`docs/SATIS-SARTNAMESI.md`, `docs/loop-engineering.md`, `GECE/INDEX.md`, bu dosya.
Kod/`web/`/`contract/`/`scripts/` DEĞİŞTİRİLMEDİ. Commit atılmadı.

## 0. HÜKÜM SAYIMI (kart "23" diyor — ölçüldü)

F0-C'de "güncelle" hükmü toplam **23** satırda var, ama **3'ü §5 (`web/`)**:
W1, W2, W4. Kart §5'i açıkça F10'a bıraktığı için bu fazın uygulayacağı küme
**20 iddia**:

- §1 README (9): R2 · R4 · R7 · R10 · R13 · R14 · R18 · R20 · R21
- §2 ARCHITECTURE (8): A1 · A5 · A8 · A9 · A10 · A11 · A14 · A15
- §3 SATIS-SARTNAMESI (3): S1 · S5 · S12
- §4 KATMAN-HARITASI + loop-engineering (0): K1–K4 "kal", L2 "kal",
  L1 hükmü "ÖLÇÜLMEDİ" (güncelle değil) → aşağıda L1 için ne yapıldığına bak.

(İlerleme buradan aşağıya, dosya bitirildikçe eklendi.)

## 1. README.md — 9/9 hüküm uygulandı

Önce ölçüm (`Glob`, kartın "ÖNCE GREP" maddesi): `flatten-research/FINDINGS.md`,
`docs/RECETE-SPEC.md`, `PROJECT.md`, `PLAN.md`, `engine/SPECS-next-vocabulary.md`
diskte **YOK**. `engine/FORMULAS.md` **VAR**. `recipes/` **VAR, 3 dosya**.
`docs/` altında yalnız 4 md var (loop-engineering, KATMAN-HARITASI,
SATIS-SARTNAMESI, ARCHITECTURE) → F0-C'nin ölü-yol tespitleri doğrulandı.

| # | eski cümle (kısaltılmış) | yeni cümle |
|---|---|---|
| R2 | "That is the sealed architecture (`flatten-research/FINDINGS.md`, 28 Jul)" | mühür duruyor, ama parantez artık "o not diskte yok" diyor; yaşayan tanık `engine/src/flatten.cpp` + `surfacepattern.cpp`, sayıyı basan `flatten_check` / `surface_pattern_check` |
| R4 | "EU50 and EU52 have no published ratio and are not claimed." | `shape-ratios.json` 8 beden yayınlıyor (EU34…EU48) + **⚠ üç yüzey üç aralık** uyarısı (README 34-48, `web/index.html` gövde 52 / meta 48, `recipe_grade_check` 10 beden). "Hangisi doğru" Damla'ya bırakıldı |
| R7 | "**10/10 sizes validator-clean** … growth jumps +20.40 → +30.60" | "state is whatever ctest `recipe_grade_check` prints"; 10 bedenlik koşu + 22 Ağu yeşil kaydı `GECE/log/F0v3.ctest.txt`; sıçrama sayısı aynı satırda `recipe_grade_check`'e bağlandı |
| R10 | "Contract: `docs/RECETE-SPEC.md`" | dosya yok denildi; yerine `engine/src/recipe.{hpp,cpp}` + `contract/garment-spec.schema.json`, kapı `recipe_check`/`contract_check`, **`contract_check` 22 Ağu KIRMIZI** notuyla |
| R13 | "**Clean-build test suite: 77/77 green**" | "whatever `ctest --test-dir engine/build` prints"; `ctest -N` = 96, 22 Ağu koşusu 89 geçti / 7 kırmızı, 238.33 sn, 7 kırmızının **adları** yazıldı |
| R14 | "the six industry gates also ran together 6/6" | GERİ ÇEKİLDİ (silinmedi): ağaçta "industry gates" adlı koşucu yok, iddia yeniden koşulamıyor — R13 satırının parantezinde gerekçesiyle duruyor |
| R18 | "the engine drafts **27 of 54** real garment photos" | "CANNOT BE RE-RUN TODAY (2026-08-22)": alet `engine/tools/benchmark-58.mjs` var, girdi `benchmark-58/` diskte yok; 27/54 ve 37/54 **tarih** olarak korundu, güncel durum olarak değil |
| R20 | "web: static HTML/CSS/JS on GitHub Pages" | ⚠ iki yayıncı birden ilan edilmiş (`pages.yml` + `web/vercel.json`, giriş `scripts/deploy.sh`); canlı 200 curl ile, **hangisinin sunduğu ÖLÇÜLMEDİ**; sağlık sayıları `site-health.mjs` çıktısıyla |
| R21 | repo layout'ta `docs/RECETE-SPEC.md` satırı | şema+kod yoluna çevrildi; `recipes/` satırına 22 Ağu'da diskte olan 3 dosyanın adı yazıldı |

### README'de KAPSAM DIŞI ama YAPILAN 3 düzeltme (gerekçe)
F0-C bunlara "kal" dedi (çünkü iddia **doğru**), ama kartın "NASIL YAZILIR"
maddesi ve paralel işçinin kurduğu `docs_truth_check` "her sayının **aynı
satırında** aleti geçecek" diyor. Bu üç satırda sayı vardı, tanık yoktu:
- R15 "Seam-pair precision: worst pair 0.00 mm." → aynı satıra
  `node engine/tools/precision-report.js` + 22 Ağu koşu çıktısı eklendi. **Sayı
  değişmedi**, tanık eklendi.
- R16 "DXF millimetre parity: 0.000e+00 mm" → aynı satıra ctest `dxf_check`.
- R17 "output stays byte-identical" → yasak kalıp; "bunu ctest `golden_check`
  karara bağlar, 22 Ağu'da yeşildi" oldu.
Üçünde de **iddianın içeriği korundu**, yalnız duran-iddia biçimi tanıklı
biçime çevrildi. Kapsam dışıydı, saklamıyorum.

## 2. docs/ARCHITECTURE.md — 8/8 hüküm uygulandı

Ölçüm: `Glob` ile `HEDEF.md`, `DAMLA-KUYRUK.md`, `ROADMAP.md`, `scripts/deploy.sh`,
`engine/tools/site-version.mjs`, `web/vercel.json`, `backend/worker.js`,
`engine/dist/stitchu-engine.js` **VAR**; `PROJECT.md`, `PLAN.md`,
`engine/SPECS-next-vocabulary.md` **YOK** → F0-C doğrulandı.

| # | eski | yeni |
|---|---|---|
| A1 | "Companion docs: `engine/FORMULAS.md`, `PROJECT.md` (roadmap), `PLAN.md`" | FORMULAS.md kaldı (22 Ağu'da diskte); PROJECT/PLAN "diskte yok" diye yazıldı, canlı yüzey olarak `HEDEF.md` + `DAMLA-KUYRUK.md` gösterildi |
| A5 | "**8 ctest suites.**" | "whatever `ctest -N` prints" — 22 Ağu'da **96**, koşu 89/7 (`GECE/log/F0v3.ctest.txt`); eski 8 sayısı gerekçesiyle anıldı, sessizce silinmedi |
| A8 | "`tools/web-fuzz.js` … **19,555 drafts, 0 failures**" | ⚠ **RED on 2026-08-22**: birebir çıktı `26260 drafts \| 6513 validator-blocked \| max 102 sheets \| 3 FAILURES`, exit 1; 3 hatanın metinleri yazıldı; kaç kombinasyon **NOT measured**. Ayrıca yeni satır: web-fuzz ctest'e **bağlı değil** (required loop'ta adı var, kapısı yok) |
| A9 | "single-file bundle … **~218 KB**" | `ls -l` 22 Ağu: **1 128 760 bayt ≈ 1.1 MB**, eski sayının 5.2 katı |
| A10 | "Cache-busting is manual: bump `?v=N` … (deploy = `git subtree split` → `gh-pages`)" | `?v` tek kaynak `engine/tools/site-version.mjs`, gerilemeyi `site-health.mjs` kapıyor (22 Ağu çıktısı birebir); deploy `scripts/deploy.sh` + `pages.yml` + `vercel.json` |
| A11 | "**Planned:** `POST /api/draft` … the sellable API" | "no longer planned: it is written" — `backend/draft.js:1`, `worker.js:70` (`/api/draft`), `:94` (`/api/grade`), kapı `api_wire_check`; **canlı uç NOT measured (2026-08-22)** |
| A14 | "`engine/SPECS-next-vocabulary.md` is an UNVERIFIED agent draft" | dosya diskte yok → "gözden geçirilecek taslak yok" |
| A15 | "Deploy/cache is manual and fragile" (Known limits) | üstü çizildi + "Stale, corrected 2026-08-22" + `site-health.mjs` tanığı. Known limits'e **iki yeni dürüst sınır** eklendi: (a) süit sağlığı ctest'in dediğidir, 22 Ağu'da 7/96 kırmızı, adlarıyla; (b) ölü doküman yollarını tutan kapı YOK — `site-health.mjs` yalnız `web/` içi link tarıyor |

### ARCHITECTURE'da KAPSAM DIŞI ama YAPILAN 4 düzeltme (yasak kalıp temizliği)
Kartın yasak listesindeki kelimeler F0-C'nin saymadığı satırlarda da duruyordu:
- `:30` (A3, "kal") "the base draft is **byte-identical** without it" → kararı
  `golden_check` veriyor biçimine çevrildi; iddia aynı.
- `:39` "a **byte-identical** base draft" → "unchanged to the byte", kapı adıyla.
- `:73` "must keep the matrix **ALL PASS** and the base draft byte-identical" →
  `engine_check` + `golden_check` adlarına bağlandı.
- `:74` "discipline codified in **`PLAN.md`**" → ölü yol (A1 ile aynı kök);
  yaşayan biçim `RULES.md` "Per-feature discipline" olarak gösterildi.
- `:80` "geometric validation is **complete**" → "the set of `_check` gates in
  ctest, nothing wider".
- `:41` (A7, "kal") "worst pair **is now** 0.00 mm" → duran hâlden 22 Ağu koşu
  çıktısına çevrildi, alet adı zaten aynı satırdaydı.
