# stitchu — YOL HARİTASI

> **Tek plan kaynağı.** Yeni session sırası: `CLAUDE.md` → **bu dosya** → `DERSLER.md`. Başka plan dosyası açma.
> 2026-07-31 tam yeniden yazım: ürün sırasına göre. 29 Tem sürümü git geçmişinde (`git show HEAD:ROADMAP.md`); oradaki ölçümler bu dosyada korundu.

---

## ★ HEDEF (Damla, 31 Tem — her şeyin üstünde)

> **Bir istek promptu verilir → KALIP + FLAT çıkar. Ve bunlar GİYİLEBİLİR, SATILABİLİR şeylerdir.**
>
> *"matematiğinin ne kadar kusursuz olduğu umrumda değil; bir istek promptu kalıp + flat olarak verebilmesi umrumda. ve bunun giyilebilir satılabilir şeyler olması umrumda."*

Zarif matematik **araç**, vitrin değil. Sadece bu çıktıyı üretmeye yarıyorsa değerli.

## ★ LİG (Damla, 29 Tem — ve bu bir İNDİRİM DEĞİL)

stitchu Damla'nın ilk göz ağrısı. SF şirketi ayrı (rabadon/infra) — ama **bu, stitchu'nun ligini ASLA düşürmez.** Damla'nın sözü: *"her şeyi çok zaman alsa da zor da olsa en iyi en verimli yoldan yap, kolaya kaçma."*

Tek değişiklik: mühendislik kararı artık "bu unicorn tezi olur mu?" diye sınanmıyor. **"En doğru yol bu mu?" diye HER ZAMAN sınanıyor.** 29 Tem'de altı çerçevenin altısı da "ama bu SF ölçeği mi?" sorusunda öldü ve gün yandı. **Soru kalktı, standart kalkmadı.**

## ★ TEK KAPI (metrik merdiveni İPTAL)

Üç soru. Biri hayırsa **olmamıştır**:

# 1. Bunu giyer misin?
# 2. Bunu Etsy'ye koyabilir misin?
# 3. Diğer fashion flat'lerden ayırt edilemeyecek kadar iyi mi?

mm, tolerans, yakınsama — bunlar kapıyı geçmenin **aracı**, kapının kendisi değil. **Ara metrik kapısı KURULMAZ.**
Ve: ölçüm, tablo, rapor, mimari, benchmark **nesne değildir.** Bu proje tam olarak böyle %70'lik parçalar yığıp sıfır ürün çıkardı.

---

# YOL HARİTASI — her kilometre taşı bir NESNEYLE biter

Sıra atlanmaz. Kapıyı geçmeden sonrakine geçilmez.

## ★ M0 — GİRDİ PROBLEMİ: prompt → resim → kalıp  ← ŞU AN BURADASIN
**Nesne: ekranda gördüğün, ayarladığın, sonra indirdiğin elbise.**

### Önce sayıyı bil (31 Tem, `engine/vocab.json`'dan sayıldı)

**Bir kalıp 37 kategorik alan + 8 ölçü = 45 sayı istiyor. "Bir elbise" bunun 1'ini veriyor.**
Kalan 44'ü **matematik uyduramaz.** Gelebileceği yalnızca üç yer var, dördüncüsü yok:

| Kaynak | Ne doldurur |
|---|---|
| Kullanıcı söyler | 45 soru = kullanılamaz ürün |
| **Varsayılan + beden tablosu** | 8 ölçü beden tablosundan (34-48), 37 kategorik **varsayılan profilden** |
| Referans görselden çıkarım | görü kategorikleri doldurur (sonra) |

**Vücut ölçüsü gerekmiyor:** satılabilir kalıp **sabit beden** — müşteri 38'i seçer. MTM ölü (ZOZO/unspun/Fayma battı, Damla kararı). Kendi giysin için ölçünü **bir kez** verirsin: form, araştırma değil.
**"Ne kadar uzun" tek bir sayıdır**, varsayılanı olur, kadranla değişir.

### ★ Ve "seni anladım mı"nın cevabı JSON OLAMAZ — RESİM olmak zorunda

