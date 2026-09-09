# 8. etsy-08.png — dikilebilir mi?

**Kaynak fotograf:** `GIRDI/hedef-fotograflar-3/etsy-08.png` (sha a9dc6dbc21e7)
**Gorunum:** on · **Arka:** ilan-flat (fotograftan)
**Okuyan:** isci-A4-tur6 — dis LLM cagrisi YOK, llmCagri 0.

## Fotograftan ne okundu?

| kalem | okuma | guven |
|---|---|---|
| panel `on_govde` | GORULDU — kolsuz ust, kayik yaka, bel pensi, agizda pili | 0.95 |
| panel `arka_govde` | GORULDU — ilan flat'inde arka var: duz, bel pensli | 0.8 |
| panel `kol` | gorulmedi (tabandan) — kol YOK | 0.98 |
| kenar `on_govde/neck_front` | landmark.neckFront..landmark.bustLine oraninda **0**, kayik | 0.9 |
| kenar `on_govde/hem_front` | landmark.waist..landmark.hip oraninda **1**, hafif-kavis | 0.85 |
| dikis `on_orta` | on_govde/cf ↔ on_govde/cf, oran [1,1] | 0.95 |
| kapanma | on_orta / dugme | 0.95 |
| simetri | cfAyna true, cbAyna true | 0.95 |

## Olcum ne dedi? (celiski tablosu)

Yasa 5: celiskide **olcum kazanir**. Bos tablo "celiski yok" demek degildir.

| kalem | Claude (ne) | olcum (ne kadar) | kazanan | sonuc |
|---|---|---|---|---|
| — | — | — | — | tablo BOS; olculmedi[] bak |

## Motora ne gecti? (primitif emir listesi)

Okuma dogrudan graf-v1 primitifleriyle yazilir (vision-graf-v1 yasa 9); ceviri katmani YOK.
Motor (`grafuygula`) taban grafa bu 9 emri sirayla uyguladi; cizici (`grafciz --ops`) ops SONRASI grafi cizdi.
Bir emir reddedilseydi teslim duserdi (sessiz atlama yok).

| # | primitif | args | doguran okuma kalemi |
|---|---|---|---|
| 1 | `drop` | `{"panel":"kol","finish":"faced"}` | fotografta kol yok: kol paneli kalkar, kol oyugu pervazli serbest kenar |
| 2 | `merge` | `{"seam":"bel","panelA":"on_beden","panelB":"on_etek","panel":"on_govde"}` | fotografta bel dikisi yok: on beden + on etek tek panel (bel pensi ic halka pense doner) |
| 3 | `merge` | `{"seam":"bel","panelA":"arka_beden","panelB":"arka_etek","panel":"arka_govde"}` | ayni: arka |
| 4 | `reshapeEdge` | `{"panel":"on_govde","edge":"neck_front","from":{"landmark":"landmark.neckBase","xFactor":1.85,"yLandmark":"landmark.shoulderTip","yLandmark2":"landmark.neckBase…` | kayik yaka: omuza yakin, CF'de sig (neredeyse duz) |
| 5 | `reshapeEdge` | `{"panel":"arka_govde","edge":"neck_back","from":{"landmark":"landmark.neckBase","xFactor":1.85,"yLandmark":"landmark.shoulderTip","yLandmark2":"landmark.neckBas…` | arka kayik |
| 6 | `extendTo` | `{"panel":"on_govde","edge":"hem_front","yLandmark":"landmark.hip","yOffsetMM":10}` | ust: etek ucu kalca hizasi |
| 7 | `extendTo` | `{"panel":"arka_govde","edge":"hem_back","yLandmark":"landmark.hip","yOffsetMM":10}` | ust: etek ucu kalca hizasi (arka ayni) |
| 8 | `sew` | `{"seam":"on_orta","a":[{"panel":"on_govde","edge":"cf.1"},{"panel":"on_govde","edge":"cf.2"}],"b":[{"panel":"on_govde","edge":"cf.1"},{"panel":"on_govde","edge"…` | CF tam boy dugme pacasi |
| 9 | `closure` | `{"seam":"on_orta","type":"buttons","fromFraction":0.02,"toFraction":0.97}` | CF tam boy dugme pacasi: dugme |

**Cozucu hedefi** (grafa oran YAZILMAZ, yasa 3; `grafuygula --hedef` halka bolluguna cevirir, contract cozucu.hedef sinirina kirpar): 0 adet.


- dogrulayici (gercek36): hedefler[] bos: okuma siluet olcumu tasimiyor
Sapma buyukse bu OLCUMUN ilanidir: siluet "bel/enGenis" orani giysinin bel/gogus cevre orani degildir (kollar, poz); okuma zaten ZAYIF/SUPHELI etiketi tasiyor. Motor hedefi yutmadi, kirptigini ve sapmayi yazdi.

## Cizildi mi?

| cikti | durum | bayt |
|---|---|---|
| flat.svg | OK (data-ops=9) | 22825 |
| flat.png | OK | 54256 |
| kalip-36.svg | OK | 6513 |
| kalip-36.png | OK | 50563 |

**grafdogrula (gercek36):** KOSTU — kirmizi hukum: **0**

## Okunamayanlar (sessiz default YOK)

- etek ucu pilileri (pens ucundan acilan)

## Olculmedi

- siluet orani: ekran goruntusu (fotograf + flat + yazi), poz landmark kosulmadi

## Primitif kumesiyle YAZILAMAYANLAR (eksikPrimitif — kumeye eklenecek primitifin adresi)

- PRIMITIF: pili (kutu pili / acik pili) op'u yok
