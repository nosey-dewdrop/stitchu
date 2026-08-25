# V6-E — `edit_locality_check`'in DİŞSİZ YÖNÜ ONARILDI (M1 açığı)

Ham mutasyon çıktısı: `GECE/log/V6-E.mutasyon.txt`. Bu dosyadaki her sayı orada
ÖNCE/SONRA exit koduyla duruyor. Üç mutasyonun üçü de GERİ ALINDI; her geri
almadan sonra dosyalar yedekle birebir aynı (`diff` boş) ve test exit 0.

## 0. HÜKÜM (exit kodu + çıktı satırı)

Onarımdan sonra, mutasyonsuz koşu:

```
$ node engine/tests/edit_locality_check.mjs
OK   A1 sessiz atlama 1 <= tavan 1
OK   tüm-spec-yeniden-yazma 10/12 vakada LOKALLİK İHLALİ olarak yakalandı (taban 10)
OK   ilan edilen granülarite 'bayt' (beklenen 'bayt')
OK   Skirt Front: tek koordinat 224.9 -> 224.901 (0.001mm) İHLAL olarak görüldü
OK   kontrol: oynatmasız kopya 3 panelde 0 ihlal (beklenen 0, checked>0)
edit_locality_check: hepsi yeşil
EXIT=0
```

V6-B'de kırmayan M1 artık **exit 1** basıyor (aşağıda M1′). Yeni mutasyonların
üçü de kırıyor. Kırılmayan mutasyon YOK.

## 1. M1 KENDİM KOŞULDU — V6-B DOĞRU (kırmıyordu)

Onarım YAPILMADAN önce, `pieceBytes = JSON.stringify(p)` → `'PANEL'`:

```
     (yakalanmadı: yaka oyuğunu değiştir (V))
     (yakalanmadı: kısalt (kol kısa))
OK   tüm-spec-yeniden-yazma 9/12 vakada LOKALLİK İHLALİ olarak yakalandı
edit_locality_check: hepsi yeşil
EXIT=0
```

(log ADIM 2). V6-B'nin 10→9 ölçümü aynen çıktı. Geri alındıktan sonra EXIT=0.

## 2. KÖK TEŞHİS — TEK CÜMLE, DOSYA:SATIR

`engine/tests/edit_locality_check.mjs:75` (onarım öncesi hâli)
`line(antiCaught > 0, ...)` — **eşik MUTLAK SIFIR'dı**: A1'in yakaladığı vaka
sayısı 12'nin 1'ine kadar düşse bile kapı yeşil kalıyordu, dolayısıyla
karşılaştırma bayttan panel varlığına indirildiğinde kaybolan 1 yakalama
(10→9) hiçbir mandalı ateşlemiyordu; üstelik hiçbir mandal **karşılaştırmanın
granülaritesini** ölçmüyordu, sadece sonucunu sayıyordu.

## 3. ONARIM (eşik TABANLANDI, gevşetilmedi)

**Eşik değişikliği — eski / yeni / gerekçe (★4.6):**

