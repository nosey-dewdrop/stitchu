# KART V9-E — KÂTİP 3: `SATIS-SARTNAMESI` + `KATMAN-HARITASI` + `loop-engineering` + arşiv mock

ETİKET: **PARALEL** (V9-C · V9-D · V9-F ile aynı anda; dosya kümesi kesişmiyor)
SÜRE TAVANI: **60 dk** (tavana gelirsen o ana kadarki işi COMMIT'LE)

## NE
Bu dört dosyayı BUGÜNKÜ KODA karşı oku ve `docs_truth_check`'in bastığı HER
ihlali kapat: D1 **0**, D2 **0**, D3 DÜŞÜR. Canlı docs yüzeyindeki 2 gerçek
duran-iddia ihlalinin İKİSİ DE senin dosyanda.

## SENİN DOSYALARIN (bu dördü, başkası DEĞİL)
- `docs/SATIS-SARTNAMESI.md`
- `docs/KATMAN-HARITASI.md`
- `docs/loop-engineering.md`
- `docs/archive/mocks/babyblue-stil-1.html`

## GİRDİ DOSYALARI (okunur, DEĞİŞTİRİLMEZ)
- `ENV.md` · `RULES.md` (§3, §6, §7, §8 senin anayasan)
- `GECE/V9-A.md` — §2A, §3A/§3B/§3C, §5 (YENİ-2, YENİ-3, YENİ-4, YENİ-7,
  YENİ-13), §6B, §9 md.2/md.5/md.6
- `GECE/V9-B.md` — kapının ne ölçtüğü, istisna kuralı, bilinen zaafı
- `engine/tests/docs_truth_check.mjs` (OKU, DEĞİŞTİRME)
- Doğrulama için: `ctest --test-dir engine/build -N`, `ls`, `grep`,
  `engine/tools/gusto-lint.mjs` ADI, `Logs/` altındaki paket dizinleri

## SENİN İHLALLERİN (kapının bugün bastığı, isim isim)
D1 — `docs/SATIS-SARTNAMESI.md:243` (`0.0000mm`, alet adı YOK)
   · `docs/SATIS-SARTNAMESI.md:311` ("borcu **bitti**")
   · `docs/KATMAN-HARITASI.md:47` · `:74` (`bayt bayt`)
   · `docs/archive/mocks/babyblue-stil-1.html:108` (`0.00 mm seam match`)
D2 — `docs/SATIS-SARTNAMESI.md:29` → `benchmark-58/dress_patterns/` (diskte YOK)
   · `:29` → `reports/2026-07-19-stitchu-f0-gusto-korpus.md` (YOK)
   · `:226` · `:240` → `print-svg/a4-page5.svg` (repo köküne göre YOK; paket
     dizinine göre VAR — `Logs/paket-2026-08-06/print-svg/a4-page5.svg`)
D3 — `docs/SATIS-SARTNAMESI.md:14` ve devamı (kapıyı kendin koştur)

## ★ DOSYA İÇİ ÇELİŞKİLER — ÖLÇÜLDÜ, UZLAŞTIR
1. **`docs/SATIS-SARTNAMESI.md:35` "§1 LISTING GÖRSELİ — 5/5 EKSİK"** ↔
   **`:311` "Motorun bu şartnameye borcu bitti"**. §1 eksikken borç bitmez
   (RULES §8 "blanket done" yasağı). `:311` yeniden yazılsın: hangi bölüm
   kapandı, hangisi AÇIK — bölüm bölüm.
2. **`:29`** `benchmark-58/dress_patterns/`'i düz anıyor, ama **aynı dosya
   `:277`** onun **diskte YOK** olduğunu ilan ediyor. `:29` `:277`'ye
   referans versin ya da yokluğu aynı satırda ilan etsin.
3. **`:243` "0.0000mm"** — RULES §6 yasaklısı, satırda onu basan alet adı yok.
   Aleti bul ve adını yaz, ya da sayıyı emekli et (tırnak + tarih + gerekçe).
4. **`docs/KATMAN-HARITASI.md:105-106`** "damga `7023c808195429b3`" —
   `engine/dist/stitchu-engine.js` **gitignore'da**, temiz checkout'ta
   üretilemez. Bu sınırı satıra yaz (kapı `bundle_fresh_check` ctest'te VAR).
5. **`docs/loop-engineering.md:68`** → `reports/stitchu-vision-progress.md`
   diskte **YOK** (backtick'siz olduğu için kapı yakalamıyor; yine de onar).

## KÂTİP ANAYASASI (§3.6 — her cümlede geçerli)
- Docs'a DURAN-İDDİA YAZILMAZ. Sayıyı BASAN testin/aletin ADI yazılır.
- Bayat cümle ya GÜNCELLENİR ya GEREKÇESİYLE `docs/archive/`'e taşınır.
  **SESSİZ SİLME YOK.**
- `docs/archive/mocks/babyblue-stil-1.html` ZATEN arşivde: cümlesini silme,
  dosyanın başına "ARŞİV MOCK — pazarlama metni, ölçüm değil; tarih ve
  gerekçe" şerhi düş ve duran-iddiayı emekli et (kapının istisna kuralı
  tırnak + tarih + `replaced`/`ölçüldü` bağlamını düşürür).
- Uydurma alet adı YAZMA. Bulunamayan sağlayıcı için "bu sayıyı basan alet
  repoda BULUNAMADI" geçerli ve makbul bir cevaptır.

## ÇIKTI
- dört dosya (onarılmış)
- gerekiyorsa `docs/archive/` altına taşınan metin (gerekçesiyle)
- `GECE/V9-E.md` — kısa tutanak: kapattığın ihlaller (ÖNCE→SONRA) ·
  taşıdığın/sildiğin cümleler + GEREKÇE · onaramadığın + SEBEP ·
  `node engine/tests/docs_truth_check.mjs --no-baseline` çıktısının senin
  dosyalarınla ilgili bölümü (ÖNCE ve SONRA)

## YASAKLAR
- **KODA, `contract/`'a, `engine/`'e DOKUNMA** (§3.2, §7.4). Tek istisna: OKUMAK.
- `engine/tests/docs_truth_check.mjs` ve `engine/tests/docs-truth-baseline.json`
  DEĞİŞTİRİLMEZ.
- `web/`, `README.md`, `docs/ARCHITECTURE.md`, `docs/H1.0-KAPI.md`,
  `docs/G5-OMUZ-PLANI.md`, `GECE/INDEX.md` — **BAŞKA İŞÇİNİN dosyaları,
  DOKUNMA.**
- `patterns_real/` altındaki satın alınmış PDF'lere DOKUNMA (§7.2).
- `KOSU.md`, `GECE/arsiv/`, diğer kartlar AÇILMAZ.
- ÖLÇMEDEN cümle kurma. Uydurma sayı, uydurma alet adı = fazı düşürür.

## RAPOR
yapılan (dosya yolu + commit hash) · ölçülen (sayı + onu basan komut) ·
yapılamayan (sebep) · kart dışı fark edilen.
İşini KENDİ COMMIT'İNLE bitir (lowercase ingilizce mesaj, co-author YOK).
