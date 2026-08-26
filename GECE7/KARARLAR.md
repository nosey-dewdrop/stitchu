# GECE7 — KARARLAR (hakem defteri)

§3.4: koşuda karar gerektiren her nokta hakemindir, zevk kararları dahil.
Her kaydın dayanağı **bir sayı** ya da **yayınlanmış bir kaynak** olacak.
Dayanak yoksa **en kısıtlayıcı seçenek** seçilir ve öyle yazılır.

---

## K1 — F-İNDİR hükmü: KALDI (2026-08-26)

**Karar:** Faz kapanmadı. `F-INDIR-yesil` etiketi **atılmadı**.

**Dayanak (sayı):** hakemin kendi koşusu
`ctest --test-dir engine/build --output-on-failure` → **`7 tests failed out of 118`**.
Kart 6 diyor. Yedincisi `vocab_reference_check`, miras listesinde yok, yani **yeni kırmızı**.
Kök sebep ölçüldü: kapının kendi kapsamında `garment` tam-kelime sayısı
ata `34586c8`'de **1186** (= taban), `HEAD`'de **1188**; +2 satırın üçü de
F-İNDİR'in kendi kodundan (`web/js/download.js`, `web/js/create.js`).
Koşunun kuralı: yeni kırmızı varsa faz kapanmaz.

**Neden GERİ AL değil:** F-İNDİR'in işi ölçülerek sağlam bulundu (kapı iki bağımsız
mutasyonda kırmızı yandı, DXF `ezdxf` ile açıldı, kalibrasyon karesi 29.9999 mm).
Geri almak kanıtlanmış bir kazanımı silerdi. Gerekçe: `GECE7/HAKEM-F-INDIR.md`.

---

## K2 — `vocab_reference_check` tabanı YENİDEN KESİLMEYECEK

**Karar:** F-İNDİR'in doğurduğu +2, **tabanı 1188'e taşıyarak değil, sayıyı
düşürerek** kapatılacak. Hedef: SCOPE içinde `garment` ≤ **1186**.

**Dayanak (kaynak):** kapının kendi yasası — `vocab_reference_check.sh` başlığı,
cırcırın PHPStan/Android-lint sınıfı olduğunu ve **yalnız düşüşün** kabul
edildiğini yazıyor; taban ancak ayrı, bilinçli bir commit'le kesilir. Ayrıca
§3.8 md.4: kapı gevşetmek faz ajanının yetkisi değil. V2 yönü zaten
**BREADTH → DEPTH**: menü büyümez, küçülür.

**Alternatif reddedildi:** "kapsam `web/js`'i saymasın" — bu kapının görüş alanını
daraltmaktır ve tam da `landing_truth_check`'te tartışılan hamlenin tekrarı olurdu.
Dayanak yok, **en kısıtlayıcı seçenek seçildi**: kapsam korunur, sayı düşer.

---

## K3 — DURUM.md'nin test sayma yöntemi düzeltildi

**Karar:** Koşunun resmi test sayısı bundan böyle **`ctest -N`'in listelediği** ve
**koşan** sayıdır; `grep -c add_test` kullanılmaz.

**Dayanak (sayı):** `grep -c add_test engine/CMakeLists.txt` HEAD'de **120** veriyor,
`ctest -N` **119**. Fark, satır 906'daki bir **yorumun** içinde geçen `add_test(NAME …)`.
DURUM.md'nin "119 test"i bu şişmiş sayıydı ve ortada olmayan bir "test kayboldu"
şüphesi doğurdu. Doğrusu: ata ağaç 118 listeli / **117 koşan** (= 111 yeşil + 6 kırmızı,
DURUM'un kendi sayısıyla birebir), HEAD 119 listeli / **118 koşan**.
`h10_gate_check` `DISABLED`, sayılmaz. F-İNDİR bir test **ekledi**, silmedi
(`git show ee1414c -- engine/CMakeLists.txt | grep "^-"` → sıfır silinen satır).

---

## K4 — Kartlar sapma sorusuna ÖLÇÜLENİ yazar, fazlasını değil

**Karar:** `GECE7/F-INDIR.md`'nin sapma sorusuna verdiği **"Evet"** düzeltilecek:
*kalıp iniyor, flat inmiyor.* Bundan sonra her faz kartının sapma sorusu cevabı,
kapının ölçtüğü şeye bire bir bağlanacak.

**Dayanak (sayı):** `web/js/download.js`'in dışa açtığı 10 fonksiyonun tamamı
kalıp (parça) yazıcısı: `patternSVG · patternA4Pdf · patternA0Pdf · patternDXF`
ve `save*` sarmalayıcıları. Flat / teknik çizim üreten **sıfır** dışa açık
fonksiyon var; `grep -i flat web/js/download.js` yalnız bir yorum satırı buluyor.
Flat hâlâ yalnız ekranda (`render.js`).

**Not:** Bu tek başına fazı düşürmedi — F-İNDİR **sapmadı**, gerçekten dosya
indirdi ve altyapıda kalmadı. Düşen, kartın cümlesidir.

---

## K5 — H10a/H10b ayrımı F-İNDİR'den istenmedi, F0'a da yüklenmiyor

**Karar:** Ayrıştırma, çıkarım hattına dokunan ilk faza (F2, §1F fotoğraf havuzu
işiyle birlikte) bırakıldı. F-İNDİR bu yüzden kalmadı.

**Dayanak (kaynak + sayı):** Damla'nın 26 Ağu düzeltmesi cırcırı **yalnız H10b'ye**
bağlıyor; H10a tek başına faz kapatmaz. Ayrıştırma `hedef_kosu.mjs`'in H10
tanımını değiştirmek demek (24 alan için bir hüküm tablosu) ve §3.8 md.4 gereği
bu faz ajanının yetkisi değil. Ölçülen gerçek: F-İNDİR çıkarım hattına **tek satır**
dokunmadı (`ctest -R hedef_kosu` yeşil, H1–H11 taban değerinde), yani
ayrıştırılacak bir **değişim** yok. Taban `%58.3 (ayrışmamış)` olarak duruyor.

---

## K6 — `web/lib/pdf-core.js` yerleşimi KABUL, ama kapsam sorusu F0'da yargılanacak

**Karar:** Dosyanın `web/js/` yerine `web/lib/`'e konması kabul edildi; geri
alınması istenmiyor. Ancak `landing_truth_check`'in `js/` ile sınırlı tarama
kapsamının doğru sınır olup olmadığı **açık bir soru** olarak F0'a taşınıyor.

**Dayanak (sayı + kaynak):** Kapının eşiğine ve tabanına **dokunulmamış** —
`git show ee1414c --stat -- engine/tests/landing_truth_check.mjs engine/tests/landing-truth-baseline.json`
boş dönüyor, taban hâlâ `"taban": 937`, kapı bugün yeşil. Yani §3.8 md.4 ihlali yok:
kapı gevşetilmedi, sebep kaldırıldı. `web/js/` gerçekten **sayfa betiği** ad alanı
(`create.js`, `studio.js`, `sheet.js`), `pdf-core` ise node üreticilerinin de
import ettiği ortak yazıcı — yerleşim gerekçeli ve dosya başlığında **açıkça** yazılı,
gizlenmiyor. Yine de bir kapının görüş alanının dosya taşıyarak daralabilmesi
başlı başına bir bulgudur; kapsamı **hakem** yargılar, faz ajanı değil.

---

## K7 — Kalemi kapının SCOPE'u dışına taşımak, YEŞİLİ taşımaya dayandırmadığı sürece ihlal değil

**Karar:** `engine/tools/render-garment-flat.mjs` → `web/lib/flat-core.js` taşıması
**kabul.** §3.8 md.4 ihlali sayılmadı. Ama kural bundan sonra şudur ve F0 kartına
yazıldı: **bir kapıyı dosya taşıyarak yeşile çeviren faz, taşıma olmadan da yeşil
olduğunu ÖLÇÜP karta yazmak zorundadır.** Ölçemiyorsa taşıma bir kaçamaktır.

**Dayanak (sayı):** Hakem −49'u dosya dosya ayrıştırdı. Taşımanın payı **−14**
(`web/lib/flat-core.js` bugün tam 14 `garment` satırı taşıyor, SCOPE dışında);
asıl düşüş **−41**, `create.js`'te kapalı enumun sökülmesinden (doğrudan enum
karşılaştırması **44 → 4**). Taşıma olmasaydı sayı **1151** olurdu — **yine
≤ 1186, yine yeşil.** Kapının yeşili taşımaya DAYANMIYOR. Kapı betiği ve tabanı
`34586c8`'e göre **bayt bayt aynı** (`git diff --stat` boş çıktı). Ayrıca taşımanın
teknik zorunluluğu ölçüldü: Pages tek kök yayınlıyor (`pages.yml`, `path: web`) ve
eski kalem modül yüklenirken **beş `readFileSync`** çağırıyordu — tarayıcıda
çalışamayan kalem tarayıcıdan indirilemez.

