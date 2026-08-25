# V7-C — KENAR KİMLİĞİ: SEVK EDİLEN HATTA DÖRT KENAR AD KAZANDI

## 1. NE EKLENDİ (dosya:satır)

| dosya:satır | ne |
|---|---|
| `engine/src/geometry.hpp:40-71` | `struct EdgeRole` — `role` (ad) + `firstCommand`/`lastCommand` (kapsayıcı komut indeksi) + `start`/`end` (uç nokta çapası). **Uzunluk alanı YOK**, bilerek. |
| `engine/src/geometry.hpp:105-107` | `PatternPiece::edgeRoles` — parçanın adlandırılmış kenarları. |
| `engine/src/geometry.hpp:110-121` | `edgePathOf()` / `edgeLengthOf()` bildirimi. |
| `engine/src/geometry.cpp:190-231` | `edgePathOf()`: komut aralığını `move(start)` + `commands[first..last]` olarak geri verir; aralık taşarsa **ya da uç noktalar çapayla tutmazsa BOŞ döner** (RULES 1: sus değil, reddet). `edgeLengthOf()` = mevcut `pathLength()` (24 adımlı `flattenCubic`) — yeni sayısal algoritma yazılmadı (§5.5). |
| `engine/src/geometry.cpp:182-189` | `translatePiece()` artık çapayı da taşıyor (prenses yan paneli kendi orijinine oturtuluyor; taşınmasa ad geçerliyken sahte "bayat" düşerdi). |
| `engine/src/bodice.cpp:518-525` | `makePiece`: `armhole_front` / `armhole_back`, **oyuğu çizen `armholeCurve`'ün push edildiği yerde**, `isFront` bayrağından. |
| `engine/src/bodice.cpp:709-715, 733` | prenses merkez panel: oyuğun ÜST parçası (`armSplit.first`). |
| `engine/src/bodice.cpp:743-748, 768` | prenses yan panel: oyuğun ALT parçası (`armSplit.second`). Aynı ad, iki panel — oyuk gerçekten ikiye bölünüyor. |
| `engine/src/sleeve.cpp:126-133, 156` | Cap Sleeve: `sleeve_cap`. Koltukaltı dikişi YOK, o yüzden `sleeve_underarm` de YOK (olmayan kenar uydurulmuyor). |
| `engine/src/sleeve.cpp:186-208, 251` | tam kol: `sleeve_cap` (commands[1..2]) + **iki** `sleeve_underarm` (commands[3] ve commands[5]). Koltukaltı dikişi parçanın iki yan kenarının BİRBİRİNE dikilmesidir; tekini adlandırmak karşılaştırılacak çifti gizlerdi. Aradaki etek ucu dikiş değil, o yüzden adsız. |
| `engine/wasm/bindings.cpp:283-301` | `draftedJSON` → her parçada `"edgeRoles":[{role,first,last,startX,startY,endX,endY}]`. Sevk edilen hat: `web/js/engine.js:56` → `web/vendor/stitchu-engine.js` → `bindings.cpp draftJSON`. |

