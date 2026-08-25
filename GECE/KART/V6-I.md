# KART V6-I — SON 14 REFERANS (kapıyı yeşile döndür)

ETİKET: **SIRALI** (tek işçi) · SÜRE TAVANI: **50 dk** · **KAPI BLOKE EDİYOR**

## ÖLÇÜLMÜŞ ZEMİN (şefin kendi koşusu)
`bash engine/tests/vocab_reference_check.sh` @ `4763d08`:
`taban 10438 · bugun 10452 (delta +14)` · `HUKUM: FAIL (7 artan, 0 yeni)`
Artan eksenler: `garment +5 · neckline +4 · shaping +2 · skirtStyle +2 ·
yoke +2 · backOpening +1 · topLength +1` (toplam +17, düşen 3 ile net +14).

Şefin dosya sayımı (`grep -Inw`, bugünkü ağaç):
- `engine/tools/foto-spec-olcum.mjs` — garment 6 · neckline 6 · shaping 3 ·
  skirtStyle 3 · topLength 3 · yoke 1  ← **en büyük kalem**
- `engine/tests/edit_locality_check.mjs` — garment 3 · neckline 2 · shaping 2 ·
  skirtStyle 2 · backOpening 2 · topLength 1
- `engine/tools/spec-diff.mjs` — garment 3 · neckline 2 · backOpening 1 ·
  shaping 1 · skirtStyle 1
- `contract/anchors-v1.json` — neckline 2 · garment 1 · yoke 1
  (V6-H: bunun 3'ü **motorun bastığı VERİ**, silmek yasak)

## NE
Delta'yı **≤ 0** yap (yani toplam ≤ 10438, `HUKUM: YESIL`). Yöntem SİLMEK değil
**OKUMAK**: elle yazılmış eksen/değer adlarını üretilmiş sözlükten çek.
V6-H'nin denemediği kalem: `foto-spec-olcum.mjs`'in **KONUM sınıfındaki
kelime-bölücü sözlüğü** (`'neckline'`, `'yoke'`, `'skirt'` sınıfı jenerik
sözcük listesi) — bunu `engine/vocab.json`'dan üret.

## GİRDİ DOSYALARI (isim isim)
- `ENV.md` · `RULES.md`
- `engine/tests/vocab_reference_check.sh` (SADECE OKU — DEĞİŞTİRİLMEZ)
- `engine/vocab.json` · `engine/tools/gen-vocab.mjs` · `backend/vocab.gen.js`
- `engine/tools/foto-spec-olcum.mjs` · `engine/tests/edit_locality_check.mjs`
  · `engine/tools/spec-diff.mjs` · `contract/anchors-v1.json`
- `GECE/V6-H.md` (önceki onarımın tutanağı, GİRDİ)

## YAPILACAKLAR
1. Kapıyı koş, delta'yı ve artan eksenleri KENDİN logla.
2. Her artan referansı SATIR SATIR bul (`grep -Inw`), üç kovaya ayır:
   (a) üretilmiş sözlükten OKUNABİLİR · (b) motorun bastığı VERİ (dokunulmaz)
   · (c) kaçınılmaz (gerekçesiyle).
3. (a) kovasını onar. Kural: **ad harf harf yazılmaz, anahtardan/indeksten
   çözülür.** Yorum satırlarında da ad anmak sayılıyor — V6-F ve V6-H ikisi de
   bu tuzağa düştü, sen düşme.
4. **KORUMA — hiçbiri düşmeyecek** (kendi komutunla ölç, düşerse onarım red):
   - `node engine/tests/edit_locality_check.mjs` → exit 0, 12 vaka + A1..A6
   - `node engine/tests/anchor_source_check.mjs` → exit 0
   - `node engine/tools/gen-anchors.mjs` → 19 çıpa · 7 kenar-oranlı
   - `node engine/tools/foto-spec-olcum.mjs --offline --bank vision/eval/live-2026-08-22.json`
     → TAM DOĞRU SPEC **1/5** · ALAN **47/51** · GORME 4 · KONUM **11/26** ·
       KONUM kapasitesi sıkı **7/15**
5. **KAPANIŞ:** `bash engine/tests/vocab_reference_check.sh` → `HUKUM: YESIL`.
   Sonra TAM `ctest --test-dir engine/build --output-on-failure`; kırmızı AD
   kümesi `GECE/log/V6.ctest.opening.txt`'teki **6 adla BİREBİR** aynı olmalı.
   Logu `GECE/log/V6.ctest.final.txt`'ye yaz (üstüne yaz, eskisi bayat).

## SON ÇARE (yalnız 5 tutmazsa)
`DAMLA-KUYRUK.md`'deki **K-V6A** satırını kalan borcun BUGÜNKÜ sayısıyla
güncelle ve kapıyı KIRMIZI bırak. Susturma, taban kesme, kapsam daraltma YASAK.

## YASAKLAR
- `engine/tests/vocab_reference_check.sh` DEĞİŞTİRİLMEZ · `--baseline` ile taban
  ELLE KESİLMEZ (§7.1 gevşetme).
- Vaka/çıpa/kapı silerek sayı düşürme YASAK.
- `engine/src/`, `backend/worker.js`, `web/`, `patterns_real/` dokunma.
- Yeni kaynak dosya AÇMA. Ücretli çağrı / ağırlık / GPU / API anahtarı = veto.
- "Artık yeşil" yasak — `HUKUM` satırı + ctest çıktısı.

## ÇIKTI
Onarılan dosyalar · `GECE/V6-I.md` · `GECE/log/V6-I.kapi.txt` ·
`GECE/log/V6.ctest.final.txt` · (gerekirse) `DAMLA-KUYRUK.md`

## COMMIT
`git commit -- <yollar>` · `git add -A` KULLANMA.
Commit mesajına ÖNCE/SONRA delta'sını yaz.
