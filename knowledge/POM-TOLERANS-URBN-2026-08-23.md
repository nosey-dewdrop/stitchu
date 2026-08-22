# Sanayi POM sözlüğü + TOLERANS TABLOSU — yayınlanmış, markaya ait

**Bu dosya v5 §C'nin aradığı şeydir: yayınlanmış bant.** Buğra parite raporu,
Aldrich tek nokta çapası; bu ise kod-başına tolerans matrisi. Kapı kurulabilir.

## Kaynak — URBN (Urban Outfitters / Anthropologie / Free People), tedarikçi sitesi, login yok
İndeks: https://vendor.urbn.com/us/ownbrand-vendors/apparel-requirements/apparel-technical-manual
"DTA How 2 Measure Guide", 226 sayfa, kodlu POM sözlüğü:
https://assets.ctfassets.net/6ufjjlh0gzjl/4bS0G4SQClcvmAmktkSAk7/c172a73b3b98835257761325b8c4d930/Section_V_-_How_to_Measure.pdf
Tolerans tablosu (Ağu 2026 güncellemesi):
https://assets.ctfassets.net/6ufjjlh0gzjl/3gPz9bL4Aay8KNxkYx1Iuo/78353d9c06693ec62847956c92835544/update_August_2026_Apparel_Technical_Manual_Section_.pdf

⚠ PDF'ler "Copyright Urban Outfitters, Inc." taşıyor. **Repoya İNDİRİLMEZ** (§0.11).
Ölçü sayıları ve yöntem cümleleri burada kaynağıyla alıntılanır; dosya kopyalanmaz.

## TOLERANS MATRİSİ — inç, düz ölçüm üstünden
KNITS K1/K2/K3 × WOVENS W1/W2/W3. Bizim ilgilendiklerimiz:

