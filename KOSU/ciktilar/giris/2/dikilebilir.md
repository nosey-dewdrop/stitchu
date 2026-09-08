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
| panel `peplum_on` | GORULDU — Bel hattinda ayri kat, onde sivri uc. | 0.9 |
| panel `on_etek` | GORULDU — Peplumun altindan cikan bagimsiz chevron ekseni. | 0.9 |
| panel `arka_etek` | gorulmedi (tabandan) — Gorulmedi. | 0.15 |
| panel `kol` | GORULDU — Omuz basinda buzgu kivrimlari; dirsek ustu duz agiz. | 0.95 |
| kenar `on_beden/neck_front` | landmark.neckFront..landmark.bustLine oraninda **0.33**, kavisli-ic | 0.8 |
| kenar `on_etek/hem` | landmark.waist..landmark.ankle oraninda **0.6**, duz | 0.75 |
| kenar `kol/hem` | landmark.shoulderTip..landmark.wrist oraninda **0.47**, duz | 0.85 |
| kenar `kol/cap` | landmark.shoulderTip..landmark.bustLine oraninda **0**, kavisli-dis, buzgu [1.15,1.35] | 0.8 |
| kenar `peplum_on/hem` | landmark.waist..landmark.hip oraninda **0.62**, kirik | 0.85 |
| dikis `bel_dikisi` | on_beden/waist_front ↔ peplum_on/waist, oran [1,1] | 0.9 |
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

## Motora ne gecti?

Okuma dili (fotograf) ile motorun op sozlugu ayni sey degil. Ceviri ve **cevrilemeyenler**:

| okuma op'u | motor op'u | not |
|---|---|---|
| — | `extendTo` | {"panel":"on_etek","edge":"hem_front","yLandmark":"landmark.knee","yOffsetMM":0} |
| — | `extendTo` | {"panel":"kol","edge":"hem","yLandmark":"landmark.elbow","yOffsetMM":0} |
| — | `gather` | {"panel":"kol","edge":"cap_back","ratio":1.25} |
| `setNeckline` | **YOK** | motorun op sozlugunde karsiligi yok (contract/graf-v1.json oplar) — dogduran okuma: kenar on_beden/neck_front |
| `addPanel` | **YOK** | motorun op sozlugunde karsiligi yok (contract/graf-v1.json oplar) — dogduran okuma: panel peplum_on + 'peplum' kisaltmasi |
| `addClosure` | **YOK** | dikis yok: on_orta (taban grafta on orta dikis bulunmuyor) — dogduran okuma: kapanma okumasi |

**Cozucu hedefi** (grafa YAZILMAZ, contract yasa 3): 1 adet.
- girth.waist / girth.bust = 0.5063 (kaynak: siluet-orani bel/enGenis)

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

**grafdogrula (gercek36):** KOSTU — kirmizi hukum: **0**

## Okunamayanlar (sessiz default YOK)

- arka yuzun her ayrintisi
- prenses mi pens mi
- etek panel sayisi
- arka kapanma

## Olculmedi

- poz landmark (kaynak a): MediaPipe kurulmadi; oranlar landmark'a gore CIKARIM
- arka yuz: hicbir fotografta yok

## Motorun op sozlugunde KARSILIGI OLMAYANLAR

- sweetheart yaka enum'da yok
- bias grain ekseni graf-v1'de yok
- peplumun on/yan iki oranli hem profili
