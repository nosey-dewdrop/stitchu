# KART V5-R — ARAŞTIRMA (kod yazma)

## NE
Dikilebilirlik fazının her eşiği için YAYINLANMIŞ kaynak bul; kaynağı olmayan
eşik için "yayın YOK, bant şu ölçümden" satırını hazırla.

## ETİKET
PARALEL (V5-Z ile). SÜRE TAVANI: 55 dk.

## GİRDİ DOSYALARI (isim isim, başka dosya açma)
- ENV.md · RULES.md
- knowledge/drafting-math-eu38.md
- knowledge/ altındaki tüm .md (ls ile listele, ilgili olanları aç)
- contract/tables.json · contract/layers/size-table.json

## ARANAN EŞİKLER (her biri için: kaynak adı + basım/sürüm + sayfa/madde + sayı)
A. Üretim toleransı 1/32" (0.79375mm) — dikiş çifti eşitliği için yayınlanmış
   dayanak var mı? (ASTM/ISO/endüstri el kitabı). Yoksa açıkça yaz.
B. Beyanlı yedirme (ease) oranı bantları: kol kapağı ease %, omuz ease,
   yan dikiş ease — Aldrich sınıfı yayın.
C. draft_math_check'in ana ölçüleri, BEDEN BEDEN formül ya da bant:
   1) scye derinliği (armhole depth) formülü
   2) kol oyuğu çevresi bandı
   3) omuz genişliği formülü
   4) göğüs / bel / kalça çevre payları (ease) bandı
   5) ense oyuntusu (back neck drop) + yaka genişliği formülü
   Her biri için: formül metni + kaynak. Aldrich / Winifred Aldrich "Metric
   Pattern Cutting for Women's Wear" tercih; başka yayın da olur, ADIYLA.
D. GEÇİŞ (madde 5): giyilebilirlik için yayınlanmış ölçü — baş çevresi,
   omuz üstünden geçiş çevresi (bi-deltoid), ve fermuar/lace donanımının
   SATILAN standart boyları (fermuar boyları cm cinsinden ticari dizi).
E. Geri projeksiyon / sarma / gerinim: YAYINLANMIŞ algoritma ADI (ör. LSCM,
   ARAP-Sorkine/Alexa, Liu&Zhang local-global, Wang "surface flattening
   based on energy model", parafashion). Her biri için: makale adı, yıl,
   lisanslı açık implementasyon var mı (libigl/Eigen MPL2 tercih).
   Gerinim (strain) eşiği için yayınlanmış sayı var mı?
F. Çentik eşleşmesi: çentik yerleşimi ve toleransı için yayınlanmış pratik.

## YASAKLAR
- Kod yazma, dosya değiştirme (kendi çıktı dosyan hariç).
- Sayı UYDURMA. Bulamadığın kaleme "YAYIN YOK" yaz ve neden aradığını yaz.
- patterns_real/ altındaki PDF'lere dokunma (kalıcı veto).
- Model ağırlığı/GPU/harici API kurma.

## ÇIKTI
`GECE/V5-R.md` — tablo: EŞİK · KAYNAK (ad+sürüm+sayfa) · SAYI/FORMÜL ·
GÜVEN (birincil/ikincil/YAYIN YOK) · HANGİ KAPIYA BAĞLANIR.
Sonunda "KART DIŞI FARK EDİLEN" bölümü.
Raporunda her satırın yanında dosya yolu ya da kaynak künyesi olacak.
