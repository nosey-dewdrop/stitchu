# 1. biba-O1194418-dress.jpg — dikilebilir mi?

**Kaynak fotograf:** `GIRDI/hedef-fotograflar/biba-O1194418-dress.jpg` (sha 88ab9466d20c)
**Gorunum:** on · **Arka:** turetildi (TURETILDI, fotograftan degil)
**Okuyan:** isci-A3 — dis LLM cagrisi YOK, llmCagri 0.

## Fotograftan ne okundu?

| kalem | okuma | guven |
|---|---|---|
| panel `on_beden` | GORULDU — Bias cizgi on ortada V/chevron olusturacak sekilde aynalanmis; ayna ekseni CF. Cizgiler yaka ile bel arasinda kesintisiz, yani beden tek kat. | 0.95 |
| panel `on_beden_yan` | GORULDU — Gogus altindan kol oyuguna dogru cizgi acisi KIRILIYOR (sol ve sagda simetrik). Bias kumasta aci kirilmasi bir dikis demektir; prenses/yan-on panel siniri. | 0.8 |
| panel `arka_beden` | gorulmedi (tabandan) — Arka yuz bu fotografta gorunmuyor; panel tabandan geliyor. | 0.2 |
| panel `on_ust_kat` | GORULDU — Bel hattinda ayri bir kat basliyor: cizgi yonu bel dikisinde sifirlaniyor ve peplum icinde YENIDEN chevron kuruyor. Onde ortada sivri dusuyor, yanlarda yukseliyor; alt kenari etek uzerinde serbest duruyor (govde ile birlesmiyor). | 0.9 |
| panel `on_etek` | GORULDU — Peplumun altindan cikan, kendi chevron ekseni olan genisleyen parca. Etek chevron'u peplumunkinden BAGIMSIZ (ayri kesim). | 0.9 |
| panel `arka_etek` | gorulmedi (tabandan) — Gorunmuyor; tabandan. | 0.2 |
| panel `kol` | GORULDU — Iki kolda da cizgiler govdeninkinden farkli acida; omuz basinda kumas toplanmis (buzgu kivrimlari cizgileri kiriyor). Dirsek ustunde duz agizla bitiyor. | 0.95 |
| kenar `on_beden/neck_front` | landmark.neckFront..landmark.bustLine oraninda **0.33**, kavisli-ic | 0.8 |
| kenar `on_beden/omuz` | landmark.shoulderTip..landmark.shoulderTip oraninda **1**, duz | 0.6 |
| kenar `on_ust_kat/hem` | landmark.waist..landmark.hip oraninda **0.62**, kirik | 0.85 |
| kenar `on_etek/hem` | landmark.waist..landmark.ankle oraninda **0.6**, duz | 0.7 |
| kenar `kol/hem` | landmark.shoulderTip..landmark.wrist oraninda **0.47**, duz | 0.85 |
| kenar `kol/cap` | landmark.shoulderTip..landmark.bustLine oraninda **0**, kavisli-dis, buzgu [1.15,1.35] | 0.8 |
| dikis `bel_dikisi` | on_beden/waist_front ↔ on_ust_kat/waist, oran [1,1] | 0.9 |
| dikis `etek_beli` | on_ust_kat/waist ↔ on_etek/waist, oran [1,1] (GORUNMUYOR, cikarim) | 0.5 |
| dikis `on_yan_dikis` | on_beden/side ↔ on_beden_yan/side, oran [1,1] | 0.75 |
| dikis `kol_oyugu` | kol/cap ↔ on_beden/armhole, oran [1.15,1.35] | 0.8 |
| kapanma | on_orta / dugme | 0.9 |
| simetri | cfAyna true, cbAyna true | 0.95 |

## Olcum ne dedi? (celiski tablosu)

Yasa 5: celiskide **olcum kazanir**. Bos tablo "celiski yok" demek degildir.

