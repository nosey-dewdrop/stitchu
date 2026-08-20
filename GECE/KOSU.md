# KOŞU — 2026-08-20

## ŞU AN
faz: F0 **KAPANDI** · durum: envanter çıkarıldı, hiçbir şey onarılmadı · son yeşil commit: **YOK**
(devralınan ctest 89/95 — koşu kırmızı bir tabandan başlıyor)
**F1 AÇILMADI — Damla açacak.**

## KAPANMIŞ FAZLAR
F0 ✓ Damar %0, flat kalıptan türemiyor ve kontrat bunu zaten beyan etmiş -> GECE/F0.md

## AÇIK KIRMIZILAR (ne · nerede · ölçülen sayı)
- ctest devralınan kırmızı · `engine/build` · **6/95 FAIL** (89 yeşil)
  - `style_check` · `engine/STYLE-PIN` dosyası yok · pinlenmiş stil **0**
  - `bugra_bridge_check` · `patterns_real/geometry/ring-trace-locket-front-38.json` yok
  - `contract_check` · `patterns_real/` git'te **41 takipli dosya** (K1, Damla'nın kararında)
  - `preview_truth_check` · `princess_dress` → `bustHalf`/`neckHalf`/`neckDepth` **ÖLÇÜLMEDİ**
  - `figure_check` · 3+ stil `waist/bust 0.637` tabansız · `figure-bands` `mandal.taban_v3` pin yok
  - `h10_gate_check` · EU34 armhole **312.86 mm** (kapı 384.50–424.50) · shoulder-seam **0 dikiş** (kapı ≥2)
- Sicilde adı bile olmayan damar detayları · `contract/garment-spec-v2.json` · **6 primitiften 5'i sicilde YOK**
  (fiyonk, mini-düğme, fırfır, peplum, lace-up) → red cümlesi ismi söyleyemiyor (§0-3 ihlali)
- Sevk edilmeyen kütüphane · `engine/src/` · **14 .cpp** derleniyor, linker atıyor
  (`nm` çıktısında sıfır sembol)
- Flat ↔ kalıp ortak birim yok · `contract/tables.json` `flat._layer` bunu **beyan ediyor**
- İkinci flat kalemi ayakta · `render-garment-flat.mjs` kendi 2 şablonu + `_engine-full.mjs`
- Sevk binary'si eski · `engine/build/surface-pattern` **17 Ağu**, bugün 20 Ağu

## BİR SONRAKİ FAZIN DEVRALDIĞI ÜÇ SAYI
1. **DAMAR = %0** (kalıp yolu %0 · flat yolu %29 = 9/31 stil, ama flat satılabilir nesne değil)
2. **hem/bel oranı: kalıp 1.7871 · flat 1.2141** — karşılaştırılabilir tek birimsiz sayı
3. **ctest 89/95** — 6 devralınan kırmızı

## DAMLA'YA DÜŞEN (bloke etmez)
- **K1 hâlâ açık:** `contract_check` kırmızısı `patterns_real/`'daki 41 satın alınmış dosyanın
  git'te takipli olmasından. Silme/taşıma yasak, karar senin.
- **Sicil ile HEDEF çelişiyor olabilir:** sicil `shoulderSeam: flagged` ("kod var, kapalı"),
  `HEDEF.md` "SIRADAKİ: G5 (omuz/kol oyuğu/yaka)" ve G5 planı için "kod yazılmadı" diyor.
  Hangisi doğru? F5 (kol) bu cevaba bağlı.
- **`zipperPiece` absent kalsın mı?** Damara uygun (ANAYASA "görünür fermuar" damar dışı),
  ama F4'ün "geçiş" kapısı kapanma zorunlu kılıyor. Fermuarsız kapanma dili (düğme/bağcık/
  fiyonk) hangisi olacak?
