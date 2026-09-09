# 9. etsy-09.png — dikilebilir mi?

**Kaynak fotograf:** `GIRDI/hedef-fotograflar-3/etsy-09.png` (sha b92d60974028)
**Gorunum:** on · **Arka:** turetildi (TURETILDI, fotograftan degil)
**Okuyan:** isci-A4-tur6 — dis LLM cagrisi YOK, llmCagri 0.

## Fotograftan ne okundu?

| kalem | okuma | guven |
|---|---|---|
| panel `on_beden_alt` | GORULDU — bustier: kap dikisli, sweetheart ust kenar | 0.95 |
| panel `on_etek` | GORULDU — pensli mini etek | 0.95 |
| panel `aski_on` | GORULDU — ince aski, ucunda fiyonk | 0.95 |
| panel `kol` | gorulmedi (tabandan) — kol YOK | 0.98 |
| kenar `on_beden_alt/ust` | landmark.underarm..landmark.bustLine oraninda **0.3**, sweetheart | 0.85 |
| kenar `on_etek/hem_front` | landmark.waist..landmark.knee oraninda **0.55**, duz | 0.85 |
| dikis `bel` | on_beden_alt/waist ↔ on_etek/waist, oran [1,1] | 0.9 |
| dikis `kap` | on_beden_alt/kap ↔ on_beden_alt/orta, oran [1,1] | 0.85 |
| kapanma | arka_orta / fermuar | 0.4 |
| simetri | cfAyna true, cbAyna true | 0.95 |

## Olcum ne dedi? (celiski tablosu)

Yasa 5: celiskide **olcum kazanir**. Bos tablo "celiski yok" demek degildir.

| kalem | Claude (ne) | olcum (ne kadar) | kazanan | sonuc |
|---|---|---|---|---|
| — | — | — | — | tablo BOS; olculmedi[] bak |

## Motora ne gecti? (primitif emir listesi)

Okuma dogrudan graf-v1 primitifleriyle yazilir (vision-graf-v1 yasa 9); ceviri katmani YOK.
Motor (`grafuygula`) taban grafa bu 22 emri sirayla uyguladi; cizici (`grafciz --ops`) ops SONRASI grafi cizdi.
Bir emir reddedilseydi teslim duserdi (sessiz atlama yok).

