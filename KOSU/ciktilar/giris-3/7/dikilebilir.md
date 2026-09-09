# 7. etsy-07.png — dikilebilir mi?

**Kaynak fotograf:** `GIRDI/hedef-fotograflar-3/etsy-07.png` (sha d7151490bf84)
**Gorunum:** on · **Arka:** turetildi (TURETILDI, fotograftan degil)
**Okuyan:** isci-A4-tur6 — dis LLM cagrisi YOK, llmCagri 0.

## Fotograftan ne okundu?

| kalem | okuma | guven |
|---|---|---|
| panel `on_govde_alt` | GORULDU — tek parca dar govde, yanda buzgu/drape | 0.95 |
| panel `band_on` | GORULDU — omuz acik band | 0.9 |
| panel `kol` | gorulmedi (tabandan) — kol YOK | 0.98 |
| kenar `on_govde_alt/hem_front` | landmark.waist..landmark.knee oraninda **0.55**, duz | 0.85 |
| dikis `yan` | on_govde_alt/side ↔ arka_govde_alt/side, oran [1,1.3] | 0.6 |
| kapanma | arka_orta / fermuar | 0.3 |
| simetri | cfAyna false, cbAyna true | 0.9 |

## Olcum ne dedi? (celiski tablosu)

Yasa 5: celiskide **olcum kazanir**. Bos tablo "celiski yok" demek degildir.

| kalem | Claude (ne) | olcum (ne kadar) | kazanan | sonuc |
|---|---|---|---|---|
| — | — | — | — | tablo BOS; olculmedi[] bak |

## Motora ne gecti? (primitif emir listesi)

Okuma dogrudan graf-v1 primitifleriyle yazilir (vision-graf-v1 yasa 9); ceviri katmani YOK.
Motor (`grafuygula`) taban grafa bu 21 emri sirayla uyguladi; cizici (`grafciz --ops`) ops SONRASI grafi cizdi.
Bir emir reddedilseydi teslim duserdi (sessiz atlama yok).

