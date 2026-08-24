# KART V4-R — ARAŞTIRMA: teknik flat çizim konvansiyonunun YAYINLANMIŞ zemini

ETİKET: PARALEL (tur 1; V4-K ve V4-C ile birlikte, dosya kümesi kesişmiyor)
SÜRE TAVANI: 55 dk

## NE
Bu fazın eşiklerini yayınlanmış kaynağa bağla. Kod YAZMAZSIN. Çıktın kaynak +
lisans + hüküm tablosudur. Kaynak bulunamayan her eşik için "yayınlanmış
formül YOK, bant şu ölçümden" cümlesini AÇIKÇA yazarsın.

## ARANACAK BEŞ EŞİK (sırayla, her biri ayrı bölüm)

1. **ÇİZGİ HİYERARŞİSİ ORANLARI.** Teknik flat / fashion flat / tech-pack
   çiziminde dış siluet : ana dikiş : iç dikiş-pens : topstitch : gizli hat
   çizgi kalınlıkları hangi ORANDA? Bak: teknik çizim standartları
   (ISO 128 / ASME Y14.2 çizgi kalınlık kademeleri — kalın:ince oranı),
   Adobe Illustrator fashion-flat pratiği, tech-pack rehberleri
   (Techpacker, Kollab/Fashinza sınıfı), moda illüstrasyon ders kitapları
   (Abling "Fashion Sketchbook", Szkutnicka "Technical Drawing for Fashion").
   İSTENEN ÇIKTI: sayısal oran dizisi + kaynak + güven (YÜKSEK/ORTA/DÜŞÜK).
2. **TOPSTITCH KESİKLİ ÇİZGİ**: dash uzunluğu / boşluk oranı için yayınlanmış
   pratik var mı? ISO 128-24 dash tipleri buna bakan tek standart olabilir.
3. **DETAY CALLOUT** (karmaşık bölge büyütmesi): teknik çizimde "detail view"
   / "enlarged view" konvansiyonu — ISO 128 / ASME Y14.3 detail view kuralı
   (dairesel sınır + harf etiketi + ölçek beyanı "DETAIL A  SCALE 2:1").
   Moda tech-pack'inde karşılığı nasıl basılıyor? İSTENEN: callout'un
   MEKANİK olarak ölçülebilir tanımı (SVG'de ne aranacak).
4. **ÖLÇEK BEYANI**: teknik çizimde ölçek nasıl beyan edilir (ISO 5455
   "Technical drawings — Scales": izinli ölçek dizisi 1:2, 1:5, 1:10...).
   Bugün repoda beyan `data-scale="1:3"` (`contract/flat-convention-v1.json`).
   1:3 ISO 5455 izinli dizisinde var mı? YOKSA bunu açıkça yaz — bu bir
   BULGU, gizleme.
5. **CROQUIS / MANKEN ÇİZELGESİ**: "flat mankene göre çizilir" için
   yayınlanmış bir manken (fashion croquis 8-9 baş) oran çizelgesi var mı?
   `contract/flat-convention-v1.json` → `referenceBody.openItem` bugün
   "KAYNAK YOK" diyor. Bulursan künyesi + oranları; bulamazsan bunu
   DOĞRULANMADI diye yaz ve o açık kalemi TEYİT et.

## GİRDİ DOSYALARI (isim isim — başka dosya AÇMA)
- `contract/flat-convention-v1.json` (OKU, DEĞİŞTİRME)
- `engine/tests/flat_convention_check.mjs` (OKU — bugün ne ölçülüyor)
- `knowledge/` altındaki dosya adlarını listele; SADECE flat/çizim ile ilgili
  olanı aç (doğrulanmış kayıtlar yeniden ARANMAZ, §5.2)
- ENV.md · RULES.md

## ÇIKTI
`GECE/V4-R.md` — beş bölüm, her bölümde tablo:
EŞİK · YAYINLANMIŞ DEĞER/ORAN · KAYNAK (yayın adı + bölüm/sayfa + URL) ·
LİSANS/erişim · GÜVEN · HÜKÜM (kapıya bağlanabilir mi).
Bu dosya V4-A ve V4-B kartlarının eşik kaynağıdır.

## YASAKLAR
- Görsel İNDİRME yok (§7.2 kalıcı veto). Referans = link + özellik dili.
- Model ağırlığı / API anahtarı / bulut servis yok.
- Sayı UYDURMA yok: erişemediğin yayının künyesini yaz ve **DOĞRULANMADI**
  etiketle; "muhtemelen 2:1'dir" cümlesi kart ihlalidir.
- Kod yazma, dosya değiştirme yok. Tek yazdığın dosya `GECE/V4-R.md`.
- Erişemediğin kaynağı "yok" ilan etme; erişilemedi diye yaz.
