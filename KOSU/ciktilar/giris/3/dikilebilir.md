# 3. biba-O120579-dress.jpg — dikilebilir mi?

**Kaynak fotograf:** `GIRDI/hedef-fotograflar/biba-O120579-dress.jpg` (sha 97bd652fde35)
**Gorunum:** on · **Arka:** turetildi (TURETILDI, fotograftan degil)
**Okuyan:** isci-A3 — dis LLM cagrisi YOK, llmCagri 0.

## Fotograftan ne okundu?

| kalem | okuma | guven |
|---|---|---|
| panel `on_beden` | GORULDU — Gogus altinda yatay bir kesme cizgisi var (desen o hatta kesiliyor): ust beden ayri parca. Ustte anahtar deligi acikligi CF'yi isaretliyor. | 0.9 |
| panel `on_beden_yan` | GORULDU — Gogus alti kesme cizgisinin altinda, bele dogru daralan panel. Yan siniri desen yogunlugundan zor secilliyor; guven dusuk. | 0.65 |
| panel `boyun_bandi` | GORULDU — Boyunda dik duran, boyunu saran ayri bant. Ust kenari boyun cevresinin USTUNDE bitiyor; bandin kendi dikisi CF'de anahtar deligi olarak aciliyor. | 0.9 |
| panel `arka_beden` | gorulmedi (tabandan) — Gorunmuyor; tabandan. | 0.2 |
| panel `on_etek` | GORULDU — Belden asagi genisleyen, ete uzanan parca; kalca hizasinda desen yonu degismiyor, yani tek kesim (godet/parca eki yok). | 0.85 |
| panel `arka_etek` | gorulmedi (tabandan) — Gorunmuyor. | 0.2 |
| panel `kol` | GORULDU — Bilege kadar uzun, dar kol. Omuz basinda kucuk buzgu kabarikligi; kol agzinda dikey dugme/carpma detayi var. | 0.95 |
| kenar `boyun_bandi/neck_front` | landmark.neckFront..landmark.bustLine oraninda **0**, duz | 0.85 |
| kenar `on_beden/anahtar_deligi` | landmark.neckFront..landmark.bustLine oraninda **0.55**, kirik | 0.8 |
| kenar `on_beden/gogus_alti` | landmark.bustLine..landmark.waist oraninda **0.18**, kavisli-dis | 0.75 |
| kenar `on_etek/hem` | landmark.waist..landmark.ankle oraninda **0.62**, duz | 0.8 |
| kenar `kol/hem` | landmark.shoulderTip..landmark.wrist oraninda **1**, duz | 0.9 |
| kenar `kol/cap` | landmark.shoulderTip..landmark.bustLine oraninda **0**, kavisli-dis, buzgu [1.08,1.2] | 0.75 |
| dikis `gogus_alti_dikisi` | on_beden/gogus_alti ↔ on_beden_yan/ust, oran [1,1.12] | 0.7 |
| dikis `bel_dikisi` | on_beden_yan/waist ↔ on_etek/waist, oran [1,1] | 0.8 |
| dikis `yaka_dikisi` | boyun_bandi/alt ↔ on_beden/neck_front, oran [1,1] | 0.85 |
| dikis `kol_oyugu` | kol/cap ↔ on_beden/armhole, oran [1.08,1.2] | 0.75 |
| kapanma | okunamadi / okunamadi | 0.2 |
| simetri | cfAyna true, cbAyna true | 0.85 |

## Olcum ne dedi? (celiski tablosu)

Yasa 5: celiskide **olcum kazanir**. Bos tablo "celiski yok" demek degildir.

