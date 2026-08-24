# KART V5-B — BUĞRA ÜST ÜSTE BİNDİRME GÖRSELİ (kanıt klasörü)

## NE
İki konturu AYNI mm ölçeğinde ÜST ÜSTE basan bir PNG üreteci yaz; motorun
kalıbı ile satın alınmış kalıbın aynı bedendeki halkasını üst üste bindir,
yanına sayısal fark tablosu bas.

## ETİKET
PARALEL (V5-R2 ile). SÜRE TAVANI: 60 dk.

## NEDEN BU KART VAR (tek cümle, gerisi yok)
`GECE/V5-Z.md` §6.2 ölçtü: overlay'in üç parçası da repoda ayrı ayrı var,
BİRLEŞTİREN TEK KOMUT YOK. Eksik olan tam olarak bu üreteçtir.

## GİRDİ DOSYALARI (isim isim, başka dosya açma)
- ENV.md · RULES.md
- engine/tools/bugra-dump.cpp  (CMake hedefi `bugra-dump`, engine/CMakeLists.txt:349-350)
- GECE/f-d-kalip-plot.mjs      (mm'li SVG serici, contract/flat-convention-v1.json mürekkebi)
- engine/tools/raster.mjs      (SVG→PNG, headless Chrome)
- engine/tools/tracer/svg2png.mjs (SVG→PNG, @resvg/resvg-js)
- engine/tools/bugra/bugra-parity.mjs (mevcut SAYISAL kıyas; PNG basmıyor)
- engine/tools/tracer/ring-compare.py (hizalama usulü: bbox min köşesi)
- patterns_real/geometry/geometry-full.json  (SADECE JSON — PDF'e DOKUNMA)
- contract/flat-convention-v1.json

## YAPILACAK
1. `engine/tools/bugra/overlay-png.mjs` (TEK yeni dosya) yaz:
   - motor tarafını `bugra-dump` çıktısından okur (gerekiyorsa hedefi
     `cmake --build engine/build --target bugra-dump` ile kurar; Release);
   - Buğra tarafını `geometry-full.json`'un AYNI beden halkasından okur;
   - İKİSİNİ AYNI mm ölçeğinde tek viewBox'a serer (mm = mm, ölçek
     uydurma yok), iki farklı mürekkeple, üst üste;
   - hizalama usulü `ring-compare.py` ile AYNI olsun (bbox min köşesi,
     serbest parametre YOK) ve bu usul dosya başlığında yazılı olsun;
   - PNG'yi mevcut rasterlayıcılardan biriyle basar (yeni rasterlayıcı YAZMA).
2. Fark tablosu bas (PNG değil, metin): parça başına bbox genişlik/yükseklik
   farkı mm, çevre farkı mm ve %, hizalama sonrası en büyük nokta sapması mm.
3. locket_top ve corset_bustier'in ELDEKİ parçaları için EU38'de koştur.
   `bugra-dump`'ın modu Buğra-36 gövdesindeyse o bedeni kullan ve HANGİ
   BEDEN olduğunu çıktıya yaz — beden uyuşmazlığını GİZLEME, raporla.

## YASAKLAR
- Bu bir KAPI DEĞİL. Test yazma, `engine/CMakeLists.txt`'e dokunma,
  `add_test` ekleme. Çıktın kanıt klasörüdür, hüküm değil.
- Hiçbir kapı Buğra'ya benzerlikle kurulamaz (v6 §7.3). Fark tablosu
  BİLGİDİR, eşik değildir; "sapma şu kadar, demek ki kalıp yanlış" YAZMA.
- `patterns_real/` altındaki PDF'lere dokunma (kalıcı veto).
- Yeni rasterlayıcı / yeni bağımlılık kurma. Var olanı kullan (§7.5: önce grep).
- Mevcut hiçbir test/alet dosyasını değiştirme.

## ÇIKTI
- `engine/tools/bugra/overlay-png.mjs`
- `GECE/log/V5-B.overlay/*.png` (parça başına en az bir PNG, YOLU raporda)
- `GECE/log/V5-B.fark-tablosu.txt`
- `GECE/V5-B.md` — yapılan (dosya yolu + commit hash) · ölçülen (sayı + onu
  basan komut) · yapılamayan (sebep) · kart dışı fark edilen (dokunma, yaz).
"Baktım / doğru görünüyor" YASAK (RULES 3): PNG yolu ya da komut çıktısı.
Bitince commit at (lowercase english), hash'i rapora yaz.
