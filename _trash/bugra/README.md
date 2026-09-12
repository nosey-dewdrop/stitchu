# BUGRA REFERANSI

Motorun yan dikis oran dizisi tek bir satin alinmis kaliptan olculdu:
`patterns_real/` altindaki **Locket Top**, **EU38**, **Back Body** parcasi. Arka beden
secildi cunku arka orta kenari tam dikey (90.00 derece, 413.97 mm duz kosu) ve on bedenin
aksine pens/placket parcanin dis konturunu kirletmiyor; yari-genislikler arka-ortadan
olculdu. Olculen ham degerler (mm): shoulder 196.13 · chestMax 204.94 · waistMin 157.46 ·
hem 179.22 · shoulderToHem 413.97. Gogse normalize edilince dizi 0.9570 / 1.0 / 0.7683 /
0.8745 cikiyor — omuz orani **196.13 / 204.94 = 0.9570**. Bu sayilarin hepsi zaten
`contract/flat-convention-v1.json` icinde `figure.sideSeamProfile` altinda duruyor
(`_measuredMM`, `_normalizedToChest`, `shoulder`, `hemRisePerU` 0.1881); ayni dosyada
`sleeveLaw.puffHemOverWidestMax` 0.9327 de ayni kaliptan, Alt Kol parcasindan olculdu.
Bu klasor o olcumu **tekrarlamaz**, sadece kaynagini isaret eder — tek dogru nusha
contract dosyasidir. Kalibin kendisi satin alinmis, telifli: `patterns_real/`
.gitignore'da, diskte kalir, repoya girmez.
