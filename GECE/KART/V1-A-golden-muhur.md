# KART V1-A — REÇETEYİ SEVK ET + GOLDEN MÜHÜRÜNÜ YENİLE · SIRALI (son kart)

## NE
İki kırmızıyı (`golden_check` #3, `recipe_dress_check` #71) tek zincirde kapat.
V1-B motor tarafını bitirdi (`e4516cf`: `recipe.cpp` `scye` opu — reçete artık
oyuğu motorun KENDİ çözücüsüne çizdiriyor, düzeltme katsayısı yok). Reçete
JSON'u geri alınmıştı çünkü kartı `web/`'e dokunamıyordu. Bu kartın `web/`'e
dokunma İZNİ VAR.

## SINIF HÜKMÜ (tarafsız hakem verdi, `GECE/V1-SINIF.md`)
`golden_check` ve `recipe_dress_check` = **(b) BİLİNÇLİ BAYAT PİN**. Motor
`52ae85c`'de scye derinliğini yayınlanmış kaynağa (Aldrich p.11) bağladı,
değişikliği commit gövdesinde ismen ilan etti, ve temmuzda BAĞIMSIZ pinlenmiş
`sloper_check` bugün YENİ sayıyla 3/3 YEŞİL. Yani yeni pin gerçek iyileşmeyi
mühürlüyor, kırmızıyı susturmuyor (§3.5/4).

## SIRA (bağlayıcı, adım atlama yok)
1. `GECE/log/V1-B.recipe-FIXED.json` → `recipes/shift-dress-square-spaghetti.json`.
   Koş: `./engine/build/recipe_dress_check recipes/shift-dress-square-spaghetti.json`
   → beklenen **PASS 125 / FAIL 0, exit 0**. Çıkmazsa DUR ve raporla.
2. Aynı baytı `web/recipes/` altındaki aynasına yaz. İkisinin bayt aynası
   olduğunu `cmp` ile KANITLA, çıktıyı loga koy.
3. `bash engine/build-wasm.sh` → `web/vendor/stitchu-engine.js` yeniden derlenir
   (`emcc` kurulu: `/opt/homebrew/bin/emcc`). Derleme logunu sakla.
   ENV GOTCHA: `?v` cache bump yaptıysan `web/` altındaki TÜM dosyaları
   `git add` et — sadece dokunulanı stage'lemek bayat HTML sevk ediyor.
4. `scripts/repin-golden.sh "<beyan etiketi>"` — etiket 52ae85c'yi ve Aldrich
   p.11 kaynağını ANMALI. Script `engine/golden-reference.csv`'yi yeniler.
5. **DEFTER GİRDİSİ ZORUNLU** — `engine/GOLDEN-PIN.md`'ye tarihli girdi:
   sapmanın kaynağı (`52ae85c`, `engine/src/bodice.cpp:905-907`, eski→yeni
   formül), **İÇERİK diff özeti** (satır aritmetiği DEĞİL: hangi giysiler
   yerinde değişti — `Bodice Back` / `Bodice Front` / `Balloon Sleeve` /
   `Sleeve` / `Top Back` / `Top Front`; etek parçalarının max 0.0001 mm ile
   kımıldamadığı), ölçülen dağılım (satır sayısı + % + max mm + medyan),
   bağımsız tanık (`sloper_check` yeni sayıyla yeşil, koşu çıktısı),
   ve **onay statüsü: DAMLA ONAYI BEKLİYOR (K-V1A), varsayılan yürüdü**.
   Defter girdisi olmayan pin GEÇERSİZDİR — script bunu kendisi söylüyor.
6. TAM ctest: `ctest --test-dir engine/build --output-on-failure`
   → `GECE/log/V1-A.ctest.after.txt`.

## ÇIKTI
- `recipes/shift-dress-square-spaghetti.json`, `web/recipes/…`, `web/vendor/…`,
  `engine/golden-reference.csv`, `engine/GOLDEN-PIN.md`
- `GECE/log/V1-A.ctest.after.txt` · `GECE/log/V1-A.olcum.txt` (adım adım
  komut + çıktı: 125/0, cmp, wasm derleme, repin md5, önce/sonra kırmızı adlar)

## ZORUNLU KAPILAR
1. **Kırmızı AD kümesi BÜYÜYEMEZ** (RULES §9). Faz öncesi küme:
   `golden_check · style_check · sizechart_source_check · recipe_dress_check ·
   contract_check · figure_check` (`GECE/log/V1.ctest.before.txt`).
   Beklenen sonuç: `golden_check` ve `recipe_dress_check` DÜŞER, kalan 4 durur,
   YENİ AD 0. Yeni ad doğarsa zinciri GERİ AL ve raporla — kısmi bırakma.
2. `recipe_dress_golden_check` ve iki wasm parite testi (`recipe_wasm_parity_dress`,
   `dxf_wasm_parity_dress`) YEŞİL kalmalı. Bunlar bu kartın asıl riski.
3. Rebuild HEP `-DCMAKE_BUILD_TYPE=Release`.
4. Her adımın çıktısı loga; "baktım/çalışıyor" yasak.

## YASAKLAR
- Tolerans/eşik değiştirme. Test dosyalarını değiştirme.
- `contract/` `docs/` altına dokunma. `patterns_real/` altına dokunma.
- Landing'in görsel kimliğini değiştirme — bu kart `web/`'e SADECE
  `web/recipes/` ve `web/vendor/` (derleme çıktısı) için dokunur.
- Pin'i defter girdisi YAZMADAN commit'leme.
- PUSH ETME (şefin işi).

## SÜRE TAVANI
60 dk. Dolarsa: adım 1-3'e kadar geldiysen orayı commit et (reçete+wasm tutarlı
bir bütün), adım 4-5'i kart olarak bırak. Yarım pin bırakma.

## ETİKET
SIRALI — V1-B (`e4516cf`) bitmeden başlamaz; paralel işçi yok, build dizini senin.
