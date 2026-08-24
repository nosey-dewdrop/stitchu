# KART V0-0F — altı kırmızı için kök teşhis + ÖLÇÜLMÜŞ çözüm adayı (§4.7)

ETİKET: SIRALI (tek işçi, tek dosya) · SÜRE TAVANI: 60 dk

## NE
Hakem 4.7 alt kapısını KALDI hükmüyle düşürdü: kırmızıların yanında ölçülmüş
çözüm adayı yok. Bu kart o eksiği kapatır — ONARARAK DEĞİL, ÖLÇEREK.

Altı kırmızının HER BİRİ için üç kalem üret:
1) KÖK TEŞHİS: kırmızıyı doğuran tek cümle + onu gösteren dosya:satır ya da
   commit hash. "Pin eski" yetmez — hangi commit, hangi geometri kararı.
2) ÖLÇÜLMÜŞ ÇÖZÜM ADAYI (en az bir): adayı UYGULA ve ÖLÇ, ama ana ağaca
   BIRAKMA. Yöntem: `git worktree` ya da /tmp kopyası; oradaki değişiklikle
   testi koştur ve sonucu bas (yeşile döndü mü, kaç kalem kaldı, sayı nedir).
   Ölçüm bittiğinde worktree/kopya SİLİNİR, ana ağaç dokunulmamış kalır.
   Ölçülüp REDDEDİLEN hamle de kayda geçer (§4.7 son cümlesi).
3) MALİYET: adayın hangi faza sığdığı (bu gece mi, V1 mi) + dokunacağı dosyalar.

Hakemin ayrıca isim isim istediği iki eksik:
- `recipe_dress_check`: "geometry DIFFERS" sapmasının mm BÜYÜKLÜĞÜNÜ ölç.
  Test yalnız DIFFERS basıyor; sapmayı sen ölç (aracı /tmp'de yaz).
- `golden_check`: sapmanın büyüklük dağılımını bas (kaç satır, max mm, hangi
  parçalar, hangi spec ailesi). `engine/build/golden_dump` diskte hazır.

Kırmızılar: golden_check · style_check · sizechart_source_check ·
recipe_dress_check · contract_check · figure_check

## GİRDİ DOSYALARI
- ENV.md · RULES.md
- GECE/V0-0A.md (kırmızıların ham verisi burada; SAYILARINI DOĞRULA, devralma)
- GECE/log/V0-SEF.ctest.txt (faz-sonrası ctest, 105 koşan / 6 kırmızı)
- engine/ (tests/, CMakeLists.txt, golden-reference.csv, build/)
- contract/ · recipes/

## ÇIKTI
- `GECE/log/V0-0F.aday.txt` — her adayın ham koşu çıktısı (öncesi/sonrası)
- `GECE/V0-0F.md` — altı kırmızı × üç kalem tablosu
  Kanıt olduğu kapı: 4.7 (kırmızı raporlama) + V1'in doğrudan girdisi.

## YASAKLAR
- ANA AĞACA ONARIM COMMİT'İ YOK. `engine/`, `contract/`, `recipes/`,
  `web/` altında tek bayt değişiklikle commit atmak fazı düşürür.
  İşin sonunda `git status --porcelain` bu dizinlerde BOŞ olmalı.
- Pin yenileme, tolerans gevşetme, test devre dışı bırakma: YASAK (ölçebilirsin,
  bırakamazsın).
- Çözüm adayı bulunamayan kırmızıya "aday YOK + denenen şu + neden düştü" yaz;
  uydurma aday yasak.
- `patterns_real/` altındaki satın alınmış PDF'lere dokunma (kalıcı veto).
- "Muhtemelen düzelir" yasak — aday ÖLÇÜLMÜŞ olacak, yoksa aday değildir.

## RAPOR FORMATI (zorunlu)
yapılan (dosya yolu + commit hash) · ölçülen (sayı + onu basan komut) ·
yapılamayan (sebep) · kart dışı fark edilen (dokunma, yaz).