| # | primitif | args | doguran okuma kalemi |
|---|---|---|---|
| 1 | `drop` | `{"panel":"kol","finish":"faced"}` | fotografta kol yok: kol paneli kalkar, kol oyugu pervazli serbest kenar |
| 2 | `reshapeEdge` | `{"panel":"on_beden","edge":"dart_on_beden.1","to":{"landmark":"landmark.underarm","xOf":"ringQuarter","ring":"girth.waist","xFactor":0.35,"yLandmark":"landmark.…` | pens apeksi ust kenar altina |
| 3 | `reshapeEdge` | `{"panel":"arka_beden","edge":"dart_arka_beden.1","to":{"landmark":"landmark.underarm","xOf":"ringQuarter","ring":"girth.waist","xFactor":0.35,"yLandmark":"landm…` | pens apeksi ust kenar altina (arka) |
| 4 | `subdivide` | `{"panel":"on_beden","edge":"cf","fractions":[0.4423]}` | bustier ust kenar: CF'de kesim noktasi |
| 5 | `subdivide` | `{"panel":"on_beden","edge":"armhole_front.1","fractions":[0.092]}` | bustier ust kenar: kol oyugunda kesim noktasi (ust kenar yatay) |
| 6 | `split` | `{"panel":"on_beden","vertexA":"cf.2","vertexB":"armhole_front.1.2","panelA":"on_beden_alt","panelB":"on_beden_ust","seam":"ust_on","seamRatio":1}` | bustier ust kenar: ust govde ayri panel |
| 7 | `drop` | `{"panel":"on_beden_ust","finish":"faced"}` | bustier ust kenar: ust govde kalkar, ust kenar pervazli |
| 8 | `moveVertex` | `{"panel":"on_beden_alt","edge":"ust_on.a","to":{"landmark":"landmark.bustLine","xOf":"ringQuarter","ring":"girth.bust","xFactor":1,"yLandmark":"landmark.underar…` | bustier ust kenar: ust kenar YATAY (yan tepe tam yTop hizasina; kol oyugu kesri yaklasikti, ortada chevron yapiyordu) |
| 9 | `subdivide` | `{"panel":"arka_beden","edge":"cb","fractions":[0.518]}` | bustier ust kenar: CB'de kesim noktasi |
| 10 | `subdivide` | `{"panel":"arka_beden","edge":"armhole_back.1","fractions":[0.092]}` | bustier ust kenar: arka kol oyugunda kesim noktasi |
| 11 | `split` | `{"panel":"arka_beden","vertexA":"cb.2","vertexB":"armhole_back.1.2","panelA":"arka_beden_alt","panelB":"arka_beden_ust","seam":"ust_arka","seamRatio":1}` | bustier ust kenar: arka ust govde ayri panel |
| 12 | `drop` | `{"panel":"arka_beden_ust","finish":"faced"}` | bustier ust kenar: arka ust govde kalkar |
| 13 | `moveVertex` | `{"panel":"arka_beden_alt","edge":"ust_arka.a","to":{"landmark":"landmark.bustLine","xOf":"ringQuarter","ring":"girth.bust","xFactor":1,"yLandmark":"landmark.und…` | bustier ust kenar: arka ust kenar yatay |
| 14 | `sew` | `{"seam":"arka_orta_beden","a":[{"panel":"arka_beden_alt","edge":"cb.2"}],"b":[{"panel":"arka_beden_alt","edge":"cb.2"}],"reverse":true,"ratio":1}` | arka orta kapanma: drop ile dusen arka orta dikisi yeniden (cb.2 kendi aynasiyla) |
| 15 | `closure` | `{"seam":"arka_orta_beden","type":"zipper","fromFraction":0,"toFraction":1}` | arka orta fermuar (fotografta arka gorunmuyor: cikarim) |
| 16 | `reshapeEdge` | `{"panel":"on_beden_alt","edge":"ust_on.a","control":[{"landmark":"landmark.bustLine","xOf":"ringQuarter","ring":"girth.bust","xFactor":0.95,"yLandmark":"landmar…` | sweetheart: ust kenar CF'de alcak, kap ustunde yuksek (kubik) |
| 17 | `addPanel` | `{"onto":"on_beden_alt","panel":{"id":"aski_on","edges":[{"id":"ic","kind":"cut","role":"strap","from":{"landmark":"landmark.bustLine","xOf":"ringQuarter","ring"…` | ince aski (10 mm), kap ustunden omuza (ucta fiyonk) |
| 18 | `addPanel` | `{"onto":"arka_beden_alt","panel":{"id":"aski_arka","edges":[{"id":"ic","kind":"cut","role":"strap","from":{"landmark":"landmark.bustLine","xOf":"ringQuarter","r…` | ince aski (10 mm), kap ustunden omuza (ucta fiyonk) |
| 19 | `extendTo` | `{"panel":"on_etek","edge":"hem_front","yLandmark":"landmark.hip","yOffsetMM":160}` | mini: kalca + ~16 cm |
| 20 | `extendTo` | `{"panel":"arka_etek","edge":"hem_back","yLandmark":"landmark.hip","yOffsetMM":160}` | mini: kalca + ~16 cm (arka ayni) |
| 21 | `flare` | `{"panel":"on_etek","edge":"hem_front","factor":1.08}` | hafif A |
| 22 | `flare` | `{"panel":"arka_etek","edge":"hem_back","factor":1.08}` | hafif A (arka ayni) |

**Cozucu hedefi** (grafa oran YAZILMAZ, yasa 3; `grafuygula --hedef` halka bolluguna cevirir, contract cozucu.hedef sinirina kirpar): 0 adet.


- dogrulayici (gercek36): hedefler[] bos: okuma siluet olcumu tasimiyor
Sapma buyukse bu OLCUMUN ilanidir: siluet "bel/enGenis" orani giysinin bel/gogus cevre orani degildir (kollar, poz); okuma zaten ZAYIF/SUPHELI etiketi tasiyor. Motor hedefi yutmadi, kirptigini ve sapmayi yazdi.

## Cizildi mi?

| cikti | durum | bayt |
|---|---|---|
| flat.svg | OK (data-ops=22) | 22094 |
| flat.png | OK | 50130 |
| kalip-36.svg | OK | 12798 |
| kalip-36.png | OK | 30439 |

**grafdogrula (gercek36):** KOSTU — kirmizi hukum: **0**

## Okunamayanlar (sessiz default YOK)

- kap dikisleri (pens olarak birakildi)
- fiyonk
- ust dikis izleri

## Olculmedi

- siluet orani: ekran goruntusu (fotograf + flat + yazi), poz landmark kosulmadi

## Primitif kumesiyle YAZILAMAYANLAR (eksikPrimitif — kumeye eklenecek primitifin adresi)

- PRIMITIF: fiyonk (ties) cizimi
- OKUMA: kap = prenses split + yatay kap dikisi (bu turda pens)
