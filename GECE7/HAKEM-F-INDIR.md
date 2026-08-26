# HAKEM — F-İNDİR

Hüküm: **KALDI.**
Hakem bu koşuda hiç iş yapmadı; aşağıdaki her sayı hakemin kendi koşturduğu
komuttan çıktı, faz kartından alınmadı.

Yargılanan: `GECE7/F-INDIR.md`, commit'ler `ee1414c` + `072705c`.
Ölçüm tarihi 2026-08-26. Build: `cmake --build engine/build -j8` → exit 0.

---

## HÜKMÜ TAŞIYAN TEK SAYI

`ctest --test-dir engine/build --output-on-failure` → hakemin kendi koşusu:

```
94% tests passed, 7 tests failed out of 118
Total Test time (real) = 275.78 sec
```

**Kart "6 failed out of 118" diyor. Gerçek 7.** Yedinci kırmızı miras değil,
**bu fazın doğurduğu yeni kırmızıdır**:

```
115 - vocab_reference_check (Failed)
  FAIL ARTTI  eksen ADI   garment   1186 ->  1188  (+2)
  HUKUM: FAIL (1 artan, 0 yeni)
```

### Kök sebep ölçüldü — faz ajanına ait

`vocab_reference_check` kapalı-enum cırcırıdır: sayı **yükselince** kırmızı yanar,
tabanı `engine/tests/vocab-reference-baseline.json`. Kapsam (`SCOPE`) **`web/js`'i
içeriyor** — F-İNDİR'in en çok dokunduğu yer.

Hakem `garment` kelimesini kapının kendi kapsamında iki commit'te saydı:

| ağaç | `garment` (tam kelime, SCOPE içi) |
|---|---|
| ata `34586c8` (Halka 0 sonu) | **1186** ← taban, kapı YEŞİL |
| `HEAD` (F-İNDİR sonrası) | **1188** (+2) ← kapı KIRMIZI |

`git diff 34586c8 HEAD` kapsam içinde eklenen satırları verdi, üçü de F-İNDİR'in
kendi kodu (`web/js/download.js`, `web/js/create.js`):

```
+  const base = `stitchu-${safeName(result.pattern.garment)}-...`;
+  const title = `${result.pattern.garment.charAt(0).toUpperCase()}...`;
+// garment the engine already knows does not close.
```

**Bu bir ölçüm gürültüsü değil.** Kapı, kirli çalışma ağacından etkilenmesin diye
sayımı **ayrık bir worktree'de, commit-adresli ağaçta** yapıyor (dosyanın kendi
başlığı bunu 2026-08-24 ölçümüyle gerekçelendiriyor). Hakemin kirli çalışma
ağacı (`patterns_real/` untracked) bu sayıya dokunamaz — nitekim sayı ata
commit'te tam tabana oturuyor.

Koşunun kuralı tek cümle: **yeni kırmızı varsa faz kapanmaz.** Kapandı sayılamaz.

---

## İKİNCİ BULGU — kartın kendi sapma sorusuna verdiği cevap fazla geniş

Kart soruyor: *"yabancı bir fotoğraf yükleyip **kalıp + flat** indirebiliyor mu?"*
Kart cevaplıyor: **"Evet."**

Ölçüldü — `web/js/download.js`'in dışa açtığı her şey:

```
patternSVG · patternA4Pdf · patternA0Pdf · patternDXF
saveSVG · saveA4Pdf · saveA0Pdf · saveDXF · saveBlob · relayDXF
```

Dördü de **kalıptır** (parçalar). `flat` / `technical` / teknik çizim üreten
**tek bir dışa açık fonksiyon yok**; `grep -i flat web/js/download.js` yalnız bir
yorum satırı buluyor. Flat hâlâ yalnız **ekranda** (`render.js`).

Yani doğru cevap "evet" değil: **kalıp iniyor, flat inmiyor.** Kart bunu başka bir
yerde (`guidePdf` maddesi) dürüstçe açık bırakıyor ama sapma sorusunun cevabını
"Evet" diye yazıyor. Bu tek başına faz düşürmez — F-İNDİR sapmadı, gerçekten dosya
indirdi — ama kartın son satırı **ölçülenden fazlasını iddia ediyor** ve düzeltilir.

