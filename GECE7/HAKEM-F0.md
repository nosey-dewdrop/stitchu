# HAKEM — F0 hükmü: **KALDI** (2026-08-26)

Commit `cd3bea3`. Geri alma etiketi `F0-oncesi` (= `1e5d989`).
Bu hakem F0'da iş yapmadı; her sayı aşağıda kendi koşusundan çıktı.

---

## TEK SATIR

⛔ **KALDI — YEDİNCİ KIRMIZI VAR VE KART ONU YEŞİL DİYE YAZMIŞ.**
`vocab_reference_check` **FAIL** (`hemFlounce 26 → 27`), sebebi F0'ın kendi
eklediği tek bir dize sabiti; kartın DEĞİŞMEZLER bölümü *"Yedinci ad = faz
kapanmaz"* diyor, kartın ölçüm tablosu ise aynı kapıyı **"YEŞİL"** diye
bildiriyor. İşin geri kalanı gerçek ve ölçüldü — o yüzden **GERİ AL değil.**

---

## 1. ÖLÇÜLEN — hakemin kendi komutları

```
cmake --build engine/build -j8                          -> exit 0
ctest --test-dir engine/build --output-on-failure       -> 7 failed out of 119   ⛔
ctest --test-dir engine/build -R hedef_kosu             -> Passed, CIRCIR SAĞLAM
node engine/tests/hedef_kosu.mjs                        -> EXIT 0
node engine/tests/indir_check.mjs                       -> EXIT 0 (İNDİR KAPISI: YEŞİL)
git status --porcelain                                  -> ` M KOSU-v7.md` + 3 untracked patterns_real/
```

### ctest — 7 kırmızı, 6 değil

| # | ad | miras mı? |
|---|---|---|
| 9 | `flat_pattern_agree_check` | miras |
| 13 | `flat_artifact_census` | miras |
| 14 | `style_check` | miras |
| 21 | `sizechart_source_check` | miras |
| 92 | `contract_check` | miras (ilan edilmiş karar) |
| 98 | `figure_check` | miras |
| **116** | **`vocab_reference_check`** | ⛔ **YENİ — F0'ın doğurduğu YEDİNCİ AD** |

Toplam süre 273.05 sn · `ctest -N` = 120 · DISABLED 1 (`h10_gate_check`) ·
koşan 119. Yeni test eklenmemiş (doğru), **ama yeni kırmızı eklenmiş.**

---

## 2. YEDİNCİ KIRMIZI — kök sebebe indirildi, tek satır

Kapının çıktısı:

```
FAIL ARTTI  eksen ADI   hemFlounce   26 ->  27  (+1)
HUKUM: FAIL (1 artan, 0 yeni)
Kapali bir enuma YENI referans eklendi. Sozluk buyumez, kucululur.
```

**Bu bir salınım ya da bayat taban değil. Ayrı worktree'de iki uçtan ölçüldü:**

```
git worktree add --detach /tmp/hakem-f0-oncesi F0-oncesi
  bash engine/tests/vocab_reference_check.sh   ->  HUKUM: YESIL
çalışan ağaç (cd3bea3)
  bash engine/tests/vocab_reference_check.sh   ->  HUKUM: FAIL (hemFlounce +1)
```

Kapsam içinde dosya dosya `grep -rIn -w hemFlounce` sayımı; **tek fark**:

| dosya | F0-oncesi | cd3bea3 |
|---|---|---|
| `web/js/create.js` | 2 | **3** |
| diğer 15 dosya | aynı | aynı |
| **toplam** | **26** | **27** |

Suçlu satır, F0'ın kendi eklediği satır — `web/js/create.js:178`:

```js
const KOKEN_ALANLARI = [...new Set([
  ...Object.keys(spec), ...SPEC_GROUPS.map((g) => g.key), 'hemFlounce', 'beden',
])];
//                                                        ^^^^^^^^^^^^ +1
```

