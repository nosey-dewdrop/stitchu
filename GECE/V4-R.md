# V4-R — TEKNİK FLAT KONVANSİYONUNUN YAYINLANMIŞ ZEMİNİ

Kart: `GECE/KART/V4-R.md` (PARALEL, tur 1). **Kod yazılmadı, hiçbir dosya değiştirilmedi.**
Tek yazılan dosya budur.

**Kaynak sınıfı ayrımı (her tabloda kullanılıyor):**
- **BİRİNCİL-OKUNDU** = standardın kendi PDF'i çekildi ve `pdftotext -layout` ile
  metni bu vardiyada okundu, cümle birebir alıntı. (ISO'nun `standards.iteh.ai`
  "STANDARD PREVIEW" nüshaları — ilk sayfalar ücretsiz yayınlanıyor.)
- **İKİNCİL** = arama sonucu / rehber sitesi; birincil yayın açılmadı.
- **ERİŞİLEMEDİ** = yayın var, bu vardiyada açılamadı. "YOK" demek DEĞİL.

⚠ Görsel indirilmedi (§7.2). İndirilen şey PDF **metin** belgeleridir; WebFetch
onları önbelleğe aldı, `pdftotext` ile okundu, repoya hiçbiri kopyalanmadı.

---

## §1 ÇİZGİ HİYERARŞİSİ ORANLARI

| EŞİK | YAYINLANMIŞ DEĞER/ORAN | KAYNAK | LİSANS/ERİŞİM | GÜVEN | HÜKÜM |
|---|---|---|---|---|---|
| İzinli çizgi kalınlıkları (`d`) | **0,13 · 0,18 · 0,25 · 0,35 · 0,5 · 0,7 · 1 · 1,4 · 2 mm** — "This series is based on a common ratio 1:√2 (≈1:1,4)" | ISO 128-2:2020(E) **md. 5.1**, s.6 · aynı cümle ISO 128-20:1996(E) **md. 4.1**, s.5 | ISO telifli; preview PDF ücretsiz yayında (`cdn.standards.iteh.ai/samples/69129/…/ISO-128-2-2020.pdf`, `…/samples/1408/…/ISO-128-20-1996.pdf`). Sayılar olgudur, alıntı kısa. | **YÜKSEK** (BİRİNCİL-OKUNDU) | **KAPIYA BAĞLANABİLİR.** Her `stroke-width` bu 9 değerden biri olmak zorunda kılınabilir. |
| Kalın:orta:ince oranı | **"The widths of extra wide, wide and narrow lines are in the ratio 4:2:1."** (üç kademe, √2 değil ×2 adımlı) | ISO 128-2:2020 md. 5.1 · ISO 128-20:1996 md. 4.1 | aynı | **YÜKSEK** (BİRİNCİL-OKUNDU) | **KAPIYA BAĞLANABİLİR** ama bugünkü tabloyu değiştirir — aşağıya bak. |
| Kalınlık sapma toleransı | "the deviation in line width between two such lines shall not be greater than ± 0,1 d" | ISO 128-2:2020 **md. 5.2** · ISO 128-20:1996 md. 4.2 | aynı | **YÜKSEK** (BİRİNCİL-OKUNDU) | KAPIYA BAĞLANABİLİR (bizde kalınlıklar tam sayı sabit, sapma zaten 0). |
| ASME karşılığı | oran **2:1**; ince ≥ **0,3 mm**, kalın ≥ **0,6 mm** | ASME Y14.2-2008 (arama özeti) — PDF çekildi ama ücretsiz nüsha yalnız **kapak + içindekiler**; md. 2 "Line Conventions" gövdesi yok | ASME telifli, ödeme duvarı | **ORTA — DOĞRULANMADI** (İKİNCİL; birincil metin ERİŞİLEMEDİ) | Kapıya bağlama; ISO zaten aynı 2:1'i içeriyor. |
| Moda/tech-pack karşılığı | **SAYISAL YAYINLANMIŞ ORAN YOK.** Bulunan her rehber niteldir: *"Heavy line: outer silhouette and principal seams. Medium line: internal seams, yokes, and panel lines. Fine or dashed line: topstitch rows and edge stitching."* | specform.pro "What Is a Technical Flat?" (birebir alıntı, sayfa çekildi) | web, telifli, atıflanabilir | ORTA (İKİNCİL, ama sayfa açıldı) | Hüküm üretmez; hiyerarşinin **varlığını** destekler, oranı vermez. |
| Szkutnicka pratiği | "0.8 mm kalem tüm dikiş/pens/detay, 0.3 mm topstitch/düğme/kapama" → oran ≈ **2,67:1** | *Flats: Technical Drawing for Fashion* (Szkutnicka) — arama motoru snippet'i; **kitap açılmadı** | kitap, telifli, indekslenmemiş | **DÜŞÜK — DOĞRULANMADI** | Kapıya bağlanamaz. |
| Illustrator pratiği | "0.5–1 pt arası", "tüm dikişler .75 pt" | tech-pack rehberi snippet'leri; iki sayfa açıldı (`techpacks.co`, `techpacker.com`) ve **ikisinde de bu sayılar YOKTU** | web | **DÜŞÜK — DOĞRULANMADI**, kaynak sayfada bulunamadı | YAYINLAMA. |

