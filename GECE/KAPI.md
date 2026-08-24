# KAPI.md — v6 koşusu

Format (v6 3.8.e): faz · alt kapı · GEÇTİ/KALDI · gerekçe (tek cümle) · log yolu
v5 koşusunun kapı satırları GECE/arsiv/v5-kosusu/KAPI.md içindedir ve bu koşuda kanıt değildir.

---

## V0-0 (envanter fazı: 0A·0B·0C·0D·0E·0R) — hakem hükmü, 2026-08-24

Hakem temiz oturumda koştu, brief görmedi, fazın hedefi kendisine söylenmedi.
Aşağıdaki her satır hakemin KENDİ yeniden koşturduğu komutlara dayanır.

- V0-0 · 4.1 makine · **GEÇTİ** · iki bağımsız ctest koşusunda da 105 koşan / 6 kırmızı ve kırmızı AD kümesi bire bir aynı (`diff` boş, RULES 9 ihlali yok), wasm paritesi hakem tarafından yeniden koşuldu ve 561 blokta şekil farkı 0 / hata 0 / en kötü sapma 1.0000e-4 mm çıktı, ana iplik ölçüldü (Worker yok, tek üretim ~1.0 ms, yayınlanmış 50 ms long-task sınırının altında → Worker kapı değil kart). · `GECE/log/V0-0A.ctest.txt` · `GECE/log/V0-SEF.ctest.txt` · `GECE/log/V0-0E.wasm.txt`
- V0-0 · 4.2 boş test · **UYGULANMAZ** · faz hiçbir yeni denetim eklemedi ve bu hakem tarafından doğrulandı: iki ctest logunun test ADI kümeleri bire bir aynı, `git diff 81fdae3..HEAD -- engine/CMakeLists.txt` boş, tek yeni kaynak `engine/tools/wasm-baseline.mjs` bir ÖLÇÜ ALETİDİR (hiçbir CMake/CI satırına bağlı değil, hüküm basmıyor, tek `process.exit` satırı eksik veri için) — dolayısıyla düşecek yeni kırmızı yoktur. · `GECE/log/V0-0A.ctest.txt` · `GECE/log/V0-SEF.ctest.txt`
- V0-0 · 4.3 kanıt · **GEÇTİ** · beş ayrı çıktı dosyasından örneklenen 20'den fazla sayı hakem tarafından yeniden koşturuldu ve HEPSİ birebir tuttu (ctest 106 tanımlı · 6 kırmızı ad · `golden_dump` 23406 satır ve md5 `d5b5f28b…` · pin farkı 9661 · `git ls-files patterns_real` 41 · vocab 37 eksen/132 değer · operatör 9 shipped/1 flagged/5 absent · `grep -c surfacepattern engine/wasm/bindings.cpp` 0 · `engine/dist` 1209765 bayt · wasm paritesi 561/436/23406/23281/125/1.0000e-4 · site-health 127 sayfa/2597 ref/124 sitemap · vision 71-162, 105-162, 67-78, 47-50 · 29 foto/778 manifest · `taban_v3` 16 pin ve `dress_bandeau_circle` yok · `collarType=1` 8 adet nan · `sleeveCap=1.5` hatasız kabul), tek bulunan tutarsızlık kozmetik (V0-0A logu "455 satır" diyor, dosya 467 satır; atıf verdiği satır numaraları doğru). · `GECE/log/V0-0E.wasm.txt` · `GECE/log/V0-0C.site-health.txt` · `GECE/log/V0-0B.eval.txt`
- V0-0 · 4.4 hakem · **GEÇTİ** · beş soru koşuldu ve çıktı kapıyı geçmek için şekillendirilmemiş: faz kendi aleyhine sayı basıyor (sevk edilen yüzey hattı %14.29, vitrinde 12 yalan, `bindings.cpp:94` sessiz enum ikamesi = RULES değişmez 1'in sevk edilen hatta ihlali, `collarType` 1..6 tarayıcıya geçersiz JSON basıyor) ve hiçbir kırmızıyı kapatmaya kalkmamış. · bu dosya
- V0-0 · 4.5 mutasyon · **UYGULANMAZ** · faz yeni bir KAPI kurmadı (4.2), kurulmayan kapı kırılamaz; kurduğu ölçü aleti kör değil — gerçek bir 125 satırlık sapmayı bulup en kötü sapmayı satırıyla basıyor, ama bu bir mutasyon kanıtı DEĞİLDİR ve öyle sayılmadı. · `GECE/log/V0-0E.wasm.txt`
- V0-0 · 4.6 tolerans · **GEÇTİ** · faz aralığında tek bir tolerans/eşik/pin/sözleşme dosyası değişmedi (`git diff --name-only 81fdae3..HEAD` → GECE/ dışında yalnız yeni dosya `engine/tools/wasm-baseline.mjs`), pin YENİLENMEDİ ve sessiz gevşetme yok; V0-0R ayrıca eşik uydurmayı açıkça reddedip kaynaklanabilen tek eşiği (50 ms long-task, web.dev) kaynağıyla veriyor. · `git diff --stat 81fdae3..HEAD` · `GECE/V0-0R.md`
- V0-0 · 4.7 kırmızı raporlama · **KALDI** · 6 kırmızının 6'sında kök teşhis + pin/commit/mtime var ama HİÇBİRİNDE §4.7'nin şart koştuğu "en az bir ÖLÇÜLMÜŞ çözüm adayı" yok; faz sınıflamayı da açıkça hakeme devretti ("sınıflama YAPILMADI"), `recipe_dress_check`'in sapması mm cinsinden hiç ölçülmedi (V0-0A "ölçülemedi" diyor) ve `golden_check`'in 9661 satırlık (%41.3) sapması yalnız kardeş kart V0-0E'de görünüyor, kırmızıyı raporlayan V0-0A'da hiç geçmiyor — aynı kırmızı hakkında iki kart iki farklı ağırlıkta konuşuyor. · `GECE/V0-0A.md` §2 · `GECE/V0-0E.md` "KART DIŞI FARK EDİLEN"

**Hakem notu (4.1'e iliştirilmiştir):** faz-sonrası koşunun logları
(`GECE/log/V0-SEF.ctest.txt`, `.red-names.txt`, `.site-health.txt`) hakem
gelene kadar TAKİPSİZDİ; RULES 9 iki ctest logunun da commit'e girmesini şart
koşuyor. Hakem bu üç dosyayı bu commit'e bankaladı; 4.1'in GEÇTİ hükmü bu
bankalamadan sonrası içindir.

### V0-0 · 6 KIRMIZININ SINIFI (hüküm hakemin, kanıt satır satır)

| # | kırmızı | SINIF | dayandığı kanıt (hakem koşturdu) |
|---|---|---|---|
| 1 | `golden_check` | **BİLİNÇLİ BAYAT PİN** | Pin `engine/golden-reference.csv` son commit `af49514` (29 Tem), defter `engine/GOLDEN-PIN.md` son girdi 19 Tem. `GECE/log/F0v3.ctest.txt` (22 Ağu 15:26) golden_check'i kırmızı listede TAŞIMIYOR = o an yeşildi; `GECE/log/F-L.ctest.before.txt` (23 Ağu 04:45) kırmızı gösteriyor. Arada `engine/src`'ye dokunan 8 commit var ve hepsi ilan edilmiş ÇİZİM değişikliği (`52ae85c`/`0cb5d23` oyuğu Aldrich'in yayınlanmış genişlik çizgisine bağlıyor, `06911d9` uzatılmış yan dikişi true ediyor, `11c199a` oyuk aramasına tavan koyuyor). Repin usulü (`scripts/repin-golden.sh` + defter + Damla onayı) koşulmadı — doğrusu da bu, çünkü onay Damla'ya bağlı. ⚠ "Motor İYİLEŞTİ" kısmı o commit'lerin kendi beyanına + CLAUDE.md'nin bilinen "%22 kısa oyuk" kusuruna dayanıyor; hakem sapmanın iyileşme olduğunu bağımsız ÖLÇMEDİ. Sapmanın kendisi ölçüldü: 9661 satır, ilk farkta 3.25 mm. |
| 2 | `style_check` | **KAYNAK EKSİĞİ** | `ls -ld engine/STYLE-PIN` → dizin YOK; `af49514` (29 Tem) silmiş. Testin kendi çıktısı tek çıkışı "Damla kalemi onaylar → `scripts/repin-style.sh`" diye ilan ediyor. Motor tarafı hiç devrede değil: kıyaslanacak veri yok. |
| 3 | `sizechart_source_check` | **KAYNAK EKSİĞİ** | 7 sütunun 4'ünün (`shoulderCM`, `backLengthCM`, `armLengthCM`, `neckCM`) arkasında yayın yok; test kendini "DELIBERATELY RED as of TUR 18B" ilan ediyor ve kapanışı Damla'nın adlandıracağı bir yayına bağlıyor (DAMLA-KUYRUK K10). Kapı ölü değil: 7/7 mutasyon sondası hükmü oynatıyor. |
| 4 | `recipe_dress_check` | **SINIFLANAMAZ** | En yakın ihtimal bilinçli bayatlık ama KANIT YETMİYOR. Elimdeki: `F0v3` (22 Ağu 15:26) yeşil → `F-L.before` (23 Ağu 04:45) kırmızı; test bir PİN kıyası değil, `engine/tests/recipe_dress_check.cpp:3-9`'a göre CANLI reçete hattı ↔ CANLI motor çekirdeği ÇAPRAZ PARİTESİ, yani iki taraf da bugünkü ağaçta; K0 sabit paritesi 27/27 PASS, `Spaghetti Strap` 3/3 PASS, 3 parça + kumaş (1.8500 vs 1.9500) FAIL. **Eksik kanıt:** (a) sapmanın mm büyüklüğü hiç basılmıyor (test yalnız "DIFFERS" diyor), (b) 23 Ağu'nun 8 `engine/src` commit'i üstünde bisect koşulmadı — çekirdek mi doğru reçete hattı mı bayat, ayrılamıyor. Tahmin yazmıyorum. |
| 5 | `contract_check` | **ÜÇ SINIFIN HİÇBİRİ — ilan edilmiş karar borcu** | `git ls-files patterns_real \| wc -l` → **41** takipli telifli dosya, hedef 0. Testin kendi cümlesi: "DECLARED DECISION (not a breach)". Motor bozulmadı (gerileme değil), pin yok (bayat pin değil), veri eksik değil (dosyalar fazlasıyla orada) — kapı, filter-repo kararı Damla'ya ait olduğu için bedeli GÖRÜNÜR tutmak üzere bilerek kırmızı tutuluyor. ⚠ İlan metninin kendisi bayat: içinde "bugun 49" yazıyor, bugün sayılan 41. |
| 6 | `figure_check` | **KAYNAK EKSİĞİ** | `contract/figure-bands.json` → `mandal.taban_v3` 16 pin taşıyor ve `dress_bandeau_circle` içinde YOK (hakem koşturdu). Dosyanın kendi `_taban_v3_pinsiz_kalan` alanı: devralınacak kardeş yok, pin BİLEREK yazılmadı, DAMLA-KUYRUK'a düşüldü; kapının kendi yasağı gereği kendi ölçtüğü 0.872 pinlenemez (regen-vs-regen). Pinlenecek kaynak yok. |

**Ek hüküm — V0-0A'nın "7 mi 6 mı, DOĞRULANMADI" notu ÇÖZÜLDÜ:** bir önceki
koşu `GECE/log/F-N.ctest.after.txt` (23 Ağu 05:46) 7 kırmızı basıyor ve aradaki
tek fark `bundle_fresh_check`; o kapı bu gece yeşil (V0-0E `bundle_fresh_check.sh`
→ exit 0). Yani kırmızı kümesi BÜYÜMEDİ, **küçüldü** (7 → 6).

**Ek hüküm — V0-0E'nin 9661 satırlık sapması, hakem koşturdu:**
`engine/build/golden_dump > /tmp/gd.csv` (deterministik, 3 koşuda md5
`d5b5f28b2ef41a776b14699e9220982a`), `diff /tmp/gd.csv engine/golden-reference.csv
| grep -c '^<'` → **9661** (23406 satırın %41.3'ü) — sayı DOĞRU.
`golden_check` bunu **YAKALIYOR**: `ctest -R '^golden_check$'` kırmızı düşüyor ve
bastığı ilk fark satırı, V0-0E'nin bulduğu satırın ta kendisi (313/314,
`164.0800` ↔ `167.3252` = 3.25 mm). Yani V0-0E'nin iki şıkkından **(a) doğru**:
kapı kırmızı ve sapmayı gösteriyor. **(b) YANLIŞTIR** — `golden-diff.py`
toleransı bu farkı SOĞURMUYOR, kapı soğurmadığı için kırmızı.


---

## V0-0 · 4.7 YENİDEN YARGI (2026-08-24, ikinci hakem)

Birinci hakemin **KALDI** hükmü tarihsel kayıt olarak yukarıda durur ve silinmedi;
faz o hükmün üzerine yeni bir ölçüm çıktısı (`GECE/V0-0F.md` + `GECE/log/V0-0F.aday.txt`)
üretti. Aşağıdaki satır yalnız 4.7'yi yeniden yargılar, diğer alt kapılara dokunmaz.

- V0-0 · 4.7 kırmızı raporlama (yeniden) · **GEÇTİ** · Ana ağaçta onarım yok (`git diff --stat e1d71a9..HEAD` yalnız `GECE/`; `git status --porcelain engine contract recipes web` boş) ve altı kırmızının altısı da kök teşhis taşıyor, beşi ölçülmüş çözüm adayı taşıyor (golden: motoru `a571407`'ye döndürme tam ctest'le ölçülüp RULES 9 gerekçesiyle **reddedildi** + re-pin'in taşıyacağı dağılım ölçüldü · recipe: reçetenin `torsoArmholeY` satırı ölçülüp FAIL 10→9 kazandı · contract: `git rm --cached` ile GREEN ölçüldü · figure: 0.872 pini yeşile döndürdüğü ölçüldü ve regen-vs-regen diye **reddedildi** · sizechart: uydurma kaynak ölçüldü, **reddedildi**, üstüne kapının kendi zayıflığı ölçüldü), altıncısında (`style_check`) adayın yokluğu mazeret değil dosya düzeyinde doğrulanmış bir engel (`ls -ld engine/STYLE-PIN` → yok, `style_check.mjs:3-4,25-27` regen-vs-regen yasağı, `repin-style.sh` insanın terminale yazacağı onay cümlesi); hakem beş sayıyı bağımsız yeniden koşturdu ve hepsi birebir tuttu: golden sapması **9651 satır / %41.23 / max 62.7764 mm / medyan 5.6000**, `a571407` golden_dump'ı pinle **BAYT-ÖZDEŞ** ve `52ae85c` **8356 satır / %35.70 / medyan 11.0424** (temiz iki Release build, "ilk sapan commit" sınırı doğrulandı), recipe adayı **PASS 115→116 / FAIL 10→9**, `git ls-files patterns_real` **41** ve untrack sonrası gate **GREEN**, `taban_v3` **16 pin, `dress_bandeau_circle` yok**. · `GECE/log/V0-0F.hakem.txt` · `GECE/log/V0-0F.aday.txt` · `GECE/V0-0F.md`

**İkinci hakem notu (hükmü değiştirmez):** (1) Eski KAPI.md satırındaki **9661** ile
V0-0F'in **9651**'i çelişki değil, yöntem farkı — `diff | grep -c '^<'` 9661,
satır-pozisyonu eşlemesi 9651; hakem ikisini de koşturup uzlaştırdı, V0-0F bu farkı
uzlaştırmamıştı. (2) `style_check` için kartın denemediği bir ÖLÇÜM yolu vardı:
`af49514^` ağacında iki eski pin duruyor, "pin varsa kapı ne diyor" ölçülebilirdi;
kapatan bir aday değil (o commit onları bilerek sildi) ama kartın "ölçülemedi" dediği
şeyin ta kendisi — kart bunu gizlemeyip ÖLÇÜLEMEYEN listesine yazmış. (3) A3'ün
aday-1 reddindeki ENV/REAL ayrımı hakem tarafından yeniden koşturulmadı
(**DOĞRULANMADI**); 4.7 adayın ölçülmüş+kayıtlı olmasını ister, reddin doğruluğunu
değil, o yüzden hüküm bu ayrımdan bağımsızdır.

---

## V0-0 · YAZMA VE KÂTİP KAPILARI (şef kaydı, 2026-08-24)

- V0-0 · yazma kapısı · **GEÇTİ** · tutanak `GECE/V0.md`, koşu durumu `GECE/KOSU.md`
  (65 satır, tavan 150) ve kuyruğun başındaki üç karar satırı (`K-FN1`, `K-V0A`,
  `K-V0B`, hepsi 3.8.d formatında ve VARSAYILANIYLA) tek commit'te bankalandı. ·
  commit `04118d1`
- V0-0 · kâtip kapısı · **GEÇTİ** · kâtip ayrı temiz oturumda koştu, yalnız
  `docs/` + `README.md` + `GECE/INDEX.md`'ye yazdı, fazın kalıcı dosyalarını
  yönlendirme tablosuna aldı ve koşunun ÇÜRÜTTÜĞÜ 5 bayat cümleyi (77/77 ·
  EU34-52 10/10 · byte-identical · ALL PASS · ~218 KB bundle) sessiz silmeden
  emekliye ayırdı. · commit `65bca82`

**FAZ HÜKMÜ: V0 KAPANDI.** Altı alt kapı + yazma + kâtip yeşil; 4.7 önce KALDI
aldı, 0F kartıyla kapatıldı, ikinci hakem GEÇTİ dedi. Yeni kırmızı ad: 0.

- V1 · sınıf hakemi · **GEÇTİ** · altı kırmızı sınıflandı: iki (b) bilinçli bayat pin (`golden_check`, `recipe_dress_check` — kökü `52ae85c`, kırmızı commit gövdesinde ilan edilmiş, mühür yenileme şartı Damla onayı), dört (c) kaynak/karar eksiği (`style_check`, `sizechart_source_check`, `contract_check`, `figure_check`), sıfır (a) gerileme · `GECE/V1-SINIF.md`

---

## V1 (uygulama fazı: 513b175 · e4516cf · e8b7f19) — hakem hükmü, 2026-08-24

Hakem temiz oturumda koştu, brief/kart/niyet dosyası görmedi. Aşağıdaki her satır
hakemin KENDİ yeniden koşturduğu komutlara dayanır; faz-öncesi hâller `/tmp`'de
ayrı bir Release worktree'de derlendi ve worktree koşu sonunda kaldırıldı.

- V1 · 4.1 makine · **GEÇTİ** · hakem tam süiti kendi koşturdu (`ctest --test-dir engine/build --output-on-failure`, Release, 286.09 sn) ve fazın bağlayıcı logunu satır satır tekrarladı: 105 koşan / 4 kırmızı / 1 disabled (`h10_gate_check`), kırmızı adlar `style_check` · `sizechart_source_check` · `contract_check` · `figure_check` — fazın bastığı kümeyle bire bir aynı. · `GECE/log/V1-A.ctest.after.txt`
- V1 · 4.2 boş test · **GEÇTİ** · bu turun TEK yeni denetimi `style_check.mjs`'in kapsam kuralıdır (`git diff --numstat` ile doğrulandı: `e4516cf` ve `e8b7f19` hiçbir test dosyasına dokunmuyor, `recipe_dress_check.cpp` ve `golden_check` bayt bayt değişmedi), ve o kural boş değil — bugünkü 0-pin hâlinde de, sahte 1-pin hâlinde de KIRMIZI düşüyor. · `GECE/log/V1-E.mutasyon.txt` · hakemin kendi koşusu
- V1 · 4.5 mutasyon (M8 karşı-kanıtı) · **GEÇTİ — DOĞRULANDI** · hakem M8'i sıfırdan üretti: `engine/STYLE-PIN/` yokken dizini açtı, üretim yolundan (`renderGarmentFlatAsync`) `dress_vneck_aline` için TEK gerçek pin yazdı (12117 bayt), sonra aynı dizinde iki testi koşturdu — `git show 513b175^:engine/tests/style_check.mjs` → `PASS ... exit 0` (YEŞİL), HEAD'in testi → `FAIL: 30 stilin pini YOK ... exit 1` (KIRMIZI); delik gerçekti ve yeni kural onu kapatıyor, mutasyon harness'ı temizlendi (`ls engine/STYLE-PIN` → yok, `git status` sızıntısız). · `GECE/log/V1-E.mutasyon.txt` §M8 · hakemin kendi koşusu
- V1 · 4.4 hakem (kaynak okuması: `scye` opu testi geçmek için mi şekillendirilmiş?) · **GEÇTİ** · op bir düzeltme katsayısı ya da ikinci el-yazması eğri DEĞİL, iki hattı AYNI KAYNAĞA bağlıyor: `recipe.cpp:975-983` doğrudan `BodiceBlock::scyeCurve`'ü çağırıyor, o da `bodice.cpp:820-821`'de motorun kendi `armholeCurveFor`'una düşüyor — motorun `makePiece`/`makePrincessPieces` yollarının çağırdığı fonksiyonun ta kendisi (`bodice.cpp:508`, `:624`) — ve reçete karşılığında 10 adet el-yazması kontrol-noktası skalerini (`cp1x/cp1y/cp2x/cp2y/hollow/stx/sty/tanReach/slen/stxRaw`) her iki parçadan da SİLDİ, yani sayı eşitlenmedi, kod paylaşıldı. · `engine/src/recipe.cpp` · `engine/src/bodice.cpp:804-822`
- V1 · mühür (`engine/golden-reference.csv` re-pin) · **KALDI** · mührün ÖLÇÜM tarafı kusursuz — hakem `engine/build/golden_dump`'ı koşturdu ve çıktı pinle BAYT-ÖZDEŞ (md5 `d5b5f28b2ef41a776b14699e9220982a`, 23406 satır, `cmp` exit 0, `contract/generated-paths.sha256`'daki `d28297e4…` da tuttu), defterin içerik-diff tablosunun ON SATIRININ HEPSİNİ bağımsız yeniden hesapladı ve birebir çıktı (9651 satır / %41.23, max 62.7764, medyan 5.6000, Bodice Front 1020/62.7764/6.1286 … Skirt 150/0.0001/0.0001), sebep de yazılı yerinde duruyor (`engine/GOLDEN-PIN.md` 2026-08-24 girdisi: ayrışma commit'i `52ae85c`, `bodice.cpp:905-907` ve `:917-924`, eski/yeni formül, Aldrich p.11'in iki noktası) — **AMA mührü taşıyan en güçlü cümle ÖLÇÜLMEMİŞ VE YANLIŞ**: defter (`GOLDEN-PIN.md:56-57`) ve commit gövdesi "bağımsız tanık `sloper_check` `52ae85c`'den ÖNCE KIRMIZIYDI, bugün YEŞİL, scye depth 189.0 → 210.0" diyor; hakem `52ae85c^` (c3d4359) ve `af49514` ağaçlarını ayrı Release worktree'de derleyip `sloper_check`'i koşturdu ve İKİSİNDE DE **exit 0, sıfır FAIL satırı, "all sloper checks pass"** çıktı, scye kalemi de ÖNCEDEN GEÇİYORDU (`engine 204.4 / aldrich 215.0 / err -10.6 mm`, tolerans 15 mm) — yani hareket kırmızıdan yeşile değil, yeşilden daha-yeşile (−10.6 → −5.0 mm); "189.0" sayısı iki sondanın hiçbirinde yok ve fazın ölçüm defteri `sloper_check`'i yalnız HEAD'de koşturmuş, "önce" tarafı hiç ölçülmemiş. İyileşmenin YÖNÜ gerçek ve mühür bir kırmızıyı susturmuyor; düşen, mührü savunan "üçüncü tarafça ölçüldü" iddiasının kendisidir ve o iddia düzeltilmeden mühür geçemez. · `GECE/log/V1-A.olcum.txt:59-63` · `engine/GOLDEN-PIN.md:55-64`
- V1 · mühür usulü (`scripts/repin-golden.sh:33-38` kendi şartları) · **KALDI** · script'in üç şartından ikisi tam (1: tarihli defter girdisi VAR ve içeriği GERÇEK — hakem tablonun her sayısını yeniden hesapladı; 3: csv + defter AYNI commit'te, `e8b7f19`), fakat 2. şart — "Damla's explicit approval for the behavior change" — SAĞLANMADI ve defter bunu kendisi yazıyor ("DAMLA ONAYI BEKLIYOR (K-V1A) — varsayilan yurudu"); script'in kendi cümlesi "the pin is not valid without these" olduğuna göre mühür bugün kendi usulüne göre GEÇERSİZDİR (gizlenmiş değil, ilan edilmiş bir eksik — ama eksik). · `scripts/repin-golden.sh:33-38` · `engine/GOLDEN-PIN.md:69-72`
- V1 · 4.1/RULES 9 kırmızı AD kümesi · **GEÇTİ** · iki log isim isim karşılaştırıldı ve hakemin kendi taze koşusu SONRA kümesini birebir üretti: ÖNCE (6) `contract_check` · `figure_check` · `golden_check` · `recipe_dress_check` · `sizechart_source_check` · `style_check`, SONRA (4) `contract_check` · `figure_check` · `sizechart_source_check` · `style_check`; `diff` yalnız İKİ SİLME gösteriyor, sıfır ekleme — küme büyümedi, küçüldü. · `GECE/log/V1.ctest.before.txt` · `GECE/log/V1-A.ctest.after.txt`
- V1 · 4.6 tolerans · **GEÇTİ** · faz aralığında tek bir tolerans/eşik gevşemedi: üç commit'in `--numstat`'ı `engine/tests/` altında yalnız `style_check.mjs`'i gösteriyor ve o değişiklik kapıyı SIKIYOR (kısmi pin artık kırmızı), `golden-diff` toleransına, `sloper_check` bantlarına, `recipe_dress_check`'in 1e-6 mm eşiğine hiç dokunulmadı; kımıldayan tek şey mührün kendisidir ve o bir tolerans değil ilan edilmiş bir re-pin'dir (usul hükmü ayrı satırda). · `git diff 513b175^ e8b7f19 --numstat` · `GECE/log/V1-A.olcum.txt:31-43`

**Hakem notu 1 (hükmü değiştirmez, 4.4'e iliştirilmiştir):** `scye` opu EĞRİYİ
paylaşıyor ama ÇERÇEVEYİ paylaşmıyor — reçete JSON'una 8 yeni katsayı elle
kopyalandı (`scyeDepthPerBust`, `scyeDepthInterceptMM`, `shoulderSeamPerBust`,
`shoulderSeamInterceptMM`, `scyeBackWidthHalfPerBust/InterceptMM`,
`scyeChestWidthHalfPerBust/InterceptMM`) ve **sekizinin hiçbiri
`recipe_dress_check.cpp:124-154`'ün K0 sabit-parite mandalında YOK**; dosyanın
kendi başlık cümlesi ("every recipe const == its motor counterpart",
`recipe_dress_check.cpp:3`) bugün artık DOĞRU DEĞİLDİR. Risk kapalı sayılır
çünkü çapraz parite üç gövdede çizilmiş çıktıyı karşılaştırıyor, ama mandalın
ilan ettiği garanti kodda karşılıksız (RULES §1'in tam tanımı). Aynı mandalda
altı sabit (`shoulderSeamTargetMM`, `armholeDepthFactor`, `hollowShareFront`,
`hollowShareBack`, `tangentShare`, `lowerDropShare`) hâlâ latch'leniyor ama
reçetede artık ÖLÜ — hiçbir skaler onları okumuyor.

**Hakem notu 2 (hükmü değiştirmez):** `scye` opu ile birlikte
`recipe_dress_check`'in "canlı ikinci-yol kanıtı" (`recipe_dress_check.cpp:6-9`)
oyuk parçasında TOTOLOJİK hâle geldi: artık iki taraf da aynı C++ fonksiyonunu
çağırdığı için oyuk eğrisi tanım gereği ayrışamaz. Mühendislik kararı doğrudur
(bir JSON DSL bisection çözücü taşıyamaz) ve çerçeve aritmetiği hâlâ bağımsız,
ama testin kendi yorumu bu daralmayı yazmıyor — kapı 125 hükmün 125'ini
geçerken, o hükümlerden bir bölümü artık kendi kendini doğruluyor.

**Hakem notu 3 — ÖLÇÜLMEYENLER:** (a) `sloper_check`'in `a15bdd3` (19 Tem)
tarihli TEK commit'i olduğu ve o günden bugüne bayt bayt DEĞİŞMEDİĞİ
doğrulandı (`git diff a15bdd3 HEAD -- engine/tests/sloper_check.cpp` boş), yani
tanığın bağımsızlığı sağlam — çürüyen yalnız "kırmızıydı" iddiasıdır. (b) Yeni
oyuğun GÖRSEL doğruluğu (Damla'nın gözü) ölçülmedi ve ölçülemez; K-V1A açık.
(c) 62.7764 mm'lik en büyük hareketin hangi bedene/giysiye düştüğü hakem
tarafından ayrıştırılmadı — tablo parça bazında doğrulandı, giysi bazında
DEĞİL. (d) `web/vendor/stitchu-engine.js` ve worker bundle'larının bu ağaçtan
derlendiği iddiası hakem tarafından yeniden derlenerek DOĞRULANMADI; yalnız
`bundle_fresh_check`'in bugün yeşil olduğu görüldü.

**FAZ HÜKMÜ: V1 KAPANMADI.** Beş alt kapı geçti, mühürle ilgili iki satır KALDI:
biri ölçülmemiş bir tanık iddiası, diğeri script'in kendi 2. şartı (Damla onayı).
Yeni kırmızı ad: 0.

---

## V1 · mühür — YENİDEN YARGI (2026-08-24, üçüncü hakem, düzeltme commit'i `05156a1`)

Bir önceki **KALDI** hükmü tarihsel kayıt olarak yukarıda durur ve silinmedi; aşağıdaki
satır yalnız mühür alt kapısını yeniden yargılar, `mühür usulü` satırına (Damla onayı,
`repin-golden.sh` şart 2) dokunmaz — o **KALDI** olarak yürürlüktedir.

- V1 · mühür (`engine/golden-reference.csv` re-pin, yeniden) · **GEÇTİ** · Çürüyen "önce KIRMIZIYDI / 189.0 → 210.0" cümlesi sessizce silinmemiş, defterde etiket satırının altına ve ayrı bir `⚠ CORRECTION` maddesine ÇÜRÜDÜĞÜ görünür kalacak şekilde yazılmış (yeniden yazılamayan `e8b7f19` gövdesi de adıyla kapsanmış); yeni metin tanığın gücünü dürüstçe indiriyor ("supports the DIRECTION … NOT evidence of the 'turned a red green' class … never gated this change"); hakem iki sondayı da KENDİ koşturdu — ÖNCE `52ae85c^` = `c3d4359` ayrı `-DCMAKE_BUILD_TYPE=Release` worktree'de derlendi, çıktı `GECE/log/V1-F.sloper-tanik.txt` A bölümüyle `diff` sonucu BAYT-ÖZDEŞ (`scye depth 204.4 / 215.0 / err -10.6 mm`, `[PASS]`, `all sloper checks pass`, exit 0), SONRA bugünkü `engine/build/sloper_check` (Release, cache doğrulandı) `210.0 / 215.0 / err -5.0 mm`, `[PASS]`, exit 0 — yani hareket yeşilden daha-yeşile ve defter artık tam olarak bunu söylüyor; `05156a1` yalnız defter+log'a dokunmuş (`git diff --name-only 05156a1^ 05156a1` iki dosya; `engine/golden-reference.csv`, `engine/src`, `engine/tests`, `recipes`, `web`, `contract`, `scripts` diff'leri BOŞ), ve kalan tek eksik (Damla'nın açık onayı) defterde gizlenmeden ilan edilmiş (başlık `DAMLA ONAYI BEKLIYOR, K-V1A` + `APPROVAL STATUS` maddesi). · `GECE/log/V1-F.sloper-tanik.txt` · `engine/GOLDEN-PIN.md:11-18,58-84,89-92`
- V2 · hakem (4.4) · **GEÇTİ** · Beş soru da hakemin kendi koşusuyla cevaplandı: (1) çıktı testi geçmek için şekillendirilmemiş — düzeltme okuyucu seviyesinde ve GENEL (`enumIntField`/`intField` artık `v.as<int>()` yerine double okuyup tam-sayı değilse `vocabError` ile ADIYLA reddediyor, 27 int eksenin hepsinde, sınanan değerlere özel dal yok; `bodyField` eksik/pozitif-olmayan ölçüyü reddediyor; `bindings.cpp` diff'inde silinen satırların TAMAMI gevşeme değil sıkılaşma, `bodice.cpp`'nin tek eklemesi 0/0 NaN'ına aynı dosyanın zaten taşıdığı `1e-6` korumasını getirmek), üstelik faz kendi aleyhine rapor basıyor (`?v` bump'ı geri alındı ve kusur açık bırakıldı, `engine/dist` damgasız/gitignore'da diye kartın kendisi yazıyor); (2) üç yeni test boş DEĞİL, faz öncesi kodda KIRMIZI düştüğü loglarla duruyor — `vocab_source_check` `ffcd512`'de 11 FAIL/exit 1, `vocab_reference_check` eksik-referanslı tabanda ve taban dosyası yokken exit 1, `wasm_spec_honesty_check` faz-öncesi bayta (`/tmp/v2c/stitchu-engine.PRE.js`) karşı 145 FAIL/exit 1, ve hakem üçünü de bugün HEAD'de (`d167ef1`) YEŞİL koşturdu (`310 assertions passed, 0 FAILED`); (3) kırmızı AD kümesi BÜYÜMEDİ — hakem `cmake --build` + `ctest`'i kendi koşturdu (371.61 sn, 108 koşan/109 tanımlı) ve tam olarak devralınan dördü çıktı (`style_check` · `sizechart_source_check` · `contract_check` · `figure_check`), iki logun ad kümesi farkı sıfır (yalnız test NUMARALARI 85→86 / 90→91 kaydı, RULES 9 adla ilgilenir); (4) taban `e2f7aba`'da yenilendi ve gerçek bir onarımı mühürlüyor, kırmızıyı susturmuyor — tek oynayan anahtar `sleeveCap` 144→146, commit gövdesi iki satırı dosya+satır numarasıyla gösteriyor (`bindings.cpp:125` ve `:131`, ikisi de YORUM), `engine/vocab.json` aralık boyunca bayt-aynı (37 eksen/132 değer), yeşile gitmenin öteki yolu ölçülmüş kusur örneğini SİLMEK olurdu ve taban dosyası a6b473a'nın 10349'unu da içeride tutuyor; (5) hiçbir tolerans/eşik gevşemedi — `engine/CMakeLists.txt` diff'i saf EKLEME (tek bir `-` satırı yok, üç `add_test`), `engine/tests/` altında eski hiçbir kapı dosyasına dokunulmadı, kapıların kendi toleransı ZERO BYTES ve tek yeni sayı yeni bir dejenere-korumadır. · `RULES.md` · `engine/tests/vocab_source_check.sh` · `engine/tests/vocab_reference_check.sh` · `engine/tests/vocab-reference-baseline.json` · `engine/tests/wasm_spec_honesty_check.mjs` · `engine/tools/gen-vision-vocab.mjs` · `vision-student/vocab.py` · `engine/wasm/bindings.cpp:100-220,295-340` · `engine/src/bodice.cpp:1481-1495` · `engine/build-wasm.sh` · `engine/CMakeLists.txt:483,813,824` · `contract/vocab-resolution-v1.json` · `GECE/V2-A.md` · `GECE/V2-B.md` · `GECE/V2-C.md` · `GECE/V2-D.md` · `GECE/log/V2.ctest.before.txt` · `GECE/log/V2-SEF.ctest.final.txt` · `GECE/log/V2-B.bostest.source.txt` · `GECE/log/V2-B.bostest.ratchet.txt` · `GECE/log/V2-B.mutasyon.txt` · `GECE/log/V2-C.bostest.txt` · `GECE/log/V2-C.mutasyon.txt` · `GECE/log/V2-D.mutasyon.txt` · `GECE/log/V2-SEF.ctest.kanit.txt` · hakemin kendi koşusu (`ctest` 371.61 sn · `vocab_source_check` · `vocab_reference_check` · `node wasm_spec_honesty_check.mjs` hem `engine/dist/stitchu-engine.js` hem `web/vendor/stitchu-engine.js` üstünde)
- V3 · hakem (flat ↔ kalıp tek kaynak) · **GEÇTİ** · Yedi soru da hakemin kendi koşusuyla cevaplandı: (1) çıktı testi geçmek için şekillendirilmemiş — faz kendi kapısını KIRMIZI bırakıp raporluyor (`body_length` −3.7979%, belde 20.5602° C1 kırığı), üstelik kırığı kapatan yamayı ÖLÇÜP GERİ ALDI çünkü bel halkasını +36.1166mm şişirip dört kapıyı kırmızıya döndürüyordu (`GECE/log/V3-D.waistblend.rejected.txt`); (2) yeni testler BOŞ DEĞİL ve kanıt DERLEME HATASI DEĞİL — faz-öncesi hattın (`engine/tools/render-garment-flat.mjs`) ürettiği artefakt yeni aletlerle yargılandı, altı ölçünün altısı da %1.5'i aştı (−14.6…+57.6%) ve dört artefakt sınıfının dördü de ateşledi (72 öz-kesişim, 89 C1, 2 dejenere), mutasyon kanıtı da üç kanadı kırıp geri alınca yeşile döndürdü; (3) kırmızı AD kümesi: devralınan dördü (`style_check` · `sizechart_source_check` · `contract_check` · `figure_check`) AYNEN duruyor, hiçbir test silinmedi, faz-öncesi 109 ada karşı sonrası 111 ad ve fark tam olarak fazın KENDİ iki yeni kapısı — ikisi de bugün HEAD'de kırmızı, ikisi de kök teşhisiyle raporlu, hakem ikisini de kendi koşturdu ve committenmiş loglarla BİREBİR aynı sayıyı aldı; ⚠ CORRECTION: `GECE/V3-D.md`'nin "sıfır ad eklendi" cümlesi kelimesi kelimesine yanlıştır (iki ad eklendi, ikisi de kırmızı) — gizleme değil, taban kaydırmasıdır, ama düzeltilerek kayda geçiyor; (4) tek taban yenilemesi `d6cbb87` (vocab ratchet 10418→10438) ve gerçek onarımı mühürlüyor: KOD tarafındaki kapalı-enum referansları ÖNCE `7a27a9c` ile −7 düşürüldü (`GarmentSurf::ringNames()` tek otorite), kalan +20'nin 18'i YORUM METNİ, gerekçesi hem commit gövdesinde hem `vocab-reference-baseline.json._yasa`'da dosya+anahtar bazında satır satır yazılı, `engine/vocab.json` `9487091..HEAD` aralığında BAYT-AYNI (hakem `git diff` ile doğruladı, 0 satır); mühürlenen tek gerçek kusur `levelHeight(body,"waist"/"hip")` çift okuması ve o da "KALAN İŞ" diye açık yazılmış; (5) hiçbir tolerans/eşik gevşemedi — `TOL_PCT=1.5`, `ANGLE_TOL_DEG=1.0`, `DEGEN_LEN_MM=1e-9`, `kSampleStepMM=4.0`, `kFitTolMM=0.15`, `kArcStepMM=0.05` hepsi doğdukları commit'teki değerinde (`git log -p` ile tarandı, tek bir gevşetme diff'i yok), fazın eklediği tek yeni sayı `UNMEASURED_RATCHET=3` ve o bir SIKILAŞTIRMADIR (doğuşta hiç yoktu), gerekçesi test başlığında + commit gövdesinde; (6) İKİ HAT TEK NESNEDEN BESLENİYOR, düzeltme katsayısı YOK — `engine/tools/shell-flat.cpp:148` ve `engine/src/surfacepattern.cpp:1297` AYNI `buildGarmentSurf(body, opt)`'u çağırıyor, iki araç da `kStatureMM=1680 / kCapMM=60 / SheathOptions{}` ile aynı gövdeyi kuruyor, ikinci bir kabuk/gövde sınıfı YAZILMAMIŞ, `calib|correction|fudge|factor|magic|adjust` taraması kaynakta tek bir sabit çarpan/ofset getirmedi (yalnız "yapılmadı" diyen yorumlar) — ve yeşilin ortak kaynaktan geldiğinin asıl kanıtı şudur: kıyaslanabilen iki ölçü 0.1094mm ve 0.1494mm'ye kadar tutarken üçüncüsü 28.7714mm SAPIYOR ve kırmızı bırakılıyor; bir katsayı olsaydı üçü birden tutardı; ⚠ altı ölçünün ÜÇÜ kalıp tarafında `null` (strapless = G5 yok), yani kapı bugün ÜÇ sayı kıyaslıyor, ikisi çevre biri boy; (7) artefakt sayımı KIRPMAYLA/SMOOTHING'le/çözünürlük düşürmeyle GİZLENMEMİŞ — sıfır uzunluklu segment atılmıyor SAYILIYOR, örnekleme 4.0mm ile motorun kendi 8mm mesh'inden İNCE (kabalaştırma değil), 20.5602°'lik gerçek köşe ölçek-değişmez olduğu için hayatta kalıyor ve kapıyı kırmızı tutuyor, çakışık-nokta çökertmesi yalnız SINIF 1/3 zincirinde ve tanımsız teğeti tanımlı kıldığı için kırığı GÖRÜNÜR yapıyor (dejenere sayımı ham zincirde ayrıca yapılıyor); tek filtre sınıf 1'in "her iki komşu dönüş de >1°" şartı, ham sayı (246) yine de basılıyor. · **AÇIK KALANLAR (hakem):** iki kapı HEAD'de KIRMIZI (`flat_pattern_agree_check` 1 ihlal · `flat_artifact_census` 1 ihlal) · `body_length`'in 28.77mm'si omuz-halkası↔strapless-üst-kenar farkına AYRIŞTIRILMADI, DOĞRULANMADI · sınıf 1'in ham işaret değişimi 246 (189 noktalı zincirde) teşhis edilmedi, V3-C'nin 242'siyle çelişkisi açıklanmadı · yalnız EU38 ölçüldü, diğer yedi bedene BAKILMADI · arka orta hat yayı (kalıp tarafı 772.2352mm) hiçbir kapıya bağlı değil · kanat (a)'nın boş-test kanıtı gerçek kapıyla değil elle yazılmış `/tmp/v3c-vacuous.mjs` vekiliyle koşturuldu (hüküm değişmez: eski hattın 699.6mm'lik beli kalıbın 724.89'una karşı da %-3.5 kırmızıdır) · `GarmentSurf`'ün gerçek giysiyi doğru tarif ettiği (Damla'nın gözü) ÖLÇÜLMEDİ. · `RULES.md:9` · `engine/src/shellprojection.hpp` · `engine/src/shellprojection.cpp` · `engine/src/surfacepattern.hpp:32-139,628` · `engine/src/surfacepattern.cpp:1237-1297` · `engine/tools/shell-flat.cpp:144-153` · `engine/tools/pattern-measure.mjs` · `engine/tests/flat_pattern_agree_check.mjs` · `engine/tests/flat_artifact_census.mjs` · `engine/tests/vocab-reference-baseline.json` · `GECE/V3-A.md` · `GECE/V3-B.md` · `GECE/V3-C.md` · `GECE/V3-D.md` · `GECE/log/V3.ctest.before.txt` · `GECE/log/V3-D.ctest.txt` · `GECE/log/V3-C.vacuous.txt` · `GECE/log/V3-C.mutation.txt` · `GECE/log/V3-D.waistblend.rejected.txt` · `GECE/log/V3-D.wasm.txt` · hakemin kendi koşusu (`node flat_pattern_agree_check.mjs` · `node flat_artifact_census.mjs` · `git show 495d58a` · `git log -1 d6cbb87` · `git diff 9487091 HEAD -- engine/vocab.json` · eşik `git log -p` taraması · ctest ad-kümesi `comm` diff'i)