| kalem | Claude (ne) | olcum (ne kadar) | kazanan | sonuc |
|---|---|---|---|---|
| etek boyu | diz alti / midi — yaklasik bel-ayakbilegi araliginda 0.60 | siluet etekUcu/omuz = 0.4348 ve alt satirlar tripod tarafindan kesilmis (sapKesimi 65 satir kesti); olculen boy giysinin TAM boyu degil | **olcum** (siluet-orani) | Olcum 'boyu ben tam goremedim' diyor, 0.60'i CURUTMUYOR ama DOGRULAMIYOR da. Op'ta 0.60 KALDI ve bu satir sapmayi ilan ediyor; onizleme (A5) gosterir. |
| bel daralmasi | belirgin oturan bel, bel dikisli | bel/enGenis = 0.4954 (siluet) | **olcum** (siluet-orani) | Celiski YOK: iki kaynak ayni yone isaret ediyor. Sayi (0.4954) semantigin yerine gecti, op'a o girdi. |
| en genis nokta | peplum yanlarda en genis yer | enGenis/omuz = 1.0155, enGenisY siluet boyunun %32'sinde — yani peplum hattinda | **olcum** (siluet-orani) | Dogrulandi; peplum katmaninin oranSon degeri bu olcumle uyumlu. |

## Motora ne gecti? (primitif emir listesi)

Okuma dogrudan graf-v1 primitifleriyle yazilir (vision-graf-v1 yasa 9); ceviri katmani YOK.
Motor (`grafuygula`) taban grafa bu 8 emri sirayla uyguladi; cizici (`grafciz --ops`) ops SONRASI grafi cizdi.
Bir emir reddedilseydi teslim duserdi (sessiz atlama yok).

| # | primitif | args | doguran okuma kalemi |
|---|---|---|---|
| 1 | `extendTo` | `{"panel":"on_etek","edge":"hem_front","yLandmark":"landmark.knee","yOffsetMM":0}` | kenar on_etek/hem: waist..ankle 0.60 -> govde zincirinde 0.736, en yakin landmark.knee (0.72) |
| 2 | `extendTo` | `{"panel":"kol","edge":"hem","yLandmark":"landmark.elbow","yOffsetMM":0}` | kenar kol/hem: shoulderTip..wrist 0.47 -> kol zincirinde en yakin landmark.elbow (0.55) |
| 3 | `fitLength` | `{"panel":"kol","edge":"cap_front","target":{"seam":"kol_oyugu","ratio":1.25,"easeMM":0}}` | dikis kol_oyugu oranAralik [1.15,1.35] -> orta oran 1.25 (cozucu tek sayi ister); toplama kol_oyugu dikisinin oranidir: kapak kenarlari zaten bu dikise kisitli (fitLength), oran yeniden yazilir ve her bedende cozulur |
| 4 | `fitLength` | `{"panel":"kol","edge":"cap_back","target":{"seam":"kol_oyugu","ratio":1.25,"easeMM":0}}` | dikis kol_oyugu oranAralik [1.15,1.35] -> orta oran 1.25 (cozucu tek sayi ister); toplama kol_oyugu dikisinin oranidir: kapak kenarlari zaten bu dikise kisitli (fitLength), oran yeniden yazilir ve her bedende cozulur |
| 5 | `reshapeEdge` | `{"panel":"on_beden","edge":"neck_front","to":{"landmark":"landmark.waist","xFactor":0,"yLandmark":"landmark.neckFront","yLandmark2":"landmark.bustLine","yLerp":…` | kenar on_beden/neck_front: neckFront..bustLine oraninda 0.33, kavisli-ic (CF ucu asagida, kenar iceri kavisli) |
| 6 | `addPanel` | `{"onto":"on_etek","panel":{"id":"on_ust_kat","edges":[{"id":"cf","kind":"fold","role":"cf","from":{"landmark":"landmark.waist","xFactor":0},"to":{"landmark":"la…` | panel on_ust_kat gorulduMu + katman kaydi (on_etek ustunde 0.0-0.3) + kenar on_ust_kat/hem (waist..hip 0.62, kirik) |
| 7 | `sew` | `{"seam":"on_orta","a":[{"panel":"on_beden","edge":"cf"},{"panel":"on_etek","edge":"cf"}],"b":[{"panel":"on_beden","edge":"cf"},{"panel":"on_etek","edge":"cf"}],…` | kapanma okumasi: yer on_orta -> on orta kat kenari kendi ayna kopyasiyla dikilir (kat acilir) |
| 8 | `closure` | `{"seam":"on_orta","type":"buttons","fromFraction":0.06,"toFraction":0.34}` | kapanma okumasi: on_orta / dugme, oranBas 0.06 oranSon 0.34 (4 dugme, yaka altindan bele) |

