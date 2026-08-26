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
