# KART V6-J — HAKEM **KALDI** DEDİ: REDDEDİLEN İŞ YAN DALA, ANA DAL YEŞİLE

ETİKET: **SIRALI** (tek işçi) · SÜRE TAVANI: **50 dk** · **KAPANIŞ KARTI**

## HÜKÜM (tarafsız hakem, temiz oturum, `GECE/KAPI.md` son satırı)
**KALDI**, iki gerekçeyle:
1. **RULES md.9 ihlali pushlandı:** kırmızı AD kümesi 6 → 7 büyüdü
   (`vocab_reference_check`). Hakem KENDİ koştu: `3fa8002` worktree'sinde
   **EXIT=0 / `HUKUM: YESIL`**, HEAD'de **EXIT=1 / taban 10438 → 10448 (+10)**.
   RULES md.9 "geri alınır, pushlanmaz" der. Geri alınmadı, kuyruğa havale edildi.
2. **`6b3378f` kapıyı geçmek için ŞEKİLLENDİRİLMİŞ:** 4 eklenen / 4 silenen
   satırın hepsi YORUM, sıfır davranış. Fonksiyonun gerçek girdisi spec alan
   adları olduğu halde örnek `'topLength'`→`'hipBand'` yapılmış — sayı düştü,
   **yorum yanlışlaştı**. Bu bir grep kandırmacasıdır.

## NE
§4 ve §3.10: **reddedilen iş yan dala alınır, ana dal temiz kalır.** Ana dalda
`vocab_reference_check` YEŞİLE dönecek ve kırmızı AD kümesi faz öncesiyle
BİREBİR aynı olacak. Hiçbir iş SİLİNMEYECEK — yan dalda duracak.

## ÖLÇÜLMÜŞ ZEMİN (şefin kendi okuması)
Kapının SCOPE'u (`engine/tests/vocab_reference_check.sh:95-96`):
`contract engine/src engine/wasm engine/tools engine/pattern-bridge
engine/vocab.json web/js recipes backend knowledge`
→ **`GECE/` ve `engine/tests/` KAPSAM DIŞI.** Yani bütün tutanaklar, loglar,
kartlar ve `engine/tests/*.mjs` ana dalda KALABİLİR; borç yalnız 4 dosyada:
`contract/anchors-v1.json` · `engine/tools/gen-anchors.mjs` ·
`engine/tools/spec-diff.mjs` · `engine/tools/foto-spec-olcum.mjs`.

## YAPILACAKLAR (sırayla)
1. **YAN DAL:** bugünkü HEAD'i koru —
   `git branch research/v6-cipa-editleme` (HEAD'de). Push et. Hiçbir iş kaybolmaz.
2. **`6b3378f` GERİ AL:** `git revert --no-commit 6b3378f` ya da elle — 4 yorum
   satırı DÜRÜST hâline döner (`topLength` örneği geri gelir). Kapı sayısı
   ARTACAK, bu beklenen ve dürüst olanıdır.
3. **CERRAHİ GERİ ALMA — en az kaybeden kombinasyonu ÖLÇEREK bul.**
   Ana dalda tut/at kararını SAYIYLA ver, tahminle değil. Sıra:
   a) `contract/anchors-v1.json` + `engine/tools/gen-anchors.mjs` `3fa8002`
      hâline (yani YOK) → ölç.
   b) `engine/tools/foto-spec-olcum.mjs`'in KONUM/`--v2` eklerini `3fa8002`
      hâline → ölç.
   c) `engine/tools/spec-diff.mjs`'te V6-G'nin ekleri (`operatorSicil`,
      `AXIS_MAP`, `anchorNames`, `OP_KEYS`) → ölç.
   ★ **V6-E'nin onarımını (`LOCALITY_GRANULARITY` ilanı + `pieceBytes` export)
   MÜMKÜNSE KORU** — hakem onu "gerçek, sıkılaştırma, mutasyonla kanıtlı" diye
   ADIYLA aklandırdı. Yalnız o da borç taşıyorsa ve YEŞİL başka türlü
   gelmiyorsa at; kararı ÖLÇÜMLE gerekçelendir.
   Her adımda `bash engine/tests/vocab_reference_check.sh` koş ve logla.
4. Ana dalda kalan testler tutarlı olmalı: `engine/tests/anchor_source_check.mjs`
   dayandığı dosya kalkarsa **testi ve `engine/CMakeLists.txt` satırını da**
   yan dala bırak (ana dalda kırmızı bırakma).
5. **KAPANIŞ ÖLÇÜMÜ (zorunlu, ikisi de):**
   - `bash engine/tests/vocab_reference_check.sh` → **`HUKUM: YESIL`**
   - `ctest --test-dir engine/build --output-on-failure` TAM koşu → kırmızı AD
     kümesi `GECE/log/V6.ctest.opening.txt`'teki **6 adla BİREBİR** aynı
     (`flat_pattern_agree_check · flat_artifact_census · style_check ·
     sizechart_source_check · contract_check · figure_check`).
     Logu `GECE/log/V6.ctest.final.txt`'ye YAZ (üstüne yaz).
6. **KUYRUK:** `DAMLA-KUYRUK.md`'deki **K-V6A**'yı 3.8.d formatında güncelle:
   KARAR GEREKEN · SEÇENEKLER (A: çıpa işi yan dalda kalsın / B: ratchet
   üretilmiş `contract/` dosyalarını kapsam dışı bıraksın — her biri ölçülmüş
   yan bilgiyle) · VARSAYILAN **(A)** · ETKİLEDİĞİ FAZ **V7**.
   Yan dalın ADINI ve son commit hash'ini kuyruğa yaz — iş kaybolmadı, orada.

## YASAKLAR
- `engine/tests/vocab_reference_check.sh` DEĞİŞTİRİLMEZ · `--baseline` ile taban
  ELLE KESİLMEZ · yorum/örnek adları grep'i kandıracak şekilde DEĞİŞTİRİLMEZ.
- `GECE/` altındaki tutanak, log ve kartlar SİLİNMEZ (kapsam dışı, ölçüm kaydı).
- `engine/src/`, `backend/worker.js`, `web/`, `patterns_real/` dokunma.
- İşi SİLME — yan dal + push zorunlu.
- "Artık yeşil" yasak — `HUKUM` satırı + ctest çıktısı.

## ÇIKTI
Yan dal `research/v6-cipa-editleme` (pushlu) · geri alınan dosyalar ·
`GECE/V6-J.md` · `GECE/log/V6-J.kapi.txt` · `GECE/log/V6.ctest.final.txt` ·
`DAMLA-KUYRUK.md`

## COMMIT
`git commit -- <yollar>` · `git add -A` KULLANMA.
Commit mesajına ÖNCE/SONRA delta'sını ve yan dal adını yaz. Ana dalı PUSH ET.