### Bugünkü repo değeriyle karşılaştırma (ölçüm, iddia değil)

`contract/flat-convention-v1.json → lineClasses`: outline **2.0** · seam **1.4** ·
mark/topstitch/hidden **1.0**. Beyan edilen oranlar 1.4286 / 1.4 / 2.0.

- ★ **BULGU (olumlu):** `2.0`, `1.4`, `1.0` — bu üçü ISO 128-2 md. 5.1 serisinin
  **art arda gelen son üç elemanıdır.** Yani repo, farkında olmadan ISO'nun izinli
  kalınlık kümesinin içinde. Bu tesadüf değil, kaynağı `gusto-corpus.json`'un
  ölçtüğü katman yapısı — ama sonuç ISO ile çakışıyor.
- ★ **BULGU (fark):** ISO'nun **kademe** kuralı `4:2:1` (yani ×2 adım, ör.
  2,0 / 1,0 / 0,5). Repo `√2` adımı kullanıyor (2,0 / 1,4 / 1,0 = 1,414 / 1,414).
  İkisi de seride meşru, ama **ISO'nun "extra wide : wide : narrow" üçlüsü
  DEĞİL.** Repo bir "kalın-orta-ince" hiyerarşisi kurduğunu söylüyorsa, ISO'nun
  o hiyerarşi için verdiği oran 4:2:1'dir.
- Repo'nun uçtan uca kontrastı `outline:mark = 2.0` → ASME Y14.2'nin 2:1'iyle ve
  `FLAT-DIS-KAYNAKLAR §4` md.6'nın "≥1.5:1" gözlemiyle **uyumlu**.
- ⚠ Repo'da **beş sınıf** var (outline/seam/mark/topstitch/hidden) ama yalnız
  **üç kalınlık**; ISO da üç kademe tanımlıyor. Ayrım kalınlıkta değil kesikte —
  ISO'nun yaptığı da tam bu (tip 01/02/07). Yapı doğru.

**Önerilen kapı cümlesi (kod yazılmadı):** `stroke-width ∈ {0.13,0.18,0.25,0.35,
0.5,0.7,1,1.4,2}` **ve** `max(width)/min(width) ≥ 2`. İkisi de dış yayına bağlı.
`4:2:1`'e geçmek bir **Damla kararıdır** (bugünkü seam 1.4 → 1.0'a inerdi ve
mark/topstitch/hidden 0.5'e); tek taraflı önerilmiyor.

---

## §2 TOPSTITCH KESİKLİ ÇİZGİ (dash/boşluk oranı)

ISO'nun kesik uzunlukları **`d`'nin katı** olarak yayınlanmıştır — yani ölçek-bağımsız,
tam bizim ihtiyacımız olan biçimde.

| EŞİK | YAYINLANMIŞ DEĞER | KAYNAK | LİSANS | GÜVEN | HÜKÜM |
|---|---|---|---|---|---|
| Nokta (dot) | **≤ d** — çizgi tipi 04–07 ve 10–15 | ISO 128-2:2020 **md. 5.3, Tablo 4**, s.6 | ISO preview PDF, ücretsiz yayında | **YÜKSEK** (BİRİNCİL-OKUNDU) | KAPIYA BAĞLANABİLİR |
| Boşluk (gap) | **3d** — tip 02 ve 04–15 | aynı | aynı | **YÜKSEK** | KAPIYA BAĞLANABİLİR |
| Kısa kesik (short dash) | **6d** — tip 08, 09 | aynı | aynı | **YÜKSEK** | KAPIYA BAĞLANABİLİR |
| Kesik (dash) | **12d** — tip 02, 03 ve 10–15 | aynı | aynı | **YÜKSEK** | KAPIYA BAĞLANABİLİR |
| Uzun kesik (long dash) | **≈24d** — tip 04–06, 08, 09 | aynı | aynı | **YÜKSEK** | KAPIYA BAĞLANABİLİR |
| Aralık (space) | **18d** — tip 03 | aynı | aynı | **YÜKSEK** | KAPIYA BAĞLANABİLİR |
| → türeyen **kesik:boşluk oranı** | tip 02 "dashed line" = **12d : 3d = 4:1** | ISO 128-2:2020 Tablo 4'ten aritmetik | — | **YÜKSEK** (türetme, uydurma değil) | KAPIYA BAĞLANABİLİR |
| Kalem ucu düzeltmesi | "In the case of line elements with semi-circular ends, … The total length of such a line element is the sum of the length shown in this table, **plus d**." | ISO 128-2:2020 Tablo 4 NOTU | aynı | YÜKSEK | SVG'de `stroke-linecap="round"` kullanılıyorsa dash değerinden `d` düşülmeli — bugün repoda bu düzeltme YOK, ölçülmedi. |
| Moda/tech-pack'te topstitch dash uzunluğu | **YAYINLANMIŞ FORMÜL YOK.** Taranan hiçbir tech-pack rehberi / flat kitabı sayısal dash-boşluk vermiyor; hepsi "dashed line = stitching" diyor. | specform.pro · techpacker.com · techpacks.co (üçü de açıldı) | web | ORTA (yokluk kanıtı, tam tarama değil) | Alan bize ISO dışında hiçbir sayı vermiyor. |

