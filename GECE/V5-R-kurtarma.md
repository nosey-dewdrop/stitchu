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
