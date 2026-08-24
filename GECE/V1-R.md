# V1-R — ARAŞTIRMA ÇIKTISI (kart: GECE/KART/V1-R-arastirma.md)

Tarih: 2026-08-24. Kod YAZILMADI; `contract/` `engine/` `recipes/` `web/` altına
DOKUNULMADI. Bu dosya üç kapının (sizechart_source_check · golden_check ·
figure_check) girdisidir, kendisi bir kapı değildir.

**KART DÜZELTMESİ (önce bu):** kart "EU32..EU50" diyor. `contract/tables.json`
`draft.euSizes` **EU34..EU52** (10 beden); EU32 satırı çizelgede YOK, EU52 var.
Tablolar çizelgenin gerçek 10 bedeni üzerinden yazıldı.

---

## BÖLÜM 1 — DÖRT KAYNAKSIZ KOLON

### 1.0 Bu turda BİRİNCİL KAYNAKTAN ÇEKİLEN iki tablo

İkisi de bu oturumda indirildi ve makinede metne çevrildi; sayılar aşağıda
elle değil `pdftotext -layout` çıktısından alındı.

**(A) burda style — "Richtig Maßnehmen + Maßtabellen, DAMENGRÖSSEN"**
URL: https://burda-product-cms.s3.amazonaws.com/public_files/Damen_Ma%C3%9Ftabellen_online.pdf
Komut: `pdftotext -layout /tmp/burda.pdf` → 117 satır. Üç seri var:
NORMALE (Körpergröße 168), KURZE (160), LANGE (176); her seri beden 32..60.
Satırlar (12 tane): Körpergröße · Brustumfang · Taillenumfang · Hüftumfang ·
Armlänge · Seitenlänge o. Bund · Innere Beinlänge · Rückenlänge ·
Schulterbreite · Oberarmumfang · Brusttiefe · Vordere Taillenlänge.
★ **Halsumfang (boyun çevresi) satırı YOK** — tabloda hiç geçmiyor. Bu, 18B
turunun aynı iddiasının bağımsız teyididir.
Tanım, yayının kendi sayfasında: **9 SCHULTERBREITE — "Vom Halsansatz bis zur
Armkugel messen"** (boyun başlangıcından kol küresine) = TEK omuz dikişi.
**8 RÜCKENLÄNGE — "Von dem etwas vorstehenden Halswirbelknochen entlang der
Rückenmitte bis zur Unterkante des Taillenbandes"**.
**5 ARMLÄNGE — "Vom Schulterpunkt bis zur Handwurzel"**.

EU34..EU52 karşılıkları (NORMAL / KURZ / LANG):

| satır | 34 | 36 | 38 | 40 | 42 | 44 | 46 | 48 | 50 | 52 |
|---|---|---|---|---|---|---|---|---|---|---|
| Armlänge NORMAL | 59 | 59 | 60 | 60 | 61 | 61 | 61 | 61 | 62 | 62 |
| Armlänge KURZ | 57 | 57 | 58 | 58 | 59 | 59 | 59 | 59 | 60 | 60 |
| Armlänge LANG | 61 | 61 | 62 | 62 | 63 | 63 | 63 | 63 | 64 | 64 |
| Rückenlänge NORMAL | 40,5 | 41 | 41,5 | 42 | 42,5 | 43 | 43,5 | 44 | 44,5 | 45 |
| Rückenlänge KURZ | 38 | 39 | 39 | 40 | 40 | 41 | 41 | 42 | 42 | 43 |
| Rückenlänge LANG | 42,5 | 43 | 43,5 | 44 | 44,5 | 45 | 45,5 | 46 | 46,5 | 47 |
| Schulterbreite (üç seride de AYNI) | 12 | 12,5 | 12,5 | 13 | 13 | 13,5 | 13,5 | 14 | 14 | 14,5 |

