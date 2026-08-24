# KART F11-C — DAMAR YÜZDESİ YENİDEN ÖLÇÜLÜR + İKİ DOĞRU TEKE İNER (isci-motor)

## NE
F0'ın damar yüzdesini AYNI yöntemle yeniden ölç, ve F0'ın kendi içindeki
iki çelişen damar sayısını (%0 ve %95.2) tek doğruya indir.

## ÖLÇÜLMÜŞ ÇELİŞKİ (bu kartın asıl işi budur)
Aynı gecenin iki tutanağı iki ayrı sayı veriyor:
- `GECE/F0.md:93`  → **"DAMAR YÜZDESİ = %0 (satılabilir çıktı ölçüsüyle)"**
- `GECE/F0-A.md:241` → **"DAMAR YÜZDESİ (garment) = 20/21 = %95.2"**
- `GECE/F0-A.md:303` → flat %81.0 · `:327` → surfacepattern %11.9
- `GECE/KOSU.md` "DEVRALDIĞI ÜÇ SAYI" → **DAMAR = %0**
§0.1: iki doğru bırakılmaz. Hangisi hangi soruyu ölçüyor, ADIYLA ayır.

## GİRDİ DOSYALARI
- `GECE/F0-A.md` §3.1 (satır ~172'den itibaren) — **hesap yöntemi F11 aynen
  tekrarlasın diye yazılmış**, PAYDA 21 kalem, ANAYASA.md satır çıpalı
- `GECE/F0-A.md` §3.2/3.3 tabloları (garment / flat / surfacepattern puanları)
- `GECE/F0.md` §2 "DAMAR TABLOSU" ve §"DAMARIN KAÇ YÜZDESİ ÜRETİLEBİLİYOR"
- `ANAYASA.md` (satır 42-44 ve "NE YOK" listesi — `grep -n` ile, bütün okuma)
- `contract/garment-spec-v2.json`
- `engine/wasm/bindings.cpp`

## ÇIKTI
- `GECE/F11-C.md` — tutanak

## ÖNCE GREP
- `grep -c surfacepattern engine/wasm/bindings.cpp`
- `grep -n "garment.hpp" engine/wasm/bindings.cpp`
- `grep -n "_statuses\|shipped\|absent" contract/garment-spec-v2.json | head -40`
Bunlar F0-A §3.0'ın dayanağı. Bugün de aynı çıkıyor mu, ÖLÇ.

## CEVAPLANACAK
1. **KIMILDADI MI?** Ağaç `962407d`'de ve kod değişmedi (F11-A doğruluyor).
   Öyleyse damar yüzdesi F0'ınkiyle AYNI çıkmalı. Aynı mı? Değilse NEDEN —
   yöntem mi kaydı, F0 mı yanlış saydı? Kımıldamadıysa **açıkça yaz**:
   "kımıldamadı, çünkü bu koşuda ana dala tek satır kod girmedi."
2. **İKİ SAYI, İKİ SORU.** %0 ile %95.2 farklı şeyleri ölçüyor:
   - biri "motor bu detayı ÇİZEBİLİYOR mu" (yetenek)
   - diğeri "alıcı bunu SATIN ALABİLECEĞİ bir nesne olarak alıyor mu" (sevkiyat)
   Hangisi hangisi, ADIYLA yaz. İkisine de AYRI AD ver (ör.
   "damar-yetenek %" ve "damar-sevkiyat %"). Bundan sonra KOSU.md'de tek
   satırda hangi ad taşınacak, gerekçesiyle öner.
3. **HAT VARSAYIMI (§0.14) hâlâ geçerli mi?** `bindings.cpp` → `garment.hpp`,
   `surfacepattern` 0 hit. Bugün de öyle mi? Öyleyse doğrula; değilse söyle.
4. **PAYDA 21 SAĞLAM MI?** F0-A "fırfır/volan/peplum"u ikiye bölmüş. Bölme
   gerekçesi ("ayrı motor operatörleri") ANAYASA.md'de duruyor mu, yoksa
   F0'ın kendi yorumu mu? Yorumsa bunu işaretle.

## YASAKLAR
- `ANAYASA.md`'yi BÜTÜN OLARAK OKUMA — `grep -n` ile satır çek (§2 context hijyeni).
- Yeni damar kalemi İCAT ETME. PAYDA F0'ınki, 21 kalem.
- Puanı yukarı yuvarlama, "yakında olur"u puan sayma. Sicilde `absent` olan
  operatör 0 puandır ve red cümlesi onu ADIYLA söyler (§0.3).
- `engine/ contract/ web/` altında dosya değiştirme. Bu ölçüm kartı.
- Commit ATMA.

## SÜRE TAVANI
maxTurns 40.
