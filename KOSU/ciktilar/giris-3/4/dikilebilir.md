# 4. etsy-04.png — dikilebilir mi?

**Kaynak fotograf:** `GIRDI/hedef-fotograflar-3/etsy-04.png` (sha 854f4b139290)
**Gorunum:** on · **Arka:** ilan-flat (fotograftan)
**Okuyan:** isci-A4-tur6 — dis LLM cagrisi YOK, llmCagri 0.

## Fotograftan ne okundu?

| kalem | okuma | guven |
|---|---|---|
| panel `on_govde` | GORULDU — tek parca on govde, prenses/pens hatlari, mini | 0.95 |
| panel `kol` | GORULDU — kisa kapak kol | 0.95 |
| panel `arka_govde` | GORULDU — ilan flat'inde arka ust var | 0.5 |
| kenar `on_govde/neck_front` | landmark.neckFront..landmark.bustLine oraninda **0.05**, kayik | 0.9 |
| kenar `on_govde/hem_front` | landmark.waist..landmark.knee oraninda **0.6**, duz | 0.85 |
| kenar `kol/hem` | landmark.shoulderTip..landmark.elbow oraninda **0.45**, duz | 0.85 |
| dikis `kol_oyugu` | kol/cap ↔ on_govde/armhole, oran [1,1.1] | 0.85 |
| dikis `prenses_on` | on_govde/orta ↔ on_govde/yan, oran [1,1] | 0.85 |
| kapanma | on_orta / dugme | 0.9 |
| simetri | cfAyna false, cbAyna true | 0.9 |

## Olcum ne dedi? (celiski tablosu)

Yasa 5: celiskide **olcum kazanir**. Bos tablo "celiski yok" demek degildir.

| kalem | Claude (ne) | olcum (ne kadar) | kazanan | sonuc |
|---|---|---|---|---|
| — | — | — | — | tablo BOS; olculmedi[] bak |

## Motora ne gecti? (primitif emir listesi)

Okuma dogrudan graf-v1 primitifleriyle yazilir (vision-graf-v1 yasa 9); ceviri katmani YOK.
Motor (`grafuygula`) taban grafa bu 11 emri sirayla uyguladi; cizici (`grafciz --ops`) ops SONRASI grafi cizdi.
Bir emir reddedilseydi teslim duserdi (sessiz atlama yok).

| # | primitif | args | doguran okuma kalemi |
|---|---|---|---|
| 1 | `merge` | `{"seam":"bel","panelA":"on_beden","panelB":"on_etek","panel":"on_govde"}` | fotografta bel dikisi yok: on beden + on etek tek panel (bel pensi ic halka pense doner) |
| 2 | `merge` | `{"seam":"bel","panelA":"arka_beden","panelB":"arka_etek","panel":"arka_govde"}` | ayni: arka |
| 3 | `reshapeEdge` | `{"panel":"on_govde","edge":"neck_front","from":{"landmark":"landmark.neckBase","xFactor":1.9,"yLandmark":"landmark.shoulderTip","yLandmark2":"landmark.neckBase"…` | kayik yaka: omuza yakin genis, CF'de sig |
| 4 | `reshapeEdge` | `{"panel":"arka_govde","edge":"neck_back","from":{"landmark":"landmark.neckBase","xFactor":1.9,"yLandmark":"landmark.shoulderTip","yLandmark2":"landmark.neckBase…` | arka kayik yaka |
| 5 | `extendTo` | `{"panel":"on_govde","edge":"hem_front","yLandmark":"landmark.hip","yOffsetMM":150}` | mini: kalca + ~15 cm |
| 6 | `extendTo` | `{"panel":"arka_govde","edge":"hem_back","yLandmark":"landmark.hip","yOffsetMM":150}` | mini: kalca + ~15 cm (arka ayni) |
| 7 | `extendTo` | `{"panel":"kol","edge":"hem","yLandmark":"landmark.elbow","yOffsetMM":-165}` | kapak kol: agiz koltukaltinin hemen altinda |
| 8 | `fitLength` | `{"panel":"kol","edge":"cap_front","target":{"seam":"kol_oyugu","ratio":1.05,"easeMM":0}}` | kapak kol: kapak neredeyse duz |
| 9 | `fitLength` | `{"panel":"kol","edge":"cap_back","target":{"seam":"kol_oyugu","ratio":1.05,"easeMM":0}}` | kapak kol: kapak neredeyse duz (arka kapak) |
| 10 | `sew` | `{"seam":"on_orta","a":[{"panel":"on_govde","edge":"cf.1"},{"panel":"on_govde","edge":"cf.2"}],"b":[{"panel":"on_govde","edge":"cf.1"},{"panel":"on_govde","edge"…` | on orta dugme pacasi (fotografta CF'nin sagina kaymis asimetrik; ayna kisiti: CF'de yazildi) |
| 11 | `closure` | `{"seam":"on_orta","type":"buttons","fromFraction":0.02,"toFraction":0.62}` | on orta dugme pacasi (fotografta CF'nin sagina kaymis asimetrik; ayna kisiti: CF'de yazildi): dugme |

**Cozucu hedefi** (grafa oran YAZILMAZ, yasa 3; `grafuygula --hedef` halka bolluguna cevirir, contract cozucu.hedef sinirina kirpar): 0 adet.


- dogrulayici (gercek36): hedefler[] bos: okuma siluet olcumu tasimiyor
Sapma buyukse bu OLCUMUN ilanidir: siluet "bel/enGenis" orani giysinin bel/gogus cevre orani degildir (kollar, poz); okuma zaten ZAYIF/SUPHELI etiketi tasiyor. Motor hedefi yutmadi, kirptigini ve sapmayi yazdi.

## Cizildi mi?

| cikti | durum | bayt |
|---|---|---|
| flat.svg | OK (data-ops=11) | 22042 |
| flat.png | OK | 53109 |
| kalip-36.svg | OK | 10061 |
| kalip-36.png | OK | 39036 |

**grafdogrula (gercek36):** KOSTU — kirmizi hukum: **0**

## Okunamayanlar (sessiz default YOK)

- asimetrik paca konumu
- prenses dikisi (pens olarak)

## Olculmedi

- siluet orani: ekran goruntusu (fotograf + flat + yazi), poz landmark kosulmadi

## Primitif kumesiyle YAZILAMAYANLAR (eksikPrimitif — kumeye eklenecek primitifin adresi)

- PRIMITIF: asimetrik on = kat ekseninden bagimsiz tam on paneli (mirror op var ama cizici x=0'da aynalar; asimetri cizimde yok)