---

## K8 — F0 yeniden yazıldı: yeni dosya türü değil, İNEN DOSYANIN DÜRÜSTLÜĞÜ

**Karar:** Sıradaki faz `GECE7/F0.md`. Hedef değişmedi (§3.7): fotoğraf + prompt →
kalıp + flat. F0 yeni bir çıktı eklemez; indirilen dosyaya **köken etiketi**
(`gorulen` / `cikarildi` / `uydurma`) koyar ve bunu dosyanın **içinde** görünür
yapar. Kapı: `indir_check`'e 10. bölüm KÖKEN, mutasyonla kırmızı yanabilir olacak.

**Dayanak (üç sayı, hakemin kendi koşusu):** `H10 = %58.3` → 120 alanın **70'i**
fotoğraftan değil default'tan geldi. `H3 = 4` → dört alan ilan edilmemiş uydurma.
Ve sevk edilen indirme yolunda bunu söyleyen **0 satır** var
(`grep -rn "cikarildi\|inferred\|defaulted\|çıkarıldı" web/js/create.js web/js/download.js`
→ 0). Yani kullanıcı bugün eve götürdüğü şeyin **%58.3'ünün** kendi fotoğrafında
hiç görülmediğini hiçbir yüzeyden öğrenemiyor. §4C md.2 ve RULES invariant 1'in
konusu budur; F-İNDİR'in `create.dl.flatgap` emsali (motorun kesemediği kol
**adıyla** yazılıyor, ve bu kapıyla korunuyor) bu fazda alanların tamamına yayılır.

**Neden F0, F2 değil:** H10a/H10b ayrıştırması F2'de kalıyor (K5 değişmedi).
F0 ayrıştırmayı YAPMAZ, ama koyduğu etiket F2'nin tablosunun ham maddesidir —
bu yüzden şema `cikarildi` ileride ikiye bölünebilecek biçimde seçilecek.

---

## K9 — H3'ün tanımı GEVŞETİLMEYECEK; H3 = 4 olarak duruyor

**Karar:** F0 ajanı sordu: ilan kanalı kurulduğuna göre H3'ün dört uydurma
alanı düşürülsün mü? **HAYIR.** `engine/tests/hedef_kosu.mjs` tek satır bile
değişmez. H3 = **4**, n=5 olarak kalır.

