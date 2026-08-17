# garment-spec v2 — MÜHÜRLÜ (H2.1, 2026-08-17)

> **Durum: MÜHÜR.** 12 Ağu'nun `garment-spec-v2.DRAFT.md`'si bu dosyaya dönüştü;
> "SADECE sözleşme; kod bağlanmadı" satırı düştü. Taslağın iki katmanlı ayrımı
> (topoloji / nicelik) **korundu**; kapsamı bugünkü motora karşı yeniden ölçüldü.
>
> | rol | dosya |
> |---|---|
> | **tek kaynak** | `contract/garment-spec-v2.json` |
> | üretilen şema | `contract/garment-spec-v2.schema.json` ← `engine/tools/gen-spec-v2.mjs` |
> | derleyici ön yüzü | `engine/tools/specv2.mjs` (`checkSpec`, `refusalSentence`) |
> | **kapı** | `engine/tools/specv2-check.mjs` → ctest **`specv2_check`** |
>
> K1 disiplini: değer elle kopyalanmaz, türev üretilir, sürükleme süiti kırar.

## Neden v2? (taslaktan devralındı, değişmedi)

v1 (45 alan) iki ayrı şeyi tek enum yığınına karıştırıyordu:

- **TOPOLOJİ** — hangi paneller var, dikiş grafiği ne, kesikler nerede. Ayrıktır;
  süreklileştirilemez (DERSLER: flat vs shirt yaka iki topolojik sınıftır, kadran
  ucu değil).
- **NİCELİK** — o topoloji üstünde sürekli kadranlar. "Little black dress" = bir
  topoloji + bir kadran vektörü; kadran uzayı sürekli olduğu için istek uzayı
  sınırsızdır. LLM'in rolü DEĞİŞMEZ: **kapalı şemaya JSON yazar; motor derler.**

v1'in ölçülmüş kusuru: 68 sürekli kadranın 6'sı bir dikişi oynatıyor —
parametre uzayının %91'i ölü (`knowledge/dial-seam-table.json`).

## v2'nin üçüncü katmanı — **OPERATÖR SİCİLİ**

Taslakta yoktu. Bitiş tanımı bunu şart koşuyor:

> Damla rastgele 10 cümle/görsel atar → en az 8'i dikilebilir kalıp döner →
> **kalan 2'si eksik operatörünü ADIYLA söyleyerek dürüst reddeder.**

Bir şema, tek başına "iyi yazılmış / kötü yazılmış" der. O cümleyi kuramaz.
Kurabilmesi için şemanın **kendi kapsamını bilmesi** gerekir. Sicil budur:

- `operators` — motorun yapabildiği/yapamadığı her şeyin adı, **durumu** ve
  **motordaki bağlantısı**.
- Her topoloji enum **değeri**, gerektirdiği operatörleri `requires` ile ilan eder.
- Bir spec ifade edilebilirdir **ancak ve ancak** gerektirdiği her operatör
  `shipped` ise. Değilse **red**, ve reddin gerekçesi o operatörün **ADIDIR**.

### Üç durum, dördüncüsü yok

| durum | anlamı |
|---|---|
| `shipped` | bugün alıcının aldığı varsayılan yolda çalışıyor; `engine/src/surfacepattern.hpp`'de gerçek bir sembole bağlı |
| `flagged` | kod var ve ölçülü, ama **kapalı** sevk ediliyor çünkü açınca yeşil bir kapı kırılıyor. İsteyen spec **reddedilir** — sevk edilemeyen yetenek yetenek değildir |
| `absent` | **SİCİLDE YOK.** Motorda sembol yok, türev yok, yaklaşım yok. İsteyen spec reddedilir ve red onu adıyla söyler |

Dördüncü bir durum — "en yakınını ver" — bilerek yoktur. DERSLER: sessiz enum
fallback (puff→None) halüsinasyondur. `web/js/missing.js` eski 2B motorda ikameyi
**ilan ederek** yapıyor; v2 ikame etmiyor, reddediyor.

### Bugünkü sicil (15 operatör)

**shipped (9):** `bodiceSurface` · `skirtSurface` · `hemSweepCone` · `princessCut` ·
`waistAnchoredDart` · `topAnchoredDart` · `necklineDraft` · `armholeNotch` ·
`backOpening`

Üçü **kusurlu ama shipped** (yok değil — sicil bunu `defect` alanında yazıyor):
`armholeNotch` (H1.0 K1: oyuk 2B delik değil, φ∈[0, 19.9°] ince mercek; EU38
33.55cm vs Buğra 43.30cm, **%22 kısa**) · `necklineDraft` (tek üst sınır → ön yaka
arkadan 5mm dar olamaz) · `topAnchoredDart` (Tur 8'den beri net-negatif omuz bandı
**hiç pens türetmiyor**; operatör koşuyor, bu giyside çıktısı yok).

**flagged (1):** `shoulderSeam` — açıkken `h10_gate_check` 52/63 → 24/63, K3/K5/K6
8/8 kapanıyor; ama `surface_pattern_check` 0 → 4 FAIL ve iç gerinim %24.07/%18.14
(kapı %3.0). Halka **H1.0a**.

**absent (5):** `gatheredOverlayLayer` · `sleeve` · `collarFamily` · `skirtFamily` ·
`zipperPiece`

Beşi de **ölçüldü, uydurulmadı**:

