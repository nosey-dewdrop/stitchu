# GRAF IR — bir giysi grafi, iki beden, iki cikti (F2a, 2026-09-05)

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
| **Anchor** | tek landmark terimi | `landmark`, `xOf` (landmark · ringFront · ringBack · ringQuarter · scalarHalf), `ring`, `oran`, `ofsetMM`, `yLandmark`, `yLandmark2`, `yOran`, `yOfsetMM` |
| **RefPoint** | nokta = Anchor'larin afin birlesimi (agirliklar 1'e toplanir) | tek terim: Anchor nesnesi; cok terim: `{"combo":[{w,...}]}` |
| **Edge** | iki RefPoint arasi dogru (control bos) ya da kubik (2 control) | `id`, `kind` (cut · seam · fold · dartLeg), `role`, `rolePart/roleCount`, `from`, `to`, `control`, `finish`, `notches`, `gatherRatio` |
| **Panel** | kapali kenar halkasi = bir kez kesilecek parca | `id`, `edges`, `grainDeg`, `onFold`, `cutCount`, `seamAllowanceMM`, `bolluk[]` (halka basina cevre mm), `gerekce` |
| **Seam** | iki kenar KUMESI + oran: `len(a) = ratio x len(b) + easeMM` | `id`, `a[]`, `b[]`, `ratio`, `easeMM`, `notchFractions`, `closure{type,from,to}`, `gerekce` |
| **Ring** | aciklik (yaka, kol oyugu, bel, etek ucu, kol agzi) — sanal dikis kapanmasini olcer | `id`, `role`, `edges[]` |
| **Garment** | paneller + dikisler + halkalar + op gecmisi | `id`, `version`, `notes`, `panels`, `seams`, `rings`, `ops[{op,args}]` |

**Degerleme** (`eval(RefPoint, EvalCtx{body, bollukMM, onArkaEsit})`):
`x = oran x taban + ofsetMM`; taban `xOf`'a gore landmark.x · `G(1-arkaPay)/2` · `G arkaPay/2` · `G/4` ·
`genislik/2`, `G = halka cevresi + bolluk` — **kumas = bedene bolluk alani**, cevre orantili buyur.
`y = yLandmark.y (+ yOran x (yLandmark2.y - yLandmark.y)) + yOfsetMM`. Bilinmeyen landmark adiyla firlatir.

## Degismezler (dogrulayici kurallari, `contract/graf-v1.json toleranslar`)

| kural | hukum | esik / kaynak |
|---|---|---|
| `sema` | belge sozlesmenin alan/enum/tip diliyle ayni | — |
| `panel_kapali` | `edges[i].to == edges[i+1].from` YAPISAL (landmark terimleri esit), >= 3 kenar, tekil id | — |
| `referans` | her EdgeRef var olan panel/kenara gider | — |
| `kenar_turu` | seam -> bir Seam'de; cut -> dikissiz + `finish`; fold -> `onFold` + x=0; dartLeg -> cift, ortak apeks, esit bacak | pens 2.0 mm (validator.hpp dartSumTolerance + URBN zinciri) |
| `dikis_uzunluk` | `\|len(a) - (ratio x len(b) + ease)\| <= tol`, ratio aralikta | 2.0 mm (body-v1 ayniInsan ile ayni URBN 1/8 in zinciri; CLO 3.0 ustu; DOGRULANMADI etiketi ayni) · ratio [1.0, 3.5] (primitives-v1) |
| `centik` | `seam.notchFractions` iki tarafta da panel centigiyle bulusur | 0.5 mm (notch_alignment_check.cpp repo konvansiyonu) |
| `kendini_kesme` | degerlenen kontur (16 adim) kendini kesmez | — |
| `halka_kapanma` | **sanal dikis**: halkanin ardisik kenarlari kavsaklarda bulusur (dikis / kose / kat aynasi); kavsak boslugu = o dikisin uzunluk artigi; her kenara bir uctan girilir obur uctan cikilir; kavsagi olmayan halka KOPUK | 2.0 mm |

Bilgi satirlari (hukum degil): rijit 2B yerlestirme pozlari (dikis agaci BFS, F6 patlatilmis gorunum
icin), dikis uc boslugu (kiris uyumsuzlugu — egri/dogru dikilebilir), panel alan/cevre.
Tolerans NaN ise dogrulayici **adiyla reddeder** (sayi koda gomulu degil).

