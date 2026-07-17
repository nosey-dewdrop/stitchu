# stitchu — RAY 1 / LOOP R1.2: JACKIE KOMBO (patch 3.7)

> Gecenin büyük motor işi (DEVAM-RAY-LOOP.md R1.2). İKİ dal TEK oturumda: (a)
> asimetrik düğme patı + (b) cap sleeve. Kombo ŞARTTI — Jackie gingham fotoları
> iki öğeyi BİRDEN bekliyor, tek başına biri +1/+0. Beklenen +6 → ~37/54;
> çıkan +6 → 37/54.

## SONUÇ (ölçülü, uydurma yok)
- **FULL PATTERN: 31 → 37/54 (+6)** — altı Jackie gingham fotoğrafı. Cache
  reclassify, **0 vision çağrısı, kredi harcanmadı** (motor loop'u; DRAWN_SINCE'e
  asimetrik-pat + cap-sleeve kuralları eklendi, results snapshot yazıldı).
- **ELEMENT ACCURACY: 60 → 71/103 (%58.3 → %68.9, +11)** (iki term × 6-7 foto).
- vision-accuracy %94.4 DEĞİŞMEDİ (doğru — motor loop'u, worker vision'a dokunulmadı).
- **golden BYTE-IDENTICAL: 0.000000 mm / 23034 satır** (iki dal da off default).
- **ctest 22/22** (yeni placket_asym_check + cap_sleeve_check), **web-fuzz
  20190/0**, **vocab-sweep 37800/0**, engine_check + cutline_check + fit_proof PASS.

### Attribution — tam +6, hangi fotolar (cache reclassify + manifest replay ile kanıtlı)
Altı Jackie gingham fotoğrafı MISSING→FULL:
- **13.48.11** (cover): oov = asymmetric button front + cap sleeve → BOTH
- **13.48.13** (worn): asymmetric + cap sleeve → BOTH
- **13.48.15** (macro): asymmetric button front YALNIZ → tek asimetrik pat
- **13.48.17** (back): asymmetric + cap sleeve → BOTH
- **13.48.19** (front worn): asymmetric + cap sleeve → BOTH
- **13.48.21** (polka blouse): asymmetric + cap sleeve → BOTH
- **KOMBO ŞARTI KANITI:** 6 fotonun 5'i İKİ term'i birden istiyor. Tek dal ship
  edilse: asimetrik-pat solo yalnız 13.48.15'i çevirirdi (+1); cap-sleeve solo
  hiçbirini (0, çünkü her cap-sleeve fotosunda asimetrik-pat da eksik). İki dal
  birlikte → +6. Sızıntı=0: başka hiçbir garment fotosu bu iki term'e match etmedi
  (izole manifest replay ile teyit).

## NE YAPILDI