---

## AJANIN DOĞRU ÇIKTIĞI YERLER — şüphe listesi tek tek kapatıldı

Şüphe uyandıran her madde ölçüldü; **beşinin beşi ajanı akladı.**

### 1. "119 → 118 düştü, test mi kayboldu?" → HAYIR. Test KAYBOLMADI.

İki farklı sayma yöntemi karşılaştırılmış. Ölçüm:

| | ata `34586c8` | `HEAD` |
|---|---|---|
| `grep -c add_test engine/CMakeLists.txt` | 119 | **120** |
| `ctest -N` listelenen | 118 | **119** |
| `DISABLED` (`h10_gate_check`) | 1 | 1 |
| **koşan** | **117** | **118** |

- `add_test` grep'i **1 fazla sayıyor**: satır 906 bir *yorum* içinde `add_test(NAME …)`
  geçiriyor. DURUM.md'nin "119 test"i bu şişmiş sayıydı.
- `git show ee1414c -- engine/CMakeLists.txt | grep "^-"` → **sıfır silinen satır.**
  Hiçbir `add_test` kaldırılmadı, hiçbiri yeniden adlandırılmadı.
- Ata ağaçta koşan 117 = DURUM.md'nin "111 yeşil + 6 kırmızı"sı. Birebir tutuyor.