| # | primitif | args | doguran okuma kalemi |
|---|---|---|---|
| 1 | `drop` | `{"panel":"kol","finish":"faced"}` | fotografta kol yok: kol paneli kalkar, kol oyugu pervazli serbest kenar |
| 2 | `merge` | `{"seam":"bel","panelA":"on_beden","panelB":"on_etek","panel":"on_govde"}` | fotografta bel dikisi yok: on beden + on etek tek panel (bel pensi ic halka pense doner) |
| 3 | `merge` | `{"seam":"bel","panelA":"arka_beden","panelB":"arka_etek","panel":"arka_govde"}` | ayni: arka |
| 4 | `subdivide` | `{"panel":"on_govde","edge":"cf.1","fractions":[0.3891]}` | straplez ust kenar (fotografta band tek omuzdan iner: ASIMETRIK, ayna kisiti): CF'de kesim noktasi |
| 5 | `subdivide` | `{"panel":"on_govde","edge":"armhole_front.1","fractions":[0.312]}` | straplez ust kenar (fotografta band tek omuzdan iner: ASIMETRIK, ayna kisiti): kol oyugunda kesim noktasi (ust kenar yatay) |
| 6 | `split` | `{"panel":"on_govde","vertexA":"cf.1.2","vertexB":"armhole_front.1.2","panelA":"on_govde_alt","panelB":"on_govde_ust","seam":"ust_on","seamRatio":1}` | straplez ust kenar (fotografta band tek omuzdan iner: ASIMETRIK, ayna kisiti): ust govde ayri panel |
| 7 | `drop` | `{"panel":"on_govde_ust","finish":"faced"}` | straplez ust kenar (fotografta band tek omuzdan iner: ASIMETRIK, ayna kisiti): ust govde kalkar, ust kenar pervazli |
| 8 | `moveVertex` | `{"panel":"on_govde_alt","edge":"ust_on.a","to":{"landmark":"landmark.bustLine","xOf":"ringQuarter","ring":"girth.bust","xFactor":1,"yLandmark":"landmark.underar…` | straplez ust kenar (fotografta band tek omuzdan iner: ASIMETRIK, ayna kisiti): ust kenar YATAY (yan tepe tam yTop hizasina; kol oyugu kesri yaklasikti, ortada chevron yapiyordu) |
| 9 | `reshapeEdge` | `{"panel":"on_govde_alt","edge":"armhole_front.1.1","control":[]}` | straplez ust kenar (fotografta band tek omuzdan iner: ASIMETRIK, ayna kisiti): yan ust parca DUZ (kol oyugu kubiginin kalan kontrolleri kosede kulak yapiyordu) |
| 10 | `subdivide` | `{"panel":"arka_govde","edge":"cb.1","fractions":[0.4719]}` | straplez ust kenar (fotografta band tek omuzdan iner: ASIMETRIK, ayna kisiti): CB'de kesim noktasi |
| 11 | `subdivide` | `{"panel":"arka_govde","edge":"armhole_back.1","fractions":[0.312]}` | straplez ust kenar (fotografta band tek omuzdan iner: ASIMETRIK, ayna kisiti): arka kol oyugunda kesim noktasi |
| 12 | `split` | `{"panel":"arka_govde","vertexA":"cb.1.2","vertexB":"armhole_back.1.2","panelA":"arka_govde_alt","panelB":"arka_govde_ust","seam":"ust_arka","seamRatio":1}` | straplez ust kenar (fotografta band tek omuzdan iner: ASIMETRIK, ayna kisiti): arka ust govde ayri panel |
| 13 | `drop` | `{"panel":"arka_govde_ust","finish":"faced"}` | straplez ust kenar (fotografta band tek omuzdan iner: ASIMETRIK, ayna kisiti): arka ust govde kalkar |
| 14 | `moveVertex` | `{"panel":"arka_govde_alt","edge":"ust_arka.a","to":{"landmark":"landmark.bustLine","xOf":"ringQuarter","ring":"girth.bust","xFactor":1,"yLandmark":"landmark.und…` | straplez ust kenar (fotografta band tek omuzdan iner: ASIMETRIK, ayna kisiti): arka ust kenar yatay |
| 15 | `reshapeEdge` | `{"panel":"arka_govde_alt","edge":"armhole_back.1.1","control":[]}` | straplez ust kenar (fotografta band tek omuzdan iner: ASIMETRIK, ayna kisiti): arka yan ust parca duz |
| 16 | `sew` | `{"seam":"arka_orta_beden","a":[{"panel":"arka_govde_alt","edge":"cb.1.2"}],"b":[{"panel":"arka_govde_alt","edge":"cb.1.2"}],"reverse":true,"ratio":1}` | arka orta kapanma: drop ile dusen arka orta dikisi yeniden (cb.2 kendi aynasiyla) |
| 17 | `closure` | `{"seam":"arka_orta_beden","type":"zipper","fromFraction":0,"toFraction":1}` | arka orta fermuar (fotografta arka gorunmuyor: cikarim) |
| 18 | `addPanel` | `{"onto":"on_govde_alt","panel":{"id":"band_on","edges":[{"id":"ust","kind":"cut","role":"band","from":{"landmark":"landmark.waist","xFactor":0,"yLandmark":"land…` | omuz bandi: ust kenar boyunca yuze dikili band (40 mm) |
| 19 | `addPanel` | `{"onto":"arka_govde_alt","panel":{"id":"band_arka","edges":[{"id":"ust","kind":"cut","role":"band","from":{"landmark":"landmark.waist","xFactor":0,"yLandmark":"…` | arka band (ayni) |
| 20 | `extendTo` | `{"panel":"on_govde_alt","edge":"hem_front","yLandmark":"landmark.hip","yOffsetMM":140}` | mini: kalca + ~14 cm |
| 21 | `extendTo` | `{"panel":"arka_govde_alt","edge":"hem_back","yLandmark":"landmark.hip","yOffsetMM":140}` | mini: kalca + ~14 cm (arka ayni) |

**Cozucu hedefi** (grafa oran YAZILMAZ, yasa 3; `grafuygula --hedef` halka bolluguna cevirir, contract cozucu.hedef sinirina kirpar): 0 adet.


- dogrulayici (gercek36): hedefler[] bos: okuma siluet olcumu tasimiyor
Sapma buyukse bu OLCUMUN ilanidir: siluet "bel/enGenis" orani giysinin bel/gogus cevre orani degildir (kollar, poz); okuma zaten ZAYIF/SUPHELI etiketi tasiyor. Motor hedefi yutmadi, kirptigini ve sapmayi yazdi.

## Cizildi mi?

| cikti | durum | bayt |
|---|---|---|
| flat.svg | OK (data-ops=21) | 22429 |
| flat.png | OK | 36392 |
| kalip-36.svg | OK | 8950 |
| kalip-36.png | OK | 27601 |

**grafdogrula (gercek36):** KOSTU — kirmizi hukum: **0**

## Okunamayanlar (sessiz default YOK)

- asimetrik band ve yan drape (ilan flat'inde tek omuz + yanda buzgu)
- arka

## Olculmedi

- siluet orani: ekran goruntusu (fotograf + flat + yazi), poz landmark kosulmadi

## Primitif kumesiyle YAZILAMAYANLAR (eksikPrimitif — kumeye eklenecek primitifin adresi)

- PRIMITIF: asimetri (kat eksenli cizim); drape/buzgu cizgileri (flat'te gorsel doku, graf'ta gather)
