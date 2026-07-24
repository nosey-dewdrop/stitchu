# Bağımsız Hakem — id53 (Keira, boatneck sleeveless A-line back-tie mini dress)

Tarih: 2026-07-21. Çift kanat geçme kriteri.

## Üretim
`renderGarmentFlatAsync` → REF (viewBox 940 680, fallback DEĞİL). PASS ön-koşul.

## KANAT 1 — FLAT (kör test)
PNG: /tmp/j53.png. Emsal: design_patterns/crops/ar-202545-7.png (Silhouette Heart Dress).

Aynı giysi mi:
- Boat yuvarlak yaka: VAR (geniş, yumuşak kavisli yaka çizgisi, ön+arka).
- Kolsuz: VAR.
- A-line flare: VAR (bel altından açılan drape'li klos etek, iç kırışıklık çizgileri).
- Mini: VAR (kısa boy).
- Arka bel bağı (tieBack): VAR ve OKUNUR — arka görünümde belde küçük fiyonk/bağ düğümü + aşağı sarkan iki uç net görünüyor.

Emsal-seviye mi: figür var (ön+arka flat), etek drape'li ve doğal, robotik değil. Emsal fitted+seam-panel bir stil; id53 daha yumuşak babydoll-A siluet ama aynı sınıf zanaat seviyesi. Arka bağ emsaldeki ön fiyonktan farklı konumda (arkada) ama motorun spec'i doğru: tieBack arkada, ve çizim onu tanınır basıyor.

**FLAT: PASS** — gövde+etek emsal-seviye, arka bağ tanınıyor (mükemmel değil ama var ve okunur).

## KANAT 2 — KALIP (Δmm)
Body: bust90/waist72/hip98/shoulder38. mapVisionSpec fieldMisses: 0.
- Draft: hatasız (engine throw yok, refuse yok).
- Validator: 0 issue.
- Parça: 6 (Bodice Front, Bodice Back, Bias binding, Skirt Front, Skirt Back, Back Tie) — elbise bandı 5-11 içinde.
- worstΔ: **0.24mm** (shoulder F/B 0.24, side seam F/B 0.00) ≤ 3.0.
- tieBack ayrı kesim parçası ("Back Tie / sırt bağı") olarak çizildi.

**KALIP: PASS** — worstΔ 0.24mm, 0 issue, 6 parça.

## ÇİFT KANAT
FLAT PASS + KALIP PASS → **GEÇTİ.**

Kısıt: motor/contract/styles.json/_engine-full.mjs dokunulmadı; sadece /tmp üretim + ölçüm; worker/kredi yok.