### Bugünkü repo değeriyle karşılaştırma

`lineClasses.topstitch`: `width 1.0`, `dash "4 3"` → `d=1.0` cinsinden **kesik 4d,
boşluk 3d**.
`lineClasses.hidden`: `width 1.0`, `dash "1 3"` → **nokta 1d, boşluk 3d**.

- ★ **`hidden` ISO'ya BİREBİR UYGUN.** ISO tip 07 "dotted line": nokta ≤ d, boşluk
  3d. Bizimki nokta = 1d (tavanda) + boşluk 3d. Tam isabet, tesadüfen.
- ★ **`topstitch`ın boşluğu doğru, kesiği ISO'da YOK.** Boşluk 3d = ISO'nun tek
  boşluk değeri. Ama kesik **4d**; ISO'nun kesik alfabesinde 4d diye bir eleman
  yok — en yakınları **6d** (short dash) ve **12d** (dash). ISO tip 02 dashed line
  seçilirse dash `12 3` olurdu, yani bugünküden **3 kat uzun**.
- Bu bir hata iddiası DEĞİL: ISO tip 02 "gizli kenar" için kullanılıyor, moda flat'i
  topstitch için kullanıyor ve moda tarafının yayınlanmış sayısı yok. Ama repo
  "teknik çizim konvansiyonu" diye yazıyorsa, **4d'nin dışarıda karşılığı yok.**