**F-İNDİR bir test EKLEDİ (`indir_check`, ctest #119).** Düşüş yoktu; DURUM.md'nin
sayma yöntemi bozuktu. Bu satır aşağıda düzeltildi.

### 2. `indir_check` gerçek kapı mı? → **EVET. Hakem kendi mutasyonunu koşturdu.**

Ajanın logosuna güvenilmedi (§3.8 md.3), kod hakem tarafından kasten bozuldu:

| hakemin mutasyonu | dosya | sonuç |
|---|---|---|
| kalibrasyon karesi `rect(…,30,30)` → `29,29` | `web/lib/pdf-core.js:251` | **KIRMIZI** — `FAIL the calibration square measures 3.000 cm` |
| geri alındı | | **YEŞİL** |
| `screen.appendChild(downloadPanel(result))` → `const _p = downloadPanel(result)` | `web/js/create.js:812` | **KIRMIZI** — `FAIL the result screen mounts the panel` |
| geri alındı | | **YEŞİL** |

İkinci mutasyon önemli: paneli **kurup monte etmeyen** hal, yani "26 Ağu hastalığı +
fazladan kod", kapıyı kırmızıya düşürüyor. Kapı butonun *varlığını* değil
**monte edildiğini** ölçüyor. Kırmızı olabilen kapı, kapıdır. Kabul.

Çalışma ağacı mutasyonlardan sonra temiz (`git status --porcelain -- web/ engine/` boş).

**Kalan boşluk (ajan da bunu DOĞRULANMADI diye işaretlemiş, doğru yapmış):** M5,
`dxfSpecJSON` bağlanmasının motordan silinip yeniden derlenmesi, koşulmadı.
Hakem de koşmadı (~90 sn × 2 em++). Yerinde duran `typeof` kalemi zayıf ama ölü değil.

### 3. `landing_truth_check` gevşetildi mi? → **HAYIR, kökten kapatıldı.**

- `git show ee1414c --stat -- engine/tests/landing_truth_check.mjs engine/tests/landing-truth-baseline.json`
  → **boş çıktı. İkisine de dokunulmamış.**
- Taban bugün hâlâ `"taban": 937` — ajanın anlattığı 937 rakamı yerinde, 944'e
  yeniden kesilmemiş.
- Kapı bugün **yeşil** (`117/119 Test #117: landing_truth_check … Passed`).

Eşiğe dokunulmadı, dosya kapsam dışına **taşındı** ve gerekçe dosyanın başlığına
yazıldı. §3.8 md.4 ihlali **yok**. (`web/lib` yerleşimi kapının görüş alanını
daraltıyor — bu bir kaçamak değil çünkü o beş metin zaten yayınlanmış PDF'lerin
içinden kullanıcıya gidiyordu; ama F0 kapsam sorusunu bir kez yargılamalı.)

### 4. `contract/hedef-kosu-taban.json` değişti mi? → **HAYIR.**

- `git log --oneline --all -- contract/hedef-kosu-taban.json` → **tek commit: `f56941e`**
  (Halka 0, şefin mühürlediği taban). F-İNDİR'in commit'i listede yok.
- `git show ee1414c -- contract/hedef-kosu-taban.json` → boş.

§3.8 md.1'e uyulmuş. Faz ajanı tabana dokunmadı.

### 5. "Taşındı, kopyalanmadı" — `studio.js`'te ölü kopya var mı? → **YOK.**

`studio.js` bugün `download.js`'i **import ediyor** (satır 15) ve içindeki
`downloadSVG` / `downloadPDF` / `downloadDXF` üç satırlık **sarmalayıcı**:
dosya adını ve studio'nun durumunu veriyor, yazıcıyı `download.js`'ten çağırıyor.
İkinci bir SVG yazıcısı, ikinci bir PDF hattı **yok**. `studio.js` 146 satır
değişti, net küçüldü. İddia doğru.

(`downloadFactoryPack` bir yazıcı değil, yayınlanmış statik dosyaya `<a download>` —
kopya sayılmaz.)

### 6. Cırcır — `hedef_kosu` **YEŞİL**, hiçbir sayı kötüleşmedi.

`ctest -R hedef_kosu` → `100% tests passed`. H1–H11 taban değerlerinde.
Beklenen buydu ve **gerçekten anlamlıdır**: kapı bankalanmış VLM kaydını
(`vision/eval/live-2026-08-22.json`) okuyor, F-İNDİR görme hattına dokunmadı,
dolayısıyla sayıların oynamaması sıfır-maliyet ölçümün doğru cevabıdır.

H11'in 3.1 → 3.3 ms'i cırcır ihlali değil: H11 eşitliğe değil **tavana** (<10 sn)
bağlı, Halka 0 bunu bilerek böyle kurmuş. Kabul.

### 7. H10a/H10b ayrıştırılmadı — **bu F-İNDİR'i düşürmez.**

Şefin talimatı zaten bunu söylüyor. Ajanın gerekçesi de doğru: ayrıştırma
`hedef_kosu.mjs`'in H10 tanımını değiştirmektir, bu faz ajanının yetkisi değil,
ve F-İNDİR çıkarım hattına tek satır dokunmadı — ayrıştırılacak bir **değişim**
yok. Sıradaki karta yazıldı.

---

## NEDEN "GERİ AL" DEĞİL, "KALDI"

F-İNDİR'in işi **sağlam ve tutulmalı**:

- 26 Ağu sabahı `create.js`'te `download`/`dxf` geçen satır sayısı **0**'dı;
  bugün kullanıcı sonuç ekranından PDF(A4) · SVG · DXF · A0 indiriyor.
- DXF **bağımsız bir CAD kütüphanesinde açılıyor** (`ezdxf`: AC1009, `$INSUNITS 4`,
  55 POLYLINE / 5 parça) — "baktım" değil, üçüncü taraf hakem.
- Kalibrasyon karesi **29.9999 mm ölçüyor**, PDF içerik akışından geri okunarak.
- Kapı gerçek: hakemin iki mutasyonu da kırmızı yaktı.
- Yayınlanmış PDF'te **gerçek bir kusur** bulundu ve düzeltildi (kesim listesi
  sayfa kenarından taşıyordu).
- Reddetme sessiz değil: geçersiz enum / kullanılamaz beden **hiçbir dosya vermiyor**
  ve sebebini adıyla söylüyor.

Bu iş geri alınmaz. Kalan tek şey **iki satırlık bir temizlik ve bir cümlelik
düzeltme**. Faz, kapanmamış olarak duruyor — silinmiş olarak değil.

