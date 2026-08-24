# V5-R kurtarma — ölen şefin salıp banklayamadığı iki araştırma çıktısı

STATÜ: bu dosya bir TUTANAK DEĞİLDİR. V5-R kartı 529 API hatasıyla ölen
oturumda koşmuştu ama çıktısı diske yazılamadan oturum kesildi. Buradaki
iki rapor, ölmeden önce dönen işçi çıktılarının ham hâlidir. V5 şefi bunları
GİRDİ olarak kullanabilir; kapıya kanıt olarak girmeden önce kaynağı
kendisi doğrular. Teşhis: §3.10, tarafsız cevapçı (V5-Z koştu ve
commit'lendi `241eea3`; V5-R çıktısı yoktu).

---

## A) Açılım/flatten çarpıtma eşiği — yayınlanmış kaynak var mı?

KISA CEVAP: var, ama dar bir dilimde, ve sayılar KULLANICININ AYARLADIĞI
tasarım parametreleri — topluluğun üzerinde uzlaştığı kabul eşikleri değil.

### En iyi tek sayısal ifade
Zhang Y., Wang C.C.L., Ramani K., "Optimal fitting of strain-controlled
flattenable mesh surfaces", Int. J. Adv. Manuf. Technol., 2016.
DOI 10.1007/s00170-016-8669-2
PDF: https://engineering.purdue.edu/cdesign/wp/wp-content/uploads/2016/06/Optimal-fitting_IJAMT.pdf

Verbatim (giriş bölümü, PDF birincil okundu):
> "The allowance strains can be varied for different materials from less
> than 1 % for leather in shoe design, within 5 % for cotton fabric in
> jeans design and even high to around 10 % for Neoprene for wetsuit design."
> "Slightly extensible planar materials are more widely used, which allow a
> certain level of in-plate stretch during fabrication (e.g., less than 5 %
> in textile industry)."

Aynı makaledeki diğer sayılar (hepsi birincil):
- İzometrik oturtma iç döngüsü kenar gerinimi < %10'da duruyor (çalışma
  toleransı, kabul ölçütü DEĞİL).
- Şekil 2: %10 maksimum gerinimle oturtma, sonra %7.5'e sıkılaştırma.
- Şekil 4: izin verilen kenar uzunluk değişimi %10 / %4 / %0.4 —
  makale %0.4'ün fazla katı olduğunu ve oturtmayı öldürdüğünü söylüyor.
- E_max / E_ave çiftleri: %10 / %3.2 · %5 / %0.5 · %1 / %0.04.

ÖNEMLİ ÇEKİNCE: %1 / %5 / %10 cümlesinin makalede ATIFI YOK. Yazarların
endüstri pratiği hakkında iddiası; ölçülmüş ya da standartlaşmış bir sınır
değil.

### Parafashion — kodun sevk ettiği varsayılan: ±%5
Pietroni N., Dumery C., Falque R., Liu M., Vidal-Calleja T.,
Sorkine-Hornung O., "Computational Pattern Making from 3D Garment Models",
ACM TOG 41(4), SIGGRAPH 2022. DOI 10.1145/3528223.3530145 ·
arXiv 2202.10272 · https://github.com/nicopietroni/parafashion

Kod (birincil, `include/parafashion.h`):
    max_corners=8; max_tension=0.05; max_compression=-0.05;
    param_boundary=0.03; dart_intervals=3;
    MeshArapQuality: MinV=-0.05; MaxV=0.05;
`configs/final_config.json`: max_iter=40, stretch_coeff=10.0,
edges_coeff=1.0, dart_sym_coeff=100.0, seam_coeff=5.0.

Makalede kullanıcıya açılan iki parametre: köşe sayısı C ve maksimum
gerinim s_max. Gerinim parametrizasyon Jacobian'ından: s_u = ||J1||,
s_v = ||J2|| — yani yön başına gerinim sınırı. Sonuç taramasında kullanılan
değerler: s_max = 0.05, 0.04, 0.02 (C = 6 ve 8 ile çaprazlanmış).
Kesme (shear) için SAYISAL sınır YOK — ARAP katılık terimiyle ele alınıyor.

