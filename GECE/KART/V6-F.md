# KART V6-F — YENİ KIRMIZI AD GERİ ALINACAK (`vocab_reference_check`)

ETİKET: **PARALEL** (V6-G ile) · SÜRE TAVANI: **50 dk** · **KAPI BLOKE EDİYOR**

## NE
`4529921` commit'i (`contract/anchors-v1.json` + `engine/tools/gen-anchors.mjs`)
`vocab_reference_check`'i KIRMIZI'ya düşürdü. Bu test faz açılışında (`ada3bf9`)
YEŞİLDİ — ölçüldü. RULES md.9 ve §4.1: **yeni kırmızı AD doğuran değişiklik geri
alınır.** Senin işin: çıpa sözlüğünü KORUYARAK kapıyı yeşile döndürmek. Kapıyı
gevşetmek, tabanı elle yeniden kesmek, testi susturmak YASAK.

## GİRDİ DOSYALARI (isim isim)
- `ENV.md` · `RULES.md`
- `engine/tests/vocab_reference_check.sh` (kapının kendisi — SADECE OKU)
- `engine/tools/gen-anchors.mjs` · `contract/anchors-v1.json`
- `engine/tests/anchor_source_check.mjs`
- `GECE/V6-D.md` (üretecin tutanağı, GİRDİ)

## ÖLÇÜLEN ZEMİN (kendin doğrula, devralma)
`ctest --test-dir engine/build -R vocab_reference_check --output-on-failure`
bugün: `HUKUM: FAIL (19 artan, 0 yeni)` — en büyük artışlar
`neckline +18` · `garment +7` · `sleeveStyle` düşmüş. Teşhis ADAYI (V6-D'nin
kendi tutanağından): panel adları (`Bias binding (neckline + armholes)` gibi)
her çıpanın `eslesen` listesinde TEKRARLANIYOR.

## YAPILACAKLAR
1. Kapıyı KENDİN koş, `HUKUM` satırını ve eksen eksen artışı logla.
2. Kök sebebi KANITLA: artışın kaç tanesi `anchors-v1.json`'daki tekrardan,
   kaç tanesi `gen-anchors.mjs` kaynağındaki literal isimlerden geliyor —
   dosya bazında say (`grep -c` sınıfı komut, çıktısıyla).
3. **ONAR** — sözlük KÜÇÜLSÜN, bilgi kaybolmasın:
   - Panel adları `anchors-v1.json`'da **BİR KEZ** dursun (`_olculenPaneller`
     sınıfı bir dizi), çıpalar onlara **indeksle** işaret etsin.
   - `gen-anchors.mjs` içindeki gereksiz literal enum adlarını kaynağa bağla;
     kaçınılmaz olanı ADIYLA yaz ve tutanağa gerekçesini koy.
   - Çıpa SAYISI ve KAPSAMI düşmemeli: V6-D `19 çıpa · 7 kenar-oranlı ·
     26 serbest terimin 7'sini karşılıyor` ölçtü. KENDİ ölçümünü bas; bu
     üç sayı DÜŞERSE onarım kabul edilmez.
4. `anchor_source_check` yeşil kalmalı ve indeks yapısını da DOĞRULAMALI
   (indeks olmayan panele işaret eden çıpa = KIRMIZI).
5. **MUTASYON (§4.5)**: indeksi bozan bir elle edit (`_olculenPaneller`'dan bir
   ad sil) → `anchor_source_check` KIRMALI; geri al → yeşil.
6. KAPANIŞ ÖLÇÜMÜ (zorunlu):
   `ctest --test-dir engine/build -R "vocab_reference_check|vocab_source_check|anchor_source_check|edit_locality_check" --output-on-failure`
   → **4/4 Passed** olmalı, çıktısını logla.

## SON ÇARE (yalnız 3 tutmazsa, ve tutanağa gerekçeyle)
Çıpa sözlüğü kapıyı geçemiyorsa `4529921` **`git revert`** edilir ve çıpa işi
kuyruğa kart olarak yazılır. Kapıyı gevşeterek geçmek bu seçeneğin yerine
GEÇMEZ. Revert edersen `engine/CMakeLists.txt`'teki `add_test` satırı da gider.

## YASAKLAR
- `engine/tests/vocab_reference_check.sh` DEĞİŞTİRİLMEZ. `--baseline` ile taban
  elle yeniden KESİLMEZ (bu bir kapsam kararı değil, bir onarım işidir).
- `engine/tools/spec-diff.mjs` · `engine/tools/foto-spec-olcum.mjs` ·
  `engine/tests/edit_locality_check.mjs` DOKUNMA (V6-G'nin dosyaları).
- `engine/src/`, `backend/`, `web/`, `patterns_real/` dokunma.
- Kapsamı daraltarak sayı düşürme (çıpa silmek) = gevşetme, YASAK.

## ÇIKTI
`engine/tools/gen-anchors.mjs` · `contract/anchors-v1.json` ·
`engine/tests/anchor_source_check.mjs` · `engine/CMakeLists.txt` (gerekirse) ·
`GECE/V6-F.md` · `GECE/log/V6-F.kapi.txt`

## COMMIT
`git commit -- <yukarıdaki yollar>` · `git add -A` KULLANMA.
Commit mesajına ÖNCE/SONRA `HUKUM` satırını yaz.
