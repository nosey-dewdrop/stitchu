# A4 hakem hukmu — TUR 1, 2026-09-09 (taze hakem; HEAD e5b92f2d + izlenmeyen calisma agaci, kilit acik)

**HUKUM: BITMEDI** — gorsel esik GECTI (flat artik emsalin yaninda ayni turden, kaba bir fashion flat gibi okunuyor; kalip dokumu degil), sayilar ve kalip sayfasi kismen: kalip "ticari standart" kalemi kolda dusuyor (kol kapagi tepesi cukur, kol/kol oyugu centigi 0), 5. teslimin arka yakasi yanlis cizim, olcum hedefi bes fotografta hala sinira kirpili. Calisma agaci commit'siz (47 dosya M, tur3 kontak izlenmiyor).

**alirMiydim: ALIRDIM** — flatsvg (gorunum = kat ekseni, kol koltukaltindan sarkar, cizgi hiyerarsisi dikis partnerinden) ve olcen pens cozucusu (on/arka ayri, etek kalca-bel, emilmeyen kapisi) A5 kosucusunun ustune kurulacagi zemin. Sart: asagidaki 1-3 kapanmadan "kalip ticari standartta" disari SOYLENMEZ.

## Damla'nin olcutu, kalem kalem

| kalem | durum | kanit |
|---|---|---|
| gorsel: emsalin yaninda ayni turden fashion flat | **GECTI (kaba)** | a4-kontak-tur3.png 5 satir: giysi silueti var, kollar koltukaltindan asagi sarkiyor (A3'teki 45° V yok), on/arka CF/CB'de aynali, kalin siluet 3.659 / ince ic dikis 1.829 / kesikli hem (flat.svg stroke-width sayimi). Kalip parcasi dokumu DEGIL. Kaba: kalca kosesi keskin (bel->kalca duz capraz, sonra dusey), etek ucu duz cizgi, yan dikis kirik — emsal 13/07 yumusak kavisli |
| kollar asagida, croquis ustunde | GECTI | kol tupu koltukaltindan kol ekseni boyunca; genislik panel/pi (flatsvg KURAL 2, 07'de olculmus 0.49 x gogus yarimi) |
| emsalle ayni olcekte mm farki | OLCULDU, devredilen | kontak tablosu (0.944 mm/px, bel hizali): gogus yarim croquis 210 vs emsal 177 (+33, %19); bel yarim 171 vs 158 (+13, %8); omuz->gogus y 255 vs 227 (+28); omuz egimi 49 vs 30. Karar ajani "A4'te degistirme" dedi — kabul. NOT: "omuz ucu x 184 vs 121 (+63)" satiri YANILTICI: emsal 13 kolsuz, cut-in omuz; 121 askinin kenari, bedenin omuz ucu degil. Tablo bunu soylemiyor |
| flat_ayni_insan_check 34 -> 0 | 0, **YAPISAL** | OK 5 flat; ama olcum data-rol="siluet" gorunmez yoldan: Body landmark'larindan cizilen yol, bes SVG'de ayni Body -> ayni sayi kacinilmaz (flatsvg KURAL 4 bunu ADIYLA ilan ediyor: "giysi degil BEDEN olculur"). Kapi giysi cizimine bakmiyor; ayni Body verildigi surece kirmizi olamaz. Ilanli oldugu icin kusur acmadim, ama "34 -> 0" bir cizim basarisi degil, olcum tanimi degisikligi. Ayrica bulgular satiri bayat: "203 mm SABIT, flat-from-pattern.js MANKEN_KALCA_DERINLIK_MM" — 203 artik croquis36 hip.y - waist.y (593-390), o dosyadan degil |
| kalip: parca etiketi | GECTI | 6 parca: AD BUYUK HARF, CUT 2X MIRRORED / CUT 1X ON FOLD, EU 36, Seam Allowance 1 cm - 3/8 in, For Hem 3 cm - 1 1/8 in, #n / 6 (kalip-36.svg text sayimi 6/6) |
| kalip: grain | GECTI | 6 parcada ok (katman 7) |
| kalip: kat | GECTI | on_ust_kat "ON FOLD" yazisi + kat cizgisi; CF dikisli on beden dogru olarak CUT 2X (on_orta dugme dikisi) |
| kalip: kesim/dikis cizgisi | GECTI | kesim duz, dikis 4.233 kesikli; dis pens kesimde koprulu (X kesisme yok — A3'teki kusur kapandi, 4000 px kirpmada dogrulandi) |
| kalip: centik | **DUSTU** | katman 4 = 5 centik: on/arka beden yan dikis 0.5 + bel 0.47, on/arka etek bel 0.82. KOL kapagi 0, KOL OYUGU 0 — kol takma centigi olmayan kalip ticari standartta degil |

Olcumler: vision-kabul KABUL kirmizi=0 (5/5 hedef motora, sapma 0.229-0.352 kabul satirinda; teslim 1 dikilebilir.md'de 0.060) · flat_ayni_insan OK 5 · grafdogrula 5/5 0 kirmizi · md5 flat 4/5 (1=2 ayni govde, ilanli) · vocab_reference_check **FAIL** bust 67->70, hip 90->93 (+3/+3; ilanli, calisma agacindaki landmarkOfRing degisikligi henuz kapatmamis — su an olctum, hala FAIL).
Bayat build: KAPALI — binary 12:19:37, teslim svg 12:17:26 (once) ama grafuygula/grafciz'i guncel binary ile yeniden kostum: graf 0988921c, flat aec6bebc, kalip fe289e7c — ucu de teslimle BAYT-AYNI.

## Kusurlar

1. **Kol kapagi tepesi CUKUR (kalip-36, 6 parcanin 5'i).** cap_front ve cap_back ayri ayri disbukey, omuz noktasinda asagi dogru sivri bir cukurla birlesiyor (kesim ve dikis cizgisinde ikisinde de; kalip1-big.png 2400-3300 px kirpmasi). Gercek kol kapagi omuzda tek tepe yapar. fitLength ratio 1.25 iki kenari ayri ayri sisiriyor, birlesme noktasinda C1 yok. Ticari kalip bu haliyle satilmaz. Kapanis: kapak iki kenarinin omuz noktasinda teget surekliligi (aci farki < 5°) grafdogrula'da olculur; kalip-36.png'de tek tepe. buFazinKusuru=true.
2. **Kol/kol oyugu centigi yok.** graf.json'da notches: on_beden waist_front.2/side_front, arka_beden waist_back.2/side_back, on_etek/arka_etek waist.1 — kol ve armhole kenarlarinda 0. Kolun one/arkaya hangi yonde takilacagi kalipta okunmuyor. Kapanis: `grep -c notches` kol cap_front/cap_back ve armhole_front/back >= 1, on 1 / arka 2 cizgi kurali (kalipsvg katman 4). buFazinKusuru=true.
3. **Teslim 5 arka yaka iki acik ucgen.** giris/5/flat.png arka gorunum: boyun_bandi_arka paneli CB'nin iki yaninda asagi acilan iki V ucgen olarak ciziliyor (ense -> omuz), bir yaka bandi degil, iki kesik gibi. Damla'nin gorecegi cizim yanlis. Kok: addPanel boyun_bandi_arka kenarlari (ic: nape->neckBase) ya da flatsvg'nin eksensiz paneli gorunumde konumlamasi — hangisi oldugunu OLCEMEDIM (op'u yeniden kosmadim). Kapanis: 5/flat.png arka yakada band, ucgen yok; ayni panel ontaki (3/flat keyhole bandi dogru duruyor) gibi cizilir. buFazinKusuru=true.
4. **Olcum hedefi bes fotografta hala sinira kirpili.** Siluet birimi genislige cevrildi (A3 devir kapandi: "payda = cizilen en genis yarim kesit x 4, genislik birimi") ama sonuc ayni: 1'de gereken bolluk -71.7 mm -> 0 (sapma 0.060), 3/4/5'te giysi orani 0.6947 sapma 0.23-0.31. A3 tur2'nin kapanis olcutu "en az bir fotografta kirpilmamis hedef (sapma < 0.05)" saglanmadi (en iyi 0.060). Olcumun kaliba ayirt edici etkisi hala sifir; "fotograftan olcu" disari soylenmez. Kapanis A4 ya da A6c (okuma kalibrasyonu): sapma < 0.05 en az 1 fotoda. buFazinKusuru=false (devir), ama tur2'de yeniden olculur.
5. **Gogus halkasi giysi bolluğunu kaybediyor, kapi yok.** Yatay kesit (yeni, dogru) gogus_halka 444.43 x2 = 888.86 mm; grafin ilani beden 840 + bolluk 60 = 900 -> 11.14 mm eksik (yan dikis koltukaltindan bele DUZ cizgi, bustLine kesiti koltukaltinin altinda kaliyor). Kalca 950/950 tam. halka_kapanma yalniz kavsak boslugunu olcuyor, kesit toplamini beden+bollukla kimse karsilastirmiyor. Bel icin bu karsilastirma var (supresyon kapisi), gogus/kalca icin yok. Kapanis: |kesit x2 - (beden + bolluk)| <= dikisUzunlukMM her landmark'li halkada. buFazinKusuru=true (yatay kesit bu turda kondu, kapisi eksik kondu).
6. **Commit'siz calisma agaci.** `git status`: 47 dosya M (giris/1-5 kalip-36.svg/png + dikilebilir.md, tamlik/* flat'ler, engine/src 5 dosya, contract, wasm), a4-kontak-tur3.png/svg izlenmiyor. Teslim = calisma agaci; HEAD'de duran kalip-36 baska. Kilit acik ilanli, ama hukum verdigim dosyalar commit'te degil. Kapanis: tek commit + kontak-tur3 eklenir.

## Devredilen motor kalemleri (A3 -> A4) — olculdu

| kalem | durum |
|---|---|
| supresyon kapisi tautolojik | KAPANDI — artik EMILMEYEN olculuyor (dikilen bel 660 - hedef 660 = 0.00, tol 2). Tautolojik degil: ayni kapi dis pensin eski kurulusunda 80 mm yakalamis (grafop.cpp yorumu, olculmus) |
| kPensPayi contract'a | KAPANDI — cozucu.pens.pensPayi 0.3333 "Aldrich, DOGRULANMADI" etiketli; grafop sctx.pensPayi okuyor, sabit yok |
| on/arka pens agzi farkli | KAPANDI — 19.14 / 20.86 (beden), 13.70 / 34.63 (etek); arkaPay'dan |
| etek pensi kalca supresyonu | KAPANDI — panelUstHalka bele en yakin landmark'li halkayi seciyor (calisma agacinda 'hip' literal'i kaldirildi) |
| gogus/kalca halkasi yatay kesit | KAPANDI (kapi eksik, kusur 5) |
| siluet olcumu birim | KAPANDI birim olarak, etkisi sifir (kusur 4) |
| arka paneller kitap pozu | KAPANDI — arka gorunum CB'de aynali, dogru duruyor |
| pens apeksi koltukalti hizasinda | duruyor (ilanli, kapsam disi) — kalipta gorunur: on beden pens apeksi koltukalti y'sinin 15 mm altinda |

## Reward hacking

- flat_ayni_insan_check: giris/N/flat.svg kumesine cevrildi (eski 0X-*.svg yerine) — kapsam degisikligi ilanli, dosya yoksa eskiye dusuyor, sessiz yesil yok. Olcum tanimi beden yoluna kaydi (yukarida). **Gevsetme degil, ama olcum artik cizimi olcmuyor.**
- grafdogrula: esik degisikligi 0; supresyon kapisi sikilasti (oran -> mm).
- 0509-kapi.sh: H9/H10 flat_ayni_insan ilani "kapandi=A4" — A4 daha bitmeden state'te kapali yaziliyor; isci hukmu, hakem hukmu degil. Not.
- Alan disi dosya: diff 0a54a062..HEAD 54 dosya, hepsi engine/src, contract, tests, KOSU/ciktilar, wasm/vendor. Silinen 0. **Yok.**
- Alt-ajan izi: bakilmadi (kilit acik, elle).

Olcemediklerim: 0509-kapi.sh tam kosu; kusur 3'un koku (op mu cizici mi); kol kapagi cukurunun mm derinligi; isci HUKUM.md (bagimsizlik icin okunmadi).

## Gordugum resimler

a4-kontak-tur3.png: bes satirda solda on+arka flat, ortada emsal 13, sagda tablo. 1/2: kisa kollu, V yaka, bel altinda yanlara tasan sivri uclu peplum (ucgen/ucurtma gibi okunuyor, gövdeden 30 mm disari), duz etek. 3: dik yaka + anahtar deligi, uzun kol. 4: cok genis V (omuz ucundan omuz ucuna) + ic paralel cizgi, iki yama cep. 5: yuvarlak yaka, arkada iki ucgen (kusur 3). Hepsinde bel dikissiz teslimlerde ic pens tek cizgi. Emsal 13'un yaninda: ayni tur cizim, ama bizimki kose kose (kalca, bel), emsal kavisli; siluet cizgimiz gozle daha ince (emsal 2188 px'te ~5 px). giris-foto-5.png: A3 basligi duruyor ("A3 — bes fotograftan kalip ve flat"), icerigi A4. kalip-36 (1) 4000 px: on/arka beden pens ic V, temiz; etek pens uzun ince; on etek bel cizgisi pens sonrasi 5 mm egik (yan dikis dogrulama y kaydirmasi), kesim cizgisi ona paralel; kol somun ekmek gibi iki tepeli; on ust kat trapez, ON FOLD.

Sure: 40 dk.