| mandal | eski | yeni | gerekçe |
|---|---|---|---|
| A1 | `antiCaught > 0` (mutlak 0 tabanı, 12'de 1 yeter) | `antiCaught >= A1_FLOOR`, `A1_FLOOR = 10` + `antiCaught > A1_FLOOR` ise "TABAN BAYAT" KIRMIZI | taban bugün ÖLÇÜLEN sayıya çakıldı; ratchet — yalnız yükselir, düşürmek ya da aşmak testi kırar |
| A1 sessiz atlama | ölçülmüyordu (`continue`, sessiz) | `antiSkipped.length <= A1_SKIP_CAP`, `A1_SKIP_CAP = 1`, atlananlar ADIYLA basılıyor | atlanan vaka yargı üretmiyor; sayısı artarsa kapının yüzeyi sessizce daralır |
| A4 (YENİ) | yoktu | `LOCALITY_GRANULARITY === 'bayt'` **ve** dokunulmayan panelde 0.001mm oynama İHLAL basmalı **ve** oynatmasız kopyada 0 ihlal | granülarite artık ilan ediliyor (`spec-diff.mjs`) ve ilanın kendisi ölçülüyor |

Taban dosyada: `engine/tests/edit_locality_check.mjs`, `const A1_FLOOR = 10` /
`const A1_SKIP_CAP = 1`, yanlarında ölçüm tarihi ve yakalanmayan iki vakanın adı.
Granülarite ilanı: `engine/tools/spec-diff.mjs`, `export const LOCALITY_GRANULARITY = 'bayt'`
(aynı yerde `pieceBytes` de export edildi ki denetim kopyayı değil GERÇEK
karşılaştırma fonksiyonunu ölçsün).

**Hiçbir vaka silinmedi, hiçbir tolerans büyütülmedi, hiçbir vaka skip edilmedi**
— 12 vaka aynı 12 vaka, üç eski mandal (A1/A2/A3) yerinde.

## 4. MUTASYON TABLOSU (§4.5) — hepsi geri alındı

| | mutasyon | dosya | ÖNCE | SONRA | hüküm |
|---|---|---|---|---|---|
| **M1′** | karşılaştırma bayttan panel varlığına indirildi: `pieceBytes = JSON.stringify(p)` → `'PANEL'` | `engine/tools/spec-diff.mjs` | exit 0, `hepsi yeşil` | exit **1**, `2 KIRMIZI` — A1 `9/12 … TABANIN ALTINA DÜŞTÜ` + A4 `0.001mm GÖRÜLMEDİ — karşılaştırma bayt değil` | ✅ **KIRDI** (V6-B'de KIRMIYORDU) |
| **M2′** | dokunulmayan panele üretim sonrası **+0.001mm** (ilk `^Skirt\|Sleeve` panelinin ilk `x`'i, `runEdit` içinde) | `engine/tools/spec-diff.mjs` `runEdit` | exit 0 | exit **1**, `6 KIRMIZI` (`Skirt Front: baytları değişti ae01610930c6 -> 3f66b7e1e632`) | ✅ KIRDI — incelik mikron mertebesinde |
| **M3′** | A1 tabanı elle düşürüldü: `A1_FLOOR = 10` → `9` | `engine/tests/edit_locality_check.mjs` | exit 0 | exit **1**, `1 KIRMIZI` — `A1 TABANI BAYAT: ölçülen 10 > taban 9 … taban yalnız yükselir` | ✅ KIRDI — ratchet çalışıyor |

Her satırdan sonra iki dosya da yedekten geri kondu; logda üçünün arkasından
`-- GERI ALINDI: diff /tmp/v6e-bak => []` ve `geri alma sonrasi EXIT=0` duruyor.

## 5. ÇELİŞKİ ÖLÇÜLDÜ — 10/12, İKİ VAKA ADIYLA

Bugünkü sayı **10/12**, V6-B ile aynı. Onarım bu sayıyı DÜŞÜRMEDİ (taban zaten
10'a çakılı). Yakalanmayan iki vaka ilk kez ayrıştırıldı — **ikisi ayrı sebep**:

1. **`yaka oyuğunu değiştir (V)`** — gerçekten yakalanmıyor. Rewrite kipinde
   bölge dışı iki panel (Skirt Back, Skirt Front) bayt-aynı kalıyor; ihlal yok.
   V6-B bunu logda görüyordu.
2. **`manşet ekle`** — *yakalanmıyor değil, HİÇ YARGILANMIYOR.* Rewrite kipi
   `sleeveStyle`'ı düşürüyor, motor spec'i reddediyor:
   `invalid spec: cuffStyle requires a sleeve: set sleeveStyle to 'straight' or 'balloon'`.
   Eski kod `if (before.error || after.error) continue;` ile bunu **sessizce**
   atlıyordu; V6-B'nin tablosunda bu vaka hiç görünmüyor. Artık ADIYLA basılıyor
   ve sayısı `A1_SKIP_CAP = 1` ile tavanlandı.

Yani "10/12" aslında **10 yakalandı + 1 yakalanmadı + 1 hiç koşulamadı**.

## 6. KAPI KOŞUMU (kart: yeni kırmızı AD doğurmadı mı)

```
$ ctest --test-dir engine/build -R "edit_locality|spec_diff|specv2" --output-on-failure
1/2 Test  #92: specv2_check .....................   Passed    0.04 sec
2/2 Test #112: edit_locality_check ..............   Passed    0.14 sec
100% tests passed, 0 tests failed out of 2
CTEST EXIT=0
```

`spec_diff` adında kayıtlı bir ctest testi YOK (regex 2 test eşliyor); bu bir
bulgu, kart dışı, dokunulmadı.

## 7. KART DIŞI FARK EDİLENLER (dokunulmadı)

1. **A1'in `untouchable` boş kontrolü hâlâ sessiz olabilir.** Bugün hiçbir vaka
   `untouchable listesi boş` yüzünden atlanmıyor (12'de 0), ama `global` bölgeli
   bir alan (garment/shaping/fabric/photoFabric) vaka listesine eklenirse
   sessizce atlanır — şimdi en azından ADIYLA basılıyor ve tavana sayılıyor.
2. **A4 tek bölgede (`neckZone`) ve tek panelde ölçüyor.** Granülarite kanıtı
   `Skirt Front` üstünde; diğer bölgelerin karşılaştırması aynı fonksiyonu
   kullandığı için kapsanıyor, ama bölge başına ayrı kanıt YOK.
3. **V6-B'nin "kapı `engine/dist/` gitignore'da" bulgusu ayakta.** `git check-ignore`
   koşulmadı ama `engine/dist/stitchu-engine.js` diskte var ve HEAD'de yok; temiz
   bir checkout'ta bu kapı motoru bulamaz. **Kart dışı, onarılmadı.**
4. **Yargılanan yüzey hâlâ dar:** tek beden (`BODY` sabit), tek taban spec (`BASE`).
   V6-B'nin 3. maddesi geçerliliğini koruyor.
5. Çalışma ağacında bana ait olmayan kirli/izlenmeyen dosyalar var
   (`contract/anchors-v1.json`, `engine/tools/gen-anchors.mjs`, `patterns_real/*`)
   — paralel işçilerin, DOKUNULMADI, commit'e girmedi.
