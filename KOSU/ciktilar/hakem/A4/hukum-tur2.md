# A4 hakem hukmu — TUR 2, 2026-09-09 (taze hakem; HEAD 474464b2, calisma agaci TEMIZ: `git status --short` 0 satir)

**HUKUM: BITTI** — gorsel esik tur 1'de gecmisti, tur 4 teslimi (a4-kontak-tur4.png) ayni cizim; tur 1'in buFazinKusuru=true olan 5 kusuru olculerek KAPANDI, kusur 4 ilanli devir (A6c). Kalip sayfasi artik kol takma centigi tasiyor, kol kapagi tek kubbe. Iki yeni kusur (7, 8) actim; ikisi de A5 oncesi tek satirlik is, "kalip ticari standartta" disari SOYLENMEDEN kapanmali.

**alirMiydim: ALIRDIM** — 3 teslimi (1, 4, 5) guncel binary ile yeniden urettim: graf/flat/kalip 9 dosyanin 9'u teslimle BAYT-AYNI (md5). Kapilar olceni olcuyor (halka_kesit ve panel-panel supresyon gercek mm), yalniz centik kapisi tautolojiye dustu (kusur 8).

## Tur 1 kusurlari, olcumle

| kusur | durum | kanit |
|---|---|---|
| 1 kol kapagi tepesi cukur | **KAPANDI** | kalip-36 (1) 4000 px kirpma: kapak tek kubbe, sivri cukur yok. grafop `shifted`: eksene komsu kontrol yalniz x'te kayar (yTerm dokunulmaz); grafdogrula `eksen_teget` 5/5: cap_front.from / cap_back.to 0.03-0.42 derece (tol 5, contract eksenTegetDeg, DOGRULANMADI etiketli). Tur 1 kapanis olcutum "aci farki < 5 derece" saglandi. SAYI NOTU: dikis cizgisi bezier `M 1472.79 62.59 C 1593.53 62.59 1663.03 36.76 1628.04 147.61` — 2. kontrol tepenin 25.8 mm ustunde; egrinin en yuksek noktasi eksende degil, eksenden 98 mm yanda, tepeden 2.61 mm yukarida (kesim cizgisinde 102 mm / 2.59 mm). Sig eyer; 311 mm kapakta gozle gorunmuyor, kapi teget olcuyor, tepe yerini olcmuyor. Kusur acmadim, not |
| 2 kol/oyuk centigi yok | **KAPANDI** | kalip-36.svg `data-tur="centik"` sayimi 5 teslimde ayni: cap_front 1, cap_back 2, armhole_front.1 1, armhole_back.1 2, side_front 1, side_back 2 (+ 1'de bel 2). Kaynak taban: graf_ir_check `oyuk.notchFractions = {0.25, 0.75}`; grafop centikleri dikisin kesrinden turetiyor (tum paneller). grafdogrula `centik kol_oyugu @0.25/@0.75` 5/5 0.00 mm. Eksik kalan: kapak TEPE centigi (kusur 7) |
| 3 teslim 5 arka yaka iki ucgen | **KAPANDI** | giris/5/flat.png arka: boyun_bandi_arka CB'de aynali tek V band (dis cizgi + ic kesikli), iki acik ucgen yok. Kok flatsvg: x=0'da duran her kenar (cut dahil) eksen sayilir (`e.kind != "dartLeg" && xSifir`). Cizici isini yapiyor; bandin V olmasi okumanin op'u (`dis` kenari omuzdan CB'ye nape..bustLine 0.55'e iner, reason: "CB'de 0.55 iner") — asagida "okuma" notu |
| 4 hedef sinira kirpili | **ACIK — ilanli devir (A6c)** | vision-kabul yeniden kostum: 4 sapma 0.229, 5 sapma 0.313, 1 0.060 (tur 1 ile ayni). Bu turda dokunulmadi, isci tablosu da "DEVIR" diyor. buFazinKusuru=false |
| 5 gogus halkasi 888.86 vs 900 | **KAPANDI** | grafdogrula `halka_kesit` 5/5: gogus 900.00 - (840 + 60) = 0.00; kalca 950.00 - (900 + 50) = 0.00, tol 2. Taban graf_ir_check: `vUnder = landmark.bustLine` (eskiden underarm). Kapi kesiti panel geometrisinden aliyor, ilani panel.ease'den — tautolojik degil: op kesiti degistirirse kirmizi olur |
| 6 commit'siz agac | **KAPANDI** | `git status --short` 0 satir; 0a54a062..HEAD 4 commit (tur1-4), son 474464b2 12:49. a4-kontak-tur3/tur4 png+svg izleniyor. Binary 12:42:41, en yeni .cpp grafop 12:42:36 — bayat degil; teslim dosyalari 12:42:42 (binary'den sonra) |
| (ek, isci) birlesik panelde bel | **OLCULDU** | giris/4-5 supresyon: "panel panel x2: on_govde kesit 184.23 - agiz 19.14, arka_govde 185.86 - 20.86" = 660.19 - 660 = EMILMEYEN 0.19 mm (isci: once -80). grafop cozPens: ic pens agzi acilinca bel hizasindaki yan tepe agiz kadar disari (`dxYan`) — kesit buyuyor, dogru yon |