**Kusurun boyu bir dize sabitidir.** Bu, hükmü hafifletmez — kapının koruduğu
şey tam olarak budur (*"kapalı bir enuma YENİ referans"*) — ama F0'ın özünü
boşaltmaz, o yüzden hüküm KALDI'dır, GERİ AL değildir.

### Kart neden yeşil sandı — ölçülebilir hata

Kart şunu yazmış: *"`vocab_reference_check` **YEŞİL**, `provenance.js` SCOPE
içinde ve `garment` sayısı **0**"*. Ajan **`garment` eksenine** bakmış
(1137 / taban 1186, doğru sayı). Ama kapı **37 ekseni + 92 kelimeyi** birden
cırcırlıyor; yükselen eksen `garment` değil **`hemFlounce`**. Tek ekseni ölçüp
kapının tamamı için "YEŞİL" demek, kapıyı koşturmamakla aynı sonucu verdi.
**Ajan `vocab_reference_check`'i hiç koşturmamış** — koştursa üç satırda görürdü.

Aynı sınıf hata bu koşuda **ikinci kez** oluyor: `b791db5` (F-İNDİR 1. tur)
hükmü de *"kartın bildirmediği yedinci kırmızı"* idi. Emsal KALDI'dır.

---

## 3. TABAN YENİDEN KESİLMEDİ — ve kesilmeyecek

Kapının kendi çıktısı bir kaçış yolu öneriyor: *"Bu gerçekten bir kapsam kararı
ise: tabanı elle yeniden kes"*. **Reddedildi.** K2 zaten yürürlükte
(*"`vocab_reference_check` tabanı YENİDEN KESİLMEYECEK"*), ve bir fazı
kurtarmak için tabanı kesmek §3.8 md.4'ün tarif ettiği patolojinin ta kendisi.
Karar `KARARLAR.md` **K11**.

---

## 4. AJANIN SEKİZ İDDİASI — teker teker ölçüldü

### İddia 1 — etiket değerin yazıldığı satırda, ve İNEN DOSYANIN üstünde ✅ **DOĞRU**

Kartın cümlesine değil, **artefaktın kendisine** bakıldı.

`Logs/indir-check/stitchu-dress-aline-flat-koken.svg`, **birinci satır**:

```
data-koken-toplam="10" data-koken-cikarildi="8"
data-koken-alanlar="fabric garment shaping skirtLength sleeveLength sleeveStyle topLength waistline"
```

`Logs/indir-check/stitchu-dress-aline-a4-koken.pdf.png` — **PNG açıldı, göze
bakıldı** (hakem, ekran görüntüsü değil dosyanın kendisi). A4 kapağında,
"Assembly" ile kalibrasyon karesinin arasında, kendi başlığıyla:

> **Origin / Köken**
> 8 of 10 fields were NOT visible in the photo and were derived from rules
> (the simplest reading was chosen): fabric, garment, shaping, skirtLength,
> sleeveLength, sleeveStyle, topLength, waistline. Everything else came from
> the photo or from your own picks.

`pdftotext` de aynı bloğu döküyor. Yani **evet: kullanıcı bunu logda değil,
kendi diskindeki dosyanın üstünde, internetsiz, yazıcıdan çıkmış kâğıtta
görüyor.** Bu fazın esas iddiası ve **tutuyor.**

Sevk edilen yolda da bağlı (kod okundu, `web/js/create.js`):
`saveA4Pdf(..., koken, KOKEN_ALANLARI)` (satır 974) ·
`saveFlatSVG(..., koken, KOKEN_ALANLARI)` (satır 995) ·
`.dl-koken` satırı **butonlardan ÖNCE** `panel`'e ekleniyor (satır 947), yani
**tıklamadan önce.** Ölçülen kapsam: kayıt **38 eksen** taşıyor
(`Object.keys(spec)` 32 + 6 grup anahtarı + `hemFlounce` + `beden`),
etiketleme çağrısı **50 yerde**.

