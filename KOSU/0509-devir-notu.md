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
