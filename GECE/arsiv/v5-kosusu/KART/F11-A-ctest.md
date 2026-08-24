# KART F11-A — KIRMIZI KÜME YENİDEN ÖLÇÜLÜR (isci-motor)

## NE
HEAD'de tam ctest koş; kırmızı test ADLARINI F0 tabanıyla karşılaştır ve
"yeni kırmızı ad doğdu mu" sorusunu isim isim cevapla.

## GİRDİ DOSYALARI
- `GECE/log/F0v3.red.now`   (F0'ın bu koşuda ölçtüğü taban, 7 ad)
- `GECE/log/F0.red.before`  (aynı 7 ad)
- `engine/CMakeLists.txt`

## ÇIKTI (dosya yolu + kapı adı)
- `GECE/log/F11.ctest.txt`   — tam ctest çıktısı
- `GECE/log/F11.red.after`   — kırmızı test adları, satır satır, ALFABETİK sıralı
- `GECE/log/F11.reddiff.txt` — `diff GECE/log/F0v3.red.now GECE/log/F11.red.after` çıktısı
- `GECE/F11-A.md`            — tutanak

## ÖNCE GREP
1. `git rev-parse HEAD` ve `git status --porcelain` → ağacın 962407d'de ve
   temiz (GECE/ dışında) olduğunu ÖLÇ ve tutanağa yaz.
2. `GECE/kapi.sh` içinde K1'in kırmızı adları NEREDEN okuduğuna bak
   (`Testing/Temporary/LastTestsFailed.log`). Aynı kaynağı kullan ki
   sayım kapıyla aynı yöntemle olsun.
3. `GECE/kapi.sh` K1'in "ortam" bölümü: `engine/dist`, `engine/.venv-dxf`,
   `engine/pattern-bridge/.venv`, `engine/tools/node_modules`,
   `core/third_party` yoksa 16 SAHTE kırmızı düşüyor. Sen ana ağaçta
   koşuyorsun, bunlar zaten yerinde — ama VAR olduklarını ölç ve yaz.

## NASIL
- Build: `cmake --build engine/build -j8` (configure gerekirse
  **`-DCMAKE_BUILD_TYPE=Release` ZORUNLU** — boş bırakılırsa engine_check
  19s yerine 2684s sürüyor, ölçülmüş tuzak).
- `ctest --test-dir engine/build --output-on-failure` → `GECE/log/F11.ctest.txt`
- Toplam test sayısını ve kırmızı sayısını tutanağa yaz.

## TUTANAKTA CEVAPLANACAK
- Toplam test kaç? (F0 96, F9 98 demişti — HANGİSİ, ve neden değişti?)
- Kırmızı ad kümesi tabanla aynı mı? diff BOŞ mu?
- Yeni kırmızı ad sayısı kaç? (§0.6: hedef 0)
- F0'ın 7 kırmızısından kaçı kapandı? (Cevap muhtemelen 0 — öyleyse öyle yaz.)

## YASAKLAR
- Hiçbir kırmızıyı KAPATMAYA çalışma. Bu bir ölçüm kartı.
- `engine/`, `contract/`, `web/` altında HİÇBİR dosyayı değiştirme.
- Tolerans/eşik oynatma yok (§0.12).
- "Baktım / geçiyor görünüyor" yasak — her sayı bir dosya yolundan gelir (§0.2).
- Commit ATMA.

## SÜRE TAVANI
maxTurns 40. ctest ~265 sn sürüyor, sabırla bekle, arka plana atıp unutma.
