# 11. etsy-11.png — dikilebilir mi?

**Kaynak fotograf:** `GIRDI/hedef-fotograflar-3/etsy-11.png` (sha 7427c328ef96)
**Gorunum:** on · **Arka:** ilan-flat (fotograftan)
**Okuyan:** isci-A4-tur6 — dis LLM cagrisi YOK, llmCagri 0.

## Fotograftan ne okundu?

| kalem | okuma | guven |
|---|---|---|
| panel `on_roba` | GORULDU — roba, altinda buzgu | 0.9 |
| panel `on_govde_alt` | GORULDU — bol, kalca boyu | 0.95 |
| panel `kol` | GORULDU — puf kol, firfirli agiz | 0.95 |
| panel `yaka_on` | GORULDU — firfirli yaka | 0.95 |
| kenar `on_govde_alt/hem_front` | landmark.waist..landmark.hip oraninda **1.2**, hafif-kavis | 0.8 |
| kenar `kol/hem` | landmark.shoulderTip..landmark.elbow oraninda **0.6**, firfirli | 0.85 |
| dikis `roba_on` | on_roba/alt ↔ on_govde_alt/ust, oran [1.6,1.8] | 0.9 |
| dikis `kol_oyugu` | kol/cap ↔ on_govde/armhole, oran [1.6,1.8] | 0.85 |
| kapanma | yok / yok | 0.6 |
| simetri | cfAyna true, cbAyna true | 0.95 |

## Olcum ne dedi? (celiski tablosu)

Yasa 5: celiskide **olcum kazanir**. Bos tablo "celiski yok" demek degildir.

| kalem | Claude (ne) | olcum (ne kadar) | kazanan | sonuc |
|---|---|---|---|---|
| — | — | — | — | tablo BOS; olculmedi[] bak |

## Motora ne gecti? (primitif emir listesi)

Okuma dogrudan graf-v1 primitifleriyle yazilir (vision-graf-v1 yasa 9); ceviri katmani YOK.
Motor (`grafuygula`) taban grafa bu 18 emri sirayla uyguladi; cizici (`grafciz --ops`) ops SONRASI grafi cizdi.
Bir emir reddedilseydi teslim duserdi (sessiz atlama yok).

| # | primitif | args | doguran okuma kalemi |
|---|---|---|---|
| 1 | `merge` | `{"seam":"bel","panelA":"on_beden","panelB":"on_etek","panel":"on_govde"}` | fotografta bel dikisi yok: on beden + on etek tek panel (bel pensi ic halka pense doner) |
| 2 | `merge` | `{"seam":"bel","panelA":"arka_beden","panelB":"arka_etek","panel":"arka_govde"}` | ayni: arka |
| 3 | `subdivide` | `{"panel":"on_govde","edge":"cf.1","fractions":[0.2959]}` | roba cizgisi: CF'de |
| 4 | `subdivide` | `{"panel":"on_govde","edge":"armhole_front.1","fractions":[0.698]}` | roba cizgisi: kol oyugunda ayni hiza (roba dikisi yatay) |
| 5 | `split` | `{"panel":"on_govde","vertexA":"cf.1.2","vertexB":"armhole_front.1.2","panelA":"on_govde_alt","panelB":"on_roba","seam":"roba_on","seamRatio":1}` | roba: ust govde ayri panel |
| 6 | `gather` | `{"panel":"on_govde_alt","edge":"roba_on.a","ratio":1.7}` | roba altinda yogun buzgu 1.7 |
| 7 | `subdivide` | `{"panel":"arka_govde","edge":"cb.1","fractions":[0.3913]}` | arka roba: CB |
| 8 | `subdivide` | `{"panel":"arka_govde","edge":"armhole_back.1","fractions":[0.698]}` | arka roba: kol oyugunda ayni hiza |
| 9 | `split` | `{"panel":"arka_govde","vertexA":"cb.1.2","vertexB":"armhole_back.1.2","panelA":"arka_govde_alt","panelB":"arka_roba","seam":"roba_arka","seamRatio":1}` | arka roba |
| 10 | `gather` | `{"panel":"arka_govde_alt","edge":"roba_arka.a","ratio":1.5}` | arka roba altinda buzgu |
| 11 | `extendTo` | `{"panel":"on_govde_alt","edge":"hem_front","yLandmark":"landmark.hip","yOffsetMM":40}` | ust: kalca + 4 cm; flare YOK (4 cm'lik etekte flare kanat yapiyordu, hakem tur 8) |
| 12 | `extendTo` | `{"panel":"arka_govde_alt","edge":"hem_back","yLandmark":"landmark.hip","yOffsetMM":40}` | ust: kalca + 4 cm; flare YOK (4 cm'lik etekte flare kanat yapiyordu, hakem tur 8) (arka ayni) |
| 13 | `extendTo` | `{"panel":"kol","edge":"hem","yLandmark":"landmark.elbow","yOffsetMM":-140}` | kisa puf kol |
| 14 | `gather` | `{"panel":"kol","edge":"cap_front","ratio":1.225}` | puf kol kapak buzgusu (on kapak) |
| 15 | `gather` | `{"panel":"kol","edge":"cap_back","ratio":1.225}` | puf kol kapak buzgusu (arka kapak) |
| 16 | `attach` | `{"hostPanel":"kol","hostEdge":"hem","edge":"ust","ratio":0.625,"seam":"kol_agzi","panel":{"id":"kol_bandi","edges":[{"id":"ust","kind":"seam","role":"cuff_top",…` | kol agzi firfirli banda |
| 17 | `sew` | `{"seam":"kol_bandi_yan","a":[{"panel":"kol_bandi","edge":"yan1"}],"b":[{"panel":"kol_bandi","edge":"yan2"}],"reverse":true,"ratio":1}` | band halka olur: iki yan kenari birbirine |
| 18 | `addPanel` | `{"onto":"on_roba","panel":{"id":"yaka_on","edges":[{"id":"ic","kind":"cut","role":"collar_inner","from":{"landmark":"landmark.neckBase","xFactor":1,"yOffsetMM":…` | firfirli bebe yaka |

**Cozucu hedefi** (grafa oran YAZILMAZ, yasa 3; `grafuygula --hedef` halka bolluguna cevirir, contract cozucu.hedef sinirina kirpar): 0 adet.


- dogrulayici (gercek36): hedefler[] bos: okuma siluet olcumu tasimiyor
Sapma buyukse bu OLCUMUN ilanidir: siluet "bel/enGenis" orani giysinin bel/gogus cevre orani degildir (kollar, poz); okuma zaten ZAYIF/SUPHELI etiketi tasiyor. Motor hedefi yutmadi, kirptigini ve sapmayi yazdi.

## Cizildi mi?

| cikti | durum | bayt |
|---|---|---|
| flat.svg | OK (data-ops=18) | 21212 |
| flat.png | OK | 53510 |
| kalip-36.svg | OK | 18359 |
| kalip-36.png | OK | 27920 |

**grafdogrula (gercek36):** KOSTU — kirmizi hukum: **0**

## Okunamayanlar (sessiz default YOK)

- yaka firfiri
- kol agzi firfiri

## Olculmedi

- siluet orani: ekran goruntusu (fotograf + flat + yazi), poz landmark kosulmadi

## Primitif kumesiyle YAZILAMAYANLAR (eksikPrimitif — kumeye eklenecek primitifin adresi)

- PRIMITIF: firfir = ruffle band (attach ratio>1 ile band var, firfir cizimi yok)
