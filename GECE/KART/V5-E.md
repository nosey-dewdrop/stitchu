# KART V5-E — İKİ KAPIYI CTEST'E BAĞLA: RATCHET, GEVŞETME DEĞİL

## NE
`sewability_check.mjs` ve `draft_math_check.mjs` yazıldı, ikisi de KIRMIZI ve
ikisi de ctest'e BAĞLANMADI — çünkü kırmızı AD eklemek RULES 9 ihlali.
Bağlanmayan kapı çürür. Bu kart ikisini de RATCHET ile ctest'e bağlar:
bugünkü DÜRÜST ihlal sayısı TAVAN olur, sayı yalnız DÜŞEBİLİR, artan commit
kırmızı düşer.

## ETİKET
SIRALI (V5-A ve V5-D bittikten sonra; ikisinin dosyasına da TEK EL sensin).
SÜRE TAVANI: 60 dk.

## NEDEN RATCHET GEVŞETME DEĞİL (v6 §4.6 — bu bir HAMLE, gerekçesi burada)
- Eşik DEĞİŞMİYOR. Aldrich/Threads bantları, çentik kesim-çizgisi kuralı,
  hepsi aynı kalıyor ve her ihlal ADIYLA basılmaya devam ediyor.
- Değişen tek şey EXIT KODU'nun neye bağlandığı: "ihlal = 0" yerine
  "ihlal ≤ bugünkü ölçülmüş tavan". Bu reponun KENDİ yerleşik usulü:
  `engine/tests/flat_pattern_agree_check.mjs` (UNMEASURED tavanı) ·
  `engine/tests/flat_expresses_spec_check.mjs` (UNEXPRESSED tavanı) ·
  `engine/tests/vocab_reference_check.sh` (taban dosyası).
- Kazanç ölçülmüş: V5-A mutasyonu 211→216, V5-D mutasyonu 12→13. İkisi de
  tavanı aşıyor, yani ratchet ISIRIYOR. Kapı süs değil.
- Alternatifin bedeli: bağlamazsan kapı ctest'te hiç koşmaz, sessizce çürür.

## GİRDİ DOSYALARI (isim isim, başka dosya açma)
- ENV.md · RULES.md
- engine/tests/sewability_check.mjs        (V5-A'nın çıktısı)
- engine/tests/draft_math_check.mjs        (V5-D'nin çıktısı)
- GECE/log/V5-A.bostest.txt · GECE/log/V5-D.run.txt   ← TAVAN SAYILARI BURADAN.
  (⚠ ŞEF DÜZELTMESİ: kart önce `GECE/V5-A.md` · `GECE/V5-D.md` diyordu; o iki
  dosya DİSKTE YOK, kesilen oturum yazamadı. Tavanı bu iki LOGDAN al ve
  aldığın sayıyı KOMUTU YENİDEN KOŞTURARAK doğrula — logdaki sayıya körü
  körüne güvenme.)
- GECE/log/V5-D.addtest.txt                (hazır add_test satırı)
- GECE/log/V5-A.mutasyon.txt · GECE/log/V5-D.mutasyon.txt
- GECE/log/V5.ctest.opening.txt            (faz-öncesi kırmızı AD kümesi)
- engine/CMakeLists.txt                    (add_test satırı eklemek için)
- engine/tests/flat_pattern_agree_check.mjs (RATCHET emsali — usulü kopyala)

## YAPILACAK
1. Her iki teste RATCHET katmanı ekle. Tavan değeri ELLE YAZILMAZ, bir taban
   dosyasından okunur: `engine/tests/v5-ratchet-baseline.json` (TEK yeni dosya).
   İçinde her kapı için bugünkü ölçülmüş sayı + onu basan komut + ölçüm tarihi
   + kısa gerekçe alanı olsun. Emsal: `engine/tests/vocab-reference-baseline.json`.
2. Kapının çıktısı DEĞİŞMEZ: her ihlal ADIYLA basılmaya devam eder. Ratchet
   yalnız SON hüküm satırını ve exit kodunu belirler. İhlalleri gizleme,
   özetleme, sayıya indirgeme YASAK.
3. Tavan aşılırsa exit 1 ve hangi kalemin tavanı aştığı ADIYLA basılır.
   Tavanın ALTINA düşülürse: exit 0 + "TAVAN DÜŞÜRÜLEBİLİR: X -> Y" uyarısı.
4. `engine/CMakeLists.txt`'e İKİ saf `add_test` satırı ekle (`sewability_check`,
   `draft_math_check`). Mevcut hiçbir satıra DOKUNMA.
5. §4.5 MUTASYON, ratchet katmanı İÇİN yeniden: her iki kapıda tavanı aşan
   bir bozma yap → kapı KIRMIZI düşsün; geri al → yeşile dönsün.
   Log: `GECE/log/V5-E.mutasyon.txt`. Isırmıyorsa ratchet süstür, YAZ.
6. TAM `ctest --test-dir engine/build --output-on-failure` koş.
   Log: `GECE/log/V5-E.ctest.after.txt`. Kırmızı AD kümesini
   `GECE/log/V5.ctest.opening.txt` ile karşılaştır, farkı
   `GECE/log/V5-E.reddiff.txt`'ye yaz. **Fark BOŞ olmalı** (6 ad, aynı 6 ad,
   test 111 -> 113). Boş değilse GERİ AL ve raporda ADIYLA yaz.

## ŞEF EKİ — §4.2'NİN RATCHET KATMANINDAKİ DELİĞİ, DÜRÜSTÇE YAZ
Bu faz `engine/src/` altında HİÇBİR ŞEY değiştirmiyor. Dolayısıyla ratchet
katmanı faz-öncesi motorda da AYNI sayıyı basar = orada YEŞİL düşer. Yani
§4.2'nin "yeni denetim faz-öncesinde kırmızı düşmeli" şartını **ham kapı
karşılıyor** (`GECE/log/V5-A.bostest.txt` exit=1, `GECE/log/V5-D.bostest.txt`),
**ratchet katmanı KARŞILAMIYOR**. Bunu raporunda AYRI BİR BAŞLIK olarak yaz;
"4.2 geçti" diye tek satırla geçme. Kapının ısırdığının kanıtı §4.5
mutasyonudur ve bu kartta yeniden koşturulacaktır.

## YASAKLAR
- EŞİK GEVŞETME. Aldrich/Threads bantlarına, çentik kuralına, toleranslara
  DOKUNMA. Değişen tek şey exit kodunun bağlandığı yer.
- İhlal listesini kısaltma/gizleme. Ratchet SAYIYI tavanlar, ALANI değil —
  bu tuzak KOSU.md'de zaten yazılı (V4'ün ifade ratchet'i uyarısı).
- Tavanı GERÇEK ölçümden büyük yazma. Tavan = bugün basılan sayı, bir fazlası
  değil.
- `engine/src/` altında kaynak DEĞİŞTİRME. Mevcut testleri değiştirme.
- `patterns_real/` PDF'lerine dokunma. Yeni bağımlılık kurma.

## ÇIKTI
- `engine/tests/v5-ratchet-baseline.json` (yeni) · iki test dosyasında ratchet
  katmanı · `engine/CMakeLists.txt` (iki saf ekleme)
- `GECE/log/V5-E.{mutasyon,ctest.after,reddiff}.txt`
- `GECE/V5-E.md` — yapılan (yol + hash) · ölçülen (sayı + komut) ·
  yapılamayan (sebep) · kart dışı fark edilen.
"Baktım / doğru görünüyor" YASAK (RULES 3).
Bitince commit at (lowercase english), hash'i rapora yaz.