---

## F-İNDİR'İ KAPATMAK İÇİN ŞART (F0'ın İLK İŞİ, ölçülebilir)

1. **`vocab_reference_check` YEŞİLE dönecek.** Ölçülen hedef: SCOPE içinde
   `garment` tam-kelime sayısı **≤ 1186**. İki yol var, **taban yeniden kesilmez**
   (cırcır yalnız düşüş için, ve tabanı kesmek faz ajanının yetkisi değil, §3.8 md.4):
   - `web/js/download.js` ve `web/js/create.js`'teki 3 `garment` geçişini
     kapsam dışına al veya kelimeyi kullanmayan bir ifadeye çevir
     (ör. `result.pattern` alanını bir yerel değişkene tek seferde çıkar);
   - ya da kapının kendisi hakem önüne getirilir — ama **hakem izni olmadan
     taban da eşik de değişmez.**
   Doğrulama: `ctest --test-dir engine/build` → **6 failed out of 118**, altısı da
   miras adlar. Yedincinin adı listede görünürse F0 da kapanmaz.

2. **`GECE7/F-INDIR.md`'nin sapma sorusu cevabı düzeltilecek.** "Evet" →
   ölçülene inecek: *kalıp iniyor (PDF/SVG/DXF/A0), flat inmiyor.* Kart, elinde
   olmayanı iddia etmeyecek.

Bu ikisi bitince F-İNDİR kapanır ve `F-INDIR-yesil` etiketini **hakem** atar.
Bugün atılmadı.

---

## HAKEMİN KOŞTURDUĞU KOMUTLAR (tekrar üretilebilir)

```
cmake --build engine/build -j8                          # exit 0
ctest --test-dir engine/build --output-on-failure       # 7 failed out of 118
ctest --test-dir engine/build -R hedef_kosu             # Passed
ctest --test-dir engine/build -R indir_check            # Passed
ctest --test-dir engine/build -N                        # Total Tests: 119
git show ee1414c -- contract/hedef-kosu-taban.json      # bos
git show ee1414c --stat -- engine/tests/landing_truth_check.mjs \
                            engine/tests/landing-truth-baseline.json   # bos
git grep -Iw garment <SCOPE> 34586c8   -> 1186
git grep -Iw garment <SCOPE> HEAD      -> 1188
# + iki mutasyon (pdf-core.js:251, create.js:812), ikisi de kirmizi, ikisi de geri alindi
```

## GÖREMEDİĞİM / ÖLÇMEDİĞİM

- **M5 koşulmadı:** `dxfSpecJSON` bağlanması motordan silinip wasm yeniden
  derlenmedi. Kapının o kalemi `typeof` kontrolüne dayanıyor. **DOĞRULANMADI.**
- **Gerçek tarayıcıda uçtan uca indirme koşulmadı** (repoda headless harness yok).
  Kapı DOM taklidiyle çalışıyor. Chrome/Safari indirme diyalogu **DOĞRULANMADI.**
- **Fotoğraf → spec adımı `indir_check`'te yok** (sıfır API çağrısı, kasten).
  Zincir iki kapıda bölünmüş: fotoğraf→spec `hedef_kosu`'nun bankalanmış kaydında,
  spec→dosya `indir_check`'te. Tek koşuda uçtan uca **ölçülmedi.**
- **`web/collections/pdf/` altındaki 48 yayınlanmış PDF bayat** (kesim listesi
  taşması kodda düzeldi, dosyalarda değil). Ajan bunu dürüstçe açık bırakmış;
  hakem de kapatmadı — sevkiyata bağlı.
- **`?v` sürümü 136'da duruyor**, `web/vendor/stitchu-engine.js` bu fazda değişti.
  **Sevkiyattan önce bump şart**, yoksa kullanıcı bayat motoru çeker.
- Miras 6 kırmızının hiçbiri bu koşuda kök sebebe indirilmedi; sadece
  **büyümedikleri** doğrulandı.
