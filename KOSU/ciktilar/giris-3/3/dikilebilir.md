# 3. etsy-03.png — dikilebilir mi?

**Kaynak fotograf:** `GIRDI/hedef-fotograflar-3/etsy-03.png` (sha 67871839968c)
**Gorunum:** on · **Arka:** ilan-flat (fotograftan)
**Okuyan:** isci-A4-tur6 — dis LLM cagrisi YOK, llmCagri 0.

## Fotograftan ne okundu?

| kalem | okuma | guven |
|---|---|---|
| panel `on_roba` | GORULDU — gogus ustunde roba, altinda buzgu | 0.9 |
| panel `on_govde_alt` | GORULDU — robadan etek ucuna tek parca, A-line | 0.95 |
| panel `kol` | GORULDU — puf kisa kol, agzi bantli/lastikli | 0.95 |
| panel `yaka_on` | GORULDU — bebe (peter pan) yaka | 0.95 |
| panel `arka_roba` | GORULDU — ilan flat'inde arka roba var | 0.6 |
| kenar `on_govde_alt/hem_front` | landmark.waist..landmark.knee oraninda **0.65**, hafif-kavis | 0.8 |
| kenar `kol/hem` | landmark.shoulderTip..landmark.elbow oraninda **0.6**, buzgulu-bant | 0.85 |
| kenar `on_roba/neck_front` | landmark.neckFront..landmark.bustLine oraninda **0.05**, yuvarlak | 0.85 |
| dikis `roba_on` | on_roba/alt ↔ on_govde_alt/ust, oran [1.3,1.5] | 0.9 |
| dikis `kol_oyugu` | kol/cap ↔ on_govde/armhole, oran [1.5,1.7] | 0.85 |
| dikis `kol_agzi` | kol/hem ↔ kol_bandi/ust, oran [1.4,1.6] | 0.8 |
| kapanma | on_orta / dugme | 0.7 |
| simetri | cfAyna true, cbAyna true | 0.95 |

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
| 1 | `merge` | `{"seam":"bel","panelA":"on_beden","panelB":"on_etek","panel":"on_govde"}` | fotografta bel dikisi yok: on beden + on etek tek panel (bel pensi ic halka pense doner) |
| 2 | `merge` | `{"seam":"bel","panelA":"arka_beden","panelB":"arka_etek","panel":"arka_govde"}` | ayni: arka |
| 3 | `subdivide` | `{"panel":"on_govde","edge":"cf.1","fractions":[0.3358]}` | roba cizgisi: CF'de |
| 4 | `subdivide` | `{"panel":"on_govde","edge":"armhole_front.1","fractions":[0.533]}` | roba cizgisi: kol oyugunda ayni hiza (roba dikisi yatay) |
| 5 | `split` | `{"panel":"on_govde","vertexA":"cf.1.2","vertexB":"armhole_front.1.2","panelA":"on_govde_alt","panelB":"on_roba","seam":"roba_on","seamRatio":1}` | roba: ust govde ayri panel |
| 6 | `gather` | `{"panel":"on_govde_alt","edge":"roba_on.a","ratio":1.4}` | roba altinda buzgu: alt govdenin ust kenari 1.4 kat |
| 7 | `subdivide` | `{"panel":"arka_govde","edge":"cb.1","fractions":[0.4259]}` | arka roba: CB'de |
| 8 | `subdivide` | `{"panel":"arka_govde","edge":"armhole_back.1","fractions":[0.533]}` | arka roba: kol oyugunda ayni hiza |
| 9 | `split` | `{"panel":"arka_govde","vertexA":"cb.1.2","vertexB":"armhole_back.1.2","panelA":"arka_govde_alt","panelB":"arka_roba","seam":"roba_arka","seamRatio":1}` | arka roba |
| 10 | `gather` | `{"panel":"arka_govde_alt","edge":"roba_arka.a","ratio":1.3}` | arka roba altinda buzgu |
| 11 | `extendTo` | `{"panel":"on_govde_alt","edge":"hem_front","yLandmark":"landmark.hip","yOffsetMM":200}` | mini: kalca + ~20 cm |
| 12 | `extendTo` | `{"panel":"arka_govde_alt","edge":"hem_back","yLandmark":"landmark.hip","yOffsetMM":200}` | mini: kalca + ~20 cm (arka ayni) |
| 13 | `flare` | `{"panel":"on_govde_alt","edge":"hem_front","factor":1.3}` | A-line: etek ucu acik |
| 14 | `flare` | `{"panel":"arka_govde_alt","edge":"hem_back","factor":1.3}` | A-line: etek ucu acik (arka ayni) |
| 15 | `extendTo` | `{"panel":"kol","edge":"hem","yLandmark":"landmark.elbow","yOffsetMM":-150}` | kisa puf kol: agiz dirsegin ~15 cm ustunde |
| 16 | `gather` | `{"panel":"kol","edge":"cap_front","ratio":1.225}` | puf kol: kapak kol oyugundan 1.5 kat uzun (buzgu) (on kapak) |
| 17 | `gather` | `{"panel":"kol","edge":"cap_back","ratio":1.225}` | puf kol: kapak kol oyugundan 1.5 kat uzun (buzgu) (arka kapak) |
| 18 | `attach` | `{"hostPanel":"kol","hostEdge":"hem","edge":"ust","ratio":0.6667,"seam":"kol_agzi","panel":{"id":"kol_bandi","edges":[{"id":"ust","kind":"seam","role":"cuff_top"…` | kol agzi buzgulu dar banda dikilir |
| 19 | `sew` | `{"seam":"kol_bandi_yan","a":[{"panel":"kol_bandi","edge":"yan1"}],"b":[{"panel":"kol_bandi","edge":"yan2"}],"reverse":true,"ratio":1}` | band halka olur: iki yan kenari birbirine |
| 20 | `addPanel` | `{"onto":"on_roba","panel":{"id":"yaka_on","edges":[{"id":"ic","kind":"cut","role":"collar_inner","from":{"landmark":"landmark.neckBase","xFactor":1,"yOffsetMM":…` | bebe yaka: roba yuzune, boyun cizgisi boyunca, ~50 mm genis |
| 21 | `closure` | `{"seam":"roba_on","type":"open","fromFraction":0,"toFraction":0.15}` | on yaka altinda kisa dugme/yirtmac (fotografta tek dugme + yirtmac) |

