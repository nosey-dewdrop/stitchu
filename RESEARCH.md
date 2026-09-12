# RESEARCH — "fotoğraf/prompt → flat + kalıp" dünyada NASIL yapılıyor?

13 Eyl 2026. Kalıcı referans; bir daha araştırılmayacak. Kapsam: **sadece NASIL**, teori yok.
Eski tarama (23 Ağu: GarmentCode sınıf imzaları, Seamly2D primitifleri, FreeSewing makroları,
DXF-AAMA katmanları) **hâlâ geçerli, tekrar edilmedi** → `docs/1309-research-0823-world-scan.md`.
Bu dosya onun üstüne **A (flat)**, **B4 (ticari foto→kalıp)**, **C (VLM)**, **D (editleme)** ekler.
Lisans her kalemde; kaynağı zayıfsa **DOĞRULANMADI**.

## 0. TEK CÜMLELİK MANZARA
**Fotoğraf kabul eden hiçbir ürün üretim formatı (DXF) vermiyor; DXF veren hiçbir ürün
fotoğraf kabul etmiyor.** Araştırma tarafı panel poligonu + dikiş grafını çözdüğünü iddia
ediyor (DressWild %94) ama **kodu yok**. Flat tarafında ise pazarın tamamı diffusion ile
*render* üretiyor; temiz vektör technical flat üreten olgun ürün pratikte yok.

