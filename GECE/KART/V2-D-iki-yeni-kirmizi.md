# KART V2-D — COMMIT SONRASI DOĞAN İKİ YENİ KIRMIZI · SIRALI (3/3)

## NE
Şefin 4.3 kanıt koşusu (`ctest --test-dir engine/build --output-on-failure`,
314.99 sn, 108 test) miras dört adı DEĞİL **altı** kırmızı buldu. İki yeni ad:
`bundle_fresh_check` ve `vocab_reference_check`. RULES 9 gereği bu faz bu iki
adla kapanamaz.

**İkisi de COMMIT SONRASI doğdu** ve iki işçinin commit-öncesi ctest'i onları
yapısal olarak göremezdi: her iki kapı da `git log`/HEAD okuyor, yani hükmü
ancak commit var olduktan sonra değişiyor. Bu bir işçi kusuru değil, bir ölçüm
sırası kusuru — ama kırmızı kırmızıdır.

**(1) `bundle_fresh_check`** — çıktısı aynen:
```
FAIL  backend/engine/stitchu-worker.js
      built  : e8b7f19  2026-08-24
      source : 5d649d2  2026-08-24
      STALE BY 1 COMMITS to engine sources (0 days).
```
Kök (şef ölçtü, doğrula): `5d649d2` `engine/wasm/bindings.cpp` +
`engine/src/bodice.cpp`'yi değiştirdi, `build-wasm.sh` koştu,
`backend/engine/stitchu-worker.wasm` DEĞİŞTİ ve commit'lendi
(`git show --stat 5d649d2`), ama `stitchu-worker.js` GLUE'su bayt-aynı çıktı —
git değişmeyen dosyaya commit yazamaz, kapı da "built commit"i
`git log -1 -- <dosya>`'dan okuyor. Yani kapı, glue'nun değişmediği HER
motor değişikliğinde kırmızı düşmeye mahkûm. Bu kapı bir T-turu kapısıdır,
gevşetilmez: kökten çöz. ADAY (kendin ölç, daha iyisini bulursan gerekçesini
yaz): `engine/build-wasm.sh` glue'yu kopyalarken başına tek satırlık kaynak
damgası yazsın (üreten commit + tarih), böylece motor kaynağı değiştiğinde
glue de değişir ve kapının okuduğu "built commit" gerçeği söyler. Damga
JS yorumu olacak, glue'nun çalışmasına dokunmayacak.
⚠ Aynı sınıftan İKİNCİ bir kalem ölçüldü ve `5d649d2`'de açık kaldı:
`web/vendor/stitchu-engine.js` yeni baytla değişti ama `web/js/engine.js:56`
hâlâ `?v=136`. ENV.md'nin GOTCHA satırı tam bunu anlatıyor. `?v` damgasının
tek kaynağı `engine/tools/site-version.mjs` — ÖNCE onu oku (§7.5), deseni
yeniden icat etme.

