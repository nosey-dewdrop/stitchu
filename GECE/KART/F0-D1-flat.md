# KART F0-D1 — FLAT ↔ KALIP + FLAT KALEM ENVANTERİ
(F0-D tur tavanında kesildi, hiçbir şey yazmadı; ikiye bölündü. Bu 1/2.)

## NE
Flat kalıptan mı türüyor, flat kaç ayrı kalemden çıkıyor — ölç.

## GİRDİ DOSYALARI
- engine/tools/render-garment-flat.mjs
- engine/flat-engine/_engine-full.mjs
- engine/tools/render-flat.mjs, engine/tools/render-pages.mjs
- contract/tables.json  (flat._layer beyanı)

## ÖNCE GREP
- `grep -n "_layer" contract/tables.json`
- `grep -rn "flat-engine\|_engine-full" engine/ --include=*.mjs --include=*.js`

## YAPILACAK
1. Flat, kalıbın geometrisinden mi türüyor yoksa ayrı şablondan mı?
   Render hattının KAYNAĞINI okuyarak söyle, dosya:satır ile.
2. Aynı spec'ten üretilen flat ile kalıbın ORTAK ölçüsü: en az hem/bel oranı,
   iki hat için ayrı sayı. Ortak birim var mı — contract/tables.json'daki
   flat._layer beyanını AYNEN alıntıla.
3. Flat kaç ayrı üreticiden çıkıyor — her kalemi dosya yoluyla say.
4. engine/flat-engine/_engine-full.mjs içindeki stil-pinli SERT KODLANMIŞ
   kaçışları satır numarasıyla listele (256 civarı bilinen bir yer, ama
   dosyanın tamamını tara — sayıyı sen ölç).

## ÇIKTI
`GECE/F0-D1.md`. İLK İŞİN bu dosyayı başlıklarla AÇMAK; her maddeyi
bitirdikçe hemen dosyaya EKLE. Sonda tek seferde yazma — kesilirsen
yazdığın kalsın.

## YASAKLAR
- Hiçbir kaynağı/testi değiştirme, yeni test yazma, commit atma.
- reports/, Logs/, HEDEF.md okuma.
- Kaynağı okumadan "şunu yapıyor" yazma.

## SÜRE TAVANI
maxTurns 40. Kesilirsen dosyanın sonuna "KALAN İŞ" yaz.
