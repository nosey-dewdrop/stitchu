# KART F10-A — landing envanteri (isci-vitrin)

## NE
`web/index.html`'in ekranda gorunen HER iddiasini tabloya dok: hala dogru mu,
hangi test/alet kanitliyor, hukum ne. Hukum verme, SAY ve KANIT YOLU goster.

## GIRDI DOSYALARI (sadece bunlar)
- web/index.html
- web/create.html · web/closet.html · web/studio.html   (baglantili vaatler icin)
- engine/tools/site-health.mjs
- engine/CMakeLists.txt   (hangi test adlari VAR, onu buradan oku)
- engine/tests/            (dizin listesi; test ADLARINI ogren)

## CIKTI
`GECE/F10-A.md` — tek dosya. Icinde:

1. **IDDIA TABLOSU.** Satir basina: `iddia metni (birebir alinti) | tur
   (SAYI / OZELLIK / KIYAS / GIZLILIK) | kanitlayan test-alet dosya yolu ya da
   YOK | hukum`. Hukum kelimeleri sadece sunlar: `DOGRU` (repoda o sayiyi basan
   bir test/alet var, adini yaz) · `KANITSIZ` (sayi var, basan alet yok) ·
   `BAYAT` (bir zamanlar dogruydu, bugun oyle degil — nasil olctugunu yaz) ·
   `YALAN` (UI'in soyledigi ile motorun yaptigi celisiyor — celiskinin iki
   tarafini da dosya yoluyla goster).
   En az su sayilar tabloya GIRECEK: `0.00 mm`, `70,200`, `EU34–52`, `10 of 10`,
   `0.000 mm DXF`, `0.000000 mm²`, `$34–49`, `POST /api/draft`, `/api/grade`,
   `seven measurements`, `all 10 pieces`.
2. **B2B DILI.** Sayfa bugun kendini "a fixed-size pattern CAD ... the DXF-AAMA
   and tech-pack a factory reads" diye tanitiyor. Repo kokundeki CLAUDE.md'de
   "CAD" hakkinda ne yaziyor — `grep -n CAD CLAUDE.md` ile CEK (dosyayi butun
   olarak ACMA) ve celiskiyi tek paragrafta yaz.
3. **OLU BAGLANTI.** `node engine/tools/site-health.mjs` kostur, ciktisini
   `GECE/log/F10A.site-health.txt`'ye yaz, ozetini tabloya koy (kirik ic link
   sayisi, sitemap 404 sayisi, `?v` gerilemesi).
4. **VAAT ↔ MOTOR FARKI.** Sayfanin vaat ettigi ama urunde olmayan her sey
   (ve tersi) ayri liste. Ozellikle: foto+prompt -> KALIP + FLAT + REHBER uc
   ciktisi sayfada gorunuyor mu; kumas ekseni gorunuyor mu; duzenleme
   ("suraya fiyonk ekle") gorunuyor mu.

## ONCE GREP
- `grep -rn "add_test" engine/CMakeLists.txt` — var olan test adlari.
- `grep -rn "70,200\|70200" --include=*.md --include=*.mjs --include=*.cpp .`
  — bu sayiyi basan bir alet var mi?
- Ayni greple `0.000000` ve `EU34` icin de bak.

## YASAKLAR
- Kod YAZMA. `web/` `engine/` `contract/` altina TEK BAYT yazma.
- HEDEF.md · DAMLA-KUYRUK.md · devlog.md · linkedin.md · ANAYASA.md · GECE/KOSU.md
  dosyalarini Read ile ACMA. Gerekirse `grep -n` ile tek satir cek.
- "Muhtemelen / gorunuyor / sanirim" yasak. Kanit = dosya yolu + satir.
- Yeni sayi UYDURMA. Bir sayiyi basan alet bulamadiysan hukum `KANITSIZ`.
- F10-A.md'de andigin HER dosya yolu diskte GERCEKTEN var olacak (kapi K3
  `test -e` ile dogruluyor). Var olmayan yolu ANMA, "yok" demek istiyorsan
  yolu tirnak icinde degil, duz cumleyle tarif et.

## SURE TAVANI
40 tur.