**Yeni kaynak dosya: 0** (§7.5 tavanı 1'di). Değişen dosya 5.

**Neden uzunluk basılmıyor:** kartın teşhis ettiği kusur tam olarak buydu —
`bodice.cpp:509` bir skaler yazıyordu, `sleeve.cpp:55` ona uyuyordu,
`validator.cpp:300` aynı skaleri doğruluyordu. Kenar ADRESLENİR, özetlenmez;
yay uzunluğunu tüketici çizilen komutlardan kendi hesaplar (aşağıda öyle yapıldı).

## 2. ARTEFAKTTA ADLANDIRILMIŞ KENAR — ÖNCE / SONRA

**ÖNCE = 0.** Sevk edilen commit'li paket bu kelimeyi hiç taşımıyor:

```
$ git show HEAD:web/vendor/stitchu-engine.js | grep -c edgeRoles
0
```

**SONRA = 5** (4 panelli kollu üst, 4 ayrı rol adı). Komut, wasm paketini
yükleyip `draftJSON` çağırıyor; yay uzunluğu **motordan alınmıyor**, JSON'daki
`commands[first..last]` üstünde tüketici tarafında yeniden hesaplanıyor:

```
$ node --input-type=module -e '<web/vendor/stitchu-engine.js yükle, draftJSON,
    her edgeRole için commands[first..last] üstünde 24-adım kübik yürü>'

Top Front            armhole_front    cmds[3..3] anchor start(173.08,45.8893) end(244.2,231)      arc=211.3405mm
Top Back             armhole_back     cmds[3..3] anchor start(181.0475,49.4005) end(224.775,231)  arc=192.9188mm
Sleeve               sleeve_cap       cmds[1..2] anchor start(-151.8,136.9763) end(151.8,136.9763) arc=420.3840mm
Sleeve               sleeve_underarm  cmds[3..3] anchor start(151.8,136.9763) end(121.44,556.8)   arc=421.1106mm
Sleeve               sleeve_underarm  cmds[5..5] anchor start(-121.44,556.8) end(-151.8,136.9763) arc=421.1106mm
panels: 4   NAMED EDGES: 5
armhole(front+back) = 404.2594 mm   sleeve_cap = 420.3840 mm
cap ease % = 3.989
sleeve_underarm two sides = 842.2212 mm total
```

(Gövde: EU38 `bust 88 / waist 70 / hip 94 / shoulder 37 / backLength 40.5 /
armLength 58 / neck 35`; spec: `top · crew · straight · long · woven · plain`.)

**Bu sayı ne söylüyor, ne söylemiyor.** `+3.989%` cap ease, ilk kez İKİ ÇİZİLMİŞ
KENAR arasında ölçüldü: oyuk iki ayrı panelden toplandı, kapak kol parçasından
okundu, ikisi de JSON'daki komutlardan. Kartın "aynı sayının kendisiyle uyumu"
teşhisi bu kanalda artık geçerli değil. **SÖYLEMEDİĞİ:** bu kalıbın doğru olduğu.
`+3.989%`'un `capEaseFor(woven)`'a ne kadar yakın olduğu ve aradaki farkın
`convergenceTolerance`'tan mı geldiği **BU KARTTA ÖLÇÜLMEDİ**.

İki `sleeve_underarm` kenarı **birebir aynı** (421.1106 / 421.1106) — beklenen,
çünkü kol simetrik çiziliyor; ama artık bu bir varsayım değil, artefakttan
okunabilen bir sayı.

## 3. GOLDEN BAYT-AYNI (komut + çıktı)

```
$ ./engine/build/golden_dump > /tmp/v7c-golden.csv && cmp /tmp/v7c-golden.csv engine/golden-reference.csv && echo OK
BYTE-IDENTICAL: d28297e4f61b21689ee01c06c1349176a9952e4df79d82bac395ff1b3b8ad2f2
        vs pin  d28297e4f61b21689ee01c06c1349176a9952e4df79d82bac395ff1b3b8ad2f2
```

`cmp` sessiz döndü, sha256'lar aynı. Sebep yapısal: golden dökümü
`commands + markings` okur; `edgeRoles` `notches`/`foldLine` ile aynı disiplinde,
metadata katmanında durur, çizilen geometriye hiç girmez (§ŞART 3: mevcut
tüketici kırılmıyor, alan varsayılanda zararsız).

## 4. CTEST — `GECE/log/V7-C.ctest.txt`

```
94% tests passed, 7 tests failed out of 113
```

**MİRAS 6 KIRMIZI (kartın açılış kümesi, aynen):** `flat_pattern_agree_check ·
flat_artifact_census · style_check · sizechart_source_check · contract_check ·
figure_check`.

**7.'si BENİM DEĞİL — `vocab_reference_check`.** Bu kapı çalışma ağacını değil
**HEAD commit'ini** sayar (`count_commit HEAD`, dosyanın kendi §"WHY BOTH SIDES
ARE MEASURED IN A DETACHED WORKTREE"). Benim işim ölçüm anında commit'siz
olduğu için sayıma hiç girmedi. Kırmızıyı doğuran, koşu sırasında düşen paralel
commit'ler (`b85c2c8` v7-f, `4254c92` v7-e):

```
FAIL ARTTI  eksen ADI   garment    1186 ->  1189  (+3)
FAIL ARTTI  eksen ADI   sleeveCap   146 ->   147  (+1)
```

Kendi diff'imin bu sayaca katkısı **SIFIR**, ölçüldü — kapının kendi kelime
listesi (37 eksen adı + PAYLAŞIM=1 olan 92 enum değeri) benim eklediğim satırlara
uygulandı:

```
$ git diff -- engine/src engine/wasm | grep '^+' | <vocab.json kelime listesiyle tara>
MY DIFF adds these counted references: NONE
```

Commit'ten SONRA kapı yeniden koşuldu — HEAD artık benim commit'im (`1b58a29`)
ve iki sayı da **kımıldamadı**, yani bu commit sayaca sıfır ekledi:

```
$ bash engine/tests/vocab_reference_check.sh
FAIL ARTTI  eksen ADI   garment    1186 ->  1189  (+3)
FAIL ARTTI  eksen ADI   sleeveCap   146 ->   147  (+1)
HUKUM: FAIL (2 artan, 0 yeni)
```

Yani **RULES 9 ihlali yok**: kırmızı AD kümesini büyüten commit benimki değil.
Bu satır bir savunma değil, bir teşhis — `vocab_reference_check` bu koşuda
kırmızıya döndü ve **kapatılmadı, gevşetilmedi, tabanı yeniden kesilmedi**;
sahibi v7-e/v7-f kartlarıdır.

## 5. AÇIK BIRAKILAN (dokunulmadı)

- **Adlandırılmış kenarı yargılayan bir KAPI yok.** `edgePathOf()` bayat rolü
  reddediyor ama bunu ateşleyen bir test yazılmadı: kartın yazma izni
  `engine/src` + `engine/wasm` ile sınırlı, `engine/tests/` altına dosya
  açılamazdı. Yani bugün bir post-pass `commands`'ı yeniden kursa, rol sessizce
  bayatlar ve JSON'da **boş yay** olarak görünür — yanlış kenar değil, ama
  kırmızı da değil. **Sıradaki kartın işi.**
- `validator.cpp:282-300` hâlâ eski üç tahminle çalışıyor (parça adı alt-dizgisi
  `"Sleeve"`, sabit `commands[0..2]`, skaler `bodice.armholeLength`). Bu kart
  kimliği KURDU, tüketiciyi taşımadı — taşımak geometriyi değiştirmeden yapılır
  ama ayrı bir adımdır (V7-D).
- `engine/tools/recipe-json-dump.cpp` (native JSON dökümü) `edgeRoles` basmıyor;
  kart dışı dosya. `recipe_wasm_parity_check.mjs:70` alan beyaz-listesi
  kullandığı için parite kırılmadı (ölçüldü: test yeşil).
- Yaka / yan dikiş / bel gibi diğer kenarlar hâlâ adsız. Kart dört ad istedi,
  dördü verildi; geri kalanı **açık**.