- ⚠ Kesik değerleri `d` katı olmadığı sürece kalınlık değişince desen bozulur.
  Bugün `topstitch` ve `hidden` ikisi de `d=1.0` olduğu için sorun görünmüyor;
  kalınlık tablosu değişirse (ör. 4:2:1'e geçilirse) dash dizileri **elle
  yazıldığı için taşınmaz.** Kart dışı, dokunulmadı.

---

## §3 DETAY CALLOUT (büyütülmüş bölge)

**Aranan şey bulundu ve tam olarak mekanik.** ISO 128-3:2022 md. 4.12 birebir:

> **4.12 Enlarged features**
> "When the scale of a technical drawing does not allow all features to be clearly
> shown or dimensioned, the unclear features **shall be enclosed or encircled by a
> continuous narrow line (type 01.1)**, with the area thus enclosed **identified by
> a capital letter**. The features in the area shall also be **shown on an enlarged
> scale**, in a view that is **broken with a continuous narrow freehand or
> free-formed curve line (type 01.1)**. This shall be accompanied by the
> **identification letter and an indication of the scale beside it between
> parentheses**, as shown in Figure 8."
> "For unambiguous relation between the circle and the identification letter, a
> **leader line** by a continuous narrow line (type 01.1) and a **reference line**
> by a continuous narrow line (type 01.1) **should** be drawn."

| EŞİK | YAYINLANMIŞ KURAL | KAYNAK | LİSANS | GÜVEN | HÜKÜM |
|---|---|---|---|---|---|
| Sınır çizgisi | kapalı, **sürekli İNCE** çizgi (tip 01.1) — daire ya da başka kapalı şekil ("enclosed **or** encircled") | ISO 128-3:2022(E) **md. 4.12**, s.6, Şekil 8 | ISO telifli; tam metin `img.antpedia.com` üzerinden ücretsiz erişildi + iteh preview | **YÜKSEK** (BİRİNCİL-OKUNDU) | **KAPIYA BAĞLANABİLİR** |
| Etiket | **tek BÜYÜK HARF** | aynı | aynı | YÜKSEK | KAPIYA BAĞLANABİLİR |
| Büyütülmüş görünüm sınırı | **sürekli ince serbest-el / serbest-form eğri** ile kırılmış (tip 01.1) — düz çerçeve DEĞİL | aynı | aynı | YÜKSEK | KAPIYA BAĞLANABİLİR |
| Ölçek beyanı | aynı harf + **parantez içinde ölçek**, harfin yanında. ISO Şekil 8 biçimi: `A (2:1)` | aynı | aynı | YÜKSEK | KAPIYA BAĞLANABİLİR |
| Leader + reference line | tavsiye ("should"), zorunlu değil | aynı, 2. paragraf, Şekil 9 | aynı | YÜKSEK | Kapı ZORUNLU kılamaz (ISO "should" diyor). |
| Ölçek nereye yazılır (çoklu ölçek) | "all other scales **adjacent to** … the reference letter of a detail view (or section)" | ISO 5455:1979 **md. 4.2** | BİRİNCİL-OKUNDU | YÜKSEK | KAPIYA BAĞLANABİLİR |
| Ne zaman detay ZORUNLU | "Details that are too small for complete dimensioning in the main representation **shall be shown adjacent** to the main representation in a separate detail view (or section) which is drawn to a **larger scale**." | ISO 5455:1979 **md. 5.3** | BİRİNCİL-OKUNDU | YÜKSEK | Kapıya bağlanır ama "too small" eşiği yayında YOK — o eşiği biz koyarsak konvansiyonu **tanımlarız**, takip etmeyiz. |
| ASME karşılığı | Y14.3'te "Detail" var (2003 md. 2.9 / 2012 Şekil 7-9); sınır **phantom line** dairesi, harf ok uçları arasında | ASME Y14.3-2012 — ücretsiz nüshadan **yalnız içindekiler** çıkarıldı; gövde ödeme duvarında | ASME telifli | **DÜŞÜK — DOĞRULANMADI** (İKİNCİL forum + TOC) | ⚠ ISO ile **ÇELİŞİYOR**: ISO sürekli ince, ASME phantom. Kapı ISO'yu seçmeli ve bunu yazmalı. |
| Moda tech-pack karşılığı | **YAYINLANMIŞ KURAL YOK.** Taranan tech-pack rehberlerinin hiçbiri detay-callout için bir çizim kuralı yayınlamıyor. | — | — | ORTA (yokluk) | Alan boş; ISO 128-3 tek zemin. |

### SVG'de ne aranacak (mekanik tanım — kod yazılmadı)

Bir "detay callout" iddiasının SVG'de mekanik karşılığı, ISO 128-3 md. 4.12'nin
dört şartının dördü birden:

1. Ana görünümde **kapalı** bir path (`Z` ile biter), `stroke-width` = tablodaki
   **en ince** sınıf, `fill="none"`, `stroke-dasharray` YOK (sürekli).
2. O path'in **bbox'ı içinde** kalan bir `<text>`, içeriği **tek `[A-Z]`**.
3. Ayrı bir `<g>` (ör. `data-detail="A"`), sınır path'i **açık** ve **eğrisel**
   (yalnız `C`/`Q` segmentleri, `L` yok) — ISO'nun "freehand / free-formed curve"u.
4. O `<g>` içinde bir `<text>`, kalıbı `^[A-Z]\s*\(\d+:\d+\)$` — harf + parantezli
   ölçek. Ve o ölçek, ana ölçeğe göre **büyütme** olmak zorunda (ISO 5455 md. 5.3).

Ölçülebilir, uydurma sayı içermiyor, gevşetilecek eşiği yok. **Bugün repoda
detay-callout diye bir şey YOK** (`flat-convention-v1.json`'da geçmiyor,
`flat_convention_check.mjs` aramıyor) — yani bu bir yeni kapı önerisidir, mevcut
bir kapının gevşetilmesi değil.

---

## §4 ÖLÇEK BEYANI — ve `data-scale="1:3"` HÜKMÜ

ISO 5455:1979'un **tamamı okundu** (4 sayfalık standart; preview tüm gövdeyi
içeriyor).

### ISO 5455:1979 md. 5.1 — izinli ölçek tablosu (birebir)

| Kategori | Tavsiye edilen ölçekler |
|---|---|
| **Enlargement** | 50:1 · 20:1 · 10:1 · 5:1 · 2:1 |
| **Full size** | 1:1 |
| **Reduction** | 1:2 · 1:5 · 1:10 · 1:20 · 1:50 · 1:100 · 1:200 · 1:500 · 1:1000 · 1:2000 · 1:5000 · 1:10000 |

**md. 5.1 NOTU (birebir):** "If, for special applications, there is need for a
larger enlargement scale or a smaller reduction scale than those shown in the
table, the recommended range of scales may be extended in either direction,
provided that the required scale be derived from a recommended scale by
**multiplying by whole number powers of 10**. **In exceptional cases where for
functional reasons the recommended scales cannot be applied, intermediate scales
may be chosen.**"

