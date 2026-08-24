# KART V2-A — SÖKÜM HÜKMÜ + DAMAR KALEMLERİ SİCİLE İSİM · PARALEL (V2-B ile)

## NE
Üç iş, sırayla:

(1) **SÖKÜM HÜKMÜ (§6/V2 madde a).** `GECE/V0-0D.md` §1a'nın MENÜ dili saydığı
    **6 dosyanın** ve §1b'nin KARIŞIK saydığı **13 adlı dosyanın** her biri için
    TEK hüküm ver: `BAĞLANDI` (çözüm tablosuna, hangi girdiyle) ya da
    `_LEGACY-ADAYI` (hangi damar detayı Katman 3'te isimle karşılanıyor).
    **Üçüncü statü YOKTUR** — "şimdilik dursun" bir statü değildir.
    Anti-hack: bir dosyayı `_LEGACY-ADAYI` yazmanın bedeli, o dosyanın
    karşıladığı HER damar detayının `contract/vocab-resolution-v1.json`'da
    İSİMLE (resolved ya da dürüst absent) var olmasıdır. Karşılığı yoksa hüküm
    `BAĞLANDI` olamaz ve `_LEGACY-ADAYI` da olamaz → o kalem (3)'e düşer.
    ⚠ Bu kartta HİÇBİR sembol yeniden adlandırılmaz, hiçbir enum silinmez.
    Hüküm bir TABLODUR; sürgünün kendisi kuyruk kartıdır.

(2) **DAMAR KALEMLERİ SİCİLE İSİM (§6/V2 yasası).** `GECE/V0-0A.md` içinde
    "sicilde İSİM olarak bile yok" diye sayılan damar kalemlerini bul (11 kalem)
    ve her birini `contract/vocab-resolution-v1.json` `resolutions`'a **İSİMLE**
    ekle. Statü dürüstçe `absent` kalabilir — ama `absentReason` alanı
    ZORUNLU ve şunu taşımalı: kök sebep + denenen hamle + sonraki aday.
    Amaç: motorun red cümlesi artık AD söyleyebilsin.
    `_sayim` bloğunu yeni sayılarla güncelle (komutla say, elle yazma).

(3) **5 ABSENT OPERATÖRÜN SİCİL SATIRI.** `contract/garment-spec-v2.md:74`
    beşini (`gatheredOverlayLayer` `sleeve` `collarFamily` `skirtFamily`
    `zipperPiece`) zaten ADLA sayıyor. Her biri için o dosyada tek satırlık
    **çapraz referans** ekle: `vocab-resolution-v1.json`'daki hangi girdiye /
    hangi enum eksenine karşılık geliyor, ya da "karşılığı YOK".

## GİRDİ DOSYALARI (isim isim, başkasını açma)
- `ENV.md`, `RULES.md`
- `GECE/V2-R.md` (V2-R kartının çıktısı — Bölüm 3 otorite hükmü BAĞLAYICIDIR)
- `GECE/V0-0D.md` (§1a 6 MENÜ dosyası, §1b tablosundaki 13 adlı dosya, §5)
- `GECE/V0-0A.md` (YALNIZ damar + operatör sicili bölümleri)
- `contract/vocab-resolution-v1.json`
- `contract/primitives-v1.json`
- `contract/garment-spec-v2.md`
- `engine/vocab.json`
- `engine/tests/preset_resolve_check.cpp` (kapının ne şart koştuğunu OKU)

## ÇIKTI (yalnız bu üç yol — başka dosyaya yazmak iş reddi)
- `contract/vocab-resolution-v1.json` (yeni girdiler + `_sayim`)
- `contract/garment-spec-v2.md` (5 operatörün çapraz referans satırları)
- `GECE/V2-A.md` — söküm hüküm tablosu (dosya · dil · hüküm · gerekçe ·
  karşılanan damar kalemleri) + eklenen girdilerin listesi + ölçüm komutları.

Kanıt olduğu kapı: `preset_resolve_check` (§6/V2 kapısı) ve söküm mekaniği (a).

## ZORUNLU DOĞRULAMA (raporda çıktısı olacak)
```
cd /Users/damummyphus/damla_projects_2026/stitchu
ctest --test-dir engine/build -R preset_resolve_check --output-on-failure
```
Bu kart ÖNCESİ ve SONRASI koştur; ikisinin çıktısını `GECE/V2-A.md`'ye yapıştır.
**Sonrası kırmızıysa** eklediğin girdiyi `resolved` yapma — `absent`'a çevir ve
sebebini yaz. Kapıyı gevşetme, `preset_resolve_check.cpp`'ye DOKUNMA.

## YASAKLAR
- `engine/` altına tek bayt yazma (`.cpp` `.hpp` `.json` `CMakeLists.txt` dahil).
  `web/`, `vision-student/`, `recipes/`, `docs/` altına yazma. `GECE/KOSU.md`'ye
  dokunma (7.4).
- Enum SİLME, sembol YENİDEN ADLANDIRMA, `_LEGACY` son eki EKLEME yok — bu kart
  hüküm verir, sürgün yapmaz.
- `absent` bir kalemi kanıtsız `resolved` yazma. `resolved` demenin bedeli
  `preset_resolve_check`'in yeşil kalmasıdır (yukarıdaki komut).
- `GECE/arsiv/` AÇMA. `knowledge/TEKNOLOJI-2026-08-23.md` bu koşuda kanıt değil.
- "Baktım / doğru görünüyor" yasak (RULES 3) — her sayının yanında onu basan komut.

## SÜRE TAVANI
60 dk (dolarsa o ana kadarki tablo commit'lenir, kalan kart olur)

## ETİKET
PARALEL — V2-B ile birlikte koşar; dosya kümeleri kesişmez.
