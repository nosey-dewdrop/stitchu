# stitchu — Endüstriyel pattern CAD nasıl çalışıyor? (araştırma sentezi, 2026-07-29)

4 paralel araştırma kolu (2D endüstri CAD+MTM+grading / 3B drape+2D↔3B / couture atölye gerçeği /
katman blind-spot denetimi). Amaç: "couture-endüstri çıtasına nasıl çıkarız" sorusunu pazarlamayla
değil GERÇEK mimariyle cevaplamak; ve "göremediğimiz eksik katman" var mı diye avlamak.

## EN KRİTİK BULGU (dört kol da aynı yere çıktı)

**1. Apparel 2B-KAYNAK → 3B-DOĞRULAMA'dır.** Bütün endüstri (Lectra Modaris, Gerber AccuMark,
Optitex, CLO3D, Browzwear) ÖNCE 2B pattern parçalarını yazar; 3B, parçaları avatar üzerinde dikip
SİMÜLE ederek TÜRETİLİR — fit'i DOĞRULAMAK için. "3B gövde yüzeyi → düzleştir → 2B pattern" bunun
TERSİDİR. Bu teknik gerçek ama apparel'de değil: ayakkabı (last), kompozit/döküm, döşeme, otomotiv
koltuk, teknik tekstil. Apparel'de sadece akademik araştırmada (Wang mass-spring flatten) ve neural
denemelerde (SewFormer/DressCode). Sebep: rastgele bir 3B giysi yüzeyi GENELDE developable DEĞİL →
düzleştirme izometrik olmaz → dikilecek kenarlar EŞİT UZUNLUKTA çıkmaz → giysi kapanmaz/oturmaz.

→ Sonuç: dün geceki "3B-flatten = çekirdek" pivotu, endüstri gerçeğine göre YANLIŞ ÇEKİRDEK.
   İyi ki ARAP'a ay yakmadan önce araştırdık.

**2. Görünmeyen eksik katman 2B-mi-3B-mi DEĞİL.** Hem naif formül-motoru (eski stitchu) HEM naif
flatten-motoru aynı hatayı üretir: **geometrik olarak makul ama BİRBİRİYLE TUTARSIZ parçalar** —
kenarlar eşit uzunluğa "yürümez", pensin barındırdığı 3B şekillendirme korunmaz, ease niyeti yok,
parametrik geçmiş yok. "Ev yapımı" vs "Lectra" farkı TAM OLARAK bu tutarsızlıktır.

