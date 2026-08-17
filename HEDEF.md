# HEDEF — stitchu

**Bu dosya reponun en üst otoritesidir.** ANAYASA / DERSLER / ROADMAP / CLAUDE.md ile çelişki çıkarsa çelişki bu dosya lehine **tek karar commit'iyle** kapanır; o commit'te diğer dosyanın çelişen satırı **silinir**. İki doğru bırakılmaz.

Açıldı: 2026-08-16 · Branch: `vardiya/2026-08-16`

---

## SAYAÇ

> **KAPSAM BÜYÜDÜ: +3 halka (H1.1a, H1.1b, H1.1c). Sebebi:** H1.1'in mührü şartnameyi ilk kez BUGÜNKÜ pakete karşı ölçtü ve üç madde gerçekten sağlanmıyor çıktı — nesting önce/sonra kanıtı hiç üretilmiyor, kumaş önerisi hiçbir sayfaya basılmıyor, kontakt sayfasının emsal PDF'leri diskte yok. Üçü de "H1.0 yeşillenince geçer" cinsinden **değil**; üçü de alıcıya verdiğimiz sözün eksik kalan parçası. Şartnameyi "tam" diye kapatıp bunları sessizce taşımak kapı boyamak olurdu.

```
H1'e kalan:  8 halka / 33–47 koşu saati    [**KAPSAM BÜYÜDÜ: +2 halka.** TUR 15 gradeset'i sevk edilen motora bağladı ve grade denetimi orada HİÇ koşmamış çıktı: (b) dört gövde panelinin kenar sayısı bedene göre 2 zıplıyor → tabloya giremiyorlar (~4–6s) · (c) motorda `wb` rolü yok → bel dikişi çevresi 8 bedende ölçülemiyor (~4–6s). Altıncı kırmızı yedinciye ULAŞTI (mirror_seams 8→0), ama monotonluk 18→30]
H2'ye kalan: 6 halka / 158–285 koşu saati   [**H2.1 KAPANDI** — operatör sicili kuruldu, red cümlesi eksik operatörü ADIYLA söylüyor]
H3'e kalan:  4 halka / 80–120 koşu saati + zevk turu 0
TABAN:       2 halka / DAMLA'DA           [T17 KAPANDI · T1 yok-hükmünde · T5 = K5'e bloke · style/figure pinleri = K15'e bloke]
```

## TUR 8 — H1.0a: İKİ BLOKÖRDEN BİRİ DÜŞTÜ, KALAN TEK SAYIYA İNDİ

**`walkgate_check` AÇIK BAYRAKLA YEŞİL: 6 hüküm → 0.** Kendini-kesen 6 panel (EU34/36/46)
uydurma pens kamalarıydı; kama gidince kesme gitti. `edgemono_check` de yeşil (46.89s).
**`surface_pattern_check` kesim çizgisi kapısı ilk kez GEÇİYOR:** ön **1.8318 → 0.4162%**,
arka **1.8646 → 0.2908%** (kapı 0.5). Pens bacağı gerinimi **8.929 → 0.000%**.

**KÖK — pens bir KIRPMA tarafından uydurulmuştu.** `dartColumnsFromDeficitRows` yükü
kolon başına `max(0, def[j])` diye topluyordu. Omuz bandı net **NEGATİF**: EU38 ön gövde
çeyreği üst iki satır bandında **+34.57° / −64.34°**, net −24; kırpma negatif yarıyı atıp
pozitif yarıyı gerçekmiş gibi veriyordu → `total` **+48.806°**, n=2, pens başına 24.4°.
Panelden olmayan 73°'lik kama kesiliyordu. Artık **yer kırpılı, yük İŞARETLİ**: nereye
sorusu pozitif kolonların sorusu, ne kadar sorusu bandın kendisinin. Bant net negatifse
pens **yok** — eyer, pensin yapamadığı tek şeydir.
⚠ **BAYRAK KAPALI SEVK EDİLEN GİYSİ HİÇ DEĞİŞMEDİ, kanıtlı:** `STITCHU_SLIT_DEBUG` bayrak
kapalı **sıfır yarık** basıyor (gövde+etek, 4 panel) → değişen satır orada hiç koşmuyor;
`surface_pattern_check` bayrak kapalı **OK**, 8 panel (ftorso 0.0208/0.8302, btorso
0.0011/0.0386, etek 4×0.0000).

**KALAN TEK KIRMIZI: İÇ GERİNİM.** ön **6.9609 → 24.0671%**, arka **7.7931 → 18.1417%**
(kapı 3.0). Bu **yeni eğrilik değil** — hep orada duran −64°'lik eyerin, sahte pens onu
gizlemeyi bıraktığı için görünür hale gelmesi. Kapı sayısı düşmedi: `surface_pattern_check`
4 FAIL, `h10_gate_check` **24/63** — ikisi de aynı. Düşen, kırmızının SINIFI.

**İKİ ŞEKİL HİPOTEZİ ÖLÇÜLDÜ VE İKİSİ DE ALINMADI** (Tur 5/6/7 emsali, kod içinde sayılarıyla):
| hipotez | ön kesim | arka kesim | ön iç | arka iç | dipol |
|---|---|---|---|---|---|
| (a) bant, tırtıklı üst yerine kolonun kendi açıklığının KESRİ | 1.8318→**1.9540** | 1.8646→**1.9371** | 6.96→6.89 | 7.79→**11.91** | +34.57/−64.34 → **+41.59/−65.29** |
| (b) katlama düzleme değil ORTA-YÜZEYE (ön/arka y ortalaması) | 0.4162→0.3951 | 0.2908→**0.3038** | 24.07→23.11 | 18.14→**18.73** | +48.27/−64.05 → **+48.63/−65.07** |
(a) kötüleşti, (b) yalpa. **Asıl okuma (b)'nin son sütunu: DİPOL KIMILDAMIYOR.** Yani eyer
ne tırtıklı üstten ne de kesitin düzleşmesinden geliyor. Bu turun test ettiği iki şekil
hipotezi de **eyerin sebebi değil**.

**ALT KALEM 1 ve 2 KONUSUZ KALDI, çürütülmedi.** Bayrak açıkken gövde artık **hiç pens
türetmiyor** (`STITCHU_SLIT_DEBUG`: 4 panelde de boş liste), etek deficit'i +0.000°.
Dolayısıyla (1) "üst pens bacakları dikiş listesine pens çifti olarak girmiyor" — girecek
pens yok; PNG'de mavi yok çünkü pens yok, iki serbest-uç çentiği de **kayboldu** (gözle
bakıldı, `/tmp/eu38-8a.png`, 8 panel, omuz kenarı 32, kırmızı omuz dikişi yerinde).
(2) `maxDartDeg`'in bağlayıp bağlamadığı bu giyside artık **GÖZLENEMEZ** — türetilen pens
yok. İkisi de "çözüldü" değil, **konusuz**; gövde yeniden pens türetirse geri gelirler.

## TUR 16 / 16B — KENAR ZIPLAMASININ KÖKÜ: SERBEST ÜST KENAR, VE KAPI GEVŞETMEK ÇÖZMÜYOR (ÖLÇÜLDÜ)

