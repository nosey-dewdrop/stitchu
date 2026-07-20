# stitchu — 27 FULL Kalıp Teknik Taraması

**Tarih:** 2026-07-20
**Kapsam:** benchmark-58 `results-2026-07-18.json` içindeki `cls:"FULL"` işaretli 27 giysi.
**Kural:** SADECE ölçüm+rapor. Motor kodu, golden, deploy, commit YOK.
**Araç:** `engine/tools/full-scan-27.mjs` (bu tarama için eklenen salt-okunur analiz scripti; motor/golden'a dokunmaz).

---

## 0. Kanıt: motor değiştirilmedi

- `engine/golden-reference.csv` → md5 `7c3d83f237c7596d573f6155da72a918`, 23406 satır = repo pini (`engine/GOLDEN-PIN.md`) ile **byte-identical**.
- `git status`: `engine/src/`, `engine/dist/`, `golden-reference.csv` **değişmedi**. Tek yeni dosya: `engine/tools/full-scan-27.mjs` (analiz scripti) + bu rapor.
- Ölçüm zinciri, canlı ürünün kullandığı köprünün AYNISI: `benchmark-58.mjs`'in `mapVisionSpec` fonksiyonu (web/js/vision-bridge.js pick*) → `engine/dist/stitchu-engine.js` `draftJSON(spec, body)`. Özel bir kopya değil, gerçek zincir ölçüldü.
- Vücut: EU38 yakını, `{bust:90, waist:72, hip:98, shoulder:38, backLength:40, armLength:58, neck:36}` (benchmark ile aynı).

---

## 1. En önemli bulgu: motorun KENDİ validator'ı otoriter dikiş-eşleştirmesini zaten yapıyor

`engine/src/validator.cpp` her gerçek dikiş çiftini **yapı-farkında** (index değil, rol) ölçer ve `pairedSeamTolerance = 3.0mm`'ye karşı kontrol eder:
- yan dikiş ön/arka (satır 195), prenses panel çiftleri (satır 248), gore çiftleri (satır 555-583), bel-birleşim hizası (satır 533-549), kol başı ease penceresi (satır 334-340), pens matematiği bele oturuyor mu (satır 230).

**27 FULL giysinin HEPSİ validator'dan 0 issue ile geçti** (draftJSON `issues:[]` — hiçbiri validator-bloke değil). Yani motorun kendi exact dikiş matematiği 27'sinde de ≤3.0mm.

### Geometrik tarama ölçümünün sınırı (dürüstlük notu)
Ek olarak `precision-report.js`'in geometrik ölçüm mantığını (Bézier düzleştirip komut-index'inden kenar uzunluğu) 27'ye uyguladım. **Bu ölçüm index-tabanlı ve `precision-report.js` sadece 3 spec'e (scoop/crew yaka) kalibre.** `square` yaka ön parçaya fazladan bir `line` komutu ekler (10 komut vs crew/boat 9) → tüm index'ler kayar → o giysilerde geometrik Δ artefakt üretir (162mm gibi). Aynı şekilde boat/crew prenses+aLine+cap-sleeve kombinasyonunda bel-yay index'i farklı role denk gelir (Jackie "waist F" 72.9mm = artefakt, `waist B` = 0). Bu sayılar **motor kusuru DEĞİL, ölçüm-index kayması** — kanıt: validator o giysileri exact rol-eşleştirmeyle 0 issue geçirdi. Bu satırlar tabloda `ÖLÇÜLMEDİ*` / `(idx)` işaretli.

---

## 2. Ölçülen değerler (gerçek sayı, tahmin yok)

- **Dikiş payı (seam allowance):** 27 giysinin TÜM yapısal parçaları uniform **15mm**. Bias binding 6mm (bias-bound kenar için doğru), facing/işaretli-çizgi parçaları 0mm (çizili hatta dikilir — CLAUDE.md openback/facing tasarımı). Tutarlı.
- **Kol başı ease (cap ease):** kol taşıyan giysilerde (Jackie ailesi) %3.9–4.1 → 0–10% penceresinde, sağlıklı.
- **Parça sayısı emsal bandı:** üst 3–8 parça, elbise 5–11 parça. (Bugra Plain Bustier Dress emsali ~4 panel + dikdörtgen etek — CLAUDE.md.) Band tutarlı.
- **A4 sayfa (areaPages):** üst 7–15, elbise 12–24. **NOT:** bu bbox-alan-toplamı/A4 alt-sınırı, gerçek skyline packer (`web/js/sheet.js`) çıktısı DEĞİL — kaba emsal göstergesi. Gerçek sayfa için `render-pages.mjs` gerekir.
- **Geometrik kenar-çifti Δ (index güvenli yakalarda):** crew/boat/scoop/vNeck giysilerinde worst **0.00–0.72mm** → `precision-report.js`'in yayınlanan 0.00mm sınıfıyla uyumlu.

