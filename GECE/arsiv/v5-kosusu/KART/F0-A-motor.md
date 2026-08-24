# KART F0-A — MOTOR ÖLÇÜMÜ (paralel set, işçi 1/4)

## NE
Temiz ağaçta ctest'i koştur, operatör sicilini say, damar yüzdesini hesap
yöntemiyle birlikte ölç. HİÇBİR ŞEYİ DÜZELTME — bu kart sadece ölçer.

## GİRDİ DOSYALARI (sadece bunlar)
- engine/ (build + ctest)
- engine/build/Testing/Temporary/LastTestsFailed.log
- GECE/log/F0.red.before   (21 Ağu tabanı, 7 ad)
- contract/garment-spec-v2.json
- ANAYASA.md  (damar detayları listesi için grep, tamamını okuma)
- engine/wasm/bindings.cpp, engine/src/garment.hpp  (sevk edilen hat)

## ÖNCE GREP
- `grep -n "shipped\|flagged\|absent" contract/garment-spec-v2.json`
- `grep -c "surfacepattern" engine/wasm/bindings.cpp`
- ctest ADLARINI dokümandan DEĞİL, LastTestsFailed.log'dan al.

## YAPILACAK
1. Temiz worktree'de tam ctest: kaç test toplam, kaçı kırmızı, İSİM İSİM.
   `GECE/log/F0.red.before` ile karşılaştır; fark varsa sebebini ölç
   (bayat build cache mi, gerçek regresyon mu). Çıktıyı
   `GECE/log/F0v3.ctest.txt` ve kırmızı adları `GECE/log/F0v3.red.now` dosyasına yaz.
2. Operatör sicili: contract/garment-spec-v2.json içinde shipped / flagged /
   absent SAYILARI ve absent ADLARI. Ayrıca ANAYASA damar detaylarından
   (fiyonk, büzgü/shirring, mini-düğme, fırfır/volan/peplum, lace-up, dantel,
   kol ailesi, yaka ailesi, etek ailesi) hangileri sicilde İSİM olarak
   bile YOK — adıyla listele (§0.3: red cümlesi eksik operatörü adıyla söyler).
3. DAMAR YÜZDESİ: bu damar detaylarının kaç yüzdesi bugün SEVK EDİLEN
   (`garment`) hatta üretilebiliyor? HESAP YÖNTEMİNİ açıkça yaz
   (payda ne, pay ne, "üretilebilir" kriteri ne) — F11 aynı yöntemle
   yeniden ölçebilmeli. Ayrıca flat yolu için aynı hesabı ayrı ver.

## ÇIKTI
`GECE/F0-A.md` — her sayının yanında dosya yolu + komut. Kapı adı: yok
(bu kart ölçüm kartıdır, kapı kurmaz).

## YASAKLAR
- Hiçbir testi, kaynağı, contract'ı DÜZELTME. Kırmızıyı kapatmaya çalışma.
- Commit ATMA.
- "muhtemelen / görünüyor / baktım" yazma. Sayı yoksa "ÖLÇÜLMEDİ" yaz.
- Docs/reports/Logs/HEDEF.md okuma; oradan sayı devralma (§0.1).

## SÜRE TAVANI
maxTurns 40 (tanımdaki varsayılan). Tur biterse o ana kadarki ölçümü
GECE/F0-A.md'ye yaz ve kalan işi dosyanın sonunda "KALAN İŞ" diye bırak.
