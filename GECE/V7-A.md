# V7-A — KENAR KİMLİĞİ + DİKİŞ ÇİFTİ: BUGÜN NE VAR (ÖLÇÜM, 2026-08-25)

Kart: `GECE/KART/V7-A.md`. Ölçüm kartı — kaynak dosyaya dokunulmadı, yeni alet
yazılmadı. Her sayı aşağıdaki komutların BASTIĞI sayıdır.

---

## S1 — KENAR KİMLİĞİ

**CEVAP.** `PatternPiece` bir kenar ADI TAŞIMIYOR; sevk edilen artefaktta
adlandırılmış kenar sayısı **0**, ve kol oyuğu↔kapak eşleşmesi bugün üç ayrı
tahminle kuruluyor — PARÇA adının alt-dizgi araması (`"Sleeve"` içeren ilk
parça), sabit KOMUT İNDEKSİ (`commands[0..2]`), ve oyuk tarafında hiç geometri
değil bir SKALER devri (`bodice.armholeLength`).

**KANIT (dosya:satır).**
- `engine/src/geometry.hpp:40-71` — `PatternPiece` alanları: `name`,
  `cutInstruction`, `commands`, `markings`, `cutLine`, `notches`, `closure`,
  `hasGrainline`, `grainline`, `seamAllowance`, `onFold`, `foldLine`.
  **Kenar adı / kenar kimliği / dikiş kimliği alanı YOK.** `name` PARÇA adıdır.
- `engine/src/validator.cpp:280-286` — kol parçası ADLA aranıyor:
  `if (contains(piece.name, "Sleeve") && !contains(piece.name, "Cuff"))` →
  ilk eşleşen parça. Bu bir PARÇA adı eşlemesidir, kenar adı değil.
- `engine/src/validator.cpp:289-295` — kapak kenarı İNDEKSLE alınıyor; kodun
  kendi yorumu: `// Cap = move(capLeft) + the two cap curves, a stable layout
  of SleeveBlock.` Sıra bozulursa `"unexpected sleeve command layout, cannot
  measure cap"`.
- `engine/src/validator.cpp:297-301` — kapak uzunluğu
  `pathLength({commands[0], commands[1], commands[2]})`; karşısındaki oyuk ise
  ÇİZİLEN kenardan değil skalerden okunuyor: `bodice.armholeLength`.
- `engine/src/bodice.cpp:509` / `:625` — o skaler burada üretiliyor
  (`pathLength({move(shoulderTip), armholeCurve})`), `:558` / `:777`'de
  `half.armholeLength`'e, `engine/src/garment.cpp:670-671`'de
  `pattern.sleeveArmholeLenMM`'e taşınıyor.
- `engine/src/sleeve.cpp:46-96` — kol, o SKALERE ikili aramayla uyduruluyor
  (`targetCapLength = armholeLength * (1 + capEaseFor(fabric))`); kol oyuğunun
  eğrisini hiç görmüyor.
- `engine/src/geometry.hpp:108-109` — devredilen iki skaler:
  `sleeveArmholeLenMM`, `sleeveArmholeDepthMM`.

**KOMUT 1.**
```
grep -rniE "edgeName|edgeId|seamId|seamName" engine/src/ | wc -l
```
**ÇIKTI 1:** `3` — ve üçü de kenar kimliği DEĞİL:
`engine/src/collar.cpp:537,545,553` yerel bir `const char* edgeName` (yaka dış
kenarı için "pointed"/… kelimesi, İNSAN CÜMLESİNE giriyor). Yani kod tabanında
kenar kimliği taşıyan alan sayısı **0**.