### İddia 2 — `cikarildi` H10a/H10b'ye bölünebilir, ama bölünmemiş ✅ **DOĞRU**

Şema gerçekten iki eksenli, tek kova değil. `web/js/provenance.js:39`:
`GORUNURLUKLER = ['gorunur', 'gorunmez', 'bilinmiyor']`, ve her kayıt
`{ kaynak, gorunurluk, not }`. `isaretle()` görünürlüğü kabul ediyor,
`dogrula()` onu doğruluyor. F2 `cikarildi`'yı **çağrı yerlerini sökmeden**
ikiye ayırabilir. Kapı hem bölünebilirliği hem bölünmemişliği ayrı ayrı
ölçüyor (`indir_check.mjs` §10-c). F0 hiçbir şeyi bölmedi — doğru davranış,
K5 böyle emrediyordu.

### İddia 3 — §10 KÖKEN, 7 mutasyonun 7'si kırmızı, M5 kaçtı ✅ **DOĞRU + hakem kendi koşturdu**

Loga güvenilmedi. **Hakem BEŞ ayrı mutasyon koşturdu; ikisi ajanın hiç
dokunmadığı dosyada (`web/js/download.js`):**

| # | dosya | mutasyon | sonuç |
|---|---|---|---|
| H-M1 | **`download.js`** ⭐ | `flatSVG` damgayı sessizce atlar, ham SVG döner | **EXIT 8** |
| H-M2 | **`download.js`** ⭐ | `patternA4Pdf` kapağa köken bloğunu vermez (`ilan = null`) | **EXIT 8** |
| H-M3 | `provenance.js` | `ilanEdilecek` `cikarildi` alanlarını gizler, sayıyı küçültür | **EXIT 8** |
| H-M4 | `create.js` | köken kaydı iki yazıcıya da VERİLMEZ (argümansız çağrı) | **EXIT 8** |
| H-M5 | `create.js` | foto dalında bir eksen etiketsiz yazılır (`fotoSet` → düz atama) | **EXIT 8** |
| — | hepsi geri alındı | temiz ağaç | **EXIT 0** |

⭐ **`download.js` ajanın mutasyon listesinde YOK.** Kapı yine de yakaladı.
**Bu kapı gerçek.** "Kağıt üstünde kapı" şüphesi ölçüyle düştü.

**M5 hikâyesi doğrulandı: KAPI sıkıldı, KOD gevşetilmedi.**
`git diff F0-oncesi HEAD -- engine/tests/indir_check.mjs`'te silinen **iki
satır var ve ikisi de `console.log`** (genişletilmiş halleriyle değiştirilmiş).
Hiçbir eşik, hiçbir şart gevşetilmedi. Kapının §10-(i) şartı bugün etiketin
**yanında durduğu alanın ADINI taşımasını** istiyor ve pencere satır+1'e
inmiş — bu **sıkılaştırma**. Kaynak kodda `fotoSet` çağrıları duruyor.
İtiraf dürüst ve ölçüyle uyumlu.

### İddia 4 — kapı değil kendi kodu geri alındı ✅ **DOĞRU**

`web/js/create.js:510-511`:

```js
if (fullness) spec.skirtStyle = fullness;              // photo_ratio_wire_check'in birebir şart koştuğu satır
if (fullness) isaretle(koken, 'skirtStyle', 'gorulen'); // köken etiketi bir alt satıra alındı
```

`engine/tests/photo_ratio_wire_check.mjs` **F0'ın diff'inde hiç yok**
(`git diff --name-status F0-oncesi HEAD` → 8 dosya, o dosya yok). Eşik
gevşetilmemiş, regex genişletilmemiş. **Geri alınan iş = `skirtStyle`'ı
`fotoSet`'ten geçirmek**; yerine aynı etiket bir satır aşağıda konmuş, yani
**köken kaydı kaybolmadı, sadece yazılış biçimi değişti.** F0'ın özünü
boşaltmıyor. §3.8 md.4'e uyum: **tam.**

