# KART V6-H — `vocab_reference_check` YEŞİLE DÖNECEK (kök: ELLE YAZILMIŞ enum adları)

ETİKET: **SIRALI** (tek işçi, önceki işçiler öldü) · SÜRE TAVANI: **60 dk**
**KAPI BLOKE EDİYOR — bu kart geçmeden faz kapanmaz.**

## ÖLÇÜLMÜŞ ZEMİN (şefin kendi koşusu, devralma değil)
- Faz açılışında **`3fa8002`** (wave-1 ÖNCESİ) `vocab_reference_check` **YEŞİLDİ**:
  `GECE/log/V6.ctest.opening.txt` → `Test #114: vocab_reference_check ... Passed`,
  ve o koşuda kırmızılar tam olarak miras 6 addı.
- Bugün HEAD'de **KIRMIZI**. Yani **AD KÜMESİ V6'DA BÜYÜDÜ** = RULES md.9 ihlali.
  (V6-F `ada3bf9`'i tabana aldı ve "zaten kırmızıydı" dedi — `ada3bf9` V6'nın
  KENDİ commit'lerini içeriyor, faz öncesi değil. Faz öncesi `3fa8002`'dir.)
- Sözlük tabanı `495d58a`'da **10438**. V5 kapanışında 10432 (tabanın altında).
  Bugün ~10478. **Sayı yalnız DÜŞEBİLİR.**

## TEZ (kök sebep, V2'nin yasasının ta kendisi)
Sayıyı büyüten şey ELLE YAZILMIŞ kapalı-enum adlarıdır: ölçüm/diff aletlerinde
hardcode edilmiş eksen ve değer isimleri. **Doğru çözüm silmek değil, OKUMAK:**
liste `engine/vocab.json` / `contract/` üreteçlerinden okunur, kaynağa bağlanır.
Bu hem sayıyı düşürür hem V2'nin "menü değil malzeme" yasasını uygular.

## GİRDİ DOSYALARI (isim isim)
- `ENV.md` · `RULES.md`
- `engine/tests/vocab_reference_check.sh` (SADECE OKU — DEĞİŞTİRİLMEZ)
- `engine/vocab.json` · `engine/tools/gen-vocab.mjs` · `backend/vocab.gen.js`
- `engine/tools/foto-spec-olcum.mjs` · `engine/tools/spec-diff.mjs`
  · `engine/tests/edit_locality_check.mjs` · `engine/tools/gen-anchors.mjs`
  · `contract/anchors-v1.json` · `engine/tests/anchor_source_check.mjs`
- `GECE/V6-F.md` (kök sebep ölçümü, GİRDİ)

## YAPILACAKLAR
1. Kapıyı KENDİN koş (`bash engine/tests/vocab_reference_check.sh`), bugünkü
   sayıyı ve eksen eksen artışı logla.
2. **FAZ ÖNCESİ TABANI ÖLÇ:** `git stash` gerektirmeyen bir worktree ile
   `3fa8002`'de aynı betiği koştur; sayıyı ve HUKUM satırını logla. İki sayının
   FARKI, V6'nın açtığı borçtur. Borcu **dosya dosya** böl (`grep -c -w`).
3. **ONAR — kaynağa bağla, silme:**
   - `engine/tools/foto-spec-olcum.mjs` ve `engine/tools/spec-diff.mjs`
     içindeki hardcode eksen/değer listelerini (`AXIS_MAP` sınıfı dahil)
     `engine/vocab.json` (ya da mevcut üretilmiş sözlük) üstünden OKU.
   - `engine/tests/edit_locality_check.mjs`'in vaka listesindeki değerleri de
     aynı kaynaktan çek (vaka SAYISI ve KAPSAMI düşmeyecek).
   - `contract/anchors-v1.json`'daki kaçınılmaz kaynak adlarını mümkün olduğunca
     indeksle/anahtarla göster (V6-F'nin `_olculenPaneller` deseni).
4. **HEDEF: `HUKUM: PASS`** (ya da en azından `3fa8002` sayısının ALTINA inmek).
   Ulaşılamıyorsa kalan borcu **satır satır** yaz: hangi dosya, kaç referans,
   NEDEN çıkarılamıyor.
5. **KORUMA — hiçbiri düşmeyecek** (kendi komutunla ölç, düşerse onarım red):
   - `node engine/tests/edit_locality_check.mjs` → exit 0, 12 vaka + A1..A6
   - `node engine/tests/anchor_source_check.mjs` → exit 0
   - `node engine/tools/gen-anchors.mjs` → 19 çıpa · 7 kenar-oranlı
   - `node engine/tools/foto-spec-olcum.mjs --offline --bank vision/eval/live-2026-08-22.json`
     → TAM DOĞRU SPEC 1/5, ALAN 47/51, KONUM kapasitesi sıkı 7/15
6. **KAPANIŞ:** `ctest --test-dir engine/build --output-on-failure` TAM koşu.
   Kırmızı AD kümesi faz öncesiyle (`GECE/log/V6.ctest.opening.txt`: 6 ad)
   BİREBİR aynı olmalı. Logu `GECE/log/V6.ctest.final.txt`'ye yaz.

## SON ÇARE (yalnız 4 tutmazsa)
Borç çıkarılamıyorsa: V6'nın kod commit'lerini `git revert` ETME — bunun yerine
`DAMLA-KUYRUK.md`'ye §3.8.d formatında **K-V6A** satırı yaz:
KARAR GEREKEN (tek cümle) · SEÇENEKLER A/B (her biri ölçülmüş yan bilgiyle) ·
VARSAYILAN · HANGİ FAZI ETKİLER. Ve kapıyı KIRMIZI BIRAK — susturma.

## YASAKLAR
- `engine/tests/vocab_reference_check.sh` DEĞİŞTİRİLMEZ, `--baseline` ile taban
  ELLE KESİLMEZ (bu bir gevşetmedir, §7.1).
- Kapsam daraltarak sayı düşürme (çıpa/vaka/kapı silmek) YASAK.
- `engine/src/`, `backend/worker.js`, `web/`, `patterns_real/` dokunma.
- Yeni kaynak dosya AÇMA (§7.5 tavanı doldu).
- Ücretli çağrı / model ağırlığı / GPU / API anahtarı = kalıcı veto.
- "Artık yeşil" yasak — `HUKUM` satırı + ctest çıktısı.

## ÇIKTI
Onarılan dosyalar · `GECE/V6-H.md` · `GECE/log/V6-H.kapi.txt` ·
`GECE/log/V6.ctest.final.txt` · (gerekirse) `DAMLA-KUYRUK.md`

## COMMIT
`git commit -- <yollar>` · `git add -A` KULLANMA.
Commit mesajına ÖNCE/SONRA sayısını yaz.
