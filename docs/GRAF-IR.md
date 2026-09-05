# GRAF IR — bir giysi grafi, iki beden, iki cikti (F2a, 2026-09-05; karar turu uygulandi: suppress · widthHalf/width · fitLength kisiti · Seam.reverse zincir · uydurma/esik tablosu; duzeltme turu: butun alan adlari Ingilizce, graf-v1 1.2.0)

Kaynak: `contract/graf-v1.json` (sozlesme) · `engine/src/graf.hpp` (tipler, JSON, degerleme) ·
`engine/src/grafop.hpp` (op'lar) · `engine/src/grafdogrula.hpp` (dogrulayici + sanal dikis).
Kapilar: `graf_ir_check`, `graf_op_check`, `graf_dikilebilir_check` (ctest). Ornek graf:
`KOSU/ciktilar/graf-ilk/graf.json`; dikilebilirlik tablolari ayni dizinde (`dikilebilir-*.md`).

## Tek cumle

Giysi, kenarlari **mm ile degil beden landmark'i + oranla** tanimlanan bir Edge/Panel/Seam grafidir.
Ayni graf `Body("gercek36")` / `graded("EU34".."EU44")` ile degerlenince **kalip**, `Body("croquis36")`
ile degerlenince **flat** cikar (HEDEF 4-5). Edit = grafa **op**; op kaydi grafta durur ve yeniden
oynatilir (HEDEF 2). Sozluk yok, menu yok: her giysi kenar/panel/dikis kompozisyonudur (HEDEF 9).

## Tipler

| tip | ne | alanlar |
|---|---|---|
| **Anchor** | tek landmark terimi | `landmark`, `xOf` (landmark · ringFront · ringBack · ringQuarter · widthHalf), `ring` (YALNIZ ring*/landmark bolluk halkasi), `width` (YALNIZ widthHalf: `width.crossFront`), `xFactor`, `xOffsetMM`, `yLandmark`, `yLandmark2`, `yLerp`, `yOffsetMM` — bir alan tek anlam (karar 3), carpik kombinasyon parse+sema'da adiyla |
| **RefPoint** | nokta = Anchor'larin afin birlesimi (agirliklar 1'e toplanir) | tek terim: Anchor nesnesi; cok terim: `{"combo":[{w,...}]}` |
| **Edge** | iki RefPoint arasi dogru (control bos) ya da kubik (2 control) | `id`, `kind` (cut · seam · fold · dartLeg), `role`, `rolePart/roleCount`, `from`, `to`, `control`, `finish`, `notches`, `gatherRatio`, `fitSeam` (KISIT: kontroller degerleme aninda bu dikisi kapatacak sekilde bedende cozulur, mm yok — karar 6) |
| **Panel** | kapali kenar halkasi = bir kez kesilecek parca | `id`, `edges`, `grainDeg`, `onFold`, `cutCount`, `seamAllowanceMM`, `ease[]` (RingEase: halka basina cevre mm), `reason` |
| **Seam** | iki SIRALI kenar ZINCIRI + oran: `len(a) = ratio x len(b) + easeMM` | `id`, `a[]`, `b[]` (ardisik kenarlar tepe paylasir; yon zincirden turer), `reverse` (ZORUNLU: false a.bas<->b.bas, true a.bas<->b.son — karar 7), `ratio`, `easeMM`, `notchFractions` (a'nin basindan; b'de reverse ise 1-f), `closure{type,from,to}`, `reason` |
| **Ring** | aciklik (yaka, kol oyugu, bel, etek ucu, kol agzi) — sanal dikis kapanmasini olcer | `id`, `role`, `edges[]` |
| **Garment** | paneller + dikisler + halkalar + op gecmisi | `id`, `version`, `notes`, `panels`, `seams`, `rings`, `ops[{op,args}]` |

**Degerleme** (`eval(RefPoint, EvalCtx{body, ringEaseMM, onArkaEsit})`):
`x = xFactor x taban + xOffsetMM`; taban `xOf`'a gore landmark.x · `G(1-arkaPay)/2` · `G arkaPay/2` · `G/4` ·
`genislik/2`, `G = halka cevresi + bolluk` — **kumas = bedene bolluk alani**, cevre orantili buyur.
`y = yLandmark.y (+ yLerp x (yLandmark2.y - yLandmark.y)) + yOffsetMM`. Bilinmeyen landmark adiyla firlatir.


**Alan adlari Ingilizce** (graf-v1 1.2.0, F2a duzeltme turu — hakem kusuru 1): bu sema F4a (fotograf) ve F4b (prompt)
katmaninin uretim hedefidir; anahtarlar tek dilde. Eski adlar (`oran`, `ofsetMM`, `yOran`, `yOfsetMM`, `bolluk`, `gerekce`,
`intakeOran`) hic bir yerde kabul edilmez: sema `'<ad>' <Tip> icin tanimsiz alan`, parse `bilinmeyen alan '<ad>'` der
(`graf_ir_check` (i): 7 anahtar x sema+parse negatif + applyOp `intakeOran` reddi). Aciklamalar TR+EN kalir.

## Degismezler (dogrulayici kurallari, `contract/graf-v1.json toleranslar`)