**Cozucu hedefi** (grafa oran YAZILMAZ, yasa 3; `grafuygula --hedef` halka bolluguna cevirir, contract cozucu.hedef sinirina kirpar): 0 adet.


- dogrulayici (gercek36): hedefler[] bos: okuma siluet olcumu tasimiyor
Sapma buyukse bu OLCUMUN ilanidir: siluet "bel/enGenis" orani giysinin bel/gogus cevre orani degildir (kollar, poz); okuma zaten ZAYIF/SUPHELI etiketi tasiyor. Motor hedefi yutmadi, kirptigini ve sapmayi yazdi.

## Cizildi mi?

| cikti | durum | bayt |
|---|---|---|
| flat.svg | OK (data-ops=21) | 22830 |
| flat.png | OK | 62777 |
| kalip-36.svg | OK | 18699 |
| kalip-36.png | OK | 28530 |

**grafdogrula (gercek36):** KOSTU — kirmizi hukum: **0**

## Okunamayanlar (sessiz default YOK)

- kol agzi firfiri (band ustune firfir)
- yirtmac konstruksiyonu

## Olculmedi

- siluet orani: ekran goruntusu (fotograf + flat + yazi), poz landmark kosulmadi

## Primitif kumesiyle YAZILAMAYANLAR (eksikPrimitif — kumeye eklenecek primitifin adresi)

- PRIMITIF: yirtmac = kat kenarinin bir bolumunun cut olmasi (reshapeEdge kind) — burada closure 'open' ile ilan edildi
