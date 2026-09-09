# 6. etsy-06.png — dikilebilir mi?

**Kaynak fotograf:** `GIRDI/hedef-fotograflar-3/etsy-06.png` (sha 751443d17724)
**Gorunum:** on · **Arka:** turetildi (TURETILDI, fotograftan degil)
**Okuyan:** isci-A4-tur6 — dis LLM cagrisi YOK, llmCagri 0.

## Fotograftan ne okundu?

| kalem | okuma | guven |
|---|---|---|
| panel `on_beden_ust2` | GORULDU — buzgulu gogus parcasi, kare ust kenar, ortada bag | 0.95 |
| panel `on_etek` | GORULDU — gogus altindan buzgulu bol etek | 0.95 |
| panel `aski_on` | GORULDU — genis buzgulu aski | 0.95 |
| panel `kol` | gorulmedi (tabandan) — kol YOK | 0.98 |
| kenar `on_beden_ust2/ust` | landmark.underarm..landmark.bustLine oraninda **0**, duz-buzgulu | 0.85 |
| kenar `on_etek/hem_front` | landmark.waist..landmark.knee oraninda **0.66**, hafif-kavis | 0.8 |
| dikis `gogus_alti_on` | on_beden_ust2/alt ↔ on_beden_alt2/ust, oran [1.4,1.6] | 0.9 |
| kapanma | on_orta / bag | 0.8 |
| simetri | cfAyna true, cbAyna true | 0.95 |

## Olcum ne dedi? (celiski tablosu)

Yasa 5: celiskide **olcum kazanir**. Bos tablo "celiski yok" demek degildir.

| kalem | Claude (ne) | olcum (ne kadar) | kazanan | sonuc |
|---|---|---|---|---|
| — | — | — | — | tablo BOS; olculmedi[] bak |

## Motora ne gecti? (primitif emir listesi)

Okuma dogrudan graf-v1 primitifleriyle yazilir (vision-graf-v1 yasa 9); ceviri katmani YOK.
Motor (`grafuygula`) taban grafa bu 28 emri sirayla uyguladi; cizici (`grafciz --ops`) ops SONRASI grafi cizdi.
Bir emir reddedilseydi teslim duserdi (sessiz atlama yok).

