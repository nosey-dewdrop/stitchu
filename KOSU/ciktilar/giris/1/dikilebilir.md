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
| panel `peplum_on` | GORULDU — Bel hattinda ayri bir kat basliyor: cizgi yonu bel dikisinde sifirlaniyor ve peplum icinde YENIDEN chevron kuruyor. Onde ortada sivri dusuyor, yanlarda yukseliyor; alt kenari etek uzerinde serbest duruyor (govde ile birlesmiyor). | 0.9 |
| panel `on_etek` | GORULDU — Peplumun altindan cikan, kendi chevron ekseni olan genisleyen parca. Etek chevron'u peplumunkinden BAGIMSIZ (ayri kesim). | 0.9 |
| panel `arka_etek` | gorulmedi (tabandan) — Gorunmuyor; tabandan. | 0.2 |
| panel `kol` | GORULDU — Iki kolda da cizgiler govdeninkinden farkli acida; omuz basinda kumas toplanmis (buzgu kivrimlari cizgileri kiriyor). Dirsek ustunde duz agizla bitiyor. | 0.95 |
| kenar `on_beden/neck_front` | landmark.neckFront..landmark.bustLine oraninda **0.33**, kavisli-ic | 0.8 |
| kenar `on_beden/omuz` | landmark.shoulderTip..landmark.shoulderTip oraninda **1**, duz | 0.6 |
| kenar `peplum_on/hem` | landmark.waist..landmark.hip oraninda **0.62**, kirik | 0.85 |
| kenar `on_etek/hem` | landmark.waist..landmark.ankle oraninda **0.6**, duz | 0.7 |
| kenar `kol/hem` | landmark.shoulderTip..landmark.wrist oraninda **0.47**, duz | 0.85 |
| kenar `kol/cap` | landmark.shoulderTip..landmark.bustLine oraninda **0**, kavisli-dis, buzgu [1.15,1.35] | 0.8 |
| dikis `bel_dikisi` | on_beden/waist_front ↔ peplum_on/waist, oran [1,1] | 0.9 |
| dikis `etek_beli` | peplum_on/waist ↔ on_etek/waist, oran [1,1] (GORUNMUYOR, cikarim) | 0.5 |
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

## Motora ne gecti?

Okuma dili (fotograf) ile motorun op sozlugu ayni sey degil. Ceviri ve **cevrilemeyenler**:

| okuma op'u | motor op'u | not |
|---|---|---|
| — | `extendTo` | {"panel":"on_etek","edge":"hem_front","yLandmark":"landmark.knee","yOffsetMM":0} |
| — | `extendTo` | {"panel":"kol","edge":"hem","yLandmark":"landmark.elbow","yOffsetMM":0} |
| — | `gather` | {"panel":"kol","edge":"cap_back","ratio":1.25} |
| `setNeckline` | **YOK** | motorun op sozlugunde karsiligi yok (contract/graf-v1.json oplar) — dogduran okuma: kenar on_beden/neck_front; 'sweetheart yaka' kisaltmasinin cozumu |
| `addPanel` | **YOK** | motorun op sozlugunde karsiligi yok (contract/graf-v1.json oplar) — dogduran okuma: panel peplum_on + katman kaydi + 'peplum' kisaltmasi |
| `addClosure` | **YOK** | dikis yok: on_orta (taban grafta on orta dikis bulunmuyor) — dogduran okuma: kapanma okumasi |

**Cozucu hedefi** (grafa YAZILMAZ, contract yasa 3): 1 adet.
- girth.waist / girth.bust = 0.4954 (kaynak: siluet-orani bel/enGenis)

**Landmark kaybi** (motor ara noktaya baglanamiyor, en yakin landmark secildi):
- `extendTo`: istenen oran 0.6 (landmark.waist..landmark.ankle, govde zinciri) = 0.736; en yakin landmark landmark.knee (0.72), fark 0.016 — motor ARA NOKTAYA baglayamiyor (extendTo landmark ister)
- `extendTo`: istenen oran 0.47 (landmark.shoulderTip..landmark.wrist, kol zinciri) = 0.470; en yakin landmark landmark.elbow (0.55), fark 0.080 — motor ARA NOKTAYA baglayamiyor (extendTo landmark ister)
- `gather`: aralik [1.15, 1.35] -> orta 1.2500 (cozucu tek sayi ister)

## Cizildi mi?

| cikti | durum | bayt |
|---|---|---|
| flat.svg | OK | 21422 |
| flat.png | OK | 82695 |
| kalip-36.svg | OK | 12734 |
| kalip-36.png | OK | 41871 |

**grafdogrula (gercek36):** KOSTU — kirmizi hukum: 0

## Okunamayanlar (sessiz default YOK)

- prenses mi pens mi: bias cizgi acisi bir dikis oldugunu soyluyor ama pens agzi gorunmuyor; 'on_beden_yan' paneli bu yuzden guven 0.8
- etek panel sayisi: chevron ekseni tek, ama yan dikis gorunmuyor (2 mi 4 mu)
- arka kapanma (fermuar?): gorunmuyor
- 5. dugme: peplum uzerinde devam ediyor olabilir, secilemedi
- cbAyna: arka gorunmedigi icin cikarim

## Olculmedi

- poz landmark (kaynak a): MediaPipe kurulmadi; landmark adlari body-v1 semasindan, fotograftan DEGIL. Butun 'oran' alanlari bu yuzden landmark'a gore CIKARIM, poz olcumu degil.
- arka yuz: es dosya arka degil (bkz. arka.neden)

## Motorun op sozlugunde KARSILIGI OLMAYANLAR

- sweetheart yaka: motorun yaka enum'unda karsiligi yok; genis ovale esleniyor (kisaltma guveni 0.75)
- bias grain: kumasin 45 derece yonlendirilmesi kalibi degistirmez ama parcalarin grain acisini degistirir; graf-v1'de grain ekseni YOK
- peplum ucunun onde sivri, yanda yuksek profili: setHemProfile op'u tek oran aliyor, iki oranli (on/yan) profil karsiligi yok
