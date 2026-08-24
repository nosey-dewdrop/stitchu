# KART V3-C — ÜÇ KANAT KAPISI: uyum · artefakt sayımı · eğrilik sürekliliği

ETİKET: PARALEL (V3-B ile birlikte; dosya kümesi kesişmiyor)
SÜRE TAVANI: 90 dk

## NE
Bu fazın kapısını kur. Kapı TEK test değildir; üç kanat birden.

## GİRDİ DOSYALARI
- `engine/src/shellprojection.hpp` · `engine/src/shellprojection.cpp` (OKU, DEĞİŞTİRME)
- `engine/tools/shell-flat.cpp` (OKU) · `./engine/build/shell-flat EU38`
- `./engine/build/surface-pattern EU38`
- `engine/CMakeLists.txt` (test kaydı için YAZARSIN)
- `engine/tests/` — emsal olarak `flat_convention_check.mjs` ve
  `flat_geometry_sellable_check.mjs` (kapı nasıl yazılıyor, exit kodu nasıl)
- `GECE/V3-R.md` — eşiklerin YAYINLANMIŞ kaynağı buradadır, oradan al

## ÜÇ KANAT

### (a) `engine/tests/flat_pattern_agree_check.mjs`
Aynı spec'ten üretilen flat ve kalıp için ALTI ölçü **%1.5** toleransta mı.
- Flat tarafı: `shell-flat EU38` JSON `measures`.
- Kalıp tarafı: `node engine/tools/pattern-measure.mjs <pattern.json>` —
  bu aleti V3-B YAZIYOR, sözleşmesi: aynı altı ad, aynı sıra, alan `mm`,
  ölçülemeyen `null` + `reason`. **Alet henüz diskte yoksa** testi sözleşmeye
  göre yaz ve yokluğunda `SKIP` değil **KIRMIZI** düşür (eksik alet = eksik kanıt).
- `null` gelen ölçü **atlanmaz**: adıyla raporlanır ve kapıda `UNMEASURED`
  satırı olur; kaç tanesi ölçülemedi sayısı basılır.
- %1.5 için `GECE/V3-R.md` "yayınlanmış formül YOK" diyorsa testin başlığına
  aynen şunu yaz: eşik yayından değil, şu ölçümden/karardan.

### (b) `engine/tests/flat_artifact_census.mjs`
`shell-flat` konturunda artefakt SINIFLARINI SAY ve KÖKE BAĞLA. Dört sınıf:
1. tırtıklı/dişli kenar (ardışık teğet açısının işaret değiştirmesi)
2. kendini kesen kontur (segment-segment kesişimi)
3. eğrilik süreksizliği (C1 kırığı) — (c) kanadıyla aynı ölçüm
4. sıfır alanlı parça / dejenere segment
Her sınıf için çıktıda: **kaç adet · hangi fonksiyondan doğuyor (dosya:satır) ·
kök çözümü (tek cümle)**. Kaynak satırını bulamıyorsan "KAYNAK BULUNAMADI" yaz.
**Artefaktı kırpma, smoothing, çözünürlük düşürme ile GİZLEMEK fazı tek başına
düşürür** — bulduğunu say ve bas.

### (c) Eğrilik sürekliliği (aynı dosyada, (b)'nin 3. sınıfı)
Bitişik segmentlerin teğet süreksizliği beyanlı eşiği aşamaz.
Eşik: **1.0°**, kaynak McNeel Rhino "Understanding Tolerances" açı toleransı
varsayılanı (`GECE/V3-R.md`, güven YÜKSEK). Daha sıkı emsal CATIA V5 GSD 0.5°
dosya başlığına NOT olarak yazılır. Eşiği ve kaynağını test dosyasının
BAŞLIĞINA yaz — kaynaksız eşik kapıya giremez (§5, §7.6).

## ZORUNLU KANITLAR (bunlar olmadan kart kapanmaz)
1. **4.2 BOŞ TEST KAPISI — birincil usul:** yeni denetim faz-öncesi motorda
   KIRMIZI düşmeli. Usul: faz-öncesi commit'in ürettiği ÇIKTI ARTEFAKTINI
   (eski flat hattı `node engine/tools/render-garment-flat.mjs` çıktısı ya da
   faz-öncesi `git stash`/worktree'den alınmış artefakt) yeni ölçüm aletiyle
   yargıla. Eski hattın 6 ölçüsü `shell-flat`inkiyle **%1.5'te tutmuyorsa**
   kanıt budur — logu kaydet. **DERLEME HATASI "kırmızı düştü" SAYILMAZ.**
   Log: `GECE/log/V3-C.vacuous.txt`
2. **4.5 MUTASYON KANITI:** her üç kanat için ayrı ayrı, kasıtlı bir bozma
   (örn. `shell-flat` çıktı JSON'una +5mm enjekte et, ya da kontura kırık bir
   nokta sok) kapıyı KIRMALI, geri alınınca YEŞİLE dönmeli. Kaynak koda kalıcı
   değişiklik yapma — mutasyonu geçici artefakt üstünde yap.
   Log: `GECE/log/V3-C.mutation.txt` (iki koşu, kırmızı + yeşil)
3. CMake'e bağla, `ctest --test-dir engine/build -N` listesinde adları görünsün.
4. Tam `ctest --test-dir engine/build --output-on-failure` koş →
   `GECE/log/V3.ctest.after.txt`. **Miras kırmızı AD kümesi büyüyemez**
   (bugünkü dört ad: style_check · sizechart_source_check · contract_check ·
   figure_check). Yeni kırmızı ad doğarsa RAPORLA, gizleme.

## ÇIKTI
- `engine/tests/flat_pattern_agree_check.mjs`
- `engine/tests/flat_artifact_census.mjs`
- `engine/CMakeLists.txt` (test kayıt satırları)
- `GECE/log/V3-C.vacuous.txt` · `GECE/log/V3-C.mutation.txt` · `GECE/log/V3.ctest.after.txt`
- `GECE/V3-C.md` — üç kanadın sonucu, sayılarla; her kırmızı yanında kök
  teşhis + en az bir ÖLÇÜLMÜŞ çözüm adayı (§4.7).
- Commit at (lowercase ingilizce). Push ETME.

## YASAKLAR
- `engine/src/` altına, `engine/tools/` altına DOKUNMA (V3-A/V3-B orada).
  Kapı KIRMIZI düşerse **düzeltme, RAPORLA** — kapıyı gevşeterek geçirmek
  fazı düşürür (§7.1).
- Toleransı sayı tutsun diye gevşetmek yasak (§4.6).
- Mevcut testleri değiştirmek yasak.
- Artefaktı kırpma/smoothing/çözünürlük ile gizlemek yasak.
- "Baktım / doğru görünüyor" yasak.
