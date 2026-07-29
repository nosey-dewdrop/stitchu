# stitchu — YOL HARİTASI (2026-07-29, tam yeniden yazım)

> Bu dosya 29 Temmuz'daki günün sonunda yazıldı. O gün beş mimari önerisi çöktü, iki pazar
> iddiası kanıtla çürütüldü, üç açık kaynak kalıp sistemi kaynak kodundan okundu ve motorun
> gerçek bir couture kalıbını çıkaramadığı ölçüldü. Buradaki her cümlenin arkasında o günün
> ölçümü var; tahmin yok.

---

## 0. NE SATIYORUZ

Premium **tasarım**. Chanel/Dior çıtası, Lekala değil. Üç satış yüzeyi:

1. **Kalıp** — ev dikişçisine, 1:1 basılabilir, talimatlı.
2. **Dikilmiş ürün** — giysinin kendisi.
3. **Tasarım** — lisans/tech-pack.

Üçü de tek bir nesnenin paketlenmesi: **doğruluğu kanıtlanmış, derecelendirilmiş, montaj
bilgisi taşıyan panel seti.** Yani pazar seçimi mühendisliği değiştirmiyor.

**Bedenler 34-44 sabit.** Made-to-measure YOK ve bu bir kısıtlama değil, kanıtlı bir karar:
o iddiada ZOZO, unspun, Fayma battı, Lekala kalite tavanına çarptı. Sebep bilgi teorik —
ölçü bedenin şeklini belirlemiyor, aynı göğüs çevresi bambaşka kütle dağılımına oturuyor.
Buğra sabit beden satıyor ve premium müşteri memnun ödüyor. Herkesi öldüren problem bizim
yolumuzun üstünde değil.

---

## 1. NEDEN BİZ (29 Tem'de ölçülmüş, iddia değil)