## Op tablosu (`grafop.hpp`, hepsi saf: `Garment -> OpResult{ok, hata, g}`)

| op | args | ne yapar | degismez |
|---|---|---|---|
| `subdivide` | panel, edge, fractions[] | kenari kesirlerde boler (De Casteljau, RefPoint uzayinda) | rol PARCALI (k/n), toplam uzunluk korunur, dikis/halka referanslari parcalara acilir |
| `pens` (dart) | panel, edge, atFraction, intakeOran, apex, legId | kenardan intakeOran kadar iceri alir: sol + 2 dartLeg + sag | bacaklar insadan esit (apeks agiz ortasinin ustundeyse), kalan kenar (1-intake) x eski |
| `gather` | panel, edge, ratio | kenari kendi dogrultusunda ratio kat uzatir (kat kenarina dayaniyorsa x=0 etrafinda) | uzunluk tam ratio kat; tasidigi Seam.ratio guncellenir, buzulen taraf a |
| `flare` | panel, edge, factor | serbest (cut) kenari factor kat acar | dikisli kenara reddedilir (gather onerir) |
| `extend` / `shorten` | panel, edge, deltaMM | kenari +y / -y tasir (komsu kenarlar birlikte) | dusey komsu kenar tam delta uzar/kisalir |
| `extendTo` | panel, edge, yLandmark, yOfsetMM | kenarin y tabanini baska landmark'a baglar (diz -> bilek) | y == landmark.y + ofset |
| `split` | panel, vertexA, vertexB, panelA, panelB, seam, seamRatio | paneli iki kose arasinda ikiye boler, yeni dikis ekler | kenar toplami n+2, iki panel kapali, roller iki panelde parcali, referanslar yeni panellere tasinir |
| `overlay` | host, edges[], excessRatio, panel, seamPrefix | konagin kopyasi ust katman; sayilan kenarlar TEK homotetiyle excessRatio kat, konaga dikilir | konak BAYT-AYNI; her kenar tam ratio kat (egri dahil) |
| `attach` | hostPanel, hostEdge, panel, edge, ratio, seam | yeni panel (fiyonk/cep/volan) konak kenara dikilir | konak bayt-ayni; acik panel reddedilir |
| `reshapeEdge` | panel, edge, from?/to?/control? | kenarin uc/kontrol noktalarini yeniden yazar | komsu kenar kosesi birlikte |
| `moveVertex` | panel, edge, to | kenar baslangic kosesini tasir | iki komsu kenar ayni noktada |
| `mirror` | panel, newId | x-aynasi yeni panel | kenar sayisi ayni, x -> -x |
| `closure` | seam, type, fromFraction, toFraction | dikisin bir bolumune kapama (zipper/buttons/hooks/ties/open) | paneller bayt-ayni |
| `bulge` | panel, edge, dMM, nx, ny, hedefMM, bodyId | kubik kenarin kontrollerini (nx,ny) yonunde kaydirir — `fitLength`'in sayisal cozumunun kaydi | — |
| `fitLength` (cozucu) | panel, edge, hedefMM, body, dMax, tol | kenar yay uzunlugunu verilen bedende hedefe getiren bulge'i tarama + bisection ile bulur | bulunamazsa adiyla reddeder |

**Edit modeli.** Her op yalniz adi gecen panel(ler)i degistirir; digerleri **bayt-ayni** kalir
(edit-locality yasasi grafa tasindi; `graf_op_check` her opta olcer). Kayit `Garment.ops`'a eklenir;
`replay(taban, ops)` ayni JSON'u verir (spec-diff deseni, Zoo/KittyCAD). F3c dogal dilden bu kayitlari
dolduracak ("yakayi 2 cm derinlestir" = `moveVertex on_beden/cf {landmark.neckFront, oran 0, yOfsetMM 20}`).
Aralik sayilari (ratio, flare) `contract araliklar`'dan; OpCtx bos ise op reddeder.