**KOMUT 2** (sevk edilen artefaktın kendi alanları, `web/vendor/stitchu-engine.js`
üzerinden `draftJSON`, EU38):
```
node --input-type=module -e '<draftJSON çağrısı; pattern/pieces alan adlarını ve
parça adlarını basar>'
```
**ÇIKTI 2:**
```
### dart_crew_top  PANEL SAYISI = 4
    pattern top-level alanlar: garment, fabricAdviceKey, fabricMeters140, guideSteps, guideRefs, rehber, pieces
    PatternPiece alan adlari: name, cutInstruction, seamAllowance, grainline, commands, markings, notches, cutLine, onFold, foldLine
    parca adlari: Top Front | Top Back | Bias binding (neckline) | Sleeve
    kol iceren parca: 1
### princess_scoop_dress  PANEL SAYISI = 10
    pattern top-level alanlar: garment, fabricAdviceKey, fabricMeters140, guideSteps, guideRefs, rehber, pieces
    PatternPiece alan adlari: name, cutInstruction, seamAllowance, grainline, commands, markings, notches, cutLine, onFold, foldLine, closure
    parca adlari: Bodice Center Front | Bodice Side Front | Bodice Center Back | Bodice Side Back | Bias binding (neckline) | Skirt Center Front | Skirt Side Front | Skirt Center Back | Skirt Side Back | Sleeve
    kol iceren parca: 1
```

**SAYI (kartın istediği).**
- Artefaktta **adlandırılmış kenar = 0** (hiçbir parçada kenar adı alanı yok).
- Artefaktta **adlandırılmış PARÇA = 4** (kollu üst) ve **10** (prenses elbise).
- **Panel sayısı = 4** ve **10** (aynı sayılar; parça = panel, artefakt başka bir
  bölünme taşımıyor).
- `node engine/tests/sewability_check.mjs` bunu 16 draftta topluca ölçüyor:
  `16 draft (2 spec × 8 beden), 112 parça, 96 kapalı-aday kontur` ve o 112 parçada
  `seams/seamGraph/edges/edgeNames/pairs/stitches` alanı sayısı = **0**.

---

## S2 — DİKİŞ ÇİFTİ ÖLÇÜSÜ ZATEN VAR MI

**CEVAP.** `sewability_check` dikiş çiftlerinin uzunluk eşitliğini
**ÖLÇEMİYOR** ve bunu gizlemiyor: madde 1'i `ABSENT` basıyor, çünkü sevk edilen
artefakt dikiş grafiği taşımıyor (ölçtüğü sayı: 112 parçada dikiş-grafiği alanı
= 0). Kol oyuğu↔kapak çiftini BUGÜN ölçen kod NATIVE tarafta var
(`validator.cpp` cap kapısı) ama çifti ADLA değil, **parça-adı alt-dizgisi +
sabit komut indeksi + skaler devri** ile buluyor — yani kartın sorduğu anlamda
"kenar kimliğiyle" bulmuyor.

**NEDEN ÖLÇEMİYOR — üçünden hangisi?** Ölçüldü:
- çift yok mu → **EVET, ÇİFT YOK.** Artefaktta hangi kenarın hangi kenara
  dikildiğini söyleyen alan sıfır (yukarıdaki 0).
- kol paneli yok mu → **HAYIR, KOL VAR.** İki spec'te de `Sleeve` parçası
  çiziliyor (ÇIKTI 2, "kol iceren parca: 1").
- ad yok mu → **EVET, KENAR ADI YOK.** S1'in ölçümü.
Yani engel kol panelinin yokluğu değil; engel **kenar kimliğinin yokluğu**.

**KANIT (dosya:satır).**
- `engine/tests/sewability_check.mjs:383-390` — `[madde 1] DİKİŞ ÇİFTİ UZUNLUK
  EŞİTLİĞİ` bölümü `ABSENT` basar; tanık sayacı `T.seamGraphFields`
  (`:288-290`, regex `^(seams|seamGraph|edges|edgeNames|pairs|stitches)$`).
- `engine/tests/sewability_check.mjs:399-401` — çentik ÇİFTİ de aynı sebeple
  `ABSENT`; ayrıca `engine/tests/notch_alignment_check.cpp` kendi satır 23'ünde
  oyuk↔taç çentik çiftini kapsam DIŞI ilan ediyor.
- `engine/src/validator.cpp:297-346` — kol oyuğu↔kapak ÇİFTİ burada gerçekten
  ölçülüyor: `capLength` vs `target = bodice.armholeLength * (1 + capEase)`,
  ayrıca ease penceresi (`capEaseMin..capEaseMax`) ve biceps tabanı. Ama:
  oyuk tarafı bir SKALER, kapak tarafı sabit İNDEKS. Kenar adı yok.
