# 3. dior-hc-fw26-elbise.jpg — dikilebilir mi?

**Kaynak fotograf:** `GIRDI/hedef-fotograflar-2/dior-hc-fw26-elbise.jpg` (sha 3f2043b8432d)
**Gorunum:** on · **Arka:** turetildi (TURETILDI, fotograftan degil)
**Okuyan:** isci-A4-tur6 — dis LLM cagrisi YOK, llmCagri 0.

## Fotograftan ne okundu?

| kalem | okuma | guven |
|---|---|---|
| panel `on_govde` | GORULDU — tek parca sutun, sol yanda dikey buzgu/drape | 0.9 |
| panel `arka_govde` | gorulmedi (tabandan) — arka yok | 0.2 |
| panel `kol` | gorulmedi (tabandan) — kol YOK | 0.98 |
| kenar `on_govde/neck_front` | landmark.neckFront..landmark.bustLine oraninda **-0.12**, kayik-yuksek | 0.8 |
| kenar `on_govde/hem_front` | landmark.waist..landmark.ankle oraninda **1.02**, duz | 0.85 |
| dikis `yan` | on_govde/side ↔ arka_govde/side, oran [1,1.4] (GORUNMUYOR, cikarim) | 0.5 |
| kapanma | arka_orta / fermuar | 0.3 |
| simetri | cfAyna false, cbAyna true | 0.8 |

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
| 4 | `reshapeEdge` | `{"panel":"on_govde","edge":"neck_front","from":{"landmark":"landmark.neckBase","xFactor":1.6,"yLandmark":"landmark.shoulderTip","yLandmark2":"landmark.neckBase"…` | yuksek kayik yaka (drape, boyna yakin; CF'de hafif yukari, tepe yok) |
| 5 | `reshapeEdge` | `{"panel":"arka_govde","edge":"neck_back","from":{"landmark":"landmark.neckBase","xFactor":1.6,"yLandmark":"landmark.shoulderTip","yLandmark2":"landmark.neckBase…` | arka yaka yuksek |
| 6 | `extendTo` | `{"panel":"on_govde","edge":"hem_front","yLandmark":"landmark.ankle","yOffsetMM":20}` | yere kadar: bilek + 2 cm |
| 7 | `extendTo` | `{"panel":"arka_govde","edge":"hem_back","yLandmark":"landmark.ankle","yOffsetMM":20}` | yere kadar: bilek + 2 cm (arka ayni) |
| 8 | `flare` | `{"panel":"on_govde","edge":"hem_front","factor":1.08}` | sutun: etek ucu hemen hemen duz |
| 9 | `flare` | `{"panel":"arka_govde","edge":"hem_back","factor":1.08}` | sutun: etek ucu hemen hemen duz (arka ayni) |

**Cozucu hedefi** (grafa oran YAZILMAZ, yasa 3; `grafuygula --hedef` halka bolluguna cevirir, contract cozucu.hedef sinirina kirpar): 0 adet.


- dogrulayici (gercek36): hedefler[] bos: okuma siluet olcumu tasimiyor
Sapma buyukse bu OLCUMUN ilanidir: siluet "bel/enGenis" orani giysinin bel/gogus cevre orani degildir (kollar, poz); okuma zaten ZAYIF/SUPHELI etiketi tasiyor. Motor hedefi yutmadi, kirptigini ve sapmayi yazdi.

## Cizildi mi?

| cikti | durum | bayt |
|---|---|---|
| flat.svg | OK (data-ops=9) | 20573 |
| flat.png | OK | 68940 |
| kalip-36.svg | OK | 6772 |
| kalip-36.png | OK | 78096 |

**grafdogrula (gercek36):** KOSTU — kirmizi hukum: **0**

## Okunamayanlar (sessiz default YOK)

- yan drape/buzgu (asimetrik)
- arka

## Olculmedi

- siluet orani: defile fotografi (yuruyus pozu, aksesuar), poz landmark kosulmadi

## Primitif kumesiyle YAZILAMAYANLAR (eksikPrimitif — kumeye eklenecek primitifin adresi)

- PRIMITIF: asimetri (kat eksenli cizim); drape cizgileri
