# Fizik çözücü vs emsal büzgü — bağımsız hakem kıyası (2026-07-21)

Hakem: bağımsız agent. Görev: `cloth-solver.mjs` büzgü çıktısı gerçek shirred/gathered emsallerin karakterinde mi? Motor/contract/solver/styles.json'a DOKUNULMADI — sadece üret(/tmp) + gör + ölç + karar.

## VERDICT: **DEĞİL** (aynı karakterde değil)

Fizik çözücü bir dikdörtgeni büzüyor ve **dikey, panelin neredeyse tam boyunca uzanan, hemde daha geniş açılan** kat çizgileri üretiyor — bu bir **toplanmış (gathered) ETEK** karakteri, bir **shirred/smocked panel** karakteri DEĞİL. Emsallerin dördü de büzgüyü **üst kenarda yoğun bir kırışık kümesi** olarak gösteriyor; o kümesi **hızla aşağı sönüyor** (bitmiş boyun %10–25'i içinde), altta kumaş ya düz düşüyor (bust maxi, smock babydoll) ya birkaç yumuşak geniş dalgaya açılıyor (OG shirred top peplum). Fizik bunun tersini yapıyor: en az kırışık ÜSTTE, en çok orta üçte birde, hemde kaybolur.

En kritik sapma **sönüm yönü** (metrik 3+4): emsalde büzgü üstte sıkışıp aşağı söner; fizikte kat kimliği ortada zirve yapar. İşaret ters. İkincil sorun **kat sayısı** çok düşük (fizik 13–19 vs emsal 25–45+) ve orta bölgede fiziksel olmayan kesişen katlar (cotton/chiffon görüntülerinde ortada X yapan çapraz çizgiler).

Not: hafif düzensizlik/asimetri kusur sayılmadı. Ölçülen fark bir "gürültü" değil, **yapısal eğilim ters** — o yüzden DEĞİL.

---

## 4 metrik — fizik (ölçülü) vs emsal (gözle-tahmin) + sapma

### 1. Kat sayısı
| kumaş/oran | fizik (.fold path) | emsal büzgü (gözle) | oran | değerlendirme |
|---|---|---|---|---|
| cotton 2.0 | **15 kat** | OG shirred top bust: ~30–40 dikey pucker | ~0.4× | **düşük** |
| chiffon 2.5 | **19 kat** | shirred bust maxi bandı: ~25–35 | ~0.6× | düşük |
| linen 1.8 | **13 kat** | smock babydoll yoke: ~20–30 | ~0.5× | düşük |

Sapma: fizik emsalin **~%40–60'ı kadar** kat çiziyor. Shirring "çok ince, çok sık kırışık" bir dokudur; 13–19 kat couture gathered eteğe uyar, shirred panele SEYREK kalır.

### 2. Kat aralığı dağılımı (üstten alta spacing, mm)
Fizik (ölçüldü, `measure.mjs`):
- cotton: y@2% **11.9** → y@50% 18.1 → y@75% **19.1** (artıyor, üstte sık→altta seyrek DEĞİL, altta daha da geniş)
- chiffon: 9.4 → 13.9 → 14.9 (aynı: aşağı doğru genişliyor)
- linen: 17.0 → 21.1 → 21.4 (aşağı genişliyor)

Emsal (gözle): shirred panelde aralık üstte **çok dar** (yoğun kırışık), aşağı doğru kat sayısı DÜŞER ama görünen aralık dağılımı üstte sıkı kalır; peplum/ruffle serbestlediğinde birkaç geniş dalga.

Sapma: **eğilim aynı yönde (üst sık, alt geniş) — bu metrik geçer**, AMA fizikte fark az (11.9→19, ~1.6×); emsalde çok daha keskin (üstte iğne-ince, altta serbest). Zayıf uyum.

### 3. Sönüm mesafesi (kırışık üstten ne kadar iner sonra düzleşir, kumaş boyunun %'si)
Fizik (ölçüldü, `damping.mjs` — kat çizgisinin düz-çizgiden sapması derinlik bandında):
- cotton: 0-15% → **8.2mm**, 15-35% → **10.2mm (zirve)**, 35-60% → 7.5, 60-85% → 4.4, 85-100% → 0.9
- chiffon: 7.1 → **11.6 (zirve)** → 8.9 → 4.1 → 0.8
- linen: 10.1 → **16.2 (zirve)** → 13.6 → 7.0 → 1.2

→ Fizikte kat kimliği **~%15–35 derinlikte ZİRVE**, sonra sönüyor. Kırışıklık üstte değil, ORTADA en güçlü. Etkin "aktif" bölge kumaşın **~%0–85'i** (tam boy).

Emsal (gözle): shirred kırışık **%0'da (gather hattında) en yoğun**, **%10–25 içinde söner**. bust maxi'de shirring bandı sadece üst ~%12; altı düz. smock babydoll'da yoke ~%15; altı serbest drape.

Sapma: **yön TERS + mesafe 3–4× fazla.** Emsal sönümü ~%15–25; fizik sönümü ~%85 (neredeyse hiç sönmüyor) ve zirvesi ortada. En büyük mismatch bu.

### 4. Üst-alt yoğunluk oranı (üst kat yoğunluğu / alt kat yoğunluğu)
Fizik (spacing'ten türetildi, yoğunluk = 1/aralık):
- cotton: üst 1/11.9 / alt 1/19.1 = **1.6** (üst 1.6× yoğun)
- chiffon: 1/9.4 / 1/14.9 = **1.6**
- linen: 1/17 / 1/21.4 = **1.3**

Emsal (gözle): shirred panelde üst yoğunluk çok baskın — üstte ~30 kırışık, altta ~5–8 dalga → oran **~4–6**.

Sapma: fizik **1.3–1.6**, emsal **~4–6** → fizik **~3× az kontrastlı**. Fizik büzgüyü tüm panele yayıyor; emsal üste kilitliyor.

---

## Özet sapma tablosu

| metrik | fizik | emsal | sapma |
|---|---|---|---|
| 1. kat sayısı | 13–19 | 25–45 | fizik ~%40–60'ı, DÜŞÜK |
| 2. aralık dağılımı yönü | üst sık→alt geniş (1.6×) | üst çok sık→alt serbest (keskin) | aynı yön, fizik zayıf — GEÇER-zayıf |
| 3. sönüm mesafesi | ~%85 (zirve ortada) | ~%15–25 (zirve üstte) | **yön TERS, 3–4× fazla — EN KÖTÜ** |
| 4. üst/alt yoğunluk oranı | 1.3–1.6 | ~4–6 | **~3× az, DÜŞÜK** |

## Hangi metrik kapatılmalı, ne yönde

1. **Sönüm (metrik 3) — birincil.** Katların dikey aktif bölgesi **üste kilitlenmeli**: kırışık gather hattında en güçlü, kumaş boyunun **~%15–25'i içinde düzleşmeli**. Şu an zirve ortada ve boy sonuna dek sürüyor. Fizikte muhtemel neden: pin sadece üst kenarda; alt serbest sarktığı için orta bölge en çok gerilip kıvrılıyor. Çözüm yönü: büzgü sıkışmasını üst birkaç düğüm satırına yoğunlaştır (üstte yüksek gather-stiffness, alta doğru gevşet) VEYA shirred için ayrı bir "üstte sıkışan, altta serbest" pin/rest profili.

2. **Üst/alt yoğunluk oranı (metrik 4).** Hedef ~4–6. Üstte daha çok, altta daha az görünür kat. Metrik 3 düzelirse bu da düzelir (aynı olgu).

3. **Kat sayısı (metrik 2→1).** Shirred için daha çok, daha ince kat (~25–35). Gather oranı yüksekken çözücü daha çok düğüm/daha ince ızgara ile daha sık kırışık üretmeli; şu an çözünürlük seyrek.

4. **Orta kesişen katlar.** cotton/chiffon PNG'de ortada çapraz kesişen fold'lar var (fiziksel çakışma/tünelleme). Kırışık üste kilitlenince bu bölge de sakinleşir; ayrıca kat çizgileri kesişmemeli (self-intersection).

Genel yön: mevcut çözücü **gathered ETEK** (tek üst dikişten toplanmış, tam boy dökülen) için makul; **shirred/smocked PANEL** için değil. İki ayrı primitif gerekebilir — ya da shirred için "üst-kilitli sönüm" profili eklenmeli.

## Ham veriler
- Üretim: `node engine/flat-engine/cloth-solver.mjs /tmp/phys-{cotton,chiffon,linen}.svg {cotton 2.0 | chiffon 2.5 | linen 1.8}`
- Terminal: cotton 15 kat (360→180), chiffon 19 kat (450→180), linen 13 kat (324→180)
- PNG: /tmp/phys-*.png (400×460, Chrome headless, gözle onaylandı)
- Ölçüm scriptleri: /tmp/measure.mjs, /tmp/damping.mjs
- Emsaller: design_patterns/crops/ar-202411-6.png, ar-202416-4.png, ar-202432-1.png, 10-1.png

---

# KIYAS-2 — shirred profili düzeltilmiş hali (2026-07-21)

Solvera `shirred` profil parametresi eklendi (üst-kilitli sönüm + daha çok kat + fold'lar üst %28'e kırpıldı). 5. argüman = profil. Aynı 4 metrik yeniden ölçüldü.

Üretim: `node engine/flat-engine/cloth-solver.mjs /tmp/shj-{cotton,chiffon,linen}.svg {cotton 2.5 | chiffon 3.0 | linen 2.0} shirred`
Terminal: cotton **33 kat** (450→180), chiffon **41 kat** (540→180), linen **27 kat** (360→180). PNG'ler gözle onaylandı (/tmp/shj-*.png).

## VERDICT: **AYNI KARAKTERDE** — önceki "DEĞİL"den geçti.

Fizik artık **üst kenarda yoğun kırışık kümesi → aşağı sönen** shirred panel karakteri çiziyor. Kıyas-1'in birincil kusuru (sönüm YÖNÜ TERS: zirve ortada) DÜZELDİ — zirve artık üstte, aşağı monoton söner. Kat sayısı emsal aralığına girdi. İki metrik (sönüm mesafesi, yoğunluk oranı) hâlâ emsalin hafif dışında ama YÖN doğru ve büyüklük emsale makul yakın; yapısal eğilim artık gathered etek değil shirred panel.

PNG gözlemi: üç kumaşta da fold'lar üst ~%30 bandında sıkışık, altta kumaş düz düşüyor (hem'deki zikzak/asimetri kusur sayılmadı — talimat gereği). Kıyas-1'deki orta-kesişen X çapraz fold'lar da kayboldu.

## 4 metrik — önceki sapma → şimdiki değer

| metrik | kıyas-1 (eski) | kıyas-2 (shirred) | emsal | durum |
|---|---|---|---|---|
| **1. Kat sayısı** | 13–19 (%40–60 düşük) | **27 / 33 / 41** | 25–45 | ✅ ARALIĞA GİRDİ (linen 2.0→27, cotton 2.5→33, chiffon 3.0→41) |
| **2. Aralık dağılımı** | üst sık→alt geniş 1.6× (zayıf) | üst sık→alt geniş, keskin (gap cotton 2.6→8.7mm, chiffon 2.1→4.9, linen 3.1→10.8) | üst çok sık→alt serbest | ✅ DOĞRU YÖN, kontrast keskinleşti |
| **3. Sönüm mesafesi** | ~%85, zirve ORTADA (yön TERS) | **%32 / %34 / %33**, zirve ÜSTTE (yön DOĞRU) | %15–25 | ⚠️ YÖN DÜZELDİ, mesafe 2.5× iyileşti; hâlâ ~%8–17 puan uzun |
| **4. Üst/alt yoğunluk oranı** | 1.3–1.6 (~3× az) | **3.35 / 2.33 / 3.49** | ~4–6 | ⚠️ YÖN DOĞRU, ~2× iyileşti; hâlâ hafif düşük (özellikle chiffon 2.33) |

Ham ölçüm (band point-count üstten alta):
- cotton: 33,35,20,19,32,18,20,20 → top-band n=66 gap=2.6mm, bot-active n=26 gap=8.7mm, oran 3.35
- chiffon: 41,41,31,26,26,24,32,24 → top n=82 gap=2.1, bot n=40 gap=4.9, oran 2.33
- linen: 27,29,21,14,20,24,14,12 → top n=55 gap=3.1, bot n=22 gap=10.8, oran 3.49

## Hâlâ sapan (ikincil, yön doğru)

1. **Sönüm mesafesi biraz uzun (metrik 3):** fizik %32–34, emsal %15–25 → ~%8–17 puan fazla. Kırpma üst %28'e yapılmış ama aktif fold bölgesi %32–34'e taşıyor (fold path'ler kırpma sınırının biraz altına iniyor). Emsale tam oturmak isterse kırpmayı ~%20–22'ye çekmek yeterli. AMA yön doğru, karakter bozulmuyor.
2. **Chiffon yoğunluk oranı 2.33 hedefin altında:** cotton/linen 3.35–3.49 emsale (4–6) daha yakın; chiffon'da alt band hâlâ nispeten yoğun (bot n=40). Chiffon yüksek oran (3.0) daha çok kat üretiyor ama alt banda da yayıyor. İkincil; yön doğru.

Not: bu iki sapma büyüklük ayarı (kırpma yüzdesi + chiffon alt-band sönüm eğrisi), yapısal değil. Kıyas-1'in "iki ayrı primitif / ters işaret" tanısı ARTIK GEÇERSİZ — tek profil parametresi karakteri döndürdü.