```
"puf kollu midi A-line elbise"
   → 1 alan promptdan, 36 alan varsayılandan
   → 2 saniyede FLAT EKRANA ÇİZİLİR
   → Damla bakar: "kol daha kabarık, boy 5cm kısa"
   → kadran oynar, yeniden çizilir
   → beğenince KALIP İNER
```

**Flat sonda teslim edilen çıktı değil — flat ARAYÜZÜN KENDİSİ.** Dilin kaybettiği bilgiyi ancak resim geri verir. `engine/flat-engine/*` (40 stil, parametrik, zaten çiziyor) bu döngünün ekran katmanı — **yarısı kurulu.**

### Yapılacak
1. **Varsayılan profil**: 37 alanın her biri için makul varsayılan + hangi bedende hangi ölçü (34-48 tablo). Damla'nın zevkine göre, generic değil.
2. **LLM → alan doldurma**: prompt sadece **ayrık yapı** verir, asla sayı üretmez. Doldurmadığı her alan varsayılanda kalır ve **kullanıcıya görünür**.
3. **Anında flat**: doldurulan alanlar → `flat-engine` → ekranda çizim.
4. **Kadranlar**: her alan değiştirilebilir, değişince yeniden çizilir.
5. **Kalıp**: beğenilen konfigürasyon → **GarmentCode** (MIT, `github.com/maria-korosteleva/GarmentCode`) → geçerli dikiş kalıbı. Geçerlilik DSL'in inşasından gelir, çözücüye gerek yok. *(Design2GarmentCode, CVPR'25 bunun çalıştığını gösterdi.)*

**Kapı:** Damla bir cümle yazsın → 2 saniyede elbiseyi **görsün** → iki kadran oynatsın → kalıbı indirsin.

⚠️ GarmentCode tek başına wrapper. Resim döngüsü + M3/M4 ile birlikte değil. İfade gücü kendi bileşen kütüphanesi kadar (başkasının poğaça listesi) — **başlangıç noktası, varış değil.** İçi M7'de değişir.

## M1 — kalıp → basılabilir paket
**Nesne: yazıcıdan çıkan, kesilebilen kağıt.**

