# KART F6-C — KOL KAPISI: ÇİZİLENİ BEYANLA YÜZLEŞTİR (isci-motor)

## NE
Kol oyuğu ile kol kapağını ÇİZİLMİŞ poligonlardan ölçen bir kapı kur; kapı
kırmızıysa kök sebebi `engine/src/sleeve.cpp`'de düzelt — testi değil.

## ÖNCELİK SIRASI (turun biterse yukarıdan aşağı bu sırayla bitmiş olsun)
1. Kapı testi var ve GERÇEKTEN ölçüyor.
2. Kapı bugünkü motorda KIRMIZI düşüyor ve neyi yakaladığı yazılı.
3. Kök sebep düzeltiliyor, kapı yeşile dönüyor, devralınan 7 kırmızı BÜYÜMÜYOR.
Üçü bitmezse 1-2 bitmiş olsun; yarım iş dürüstçe raporlanır, uydurulmaz.

## GİRDİ DOSYALARI (bunlar, başkası değil)
- `GECE/F6-B.md` — bu gecenin ölçümü. **Sayıları oradan al, yeniden türetme.**
- `GECE/log/F6.armhole-cap.json` — ham sayılar (96 + 18 hücre)
- `engine/tools/f6-armhole-cap.cpp` — kenar çıkarma yöntemi ZATEN yazılmış;
  kapıda AYNI yöntemi kullan, yeniden icat etme
- `engine/src/sleeve.hpp` · `engine/src/sleeve.cpp` (özellikle satır 86-94, 104)
- `engine/src/garment.cpp:293, 611, 660-661`
- `engine/tests/cap_sleeve_check.cpp:47-53` (`capEdgeLength`)
- `knowledge/cap-ease-isareti-2026-08-17.md` (gerçek kalıptan ölçülmüş yedirme)
- `engine/tests/CMakeLists.txt` ya da `engine/CMakeLists.txt` (test kaydı nasıl)

## ÇIKTI
1. `engine/tests/sleeve_armhole_agree_check.cpp` + CMake/ctest kaydı.
   Kapı adı **`sleeve_armhole_agree_check`** — başka ad kullanma.
2. `GECE/F6-C.md` — tutanak. **İLK İŞ olarak aç, ilerledikçe EKLE.**
3. (Gerekirse) `engine/src/sleeve.cpp` düzeltmesi.

## KAPININ ÜÇ HÜKMÜ (üçü de çizilmiş konturdan ölçülür, sayaçtan değil)
**H1 — SAYAÇ ÇİZİMİ TUTUYOR MU.** Emit edilen gövde parçalarının kol oyuğu
kenarları toplamı ile `pattern.sleeveArmholeLenMM` farkı **≤ 0.79375 mm**
(üretim dikiş standardı; F6-B pens modunda 0.000000 mm, prenses modunda en kötü
0.015479 mm ölçtü — kapı 51 kat pay bırakıyor, gevşetme değil).

**H2 — DÜZ KAPAK.** `SleeveCap::Plain`'de
`cizilen_kapak_yayi / cizilen_oyuk_yayi − 1` ile `capEaseFor(fabric)` farkı
**≤ 0.0015** (F6-B ölçtü: en kötü 0.00130, EU36 Princess Woven).
Eşiğin kaynağı ÖLÇÜM'dür, literatür değil — bunu testin başına YORUM olarak yaz.

**H3 — BÜZGÜLÜ KAPAK (bu gece kırmızı olan).** `Gathered`/`Puffed`'da
BEYAN edilen `capSpreadFrac(cap)` ile ÇİZİLEN yay fazlası
(`cizilen_kapak_yayi / duz_kapak_yayi − 1`) **aynı büyüklük olmak zorunda**,
tolerans **≤ 0.02**. F6-B ölçtü: Gathered beyan 0.20 ↔ çizilen 0.1101–0.1390;
Puffed beyan 0.45 ↔ çizilen 0.7164–0.7910. **Bu hüküm bugün DÜŞER; düşmesi
kapının çalıştığının kanıtıdır.**

Kapı 8 bedeni (EU34..EU48) × {Woven, Knit} × {Plain, Gathered, Puffed} × pens
ve prenses modunu gezsin. Her hücrede ölçülen sayıyı `printf` ile BASSIN
(RULES 6: sayı test çıktısında yaşar, dokümanda değil).

## KÖK SEBEP (H3'ün düzeltmesi — testi gevşetmek YASAK)
F6-B'nin teşhisi: `sleeve.cpp:104` yayılmayı **GENİŞLİK** kesri olarak
uyguluyor; kumaşa giren şey ise **YAY**. Puff'ta ayrıca `capHeight += spread`
ikinci eksende de büyütüyor, o yüzden çizilen fazlalık beyanın 1.6-1.8 katı.
Doğru davranış: `capSpreadFrac` bir YAY fazlalığı beyanıdır; genişlik (ve
puff'ta yükseklik) bu yay fazlalığını verecek şekilde ÇÖZÜLÜR — `sleeve.cpp`
Adım 1'deki ikili arama zaten bu işi yapan alettir, aynısını kullan.

## SERT KISITLAR
- `engine/tests/` altındaki MEVCUT hiçbir dosyayı değiştirme/silme (K6 kapısı
  M ve D'yi kırmızı sayar). `sleeve_check.cpp`'ye DOKUNMA — totolojik olduğunu
  biliyoruz, onu bu gece kaldırmıyoruz; yeni kapı onun YANINA kurulur.
- Devralınan 7 kırmızı büyüyemez (§0.6):
  `bugra_bridge_check contract_check figure_check h10_gate_check
   preview_truth_check sizechart_source_check style_check`.
  Değişiklikten önce ve sonra ctest koş, iki listeyi de F6-C.md'ye yapıştır.
- Golden bayt-birebir kalmalı: `python3 engine/golden-diff.py` (Plain hattı
  değişmemeli). Değiştiyse geri al.
- `patterns_real/` (§0.10) ve üretilmiş dosyalar (§0.15) dokunulmaz.
- Kapıyı geçmek için tolerans oynatmak yasak (§0.12). Eşik değişecekse
  gerekçesi F6-C.md'ye ve DAMLA-KUYRUK'a yazılır.
- commit ATMA.

## BİLMEN GEREKEN (kapı kırmızıysa panik yok)
`GECE/kapi.sh`'in K2 kapısı bu gece YAPISAL OLARAK ÖLÜ: yeni test dosyası
faz-öncesi worktree'de bulunmadığı için hiçbir yeni kapı K2'yi geçemez
(kanıt `GECE/F6.md`). Bu senin işini etkilemez — sen kapıyı doğru kur.

## SÜRE TAVANI
maxTurns = 40. Tavana yaklaşırsan F6-C.md'yi kapat, "kesildi + kalan iş" yaz.
