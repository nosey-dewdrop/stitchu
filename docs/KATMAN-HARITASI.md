# KATMAN HARİTASI — kim kimi okur, kim kimi OKUYAMAZ? (2026-08-10)

> Amaç: her arıza TEK katmana mühürlenebilsin. Teşhis harnesi `engine-check/harness/run-all.sh`;
> yasak-okuma zabıtası `scripts/katman-lint.py`. Kural: her katman sadece bir ALTININ
> KONTRAT ÇIKTISINI okur — içini asla.

## Katmanlar?

| Katman | Ne | Mevcut dosyalar | Kontrat çıktısı | OKUYAMAZ |
|---|---|---|---|---|
| **L0 VÜCUT** | Tek vücut gerçeği | `contract/figure-bands.json` (figur_croquis), `engine/src/bodysurface.{cpp,hpp}`, `engine/pattern-bridge/bodies/mean_all.yaml` | `contract/layers/body.EU38.json` (26 ölçü + girth mm + croquis px↔mm kalibrasyonu) | üst katmanların hiçbirini |
| **L1 TASARIM** | Stil uzayı (vücutsuz) | atolye state (46 kadran), `engine/flat-engine/styles.json`, `contract/figure-bands.json garment_ease` (bel/gogus çarpanları) | design-state JSON — **içinde mm YASAK**, sadece oran/enum/çarpan | L0'ın mm'lerini |
| **L2 GİYSİ YÜZEYİ** | vücut+tasarım → 3B shell | `engine/src/garmentshell.{cpp,hpp}`, `drape.{cpp,hpp}`, `volume.hpp` | shell ölçüm raporu: `rings.waist_mm` TEK SAYI, bust/hip, ease hacmi | L3/L4'ü |
| **L3a FLAT** | Yüzeyin çizimi | `engine/flat-engine/_engine-full.mjs` (kalem), `engine/tools/render-garment-flat.mjs` | SVG (ölçüsüz, stilize) | kalıp dünyasından HİÇBİR ŞEYİ (`body.yaml`, specification, mapping) |
| **L3b KALIP** | Yüzeyin düzleştirilmesi | `engine/src/bodice.cpp` vb., `engine/pattern-bridge/mapping.py`, GarmentCode (kara kutu) | `stitchu_specification.json` + panel kenar uzunlukları mm | `figur_croquis`'i doğrudan; kalemi |
| **L4 DOĞRULAMA** | Hakem | `engine/pattern-bridge/walk.py`, `printpack.py`, `test_seamdeed.py` | tapu + print-report | üretici katmanların İÇİNİ |

## Bugünkü bilinen ihlaller / boşluklar (lint --report envanteri günceller)?

1. **L0 ÇİFT KAYNAK:** flat vücudu `figur_croquis`'ten (px), kalıp vücudu `mean_all.yaml`'dan (cm)
   okuyor; ikisinin tutarlılığını ölçen tek test H0'dır (harness). Ömürlük çözüm: tek
   `contract/layers/body.EU*.json` → ikisi de oradan.
2. **L3b İKİ BEL PARAMETRESİ:** `mapping.py` bodice ve etek beline ayrı değer basıyor; toplam bel
   kontrolü yok → 2.95mm / 17 kombinasyon arızası (kanıt `Logs/paket-2026-08-06`). Harness H3b-rings
   bu sınırın bekçisi. Kök çözüm Faz C (bel = 3B'de tek spline).
3. **L3a↔L3b köprüsü sadece pinli makas:** `preview-truth` stilizasyon makasını ölçüp pinliyor;
   makası kapatan şey değil. Kök çözüm Faz C (ikisi tek yüzeyden türetilir).

## Teşhis ilkesi?

Her harness testi SADECE kontrat dosyası okur. H3b FAIL + H0 PASS ⇒ arıza kesin L3b'de.
H0 FAIL ⇒ vücut kaynakları zaten ayrık, önce onu kapat — aşağı katmana bakma.