---

## 3. Giysi tablosu (27 satır)

`kenar-çifti-max` sütunu: geometrik ölçüm; `(idx)`=index-role kayması artefaktı; `ÖLÇÜLMEDİ*`=square yaka, geometrik index kayar (validator ile PASS). SA=seam allowance. flat-eşleşme: preview-truth.mjs 4 flat stili yapısal olarak eşliyor (tüm giysiler değil — flat sadece 4 stil için var, aşağıya bak).

| # | Giysi | yaka | kenar-çifti-max-mm | ease | pens-ok | seam-ok | flat-eşleşme | VERDİKT | eksik (tek satır) |
|---|-------|------|--------------------|------|---------|---------|--------------|---------|-------------------|
| 1 | Celine Blouse (gingham button) | boat | 0.71 | — | ✓(validator) | 15mm ✓ | n/a | **GEÇEN** | — |
| 2 | Priscilla Babydoll (worn) | square | ÖLÇÜLMEDİ* | — | ✓(validator) | 15mm ✓ | n/a | **GEÇEN** | geometrik ölçüm square'de kaydı; validator 0-issue |
| 3 | Priscilla Babydoll (close-up) | square | ÖLÇÜLMEDİ* | — | ✓(validator) | 15mm ✓ | n/a | **GEÇEN** | aynı, square index kayması |
| 4 | JACKIE 60s linen mini (tie) | crew | 0.12 | — | ✓(validator) | 15mm ✓ | n/a | **GEÇEN** | — |
| 5 | the Jackie gingham (cover) | boat | 72.86 (idx) | 3.9% | ✓(validator) | 15mm ✓ | n/a | **GEÇEN** | waist-join Δ index artefaktı (waist B=0) |
| 6 | the Jackie gingham (worn) | crew | 72.86 (idx) | 4.1% | ✓(validator) | 15mm ✓ | n/a | **GEÇEN** | aynı waist index artefaktı |
| 7 | the Jackie gingham (back) | crew | 0.00 | 4.1% | ✓(validator) | 15mm ✓ | n/a | **GEÇEN** | — |
| 8 | the Jackie gingham (front) | boat | 72.86 (idx) | 3.9% | ✓(validator) | 15mm ✓ | n/a | **GEÇEN** | aynı waist index artefaktı |
| 9 | Jackie blouse (polka) | boat | 0.72 | 3.9% | ✓(validator) | 15mm ✓ | n/a | **GEÇEN** | — |
| 10 | Heloise Dress (boat fit&flare) | boat | 0.24 | — | ✓(validator) | 15mm ✓ | n/a | **GEÇEN** | — |
| 11 | Lua Babydoll (milkmaid) | square | ÖLÇÜLMEDİ* | — | ✓(validator) | 15mm ✓ | n/a | **GEÇEN** | square index kayması; validator 0-issue |
| 12 | Jana Dress (princess mini) | square | ÖLÇÜLMEDİ* | — | ✓(validator) | 15mm ✓ | n/a | **GEÇEN** | square index kayması; validator 0-issue |
| 13 | Laura Mini Summer (cover) | crew | 0.12 | — | ✓(validator) | 15mm ✓ | n/a | **GEÇEN** | — |
| 14 | Laura Mini (flat sketch) | scoop | 0.12 | — | ✓(validator) | 15mm ✓ | n/a | **GEÇEN** | — |
| 15 | Hallie tank mini (green) | scoop | 0.12 | — | ✓(validator) | 15mm ✓ | n/a | **GEÇEN** | — |
| 16 | Tie Back Mini (open back) | boat | 0.24 | — | ✓(validator) | 15mm ✓ | n/a | **GEÇEN** | — |
| 17 | Tie Back Mini (polka back) | boat | 0.24 | — | ✓(validator) | 15mm ✓ | n/a | **GEÇEN** | — |
| 18 | Emma Top (yellow gingham) | square | ÖLÇÜLMEDİ* | — | ✓(validator) | 15mm ✓ | n/a | **GEÇEN** | square; ölçülen çift yok, worst=0, validator 0-issue |
| 19 | Buttoned Blouse (black fitted) | crew | 0.00 | — | ✓(validator) | 15mm ✓ | n/a | **GEÇEN** | — |
| 20 | Boat Neck Top (beige shell) | boat | 0.71 | — | ✓(validator) | 15mm ✓ | n/a | **GEÇEN** | — |
| 21 | Boat Neck Top (flat sketch) | boat | 0.71 | — | ✓(validator) | 15mm ✓ | n/a | **GEÇEN** | — |
| 22 | Boat Neck Top (back worn) | boat | 0.71 | — | ✓(validator) | 15mm ✓ | n/a | **GEÇEN** | — |
| 23 | Boat Neck Top (front worn) | boat | 0.71 | — | ✓(validator) | 15mm ✓ | n/a | **GEÇEN** | — |
| 24 | Serene Fit Blouse (V-neck) | vNeck | 0.00 | — | ✓(validator) | 15mm ✓ | n/a | **GEÇEN** | — |
| 25 | Boatneck Button Down (cover) | boat | 0.00 | — | ✓(validator) | 15mm ✓ | n/a | **GEÇEN** | — |
| 26 | Boatneck Button Down (grid 1) | boat | 0.00 | — | ✓(validator) | 15mm ✓ | n/a | **GEÇEN** | — |
| 27 | Boatneck Button Down (grid 2) | boat | 0.71 | — | ✓(validator) | 15mm ✓ | n/a | **GEÇEN** | — |

