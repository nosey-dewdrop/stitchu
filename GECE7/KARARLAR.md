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

---

## K35 — H8-İFADE'NİN **PAY** TARAFINDA DELİK VARDI; HAKEM BULDU VE KAPATTI

**F5-A hakemi PAYDA'yı mühürledi (K31).** F5-B hakemi aynı deliğin **PAY**
tarafını kendi mutasyonuyla (HM-A) ölçtü ve delik **gerçek çıktı.**

`expressability_check` bir operatörü "motorda" saymak için `motorda_kapi`
adının `engine/CMakeLists.txt`'te **kayıtlı** olmasını arıyordu. Ajanın kendi
mutasyonu (M8) yalnız **OLMAYAN** bir adı (`split_check`) deniyor ve o
yakalanıyordu. **Yakalanmayan, VAR OLAN bir kapının adını ÖDÜNÇ ALMAKTI.**

**ÖLÇÜLDÜ (hakem, HM-A):** `op.split`'in `motorda_kapi`'si `"geometry"` yapıldı
— ctest'te kayıtlı, ama `op.split` ile hiçbir ilgisi yok:

| | önce (F5-B ajanının bıraktığı hal) | sonra (K35) |
|---|---|---|
| `expressability_check` | **EXIT 0 (YEŞİL)** | **EXIT 1 (KIRMIZI)** |
| ilan | "MOTORDA **3** (suppress, rotate, split)" | ihlal basılır |
| **H8-İFADE** | **3 / 5** ← motora TEK SATIR kod yazmadan düştü | **4 / 5** (kımıldamaz) |

**KARAR — kapı tanımı DEĞİŞTİ (§3.8 md.1, yalnız hakem).** `motorda_kapi`,
operatörün **KENDİ** adını taşımak zorunda: `op.X → X_check`. Kayıtlılık şartı
**korundu**, üstüne konvansiyon şartı eklendi.

**Kural UYDURULMADI, motordaki iki operatörden OKUNDU** (§3.10):
`op.rotate → rotate_check`, `op.suppress → suppress_check`. İkisi de zaten bu
konvansiyonu yazıyor, yani kural bugünkü ağacın kendi ilanıdır.

**Doğrulandı, iddia edilmedi:** temiz ağaç **EXIT 0, H8-İFADE 4/5 DEĞİŞMEDİ** ·
HM-A **EXIT 1** · ajanın **M8'i hâlâ EXIT 1** (kayıt kolu onu tutmaya devam
ediyor, K35 hiçbir kolu gevşetmedi).

---

## K36 — `rotate_check` R0'IN YENİDEN BAĞLANMASI **ONAYLANDI**

F5-B ajanı bunu §3.8 md.4 uyarınca **hakeme getirdi** ve **doğru davrandı** —
kart bunun hakeme geleceğini önceden ilan etmişti (K29 emsali).

| | önce | sonra |
|---|---|---|
| R0 kolu | `aci_deg == 41.48` (**SABİT**) | `\|suppress.kama_deg − rotate.aci_deg\| < ε` (**İKİ ARACIN ÇAPRAZ ÖLÇÜMÜ**) |
| ölçülen | 41.48 fikstürden besleniyordu | **55.1735°**, panelin kendi develop-deficit'i |
| 41.48'in rolü | kapının **ŞARTI** | **YALNIZ RAPOR**, hiçbir kol eşitlemiyor |

**Bu bir GEVŞETME DEĞİL.** Eski kol bir fikstüre pinliyordu; `suppress` ölçtüğü
sayıyı basar basmaz o kol, motoru **başka bir gövdedeki başka bir giysinin
sayısını üretmeye zorlayan** yanlış bir kapı olurdu — §3.10'un açıkça yasakladığı
şey. Yeni kol iki **ayrı aracın** çıktısını bağlıyor: ajan kadranı 41.48'e doğru
oynatsa, `suppress-op`'un aynı paneldeki ölçümüyle ayrışır ve kol kırmızı yanar.

**Doğrulandı:** `rotate_check` EXIT 0 (hakemin temiz Release koşusunda, **391.34
sec**), alan/açı/TRUE bacaklar/çevre kimliği farkı **0.000000000**.

---

## K37 — F5-B PUSH KAPISINI **KIRMADI**; KAPI ZATEN GEÇİLEMEZDİ (borç 43 bir MALİYET, kırık kapı değil)

**Soru (hakeme açıkça soruldu):** süit 1085s'ye çıktıysa ve push kapısı 900s ise,
alt-kart bir kapıyı **fiilen kırmış** olur ve kapanmamalıdır.

**HAKEM ÖLÇTÜ — ÖNCÜL YANLIŞ. Kapı zaman yüzünden değil, KIRMIZI SAYISI yüzünden
zaten geçilemezdi, ve F5-B'den ÖNCE de öyleydi.**

`.rabadon/guard.json` → `pushGate.run` şu beşi dışlıyor: `h10_gate_check` ·
`style_check` · `figure_check` · `preview_truth_check` · `contract_check`.
Miras **6 kırmızının 3'ü bu listede DEĞİL** ve kapının kapsamında kalıyor:

```
  flat_pattern_agree_check   -> KAPSAMDA, KIRMIZI
  flat_artifact_census       -> KAPSAMDA, KIRMIZI
  sizechart_source_check     -> KAPSAMDA, KIRMIZI
```

`pushGate.testPassPattern` = `100% tests passed,\s*0 tests failed`. Üç kırmızı
kapsamda durdukça bu satır **hiçbir zaman basılamaz** — süre sıfır olsa bile.

**Ve pratikte push'lar DÜŞMÜYOR:** `git reflog show origin/main` son beş girdinin
beşi de `update by push`, `HEAD == origin/main`. Yani kapı bugün fiilen
**bağlayıcı değil**.

**KARAR:** F5-B **bir kapıyı kırmadı**; kırık olan kapı **miras** ve F5-B'den
öncedir. **GERİ AL hükmü bu gerekçeyle verilmez.**

**AMA MALİYET GERÇEK VE ÖLÇÜLDÜ** (hakemin kendi temiz Release koşusu):

| | F5-A | F5-B (hakem ölçtü) |
|---|---|---|
| `rotate_check` | **4.78 sec** | **391.34 sec** (**82×**) |
| `suppress_check` | yoktu | **375.74 sec** |
| **tam `ctest`** | — | **1080.09 sec** (ajan 1085.64 dedi, tutuyor) |

İki kapı **767.08 sn** yiyor = süitin **%71'i**. Operatör başına bir kapı daha
eklenirse süit **1500s'yi** aşar. **Borç 43 AÇIK ve F5-C'nin ZORUNLU İŞ 0'ıdır.**

---

## K38 — `maxDartDeg` TAVANI: TEK KAMA İLAN EDİLEN TAVANIN **DÖRT KATI** (borç 44, F5-C'ye ZORUNLU)

`op.suppress` bir panele **TEK** kama açıyor: `left_ftorso` **55.1735°**.
Motorun kendi `SheathOptions::maxDartDeg` alanı **14°** ilan ediyor ve motorun
kendi `dartColumnsFromDeficitRows`'u yükü **birden çok pense** bölüp sütunu
dikişe uzaklıkla ağırlıklandırıyor. **Operatör bunu yapmıyor.**

**KARAR — bugün RAPOR, kapı DEĞİL; ve gerekçe §3.10'dur.** Tek bir kamaya
tavan koymak için **dayanak yok**: 14° motorun **çok-pensli** yerleşimine ait bir
sayıdır, tek kamaya uygulanacağının **yayınlanmış bir dayanağı görülmedi**, ve
bugünkü 55.17'ye uyacak bir tavan seçmek eşiği **bugünkü sayıya uydurmak** olurdu
(K29 emsali). **Uydurma eşik, kapısızlıktan kötüdür.**

**F5-C ZORUNLU:** yerleşim/bölme `op.split`'in konusudur ve F5-C'nin kartı
`op.split`'tir — **bu borç orada karara bağlanacak**, tekrar ertelenemez.

---

## K39 — H8-İFADE **4/5 ÖLÇÜLDÜ AMA KÜNYESİZ BİR SATIRA DAYANIYOR**: sayı DURUR, "kazanım" olarak DIŞARI SÖYLENMEZ

Düşüşün tamamı **tek kalemden**: `freesewing-bella` (`{op.suppress, op.rotate}`),
ve o kalem paydanın **DOĞRULANMADI** iki satırından biridir (öbürü
`freesewing-aaron`). FreeSewing deposu bu makinede yok, yayınlanmış parça
listeleri **görülmedi**. **Ajan bunu kendi yazdı ve doğru davrandı.**

**KARAR — üç parça:**
1. **Sayı DURUR: H8-İFADE = 4/5, n=5.** Ölçüm gerçek, payda **mühürlü ve tam**,
   `TABAN_PAYDA`'ya tek bayt yazılmadı (hakem `git diff` ile doğruladı), ve
   operatörün kendisi **bağımsız olarak** kapılı (`suppress_check`, 5 kol).
   Sayıyı silmek **bilgi atmaktır** ve bilgi atmak, bilgi vermemekten beterdir.
2. **AMA "KÜNYESİZ DAYANAK" damgası taşır.** 4/5, bir **kazanım** olarak
   dışarıya (post/pitch/site) **söylenmez** ve F5-C'de bir cırcır dayanağı olarak
   **kullanılmaz**, künyesi bulunana kadar.
3. **F5-C'nin İŞ 0'ı:** `freesewing-bella` ve `freesewing-aaron`'un gereksinim
   kümeleri **yayınlanmış bir kaynağa** bağlanır. Bağlanamıyorsa **"KÜNYE
   BULUNAMADI"** yazılır ve satır **paydada KALIR** (§3.8 md.2 ruhu: bir giysinin
   gereksinimi yanlışsa **karta yazılır, kaldırılmaz**) — payda **DARALTILMAZ**.

**Bu bir faz şartı DEĞİLDİR:** F5-B kartı 4/5'i bir kapı yapmamıştı
(*"Olmuyorsa sebebi yazılır, sayı zorlanmaz"*), o yüzden hüküm buna asılmıyor.

---

## K40 — BORÇ 44 / K38: YÜK **GERÇEKTEN BÖLÜNDÜ**, AMA BORÇ KAPANMADI — KIYASIN KENDİSİ DAYANAKSIZ

**Hakem kendi koşturdu** (temiz Release, `split_check` SP8):
`left_ftorso` **55.173533262° → 26.840105349° + 28.333427913°**, toplam
**55.173533262°** (fark **0.000000000°**); `left_btorso` **56.668788492° →
29.937360931° + 26.731427562°**. **Yük bölünüyor ve toplam korunuyor — ölçüldü.**

Tavan **4.0× → 2.02× / 2.14×** indi ama **tutmuyor**, ve ajan **14'e ayar
yapmadı** (§3.10). **Bu doğru davranıştı.**

**KARAR:** borç 44 **KAPANMADI**, ama **yeniden adlandırıldı**. Ölçüm artık
şunu söylüyor: sorun geometride değil, **kıyasın kendisinde**. `maxDartDeg = 14`
motorun **çok-pensli** yerleşimine ait bir alandır ve **tek bir kamaya
uygulanacağının yayınlanmış dayanağı GÖRÜLMEDİ** — yani bugün elimizde
*"28.33 fazla"* diyen bir otorite **yok**, yalnızca **iki ayrı şeyi yan yana
koyan bir satır** var.

- İki sayı **yan yana basılmaya DEVAM eder**, eşitlenmez, ve **hiçbir kadran
  14'e doğru çevrilmez** (K29 emsali).
- Kapanma şartı **bir sayı değil bir künye**: ya tek-kama tavanı için
  **yayınlanmış** bir dayanak bulunur, ya da satır *"kıyas dayanaksız"* diye
  işaretlenir ve `maxDartDeg` bir **tavan** gibi okunmaktan çıkar.
- **Dayanak yok → en kısıtlayıcı seçildi:** tavan **uydurulmaz**, sayı
  **gizlenmez**. → **borç 54 AÇIK.**

---

## K41 — DAMLA md.12: `atFraction` **DURUR**, AMA **CİNSİNE GÖRE AYRILIR** (ürün kararı, hakemin)

Ajan ölçtü: 15 preset `atFraction` taşıyor ve **taşıdıkları şey aynı cinsten
değil** — `backSlit.vent`/`backSlit.slit`'te kesir **yırtmacın nereye kadar
dikildiği** (gerçek ürün verisi), `waistline.natural`'da bir **bel landmark'ı**,
kalanlarda **düz bir kadran**. Silmek yırtmaç boyunu atardı; okumak operatörü
kadrana geri çevirirdi. Ajan **ikisini de yapmadı** ve kalemi hakeme bıraktı —
**doğru davranış** (§3.8 md.1).

**KARAR:**
1. **Ajanın ara çözümü ONAYLANDI:** alan sözleşmede **DURUR**,
   `motorda_tuketilmiyor: true` ile ve `splitPanel()` onu **okumaz**. Hakem
   imzayı kaynaktan doğruladı: `SplitReport splitPanel(const SurfacePanel&)` —
   **tek argüman**, ve `atFraction` motorda yalnız bir **ÇIKTI**
   (`atFractionMeasured`). **Kapı bunu iddiaya bırakmıyor** (MS2/MS3 kırmızı).
2. **AMA KALICI DEĞİL.** Ürün verisini (yırtmaç derinliği), hiçbir şeyin
   okumadığı ve bir operatör parametresinin adını taşıyan bir alanda tutmak,
   bilginin **yanlış isimde** durmasıdır. → **F5-D'nin İŞ 0'ı:** alan **cinsine
   göre ayrılır** — yırtmaç derinliği **kendi adını taşıyan** bir ürün alanına
   taşınır, `atFraction` yalnız **tüketilmeyen kadran** olarak kalır.
   **Tek bir yargı silinmez, tek bir sayı atılmaz** (§5.5).
3. **15 kesrin hiçbirinin yayınlanmış dayanağı YOK** → **hepsi
   `YAYIN BULUNAMADI` damgası taşır**, ve bu damga **kaldırılmadan** hiçbiri bir
   ürün varsayılanı olarak **dışarı söylenmez**. **Dayanak yok, en kısıtlayıcı
   seçildi.**

