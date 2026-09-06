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
