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