### İddia 5 — ctest 6 kırmızı, tam miras altı ⛔ **YANLIŞ**

**7 kırmızı.** §2'ye bakınız. Kartın *"6 kırmızı / 119 koşan (aynı altı ad)"*
satırı ölçümle çelişiyor. Hükmün sebebi budur.

### İddia 6 — `hedef_kosu` yeşil, cırcır sağlam ✅ **DOĞRU**

Hakem koşturdu (`node engine/tests/hedef_kosu.mjs`, EXIT 0):

| H1 | H2 | H3 | H5 | H8 | H10 | H11 |
|----|----|----|----|----|-----|-----|
| 5/5 · n=5 | %92.2 · n=5 (47/51) | 4 · n=5 | 0 · n=5 | 31 · n=5 | %58.3 · n=5 (70/120) | 3.1 ms · n=5 |

`CIRCIR SAĞLAM — hiçbir sayı kötüleşmedi.` Taban dosyası el değmemiş,
**ölçüldü**: `git log --oneline -- contract/hedef-kosu-taban.json` → tek commit
`f56941e` (Halka 0). `engine/tests/hedef_kosu.mjs` de aynı: tek commit.
§3.8 md.1'e uyum: **tam.**

### İddia 7 — H1 yükselmedi, ajan yükselttiğini iddia etmiyor ✅ **MAZERET DEĞİL, ama fazın hanesi de boş**

**Karar ve sayısı:** H1 = **5/5**, n=5. Bu bir **tavan**: mühürlü fikstürde
beş girdinin beşi de kalıp+flat üretiyor, **yükselebileceği tek bir birim
yok.** Bir sayının %100'den yukarı çıkmasını bekleyip fazı onunla yargılamak
ölçüm hatası olur. Kartın "yükselttiğimi söylemiyorum" cümlesi **dürüst.**

Ama dürüstlük bir iyileşme değildir, o yüzden ikinci kez ölçtüm:
**F0 §3.6'nın altı sayısının HİÇBİRİNİ oynatmadı** (hepsi önce = sonra).
Bu tek başına fazı düşürmez — çünkü:

- **F0 kartını hakem yeniden yazdı** (§3.7, `KARARLAR.md` K8) ve fazın
  gerekçesini H1'e değil **H10 = %58.3** ile **H3 = 4**'e bağladı.
- **H10 bu fazda düşemezdi ve düşmemeliydi.** §0B: *"motor her alanı doldurur,
  boş çıktı yoktur"* — cezalandırılan çıkarmak değil, **sessizce** çıkarmak.
  F0'ın işi %58.3'ü küçültmek değil, onu **söyletmek**ti.
- **H3 = 4 ise ölçülebilir bir sebeple düşmedi:** ilan kanalı `web/js/` hattına
  kuruldu, `hedef_kosu.mjs` ise **ölçüm hattını** sayıyor. İki hat aynı kaydı
  paylaşmıyor (ajanın kendi 13. borç maddesi, doğru teşhis).

**Fazın gerçek iyileşmesi altı sayının içinde değil, artefaktın üstünde ve
hakemin kendi grep'iyle sayıldı:**

| ölçüm (hakemin kendi komutu) | `F-INDIR-yesil` | `cd3bea3` |
|---|---|---|
| inen dosyaların kaçı kökenini söylüyor | **0 / 5** | **2 / 5** (A4 PDF + flat SVG) |
| inen flat SVG kökünde köken özniteliği | yok | `data-koken-cikarildi="8"` + 8 ad |
| A4 kapağında köken bloğu | yok | `Origin / Köken` + 8 ad (**göze bakıldı**) |
| sevk edilen kayıtta etiketli eksen | **0** | **38** |
| etiketleme çağrı yeri (`create.js`) | 0 | **50** |

**Hüküm:** faz hedefe **yaklaştı** ve sapma sorusunun cevabı EVET'tir (§5).
Düşmesinin sebebi sapma değil, **yedinci kırmızı**.

