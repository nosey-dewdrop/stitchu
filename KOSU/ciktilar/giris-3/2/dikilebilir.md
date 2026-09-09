# 2. etsy-02.png — dikilebilir mi?

**Kaynak fotograf:** `GIRDI/hedef-fotograflar-3/etsy-02.png` (sha bc91857770e2)
**Gorunum:** on · **Arka:** turetildi (TURETILDI, fotograftan degil)
**Okuyan:** isci-A4-tur6 — dis LLM cagrisi YOK, llmCagri 0.

## Fotograftan ne okundu?

| kalem | okuma | guven |
|---|---|---|
| panel `on_beden` | GORULDU — duz ust kenar, prenses/pens hatlari, bel dikisi | 0.95 |
| panel `on_etek` | GORULDU — bel dikisinden acilan A-line, diz alti | 0.95 |
| panel `aski_on` | GORULDU — ince aski, gogus ucu hizasindan | 0.95 |
| panel `arka_beden` | gorulmedi (tabandan) — arka gorunmuyor | 0.2 |
| panel `kol` | gorulmedi (tabandan) — kol YOK | 0.98 |
| kenar `on_beden/ust_kenar` | landmark.underarm..landmark.bustLine oraninda **0.1**, duz | 0.85 |
| kenar `on_etek/hem_front` | landmark.waist..landmark.ankle oraninda **0.62**, hafif-kavis | 0.8 |
| kenar `on_etek/side_front` | landmark.hip..landmark.knee oraninda **1.45**, klos | 0.8 |
| dikis `bel` | on_beden_alt/waist_front ↔ on_etek/waist_front, oran [1,1] | 0.9 |
| dikis `prenses_on` | on_beden/orta ↔ on_beden/yan, oran [1,1] | 0.8 |
| kapanma | arka_orta / fermuar | 0.4 |
| simetri | cfAyna true, cbAyna true | 0.95 |

## Olcum ne dedi? (celiski tablosu)

Yasa 5: celiskide **olcum kazanir**. Bos tablo "celiski yok" demek degildir.

| kalem | Claude (ne) | olcum (ne kadar) | kazanan | sonuc |
|---|---|---|---|---|
| — | — | — | — | tablo BOS; olculmedi[] bak |

## Motora ne gecti? (primitif emir listesi)

Okuma dogrudan graf-v1 primitifleriyle yazilir (vision-graf-v1 yasa 9); ceviri katmani YOK.
Motor (`grafuygula`) taban grafa bu 23 emri sirayla uyguladi; cizici (`grafciz --ops`) ops SONRASI grafi cizdi.
Bir emir reddedilseydi teslim duserdi (sessiz atlama yok).

