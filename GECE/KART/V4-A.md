# KART V4-A — KROKİ ÇIKARIMININ KÖKÜ: kapı, düzeltmeye çalıştığı kusuru VARSAYMASIN

ETİKET: SIRALI (tur 2; tek başına koşar — V4-B aynı dosyalara yazacak)
SÜRE TAVANI: 75 dk

## NE
`engine/tests/flat_convention_check.mjs` içindeki `measureCroquis()` omuz ucunu
"CF yakadan aşağı yürürken x'in İLK yerel maksimumu" diye buluyor. Bu çıkarım
YALNIZCA omuz göğüsten GENİŞSE çalışır — yani kapı, düzeltmeye çalıştığı
kusuru varsayıyor. Bu yüzden ölçülmüş ve doğru bulunmuş bir düzeltme
(`shoulderTipX` 78.0u → 70.1799u) uygulanamıyor.
Kartın işi: **önce çıkarımı kökten düzelt, sonra ölçülmüş düzeltmeyi uygula.**
Bu bir yama değil; kapı bugünkü hâliyle kendi kusurunu koruyor.

## ÖLÇÜLMÜŞ ZEMİN (bu kart bunları YENİDEN ölçmez, kullanır)
- `contract/flat-convention-v1.json` → `croquis.landmarks.shoulderTipX`
  içindeki `_F_E_OLCULDU_AMA_DEGISTIRILMEDI` ve `_NEDEN_DEGISTIRILMEDI`
  alanları bütün teşhisi zaten taşıyor. OKU.
- Bugünkü değer 78.0u = 234mm yarı-omuz; aynı croquis'in göğüs yarı-genişliği
  73.3333u = 220mm → oran **1.0636**, yani omuz ucu büstün DIŞINDA.
- `croquis.sideSeamProfile._normalizedToChest.shoulder = 0.9570` (satın
  alınmış Buğra Locket EU38 Arka Beden'den ÖLÇÜLDÜ, ölçüm
  `GECE/log/F-E.bugra-olcum.txt`) → türeyen doğru değer **70.1799u**,
  türeyen `shoulderTipY` **16.8576u**.
- `croquis.sleeveLaw.armholeNeverBulgesOutward` bu kanunun geometrik ifadesi
  zaten kanunda yazılı.

## ★ §7.3 SINIRI — DİKKAT, KART BUNDAN DÜŞER
Kurduğun kapı **"Buğra'ya benziyor mu"** diye kurulamaz. Kapının cümlesi
GEOMETRİK YASA olacak: *set-in kollu bir giyside omuz ucu, göğüs (koltukaltı)
hattının dışında olamaz* — çünkü kol oyuğu omuzdan aşağı ve İÇERİ iner.
Buğra ölçüsü yalnız BÜYÜKLÜĞÜ (0.9570) besleyen bir girdi değeridir ve
kaynağıyla birlikte beyan edilir. "Buğra'ya yakınlık" bir eşik OLAMAZ.

## YAPILACAKLAR — sırayla

### 1. Çıkarımı kökten düzelt (`measureCroquis`)
Omuz ucunu, omuz-göğüs oranından BAĞIMSIZ bir kriterle bul. Kanunun kendi
beyanı sana hazır bir çıpa veriyor: `sleeveLaw.sleeveSharesArmholeEndpoints`
— kol oyuğu eğrisi omuz ucu ile koltukaltını PAYLAŞIYOR. Yani omuz ucu,
siluetin CF yakadan sonraki **omuz çizgisi ile kol oyuğu eğrisinin buluştuğu
köşe**dir; "x'in yerel maksimumu" değil.
- ANTİ-HACK korunacak: çıkarım BEYANA bakmadan geometrik kalacak. Beyanı
  okuyup geri yazmak kapıyı süse çevirir; hakem bunu arar.
- Yeni çıkarımın omuz-göğüs oranından bağımsız olduğunu KANITLA: aynı
  çıkarımı hem 78.0u (omuz dışarıda) hem 70.1799u (omuz içeride) croquis'inde
  koştur, ikisinde de omuz ucunu DOĞRU bulduğunu göster. İki çıktı da log'a.

