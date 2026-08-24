# F-G — ALTI EKSİK MALZEME (çıktı kesilemiyor)
`GECE/KART/ORTAK.md` oku. Sonra bu kart.

## NE
`knowledge/TEKNOLOJI-2026-08-23.md` ölçtü: dünyada TEMEL sayılan 6 malzeme bizde
HİÇ YOK. Ajanın cümlesi: **"bunlar olmadan çıktı kesilemez."**
Alıcı kalıbı basıp makasa gidemiyor.

| eksik | dünyadaki karşılığı |
|---|---|
| dikiş payı | FreeSewing `sa` · ASTM katman 14 |
| grain line | ASTM katman 7 · FreeSewing `grainline` |
| notch | ASTM'de 5 ayrı tip: katman 4/80/81/82/83 |
| cut-on-fold | ASTM katman 6 (mirror line) |
| bölge-bazlı ease | FreeSewing `seatEase`/`sleeveEase` (bizde `fabric: woven\|knit` iki kelime) |
| ruffle katsayısı | GarmentCode'da her Interface'in özniteliği (bizde sayı yok) |

## YAP
1. Altısını `contract/primitives-v1.json`'a Katman-1 malzemesi olarak ekle.
   Her biri ASTM/FreeSewing karşılığıyla, kaynak satırıyla.
2. Motorda üretilir hâle getir — en az **dikiş payı + grain line + cut-on-fold**
   çizilen çıktıya girsin (SVG/PDF'de görünsün).
3. Kapı: `engine/tests/cuttable_output_check` — EU38 Locket çıktısında
   dikiş payı var mı, grain line var mı, katlama çizgisi işaretli mi, çentikler
   eşleşiyor mu. ANTI-HACK: birini sil → KIRMIZI düşmeli, kanıtı logla.

## SIRA
Bu, `F-I` foto→kalıp hattından ÖNCE gelir: kesilemeyen bir çıktıyı üretmenin
hızlanmasının değeri yok.
