# DRESSES REWORK — tur defteri
# Her elbise birebir olana kadar. Her turda: sorunlar -> KÖK TEŞHİS -> tamir.
# Kural: bir turda sadece JSON sayısı değiştiyse o tur SAYILMAZ. Motor değişecek.
# Bağımsız değişken = elle verdiğim sayı. Bağımlı = onunla birlikte kayan şey.

===============================================================================
#1  PEMBE FİYONKLU MİNİ   dresses/01-pembe-fiyonk-mini.png
===============================================================================

TUR 1-119 (12 Eyl, eski koşu)
  Sorunlar: gövde düz, kum saati yok, omuzlar cetvel gibi, yaka iğrenç,
            flat beyaz (elbise pembe), gölge kötü, flat'te dikiş payı var
  KÖK TEŞHİSLER (motorda kesildi):
    1. gogusAyri >= 30  -> göğüs koltukaltına 30mm'den yakınsa yan dikişten
       TAMAMEN atılıyordu. croquis'te fark 15mm -> göğüs HER ZAMAN atılıyor,
       gövdenin en geniş yeri çizilmiyordu. "Kum saati yok"un kökü buydu.
    2. kol evi parametre sırası TERS (sol yarımda koltukaltı<->omuz yer değişik)
       -> gövde ile kol 7.6mm ayrışıyordu, omuzdaki beyaz çizgi buydu.
    3. gövde dolgusu sabit "#fff" -> kumaş rengi motora HİÇ girmiyordu.
    4. `o.X || N` deseni 24 yerde -> JS'te 0||3=3, okuma "sıfır" derse
       varsayılan devreye giriyordu.
    5. yelpaze kuralı HER açıklık dibini yuvarlak yapıyordu -> kare dekolte
       çizilemiyordu (HEDEF md.9 ihlali: sabit kural).
    6. yakaYolu 3n zinciri: 6 kontrol noktası verilince SON nokta hiç
       kullanılmıyordu -> kademe (dar yarık + geniş dekolte) çizilemiyordu.
    7. gövde konturu boyun dibinden başlamıyordu -> bant boş alanda kalıyor,
       görünmüyordu. 4 tur kovalandı.
    8. gölge kenarın tamamına eşit -> sert bant.
  Eklenen primitifler: yakaBandi, keyhole/kademe, köşe noktası tespiti,
    kumaş rengi + dokuma izi + tek yönlü gölge
  Ölçümle düzeltilen kanunlar:
    - çizgi kalınlığı dış/iç 4.0 -> 1.55 (etsy-01, etsy-09, Buğra ölçümü)
    - ten dolgusu: açıklık gövdeden %15 koyu (etsy-01 V içi ölçümü)
    - gercek36 beli YOKTU: waist/bust 0.940 (düz tüp). Buğra EU36 gerçek kalıbı
      0.7727 diyor -> waist 117->96.2, hip 156.9->133.0
    - hedefler tutarsızdı: 0.945 x 1.392 = 1.315 != 1.113. etek/bel türetildi.
    - perspektif: foto 3/4 dönük, bel geniş okunuyordu -> bel/göğüs 0.945->0.805,
      gövde/göğüs 2.235->1.96
  SONUÇ: Kapı 7/7 oran + 6/6 nesne. AMA Damla baktı: "bok gibi".
  DERS: kapı yeşil olması ürünün iyi olduğunu göstermiyor.

TUR 120 (13 Eyl, bu koşu) — AÇIK
  Yapılacak: göze sor, sert eleştiri al, kök teşhis, motor değiştir.

===============================================================================
#2-18  GECE GELEN ELBİSELER   girdi/1209/
===============================================================================
(görseller kaydedilecek, sırayla işlenecek)
