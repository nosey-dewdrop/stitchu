# Bağımsız Hakem — id65 (boxy drop-shoulder crew short-sleeve tunic tee "Rina")

Çift kanat geçme testi. Motor/contract/styles.json DOKUNULMADI. worker/kredi yok.

## ÜRET
`render-garment-flat` id65 → REF (940 680 viewbox), FALLBACK değil. YEŞİL.

## KANAT 1 — FLAT (kör test)
Rasterize: /tmp/j65.svg → /tmp/j65.png (Chrome headless, img width 600).

Gözle:
- (a) aynı giysi mi: EVET. Crew yuvarlak yaka (temiz U/scoop çizgi), KISA DÜZ set-in kol (balon/puff DEĞİL, düz koltuk-kanadı), boxy/kutu gövde (dar bel oyuğu yok, düz yanlar), hip uzunluk (kalça hizası düz etek + hem dikişi). Front + Back iki görünüm tutarlı.
- (b) emsal-seviye mi: EVET. Kol düz ve temiz set-in, koltukaltı geçişi düzgün, robotik değil — elle çizilmiş flat karakterinde.

NOT: emsal crop design_patterns/crops/ar-202606-1.png bir "Quilted Tote Bag" Etsy listeleme görseli — tunik tişört DEĞİL, bayat/yanlış referans. Aynı-giysi kör kıyası o crop'a yapılamadı; flat kendi başına + id65 spec'ine karşı yargılandı.

**FLAT: PASS** — düz kol (balon değil), boxy kutu gövde, crew yaka, hip uzunluk, temiz set-in.

## KANAT 2 — KALIP (Δmm)
Draft: benchmark-58 mapVisionSpec bridge → engine.draftJSON, body 90/72/98.
- mapped: garment=top, neckline=crew, sleeveStyle=straight, sleeveLength=elbow. fieldMisses: yok.
- Draft: hatasız (engine throw yok, refuse yok).
- Validator: **0 issue**.
- Parça: **4** — Top Front, Top Back, Bias binding (neckline), **Sleeve** (kol parçası VAR). 3-8 bandında.
- worstΔ: **0.72mm** (side seam F/B). shoulder F/B Δ0.00. sleeve cap ease +4.1% (sağlıklı).

**KALIP: PASS** — worstΔ 0.72mm ≤ 3.0, 0 issue, 4 parça (kol dahil).

## ÇİFT KANAT
FLAT PASS + KALIP PASS → **GEÇTİ**.