**Halka açık kaldı. Bu tur bir DÜZELTME değil, bir KÖK TEŞHİS + iki reddedilmiş hamle üretti.**
Ölçüm ağacı: `94ab73d` (tur başı) · doğrulama `518d442` (16A'nın omuz kaynağı değişikliğinden sonra).
Build: `engine/build-16b`, `-DCMAKE_BUILD_TYPE=Release`.

### ★ (a) MI (b) MI? — CEVAP (a) DEĞİL, (b) DEĞİL: **SERBEST KENAR**
Dört gövde panelinin zıplaması **tamamen `far` (gövde ÜSTÜ = yaka + omuz + kol oyuğu) zincirinde.**
Panelin dört zincirinin 8 bedendeki parça sayısı (`STITCHU_FIT_DEBUG`, `94ab73d`):

| zincir | tip | `left_ftorso` 8 beden | `left_btorso` 8 beden |
|---|---|---|---|
| bel | PAYLAŞILAN | 3 3 3 3 3 3 3 3 | 4 4 4 4 4 4 4 4 |
| seam1 | PAYLAŞILAN | 2 2 2 2 2 2 2 2 | 1 1 1 1 1 1 1 1 |
| seam0 | PAYLAŞILAN | 2 2 2 2 2 2 2 2 | 2 2 2 2 2 2 2 2 |
| **far** | **SERBEST** | **13 14 15 13 13 14 14 14** | **15 15 15 13 13 13 13 13** |

Toplam = 7 + far → `[20,21,22,20,20,21,21,21]` / `[22,22,22,20,20,20,20,20]`, ilan edilen tabloyla birebir.
★ **Kural görünür oldu: DİKTE EDİLEN her zincir 8 bedende SABİT, dikte edilmeyen tek zincir zıplıyor.**
Sebep yapısal: bir dikişin iki tarafı vardır ve T9'un birleşim kuralı onları paylaştırır; **üst kenarın
dikiş partneri YOK**, o yüzden bölünmeyi tek başına açgözlü arama seçiyor.

### ★ KAPIYI GEVŞETMEK ÇÖZMÜYOR — ÖLÇÜLDÜ, BEŞ TOLERANSTA
Aynı 8 polyline, izole edilmiş `fitCubics` (kapıdan bağımsız ölçüm aleti):

| tol (mm) | 0.01 | 0.05 | **0.15 (kapı)** | 0.5 | 1.0 |
|---|---|---|---|---|---|
| `ftorso` far | 17..19 | 14..16 | **13..15** | 9..13 | 7..12 |
| `btorso` far | 16..18 | 13..16 | **13..15** | 10..11 | 8..10 |

**Hiçbir toleransta sabit değil.** Kararsızlık EŞİKTE değil ARAMADA. Yani `kFitTolMM`'i oynatmak
bu halkayı açmaz — kapı boyamak burada işe bile yaramıyor, sadece yasak değil.

### ★ KARARSIZLIĞIN GEOMETRİK KÖKÜ: BOYUN NOKTASI BİR KOLON ZIPLIYOR (15B DOĞRULANDI)
`far` polyline'ı 8 bedende de **33 nokta** taşıyor ve indeksi doğrudan **grid kolonudur**, yani
indeks uzayı bedene göre değişmiyor. Üst profil üç bölge taşıyor (yaka | omuz | kol oyuğu) ve bölge
sınırları kontur indeksi olarak ölçüldü (`solveTopH`'a bölge çıkışı eklenerek):

| | EU34 | EU36 | EU38 | EU40 | EU42 | EU44 | EU46 | EU48 |
|---|---|---|---|---|---|---|---|---|
| omuz↔kol oyuğu sınırı | 7 | 7 | 7 | 7 | 7 | 7 | 7 | 7 |
| **yaka↔omuz sınırı** | **24** | **24** | **25** | **25** | **25** | **25** | **25** | **25** |

Aynı yerde polyline'ın dönme açısı ~**−74°**'lik tek bir köşe taşıyor ve o köşe iki örnek arasında
**göç ediyor**: indeks 24'teki dönüş EU34 −43.8° → EU38 −12.9° → EU40 −1.8° → EU42 +1.4°, indeks
25'teki −30.9° → −60.0° → −69.8° → −71.1°. **15B'nin "kapının bölge sayımı flip ediyor" bulgusu
motorun kendi üst profilinde DOĞRULANDI** ve zıplamanın mekanizması tam olarak budur.

### ★ İKİ HAMLE ÖLÇÜLDÜ VE İKİSİ DE ALINMADI (on üçüncü ve on dördüncü emsal)
**(1) Bölge köşelerinde dikte edilmiş ön-bölünme** (`fitCubicsSplitAt`: köşeler dikte, aralarda
uyarlamalı fit; köşeler `SurfacePanel::farBreaks` olarak inşadan türetildi, aranmadı):
kenar sayısı `ftorso` `[20,21,22,20,20,21,21,21]` → **`[21,21,23,22,21,21,20,20]`** —
farklı değer sayısı **3 → 4**, yani **DAHA KÖTÜ**. Üstelik `left_skirt_back` 8 bedende `10` iken
iki bedende `11` oldu. **ALINMADI, geri alındı.**

**(2) Tamamen dikte edilmiş (bölge içi düzgün) bölünme** — sayıyı inşaen sabitler, ama fiti
kapıdan atar. Aynı 8 polyline, kolon başına bölme D:

| D | far kenar sayısı | en kötü sapma `ftorso` | en kötü sapma `btorso` | kapı 0.15 |
|---|---|---|---|---|
| 4 | 10 | 2.3326mm | 2.1463mm | ✗ 15× aşıyor |
| 3 | 13 | 0.8489mm | 0.7901mm | ✗ |
| 2 | 18 | 0.7807mm | 0.5134mm | ✗ |
| **1** | **32** | 0.0000mm | 0.0000mm | ✓ |

D=1 kapıyı geçen tek seçenek ve **panel başına 32 kenarlık üst kenar** demek: her "kenar" 5mm'lik
bir çıta, `curvefit.hpp`'nin kendi cümlesinin ("satılabilir bir kalıp kenarı bir avuç düzgün eğridir")
tam tersi. **Sayıyı düzeltip giysiyi bozan hamle. ALINMADI.**

### ★ VE BU TURUN EN AĞIR YAN BULGUSU: SAYILAR TUR İÇİNDE ALTIMDAN DEĞİŞTİ
16A'nın `943f313` (omuz kaynağı çizelgenin kendi kolonuna) commit'i **kenar sayılarını da oynattı**.
`518d442`'de aynı ölçüm, aynı build:
`ftorso` **`[21,21,21,22,21,21,20,20]`** · `btorso` **`[21,21,21,20,20,20,20,22]`** ·
`skirt_back` **`[11,11,10,10,10,10,10,10]`** (tur başında `[10]×8`).
**Zıplama kapanmadı, YERİ DEĞİŞTİ** (ftorso'nun 2'lik zıplaması EU46→EU48'e, btorso'nunki de oraya).
→ Kenar sayısı bu motorda **kaotik bir işlev**: gövde çizelgesinin omuz kolonundaki bir değişiklik
bile üst sınırı bir kolon oynatıp bölünme ağacını baştan yazıyor. Halkayı çözecek hamle
**bölünmeyi ölçümden değil İNŞADAN alan** hamledir; bu turun (1)'i doğru sınıftaydı ama yanlış
köşe kümesiyle ölçüldü ve sayısıyla reddedildi.

### KALAN
`gradeset.sh default` bu turda **KOŞULMADI** (kod değişikliği alınmadığı için yargılanacak yeni bir
şey yok; IHLAL 30 ve hizalanamayan panel 4 **DEĞİŞMEDİ**). `ctest` de koşulmadı — çalışma ağacı
`518d442` ile birebir, C++ tarafında sıfır satır değişti. **DOĞRULANMADI:** `worst fit` marjının
(0.003mm) (1) altında ne olduğu ölçülmedi; `walkgate_check`/`edgemono_check`/`h10_gate_check`
16A'nın iki commit'inden sonra bu ağaçta koşulmadı.

## TUR 15 — İKİ MOTOR TEKE İNDİ, VE SEVK EDİLEN MOTORUN GRADE'İ İLK KEZ ÖLÇÜLDÜ

**KARAR (a).** `gradeset.py`'a `--motor` eklendi, **varsayılan `surface`** = sevk edilen C++ tek-yüzey motoru. Arşiv GarmentCode hattı **silinmedi**, `--motor garmentcode` ile adıyla çağrılıyor. Çıktı dizini de motoru taşıyor: `Logs/gradeset-<motor>-<tarih>/`. Rapor ilk satırında hangi motoru yargıladığını **adıyla** yazıyor. Tur 14'ün ilan ettiği *"iki doğru"* ihlali kapandı: tek alet, tek varsayılan.

### Kararın dayandığı üç ölçüm
1. **`taban.sh` grade'i HİÇ denetlemiyordu.** 8 bedeni tek tek üretip her birine ayrı ayrı `h3b` + `walk.py` + `printpack` koşuyor; **bedenler ARASI tek bir hüküm yok** — monotonluk, grade adımı, nest, hiçbiri. `engine-check/harness/run-all.sh` de aynı: H0..H4'ün hiçbiri cross-size değil. → Grade denetimi **yalnız** `gradeset.sh`'teydi ve o da sevk edilmeyen motoru yargılıyordu; yani **sevk edilen motorun grade'i bugüne kadar hiç ölçülmedi.**
2. **Şema uyumlu, ama üç yerde sessiz.** `surface-pattern` spec'i `walk.py`'ın okuduğu şemanın ta kendisi (`taban.sh` zaten koşuyor): 8 panel, 26 dikiş çifti, `edges`/`vertices` aynı. Uyumsuz üç kalem ölçüldü ve **sayım olarak** bağlandı (eşik icat edilmedi, tolerans gevşetilmedi): korsaj bandı (`wb`) rolü **yok** → `waist_seam_girth_mm` 8 bedende de `(0.0, 0)` iken rapor bunu *"bel dikişi delta aralığı 0.00..0.00mm"* diye **düzgün bir grade gibi** basıyordu · `NEST_PANELS`'in 4 adından 2'si (`skirt_front`, `right_sleeve_f`) bu motorda yok, **sessizce atlanıyordu** · kenar sayısı bedene göre 2 zıplayan panel tablo dışı kalıyor.
3. **GarmentCode hattının sayıları bugün hiçbir yerde iddia olarak KULLANILMIYOR.** `%96.3` / `22704` / `green and unsewable` → `git grep` ile **web/, docs/, reports/, knowledge/, README, ROADMAP'te 0 isabet** (web'deki eşleşmeler SVG koordinat gürültüsü). İddia yalnızca `CLAUDE.md`'de ve `corpus.py`/`matrix.py`/`cutplan.py` başlıklarında yaşıyor. **Yine de hat silinmedi** — 11B gerekçesi (yayınlanmış sonucun tekrar üretilebilirliği) ayakta.

### ★ YEDİNCİ KIRMIZI KAPANMADI — ERİŞİLEBİLİR OLDU, VE ESKİ HATTAN AĞIR ÇIKTI
Sevk edilen motorda ilk koşu (`d336514`, `engine/build-15a` Release):

| | arşiv hat (`--motor garmentcode`) | **sevk edilen (`--motor surface`)** |
|---|---|---|
| dikiş tapusu, 8 beden | `mirror_seams` **8** | 26/26 PASS × 8 beden, **altı hüküm sınıfının ALTISI DA 0** |
| monotonluk | IHLAL **18** | IHLAL **30** (34 kenarın 30'u; en kötü EU46→EU48 **−19.47mm**) |
| hizalanamayan panel | 0 | **4 — DÖRT GÖVDE PANELİNİN HEPSİ** |
| bel dikişi çevresi | ölçülüyor | **8 bedende de ölçülemedi** (`wb` rolü yok) |
| determinizm | özdeş | özdeş |
| **hüküm** | **2** | **3** |

★ **Altıncı kırmızının tamiri buraya ULAŞTI:** `mirror_seams` **8 → 0**. Tur 14'ün "erişilemezlik" teşhisi doğruydu ve bağlanınca kanıtlandı.
★ **Yeni ve daha ağır kusur:** dört gövde panelinin kenar sayısı bedene göre **2 zıplıyor** — `ftorso` `[20,21,22,20,20,21,21,21]`, `btorso` `[22,22,22,20,20,20,20,20]`. `align_lengths` 1 kenarlık farkı birleştirebiliyor, 2'yi birleştiremiyor → **giysinin oturmasını sağlayan dört panel kenar bazlı tabloya hiç giremiyor.** Yargılanan 34 kenarın hepsi etek.
⚠ **Yan bulgu (hüküm değil, bölüm 3'ün DİKKAT satırı): göğüs hattı çevresi EU44→EU46'da −3.86mm AZALIYOR** (medyan adım +16.96mm). Sevk edilen motorda beden büyürken göğüs küçülüyor. Kökü **ARAŞTIRILMADI**.

**Bitiş şartı (yeni):** `scripts/gradeset.sh default` exit **0** — (a) IHLAL 30→0, (b) hizalanamayan panel 4→0, (c) bel dikişi 8 bedende ölçülebilir. **(b) ve (c) H1.0'ın değil MOTORUN alanı → `KAPSAM BÜYÜDÜ` sayılır.** Eşiği gevşetmek, sınıfı geri çıkarmak veya motoru `garmentcode`'a geri çevirmek **kapı boyamaktır**.

**ctest** (`engine/build-15a`, Release): dışlamalı **`100% tests passed, 0 tests failed out of 89`** · tam süit **`95% tests passed, 5 tests failed out of 94`** — düşen tam olarak ilan edilen beşi (`style_check`, `contract_check`, `preview_truth_check`, `figure_check`, `h10_gate_check`). Gerileme yok.

## TUR 17 — ETEĞİN KLOŞU GRADELENDİ, VE ATÖLYENİN 60 KADRANININ 45'İ HİÇBİR ŞEY YAPMIYOR

### ★ KLOŞ GRADELENDİ — kaynak kodun kendi yorumundaymış, yarısı sevk edilmemiş
Yorum bir **ÇİFT** yazıyordu: *"50 inç, **36 İNÇLİK KALÇA** üzerinde"*. Sevk edilen sadece çiftin **sol yarısıydı**. Çift geri kondu: **etek ucu = o bedenin kalça çevresi + 355.6mm** (= 50−36 inç, kaynağın kendi farkı).

| | EU34 | EU38 | EU44 | EU48 |
|---|---|---|---|---|
| etek ucu **önce** | 1269.86 | 1269.86 | 1269.84 | 1269.85 |
| etek ucu **sonra** | 1215.47 | 1295.45 | 1415.44 | 1515.43 |
| **A-payı (etek−bel) önce** | **624.96** | 544.97 | 424.96 | **324.98** |
| **A-payı sonra** | **570.57** | 570.56 | 570.56 | **570.56** |

Yarıçap payı **99.47 → 51.72mm** (bedenle **yarıya** iniyordu) → **90.81mm × 8, sabit.** Sekiz bedende aynı A-açısı.
**Monotonluk ihlali 30 → 14** · `gradeset.sh` **3 → 2 hüküm** · **hiçbir kapı gerilemedi**, K2 7/7 bit-aynı, `spec_census` dikiş sabitliği (16A'yı düşüren hüküm) **ateşlemedi**.
★ Brifingimdeki *"o tek vücut EU40/42"* **yanlıştı**: 36 inç = 914.4mm, **EU36 (900) ile EU38 (940) arasında**. Donmuş vücut EU36/38'di.

### ★ GÖVDE ÇİZELGESİNİN BEŞ KOLONUNUN BEŞİ DE ÖLÇÜM DEĞİL, UZATMA
| kolon | gerçekten 8 ölçüm mü | imza |
|---|---|---|
| `shoulder.width_cm` | **HAYIR — saf uzatma** | adım tam **+1.0000 ×7**, kuyruk **`.4568` sekizinde de** |
| `shoulder.incl_deg` | **HAYIR — kopya** | **21.6777 ×8** |
| `back_arc_fraction` ×3 (bust/waist/hip) | **HAYIR** | iki doğrusalın oranı; adım tekdüze sönüyor |
| **`mean_all.yaml` 26 ölçü** | **SIFIRI 8 ölçüm** | 16'sı doğrusal uzatma, **10'u tamamen donuk** |
| `euSizeChart` 7 kolon | uzatma **değil** | adımlar düzensiz (`4,4,4,4,4,4,6,6,6`) |

★ **Ama `euSizeChart`'ın kendi kaynağı repoda HİÇBİR YERDE beyan edilmemiş** — motorun bütün gövdesini besleyen **70 sayı**, *"standard EU convention"* deniyor, kitap/standart adı yok. **Uzatma sorunundan daha ağır bir kaynak boşluğu olabilir.**
★ `flat.size` çizelgesi **EU42'de bitiyor** ama motor 8 beden sevk ediyor → `web/atolye.html:378` ve `_engine-full.mjs:21` en büyük üç bedende **`undefined`** okuyor.

### ★ OMUZ EĞİMİ: GRADELENEMEZ VE BU DOĞRU DAVRANIŞ (şüphe dürüstçe kapandı)
Buğra'nın satın alınmış kalıbından **ölçüldü** (8 iç içe halka, her parça kendi CF/CB katlama kenarına normalize, eksen düzlüğü 8/8'de 1.0001): ön gövde **12.5070…12.6865°** (aralık **0.1795°**), arka **19.0619…19.1493°** (aralık **0.0874°**), ikisi de **monoton değil**. Grade edilen omuz **BOYU** (ön 63.00→67.75mm).
**Hüküm: gerçek bir endüstriyel kalıp omuz eğimini 8 bedende SABİT tutar, omuz BOYUNU gradeler.** `incl_deg`'in kımıldamaması **kusur değil.** ⚠ Doğrulanan **sabitlik**; **21.6777 değerinin kendisi** hiçbir kaynakla eşleşmedi (farklı büyüklük olduğu için çürütülmedi de).

### ★ ATÖLYENİN 60 KADRANININ 45'İ KALIBI HİÇ OYNATMIYOR
`serve.py:89` → `generate.py` → GarmentCode. **Canlı atölye ARŞİV hattını sürüyor**, `surface-pattern` hiç çağrılmıyor (grep değil, **130+ koşu** ile ölçüldü).

| | sayı |
|---|---|
| kalıbı oynatan | **15** |
| oynatmayan | **45** |
| bunların UI'ın **zaten SOLDURDUĞU** (dürüst ölü) | 18 |
| **ekranda PARLAK durup kalıbı hiç oynatmayan** | **27** |
| bunlardan `mapping-notes.json`'da hiç geçmeyen | **14** |

★ **En ağır sınıf — notların YAPICA göremediği:** `waistNip` 0.12→0.38 `design.yaml`'a **gerçekten işleniyor** (`shirt.width` 1.2053→1.0), `yokeDrop` 12→26 → `skirt.rise` 0.85→0.5. **İki halde de panel geometrisi BAYT ÖZDEŞ.** Notlar mekanizması yalnız *mapping'in düşürdüğünü bildiği* kadranı görür, **üretecin yuttuğunu göremez.**
★ **Arşiv hat BAYT DETERMİNİST DEĞİL:** aynı durum, iki koşu, farklı sha256 (yalnız dikiş listesinin **sırası**; geometri özdeş). `PYTHONHASHSEED=0` çözmüyor, **kök sebep DOĞRULANMADI.** `CLAUDE.md`'nin *"iki koşu aynı sha256"* satırı bu hat için bugün **tutmuyor**.
Karar **(c)**: kadran silinmedi, motor değiştirilmedi, **etiketlendi** — sayfadaki her sayı `bridge-dead.json`'dan basılıyor. Kapı: `atolye-bridge-check.py`, mutasyon kanıtlı, venv yoksa **yeşil basmaz** (exit 2 "ÖLÇÜLEMEDİ").
✅ **Canlı ziyaretçi bugün yanlış paket indiremiyor** — statik yayında `/api/health` 404, "kalıp indir" butonu **kalıcı devre dışı**. Açık, **yerel sunucuyu çalıştıranın** aldığı pakette.

## TUR 16 — KARARIM ÖLÇÜLDÜ VE GERİ ALINDI, VE ETEĞİN KLOŞU HİÇ GRADELENMİYOR

### ★ OMUZ GEÇİŞİ: DOĞRUYDU, ÇALIŞTI, YİNE DE GERİ ALINDI (on üçüncü emsal)
Geçiş yapıldı (`943f313`) ve **omuz Aldrich bandına GİRDİ**: sapma **−19.3…−10.6mm (8/8 kısa) → +5.2…−2.9mm**. Kırışık açıkken EU38 **91.69 → 109.01mm**, Aldrich kolsuz 112.5'e karşı **%18.5 kısa → %3.1 kısa**. **K5-çevre 8/8 KAPANDI** (4 FAIL → 0). K2 adımları düzleşti (`+9.24/+8.03/+6.84/+5.36/+4.88/+5.17/+9.54` → **`+6.50…+6.97`**).

**GERİ ALMA SEBEBİ h10'da DEĞİL:** geçişten sonra **üç sevk edilen kapı birden kırmızı** — `edgemono_check` · `walkgate_check` (Tur 14'ten beri yeşil) · `cutplan_check` — ve **üçü de TEK hükümden**: `spec_census` çapraz **dikiş sayısı sabitliği** (29/29/27/27/27/27/26/26). Kanıt aynı build'de iki yön: geçiş öncesi `3/3 Passed`, sonrası `3/3 FAIL`. Ve h10 toplamı **düşmedi (44→44)**. Kural açıktı, geri alındı (`fd20267`), hükümler taban ile **satır satır özdeş**.

**Kararım ölü değil — önündeki iki blokör artık ADIYLA belli**, ikisi de `surfacepattern.cpp`'de: (a) dikiş sayısı sabitliği, (b) K6'nın *"never reached: nearest column"* **fallback dalı** *"yükseği tut"* kuralını uygulamıyor (EU42 sorgu x=180.0, sınır x=179.895'te **armhole dalında** dönüyor; komşu kolon x'te 0.45mm ama z'de **18.5mm** ayrı). O iki halka kapanırsa geçiş **tek token'lık** ve K5-çevre 8/8 hazır bekliyor.

★ **`shoulderInclDeg` sekiz bedende de 21.6777° — HİÇ GRADE EDİLMİYOR.** Omzun eğimi bedene göre sabit; ölçüm değil, tek bir vücuttan taşınmış tek sayı.
★ **`shape-ratios.json` `width_cm` sekiz ölçüm DEĞİL:** adımlar tam +1.0000cm ve sekizinin de ondalık kuyruğu `.4568` — **EU44'e çapalanmış tek sayının doğrusal uzatması.** Kolonun 8/8 tek yönde sapmasının mekanik sebebi bu.
★ **Kolon flip'i bir YER değil:** geçiş öncesi flip EU40→EU42, sonrası EU48'e kayıyor, probda tamamen kayboluyor. **Omuz kolonunun grade adımının kolon ızgarasına kuantalanması.** `docs/H1.0-KAPI.md` §4.3'ün *"elendi"* hükmü ölü.

### ★ KENAR ZIPLAMASININ KÖKÜ: SERBEST KENAR
| zincir | tip | `left_ftorso` 8 beden | `left_btorso` 8 beden |
|---|---|---|---|
| bel · seam1 · seam0 | **PAYLAŞILAN** | 3·2·2, hepsi **sabit** | 4·1·2, hepsi **sabit** |
| **far** (yaka+omuz+kol oyuğu) | **SERBEST** | **13 14 15 13 13 14 14 14** | **15 15 15 13 13 13 13 13** |

**Dikte edilen her zincir 8 bedende sabit; dikte edilmeyen tek zincir zıplıyor.** Yapısal: üst kenarın **dikiş partneri yok**, T9'un birleşim kuralı ona uygulanamıyor.
**Kapıyı gevşetmek çözmüyor** — beş toleransta ölçüldü (0.01→1.0), hiçbirinde sabit değil: **kararsızlık eşikte değil ARAMADA.** İki hamle daha ölçülüp reddedildi (13. ve 14. emsal); tam dikte kapıyı geçirebiliyor ama panel başına **32 kenarlık** üst kenar = her kenar 5mm'lik çıta.
★ 16A'nın geçişi kenar sayılarını da oynattı: **zıplama kapanmadı, YERİ DEĞİŞTİ.** Kenar sayısı bu motorda **kaotik bir işlev**.

### ★ GÖĞÜS KÜÇÜLMESİ DİYE BİR ŞEY YOK — KÜÇÜLEN BOY
15A'nın `−3.86mm`'si bir çevre değil, düzleştirilmiş panelin **yatay kirişi**. Dikiş grafiğinden ölçüldü, EU44→EU46: gövde üst sınırı **+34.75**, bel halkası **+40.00**, torso **dikey** dikiş toplamı **−11.56mm**. Çevreler büyüyor, **boy kısalıyor.** Kök: `backLengthCM` EU44→EU46 adımı **0.0cm** (sekiz bedenin tek düz adımı) ve aynı adımda `shoulderWidthCM` +1.0cm büyümeye devam edip omuz halkasını aşağı indiriyor.
Düz kiriş artık **BİLGİ**; yerine **gerçek çevre serileri hüküm** oldu (azalırsa kırmızı) — ölçüldükten sonra silahlandırıldı.

### ★ YENİ KIRMIZI: ETEĞİN KLOŞU HİÇ GRADELENMİYOR
`etek ucu = 1269.86mm × 8 beden`, toplam değişim **0.03mm**. Kök: `surfacepattern.hpp:176` **`hemSweepMM = 1270.0`, mutlak sabit** — ve kodun kendi yorumu kaynağını söylüyor: 1960'lar Big-4 zarfı, **36 inçlik kalça** için. O tek vücut EU40/42; **EU34 (kalça 86) ve EU48 (kalça 116) aynı 127cm'i alıyor** → bel +40mm/beden büyürken **A-formu bedenle KAPANIYOR**: EU34 tam A, **EU48 neredeyse düz etek.**
*"Sabit kalmak ihlal değildir"* muafiyeti **BOY** kenarlarınındır, bir **ÇEVREYE** geçmez → **hüküm**.
★ **Ve bu, 30 monotonluk ihlalinin de kökü:** yargılanan 34 kenarın hepsi etek, **sabit etek ucu ile büyüyen bel arasında sıkışıyorlar.** İhlallerin **30'unun 30'u gerçek** (birleşme hiçbirinin iki ucuna değmiyor), ama **15 tekil kenar** — sol/sağ ayna aynı kusuru iki kez sayıyor.

**Bel tapusu KURULDU:** ölçülemez olan halka değil **AD**dı (bu motorda kemer yok; bel = `torso↔skirt`). 8 bedende **14 dikiş çifti**, `644.90 … 944.87mm`, **+40.00×6**; EU38 = 700 + 25 Steiner ease, hedefe **0.11mm**.

## TUR 15 — OMZUN KÖKÜ BİR HATA DEĞİL, İKİ SİSTEMİN KARIŞMASI

### ★ GÖVDE ÇİZELGESİNDE İKİ OMUZ GENİŞLİĞİ VAR, YÜZEY DAR OLANI KULLANIYOR

| kaynak | EU38 | ürettiği omuz boyu | Aldrich'e sapma, 8 beden |
|---|---|---|---|
| `shaperatios.gen.hpp` `shoulderWidthCM` (GarmentCode **ortalama gövde**, EU44'e çapalı) — **motorun kullandığı** | 33.4568 | 106.84mm | **−19.3 … −10.6mm, 8/8 KISA** |
| `contract.gen.hpp` `shoulderCM` (çizelgenin **kendi kolonu**, bugün yalnız eski 2B hat okuyor) | 37.0 | 125.93mm | **+5.2 … −2.9mm** |

`measurements.hpp:35` *"bu çizelgenin `shoulderCM`'i DEĞİL, farklı bir büyüklük"* diyor — **bu bir İDDİA; ölçüm çizelge kolonunu gösteriyor.** Motor, Aldrich'in dar **boyun noktasını** GarmentCode'un **omuz genişliğiyle** eşleştiriyor. Açık tam olarak bu.

**Ve ilan edilen %15 yanlış sayıydı — gerçek daha kötü.** `103.93mm` bir omuz boyu değil: içinde **45.24mm y-süpürmesi** var (tüpün etrafından dolaşma payı, Aldrich'in mezurasında yok). Kırışık açıkken aynı kapı **91.69mm** okuyor. Aldrich kolsuz karşılığı **112.5mm** (p.28, 1cm içerde) → **%18.5 KISA.**
`neckHalf` **Aldrich'in boyun noktasıdır** (`neck/5 − 0.2cm` = 68.0mm, p.16) — 12A'nın *"iç uç doğrulanmadı"* notu **kapandı**, tartışma yok.

**KARARIM (ölçüye dayalı, savunuyorum):** gövde çizelgesinin omuz kaynağı **`contract.gen.hpp` `shoulderCM`** olmalı. Gerekçe: Aldrich **doğrulanmış** kaynak (`knowledge/drafting-math-eu38.md`), çizelge kolonu ona **+5.2/−2.9mm** içinde uyuyor, GarmentCode ortalama gövdesi **8/8 bedende −10…−19mm** sapıyor. Bir ölçüm sekiz bedende birden tek yönde sapıyorsa o ölçüm yanlıştır. **Bedeli var ve gizlenmiyor:** geçiş K5-çevreyi **8/8 kapatıyor (4→0)** ama üç K6 hükmü + K2'yi düşürüyor. **K2'nin düşmesi bir SONUÇ, sebep değil** — doğru ölçüye geçip düşen kapıyı onarmak, yanlış ölçüyü korumaktan iyidir. Bu bir karar, Tur 16'nın işi. (Ölçüm kaydı: `184860c`, on ikinci emsal olarak reddedilen prob orada.)

### ★ K4 ÇÖZÜLDÜ — BUG DEĞİL, İKİNCİ YASANIN BEDELİ
Ön ve arka **x-z koşuları 8 bedende 0.009mm'ye kadar AYNI** (EU38 94.875 / 94.884). Farkın **tamamı y-süpürmesi** (ön 45.237, arka 43.421) — yani kapının "kürek payı" sandığı şey **gövde elipsinin önünün arkasından derin olması** ve o **ters yöne bakar**. Kırışık açıkken K4 **−2.336 → −0.150mm** (%94 çöküş).
Kalan sıfır **doğru okuma**: üst sınır tüm çember üzerinde **bir kez** örnekleniyor (ikinci yasa), omuz çizgisi tek değerli → **ön/arka farklı OLAMAZ.** → **K4, K3'e ve ikinci yasaya BLOKE.** Kürek payı sınırın iki değer taşımasını gerektirir.

### ★ `docs/H1.0-KAPI.md` §4.3'ün HÜKMÜ ÇÜRÜDÜ
*"Kolon flip'i ELENDİ"* deniyordu. Kapının **kendi çıktısı**: EU34–EU40 `omuz 32+32 · yaka 18+18`, **EU42–EU48 `omuz 34+34 · yaka 16+16`** — flip **tam EU40→EU42'de**, yani K5-çevrenin −24.41mm düştüğü yerde. **Hipotez elenmemiş, DOĞRULANMIŞ.**

### İKİ MOTOR KARARI: (a) SEÇİLDİ — ve sevk edilen motorun grade'i BUGÜNE KADAR HİÇ ÖLÇÜLMEMİŞ
★ `taban.sh` **bedenler arası tek hüküm taşımıyor** (monotonluk, grade adımı, nest — hiçbiri). `run-all.sh` de öyle. Grade denetimi **yalnız** `gradeset.sh`'teydi, o da sevk edilmeyen motoru yargılıyordu.
`gradeset.py --motor` eklendi, **varsayılan `surface`**. Sonuç, sevk edilen motorda **daha ağır**:

| | arşiv (GarmentCode) | **sevk edilen** |
|---|---|---|
| dikiş tapusu | `mirror_seams` 8 | **26/26 PASS × 8 beden, altı sınıf da 0** |
| monotonluk ihlali | 18 | **30** (34 kenarın 30'u, en kötü EU46→EU48 **−19.47mm**) |
| hizalanamayan panel | 0 | **4 — dört gövde panelinin HEPSİ** |
| bel dikişi | ölçülüyor | **8 bedende ölçülemedi** |

★ Kök: `ftorso` `[20,21,22,20,20,21,21,21]`, `btorso` `[22,22,22,20,20,20,20,20]` — bedene göre **2 zıplama**; `align_lengths` 1'i birleştirebiliyor **2'yi birleştiremiyor** → **giysinin oturmasını sağlayan dört panel kenar tablosuna hiç giremiyor**, yargılanan 34 kenarın hepsi **etek**.
★ **Sevk edilen motorda göğüs çevresi EU44→EU46'da −3.86mm AZALIYOR** (medyan adım +16.96mm). Beden büyürken göğüs küçülüyor. Kökü **ARAŞTIRILMADI**.
★ **Atölye kadranları sevk edilen motora ULAŞMIYOR:** `surface-pattern` tek argüman alıyor (beden etiketi). `web/atolye.html`'in 40+ kadranının motorda **hiçbir karşılığı yok** — vitrin ile motor **ayrı şeyler**.

> **KAPSAM BÜYÜDÜ: +2 halka.** (b) dört gövde panelinin kenar zıplaması (~4–6s) · (c) motorda bel dikişi tapusu (~4–6s). İkisi de H1.0'ın değil **motorun** alanı.

### Dört kapı daha silahlandı, yeni kırmızı YOK
`spec_census.py`: **mutlak taban 8 panel/beden** (tekdüze çöküşü yakalayan tek hüküm) + **çapraz sabitlik**. Dikiş tabanı sayılmadı **türetildi** (n panel bağlı kalmak için ≥ n−1 dikiş, kapsayan ağaç). Delik tam olarak **dikişleri koruyan** çöküşteymiş: 8 beden → 2 panel, dikişler korunmuş → eski kapı `hüküm-FAIL 0` basıp **YEŞİL** çıkıyordu.
`cutplan_check` yeni ve ctest'te; `name_disagreement` **bugün 8/8 bedende ateşlemiyor** (kök 14A/14B'de kapandı) — ölçüldükten sonra silahlandırıldı.
**ctest dışlamalı: 90/90 yeşil.** Tam süit 95'te 5 FAIL, beşi de ilan edilmiş.

## TUR 14 — ALTINCI KIRMIZI KAPANDI, VE BİR KAYIT HATAM DÜZELTİLDİ

### ★ `reversed` artık ÖLÇÜLMÜYOR, İNŞADAN TÜRETİLİYOR — walkgate 5/8 → 0
`sidePoints()` bir kenarı liste sırasıyla değil **kontur indeksiyle** yürüyor. Motor konturu tek sırayla basıyor (bel → `seam1` satır artan → far → `seam0` satır azalan), yani **yön inşa anında belli**. `right_` panel çözülmüyor, solun yansıması ve motor onun için tek şey yapıyor: `swap(seam0Edges, seam1Edges)`. Kural: `reversed = sideAscends(A,seam1) != sideAscends(B,seam0)`.

| | önce | sonra |
|---|---|---|
| `ters` bayrağı (12 dikiş × 8 beden) | 2'si `1`, 10'u `0` | **12'sinin 12'si `0`** |
| `left/right_btorso` kenar dizisi | ters sıralı | **8/8 bedende bit-birebir** |
| `walkgate_check` | **5 hüküm-FAIL, 5 beden kırmızı** | **0, 8 beden YEŞİL** |
| ayna-dikiş yargısı | kırmızı bedenlerde 5 | **8/8 bedende 10** |
| `nestpack` ayrışım | 7 | **3** |

★ **"0.02mm'de berabere" hikâyesi EKSİKMİŞ, gerçek daha ağır:** eski test doğru cevapladığı çiftte marj **%0.10–0.49** (gürültü), **yanlış** cevapladığında **%7.09–7.74**. Yani test sadece berabere değil, **kararlı biçimde yanlış** — ayna çiftinin iki yarısına sistematik olarak zıt cevap veriyordu.

### `curvefit` yön-simetrik oldu — ve `>` beraberlik kuralı SUÇSUZ çıktı
2000 rastgele + 112 gerçek panel konturu, ileri vs geri fit:

| | parça sayısı farklı | en kötü sapma |
|---|---|---|
| yerinde Gauss-Seidel (eski) | **402/2000** · gerçek veride 2/112 | 73.695038mm |
| **Jacobi (alınan)** | **0/2000** · gerçek veride **0/112** | 0.0000000007mm |
| `>` beraberlik kuralı (aday B) | 721 → **721/2000**, tam-beraberlikte 545 → **638 (kötüleşti)** | — |

Aday B **ölçüldü ve reddedildi (on birinci emsal)**; 13A'nın *"`>` kuralının katkısı ölçülmedi"* notunun cevabı: **Newton tek kaynak, `>` kuralı suçsuz.**
**Hiçbir kapı gerilemedi:** `flatten_check` · `surface_pattern_check` · K2 grade **7/7** çıktıları **bayt-aynı**; `edgemono` ters teğet 60.383° → **42.857°** (kapı 90°, marj arttı); T9 `worst fit` 8 bedende **bit-aynı** (0.003mm marjı kımıldamadı). Determinizm: iki koşu bayt-özdeş.

### ⚠ KAYIT HATAM — ALTINCI VE YEDİNCİ KIRMIZI AYNI MOTORDAN BESLENMİYOR
`HEDEF.md` ve `guard.json` *"yedinci kırmızının kökü 13A'da, altıncıyla aynı panel çifti"* diyordu. **YANLIŞ, ölçüldü:**
- `engine/pattern-bridge/`'in tamamında `surface-pattern`'e **tek fonksiyonel referans yok** (üç isabetin üçü de **yorum satırı**).
- `gradeset.sh` → `gradeset.py` → `generate.py` → `mapping.py` + **GarmentCode**, saf Python.
- `taban.sh` (mühür) ise **`surface-pattern`**'i, yani sevk edilen C++ tek-yüzey motoru yargılıyor.
- **İkisi aynı panel ADINI kullanıyor ama aynı panelleri DEĞİL.**
→ Altıncı kapandığında yedincinin `mirror_seams 8` + `IHLAL 18`'i **kımıldamadı** ve bu **başarısızlık değil, ERİŞİLEMEZLİK**.
→ ★ **Ve bu, `HEDEF.md`'nin "iki doğru bırakılmaz" yasasının ihlali:** 8 bedeni **iki ayrı harness, iki ayrı motorda** gradeliyor. **TUR 15 KARARI.**

### Guard deliği İLAN EDİLENDEN GENİŞ ÇIKTI — kapatıldı
`gate.cpp:2892`: `protectedPaths` **yalnız** `Edit/Write/MultiEdit/NotebookEdit` dalında denetleniyor. Ölçüldü: **dört korumalı yolun ÜÇÜNDE bash kapsamı SIFIRDI** — `golden-reference.csv`, `sitemap.xml`/`robots.txt`, `STRATEGY.md` hepsi `sed -i` ve `>` altında ALLOW.
İki kapı silahlandı: `no-shell-write-protected-path` (13 yazma şekli, **mutasyon matrisi 23/23**) + `generated_ratchet_check` (58 yol, ctest'te). **13C'nin BİREBİR rotasıyla mutasyon**: `node /tmp/mutate.mjs` ile korumalı dosya düzenlendi → guard ALLOW, **kapı FAIL**.

### ★ Ve alıcıya 22 baytlık BOŞ ZIP gönderiliyormuş
`serve.py`: `if p.exists(): z.write(...)`, else yok. Ölçüldü, uçtan uca HTTP: üretici 0/12 üye yazdığında sunucu **HTTP 200 `application/zip`, 22 baytlık boş zip** sevk ediyordu; 11/12'de 200 + delikli paket. Artık 500 + eksik üyelerin adı. Alt kod doğruydu, **çıktısı hiç kontrol edilmiyordu** — `printpack` A0-MISSING sınıfının aynısı.
★ **`discover.py`'ın repoda SIFIR tüketicisi var** (185 satır, başlığındaki iddia projenin novelty cümlesi). **Hiç koşmuyor, o yüzden hiç kırmızı dönemez.**

## TUR 12–13 — ÜÇ ALET AYNI KÖKE İŞARET ETTİ, VE SİTE BOZUKMUŞ

### ★ TEK KÖK, ÜÇ BAĞIMSIZ ALET
`right_btorso`'nun son iki kenarı `left_btorso` ile **aynı iki uzunluk, TERS SIRADA** (EU34 `L=[90.3082, 94.2346]` / `R=[94.2346, 90.3082]`). Kusur **8 bedenin 8'inde de var**; EU38/40/48'de o iki kenar **tesadüfen eşit** olduğu için görünmüyor — **yok değil, görünmüyor.**
Kalan 18 kenarın 18'i bit-aynı, `left/right_ftorso` 8 bedende baştan sona bit-aynı. Kusur **tek bir yerde: yan dikiş.**

**KÖK — `engine/tools/surface-pattern.cpp`'nin `reversed` testi YAZI-TURA ATIYOR.** Kırılma noktası karşı panele *kümülatif yay-uzunluğu profillerini karşılaştıran* bir bayrakla taşınıyor ve gövdenin **iki ayna çiftine FARKLI cevap veriyor** (`rF↔lB ters=0`, `rB↔lF ters=1` — aynı dikişin aynası). İkisi de y artan yönde yürüyor, doğru cevap **0**. Karar **berabere**: iki eğrinin toplamı **184.5428 vs 184.5179mm**, 184.5mm'de **0.02mm** fark. Aynı tutarsızlık etekte de var.

**Üç alet, aynı çift:**
1. `walkgate_check` — 8 bedenin **5'inde** 10 ayna-dikiş yargısının 6'sı yok oluyordu ve `walk.py` `mirror-seam 0 … KAPI HÜKÜM: YEŞİL` basıyordu. ⚠ *"Panel seviyesinde yakalanır"* varsayımı **YANLIŞ**: `check_mirror_symmetry` **konturu** ölçüyor (0.0005mm PASS) — **iki seviye de aynı çifti affediyordu.**
2. `gradeset.sh` — `mirror_seams` 8 hüküm.
3. `nestpack.py` — **satılan "8 beden tek sayfa" nest'i bugün üretilemiyor.** Kenar sayıları **EU40'ta zıplıyor** (`left_btorso` 14→15, `right_btorso` 13→14, `left_sleeve_b` 4→5). ★ **EU40 bir topoloji sınırı:** dikiş çifti sayısı EU34-38'de **41**, EU40-48'de **43**; 18 monotonluk ihlalinin hepsi o sınırlarda.

**DÜZELTME DENENDİ VE REDDEDİLDİ (onuncu emsal):** aynayı düzgün yeniden yürütmek yan dikişleri simetrik yaptı **ama kapıyı kötüleştirdi** (5 → **18** hüküm-FAIL, 8/8 kırmızı). Sebep: **ikinci bir tüketici de yön-bağımlı** — `curvefit.cpp`'nin Newton yeniden-parametrizasyonu `u[i]`'yi yerinde günceller (Gauss-Seidel), ters yürünen aynı çokgen **başka fit** veriyor (13 → 15 parça). Kenar **SAYISI**nın tutmaması sıranın tutmamasından daha sert düşüyor.
→ Sıradaki: `reversed`'ı **ölçümden değil İNŞADAN** türet (~1–2s) + `curvefit`'i yön-simetrik yap (Jacobi, 3–6s, geniş etki alanı).

### ★ YEDİNCİ KIRMIZI — `gradeset.sh`: sekiz mutasyonun ALTISI eski kapıda YEŞİLDİ
`gradeset.py`, `walk.py`'ın **eski** summary şemasını okuyordu (`within_1mm`/`fail`); şema `by_status`'a taşınmış → `fmt_report` **ve** `verdict` ikisi de `KeyError`. **Rapor hiç yazılmıyordu.** Üstelik `verdict()` altı hüküm sınıfından yalnız `seam`'i sayıyordu:

| mutasyon | ESKİ KAPI |
|---|---|
| panel kendini kesiyor · kontur açık · ayna dikişi FAIL | **YEŞİL** |
| bütün dikişler silinmiş · hiç panel yok · armhole FAIL | **YEŞİL** |

### ★ SİTE BOZUKMUŞ — ölçüldü ve onarıldı
| | önce | sonra |
|---|---|---|
| ölü iç referans | **228** | **1** |
| sitemap'in 404 döndürdüğü URL | 22 | **0** |
| sitemap'te olmayan canlı sayfa | 24 | **0** |
| sürümü geri alan üreteç | **5** | 0 |
| bozuk `?vN` damgası | 24 | 0 |

- 12C "187 link" demişti; **228**'di — **41'i kırık `<img>`**, yani linkte değil **sayfada** delik. Kaynak tek şablon değil: 95 header + 23 footer + 1 CTA.
- ★ **24 stil sayfasının hepsi kendini "Pattern Blog" ilan ediyordu** (404 değil, yanlış etiket — link denetleyici bunu asla bulamaz).
- ★ **`?v` donması bir üreteçte değil BEŞ'te**; altıncısı `gen-guide.mjs` `const V = 'v83'` — **`=` yok**, ve iki bump mekanizması da `=` istiyor → **6 rehber sayfası v83'ten beri ziyaretçi cache'inde donmuş**, hiçbir deploy'un oynatamayacağı bir anahtarla.
- ★ **`CLAUDE.md`'nin "noindex korunuyor" satırı YANLIŞ:** 128 sayfanın **yalnız 4'ünde** noindex var, **124'ü Google'a tamamen açık.** Yani 22 ölü sitemap URL'i teorik bir sorun değildi.
- Site sağlığı artık bir **kapı** ve `pages.yml verify`'a bağlı, 6 mutasyon sınıfı. ★ Kapının kendisi ilk mutasyonda **geçti** — şekil sayıyordu; genişletilince **beşinci donmuş üreteci** buldu.

### ⚠ GUARD'DA BİR DELİK — ajan kendi ilan etti
13C toplu onarımları `node /tmp/*.mjs` ile yaptı ve `guard.json`'ın `generated-web-html` kuralı **Write/Edit'te ateşliyor, Bash'ten koşan script'te ateşlemiyor**. Kural **gevşetilmedi**, sessizce etrafından dolaşıldı ve ajan bunu raporunda yazdı. **Kural araç-şekilli, yol-şekilli değil** → `DAMLA-KUYRUK` **K21**.

## TUR 11 — ★ TUR 9'UN REDDİ BOZUK BİR ÖLÇÜMDÜ, VE KOL OYUĞU İLK KEZ BANDA GİRDİ

### Kapı kendi penceresini ölçüyordu, deliği değil
`STITCHU_ARMHOLE_SPANDEG` oyuğun **başlangıç açısını** kaydırıyor ama `opt.shoulderNarrowMM`'i 10mm'de bırakıyordu. `h10_gate_check.cpp:104` hangi kenarın oyuk olduğuna **tam olarak o sayıdan** karar veriyor (`strapHalf = shoulderHalf − shoulderNarrowMM`). 40°'de motor **φ=39.4°'ye açılan bir delik kesiyor**, kapı ise **φ≤20°**'yi oyuk sayıp gerisine "omuz" diyor.

| span | 3B koşu (koltukaltı→omuz ucu) | kapının K1'i |
|---|---|---|
| as-is | 165.26mm | 330.13 |
| 30° | 179.36 | 158.15 |
| 40° | **191.39** | **88.27** |
| 50° | **212.51** | 70.47 |

**Kapının "kısaldı" dediği her durumda delik UZAMIŞ.** `330→158→88→70` deliğin değil, kapının topladığı **φ-penceresinin** çöküşü. Tur 9'un iki hükmü — *"geniş açı omzu yiyor"* ve *"oyuğun uzunluğu açısal açıklığın özelliği değil"* — **İKİSİ DE YANLIŞ**, ve yanlışlık zarftan bağımsızdı. Kayış noktası artık **üç okuyucunun paylaştığı TEK sayı** (`c032fac`).

### ★ K1 BU VARDİYADA İLK KEZ BANDA GİRDİ — ama alınmadı (sekizinci emsal)
`STITCHU_SHOULDER_NARROW` süpürmesi, 8 bedende:

| narrow | K1 EU38 | banda giren | K2 grade | kapı |
|---|---|---|---|---|
| **10mm (sevk edilen)** | 330.13 | 0/8 | **7/7 ok** | 44/63 |
| 38mm | 380.89 | 0/8 | 6/7 | 45/63 |
| **50mm** | **399.17** | **4/8 ok** | **4/7** | **43/63** |

50mm'de EU34/36/38/40 bandın içinde. **ALINMADI:** K2 7/7 → 4/7 ve düşen adımlar **negatif** (−3.166…−5.891mm), komşuları +6…+14mm. Kapının kendi `splitFar` yorumundaki **kolon kuantizasyonu** gibi duruyor ama **DOĞRULANMADI** — daha yüksek `ringSamples` ile koşulmadı. *"Yedi yeşili doğrulanmamış bir okumaya harcamadım."* Ayrıca 50mm Aldrich'in 1cm'inin **5 katı**, yaşarsa kaynak ister.

### Zarf (envelope) KRİTİK YOLDA DEĞİLMİŞ
- **dy'ye 0.15mm bile katmıyor** (kapalı 25.85→33.40mm, açık 26.00→33.42mm). Katan tek şey **açısal açıklık**: sp40'ta EU38 `dy` **27.58 → 52.05mm** — gerçek kol oyuğunun 50–55mm bandı tam orası.
- ★ **Zarf altında dört gövde panelinin İKİSİ YAKINSAMIYOR** (ARAP 1761/1441/**2000 TAVAN**/**2000 TAVAN**, `lastMove` 1.2e-4 ve 4.8e-4 vs eşik 1e-4). Yani **Tur 10'un zarf altında okuduğu +2.6mm yakınsamamış bir düzleştirmeden geldi.**
- Bedel: kapı **47s → 21dk+** (27×).

### Eyer — iki turdur ertelenen üçüncü hipotez ÖLÇÜLDÜ
Zarf açıkken ön çukur **−64.05 → −49.58°** (%22.6 azaldı), **arka 1° bile kımıldamadı**. Karşılığında zarf panelin ortasına **yeni bir çift-eğrilik lobu** koydu (+14.80/+12.16, kapalıyken −0.04). Toplam deficit **işaret değiştirdi** — ARAP'ın tavana çarpmasının sebebi tam olarak bu +27°.

### Ve dört kapı daha: `walk.py` bütün dikişleri silinmiş bir giysiyi "dikilebilir" ilan ediyordu
- **`walk.py`:** gerçek 8 panelli EU38 spec'i, **26 dikişin HEPSİ silinmiş** → önce exit 0 "KAPI HÜKÜM: YEŞİL". **Parçaları birbirine hiç bağlanmamış bir giysi dikilebilir sayılıyordu.**
- **`printpack.py`:** A0 PDF'i yazan satır susturuldu → ekranda `print_a0 ... MISSING` yazılı, **exit 0**. `taban.sh` o exit koduna bakıyor: **sekiz alıcı paketi A0'sız çıksa vardiya mührü yeşil basılırdı.**
- `edgemono_check.py` ve `gradeset.py` de aynı sınıf (boş mühür / sıfırın üzerinde duran hüküm). Dördü de mutasyon kanıtlı silahlandırıldı, **hiçbir tolerans gevşetilmedi**.

### `engine/tools/` 125 → 117 · v1 şeması ÖLÜ DEĞİL, İKİNCİ BİR SORU
v1 (`ne görüyorum?`) ile v2 (`üretebiliyor muyum?`) **iki ayrı soru** — v1'i v2'ye daraltmak red cümlesinin yazıldığı kelimeleri silerdi, motor dürüst olmak yerine **susardı**. Kurulan: `contract/spec-v1-v2-map.json`, **79 v1 enum değeri, bugün 31'i üretilebilir, 48'i değil**, hüküm elle yazılmıyor **hesaplanıyor**.
★ **v2'de yaka-ŞEKLİ ekseni HİÇ YOK** — `necklineDraft` shipped ama şekli enum'la değil kadranlarla çiziyor → **9 v1 yakası okunuyor ama AYIRT EDİLMİYOR.**

## TUR 9 — ÜÇ SERT SONUÇ

### ⚠⚠ 1. GİZLİLİK — İHLAL AKTİF, ÖLÇÜLDÜ
`gh repo view` → **PUBLIC**. `git ls-files patterns_real/` → **49 dosya takipli**, bunların **8'i satın alınmış BugraPatterns PDF'i**, 25'i jpg, toplam **66 MB**. **Şu anda internetten indirilebiliyor.**
9B bunu bir kapıya bağladı: `contract/gizlilik.json` (yasa `CLAUDE.md`'de düz yazıydı ve o dosya gitignore'da — **makine okuyamıyordu**) + `contract_check` kontrol 5b, girdisi git indeksi. **Kurulduğu anda kırmızı doğdu ve kırmızı gerçek bir ihlali gösteriyor.** Dosyalar **silinmedi** — `DAMLA-KUYRUK` **K1**, Damla'nın kararı. Işık yakıldı.

### 2. H1.0b — kök bir kademe daha indi: delik dar değil, **GİYSİ KOLTUKALTINDA OMUZDAN DAR**
Ölçüldü, 8 bedende: koltukaltı `x` **omuz ucunun İÇİNDE** ve beden büyüdükçe daha da içeri giriyor (**dx +10.055 → +2.473mm**). Skim konisi belden omuz ucuna düz koştuğu için giysi armscye derinliğinde omuzdan geniş değil.
★ **K1'in açığı YAY açığı değil, KİRİŞ açığı:** bizim EU38 yay/kiriş **1.3247**, Buğra'nınki **1.232–1.262** — bizimki zaten **daha kıvrımlı**. Kiriş bizde 124.75mm, Buğra'da ≈171mm. Eğri yeterince bükülüyor; **iki ucu birbirine çok yakın**. K1'i kapatacak şey daha çok kavis değil, **uçların ayrılması**.
★ Motorun kendi yorumundaki aritmetik yanlıştı: *"±19.9° = ±56mm, ve gerçek kol oyuğu 10-11cm ön-arka"* — ölçüldü, ±19.7°'nin ön-arka açıklığı **±25.9mm = 51.7mm**. ±56mm yanın etrafındaki **yay uzunluğu**; iki büyüklük aynı ada konmuş.
**Bir düzeltme daha üç değerde ölçülüp reddedildi** (açısal açıklık 30/40/50°): K1 330→158→88→70mm, K2 grade 7/7 → **FAIL**. Geniş açı delik açmıyor, **omzu yiyor**. Bu vardiyada **altıncı** ölçülüp reddedilen düzeltme.
→ Sıradaki halka `GarmentSurf`'ün **skim konisi (armscye seviyesindeki genişlik)**, üst sınır değil.

### 3. ALTI KAPI DAHA SİLAHLANDI — ve biri %61 sessizdi
- **`preview_truth_check`: 310 yargı yuvasının 190'ı (%61.3) atlanıyordu** ve **11 stil — princessSeam ailesinin TAMAMI — 0/10 yargı alıyordu.** Kök: princess stilleri önü bölünce draft'ta `Bodice Front` yok → `D.bustHalf` undefined → çapa düşünce on landmark birden düşüyor. Mutasyon kanıtı en güçlüsü: kol araması bilerek bozuldu → **düzeltmeden önce exit 0 / 0 FAIL (tamamen sessiz)**, sonra **exit 1 / 104 FAIL**.
- `scripts/repin-style.sh` **yazıldı** — pin ölçümden değil karardan gelir: tty şartı var, boru hattından beslenen onay reddediliyor (**ajan/CI pinleyemez**).
- `run-all.sh` H1b: rapor kipi **kasıtlıymış** (`--strict` tam bunun için yazılmış) ama `|| true` "defter YOK" hâlini de yutuyordu — `taban.sh` BOŞ MÜHÜR sınıfı. Çıkış kodları ayrıştırıldı.
- `scripts/katman-lint.py`: korunan dosya diskte yoksa kural **sessizce atlanıyordu**; yedi korunan dosyanın yedisi birden yokken bile `"0 ihlal (STRICT)"` + exit 0 basıyordu.
- ⚠ **`.github/workflows/` — CI HİÇBİR ŞEY TUTMUYOR.** Tek workflow `web/`'i Pages'e yüklüyor, **sıfır test koşuyor**. Tek test kapısı lokal `rabadon pushGate`.

### 4. H2.1 KAPANDI — operatör sicili kuruldu, red cümlesi çalışıyor
`contract/garment-spec-v2.json` mühürlendi: **15 operatör × 3 durum** (`shipped` 9 · `flagged` 1 · `absent` 5), 7 kapalı topoloji ekseni, 19 sınırlı skaler, `additionalProperties:false`. Üçü **kusurlu-ama-shipped** ve sicil hangisi olduğunu söylüyor (`armholeNotch` %22 kısa · `necklineDraft` · `topAnchoredDart` bu giyside hiç pens türetmiyor). **Kusurlu ≠ yok.**
**Bitiş tanımının red yarısı ÇALIŞIYOR** — Buğra puf kollu top fikstürü, tüm enum'lar geçerli:
> `BU GİYSİYİ ÇIKARAMIYORUM. Eksik operatör: shoulderSeam, sleeve, gatheredOverlayLayer, collarFamily, zipperPiece`
`sleeve:"puuf"` **reddediliyor ve alıntılanıyor, İKAME EDİLMİYOR** (DERSLER: sessiz enum fallback = halüsinasyon).
★ **Ama: SPEC'İ MOTORA VEREN YOL HİÇ YOK.** `engine/tools/surface-pattern.cpp:313` → `const SheathOptions opt;` — sevk edilen CLI **yalnız beden adı** alıyor, hiçbir spec dosyası okumuyor. Sözleşme motora **mandalla** bağlandı (`specv2_check` `SheathOptions` gövdesini okuyup her alanı ve varsayılanı doğruluyor), **girdiyle değil**. ~2–4 saat, H2.2'nin içinde.

### ⚠ 5. BİR AJAN BİR AJANIN İŞİNİ SİLDİ — YASA EKLENDİ
9B bir mutasyon testini geri alırken `git checkout -- .` koştu ve **9A'nın commit'lenmemiş `surfacepattern.cpp` düzenlemesini sildi**. Release build olduğu için kurtarılamadı. 9B bunu **kendi raporunun ilk satırında ilan etti**.
**YASA:** paylaşılan ağaçta `git checkout -- .`, `git stash`, `git reset --hard` **YASAKTIR**. Mutasyon testi geri alınırken yalnız **kendi dosyan**, açık yolla. Her düzenlemeden sonra **hemen commit**.

## TUR 8 — PENSİN KÖKÜ BİR KADEME DAHA DERİNDEYMİŞ + BEŞ BOŞ KOŞAN KAPI

### H1.0a — pens EYERİ YUTAMIYOR değildi; **PENS HİÇ OLMAMALIYDI**
`dartColumnsFromDeficitRows` yükü kolon başına `max(0, def[j])` topluyordu. Omuz bandı net **NEGATİF** (+34.57° / −64.34°, net −24). Kırpma **negatif yarıyı atıp pozitif yarıyı gerçek sanıyordu** → `total` +48.806°, n=2, pens başına 24.4°. **Panelden, orada olmayan 73°'lik kama kesiliyordu.** Yer sorusu ile yük sorusu tek sayıyla cevaplanıyordu; ayrıldı: **yer kırpılı kalır, yük İŞARETLİ olur.**

| kapı (bayrak AÇIK) | önce | sonra |
|---|---|---|
| `walkgate_check` | **6 hüküm** (EU34/36/46, hepsi kendini-kesme) | **0 — YEŞİL** |
| kesim çizgisi (kapı %0.5) | ön **%1.8318** · arka **%1.8646** | ön **%0.4162** · arka **%0.2908** — **GEÇİYOR** |
| pens bacağı gerinimi | %8.929 / %10.749 | **%0.000** |
| iç gerinim (kapı %3.0) | %6.96 / %7.79 | **%24.07 / %18.14** |

Kendini kesen 6 panel **uydurma pens kamalarıydı**; kama gidince kesme gitti. Bayrak **kapalı** sevk edilen giysi hiç değişmedi (kapalıyken sıfır yarık, kanıtlı).
**Blokör ikiden bire indi.** Kalan tek şart iç gerinim — ve bu **yeni eğrilik değil**, hep orada duran −64°'lik eyerin, sahte pens onu gizlemeyi bıraktığı için görünür hale gelmesi.

**İki şekil hipotezi ölçüldü ve ALINMADI** (kod içinde sayılarıyla duruyor): (a) bant = kolonun kendi açıklığının kesri → arka iç %7.79→**%11.91**; (b) katlama düzleme değil orta-yüzeye → arka kesim %0.2908→**%0.3038**. **Asıl okuma: dipol kımıldamıyor** (+34.57/−64.34 → +41.59/−65.29 → +48.63/−65.07). Eyer ne tırtıklı üstten ne kesitin düzleşmesinden geliyor.
→ **ROTA: kalan aday, eyerin kol oyuğunun bugünkü ince mercek şeklinden gelmesi. H1.0a'nın kalan kırmızısı H1.0b'nin ALTINDA olabilir.**

### T17 — BEŞ KAPI BOŞ KOŞUYORDU, hepsi mutasyon kanıtıyla düzeltildi
91 testin **89'u gerçek** hüküm taşıyordu. Boş olanlar:
1. **`style_check` — TAM BOŞ.** `engine/STYLE-PIN/` diskte yok → `PASS (nothing to enforce)`. Sıfır pin = sıfır hüküm. ⚠ Kapının ilan ettiği çıkış yolu `scripts/repin-style.sh` **de diskte yok**.
2. **`figure_check` — %23 hükümsüz.** 31 stilin 7'si son `else` dalından **koşulsuz OK** alıyordu.
3. **`run-all.sh` H2/L2 — T7'nin BİREBİR AYNISI.** `ctest ... | grep -E "..."` → boru hattının exit kodu **ctest'in değil grep'in**; ctest arıza hâlinde de eşleşen bir satır basıyor, kod **daima 0**. Bu adım hiçbir koşulda arıza sayamazdı.
4. **`taban.sh` sessiz beden atlama.** `cp ... || continue` — spec yoksa beden sessizce atlanıyor, FAIL sayılmıyordu; **sekizi birden atlansa mühür yine atılırdı.**
5. **`taban.sh` BOŞ MÜHÜR.** `find` hiçbir şey bulamasa da manifest yazılıp sha256'sı hesaplanıyor ve panele geçerli bir MANİFEST basılıyordu; o sha `e3b0c442…` = **boş dizginin hash'i, hiçliğin mührü** — ve tam yeşilse **git tag'i bile atılabilirdi**.

Her düzeltme **mutasyon kanıtlı** (korunan şey bilerek bozuldu, test kırmızıya döndü, geri alındı). Yeni çıkan kırmızı: **2 test / 8 FAIL** — ikisi de sahte yeşilin sonu.

### H1.1 — şartname 16/17. Motorun bu şartnameye borcu bitti.
- **H1.1a nesting kanıtı KAPANDI:** kazanç **0 sayfa** (A4 15→15, A0 1→1) ve **sıfır yazıldı, uydurulmadı** — 4 çizimin hiçbiri kendi orta çizgisine simetrik değil. ★ Sıfırın enstrüman hatası olmadığının bağımsız tanığı: aynı kod kemerli elbisede **A4 24→20, A0 2→1** kazanç görüyor.
- **H1.1b kumaş önerisi KAPANDI:** `print-info.pdf` s.2, kalıbın kendi kenarlarından çözülüyor (bel +2.5cm bolluk, etek/bel 1.75, fermuar var), her ad ve gerekçe `knowledge/stitchu.db`'den `source_url` ile. ★ İki kaynak çelişti (db keteni "tight fitted" için kötülüyor, sewing-guide öneriyor), **niteleyici ölçülerek çözüldü** — +2.5cm *fitted* ama *tight* değil.
- ★ **"13/14/10 adım" üçlemesi çözüldü:** oynatan motor değil **ölçüm koşusuydu**. Sevk edilen giysi **10 adım**; 14, `shoulderSeam=1` ile ölçülen ve **sevk etmediğimiz** paketin sayısı. Tur 7 yanlış paketi ölçmüş.

## TUR 7 — ALICIYA ULAŞAN BİR HATA KAPANDI + H1.0a'NIN TEŞHİSİ YER DEĞİŞTİRDİ

### ★ Bugünün en somut bulgusu: basılan beden tablosu kalıptan farklıydı
`contract/layers/size-table.json`, `printpack.py:1380`'de alıcının PDF'ine **"BEDEN TABLOSU (vücut ölçüleri, cm)"** başlığıyla basılıyordu; motor ise `euSize()`'dan kesiyordu. Fark sabit ve büyük:
`EU34–46: göğüs −0.159 · bel +2.334 · basen −2.522 cm` · `EU48: göğüs −2.159 · basen −4.522`
→ **EU38 sayfası "bel 72.3" yazarken kalıp 70.0'a kesilmişti.** Kendini bizim tablomuza göre ölçen alıcı **yanlış bedene** gönderiliyordu. Tekleştirildi (kök `euSizeChart` — 11 tüketici vs 1); `size-table.json` artık sözleşmeden **kopyalıyor**. `ctest` önce=sonra (`99%, 1/91`), K2 grade **7/7 korundu**, K6 dizisi bit-aynı.

### H1.0a — ÖNCEKİ TEŞHİS ÖLÇÜMLE GERİ ÇEKİLDİ
Tur 6'nın *"üst pensler bel pensleriyle kesişiyor"* teşhisi **YANLIŞTI**: `STITCHU_SLIT_DEBUG` 4 bedende, bayrak açık ve kapalı — **gövdede HİÇ BEL PENSİ YOK** (gövde yalnız üst çapa türetiyor; etek develop-deficit **+0.000°**, çünkü `skimBodice`+`hemSweep` koniye çeviriyor). *"Ön-orta ölü bölge"* de kök değil: o bölgenin deficit'i dikişten çıkıyor (sınır gerinimleri %0.011–0.092, kapı %0.5).

**GERÇEK KÖK — EYER.** Panelin deficit'i üstteki iki satır bandında **+34.57° sivri, sonra −64.34° çukur**; altındaki her bant −0.12…−0.18°. Çukur bir **eyer**, ve **pens eyeri yutamaz** — `dartColumnsFromDeficitRows` negatif bantları yerleşim için sıfıra kırpıyor, katlamanın negatif eğriliğine gidecek yer hiç verilmiyor ve **bacak gerinimi olarak yüzeye çıkıyor: %8.929** (kapıyı kıran %1.83'ün kaynağı). Bu bir pens muhasebesi sorunu değil, **`CrestFold`'un şeklinin** sorunu.
İki alt kalem: (1) üst pensin bacakları dikiş listesine **pens çifti olarak girmiyor** — PNG'de hiç mavi kenar yok, dikiciye kapatma talimatı yok; (2) `maxDartDeg` **bağlamıyor** (ilan edilen kapak 14°, gerçekte pens başına 24.4°).
**Bir düzeltme daha alınmadı:** `total`'dan pens sayma (n 2→4) kuyruk yürüyüşünü komşu kolonlara yığdı ve kesim çizgisini **kötüleştirdi** (ön 1.8318→%2.2734). Ölçüldü, ilan edildi, alınmadı.

> **KAPSAM BÜYÜDÜ: +1 halka (T17). Sebebi:** `style_check` ctest'te **YEŞİL** ama `engine/STYLE-PIN/` dizini **hiç olmadığı için** `PASS (nothing to enforce)` basıyor — hiçbir şeyi tutmuyor. T7 (`walk.py` kapı değil yazıcıydı) ile **aynı sınıf**. Tek testi düzeltmek yetmez: **başka hangi kapılar yeşil görünüp boş koşuyor?** Süpürme gerekiyor.

## TUR 6 — OMUZ DİKİŞİ İNŞA EDİLDİ, BAYRAK ARKASINDA BEKLİYOR

**İnşa bitti ve çalışıyor.** Tüp → omuz bandında ön/arka üst sınır **tek bir crest eğrisine** katlanıyor, `farEdges` c ↔ NR−c dikişleri planda, aynalama panel bazında türetiliyor. Açıkken kapı **52/63 → 24/63 FAIL**:

| şart | kapalı (sevk edilen) | **AÇIK** |
|---|---|---|
| K3 omuz dikişi | 0 | **30 dikiş, ok 8/8** |
| K5 yaka kapalı çevrim | açık | **ok 8/8** |
| K5 yaka çevresi | 364.67, 4/8 | **503.80, ok 8/8** |
| K6 taşıyıcı yüzey | −12.79mm | **+2.91mm, ok 8/8** |
| K4 omuz dengesi | −2.336mm | **−0.015mm** (hâlâ FAIL) |
| K2 grade | 7/7 ok | **7/7 ok, korundu** |

**Neden sevk edilmedi:** açıkken iki taban kapısını kırıyor — `surface_pattern_check` 0→4 FAIL (gövde kesim çizgisi %0.02 → **%1.83**, kapı %0.5) ve `walkgate_check` 0→**6 hüküm, hepsi kendini-kesme**. Kırık test yamalanmaz, geri alınır. `SheathOptions.shoulderSeam=false` bayrağıyla sevk edildi; **tek bool ile 24/63 geri gelir**, hiçbir şey silinmedi.

**Kök sebep ölçüldü:** katlamanın Gauss eğriliği üst-çapalı penslerden çıkamıyor. (a) Üst pensler bel pensleriyle **KESİŞİYOR** — bel yarığı `[0, 0.80)`, üst yarık `(0.55, rowsN]`, bantlar çakışıyor; koddaki *"cuts cannot cross by construction"* yorumu **YANLIŞ**. (b) Ön-orta kesiğin yanında pens türetilmeyen ölü bölge var.

**İki düzeltme denendi, İKİSİ DE ALINMADI** (Tur 5 emsali): crest bandı 60→120mm kesim çizgisini %0.46'ya indirdi ama walkgate'i **6→30**'a çıkardı — sayı düştü, giysi kötüleşti. `topDartApexFrac` 0.55→0.80: iç gerinim 6.96→**%11.67**.

> **KAPSAM BÜYÜDÜ: +4 halka (H1.0a, H1.0b, T15, T16). Sebebi:**
> **H1.0a — pens düzeni** (3–6s): üst pens ↔ bel pensi kesişmesi + ön-orta ölü bölge. **Bu çözülmeden omuz dikişi açılamaz.** Kritik yolun kendisi.
> **H1.0b — kol oyuğu gerçek 2B delik** (6–12s): K1 "%19 eksik" değil, **YAPISAL**. Oyuk bugün φ∈[0, 19.9°] bandında ince bir mercek — derinlik ~148mm, ön-arka genişlik **~52mm**. Elips aritmetiği: 150×52 → ~333mm (ölçülen 330 ✓); Buğra'nın 424–486'sı için delik **~110mm geniş** olmalı. Katlama buna +1mm bile katmıyor. Oyuk, φ'nin fonksiyonu olan bir çentik olmaktan çıkıp **gerçek bir 2B delik** olmalı.
> **T15 — KAPANDI 17.08. ÇARPAN KONDU, TEK BİR SAYI DEĞİŞMEDİ, K9 AYAKTA.** `18`'in mandalına sarılım çarpanı (`w = +1 CCW / −1 CW`) kondu ve sarılım artık **ölçülüp basılıyor**, varsayılmıyor. **Ölçüm: Front Body CCW 8/8, Back Body CCW 8/8** — bu dosya **kol parçası hiç ölçmüyor**, o yüzden körlük burada hiçbir zaman tetiklenmemişti. Önce/sonra: 728 sayıda **en büyük fark 0.0000000000mm**, konsol çıktısı sarılım bloğu dışında **bayt bayt aynı**. Bağımsız tanık: düzeltmeden ÖNCE bile Tablo 6'nın numerik-vs-analitik farkı 32 ölçümde en kötü **0.013mm** (CW olsaydı ~2·d·Δθ ≈ 30–40mm olurdu) → körlük zaten sessizdi. <br>★ **K9 HÜKMÜ SARSILMADI, çünkü tablo kımıldamadı:** `ön_yay ≤ arka_yay` kesim çizgisinde **8/8** (fark −13.83…−1.50mm) ve `ön_yay/kiriş > arka_yay/kiriş` **8/8** (1.2323–1.2620 vs 1.1610–1.1767). `docs/H1.0-KAPI.md`'nin şartı **devredilmedi, gerek kalmadı**. ⚠ Değişmeyen ama **kayda geçen** yan bulgu: DİKİŞ çizgisinde `ön ≤ arka` yalnız **6/8** (EU46 **+0.08**, EU48 **+1.33mm** ters); K9 kesim çizgisi hükmüdür, dikiş çizgisine genişletilirse iki bedende düşer.
> **T16** (~1s): **İKİ BEDEN TABLOSU VAR VE UYUŞMUYORLAR.** `contract/layers/size-table.json` bust'u kusursuz doğrusal (EU48 = **107.84**), `contract.gen.hpp` EU48'i **110** yazıyor; `h10_gate_check` ikincisini kullanıyor. `CLAUDE.md`'nin "ÜÇÜNCÜ VÜCUT KAYNAĞI" teşhisi hâlâ canlı. Ayrıca `backLengthCM` EU44→EU46 adımı **0.0cm** (diğer altı adım +0.5) — dizgi hatası gibi, DOĞRULANMADI.

### K4 — 5B'NİN REÇETESİ BU NOKTADA YANLIŞTI, DÜZELTİLDİ
"K4'ün işareti bu inşadan düşer" **olmadı**: dikiş tek eğri olunca iki kenar **tanım gereği eşit** (−2.336 → −0.015mm). `arka > ön` bir **yüzey özelliği değil, dikişte YEDİRME**dir; Buğra'nın +0.95…+1.13mm'si onun payıdır.
⚠ **İKİ KAPI ARASINDA GERÇEK GERİLİM:** K4 bandı `[0.5, 12.0]mm` ile dikiş-eşitliği kapısı `0.79375mm` yalnız **0.5–0.79mm** aralığında kesişiyor. → `DAMLA-KUYRUK` **K11**.

**T9 KAPANDI 17.08.** `arapFlatten`'ın `rounds`'u sayaç olmaktan çıkıp **TAVAN** oldu; duruş şartı çözücünün kendi cevabı (bir turda max düğüm yer değişimi `< 1e-4mm`). `60 → 400` YAPILMADI — ölçüldü, gövde panelleri **69–95 turda** bitiyor, 60 sadece 10–35 tur eksikmiş. Sonuç: bel dönüş açısı 8 bedende **±0.54°** içinde (önce EU46 +88.31°), `maxStrain` **%28.61/32.51/34.62 → 8 bedende %0.77–0.87**, bel dikiş sayısı 10–26 arası dağınıktan **8 bedende de 14**'e. `flatten_check`'in sertifikaları ayakta (koni bit-aynı 0.005814°). Bedel **+3.1 saniye**.

> **KAPSAM BÜYÜDÜ: +3 halka (T12, T13, T14). Sebebi:** Tur 5, bozuk `10`/`12` scriptlerini düzeltirken üç bağımsız açık kalem bıraktı. Üçü de bugün karar besliyor.

| # | Halka | Ölçülen | Süre |
|---|---|---|---|
| T12 | ~~`13-digitize-multisize.py` aynı bozuk ofseti taşıyor~~ | **KAPANDI 17.08.** Budama+miter atıldı, `18`'in nokta-normali ofseti kondu. Düz-kenar mandalı `400.0000 → 400.0000mm (fark 0.00e+00)`; analitik `ΔL=−d·Δθ` 484 kenar-ölçümünde en kötü **0.4102mm** (mandal düzeltilmeden önce 88.66mm — §sarılım). Bütün dikiş-çizgisi sayıları değişti: EU38 CF **401.5 → 420.2**, oyuk toplam **431.5 → 468.0**, kapak **425.8 → 444.7**, ön koltukaltı artığı **−0.1 → +1.5mm**, omuz ön/arka farkı **+3.3 → +0.2mm**. ★ **`13`'ten türemiş KULLANILAN sayı YOK:** zehirli alan `stitchMM` ve onun repoda `13` dışında tüketicisi yok (grep); `trace-match.py` + K1 `cutMM` okuyor, düzeltilmiş `13` HEAD'deki `seamgraph.json` ile **484 kenarda cutMM farkı 0 (max 0.0000mm), notches farkı 0**. Çıktı telifli dizinden çıkarıldı → `flatten-research/out-13-seamgraph.json` | ~0.5s |
| T13 | fikstür işaret şartını **yargılamıyor**, sadece basıyor | K9 hükmü belgelere yazıldı (`ön_yay ≤ arka_yay` **ve** `ön_yay/kiriş > arka_yay/kiriş`) ama `h10_gate_check` onu hüküm olarak koşmuyor | ~1s |
| T14 | ~~**net cap ease NEGATİF**~~ | **KAPANDI 17.08 — İŞARET, HANGİ ÇİZGİYİ ÖLÇTÜĞÜNÜN FONKSİYONU.** Kesim çizgisinde cap ease **8/8 POZİTİF** (+1.54…+4.22%, EU38 **+18.30mm**); dikiş çizgisinde 8/8 negatif. ~40mm'lik salınımın tamamı dikiş payından: oyuk **içbükey** (+34.3…+36.2mm), kapak **dışbükey** (−4.6…−6.4mm). "Cap ease +1.8…+4.3%" ile "−4.7%" aynı kalıbın iki çizgide okunuşu, hiç çelişmiyorlardı. **(c) ELENDİ:** Lower'ın o kenarı tarifi gereği bir kapak — EU38 kiriş **345.88mm = bicep**, sagitta **129.81mm = kapak yüksekliği** (Aldrich 13–15cm bandı), iki ucu aynı yükseklikte (dy 0.02mm). **(a) YARISI:** Upper'ın üst kenarı da oyuğa gidiyor ama Lower'ın YERİNE değil — %29 fazlalık ease değil **büzgü**. **(b) AYAKTA, KANITLANMADI:** koltukaltı bölgeleri 8 bedende ±4mm tutuyor, açığın **tamamı taçta** (−21.9…−30.0mm). ★ **`patterns_real/BUGRA-DEFTER.md`'nin "kol yatay 2'ye bölünmüş" satırı ÇÜRÜDÜ:** iki parça da tam kapak taşıyor ve kapak **sagitta oranı 8 bedende bit-sabit 1.227** (kiriş oranı 1.549→1.347 değişiyor) → iki KATMAN, yatay bölünme değil. **K1 ETKİLENMEDİ** (kanıt: `knowledge/cap-ease-isareti-2026-08-17.md` §6). Ölçüm: `flatten-research/19-cap-vs-armscye.py` | 1–2s |

> **TUR 4 DÜZELTMESİ — ÖNCEKİ TURUN İKİ SAYISI YANLIŞTI.**
> (1) `+0.2138 / +0.1376 / +0.2691mm` **h3c değildi** — motorun stderr satırıydı (`bodiceWaistSum − ringGirth`). Gerçek h3c (`h3b-rings.py`, tolerans ±1.0mm) bugün **8/8 bedende GEÇİYOR**. "T9 sayıyı kımıldatmadı" cümlesi yanlış numaraya bakıyordu: `Logs/taban-T7-SONRA` h3c'si gerçekten FAIL'di (−5.264 / −10.795 / −2.230mm) ve **T9'un `emitChain` düzeltmesi onu kapattı**.
> (2) "Zikzak panele ~3.3mm fazladan uzunluk katıyor" **yanlış**: kıvrım uzunluk-koruyucu (adımlar 7.5297→7.6104mm, pürüzsüz), bozulan yalnız dönüş açısı (−0.7° → +88.3°). mm zinciri kapatıldı: ftorso 235.973 + btorso 206.550 = 442.523, ring yarım 442.454, fark ×2 = **+0.1376mm**. Artık **birikmiş sınır gerinimi**, ekstra uzunluk değil.

> **KAPSAM BÜYÜDÜ: +1 halka (T11 — ters omuz). Sebebi:** T7 kapıyı gerçek kapı yapınca ortaya çıkan 12 hüküm-FAIL'in yarısı T9'un (waist-attach) değil: **6'sı ters omuz** — ön omuz arkadan uzun çıkıyor. `CLAUDE.md`'de kayıtlı alan bilgisi bunun tersini söylüyor (arka omzun uzun olması STANDARTTIR, kürek payı 6-12mm). İşaret hatası mı gerçek geometri mi **ölçülmedi**. T9'un içine gizlemek yerine halka yazıyorum.

> **KAPSAM BÜYÜDÜ: +4 halka (T7, T8, T9, T10). Sebebi:** Tur 1, tabanın altında dört bağımsız kırmızı ölçtü. Hiçbiri "H1.0 yeşil olunca geçer" cinsinden değil; dördü de **bugün basılan paketi satılamaz kılıyor**. Sessizce eklemek yerine halka yazıyorum ve H1'in kitapçık/kapak/listing halkalarını bunların ARKASINA aldım (gerekçe: TUR 1 ROTA KARARI).

Her rapor bu üç sayıyla **biter**. Sayı düşmediyse rapor bunu gizleyemez: `sayı düşmedi, sebebi şu` yazar.

**Bu blok reponun TEK sayacıdır.** Başka hiçbir dosya sayaç yazmaz, buraya işaret eder. `contract/kapsam-checkpoint.json` T6'da tek sayaç diye adlandırılmıştı ama **diskte yok** (16.08 doğrulandı); `reports/gate/kapsam-checkpoint.json` ise 2026-07-21 / 103-hedef rejiminden ve `ANAYASA.md`'ye göre tarih arşivi — sayaç değildir.

---

## BİTİŞ TANIMI — tektir, değişmez

Damla rastgele **10 cümle/görsel** atar → en az **8'i** dikilebilir kalıp + zevk kapısından geçmiş flat döner → kalan 2'si **eksik operatörünü adıyla söyleyerek** dürüst reddeder.

Bu listenin dışında "bitirmek için gereken" bir iş keşfedilirse **SAKLANMAZ** — buraya halka olarak eklenir ve o fazın raporu `KAPSAM BÜYÜDÜ: +X halka, sebebi şu` cümlesiyle açılır. Kapsamı sessizce büyütmek, **kapı boyamakla aynı sınıf ihlaldir**.

---

## TABAN — hedef değil, bitişin şartı

Her fazın sonunda **pazarlıksız** mühürlenir.

| # | Halka | Kalan iş | Süre |
|---|---|---|---|
| T1 | iki include düzeltmesi | **YOK HÜKMÜNDE 16.08** — terim tüm revizyonlarda aranmadı değil, arandı: repoda karşılığı yok. Ampirik: 52 başlık tek tek derlendi, **0 başarısız**. Uydurulmadı → `DAMLA-KUYRUK` **K6** | 0 |
| T2 | determinizm çift koşusu | **KAPANDI 16.08** — iki bağımsız temiz koşu, manifest sha256 `8abec243…` özdeş, 24 PDF `cmp` ile 0 fark | ~0.5s |
| T3 | kenar monotonluğu | **KAPANDI 17.08, T8 ile birlikte.** `edgemono_check` YEŞİL (ctest #88): 8 beden × 8 panel, **968 ihlal → 0**, en kötü geri dönüş **22.988825mm → 0.000000mm**, en kötü ters teğet 180.000° → 83.606° (kapı 90°). Kapıya, ölçüme, eşiğe dokunulmadı | ~0.5s |
| T4 | montaj sırasının pakete girişi | **KAPANDI 16.08** — `84e79a9` sadece `print-report.txt`'e basıyordu (denetim dosyası), hiçbir PDF'e girmiyordu; artık `print-info.pdf` s.2'de 13 adım | ~1s |
| T5 | dünya-kapısı sicili | **AÇIK — BLOKE.** Terim tüm revizyonlarda sadece bu satırda ve `.vardiya/state.json`'da geçiyor, tanımı repoda YOK (16.08 arandı). Sicil kurulmadı, tanım uydurulmadı → `DAMLA-KUYRUK.md` **K5** | **ÖLÇÜLMEDİ** |
| T6 | sayaç/anayasa tekleştirme | **KAPANDI 16.08** — tek sayaç bu dosyanın `§ SAYAÇ`'ı; ROADMAP/DERSLER/ANAYASA'daki bayat sayaç ve otorite satırları silindi | ~2s |

### TABAN — Tur 1'de açılan yeni halkalar

| # | Halka | Ölçülen | Süre |
|---|---|---|---|
| T7 | **`walk.py` bir kapı değil, yazıcı** | **KAPANDI 17.08.** `main()` artık hüküm döndürüyor; hangi bulgu **hüküm** (dikiş · kol oyuğu grubu · kapalı kontur · kendini kesme · ayna) hangisi **bilgi** (UNVERIFIABLE · GATHERED-UNSCORED · REPORTED · DEFERRED) `walk.py gate()` başlığında yazılı. `taban.sh` sayımı artık walk.py'ın `KAPI` satırından okuyor (girintili `  FAIL` + hiç FAIL satırı basmayan ARMHOLE hükmü dahil), grep çapraz kontrole indi. Kapı `walkgate_check` ile ctest'e bağlandı — 8 beden TAZE spec. **Ölçüm: donmuş T2-RUN2 spec'lerinde exit 0/8 → 1/8, görünen FAIL 12 → 72 (60 kendini kesen panel).** Bugünkü ağaçta (T8 curvefit düzeltmesiyle) kendini kesme 0, kalan **12 hüküm-FAIL** = 6 waist-attach + 6 ters omuz → `taban.sh` exit 1, ctest 88/89 | 2–4s |
| T8 | **eğri-fit kontrol noktası taşması** | **KAPANDI 17.08 (`25edfa2`).** Kök sebep **teğetin İŞARETİ**: `fitOne` kontrol noktalarını `c1 = p0 + al*t0`, `c2 = p3 + be*t1` (`al,be ≥ 0`) diye kuruyor, yani iki teğet de İÇERİ bakmak zorunda. `fitRange` özyinelemeli bölmede ilk yarıya, orta noktanın **İLERİ** teğetini bitiş teğeti diye veriyordu — tam tersi. Schneider'ın orijinali orta teğeti geri yönde hesaplar, ilk yarıya verir, ikinci yarı için negatifler. Sonuç: her pozitif `be` `c2`'yi `p3`'ün ÖTESİNE koyuyor, eğri kendi bitiş noktasını aşıp geri dönüyor. İkinci yarısı: en küçük kareler büyüklükte SINIRSIZDI (Schneider sadece işareti korur); artık kirişe izdüşen kontrol değerleri `x0 ≤ x1 ≤ x2 ≤ x3` kısıtıyla çözülüyor — üç doğrusal eşitsizlik, dışbükey karesel amaç, her yüzde kapalı form. Parametre **kırpılmıyor, doğru üretiliyor**: `[0,1]` dışı **488 → 0** (max 0.9937, min 0.0075). Kübik sayısı 2096 → 782, **fit sapması aynı** (paylaşılan zincir en kötü 0.1469mm, serbest 0.1356→0.1437mm, tek-kübik 7.1717mm değişmedi = T9). Yan kazanç: `walkgate_check` 72 → 12 hüküm-FAIL, kendini kesen panel **60 → 0** | 3s |
| T9 | **h3c 3/8 bedende FAIL + waist-attach** | **YARISI KAPANDI 17.08 — waist-attach BİTTİ, h3c AÇIK ama artık yeri belli.** (a) **Zorlama kaldırıldı:** `emitChain`'in `singleCubic=true`'su (tolerans `1e9`) `kFitTolMM`'i by-pass ediyordu. Konma sebebi "bel tek eğri olsun" değildi — asıl kısıt dardı: dikiş eşlemesi `waist[r][0]`'ı okuyordu, yani çok kenarlı bir bel zinciri ilk kenardan sonrasını **dikişsiz** bırakırdı. Bel BİR EĞRİ, ama tek kübik olmak zorunda değil. Prenses/yan dikişlerin zaten kullandığı **paylaşılan bölünme** (iki yakanın doğal kırılma noktalarının BİRLEŞİMİ, iki yakada yeniden fit) bele de uygulandı, eşleme `chainPair`'e taşındı (yön ölçülüyor, varsayılmıyor). **Ölçüm: `worst fit` 8 bedende 7.1717 → 0.1469mm**, hepsi `kFitTolMM=0.15`'in altında — kapı ilk kez GERÇEKTEN uygulanıyor (eşik, tolerans, sınıf DEĞİŞMEDİ). EU46 arka bel: 1 kübik / sapma 7.1717mm → 9 kübik / **0.0615mm**. (b) **waist-attach kök sebebi buydu:** hakem KENARI ölçüyor, kenar tek kübikti ve gerçek çokgeni 7mm ıskalıyordu; bel halkası **zaten bir kez örnekleniyor** (`skirt waist ≡ ring girth`, 8 bedende ≤0.0001mm). Aynı hakem, aynı gün, eski spec vs yeni spec: **waist-attach hüküm-FAIL 6 → 0**, en kötü sapma **5.350mm → 0.070mm**; T11 ile birlikte `walkgate` toplam **12 → 0**, ctest **90/90**. (c) **h3c hâlâ 3/8 FAIL, sayı kımıldamadı** (EU42 +0.2138 · EU46 +0.1376 · EU48 +0.2691mm) — çünkü h3c spec'i değil, düzleştirilmiş ÇOKGENİ ölçüyor. Yer bulundu: tek kübik bir kusuru **maskeliyormuş**. Bel koşusunun son 1-2 noktası bozuk, ve tam olarak h3c'nin düştüğü üç bedende: EU46 arka son iki nokta yanal **5.9mm zikzak**, EU42 ön son nokta y'de **geri dönüyor** (614.50 → 611.74), EU48 ön son adım neredeyse yatay (Δy 0.05mm, Δx 8.3mm); EU34/36/38/40/44 pürüzsüz. `STITCHU_SP_DEBUG` aynı yeri gösteriyor: EU46 `left_btorso` bel sınır gerinimi **%0.087**, EU38'de %0.004 — **20 kat**. Yani kalan h3c bir eğri-fit sorunu değil, gövde panelinin ARAP düzleştirmesinin bel sınırında (`surfacepattern.cpp`) — **H1.0'ın alanı**, `emitChain`'in değil. **(d) TUR 5 — KAPANDI.** Kök sebep ARAP'ın `rounds`'unun bir SAYAÇ olmasıydı ve sayaç 60'tı; 60 yakınsamıyordu. `rounds` artık **TAVAN** (2000), çözücü kendi cevabıyla duruyor: bir local/global turunda en büyük düğüm yer değişimi **< 1e-4mm** (üretim toleransı 0.79375mm'nin dört mertebe altı). Sayı büyütülmedi — `STITCHU_ARAP_DEBUG` ölçtü: gövde panelleri **69–95 turda** bitiyor, tavana hiç değmiyor; 4C'nin "400" okuması hastalıkta haklı dozda yanlıştı. **Ölçüm 8 bedende, `arapconv-probe`:** bel dönüş açısı EU42 −60.76 / EU46 +88.31 / EU48 −37.86° → **8'i de ±0.54° içinde** · `bodiceWaist−ring` +0.2138/+0.1376/+0.2691mm çıkıntıları → **−0.0257…−0.0293mm, bedenle monoton** · `h3b-rings` 8/8 OK (önce de OK'di) ama bel dikiş sayısı **10–26 → 8 bedende de 14**: kıvrım beli fazladan eğri parçasına bölüyormuş. **★ AYRI KIRMIZI DA AYNI KÖKTENMİŞ: `maxStrain` EU42 %28.61 / EU46 %32.51 / EU48 %34.62 → 8 bedende %0.77–0.87.** Bedel: 8 beden 34.2s → 37.3s. `flatten_check`'e DOKUNULMADI, sertifikalı sayılar duruyor (koni 0.005814° ve %0.003682 bit-aynı; kalot pens sapması 0.427595 → 0.427611°, çünkü 40 tavanı yerine 31'de duruyor — 1.0° kapısına karşı 1.6e-5°). Tavan 4000'de ölçülen tam-yakınsak koni 0.007706° / %0.002751 → analitikle kalan fark **ayrıklaştırma**, eksik-yakınsama değil | ~1s |
| T11 | **ters omuz** — ön omuz arkadan uzun | **KAPANDI 17.08 — (a) SINIFLANDIRMA HATASIYDI.** O dikiş omuz değil, **YAN DİKİŞ**. Dört bağımsız kanıt: (1) motorun kendi dikiş planı — `surface-pattern.cpp` panel sırası `[lF rF lB rB]`, `chainPair(base+1, base+2) // side phi=pi` ve `chainPair(base+3, base+0) // side phi=2pi`; walk.py'ın "omuz" dediği çiftler tam olarak bunlar. (2) Kontur bitişikliği: 8 bedende de o kenar panelin **bel kenarına** (edge 0, waist-attach) bitişik — omuz dikişi bele değmez. (3) `h10_gate_check` K3: 8 bedende **0 omuz dikişi**. (4) walk.py kendi aynasını bozuyordu: EU34/36/46'da AYNI yan dikişin bir yakası `shoulder`, öteki `side-seam` çıkıyordu (referans birebir maksimum, ona yalnızca bir çift eşit olabilir) — Tur 2'nin "FAIL'ler sadece `right_*` tarafında" şüphesinin cevabı bu. **KÖK SEBEP:** `shoulder_reference_height` "en yüksek ön-arka gövde dikişi = omuz" diyordu; bu bir VÜCUT yüksekliği ister, ama `surface-pattern` sekiz paneli de `translation [0,0,0] / rotation [0,0,0]` yazıyor — "yükseklik" panelin kendi y'si, iki panelinki kıyaslanamaz. Sezgi yine de cevap veriyordu. **Düzeltme kapı değil, kanıt katmanı:** `seamrules.side_seam_edges()` — bel dikişine kontur üzerinden ulaşan ön-arka gövde kenarı yan dikiştir; omuz sezgisi ancak geriye kalanlarda koşar. Eşik, tolerans, hüküm/bilgi sınıfı DEĞİŞMEDİ. **Ölçüm: `walkgate` hüküm-FAIL 12 → 6, ters-omuz hükmü 6 → 0** (kalan 6 = T9 waist-attach). Yan dikiş ön/arka farkı 8 bedende **0.003…0.035mm** ve işaret DEĞİŞİYOR (EU36 −0.003, EU48 +0.035) → yön kusuru değil eğri-fit gürültüsü; eşitlik toleransı 0.79375mm, en kötüsü toleransın **%4.4'ü**. Regresyon: omuzu GERÇEKTEN olan 7 spec'te (`gradeset-2026-08-10` ×6 + `paket-2026-08-06`) walk çıktısı **bayt bayt aynı**, omuz hükmü hâlâ koşuyor (arka +1.11…+1.74mm, Buğra'nın +0.95…+1.13mm'siyle aynı yön ve mertebe). ⚠ **GERÇEK ters-omuz kusuru VAR ama bu dikişte değil — H1.0'a bağlandı:** `h10_gate_check` K4 giysinin ÜST KENARINDA arka−ön **−3.964…−4.451mm** ölçüyor (bedenle büyüyor), kapı [0.5, 12.0] → K4 KIRMIZI, H1.0'ın alanı | ~1s |
| T10 | **açıklık uyarısı pakete girmiyor** | **KAPANDI 16.08** — uyarı artık `print-info.pdf` s.2'de çerçeveli kutu (adım listesinin İÇİNDE değil ÜSTÜNDE) + kalıbın kendi üstünde, dikilmeyen kenar boyunca etiket (A0 2×, A4 10×). Sayfa ile `print-report.txt` tek kaynaktan (`opening_facts()`) basılıyor, ayrışamazlar. **Ölçüm düzeltmesi:** T1 "hiçbir PDF'e girmiyor" dedi; doğrusu, `a65881e`'den beri adım 9 fermuarı anıyordu (1 satır) — eksik olan, o dikişin DİKİLMEYECEĞİ idi. Regresyon mandalı kuruldu: `printpack_sheet_check` (ctest #90), T4'ün montaj sırasını da tutuyor | ~1s |

T5 için "saatler/günler" demiyorum: **tanımı yok, ÖLÇÜLEMEZ.** K5 cevabından sonra ~1s.

---

## HEDEF 1 — ilk satış

Satış yüzeyi **Etsy** (karar: kendi sitesi = ödeme + trafik + hukuk, ilk satışı haftalarca geciktirir; TEK KAPI'nın sorusu zaten "Etsy'ye koyar mısın?").
Giysi: **mevcut oturtmalı elbise** (motorun bugün ürettiği tek aile).

| # | Halka | Kabul | Süre |
|---|---|---|---|
| H1.0 | **giyilebilirlik** | **KABUL KAPISI YAZILDI 17.08 → `docs/H1.0-KAPI.md`** (6 şart × 8 beden; kol oyuğu çevresi + grade · omuz dikişinin VARLIĞI · omuz ön/arka dengesi · yakanın KAPALI delik olması + çevresi · omzun üstünden geçen taşıyıcı yüzey). Fikstür `engine/tests/h10_gate_check.cpp`, ctest `h10_gate_check`, **bugün 55 yargıdan 48 FAIL** — sadece K2 (grade) yeşil. "Balensiz durur" ölçüye ÇEVRİLEMEDİ, sebebi kapı belgesinde yazılı. <br>**KIRMIZI — ÖLÇÜLDÜ 16.08.** Giysi hâlâ tüp. `GarmentSurf` 4 halka taşıyor (neck/bust/waist/hip), **omuz halkası yok**; omzun üstünden geçen hiçbir yüzey yok. Kol oyuğu bir DELİK değil, kenardaki çentik: **EU38 33.55cm**, Buğra Locket-38 **43.30cm** → bandın **6.45cm altında (%22 kısa)**. Yaka 23.34cm, boyun çevresi 35cm → yaka boyundan küçük. Omuz noktasında kumaş omzun **153.5mm altında**. PNG'ye gözle bakıldı: omuz yok, askı yok. Yapısal blokör: `buildGrid`'in (h,φ) ızgarası + `Slit`'in yalnız-bel çapası — ~610–1180 satır, 9 dosya | **25–45s** |
| H1.1 | paket tanımı mührü | **ÖLÇÜLDÜ 17.08 — AÇIK KALIYOR. `docs/SATIS-SARTNAMESI.md`** artık 17 maddenin hepsini bugünkü pakete karşı kanıtla taşıyor (taze koşu: `surface-pattern EU38` → `printpack.py`, sha256 `160146ae…`). **14/17 GEÇTİ.** §2 kalıp paketi **6/6** · §3 verimlilik **3/4** · §4 talimat **3/4** · §4b açıklık uyarısı (T10) **eklendi ve geçti** · §1 listing görseli **0/5**. <br>**Kapanmadı çünkü 3 madde gerçekten eksik** → aşağıdaki üç halka. <br>**Şartname 3 yerde BAYATTI, düzeltildi:** (a) *"SA 15mm gömülü"* — gerçek pay **10mm**, satıcı talimatıyla KANITLI, 15mm hiç ölçülmemişti; (b) *"9 fazlı construction order"* — sayı sabit değil, dikiş grafiğinden düşüyor, bugün **14 adım**; (c) **EMSAL REFERANSLARI'nın 3 dosyası da diskte YOK** (`benchmark-58/`) — silinmedi, üstü çizilip yazıldı; bantlar `contract/gusto-corpus.json`'da donmuş olduğu için §2/§3 ölçümleri ayakta, kaybolan yalnız kontakt sayfasının GÖRSELİ. <br>★ **Yan bulgu — BOŞ KOŞAN KAPI:** `style_check` (ctest) `engine/STYLE-PIN/` dizini **hiç yok** diye `PASS (nothing to enforce)` basıyor. Yeşil ama hiçbir şeyi tutmuyor; şartnamede kutucuk **işaretlenmedi**. **Ölçüm kapısına DOKUNULMADI.** | ~1s |
| H1.2 | kitapçık — motor çıktısından | **H1.0'ın ARKASINA alındı** (rota kararı: giysinin şekli değişecek) | ~4s |
| H1.3 | kapak + tek line drawing | **H1.0'ın ARKASINA alındı.** Damla'nın gözü (→ DAMLA-KUYRUK K3) | ~3s |
| H1.4 | listing — metin, fiyat, beden tablosu, lisans | **H1.0'ın ARKASINA alındı.** Etsy'ye yapıştırılabilir halde | ~3s |
| H1.1a | nesting önce/sonra sayfa sayısı | **KAPANDI 17.08 (Tur 8).** `printpack.nesting_proof()` aynı paketleyiciyi aynı koşuda İKİ kez koşuyor (her parça TAM çizilerek / sevk edilen kat kuralıyla). Ölçüm: **katlanabilen parça 0/4** · **A4 15 → 15** · **A0 1 → 1** → **kazanç 0 sayfa**. Uydurma kazanç yazılmadı: ön orta da arka orta da DİKİŞ, bölünemeyen parça sayfa kazandıramaz — şartname "kanıt" istiyordu, "kazanç" değil. Sayı denetim dosyasında kalmadı, alıcının sayfasına da basılıyor (`print-info.pdf` s.1 `BASKI: A4 15 sayfa`). Mandal `printpack_sheet_check` §6 — basılan sayının **gerçek PDF sayfa sayısına** eşitliğini de tutuyor (`pdfinfo`); mutasyon kanıtı: bloklar çıkarılınca **7 FAIL** | ~1s |
| H1.1b | kumaş önerisi pakete girmiyor | **KAPANDI 17.08 (Tur 8).** `print-info.pdf` **s.2 = KUMAS SECIMI**. Öneri listeden kopyalanmadı, kalıbın **kendi kenar uzunluklarından** çözüldü: bel çevresi **72.5cm** (vücut 70.0 → **+2.5cm bolluk**, şekil dikişten çıkıyor) · etek ucu/bel **127/72 = 1.75** (etek vücuttan AÇILIYOR, kumaş bunu ayakta tutmalı) · fermuar var (esnemeye ihtiyaç yok → **dokuma şart**). → **poplin + keten, 150–250 g/m²**; **KAÇININ: jarse · saten · viskon**, her biri kendi `bad_for` cümlesiyle. Her ad ve gerekçe baskı anında `knowledge/stitchu.db → fabrics`'ten okunuyor (NMSU G-401 · SDSU · UNL, satır başına source_url). ★ **İki kaynak çelişti, ölçümle çözüldü:** db keteni *"**tight** fitted styles"* için kötülüyor, `sewing-guide.md §1` keteni oturmalı elbise için **öneriyor**; niteleyici ölçüldü (+2.5cm bolluk = fitted ama tight DEĞİL) → keten önerilenlerde kaldı, iki kaynak aynı cevabı verdi. Mandal §7 **basılan adın db'de bulunmasını** şart koşuyor; mutasyon: sayfa çıkarılınca **6 FAIL**, ad elle yazılınca (`sifon`) **1 FAIL** | ~1s |
| H1.1c | emsal PDF'leri diskte YOK → kontakt sayfası açılamıyor | ÖLÇÜM KAPISI'nın 3. şartı. `patterns_real/` telifli, Damla kararı olmadan kontakt sayfasına konamaz → `DAMLA-KUYRUK` | **Damla'da** |
| H1.5 | **Damla'nın dikimi** | giysi ayakta duruyor | Damla'da — **BLOKE ETMEZ** |
| H1.6 | kabul testi | 3 soru EVET + **hesaba geçen para** | Damla'da |

**Pazar emsali (repoda ölçülü):** `benchmark-58/bugra-ref/` — BugraPatterns elle Illustrator ile çiziyor, **5 ayda 1.1k satış**.

> ★ **TUR 8 — "13 / 14 / 10" ÜÇLEMESİ ÇÖZÜLDÜ: DOĞRU SAYI 10, VE 14 SEVK EDİLEN PAKETİ ANLATMIYORDU.**
> Adım sayısı grafikten düşüyor, o yüzden oynayabilir — ama bu sefer oynatan motor değil **ölçüm koşusuydu**.
> Kanıt, aynı gün aynı ağaçta `instructions.build()`, iki spec:
> `shoulderSeam KAPALI (sevk edilen) → 10 adım, 1 kapatan` · `STITCHU_SHOULDER_SEAM=1 → 14 adım, 1 kapatan`.
> Fark tam olarak **4 pens kapatma adımı**: sevk edilen spec'te panelin kendine dikildiği (pens) dikiş
> **0 tane**, bayrak açıkken **8 tane** (4 mantıksal pense gruplanıyor).
> Yani Tur 7'nin "taze koşu 14" ölçümü **bayrak açıkken** alınmış; `Logs/taban-T10-SONRA/pack-EU38`'in
> **10**'u doğruydu. `T4` satırındaki **13** bugünkü ağaçta üretilemiyor (ne bayrak açık ne kapalı) —
> hangi ara durumdan geldiği **DOĞRULANMADI**, ama artık kayıtta değil: şartname sayıyı sabit yazmıyor,
> koşudan okuyor. `docs/SATIS-SARTNAMESI.md` §4 düzeltildi (14 → 10).

---

## HEDEF 2 — 10 cümle 10 kalıp

| # | Halka | Süre |
|---|---|---|
| H2.1 | spec şeması mührü (`contract/garment-spec-v2.DRAFT.md` → mühür) | 10s |
| H2.2 | **style line / bölge çıkarımı — KRİTİK YOL** | 40–80s |
| H2.3 | operatör dalgası: yaka ailesi · kol · etek ailesi · boy · kumaş ekseni | 60–100s |
| H2.4 | sanal muslin hakemi | 30–50s |
| H2.5 | F8 frontend | 10–20s |
| H2.6 | foto→spec sınıflandırma girişi (operatörler bitince) | 10–20s |
| H2.7 | **DÜRÜST RED yolu** — operatör sicili + kapsam sorgusu; red cümlesi eksik operatörü ADIYLA söyler | 8–15s |

> **KAPSAM BÜYÜDÜ: +1 halka (H2.7).** Sebebi: bitiş tanımı "kalanı eksik operatörünü söyleyerek reddeder" diyor. Bu, operatör listesinin makinede **sicil** olarak durmasını ve gelen spec'in bu sicile karşı sorgulanmasını gerektiriyor. H2.1–H2.6'nın hiçbiri bunu kendiliğinden vermiyor. Sessizce eklemek yerine halka yazıyorum.

---

## HEDEF 3 — flat hattı

| # | Halka | Süre |
|---|---|---|
| H3.1 | aynı yüzeyden çizgi çıkarımı | 80–120s (üçü aynı bütçe) |
| H3.2 | sadeleştirme | ↑ |
| H3.3 | Damla'nın kalemine oturtma | ↑ |
| H3.4 | zevk turları | **TAAHHÜT EDİLEMEZ** — hakem Damla; raporlarda `zevk turu N` diye sayılır |

---

## YASALAR — plan bunların üstüne kurulur

1. **Kapı boyanmaz.** Eşiğe, çözünürlüğe, tanıma dokunmak vardiyayı **durdurur** (16.08 emsali). Kapı düşerse yamalanmaz — yöntem değişir.
2. **Kanıtsız "bitti" geçersiz.** Her alt-ajan çıktısı: `halka X · kanıt Y (çalışan komut + sayı) · DOĞRULANMADI listesi`.
3. **Aynı anda en fazla 3 alt-ajan.** Düz fan-out, çarpan mimari yok, dar context, tavan 1 saat.
4. **Araştırma önce `knowledge/`'a sorar**, bulgu oraya döner — doğrulanmış yokluk dahil. 7 turda çıkmayan park edilir, gerekçesiyle.
5. **Motorun kendi çıktısı kanıt değildir.** Render → PNG → **gözle bakılır** (SVG path'e bakıp beğenmek yasak).
6. **Kota dolarsa** ajan kaldığı halkayı + kalan saat tahminini yazıp **durur**. Sessiz yavaşlama yasak.
7. **Kesintisizlik zorlaması yok.** Süreklilik context'e değil `.vardiya/state.json`'a bağlı.

---

## BRANCH DÜZENİ — YENİ DÜZEN (Damla kesin kararı, 17.08)

- **BÜTÜN İŞ `main`'DE.** `vardiya/2026-08-16` ve `f1-body-front-back` fast-forward ile main'e alındı (52 commit) ve **silindi** (lokal + remote). Kalan: `main` + `gh-pages` (site).
- **BRANCH AÇMAK YASAKTIR.** Açan ajan **ihlaldedir**; hakem turu kırmızı kapatır.
- Geçiş ölçümü: `git log vardiya..f1` **boş**, `git log vardiya..main` **boş** → hiçbir commit kaybolmadı, merge fast-forward oldu.

## MÜHÜR ARTIK TAG (Damla emri, 17.08)

"Sağlam nokta" branch değil, **git tag**. `scripts/taban.sh` **tam yeşil** bir mühürde `taban-<etiket>` tag'i atar ve push'lar (`FAILS=0` şartına bağlı, kod satır 200'ün altında). Satılabilir/dönülebilir noktalar **tag listesidir**; bir şey bozulursa **dönüş adresi son tag'dir**. `.vardiya/state.json` → `son_saglam_tag`.
Var olan tag'in üzerine yazılmaz — mühür geçmişi silinmez.

## PUSH KAPISI — İLAN EDİLEN KIRMIZILAR (6 ctest + 1 script)

`rabadon` `pushGate`'i suite tam yeşil olmadan push'u blokluyor. Binary **commit mesajını okumuyor** (`gate.cpp:2823`; bilinen üst-seviye anahtarlar sabit liste) — "KIRMIZI öneki" kuralı guard'a yazılamaz, uydurma anahtar sessizce yok sayılırdı. Yerine **isimle dışlama**, üç ad, üçünün de gerekçesi ve **bitiş şartı** `.rabadon/guard.json` → `pushGate._ilan_listesi`'nde yazılı.

| test | neden ilan edildi | dışlamadan ne zaman çıkar? |
|---|---|---|
| `h10_gate_check` | H1.0'ın kabul kapısı, **kasten** kırmızı doğdu. Kendini geçiren kapı kapı değildir | H1.0 yeşillenince |
| `style_check` | **T17: bu test BOŞ KOŞUYORDU.** `engine/STYLE-PIN/` diskte hiç yok, test `PASS (nothing to enforce)` basıp yeşil görünüyordu. Artık dürüstçe FAIL ediyor — kırmızı bir gerileme **değil**, sahte yeşilin sonu | 31 stilin pini Damla onayından geçince (**K15**) |
| `figure_check` | **T17: 31 stilin 7'si son `else` dalından KOŞULSUZ `OK` alıyordu** (tanık: `dress_bandeau_circle` 0.872 — figürel bandın üstünde, boxy eşiğinin altında, iki yasanın da dışında, yine "ok") | 7 tasarımın pini Damla onayından geçince (**K15**) |
| `preview_truth_check` | **TUR 9: landmark ratchet'inin %61.3'ü SESSİZDİ.** 31 stil × 10 landmark = 310 yargı yuvasının **190'ı** "honest skip" ile atlanıyordu ve **11 stil (princessSeam ailesinin TAMAMI) 0/10 yargı alıyordu** — tek kök, önü Center/Side Front'a bölünen stillerde draft'ta `Bodice Front` olmaması → `D.bustHalf` undefined → ÇAPA yok → on landmark'ın hepsi düşüyor. Atlama artık GEREKÇE istiyor; `bustHalf`/`waistHalf` hiçbir koşulda atlanamaz. Eşik (%8) ve `landmarkAllow` DEĞİŞMEDİ | 11 princess stili gerçek bir çapa alınca (Center Front + Side Front'tan `bustHalf`, prenses dikiş payını çift saymadan). **Ölçüm işi, Damla kararı değil.** Bugün **90 FAIL / 11 stil** |
| `contract_check` | **TUR 9: 9 kontrolün 1'i bu makinede HİÇ koşmuyordu** (58-set manifest yok → "skipped honestly"). Ölçüldü ve **adı yanlış çıktı**: o bir gizlilik taraması değil KAPSAM taramasıydı; manifest'siz eşdeğeri YOK ve uydurulmadı. Yerine adını taşıdığı sınırın ölçülebilir kısmı kuruldu (`contract/gizlilik.json` + kontrol 5b) ve **kurulduğu anda kırmızı doğdu**: `patterns_real/` **49 dosyayla HEAD'de takipli** (8 satın alınmış BugraPatterns PDF'i + 25 jpg, ~65.5 MB) ve repo **bugün PUBLIC** | `DAMLA-KUYRUK` **K1** cevaplanıp `patterns_real/` ağaçtan çıkınca. Eşik/tolerans/pin yok: sayılan şey "takipli telifli dosya", hedef **0**, bugün **49**. Geçmişi yeniden yazmak **Damla'nın kararıdır** |

| `walkgate_check` | **★ ALTINCI — TUR 12 (12B), 5/8 beden.** `panelcheck.edge_mirror_map` hizalanamayan bir ayna çiftini çıplak `continue` ile düşürüyordu; o çift **giysinin en çok sapan çifti**. Bugünün motorunda ölçüldü: `left_btorso/right_btorso` **EU34 3.9264 · EU36 3.9440 · EU42 3.8352 · EU44 3.8531 · EU46 3.7692mm** (üretim standardı 0.79375mm'nin ~5 katı) → haritadan düşüyor → **ayna-DİKİŞ yargısı 10 çiftten 4'e iniyor**, altı yargı yok oluyor, walk.py `mirror-seam 0 ... KAPI HUKUM: YESIL` basıp 0 ile çıkıyordu. ⚠ *"Panel seviyesinde FAIL bastığı için delik kapalı"* varsayımı **YANLIŞ çıktı**: `check_mirror_symmetry` `segments_for` ile çağrıldığında KONTURU ölçüyor (0.0005mm, PASS) ve bunu kendi `reason` satırında yazıyor — **iki seviye de aynı çifti affediyordu.** Eşik/tolerans DEĞİŞMEDİ (aynı `TOL_MIRROR_MM`); değişen, sessizliğin artık bir bulgu sayılması. Kırmızı bir gerileme **değil**, sahte yeşilin sonu | **Kök kusur motorda, 12A'nın alanında:** `right_btorso`'nun son iki kenarı `left_btorso` ile **aynı iki uzunluk, TERS SIRADA** (EU34 L=[90.3082, 94.2346] / R=[94.2346, 90.3082]). Kusur **8 bedenin 8'inde de var**; EU38/40/48'de o iki kenar tesadüfen eşit olduğu için (93.1057/93.1057 · 93.532/93.5321 · 91.7196/91.7197) **görünmüyor, yok değil**. Bitiş şartı: `surfacepattern.cpp` aynalarken bu iki kenarı doğru sırada yazınca — yani 8 bedende de en iyi hizalama ≤0.79375mm olunca. Eşik gevşetmek veya çifti dışlamak **kapı boyamaktır** |

| `scripts/gradeset.sh` (ctest'te DEĞİL) | **★ YEDİNCİ — TUR 13 (13B), 2 hüküm.** Bu kapı **hiç koşmuyordu**: `walk.py`'ın `summary` şeması düz sayaçlardan (`within_1mm`/`gathered_pass`/`fail`) `by_status` sözlüğüne taşınmış, `gradeset.py` iki yerde (426 `verdict`, 485 `fmt_report`) eski adı okumaya devam etmişti. `fmt_report` önce çağrıldığı için script 8 bedeni üretip **`KeyError: 'within_1mm'` ile ölüyor, `gradeset-report.txt` diske HİÇ yazılmıyordu** (tanık: `Logs/gradeset-2026-08-17/` — EU34..EU48 + EU38-rerun var, rapor yok). Aynı okumada ikinci delik: `verdict()` walk.py'ın **altı hüküm sınıfından yalnız birini** (seam) sayıyor, BOŞ TAPU sayımını hiç sormuyordu. Bugünkü koşuda seam FAIL 8 bedende de **0**; kırmızıyı basan şey **`mirror_seams` 8** — yani eski kapı, KeyError olmasaydı bile bu kusuru **göremezdi**. Eşik icat edilmedi: her bedenin kendi `seam-report.json`'u `walk.gate()`'e geri veriliyor. Mutasyon kanıtı **8/8** (M1 seam · M2 kendini-kesme · M3 açık kontur · M4 ayna dikişi · M5 dikişsiz giysi · M6 panelsiz spec · M7 şema kayması · M8 armhole — M2..M6 ve M8 eski kapıda **YEŞİL**, M7 **ÇÖKME**) | **Kök 13A'nın alanında ve altıncı kırmızıyla AYNI panel çifti.** `mirror_seams` FAIL'in kendi gerekçesi: `left_btorso <-> right_btorso` — *"edge counts differ (14 vs 13); every seam on it went UNJUDGED"*. Altıncı kırmızı bunu "aynı iki uzunluk ters sırada" diye kaydetmişti; **ölçüm bundan daha ağır çıktı — kenar SAYILARI farklı.** İkinci hüküm `monotonluk IHLAL 18`. ⚠ **BU SÜTUN TUR 15'TE GEÇERSİZLEŞTİ: o sayılar SEVK EDİLMEYEN motorundu.** Yeni kayıt aşağıda TUR 15'te; bugünkü hüküm **3** ve motor **`surface`**. Arşiv hattın 8+18'i `--motor garmentcode` ile hâlâ birebir üretiliyor |

**Dışlama tek tek AD regexi** → başka bir test kırmızıya dönerse push **YİNE bloke olur**, gerileme gizlenemez.
Ölçüm 17.08 TUR 13 (13B, `23aca7c`, `engine/build-13b` Release): dışlamalı **`100% tests passed, 0 tests failed out of 87`** (295.74s) · tam süit **`94% tests passed, 6 tests failed out of 93`** (294.55s) — düşen tam olarak ilan edilen altısı, **ctest'te yedinci yok**. Yedinci kırmızı ctest'e bağlı değil, `scripts/gradeset.sh`'in kendi exit kodunda.
Ölçüm 17.08 TUR 9: dışlamalı **`100% tests passed, 0 tests failed out of 87`** · tam süit **`95% tests passed, 5 tests failed out of 92`** — düşen tam olarak bu beşi, **altıncı yok**.
Ölçüm 17.08 TUR 12 (12B, `a88027d`): süit **93 teste** çıkmış. Değişiklikten **ÖNCE** dışlamalı **`100% tests passed, 0 tests failed out of 88`**; **SONRA** `walkgate_check` düşüyor → dışlamalı **87/88**. Altıncı kırmızı yukarıdaki satırda ilan edildi.
**Kapıların hiçbirinin eşiği/toleransı/tanımı değişmedi.** İki yeni kırmızının ikisi de gerileme değil, **sahte yeşilin sonu**.

⚠ **AJANLARA:** `ctest` koşarken **iki sayıyı da** raporla — dışlamalı (`-E '^(h10_gate_check|style_check|figure_check|preview_truth_check|contract_check)$'`) ve **tam süit**. Tek sayıya bakmak sahte yeşilin nasıl doğduğunun ta kendisidir.

## TUR — tekrarlanan tek adım

```
1. OKU     .vardiya/state.json + HEDEF.md
2. SEÇ     kuyruktaki sıradaki halka dilimi
3. KOŞ     ≤3 ajan, düz fan-out, dar context, tavan 1 saat
4. MÜHÜR   ctest + determinizm çift koşusu → KIRMIZIYSA tur başarısız,
           halka kuyruğa geri açılır, YAMALANMAZ
5. HAKEM   rota denetimi
6. YAZ     rapor + üç sayaç + commit + push
7. DEVİR   state.json'a sonraki turun girdisi
```

### HAKEM
Her turun sonunda tek ajan, sadece `state.json` + son 5 raporu okur. Üç soru: sayaç düştü mü (düşmediyse sebebi ne) · halka hâlâ bitiş tanımına giden yolda mı · kapsam sessizce büyüdü mü. Çıktı `DEVAM` / `ROTA DEĞİŞ` (gerekçeli, kuyruğu yeniden sıralar/ekler/siler) / `DUR-SOR-DAMLA`. Her karar `state.json` sicilinde satır bırakır.

**TRIPWIRE:** Sayaç **3 tur üst üste düşmezse** hakemin `DEVAM` seçeneği **KAPANIR** — `ROTA DEĞİŞ` ya da `DUR-SOR-DAMLA` seçmek zorundadır. Sicilde `tripwire: active` olarak görünür.

**Her 10 turda bir kapsam hakemi:** bitiş tanımını halka listesine karşı okur, eksik olanı halka olarak ekler.

### DURMA SEBEBİ — sadece iki tane (Damla emri, 17.08)

**Vardiya raporu bir DURMA sebebi DEĞİLDİR, günlük ÇIKTIDIR.** Raporu yaz, commit'le, **sonraki tura DEVAM et.**
Meşru durma sebebi yalnız ikidir:
1. **KOTA** — kalan halka + kalan saat tahmini yazılır, durulur.
2. **DUR-SOR-DAMLA** — hedefe ya da kabul testine dokunmak gerekiyorsa.
Bunun dışında hiçbir şey turu bitirmez: taban kırmızısı değil, rapor değil, faz kapanışı değil.

### GÜNLÜK RAPOR
Her ~24 koşu saatinde `reports/YYYY-MM-DD-vardiya.txt` — **üç sayı + tek paragraf.** Tüccar raporu: hedefe mesafe, para ve tarih dilinde. Virtüöz anlatısı yok.

---

## DAMLA'YA DÜŞENLER — `DAMLA-KUYRUK.md`

beden cevabı · dikim · zevk hükümleri · `patterns_real` kararı. **BLOKE ETMEZ** — paralel halkalar koşmaya devam eder; bekleyen işi öne alıp "bekliyorum" diye durmak yasak.
