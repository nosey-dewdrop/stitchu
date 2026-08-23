# F-N madde 1 — ölçüm notu (selfintersect 270 → 0)

## Loglar ne, ne DEĞİL

- `F-N1.ctest.after.txt` — kendi ağacım, `engine/build-n1`, tam ctest, tek koşu.
- `F-N1.ctest.before.txt` — **KİRLİ TABAN, kıyas için tek başına kullanılamaz.**
  `git worktree` ile HEAD'in temiz bir kopyasında koşuldu; o kopyada üretilmiş
  varlıklar (node_modules, `engine/dist`, python venv) YOK, o yüzden 23 kırmızı
  var ve bunların çoğu araç eksikliği (`*_wasm_parity`, `dxf_check`,
  `nest_marker_check`, `tech_pack_check`, `api_wire_check` …). Sadece saf C++
  adları kıyaslanabilir. Bu kartın gerçek "önce"si `GECE/log/F-N.ctest.before.txt`
  (04:52, 105 test / 9 kırmızı).
- ⚠ Depoda bu gece **birden fazla ajan aynı çalışma dizinini** kullanıyor
  (`396d42e` benim koşumun ortasında düştü). `after` logundaki `engine_check` ve
  `preview_truth_check` yeşilleri BENİM işim DEĞİL; benim attığım tek taş
  `engine/src/bodice.cpp`. Kendi etkim aşağıda A/B ile ayrıştırıldı.

## Ölçülen kök sebep

`sewable_census` 82980 draftın 270'inde `[selfintersect]`. Dağılım tek bir
hücreye çöküyor (probe: `GECE/probe/selfintersect-probe.cpp`):

| eksen | değer |
|---|---|
| parça | `Bodice Side Front` — 270/270 |
| gövde | EU36 · EU38 · petite (90'ar) |
| spec | dress · princess · **empire** · **woven** · **kolsuz (none.short)** |
| yaka | crew · scoop · square · sweetheart · vNeck (boat ve halter YOK) |

Kesişen iki kenar ölçüldü (`GECE/probe/si-cross.cpp`): panelin oyuk kenarı ile
kendi prenses dikişi, EU38'de **(85.87, 45.75)**.

Kök: `armholeCurveFor` içindeki `useWidthLine` dalının aramasında **tavan yok**
(`hi = 4*dx`, bir sınır değil başlangıç sayısı). Yayınlanmış scye genişlik
çizgisi kolsuz kesimde omuz ucunun 2.08mm içine düşünce dal açılıyor, ama çizgi
**ULAŞILAMAZ**: oyuk uçtan omuz dikişinin teğetiyle DIŞARI ayrıldığı için
eğrinin en küçük x'i omuz ucunun kendisinde kalıyor (EU38 ön: h=199.73'te bile
minX=164.08, hedef 162.00). Arama boşuna derinleşiyor, kontrol poligonu
katlanıyor (`cp1=(354.8,129.6)`, `cp2=(39.7,185.6)`) ve eğri **DIŞ-İÇ-DIŞ**
oluyor. Ortadaki dönüş oyuğu prenses dikişinin soluna sokuyor → panel kendini
kesiyor. Kolsuzluk şart, çünkü çizgiyi ucun içine düşüren şey omuzdan alınan pay.

## Yapılan: tavan = katlanmama şartının kendisi

`x(t)` kübiği (0,1)'de **en fazla BİR kez** dönebilir. Bir dönüş = "oyul, sonra
koltukaltına çık". İki dönüş = katlanma. `x'(t)` bir parabol, kökleri kapalı
formda sayılıyor (örnekleme değil). Eşik/tolerans/bant DEĞİŞMEDİ.

## Denenen ve ÖLÇÜLEREK REDDEDİLEN iki hamle

1. **Bölme noktasını karnın altına indirmek** (`makePrincessPieces`,
   `splitTargetY >= bellyY`). Sonuç: 270 → 216 → (karın doğru tanımlanınca) 0,
   AMA `bustier_check` (9 alt-kontrol, Upper/Lower Cup panelleri hiç doğmuyor,
   6 yerine 5 parça) ve `grade_check` (sweetheart princess dress EU40/EU48
   büyümüyor) KIRMIZI oldu. A/B ile bana ait olduğu doğrulandı. Geri alındı —
   yanlış irtifa: semptomu panelde kapatıyor, katlanan eğriyi bırakıyordu.
2. **Alt daldaki vekil tavanı (`h <= 0.94*dx`) bu dala da yazmak.** Kesişmeyi
   sıfırlıyor (82980/82980) AMA vekil ölçtüğünden fazlasını kesiyor: EU38 oyuğu
   398.26mm'ye düşüyor ve `garment_armhole_check` **K1** (400-440mm) kırılıyor.
   Şartın kendisi (tek dönüş) aynı işi 404.26mm'de yapıyor. Vekil değil, şart.

## Sayılar

| ölçüm | önce | sonra |
|---|---|---|
| `sewable_census` fully sewable | 82710 / 82980 (%99.7) | **82980 / 82980 (%100)** |
| `selfintersect` | 270 | **0** |
| `shoulder-match` uyuşmazlık | 0 | 0 |
| K1 oyuk EU38 (`garment_armhole_check`) | 421.27mm | 404.26mm — bantta |
| `garment_armhole_check` | yeşil | yeşil |

★ **YAN BULGU, sorulmadı ama karar taşıyor:** taban HEAD'de K1'in EU38 için
ölçtüğü **421.27mm'nin 17.01mm'i katlanmış eğrinin fazlalığıydı.** DIŞ-İÇ-DIŞ
yapan bir eğri, olmayan yol uzunluğu üretir. Yani K1 bir süredir **kendini kesen
bir oyuk sayesinde** yeşil basıyordu. Şimdiki 404.26mm katlanmamış ölçüdür ve
bant hâlâ tutuyor — ama EU34 (375.92) ve EU36 (389.75) artık bandın altında
(yargılanmıyorlar, "bilgi" satırı). Bu, kartın konusu değil; **DAMLA KARARI
adayı**: K1 taban-beden kapısı mı kalsın, yoksa bant sekiz bedene mi bakmalı?