**K2/K5 kok sebebi.** `KOSU/ciktilar/primitif-DUSEN-*.txt`: roba/kup bolmesi kol oyugunun adini
dusuruyordu. Grafta kenar bolununce rol **parcali** tasinir (`rolePart/roleCount`); `graf_op_check`
split ornegi: `armhole_back` iki ayri panelde 1/4 ve 2/4 olarak yasar, `kol_oyugu` dikisi iki paneli
de gorur.

## Taban graf (fixture) ve dikilebilirlik

`graf_ir_check` taban elbiseyi kurar (on/arka govde + on/arka etek, kat; kol 2 kes), kol kapagini
`fitLength` ile gercek36'da `1.04 x kol oyugu`na (sleeve.hpp capEase) cozer, `graf.json`'u yazar.
Bolluk: `garment-spec-v2.json` easeBust/Waist/Hip (Threads/RTW + Aldrich), biceps `sleeve.hpp
bicepsEase 0.15`. Yan dikisler cevre/4 (ringQuarter): on/arka insadan esit. Kol oyugunun icbukey
noktasi `width.crossFront/2` (body-v1). **Uydurulanlar adiyla** (`notes` alani): kapak yuksekligi
orani 0.6 ve cross-front seviyesi 0.5 DOGRULANMADI; taban oyuk 359 mm Aldrich 40-44 cm bandinin
altinda (scye depth bollugu yok) — F2b/F3 kaynakli kurar.

`graf_dikilebilir_check` gercek36: **61 hukum, 0 kirmizi** — 6 dikis artigi 0.000, 3 centik, 5 panel
temiz, 5 halka kapali (yaka: kat aynasi + omuz; kol oyugu: omuz + yan; bel: yan + kat; etek ucu:
yan_etek + kat; kol agzi: kol_alti). EU38: 0 kirmizi (kapak artigi +0.51 mm). croquis36: yalniz
`kol_oyugu` kirmizi (-73 mm — fit gercek36'ya yapildi; flat icin F3 croquis'te yeniden fit eder).
Negatif tablo: `KOSU/ciktilar/graf-ilk/dikilebilir-negatif.md` (her kural icin kiran ornek).

### KOSU/ciktilar/graf-ilk/graf.json