Olcumler: vision-kabul KABUL kirmizi=0 (5/5 hedef motora) · flat_ayni_insan OK 5 (dBel/dOmuz/dAlt 0.0) · grafdogrula 5/5 KIRMIZI 0 · ctest graf_ir/graf_op/graf_dikilebilir/flat_ayni/bundle_fresh 5/5 · 0509-kapi --regresyon fark=0 (kosan 6, kosmadi 3) · vocab_reference_check **FAIL** bust 67->69 (+2), hip 90->91 (+1) — ilanli, tur 1'deki 70/93'ten azalmis · md5 flat 1=2 ayni (ilanli).

## Damla'nin olcutu, kalem kalem (tur 2)

| kalem | durum |
|---|---|
| gorsel: emsalin yaninda ayni turden fashion flat | GECTI (tur 1 ile ayni cizim; tur 4'te yalniz 5'in arka yakasi ve kol oyugu tabani degisti). Kaba kalanlar aynen: kalca kosesi keskin, etek ucu duz, 1/2 peplum ucurtma — okumanin op'lari (isci de "cizici degil" diyor), A3/A6 kovasi |
| kollar asagida, croquis ustunde | GECTI |
| emsalle mm farki | OLCULDU, devredilen: gogus yarim +33 (%19), bel yarim +13, omuz->gogus +28, omuz egimi +19. Tur 1'in "omuz ucu x +63 yaniltici" notu kapandi: tabloda artik "(13 cut-in, aski kenari!)" yaziyor |
| flat_ayni_insan 34 -> 0 | 0 (yapisal: beden yolu olculuyor, tur 1 notu duruyor) |
| kalip: etiket / grain / kat / kesim-dikis | GECTI (6/6 etiket, ok 6, ON FOLD, kesim duz + dikis kesikli, pens agzi kesimde koprulu) |
| kalip: centik | **GECTI, eksikle** — yan 1/2, oyuk-kapak on 1 / arka 2 var; kapak tepe centigi yok (kusur 7) |

## Yeni kusurlar

7. **Kol kapagi tepe centigi yok.** Ticari set-in kol kalibinda kapak 3 centik tasir: on 1, arka 2, TEPE 1 (omuz dikisine oturur). Bizde on/arka var, tepe yok: kalip-36 kol parcasinda cap_front 1 + cap_back 2, eksende (x=1472.79) centik 0; bedende omuz dikisi ucuna karsilik centik 0. Kolu takan kisi tepeyi omuza nereden hizalayacagini kaliptan okuyamaz. Kapanis: kol_oyugu dikisinde 0.5 kesri (ya da omuz dikisi ucu) her iki tarafta 1 centik; `grep -c 'data-edge="cap_' kalip-36.svg` 3 -> 4. buFazinKusuru=true, satisEngeli=false (tek satir taban).
8. **`centik` kapisi tautoloji oldu.** grafop artik HER panelde centigi dikisin `notchFractions` kesrinden yeniden turetiyor (`kayan` = tum paneller); grafdogrula centigi cozulmus graf (gCoz) uzerinde olcuyor. Iki taraf ayni kesirden ayri ayri yerlestirilince "iki tarafta en kotu sapma" tanim geregi 0.00: kapi panel verisinden kirmizi OLAMAZ. Isci bunu adiyla yazdi ve graf_dikilebilir'in negatif testini "0.6 -> kirmizi" yerine "0.6 -> cozumde 0.5" olarak yeniden yazdi — esik gevsetmesi DEGIL, ilanli; ama grafdogrula'daki `centik` hukmu artik bir olcum degil, turetmenin kendini dogrulamasi (flat_ayni_insan ile ayni durum). Kapanis: kapi gercek bir seyi olcsun — (a) notchFractions tasiyan her dikisin iki tarafinda da kalipta centik CIZILDI mi (kalipsvg katman 4 sayimi), ya da (b) hukum "bilgi" olarak isaretlenip kirmizi olma iddiasi kaldirilsin. buFazinKusuru=true, satisEngeli=false.