---

## K42 — DAMLA md.13: DENGELİ-YÜK KESİMİ **KALIR**, AMA "PRENSES DİKİŞİ" **DENMEZ**

Kesim sütunu, panelin kendi sütun-deficit profilinde `max(|C(c)|, |T−C(c)|)`'yi
minimize eden iç sütundur — **eşik yok, kesir yok, tolerans yok**. Hakem
`split_check` SP0'ın argmin'i **kendi** yeniden hesapladığını okudu ve üç ayrı
kesir ölçtü: **16/32 · 11/32 · 13/32**. Ajan ayrıca doğru olanı yazdı: klasik
kalıpçılıkta prenses dikişi genelde **büst noktasından**, yani **maksimum
eğrilik** sütunundan geçer, ve iki kural EU38'de **farklı sütun** veriyor;
panel dikişini dengeli-yük sütununa bağlayan **hiçbir yayın bulunamadı**.

**KARAR — üç parça:**
1. **Kural KALIR.** Dengeli kesim **bölmenin tanımıdır** ve borç 44'ün sayıyla
   cevaplanabilmesini sağlayan **tek** şeydir. Bir kadran değil, bir aritmetik.
2. **AMA ADI YASAK.** Bu kesim, hiçbir yüzeyde (kod yorumu hariç: sözleşme, ürün
   metni, site, post) **"prenses dikişi"** ya da **"kup dikişi"** diye
   adlandırılmaz — o adların **yayınlanmış** bir yeri var ve bizim sütunumuz o
   yer değil. **Künye `YAYIN BULUNAMADI` olarak durur.**
3. **F5-D ŞARTI — notu SAYIYA çevir:** `split-op` bundan sonra **maksimum
   eğrilik sütununu da** dengeli sütunun **yanına basar**. İki kuralın farkı
   böylece bir dipnot değil **ölçülen bir sayı** olur, ve alternatifi seçmek
   isteyen biri aynı çıktıdan okur. **Ucuz, ve bilgi atmıyor.**

---

## K43 — 🚨 HAKEMİN MUTASYONU GERÇEK BİR DELİK BULDU: `split_check` **SIRALANMIŞ** BİR PROFİLİ GÖREMİYOR

**HM-1 (hakem, `engine/src/surfacepattern.cpp`):** sütun profili **aynalandı**
(`defCol[j]` → `defCol[cols - j]`). Profilin **çokluğu, toplamı ve iptali
değişmez**; yalnız **sırası** değişir.

**ÖLÇÜLDÜ:** kesim sütunları **16→15 · 11→20 · 13→18** kaydı — yani operatör
paneli **kanıtlanabilir şekilde YANLIŞ yerden** böldü — ve
**`split_check` EXIT 0, SIFIR `FAIL`.** Dokuz kolun **dokuzu da** geçti.

**Sebep:** SP0 argmin'i **aracın kendi bastığı profilden** yeniden hesaplıyor,
SP1 ise yalnız **TOPLAMI** motorun `developDeficitDeg`'ine bağlıyor. Toplam
**sıraya duyarsızdır**. Yani kapı *"kesim, basılan profilin argmin'idir"*i
doğruluyor ama *"basılan profil, panelin gerçek sütun geometrisidir, DOĞRU
SIRADA"*yı **hiç doğrulamıyor**. `deficitColumnDeg`'i okuyan **başka hiçbir
tüketici yok** (hakem `grep`'le doğruladı), yani **repoda bunu yakalayabilecek
ikinci bir kapı da yok.**

Bu, **K30'un tam sınıfıdır**: *kimlik kapılı, doğruluk kapısız* — ve bu kez
kartın **kendi getirdiği yeni sayının** üstünde.

**KARAR:** **hüküm bu delikten VERİLMEZ** ve sebebi ölçülü: temiz ağaçta profil
**doğrudur** (SP1 üç panelde de `developDeficitDeg` ile birebir tutuyor, kesim
sütunları 16/11/13 gerçek). Delik bir **yanlış sayı** değil, **eksik bir kapı**.
Ve kapatmak bir **hakem tek satırı değildir** — kapının sıraya duyarlı, motordan
gelen ikinci bir tutamağı yok; aracın **sütun başına sınır geometrisi** basması
gerekir, ki o **faz işidir** (K31/K35 emsali burada uygulanamaz: onlar kapı
tarafında tek satırdı).

→ **F5-D'nin ZORUNLU İŞ 0'ı, borç 56.** Emsal: borç 43/44/47/48 aynen böyle
devredildi ve **hepsi kapandı**.

---

## K44 — İKİ ÖLÇÜLEN KÖR NOKTA DAHA (hakem mutasyonu), VE AĞ **TAMAMEN** KÖR DEĞİL

Üçü de ajanın **hiç yazmadığı** dosyalarda (`git numstat` **BOŞ**, hakem
doğruladı), üçünde de **ikili kımıldadı**:

| mut | dosya (dokunulmamış) | değişiklik | sonuç |
|---|---|---|---|
| **HM-2** | `engine/src/bodysurface.cpp` | `kAspectBust` **1.35 → 1.42** | `split_check` · `tek_nesne_check` · `flatten_check` · `surface_pattern_check` · `garment_shell_check` · `walkgate_check` · `garment_armhole_check` · `closed_garment_check` **HEPSİ YEŞİL** (tek kırmızı `sizechart_source_check` = **miras**) |
| **HM-3** | `engine/src/seamplan.cpp` | `kCapMM` **60.0 → 90.0** (tüketicisi var: `BodySurface(...)`) | **YEDİ kapının YEDİSİ de YEŞİL** |
| **HM-4** | `engine/src/flatten.cpp` | gevşetme adımı **× 0.55** | ⭐ **`walkgate_check` KIRMIZI** |

**KARAR:** **HM-4 hükmü kurtarıyor** — kapı ağı bir tiyatro değil, gerçek bir
gevşetmeyi **yakalıyor**. Ama **VÜCUT-GİRDİSİ sabitleri kapısız**: ilan edilmiş
bir gövde oranı ve bir kapak ölçüsü **serbestçe kaydırılabiliyor** ve inen
nesne sessizce değişiyor. ⚠ `kAspectBust`/`kNapeHeightFraction` gibi alanlar
kaynakta zaten **`ASSUMPTION:`** diye işaretli — yani **künyesiz oldukları
biliniyor**, üstelik **kapısızlar**. → **borç 57 AÇIK**, F5-D'nin şartı değil,
**Halka 3'ün (F4) konusu** — orası zaten manken çizelgesine bakıyor (K23).

---

## K45 — 🚨 F5 **15 OPERATÖRDE DEĞİL, KUYRUK BOŞALINCA** KAPANIR (§3.7, hakem kartı yeniden yazdı)

**Soru:** kalan 12 operatör tek tek mi koşulacak (12 alt-kart ≈ 12 oturum), yoksa
F5 ölçülen bir eşikte mi kapanacak?

**DAYANAK — ÖLÇÜLEN SAYI, hakemin kendi `expressability_check` koşusundan:**

```
   3 giysi  op.attach          1 giysi  op.derive · op.extend · op.gather · op.overlay
```

Mühürlü payda (`TABAN_PAYDA`, 5 giysi) topu topu **8 ayrı operatör** adlandırıyor;
**3'ü motorda**, **5'i kuyrukta**. Kalan **7 operatör** — `asymmetry` ·
`ease-region` · `flare` · `fold` · `merge` · `pleat` · `slash-spread` — paydanın
**HİÇBİR giysisini** bloke etmiyor. Onları koşmak **ölçülebilir hiçbir sayıyı
kımıldatmaz**: 12 alt-kartın **7'si sıfır** getirir.

Ve bu bir kestirme değil, **§4A'nın kendi kapanış testi**: *"Sınırsızlık = bu
kuyruğun boşalması."* Kapanış **operatör sayısına** değil **kuyruğa** bağlanmış.

**KARAR:**
1. **F5'in kapanış eşiği: H8-İFADE = 0/5** mühürlü payda üzerinde. Kalan
   alt-kart sayısı **12 değil, 5** (`attach` · `extend` · `derive` · `overlay` ·
   `gather`) — ve `attach` **tek başına 3 giysi** taşıdığı için eğri
   **3/5 → 2/5 → 1/5 → 0/5** diye iner.
2. **Kalan 7 operatör SİLİNMEZ, KUYRUKTA ADIYLA DURUR** (§4A, §5.5). Payda
   büyürse (yeni giysi eklenirse) geri gelirler; **payda hakemindir** (K31).
3. 🚨 **AMA "SINIRSIZ" KELİMESİ YASAK.** §4A açıkça yazıyor:
   **rotate + slash-spread + merge** üçlüsü olmadan o kelime kullanılamaz.
   `rotate` **var**, `slash-spread` ve `merge` **YOK** ve paydanın kuyruğunda da
   yoklar. → **H8-ifade 0/5'e inse bile** hiçbir yüzeyde *"sınırsız"* /
   *"unlimited"* / *"her kalıbı çıkarır"* **denmez**. Bilgi silinmiyor, **iddia
   yasaklanıyor**.

---

## K46 — 🚨 F5-D **`op.attach` DEĞİL**: ÜÇ ALT-KARTTIR OPERATÖR GERÇEKLİĞİ KAPANIYOR, **ÜRÜN YOLU KAPANMIYOR**

§3.6 F5'e **üç** sayı verdi: **H4 · H5 · H8**. Üç alt-karttan sonra, ölçülen:

| sayı | F5 öncesi | F5-A | F5-B | **F5-C** |
|---|---|---|---|---|
| **H8-ifade** | — | 5/5 | 4/5 | **3/5** ⭐ kımıldayan **tek** sayı |
| **H5** | 0/5 | 0/5 | 0/5 | **0/5** — payda **üç kez** büyümedi |
| **H4** | ÖLÇEMEDİM | ÖLÇEMEDİM | ÖLÇEMEDİM | **ÖLÇEMEDİM** (dokuz fazdır) |

**KÖK SEBEP TEK VE HAKEM ONU ÖLÇTÜ.** `hedef_kosu.mjs` H5'i
`d.pattern.pieces[].edgeRoles` üzerinden sayıyor — yani **`draftJSON` hattından**.
H4'ün `reason` katmanı **aynı hat**. Ve hakem üç operatörün **üçünü de** ürün
hattında aradı:

```
panelsplit.hpp   -> yalnız  src/panelsplit.cpp · tools/split-op.cpp
dartsuppress.hpp -> yalnız  src/*.cpp · tools/suppress-op.cpp · tools/rotate-op.cpp
dartrotate.hpp   -> yalnız  src/dartrotate.cpp · tools/rotate-op.cpp
```

**`garment.cpp` · `wasm/bindings.cpp` · `web/js/*` → ÜÇÜNDE DE SIFIR SATIR.**
Üç operatör **gerçek**, üçü de **kapılı**, ve **hiçbirine kullanıcı
dokunamıyor.** Borç 45 (F5-B) ve borç 49 (F5-C) **aynı cepheyi** iki kez yazdı;
bu üçüncüsü.

**KARAR — F5-D operatör kartı DEĞİL, BAĞLAMA kartıdır:**
1. **`op.attach` F5-E'ye kaydı.** Gerekçe bir tercih değil bir sayı: dördüncü
   üst üste **yalnız H8**'i kımıldatan kart, F5'in üç sayısından **ikisini
   dördüncü kez** yerinde bırakırdı.
2. **F5-D'nin hanesi H5 ve H4'tür**, ve ikisi de **aynı** işle açılır: operatör
   çıktısının `SeamPlan`'a ve `draftJSON`'a **geri yazılması**. Bu tek iş
   **borç 45 + 49 + 51'i birlikte** kapatır.
3. **Ve koşunun sabit hedefi budur** — *"fotoğraf + prompt → kalıp + flat"* —
   `CLAUDE.md`'nin tek testiyle aynı: **kullanıcının dokunamadığı bir operatör,
   satın alınabilir bir nesneyle bitmiyor.**
4. ⚠ **Kabul edilen bedel, gizlenmiyor:** bu karar H8-ifade eğrisini **bir kart
   geciktirir** (3/5 bir alt-kart daha 3/5 kalır). **Ölçülerek kabul edildi.**

## K47 — 🚨 ÜRÜN YOLU **İKİ NESNEDİR**, VE F5'İN HANESİ **BAĞLANMAYAN** NESNEDE (K46'nın öncülü DÜZELTİLDİ)

**K46 şunu varsaydı:** *"üç operatörün üçü de ürün hattında sıfır satır → bağlarsan
H4 ve H5 ilk kez ölçülebilir hale gelir."* **Öncül ölçülerek YANLIŞ çıktı.**
F5-D hakemi `grep`'le ölçtü — repoda **BİR ürün hattı değil, İKİ ürün hattı** var:

```
web/js/download.js:262   seamPlanFlat(size,0) → flatJSON → SeamPlan        ← İNEN FLAT
web/js/create.js:8,1045  draft(spec)          → draftJSON → DraftedPattern ← İNEN KALIP
engine/tests/hedef_kosu.mjs:258-263  H5 = d.pattern.pieces[].edgeRoles     ← İKİNCİSİNDEN
engine/tests/hedef_kosu.mjs:346      H4 = "ÖLÇEMEDİM"                      ← İKİNCİSİNDEN
engine/src/garment.cpp               operatör include'u: SIFIR SATIR
```

**F5-D operatörleri BİRİNCİSİNE bağladı.** Bu **ölü bir altyapı DEĞİL** — inen flat
o hattan geliyor, `bundle_fresh_check` yeşil, sevk edilen wasm `opsJSON`'u gerçekten
export ediyor (`strings … | grep -c opsJSON` → 1), düğme `create.js:1045`'te.
**Ama F5'in hanesi öbür nesnede duruyor ve o nesne bağlanmadı.**

**VE KART İKİ ŞEYİ AYNI ANDA ŞART KOŞTU, İKİSİ BİRLİKTE MÜMKÜN DEĞİL:**
(a) İŞ 1 md.2 — `draftJSON` yeni çifti **ilan edecek**;
(b) faz kapısı md.1 — **yedinci kırmızı = alt-kart kapanmaz** (+ RULES 4).
`DraftedPattern.pieces`'a panel eklemek `validator`·`printpack`·`cutplan`·
`flat_expresses_spec_check`·`style_check`·`figure_check` + golden diff'i **birlikte**
oynatır. **Ajan (b)'yi seçti, hiçbir eşiği gevşetmedi, hiçbir sayı uydurmadı ve
yeri ÜÇ SATIR olarak yazdı** — K29 / K36 / K40 emsalinin aynısı.

**HÜKÜM:** çelişki **kartın**, yani **ÖNCEKİ HAKEMİN**; onarmak da **HAKEMİN**
(§3.8 md.1). Bu **GEÇTİ'yi düşürmez** ama **KAZANIM DA YAZILMAZ.** F5-D'nin
§3.6 hanesi (**H4·H5·H8**) **tamamen boştur** ve bu koşuda hanesi boş kalan
**ilk** alt-karttır. → **K48**.

## K48 — F5, KUYRUK BOŞALINCA **YETMEZ**: H5'İN **PAYDASI** DA BÜYÜMEK ZORUNDA (K45'e EK)

**K45** F5'in kapanış eşiğini *"mühürlü paydanın kuyruğu boşalsın"* diye kurmuştu.
**Dayanak hâlâ geçerli ama TEK BAŞINA YETERSİZ, ve gerekçe ölçülen sayıdır:**

| | F5 öncesi | F5-A | F5-B | F5-C | **F5-D** |
|---|---|---|---|---|---|
| **H8-ifade** | — | 5/5 | 4/5 | 3/5 | **3/5** — kımıldamadı |
| **H5 (payda)** | 0/5 (**5**) | 0/5 (**5**) | 0/5 (**5**) | 0/5 (**5**) | **0/5 (5)** — **dört kez** |
| **H4** | ÖLÇEMEDİM | ÖLÇEMEDİM | ÖLÇEMEDİM | ÖLÇEMEDİM | **ÖLÇEMEDİM — onuncu faz** |

§3.6 F5'e **üç** sayı verdi. Dört alt-kart sonra kımıldayan **bir** tanesi ve o da
**iki alt-karttır durdu**. Kuyruğu boşaltmak (5 operatör × ~1 alt-kart) H8-ifade'yi
0/5'e indirir ama **H4'ü ve H5'i yerinde bırakır** — yani F5, hanesinin **üçte
ikisi ölüyken** kapanır. **Bu §0B'nin tam olarak yasakladığı şeydir.**

**KARAR — F5 kapanış eşiği ÜÇ ŞARTLIDIR:**
1. mühürlü paydanın **kuyruğu boşalacak** (K45, değişmedi), **VE**
2. **H5'in paydası en az BİR KEZ büyüyecek** (gerçek bir dikiş çiftiyle;
   tanım değiştirerek **değil** — `hedef_kosu.mjs` eşikleri **mühürlü**), **VE**