- `engine/src/validator.cpp:412-418` (`skirtSideSeamLength`) ve `:618-632`
  (`topSideSeamLength`) — diğer çiftler de aynı usulle, KOMUT DÜZENİNE bakarak
  ("topology-driven") buluyor; yani sıra/indeks tahmini.

**KOMUT 3.**
```
node engine/tests/sewability_check.mjs
```
**ÇIKTI 3 (ilgili satırlar).**
```
--- ÖLÇÜM ZEMİNİ: 16 draft (2 spec × 8 beden), 112 parça, 96 kapalı-aday kontur
[madde 1] DİKİŞ ÇİFTİ UZUNLUK EŞİTLİĞİ
ABSENT: [madde 1] ... 112 parçada seams/seamGraph/edges/edgeNames/pairs/stitches alanı sayısı = 0
      ⚠ SAYI: sevk edilen rehber 72 adet dikiş SÖZÜ veriyor ... hiçbirinin geometrik karşılığı artefaktta yok
RATCHET:
    notch_off_boundary         ölçülen    211   tavan    211
    mark_over_seam_allowance   ölçülen     32   tavan     32
    mark_far_from_edge         ölçülen    342   tavan    342
    unclosed_contour           ölçülen      0   tavan      0
    self_intersection          ölçülen      0   tavan      0
    turn_out_of_band           ölçülen      0   tavan      0
    engine_error               ölçülen      0   tavan      0
PASS sewability_check — RATCHET: 0 tavan aşımı · adıyla basılan ihlal kalemi 585
```
(Koşu süresi 0.095 s.)

**KOMUT 4** — oyuk↔kapak çiftini bugün ölçen kapı (`engine/build`'deki derlenmiş
ikili, doğrudan koşuldu; TAM `ctest` başlatılmadı):
```
cd engine/build && ./sleeve_armhole_agree_check | tail -5
```
**ÇIKTI 4.**
```
cells=96
worst H1 = 0.015479 mm   (EU48 Princess Woven Plain)   limit 0.79375 mm
worst H2 = 0.001297      (EU36 Princess Woven Plain)   limit 0.0015
worst H3 = 0.000000      (EU42 Dart Knit Puffed)   limit 0.0200
sleeve_armhole_agree_check OK (0 failures)
```
⚠ **BU SAYIYA BUGÜNÜN SAYISI DENEMEZ** — aşağıdaki "kart dışı" §1'e bak: bu
ikilinin KAYNAĞI ağaçta YOK ve `CMakeLists.txt`'te kayıtlı değil; 22 Ağu tarihli
öksüz bir ikili. Karşılaştırdığı iki büyüklük (`drawn_armhole` vs `declared`)
zaten aynı skalerin iki kopyası; gerçek bir kenar↔kenar karşılaştırması değil.

**KOMUT 5** — sevk edilen hattın oyuk kapısı (kaynağı ağaçta VAR:
`engine/tests/garment_armhole_check.cpp`):
```
cd engine/build && ./garment_armhole_check | tail -50
```
**ÇIKTI 5 (özet).** `25 yargi, 0 FAIL`. EU38 oyuk **404.26mm** (dikiş çizgisi,
K1 bandı 400-440mm içinde); grade adımları 12.06–16.60mm, max/medyan **1.115**;
determinizm 8 bedende **0.0000mm**. ★ Bu kapı YALNIZ oyuğu ölçüyor; kapağı ve
çifti hiç görmüyor.

⚠ İKİ SAYI ÇELİŞİYOR, ÇÖZÜLMEDİ: `garment_armhole_check` EU38 için **404.26mm**,
`sleeve_armhole_agree_check` aynı beden/varsayılan için **373.06mm** (Dart Woven
Plain) basıyor. Fark **31.20mm**. Bu turda hangi girdinin farklı olduğu
ayrıştırılmadı — **DOĞRULANMADI**, kaynak dosyaya dokunmak yasaktı ve
agree_check'in kaynağı zaten diskte yok.

---

## S3 — HANGİ HAT SEVK EDİLİYOR

