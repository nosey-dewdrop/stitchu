# KART V2-C — SEVK EDİLEN HATTIN İKİ ÖLÇÜLMÜŞ KUSURU · SIRALI (2/2)

## NE
Sözlüğe girişin bedeli ÇİZEN bir panel zinciridir ve reddin bedeli AD SÖYLEYEN bir
hatadır. Sevk edilen hatta ikisi de bugün ölçülmüş şekilde bozuk. İkisini onar,
ikisini de kırılabilir bir kapıyla mühürle.

**(1) SESSİZ İKAME — `engine/wasm/bindings.cpp:94`.** `intField()` içindeki
`v.as<int>()`, değer `parseEnumInt`'e ULAŞMADAN kesiri aşağı kırpıyor. Ölçüldü
(`GECE/V0-0D.md` §4a, sevk edilen bayt üstünde): `sleeveCap=1.5` ile `sleeveCap=1`
BAYT AYNI sha; `0.1/0.9 → 0`, `2.999 → 2`, `-0.5 → 0`. Hata yok, uyarı yok,
`issues` artmıyor. Bu, `RULES.md` değişmez 1'in ("Unknown or unsupported enum
value → Err. NEVER silently drop or coerce") sevk edilen hatta ihlalidir ve
`bindings.cpp:82` yorumu bunun TERSİNİ iddia ediyor. 26 int-enum ekseninin
hepsinde geçerli (`bindings.cpp:146-172`). Doğru davranış: tam sayı olmayan /
aralık dışı değer → ADIYLA hata (string eksenlerin `4b`'de ölçülmüş dürüst
davranışının aynısı: `invalid <eksen> '<değer>' (valid: …)`), sessiz kırpma YOK.
Yokluk (undefined/null) hata DEĞİLDİR, varsayılan kalır.

**(2) `collarType` 1..6 NaN BASIYOR — yaka ailesi sevk edilen hatta KIRIK.**
`draftJSON` çıktısı `"x":nan,"y":nan` içeriyor; bu geçersiz JSON, tarayıcıda
`JSON.parse` fırlatıyor (`SyntaxError: Unexpected token 'a'`). 5 ayrı taban
spec'te doğrulandı, hepsinde 8 adet nan; `collarType=0` temiz
(`GECE/V0-0D.md` §5 madde 1). KÖK SEBEBE in — NaN'ı kırpma, gizleme,
`isfinite` filtresiyle süpürme. Kök sebep bu karta sığmıyorsa: sebebi ölçüp
yaz (hangi fonksiyon, hangi satır, hangi girdi), kapıyı YİNE kur ve kapının
kırmızı kalmasını `GECE/V2-C.md`'de 4.7 formatında (kök teşhis + en az bir
ÖLÇÜLMÜŞ çözüm adayı) raporla. `contract/vocab-resolution-v1.json`'da
`collarType`ın 6 değeri `resolved` yazıyor; çizmeyen bir `resolved` yalandır.

## GİRDİ DOSYALARI (isim isim)
- `ENV.md`, `RULES.md`
- `GECE/V0-0D.md` §4a, §4b, §4d, §5 madde 1 ve 2 (ölçüm + tekrar komutları)
- `engine/wasm/bindings.cpp`, `engine/src/specparse.hpp`, `engine/src/vocab.gen.hpp`
- `engine/src/collar.cpp`, `engine/src/collar.hpp`, `engine/src/garment.cpp`
- `engine/vocab.json`, `contract/vocab-resolution-v1.json` (yalnız OKU)
- `engine/tests/collar_check.cpp`, `engine/tests/collar_lies_flat_check.cpp`,
  `engine/tests/dxf_wasm_parity_check.mjs`, `engine/tests/recipe_wasm_parity_check.mjs`
  (emsal desen — ÖNCE oku, wasm'ı node'dan çağırma usulünü yeniden icat etme, §7.5)
