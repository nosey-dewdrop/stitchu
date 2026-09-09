# 4. mary-quant-O365926-dress.jpg — dikilebilir mi?

**Kaynak fotograf:** `GIRDI/hedef-fotograflar/mary-quant-O365926-dress.jpg` (sha f35565a6e4e4)
**Gorunum:** on · **Arka:** fotograf (fotograftan)
**Okuyan:** isci-A3 — dis LLM cagrisi YOK, llmCagri 0.

## Fotograftan ne okundu?

| kalem | okuma | guven |
|---|---|---|
| panel `on_beden` | GORULDU — Dikey seersucker cizgi CF pacisinda kesiliyor ve iki yanda simetrik devam ediyor; cizgi yonu panelin dogrultusunu dogrudan gosteriyor. | 0.95 |
| panel `boyun_bandi` | GORULDU — Omuzlari ortan genis, DUZ BEYAZ (kontrast kumas) yatik yaka; kendi dikisiyle bedene oturuyor. Kare-ye yakin, omuz uclarina kadar uzaniyor. | 0.95 |
| panel `kol` | GORULDU — Kisa, duz, mansetsiz kol; cizgiler kolda govdeyle AYNI dikey yonde, yani kol ayri parca ve duz kesilmis. | 0.95 |
| panel `bel_bandi` | GORULDU — Belde ayni kumastan ince kemer; onde tokali/dugmeli. Bedene DIKILI DEGIL (arka fotografta serbest gecio), ayri parca. | 0.9 |
| panel `on_yama` | GORULDU — Kalca hizasinda iki adet YAMA cep, beyaz kapakli; cebin kendi cizgileri govdeninkiyle ayni yonde. | 0.9 |
| panel `arka_beden` | gorulmedi (tabandan) — Bu fotografta gorulmuyor AMA es fotografta (0147b7cf) GERCEKTEN gorunuyor; guven oradan geliyor. | 0.9 |
| panel `on_etek` | gorulmedi (tabandan) — AYRI bir etek paneli YOK: cizgiler omuzdan ete kadar KESINTISIZ iniyor. Bel dikisi bulunmuyor -> shift/gomlek elbise, tek kat govde. | 0.85 |
| kenar `boyun_bandi/neck_front` | landmark.neckFront..landmark.bustLine oraninda **0.1**, kavisli-ic | 0.85 |
| kenar `boyun_bandi/dis_kenar` | landmark.neckFront..landmark.bustLine oraninda **0.62**, kavisli-dis | 0.85 |
| kenar `on_beden/hem` | landmark.waist..landmark.ankle oraninda **0.42**, duz | 0.8 |
| kenar `kol/hem` | landmark.shoulderTip..landmark.wrist oraninda **0.4**, duz | 0.9 |
| kenar `kol/cap` | landmark.shoulderTip..landmark.bustLine oraninda **0**, kavisli-dis | 0.8 |
| dikis `omuz` | on_beden/shoulder ↔ arka_beden/shoulder, oran [1,1] (GORUNMUYOR, cikarim) | 0.6 |
| dikis `kol_oyugu` | kol/cap ↔ on_beden/armhole, oran [1,1.05] | 0.8 |
| dikis `yan_dikis` | on_beden/side ↔ arka_beden/side, oran [1,1] | 0.75 |
| dikis `yaka_dikisi` | boyun_bandi/ic ↔ on_beden/neck_front, oran [1,1] | 0.9 |
| kapanma | on_orta / dugme | 0.9 |
| simetri | cfAyna true, cbAyna true | 0.9 |

## Olcum ne dedi? (celiski tablosu)

Yasa 5: celiskide **olcum kazanir**. Bos tablo "celiski yok" demek degildir.