## Reward hacking

- graf_dikilebilir_check.cpp: 1 negatif test yeniden yazildi (yukarida, kusur 8). Silinen kural 0; centik hukmu sayisi 2 -> 4, tolerans sayisi 4 -> 5 (eksenTegetDeg eklendi). Yeni esik `eksenTegetDeg 5` DOGRULANMADI etiketli. **Esik gevsetmesi yok; bir kapi tautolojiye dustu (ilanli).**
- grafdogrula.cpp: halka_kesit ve eksen_teget EKLENDI, supresyon panel-panel'e genisledi (OLCULEMEDI erken cikisi daraldi = sikilasma). Esik degisikligi 0.
- 0509-kapi.sh H9/H10: flat_ayni_insan "A4'te kapandi" state'te (tur 1 notu duruyor).
- Alan disi dosya: 0a54a062..HEAD 111 dosya; engine/src, engine/tests, contract, KOSU/ciktilar, wasm vendor. Silinen 0. **Yok.**
- Bayat build: KAPALI (yeniden uretim 9/9 bayt-ayni).

## Okuma notu (A4 kusuru DEGIL, A3/A6 kovasi — Damla disari soylemeden bilsin)

Mary Quant fotograflarini actim (4 on, 5 arka): elbise YUVARLAK yakali, genis yatik beyaz yaka (sailor), onde dugme patı, belde kemer, bel altinda kapakli iki cep, kisa kol. Bizim 4/flat: derin V yaka bandi, kemer yok, cepler var; 5/flat arka: derin V band. Okuma yakayi "V'ye inen yatik parca" diye op'lamis (reason satirinda kendi yaziyor). Cizici op'u dogru ciziyor; giysi fotografa benzemiyor. Ayrica 4/flat'te sol pens cizgisi (x=185) yama cebin (x 130-190) icinden geciyor — yama pens ustune ciziliyor, kucuk.

Olcemediklerim: 0509-kapi.sh tam kosu (yalniz --regresyon); regresyondaki K2-prenses-roba "flatSVG firlatti" kaydi "beklenen: A2/A4'te kalkacak" diyor, A4'te kalkmadi (eski web cizicisi, grafciz degil — kapiya fark=0 yaziliyor); isci HUKUM.md yalniz tur1->tur4 tablosu okundu.

## Gordugum resimler

a4-kontak-tur4.png: tur 3 ile ayni bes satir; 5'in arka yakasi artik V band (iki ucgen degil), kol oyugu tabani gogus hattinda. giris/5/flat.png: on yuvarlak yaka + kisa kol + balik pensi tek cizgi; arka V band CB'de aynali. giris/4/flat.png: on V band + CF cizgisi + iki yama cep + pens; arka duz. giris-foto-5.png: baslik artik "A4 — bes fotograftan kalip ve flat" (tur 1'deki A3 basligi kapandi). kalip-36 (1) 4000 px kol parcasi: kubbe kapak, sol ust 2 / sag ust 1 centik, dikey grain oku, dikdortgen kol tupu (alt kenar 311 mm = kapak tabani, daralma yok), ON UST KAT sagda. Emsal 07: uzun/kisa kollu, buzgulu omuz, V yaka — kollarimiz ayni turden asagi sarkiyor, omuz buzgusu yok (okumada yok). Fotograflar: yukarida.

Sure: 35 dk.