- Dikiş payı: **eğri offset** (poligon offset DEĞİL — Seamly2D'yi bunun için eleştirdik, kendimiz yapmayacağız)
- Çentik (tek=ön / çift=arka / üçlü=arka orta), grainline oku, kat çizgisi
- **1:1 PDF**: A4 döşeli + A0, sayfa no + hizalama, **4 cm test karesi**
- Parça etiketi: isim, no, beden, "cut 2" / "cut 1 on fold", kumaş/tela
- **Kapı:** bas → 4cm kareyi cetvelle ölç → parçaları kes.

## M2 — DİK VE GİY  ← TEK KAPI'nın ilk geçişi
**Nesne: giyilebilir giysi.**

- Damla (veya bir dikişçi) M1 paketini diker.
- Oturmayan yer **hangi ölçü/ease parametresi** olduğu yazılarak geri beslenir.
- **Kapı: Damla giyer mi?** Geçmeden M3'e geçme.
- ⚠️ Bu adım **yazılımla hızlandırılamaz.** Gerçek kumaş, gerçek dikim. Planın en yavaş parçası.

## M3 — flat üretimi
**Nesne: kalıbın yanında profesyonel teknik çizim.**

- `engine/flat-engine/cloth-solver.mjs` (2B Verlet) başlığında zaten yazıyor: *"Çıktı → kat (drape fold) çizgileri."* **Yarı kurulmuş, bitirilecek.**
- `engine/src/drape.hpp` 3B kütle-yay Verlet + `maxSpringStrain` hazır.
- Boru hattı: drape → köşe eğriliği → ridge/valley çizgileri → **PolyVectorization** (MIT) ile temiz vektör.
- **Kapı:** bizim flat şu an **13 çizgi** (`dataset/taste-pool/svg/g001-flat.svg`); referansta (`design_patterns/crops-flat/flat-01.png`) sadece etek kıvrımları ~20. Hedef **50+**, yan yana **GÖZLE** bakılır.
- ⚠️ Gerçek drape'te yüzlerce mikro kırışık var, flat'te ~10 temiz kat olmalı → **agresif sadeleştirme** gerekiyor; bu bir tasarım problemi, sadece çıkarım değil. Güven: %60-70.
- **Boşluk:** kalıpçılar flat vermiyor, flat'çiler kalıp vermiyor. **Tek kaynaktan ikisini veren yok.** Ürün farkımız burası.

## M4 — güzelleştirme (satılacak, çirkin olamaz)
**Nesne: eğrileri düzgün kalıp.**

- **`curve-research/01-elastica.py` ÇALIŞIYOR** (31 Tem):
  - Açı uzayı formülasyonu → **yay uzunluğu inşaat gereği TAM** (hata 0.0, yaklaşık değil)
  - Uç nokta hatası **1e-13 mm**, 5 iterasyonda yakınsıyor, Newton+KKT
  - Tohum = Bézier'in eşit-yay-boyu örneklemesi. **Lineer açı tohumu ÇALIŞMIYOR** (kapanma hatası 91mm'de takılır — denendi, tekrar deneme)
  - **Elle seçilmiş sabit: 0.** (Bézier'de 3 tane: `0.26 / 0.34 / 0.78`)
- **★ ÇÖZÜLDÜ (31 Tem, ölçüldü — `curve-research/02-underarm-angle.py`): MOTOR KOL OYUĞUNU YANLIŞ AÇIYLA ÇIKARIYOR.**

  Kural (kaynaklı): *"the armhole curve should be perpendicular to the side seam and shoulder seams"* · *"Pattern pieces should meet at a 90-degree angle for the first 0.5-1cm to prevent irregular angles or **'V' shapes**"*

  **Gerçek Buğra kalıbında ölçüldü (beden 38, 3/6/10mm yerel teğet, SVD):**
  | | koltukaltı | omuz ucu |
  |---|---|---|
  | Ön beden | **75.2–75.7°** | **85.8–88.3°** |
  | Arka beden | **85.9–89.7°** | **72.9–85.6°** |

  **Bizim motor: koltukaltı 24.4°, omuz ucu 0.0°.** Omuzda 0° — `bodice.cpp:159-166` yorumu bunu bilerek yapıyor ("teğet paylaşsınlar, 77°'lik sivrilik gitsin"). Bir sivriliği düzeltirken kuralı ihlal etmişler.
  → **M4'te elastica doğru uç teğetlerle (≈90°) koşulacak.** Düzeltme tekniğinin zanaattaki adı **blending/truing**: ön+arka yan dikişten yan yana konur, arkadan öne eğri düz akmalı.
  ⚠️ Beden 36/40/42 ölçümü çöp (0.0°/0.1°) — landmark indisleri `CLAUDE.md`'de **beden 38 için** çıkarılmış, diğerlerine uymuyor. Yeni beden ölçmeden önce landmark çıkarımı o beden için yeniden koşulmalı.
- **Kapı:** eski/yeni yan yana PNG → **Damla gözle bakar.**

## M5 — beden serisi 34-48
**Nesne: tek kalıp, sekiz beden.**

- **Nokta bazlı grade rule.** Lekala'nın hatası tek katsayıyla ölçekleme (kullanıcı şikayeti: *"shapeless box"*); doğrusu nokta başına ayrı delta — göğüs +2cm, bel +1.5cm, boyun +0.5cm. Basit gövdede 8-12 grade noktası tipik.
- **Katmanlı PDF (OCG)** — sadece kendi bedenini yazdır; modern indie kalıp standardı.
- **Kapı:** her bedende her dikiş çifti hâlâ eşit; çevreler monoton.

## M6 — SAT
**Nesne: para.**

- Etsy: kalıp $8-15, paket $20-40. **Talimat kitapçığı algılanan değerin %40-50'si** — atlanamaz. Montaj sırası **dikiş grafiğinin topolojik sıralamasından** türetilir (kimse yapmıyor).
- DXF-AAMA (`engine/src/dxf.cpp` var). Katman tablosu: 1=sınır, 4=çentik, 7=grainline, 8=iç çizgi, 13=delik, 14=dikiş çizgisi.
- **Üç yüzey:** yazılım (yazılım kullanana) · kalıp+flat (Etsy'ciye) · dikilmiş giysi (dikemeyene).
- **Sabit beden 34-44/48.** Made-to-measure YOK — kanıtlı karar: ZOZO, unspun, Fayma battı; Lekala kalite tavanına çarptı. Sebep bilgi-teorik: ölçü bedenin şeklini belirlemiyor.

## M7+ — sonra (şimdi değil)
- **Zanaat dağarcığı**: blok + 7 işlem (pivot dart, slash&spread, walk, blend, ease, pay, grade). GarmentCode'un içini bununla değiştir. *(Kalıpçı sıfırdan çizmez, bloktan türetir — Joseph-Armstrong.)* **Dart pivot + slash&spread açık kaynakta YOK** (Seamly2D #369 hâlâ açık) → yazılacak.
- **Geometri çekirdeği**: BFF (MIT, sınır uzunluğu **dayatılabilir** düzleştirme) + OptCuts (MIT, otomatik dikiş yerleşimi) + koni tekilliği = pens (Gauss-Bonnet).
  **Kapı: panel üçgenlerinde strain < %0.5.** Geçmezse açılmaz. *(Damla 29 Tem: "3B-flatten'ı ÇEKİRDEK sanma" — endüstri 2B-kaynak → 3B-doğrulama.)*
- **Foto → kalıp**: SOTA %23.7 (Sewformer'ın %76.3'ü dikilemiyor). **Takvim sözü verilmez.**

---

## NEDEN BUGÜNE KADAR BİTMEDİ (ölçüldü)

1. **Motor her giysiyi sıfırdan formülle çiziyor** → giysi başına dosya. `engine/src/` = 17.693 satır, **43 .cpp**. Giysi başına O(n) insan emeği.
2. **Sayılar uydurma.** `bodice.hpp: armholeHollowShareFront = 0.34` ↔ Buğra reçetesinde aynı sayı **1.07** (kirişin dışı). `chestEase: 0.211032`, `neckWidthMult: 2.728261`. Altı ondalık = tek kalıba overfit → **SVG'nin çirkin olma sebebi.**
3. **Reçete katmanı yanlış dağarcıkla.** `recipe.cpp` 1089 satır; `move/line/curve(cp1,cp2)/close` = çizim dili, kurgu dili değil. `docs/RECETE-SPEC.md` bunu **erdem** sanmış: *"motorun BUGÜN yaptığı işlemlere birebir oturur."*
4. **Korpus yer gerçeği değil.** `patterns_real/geometry/geometry-full.json` (104 halka): **7/13 parça beden-monotonluğunu ihlal ediyor**, 32/104 containment başarısız, `Collar Lining` 46→48'de 501.5→**382.9 mm**, `Upper Sleeve` 36 ve 38 aynı halka. Tracer hatası mı kalıp mı **ayrışmadı**.

## RAKİPLER (31 Tem taraması)

Bu **sektörün** hastalığı, bizim bug'ımız değil:

| Sistem | Kaç model | Nasıl |
|---|---|---|
| Lekala | 3.003 | **hepsi elle çizilmiş** |
| Tailornova | "sınırsız" | gerçekte ~15 şablon × slider |
| Six Atomic / Style3D | **gizli** | enterprise kara kutu |
| Seamly2D | sınırsız | tasarımcı elle çiziyor |

**Kaynak kodundan okunan (29 Tem, geçerli):**
- **Seamly2D/Valentina** — 50 `Tool` enum'unda tek doğrulama aracı yok. `union_tool.cpp:378` kenar uzunluklarını hiç karşılaştırmıyor. Eğri ofseti yok (sabit 0.5px poligon). Miter sınırı çıplak `const qreal maxL = 2.4;`. Test toleransı 1mm. Kendi-kesme testinin üç vakasından ikisi 64-bit'te derlemeden çıkarılmış.
- **FreeSewing** — tek dikiş çiftini elle seçilmiş **altı çarpanla** (0.8/0.9/1.3/1.15/0.99/1.008) oturtuyor, 2mm tolerans, 50 turda **sessizce pes ediyor**. Test paketinde tek geometrik iddia yok.
- **GarmentCode** — uzunluk kontrolü hiç açılmayan `verbose` bayrağının arkasında. Dikiş payı, çentik, düz iplik yok.

**⚠️ ABARTMA:** ticari tarafta doğrulama VAR — CLO3D `Check Sewing Length` (>1mm kırmızı), Gerber `Walk Pieces`, CLO patenti **US 11308707** derecelendirmede dikiş uzunluk oranını otomatik koruyor. Ve **parafashion** (SIGGRAPH'22, kodu açık GPL3) zaten anizotropik dokuma enerjisi + grain kontrolü + 45° bias + dikiş uzunluğu eşitliği içeriyor. **"Kimse dikiş eşitliğini çözmüyor" İDDİASI YANLIŞ** (31 Tem'de kuruldu ve çürütüldü).

### Neden AI foto üretiyor da kalıp üretemiyor
| | Görsel | Kalıp |
|---|---|---|
| Veri | **5 milyar** çift (LAION) | ~115k, **sentetik** |
| Doğruluk | yok — "iyi görünüyorsa" doğru | **ikili + fiziksel**, mm tutmazsa kapanmıyor |
| Çıktı | nihai ürün | **talimat**; gerçek ürün dikilmiş giysi |

Duvar **üretimde değil doğrulamada.** Doğrulayıcı yarı kimsede yok.

---

## KURALLAR (ihlal = iş geri alınır)

- **Giysi başına yeni dosya — bir daha asla.**
- **Beden ölçüsü veya beyan edilmiş tasarım parametresi olmayan hiçbir sayı.**
- **Motorun kendi çıktısı asla kanıt değildir** — `golden-reference.csv`, `dataset/taste-pool/`, `contract/preview-truth.json`, `contract/figure-landmarks.json` (kaynağı `buildHalf:` = prototip kodu), showcase SVG'leri: **hepsi motor çıktısı.**
- **GPL/AGPL kod repoya girmez.** Algoritmayı makaleden yazmak serbest, kodu almak değil.
- Patternmaking sayısı **tahmin edilmez** — `knowledge/drafting-math-eu38.md` (Aldrich doğrulanmış) veya doğrulanmış kaynak.
- Her aşama **render → PNG → GÖZLE BAK.** SVG path'e bakıp beğenmek yasak (DERSLER.md).
- **Ajan tavanı 3-4.** Geometriyle ölçülebilen şey araştırmaya sorulmaz (29 Tem: 100 ajan / 863k token yandı).
- `engine/flat-engine/*` **SALT-OKUNUR** (Damla emri 19 Tem) — Damla'nın flat çizim dili.
- **Çöp çıkarsa shiplenmez:** silinir, dürüst söylenir.

## LİSANS

**✅ ALINIR:** GarmentCode (MIT) · BFF (MIT) · OptCuts (MIT) · libigl core (MPL2 — **CoMISo hariç, GPL3**) · libWetCloth/DER (MPL-2.0) · informative-drawings (MIT) · PolyVectorization (MIT) · ezdxf (BSD) · DexiNed · SketchRNN (Apache)

**❌ DOKUNULMAZ:** parafashion (GPL3) · Seamly2D (GPL3) · κ-curves (GPL3) · **Patro (AGPL)** · potrace (GPL2) · RTSC (GPL) · Developability of Triangle Meshes (GPL) · **Style3D GarmageNet (CC BY-NC-ND, ticari yasak)** · libspiro (lisans çelişkili, kullanma)

## ELDE NE VAR

| Dosya | Ne | Durum |
|---|---|---|
| `curve-research/01-elastica.py` | **elastica çözücü — ÇALIŞIYOR** | 31 Tem, yeni |
| `core/include/stitchu/geom.hpp` | adaptif Gauss-Legendre yay uzunluğu 1e-12 | hazır |
| `core/include/stitchu/solve.hpp` | LM çözücü, yakınsamayınca söyler | hazır |
| `engine/flat-engine/cloth-solver.mjs` | 2B Verlet → kat çizgileri | **yarı kurulmuş** |
| `engine/src/drape.hpp` | 3B Verlet + strain | hazır |
| `engine/src/dxf.cpp`, `nest.cpp` | DXF-AAMA + marker | yaşar |
| `engine/tools/render-*.mjs` | PNG render | yaşar |
| `engine/flat-engine/*` | Damla'nın flat dili, 40 stil | SALT-OKUNUR |
| 43 giysi .cpp'si | **şartname olarak oku, kod olarak kullanma** | `engine/legacy/`'ye |

## DÜRÜST BİLİNMEYENLER

1. **⚠️ PATENT:** Tri-D Technologies **US12339643B2** (24 Haz 2025) — ölçü → kumaş ve ease'li 3B model → 2B parçalar zincirini kapsıyor. **OKUNMALI.** Sabit-beden yolumuz muhtemelen dışında ama varsayım yapılmayacak.
2. **Güzellik kompozisyondan çıkar mı?** Motor "geçerli" üretir; "güzel"i tanımlayan Damla. **Açık.**
3. Buğra korpusunun 7/13 ihlali: tracer mı kalıp mı — ayrışmadı
4. ASTM D6673 tam spec ücretli; katman tablosu ikincil kaynaktan — gerçek DXF ile teyit
5. SMPL ticari lisansı belirsiz → gerekirse ANSUR II / CAESAR
6. Türevlenebilir simülasyon araştırması eksik kaldı
7. Landmark indisleri **sadece beden 38** için geçerli; başka bedende ölçüm yapmadan önce çıkarım o beden için yeniden koşulmalı

### ✅ ÇÖZÜLDÜ — HUKUK (31 Tem, araştırıldı)
Satın alınmış kalıptan ne yapılabilir:
| Eylem | Durum |
|---|---|
| Kalıbı **ölçmek**, verisinden öğrenmek | ✅ güvenli |
| Ondan **blok/sloper** türetmek | ✅ güvenli — "rub-off" endüstri standardı, tersine mühendislik yasal |
| O bloktan **FARKLI** tasarım yapıp satmak | ✅ hukuken temiz (giysi "useful article", kesim telifli değil — *Star Athletica v. Varsity Brands*, 2017) |
| **Aynı tasarımı** yeniden çizip satmak | ❌ **YASAK** (türev eser) |
| Onların kalıbını derecelendirip satmak | ⚠️ **riskli** (kopya+değişiklik = türev tartışması) |

Telifli olan: kalıbın **çizimi, talimat metni, illüstrasyonları**. Telifli olmayan: kalıptan üretilen **giysi**. *(Baker v. Selden, 1879: telif ifadeyi korur, sanatı uygulamayı değil.)*
"Personal use only" maddesi hukuken zayıf (satın alma öncesi sözleşme değil) **ama pratikte DMCA takedown riski gerçek.**
→ **stitchu çizgisi: Buğra'yı öğrenmek ve blok türetmek için kullan; kendi tasarımlarımızı sat; onların tasarımını asla.**

### ⚠️ 29 TEM — GERİ ALINMIŞ İDDİA (bir daha yazılmasın)
Daha önce *"profesyonelin sattığı kalıpta hata bulduk (27mm yan dikiş, bedenle büyüyen 3.5→7.1mm omuz)"* yazıyordu. **YANLIŞTI, hata bizimdi.** Kesim çizgisinde omuz farkı 8 bedende de +0.95…+1.13mm — dümdüz. "Büyüyen fark" sadece bizim 10mm miter ofsetimizden sonra çıkıyor. Pens bacakları 119.84 vs 119.73mm (kusursuz true edilmiş); bizim ofsetimiz onu ±5-30mm'ye çeviriyor. **Arka omzun uzun olması standart kalıpçılıktır** (kürek payı 6-12mm).

---

## YENİ SESSION NASIL DEVAM EDER

1. `CLAUDE.md` → bu dosya → `DERSLER.md`
2. **M-sırasında ilk bitmemiş olanı al. Sıra atlama.**
3. Kapıyı geçmeden sonrakine geçme. Kapı = sayı veya Damla'nın gözü; ikisi de "sanırım oldu" kabul etmez.
4. Bitince **render → PNG → Damla'ya göster**, sonra commit + push.
5. Rapor: `~/damla_projects_2026/reports/YYYY-MM-DD-konu.txt` (Damla .md açamıyor).