### İddia 8 — 6 yeni borç + devredilen 9 ✅ **GERÇEK BORÇ, kibarlık değil**

Dokuzu silinmemiş, devredilmiş (doğrulandı). Yeni altısını okudum; hepsi
**ölçülebilir ve doğrulanabilir bir eksiği adıyla söylüyor**, ve üçü ajanın
kendi aleyhine:

- **md.10-11 (`belirsiz` / `uydurma` üretilmiyor)** — gerçek. `provenance.js`
  altı etiket tanımlıyor, sevk edilen yol **dördünü** üretiyor. Kapının
  ölçmediği bir boşluk, ve ajan "YAYIN BULUNAMADI" deyip **sayı uydurmamış**
  (§3.10'a uyum, doğru davranış).
- **md.13 (iki yerde iki karar)** — gerçek ve İddia 7'nin H3 açıklamasının
  kökü. F2'nin işi.
- **md.14 (kapı 10 eksende koşuyor, sevkiyat 38'de)** — **doğru ve hakem
  saydı: 38.** Mekanizma kanıtlı, ölçek kanıtlı değil. Kaynak-seviyesi
  §10-(h)/(i) şartları boşluğu kısmen kapatıyor (sevk edilen `create.js`
  üstünde koşuyorlar), tamamen değil.
- **md.15 (gerçek tarayıcıda tıklanmadı)** — dürüst, **DOĞRULANMADI** etiketi
  doğru konmuş. Hakem de tıklayamadı: repoda headless harness yok.

Borç listesi **kabul**, F2'ye 15 madde olarak devrediyor.

---

## 5. SAPMA SORUSU — cevap ÖLÇÜLDÜ

> *"Bir yabancı fotoğraf yükleyip kalıp + flat indirebiliyor muyum, ve
> indirdiğim şeyin hangi alanının nereden geldiğini görebiliyor muyum?
> Bir önceki fazdan daha mı iyi?"*

**EVET — ve kartın cümlesiyle değil, iki dosya yoluyla:**

1. **Kalıp + flat hâlâ iniyor.** `indir_check` 1-9. bölümleri yeşil, 7 dosya
   `Logs/indir-check/` altında. F0 bunu bozmadı.
2. **Hangi alanın nereden geldiği DOSYANIN İÇİNDE:**
   `stitchu-dress-aline-flat-koken.svg` birinci satırında 8 alanın adı ·
   `stitchu-dress-aline-a4-koken.pdf` kapağında `Origin / Köken` bloğu,
   **hakem PNG'sini açtı ve gözüyle okudu.**
3. **Öncekinden iyi, farkı bir sayı taşıyor:** inen dosyaların kökenini
   söyleyeni **0/5 → 2/5**; sevk edilen kayıtta etiketli eksen **0 → 38**.

**"Hayır ama altyapı hazırlandı" DEĞİL. Faz SAPMADI.**
O yüzden hüküm **GERİ AL değil, KALDI**: iş duruyor, tek satır düzeltilecek.

---

## 6. HÜKÜM VE GEREKÇE

⛔ **KALDI.**

**Tek gerekçe, tek sayı:** `vocab_reference_check` **26 → 27**.
Kart bunu **YEŞİL** diye bildirdi; ölçüm **FAIL** diyor. F0 kartının kendi
DEĞİŞMEZLER bölümü: *"ctest kırmızı kümesi miras altıyı geçemez … **Yedinci
ad = faz kapanmaz.**"* Kartın kendi şartı, kartın kendi ihlali.

**Yapılmayanlar ve sebepleri:**
- **`git tag F0-yesil` ATILMADI.** Site `F-INDIR-yesil`'den sevk edilmeye
  devam eder (§3.5).
- **`git reset --hard F0-oncesi` YAPILMADI.** Ölçüldü: fazın ürünü gerçek
  (§1 İddia 1, §5), kusur bir dize sabiti. Doğrulanmış işi tek satır için
  yakmak §0'ın ihlali olurdu.
- **Taban yeniden kesilmedi** (§3, K11).
- **Hedef değişmedi** (§3.7 — hakemin yapamayacağı tek şey).

**F0 İKİNCİ TUR açılır.** Kart `GECE7/F0.md` sonuna hakem tarafından yazıldı.
Tek bir işi var. F2 **başlamaz** — F0 yeşillenene kadar `GECE7/F2.md`
yazılmadı; F2'nin şef emri iki maddesi §7'de kayıt altına alındı, kaybolmasın.

---

## 7. F2'YE DEVREDEN — şef emri, KAYBOLMAYACAK

F0 ikinci tur yeşillendiğinde F2 kartı bu iki maddeyle açılır (Damla'nın emri,
`DURUM.md` "İKİ DÜZELTME"):

**(a) F2'nin İLK işi §1F fotoğraf havuzu.** `_dropped` 10 dosya diskten silinir,
havuz **19'a** iner, kalan 19'un künyeleri (Commons URL · yazar · lisans)
`dataset/hedef-10/KAYNAK.md`'ye yazılır, künyesiz dosya havuzdan çıkar.
**Doğru cevapları HAKEM etiketler** — H2'nin doğru cevabı makine etiketi
olmaktan çıkar. F2'nin başka hiçbir işi bu bitmeden başlamaz.
▸ Bağlı sayı: H2 bugün **%92.2, n=5**, ve `hedef_kosu` çıktısının kendi
uyarısı: *"göz etiketi Fable tarafından gözle konuldu, İNSAN etiketi değil"*.
H1'in **5/5 tavanından kımıldayabileceği tek yer de burasıdır** (n=5 → n=10+).

**(b) H10 ikiye ayrılır.** H10a (fotoğrafta görünmesi imkânsız — arka, iç,
örtülü) **cırcıra bağlanmaz**; H10b (görünen ama alınamayan) **cırcıra
bağlanır** ve §0B tavanı H10b'ye uygulanır. F2 iki sayıyı da `n`'siyle basar.
**Tabanı yalnız hakem günceller** (§3.8 md.1).
▸ Ham madde hazır ve ölçüldü: `provenance.js`'in `gorunurluk` ekseni
(`gorunur`/`gorunmez`/`bilinmiyor`), bugün 38 eksende `bilinmiyor`.
Bugünkü ayrışmamış taban: **H10 = %58.3, n=5 (70/120)**.

**(c) Hakemin eklediği üçüncü madde — H3'ün düşebilmesi için:**
`hedef_kosu.mjs` ile `provenance.js` bugün "hangi alan fotoğraftan geldi"
kararını iki ayrı yerde veriyor (ajanın 13. borcu). H3 = 4 bu yüzden düşemedi.
F2 ilan kanalını **ölçüm hattına** bağlar; bağlarsa H3 düşer ve **iyileşme
F2'nin hanesine yazılır** (K9).

**Devreden borç: 15 madde** — F-İNDİR'in 9'u (`HAKEM-F-INDIR.md` sonu) +
F0'ın 6'sı (`GECE7/F0.md`, md.10-15). Hiçbiri kapatılmadı, hiçbiri silinmedi.

---

## 8. HAKEMİN KOŞTURDUĞU KOMUTLAR (tekrar üretilebilir)

```
cmake --build engine/build -j8                                  # exit 0
ctest --test-dir engine/build --output-on-failure               # 7 failed out of 119  ⛔
ctest --test-dir engine/build -R hedef_kosu                     # Passed
node engine/tests/hedef_kosu.mjs                                # EXIT 0, CIRCIR SAĞLAM
node engine/tests/indir_check.mjs                               # EXIT 0, İNDİR KAPISI: YEŞİL
bash engine/tests/vocab_reference_check.sh                      # FAIL: hemFlounce 26->27
git worktree add --detach /tmp/hakem-f0-oncesi F0-oncesi
  bash engine/tests/vocab_reference_check.sh                    # YESIL   <- iki uçtan ölçüldü
grep -rIn -w hemFlounce <SCOPE> | cut -d: -f1 | sort | uniq -c  # tek fark: create.js 2 -> 3
git log --oneline -- contract/hedef-kosu-taban.json             # tek commit f56941e (Halka 0)
git log --oneline -3 -- engine/tests/hedef_kosu.mjs             # tek commit f56941e
git diff --name-status F0-oncesi HEAD                           # 8 dosya; photo_ratio_wire_check YOK
git diff F0-oncesi HEAD -- engine/tests/indir_check.mjs | grep '^-'   # 2 satır, ikisi de console.log
pdftotext Logs/indir-check/stitchu-dress-aline-a4-koken.pdf -   # "Origin / Koken" + 8 ad
Read Logs/indir-check/stitchu-dress-aline-a4-koken.pdf.png      # GÖZE BAKILDI
node -e '<KOKEN_ALANLARI sayımı>'                               # 38 eksen
grep -oE '\b(fotoSet|konakSet|isaretle|elleSet)\(' web/js/create.js | wc -l   # 50
# + BEŞ MUTASYON (download.js x2, provenance.js, create.js x2)
#   beşi de EXIT 8; hepsi geri alındı; temiz ağaç EXIT 0
gh api repos/nosey-dewdrop/stitchu --jq '{visibility,private}'  # PUBLIC  🚨
curl -sI raw.githubusercontent.com/.../patterns_real/.../A0.pdf # HTTP 200 (anonim)  🚨
```

---

## 9. GÖREMEDİĞİM / ÖLÇEMEDİĞİM

Devreden 15 maddeye ek olarak, **bu turda hakemin kendi kör noktaları**:

- **Gerçek tarayıcıda hiç tıklanmadı.** `.dl-koken` satırı ve indirme
  butonları yalnız DOM taklidiyle koştu. Chrome/Safari'de kullanıcı gerçekten
  bu cümleyi görüyor mu — **DOĞRULANMADI.**
- **Sevk edilen 38 eksenlik kayıtta köken etiketlerinin DOĞRU olduğu
  ölçülmedi.** Ölçülen şey: etiket var, yutturulamıyor, dosyaya ulaşıyor.
  Bir eksenin `gorulen` yerine `cikarildi` yazıp yazmadığı (ya da tersi)
  **hiçbir kapıda ölçülmüyor** — §0B'nin reward-hacking maddesi tam olarak
  bunu uyarıyor: *"görünen bir alanı `cikarildi` işaretlemek hatadır"*.
  **DOĞRULANMADI, ve bu F2'nin H10a/H10b işinin ön şartıdır.**
- **Miras 6 kırmızının hiçbiri bu turda da kök sebebe indirilmedi**; yalnız
  büyümedikleri kontrol edildi (ve büyüdüler — yedinciyle).
- **`indir_check` §10'un (a)-(g) kalemleri 10 eksenlik referans spec üstünde
  koşuyor**, sevk edilen 38 eksen üstünde değil. Ajanın 14. borcu; hakem
  saydı, doğru.
- **A0 PDF, DXF ve düz kalıp SVG'si köken taşımıyor** — inen 5 dosyanın
  **3'ü hâlâ sessiz.** Ajanın 12. borcu DXF/A0/kalıcı linki sayıyor ama
  **düz `.svg`'yi anmıyor**; hakem ekliyor.
- **`download.js`'te `kokenKaydi = null` varsayılanı bir arka kapıdır:**
  argümansız çağrı hâlâ **sessiz dosya üretir**. Bugün kapının §10-(h)
  kaynak-regex'i bunu tutuyor (H-M4 kırmızı yandı), ama koruma **yapısal
  değil, metinsel**. Çağrı biçimi değişirse (ör. spread) regex kaçırır.
  **F2/F3 için kalem.**
