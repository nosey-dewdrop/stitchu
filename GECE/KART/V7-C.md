# KART V7-C — KENAR KİMLİĞİ: SEVK EDİLEN HATTA DÖRT KENAR AD KAZANIR

ETİKET: SIRALI (V7-D bu kartın çıktısına bağlı) · PARALEL: V7-E, V7-F ile
dosya kesişimi YOK (onlar `GECE/log/` ve `contract/`e yazar)
SÜRE TAVANI: 60 dk — tavana gelirsen O ANA KADARKİNİ COMMIT ET, kalanı raporla.

## ÖLÇÜLMÜŞ ZEMİN (bu koşuda ölçüldü, tekrar ölçme — üstüne inşa et)
- `engine/src/geometry.hpp:40-71` `PatternPiece` **kenar adı TAŞIMIYOR**.
  Sevk edilen artefaktta adlandırılmış kenar = **0**, panel = 4 (kollu üst).
- Bugün oyuk↔kapak eşlemesi ÜÇ TAHMİNLE kuruluyor: parça adı alt-dizgisi
  `"Sleeve"` (`engine/src/validator.cpp:282`), sabit komut indeksi
  `commands[0..2]` (`:289-295`), ve çizilen kenar yerine SKALER
  `bodice.armholeLength` (`:300`, yazan `engine/src/bodice.cpp:509` ve `:625`).
- ★ Bugünkü "0.00mm uyum" bir kenar↔kenar uyumu DEĞİL: `bodice.cpp:509` skaleri
  yazıyor → `engine/src/sleeve.cpp:55` ona uyuyor → `validator.cpp:300` aynı
  skalerle doğruluyor. **Aynı sayının kendisiyle uyumu.**
- SEVK EDİLEN HAT ÖLÇÜLDÜ: `web/js/engine.js:56` → `web/vendor/stitchu-engine.js`
  → `engine/wasm/bindings.cpp:339 draftJSON` → `engine/src/garment.cpp:303,:621`
  → `engine/src/sleeve.cpp SleeveBlock::draft`.
  `grep -c surfacepattern engine/build-wasm.sh` = **0** → yüzey motoru sevk
  EDİLMİYOR. **İşini SEVK EDİLEN hatta yap; `surfacepattern.cpp`'ye DOKUNMA.**

## NE
`PatternPiece`'e **kenar rolü (edge role) kimliği** ekle ve sevk edilen hattın
çizdiği DÖRT kenarı adıyla işaretle:
`armhole_front` · `armhole_back` · `sleeve_cap` · `sleeve_underarm`.
Şart: ad, kenarı ÇİZEN kodun yanında verilir (bodice.cpp / sleeve.cpp), sonradan
tahminle atanmaz. Ad, üretilen JSON artefaktında **görünür** olacak ve
**wasm'da da** çıkacak (native yeşil tek başına yetmez).

Adlandırma, kenarın hangi komut aralığına karşılık geldiğini (başlangıç/bitiş
indeksi ya da nokta listesi) taşımalı ki bir tüketici o kenarın **yay uzunluğunu
hesaplayabilsin**. Skaler uzunluk KOPYALAMA — kenarın kendisi adreslensin.

## ŞARTLAR (pazarlıksız)
1. **GEOMETRİ DEĞİŞMEZ.** `python3 engine/golden-diff.py` (ya da ENV.md'deki
   golden usulü) **bayt-aynı** kalacak. Değişirse işi geri al.
2. **RULES 9:** kırmızı AD kümesi BÜYÜMEYECEK. Açılış kırmızıları (bunlar
   MİRAS, senin işin değil): `style_check · sizechart_source_check ·
   contract_check · figure_check · flat_pattern_agree_check ·
   flat_artifact_census`. Açılış logu: `GECE/log/V7.ctest.opening.txt`
   (113 test, 6 kırmızı). Yeni kırmızı AD doğuruyorsan işi GERİ AL.
3. **RULES 4:** yeni alan opt-in/varsayılan zararsız olacak; mevcut tüketiciler
   kırılmayacak.
4. **§7.5:** en fazla **1 yeni kaynak dosya**. Mümkünse SIFIR — var olan
   dosyaları genişlet. `engine/tools/` altında yüzü aşkın alet var: ÖNCE GREP.
5. **§5.5 ENTEGRATÖR YASASI:** sayısal algoritma uydurma. Yay uzunluğu için
   `engine/src/geometry.hpp` içindeki mevcut `pathLength`/`flattenCubic`
   primitiflerini KULLAN.

## ÇIKTI
- Değişen kaynak dosyalar (engine/src/ + gerekiyorsa engine/wasm/).
- `GECE/V7-C.md`: ne eklendi (dosya:satır) · artefaktta adlandırılmış kenar
  sayısı ÖNCE (0) / SONRA (komut çıktısıyla) · golden bayt-aynılık kanıtı
  (komut + çıktı) · ctest sonucu (`GECE/log/V7-C.ctest.txt`'ye yaz) · wasm
  kanıtı (wasm'dan üretilen artefaktta adların göründüğü komut çıktısı).
- ctest logu: `GECE/log/V7-C.ctest.txt`

Komut: `ctest --test-dir engine/build --output-on-failure`
(önce `cmake --build engine/build -j8`; rebuild gerekirse
`-DCMAKE_BUILD_TYPE=Release` ZORUNLU — boş bırakırsan süit 19s→2684s olur.)

Bittiğinde KENDİN commit et (push etme):
`git add -A && git commit -m "v7-c: name four edges (armhole front/back, sleeve cap, underarm) on the shipped path"`

## YASAKLAR
- `engine/src/surfacepattern.cpp`'ye dokunma (sevk edilmiyor).
- Mevcut testleri DEĞİŞTİRME/gevşetme. Tolerans oynatma.
- `GECE/KOSU.md`, `GECE-KOSUSU-v6.md`, `contract/` ve başka kartlar: dokunma.
- "çalışıyor / doğru görünüyor" YASAK — komut çıktısı koy (RULES 3).

## RAPOR FORMATI
yapılan (dosya yolu + commit hash) · ölçülen (sayı + onu basan komut) ·
yapılamayan (sebep) · kart dışı fark edilen (dokunma, yaz).