**Dayanak (sayı):** İlan kanalı `web/js/create.js` + `web/js/provenance.js`
hattına kuruldu ve orada **38 eksen** etiketli. Ama H3'ü sayan `hedef_kosu.mjs`
**ölçüm hattını** okuyor ve o hat köken kaydını hiç görmüyor — ajanın kendi
13. borç maddesi bunu doğru teşhis ediyor (*"aynı kararı İKİ AYRI YERDE
veriyor"*). Bir alanın *"ilan edildiği"* iddiası, o alanı sayan kapının
göremediği bir yerde ilan edilmişse **ölçülmemiş bir iddiadır** (§3.6 H3:
ilan edildiği **sürece** H3'e girmez).

Kapıyı, ölçmediği bir işi ödüllendirecek şekilde değiştirmek §3.8 md.4'ün
tarif ettiği gevşetmedir. H3, **ilan kanalı ölçüm hattına bağlandığında**
düşer ve **iyileşme o fazın (F2) hanesine yazılır**, F0'ınkine değil —
ajanın kendi önerisi buydu ve doğruydu.

---

## K10 — 🚨 `patterns_real/` İNTERNETE AÇIK: repo PUBLIC, telifli PDF'ler anonim indirilebiliyor

**Bulgu (F0'ın işi DEĞİL — hakem başka bir kontrol sırasında ölçtü):**

```
gh api repos/nosey-dewdrop/stitchu --jq '{visibility,private}'
  -> {"visibility":"public","private":false}
git ls-tree -r origin/main --name-only | grep -c '^patterns_real/'
  -> 41
curl -sI "https://raw.githubusercontent.com/nosey-dewdrop/stitchu/main/patterns_real/Locket%20Top/PDF's/A0.pdf"
  -> HTTP 200        (kimlik doğrulaması YOK)
```

**41 dosya**, içinde satın alınmış Buğra kalıplarının A0 / A4 / US Letter
PDF'leri ve talimat JPG'leri. `87fc9d5`'te eklenmişler (F0'dan çok önce);
`git diff --name-only F0-oncesi HEAD -- patterns_real/` → **0 dosya**, yani
**bu koşunun ürettiği bir ihlal değil.**

`CLAUDE.md`'nin *"repo private (`nosey-dewdrop/stitchu`, **doğrulandı**)"*
satırı **bugün YANLIŞ**, ve o satır bütün gizlilik yasasının dayanağıydı.

**Karar — hakem TEK TARAFLI DEĞİŞTİRMEDİ, sebebi ölçüldü:** repoyu private
yapmak akla ilk gelen düzeltme ama `.github/workflows/pages.yml:23`
(`branches: [main]`, `path: web`) canlı siteyi **bu repodan** yayınlıyor;
ücretsiz hesapta private repo Pages'i **kapatır**, yani "düzeltme" canlı siteyi
öldürür. Geçmişten kazımak (`filter-repo`) ise `CLAUDE.md`'de zaten
**Damla kararı** olarak mühürlü.

→ **Damla'ya BİLDİRİLDİ** (hakemin dönüş metni). Koşu durmadı (§3.4).
Kapatılana kadar `patterns_real/` altına **tek yeni dosya eklenmez**; çalışma
ağacındaki 3 takipsiz kalem (`BUGRA-DEFTER.md`, `geometry/`,
`bugra-geometry-2026-07-23.json`) **takipsiz kalır ve pushlanmaz.**

---

## K11 — `vocab_reference_check` tabanı F0'ı kurtarmak için de kesilmeyecek

**Karar:** F0'ın yedinci kırmızısı (`hemFlounce 26 → 27`) **tabanı yeniden
keserek kapatılmaz.** K2 yürürlükte kalır ve F0 ikinci tur kartına yasak
olarak yazıldı.

**Dayanak (sayı + kaynağın kendi metni):** Kapının FAIL çıktısı bir kaçış yolu
öneriyor (*"Bu gerçekten bir kapsam kararı ise: tabanı elle yeniden kes"*).
Ama ölçüldü: artış **kapsam kararından değil**, F0'ın `create.js:178`'e yazdığı
**tek bir dize sabitinden** geliyor — `grep -rIn -w hemFlounce` kapsam içinde
dosya dosya karşılaştırıldı, 16 dosyanın 15'i **bayt bayt aynı sayıda**, tek
fark `web/js/create.js` **2 → 3**. Sözlük büyümedi, **bir kelime iki kez
yazıldı.** Bunun için taban kesmek, kapının ölçtüğü şeyin ta kendisini
(*"kapalı bir enuma YENİ referans"*) kapının kör noktasına taşımaktır =
§3.8 md.4.

**Kural, sonraki her faz için:** bir kapıyı yeşile döndürmenin en ucuz yolu
kapının tabanını oynatmaksa, o faz **durur ve hakeme gelir**. Hakem tabanı
yalnız *kapının kendisi yanlış ölçüyorsa* değiştirir — *faz sıkıştığı için*
asla.

---

## K12 — `vocab_reference_check` düz metni sayar; bu bir ihlal değil, bir AD YANLIŞLIĞIDIR

**Karar:** F0 ikinci turun, açıklama yorumunu eksen adını anmadan yeniden
yazması **§3.8 ihlali sayılmadı**; ama kapının kapsamı bir **borç** olarak
F2'ye devredildi (`GECE7/F2.md` İŞ 5).

**Dayanak — hakemin kendi mutasyonu (H2-E) ve kapının kendi metni.**
`git archive HEAD` ağacına **hiçbir kod değişikliği olmadan** tek bir yorum
satırı eklendi (`// NOTE: hemFlounce is an axis. See hemFlounce above.`) →
`FAIL ARTTI eksen ADI hemFlounce 26 -> 27`. Yani kapı yorumu çağrıdan
ayırmıyor, ve **satır** sayıyor (aynı satırda iki anma = +1).

Üç ölçüm ihlal olmadığını gösteriyor:
1. Kapının kendi kaynağı bunu **ilan ediyor**: `vocab_reference_check.sh:194`
   *"BILINEN GURULTU, **bilerek onarilmadi** … degistirmek bu dosyadaki her
   sayiyi tek mevcut olcumle kiyaslanamaz kilardi."* Gizli bir kör nokta değil,
   yazılı bir tasarım kararı.
2. Kapıya **dokunulmadı**: `vocab_reference_check.sh` blob'u `F0-oncesi` ve
   `HEAD`'de aynı (`e1b55e8…`), taban blob'u aynı (`8c01610…`).
3. **Kaçılan şey bir kod bağı değil:** `hemFlounce`'un `create.js`'teki kod
   referansı `F0-oncesi`'nde 2, bugün 2. Kapalı enuma yeni çağrı girmedi.

**Kural:** bir kapıya dokunmadan yazıyı ona uydurmak meşrudur **ancak** kapının
ölçtüğü şey o yazıda değilse. Kapının adı ile işi ayrışıyorsa, faz onu **kartına
yazar** (bu ajan yazdı) ve hakem borç olarak devreder — sessizce geçmek yasak.

---

## K13 — `KOKEN_ALANLARI`'nın 38'den düşmesini hiçbir kapı tutmuyor

**Karar:** bu, F0 ikinci turun hükmünü değiştirmez (yol **kullanılmadı**, hakem
saydı ve **38** çıktı), ama **F2'nin zorunlu işidir** (`GECE7/F2.md` İŞ 4).

**Dayanak — hakemin H2-A mutasyonu.** `web/js/create.js:161`'den
`hemFlounce: 'none'` silindi → `KOKEN_ALANLARI` **38 → 37** ve
`node engine/tests/indir_check.mjs` → **EXIT 0**. §10'un 24 kaleminin hepsi,
§10-(i) dahil, `ok` dedi. Sebep ölçülü: §10 kalemleri **10 eksenlik referans
spec** üstünde koşuyor, sevk edilen **38** eksen üstünde değil (F0'ın 14. borcu
— bugün somut bir kaçış yolu olduğu ölçüldü, artık teorik değil).

**Kural:** bir faz "sayı düşmedi" diye kartına yazıyorsa, o sayıyı **düşüren
mutasyonun kırmızı yandığını** da yazmak zorundadır. Yazamıyorsa, sayı bir
kapı değil bir gözlemdir.

---

## K14 — Hakemin cevap anahtarı `labels-hakem-BOS.json`'a DEĞİL, ayrı bir dosyaya yazıldı

**Karar:** Göz etiketi **`vision/eval/labels-hakem.json`** dosyasına yazıldı.
`vision/eval/labels-hakem-BOS.json` **boş bırakıldı** ve boş kalacak.

**Dayanak (kapının kendi kodu):** `engine/tests/py/test_kaynak_kunye.py::
test_hakem_sablonu_bos_gelir` şablonda **tek bir dolu hücrede** kırmızı yanıyor
(hakem koşturdu, mutasyon H-M5 → `1 failed, 22 passed`). O kapı bir cümleyi değil
bir olguyu koruyor: *faz ajanı kendi işini kendi notlamadı.* Şablonu doldurmak o
kanıtı **siler** — dolu bir dosyaya bakan kimse onu kimin doldurduğunu ayırt edemez.
İki dosya iki ayrı şey söylüyor: `-BOS` teslimatın kanıtı, `labels-hakem.json`
cevabın kendisi.

**`dataset/hedef-19/etiket/` neden seçilmedi:** `dataset/` **gitignore'da**
(`CLAUDE.md` gizlilik yasası). Oraya yazılan bir cevap anahtarı temiz bir
checkout'ta **yok**tur, yani hiçbir kapı onu okuyamaz ve hiçbir hakem onu
doğrulayamaz. Emsal aynı koşuda kurulu: F2 künyeleri de aynı sebeple
`vision/eval/credits.json`'a (takipli) yazıp `dataset/…/KAYNAK.md`'yi ondan
üretti. Fotoğrafların kendisi zaten `vision/eval/photos/` altında takipli ve
lisansları yayınlanabilir (19'unun 19'u Commons, künyeli).

---

## K15 — F2'nin yedinci kırmızısına "GERİ AL" UYGULANMADI

**Karar:** Hüküm **KALDI**. `GECE7/F2.md`'nin *"Üçüncüsü GERİ AL'dır"* cümlesi
bu turda **uygulanmadı** ve bu, kuralın sessizce yenmesi değil, gerekçeli bir
istisnadır.

**Dayanak (sayılar):**
1. Yedinci kırmızının nedeni **bir satır**: `vision/eval/h10-eksenleri.json:36`,
   `"sleeveStyle": "sleeveStyle"`. Dosya **üretilmiştir**
   (`node engine/tests/hedef_kosu.mjs --eksenler`), elle yazılmamıştır, ve çekirdek
   işin parçası değildir. Hakem iki uçtan ölçtü: `F2-oncesi`'nde kapı **EXIT 0**,
   `HEAD`'de **1 FAIL**; kol alanı **8 → 9** ve dokuzuncu "değer" o satır.
2. Geri almanın bedeli **2474 satır** ve içinde ölçülerek sağlam bulunmuş üç ürün
   var: künyesi sha256 ile kanıtlı **19'luk havuz**; **K13'ün kapanışı** (hakemin
   H-M1 mutasyonu **EXIT 8**, F0'da **EXIT 0** ile kaçıyordu); etiketin doğruluğunu
   koruyan **§10-(j)** (H-M4 → 4 FAIL).
3. Ayrışma mekanizmasının **yanlış değil verisiz** olduğu ölçüldü: hakemin göz
   etiketi aynı 5 fotoğrafa uygulandığında **H10a 21 + H10b 48 + H10x 1 = 70**,
   yani kartın DEĞİŞMEZLER şartı ilk kez tutuyor.

**Emsal:** K1 (F-İNDİR) ve F0 1. tur da aynı sınıftaydı ve ikisi de **KALDI**
aldı; ölçüt her ikisinde de *"fazın ürünü ölçülerek sağlam mı"* idi.

**Kural, bundan sonrası için:** GERİ AL, kartın ürününün ÖLÇÜLEREK çürük çıktığı
hallere saklanır. Bir kapıyı yanlış bildirmek **KALDI**'dır ve ikinci turun tek
işi o kapıyı kapatmaktır. Dördüncü kez olursa bu kayıt yeniden yargılanır.

---

## K16 — Yedek 5 fotoğraf GİZLENMEDİ, bir KURALLA korunuyor

**Karar:** Hakemin holdout seti (`10` `14` `15` `34` `36`) `contract/hedef-kosu-taban.json`
`_olcum_seti.yedek_5` altında **açıkça** yazıldı. Faz ajanı bu beşi koşturamaz,
ayarlayamaz, etiketine bakamaz; **yalnız hakem koşturur.**

**Dayanak (ölçülebilir gerçek):** Tek bir repoda gerçek gizlilik yoktur — faz ajanı
`vision/eval/photos/` altındaki 19 dosyayı hash'leyip herhangi bir "gizli" listeyle
eşleyebilir, ayrıca hedef 10'un tümü zaten yazılı olduğu için kalan 9 sayılabilir.
Gizli görünen bir liste, **korunuyor sanılan** bir liste demektir ve yanlış güven
en kötü koruma biçimidir. Yazılı kural ölçülebilir: hedef seti ile yedek set
arasında açılan isabet farkı **ayar (overfit) kanıtıdır ve kırmızıdır.**

**Set seçimi de bir hakem kararıdır (§3.8 md.2)** ve dayanağı sayıdır: hakemin
kendi görünürlük sayımıyla (görünen eksen / 24) hedef 10 aralığı **8–20**, yedek 5
aralığı **3–20**; yedek, hedefin aralığını aynalıyor, iki uçta da onu aşıyor.

---

## K17 — `flat_expresses_spec_check` ÖLÇÜM VERİSİNİ ÜRÜN SPEC'İ SAYIYOR

**Karar:** Kapı **gevşetilmeyecek**, kapsamı bu turda **değiştirilmeyecek**;
borç olarak devrediyor ve F2 ikinci turun zorunlu işi **kapıyı değil çarpışmayı**
kaldırmaktır.

**Dayanak (hakemin kendi ölçümü):** Kapı kol değer alanını beş kaynaktan topluyor;
birincisi `git ls-files '*.json'` ile **takipli her JSON** üstünde
`"sleeveStyle"\s*:\s*"([^"]*)"` sayıyor. `vision/eval/` **ölçüm verisidir**, ürün
spec'i değil, ama kapı ikisini ayırmıyor: `h10-eksenleri.json`'un kimlik eşlemesi
(`"sleeveStyle": "sleeveStyle"`) dokuzuncu bir kol "değeri" olarak alana girdi ve
`RATCHET sleeveStyle UNEXPRESSED 1/0` ile **TAVAN ASILDI**.

**Kapsamı daraltmak neden reddedildi:** *"`vision/` sayılmasın"* demek, kapının
görüş alanını bir fazı kurtarmak için daraltmaktır — K2 ve K11'de iki kez
reddedilen hamlenin aynısı, §3.8 md.4. **Dayanak yok, en kısıtlayıcı seçenek
seçildi:** kapsam korunur, çarpışma kaynağında kalkar (kimlik eşlemesi bir eksen
ADInı JSON **değeri** olarak yazmaz — anahtar listesi + `null` yeterlidir, kapıya
tek satır dokunulmadan).

---

## K18 — `104 - h10_gate_check` DISABLED: bu koşunun işi DEĞİL, ve H10 metriğiyle İLGİSİ YOK

**Karar:** Devre dışı bırakma **meşrudur ve yerinde kalır**. F2'ye hiçbir hane
yazılmaz. Yeniden açmak bu koşunun işi değildir; kuyrukta durur.

**Dayanak (git, tek tek ölçüldü):**
- `git log -S h10_gate_check -- engine/CMakeLists.txt` → iki commit. Doğuran
  `f52db5e` (**2026-08-17**), devre dışı bırakan **`52ae85c` (2026-08-23)**.
  GECE7 klasörü **2026-08-26**'da açıldı → **bu koşudan ÜÇ GÜN ÖNCE**. Hiçbir
  faz ajanı, hiçbir hakem dokunmadı. §3.8 md.4 ihlali yok.
- **Ad çakışması, konu çakışması değil.** Testin adındaki "h10" bu koşunun
  `H10_cikarildi_orani` metriği değil, **H1.0** = giyilebilirlik kabul kapısıdır
  (`docs/H1.0-KAPI.md`: kol oyuğu çevresi + grade, omuz dikişinin varlığı,
  omuz ön/arka dengesi, yakanın kapalı delik olması). Dosyanın kendi adı da
  bunu söylüyor: `tests/h10_gate_check_LEGACY.cpp`.
- **Gerekçe kapatıldığı yerde yazılı** (`engine/CMakeLists.txt:743-752`) ve bir
  ölçüme dayanıyor: kapı `SurfacePattern` hattını yargılıyordu, ama
  `surfacepattern` `engine/src`'den **sıfır kez** include ediliyor — yani sevk
  edilen giysiyi değil, hattın dışındaki bir hattı yargılıyordu. Yerine
  `garment_armhole_check` koşuyor ve bugün **yeşil**.
- Silinmedi, LEGACY olarak duruyor. **Kapı gizlenmedi, ilan edildi.**

**Kuyruğa yazılan:** F2 2. tur ajanı bunu kendi kartında bildirdi ve hiçbir
önceki kart anmamıştı. Bildirmesi **doğru davranıştı**; kök sebebi aramaması da
doğruydu (kart dışı).

---

## K19 — 🚨 CEVAP ANAHTARI KORUMASIZ: bir uyuşmazlığı `goremedim`'e taşımak H2'yi şişiriyor ve HİÇBİR KAPI YANMIYOR

**Bulgu — hakemin kendi mutasyonu HM8, kimse sormamıştı.**
`vision/eval/labels-hakem.json`'da `01`'in `shaping` yargısı `deger` bloğundan
silinip `goremedim` dizisine taşındı (tek satır, tersine çevrilebilir):

```
H2  %95.2 (40/42)  ->  %97.6 (40/41)
hedef_kosu EXIT 0 · pytest 23 passed · indir_check EXIT 0   — SIFIR KIRMIZI
```

Yani cevap anahtarını **gevşetmek bugün bedava**. §0B'nin reward-hacking
maddesinin tarif ettiği hamlenin, bu koşuda **yeni doğmuş** bir yüzeyi.

**Karar:** F2'ye hane YAZILMAZ — hakem `afc1ca2..HEAD`'i hücre hücre karşılaştırdı
(aşağıda, HAKEM-F2.md 2. tur §1) ve **0 uyuşmazlık** buldu: 143 enum + 33 `null`
+ 52 `goremedim` bayt bayt yerinde, `gorunurluk` bloğuna dokunulmamış. Kapı
**açık ama kullanılmamış**. Kapatmak kod yazmaktır ve kod faz ajanının işidir
(§3.7) → **F3'ün ZORUNLU işi** olarak karta yazıldı.

**En kısıtlayıcı ara önlem (hakem, bugün):** anahtarın `sha256`'sı ve hücre
sayımı `contract/hedef-kosu-taban.json` → `_cevap_anahtari_MUHRU` altına yazıldı.
Kapı yazılana kadar gevşetme en azından **iki sayının kıyasıyla** görülebilir.

---

## K20 — YEDEK 5 KOŞULDU: AYAR (overfit) YOK

**Karar:** K16'nın *"hedef ile yedek arasında açılan fark ayar kanıtıdır ve
kırmızıdır"* kuralı **tetiklenmedi.** F2 2. tur bu maddeden temiz çıkar.

**Dayanak (hakemin kendi koşusu, 5 VLM turu hakem ödedi):**

| | hedef 10 | **yedek 5** |
|---|---|---|
| H1 | 10/10 | **5/5** |
| H2 | %93.0 (66/71) | **%87.5 (28/32)** |
| H10b | %33.1 | **%28.6** |
| H10a | %29.7 | **%35.3** |

H2 farkı −5.5 puan. **Ayar değil, ve gerekçe dört sayı:**
1. **Ayarlanacak yüzey YOK.** `git diff afc1ca2..HEAD` ürün kodunda **sıfır
   dosya** değiştirdi: `create.js` · `vision-bridge.js` · `spec-diff.mjs` ·
   `render-garment-flat.mjs` · `vocab.gen.js` blob'ları iki uçta **birebir aynı**.
   Çıkarım hattına bu turda tek bayt girmedi.
2. Cevap anahtarını **ajan yazmadı**, hakem yazdı; ajan onu okuyan kodu yazdı.
3. Ayar tek yönlü olurdu; **H10b yedekte DAHA İYİ** (%28.6 < %33.1).
4. Yedeğin **4 hatasının 4'ü tek fotoğrafta** (`34-minidress-1960s`, 5/9).
   Fark bir setin zorluğudur, bir hattın ayarı değil.

**Ham VLM okumaları repoya YAZILMADI** — yedek set yedek kalsın diye. Bu blok
(`_yedek_5_HAKEM_KOSTURDU`) ölçümün kendisidir.

---

## K21 — TABAN TERFİ ETTİ: H2 insan anahtarına, H10b/H10e/H10x anahtarları AÇILDI, H10a AÇILMADI

**Karar (§3.8 md.1, tabana yalnız hakem dokunur):**

| | önce | sonra | dayanak |
|---|---|---|---|
| H2 | %92.2 (47/51) | **%95.2 (40/42)** | 92.2 artık **hiçbir kapının okumadığı** bir dosyanın (`labels.json`) sayısı = ölü. Bırakmak 3 puanlık bedava gevşeklik demekti. |
| H3 | 4 | **2** | Cırcır yalnız düşer. **F2'ye kazanım yazılmadı** (K9): düşüş kaynak değişiminin yan ürünü, ilan kanalı ölçüm hattına hâlâ bağlanmadı. |
| H10b | anahtar YOK | **%40.0, `yon: tavan`** | Artık gerçek ölçüm (21+48+1=70 hakemin kendi koşusunda tuttu). Anahtar yazıldığı **an** `hedef_kosu.mjs:453`'teki §0B tavanı işlemeye başlar. |
| H10e | anahtar YOK | **3, `yon: dusuk`** | Dayanağı artık sabit (insan beyanı); 1. turda değişmek üzereydi, o yüzden açılmamıştı. |
| H10x | anahtar YOK | **%0.8, `yon: dusuk`** | Anahtar sabit olduğu için H10x ancak hat 24 eksenin **dışına** alan bastığında yükselir = ölçüm körlüğü. |
| **H10a** | anahtar YOK | **YİNE YOK** | Şef emri + bir sayı: hakemin yedek-5 koşusunda H10a **%35.3**, hedef-10'da **%29.7** — kadrajla oynuyor ve **yükselmesi doğru davranıştır**. Cırcıra bağlamak ajanı alanları H10b'den H10a'ya kaçırmaya iter (§0B). |
| `_n` | 5 | **5** | Cırcır seti hâlâ tabanın ölçüldüğü beş fotoğraf. n=10 ve yedek-5 **ayrı, cırcırsız bloklarda**; mutlak sayaçlar (H3·H8·H10e) n ile büyür, karıştırmak sahte kötüleşme üretir. |

**Terfi ısırıyor mu — ölçüldü (HM9):** taban `H10e` elle 2'ye çekildi →
`CIRCIR KIRIK — H10e_etiket_hatasi: taban 2 -> şimdi 3`, **EXIT 1**; geri alınca
EXIT 0. Yeni anahtarlar sessiz süs değil.

---

## K23 — `flat_pattern_agree_check` ⇄ §2 ÇELİŞMİYOR. KAPI YENİDEN YAZILMADI, KIRMIZI GERÇEK.

**Soru (F3 ajanının kuyruğa yazdığı, kararı hakeme bıraktığı 🔴 kalem):**
`flat_pattern_agree_check` bir **EŞİTLİK** kapısıdır (%1.5 tolerans) ve §2
eşitliği açıkça reddediyor. Ajan "ya kapı §2'ye göre yeniden yazılır, ya §2 ona
göre" dedi. **Bu kırmızının kök sebebi altı fazdır aranmamıştı.**

**Hakem ölçtü. Ajanın öncülü YANLIŞ — çelişki YOK, ve bunu üç sayı söylüyor.**
Hepsi kapının **aynı koşusundan**, EU38:

| ölçü | flat mm | kalıp mm | fark % |
|---|---|---|---|
| `hem_circumference` | 1295.6000 | 1295.4506 | **%-0.0115** |
| `waist_circumference` | 725.0000 | 724.8907 | **%-0.0151** |
| `body_length` | 757.5584 | 728.7870 | **%-3.7979** ← tek ihlal |

§2'nin çelişki üretmesi için iki tarafın **farklı bedenler** olması gerekir.
Bugün değiller: `flatJSON`'un kendi ilan bloğu (`bedenlendirme`) manken
çizelgesini **`YAYIN BULUNAMADI`** diye basıyor, yani **ilan edilmiş dönüşüm
bugün ÖZDEŞLİKTİR** — ve özdeşlik altında **eşitlik doğru tahmindir.** Bel ve
etek ucunun **%0.015 ve %0.011** ile tutması bunun ölçümüdür: aynı kapı, aynı
koşu, aynı iki taraf. §2 bu kapıyı bugün ezmiyor.

**Yani `body_length`'in %-3.7979'u bir §2 artefaktı değil, GERÇEK bir ayrışma:**
- İki taraf da kendi metninde **aynı niceliği** ölçtüğünü yazıyor —
  `pattern-measure.mjs:169` *"arc along the centre-front line … a length ALONG
  the cloth, not a vertical height difference"*, `shellprojection.cpp`
  `centreLineArc(surf, shoulder.h, hemZ, front)`. Aynı nicelik.
- **28.7714mm** = motorun kendi sertifikalı düzleştirme bütçesinin **7.6 katı**
  (`flatten_check` strain **<%0.5**).
- Kapı zaten "iki farklı nicelik kıyaslanmaz" kanununu **biliyor ve uyguluyor**:
  `body_height_projected` tam bu gerekçeyle **kapı dışına alınmış**, üç
  `UNMEASURED` kaleminin gerekçesi de aynı cümle. Kapı gevşek değil, **eksik
  onarılmış bir geometriyi gösteriyor.**

**KARAR — kapı YENİDEN YAZILMADI. §3.8 md.1 yetkisi bilerek KULLANILMADI. İki dayanak:**
1. **Yayınlanmamış bir dönüşüme karşı kapı tanımlanmaz.** Kapının §2 biçimi
   ("eşitliği değil, ilan edilen dönüşümü doğrula") `bedenlendirme` bloğunu
   okumak zorundadır; o bloğun bugünkü değeri `YAYIN BULUNAMADI`. Bugün yazılsa
   kapı kendi konusunu uydurmuş olurdu (§3.10).
2. Kapı tanımını bugün değiştirmek, bu koşudaki **her kartın karşısında
   yargılandığı 6-kırmızı tabanını** oynatır. Bir hakem turunda taban oynatmak
   sonraki fazların kıyasını siler.

**TETİK — bu karar süresizce ertelenmez:** `flatJSON`'un manken çizelgesi
**yayınlandığı gün** (F4'ün işi) bu kapı **yeniden yazılmak ZORUNDADIR**, çünkü
o gün özdeşlik biter ve eşitlik yanlış tahmin olur. Yeniden yazan **hakemdir**,
ve önceki/sonraki sayıyı yan yana yazar. F4'ün kartına bu satırla girer.

**Kök sebep artık ADLI:** miras kırmızı `flat_pattern_agree_check` = merkez-ön
hattının kabuk üstündeki yayı (757.5584mm) ile açılmış panelde ölçülen yayı
(728.7870mm) arasında **28.7714mm** onarılmamış fark. Altı fazdır aranmayan şey
bulundu; **kapatılmadı**, çünkü kapatmak geometri işidir ve F3'ün kartında yoktu.

---

## K24 — TEK NESNE KAPISI SİLUETİ KAPSAMIYOR (hakemin HM-F2'si), ve F5'ten önce KAPSAYACAK

**Hakemin mutasyonu HM-F2, ajanın HİÇ DOKUNMADIĞI dosyada** (§3.8 md.3):
`engine/src/shellprojection.cpp` → `projectBack` **`projectFront`'un kopyası**
yapıldı (arka teknik çizim = ön teknik çizim, inandırıcı bir kopyala-yapıştır).

```
ikili gerçekten kımıldadı: 2ccf4bc7… -> 60ea1cde…   (bayat-ikili tuzağı elendi)
tek_nesne_check  EXIT 0   -> YEŞİL
düğüm            3f3869aaee8b56b1  -> DEĞİŞMEDİ
```

**Bulgu iki katmanlı:**
1. `nodeId()` **siluetı hash'lemiyor** — yalnız `surf.rings` + `topColXMM/ZMM`.
   İnen SVG'nin kökündeki `data-dugum` "bu flat bu nesneden çıktı" diyor ama
   **çizilen siluetı bağlamıyor.**
2. K3'ün **`arka` kolu ayırt edici değil**: yaka değişikliği siluetı zaten hiç
   oynatmadığı için (F3'ün kendi bulduğu körlük) o kol **0.0000'ı 0.0000 ile**
   kıyaslıyor, ve arka literally ön olsa bile 0.0000'ı 0.0000 ile kıyaslamaya
   devam ediyor.

**Ajan yalan söylemedi, ajanın 5 mutasyonunun 5'i de kendi yazdığı tek dosyadaydı**
(`engine/src/seamplan.cpp`) — sınırı bulmak §3.8 md.3'e göre **hakemin işiydi** ve
bulundu. Kapının **6 no'lu kart şartı** (yaka+20mm iki okumada da ölçülür ve
aynı düğümden türer) **gerçekten teslim edildi ve mutasyonla kanıtlandı**;
eksik olan, ajan kartının **düzyazı** cümlesi: *"flat'te değişip kalıpta
değişmeyen (ya da tersi) SIFIR alan"* — bu **tek alanda** (`ust_sinir`), **tek
spec değişikliği altında** ölçüldü; yayınlanan yedi siluet ölçüsü tek yönlülük
için **hiç sınanmadı**. Kartın tablosu doğru, cümlesi geniş.

**KARAR:** `tek_nesne_check` **F5'in İLK operatör alt-kartı kapanmadan ÖNCE**
bir **siluet kolu** kazanır ve **HM-F2'de kırmızı yanmak zorundadır.**
En kısıtlayıcı biçim, çünkü dayanağı ölçülmüş bir boşluktur:
`nodeId()` `projectFront`/`projectBack` çıktısını da karıştırır **ya da** kapı
arka siluetin ön siluetten ayrı olduğunu bir sayıyla gösterir. F5'in kartına
kapı satırı olarak yazıldı. **Bugün kırmızı sayısını değiştirmez** (kapı yeşil
kalır, kolu genişler) — bu yüzden şimdi zorunlu kılmak tabanı oynatmıyor.

---

## K25 — H1 KIMILDAMADI: SAPMA DEĞİL, ÇÜNKÜ H1 TAVANDA (aritmetik, mazeret değil)

§3.6 F3'ün hanesine **H1**'i yazıyor. Hakem kendi koşturdu:
**H1 = 5/5 (n=5) ve 10/10 (n=10)** — **iki `n`'de de tavan.** Doymuş bir sayı
iyileştirilemez; §3.6'nın hanesi F3 açıldığı gün zaten kapanmıştı.

**Önceden ilan edilmiş olması bu kez mazeret DEĞİL, kart dürüstlüğüdür — ve
ayırt eden şu:** ilanı **ajan değil, F3 kartını yazan HAKEM** yaptı (kart §İŞ 3,
"birinci sınıf havuzun 2/19'unu kapsıyor, hedef koşusunun sayıları bu fazda
kımıldamayacak"). Ajanın kendi kartında "ben ilan etmiştim" demesi mazeret
olurdu; önceki hakemin ilanı bir **tahmindir ve tuttu**.

**H6 istisnası kullanılmadı** (H6 önce de sonra da ÖLÇEMEDİM) — yani F3 kendine
tanınan tek gevşemeyi harcamadı. Cırcırın kalan on sayısının **hiçbiri
kötüleşmedi**, hakem kendi koşturdu.

---

## K26 — `KOSU-v7.md` COMMİTLENMEMİŞ 423 SATIR TAŞIYOR (hakem bildiriyor, F3'ün suçu değil)

`git diff --stat KOSU-v7.md` → **348 ekleme / 75 silme, çalışma ağacında.**
F3'ün diffinde **yok** (dosya `F3-oncesi..HEAD` arasında hiç değişmedi), yani
kirlilik F3'ten **önce** doğdu ve F3 kartı onu "bu koşunun kirliliği değil" diye
doğru bildirdi.

**Ama risk gerçek ve kimse yazmamış:** koşunun **anayasası** commitlenmemiş
duruyor. Her kartın *"§X'i oku"* satırı, HEAD'deki sürümü **değil** çalışma
ağacındaki sürümü işaret ediyor; bu 423 satır kaybolursa (`reset --hard`,
disk, yeni klon) her fazın okuma listesi sessizce başka bir metne bakar.
**En kısıtlayıcı karar: F5'in kartı bunu kapatmaz** (anayasayı hakem/şef
commitler, faz ajanı değil) **ama F5 ajanı `KOSU-v7.md`'ye TEK BAYT yazmaz** —
kirliliği büyütmek, sahibi belirsiz bir dosyayı daha da kurtarılamaz yapar.
Dayanak: §3.8 md.1'in ruhu (taban/kanun yalnız hakemin).

---

## K27 — F5'İN İLK OPERATÖRÜ: `rotate` (pens transferi). Alt-kart F5-A.

**Ajan operatör seçemez** (§3.4). Hakem seçti, dayanak **iki ölçüm**:

1. **Yüzey hattında bugün YALNIZ BİR sınıf var ve adı `top/dart/woven`**
   (F3'ün teslimi, `web/lib/flat-from-plan.js:131`). `rotate` **pens
   transferidir**, yani **canlı dikiş planına karşı kanıtlanabilecek tek
   operatör** odur. Diğer yedisi bugün ya kalemli eski hatta (`flat-core.js`)
   ya da havuzda karşılığı olmayan bir sınıfa karşı kanıtlanmak zorunda kalır —
   ki bu, F3'ün kurduğu tek nesneyi **kullanmayan** bir kanıttır.
2. **§4A `rotate`'i kendi tablosunda "klasik kalıpçılığın ANA işlemi" diye
   yazıyor** ve `rotate + slash-spread + merge` üçlüsünü kapalılığın şartı
   sayıyor. Üçlünün ilki, sınıfın adında zaten duran `dart`'tır.

Hedef uydurma değil, tanığı var: gerçek Buğra pensi **41.5° = develop-deficit
41.48°** (`flatten-research/16`).

**Ayrıca karara bağlandı — H8 İKİ SAYI OLARAK BASILIR.** Hakem
`hedef_kosu.mjs:350-351`'i okudu: bugünkü H8 = `Σ outOfVocab terim +
Σ sözlükte olmayan alan okuması` = **31 (n=5) / 61 (n=10)**. Bu bir **SÖZLÜK**
sayacıdır; §4A'nın istediği ise *"N gerçek kalıbın kaçı operatör programına
çevrilemedi"* — **başka bir niceliktir**. Bugünkü H8 **sözlüğü daraltarak**, tek
operatör yazmadan düşürülebilir = §0B reward-hacking. Şart: her alt-kart
**H8-sözlük** (cırcıra bağlı) ve **H8-ifade** (`expressability_check.mjs`,
paydası **adlı** kalıp listesi) sayılarını **ayrı satırda** basar, harmanlamaz.

**Ve H5 hanesi şarta bağlandı:** `hedef_kosu.mjs:254-255,348` kendi yorumunda
*"kalıpta yalnız `armhole`/`sleeve_cap` rolleri ilan edili"* diyor; bugün
**0 eşleşmeyen çift / 5 ölçülebilen çift** ve yeni fotoğrafların hiçbiri kollu
kalıp üretmedi. **Payda büyümeden 0→0 bir kazanım değildir** — H5 iyileştirme
hanesine yazılacaksa **ölçülebilen çift sayısı önce/sonra yan yana** yazılır.

**`expressability_check.mjs` DİSKTE YOK** — hakem ölçtü: `find` 0 dosya,
`engine/CMakeLists.txt` **0 eşleşme**. §4A onu F5'in kapısı sayıyor; **o betik
yazılmadan F5 kapanmaz.**

---

## K28 — K27'NİN 1. DAYANAĞI DÜZELTİLDİ; `rotate` SEÇİMİ **DEĞİŞMEDİ**

**Ölçüm (hakem, temiz ağaçtaki ikiliden):** sevk edilen `top/dart/woven` sınıfının
**sekiz panelinin sekizi de `pens: 0`.** `surfacepattern.cpp` kendi yorumunda
zaten yazıyor: *"the torso derives NO waist darts at all"* — bastırma **panel
dikişleriyle** taşınıyor.

**K27 md.1 şöyle diyordu:** *"`rotate` pens transferidir, yani canlı dikiş planına
karşı kanıtlanabilecek tek operatör odur... üçlünün ilki, sınıfın adında zaten
duran `dart`'tır."* **O son cümle DÜŞTÜ:** `dart` bugün bir **ad**, bir geometri
değil. Hakem bunu yumuşatmıyor.

**Ama karar değişmiyor, ve sebebi bir sayı:** hakemin mutasyonu **HM2**
(`kWaistToHipMM 205→215`, ajanın açmadığı dosya) `rotate-op`'un apeks derinliğini
**289.1484 → 289.1527mm** oynattı. Yani `rotate` **canlı `SeamPlan`'ın gerçek
`left_ftorso` panelini** kullanıyor: panel, apeks ve hedef kenarlar **gerçek**.
Düşen şey *"pens zaten orada"* varsayımıydı, *"canlı plana karşı kanıtlanabilir"*
değil. Transfer edilen pens bir **`op.suppress` fikstürüdür** ve kart bunu
**gizlemeden** öyle bildiriyor.

**Sonuç:** `rotate` **kanıtlı bir operatördür ama bugün ÜRÜNE DEĞMİYOR** — sevk
edilen giysinin taşıyacağı bir pensi yok, ve operatör `draftJSON`/web hattına bağlı
değil (borç md.37). **Bu bir F5-A kusuru değil, F5'in kalanının işidir**; alt-kart
kapatmayı vaat etmedi ve kapattığını iddia etmedi (§3.12).

⚠ **F5B'ye ve sonrasına bağlayıcı:** *"`rotate` çalışıyor"* cümlesi bundan sonra
**tek başına** kurulmaz; yanında **`op.suppress` fikstürüyle** ibaresi durur, ta ki
sevk edilen giysi kendi pensini üretene kadar.

---

## K29 — KARTIN "ÇEVRE KORUNUR" ŞARTI **YANLIŞTI**; KAPI TANIMI DÜZELTİLDİ

F5-A kartını yazan **hakemdi** ve şart yanlıştı. Ajan onu gevşetmedi, **kurmadı** ve
**hakeme getirdi** (§3.8 md.4) — bu turun en doğru davranışıdır ve emsal olarak
kaydedilir.

**Ölçüm:** eski pens iki bacağını (`Lold`) götürür, yenisi iki bacak (`Lnew`)
getirir; belde duran bir göğüs pensi kol oyuğundakinden **uzundur**
(289.1484 → 206.8872 / 123.8691 / 107.9265mm). **Çevre korunamaz, ve "korunur"
demek YANLIŞ BİR KAPI olurdu.** Yanlış bir kapı, kapısızlıktan kötüdür.

**Düzeltilen tanım (hakem, §3.8 md.1):** rijit hareketin koruduğu **üç** nicelik
kapıdır — **ALAN · PENS AÇISI · TRUE BACAKLAR** (üçü de <1e-9 ölçüldü). Çevre bir
**eşitlik** olarak değil bir **KİMLİK** olarak yargılanır:

```
cevre_sonra == cevre_once − 2·Lold + 2·Lnew     artık = 0.000000000 mm  (3/3 hedef)
```

Eşik **gevşetilmedi**; **yanlış eşik kurulmadı.** `rotate_check.mjs` bu tanımı
uyguluyor ve hakem onu okuyup doğru buldu.

---

## K30 — İKİ YENİ BOŞLUK, İKİSİ DE **HAKEM MUTASYONUYLA** BULUNDU → F5B'nin İŞ 0'ı

Üçü de ajanın **hiç açmadığı** dosyalardan koşuldu (§3.8 md.3).

**(a) HM1 — KÜNYE BAĞLI DEĞİL.** `engine/tools/rotate-op.cpp:48`:
`constexpr double kApexFracOfPanel = 0.80;  // SheathOptions::bodiceApexFrac`.
Motordaki `bodiceApexFrac` **0.60'a çekildiğinde** `rotate-op` hâlâ **0.80** ve
`apeks_derinlik_mm 289.1484` basıyor, **kapı yeşil**. Sayı bugün doğru; künye
**sahte değil ama BAĞLI DEĞİL** — motor tarafı kayarsa kapı sessizce yalan söyler.
§3.10'un ruhu: künyeli bir sayı **okunmalıdır**, kopyalanmamalıdır.

**(b) HM3 — KİMLİK KAPILI, DOĞRULUK KAPISIZ.** `shellprojection.cpp`'de
`bust_circumference` **belin** çevresini basacak şekilde değiştirildi: kullanıcıya
inen teknik çizim **yanlış bir büst ölçüsü yayınlıyor**. Düğüm kımıldadı
(`0c1d5286…` → `6a02dac2…`, yani K24 çalışıyor) ama **`tek_nesne_check` ve
`rotate_check` İKİSİ DE YEŞİL**.

> `tek_nesne_check` *"flat ile kalıp AYNI nesneden mi çıktı"* sorusunu tutuyor.
> *"Yayınlanan sayı DOĞRU mu"* sorusunu **hiçbir kapı tutmuyor.** F3 ve F5-A
> **kimliği** kurdu; **doğruluk** kurulmadı. İnen dosyada yanlış bir ölçü bugün
> sessizce sevk edilir.

**Karar:** ikisi de **F5B'nin zorunlu İŞ 0'ıdır.** Eşik gevşetilerek değil, kapı
kolu eklenerek kapanır, ve **her biri kendi mutasyonuyla kırmızı yanar.**

---

## K31 — H8 TABANDA **İKİYE AYRILDI**, VE H8-İFADE'NİN PAYDASI **MÜHÜRLENDİ**

**Taban hakemindir (§3.8 md.1).** Önceki ve sonraki sayı yan yana:

| sayı | ÖNCE (F3 sonrası) | **SONRA (F5-A sonrası)** |
|---|---|---|
| **H8-sözlük** | **31** (26 oov + 5 alan), n=5 · 61 (51+10), n=10 | **31 (26+5), n=5** · **61 (51+10), n=10** — *değişmedi* |
| **H8-ifade** | **YOK** — betik diskte yoktu | **5 / 5**, n=5, payda **ADLI ve MÜHÜRLÜ** |

İkisi **ayrı satırda** basılır, **harmanlanmaz**. H8-sözlük'ün ölçücüsü
`hedef_kosu.mjs`, H8-ifade'nin ölçücüsü `expressability_check.mjs`.

**Payda neden mühürlendi — bir ölçüm, bir varsayım değil.** Hakem kendi
mutasyonlarını koşturdu:

```
HM4  paydadan `freesewing-bella` silinir      -> kapı YEŞİL, H8-İFADE 5/5 -> 4/4
HM5  `stitchu-sheath-eu38` yalnız op.rotate istesin -> kapı YEŞİL, H8-İFADE 5/5 -> 4/5
```

**H8-ifade, motora tek satır kod yazmadan düşürülebiliyordu** — betiğin kendi
başlığının H8-SÖZLÜK için uyardığı §0B tuzağının **bir üst katta tekrarı**. Ajan
sayacın **PAY** tarafını doğru korumuştu (`motorda_kapi` ↔ `add_test` kesişimi;
kendi mutasyonu M6 orayı kırmızı yakıyor); korunmayan taraf **PAYDAYDI**.

**Yapılan (yalnız hakem):** `expressability_check.mjs`'e `TABAN_PAYDA` mührü ve
iki yönlü kapı kolu eklendi — bir giysi adı **silinemez**, bir giysinin gereksinim
kümesi mühürlü adların **altına inemez**. Payda **büyüyebilir, daralamaz**;
büyütmek bir cırcır kazanımı **değildir** ve mührü yalnız hakem büyütür.
Doğrulandı: HM4 ve HM5 artık **EXIT 1 (KIRMIZI)**, taban **EXIT 0 (YEŞİL)**.

⚠ **`contract/hedef-kosu-taban.json`'a DOKUNULMADI** (blob
`cf2af8c7d3c4603eee5aea252f3568feedda8d10`). Gerekçe: H8-ifade `hedef_kosu`'nun
fotoğraf cırcırı değildir, ve takipli bir JSON'a yeni blok eklemek
`flat_expresses_spec_check`i kırmızı yakabiliyor — bu koşuda **iki kez** oldu (K17).
**En kısıtlayıcı yol seçildi:** mühür kapının kendi dosyasında, sayılar burada.

---

## K32 — TEMİZ AĞAÇ, MİRAS ALTIYI **DOĞRULUYOR**; AMA ÜÇ GİRDİ GITIGNORE'DA

F5-A ajanı haklı olarak *"F3'ün 6 kırmızısı temiz ağaçta doğrulanmadı"* dedi.
**Hakem doğruladı, ve cevap: ALTI GERÇEKTEN ALTI.**

Temiz worktree + `cmake -DCMAKE_BUILD_TYPE=Release` ilk turda **23 kırmızı** verdi.
Kökü bulundu ve **hiçbiri kod değildi**:

| kaç | sebep | kanıt |
|---|---|---|
| 17 | `engine/dist/` **gitignore'da** | `emcc` ile `build-wasm.sh` koşuldu → 23 → **13** |
| 1 | `patterns_real/geometry/` **takipsiz** (K10) | kalem kopyalandı → `bugra_bridge_check` **Passed 72.09s** |
| 7 | `engine/pattern-bridge/.venv` **gitignore'da** | 7 kapı **0.01–0.16 sn**'de düşüyor = girdisizlik |
| **6** | **MİRAS ALTI** | `flat_pattern_agree_check` · `flat_artifact_census` · `style_check` · `sizechart_source_check` · `contract_check` · `figure_check` |

**`garment_shell_check` temiz ağaçta `Passed 0.72 sec`** → ajanın "yedinci kırmızı
bayat nesneden" teşhisi **DOĞRU**.

🚨 **Ama borç doğdu (md.39):** *bir hakem turu, gitignore'daki üç girdiyi
tohumlamadan kapıları doğrulayamaz.* Bu, kapıların bir kısmının **kaynaktan
yeniden üretilemez** olduğu anlamına gelir. Bu bir §0B ihlali değil, bir
**doğrulanabilirlik** açığıdır ve kayda geçer.

---

## K33 — `figure-lint.mjs` **SEMBOLİK LİNKLİ BİR CHECKOUT'TA TAMAMEN SESSİZCE YEŞİL**

Hakem worktree'yi `/tmp/f5a-pristine`'e açtı ve `figure_check` **`Passed 0.04 sec`,
SIFIR ÇIKTI** verdi — oysa aynı betik doğrudan koşulunca **`1 FAILURE(S)`** basıyor.

**Kök sebep ölçüldü, tahmin edilmedi** (`/tmp -> private/tmp`, macOS):

```js
if (import.meta.url === pathToFileURL(process.argv[1] || '').href) { ...suitin tamami... }
```

`import.meta.url` **realpath'lidir** (`file:///private/tmp/…`), `process.argv[1]`
ise **ham** (`/tmp/…`). Eşitlik tutmaz → **süitin tamamı atlanır, `fails` 0 kalır,
exit 0.** Kapı *"hiçbir şey ölçmedim"* ile *"her şey geçti"*yi **ayırt etmiyor.**

⚠ Damla'nın makinesindeki gerçek repo yolu sembolik link **DEĞİL**, yani bugün
canlı bir yanlış-yeşil **yok** — ama `figure_check` **miras altıdan biridir** ve
kök sebebi *"5'inin kökü hâlâ aranmadı"* borcunda duruyor. **Bu, o beşten birinin
bir parçasıdır ve artık adlandırılmıştır.** Bir kapı, girdisi boşken **yeşil
basmamalıdır**.

**Karar (en kısıtlayıcı):** `figure_check`'in kökü F5B'nin işi **değildir**
(§2 biçimi F4'e bağlı, K23 emsali) ama **borç listesine adıyla girer** ve
*"kapı boş girdide yeşil basamaz"* ilkesi **koşunun geneline** yazılır.

---

## K34 — SEVK EDİLEN wasm'ın `source-stamp`'İ **KAYNAĞIN FONKSİYONU DEĞİL**

Hakem `build-wasm.sh`'ı temiz worktree'de `emcc` ile koşturdu ve pushlanan ikiliyle
karşılaştırdı:

```
engine/dist/stitchu-worker.wasm      main ve temiz agac   1577d4e0…/b177d2b3…  BIREBIR AYNI
backend/engine/stitchu-worker.wasm   pushlanan            a3fd4bdb…
backend/engine/stitchu-worker.wasm   temiz agactan derlenen  46d4603c…
```

**Kod baytları bit-aynı; farkın TAMAMI 15 bayt** ve o 15 bayt
`stitchu.source-stamp`: pushlanan **`12060bc08360bbb7`**, yeniden derlenen
**`ec4a6889fd4cb2eb`**.

**Kök sebep ölçüldü:**

```sh
src_stamp() { find src wasm -type f -print0 | sort -z | xargs -0 shasum -a 256; ... }
```

`find` **`engine/src/.rabadon/`**'u da yakalıyor — rabadon'un **kendi oturum/durum
dosyaları** `engine/src` altında duruyor:

```
src/.rabadon/net.json · src/.rabadon/state.json
src/.rabadon/sessions/.swept · src/.rabadon/sessions/389fb805-….json
```

Yani damga **motor kaynağının değil, rabadon oturum durumunun** fonksiyonu.
`build-wasm.sh` kendi yorumunda *"DETERMINISTIC: the same sources produce the same
byte"* diyor — **bu cümle bugün yanlıştır** ve `bundle_fresh_check`'in dayandığı
önerme delinmiştir.

**Bu F5-A'nın ürünü DEĞİL** (kirlilik `engine/src/.rabadon/`'dan geliyor, ajan
oraya dokunmadı) ve F5-A'nın kapatması gereken bir şey değil. **Borç md.40.**
En kısıtlayıcı okuma: **sevk edilen wasm bugün kaynağından yeniden üretilemez**,
ve bunu söyleyen damganın kendisi bozuktur.