3. **H4 ya bir SAYI basacak, ya da ölçülemezliği bir KAPIYA bağlanacak**
   (bir yorum satırına değil).

**SIRA — ve bu bir tercih değil, K47'nin sonucudur:**
- **F5-E = KÖPRÜ** (`SeamPlan` ⇄ `DraftedPattern`). **`op.attach` DEĞİL.**
- `op.attach` **F5-F'ye kaydı** (K46'nın kaydırmasının ikincisi; kabul edilen
  bedel **ölçülerek yazıldı**: H8-ifade eğrisi **iki kart** gecikir).
- **TAVAN:** F5-E **iki tura** kadar. İkinci turda da H5'in paydası büyümezse
  **F5 DURUR**, `op.attach` ve kuyruk **adlarıyla kuyrukta bekler**, ve
  **Halka 3 F4'ten açılır** — çünkü o durumda blokör bir operatör değil
  **F4'ün geometri işidir** (K23'ün 28.7714 mm'si ve borç 57'nin **üç** ölçümü
  aynı yerde duruyor). Bu bir kaçış değil, **ölçülen bir sıra düzeltmesidir.**
- **Kalan tahmin:** F5-E (1–2 tur) + kuyruğun 5 operatörü ≈ **6 alt-kart**,
  süit maliyeti ~**+100 s** (F5-D'nin +23.96 s'si emsal) → ~**840 s**.
  Push kapısı (900 s) zaten **miras üç kırmızıdan geçilemiyor** (K37), yani süre
  bir **maliyettir, duvar değil** — ama 900'e yaklaşıyor ve **ölçülerek yazıldı**.

## K49 — `op_program_check` BİR **KİMLİK** KAPISIDIR, `op.rotate` İÇİN **DOĞRULUK** KAPISI DEĞİLDİR (hakem mutasyonu HM-J2)

Hakem, ajanın **hiç açmadığı** `engine/src/dartrotate.cpp`'de transfer açısını
`theta * 0.90` yaptı (`numstat` **BOŞ**, ikili `fc7baddf…` → `…d949f09e`):

| kapı | sonuç |
|---|---|
| `rotate_check` | **EXIT 1 🔴** — ALAN 32473.1791 → 36134.0402 mm² (fark **3660.861111584**), AÇI 55.173533° → 49.656180° (fark **5.517353326°**) |
| **`op_program_check`** | 🚨 **EXIT 0** |
| `split_check` | EXIT 0 |

**OP1 "soruldu, uygulandı, PLANA YAZILDI" bir KİMLİKTİR.** Rijitlik — bir transferin
kumaş **ekleyememesi** — bir **DOĞRULUKTUR** ve ürün yolunda **kapısız**.
Kartın kendi yeni kapısının üstünde **K30'un tam sınıfı**.

⚠ **HÜKÜM BURADAN VERİLMEDİ:** ağ kör **değil**, `rotate_check` kırmızı yanıyor,
ve temiz ağaçta program **doğru** — delik bir **yanlış sayı** değil, **eksik bir
kapı**. → **borç 66, F5-E'nin ZORUNLU İŞ 0'ı** (emsal: borç 43/44/47/48/56 aynen
böyle devredildi ve **hepsi kapandı**).

**Aynı turda ölçülen iki şey daha, ikisi de hüküm taşımıyor ama deftere giriyor:**
- **HM-J3** (`seamplan.cpp`, `kStatureMM` 1680→1750): `tek_nesne_check` **EXIT 1**,
  ama `op_program_check`/`split_check` **EXIT 0** → **borç 57 / K44'ün ÜÇÜNCÜ
  ölçümü** (`kAspectBust` · `kCapMM` · `kStatureMM`). **Halka 3 / F4.**