| # | primitif | args | doguran okuma kalemi |
|---|---|---|---|
| 1 | `drop` | `{"panel":"kol","finish":"faced"}` | fotografta kol yok: kol paneli kalkar, kol oyugu pervazli serbest kenar |
| 2 | `reshapeEdge` | `{"panel":"on_beden","edge":"dart_on_beden.1","to":{"landmark":"landmark.underarm","xOf":"ringQuarter","ring":"girth.waist","xFactor":0.35,"yLandmark":"landmark.…` | pens apeksi gogus alti dikisinin altina |
| 3 | `reshapeEdge` | `{"panel":"arka_beden","edge":"dart_arka_beden.1","to":{"landmark":"landmark.underarm","xOf":"ringQuarter","ring":"girth.waist","xFactor":0.35,"yLandmark":"landm…` | pens apeksi gogus alti dikisinin altina (arka) |
| 4 | `subdivide` | `{"panel":"on_beden","edge":"cf","fractions":[0.4024]}` | kare ust kenar: govde koltukalti hizasinda kesilir: CF'de kesim noktasi |
| 5 | `subdivide` | `{"panel":"on_beden","edge":"armhole_front.1","fractions":[0.257]}` | kare ust kenar: govde koltukalti hizasinda kesilir: kol oyugunda kesim noktasi (ust kenar yatay) |
| 6 | `split` | `{"panel":"on_beden","vertexA":"cf.2","vertexB":"armhole_front.1.2","panelA":"on_beden_alt","panelB":"on_beden_ust","seam":"ust_on","seamRatio":1}` | kare ust kenar: govde koltukalti hizasinda kesilir: ust govde ayri panel |
| 7 | `drop` | `{"panel":"on_beden_ust","finish":"faced"}` | kare ust kenar: govde koltukalti hizasinda kesilir: ust govde kalkar, ust kenar pervazli |
| 8 | `moveVertex` | `{"panel":"on_beden_alt","edge":"ust_on.a","to":{"landmark":"landmark.bustLine","xOf":"ringQuarter","ring":"girth.bust","xFactor":1,"yLandmark":"landmark.underar…` | kare ust kenar: govde koltukalti hizasinda kesilir: ust kenar YATAY (yan tepe tam yTop hizasina; kol oyugu kesri yaklasikti, ortada chevron yapiyordu) |
| 9 | `subdivide` | `{"panel":"arka_beden","edge":"cb","fractions":[0.4834]}` | kare ust kenar: govde koltukalti hizasinda kesilir: CB'de kesim noktasi |
| 10 | `subdivide` | `{"panel":"arka_beden","edge":"armhole_back.1","fractions":[0.257]}` | kare ust kenar: govde koltukalti hizasinda kesilir: arka kol oyugunda kesim noktasi |
| 11 | `split` | `{"panel":"arka_beden","vertexA":"cb.2","vertexB":"armhole_back.1.2","panelA":"arka_beden_alt","panelB":"arka_beden_ust","seam":"ust_arka","seamRatio":1}` | kare ust kenar: govde koltukalti hizasinda kesilir: arka ust govde ayri panel |
| 12 | `drop` | `{"panel":"arka_beden_ust","finish":"faced"}` | kare ust kenar: govde koltukalti hizasinda kesilir: arka ust govde kalkar |
| 13 | `moveVertex` | `{"panel":"arka_beden_alt","edge":"ust_arka.a","to":{"landmark":"landmark.bustLine","xOf":"ringQuarter","ring":"girth.bust","xFactor":1,"yLandmark":"landmark.und…` | kare ust kenar: govde koltukalti hizasinda kesilir: arka ust kenar yatay |
| 14 | `sew` | `{"seam":"arka_orta_beden","a":[{"panel":"arka_beden_alt","edge":"cb.2"}],"b":[{"panel":"arka_beden_alt","edge":"cb.2"}],"reverse":true,"ratio":1}` | arka orta kapanma: drop ile dusen arka orta dikisi yeniden (cb.2 kendi aynasiyla) |
| 15 | `closure` | `{"seam":"arka_orta_beden","type":"zipper","fromFraction":0,"toFraction":1}` | arka orta fermuar (fotografta arka gorunmuyor: cikarim) |
| 16 | `subdivide` | `{"panel":"on_beden_alt","edge":"cf.2","fractions":[0.3935]}` | gogus alti dikis: CF |
| 17 | `subdivide` | `{"panel":"on_beden_alt","edge":"side_front","fractions":[0.6768]}` | gogus alti dikis: yan |
| 18 | `split` | `{"panel":"on_beden_alt","vertexA":"cf.2.2","vertexB":"side_front.2","panelA":"on_beden_alt2","panelB":"on_beden_ust2","seam":"gogus_alti_on","seamRatio":1}` | gogus alti dikis |
| 19 | `subdivide` | `{"panel":"arka_beden_alt","edge":"cb.2","fractions":[0.3935]}` | gogus alti dikis: CB |
| 20 | `subdivide` | `{"panel":"arka_beden_alt","edge":"side_back","fractions":[0.6768]}` | gogus alti dikis: arka yan |
| 21 | `split` | `{"panel":"arka_beden_alt","vertexA":"cb.2.2","vertexB":"side_back.2","panelA":"arka_beden_alt2","panelB":"arka_beden_ust2","seam":"gogus_alti_arka","seamRatio":…` | gogus alti dikis (arka) |
| 22 | `gather` | `{"panel":"on_beden_ust2","edge":"gogus_alti_on.b","ratio":1.25}` | gogus buzgusu: ust parcanin alt kenari 1.25 kat |
| 23 | `addPanel` | `{"onto":"on_beden_ust2","panel":{"id":"aski_on","edges":[{"id":"ic","kind":"cut","role":"strap","from":{"landmark":"landmark.bustLine","xOf":"ringQuarter","ring…` | genis aski (45 mm), buzgulu |
| 24 | `addPanel` | `{"onto":"arka_beden_ust2","panel":{"id":"aski_arka","edges":[{"id":"ic","kind":"cut","role":"strap","from":{"landmark":"landmark.bustLine","xOf":"ringQuarter","…` | genis aski (45 mm), buzgulu |
| 25 | `extendTo` | `{"panel":"on_etek","edge":"hem_front","yLandmark":"landmark.hip","yOffsetMM":200}` | mini: kalca + ~20 cm |
| 26 | `extendTo` | `{"panel":"arka_etek","edge":"hem_back","yLandmark":"landmark.hip","yOffsetMM":200}` | mini: kalca + ~20 cm (arka ayni) |
| 27 | `flare` | `{"panel":"on_etek","edge":"hem_front","factor":1.3}` | buzgulu etek acik |
| 28 | `flare` | `{"panel":"arka_etek","edge":"hem_back","factor":1.3}` | buzgulu etek acik (arka ayni) |

**Cozucu hedefi** (grafa oran YAZILMAZ, yasa 3; `grafuygula --hedef` halka bolluguna cevirir, contract cozucu.hedef sinirina kirpar): 0 adet.


- dogrulayici (gercek36): hedefler[] bos: okuma siluet olcumu tasimiyor
Sapma buyukse bu OLCUMUN ilanidir: siluet "bel/enGenis" orani giysinin bel/gogus cevre orani degildir (kollar, poz); okuma zaten ZAYIF/SUPHELI etiketi tasiyor. Motor hedefi yutmadi, kirptigini ve sapmayi yazdi.

## Cizildi mi?

| cikti | durum | bayt |
|---|---|---|
| flat.svg | OK (data-ops=28) | 23835 |
| flat.png | OK | 46226 |
| kalip-36.svg | OK | 15422 |
| kalip-36.png | OK | 22678 |

**grafdogrula (gercek36):** KOSTU — kirmizi hukum: **0**

## Okunamayanlar (sessiz default YOK)

- ilan flat'inde bel dikisi YOK (etek gogus altindan iner); tabanda bel dikisi var: gogus alti band + bel dikisi + buzgulu etek yazildi
- bagcik
- askinin buzgusu

## Olculmedi

- siluet orani: ekran goruntusu (fotograf + flat + yazi), poz landmark kosulmadi

## Primitif kumesiyle YAZILAMAYANLAR (eksikPrimitif — kumeye eklenecek primitifin adresi)

- PRIMITIF: bagcik/fiyonk (ties) kapanma var ama cizimde bag yok
- OKUMA: etegi dogrudan gogus alti dikisine dikmek = on_beden_alt2'yi drop + etegi ust dikise sew (bu turda yapilmadi)
- MOTOR: etek bel buzgusu YAZILMADI — bel zinciri iki kenar (pens arasi), gather kenar basina bumpSeamRatio carpiyor (1.6 x 1.6 = 2.56 hedef; olculdu 2026-09-09), coklu kenar zincirinde oran bozuluyor
