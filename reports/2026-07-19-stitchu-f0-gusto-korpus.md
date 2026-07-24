# stitchu F0 — GUSTO KORPUSU + kalibrasyon kanıtı
2026-07-19. DEVAM-FASHION zinciri F0'ın ölçü temeli. Beş kaynaktan ölçülebilir bant çıkarıldı, `contract/gusto-corpus.json` DONDURULDU (F1-F3 salt-okunur), `gusto-lint.mjs` mevcut flat'lerde koşup ayırt edici puan üretti (kalibrasyon kanıtı). 0 API çağrısı, motora dokunulmadı.

## BEŞ KAYNAK → BANT
| kaynak | dosya | çıkarılan ölçü |
|---|---|---|
| 1. Etsy emsal paketleri | benchmark-58/dress_patterns/ (2/4/12/13/24 sayfa), bugra-ref/ | parça bandı (bluz 3-5, elbise 4-8, etek 2-4), sayfa bandı (A4-multi 8-24, A0 1-2, A1 1-4), kesim dili (cut 1 on fold / cut 2 / cut 1 pair) |
| 2. vision terim-İD frekansı | dataset/vocab-frequency.md + vocab-canonical.json + contract/terms.json | 51 terim (29 drawable / 22 honest), yüksek-frekans gramer (dropped shoulder 63, patch pocket 37, princess seam 10, gathered 10, peplum 6...) |
| 3. flat-engine prototip dili | engine/flat-engine/styles.json + _engine-full.mjs | shared param bantları (bustProject 0-1 tipik 0.4-0.6, waistNip 0-0.15, skirtFull 1-3), own param (gatherRatio 1.8-3.0, strapLen 9-27), ink rejimi (minimal/orta/full → fold sayısı) |
| 4. flat SVG çıktıları | web/patterns/svg/*-flat.svg + vintage6070/ (32 dosya) | çizgi hiyerarşisi 3 katman (2.0 outline / 1.4 iç yapı / 1.0 işaret), navy #1f3a5f, seam #5c7aa0, viewBox front+back 496 genişlik |
| 5. 60s/70s silüet aileleri | web/patterns/vintage6070/meta.json (16 stil) | 6 silüet ailesi (shift/babydoll/empire/aLine-fitFlare/tunic-tent/other) |

## gusto-lint BEŞ BOYUT (ağırlık)
- silhouette_grammar 0.25 — terim-İD kombinasyonu korpusta var mı, emsal-frekanslı mı
- proportion_bands 0.25 — oranlar emsal bantlarında mı (tipik-içi 1.0, bant-içi tipik-dışı 0.6, bant-dışı 0.0)
- line_hierarchy 0.20 — 3 çizgi katmanı kapsamı + navy renk
- piece_page_bands 0.20 — parça/sayfa sayısı emsal bandında mı
- composition_bands 0.10 — drape/fold yoğunluğu (0 = steril ceza 0.2, sade meşru 0.7, tipik 1.0)

Genel eşik 0.70; boyut tabanı 0.50 (herhangi bir boyut taban-altı = FAIL). n/a boyutların ağırlığı ölçülenlere yeniden dağıtılır.

## KALİBRASYON KANITI (mevcut 32 flat, spec'siz — 3 boyut n/a, sadece çizgi+kompozisyon)
- N=32, PASS 24/32, ortalama overall **0.766**.
- EN DÜŞÜK 5 (hepsi düz/sade bluz-shell-tunic): sixties-pointed-collar-tunic, boat-neck-button-down-top, boat-neck-linen-shell, gingham-button-blouse, mandarin-collar-fitted-blouse — hepsi 0.511.
- Bu ayırt ETME doğru sinyal: düşük skorlular tam da (a) çizgi katmanı 2/3 (orta 1.4 katmanı YOK — F2'nin işi) + (b) az drape (F1'in getireceği fashionable siluetler değil, düz shift/bluz). Lint istatistiği, F2'nin çizgi kalemi ve F1'in silüet zenginliğinin nereye gireceğini SAYIYLA gösteriyor.
- Kör-nokta düzeltmesi (dondurmadan ÖNCE): ilk drape bandı min=2 idi, sade bluzları haksız cezalandırıyordu; min=1 + "0 dash = steril" ayrı ceza ile düzeltildi (sade meşru, steril değil).

## DONMUŞ DOSYA
`contract/gusto-corpus.json` `_frozen: 2026-07-19`. Anayasa kilidi: korpus F1-F3 boyunca SALT-OKUNUR, güncelleme ayrı DEVAM ister. gusto-lint bu dosyadan okur, kendi ölçüsünü değiştiremez.

## SINIR (dürüst)
- Spec'siz kalibrasyonda 3 boyut ölçülemiyor; tam 5-boyut puanlama F1'de üretilen silüetlerde (spec ile) çalışacak. Kalibrasyon sadece çizgi+kompozisyonun ayırt ettiğini kanıtlıyor, bu yeterli (F0 yeşil tanımı: "koşup puan raporu üretti").
- composition_bands `dashCount` bir proxy (gerçek drape fold sayımı değil); F2 ink rejimi motora girince gerçek fold sayısıyla değişebilir — o zaman korpus güncellemesi ayrı DEVAM'da.