- **HM-J5** (`flatten.cpp`, `strainPolish` adımı ×0.45): **ağın TAMAMI yeşil**
  (`walkgate_check` dahil — F5-C hakeminin HM-4'ünü yakalayan kapı). Zararsız mı
  (yakınsama kadranı) gevşek mi (strain bütçesi) — **DOĞRULANMADI** → **borç 67**.
- **HM-J4** (`garmentshell.cpp`): ikili **kımıldamadı** → **HÜKÜM YOK**, ve öyle
  sayıldı. Bayat-ikili tuzağına düşülmediği **`shasum` ile ölçüldü**.

## K50 — BORÇ 59 **KAPANDI (SAPMA YOKTU)**, BORÇ 60 **DAMGALANDI, SİLİNMEDİ** (payda hakemin)

**Borç 59.** F5-C hakemi *"bir alıntı birebir değil"* demişti. F5-D hakemi
**seçenek sayfalarını tek tek açtı** (§3.9'a girmez — yayınlanmış doküman):
- `freesewing.eu/docs/designs/bella/options/bustdartlength/` →
  *"The **bust dart length** option controls the length of the bust dart.
  **The maximum length brings the dart all the way to the bust apex.**"*
- `freesewing.eu/docs/designs/bella/options/bustdartangle/` →
  *"…**It attempts to set the angle of the top leg of the dart at the requested
  angle.** However, the angle may be limited to ensure that a minimum amount of
  fabric is left above and below the dart."*

**İki alıntı da kaynağın KENDİ İKİNCİ CÜMLESİ.** Sapma **yoktu** — F5-C hakemi
kalem sayfasını değil **liste sayfasını** okumuştu. **Tek bayt alıntı
değiştirilmedi**, yalnız **kalem sayfalarının URL'i künyeye eklendi** ki bir
sonraki hakem **tekrar açabilsin**. **Borç 59 KAPANDI.**

**Borç 60.** `freesewing-aaron`'ın `op.split` gereksinimi *"Cut 1 back on the fold"
+ "Cut 1 front on the fold"*e dayanıyor. **Bu bir KATLAMADA KESİMDİR** — iki ayrı
parça — **bir panelin BÖLÜNMESİ değil.** Eşleme **zayıf** ve öyle **DAMGALANDI**.
- **SİLİNMEDİ**, çünkü silmek paydayı **gevşetmek** olurdu (§0B / K31 emsali).
- **Doğru operatörün adı UYDURULMADI** (§3.10) — kuyrukta ona karşılık gelen bir
  ad yok ve icat edilmedi.
- **Bugün sayıya etkisi YOK, ölçüldü:** `aaron` zaten `op.extend` + `op.attach`'tan
  **çevrilemiyor**. **H8-ifade `3/5` KIMILDAMADI** (hakem düzenleme öncesi ve
  sonrası koştu, EXIT 0 · 3/5).
- Düzeltme hakemin kendi commit'i **`b282349`**; ajan `expressability_check.mjs`'e
  **tek bayt** yazmamıştı (`numstat` **0**).

---

## K51 — `golden_check`'in *"Damla'nın onayı"* ŞARTI KOŞUYU DURDURMAZ: ONAYI HAKEM VERİR — **VE HAKEM BU TURDA VERMEDİ** (DAMLA md.14 karara bağlandı)

**§3.4 açıktır: Damla koşunun dışındadır.** `golden_check.sh:31`'in
*"get Damla's approval BEFORE pinning"* cümlesi bir **ürün disiplinidir**, bir
koşu kapısı değil; o onayı **hakem** verir ya da vermez. F5-E ajanının
*"yetkim yok, hakeme geliyorum"*u **doğru davranıştı** (§3.4 ajana Damla'ya
sormayı yasaklıyor), ama karar noktası orada bitmez — **burada bitiyor.**

**HAKEM ÖNCE BEDELİ KENDİ ÖLÇTÜ, SONRA REDDETTİ. Prob hakemin kendi elidir**
(`garment.cpp`'nin ortak `reanchorEdgeRoles` çoktan-noktasına iki dikdörtgen
parça eklendi, ajanın sayısı **birebir** yeniden üretildi):

```
pin  : 23406 satir      dump : 29016 satir      fark: +5610
diff hunk : 558 'a' (ekleme) · 3 'c' · 0 'd'
eklenen 5625 satirin 5610'u  "Bridge probe" = YENI PARCANIN BASIMI
kalan 15 satir + kaybolan 15 satir: BAYT BAYT AYNI (diff'in ekleme siniri)
```

> 🚨 **HÜKÜM — SAYIYLA: +5610 satırın `0`'ı DAVRANIŞ DEĞİŞİMİ, `5610`'u YENİDEN
> BASIMDIR.** Mevcut hiçbir parçanın hiçbir koordinatı **kımıldamadı.** Yani bir
> re-pin **bugün sevk edilen tek bir kalıbın tek bir baytını** oynatmazdı, ve
> ajanın *"golden duvarı"* diye tarif ettiği şey **bir duvar değildir.**

**BUNA RAĞMEN ONAY VERİLMEDİ, VE GEREKÇE GOLDEN DEĞİL — K52'DİR.** Re-pin'in
ucuz olması, pinlenecek şeyin **doğru** olduğu anlamına gelmez: probun eklediği
parçalar **başka bir bedenin** parçalarıdır. Bir kapıyı, altındaki gerçek
onarılmadan yenilemek, kusuru **mühürlemektir**. **Dayanak: K52 + K53.**

▸ `golden-reference.csv`'ye bu turda da **tek bayt yazılmadı**; hakemin probu
  **geri alındı** ve `golden_check` **Passed** (ikili tabana döndü).
▸ Ve `50 kırmızı` da bir bedel değil, **şartnamedir**: hakem kaynağa baktı —
  `validator.cpp:1061` (`cutline`) ve `validator.cpp:1321` (`guideCoverage`)
  **parça başına** koşuyor. Yani repo, inen kalıba giren her yeni panelden bir
  **kesim çizgisi** ve bir **rehber adımı** istiyor. Bu `CLAUDE.md`'nin tek
  testinin ta kendisidir ve **etrafından dolaşılacak bir şey değildir.**

## K52 — İKİ NESNENİN ARASINDAKİ VÜCUT HARİTASI **UYDURULMAZ; F4'ÜN İŞİDİR** (DAMLA md.15 karara bağlandı)

Hakem kaynağı kendi okudu, ajanın cümlesi **doğrulandı**:

| | imza | aldığı vücut |
|---|---|---|
| inen **kalıp** | `garment.hpp:11` `draft(const GarmentSpec&, const BodyMeasurementsSnapshot&)` | **SERBEST ölçü** |
| operatörlerin planı | `seamplan.hpp:83` `buildSeamPlan(const std::string& sizeLabel, …)` | **EU beden ETİKETİ** |

`garment.cpp` altı operatör başlığının **hiçbirini** include etmiyor
(hakemin kendi grep'i: **SIFIR SATIR**), ve `flatJSON`'un `bedenlendirme` bloğu
bugün **`YAYIN BULUNAMADI`** basıyor. **Yayınlanmamış bir dönüşüme karşı köprü
kurulamaz** (§3.10) — kurulursa `op.split`'in parçaları inen kalıba **başka bir
bedenin parçaları** olarak girer.

**KARAR: harita UYDURULMAZ.** *"En yakın bedeni seç"* yazmak, reponun daha önce
ölçtüğü **üçüncü vücut kaynağı** kusurunu dördüncüye çıkarırdı. Ajan bunu
yazmadı; **doğru davrandı.** Haritayı ilan etmek **K23'ün işidir ve K23 F4'e
bağlıdır** — bu yüzden köprü F5'in değil, **F4'ün ardılıdır.**

## K53 — 🚨 F5-E'NİN TEK ŞARTI **TATMİN EDİLEMEZDİ**: H5'İN PAYDASI KAPININ KENDİ KODUNDA **5'E KAPALI** (hakemin ölçümü, K47'nin sınıfı — İKİNCİ KEZ)

Kart *"H5'in paydası 5'ten büyük olacak"* dedi. **Hakem ölçtü: motorda yapılacak
hiçbir iş bu paydayı büyütemez.** `engine/tests/hedef_kosu.mjs` (**MÜHÜRLÜ**):

```
264  const armhole = (byRole.armhole_front||[]).concat(byRole.armhole_back||[]);
265  const cap     = byRole.sleeve_cap || [];
266  if (armhole.length && cap.length) {
267    const A = armhole.reduce((s,e) => s+e.L, 0);      ← BÜTÜN kol oyuklari TEK sayiya
268    const C = cap.reduce((s,e) => s+e.L, 0);          ← BÜTÜN kapaklar TEK sayiya
269    r.seamPairs.push({ pair: 'armhole↔sleeve_cap', … });   ← SATIR BASINA TAM BIR ÇIFT
333  const pairs = rows.flatMap((r) => r.seamPairs);
```

`push` bir **döngüde değil**, tek bir `if`'in içinde. Yani
**`pairs.length` ≤ `rows.length`**, ve `rows.length` = `n` = **5**.

**KANIT — İDDİA DEĞİL, KOŞUM:** hakemin probu `golden`'ın **5610 satırını
birebir** yeniden üretti (yani parçalar gerçekten inen kalıba girdi, roller
`reanchorEdgeRoles`'tan **sağ çıktı**), ve aynı koşumda:

```
H5_dikilebilirlik  0   n=5   0 eslesmeyen cift / 5 olculebilen cift    ← PAYDA 5. BUYUMEDI.
H5_dikilebilirlik  0   n=10  0 eslesmeyen cift / 5 olculebilen cift    ← PAYDA 5. BUYUMEDI.
```

> 🚨 **Yani F5-E ajanının kartında yazan *"probda payda 5 → 10"* HAKEMİN
> KOŞUMUNDA YENİDEN ÜRETİLEMEDİ.** Ajanın iki manşet ölçümü **aynı probdan
> gelmiyor**: fiyatladığı prob (5610 · 50 kırmızı) hakemde **birebir** çıktı,
> *"mekanizma çalışıyor"* dediği prob **çıkmadı**. Bu bir sahtecilik değil, bir
> **karışıklıktır** — ama hükmü taşıyan sayı olduğu için burada düzeltiliyor.

**KARAR:**
1. **K48 md.2 OLDUĞU GİBİ ÖLÜDÜR.** *"Payda gerçek bir dikiş çiftiyle büyüsün"*
   şartı, mühürlü kapının **tek-çift-per-satır** yapısı yüzünden ajanın
   erişebileceği bir şey değildi. **F5-E ajanı imkânsız bir şartla suçlanamaz.**
2. **PAYDAYI BÜYÜTMEK İÇİN KAPI DEĞİŞMELİ, VE O YALNIZ HAKEMİNDİR** (§3.8 md.1).
   **Bu turda DEĞİŞTİRİLMEDİ**, çünkü doğru düzeltme bir gevşetme değil bir
   **sertleştirmedir** ve F5'in değil **F4/F6'nın** hanesindedir → **borç 73.**
3. **K47 ile aynı sınıf, ikinci kez:** kart, kendi mühürlediği dosyanın
   imkânsız kıldığı bir şeyi şart koştu. Çelişki **ajanın değil, kartın** —
   yani **önceki hakemindir.** Emsal K47'de kurulmuştu, burada tekrarlanıyor.

## K54 — **F5 DURUYOR. HALKA 3 F4'TEN AÇILIYOR.** K48'in iki turluk tavanı **BİR turda** harcandı, gerekçe ölçülen üç sayıdır

K48 *"ikinci turda da payda büyümezse F5 durur"* diyordu. **Hakem ikinci turu
harcamıyor**, ve gerekçe bir tercih değil **üç ölçüm**:

1. **K53:** payda **motordan büyütülemez** (kapının kendi kodu, `push` döngüsüz).
   İkinci tur aynı duvara **aynı sayıyla** çarpardı.
2. **K52:** köprünün içeriği **yayınlanmamış** — `draft()` serbest vücut,
   `buildSeamPlan()` beden etiketi, arada harita **YOK**.
3. **K23:** merkez-ön yayında **28.7714 mm**, motorun kendi sertifikalı
   `flatten_check` bütçesinin (**strain <%0.5**) **7.6 KATI** — ve `flatJSON`'un
   `bedenlendirme`si **`YAYIN BULUNAMADI`**.

**Üçü de aynı yerde duruyor ve o yer F4'tür.** K48 md.3 bu hâli kendi metninde
öngörmüştü: *"o durumda blokör bir operatör değil **F4'ün geometri işidir**."*
Şart gerçekleşti; **tavanın ikinci turunu koşturmak, sonucu bilinen bir turu
koşturmak olurdu** (§0: oyalama).

**KARAR:**
- **F5 KAPANMADI, DURDU.** Motorda **3** operatör var; kuyruktaki **5** ad
  (`attach` · `derive` · `extend` · `gather` · `overlay`) **adlarıyla bekliyor**.
  `op.attach` (F5-F) **iptal değil, ertelendi.**
- **Halka 3 açılıyor: F4 → F6 → F7 → F8 → F9.** Sıradaki kart **`GECE7/F4.md`**.
- **F5'in kapanış eşiği K48'de KALIYOR**, ama md.2 **K53 uyarınca yeniden
  yazılacak** ve onu yazacak olan **F4'ten sonraki hakemdir.**
- **K23 F4'e DEĞİŞMEZ olarak taşındı**, **F4'ün hanesi H6'dır** (§3.6), ve
  §3.11 uyarınca F4'ün okuma listesine **§2** eklendi.

## K55 — **BORÇ 69 KAPANDI: SAPMA HİÇ YOKTU, BİR `grep` ARTEFAKTIYDI**

*"`grep -c add_test(NAME` **128**, `ctest` **127**"* iki karttır **DOĞRULANMADI**
diye devrediyordu. Hakem ölçtü ve kök sebep **bir yorum satırıdır**:

```
engine/CMakeLists.txt:1036   # Saglayici ad kumesi `add_test(NAME …)` ∪ `git ls-files engine/tools`'tan cikar,
```

128 eşleşmenin **127'si gerçek `add_test`**, biri **kendi dokümantasyonu**.
Adlar `ctest`in koştuğu 127 adla **birebir** örtüşüyor (`comm -23` **boş**),
yinelenen ad **yok**. **Kayıp bir kapı YOKTU. Borç 69 SİLİNİYOR.**

---

## K56 — K23 **ONARILDI VE ONARIM KÖKTEN**: kapı totoloji değil, hakem mutasyonla ölçtü

Altı fazdır adlandırılıp onarılmayan miras kırmızı **`flat_pattern_agree_check`
ÖLDÜ.** Hakemin kendi temiz-Release koşusu: **`5 tests failed out of 126`,
`739.58 sec`**, beş adın beşi miras listeden, **yedinci yok.**

**Şüphe meşruydu:** ajan flat tarafını `SurfacePattern::topColZMM`'e bağladı.
Kalıp tarafı da aynı sayıdan türüyorsa kapı kendi kendini doğrular ve EXIT 0
hiçbir şey kanıtlamaz. **Hakem bunu okumakla bırakmadı, kırdı:**

**HM-1**, `engine/tools/pattern-measure.mjs` (**`numstat` BOŞ** — ajanın hiç
açmadığı dosya), kalıp tarafı **+20 mm** → **`flat_pattern_agree_check`
EXIT 1**, geri alınınca **EXIT 0**.

**Kalıp tarafı `cfTorso.mm + cfSkirt.mm`** — panellerin kendi merkez-ön
dikişlerinin toplamı, `topColZMM`'den **türemiyor**. Paylaşılan tek şey
**aralığın başlangıcı**, ve o paylaşım `shellprojection.hpp` + `shell-audit.cpp`
içinde **K29 biçiminde ilan edildi.** **Eşik el değmedi:** blob
`05384380c827b9ce379973308c04ff49e2216be6` **iki uçta aynı.**

**K23'ün 28.7714 mm'si ile ajanın 28.5349 mm'si ÇELİŞMİYOR — iki AYRI nicelik:**
`28.5349` **düşey z farkı** (omuz halkası 1378.3050 − kesim 1349.7702) ·
`28.7325` o aralıktaki **yay** (757.5584 − 728.8259) · `0.0389` **düzleştirme
strain'i**. `28.7325 + 0.0389 = 28.7714` **birebir**. Aradaki `0.2365` =
`0.1976` (yay − düşey) + `0.0389` (strain). **Açıklanamayan kalem YOK.**

**K23'ün TETİĞİ ATEŞLEMEDİ ve bu kayda geçer:** K23 *"çizelge yayınlandığı gün
kapı yeniden yazılmak ZORUNDADIR"* demişti. İlan edilen dönüşüm
`farkGirthMM = 0.0`, yani **hâlâ özdeşlik**, yani **eşitlik hâlâ doğru
tahmin.** Kapı bugün yeniden yazılmadı ve **yazılmamalıydı.**

---

## K57 — MANKEN ÇİZELGESİ: **fark 0.0 mm ONAYLANDI** (sayı hakemindir, §3.4/§3.10)

`KOSU-v7.md` F4 bölümü *"manken beli kalıp belinden kaç mm ince"* sorusunu
**Damla'ya** yazıyordu; K51 emsali onu **hakeme** taşıdı. Ajan aramış,
**YAYIN BULUNAMADI** demiş, **en kısıtlayıcıyı** seçmiş (`0.0 mm`, dikiş payı
`0`) ve gerekçesini `GECE7/DAMLA.md` md.16'ya yazıp **koşuyu durdurmamış.**

**HAKEM ONAYLIYOR. Gerekçe tek cümle: sıfırdan başka her değer uydurulmuş bir
sayıdır, çünkü onu söyleyen bir yayın yok.** Hakem denetledi: `KOSU-v7.md` F4
bunu **kendi metninde** yazıyor, ve aynı bölümün **9 kafa / 7–8 kafa** oranının
**künyesi verilemedi** (yazar/yayın/yıl/sayfa/URL) — ajan onu **hiçbir sayıya
beslemedi** ve *"künyesiz zemin"* diye ayrı bir alana yazdı. **Doğru davranış.**
`contract/mannequin-chart-v1.json` kaynağını **"BİZİM KARARIMIZ"** yazıyor,
bir yayına **atfetmiyor**.

**Değişirse tek yer:** `donusum.farkGirthMM`. Croquis çapaları, kapı ve H6
aynı aritmetikten **kendiliğinden** döner (kapı zincir kolu bunu her koşuda
doğruluyor, en kötü **0.0003 mm**). **DAMLA md.16 KAPANDI.**

---

## K58 — 🔴 `flat_artifact_census` **KAPATILMAYACAK**: bir pürüzsüzlük kapısı, **kaynaklı bir beden ölçüsünü EZEMEZ**

F4 kartı *"ihlal KÖKTEN kapanır (1 → 0), kapı EXIT 0"* dedi. **Hakem
REDDEDİYOR, ve gerekçe ajanın KENDİ ölçtüğü sayı.**

Belde iki **ilan edilmiş yasa** teğet koşulu olmadan buluşuyor (alttan A-line
etek −0.24963, üstten skim koni +0.11469, sıçrama **20.5594°**). Bel bir
**MİNİMUM**, o yüzden onu C1 yapan her yuvarlama beli **AÇMAK ZORUNDA**:

| b | **bel halkası** | adım başına dönüş |
|---|---|---|
| 5 mm | 725.0000 → 726.5172 | 8.224° |
| **42 mm** (kapının 1°'si için gereken en küçük) | **725.0000 → 737.7779 (+12.7779)** | **0.979°** |
| 90 mm | 725.0000 → 752.4706 | 0.457° |

**Bel halkası bir tasarım sayısı DEĞİL:** bolluk Steiner-tam çözülüp **725**
hedefine **0.073 mm** ile oturtuldu (CLAUDE.md KOŞU 4B, Threads RTW + Aldrich
bandı) ve o halka **bütün kalıbın TEK paylaşılan halkasıdır**. Üçüncü yol
(A-line eteğin bel eğimini koniyle eşitlemek) **etek yasasını** değiştirir.

**VE BİR SAYI DAHA, hakemin eklediği:** 12.7779 mm, motorun kendi düzleştirme
bütçesinin (`flatten_check` <%0.5 → bel halkasında 3.64 mm) **3.5 katı** ve
`flat_pattern_agree_check`'in **%1.5**'inin (10.88 mm) **ÜSTÜNDE**. Yani bu
kırığı kapatmak, **F4'ün az önce onardığı kapıyı yeniden kırma riski taşır.**

**HÜKÜM:** `flat_artifact_census` **İLAN EDİLMİŞ bir kırmızı** olur —
`contract_check` gibi (Damla'nın 17 Ağu kararı). Eşik **gevşetilmez**, kapı
**silinmez**, `-E`/`DISABLED` **yok**, gerekçe **kapının kendi çıktısında**
(ajan yazdı, RULES 6). **Ajan bu şartı tutmadı çünkü tutulmamalıydı; kart
yanlış istedi ve şartı yazan önceki hakemdir** (K53'ten sonra **ikinci kez**).
**Ajana yazılmıyor. Borç 76 KAPANDI — karara bağlandı.**

▸ **Miras BEŞİN bileşimi artık adlı:** **1 Damla-ilanlı** (`contract_check`) ·
**1 hakem-ilanlı** (`flat_artifact_census`) · **3 kök sebebi HÂLÂ ARANMAMIŞ**
(`style_check` · `sizechart_source_check` · `figure_check`).

---

## K59 — H6 **CIRCIRA BAĞLANDI** (mühür hakem tarafından açıldı), **H5 PAYDASI AÇILMADI ve K53 DÜZELTİLDİ**

**H6 — on iki fazlık "ÖLÇEMEDİM" kapandı.** Ajan sayıyı ölçtü ve bir kapıya
bağladı (`flat_convention_check` §1d), ama `hedef_kosu.mjs:349` **mühürlü**
olduğu için cırcıra basamadı ve **kartında öyle yazdı** — yetkisi yoktu,
**doğru davrandı.** Bağlamak hakemin işidir (§3.8 md.1).

| | ÖNCE | **SONRA** |
|---|---|---|
| `hedef_kosu` H6 | **ÖLÇEMEDİM** (n=5) | **0** (n=8 stil × ön+arka = 16 flat) |
| taban `H6_konvansiyon.deger` | `null` | **`0`** |
| `hedef_kosu.mjs` blob | `7e3683a94f50895563c2f36ea06b3d17e3497104` | **`7370b86d39232e4c92a77ca39ecd4ad3a8a42ac0`** |
| taban blob | `cf2af8c7d3c4603eee5aea252f3568feedda8d10` | **`0ea0cb4415ed558312d88d9b1507df055000545c`** |

**Sayı HESAPLANMIYOR, OKUNUYOR** (ikinci bir hesap ikinci bir doğrudur).
**PAYDA HARMANLANMAZ:** H6'nın `n`'i **8 stil**, H1..H11'inki **5/10 fotoğraf**.
**MUTASYON (HM-7, `web/lib/flat-core.js`, `numstat` BOŞ):** taban yazılmadan
önce H6 0→16 ama `hedef_kosu` **YEŞİL** (null ile kıyas yok); **taban 0'a
yazıldıktan sonra EXIT 1**; geri alınınca EXIT 0. **Taşıyıcı satır değil,
TABANDIR.**

**H5 — K53'ün GÜÇLÜ HÂLİ YANLIŞ, ama payda YİNE DE büyütülmedi.**
K53 *"motorda yapılacak hiçbir iş bu paydayı büyütemez"* dedi. **Teşhisi
(`push` döngüde değil) doğru, sonucu FAZLA GENİŞ:** motor **ikinci bir çifti
adıyla ZATEN ilan ediyor** (`sleeve.cpp:200-213`: *"the piece's TWO side edges
sewn to each other, so both carry the name"*), ve hakemin dökümü **n=5'in
BEŞ satırında da** `sleeve_underarm` **2 kenar** buldu. Payda **5 → 10**
yapılabilirdi; **hakem yaptı, sonra GERİ ALDI.**

🚨 **SEBEP BİR ÖLÇÜM: o çift İNŞADAN SIFIR.** `sleeve.cpp:196-213` sol kenarı
sağ kenarın **AYNASI** olarak kuruyor. Beş satır:
`419.60/419.60 · 96.02/96.02 · 419.60/419.60 · 419.60/419.60 · 205.77/205.77`
→ **diff 0.00, beşinde de, ve başka türlü ÇIKAMAZ.** Payda 5→10 olurdu, pay
**0'da KALMAK ZORUNDA OLURDU**. **Kırmızı olamayan bir çift, payda süsüdür**
(§3.8 md.3 · §0B). **H5 = 0/5 KALDI.**

**Borç 73'ün asıl deliği (ön/arka toplanması) KAPATILAMAZ ve sebebi ölçüldü:**
`sleeve_cap` motorda **TEK ve BÖLÜNMEMİŞ** bir yaydır (`sleeve.cpp:194`,
`locket.cpp:379`), yani kapağın hangi yarısının ön oyuğa gittiğini söyleyen
bir **beyan yok**; uydurmak §3.10 ihlalidir. Kör nokta artık **sayısıyla
basılıyor** (`korNokta`). **Paydayı büyüten gerçek işin adı kondu: motor
`sleeve_cap`ı omuz ÇENTİĞİNDE ön/arka diye ilan edecek — bu bir FAZ işidir,
bir kapı düzeltmesi değil.** → **F6'ya girdi. Borç 51/73 DARALDI, kapanmadı.**

---

## K60 — 🚨 BORÇ 79: **TABANI YAZAN BETİK TABANI YIKIYOR** (`hedef_kosu.mjs --taban`)

`hedef_kosu.mjs:31`'in **kendi kullanım satırı** şunu yazıyor:
*"--taban    tabanı YENİDEN yaz (hakem işi)"*. **Hakem tam olarak onu yaptı ve
dosya şunları SESSİZCE SİLDİ:**

- `_hakem_dokunusu` + `_hakem_dokunusu_2` — **iki önceki hakemin bütün
  önceki/sonraki gerekçeleri**
- 🚨 `_olcum_seti` — **MÜHÜRLÜ hedef-10 + yedek-5 holdout listesi** (K16,
  §3.8 md.2). Faz ajanının göremeyeceği set **tanımıyla birlikte** giderdi.
- 🚨 `_cevap_anahtari_MUHRU` — **`labels-hakem.json` sha256 mührü** (K19)

**Ve değerleri de oynattı:** H11 **3.7 → 2.9** · H3'ün `uyari`'si düştü ·
H2'nin `onceki`/`kaynak` künyeleri düştü · `_tarih` *"F2 2. tur hakemi"* →
*"Halka 0"* · 🚨 **H10a'ya TABAN ANAHTARI AÇTI** — **iki hakem onu BİLEREK
kapalı bırakmıştı**, çünkü açmak ajanı alanları H10b'den H10a'ya kaçırmaya
iter (§0B'nin reward-hacking maddesi).

**ÖLÇÜLDÜ:** `python3 -m pytest -q` → **10 failed, 23 passed**
(`engine/tests/py/test_cevap_anahtari_muhru.py`). **Hasar sessiz değil** — ama
**güvenlik `pytest`te, betikte DEĞİL**, ve betiğin kendi kullanım satırını
izleyen bir hakem **önce hasarı verir.**

**GERİ ALINDI** (`git checkout --`, blob `cf2af8c7…` doğrulandı, pytest **33**).
**Taban bu turda ELLE, yalnız `H6_konvansiyon` girdisinde düzenlendi.**
**F6'nın DEĞİŞMEZLER'ine girdi: `--taban` KOŞTURULMAZ.**

---

## K61 — 🚨 BORÇ 80: **CIRCIR, TAKİPSİZ VE KAPISIZ BİR İKİLİYİ KOŞUYOR**

`engine/tools/spec-diff.mjs:49` → `engine/dist/stitchu-engine.js`.
**H1 · H2 · H3 · H5 · H8 · H10 · H11 — bu koşunun on iki fazdır yargılandığı
her sayı — o ikiliden çıkıyor.** Ve o dosya **`engine/dist/` altında, yani
GITIGNORE'DA ve TAKİPSİZ** (K32'nin 17 kırmızısının sebebi).

`bundle_fresh_check.sh:46-48` **onu ölçmüyor**; ölçtüğü şey ondan türetilen
**damgalı kopyalar** (`web/vendor/stitchu-engine.js`,
`backend/engine/stitchu-worker.*`).

**HM-6 ölçtü** — dosya bozuldu (`shasum d14d5eb07f73 → 7f33b7c42c05`):

| kapı | hüküm |
|---|---|
| `bundle_fresh_check` | **100% passed — GÖRMEDİ** |
| `generated_ratchet_check` | **100% passed — GÖRMEDİ** |
| `golden_check` | **100% passed — GÖRMEDİ** |
| `engine_check` | **100% passed — GÖRMEDİ** |
| **`hedef_kosu`** | **EXIT 1 (KIRMIZI)** — yalnız bu gördü |

**Yani BOZUK bir dist görülüyor. Ama BAYAT-AMA-GEÇERLİ bir dist** (eski bir
motorun başarılı derlemesi) **hiçbir kapıyı kırmızı yakmaz** ve cırcırın bütün
sayıları sessizce **eski motoru** ölçer.
⚠ **Bayat-ama-geçerli hâl DENENMEDİ — DOĞRULANMADI.**

**İkinci sonuç, hemen kullanılan:** bir **C++ kaynak mutasyonu**,
`build-wasm.sh` (emcc) koşulmadan **cırcıra ULAŞAMAZ.** Hakemin **HM-3**'ü
(`bodice.cpp`'nin `armhole_back` rolü silindi) tam olarak böyle **HÜKÜMSÜZ**
düştü — bir delik değil, bir **yol farkı**. Bundan sonraki her hakem, cırcırı
hedefleyen bir mutasyonu **JS/kontrat tarafında** ya da **wasm'ı yeniden
derleyerek** kurmak zorundadır.

---

## K62 — 🔴 **RİJİTLİK → BÜZGÜ ORANI: HAKEM DE ARADI, HAKEM DE BULAMADI. ÇARPAN 1.0 BİR BOŞLUK DEĞİL, BİR KARARDIR** (DAMLA md.18 karara bağlandı)

Ajan sayıyı **koymadı ve hakeme bıraktı** — §3.10'un tam olarak istediği şey.
Hakem kendi aramasını yaptı (`bending rigidity gather ratio fabric published`),
dönen kalemlerin **hiçbiri** bir eğilme rijitliğini (µNm) bir büzgü oranına
bağlamıyor: KES-F ⇄ FAST karşılaştırmaları, rijitlik ölçüm yöntemleri, "fullness
· stiffness · roughness tutum değerini birlikte etkiler" gibi **nitel** cümleler.
Ajanın 403 alan iki blogu (threadsmagazine, fabrics-store) kumaş **AĞIRLIĞINA**
göre 1.5:1 / 2:1 / 3:1 diyor — o da bir yayın değil ve zaten alıntılanamadı.

**KARAR — HAKEMİN SAYISI: ÇARPAN 1.0. Rijitlik hesaplanır, rehbere basılır,
ÇİZİME DOKUNMAZ.** *Dayanak yok, en kısıtlayıcı seçildi.* Uydurulacak her çarpan
üç kalıbın **geometrisini** künyesiz bir sayıya bağlardı ve golden'ı oynatırdı.

🚨 **VE BUNUN BEDELİ HAKEMİN HANESİNE YAZILIR, AJANIN DEĞİL.** Kart *"3 ÖLÇÜLEBİLİR
farklı kalıp"* istiyordu; ölçüm **2 farklı kalıp + 3 farklı kesim planı** verdi
(poplin ↔ krep: bel **735.0000 = 735.0000**, oyuk **404.2593 = 404.2593**; hakem
kendi koşumunda **DXF ve SVG'yi bayt bayt** karşılaştırdı — `b549b895444f989b` ⇄
`b549b895444f989b`, **birebir aynı dosya**). İki dokumanın berabere kalması
**ajanın eksiği değil, bu kararın sonucudur**: onları ayıracak tek eksen düşüm,
ve düşümün haritasını **hakem de bulamadı.** K58'in emsali birebir geçerli —
tatmin edilemez bir şart, ajanın hanesine yazılmaz.

**Değişecek tek yer:** `contract/fabric-catalog-v1.json` `drape_rule._hakem_karari`.

---

## K63 — 🚨 **ASTM D3107 O ÜÇ SAYIYI SÖYLEMİYOR. ATIF YANLIŞTI VE HAKEM KESTİ; SAYILAR KALDI, ARTIK HAKEMİNDİR**

§3.10: *"Künye ölü linkse veya kaynak o sayıyı söylemiyorsa kart reddedilir."*
Hakem künyeyi **açtı** (`store.astm.org/d3107-07r19.html` ve
`.../d2594_d2594m-21.html`, ikisi de canlı, ikisinin de scope'u birebir çıktı).

**BULGU:** D3107 bir **TEST YÖNTEMİDİR**. Scope birebir: *"These test methods
cover the determination of the amount of fabric stretch, fabric growth, and
fabric recovery…"* — **nasıl ölçüleceğini** tanımlar, **hiçbir kabul eşiği
yayınlamaz**; pass/fail'i ürün şartnamesine bırakır. **D2594 de aynı** (ajan bunu
D2594 için kendi kataloğunda zaten yazmıştı, ama aynı mantığı D3107'ye
uygulamadan geçti). Yani **growth ≤ %3 · toparlanma ≥ %75/15sn · %85/30dk**
sayıları **o standardın sözü değil.**

**KART REDDEDİLMİYOR, ÇÜNKÜ AJAN İDDİA ETMEDİ.** Katalogda
**`DOĞRULANMADI-YARIM`** damgası, `_yayin_bulunamadi` listesinde ayrı bir kalem
ve `GECE7/DAMLA.md`'de §5.5 dökümü vardı: *"üç eşik standardın kendi gövdesinden
doğrulanamadı… standardın gövdesini gören hakem sayıyı değiştirir."* **Bildirmek
ucuz, gizlemek pahalı** — ajan bildirdi.

🚨 **AMA BİR ŞEY GERÇEKTEN YANLIŞTI VE BİR YABANCININ OKUDUĞU SAYFADAYDI.**
`rehber.hpp` şu cümleyi basıyordu: *"The published minimums are 75.0% at 15
seconds, 85.0% at 30 minutes and at most 3.0% growth (ASTM D3107)."*
**Kaynaksız bir cümleden beteri, YANLIŞ kaynaklı bir cümledir** — İŞ 2'nin kapısı
dayanağın **varlığını** sayıyor, **doğruluğunu** değil. Hakem düzeltti (§3.8 md.1).

| | ÖNCE | **SONRA (hakem)** |
|---|---|---|
| rehber cümlesi | *"The **published** minimums are … **(ASTM D3107)**"* | *"Measure it with ASTM D3107 (woven) or D2594 (knit) — those methods define the test but **publish no pass mark, so the floor below is OURS, not theirs**: at least …"* |
| dayanak damgası | `…;astm=3107` | `…;karar=K63;yontem=astm-d3107;yontem2=astm-d2594` |
| eşiklerin yeri | `standards.astm-d3107.esikler` | **`esikler_hakem_karari.esikler`** (üst düzey, atfı kesik) |
| `astm-d3107` bloğu | `esik_kunyesi` (DOĞRULANMADI-YARIM) | **`esik_vermez`** — hakemin birincil kaynak hükmü |
| `fabric_catalog_check` LEG 1 | 7 zorunlu blok | **10** (`esikler_hakem_karari` · `esik_vermez` · `_hakem_karari` eklendi) |
| kapı sayacı | 56 kontrol | **59 kontrol, 0 hata** |

**SAYILAR DEĞİŞMEDİ (3 / 75 / 85) ve gerekçesi *"kartta öyle yazıyordu"* DEĞİL:**
üçü de **kısıtlayıcı yönde** çalışıyor — eşiği yükseltmek daha çok kumaşta negatif
payı **keser**, düşürmek daha çok kumaşta negatif paya **izin verir**. Şüphede
kesmek doğru taraftır. *Dayanak yok, en kısıtlayıcı seçildi.*
**Motor sabitleri (`fabricease.hpp`) tek bayt oynamadı → hiçbir çizim kımıldamadı.**

▸ **YAN KANIT — İŞ 2'NİN KAPISI GERÇEKTEN SIKI.** Hakem düzeltilmiş cümleye
*"or D2594 (knit)"* yazdığı anda `guide_completeness_check` **EXIT 1** verdi:
*"prints the number 2594 which this draft did not compute and no cited source
carries — an invented number"*, **9 fikstürün 9'unda**. Kapı, **hakemin kendi
kalemini** yakaladı. Dayanak damgasına `yontem2=astm-d2594` eklenince yeşil.
Bu, ajanın M2/M3 mutasyonlarından **bağımsız** bir kırmızı kanıtıdır.

---

## K64 — **İŞ 3 YAPILMADI VE YAPILMAMASI DOĞRUDUR. BORÇ 82 GERÇEK, AMA HAKEM DE PAYDAYA DOKUNMUYOR** (F4 hakeminin tuzağı, ikinci kez)

Ajanın ölçümü **doğrulandı**, hakem satırı kendi gözüyle okudu
(`engine/tests/hedef_kosu.mjs:264-266`): çift **rol ADIYLA** kuruluyor —
`byRole.armhole_front` + `byRole.armhole_back` **karşısında** `byRole.sleeve_cap` —
ve `push` **tek bir `if` bloğunun içinde, döngüsüz**. Motor kapağı
`sleeve_cap_front`/`sleeve_cap_back` diye ilan etse **bu satır onları GÖRMEZ.**
🚨 **Kartın *"paydayı büyüten tek yol MOTOR, bu dosya DEĞİL"* cümlesinin yarısı
ÇÜRÜK.** Ajan bunu **kendi aleyhine** yazdı (borç 82) ve mühürlü dosyaya
dokunmadı — **yetkisi yoktu, doğru davrandı.**

**HAKEM DE DOKUNMUYOR, VE SEBEBİ K59'UN AYNISI.** Payda 5→10 yapmak için kapağın
omuz çentiğinde ikiye ilan edilmesi gerek; kapaktaki tek çentik
`sleeve.cpp:230-231` `capHalf*0.60` / `capHeight*0.42` — **künyesiz iki sabit** ve
üstelik **büzgü** çentiği, ön/arka denge çentiği değil. Buğra'nın **ölçülmüş**
çentikleri (`127/412/446`, arka oyuk `arc 87`) **Lower/Upper Sleeve**'in, temel
kapağın değil. Paydayı bugün büyütmek **künyesiz bir sayıya** bağlamak olurdu
(§3.10 ihlali) ya da F4 hakeminin **ayna** tuzağı olurdu — **cırcır süsü.**
**Borç 73'ün kör noktası** (ön +20 / arka −20 mm kusursuz okunur) aynı sebeple
kapanmadı ve `korNokta` olarak **sayısıyla basılmaya devam ediyor.**
`hedef_kosu.mjs` blob **`7370b86d…` — koşu sonunda birebir aynı.**

**F7'YE TAŞINIYOR:** payda 5'in sebebi artık **iki adresli** — motor (rol tek) ve
**kapının kendi kodu** (döngüsüz, ada bağlı). İkisi birden çözülmeden 5 kımıldamaz.

---

## K65 — 🚨 **HAKEMİN KENDİ ÖLÇÜMÜ: ÖRME + KOLLU BİR ELBİSENİN DXF'İ BOŞ İNİYOR. MİRAS KUSUR, AMA F6'NIN VİTRİN KUMAŞI TAM O TUZAĞA BASIYOR**

Sapma sorusu *"inen nesneyi ölç"* diyordu. Hakem indirdi ve **üç kumaşın
üçünü de bayt bayt** karşılaştırdı (`engine/dist` — yani **cırcırın koştuğu**
ikili, borç 80):

| kumaş | DXF | SVG | hüküm |
|---|---|---|---|
| `cotton-poplin` | 28746 B · `b549b895444f989b` | 10204 B · `7e90b32e4d2704c4` | — |
| `viscose-crepe` | 28746 B · `b549b895444f989b` | 10204 B · `7e90b32e4d2704c4` | **iki dokuma BİREBİR AYNI DOSYA** (K62) |
| `single-jersey` | **0 B** · `e3b0c442…` (boş) | 9749 B · `16c8d8f930ef55e4` | 🚨 **DXF İNMİYOR** |

Sebep motorun kendi reddi: `dxfSpecJSON` → **`[cap] Sleeve: cap ease 0.0%
outside the 1-9% window`**, ve `draftJSON` aynı spec için **1 issue** dönüyor.
Örmenin negatif payı kol oyuğunu **404.2593 → 376.5741 mm** küçültüyor, kapak
onunla birlikte küçülmüyor, cap ease **sıfıra çöküyor.**

**MİRAS, F6'NIN ÜRETTİĞİ DEĞİL — ÖLÇÜLDÜ:** `fabricease.hpp`'nin **bant tablosu
(`easeAt`) tek bayt oynamadı**; hakem beş hâl koşturdu ve `fabric:'knit',
fabricStretchPct:50` (**F6-öncesi de kurulabilen** bir spec) **aynı kırmızıyı**
veriyor, `stretchPct:25` bile veriyor (cap ease %1.0). Kolsuz hâl **temiz** (DXF
20885 B). Yani kusur **örme × kollu** kesişiminde ve **F6'dan eskidir.**

🚨 **AMA HİÇBİR KAPI GÖRMÜYOR:** `fabric_catalog_check` kalıbı `draftJSON`'dan
okuyor ve `issues`'a **bakmıyor**; `indir_check` yalnız **dokuma** koşuyor.
Ve F6'nın **üç vitrin kumaşından biri** tam olarak bu hâl.
**KARAR:** kapıya bugün **eklenmiyor** — eklemek **ALTINCI kırmızı** olurdu ve
suçu yanlış karta yazardı (§3.8 md.4 ruhu). **Borç 86 olarak açılıyor ve F7'nin
kartına DEĞİŞMEZ değil, İŞ olarak giriyor.**

---

## K66 — **H8-İFADENİN TABANI 3/5 DEĞİL 2/5. KARTIN TABLOSU YANLIŞTI, AJAN KENDİ ALEYHİNE BİLDİRDİ, HAKEM AJANI HAKLI BULDU**

**Karar:** `H8_ifade`nin F6 sonrası tabanı **PAY = 2/5**'tir (çevrilen giysi
sayısı), 3/5 değil. F7'nin şartı *"pay 3 → en az 4"* idi; gerçekleşen
**2 → 4**, yani kazanç **+1 değil +2**.

**Gerekçe — ölçüm, iddia değil.** `GECE7/F7.md` satır 41
`bugra-buttoned-corset-bustier`'i **✅ ÇEVRİLDİ** listelemişti. Ajan bunu
**kendi aleyhine** bildirdi (kart §HANE, "KARTIN TABLOSUNDA BİR SATIR YANLIŞTI").
Hakem `F6-yesil`'i ayrı bir git worktree'ye açtı ve **mühürlü** betiği
(`expressability_check.mjs`, blob `04c61f03` — iki uçta **aynı bayt**) orada
koşturdu:

```
F6-yesil → operatör kümesi: MOTORDA 3 (op.suppress, op.rotate, op.split)
           ÇEVRİLEMEDİ bugra-locket-top             (attach·derive·overlay·gather)
           ÇEVRİLEMEDİ bugra-buttoned-corset-bustier (attach)      ← KART ✅ DİYORDU
           ÇEVRİLEMEDİ freesewing-aaron              (extend·attach)
           ÇEVRİLDİ    stitchu-sheath-eu38 · freesewing-bella
           H8-İFADE = 3 / 5   (bu sayı ÇEVRİLEMEYENİ sayar)
```

**Ajan haklıydı.** Kartı yazan hakem (yani bu koşunun bir önceki hakemi)
paydadaki bir satırı yanlış işaretlemişti.

⚠ **VE BURADA BİR TUZAK VAR, ADIYLA YAZILIYOR:** betiğin bastığı `H8-İFADE = X/5`
**ÇEVRİLEMEYENİ** sayar; kartın *"hane"* dediği **ÇEVRİLENİ**. **İkisi ters
işaretlidir.** Bundan sonra her kart hangisini kastettiğini **açıkça** yazacak.
Bu turda ikisi de aynı yöne gitti (pay 2→4, basılan 3→1), o yüzden hüküm
etkilenmedi — **ama etkilenebilirdi.**

**Sonuç:** taban **2/5** olarak kayda geçti. Payda **5**, **mühürlü**,
**büyütülmedi ve daraltılmadı** (K17/K31).

---

## K67 — 🚨 **BORÇ 92: "YAYIN BULUNAMADI" YANLIŞTI — YAYIN VAR, HAKEM AÇTI. SAYI KONDU, AMA F7'NİN YERLEŞİMİ AYAKTA KALIYOR**

**Karar (iki parçalı):**

**(1) SAYI KONDU.** Uzat/kısalt çizgisinin yeri **bel (rise) ile etek ucunun tam
ortasıdır** — panelin merkez çizgisi boyunca **%50**. Bugünkü EU38 A-line etek
paneli için (**662.0000 mm**) bu **331.0000 mm**'dir.

**KÜNYE — ve bu bir blog cümlesi değil, bir kalıp yayıncısının kendi dokümanı:**
> *"In general, the best location for lengthening or shortening a dress or shirt
> is halfway between the bottom of the armhole and the hem. **For pants or a
> skirt, the best spot is halfway between the rise/crotch and the hem.**"*
> — Oliver + S, *"Lengthening and Shortening a Pattern"*,
> `oliverands.com/community/blog/2010/02/lengthening-and-shortening-a-pattern.html`

Gerekçesini de aynı sayfa veriyor:
> *"By adding or subtracting length in the middle of the piece, you won't affect
> the hem or the general silhouette as much as you would if you added to the
> bottom of the piece."*

▸ **GÜVEN: MED.** Bu bir kalıp şirketinin yayınlanmış dokümanıdır, **Aldrich
değildir**; `knowledge/drafting-math-eu38.md`'de bu soruya cevap veren satır
**yok** ve Aldrich bu spesifik soru için **açılmadı**. Daha sert bir künye
çıkarsa sayı **değişir**.

**(2) F7'NİN ETEK-UCU YERLEŞİMİ BU TURDA AYAKTA KALIYOR, VE SEBEBİ ÖLÇÜLDÜ.**
Hakem, yayının **istediği amacın** F7'nin yerleşiminde **fiilen sağlandığını**
ölçtü:

| yayının koruduğunu söylediği şey | F7'nin ölçülen sonucu |
|---|---|
| *"won't affect the hem"* | etek ucu yayı **300.5727 → 300.5727 mm** — **tek basamak oynamadı** |
| *"...or the general silhouette"* | etek ucu **eni 299.7000 → 299.7000 mm** — **kloş büyümedi** |
| — | etek ucu dışındaki **her komut BAYT-AYNI**; `Sleeve` · `Bodice Front` · `Bodice Back` **BAYT-AYNI** |

Ve yayının kendi reçetesinin bir **bedeli** var, aynı sayfada yazıyor:
> *"If the edge is curved, you may need to blend the edge, subtracting a bit from
> one line and adding to the other."*

**Blend etmek çizili bir çizgiyi OYNATIR.** Yani %50 yerleşimi, yayının kendi
tarifiyle uygulandığında **F7'nin bugün oynatmadığı** landmarkları oynatır ve
`extend_check` **LEG 4**'ü (*"etek ucu dışındaki her komut bayt-aynı"*) kırmızı
yakar.

**Bu yüzden:** sayı **331.0000 mm olarak İLAN EDİLDİ ve kayda geçti**, ama
taşıma **emredilmedi**. Taşıma yapılacaksa `extend_check` LEG 4'ün *"etek ucu
dışında"* şartı *"EKLENEN ARALIK dışında"* diye yeniden yazılmalıdır — bu bir
kapı tasarımı işidir ve **F8+**'in kuyruğundadır.

▸ **AJANIN DAVRANIŞI YİNE DE DOĞRUYDU:** *"YAYIN BULUNAMADI"* yazıp **en
kısıtlayıcıyı** seçmek §3.10'un tam olarak istediği şeydi. Ajanın tek eksiği
**aramanın kendisiydi**, hükmü değil. **Borç 92 KAPANDI.**

---

## K68 — 🚨 **BORÇ 93: ÖRME KAPAK ÇAPASI KAPISIZ, VE F7'NİN ZEMİNİ ARTIK ONU OKUYOR** (hakemin kendi mutasyonu, HM-1b)

**Karar:** F7'nin borç-86 düzeltmesi **`1-9%` penceresini GEVŞETMEDİ** — bu
doğrulandı, üç ayrı yoldan. **Ama zeminin adresini bir sabitten bir TABLOYA
taşıdı, ve o tablonun örme satırları hiçbir kapıyla pinli değil.**

**Ölçüm.** `validator.cpp` artık `easeFloor = max(0, min(capEaseMin, capEase))`
yazıyor; `capEase` `fabricease.hpp`'nin `kCap` satırından geliyor:
```cpp
inline constexpr AnchorRow kCap = {
    Anchor{0.0, 0.04}, {12.5, 0.02}, {38.0, 0.00}, {63.0, 0.00}, {88.0, 0.00}};
```
`sleeve.hpp:18-21` bunlardan **YALNIZ İKİSİNİ** mühürlüyor —
`easeAt(SleeveCap, 0.0) == capEase` ve `easeAt(SleeveCap, kKnitDefaultPct=12.5)
== knitCapEase`. **`{38.0, ...}` · `{63.0, ...}` · `{88.0, ...}` MÜHÜRSÜZ.**
`fabric_ease_check`'in pinlediği tablo (`:68-74`) **göğüs ve bel** payıdır,
**kapak değil**.

**HM-1 (dokuma çapası 0.04 → 0.004):** **KOD DERLENMEDİ** —
`static_assert ... "woven cap anchor drifted"`. Bir kapıdan **daha sert** mühür.
→ **Dokuma penceresi gevşetilemez. Ajanın "dokumada atıl" iddiası DOĞRU.**

**HM-1b (örme ≥%38 çapası 0.00 → 0.05):** **derleme rc=0**, wasm yeniden
derlendi ve **ikili gerçekten kımıldadı** (`756783b7` → **`b3c896a0`** → geri
`756783b7`), **ve yedi kapı da YEŞİL kaldı**: `fabric_ease_check` ·
`fabric_catalog_check` · `sleeve_check` · `extend_check` · `attach_check` ·
`indir_check` · `hedef_kosu`.

**Bu bir F7 KUSURU DEĞİL, F7'nin AÇTIĞI YÜZEYİN pinlenmemiş kısmıdır:** F7'den
önce o çapa yalnız **hedefi** sürüyordu ve arkasında sert **0.01 zemini**
duruyordu; F7'den sonra **zeminin kendisi**. Yeni sorumluluk, yeni mühür ister.

**F8'in işi (tek satırlık):** `sleeve.hpp`'ye üç `static_assert` daha, ya da
`fabric_ease_check`'in tablosuna bir **kapak** sütunu. **Sayı UYDURULMAZ** —
bugünkü değerler pinlenir, o kadar.

---

## K69 — 🚨 **BORÇ 94: TARAYICI EDİT YOLU KAPISIZ. SAPMA SORUSUNUN CEVABI BUGÜN BİR KAPIYA BAĞLI DEĞİL** (hakemin kendi mutasyonu, HM-2b)

**Karar:** `op.extend` ve `op.attach` **motorda gerçek ve ölçülü** — bu
doğrulandı, hakemin kendi indirmesiyle (4/4 ayrı DXF hash, +100.0000 mm,
parça 6→7, metraj 2.0→2.4). **Ama kullanıcının editinin motora geçtiği JS
teli hiçbir kapı tarafından yargılanmıyor.**

**Ölçüm (HM-2b).** `web/js/engine.js:232-233` — kullanıcının editinin motora
geçtiği **TEK** yer — şu hâle getirildi:
```js
editExtendMM: 0,      // kullanicinin "10 cm uzat"i copte
editAttach: 0,        // kullanicinin "fiyonk ekle"si copte
```
**BEŞ KAPI DA YEŞİL KALDI:** `indir_check` · `hedef_kosu` ·
`expressability_check` · `extend_check` · `attach_check`.

**Sebep yapısal, ve suçlu bir ihmal değil bir sınır:**
- `extend_check` / `attach_check` **C++**'tır ve `GarmentSpec`'i **kendileri**
  kurar — JS telinden **hiç geçmezler**.
- `indir_check` **hiçbir edit alanı set etmez**; 6B bölümü kumaş eksenini ölçer.

**BU BİR ŞART İHLALİ DEĞİLDİR.** Kart §İŞ 1 sürücüyü **kendi eliyle**
*"`engine/dist/stitchu-engine.js` üzerinden sür"* diye yazdı ve ajan tam olarak
onu yaptı; web tarafını da **iddia etmeden** bildirdi (*"bir insan onu
tıklamadı"*). Ama **sapma sorusu** (*"indirdiğimi düzenleyip yeniden
indirebiliyor muyum?"*) bugün **bir kapıya bağlı değil**, ve bu yazılmalı.

▸ **Hakem ayrıca ölçtü, ve bu iyi haber:** canlı `vendor/stitchu-engine.js`'in
sha1'i **`3de441e8`** = repodaki dosyanın sha1'i, yani **bayt bayt aynı**;
canlı `js/create.js` **`editExtendMM` ve `editAttach` taşıyor**;
`stitchu.noseydewdrop.com` **HTTP 200**, `?v=139`. **Hat gerçekten yayında** —
yalnız **kapısı yok** ve **hâlâ tıklanmadı**.

**F8'in işi:** `indir_check`'e bir **edit kolu** — aynı spec'i iki kez indir
(edit'siz / edit'li), **hash'lerinin farklı olduğunu** ve edit'linin **fazladan
bir parça** taşıdığını yargıla. **Tek fonksiyon.**

---

## K70 — **DAMLA md.20: §1.6'nın "`vocab.json`'dan `bugra` değerleri çıkarılır"ı, §0B'nin "sözlük daraltılmaz"ına YENİLİR. §1.6 bir SİLME değil bir KULLANMAMA yasasıdır ve artık KAPILI**

**Ajan karar veremedi ve doğru yaptı** (§3.4): aynı kartın iki satırı çarpışıyordu.
*"`cupSeam: bugra` ve `locketTop: bugra` çıkarılır"* (§1.6) ⇄ *"sözlük daraltmak
§0B ihlali"* + *"F0..F7'nin işi SÖKÜLMEZ"* (DEĞİŞMEZLER). **Karar hakemindir.**

**KARAR: HİÇBİR ŞEY SÖKÜLMEZ. §1.6 KULLANIM YASAĞI OLARAK OKUNUR VE O YASAK KAPILANIR.**

**Gerekçe, üçü de sayıya bağlı:**

1. **Silmenin bedeli ölçüldü ve kartın kendi yasalarını ihlal ediyor.** İki
   değeri `vocab.json`'dan çıkarmak `cupseam.cpp`'nin ~300 satırlık hilal
   konstrüksiyonunu ve `locket.cpp`'nin `bugra::` bloğunu **sökerdi** — F3/F5'in
   sevk edilmiş işi. DEĞİŞMEZLER bunu **açıkça** yasaklıyor.
2. **Ve kapalı bir enum'u daraltmak §0B'nin adıyla saydığı vektördür.** Bu
   koşuda `vocab_reference_check` **tam olarak bunu** korumak için var (K2/K11/K12)
   ve F8'de o kapı bir enum değerinin referansı **bir arttı** diye kırmızı yandı;
   aynı kapının korumaya çalıştığı şeyi hakem eliyle **azaltmak** tutarsız olurdu.
3. **§1.6'nın KORUDUĞU ŞEY silme değil.** Metnin kendi cümlesi: *"Motor
   ezberlemeden, yalnız fotoğraf + prompt ile çizer."* Bu bir **davranış**
   iddiasıdır, bir **envanter** iddiası değil. Ajan ölçtü ve doğru çıktı: harness
   bugün de o preset'lerden **geçmiyordu**, yalnız **hiçbir kapı bunu
   ölçmüyordu**. Şimdi ölçüyor (`bugra_parity_check` §2 kolu, ajanın M4'ü
   `cupSeam: 1 → 2` yapınca **EXIT 1** + parça eksiği **0 → 6**).

▸ **DAMLA'YA GİTMEZ, KOŞU DURMAZ. DAMLA md.20 KAPANDI.**
▸ ⚠ **Ve bu karar bir tavan değil bir zemin: kolun EKSİK olduğu K73'te (borç 98).**

---

## K71 — 🚨 **§0B: BİR SAYIYI ÖLÇÜM ALETİNİ ONARARAK DÜŞÜRMEK MEŞRUDUR — İKİ ŞARTLA. VE F8'İN HANESİ BİR MOTOR KAZANIMI OLARAK YAZILMAZ**

**Soru:** `bugra-parity` bustier parça eksiği **3 → 0** oldu ve motora **tek satır
C++ yazılmadı**. Kazanç motorda değil, aletin onarımındaydı. §0B (reward hacking)
bunu men eder mi?

**KARAR: MEŞRU, AMA İKİ ŞARTA BAĞLI, VE HANE "MOTOR KAZANIMI" DİYE KAYDEDİLMEZ.**

**ŞART 1 — ONARIM, ALETİ DAHA KOLAY DEĞİL DAHA DOĞRU ÖLÇER HÂLE GETİRMİŞ OLACAK,
VE BU BAĞIMSIZ DOĞRULANABİLİR OLACAK.** Burada karşılanıyor, hakem kendi koşturdu:

| ne | ölçüm |
|---|---|
| `GROUPS` arka toplaması kaldırıldı | Buğra'nın arkası harness'ın **kendi `NAMED` tablosunda** iki kayıt (`Back Center` 521×178 · `Back Side` 281×120); motorun arkası da iki panel. Toplama **hiçbir yerde var olmayan** 405×318'lik bir parça imal ediyordu. **Tek başına 3 → 2.** ✅ |
| `topLength: cropped → hip` | Buğra'nın korsesi longline (`Front Center` **327 mm**, kupların ALTINDA). `cropped` bir üstün kup-altı paneli **yoktur** ve bu motorun **kendi kapısında ilan edildi** (`bugra_parity_check`: *"a CROPPED bustier has no below-cup body panel"*, YEŞİL). **2 → 0.** ✅ |

**ŞART 2 — ONARIM SONRASI SAYI, BİR SAYAÇ DEĞİL BİR YAPI TARAFINDAN TAŞINACAK.**
Karşılanıyor, ve **kanıtı hakemin kendi mutasyonu**: sahte bir bölme (`Top Side
Back`'in konturu = `Top Center Back`'inki, `cupseam.cpp`, ajanın **hiç açmadığı**
dosya, `numstat` BOŞ, ikili `762e7286 → 371ad9f4`) **`MOTOR EKSİĞİ: 0` basmaya
devam ediyor** ama kapı **EXIT 1** veriyor: *"696.9 vs 696.9 cm2"*. **Sayı
kandırılabilir, kol kandırılamıyor.** ✅

**AMA — ÜÇ KAYIT DÜŞÜLÜR, ÜÇÜ DE HANENİN ALEYHİNE:**

1. 🚨 **F8'İN HANESİ BİR MOTOR KAZANIMI DEĞİLDİR VE ÖYLE ANILMAZ.** Motorun
   yeteneği bugün F7'deki neyse odur; değişen, ona **doğru sorunun sorulması**dır.
   Bu **değerli** bir iştir (kartı yazan önceki hakemin teşhisi çürüdü) ama
   *"motor üç parça daha çizebiliyor"* **DENMEZ**.
2. **`cropped → hip` bir ALET ONARIMI DEĞİL, SORUNUN DEĞİŞTİRİLMESİDİR** ve bu
   yüzden bir **serbestlik derecesi**dir: hakem ölçtü, üç uzunluk arasında sapma
   **48 puana kadar** oynuyor (`Front Center` −%33 ↔ +%4). Serbestlik derecesi
   **kapılanmadıkça** meşruiyet ajanın niyetine dayanır, ve niyet bir kapı
   değildir. → **borç 98 / K73.**
3. **Ajanın *"kendi aleyhime kötü olanı seçtim"* iddiası ABARTILI.** Hakem altı
   satırın altısını topladı: mutlak sapma **`hip` 295 puan · `tunic` 312 puan**
   — **toplamda `hip` DAHA İYİ**. Ve kartın *"tablodaki EN İYİ uyum"* dediği
   `Back Side` **+%13/+%2** hücresi **`cropped` koşusundandır**; sevk edilen
   `hip`'te o satır **+%85/+%25** okuyor. ⚖ **Gizlenen sayı YOK** — ajan sevk
   edilen altı çiftin altısını da kartın sonunda yazdı, ve §1.6 sapmayı zaten
   hane olmaktan men ediyor. **Kusur ÇERÇEVELEME, saklama değil; hükmü çevirmez.**

▸ **KURAL, GENEL HÂLİYLE:** *"Ölçüm aletini onararak bir sayıyı düşürmek, onarımın
DOĞRULUĞU aletin dışından gösterilebiliyorsa ve düşen sayı bir MUTASYONLA
kırılabilen bir yapıya bağlanıyorsa meşrudur. Bu iki şart yoksa §0B ihlalidir.
Meşru olduğu hâlde bile, kazanç ÖLÇÜLEN NESNEYE değil ÖLÇÜME yazılır."*

---

## K72 — **DAMLA md.19: AL DENE SAYFASI AÇIK. Ajanın seçimi ONAYLANDI**

`KOSU-v7.md` §F8 bunu hakeme bırakmıştı (*"Açık = geri bildirim, davetli =
kontrollü ilk izlenim"*). **KARAR: AÇIK — ve ajanın gerekçesi bir sayıya bağlı,
o yüzden kabul ediliyor.**

`.github/workflows/pages.yml:23` `branches: [main]` + `paths: ['web/**']` →
**her push zaten canlıya çıkıyor.** Bu boru hattında *"davetli"* diye bir hâl
**yoktur**; olabilecek tek şey **linksiz** bir sayfadır, ve linksiz bir sayfa ne
geri bildirim verir ne ilk izlenimi korur — yalnızca **ölçülemez** olur. Yani
"davetli" seçeneği burada bir koruma değil, bir **görünmezlik**tir.

Gerçek koruma **yüzeyde** ve **kapılı**: fotoğraf yükletilmiyor, hesap
istenmiyor, **sıfır ücretli API çağrısı** (§3.9 — `al_dene_check`, ajanın M7'si
kırmızı yakıyor), ve **holdout `11·12·30·35` ile yedek beş `10·14·15·34·36`
sayfaya çıkamıyor** (K16 — ajanın M6'sı `LEAKED: 11-…` ile kırmızı yakıyor).

▸ **DAMLA md.19 KAPANDI.** ⚠ **AMA açık bir sayfanın bedeli var ve F8 onu
ödemedi: borç 99 (K73) canlı ve public bir sayfada duruyor.**

---

## K73 — 🚨 **HAKEMİN AÇTIĞI ÜÇ KALEM: 98 (KÖR KONTROLÜN AYAR VİDASI KAPISIZ) · 99 (CANLI SAYFA KENDİ HAKKINDA YALAN SÖYLÜYOR + ALTI FOTOĞRAFIN CC ŞARTLARI KARŞILANMIYOR) · 100 (D6673 KÜNYESİNDE İKİ DÜZELTME)**

### borç 98 — **`topLength` KAPISIZ, ve o harness'taki TEK gerçek ayar vidasıdır**

Hakemin mutasyonu (**HM-3**), `bugra-parity.mjs` `topLength 'hip' → 'tunic'`:

```
node engine/tests/bugra_parity_check.mjs  ->  rc=0
BUĞRA PARİTE KAPISI: YEŞİL
```

**Hiçbir kapı görmüyor.** Kapının kör-kontrol kolu yalnız `cupSeam` / `locketTop`
ezber preset'lerini okuyor. Oysa uzunluk seçimi sapmaları **48 puana kadar**
oynatıyor. Ajanın *"kör kontrol ayar vidası değildir, o yüzden kötü olanı
seçtim"* disiplini bugün bir **YORUM**, bir kapı değil.
**ŞART (F9):** `bugra_parity_check` harness'ın `draft()` çağrısındaki
`topLength`'i **kaynaktan okuyup** ilan edilen kurala (*"belden uzun olan EN KISA
uzunluk"*) karşı yargılar. **Mutasyonla kanıtlanır.**

### borç 99 — 🔴 **CANLI, PUBLIC SAYFA KENDİSİ HAKKINDA YANLIŞ BİR CÜMLE TAŞIYOR, VE ALTI FOTOĞRAFIN LİSANS ŞARTLARI KARŞILANMIYOR** (§1E)

Canlı metin (`curl` ile doğrulandı, `?v=140`, HTTP 200):

> *"…and every one of them **links back to its source page**."*

`web/al-dene.html:139-141` künyeyi **düz metin** basıyor
(`credit.textContent = author · license`) — **kaynak bağlantısı YOK, lisans URI
YOK**, ve künye `create.html`'e giden bir `<a class="card">`'ın **içinde**.
Veri her ikisini de taşıyor (`kunye.commons_page`, `kunye.license_url`); **sayfa
onları düşürüyor.**

| lisans | fotoğraf | eksik |
|---|---|---|
| CC BY-SA 4.0 / 2.0 | **03 · 02 · 31** | kaynak bağlantısı · lisans URI · **ShareAlike bildirimi** |
| CC BY 2.0 | **04 · 05 · 13** | kaynak bağlantısı · lisans URI |
| CC0 | 01 · 32 · 38 | — (şart yok) |
| *"No restrictions"* | **37** | ⚠ **CC LİSANSI DEĞİL** — kartın *"on CC lisanslı fotoğraf"* cümlesi yanlış, **dokuz** |

⚠ `al_dene_check` **VERİNİN** künye taşıdığını doğruluyor, **SAYFANIN onu
BASTIĞINI** doğrulamıyor: kapı gerçek ama **yanlış tarafı** ölçüyor.

🚨 **BU, `landing_truth_check`'İN VAR OLMA SEBEBİ OLAN KUSUR SINIFIDIR** ve ajan
bu kartta o sınıftan **bir başkasını kendi yakalayıp kökten kapattı** (MTM
cümlesi). Farkı ağırlaştırıyor: MTM cümlesi ÜRÜN hakkında yalan söylüyordu, bu
cümle **SAYFANIN KENDİSİ** hakkında yalan söylüyor ve bedelini **fotoğrafçılar**
ödüyor. **Canlı ve PUBLIC.**

**ŞART (F9 İŞ 0, BAŞKA HİÇBİR ŞEYDEN ÖNCE):** her kartın künyesi
**`commons_page`'e bağlanır**, lisans adı **`license_url`'e bağlanır**, BY-SA
olanlar **ShareAlike'ı adıyla** yazar, künye kartı saran `<a>`'nın **dışına**
alınır; `37` *"CC"* diye anılmaz. **Ve bir KAPI bunu sayfanın DOM'unda ölçer** —
verisinde değil. Cümle ancak **doğru olduktan sonra** sayfada kalır.

### borç 100 — **`dxf.hpp`'nin yeni yorumunda bir cümle yanlış, ve yanlışlığı kusuru KÜÇÜLTÜYOR**

Hakem künyeyi açtı (§3.10). Yayınlanmış DXF-ASTM katman tablosu (Patro 0.3.0,
**canlı**) ajanın **iki sayısını da doğruluyor**: **L8 = "Internal line(s)"**,
**L14 = "Sew line(s)"**, ve 1/4/6/7/15 de birebir tutuyor. **Kart REDDEDİLMİYOR.**

Ama `dxf.hpp` *"pensimiz konvansiyonun **tanımlamadığı** bir katmandaydı"* diyor.
**L11 TANIMLI: "Internal cutout(s)"** — parçanın içinden **kesilip çıkarılan**
delik. Yani pensler tanımsız bir katmanda değil, **"burayı kes ve at"** diyen bir
katmandaydı: kusur yorumun anlattığından **daha pahalıydı**.
▸ Ve: **ASTM D6673-10 2019'da GERİ ÇEKİLDİ** (`store.astm.org` başlığı:
*"(Withdrawn 2019)"*). Sayılar değişmiyor, fiilî değişim biçimi olarak yaşıyor,
ama bir yabancıya yalnız *"ASTM D6673"* demek **eksik** — **K63'ün dersi tam buydu.**
**ŞART (F9):** iki cümle düzeltilir. **Sayı değişmez.**

---

# F9 HAKEMİ — K74…K78 (koşunun SON kararları, 2026-08-27)

## K74 — **§4C md.7'nin "ölçüm tablosu" kolu BUGÜN İHLAL. HÜKÜM: ONAYLANDI, KAPI YOK, DAMLA'YA.**

Ajan bunu **kendi aleyhine** yazdı; hakem **bağımsız ölçtü ve DOĞRU buldu**:
```
https://stitchu.noseydewdrop.com/lib/flat-tables.gen.js   HTTP 200, 76.961 bayt
   -> "_source": "patterns_real/geometry/geometry-full.json -> rings[...]"
   -> "OLCULDU — satin alinmis Bugra Locket EU38 'Back Body' ... 196.13/204.94 = 0.9570"
https://stitchu.noseydewdrop.com/atolye.html              HTTP 200  (:911 aynı yolu anıyor)
```
§4C md.7: *"repoda durmaz, **dağıtılmaz**, **çıktıya sızmaz**."* İkinci ve
üçüncü şart **canlıda ihlal**.

**KARAR — üç parça:**
1. **İhlal GERÇEK, ama F9'un hükmünü ÇEVİRMEZ.** Kaynağı `87fc9d5`, **F0'dan
   önce**; F9 kartı bu tamiri **açıkça yasaklıyor** (*"repoyu private yapmak ya
   da geçmişi kazımak BU KARTIN İŞİ DEĞİL"*). Vitrin kartına mimari ihlal
   yüklemek §3.12'yi taşırır.
2. **AJAN DOĞRU DAVRANDI.** `vitrin_check` md.5'in (a) kolu yalnız `href|src|
   fetch` arıyor; `_source` serbest bir dizge olduğu için geçiyor. Bağlamak
   **ALTINCI KIRMIZI** üretirdi ve faz kapanmazdı. Kapatmak yerine **hükmü
   hakeme getirmek** kartın kendi talimatıdır. **Bu kalem ajanın LEHİNEDİR.**
3. 🚨 **BORÇ OLARAK KAPATILMIYOR — DAMLA'YA GİDİYOR** (`KAPANIS.md` §1.1),
   çünkü çözümü teknik değil ticari: skaleri sayfadan çıkarmak croquis'i
   **kaynaksız** bırakır ve kaynaksız eski değer (78.0u) **geometrik olarak
   imkânsızdı** — *"kaynağı sil"* burada *"yanlış sayıya dön"* demek.

## K75 — **K42 YALNIZ VİTRİNE UYGULANDI. HÜKÜM: F9 İÇİN YETERLİ, KOŞU İÇİN DEĞİL.**

Hakem saydı: **22 dosya, 98 geçiş** (`princess seam` / `prenses dikiş`) `web/`
altında; **canlı landing'de 0**. K42 bir **adlandırma** yasası, F9 bir **vitrin**
kartı — **vitrin temiz.** Kalan geçişlerin çoğu `web/styles/princess-seams.html`
ve koleksiyon sayfalarında ve orada kelime bir **giysi terimi**, **bu kesimin
adı** değil; **K42'nin yasakladığı ikincisidir.** Ayrım yapılmadan toplu `sed`
K42'yi **yanlış yere uygular**. **BORÇ 102 açıldı.**

## K76 — **BORÇ 73: GÖRÜNÜR YARISI KAPANDI. KÖK AÇIK. `hedef_kosu.mjs`'İ HAKEM DEĞİŞTİRDİ.**

**Borç 73 on bir karttır hakem masasındaydı ve on bir kart da yanlış yere baktı.**
Ölçüm:
```
grep -n korNokta engine/tests/hedef_kosu.mjs   ->  TEK SATIR (282), ATAMANIN KENDİSİ
```
`r.korNokta` **hiçbir yerde okunmuyordu.** Yanındaki yorumun *"kör nokta burada
SAYIYLA basılıyor ki gizli kalmasın"* cümlesi **F4'ten beri YANLIŞTI** —
hesaplanıp **düşürülüyordu**.

**KARAR:** hakem (§3.8 md.1'in kendi izniyle, faz ajanı değil) **yalnız bir
`console.log` bloğu** ekledi. Sonuç ilk kez göründü:
**ön oyuk 214.97 mm · arka oyuk 196.03 mm · fark 18.94 mm** (beşte dördünde;
beşincisi 9.24 mm). **H5 = "0 eşleşmeyen çift" bunu GÖRMÜYOR** ve göremediği
tam olarak borç 73'ün cümlesiydi.

**KÖK AÇIK KALIYOR ve adıyla yazıldı:** `sleeve_cap` motorda **TEK ve
BÖLÜNMEMİŞ** bir yay (`sleeve.cpp:194`, `locket.cpp:379`); hangi yarısının ön
oyuğa gittiğini söyleyen **beyan yok**, uydurmak **§3.10 ihlali**. Kapatmanın
tek yolu **motorun kapağı omuz çentiğinde ikiye ilan etmesi** — bir **faz işi**.

**BEDELİ YAZILIYOR:** `engine/tests/hedef_kosu.mjs` blob'u **`7370b86d`'den
değişti**. **Hiçbir eşik gevşetilmedi, hiçbir taban kesilmedi**, H5 **0/5**'te,
`CIRCIR SAĞLAM`, `vitrin_check`/`landing_truth_check`/`gen-vitrin` ayrıştırıcısı
**EXIT 0** (yeni blok iki cırcır bloğunun **DIŞINA** basılıyor).

## K77 — **ÜÇ YENİ BORÇ AÇILDI (F9 hakemi)**

- **101** — `dxf.hpp:54-55` katman tablosunu **`D6673-10 §3.1.4`/`§3.1.5`** diye
  anıyor. **Birincil ASTM metninde tablo §4.3'tedir** (§3 *Terminology*).
  Borç 100 iki cümleyi düzeltirken **üçüncü bir yanlış bölüm numarası** bıraktı,
  ve bu tam da bir **künye kesinliği** kartıydı. Sayı taşımıyor, hükmü çevirmiyor.
- **102** — K42 (bkz. K75).
- **103** — 🚨 **`web/vendor/stitchu-engine.js` YENİDEN ÜRETİLEBİLİR DEĞİL.**
  F8 `5e1958dc` ölçmüştü, bugün **`a0bb1844`**, ve değişikliğin tek kaynağı
  `dxf.hpp`'nin **YORUMU**. `engine/dist` **tam olarak `762e7286`'da kaldı**
  (hakemin HM-5'i gidip **bayt bayt geri geldiğini** gösterdi). Sayı değişmedi
  (`golden` `a3ec26a6`, `hedef_kosu` yeşil), ama ***"ikili bayt bayt aynı"* bir
  daha `web/vendor` için SÖYLENEMEZ.**

## K78 — 🚨 **KARTIN 9. MADDESİNİN VARSAYIMI ÖLÇÜMLE ÇÜRÜDÜ: SAYFA YABANCI FOTOĞRAFI REDDETMİYOR.**

Kart, §3.9'un doğru sonucunun *"yabancı fotoğraf yüklenemiyor"* olduğunu
varsayıyordu. **Hakem ölçtü — öyle değil:**
```
web/js/config.js:4   BACKEND_URL = 'https://stitchu-api.damummyphus.workers.dev'   (DOLU)
web/js/analyze.js:5  photoAvailable = () => Boolean(BACKEND_URL)   ->  TRUE
web/js/create.js:779 if (photoAvailable()) { ... yükleme düğmesi GÖSTERİLİYOR }

GET  /api/analyze                                        -> 401 {"error":"Unauthorized"}
POST /api/analyze  (Origin: stitchu.nosey…, gövde {}, GÖRSEL YOK)
                                                         -> 400 {"error":"Invalid request"}
```
**400, 401 değil** — Worker sitenin isteğini **kabul ediyor** ve modele gitmeden
**önce doğruluyor**. Yani **bir yabancı bugün canlı sayfaya kendi fotoğrafını
yükleyebilir ve bu Damla'nın hesabından ücretli bir çağrı harcar.**

**KARAR:**
1. **§3.9 İHLAL EDİLMEDİ.** §3.9 **KOŞUYA** sıfır ücretli çağrı şart koşuyor ve
   koşu boyunca **sıfır** harcandı (`al_dene` bankalı, `hedef_kosu` mühürlü
   fixture, hakem yalnız **görselsiz** bir 400 probu attı). **Risk KOŞUDA değil,
   CANLI SİTEDE ve tanımadığın insanlarda.**
2. **VİTRİN ÖRTMÜYOR AMA İLAN DA ETMİYOR.** Canlı landing *"upload a photo"*u
   iki kez yazıyor ve doğru yazıyor; ama **bu yolun Damla'ya paraya mal olduğu,
   bir kotası olduğu ya da kapatılabileceği hiçbir yerde yazmıyor.**
   `analyze.js` bir 429 mesajı taşıyor, yani **bir kota VAR — sayısı
   yayınlanmıyor ve hakem ölçmedi.**
3. 🚨 **BU BİR İŞ KARARIDIR → DAMLA'YA.** Hakem **hiçbir şeyi değiştirmedi**;
   `BACKEND_URL`'i boşaltmak fotoğraf yolunu **tamamen** öldürürdü ve bu bir
   ürün kararıdır.
⚠ **Uçtan uca gerçek bir yükleme YAPILMADI** (para harcardı). **DOĞRULANMADI.**