```json
{
  "id": "taban-elbise",
  "version": "graf-v1",
  "notes": "TABAN GRAF (F2a fixture). Bolluk: contract/garment-spec-v2.json quantities easeBustMM/easeWaistMM/easeHipMM (Threads/RTW + Aldrich); kol bollugu engine/src/sleeve.hpp bicepsEase 0.15 x girth.biceps (Brian default). Yan dikis ve bel iki tarafta cevre/4 (ringQuarter): on/arka yan dikisler insadan esit. Egri kontrol noktalari kubik ceyrek-daire katsayisi kappa=4(sqrt2-1)/3 ile (turetilmis). UYDURULANLAR ADIYLA: (1) kol kapagi yuksekligi koltukalti->omuz ucu dususunun 0.6'si — DOGRULANMADI; Aldrich EU38 kapak bandi 130-150 mm'nin altinda kalir, cunku taban kol oyugu (scye depth bollugu yok) Aldrich 40-44 cm bandinin altinda; oyugun icbukey noktasi width.crossFront/2 (body-v1), y'si dususun ortasi (0.5, DOGRULANMADI); F2b/F3 oyugu ve kapagi kaynakli kurar. (2) etek duz (kalca genisligi dize kadar). (3) yaka pervazli (faced), etek ucu kivrilir (hem). Kapak uzunlugu fitLength ile gercek36'da kol oyugu x 1.04'e (sleeve.hpp capEase) cozuldu; kaydi ops'ta (bulge).",
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
            "oran": 0,
            "ofsetMM": 0
          },
          "to": {
            "landmark": "landmark.waist",
            "oran": 0,
            "ofsetMM": 0
          }
        },
        {
          "id": "waist_front",
          "kind": "seam",
          "role": "waist_front",
          "from": {
            "landmark": "landmark.waist",
            "oran": 0,
            "ofsetMM": 0
          },
          "to": {
            "landmark": "landmark.waist",
            "xOf": "ringQuarter",
            "oran": 1,
            "ofsetMM": 0
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
            "oran": 1,
            "ofsetMM": 0
          },
          "to": {
            "landmark": "landmark.underarm",
            "xOf": "ringQuarter",
            "ring": "girth.bust",
            "oran": 1,
            "ofsetMM": 0
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
            "oran": 1,
            "ofsetMM": 0
          },
          "to": {
            "landmark": "landmark.underarm",
            "xOf": "scalarHalf",
            "ring": "width.crossFront",
            "oran": 1,
            "ofsetMM": 0,
            "yLandmark": "landmark.underarm",
            "yLandmark2": "landmark.shoulderTip",
            "yOran": 0.5
          },
          "control": [
            {
              "combo": [
                {
                  "w": 0.44771525016920644,
                  "landmark": "landmark.underarm",
                  "xOf": "ringQuarter",
                  "ring": "girth.bust",
                  "oran": 1,
                  "ofsetMM": 0
                },
                {
                  "w": 0.5522847498307936,
                  "landmark": "landmark.underarm",
                  "xOf": "scalarHalf",
                  "ring": "width.crossFront",
                  "oran": 1,
                  "ofsetMM": 0
                }
              ]
            },
            {
              "landmark": "landmark.underarm",
              "xOf": "scalarHalf",
              "ring": "width.crossFront",
              "oran": 1,
              "ofsetMM": 0,
              "yLandmark": "landmark.underarm",
              "yLandmark2": "landmark.shoulderTip",
              "yOran": 0.2761423749153968
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
            "xOf": "scalarHalf",
            "ring": "width.crossFront",
            "oran": 1,
            "ofsetMM": 0,
            "yLandmark": "landmark.underarm",
            "yLandmark2": "landmark.shoulderTip",
            "yOran": 0.5
          },
          "to": {
            "landmark": "landmark.shoulderTip",
            "oran": 1,
            "ofsetMM": 0
          },
          "control": [
            {
              "landmark": "landmark.underarm",
              "xOf": "scalarHalf",
              "ring": "width.crossFront",
              "oran": 1,
              "ofsetMM": 0,
              "yLandmark": "landmark.underarm",
              "yLandmark2": "landmark.shoulderTip",
              "yOran": 0.7761423749153968
            },
            {
              "combo": [
                {
                  "w": 0.44771525016920644,
                  "landmark": "landmark.shoulderTip",
                  "oran": 1,
                  "ofsetMM": 0
                },
                {
                  "w": 0.5522847498307936,
                  "landmark": "landmark.underarm",
                  "xOf": "scalarHalf",
                  "ring": "width.crossFront",
                  "oran": 1,
                  "ofsetMM": 0,
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
            "oran": 1,
            "ofsetMM": 0
          },
          "to": {
            "landmark": "landmark.neckBase",
            "oran": 1,
            "ofsetMM": 0
          }
        },
        {
          "id": "neck_front",
          "kind": "cut",
          "role": "neck_front",
          "from": {
            "landmark": "landmark.neckBase",
            "oran": 1,
            "ofsetMM": 0
          },
          "to": {
            "landmark": "landmark.neckFront",
            "oran": 0,
            "ofsetMM": 0
          },
          "control": [
            {
              "landmark": "landmark.neckBase",
              "oran": 1,
              "ofsetMM": 0,
              "yLandmark": "landmark.neckBase",
              "yLandmark2": "landmark.neckFront",
              "yOran": 0.5522847498307936
            },
            {
              "landmark": "landmark.neckBase",
              "oran": 0.5522847498307936,
              "ofsetMM": 0,
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
      "bolluk": [
        {
          "ring": "girth.bust",
          "mm": 6e+01
        },
        {
          "ring": "girth.waist",
          "mm": 25
        }
      ],
      "gerekce": "on govde (kat)"
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
            "oran": 0,
            "ofsetMM": 0
          },
          "to": {
            "landmark": "landmark.waist",
            "oran": 0,
            "ofsetMM": 0
          }
        },
        {
          "id": "waist_back",
          "kind": "seam",
          "role": "waist_back",
          "from": {
            "landmark": "landmark.waist",
            "oran": 0,
            "ofsetMM": 0
          },
          "to": {
            "landmark": "landmark.waist",
            "xOf": "ringQuarter",
            "oran": 1,
            "ofsetMM": 0
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
            "oran": 1,
            "ofsetMM": 0
          },
          "to": {
            "landmark": "landmark.underarm",
            "xOf": "ringQuarter",
            "ring": "girth.bust",
            "oran": 1,
            "ofsetMM": 0
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
            "oran": 1,
            "ofsetMM": 0
          },
          "to": {
            "landmark": "landmark.underarm",
            "xOf": "scalarHalf",
            "ring": "width.crossBack",
            "oran": 1,
            "ofsetMM": 0,
            "yLandmark": "landmark.underarm",
            "yLandmark2": "landmark.shoulderTip",
            "yOran": 0.5
          },
          "control": [
            {
              "combo": [
                {
                  "w": 0.44771525016920644,
                  "landmark": "landmark.underarm",
                  "xOf": "ringQuarter",
                  "ring": "girth.bust",
                  "oran": 1,
                  "ofsetMM": 0
                },
                {
                  "w": 0.5522847498307936,
                  "landmark": "landmark.underarm",
                  "xOf": "scalarHalf",
                  "ring": "width.crossBack",
                  "oran": 1,
                  "ofsetMM": 0
                }
              ]
            },
            {
              "landmark": "landmark.underarm",
              "xOf": "scalarHalf",
              "ring": "width.crossBack",
              "oran": 1,
              "ofsetMM": 0,
              "yLandmark": "landmark.underarm",
              "yLandmark2": "landmark.shoulderTip",
              "yOran": 0.2761423749153968
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
            "xOf": "scalarHalf",
            "ring": "width.crossBack",
            "oran": 1,
            "ofsetMM": 0,
            "yLandmark": "landmark.underarm",
            "yLandmark2": "landmark.shoulderTip",
            "yOran": 0.5
          },
          "to": {
            "landmark": "landmark.shoulderTip",
            "oran": 1,
            "ofsetMM": 0
          },
          "control": [
            {
              "landmark": "landmark.underarm",
              "xOf": "scalarHalf",
              "ring": "width.crossBack",
              "oran": 1,
              "ofsetMM": 0,
              "yLandmark": "landmark.underarm",
              "yLandmark2": "landmark.shoulderTip",
              "yOran": 0.7761423749153968
            },
            {
              "combo": [
                {
                  "w": 0.44771525016920644,
                  "landmark": "landmark.shoulderTip",
                  "oran": 1,
                  "ofsetMM": 0
                },
                {
                  "w": 0.5522847498307936,
                  "landmark": "landmark.underarm",
                  "xOf": "scalarHalf",
                  "ring": "width.crossBack",
                  "oran": 1,
                  "ofsetMM": 0,
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
            "oran": 1,
            "ofsetMM": 0
          },
          "to": {
            "landmark": "landmark.neckBase",
            "oran": 1,
            "ofsetMM": 0
          }
        },
        {
          "id": "neck_back",
          "kind": "cut",
          "role": "neck_back",
          "from": {
            "landmark": "landmark.neckBase",
            "oran": 1,
            "ofsetMM": 0
          },
          "to": {
            "landmark": "landmark.nape",
            "oran": 0,
            "ofsetMM": 0
          },
          "control": [
            {
              "landmark": "landmark.neckBase",
              "oran": 1,
              "ofsetMM": 0,
              "yLandmark": "landmark.neckBase",
              "yLandmark2": "landmark.nape",
              "yOran": 0.5522847498307936
            },
            {
              "landmark": "landmark.neckBase",
              "oran": 0.5522847498307936,
              "ofsetMM": 0,
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
      "bolluk": [
        {
          "ring": "girth.bust",
          "mm": 6e+01
        },
        {
          "ring": "girth.waist",
          "mm": 25
        }
      ],
      "gerekce": "arka govde (kat)"
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
            "oran": 0,
            "ofsetMM": 0
          },
          "to": {
            "landmark": "landmark.knee",
            "oran": 0,
            "ofsetMM": 0
          }
        },
        {
          "id": "hem_front",
          "kind": "cut",
          "role": "hem_front",
          "from": {
            "landmark": "landmark.knee",
            "oran": 0,
            "ofsetMM": 0
          },
          "to": {
            "landmark": "landmark.hip",
            "xOf": "ringQuarter",
            "oran": 1,
            "ofsetMM": 0,
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
            "oran": 1,
            "ofsetMM": 0,
            "yLandmark": "landmark.knee"
          },
          "to": {
            "landmark": "landmark.hip",
            "xOf": "ringQuarter",
            "oran": 1,
            "ofsetMM": 0
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
            "oran": 1,
            "ofsetMM": 0
          },
          "to": {
            "landmark": "landmark.waist",
            "xOf": "ringQuarter",
            "oran": 1,
            "ofsetMM": 0
          }
        },
        {
          "id": "waist_front",
          "kind": "seam",
          "role": "waist_front",
          "from": {
            "landmark": "landmark.waist",
            "xOf": "ringQuarter",
            "oran": 1,
            "ofsetMM": 0
          },
          "to": {
            "landmark": "landmark.waist",
            "oran": 0,
            "ofsetMM": 0
          },
          "notches": [0.5]
        }
      ],
      "grainDeg": 0,
      "onFold": true,
      "cutCount": 1,
      "seamAllowanceMM": 0,
      "bolluk": [
        {
          "ring": "girth.waist",
          "mm": 25
        },
        {
          "ring": "girth.hip",
          "mm": 5e+01
        }
      ],
      "gerekce": "on etek (kat)"
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
            "oran": 0,
            "ofsetMM": 0
          },
          "to": {
            "landmark": "landmark.knee",
            "oran": 0,
            "ofsetMM": 0
          }
        },
        {
          "id": "hem_back",
          "kind": "cut",
          "role": "hem_back",
          "from": {
            "landmark": "landmark.knee",
            "oran": 0,
            "ofsetMM": 0
          },
          "to": {
            "landmark": "landmark.hip",
            "xOf": "ringQuarter",
            "oran": 1,
            "ofsetMM": 0,
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
            "oran": 1,
            "ofsetMM": 0,
            "yLandmark": "landmark.knee"
          },
          "to": {
            "landmark": "landmark.hip",
            "xOf": "ringQuarter",
            "oran": 1,
            "ofsetMM": 0
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
            "oran": 1,
            "ofsetMM": 0
          },
          "to": {
            "landmark": "landmark.waist",
            "xOf": "ringQuarter",
            "oran": 1,
            "ofsetMM": 0
          }
        },
        {
          "id": "waist_back",
          "kind": "seam",
          "role": "waist_back",
          "from": {
            "landmark": "landmark.waist",
            "xOf": "ringQuarter",
            "oran": 1,
            "ofsetMM": 0
          },
          "to": {
            "landmark": "landmark.waist",
            "oran": 0,
            "ofsetMM": 0
          },
          "notches": [0.5]
        }
      ],
      "grainDeg": 0,
      "onFold": true,
      "cutCount": 1,
      "seamAllowanceMM": 0,
      "bolluk": [
        {
          "ring": "girth.waist",
          "mm": 25
        },
        {
          "ring": "girth.hip",
          "mm": 5e+01
        }
      ],
      "gerekce": "arka etek (kat)"
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
            "oran": 0,
            "ofsetMM": 0,
            "yLandmark": "landmark.underarm",
            "yLandmark2": "landmark.shoulderTip",
            "yOran": 0.6
          },
          "to": {
            "landmark": "landmark.underarm",
            "xOf": "ringQuarter",
            "ring": "girth.biceps",
            "oran": 2,
            "ofsetMM": 0
          },
          "control": [
            {
              "landmark": "landmark.underarm",
              "xOf": "ringQuarter",
              "ring": "girth.biceps",
              "oran": 1.1045694996615871,
              "ofsetMM": -4.5558767562912434,
              "yLandmark": "landmark.underarm",
              "yLandmark2": "landmark.shoulderTip",
              "yOran": 0.6,
              "yOfsetMM": 8.319217436064639
            },
            {
              "landmark": "landmark.underarm",
              "xOf": "ringQuarter",
              "ring": "girth.biceps",
              "oran": 2,
              "ofsetMM": -4.5558767562912434,
              "yLandmark": "landmark.underarm",
              "yLandmark2": "landmark.shoulderTip",
              "yOran": 0.33137084989847615,
              "yOfsetMM": 8.319217436064639
            }
          ]
        },
        {
          "id": "underarm_front",
          "kind": "seam",
          "role": "sleeve_underarm",
          "from": {
            "landmark": "landmark.underarm",
            "xOf": "ringQuarter",
            "ring": "girth.biceps",
            "oran": 2,
            "ofsetMM": 0
          },
          "to": {
            "landmark": "landmark.underarm",
            "xOf": "ringQuarter",
            "ring": "girth.biceps",
            "oran": 2,
            "ofsetMM": 0,
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
            "oran": 2,
            "ofsetMM": 0,
            "yLandmark": "landmark.elbow"
          },
          "to": {
            "landmark": "landmark.underarm",
            "xOf": "ringQuarter",
            "ring": "girth.biceps",
            "oran": -2,
            "ofsetMM": 0,
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
            "oran": -2,
            "ofsetMM": 0,
            "yLandmark": "landmark.elbow"
          },
          "to": {
            "landmark": "landmark.underarm",
            "xOf": "ringQuarter",
            "ring": "girth.biceps",
            "oran": -2,
            "ofsetMM": 0
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
            "oran": -2,
            "ofsetMM": 0
          },
          "to": {
            "landmark": "landmark.underarm",
            "xOf": "ringQuarter",
            "ring": "girth.biceps",
            "oran": 0,
            "ofsetMM": 0,
            "yLandmark": "landmark.underarm",
            "yLandmark2": "landmark.shoulderTip",
            "yOran": 0.6
          },
          "control": [
            {
              "landmark": "landmark.underarm",
              "xOf": "ringQuarter",
              "ring": "girth.biceps",
              "oran": -2,
              "ofsetMM": 4.5558767562912434,
              "yLandmark": "landmark.underarm",
              "yLandmark2": "landmark.shoulderTip",
              "yOran": 0.33137084989847615,
              "yOfsetMM": 8.319217436064639
            },
            {
              "landmark": "landmark.underarm",
              "xOf": "ringQuarter",
              "ring": "girth.biceps",
              "oran": -1.1045694996615871,
              "ofsetMM": 4.5558767562912434,
              "yLandmark": "landmark.underarm",
              "yLandmark2": "landmark.shoulderTip",
              "yOran": 0.6,
              "yOfsetMM": 8.319217436064639
            }
          ]
        }
      ],
      "grainDeg": 0,
      "onFold": false,
      "cutCount": 2,
      "seamAllowanceMM": 0,
      "bolluk": [
        {
          "ring": "girth.biceps",
          "mm": 40.5
        }
      ],
      "gerekce": "kol (2 kes)"
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
      "ratio": 1,
      "easeMM": 0,
      "gerekce": "omuz dikisi"
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
      "ratio": 1,
      "easeMM": 0,
      "notchFractions": [0.5],
      "gerekce": "govde yan dikisi"
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
          "edge": "armhole_front.1"
        },
        {
          "panel": "on_beden",
          "edge": "armhole_front.2"
        }
      ],
      "ratio": 1.04,
      "easeMM": 0,
      "gerekce": "kol kapagi -> kol oyugu; ratio 1.04 = cap ease (engine/src/sleeve.hpp capEase 0.04, dokuma 3-5%)"
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
      "ratio": 1,
      "easeMM": 0,
      "notchFractions": [0.25, 0.75],
      "gerekce": "bel dikisi (govde -> etek)"
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
      "ratio": 1,
      "easeMM": 0,
      "gerekce": "etek yan dikisi"
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
      "ratio": 1,
      "easeMM": 0,
      "gerekce": "kol alti dikisi"
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
      "op": "bulge",
      "args": {
        "panel": "kol",
        "edge": "cap_front",
        "dMM": 9.485008791089058,
        "nx": -0.480323936080205,
        "ny": 0.8770911676835078,
        "hedefMM": 186.8118704234968,
        "bodyId": "gercek36"
      }
    },
    {
      "op": "bulge",
      "args": {
        "panel": "kol",
        "edge": "cap_back",
        "dMM": 9.485008791089058,
        "nx": 0.480323936080205,
        "ny": 0.8770911676835078,
        "hedefMM": 186.8118704234968,
        "bodyId": "gercek36"
      }
    }
  ]
}
```