| kural | hukum | esik / kaynak |
|---|---|---|
| `sema` | belge sozlesmenin alan/enum/tip diliyle ayni | — |
| `panel_kapali` | `edges[i].to == edges[i+1].from` YAPISAL (landmark terimleri esit), >= 3 kenar, tekil id | — |
| `referans` | her EdgeRef var olan panel/kenara gider | — |
| `kenar_turu` | seam -> bir Seam'de; cut -> dikissiz + `finish`; fold -> `onFold` + x=0; dartLeg -> cift, ortak apeks, esit bacak | pens 2.0 mm (validator.hpp dartSumTolerance + URBN zinciri) |
| `kisit` | her `fitSeam` kisiti bu bedende cozuldu (`cozumle`: kontrol kaymasi bisection, `cozucu.fitLength` dMax 120 / tol 0.05); cozulemeyen adiyla kirmizi, cozulen bilgi satirinda kayma mm | contract `cozucu` (arama siniri, DOGRULANMADI etiketli) |
| `dikis_zincir` | `Seam.a`/`Seam.b` sirali zincir: ardisik kenarlar tepe paylasir — ayni panelde kose, panel gecisinde baska dikisin ILAN EDILEN uc esi; yon turetilir (`>` duz, `<` ters); zincirler yapisal cozulur (`zincirleriCoz`, beden gerekmez) | — |
| `dikis_uzunluk` | `\|len(a) - (ratio x len(b) + ease)\| <= tol`, ratio aralikta | 2.0 mm (body-v1 ayniInsan ile ayni URBN 1/8 in zinciri; CLO 3.0 ustu; DOGRULANMADI etiketi ayni) · ratio [1.0, 3.5] (primitives-v1) |
| `centik` | `seam.notchFractions` (a'nin basindan) iki tarafta da panel centigiyle bulusur; b'de `reverse` ise `1-f` | 0.5 mm (notch_alignment_check.cpp repo konvansiyonu; ASIL hukum kesir esitligi — karar 5) |
| `kendini_kesme` | degerlenen kontur (16 adim) kendini kesmez | — |
| `halka_kapanma` | **sanal dikis**: halka da bir zincirdir (`zincirCoz(halka=true)`); kavsaklar kose / dikisin ILAN EDILEN uc esi / kat aynasi (kat yalniz baska baglanti yoksa); kavsak boslugu = o dikisin uzunluk artigi; tahmin yok (eski dort-uc-kombinasyonu silindi); kavsagi olmayan halka KOPUK | 2.0 mm |

Bilgi satirlari (hukum degil): kisit cozumleri (kayma mm, bu bedende), 2B yerlestirme pozlari (dikis
agaci BFS, ilan edilen eslesmeyle; parca dikis dogrusunun obur yanina dusmesi icin gerekirse AYNA — kitap
gibi acilis), dikis uc boslugu, panel alan/cevre, **uydurma** (grafin `notes`'undaki DOGRULANMADI
kalemleri — karar 4a; rapor JSON `uydurma[]` + markdown `## Uydurma`). Rapor basligi esikleri **kaynak
sutunuyla** basar (karar 5). Tolerans NaN ise dogrulayici **adiyla reddeder** (sayi koda gomulu degil).

## Op tablosu (`grafop.hpp`, hepsi saf: `Garment -> OpResult{ok, hata, g}`)

| op | args | ne yapar | degismez |
|---|---|---|---|
| `subdivide` | panel, edge, fractions[] | kenari kesirlerde boler (De Casteljau, RefPoint uzayinda) | rol PARCALI (k/n), toplam uzunluk korunur, dikis/halka referanslari parcalara acilir |
| `suppress` | panel, edge, atFraction, intakeFraction, apex, legId, trueLegs (varsayilan true) | pens = kenara operator (ad `primitives-v1 op.suppress`, karar 2): kenardan intakeFraction kadar iceri alir: sol + 2 dartLeg + sag; `trueLegs` apeksi agzin dik ortayina kurar (x agiz ortasindan, y verilen apeksten) | trueLegs ile bacaklar insadan esit (yatay agizda tam; egik agizda `kenar_turu` yargilar), kalan kenar (1-intake) x eski; aci parametre degil |
| `gather` | panel, edge, ratio | kenari kendi dogrultusunda ratio kat uzatir (kat kenarina dayaniyorsa x=0 etrafinda) | uzunluk tam ratio kat; tasidigi Seam.ratio guncellenir, buzulen taraf a |
| `flare` | panel, edge, factor | serbest (cut) kenari factor kat acar | dikisli kenara reddedilir (gather onerir) |
| `extend` / `shorten` | panel, edge, deltaMM | kenari +y / -y tasir (komsu kenarlar birlikte) | dusey komsu kenar tam delta uzar/kisalir |
| `extendTo` | panel, edge, yLandmark, yOffsetMM | kenarin y tabanini baska landmark'a baglar (diz -> bilek) | y == landmark.y + ofset |
| `split` | panel, vertexA, vertexB, panelA, panelB, seam, seamRatio | paneli iki kose arasinda ikiye boler, yeni dikis ekler | kenar toplami n+2, iki panel kapali, roller iki panelde parcali, referanslar yeni panellere tasinir |
| `overlay` | host, edges[], excessRatio, panel, seamPrefix | konagin kopyasi ust katman; sayilan kenarlar TEK homotetiyle excessRatio kat, konaga dikilir | konak BAYT-AYNI; her kenar tam ratio kat (egri dahil) |
| `attach` | hostPanel, hostEdge, panel, edge, ratio, seam | yeni panel (fiyonk/cep/volan) konak kenara dikilir | konak bayt-ayni; acik panel reddedilir |
| `reshapeEdge` | panel, edge, from?/to?/control? | kenarin uc/kontrol noktalarini yeniden yazar | komsu kenar kosesi birlikte |
| `moveVertex` | panel, edge, to | kenar baslangic kosesini tasir | iki komsu kenar ayni noktada |
| `mirror` | panel, newId | x-aynasi yeni panel | kenar sayisi ayni, x -> -x |
| `closure` | seam, type, fromFraction, toFraction | dikisin bir bolumune kapama (zipper/buttons/hooks/ties/open) | paneller bayt-ayni |
| `fitLength` (KISIT) | panel, edge, target{seam, ratio, easeMM} | kubik kenari dikise baglar (`Edge.fitSeam`), dikisin ratio/easeMM'ini yazar; **mm yazmaz** (karar 6) | kenar dikisin bir tarafinda; obur taraf kisitliysa (dongu) ret; cozum `cozumle(g, body)` ile her bedende ayri: gercek36 d=+9.49, EU38 +9.94, croquis36 -35.41 mm — hepsinde kapak = 1.04 x oyuk |

**Edit modeli.** Her op yalniz adi gecen panel(ler)i degistirir; digerleri **bayt-ayni** kalir
(edit-locality yasasi grafa tasindi; `graf_op_check` her opta olcer). Kayit `Garment.ops`'a eklenir;
`replay(taban, ops)` ayni JSON'u verir (spec-diff deseni, Zoo/KittyCAD). F3c dogal dilden bu kayitlari
dolduracak ("yakayi 2 cm derinlestir" = `moveVertex on_beden/cf {landmark.neckFront, xFactor 0, yOffsetMM 20}`).
Aralik sayilari (ratio, flare) `contract araliklar`'dan; OpCtx bos ise op reddeder.

**K2/K5 kok sebebi.** `KOSU/ciktilar/primitif-DUSEN-*.txt`: roba/kup bolmesi kol oyugunun adini
dusuruyordu. Grafta kenar bolununce rol **parcali** tasinir (`rolePart/roleCount`); `graf_op_check`
split ornegi: `armhole_back` iki ayri panelde 1/4 ve 2/4 olarak yasar, `kol_oyugu` dikisi iki paneli
de gorur.

## Taban graf (fixture) ve dikilebilirlik

`graf_ir_check` taban elbiseyi kurar (on/arka govde + on/arka etek, kat; kol 2 kes), kol kapagini
`fitLength` KISITIYLA `kol_oyugu` dikisine baglar (ratio 1.04 = sleeve.hpp capEase; cozum bedende), `graf.json`'u yazar.
Dikisler sirali zincir + `reverse`: omuz/yan/oyuk/bel/yan_etek false, kol_alti true (kose<->kose, agiz<->agiz).
Bolluk: `garment-spec-v2.json` easeBust/Waist/Hip (Threads/RTW + Aldrich), biceps `sleeve.hpp
bicepsEase 0.15`. Yan dikisler cevre/4 (ringQuarter): on/arka insadan esit. Kol oyugunun icbukey
noktasi `width.crossFront/2` (body-v1). **Uydurulanlar adiyla** (`notes` alani): kapak yuksekligi
orani 0.6 ve cross-front seviyesi 0.5 DOGRULANMADI; taban oyuk 359 mm Aldrich 40-44 cm bandinin
altinda (scye depth bollugu yok) — F2b kaynakli kurar (asagida "F2b kapilari" 2; F3e devredilmez).

`graf_dikilebilir_check` gercek36 / EU38 / croquis36: **uc bedende 0 kirmizi** — 6 dikis artigi 0.000,
6 zincir cozuldu, 3 centik, 5 panel temiz, 5 halka kapali (yaka: omuz + kat aynasi; kol oyugu: kose +
omuz + kose + yan; bel: yan + kat; etek ucu: yan_etek + kat; kol agzi: kol_alti reverse). Kapak kisiti
her bedende cozuldu (karar 6): kol_oyugu artigi uc bedende 0.000 mm; eski "croquis36 -73 mm istisnasi"
yok. Negatif tablo: `KOSU/ciktilar/graf-ilk/dikilebilir-negatif.md` (her kural icin kiran ornek;
`dikis_zincir` sira bozma, `reverse` yanlis ilan -> kol agzi KOPUK dahil).

### KOSU/ciktilar/graf-ilk/graf.json

```json
{
  "id": "taban-elbise",
  "version": "graf-v1",
  "notes": "TABAN GRAF (F2a fixture). Bolluk: contract/garment-spec-v2.json quantities easeBustMM/easeWaistMM/easeHipMM (Threads/RTW + Aldrich); kol bollugu engine/src/sleeve.hpp bicepsEase 0.15 x girth.biceps (Brian default). Yan dikis ve bel iki tarafta cevre/4 (ringQuarter): on/arka yan dikisler insadan esit. Egri kontrol noktalari kubik ceyrek-daire katsayisi kappa=4(sqrt2-1)/3 ile (turetilmis). UYDURULANLAR ADIYLA: (1) kol kapagi yuksekligi koltukalti->omuz ucu dususunun 0.6'si — DOGRULANMADI; Aldrich EU38 kapak bandi 130-150 mm'nin altinda kalir, cunku taban kol oyugu (scye depth bollugu yok) Aldrich 40-44 cm bandinin altinda; oyugun icbukey noktasi width.crossFront/2 (body-v1), y'si dususun ortasi (0.5, DOGRULANMADI); F2b oyugu ve kapagi kaynakli kurar (KAPI 2, docs/GRAF-IR.md F2b kapilari; F3e devredilmez); croquis36'da width.crossFront'un kendisi 0.85 x width.shoulderToShoulder (body-v1 croquisOranlar.crossOverShoulderToShoulder, DOGRULANMADI — body-v1 borcu, grafin degil). (2) etek duz (kalca genisligi dize kadar). (3) yaka pervazli (faced), etek ucu kivrilir (hem). Kapak KISIT: fitLength cap_front/cap_back -> kol_oyugu (ratio 1.04 = sleeve.hpp capEase); mm grafa yazilmaz, her bedende degerleme aninda cozulur (karar 6).",
  "panels": [
    {
      "id": "on_beden",
      "edges": [
        {
          "id": "cf",
          "kind": "fold",
          "role": "cf",
          "from": {
            "landmark": "landmark.neckFront",
            "xFactor": 0,
            "xOffsetMM": 0
          },
          "to": {
            "landmark": "landmark.waist",
            "xFactor": 0,
            "xOffsetMM": 0
          }
        },
        {
          "id": "waist_front",
          "kind": "seam",
          "role": "waist_front",
          "from": {
            "landmark": "landmark.waist",
            "xFactor": 0,
            "xOffsetMM": 0
          },
          "to": {
            "landmark": "landmark.waist",
            "xOf": "ringQuarter",
            "xFactor": 1,
            "xOffsetMM": 0
          },
          "notches": [0.5]
        },
        {
          "id": "side_front",
          "kind": "seam",
          "role": "side_front",
          "from": {
            "landmark": "landmark.waist",
            "xOf": "ringQuarter",
            "xFactor": 1,
            "xOffsetMM": 0
          },
          "to": {
            "landmark": "landmark.underarm",
            "xOf": "ringQuarter",
            "ring": "girth.bust",
            "xFactor": 1,
            "xOffsetMM": 0
          },
          "notches": [0.5]
        },
        {
          "id": "armhole_front.1",
          "kind": "seam",
          "role": "armhole_front",
          "rolePart": 1,
          "roleCount": 2,
          "from": {
            "landmark": "landmark.underarm",
            "xOf": "ringQuarter",
            "ring": "girth.bust",
            "xFactor": 1,
            "xOffsetMM": 0
          },
          "to": {
            "landmark": "landmark.underarm",
            "xOf": "widthHalf",
            "width": "width.crossFront",
            "xFactor": 1,
            "xOffsetMM": 0,
            "yLandmark": "landmark.underarm",
            "yLandmark2": "landmark.shoulderTip",
            "yLerp": 0.5
          },
          "control": [
            {
              "combo": [
                {
                  "w": 0.44771525016920644,
                  "landmark": "landmark.underarm",
                  "xOf": "ringQuarter",
                  "ring": "girth.bust",
                  "xFactor": 1,
                  "xOffsetMM": 0
                },
                {
                  "w": 0.5522847498307936,
                  "landmark": "landmark.underarm",
                  "xOf": "widthHalf",
                  "width": "width.crossFront",
                  "xFactor": 1,
                  "xOffsetMM": 0
                }
              ]
            },
            {
              "landmark": "landmark.underarm",
              "xOf": "widthHalf",
              "width": "width.crossFront",
              "xFactor": 1,
              "xOffsetMM": 0,
              "yLandmark": "landmark.underarm",
              "yLandmark2": "landmark.shoulderTip",
              "yLerp": 0.2761423749153968
            }
          ]
        },
        {
          "id": "armhole_front.2",
          "kind": "seam",
          "role": "armhole_front",
          "rolePart": 2,
          "roleCount": 2,
          "from": {
            "landmark": "landmark.underarm",
            "xOf": "widthHalf",
            "width": "width.crossFront",
            "xFactor": 1,
            "xOffsetMM": 0,
            "yLandmark": "landmark.underarm",
            "yLandmark2": "landmark.shoulderTip",
            "yLerp": 0.5
          },
          "to": {
            "landmark": "landmark.shoulderTip",
            "xFactor": 1,
            "xOffsetMM": 0
          },
          "control": [
            {
              "landmark": "landmark.underarm",
              "xOf": "widthHalf",
              "width": "width.crossFront",
              "xFactor": 1,
              "xOffsetMM": 0,
              "yLandmark": "landmark.underarm",
              "yLandmark2": "landmark.shoulderTip",
              "yLerp": 0.7761423749153968
            },
            {
              "combo": [
                {
                  "w": 0.44771525016920644,
                  "landmark": "landmark.shoulderTip",
                  "xFactor": 1,
                  "xOffsetMM": 0
                },
                {
                  "w": 0.5522847498307936,
                  "landmark": "landmark.underarm",
                  "xOf": "widthHalf",
                  "width": "width.crossFront",
                  "xFactor": 1,
                  "xOffsetMM": 0,
                  "yLandmark": "landmark.shoulderTip"
                }
              ]
            }
          ]
        },
        {
          "id": "shoulder",
          "kind": "seam",
          "role": "shoulder",
          "from": {
            "landmark": "landmark.shoulderTip",
            "xFactor": 1,
            "xOffsetMM": 0
          },
          "to": {
            "landmark": "landmark.neckBase",
            "xFactor": 1,
            "xOffsetMM": 0
          }
        },
        {
          "id": "neck_front",
          "kind": "cut",
          "role": "neck_front",
          "from": {
            "landmark": "landmark.neckBase",
            "xFactor": 1,
            "xOffsetMM": 0
          },
          "to": {
            "landmark": "landmark.neckFront",
            "xFactor": 0,
            "xOffsetMM": 0
          },
          "control": [
            {
              "landmark": "landmark.neckBase",
              "xFactor": 1,
              "xOffsetMM": 0,
              "yLandmark": "landmark.neckBase",
              "yLandmark2": "landmark.neckFront",
              "yLerp": 0.5522847498307936
            },
            {
              "landmark": "landmark.neckBase",
              "xFactor": 0.5522847498307936,
              "xOffsetMM": 0,
              "yLandmark": "landmark.neckFront"
            }
          ],
          "finish": "faced"
        }
      ],
      "grainDeg": 0,
      "onFold": true,
      "cutCount": 1,
      "seamAllowanceMM": 0,
      "ease": [
        {
          "ring": "girth.bust",
          "mm": 6e+01
        },
        {
          "ring": "girth.waist",
          "mm": 25
        }
      ],
      "reason": "on govde (kat)"
    },
    {
      "id": "arka_beden",
      "edges": [
        {
          "id": "cb",
          "kind": "fold",
          "role": "cb",
          "from": {
            "landmark": "landmark.nape",
            "xFactor": 0,
            "xOffsetMM": 0
          },
          "to": {
            "landmark": "landmark.waist",
            "xFactor": 0,
            "xOffsetMM": 0
          }
        },
        {
          "id": "waist_back",
          "kind": "seam",
          "role": "waist_back",
          "from": {
            "landmark": "landmark.waist",
            "xFactor": 0,
            "xOffsetMM": 0
          },
          "to": {
            "landmark": "landmark.waist",
            "xOf": "ringQuarter",
            "xFactor": 1,
            "xOffsetMM": 0
          },
          "notches": [0.5]
        },
        {
          "id": "side_back",
          "kind": "seam",
          "role": "side_back",
          "from": {
            "landmark": "landmark.waist",
            "xOf": "ringQuarter",
            "xFactor": 1,
            "xOffsetMM": 0
          },
          "to": {
            "landmark": "landmark.underarm",
            "xOf": "ringQuarter",
            "ring": "girth.bust",
            "xFactor": 1,
            "xOffsetMM": 0
          },
          "notches": [0.5]
        },
        {
          "id": "armhole_back.1",
          "kind": "seam",
          "role": "armhole_back",
          "rolePart": 1,
          "roleCount": 2,
          "from": {
            "landmark": "landmark.underarm",
            "xOf": "ringQuarter",
            "ring": "girth.bust",
            "xFactor": 1,
            "xOffsetMM": 0
          },
          "to": {
            "landmark": "landmark.underarm",
            "xOf": "widthHalf",
            "width": "width.crossBack",
            "xFactor": 1,
            "xOffsetMM": 0,
            "yLandmark": "landmark.underarm",
            "yLandmark2": "landmark.shoulderTip",
            "yLerp": 0.5
          },
          "control": [
            {
              "combo": [
                {
                  "w": 0.44771525016920644,
                  "landmark": "landmark.underarm",
                  "xOf": "ringQuarter",
                  "ring": "girth.bust",
                  "xFactor": 1,
                  "xOffsetMM": 0
                },
                {
                  "w": 0.5522847498307936,
                  "landmark": "landmark.underarm",
                  "xOf": "widthHalf",
                  "width": "width.crossBack",
                  "xFactor": 1,
                  "xOffsetMM": 0
                }
              ]
            },
            {
              "landmark": "landmark.underarm",
              "xOf": "widthHalf",
              "width": "width.crossBack",
              "xFactor": 1,
              "xOffsetMM": 0,
              "yLandmark": "landmark.underarm",
              "yLandmark2": "landmark.shoulderTip",
              "yLerp": 0.2761423749153968
            }
          ]
        },
        {
          "id": "armhole_back.2",
          "kind": "seam",
          "role": "armhole_back",
          "rolePart": 2,
          "roleCount": 2,
          "from": {
            "landmark": "landmark.underarm",
            "xOf": "widthHalf",
            "width": "width.crossBack",
            "xFactor": 1,
            "xOffsetMM": 0,
            "yLandmark": "landmark.underarm",
            "yLandmark2": "landmark.shoulderTip",
            "yLerp": 0.5
          },
          "to": {
            "landmark": "landmark.shoulderTip",
            "xFactor": 1,
            "xOffsetMM": 0
          },
          "control": [
            {
              "landmark": "landmark.underarm",
              "xOf": "widthHalf",
              "width": "width.crossBack",
              "xFactor": 1,
              "xOffsetMM": 0,
              "yLandmark": "landmark.underarm",
              "yLandmark2": "landmark.shoulderTip",
              "yLerp": 0.7761423749153968
            },
            {
              "combo": [
                {
                  "w": 0.44771525016920644,
                  "landmark": "landmark.shoulderTip",
                  "xFactor": 1,
                  "xOffsetMM": 0
                },
                {
                  "w": 0.5522847498307936,
                  "landmark": "landmark.underarm",
                  "xOf": "widthHalf",
                  "width": "width.crossBack",
                  "xFactor": 1,
                  "xOffsetMM": 0,
                  "yLandmark": "landmark.shoulderTip"
                }
              ]
            }
          ]
        },
        {
          "id": "shoulder",
          "kind": "seam",
          "role": "shoulder",
          "from": {
            "landmark": "landmark.shoulderTip",
            "xFactor": 1,
            "xOffsetMM": 0
          },
          "to": {
            "landmark": "landmark.neckBase",
            "xFactor": 1,
            "xOffsetMM": 0
          }
        },
        {
          "id": "neck_back",
          "kind": "cut",
          "role": "neck_back",
          "from": {
            "landmark": "landmark.neckBase",
            "xFactor": 1,
            "xOffsetMM": 0
          },
          "to": {
            "landmark": "landmark.nape",
            "xFactor": 0,
            "xOffsetMM": 0
          },
          "control": [
            {
              "landmark": "landmark.neckBase",
              "xFactor": 1,
              "xOffsetMM": 0,
              "yLandmark": "landmark.neckBase",
              "yLandmark2": "landmark.nape",
              "yLerp": 0.5522847498307936
            },
            {
              "landmark": "landmark.neckBase",
              "xFactor": 0.5522847498307936,
              "xOffsetMM": 0,
              "yLandmark": "landmark.nape"
            }
          ],
          "finish": "faced"
        }
      ],
      "grainDeg": 0,
      "onFold": true,
      "cutCount": 1,
      "seamAllowanceMM": 0,
      "ease": [
        {
          "ring": "girth.bust",
          "mm": 6e+01
        },
        {
          "ring": "girth.waist",
          "mm": 25
        }
      ],
      "reason": "arka govde (kat)"
    },
    {
      "id": "on_etek",
      "edges": [
        {
          "id": "cf",
          "kind": "fold",
          "role": "cf",
          "from": {
            "landmark": "landmark.waist",
            "xFactor": 0,
            "xOffsetMM": 0
          },
          "to": {
            "landmark": "landmark.knee",
            "xFactor": 0,
            "xOffsetMM": 0
          }
        },
        {
          "id": "hem_front",
          "kind": "cut",
          "role": "hem_front",
          "from": {
            "landmark": "landmark.knee",
            "xFactor": 0,
            "xOffsetMM": 0
          },
          "to": {
            "landmark": "landmark.hip",
            "xOf": "ringQuarter",
            "xFactor": 1,
            "xOffsetMM": 0,
            "yLandmark": "landmark.knee"
          },
          "finish": "hem"
        },
        {
          "id": "side_front.1",
          "kind": "seam",
          "role": "side_front",
          "rolePart": 1,
          "roleCount": 2,
          "from": {
            "landmark": "landmark.hip",
            "xOf": "ringQuarter",
            "xFactor": 1,
            "xOffsetMM": 0,
            "yLandmark": "landmark.knee"
          },
          "to": {
            "landmark": "landmark.hip",
            "xOf": "ringQuarter",
            "xFactor": 1,
            "xOffsetMM": 0
          }
        },
        {
          "id": "side_front.2",
          "kind": "seam",
          "role": "side_front",
          "rolePart": 2,
          "roleCount": 2,
          "from": {
            "landmark": "landmark.hip",
            "xOf": "ringQuarter",
            "xFactor": 1,
            "xOffsetMM": 0
          },
          "to": {
            "landmark": "landmark.waist",
            "xOf": "ringQuarter",
            "xFactor": 1,
            "xOffsetMM": 0
          }
        },
        {
          "id": "waist_front",
          "kind": "seam",
          "role": "waist_front",
          "from": {
            "landmark": "landmark.waist",
            "xOf": "ringQuarter",
            "xFactor": 1,
            "xOffsetMM": 0
          },
          "to": {
            "landmark": "landmark.waist",
            "xFactor": 0,
            "xOffsetMM": 0
          },
          "notches": [0.5]
        }
      ],
      "grainDeg": 0,
      "onFold": true,
      "cutCount": 1,
      "seamAllowanceMM": 0,
      "ease": [
        {
          "ring": "girth.waist",
          "mm": 25
        },
        {
          "ring": "girth.hip",
          "mm": 5e+01
        }
      ],
      "reason": "on etek (kat)"
    },
    {
      "id": "arka_etek",
      "edges": [
        {
          "id": "cb",
          "kind": "fold",
          "role": "cb",
          "from": {
            "landmark": "landmark.waist",
            "xFactor": 0,
            "xOffsetMM": 0
          },
          "to": {
            "landmark": "landmark.knee",
            "xFactor": 0,
            "xOffsetMM": 0
          }
        },
        {
          "id": "hem_back",
          "kind": "cut",
          "role": "hem_back",
          "from": {
            "landmark": "landmark.knee",
            "xFactor": 0,
            "xOffsetMM": 0
          },
          "to": {
            "landmark": "landmark.hip",
            "xOf": "ringQuarter",
            "xFactor": 1,
            "xOffsetMM": 0,
            "yLandmark": "landmark.knee"
          },
          "finish": "hem"
        },
        {
          "id": "side_back.1",
          "kind": "seam",
          "role": "side_back",
          "rolePart": 1,
          "roleCount": 2,
          "from": {
            "landmark": "landmark.hip",
            "xOf": "ringQuarter",
            "xFactor": 1,
            "xOffsetMM": 0,
            "yLandmark": "landmark.knee"
          },
          "to": {
            "landmark": "landmark.hip",
            "xOf": "ringQuarter",
            "xFactor": 1,
            "xOffsetMM": 0
          }
        },
        {
          "id": "side_back.2",
          "kind": "seam",
          "role": "side_back",
          "rolePart": 2,
          "roleCount": 2,
          "from": {
            "landmark": "landmark.hip",
            "xOf": "ringQuarter",
            "xFactor": 1,
            "xOffsetMM": 0
          },
          "to": {
            "landmark": "landmark.waist",
            "xOf": "ringQuarter",
            "xFactor": 1,
            "xOffsetMM": 0
          }
        },
        {
          "id": "waist_back",
          "kind": "seam",
          "role": "waist_back",
          "from": {
            "landmark": "landmark.waist",
            "xOf": "ringQuarter",
            "xFactor": 1,
            "xOffsetMM": 0
          },
          "to": {
            "landmark": "landmark.waist",
            "xFactor": 0,
            "xOffsetMM": 0
          },
          "notches": [0.5]
        }
      ],
      "grainDeg": 0,
      "onFold": true,
      "cutCount": 1,
      "seamAllowanceMM": 0,
      "ease": [
        {
          "ring": "girth.waist",
          "mm": 25
        },
        {
          "ring": "girth.hip",
          "mm": 5e+01
        }
      ],
      "reason": "arka etek (kat)"
    },
    {
      "id": "kol",
      "edges": [
        {
          "id": "cap_front",
          "kind": "seam",
          "role": "sleeve_cap",
          "rolePart": 1,
          "roleCount": 2,
          "from": {
            "landmark": "landmark.underarm",
            "xOf": "ringQuarter",
            "ring": "girth.biceps",
            "xFactor": 0,
            "xOffsetMM": 0,
            "yLandmark": "landmark.underarm",
            "yLandmark2": "landmark.shoulderTip",
            "yLerp": 0.6
          },
          "to": {
            "landmark": "landmark.underarm",
            "xOf": "ringQuarter",
            "ring": "girth.biceps",
            "xFactor": 2,
            "xOffsetMM": 0
          },
          "control": [
            {
              "landmark": "landmark.underarm",
              "xOf": "ringQuarter",
              "ring": "girth.biceps",
              "xFactor": 1.1045694996615871,
              "xOffsetMM": 0,
              "yLandmark": "landmark.underarm",
              "yLandmark2": "landmark.shoulderTip",
              "yLerp": 0.6
            },
            {
              "landmark": "landmark.underarm",
              "xOf": "ringQuarter",
              "ring": "girth.biceps",
              "xFactor": 2,
              "xOffsetMM": 0,
              "yLandmark": "landmark.underarm",
              "yLandmark2": "landmark.shoulderTip",
              "yLerp": 0.33137084989847615
            }
          ],
          "fitSeam": "kol_oyugu"
        },
        {
          "id": "underarm_front",
          "kind": "seam",
          "role": "sleeve_underarm",
          "from": {
            "landmark": "landmark.underarm",
            "xOf": "ringQuarter",
            "ring": "girth.biceps",
            "xFactor": 2,
            "xOffsetMM": 0
          },
          "to": {
            "landmark": "landmark.underarm",
            "xOf": "ringQuarter",
            "ring": "girth.biceps",
            "xFactor": 2,
            "xOffsetMM": 0,
            "yLandmark": "landmark.elbow"
          }
        },
        {
          "id": "hem",
          "kind": "cut",
          "role": "sleeve_hem",
          "from": {
            "landmark": "landmark.underarm",
            "xOf": "ringQuarter",
            "ring": "girth.biceps",
            "xFactor": 2,
            "xOffsetMM": 0,
            "yLandmark": "landmark.elbow"
          },
          "to": {
            "landmark": "landmark.underarm",
            "xOf": "ringQuarter",
            "ring": "girth.biceps",
            "xFactor": -2,
            "xOffsetMM": 0,
            "yLandmark": "landmark.elbow"
          },
          "finish": "hem"
        },
        {
          "id": "underarm_back",
          "kind": "seam",
          "role": "sleeve_underarm",
          "from": {
            "landmark": "landmark.underarm",
            "xOf": "ringQuarter",
            "ring": "girth.biceps",
            "xFactor": -2,
            "xOffsetMM": 0,
            "yLandmark": "landmark.elbow"
          },
          "to": {
            "landmark": "landmark.underarm",
            "xOf": "ringQuarter",
            "ring": "girth.biceps",
            "xFactor": -2,
            "xOffsetMM": 0
          }
        },
        {
          "id": "cap_back",
          "kind": "seam",
          "role": "sleeve_cap",
          "rolePart": 2,
          "roleCount": 2,
          "from": {
            "landmark": "landmark.underarm",
            "xOf": "ringQuarter",
            "ring": "girth.biceps",
            "xFactor": -2,
            "xOffsetMM": 0
          },
          "to": {
            "landmark": "landmark.underarm",
            "xOf": "ringQuarter",
            "ring": "girth.biceps",
            "xFactor": 0,
            "xOffsetMM": 0,
            "yLandmark": "landmark.underarm",
            "yLandmark2": "landmark.shoulderTip",
            "yLerp": 0.6
          },
          "control": [
            {
              "landmark": "landmark.underarm",
              "xOf": "ringQuarter",
              "ring": "girth.biceps",
              "xFactor": -2,
              "xOffsetMM": 0,
              "yLandmark": "landmark.underarm",
              "yLandmark2": "landmark.shoulderTip",
              "yLerp": 0.33137084989847615
            },
            {
              "landmark": "landmark.underarm",
              "xOf": "ringQuarter",
              "ring": "girth.biceps",
              "xFactor": -1.1045694996615871,
              "xOffsetMM": 0,
              "yLandmark": "landmark.underarm",
              "yLandmark2": "landmark.shoulderTip",
              "yLerp": 0.6
            }
          ],
          "fitSeam": "kol_oyugu"
        }
      ],
      "grainDeg": 0,
      "onFold": false,
      "cutCount": 2,
      "seamAllowanceMM": 0,
      "ease": [
        {
          "ring": "girth.biceps",
          "mm": 40.5
        }
      ],
      "reason": "kol (2 kes)"
    }
  ],
  "seams": [
    {
      "id": "omuz",
      "a": [
        {
          "panel": "on_beden",
          "edge": "shoulder"
        }
      ],
      "b": [
        {
          "panel": "arka_beden",
          "edge": "shoulder"
        }
      ],
      "reverse": false,
      "ratio": 1,
      "easeMM": 0,
      "reason": "omuz dikisi: omuz ucu <-> omuz ucu, boyun <-> boyun"
    },
    {
      "id": "yan_beden",
      "a": [
        {
          "panel": "on_beden",
          "edge": "side_front"
        }
      ],
      "b": [
        {
          "panel": "arka_beden",
          "edge": "side_back"
        }
      ],
      "reverse": false,
      "ratio": 1,
      "easeMM": 0,
      "notchFractions": [0.5],
      "reason": "govde yan dikisi: bel <-> bel, koltukalti <-> koltukalti"
    },
    {
      "id": "kol_oyugu",
      "a": [
        {
          "panel": "kol",
          "edge": "cap_back"
        },
        {
          "panel": "kol",
          "edge": "cap_front"
        }
      ],
      "b": [
        {
          "panel": "arka_beden",
          "edge": "armhole_back.1"
        },
        {
          "panel": "arka_beden",
          "edge": "armhole_back.2"
        },
        {
          "panel": "on_beden",
          "edge": "armhole_front.2"
        },
        {
          "panel": "on_beden",
          "edge": "armhole_front.1"
        }
      ],
      "reverse": false,
      "ratio": 1.04,
      "easeMM": 0,
      "reason": "kol kapagi -> kol oyugu; arka kose <-> arka koltukalti; ratio 1.04 = cap ease (engine/src/sleeve.hpp capEase 0.04, dokuma 3-5%)"
    },
    {
      "id": "bel",
      "a": [
        {
          "panel": "on_beden",
          "edge": "waist_front"
        },
        {
          "panel": "arka_beden",
          "edge": "waist_back"
        }
      ],
      "b": [
        {
          "panel": "on_etek",
          "edge": "waist_front"
        },
        {
          "panel": "arka_etek",
          "edge": "waist_back"
        }
      ],
      "reverse": false,
      "ratio": 1,
      "easeMM": 0,
      "notchFractions": [0.25, 0.75],
      "reason": "bel dikisi (govde -> etek): CF <-> CF, yan <-> yan, CB <-> CB"
    },
    {
      "id": "yan_etek",
      "a": [
        {
          "panel": "on_etek",
          "edge": "side_front.1"
        },
        {
          "panel": "on_etek",
          "edge": "side_front.2"
        }
      ],
      "b": [
        {
          "panel": "arka_etek",
          "edge": "side_back.1"
        },
        {
          "panel": "arka_etek",
          "edge": "side_back.2"
        }
      ],
      "reverse": false,
      "ratio": 1,
      "easeMM": 0,
      "reason": "etek yan dikisi: etek ucu <-> etek ucu, bel <-> bel"
    },
    {
      "id": "kol_alti",
      "a": [
        {
          "panel": "kol",
          "edge": "underarm_front"
        }
      ],
      "b": [
        {
          "panel": "kol",
          "edge": "underarm_back"
        }
      ],
      "reverse": true,
      "ratio": 1,
      "easeMM": 0,
      "reason": "kol alti dikisi: kose <-> kose, agiz <-> agiz (reverse)"
    }
  ],
  "rings": [
    {
      "id": "yaka",
      "role": "neck",
      "edges": [
        {
          "panel": "arka_beden",
          "edge": "neck_back"
        },
        {
          "panel": "on_beden",
          "edge": "neck_front"
        }
      ]
    },
    {
      "id": "kol_oyugu_halka",
      "role": "armhole",
      "edges": [
        {
          "panel": "on_beden",
          "edge": "armhole_front.1"
        },
        {
          "panel": "on_beden",
          "edge": "armhole_front.2"
        },
        {
          "panel": "arka_beden",
          "edge": "armhole_back.2"
        },
        {
          "panel": "arka_beden",
          "edge": "armhole_back.1"
        }
      ]
    },
    {
      "id": "bel_halka",
      "role": "waist_ring",
      "edges": [
        {
          "panel": "on_beden",
          "edge": "waist_front"
        },
        {
          "panel": "arka_beden",
          "edge": "waist_back"
        }
      ]
    },
    {
      "id": "etek_ucu",
      "role": "hem",
      "edges": [
        {
          "panel": "on_etek",
          "edge": "hem_front"
        },
        {
          "panel": "arka_etek",
          "edge": "hem_back"
        }
      ]
    },
    {
      "id": "kol_agzi",
      "role": "sleeve_hem",
      "edges": [
        {
          "panel": "kol",
          "edge": "hem"
        }
      ]
    }
  ],
  "ops": [
    {
      "op": "fitLength",
      "args": {
        "panel": "kol",
        "edge": "cap_front",
        "target": {
          "seam": "kol_oyugu",
          "ratio": 1.04,
          "easeMM": 0
        }
      }
    },
    {
      "op": "fitLength",
      "args": {
        "panel": "kol",
        "edge": "cap_back",
        "target": {
          "seam": "kol_oyugu",
          "ratio": 1.04,
          "easeMM": 0
        }
      }
    }
  ]
}
```

## F2b kapilari (karar ajani F2a-3, 5 Eyl 2026) — not degil KAPI, F3'e devredilmez

F2a hakeminin devrettigi dort kusur. Her biri F2b'de `grafdogrula` kurali / test olur; kabul bicimi:
kiran negatif ornek `graf_dikilebilir_check` negatif tablosunda + sayi. Sonuncusu gecince bu baslik
`docs/GRAF-IR.md`'den silinir ve kural "Degismezler" tablosuna tasinir. Sayilar burada tekrar edilmez;
kaynak dosya adiyla verilir (contract'a yazilir, koda gomulmez).

| # | kapi | kural (grafdogrula) | sayi / kaynak | kiran negatif ornek |
|---|---|---|---|---|
| 1 | `gecis` (giyilebilirlik) | Kapanisi (closure: fermuar/dugme/yirtmac dikisi) olmayan HER halka, bedende gecmesi gereken cevreden buyuk olmali: rol `neck` -> `girth.head`; rol `waist` / `hem` (etek ucu) -> `girth.hip`; rol `wrist`/`sleeveHem` -> `girth.hand` (el varsa; yoksa kural o role uygulanmaz ve adiyla soyler). Cevre, halkanin BEDENDE degerlenmis toplam uzunlugu (`halkalar[].toplamMM`). | `girth.head` body-v1'de YOK — F2b iscisi `contract/body-v1.json` gercek36 / croquis36 / gradeTablosu EU34-44'e ANSUR II head circumference ile ekler; tek kaynaksa `tek kaynak` etiketi. HEDEF §1.4: basi gecmeyen yaka giyilebilir degil. | taban grafta yaka halkasi 154.5 mm x 2 (kat) = 309 mm cevre; `girth.head` ~ 550-580 mm -> kapanissiz yaka KIRMIZI olmali (bugun 0 kirmizi = sessiz default). Test: taban graf degismeden `gecis` kurali eklenince yaka satiri kirmizi; `suppress`/`extendTo` ile yaka acilinca ya da closure dikisi eklenince yesil. |
| 2 | kol kapagi tepe G1 + Aldrich bandi | (a) kapak egrisi tepe noktasinda G1 surekli (sol/sag teget farki `toleranslar.tegetDeg` altinda). (b) kapak yuksekligi ve oyuk cevresi kaynakli banda: Aldrich EU38 kapak 130-150 mm, oyuk 40-44 cm; sayilar `contract/graf-v1.json` ya da `contract/garment-spec-v2.json`'a kaynak adiyla yazilir. | Fixture'daki 0.6 (kapak yuksekligi / dusus) ve 0.5 (icbukey nokta seviyesi) DOGRULANMADI oranlari `graf_ir_check.cpp` taban graftan CIKAR; yerine banda oturan kaynakli deger. Bugra kapak 149.9 mm (`KOSU/ciktilar/bugra-rapor.md:57`, motor 129.8, +20.1) KOR KONTROL: rapora yazilir, ayar hedefi degil (HEDEF §1.12). | tepe kontrol noktasi tek tarafta 15 mm kaydirilir -> G1 kirilir, kirmizi; kapak 120 mm -> band alti, kirmizi; oyuk 359 mm (bugunku taban) -> 400 alti, kirmizi. |
| 3 | `kavsakArtigiMM` sutun adi | `dikilebilir-*.md` "kapanma (mm)" sutunu ve `dikilebilir-*.json halkalar[].kapanmaMM` -> `kavsakArtigiMM`. Olculen sey halkanin kapanmasi degil, en buyuk kavsak boslugu; 0.00 gosterip baska sey olcmek sessiz default (HEDEF §2). `halka_kapanma` kural adi kalir (halka kapaniyor mu), sutun yalniz olcumun adini soyler. | ad degisimi, sayi yok | `graf_dikilebilir_check` eski `kapanmaMM` anahtarini json'da gorurse REDDEDER (F2a Turkce-alan modeli: sema `tanimsiz alan`, okuyucu `bilinmeyen alan`). |
| 4 | kol oyugu tepe centigi + bel pensleri | (a) `kol_oyugu` dikisinde omuz dikisinin kesisme kesiri `notchFractions`'a girer (a-zincirinde omuz dikisinin bittigi yer; b tarafinda `reverse` ile 1-f) — kapak tepe centigi buna eslesir. (b) taban grafa on/arka bel pensleri `op pens` ile `dartLeg` cifti olarak girer (apeks bustApex/arka kurek hizasi, esit bacak — `pens` kurali). | `contract/graf-v1.json toleranslar.centikMM`; pens derinligi `garment-spec-v2.json` bel bollugu farkindan (girth.bust - girth.waist payi), sabit yok | `centik`: omuz kesiri tek tarafta eksik -> kirmizi; `pens`: bacaklar 3 mm farkli -> kirmizi; iki ornek de `dikilebilir-negatif.md`'de. |

Bu dordu **F2b'nin** (bedende degerleme) isidir, F3'un (cizim) degil: giyilebilirlik ve kapak/oyuk
bandi bedende cozulen sayilardir; sutun adi ve centik/pens Edge/Panel/Stitch primitifidir (HEDEF §1.9).
