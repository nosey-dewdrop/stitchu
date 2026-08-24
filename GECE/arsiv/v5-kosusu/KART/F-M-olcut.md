# F-M — K1 BANDI YANLIŞ KURULMUŞ: tek beden çapası, 8 bedenlik kapı değil
`GECE/KART/ORTAK.md` oku. Sonra bu kart.

## ÖLÇÜLDÜ (F-F ajanı, 23 Ağu)
Satın alınmış **Buğra kalıbının kendisi**, `garment_armhole_check` K1 bandıyla
dikiş çizgisinde **8/8 DIŞARIDA** (459–522mm). Kesim çizgisinde 8'in yalnız 4'ü içeride.

Yani: **40–44cm bir BEDEN-BAŞI sanity çapasıdır, 8 bedenlik bir kapı değil.**
Referans kalıbın kendisinin geçemediği kapı, kapı değildir.

Kaynak zaten bunu söylüyordu, biz yanlış okuduk:
`knowledge/drafting-math-eu38.md:38` — *"Armhole ÇEVRESİ Aldrich'te yok — çizilen
scye'den ölçülür. Sanity çapa: toplam armhole ~40-44cm (≈42), MED."*
Başlıktaki dosya adı **eu38**. Tek beden.

## İKİ AYRI BÜYÜKLÜK — bu gece bulundu, karıştırma
`knowledge/POM-TOLERANS-URBN-2026-08-23.md`:
- **TASARIM BANDI** — hangi blok. Aldrich 40–44cm. **Taban bedende** geçerli.
- **ÜRETİM TOLERANSI** — aynı bloğun kopyaları ne kadar ayrışır. URBN **AH01
  dokuma W1 = 3/16" = 4.76mm**, koda bağlı, yayınlanmış.
Bunlar farklı sorular. Tek kapıya sıkıştırılamaz.

## YAP — kapıyı üçe ayır
`engine/tests/garment_armhole_check.cpp` içinde:
- **K1 (taban beden):** EU38'de oyuk 40–44cm, dikiş çizgisinde. TEK beden.
- **K1b (grade tutarlılığı):** ardışık adım monoton VE URBN sevkiyat kuralına uyuyor:
  *"GARMENTS MUST HAVE AN APPARENT GRADE BETWEEN SIZES FOR SHIPMENT TO BE ACCEPTABLE"*
  → her adım > 0 ve max/medyan ≤ 1.6 (bugün 1.619, kıl payı).
- **K1c (üretim toleransı, PARİTE):** aynı spec iki kez üretilince fark ≤ 4.76mm
  (AH01 W1). Bu bir determinizm kontrolüdür, kaynağı yayınlanmış.

Buğra kolonu **PARİTE RAPORU (KAPI DEĞİL)** kalır (v5 §C).

## ★ İKİNCİ BULGU — beden kayması, bunu da çöz
F-F ölçtü: **Buğra'nın beden tablosu bizimkiyle aynı değil, +40mm büst ofseti var.**
Yani "aynı bedende" diye kıyasladığımız her satır aslında bir beden kaymış.
Aynı BÜSTTE kıyaslayınca bizim EU38 oyuğumuz Buğra EU36'nınkine **~5mm** yakınmış.

→ Parite raporu artık **beden etiketiyle değil BÜSTLE** eşleştirir. Tablonun başına
"eşleştirme büst üzerinden, etiket üzerinden değil" satırı yaz. Eski eşleştirmeyle
üretilmiş her sayı yeniden basılır.

## KAYNAKSIZ SAYI YASAK
Yeni eşik uydurma. K1/K1b/K1c'nin üçünün de kaynağı yukarıda satır satır yazılı.
Kaynağı olmayan bir şey eklemen gerekiyorsa `KAYNAKSIZ` etiketle.

## KAPI
- `garment_armhole_check` üç alt kapıya ayrılmış, her birinin kaynağı dosyada yazılı
- Buğra kalıbı K1c'den (üretim toleransı) geçmeli — geçmiyorsa neden, ölç
- Yeni kırmızı ad SIFIR
- Kapı hâlâ kırılabilir: bir eşiği gevşet → kırmızı düşmeli, kanıtı logla