### Yakınsama bulgusu
Parafashion'ın sevk ettiği ±%5 ile Zhang/Wang/Ramani'nin "tekstil
endüstrisinde %5'ten az" ifadesi, 6 yıl ve iki ayrı araştırma topluluğu
arayla BAĞIMSIZ olarak aynı yere geliyor. Dokuma giysi için savunulabilir
tek sayı istenirse en çok desteği olan bu: **düzlem-içi %5 gerinim**.
%2 sıkı/muhafazakâr uç (her iki makale de kullanıyor).

### Diğer kaynaklar
- Wang C.C.L., "Computing Length-Preserved Free Boundary for
  Quasi-Developable Mesh Segmentation", IEEE TVCG.
  https://mewangcl.github.io/pubs/TVCGFreeBnd.pdf
  Sınır uzunluğu KATI kısıt (tolerans yok). Var olan eşikler segmentasyon
  kabul/red eşiği: alan çarpıtması A(Ω) > %10 ve L2 doku-gerilme normu
  L2(Ω) > 2.0 ise geri dön. Makale bu iki eşiği kendisi sahiplenmiyor:
  "the thresholds depend on the samples employed to train the classifier
  which is not robust enough."
- Wang, Tang, Yeung, "Freeform surface flattening based on fitting a woven
  mesh model", CAD 37(8), 2005.
  https://mewangcl.github.io/pubs/CADFlatten04.pdf
  Tablo 1 sonuç sayıları (kabul eşiği DEĞİL, yöntem karşılaştırması):
  giysi örneği V %1.79 sınır / %0.30 alan; elbise örneği VI %3.74 / %1.91;
  en kötü örnek IV %14.94 / %4.61. Konformal harita %33.7 / %57.66.
  Tek malzemeye bağlı sabit: atkı/çözgü yay sabiti köşegenin K katı,
  "K is an empirically determined integer, chosen 500 to 550".

### BULUNAMAYANLAR (iddia kurulmasın)
- KES-F / FAST ölçümüne bağlanmış bir açılım gerinim sınırı: HİÇBİR makale
  bulunamadı. "KES-F türevli flattening gerinim sınırı" iddiası DESTEKSİZ.
- McCartney/Hinds (Ulster) üç makale: ScienceDirect 403, tam metin
  okunamadı. Çerçeve "minimize et", "X'in altında kal" değil görünüyor
  ama gövde okunamadığı için DOĞRULANMADI.
- Ease allowance literatürü: vücut-giysi arası cm/mm boşluğu ölçüyor,
  açılım çarpıtması ölçmüyor. Kabul eşiği olarak kullanılamaz.
- Wang/Smith/Yuen 2002, Wang 2008, MDPI Appl.Sci. 16(11):5634 (2026),
  Springer bespoke-block bölümü: erişilemedi, sayısal içerik BİLİNMİYOR.

### Literatürdeki açık boşluk (dökümden)
Bulunan hiçbir sayı giyim denemesiyle doğrulanmamış. "Şu kadar gerinimle
giysi diktik, hangileri oturdu ölçtük" diyen makale YOK. Her sayı ya bir
çözücü parametresi ya atıfsız endüstri iddiası.

---

## B) Kesme kilitlenme açısı (shear locking angle) — sayılar

Bu bölüm V5'in dikilebilirlik/kırışık kökü tarafını ilgilendirir.
Kritik uyarı en başta: **test yöntemi belirtilmeden verilen kilitlenme
açısı anlamsıza yakın** — bias-extension (BET) ve picture-frame (PFT)
aynı kumaş için belirgin farklı sayı veriyor.

Doğrulanmış (birincil, tam metin okundu):
- Düz dokuma karbon preform, KURU, BET: kilitlenme **28.7 ± 0.8°**,
  kırışma başlangıcı **38 ± 0.5°**. Zhang/Zhu ve ark., Materials
  10(10):1184, 2017. https://pmc.ncbi.nlm.nih.gov/articles/PMC5666990/
  DİKKAT: burada kilitlenme ÖNCE (28.7°), kırışma ~9° SONRA geliyor —
  "kırışma kilitlenmeden önce başlar" cümlesinin tersi.
