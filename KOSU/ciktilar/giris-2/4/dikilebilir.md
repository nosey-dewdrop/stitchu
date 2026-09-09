# 4. dior-hc-fw26-bluz.jpg — dikilebilir mi?

**Kaynak fotograf:** `GIRDI/hedef-fotograflar-2/dior-hc-fw26-bluz.jpg` (sha beb5719cb1ee)
**Gorunum:** on · **Arka:** turetildi (TURETILDI, fotograftan degil)
**Okuyan:** isci-A4-tur6 — dis LLM cagrisi YOK, llmCagri 0.

## Fotograftan ne okundu?

| kalem | okuma | guven |
|---|---|---|
| panel `on_govde` | GORULDU — gomlek govdesi salin altindan: yaka ve on paca kismen | 0.6 |
| panel `kol` | GORULDU — uzun kol, manset | 0.8 |
| panel `arka_govde` | gorulmedi (tabandan) — arka yok | 0.2 |
| kenar `kol/hem` | landmark.shoulderTip..landmark.wrist oraninda **1**, manset | 0.8 |
| kenar `on_govde/neck_front` | landmark.neckFront..landmark.bustLine oraninda **0.1**, gomlek-yaka | 0.6 |
| dikis `kol_oyugu` | kol/cap ↔ on_govde/armhole, oran [1,1.1] (GORUNMUYOR, cikarim) | 0.5 |
| kapanma | on_orta / dugme | 0.5 |
| simetri | cfAyna true, cbAyna true | 0.6 |

## Olcum ne dedi? (celiski tablosu)

Yasa 5: celiskide **olcum kazanir**. Bos tablo "celiski yok" demek degildir.

| kalem | Claude (ne) | olcum (ne kadar) | kazanan | sonuc |
|---|---|---|---|---|
| — | — | — | — | tablo BOS; olculmedi[] bak |

## Motora ne gecti? (primitif emir listesi)

Okuma dogrudan graf-v1 primitifleriyle yazilir (vision-graf-v1 yasa 9); ceviri katmani YOK.
Motor (`grafuygula`) taban grafa bu 12 emri sirayla uyguladi; cizici (`grafciz --ops`) ops SONRASI grafi cizdi.
Bir emir reddedilseydi teslim duserdi (sessiz atlama yok).

| # | primitif | args | doguran okuma kalemi |
|---|---|---|---|
| 1 | `merge` | `{"seam":"bel","panelA":"on_beden","panelB":"on_etek","panel":"on_govde"}` | fotografta bel dikisi yok: on beden + on etek tek panel (bel pensi ic halka pense doner) |
| 2 | `merge` | `{"seam":"bel","panelA":"arka_beden","panelB":"arka_etek","panel":"arka_govde"}` | ayni: arka |
| 3 | `extendTo` | `{"panel":"on_govde","edge":"hem_front","yLandmark":"landmark.hip","yOffsetMM":80}` | gomlek boyu: kalca + 8 cm |
| 4 | `extendTo` | `{"panel":"arka_govde","edge":"hem_back","yLandmark":"landmark.hip","yOffsetMM":80}` | gomlek boyu: kalca + 8 cm (arka ayni) |
| 5 | `flare` | `{"panel":"on_govde","edge":"hem_front","factor":1.1}` | hafif bol |
| 6 | `flare` | `{"panel":"arka_govde","edge":"hem_back","factor":1.1}` | hafif bol (arka ayni) |
| 7 | `extendTo` | `{"panel":"kol","edge":"hem","yLandmark":"landmark.wrist","yOffsetMM":0}` | uzun kol: bilek |
| 8 | `attach` | `{"hostPanel":"kol","hostEdge":"hem","edge":"ust","ratio":0.8696,"seam":"kol_agzi","panel":{"id":"kol_bandi","edges":[{"id":"ust","kind":"seam","role":"cuff_top"…` | manset bandi |
| 9 | `sew` | `{"seam":"kol_bandi_yan","a":[{"panel":"kol_bandi","edge":"yan1"}],"b":[{"panel":"kol_bandi","edge":"yan2"}],"reverse":true,"ratio":1}` | band halka olur: iki yan kenari birbirine |
| 10 | `sew` | `{"seam":"on_orta","a":[{"panel":"on_govde","edge":"cf.1"},{"panel":"on_govde","edge":"cf.2"}],"b":[{"panel":"on_govde","edge":"cf.1"},{"panel":"on_govde","edge"…` | on orta dugme pacasi (gomlek; sal altinda cikarim) |
| 11 | `closure` | `{"seam":"on_orta","type":"buttons","fromFraction":0.02,"toFraction":0.9}` | on orta dugme pacasi (gomlek; sal altinda cikarim): dugme |
| 12 | `closure` | `{"seam":"arka_orta_beden","type":"zipper","fromFraction":0,"toFraction":0.01}` | onden dugmeli giyside arka orta fermuar YOK: tabanin CB fermuari sifir uzunluga (0..0) cekilir (cift kapama: hakem tur 10) |

**Cozucu hedefi** (grafa oran YAZILMAZ, yasa 3; `grafuygula --hedef` halka bolluguna cevirir, contract cozucu.hedef sinirina kirpar): 0 adet.


- dogrulayici (gercek36): hedefler[] bos: okuma siluet olcumu tasimiyor
Sapma buyukse bu OLCUMUN ilanidir: siluet "bel/enGenis" orani giysinin bel/gogus cevre orani degildir (kollar, poz); okuma zaten ZAYIF/SUPHELI etiketi tasiyor. Motor hedefi yutmadi, kirptigini ve sapmayi yazdi.

## Cizildi mi?

| cikti | durum | bayt |
|---|---|---|
| flat.svg | OK (data-ops=12) | 19200 |
| flat.png | OK | 45925 |
| kalip-36.svg | OK | 11555 |
| kalip-36.png | OK | 33191 |

**grafdogrula (gercek36):** KOSTU — kirmizi hukum: **0**

## Okunamayanlar (sessiz default YOK)

- gomlek yakasi (boyun bandi + yaka parcasi)
- govdenin buyuk bolumu (sal ortuyor)
- KAYNAKLAR.md 'bej drapeli bluz + siyah pantolon' diyor; fotografta gri sal + beyaz gomlek + siyah plise etek var — dosya/tarif eslesmesi DOGRULANMADI

## Olculmedi

- siluet orani: defile fotografi (yuruyus pozu, aksesuar), poz landmark kosulmadi

## Primitif kumesiyle YAZILAMAYANLAR (eksikPrimitif — kumeye eklenecek primitifin adresi)

- OKUMA: gomlek yakasi (boyun bandi + yaka) giris/3-4'teki boyun bandi op'uyla yazilabilir; bu turda yazilmadi (sal ortuyor, guven dusuk)