- `engine/build-wasm.sh`, `engine/CMakeLists.txt` (V2-B2 bitti, TEK sahibi sensin)
- `engine/tools/wasm-baseline.mjs` (taban bantları burada ölçülüyor)

## ÇIKTI (yalnız bu yollar)
- `engine/wasm/bindings.cpp` (+ gerekiyorsa `engine/src/specparse.hpp`)
- `engine/src/collar.cpp` / `.hpp` (+ NaN'ın kökü başka dosyadaysa O dosya —
  hangi dosyaya dokunduğunu raporun ilk satırında yaz)
- `engine/tests/wasm_spec_honesty_check.mjs` (TEK yeni kaynak dosya; iki kusuru
  da yargılar: (a) 26 int ekseninde ara değer ADIYLA reddediliyor mu,
  (b) `collarType` 0..6'nın çıktısı geçerli JSON ve NaN'sız mı)
- `engine/CMakeLists.txt` (tek `add_test` satırı — kapı ancak yeşilse bağlanır)
- `GECE/V2-C.md` · `GECE/log/V2-C.*`

## ZORUNLU KANIT
1. **WASM PARİTESİ (§4.1):** dokunulan üretim yolu node üzerinden wasm modülüyle
   koşulacak. `engine/build-wasm.sh` yeniden koşacak (exit kodunu rapora yaz);
   native yeşil + wasm patlak = KIRMIZI.
2. **BOŞ TEST (4.2, birincil usul):** yeni kapı faz-öncesi DERLENMİŞ wasm'a
   (`engine/dist/stitchu-engine.js`'in bugünkü hâlinin kopyası) karşı koşturulacak
   ve KIRMIZI düşecek. Log: `GECE/log/V2-C.bostest.txt`.
3. **MUTASYON (4.5):** kapı başına en az bir kasıtlı bozma → KIRMIZI, geri alınca
   → YEŞİL. `GECE/log/V2-C.mutasyon.txt`.
4. **TABAN BANTLARI (§4.1, sessizce aşılamaz):** `node engine/tools/wasm-baseline.mjs`
   koş; `draftJSON` medyan **1.031 ms** (p95 1.338) · `gradeJSON` **8.800 ms** ·
   native↔wasm en kötü **1e-4 mm**. Aşıyorsan 4.6 prosedürü (eski/yeni değer +
   ölçülmüş gerekçe) olmadan geçemezsin.
5. **ctest tam koşusu:** miras kırmızı AD kümesi — `style_check` ·
   `sizechart_source_check` · `contract_check` · `figure_check` — BÜYÜYEMEZ
   (RULES 9). `golden_check` byte-identical kalacak; kalmıyorsa DUR ve raporla,
   mühür yenileme senin işin DEĞİL. Log: `GECE/log/V2-C.ctest.after.txt`.
6. Çalışma ağacı temiz bitecek; `git status` çıktısı raporda.

## YASAKLAR
- Kapıyı gevşetmek, NaN'ı `isfinite` filtresiyle süpürmek, ara değeri "yuvarla"
  diye meşrulaştırmak (7.1).
- `engine/tests/` altındaki MEVCUT testleri değiştirmek; `preset_resolve_check.cpp`,
  `vocab_reference_check.sh`, `vocab_source_check.sh` dosyalarına dokunmak.
- `engine/vocab.json`'a değer eklemek/silmek (bijection kapısı, `V2-A.md` §2.2).
- Yeni bağımlılık (npm/pip install) YOK. Çekirdek sayısal algoritma UYDURMA (§5.5).
- "Baktım / çalışıyor" (RULES 3): her sayının yanında onu basan komut.

## SÜRE TAVANI
60 dk. Dolarsa: çalışan parçayı commit'le, kalanı `GECE/V2-C.md`'ye kart taslağı
olarak yaz. İki kusurdan yalnız biri kapandıysa bu BAŞARISIZLIK DEĞİLDİR — kapanan
kapanır, kapanmayan 4.7 formatında raporlanır.

## ETİKET
SIRALI (2/2) — V2-B2 commit'lendikten SONRA açılır.
