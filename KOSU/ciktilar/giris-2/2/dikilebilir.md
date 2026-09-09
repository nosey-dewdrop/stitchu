# 2. dior-hc-fw26-gomlek.jpg — dikilebilir mi?

**Kaynak fotograf:** `GIRDI/hedef-fotograflar-2/dior-hc-fw26-gomlek.jpg` (sha 4009f30d75ab)
**Gorunum:** on · **Arka:** turetildi (TURETILDI, fotograftan degil)
**Okuyan:** isci-A4-tur6 — dis LLM cagrisi YOK, llmCagri 0.

## Fotograftan ne okundu?

| kalem | okuma | guven |
|---|---|---|
| panel `on_govde` | GORULDU — tek parca bol tunik, dikey pile dokusu | 0.9 |
| panel `kol` | GORULDU — uzun kol, agizda dugumlu manset | 0.95 |
| panel `arka_govde` | gorulmedi (tabandan) — arka yok | 0.2 |
| kenar `on_govde/hem_front` | landmark.waist..landmark.knee oraninda **0.45**, hafif-kavis | 0.8 |
| kenar `kol/hem` | landmark.shoulderTip..landmark.wrist oraninda **1**, buzgulu-manset | 0.85 |
| kenar `on_govde/neck_front` | landmark.neckFront..landmark.bustLine oraninda **0**, yuvarlak | 0.8 |
| dikis `kol_oyugu` | kol/cap ↔ on_govde/armhole, oran [1,1.1] | 0.7 |
| dikis `kol_agzi` | kol/hem ↔ kol_bandi/ust, oran [1.2,1.4] | 0.8 |
| kapanma | yok / yok | 0.5 |
| simetri | cfAyna true, cbAyna true | 0.8 |

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
| 1 | `merge` | `{"seam":"bel","panelA":"on_beden","panelB":"on_etek","panel":"on_govde"}` | fotografta bel dikisi yok: on beden + on etek tek panel (bel pensi ic halka pense doner) |
| 2 | `merge` | `{"seam":"bel","panelA":"arka_beden","panelB":"arka_etek","panel":"arka_govde"}` | ayni: arka |
| 3 | `extendTo` | `{"panel":"on_govde","edge":"hem_front","yLandmark":"landmark.hip","yOffsetMM":150}` | tunik boyu: kalca + 15 cm (uyluk) |
| 4 | `extendTo` | `{"panel":"arka_govde","edge":"hem_back","yLandmark":"landmark.hip","yOffsetMM":150}` | tunik boyu: kalca + 15 cm (uyluk) (arka ayni) |
| 5 | `flare` | `{"panel":"on_govde","edge":"hem_front","factor":1.3}` | pileli bol etek ucu |
| 6 | `flare` | `{"panel":"arka_govde","edge":"hem_back","factor":1.3}` | pileli bol etek ucu (arka ayni) |
| 7 | `extendTo` | `{"panel":"kol","edge":"hem","yLandmark":"landmark.wrist","yOffsetMM":0}` | uzun kol: bilek |
| 8 | `attach` | `{"hostPanel":"kol","hostEdge":"hem","edge":"ust","ratio":0.7692,"seam":"kol_agzi","panel":{"id":"kol_bandi","edges":[{"id":"ust","kind":"seam","role":"cuff_top"…` | kol agzi dugumlu mansete buzgulu |
| 9 | `sew` | `{"seam":"kol_bandi_yan","a":[{"panel":"kol_bandi","edge":"yan1"}],"b":[{"panel":"kol_bandi","edge":"yan2"}],"reverse":true,"ratio":1}` | band halka olur: iki yan kenari birbirine |

**Cozucu hedefi** (grafa oran YAZILMAZ, yasa 3; `grafuygula --hedef` halka bolluguna cevirir, contract cozucu.hedef sinirina kirpar): 0 adet.


- dogrulayici (gercek36): hedefler[] bos: okuma siluet olcumu tasimiyor
Sapma buyukse bu OLCUMUN ilanidir: siluet "bel/enGenis" orani giysinin bel/gogus cevre orani degildir (kollar, poz); okuma zaten ZAYIF/SUPHELI etiketi tasiyor. Motor hedefi yutmadi, kirptigini ve sapmayi yazdi.

## Cizildi mi?

| cikti | durum | bayt |
|---|---|---|
| flat.svg | OK (data-ops=9) | 17572 |
| flat.png | OK | 49864 |
| kalip-36.svg | OK | 11835 |
| kalip-36.png | OK | 33883 |

**grafdogrula (gercek36):** KOSTU — kirmizi hukum: **0**

## Okunamayanlar (sessiz default YOK)

- boyun fiyongu (aplik)
- pile dokusu (plise: kumas islemi, kalip degil)
- KAYNAKLAR.md bu dosyayi 'beyaz gomlek + palto' diye tarif ediyor; fotografta palto YOK, pileli tunik var — dosya/tarif eslesmesi DOGRULANMADI

## Olculmedi

- siluet orani: defile fotografi (yuruyus pozu, aksesuar), poz landmark kosulmadi

## Primitif kumesiyle YAZILAMAYANLAR (eksikPrimitif — kumeye eklenecek primitifin adresi)

- PRIMITIF: plise (kumas islemi) grafta yok; fiyonk yok
