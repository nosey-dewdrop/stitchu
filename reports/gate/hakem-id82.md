# HAKEM id82 — crew-neck sleeveless boxy crop tank (Elle Top)

Bağımsız çift-kanat geçme testi. Tarih: 2026-07-21. Motor/contract/styles.json DOKUNULMADI.

## KANAT 1 — FLAT (kör test)
- Üretim: `render-garment-flat` → **REFERANS** (940 680 viewBox, fallback DEĞİL). Protokol geçti.
- PNG gözle bakıldı (/tmp/shot82.png), emsal `ar-202511-2.png` (denim boxy crop tank) ile kıyaslandı.
- (a) Aynı giysi mi: **EVET**. Crew yuvarlak yaka ✓, kolsuz (temiz kol oyuğu) ✓, cropped/kısa gövde ✓, boxy (düz-dik yanlar, bel çekmesi yok, kutu siluet) ✓. Front+back doğru ayrımlı (arka yaka daha sığ).
- (b) Emsal-seviye mi: **EVET**. Temiz el-çizimi hat, robotik değil.
- Zayıflık (bloklamıyor): flat'in yaka açıklığı gerçek bir crew'a göre bir tık derin/scoop okuyor; aile doğru (yuvarlak, yakasız).
- **FLAT: PASS**

## KANAT 2 — KALIP (Δmm)
Bridge: mapVisionSpec → engine.draftJSON (full-scan-27 ile aynı köprü), body EU38.
- Draft: hatasız (throw yok, refuse yok).
- Validator issue: **0**.
- worstΔmm: **0.12mm** (shoulder F/B Δ0.12, side seam F/B Δ0.00) — tolerans 3.0mm, çok altında.
- Parça sayısı: **3** (Top Front | Top Back | Bias binding) — top bandı 3-8 içinde.
- fieldMisses: yok; `topLength: cropped` düzgün geçti.
- **KALIP: PASS**

## ÇİFT KANAT
FLAT PASS + KALIP PASS → **id82 GEÇTİ.**