**(2) `vocab_reference_check`** — çıktısı aynen:
```
taban commit  : b799748  ·  taban toplam 10416  ·  bugun 10418 (delta +2)
  FAIL ARTTI  eksen ADI   sleeveCap   144 -> 146  (+2)
```
Kök (şef ölçtü, doğrula): iki artış `engine/wasm/bindings.cpp:125` ve `:131` —
ikisi de YORUM satırı, onarılan kusuru ölçülmüş örneğiyle anlatıyor
(`sleeveCap=1.5 drafted sleeveCap=1 byte-identically` / `invalid sleeveCap '1.5'
(valid: …)`). Sözlüğün kendisi büyümedi: `git diff b799748..HEAD -- engine/vocab.json`
boş, 37 eksen / 132 değer.
Karar SENİN ve ÖLÇÜMLE gerekçelendirilecek. İki yol var, üçüncüsü yok:
 (a) **Tabanı bilinçli yeniden kes** — kapının kendi çıktısının önerdiği yol
     ("Bu gerçekten bir kapsam kararı ise: tabanı elle yeniden kes ve
     gerekçesini commit mesajına yaz"). Şartı 4.6: eski değer, yeni değer,
     ölçülmüş gerekçe ve deltanın SATIR SATIR kaynağı commit mesajına girer.
 (b) İki yorumu ekseni adlandırmadan yeniden yaz. ⚠ Bu, ölçülmüş örneği
     dokümandan silmek demektir; seçersen bedelini raporda yaz.
**KAPIYI GEVŞETME:** `vocab_reference_check.sh`'in sayım yöntemine, kapsamına
ya da yorum satırlarını hariç tutacak bir filtreye DOKUNMA — bu, kapıyı
kendi ilk vakasında sakatlamak olur (7.1).

## GİRDİ DOSYALARI (isim isim)
- `ENV.md`, `RULES.md`
- `GECE/V2-C.md` (ne yapıldığı + ölçümler), `GECE/V2-B.md` §2 (ratchet yasası)
- `engine/build-wasm.sh`, `backend/engine/stitchu-worker.js`
- `engine/tests/bundle_fresh_check.*` (kapının kendisi — yalnız OKU)
- `engine/tests/vocab_reference_check.sh`, `engine/tests/vocab-reference-baseline.json`
- `engine/wasm/bindings.cpp` (yalnız `:120-135` yorum bloğu)
- `engine/tools/site-version.mjs`, `web/js/engine.js`, `web/vendor/` (yalnız `?v` işi)
- `engine/vocab.json` (yalnız OKU)

## ÇIKTI (yalnız bu yollar)
- `engine/build-wasm.sh` · `backend/engine/stitchu-worker.js` (yeniden üretilmiş)
- `engine/tests/vocab-reference-baseline.json` (yalnız (a) yolunu seçersen)
  ya da `engine/wasm/bindings.cpp` yorum bloğu (yalnız (b) yolunu seçersen)
- `web/js/engine.js` (yalnız `?v` damgası) + `engine/tools/site-version.mjs`'in
  yazdığı yollar
- `GECE/V2-D.md` · `GECE/log/V2-D.*`

## ZORUNLU KANIT
1. **TAM ctest, COMMIT'TEN SONRA.** Bu kartın tek en önemli şartı: değişikliği
   commit'le, SONRA `ctest --test-dir engine/build --output-on-failure` koş.
   Commit öncesi koşu bu iki kapı için GEÇERSİZDİR. Hedef: kırmızı AD kümesi
   TAM OLARAK `style_check` · `sizechart_source_check` · `contract_check` ·
   `figure_check` (4 ad). Log: `GECE/log/V2-D.ctest.after.txt`.
2. **MUTASYON (4.5)** — `bundle_fresh_check` için: damgayı koyduktan sonra
   `engine/src/` altında bir yorum satırı değiştir + commit + `build-wasm.sh`
   koşma → kapı KIRMIZI düşmeli; geri alınca yeşil. `GECE/log/V2-D.mutasyon.txt`.
3. `./engine/build-wasm.sh` exit kodu + `node engine/tools/wasm-baseline.mjs`
   çıktısı raporda (taban bantları: `draftJSON` medyan ≤1.031ms, `gradeJSON`
   ≤8.800ms, native↔wasm ≤1e-4mm).
4. Çalışma ağacı temiz bitecek; `git status --porcelain` raporda.
   `patterns_real/` altındaki 3 takipsiz yola DOKUNMA (telifli, 7.2).

## YASAKLAR
- Kapı gevşetmek, kapsam daraltmak, filtre eklemek (7.1). Mevcut testlerin
  kaynağını DEĞİŞTİRME.
- `engine/src/`, `contract/`, `vision-student/` altına yazma.
- Yeni kaynak dosya yaratma: bu kartın payı SIFIR (§7.5, fazın payı doldu).
- Yeni bağımlılık (npm/pip install) YOK.
- "Baktım / çalışıyor" (RULES 3).

## SÜRE TAVANI
60 dk. Dolarsa: kapanan kapıyı commit'le, kalanı 4.7 formatında raporla.

## ETİKET
SIRALI (3/3).