## A. GÖRÜNÜM ÜRETİMİ (flat)
### A1. Ticari araçlar — hangisi gerçekten LINE DRAWING veriyor?
| Ürün | Girdi | Çıktı | Mekanizma |
|---|---|---|---|
| **aitechpacks** Flat Sketch Generator | giysi fotoğrafı (flat-lay, ≤5MB) | **PNG + SVG** | açıklanmamış (DOĞRULANMADI) |
| **LOOK AI** Flat Sketch Generator | referans görsel | "flat sketch-style visuals" | diffusion; format belirtilmemiş |
| Raspberry AI, Resleeve, Fashable, Ablo, NewArc | prompt/sketch | **photoreal render** | diffusion |
| CLO3D / Browzwear / Style3D | 3D model | DXF kalıp | **parametrik geometri + kumaş sim** |
- aitechpacks: ücretsiz hesap **ayda 2 flat**; ücretli tier DOĞRULANMADI. https://aitechpacks.com/flatsketchgenerator
- LOOK AI kendi sayfası *"should be checked and refined by a designer"* diyor → production-grade değil.
- **CALA artık "Mercer"** — eski isimle arama ölü link verir.
- **Sonuç: "prompt/foto → temiz VEKTÖR technical flat" pazarda boş.** Herkes render üretiyor.
### A2. LoRA — fashion flat için eğitilmiş var mı?
**Tek olgun aday: `matteomarjanovic/flatsketcher`** (HF API'den doğrulandı, 13 Eyl 2026)
- Base: **FLUX.1-schnell** · License: **apache-2.0** (ticari SERBEST)
- Trigger `FLTSKC` · downloads **14**, likes **0**, son değişiklik **2025-02-08**
- Demo Space ("Draptic") **runtime error — çalışmıyor**
- Repo geçmişi flux-dev → schnell'e taşınmış (muhtemelen lisans yüzünden)
- **Eğitim görsel sayısı yayınlanmamış → DOĞRULANMADI**

**★ LİSANS TUZAĞI — ürün kararı:**
- **FLUX.1-dev = NON-COMMERCIAL.** dev üstüne eğitilmiş LoRA **satılamaz**
  (BFL ticari lisansın yoksa). https://bfl.ai/legal/non-commercial-license-terms
- **FLUX.1-schnell = Apache-2.0**, serbest.
- Civitai'deki fashion sketch LoRA'larının çoğu **dev tabanlı → ticari olarak kullanılamaz**
  (ör. civitai.com/models/1232071 "Fashion Sketches", base Flux.1 D, NC lisans — doğrulandı).
- **Civitai'de "fashion technical flat"e özel LoRA BULUNAMADI.** Var olanlar genel line art:
  `strangerzonehf/Flux-Sketch-Flat-LoRA`, `jeremytai/techlinedrawing` (fashion'a en yakın ikinci).
- `aihpi/flux-fashion-lora` — **H&M Fashion Caption Dataset, 12k görsel** — ama çıktısı
  *realistic clothing*, flat DEĞİL.
### A3. Raster → SVG
| Araç | Lisans | ★ | Son commit | Not |
|---|---|---|---|---|
| **VTracer** visioncortex/vtracer | **MIT** (GitHub API) | **6.992** | **2026-09-12** (canlı) | Rust + Python + JS binding |
| **StarVector** joanrod/star-vector | **Apache-2.0** (API) | **4.583** | **2025-11-07** | 1B ve 8B model |
- StarVector DinoScore: SVG-Icons **0.984**, SVG-Stack 0.966, Diagrams 0.959 — VTracer/LIVE/GPT-4V'yi geçiyor.
- **★ StarVector'ın kendi uyarısı:** *"will not work for natural images or illustrations"* — icon/logo/
  diagram'da iyi; technical flat o sınıfta ama **fashion flat'te ölçülmüş sayı YOK → DOĞRULANMADI.**
- VTracer, Illustrator Image Trace'ten çok daha kompakt çıktı verir; siyah-beyaz line art'ta birinci tercih.
- **Recraft V4** — native SVG üreten ticari API. **$0.08/görsel (V4), $0.035 (V4.1), $0.21 (V4.1 Pro)**,
  **ticari lisans dahil**. https://fal.ai/models/fal-ai/recraft/v4/text-to-vector
- OmniSVG (arXiv 2504.06263) — rekabetçi, **çok kısa sequence** (az node'lu SVG). Lisans DOĞRULANMADI.
- **Potrace** — siyah-beyaz bitmap→vektör, tek renk; temiz line art için hâlâ sağlam, en hafif bağımlılık.
- **★ Trace'in kör noktası:** diffusion çıktısında **stroke weight kavramı yoktur**; raster'da
  2pt ile 0.75pt farkı trace sonrası **kaybolur**. A5'teki hiyerarşi ancak vektör *doğarsa* korunur.
### A4. Gerçek tasarımcılar bugün nasıl yapıyor?
- **Adobe Illustrator + custom brush hâlâ endüstri standardı.** Topstitch brush 1pt'den; bartack **.15pt**.
  https://techpackwizard.com/adobe-illustrator-brushes-for-fashion-designers/ · LinkedIn Learning'in
  "Advanced Drawing Flats" dersinde ayrı bir *"Style guides for stroke weights"* bölümü var.
- **Etsy croquis/template pazarı canlı:** printable PDF + Illustrator CS6+ + Procreate PNG; 'clean'/
  'stylelines' iki versiyon; contour, callout, ölçü noktaları **ayrı katmanda** toggle. Ek poz +$6.
  (Kesin fiyatlar DOĞRULANMADI.)
- CLO3D/Browzwear/Style3D'den DXF export; FashionINSTA bunları köprülüyor (fashioninsta.ai).
### A5. ★ Bir flat'i "chic ve satılır" yapan şey — SAYILARLA
**Birincil kaynak: Points of Measure, "Introduction to Technical Flats" part 3/10**
https://www.pointsofmeasure.com/tutorials-education/2019/4/3/introduction-to-technical-flats-part-3-of-10
**Outline 2 pt** · Hems 1 pt · Seams 0.75 pt · **Stitch lines 0.5 pt DASHED (1.5pt çizgi /
1.5pt boşluk)** · Movement lines 0.25 pt · Bartack .15 pt
- İkinci set: stitches .25 / gathers .5 / style lines 1 / outline 2 pt. Üçüncü (px): outline 1.5 /
  seams 0.75 / crease-fold-pleat 0.35. **Oran sabit: dış kontur iç detayın ~2–4 katı.**
- **Çizgi dili:** *düz çizgi = dikiş yeri, kesikli = dikiş izi.* (pointsofmeasure + techpacker, iki bağımsız kaynak)
- **Siyah-beyaz tercih ediliyor**; gereksiz gölge/hareket efekti YOK.
  *"Black and white sketches can be easier to understand"* — yani "chic" = süs değil, **netlik**.
- Her seam/dart/stitch/button çizilecek; eksik detay = fabrika hatası. Front + back zorunlu.

**★ CROQUIS ORANI — stitchu'yu doğrudan ilgilendiren:**
- Gerçek kadın ~7.5–8 head; **fashion illustration croquis 9–10 head**; 9-head RTW sunum default'u.
- **TECHNICAL DRAWING için 7–8 head'e geri çekiliyor** — fabrikayla konuşuyor, stilize sunum değil.
- **Technical flat'i 9-head croquis'e çizmek amatörlük işaretidir.** (vizcom.com/blog/fashion-croquis)

**⚠ BİZİM DURUMUMUZLA ÇELİŞKİ (repo içi ölçüm, `law/1309-silhouette.json`):**
bizim kanun `disKonturMM 3.4 / icDikisMM 2.2` = **oran 1.55**; endüstri 2pt/0.75pt = **2.67**,
0.5-1pt vs 0.25-0.5pt = **2.0**. Kanunun kendi `_yasa` satırı da "dış kontur iç dikişin en az 2 katı"
diyor ama **sayılar bunu ihlal ediyor**. Ayrıca kanunda `kesikli: "5,3"` — endüstri ritmi **1.5/1.5 (eşit)**.

## B. KALIP ÜRETİMİ
### B4. Ticari foto→kalıp — gerçekte ne veriyorlar?
| Ürün | Girdi | Çıktı | Durum |
|---|---|---|---|
| **StitchLift** | metin + foto | **PDF** (A4/Letter/A0); SVG eğri iddiası. **DXF YOK** | Free 20 kalıp ömür boyu / **$34/ay** ticari |
| **Sewrio** | foto (flat-lay) | PDF/PNG; DXF/SVG "gelecek sürümde" | **WAITLIST — ürün değil** (~99 sırada) |
| **Tailornova** | **ÖLÇÜ (foto DEĞİL)** | **DXF** + 3D önizleme | Gerçek, ~$29/ay |
| **TailorMetric** | **ÖLÇÜ (10 boyut, foto DEĞİL)** | **SVG + true-scale PDF + DXF** | Gerçek, parametrik, 16 blok |
| PatternedAI / CGDream / Canva | foto | **seamless tekstil deseni** | "pattern" kelime oyunu — kalıp DEĞİL |

**★ StitchLift hakkındaki her olumlu iddia StitchLift'in KENDİ blogundan geliyor.**
r/sewing veya patternreview'da bağımsız kullanıcı incelemesi **bulunamadı**
(patternreview.com Tailornova konusu HTTP 403). **"StitchLift çalışıyor" dışarı söylenemez.**

Bağımsız eleştiri (Minerva Patterns, arama özeti — sayfa 403, **DOĞRULANMADI**):
*"most match statistical patterns from examples rather than reasoning about construction,
which is why they draw seams that do not walk together and curves that distort when sewn"*
→ tam olarak bizim `gate.mjs`'in ölçtüğü şey.

**Endüstri ters yönü (3D→2D):** Style3D'de 3D mesh→2D düzleştirme otomatik. CLO3D/Browzwear'da
2D kalıp **kaynaktır**, türetilmiş değil — yani foto→kalıp yönü bu ürünlerde **yok**
(kesin "yok" denemez → DOĞRULANMADI).
### B5/B6. Parametrik motorlar ve dikilebilirlik — ESKİ TARAMADA, tekrar edilmedi
GarmentCode `Edge/EdgeSequence/Panel/Interface/StitchingRule`, `isMatching(tol=0.05)`,
Seamly2D 34 primitif, FreeSewing Point API + id'li makro/`rm` çifti, DXF-AAMA 23 katman,
"walk pieces" → `docs/1309-research-0823-world-scan.md` bölüm A/B/C/D/E.

**Bizde zaten var (13 Eyl ölçümü, `law/_frozen/1309-base-graph.json`):** `panels` 5, `seams` 8,
`rings` 7, `ops` 2; seam'de `ratio`/`easeMM`, op'ta `fitLength`. **Bu, GarmentCode'un
Panel/Edge/Interface/StitchingRule modelinin JSON'a yazılmış hali** — yeniden kurmaya gerek yok.

## C. FOTOĞRAFTAN ANLAMA
### C7. Araştırma modelleri (GitHub API, 13 Eyl 2026)
| Model | Çıktı yapısı | Doğruluk | ★ | Son commit | Lisans |
|---|---|---|---|---|---|
| **SewFormer** | panel + dikiş | Panel %28.81 / Edge %34.56 | 216 | **2023-12-28 ÖLÜ** | **YOK ⚠** |
| **NeuralTailor** | panel + dikiş grafı | Panel %25.99 / Edge %29.05 | 178 | 2024-12-23 | **MIT** |
| **DressWild** (arXiv 2602.16502) | **Θ = köşe noktaları + Bézier kontrol noktaları + 6-DOF panel transform + dikiş eşleşmeleri** | **Panel %94.35 / Edge %85.41 / L² 6.22** | **KOD YOK** | — | — |
| **GarmentDiffusion** | vektörel 3D dikiş kalıbı | sayı çekilmedi | 58 | 2025-09-22 | **YOK ⚠** |
| **AIpparel** | çok-modlu text/image→garment | SOTA iddiası | 67 | 2025-07-06 | **MIT** |
| **Design2GarmentCode** | **Python programı** (GarmentCode) | — | 61 | 2025-11-19 | **MIT** (Style3D/design2garmentcode-impl) |
| **ChatGarment** | GarmentCode JSON | CD 3.12, **%0 stitching failure** | 170 | 2025-08-07 | **Apache-2.0** |
| GarmentCode (taban) | parametrik program | — | 424 | 2025-06-29 | **MIT** |
- **★ Lisanssız repo = kullanılamaz.** SewFormer ve GarmentDiffusion'da LICENSE yok → "tüm hakları
  saklı", ticari kullanım **yasal değil**.
- DressWild %94 vs SewFormer %28: kendi makale/test setlerinde, **kod yok → tekrarlanamaz.**
- **Design2GarmentCode'un kodu artık ÇIKTI (MIT)** — eski taramada "repo bulunamadı" yazıyordu, güncellendi.
### C7b. Veri setleri — lisans kritik
- **GarmentCodeData** (ETH, ECCV 2024): **115.000** veri noktası. arXiv bandı CC BY-SA 4.0 diyor ama bu
  **makalenin** lisansı olabilir; ETH kaydı (20.500.11850/673889) **HTTP 500 → DOĞRULANMADI.** CC BY-SA
  doğruysa **ShareAlike bulaşıcı** — kapalı ticari üründe sorun.
- **SewFactory** (HF `liulj/sewfactory`): **lisans beyanı YOK** (API'den doğrulandı), 253 indirme → riskli.
- **Dress4D**: araştırılmadı → DOĞRULANMADI.
### C8. VLM ile giysi okuma
- **Zero-shot VLM neckline F1 %15–48**; buna karşılık **0.77B'lik bir LoRA GPT-4o-mini'yi her kalemde
  geçiyor** → *frontier VLM'i prompt'la zorlama, küçük okuyucuyu katı şemaya fine-tune et.*
  (DOĞRULANMADI — ikincil, benchmark adı teyitsiz)
- **ChatGarment'ın kanıtlanmış şema tasarımı:** tip için **enum**, ölçü için **projection head
  üzerinden [0,1] arası float**, editlemede **JSON'un tamamını yeniden üret** (formel diff yok).
- Yapısal çıktıyı zorlama: **Outlines** (dottxt-ai/outlines, **Apache-2.0**, **15.788 ★**,
  son commit **2026-09-09**), llguidance, XGrammar, Anthropic/OpenAI structured outputs.

## D. EDİTLEME ("şuraya fiyonk ekle")
### D1. Model lisans tablosu — ürün kararı
| Model | Boyut | Lisans | Ticari? |
|---|---|---|---|
| **Qwen-Image-Edit** (2509, **2511**) | 20B | **Apache-2.0** | **evet, şartsız** |
| **OmniGen2** | **4B** | **Apache-2.0** | evet |
| Step1X-Edit v1p2 | ~19B (DOĞRULANMADI) | Apache-2.0 | evet |
| SDXL inpainting | ~3B | CreativeML OpenRAIL++-M | evet |
| FLUX.1 Fill / Kontext [dev] | 12B | FLUX.1 dev **Non-Commercial** | **ağırlık hayır / çıktı evet** |
| ICEdit | FLUX Fill LoRA | NC devralır | **hayır** (üstelik "cooperation permission" sorunuyla geri çekildi) |
- **★ FLUX lisans nüansı:** NC maddesi **ağırlığı** bağlar, **görseli** değil — *"You may use Output
  for any purpose (including for commercial purposes)"*. Offline üretip görsel satmak serbest; modeli
  **servis etmek/gömmek** yasak. Avukat gözü ister → DOĞRULANMADI.
- **Qwen-Image-2.0 (Şub 2026, 7B, AI Arena #1) API-only** — açık ağırlık değil; **açık taraf 2511'de donmuş** say.
### D2. Bölgesel editlemenin GERÇEKTE nasıl yapıldığı
Koruma modelin değil, **kontrol mekanizmasının** özelliği. Instruction editor maske istemez ama
belgelenmiş arızası **semantic drift**: prompt bölgeyi tarif etmezse model kapsamı kendi uydurur,
arka planı/ışığı sessizce yeniden render eder. Qwen tüm tuvali yeniden üretir. Pratikte sırayla:
1. **Mask-blend back** — instruction edit çalıştır, **sadece maskeli bölgeyi** orijinalin üstüne bindir.
2. **Frequency separation** — düşük frekans (ton/ışık) edit'ten, **yüksek frekans (dantel, dokuma,
   etiket) orijinalden**. Giysi için kritik olan bu; doku önce ölür.
3. Denoise/conditioning strength düşür, tekrar koş.

**Yapısal ayrım:** maskeli inpainting maske içini tamamen yeniden üretir → **eklemeye** uygun
("bele fiyonk"). Instruction editing üst düzey yapıyı korur, parçaları anlar → **değiştirmeye**
uygun ("kolu daha puf yap"). İkisi rakip değil, **iki ayrı primitif** — stitchu'nun ikisine de ihtiyacı var.
- OmniGen2 pratik kolu: `image_guidance_scale` **1.2–2.0** = talimat-takip vs koruma kadranı.
  4B olduğu için **8 GB makinede sığan tek seçenek**.
- Kapalı API tavanı: Nano Banana Pro / Gemini 3 Pro Image **$0.134/görsel** (batch $0.067);
  Seedream 4.5 ~$0.04. (aggregator sayfalarından → DOĞRULANMADI)
### D3. Parametrik/spec tarafı
- ChatGarment: **formel diff YOK**, JSON'u komple yeniden üretiyor.
- FreeSewing: **id'li makro + `rm` geri-alıcı** (eski tarama) — dünyadaki en yakın "kapsamlanmış geri-alma".
- **Giysi için SVG-path-diff editleme yapan KİMSE YOK.** Arama temiz çıktı — **gerçekten boşluk**.

## E. BİZE UYGULANABİLİR 5 TEKNİK
Sıra = fayda/iş yükü. Hepsi mevcut hattı (`src/read` → `src/pattern` → `src/draw` → `src/gate`) bozmadan eklenir.
### E1. Çizgi ağırlığı hiyerarşisini endüstri sayısına çekmek
- **Ne yapar:** flat'i "amatör"den "satılır"a taşıyan tek en ucuz kalem. Bizde oran **1.55**;
  endüstri **2.0–2.67**. Kesikli ritmimiz `5,3`; endüstri **1.5/1.5**.
- **Nasıl:** `law/1309-silhouette.json` `cizgi` bloğundaki 5 sayı. Kod değişmez.
- **İş yükü:** saatler. **Risk: DÜŞÜK** — ama `gate.mjs` görsel oranı ölçmüyor,
  regresyon ancak gözle görülür. Kaynak: Points of Measure (birincil).
### E2. Croquis'i 9-head'den 7–8 head'e çekmek (technical flat konvansiyonu)
- **Ne yapar:** HEDEF md.5'in ("hepsi aynı ölçüden çizilmiş görünecek") endüstri karşılığı.
  Technical flat 9-head'e çizilmez; bu amatörlük işareti.
- **Nasıl:** `law/1309-body.json` `croquis36` landmark'ları. `gate.mjs`'teki 7 oran hedefi
  bu değişimle **yeniden türetilir** (şu an fotoğraf ölçümünden perspektif düzeltmesiyle geliyor).
- **İş yükü:** 1–2 gün. **Risk: ORTA** — 7 oran kapısının tamamı kayar, hepsi yeniden kalibre edilmeli.
- **⚠ Önce Damla kararı:** bizim croquis36 kaç head, ölçülmedi → **DOĞRULANMADI**.
### E3. Yapısal çıktı zorlaması (Outlines / structured output) + ChatGarment şema deseni
- **Ne yapar:** `src/read/read.mjs`'teki `ERR_SEMA` hatasını **imkânsız** hale getirir;
  model şema dışına çıkamaz. Ek olarak ChatGarment'ın **bağlam-koşullu alan kapatma**
  yöntemi (token 900→350): üst beden çizilirken etek alanları prompt'a **hiç girmez**.
- **Nasıl:** `dottxt-ai/outlines` (Apache-2.0, 15.788★, canlı) ya da doğrudan
  Anthropic structured output. Bizim arka uç `claude-p` olduğu için ikincisi daha ucuz.
- **İş yükü:** 1–2 gün. **Risk: DÜŞÜK.**
### E4. "Walk pieces" / `isMatching` kapısı — dikilebilirlik testi
- **Ne yapar:** Minerva'nın rakiplere yönelttiği tam eleştiriyi ("seams that do not walk together")
  bizde **ölçülen** bir şeye çevirir. `law/_frozen/1309-base-graph.json` `seams[]` zaten
  `a`/`b`/`ratio`/`easeMM` taşıyor — yani veri hazır, **kontrol yok**.
- **Nasıl:** `src/gate/gate.mjs`'e yeni kontrol: her seam için iki kenarın uzunluğunu
  `ratio`+`easeMM` ile karşılaştır, bandın dışındaysa kırmızı. Dış bağımlılık **yok**.
- **İş yükü:** 2–3 gün. **Risk: DÜŞÜK.**
- **⚠ Eşik bizim kararımız.** GarmentCode'un `tol=0.05`'i onların yayınlanmış bandı, referans;
  **motorun kendi çıktısından eşik türetmek yasak.**
### E5. Bölgesel editleme — Qwen-Image-Edit-2511, maskeli + geri-bindirmeli
- **Ne yapar:** HEDEF md.2 ("şuraya fiyonk ekle"). Apache-2.0, current ve drift-kontrollü
  **tek** kombinasyon.
- **Nasıl:** maske üret → instruction edit → **sadece maskeli bölgeyi orijinale bindir**;
  gerekirse frequency separation (yüksek frekans orijinalden). 8 GB makinede 20B sığmaz →
  **OmniGen2 (4B, Apache-2.0)** yerel seçenek, `image_guidance_scale` 1.2–2.0.
- **İş yükü:** 1–2 hafta. **Risk: YÜKSEK.**
- **★ Ama bizim hattımız için asıl doğru yol bu değil olabilir:** bizim flat'imiz raster değil,
  `src/draw/draw.js` **native SVG** üretiyor (doğrulandı). Dolayısıyla editlemenin doğru yeri
  piksel değil, **okuma JSON'u → yeniden çiz** (parametrik re-solve). Diffusion editleme ancak
  *fotoğraf* tarafında (girdi/önizleme) gerekir. **Giysi için SVG-path-diff yapan kimse yok** (D3).
### Uygulanabilir OLMAYANLAR — neden
- **SewFormer / GarmentDiffusion:** lisans **YOK** → ticari kullanım yasal değil. Dokunma.
- **DressWild:** kod yok.
- **Flux-dev tabanlı LoRA'lar:** non-commercial, satılamaz.
- **StarVector/VTracer:** bizim flat'imiz zaten vektör doğuyor; raster→SVG'ye **ihtiyaç yok**
  (olsa olsa referans fotoğrafı vektörleştirmede).
- **GarmentCode'u motor olarak almak:** `law/_frozen/1309-base-graph.json` zaten aynı modeli taşıyor.

## GÖREMEDİKLERİM / DOĞRULAYAMADIKLARIM
1. **Hiçbir ticari foto→kalıp çıktısının gerçekten dikilebilir olduğu** — tek bağımsız inceleme yok.
   patternreview.com **403**, minervapatterns.com **403**, stitchlift.com WebFetch'e **boş** döndü.
2. **GarmentCodeData veri seti lisansı** — ETH kaydı HTTP 500. CC BY-SA ise ShareAlike bulaşıcı.
   **Kullanılacaksa Damla doğrulamalı.** SewFactory lisansı **yok** (doğrulandı). Dress4D bakılmadı.
3. Ölçülmemiş/test edilmemiş iddialar: StarVector'ın fashion flat performansı · Qwen'in
   "unedited regions unchanged" iddiası (gerçek kumaş dokusunda) · `flatsketcher` eğitim görsel sayısı.
4. İkincil kaynaklı sayılar: VLM neckline F1 %15–48 ve "0.77B LoRA GPT-4o-mini'yi geçiyor"
   (benchmark adı teyitsiz) · Nano Banana / Seedream fiyatları (aggregator) · Etsy ve
   aitechpacks/LOOK AI ücretli tier fiyatları.
5. CLO3D/Browzwear'da foto→kalıp özelliğinin **yokluğu** kesin değil. Off/Script, Vetted/YR,
   ZMO, Dresscode — arama sonucu dönmedi, kapsanmadı.
6. arXiv **2605.08250** *"Why Do DiT Editors Drift? Low-Frequency Alignment in VAE Latent Space"* —
   tam bizim drift problemimizi hedefliyor, **okunmadı**.

## SORULMADI AMA ÖNEMLİ
- **★ Wrapper testi açısından — dosyanın en keskin cümlesi:** diffusion çıktısında stroke weight
  kavramı YOK; raster'da 2pt ile 0.75pt farkı trace sonrası kaybolur. Yani "flat'i piksel üretip
  trace etmek" A5'teki hiyerarşiyi **yapısal olarak** veremez. Gerçek ayrışma noktası:
  **flat'i doğrudan stroke-weight'li vektör geometri olarak üretmek** — bu diffusion değil,
  parametrik/program-sentezi işi, ve `src/draw/draw.js` zaten böyle çalışıyor. Prompt'la yapılamaz.
  Kalıp tarafında da boşluk savunulabilir: foto kabul eden DXF vermiyor, DXF veren foto kabul etmiyor.
- **"AI çıktısı gerçek CAD'e nasıl girer" sorusunun endüstri cevabı DXF'tir** — FashionINSTA
  (fashioninsta.ai) sketch→pattern'ı CLO3D/Browzwear/Gerber'e DXF ile köprülüyor. Dikkat: köprü
  **flat'ten değil, kalıp tarafından** geçiyor. Eski taramadaki DXF-AAMA 23 katman tablosu burada devreye girer.
- **Endüstri flat'te renk/gölge İSTEMİYOR.** "Güzelleştirme" dürtüsü burada ters teper.
- Bizim `sisme` (mm) parametremiz **isim değil sayı** — GarmentCode'un `ruffle` dersi zaten uygulanmış.
- Rakip **aitechpacks fotoğraftan SVG flat üretiyor** ve ayda 2 bedava veriyor. Kalitesi kanıtsız
  ama pazarlama olarak bizim iddiamızın önünde duruyor.