### ★ BULGU: **1:3, ISO 5455'in izinli dizisinde YOKTUR.**

Gizlenmiyor, kartın istediği gibi açıkça yazılıyor:

- Tablo yalnız **1:2 / 1:5 / 1:10** ailesini ve bunların 10'un tam kuvvetleriyle
  çarpımlarını içerir. **3 tabanı hiçbir ailede yok.**
- Genişletme kuralı da kurtarmıyor: 1:3, izinli hiçbir ölçekten 10'un tam
  kuvvetiyle **türetilemez** (1:2·10ᵏ, 1:5·10ᵏ, 1:10·10ᵏ kümesinde 1:3 yok).
- **1:3'ün tek meşru dayanağı NOT'un son cümlesidir:** "in exceptional cases where
  for functional reasons the recommended scales cannot be applied, **intermediate
  scales may be chosen**." Yani 1:3 = ISO 5455 md. 5.1 NOTU anlamında bir
  **ara ölçek (intermediate scale)** — yasak değil, ama **tavsiye edilen dizide
  değil** ve "functional reason" beyan edilmek zorunda.
- Bizde o functional reason **zaten yazılı ve türetilmiş**:
  `flat-convention-v1.json → scale._why_3` (croquis göğüs yarı-genişliği
  73.3333 birim, burda EU38 bust 88 cm → 220 mm, 220/73.3333 = 3.0 mm/birim; bel
  çapası da aynı sayıyı veriyor). Yani ölçek **seçilmedi, çözüldü** — ISO'nun
  istediği türden bir functional reason. Ama sözleşme bugün bunu "ISO 5455 ara
  ölçeği" diye **beyan etmiyor.**

### Beyan biçimi

| EŞİK | YAYINLANMIŞ KURAL | KAYNAK | LİSANS | GÜVEN | HÜKÜM |
|---|---|---|---|---|---|
| Tam gösterim | "The complete designation of a scale shall consist of the word **“SCALE”** … followed by the indication of its ratio: SCALE 1:1 / SCALE X:1 / SCALE 1:X" | ISO 5455:1979 **md. 3** | BİRİNCİL-OKUNDU, ücretsiz preview | YÜKSEK | KAPIYA BAĞLANABİLİR |
| Kelimeyi atlama | "If there is no likelihood of misunderstanding, the word “SCALE” **may be omitted**." | ISO 5455:1979 md. 3 son cümle | aynı | YÜKSEK | ★ Bizim `data-scale="1:3"` biçimi **UYGUN** — kelime atlanabilir. |
| Nerede yazılır | "shall be inscribed in the **title block**" | ISO 5455:1979 **md. 4.1** | aynı | YÜKSEK | Bizde SVG **kökünde** `data-scale`; kağıtta bir title block yok. Kapıya bağlanamaz (bizim ortam farklı), **açık kalem**. |
| Ölçek seçim kuralı | "the selected scale shall be **large enough to permit easy and clear interpretation**" | ISO 5455:1979 **md. 5.2** | aynı | YÜKSEK | Ölçülemez (nitel). Kapıya bağlanamaz. |
| Moda alanının kullandığı ölçek | **1:8 (yetişkin)**, **1:4 (çocuk)** | `techpacks.co/blog/tech-pack-flat-sketches` (sayfa açıldı, birebir: "Adult clothing is typically designed on a 1:8 scale, while children's clothing is designed on a 1:4 scale") + `pointsofmeasure.com` ("draw up a flat to scale in 1/8 or 1/4 scale") | web, telifli | **ORTA** (iki bağımsız İKİNCİL kaynak, biri PoM = repoda zaten kullanılan kaynak) | ★ **1:4 ve 1:8 de ISO 5455 dizisinde YOK.** Yani moda alanının TAMAMI ISO-dışı ara ölçek kullanıyor. Bu, 1:3'ü tek başına bırakmıyor. |

**HÜKÜM (kapı önerisi, kod yazılmadı):** Kapı **biçimi** ISO 5455 md. 3'e
bağlayabilir (`^(SCALE )?(\d+:1|1:\d+)$`). Kapı **izinli diziyi** zorlayamaz —
zorlarsa kendi 1:3'ümüzü kırar ve moda alanının 1:8'ini de kırardı.
Yapılacak doğru iş kapı değil **beyan**: `flat-convention-v1.json → scale`
içine "ISO 5455:1979 md. 5.1 NOTU anlamında **ara ölçek**; tavsiye edilen dizide
değildir; functional reason `_why_3`'te" cümlesi. Bu bir **Damla kararı**, tek
taraflı yazılmadı.