| # | primitif | args | doguran okuma kalemi |
|---|---|---|---|
| 1 | `drop` | `{"panel":"kol","finish":"faced"}` | fotografta kol yok: kol paneli kalkar, kol oyugu pervazli serbest kenar |
| 2 | `reshapeEdge` | `{"panel":"on_beden","edge":"dart_on_beden.1","to":{"landmark":"landmark.underarm","xOf":"ringQuarter","ring":"girth.waist","xFactor":0.35,"yLandmark":"landmark.…` | pens apeksi ust kenarin altina (askili ust: ust kenar gogus hattinin hemen ustunde) |
| 3 | `reshapeEdge` | `{"panel":"arka_beden","edge":"dart_arka_beden.1","to":{"landmark":"landmark.underarm","xOf":"ringQuarter","ring":"girth.waist","xFactor":0.35,"yLandmark":"landm…` | pens apeksi ust kenarin altina (askili ust: ust kenar gogus hattinin hemen ustunde) (arka) |
| 4 | `subdivide` | `{"panel":"on_beden","edge":"cf","fractions":[0.429]}` | askili ust: govde koltukalti hizasinda kesilir: CF'de kesim noktasi |
| 5 | `subdivide` | `{"panel":"on_beden","edge":"armhole_front.1","fractions":[0.147]}` | askili ust: govde koltukalti hizasinda kesilir: kol oyugunda kesim noktasi (ust kenar yatay) |
| 6 | `split` | `{"panel":"on_beden","vertexA":"cf.2","vertexB":"armhole_front.1.2","panelA":"on_beden_alt","panelB":"on_beden_ust","seam":"ust_on","seamRatio":1}` | askili ust: govde koltukalti hizasinda kesilir: ust govde ayri panel |
| 7 | `drop` | `{"panel":"on_beden_ust","finish":"faced"}` | askili ust: govde koltukalti hizasinda kesilir: ust govde kalkar, ust kenar pervazli |
| 8 | `moveVertex` | `{"panel":"on_beden_alt","edge":"ust_on.a","to":{"landmark":"landmark.bustLine","xOf":"ringQuarter","ring":"girth.bust","xFactor":1,"yLandmark":"landmark.underar…` | askili ust: govde koltukalti hizasinda kesilir: ust kenar YATAY (yan tepe tam yTop hizasina; kol oyugu kesri yaklasikti, ortada chevron yapiyordu) |
| 9 | `reshapeEdge` | `{"panel":"on_beden_alt","edge":"armhole_front.1.1","control":[]}` | askili ust: govde koltukalti hizasinda kesilir: yan ust parca DUZ (kol oyugu kubiginin kalan kontrolleri kosede kulak yapiyordu) |
| 10 | `subdivide` | `{"panel":"arka_beden","edge":"cb","fractions":[0.5064]}` | askili ust: govde koltukalti hizasinda kesilir: CB'de kesim noktasi |
| 11 | `subdivide` | `{"panel":"arka_beden","edge":"armhole_back.1","fractions":[0.147]}` | askili ust: govde koltukalti hizasinda kesilir: arka kol oyugunda kesim noktasi |
| 12 | `split` | `{"panel":"arka_beden","vertexA":"cb.2","vertexB":"armhole_back.1.2","panelA":"arka_beden_alt","panelB":"arka_beden_ust","seam":"ust_arka","seamRatio":1}` | askili ust: govde koltukalti hizasinda kesilir: arka ust govde ayri panel |
| 13 | `drop` | `{"panel":"arka_beden_ust","finish":"faced"}` | askili ust: govde koltukalti hizasinda kesilir: arka ust govde kalkar |
| 14 | `moveVertex` | `{"panel":"arka_beden_alt","edge":"ust_arka.a","to":{"landmark":"landmark.bustLine","xOf":"ringQuarter","ring":"girth.bust","xFactor":1,"yLandmark":"landmark.und…` | askili ust: govde koltukalti hizasinda kesilir: arka ust kenar yatay |
| 15 | `reshapeEdge` | `{"panel":"arka_beden_alt","edge":"armhole_back.1.1","control":[]}` | askili ust: govde koltukalti hizasinda kesilir: arka yan ust parca duz |
| 16 | `sew` | `{"seam":"arka_orta_beden","a":[{"panel":"arka_beden_alt","edge":"cb.2"}],"b":[{"panel":"arka_beden_alt","edge":"cb.2"}],"reverse":true,"ratio":1}` | arka orta kapanma: drop ile dusen arka orta dikisi yeniden (cb.2 kendi aynasiyla) |
| 17 | `closure` | `{"seam":"arka_orta_beden","type":"zipper","fromFraction":0,"toFraction":1}` | arka orta fermuar (fotografta arka gorunmuyor: cikarim) |
| 18 | `addPanel` | `{"onto":"on_beden_alt","panel":{"id":"aski_on","edges":[{"id":"ic","kind":"cut","role":"strap","from":{"landmark":"landmark.bustLine","xOf":"ringQuarter","ring"…` | ince aski (12 mm), gogus ucu hizasindan omuza |
| 19 | `addPanel` | `{"onto":"arka_beden_alt","panel":{"id":"aski_arka","edges":[{"id":"ic","kind":"cut","role":"strap","from":{"landmark":"landmark.bustLine","xOf":"ringQuarter","r…` | ince aski (12 mm), gogus ucu hizasindan omuza |
| 20 | `extendTo` | `{"panel":"on_etek","edge":"hem_front","yLandmark":"landmark.knee","yOffsetMM":60}` | etek ucu diz alti (~6 cm) |
| 21 | `extendTo` | `{"panel":"arka_etek","edge":"hem_back","yLandmark":"landmark.knee","yOffsetMM":60}` | etek ucu diz alti (~6 cm) (arka ayni) |
| 22 | `flare` | `{"panel":"on_etek","edge":"hem_front","factor":1.45}` | A-line etek: etek ucu belirgin acik |
| 23 | `flare` | `{"panel":"arka_etek","edge":"hem_back","factor":1.45}` | A-line etek: etek ucu belirgin acik (arka ayni) |

**Cozucu hedefi** (grafa oran YAZILMAZ, yasa 3; `grafuygula --hedef` halka bolluguna cevirir, contract cozucu.hedef sinirina kirpar): 0 adet.


- dogrulayici (gercek36): hedefler[] bos: okuma siluet olcumu tasimiyor
Sapma buyukse bu OLCUMUN ilanidir: siluet "bel/enGenis" orani giysinin bel/gogus cevre orani degildir (kollar, poz); okuma zaten ZAYIF/SUPHELI etiketi tasiyor. Motor hedefi yutmadi, kirptigini ve sapmayi yazdi.

## Cizildi mi?

| cikti | durum | bayt |
|---|---|---|
| flat.svg | OK (data-ops=23) | 21716 |
| flat.png | OK | 48364 |
| kalip-36.svg | OK | 12038 |
| kalip-36.png | OK | 31873 |

**grafdogrula (gercek36):** KOSTU — kirmizi hukum: **0**

## Okunamayanlar (sessiz default YOK)

- prenses dikisi (pens olarak birakildi)
- yan dikis cebi (ilan flat'inde centik)
- arka

## Olculmedi

- siluet orani: ekran goruntusu (fotograf + flat + yazi), poz landmark kosulmadi

## Primitif kumesiyle YAZILAMAYANLAR (eksikPrimitif — kumeye eklenecek primitifin adresi)

- PRIMITIF: askinin ucunun ust kenara/arka ust kenara dikilmesi (attach kismi kenara) — aski yuze dikili (onto) yazildi, konstruksiyon farkli
