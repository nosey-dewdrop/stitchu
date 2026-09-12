# K5 eval base — hand-label package (Damla)

The vision cascade's go-live gate is RED until 150 photos are hand-labelled here.
Your labels are the ground truth the router's thresholds get audited against —
the teacher's cached answers are deliberately hidden in the tool (no anchoring).

## How to run (2 commands)

```
node dataset/eval/select-candidates.mjs   # only if candidates.json is missing
node dataset/eval/label-tool.mjs          # then open http://localhost:8791
```

Progress saves after EVERY photo (`hand-labels.json`) — close and resume any time.

## What you label (4 fields, contract enum ids)

- **garment** — skirt / dress / top / trousers / other
- **neckline** — crew / scoop / vNeck / square / boat / sweetheart / halter / cowl / pussyBow
- **sleeveLength** — short / elbow / long
- **skirtStyle** — aLine / straight / gathered / halfCircle / pleated

Rules:
- `0` = yok / görünmüyor / emin değilim → **null**. Tahmin ETME (ambar yasası:
  dürüst null > uydurulmuş kesinlik). Kolsuz ise sleeveLength null.
- garment `other`/`trousers` seçince kalan alanlar otomatik kapanır.
- Klavye: alan sırayla dolar — rakamlar seçenek, `0` null, `enter` kaydet+sonraki,
  `←`/`→` gezinme.

## Time budget

150 photos × ~10-12 s ≈ **25-30 minutes** in one sitting; resumable in chunks.

## What happens when you finish

`hand-labels.json` reaches 150 entries → the router's eval gate
(`engine/tools/cascade-router.mjs`) turns green mechanically; the next session
re-audits τ thresholds against YOUR labels before any live routing.
