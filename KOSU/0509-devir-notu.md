# 0509 koşusu — devir notu (9.4 / 8.5)

Yarım kalan işçi buraya iki satır yazar; sonraki (resume) işçinin İLK İŞİ bunu okumaktır.
Boşsa yarım kalan iş yoktur.

## Ne yapmaya çalışıyordum?

_(adım, alt adım, hedef — tek cümle)_

## Hangi yolu neden bıraktım, kaldığım satır neresi?

_(dosya yolu + satır no + neden bırakıldığı; "denemedim" ile "denedim, şu yüzden olmadı" ayrı yazılır)_

## A2b (6 Eyl) — CIZIM HATTI AYAGA KALKTI

Ne yapmaya calisiyordum: karar ajaninin "A2 cozucuden degil CIZIMDEN surulur" karari.
graf -> degerlenmis geometri -> flat.svg/png + kalip-36.svg uctan uca, `engine/build/grafciz`
ve `engine/build/grafdogrula` CLI adlariyla. solver_utils'e DOKUNULMADI.

Kapanan: KABUL P1 GECTI (once "wasm flatSVG yok" kirmizisiyla gecmiyordu). sinyal_tam YESIL
(devredilen bundle_fresh_check=1 kirmizisi wasm yeniden derlenince kapandi — A9'un isiydi,
burada dustu). olcek_check icin ERR_SCALE_MISMATCH kuruldu + iki yonlu birim testi
(engine/tests/0509-olcek_check.cpp, ctest olcek_check).

Kapanmayan, adiyla:
- olcek_check GECIDI hala HENUZ-YOK basiyor cunku engine/tests/0509-kapi.sh:354 bu geciti
  KOSULSUZ "graftan cizim yok" diye yaziyor; script REFERANS KILIDI altinda, degistirmedim.
  Kilit acilirsa gecit `engine/build/grafciz <graf> gercek36 kalip` cikis kodunu okuyabilir.
- Kol, flat gorunumde ACILMIS duruyor (dikis olarak dogru, cizim konvansiyonu olarak eksik);
  sevkPoz.kolAcisiDeg baglanmadi — UYDURULMADI, A2c/A4'e.
