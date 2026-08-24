F-D FLAT KONVANSIYONU — OLCUM KARTI (2026-08-22T22:20:51Z)

== ENVANTER (grep, ikinci kalem DOGURULMADI)
  1 engine/tools/render-garment-flat.mjs   URETIM parametrik kalemi        CANLI  <- F-D bunu konvansiyona soktu
  2 engine/flat-engine/_engine-full.mjs    REFERANS kalem, 31 stil         CANLI, SALT-OKUNUR (Damla 2026-07-19)
  3 engine/tools/atolye/ingredients.js     collarOverlay()                 CANLI (atolye)
  4 engine/tools/atolye/foldlines.js       flFoldOverlay()                 OLU ama bundle'a giriyor
  5 engine/tools/render-flat.mjs           drawPiece/renderScattered       CANLI (kalip parcasi yerlesimi)
  6 engine/tools/tracer/trace-flat.py      rasterden SVG                   CANLI
  7 web/atolye.html                        2+3+4'un uretilmis kopyasi      URETILMIS
  (kaynak sayim: GECE/F0-D1.md md.3; bu gece yeniden dogrulandi)

== CROQUIS SAPMASI (uretim kalemi, 8 stil x 2 panel = 16 olcum)
  olcut          ONCE          SONRA
  omuz ucu x     0.00 mm       0.00 mm
  omuz ucu y     21.30 mm      0.00 mm    <- kok: shoulderTipY YAKANIN genisligine bagliydi
  gogus x        0.00 mm       0.00 mm
  gogus hatti y  0.00 mm       0.00 mm
  bel hatti y    153.00 mm     0.00 mm    <- empire artik BEYAN ediliyor ve kapi beyani dogruluyor
  kaynak: GECE/log/F-D.gate.before.txt vs GECE/log/F-D.gate.after.txt

== ALTI SART
ok    5 on+arka — 8 stilin hepsinde front+back paneli var
ok    1 croquis — omuz ucu x             min 78.000u  max 78.000u  SAPMA 0.00 mm
ok    1 croquis — omuz ucu y             min 19.400u  max 19.400u  SAPMA 0.00 mm
ok    1 croquis — gogus (koltukalti) x   min 73.300u  max 73.300u  SAPMA 0.00 mm
ok    1 croquis — gogus hatti y          min 92.000u  max 92.000u  SAPMA 0.00 mm
ok    1 croquis — bel hatti y (dogal)    min 150.000u  max 150.000u  SAPMA 0.00 mm
ok    1 croquis — vneck_empire_dress/front empire beyani gercek: siluet beli 99u, dogal belden 153.0mm yukarida
ok    1 croquis — vneck_empire_dress/back empire beyani gercek: siluet beli 99u, dogal belden 153.0mm yukarida
ok    1b beyan == cizilen == kanun
ok    2 olcek — gogus yari-genisligi 219.90 mm == bustCM/4 220.00 mm (burda EU38, verified)
ok    3 hiyerarsi — 5/5 sinif beyanli ve kullanilmis: outline, topstitch, seam, mark, hidden
ok    6 renk — tek murekkep #1f3a5f

== CTEST
  once : 6 kirmizi / 98  (style_check sizechart_source_check contract_check preview_truth_check figure_check h10_gate_check)
  sonra: 6 kirmizi / 99  (AYNI ALTI) + flat_convention_check YESIL. YENI KIRMIZI 0.
