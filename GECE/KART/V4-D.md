# KART V4-D — ESKİ | YENİ PANOSU: konvansiyonun görünen karşılığı

ETİKET: SIRALI (tur 4; V4-A ve V4-B commit'lendikten sonra)
SÜRE TAVANI: 50 dk

## NE
Bu gece konvansiyon kapısı iki kök düzeltme aldı (omuz çıkarımı + kol ifadesi).
Damla'nın hükmü için ESKİ|YENİ yan yana pano BASILACAK. Hüküm onundur; senin
işin karşılaştırmayı kırpmasız, aynı düzende, aynı stillerle basmak.

## ÖLÇÜLMÜŞ ZEMİN
- ESKİ pano zaten diskte: `GECE/log/V4-C.pano/board-eski-1.png` ve
  `board-eski-2.png` (10 hücre, 9 stil + shell-flat). Düzen tarifi
  `GECE/V4-C.md` sonunda.
- Üreteç: `engine/tools/flat-board.mjs`. V4-C'nin notu:
  `node engine/tools/flat-board.mjs <out> --yeni <svgDizini>` sağ sütunu
  `<stilAnahtarı>.svg`'lerden doldurur, satır sırası aynı.
- ESKİ tarafın commit'i `c396fb4`; YENİ taraf bugünkü HEAD.

## YAPILACAKLAR

1. **YENİ tarafı bas.** Bugünkü HEAD'le aynı 10 hücreyi üret ve panonun sağ
   sütununa koy. ESKİ sütun `c396fb4`'ün çıktısı olmalı — panoya ESKİ diye
   bugünkü çıktıyı koyarsan pano YALAN olur. ESKİ SVG'ler
   `GECE/log/V4-C.pano/` altında duruyor; oradan al, YENİDEN ÜRETME.
2. **Kol ailesini ayrı bir satır olarak ekle** (bu gecenin asıl görünen
   farkı): aynı taban spec'te `sleeveStyle` none/set/raglan/puff/cap —
   ESKİ (üçü aynı) | YENİ (beşi farklı). PNG'ler
   `GECE/log/V4-B.kol/sleeve-*.png` olarak zaten var; panoya ESKİ karşılığıyla
   birlikte koy.
3. **Kırpma, retuş, yeniden çizim YOK.** Çıktı neyse o. Bir hücre çirkinse
   çirkin basılır; §4.7 gereği yanına EN AZ BİR geliştirme yolu YAZILIR
   (panoya değil, `GECE/V4-D.md`'ye).
4. **Konvansiyon kapısını tam stil matrisinde koştur** ve sayıyı bas:
   `node engine/tests/flat_convention_check.mjs` ·
   `node engine/tests/flat_expresses_spec_check.mjs` ·
   `node engine/tests/flat_geometry_sellable_check.mjs`
   Üçünün çıktısı `GECE/log/V4-D.kapilar.txt`'ye.
5. **§6/V4'ün BEŞ MADDESİ, madde madde bugünkü hâli** — tabloyu
   `GECE/V4-D.md`'ye yaz: madde · bugün ölçülen sayı · kapıya bağlı mı ·
   açık kalan. Beşinci madde (artefaktın kökü düzeltilir, kırpmayla
   gizlenmez) için: bu gece hiçbir artefakt kırpmayla gizlendi mi — ölç ve
   cevapla. Detay callout bugün **0**; üretimi yapılmadı, kuyruk kalemi
   olarak yaz.

## GİRDİ DOSYALARI (isim isim)
KOŞTURURSUN: `engine/tools/flat-board.mjs` · `engine/tests/
flat_convention_check.mjs` · `flat_expresses_spec_check.mjs` ·
`flat_geometry_sellable_check.mjs`
OKURSUN: `GECE/V4-C.md` (pano düzeni) · `GECE/V4-A.md` · `GECE/V4-B.md` ·
ENV.md · RULES.md
YAZARSIN: `GECE/V4-D.md` · `GECE/log/V4-D.*` · `GECE/log/V4-D.pano/`
Zorunlu olmadıkça `engine/tools/flat-board.mjs` dışında kaynak dosyaya
dokunma; dokunursan gerekçesini yaz.

## ÇIKTI
- `GECE/log/V4-D.pano/board-eski-yeni-*.png` — **her PNG'nin TAM YOLU**
  raporda (RULES 3: yol yoksa adım yapılmamıştır)
- `GECE/V4-D.md` — beş madde tablosu + pano yolları + §4.7 geliştirme yolları
- commit + push, hash raporda

## YASAKLAR
- Telifli görsel indirme / panoya başkasının görselini koyma (§7.2).
- "Buğra'ya benziyor mu" ölçüsü kurma (§7.3); zevk ölçütü Buğra DEĞİL.
- Hüküm verme ("oldu / Etsy'lik"). Zevk hükmü yalnız Damla'nın (§7.6).
- Kırmızı AD kümesini büyütme (RULES 9); kontrol `GECE/log/V4.ctest.before.txt`
  (6 ad: contract_check · figure_check · flat_artifact_census ·
  flat_pattern_agree_check · sizechart_source_check · style_check).
- Yeni kaynak dosya AÇMA.
