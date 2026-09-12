# 1. etsy-01.png — dikilebilir mi?

**Kaynak fotograf:** `GIRDI/hedef-fotograflar-3/etsy-01.png` (sha 39a16500789d)
**Gorunum:** on · **Arka:** turetildi (TURETILDI, fotograftan degil)
**Okuyan:** isci-A4-tur6 — dis LLM cagrisi YOK, llmCagri 0.

## Fotograftan ne okundu?

| kalem | okuma | guven |
|---|---|---|
| panel `on_beden` | GORULDU — V yaka, kolsuz on govde; bel dikisi belirgin | 0.95 |
| panel `on_etek` | GORULDU — bel dikisinden acilan A-line etek, yanda kapakli cep | 0.95 |
| panel `arka_beden` | gorulmedi (tabandan) — arka gorunmuyor | 0.2 |
| panel `arka_etek` | gorulmedi (tabandan) — arka gorunmuyor | 0.2 |
| panel `kol` | gorulmedi (tabandan) — kol YOK (kol oyugu pervazli) | 0.98 |
| kenar `on_beden/neck_front` | landmark.neckFront..landmark.bustLine oraninda **0.72**, V-keskin | 0.85 |
| kenar `on_etek/hem_front` | landmark.waist..landmark.knee oraninda **0.66**, hafif-kavis | 0.8 |
| kenar `on_etek/side_front` | landmark.hip..landmark.knee oraninda **1.35**, klos | 0.8 |
| dikis `bel` | on_beden/waist_front ↔ on_etek/waist_front, oran [1,1] | 0.9 |
| dikis `prenses_on` | on_beden/cf-yani ↔ on_beden/yan, oran [1,1] | 0.85 |
| kapanma | arka_orta / fermuar | 0.4 |
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
| 2 | `reshapeEdge` | `{"panel":"on_beden","edge":"neck_front","from":{"landmark":"landmark.neckBase","xFactor":1.15,"yLandmark":"landmark.shoulderTip","yLandmark2":"landmark.neckBase…` | V yaka: omuzdan bel ustune inen keskin V (ilan flat'inde V ucu gogus hatti altinda) |
| 3 | `reshapeEdge` | `{"panel":"arka_beden","edge":"neck_back","from":{"landmark":"landmark.neckBase","xFactor":1.15,"yLandmark":"landmark.shoulderTip","yLandmark2":"landmark.neckBas…` | arka yaka: hafif oyuk |
| 4 | `extendTo` | `{"panel":"on_etek","edge":"hem_front","yLandmark":"landmark.hip","yOffsetMM":210}` | mini: etek ucu kalca + ~21 cm (fotografta uyluk ortasi) |
| 5 | `extendTo` | `{"panel":"arka_etek","edge":"hem_back","yLandmark":"landmark.hip","yOffsetMM":210}` | mini: etek ucu kalca + ~21 cm (fotografta uyluk ortasi) (arka ayni) |
| 6 | `flare` | `{"panel":"on_etek","edge":"hem_front","factor":1.35}` | A-line etek: etek ucu kalcadan ~%35 acik |
| 7 | `flare` | `{"panel":"arka_etek","edge":"hem_back","factor":1.35}` | A-line etek: etek ucu kalcadan ~%35 acik (arka ayni) |
| 8 | `addPanel` | `{"onto":"on_etek","panel":{"id":"cep_kapagi_on","edges":[{"id":"ust","kind":"cut","role":"pocket_flap","from":{"landmark":"landmark.hip","xOf":"ringQuarter","ri…` | kalca hizasinda yanda kapakli cep (ilan flat'i) |
| 9 | `closure` | `{"seam":"arka_orta_beden","type":"zipper","fromFraction":0,"toFraction":1}` | arka orta fermuar (cikarim: onde kapanma yok) |

**Cozucu hedefi** (grafa oran YAZILMAZ, yasa 3; `grafuygula --hedef` halka bolluguna cevirir, contract cozucu.hedef sinirina kirpar): 0 adet.


- dogrulayici (gercek36): hedefler[] bos: okuma siluet olcumu tasimiyor
Sapma buyukse bu OLCUMUN ilanidir: siluet "bel/enGenis" orani giysinin bel/gogus cevre orani degildir (kollar, poz); okuma zaten ZAYIF/SUPHELI etiketi tasiyor. Motor hedefi yutmadi, kirptigini ve sapmayi yazdi.

## Cizildi mi?

| cikti | durum | bayt |
|---|---|---|
| flat.svg | OK (data-ops=9) | 28555 |
| flat.png | OK | 57640 |
| kalip-36.svg | OK | 11949 |
| kalip-36.png | OK | 29822 |

**grafdogrula (gercek36):** KOSTU — kirmizi hukum: **0**

## Okunamayanlar (sessiz default YOK)

- prenses dikisi: omuzdan etek ucuna inen dikey dikis (on_beden'i dikey bolen split: dart bacaklari kavsakta; bu turda pens olarak birakildi)
- arka yuz
- cep torbasi

## Olculmedi

- siluet orani: ekran goruntusu (fotograf + flat + yazi), poz landmark kosulmadi

## Primitif kumesiyle YAZILAMAYANLAR (eksikPrimitif — kumeye eklenecek primitifin adresi)

- PRIMITIF: prenses hatti = split(on_beden, omuz kosesi, bel kosesi) + pensin dikise emilmesi — pens bacaklarinin split kavsaginda olmasi (dartLeg -> seam) tek adim degil