### (b) CAP SLEEVE (sleeve.hpp/.cpp, SleeveCap::Cap)
Cap sleeve düz kısa kol DEĞİL — omzun üstünü örten, koltuk altında sönen, dikişsiz
bir KANAT. Motor sıradan takma kol başını KORUR (genişlik/cap-height fitting plain
ile birebir, spread 0, rise 0 → cap kenarı armhole'a 1:1 oturur, set-in olur), ama
gövdeyi hem'e indirmek yerine dış kenarı crown'un capWingDepth=55 mm altında sığ bir
yay yapıp koltuk altına döner. Tek parça cut 2, iki crown çentiği, merkez grainline.
Guide: dış kenarı temizle, cap'i armhole'a yerleştir (dikilecek dikiş yok). Plain
default → byte-identical (Cap dalı erken return, full-sleeve gövde atlanır).

### (a) ASİMETRİK DÜĞME PATI (placket.hpp/.cpp, PlacketStyle::Asymmetric)
Mevcut PlacketBlock'u offsetMM parametresiyle genişlettim. offsetMM==0 = klasik
simetrik CF pat, HER ifade eski değere çöker → BYTE-IDENTICAL. Asymmetric (offset
55 mm): fold çizgisi foldX=-offset'e, grown ön kenar -(standWidth+offset)'e, facing
foldX+standWidth'e, düğmeler foldX üstünde, ilikler foldX-3mm'den kayar; GERÇEK CF
(x=0) referans çizgisi olarak da işaretlenir. Guide: mirror alt-ön aynı offset'le
kesilir (bindirme). Legacy frontPlacket bool simetrik için korundu (Standard/None
onu aynalar); Asymmetric bool'suz da çizer.

### Test (ctest 22/22, iki yeni check)
- **cap_sleeve_check**: cap kenarı == plain sleeve cap kenarı (<0.5mm, armhole 1:1),
  cap wing plain kısa koldan kısa (wing, gövde yok), aynı parça sayısı (cap kolun
  yerini alır, eklemez), her non-sleeve parça byte-identical, cap+asimetrik-pat
  kombo valid.
- **placket_asym_check**: Standard placketStyle == legacy frontPlacket bool BYTE-
  IDENTICAL (regresyon bekçisi), asimetrik ön hem bare'den hem simetrikten farklı,
  grown kenar offset kadar dışarı, fold off-center -offset'te, gerçek CF referans
  çizili, asimetrik bool'suz çizer, skirt honest skip.

### Köprü (L2/L3, cerrahi)
- **measurements.hpp:** SleeveCap enum'a Cap (4. değer); GarmentSpec.placketStyle int.
- **garment.cpp:** placket post-pass'i (frontPlacket || Standard || Asymmetric)
  koşuluyla, asimetrik ise asymOffset geçer; DressBlock+TopBlock guide step'lerinde
  Cap için ayrı not (gather değil, kanat).
- **bindings.cpp:** sleeveCapFrom'a 3=Cap; buildSpec + draftJSON + gradeJSON'a
  trailing `placketStyle` param (embind trailing 0 default → mevcut çağrılar geçerli).
- **engine.js:** SLEEVE_CAP'e cap:3, placketStyleValue (bool ↔ enum köprüsü),
  draft+grade çağrılarına trailing arg.
- **backend/draft.js:** ENUMS sleeveCap'e 'cap' + placketStyle whitelist, SLEEVE_CAP
  cap:3, placketStyleInt, spec normalize + iki wasm çağrısına param.
- **create.js:** sleeveCap picker'a 'cap', yeni placketStyle picker, pickPlacket
  helper, sleeveHead==='capped'→'cap' map, seen.capSleeveDrawn + placketAsymDrawn +
  closureDrawn (asimetrik dahil).
- **missing.js:** sleeveHead 'capped' capSleeveDrawn ile suppress, outOfVocab
  asymPlacketTerm + capSleeveTerm suppression.
- **benchmark-58.mjs:** placket kuralından asymmetric guard'ı kaldırdım + ayrı
  asimetrik-pat kuralı; sleeve kuralından cap-sleeve guard'ı kaldırdım + ayrı
  cap-sleeve kuralı; reclassify artık dosyaya persist ediyor (0-çağrı snapshot).
- **İki wasm yeniden derlendi** (build-wasm.sh browser + worker hedefi).

### Vitrin (patch 3.7)
- **patches.html:** patch 3.7 ("now"), EN/TR, delta rozeti (31→37), honest not
  (kombo neden şart + plain-only sınır), 3.6 "now"→normal demote.
- **index.html:** galeri sayacı 31 → 37.
- **?v 73 → 74** tüm sayfalar (46 dosya) + js import 58→59. style-lint temiz
  (53 sayfa + 7 css), header-diff temiz (46 sayfa).

## RENDER-ONAY (Damla EMRİ, gözle teyit)
jackie-asym-cap-dress spec'i render-pages.mjs ile çizildi (11 parça, "Cap Sleeve"
dahil, 0 issue, 22 sayfa). strip.svg Chrome headless PNG → Read ile gözle bakıldı +
front-center & cap sleeve close-up PNG (CF referans çizgisi yeşil):
- **Cap Sleeve:** üstte armhole-matched cap S-eğrisi, altta sığ konkav yay koltuk
  altına dönüyor, iki crown çentik, merkez grainline. Kısa KANAT, tüp değil. ✓
- **Bodice Center Front:** grown kenar + fold çizgisi + iliklerin hepsi yeşil CF
  referansının SOLUNDA (offset kadar kaymış); grown kenar simetrikten daha dışarı. ✓
- Parçalar kopuksuz, sayfa sınırında hat kopması yok, register/grainline/cut çizili.

## DÜRÜST SINIRLAR (çizilmeyen, honest kalan)
- Asimetrik pat: sadece FRONT offset stand. Back/double-breasted/wrap asimetrik → honest.
- Cap sleeve: sadece plain düğme-patlı kanat. Pileli/draje/dropped/off-shoulder → honest.
- No front bodice (etek) → asimetrik pat honest skip (sessiz no-op yok).

## MİKRO-LOOP açıldı mı
- **MİKRO-LOOP: Standard placket == legacy bool regresyonu.** İlk garment.cpp
  koşulu `frontPlacket || asymPlacket` idi → placketStyle=Standard (bool false) HİÇ
  pat çizmedi. Çözüm: koşula `placketStyle==Standard` eklendi. placket_asym_check
  regresyon bekçisi bunu yakaladı, yeşile döndü. Dönüş: kaldığım yere.
- **MİKRO-LOOP: cap wing derinliği zayıf ayrım.** İlk capWingDepth=75 mm → cap
  yüksekliği (175mm) plain kısa koldan (190mm) yalnız 15mm kısaydı, "kanat" ayrımı
  zayıf. Çözüm: capWingDepth 75→55 (couture cap wing zaten modest, ~55mm); ayrım
  35mm'ye çıktı, test yeşil, gerçek kanat. Dönüş: kaldığım yere.

## SIRADAKİ (RAY 1)
R1.3 Denetim C (bağımsız denetçi: golden regen+diff, ctest, reclassify, DRAWN_SINCE
sızıntı taraması). R1.4 FAZ P primitif katmanı Damla uyanıkken.

## DEPLOY
main e6d886a → subtree split f5817ab → force gh-pages. Canlı curl teyit: index
sayaç 37, patches 3.7 "31 of 54 to 37 of 54", HTTP 200. Worker VISION prompt/şeması
DEĞİŞMEDİ → /api/analyze redeploy GEREKMEZ; /api/draft+grade worker-wasm cap+asym
destekli yeniden derlendi.
