# Bugra kor kontrolu — motor EU38 vs satin alinmis Locket Top beden 38

> KOR KONTROL. Hicbir sayi "Bugra'ya benzesin" diye motora geri yazilmadi. Fark
> uc kovaya ayrildi (STIL / MOTOR EKSIGI / HATA); sadece HATA kovasi, KENDI kok
> sebebinden kapatildi. Uretici: `node engine/tools/bugra-blind-compare.mjs`
> (ctest disi, kapi degil).

## Kurulum
- Kor spec (Bugra'nin urun TARIFINDEN, mm'lerinden degil): `{"garment":"top","shaping":"dart","fabric":"woven","neckline":"crew","collarType":"peterPan","sleeveStyle":"straight","sleeveCap":"puffed","sleeveLength":"short","buttonRow":"functional","placketStyle":"standard","frontPlacket":true,"topLength":"hip"}`
- Motor govdesi: contract euSizeChart EU38 = bust 88 / waist 70 / hip 94 cm.
- Bugra 38 kendi cizelgesi = 92 / 72 / 98 cm. **Iki "38" ayni govde degil** (bust orani 0.957).
- Kesim cizgisi iki tarafta da dikis payi DAHIL: motor 15mm, Bugra 10mm (+30mm etek).
- Hizalama bbox-min kosesi, dondurmesiz, olceklemesiz; ornekleme 2mm.
- ONCE sutunu: git 17d45361 icindeki web/vendor/stitchu-engine.js

## A) Panel dis cevresi — Chamfer (mm)

| motor ~ Bugra | motor bbox | Bugra bbox | mean SIMDI | p95 | max | mean ONCE | delta |
|---|---|---|---|---|---|---|---|
| Top Front ~ Front Body | 293×660 | 301×511 | 37.4 | 142.1 | 149.6 | 37.0 | +0.4 |
| Top Back ~ Back Body | 275×618 | 213×452 | 47.9 | 165.8 | 169.5 | 47.7 | +0.1 |
| Puff Sleeve ~ Lower Sleeve | 473×270 | 346×170 | 60.4 | 135.9 | 154.0 | 89.9 | -29.6 |
| Peter Pan Collar (bebe yaka) ~ Collar | 298×110 | 182×165 | 39.0 | 99.9 | 120.6 | 39.0 | +0.0 |

Parca sayisi: **motor 6** vs **Bugra 7**.

Cevre (kesim cizgisi, mm):
- Top Front: motor 1754 vs Bugra 1686 (fark 68, 4%) — motor dikis cizgisi 1630
- Top Back: motor 1669 vs Bugra 1275 (fark 394, 31%) — motor dikis cizgisi 1550
- Puff Sleeve: motor 1177 vs Bugra 873 (fark 304, 35%) — motor dikis cizgisi 1067
- Peter Pan Collar (bebe yaka): motor 692 vs Bugra 568 (fark 125, 22%) — motor dikis cizgisi 562

## B) Landmark-landmark (dikis cizgisi, mm)

Motor tarafi kendi `edgeRoles` beyanindan (oyuk capa, komsular ondan turetilir),
Bugra tarafi `patterns_real/geometry/seamgraph.json` adli kenarlarindan. Sabit
komut indeksi / sabit landmark listesi YOK.