**(B) Aldrich, *Metric Pattern Cutting for Women's Wear*, 6. baskı, s.11 —
"Standard body measurements – women's sizing", "4 cm and 6 cm increments,
Women of medium height, 160-172 cm"**
URL: https://courses.ideate.cmu.edu/99-361/s2021a/wp-content/uploads/2021/02/Standard-Measurements-Metric-Pattern-Cutting-1.pdf
(sayfanın altında künye basılı: *"From: Metric Pattern Cutting for Women,
6th Ed. by Winifred Aldrich"*; sayfa numarası sağ üstte **11**.)
Komut: `pdftotext -layout /tmp/aldrich.pdf` → tablo metin katmanında, OCR değil.
Beden kodu 6..24 ve büst serisi **80, 84, 88, 92, 96, 100, 104, 110, 116, 122** —
`euSizeChart` `bustCM` kolonuyla **birebir 10/10**. Kolonların EU34..EU52'ye
eşlenmesi bu yüzden tahmin değil, büst üzerinden kilitli.

| Aldrich satırı | 6/34 | 8/36 | 10/38 | 12/40 | 14/42 | 16/44 | 18/46 | 20/48 | 22/50 | 24/52 |
|---|---|---|---|---|---|---|---|---|---|---|
| shoulder | 11.75 | 12 | 12.25 | 12.5 | 12.75 | 13 | 13.25 | 13.6 | 13.9 | 14.2 |
| neck size | 35 | 36 | 37 | 38 | 39 | 40 | 41 | 42 | 43 | 44 |
| nape to waist | 40.2 | 40.6 | 41 | 41.4 | 41.8 | 42.2 | 42.6 | 43 | 43.4 | 43.8 |
| sleeve length | 57.5 | 58 | 58.5 | 59 | 59.5 | 60 | 60.25 | 60.5 | 60.75 | 61 |
| back width | 32.4 | 33.4 | 34.4 | 35.4 | 36.4 | 37.4 | 38.4 | 39.8 | 41.2 | 42.6 |
| chest | 30 | 31.2 | 32.4 | 33.6 | 34.8 | 36 | 37.2 | 39 | 40.8 | 42.6 |

Aynı sayfada kısa/uzun düzeltmesi: **short women nape to waist −2, sleeve
length −2.5; tall +2 / +2.5.**
Ayrıca sayfanın kendi cümlesi: *"is compliant with the body measurement charts
given in the standard BS EN 13402-3"* — EN 13402-3'e erişemedik (aşağıda), ama
Aldrich 6. baskı kendini o standarda uyumlu ilan ediyor.

---

### 1.1 HÜKÜM TABLOSU

#### `shoulderCM` — çizelge: 36, 36.5, 37, 37.5, 38, 38.5, 39, 40, 41, 42

| aday yayın (künye) | yayının sayıları (EU34→EU52, cm) | FARK (mm, çizelge − yayın) | hüküm |
|---|---|---|---|
| burda style Damen Maßtabellen, **Schulterbreite**, s.2 (URL yukarıda) | 12 · 12,5 · 12,5 · 13 · 13 · 13,5 · 13,5 · 14 · 14 · 14,5 | +240 · +240 · +245 · +245 · +250 · +250 · +255 · +260 · +270 · +275 | **BAĞLANAMAZ** — yayın TEK omuz dikişini ölçüyor ("Vom Halsansatz bis zur Armkugel"), çizelge onun ~3 katını taşıyor: aynı ada iki farklı BÜYÜKLÜK. |
| Aldrich 6. baskı s.11, **shoulder** | 11.75 · 12 · 12.25 · 12.5 · 12.75 · 13 · 13.25 · 13.6 · 13.9 · 14.2 | +242.5 · +245 · +247.5 · +250 · +252.5 · +255 · +257.5 · +264 · +271 · +278 | **BAĞLANAMAZ** — aynı tanım uyuşmazlığı; oran 3.064 → 2.958. |
| Aldrich 6. baskı s.11, **back width** (büyüklük sınıfı olarak EN YAKIN aday) | 32.4 · 33.4 · 34.4 · 35.4 · 36.4 · 37.4 · 38.4 · 39.8 · 41.2 · 42.6 | +36 · +31 · +26 · +21 · +16 · +11 · +6 · +2 · −2 · −6 | **BAĞLANAMAZ** — aralık örtüşüyor ama GRADE tutmuyor: Aldrich +1.0 cm/beden, çizelge +0.5 cm/beden; fark tekdüze daralıp işaret değiştiriyor (36mm → −6mm). Bir tablo 36mm hatayla bağlanamaz. |
| Aldrich 6. baskı s.11, **chest** | 30 · 31.2 · 32.4 · 33.6 · 34.8 · 36 · 37.2 · 39 · 40.8 · 42.6 | +60 · +53 · +46 · +39 · +32 · +25 · +18 · +10 · +2 · −6 | **BAĞLANAMAZ** — aynı sınıf, daha kötü. |

**Sonuç: BAĞLANAMAZ.** ★ Bu turda kesinleşen şey bir sayı değil bir SINIF:
36-42cm kolonu bir **omuz dikişi** değil, **across-back / across-shoulder**
sınıfı bir büyüklük. Yayınlarda o sınıfın serileri VAR (Aldrich back width
32.4-42.6) ama grade'i çizelgeninkinin **iki katı**. Yani kolon yalnız kaynaksız
değil, kendi büyüklük sınıfının yayınlanmış grade'iyle de çelişiyor.

**Nerelere bakıldı (shoulderCM):** burda style Damen Maßtabellen (birincil,
çekildi) · Aldrich 6. baskı s.11 (birincil, çekildi) · ISO 8559-1:2017 (madde
listesi görüldü: "shoulder length", "back shoulder width", "across back
shoulder width" tanımları s.47'de; **sayı basmıyor, yalnız tanım** —
https://www.iso.org/standard/61686.html, örnek PDF
https://cdn.standards.iteh.ai/samples/61686/d6f1d29d3ae94fd79871997a574038b9/ISO-8559-1-2017.pdf)
· EN 13402-3 Annex A (tablolar orada ama **paywall**, önizleme sayı vermiyor:
https://standards.iteh.ai/catalog/standards/cen/6f32b946-60fb-4e0f-b355-1d999706a661/en-13402-3-2017)
· ASTM D5585 (**2020'de geri çekildi**, satın alınabilir; ücretli PDF YASAK:
https://store.astm.org/d5585-11e01.html) · ANSUR II 2012 raporu
(https://apps.dtic.mil/sti/tr/pdf/ADA611869.pdf → **HTTP 403, erişilemedi**;
zaten beden-grade'li değil, popülasyon istatistiği) · Craft Yarn Council
"Woman Size Charts" (https://www.craftyarncouncil.com/standards/body-sizing —
sayfa metninde sayı tablosu gömülü değil, **erişilemedi**; ayrıca bedenleri
XS-5X, EU değil) · M. Müller & Sohn Maßtabelle (**82 EUR, satın alınmadı** —
https://www.muellerundsohn.com/en/shop/measurement-charts-for-womens-wear/;
sitesinin ücretsiz sayfasında tanım var, sayı yok:
https://www.muellerundsohn.com/en/allgemein/taking-measurements/).

---

#### `backLengthCM` — çizelge: 39.5, 40, 40.5, 41, 41.5, 42, **42**, 42.5, 43, 43.5

| aday yayın (künye) | yayının sayıları (EU34→EU52, cm) | FARK (mm) | hüküm |
|---|---|---|---|
| Aldrich 6. baskı s.11, **nape to waist** | 40.2 · 40.6 · 41 · 41.4 · 41.8 · 42.2 · 42.6 · 43 · 43.4 · 43.8 | −7 · −6 · −5 · −4 · −3 · −2 · −6 · −5 · −4 · −3 | **BAĞLANAMAZ** — en yakın aday (max 7mm) ama hiçbir bedende tutmuyor; fark testere dişi (EU44'te −2, EU46'da −6) çünkü Aldrich +0.4 tekdüze, çizelge EU44→EU46'da 0.0 basıyor. |
| burda style **Rückenlänge NORMAL** (168) | 40,5 · 41 · 41,5 · 42 · 42,5 · 43 · 43,5 · 44 · 44,5 · 45 | −10 ×6, sonra −15 ×4 | **BAĞLANAMAZ** — çizelge EU34-EU44'te tam 1.0cm altında, EU46'dan sonra 1.5cm altına düşüyor. Sabit ofset bile değil. |
| burda style **Rückenlänge KURZ** (160) | 38 · 39 · 39 · 40 · 40 · 41 · 41 · 42 · 42 · 43 | +15 · +10 · +15 · +10 · +15 · +10 · +10 · +5 · +10 · +5 | **BAĞLANAMAZ** — çizelge Burda'nın Normal ve Kurz serilerinin ARASINDA duruyor, ikisiyle de kesişmiyor. |
| burda style **Rückenlänge LANG** (176) | 42,5 · 43 · 43,5 · 44 · 44,5 · 45 · 45,5 · 46 · 46,5 · 47 | −30 · −30 · −30 · −30 · −30 · −30 · −35 · −35 · −35 · −35 | **BAĞLANAMAZ** |
| Aldrich s.11 **short women** düzeltmesi (nape to waist −2) | 38.2 · 38.6 · 39 · 39.4 · 39.8 · 40.2 · 40.6 · 41 · 41.4 · 41.8 | +13 · +14 · +15 · +16 · +17 · +18 · +14 · +15 · +16 · +17 | **BAĞLANAMAZ** |

**Sonuç: BAĞLANAMAZ.**

★ **18B turunun bir cümlesi bu turda DÜZELTİLDİ.** `tables.json` `_sources`
notu diyor ki: *"Var olan düz koşular yalnız serinin UÇLARINDA."* **Yanlış.**
Burda **Kurz** serisi baştan sona ikişerli düz koşuyor (38,39,39,40,40,41,41,
42,42,43) — düz adım serinin ortasında ve normaldir. Çizelgenin gerçek anomalisi
"düz adım var" değil, **düz adımın YALNIZCA BİR KEZ ve tam EU44→EU46'da** olması:
sekiz +0.5 adımın arasına tek bir 0.0 sıkışmış. Böyle bir seri hiçbir yayında
bulunamadı. Kolonu kırmızı tutan gerekçe ayakta, gerekçenin CÜMLESİ değişmeli.
(Not: bu satır `contract/tables.json` içinde ve karta göre dokunulmadı.)

**Nerelere bakıldı:** yukarıdaki dört yayın + EN 13402-3 Annex A (paywall) +
ISO 8559-1 (tanım basıyor, sayı basmıyor) + Müller & Sohn (ücretli).

---

#### `armLengthCM` — çizelge: 57, 57.5, 58, 58.5, 59, 59.5, 60, 60.5, 61, 61.5

| aday yayın (künye) | yayının sayıları (EU34→EU52, cm) | FARK (mm) | hüküm |
|---|---|---|---|
| Aldrich 6. baskı s.11, **sleeve length** | 57.5 · 58 · 58.5 · 59 · 59.5 · 60 · 60.25 · 60.5 · 60.75 · 61 | −5 · −5 · −5 · −5 · −5 · −5 · −2.5 · **0** · +2.5 · +5 | **BAĞLANAMAZ** — sadece EU48'de kesişiyor. Çizelge Aldrich'in −0.5 kaydırılmışı DEĞİL: Aldrich beden 18'de eğimi +0.25'e kırıyor, çizelge kırmıyor, o yüzden fark üst uçta işaret değiştiriyor. |
| burda style **Armlänge KURZ** (160) | 57 · 57 · 58 · 58 · 59 · 59 · 59 · 59 · 60 · 60 | **0** · +5 · **0** · +5 · **0** · +5 · +10 · +15 · +10 · +15 | **BAĞLANAMAZ** — 10 bedenin 3'ünde tam tutuyor (34/38/42) ve gerisi kaçıyor; çizelge Kurz'un düzleştirilmiş/interpole edilmişi gibi duruyor ama üst uçta 15mm ayrılıyor. |
| burda style **Armlänge NORMAL** (168) | 59 · 59 · 60 · 60 · 61 · 61 · 61 · 61 · 62 · 62 | −20 · −15 · −20 · −15 · −20 · −15 · −10 · −5 · −10 · −5 | **BAĞLANAMAZ** |
| burda style **Armlänge LANG** (176) | 61 · 61 · 62 · 62 · 63 · 63 · 63 · 63 · 64 · 64 | −40 · −35 · −40 · −35 · −40 · −35 · −30 · −25 · −30 · −25 | **BAĞLANAMAZ** |

**Sonuç: BAĞLANAMAZ.** Ek gözlem, kolonun kendi yapısından (yayın değil):
kusursuz **+0.5 × 9** doğrusal. Hem Aldrich hem Burda üst bedenlerde eğimi
KIRIYOR (Aldrich +0.25'e, Burda düz koşuya); çizelge kırmıyor. Yayınlanan iki
bağımsız seride de var olan bir kırılmanın çizelgede hiç olmaması, kolonun bir
tablodan değil bir DOĞRUDAN üretildiğinin göstergesi — ama bu bir kanıt değil,
işaret; kolon kaynaksız kaldığı için hüküm zaten BAĞLANAMAZ.

★ Bir tanım uyarısı: Burda **Armlänge** vücut ölçüsü ("Schulterpunkt bis
Handwurzel"), Aldrich **sleeve length** bir çizim/kol ölçüsü. İkisi aynı ad
altında kıyaslandı çünkü çizelgenin kolonu hangisi olduğunu SÖYLEMİYOR.
Kolon bağlanacaksa önce hangi büyüklük olduğu ilan edilmeli.

---

#### `neckCM` — çizelge: 34, 34.5, 35, 36, 36.5, 37, 38, 39, 40, 41

| aday yayın (künye) | yayının sayıları (EU34→EU52, cm) | FARK (mm) | hüküm |
|---|---|---|---|
| Aldrich 6. baskı s.11, **neck size** | 35 · 36 · 37 · 38 · 39 · 40 · 41 · 42 · 43 · 44 | −10 · −15 · −20 · −20 · −25 · −30 · −30 · −30 · −30 · −30 | **BAĞLANAMAZ** — tek beden tutmuyor; fark tekdüze büyüyüp −30mm'de doyuyor. Aldrich +1.0 tekdüze, çizelge .5/.5/1/.5/.5/1/1/1/1. |
| burda style Damen Maßtabellen | — **satır YOK** | ölçülemez | **BAĞLANAMAZ** — yayın bu büyüklüğü hiç basmıyor (12 satırın tamamı bu turda listelendi, Halsumfang aralarında değil). |

**Sonuç: BAĞLANAMAZ.** Çizelgenin 4 kaynaksız kolonu arasında **en büyük
mutlak sapmayı taşıyan kolon budur** (30mm) ve `sizechart_source_check`
dışındaki en sert kapıyı süren de bu.

**Nerelere bakıldı (neckCM):** burda style (birincil, çekildi — satır yok) ·
Aldrich 6. baskı s.11 (birincil, çekildi) · ISO 8559-1:2017 §5.3.2 "Neck girth"
(tanım s.33: *"tape-measure passed 2 cm below the Adam's apple and at the level
of the 7th cervical vertebra"* — **tanım basıyor, sayı basmıyor**) ·
EN 13402-3:2017 Annex A (paywall) · ASTM D5585 (geri çekildi, ücretli) ·
ANSUR II (403) · Müller & Sohn (ücretli) · Craft Yarn Council (sayı çekilemedi).

---

### 1.2 KAPI İÇİN NE DEĞİŞTİ?

**Hiçbir kolon yeşile dönmüyor. Dört kolonun dördü de BAĞLANAMAZ.**
`engine/tests/sizechart_source_check.mjs` bu turdan sonra da KIRMIZI kalır ve
kalmalıdır: kapının bitiş şartı (dosyanın kendi satırı, s.29-34) "aday arandı"
değil, *"matched to a published table whose url and numbers go into `_sources`"*.
Bu turda dört kolon için de eşleşme YOK.

Bu turun kapıya kattığı tek şey, notların **hassaslaşması**: artık her kolon
için (a) en yakın yayın, (b) mm cinsinden fark vektörü, (c) BAĞLANAMAZ'ın
gerekçesi (tanım mı, grade mi, ofset mi) elde. Üçü de `_sources` notlarına
yazılabilir — ama o düzenleme `contract/` altındadır, **bu kartta YASAK**;
V1-C'nin girdisi olarak burada bırakıldı.

---

## BÖLÜM 2 — REGRESYON MÜHÜRÜNÜ (GOLDEN BASELINE) YENİLEME PRATİĞİ

Soru: davranış değişikliği ilan edilerek baseline taşınır mı, taşınırsa hangi
kayıt zorunludur?

**Kısa cevap: EVET, taşınır — ve yayınlanmış pratiğin tamamı taşımayı değil,
taşımanın KAYDINI şart koşar.** Aşağıdaki maddelerin hepsi bu turda birincil
dokümandan çekildi (alıntılar verbatim).

### Ş1. Baseline'ın yenilenmesi normal ve beklenen bir iştir — yasak değildir
- Emily Bache, *"Why we should be saying 'Approval Testing' instead of 'Golden
  Master'"*, 19 Mar 2021,
  https://coding-is-like-cooking.info/2021/03/why-we-should-be-saying-approval-testing-instead-of-golden-master/
  — *"We need to be able to 'approve' a new version of the output and see that
  as a normal part of our work."* ve *"What is correct program behaviour today
  will not necessarily be correct program behaviour tomorrow, and we need to
  update our understanding and our tests."*

### Ş2. Önce HÜKÜM: bu bir hata mı, kasıtlı bir davranış değişikliği mi?
- Jest, *Snapshot Testing* resmi dokümanı, https://jestjs.io/docs/snapshot-testing
  — *"If we had any additional failing snapshot tests due to an unintentional
  bug, we would need to fix the bug before re-generating snapshots to avoid
  recording snapshots of the buggy behavior."*
- Aynı doküman, kasıtlı hal: *"Now, let's talk about the case when a snapshot
  test is failing due to an intentional implementation change."*
→ **Sıra bağlayıcı: önce teşhis, sonra mühür. Kırmızıyı susturmak için mühür
taşımak bu literatürde açıkça yasaklanmış.**

### Ş3. Onaylayan bir İNSAN olacak (otomatik yenileme meşru değil)
- Nicolas Carlo, *"What's the difference between Regression Tests,
  Characterization Tests, and Approval Tests?"*, understandlegacycode.com,
  https://understandlegacycode.com/blog/characterization-tests-or-approval-tests/
  — *"I prefer 'Approval' because it suggests the behavior has been approved by
  a human, and we can change that."* / *"I think the human aspect is important
  to this process. We are in control of evolving the software."*
- Bache (a.g.e.): *"That step where you 'approve' the output is crucial to the
  success of the test case later on."*

### Ş4. Yeni mühür kaynak kontrolüne girer ve kod gibi REVIEW edilir
- Jest (a.g.e.): *"Commit snapshots and review them as part of your regular code
  review process. This means treating snapshots as you would any other type of
  test or code in your project."*
- Aynı yerde niyet açıkça yazılı: *"The goal is to make it easy to review
  snapshots in pull requests, and fight against the habit of regenerating
  snapshots when test suites fail instead of examining the root causes of their
  failure."*

### Ş5. Taşımanın GEREKÇESİ yazılı kayda geçer (commit/CL açıklamasına)
- Chromium, *Web Test Expectations and Baselines*,
  https://chromium.googlesource.com/chromium/src/+/HEAD/docs/testing/web_test_expectations.md
  — *"When you rebaseline a test, make sure your commit description explains why
  the test is being re-baselined."*

### Ş6. Kalan sapma bir İZLEME KAYDINA bağlanır (bug id), ve o kayıt beklentinin
### kaldırılmasını takip eder
- Chromium (a.g.e.): *"Lines are expected to have one or more bug identifiers,
  and the linter will complain about lines missing them."*
- Chromium, *web-platform-tests*,
  https://chromium.googlesource.com/chromium/src/+/HEAD/docs/testing/web_platform_tests.md
  — text baseline eklemek için: *"CLs that add text baselines must include a
  crbug.com link for an issue tracking the removal of the text expectations."*
  ve *"Remember to create an issue tracking the expectation's removal, and to
  link the issue in the CL description."*

### Ş7. Taşımanın KAPSAMI daraltılır (her şeyi birden yenileme)
- Jest (a.g.e.): *"If you'd like to limit which snapshot test cases get
  re-generated, you can pass an additional `--testNamePattern` flag to re-record
  snapshots only for those tests that match the pattern."*
- Chromium (a.g.e.), tek testi yerelde: `run_web_tests.py --reset-results
  foo/bar/test.html`; CL'e bağlı yenileme için önerilen yol
  `blink_tool.py rebaseline-cl` (yani mühür, koşan bir işin çıktısından taşınır,
  elle yazılmaz).

### Ş8. Mühür hatalı davranışı kodluyorsa bu AÇIKÇA ilan edilir
- Chromium (a.g.e.): *"In both cases, the convention is to check in a new
  baseline (aka rebaseline), even though that file may be codifying errors."*
→ Yani "mühür = doğruluk belgesi" DEĞİL. Mühür, o günkü davranışın kaydıdır ve
kaydın yanlış olabileceği yayınlanmış pratikte kabul edilmiştir. Bu, `RULES.md`
§6'nın ("sayılar test çıktısında yaşar, dokümanda değil") aynı yöne bakan hali.

### 2.1 stitchu'nun mevcut mühür mekanizması bu şartlara göre nerede?

`scripts/repin-golden.sh` + `engine/GOLDEN-PIN.md` okundu. Karşılaştırma:

| şart | stitchu'da var mı? | kanıt (dosya + satır) |
|---|---|---|
| Ş1 taşınabilir olması | VAR | `repin-golden.sh` — *"The ONLY sanctioned way to move the golden pin."* |
| Ş2 önce teşhis | VAR (yazılı) | `GOLDEN-PIN.md:5-7` — *"a FAIL means either fix the engine or do a declared re-pin"* |
| Ş3 insan onayı | VAR | `repin-golden.sh:37` — *"Damla's explicit approval for the behavior change"*; `GOLDEN-PIN.md:6-7` |
| Ş4 kaynak kontrolü + birlikte review | VAR | `repin-golden.sh:38` — *"commit the csv + ledger together"* |
| Ş5 yazılı gerekçe | VAR, Chromium'dan DAHA SERT | `repin-golden.sh:33-36` — etiket + "what changed" + "content diff summary (garments changed in place, not just line arithmetic)" + evidence links |
| Ş6 kalan sapma bir izleme kaydına bağlı | **YOK** | Defterde bug-id/izleme alanı yok. En yakını `GOLDEN-PIN.md:31-33`'teki *"DAMLA TASTE-CHECK PENDING"* — bir durum satırı, izlenen bir kayıt değil. |
| Ş7 kapsam daraltma | **YOK** | `repin-golden.sh:18-28` mühürü **hep tümden** basar (`golden_dump > /tmp/...` → tam dosya kopyası). Tek giysi/tek kural yenileme yolu yok. |
| Ş8 "mühür hatalı olabilir" ilanı | KISMEN | Defterde 2026-07-19 kaydı *"paper-verified … MUSLIN PENDING: no sewn proof yet"* diyor — doğru sınıf ilan, ama zorunlu bir alan değil, o kaydın yazarının inisiyatifi. |

★ Ve mekanizmanın kendi kayıtlarında bir AÇIK duruyor: `GOLDEN-PIN.md`'nin en
üstteki girdisi **2026-07-28 — "(DAMLA APPROVAL PENDING)"**, kendi içinde
*"NOT committed until approved."* diyor. Yani defterin en yeni satırı, kendi
şartını sağlamadığını ilan eden bir satır. Bu tur onu **doğrulamadı** (`git`
geçmişine ve `engine/golden-reference.csv`'nin bugünkü md5'ine bakmak kart
GİRDİSİ değildi, bakılmadı) — **DOĞRULANMADI**, V1-A kartına düşer.

**BÖLÜM 2 HÜKMÜ:** Baseline taşımak yayınlanmış pratikte MEŞRUDUR; meşruiyeti
sekiz şarta bağlıdır ve stitchu bunların **altısını zaten sağlıyor, ikisini
(Ş6 izleme kaydı, Ş7 kapsam daraltma) sağlamıyor.** V1-A kartı mühürü taşımayı
düşünüyorsa eksik olan bunlardır; "taşınır mı" sorusunun cevabı EVET'tir.

---

## BÖLÜM 3 — `mandal.taban_v3` İÇİN YAYINLANMIŞ BANT/ORAN VAR MI?

### 3.1 Bandın ölçtüğü büyüklük tam olarak nedir?

`contract/figure-bands.json` `mandal._not` (verbatim): *"bel = gövde profil
GERÇEK en-dar nokta (üst %10/alt %18 hariç), bust = bel üstü max
(engine/tools/figure-lint.mjs, figur-denetimi v3)"*. Yani `taban_v3`'ün her
girdisi, **çizilen bir teknik flat'in SİLÜET profilinden okunan
en-dar-genişlik / bel-üstü-max-genişlik** oranıdır ve **stil başına** pinlenir
(`drift_tolerans` ±0.02).

Aynı dosya bunu kendisi ilan ediyor (`mandal._not`, verbatim):
*"(3) DRESS/PİNLİ → taban değere drift-lock ±0.02 (onlar pin hakikati;
body-bandı değil **stilizasyon** — princess_dress 0.623 bilinen band-dışı,
kart değil pin)."*

**Bu, üç ayrı sınıfın ayrımıdır ve karışması kolon-tanımı hatasıyla aynı sınıf:**
1. **VÜCUT oranı** (bel çevresi / büst çevresi) — yayınlanmış, var.
2. **GİYSİ silüet oranı** (bir 2B çizimin en-dar-en / bel-üstü-max-en) — aranan.
3. **STİL PİNİ** (o çizimin bugünkü değeri, regresyon mührü) — `taban_v3` bu.

`taban_v3`'ün 16 değerinden **üçü 1.0'ın üstünde** (`peterpan_puff` 1.001,
`lace_vneck_70s` 1.003, `courtney_lace_vneck` 1.003). Bir VÜCUT oranı 1.0'ı
aşmaz sayılır (bel büstten geniş olurdu); bu üç değer, ölçümün bir vücut oranı
DEĞİL bir çizim oranı olduğunun kendi içindeki kanıtıdır. Nitekim dosyanın
kendi notu da bunu söylüyor: *"oran ~1.0, bel ve büst aynı hatta okunuyor"*.

### 3.2 Arama sonucu

**YAYIN YOK.** Aranan şey — bir giysi teknik flat çiziminin silüet
en-dar/büst-max oranı için, hele stil sınıfı başına, yayınlanmış bir bant ya da
oran — bulunamadı.

Bulunan ve **bu büyüklüğü ölçmediği için aday sayılmayan** yayın sınıfları:

| bulunan | ne veriyor? | neden aday değil? |
|---|---|---|
| 9-baş / 7-8-baş croquis geleneği (ör. https://vizcom.com/blog/fashion-croquis · https://www.fashion-flats.com/fashion-croquis/ · https://techpackwizard.com/fashion-croquis/) | figürün BAŞ-birimi oranları: *"shoulders are about two heads wide and waist is about one head wide"*, *"the waist … should be 3/4-1 head wide"* | Payda **omuz**, pay **bel**; `taban_v3`'ün paydası **bel-üstü max (büst hattı)**. Ayrıca bu bir ÇIPLAK FİGÜR oranı, stil başına değişmez — `taban_v3` stil başına 0.643'ten 1.003'e gidiyor. Bant olarak kullanılamaz. |
| WHR / BWR literatürü (ör. https://pmc.ncbi.nlm.nih.gov/articles/PMC4050298/) | bel/kalça ve büst/bel ÇEVRE oranları, popülasyon ve çekicilik çalışmaları | ÇEVRE oranı, GENİŞLİK oranı değil; ve bir giysinin değil bir vücudun. |
| `figure-bands.json`'un kendi `ratios.waist_bust` bandı [0.72, 0.84] | `_kaynaklar.eu36` = 66/84 = 0.786 | ★ Bu bir DIŞ yayın değil: sayı **çizelgenin kendisinden** türetilmiş. Kartın açık yasağı (*"Sayıyı çizelgenin kendisinden türetip 'kaynak' diye sunma — V0-0F §5'te ölçüldü ve REDDEDİLDİ"*) tam olarak bunu kapsar. Bant olarak kullanılıyor ama **kaynaklı sayılamaz.** |
| Zoe Hong female flat template ölçümü (`_kaynaklar.template`) | silüet yan-hat waist/bust half-width = 0.812 | Bu bir ÖLÇÜM, bir yayın değil; ve dosyanın kendi notu paydanın uyuşmadığını yazıyor: *"template silüet metriği göğüs dairesini HARİÇ tutar … figure-lint bel/büst en-dar-nokta metriğiyle birebir payda değil"*. |

**Nerelere bakıldı (Bölüm 3):** fashion-flat/croquis proporsiyon literatürü
(yukarıdaki üç kaynak + https://fashionillustrationtribe.com/fashion-sketch-proportions/
+ https://www.pointsofmeasure.com/tutorials-education/diy-technical-design-section-2-drawing-technical-flats-and-croquis)
· antropometrik oran literatürü (WHR/BWR, PMC4050298) · ISO 8559-1 (vücut
tanımları; giysi çizimi oranı basmıyor) · EN 13402-3 (vücut ölçüsü tabloları,
paywall — ve zaten çizim oranı basmaz).

### 3.3 `figure_check` (V1-D) için sonuç

`taban_v3` bir BANT değil, **stil başına bir regresyon mührüdür** — Bölüm 2'nin
konusu olan golden baseline ile aynı sınıftan bir nesne. Dolayısıyla:
- Ona dış kaynak aramak **kategori hatasıdır**; aranacak kaynak yoktur ve
  bulunmaması bir eksiklik değildir. Bu turun hükmü: **YAYIN YOK, ve YAYIN
  ARANMAMALI.**
- Ona uygulanacak disiplin Bölüm 2'nin Ş1-Ş8'idir: taşınabilir, ama teşhis →
  insan onayı → yazılı gerekçe → dar kapsam ile.
- ★ Dosya bunu zaten **uyguluyor ve kayda geçiriyor**: `_taban_v3_repin`
  (2026-08-04) taşımanın gerekçesini commit'e kadar iniyor (43fd696, bustX
  çarpanı, ölçülen +%3.21..+%3.44 vs aritmetiğin verdiği +%3.50, ve kımıldamayan
  üç kontrol pini) ve *"drift_tolerans 0.02 elle GENİŞLETİLMEDİ"* diyor. Bu,
  Chromium'un Ş5'inden daha ayrıntılı bir kayıttır.
- Bandın kendisi (`figurel_top_band` [0.72,0.84], `boxy_min` 0.93) ise
  `ratios.waist_bust`'a dayanıyor ve o da çizelgeden türetilmiş → **kaynaksız**.
  `figure_check`'in gerçek kaynaksız kalemi `taban_v3` değil, **bandın kendisi**.

---

## KART DIŞI FARK EDİLEN (dokunulmadı)

1. **`_taban_v3_pinsiz_kalan` — `dress_bandeau_circle` bilerek kırmızı.**
   Dosyanın kendi notu kapanışın *"silüet kararı, pin kararı değil"* olduğunu
   yazıyor. Bölüm 3'ün hükmü bunu destekliyor: pin uydurmak yasak, ama bandın
   kendisi de kaynaksız olduğu için "band-dışı" hükmü zayıf bir zemine dayanıyor.
2. **Aldrich 6. baskı s.11, EN 13402-3'e uyum İDDİA EDİYOR** (*"is compliant
   with the body measurement charts given in the standard BS EN 13402-3"*).
   Eğer bu iddia doğrulanabilirse, Aldrich s.11 tablosu EN 13402-3'ün ücretli
   ekine ulaşmadan onun vekili olarak kullanılabilir. **DOĞRULANMADI** —
   EN 13402-3 Annex A'ya erişilemedi.
3. **`waistCM` kolonu için 18B'nin notu bu turda desteklendi:** çekilen Aldrich
   6. baskı s.11 waist serisi **64,68,72,76,80,84,88,94,100,106**; çizelge
   **62,66,70,74,78,82,86,92,98,104** — her bedende tam **−2cm**. Yani kolon
   Burda ile birebir, Aldrich 6. baskı ile birebir 2cm kaymış. Not doğru.
   ⚠ Aynı şey `hipCM` için de: Aldrich s.11 hips **88,92,96,100,104,108,112,
   118,124,132**; çizelge **86,90,94,98,102,106,110,116,122,128** → −2cm ×9 ve
   EU52'de **−4cm**. `hipCM` `_sources` notu bu farkı hiç anmıyor (waistCM notu
   anıyor). Kolon `verified` ve Burda ile 10/10 tutuyor, yani hüküm değişmiyor —
   ama not eksik.
4. **`euSizes` 10 beden (EU34..EU52), `_fields` 7 kolon = 70 sayı.** Kapının
   kendi çıktısı da 70 der. Kart "EU32..EU50" diyor; kartla ağaç uyuşmuyor.
5. **`engine/GOLDEN-PIN.md` en üstteki girdi "DAMLA APPROVAL PENDING" ve
   "NOT committed until approved"** — 2026-07-28 tarihli, bugün 2026-08-24.
   Dört haftadır bekleyen bir mühür kaydı. Durumu **DOĞRULANMADI** (git/csv
   md5'ine bakmak bu kartın girdisi değildi).
6. **`repin-golden.sh` `md5 -q` kullanıyor** (macOS), Linux yedeği `md5sum`
   ile var — taşınabilir. Sorun değil, sadece kayıt.

## ERİŞİLEMEYENLER (künye + sebep)

| yayın | sebep |
|---|---|
| EN 13402-3:2017 Annex A (CEN) | paywall; önizleme sayı basmıyor — https://standards.iteh.ai/catalog/standards/cen/6f32b946-60fb-4e0f-b355-1d999706a661/en-13402-3-2017 |
| ISO 8559-1:2017 / ISO 8559-2:2017 tam metin | paywall; ücretsiz örnekte yalnız içindekiler + birkaç tanım — https://www.iso.org/standard/61686.html |
| ASTM D5585 (her baskı) | ücretli, ve **2020'de geri çekildi** — https://store.astm.org/d5585-11e01.html |
| M. Müller & Sohn resmi Damen Maßtabelle (2. baskı, Mart 2019, 16 sayfa A4) | ücretli (~82 EUR), kart ücretli PDF satın almayı yasaklıyor — https://www.muellerundsohn.com/en/shop/measurement-charts-for-womens-wear/ |
| ANSUR II 2012 raporu (DTIC ADA611869) | **HTTP 403** — https://apps.dtic.mil/sti/tr/pdf/ADA611869.pdf |
| Craft Yarn Council "Woman Size Charts" sayısal tablo | sayfa metninde tablo gömülü değil; ayrıca bedenler XS-5X, EU değil — https://www.craftyarncouncil.com/standards/body-sizing |
| Aldrich 6. baskı kitabın kendisi | elde yok; s.11 tablosu üçüncü-taraf ders PDF'inden çekildi (künyesi sayfada basılı). Alıntı-doğrulaması AÇIK — `knowledge/drafting-math-eu38.md`'nin kendi uyarısıyla aynı durum. |
