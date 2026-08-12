# G5 — omuz/kol oyuğu/yaka yüzeye iner (sonraki oturumun icra planı)

> Durum: TASARIM HAZIR, KOD YOK. Bu oturum (12 Ağu gece) strapless kılıfı
> 8 bedende iki hakemden yeşil geçirdi; elbiseyi "satılır" yapan son eksik bu.

## Mekanizma (mevcut motora eklemeler, ölçüldü/denendi değil — plan)
1. **Pürtüklü üst sınır (ragged grid):** `buildGrid`'e kolon başına tepe
   yüksekliği `hTop[j]`; satır i yüksekliği kolon başına ölçeklenir
   (bel satırı DEĞİŞMEZ — tek halka kanunu aynen). Mevcut kontur/koşu/pens
   makineleri olduğu gibi çalışır; `farEdges` armhole/omuz/yaka koşularına
   bölünür (waistRuns gibi `farRuns` + kırılım kolonları).
2. **Omuz halkası:** GarmentSurf'e 4. halka: yükseklik = napeZ − omuz düşüşü;
   genişlik yarı-ekseni `a_sh = boyun_yarı_genişliği + omuz_boyu·cos(13°)`
   (omuz boyu ölçüsü charttan: 12.25cm EU38; 13° FORMULAS.md varsayımı,
   Buğra'yla sınanacak); derinlik b vücut spline'ından.
3. **Dikiş planı:** omuz koşusu ön↔arka stitch (Shoulder türü); armhole +
   yaka SERBEST kenar (stitch yok); prenses/yan/bel aynen.

## SAYI KURALI (07-sleeve çöpünün dersi — tahmin YASAK)
- armscye DEPTH 21.0cm (EU38, knowledge/drafting-math-eu38.md, dikey düşüş).
- armhole ÇEVRE kapısı: 40-44cm bandı, ÖN eğri arkadan uzun/derin (knowledge).
- Yaka/armhole EĞRİSİNİN ŞEKLİ uydurulmaz: Buğra Locket-38 landmark'larından
  (patterns_real/geometry/geometry-full.json; ön oyuk 726→937, omuz 937→1001,
  arka omuz 0→65, oyuk 65→287) mm-parite ile kalibre edilir — G5'in tanımı bu.

## Kapılar
1. omuz dikişi çifti ≤0.79375mm (yapıdan ~0 beklenir).
2. armhole toplamı 40-44cm bandında; ön>arka.
3. Buğra landmark mm paritesi (rapor: parça-parça fark tablosu).
4. Tüm mevcut kapılar (halka, sınır, walk 8 beden) YEŞİL KALIR.