| kenar | motor | Bugra | fark | motor yay/kiris | Bugra yay/kiris | not |
|---|---|---|---|---|---|---|
| yaka-on | 101.7 | 213.1 | -111.4 | - | - |  |
| omuz-on | 122.5 | 44.8 | +77.7 | - | - |  |
| OYUK-on | 222.7 | 211.4 | +11.2 | 1.123 | 1.229 | (y/k KESIM cizgisinde) |
| yan-dikis-on | 344.3 | 201.7 | +142.6 | - | - | (Bugra: alt+ust, arada pens agzi) |
| etek-on | 270.1 | 243.1 | +27 | - | - |  |
| on-orta CF | 550.5 | 401.5 | +149 | - | - |  |
| yaka-arka | 73.6 | 123.8 | -50.2 | - | - |  |
| omuz-arka | 122.5 | 48.1 | +74.4 | - | - |  |
| OYUK-arka | 200.2 | 220 | -19.9 | 1.072 | 1.175 |  |
| yan-dikis-arka | 344.8 | 227.4 | +117.4 | - | - |  |
| etek-arka | 244.7 | 176.6 | +68.1 | - | - |  |
| arka-orta CB | 564 | 393.6 | +170.4 | - | - |  |
| OYUK toplam (on+arka) | 422.9 | 431.5 | -8.6 | - | - |  |
| OYUK on-arka (isaret) | 22.5 | -11 | +33.5 | - | - | (yasa: on <= arka — knowledge/drafting-math-eu38.md, Bugra 8/8 beden) |
| KAPAK (oyuga giden) | 545.5 | 425.8 | +119.7 | 1.238 | 1.307 |  |
| kol kirisi (bicep) | 440.8 | 345.5 | +95.3 | - | - | (Bugra kesim kirisi) |
| kapak yuksekligi | 149.9 | 129.8 | +20.1 | - | - | (Bugra sagitta, T14) |
| kol alt kenari | 260.7 | 326.3 | -65.6 | - | - |  |
| kol koltukalti | 130.5 | 21.5 | +109 | - | - |  |
| kapak/oyuk fazlasi % | 29 | -1.3 | +30.3 | - | - | (motor TEK parcada buzgu | Bugra Lower ~0, buzgu AYRI Upper katmanda %29-35) |
| yaka boyun kenari | 175.3 | 168.3 | +7 | - | - | (Bugra: centikli kenar = boyun) |
| yaka dis kenari | 266.9 | 231.2 | +35.7 | - | - |  |
| yaka dis/boyun orani | - | - | - | 1.523 | 1.517 |  |


## B2) Scye karni vs motorun KENDI yayinlanmis genislik cizgisi (Aldrich p.11)

Bu satirlar Bugra'yla degil, motorun KENDI yasasiyla kiyaslar (bodice.hpp:
`scyeChestWidthHalf* / scyeBackWidthHalf*`). "Karin" = cizilen oyuk kubiginin
en kucuk x'i — kontrol noktasi degil, EGRININ kendisi.

| yari | yayin cizgisi | omuz ucu | karin ONCE (acik) | karin SIMDI (acik) |
|---|---|---|---|---|
| on | 162.00 | 173.08 | 173.08 (11.08) | 162.00 (-0.00) |
| arka | 172.00 | 181.05 | 181.05 (9.05) | 172.00 (-0.00) |

## C) Farkin sinifi

### [STIL] beden cizelgesi
- olcum: motor EU38 bust 88.0 vs Bugra 38 bust 92 cm (oran 0.957) — her yarim panelde ~%4.3 beklenen genislik farki
- kok sebep: iki yayin iki ayri cizelgesi; motor KENDI yayimli cizelgesini cizer
- durum: **DUZELTILMEZ**

### [STIL] giysi boyu
- olcum: on-orta CF motor 550.5 vs Bugra 401.5 mm
- kok sebep: motorun topLength sinifi 'hip'; Bugra'nin ustu belin hemen altinda bitiyor — ayni giysi degil
- durum: **DUZELTILMEZ**

### [STIL] buyume-yakali on vs ayri facing
- olcum: Bugra on 301 / arka 213 mm (+88); motor on 293 / arka 275 (+18) + 2 ayri facing parcasi
- kok sebep: ayni islev iki topolojiyle cozulmus; ikisi de dikilebilir
- durum: **DUZELTILMEZ**

### [STIL] kol topolojisi (buzgunun yeri)
- olcum: motor TEK parca, kapak fazlasi %29 | Bugra Lower ~%-1.3 + AYRI Upper katman %29-35
- kok sebep: buzgu orani AYNI BANDDA, farkli parcaya konmus
- durum: **kok = asagidaki MOTOR EKSIGI**

