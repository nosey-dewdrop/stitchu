# 10. etsy-10.png — dikilebilir mi?

**Kaynak fotograf:** `GIRDI/hedef-fotograflar-3/etsy-10.png` (sha 26d8c73c016b)
**Gorunum:** on · **Arka:** fotograf (fotograftan)
**Okuyan:** isci-A4-tur6 — dis LLM cagrisi YOK, llmCagri 0.

## Fotograftan ne okundu?

| kalem | okuma | guven |
|---|---|---|
| panel `on_beden_ust2` | GORULDU — kare ust kenar, altinda buzgu | 0.95 |
| panel `on_etek` | GORULDU — A-line mini (ilan flat'inde bel dikisi yok) | 0.9 |
| panel `aski_on` | GORULDU — genis aski | 0.95 |
| panel `kol` | gorulmedi (tabandan) — kol YOK | 0.98 |
| kenar `on_beden_ust2/ust` | landmark.underarm..landmark.bustLine oraninda **0**, duz-kare | 0.9 |
| kenar `on_etek/hem_front` | landmark.waist..landmark.knee oraninda **0.66**, hafif-kavis | 0.85 |
| dikis `gogus_alti_on` | on_beden_ust2/alt ↔ on_beden_alt2/ust, oran [1.2,1.3] | 0.85 |
| kapanma | arka_orta / fermuar | 0.7 |
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
| 4 | `subdivide` | `{"panel":"on_beden","edge":"cf","fractions":[0.4157]}` | kare ust kenar: CF'de kesim noktasi |
| 5 | `subdivide` | `{"panel":"on_beden","edge":"armhole_front.1","fractions":[0.202]}` | kare ust kenar: kol oyugunda kesim noktasi (ust kenar yatay) |
| 6 | `split` | `{"panel":"on_beden","vertexA":"cf.2","vertexB":"armhole_front.1.2","panelA":"on_beden_alt","panelB":"on_beden_ust","seam":"ust_on","seamRatio":1}` | kare ust kenar: ust govde ayri panel |
| 7 | `drop` | `{"panel":"on_beden_ust","finish":"faced"}` | kare ust kenar: ust govde kalkar, ust kenar pervazli |
| 8 | `moveVertex` | `{"panel":"on_beden_alt","edge":"ust_on.a","to":{"landmark":"landmark.bustLine","xOf":"ringQuarter","ring":"girth.bust","xFactor":1,"yLandmark":"landmark.underar…` | kare ust kenar: ust kenar YATAY (yan tepe tam yTop hizasina; kol oyugu kesri yaklasikti, ortada chevron yapiyordu) |
| 9 | `subdivide` | `{"panel":"arka_beden","edge":"cb","fractions":[0.4949]}` | kare ust kenar: CB'de kesim noktasi |
| 10 | `subdivide` | `{"panel":"arka_beden","edge":"armhole_back.1","fractions":[0.202]}` | kare ust kenar: arka kol oyugunda kesim noktasi |
| 11 | `split` | `{"panel":"arka_beden","vertexA":"cb.2","vertexB":"armhole_back.1.2","panelA":"arka_beden_alt","panelB":"arka_beden_ust","seam":"ust_arka","seamRatio":1}` | kare ust kenar: arka ust govde ayri panel |
| 12 | `drop` | `{"panel":"arka_beden_ust","finish":"faced"}` | kare ust kenar: arka ust govde kalkar |
| 13 | `moveVertex` | `{"panel":"arka_beden_alt","edge":"ust_arka.a","to":{"landmark":"landmark.bustLine","xOf":"ringQuarter","ring":"girth.bust","xFactor":1,"yLandmark":"landmark.und…` | kare ust kenar: arka ust kenar yatay |
| 14 | `sew` | `{"seam":"arka_orta_beden","a":[{"panel":"arka_beden_alt","edge":"cb.2"}],"b":[{"panel":"arka_beden_alt","edge":"cb.2"}],"reverse":true,"ratio":1}` | arka orta kapanma: drop ile dusen arka orta dikisi yeniden (cb.2 kendi aynasiyla) |
| 15 | `closure` | `{"seam":"arka_orta_beden","type":"zipper","fromFraction":0,"toFraction":1}` | arka orta fermuar (fotografta arka gorunmuyor: cikarim) |
| 16 | `subdivide` | `{"panel":"on_beden_alt","edge":"cf.2","fractions":[0.3797]}` | gogus alti dikis (kavisli, altinda buzgu): CF |
| 17 | `subdivide` | `{"panel":"on_beden_alt","edge":"side_front","fractions":[0.6768]}` | gogus alti dikis (kavisli, altinda buzgu): yan |
| 18 | `split` | `{"panel":"on_beden_alt","vertexA":"cf.2.2","vertexB":"side_front.2","panelA":"on_beden_alt2","panelB":"on_beden_ust2","seam":"gogus_alti_on","seamRatio":1}` | gogus alti dikis (kavisli, altinda buzgu) |
| 19 | `subdivide` | `{"panel":"arka_beden_alt","edge":"cb.2","fractions":[0.3797]}` | gogus alti dikis (kavisli, altinda buzgu): CB |
| 20 | `subdivide` | `{"panel":"arka_beden_alt","edge":"side_back","fractions":[0.6768]}` | gogus alti dikis (kavisli, altinda buzgu): arka yan |
| 21 | `split` | `{"panel":"arka_beden_alt","vertexA":"cb.2.2","vertexB":"side_back.2","panelA":"arka_beden_alt2","panelB":"arka_beden_ust2","seam":"gogus_alti_arka","seamRatio":…` | gogus alti dikis (kavisli, altinda buzgu) (arka) |
| 22 | `gather` | `{"panel":"on_beden_ust2","edge":"gogus_alti_on.b","ratio":1.25}` | gogus buzgusu: ust parcanin alt kenari 1.25 kat |
| 23 | `addPanel` | `{"onto":"on_beden_ust2","panel":{"id":"aski_on","edges":[{"id":"ic","kind":"cut","role":"strap","from":{"landmark":"landmark.bustLine","xOf":"ringQuarter","ring…` | genis aski (40 mm) |
| 24 | `addPanel` | `{"onto":"arka_beden_ust2","panel":{"id":"aski_arka","edges":[{"id":"ic","kind":"cut","role":"strap","from":{"landmark":"landmark.bustLine","xOf":"ringQuarter","…` | genis aski (40 mm) |
| 25 | `extendTo` | `{"panel":"on_etek","edge":"hem_front","yLandmark":"landmark.hip","yOffsetMM":190}` | mini: kalca + ~19 cm |
| 26 | `extendTo` | `{"panel":"arka_etek","edge":"hem_back","yLandmark":"landmark.hip","yOffsetMM":190}` | mini: kalca + ~19 cm (arka ayni) |
| 27 | `flare` | `{"panel":"on_etek","edge":"hem_front","factor":1.4}` | A-line: etek ucu belirgin acik |
| 28 | `flare` | `{"panel":"arka_etek","edge":"hem_back","factor":1.4}` | A-line: etek ucu belirgin acik (arka ayni) |

**Cozucu hedefi** (grafa oran YAZILMAZ, yasa 3; `grafuygula --hedef` halka bolluguna cevirir, contract cozucu.hedef sinirina kirpar): 0 adet.


- dogrulayici (gercek36): hedefler[] bos: okuma siluet olcumu tasimiyor
Sapma buyukse bu OLCUMUN ilanidir: siluet "bel/enGenis" orani giysinin bel/gogus cevre orani degildir (kollar, poz); okuma zaten ZAYIF/SUPHELI etiketi tasiyor. Motor hedefi yutmadi, kirptigini ve sapmayi yazdi.

## Cizildi mi?

| cikti | durum | bayt |
|---|---|---|
| flat.svg | OK (data-ops=28) | 23973 |
| flat.png | OK | 41419 |
| kalip-36.svg | OK | 16295 |
| kalip-36.png | OK | 21622 |

**grafdogrula (gercek36):** KOSTU — kirmizi hukum: **0**

## Okunamayanlar (sessiz default YOK)

- ilan flat'inde bel dikisi yok (tabanda var)
- dantel biye

## Olculmedi

- siluet orani: ekran goruntusu (fotograf + flat + yazi), poz landmark kosulmadi

## Primitif kumesiyle YAZILAMAYANLAR (eksikPrimitif — kumeye eklenecek primitifin adresi)