**Cozucu hedefi** (grafa oran YAZILMAZ, yasa 3; `grafuygula --hedef` halka bolluguna cevirir, contract cozucu.hedef sinirina kirpar): 1 adet.
- istenen: girth.waist / girth.bust = 0.4954 (kaynak: siluet-orani bel/enGenis)
- motor: siluet-orani hedef girth.waist/girth.bust = 0.4954 (siluet-orani bel/enGenis; payda = cizilen en genis yarim kesit 296.875 mm x 4 (genislik birimi, girth.bust cevresi degil)) | gereken bolluk -71.71249999999999 mm, uygulanan 0 mm (onceki 25; SINIRA KIRPILDI) | giysi orani 0.7333333333333333, sapma 0.23793333333333327
- dogrulayici (gercek36): siluet-orani hedef girth.waist/girth.bust = 0.4954 (siluet-orani bel/enGenis; payda = cizilen en genis yarim kesit 296.875 mm x 4 (genislik birimi, girth.bust cevresi degil)) | gereken bolluk -71.71249999999999 mm, grafta 0 mm | giysi orani 0.5557894736842105, sapma 0.06038947368421049
Sapma buyukse bu OLCUMUN ilanidir: siluet "bel/enGenis" orani giysinin bel/gogus cevre orani degildir (kollar, poz); okuma zaten ZAYIF/SUPHELI etiketi tasiyor. Motor hedefi yutmadi, kirptigini ve sapmayi yazdi.

## Cizildi mi?

| cikti | durum | bayt |
|---|---|---|
| flat.svg | OK (data-ops=8) | 16196 |
| flat.png | OK | 46486 |
| kalip-36.svg | OK | 13334 |
| kalip-36.png | OK | 38578 |

**grafdogrula (gercek36):** KOSTU — kirmizi hukum: **0**

## Okunamayanlar (sessiz default YOK)

- prenses mi pens mi: bias cizgi acisi bir dikis oldugunu soyluyor ama pens agzi gorunmuyor; 'on_beden_yan' paneli bu yuzden guven 0.8
- etek panel sayisi: chevron ekseni tek, ama yan dikis gorunmuyor (2 mi 4 mu)
- arka kapanma (fermuar?): gorunmuyor
- 5. dugme: peplum uzerinde devam ediyor olabilir, secilemedi
- cbAyna: arka gorunmedigi icin cikarim

## Olculmedi

- poz landmark (kaynak a): KOSULDU (MediaPipe lite, self-host, headless Chrome) -> ERR_NO_POSE. Model insan pozu icin egitildi, bu kare manken govdesi (bas yok). Oranlar landmark'a gore CIKARIM.
- arka yuz: es dosya arka degil (bkz. arka.neden)

## Primitif kumesiyle YAZILAMAYANLAR (eksikPrimitif — kumeye eklenecek primitifin adresi)

- PRIMITIF: setGrain{panel, deg} — Panel.grainDeg alani var, yazan op yok (kesim planini degistirir, kalibi degil)
- OKUMA: ikinci katin bel dikisine yakalanmasi — ayni dikise ucuncu katman dikis modelinde yok; kat yuze dikili (onto) yazildi, konstruksiyon notu farkli
