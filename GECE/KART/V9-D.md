# KART V9-D — KÂTİP 2: `docs/H1.0-KAPI.md` + `docs/G5-OMUZ-PLANI.md`

ETİKET: **PARALEL** (V9-C · V9-E · V9-F ile aynı anda; dosya kümesi kesişmiyor)
SÜRE TAVANI: **60 dk** (tavana gelirsen o ana kadarki işi COMMIT'LE)

## NE
Bu iki dosyayı BUGÜNKÜ KODA karşı oku ve `docs_truth_check`'in bu iki dosyada
bastığı HER ihlali kapat: D1 **0**, D2 **0**, D3 (sağlayıcısız sayı) DÜŞÜR.
Bu ikisi D3 borcunun ağırlığını taşıyor — asıl işin orada.

## SENİN DOSYALARIN (bu ikisi, başkası DEĞİL)
- `docs/H1.0-KAPI.md`
- `docs/G5-OMUZ-PLANI.md`

## GİRDİ DOSYALARI (okunur, DEĞİŞTİRİLMEZ)
- `ENV.md` · `RULES.md` (§3, §6, §7, §8 senin anayasan)
- `GECE/V9-A.md` — §5 (YENİ-1, YENİ-5, YENİ-6), §3A, §6A/§6B, §9 md.1
- `GECE/V9-B.md` — kapının ne ölçtüğü, istisna kuralı, bilinen zaafı
- `engine/tests/docs_truth_check.mjs` (OKU, DEĞİŞTİRME)
- Doğrulama için: `ctest --test-dir engine/build -N`, `ls`, `grep`,
  `knowledge/drafting-math-eu38.md`, `engine/tests/` + `engine/tools/`
  altındaki dosya ADLARI, `engine/CMakeLists.txt` (OKU)

## SENİN İHLALLERİN (kapının bugün bastığı)
D1 — `docs/H1.0-KAPI.md:16` (`bitti`)
D2 — `docs/H1.0-KAPI.md:20` → `engine/tests/h10_gate_check.cpp` (**diskte YOK**;
     gerçek ad `engine/tests/h10_gate_check_LEGACY.cpp`)
D3 — `docs/H1.0-KAPI.md`: 4,5,55,56,57,171,216,217,219,221,222,223,226,227,228,
     232,233,255,276,284,285,286,287,288,292,293,294,302,308,311,313,318
     `docs/G5-OMUZ-PLANI.md`: 18,42,48,49,85
     (tam liste için kapıyı kendin koştur)

## ★ EN AĞIR İŞ — `docs/H1.0-KAPI.md` KENDİ KENDİYLE ÇELİŞİYOR (YENİ-1)
Aynı dosyanın ilk 25 satırında ÜÇ ayrı gerçeklik var, ölçüldü:
- `:10-13` kapıyı **DEVRE DIŞI** ilan ediyor (`h10_gate_check_LEGACY.cpp`,
  CMake `DISABLED TRUE`)
- `:20-21` aynı kapıyı canlı gibi anlatıyor: "Fikstür: `engine/tests/
  h10_gate_check.cpp` … Koşan komut: `ctest --test-dir engine/build-h10 -R
  h10_gate_check`" — **dosya YOK, `engine/build-h10` dizini YOK**
- `:23` "Bugün KIRMIZI olması doğrudur" — oysa test kırmızı DEĞİL, **koşmuyor**
  (`ctest -N` → `h10_gate_check (Disabled)`, 115 testin tek devre dışı olanı)
Üçünü tek gerçeklikte uzlaştır. Bunları BUGÜN KENDİN ÖLÇ ve ölçtüğünü yaz.

## KÂTİP ANAYASASI (§3.6 — her cümlede geçerli)
- Docs'a DURAN-İDDİA YAZILMAZ. Sayıyı BASAN testin/aletin ADI yazılır.
- D3'ün istediği şey sayıyı SİLMEK DEĞİL: sayının yanına onu basan aleti/testi
  ya da kanıt yolunu (`GECE/…`, `Logs/…`, `engine/tests/…`) koymak. Bu dosya
  bir ÖLÇÜM tutanağı — sayıları kaynağına bağla, kırpma.
- Bayat cümle ya GÜNCELLENİR ya GEREKÇESİYLE `docs/archive/`'e taşınır.
  **SESSİZ SİLME YOK.**
- Uydurma alet adı YAZMA. Sayıyı hangi aletin bastığını bulamıyorsan
  "bu sayıyı basan alet repoda BULUNAMADI" diye açıkça yaz — bu geçerli ve
  makbul bir cevaptır, kapı da onu görür.

## AYRICA
- `docs/G5-OMUZ-PLANI.md:49` "armhole 40-44cm bandı" zinciri KANITLI
  (`knowledge/drafting-math-eu38.md` VAR, `draft_math_check` +
  `garment_armhole_check` ctest'te VAR) — sadece alet adını satıra bağla.
- `docs/G5-OMUZ-PLANI.md:18` "78.0u kaynaksız, devralınmış" dürüstçe etiketli;
  etiketi KORU, türetmeyi basan alet adını ekleyebiliyorsan ekle.
- Dosyanın plan mı tutanak mı olduğu belirsizse başına tek satır statü yaz
  (ör. "ÖLÇÜM TUTANAĞI — kod yazılmadı" / "PLAN — kod yazılmadı").

## ÇIKTI
- `docs/H1.0-KAPI.md` · `docs/G5-OMUZ-PLANI.md` (onarılmış)
- gerekiyorsa `docs/archive/` altına taşınan metin (gerekçesiyle)
- `GECE/V9-D.md` — kısa tutanak: kapattığın ihlaller (ÖNCE→SONRA) ·
  taşıdığın/sildiğin cümleler + GEREKÇE · onaramadığın + SEBEP ·
  `node engine/tests/docs_truth_check.mjs --no-baseline` çıktısının senin iki
  dosyanla ilgili bölümü (ÖNCE ve SONRA)

## YASAKLAR
- **KODA, `contract/`'a, `engine/`'e DOKUNMA** (§3.2, §7.4). Tek istisna: OKUMAK.
- `engine/tests/docs_truth_check.mjs` ve `engine/tests/docs-truth-baseline.json`
  DEĞİŞTİRİLMEZ.
- `web/`, `README.md`, `docs/ARCHITECTURE.md`, `docs/SATIS-SARTNAMESI.md`,
  `docs/KATMAN-HARITASI.md`, `docs/loop-engineering.md`, `GECE/INDEX.md` —
  **BAŞKA İŞÇİNİN dosyaları, DOKUNMA.**
- `KOSU.md`, `GECE/arsiv/`, diğer kartlar AÇILMAZ.
- ÖLÇMEDEN cümle kurma. Uydurma sayı, uydurma alet adı = fazı düşürür.

## RAPOR
yapılan (dosya yolu + commit hash) · ölçülen (sayı + onu basan komut) ·
yapılamayan (sebep) · kart dışı fark edilen.
İşini KENDİ COMMIT'İNLE bitir (lowercase ingilizce mesaj, co-author YOK).