| kalem | Claude (ne) | olcum (ne kadar) | kazanan | sonuc |
|---|---|---|---|---|
| en genis nokta / bel orani | Giysi bedende oturuyor; en genis yer etek ucu, bel belirgin dar | siluet enGenis/omuz = 2.1558 — omuzun IKI KATI. Bir elbisede boyle bir genislik yok. | **olcum** (siluet-orani) | Olcum kazandi ve KENDINI curuttu: 2.16 giysinin degil, ACIK DURAN KOLLARIN genisligi (manken kollari yana acik, avuclar disarida). Yani bu fotografta siluet 'genislik' oranlari giysiyi degil pozu olcuyor. bel/enGenis = 0.4036 bu yuzden op'a SUPHELI etiketiyle girdi; duzeltmesi poz landmark'i (kaynak a), kurulmadi. OVERLAY-HUKMU.md ayni sonuca varmisti. |
| bel yuksekligi | Bel dogal belde, gogus altindaki kesmenin belirgin altinda | belKonum = 0.4894 (giysi boyunun yarisi) | **olcum** (siluet-orani) | Celiski: siluetin 'en dar nokta'si bel degil, kollarin govdeye en yakin oldugu yer. Dogal bel bir elbisede ~0.35 olur (bkz. biba-O1194418: 0.3552, kollari asagida). Op'a bel KONUMU girmedi; yalniz ORAN girdi ve o da supheli isaretli. |
| bel yuksekligi — poz landmark'i (kaynak a) HAKEM | Dogal bel; siluetin 0.4894'u bana yuksek geldi | poz landmark'i (MediaPipe pose landmarker lite, self-host web/vendor/pose/, headless Chrome'da kosuldu, guven 0.759): belY = 0.405. Siluet 0.4894 diyordu. | **olcum** (poz-landmark) | UC KAYNAK da olculdu ve poz siluetin hatasini ADIYLA acikladi: siluetin 'en dar nokta'si kollarin govdeye yaklastigi yerdi, bel degil. Poz omuz/kalca noktalarindan beli 0.405'te buluyor. Ayrica siluetin anlamsiz enGenis/omuz=2.1558 degeri de aciklandi: poz kolBoyu/omuzGen=1.2083 diyor, yani kollar gercekten omuzdan uzun ve acik; siluetin 'genislik' paydasi kollari olcuyordu. belY orani DOGRULANMADI bir sabit (omuz-kalca'nin 0.55'i) kullaniyor, o kalem ayrica isaretli. |

## Motora ne gecti? (primitif emir listesi)

Okuma dogrudan graf-v1 primitifleriyle yazilir (vision-graf-v1 yasa 9); ceviri katmani YOK.
Motor (`grafuygula`) taban grafa bu 14 emri sirayla uyguladi; cizici (`grafciz --ops`) ops SONRASI grafi cizdi.
Bir emir reddedilseydi teslim duserdi (sessiz atlama yok).

| # | primitif | args | doguran okuma kalemi |
|---|---|---|---|
| 1 | `subdivide` | `{"panel":"on_beden","edge":"cf","fractions":[0.35]}` | kenar on_beden/anahtar_deligi: CF ust bolumu ayrilir |
| 2 | `reshapeEdge` | `{"panel":"on_beden","edge":"cf.1","to":{"landmark":"landmark.waist","xFactor":0,"yLandmark":"landmark.neckFront","yLandmark2":"landmark.bustLine","yLerp":0.55},…` | kenar on_beden/anahtar_deligi: neckFront..bustLine 0.55, kirik; yarik = CF kat kenarinin serbest kenar olmus bolumu, genislik boyun ceyreginin 0.15'i |
| 3 | `reshapeEdge` | `{"panel":"on_beden","edge":"dart_on_beden.1","to":{"landmark":"landmark.underarm","xOf":"ringQuarter","ring":"girth.waist","xFactor":0.35,"yLandmark":"landmark.…` | kenar on_beden/gogus_alti 0.18: bel pensinin apeksi kesme hattinin altinda kalir (0.35) |
| 4 | `subdivide` | `{"panel":"on_beden","edge":"cf.2","fractions":[0.5]}` | kenar on_beden/gogus_alti: CF uzerinde kose |
| 5 | `reshapeEdge` | `{"panel":"on_beden","edge":"cf.2.1","to":{"landmark":"landmark.waist","xFactor":0,"yLandmark":"landmark.bustLine","yLandmark2":"landmark.waist","yLerp":0.18}}` | kenar on_beden/gogus_alti: bustLine..waist 0.18 (CF ucu) |
| 6 | `subdivide` | `{"panel":"on_beden","edge":"side_front","fractions":[0.76]}` | kenar on_beden/gogus_alti: yan dikis uzerinde kose, bel-koltukalti dogrusunun 0.76'sinda (= bustLine..waist 0.18 hatti, iki bedende <1 mm; dogru kenarda kesir = yay kesri, 0.5'teki centik yerinde kalir) |
| 7 | `split` | `{"panel":"on_beden","vertexA":"cf.2.2","vertexB":"side_front.2","panelA":"on_beden_alt","panelB":"on_beden_ust","seam":"gogus_alti","seamRatio":1}` | dikis gogus_alti_dikisi: on_beden/gogus_alti <-> on_beden_yan/ust, oranAralik [1.0,1.12] -> 1.0 secildi (alt sinir; ust panelin altini buzmek yan dikisi arkadan ayirirdi, "hafif bolluk olabilir" notu guven 0.7); kavisli-dis bicim DUZ kesildi (kontrol noktasi uydurulmadi) |
| 8 | `addPanel` | `{"panel":{"id":"boyun_bandi","edges":[{"id":"alt","kind":"seam","role":"neck_front","from":{"landmark":"landmark.neckFront","xFactor":0},"to":{"landmark":"landm…` | panel boyun_bandi gorulduMu + kenar boyun_bandi/neck_front (0.0) + dikis yaka_dikisi |
| 9 | `sew` | `{"seam":"boyun_dikisi","a":[{"panel":"boyun_bandi","edge":"alt"}],"b":[{"panel":"on_beden_ust","edge":"neck_front"}],"reverse":true,"ratio":1}` | dikis boyun_bandi/alt <-> on_beden/neck_front oranAralik [1.0,1.0] |
| 10 | `fitLength` | `{"panel":"boyun_bandi","edge":"alt","target":{"seam":"boyun_dikisi","ratio":1,"easeMM":0}}` | bandin alt kenari boyun hattinin uzunlugunu kapatir (kisit; mm yazilmaz) |
| 11 | `extendTo` | `{"panel":"on_etek","edge":"hem_front","yLandmark":"landmark.knee","yOffsetMM":0}` | kenar on_etek/hem: waist..ankle 0.62 -> landmark.knee |
| 12 | `extendTo` | `{"panel":"kol","edge":"hem","yLandmark":"landmark.wrist","yOffsetMM":0}` | kenar kol/hem: shoulderTip..wrist 1.0 -> landmark.wrist |
| 13 | `fitLength` | `{"panel":"kol","edge":"cap_front","target":{"seam":"kol_oyugu","ratio":1.14,"easeMM":0}}` | dikis kol_oyugu oranAralik [1.08,1.2] -> orta oran 1.14; toplama kol_oyugu dikisinin oranidir: kapak kenarlari zaten bu dikise kisitli (fitLength), oran yeniden yazilir ve her bedende cozulur |
| 14 | `fitLength` | `{"panel":"kol","edge":"cap_back","target":{"seam":"kol_oyugu","ratio":1.14,"easeMM":0}}` | dikis kol_oyugu oranAralik [1.08,1.2] -> orta oran 1.14; toplama kol_oyugu dikisinin oranidir: kapak kenarlari zaten bu dikise kisitli (fitLength), oran yeniden yazilir ve her bedende cozulur |