---

## §5 CROQUIS / MANKEN ÇİZELGESİ

Kartın sorusu: `referenceBody.openItem` ("manken çizelgesi — KAYNAK YOK") hâlâ
açık mı?

### **CEVAP: EVET, AÇIK. Sözleşmedeki "KAYNAK YOK" satırı TEYİT EDİLDİ.**

| EŞİK | BULUNAN | KAYNAK | LİSANS | GÜVEN | HÜKÜM |
|---|---|---|---|---|---|
| Yayınlanmış, standartlaşmış manken oran ÇİZELGESİ | **YOK.** Tarama sonunda ISO/ASTM/ASME sınıfı hiçbir yayınlanmış moda-manken oran çizelgesi bulunamadı. Alanın tamamı ders kitabı + atölye folkloru. | — | — | ORTA (yokluk kanıtı; tam tarama değil, aşağıdaki ERİŞİLEMEDİ listesine bak) | **KAPIYA BAĞLANAMAZ.** `openItem` kalır. |
| Boy sistemi | **9 baş** (baştan **ayak bileğine**, ayaklar hariç — topuk yüksekliği değişkeni yüzünden), 9 eşit bölme | `amikosimonetti.com` 9-heads eğitimi (sayfa açıldı) · Vizcom blog · onlarca ticari croquis şablonu | web/ticari, telifli | **ORTA** (yaygın ama tek bir otoriteye dayanmıyor) | Kapıya bağlanamaz — bizim croquis'te **baş yok**, ölçülecek birim yok. |
| Genişlik oranları (baş-genişliği biriminde) | omuz ≈ **2 baş genişliği** · bel ≈ **1 baş genişliği** · kalça = omuzla **aynı** | `amikosimonetti.com` (birebir: "roughly 2 heads wide", "roughly 1 head width", "the hips and shoulders are the same width") | web, telifli | **DÜŞÜK — tek kaynak, birincil yayın değil** | Kapıya bağlanamaz. |
| 8 baş / 10 baş varyantları | Alanda 8, 8½, 9 ve 10 baş sistemleri paralel dolaşıyor; hangisinin "teknik flat" için doğru olduğunu söyleyen bir otorite bulunamadı. | genel tarama | — | DÜŞÜK | Kapıya bağlanamaz. |

### ★ ASIL BULGU: iki sistem AYNI NORMALİZÖRÜ paylaşmıyor

Bu, çizelge bulunsa bile ortaya çıkacak bir engel — kartın sormadığı ama
kararı taşıyan kalem:

- Yayınlanmış croquis sistemi **BOY-normalizedir**: her şey *baş uzunluğunun*
  katı. Mutlak mm hiçbir yerde yok, çünkü "baş" bir çizim birimidir.
- Bizim croquis **GENİŞLİK-normalizedir**: `chestX`, `waistX`, `hipX` doğrudan
  `bustCM/4`, `waistCM/4`, `hipCM/4`'ten (burda EU38, verified) türüyor ve
  `unitMM = 3.0` de bu çapadan çözülmüş.
- İki sistemi bağlamak için **mm cinsinden bir baş uzunluğu** gerekir.
  **Bu sayıyı hiçbir croquis kaynağı yayınlamıyor** — kasten, çünkü croquis
  gerçek bir insanı temsil etmiyor (9 baş, gerçek kadın ~7,5 baş).
- Sonuç: bir 9-baş çizelgesi **bulunsa bile**, `shoulderTipX`'i doğrudan
  besleyemez. K-FE-1'in (`234.0 mm` mi `210.5 mm` mi `194.7 mm` mi) cevabı
  croquis literatüründen **gelmez**; kalıp ölçümünden (Buğra 210.5) ya da
  drafting çizelgesinden (Aldrich/Armstrong %44 → 194.7) gelir. İkisi de
  `knowledge/FLAT-DIS-KAYNAKLAR-2026-08-23.md §1`'de zaten duruyor.
- Yani `referenceBody.openItem` "manken çizelgesi" olarak açık kalabilir, ama
  **omuz sayısı onu beklemek zorunda değil** — o kalem başka bir kaynaktan
  kapanabilir. Bu bir gözlem, karar değil.

### ERİŞİLEMEDİ (yok DEĞİL)

- **Abling, *Fashion Sketchbook*** — indekslenmiş web'de içerik yok.
- **Szkutnicka, *Flats: Technical Drawing for Fashion*** (1./2. baskı) — Internet
  Archive'da ödünç-kısıtlı kayıt var (`archive.org/details/flatstechnicaldr0000szku`),
  açılmadı. §1'deki 0.8/0.3 mm sayısı buradan geldiği iddia edilen bir snippet'ti,
  **doğrulanmadı**.