**3. Kimsenin düzgün ship'lemediği deterministik MOAT: DİKİŞ-EŞLEME ÇÖZÜCÜSÜ (seam solver).**
"Walk-the-seam" (komşu parçaların kenarları eşit uzunluk + tanımlı ease dağılımı — ör. kol kapağı
ease'i) ÇÖZÜLEN bir kısıt sistemi olarak; pens = KORUNAN bir şekillendirme miktarı; ve bu tutarlılık
pens manipülasyonu + grading boyunca BOZULMAZ. LLM'i çıkar → geriye kalan: her dikişin mm cinsinden
eşleştiğini garanti eden, Lectra çıktısına karşı benchmark'lanabilir deterministik bir çözücü.
"FreeSewing eğri ÇİZER; dikiş ÇÖZMEZ." Moat testini geçen tam olarak bu.

## DESTEKLEYEN GERÇEKLER

- **Veri modeli (endüstri):** GEOMETRİ (DXF BLOCK + sabit AAMA katman düzeni: L1 sınır, L4 çentik,
  L7 grainline, L8 iç çizgi, L13/15 drill…) AYRI, GRADING ZEKASI AYRI (`.rul` X/Y artış tablosu).
  Parametrik olanlar (Valentina `.val` XML) noktayı FORMÜLLE tanımlar (başka nokta + ölçü değişkeni).
  FreeSewing parametrik-grafik yarısına sahip; üretim-attribute + grade-tablo + dikiş-çözücü +
  interchange yarısına DEĞİL.
- **MTM (made-to-measure):** temel blok + ALTERATION kuralları (kritik noktalarda ölçü-deltasına
  bağlı nokta kaydırma) — grading makinesinin tek kişiye çevrilmiş hali. 3B değil, 2B kural sürer.
- **Craft (amatörün atladığı):** ease çok-boyutlu (giyim ease'i vs tasarım ease'i; Aldrich ≠ Armstrong
  AYNI ölçüden farklı pattern → "aynı girdi ≠ aynı pattern"); pens manipülasyonu pens-değeri
  KORUNARAK (pivot, slash-spread, pens→dikiş→büzgü); walk-the-seam + kol kapağı ease dağılımı;
  grain/bias/denge; çentikler dikiş sırasına bağlı; blok truing (dikişler arası eğri sürekliliği).
- **Couture gerçeği:** el işi — moulage/draping (le flou) + terzilik (le tailleur), toile fitting
  döngüsü, sonra DIGITIZE (tablet/kamera) → Lectra/Gerber'de grading/üretim. CLO 3B = sanal numune,
  toile'i replace etmez. Couture "kumaşın gerçek bedende NASIL DÖKÜLDÜĞÜ" yargısıdır, aritmetik değil.
- **Rakip/frontier (2024-26):** unspun (telefon-scan → MTM denim, SF/HK), CLO "AI Pattern Drafter"
  (beta), Six Atomic Catalyst (text/görsel → .dxf+3B), Style3D AI, SEDDI. AMA neural üreticiler
  "üretim kısıtı değil olasılık dağılımı öğrenir" — güzel görünen 3B giysi DİKİLEMEZ panellere
  düzleşir; malzeme davranışı yok. Deterministik + dikilebilirlik-garantili motorun yeri BURASI.

## ESKİ İŞ ÇÖP DEĞİL — YENİDEN KONUMLANDI
`flatten-research/`'ün kanıtı (pens = yüzey eğriliği; develop-deficit = 41mm göğüs pensi) DOĞRU ve
DEĞERLİ. Hatası flatten'ı tüm pattern KAYNAĞI yapmaktı; İÇGÖRÜSÜ (pens = eğriliğin barındırdığı
korunan miktar) DART-KORUMA katmanının matematiksel temeli. Motorun ~%40'ı da kalıyor (geometry.hpp,
dxf.cpp, nest.cpp, drape.cpp Verlet iç döngüsü = 3B doğrulayıcı).

## Kaynaklar (seçme)
- Valentina/Seamly2D veri modeli: en.wikipedia.org/wiki/Valentina_(software) ; seamly.net
- ASTM D6673 / AAMA DXF katman düzeni: dorthehansen.com/.../ePattern-ASTM-Standard.pdf ; fabricesalvaire.github.io/Patro/resources/file-format/dxf-astm.html
- MTM alteration: geminicad.com/.../made-to-measure-alteration ; researchgate.net/publication/288381807
- Grading: tukatech.com/global-grade-rules ; padsystem.com manuals ch4
- 2B-kaynak→3B-sim (CLO/Browzwear): wearview.co/blog/clo3d-vs-marvelous-designer ; browzwear.com/products/v-stitcher
- Cloth sim (Baraff-Witkin / PBD): researchgate.net/publication/2869802 ; arxiv.org/pdf/2301.01396
- Flatten non-apparel (footwear/ExactFlat): journals.vilniustech.lt/.../2684 ; javelin-tech.com/3d/technology/exactflat
- Wang apparel flatten: mewangcl.github.io/pubs/CADAMM.pdf
- GarmentCode (parametrik 2B DSL): arxiv.org/abs/2306.03642 ; GarmentCodeData arxiv.org/pdf/2405.17609
- Sensitive Couture (2B↔3B interaktif): jst.go.jp/erato/igarashi/publications/001/SensitiveCouture.pdf
- BFF flatten: arxiv.org/abs/1704.06873
- Neural (dikilemezlik sınırı): sewformer.github.io ; github.com/IHe-KaiI/DressCode ; arxiv.org/abs/2201.13063
- Couture atölye: thecuttingclass.com/the-christian-dior-toile-room ; maisondechanel.ca/.../chanel-couture-inside-the-ateliers
- Digitize: smartpatternmaking.com/pages/pattern-digitizing ; n-hega.com
- Ease (Aldrich≠Armstrong): dresspatternmaking.com/.../ease-in-the-bodice-* ; researchgate.net/publication/233100527
- Dart manipülasyon: textilelearner.net/dart-manipulation-techniques ; dresspatternmaking.com/.../manipulating-darts
- walk-the-seam: threadsmagazine.com/2021/02/05/how-to-walk-the-seamline
- Rakipler: unspun.io/blog ; clo3d.com/en/resources/notices/609 ; sixatomic.com/blog ; seddi.com
