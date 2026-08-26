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