- Karbon düz dokuma termoset prepreg, PFT: **45°** üst sınır olarak
  kullanılıyor. https://pmc.ncbi.nlm.nih.gov/articles/PMC9268817/
  (45°'nin nasıl ölçüldüğü makalede yok — türetimi DOĞRULANMADI.)
- Çift eksenli E-cam dikişli kumaş (E-LT 5500 / E-LT 2900), PFT: **36°**.
  UMass Lowell / DOE DE-EE0001374 Ek A.
  https://www.uml.edu/docs/doe_de-ee0001374_appendixa_tcm18-139819.pdf
  ±45 çift bias ve UD karbon için kilitlenme açısı VERİLMEMİŞ — temiz bir
  kilit noktası yok, önce düzlem-dışı burkulma geliyor.
- UD non-crimp cam kumaş, kırışma başlangıç açısı (WOA) sadece kelepçeye
  göre değişiyor: standart PFT **30.7°**, düşük basınç G-kelepçe **19.4°**,
  4 mm ön-yerdeğiştirme **26.5°**, 6 mm **4.7°**. Harrison grubu, Glasgow
  eprint 298313. https://eprints.gla.ac.uk/298313/1/298313.pdf
  Yani WOA malzeme sabiti kadar tezgâh artefaktı.

KARŞI POZİSYON (ve güçlü): Boisse, Hamila, Vidal-Sallé, Phil. Trans. R.
Soc. A 374:20150269, 2016. https://pmc.ncbi.nlm.nih.gov/articles/PMC4901244/
> "there is no direct relation between shear angle and wrinkling …
> Consequently, the 'locking angle' is a questionable concept."
Ölçümleri: bir bölgede **60°** kesme ve HİÇ kırışma yok (kelepçe gerginliği
bastırıyor); tersine, iplik yönünde basılan şeritte kesme açısı ~0 iken
yoğun kırışma. Ayrıca pin-jointed-net varsayımı yalnız **35–40°** altında
geçerli, üstünde kayma (slippage) başlıyor → BET'ten türetilen 40° üstü
"kilitlenme açıları" yapısal olarak şüpheli.

Ticari varsayılan: Altair HyperMesh kinematik draping, kilitlenme açısı
β varsayılan **55°**; aynı sayfa "most fabric reinforcements … maximum
deformation angle alpha is 30-40 degrees" diyor.
https://2021.help.altair.com/2021/hwdesktop/hm/topics/user_interface/kinematic_draping_approach_r_2.htm
ÇEKİNCE (DOĞRULANMADI): sayfa α ve γ'yı karıştırıyor; 55°'nin hangi
konvansiyonda ölçüldüğü metinden kesin değil. İki sayıyı aynı cümlede
bu çekince olmadan alıntılama.
Ansys ACP: sayısal varsayılan YOK. PTC Creo: doküman 403, doğrulanmadı.

TANIM AYRIMI (literatürün kendi ifadesiyle):
- Kilitlenme (jamming) = GEOMETRİK: iplik-iplik boşluğu sıfırlanır, yanal
  sıkışma başlar, kesme kuvveti dikleşir (Prodromou & Chen tanımı).
- Kırışma başlangıcı = YAPISAL burkulma; eğilme rijitliğine, gerginliğe,
  kelepçe basıncına ve tezgâh sınır koşullarına bağlı.
- "Kırışma kilitlenmeden önce başlar" GENEL BİR YASA DEĞİLDİR; yalnız
  düşük gerginlik / düşük eğilme rijitliği hâllerinde doğru.

ERİŞİLEMEYENLER (sayı iddia edilmesin): Mohammed/Lekakou/Dong/Bader 2000
(dört E-cam dokuması için kilitlenme açısı tablosu — en iyi hedef, ama
paywall), Cao ve ark. 2008 benchmark (HİÇBİR sayı çıkarılamadı, "Cao 2008
kilitlenme açısı" diye atıf VERME), Lomov & Verpoest 2006, Harrison/
Clifford/Long 2004, Taha ve ark. 2013 (jüt: düşük yoğunluk → yüksek kilit
açısı, niteliksel doğrulandı, sayı yok), Thompson ve ark. 2020 (dolaşımdaki
45°'nin kaynağı, açılamadı).

Erişim notu (sonraki koşular için): ScienceDirect, MDPI doğrudan, HAL,
ResearchGate, Academia, SAGE, SpringerLink otomatik çekimi engelliyor.
Çalışanlar: PMC / Europe PMC, Frontiers, arXiv abs, Semantic Scholar API
(özet), üretici yardım siteleri, üniversite repo PDF'leri.

---

## C) KES-F / FAST — kumaş uzayabilirliğinin yayınlanmış sayıları

Merkezî uyarı (IEEE SA raporunun kendi bulgusu): KES, FAST, Browzwear FAB,
CLO Kit, Optitex, FTT çıktıları arasında **standart yok, birim uzlaşması
yok, çapraz korelasyon yok**. "Uzayabilirlik sayısı"na dayanan her hüküm
alet-bağımlıdır. Kaynak: Kuijpers S., Luible-Bär C., Gong R.H. (2020),
"The Measurement of Fabric Properties for Virtual Simulation — A Critical
Review", IEEE SA Industry Connections Report STDVA24083,
ISBN 978-1-5044-6497-0.
https://pure.manchester.ac.uk/ws/portalfiles/portal/160056173/3DBP_Measurement_of_fabric_properties.pdf

### KES-FB1 çekme (birincil, PDF okundu)
> "After the tensile force attains the maximum stress F_m = 500 gf/cm, the
> recovery process starts."
Numune 5 × 20 cm, hız 0.1–0.2 mm/s. Esnek/örme için hassas ayar: 50 gf/cm.
Kesme: aynı numune ±8°, sabit dik gerginlik W = 10 gf/cm; G birimi
gf/(cm·derece), 2HG 0.5°'de, 2HG5 5°'de.
Birim dönüşümü doğrulandı: **500 gf/cm ≈ 490 N/m** (FAST tarafından çapraz
onay: 5 gf/cm = 4.9 N/m). Mahnić Naglić ve ark. 2025 (Polymers 17(15):2013)
maksimum yükü 490.35 cN olarak veriyor ve EMT-1/EMT-2'yi bu yükteki
çözgü/atkı uzamaları olarak tanımlıyor.

### Ölçülmüş EMT değerleri (birincil)
- M1 dimi, çözgü %65 CO/%33 PES/%2 EL, atkı PES sarılı elastan,
  226.58 g/m²: **EMT çözgü %1.730 · EMT atkı %11.180**. Bu ASİMETRİ tamamen
  elastan atkıdan geliyor — "tipik dokuma" sayısı olarak KULLANILMAZ.
  Polymers 17(15):2013. https://pmc.ncbi.nlm.nih.gov/articles/PMC12349057/
- Kontrol pamuklu (158 g/m²) EMT ≈ **%2.29**; fotokromik inkjet basılı
  ≈ %1.21; iletken inkjet ≈ %2.61 (çözgü+atkı ortalaması, yön ayrımı
  yayınlanmamış). Tadesse ve ark. 2018, Materials 11(12):2466.
  https://pmc.ncbi.nlm.nih.gov/articles/PMC6316920/
- SECONDARY / DOĞRULANMADI: "normal dokuma kumaşlarda EMT tipik olarak
  %3–10 arasıdır" — ScienceDirect Topics alıntısı, sayfa 403 döndü,
  kitap bölümü adlandırılamadı.

### Kawabata/HESC ideal bant (erkek takım kumaşı) — SECONDARY, ÇEKİNCELİ
Fan J., Yu W., Hunter L., "Engineering Apparel Fabrics and Garments",
Woodhead 2004, Tablo 1.12 (TAV > 4.0 ölçütü):
EM1 (çözgü) **%4.3–5.1** · EM2 (atkı) **%7.5–18** · EM2/EM1 = 1.3–3.0 ·
G = 0.50–0.65 gf·cm/deg · 2HG5 = 0.8–1.5 gf/cm · LT = 0.50–0.60 ·
RT = %73–78. Genel: çözgü εM1 > %3.5, atkı εM2 > %4.0.
ÇEKİNCE: bu tablo iki KORSAN kitap aynasından çıkarıldı (epdf.pub,
vdoc.pub) ve özetleyici tarafından okundu, sayfa görüntüsüyle
DOĞRULANMADI; kış/yaz satırları aynı döndü (özetleyici artefaktı olabilir).
Yayına girmeden önce basılı Tablo 1.12 ile karşılaştırılmalı ve atıf
Woodhead kitabına verilmeli.
Kawabata & Niwa'nın kategori bazlı "kar tanesi" kontrol grafiği ortalama±σ
değerleri: HİÇBİR ücretsiz kaynakta BULUNAMADI.

### FAST / SiroFAST (birincil tanımlar, IEEE SA raporu Tablo 2)
E5 / E20 / E100 = 5 / 20 / 100 gf/cm'de uzayabilirlik [%] ·
EB5 = 45° bias uzaması 5 gf/cm'de · **Kesme rijitliği G = 123/EB5, birim N/m**
· B [µN·m] · C [mm] · T2 (2 g/cm²) / T100 (100 g/cm²) · RS, HE [%] ·
F = formability (raporun dipnotu: "no unit of measure given").
SI karşılıkları (SECONDARY, CSIRO el kitabını tekrarlayan ders sunumu):
E5 → 4.9 N/m · E20 → 19.6 N/m · E100 → 98.1 N/m.
B = 9.8e-6 · M · C³ [µN·m] · **F = B(E20 − E5)/14.7**.
RS = (L1−L3)/L1 ×100 · HE = (L2−L3)/L3 ×100.
Numune 150×50 mm (FAST-1/2/3), 300×300 mm (FAST-4); tekrar: 5 sıkışma,
3+3 eğilme, 3 çözgü + 3 atkı + 6 bias uzama.

### FAST işlem sınırları (SECONDARY, alıntı düzeyinde, sayfalar 403)
- **E100 < ~%2** ise kumaş dikişte overfeed ile uzatılamıyor.
- **G < 30 N/m** kolay deforme, serme/dikmede sorun; **G > 80 N/m**
  overfeed/kalıplama zor → çalışma bandı **G ≈ 30–80 N/m**,
  yani EB5 ≈ %1.5–4.1 (G = 123/EB5 ile).
- Erkek takım kumaşı kesme rijitliği "67–91" — kaynak birimi gf/cm yazmış,
  bu neredeyse kesin bir dizgi hatası, N/m olmalı (67–91 N/m ⇒
  EB5 = %1.35–1.84). BİRİM ŞÜPHELİ, öyle işaretle.
- Formability: çözgü için **0.4–0.6 optimum**, "tercihen 0.25'ten büyük".
  Finish stability tercihen > %75.

### Bias (45°) ve ana yön karşılaştırması
Pan N., Kovar R., Dolatabadi M.K. ve ark. (2015), R. Soc. Open Sci.
2(5):140499. https://pmc.ncbi.nlm.nih.gov/articles/PMC4453249/
45° bias şeritte kopmadaki uzama (L = 100 mm):
polyester/pamuk %27.06 (W=5mm) → %32.19 (W=25mm) · yün %26.67 → %33.09 ·
cam %25.14 → %28.20.
YÖNTEMSEL KRİTİK NOKTA: bias testinde **numune genişliği W bağımsız bir
değişken** — dik şerit testlerinin aksine. Yani bias "uzayabilirliği" tek
bir kumaş sabiti DEĞİLDİR.
FAST üzerinden düşük yük karşılaştırması: worsted E100 (çözgü/atkı) ~%2
mertebesi, EB5 (bias, yükün 1/20'sinde) ~%1.35–4.1 → yaklaşık **20×
uyumluluk oranı**. Bu oran iki banttan ÇIKARILMIŞ aritmetiktir, yayınlanmış
bir sayı DEĞİLDİR.

### Ek olarak görülen (simülasyon hattı için)
Gerçek↔simüle drape korelasyonu: KES sürücülü r = 0.97, FAST sürücülü
r = 0.94 (IEEE SA raporu, ref [19] üzerinden).
CLO Fabric Kit 2.0: 2 kgf kuvvet eşiği, 22×3 cm çözgü/atkı/bias numune,
dokumada 1 mm adım, yüksek esnemede ve dokuma bias'ta 10 mm.
Browzwear FAB: 8 cm kıskaç aralığı, 5×25 cm numune, sürtünme ÖLÇÜLMÜYOR
(varsayılan 0.20).

### ERİŞİLEMEYENLER
SAWTRI/CSIR "The FAST Fabric Objective Measurement Properties of
Commercial Worsted Apparel Fabrics" (Hunter & Botha) — aranan ortalama/
min/maks FAST tablosu büyük olasılıkla burada; CORE'un üç URL biçimi de
403/timeout verdi (https://core.ac.uk/download/327307906.pdf). Tarayıcıdan
denenmeli. CSIRO SiroFAST el kitabı (De Boos & Tester 1994, WT92.02):
ücretsiz PDF YOK. Minazio 1995 (IJCST 7(2/3)): paywall.
Açılamayan alan adları: sciencedirect topics, mdpi doğrudan, tandfonline,
core.ac.uk, ias.ac.in, inflibnet, researchgate.
Erkek worsted takım kumaşı için AÇILABİLEN kaynaktan çözgü-atkı EMT çifti
BULUNAMADI.

### BİRİM TUZAĞI
KES G birimi gf/(cm·derece) [veya cN/(cm·°)], FAST G birimi N/m.
**Aynı büyüklük DEĞİLLER**, dönüşümsüz karşılaştırılamazlar. Yukarıdaki
kaynakların birkaçı bunu özensizce karıştırıyor ("67–91 gf/cm" satırı
bunun bir örneği).

---

## D) Natalie Bray ease sayıları — İKİNCİL KAYNAK ARAMASI: BULUNAMADI

> ★ SONRADAN GELEN DÜZELTME (V5 şefi işledi, 25 Ağu). Aşağıdaki D bölümünün
> hükmü KISMEN ÇÜRÜDÜ. Sonradan gelen bulgu:
> - Bray'in ELBİSE KOLU için normal kol kapağı easing'i **2 cm**'dir —
>   *"over and above the usual 2 cm extra of a dress sleeve"*, **More Dress
>   Pattern Designing**. Aşağıda bulunan **1 cm** yalnız YASSILAŞTIRILMIŞ
>   (flattened) kol kapağı içindir; aşağıdaki çekince doğruydu ama "standart
>   blok değeri hiçbir sorguda yüzeye çıkmadı" cümlesi ARTIK YANLIŞ.
> - **Omuz dikişi ease'i Bray'de YOK** — yöntemi fazlalığı ease'le değil arka
>   omuz PENSİYLE ya da arkayı öne EŞİTLEYEREK çözüyor. Citable omuz ease
>   sayısı gerekiyorsa kaynak **Aldrich**: 0.5 cm (ceket kitabında 0.85 cm).
> - **Yan dikiş ease'i Bray'de yok** (zayıf olumsuz kanıt, aşağıdaki gibi).
> - TERİM NOTU: Bray'de **"crown" = YÜKSEKLİK** demektir; easing hep
>   **"sleeve head"** üstünde tarif edilir. Amerikan "sleeve cap ease" terimi
>   kitabı ıskalıyor.
> Bu blok İKİNCİL/sonradan bildirilmiş girdidir: sayfa numarası YOK,
> birincil kitap sayfasıyla DOĞRULANMADI. Kapıya eşik olarak girmeden önce
> V5-R2 işçisi künyeyi kendisi teyit eder.

HÜKÜM: Bray'in kol kapağı easing'i, omuz dikişi ease'i ve yan dikiş ease'i
için SAYI + KİTABA AÇIK ATIF içeren hiçbir topluluk kaynağı bulunamadı.
Bu üç sayı bu koşuda KAYNAKLANDIRILAMADI; §5.1 gereği eşik olarak
kullanılamaz, kullanılacaksa "yayınlanmış kaynak YOK, bant şu ölçümden"
yazılır.

Bulunan tek doğrudan alıntı (Open Library search-inside, Bray'in kendi
metni): "With this type of 'flattened' sleeve head a total of 1 cm sleeve
head easing is usually quite sufficient for most fabrics".
https://openlibrary.org/search/inside?q=%22sleeve+head+easing%22
ÇEKİNCE: cümle açıkça "bu tip YASSILAŞTIRILMIŞ kol kapağı" için — temel
kol bloğu için DEĞİL. Bray'in standart blok değeri hiçbir sorguda
yüzeye çıkmadı. Sayfa numarası yok.

Omuz dikişi: Bray fazla arka omuz uzunluğunu ya pens ya ease olarak ele
alıyor (iki snippet bunu doğruluyor) ama SAYI hiçbir snippet'te yok.
Yan dikiş: Open Library'de "side seam ease" ifadesi ~20 kitapta geçiyor,
Bray'de SIFIR. Bu olumsuz kanıt, yokluk kanıtı değil.

Bulunan tek gerçek ikincil atıf, ve HEDEF DIŞI: "the Natalie Bray block
(circa 1950's) drafts with 5 cm of ease on the half bust (or hips if the
hips are bigger)" — A Tailor Made It blogu, 2021.
http://atailormadeit.blogspot.com/2021/05/benefits-of-basic-block.html
Bu BÜST ease'i, aranan üç sayıdan hiçbiri değil, sayfa numarası yok.

YANLIŞ ATIF TUZAKLARI (Bray'e bağlanmasın): PatternReview 111067'deki
"at least 1 1/4 in (3 cm), no more than 1 1/2 in (3.75 cm)" ceket bloğu
talimatı, Bray'den DEĞİL. Ledbetter ve DiMarco'nun omuz ease cümleleri
de Bray değil.

ARAMA NOTU (sonraki koşular için değerli):
- Bray'in kendi sözcüğü **"sleeve head easing"** — Amerikan terimi
  "sleeve cap ease" ile arama kitabı tamamen ıskalıyor. İngiliz imlası,
  santimetre.
- Bray dört blok adlandırıyor (Simplified, Trade, Tailoring, STANDARD);
  ease değerleri bloktan bloğa değişebilir, harvest edilen her sayı hangi
  bloğa ait olduğuyla birlikte yazılmalı.
- Bray ease'i en azından büst için SABİT SAYI olarak değil, ÖLÇÜ ALMA
  KURALI olarak veriyor olabilir ("küçük bedende sıkı, büyük bedende
  gevşek ölç"). Doğruysa tek bir kanonik "yan dikiş ease"i kitapta
  gerçekten YOK olabilir. DOĞRULANMADI.
- `openlibrary.org/search/inside` bu ortamdan çekilebiliyor ve Bray'in
  GERÇEK metnini arıyor; kitap başına ~3 kırpılmış snippet, sayfa numarası
  yok. Bu koşuda bulunan en değerli alet.
- ERİŞİLEMEDİ: sewing.patternreview.com'un tamamı (403 + Cloudflare),
  özellikle Bray'e özel iki başlık (topic/119676, topic/79353);
  web.archive.org bu ortamda engelli; archive.org full-text 403;
  curvysewingcollective sloper karşılaştırması HTTP 500.
  YouTube'da ~12 "Natalie Bray method" video var, sayıları sözlü
  söylüyor olmaları çok muhtemel, transcript alınamadı.
