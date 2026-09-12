# `euSizeChart`'ın kaynağı — 70 sayının nereden geldiği (17 Ağu 2026, TUR 18B)

**Halka:** motorun bütün gövdesini besleyen `contract/tables.json → draft.euSizeChart`
(7 kolon × 10 beden = **70 sayı**) repoda **hiçbir yerde kaynak beyan etmiyordu.**
Bu dosya o boşluğun kapanışıdır: bulunanı ve **bulunamayanı** birlikte yazar.

**Ölçüm ağacı:** HEAD `1fe3309`, `engine/build-18b` Release.
Taban ctest (dışlamalı) **90/90 yeşil**, tam süit **90/95** (5 önceden kırmızı:
`style_check` · `contract_check` · `preview_truth_check` · `figure_check` · `h10_gate_check`).

---

## 1. ÇİZELGE BİR TEST FIXTURE'I OLARAK DOĞDU

Git geçmişi `-S` ile tarandı. Sayıların repodaki **ilk** görünüşü:

| ne | commit | tarih | dosya |
|---|---|---|---|
| **doğum** | **`77193d5`** | **7 Tem 2026** | **`engine-check/main.swift`** — bir TEST KOŞUM TAKIMI |
| motorun gerçeği oldu | `1eafc16` | 15 Tem 2026 | `engine/src/sizechart.hpp` (birebir kopya) |
| kontrata taşındı | `c3c07b0` | — | `contract/tables.json` (bayt özdeş relocation) |

`77193d5`'in commit mesajı tek satır: *"add engine check harness running the size
matrix"*. Sayıların tek gerekçesi kaynak kodun içindeki **tek yorum satırıydı**:

```swift
// EU size chart (German convention) + edge cases.
let bodies: [Body] = [
    body("EU34", 80, 62, 86, 36, 39.5, 57, 34),
    ...
    body("tall",   92, 74, 98, 39, 47, 66, 36),
    body("petite", 84, 64, 90, 34, 33, 49, 33),
    body("pear",   96, 70, 116, 37, 41, 58, 36),
    body("apple",  118, 112, 104, 40, 42, 60, 40),
    body("bigNeckSmallShoulder", 100, 84, 104, 30, 40, 58, 50),
]
```

★ **Aynı listede duran `tall/petite/pear/apple/bigNeckSmallShoulder` gövdeleri
açıkça uydurmadır** — bir test için uydurulmuş uç haller. On EU satırı o beş
uydurma satırla **aynı dizide, aynı fonksiyonla, aynı commit'te** yazıldı.
Bir hafta sonra `1eafc16` ilk on satırı çıkarıp motorun **gövde gerçeği** yaptı;
uydurma beşi harness'ta bıraktı. **Terfi anında hiçbir kaynak eklenmedi.**