- **Ivanova, *How to Draw Fashion Flats*** — sadece satış sayfası.
- **ASME Y14.2-2008 / Y14.3-2012 gövdeleri** — ödeme duvarı; ücretsiz nüshalar
  yalnız kapak + içindekiler.
- **ISO 128-2:2020 Annex D** (mekanik mühendislik çizimlerinde çizgi tipleri ve
  kalınlıkları, s.39) — preview 15 sayfada kesiliyor, **Annex D okunamadı.**
  Bizim "hangi eleman kalın hangisi ince" eşleştirmemizin ISO karşılığı orada.
- **ISO 128-1** (genel bakış) ve **ISO 15519-1** (referans gösterimi, ISO 128-3
  md. 5.2'nin atfı) — çekilmedi.

---

## §6 KART DIŞI FARK EDİLEN (dokunulmadı, yazılıyor)

1. **`lineClasses.ratios` bloğu türetilmiş veri tutuyor** ve elle yazılmış:
   `outline:seam 1.4286`, `seam:mark 1.4`, `outline:mark 2.0`. Bunlar
   `classes.*.width`'ten hesaplanabilir. Kalınlık değişirse bu üç sayı sessizce
   yalan söyler; `flat_convention_check.mjs` onları **hiç okumuyor** (grep:
   `ratios` kapıda geçmiyor). Yani bugün **doğrulanmayan bir beyan.**
2. **`_source` cümlesi "Kesik/noktali ayrimi teknik cizim (tech-pack)
   konvansiyonu" diyor.** §2'nin bulgusu: tech-pack tarafında **sayısal bir
   kesik konvansiyonu yayınlanmamış**; sayı veren tek yer ISO 128-2 Tablo 4.
   Cümle yanlış değil ama kaynaksız; ISO'ya bağlanabilir.
3. **`stroke-linecap` hiç beyan edilmiyor.** ISO 128-2 Tablo 4 NOTU yuvarlak uçlu
   elemanların gerçek uzunluğunun tablo değeri **+ d** olduğunu söylüyor. SVG
   varsayılanı `butt` olduğu için bugün sorun yok, ama sözleşme bunu **beyan
   etmiyor** — biri `round` koyarsa desen sessizce uzar.
4. **`flat_convention_check.mjs` md. 3, `stroke-width` yokluğunda `1` varsayıyor**
   (satır 261: `w ? w[1] : 1`). SVG'nin gerçek varsayılanı da 1'dir, doğru; ama
   bu, kalınlığı hiç yazmayan bir elemanı sessizce `mark/topstitch/hidden`
   sınıfına sokar. Kasıtlı mı, ölçülmedi.
5. **Kapı md. 2, `data-scale` ile `unitMM`'in aritmetik tutarlılığını zorluyor**
   (satır 232-233: `1:N` içindeki `N` = `unitMM`). Bu, `data-scale`'i ISO 5455
   anlamında bir **ölçek** olmaktan çıkarıp `unitMM`'in ikinci bir yazımı yapıyor.
   ISO'da ölçek boyutsuzdur (çizim mm / gerçek mm); bizde "1 kullanıcı birimi =
   1 kağıt mm" kabulü altında ikisi sayısal olarak çakışıyor — **ama bu kabul
   sözleşmede yazılı** (`scale._law`), yani tutarlı. Sorun değil, not.
6. **`ETSY-KAPISI-*` ve `DIKIS-SOZLUGU-ISO-2026-08-23.md` açılmadı** — kart
   "sadece flat/çizim ile ilgili olanı aç" dediği ve `FLAT-DIS-KAYNAKLAR` zaten
   flat dış-kaynak kaydı olduğu için. `DIKIS-SOZLUGU-ISO` adında "ISO" geçiyor;
   §1/§2'nin ISO 128 bulgularıyla çakışıp çakışmadığı **BAKILMADI.**

---

## §7 BU DOSYANIN V4-A / V4-B'YE VERDİĞİ EŞİK ÖZETİ

Kapıya bağlanabilir, dış yayına dayalı, uydurma içermeyen sayılar:

| # | EŞİK | DEĞER | KAYNAK |
|---|---|---|---|
| R1 | izinli `stroke-width` kümesi | {0.13, 0.18, 0.25, 0.35, 0.5, 0.7, 1, 1.4, 2} mm | ISO 128-2:2020 md. 5.1 |
| R2 | en kalın : en ince kontrast | ≥ 2:1 (ISO 4:2:1 · ASME 2:1) | ISO 128-2:2020 md. 5.1 · ASME Y14.2 (DOĞRULANMADI) |
| R3 | kesikli çizgi boşluğu | tam **3d** | ISO 128-2:2020 Tablo 4 |
| R4 | kesik uzunlukları alfabesi | nokta ≤d · kısa 6d · kesik 12d · uzun ≈24d · aralık 18d | ISO 128-2:2020 Tablo 4 |
| R5 | detay callout dört şartı | kapalı ince sürekli sınır + tek büyük harf + serbest-eğri kırık sınırlı büyütme + `HARF (n:1)` | ISO 128-3:2022 md. 4.12 |
| R6 | detay ölçeği | ana ölçekten **büyük** olmak zorunda | ISO 5455:1979 md. 5.3 |
| R7 | ölçek beyanı biçimi | `SCALE 1:X` / `X:1`; "SCALE" atlanabilir | ISO 5455:1979 md. 3 |
| R8 | 1:3'ün statüsü | tavsiye dizisinde **DEĞİL**; yalnız md. 5.1 NOTU "intermediate scale" istisnasıyla meşru | ISO 5455:1979 md. 5.1 + NOT |

Kapıya **bağlanamayan** (yayınlanmış formül YOK):
- topstitch dash uzunluğunun moda karşılığı → bant yok, ISO tip 02'nin 12d:3d'si dışında sayı yok.
- puff kapak yükselişi / manşet bandı yüksekliği → `FLAT-DIS-KAYNAKLAR §1`'de zaten "konvansiyon yok" yazıyor, bu tarama da bulamadı.
- manken (croquis) oran çizelgesi → §5, tek kaynak, DÜŞÜK.
- "too small for dimensioning" eşiği → ISO tanımlamıyor.

---

### Kaynak künyeleri (tam)

- **ISO 128-2:2020(E)** *Technical product documentation (TPD) — General principles of representation — Part 2: Basic conventions for lines.* Md. 4.2 Tablo 1, md. 5.1, 5.2, 5.3 Tablo 4, md. 6.1. Preview PDF: `https://cdn.standards.iteh.ai/samples/69129/38e651842df746fd990d29679e3c2e98/ISO-128-2-2020.pdf` (15 s., Annex D dahil değil).
- **ISO 128-20:1996(E)** *Technical drawings — General principles of presentation — Part 20: Basic conventions for lines.* Md. 3.1 Tablo 1, md. 4.1, 4.2. Preview: `https://cdn.standards.iteh.ai/samples/1408/f62555427b87436eafe1e6abc5271860/ISO-128-20-1996.pdf`. (128-2:2020 bunu yürürlükten kaldırdı; md. 4.1 metni birebir aynı.)
- **ISO 128-3:2022(E)** *TPD — General principles of representation — Part 3: Views, sections and cuts.* Md. 4.3, 4.12, 5.1, 5.2. Tam metin: `https://img.antpedia.com/standard/files/pdfs_ora/20221211/iso2/ISO%2000128-3-2022.pdf` · preview: `https://cdn.standards.iteh.ai/samples/83356/d1819f3aabb74441890b2302a24a4cb6/ISO-128-3-2022.pdf`.
- **ISO 5455:1979(E)** *Technical drawings — Scales.* Md. 1–6, tamamı. Preview (tam gövde): `https://cdn.standards.iteh.ai/samples/11500/dc0452907ab547f5aee36c22006aa275/ISO-5455-1979.pdf`. Katalog: `https://www.iso.org/standard/11500.html`. (EN ISO 5455:1994 / BS EN ISO 5455:1995 aynı metnin bölgesel kabulleri.)
- **ASME Y14.2-2008** *Line Conventions and Lettering.* `https://files.asme.org/Catalog/Codes/PrintBook/17018.pdf` — **yalnız kapak + içindekiler**; md. 2 ve Şekil 1 "Width and Types of Lines" okunamadı. **DOĞRULANMADI.**
- **ASME Y14.3-2012 (R2024)** *Orthographic and Pictorial Views.* `https://www.asme.org/getmedia/a3d30363-6c69-4129-afcf-21555326cb43/35141.pdf` — yalnız içindekiler; Şekil 7-9 "Detail" var, gövde yok. **DOĞRULANMADI.**
- **specform.pro**, "What Is a Technical Flat? Fashion Flats Explained" — nitel çizgi hiyerarşisi, sayı yok.
- **techpacks.co**, "Your Step-by-Step Guide to Tech Pack Flat Sketches" — 1:8 / 1:4 ölçek cümlesi.
- **pointsofmeasure.com**, "Drawing Technical Flats and Croquis" — 1/8 veya 1/4 ölçek.
- **amikosimonetti.com**, "Drawing the Basic Fashion Croquis with 9 Heads Proportions" — 9 baş, omuz 2 baş-genişliği, bel 1, kalça = omuz.
