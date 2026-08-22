# F-K — DÜZ YAKA (Peter Pan) YATMIYOR
`GECE/KART/ORTAK.md` oku. Sonra bu kart.

## KUSUR — ölçüldü, kod kendi itiraf ediyor
`engine/src/collar.cpp:120-133` `flatCollar()`: boyun kenarı **düz çizgi**
`CB(0,0) → CF(neckLen,0)`. Yorumu bunu kendi yazıyor:
> "In a real flat collar the neck edge is a shallow arc traced off the overlapped
> shoulders; its LENGTH still equals the neckline, which is what truing measures,
> so we draft the seam straight-to-length"

Yani: **uzunluk doğru (trued 0.00mm), şekil yanlış.** Truing bunu yakalamıyor
çünkü truing yalnızca uzunluk ölçüyor.

Sonuç: yaka bir DİKDÖRTGEN ŞERİT. Kavisli bir yakaya dikilince **yatmaz, dikilir/kalkar**
(band yaka gibi davranır). Görsel kanıt: `docs/edit/sonra.png` en sağdaki parça.

## KANUN — düz yaka nasıl çizilir
Ön ve arka beden omuz dikişinden **üst üste bindirilir**, yaka çizgisi çizilir,
o iz yakanın boyun kenarı olur.
- Bindirme MİKTARI yakanın ne kadar yattığını belirler: bindirme ↑ → yaka daha çok
  "roll" yapar; bindirme 0 → tam yatar ama dalgalanabilir.
- Boyun kenarının **eğrilik yönü giysinin yaka çizgisiyle AYNI** olmalı.
- Uzunluk yine `neckLen`'e eşit kalır — o şart korunuyor, ek olarak şekil şartı gelir.

## KAYNAK ZORUNLU
Bindirme miktarını UYDURMA. Sırayla ara:
1. `knowledge/DIKIS-SOZLUGU-ISO-2026-08-23.md` ve `knowledge/POM-TOLERANS-URBN-2026-08-23.md`
2. `knowledge/` altındaki mevcut defterler
3. Yayın (Aldrich/Armstrong ad+baskı+sayfa) ya da URL
4. `patterns_real/geometry/geometry-full.json` — Buğra Locket'in **gerçek yaka parçası**
   var (`Collar`, `Collar Lining`). Onun boyun kenarının **sagitta**'sını ÖLÇ.
   Bu PARİTE gözlemi (v5 §C) — kapı değil, ama şeklin var olduğunun kanıtı.
Bulamazsan `KAYNAKSIZ` etiketle, uydurma.

## YAP
1. `flatCollar()` boyun kenarını yay yap. Uzunluk `neckLen` KORUNUR.
2. Çağıranın yaka çizgisi eğriliğini bilmesi gerekiyorsa parametre ekle — `flatCollar`
   şu an sadece skaler alıyor, bu yüzden şekli bilemiyor. Kök sebep bu.
3. Dış kenar (`Rounded`/`Pointed`) davranışı korunur.

## KAPI — `engine/tests/collar_lies_flat_check`
- boyun kenarı sagitta **> 0** (düz değil)
- eğrilik yönü giysinin yaka çizgisiyle aynı
- boyun kenarı uzunluğu = `neckLen`, mevcut truing toleransı içinde (GEVŞETME YOK)
- Buğra Collar sagitta'sı PARİTE olarak raporlanır, yargı vermez

ANTI-HACK: boyun kenarını düze çevir → KIRMIZI düşmeli. Sagitta'yı ters yöne ver →
KIRMIZI. İkisini koştur, `GECE/log/F-K.mutasyon.txt`'ye yaz, elle geri al.

## ÇIKTI
Önce/sonra PNG: `GECE/log/F-K.shots/` — yaka parçası tek başına + giysiye dikilmiş hâli.
