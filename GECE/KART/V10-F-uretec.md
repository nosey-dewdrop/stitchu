# KART V10-F — YALANIN KÖKÜ: ÜRETEÇLER (etiket: PARALEL, V10-E ile)

## NE
V10-D 91 sayfadan MTM ve duran-iddia dilini sildi. Ama o sayfaları ÜRETEN
aletler hâlâ aynı yalanı basıyor — biri koşarsa yalan geri gelir.
Kökü kes: **üreteçlerin şablon metnini düzelt.**

## GİRDİ DOSYALARI (isim isim)
- `ENV.md`, `RULES.md`
- `GECE/V10-D.md` §8 ve "KART DIŞI FARK EDİLEN" md.1 (üreteçlerin ADLI listesi)
- `engine/tools/gen-style-pages.mjs` (≈`:730` `const GOLDEN = '0.000000 mm'`,
  ≈`:810` "to your own measurements … with no fixed sizes")
- `engine/tools/gen-collection-pattern.mjs` (≈`:113`, `:119`)
- `engine/tools/` altında `grep -rIlF "byte-identical" engine/tools/` ile
  çıkan diğer dosyalar (28 satır bildirildi)
- `contract/layers/shape-ratios.json` (motorun GERÇEK kümesi: 8 beden EU34–48)
- `engine/tests/landing_truth_check.mjs` (yalnız KOŞTURMAK için; DEĞİŞTİRME)

## YAPILACAK
1. Üreteçlerin ürettiği metinden şu kalıpları ÇIKAR ve dürüst karşılığını koy:
   `made to measure` · `your own measurements` · `your measurements` ·
   `no fixed sizes` · `byte-identical` · `zero issues` · `always` ·
   `0.000000 mm`. RULES 6: duran-iddia yerine **sayıyı basan aletin ADI**.
   ⚠ `0.000000 mm` uydurma hassasiyet: `engine/tools/precision-report.js`
   `toFixed(2)` ile İKİ basamak basıyor.
2. **KANIT (zorunlu, RULES 3):** üreteci geçici bir çıktı dizinine koştur
   (`--out=/tmp/v10f-out` ya da eşdeğeri; **`web/` üstüne YAZMA** — orada başka
   işçi var) ve üretilen HTML'de kalıp sayısının **0** olduğunu
   `grep -c` ile bas. Komut + çıktı `GECE/log/V10-F.uretec.txt`'ye.
   Üreteç çıktı dizini parametresi almıyorsa: eklemek serbesttir (küçük,
   geriye dönük uyumlu, varsayılan eski davranış) — ya da koşturamıyorsan
   "ÜRETEÇ KOŞTURULAMADI, sebep: …" diye ADIYLA yaz, uydurma.
3. `contract/tables.json` ile `contract/layers/shape-ratios.json` **birbirinin
   tersini söylüyor** (10 beden ↔ 8 beden; `tables.json:13,82,83`).
   ⚠ Bu bir KONTRAT kararıdır, tek taraflı DEĞİŞTİRME. Ölç, iki kaynağı ADIYLA
   yaz ve `DAMLA-KUYRUK.md`'ye 3.8.d satırı düşür (VARSAYILAN: 8 beden,
   çünkü `shaperatios.gen.hpp` EU48'de bitiyor ve EU50/EU52 sıfır oranla
   çiziliyor). Koda dokunmadan borcu ADIYLA kaydet.

## ÇIKTI
- Değişen `engine/tools/*.mjs`
- `GECE/log/V10-F.uretec.txt` — üreteç koşusu + `grep -c` kanıtı
- `GECE/V10-F.md` — kalıp başına ÖNCE/SONRA sayısı + dokunulan dosyalar +
  koşturulamayan üreteçler SEBEBİYLE
- `DAMLA-KUYRUK.md` — K-V10F kontrat çelişkisi satırı

## YASAKLAR
- **`web/` altına TEK BAYT YAZMA** (V10-E orada çalışıyor). Üreteci `web/`
  üstüne koşturma.
- `engine/tests/landing_truth_check.mjs` ve tabanını DEĞİŞTİRME.
- `docs/`, `README.md`, `GECE/KOSU.md`, `contract/` altında koda dokunma.
- Motor kaynak koduna (`engine/src/`) dokunma. Bu kart METİN/ŞABLON kartıdır.
- `git add -A` yok. DEPLOY YAPMA.

## SÜRE TAVANI
50 dk.

## COMMIT
`git commit -m "v10-f: the page generators stop emitting mtm and standing claims at the source"`