- **`gatheredOverlayLayer`** — T14 (17.08): Buğra'nın puf kolu **iki KATMAN**,
  yatay bölünme değil. Upper Sleeve aynı kapağın yatayda ölçeklenmiş kopyası;
  kapak **sagitta oranı 8 bedende bit-sabit 1.227**, kiriş oranı 1.549→1.347
  (= büzgü payı). `patterns_real/BUGRA-DEFTER.md`'nin "kol yatay 2'ye bölünmüş"
  satırı bununla çürüdü. Motor tarafı: `surfacepattern.{cpp,hpp}` içinde
  `gather|pleat|ruffle` geçen **sıfır satır**.
- **`sleeve`** — aynı iki dosyada `sleeve` geçen **6 satırın 6'sı** da
  *"sleeveless"* kelimesi ve hepsi yorum. Kol oyuğu var, kol yok.
  `engine/src/sleeve.cpp` **eski 2B-formül motoruna** aittir (CLAUDE.md: "AT"),
  sevk edilen yüzey hattına bağlı değil. `blockedBy: shoulderSeam`.
- **`collarFamily`** — `collar` geçen **sıfır satır**. `contract/spec-grammar.json`'un
  `peterPan`'i eski flat motorun "pinli" kaydıdır, yüzey hattında karşılığı yok.
- **`skirtFamily`** — yüzey hattının **tek** eteği `hemSweepCone`. gore, tam daire,
  büzgülü, pileli yok.
- **`zipperPiece`** — `backOpening` bir **dikilmeyen kenar** üretir; fermuarın kendi
  payı/parçası çizilmez. `web/js/missing.js` bunu eski motor için zaten ilan ediyor.

## İki katman (taslaktan, motora karşı ölçülmüş hali)

### 1. Topoloji — 7 kapalı eksen

`garment` · `skirtShape` · `shoulder` · `sleeve` · `collar` · `closure` ·
`suppression`. Her değer `requires` taşır; tam liste `garment-spec-v2.json`'da.

Taslağın `bands` ve `edge-finish` eksenleri **yazılmadı**: motorun halka listesi
(neck/bust/waist/hip) seçilebilir bir eksen değil `BodySurface`'in kendisi, ve ek
panel üreten hiçbir operatör yok. Sahte kapsam yazmak yerine boş bırakıldı ve
gerekçe `_notMigratedFromDraft` altında duruyor.

### 2. Nicelik — 19 sınırlı skaler

Hepsi bir `SheathOptions` alanına bağlı; `default` **motordan okunuyor** ve kapı
sürüklemeyi kırmızıya çeviriyor. Kaynağı olan (`hemSweepMM` 1960'lar Big-4 zarfı,
`backOpeningMM` 22 inç Vogue fermuarı, ease'ler Threads/RTW + Aldrich, yaka
katsayıları Aldrich p.16, `shoulderNarrowMM` Aldrich p.28) `source` taşır.

Taslağın 9 malzeme kategorisinden `stand & fall`, `roll line`, `contouring`
bugün kadran karşılığı olmadığı için yazılmadı; `spring` bir kadran değil,
flatten'ın sınır eğriliğinden kendiliğinden çıkıyor.

### Spec olmayan: `solverKnobs`

`ringSamples`, `rowStepMM`, `arapRounds`, `polishIters`, `cutRounds`, `cutSweeps`,
`cutEmphasis` ve topolojinin kendisini taşıyan bool/frac listeleri **üretilen
şemaya girmez**. Bunları yazan bir LLM kod yazıyordur. Kapı sızıntıyı ölçüyor.

`topColXMM` ve `shoulderCarryMM` de spec alanı değil — `SurfacePattern`'in
**çıktı** alanları (`surfacepattern.hpp:117,140`). Taslağın onları taşımaması
doğrudur.

## Motora bağlanma — NEREYE KADAR BAĞLANDI, NEREDE DURDU

**BAĞLANAN (mandal, ctest'te koşuyor):** sicilin ve kadranların motordaki
karşılıkları `specv2_check` tarafından `engine/src/surfacepattern.hpp`'nin
`struct SheathOptions` gövdesinden okunarak doğrulanıyor. Alan adı değişirse,
varsayılan sürüklerse, `absent` bir operatör bağlantı kazanırsa **kapı kırmızı**.
Bu sözleşme artık motordan bağımsız yaşayamaz.

**BAĞLANMAYAN — SINIR, DEVREDİLDİ:** *spec'i motora GİRDİ olarak veren yol yok.*
`engine/tools/surface-pattern.cpp:313` tek satır: `const SheathOptions opt;` —
sevk edilen CLI yalnız beden adı alıyor, hiçbir spec dosyası okumuyor. v2 JSON'unu
gerçekten çizime sokmak o dosyaya bir okuyucu eklemeyi gerektiriyor; bu tur
`engine/src/surfacepattern.*` **9A'nın elinde** olduğu için yapılmadı ve zorlanmadı.
Halka: **H2.2/H2.3 ile birlikte**, tahmin ~2–4 koşu saati.

## Sıradaki (H2.7'ye kalan)

1. `checkSpec`'in `unsupported` çıktısını **kullanıcı yüzeyine** taşı (web/CLI) —
   bugün yalnız test içinde basılıyor.
2. Foto/cümle → v2 JSON girişi (H2.6). Şema kapalı olduğu için LLM'in yazacağı
   yüzey hazır; yazan taraf yok.
3. `absent` operatörlerin **sıraya konması** (H2.3 operatör dalgası): sicildeki
   beş ad, o halkanın kabul listesidir.
