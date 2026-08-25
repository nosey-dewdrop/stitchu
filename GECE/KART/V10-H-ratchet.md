# KART V10-H — YENİ KIRMIZI AD `generated_ratchet_check` (etiket: SIRALI, son)

## NE
Bu fazda 44 ÜRETİLMİŞ dosya ELLE düzenlendi → `generated_ratchet_check`
KIRMIZI düştü. **RULES 9: kırmızı AD kümesi büyüyemez.** Bu ad kapanacak.
Yol, kapının kendi yazdığı yoldur: **üreteci KOŞTUR, sonra `--accept`, manifest
AYNI commit'te.** El düzenlemesini manifeste yamalamak REDDEDİLİR.

## GİRDİ DOSYALARI (isim isim)
- `ENV.md`, `RULES.md`
- `engine/tests/generated_ratchet_check.sh` (kapı — DEĞİŞTİRME, yalnız koştur/`--accept`)
- `engine/tools/gen-style-pages.mjs` (V10-F düzeltti; ASIL ÜRETEÇ bu)
- `GECE/V10-F.md` §3 ve §5 (hangi üreteç koşuyor, hangisi koşmuyor)
- `GECE/V10-G.md` (elle yazılmış 12 sayfanın metni)
- `engine/tests/landing_truth_check.mjs` + `engine/tests/landing-truth-baseline.json` (yalnız KOŞTUR)
- `engine/tools/site-health.mjs`, `engine/tools/site-version.mjs`
- Bayt kayan 44 dosyanın listesi: `bash engine/tests/generated_ratchet_check.sh`

## SIRA (kesin)
1. **Kayan 44 dosyanın her birinin ÜRETECİNİ bul** (manifest/üreteç eşlemesi
   kapının kendi dosyasında ya da `engine/tools/gen-*.mjs` başlıklarında).
2. **Koşabilen üreteçleri KOŞTUR** — gerçek yeniden üretim, `web/` üstüne.
   Koşamayan üreteç varsa (`web/patterns/` silinmiş, V10-F §5) o dosyayı
   ADIYLA yaz; onun için el düzenlemesi tek yol ise bunu **açıkça ilan et**
   ve `--accept` gerekçesine yaz. Gizleme.
3. **ÜRETİM SONRASI ÜÇ DOĞRULAMA — üçü de geçmeden `--accept` YOK:**
   - `node engine/tests/landing_truth_check.mjs` → **EXIT 0**, ve
     **L2 hâlâ 0** olmalı. ★ Bu, V10-F'in kök onarımının GERÇEK kanıtıdır:
     üreteç koştu ve yalan geri GELMEDİ. L2 yükselirse üreteç hâlâ yalan
     basıyordur → üreteci düzelt, tabana DOKUNMA.
   - `node engine/tools/site-health.mjs` → EXIT 0, ölü link 0.
   - `?v` damgası tek değer kalmalı (`grep -rhoE '\?v=[^"'"'"' ]+' web/ | sort -u`).
     Üreteç damgayı oynattıysa `site-version.mjs`'in bastığı değere sadık kal;
     ELLE değiştirme.
4. `bash engine/tests/generated_ratchet_check.sh --accept` → manifest güncellenir.
5. `ctest --test-dir engine/build -R '^(generated_ratchet_check|landing_truth_check|docs_truth_check|bundle_fresh_check)$' --output-on-failure`
   → **4/4 Passed**. Çıktı `GECE/log/V10-H.ctest.txt`.

## ÇIKTI
- Yeniden üretilmiş `web/**` + güncellenmiş manifest (AYNI commit)
- `GECE/V10-H.md` — hangi üreteç koştu · hangi dosya elle kaldı ve NEDEN ·
  L1..L5 önce/sonra · üç doğrulamanın komutu ve çıktısı
- `GECE/log/V10-H.ctest.txt`, `GECE/log/V10-H.kapi.txt`

## YASAKLAR
- `generated_ratchet_check.sh`'ı ya da `landing_truth_check.mjs`'i DEĞİŞTİRME.
- Kapıyı `-E` ile dışlama, CMake'ten çıkarma, DISABLED yapma — bu gevşetmedir,
  fazı düşürür (§7.1).
- Tabanı YÜKSELTME. `?v`'yi elle değiştirme. `docs/`, `README.md`,
  `GECE/KOSU.md` yasak. `git add -A` yok.
- **DEPLOY YAPMA.**

## SÜRE TAVANI
50 dk. Tavanda kapanmadıysa: o ana kadarki iş commit'lenir ve
`GECE/V10-H.md`'ye "YENİ KIRMIZI AD AÇIK KALDI: generated_ratchet_check"
diye ADIYLA yazılır — susturulmaz.

## COMMIT
`git commit -m "v10-h: regenerate the style pages from the fixed producers and move the ratchet manifest with them"`
