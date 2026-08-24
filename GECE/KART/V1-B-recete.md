# KART V1-B — `recipe_dress_check` KIRMIZISINI KAPAT · PARALEL

## NE
`recipe_dress_check` (ctest #71) bugün **115 PASS / 10 FAIL**. Reçete
yorumlayıcısı ile C++ çizim hattı aynı giysi için farklı geometri basıyor.
İki hattı tek kaynağa bağla ve kapıyı YEŞİLE döndür. Döndüremediğin her FAIL
için kök teşhis + en az bir ÖLÇÜLMÜŞ çözüm adayı yaz.

## ZEMİN (ölçülmüş, yeniden ölçmen serbest, güvenmen zorunlu değil)
- Kök commit `52ae85c`: `engine/src/bodice.cpp:905-907` scye derinliğini
  `backLength * armholeDepthFactor + shoulderDrop`'tan
  `bustMM * scyeDepthPerBust + scyeDepthInterceptMM + neckMM * backNeckCutoutFactor`
  formülüne taşıdı. Reçete JSON'u ESKİ formülü taşımaya devam ediyor
  (`recipes/shift-dress-square-spaghetti.json:46`).
- `armholeDepthFactor = 0.44` `engine/src/bodice.hpp:96`'da hâlâ duruyor,
  yorumu "LEGACY"; motor artık onu kullanmıyor. Kapı SABİTLERİ kilitliyor,
  FORMÜLÜ kilitlemiyor.
- ÖLÇÜLMÜŞ kısmi aday: reçetenin `consts` bloğuna `scyeDepthPerBust 0.10` +
  `scyeDepthInterceptMM 122.0` eklenip `torsoArmholeY` yukarıdaki yeni
  formüle çevrilince **PASS 115→116, FAIL 10→9**; grainline DIFFERS 6→0,
  kumaş FAIL 1→0. (Sabitlerin gerçek değerlerini `engine/src/bodice.hpp`den
  DOĞRULA, buradaki sayıya güvenme.)
- Kalan 9 FAIL'in tamamı `geometry DIFFERS`. Uç noktalar birebir eşit ama
  delta sürüyor (`Top Front` EU38 max 48.46 mm) → sapma kübiğin KONTROL
  NOKTASINDA. Sebep: oyuk artık ölçülen yay/kiriş oranına İTERATİF
  çözülüyor; reçete DSL'inde çözücü yok. Ayrıca 1.39–3.72 mm omuz ucu farkı
  `0cb5d23`'ten ("the shoulder finally grades"), ve `cutLine` çözünürlüğü
  iki hatta ayrı (nokta sayısı 43↔48, 41↔44, 47↔53, 50↔54, 42↔47, 41↔43).

## GİRDİ DOSYALARI (isim isim)
- `ENV.md`, `RULES.md`
- `engine/tests/` altında `recipe_dress_check` kaynağı (grep ile bul, OKU)
- `recipes/shift-dress-square-spaghetti.json`
- `engine/src/recipe.cpp` (+ varsa `recipe.hpp`), `engine/src/bodice.cpp`,
  `engine/src/bodice.hpp`
- `git show 52ae85c`, `git show 0cb5d23` (git komutu serbest)

## ÇIKTI
- Değişen dosyalar: `recipes/shift-dress-square-spaghetti.json` ve/veya
  `engine/src/recipe.cpp` (+ `recipe.hpp`). Kanıt olduğu kapı: `recipe_dress_check`.
- `GECE/log/V1-B.olcum.txt` — önce/sonra PASS/FAIL sayıları, kalan her FAIL'in
  adı + mm sapması, hangi komutun bastığı.
- `GECE/log/V1-B.ctest.after.txt` — TAM ctest koşusu (`ctest --test-dir
  engine/build --output-on-failure`).

## ZORUNLU KAPILAR (kartın kabul şartı)
1. TAM ctest koş. Kırmızı AD kümesi BÜYÜYEMEZ (RULES §9). Yeni kırmızı ad
   doğuran değişikliği GERİ AL, raporda söyle.
2. Rebuild HEP `-DCMAKE_BUILD_TYPE=Release` (boş bırakılan build tipi
   engine_check'i 19s→2684s yaptı, kapı hiç geçemedi).
3. Kapatamadığın her FAIL için: kök teşhis + en az bir ÖLÇÜLMÜŞ çözüm adayı
   + hangi faza kart olduğu. "Burada sorun var" çıktı sayılmaz.
4. Tolerans/eşik DEĞİŞTİRME. Değiştirmen gerektiğini düşünüyorsan YAPMA,
   raporda gerekçesiyle öner.

## YASAKLAR
- `engine/golden-reference.csv`'ye DOKUNMA (başka kartın dosyası).
- `contract/` `web/` `docs/` altına dokunma.
- `engine/tests/` altındaki MEVCUT testleri değiştirme — testi geçmek için
  testi oynatmak fazı düşürür.
- Sayıları eşitlemek için reçeteye "düzeltme katsayısı"/sabit çarpan ekleme.
  Kapı iki hattın AYNI KAYNAKTAN beslendiğini kanıtlamalı.
- `patterns_real/` altına dokunma (telifli).

## SÜRE TAVANI
60 dk. Dolarsa o ana kadarki İŞLEYEN hâli commit et (yarım/kırık kod
commit'leme), kalanı kart önerisi olarak raporda yaz.

## ETİKET
PARALEL (V1-D, V1-E ile birlikte; dosya kümeleri kesişmiyor)
