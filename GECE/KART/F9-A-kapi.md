# KART F9-A — DOCS DURAN-İDDİA KAPISI (isci-motor) · SET 1, PARALEL

## NE
`engine/tests/docs_truth_check.sh` adında MEKANİK bir kapı yaz, ctest'e bağla, ve
faz-öncesi commit `962407d`'de KIRMIZI düştüğünü ÖLÇEREK kanıtla.

## GİRDİ DOSYALARI (bunlar ve sadece bunlar)
- `engine/CMakeLists.txt` (test kayıt şeklini gör)
- `README.md` · `docs/ARCHITECTURE.md` · `docs/KATMAN-HARITASI.md`
  · `docs/SATIS-SARTNAMESI.md` · `docs/loop-engineering.md`
- Faz-öncesi commit: `962407d` (`GECE/log/F9.before`)

## ÖNCE GREP
- `grep -n "add_test" engine/CMakeLists.txt` — mevcut .sh/.py tabanlı bir test
  var mı, nasıl kaydedilmiş, çalışma dizini ne (`WORKING_DIRECTORY`)?
- `grep -rn "docs_truth" engine/` — böyle bir şey zaten var mı?

## KAPININ ŞARTNAMESİ (şef sabitledi, DEĞİŞTİRME — kâtip de aynı listeye çalışıyor)

KAPSAM (tam olarak bu 5 dosya): `README.md`, `docs/ARCHITECTURE.md`,
`docs/KATMAN-HARITASI.md`, `docs/SATIS-SARTNAMESI.md`, `docs/loop-engineering.md`.
HARİÇ: `docs/archive/**`, `docs/reference/**`, ``` ile açılan kod blokları.

**KURAL A — duran iddia (izin verilen sayı: 0).** Büyük/küçük harf duyarsız,
birebir ifade eşleşmesi:
`ALL PASS` · `0.00mm` · `0.00 mm` · `byte-identical` · `byte for byte` ·
`zero issues` · `no failures` · `0 failures` · `all green` · `none known` ·
`no known bugs` · `is complete` · `are complete` · `is done` · `are done` ·
`now complete` · `now done` ·
`BİTTİ` · `BITTI` · `KAPANDI` · `TAMAMLANDI` · `HAZIR` · `SIFIR HATA` · `HEPSİ GEÇTİ`

**KURAL B — sayısal iddianın aynı satırda TANIĞI olmalı.**
Sayısal iddia = `[0-9][0-9.,]*[ ]*(mm|cm|%|drafts?|tests?|failures?|vertices|sizes|suites?|bytes?|KB|MB)\b`
VEYA `[0-9]+/[0-9]+`.
Tanık = aynı satırda şunlardan en az biri: `*.sh|*.py|*.mjs|*.js|*.cpp|*.json`
biçiminde bir dosya adı · `..._check` biçiminde bir test adı · `ctest` ·
`engine/` `contract/` `web/` `GECE/` `scripts/` ile başlayan bir yol.
Tanıksız her satır ihlaldir.

ÇIKTI BİÇİMİ (stdout, son satır birebir bu kalıpta):
`docs truth: <N> standing-claim violation(s) | <M> unwitnessed numeric claim(s)`
Öncesinde her ihlal `dosya:satır: <sebep>: <satırın ilk 100 karakteri>` olarak
basılır. `N+M > 0` ise exit 1, aksi halde exit 0.

## ÇIKTI (dosya yolu + kapı adı)
- `engine/tests/docs_truth_check.sh` (çalıştırılabilir, `chmod +x`)
- `engine/CMakeLists.txt` içinde `add_test(NAME docs_truth_check ...)`
  — çalışma dizini repo kökü olmalı (`${CMAKE_SOURCE_DIR}/..` gibi bir yol
  UYDURMA; mevcut testlerin nasıl yaptığına BAK ve aynısını yap)
- `GECE/log/F9A.gate.before.txt` — kapının **faz-öncesi** docs'a karşı çıktısı
- `GECE/log/F9A.gate.now.txt` — kapının **bugünkü** docs'a karşı çıktısı
- `GECE/F9-A.md` — tutanak

## FAZ-ÖNCESİ ÖLÇÜM (K2 kanıtı — bunu atlama)
`git worktree add --detach /tmp/f9-before 962407d` ile temiz ağaç aç, kapı
betiğini oraya KOPYALA, o ağaçta koştur, çıktıyı `GECE/log/F9A.gate.before.txt`'ye
yaz, worktree'yi `git worktree remove` ile kaldır. Kapı orada exit 1 vermiyorsa
kapı BOŞTUR: o zaman ihlal sayısını gerçek sayıya göre yeniden ölç ve tutanağa
"kapı boş çıktı" diye YAZ — kuralı gevşeterek kırmızı uydurma.

## YASAKLAR
- `docs/`, `README.md` içeriğine DOKUNMA. Onları kâtip yazıyor (aynı fazda aynı
  dosyaya tek işçi yazar). Sen sadece OKUYUP ölçersin.
- `GECE/kapi.sh`, `GECE/mutasyon.sh`, `GECE/gece.sh`'e dokunma (§K5, mühürlü).
- Mevcut hiçbir teste dokunma (§K6).
- Kuralı gevşetme (§0.12). İhlal çoksa bu bir bulgudur, kapı kusuru değildir.
- commit ATMA.

## SÜRE TAVANI
maxTurns 40 (tanımından gelir). İLK İŞİN `GECE/F9-A.md`'yi AÇMAK ve ilerledikçe
EKLEMEK — sonda tek seferde yazma (§ MEKANİK DERS).