- 8.4 ivme yine yerelMinimum=true: anaSapmaMM 0.693 (contract esigi 2.0'in ALTINDA) ve
  enum 436 (circir tabani) uc turdur sabit; ikisi de bu adimin urun olcusu DEGIL.
  Bu adimin urun olcusu sanalDikisMM idi: null -> 8 bedende 0.00 mm (esik 2.0), olculdu.

## A2a resume (6 Eyl, tur 2) — DEVREDILEN IKI KIRMIZI KOK NEDENDEN KAPANDI

Ne yapmaya calisiyordum: brief'in ONCE ONAR (7.5) listesi — adim baslamadan onceki
iki kirmizi.

KOK NEDEN (tek): referans kilidi ACIKTI. Onceki kosu `--kilit-ac` ile 217 dosyayi
yazilabilir birakti; commit 94a08a27 mesaji "lock set" diyor ama fiilen kurulmadi
(chmod git'te izlenmez, bu yuzden commit mesaji ile disk hali ayrisabiliyor).
Sonuc: kendi-check H7 FAIL (kilitli alanda 8 yazilabilir dosya).
`kapi_sozlesme_check` AYRI bir kirmizi DEGIL: engine/CMakeLists.txt:1546 onu
`0509-kapi.sh --kendi-check`'e bagliyor, yani H7'nin ta kendisi. Iki ilan, tek sebep.

Kapanma: `bash engine/tests/0509-kapi.sh --kilit "engine/src/solver_utils.hpp engine/src/solver_utils.cpp"`
Izin listesi A2a'nin GERCEK ihtiyaci kadar (2 dosya) tutuldu, H7 tavani (<=2) ile
uyumlu. contract/graf-v1.json KILITLI birakildi: cozucu blogu (maxIter 400,
sureTavaniMS 2000, adimBoyu 0.5, icProjeksiyon 4, yakinsamaMM 0.05, olcekKaynagi,
ERR_UNSOLVABLE) A2c'de zaten tam yazilmis, A2a'nin ekleyecegi sayi yok — esik
gevsetilmedi, ihtiyac olculdu.
Sonuc: kendi-check 18 hukum gecti, 0 kirmizi.

Olculen, ONARIM DEGIL: `grafciz` deterministik ve round-trip bayt-ayni.
Ilk olcumum yanlisti — `2>&1` ile stderr'i SVG'ye karistirmistim (grafciz-cli.cpp:93
olcek_check satirini zaten stderr'e basiyor). `2>/dev/null` ile:
  croquis36/flat  -> 56cacf199ec95ee9dbb602566eaa769f = commit'teki flat.svg
  gercek36/kalip  -> b9b327ee817af41a946b442826aec7b7 = commit'teki kalip-36.svg
Kodda degisiklik YOK; olcum araci duzeltildi.

Kapanmayan, adiyla (alanim disi, brief'te zaten baska adima bagli):
- 08-elbise-prenses.svg sapmaMM=15.7434 (esik 2) ve regresyonda K2-prenses-roba
  "kosmadi" AYNI kok nedendir: roba/prenses parca adlari (Front/Back Yoke|Body
  Center|Side) cizim tablosuna bagli degil. Kaynak `web/lib/flat-from-pattern.js`
  — DOSYA ALANIM DISI (madde 3/11), brief bunu A2/A4'e bagliyor. Sessiz gecilmedi:
  hat bunu adiyla reddediyor (madde 4).
- flat_ayni_insan_check=1 (ILANLI, tavan 34, kapanacak adim A4) — dokunulmadi,
  sayi artmadi.

KILIT UYARISI (sonraki isci): kilit disk halidir, commit'te tasinmaz. Adim
basinda `--kendi-check` H7'yi OKU; FAIL ise once `--kilit "<izin listesi>"` kur,
sonra ise basla. `--kilit-ac` ile birakilan kosu bir sonrakini kirmizi baslatir.

## A2a tur 3 (6 Eyl) — OLCUM DEFEKTI KOK NEDENDEN BULUNDU, ONARILMADI (kapsam)

Ne yapmaya calisiyordum: karar ajaninin hukmu — A2'nin metrigi TEK'e iner
(sanalDikisMM) ve A2 bundan sonra KENDI KAPISINI ONARMAZ (is A1a'ya iade).

KOK NEDEN (sanalDikisMM 0 -> null -> null): metrik OLCULMUYOR, ELDEN besleniyor.
`engine/tests/0509-kapi.sh:539-552` `sanalDikisMM`'i `KAPI_SANAL` ORTAM
DEGISKENINDEN okuyor ("Isci doldurur; yoksa null basar"). Son iki commit kilit
onarimiydi, kimse export etmedi -> null. Yani durgunluk DEGIL, olculmeme —
karar ajaninin teshisi dogrulandi. Kanit:
  bash engine/tests/0509-kapi.sh --kisa            -> sanalDikisMM: null
  KAPI_SANAL=0 bash engine/tests/0509-kapi.sh --kisa -> sanalDikisMM: 0
Artifact (KOSU/ciktilar/graf-ilk/sanaldikis.json) 8 bedende gercek sayi tasiyor
ama gecit onu OKUMUYOR. ONARILMADI: dosya A1a'ya iade edilen gecit altyapisi
(karar ajani: "A2 kendi kapisini, kilidini ve metrigini ONARMAZ").
Onerilen onarim A1a'ya: KAPI_SANAL bos ise sanaldikis.json'dan max(sanalDikisMM)
okunsun; env yalniz override olsun.

H16 KIRMIZI, KOK NEDEN AYRI BIR ARAC DEFEKTI (esik gevsetme DEGIL):
`0509-kapi.sh:871-883` kabul komutlarindaki her "/" iceren shlex token'ini DOSYA
sayiyor; 5. kabul komutu kabuk yonlendirmesi iceriyor, `>/dev/null` "olmayan
dosya" diye okunuyor. Minimal repro:
  python3 -c "import shlex;print([p for p in shlex.split('a >/dev/null') if '/' in p])"
  -> ['>/dev/null']
Urun kusuru degil, olcum kusuru. Ayni dosya kilitli + A1a'ya iade -> ONARILMADI.

OLCULEN (elden degil, artifact'tan): sanalDikisMM = 0.00 mm, 8 bedende, esik 2.0.
Bosluk-sifir DEGIL: 6 dikis cifti + 5 halka gercekten olculuyor, kol_oyugu
artigi -9.99e-09 mm (gercek cozucu artigi). Giysi kapaniyor.
grafciz deterministik dogrulandi: croquis36/flat md5 56cacf19... = commit'teki.

ADIYLA DURAN, ALANIM DISI:
- Taban graf `taban-elbise` KOL panelini tasiyor; brief'in cumlesi "kolsuz".
  Cizim grafa SADIK, kusur cumle->graf cevirisinde (A6c hatti). UYDURULMADI.
- Kol flat'te acilmis/yanda duruyor (sevkPoz.kolAcisiDeg bagli degil) — A2c/A4.
- K2-prenses-roba regresyonda kosmuyor; kaynak web/lib/flat-from-pattern.js — A2/A4.

## 2026-09-07 — A2a yeniden acilis: H7 KILIT ONARIMI (kok sebep)

ONCE ONAR (7.5) maddesi geregi adim isine gecmeden H7 kapatildi.

KOK SEBEP (iki kaynak celisiyor, gevsetme degil):
- Kosucu `KOSU/0509-kosu.js:181` izinAlt['A2a SOLVER_UTILS'] = 4 glob:
  `engine/tests/0509-* contract/graf-v1.json engine/CMakeLists.txt engine/src/solver_utils.*`
- H7 ise izin listesini STATE'ten okur: `0509-state.json` A2bIzinListesi = 3 glob
  (`solver_utils.hpp`, `solver_utils.cpp`, `0509-kapi.sh`).
`--kilit` kosucunun GENIS listesini acar, H7 state'in DAR listesine gore yargilar =>
6 dosya "izin disi yazilabilir" kalir: contract/graf-v1.json, 0509-emsal-olcum.mjs,
0509-wasm-sanity.mjs, 0509-olcek_check.cpp, 0509-solver_check.cpp, 0509-topoloji_check.cpp.
Bunlar A1b'nin `engine/tests/0509-*` izninden kalma; A1b kapaninca kilit YENIDEN KURULMAMIS.

ONARIM (gevsetme YONUNDE DEGIL — daha SIKI olan tarafa hizalandi):
  bash engine/tests/0509-kapi.sh --kilit "engine/src/solver_utils.hpp engine/src/solver_utils.cpp engine/tests/0509-kapi.sh"
  -> "kilit: 217 dosya salt-okunur, izin listesinden 3 dosya yazilabilir"
  -> H7: OK (izin disi yazilabilir: 0). kendi-check 18/18, 0 kirmizi.
State'i GENISLETMEK secilmedi: Q3 kurali "ilan yoksa izin de yoktur" der, tavan <=0;
ilani genisletmek gecidi gevsetmek olurdu.

UYARI — TEKRARLAR: chmod git nesnesi DEGIL, commit'te tasinmaz. Kosucu her alt adim
basinda `--kilit` cagirdiginda GENIS listeyi acacagi icin H7 yeniden kizarir. Kalici
cozum kosucu ile state'in tek kaynaga indirilmesidir; `0509-kosu.js` benim alanim disi,
acikSorular'a yazildi.

## A4 (9 Eyl, elle, Damla karari) — FLAT FASHION FLAT OLDU, MOTOR GERCEK OLCUYOR

Ne yapmaya calisiyordum: Damla'nin tek olcutu — flat emsalin (flat-secim.md, deer-and-doe 13) yaninda ayni turden
bir fashion flat gibi gorunsun; sonra sayilar (mm farki, flat_ayni_insan 34 -> 0, kalip ticari standart) ve A4'e
devredilen motor kalemleri. Hepsi bu oturumda kapandi; hukum `KOSU/ciktilar/giris/HUKUM.md`, kontak
`KOSU/ciktilar/giris/a4-kontak-tur3.png`, hakem `KOSU/ciktilar/hakem/A4/`.

Ne degisti (3 tur, 3 commit): (1) `engine/src/flatsvg.cpp` bastan: gorunum = kat ekseni (cf/cb), kol koltukaltindan
croquis kol ekseninde sarkan tup (genislik panel/pi, 07'de olculdu), kalinlik = dikis partnerinin gorunumu, croquis
siluet olcum yolu. (2) Motor: `cozucu.pens.pensPayi` contract'a; pens agzi on/arka arkaPay ile ayri, etek kalca-bel;
agiz dikisin ustune BINDIRILIYORDU (dikilen bel bedenden +40..80 mm) — cozPens agzi gecis yonunde acar, yan tepeyi
kaydirir, yan dikisi dogrular, centikleri yeniden oturtur; supresyon kapisi EMILMEYEN'i olcer (0.00); gogus/kalca
halkasi yatay kesit; siluet hedefi genislik birimi; grafciz COZULMUS grafi cizer (eskiden ham). (3) Kalip: kesim
cizgisi pens agzini kopruler, etiket Bugra yazimi (EU 36, 1 cm - 3/8 in, #n/N). Kapi: flat_ayni_insan_check urun
flat'lerini (giris/N/flat.svg) olcer, 34 pini kalkti (state.json kapandi=A4, 0509-kapi.sh H9/H10, sinyal.sh).

Sonraki oturuma (karar ajani 9 Eyl): croquis yatay yasa (cevre/4) emsalden %7-8 genis — gogusYarimOverTorso emsal
medyani 0.50 (n=4), bel 0.406 (n=6); bizde 0.538 / 0.437. A4'te DEGISTIRILMEDI (F1 gerekce zinciri, body_check (g),
gen-contract, wasm_body_check bagli). Degistirilecekse: payda tanimi (nape mi SNP mi, 20 mm) sabitlensin, n>=8 kolsuz
oturan flat beden bilgisiyle, cevre/4 x k (k ~ 0.93) omuz hukmuyle birlikte turetilsin. Ayrica: pens apeksi taban
grafta koltukalti hizasinda (dart_*.1 to = landmark.underarm) — kalipta sivri uzun pens, taban geometrisi;
vocab_reference_check bust +2 / hip +1 (KAPI B nitelik adi ve landmark.hip; beden referansi, arac siniri, A6 ilani).
Kilit: elle calisma icin acildi, oturum sonunda A5IzinListesi ile kuruldu; muhur yenilendi.
Hakem: tur 1 BITMEDI/ALIRDIM (6 kusur) -> tur 4 kapatti; tur 2 BITTI/ALIRDIM (2 kucuk kusur) -> tur 5 kapatti. A4 BITTI.
Okuma kovasi (A3/A6, A4 degil): Mary Quant 4/5 okumasi fotografa uymuyor (yuvarlak yaka + beyaz yatik yaka + kemer; bizde V band).

## A4 DEVIR (9 Eyl gece, elle; Damla'nin 0-K karari 0509-kosu.md basinda) — sonraki oturum BURADAN

Ne yapildi (commit'ler d7d30d3d..HEAD): (1) Croquis36 = MANKEN 90-60-90 / 178 / 55 (contract/body-v1.json croquis36.manken);
body.cpp'de tek kurulus `BodyBuilder::kur` (gercek36 ile ayni formul, girdiler manken), x = kesit yarimi (izdusum); cevre/4 tup
yasasi ve emsal/sablon bandlari body_check'ten kalkti; contract croquis36 sayilari `engine/build/body_check dump` ile yazildi;
mankenOlcum blogu (VS fotografi Jasmine Tookes 2014, gozle px, DOGRULANMADI, kiyas). (2) Flat'te giysi mankene GIYILMIS izdusum:
graf.cpp eval ringQuarter croquis'te kesit yarimi x (1 + bolluk/cevre) (kalip cevre/4 kalir); flatsvg kol tupu croquis'te panel/2;
grafdogrula halka_kesit/supresyon croquis'te izdusum ilanina kiyaslar. Kutuk bel gitti; giris/1-5 flat'leri yeniden cizildi,
KABUL 0, ctest yesil. (3) Emsal SILINDI: GIRDI/iyi-flat, flat-secim.md, flat-olcum.py/json, 0509-emsal-olcum.mjs; state
kabulKomutlari'ndan cikti; mannequin-chart-v1 tarih. (4) Bes giysi seti GIRDI/hedef-fotograflar-2/ (Dior HC FW26, gorunway /
Vogue Scandinavia: bluz 00001, gomlek 00019, etek 00010, pantolon 00028, elbise 00030; Bershka/Stradivarius 403, Instagram yok).

Sirada (bu sirayla, hepsi 0-K'ya gore): (a) PANTOLON TABANI yok — engine/tests/graf_ir_check.cpp'ye ikinci taban (on/arka bacak
paneli: bel-yan-agiz(hem)-ic bacak-ag kavisi(kubik)-CF/CB ag dikisi; dikisler yan, ic bacak, ag; halkalar bel, paca; --emit ile
KOSU/ciktilar/graf-ilk/pantolon.json) ve 0509-a3-uret.mjs/teslim'e taban secimi (ops.json'da "taban" alani). (b) Bes fotografin
OKUMASI (ops) elle yazilir: KOSU/onbellek sha anahtariyla (0509-a3-uret.mjs uret(sha)), teslim dizini KOSU/ciktilar/giris-2/1..5;
etek = drop on_beden/arka_beden/kol + bel bandi; bluz/gomlek = drop etek + hem kalcada, gomlek cf kapanma + yaka bandi;
elbise = pileli (gather). (c) Kontak (0-K madde 4): satir = fotograf kucuk resmi + op sayisi + croquis36 sayilari (gogus/bel/kalca
yarimi, omuz-bel) + gercek36 sayilari + flat + kalip; KOSU/0509-a4-kontak.mjs emsal 13'e bagli, bastan yazilacak. (d) Goz hakemi
x2: taze, kor, yalniz png, her turda WebSearch ile o an buldugu fashion flat'lerle kiyas, evet/hayir + 3 madde ("alir miydim"
SORULMAZ). (e) Kalan emsal metinleri: contract/flat-convention-v1.json croquis/sevkPoz kaynaklari (kolAcisiDeg 82.2 emsal
medyaniydi — yeni kaynak lazim: manken kol pozu), KOSU/0509-kosu.js A1b/A4 metinleri, engine/tests/cizim_giysi_mi.mjs yorumu,
manken_insan_ayrim_check.mjs (flat-olcum.json yok, v2 kopyasi); vocab_reference_check bust/hip ilanli. Kilit A5 listesiyle
kurulu, muhur yenilendi. Koşucu calistirilmaz; A5 elle bitene kadar.

## A4 TUR 6-8 (9 Eyl gece, elle; Damla 0-K 3a: 11 Etsy ilani) — sonraki oturum BURADAN

Ne yapildi (commit 7afd256f..HEAD): (1) CIZICI (engine/src/flatsvg.cpp): croquis = mankene giyilmis izdusum: duz halka-arasi kenar (yan
dikis) mankenin ara kesitlerini izleyen kubik (bedeniIzle; siluet: koltukalti/bel/ust kalca/kalca, gogus kesitleri ALINMADI: S yapiyordu);
kalca altinda C1 gecis (etek kalcada kirilmiyor); yatay etek ucu sarkan kubik (kosede dusey teget; sag 0.05 x genislik, etsy-01/05 PIL
olcumu, contract/flat-convention-v1.json kavis blogu); buzgulu kenar dikildigi boya sikisir (grafop scaleEdges'in tersi, yalniz croquis);
ust dikis izi orneklenerek ic ofset + iki ucta %5 kirpik (kose tasmasi yok); pens V bacak, balik pensi elmas; kapama sembolleri (dugme
daire, fermuar kesikli cift cizgi + cekecek); kol tupu poz olcegi croquis'te /2 (agiz "L kancasi" gitti); kapak basi omuz ucundan disa teget;
eksenli panelde x<0 eksene kirpilir (pantolon ag uzantisi); croquis'te pens agzi COZULMEZ (cozulmusGraf pensCoz=false: bel dikisinde yan
basamak yoktu). Kol ekseni 82.2 -> 68 derece (contract body-v1 croquisOranlar + flat-convention sevkPoz; kaynak kor hakem web ornegi n=5,
DOGRULANMADI; elbow/wrist landmark + farkTablosu body_check dump ile yenilendi, body_check yesil). (2) MOTOR (grafop.cpp): subdivide
halka/dikis zincirini YONUYLE acar (gogus_halka kopuk kusuru); attach iki kenari da seam yapar; drop kenar kaybeden halkayi siler.
grafdogrula: ayna dikisi ZINCIR olabilir + kapanmasiz dikili ayna (pantolon ag); halka kapanisinda "dikili ayna" kat gibi. graf_op_check
+2 beklenti, PASS. (3) PANTOLON TABANI: engine/tests/graf_ir_check.cpp tabanPantolon (iki bacak, ag kavisi, on ic bacak kubik + fitLength),
--emit KOSU/ciktilar/graf-ilk/pantolon.json (pin); 0509-a3-uret.mjs tabani okumadaki tabanGraf'tan secer. (4) OKUMALAR: 11 Etsy
(KOSU/onbellek, isci-A4-tur6; uretici scriptler oturum scratchpad'indeydi, onbellek JSON'lari kaynak) -> KOSU/ciktilar/giris-3/1..11,
dogrulayici gercek36 10/11 yesil (5: supresyon 3.5 mm emilmeyen bel, tolerans 2; apeksten bagimsiz, cozPens band+etek dagilimi). Dior seti
-> giris-2/1..4 (pantolon, tunik, sutun elbise, gomlek), 4/4 yesil; GIRDI/hedef-fotograflar-2 KAYNAKLAR.md dosya/tarif eslesmesi 2 dosyada
YANLIS (gomlek.jpg pileli tunik gosteriyor, bluz.jpg sal altinda gomlek, etek.jpg saçaklı PALTO — etek okunmadi, uydurulmadi; dogru
etek fotografi lazim). (5) KONTAK (0-K 4): KOSU/0509-a4-kontak.mjs bastan: ilan | flat | kalip | op sayisi | halka toplamlari iki bedende |
dogrulayici; KOSU/ciktilar/giris-3/a4-kontak-tur8.png, giris-2/a4-kontak-tur2.png. (6) EMSAL TEMIZLIGI: 0509-kapi.sh emsal geciti
kaldirildi (kendi-check 17/18, tek kirmizi H7 = kilit acik), 0509-kosu.js A1/A4 metinleri, cizim_giysi_mi.mjs yorumu, body-v1
_iyiFlatOlcumu blogu silindi. KALAN: engine/tests/manken_insan_ayrim_check.mjs (emsal olcumunden turemis kapi; add_test silmek H15
ihlali — kaldirma karari acik), vocab_reference_check bust+2/hip+1 (A6 ilani). olcekAraligi max 1335 -> 1465 (yere kadar elbise;
kaynak Aldrich waist-to-floor).

HAKEM (0-K 5, kor, yalniz png, her tur WebSearch): tur 6 HAYIR 3/11 (KOSU/ciktilar/hakem/A4/tur6-hakem1.md: cizgi tasmasi, kollar dik,
pens tek cizgi, kapama yok, kalcada kirilma, chevron ust kenar) -> hepsi kapatildi; tur 7 HAYIR 3/11 (tur7-hakem2.md: askilar duz kesik,
pens tek cizgi, kose kancasi, band-etek kopuk, yaka bibi) -> aski omuz uzerinden kubik, pens V, kose teget, croquis pens cozumu yok;
yaka bibi (3, 11) ACIK: onto yaka altindaki boyun cizgisi cizilmeye devam ediyor (kirpma yok). Tur 8 hakem: asagida.

CTEST: graf/flat alt kumesi 3 kirmizi — flat_mirror_check, cizim_giysi_mi, flat_artifact_census: ucu de ESKI web cizicisini
(web/lib/flat-from-pattern.js) sevkPoz bandiyla kiyasliyor, bu oturumda dokunulan dosyalari okumuyor; kol acisi bandi 65-70'e cekilince
cizim_giysi_mi (b) eski cizicide yine kirmizi. Eski web cizicisinin akibeti karar ister (A6/A10). ONCEDEN KIRMIZI MIYDI: DOGRULANMADI
(bu oturumda HEAD~ ile kosulmadi).

MOTOR BULGULARI (acik, dokunulmadi): bumpSeamRatio coklu kenar zincirinde kenar basina carpar (iki kenar gather 1.6 -> 2.56 hedef; olculdu,
6 numarada bel buzgusu bu yuzden yazilmadi); gather homotetisi yan tepeyi tasiyor (1.5 buzgu yan dikisi 42 mm uzatiyor; 1.25 ile
gecti); fitLength kubigi yalniz UZATIR (kisa olan tarafa yazilmali); puf kol kapak kisiti 1.5 uzeri cozulmuyor (|d|<=120); body_check
dump beden argumanini yok sayiyor (hep croquis36). Asimetri (Jackie, Leia): kat eksenli cizim, simetrik karikatur; eksikPrimitif'te.