| kalem | Claude (ne) | olcum (ne kadar) | kazanan | sonuc |
|---|---|---|---|---|
| giysi boyu | Diz ustunde biten kisa elbise; bel-ayakbilegi araliginda ~0.42 | siluet boy/omuz = 2.5061 | **olcum** (siluet-orani) | Olcum bu fotografta KULLANILAMAZ ve nedeni olculdu: siluet giysiyi degil, giysi + manken AYAGI + zemin tahtasini iceriyor (bu cekim askidaki manken ayakligiyla, parke zemin uzerinde). sapKes ayagi kesmeye calisti ama parke zemin kontrasti dusuk. kalite=ZAYIF etiketi bundan. Op'a semantik 0.42 girdi, olcum girmedi; sapma bu satirda ilan. |
| bel daralmasi | Shift/gomlek elbise: belde daralma AZ, kemer kumasi topluyor ama kesim duz | bel/enGenis = 0.4654 | **olcum** (siluet-orani) | Celiski GERCEK: 0.4654 belirgin oturan bir bedeni tarif eder, ben duz kesim goruyorum. Kok sebep olculdu: siluetin 'en genis' noktasi kollar ACIK oldugu icin kol hizasi (enGenis/omuz 1.4735 > 1). Yani payda yanlis. Yasa 5 geregi olcum kazanir ve op'a o girdi, ama SUPHELI etiketiyle; duzeltmesi poz landmark'i (kaynak a), kurulmadi. |
| bel dikisi var mi | YOK — cizgiler omuzdan ete kesintisiz | siluet profilinde 0.3-0.5 araliginda kirilma yok (profil f=0.4 ve f=0.5 genislikleri yakin) | **olcum** (siluet-orani) | Celiski yok, iki kaynak ayni sey soyluyor. mergeSeam op'u bu iki kaynakla birlikte dogdu. |

## Motora ne gecti? (primitif emir listesi)

Okuma dogrudan graf-v1 primitifleriyle yazilir (vision-graf-v1 yasa 9); ceviri katmani YOK.
Motor (`grafuygula`) taban grafa bu 12 emri sirayla uyguladi; cizici (`grafciz --ops`) ops SONRASI grafi cizdi.
Bir emir reddedilseydi teslim duserdi (sessiz atlama yok).

| # | primitif | args | doguran okuma kalemi |
|---|---|---|---|
| 1 | `merge` | `{"seam":"bel","panelA":"on_beden","panelB":"on_etek","panel":"on_govde"}` | panel on_etek gorulmedi: cizgiler kesintisiz, bel dikisi YOK -> on beden + on etek tek panel |
| 2 | `merge` | `{"seam":"bel","panelA":"arka_beden","panelB":"arka_etek","panel":"arka_govde"}` | arka: es fotograf (arka) bel dikisi gostermiyor -> arka tek panel |
| 3 | `reshapeEdge` | `{"panel":"on_govde","edge":"neck_front","to":{"landmark":"landmark.waist","xFactor":0,"yLandmark":"landmark.neckFront","yLandmark2":"landmark.bustLine","yLerp":…` | kenar boyun_bandi/neck_front: neckFront..bustLine 0.1, kavisli-ic (boyun hatti hafif asagida) |
| 4 | `sew` | `{"seam":"on_orta","a":[{"panel":"on_govde","edge":"cf.1"},{"panel":"on_govde","edge":"cf.2"}],"b":[{"panel":"on_govde","edge":"cf.1"},{"panel":"on_govde","edge"…` | kapanma okumasi: yer on_orta -> on orta kat kenari kendi ayna kopyasiyla dikilir (kat acilir) |
| 5 | `closure` | `{"seam":"on_orta","type":"buttons","fromFraction":0.02,"toFraction":0.78}` | kapanma okumasi: on_orta / dugme, oranBas 0.02 oranSon 0.78 (tam boy paci) |
| 6 | `addPanel` | `{"panel":{"id":"boyun_bandi","edges":[{"id":"ic","kind":"seam","role":"neck_front","from":{"landmark":"landmark.waist","xFactor":0,"yLandmark":"landmark.neckFro…` | panel boyun_bandi gorulduMu + kenar boyun_bandi/dis_kenar (oran 0.62, kavisli-dis) + katman kaydi |
| 7 | `sew` | `{"seam":"boyun_dikisi","a":[{"panel":"boyun_bandi","edge":"ic"}],"b":[{"panel":"on_govde","edge":"neck_front"}],"reverse":true,"ratio":1}` | dikis boyun_bandi/ic <-> on_govde/neck_front [1.0,1.0] |
| 8 | `fitLength` | `{"panel":"boyun_bandi","edge":"ic","target":{"seam":"boyun_dikisi","ratio":1,"easeMM":0}}` | ic kenar boyun hattinin uzunlugunu kapatir (kisit) |
| 9 | `addPanel` | `{"onto":"on_govde","panel":{"id":"on_yama","edges":[{"id":"ust","kind":"cut","from":{"landmark":"landmark.waist","xOf":"ringQuarter","xFactor":0.35,"yLandmark":…` | panel on_yama gorulduMu + katman kaydi (on_beden ustunde 0.44-0.60), adet 2 |
| 10 | `extendTo` | `{"panel":"on_govde","edge":"hem_front","yLandmark":"landmark.knee","yOffsetMM":0}` | kenar on_beden/hem: waist..ankle 0.42 -> govde zincirinde 0.617, en yakin landmark.knee (0.72; crotch 0.50 daha uzak) |
| 11 | `extendTo` | `{"panel":"arka_govde","edge":"hem_back","yLandmark":"landmark.knee","yOffsetMM":0}` | arka hem on hem ile ayni boyda (es fotograf arka/hem 0.42) |
| 12 | `extendTo` | `{"panel":"kol","edge":"hem","yLandmark":"landmark.elbow","yOffsetMM":0}` | kenar kol/hem: shoulderTip..wrist 0.40 -> landmark.elbow (0.55) |