### 2. Ölçülmüş düzeltmeyi uygula
`shoulderTipX` 78.0 → **70.1799**, `shoulderTipY` türetmesiyle → **16.8576**.
- `contract/flat-convention-v1.json`'da eski değer, yeni değer, ölçülmüş
  gerekçe ve kaynağı KALSIN (silme; `_previous` alanı aç).
- Bu bir eşik/ölçü değişikliğidir → **§4.6 prosedürü**: eski değer · yeni
  değer · ölçülmüş gerekçe · kaynak, COMMIT MESAJINA yazılır.
- `engine/tools/render-garment-flat.mjs` kanunu okuduğu için kendiliğinden
  taşınmalı; taşınmıyorsa elle yazılmış kopyayı BUL ve kanuna bağla.

### 3. Yeni kapı satırı: OMUZ GÖĞÜSTEN DIŞARI TAŞAMAZ
`flat_convention_check.mjs`'e 1. maddenin altına ölçülen bir şart ekle:
`shoulderTipX <= chestX` (set-in kollu aile için). Başlığa geometrik
gerekçeyi ve 0.9570'in kaynağını yaz.
- **§4.5 MUTASYON KANITI ZORUNLU**: `shoulderTipX`'i kasten 78.0'a geri al →
  kapı KIRMIZI düşmeli; geri alınca YEŞİL. İki log da
  `GECE/log/V4-A.mutasyon.txt`'ye.

### 4. Yan etkiyi ÖLÇ, gizleme
`flat_geometry_sellable_check` ve `flat_convention_check` dahil TAM ctest
koş. Kontrol noktası: `GECE/log/V4.ctest.before.txt` (6 kırmızı:
contract_check · figure_check · flat_artifact_census ·
flat_pattern_agree_check · sizechart_source_check · style_check).
**RULES 9: bu AD kümesi BÜYÜYEMEZ.** Yeni bir kırmızı ad doğduysa değişikliği
GERİ AL ve iki ctest logunu da commit'e koy — susturma, gevşetme YOK.

## GİRDİ DOSYALARI (isim isim)
YAZARSIN: `engine/tests/flat_convention_check.mjs` ·
`contract/flat-convention-v1.json` · gerekirse
`engine/tools/render-garment-flat.mjs`
OKURSUN: `engine/tests/flat_geometry_sellable_check.mjs` ·
`engine/flat-engine/styles.json` · `GECE/V4-R.md` (eşik kaynakları) ·
`GECE/V4-K.md` (§2a ve KART DIŞI md.1) · `GECE/log/F-E.bugra-olcum.txt` ·
ENV.md · RULES.md

## ÇIKTI
- değişen dosyalar + **commit hash** (push et)
- `GECE/V4-A.md` — ÖLÇÜLEN (sayı + komut + hash) · KAPANAN/AÇILAN KIRMIZI ·
  yapılamayan (sebep) · kart dışı fark edilen
- `GECE/log/V4-A.mutasyon.txt` · `GECE/log/V4-A.ctest.after.txt` ·
  `GECE/log/V4-A.inference.txt` (madde 1'in iki croquis'lik kanıtı)

## YASAKLAR
- Mevcut bir testi GEVŞETME. Eşik düşürerek yeşile boyama = faz düşer.
- `patterns_real/` altındaki satın alınmış PDF'lere DOKUNMA (§7.2) — Buğra
  sayısı zaten `contract` ve `GECE/log/F-E.bugra-olcum.txt` içinde ölçülmüş.
- "Buğra'ya benziyor mu" kapısı kurma (§7.3).
- `engine/src/` C++ tarafına dokunma (bu kart HAT-2 kalemi ve kapısıdır).
- "baktım / düzeldi" yasak (RULES 3): her iddia komut çıktısı ya da PNG yolu.
- Yeni kaynak dosya AÇMA (§7.5 sayacı V4-C'de 1 kullanıldı) — mevcut
  dosyalarda çalış.
