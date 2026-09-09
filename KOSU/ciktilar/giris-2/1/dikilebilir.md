# 1. dior-hc-fw26-pantolon.jpg — dikilebilir mi?

**Kaynak fotograf:** `GIRDI/hedef-fotograflar-2/dior-hc-fw26-pantolon.jpg` (sha 7dcb3a0d7676)
**Gorunum:** on · **Arka:** turetildi (TURETILDI, fotograftan degil)
**Okuyan:** isci-A4-tur6 — dis LLM cagrisi YOK, llmCagri 0.

## Fotograftan ne okundu?

| kalem | okuma | guven |
|---|---|---|
| panel `on_bacak` | GORULDU — on bacak: bol, duz, kirisiksiz; bel ceket altinda | 0.9 |
| panel `arka_bacak` | gorulmedi (tabandan) — arka gorunmuyor | 0.2 |
| kenar `on_bacak/paca_front` | landmark.hip..landmark.ankle oraninda **1.05**, duz | 0.85 |
| kenar `on_bacak/side_front` | landmark.hip..landmark.ankle oraninda **1.15**, hafif-acik | 0.7 |
| dikis `yan_bacak` | on_bacak/side ↔ arka_bacak/side, oran [1,1] | 0.7 |
| dikis `ic_bacak` | on_bacak/ic ↔ arka_bacak/ic, oran [1,1] (GORUNMUYOR, cikarim) | 0.6 |
| kapanma | on_orta / fermuar | 0.3 |
| simetri | cfAyna true, cbAyna true | 0.9 |

## Olcum ne dedi? (celiski tablosu)

Yasa 5: celiskide **olcum kazanir**. Bos tablo "celiski yok" demek degildir.

| kalem | Claude (ne) | olcum (ne kadar) | kazanan | sonuc |
|---|---|---|---|---|
| — | — | — | — | tablo BOS; olculmedi[] bak |

## Motora ne gecti? (primitif emir listesi)

Okuma dogrudan graf-v1 primitifleriyle yazilir (vision-graf-v1 yasa 9); ceviri katmani YOK.
Motor (`grafuygula`) taban grafa bu 4 emri sirayla uyguladi; cizici (`grafciz --ops`) ops SONRASI grafi cizdi.
Bir emir reddedilseydi teslim duserdi (sessiz atlama yok).

| # | primitif | args | doguran okuma kalemi |
|---|---|---|---|
| 1 | `flare` | `{"panel":"on_bacak","edge":"paca_front","factor":1.15}` | paca genis: bacak dizden asagi hafif acilir (fotografta bol duz paca) |
| 2 | `flare` | `{"panel":"arka_bacak","edge":"paca_back","factor":1.15}` | arka paca ayni |
| 3 | `extendTo` | `{"panel":"on_bacak","edge":"paca_front","yLandmark":"landmark.ankle","yOffsetMM":30}` | paca yere kadar: bilek + 3 cm |
| 4 | `extendTo` | `{"panel":"arka_bacak","edge":"paca_back","yLandmark":"landmark.ankle","yOffsetMM":30}` | arka paca ayni |

**Cozucu hedefi** (grafa oran YAZILMAZ, yasa 3; `grafuygula --hedef` halka bolluguna cevirir, contract cozucu.hedef sinirina kirpar): 0 adet.


- dogrulayici (gercek36): hedefler[] bos: okuma siluet olcumu tasimiyor
Sapma buyukse bu OLCUMUN ilanidir: siluet "bel/enGenis" orani giysinin bel/gogus cevre orani degildir (kollar, poz); okuma zaten ZAYIF/SUPHELI etiketi tasiyor. Motor hedefi yutmadi, kirptigini ve sapmayi yazdi.

## Cizildi mi?

| cikti | durum | bayt |
|---|---|---|
| flat.svg | OK (data-ops=4) | 16844 |
| flat.png | OK | 47569 |
| kalip-36.svg | OK | 6140 |
| kalip-36.png | OK | 57889 |

**grafdogrula (gercek36):** KOSTU — kirmizi hukum: **0**

## Okunamayanlar (sessiz default YOK)

- bel/kusak (ceket altinda)
- cep
- arka

## Olculmedi

- siluet orani: defile fotografi (yuruyus pozu, aksesuar), poz landmark kosulmadi

## Primitif kumesiyle YAZILAMAYANLAR (eksikPrimitif — kumeye eklenecek primitifin adresi)

- PRIMITIF: kusak bandi (attach bel kenarina) bu turda yazilmadi