Bu, reponun kendi dersinin tam sınıfıdır (`CLAUDE.md`: *"PATTERNMAKING SAYILARINI
TAHMİN ETME"*, `07-sleeve` çöpü). Fark: orada tahmin edilen bir **kalıp** sayısıydı,
burada bir **vücut** sayısı — onu bir insan giyiyor.

### Aranıp bulunamayan yerler (doğrulanmış yokluk, repo içi)
`reports/` · `docs/` (`ARCHITECTURE.md`, `H1.0-KAPI.md`, `RECETE-SPEC.md`,
`SATIS-SARTNAMESI.md`, `G5-OMUZ-PLANI.md`) · `knowledge/` · `CLAUDE.md` ·
`HEDEF.md` · `ROADMAP.md` · `DERSLER.md` · `engine/FORMULAS.md` ·
`knowledge/drafting-math-eu38.md` · bütün commit mesajları.
**Hiçbirinde bu çizelgenin kaynağı adlandırılmamış.** `EN 13402`, `DOB`,
`Hohenstein`, `Burda`, `Rundschau` kelimeleri repoda **hiç geçmiyor**;
`Müller & Sohn` ve `Aldrich` geçiyor ama **hep başka bir sayı için** (kol
oyuğu, kapak yüksekliği, ease bandı), **hiçbiri beden çizelgesi için değil**.

---

## 2. DIŞ KAYNAK ARAŞTIRMASI — ÜÇ KOLON BULUNDU, DÖRT KOLON BULUNAMADI

### ✅ `bustCM` / `waistCM` / `hipCM` — BULUNDU, 10/10 BİREBİR

**burda style, "Richtig Maßnehmen + Maßtabellen — Damengrößen"**, bölüm
*NORMALE DAMENGRÖSSEN*, Körpergröße 168:
<https://burda-product-cms.s3.amazonaws.com/public_files/Damen_Ma%C3%9Ftabellen_online.pdf>

| Größe | 34 | 36 | 38 | 40 | 42 | 44 | 46 | 48 | 50 | 52 |
|---|---|---|---|---|---|---|---|---|---|---|
| Brustumfang | 80 | 84 | 88 | 92 | 96 | 100 | 104 | **110** | **116** | **122** |
| Taillenumfang | 62 | 66 | 70 | 74 | 78 | 82 | 86 | **92** | **98** | **104** |
| Hüftumfang | 86 | 90 | 94 | 98 | 102 | 106 | 110 | **116** | **122** | **128** |

**Çizelgemizle 30 hücrede 30 birebir.** Yani *"EU (German) convention"* cümlesi
bu üç kolon için **DOĞRUYMUŞ** — sadece hiç yazılmamıştı.

Bağımsız teyit: **Aldrich, _Metric Pattern Cutting for Women's Wear_**, 4. ve 6.
baskı, *"4cm and 6cm Increments (European Sizing)"* başlığı altında aynı göğüs
dizisi (Wiley'in kendi ücretsiz 1. bölüm örneği:
<https://catalogimages.wiley.com/images/db/pdf/9781444335057.excerpt.pdf>).
⚠ Aldrich bu bedenleri **UK etiketiyle** basar (bust 80 = 4. baskıda UK 8,
6. baskıda UK 6) — **Aldrich'i ETİKETE göre eşleme, sayıya göre eşle.**

### ❌ `shoulderCM` · `backLengthCM` · `armLengthCM` · `neckCM` — KAYNAK YOK

Dördü de aranıp bulunamadı; her biri `contract/tables.json _sources`'ta
`status: "NONE"` ile **doğrulanmış yokluk** olarak duruyor ve kapıyı kırmızı tutuyor.

---

## 3. ÜÇ TUHAFLIĞIN HÜKMÜ

### ★ (1) EU46 üstü **+6.0cm rejimi** → **KASITLI. KAYNAKLI. HÜKÜM KAPANDI.**
`4,4,4,4,4,4,**6,6,6**` üç kolonda birden. Burda'nın **yayınlanmış kendi serisi**
budur: 104 → 110 → 116 → 122. Aldrich aynı sıçramayı yapıyor ve başlığına
*"4cm and 6cm Increments"* yazıyor. Alman **perakende** bandı da örtüşüyor
(de.wikipedia *Konfektionsgröße* 48: 108–113 · 50: 114–119 · 52: 120–125 →
orta noktalar 110.5 / 116.5 / 122.5).
⇒ Tur 7'nin *"bir dizgi hatası kendini üç kez tekrar etmez"* çıkarımı **doğruydu**,
ve dayanağı artık iç tutarlılık değil **birincil yayın**. `DAMLA-KUYRUK` K10'un
EU48 kalemi bu sütun için **kapanabilir** (kararı Damla verir).
⚠ Bunun **yan etkisi kapanmadı**: Tur 16A ölçtü, `shoulderCM` de aynı kenarda
+0.5 → +1.0 kırılıyor ve K2'yi EU48'de −15.823mm düşürüyor. Göğüs kırılması
kaynaklı, **omuz kırılması kaynaksız** — ve Müller'de boyun kırılması göğüs
kırılmasıyla **hizalı**. Yani "kırılmanın kendisi" meşru, **hangi kolonların
kırılacağı** hâlâ kaynaksız.

### ★ (2) `backLengthCM` EU44→EU46 adımı **0.0** → **HATA GİBİ OKUNUYOR, DÜZELTİLMEDİ.**
Dizi: `39.5 · 40 · 40.5 · 41 · 41.5 · 42 · **42** · 42.5 · 43 · 43.5`.
Yayınlanmış sırt boyu (nape-to-waist / Rückenlänge) serilerinin **hepsi düzgün**:

| kaynak | adım |
|---|---|
| Burda Rückenlänge (40.5 → 45, beden 34–52) | **+0.5 tekdüze** |
| Aldrich 6. baskı nape-to-waist (40.2 → 43.8) | **+0.4 tekdüze** |
| Aldrich 4. baskı (40 → 42.5, sonra 43 sabit) | +0.5 |
| Müller Rückenlänge (41.4 → 43.3) | +0.2 sonra +0.3 |

Var olan **düz** koşular yalnız serinin **UÇLARINDA** ve bir daha yükselmiyor
(Aldrich 4. baskı 43 @ beden 20/22/24/26; Müller 41.4 @ 32/34/36).
**Serinin ORTASINDA olup sonra +0.5'e dönen bir düz adım hiçbir yayında yok.**
⇒ Bu bir grade geleneği değil. Tur 16'nın ölçtüğü *"gövde boyu EU44→EU46'da
KISALIYOR"* (−11.56mm) bulgusunun kökü **tam bu hücre**.
⚠ Ve bu kolonun **tamamı** kaynaksız: her bedende Burda'nın **~1cm altında**
(Burda'nın Kurz-168 ile Normal-168 serilerinin **arasında** duruyor — muhtemel
köken, **DOĞRULANMADI**). Yani tek hücreyi düzeltmek kolonu kaynaklı yapmaz.
**TEK TARAFLI DÜZELTİLMEDİ → `DAMLA-KUYRUK` K10.**

### ★ (3) `neckCM` düzensizliği → **HATA GİBİ OKUNUYOR, DÜZELTİLMEDİ.**
Adımlar `.5 · .5 · 1 · .5 · .5 · 1 · 1 · 1 · 1`. Yayınlanmış her kadın boyun
çevresi serisi **düzgün**: Aldrich 6. baskı **+1.0 tekdüze** (35…44) · Aldrich
4. baskı +1.0 sonra +1.4 · Müller +0.6 sonra +1.2 (**tek** temiz kırılma ve o
kırılma **göğüs kırılmasıyla hizalı**). Bizim serimizde kırılma **üç kez**
oluyor ve göğüsle hizasız. Üstelik değerlerimiz Aldrich ve Müller'in **1–3cm
altında**. ⚠ Bu kolon K5 neck-girth kapısının alt sınırını doğrudan sürüyor ve
8 bedenin **8'i de FAIL** — reponun en sert tek-kolon kapısı kaynaksız bir
sütuna bağlı. **TEK TARAFLI DÜZELTİLMEDİ → `DAMLA-KUYRUK` K10.**
⚠ Tur 16A'nın ölçtüğü ayrı bir kırılganlık: sevk edilen EU48 boyun çevresi
**390.59mm**, kapının tabanı **390.00mm** — 390'da **0.59mm** pay.

### ★ (4, sorulmadı) `shoulderCM` → **DEĞER DEĞİL, TANIM UYUŞMAZLIĞI.**
Yayınlanan her çizim standardında `Schulterbreite / shoulder` **tek omuz
dikişidir**: Burda 12–14.5 · Müller 11.8–13.6 · Aldrich 11.75–14.2 cm.
Müller kendi sayfasında tanımı yazıyor: *"from the beginning of the neck to the
beginning of the arm at the shoulder"*
(<https://www.muellerundsohn.com/en/allgemein/taking-measurements/>).
**36–42cm'i bir VÜCUT ölçüsü olarak basan hiçbir standart bulunamadı.** O aralık
yalnız perakendecilerin **bitmiş giysi** "across-shoulder" tablolarında görünüyor
(DOĞRULANMADI). Yani kolon sadece kaynaksız değil, **hangi büyüklüğü ölçtüğü
belirsiz**. ⚠ Motor bugün bu kolonu zaten **kullanmıyor** —
`sizechart.hpp` `shaperatios.gen.hpp`'nin `width_cm`'ini üstüne yazıyor
(Tur 16A notu: kolonun kendisi Aldrich bandına **giriyor**, sevk edilen
`shaperatios` sayısı 8/8 kısa kalıyor).

### ★ (5, sorulmadı) `armLengthCM` — kusursuz `+0.5 ×9`, kaynaksız
En yakın yayın Aldrich sleeve length `57.5, 58, 58.5, 59, 59.5, 60, 60.25,
60.5, 60.75, 61` — bizimki ondan **−0.5 kaydırılmış** ve beden 18'deki **eğim
kırılması düzleştirilmiş**. Burda Armlänge `59,59,60,60,61,61,61,61,62,62` —
hiç tutmuyor. Yani "kusursuz doğrusal olması" bir uzatma **imzası** ve dış
kaynak onu **desteklemiyor**: gerçek yayınlar bu sütunu düz uzatmıyor.

---

## 4. DOĞRULANMIŞ YOKLUK — arandı, bulunamadı / paywall
- **EN 13402-3 sayısal ek** — PAYWALL (iteh.ai örneği yalnız kapak). Aldrich 6.
  baskı *"compliant with BS EN 13402-3"* diyor ama sayıları biz standarttan
  değil **Aldrich'ten** okuduk.
- **Hohenstein "Größentabelle Damen Normalgröße"** — adlandırılmış belge olarak
  **BULUNAMADI**.
- **M. Müller & Sohn resmi Maßtabelle** — PAYWALL (82 EUR; 2 sayfalık sürüm
  17.90 EUR, önizleme yok). Aşağıdaki Müller sayıları **üçüncü taraf
  kopyasından** (<https://modanews.ru/m.muller/woman>, 2010, boy 168):
  **DOĞRULANMADI.** Satır adları ve sırası Müller'in resmi içindekiler
  listesiyle örtüştüğü için raporlandı; 2019 2. baskıdan eski olabilir.
- **ISO 8559-2 / -3** — boyun çevresini "designated dimension" sayıyor, **sayı
  basmıyor**.
- **DIN 33402-2 Tab.14** · **GB/T 1335.2-2008** · **ГОСТ 17522-72** (indirildi,
  tabloları **taranmış görsel**) · **ASTM D5585 / D5586** (2020'de **geri
  çekildi**) — hiçbirinden sayı çıkarılamadı.
- **Hofenbitzer, _Schnittkonstruktion für Damenmode Bd.2_ Leseprobe** — Almanca
  tablo içerdiği indeksleniyor, **çekilemedi (404)**. En iyi kalan ücretsiz
  Almanca çapraz kontrol. **KOŞULMADI.**
- **SizeGERMANY / SizeUK / CAESAR** antropometrik tarama verileri —
  **HİÇ ARANMADI**. Düzensiz, ankete dayalı bir boyun serisinin tek makul
  açıklaması bunlar olabilir. Açık iş.
- **happy-size.de** HTTP 403 · Witt / Tchibo / Zalando tabloları çekilmedi.

## 5. SORULMADI AMA ÖNEMLİ (döküm)
1. **Burda'nın tablosunda modellemediğimiz satırlar var** ve çizim için taşıyıcı:
   Oberarmumfang (25→38), Brusttiefe (24→34), Vordere Taillenlänge (42→52),
   Innere Beinlänge (82→**79**, bedenle **KÜÇÜLÜYOR**), Seitenlänge (sabit 106).
2. **Burda'nın Kurz (160) ve Lang (176) tabloları farklı beden ETİKETLERİ
   kullanıyor** (16–30 ve 64–120) ve Rückenlänge'leri 38→45 / 42→49.
   Bizim 39.5–43.5'imiz Kurz ile Normal'in **arasında**.
3. **Aldrich 6. baskıda basen 118 → 124 → **132**** (beden 20/22/24) — +8'lik bir
   sıçrama, iki bağımsız taramada aynı basılı. Errata bulunamadı. DOĞRULANMADI.
4. **Aldrich 6. baskıda ön ve arka boy beden 12'den sonra ayrışıyor** (nape-to-waist
   43.8 · front-shoulder-to-waist 46.8 @ beden 24). Motor simetri varsayıyorsa
   büyük bedenlerde kırılır. **KONTROL EDİLMEDİ.**
5. **Aldrich 6. baskı bel ve baseni her bedende +2cm kaldırdı** (göğüs sabit).
   Bizim bel/basen kolonlarımız **4. baskı / Burda** ile eşleşiyor, 6. baskı ile
   **eşleşmiyor** — kaynak beyanında baskı numarası taşımak zorunlu.
6. **Müller boyun çevresini (`Halsumfang` 34.8–42) boyun GENİŞLİĞİNDEN
   (`Halsbreite` 6.5–7.7) ayırıyor.** CAD çiziminde taşıyıcı olan genelde
   **genişliktir**, çevre değil. Motorun `neckCM`'i hangisini tükettiği
   **BU TURDA KONTROL EDİLMEDİ** — kolon zaten kaynaksız, ama yanlış BÜYÜKLÜK
   olma ihtimali ayrıca duruyor.
7. **Müller'in basen grade'i küçük uçta düzensiz** (+4, +4, +3, +3, +3…).
8. `contract_check` **taban hâlinde zaten kırmızı** ve tek sebebi **beyan edilmiş
   bir karar**: `patterns_real/` altında **49 takipli dosya** (satın alınmış Buğra
   PDF'leri). Bu turda **dokunulmadı**; `contract.gen.*` senkron kaldı.

---

## 6. KAPI
`engine/tests/sizechart_source_check.mjs` (ctest: `sizechart_source_check`).
Her kolon bir kaynak beyanı taşımak **zorunda**; `verified` olan kolon ayrıca
`url` + `published[]` taşımak ve çizelgeyle **değer değer** tutmak zorunda.
**Bugün 4 FAIL** (shoulder · backLength · armLength · neck) — kasten kırmızı doğdu.
**Mutasyon kanıtı 7/7**: `_sources` silinince · EU38 göğsü 1cm kaydırılınca ·
+6cm rejimi +4'e düzleştirilince · kaynaksız "verified" iddia edilince ·
uydurma bir status kelimesi konunca · beyansız kolon eklenince kapı **kırmızıya
gidiyor**; bir kolon gerçekten kaynaklandığında hüküm sayısı **düşüyor**
(yani kapı gerçek işle **kapanabilir**).

**BİTİŞ ŞARTI:** kalan dört kolonun her biri ya bir yayına eşlenecek (url +
sayılar `_sources`'a) ya da **Damla** onları adlandırılmış bir kaynaktan
değiştirecek. **Bir ajan bu kapıyı çizelgeyi düzenleyerek kapatamaz** —
kaynaksız bir vücut ölçüsünü değiştirmek bir alıcının bedenini bozar.