**CEVAP.** Kullanıcının indirdiği kalıbı üreten hat **wasm'dir**:
`web/js/engine.js` → `web/vendor/stitchu-engine.js` → `engine/wasm/bindings.cpp
draftJSON` → `GarmentDrafter::draft` (`engine/src/garment.cpp`). Yüzey motoru
`engine/src/surfacepattern.cpp` **SEVK EDİLMİYOR** (wasm derlemesinin kaynak
listesinde yok). Kol bu sevk edilen hatta **ÇİZİLİYOR**; çizen
`engine/src/sleeve.cpp` içindeki `SleeveBlock::draft`, çağrı yerleri
`engine/src/garment.cpp:303` ve `:621`.

**KANIT (dosya:satır).**
- `web/js/engine.js:56` — `script.src = 'vendor/stitchu-engine.js?v=136';`
- `engine/wasm/bindings.cpp:339` — `std::string draftJSON(val specObj, val bodyObj)`
- `engine/wasm/bindings.cpp:484` — `emscripten::function("draftJSON", &draftJSON);`
- `engine/build-wasm.sh:72` ve `:111` — derlenen kaynak listesi. `src/sleeve.cpp`
  listede; `src/surfacepattern.cpp` listede DEĞİL.
- `engine/CMakeLists.txt:13` — `src/surfacepattern.cpp` yalnız NATIVE hedefte.
- `engine/src/garment.cpp:303`, `:621` —
  `const std::vector<PatternPiece> sleeves = SleeveBlock::draft(...)`.
- `engine/src/sleeve.cpp:11` `capCurve`, `:21` `capCurveLength`, `:46-96`
  kapak-oyuk ikili araması — kolun kapağını fiilen çizen kod.

**KOMUT 6.**
```
grep -c "surfacepattern" engine/build-wasm.sh
grep -c "src/sleeve.cpp" engine/build-wasm.sh
grep -c "surfacepattern\|SurfacePattern" engine/wasm/bindings.cpp
```
**ÇIKTI 6.**
```
0      <- surfacepattern wasm'a HİÇ girmiyor
2      <- sleeve.cpp iki wasm hedefinin ikisinde de derleniyor
0      <- bindings hiçbir yerde yüzey motorunu çağırmıyor
```

**KOMUT 7** (üretilen artefakt yolu — sevk edilen ikili diskte):
```
ls -la engine/dist/ web/vendor/
```
**ÇIKTI 7.**
```
engine/dist/stitchu-engine.js     1215264   24 Ağu 16:47
engine/dist/stitchu-worker.js       46910   24 Ağu 16:48
engine/dist/stitchu-worker.wasm   1042876   24 Ağu 16:48
web/vendor/stitchu-engine.js      1215391   24 Ağu 16:47
```

