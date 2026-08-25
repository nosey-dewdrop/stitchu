# KART V10-I — HAKEM "KALDI" DEDİ, ONAR (etiket: SIRALI, son)

Hakem hükmü `GECE/KAPI.md` (`02bcb1e`), bulgular `GECE/log/V10-hakem.txt`.
Pazarlık yok: aşağıdaki dört kalem kapanmadan faz kapanmaz.

## GİRDİ DOSYALARI (isim isim)
- `ENV.md`, `RULES.md`
- `GECE/log/V10-hakem.txt` + `GECE/KAPI.md` (hakemin ölçtüğü sayılar)
- `engine/tests/landing_truth_check.mjs` (yalnız L2 kalıp listesine EKLEME)
- `engine/tests/landing-truth-baseline.json`
- `web/**`, `engine/tools/gen-*.mjs`
- `engine/tests/generated_ratchet_check.sh` (üretilmiş dosya düzenlersen `--accept` şart)

## 1) L2 TEK DİLLİ — TÜRKÇE YALAN YAYINDA (hakem md.6)
18 kalıbın 18'i İngilizce. Site iki dilli (`web/js/shared-header.js:20` `data-tr`'yi
canlı metne çeviriyor). HEAD'de **127** Türkçe duran-iddia yayında:
`bayt-birebir` 50 · `bayt-aynı` 43 · `sıfır hata` 32 · `kusursuz` 2.
- Türkçe kalıpları L2 listesine **EKLE** (İngilizce kalıpları SİLME):
  `bayt-birebir`, `bayt-aynı`, `bayt bayt aynı`, `sıfır hata`, `kusursuz`,
  `hatasız`, `her zaman`, `ölçülerinize göre`, `kendi ölçülerinizle`,
  `sabit beden yok`, `ısmarlama`, `vücudunuza göre`.
- Sonra bu 127 örneği `web/**` içinde SÜPÜR (İngilizce ikizinin bugünkü dürüst
  karşılığını kullan — iki dil ÇELİŞMESİN).
- ★ Aynı kalıpları ÜRETEÇLERDE de kes (`engine/tools/gen-*.mjs`); üreteç
  koşturulabiliyorsa koştur (V10-H emsali), koşamıyorsan ADIYLA yaz.

## 2) L1 MUHASEBESİ YALANLIYOR — GERİ AL (hakem md.5, EN AĞIR)
`git diff 9b306f9..HEAD` içinde `golden_check` **+224**, `engine_check` **+60**
EKLEME var. HEAD'de sayı taşıyıp YALNIZ bu iki jetonla aklanan blok **81**.
Hakemin kanıtı: `12.5 mm` uydurma cümlesi KIRMIZI, aynı cümle + `(site-health)`
YEŞİL. Yani jeton eklemek sayıyı doğrulamıyor, **kapıyı aklıyor.**
- O 81 bloğu tek tek yargıla. Her biri için ÜÇ seçenekten biri:
  (a) sayıyı GERÇEKTEN basan aleti bul, KOŞTUR, çıktısını `GECE/log/V10-I.alet.txt`'ye
      yaz ve aletin adını bırak;
  (b) alet yoksa **SAYIYI VE CÜMLEYİ SİL** (jetonu da sil);
  (c) sayı içerik talimatıysa (dikiş payı, kumaş eni gibi) motor iddiası değildir —
      ADIYLA muaf yaz, ama muafiyeti kapıya GÖMME, `GECE/V10-I.md`'ye yaz.
- ⚠ Jetonu silince L1 YÜKSELİR. Doğru cevap tabanı yükseltmek DEĞİL, cümleyi
  silmektir. **Taban YÜKSELEMEZ.**
- `web/patches.html:352` mekanik değiştirmeden bozulmuş: *"…is now unchanged
  under golden_check to the live web build"* — cümle İngilizce olarak bozuk,
  `data-tr`'si hâlâ "bayt-aynı" diyor. İkisini de onar.

## 3) TABANI HEAD'DE YENİDEN KES + `_note`'U DÜRÜSTLEŞTİR (hakem md.10, 4)
Taban `c72f650`'de kesildi, HEAD çok ilerde; L1 tam tavanda (937/937), sıfır pay.
- Bitirince `--baseline --note="..."` ile HEAD'de yeniden kes.
- `_note`/`_neden0Degil` metni GERÇEĞİ yazsın: L1'in sağlayıcı eşleşmesi
  **substring**'dir, "alet adı var" ≠ "sayı o aletten çıktı"; L2 artık iki dilli;
  L4 bu fazda hiçbir borç taşımadı (faz öncesinde de 0'dı).
- Hiçbir L sayısı bir önceki tabanın ÜSTÜNE çıkamaz.

## 4) RULES 9 — İKİ CTEST LOGU VE KARTLAR AĞAÇTA YOK (hakem md.11)
`GECE/log/V10.ctest.opening.txt`, `GECE/log/V10.ctest.final.txt`,
`GECE/log/V10.build.*.txt` ve `GECE/KART/V10-*.md` **untracked**.
RULES 9 iki ctest logunun commit'e girmesini şart koşuyor. Hepsini `git add` et.

## ÇIKTI
- Değişen `web/**`, `engine/tools/gen-*.mjs`, `engine/tests/landing_truth_check.mjs`,
  `engine/tests/landing-truth-baseline.json`, gerekiyorsa `contract/generated-paths.sha256`
- `GECE/V10-I.md` — dört kalem için ÖNCE/SONRA sayısı + komut; 81 bloğun
  hangisinin (a)/(b)/(c) olduğu; düzeltilemeyen her kalem SEBEBİYLE
- `GECE/log/V10-I.kapi.txt`, `GECE/log/V10-I.mutasyon.txt` (yeni Türkçe
  kalıpların her biri için §4.5 mutasyonu: kır → geri al), `GECE/log/V10-I.alet.txt`

## KAPANIŞ DOĞRULAMASI (hepsi geçmeden commit yok)
1. `node engine/tests/landing_truth_check.mjs` → EXIT 0
2. `bash engine/tests/generated_ratchet_check.sh` → YESIL
3. `node engine/tools/site-health.mjs` → EXIT 0, ölü link 0
4. `ctest --test-dir engine/build -R '^(landing_truth_check|generated_ratchet_check|docs_truth_check|bundle_fresh_check)$' --output-on-failure` → 4/4 Passed

## YASAKLAR
- Kapıyı GEVŞETME: kalıp SİLME, muafiyet GÖMME, taban YÜKSELTME, testi
  DISABLED yapma (§7.1). Yalnız EKLEME serbest.
- `docs/`, `README.md`, `GECE/KOSU.md`, `GECE/KAPI.md`, `engine/src/`,
  `contract/layers/` yasak.
- **DEPLOY YAPMA.** `?v`'yi elle değiştirme. `git add -A` yok.
- Sahte sağlayıcı jetonu EKLEME — bu kartın varlık sebebi o.

## SÜRE TAVANI
60 dk. Tavanda: o ana kadarki iş + kesilmiş taban commit'lenir, kalan kalemler
`GECE/V10-I.md`'de "AÇIK KALDI" başlığı altında ADIYLA yazılır.

## COMMIT
`git commit -m "v10-i: referee repairs — turkish standing claims named and swept, laundered provider tokens reverted, baseline recut at head"`