**flat-eşleşme n/a:** `contract/preview-truth.mjs` sadece 4 flat stili (drawstring/shirred babydoll, courtney_lace_vneck vb.) için flat↔kalıp yapısal eşleştirmesi yapıyor; 27 benchmark giysisi için ayrı flat çizimi yok. preview-truth ayrı koşuldu: 4 flat stilin TÜM yapısal öğeleri kalıpta karşılık buldu (sapmalar contract'ta DECLARED/pinli — tasarım kararı, kusur değil).

---

## 4. Verdikt özeti

| Verdikt | Sayı |
|---------|------|
| **GEÇEN** | **27** |
| DÜZELTİLEBİLİR | 0 |
| ELENEN | 0 |

27/27 GEÇEN. Neden: (a) motorun kendi validator'ı 27'sinin her gerçek dikiş çiftini exact ölçüp ≤3.0mm geçiriyor; (b) index-güvenli yakalarda geometrik ölçüm 0.00–0.72mm (yayınlanan 0.00mm sınıfıyla uyumlu); (c) seam allowance uniform 15mm; (d) cap ease %3.9–4.1 pencerede; (e) parça/sayfa emsal bandında.

---

## 5. Dürüst kalan sınırlar (ölçülemeyen / açık)

1. **square yaka + prenses+cap-sleeve waist-join** giysilerinde bağımsız geometrik doğrulama YAPILAMADI — `precision-report.js`'in index haritası bu yapılara kalibre değil. Bu giysiler yalnızca motorun kendi validator'ıyla doğrulandı. **v1.1 adayı:** precision-report.js'i yapı-farkında (rol/notch tabanlı) kenar eşleştirmeye çıkarmak → square/reshaped yakalarda da bağımsız mm doğrulaması.
2. **A4 sayfa sayısı** bbox-alan-alt-sınırı; gerçek skyline packer çıktısı ölçülmedi (bu tarama render-pages çalıştırmadı — deploy/render kanıtı istenmedi).
3. **flat↔kalıp eşleşme** 27 giysi için değil, sadece 4 flat stili için var (kapsam sınırı, kusur değil).
4. **Fit (giyilebilirlik) kanıtı** bu taramanın kapsamı değil — iç tutarlılık ve dikiş-eşleşme ölçüldü, fiziksel muslin değil (CLAUDE.md'nin kalıcı "internal consistency ≠ fit proof" kuralı geçerli).