**Cozucu hedefi** (grafa oran YAZILMAZ, yasa 3; `grafuygula --hedef` halka bolluguna cevirir, contract cozucu.hedef sinirina kirpar): 1 adet.
- istenen: girth.waist / girth.bust = 0.4036 (kaynak: siluet-orani bel/enGenis) — OLCUM SUPHELI, celiskiTablosu'na bak
- motor: siluet-orani hedef girth.waist/girth.bust = 0.4036 (siluet-orani bel/enGenis; OLCUM SUPHELI, celiskiTablosu'na bak; payda = cizilen en genis yarim kesit 237.5 mm x 4 (genislik birimi, girth.bust cevresi degil)) | gereken bolluk -276.58 mm, uygulanan 0 mm (onceki 25; SINIRA KIRPILDI) | giysi orani 0.7333333333333333, sapma 0.32973333333333327
- dogrulayici (gercek36): siluet-orani hedef girth.waist/girth.bust = 0.4036 (siluet-orani bel/enGenis; OLCUM SUPHELI, celiskiTablosu'na bak; payda = cizilen en genis yarim kesit 237.5 mm x 4 (genislik birimi, girth.bust cevresi degil)) | gereken bolluk -276.58 mm, grafta 0 mm | giysi orani 0.6947368421052632, sapma 0.2911368421052632
Sapma buyukse bu OLCUMUN ilanidir: siluet "bel/enGenis" orani giysinin bel/gogus cevre orani degildir (kollar, poz); okuma zaten ZAYIF/SUPHELI etiketi tasiyor. Motor hedefi yutmadi, kirptigini ve sapmayi yazdi.

## Cizildi mi?

| cikti | durum | bayt |
|---|---|---|
| flat.svg | OK (data-ops=14) | 16885 |
| flat.png | OK | 44053 |
| kalip-36.svg | OK | 17477 |
| kalip-36.png | OK | 38324 |

**grafdogrula (gercek36):** KOSTU — kirmizi hukum: **0**

## Okunamayanlar (sessiz default YOK)

- kapanma yeri ve turu (on yuzde yok, arka gorunmuyor)
- yaka bandinin yuksekligi (oran olarak okunamadi, landmark yok)
- gogus alti kesmenin altinda pens var mi (desen gizliyor)
- etek panel sayisi
- kol agzindaki dugme adedi

## Olculmedi

- arka yuz: fotograf yok

## Primitif kumesiyle YAZILAMAYANLAR (eksikPrimitif — kumeye eklenecek primitifin adresi)

- OKUMA: kesme hattinin kavisli-dis bicimi icin kontrol noktasi orani verilmedi, duz kesildi
- OKUMA: kol agzi dusey dugme detayi — kapanma yalniz dikise yazilir, kol agzi dikis degil (detay, kalip parcasi degil)
- PRIMITIF: setGrain{panel, deg} — Panel.grainDeg alani var, yazan op yok (kesim planini degistirir, kalibi degil)
