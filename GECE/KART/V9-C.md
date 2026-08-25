# KART V9-C — KÂTİP 1: `README.md` + `docs/ARCHITECTURE.md`

ETİKET: **PARALEL** (V9-D · V9-E · V9-F ile aynı anda; dosya kümesi kesişmiyor)
SÜRE TAVANI: **60 dk** (tavana gelirsen o ana kadarki işi COMMIT'LE)

## NE
Bu iki dosyayı BUGÜNKÜ KODA karşı oku ve `docs_truth_check`'in bu iki dosyada
bastığı HER ihlali kapat: D1 (duran iddia) **0**, D2 (ölü repo yolu) **0**,
D3 (sağlayıcısız sayı) mümkün olduğunca DÜŞÜR.

## SENİN DOSYALARIN (bu ikisi, başkası DEĞİL)
- `README.md`
- `docs/ARCHITECTURE.md`

## GİRDİ DOSYALARI (okunur, DEĞİŞTİRİLMEZ)
- `ENV.md` · `RULES.md` (§3, §6, §7, §8 senin anayasan)
- `GECE/V9-A.md` — §4A (Y6b), §4B (K1), §4C, §5 (YENİ-8, YENİ-9, YENİ-11, YENİ-12), §6B
- `GECE/V9-B.md` — kapının ne ölçtüğü, istisna kuralı, bilinen zaafı
- `engine/tests/docs_truth_check.mjs` (OKU, DEĞİŞTİRME)
- Bir iddiayı DOĞRULAMAK için: `ctest --test-dir engine/build -N`,
  `ls -l`, `grep`, `contract/layers/*.json`, `engine/tests/`+`engine/tools/`
  altındaki dosya ADLARI, `engine/build-wasm.sh`

## SENİN İHLALLERİN (kapının bugün bastığı, isim isim)
D1 — `docs/ARCHITECTURE.md:113` · `:121` · `:260` (üçü de `byte-identical`)
D2 — `docs/ARCHITECTURE.md:3` → `PROJECT.md` · `:3` → `PLAN.md` ·
     `:244` → `PLAN.md` · `:249` → `engine/SPECS-next-vocabulary.md`
D3 — `docs/ARCHITECTURE.md:27` · `:119` (+ kapının bastığı diğerleri)
`README.md`'de bugün **0** ihlal var — bozma; ama §5'in YENİ-9 ve YENİ-11
kalemlerini onar (aşağı bak).

## KÂTİP ANAYASASI (§3.6 — her cümlede geçerli)
- Docs'a DURAN-İDDİA YAZILMAZ. Sayıyı BASAN testin/aletin ADI yazılır.
  "ALL PASS / 0.00mm / byte-identical / bitti / zero issues" duran cümle olarak
  yasaktır; ölçülmüş bir KUSURU anlatıyorsan aleti + tarihi + kanıt yolunu yaz.
- Bayat cümle ya GÜNCELLENİR ya GEREKÇESİYLE `docs/archive/`'e taşınır.
  **SESSİZ SİLME YOK.** Sildiğin her cümlenin gerekçesi tutanağa girer.
- Ölü yol: hedefi VAR olan doğru yola düzelt, ya da hedefin YOK olduğunu
  DÜRÜSTÇE ilan et (aynı satırda `YOK` / `does not exist` / `was moved out`
  gibi) — kapı dürüst yokluğu düşürür, sahte referansı düşürmez.

## ÖZEL OLARAK ONAR
1. **Y6b — `docs/ARCHITECTURE.md:41` "EU 34-52 … 70,200 drafts".**
   `README.md:9` ve `contract/layers/shape-ratios.json` (`sizes` = 8, EU34–48)
   ile çelişiyor. **TEST GİRDİ ARALIĞI** ile **SATILAN BEDEN ARALIĞI** ayrı
   yazılsın; 70,200 sayısının yanına onu basan alet adı (`engine_check`).
2. **YENİ-9 — `README.md:7` / `docs/ARCHITECTURE.md:137,257`:** "sevk edilen
   motor yüzey hattı DEĞİL" iddiası. `grep -c ... engine/build-wasm.sh`
   komutunu BUGÜN KOŞTUR, çıktıyı ve tarihi cümleye yaz.
3. **YENİ-11 — `README.md:64` "Z-spread 143 mm / 238 mm":** alet adı YOK.
   Ya sayıyı basan alet/testi bul ve adını yaz, ya sayıyı kaldırıp cümleyi
   niteliksel yaz. Uydurma alet adı YAZMA.
4. **K1 — `README.md:58` "27 of 54":** sayıyı basan alet adı YOK. Aynı hüküm.
5. `docs/ARCHITECTURE.md:53` bundle boyutu 24 Ağu'da 1 209 765 bayt yazılmış;
   bugün `ls -l engine/dist/stitchu-engine.js` **1 253 817**. Tarihi tazele.

## ÇIKTI
- `README.md` · `docs/ARCHITECTURE.md` (onarılmış)
- gerekiyorsa `docs/archive/` altına taşınan metin (gerekçesiyle)
- `GECE/V9-C.md` — kısa tutanak: kapattığın ihlaller (satır satır, ÖNCE→SONRA
  özeti) · taşıdığın/sildiğin cümleler + GEREKÇE · onaramadığın + SEBEP ·
  `node engine/tests/docs_truth_check.mjs --no-baseline` çıktısının senin iki
  dosyanla ilgili bölümü (ÖNCE ve SONRA)

## YASAKLAR
- **KODA, `contract/`'a, `engine/`'e DOKUNMA** (§3.2, §7.4). Tek istisna: OKUMAK.
- `engine/tests/docs_truth_check.mjs` ve `engine/tests/docs-truth-baseline.json`
  DEĞİŞTİRİLMEZ — kapıyı kendine uydurmak fazı düşürür.
- `web/`, `docs/H1.0-KAPI.md`, `docs/G5-OMUZ-PLANI.md`,
  `docs/SATIS-SARTNAMESI.md`, `docs/KATMAN-HARITASI.md`,
  `docs/loop-engineering.md`, `GECE/INDEX.md` — **BAŞKA İŞÇİNİN dosyaları,
  DOKUNMA.**
- `KOSU.md`, `GECE/arsiv/`, diğer kartlar AÇILMAZ.
- ÖLÇMEDEN cümle kurma. Uydurma sayı, uydurma alet adı = fazı düşürür.

## RAPOR
yapılan (dosya yolu + commit hash) · ölçülen (sayı + onu basan komut) ·
yapılamayan (sebep) · kart dışı fark edilen.
İşini KENDİ COMMIT'İNLE bitir (lowercase ingilizce mesaj, co-author YOK).