### [MOTOR EKSIGI] tuketici sozlugunden erisilebilen GENEL iki-katman buzgu operatoru
- olcum: Bugra Upper Sleeve 505x207 mm; bu kor kiyasta motorda karsiligi 0 parca
- kok sebep: IKI KATMANI DOGURAN EKSEN VAR VE CALISIYOR: locketTop='bugra'. Bu kor spec onu BILEREK set etmiyor (kor kiyasin Bugra'nin ezberlenmis degerlerini secmesini engellemek icin, bkz. KOR_SPEC). Yani parca yok cunku SORULMADI — motor cizemedigi icin degil. Bagimsiz tanik AYNI AGACTA: engine/tests/buzgu_katman_check.mjs (e) "iki katman cizildi: Upper 444.1 mm > Lower 329.2 mm (buzgu payi x1.349)". Gercek acik cok daha DAR: sleeveCap {plain,gathered,puffed,cap} tek parcayi sekillendirir, yani tuketici sozlugunden (sleeveCap) erisilen GENEL bir iki-katman operatoru yok; ikinci katman bugun yalniz locketTop adli YAPI-OZGU eksenden dogar.
- durum: **ACIK (dar hali) — "motor iki katmanli pufu CIZEMIYOR" cumlesi GERI CEKILDI, olcumle curudu**

### [MOTOR EKSIGI] yaka KAVISI (dis/boyun orani TUTUYOR, kavis tutmuyor)
- olcum: dis/boyun orani motor 1.523 vs Bugra 1.517 (%0.4 fark — AYNI AILE). Ayrilan sey KAVIS: bbox en/boy motor 2.70 vs Bugra 1.11; motor yakasi yayvan bir bant, Bugra'ninki neredeyse ceyrek halka
- kok sebep: yaka konturu boyun kenarinin OFSETI olarak cizilir; "yatma yarikapi" (bir peterPan'in ne kadar kivrilacagi) icin eksen yok — collarType kategorik
- durum: **ACIK**

### [MOTOR EKSIGI] mm-hedefli ust boyu
- olcum: topLength {cropped, hip, tunic} = 3 sinif; skirtLengthMM var, topLengthMM yok
- kok sebep: boy ekseni nicel degil
- durum: **ACIK**

### [KAPANDI] set-in scye karni motorun KENDI yayinlanmis genislik cizgisine ULASMIYORDU
- olcum: on: yayin cizgisi 162.00 | omuz ucu 173.08 | cizilen karin 162.00 -> ACIK -0.00 mm (ONCE 11.08). arka: yayin 172.00 | omuz ucu 181.05 | karin 172.00 -> ACIK -0.00 mm (ONCE 9.05). yay/kiris on 1.123 (ONCE 1.066) arka 1.072 (ONCE 1.033); olculen Bugra tanigi 1.229 / 1.175
- kok sebep: cp1.x omuz ucunun DISINDA (+0.06*dx) idi -> x'(0) > 0, egri uctan DISARI ayriliyordu ve solveHollow'un useWidthLine dali ULASILAMAZ bir hedefi kovalayip tavana oturuyordu. Yer: engine/src/bodice.cpp armholeCurveFor `setIn` dali. Duzeltme TEK SATIR, YENI SABIT YOK: cizgi kullanilabilirken cp1.x = innerLimit.
- durum: **KAPANDI 2026-09-03 (hakem K1). Oyuk toplami 404.3 -> 422.9 mm, K1 bandi (400-440) ICINDE. Golden pin DECLARED RE-PIN ile tasindi (engine/GOLDEN-PIN.md 2026-09-03, 5432 satir yerinde degisti). Kapilar: engine_check 70200 PASS, garment_armhole_check / sleeve_check / locket_check / buzgu_katman_check / sewability_check / cuttable_output_check / notch_alignment_check hepsi YESIL.**

### [KAPANDI] arka scye karnini scyeMaxInset kelepceliyordu (ON yaka genisligiyle olculdugu icin)
- olcum: arka omuz ucu 181.05, yayin cizgisi 172.00 -> gereken icerlek 9.05mm; ulasilan karin 172.00 (ACIK -0.00mm). ONCE: yalniz 1.08mm icerlege izin veriliyordu, acik 7.97mm kaliyordu.
- kok sebep: bodice.cpp naturalTipXForScye "dogal blok omuz ucu"nu ON yaka genisligi carpaniyla (frontNeckWidthFactor 0.17) hesaplayip AYNI degeri arkaya da uyguluyordu; arka yaka daha genis (0.197) oldugu icin gercek arka omuz ucu o referansin disinda kaliyor ve tavan gercekte olmayan bir kelepce vuruyordu
- durum: **KAPANDI 2026-09-03 (hakem K4). Capa yariya gore ayri hesaplaniyor (naturalTipXFront / naturalTipXBack), yeni sabit YOK.**

### [KAPANDI] centikler DIKIS cizgisine basiliyordu, kesim cizgisine degil
- olcum: sewability_check ratchet: notch_off_boundary 211 -> 0, mark_far_from_edge 342 -> 0 (mark_over_seam_allowance 32, degismedi). Iki tavan da bu commit'te 0'a INDIRILDI (yukseltilmedi).
- kok sebep: annotateTechnical draft() icinde kesim cizgilerinden ONCE kosuyordu, yani kendi referans cizgisini goremiyordu; ustelik capayi konturun degil BOUNDING BOX'in max-x'ine koyuyordu (egri yan dikiste konturun uzerinde bile olmayan bir nokta). Uc duzeltme: (1) gecis kesim cizgilerinden SONRA kosuyor, (2) capa yan dikis YURUYUSUNUN uzerinde, (3) fermuar disi tikleri kesim kenarindan basliyor. Ayrica denge centigi artik iki yarida EsIT mm'de (commonSideSeamMM), esit KESIRDE degil.
- durum: **KAPANDI 2026-09-03 (hakem K3). Iki kapi SIKILASTI: cuttable_output_check kesir kiyasini birakip dikisi YURUYOR (0.1mm), notch_alignment_check bbox max-x yerine konturun ustunde 0.5mm ve mm-esitligi olcuyor.**

### [KAPANDI] FLAT DUGMEYI HIC CIZMIYORDU (sayfa "dugmeli" derken giysi dugmesiz)
- olcum: KOSU/ciktilar/bugra-spec-giysi.svg: ONCE 0 dugme; SIMDI 7 dugme (data-rol="dugme", r=9.00mm). Kalip tarafinda dugmeler ZATEN vardi (Top Front markings 110 komut).
- kok sebep: IKI KOPUKLUK, ikisi de AD ESLESMESI: (1) web/lib/flat-from-pattern.js dugme katmanini HIC OKUMUYORDU — flat kalibin izdusumu olmasina ragmen markings icindeki daireler izdusume girmiyordu; (2) engine/src/buttonrow.cpp frontCenter() uc yazim biliyordu ("Bodice/Top Front..."), Bugra Locket hatti on paneli "Front Body" diye adlandirdigi icin buttonRow=functional olan bir Locket sessizce dugmesiz ciziliyordu. Motorun dugmeyi CIZEMEDIGI iddiasi YANLISTI: buttonrow.cpp buttonCircle dort kubik ceyrek yayla ciziyor ve calisiyor.
- durum: **KAPANDI 2026-09-03 (hakem K7). Flat dugme sayisini, yaricapini ve derinlik oranini KALIPTAN okur; uydurulmus sayi yok.**

### [HATA] on oyuk arka oyuktan UZUN (isaret ihlali)
- olcum: motor on-arka = 22.5 mm (yasa: <= 0). Bugra kesim cizgisinde -11 mm, 8/8 bedende negatif
- kok sebep: motorun koltukalti seviyesinde ON ceyregi ARKA ceyregden genis (on 244.2 / arka 224.8 mm); Aldrich p.11 genislik cizgileri TERSINI yayinliyor (sirt 34.4 > on 32.4 cm)
- durum: **ACIK — hakem K5: SIMDI DOKUNMA, kendi fazini hak ediyor (butun bloklari oynatir, 8 bedende once/sonra ister). EXIT KODU: bu tek kalem bir REGRESYON CIZGISI tasiyor (asagi bak) — kirmizi ADIYLA duruyor ama kapiyi tek basina dusurmuyor, cunku kapanmasi bir OLCUM degil bir KARAR. Emsal: engine/tests/v5-ratchet-baseline.json V5-G uzlasmasi. DIKKAT — BU FAZ ONU KOTULESTIRDI: 18.4 -> 22.5 mm. Sebep K1/K4: on oyuk yayinlanmis on genislik cizgisine (162.0) oturunca arkadan (172.0) daha COK uzadi. Iki duzeltme de motorun KENDI yayinina karsi dogru; kotulesen sey, zaten ACIK olan on/arka bust bolusumu. Cizgi bugunku olculen degere BILEREK ve ADIYLA tasindi — sessiz degil.**

### [MOTOR EKSIGI] fitted top BELDE DARALMIYOR (yan dikis koltukaltindan etege surekli genisliyor)
- olcum: sevk edilen cizimde (KOSU/ciktilar/bugra-spec-giysi.png, FRONT ve BACK figurleri) shaping=dart oldugu halde yan dikis monoton; bel daralmasi GOZLE 0. Kalipta bust pensi VAR, yan dikiste bel girintisi YOK.
- kok sebep: shaping ekseni PENS uretir, yan dikis EGRISI uretmez; "fitted" bir ust bel hattinda yan dikisten de alir. Motorda yan dikisi belde iceri alan bir eksen yok.
- durum: **ACIK — bu fazda ADIYLA acildi, kapatilmadi (hakem raporunda C bolumunun hicbir kovasinda gecmiyordu)**

## Motorun cizemedigi Bugra yapilari (adiyla; sessiz atlama yok)
- PUF UST KATMANI (Bugra Upper Sleeve): T14 olcumune gore Bugra kolu "yatay bolunmus" DEGIL — Lower Sleeve gercek set-in kol, Upper Sleeve onun ustune dikilen %29-35 buzgulu AYRI DIS KATMAN. Motorun sozlugunde ikinci katman doguran operator yok (sleeveCap {plain, gathered, puffed, cap} TEK parcayi sekillendirir). Motor puf ust katmanini CIZEMIYOR — adiyla kayit.
- BUYUME-YAKALI ON (grown-on / cut-on facing): Bugra on govdesi CF hattinda kendi uzerine katlanan bir temizleme payi tasiyor. Motor bunu AYRI parca (Front/Back Neck Facing) ile cozuyor; "on parcaya buyume-yaka payi ekle" ekseni yok.
- ayri yaka astari PARCASI (Collar Lining + tela): motor yakayi "cut 2 + interfacing" TALIMATIYLA verir, ayri astar parcasi cizen eksen yok.
- Motor karsiligi olmayan Bugra halkalari (beden 38): Upper Sleeve 505×207 · EXTRA-TL (not in defter) 175×265 · Collar Lining 140×158.
- Motor fazlasi: Front/Back Neck Facing — Bugra facing kullanmiyor. Yapisal fark, hata degil.

## Urun
- Bindirme levhasi: `KOSU/ciktilar/bugra-bindirme.svg` + `.png` — her parca IKI kez
  (ONCE gri = git 17d45361, SIMDI siyah), ayni kirmizi Bugra konturuna karsi, mm 1:1.
