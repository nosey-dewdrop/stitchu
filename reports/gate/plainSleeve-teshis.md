# plainSleeve TEŞHİS (FAZ 1a, 2026-07-21)

## Gecenin şikayeti
Kol kısa+kabarık, koltukaltı seam hem'e garip kavisli bağlanıyor.

## Mevcut geometri (plainSleeve fonksiyonu)
- outX = stX + sleeveWidth·S (id65: sleeveWidth=7 → geniş)
- hemY = stY + sleeveLen·S (id65: sleeveLen=10 → ÇOK KISA)
- wristX = outX − sleeveWidth·S·0.14 (hafif daralma)
- 4 segment: omuz→cap, cap→bilek dış, bilek kavis, iç kenar→underarm

## Emsal ölçümü (ar-202430-4 Delilah short-sleeve, 11-1 long-sleeve jacket)
- Kol omuzdan DÜZ-hafif konik iner (balon DEĞİL)
- Kısa kol boyu ≈ korsaj boyunun 1/4; uzun kol ≈ 3/4
- Bilek genişliği ≈ omuz genişliğinin %70 (hafif daralma, %14 değil)
- Koltukaltı: yumuşak kavis, gövdeye temiz bağlanır (garip kavis yok)

## Teşhis (sayıyla)
1. KISALIK: sleeveLen=10 çok küçük. Kısa kol için ≈16-18 (korsaj ~1/4), uzun ≈40.
2. KABARIKLIK: sleeveWidth=7 geniş + cap segmenti (stY-1 yükseltme) hafif balon. Düz kol cap yükseltmesi 0 olmalı.
3. KOLTUKALTI GARİP: 3. segment (wristX→uaX+8 kavis) hem çizgisiyle çakışıyor. İç kenar bileğten underarm'a DÜZ inmeli, kavis yumuşak.

## Düzeltme yönü (kıyas döngüsünde uygulanacak)
- sleeveLen: kısa=17, uzun=42 (topLength gibi sleeveLength→değer map)
- cap yükseltme kaldır (omuz düz başlasın)
- bilek daralma %30 (omuz·0.7)
- iç kenar düz + yumuşak koltukaltı kavis