| POM kodu | ölçü | K1 | K2 | K3 | W1 | W2 | W3 |
|---|---|---|---|---|---|---|---|
| AH01 | **Armhole – düz** | 3/8 | 1/2 | 3/4 | **3/16** | 1/4 | 3/8 |
| HF01 | **Neck Width** | 3/8 | 1/2 | 3/4 | **1/4** | 3/8 | 1/2 |
| HF07 | Across Shoulder | 1/2 | 3/4 | 1 | 1/4 | 3/8 | 1/2 |
| HF08 | Across Chest | 1/2 | 3/4 | 1 | 1/4 | 3/8 | 1/2 |
| HB04 | Across Back | 1/2 | 3/4 | 1 | 1/4 | 3/8 | 1/2 |
| HF09-12 | Chest/Waist | 1/2 | 3/4 | 1 | 1/4 | 3/8 | 1/2 |
| SS09 | Sleeve Width 1" below AH | 3/8 | 1/2 | 5/8 | 1/8 | 1/4 | 3/8 |
| VF04 | Body Length @CF from HPS (<28") | 5/8 | 7/8 | 1 1/4 | 3/8 | 1/2 | 1/2 |
| PT03 | Thigh @1" below crotch | 1/2 | 5/8 | 3/4 | 1/4 | 1/2 | 5/8 |
| — | Position points, ölçü <5" | 1/8 | 1/4 | 1/4 | 1/8 | 1/8 | 1/8 |

**Dokuma Seviye 1 tanımı (birebir):** "All non-washed & light wash fabrics / All men's
soft woven shirts / Non-washed or light washed denim / Lycra fabrics under 2%."
**Örme Seviye 3:** "Crinkle fabrics / Sweaters under 4 gauge / Heavy hand knit + crochet."

**İki kural (birebir):**
- "GARMENTS MUST HAVE AN APPARENT GRADE BETWEEN SIZES FOR SHIPMENT TO BE ACCEPTABLE"
  → Bu, bizim adım/grade kapımızın sanayideki karşılığı.
- "ALL WAIST POMS OR ANY OTHER POM THAT HAS BEEN STABILIZED REMAINS AT LEVEL 1 TOLERANCE."

AQL: MIL-STD-105D. Urban final audit 4.0 · Anthropologie 2.5 · in-process 2.5.

## BİZE NE VERİYOR

**1. Kol oyuğu kapısı artık iki katmanlı olabilir.**
Aldrich 40–44cm = **tasarım bandı** (hangi blok). AH01 W1 = **3/16" = 4.76mm** =
**üretim toleransı** (aynı bloğun iki kopyası ne kadar ayrışabilir). İkisi farklı şey.
Bugünkü açığımız (EU38'de bandın ~2cm altında) tasarım bandı meselesi; grade
tutarlılığı ise AH01 toleransıyla ölçülür.

**2. Yaka:** HF01 W1 = 1/4" = 6.35mm.

**3. Kodlu POM şeması (AH01, HF09, SS09…) makine-okunur bir sözlüktür.**
Her ölçüye sabit ID, aynı ID ile tolerans tablosuna join. F-C mutfağının Katman-1
malzemesi buraya bağlanabilir — isim değil KOD taşıyan bir sözlük.

**4. Ölçüm yöntemi cümleleri, "nereden nereye" belirsizliğini kapatıyor.** Örnek:
- AH01: "Lay garment flat. Measure from top to bottom of armhole straight."
- AH04: "Measure straight from HPS to the armhole."
- DT05 Bust Dart Length: "measure from the side seam along the length of the dart to the dart apex."

## İKİNCİ KAYNAK — Orvis, "Methods of Measuring"
https://cdn.orvis.com/files/OrvisMethodsOfMeasuringNov10.pdf
Tolerans YOK ama yöntem çok net. Kritik kural (birebir): "**knit tops given as half
circumference; knit pant, knit skirt and all woven items given as full circumference**."
Ayrıca: 14e Armhole Depth = "straight down from HPS to a level perpendicular to underarm",
19 Shoulder Slope = "straight down from HPS to shoulder fold at armhole seam",
21 Sleeve Cap Height (iki yöntem). Kasım 2010, yöntemler stabil ama doküman eski.

## SEKTÖR SABİTİ — 1 inç altı koltukaltı
Orvis · LAT · Gildan · Hanes · Stormtech · Bella+Canvas hepsi "1" below armhole".
Stanley/Stella metrik karşılığı **2.5cm**. Kanonik POM çapası olarak güvenli.

## KAPALI OLANLAR — açıkça yazılıyor, bir daha aranmasın
Inditex/Zara/Bershka · H&M · Primark · Next · M&S · Tesco · ASOS · Boohoo · Shein ·
Walmart · Target · Gap · Nike · Adidas · Uniqlo · Decathlon: ölçü standardı
**yayınlanmıyor**. Dolaşan Scribd kopyaları sızıntı, resmî barındırma değil, kaynak
sayılmaz. Walmart kendi public manualinde açıkça Retail Link login'ine yönlendiriyor.

## DOĞRULANMADI
- MIL-DTL specs (ör. MIL-DTL-44048H) bitmiş-ölçü tabloları + tolerans taşıyor ve
  **gerçekten kamuya açık** (quicksearch.dla.mil) — ama bu turda çekilemedi (404/403).
  **En büyük işlenmemiş damar:** hem public, hem hukuken serbest, hem tolerans-tam.
- DLA "How to Measure for Military Uniform" (21 Oca 2020) 403 verdi. Ayrıca o bir
  VÜCUT ölçüsü kitabı, garment POM değil.
- TM 10-227 çekilmedi.

## YAN BULGU — sanayi nerede otomatikleşmiş
URBN Ağu 2026 güncellemesi tedarikçiden şunu istiyor: "Ai render"ı sanal numuneye
çevir, CLO tercih edilir, **shrinkage'sız DXF kalıbı** her numune için Tradestone'a
yükle, blok kütüphanesi style.clo-set.com/room/836052. Yani alıcı tarafı DXF + sanal
numuneyi zaten şart koşuyor — bizim çıktı formatımızın hedefi bu.