**Cozucu hedefi** (grafa oran YAZILMAZ, yasa 3; `grafuygula --hedef` halka bolluguna cevirir, contract cozucu.hedef sinirina kirpar): 1 adet.
- istenen: girth.waist / girth.bust = 0.4654 (kaynak: siluet-orani bel/enGenis) — OLCUM ZAYIF (kalite=ZAYIF), celiskiTablosu'na bak
- motor: siluet-orani hedef girth.waist/girth.bust = 0.4654 (siluet-orani bel/enGenis; OLCUM ZAYIF (kalite=ZAYIF), celiskiTablosu'na bak; payda = cizilen en genis yarim kesit 237.5 mm x 4 (genislik birimi, girth.bust cevresi degil)) | gereken bolluk -217.87 mm, uygulanan 0 mm (onceki 25; SINIRA KIRPILDI) | giysi orani 0.7333333333333333, sapma 0.2679333333333333
- dogrulayici (gercek36): siluet-orani hedef girth.waist/girth.bust = 0.4654 (siluet-orani bel/enGenis; OLCUM ZAYIF (kalite=ZAYIF), celiskiTablosu'na bak; payda = cizilen en genis yarim kesit 237.5 mm x 4 (genislik birimi, girth.bust cevresi degil)) | gereken bolluk -217.87 mm, grafta 0 mm | giysi orani 0.6947368421052632, sapma 0.22933684210526323
Sapma buyukse bu OLCUMUN ilanidir: siluet "bel/enGenis" orani giysinin bel/gogus cevre orani degildir (kollar, poz); okuma zaten ZAYIF/SUPHELI etiketi tasiyor. Motor hedefi yutmadi, kirptigini ve sapmayi yazdi.

## Cizildi mi?

| cikti | durum | bayt |
|---|---|---|
| flat.svg | OK (data-ops=12) | 14355 |
| flat.png | OK | 43694 |
| kalip-36.svg | OK | 13603 |
| kalip-36.png | OK | 44974 |

**grafdogrula (gercek36):** KOSTU — kirmizi hukum: **0**

## Okunamayanlar (sessiz default YOK)

- dugme adedi (6 mi 7 mi)
- arka pens var mi (on yuzden gorunmez; es fotografta OKUNDU)
- cep torbasinin tam derinligi
- kemerin bedene dikili olup olmadigi (arka fotograf serbest gecio diyor)

## Olculmedi

- poz landmark (kaynak a): KOSULDU -> poz BULUNDU ama guven 0.180; esik altı sayildi ve KULLANILMADI (dusuk guvenli pozu olcum diye kullanmak siluetten daha kotu olurdu).

## Primitif kumesiyle YAZILAMAYANLAR (eksikPrimitif — kumeye eklenecek primitifin adresi)

- OKUMA: bagimsiz parca (bel bandi/kusak) — hicbir panele dikili degil, komsuluk_bagli kurali reddeder; aksesuar, kalip parcasi degil
- OKUMA: yama parcanin yatay yeri fotograftan oran olarak cikarilmadi (DOGRULANMADI, secildi)
