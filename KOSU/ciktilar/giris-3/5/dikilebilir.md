# 5. etsy-05.png — dikilebilir mi?

**Kaynak fotograf:** `GIRDI/hedef-fotograflar-3/etsy-05.png` (sha d7e45930ff2f)
**Gorunum:** on · **Arka:** turetildi (TURETILDI, fotograftan degil)
**Okuyan:** isci-A4-tur6 — dis LLM cagrisi YOK, llmCagri 0.

## Fotograftan ne okundu?

| kalem | okuma | guven |
|---|---|---|
| panel `on_beden_ust` | GORULDU — gogus ustu parca, altinda buzgu | 0.95 |
| panel `on_beden_alt` | GORULDU — gogus alti - bel arasi band | 0.9 |
| panel `on_etek` | GORULDU — pensli mini etek | 0.95 |
| panel `kol` | gorulmedi (tabandan) — kol YOK | 0.98 |
| kenar `on_beden/neck_front` | landmark.neckFront..landmark.bustLine oraninda **0.02**, kayik | 0.9 |
| kenar `on_etek/hem_front` | landmark.waist..landmark.knee oraninda **0.62**, hafif-kavis | 0.85 |
| dikis `gogus_alti_on` | on_beden_ust/alt ↔ on_beden_alt/ust, oran [1.3,1.4] | 0.9 |
| dikis `bel` | on_beden_alt/waist ↔ on_etek/waist, oran [1,1] | 0.7 |
| kapanma | arka_orta / fermuar | 0.4 |
| simetri | cfAyna true, cbAyna true | 0.95 |

## Olcum ne dedi? (celiski tablosu)

Yasa 5: celiskide **olcum kazanir**. Bos tablo "celiski yok" demek degildir.

| kalem | Claude (ne) | olcum (ne kadar) | kazanan | sonuc |
|---|---|---|---|---|
| — | — | — | — | tablo BOS; olculmedi[] bak |

## Motora ne gecti? (primitif emir listesi)

Okuma dogrudan graf-v1 primitifleriyle yazilir (vision-graf-v1 yasa 9); ceviri katmani YOK.
Motor (`grafuygula`) taban grafa bu 17 emri sirayla uyguladi; cizici (`grafciz --ops`) ops SONRASI grafi cizdi.
Bir emir reddedilseydi teslim duserdi (sessiz atlama yok).

| # | primitif | args | doguran okuma kalemi |
|---|---|---|---|
| 1 | `drop` | `{"panel":"kol","finish":"faced"}` | fotografta kol yok: kol paneli kalkar, kol oyugu pervazli serbest kenar |
| 2 | `reshapeEdge` | `{"panel":"on_beden","edge":"neck_front","from":{"landmark":"landmark.neckBase","xFactor":1.5,"yLandmark":"landmark.shoulderTip","yLandmark2":"landmark.neckBase"…` | kayik yaka: genis, CF'de sig |
| 3 | `reshapeEdge` | `{"panel":"arka_beden","edge":"neck_back","from":{"landmark":"landmark.neckBase","xFactor":1.5,"yLandmark":"landmark.shoulderTip","yLandmark2":"landmark.neckBase…` | arka kayik |
| 4 | `reshapeEdge` | `{"panel":"on_beden","edge":"dart_on_beden.1","to":{"landmark":"landmark.underarm","xOf":"ringQuarter","ring":"girth.waist","xFactor":0.35,"yLandmark":"landmark.…` | pens apeksi gogus alti dikisinin altina |
| 5 | `reshapeEdge` | `{"panel":"arka_beden","edge":"dart_arka_beden.1","to":{"landmark":"landmark.underarm","xOf":"ringQuarter","ring":"girth.waist","xFactor":0.35,"yLandmark":"landm…` | pens apeksi gogus alti dikisinin altina (arka) |
| 6 | `subdivide` | `{"panel":"on_beden","edge":"cf","fractions":[0.6375]}` | gogus alti yatay dikis: CF |
| 7 | `subdivide` | `{"panel":"on_beden","edge":"side_front","fractions":[0.6768]}` | gogus alti yatay dikis: yan |
| 8 | `split` | `{"panel":"on_beden","vertexA":"cf.2","vertexB":"side_front.2","panelA":"on_beden_alt","panelB":"on_beden_ust","seam":"gogus_alti_on","seamRatio":1}` | gogus alti yatay dikis |
| 9 | `subdivide` | `{"panel":"arka_beden","edge":"cb","fractions":[0.6867]}` | gogus alti yatay dikis: CB |
| 10 | `subdivide` | `{"panel":"arka_beden","edge":"side_back","fractions":[0.6768]}` | gogus alti yatay dikis: arka yan |
| 11 | `split` | `{"panel":"arka_beden","vertexA":"cb.2","vertexB":"side_back.2","panelA":"arka_beden_alt","panelB":"arka_beden_ust","seam":"gogus_alti_arka","seamRatio":1}` | gogus alti yatay dikis (arka) |
| 12 | `gather` | `{"panel":"on_beden_ust","edge":"gogus_alti_on.b","ratio":1.35}` | gogus buzgusu: ust parcanin alt kenari 1.35 kat |
| 13 | `extendTo` | `{"panel":"on_etek","edge":"hem_front","yLandmark":"landmark.hip","yOffsetMM":170}` | mini: kalca + ~17 cm |
| 14 | `extendTo` | `{"panel":"arka_etek","edge":"hem_back","yLandmark":"landmark.hip","yOffsetMM":170}` | mini: kalca + ~17 cm (arka ayni) |
| 15 | `flare` | `{"panel":"on_etek","edge":"hem_front","factor":1.15}` | hafif A |
| 16 | `flare` | `{"panel":"arka_etek","edge":"hem_back","factor":1.15}` | hafif A (arka ayni) |
| 17 | `closure` | `{"seam":"arka_orta_beden","type":"zipper","fromFraction":0,"toFraction":1}` | arka orta fermuar (cikarim) |

**Cozucu hedefi** (grafa oran YAZILMAZ, yasa 3; `grafuygula --hedef` halka bolluguna cevirir, contract cozucu.hedef sinirina kirpar): 0 adet.


- dogrulayici (gercek36): hedefler[] bos: okuma siluet olcumu tasimiyor
Sapma buyukse bu OLCUMUN ilanidir: siluet "bel/enGenis" orani giysinin bel/gogus cevre orani degildir (kollar, poz); okuma zaten ZAYIF/SUPHELI etiketi tasiyor. Motor hedefi yutmadi, kirptigini ve sapmayi yazdi.

## Cizildi mi?

| cikti | durum | bayt |
|---|---|---|
| flat.svg | OK (data-ops=17) | 24926 |
| flat.png | OK | 59670 |
| kalip-36.svg | OK | 13742 |
| kalip-36.png | OK | 25907 |

**grafdogrula (gercek36):** KOSTU — kirmizi hukum: **1** (supresyon: foto-d7e45930)

## Okunamayanlar (sessiz default YOK)

- bel dikisi var mi (ilan flat'inde gorunmuyor; tabanda var)
- arka

## Olculmedi

- siluet orani: ekran goruntusu (fotograf + flat + yazi), poz landmark kosulmadi

## Primitif kumesiyle YAZILAMAYANLAR (eksikPrimitif — kumeye eklenecek primitifin adresi)