**KOMUT 8** (kol gerçekten sevk edilen artefaktta mı — ÇIKTI 2'nin aynısı):
`draftJSON` çıktısında `Sleeve` adlı parça **2 spec'in 2'sinde de var**, panel
sayıları **4** ve **10**.

**★ İKİNCİ TANIK.** `engine/tests/sewability_check.mjs:9-14` aynı hükmü kendi
başlığında yazıyor ve motoru `web/vendor/stitchu-engine.js`'ten yüklüyor
(`:127`): *"Tek-yüzey motoru (`surfacepattern.cpp`) kullanıcıya ULAŞMIYOR."*
Bu ölçüm o cümleyi bağımsız olarak doğruladı (KOMUT 6).

---

## TEK CÜMLE HÜKÜM

**Kol oyuğu↔kapak kapısı bugün kenar kimliği olmadan KURULABİLİR ama SAĞLAM
KURULAMAZ** — çünkü kapı bugün fiilen `engine/src/validator.cpp:297-301`'de
kuruluyor ve ayakta duruşu üç kırılgan varsayıma bağlı (parça adında `"Sleeve"`
alt-dizgisi, `commands[0..2]`'nin sabit sırası, ve oyuğun çizilen kenarı yerine
`bodice.armholeLength` skaleri); sevk edilen artefaktta adlandırılmış kenar
sayısı **0** ve dikiş-grafiği alanı sayısı **112 parçada 0** olduğu için ne çift
adıyla kurulabiliyor, ne de kullanıcının eline geçen kalıpta doğrulanabiliyor.

---

## KART DIŞI FARK EDİLEN (dokunulmadı)

**1. `engine/build`'de İKİ ÖKSÜZ İKİLİ VAR — kaynakları ağaçta YOK.**
`engine/build/sleeve_armhole_agree_check` (553688 B, 22 Ağu 16:48) ve
`engine/build/f6-armhole-cap` (127136 B, 22 Ağu 16:48) koşuyor ve sayı basıyor,
ama:
```
find . -path ./engine/build -prune -o -name "*sleeve_armhole_agree*" -print   -> boş
grep -rn "sleeve_armhole_agree" engine/CMakeLists.txt                          -> boş
```
Yani ctest'e kayıtlı değiller, yeniden derlenemezler, ve bastıkları sayı 22 Ağu
tarihli bir ağacın sayısıdır. **Bu ikililerin çıktısı bugünün kanıtı olarak
kullanılamaz.** (`engine/build/armhole-basis-probe`'un kaynağı VAR:
`engine/tools/armhole-basis-probe.cpp`, `CMakeLists.txt:362`.)

**2. `sewability_check` YEŞİL ama 585 ADLI İHLAL basıyor.** Exit kodu ratchet
tavanına bağlı (`engine/tests/v5-ratchet-baseline.json`, ölçüm 2026-08-25, ağaç
`d566a8a`) ve yedi tavanın YEDİSİ de ölçülen değerin TAM ÜSTÜNDE — yani hiçbir
kalemde pay yok, `engine/src/` altında çentik yerini oynatan herhangi bir değişim
kapıyı anında kırar. Bugünkü ihlaller: 211 çentik tabanı kesim çizgisinde değil,
342 işaret her kenardan dikiş payından uzak (en uzağı 78.93mm), 32 işaret dikiş
payından uzun (biri 387.10mm — 'Bodice Center Back', bir katlama çizgisi olduğu
belli ama artefakt tür alanı taşımadığı için yargılanmıyor).

**3. Sevk edilen rehber, artefaktın taşımadığı şeyin sözünü veriyor.**
`sewability_check` ölçtü: 16 draftta **72 dikiş SÖZÜ** ("Sew the shoulder seams",
"set the sleeves in") var; geometrik karşılığı **0**. Yani alıcıya verilen
talimatın hiçbiri kalıptan doğrulanamıyor.

**4. `notches` kanalı TİPSİZ — en az üç ayrı tür işaret aynı listede.**
Kenar çentiği, katlama/orta çizgisi ve 22mm aralıklı iç işaret merdiveni aynı
`std::vector<PathCommand> notches` içinde duruyor; `PatternPiece`'te ayırt eden
alan yok (`geometry.hpp:52-58`). Kenar kimliği eklenirse bu kanalın da tür alanı
istemesi muhtemel — aynı boşluğun ikinci yüzü.

**5. `flat_expresses_spec_check.mjs` bu turda KOŞULMADI.** Kartın girdi
listesindeydi; süre içinde S1/S2/S3'ün üçü de o alete ihtiyaç duymadan
kapandığı için açılmadı. **ÖLÇÜLMEDİ.**

**6. `engine/tools/` altında 100+ alet var, yenisi YAZILMADI.** Kart yasağına
uyuldu; koşulan her şey ya var olan bir test ikilisi ya da `grep`/`node -e`
ile artefakt okuması.

**7. Kol oyuğu, kolun kapağını HİÇ GÖRMÜYOR — tek yönlü bir devir.**
`bodice.cpp` oyuğu çizip uzunluğunu skalere yazıyor (`:509`), `sleeve.cpp` o
skalere uyuyor (`:55`), sonra `validator.cpp` aynı skalerle sonucu tekrar
kontrol ediyor (`:300`). Zincirin hiçbir yerinde iki ÇİZİLEN kenar
karşılaştırılmıyor; yani bugünkü "0.00mm uyum" sayıları bir kenar↔kenar uyumu
değil, aynı sayının kendisiyle uyumudur. Bu, S1'in kenar-kimliği eksiğinin
doğrudan sonucudur.