**Okumada dünya çapındayız.** Satın alınmış 2 couture kalıbının 8 bedenini (112 halkanın
103'ü) semantik geometriye çevirdik: isimli dikişler, çentikler, dikiş çizgisi, mm hassasiyet.
Bu okuma, **profesyonelin sattığı kalıptaki hatayı buldu** — arka yan dikiş 8 bedende
sistematik ~27mm uzun, arka omuz bedenle büyüyen 3.5→7.1mm fazla.

**Dünyada kimse kalıbın dikilebilirliğini doğrulamıyor:**
- **Seamly2D/Valentina** — 50 girişlik `Tool` enum'unda tek bir ölçme/karşılaştırma/doğrulama
  aracı yok. `union_tool.cpp:378` iki parçayı birleştirirken kenar uzunluklarını hiç
  karşılaştırmıyor. Eğri ofseti yok: her eğri sabit 0.5 pikselde poligona çevriliyor.
  Miter sınırı çıplak `const qreal maxL = 2.4;`. Test toleransı 1mm. Kendi kendini kesme
  temizleme testinin adı `PossibleInfiniteClearLoops` ve üç vakasından ikisi 64-bit x86'da
  derlemeden çıkarılmış (`// Disabled due to "undefined behavior" problem`).
- **FreeSewing** — tek dikiş çiftini tek skalerle ve elle seçilmiş altı çarpanla
  (0.8/0.9/1.3/1.15/0.99/1.008) oturtuyor, 2mm tolerans, 50 turda sessizce pes ediyor.
  Test paketinde **tek bir geometrik iddia yok**; testler sadece "hata fırlatmadan çizildi mi"
  diye bakıyor.
- **GarmentCode** — uzunluk kontrolü var ama hiç açılmayan bir `verbose` bayrağının arkasında,
  yani ölü kod. Dikiş payı, çentik, düz iplik hiç yok.

**Ve kod yazmak artık darboğaz değil.** Lectra'nın on yılının çoğu alan bilgisini keşfetmek,
şirket kurmak ve entegrasyondu. Bilgi bugün okunabilir; yazmak hızlı. Geriye pahalı olan tek
şey **kimsenin yazmadığı yer** kalıyor — FreeSewing neden altı sihirli çarpan kullanıyor,
Buğra'nın arka yan dikişi neden 27mm uzun. Orası ölçümle çıkar ve ölçüm bizim güçlü yanımız.

---

## 2. ÇEKİRDEK FİKİR: GİYSİ DERLEYİCİSİ

stitchu bir çizim programı değil. **Bir derleyici.**

```
tasarım niyeti  →  IR (tipli giysi grafiği)  →  çözücü  →  doğrulanmış üretilebilir çıktı
                                                              + her çıktıya iliştirilmiş KANIT
```

Derleyici analojisi süs değil, mimari karar:
- **Tip sistemi = arayüz sözleşmeleri.** Kol ancak oyuk arayüzü uyuşuyorsa takılır.
  Geçersiz giysi **temsil edilemez**, çalıştırılıp bulunmaz.
- **Optimizasyon = kısıt çözücü.** Serbest parametreler, tüm dikiş kuralları aynı anda
  sağlanacak şekilde çözülür.
- **Doğrulama = derleyici hatası.** Kalıp dikilemezse çıktı üretilmez; sessizce bozuk
  geometri basılmaz (Seamly2D `points.append(px)` diyor, biz demeyeceğiz).
- **Sınırsız varyasyon**, ancak her varyasyonun doğruluğu makine tarafından kanıtlanabildiği
  için güvenli. Bitmoji gibi değiştirebilmenin ön koşulu bu.

---

## 3. MİMARİ — 11 KATMAN

**L0 — Yer gerçeği korpusu.** Satın alınmış couture kalıpları semantik IR'a. Bugün: 2 kalıp,
8 beden, 103 halka. Büyüyecek. Bu korpus dünyada kimsede yok.

**L1 — Tam geometri çekirdeği.** Eğri-yerel. Yay uzunluğu adaptif Gauss-Legendre (~1e-12),
poligonlaştırma YOK. Eğri-yerel dikiş payı ofseti, altı köşe işlemi (Seamly2D'den alınan
gerçek alan bilgisi), tam aritmetikli kesişim yüklemleri, ilmek temizleme. **Hedef: Seamly2D'nin
1mm test toleransına karşı mikron altı.** Ölçülebilir, kanıtlanabilir üstünlük.

**L2 — Giysi IR'ı.** Panel = kapalı kenar döngüsü. Kenar = eğri + arayüz etiketi + **ease
oranı** (GarmentCode dersi: ease "+2cm" değil ORAN olarak saklanır, tüm eşleştirme yansıtılmış
uzunluk üzerinden yapılır). Dikiş kuralı = (panelA kenar aralığı) ↔ (panelB kenar aralığı) +
kural (eşit / eased / büzgülü). Nokta = formül (Valentina'nın DAG'ı). Serileştirilebilir,
karşılaştırılabilir, sürümlenebilir.

**L3 — Kısıt çözücü.** Tüm dikiş kuralları eşzamanlı, **sert** kısıt. Levenberg-Marquardt,
deterministik, ve **yakınsama raporu**: yakınsamadıysa yakınsamadı der. Hedef <0.01mm.
(FreeSewing 2mm'de pes edip susuyor.)

**L4 — Derecelendirme = yeniden çözüm.** Grade tablosu/ofset kuralı yok; grafiği her beden
için yeniden çöz. Hakem: satın alınmış kalıbın 8 gerçek bedeni.

**L5 — Fizik doğrulama.** XPBD/projective dynamics, anizotropik gerilme-bükülme, gövde
çarpışması, yerçekimi. Ve gerçek dünya: dik, ölç, geri besle. `drape.cpp`'deki Verlet oyuncak
sayılmaz.

**L6 — Flat = kalıbın render'ı.** Görsel ASLA ayrı çizilmez; montajlanmış panellerden türetilir.
Bugün repoda tersi vardı ve bebe yaka çizimde fiyonk gibi çıkıyordu — o bir bug değil, mimari
sonucuydu. Bu katman Damla'nın "flat ile kalıp arasındaki accuracy" şartını **yapısal olarak**
garanti eder.

**L7 — Kompozisyon + etkileşim.** Bileşen değiştir, anında hem giysiyi gör hem doğru kalıbı al.
Artımlı yeniden çözüm, sıcak başlangıç, tarayıcıda C++/WASM, milisaniyeler. Hız sonradan
optimize edilecek detay değil, mimariyi belirleyen kısıt.

**L8 — Kumaş modeli.** Aynı kalıp ipekte ve denimde aynı kalıp değil. Anizotropi, dökülme
katsayısı, çekme. Gerçek malzeme verisi.

**L9 — AI katmanları.** Hepsi wrapper testini geçer, çünkü LLM'i çıkarınca IR + çözücü +
doğrulayıcı ayakta kalır:
- **Prompt/fotoğraf → IR parametreleri.** AI önerir, çözücü karar verir. AI hiçbir zaman
  geometri üretmez.
- **Görüntüden dijitalleştirme.** Herhangi bir kalıp PDF'i/fotoğrafı → IR.
- **Zevk asistanı.** Damla'nın onayladığı korpus üzerinden öneri.

**L10 — Üretim çıktısı.** DXF-AAMA (Seamly2D'nin atladığı MIRROR/DRILL/TEXT/REF katmanları
dahil), marker/nesting, tech pack, 1:1 döşenmiş PDF, ve **montaj grafiğinden türetilen dikiş
talimatı**.

---

## 4. MİLESTONE MERDİVENİ — her biri SERT kapılı

| # | İş | KAPI (kanıt olmadan geçilmez) |
|---|---|---|
| **M0** | Yer gerçeği korpusu | 2 kalıp × 8 beden semantik IR'da; anomaliler işaretli. **%92 tamam** (103/104 halka) |
| **M1** | Geometri çekirdeği | Yay uzunluğu bağıl hata <1e-10; eğri-yerel ofset ilmeksiz; Seamly2D ile aynı girdide **ölçülmüş** karşılaştırma raporu |
| **M2** | IR + çözücü | Gerçek Buğra-38 dikiş kurallarında artık **<0.01mm**, iki koşum bayt-özdeş, yakınsama raporu doğru |
| **M3** | Buğra'yı yeniden üret | Locket **7/7 parça**, 8 bedende, parça-parça mm raporu. Bebe yaka ve iki katmanlı puff kol dahil (bugün 4/7 ve yaka hiç yok) |
| **M4** | İlk tam paket | Satılabilir tek ürün: 34-44, 1:1 PDF, dikiş payı, çentik, düz iplik, talimat, doğru flat. **Damla'nın üç sorusu: üçü de EVET** |
| **M5** | Flat = render + kompozisyon | Yaka/kol değiştir → görsel ve kalıp birlikte değişir, <50ms, hâlâ <0.01mm |
| **M6** | Fizik | Dikilmiş numune ölçüsü ile simülasyon tahmini arasında <5mm |
| **M7** | AI | Fotoğraf/prompt → IR parametreleri; çıktı M2-M4 kapılarının hepsinden geçer |
| **M8** | Üç yüzey | Kalıp satışı + dikilmiş ürün + tasarım lisansı aynı çekirdekten |

---

## 5. KANIT DİSİPLİNİ

- Her milestone bir **çalıştırma çıktısıyla** kapanır. "Oldu/çalışıyor" yasak.
- Çöp çıkarsa **shiplenmez**: silinir, dürüst söylenir.
- Her tuğlada: NEYİ değiştirdi + HEDEF + BAŞARI ORANI.
- Hakem sırası: mm metriği → doğrulayıcı → Damla'nın gözü. Son söz Damla'da.

---

## 6. DÜRÜST BİLİNMEYENLER

1. **Güzellik kompozisyondan çıkar mı?** Motor "geçerli" üretebilir; "güzel"i tanımlayan Damla.
   Cevaba göre L7 ya bileşen seçici olur ya Damla'nın çizimini kalıba çeviren şey. **Açık.**
2. **Fiziksel doğrulama yavaştır.** Gerçek kumaş, gerçek dikim gerektirir. Yazılımla
   hızlandırılamaz.
3. **Patent riski.** Tri-D Technologies US12339643B2 (verildi: 24 Haziran 2025) ölçü → kumaş ve
   ease'li 3B model → 2B parçalar zincirini kapsıyor. **Okunmalı.** Bizim sabit-beden yolumuz
   muhtemelen dışında ama varsayım yapılmayacak.
4. **SF ölçeği.** "Damla'nın kalıp evi" tek başına SF hikayesi değil. Ölçek hikayesi aynı
   motorun tasarımcılara açılması. Sıra: önce kendi kullan, kanıtla, sonra araç olarak aç.

---

## 7. ŞU ANDA NEREDE DURUYORUZ

- **Var:** yer gerçeği korpusu (L0), doğrulayıcı (L3'ün denetim yarısı), geometri ilkelleri,
  DXF/nesting/tech-pack, `core/` altında yeni geometri çekirdeği ve LM çözücüsünün ilk hali.
- **Yok:** IR, çözücünün giysiye bağlanmış hali, eğri-yerel ofset, render-from-pattern,
  kompozisyon, fizik, AI katmanı.
- **Ölü:** `engine/`'in formül-çizim beyni (Buğra-38'de 7 parçanın 4'ü, bebe yaka yok,
  ön/arka aynı genişlikte). Vokabüler bilgi olarak duruyor, kod olarak değil.
