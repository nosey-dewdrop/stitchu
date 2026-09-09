# 2. biba-O1194418-dress-arka.jpg — dikilebilir mi?

**Kaynak fotograf:** `GIRDI/hedef-fotograflar/biba-O1194418-dress-arka.jpg` (sha 4e446902ceaa)
**Gorunum:** on · **Arka:** turetildi (TURETILDI, fotograftan degil)
**Okuyan:** isci-A3 — dis LLM cagrisi YOK, llmCagri 0.

## Fotograftan ne okundu?

| kalem | okuma | guven |
|---|---|---|
| panel `on_beden` | GORULDU — CF'de aynalanmis chevron; es fotografla ayni yuz. | 0.95 |
| panel `on_beden_yan` | GORULDU — Gogus altinda cizgi acisi kiriliyor, iki tarafta simetrik. | 0.8 |
| panel `arka_beden` | gorulmedi (tabandan) — Bu fotograf da ON yuzu gosteriyor; arka panel GORULMEDI. | 0.15 |
| panel `on_ust_kat` | GORULDU — Bel hattinda ayri kat, onde sivri uc. | 0.9 |
| panel `on_etek` | GORULDU — Peplumun altindan cikan bagimsiz chevron ekseni. | 0.9 |
| panel `arka_etek` | gorulmedi (tabandan) — Gorulmedi. | 0.15 |
| panel `kol` | GORULDU — Omuz basinda buzgu kivrimlari; dirsek ustu duz agiz. | 0.95 |
| kenar `on_beden/neck_front` | landmark.neckFront..landmark.bustLine oraninda **0.33**, kavisli-ic | 0.8 |
| kenar `on_etek/hem` | landmark.waist..landmark.ankle oraninda **0.6**, duz | 0.75 |
| kenar `kol/hem` | landmark.shoulderTip..landmark.wrist oraninda **0.47**, duz | 0.85 |
| kenar `kol/cap` | landmark.shoulderTip..landmark.bustLine oraninda **0**, kavisli-dis, buzgu [1.15,1.35] | 0.8 |
| kenar `on_ust_kat/hem` | landmark.waist..landmark.hip oraninda **0.62**, kirik | 0.85 |
| dikis `bel_dikisi` | on_beden/waist_front ↔ on_ust_kat/waist, oran [1,1] | 0.9 |
| dikis `on_yan_dikis` | on_beden/side ↔ on_beden_yan/side, oran [1,1] | 0.75 |
| dikis `kol_oyugu` | kol/cap ↔ on_beden/armhole, oran [1.15,1.35] | 0.8 |
| kapanma | on_orta / dugme | 0.9 |
| simetri | cfAyna true, cbAyna true | 0.9 |

## Olcum ne dedi? (celiski tablosu)

Yasa 5: celiskide **olcum kazanir**. Bos tablo "celiski yok" demek degildir.

| kalem | Claude (ne) | olcum (ne kadar) | kazanan | sonuc |
|---|---|---|---|---|
| gorunum (on mu arka mi) | Dosya adi 'arka'; ben fotografa bakinca ON goruyorum (sweetheart yaka, on paci, sivri peplum ucu) | siluet oranlari iki dosyada neredeyse ayni: boy/omuz 2.3459 vs 2.3199, belKonum 0.3570 vs 0.3552, bel/enGenis 0.5063 vs 0.4954. Ayni giysinin ayni yuzu. | **olcum** (siluet-orani) | Dosya ADI curutuldu. gorunum='on' yazildi, arka.koken='turetildi'. Ad degistirilmedi (GIRDI/ salt okunur). |
| etek ucu genisligi | Iki fotografta ayni etek | etekUcu/omuz 0.5094 (bu) vs 0.4348 (es) — %17 fark | **olcum** (siluet-orani) | Fark giysiden degil KADRAJDAN: es fotografta tripod etek ucunu kesiyor (sapKesimi 65 satir). Bu dosyanin sayisi daha guvenilir, op'a 0.60 girdi. |

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
- istenen: girth.waist / girth.bust = 0.5063 (kaynak: siluet-orani bel/enGenis)
- motor: siluet-orani hedef girth.waist/girth.bust = 0.5063 (siluet-orani bel/enGenis) | gereken bolluk -204.33 mm, uygulanan 0 mm (onceki 25; SINIRA KIRPILDI) | giysi orani 0.7333333333333333, sapma 0.2270333333333333
- dogrulayici (gercek36): siluet-orani hedef girth.waist/girth.bust = 0.5063 (siluet-orani bel/enGenis) | gereken bolluk -204.33 mm, grafta 0 mm | giysi orani 0.7333333333333333, sapma 0.2270333333333333
Sapma buyukse bu OLCUMUN ilanidir: siluet "bel/enGenis" orani giysinin bel/gogus cevre orani degildir (kollar, poz); okuma zaten ZAYIF/SUPHELI etiketi tasiyor. Motor hedefi yutmadi, kirptigini ve sapmayi yazdi.

## Cizildi mi?

| cikti | durum | bayt |
|---|---|---|
| flat.svg | OK (data-ops=8) | 16204 |
| flat.png | OK | 46502 |
| kalip-36.svg | OK | 13873 |
| kalip-36.png | OK | 38043 |

**grafdogrula (gercek36):** KOSTU — kirmizi hukum: **0**

## Okunamayanlar (sessiz default YOK)

- arka yuzun her ayrintisi
- prenses mi pens mi
- etek panel sayisi
- arka kapanma

## Olculmedi

- poz landmark (kaynak a): KOSULDU -> ERR_NO_POSE (manken govdesi, bas yok).
- arka yuz: hicbir fotografta yok

## Primitif kumesiyle YAZILAMAYANLAR (eksikPrimitif — kumeye eklenecek primitifin adresi)

- PRIMITIF: setGrain{panel, deg} — Panel.grainDeg alani var, yazan op yok (kesim planini degistirir, kalibi degil)
- OKUMA: ikinci katin bel dikisine yakalanmasi — ayni dikise ucuncu katman dikis modelinde yok; kat yuze dikili (onto) yazildi, konstruksiyon notu farkli
